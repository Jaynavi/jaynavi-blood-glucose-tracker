
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const validSlots = [
  'Morning / fasting',
  'After breakfast',
  'After lunch',
  'After dinner'
];

// ADD READING
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reading_date, time_slot, value } = req.body;

    if (!reading_date || !time_slot || value === undefined) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (!validSlots.includes(time_slot)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    if (!Number.isInteger(Number(value)) || Number(value) < 40 || Number(value) > 600) {
      return res.status(400).json({ message: 'Value must be a whole number between 40 and 600' });
    }

    const date = new Date(`${reading_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(date.getTime()) || date > today) {
      return res.status(400).json({ message: 'Future dates are not allowed' });
    }

    const result = await pool.query(
      'INSERT INTO glucose_readings (user_id, reading_date, time_slot, glucose_value) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, reading_date, time_slot, Number(value)]
    );

    res.status(201).json({
      message: 'Reading added successfully',
      reading: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A reading for this time slot already exists on this date' });
    }
    if (error.code === '23514') {
      return res.status(400).json({ message: 'Maximum 4 readings allowed per day' });
    }
    res.status(500).json({ message: 'Could not add reading' });
  }
});

// GET ALL READINGS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, reading_date AS date, time_slot AS slot, glucose_value AS value FROM glucose_readings WHERE user_id = $1 ORDER BY reading_date DESC, time_slot',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch readings' });
  }
});

// UPDATE READING
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { reading_date, time_slot, value } = req.body;
    const { id } = req.params;

    if (!reading_date || !time_slot || value === undefined) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (!validSlots.includes(time_slot)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    if (!Number.isInteger(Number(value)) || Number(value) < 40 || Number(value) > 600) {
      return res.status(400).json({ message: 'Value must be between 40 and 600' });
    }

    const date = new Date(`${reading_date}T00:00:00`);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (Number.isNaN(date.getTime()) || date > today) {
  return res.status(400).json({
    message: 'Future dates are not allowed'
  });
}
    const result = await pool.query(
      `UPDATE glucose_readings
       SET reading_date = $1, time_slot = $2, glucose_value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [reading_date, time_slot, Number(value), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found' });
    }

    res.json({
      message: 'Reading updated successfully',
      reading: result.rows[0]
    });
  } catch (error) {
  console.error(error);

  if (error.code === '23505') {
    return res.status(409).json({
      message: 'A reading for this time slot already exists on this date'
    });
  }

  if (error.code === '23514') {
    return res.status(400).json({
      message: 'Maximum 4 readings allowed per day'
    });
  }

  res.status(500).json({
    message: 'Could not update reading'
  });
}
});

// DELETE READING
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM glucose_readings WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found' });
    }

    res.json({ message: 'Reading deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete reading' });
  }
});
module.exports = router;
