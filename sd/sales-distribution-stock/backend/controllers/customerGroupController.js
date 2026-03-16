// backend/controllers/customerGroupController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/customer-groups
exports.getCustomerGroups = asyncHandler(async (req, res) => {
  const list = await db.CustomerGroup.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/customer-groups/deleted
exports.getDeletedCustomerGroups = asyncHandler(async (req, res) => {
  const list = await db.CustomerGroup.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/customer-groups/:id
exports.getCustomerGroupById = asyncHandler(async (req, res) => {
  const group = await db.CustomerGroup.findByPk(req.params.id);
  if (!group) {
    res.status(404).json({ message: 'Customer group not found' });
    return;
  }
  res.json(group);
});

// POST /api/customer-groups
exports.createCustomerGroup = asyncHandler(async (req, res) => {
  const group = await db.CustomerGroup.create(req.body);
  res.status(201).json(group);
});

// PUT /api/customer-groups/:id
exports.updateCustomerGroup = asyncHandler(async (req, res) => {
  const group = await db.CustomerGroup.findByPk(req.params.id);
  if (!group) {
    res.status(404).json({ message: 'Customer group not found' });
    return;
  }
  await group.update(req.body);
  res.json(group);
});

// DELETE /api/customer-groups/:id
exports.softDeleteCustomerGroup = asyncHandler(async (req, res) => {
  const group = await db.CustomerGroup.findByPk(req.params.id);
  if (!group) {
    res.status(404).json({ message: 'Customer group not found' });
    return;
  }
  await group.update({ isDeleted: true });
  res.json({ message: 'Customer group moved to recycle bin' });
});

// PUT /api/customer-groups/:id/restore
exports.restoreCustomerGroup = asyncHandler(async (req, res) => {
  const group = await db.CustomerGroup.findByPk(req.params.id);
  if (!group) {
    res.status(404).json({ message: 'Customer group not found' });
    return;
  }
  await group.update({ isDeleted: false });
  res.json(group);
});
