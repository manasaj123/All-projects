const { Invoice, Order } = require("../models");

// create invoice from order items (amount)
exports.createInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const items = order.items || [];
    const amount = items.reduce(
      (sum, it) => sum + it.quantity * it.price,
      0
    );

    const invoice = await Invoice.create({
      orderId: order.id,
      amount
    });

    order.status = "INVOICED";
    await order.save();

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// list invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ include: Order });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// mark invoice as PAID
exports.markInvoicePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "PAID";
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
