-- Create database
CREATE DATABASE IF NOT EXISTS fico_accounting
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fico_accounting;

-- Optional: create an app user (adjust password as needed)
-- Comment this section if you already have a DB user.
-- CREATE USER 'fico_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
-- GRANT ALL PRIVILEGES ON fico_accounting.* TO 'fico_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Users table (matches models/User.js)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','ACCOUNTANT','AUDITOR','VIEWER') DEFAULT 'ACCOUNTANT',
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Cost centers
CREATE TABLE IF NOT EXISTS cost_centers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Profit centers
CREATE TABLE IF NOT EXISTS profit_centers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Invoices (AR/AP)
CREATE TABLE IF NOT EXISTS invoices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('AR','AP') NOT NULL,
  partyName VARCHAR(160) NOT NULL,
  partyGSTIN VARCHAR(20),
  date DATE NOT NULL,
  dueDate DATE,
  baseAmount DECIMAL(15,2) NOT NULL,
  gstRate DECIMAL(5,2) DEFAULT 0,
  gstAmount DECIMAL(15,2) DEFAULT 0,
  tdsRate DECIMAL(5,2) DEFAULT 0,
  tdsAmount DECIMAL(15,2) DEFAULT 0,
  totalAmount DECIMAL(15,2) NOT NULL,
  balanceAmount DECIMAL(15,2) NOT NULL,
  status ENUM('DRAFT','POSTED','PARTLY_PAID','PAID','CANCELLED') DEFAULT 'DRAFT',
  createdBy INT UNSIGNED NOT NULL,
  costCenterId INT UNSIGNED,
  profitCenterId INT UNSIGNED,
  narration VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_user FOREIGN KEY (createdBy) REFERENCES users(id),
  CONSTRAINT fk_invoice_cost_center FOREIGN KEY (costCenterId) REFERENCES cost_centers(id),
  CONSTRAINT fk_invoice_profit_center FOREIGN KEY (profitCenterId) REFERENCES profit_centers(id)
) ENGINE=InnoDB;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  paymentNumber VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('RECEIPT','PAYMENT') NOT NULL,
  invoiceId INT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  mode ENUM('CASH','BANK_TRANSFER','CHEQUE','UPI','CARD') NOT NULL,
  bankAccountCode VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  tdsAmount DECIMAL(15,2) DEFAULT 0,
  referenceNumber VARCHAR(100),
  remarks VARCHAR(255),
  reconciled TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_invoice FOREIGN KEY (invoiceId) REFERENCES invoices(id)
) ENGINE=InnoDB;

-- Bank statements
CREATE TABLE IF NOT EXISTS bank_statements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bankName VARCHAR(120) NOT NULL,
  accountNumber VARCHAR(40) NOT NULL,
  statementDate DATE NOT NULL,
  txnDate DATE NOT NULL,
  description VARCHAR(255),
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) DEFAULT 0,
  matchedPaymentId INT UNSIGNED,
  matched TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bank_statement_payment FOREIGN KEY (matchedPaymentId) REFERENCES payments(id)
) ENGINE=InnoDB;

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  vendorName VARCHAR(160) NOT NULL,
  description VARCHAR(255),
  accountCode VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  gstRate DECIMAL(5,2) DEFAULT 0,
  gstAmount DECIMAL(15,2) DEFAULT 0,
  tdsRate DECIMAL(5,2) DEFAULT 0,
  tdsAmount DECIMAL(15,2) DEFAULT 0,
  totalAmount DECIMAL(15,2) NOT NULL,
  costCenterId INT UNSIGNED,
  profitCenterId INT UNSIGNED,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_cost_center FOREIGN KEY (costCenterId) REFERENCES cost_centers(id),
  CONSTRAINT fk_expense_profit_center FOREIGN KEY (profitCenterId) REFERENCES profit_centers(id)
) ENGINE=InnoDB;

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  accountCode VARCHAR(20) NOT NULL,
  costCenterId INT UNSIGNED,
  profitCenterId INT UNSIGNED,
  budgetAmount DECIMAL(15,2) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_budget (year, month, accountCode, costCenterId, profitCenterId),
  CONSTRAINT fk_budget_cost_center FOREIGN KEY (costCenterId) REFERENCES cost_centers(id),
  CONSTRAINT fk_budget_profit_center FOREIGN KEY (profitCenterId) REFERENCES profit_centers(id)
) ENGINE=InnoDB;

-- Ledger
CREATE TABLE IF NOT EXISTS ledger (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  accountCode VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  referenceType ENUM('INVOICE','PAYMENT','EXPENSE','BANK','OPENING','ADJUSTMENT'),
  referenceNumber VARCHAR(50),
  invoiceId INT UNSIGNED,
  paymentId INT UNSIGNED,
  expenseId INT UNSIGNED,
  bankStatementId BIGINT UNSIGNED,
  costCenterId INT UNSIGNED,
  profitCenterId INT UNSIGNED,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ledger_invoice FOREIGN KEY (invoiceId) REFERENCES invoices(id),
  CONSTRAINT fk_ledger_payment FOREIGN KEY (paymentId) REFERENCES payments(id),
  CONSTRAINT fk_ledger_expense FOREIGN KEY (expenseId) REFERENCES expenses(id),
  CONSTRAINT fk_ledger_bank_statement FOREIGN KEY (bankStatementId) REFERENCES bank_statements(id),
  CONSTRAINT fk_ledger_cost_center FOREIGN KEY (costCenterId) REFERENCES cost_centers(id),
  CONSTRAINT fk_ledger_profit_center FOREIGN KEY (profitCenterId) REFERENCES profit_centers(id)
) ENGINE=InnoDB;

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entityId VARCHAR(50),
  details JSON,
  ipAddress VARCHAR(60),
  userAgent VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

