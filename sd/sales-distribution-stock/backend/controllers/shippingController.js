// backend/controllers/shippingController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/shipping
exports.getShippingConfigs = asyncHandler(async (req, res) => {
  const list = await db.Shipping.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/shipping/deleted
exports.getDeletedShippingConfigs = asyncHandler(async (req, res) => {
  const list = await db.Shipping.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/shipping/:id
exports.getShippingConfigById = asyncHandler(async (req, res) => {
  const rec = await db.Shipping.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Shipping record not found' });
    return;
  }
  res.json(rec);
});

// POST /api/shipping
exports.createShippingConfig = asyncHandler(async (req, res) => {
  const rec = await db.Shipping.create(req.body);
  res.status(201).json(rec);
});

// PUT /api/shipping/:id
exports.updateShippingConfig = asyncHandler(async (req, res) => {
  const rec = await db.Shipping.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Shipping record not found' });
    return;
  }
  await rec.update(req.body);
  res.json(rec);
});

// DELETE /api/shipping/:id
exports.softDeleteShippingConfig = asyncHandler(async (req, res) => {
  const rec = await db.Shipping.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Shipping record not found' });
    return;
  }
  await rec.update({ isDeleted: true });
  res.json({ message: 'Shipping record moved to recycle bin' });
});

// PUT /api/shipping/:id/restore
exports.restoreShippingConfig = asyncHandler(async (req, res) => {
  const rec = await db.Shipping.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Shipping record not found' });
    return;
  }
  await rec.update({ isDeleted: false });
  res.json(rec);
});
