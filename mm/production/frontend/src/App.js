// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ForecastPage from "./pages/ForecastPage";
import PlanPage from "./pages/PlanPage";
import CapacityPage from "./pages/CapacityPage";
import BatchPage from "./pages/BatchPage";
import WorkOrderPage from "./pages/WorkOrderPage";
import MRPRunPage from "./pages/MRPRunPage";
import MetricsPage from "./pages/MetricsPage";
import ProductMasterPage from "./pages/ProductMasterPage";

function App() {
  return (
    <div className="pp-app">
      <nav className="pp-nav">
        <h3 className="pp-logo">production-planning</h3>
        <Link to="/products">Products</Link>
        <Link to="/forecast">Forecast</Link>
        <Link to="/plan">Plan</Link>
        <Link to="/capacity">Capacity</Link>
        <Link to="/batches">Batches</Link>
        <Link to="/work-orders">Work Orders</Link>
        <Link to="/mrp">MRP</Link>
        <Link to="/metrics">Metrics</Link>

      </nav>

      <main className="pp-main">
        <Routes>
          <Route path="/products" element={<ProductMasterPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/capacity" element={<CapacityPage />} />
          <Route path="/batches" element={<BatchPage />} />
          <Route path="/work-orders" element={<WorkOrderPage />} />
          <Route path="/mrp" element={<MRPRunPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="*" element={<ForecastPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
