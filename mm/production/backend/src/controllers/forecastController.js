const Forecast = require('../models/Forecast');

exports.getByPeriod = async (req, res) => {
  try {
    const { period } = req.query;
    const rows = await Forecast.findByPeriod(period);
    res.json(rows);
  } catch (err) {
    console.error('GET /forecast', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.save = async (req, res) => {
  try {
    const { period, rows } = req.body;
    await Forecast.upsertMany(period, rows || []);
    res.json({ message: 'Forecast saved', count: (rows || []).length });
  } catch (err) {
    console.error('POST /forecast', err);
    res.status(500).json({ error: 'Server error' });
  }
};
