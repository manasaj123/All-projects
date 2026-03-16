// inspection/backend/src/routes/inspectionLotRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

/* GET ACTIVE INSPECTION LOTS */
router.get("/inspection-lots", (req, res) => {
  const sql =
    "SELECT * FROM inspection_lots WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET inspection_lots error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      selectionProfile: r.selection_profile,
      lotCreatedFrom: r.lot_created_from,
      lotCreatedTo: r.lot_created_to,
      inspStartFrom: r.insp_start_from,
      inspStartTo: r.insp_start_to,
      inspectionEndFrom: r.inspection_end_from,
      inspectionEndTo: r.inspection_end_to,
      plant: r.plant,
      lotOrigin: r.lot_origin,
      material: r.material,
      batch: r.batch,
      vendor: r.vendor,
      manufacturer: r.manufacturer,
      customer: r.customer,
      materialClass: r.material_class,
      maxHits: r.max_hits,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* GET RECYCLE BIN */
router.get("/inspection-lots/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM inspection_lots WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET inspection_lots recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      selectionProfile: r.selection_profile,
      lotCreatedFrom: r.lot_created_from,
      lotCreatedTo: r.lot_created_to,
      inspStartFrom: r.insp_start_from,
      inspStartTo: r.insp_start_to,
      inspectionEndFrom: r.inspection_end_from,
      inspectionEndTo: r.inspection_end_to,
      plant: r.plant,
      lotOrigin: r.lot_origin,
      material: r.material,
      batch: r.batch,
      vendor: r.vendor,
      manufacturer: r.manufacturer,
      customer: r.customer,
      materialClass: r.material_class,
      maxHits: r.max_hits,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* CREATE */
router.post("/inspection-lots", (req, res) => {
  const {
    selectionProfile,
    lotCreatedFrom,
    lotCreatedTo,
    inspStartFrom,
    inspStartTo,
    inspectionEndFrom,
    inspectionEndTo,
    plant,
    lotOrigin,
    material,
    batch,
    vendor,
    manufacturer,
    customer,
    materialClass,
    maxHits
  } = req.body;

  const sql = `
    INSERT INTO inspection_lots
      (selection_profile, lot_created_from, lot_created_to,
       insp_start_from, insp_start_to,
       inspection_end_from, inspection_end_to,
       plant, lot_origin, material, batch,
       vendor, manufacturer, customer, material_class, max_hits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      selectionProfile || null,
      lotCreatedFrom || null,
      lotCreatedTo || null,
      inspStartFrom || null,
      inspStartTo || null,
      inspectionEndFrom || null,
      inspectionEndTo || null,
      plant || null,
      lotOrigin || null,
      material || null,
      batch || null,
      vendor || null,
      manufacturer || null,
      customer || null,
      materialClass || null,
      maxHits || null
    ],
    (err) => {
      if (err) {
        console.error("INSERT inspection_lots error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      res.status(201).json({ message: "Inspection lot created" });
    }
  );
});

/* UPDATE */
router.put("/inspection-lots/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    selectionProfile,
    lotCreatedFrom,
    lotCreatedTo,
    inspStartFrom,
    inspStartTo,
    inspectionEndFrom,
    inspectionEndTo,
    plant,
    lotOrigin,
    material,
    batch,
    vendor,
    manufacturer,
    customer,
    materialClass,
    maxHits
  } = req.body;

  const sql = `
    UPDATE inspection_lots
    SET selection_profile = ?,
        lot_created_from = ?,
        lot_created_to = ?,
        insp_start_from = ?,
        insp_start_to = ?,
        inspection_end_from = ?,
        inspection_end_to = ?,
        plant = ?, lot_origin = ?, material = ?,
        batch = ?, vendor = ?, manufacturer = ?,
        customer = ?, material_class = ?, max_hits = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      selectionProfile || null,
      lotCreatedFrom || null,
      lotCreatedTo || null,
      inspStartFrom || null,
      inspStartTo || null,
      inspectionEndFrom || null,
      inspectionEndTo || null,
      plant || null,
      lotOrigin || null,
      material || null,
      batch || null,
      vendor || null,
      manufacturer || null,
      customer || null,
      materialClass || null,
      maxHits || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE inspection_lots error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json({ message: "Inspection lot updated" });
    }
  );
});

/* SOFT DELETE */
router.delete("/inspection-lots/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE inspection_lots
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("SOFT DELETE inspection_lots error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

/* RESTORE */
router.post("/inspection-lots/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE inspection_lots
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("RESTORE inspection_lots error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Restored successfully" });
  });
});

/* HARD DELETE */
router.delete("/inspection-lots/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM inspection_lots WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("HARD DELETE inspection_lots error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
