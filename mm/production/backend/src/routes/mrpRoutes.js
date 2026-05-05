const express = require('express');
const router = express.Router();
const controller = require('../controllers/mrpController');

router.get('/', controller.getRequirements);  // Add this line
router.post('/run', controller.run);

module.exports = router;