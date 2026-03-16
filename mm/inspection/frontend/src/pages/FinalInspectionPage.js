// mm/inspection/frontend/src/pages/FinalInspectionPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FinalInspectionPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const inProcessId = query.get("inProcessId");

  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    materialCode: "",
    productionPlant: "",
    orderType: "",
    orderQuantity: "",
    orderDate: "",
    planCode: ""
  });

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/final-inspections`),
        axios.get(`${BASE_URL}/final-inspections/recycle-bin`)
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

  // prefill from In-Process Inspection if id present
  useEffect(() => {
    const loadFromInProcess = async () => {
      if (!inProcessId) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/in-process-inspections/${inProcessId}`
        );
        setForm(prev => ({
          ...prev,
          materialCode: res.data.materialCode || "",
          productionPlant: res.data.productionPlant || ""
        }));
      } catch (err) {
        console.error("Load from In-Process error:", err);
      }
    };
    loadFromInProcess();
  }, [inProcessId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      materialCode: form.materialCode || null,
      productionPlant: form.productionPlant || null,
      orderType: form.orderType || null,
      orderQuantity: form.orderQuantity ? Number(form.orderQuantity) : null,
      orderDate: form.orderDate || null,
      planCode: form.planCode || null
    };

    if (editingId) {
      await axios.put(`${BASE_URL}/final-inspections/${editingId}`, payload);
    } else {
      await axios.post(`${BASE_URL}/final-inspections`, payload);
    }

    setForm({
      materialCode: "",
      productionPlant: "",
      orderType: "",
      orderQuantity: "",
      orderDate: "",
      planCode: ""
    });
    setEditingId(null);
    loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      materialCode: item.materialCode || "",
      productionPlant: item.productionPlant || "",
      orderType: item.orderType || "",
      orderQuantity:
        item.orderQuantity != null ? String(item.orderQuantity) : "",
      orderDate: item.orderDate ? item.orderDate.slice(0, 10) : "",
      planCode: item.planCode || ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/final-inspections/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/final-inspections/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/final-inspections/${id}/hard-delete`);
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Final Inspection - Production Order" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>{editingId ? "Edit Final Inspection" : "Create Final Inspection"}</h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Material Code</label>
                <input
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                  placeholder="Enter material code"
                />
              </div>

              <div className="form-row">
                <label>Production Plant</label>
                <input
                  name="productionPlant"
                  value={form.productionPlant}
                  onChange={handleChange}
                  placeholder="Enter production plant"
                />
              </div>

              <div className="form-row">
                <label>Production Order Type</label>
                <input
                  name="orderType"
                  value={form.orderType}
                  onChange={handleChange}
                  placeholder="Enter order type"
                />
              </div>

              <div className="form-row">
                <label>Production Order Quantity</label>
                <input
                  type="number"
                  step="0.001"
                  name="orderQuantity"
                  value={form.orderQuantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-row">
                <label>Current Date</label>
                <input
                  type="date"
                  name="orderDate"
                  value={form.orderDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Plan Code</label>
                <input
                  name="planCode"
                  value={form.planCode}
                  onChange={handleChange}
                  placeholder="Enter plan code"
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
              <h3>{showRecycleBin ? "Recycle Bin" : "Final Inspection List"}</h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Material Code</th>
                  <th>Production Plant</th>
                  <th>Order Type</th>
                  <th>Quantity</th>
                  <th>Order Date</th>
                  <th>Plan Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.productionPlant}</td>
                    <td>{item.orderType}</td>
                    <td>{item.orderQuantity}</td>
                    <td>{item.orderDate && item.orderDate.slice(0, 10)}</td>
                    <td>{item.planCode}</td>
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
