// backend/src/controllers/qcMasterController.js
import { QCParameter } from "../models/qcParameterModel.js";
import { MaterialQCTemplate } from "../models/materialQcTemplateModel.js";

export const listParameters = async (req, res, next) => {
  try {
    const rows = await QCParameter.list();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getMaterialTemplate = async (req, res, next) => {
  try {
    const materialId = Number(req.params.materialId);
    const rows = await MaterialQCTemplate.listByMaterial(materialId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
