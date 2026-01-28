const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT cc.id, cc.scheduled_date, cc.status,
              w.name AS warehouse_name,
              b.bin_code,
              i.sku, i.name AS item_name
       FROM cycle_counts cc
       JOIN warehouses w ON w.id = cc.warehouse_id
       JOIN bins b ON b.id = cc.bin_id
       JOIN items i ON i.id = cc.item_id
       WHERE cc.status = 'pending'
       ORDER BY cc.scheduled_date ASC, cc.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Cycle counts pending error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  const { warehouse_id, bin_id, item_id, scheduled_date } = req.body;

  try {
    await db.execute(
      `INSERT INTO cycle_counts (warehouse_id, bin_id, item_id, scheduled_date, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [warehouse_id, bin_id, item_id, scheduled_date]
    );

    res.status(201).json({ message: 'Cycle count created' });
  } catch (err) {
    console.error('Cycle count create error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { counted_qty } = req.body;

  try {
   
    const [[cc]] = await db.execute(
      `SELECT warehouse_id, bin_id, item_id
       FROM cycle_counts
       WHERE id = ?`,
      [id]
    );
    if (!cc) {
      return res.status(404).json({ error: 'Cycle count not found' });
    }

    const [[invRow]] = await db.execute(
  `SELECT COALESCE(SUM(qty), 0) AS system_qty
     FROM inventory
    WHERE bin_id = ?
      AND item_id = ?`,
  [cc.bin_id, cc.item_id]
);

    const system_qty = invRow.system_qty || 0;
    const variance = counted_qty - system_qty;

   
    await db.execute(
      `INSERT INTO cycle_count_results (cycle_count_id, counted_qty, system_qty, variance)
       VALUES (?, ?, ?, ?)`,
      [id, counted_qty, system_qty, variance]
    );

    
    await db.execute(
      `UPDATE cycle_counts
       SET status = 'completed'
       WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Cycle count completed', variance });
  } catch (err) {
    console.error('Cycle count complete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
