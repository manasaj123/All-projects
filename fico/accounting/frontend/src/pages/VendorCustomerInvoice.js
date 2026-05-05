// frontend/src/pages/VendorCustomerInvoice.js
import React, { useEffect, useState } from 'react';
import api from '../api';

const initialForm = {
  mode: 'VENDOR', // VENDOR or CUSTOMER

  // Common header fields
  postingDate: '',
  documentDate: '',
  amount: '',
  reference: '',
  businessPlace: '',
  text: '',
  baselineDate: '',

  // Vendor-specific
  vendorCode: '',
  sectionCode: '',

  // Customer-specific
  customerCode: '',

  // Line item (common)
  glAccount: '',
  lineAmount: '',
  taxCode: '',
  assignment: '',
  lineText: '',
  costCenter: '',
  hsnCode: '',
};

const VendorCustomerInvoice = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/vendor-customer-invoices');
      setRows(res.data || []);
    } catch (err) {
      console.error('VC invoice list error', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (e) => {
    const mode = e.target.value;
    setForm((prev) => ({
      ...prev,
      mode,
      vendorCode: mode === 'VENDOR' ? prev.vendorCode : '',
      sectionCode: mode === 'VENDOR' ? prev.sectionCode : '',
      customerCode: mode === 'CUSTOMER' ? prev.customerCode : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isVendor = form.mode === 'VENDOR';

    if (isVendor) {
      if (!form.vendorCode || !form.postingDate || !form.documentDate || !form.amount) {
        setError('Vendor, Posting Date, Document Date, and Amount are required');
        return;
      }
    } else {
      if (!form.customerCode || !form.postingDate || !form.documentDate || !form.amount) {
        setError('Customer, Posting Date, Document Date, and Amount are required');
        return;
      }
    }

    try {
      const payload = {
        mode: form.mode,
        header: {
          postingDate: form.postingDate,
          documentDate: form.documentDate,
          amount: Number(form.amount),
          reference: form.reference,
          businessPlace: form.businessPlace,
          text: form.text,
          baselineDate: form.baselineDate,
          vendorCode: isVendor ? form.vendorCode : null,
          sectionCode: isVendor ? form.sectionCode : null,
          customerCode: !isVendor ? form.customerCode : null,
        },
        lineItem: {
          glAccount: form.glAccount,
          amount: Number(form.lineAmount || form.amount),
          taxCode: form.taxCode,
          assignment: form.assignment,
          text: form.lineText,
          costCenter: form.costCenter,
          hsnCode: form.hsnCode,
        },
      };

      await api.post('/vendor-customer-invoices', payload);

      setSuccess('Invoice posted');
      setForm(initialForm);
      await load();
    } catch (err) {
      console.error('VC invoice save error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to post invoice');
    }
  };

  const isVendor = form.mode === 'VENDOR';

  return (
    <div>
      {/* Internal CSS */}
      <style>{`
        .card {
          background-color: #ffffff;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .form-group {
          margin-bottom: 0.75rem;
        }
        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.35rem 0.5rem;
          border: 1px solid #d0d7de;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem 1rem;
          margin-bottom: 0.75rem;
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
        .form-grid select:focus,
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37,99,235,0.2);
        }
        .btn-primary {
          padding: 0.4rem 1rem;
          border-radius: 4px;
          border: none;
          background-color: #2563eb;
          color: #ffffff;
          cursor: pointer;
          margin-top: 0.5rem;
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
      `}</style>

      <h2>Vendor / Customer Invoice (Single Screen)</h2>
      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-text">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mode</label>
            <select name="mode" value={form.mode} onChange={handleModeChange}>
              <option value="VENDOR">Vendor (AP)</option>
              <option value="CUSTOMER">Customer (AR)</option>
            </select>
          </div>

          <h3>Header</h3>
          <div className="form-grid">
            {isVendor ? (
              <>
                <div>
                  <label>Vendor Code</label>
                  <input
                    name="vendorCode"
                    value={form.vendorCode}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Section Code (TDS)</label>
                  <input
                    name="sectionCode"
                    value={form.sectionCode}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <div>
                <label>Customer Code</label>
                <input
                  name="customerCode"
                  value={form.customerCode}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label>Posting Date</label>
              <input
                type="date"
                name="postingDate"
                value={form.postingDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Document Date</label>
              <input
                type="date"
                name="documentDate"
                value={form.documentDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Reference</label>
              <input
                name="reference"
                value={form.reference}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Business Place</label>
              <input
                name="businessPlace"
                value={form.businessPlace}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Text</label>
              <input
                name="text"
                value={form.text}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Baseline Date</label>
              <input
                type="date"
                name="baselineDate"
                value={form.baselineDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3>Line Item</h3>
          <div className="form-grid">
            <div>
              <label>G/L Account</label>
              <input
                name="glAccount"
                value={form.glAccount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Line Amount</label>
              <input
                type="number"
                name="lineAmount"
                value={form.lineAmount}
                onChange={handleChange}
                placeholder="Defaults to header amount"
              />
            </div>
            <div>
              <label>Tax Code</label>
              <input
                name="taxCode"
                value={form.taxCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Assignment</label>
              <input
                name="assignment"
                value={form.assignment}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Line Text</label>
              <input
                name="lineText"
                value={form.lineText}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Cost Center</label>
              <input
                name="costCenter"
                value={form.costCenter}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>HSN Code</label>
              <input
                name="hsnCode"
                value={form.hsnCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="btn-primary" type="submit">
            Post {isVendor ? 'Vendor AP' : 'Customer AR'} Invoice
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Posted Invoices</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mode</th>
              <th>Party</th>
              <th>Posting Date</th>
              <th>Amount</th>
              <th>G/L </th>
            </tr>
          </thead>
          <tbody>
  {rows.map((inv) => (
    <tr key={inv.id}>
      <td>{inv.id}</td>
      <td>{inv.mode}</td>
      <td>{inv.mode === 'VENDOR' ? inv.vendorCode : inv.customerCode}</td>
      <td>{inv.postingDate}</td>
      <td>{inv.amount}</td>
      <td>
  {Array.isArray(inv.lines) && inv.lines[0]
    ? inv.lines[0].glAccount
    : ''}
</td>
    </tr>
  ))}
  {rows.length === 0 && (
    <tr>
      <td colSpan="6">No invoices yet.</td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorCustomerInvoice;