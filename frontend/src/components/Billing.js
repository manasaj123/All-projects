import React, { useEffect, useState } from "react";
import { getOrdersApi } from "../api/orderApi";
import {
  createInvoiceApi,
  getInvoicesApi,
  payInvoiceApi
} from "../api/invoiceApi";

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "16px 18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    marginTop: "10px"
  },
  title: {
    margin: "0 0 8px 0",
    color: "#0b3c5d"
  },
  subTitle: {
    margin: "12px 0 6px 0",
    color: "#333"
  },
  orderList: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px"
  },
  orderText: {
    marginRight: "8px"
  },
  createButton: {
    padding: "4px 10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "6px",
    fontSize: "14px"
  },
  th: {
    borderBottom: "1px solid #ccc",
    textAlign: "left",
    padding: "6px"
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "6px"
  },
  payButton: {
    marginLeft: "8px",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px"
  }
};

const Billing = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const load = async () => {
    const o = await getOrdersApi(token);
    const i = await getInvoicesApi(token);
    setOrders(o);
    setInvoices(i);
  };

  useEffect(() => {
    load();
  }, [token]);

  const handleCreateInvoice = async (orderId) => {
    await createInvoiceApi(token, orderId);
    load();
  };

  const handlePayInvoice = async (invoiceId) => {
    await payInvoiceApi(token, invoiceId);
    load();
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Billing</h3>

      <h4 style={styles.subTitle}>Orders (create invoice)</h4>
      <ul style={styles.orderList}>
        {orders
          .filter((o) => o.status !== "INVOICED")
          .map((o) => (
            <li key={o.id} style={styles.orderItem}>
              <span style={styles.orderText}>
                {o.customerName} – {o.status}
              </span>
              <button
                style={styles.createButton}
                onClick={() => handleCreateInvoice(o.id)}
              >
                Create Invoice
              </button>
            </li>
          ))}
      </ul>

      <h4 style={styles.subTitle}>Invoices</h4>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Order</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td style={styles.td}>{inv.orderId}</td>
              <td style={styles.td}>{inv.amount}</td>
              <td style={styles.td}>
                {inv.status}
                {inv.status === "PENDING" && (
                  <button
                    style={styles.payButton}
                    onClick={() => handlePayInvoice(inv.id)}
                  >
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Billing;
