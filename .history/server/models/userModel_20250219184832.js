// const { DataTypes } = require('sequelize');
// const db = require('../db');

// const User = db.define('User', {
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// module.exports = User;



// const { DataTypes } = require("sequelize");
// const db = require("../db");

// const User = db.define("../models/User", {
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// module.exports = User;

//--------




// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Register endpoint
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Save user to database
    const user = await User.create({ username, password, email });

    // Send email with username and password
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Registration Details",
      text: `Username: ${username}\nPassword: ${password}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

module.exports = router;