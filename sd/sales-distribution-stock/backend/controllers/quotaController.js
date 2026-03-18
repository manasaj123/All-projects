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
exports.createQuota = async (req, res) => {
  try {
    const payload = { ...req.body };

    // If you have any optional numeric fields, normalize here, e.g.:
    // if (payload.someIntField === '') payload.someIntField = null;

    const quota = await db.Quota.create(payload);
    return res.status(201).json(quota);
  } catch (err) {
    console.error(
      'DB error in createQuota:',
      err.message,
      err.original?.sqlMessage,
      err.original?.sql
    );
    return res.status(500).json({
      error: err.message,
      sqlMessage: err.original?.sqlMessage,
      sql: err.original?.sql,
    });
  }
};

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
