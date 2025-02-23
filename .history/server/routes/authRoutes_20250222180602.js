
// const express = require("express");
// const router = express.Router();
// const { User } = require("../models/User.js");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const sendConfirmationEmail = require("../utils/email.js");
// require("dotenv").config();
// console.log(User); // Should log the User model definition
// // Register User
// router.post("/register", async (req, res) => {
//   const { name, username, password, email } = req.body;

//   try {
//     // Check if the email or username already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) return res.status(400).json({ error: "Email already exists" });

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the user
//     const user = await User.create({ name, username, email, password: hashedPassword });

//     // Send confirmation email
//     sendConfirmationEmail(email, username, password);

//     res.status(201).json({ success: true, message: "User registered successfully" });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Login User
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Find the user by username
//     const user = await User.findOne({ where: { username } });
//     if (!user) return res.status(401).json({ error: "Invalid credentials" });

//     // Validate the password
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });

//     // Generate a JWT token
//     const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ success: true, token });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { User } = require("../models/User");

// Register User
router.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save user in PostgreSQL
    await User.create({
      firebase_uid: userRecord.uid,
      name,
      username,
      email,
    });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verify user credentials using Firebase
    const userRecord = await admin.auth().getUserByEmail(email);

    // Find user in PostgreSQL
    const user = await User.findOne({ where: { firebase_uid: userRecord.uid } });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

module.exports = router;