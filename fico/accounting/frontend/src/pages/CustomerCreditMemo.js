// frontend/src/pages/CustomerCreditMemo.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import '../styles/Common.css';

const CustomerCreditMemo = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preType = params.get('type');        // AR/AP from invoice page
  const prePartyId = params.get('partyId');  // numeric id from invoice page
  const preInvoice = params.get('invoice');  // invoiceNumber

  const [form, setForm] = useState({
    creditMemoNumber: '',
    type: preType || 'AR',
    partyId: prePartyId || '',
    referenceInvoice: preInvoice || '',
    amount: '',
    taxAmount: '',
    totalAmount: '',
    date: '',
    reason: '',
    status: 'DRAFT',
  });

  const [parties, setParties] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [creditMemos, setCreditMemos] = useState([]);

  useEffect(() => {
    loadParties();
    loadCreditMemos();
  }, []);

  useEffect(() => {
    if (prePartyId && preType) {
      loadInvoices(prePartyId, preType).then(() => {
        if (preInvoice) {
          handleInvoicePrefill(preInvoice);
        }
      });
    }
  }, [prePartyId, preType, preInvoice]);

  const loadParties = async () => {
    try {
      const res = await api.get('/parties');
      setParties(res.data);
    } catch (err) {
      console.error('loadParties error', err);
    }
  };

  // Invoice API uses partyName; form keeps partyId.
  const loadInvoices = async (partyId, type) => {
    if (!partyId) return;
    try {
      const party = parties.find((p) => String(p.id) === String(partyId));
      if (!party) return;

      const partyName = encodeURIComponent(party.name);
      const res = await api.get(`/invoices/party/${partyName}?type=${type}`);
      setInvoices(res.data);
      setForm((prev) => ({ ...prev, referenceInvoice: '' }));
    } catch (err) {
      console.error('loadInvoices error', err);
    }
  };

  const handleInvoicePrefill = async (invoiceNumber) => {
    try {
      const res = await api.get(`/invoices/by-number/${invoiceNumber}`);
      const inv = res.data;
      setForm((prev) => ({
        ...prev,
        referenceInvoice: invoiceNumber,
        amount: inv.baseAmount || inv.totalAmount || '',
        taxAmount: inv.gstAmount || '',
        totalAmount: inv.totalAmount || '',
        date: prev.date || inv.date || '',
      }));
    } catch (err) {
      console.error('get invoice by number error', err);
      setError('Failed to load invoice details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'partyId') {
      loadInvoices(value, form.type);
    }

    if (name === 'type') {
      loadInvoices(form.partyId, value);
    }

    if (name === 'referenceInvoice' && value) {
      handleInvoicePrefill(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const selectedParty = parties.find(
        (p) => String(p.id) === String(form.partyId)
      );

      const payload = {
        type: form.type,
        partyId: form.partyId,
        partyName: selectedParty ? selectedParty.name : '',
        referenceInvoice: form.referenceInvoice,
        amount: Number(form.amount),
        taxAmount: Number(form.taxAmount),
        totalAmount: Number(form.totalAmount),
        date: form.date,
        reason: form.reason,
        status: form.status,
      };

      const res = await api.post('/credit-memos', payload);

      setForm({
        creditMemoNumber: res.data.creditMemoNumber || '',
        type: 'AR',
        partyId: '',
        referenceInvoice: '',
        amount: '',
        taxAmount: '',
        totalAmount: '',
        date: '',
        reason: '',
        status: 'DRAFT',
      });
      setInvoices([]);
      loadCreditMemos();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create credit memo');
    }
  };

  const loadCreditMemos = async () => {
    try {
      const res = await api.get('/credit-memos');
      setCreditMemos(res.data);
    } catch (err) {
      console.error('loadCreditMemos error', err);
    }
  };

  const totalAmount = creditMemos.reduce(
    (sum, cm) => sum + Number(cm.totalAmount || 0),
    0
  );

  return (
    <div>
      <h2>Customer & Vendor Credit Memo</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create Credit Memo</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Credit Memo No.</label>
              <input
                name="creditMemoNumber"
                value={form.creditMemoNumber}
                readOnly
                placeholder="Will be generated (DB4-CM-001)"
              />
            </div>

            <div className="form-group">
              <label>
                Type<span className="required-star">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="AR">Customer Credit (AR)</option>
                <option value="AP">Vendor Credit (AP)</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Party Name<span className="required-star">*</span>
              </label>
              <select
                name="partyId"
                value={form.partyId}
                onChange={handleChange}
                required
              >
                <option value="">Select Party</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name} ({party.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Reference Invoice</label>
              <select
                name="referenceInvoice"
                value={form.referenceInvoice}
                onChange={handleChange}
              >
                <option value="">Select Invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.invoiceNumber}>
                    {inv.invoiceNumber} - ₹{inv.totalAmount}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Credit Amount<span className="required-star">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-inline">
              <div>
                <label>Tax Amount</label>
                <input
                  type="number"
                  name="taxAmount"
                  value={form.taxAmount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>
                  Total Amount<span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={form.totalAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Date<span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="DRAFT">Draft</option>
                <option value="POSTED">Posted</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <button className="btn-primary" type="submit">
              Save & Post
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Credit Memos Summary</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Party</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {creditMemos.map((cm) => (
                <tr key={cm.id}>
                  <td>{cm.creditMemoNumber}</td>
                  <td>{cm.type}</td>
                  <td>{cm.partyName}</td>
                  <td>₹{Number(cm.totalAmount).toFixed(2)}</td>
                  <td>{cm.date}</td>
                  <td>{cm.status}</td>
                </tr>
              ))}
              {creditMemos.length === 0 && (
                <tr>
                  <td colSpan="6">No credit memos yet.</td>
                </tr>
              )}
              {creditMemos.length > 0 && (
                <tr className="table-total">
                  <td colSpan="3">
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>₹{totalAmount.toFixed(2)}</strong>
                  </td>
                  <td colSpan="2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditMemo;