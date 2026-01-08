import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET /api/collections - Join with names (existing)
router.get("/", (req, res) => {
  const query = `
    SELECT c.*, 
           COALESCE(f.name, cust.name) as partyName,
           COALESCE(f.id, cust.id) as partyId,
           m.name as materialName,
           CASE 
             WHEN f.name IS NOT NULL THEN 'farmer'
             ELSE 'customer'
           END as partyType
    FROM collections c
    LEFT JOIN farmers f ON c.farmerId = f.id
    LEFT JOIN customers cust ON c.customerId = cust.id
    LEFT JOIN materials m ON c.materialId = m.id
    ORDER BY c.id DESC
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error("Collections GET Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// POST /api/collections (existing)
router.post("/", (req, res) => {
  const { partyType, partyId, materialId, qty, mfgDate, expiryDate } = req.body;
  
  console.log("Adding collection:", { partyType, partyId, materialId, qty, mfgDate, expiryDate });
  
  if (partyType === "farmer") {
    db.query(
      "INSERT INTO collections (farmerId, materialId, qty, mfgDate, expiryDate, status) VALUES (?, ?, ?, ?, ?, 'Pending')",
      [partyId, materialId, qty, mfgDate, expiryDate],
      (err, result) => {
        if (err) {
          console.error("Collections Farmer Insert Error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, success: true });
      }
    );
  } else {
    db.query(
      "INSERT INTO collections (customerId, materialId, qty, expiryDate, status) VALUES (?, ?, ?, ?, 'Pending')",
      [partyId, materialId, qty, expiryDate],
      (err, result) => {
        if (err) {
          console.error("Collections Customer Insert Error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, success: true });
      }
    );
  }
});

// 🔹 NEW: PATCH /api/collections/:id - Update status
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`Updating collection ${id} status to:`, status);
  
  db.query(
    "UPDATE collections SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error("Collections Update Error:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json({ success: true, id, status });
    }
  );
});

export default router;
