// backend/src/routes/qcLotRoutes.js
import express from "express";
import {
  listLots,
  getLotDetail,
  createLot,
  recordResults
} from "../controllers/qcLotController.js";

const router = express.Router();

router.get("/", listLots);              
router.get("/:id", getLotDetail);
router.post("/", createLot);
router.post("/:id/results", recordResults);

export default router;
