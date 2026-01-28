import React from "react";
import { Link } from "react-router-dom";

export default function QCLotList({ lots }) {
  const styles = {
    empty: {
      fontSize: 13
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
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
    link: {
      color: "#2563eb",
      textDecoration: "none"
    }
  };

  if (!lots || lots.length === 0) {
    return <div style={styles.empty}>No QC lots found.</div>;
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Lot ID</th>
          <th style={styles.th}>Material</th>
          <th style={styles.th}>Vendor</th>
          <th style={styles.th}>Batch</th>
          <th style={styles.th}>Stage</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {lots.map(l => (
          <tr key={l.id}>
            <td style={styles.td}>{l.id}</td>
            <td style={styles.td}>{l.material_id}</td>
            <td style={styles.td}>{l.vendor_id}</td>
            <td style={styles.td}>{l.batch_id}</td>
            <td style={styles.td}>{l.stage}</td>
            <td style={styles.td}>{l.status}</td>
            <td style={styles.td}>
              <Link style={styles.link} to={`/qc/lots/${l.id}`}>
                Inspect
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
