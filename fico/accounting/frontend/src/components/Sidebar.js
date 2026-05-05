import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/dashboard">📊 Dashboard</NavLink>
      <NavLink to="/invoices">🧾 Invoices</NavLink>
      <NavLink to="/payments">💳 Payments</NavLink>
      <NavLink to="/bank-reconciliation">🏦 Bank Reconciliation</NavLink>
      <NavLink to="/budget">📈 Budget</NavLink>
      <NavLink to="/cost-centers">💰 Cost Centers</NavLink>
      <NavLink to="/profit-centers">📉 Profit Centers</NavLink>
      <NavLink to="/expenses">🧮 Expenses</NavLink>
      
      
      <NavLink to="/gl-accounts">G/L Accounts</NavLink>
      <NavLink to="/vendor-customer-invoices">_VENDOR/CUSTOMER INVOICES</NavLink>
      <NavLink to="/journal">✔ Journal</NavLink>
      <NavLink to="/accounting-documents">📝 A/c-Documents</NavLink>
      
      
      <NavLink
  to="/reports"
  style={({ isActive }) => ({
    color: isActive ? "yellow" : "white"
  })}
>
  📊 Reports
</NavLink>
      {/*<NavLink to="/ledger">✔ Ledger</NavLink> */}
      <NavLink to="/audit">🔍 Audit</NavLink>
    </aside>
  );
};

export default Sidebar;
