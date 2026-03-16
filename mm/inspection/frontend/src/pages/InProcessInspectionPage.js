// mm/inspection/frontend/src/pages/InProcessInspectionPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function InProcessInspectionPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    materialCode: "",
    productionPlant: "",
    planningPlant: "",
    orderType: "",
    orderNo: ""
  });

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/in-process-inspections`),
        axios.get(`${BASE_URL}/in-process-inspections/recycle-bin`)
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
      materialCode: form.materialCode || null,
      productionPlant: form.productionPlant || null,
      planningPlant: form.planningPlant || null,
      orderType: form.orderType || null,
      orderNo: form.orderNo || null
    };

    if (editingId) {
      await axios.put(`${BASE_URL}/in-process-inspections/${editingId}`, payload);
    } else {
      await axios.post(`${BASE_URL}/in-process-inspections`, payload);
    }

    setForm({
      materialCode: "",
      productionPlant: "",
      planningPlant: "",
      orderType: "",
      orderNo: ""
    });
    setEditingId(null);
    loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      materialCode: item.materialCode || "",
      productionPlant: item.productionPlant || "",
      planningPlant: item.planningPlant || "",
      orderType: item.orderType || "",
      orderNo: item.orderNo || ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/in-process-inspections/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/in-process-inspections/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/in-process-inspections/${id}/hard-delete`);
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="In-Process Inspection" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>{editingId ? "Edit In-Process Inspection" : "Create In-Process Inspection"}</h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Material code</label>
                <input
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                  placeholder="Enter material code"
                />
              </div>

              <div className="form-row">
                <label>Production plant</label>
                <input
                  name="productionPlant"
                  value={form.productionPlant}
                  onChange={handleChange}
                  placeholder="Enter production plant"
                />
              </div>

              <div className="form-row">
                <label>Planning plant</label>
                <input
                  name="planningPlant"
                  value={form.planningPlant}
                  onChange={handleChange}
                  placeholder="Enter planning plant"
                />
              </div>

              <div className="form-row">
                <label>Order type</label>
                <input
                  name="orderType"
                  value={form.orderType}
                  onChange={handleChange}
                  placeholder="Enter order type"
                />
              </div>

              <div className="form-row">
                <label>Order</label>
                <input
                  name="orderNo"
                  value={form.orderNo}
                  onChange={handleChange}
                  placeholder="Enter order number"
                />
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* List card */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>{showRecycleBin ? "Recycle Bin" : "In-Process Inspection List"}</h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Material code</th>
                  <th>Prod. plant</th>
                  <th>Planning plant</th>
                  <th>Order type</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.productionPlant}</td>
                    <td>{item.planningPlant}</td>
                    <td>{item.orderType}</td>
                    <td>{item.orderNo}</td>
                    <td>
                      {!showRecycleBin ? (
                        <>
                          <button className="action-edit" onClick={() => handleEdit(item)}>Edit</button>
                          <button className="action-delete" onClick={() => handleSoftDelete(item.id)}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button className="action-restore" onClick={() => handleRestore(item.id)}>Restore</button>
                          <button className="action-hard-delete" onClick={() => handleHardDelete(item.id)}>
                            Delete Permanently
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
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
