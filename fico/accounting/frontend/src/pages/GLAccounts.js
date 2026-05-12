// frontend/src/pages/GLAccounts.js
import React, { useEffect, useState } from 'react';
import api from '../api';

const initialForm = {
  glCode: '',
  name: '',
  companyCode: '',
  accountType: 'ASSET',
  accountCurrency: 'INR',
  taxCategory: '',
  reconciliationType: 'NONE',
  altAccountNumber: '',
  toleranceGroup: '',
  fieldStatusGroup: '',
  planningLevel: '',
  isBlockedForPosting: false,
};

const GLAccounts = () => {
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
      console.error('GLAccounts load error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load GL accounts');
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      glCode: row.glCode || '',
      name: row.name || '',
      companyCode: row.companyCode || '',
      accountType: row.accountType || 'ASSET',
      accountCurrency: row.accountCurrency || 'INR',
      taxCategory: row.taxCategory || '',
      reconciliationType: row.reconciliationType || 'NONE',
      altAccountNumber: row.altAccountNumber || '',
      toleranceGroup: row.toleranceGroup || '',
      fieldStatusGroup: row.fieldStatusGroup || '',
      planningLevel: row.planningLevel || '',
      isBlockedForPosting: !!row.isBlockedForPosting,
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
      const payload = { ...form };
      if (editingId) {
        await api.put(`/gl-accounts/${editingId}`, payload);
        setSuccess('G/L account updated');
      } else {
        await api.post('/gl-accounts', payload);
        setSuccess('G/L account created');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error('GLAccounts save error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this G/L account?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/gl-accounts/${id}`);
      setSuccess('G/L account deleted');
      await load();
    } catch (err) {
      console.error('GLAccounts delete error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="gl-page">
      {/* internal CSS */}
      <style>{`
        .gl-page {
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #f5f5f7;
        }
        .gl-title {
          margin-bottom: 12px;
          font-size: 20px;
          font-weight: 600;
        }
        .gl-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          margin-bottom: 16px;
        }
        .gl-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 8px 16px;
        }
        .gl-form-grid label {
          display: block;
          font-size: 12px;
          color: #555;
          margin-bottom: 2px;
        }
        .gl-form-grid input,
        .gl-form-grid select {
          width: 100%;
          padding: 6px 8px;
          font-size: 13px;
          border-radius: 4px;
          border: 1px solid #d0d7de;
          box-sizing: border-box;
        }
        .gl-form-actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }
        .gl-form-actions button {
          padding: 6px 10px;
          font-size: 13px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          background: #2563eb;
          color: #fff;
        }
        .gl-form-actions button[type="button"] {
          background: #9ca3af;
        }
        .gl-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 13px;
        }
        .gl-table th,
        .gl-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
        }
        .gl-table thead {
          background: #f3f4f6;
        }
        .gl-table button {
          padding: 3px 6px;
          font-size: 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          margin-right: 4px;
          background: #2563eb;
          color: #fff;
        }
        .gl-table button:last-child {
          background: #ef4444;
        }
        .gl-error {
          margin-bottom: 8px;
          padding: 6px 8px;
          font-size: 13px;
          color: #b91c1c;
          background: #fee2e2;
          border-radius: 4px;
        }
        .gl-success {
          margin-bottom: 8px;
          padding: 6px 8px;
          font-size: 13px;
          color: #166534;
          background: #dcfce7;
          border-radius: 4px;
        }
      `}</style>

      <h2 className="gl-title">G/L Accounts</h2>

      {error && <div className="gl-error">{error}</div>}
      {success && <div className="gl-success">{success}</div>}

      <div className="gl-card">
        <form onSubmit={handleSubmit} className="gl-form-grid">
          <div>
            <label>G/L Code *</label>
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
            <label>Account Type *</label>
            <select
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              required
            >
              
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div>
            <label>Currency *</label>
            <input
              name="accountCurrency"
              value={form.accountCurrency}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Tax Category</label>
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
            <label>Alt. Account No.</label>
            <input
              name="altAccountNumber"
              value={form.altAccountNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Tolerance Group</label>
            <input
              name="toleranceGroup"
              value={form.toleranceGroup}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Field Status Group</label>
            <input
              name="fieldStatusGroup"
              value={form.fieldStatusGroup}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Planning Level</label>
            <input
              name="planningLevel"
              value={form.planningLevel}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="isBlockedForPosting"
                checked={form.isBlockedForPosting}
                onChange={handleChange}
              />{' '}
              Block for posting
            </label>
          </div>
          <div className="gl-form-actions">
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

      <div className="gl-card">
        <table className="gl-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Company</th>
              <th>Recon</th>
              <th>Blocked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.glCode}</td>
                <td>{r.name}</td>
                <td>{r.accountType}</td>
                <td>{r.companyCode}</td>
                <td>{r.reconciliationType}</td>
                <td>{r.isBlockedForPosting ? 'Yes' : 'No'}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(r)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="7">No G/L accounts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GLAccounts;