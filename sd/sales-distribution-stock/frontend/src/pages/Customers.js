// frontend/src/pages/Customers.js
import React, { useEffect, useState } from 'react';
import {
  getCustomers,
  getDeletedCustomers,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  restoreCustomer,
} from '../services/customerService';

const initialForm = {
  customerCode: '',
  name: '',
  accountGroup: '',
  city: '',
  country: '',
  creditGroup: '',
  riskCategory: '',
};



const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [deletedCustomers, setDeletedCustomers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getCustomers(),
        getDeletedCustomers(),
      ]);
      setCustomers(activeRes.data);
      setDeletedCustomers(deletedRes.data);
    } catch (err) {
      console.error('Error loading customers', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSubmit = async e => {
  e.preventDefault();

  const payload = {
  customerCode: formData.customerCode,
  name: formData.name,
  accountGroup: formData.accountGroup,
  city: formData.city,
  country: formData.country,
  creditGroup: formData.creditGroup,
  riskCategory: formData.riskCategory,
};


  try {
    if (editingId) {
      await updateCustomer(editingId, payload);
    } else {
      await createCustomer(payload);
    }

    setFormData(initialForm);
    setEditingId(null);
    loadData();
  } catch (err) {
    console.error('Error saving customer', err);
  }
};

  const handleEdit = c => {
  setEditingId(c.id);
  setFormData({
  customerCode: c.customerCode || '',
  name: c.name || '',
  accountGroup: c.accountGroup || '',
  city: c.city || '',
  country: c.country || '',
  creditGroup: c.creditGroup || '',
  riskCategory: c.riskCategory || '',
});

};

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this customer to recycle bin?')) return;
    await softDeleteCustomer(id);
    loadData();
  };

  const handleRestore = async id => {
    await restoreCustomer(id);
    loadData();
  };

  const currentList = showDeleted ? deletedCustomers : customers;

  return (
    <div className="page-container">
      <style>{`
        .page-container{
          max-width:1100px;
          margin:auto;
          padding:20px;
          font-family:Segoe UI;
        }

        .form-card{
          background:white;
          padding:20px;
          border-radius:6px;
          box-shadow:0 2px 6px rgba(0,0,0,0.1);
          margin-bottom:20px;
        }

        /* 3 fields per row */
        .form-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:3px;
        }

        .form-row{
          display:flex;
          flex-direction:column;
        }

        .form-row label{
          font-size:14px;
          margin-bottom:4px;
          padding-right:35px;
        }

        .form-row input{
          height:35px;
          padding:6px 10px;
          border:1px solid #cbd5e1;
          border-radius:4px;
          width:300px;
        }

        /* buttons */
        .form-actions{
          margin-top:20px;
          display:flex;
          gap:10px;
        }

        .btn{
          padding:7px 14px;
          border:none;
          border-radius:4px;
          cursor:pointer;
          color:white;
          font-size:13px;
        }

        .btn-submit{
          background:#2563eb;
        }

        .btn-cancel{
          background:#6b7280;
        }

        .btn-edit{
          background:#3b82f6;
        }

        .btn-delete{
          background:#f59e0b;
        }

        .btn-restore{
          background:#22c55e;
        }

        /* table */
        .list-header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin:20px 0;
        }

        .data-table{
          width:100%;
          border-collapse:collapse;
        }

        .data-table th{
          background:#e0f2fe;
          padding:10px;
          border:1px solid #ddd;
        }

        .data-table td{
          padding:8px;
          border:1px solid #ddd;
        }

        .data-table tr:nth-child(even){
          background:#f9fafb;
        }
      `}</style>

      <h2>Customers</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-row">
            <label>Customer Code</label>
            <input
              name="customerCode"
              value={formData.customerCode}
              onChange={handleChange}
              required
              disabled={!!editingId}
            />
          </div>

          <div className="form-row">
            <label>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>City</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Country</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
  <label>Credit Group</label>
  <input
    name="creditGroup"
    value={formData.creditGroup}
    onChange={handleChange}
  />
</div>

<div className="form-row">
  <label>Risk Category</label>
  <input
    name="riskCategory"
    value={formData.riskCategory}
    onChange={handleChange}
  />
</div>


        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-submit">
            {editingId ? 'Update Customer' : 'Create Customer'}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Customers'}</h3>

        <button
          className="btn btn-submit"
          onClick={() => setShowDeleted(v => !v)}
        >
          {showDeleted ? 'Show Active' : 'Show Recycle Bin'}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentList.length === 0 ? (
        <p>No records</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>City</th>
              <th>Country</th>
              <th>Credit Group</th>
<th>Risk Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentList.map(c => (
              <tr key={c.id}>
                <td>{c.customerCode}</td>
                <td>{c.name}</td>
                <td>{c.city}</td>
                <td>{c.country}</td>
                <td>{c.creditGroup}</td>
<td>{c.riskCategory}</td>

                <td>
                  {!showDeleted && (
                    <>
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>

                        <button
                          className="btn btn-delete"
                          onClick={() => handleSoftDelete(c.id)}
                        >
                          Delete
                        </button>
                    </>
                  )}

                  {showDeleted && (
                    <button
                      className="btn btn-restore"
                      onClick={() => handleRestore(c.id)}
                    >
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

export default Customers;
