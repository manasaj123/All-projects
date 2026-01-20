
const Product = require('../models/Product');

exports.list = async (req, res, next) => {
  try {
    const rows = await Product.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const row = await Product.create(req.body);
    res.json(row);
  } catch (err) {
    next(err);
  }
};
