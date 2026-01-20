// src/pages/ForecastPage.jsx
import React, { useEffect, useState } from "react";
import forecastApi from "../api/forecastApi";
import NumberInput from "../components/NumberInput";

const formRowStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
  alignItems: "flex-end"
};

const fieldBoxStyle = {
  border: "1px solid #ddd",
  padding: "6px 8px",
  borderRadius: "4px",
  background: "#f9fafb",
  display: "flex",
  flexDirection: "column",
  fontSize: "13px"
};

const labelStyle = {
  marginBottom: "4px",
  fontWeight: "500"
};

function ForecastPage() {
  const [period, setPeriod] = useState("2026-W03");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  // form fields for one line
  const [productId, setProductId] = useState(1);
  const [gradePackId, setGradePackId] = useState(1);
  const [forecastQty, setForecastQty] = useState(0);

  useEffect(() => {
    loadForecast(period);
  }, [period]);

  const loadForecast = async (p) => {
    const data = await forecastApi.getByPeriod(p);
    setRows(data);
  };

  const handleAddLine = async () => {
    if (!forecastQty || forecastQty <= 0) return;

    const newRows = [
      ...rows,
      { product_id: productId, grade_pack_id: gradePackId, forecast_qty: forecastQty }
    ];

    await forecastApi.save(period, newRows);
    setMessage("Forecast line added");
    setProductId(1);
    setGradePackId(1);
    setForecastQty(0);

    await loadForecast(period);
  };

  return (
    <div>
      <h2>Demand Forecast</h2>

      <div style={{ marginBottom: 8 }}>
        <label>
          Period:
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ marginLeft: 6 }}
          />
        </label>
      </div>

      <h3>Create Forecast Line</h3>
      <div style={formRowStyle}>
        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Product ID</span>
          <NumberInput
            value={productId}
            onChange={setProductId}
            min={1}
          />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Grade/Pack ID</span>
          <NumberInput
            value={gradePackId}
            onChange={setGradePackId}
            min={1}
          />
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Forecast Qty</span>
          <NumberInput
            value={forecastQty}
            onChange={setForecastQty}
            min={0}
          />
        </div>

        <button onClick={handleAddLine}>Create Forecast </button>
      </div>

      <h3>Forecast Lines</h3>
      <table className="pp-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Grade/Pack ID</th>
            <th>Forecast Qty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={index}>
              <td>{r.product_id}</td>
              <td>{r.grade_pack_id}</td>
              <td>{r.forecast_qty}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3}>No forecast lines for this period</td>
            </tr>
          )}
        </tbody>
      </table>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ForecastPage;
