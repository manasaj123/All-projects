const db = require("../config/db");

exports.getAll = cb => db.query("SELECT * FROM item_categories", cb);
exports.create = (data, cb) => db.query("INSERT INTO item_categories SET ?", data, cb);
exports.update = (id, data, cb) => db.query("UPDATE item_categories SET ? WHERE id=?", [data, id], cb);
exports.delete = (id, cb) => db.query("DELETE FROM item_categories WHERE id=?", [id], cb);
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ItemCategory = sequelize.define('ItemCategory', {
  sales_document_type: { type: DataTypes.STRING, allowNull: false },
  item_cat_group: { type: DataTypes.STRING, allowNull: false },
  item_category: { type: DataTypes.STRING, allowNull: false },
  manual_item_category: { type: DataTypes.STRING }
}, {
  tableName: 'item_category',
  timestamps: true
});

module.exports = ItemCategory;
