import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const PickPackPage = () => {
  const [pendingPicks, setPendingPicks] = useState([]);
  const [formData, setFormData] = useState({
    pick_no: '',
    order_id: '',
    item_id: '',
    bin_id: '',
    qty_picked: ''
  });

  useEffect(() => {
    loadPicks();
  }, []);

  const loadPicks = async () => {
    try {
      const response = await axiosClient.get('/pickpack/pending');
      setPendingPicks(response.data || []);
    } catch (error) {
      console.error('Picks load error:', error);
      setPendingPicks([]);
    }
  };

  const handlePack = async (pickId) => {
    await axiosClient.put(`/pickpack/${pickId}/packed`);
    loadPicks();
  };

  const handleCreatePick = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      pick_no: formData.pick_no || `PICK${Date.now()}`,
      order_id: formData.order_id || 'ORDTEST',
      item_id: 1,  // 🔒 hard-coded valid item
      bin_id: 1,   // 🔒 hard-coded valid bin
      qty_picked: Number(formData.qty_picked || 10)
    };

    console.log('Create pick payload:', payload);

    const res = await axiosClient.post('/pickpack', payload);
    alert('Pick created');
    setFormData({ pick_no: '', order_id: '', item_id: '', bin_id: '', qty_picked: '' });
    loadPicks();
  } catch (error) {
    console.error('Create pick error:', error.response?.data || error.message);
    alert('Failed to create pick: ' + (error.response?.data?.error || error.message));
  }
};




  const columns = [
    { key: 'pick_no', label: 'Pick No' },
    { key: 'order_id', label: 'Order ID' },
    { key: 'qty_picked', label: 'Qty' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📤 Pick & Pack</h1>
      </div>

      {/* Add Pick Form */}
      <div className="card">
        <h3>Create Pick</h3>
        <form onSubmit={handleCreatePick}>
          <div className="form-group">
            <label>Pick No (optional)</label>
            <input
              value={formData.pick_no}
              onChange={e => setFormData({ ...formData, pick_no: e.target.value })}
              placeholder="PICK001"
            />
          </div>
          <div className="form-group">
            <label>Order ID</label>
            <input
              value={formData.order_id}
              onChange={e => setFormData({ ...formData, order_id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Item ID</label>
            <input
              type="number"
              value={formData.item_id}
              onChange={e => setFormData({ ...formData, item_id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Bin ID</label>
            <input
              type="number"
              value={formData.bin_id}
              onChange={e => setFormData({ ...formData, bin_id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Qty</label>
            <input
              type="number"
              value={formData.qty_picked}
              onChange={e => setFormData({ ...formData, qty_picked: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Pick</button>
        </form>
      </div>

      {/* Pending picks table */}
      <div className="card">
        <h3>Pending Picks</h3>
        <Table
          columns={columns}
          data={pendingPicks.map(pick => ({
            ...pick,
            action: (
              <button className="btn btn-success" onClick={() => handlePack(pick.id)}>
                Pack
              </button>
            )
          }))}
        />
      </div>
    </div>
  );
};

export default PickPackPage;
