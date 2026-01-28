const Capacity = require('../models/Capacity');
const capacityService = require('../services/capacityService');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const rows = await Capacity.findByDate(date);
    res.json(rows);
  } catch (err) {
    console.error('GET /capacity', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.save = async (req, res) => {
  try {
    const { date, rows } = req.body;
    await Capacity.upsertMany(date, rows || []);
    res.json({ message: 'Capacity saved', count: (rows || []).length });
  } catch (err) {
    console.error('POST /capacity', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.suggest = async (req, res) => {
  try {
    const { date } = req.body;
    const result = await capacityService.suggestCapacity(date);
    res.json(result);
  } catch (err) {
    console.error('POST /capacity/suggest', err);
    res.status(500).json({ error: 'Server error' });
  }
};
