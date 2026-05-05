const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

/**
 * GET /api/complaints
 * List all complaints (latest first)
 */
router.get('/', async (req, res) => {
  try {
    const [complaints] = await pool.execute(
      'SELECT * FROM complaints ORDER BY created_at DESC'
    );
    res.json(complaints);
  } catch (error) {
    console.error('Complaints GET error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/complaints
 * Create a new complaint
 */
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      order_id,
      subject,
      description,
      assigned_to,
    } = req.body;

    // Basic validation: require at least customer + description or subject
    if (!customer_name || !description) {
      return res
        .status(400)
        .json({ error: 'customer_name and description are required' });
    }

    // Insert complaint – note: NO complaint_id column in table
    const [result] = await pool.execute(
      `INSERT INTO complaints 
        (customer_name, customer_phone, order_id, subject, description, status, assigned_to)
       VALUES (?, ?, ?, ?, ?, 'new', ?)`,
      [
        customer_name || null,
        customer_phone || null,
        order_id || null,
        subject || null,
        description || null,
        assigned_to || null,
      ]
    );

    // Fetch the newly created record
    const [rows] = await pool.execute(
      'SELECT * FROM complaints WHERE id = ?',
      [result.insertId]
    );

    const complaint = rows[0];

    // Emit realtime event if socket.io is attached
    req.app.get('io')?.emit('complaintCreated', complaint);

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Complaints POST error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;