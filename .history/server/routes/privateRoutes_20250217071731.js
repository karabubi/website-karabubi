const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Welcome to the private dashboard' });
});

module.exports = router;