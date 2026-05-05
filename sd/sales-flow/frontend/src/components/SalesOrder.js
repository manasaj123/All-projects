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
  inputError: {
    flex: "1 1 150px",
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
    padding: "20px",
    color: "#999",
    fontStyle: "italic"
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
    textTransform: "uppercase",
    minWidth: "70px",
    textAlign: "center"
  },
  fieldError: {
    color: "red",
    fontSize: "11px",
    marginTop: "-6px",
    marginBottom: "6px"
  }
};

const SalesOrder = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    customerName: "",
    customerRegion: "",
    product: "",
    quantity: "",
    price: ""
  });

  const loadOrders = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await getOrdersApi(token);
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  // Check if customer name already exists
  const isCustomerNameDuplicate = (name) => {
    if (!name || !name.trim()) return false;
    const trimmedName = name.trim().toLowerCase();
    return orders.some(order => 
      order.customerName && 
      order.customerName.toLowerCase().trim() === trimmedName
    );
  };

  // Validation for text fields - reject special characters and numbers
  const validateTextField = (value, fieldName) => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    
    // Check for special characters and numbers
    const invalidCharsRegex = /[!@#$%^&*(),.?":{}|<>[\]\\\/`~;'_+=0-9]/;
    if (invalidCharsRegex.test(value)) {
      return `${fieldName} should not contain special characters or numbers`;
    }
    
    return "";
  };

  const handleInputChange = (field, value) => {
    // For customer name, auto-clean special characters as you type
    if (field === "customerName") {
      // Remove special characters and numbers, but allow letters and spaces
      value = value.replace(/[!@#$%^&*(),.?":{}|<>[\]\\\/`~;'_+=0-9]/g, '');
    }
    
    // For region and product, auto-clean special characters and numbers
    if (field === "customerRegion" || field === "product") {
      value = value.replace(/[!@#$%^&*(),.?":{}|<>[\]\\\/`~;'_+=0-9]/g, '');
    }
    
    setForm({ ...form, [field]: value });
    
    if (fieldErrors[field]) {
      const newFieldErrors = { ...fieldErrors };
      delete newFieldErrors[field];
      setFieldErrors(newFieldErrors);
    }
    
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const newFieldErrors = {};

    // Validate customer name
    const customerNameError = validateTextField(form.customerName, "Customer name");
    if (customerNameError) {
      newFieldErrors.customerName = customerNameError;
    } else if (isCustomerNameDuplicate(form.customerName)) {
      newFieldErrors.customerName = "This customer name already exists. Please use a different name.";
    }

    // Validate region
    const regionError = validateTextField(form.customerRegion, "Region");
    if (regionError) newFieldErrors.customerRegion = regionError;

    // Validate product
    const productError = validateTextField(form.product, "Product name");
    if (productError) newFieldErrors.product = productError;

    // Validate quantity
    if (!form.quantity || Number(form.quantity) < 1) {
      newFieldErrors.quantity = "Quantity must be at least 1";
    }

    // Validate price
    if (form.price === "" || Number(form.price) < 0) {
      newFieldErrors.price = "Please enter a valid price";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    const payload = {
      customerName: form.customerName.trim(),
      customerRegion: form.customerRegion.trim(),
      product: form.product.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price)
    };

    try {
      await createOrderApi(token, payload);
      setSuccess("Order created successfully!");
      setForm({
        customerName: "",
        customerRegion: "",
        product: "",
        quantity: "",
        price: ""
      });
      setFieldErrors({});
      loadOrders();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create order");
    }
  };

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    const statusStyles = {
      pending: { backgroundColor: "#fff3cd", color: "#856404" },
      created: { backgroundColor: "#cce5ff", color: "#004085" },
      invoiced: { backgroundColor: "#d4edda", color: "#155724" },
      processing: { backgroundColor: "#fff3cd", color: "#856404" },
      completed: { backgroundColor: "#d4edda", color: "#155724" },
      cancelled: { backgroundColor: "#f8d7da", color: "#721c24" }
    };
    return statusStyles[statusLower] || statusStyles.pending;
  };

  const getProductName = (order) => {
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      return order.items.map(item => item.product).filter(Boolean).join(", ") || "";
    }
    return "";
  };

  const getOrderTotal = (order) => {
    if (order.total && Number(order.total) > 0) {
      return Number(order.total);
    }
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => {
        return sum + (Number(item.total) || Number(item.quantity) * Number(item.price) || 0);
      }, 0);
    }
    return 0;
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
      <h3 style={styles.title}>Sales Orders</h3>
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <div style={{ flex: "1 1 150px" }}>
            <input
              style={fieldErrors.customerName ? styles.inputError : styles.input}
              placeholder="Customer Name *"
              value={form.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
              required
            />
            {fieldErrors.customerName && (
              <div style={styles.fieldError}>{fieldErrors.customerName}</div>
            )}
          </div>
          
          <div style={{ flex: "1 1 150px" }}>
            <input
              style={fieldErrors.customerRegion ? styles.inputError : styles.input}
              placeholder="Region *"
              value={form.customerRegion}
              onChange={(e) => handleInputChange("customerRegion", e.target.value)}
              required
            />
            {fieldErrors.customerRegion && (
              <div style={styles.fieldError}>{fieldErrors.customerRegion}</div>
            )}
          </div>
          
          <div style={{ flex: "1 1 150px" }}>
            <input
              style={fieldErrors.product ? styles.inputError : styles.input}
              placeholder="Product *"
              value={form.product}
              onChange={(e) => handleInputChange("product", e.target.value)}
              required
            />
            {fieldErrors.product && (
              <div style={styles.fieldError}>{fieldErrors.product}</div>
            )}
          </div>
          
          <div style={{ flex: "1 1 150px" }}>
            <input
              style={fieldErrors.quantity ? styles.inputError : styles.input}
              type="number"
              placeholder="Qty *"
              value={form.quantity}
              min="1"
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              required
            />
            {fieldErrors.quantity && (
              <div style={styles.fieldError}>{fieldErrors.quantity}</div>
            )}
          </div>
          
          <div style={{ flex: "1 1 150px" }}>
            <input
              style={fieldErrors.price ? styles.inputError : styles.input}
              type="number"
              placeholder="Price *"
              value={form.price}
              min="0"
              step="0.01"
              onChange={(e) => handleInputChange("price", e.target.value)}
              required
            />
            {fieldErrors.price && (
              <div style={styles.fieldError}>{fieldErrors.price}</div>
            )}
          </div>
          
          <button style={styles.button} type="submit">
            Create Order
          </button>
        </div>
      </form>

      {loading ? (
        <div style={styles.loadingText}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={styles.noOrders}>No orders yet. Create your first order above.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order #</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Region</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id || o._id}>
                  <td style={styles.td}>{o.id || o._id}</td>
                  <td style={styles.td}>{o.customerName || ""}</td>
                  <td style={styles.td}>{o.customerRegion || ""}</td>
                  <td style={styles.td}>{getProductName(o)}</td>
                  <td style={styles.td}>{getOrderTotal(o)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(o.status)
                    }}>
                      {o.status?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesOrder;