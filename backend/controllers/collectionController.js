import db from "../db.js";


export const createCollection = (req, res) => {
  const {
    farmerId,
    customerId,
    materialId,
    qty,
    mfgDate,
    expiryDate
  } = req.body;

  const sql = `
    INSERT INTO collections
    (farmer_id, customer_id, material_id, qty, mfg_date, expiry_date, status)
    VALUES (?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      farmerId,
      customerId,
      materialId,
      qty,
      mfgDate,
      expiryDate,
      "Fresh"
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Collection saved",
        collectionId: result.insertId
      });
    }
  );
};
