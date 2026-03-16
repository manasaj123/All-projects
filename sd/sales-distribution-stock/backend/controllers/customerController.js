// backend/controllers/customerController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/customers
exports.getCustomers = asyncHandler(async (req, res) => {
  const list = await db.Customer.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/customers/deleted
exports.getDeletedCustomers = asyncHandler(async (req, res) => {
  const list = await db.Customer.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/customers/:id
exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await db.Customer.findByPk(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  res.json(customer);
});

// POST /api/customers
exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await db.Customer.create(req.body);
  res.status(201).json(customer);
});

// PUT /api/customers/:id
exports.updateCustomer = asyncHandler(async (req, res) => {
  const customer = await db.Customer.findByPk(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  await customer.update(req.body);
  res.json(customer);
});

// DELETE /api/customers/:id
exports.softDeleteCustomer = asyncHandler(async (req, res) => {
  const customer = await db.Customer.findByPk(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  await customer.update({ isDeleted: true });
  res.json({ message: 'Customer moved to recycle bin' });
});

// PUT /api/customers/:id/restore
exports.restoreCustomer = asyncHandler(async (req, res) => {
  const customer = await db.Customer.findByPk(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  await customer.update({ isDeleted: false });
  res.json(customer);
});
