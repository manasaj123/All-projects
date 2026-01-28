const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, grn_no, warehouse_id, received_date, total_items, status
       FROM grn
       WHERE status = 'pending'
       ORDER BY received_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GRN pending error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  const { grn_no, warehouse_id, received_date, total_items } = req.body;

  try {
    await db.execute(
      `INSERT INTO grn (grn_no, warehouse_id, received_date, total_items, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [grn_no, warehouse_id, received_date, total_items]
    );

    res.status(201).json({ message: 'GRN created' });
  } catch (err) {
    console.error('GRN create error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/putaway', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      `UPDATE grn
       SET status = 'complete',
           putaway_date = NOW()
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'GRN not found' });
    }

    res.json({ message: 'GRN put-away completed' });
  } catch (err) {
    console.error('GRN putaway error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
