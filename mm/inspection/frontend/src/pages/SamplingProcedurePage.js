// mm/inspection/frontend/src/pages/SamplingProcedurePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const CREATION_BASE_URL = "http://localhost:5002/api"; // MM backend (vendors)
const BASE_URL = "http://localhost:5003/api";          // Inspection backend

const formatSamplingNo = id =>
  id ? `SP-${String(id).padStart(4, "0")}` : "";

export default function SamplingProcedurePage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [valuationModes, setValuationModes] = useState([]);
  const [form, setForm] = useState({
    procedureCode: "",
    description: "",
    samplingType: "FIXED_SAMPLE",
    valuationMode: "",
    inspectionPoints: "WITHOUT_POINTS",
    sampleSize: "",
    acceptanceNumber: "",
     multipleSamples: "NO_MULTIPLE_SAMPLES" 
  });
  const [editingId, setEditingId] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const loadData = async () => {
    try {
      const [activeRes, binRes, vendorsRes] = await Promise.all([
        axios.get(`${BASE_URL}/sampling-procedures`),
        axios.get(`${BASE_URL}/sampling-procedures/recycle-bin`),
        axios.get(`${CREATION_BASE_URL}/vendors`)
      ]);

      setItems(activeRes.data || []);
      setBinItems(binRes.data || []);

      const vendors = vendorsRes.data || [];
      setValuationModes(
        vendors.map(v => ({
          value: v.id,
          label: `${v.name} (${v.type})`
        }))
      );
    } catch (err) {
      console.error("SamplingProcedure loadData error:", err);
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
    if (!form.procedureCode) return;

    const payload = {
      procedureCode: form.procedureCode,
      description: form.description,
      samplingType: form.samplingType,
      valuationMode: form.valuationMode,
      inspectionPoints: form.inspectionPoints,
      sampleSize: form.sampleSize ? Number(form.sampleSize) : null,
      acceptanceNumber: form.acceptanceNumber
        ? Number(form.acceptanceNumber)
        : null,
        multipleSamples: form.multipleSamples
    };

    if (editingId) {
      await axios.put(
        `${BASE_URL}/sampling-procedures/${editingId}`,
        payload
      );
    } else {
      await axios.post(`${BASE_URL}/sampling-procedures`, payload);
    }

    setForm({
      procedureCode: "",
      description: "",
      samplingType: "FIXED_SAMPLE",
      valuationMode: "",
      inspectionPoints: "WITHOUT_POINTS",
      sampleSize: "",
      acceptanceNumber: "",
      multipleSamples: "NO_MULTIPLE_SAMPLES" 
    });
    setEditingId(null);
    await loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      procedureCode: item.procedureCode || item.procedure_code,
      description: item.description || "",
      samplingType: item.samplingType || item.sampling_type || "FIXED_SAMPLE",
      valuationMode: item.valuationMode || item.valuation_mode || "",
      inspectionPoints:
        item.inspectionPoints || item.inspection_points || "WITHOUT_POINTS",
      sampleSize: item.sampleSize || item.sample_size || "",
      acceptanceNumber:
        item.acceptanceNumber || item.acceptance_number || "",
         multipleSamples:
    item.multipleSamples || item.multiple_samples || "NO_MULTIPLE_SAMPLES"
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/sampling-procedures/${id}`);
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/sampling-procedures/${id}/restore`);
    await loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(
      `${BASE_URL}/sampling-procedures/${id}/hard-delete`
    );
    await loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />

      <div className="qc-master-content">
        <Header title="Sampling Procedure" />

        <div className="qc-master-body">
          <div className="qc-master-form-card">
            <h3>
              {editingId
                ? "Edit Sampling Procedure"
                : "Create Sampling Procedure"}
            </h3>

            <form onSubmit={handleSubmit} className="qc-form">
              {/* Row 1 */}
              <div className="form-row">
                <label>Sampling Procedure</label>
                <input
                  name="procedureCode"
                  value={form.procedureCode}
                  onChange={handleChange}
                  placeholder="SP_TEST"
                  required
                />
              </div>

              <div className="form-row">
                <label>Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description"
                />
              </div>

              {/* Row 2 */}
              <div className="form-row">
                <label>Sampling Type</label>
                <select
                  name="samplingType"
                  value={form.samplingType}
                  onChange={handleChange}
                >
                  <option value="FIXED_SAMPLE">Fixed sample</option>
                  <option value="NORMAL_SAMPLE">Normal sample</option>
                </select>
              </div>

              <div className="form-row">
                <label>Valuation Mode (Vendor / Farmer)</label>
                <select
                  name="valuationMode"
                  value={form.valuationMode}
                  onChange={handleChange}
                >
                  <option value="">Select vendor / farmer...</option>
                  {valuationModes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: sample size + acceptance number */}
              <div className="form-row">
                <label>Sample size</label>
                <input
                  type="number"
                  name="sampleSize"
                  min="0"
                  value={form.sampleSize}
                  onChange={handleChange}
                  placeholder="e.g. 80"
                />
              </div>

              <div className="form-row">
                <label>Acceptance number</label>
                <input
                  type="number"
                  name="acceptanceNumber"
                  min="0"
                  value={form.acceptanceNumber}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                />
              </div>

              {/* Row 4: inspection points, full width */}
              <div className="form-row form-row-full">
                <label>Inspection Points</label>
                <div className="radio-group-horizontal">
                  <label className="radio-option-inline">
                    <input
                      type="radio"
                      name="inspectionPoints"
                      value="WITHOUT_POINTS"
                      checked={
                        form.inspectionPoints === "WITHOUT_POINTS"
                      }
                      onChange={handleChange}
                    />
                    Without insp. points
                  </label>

                  <label className="radio-option-inline">
                    <input
                      type="radio"
                      name="inspectionPoints"
                      value="PLANT_MAINT"
                      checked={
                        form.inspectionPoints === "PLANT_MAINT"
                      }
                      onChange={handleChange}
                    />
                    Plant maintenance
                  </label>

                  <label className="radio-option-inline">
                    <input
                      type="radio"
                      name="inspectionPoints"
                      value="SAMPLE_MGMT"
                      checked={
                        form.inspectionPoints === "SAMPLE_MGMT"
                      }
                      onChange={handleChange}
                    />
                    Sample management
                  </label>

                  <label className="radio-option-inline">
                    <input
                      type="radio"
                      name="inspectionPoints"
                      value="FREE_POINTS"
                      checked={
                        form.inspectionPoints === "FREE_POINTS"
                      }
                      onChange={handleChange}
                    />
                    Free inspection pts
                  </label>
                </div>
              </div>
              <div className="form-row form-row-full">
  <label>Multiple samples</label>
  <div className="radio-group-horizontal">
    <label className="radio-option-inline">
      <input
        type="radio"
        name="multipleSamples"
        value="NO_MULTIPLE_SAMPLES"
        checked={form.multipleSamples === "NO_MULTIPLE_SAMPLES"}
        onChange={handleChange}
      />
      No multiple samples
    </label>

    <label className="radio-option-inline">
      <input
        type="radio"
        name="multipleSamples"
        value="INDEP_MULTIPLE_SAMPLES"
        checked={form.multipleSamples === "INDEP_MULTIPLE_SAMPLES"}
        onChange={handleChange}
      />
      Indep multiple samples
    </label>

    <label className="radio-option-inline">
      <input
        type="radio"
        name="multipleSamples"
        value="DEP_MULTIPLE_SAMPLES"
        checked={form.multipleSamples === "DEP_MULTIPLE_SAMPLES"}
        onChange={handleChange}
      />
      Dep multiple samples
    </label>
  </div>
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
                  ? "Sampling Procedure - Recycle Bin"
                  : "Sampling Procedure List"}
              </h3>

              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  
                  <th>Sampling Procedure</th>
                  <th>Description</th>
                  <th>Sampling Type</th>
                  <th>Valuation</th>
                  <th>Sample size</th>
                  <th>Acceptance no.</th>
                  <th>Multiple samples</th>

                  {!showRecycleBin && <th>Inspection Points</th>}
                  {showRecycleBin && <th>Deleted At</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    
                    <td>{item.procedureCode || item.procedure_code}</td>
                    <td>{item.description}</td>
                    <td>{item.samplingType || item.sampling_type}</td>
                    <td>{item.valuationMode || item.valuation_mode}</td>
                    <td>{item.sampleSize || item.sample_size}</td>
                    <td>
                      {item.acceptanceNumber || item.acceptance_number}
                    </td>
                    <td>{item.multipleSamples || item.multiple_samples}</td>


                    {!showRecycleBin && (
                      <td>
                        {item.inspectionPoints || item.inspection_points}
                      </td>
                    )}
                    {showRecycleBin && (
                      <td>{item.deleted_at || item.deletedAt || "-"}</td>
                    )}

                    <td>
                      {!showRecycleBin && (
                        <>
                        <div className="btn">
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
                          </div>
                        </>
                      )}
                      {showRecycleBin && (
                        <>
                         <div className="btn">
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
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={showRecycleBin ? 10 : 10}
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
