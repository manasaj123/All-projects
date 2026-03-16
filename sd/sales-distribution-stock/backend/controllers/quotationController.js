// backend/controllers/quotationController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/quotations
exports.getQuotations = asyncHandler(async (req, res) => {
  const list = await db.Quotation.findAll({
    where: { isDeleted: false },
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' },
      { model: db.Inquiry, as: 'referenceInquiry' }
    ]
  });
  res.json(list);
});

// GET /api/quotations/deleted
exports.getDeletedQuotations = asyncHandler(async (req, res) => {
  const list = await db.Quotation.findAll({
    where: { isDeleted: true },
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' },
      { model: db.Inquiry, as: 'referenceInquiry' }
    ]
  });
  res.json(list);
});

// GET /api/quotations/:id
exports.getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await db.Quotation.findByPk(req.params.id, {
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' },
      { model: db.Inquiry, as: 'referenceInquiry' }
    ]
  });
  if (!quotation) {
    res.status(404).json({ message: 'Quotation not found' });
    return;
  }
  res.json(quotation);
});

// POST /api/quotations
exports.createQuotation = asyncHandler(async (req, res) => {
  const quotation = await db.Quotation.create(req.body);
  res.status(201).json(quotation);
});

// PUT /api/quotations/:id
exports.updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await db.Quotation.findByPk(req.params.id);
  if (!quotation) {
    res.status(404).json({ message: 'Quotation not found' });
    return;
  }
  await quotation.update(req.body);
  res.json(quotation);
});

// DELETE /api/quotations/:id
exports.softDeleteQuotation = asyncHandler(async (req, res) => {
  const quotation = await db.Quotation.findByPk(req.params.id);
  if (!quotation) {
    res.status(404).json({ message: 'Quotation not found' });
    return;
  }
  await quotation.update({ isDeleted: true });
  res.json({ message: 'Quotation moved to recycle bin' });
});

// PUT /api/quotations/:id/restore
exports.restoreQuotation = asyncHandler(async (req, res) => {
  const quotation = await db.Quotation.findByPk(req.params.id);
  if (!quotation) {
    res.status(404).json({ message: 'Quotation not found' });
    return;
  }
  await quotation.update({ isDeleted: false });
  res.json(quotation);
});
