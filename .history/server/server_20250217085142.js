const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const privateRoutes = require('./routes/privateRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/private', authMiddleware, privateRoutes);

// Database connection
db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});