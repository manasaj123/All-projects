const db = require('../config/db');
const { GRIRClearing, Ledger } = db;

// controllers/grirClearingController.js
exports.createGrirEntry = async (req, res, next) => {
  try {
    const {
      poNumber,
      invoiceNumber,
      amount,
      clearedAmount,
      status,
      grDate,
      invoiceDate,
      vendorName
    } = req.body;

    const entry = await GRIRClearing.create({
      poNumber,
      invoiceNumber,
      amount,
      clearedAmount,
      status,
      grDate,
      invoiceDate,
      vendorName,
      createdBy: req.user.id
    });

    const GRIR_ACCOUNT = '210004';
    const INVENTORY_ACCOUNT = '120001';
    const AP_ACCOUNT = '200001';

    // GR Entry (Goods Receipt)
    await db.Ledger.bulkCreate([
      {
        date: grDate, // MUST be present
        accountCode: INVENTORY_ACCOUNT,
        description: `GR for PO ${poNumber}`,
        debit: amount,
        credit: 0,
        referenceType: 'GRIR',
        referenceNumber: entry.id,
        grirId: entry.id
      },
      {
        date: grDate, // MUST be present
        accountCode: GRIR_ACCOUNT,
        description: `GR/IR for PO ${poNumber}`,
        debit: 0,
        credit: amount,
        referenceType: 'GRIR',
        referenceNumber: entry.id,
        grirId: entry.id
      }
    ]);

    if (clearedAmount > 0) {
      await db.Ledger.bulkCreate([
        {
          date: invoiceDate, // MUST be present
          accountCode: GRIR_ACCOUNT,
          description: `IR clearing for PO ${poNumber}`,
          debit: clearedAmount,
          credit: 0,
          referenceType: 'GRIR',
          referenceNumber: entry.id,
          grirId: entry.id
        },
        {
          date: invoiceDate, // MUST be present
          accountCode: AP_ACCOUNT,
          description: `Vendor invoice ${invoiceNumber} vs PO ${poNumber}`,
          debit: 0,
          credit: clearedAmount,
          referenceType: 'GRIR',
          referenceNumber: entry.id,
          grirId: entry.id
        }
      ]);
    }

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// controllers/grirClearingController.js
exports.listGrirEntries = async (req, res) => {
  try {
    const entries = await GRIRClearing.findAll({
      order: [['grDate', 'DESC']]
    });
    res.json(entries);
  } catch (err) {
    console.error('GRIR list error:', err);   // add this
    res.status(500).json({ message: err.message });
  }
};