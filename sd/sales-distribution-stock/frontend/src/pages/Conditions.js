// frontend/src/pages/Conditions.js
import React, { useEffect, useState } from 'react';
import {
  getConditions,
  getDeletedConditions,
  createCondition,
  updateCondition,
  softDeleteCondition,
  restoreCondition,
  getCustomers,
  getMaterials,
} from '../services/conditionService';

const initialForm = {
  conditionType: '',
  customerId: '',
  materialId: '',
  salesOrg: '',
  distributionChannel: '',
  price: '',
  currency: 'INR',
  validFrom: '',
  validTo: '',
};

const Conditions = () => {
  const [conditions, setConditions] = useState([]);
  const [deletedConditions, setDeletedConditions] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [condRes, delCondRes, custRes, matRes] = await Promise.all([
        getConditions(),
        getDeletedConditions(),
        getCustomers(),
        getMaterials(),
      ]);
      setConditions(condRes.data);
      setDeletedConditions(delCondRes.data);
      setCustomers(custRes.data);
      setMaterials(matRes.data);
    } catch (err) {
      console.error('Error loading conditions', err);
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
    if (!formData.conditionType) {
      alert('Enter condition type (e.g. PR00)');
      return;
    }
    if (!formData.price) {
      alert('Enter price');
      return;
    }
    const payload = {
      ...formData,
      customerId: formData.customerId ? Number(formData.customerId) : null,
      materialId: formData.materialId ? Number(formData.materialId) : null,
      price: Number(formData.price),
    };
    try {
      if (editingId) {
        await updateCondition(editingId, payload);
      } else {
        await createCondition(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving condition', err);
    }
  };

  const handleEdit = c => {
    setEditingId(c.id);
    setFormData({
      conditionType: c.conditionType || '',
      customerId: c.customerId || '',
      materialId: c.materialId || '',
      salesOrg: c.salesOrg || '',
      distributionChannel: c.distributionChannel || '',
      price: c.price || '',
      currency: c.currency || 'INR',
      validFrom: c.validFrom || '',
      validTo: c.validTo || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this condition record to recycle bin?')) return;
    try {
      await softDeleteCondition(id);
      loadData();
    } catch (err) {
      console.error('Error deleting condition', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreCondition(id);
      loadData();
    } catch (err) {
      console.error('Error restoring condition', err);
    }
  };

  const currentList = showDeleted ? deletedConditions : conditions;

  const displayCustomer = id => {
    if (!id) return '';
    const c = customers.find(x => x.id === id);
    return c ? `${c.customerCode} - ${c.name}` : id;
  };

  const displayMaterial = id => {
    if (!id) return '';
    const m = materials.find(x => x.id === id);
    return m ? `${m.materialCode} - ${m.description}` : id;
  };

  return (
    <div className="page-container">
      <h2>Pricing Conditions</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Key</h4>
        <div className="form-row">
          <label>Condition Type</label>
          <input
            name="conditionType"
            value={formData.conditionType}
            onChange={handleChange}
            placeholder="PR00, K004, etc."
            required
          />
        </div>
        <div className="form-row">
          <label>Customer (optional)</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
          >
            <option value="">None</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.customerCode} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Material (optional)</label>
          <select
            name="materialId"
            value={formData.materialId}
            onChange={handleChange}
          >
            <option value="">None</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.materialCode} - {m.description}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Sales Organization</label>
          <input
            name="salesOrg"
            value={formData.salesOrg}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Distribution Channel</label>
          <input
            name="distributionChannel"
            value={formData.distributionChannel}
            onChange={handleChange}
          />
        </div>

        <h4>Value</h4>
        <div className="form-row">
          <label>Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Currency</label>
          <input
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          />
        </div>

        <h4>Validity</h4>
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

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Condition' : 'Create Condition'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Conditions'}</h3>
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
              <th>Type</th>
              <th>Customer</th>
              <th>Material</th>
              <th>Sales Org</th>
              <th>Dist. Channel</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(c => (
              <tr key={c.id}>
                <td>{c.conditionType}</td>
                <td>{displayCustomer(c.customerId)}</td>
                <td>{displayMaterial(c.materialId)}</td>
                <td>{c.salesOrg}</td>
                <td>{c.distributionChannel}</td>
                <td>{c.price}</td>
                <td>{c.currency}</td>
                <td>{c.validFrom}</td>
                <td>{c.validTo}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(c)}>Edit</button>
                      <button onClick={() => handleSoftDelete(c.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(c.id)}>
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

export default Conditions;
