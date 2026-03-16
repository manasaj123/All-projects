// routes/masterInspectionRoutes.js
const express = require("express");
const router = express.Router();

// In real app, replace this with DB queries
let inspections = [];
let nextId = 1;

// GET active inspections
router.get("/master-inspections", (req, res) => {
  const active = inspections.filter(i => !i.deleted);
  res.json(active);
});

// GET recycle bin items
router.get("/master-inspections/recycle-bin", (req, res) => {
  const deleted = inspections.filter(i => i.deleted);
  res.json(deleted);
});

// CREATE
router.post("/master-inspections", (req, res) => {
  const body = req.body;

  const inspection = {
    id: nextId++,
    plant: body.plant,
    inspectionName: body.inspectionName,
    validFrom: body.validFrom,
    validTo: body.validTo,
    status: body.status, // RELEASED / COMPLAINT
    lowerSpecLimit: body.lowerSpecLimit,
    targetValue: body.targetValue,
    upperSpecLimit: body.upperSpecLimit,
    deleted: false,
    deletedAt: null
  };

  inspections.push(inspection);
  res.status(201).json(inspection);
});

// UPDATE
router.put("/master-inspections/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = inspections.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });

  inspections[idx] = { ...inspections[idx], ...req.body };
  res.json(inspections[idx]);
});

// SOFT DELETE -> move to recycle bin
router.delete("/master-inspections/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = inspections.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });

  inspections[idx].deleted = true;
  inspections[idx].deletedAt = new Date().toISOString();
  res.json({ message: "Moved to recycle bin" });
});

// RESTORE from recycle bin
router.post("/master-inspections/:id/restore", (req, res) => {
  const id = Number(req.params.id);
  const idx = inspections.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });

  inspections[idx].deleted = false;
  inspections[idx].deletedAt = null;
  res.json(inspections[idx]);
});

// HARD DELETE from recycle bin
router.delete("/master-inspections/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);
  const idx = inspections.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });

  inspections.splice(idx, 1);
  res.json({ message: "Permanently deleted" });
});

module.exports = router;
