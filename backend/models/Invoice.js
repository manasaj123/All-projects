const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Invoice = sequelize.define(
  "Invoice",
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    invoiceDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID"),
      defaultValue: "PENDING"
    }
  },
  { tableName: "invoices" }
);

module.exports = Invoice;
