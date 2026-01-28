const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.post('/', async (req, res) => {
  const { from_bin_id, to_bin_id, item_id, qty } = req.body;

  try {
    await db.execute(
      `INSERT INTO stock_transfers 
       (from_bin_id, to_bin_id, item_id, qty, status, transfer_date)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [from_bin_id, to_bin_id, item_id, qty]
    );

    res.status(201).json({ message: 'Transfer recorded' });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT transfer_no, from_bin_id, to_bin_id, item_id, qty, status, transfer_date
       FROM stock_transfers
       ORDER BY transfer_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch transfers error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
