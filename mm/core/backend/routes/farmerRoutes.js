import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { name, address, contact } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name required" });
  }

  const sql =
    "INSERT INTO farmers (name, address, contact) VALUES (?, ?, ?)";

  db.query(sql, [name, address, contact], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({
      message: "Farmer added",
      id: result.insertId
    });
  });
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM farmers", (err, data) => {
    res.json(data);
  });
});

export default router;
