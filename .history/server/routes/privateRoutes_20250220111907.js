// const express = require('express');
// const router = express.Router();

// router.get('/dashboard', (req, res) => {
//   res.json({ message: 'Welcome to the private dashboard' });
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();

// // Protected route (requires authentication)
// router.get("/dashboard", (req, res) => {
//   res.json({ message: "Welcome to the private dashboard!" });
// });

// module.exports = router;


//-------1--------


// const express = require("express");
// const router = express.Router();

// // Protected route (requires authentication)
// router.get("/dashboard", (req, res) => {
//   res.json({ message: "Welcome to the private dashboard!" });
// });

// module.exports = router;

//------------1--------


const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Protected route (requires authentication)
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the private dashboard!" });
});

module.exports = router;