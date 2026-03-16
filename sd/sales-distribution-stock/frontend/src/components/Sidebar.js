import React from 'react';
import { NavLink } from 'react-router-dom';


const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/material-stock" className={linkClass}>
          Material Stock
        </NavLink>
        <NavLink to="/material-sales-view" className={linkClass}>
          Material Sales View
        </NavLink>

        <NavLink to="/customers" className={linkClass}>
          Customers
        </NavLink>
        <NavLink to="/customer-account-groups" className={linkClass}>
          Customer Account Groups
        </NavLink>

        
        <NavLink to="/quota" className={linkClass}>
          Quota
        </NavLink>
        <NavLink to="/credit" className={linkClass}>
          Credit
        </NavLink>
        <NavLink to="/pricing-config" className={linkClass}>
          Pricing Config
        </NavLink>
        <NavLink to="/schedule-line" className={linkClass}>
          Schedule Line
        </NavLink>
        <NavLink to="/item-categories-config" className={linkClass}>
          Item Categories
        </NavLink>
        <NavLink to="/sales-document-config" className={linkClass}>
          Sales Document
        </NavLink>

        <NavLink to="/sales-orders" className={linkClass}>
          Sales Orders
        </NavLink>
        <NavLink to="/billing" className={linkClass}>
          Billing
        </NavLink>
        <NavLink to="/deliveries" className={linkClass}>
          Deliveries
        </NavLink>
        <NavLink to="/picking" className={linkClass}>
          Picking
        </NavLink>
        <NavLink to="/shipping" className={linkClass}>
          Shipping
        </NavLink>

        <NavLink to="/inquiry" className={linkClass}>
          Inquiry
        </NavLink>
        <NavLink to="/agreement" className={linkClass}>
          Agreement
        </NavLink>
        <NavLink to="/route" className={linkClass}>
          Route
        </NavLink>
        <NavLink to="/conditions" className={linkClass}>
          Conditions
        </NavLink>
        <NavLink to="/pre-sales-activities" className={linkClass}>
          Pre‑Sales Activities
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
