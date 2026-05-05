import express from "express";
import db from "../config/db.js";

const router = express.Router();

/* =========================
   GET ALL COLLECTIONS
========================= */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      c.id,
      c.farmer_id,
      c.customer_id,
      c.material_id,
      c.qty,
      c.mfg_date,
      c.expiry_date,
      c.status,

      COALESCE(f.name, cust.name) AS partyName,
      m.name AS materialName,

      CASE 
        WHEN c.farmer_id IS NOT NULL THEN 'farmer'
        ELSE 'customer'
      END AS partyType

    FROM collections c
    LEFT JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN customers cust ON c.customer_id = cust.id
    LEFT JOIN materials m ON c.material_id = m.id
    ORDER BY c.id DESC
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Collections GET Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
});


/* =========================
   CREATE COLLECTION
========================= */
router.post("/", (req, res) => {
  const { partyType, partyId, materialId, qty, mfgDate, expiryDate } = req.body;

  console.log("Adding collection:", req.body);

  if (!partyType || !partyId || !materialId || !qty) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // FARMER
  if (partyType === "farmer") {
    const sql = `
      INSERT INTO collections
      (farmer_id, material_id, qty, mfg_date, expiry_date, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.query(
      sql,
      [partyId, materialId, qty, mfgDate, expiryDate],
      (err, result) => {
        if (err) {
          console.error("Farmer Insert Error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId });
      }
    );
  }

  // CUSTOMER
  else {
    const sql = `
      INSERT INTO collections
      (customer_id, material_id, qty, mfg_date, expiry_date, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.query(
      sql,
      [partyId, materialId, qty, mfgDate, expiryDate],
      (err, result) => {
        if (err) {
          console.error("Customer Insert Error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId });
      }
    );
  }
});


/* =========================
   UPDATE STATUS
========================= */
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    "UPDATE collections SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error("Update Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

export default router;