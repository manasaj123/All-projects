import React, { useEffect, useState } from "react";
import {
  getCustomerReportApi,
  getRegionReportApi
} from "../api/reportApi";

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "16px 18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    marginTop: "10px"
  },
  title: {
    margin: "0 0 10px 0",
    color: "#0b3c5d"
  },
  subTitle: {
    margin: "14px 0 6px 0",
    color: "#333"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
    fontSize: "14px"
  },
  th: {
    borderBottom: "1px solid #ccc",
    textAlign: "left",
    padding: "6px",
    backgroundColor: "#f7f7f7"
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "6px"
  },
  numeric: {
    textAlign: "right"
  }
};

const Reports = ({ token }) => {
  const [customerData, setCustomerData] = useState([]);
  const [regionData, setRegionData] = useState([]);

  useEffect(() => {
    (async () => {
      setCustomerData(await getCustomerReportApi(token));
      setRegionData(await getRegionReportApi(token));
    })();
  }, [token]);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Reports</h3>

      <h4 style={styles.subTitle}>Customer-wise Sales</h4>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={{ ...styles.th, ...styles.numeric }}>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {customerData.map((c) => (
            <tr key={c.customer}>
              <td style={styles.td}>{c.customer}</td>
              <td style={{ ...styles.td, ...styles.numeric }}>{c.totalSales}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={styles.subTitle}>Region-wise Sales</h4>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Region</th>
            <th style={{ ...styles.th, ...styles.numeric }}>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {regionData.map((r) => (
            <tr key={r.region}>
              <td style={styles.td}>{r.region}</td>
              <td style={{ ...styles.td, ...styles.numeric }}>{r.totalSales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
