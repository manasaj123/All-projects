// backend/src/controllers/vendorCustomerInvoiceController.js
const db = require('../config/db');
const {
  VendorCustomerInvoice,
  VendorCustomerInvoiceLine,
  sequelize,
} = db;

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { mode, header, lineItem } = req.body;

    const invoice = await VendorCustomerInvoice.create(
      {
        mode,
        postingDate: header.postingDate,
        documentDate: header.documentDate,
        amount: header.amount,
        reference: header.reference,
        businessPlace: header.businessPlace,
        text: header.text,
        baselineDate: header.baselineDate,
        vendorCode: header.vendorCode,
        sectionCode: header.sectionCode,
        customerCode: header.customerCode,
      },
      { transaction: t }
    );

    await VendorCustomerInvoiceLine.create(
      {
        invoiceId: invoice.id,
        glAccount: lineItem.glAccount,
        amount: lineItem.amount,
        taxCode: lineItem.taxCode,
        assignment: lineItem.assignment,
        lineText: lineItem.text,
        costCenter: lineItem.costCenter,
        hsnCode: lineItem.hsnCode,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(invoice);
  } catch (err) {
    await t.rollback();
    console.error('VC invoice create error', err);
    res.status(500).json({ message: 'Failed to create vendor/customer invoice' });
  }
};

exports.list = async (req, res) => {
  try {
    const rows = await VendorCustomerInvoice.findAll({
      include: [{ model: VendorCustomerInvoiceLine, as: 'lines' }],
      order: [['id', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('VC invoice list error', err);
    res
      .status(500)
      .json({ message: 'Failed to load vendor/customer invoices' });
  }
};