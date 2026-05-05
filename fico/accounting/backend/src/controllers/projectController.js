// src/controllers/projectController.js
const db = require('../config/db');
const { Project, Ledger } = db;
const { Op } = db.Sequelize;

exports.getProjects = async (req, res, next) => {
  try {
    const rows = await Project.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, code, status } = req.body;
    const row = await Project.create({
      name,
      code,
      status: status || 'OPEN'
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, status } = req.body;
    const row = await Project.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await row.update({ name, code, status });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await Project.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// Project-wise profit summary
// GET /api/projects/:id/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getProjectSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const where = { projectId: id };

    if (from && to) {
      where.date = { [Op.between]: [new Date(from), new Date(to)] };
    }

    const rows = await Ledger.findAll({
      attributes: [
        [db.Sequelize.fn('SUM', db.Sequelize.col('debit')), 'debit'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('credit')), 'credit']
      ],
      where
    });

    const r = rows[0] || {};
    const debit = Number(r.get?.('debit') || 0);
    const credit = Number(r.get?.('credit') || 0);

    res.json({
      projectId: id,
      totalDebit: debit,
      totalCredit: credit,
      profit: credit - debit
    });
  } catch (err) {
    next(err);
  }
};