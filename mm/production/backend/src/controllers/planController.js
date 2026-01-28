const ProductionPlan = require('../models/ProductionPlan');
const planningService = require('../services/planningService');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const rows = await ProductionPlan.findByDate(date);
    res.json(rows);
  } catch (err) {
    console.error('GET /plan', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.save = async (req, res) => {
  try {
    const { date, rows } = req.body;
    await ProductionPlan.upsertMany(date, rows || []);
    res.json({ message: 'Plan saved', count: (rows || []).length });
  } catch (err) {
    console.error('POST /plan', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.generateFromForecast = async (req, res) => {
  try {
    const { period, date } = req.body;
    const result = await planningService.generatePlanFromForecast(period, date);
    res.json(result);
  } catch (err) {
    console.error('POST /plan/generate', err);
    res.status(500).json({ error: 'Server error' });
  }
};
