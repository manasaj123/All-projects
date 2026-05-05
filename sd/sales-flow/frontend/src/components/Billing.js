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
    fontSize: "14px",
    flexWrap: "wrap",
    gap: "8px"
  },
  orderText: {
    marginRight: "8px",
    flex: "1"
  },
  createButton: {
    padding: "4px 10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap"
  },
  createButtonDisabled: {
    padding: "4px 10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ccc",
    color: "#666",
    cursor: "not-allowed",
    fontSize: "13px",
    whiteSpace: "nowrap"
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
    padding: "6px",
    backgroundColor: "#f7f7f7"
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
  },
  error: {
    color: "red",
    marginBottom: "8px",
    fontSize: "13px"
  },
  success: {
    color: "green",
    marginBottom: "8px",
    fontSize: "13px"
  },
  loadingText: {
    textAlign: "center",
    padding: "10px",
    color: "#666"
  },
  noOrders: {
    textAlign: "center",
    padding: "10px",
    color: "#999",
    fontStyle: "italic"
  },
  noInvoices: {
    textAlign: "center",
    padding: "10px",
    color: "#999",
    fontStyle: "italic"
  },
  statusBadge: (status) => ({
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
    textTransform: "uppercase",
    minWidth: "70px",
    textAlign: "center",
    backgroundColor: 
      status === "PAID" ? "#d4edda" :
      status === "PENDING" ? "#fff3cd" :
      status === "CANCELLED" ? "#f8d7da" : "#e2e3e5",
    color:
      status === "PAID" ? "#155724" :
      status === "PENDING" ? "#856404" :
      status === "CANCELLED" ? "#721c24" : "#383d41"
  }),
  amountText: {
    fontWeight: "bold",
    color: "#0b3c5d"
  }
};

const Billing = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [o, i] = await Promise.all([
        getOrdersApi(token),
        getInvoicesApi(token)
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setInvoices(Array.isArray(i) ? i : []);
      setError("");
    } catch (err) {
      setError("Failed to load data");
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  // Calculate order total
  const getOrderTotal = (order) => {
    if (order.total && Number(order.total) > 0) {
      return Number(order.total);
    }
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => {
        return sum + (Number(item.total) || Number(item.quantity) * Number(item.price) || 0);
      }, 0);
    }
    return Number(order.price || 0) * Number(order.quantity || 1);
  };

  const handleCreateInvoice = async (orderId) => {
    setError("");
    setSuccess("");
    
    const order = orders.find(o => (o.id || o._id) == orderId);
    if (!order) {
      setError("Order not found");
      return;
    }

    setLoading(true);
    try {
      // Send complete invoice data
      const payload = {
        orderId: order.id || order._id,
        customerName: order.customerName || "",
        amount: getOrderTotal(order),
        items: order.items || [],
        status: "PENDING"
      };
      
      console.log("Creating invoice with data:", payload); // Debug log
      
      await createInvoiceApi(token, payload);
      setSuccess(`Invoice created for Order #${orderId}`);
      await load();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create invoice");
      console.error("Create invoice error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    setError("");
    setSuccess("");
    
    setLoading(true);
    try {
      await payInvoiceApi(token, invoiceId);
      setSuccess(`Invoice #${invoiceId} marked as paid`);
      await load();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to pay invoice");
      console.error("Pay invoice error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Billing & Invoices</h3>
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <h4 style={styles.subTitle}>Pending Orders</h4>
      {loading && !orders.length ? (
        <div style={styles.loadingText}>Loading orders...</div>
      ) : orders.filter((o) => o.status !== "INVOICED").length === 0 ? (
        <div style={styles.noOrders}>All orders have been invoiced.</div>
      ) : (
        <ul style={styles.orderList}>
          {orders
            .filter((o) => o.status !== "INVOICED")
            .map((o) => {
              const orderTotal = getOrderTotal(o);
              return (
                <li key={o.id || o._id} style={styles.orderItem}>
                  <span style={styles.orderText}>
                    <strong>#{o.id || o._id}</strong> - {o.customerName || "Unknown"} 
                    {" | "}{o.product || "No product"}
                    {" | "}Qty: {o.quantity || 1}
                    {" | "}<span style={styles.amountText}>₹{orderTotal.toFixed(2)}</span>
                    {" | "}{o.status}
                  </span>
                  <button
                    style={loading ? styles.createButtonDisabled : styles.createButton}
                    onClick={() => handleCreateInvoice(o.id || o._id)}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Invoice"}
                  </button>
                </li>
              );
            })}
        </ul>
      )}

      <h4 style={styles.subTitle}>Invoices</h4>
      {loading && !invoices.length ? (
        <div style={styles.loadingText}>Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div style={styles.noInvoices}>No invoices yet. Create an invoice from orders above.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Invoice #</th>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id || inv._id}>
                  <td style={styles.td}>{inv.id || inv._id}</td>
                  <td style={styles.td}>#{inv.orderId}</td>
                  <td style={styles.td}>{inv.customerName || "-"}</td>
                  <td style={styles.td}>
                    <span style={styles.amountText}>₹{Number(inv.amount || 0).toFixed(2)}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(inv.status)}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(inv.createdAt)}</td>
                  <td style={styles.td}>
                    {inv.status === "PENDING" && (
                      <button
                        style={styles.payButton}
                        onClick={() => handlePayInvoice(inv.id || inv._id)}
                        disabled={loading}
                      >
                        ✓ Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Billing;