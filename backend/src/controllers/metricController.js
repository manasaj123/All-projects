const metricsService = require('../services/metricsService');

exports.daily = async (req, res) => {
  try {
    const { date } = req.query;
    const row = await metricsService.daily(date);
    res.json(row);
  } catch (err) {
    console.error('GET /metrics/daily', err);
    res.status(500).json({ error: 'Server error' });
  }
};
