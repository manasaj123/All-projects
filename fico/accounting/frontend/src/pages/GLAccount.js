// frontend/src/pages/GLAccount.js
import React, { useEffect, useState } from 'react';
import api from '../api';

const initialForm = {
  glCode: '',
  name: '',
  companyCode: '',
  accountController: '',
  accountCurrency: 'INR',
  taxCategory: '',
  reconciliationType: 'NONE',
  altAccountNumber: '',
  toleranceGroup: '',
  fieldStatusGroup: '',
  planningLevel: ''
};

const GLAccount = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/gl-accounts');
      setRows(res.data || []);
    } catch (err) {
      console.error('GL load error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load G/L Accounts');
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      glCode: row.glCode || '',
      name: row.name || '',
      companyCode: row.companyCode || '',
      accountController: row.accountController || '',
      accountCurrency: row.accountCurrency || 'INR',
      taxCategory: row.taxCategory || '',
      reconciliationType: row.reconciliationType || 'NONE',
      altAccountNumber: row.altAccountNumber || '',
      toleranceGroup: row.toleranceGroup || '',
      fieldStatusGroup: row.fieldStatusGroup || '',
      planningLevel: row.planningLevel || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await api.put(`/gl-accounts/${editingId}`, form);
        setSuccess('G/L Account updated');
      } else {
        await api.post('/gl-accounts', form);
        setSuccess('G/L Account created');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error('GL save error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this G/L Account?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/gl-accounts/${id}`);
      setSuccess('G/L Account deleted');
      await load();
    } catch (err) {
      console.error('GL delete error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      {/* Internal CSS for this page */}
      <style>{`
        .card {
          background-color: #ffffff;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem 1rem;
        }
        .form-grid label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .form-grid input,
        .form-grid select {
          width: 100%;
          padding: 0.35rem 0.5rem;
          border: 1px solid #d0d7de;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .form-grid input:focus,
        .form-grid select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
        }
        .form-actions {
          margin-top: 0.5rem;
          grid-column: 1 / -1;
          display: flex;
          gap: 0.5rem;
        }
        .form-actions button {
          padding: 0.35rem 0.9rem;
          border-radius: 4px;
          border: none;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .form-actions button[type="submit"] {
          background-color: #2563eb;
          color: #ffffff;
        }
        .form-actions button[type="button"] {
          background-color: #e5e7eb;
          color: #111827;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .table thead th {
          text-align: left;
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        .table tbody td {
          padding: 0.45rem 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .table button {
          margin-right: 0.25rem;
          padding: 0.25rem 0.6rem;
          font-size: 0.8rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
        }
        .table button:first-of-type {
          background-color: #10b981;
          color: #ffffff;
        }
        .table button:last-of-type {
          background-color: #ef4444;
          color: #ffffff;
        }
        .error-text {
          color: #b91c1c;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .success-text {
          color: #15803d;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
      `}</style>

      <h2>G/L Accounts</h2>

      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-text">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label>G/L Account *</label>
            <input
              name="glCode"
              value={form.glCode}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Company Code *</label>
            <input
              name="companyCode"
              value={form.companyCode}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Account Controller</label>
            <input
              name="accountController"
              value={form.accountController}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Account Currency *</label>
            <input
              name="accountCurrency"
              value={form.accountCurrency}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Tax Code</label>
            <input
              name="taxCategory"
              value={form.taxCategory}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Reconciliation Type</label>
            <select
              name="reconciliationType"
              value={form.reconciliationType}
              onChange={handleChange}
            >
              <option value="NONE">None</option>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
            </select>
          </div>

          <div>
            <label>cost center</label>
            <input
              name="altAccountNumber"
              value={form.altAccountNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>WBS elements</label>
            <input
              name="toleranceGroup"
              value={form.toleranceGroup}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>sales order</label>
            <input
              name="fieldStatusGroup"
              value={form.fieldStatusGroup}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Assigment</label>
            <input
              name="planningLevel"
              value={form.planningLevel}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>G/L</th>
              <th>Name</th>
              <th>Company</th>
              <th>Currency</th>
              <th>Tax Code</th>
              <th>Recon</th>
              <th>Cost Center</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.glCode}</td>
                <td>{r.name}</td>
                <td>{r.companyCode}</td>
                <td>{r.accountCurrency}</td>
                <td>{r.taxCategory}</td>
                <td>{r.reconciliationType}</td>
                <td>{r.altAccountNumber}</td>
                <td>
                  <button onClick={() => handleEdit(r)}>Edit</button>
                  <button onClick={() => handleDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="8">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GLAccount;