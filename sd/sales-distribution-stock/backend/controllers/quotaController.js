// backend/controllers/quotaController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/quotas
exports.getQuotas = asyncHandler(async (req, res) => {
  const list = await db.Quota.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/quotas/deleted
exports.getDeletedQuotas = asyncHandler(async (req, res) => {
  const list = await db.Quota.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/quotas/:id
exports.getQuotaById = asyncHandler(async (req, res) => {
  const quota = await db.Quota.findByPk(req.params.id);
  if (!quota) {
    res.status(404).json({ message: 'Quota arrangement not found' });
    return;
  }
  res.json(quota);
});

// POST /api/quotas
exports.createQuota = asyncHandler(async (req, res) => {
  const quota = await db.Quota.create(req.body);
  res.status(201).json(quota);
});

// PUT /api/quotas/:id
exports.updateQuota = asyncHandler(async (req, res) => {
  const quota = await db.Quota.findByPk(req.params.id);
  if (!quota) {
    res.status(404).json({ message: 'Quota arrangement not found' });
    return;
  }
  await quota.update(req.body);
  res.json(quota);
});

// DELETE /api/quotas/:id
exports.softDeleteQuota = asyncHandler(async (req, res) => {
  const quota = await db.Quota.findByPk(req.params.id);
  if (!quota) {
    res.status(404).json({ message: 'Quota arrangement not found' });
    return;
  }
  await quota.update({ isDeleted: true });
  res.json({ message: 'Quota arrangement moved to recycle bin' });
});

// PUT /api/quotas/:id/restore
exports.restoreQuota = asyncHandler(async (req, res) => {
  const quota = await db.Quota.findByPk(req.params.id);
  if (!quota) {
    res.status(404).json({ message: 'Quota arrangement not found' });
    return;
  }
  await quota.update({ isDeleted: false });
  res.json(quota);
});
