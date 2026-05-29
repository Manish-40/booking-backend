const express = require("express");
const pool = require("./config/db")
const userRouter = require("./routes/userRoutes");
const movieRouter = require("./routes/movieRoutes");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "PostgreSQL connected",
      time: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Database error");
  }
});

app.get("/create-users-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    res.send("Users table created");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating users table");
  }
});
app.get("/create-movies-table", async (req, res) => {
  try {
    await pool.query(`CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    image TEXT,
    price INT)`)
    res.send("movies table created");
  }
  catch (error) {
    console.log(error);
    res.status(500).send("error creating movies table");
  }
});
app.get("/addmovies", async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO movies(title,image,price) VALUES
    ('Dhurandhar','Dhurandhar.jpg',250),
    ('Don','Don.jpg',300),
    ('Dhoom','Dhoom.jpg',350),
    ('Avengers','Avengers.jpg',400)`,
    )
    res.send("movies added successfully");
  }
  catch (error) {
    console.log(error);
    res.status(500).send("error in adding movies");

  }
});
app.use("/", userRouter);
app.use("/movies", movieRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});