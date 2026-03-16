// frontend/src/pages/Quota.js
import React, { useEffect, useState } from 'react';
import {
  getQuotas,
  getDeletedQuotas,
  createQuota,
  updateQuota,
  softDeleteQuota,
  restoreQuota,
} from '../services/quotaService';

const initialForm = {
  purchasingGroup: '',
  plant: '',
  plantSpecialMaterialStatus: '',
  taxIndicatorForMaterial: '',
  materialFreightGroup: '',
  materialGroup: '',
  validFrom: '',
  validTo: '',
  quotaUsage: '',
};

const Quota = () => {
  const [quotas, setQuotas] = useState([]);
  const [deletedQuotas, setDeletedQuotas] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getQuotas(),
        getDeletedQuotas(),
      ]);
      setQuotas(activeRes.data);
      setDeletedQuotas(deletedRes.data);
    } catch (err) {
      console.error('Error loading quotas', err);
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
    if (!formData.purchasingGroup) {
      alert('Enter purchasing group');
      return;
    }
    if (!formData.plant) {
      alert('Enter plant');
      return;
    }

    const payload = { ...formData };

    try {
      if (editingId) {
        await updateQuota(editingId, payload);
      } else {
        await createQuota(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving quota', err);
    }
  };

  const handleEdit = q => {
    setEditingId(q.id);
    setFormData({
      purchasingGroup: q.purchasingGroup || '',
      plant: q.plant || '',
      plantSpecialMaterialStatus: q.plantSpecialMaterialStatus || '',
      taxIndicatorForMaterial: q.taxIndicatorForMaterial || '',
      materialFreightGroup: q.materialFreightGroup || '',
      materialGroup: q.materialGroup || '',
      validFrom: q.validFrom || '',
      validTo: q.validTo || '',
      quotaUsage: q.quotaUsage || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this quota record to recycle bin?')) return;
    try {
      await softDeleteQuota(id);
      loadData();
    } catch (err) {
      console.error('Error deleting quota', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreQuota(id);
      loadData();
    } catch (err) {
      console.error('Error restoring quota', err);
    }
  };

  const currentList = showDeleted ? deletedQuotas : quotas;

  return (
    <div className="page-container">
      <h2>Quota Arrangement</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Key</h4>
        <div className="form-row">
          <label>Purchasing Group</label>
          <input
            name="purchasingGroup"
            value={formData.purchasingGroup}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Plant</label>
          <input
            name="plant"
            value={formData.plant}
            onChange={handleChange}
            required
          />
        </div>

        <h4>Material Attributes</h4>
        <div className="form-row">
          <label>Plant Special Material Status</label>
          <input
            name="plantSpecialMaterialStatus"
            value={formData.plantSpecialMaterialStatus}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Tax Indicator for Material</label>
          <input
            name="taxIndicatorForMaterial"
            value={formData.taxIndicatorForMaterial}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Material Freight Group</label>
          <input
            name="materialFreightGroup"
            value={formData.materialFreightGroup}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Material Group</label>
          <input
            name="materialGroup"
            value={formData.materialGroup}
            onChange={handleChange}
          />
        </div>

        <h4>Validity & Usage</h4>
        <div className="form-row">
          <label>Valid From</label>
          <input
            type="date"
            name="validFrom"
            value={formData.validFrom}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Valid To</label>
          <input
            type="date"
            name="validTo"
            value={formData.validTo}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Quota Usage</label>
          <input
            name="quotaUsage"
            value={formData.quotaUsage}
            onChange={handleChange}
            placeholder="e.g. 1, 2, A, B"
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Quota' : 'Create Quota'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Quota Records'}</h3>
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
              <th>Purch. Group</th>
              <th>Plant</th>
              <th>Plant Spec. Status</th>
              <th>Tax Indicator</th>
              <th>Mat. Freight Group</th>
              <th>Material Group</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Quota Usage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(q => (
              <tr key={q.id}>
                <td>{q.purchasingGroup}</td>
                <td>{q.plant}</td>
                <td>{q.plantSpecialMaterialStatus}</td>
                <td>{q.taxIndicatorForMaterial}</td>
                <td>{q.materialFreightGroup}</td>
                <td>{q.materialGroup}</td>
                <td>{q.validFrom}</td>
                <td>{q.validTo}</td>
                <td>{q.quotaUsage}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(q)}>Edit</button>
                      <button onClick={() => handleSoftDelete(q.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(q.id)}>
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

export default Quota;
