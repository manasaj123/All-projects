import React, { useState } from "react";
import QCPlanForm from "../components/qc/QCPlanForm";

export default function QCPlansPage() {
  const [materialId, setMaterialId] = useState("");

  const styles = {
    container: {
      padding: 16,
      fontSize: 13,
      height: "85vh",
      backgroundImage:
        "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(16,185,129,0.15), rgba(239,68,68,0.15))"
      
    },
    header: {
      textAlign: "center",
      marginBottom: 16
    },
    title: {
      fontSize: 30,
      marginBottom: 8
    },
    filterRow: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 12
    },
    label: {
      display: "flex",
      alignItems: "center",
      gap: 4
    },
    input: {
      padding: "4px 6px",
      fontSize: 13,
      borderRadius: 4,
      border: "1px solid #d1d5db",
      width: 140
    },
    hint: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 4,
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>QC Plans</h2>
      </div>

      <div style={styles.filterRow}>
        <label style={styles.label}>
          <span>Material ID</span>
          <input
            style={styles.input}
            value={materialId}
            onChange={e => setMaterialId(e.target.value)}
            placeholder="e.g. 1"
          />
        </label>
      </div>

      {materialId && (
        <>
          <div style={styles.hint}>
            Showing QC plan for material ID {materialId}.
          </div>
          <QCPlanForm materialId={Number(materialId)} />
        </>
      )}
    </div>
  );
}
