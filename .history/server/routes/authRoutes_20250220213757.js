const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register User
router.post("/register", async (req, res) => {
  const { name, username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username, email, password: hashedPassword });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { User } = require("../models/User"); // Ensure this path is correct
// console.log("User model:", User); // Debugging: Check if User is imported correctly

// const nodemailer = require("nodemailer");

// // Debugging: Log the User model to verify it's imported correctly
// console.log("User model:", User);

// // Email transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// // Register endpoint
// router.post("/register", async (req, res) => {
//   const { name, username, password, email } = req.body;

//   try {
//     // Check if the email already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ success: false, error: "Email already exists" });
//     }

//     // Create a new user
//     const user = await User.create({ name, username, password, email });

//     // Send email with username and password
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Your Registration Details",
//       text: `Username: ${username}\nPassword: ${password}`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error("Error sending email:", error);
//       } else {
//         console.log("Email sent:", info.response);
//       }
//     });

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ success: false, error: "Registration failed" });
//   }
// });

// // Login endpoint
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { username } });

//     if (!user || user.password !== password) {
//       return res.status(401).json({ success: false, message: "Invalid username or password" });
//     }

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ success: false, error: "Login failed" });
//   }
// });

// module.exports = router;