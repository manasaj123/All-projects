
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../pages/style.css';

const ReportsPage = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await axiosClient.get('/report/metrics'); // baseURL should be /api
      console.log('metrics API response:', response.data);
      setMetrics(response.data);
    } catch (error) {
      console.error('Metrics error:', error);
      setMetrics({});
    }
  };

  const safeNumber = (v) => Number(v || 0);

  return (
    <div>
      <div className="page-header">
        <h1>📈 Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={loadMetrics}>Refresh</button>
      </div>
      
      <div className="metrics-grid">
        <div className="card metric-card">
          <h3>Total GRNs</h3>
          <p className="metric-value">
            {safeNumber(metrics.total_grns)}
          </p>
        </div>

        <div className="card metric-card">
          <h3>Avg Putaway Time</h3>
          <p className="metric-value">
            {metrics.avg_putaway_time != null
              ? safeNumber(metrics.avg_putaway_time).toFixed(1) + ' min'
              : 'N/A'}
          </p>
        </div>

        <div className="card metric-card">
          <h3>Pick Accuracy</h3>
          <p className="metric-value">
            {metrics.pick_accuracy != null
              ? safeNumber(metrics.pick_accuracy).toFixed(1) + '%'
              : 'N/A'}
          </p>
        </div>
      </div>

      
    </div>
  );
};

export default ReportsPage;
