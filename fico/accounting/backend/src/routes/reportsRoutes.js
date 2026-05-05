const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportsController');

router.get('/trial-balance', controller.getTrialBalance);
router.get('/profit-loss', controller.getProfitLoss);
router.get('/outstanding', controller.getPartyOutstanding);

module.exports = router;