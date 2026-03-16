import React from "react";
import DashboardCard from "../components/DashboardCard";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        <DashboardCard title="Material Stock" count={10} />
        <DashboardCard title="Sales Orders" count={5} />
        <DashboardCard title="Quotations" count={8} />
        <DashboardCard title="Customers" count={12} />
      </div>
    </div>
  );
}

export default Dashboard;
