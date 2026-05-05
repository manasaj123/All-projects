const express = require('express');
const router = express.Router();
const controller = require('../controllers/glAccountController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);

router.get('/', role('ADMIN', 'ACCOUNTANT'), controller.list);
router.post('/', role('ADMIN', 'ACCOUNTANT'), controller.create);
router.put('/:id', role('ADMIN', 'ACCOUNTANT'), controller.update);
router.delete('/:id', role('ADMIN'), controller.remove);

module.exports = router;