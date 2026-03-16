// frontend/src/pages/Credit.js
import React, { useEffect, useState } from 'react';
import {
  getCredits,
  getDeletedCredits,
  createCredit,
  updateCredit,
  softDeleteCredit,
  restoreCredit,
  getCustomers,
} from '../services/creditService';

const initialForm = {
  customerId: '',
  creditLimit: '',
  currency: 'INR',
  riskCategory: '',
  creditGroup: '',
};

const Credit = () => {
  const [credits, setCredits] = useState([]);
  const [deletedCredits, setDeletedCredits] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [credRes, delCredRes, custRes] = await Promise.all([
        getCredits(),
        getDeletedCredits(),
        getCustomers(),
      ]);
      setCredits(credRes.data);
      setDeletedCredits(delCredRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error('Error loading credit data', err);
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
    if (!formData.customerId) {
      alert('Select customer');
      return;
    }
    if (!formData.creditLimit) {
      alert('Enter credit limit');
      return;
    }

    const payload = {
      ...formData,
      customerId: Number(formData.customerId),
      creditLimit: Number(formData.creditLimit),
    };

    try {
      if (editingId) {
        await updateCredit(editingId, payload);
      } else {
        await createCredit(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving credit', err);
    }
  };

  const handleEdit = c => {
    setEditingId(c.id);
    setFormData({
      customerId: c.customerId || '',
      creditLimit: c.creditLimit || '',
      currency: c.currency || 'INR',
      riskCategory: c.riskCategory || '',
      creditGroup: c.creditGroup || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this credit record to recycle bin?')) return;
    try {
      await softDeleteCredit(id);
      loadData();
    } catch (err) {
      console.error('Error deleting credit', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreCredit(id);
      loadData();
    } catch (err) {
      console.error('Error restoring credit', err);
    }
  };

  const currentList = showDeleted ? deletedCredits : credits;

  const displayCustomer = id => {
    const c = customers.find(x => x.id === id);
    return c ? `${c.customerCode} - ${c.name}` : id;
  };

  return (
    <div className="page-container">
      <h2>Credit Management</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Customer</h4>
        <div className="form-row">
          <label>Customer</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.customerCode} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <h4>Credit Data</h4>
        <div className="form-row">
          <label>Credit Limit</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="creditLimit"
            value={formData.creditLimit}
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
        <div className="form-row">
          <label>Risk Category</label>
          <input
            name="riskCategory"
            value={formData.riskCategory}
            onChange={handleChange}
            placeholder="e.g. A, B, C"
          />
        </div>
        <div className="form-row">
          <label>Credit Group</label>
          <input
            name="creditGroup"
            value={formData.creditGroup}
            onChange={handleChange}
            placeholder="e.g. 001, 002"
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Credit' : 'Create Credit'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Credit Records'}</h3>
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
              <th>Customer</th>
              <th>Credit Limit</th>
              <th>Currency</th>
              <th>Risk Category</th>
              <th>Credit Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(c => (
              <tr key={c.id}>
                <td>{displayCustomer(c.customerId)}</td>
                <td>{c.creditLimit}</td>
                <td>{c.currency}</td>
                <td>{c.riskCategory}</td>
                <td>{c.creditGroup}</td>
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

export default Credit;
