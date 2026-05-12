import React, { useEffect, useState } from "react";
import prApi from "../api/prApi";
import materialApi from "../api/materialApi";

export default function PRPage() {
  /* ---------------- INTERNAL CSS ---------------- */

  const styles = {
    container: {
      maxWidth: "950px",
      margin: "5px auto",
      padding: "10px",
      background: "#f4f6f9",
      borderRadius: "10px",
      fontFamily: "Arial"
    },
    title: {
      textAlign: "center",
      marginBottom: "10px"
    },
    formGroup: {
      marginBottom: "15px"
    },
    formRow: {
      display: "flex",
      gap: "16px",
      marginBottom: "10px",
      flexWrap: "wrap"
    },
    formCol: {
      flex: 1,
      minWidth: "220px"
    },
    label: {
      fontWeight: "bold",
      display: "block",
      marginBottom: "5px"
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
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "15px",
      background: "white"
    },
    th: {
      background: "#2563eb",
      color: "white",
      padding: "8px",
      border: "1px solid #ddd"
    },
    td: {
      padding: "6px",
      border: "1px solid #ddd"
    },
    button: {
      padding: "10px 15px",
      marginTop: "15px",
      marginRight: "10px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    },
    addBtn: {
      background: "#2563eb",
      color: "white"
    },
    saveBtn: {
      background: "#16a34a",
      color: "white"
    },
    editBtn: {
      background: "#0b61f5",
      color: "white",
      padding: "4px 8px",
      marginRight: "4px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer"
    },
    deleteBtn: {
      background: "#dc2626",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer"
    },
    searchBox: {
      padding: "7px",
      width: "250px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "10px"
    }
  };

  /* ---------------- STATE ---------------- */

  const [materials, setMaterials] = useState([]);
  const [prs, setPRs] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [header, setHeader] = useState({
    req_date: "",
    requester: "",
    uom: "",
    batch: "",
    plant: "",
    purchase_org: ""
  });

  const [items, setItems] = useState([
    { material_id: "", qty: "", required_date: "", remarks: "" }
  ]);

  /* ---------------- LOAD DATA ---------------- */

  const loadPRs = async () => {
    const res = await prApi.getAll();
    setPRs(res.data);
  };

  const loadMaterials = async () => {
    const res = await materialApi.getAll();
    setMaterials(res.data);
  };

  useEffect(() => {
    loadPRs();
    loadMaterials();
  }, []);

  /* ---------------- VALIDATION FUNCTIONS ---------------- */

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validate no special characters (only letters, numbers, spaces)
  const validateNoSpecialChars = (value, fieldName) => {
    if (!value) return "";
    const regex = /^[A-Za-z0-9\s]+$/;
    if (!regex.test(value)) {
      return `${fieldName} should only contain letters, numbers and spaces (no special characters)`;
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
    if (!qty) return "";
    const num = Number(qty);
    if (isNaN(num)) return "Quantity must be a number";
    if (num <= 0) return "Quantity must be greater than 0";
    return "";
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Remove special characters from text fields
    if (name === "requester" || name === "batch" || name === "plant" || name === "purchase_org") {
      processedValue = value.replace(/[^A-Za-z0-9\s]/g, '');
    }
    
    setHeader((h) => ({ ...h, [name]: processedValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    let processedValue = value;
    
    // For remarks, remove special characters
    if (field === "remarks") {
      processedValue = value.replace(/[^A-Za-z0-9\s]/g, '');
    }
    
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
    setItems((prev) => [
      ...prev,
      { material_id: "", qty: "", required_date: "", remarks: "" }
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setHeader({
      req_date: "",
      requester: "",
      uom: "",
      batch: "",
      plant: "",
      purchase_org: ""
    });
    setItems([{ material_id: "", qty: "", required_date: "", remarks: "" }]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate header fields
    if (!header.req_date) {
      newErrors.req_date = "Req Date is required";
    } else {
      const pastDateError = validateNotPastDate(header.req_date, "Req Date");
      if (pastDateError) newErrors.req_date = pastDateError;
    }
    
    if (header.requester) {
      const specialCharError = validateNoSpecialChars(header.requester, "Requestor");
      if (specialCharError) newErrors.requester = specialCharError;
    }
    
    if (header.batch) {
      const specialCharError = validateNoSpecialChars(header.batch, "Batch");
      if (specialCharError) newErrors.batch = specialCharError;
    }
    
    if (header.plant) {
      const specialCharError = validateNoSpecialChars(header.plant, "Plant");
      if (specialCharError) newErrors.plant = specialCharError;
    }
    
    if (header.purchase_org) {
      const specialCharError = validateNoSpecialChars(header.purchase_org, "Purchase Organization");
      if (specialCharError) newErrors.purchase_org = specialCharError;
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
        
        // Validate required date is not past
        if (item.required_date) {
          const pastDateError = validateNotPastDate(item.required_date, "Required Date");
          if (pastDateError) {
            newErrors[`item_${idx}_required_date`] = pastDateError;
          }
        }
        
        // Validate remarks for special characters
        if (item.remarks) {
          const specialCharError = validateNoSpecialChars(item.remarks, "Remarks");
          if (specialCharError) {
            newErrors[`item_${idx}_remarks`] = specialCharError;
          }
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
      header,
      items: items
        .filter((i) => i.material_id && i.qty)
        .map((i) => ({
          ...i,
          qty: Number(i.qty)
        }))
    };

    try {
      if (editingId) {
        await prApi.update(editingId, payload);
        alert("PR Updated");
      } else {
        const res = await prApi.create(payload);
        alert(`PR Created : ${res.data.req_no}`);
      }

      resetForm();
      loadPRs();
    } catch (err) {
      console.error(err);
      alert("Failed to save PR");
    }
  };

  const editPR = async (pr) => {
    setEditingId(pr.id);
    try {
      const res = await prApi.getById(pr.id);
      const { header: h, items: its } = res.data;

      setHeader({
        req_date: h.req_date ? h.req_date.split('T')[0] : "",
        requester: h.requester || "",
        uom: h.uom || "",
        batch: h.batch || "",
        plant: h.plant || "",
        purchase_org: h.purchase_org || ""
      });

      setItems(
        (its || []).map((it) => ({
          material_id: String(it.material_id),
          qty: String(it.qty),
          required_date: it.required_date || "",
          remarks: it.remarks || ""
        }))
      );
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const deletePR = async (id) => {
    if (!window.confirm("Delete this PR?")) return;
    await prApi.deleteById(id);
    if (editingId === id) resetForm();
    loadPRs();
  };

  const filteredPRs = prs.filter((pr) => {
    const term = search.toLowerCase();
    return (
      pr.req_no?.toLowerCase().includes(term) ||
      pr.requester?.toLowerCase().includes(term)
    );
  });

  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? styles.inputError : styles.input;
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Purchase Requisition</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Req No</label>
          <input
            style={styles.input}
            value={editingId ? "(Editing existing PR)" : "Auto Generated"}
            disabled
          />
        </div>

        {/* Row 1: Req Date + Requestor */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Req Date *</label>
            <input
              style={getInputStyle("req_date")}
              type="date"
              name="req_date"
              value={header.req_date}
              onChange={handleHeaderChange}
              min={getTodayDate()}
              required
            />
            {errors.req_date && <div style={styles.errorText}>{errors.req_date}</div>}
          </div>

          <div style={styles.formCol}>
            <label style={styles.label}>Requestor</label>
            <input
              style={getInputStyle("requester")}
              name="requester"
              value={header.requester}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers and spaces only"
            />
            {errors.requester && <div style={styles.errorText}>{errors.requester}</div>}
          </div>
        </div>

        {/* Row 2: UOM + Batch */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>UOM</label>
            <select
              style={styles.input}
              name="uom"
              value={header.uom}
              onChange={handleHeaderChange}
            >
              <option value="">Select UOM</option>
              <option value="KG">KG</option>
              <option value="LTR">LTR</option>
              <option value="PCS">PCS</option>
              <option value="BOXES">BOXES</option>
            </select>
          </div>

          <div style={styles.formCol}>
            <label style={styles.label}>Batch</label>
            <input
              style={getInputStyle("batch")}
              name="batch"
              value={header.batch}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers and spaces only"
            />
            {errors.batch && <div style={styles.errorText}>{errors.batch}</div>}
          </div>
        </div>

        {/* Row 3: Plant + Purchase Org */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Plant</label>
            <input
              style={getInputStyle("plant")}
              name="plant"
              value={header.plant}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers and spaces only"
            />
            {errors.plant && <div style={styles.errorText}>{errors.plant}</div>}
          </div>

          <div style={styles.formCol}>
            <label style={styles.label}>Purchase Organization</label>
            <input
              style={getInputStyle("purchase_org")}
              name="purchase_org"
              value={header.purchase_org}
              onChange={handleHeaderChange}
              placeholder="Letters, numbers and spaces only"
            />
            {errors.purchase_org && <div style={styles.errorText}>{errors.purchase_org}</div>}
          </div>
        </div>

        {/* -------- ITEMS TABLE -------- */}
        <h4>Items</h4>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "35%" }}>Material *</th>
              <th style={{ ...styles.th, width: "15%" }}>Qty *</th>
              <th style={{ ...styles.th, width: "25%" }}>Required Date</th>
              <th style={{ ...styles.th, width: "25%" }}>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td style={styles.td}>
                  <select
                    style={styles.input}
                    value={it.material_id}
                    onChange={(e) => {
                      const materialId = e.target.value;
                      const selectedMaterial = materials.find(
                        (m) => String(m.id) === materialId
                      );

                      setItems((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? {
                                ...row,
                                material_id: materialId,
                                qty:
                                  selectedMaterial &&
                                  selectedMaterial.qty != null
                                    ? String(selectedMaterial.qty)
                                    : ""
                              }
                            : row
                        )
                      );
                    }}
                  >
                    <option value="">Select Material</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td style={styles.td}>
                  <input
                    style={errors[`item_${idx}_qty`] ? styles.inputError : styles.input}
                    type="number"
                    step="1"
                    min="1"
                    value={it.qty}
                    onChange={(e) =>
                      handleItemChange(idx, "qty", e.target.value)
                    }
                    placeholder=" 0"
                  />
                  {errors[`item_${idx}_qty`] && (
                    <div style={styles.errorText}>{errors[`item_${idx}_qty`]}</div>
                  )}
                </td>

                <td style={styles.td}>
                  <input
                    style={errors[`item_${idx}_required_date`] ? styles.inputError : styles.input}
                    type="date"
                    value={it.required_date}
                    onChange={(e) =>
                      handleItemChange(idx, "required_date", e.target.value)
                    }
                    min={getTodayDate()}
                  />
                  {errors[`item_${idx}_required_date`] && (
                    <div style={styles.errorText}>{errors[`item_${idx}_required_date`]}</div>
                  )}
                </td>

                <td style={styles.td}>
                  <input
                    style={errors[`item_${idx}_remarks`] ? styles.inputError : styles.input}
                    value={it.remarks}
                    onChange={(e) =>
                      handleItemChange(idx, "remarks", e.target.value)
                    }
                    placeholder="Letters, numbers and spaces only"
                  />
                  {errors[`item_${idx}_remarks`] && (
                    <div style={styles.errorText}>{errors[`item_${idx}_remarks`]}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
          {editingId ? "Update PR" : "Save PR"}
        </button>
      </form>

      {/* -------- EXISTING PR TABLE -------- */}
      <h3 style={{ marginTop: "30px" }}>Existing PRs</h3>

      <input
        style={styles.searchBox}
        placeholder="Search by PR No / Requestor"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>PR No</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Requestor</th>
            <th style={styles.th}>UOM</th>
            <th style={styles.th}>Batch</th>
            <th style={styles.th}>Plant</th>
            <th style={styles.th}>Purchase Org</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Items</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredPRs.map((pr) => (
            <tr key={pr.id}>
              <td style={styles.td}>{pr.req_no}</td>
              <td style={styles.td}>{pr.req_date ? pr.req_date.split('T')[0] : ""}</td>
              <td style={styles.td}>{pr.requester}</td>
              <td style={styles.td}>{pr.uom}</td>
              <td style={styles.td}>{pr.batch}</td>
              <td style={styles.td}>{pr.plant}</td>
              <td style={styles.td}>{pr.purchase_org}</td>
              <td style={styles.td}>{pr.total_qty}</td>
              <td style={styles.td}>{pr.item_count}</td>
              <td style={styles.td}>
                <button
                  style={styles.editBtn}
                  type="button"
                  onClick={() => editPR(pr)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteBtn}
                  type="button"
                  onClick={() => deletePR(pr.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredPRs.length === 0 && (
            <tr>
              <td style={styles.td} colSpan={10}>
                No PRs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}