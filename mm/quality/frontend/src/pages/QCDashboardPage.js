// src/pages/QCDashboardPage.js
import React, { useEffect, useState } from "react";

// Mock dashboard data
const MOCK_SUMMARY = {
  lots: {
    total: 6,
    byStatus: {
      PENDING: 1,
      ACCEPTED: 1,
      REJECTED: 2,
      ACCEPTED_WITH_DEVIATION: 2
    }
  },
  plans: {
    total: 1
  },
  capa: {
    total: 3,
    byStatus: {
      OPEN: 1,
      IN_PROGRESS: 1,
      CLOSED: 1
    }
  }
};

export default function QCDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const styles = {
    container: {
      minHeight: "85vh",
      padding: 16,
      backgroundImage:
        "linear-gradient(90deg, rgba(102,160,253,0.49), rgba(16,185,129,0.15), rgba(239,68,68,0.15))",
      fontSize: 13
    },
    title: {
      fontSize: 32,
      marginBottom: 16,
      textAlign: "center",
      fontWeight: "bold",
      fontFamily: "roboto, sans-serif"
    },
    cardsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
      maxWidth: 960,
      margin: "0 auto"
    },
    card: {
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 8,
      padding: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 4
    },
    cardValue: {
      fontSize: 24,
      fontWeight: "bold"
    },
    cardSub: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 4
    }
  };

  useEffect(() => {
    async function load() {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Use mock data instead of API
        setSummary(MOCK_SUMMARY);
      } catch (e) {
        console.error("Failed to load QC summary", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lotsPending = summary?.lots?.byStatus?.PENDING || 0;
  const lotsAccepted = summary?.lots?.byStatus?.ACCEPTED || 0;
  const lotsRejected = summary?.lots?.byStatus?.REJECTED || 0;
  const capaOpen = summary?.capa?.byStatus?.OPEN || 0;
  const capaClosed = summary?.capa?.byStatus?.CLOSED || 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Material Quality Dashboard</h2>

      {loading && <div style={{ textAlign: "center", padding: "40px" }}>Loading summary...</div>}

      {!loading && summary && (
        <div style={styles.cardsRow}>
          {/* Lots card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>QC Lots</div>
            <div style={styles.cardValue}>{summary.lots.total}</div>
            <div style={styles.cardSub}>
              Pending: {lotsPending} • Accepted: {lotsAccepted} • Rejected: {lotsRejected}
            </div>
          </div>

          {/* QC Plans card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>QC Plans</div>
            <div style={styles.cardValue}>{summary.plans.total}</div>
            <div style={styles.cardSub}>Total materials with QC plan</div>
          </div>

          {/* CAPA card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>CAPA</div>
            <div style={styles.cardValue}>{summary.capa.total}</div>
            <div style={styles.cardSub}>
              Open: {capaOpen} • Closed: {capaClosed}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}