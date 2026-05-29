const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query("INSERT INTO users (name,email,password) VALUES($1,$2,$3) RETURNING *", [name, email, hashedPassword]);
    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      "secretkey",
      {
        expiresIn: "7d"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,  //cookie expires in 7days
    });

    res.json({
      message: "user registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).send("error in registering user");
  }
});

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {

      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {

      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // CREATE JWT TOKEN

    const token = jwt.sign(
      {
        id: user.id,
      },
      "secretkey",
      {
        expiresIn: "7d",
      }
    );

    // SET COOKIE

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,    //cookie expires in 7days
    });

    // SEND RESPONSE

    res.json({
      message: "User login successfully",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).send("Login error");
  }
});

router.get("/me", async (req, res) => {

  try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "No token",
      });
    }

    const decoded = jwt.verify(
      token,
      "secretkey"
    );

    const result = await pool.query(
      "SELECT id,name,email FROM users WHERE id=$1",
      [decoded.id]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).send("Auth error");
  }
});
module.exports = router;