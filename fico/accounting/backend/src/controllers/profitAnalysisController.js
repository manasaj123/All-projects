const db = require('../config/db');
const { Ledger, CostCenter, ProfitCenter } = db;
const { Op } = db.Sequelize;

// GET /api/profit-analysis?from=2026-01-01&to=2026-12-31
exports.getProfitAnalysis = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {};

    if (from && to) {
      where.date = { [Op.between]: [new Date(from), new Date(to)] };
    }

    const rows = await Ledger.findAll({
      attributes: [
        'costCenterId',
        'profitCenterId',
        [db.Sequelize.fn('SUM', db.Sequelize.col('debit')), 'debit'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('credit')), 'credit']
      ],
      include: [
        { model: CostCenter, attributes: ['name'] },
        { model: ProfitCenter, attributes: ['name'] }
      ],
      where,
      group: [
        'costCenterId',
        'profitCenterId',
        'CostCenter.id',
        'ProfitCenter.id'
      ]
    });

    const result = rows.map((r) => {
      const debit = Number(r.get('debit') || 0);
      const credit = Number(r.get('credit') || 0);
      return {
        costCenterId: r.costCenterId,
        costCenterName: r.CostCenter?.name || '',
        profitCenterId: r.profitCenterId,
        profitCenterName: r.ProfitCenter?.name || '',
        debit,
        credit,
        profit: credit - debit
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};