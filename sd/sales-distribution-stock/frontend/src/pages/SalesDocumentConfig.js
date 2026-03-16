// frontend/src/pages/SalesDocumentConfig.js
import React, { useEffect, useState } from 'react';
import {
  getSalesDocuments,
  getDeletedSalesDocuments,
  createSalesDocument,
  updateSalesDocument,
  softDeleteSalesDocument,
  restoreSalesDocument,
} from '../services/salesDocumentService';

const initialForm = {
  salesDocumentType: '',
  description: '',
  itemCategoryDetermination: '',
  scheduleLineCategoryDetermination: '',
  pricingProcedure: '',
  creditCheck: '',
};

const SalesDocumentConfig = () => {
  const [docs, setDocs] = useState([]);
  const [deletedDocs, setDeletedDocs] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getSalesDocuments(),
        getDeletedSalesDocuments(),
      ]);
      setDocs(activeRes.data);
      setDeletedDocs(deletedRes.data);
    } catch (err) {
      console.error('Error loading sales document config', err);
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
    if (!formData.salesDocumentType) {
      alert('Enter sales document type');
      return;
    }

    const payload = { ...formData };

    try {
      if (editingId) {
        await updateSalesDocument(editingId, payload);
      } else {
        await createSalesDocument(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving sales document config', err);
    }
  };

  const handleEdit = row => {
    setEditingId(row.id);
    setFormData({
      salesDocumentType: row.salesDocumentType || '',
      description: row.description || '',
      itemCategoryDetermination:
        row.itemCategoryDetermination || '',
      scheduleLineCategoryDetermination:
        row.scheduleLineCategoryDetermination || '',
      pricingProcedure: row.pricingProcedure || '',
      creditCheck: row.creditCheck || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this sales document config to recycle bin?'))
      return;
    try {
      await softDeleteSalesDocument(id);
      loadData();
    } catch (err) {
      console.error('Error deleting sales document config', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreSalesDocument(id);
      loadData();
    } catch (err) {
      console.error('Error restoring sales document config', err);
    }
  };

  const currentList = showDeleted ? deletedDocs : docs;

  return (
    <div className="page-container">
      <h2>Sales Document Configuration</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Sales Document Type</label>
          <input
            name="salesDocumentType"
            value={formData.salesDocumentType}
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
          <label>Item Category Determination</label>
          <input
            name="itemCategoryDetermination"
            value={formData.itemCategoryDetermination}
            onChange={handleChange}
            placeholder="e.g. TAN, TAD"
          />
        </div>
        <div className="form-row">
          <label>Schedule Line Category Determination</label>
          <input
            name="scheduleLineCategoryDetermination"
            value={formData.scheduleLineCategoryDetermination}
            onChange={handleChange}
            placeholder="e.g. CP, CN"
          />
        </div>
        <div className="form-row">
          <label>Pricing Procedure</label>
          <input
            name="pricingProcedure"
            value={formData.pricingProcedure}
            onChange={handleChange}
            placeholder="e.g. RVAA01"
          />
        </div>
        <div className="form-row">
          <label>Credit Check</label>
          <input
            name="creditCheck"
            value={formData.creditCheck}
            onChange={handleChange}
            placeholder="Y / N"
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId
              ? 'Update Sales Document Type'
              : 'Create Sales Document Type'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>
          {showDeleted
            ? 'Recycle Bin'
            : 'Active Sales Document Types'}
        </h3>
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
              <th>Sales Document Type</th>
              <th>Description</th>
              <th>Item Category Determination</th>
              <th>Schedule Line Category Determination</th>
              <th>Pricing Procedure</th>
              <th>Credit Check</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(row => (
              <tr key={row.id}>
                <td>{row.salesDocumentType}</td>
                <td>{row.description}</td>
                <td>{row.itemCategoryDetermination}</td>
                <td>{row.scheduleLineCategoryDetermination}</td>
                <td>{row.pricingProcedure}</td>
                <td>{row.creditCheck}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(row)}>Edit</button>
                      <button onClick={() => handleSoftDelete(row.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(row.id)}>
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

export default SalesDocumentConfig;
