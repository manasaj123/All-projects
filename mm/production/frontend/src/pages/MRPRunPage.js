
import React, { useState } from "react";
import DateInput from "../components/DateInput";
import mrpApi from "../api/mrpApi";

const headerStyle = {
  marginBottom: "8px"
};

const rowStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  marginBottom: "12px"
};

const buttonStyle = {
  padding: "5px 8px",
  fontSize: "11px",
  cursor: "pointer"
};

function MRPRunPage() {
  const [date, setDate] = useState("2026-01-20");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleRun = async () => {
    const res = await mrpApi.run(date);
    setResult(res);
    setMessage(res.message || "");
  };

  return (
    <div>
      <h2 style={headerStyle}>MRP – Material Requirement Planning</h2>

      <div style={rowStyle}>
        <DateInput value={date} onChange={setDate} />
        <button onClick={handleRun} style={buttonStyle}>
          Run MRP
        </button>
      </div>

      {result && <p>Requirements generated: {result.inserted}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}

export default MRPRunPage;
