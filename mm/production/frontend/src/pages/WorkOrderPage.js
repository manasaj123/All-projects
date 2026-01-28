
import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import WorkOrderTable from "../components/WorkOrderTable";
import workOrderApi from "../api/workOrderApi";
import NumberInput from "../components/NumberInput";

const formRowStyle = {
  display: "flex",
  gap: "8px",
  margin: "12px 0",
  alignItems: "flex-end"
};

const fieldBoxStyle = {
  border: "1px solid #ddd",
  padding: "4px 6px",          
  borderRadius: "4px",
  background: "#f9fafb",
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  maxWidth: "130px"            
};

const labelStyle = {
  marginBottom: "2px",
  fontWeight: "500",
  fontSize: "11px",
  whiteSpace: "nowrap"         
};


function WorkOrderPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  // form fields for creating one WO
  const [batchId, setBatchId] = useState(null);
  const [lineId, setLineId] = useState(1);
  const [shift, setShift] = useState(1);
  const [productId, setProductId] = useState(1);
  const [gradePackId, setGradePackId] = useState(1);
  const [plannedQty, setPlannedQty] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await workOrderApi.getByDate(date);
      setRows(data);
    }
    load();
  }, [date]);

  const load = async () => {
    const data = await workOrderApi.getByDate(date);
    setRows(data);
  };

  const handleCreate = async () => {
    if (!plannedQty || plannedQty <= 0) return;

    await workOrderApi.create({
      plan_date: date,
      batch_id: batchId,
      line_id: lineId,
      shift,
      product_id: productId,
      grade_pack_id: gradePackId,
      planned_qty: plannedQty,
      actual_qty: 0,
      wastage_qty: 0,
      status: "open"
    });

    setMessage("Work order created");
    setPlannedQty(0);
    await load();
  };

  const handleUpdate = async (row) => {
    await workOrderApi.updateActuals(row.id, {
      actual_qty: row.actual_qty,
      wastage_qty: row.wastage_qty,
      status: row.status
    });
    setMessage("Work order updated");
    await load();
  };

  return (
    <div>
      <h2>Work Orders / Execution</h2>
      <DateInput value={date} onChange={setDate} />

      {/* Create Work Order form */}
      <h3>Create Work Order</h3>
      <div style={formRowStyle}>
        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Batch ID</span>
          <NumberInput value={batchId ?? ""} onChange={setBatchId} />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Line ID</span>
          <NumberInput value={lineId} onChange={setLineId} />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Shift</span>
          <NumberInput value={shift} onChange={setShift} />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Product ID</span>
          <NumberInput value={productId} onChange={setProductId} />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Grade/Pack ID</span>
          <NumberInput value={gradePackId} onChange={setGradePackId} />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Planned Qty</span>
          <NumberInput value={plannedQty} onChange={setPlannedQty} min={0} />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>&nbsp;</span>
          <button
            onClick={handleCreate}
            style={{ padding: "4px 5px", fontSize: "9px" }}
          >
            Create Work Order
          </button>
        </div>
      </div>

      <WorkOrderTable
        rows={rows}
        setRows={setRows}
        onUpdate={handleUpdate}
      />
      {message && <p>{message}</p>}
    </div>
  );
}

export default WorkOrderPage;
