// backend/src/controllers/accDocumentController.js
const db = require('../config/db');
const { sequelize } = db;
const { Op } = require('sequelize');

const AccDocument = db.AccDocument;

// simple doc number
const generateDocNumber = async (companyCode, fiscalYear) => {
  const prefix = `ACC${fiscalYear}-`;

  // get last document for this company + year ordered by documentNumber descending
  const lastDoc = await AccDocument.findOne({
    where: { companyCode, fiscalYear },
    order: [['documentNumber', 'DESC']],
    attributes: ['documentNumber'],
  });

  let nextSeq = 1;

  if (lastDoc && lastDoc.documentNumber && lastDoc.documentNumber.startsWith(prefix)) {
    const lastStr = lastDoc.documentNumber.slice(prefix.length); // e.g. "000012"
    const lastNum = parseInt(lastStr, 10);
    if (!Number.isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = nextSeq.toString().padStart(6, '0');
  return `${prefix}${seqStr}`;
};

// GET /api/acc-documents
exports.list = async (req, res) => {
  try {
    const rows = await AccDocument.findAll({
      order: [['postingDate', 'DESC'], ['id', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('AccDocument list error', err);
    res.status(500).json({ message: 'Failed to load documents' });
  }
};

// POST /api/acc-documents
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      companyCode,
      fiscalYear,
      documentDate,
      postingDate,
      period,
      documentType,
      reference,
      referenceTransaction,
      referenceKey,
      crossCompNumber,
      currency,
      text,
      ledgerGroup,
      logicalSystem,
    } = req.body;

    if (!companyCode || !fiscalYear || !documentDate || !postingDate) {
      return res
        .status(400)
        .json({ message: 'Company code, fiscal year, document and posting date are required' });
    }

    const posting = new Date(postingDate);
    const periodVal = period || posting.getMonth() + 1;

    const documentNumber = await generateDocNumber(companyCode, fiscalYear);

    const header = await AccDocument.create(
      {
        documentNumber,
        companyCode,
        fiscalYear,
        documentDate,
        postingDate,
        entryDate: new Date(),
        period: periodVal,
        documentType: documentType || null,
        reference: reference || '',
        referenceTransaction: referenceTransaction || '',
        referenceKey: referenceKey || '',
        crossCompNumber: crossCompNumber || '',
        currency: currency || 'INR',
        text: text || '',
        ledgerGroup: ledgerGroup || '',
        logicalSystem: logicalSystem || '',
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ id: header.id, documentNumber });
  } catch (err) {
    await t.rollback();
    console.error('AccDocument create error', err);
    res.status(500).json({ message: 'Failed to post document' });
  }
};

// GET /api/acc-documents/search
exports.search = async (req, res) => {
  try {
    const q = req.query;
    const where = {};

    // Company code range
    if (q.companyCodeFrom && q.companyCodeTo) {
      where.companyCode = { [Op.between]: [q.companyCodeFrom, q.companyCodeTo] };
    } else if (q.companyCodeFrom) {
      where.companyCode = { [Op.gte]: q.companyCodeFrom };
    } else if (q.companyCodeTo) {
      where.companyCode = { [Op.lte]: q.companyCodeTo };
    }

    // Document number range
    if (q.documentNumberFrom && q.documentNumberTo) {
      where.documentNumber = {
        [Op.between]: [q.documentNumberFrom, q.documentNumberTo],
      };
    } else if (q.documentNumberFrom) {
      where.documentNumber = { [Op.gte]: q.documentNumberFrom };
    } else if (q.documentNumberTo) {
      where.documentNumber = { [Op.lte]: q.documentNumberTo };
    }

    // Fiscal year range
    if (q.fiscalYearFrom && q.fiscalYearTo) {
      where.fiscalYear = {
        [Op.between]: [Number(q.fiscalYearFrom), Number(q.fiscalYearTo)],
      };
    } else if (q.fiscalYearFrom) {
      where.fiscalYear = { [Op.gte]: Number(q.fiscalYearFrom) };
    } else if (q.fiscalYearTo) {
      where.fiscalYear = { [Op.lte]: Number(q.fiscalYearTo) };
    }

    // Posting date range
    if (q.postingDateFrom && q.postingDateTo) {
      where.postingDate = {
        [Op.between]: [q.postingDateFrom, q.postingDateTo],
      };
    } else if (q.postingDateFrom) {
      where.postingDate = { [Op.gte]: q.postingDateFrom };
    } else if (q.postingDateTo) {
      where.postingDate = { [Op.lte]: q.postingDateTo };
    }

    const rows = await AccDocument.findAll({
      where,
      order: [['postingDate', 'DESC'], ['id', 'DESC']],
    });

    res.json(rows);
  } catch (err) {
    console.error('AccDocument search error', err);
    res.status(500).json({ message: 'Failed to search documents' });
  }
};