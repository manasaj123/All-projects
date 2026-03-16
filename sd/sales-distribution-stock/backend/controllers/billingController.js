// backend/controllers/billingController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/billings
exports.getBillings = asyncHandler(async (req, res) => {
  const list = await db.Billing.findAll({
    where: { isDeleted: false },
    include: [{ model: db.Delivery }]
  });
  res.json(list);
});

// GET /api/billings/deleted
exports.getDeletedBillings = asyncHandler(async (req, res) => {
  const list = await db.Billing.findAll({
    where: { isDeleted: true },
    include: [{ model: db.Delivery }]
  });
  res.json(list);
});

// GET /api/billings/:id
exports.getBillingById = asyncHandler(async (req, res) => {
  const bill = await db.Billing.findByPk(req.params.id, {
    include: [{ model: db.Delivery }]
  });
  if (!bill) {
    res.status(404).json({ message: 'Billing document not found' });
    return;
  }
  res.json(bill);
});

// POST /api/billings
exports.createBilling = asyncHandler(async (req, res) => {
  const bill = await db.Billing.create(req.body);
  res.status(201).json(bill);
});

// PUT /api/billings/:id
exports.updateBilling = asyncHandler(async (req, res) => {
  const bill = await db.Billing.findByPk(req.params.id);
  if (!bill) {
    res.status(404).json({ message: 'Billing document not found' });
    return;
  }
  await bill.update(req.body);
  res.json(bill);
});

// DELETE /api/billings/:id
exports.softDeleteBilling = asyncHandler(async (req, res) => {
  const bill = await db.Billing.findByPk(req.params.id);
  if (!bill) {
    res.status(404).json({ message: 'Billing document not found' });
    return;
  }
  await bill.update({ isDeleted: true });
  res.json({ message: 'Billing document moved to recycle bin' });
});

// PUT /api/billings/:id/restore
exports.restoreBilling = asyncHandler(async (req, res) => {
  const bill = await db.Billing.findByPk(req.params.id);
  if (!bill) {
    res.status(404).json({ message: 'Billing document not found' });
    return;
  }
  await bill.update({ isDeleted: false });
  res.json(bill);
});
