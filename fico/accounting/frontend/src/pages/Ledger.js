// frontend/src/pages/Ledger.js
import React, { useEffect, useState } from 'react';
import api from '../api';

const Ledger = () => {
  const [partySummary, setPartySummary] = useState([]);
  const [error, setError] = useState('');

  const [selectedParty, setSelectedParty] = useState('');
  const [ledgerRows, setLedgerRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState('');

  const loadPartySummary = async () => {
    try {
      const res = await api.get('/invoices/summary/by-party');
      setPartySummary(res.data || []);
    } catch (err) {
      console.error('Party summary load error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load party summary');
    }
  };

  useEffect(() => {
    loadPartySummary().catch(console.error);
  }, []);

  const openLedgerForParty = async (partyName) => {
    if (!partyName) return;
    setSelectedParty(partyName);
    setShowModal(true);
    setLoadingLedger(true);
    setLedgerError('');
    setLedgerRows([]);

    try {
      const res = await api.get(`/ledger/party/${encodeURIComponent(partyName)}`);
      setLedgerRows(res.data || []);
    } catch (err) {
      console.error('Ledger load error', err.response?.data || err.message);
      setLedgerError(err.response?.data?.message || 'Failed to load ledger');
    } finally {
      setLoadingLedger(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setLedgerRows([]);
    setLedgerError('');
  };

  return (
    <div>
      <style>{`
        .card {
          background-color: #ffffff;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .table th,
        .table td {
          padding: 0.45rem 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .error-text {
          color: #b91c1c;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .link-button {
          background: none;
          border: none;
          color: #2563eb;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          font-size: 0.85rem;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #ffffff;
          border-radius: 6px;
          width: 900px;
          max-width: 95%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .modal-header,
        .modal-footer {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-footer {
          border-top: 1px solid #e5e7eb;
          border-bottom: none;
        }
        .modal-body {
          padding: 0.75rem;
          overflow: auto;
        }
        .btn-secondary {
          padding: 0.35rem 0.9rem;
          border-radius: 4px;
          border: none;
          background-color: #e5e7eb;
          cursor: pointer;
        }
      `}</style>

      <h2>Ledger</h2>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <h3>Party-wise Ledger</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Party</th>
              <th>Total Amount</th>
              <th>Balance</th>
              <th>Ledger</th>
            </tr>
          </thead>
          <tbody>
            {partySummary.map((row) => (
              <tr key={row.partyName}>
                <td>{row.partyName}</td>
                <td>{Number(row.totalAmount || 0).toFixed(2)}</td>
                <td>{Number(row.balanceAmount || 0).toFixed(2)}</td>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => openLedgerForParty(row.partyName)}
                  >
                    View ledger
                  </button>
                </td>
              </tr>
            ))}
            {partySummary.length === 0 && (
              <tr>
                <td colSpan="4">No parties yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h4>Ledger for {selectedParty}</h4>
              </div>
              <button type="button" onClick={closeModal}>
                X
              </button>
            </div>
            <div className="modal-body">
              {loadingLedger && <div>Loading...</div>}
              {ledgerError && <div className="error-text">{ledgerError}</div>}
              {!loadingLedger && !ledgerError && ledgerRows.length === 0 && (
                <div>No ledger entries.</div>
              )}
              {!loadingLedger && !ledgerError && ledgerRows.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerRows.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.posting_date}</td>
                        <td>{r.reference}</td>
                        <td>{r.account_name}</td>
                        <td>{Number(r.debit || 0).toFixed(2)}</td>
                        <td>{Number(r.credit || 0).toFixed(2)}</td>
                        <td>{Number(r.running_balance || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;