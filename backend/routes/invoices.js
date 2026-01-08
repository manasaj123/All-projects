const express = require("express");
const {
  createInvoice,
  getInvoices,
  markInvoicePaid
} = require("../controllers/invoiceController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createInvoice);
router.get("/", authMiddleware, getInvoices);
router.patch("/:id/pay", authMiddleware, markInvoicePaid);

module.exports = router;
