// backend/controllers/scheduleLineController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../models');

// GET /api/schedule-lines
exports.getScheduleLines = asyncHandler(async (req, res) => {
  const list = await db.ScheduleLine.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/schedule-lines/deleted
exports.getDeletedScheduleLines = asyncHandler(async (req, res) => {
  const list = await db.ScheduleLine.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/schedule-lines/:id
exports.getScheduleLineById = asyncHandler(async (req, res) => {
  const sl = await db.ScheduleLine.findByPk(req.params.id);
  if (!sl) {
    res.status(404).json({ message: 'Schedule line not found' });
    return;
  }
  res.json(sl);
});

// POST /api/schedule-lines
exports.createScheduleLine = asyncHandler(async (req, res) => {
  const sl = await db.ScheduleLine.create(req.body);
  res.status(201).json(sl);
});

// PUT /api/schedule-lines/:id
exports.updateScheduleLine = asyncHandler(async (req, res) => {
  const sl = await db.ScheduleLine.findByPk(req.params.id);
  if (!sl) {
    res.status(404).json({ message: 'Schedule line not found' });
    return;
  }
  await sl.update(req.body);
  res.json(sl);
});

// DELETE /api/schedule-lines/:id
exports.softDeleteScheduleLine = asyncHandler(async (req, res) => {
  const sl = await db.ScheduleLine.findByPk(req.params.id);
  if (!sl) {
    res.status(404).json({ message: 'Schedule line not found' });
    return;
  }
  await sl.update({ isDeleted: true });
  res.json({ message: 'Schedule line moved to recycle bin' });
});

// PUT /api/schedule-lines/:id/restore
exports.restoreScheduleLine = asyncHandler(async (req, res) => {
  const sl = await db.ScheduleLine.findByPk(req.params.id);
  if (!sl) {
    res.status(404).json({ message: 'Schedule line not found' });
    return;
  }
  await sl.update({ isDeleted: false });
  res.json(sl);
});
