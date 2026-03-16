// backend/controllers/creditController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/credits
exports.getCredits = asyncHandler(async (req, res) => {
  const list = await db.Credit.findAll({
    where: { isDeleted: false },
    include: [{ model: db.Customer }]
  });
  res.json(list);
});

// GET /api/credits/deleted
exports.getDeletedCredits = asyncHandler(async (req, res) => {
  const list = await db.Credit.findAll({
    where: { isDeleted: true },
    include: [{ model: db.Customer }]
  });
  res.json(list);
});

// GET /api/credits/:id
exports.getCreditById = asyncHandler(async (req, res) => {
  const rec = await db.Credit.findByPk(req.params.id, {
    include: [{ model: db.Customer }]
  });
  if (!rec) {
    res.status(404).json({ message: 'Credit record not found' });
    return;
  }
  res.json(rec);
});

// POST /api/credits
exports.createCredit = asyncHandler(async (req, res) => {
  const rec = await db.Credit.create(req.body);
  res.status(201).json(rec);
});

// PUT /api/credits/:id
exports.updateCredit = asyncHandler(async (req, res) => {
  const rec = await db.Credit.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Credit record not found' });
    return;
  }
  await rec.update(req.body);
  res.json(rec);
});

// DELETE /api/credits/:id
exports.softDeleteCredit = asyncHandler(async (req, res) => {
  const rec = await db.Credit.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Credit record not found' });
    return;
  }
  await rec.update({ isDeleted: true });
  res.json({ message: 'Credit record moved to recycle bin' });
});

// PUT /api/credits/:id/restore
exports.restoreCredit = asyncHandler(async (req, res) => {
  const rec = await db.Credit.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Credit record not found' });
    return;
  }
  await rec.update({ isDeleted: false });
  res.json(rec);
});
