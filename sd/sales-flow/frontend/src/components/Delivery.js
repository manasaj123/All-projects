import React, { useEffect, useState } from "react";
import { getDeliveriesApi, createDeliveryApi } from "../api/deliveryApi";
import { getOrdersApi } from "../api/orderApi";

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
  },
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
    alignItems: "flex-start"
  },
  select: {
    flex: "1 1 200px",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white"
  },
  input: {
    flex: "1 1 250px",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  inputError: {
    flex: "1 1 250px",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid red",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#fff8f8"
  },
  selectError: {
    flex: "1 1 200px",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid red",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#fff8f8"
  },
  button: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#0b3c5d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  buttonDisabled: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ccc",
    color: "#666",
    cursor: "not-allowed",
    fontSize: "14px",
    whiteSpace: "nowrap"
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
  noDeliveries: {
    textAlign: "center",
    padding: "20px",
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
    minWidth: "80px",
    textAlign: "center",
    backgroundColor: 
      status === "DELIVERED" ? "#d4edda" :
      status === "OUT_FOR_DELIVERY" ? "#cce5ff" :
      status === "OUT FOR DELIVERY" ? "#cce5ff" :
      status === "PENDING" ? "#fff3cd" :
      status === "CANCELLED" ? "#f8d7da" : "#e2e3e5",
    color:
      status === "DELIVERED" ? "#155724" :
      status === "OUT_FOR_DELIVERY" ? "#004085" :
      status === "OUT FOR DELIVERY" ? "#004085" :
      status === "PENDING" ? "#856404" :
      status === "CANCELLED" ? "#721c24" : "#383d41"
  }),
  fieldError: {
    color: "red",
    fontSize: "11px",
    marginTop: "4px"
  },
  stats: {
    backgroundColor: "#f0f7ff",
    padding: "8px 12px",
    borderRadius: "4px",
    marginBottom: "12px",
    color: "#004085",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    flexWrap: "wrap",
    gap: "8px"
  },
  missingData: {
    color: "#dc3545",
    fontStyle: "italic",
    fontSize: "12px"
  },
  orderInfo: {
    backgroundColor: "#f8f9fa",
    padding: "8px 12px",
    borderRadius: "4px",
    marginBottom: "10px",
    fontSize: "13px",
    color: "#666"
  }
};

