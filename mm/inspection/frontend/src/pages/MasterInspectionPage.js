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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (editingId) {
      await axios.put(
        `${BASE_URL}/master-inspections/${editingId}`,
        form
      );
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
    await loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      plant: item.plant,
      inspectionName: item.inspectionName,
      validFrom: item.validFrom,
      validTo: item.validTo,
      status: item.status,
      lowerSpecLimit: item.lowerSpecLimit,
      targetValue: item.targetValue,
      upperSpecLimit: item.upperSpecLimit
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/master-inspections/${id}`);
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(
      `${BASE_URL}/master-inspections/${id}/restore`
    );
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
                <label>Inspection Name</label>
                <input
                  name="inspectionName"
                  value={form.inspectionName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <label>Plant</label>
                <input
                  name="plant"
                  value={form.plant}
                  onChange={handleChange}
                  required
                />
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
              </div>

              <div className="form-row">
                <label>Valid To</label>
                <input
                  type="date"
                  name="validTo"
                  value={form.validTo}
                  onChange={handleChange}
                />
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
              </div>

              <div className="form-row">
                <label>Upper Spec Limit</label>
                <input
                  type="number"
                  name="upperSpecLimit"
                  value={form.upperSpecLimit}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Target Value</label>
                <input
                  type="number"
                  name="targetValue"
                  value={form.targetValue}
                  onChange={handleChange}
                />
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
                  <th>Inspection</th>
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
                    <td>{item.inspectionName}</td>
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
