
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [bins, setBins] = useState([]);

  
  const [newBin, setNewBin] = useState({
    bin_code: '',
    capacity: 1000,
    zone: 'A'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const whRes = await axiosClient.get('/warehouse');
      setWarehouses(whRes.data || []);

      const binRes = await axiosClient.get('/warehouse/1/bins');
      console.log('BIN API response:', binRes.data);
      setBins(binRes.data || []);
    } catch (error) {
      console.error('Load error:', error);
      setWarehouses([]);
      setBins([]);
    }
  };

  const binColumns = [
    { key: 'bin_code', label: 'Bin Code' },
    { key: 'zone', label: 'Zone' },
    { key: 'current_usage', label: 'Usage' },
    { key: 'capacity', label: 'Capacity' }
  ];

  const handleAddBin = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/warehouse/1/bins', {
        bin_code: newBin.bin_code,
        capacity: Number(newBin.capacity),
        zone: newBin.zone
      });
      setNewBin({ bin_code: '', capacity: 1000, zone: 'A' });
      await loadData(); 
    } catch (err) {
      console.error('Add bin error:', err.response?.data || err.message);
      alert('Failed to add bin: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🏭 Warehouse Layout & Bins</h1>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Total Warehouses</h3>
          <p className="metric-value">{warehouses.length}</p>
        </div>
        <div className="card">
          <h3>Active Bins</h3>
          <p className="metric-value">{bins.length}</p>
        </div>
      </div>

      
      <div className="card">
        <h3>Add Bin</h3>
        <form onSubmit={handleAddBin} className="inline-form">
          <div className="form-group">
            <label>Bin Code</label>
            <input
              value={newBin.bin_code}
              onChange={e => setNewBin({ ...newBin, bin_code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              value={newBin.capacity}
              onChange={e => setNewBin({ ...newBin, capacity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Zone</label>
            <input
              value={newBin.zone}
              onChange={e => setNewBin({ ...newBin, zone: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-warning">
            Add Bin
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Bin Management</h3>
        <Table columns={binColumns} data={bins} />
      </div>
    </div>
  );
};

export default WarehousePage;
