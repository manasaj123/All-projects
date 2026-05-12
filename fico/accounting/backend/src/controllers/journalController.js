// backend/src/controllers/journalController.js
const db = require('../config/db');
const { sequelize } = db;



// models
const JournalHeader = db.JournalHeader;
const JournalLine = db.JournalLine;

console.log('JournalLine attributes:', Object.keys(JournalLine.rawAttributes));

// Generate simple running document number: JR000001, JR000002, ...
const generateDocNumber = async () => {
  const last = await JournalHeader.findOne({
    order: [['id', 'DESC']],
    attributes: ['id'],
  });
  const next = (last ? last.id + 1 : 1).toString().padStart(6, '0');
  return `JR${next}`;
};

// GET /api/journal  -> summary list
exports.list = async (req, res) => {
  try {
    const rows = await JournalHeader.findAll({
      order: [['id', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Journal list error', err);
    res.status(500).json({ message: 'Failed to load journals' });
  }
};

// POST /api/journal  -> create header + lines
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { header, lines } = req.body;

    console.log('Incoming header:', header);
    console.log('Incoming lines:', lines);

    if (!Array.isArray(lines) || !lines.length) {
      return res.status(400).json({ message: 'At least one line required' });
    }

    const totalDebit = lines.reduce(
      (sum, l) => sum + (Number(l.debit) || 0),
      0
    );
    const totalCredit = lines.reduce(
      (sum, l) => sum + (Number(l.credit) || 0),
      0
    );
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ message: 'Debits and credits must be equal' });
    }

    // Extra safety: all lines must have glAccount
    if (
      lines.some(
        (l) =>
          !l.glAccount ||
          !String(l.glAccount).trim()
      )
    ) {
      return res
        .status(400)
        .json({ message: 'G/L account required on all lines' });
    }

    const documentNumber = await generateDocNumber();

    const h = await JournalHeader.create(
      {
        documentNumber,
        documentDate: header.documentDate,
        postingDate: header.postingDate,
        documentType: header.documentType || 'SA',
        reference: header.reference,
        headerText: header.headerText,
        companyCode: header.companyCode,
        status: header.status || 'POSTED',
        createdBy: req.user?.username || 'SYSTEM',
      },
      { transaction: t }
    );

   console.log('Created header id:', h.id);

let lineNo = 10;
for (const l of lines) {
  const payload = {
    journalId: h.id,
    lineNo,
    glAccount: String(l.glAccount).trim(),
    debit: Number(l.debit || 0),
    credit: Number(l.credit || 0),
    costCenterId: l.costCenterId || null,
    profitCenterId: l.profitCenterId || null,
    narration: l.narration || '',
  };
  console.log('JournalLine payload:', payload);

  await JournalLine.create(payload, { transaction: t });
  lineNo += 10;
}

    await t.commit();
    res.status(201).json({ documentNumber });
  } catch (err) {
    await t.rollback();
    console.error('Journal create error', err);
    res.status(500).json({ message: 'Failed to post journal' });
  }
};

// GET /api/journal/:id/lines  -> header + lines
exports.lines = async (req, res) => {
  try {
    const header = await JournalHeader.findByPk(req.params.id);
    if (!header) return res.status(404).json({ message: 'Journal not found' });

    const lines = await JournalLine.findAll({
      where: { journalId: header.id },
      order: [['lineNo', 'ASC']],
    });

    res.json({ header, lines });
  } catch (err) {
    console.error('Journal lines error', err);
    res.status(500).json({ message: 'Failed to load lines' });
  }
};