// frontend/src/pages/MaterialStock.js
import React, { useEffect, useState } from 'react';
import {
  getMaterials,
  getDeletedMaterials,
  createMaterial,
  updateMaterial,
  softDeleteMaterial,
  restoreMaterial,
} from '../services/materialService';

const initialForm = {
  materialCode: '',
  description: '',
  baseUom: '',
  materialType: '',
  industrySector: '',
  documentDate: '',
  plant: '',
  storageLocation: '',
  movementType: '',
};

const MaterialStock = () => {
  const [materials, setMaterials] = useState([]);
  const [deletedMaterials, setDeletedMaterials] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getMaterials(),
        getDeletedMaterials(),
      ]);
      setMaterials(activeRes.data);
      setDeletedMaterials(deletedRes.data);
    } catch (err) {
      console.error('Error loading materials', err);
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
    try {
      if (editingId) {
        await updateMaterial(editingId, formData);
      } else {
        await createMaterial(formData);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving material', err);
    }
  };

  const handleEdit = material => {
    setEditingId(material.id);
    setFormData({
      materialCode: material.materialCode || '',
      description: material.description || '',
      baseUom: material.baseUom || '',
      materialType: material.materialType || '',
      industrySector: material.industrySector || '',
      documentDate: material.documentDate || '',
      plant: material.plant || '',
      storageLocation: material.storageLocation || '',
      movementType: material.movementType || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this material to recycle bin?')) return;
    try {
      await softDeleteMaterial(id);
      loadData();
    } catch (err) {
      console.error('Error deleting material', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreMaterial(id);
      loadData();
    } catch (err) {
      console.error('Error restoring material', err);
    }
  };

  const currentList = showDeleted ? deletedMaterials : materials;

  return (
    <div className="page-container material-stock-page">
      <h2>Material Stock</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className="form-row-3">
          <div className="form-field">
            <label>Material Code</label>
            <input
              name="materialCode"
              value={formData.materialCode}
              onChange={handleChange}
              required
              disabled={!!editingId}
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Base UoM</label>
            <input
              name="baseUom"
              value={formData.baseUom}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row-3">
          <div className="form-field">
            <label>Material Type</label>
            <input
              name="materialType"
              value={formData.materialType}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Industry Sector</label>
            <input
              name="industrySector"
              value={formData.industrySector}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Document Date</label>
            <input
              type="date"
              name="documentDate"
              value={formData.documentDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="form-row-3">
          <div className="form-field">
            <label>Plant</label>
            <input
              name="plant"
              value={formData.plant}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>Storage Location</label>
            <input
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>Movement Type</label>
            <input
              name="movementType"
              value={formData.movementType}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Material' : 'Create Material'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Materials'}</h3>
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
              <th>Code</th>
              <th>Description</th>
              <th>Base UoM</th>
              <th>Type</th>
              <th>Sector</th>
              <th>Plant</th>
              <th>Storage Loc</th>
              <th>Movement</th>
              <th>Document Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(m => (
              <tr key={m.id}>
                <td>{m.materialCode}</td>
                <td>{m.description}</td>
                <td>{m.baseUom}</td>
                <td>{m.materialType}</td>
                <td>{m.industrySector}</td>
                <td>{m.plant}</td>
                <td>{m.storageLocation}</td>
                <td>{m.movementType}</td>
                <td>{m.documentDate}</td>
                <td>
  {!showDeleted && (
    <div className="table-actions">
      <button onClick={() => handleEdit(m)}>Edit</button>
      <button onClick={() => handleSoftDelete(m.id)}>Delete</button>
    </div>
  )}
  {showDeleted && (
    <button onClick={() => handleRestore(m.id)}>Restore</button>
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

export default MaterialStock;
