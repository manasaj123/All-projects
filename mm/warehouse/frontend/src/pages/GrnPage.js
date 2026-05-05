import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const GrnPage = () => {
  const [grns, setGrns] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    grn_no: '',
    warehouse_id: '',
    received_date: new Date().toISOString().split('T')[0],
    total_items: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGrns();
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const response = await axiosClient.get('/warehouse');
      setWarehouses(response.data || []);
      
      // Set default warehouse to first one if available
      if (response.data && response.data.length > 0) {
        setFormData(prev => ({ ...prev, warehouse_id: response.data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Load warehouses failed:', error);
      setWarehouses([]);
    }
  };

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

    // Validate GRN number format (alphanumeric and dash only)
    if (formData.grn_no && !/^[A-Z0-9\-]+$/i.test(formData.grn_no)) {
      alert('❌ GRN No can only contain letters, numbers, and dashes');
      setLoading(false);
      return;
    }

    if (!formData.warehouse_id) {
      alert('❌ Please select a warehouse');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        grn_no: formData.grn_no.trim().toUpperCase() || `GRN${Date.now()}`,
        warehouse_id: parseInt(formData.warehouse_id, 10),
        received_date: formData.received_date,
        total_items: parseInt(formData.total_items, 10)
      };

      console.log('📤 Sending GRN:', payload);

      await axiosClient.post('/grn', payload);
      alert(`✅ GRN ${payload.grn_no} created!`);
      await loadGrns();
      
      // Reset form but keep warehouse selection
      setFormData({
        grn_no: '',
        warehouse_id: formData.warehouse_id,
        received_date: new Date().toISOString().split('T')[0],
        total_items: ''
      });
    } catch (error) {
      console.error('❌ Create GRN error:', error.response?.data || error.message);
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
      console.error('Put-away error:', error.response?.data || error.message);
      alert(`❌ Put-away failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const grnColumns = [
    { key: 'grn_no', label: 'GRN No' },
    { 
      key: 'received_date', 
      label: 'Date',
      render: (row) => new Date(row.received_date).toLocaleDateString('en-IN')
    },
    { key: 'total_items', label: 'Items' },
    { 
      key: 'warehouse_id', 
      label: 'Warehouse',
      render: (row) => {
        const warehouse = warehouses.find(w => w.id === row.warehouse_id);
        return warehouse ? warehouse.name : `WH ${row.warehouse_id}`;
      }
    },
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
          <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✅ Completed</span>
        )
    }
  ];

  const totalPendingItems = grns.reduce(
    (sum, grn) => sum + (Number(grn.total_items) || 0),
    0
  );

  return (
    <div>
      <div className="page-header">
        <h1>📥 Goods Receipt Note (GRN)</h1>
        <span style={{ color: '#27ae60', fontSize: '1.2em', fontWeight: 'bold' }}>
          📦 Pending: {totalPendingItems} items
        </span>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Total Warehouses</h3>
          <p className="metric-value">{warehouses.length}</p>
        </div>
        <div className="card">
          <h3>Pending GRNs</h3>
          <p className="metric-value">{grns.length}</p>
        </div>
        <div className="card">
          <h3>Pending Items</h3>
          <p className="metric-value">{totalPendingItems}</p>
        </div>
      </div>

      <div className="card">
        <h3>➕ Create New GRN</h3>
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label>
              GRN No <small style={{ color: '#7f8c8d' }}>(auto-generated if blank)</small>
            </label>
            <input
              value={formData.grn_no}
              onChange={(e) =>
                setFormData({ ...formData, grn_no: e.target.value })
              }
              placeholder="GRN-001 or leave blank"
              pattern="[A-Za-z0-9\-]*"
              title="Only letters, numbers, and dashes allowed"
            />
            <small style={{ color: '#7f8c8d', display: 'block', marginTop: '0.25rem' }}>
              Format: Letters, numbers, and dashes only (e.g., GRN-001, GRN2024)
            </small>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}
          >
            <div className="form-group">
              <label>Warehouse *</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) =>
                  setFormData({ ...formData, warehouse_id: e.target.value })
                }
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Received Date *</label>
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
              placeholder="Enter number of items"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Creating GRN...' : '➕ Create GRN'}
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
              color: '#7f8c8d',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No Pending GRNs
            </div>
            <small>Create a new GRN using the form above 👆</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrnPage;