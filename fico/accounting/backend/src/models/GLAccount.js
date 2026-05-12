// backend/src/models/GLAccount.js
module.exports = (sequelize, DataTypes) => {
  const GLAccount = sequelize.define(
    'GLAccount',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      // Identification
      glCode: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      companyCode: { type: DataTypes.STRING, allowNull: false },

      // Classification
      accountType: {
        // ASSET, LIABILITY, EQUITY, INCOME, EXPENSE
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountCurrency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'INR',
      },

      // FICO control fields
      taxCategory: { type: DataTypes.STRING },
      reconciliationType: {
        // NONE, CUSTOMER, VENDOR
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'NONE',
      },
      altAccountNumber: { type: DataTypes.STRING },
      toleranceGroup: { type: DataTypes.STRING },
      fieldStatusGroup: { type: DataTypes.STRING },
      planningLevel: { type: DataTypes.STRING },

      // Control flags
      isBlockedForPosting: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'gl_accounts',
      timestamps: false,
    }
  );

  return GLAccount;
};