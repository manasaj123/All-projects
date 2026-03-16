// backend/controllers/agreementController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/agreements
exports.getAgreements = asyncHandler(async (req, res) => {
  const list = await db.Agreement.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/agreements/deleted
exports.getDeletedAgreements = asyncHandler(async (req, res) => {
  const list = await db.Agreement.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/agreements/:id
exports.getAgreementById = asyncHandler(async (req, res) => {
  const agr = await db.Agreement.findByPk(req.params.id);
  if (!agr) {
    res.status(404).json({ message: 'Agreement not found' });
    return;
  }
  res.json(agr);
});

// POST /api/agreements
exports.createAgreement = asyncHandler(async (req, res) => {
  const agr = await db.Agreement.create(req.body);
  res.status(201).json(agr);
});

// PUT /api/agreements/:id
exports.updateAgreement = asyncHandler(async (req, res) => {
  const agr = await db.Agreement.findByPk(req.params.id);
  if (!agr) {
    res.status(404).json({ message: 'Agreement not found' });
    return;
  }
  await agr.update(req.body);
  res.json(agr);
});

// DELETE /api/agreements/:id
exports.softDeleteAgreement = asyncHandler(async (req, res) => {
  const agr = await db.Agreement.findByPk(req.params.id);
  if (!agr) {
    res.status(404).json({ message: 'Agreement not found' });
    return;
  }
  await agr.update({ isDeleted: true });
  res.json({ message: 'Agreement moved to recycle bin' });
});

// PUT /api/agreements/:id/restore
exports.restoreAgreement = asyncHandler(async (req, res) => {
  const agr = await db.Agreement.findByPk(req.params.id);
  if (!agr) {
    res.status(404).json({ message: 'Agreement not found' });
    return;
  }
  await agr.update({ isDeleted: false });
  res.json(agr);
});
