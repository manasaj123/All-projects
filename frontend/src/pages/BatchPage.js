
import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import BatchTable from "../components/BatchTable";
import batchApi from "../api/batchApi";

const headerStyle = {
  marginBottom: "8px"
};

const topRowStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  marginBottom: "8px"
};

const buttonBarStyle = {
  marginTop: "8px",
  marginBottom: "8px"
};

const buttonStyle = {
  padding: "6px 10px",
  fontSize: "13px",
  cursor: "pointer"
};

function BatchPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const data = await batchApi.getByDate(date);
      setRows(data);
    }
    load();
  }, [date]);

  const handleSave = async () => {
    await batchApi.createMany(date, rows);
    setMessage("Batches created");
  };

  return (
    <div>
      <h2 style={headerStyle}>Batch Creation / Scheduling</h2>

      <div style={topRowStyle}>
        <DateInput value={date} onChange={setDate} />
      </div>

      <BatchTable rows={rows} setRows={setRows} />

      <div style={buttonBarStyle}>
        <button onClick={handleSave} style={buttonStyle}>
          Save Batches
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default BatchPage;
