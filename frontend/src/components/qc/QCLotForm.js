import React, { useState } from "react";

export default function QCLotForm({ onSave }) {
  const [form, setForm] = useState({
    batch_id: "",
    material_id: "",
    vendor_id: "",
    location_id: "",
    stage: "WAREHOUSE",
    source_type: "MANUAL",
    source_id: ""
  });

  const styles = {
    form: {
      fontSize: 13,
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))", // 4 columns
      gap: "8px 16px",
      maxWidth: 960
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    },
    label: {
      fontSize: 12,
      color: "#374151"
    },
    input: {
      padding: "4px 6px",
      fontSize: "13px",
      borderRadius: "4px",
      border: "1px solid #d1d5db"
    },
    button: {
      marginTop: 8,
      padding: "4px 10px",
      fontSize: 13,
      borderRadius: 4,
      border: "1px solid #2563eb",
      backgroundColor: "#2563eb",
      color: "#fff",
      cursor: "pointer"
    },
    fullRow: {
      gridColumn: "1 / -1"
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      ...form,
      batch_id: form.batch_id || null,
      source_id: form.source_id || null
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Row 1: 4 fields */}
      <div style={styles.field}>
        <span style={styles.label}>Material ID</span>
        <input
          style={styles.input}
          name="material_id"
          value={form.material_id}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Vendor ID</span>
        <input
          style={styles.input}
          name="vendor_id"
          value={form.vendor_id}
          onChange={handleChange}
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Batch ID</span>
        <input
          style={styles.input}
          name="batch_id"
          value={form.batch_id}
          onChange={handleChange}
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Location ID</span>
        <input
          style={styles.input}
          name="location_id"
          value={form.location_id}
          onChange={handleChange}
        />
      </div>

      {/* Row 2: 3 fields + 1 empty */}
      <div style={styles.field}>
        <span style={styles.label}>Stage</span>
        <select
          style={styles.input}
          name="stage"
          value={form.stage}
          onChange={handleChange}
        >
          <option value="FIELD">FIELD</option>
          <option value="WAREHOUSE">WAREHOUSE</option>
        </select>
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Source Type</span>
        <input
          style={styles.input}
          name="source_type"
          value={form.source_type}
          onChange={handleChange}
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Source ID</span>
        <input
          style={styles.input}
          name="source_id"
          value={form.source_id}
          onChange={handleChange}
        />
      </div>

      <div /> {/* empty to keep 4 columns */}

      {/* Row 3: button full width */}
      <div style={{ ...styles.fullRow, marginTop: 4 }}>
        <button type="submit" style={styles.button}>
          Create QC Lot
        </button>
      </div>
    </form>
  );
}
