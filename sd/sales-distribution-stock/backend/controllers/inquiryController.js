// backend/controllers/inquiryController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/inquiries
exports.getInquiries = asyncHandler(async (req, res) => {
  const list = await db.Inquiry.findAll({
    where: { isDeleted: false },
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' }
    ]
  });
  res.json(list);
});

// GET /api/inquiries/deleted
exports.getDeletedInquiries = asyncHandler(async (req, res) => {
  const list = await db.Inquiry.findAll({
    where: { isDeleted: true },
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' }
    ]
  });
  res.json(list);
});

// GET /api/inquiries/:id
exports.getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await db.Inquiry.findByPk(req.params.id, {
    include: [
      { model: db.Customer, as: 'soldToParty' },
      { model: db.Customer, as: 'shipToParty' }
    ]
  });
  if (!inquiry) {
    res.status(404).json({ message: 'Inquiry not found' });
    return;
  }
  res.json(inquiry);
});

// POST /api/inquiries
exports.createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await db.Inquiry.create(req.body);
  res.status(201).json(inquiry);
});

// PUT /api/inquiries/:id
exports.updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await db.Inquiry.findByPk(req.params.id);
  if (!inquiry) {
    res.status(404).json({ message: 'Inquiry not found' });
    return;
  }
  await inquiry.update(req.body);
  res.json(inquiry);
});

// DELETE /api/inquiries/:id
exports.softDeleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await db.Inquiry.findByPk(req.params.id);
  if (!inquiry) {
    res.status(404).json({ message: 'Inquiry not found' });
    return;
  }
  await inquiry.update({ isDeleted: true });
  res.json({ message: 'Inquiry moved to recycle bin' });
});

// PUT /api/inquiries/:id/restore
exports.restoreInquiry = asyncHandler(async (req, res) => {
  const inquiry = await db.Inquiry.findByPk(req.params.id);
  if (!inquiry) {
    res.status(404).json({ message: 'Inquiry not found' });
    return;
  }
  await inquiry.update({ isDeleted: false });
  res.json(inquiry);
});
