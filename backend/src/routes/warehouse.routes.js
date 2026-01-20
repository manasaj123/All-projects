const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM warehouses');
  res.json(rows);
});


router.get('/:id/bins', async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute(
    'SELECT * FROM bins WHERE warehouse_id = ?',
    [id]
  );
  res.json(rows);
});


router.post('/:warehouseId/bins', async (req, res) => {
  const { warehouseId } = req.params;
  const { bin_code, capacity, zone } = req.body;

  try {
    await db.execute(
      `INSERT INTO bins (warehouse_id, bin_code, capacity, current_usage, zone)
       VALUES (?, ?, ?, 0, ?)`,
      [warehouseId, bin_code, capacity, zone]
    );

    res.status(201).json({ message: 'Bin created' });
  } catch (err) {
    console.error('Create bin error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
