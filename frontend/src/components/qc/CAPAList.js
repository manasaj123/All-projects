import React from "react";

export default function CAPAList({ rows, onChangeStatus }) {
  if (!rows || rows.length === 0) {
    return <div style={{ fontSize: 13 }}>No CAPA records.</div>;
  }

  const styles = {
    table: {
      borderCollapse: "collapse",
      width: "100%",
      fontSize: 13
    },
    th: {
      textAlign: "left",
      padding: "6px 8px",
      borderBottom: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb"
    },
    td: {
      padding: "6px 8px",
      borderBottom: "1px solid #f3f4f6"
    },
    rowHover: {
      cursor: "default"
    },
    button: {
      padding: "2px 8px",
      fontSize: 12,
      borderRadius: 4,
      border: "1px solid #059669",
      backgroundColor: "#10b981",
      color: "#ffffff",
      cursor: "pointer"
    },
    statusOpen: {
      color: "#b45309", 
      fontWeight: 500
    },
    statusClosed: {
      color: "#065f46", 
      fontWeight: 500
    }
  };

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>ID</th>
          <th style={styles.th}>Title</th>
          <th style={styles.th}>Owner</th>
          <th style={styles.th}>Due date</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(c => (
          <tr key={c.id} style={styles.rowHover}>
            <td style={styles.td}>{c.id}</td>
            <td style={styles.td}>{c.title}</td>
            <td style={styles.td}>{c.owner}</td>
            <td style={styles.td}>{c.due_date}</td>
            <td style={styles.td}>
              <span
                style={
                  c.status === "CLOSED"
                    ? styles.statusClosed
                    : styles.statusOpen
                }
              >
                {c.status}
              </span>
            </td>
            <td style={styles.td}>
              {c.status !== "CLOSED" && (
                <button
                  style={styles.button}
                  onClick={() => onChangeStatus(c.id, "CLOSED")}
                >
                  Close
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
