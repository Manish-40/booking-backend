const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (name,email,password) VALUES($1,$2,$3)", [name, email, hashedPassword]);
        res.json({
            message: "user registered successfully"
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
module.exports=router;