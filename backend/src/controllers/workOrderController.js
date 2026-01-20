const WorkOrder = require('../models/WorkOrder');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const rows = await WorkOrder.findByDate(date);
    res.json(rows);
  } catch (err) {
    console.error('GET /work-orders', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const wo = await WorkOrder.create(req.body);
    res.json({ message: 'Work order created', id: wo.id });
  } catch (err) {
    console.error('POST /work-orders', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateActuals = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_qty, wastage_qty, status } = req.body;
    await WorkOrder.updateActual(id, actual_qty, wastage_qty, status);
    res.json({ message: 'Work order updated' });
  } catch (err) {
    console.error('PUT /work-orders/:id/actuals', err);
    res.status(500).json({ error: 'Server error' });
  }
};
