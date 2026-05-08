// backend/controllers/customerController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/customers
exports.getCustomers = asyncHandler(async (req, res) => {
  const list = await db.Customer.findAll({
    where: { isDeleted: false },
    order: [['id', 'ASC']],
  });
  res.json(list);
});

// GET /api/customers/deleted
exports.getDeletedCustomers = asyncHandler(async (req, res) => {
  const list = await db.Customer.findAll({
    where: { isDeleted: true },
    order: [['id', 'ASC']],
  });
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
  try {

    if (req.body.name && req.body.name.length > 150) {
      return res.status(400).json({
        message: 'Name cannot exceed 150 characters',
      });
    }

    const payload = {
      customerCode: req.body.customerCode,
      name: req.body.name,
      accountGroup: req.body.accountGroup,
      city: req.body.city,
      country: req.body.country,
      creditGroup: req.body.creditGroup,
  riskCategory: req.body.riskCategory,
    };
    const customer = await db.Customer.create(payload);
    res.status(201).json(customer);
  } catch (err) {
    console.error('SQL error:', err.original || err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/customers/:id
exports.updateCustomer = asyncHandler(async (req, res) => {
  const customer = await db.Customer.findByPk(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }

  if (req.body.name && req.body.name.length > 150) {
    return res.status(400).json({
      message: 'Name cannot exceed 150 characters',
    });
  }

  const payload = {
    customerCode: req.body.customerCode,
    name: req.body.name,
    accountGroup: req.body.accountGroup,
    city: req.body.city,
    country: req.body.country,
    email: req.body.email,
    phone: req.body.phone,
  };

  await customer.update(payload);
  res.json(customer);
});

// DELETE /api/customers/:id  (soft delete)
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
