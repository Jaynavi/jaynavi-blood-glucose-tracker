
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const readingRoutes = require('./routes/readings');
app.use('/api/readings', readingRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Sweety Blood Glucose Tracker API is running!');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sweety backend is working!'
  });
});
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'PostgreSQL connected successfully!',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
