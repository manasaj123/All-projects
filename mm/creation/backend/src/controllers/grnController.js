// backend/src/controllers/grnController.js
import db from "../config/db.js";

const toMysqlDate = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(value).toISOString().split("T")[0];
};

// GET all GRNs (for table)
export const getGRNs = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT g.*, v.name AS vendor_name, p.po_no
       FROM grn_headers g
       LEFT JOIN vendors v ON g.vendor_id = v.id
       LEFT JOIN purchase_orders p ON g.po_id = p.id
       ORDER BY g.id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET one GRN (for edit)
export const getGRNById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [[header]] = await db.query(
      `SELECT * FROM grn_headers WHERE id = ?`,
      [id]
    );
    if (!header) {
      return res.status(404).json({ message: "GRN not found" });
    }
    const [items] = await db.query(
      `SELECT * FROM grn_items WHERE grn_id = ?`,
      [id]
    );
    res.json({ header, items });
  } catch (err) {
    next(err);
  }
};

// CREATE GRN (auto GRN No)
export const createGRN = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    await conn.beginTransaction();

    // auto-generate GRN number like GRN-001
    const [rows] = await conn.query(
      `SELECT grn_no 
       FROM grn_headers 
       WHERE grn_no LIKE 'GRN-%'
       ORDER BY id DESC
       LIMIT 1`
    );
    let nextSeq = 1;
    if (rows.length > 0 && rows[0].grn_no) {
      const parts = rows[0].grn_no.split("-");
      if (parts.length === 2 && !isNaN(parts[1])) {
        nextSeq = parseInt(parts[1], 10) + 1;
      }
    }
    const generatedGrnNo = `GRN-${String(nextSeq).padStart(3, "0")}`;

    const [hRes] = await conn.query(
      `INSERT INTO grn_headers
       (grn_no, grn_date, po_id, vendor_id, location_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        generatedGrnNo,
        toMysqlDate(header.grn_date),
        header.po_id,
        header.vendor_id,
        header.location_id,
        header.status || "POSTED"
      ]
    );
    const grnId = hRes.insertId;

    for (const item of items || []) {
      // 1. create batch
      const [bRes] = await conn.query(
        `INSERT INTO batches
         (batch_no, material_id, mfg_date, expiry_date, source_type, source_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.batch_no,
          item.material_id,
          toMysqlDate(item.mfg_date),
          toMysqlDate(item.expiry_date),
          "VENDOR",
          header.vendor_id
        ]
      );
      const batchId = bRes.insertId;

      // 2. grn_items (NO unit_cost here)
      await conn.query(
        `INSERT INTO grn_items
         (grn_id, po_item_id, material_id, received_qty, accepted_qty, rejected_qty, batch_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          grnId,
          item.po_item_id,
          item.material_id,
          item.received_qty,
          item.accepted_qty,
          item.rejected_qty,
          batchId
        ]
      );

      // 3. stock ledger entry (keeps unit_cost here)
      await conn.query(
        `INSERT INTO stock_ledger
         (material_id, location_id, batch_id, txn_type, qty_in, qty_out,
          unit_cost, txn_ref_type, txn_ref_id, txn_date)
         VALUES (?, ?, ?, 'GRN', ?, 0, ?, 'GRN', ?, ?)`,
        [
          item.material_id,
          header.location_id,
          batchId,
          item.accepted_qty,
          item.unit_cost || 0,
          grnId,
          toMysqlDate(header.grn_date)
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ id: grnId, grn_no: generatedGrnNo });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// UPDATE GRN
export const updateGRN = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const id = req.params.id;
    const { header, items } = req.body;
    await conn.beginTransaction();

    await conn.query(
      `UPDATE grn_headers
       SET grn_date = ?, po_id = ?, vendor_id = ?, location_id = ?, status = ?
       WHERE id = ?`,
      [
        toMysqlDate(header.grn_date),
        header.po_id,
        header.vendor_id,
        header.location_id,
        header.status || "POSTED",
        id
      ]
    );

    // delete old items + batches + ledger
    const [oldItems] = await conn.query(
      `SELECT batch_id FROM grn_items WHERE grn_id = ?`,
      [id]
    );
    const batchIds = oldItems.map((r) => r.batch_id).filter(Boolean);

    if (batchIds.length) {
      await conn.query(
        `DELETE FROM stock_ledger WHERE txn_ref_type = 'GRN' AND txn_ref_id = ?`,
        [id]
      );
      await conn.query(
        `DELETE FROM batches WHERE id IN (${batchIds
          .map(() => "?")
          .join(",")})`,
        batchIds
      );
    }

    await conn.query(`DELETE FROM grn_items WHERE grn_id = ?`, [id]);

    // insert new items + ledger
    for (const item of items || []) {
      const [bRes] = await conn.query(
        `INSERT INTO batches
         (batch_no, material_id, mfg_date, expiry_date, source_type, source_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.batch_no,
          item.material_id,
          toMysqlDate(item.mfg_date),
          toMysqlDate(item.expiry_date),
          "VENDOR",
          header.vendor_id
        ]
      );
      const batchId = bRes.insertId;

      await conn.query(
        `INSERT INTO grn_items
         (grn_id, po_item_id, material_id, received_qty, accepted_qty, rejected_qty, batch_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.po_item_id,
          item.material_id,
          item.received_qty,
          item.accepted_qty,
          item.rejected_qty,
          batchId
        ]
      );

      await conn.query(
        `INSERT INTO stock_ledger
         (material_id, location_id, batch_id, txn_type, qty_in, qty_out,
          unit_cost, txn_ref_type, txn_ref_id, txn_date)
         VALUES (?, ?, ?, 'GRN', ?, 0, ?, 'GRN', ?, ?)`,
        [
          item.material_id,
          header.location_id,
          batchId,
          item.accepted_qty,
          item.unit_cost || 0,
          id,
          toMysqlDate(header.grn_date)
        ]
      );
    }

    await conn.commit();
    res.json({ message: "GRN updated" });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// DELETE GRN
export const deleteGRN = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const id = req.params.id;
    await conn.beginTransaction();

    const [items] = await conn.query(
      `SELECT batch_id FROM grn_items WHERE grn_id = ?`,
      [id]
    );
    const batchIds = items.map((r) => r.batch_id).filter(Boolean);

    await conn.query(
      `DELETE FROM stock_ledger WHERE txn_ref_type = 'GRN' AND txn_ref_id = ?`,
      [id]
    );
    await conn.query(`DELETE FROM grn_items WHERE grn_id = ?`, [id]);

    if (batchIds.length) {
      await conn.query(
        `DELETE FROM batches WHERE id IN (${batchIds
          .map(() => "?")
          .join(",")})`,
        batchIds
      );
    }

    const [result] = await conn.query(
      `DELETE FROM grn_headers WHERE id = ?`,
      [id]
    );
    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "GRN not found" });
    }

    res.status(204).end();
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
