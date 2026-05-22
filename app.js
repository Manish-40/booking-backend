const express=require("express");
const pool=require("./config/db")
const app=express();
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});