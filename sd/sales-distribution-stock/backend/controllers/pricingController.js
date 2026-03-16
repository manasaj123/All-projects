// backend/controllers/pricingController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/pricing
exports.getPricingConfigs = asyncHandler(async (req, res) => {
  const list = await db.PricingConfig.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/pricing/deleted
exports.getDeletedPricingConfigs = asyncHandler(async (req, res) => {
  const list = await db.PricingConfig.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/pricing/:id
exports.getPricingConfigById = asyncHandler(async (req, res) => {
  const rec = await db.PricingConfig.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Pricing configuration not found' });
    return;
  }
  res.json(rec);
});

// POST /api/pricing
exports.createPricingConfig = asyncHandler(async (req, res) => {
  const rec = await db.PricingConfig.create(req.body);
  res.status(201).json(rec);
});

// PUT /api/pricing/:id
exports.updatePricingConfig = asyncHandler(async (req, res) => {
  const rec = await db.PricingConfig.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Pricing configuration not found' });
    return;
  }
  await rec.update(req.body);
  res.json(rec);
});

// DELETE /api/pricing/:id
exports.softDeletePricingConfig = asyncHandler(async (req, res) => {
  const rec = await db.PricingConfig.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Pricing configuration not found' });
    return;
  }
  await rec.update({ isDeleted: true });
  res.json({ message: 'Pricing configuration moved to recycle bin' });
});

// PUT /api/pricing/:id/restore
exports.restorePricingConfig = asyncHandler(async (req, res) => {
  const rec = await db.PricingConfig.findByPk(req.params.id);
  if (!rec) {
    res.status(404).json({ message: 'Pricing configuration not found' });
    return;
  }
  await rec.update({ isDeleted: false });
  res.json(rec);
});
