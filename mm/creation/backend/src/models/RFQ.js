// backend/src/models/RFQ.js
import db from "../config/db.js";

export const RFQ = {
  findAll() {
    return db.query(
      `SELECT 
         h.*, 
         COUNT(i.id) AS item_count,
         COALESCE(SUM(i.qty), 0) AS total_qty
       FROM rfq_headers h
       LEFT JOIN rfq_items i ON h.id = i.rfq_id
       GROUP BY h.id
       ORDER BY h.id DESC`
    );
  },

  findByIdHeader(id) {
    return db.query(
      `SELECT 
         h.*, 
         COUNT(i.id) AS item_count,
         COALESCE(SUM(i.qty), 0) AS total_qty
       FROM rfq_headers h
       LEFT JOIN rfq_items i ON h.id = i.rfq_id
       WHERE h.id = ?
       GROUP BY h.id`,
      [id]
    );
  },

  findItemsByRFQ(id) {
    return db.query(
      `SELECT * FROM rfq_items WHERE rfq_id = ?`,
      [id]
    );
  }
};
