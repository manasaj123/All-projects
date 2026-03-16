// backend/controllers/salesOrderController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/sales-orders
exports.getSalesOrders = asyncHandler(async (req, res) => {
  const list = await db.SalesOrder.findAll({
    where: { isDeleted: false },
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' },
      { model: db.Inquiry, as: 'referenceInquiry' },
      { model: db.Quotation, as: 'referenceQuotation' }
    ]
  });
  res.json(list);
});

// GET /api/sales-orders/deleted
exports.getDeletedSalesOrders = asyncHandler(async (req, res) => {
  const list = await db.SalesOrder.findAll({
    where: { isDeleted: true },
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' },
      { model: db.Inquiry, as: 'referenceInquiry' },
      { model: db.Quotation, as: 'referenceQuotation' }
    ]
  });
  res.json(list);
});

// GET /api/sales-orders/:id
exports.getSalesOrderById = asyncHandler(async (req, res) => {
  const order = await db.SalesOrder.findByPk(req.params.id, {
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' },
      { model: db.Inquiry, as: 'referenceInquiry' },
      { model: db.Quotation, as: 'referenceQuotation' }
    ]
  });
  if (!order) {
    res.status(404).json({ message: 'Sales order not found' });
    return;
  }
  res.json(order);
});

// POST /api/sales-orders
exports.createSalesOrder = asyncHandler(async (req, res) => {
  const order = await db.SalesOrder.create(req.body);
  res.status(201).json(order);
});

// PUT /api/sales-orders/:id
exports.updateSalesOrder = asyncHandler(async (req, res) => {
  const order = await db.SalesOrder.findByPk(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Sales order not found' });
    return;
  }
  await order.update(req.body);
  res.json(order);
});

// DELETE /api/sales-orders/:id
exports.softDeleteSalesOrder = asyncHandler(async (req, res) => {
  const order = await db.SalesOrder.findByPk(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Sales order not found' });
    return;
  }
  await order.update({ isDeleted: true });
  res.json({ message: 'Sales order moved to recycle bin' });
});

// PUT /api/sales-orders/:id/restore
exports.restoreSalesOrder = asyncHandler(async (req, res) => {
  const order = await db.SalesOrder.findByPk(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Sales order not found' });
    return;
  }
  await order.update({ isDeleted: false });
  res.json(order);
});
