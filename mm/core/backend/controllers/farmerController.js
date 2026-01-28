import db from "../config/db.js";

export const addFarmer = (req, res) => {
  const { name, address, contact } = req.body;

  db.query(
    "INSERT INTO farmers (name,address,contact) VALUES (?,?,?)",
    [name, address, contact],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, name, address, contact });
    }
  );
};

export const getFarmers = (req, res) => {
  db.query("SELECT * FROM farmers", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};
