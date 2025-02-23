// const express = require('express');
// const cors = require('cors');
// const db = require('./db');
// const authRoutes = require('./routes/authRoutes');
// const privateRoutes = require('./routes/privateRoutes');
// const authMiddleware = require('./middleware/authMiddleware');

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/private', authMiddleware, privateRoutes);

// // Database connection
// db.authenticate()
//   .then(() => console.log('Database connected...'))
//   .catch(err => console.log('Error: ' + err));

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




// const express = require("express");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const db = require("./db");
// const User = require("./models/User");
// const authRoutes = require("./routes/authRoutes");
// const privateRoutes = require("./routes/privateRoutes");
// const authMiddleware = require("./middleware/authMiddleware");

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Email transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "your-email@gmail.com", // Replace with your email
//     pass: "your-email-password", // Replace with your email password
//   },
// });

// // Register endpoint
// app.post("/api/auth/register", async (req, res) => {
//   const { username, password, email } = req.body;

//   try {
//     // Save user to database
//     const user = await User.create({ username, password, email });

//     // Send email with username and password
//     const mailOptions = {
//       from: "your-email@gmail.com",
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
// app.post("/api/auth/login", async (req, res) => {
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

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/private", authMiddleware, privateRoutes);

// // Database connection
// db.authenticate()
//   .then(() => console.log("Database connected..."))
//   .catch((err) => console.log("Error: " + err));

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

//------1------------


// const express = require("express");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const db = require("./db");
// const User = require("./models/User");
// const authRoutes = require("./routes/authRoutes");
// const privateRoutes = require("./routes/privateRoutes");
// const authMiddleware = require("./middleware/authMiddleware");

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Email transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // Use environment variables
//     pass: process.env.EMAIL_PASSWORD, // Use environment variables
//   },
// });

// // Register endpoint
// app.post("/api/auth/register", async (req, res) => {
//   const { username, password, email } = req.body;

//   try {
//     // Save user to database
//     const user = await User.create({ username, password, email });

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
// app.post("/api/auth/login", async (req, res) => {
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

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/private", authMiddleware, privateRoutes);

// // Database connection
// db.authenticate()
//   .then(() => console.log("Database connected..."))
//   .catch((err) => console.log("Error: " + err));

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });






const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const db = require("./db");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use environment variables
    pass: process.env.EMAIL_PASSWORD, // Use environment variables
  },
});

app.get("/test-email", async (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "recipient@example.com", // Replace with a valid email address
    subject: "Test Email",
    text: "This is a test email from Nodemailer.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ success: true, message: "Email sent successfully" });
    }
  });
});
// Database connection and synchronization
db.authenticate()
  .then(() => {
    console.log("Database connected...");
    return db.sync({ force: false }); // Synchronize models with the database
  })
  .then(() => {
    console.log("Database synchronized...");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

// Register endpoint
// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  const { name, username, password, email } = req.body;

  try {
    // Save user to database
    const user = await User.create({ name, username, password, email });


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
app.post("/api/auth/login", async (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});