-- Seed data --------------------------------------------------

-- Admin user (password: Admin@123) – bcrypt hash for that password:
-- You can replace with your own hash from your Node environment if needed.
INSERT INTO users (name, email, passwordHash, role, isActive)
VALUES
('Admin', 'admin@fico.local', '$2a$10$VdYw.xPjV8/yx2J2uQ7Aeubj8t3o5Q8aHcM8vHphhS2m4GkLqGJOK', 'ADMIN', 1)
ON DUPLICATE KEY UPDATE email=email;

-- Some default cost centers
INSERT INTO cost_centers (code, name, description, isActive)
VALUES
('CC-ADMIN', 'Administration', 'Admin & overhead', 1),
('CC-MFG', 'Manufacturing', 'Production', 1),
('CC-SALES', 'Sales', 'Sales & marketing', 1)
ON DUPLICATE KEY UPDATE code=code;

-- Some default profit centers
INSERT INTO profit_centers (code, name, description, isActive)
VALUES
('PC-DOM', 'Domestic', 'Domestic business', 1),
('PC-EXP', 'Export', 'Export business', 1)
ON DUPLICATE KEY UPDATE code=code;

-- Optionally, you can pre-load a small sample AR invoice (comment out if not desired)

-- Example AR invoice and its ledger would normally be created via the app
-- so that all double-entry logic in controllers runs correctly.


CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('INCOME','EXPENSE') NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE ledger
  ADD COLUMN projectId INT NULL,
  ADD CONSTRAINT fk_ledger_project
    FOREIGN KEY (projectId) REFERENCES projects(id);

CREATE TABLE gl_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,              -- Account ID
  glCode VARCHAR(20) NOT NULL UNIQUE,             -- G/L Account
  name VARCHAR(255) NOT NULL,                     -- Account name (extra, useful)
  companyCode VARCHAR(10) NOT NULL,               -- Company Code
  accountController VARCHAR(100),                 -- Account Controller
  accountCurrency VARCHAR(10) NOT NULL,           -- Account Currency
  taxCategory VARCHAR(50),                        -- Tax Category
  reconciliationType ENUM('NONE','CUSTOMER','VENDOR') DEFAULT 'NONE', -- Recon acct type
  altAccountNumber VARCHAR(50),                   -- Alternative Account Number
  toleranceGroup VARCHAR(50),                     -- Tolerance Group
  fieldStatusGroup VARCHAR(50),                   -- Field Status Group
  planningLevel VARCHAR(50),                      -- Planning Level
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE journal_headers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documentNumber VARCHAR(20) NOT NULL UNIQUE,
  documentDate DATE NOT NULL,
  postingDate DATE NOT NULL,
  documentType VARCHAR(4) NOT NULL,
  reference VARCHAR(50),
  headerText VARCHAR(255),
  companyCode VARCHAR(10) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'POSTED',
  createdBy VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE journal_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journalId INT NOT NULL,
  lineNo INT NOT NULL,
  glAccount VARCHAR(20) NOT NULL,
  debit DECIMAL(18,2) NOT NULL DEFAULT 0,
  credit DECIMAL(18,2) NOT NULL DEFAULT 0,
  costCenterId VARCHAR(20),
  profitCenterId VARCHAR(20),
  narration VARCHAR(255),
  FOREIGN KEY (journalId) REFERENCES journal_headers(id)
) ENGINE=InnoDB;


CREATE TABLE acc_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documentNumber VARCHAR(20) NOT NULL,
  companyCode   VARCHAR(10) NOT NULL,
  fiscalYear    INT NOT NULL,
  documentDate  DATE NOT NULL,
  postingDate   DATE NOT NULL,
  period        TINYINT NOT NULL,
  reference     VARCHAR(50),
  crossCompNumber VARCHAR(20),
  currency      VARCHAR(3) NOT NULL,
  text          VARCHAR(255),
  ledgerGroup   VARCHAR(10),
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE vendor_customer_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mode ENUM('VENDOR','CUSTOMER') NOT NULL,
  postingDate DATE NOT NULL,
  documentDate DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(50),
  businessPlace VARCHAR(30),
  text VARCHAR(255),
  baselineDate DATE,
  vendorCode VARCHAR(20),
  sectionCode VARCHAR(20),
  customerCode VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE vendor_customer_invoice_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL,
  glAccount VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  taxCode VARCHAR(10),
  assignment VARCHAR(50),
  lineText VARCHAR(255),
  costCenter VARCHAR(20),
  hsnCode VARCHAR(20),
  FOREIGN KEY (invoiceId) REFERENCES vendor_customer_invoices(id)
);