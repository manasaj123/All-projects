// src/pages/PlanPage.jsx
import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import PlanTable from "../components/PlanTable";
import planApi from "../api/planApi";

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
  margin: "8px 0",
  display: "flex",
  gap: "8px"
};

const buttonStyle = {
  padding: "6px 10px",
  fontSize: "13px",
  cursor: "pointer"
};

function PlanPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const data = await planApi.getByDate(date);
      setRows(data);
    }
    load();
  }, [date]);

  const handleSave = async () => {
    await planApi.save(date, rows);
    setMessage("Plan saved");
  };

  const handleGenerateFromForecast = async () => {
    await planApi.generateFromForecast("2026-W03", date);
    const data = await planApi.getByDate(date);
    setRows(data);
    setMessage("Plan generated from forecast");
  };

  return (
    <div>
      <h2 style={headerStyle}>Production Plan</h2>

      <div style={topRowStyle}>
        <DateInput value={date} onChange={setDate} />
      </div>

      <div style={buttonBarStyle}>
        <button onClick={handleGenerateFromForecast} style={buttonStyle}>
          Generate from Forecast
        </button>
        <button onClick={handleSave} style={buttonStyle}>
          Save Plan
        </button>
      </div>

      <PlanTable rows={rows} setRows={setRows} />
      {message && <p>{message}</p>}
    </div>
  );
}

export default PlanPage;
