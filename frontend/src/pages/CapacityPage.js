import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import CapacityTable from "../components/CapacityTable";
import capacityApi from "../api/capacityApi";

function CapacityPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const data = await capacityApi.getByDate(date);
      setRows(data);
    }
    load();
  }, [date]);

  const handleSave = async () => {
    await capacityApi.save(date, rows);
    setMessage("Capacity saved");
  };

  const handleSuggest = async () => {
    const result = await capacityApi.suggest(date);
    setRows(result.rows || []);
    setMessage("Capacity suggested from plan");
  };

  return (
    <div>
      <h2>Resource & Capacity Planning</h2>
      <DateInput value={date} onChange={setDate} />
      <div style={{ margin: "8px 0" }}>
        <button onClick={handleSuggest}>Suggest Capacity</button>
        <button onClick={handleSave} style={{ marginLeft: 8 }}>
          Save Capacity
        </button>
      </div>
      <CapacityTable rows={rows} setRows={setRows} />
      {message && <p>{message}</p>}
    </div>
  );
}

export default CapacityPage;
