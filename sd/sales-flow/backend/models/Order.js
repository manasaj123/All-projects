const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerRegion: { type: DataTypes.STRING, allowNull: false },
    // store items as JSON; later you can normalize to items table
    items: { type: DataTypes.JSON, allowNull: false },
    status: {
      type: DataTypes.ENUM("CREATED", "DELIVERED", "INVOICED"),
      defaultValue: "CREATED"
    }
  },
  { tableName: "orders" }
);

module.exports = Order;
