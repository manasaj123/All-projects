import React, { useEffect, useState } from "react";
import { getOrdersApi, createOrderApi } from "../api/orderApi";

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
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px"
  },
  input: {
    flex: "1 1 150px",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  button: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "8px",
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
  }
};

const SalesOrder = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    customerRegion: "",
    product: "",
    quantity: 1,
    price: 0
  });

  const loadOrders = async () => {
    const data = await getOrdersApi(token);
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      customerName: form.customerName,
      customerRegion: form.customerRegion,
      items: [
        {
          product: form.product,
          quantity: Number(form.quantity),
          price: Number(form.price)
        }
      ]
    };
    await createOrderApi(token, payload);
    setForm({
      customerName: "",
      customerRegion: "",
      product: "",
      quantity: 1,
      price: 0
    });
    loadOrders();
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Sales Orders</h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Customer Name"
            value={form.customerName}
            onChange={(e) =>
              setForm({ ...form, customerName: e.target.value })
            }
          />
          <input
            style={styles.input}
            placeholder="Region"
            value={form.customerRegion}
            onChange={(e) =>
              setForm({ ...form, customerRegion: e.target.value })
            }
          />
          <input
            style={styles.input}
            placeholder="Product"
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Qty"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <button style={styles.button} type="submit">
            Create Order
          </button>
        </div>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Region</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td style={styles.td}>{o.customerName}</td>
              <td style={styles.td}>{o.customerRegion}</td>
              <td style={styles.td}>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesOrder;
