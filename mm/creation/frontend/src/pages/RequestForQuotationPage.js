import React, { useEffect, useState } from "react";
import rfqApi from "../api/rfqApi";
import vendorApi from "../api/vendorApi";
import materialApi from "../api/materialApi";

export default function RequestForQuotationPage() {
  const styles = {
    container: {
      maxWidth: "1100px",
      margin: "10px auto",
      padding: "16px",
      background: "#f4f6f9",
      borderRadius: "10px",
      fontFamily: "Arial, sans-serif"
    },
    title: {
      textAlign: "center",
      marginBottom: "16px"
    },
    sectionTitle: {
      marginTop: "20px",
      marginBottom: "8px",
      fontSize: "16px"
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "16px",
      marginBottom: "10px"
    },
    formCol: {},
    label: {
      fontWeight: "bold",
      display: "block",
      marginBottom: "4px"
    },
    input: {
      padding: "7px",
      width: "100%",
      borderRadius: "5px",
      border: "1px solid #ccc",
      boxSizing: "border-box"
    },
    inputError: {
      padding: "7px",
      width: "100%",
      borderRadius: "5px",
      border: "2px solid #dc2626",
      boxSizing: "border-box",
      backgroundColor: "#fef2f2"
    },
    errorText: {
      color: "#dc2626",
      fontSize: "11px",
      marginTop: "4px"
    },
    tableWrapper: {
      marginTop: "10px",
      overflowX: "auto"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white"
    },
    th: {
      background: "#2563eb",
      color: "white",
      padding: "8px",
      border: "1px solid #ddd",
      fontSize: "13px",
      whiteSpace: "nowrap"
    },
    td: {
      padding: "6px",
      border: "1px solid #ddd",
      fontSize: "13px",
      verticalAlign: "middle"
    },
    button: {
      padding: "8px 14px",
      marginTop: "15px",
      marginRight: "10px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px"
    },
    addBtn: { background: "#2563eb", color: "white" },
    saveBtn: { background: "#16a34a", color: "white" },
    cancelBtn: { background: "#6b7280", color: "white" },
    editBtn: {
      background: "#0b51f5",
      color: "white",
      padding: "4px 10px",
      marginRight: "4px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px"
    },
    deleteBtn: {
      background: "#dc2626",
      color: "white",
      padding: "4px 10px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px"
    },
    searchBox: {
      padding: "7px",
      width: "260px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "10px",
    }
  };

  const [rfqs, setRFQs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [header, setHeader] = useState({
    rfq_type: "",
    rfq_date: "",
    question_deadline: "",
    purchase_org: "",
    delivery_date: "",
    material_group: "",
    plant: "",
    storage_location: "",
    vendor_id: "",
    supplying_plant: "",
    reference_pr_id: ""
  });

  const [items, setItems] = useState([{ material_id: "", qty: "" }]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validate no special characters (only letters, numbers, spaces, and hyphens)
  const validateNoSpecialChars = (value, fieldName) => {
    if (!value) return "";
    const regex = /^[A-Za-z0-9\s-]+$/;
    if (!regex.test(value)) {
      return `${fieldName} should only contain letters, numbers, spaces and hyphens (no special characters like @, #, $, etc.)`;
    }
    return "";
  };

  // Validate PR format (e.g., PR-001, PR-123, PO-456)
  const validatePRFormat = (value, fieldName) => {
    if (!value) return "";
    // Format: 2-3 letters followed by hyphen followed by 3-4 digits
    const prRegex = /^[A-Za-z]{2,3}-\d{3,4}$/;
    if (!prRegex.test(value)) {
      return `${fieldName} must be in format like PR-001, PO-123, RFQ-4567 (letters-hyphen-numbers)`;
    }
    return "";
  };

  // Validate date is not in the past
  const validateNotPastDate = (date, fieldName) => {
    if (!date) return "";
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return `${fieldName} cannot be a past date`;
    }
    return "";
  };

  // Validate quantity is positive
  const validateQuantity = (qty) => {
    if (!qty && qty !== 0) return "";
    const num = Number(qty);
    if (isNaN(num)) return "Quantity must be a number";
    if (num <= 0) return "Quantity must be greater than 0";
    return "";
  };

  const loadRFQs = async () => {
    const res = await rfqApi.getAll();
    setRFQs(res.data);
  };

  const loadMaterials = async () => {
    const res = await materialApi.getAll();
    setMaterials(res.data);
  };

  const loadVendors = async () => {
    const res = await vendorApi.getAll();
    setVendors(res.data);
  };

  useEffect(() => {
    loadRFQs();
    loadMaterials();
    loadVendors();
  }, []);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Remove special characters from text fields (allow hyphens for reference_pr_id)
    if (name === "rfq_type" || name === "purchase_org" || name === "material_group" || 
        name === "plant" || name === "storage_location" || name === "supplying_plant") {
      processedValue = value.replace(/[^A-Za-z0-9\s-]/g, '');
    }
    
    // For reference_pr_id, allow letters, numbers, and hyphens
    if (name === "reference_pr_id") {
      processedValue = value.replace(/[^A-Za-z0-9-]/g, '');
      // Convert to uppercase for consistency
      processedValue = processedValue.toUpperCase();
    }
    
    setHeader((h) => ({ ...h, [name]: processedValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    let processedValue = value;
    
    // For qty, ensure it's positive
    if (field === "qty") {
      if (value < 0) processedValue = "";
    }
    
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: processedValue } : it))
    );
    
    // Clear error for this item field
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: "" }));
    }
  };

  const addRow = () => {
    setItems((prev) => [...prev, { material_id: "", qty: "" }]);
  };

  const resetForm = () => {
    setEditingId(null);
    setHeader({
      rfq_type: "",
      rfq_date: "",
      question_deadline: "",
      purchase_org: "",
      delivery_date: "",
      material_group: "",
      plant: "",
      storage_location: "",
      vendor_id: "",
      supplying_plant: "",
      reference_pr_id: ""
    });
    setItems([{ material_id: "", qty: "" }]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate RFQ Type
    if (!header.rfq_type) {
      newErrors.rfq_type = "RFQ Type is required";
    } else {
      const specialCharError = validateNoSpecialChars(header.rfq_type, "RFQ Type");
      if (specialCharError) newErrors.rfq_type = specialCharError;
    }
    
    // Validate RFQ Date
    if (!header.rfq_date) {
      newErrors.rfq_date = "RFQ Date is required";
    } else {
      const pastDateError = validateNotPastDate(header.rfq_date, "RFQ Date");
      if (pastDateError) newErrors.rfq_date = pastDateError;
    }
    
    // Validate Question Deadline (must be >= RFQ Date)
    if (header.question_deadline) {
      const pastDateError = validateNotPastDate(header.question_deadline, "Question Deadline");
      if (pastDateError) {
        newErrors.question_deadline = pastDateError;
      } else if (header.rfq_date && header.question_deadline < header.rfq_date) {
        newErrors.question_deadline = "Question Deadline cannot be before RFQ Date";
      }
    }
    
    // Validate Delivery Date (must be >= RFQ Date)
    if (header.delivery_date) {
      const pastDateError = validateNotPastDate(header.delivery_date, "Delivery Date");
      if (pastDateError) {
        newErrors.delivery_date = pastDateError;
      } else if (header.rfq_date && header.delivery_date < header.rfq_date) {
        newErrors.delivery_date = "Delivery Date cannot be before RFQ Date";
      }
    }
    
    // Validate Purchase Org
    if (header.purchase_org) {
      const specialCharError = validateNoSpecialChars(header.purchase_org, "Purchase Organization");
      if (specialCharError) newErrors.purchase_org = specialCharError;
    }
    
    // Validate Material Group
    if (header.material_group) {
      const specialCharError = validateNoSpecialChars(header.material_group, "Material Group");
      if (specialCharError) newErrors.material_group = specialCharError;
    }
    
    // Validate Plant
    if (header.plant) {
      const specialCharError = validateNoSpecialChars(header.plant, "Plant");
      if (specialCharError) newErrors.plant = specialCharError;
    }
    
    // Validate Storage Location
    if (header.storage_location) {
      const specialCharError = validateNoSpecialChars(header.storage_location, "Storage Location");
      if (specialCharError) newErrors.storage_location = specialCharError;
    }
    
    // Validate Supplying Plant
    if (header.supplying_plant) {
      const specialCharError = validateNoSpecialChars(header.supplying_plant, "Supplying Plant");
      if (specialCharError) newErrors.supplying_plant = specialCharError;
    }
    
    // Validate Vendor selection
    if (!header.vendor_id) {
      newErrors.vendor_id = "Vendor is required";
    }
    
    // Validate Reference PR ID (must be in PR-001 format)
    if (header.reference_pr_id) {
      const prFormatError = validatePRFormat(header.reference_pr_id, "Reference Purchase Requisition");
      if (prFormatError) {
        newErrors.reference_pr_id = prFormatError;
      }
    }
    
    // Validate items
    let hasValidItem = false;
    items.forEach((item, idx) => {
      if (item.material_id && item.qty) {
        hasValidItem = true;
        
        // Validate quantity
        const qtyError = validateQuantity(item.qty);
        if (qtyError) {
          newErrors[`item_${idx}_qty`] = qtyError;
        }
      } else if (item.material_id || item.qty) {
        if (!item.material_id) {
          newErrors[`item_${idx}_material`] = "Please select material";
        }
        if (!item.qty) {
          newErrors[`item_${idx}_qty`] = "Quantity is required";
        }
      }
    });
    
    if (!hasValidItem) {
      newErrors.general = "At least one item with material and quantity is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting");
      return;
    }
    
    const payload = {
      header: {
        ...header,
        vendor_id: header.vendor_id ? Number(header.vendor_id) : null,
        reference_pr_id: header.reference_pr_id || null
      },
      items: items
        .filter((i) => i.material_id && i.qty)
        .map((i) => ({
          material_id: Number(i.material_id),
          qty: Number(i.qty)
        }))
    };

    try {
      if (editingId) {
        await rfqApi.update(editingId, payload);
        alert("RFQ Updated");
      } else {
        const res = await rfqApi.create(payload);
        alert(`RFQ Created : ${res.data.rfq_no}`);
      }

      resetForm();
      loadRFQs();
    } catch (err) {
      console.error(err);
      alert("Failed to save RFQ");
    }
  };

  const toInputDate = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

  const editRFQ = async (rfq) => {
    setEditingId(rfq.id);
    const res = await rfqApi.getById(rfq.id);
    const { header: h, items: its } = res.data;

    setHeader({
      rfq_type: h.rfq_type || "",
      rfq_date: toInputDate(h.rfq_date),
      question_deadline: toInputDate(h.question_deadline),
      purchase_org: h.purchase_org || "",
      delivery_date: toInputDate(h.delivery_date),
      material_group: h.material_group || "",
      plant: h.plant || "",
      storage_location: h.storage_location || "",
      vendor_id: h.vendor_id ? String(h.vendor_id) : "",
      supplying_plant: h.supplying_plant || "",
      reference_pr_id: h.reference_pr_id || ""
    });

    setItems(
      (its || []).map((it) => ({
        material_id: String(it.material_id),
        qty: String(it.qty)
      }))
    );
    setErrors({});
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const deleteRFQ = async (id) => {
    if (!window.confirm("Delete this RFQ?")) return;
    await rfqApi.deleteById(id);
    if (editingId === id) resetForm();
    loadRFQs();
  };

  const filteredRFQs = rfqs.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.rfq_no?.toLowerCase().includes(term) ||
      r.rfq_type?.toLowerCase().includes(term)
    );
  });

  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? styles.inputError : styles.input;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Request for Quotation</h2>

      <form onSubmit={handleSubmit}>
        {/* Row 1: RFQ No, RFQ Type, Purchase Org */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>RFQ No</label>
            <input
              style={styles.input}
              value={editingId ? "(Editing existing RFQ)" : "Auto Generated"}
              disabled
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>RFQ Type *</label>
            <input
              style={getInputStyle("rfq_type")}
              name="rfq_type"
              value={header.rfq_type}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers, spaces and hyphens only"
              required
            />
            {errors.rfq_type && <div style={styles.errorText}>{errors.rfq_type}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Purchase Organization</label>
            <input
              style={getInputStyle("purchase_org")}
              name="purchase_org"
              value={header.purchase_org}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers, spaces and hyphens only"
            />
            {errors.purchase_org && <div style={styles.errorText}>{errors.purchase_org}</div>}
          </div>
        </div>

        {/* Row 2: RFQ Date, Question Deadline, Delivery Date */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>RFQ Date *</label>
            <input
              style={getInputStyle("rfq_date")}
              type="date"
              name="rfq_date"
              value={header.rfq_date}
              onChange={handleHeaderChange}
              min={getTodayDate()}
              required
            />
            {errors.rfq_date && <div style={styles.errorText}>{errors.rfq_date}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Question Deadline</label>
            <input
              style={getInputStyle("question_deadline")}
              type="date"
              name="question_deadline"
              value={header.question_deadline}
              onChange={handleHeaderChange}
              min={getTodayDate()}
            />
            {errors.question_deadline && <div style={styles.errorText}>{errors.question_deadline}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Delivery Date</label>
            <input
              style={getInputStyle("delivery_date")}
              type="date"
              name="delivery_date"
              value={header.delivery_date}
              onChange={handleHeaderChange}
              min={getTodayDate()}
            />
            {errors.delivery_date && <div style={styles.errorText}>{errors.delivery_date}</div>}
          </div>
        </div>

        {/* Row 3: Material Group, Plant, Storage Location */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Material Group</label>
            <input
              style={getInputStyle("material_group")}
              name="material_group"
              value={header.material_group}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers, spaces and hyphens only"
            />
            {errors.material_group && <div style={styles.errorText}>{errors.material_group}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Plant</label>
            <input
              style={getInputStyle("plant")}
              name="plant"
              value={header.plant}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers, spaces and hyphens only"
            />
            {errors.plant && <div style={styles.errorText}>{errors.plant}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Storage Location</label>
            <input
              style={getInputStyle("storage_location")}
              name="storage_location"
              value={header.storage_location}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers, spaces and hyphens only"
            />
            {errors.storage_location && <div style={styles.errorText}>{errors.storage_location}</div>}
          </div>
        </div>

        {/* Row 4: Supplying Plant, Vendor, Reference PR */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Supplying Plant</label>
            <input
              style={getInputStyle("supplying_plant")}
              name="supplying_plant"
              value={header.supplying_plant}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers, spaces and hyphens only"
            />
            {errors.supplying_plant && <div style={styles.errorText}>{errors.supplying_plant}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Vendor *</label>
            <select
              style={getInputStyle("vendor_id")}
              name="vendor_id"
              value={header.vendor_id}
              onChange={handleHeaderChange}
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {errors.vendor_id && <div style={styles.errorText}>{errors.vendor_id}</div>}
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Reference Purchase Requisition</label>
            <input
              style={getInputStyle("reference_pr_id")}
              name="reference_pr_id"
              value={header.reference_pr_id}
              onChange={handleHeaderChange}
              placeholder="Format: PR-001, PO-123, RFQ-4567"
            />
            {errors.reference_pr_id && <div style={styles.errorText}>{errors.reference_pr_id}</div>}
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
              Example: PR-001, PO-123, RFQ-4567
            </div>
          </div>
        </div>

        <h4 style={styles.sectionTitle}>Materials (Material & Qty) *</h4>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Material</th>
                <th style={styles.th}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>
                    <select
                      style={errors[`item_${idx}_material`] ? styles.inputError : styles.input}
                      value={it.material_id}
                      onChange={(e) => handleItemChange(idx, "material_id", e.target.value)}
                    >
                      <option value="">Select Material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    {errors[`item_${idx}_material`] && (
                      <div style={styles.errorText}>{errors[`item_${idx}_material`]}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <input
                      style={errors[`item_${idx}_qty`] ? styles.inputError : styles.input}
                      type="number"
                      step="1"
                      min="1"
                      value={it.qty}
                      onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                      placeholder=" 0"
                    />
                    {errors[`item_${idx}_qty`] && (
                      <div style={styles.errorText}>{errors[`item_${idx}_qty`]}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {errors.general && (
          <div style={{ ...styles.errorText, marginTop: "10px" }}>{errors.general}</div>
        )}

        <button
          type="button"
          style={{ ...styles.button, ...styles.addBtn }}
          onClick={addRow}
        >
          Add Row
        </button>

        <button
          type="submit"
          style={{ ...styles.button, ...styles.saveBtn }}
        >
          {editingId ? "Update RFQ" : "Save RFQ"}
        </button>

        {editingId && (
          <button
            type="button"
            style={{ ...styles.button, ...styles.cancelBtn }}
            onClick={handleCancelEdit}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h3 style={{ marginTop: "30px" }}>Existing RFQs</h3>

      <input
        style={styles.searchBox}
        placeholder="Search by RFQ No / Type"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>RFQ No</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>RFQ Date</th>
              <th style={styles.th}>Question Deadline</th>
              <th style={styles.th}>Purchase Org</th>
              <th style={styles.th}>Delivery Date</th>
              <th style={styles.th}>Plant</th>
              <th style={styles.th}>Vendor</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRFQs.map((r) => (
              <tr key={r.id}>
                <td style={styles.td}>{r.rfq_no}</td>
                <td style={styles.td}>{r.rfq_type}</td>
                <td style={styles.td}>{toInputDate(r.rfq_date)}</td>
                <td style={styles.td}>{toInputDate(r.question_deadline)}</td>
                <td style={styles.td}>{r.purchase_org}</td>
                <td style={styles.td}>{toInputDate(r.delivery_date)}</td>
                <td style={styles.td}>{r.plant}</td>
                <td style={styles.td}>
                  {vendors.find(v => v.id === r.vendor_id)?.name || r.vendor_id}
                </td>
                <td style={styles.td}>{r.total_qty}</td>
                <td style={styles.td}>{r.item_count}</td>
                <td style={styles.td}>
                  <button
                    type="button"
                    style={styles.editBtn}
                    onClick={() => editRFQ(r)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => deleteRFQ(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredRFQs.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={11}>
                  No RFQs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}