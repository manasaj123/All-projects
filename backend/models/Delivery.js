const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Delivery = sequelize.define(
  "Delivery",
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    deliveredAt: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM("PENDING", "OUT_FOR_DELIVERY", "DELIVERED"),
      defaultValue: "PENDING"
    }
  },
  { tableName: "deliveries" }
);

module.exports = Delivery;
