import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const CycleCountPage = () => {
  const [pendingCounts, setPendingCounts] = useState([]);
  const [formData, setFormData] = useState({
    warehouse_id: '',
    bin_id: '',
    item_id: '',
    scheduled_date: new Date().toISOString().split('T')[0],
  });
  const [countInput, setCountInput] = useState({}); 

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const res = await axiosClient.get('/cycle-counts/pending');
      setPendingCounts(res.data || []);
    } catch (err) {
      console.error('Cycle counts load failed:', err);
      setPendingCounts([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        warehouse_id: parseInt(formData.warehouse_id, 10),
        bin_id: parseInt(formData.bin_id, 10),
        item_id: parseInt(formData.item_id, 10),
        scheduled_date: formData.scheduled_date,
      };
      await axiosClient.post('/cycle-counts', payload);
      alert('✅ Cycle count created');
      setFormData({
        warehouse_id: '',
        bin_id: '',
        item_id: '',
        scheduled_date: new Date().toISOString().split('T')[0],
      });
      loadPending();
    } catch (err) {
      alert('❌ Failed to create cycle count');
    }
  };

  const handleComplete = async (id) => {
    const qty = Number(countInput[id] || 0);
    if (Number.isNaN(qty)) {
      alert('Enter a valid number');
      return;
    }

    try {
      await axiosClient.post(`/cycle-counts/${id}/complete`, { counted_qty: qty });
      alert('✅ Cycle count completed');
      const newInput = { ...countInput };
      delete newInput[id];
      setCountInput(newInput);
      loadPending();
    } catch (err) {
      alert('❌ Failed to complete cycle count');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'warehouse_name', label: 'Warehouse' },
    { key: 'bin_code', label: 'Bin' },
    { key: 'sku', label: 'SKU' },
    { key: 'item_name', label: 'Item' },
    { key: 'scheduled_date', label: 'Scheduled Date' },
    {
      key: 'count',
      label: 'Counted Qty',
      render: (row) => (
        <input
          type="number"
          style={{ width: '90px' }}
          value={countInput[row.id] ?? ''}
          onChange={(e) =>
            setCountInput({ ...countInput, [row.id]: e.target.value })
          }
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          className="btn btn-success"
          onClick={() => handleComplete(row.id)}
        >
          ✅ Complete
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Cycle Counting</h1>
      </div>

      <div className="card">
        <h3>➕ Create Cycle Count Task</h3>
        <form onSubmit={handleCreate} style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label>Warehouse ID *</label>
            <input
              type="number"
              value={formData.warehouse_id}
              onChange={(e) =>
                setFormData({ ...formData, warehouse_id: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Bin ID *</label>
            <input
              type="number"
              value={formData.bin_id}
              onChange={(e) =>
                setFormData({ ...formData, bin_id: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Item ID *</label>
            <input
              type="number"
              value={formData.item_id}
              onChange={(e) =>
                setFormData({ ...formData, item_id: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Scheduled Date *</label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Create Task
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Pending Cycle Counts ({pendingCounts.length})</h3>
        {pendingCounts.length ? (
          <Table columns={columns} data={pendingCounts} />
        ) : (
          <p className="no-data">No pending cycle counts 🎉</p>
        )}
      </div>
    </div>
  );
};

export default CycleCountPage;
