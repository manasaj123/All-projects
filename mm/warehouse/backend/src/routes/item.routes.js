const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, sku, name, unit, expiry_days FROM items'
    );
    res.json(rows);
  } catch (err) {
    console.error('Items get error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  const { sku, name, unit, expiry_days } = req.body;

  try {
    await db.execute(
      `INSERT INTO items (sku, name, unit, expiry_days)
       VALUES (?, ?, ?, ?)`,
      [sku, name, unit || null, Number(expiry_days) || 0]
    );
    res.status(201).json({ message: 'Item created' });
  } catch (err) {
    console.error('Items post error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
