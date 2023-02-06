const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const requestObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    directorName: dbObject.director_name,
    leadActor: dbObject.lead_actor,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT 
        movie_name
     FROM
        movie;`;
  const movie = await database.all(getMovieQuery);
  response.send(
    movie.map((eachMovie) => requestObjectToResponseObject(eachMovie))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoviesQuery = `INSERT INTO 
        movie (director_id, movie_name, lead_actor)
     VALUES 
        ('${directorId}', '${movieName}', '${leadActor}'); 
        `;
  await database.run(postMoviesQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsWIthId = `SELECT *
   FROM
        movie
    WHERE 
        movie_id = ${movieId};`;
  const movie = await database.get(getMovieDetailsWIthId);
  response.send(requestObjectToResponseObject(movie));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const putMovieQuery = `UPDATE 
        movie
    SET
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;
  await database.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT director_id,
  director_name FROM
    director;`;
  const director = await database.all(getDirectorQuery);
  response.send(
    director.map((eachMovie) => requestObjectToResponseObject(eachMovie))
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllmovies = `SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};`;
  const movie = await database.all(getAllmovies);
  response.send(movie.map((each) => requestObjectToResponseObject(each)));
});

module.exports = app;
