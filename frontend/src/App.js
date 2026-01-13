// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import QCDashboardPage from "./pages/QCDashboardPage";
import QCLotsPage from "./pages/QCLotsPage";
import QCLotDetailPage from "./pages/QCLotDetailPage";
import QCPlansPage from "./pages/QCPlansPage";
import CAPAPage from "./pages/CAPAPage";

function App() {
  const styles = {
    header: {
      backgroundColor: "#081e4dff",
      color: "#f9fafb",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    headerTitle: {
      fontSize: "18px",
      fontWeight: 500,
    },
    headerLinks: {
      display: "flex",
      gap: "12px",
      fontSize: "14px",
    },
    headerLink: {
      color: "#e5e7eb",
      textDecoration: "none",
    },
    page: {
      padding: 2,
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14,
      
    },
    
  };

  return (
    <BrowserRouter>
      <header style={styles.header}>
        <div style={styles.headerTitle}>Quality</div>
        <nav style={styles.headerLinks}>
          <Link style={styles.headerLink} to="/qc">
            Dashboard
          </Link>
          <Link style={styles.headerLink} to="/qc/lots">
            Lots
          </Link>
          <Link style={styles.headerLink} to="/qc/plans">
            Plans
          </Link>
          <Link style={styles.headerLink} to="/qc/capa">
            CAPA
          </Link>
        </nav>
      </header>

      <div style={styles.page}>
        <Routes>
          <Route path="/qc" element={<QCDashboardPage />} />
          <Route path="/qc/lots" element={<QCLotsPage />} />
          <Route path="/qc/lots/:id" element={<QCLotDetailPage />} />
          <Route path="/qc/plans" element={<QCPlansPage />} />
          <Route path="/qc/capa" element={<CAPAPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
