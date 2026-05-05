// src/controllers/reportController.js
const db = require('../config/db');
const { Ledger } = db;

// GET /api/reports/trial-balance
exports.getTrialBalance = async (req, res, next) => {
  try {
    const rows = await Ledger.findAll({
      attributes: [
        'accountCode',
        [db.Sequelize.fn('SUM', db.Sequelize.col('debit')), 'debit'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('credit')), 'credit']
      ],
      group: ['accountCode'],
      order: [['accountCode', 'ASC']]
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
};