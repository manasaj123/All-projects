// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Trial Balance
router.get('/reports/trial-balance', reportController.getTrialBalance);

module.exports = router;