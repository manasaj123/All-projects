const db = require('../config/db');
const { FixedAsset } = db;

exports.listAssets = async (req, res, next) => {
  try {
    const assets = await FixedAsset.findAll({
      order: [['purchaseDate', 'DESC'], ['id', 'DESC']]
    });
    res.json(assets);
  } catch (err) {
    next(err);
  }
};

exports.createAsset = async (req, res, next) => {
  try {
    const {
      assetCode,
      assetName,
      category,
      location,
      purchaseDate,
      purchaseCost,
      usefulLifeYears,
      depreciationRate,
      notes
    } = req.body;

    if (!assetCode || !assetName || !purchaseDate || !purchaseCost) {
      return res
        .status(400)
        .json({ message: 'Asset code, name, date, and cost are required' });
    }

    const asset = await FixedAsset.create({
      assetCode,
      assetName,
      category: category || 'OTHER',
      location,
      purchaseDate,
      purchaseCost,
      usefulLifeYears: usefulLifeYears || 0,
      depreciationRate: depreciationRate || 0,
      notes
    });

    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
};