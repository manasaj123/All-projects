const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/', billingController.getBillings);
router.get('/deleted', billingController.getDeletedBillings);
router.get('/:id', billingController.getBillingById);
router.post('/', billingController.createBilling);
router.put('/:id', billingController.updateBilling);
router.delete('/:id', billingController.softDeleteBilling);
router.put('/:id/restore', billingController.restoreBilling);

module.exports = router;
