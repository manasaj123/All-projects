// backend/src/models/materialQcTemplateModel.js
import db from "../config/db.js";

export const MaterialQCTemplate = {
  async listByMaterial(materialId) {
    const [rows] = await db.query(
      `SELECT t.*, qp.name AS parameter_name
       FROM material_qc_templates t
       JOIN qc_parameters qp ON qp.id = t.parameter_id
       WHERE t.material_id = ?
       ORDER BY qp.sort_order, qp.id`,
      [materialId]
    );
    return rows;
  }
};
export default MaterialQCTemplate;