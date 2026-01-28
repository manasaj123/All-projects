import React, { useState } from "react";

export default function CAPAForm({ onSave, defaultLotId, defaultDefectId }) {
  const [form, setForm] = useState({
    lot_id: defaultLotId || "",
    defect_id: defaultDefectId || "",
    title: "",
    problem_desc: "",
    root_cause: "",
    corrective_actions: "",
    preventive_actions: "",
    owner: "",
    due_date: "",
    status: "OPEN"
  });

  const styles = {
    form: {
      fontSize: 13,
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "8px 16px",
      maxWidth: 640
    },
    fullRow: {
      gridColumn: "1 / -1"
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
      border: "1px solid #d1d5db",
      width: "100%"
    },
    textarea: {
      padding: "4px 6px",
      fontSize: "13px",
      borderRadius: "4px",
      border: "1px solid #d1d5db",
      width: "100%",
      resize: "vertical"
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
      lot_id: form.lot_id || null,
      defect_id: form.defect_id || null
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.field}>
        <span style={styles.label}>Title</span>
        <input
          name="title"
          style={styles.input}
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Owner</span>
        <input
          name="owner"
          style={styles.input}
          value={form.owner}
          onChange={handleChange}
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Lot ID</span>
        <input
          name="lot_id"
          style={styles.input}
          value={form.lot_id}
          onChange={handleChange}
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Defect ID</span>
        <input
          name="defect_id"
          style={styles.input}
          value={form.defect_id}
          onChange={handleChange}
        />
      </div>

      <div style={styles.field}>
        <span style={styles.label}>Due date</span>
        <input
          type="date"
          name="due_date"
          style={styles.input}
          value={form.due_date}
          onChange={handleChange}
        />
      </div>

      <div style={{ ...styles.field, ...styles.fullRow }}>
        <span style={styles.label}>Problem description</span>
        <textarea
          name="problem_desc"
          style={styles.textarea}
          rows={2}
          value={form.problem_desc}
          onChange={handleChange}
        />
      </div>

      <div style={{ ...styles.field, ...styles.fullRow }}>
        <span style={styles.label}>Root cause</span>
        <textarea
          name="root_cause"
          style={styles.textarea}
          rows={2}
          value={form.root_cause}
          onChange={handleChange}
        />
      </div>

      <div style={{ ...styles.field, ...styles.fullRow }}>
        <span style={styles.label}>Corrective actions</span>
        <textarea
          name="corrective_actions"
          style={styles.textarea}
          rows={2}
          value={form.corrective_actions}
          onChange={handleChange}
        />
      </div>

      <div style={{ ...styles.field, ...styles.fullRow }}>
        <span style={styles.label}>Preventive actions</span>
        <textarea
          name="preventive_actions"
          style={styles.textarea}
          rows={2}
          value={form.preventive_actions}
          onChange={handleChange}
        />
      </div>

      <div style={styles.fullRow}>
        <button type="submit" style={styles.button}>
          Save CAPA
        </button>
      </div>
    </form>
  );
}
