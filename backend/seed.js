
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seedDatabase() {
  try {
    const demoEmail = 'demo@sweety.com';
    const demoPassword = 'SweetyDemo123';

    // Check whether demo user already exists
    let result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [demoEmail]
    );

    let userId;

    if (result.rows.length > 0) {
      userId = result.rows[0].id;
      console.log('Demo user already exists.');
    } else {
      const hashedPassword = await bcrypt.hash(demoPassword, 10);

      result = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['Sweety Demo', demoEmail, hashedPassword]
      );

      userId = result.rows[0].id;
      console.log('Demo user created successfully.');
    }

    // Sample readings for the last 3 days
    const sampleReadings = [
      { daysAgo: 2, slot: 'Morning / fasting', value: 105 },
      { daysAgo: 2, slot: 'After breakfast', value: 145 },
      { daysAgo: 2, slot: 'After lunch', value: 132 },
      { daysAgo: 2, slot: 'After dinner', value: 128 },

      { daysAgo: 1, slot: 'Morning / fasting', value: 98 },
      { daysAgo: 1, slot: 'After breakfast', value: 140 },
      { daysAgo: 1, slot: 'After lunch', value: 135 },
      { daysAgo: 1, slot: 'After dinner', value: 125 },

      { daysAgo: 0, slot: 'Morning / fasting', value: 102 },
      { daysAgo: 0, slot: 'After breakfast', value: 138 },
      { daysAgo: 0, slot: 'After lunch', value: 130 },
      { daysAgo: 0, slot: 'After dinner', value: 120 }
    ];

    for (const reading of sampleReadings) {
      await pool.query(
        `INSERT INTO glucose_readings
         (user_id, reading_date, time_slot, glucose_value)
         SELECT $1, CURRENT_DATE - $2::integer, $3::text, $4::integer
         WHERE NOT EXISTS (
           SELECT 1 FROM glucose_readings
           WHERE user_id = $1
           AND reading_date = CURRENT_DATE - $2::integer
           AND time_slot = $3::text
         )`,
        [userId, reading.daysAgo, reading.slot, reading.value]
      );
    }

    console.log('Sample readings added successfully.');
    console.log('Demo Email:', demoEmail);
    console.log('Demo Password:', demoPassword);

  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedDatabase();
