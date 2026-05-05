// backend/src/routes/vendorCustomerInvoiceRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendorCustomerInvoiceController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);

router.get('/', role('ADMIN', 'ACCOUNTANT'), controller.list);
router.post('/', role('ADMIN', 'ACCOUNTANT'), controller.create);

module.exports = router;