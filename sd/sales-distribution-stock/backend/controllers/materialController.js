// backend/controllers/materialController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/materials
exports.getMaterials = asyncHandler(async (req, res) => {
  const list = await db.Material.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/materials/deleted
exports.getDeletedMaterials = asyncHandler(async (req, res) => {
  const list = await db.Material.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/materials/:id
exports.getMaterialById = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }
  res.json(material);
});

// POST /api/materials
exports.createMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.create(req.body);
  res.status(201).json(material);
});

// PUT /api/materials/:id
exports.updateMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }
  await material.update(req.body);
  res.json(material);
});

// DELETE /api/materials/:id  (soft delete)
exports.softDeleteMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }
  await material.update({ isDeleted: true });
  res.json({ message: 'Material moved to recycle bin' });
});

// PUT /api/materials/:id/restore
exports.restoreMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }
  await material.update({ isDeleted: false });
  res.json(material);
});
