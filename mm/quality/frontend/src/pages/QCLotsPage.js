// frontend/src/pages/QCLotsPage.js
import React, { useEffect, useState, useCallback } from "react";
import qcLotApi from "../api/qcLotApi";
import QCLotList from "../components/qc/QCLotList";
import QCLotForm from "../components/qc/QCLotForm";

export default function QCLotsPage() {
  const [lots, setLots] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [stage, setStage] = useState("WAREHOUSE");

  const styles = {
    container: {
      padding: 16,
      fontSize: 13,
      height: "85vh",
      backgroundImage:
        "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(16,185,129,0.15), rgba(239,68,68,0.15))"
      
    },
    title: {
      fontSize: 20,
      marginBottom: 12
    },
    filterRow: {
      fontSize: 13,
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 16
    },
    label: {
      display: "flex",
      alignItems: "center",
      gap: 4
    },
    select: {
      padding: "4px 6px",
      fontSize: "13px",
      borderRadius: "4px",
      border: "1px solid #d1d5db"
    },
    sectionTitle: {
      fontSize: 16,
      marginTop: 16,
      marginBottom: 8
    }
  };

  const load = useCallback(async () => {
    const res = await qcLotApi.list({
      status: status || undefined,
      stage: stage || undefined
    });
    setLots(res.data || []);
  }, [status, stage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateLot = async data => {
    await qcLotApi.create(data);
    await load();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>QC Lots</h2>

      <div style={styles.filterRow}>
        <label style={styles.label}>
          <span>Status</span>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={styles.select}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>

        <label style={styles.label}>
          <span>Stage</span>
          <select
            value={stage}
            onChange={e => setStage(e.target.value)}
            style={styles.select}
          >
            <option value="">Any</option>
            <option value="FIELD">Field</option>
            <option value="WAREHOUSE">Warehouse</option>
          </select>
        </label>
      </div>

      <QCLotList lots={lots} />

      <h3 style={styles.sectionTitle}>Create QC Lot (manual)</h3>
      <QCLotForm onSave={handleCreateLot} />
    </div>
  );
}
