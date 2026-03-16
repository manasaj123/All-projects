// frontend/src/pages/PricingConfig.js
import React, { useEffect, useState } from 'react';
import {
  getPricingConfigs,
  getDeletedPricingConfigs,
  createPricingConfig,
  updatePricingConfig,
  softDeletePricingConfig,
  restorePricingConfig,
} from '../services/pricingConfigService';

const initialForm = {
  pricingProcedure: '',
  description: '',
};

const PricingConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [deletedConfigs, setDeletedConfigs] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getPricingConfigs(),
        getDeletedPricingConfigs(),
      ]);
      setConfigs(activeRes.data);
      setDeletedConfigs(deletedRes.data);
    } catch (err) {
      console.error('Error loading pricing configs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.pricingProcedure) {
      alert('Enter pricing procedure');
      return;
    }

    const payload = { ...formData };

    try {
      if (editingId) {
        await updatePricingConfig(editingId, payload);
      } else {
        await createPricingConfig(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving pricing config', err);
    }
  };

  const handleEdit = p => {
    setEditingId(p.id);
    setFormData({
      pricingProcedure: p.pricingProcedure || '',
      description: p.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this pricing config to recycle bin?')) return;
    try {
      await softDeletePricingConfig(id);
      loadData();
    } catch (err) {
      console.error('Error deleting pricing config', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restorePricingConfig(id);
      loadData();
    } catch (err) {
      console.error('Error restoring pricing config', err);
    }
  };

  const currentList = showDeleted ? deletedConfigs : configs;

  return (
    <div className="page-container">
      <h2>Pricing Procedure Configuration</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Pricing Procedure</label>
          <input
            name="pricingProcedure"
            value={formData.pricingProcedure}
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

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Pricing Procedure' : 'Create Pricing Procedure'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Pricing Procedures'}</h3>
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
              <th>Pricing Procedure</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(p => (
              <tr key={p.id}>
                <td>{p.pricingProcedure}</td>
                <td>{p.description}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(p)}>Edit</button>
                      <button onClick={() => handleSoftDelete(p.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(p.id)}>
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

export default PricingConfig;
