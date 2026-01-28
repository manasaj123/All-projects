
import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    unit: '',
    expiry_days: 0
  });

  
  useEffect(() => {
    loadItems();
    loadInventory();
  }, []);

  const loadItems = async () => {
    try {
      const response = await axiosClient.get('/item'); 
      setItems(response.data || []);
    } catch (err) {
      console.error('Items load failed:', err.response?.data || err.message);
      setItems([]);
    }
  };

  const loadInventory = async () => {
  try {
    const response = await axiosClient.get('/inventory'); // -> /api/inventory
    setInventory(response.data || []);
  } catch (error) {
    console.error('Inventory load failed:', error.response?.data || error.message);
    setInventory([]);
  }
};


  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/item', formData);
      setFormData({ sku: '', name: '', unit: '', expiry_days: 0 });
      await loadItems();      
      await loadInventory();  
    } catch (err) {
      console.error('Add item failed:', err.response?.data || err.message);
      alert('Failed to add item: ' + (err.response?.data?.error || err.message));
    }
  };

  const itemColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Name' },
    { key: 'unit', label: 'Unit' },
    { key: 'expiry_days', label: 'Expiry Days' }
  ];

  const inventoryColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Item' },
    { key: 'qty', label: 'Quantity' },
    { key: 'bin_code', label: 'Bin' },
    { key: 'expiry_date', label: 'Expiry' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📋 Items & 📦 Inventory</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={loadInventory}
        >
          Refresh Inventory
        </button>
      </div>

      
      <div className="card">
        <h3>Add New Item</h3>
        <form onSubmit={handleAddItem}>
          <div className="form-group">
            <label>SKU *</label>
            <input
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Name *</label>
            <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Expiry Days</label>
            <input
              type="number"
              value={formData.expiry_days}
              onChange={e =>
                setFormData({ ...formData, expiry_days: e.target.value })
              }
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Item
          </button>
        </form>
      </div>

      
      <div className="card">
        <h3>All Items ({items.length})</h3>
        <Table columns={itemColumns} data={items} />
      </div>

      
      <div className="card">
        <h3>Current Stock (FIFO Order)</h3>
        <Table columns={inventoryColumns} data={inventory} />
      </div>
    </div>
  );
};

export default InventoryPage;
