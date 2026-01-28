import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import '../pages/style.css';

const TransferPage = () => {
  const [formData, setFormData] = useState({
    from_bin_id: '1',
    to_bin_id: '1',
    item_id: '1',
    qty: 0
  });

  const [transfers, setTransfers] = useState([]);

  const fetchTransfers = async () => {
    try {
      const res = await axiosClient.get('/transfer');
      setTransfers(res.data);
    } catch (err) {
      console.error('Fetch transfers error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();

    const payload = {
      from_bin_id: Number(formData.from_bin_id),
      to_bin_id: Number(formData.to_bin_id),
      item_id: Number(formData.item_id),
      qty: Number(formData.qty)
    };

    console.log('Transfer payload:', payload);

    try {
      await axiosClient.post('/transfer', payload);
      alert('Transfer completed!');
      setFormData({
        from_bin_id: '1',
        to_bin_id: '1',
        item_id: '1',
        qty: 0
      });
      
      fetchTransfers();
    } catch (err) {
      console.error('Transfer error:', err.response?.data || err.message);
      alert('Failed to transfer: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔄 Stock Transfer</h1>
      </div>

      <div className="card">
        <h3>New Stock Transfer</h3>
        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label>From Bin ID</label>
            <input
              value={formData.from_bin_id}
              onChange={e => setFormData({ ...formData, from_bin_id: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>To Bin ID</label>
            <input
              value={formData.to_bin_id}
              onChange={e => setFormData({ ...formData, to_bin_id: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Item ID</label>
            <input
              value={formData.item_id}
              onChange={e => setFormData({ ...formData, item_id: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={formData.qty}
              onChange={e => setFormData({ ...formData, qty: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-warning">Transfer Stock</button>
        </form>
      </div>

      
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Recent Transfers</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Transfer No</th>
              <th>From Bin</th>
              <th>To Bin</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.transfer_no}>
                <td>{t.transfer_no}</td>
                <td>{t.from_bin_id}</td>
                <td>{t.to_bin_id}</td>
                <td>{t.item_id}</td>
                <td>{t.qty}</td>
                <td>{t.status}</td>
                <td>{new Date(t.transfer_date).toLocaleString()}</td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr>
                <td colSpan="7">No transfers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferPage;
