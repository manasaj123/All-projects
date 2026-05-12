import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const TrialBalance = () => {
  const [trialBalance, setTrialBalance] = useState([]);
  const [period, setPeriod] = useState('2026-04'); // Current month
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrialBalance();
  }, [period]);

  const loadTrialBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/trial-balance/${period}`);
      setTrialBalance(res.data);
    } catch (err) {
      setError('Failed to load trial balance');
    } finally {
      setLoading(false);
    }
  };

  const grandTotalDebit = trialBalance.reduce((sum, row) => sum + Number(row.debit || 0), 0);
  const grandTotalCredit = trialBalance.reduce((sum, row) => sum + Number(row.credit || 0), 0);
  const grandTotalBalance = trialBalance.reduce((sum, row) => sum + Number(row.balance || 0), 0);

  return (
    <div>
      <h2>Trial Balance</h2>
      {error && <div className="error-text">{error}</div>}
      
      <div className="card">
        <div className="form-group">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="2026-04">Apr 2026</option>
            <option value="2026-03">Mar 2026</option>
            <option value="2026-02">Feb 2026</option>
            <option value="2026-01">Jan 2026</option>
            <option value="2025-12">Dec 2025 (YTD)</option>
          </select>
          <button className="btn-primary btn-small" onClick={loadTrialBalance} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card full-width">
        <h3>Trial Balance - {period}</h3>
        <div className="table-responsive">
          <table className="table trial-balance">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th className="amount-col">Debit</th>
                <th className="amount-col">Credit</th>
                <th className="amount-col">Balance</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.map((row, index) => (
                <tr key={row.accountNumber || index}>
                  <td><strong>{row.accountNumber}</strong></td>
                  <td>{row.accountName}</td>
                  <td className="amount-right">₹{Number(row.debit || 0).toFixed(2)}</td>
                  <td className="amount-right">₹{Number(row.credit || 0).toFixed(2)}</td>
                  <td className={`amount-right balance-${row.balanceType}`}>
                    ₹{Number(row.balance || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-total">
                <td colSpan="2"><strong>GRAND TOTAL</strong></td>
                <td className="amount-right"><strong>₹{grandTotalDebit.toFixed(2)}</strong></td>
                <td className="amount-right"><strong>₹{grandTotalCredit.toFixed(2)}</strong></td>
                <td className="amount-right"><strong>₹{grandTotalBalance.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {Math.abs(grandTotalDebit - grandTotalCredit) > 0.01 && (
          <div className="warning-box">
            ⚠️ Trial balance does not match! Difference: ₹{Math.abs(grandTotalDebit - grandTotalCredit).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialBalance;