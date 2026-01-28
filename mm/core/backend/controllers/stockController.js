import db from "../config/db.js";

export const getStockFIFO = (req, res) => {
  const { materialId } = req.params;

  const sql = `
    SELECT c.*, f.name AS farmerName
    FROM collections c
    LEFT JOIN farmers f ON c.farmerId = f.id
    WHERE c.materialId = ? AND f.name IS NOT NULL
    ORDER BY c.mfgDate ASC
  `;

  db.query(sql, [materialId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const getStockLIFO = (req, res) => {
  const { materialId } = req.params;

  const sql = `
    SELECT c.*, f.name AS farmerName
    FROM collections c
    LEFT JOIN farmers f ON c.farmerId = f.id
    WHERE c.materialId = ? AND f.name IS NOT NULL
    ORDER BY c.mfgDate DESC
  `;

  db.query(sql, [materialId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const getExpiryStatus = (req, res) => {
  const sql = `
    SELECT c.*,
           COALESCE(f.name, cust.name) AS partyName,
           CASE
             WHEN c.expiryDate < CURDATE() THEN 'Expired'
             WHEN DATEDIFF(c.expiryDate, CURDATE()) <= 2 THEN 'Near Expiry'
             ELSE 'Fresh'
           END AS expiry_status
    FROM collections c
    LEFT JOIN farmers f ON c.farmerId = f.id
    LEFT JOIN customers cust ON c.customerId = cust.id
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const weeklyMarket = (req, res) => {
  const sql = `
    SELECT 
      MAX(cust.name) AS customerName,
      MAX(f.name) AS farmerName,
      m.name AS materialName,
      SUM(c.qty) AS totalQty
    FROM collections c
    LEFT JOIN farmers f ON c.farmerId = f.id
    LEFT JOIN customers cust ON c.customerId = cust.id
    LEFT JOIN materials m ON c.materialId = m.id
    GROUP BY m.id, COALESCE(f.id, cust.id)
    HAVING totalQty > 0
    ORDER BY totalQty DESC
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Weekly Market Error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("Weekly data:", data);
    res.json(data);
  });
};
