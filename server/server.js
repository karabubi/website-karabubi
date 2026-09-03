
// Users/salehalkarabubi/works/project/website-karabubi/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const privateRoutes = require('./routes/privateRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien bereitstellen
app.use('/static', express.static(path.join(__dirname, 'public')));

// Datenbankverbindung mit Retry-Logik
const connectDatabase = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await db.authenticate();
      console.log('✅ Datenbank verbunden...');
      await db.sync({ force: false });
      console.log('✅ Datenbank synchronisiert...');
      return;
    } catch (error) {
      console.error(`❌ Datenbankverbindung fehlgeschlagen (Versuch ${i + 1}):`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, interval));
    }
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'website-karabubi-api'
  });
});

// Routen
app.use('/api/auth', authRoutes);
app.use('/api/private', privateRoutes);

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error('❌ Serverfehler:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Interner Serverfehler' : err.message,
  });
});

// Server starten
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`🌍 Umgebung: ${process.env.NODE_ENV || "development"}`);
});

connectDatabase().catch((error) => {
  console.error("❌ Datenbankverbindung fehlgeschlagen:", error.message);
});
