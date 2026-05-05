// src/controllers/categoryController.js
const db = require('../config/db');
const { Category } = db;

exports.getCategories = async (req, res, next) => {
  try {
    const rows = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const row = await Category.create({ name, type });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const row = await Category.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await row.update({ name, type });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await Category.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};