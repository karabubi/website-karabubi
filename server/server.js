// const express = require("express");
// const cors = require("cors");
// const db = require("./db");
// const authRoutes = require("./routes/authRoutes");
// const privateRoutes = require("./routes/privateRoutes");

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database connection
// db.authenticate()
//   .then(() => {
//     console.log("Database connected...");
//     return db.sync({ force: false });
//   })
//   .then(() => console.log("Database synchronized..."))
//   .catch((err) => console.error("Database connection error:", err));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/private", privateRoutes);

// // Start server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require("express");
// const cors = require("cors");
// const db = require("./db");
// const authRoutes = require("./routes/authRoutes"); // Correct import
// const privateRoutes = require("./routes/privateRoutes");

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database connection
// db.authenticate()
//   .then(() => {
//     console.log("Database connected...");
//     return db.sync({ force: false });
//   })
//   .then(() => console.log("Database synchronized..."))
//   .catch((err) => console.error("Database connection error:", err));

// // Routes
// app.use("/api/auth", authRoutes); // Correct usage
// app.use("/api/private", privateRoutes);

// // Start server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require("express");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const privateRoutes = require("./routes/privateRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
db.authenticate()
  .then(() => {
    console.log("Database connected...");
    return db.sync({ force: false }); // Sync models with the database
  })
  .then(() => console.log("Database synchronized..."))
  .catch((err) => console.error("Database connection error:", err));

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/private", privateRoutes); // Protected routes

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));