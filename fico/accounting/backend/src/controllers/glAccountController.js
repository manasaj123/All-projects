// backend/src/controllers/glAccountController.js
const db = require('../config/db'); // IMPORTANT: use config/db, not ../models
const { GLAccount } = db;

exports.list = async (req, res) => {
  try {
    const accounts = await GLAccount.findAll({
      order: [['glCode', 'ASC']],
    });
    res.json(accounts);
  } catch (err) {
    console.error('GLAccount list error', err);
    res.status(500).json({ message: 'Failed to load GL accounts' });
  }
};

exports.create = async (req, res) => {
  try {
    const account = await GLAccount.create(req.body);
    res.status(201).json(account);
  } catch (err) {
    console.error('GLAccount create error', err);
    res.status(500).json({ message: 'Failed to create GL account' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await GLAccount.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: 'GL account not found' });
    }
    await account.update(req.body);
    res.json(account);
  } catch (err) {
    console.error('GLAccount update error', err);
    res.status(500).json({ message: 'Failed to update GL account' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await GLAccount.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: 'GL account not found' });
    }
    await account.destroy();
    res.json({ message: 'GL account deleted' });
  } catch (err) {
    console.error('GLAccount delete error', err);
    res.status(500).json({ message: 'Failed to delete GL account' });
  }
};