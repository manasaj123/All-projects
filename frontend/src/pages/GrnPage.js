import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';


const GrnPage = () => {
  const [grns, setGrns] = useState([]);
  const [formData, setFormData] = useState({
    grn_no: '',
    warehouse_id: '1',
    received_date: new Date().toISOString().split('T')[0],
    total_items: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGrns();
  }, []);

  const loadGrns = async () => {
    try {
      const response = await axiosClient.get('/grn/pending');
      setGrns(response.data || []);
    } catch (error) {
      console.error('Load GRNs failed:', error);
      setGrns([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        grn_no: formData.grn_no || `GRN${Date.now()}`,
        warehouse_id: parseInt(formData.warehouse_id, 10),
        received_date: formData.received_date,
        total_items: parseInt(formData.total_items, 10)
      };

      await axiosClient.post('/grn', payload);
      alert(`✅ GRN ${payload.grn_no} created!`);
      await loadGrns();
      setFormData({
        grn_no: '',
        warehouse_id: '1',
        received_date: new Date().toISOString().split('T')[0],
        total_items: ''
      });
    } catch (error) {
      alert(`❌ Failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePutAway = async (grnId) => {
    if (!window.confirm('Move this GRN to inventory?')) return;

    try {
      await axiosClient.put(`/grn/${grnId}/putaway`);
      alert('✅ GRN put-away completed!');
      await loadGrns();
    } catch (error) {
      alert('❌ Put-away failed');
    }
  };

  const grnColumns = [
    { key: 'grn_no', label: 'GRN No' },
    { key: 'received_date', label: 'Date' },
    { key: 'total_items', label: 'Items' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <button
            className="btn btn-success"
            onClick={() => handlePutAway(row.id)}
          >
            📦 Put Away
          </button>
        ) : (
          'Completed'
        )
    }
  ];

  const totalPendingItems = grns.reduce(
    (sum, grn) => sum + (grn.total_items || 0),
    0
  );

  return (
    <div>
      <div className="page-header">
        <h1>📥 Goods Receipt Note (GRN)</h1>
        <span style={{ color: '#27ae60', fontSize: '1.2em' }}>
          Total Pending: {totalPendingItems} items
        </span>
      </div>

      <div className="card">
        <h3>➕ Create New GRN</h3>
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label>
              GRN No <small>(auto if blank)</small>
            </label>
            <input
              value={formData.grn_no}
              onChange={(e) =>
                setFormData({ ...formData, grn_no: e.target.value })
              }
              placeholder="GRN001"
            />
          </div>

          <div
            className="form-group"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}
          >
            <div>
              <label>Warehouse *</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) =>
                  setFormData({ ...formData, warehouse_id: e.target.value })
                }
                required
              >
                <option value="1">Main Warehouse</option>
                <option value="2">Secondary</option>
              </select>
            </div>
            <div>
              <label>Date *</label>
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) =>
                  setFormData({ ...formData, received_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Total Items *</label>
            <input
              type="number"
              value={formData.total_items}
              onChange={(e) =>
                setFormData({ ...formData, total_items: e.target.value })
              }
              min="1"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Creating...' : '➕ Create GRN'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Pending GRNs ({grns.length})</h3>
        {grns.length > 0 ? (
          <Table columns={grnColumns} data={grns} />
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#7f8c8d'
            }}
          >
            🎉 No pending GRNs!
            <br />
            <small>Create one above 👆</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrnPage;
