// models/Project.js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN'
    }
  });

  return Project;
};