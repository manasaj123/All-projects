// frontend/src/pages/ItemCategoriesConfig.js
import React, { useEffect, useState } from 'react';
import {
  getItemCategories,
  getDeletedItemCategories,
  createItemCategory,
  updateItemCategory,
  softDeleteItemCategory,
  restoreItemCategory,
} from '../services/itemCategoryService';

const initialForm = {
  itemCategory: '',
  description: '',
  scheduleLineAllowed: '',
  billingRelevant: '',
  creditActive: '',
};

const ItemCategoriesConfig = () => {
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getItemCategories(),
        getDeletedItemCategories(),
      ]);
      setItems(activeRes.data);
      setDeletedItems(deletedRes.data);
    } catch (err) {
      console.error('Error loading item categories', err);
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
    if (!formData.itemCategory) {
      alert('Enter item category');
      return;
    }

    const payload = { ...formData };

    try {
      if (editingId) {
        await updateItemCategory(editingId, payload);
      } else {
        await createItemCategory(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving item category', err);
    }
  };

  const handleEdit = row => {
    setEditingId(row.id);
    setFormData({
      itemCategory: row.itemCategory || '',
      description: row.description || '',
      scheduleLineAllowed: row.scheduleLineAllowed || '',
      billingRelevant: row.billingRelevant || '',
      creditActive: row.creditActive || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this item category to recycle bin?')) return;
    try {
      await softDeleteItemCategory(id);
      loadData();
    } catch (err) {
      console.error('Error deleting item category', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreItemCategory(id);
      loadData();
    } catch (err) {
      console.error('Error restoring item category', err);
    }
  };

  const currentList = showDeleted ? deletedItems : items;

  return (
    <div className="page-container">
      <h2>Item Categories Configuration</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Item Category</label>
          <input
            name="itemCategory"
            value={formData.itemCategory}
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
          <label>Schedule Line Allowed</label>
          <input
            name="scheduleLineAllowed"
            value={formData.scheduleLineAllowed}
            onChange={handleChange}
            placeholder="Y / N"
          />
        </div>
        <div className="form-row">
          <label>Billing Relevant</label>
          <input
            name="billingRelevant"
            value={formData.billingRelevant}
            onChange={handleChange}
            placeholder="Y / N"
          />
        </div>
        <div className="form-row">
          <label>Credit Active</label>
          <input
            name="creditActive"
            value={formData.creditActive}
            onChange={handleChange}
            placeholder="Y / N"
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Item Category' : 'Create Item Category'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Item Categories'}</h3>
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
              <th>Item Category</th>
              <th>Description</th>
              <th>Schedule Line Allowed</th>
              <th>Billing Relevant</th>
              <th>Credit Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(row => (
              <tr key={row.id}>
                <td>{row.itemCategory}</td>
                <td>{row.description}</td>
                <td>{row.scheduleLineAllowed}</td>
                <td>{row.billingRelevant}</td>
                <td>{row.creditActive}</td>
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

export default ItemCategoriesConfig;
