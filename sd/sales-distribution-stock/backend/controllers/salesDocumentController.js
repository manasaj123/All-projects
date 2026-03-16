// backend/controllers/salesDocumentController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/sales-documents
exports.getSalesDocuments = asyncHandler(async (req, res) => {
  const list = await db.SalesDocumentConfig.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/sales-documents/deleted
exports.getDeletedSalesDocuments = asyncHandler(async (req, res) => {
  const list = await db.SalesDocumentConfig.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/sales-documents/:id
exports.getSalesDocumentById = asyncHandler(async (req, res) => {
  const doc = await db.SalesDocumentConfig.findByPk(req.params.id);
  if (!doc) {
    res.status(404).json({ message: 'Sales document config not found' });
    return;
  }
  res.json(doc);
});

// POST /api/sales-documents
exports.createSalesDocument = asyncHandler(async (req, res) => {
  const doc = await db.SalesDocumentConfig.create(req.body);
  res.status(201).json(doc);
});

// PUT /api/sales-documents/:id
exports.updateSalesDocument = asyncHandler(async (req, res) => {
  const doc = await db.SalesDocumentConfig.findByPk(req.params.id);
  if (!doc) {
    res.status(404).json({ message: 'Sales document config not found' });
    return;
  }
  await doc.update(req.body);
  res.json(doc);
});

// DELETE /api/sales-documents/:id
exports.softDeleteSalesDocument = asyncHandler(async (req, res) => {
  const doc = await db.SalesDocumentConfig.findByPk(req.params.id);
  if (!doc) {
    res.status(404).json({ message: 'Sales document config not found' });
    return;
  }
  await doc.update({ isDeleted: true });
  res.json({ message: 'Sales document config moved to recycle bin' });
});

// PUT /api/sales-documents/:id/restore
exports.restoreSalesDocument = asyncHandler(async (req, res) => {
  const doc = await db.SalesDocumentConfig.findByPk(req.params.id);
  if (!doc) {
    res.status(404).json({ message: 'Sales document config not found' });
    return;
  }
  await doc.update({ isDeleted: false });
  res.json(doc);
});
