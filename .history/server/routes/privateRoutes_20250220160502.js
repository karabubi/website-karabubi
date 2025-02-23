const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome to the private dashboard, ${req.user.username}!` });
});

module.exports = router;
