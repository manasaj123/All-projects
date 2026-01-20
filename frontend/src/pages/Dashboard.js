import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Table from '../components/common/Table';
import '../pages/style.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [recentGrn, setRecentGrn] = useState([]);

  useEffect(() => {
    loadMetrics();
    loadGrns();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/report/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Metrics load failed:', error);
      setMetrics({ avg_putaway_time: 0, pick_accuracy: 0, total_grns: 0 });
    }
  };

  const loadGrns = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/grn/pending');
      const data = await response.json();
      setRecentGrn(data);
    } catch (error) {
      console.error('GRN load failed:', error);
      setRecentGrn([]);
    }
  };

  const safeNumber = (value) => Number(value || 0);

  const chartData = [
    { name: 'Mon', putaway: 45, pick: 28 },
    { name: 'Tue', putaway: 52, pick: 35 },
    { name: 'Wed', putaway: 38, pick: 42 },
    { name: 'Thu', putaway: 60, pick: 48 },
    { name: 'Fri', putaway: 55, pick: 52 }
  ];

  const grnColumns = [
    { key: 'grn_no', label: 'GRN No' },
    { key: 'received_date', label: 'Date' },
    { key: 'total_items', label: 'Items' },
    { key: 'status', label: 'Status' }
  ];

  const totalPendingItems = recentGrn.reduce(
    (sum, g) => sum + (g.total_items || 0),
    0
  );

  return (
    <div>
      <div className="page-header">
        <h1>📊 Warehouse Dashboard</h1>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              loadMetrics();
              loadGrns();
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="card metric-card">
          <h3>Put-away Time</h3>
          <p className="metric-value">
            {safeNumber(metrics.avg_putaway_time).toFixed(1)} min
          </p>
          <p className="metric-label">Target: &lt; 30 min</p>
        </div>

        <div className="card metric-card">
          <h3>Pick Accuracy</h3>
          <p className="metric-value">
            {safeNumber(metrics.pick_accuracy).toFixed(1)}%
          </p>
          <p className="metric-label">Target: &gt; 99%</p>
        </div>

      
      
<div className="card metric-card">
  <h3>Inventory Accuracy</h3>
  <p className="metric-value">
    {safeNumber(metrics.inventory_accuracy).toFixed(1)}%
  </p>
  <p className="metric-label">Target: &gt; 99%</p>
</div>




        <div className="card metric-card">
          <h3>Total GRNs</h3>
          <p className="metric-value">{safeNumber(metrics.total_grns)}</p>
        </div>

        <div className="card metric-card">
          <h3>Pending GRNs</h3>
          <p className="metric-value">{recentGrn.length}</p>
        </div>

        <div className="card metric-card">
          <h3>Pending Items</h3>
          <p className="metric-value">{totalPendingItems}</p>
        </div>
      </div>

      <div className="card">
        <h3>📈 Weekly Performance</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="putaway"
              stroke="#3498db"
              name="Put-away"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="pick"
              stroke="#27ae60"
              name="Picks"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>📥 Recent GRNs ({recentGrn.length})</h3>
        {recentGrn.length > 0 ? (
          <Table columns={grnColumns} data={recentGrn} />
        ) : (
          <p className="no-data">No pending GRNs 🎉</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
