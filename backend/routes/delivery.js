const express = require("express");
const {
  createDelivery,
  updateDeliveryStatus,
  getDeliveries
} = require("../controllers/deliveryController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createDelivery);
router.patch("/:id/status", authMiddleware, updateDeliveryStatus);
router.get("/", authMiddleware, getDeliveries);

module.exports = router;
