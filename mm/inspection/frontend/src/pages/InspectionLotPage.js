// mm/inspection/frontend/src/pages/InspectionLotPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api"; // inspection backend

export default function InspectionLotPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    selectionProfile: "",
    lotCreatedFrom: "",
    lotCreatedTo: "",
    inspStartFrom: "",
    inspStartTo: "",
    inspectionEndFrom: "",
    inspectionEndTo: "",
    plant: "",
    lotOrigin: "",
    material: "",
    batch: "",
    vendor: "",
    manufacturer: "",
    customer: "",
    materialClass: "",
    maxHits: ""
  });

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/inspection-lots`),
        axios.get(`${BASE_URL}/inspection-lots/recycle-bin`)
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
      selectionProfile: form.selectionProfile || null,
      lotCreatedFrom: form.lotCreatedFrom || null,
      lotCreatedTo: form.lotCreatedTo || null,
      inspStartFrom: form.inspStartFrom || null,
      inspStartTo: form.inspStartTo || null,
      inspectionEndFrom: form.inspectionEndFrom || null,
      inspectionEndTo: form.inspectionEndTo || null,
      plant: form.plant || null,
      lotOrigin: form.lotOrigin || null,
      material: form.material || null,
      batch: form.batch || null,
      vendor: form.vendor || null,
      manufacturer: form.manufacturer || null,
      customer: form.customer || null,
      materialClass: form.materialClass || null,
      maxHits: form.maxHits ? Number(form.maxHits) : null
    };

    if (editingId) {
      await axios.put(`${BASE_URL}/inspection-lots/${editingId}`, payload);
    } else {
      await axios.post(`${BASE_URL}/inspection-lots`, payload);
    }

    setForm({
      selectionProfile: "",
      lotCreatedFrom: "",
      lotCreatedTo: "",
      inspStartFrom: "",
      inspStartTo: "",
      inspectionEndFrom: "",
      inspectionEndTo: "",
      plant: "",
      lotOrigin: "",
      material: "",
      batch: "",
      vendor: "",
      manufacturer: "",
      customer: "",
      materialClass: "",
      maxHits: ""
    });
    setEditingId(null);
    loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      selectionProfile: item.selectionProfile || "",
      lotCreatedFrom: item.lotCreatedFrom || "",
      lotCreatedTo: item.lotCreatedTo || "",
      inspStartFrom: item.inspStartFrom || "",
      inspStartTo: item.inspStartTo || "",
      inspectionEndFrom: item.inspectionEndFrom || "",
      inspectionEndTo: item.inspectionEndTo || "",
      plant: item.plant || "",
      lotOrigin: item.lotOrigin || "",
      material: item.material || "",
      batch: item.batch || "",
      vendor: item.vendor || "",
      manufacturer: item.manufacturer || "",
      customer: item.customer || "",
      materialClass: item.materialClass || "",
      maxHits: item.maxHits != null ? String(item.maxHits) : ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/inspection-lots/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/inspection-lots/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/inspection-lots/${id}/hard-delete`);
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Inspection Lot Selection" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>{editingId ? "Edit Inspection Lot" : "Create Listing Inspection Lot"}</h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Selection Profile</label>
                <input
                  name="selectionProfile"
                  value={form.selectionProfile}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Lot created on (From)</label>
                <input
                  type="date"
                  name="lotCreatedFrom"
                  value={form.lotCreatedFrom}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Lot created on (To)</label>
                <input
                  type="date"
                  name="lotCreatedTo"
                  value={form.lotCreatedTo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Insp. start date (From)</label>
                <input
                  type="date"
                  name="inspStartFrom"
                  value={form.inspStartFrom}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Insp. start date (To)</label>
                <input
                  type="date"
                  name="inspStartTo"
                  value={form.inspStartTo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>End of Inspection (From)</label>
                <input
                  type="date"
                  name="inspectionEndFrom"
                  value={form.inspectionEndFrom}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>End of Inspection (To)</label>
                <input
                  type="date"
                  name="inspectionEndTo"
                  value={form.inspectionEndTo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Plant</label>
                <input
                  name="plant"
                  value={form.plant}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Insp. lot origin</label>
                <input
                  name="lotOrigin"
                  value={form.lotOrigin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Material</label>
                <input
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Batch</label>
                <input
                  name="batch"
                  value={form.batch}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Vendor</label>
                <input
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Manufacturer</label>
                <input
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Customer</label>
                <input
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Material class</label>
                <input
                  name="materialClass"
                  value={form.materialClass}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Maximum No. of Hits</label>
                <input
                  name="maxHits"
                  type="number"
                  value={form.maxHits}
                  onChange={handleChange}
                  min="0"
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
              <h3>{showRecycleBin ? "Recycle Bin" : "Inspection Lot List"}</h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Selection Profile</th>
                  <th>Plant</th>
                  <th>Material</th>
                  <th>Vendor</th>
                  <th>Customer</th>
                  <th>Max Hits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.selectionProfile}</td>
                    <td>{item.plant}</td>
                    <td>{item.material}</td>
                    <td>{item.vendor}</td>
                    <td>{item.customer}</td>
                    <td>{item.maxHits}</td>
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
