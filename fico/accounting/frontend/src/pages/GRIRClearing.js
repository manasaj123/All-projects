import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const GRIRClearing = () => {
  const [form, setForm] = useState({
    poNumber: '',
    invoiceId: '',
    invoiceNumber: '',
    amount: '',
    clearedAmount: '',
    status: 'PENDING'
  });

  const [poList, setPoList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [grirEntries, setGrirEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGrirEntries();
    loadInvoices();
  }, []);

  const loadGrirEntries = async () => {
    try {
      const res = await api.get('/grir-clearing');
      setGrirEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // TODO: adjust endpoint/params to your invoice list API
  const loadInvoices = async () => {
    try {
      const res = await api.get('/invoices', {
        params: { status: 'POSTED' } // or APPROVED, or remove filter
      });
      setInvoiceList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceSelect = (e) => {
    const invoiceId = e.target.value;
    const invoice = invoiceList.find(inv => inv.id === Number(invoiceId));
    if (!invoice) {
      setForm(prev => ({ ...prev, invoiceId: '', invoiceNumber: '', amount: '' }));
      return;
    }

    setForm(prev => ({
      ...prev,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.totalAmount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        poNumber: form.poNumber,
        invoiceNumber: form.invoiceNumber,
        amount: Number(form.amount),
        clearedAmount: Number(form.clearedAmount),
        status: form.status
        // if you later add invoiceId to GRIRClearing model:
        // invoiceId: Number(form.invoiceId) || null
      };

      await api.post('/grir-clearing', payload);

      setForm({
        poNumber: '',
        invoiceId: '',
        invoiceNumber: '',
        amount: '',
        clearedAmount: '',
        status: 'PENDING'
      });
      loadGrirEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'GR/IR clearing failed');
    }
  };

  const totalCleared = grirEntries.reduce(
    (sum, entry) => sum + Number(entry.clearedAmount || 0),
    0
  );
  const totalPending = grirEntries.reduce(
    (sum, entry) => sum + Number(entry.pendingAmount || 0),
    0
  );

  return (
    <div>
      <h2>GR/IR Clearing</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create GR/IR Entry</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>PO Number <span className="required-star">*</span></label>
              <input
                name="poNumber"
                value={form.poNumber}
                onChange={handleChange}
                required
                placeholder="PO-001"
              />
            </div>

            {/* Invoice select (from Invoice page) */}
            <div className="form-group">
              <label>Invoice <span className="required-star">*</span></label>
              <select
                name="invoiceId"
                value={form.invoiceId}
                onChange={handleInvoiceSelect}
                required
              >
                <option value="">Select invoice</option>
                {invoiceList.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.partyName} - ₹{Number(inv.totalAmount).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto‑filled from selection, but still visible */}
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>PO Amount <span className="required-star">*</span></label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Invoice Amount Cleared <span className="required-star">*</span></label>
              <input
                type="number"
                name="clearedAmount"
                value={form.clearedAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="PENDING">Pending</option>
                <option value="CLEARED">Cleared</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <button className="btn-primary" type="submit">Add GR/IR Entry</button>
          </form>
        </div>

        <div className="card">
          <h3>GR/IR Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <h4>Total Cleared</h4>
              <div className="summary-value">₹{totalCleared.toFixed(2)}</div>
            </div>
            <div className="summary-card warning">
              <h4>Pending Clearance</h4>
              <div className="summary-value">₹{totalPending.toFixed(2)}</div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>PO</th>
                <th>Invoice</th>
                <th>PO Amt</th>
                <th>Cleared</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grirEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.poNumber}</td>
                  <td>{entry.invoiceNumber}</td>
                  <td>₹{Number(entry.amount).toFixed(2)}</td>
                  <td>₹{Number(entry.clearedAmount).toFixed(2)}</td>
                  <td>₹{Number(entry.pendingAmount).toFixed(2)}</td>
                  <td>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GRIRClearing;