const Delivery = ({ token }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Load both deliveries and orders
  const loadData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [deliveryData, orderData] = await Promise.all([
        getDeliveriesApi(token),
        getOrdersApi(token)
      ]);
      setDeliveries(Array.isArray(deliveryData) ? deliveryData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setError("");
    } catch (err) {
      setError("Failed to load data");
      setDeliveries([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Get selected order details
  const getSelectedOrder = () => {
    if (!selectedOrderId) return null;
    return orders.find(o => (o.id || o._id) == selectedOrderId);
  };

  // Handle order selection
  const handleOrderSelect = (orderId) => {
    setSelectedOrderId(orderId);
    setFieldErrors({});
    setError("");
    
    // Auto-fill address if order has region or customer info
    if (orderId) {
      const order = orders.find(o => (o.id || o._id) == orderId);
      if (order) {
        // Create address from order details
        const orderAddress = [
          order.customerName,
          order.customerRegion,
          order.address,
          order.shippingAddress
        ].filter(Boolean).join(", ");
        
        if (orderAddress) {
          setAddress(orderAddress);
        }
      }
    }
  };

  // Get address from delivery - handle different field names
  const getDeliveryAddress = (delivery) => {
    return delivery.address || 
           delivery.deliveryAddress || 
           delivery.shippingAddress || 
           delivery.location || 
           "";
  };

  // Get order details for display
  const getOrderInfo = (orderId) => {
    const order = orders.find(o => (o.id || o._id) == orderId);
    if (!order) return `Order #${orderId}`;
    
    const product = order.items && order.items.length > 0 
      ? order.items.map(i => i.product).join(", ")
      : order.product || "";
    
    const total = order.total || 0;
    
    return `${order.customerName || ""} - ${product} (₹${total})`;
  };

  // Validate address
  const validateAddress = (value) => {
    if (!value.trim()) {
      return "Address is required";
    }
    
    const invalidCharsRegex = /[!@#$%^&*()_+={}|[\]\\`~;'0-9]/;
    if (invalidCharsRegex.test(value)) {
      return "Address should not contain special characters or numbers";
    }
    
    return "";
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    
    const newFieldErrors = {};

    // Validate Order selection
    if (!selectedOrderId) {
      newFieldErrors.orderId = "Please select an order";
    }

    // Validate Address
    const addressError = validateAddress(address);
    if (addressError) {
      newFieldErrors.address = addressError;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);
    try {
      await createDeliveryApi(
        { 
          orderId: Number(selectedOrderId), 
          address: address.trim(), 
          status: "OUT_FOR_DELIVERY" 
        },
        token
      );

      setSuccess("Delivery created successfully!");
      setSelectedOrderId("");
      setAddress("");
      setFieldErrors({});
      await loadData();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (value) => {
    // Auto-clean special characters from address
    value = value.replace(/[!@#$%^&*()_+={}|[\]\\`~;'0-9]/g, '');
    setAddress(value);
    
    if (fieldErrors.address) {
      const newFieldErrors = { ...fieldErrors };
      delete newFieldErrors.address;
      setFieldErrors(newFieldErrors);
    }
    
    if (error) setError("");
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

  const getDeliveryStats = () => {
    const total = deliveries.length;
    const delivered = deliveries.filter(d => 
      d.status === "DELIVERED"
    ).length;
    const outForDelivery = deliveries.filter(d => 
      d.status === "OUT_FOR_DELIVERY" || d.status === "OUT FOR DELIVERY"
    ).length;
    const pending = deliveries.filter(d => 
      d.status === "PENDING"
    ).length;
    
    return { total, delivered, outForDelivery, pending };
  };

  const stats = getDeliveryStats();
  const selectedOrder = getSelectedOrder();

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Deliveries</h3>
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Add Delivery Form */}
      <div style={styles.formRow}>
        <div style={{ flex: "1 1 200px" }}>
          <select
            style={fieldErrors.orderId ? styles.selectError : styles.select}
            value={selectedOrderId}
            onChange={(e) => handleOrderSelect(e.target.value)}
          >
            <option value="">Select Order *</option>
            {orders
              .filter(o => o.status !== "CANCELLED")
              .map(o => (
                <option key={o.id || o._id} value={o.id || o._id}>
                  #{o.id || o._id} - {o.customerName || "Unknown"} ({o.product || "No product"})
                </option>
              ))}
          </select>
          {fieldErrors.orderId && (
            <div style={styles.fieldError}>{fieldErrors.orderId}</div>
          )}
        </div>
        
        <div style={{ flex: "1 1 250px" }}>
          <input
            style={fieldErrors.address ? styles.inputError : styles.input}
            type="text"
            placeholder="Delivery Address * (e.g., Street, City)"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
          />
          {fieldErrors.address && (
            <div style={styles.fieldError}>{fieldErrors.address}</div>
          )}
        </div>
        
        <button 
          style={loading ? styles.buttonDisabled : styles.button} 
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Delivery"}
        </button>
      </div>

      {/* Selected Order Info */}
      {selectedOrder && (
        <div style={styles.orderInfo}>
          <strong>Order #{selectedOrder.id || selectedOrder._id}:</strong>{" "}
          {selectedOrder.customerName || "Unknown"} |{" "}
          {selectedOrder.product || "No product"} |{" "}
          Qty: {selectedOrder.quantity || 1} |{" "}
          Total: ₹{selectedOrder.total || 0}
        </div>
      )}

      {/* Delivery Stats */}
      {deliveries.length > 0 && (
        <div style={styles.stats}>
          <span><strong>Total: </strong>{stats.total}</span>
          <span style={{ color: "#155724" }}><strong>✓ Delivered: </strong>{stats.delivered}</span>
          <span style={{ color: "#004085" }}><strong>🚚 Out for Delivery: </strong>{stats.outForDelivery}</span>
          <span style={{ color: "#856404" }}><strong>⏳ Pending: </strong>{stats.pending}</span>
        </div>
      )}

      {/* Deliveries Table */}
      {loading ? (
        <div style={styles.loadingText}>Loading deliveries...</div>
      ) : deliveries.length === 0 ? (
        <div style={styles.noDeliveries}>
          No deliveries yet. Select an order and add delivery address above.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Delivery #</th>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => {
                const deliveryAddress = getDeliveryAddress(d);
                return (
                  <tr key={d.id || d._id}>
                    <td style={styles.td}>{d.id || d._id}</td>
                    <td style={styles.td}>{getOrderInfo(d.orderId)}</td>
                    <td style={styles.td}>
                      {deliveryAddress || <span style={styles.missingData}>No address</span>}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(d.status)}>
                        {d.status?.replace(/_/g, " ") || "PENDING"}
                      </span>
                    </td>
                    <td style={styles.td}>{formatDate(d.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Delivery;