// backend/src/controllers/qcLotController.js
import db from "../config/db.js";
import { QCLot } from "../models/qcLotModel.js";
import { QCResult } from "../models/qcResultModel.js";
import { QCDefect } from "../models/qcDefectModel.js";

export const listLots = async (req, res, next) => {
  try {
    const { status, stage } = req.query;
    const rows = await QCLot.list({ status, stage });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getLotDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const lot = await QCLot.findById(id);
    if (!lot) {
      return res.status(404).json({ message: "QC lot not found" });
    }
    const [results, defects] = await Promise.all([
      QCResult.listByLot(id),
      QCDefect.listByLot(id)
    ]);
    res.json({ lot, results, defects });
  } catch (err) {
    next(err);
  }
};

// Create a QC lot manually (you can also auto-create from GRN in your GRN controller)
export const createLot = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const header = req.body;
    await conn.beginTransaction();

    const id = await QCLot.create(header);

    await conn.commit();
    res.status(201).json({ id });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// Save QC results and update status
export const recordResults = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const lotId = Number(req.params.id);
    const { results, decision, defects } = req.body;
    // decision: 'ACCEPT' | 'REJECT' | 'ACCEPT_WITH_DEVIATION'

    await conn.beginTransaction();

    // save results
    await QCResult.saveResults(lotId, results || []);

    // save defects if any
    for (const d of defects || []) {
      await QCDefect.create({ ...d, lot_id: lotId });
    }

    // update QC lot status
    const status =
      decision === "REJECT"
        ? "REJECTED"
        : decision === "ACCEPT_WITH_DEVIATION"
        ? "ACCEPTED_WITH_DEVIATION"
        : "ACCEPTED";

    await QCLot.updateStatus(lotId, status, new Date());

    await conn.commit();
    res.json({ lot_id: lotId, status });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
