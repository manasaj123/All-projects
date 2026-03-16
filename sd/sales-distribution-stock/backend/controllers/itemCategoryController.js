// backend/controllers/itemCategoryController.js
const ItemCategory = require('../models/itemCategoryModel');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/item-categories  -> list active item categories
exports.getItemCategories = asyncHandler(async (req, res) => {
  const list = await ItemCategory.find({ isDeleted: false });
  res.json(list);
});

// GET /api/item-categories/deleted  -> recycle bin
exports.getDeletedItemCategories = asyncHandler(async (req, res) => {
  const list = await ItemCategory.find({ isDeleted: true });
  res.json(list);
});

// GET /api/item-categories/:id  -> single item category
exports.getItemCategoryById = asyncHandler(async (req, res) => {
  const doc = await ItemCategory.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Item category not found');
  }
  res.json(doc);
});

// POST /api/item-categories  -> create item category
exports.createItemCategory = asyncHandler(async (req, res) => {
  const doc = await ItemCategory.create(req.body);
  res.status(201).json(doc);
});

// PUT /api/item-categories/:id  -> update item category
exports.updateItemCategory = asyncHandler(async (req, res) => {
  const doc = await ItemCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!doc) {
    res.status(404);
    throw new Error('Item category not found');
  }
  res.json(doc);
});

// DELETE /api/item-categories/:id  -> soft delete
exports.softDeleteItemCategory = asyncHandler(async (req, res) => {
  const doc = await ItemCategory.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Item category not found');
  }
  res.json({ message: 'Item category moved to recycle bin' });
});

// PUT /api/item-categories/:id/restore  -> restore
exports.restoreItemCategory = asyncHandler(async (req, res) => {
  const doc = await ItemCategory.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false },
    { new: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Item category not found');
  }
  res.json(doc);
});
