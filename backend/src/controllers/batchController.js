const Batch = require('../models/Batch');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const rows = await Batch.findByDate(date);
    res.json(rows);
  } catch (err) {
    console.error('GET /batch', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createMany = async (req, res) => {
  try {
    const { date, rows } = req.body;
    await Batch.createMany(date, rows || []);
    res.json({ message: 'Batches created', count: (rows || []).length });
  } catch (err) {
    console.error('POST /batch', err);
    res.status(500).json({ error: 'Server error' });
  }
};
