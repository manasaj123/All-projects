// src/pages/MasterInspectionPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

// helper to build inspection number from DB id
const formatInspectionNo = id =>
  id ? `INSP-${String(id).padStart(4, "0")}` : "";

export default function MasterInspectionPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [form, setForm] = useState({
    plant: "",
    inspectionName: "",
    validFrom: "",
    validTo: "",
    status: "RELEASED",
    lowerSpecLimit: "",
    targetValue: "",
    upperSpecLimit: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [errors, setErrors] = useState({});

  const loadData = async () => {
    const [activeRes, binRes] = await Promise.all([
      axios.get(`${BASE_URL}/master-inspections`),
      axios.get(`${BASE_URL}/master-inspections/recycle-bin`)
    ]);
    setItems(activeRes.data || []);
    setBinItems(binRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;

    let newValue = value;

    // Force uppercase & treat as code for Inspection Name: INS-0002 style
    if (name === "inspectionName") {
      newValue = value.toUpperCase();
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
    // Clear field error on change
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Regex rules
    const plantRegex = /^[A-Za-z0-9-_]+$/;      // no spaces, only A-Z 0-9 - _
    const inspectionCodeRegex = /^[A-Z]{3}-\d{3}$/; // INS-0002 (3 letters, -, 3 digits)

    // Inspection Name as code like INS-0002
    if (!form.inspectionName.trim()) {
      newErrors.inspectionName = "Inspection code is required";
    } else if (!inspectionCodeRegex.test(form.inspectionName.trim())) {
      newErrors.inspectionName =
        "Format must be AAA-000 (e.g. INS-002)";
    }

    // Plant checks
    if (!form.plant.trim()) {
      newErrors.plant = "Plant is required";
    } else if (!plantRegex.test(form.plant.trim())) {
      newErrors.plant =
        "Plant can contain only letters, numbers, - and _ (no spaces or other symbols)";
    }

    if (!form.validFrom) {
      newErrors.validFrom = "Valid From is required";
    }

    // Date range check: validTo should be empty or >= validFrom
    if (form.validFrom && form.validTo) {
      const from = new Date(form.validFrom);
      const to = new Date(form.validTo);
      if (to < from) {
        newErrors.validTo = "Valid To cannot be before Valid From";
      }
    }

    // Numeric checks
      // Numeric checks (no negatives)
  const numFields = ["lowerSpecLimit", "upperSpecLimit", "targetValue"];
  numFields.forEach(field => {
    const value = form[field];
    if (value !== "" && isNaN(Number(value))) {
      newErrors[field] = "Must be a number";
    } else if (value !== "" && Number(value) < 0) {
      newErrors[field] = "Cannot be negative";
    }
  });

    // Logical relationship LSL <= Target <= USL (only if all present and numeric)
    const lsl = form.lowerSpecLimit === "" ? null : Number(form.lowerSpecLimit);
    const usl = form.upperSpecLimit === "" ? null : Number(form.upperSpecLimit);
    const tgt = form.targetValue === "" ? null : Number(form.targetValue);

    if (lsl !== null && usl !== null && lsl > usl) {
      newErrors.upperSpecLimit = "USL must be greater than or equal to LSL";
    }

    if (lsl !== null && tgt !== null && tgt < lsl) {
      newErrors.targetValue = "Target must be greater than or equal to LSL";
    }

    if (usl !== null && tgt !== null && tgt > usl) {
      newErrors.targetValue = "Target must be less than or equal to USL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    if (editingId) {
      await axios.put(`${BASE_URL}/master-inspections/${editingId}`, form);
    } else {
      await axios.post(`${BASE_URL}/master-inspections`, form);
    }

    setForm({
      plant: "",
      inspectionName: "",
      validFrom: "",
      validTo: "",
      status: "RELEASED",
      lowerSpecLimit: "",
      targetValue: "",
      upperSpecLimit: ""
    });
    setEditingId(null);
    setErrors({});
    await loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      plant: item.plant || "",
      inspectionName: (item.inspectionName || "").toUpperCase(),
      validFrom: item.validFrom || "",
      validTo: item.validTo || "",
      status: item.status || "RELEASED",
      lowerSpecLimit: item.lowerSpecLimit ?? "",
      targetValue: item.targetValue ?? "",
      upperSpecLimit: item.upperSpecLimit ?? ""
    });
    setErrors({});
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/master-inspections/${id}`);
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/master-inspections/${id}/restore`);
    await loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(
      `${BASE_URL}/master-inspections/${id}/hard-delete`
    );
    await loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />

      <div className="qc-master-content">
        <Header title="Master Inspection" />

        <div className="qc-master-body">
          <div className="qc-master-form-card">
            <h3>
              {editingId
                ? "Edit Master Inspection"
                : "Create Master Inspection"}
            </h3>
            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Inspection Code</label>
                <input
                  name="inspectionName"
                  value={form.inspectionName}
                  onChange={handleChange}
                  placeholder="INS-0002"
                  required
                />
                {errors.inspectionName && (
                  <span className="error-text">
                    {errors.inspectionName}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>Plant</label>
                <input
                  name="plant"
                  value={form.plant}
                  onChange={handleChange}
                  required
                />
                {errors.plant && (
                  <span className="error-text">{errors.plant}</span>
                )}
              </div>

              <div className="form-row">
                <label>Valid From</label>
                <input
                  type="date"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={handleChange}
                  required
                />
                {errors.validFrom && (
                  <span className="error-text">
                    {errors.validFrom}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>Valid To</label>
                <input
                  type="date"
                  name="validTo"
                  value={form.validTo}
                  onChange={handleChange}
                />
                {errors.validTo && (
                  <span className="error-text">{errors.validTo}</span>
                )}
              </div>

              <div className="form-row">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="RELEASED">RELEASED</option>
                  <option value="COMPLAINT">COMPLAINT</option>
                </select>
              </div>

              <div className="form-row">
                <label>Lower Spec Limit</label>
                <input
                  type="number"
                  name="lowerSpecLimit"
                  value={form.lowerSpecLimit}
                  onChange={handleChange}
                />
                {errors.lowerSpecLimit && (
                  <span className="error-text">
                    {errors.lowerSpecLimit}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>Upper Spec Limit</label>
                <input
                  type="number"
                  name="upperSpecLimit"
                  value={form.upperSpecLimit}
                  onChange={handleChange}
                />
                {errors.upperSpecLimit && (
                  <span className="error-text">
                    {errors.upperSpecLimit}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>Target Value</label>
                <input
                  type="number"
                  name="targetValue"
                  value={form.targetValue}
                  onChange={handleChange}
                />
                {errors.targetValue && (
                  <span className="error-text">
                    {errors.targetValue}
                  </span>
                )}
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>
                {showRecycleBin
                  ? "Recycle Bin"
                  : "Master Inspection List"}
              </h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Inspection No</th>
                  <th>Plant</th>
                  <th>Inspection Code</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th>Status</th>
                  <th>LSL</th>
                  <th>USL</th>
                  <th>Target</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    <td>{formatInspectionNo(item.id)}</td>
                    <td>{item.plant}</td>
                    <td>{(item.inspectionName || "").toUpperCase()}</td>
                    <td>{item.validFrom}</td>
                    <td>{item.validTo}</td>
                    <td>{item.status}</td>
                    <td>{item.lowerSpecLimit}</td>
                    <td>{item.upperSpecLimit}</td>
                    <td>{item.targetValue}</td>
                    <td>
                      {!showRecycleBin && (
                        <>
                          <button
                            className="action-edit"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-delete"
                            onClick={() => handleSoftDelete(item.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {showRecycleBin && (
                        <>
                          <button
                            className="action-restore"
                            onClick={() => handleRestore(item.id)}
                          >
                            Restore
                          </button>
                          <button
                            className="action-hard-delete"
                            onClick={() => handleHardDelete(item.id)}
                          >
                            Delete Permanently
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center" }}>
                      No records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}