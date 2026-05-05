// controllers/stockController.js
import db from "../config/db.js";

/* ================= FIFO ================= */
export const getStockFIFO = (req, res) => {
  const { materialId } = req.params;

  const sql = `
    SELECT 
      c.id,
      c.material_id AS materialId,
      c.qty,
      c.mfg_date AS mfgDate,
      c.expiry_date AS expiryDate,
      c.status,
      COALESCE(f.name, cust.name) AS partyName
    FROM collections c
    LEFT JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN customers cust ON c.customer_id = cust.id
    WHERE c.material_id = ?
    ORDER BY c.mfg_date ASC
  `;

  db.query(sql, [materialId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

/* ================= LIFO ================= */
export const getStockLIFO = (req, res) => {
  const { materialId } = req.params;

  const sql = `
    SELECT 
      c.id,
      c.material_id AS materialId,
      c.qty,
      c.mfg_date AS mfgDate,
      c.expiry_date AS expiryDate,
      c.status,
      COALESCE(f.name, cust.name) AS partyName
    FROM collections c
    LEFT JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN customers cust ON c.customer_id = cust.id
    WHERE c.material_id = ?
    ORDER BY c.mfg_date DESC
  `;

  db.query(sql, [materialId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

/* ================= EXPIRY ================= */
export const getExpiryStatus = (req, res) => {
  const sql = `
    SELECT 
      c.id,
      c.material_id AS materialId,
      c.qty,
      c.mfg_date AS mfgDate,
      c.expiry_date AS expiryDate,
      COALESCE(f.name, cust.name) AS partyName,
      CASE
        WHEN c.expiry_date < CURDATE() THEN 'Expired'
        WHEN DATEDIFF(c.expiry_date, CURDATE()) <= 2 THEN 'Near Expiry'
        ELSE 'Fresh'
      END AS expiry_status
    FROM collections c
    LEFT JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN customers cust ON c.customer_id = cust.id
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

/* ================= WEEKLY MARKET ================= */
export const weeklyMarket = (req, res) => {
  // 🔹 1) Farmers: group by farmerName + materialName (name-based)
  const farmerSql = `
    SELECT
      f.name      AS farmerName,
      m.name      AS materialName,
      SUM(c.qty)  AS totalQty
    FROM collections c
    JOIN farmers   f ON c.farmer_id   = f.id
    JOIN materials m ON c.material_id = m.id
    GROUP BY f.name, m.name
  `;

  // 🔹 2) Customers: group by customerName + materialName (name-based)
  const customerSql = `
    SELECT
      cust.name   AS customerName,
      m.name      AS materialName,
      SUM(c.qty)  AS totalQty
    FROM collections c
    JOIN customers cust ON c.customer_id = cust.id
    JOIN materials  m   ON c.material_id = m.id
    GROUP BY cust.name, m.name
  `;

  db.query(farmerSql, (errF, farmerRows) => {
    if (errF) {
      console.error("Farmer weekly SQL error:", errF);
      return res.status(500).json(errF);
    }

    db.query(customerSql, (errC, customerRows) => {
      if (errC) {
        console.error("Customer weekly SQL error:", errC);
        return res.status(500).json(errC);
      }

      const farmersData = farmerRows.map((row) => ({
        customerName: null,
        farmerName: row.farmerName,
        materialName: row.materialName,
        totalQty: row.totalQty,
      }));

      const customersData = customerRows.map((row) => ({
        customerName: row.customerName,
        farmerName: null,
        materialName: row.materialName,
        totalQty: row.totalQty,
      }));

      const combined = [...farmersData, ...customersData];

      res.json(combined);
    });
  });
};