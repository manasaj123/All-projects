// JournalHeader.js
module.exports = (sequelize, DataTypes) => {
  const JournalHeader = sequelize.define(
    'JournalHeader',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      documentNumber: { type: DataTypes.STRING(20), unique: true, allowNull: false },
      documentDate: { type: DataTypes.DATEONLY, allowNull: false },
      postingDate: { type: DataTypes.DATEONLY, allowNull: false },
      documentType: { type: DataTypes.STRING(4), allowNull: false },
      reference: { type: DataTypes.STRING(50) },
      headerText: { type: DataTypes.STRING(255) },
      companyCode: { type: DataTypes.STRING(10), allowNull: false },
      status: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'POSTED' },
      createdBy: { type: DataTypes.STRING(50) },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'journal_headers',
      timestamps: false,
    }
  );
  return JournalHeader;
};

// JournalLine.js
module.exports = (sequelize, DataTypes) => {
  const JournalLine = sequelize.define(
    'JournalLine',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      journalId: { type: DataTypes.INTEGER, allowNull: false },
      lineNo: { type: DataTypes.INTEGER, allowNull: false },
      glAccount: { type: DataTypes.STRING(20), allowNull: false },
      debit: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      credit: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      costCenterId: { type: DataTypes.STRING(20) },
      profitCenterId: { type: DataTypes.STRING(20) },
      narration: { type: DataTypes.STRING(255) },
    },
    {
      tableName: 'journal_lines',
      timestamps: false,
    }
  );
  return JournalLine;
};