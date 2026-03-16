import db from "../config/db.js";
import { RFQ } from "../models/RFQ.js";

const toMysqlDate = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* GET ALL RFQs */
export const getRFQs = async (req, res, next) => {
  try {
    const [rows] = await RFQ.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/* CREATE RFQ */
export const createRFQ = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    await conn.beginTransaction();

    // generate RFQ number RFQ-001 style
    const [rows] = await conn.query(
      `SELECT rfq_no FROM rfq_headers 
       WHERE rfq_no LIKE 'RFQ-%'
       ORDER BY id DESC
       LIMIT 1`
    );
    let nextSeq = 1;
    if (rows.length && rows[0].rfq_no) {
      const parts = rows[0].rfq_no.split("-");
      if (parts.length === 2 && !isNaN(parts[1])) {
        nextSeq = parseInt(parts[1], 10) + 1;
      }
    }
    const generatedRfqNo = `RFQ-${String(nextSeq).padStart(3, "0")}`;

    const [headerRes] = await conn.query(
      `INSERT INTO rfq_headers
        (rfq_no, rfq_type, rfq_date, question_deadline, purchase_org,
         delivery_date, material_group, plant, storage_location,
         vendor_id, supplying_plant, reference_pr_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generatedRfqNo,
        header.rfq_type,
        toMysqlDate(header.rfq_date),
        toMysqlDate(header.question_deadline),
        header.purchase_org || null,
        toMysqlDate(header.delivery_date),
        header.material_group || null,
        header.plant || null,
        header.storage_location || null,
        header.vendor_id || null,
        header.supplying_plant || null,
        header.reference_pr_id || null
      ]
    );

    const rfqId = headerRes.insertId;

    for (const item of items || []) {
      if (!item.material_id || !item.qty) continue;
      await conn.query(
        `INSERT INTO rfq_items
          (rfq_id, material_id, qty)
         VALUES (?, ?, ?)`,
        [rfqId, item.material_id, Number(item.qty)]
      );
    }

    await conn.commit();
    res.status(201).json({ id: rfqId, rfq_no: generatedRfqNo });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/* GET ONE RFQ */
export const getRFQById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [[headerRow]] = await RFQ.findByIdHeader(id);
    if (!headerRow) {
      return res.status(404).json({ message: "RFQ not found" });
    }
    const [itemRows] = await RFQ.findItemsByRFQ(id);
    res.json({ header: headerRow, items: itemRows });
  } catch (err) {
    next(err);
  }
};

/* UPDATE RFQ */
export const updateRFQ = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const id = req.params.id;
    const { header, items } = req.body;
    await conn.beginTransaction();

    await conn.query(
      `UPDATE rfq_headers
       SET rfq_type = ?,
           rfq_date = ?,
           question_deadline = ?,
           purchase_org = ?,
           delivery_date = ?,
           material_group = ?,
           plant = ?,
           storage_location = ?,
           vendor_id = ?,
           supplying_plant = ?,
           reference_pr_id = ?
       WHERE id = ?`,
      [
        header.rfq_type,
        toMysqlDate(header.rfq_date),
        toMysqlDate(header.question_deadline),
        header.purchase_org || null,
        toMysqlDate(header.delivery_date),
        header.material_group || null,
        header.plant || null,
        header.storage_location || null,
        header.vendor_id || null,
        header.supplying_plant || null,
        header.reference_pr_id || null,
        id
      ]
    );

    await conn.query(`DELETE FROM rfq_items WHERE rfq_id = ?`, [id]);
    for (const item of items || []) {
      if (!item.material_id || !item.qty) continue;
      await conn.query(
        `INSERT INTO rfq_items (rfq_id, material_id, qty)
         VALUES (?, ?, ?)`,
        [id, item.material_id, Number(item.qty)]
      );
    }

    await conn.commit();
    res.json({ message: "RFQ updated" });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/* DELETE RFQ */
export const deleteRFQ = async (req, res, next) => {
  try {
    const id = req.params.id;
    await db.query(`DELETE FROM rfq_items WHERE rfq_id = ?`, [id]);
    const [result] = await db.query(
      `DELETE FROM rfq_headers WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "RFQ not found" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
