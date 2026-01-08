const express = require("express");
const { salesByCustomer, salesByRegion } = require("../controllers/reportController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/customer", authMiddleware, salesByCustomer);
router.get("/region", authMiddleware, salesByRegion);

module.exports = router;
