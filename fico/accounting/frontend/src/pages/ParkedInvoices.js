// frontend/src/pages/ParkedInvoices.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const ParkedInvoices = () => {
  const [parkedInvoices, setParkedInvoices] = useState([]);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  useEffect(() => {
    loadParkedInvoices();
  }, []);

  const loadParkedInvoices = async () => {
    try {
      const res = await api.get('/parked-invoices');
      setParkedInvoices(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load parked invoices');
    }
  };

  const openApprovalModal = (invoice) => {
    setSelectedInvoice(invoice);
    setApprovalRemarks('');
    setShowApprovalModal(true);
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    try {
      await api.post(`/parked-invoices/${selectedInvoice.id}/approve`, {
        approvedBy: 1, // TODO: replace with current user from auth
        approvalDate: new Date().toISOString().split('T')[0],
        remarks: approvalRemarks
      });

      setShowApprovalModal(false);
      await loadParkedInvoices();
      setError('');
    } catch (err) {
      setError('Approval failed');
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice) return;
    try {
      await api.post(`/parked-invoices/${selectedInvoice.id}/reject`);
      setShowApprovalModal(false);
      await loadParkedInvoices();
    } catch (err) {
      setError('Rejection failed');
    }
  };

  return (
    <div>
      <h2>Parked Invoices (Pending Approval)</h2>
      {error && <div className="error-text">{error}</div>}

      <div className="card full-width">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Party</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parkedInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.partyName}</td>
                <td>₹{Number(invoice.totalAmount).toFixed(2)}</td>
                <td>{invoice.date}</td>
                <td>{invoice.User?.name || ''}</td>
                <td>
                  <span
                    className={`status-${invoice.status.toLowerCase()}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td>
                  {invoice.status === 'PARKED' && (
                    <button
                      className="btn-primary btn-small"
                      onClick={() => openApprovalModal(invoice)}
                    >
                      Approve/Reject
                    </button>
                  )}
                  {invoice.status === 'APPROVED' && (
                    <span className="text-success">✓ Approved</span>
                  )}
                </td>
              </tr>
            ))}
            {parkedInvoices.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">
                  No parked invoices pending approval
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showApprovalModal && selectedInvoice && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h4>
                Approve Invoice {selectedInvoice.invoiceNumber}
              </h4>
              <button onClick={() => setShowApprovalModal(false)}>
                X
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Party:</strong> {selectedInvoice.partyName}
              </p>
              <p>
                <strong>Amount:</strong> ₹
                {Number(selectedInvoice.totalAmount).toFixed(2)}
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {selectedInvoice.User?.name || ''}
              </p>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger btn-small"
                onClick={handleReject}
              >
                Reject
              </button>
              <button
                className="btn-primary"
                onClick={handleApprove}
              >
                Approve & Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkedInvoices;