module.exports = (sequelize, DataTypes) => {
  const FixedAsset = sequelize.define(
    'FixedAsset',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      assetCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      assetName: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM(
          'IT',
          'FURNITURE',
          'VEHICLE',
          'BUILDING',
          'OTHER'
        ),
        allowNull: false,
        defaultValue: 'OTHER'
      },
      location: {
        type: DataTypes.STRING(100)
      },
      purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      purchaseCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      usefulLifeYears: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      depreciationRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
      },
      notes: {
        type: DataTypes.STRING(255)
      }
    },
    {
      tableName: 'fixed_assets',
      timestamps: true
    }
  );

  return FixedAsset;
};