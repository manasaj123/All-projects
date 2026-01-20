const mrpService = require('../services/mrpService');

exports.run = async (req, res) => {
  try {
    const { date } = req.body;
    const result = await mrpService.run(date);
    res.json(result);
  } catch (err) {
    console.error('POST /mrp/run', err);
    res.status(500).json({ error: 'Server error' });
  }
};
