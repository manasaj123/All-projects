// backend/controllers/materialSalesController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/material-sales
exports.getSalesViews = asyncHandler(async (req, res) => {
  const list = await db.SalesView.findAll({
    where: { isDeleted: false },
    include: [{ model: db.Material }]
  });
  res.json(list);
});

// GET /api/material-sales/deleted
exports.getDeletedSalesViews = asyncHandler(async (req, res) => {
  const list = await db.SalesView.findAll({
    where: { isDeleted: true },
    include: [{ model: db.Material }]
  });
  res.json(list);
});

// GET /api/material-sales/:id
exports.getSalesViewById = asyncHandler(async (req, res) => {
  const view = await db.SalesView.findByPk(req.params.id, {
    include: [{ model: db.Material }]
  });
  if (!view) {
    res.status(404).json({ message: 'Sales view not found' });
    return;
  }
  res.json(view);
});

// POST /api/material-sales
exports.createSalesView = asyncHandler(async (req, res) => {
  const view = await db.SalesView.create(req.body);
  res.status(201).json(view);
});

// PUT /api/material-sales/:id
exports.updateSalesView = asyncHandler(async (req, res) => {
  const view = await db.SalesView.findByPk(req.params.id);
  if (!view) {
    res.status(404).json({ message: 'Sales view not found' });
    return;
  }
  await view.update(req.body);
  res.json(view);
});

// DELETE /api/material-sales/:id
exports.softDeleteSalesView = asyncHandler(async (req, res) => {
  const view = await db.SalesView.findByPk(req.params.id);
  if (!view) {
    res.status(404).json({ message: 'Sales view not found' });
    return;
  }
  await view.update({ isDeleted: true });
  res.json({ message: 'Sales view moved to recycle bin' });
});

// PUT /api/material-sales/:id/restore
exports.restoreSalesView = asyncHandler(async (req, res) => {
  const view = await db.SalesView.findByPk(req.params.id);
  if (!view) {
    res.status(404).json({ message: 'Sales view not found' });
    return;
  }
  await view.update({ isDeleted: false });
  res.json(view);
});
