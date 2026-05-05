// backend/src/models/VendorCustomerInvoiceLine.js
module.exports = (sequelize, DataTypes) => {
  const VendorCustomerInvoiceLine = sequelize.define(
    'VendorCustomerInvoiceLine',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      invoiceId: { type: DataTypes.INTEGER, allowNull: false },
      glAccount: { type: DataTypes.STRING(20), allowNull: false },
      amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      taxCode: { type: DataTypes.STRING(10) },
      assignment: { type: DataTypes.STRING(50) },
      lineText: { type: DataTypes.STRING(255) },
      costCenter: { type: DataTypes.STRING(20) },
      hsnCode: { type: DataTypes.STRING(20) },
    },
    {
      tableName: 'vendor_customer_invoice_lines',
      timestamps: false,
    }
  );

  VendorCustomerInvoiceLine.associate = (models) => {
    VendorCustomerInvoiceLine.belongsTo(models.VendorCustomerInvoice, {
      as: 'invoice',
      foreignKey: 'invoiceId',
    });
  };

  return VendorCustomerInvoiceLine;
};