// backend/controllers/routeController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/routes
exports.getRoutes = asyncHandler(async (req, res) => {
  const list = await db.Route.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/routes/deleted
exports.getDeletedRoutes = asyncHandler(async (req, res) => {
  const list = await db.Route.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/routes/:id
exports.getRouteById = asyncHandler(async (req, res) => {
  const route = await db.Route.findByPk(req.params.id);
  if (!route) {
    res.status(404).json({ message: 'Route not found' });
    return;
  }
  res.json(route);
});

// POST /api/routes
exports.createRoute = asyncHandler(async (req, res) => {
  const route = await db.Route.create(req.body);
  res.status(201).json(route);
});

// PUT /api/routes/:id
exports.updateRoute = asyncHandler(async (req, res) => {
  const route = await db.Route.findByPk(req.params.id);
  if (!route) {
    res.status(404).json({ message: 'Route not found' });
    return;
  }
  await route.update(req.body);
  res.json(route);
});

// DELETE /api/routes/:id
exports.softDeleteRoute = asyncHandler(async (req, res) => {
  const route = await db.Route.findByPk(req.params.id);
  if (!route) {
    res.status(404).json({ message: 'Route not found' });
    return;
  }
  await route.update({ isDeleted: true });
  res.json({ message: 'Route moved to recycle bin' });
});

// PUT /api/routes/:id/restore
exports.restoreRoute = asyncHandler(async (req, res) => {
  const route = await db.Route.findByPk(req.params.id);
  if (!route) {
    res.status(404).json({ message: 'Route not found' });
    return;
  }
  await route.update({ isDeleted: false });
  res.json(route);
});
