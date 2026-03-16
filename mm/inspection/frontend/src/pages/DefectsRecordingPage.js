// mm/inspection/frontend/src/pages/DefectsRecordingPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function DefectsRecordingPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    defectType: "CUSTOMER",   // CUSTOMER / VENDOR / INTERNAL
    title: "",
    description: "",
    materialCode: "",
    lotOrOrderNo: "",
    reporter: "",
    priority: "MEDIUM"        // LOW / MEDIUM / HIGH
  });

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/defects`),
        axios.get(`${BASE_URL}/defects/recycle-bin`)
      ]);
      setItems(active.data || []);
      setBinItems(bin.data || []);
    } catch (err) {
      console.error("Load Error:", err);
    }
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

    const payload = {
      defectType: form.defectType || "INTERNAL",
      title: form.title || "",
      description: form.description || null,
      materialCode: form.materialCode || null,
      lotOrOrderNo: form.lotOrOrderNo || null,
      reporter: form.reporter || null,
      priority: form.priority || "MEDIUM"
    };

    if (editingId) {
      await axios.put(`${BASE_URL}/defects/${editingId}`, payload);
    } else {
      await axios.post(`${BASE_URL}/defects`, payload);
    }

    setForm({
      defectType: "CUSTOMER",
      title: "",
      description: "",
      materialCode: "",
      lotOrOrderNo: "",
      reporter: "",
      priority: "MEDIUM"
    });
    setEditingId(null);
    loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      defectType: item.defectType || "CUSTOMER",
      title: item.title || "",
      description: item.description || "",
      materialCode: item.materialCode || "",
      lotOrOrderNo: item.lotOrOrderNo || "",
      reporter: item.reporter || "",
      priority: item.priority || "MEDIUM"
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/defects/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/defects/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/defects/${id}/hard-delete`);
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Defects Recording" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>{editingId ? "Edit Defect" : "Record Defect"}</h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Defect Type</label>
                <select
                  name="defectType"
                  value={form.defectType}
                  onChange={handleChange}
                >
                  <option value="CUSTOMER">
                    Customer complaint (delivered to customer)
                  </option>
                  <option value="VENDOR">
                    Vendor complaint (goods from supplier)
                  </option>
                  <option value="INTERNAL">
                    Internal defect (in‑process inspection)
                  </option>
                </select>
              </div>

              <div className="form-row">
                <label>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Short defect title"
                />
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the defect"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <label>Material Code</label>
                <input
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                  placeholder="Optional material code"
                />
              </div>

              <div className="form-row">
                <label>Lot / Order No.</label>
                <input
                  name="lotOrOrderNo"
                  value={form.lotOrOrderNo}
                  onChange={handleChange}
                  placeholder="Inspection lot or order number"
                />
              </div>

              <div className="form-row">
                <label>Reporter</label>
                <input
                  name="reporter"
                  value={form.reporter}
                  onChange={handleChange}
                  placeholder="Who reported the defect"
                />
              </div>

              <div className="form-row">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>

          {/* List card */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>{showRecycleBin ? "Recycle Bin" : "Defects List"}</h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Material</th>
                  <th>Lot/Order</th>
                  <th>Priority</th>
                  <th>Reporter</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.defectType}</td>
                    <td>{item.title}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.lotOrOrderNo}</td>
                    <td>{item.priority}</td>
                    <td>{item.reporter}</td>
                    <td>
                      {!showRecycleBin ? (
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
                      ) : (
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
                    <td colSpan={8} style={{ textAlign: "center" }}>
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
