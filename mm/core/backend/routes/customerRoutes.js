import express from "express";
import { addCustomer, getCustomers } from "../controllers/customerController.js";

const router = express.Router();


router.post("/", addCustomer);
router.get("/", getCustomers);

export const getCustomerCount = (req, res) => {
  db.query("SELECT COUNT(*) as count FROM customers", (err, result) => {
    if (err) {
      console.error("Customer count error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: result[0].count });
  });
};


export default router;
