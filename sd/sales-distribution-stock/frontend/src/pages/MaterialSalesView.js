// frontend/src/pages/MaterialSalesView.js
import React, { useEffect, useState } from 'react';
import {
  getSalesViews,
  getDeletedSalesViews,
  createSalesView,
  updateSalesView,
  softDeleteSalesView,
  restoreSalesView,
  getMaterials,
} from '../services/salesService';

const initialForm = {
  materialId: '',
  salesOrg: '',
  distributionChannel: '',
  division: '',
  deliveringPlant: '',
  itemCategoryGroup: '',
  loadingGroup: '',
  accountAssignmentGroup: '',
  priceGroup: '',
  priceList: '',
  availabilityCheck: '',
  transportationGroup: '',
};

const MaterialSalesView = () => {
  const [materials, setMaterials] = useState([]);
  const [salesViews, setSalesViews] = useState([]);
  const [deletedSalesViews, setDeletedSalesViews] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matRes, activeRes, deletedRes] = await Promise.all([
        getMaterials(),
        getSalesViews(),
        getDeletedSalesViews(),
      ]);
      setMaterials(matRes.data);
      setSalesViews(activeRes.data);
      setDeletedSalesViews(deletedRes.data);
    } catch (err) {
      console.error('Error loading sales view data', err);
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
      if (!formData.materialId) {
        alert('Select a material');
        return;
      }
      if (editingId) {
        await updateSalesView(editingId, formData);
      } else {
        await createSalesView(formData);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving sales view', err);
    }
  };

  const handleEdit = view => {
    setEditingId(view.id);
    setFormData({
      materialId: view.materialId || '',
      salesOrg: view.salesOrg || '',
      distributionChannel: view.distributionChannel || '',
      division: view.division || '',
      deliveringPlant: view.deliveringPlant || '',
      itemCategoryGroup: view.itemCategoryGroup || '',
      loadingGroup: view.loadingGroup || '',
      accountAssignmentGroup: view.accountAssignmentGroup || '',
      priceGroup: view.priceGroup || '',
      priceList: view.priceList || '',
      availabilityCheck: view.availabilityCheck || '',
      transportationGroup: view.transportationGroup || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this sales view to recycle bin?')) return;
    try {
      await softDeleteSalesView(id);
      loadData();
    } catch (err) {
      console.error('Error deleting sales view', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreSalesView(id);
      loadData();
    } catch (err) {
      console.error('Error restoring sales view', err);
    }
  };

  const currentList = showDeleted ? deletedSalesViews : salesViews;

  return (
    <>
      {/* Internal CSS only for this page */}
      <style>{`
        .msv-page.page-container {
          max-width: 1200px;
        }

        /* Two main columns in the form */
        .msv-page .msv-form-layout {
          display: grid;
          grid-template-columns: 1fr 1fr; /* left, right */
          column-gap: 12px;
          align-items: flex-start;
        }

        .msv-page .msv-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .msv-page .msv-column h4 {
        margin-left: 20px;
          
          font-size: 15px;
          color: #12355b;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 3px;
        }

        .msv-page .msv-column .form-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 0;
          margin-right: 25px;
        }

        .msv-page .msv-column .form-row label {
          width: 400px;
          font-size: 13px;
          margin-bottom: 4px;
          color: #4b5563;
        }

        .msv-page .msv-column .form-row input,
        .msv-page .msv-column .form-row select {
        
        width: 400px;
          max-width: 100%;
          padding: 6px 8px;
          font-size: 14px;
          border-radius: 4px;
          border: 1px solid #4887e6;
          box-sizing: border-box;
        }

        .msv-page .form-card {
          padding: 20px 24px;
          border-radius: 6px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
        }

        /* Actions bar below both columns */
        .msv-page .form-actions {
          margin-top: 16px;
          display: flex;
          gap: 8px;
      
        }

        .msv-page button {
          font-size: 14px;
          border-radius: 4px;
          border: none;
          padding: 6px 14px;
          cursor: pointer;
        }

        .msv-page button[type="submit"] {
          background-color: #2563eb;
          color: #ffffff;
          margin-left: 9px;
        }
        .msv-page button[type="submit"]:hover {
          background-color: #1d4ed8;
        }

        .msv-page .form-actions button[type="button"] {
          background-color: #e5e7eb;
          color: #111827;
        }
        .msv-page .form-actions button[type="button"]:hover {
          background-color: #d1d5db;
        }

        .msv-page .list-header {
          margin-top: 20px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .msv-page .list-header button {
          background-color: #f97316;
          color: #ffffff;
        }
        .msv-page .list-header button:hover {
          background-color: #ea580c;
        }

        .msv-page .data-table {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-top: 8px;
        }

        .msv-page .data-table th,
        .msv-page .data-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }

        .msv-page .data-table th {
          background: #eef2ff;
          text-align: left;
          color: #111827;
        }

        .msv-page .data-table tr:hover td {
          background: #f9fafb;
        }

        .msv-page .data-table td button {
          font-size: 12px;
          padding: 4px 10px;
          margin-right: 6px;
        }

        .msv-page .data-table td button:nth-of-type(1) {
          background-color: #e5e7eb; /* Edit / Restore */
          color: #111827;
        }
        .msv-page .data-table td button:nth-of-type(1):hover {
          background-color: #d1d5db;
        }

        .msv-page .data-table td button:nth-of-type(2) {
          background-color: #f76437; /* Delete */
          color: #ffffff;
        }
        .msv-page .data-table td button:nth-of-type(2):hover {
          background-color: #fc4646;
        }
      `}</style>

      <div className="page-container msv-page">
        <h2>Material Sales View (MM for Sales)</h2>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="msv-form-layout">
            {/* LEFT: Material + Sales Org Data 1 */}
            <div className="msv-column">
              <div className="form-row">
                <label>Material</label>
                <select
                  name="materialId"
                  value={formData.materialId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Material</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.materialCode} - {m.description}
                    </option>
                  ))}
                </select>
              </div>

              <h4>Sales Org Data 1</h4>
              <div className="form-row">
                <label>Sales Org</label>
                <input
                  name="salesOrg"
                  value={formData.salesOrg}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Distribution Channel</label>
                <input
                  name="distributionChannel"
                  value={formData.distributionChannel}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Division</label>
                <input
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Delivering Plant</label>
                <input
                  name="deliveringPlant"
                  value={formData.deliveringPlant}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Item Category Group</label>
                <input
                  name="itemCategoryGroup"
                  value={formData.itemCategoryGroup}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Loading Group</label>
                <input
                  name="loadingGroup"
                  value={formData.loadingGroup}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* RIGHT: Sales Org Data 2 + General/Plant */}
            <div className="msv-column">
              <h4>Sales Org Data 2</h4>
              <div className="form-row">
                <label>Account Assignment Group</label>
                <input
                  name="accountAssignmentGroup"
                  value={formData.accountAssignmentGroup}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>Price Group</label>
                <input
                  name="priceGroup"
                  value={formData.priceGroup}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>Price List</label>
                <input
                  name="priceList"
                  value={formData.priceList}
                  onChange={handleChange}
                />
              </div>

              <h4>Sales: General / Plant Data</h4>
              <div className="form-row">
                <label>Availability Check</label>
                <input
                  name="availabilityCheck"
                  value={formData.availabilityCheck}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>Transportation Group</label>
                <input
                  name="transportationGroup"
                  value={formData.transportationGroup}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">
              {editingId ? 'Update Sales View' : 'Create Sales View'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="list-header">
          <h3>{showDeleted ? 'Recycle Bin' : 'Active Sales Views'}</h3>
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
                <th>Material</th>
                <th>Sales Org</th>
                <th>Dist. Channel</th>
                <th>Division</th>
                <th>Delivering Plant</th>
                <th>Item Cat. Group</th>
                <th>Loading Group</th>
                <th>Account Asg. Group</th>
                <th>Price Group</th>
                <th>Price List</th>
                <th>Avail. Check</th>
                <th>Trans. Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map(v => (
                <tr key={v.id}>
                  <td>
                    {v.Material
                      ? `${v.Material.materialCode} - ${v.Material.description}`
                      : v.materialId}
                  </td>
                  <td>{v.salesOrg}</td>
                  <td>{v.distributionChannel}</td>
                  <td>{v.division}</td>
                  <td>{v.deliveringPlant}</td>
                  <td>{v.itemCategoryGroup}</td>
                  <td>{v.loadingGroup}</td>
                  <td>{v.accountAssignmentGroup}</td>
                  <td>{v.priceGroup}</td>
                  <td>{v.priceList}</td>
                  <td>{v.availabilityCheck}</td>
                  <td>{v.transportationGroup}</td>
                  <td>
                    {!showDeleted && (
                      <>
                        <button onClick={() => handleEdit(v)}>Edit</button>
                        <button onClick={() => handleSoftDelete(v.id)}>
                          Delete
                        </button>
                      </>
                    )}
                    {showDeleted && (
                      <button onClick={() => handleRestore(v.id)}>
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
    </>
  );
};

export default MaterialSalesView;
