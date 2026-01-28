import React, { useEffect, useState } from "react";
import { getDeliveriesApi, createDeliveryApi } from "../api/deliveryApi";

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
  formRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px"
  },
  input: {
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  button: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#0b3c5d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px"
  }
};

const Delivery = ({ token }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [address, setAddress] = useState("");

  const loadDeliveries = async () => {
    const data = await getDeliveriesApi(token);
    setDeliveries(data);
  };

  useEffect(() => {
    loadDeliveries();
  }, [token]);

  const handleCreate = async () => {
    if (!orderId || !address) return;

    await createDeliveryApi(
      { orderId: Number(orderId), address, status: "OUT_FOR_DELIVERY" },
      token
    );

    setOrderId("");
    setAddress("");
    await loadDeliveries();
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Deliveries</h3>

      {/* Add Delivery inputs */}
      <div style={styles.formRow}>
        <input
          style={styles.input}
          type="number"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button style={styles.button} onClick={handleCreate}>
          Add Delivery
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Order</th>
            <th style={styles.th}>Address</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr key={d.id}>
              <td style={styles.td}>{d.orderId}</td>
              <td style={styles.td}>{d.address}</td>
              <td style={styles.td}>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Delivery;
