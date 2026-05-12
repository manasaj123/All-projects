module.exports = (sequelize, DataTypes) => {
  const GRIRClearing = sequelize.define('GRIRClearing', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    poNumber: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    amount: { // PO/GR amount
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    clearedAmount: { // Invoice matched amount
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    pendingAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        return Number(this.amount) - Number(this.clearedAmount);
      }
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CLEARED', 'PARTIAL', 'DISCREPANCY'),
      defaultValue: 'PENDING'
    },
    grDate: {
      type: DataTypes.DATEONLY
    },
    invoiceDate: {
      type: DataTypes.DATEONLY
    },
    vendorName: {
      type: DataTypes.STRING(160)
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'grir_clearing',
    timestamps: true
  });

  return GRIRClearing;
};