// backend/controllers/conditionController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/conditions
exports.getConditions = asyncHandler(async (req, res) => {
  const list = await db.Condition.findAll({
    where: { isDeleted: false },
    include: [
      { model: db.Customer, as: 'customer' },
      { model: db.Material, as: 'material' }
    ]
  });
  res.json(list);
});

// GET /api/conditions/deleted
exports.getDeletedConditions = asyncHandler(async (req, res) => {
  const list = await db.Condition.findAll({
    where: { isDeleted: true },
    include: [
      { model: db.Customer, as: 'customer' },
      { model: db.Material, as: 'material' }
    ]
  });
  res.json(list);
});

// GET /api/conditions/:id
exports.getConditionById = asyncHandler(async (req, res) => {
  const cond = await db.Condition.findByPk(req.params.id, {
    include: [
      { model: db.Customer, as: 'customer' },
      { model: db.Material, as: 'material' }
    ]
  });
  if (!cond) {
    res.status(404).json({ message: 'Condition record not found' });
    return;
  }
  res.json(cond);
});

// POST /api/conditions
exports.createCondition = asyncHandler(async (req, res) => {
  const cond = await db.Condition.create(req.body);
  res.status(201).json(cond);
});

// PUT /api/conditions/:id
exports.updateCondition = asyncHandler(async (req, res) => {
  const cond = await db.Condition.findByPk(req.params.id);
  if (!cond) {
    res.status(404).json({ message: 'Condition record not found' });
    return;
  }
  await cond.update(req.body);
  res.json(cond);
});

// DELETE /api/conditions/:id
exports.softDeleteCondition = asyncHandler(async (req, res) => {
  const cond = await db.Condition.findByPk(req.params.id);
  if (!cond) {
    res.status(404).json({ message: 'Condition record not found' });
    return;
  }
  await cond.update({ isDeleted: true });
  res.json({ message: 'Condition record moved to recycle bin' });
});

// PUT /api/conditions/:id/restore
exports.restoreCondition = asyncHandler(async (req, res) => {
  const cond = await db.Condition.findByPk(req.params.id);
  if (!cond) {
    res.status(404).json({ message: 'Condition record not found' });
    return;
  }
  await cond.update({ isDeleted: false });
  res.json(cond);
});
