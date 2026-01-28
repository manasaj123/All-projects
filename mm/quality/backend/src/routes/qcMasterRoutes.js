// backend/src/routes/qcMasterRoutes.js
import express from "express";
import {
  listParameters,
  getMaterialTemplate
} from "../controllers/qcMasterController.js";

const router = express.Router();

router.get("/parameters", listParameters);
router.get("/templates/:materialId", getMaterialTemplate);

export default router;
