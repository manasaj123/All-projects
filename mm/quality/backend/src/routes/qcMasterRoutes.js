import express from "express";
import {
  listParameters,
  getMaterialTemplate,
  saveMaterialTemplate,
  listAllTemplates  // Add this import
} from "../controllers/qcMasterController.js";

const router = express.Router();

router.get("/parameters", listParameters);
router.get("/templates", listAllTemplates);  // This must come BEFORE /templates/:materialId
router.get("/templates/:materialId", getMaterialTemplate);
router.post("/templates/:materialId", saveMaterialTemplate);

export default router;