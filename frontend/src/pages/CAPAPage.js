import React, { useEffect, useState } from "react";
import capaApi from "../api/capaApi";
import CAPAList from "../components/qc/CAPAList";
import CAPAForm from "../components/qc/CAPAForm";

export default function CAPAPage() {
  const [rows, setRows] = useState([]);

  const styles = {
    container: {
      padding: 16,
      fontSize: 13,
      height: "110vh",
      backgroundImage:
        "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(16,185,129,0.15), rgba(239,68,68,0.15))"
      
    },
    title: {
      fontSize: 20,
      marginBottom: 12
    },
    sectionTitle: {
      fontSize: 16,
      marginTop: 16,
      marginBottom: 8
    },
    divider: {
      height: 1,
      backgroundColor: "#e5e7eb",
      marginTop: 12,
      marginBottom: 12
    }
  };

  const load = async () => {
    const res = await capaApi.list({});
    // if capaApi.list already returns data array, use: const data = await capaApi.list({});
    setRows(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveCAPA = async data => {
    await capaApi.create(data);
    await load();
  };

  const handleChangeStatus = async (id, status) => {
    await capaApi.updateStatus(id, status);
    await load();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CAPA</h2>

      <CAPAList rows={rows} onChangeStatus={handleChangeStatus} />

      <div style={styles.divider} />

      <h3 style={styles.sectionTitle}>New CAPA</h3>
      <CAPAForm onSave={handleSaveCAPA} />
    </div>
  );
}
