const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById
} = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
