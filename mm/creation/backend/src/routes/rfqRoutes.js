import express from "express";
import {
  getRFQs,
  createRFQ,
  getRFQById,
  updateRFQ,
  deleteRFQ
} from "../controllers/rfqController.js";

const router = express.Router();

router.get("/", getRFQs);
router.post("/", createRFQ);
router.get("/:id", getRFQById);
router.put("/:id", updateRFQ);
router.delete("/:id", deleteRFQ);

export default router;
