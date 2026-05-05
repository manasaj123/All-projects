const { Sequelize, DataTypes } = require('sequelize');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_DIALECT
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 3306,
  dialect: DB_DIALECT || 'mysql',
  logging: false
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
db.User = require('../models/User')(sequelize, DataTypes);
db.CostCenter = require('../models/CostCenter')(sequelize, DataTypes);
db.ProfitCenter = require('../models/ProfitCenter')(sequelize, DataTypes);
db.Ledger = require('../models/Ledger')(sequelize, DataTypes);
db.Invoice = require('../models/Invoice')(sequelize, DataTypes);
db.Payment = require('../models/Payment')(sequelize, DataTypes);
db.BankStatement = require('../models/BankStatement')(sequelize, DataTypes);
db.Budget = require('../models/Budget')(sequelize, DataTypes);
db.Expense = require('../models/Expense')(sequelize, DataTypes);
db.Audit = require('../models/Audit')(sequelize, DataTypes);
db.JournalHeader = require('../models/JournalHeader')(sequelize, DataTypes);
db.JournalLine = require('../models/JournalLine')(sequelize, DataTypes);

db.GLAccount = require('../models/GlAccount')(sequelize, DataTypes);
db.AccDocument = require('../models/AccDocument')(sequelize, DataTypes);

// ✅ NEW: Fixed Asset model
db.FixedAsset = require('../models/fixedAsset')(sequelize, DataTypes);

db.VendorCustomerInvoice = require('../models/VendorCustomerInvoice')(sequelize, DataTypes);
db.VendorCustomerInvoiceLine = require('../models/VendorCustomerInvoiceLine')(sequelize, DataTypes);

// Associations
db.User.hasMany(db.Invoice, { foreignKey: 'createdBy' });
db.Invoice.belongsTo(db.User, { foreignKey: 'createdBy' });

db.CostCenter.hasMany(db.Invoice, { foreignKey: 'costCenterId' });
db.Invoice.belongsTo(db.CostCenter, { foreignKey: 'costCenterId' });

db.ProfitCenter.hasMany(db.Invoice, { foreignKey: 'profitCenterId' });
db.Invoice.belongsTo(db.ProfitCenter, { foreignKey: 'profitCenterId' });

db.CostCenter.hasMany(db.Expense, { foreignKey: 'costCenterId' });
db.Expense.belongsTo(db.CostCenter, { foreignKey: 'costCenterId' });

db.ProfitCenter.hasMany(db.Expense, { foreignKey: 'profitCenterId' });
db.Expense.belongsTo(db.ProfitCenter, { foreignKey: 'profitCenterId' });

db.Invoice.hasMany(db.Ledger, { foreignKey: 'invoiceId' });
db.Ledger.belongsTo(db.Invoice, { foreignKey: 'invoiceId' });

db.Payment.hasMany(db.Ledger, { foreignKey: 'paymentId' });
db.Ledger.belongsTo(db.Payment, { foreignKey: 'paymentId' });

db.Expense.hasMany(db.Ledger, { foreignKey: 'expenseId' });
db.Ledger.belongsTo(db.Expense, { foreignKey: 'expenseId' });

db.BankStatement.hasMany(db.Ledger, { foreignKey: 'bankStatementId' });
db.Ledger.belongsTo(db.BankStatement, { foreignKey: 'bankStatementId' });

db.Invoice.hasMany(db.Payment, { foreignKey: 'invoiceId' });
db.Payment.belongsTo(db.Invoice, { foreignKey: 'invoiceId' });

db.Budget.belongsTo(db.CostCenter, { foreignKey: 'costCenterId' });
db.CostCenter.hasMany(db.Budget, { foreignKey: 'costCenterId' });

db.Budget.belongsTo(db.ProfitCenter, { foreignKey: 'profitCenterId' });
db.ProfitCenter.hasMany(db.Budget, { foreignKey: 'profitCenterId' });

// Existing associations above...

db.CostCenter.hasMany(db.Ledger, { foreignKey: 'costCenterId' });
db.Ledger.belongsTo(db.CostCenter, { foreignKey: 'costCenterId' });

db.ProfitCenter.hasMany(db.Ledger, { foreignKey: 'profitCenterId' });
db.Ledger.belongsTo(db.ProfitCenter, { foreignKey: 'profitCenterId' });

db.User.hasMany(db.Audit, { foreignKey: 'userId' });
db.Audit.belongsTo(db.User, { foreignKey: 'userId' });

db.JournalHeader.hasMany(db.JournalLine, { foreignKey: 'journalId', as: 'lines' });
db.JournalLine.belongsTo(db.JournalHeader, { foreignKey: 'journalId', as: 'header' });

db.Category = require('../models/Category')(sequelize, DataTypes);
db.Project = require('../models/Project')(sequelize, DataTypes);



if (db.VendorCustomerInvoice && db.VendorCustomerInvoiceLine) {
  db.VendorCustomerInvoice.hasMany(db.VendorCustomerInvoiceLine, {
    as: 'lines',
    foreignKey: 'invoiceId',
  });
  db.VendorCustomerInvoiceLine.belongsTo(db.VendorCustomerInvoice, {
    as: 'invoice',
    foreignKey: 'invoiceId',
  });
}
module.exports = db;