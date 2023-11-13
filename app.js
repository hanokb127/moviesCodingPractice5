const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
         console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertMovieNameToPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};


//API1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map(moviename)=> convertMovieNameToPascalCase(moviename))
);
});
//API2
app.post("/movies/", async (request,response)=>{
    const{directorId, movieName, leadActor}= request.body;
    const postMovieQuery = `
    INSERT INTO 
      movie (director_id, movie_name, lead_actor)
      VALUES
      (${directorId}, '${movieName}', '${leadActor}');`;

      const dbResponse = await db.run(postMovieQuery);
      response.send("Movie Successfully Added");
});
const convertDbObjectToResponseObject = (dbObject) =>{
    return{
        movieId:dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.Movie_name,
        leadActor: dbObject.lead_actor,
    };
};
//API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `
    SELECT * FROM movie WHERE movie_id= ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//API4
app.put("movies/:movieId/", async (request, response)=>{
    const movieDetails= request.body;
    const {directorId, movieName, leadActor}= movieDetails;
    const {movieId} = request.params;
    const updateMovieQuery=`
    UPDATE movie SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;

     await db.run(updateMovieQuery);
     response.send("Movie Details Updated");
});

//API5
app.delete("/movies/:movieId/", async(request, response)=>{
    const{movieId}= request.params;
    const deleteMovieQuery= `
    DELETE FROM 
    movie
    WHERE
    movie_id = ${movieId};`;
      await db.run(deleteMovieQuery);
      response.send("Movie Removed");
});
const convertDirectorDetailsPascalCase= (dbObject) =>{
    return{
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
    };
};

//API6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director ;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray.map((eachDirector) =>
  convertDirectorDetailsPascalCase(eachDirector)));
});

const convertMovieNamePascalCase = (dbObject) =>{
    return{
        movieName: dbObject.movie_name,
    };
};
//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
    const {directorId} = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name FROM director INNER JOIN movie ON director.director_id = movie.director_id
    WHERE 
    director.director_id=${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(directorsArray.map((eachMovie)=> convertMovieNamePascalCase(eachMovie)));
});
module.exports=app;