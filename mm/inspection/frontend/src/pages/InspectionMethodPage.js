// src/pages/InspectionMethodPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

// helper to build inspection method number from DB id
const formatInspectionMethodNo = id =>
  id ? `IM-${String(id).padStart(4, "0")}` : "";

export default function InspectionMethodPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [masterInspections, setMasterInspections] = useState([]);
  const [form, setForm] = useState({
    masterInspectionId: "",
    inspectionName: "",
    status: "NOT_RELEASED"
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const loadData = async () => {
    try {
      const [activeRes, binRes, masterRes] = await Promise.all([
        axios.get(`${BASE_URL}/inspection-methods`),
        axios.get(`${BASE_URL}/inspection-methods/recycle-bin`),
        axios.get(`${BASE_URL}/master-inspections`)
      ]);

      setItems(activeRes.data || []);
      setBinItems(binRes.data || []);
      setMasterInspections(masterRes.data || []);
    } catch (err) {
      console.error("loadData error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Master inspection required
    if (!form.masterInspectionId) {
      newErrors.masterInspectionId = "Master Inspection is required";
    }

    // Method name: letters, numbers, spaces, and - _ / ( )
    const methodNameRegex = /^[A-Za-z0-9\s\-_/()]+$/;

    if (!form.inspectionName.trim()) {
      newErrors.inspectionName = "Inspection Method Name is required";
    } else if (!methodNameRegex.test(form.inspectionName.trim())) {
      newErrors.inspectionName =
        "Method name can contain letters, numbers, spaces, and - _ / ( )";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    const payload = {
      masterInspectionId: form.masterInspectionId,
      inspectionName: form.inspectionName,
      status: form.status
    };

    if (editingId) {
      await axios.put(
        `${BASE_URL}/inspection-methods/${editingId}`,
        payload
      );
    } else {
      await axios.post(`${BASE_URL}/inspection-methods`, payload);
    }

    setForm({
      masterInspectionId: "",
      inspectionName: "",
      status: "NOT_RELEASED"
    });
    setEditingId(null);
    await loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      masterInspectionId:
        item.masterInspectionId || item.master_inspection_id || "",
      inspectionName: item.inspectionName || item.inspection_name || "",
      status: item.status
    });
    setErrors({});
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/inspection-methods/${id}`);
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/inspection-methods/${id}/restore`);
    await loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(
      `${BASE_URL}/inspection-methods/${id}/hard-delete`
    );
    await loadData();
  };

  const list = showRecycleBin ? binItems : items;

  // helper to show master inspection name for a method row
  const getMasterInspectionName = miId => {
    const mi = masterInspections.find(m => m.id === miId);
    return mi ? mi.inspectionName : "";
  };

  return (
    <div className="qc-master-page">
      <Sidebar />

      <div className="qc-master-content">
        <Header title="Inspection Method" />

        <div className="qc-master-body">
          {/* FORM CARD */}
          <div className="qc-master-form-card">
            <h3>
              {editingId
                ? "Edit Inspection Method"
                : "Create Inspection Method"}
            </h3>
            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Master Inspection Name</label>
                <select
                  name="masterInspectionId"
                  value={form.masterInspectionId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  {masterInspections.map(mi => (
                    <option key={mi.id} value={mi.id}>
                      {mi.inspectionName}
                    </option>
                  ))}
                </select>
                {errors.masterInspectionId && (
                  <span className="error-text">
                    {errors.masterInspectionId}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>Inspection Method Name</label>
                <input
                  name="inspectionName"
                  value={form.inspectionName}
                  onChange={handleChange}
                  required
                />
                {errors.inspectionName && (
                  <span className="error-text">
                    {errors.inspectionName}
                  </span>
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
                  <option value="NOT_RELEASED">NOT_RELEASED</option>
                  <option value="PROCESS">PROCESS</option>
                </select>
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* LIST + RECYCLE BIN */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>
                {showRecycleBin
                  ? "Inspection Method - Recycle Bin"
                  : "Inspection Method List"}
              </h3>

              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Method No</th>
                  <th>Master Inspection Name</th>
                  <th>Inspection Method Name</th>
                  {!showRecycleBin && <th>Status</th>}
                  {showRecycleBin && <th>Deleted At</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    <td>{formatInspectionMethodNo(item.id)}</td>
                    <td>
                      {getMasterInspectionName(
                        item.masterInspectionId ||
                          item.master_inspection_id
                      )}
                    </td>
                    <td>
                      {item.inspection_name || item.inspectionName}
                    </td>

                    {!showRecycleBin && <td>{item.status}</td>}
                    {showRecycleBin && (
                      <td>
                        {item.deleted_at || item.deletedAt || "-"}
                      </td>
                    )}

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
                    <td
                      colSpan={showRecycleBin ? 6 : 6}
                      style={{ textAlign: "center" }}
                    >
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