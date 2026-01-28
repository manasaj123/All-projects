import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import metricApi from "../api/metricApi";

function MetricsPage() {
  const [date, setDate] = useState("2026-01-20");
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await metricApi.getDaily(date);
      setMetrics(data);
    }
    load();
  }, [date]);

  return (
    <div>
      <h2>Process Efficiency / Yield</h2>
      <DateInput value={date} onChange={setDate} />
      {metrics && (
        <div className="pp-metrics">
          <p>Total planned: {metrics.total_planned}</p>
          <p>Total actual: {metrics.total_actual}</p>
          <p>Total wastage: {metrics.total_wastage}</p>
          <p>Yield %: {metrics.yield_percent}</p>
        </div>
      )}
    </div>
  );
}

export default MetricsPage;
