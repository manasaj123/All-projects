const { sequelize } = require("../config/db");
const User = require("./User");
const Order = require("./Order");
const Delivery = require("./Delivery");
const Invoice = require("./Invoice");

// Relations
Order.hasOne(Delivery, { foreignKey: "orderId" });
Delivery.belongsTo(Order, { foreignKey: "orderId" });

Order.hasOne(Invoice, { foreignKey: "orderId" });
Invoice.belongsTo(Order, { foreignKey: "orderId" });

module.exports = { sequelize, User, Order, Delivery, Invoice };
