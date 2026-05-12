import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const PeriodClosing = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({
    period: '',
    status: 'OPEN'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      const res = await api.get('/period-closing');
      setPeriods(res.data || []);
    } catch (err) {
      setError('Failed to load periods');
    }
  };

  const handleClosePeriod = async () => {
    if (!selectedPeriod.period) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/period-closing/close', {
        period: selectedPeriod.period
      });
      setSuccess(`Period ${selectedPeriod.period} closed successfully!`);
      await loadPeriods();
      // refresh selected status from latest list
      const updated = periods.find(p => p.period === selectedPeriod.period);
      if (updated) {
        setSelectedPeriod({ period: updated.period, status: updated.status });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close period');
    }
  };

  const handleOpenPeriod = async () => {
    if (!selectedPeriod.period) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/period-closing/open', {
        period: selectedPeriod.period
      });
      setSuccess(`Period ${selectedPeriod.period} opened!`);
      await loadPeriods();
      const updated = periods.find(p => p.period === selectedPeriod.period);
      if (updated) {
        setSelectedPeriod({ period: updated.period, status: updated.status });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open period');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'status-open',
      CLOSED: 'status-closed',
      LOCKED: 'status-locked'
    };
    return colors[status] || '';
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    const periodRow = periods.find(p => p.period === value);
    setSelectedPeriod({
      period: value,
      status: periodRow ? periodRow.status : 'OPEN'
    });
    setSuccess('');
    setError('');
  };

  return (
    <div>
      <h2>Period Closing</h2>
      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-text">{success}</div>}

      <div className="grid-2">
        <div className="card">
          <h3>Period Control</h3>

          <div className="form-group">
            <label>Select Period</label>
            {periods.length === 0 && (
              <div className="info-text">
                No periods configured yet.
              </div>
            )}
            <select
              value={selectedPeriod.period}
              onChange={handleSelectChange}
              disabled={periods.length === 0}
            >
              <option value="">Select Period</option>
              {periods.map(period => (
                <option key={period.period} value={period.period}>
                  {period.period} ({period.status})
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button
              className="btn-danger"
              onClick={handleClosePeriod}
              disabled={
                !selectedPeriod.period ||
                selectedPeriod.status === 'CLOSED'
              }
            >
              Close Period
            </button>
            <button
              className="btn-secondary"
              onClick={handleOpenPeriod}
              disabled={
                !selectedPeriod.period ||
                selectedPeriod.status === 'OPEN'
              }
            >
              Open Period
            </button>
          </div>

          <div className="period-actions">
            <button
              className="btn-primary btn-small"
              onClick={() => api.post('/period-closing/depreciation')}
              disabled={!selectedPeriod.period}
            >
              Run Depreciation
            </button>
            <button
              className="btn-primary btn-small"
              onClick={() => api.post('/period-closing/accruals')}
              disabled={!selectedPeriod.period}
            >
              Post Accruals
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Period Status</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Status</th>
                <th>Closed By</th>
                <th>Closed Date</th>
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period.period}>
                  <td><strong>{period.period}</strong></td>
                  <td>
                    <span className={`status-badge ${getStatusColor(period.status)}`}>
                      {period.status}
                    </span>
                  </td>
                  <td>{period.closedByName || '-'}</td>
                  <td>{period.closedDate || '-'}</td>
                </tr>
              ))}
              {periods.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">
                    No periods defined
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PeriodClosing;