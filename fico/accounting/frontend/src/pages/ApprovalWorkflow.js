import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const ApprovalWorkflow = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      const res = await api.get('/approval-workflow/pending');
setPendingApprovals(res.data);
    } catch (err) {
      setError('Failed to load pending approvals');
    }
  };

  const openApprovalModal = (doc) => {
    setSelectedDoc(doc);
    setRemarks('');
    setShowModal(true);
  };

  const handleApprove = async () => {
  try {
    await api.post(`/approval-workflow/${selectedDoc.id}/decision`, {
      decision: 'APPROVE',
      remarks
    });
    setShowModal(false);
    loadPendingApprovals();
  } catch {
    setError('Approval failed');
  }
};

const handleReject = async () => {
  try {
    await api.post(`/approval-workflow/${selectedDoc.id}/decision`, {
      decision: 'REJECT',
      remarks
    });
    setShowModal(false);
    loadPendingApprovals();
  } catch {
    setError('Rejection failed');
  }
};
  const getDocTypeIcon = (type) => {
    const icons = {
      'INVOICE': '📄',
      'PAYMENT': '💰',
      'JOURNAL': '📊',
      'CREDIT_MEMO': '🔄'
    };
    return icons[type] || '📋';
  };

  return (
    <div>
      <h2>Approval Workflow (All Documents)</h2>
      {error && <div className="error-text">{error}</div>}
      
      <div className="card full-width">
        <div className="table-header">
          <h3>Pending Approvals ({pendingApprovals.length})</h3>
          <button className="btn-secondary" onClick={loadPendingApprovals}>
            Refresh
          </button>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Document</th>
              <th>Party/Account</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map(doc => (
              <tr key={doc.id}>
                <td>{getDocTypeIcon(doc.documentType)} {doc.documentType}</td>
                <td>{doc.documentNumber}</td>
                <td>{doc.partyName || doc.accountName}</td>
                <td>₹{Number(doc.amount || doc.totalAmount).toFixed(2)}</td>
                <td>{doc.createdAt.split('T')[0]}</td>
                <td>{doc.createdByName}</td>
                <td>
                  <button 
                    className="btn-primary btn-small"
                    onClick={() => openApprovalModal(doc)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {pendingApprovals.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">
                  No pending approvals 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Approval Modal */}
      {showModal && selectedDoc && (
        <div className="modal-backdrop">
          <div className="modal large">
            <div className="modal-header">
              <h4>
                {getDocTypeIcon(selectedDoc.documentType)} 
                {selectedDoc.documentType} - {selectedDoc.documentNumber}
              </h4>
              <button onClick={() => setShowModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div>
                  <p><strong>Party/Account:</strong> {selectedDoc.partyName || selectedDoc.accountName}</p>
                  <p><strong>Amount:</strong> ₹{Number(selectedDoc.amount || selectedDoc.totalAmount).toFixed(2)}</p>
                  <p><strong>Date:</strong> {selectedDoc.date}</p>
                  <p><strong>Created By:</strong> {selectedDoc.createdByName}</p>
                </div>
                <div>
                  <p><strong>Narration:</strong> {selectedDoc.narration || selectedDoc.description}</p>
                </div>
              </div>
              
              <div className="form-group">
                <label>Approval Remarks</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  placeholder="Optional remarks..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-danger btn-small" 
                onClick={handleReject}
              >
                Reject
              </button>
              <button className="btn-primary" onClick={handleApprove}>
                Approve & Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;