// models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('INCOME', 'EXPENSE'),
      allowNull: false
    }
  });

  return Category;
};