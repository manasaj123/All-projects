// backend/src/controllers/trialBalanceController.js
const db = require('../config/db');
const { Ledger } = db;
const { Op, fn, col } = db.Sequelize; // keep this if db exports Sequelize

// GET /api/trial-balance/:period   (period = '2026-04')
exports.getTrialBalanceByPeriod = async (req, res, next) => {
  try {
    const { period } = req.params; // 'YYYY-MM'
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ message: 'Invalid period format. Use YYYY-MM.' });
    }

    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    const rows = await Ledger.findAll({
      attributes: [
        'accountCode',
        [fn('SUM', col('debit')), 'debit'],
        [fn('SUM', col('credit')), 'credit'],
      ],
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['accountCode'],
      order: [['accountCode', 'ASC']],
    });

    const result = rows.map(row => {
      const accountNumber = row.accountCode;
      const accountName = ''; // no column; you can fill later via master join
      const debit = Number(row.get('debit') || 0);
      const credit = Number(row.get('credit') || 0);
      const balance = debit - credit; // debit minus credit
      const balanceType = balance >= 0 ? 'debit' : 'credit';

      return {
        accountNumber,
        accountName,
        debit,
        credit,
        balance: Math.abs(balance),
        balanceType,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};