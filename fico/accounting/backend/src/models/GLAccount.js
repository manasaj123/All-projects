module.exports = (sequelize, DataTypes) => {
  const GLAccount = sequelize.define(
    'GLAccount',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      glCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      companyCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      accountType: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      accountCurrency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'INR',
      },
      taxCategory: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      reconciliationType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'NONE',
      },
      altAccountNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      toleranceGroup: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      fieldStatusGroup: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      planningLevel: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      isBlockedForPosting: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accountController: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
    },
    {
      tableName: 'gl_accounts',
      timestamps: false, // your DESCRIBE output has no createdAt/updatedAt
    }
  );

  return GLAccount;
};