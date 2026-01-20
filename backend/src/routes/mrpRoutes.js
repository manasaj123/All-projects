const express = require('express');
const router = express.Router();
const controller = require('../controllers/mrpController');

router.post('/run', controller.run);

module.exports = router;
