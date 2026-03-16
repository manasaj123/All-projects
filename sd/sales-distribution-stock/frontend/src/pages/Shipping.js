// frontend/src/pages/Shipping.js
import React, { useEffect, useState } from 'react';
import {
  getShippingConfigs,
  getDeletedShippingConfigs,
  createShippingConfig,
  updateShippingConfig,
  softDeleteShippingConfig,
  restoreShippingConfig,
} from '../services/shippingService';

const initialForm = {
  shippingPoint: '',
  description: '',
  defaultRoute: '',
  planningRelevant: true,
};

const Shipping = () => {
  const [shippingList, setShippingList] = useState([]);
  const [deletedShippingList, setDeletedShippingList] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getShippingConfigs(),
        getDeletedShippingConfigs(),
      ]);
      setShippingList(activeRes.data);
      setDeletedShippingList(deletedRes.data);
    } catch (err) {
      console.error('Error loading shipping data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.shippingPoint) {
      alert('Enter shipping point');
      return;
    }
    const payload = { ...formData };
    try {
      if (editingId) {
        await updateShippingConfig(editingId, payload);
      } else {
        await createShippingConfig(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving shipping config', err);
    }
  };

  const handleEdit = s => {
    setEditingId(s.id);
    setFormData({
      shippingPoint: s.shippingPoint || '',
      description: s.description || '',
      defaultRoute: s.defaultRoute || '',
      planningRelevant: !!s.planningRelevant,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this shipping point to recycle bin?')) return;
    try {
      await softDeleteShippingConfig(id);
      loadData();
    } catch (err) {
      console.error('Error deleting shipping config', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreShippingConfig(id);
      loadData();
    } catch (err) {
      console.error('Error restoring shipping config', err);
    }
  };

  const currentList = showDeleted ? deletedShippingList : shippingList;

  return (
    <div className="page-container">
      <h2>Shipping Point Configuration</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Shipping Point</label>
          <input
            name="shippingPoint"
            value={formData.shippingPoint}
            onChange={handleChange}
            required
            disabled={!!editingId}
          />
        </div>
        <div className="form-row">
          <label>Description</label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Default Route</label>
          <input
            name="defaultRoute"
            value={formData.defaultRoute}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>
            <input
              type="checkbox"
              name="planningRelevant"
              checked={formData.planningRelevant}
              onChange={handleChange}
            />
            Planning Relevant
          </label>
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Shipping Point' : 'Create Shipping Point'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Shipping Points'}</h3>
        <button onClick={() => setShowDeleted(v => !v)}>
          {showDeleted ? 'Show Active' : 'Show Recycle Bin'}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentList.length === 0 ? (
        <p>No records.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Shipping Point</th>
              <th>Description</th>
              <th>Default Route</th>
              <th>Planning Relevant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(s => (
              <tr key={s.id}>
                <td>{s.shippingPoint}</td>
                <td>{s.description}</td>
                <td>{s.defaultRoute}</td>
                <td>{s.planningRelevant ? 'Yes' : 'No'}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(s)}>Edit</button>
                      <button onClick={() => handleSoftDelete(s.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(s.id)}>
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Shipping;
