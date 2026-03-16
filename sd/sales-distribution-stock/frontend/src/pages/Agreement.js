// frontend/src/pages/Agreement.js
import React, { useEffect, useState } from 'react';
import {
  getAgreements,
  getDeletedAgreements,
  createAgreement,
  updateAgreement,
  softDeleteAgreement,
  restoreAgreement,
} from '../services/agreementService';

const initialForm = {
  vendorName: '',
  contractType: '',
  purchasingOrg: '',
  purchasingGroup: '',
  plant: '',
  agreementDate: '',
};

const Agreement = () => {
  const [agreements, setAgreements] = useState([]);
  const [deletedAgreements, setDeletedAgreements] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getAgreements(),
        getDeletedAgreements(),
      ]);
      setAgreements(activeRes.data);
      setDeletedAgreements(deletedRes.data);
    } catch (err) {
      console.error('Error loading agreements', err);
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
    if (!formData.vendorName) {
      alert('Enter vendor name');
      return;
    }
    if (!formData.contractType) {
      alert('Enter contract type');
      return;
    }
    if (!formData.purchasingOrg) {
      alert('Enter purchasing organization');
      return;
    }
    if (!formData.plant) {
      alert('Enter plant');
      return;
    }
    if (!formData.agreementDate) {
      alert('Select agreement date');
      return;
    }

    const payload = { ...formData };

    try {
      if (editingId) {
        await updateAgreement(editingId, payload);
      } else {
        await createAgreement(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving agreement', err);
    }
  };

  const handleEdit = a => {
    setEditingId(a.id);
    setFormData({
      vendorName: a.vendorName || '',
      contractType: a.contractType || '',
      purchasingOrg: a.purchasingOrg || '',
      purchasingGroup: a.purchasingGroup || '',
      plant: a.plant || '',
      agreementDate: a.agreementDate || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this agreement to recycle bin?')) return;
    try {
      await softDeleteAgreement(id);
      loadData();
    } catch (err) {
      console.error('Error deleting agreement', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreAgreement(id);
      loadData();
    } catch (err) {
      console.error('Error restoring agreement', err);
    }
  };

  const currentList = showDeleted ? deletedAgreements : agreements;

  return (
    <div className="page-container">
      <h2>Purchase Agreements</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Vendor Name</label>
          <input
            name="vendorName"
            value={formData.vendorName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Contract Type</label>
          <input
            name="contractType"
            value={formData.contractType}
            onChange={handleChange}
            placeholder="e.g. MK, WK"
            required
          />
        </div>
        <div className="form-row">
          <label>Purchasing Organization</label>
          <input
            name="purchasingOrg"
            value={formData.purchasingOrg}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Purchasing Group</label>
          <input
            name="purchasingGroup"
            value={formData.purchasingGroup}
            onChange={handleChange}
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
        <div className="form-row">
          <label>Agreement Date</label>
          <input
            type="date"
            name="agreementDate"
            value={formData.agreementDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Agreement' : 'Create Agreement'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Agreements'}</h3>
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
              <th>Vendor Name</th>
              <th>Contract Type</th>
              <th>Purch. Org</th>
              <th>Purch. Group</th>
              <th>Plant</th>
              <th>Agreement Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(a => (
              <tr key={a.id}>
                <td>{a.vendorName}</td>
                <td>{a.contractType}</td>
                <td>{a.purchasingOrg}</td>
                <td>{a.purchasingGroup}</td>
                <td>{a.plant}</td>
                <td>{a.agreementDate}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(a)}>Edit</button>
                      <button onClick={() => handleSoftDelete(a.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(a.id)}>
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

export default Agreement;
