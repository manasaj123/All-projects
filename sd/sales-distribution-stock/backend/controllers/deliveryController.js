// backend/controllers/deliveryController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/deliveries
exports.getDeliveries = asyncHandler(async (req, res) => {
  const list = await db.Delivery.findAll({
    where: { isDeleted: false },
    include: [{ model: db.SalesOrder }]
  });
  res.json(list);
});

// GET /api/deliveries/deleted
exports.getDeletedDeliveries = asyncHandler(async (req, res) => {
  const list = await db.Delivery.findAll({
    where: { isDeleted: true },
    include: [{ model: db.SalesOrder }]
  });
  res.json(list);
});

// GET /api/deliveries/:id
exports.getDeliveryById = asyncHandler(async (req, res) => {
  const delivery = await db.Delivery.findByPk(req.params.id, {
    include: [{ model: db.SalesOrder }]
  });
  if (!delivery) {
    res.status(404).json({ message: 'Delivery not found' });
    return;
  }
  res.json(delivery);
});

// POST /api/deliveries
exports.createDelivery = asyncHandler(async (req, res) => {
  const delivery = await db.Delivery.create(req.body);
  res.status(201).json(delivery);
});

// PUT /api/deliveries/:id
exports.updateDelivery = asyncHandler(async (req, res) => {
  const delivery = await db.Delivery.findByPk(req.params.id);
  if (!delivery) {
    res.status(404).json({ message: 'Delivery not found' });
    return;
  }
  await delivery.update(req.body);
  res.json(delivery);
});

// DELETE /api/deliveries/:id
exports.softDeleteDelivery = asyncHandler(async (req, res) => {
  const delivery = await db.Delivery.findByPk(req.params.id);
  if (!delivery) {
    res.status(404).json({ message: 'Delivery not found' });
    return;
  }
  await delivery.update({ isDeleted: true });
  res.json({ message: 'Delivery moved to recycle bin' });
});

// PUT /api/deliveries/:id/restore
exports.restoreDelivery = asyncHandler(async (req, res) => {
  const delivery = await db.Delivery.findByPk(req.params.id);
  if (!delivery) {
    res.status(404).json({ message: 'Delivery not found' });
    return;
  }
  await delivery.update({ isDeleted: false });
  res.json(delivery);
});
