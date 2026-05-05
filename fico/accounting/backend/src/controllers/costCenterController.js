const db = require('../config/db');
const { CostCenter } = db;

exports.create = async (req, res, next) => {
  try {
    const [center, created] = await CostCenter.upsert({
      code: req.body.code,
      name: req.body.name,
      description: req.body.description || null,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    if (created) {
      return res.status(201).json(center);
    }
    return res.status(200).json({ message: 'Cost center exists, updated', data: center });
  } catch (err) {
    next(err);  // Your error middleware handles SequelizeUniqueConstraintError
  }
};

exports.list = async (req, res, next) => {
  try {
    const centers = await CostCenter.findAll({ order: [['code', 'ASC']] });
    res.json(centers);
  } catch (err) {
    next(err);
  }
};