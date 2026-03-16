// frontend/src/pages/Billing.js
import React, { useEffect, useState } from 'react';
import {
  getBillings,
  getDeletedBillings,
  createBilling,
  updateBilling,
  softDeleteBilling,
  restoreBilling,
  getDeliveries,
} from '../services/billingService';

const initialForm = {
  billingType: '',
  billingDate: '',
  referenceDeliveryId: '',
  documentNumber: '',
  totalAmount: '',
  currency: 'INR',
};

const Billing = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [billings, setBillings] = useState([]);
  const [deletedBillings, setDeletedBillings] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [delRes, activeRes, deletedRes] = await Promise.all([
        getDeliveries(),
        getBillings(),
        getDeletedBillings(),
      ]);
      setDeliveries(delRes.data);
      setBillings(activeRes.data);
      setDeletedBillings(deletedRes.data);
    } catch (err) {
      console.error('Error loading billing data', err);
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
    if (!formData.billingType) {
      alert('Enter billing type');
      return;
    }
    if (!formData.referenceDeliveryId) {
      alert('Select reference delivery');
      return;
    }
    if (!formData.documentNumber) {
      alert('Enter billing document number');
      return;
    }
    if (!formData.totalAmount) {
      alert('Enter total amount');
      return;
    }

    const payload = {
      ...formData,
      totalAmount: Number(formData.totalAmount),
    };

    try {
      if (editingId) {
        await updateBilling(editingId, payload);
      } else {
        await createBilling(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving billing', err);
    }
  };

  const handleEdit = b => {
    setEditingId(b.id);
    setFormData({
      billingType: b.billingType || '',
      billingDate: b.billingDate || '',
      referenceDeliveryId: b.referenceDeliveryId || '',
      documentNumber: b.documentNumber || '',
      totalAmount: b.totalAmount || '',
      currency: b.currency || 'INR',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this billing document to recycle bin?')) return;
    try {
      await softDeleteBilling(id);
      loadData();
    } catch (err) {
      console.error('Error deleting billing', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreBilling(id);
      loadData();
    } catch (err) {
      console.error('Error restoring billing', err);
    }
  };

  const currentList = showDeleted ? deletedBillings : billings;

  const displayDeliveryRef = id => {
    const d = deliveries.find(x => x.id === id);
    return d ? `DEL-${d.id}` : id;
  };

  return (
    <div className="page-container">
      <h2>Billing</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Header</h4>
        <div className="form-row">
          <label>Billing Type</label>
          <input
            name="billingType"
            value={formData.billingType}
            onChange={handleChange}
            placeholder="e.g. F2"
            required
          />
        </div>
        <div className="form-row">
          <label>Billing Date</label>
          <input
            type="date"
            name="billingDate"
            value={formData.billingDate}
            onChange={handleChange}
            required
          />
        </div>

        <h4>Reference</h4>
        <div className="form-row">
          <label>Reference Delivery</label>
          <select
            name="referenceDeliveryId"
            value={formData.referenceDeliveryId}
            onChange={handleChange}
            required
          >
            <option value="">Select Delivery</option>
            {deliveries.map(d => (
              <option key={d.id} value={d.id}>
                DEL-{d.id}
              </option>
            ))}
          </select>
        </div>

        <h4>Amounts</h4>
        <div className="form-row">
          <label>Billing Document Number</label>
          <input
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Total Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="totalAmount"
            value={formData.totalAmount}
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

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Billing' : 'Create Billing'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Billing Documents'}</h3>
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
              <th>Billing Type</th>
              <th>Billing Date</th>
              <th>Delivery</th>
              <th>Document No.</th>
              <th>Total Amount</th>
              <th>Currency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(b => (
              <tr key={b.id}>
                <td>{b.billingType}</td>
                <td>{b.billingDate}</td>
                <td>{displayDeliveryRef(b.referenceDeliveryId)}</td>
                <td>{b.documentNumber}</td>
                <td>{b.totalAmount}</td>
                <td>{b.currency}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(b)}>Edit</button>
                      <button onClick={() => handleSoftDelete(b.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(b.id)}>
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

export default Billing;
