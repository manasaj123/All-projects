import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const DownPayments = () => {
  const [form, setForm] = useState({
    downPaymentNumber: '',
    partyName: '',
    type: 'AR',
    amount: '',
    paymentDate: '',
    reference: '',
    status: 'POSTED'
  });

  const [parties, setParties] = useState([]);
  const [downPayments, setDownPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadParties();
    loadDownPayments();
  }, []);

  const loadParties = async () => {
    try {
      const res = await api.get('/invoices/parties');
setParties(res.data); // each row: { partyName, type }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        type: form.type,
        partyName: form.partyName,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        reference: form.reference,
        status: form.status
      };

      const res = await api.post('/down-payments', payload);

      setForm({
        downPaymentNumber: res.data.downPaymentNumber || '',
        partyName: '',
        type: 'AR',
        amount: '',
        paymentDate: '',
        reference: '',
        status: 'POSTED'
      });
      loadDownPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create down payment');
    }
  };

  const loadDownPayments = async () => {
    try {
      const res = await api.get('/down-payments');
      setDownPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalAdvances = downPayments.reduce(
    (sum, dp) => sum + Number(dp.amount || 0),
    0
  );

  return (
    <div>
      <h2>Down Payments (Customer/Vendor Advances)</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create Down Payment</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Down Payment No.</label>
              <input
                name="downPaymentNumber"
                value={form.downPaymentNumber}
                readOnly
                placeholder="Will be generated (DB4-DP-001)"
              />
            </div>

            <div className="form-group">
              <label>
                Type <span className="required-star">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="AR">Customer Advance (AR)</option>
                <option value="AP">Vendor Advance (AP)</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Party <span className="required-star">*</span>
              </label>
              <select
  name="partyName"
  value={form.partyName}
  onChange={handleChange}
  required
>
  <option value="">Select Party</option>
  {parties.map((p, idx) => (
    <option key={idx} value={p.partyName}>
      {p.partyName} ({p.type})
    </option>
  ))}
</select>
            </div>

            <div className="form-group">
              <label>
                Amount <span className="required-star">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Payment Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Reference</label>
              <input
                name="reference"
                value={form.reference}
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
                <option value="POSTED">Posted</option>
                <option value="CLEARED">Cleared</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <button className="btn-primary" type="submit">
              Save & Post
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Down Payments Summary</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Party</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {downPayments.map((dp) => (
                <tr key={dp.id}>
                  <td>{dp.downPaymentNumber}</td>
                  <td>{dp.type}</td>
                  <td>{dp.partyName}</td>
                  <td>₹{Number(dp.amount).toFixed(2)}</td>
                  <td>{dp.paymentDate}</td>
                  <td>{dp.status}</td>
                </tr>
              ))}
              {downPayments.length === 0 && (
                <tr>
                  <td colSpan="6">No down payments.</td>
                </tr>
              )}
              {downPayments.length > 0 && (
                <tr className="table-total">
                  <td colSpan="3">
                    <strong>Total Advances</strong>
                  </td>
                  <td>
                    <strong>₹{totalAdvances.toFixed(2)}</strong>
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

export default DownPayments;