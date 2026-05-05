const express = require('express');
const router = express.Router();
const profitAnalysisController = require('../controllers/profitAnalysisController');

router.get('/profit-analysis', profitAnalysisController.getProfitAnalysis);

module.exports = router;