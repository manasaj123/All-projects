const db = require('../config/db');
const { GLAccount } = db;

exports.list = async (req, res) => {
  try {
    const rows = await GLAccount.findAll({
      order: [['glCode', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('GL list error', err);
    res.status(500).json({ message: 'Failed to load GL accounts' });
  }
};

exports.create = async (req, res) => {
  try {
    const row = await GLAccount.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    console.error('GL create error', err);
    res.status(500).json({ message: 'Failed to create GL account' });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await GLAccount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'G/L account not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) {
    console.error('GL update error', err);
    res.status(500).json({ message: 'Failed to update GL account' });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await GLAccount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'G/L account not found' });
    await row.destroy();
    res.json({ message: 'G/L account deleted' });
  } catch (err) {
    console.error('GL delete error', err);
    res.status(500).json({ message: 'Failed to delete GL account' });
  }
};