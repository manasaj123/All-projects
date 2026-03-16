// routes/resultRecordingUsageDecisionRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

const mapRow = r => ({
  id: r.id,
  plantCode: r.plant_code,
  origin: r.origin,
  materialCode: r.material_code,
  batchNumber: r.batch_number,
  vendorCode: r.vendor_code,
  resultText: r.result_summary,
  usageDecision: r.usage_decision,      // UD code, e.g. 'A'
  qualityScore: r.quality_score,        // 100 when UD = 'A'
  isDeleted: !!r.is_deleted,
  deletedAt: r.deleted_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

// GET active
router.get("/raw-material-inspections", (req, res) => {
  const sql =
    "SELECT * FROM raw_material_inspections WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(rows.map(mapRow));
  });
});

// GET recycle bin
router.get("/raw-material-inspections/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM raw_material_inspections WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET raw_material_inspections recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(rows.map(mapRow));
  });
});

// CREATE or UPDATE (by plant+origin+material+batch+vendor)
router.post("/raw-material-inspections", (req, res) => {
  const {
    plantCode,
    materialCode,
    batchNumber,
    vendorCode,
    resultText,
    usageDecision   // UD code entered by user, e.g. 'A'
  } = req.body;

  if (!plantCode || !materialCode || !batchNumber || !vendorCode) {
    return res.status(400).json({
      message:
        "plantCode, materialCode, batchNumber, vendorCode are required"
    });
  }

  const origin = "01";

  // derive quality score from UD code
  let qualityScore = null;
  if (usageDecision === "A") {
    qualityScore = 100;
  } else {
    qualityScore = null; // or 0 if you prefer
  }

  const selectExistingSql = `
    SELECT *
    FROM raw_material_inspections
    WHERE plant_code = ?
      AND origin = ?
      AND material_code = ?
      AND batch_number = ?
      AND vendor_code = ?
      AND is_deleted = 0
  `;

  db.query(
    selectExistingSql,
    [plantCode, origin, materialCode, batchNumber, vendorCode],
    (err, rows) => {
      if (err) {
        console.error(
          "SELECT raw_material_inspections for upsert error:",
          err
        );
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (rows.length > 0) {
        // UPDATE
        const id = rows[0].id;
        const updateSql = `
          UPDATE raw_material_inspections
          SET result_summary = ?, usage_decision = ?, quality_score = ?
          WHERE id = ? AND is_deleted = 0
        `;

        db.query(
          updateSql,
          [resultText || null, usageDecision || null, qualityScore, id],
          (err2) => {
            if (err2) {
              console.error("UPDATE raw_material_inspections error:", err2);
              return res
                .status(500)
                .json({ message: "DB error", error: err2 });
            }

            const selectSql =
              "SELECT * FROM raw_material_inspections WHERE id = ?";
            db.query(selectSql, [id], (err3, rows2) => {
              if (err3) {
                console.error(
                  "SELECT raw_material_inspections after update error:",
                  err3
                );
                return res
                  .status(500)
                  .json({ message: "DB error", error: err3 });
              }

              return res.json(mapRow(rows2[0]));
            });
          }
        );
      } else {
        // INSERT
        const insertSql = `
          INSERT INTO raw_material_inspections
            (plant_code, origin, material_code, batch_number,
             vendor_code, result_summary, usage_decision, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            plantCode,
            origin,
            materialCode,
            batchNumber,
            vendorCode,
            resultText || null,
            usageDecision || null,
            qualityScore
          ],
          (err2, result) => {
            if (err2) {
              console.error("INSERT raw_material_inspections error:", err2);
              return res
                .status(500)
                .json({ message: "DB error", error: err2 });
            }

            const selectSql =
              "SELECT * FROM raw_material_inspections WHERE id = ?";
            db.query(selectSql, [result.insertId], (err3, rows2) => {
              if (err3) {
                console.error(
                  "SELECT raw_material_inspections after insert error:",
                  err3
                );
                return res
                  .status(500)
                  .json({ message: "DB error", error: err3 });
              }

              return res.status(201).json(mapRow(rows2[0]));
            });
          }
        );
      }
    }
  );
});

// SOFT DELETE
router.delete("/raw-material-inspections/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE raw_material_inspections
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("SOFT DELETE raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or already deleted" });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

// RESTORE
router.post("/raw-material-inspections/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE raw_material_inspections
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("RESTORE raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or not in recycle bin" });
    }

    const selectSql =
      "SELECT * FROM raw_material_inspections WHERE id = ?";
    db.query(selectSql, [id], (err2, rows) => {
      if (err2) {
        console.error(
          "SELECT raw_material_inspections after restore error:",
          err2
        );
        return res
          .status(500)
          .json({ message: "DB error", error: err2 });
      }

      res.json(mapRow(rows[0]));
    });
  });
});

// HARD DELETE
router.delete("/raw-material-inspections/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM raw_material_inspections WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("HARD DELETE raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or not in recycle bin" });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
