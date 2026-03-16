// backend/controllers/pickingController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/pickings
exports.getPickings = asyncHandler(async (req, res) => {
  const list = await db.Picking.findAll({
    where: { isDeleted: false },
    include: [{ model: db.Delivery }]
  });
  res.json(list);
});

// GET /api/pickings/deleted
exports.getDeletedPickings = asyncHandler(async (req, res) => {
  const list = await db.Picking.findAll({
    where: { isDeleted: true },
    include: [{ model: db.Delivery }]
  });
  res.json(list);
});

// GET /api/pickings/:id
exports.getPickingById = asyncHandler(async (req, res) => {
  const rec = await db.Picking.findByPk(req.params.id, {
    include: [{ model: db.Delivery }]
  });
  if (!rec) {
    res.status(404).json({ message: 'Picking record not found' });
    return;
  }
  res.json(rec);
});

// POST /api/pickings
exports.createPicking = asyncHandler(async (req, res) => {
  const rec = await db.Picking.create(req.body);
  res.status(201).json(rec);
});

// PUT /api/pickings/:id
exports.updatePicking = asyncHandler(async (req, res) => {
  const rec = await db.Picking.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Picking record not found' });
    return;
  }
  await rec.update(req.body);
  res.json(rec);
});

// DELETE /api/pickings/:id
exports.softDeletePicking = asyncHandler(async (req, res) => {
  const rec = await db.Picking.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Picking record not found' });
    return;
  }
  await rec.update({ isDeleted: true });
  res.json({ message: 'Picking record moved to recycle bin' });
});

// PUT /api/pickings/:id/restore
exports.restorePicking = asyncHandler(async (req, res) => {
  const rec = await db.Picking.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Picking record not found' });
    return;
  }
  await rec.update({ isDeleted: false });
  res.json(rec);
});
