// backend/src/models/VendorCustomerInvoice.js
module.exports = (sequelize, DataTypes) => {
  const VendorCustomerInvoice = sequelize.define(
    'VendorCustomerInvoice',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      mode: { type: DataTypes.ENUM('VENDOR', 'CUSTOMER'), allowNull: false },
      postingDate: { type: DataTypes.DATEONLY, allowNull: false },
      documentDate: { type: DataTypes.DATEONLY, allowNull: false },
      amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      reference: { type: DataTypes.STRING(50) },
      businessPlace: { type: DataTypes.STRING(30) },
      text: { type: DataTypes.STRING(255) },
      baselineDate: { type: DataTypes.DATEONLY },
      vendorCode: { type: DataTypes.STRING(20) },
      sectionCode: { type: DataTypes.STRING(20) },
      customerCode: { type: DataTypes.STRING(20) },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: 'vendor_customer_invoices',
      timestamps: true,
    }
  );

  VendorCustomerInvoice.associate = (models) => {
    VendorCustomerInvoice.hasMany(models.VendorCustomerInvoiceLine, {
      as: 'lines',
      foreignKey: 'invoiceId',
    });
  };

  return VendorCustomerInvoice;
};