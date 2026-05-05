const db = require('../config/db');

// Trial Balance
exports.getTrialBalance = async (req, res) => {
  const [rows] = await db.query(`
    SELECT g.account_name,
           SUM(j.debit) AS total_debit,
           SUM(j.credit) AS total_credit
    FROM journal_entries j
    JOIN gl_accounts g ON j.account_id = g.id
    GROUP BY g.account_name
  `);

  res.json(rows);
};

// Profit & Loss
exports.getProfitLoss = async (req, res) => {
  const [income] = await db.query(`
    SELECT SUM(credit - debit) AS total_income
    FROM journal_entries j
    JOIN gl_accounts g ON j.account_id = g.id
    WHERE g.type = 'INCOME'
  `);

  const [expense] = await db.query(`
    SELECT SUM(debit - credit) AS total_expense
    FROM journal_entries j
    JOIN gl_accounts g ON j.account_id = g.id
    WHERE g.type = 'EXPENSE'
  `);

  res.json({
    total_income: income[0].total_income || 0,
    total_expense: expense[0].total_expense || 0,
    net_profit: (income[0].total_income || 0) - (expense[0].total_expense || 0)
  });
};

// Outstanding
exports.getPartyOutstanding = async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.name, p.type,
           SUM(j.debit) - SUM(j.credit) AS balance
    FROM journal_entries j
    JOIN parties p ON j.party_id = p.party_id
    GROUP BY p.party_id
  `);

  res.json(rows);
};