const express = require('express');
const router = express.Router();
const fixedAssetController = require('../controllers/fixedAssetController');

router.get('/fixed-assets', fixedAssetController.listAssets);
router.post('/fixed-assets', fixedAssetController.createAsset);

module.exports = router;