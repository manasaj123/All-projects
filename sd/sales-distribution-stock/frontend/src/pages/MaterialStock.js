// frontend/src/pages/MaterialStock.js
import React, { useEffect, useState } from "react";
import {
  getMaterials,
  getDeletedMaterials,
  createMaterial,
  updateMaterial,
  softDeleteMaterial,
  restoreMaterial,
} from "../services/materialService";

const initialForm = {
  materialCode: "",
  description: "",
  baseUom: "",
  materialType: "",
  industrySector: "",
  documentDate: "",
  plant: "",
  storageLocation: "",
  movementType: "",
};

const MaterialStock = () => {
  const [materials, setMaterials] = useState([]);
  const [deletedMaterials, setDeletedMaterials] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getMaterials(),
        getDeletedMaterials(),
      ]);
      setMaterials(activeRes.data);
      setDeletedMaterials(deletedRes.data);
    } catch (err) {
      console.error("Error loading materials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //new validation

  const validateForm = () => {
    const {
      materialCode,
      description,
      baseUom,
      materialType,
      industrySector,
      documentDate, //added
      plant,
      storageLocation,
      movementType,
    } = formData;

    // Material Code Required
    if (!materialCode.trim()) {
      alert("Material Code is required");
      return false;
    }

    // Material Code should not be 0
    if (materialCode.trim() === "0") {
      alert("Material Code cannot be 0");
      return false;
    }

    // Material Code only letters and numbers
    if (!/^[a-zA-Z0-9]+$/.test(materialCode.trim())) {
      alert("Material Code should contain only letters and numbers");
      return false;
    }

    // Description Required
    if (!description.trim()) {
      alert("Description is required");
      return false;
    }

    // Description should not allow special characters
    if (!/^[a-zA-Z0-9\s]+$/.test(description.trim())) {
      alert("Description should contain only letters and numbers");
      return false;
    }

    // Base UOM Required
    if (!baseUom.trim()) {
      alert("Base UoM is required");
      return false;
    }

    // Material Type Required
    if (!materialType.trim()) {
      alert("Material Type is required");
      return false;
    }

    // Material Type no special characters
    if (!/^[a-zA-Z0-9\s]+$/.test(materialType.trim())) {
      alert("Material Type should contain only letters and numbers");
      return false;
    }

    // Industry Sector Required
    if (!industrySector.trim()) {
      alert("Industry Sector is required");
      return false;
    }

    // Industry Sector no special characters
    if (!/^[a-zA-Z0-9\s]+$/.test(industrySector.trim())) {
      alert("Industry Sector should contain only letters and numbers");
      return false;
    }

    // Document Date should be today's date only
    const today = new Date().toISOString().split("T")[0];

    if (documentDate !== today) {
      alert("Document Date must be today's date");
      return false;
    }

    // Plant Required
    if (!plant.trim()) {
      alert("Plant is required");
      return false;
    }

    // Plant should not allow special characters
    if (!/^[a-zA-Z0-9]+$/.test(plant.trim())) {
      alert("Plant Code should contain only letters and numbers");
      return false;
    }

    // Storage Location Required
    if (!storageLocation.trim()) {
      alert("Storage Location is required");
      return false;
    }

    // Storage Location no special characters
    if (!/^[a-zA-Z0-9\s]+$/.test(storageLocation.trim())) {
      alert("Storage Location should contain only letters and numbers");
      return false;
    }

    // Movement Type Required
    if (!movementType.trim()) {
      alert("Movement Type is required");
      return false;
    }

    // Movement Type no special characters
    if (!/^[a-zA-Z0-9\s]+$/.test(movementType.trim())) {
      alert("Movement Type should contain only letters and numbers");
      return false;
    }

    // Negative values check
    if (
      materialCode.includes("-") ||
      plant.includes("-") ||
      movementType.includes("-")
    ) {
      alert("Negative values are not allowed");
      return false;
    }
    return true;
  };

  //end of new validation

  // const handleSubmit = async e => {
  //   e.preventDefault();
  //   try {
  //     if (editingId) {
  //       await updateMaterial(editingId, formData);
  //     } else {
  //       await createMaterial(formData);
  //     }
  //     setFormData(initialForm);
  //     setEditingId(null);
  //     loadData();
  //   } catch (err) {
  //     console.error('Error saving material', err);
  //   }
  // };

  //updated handle submit

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before save
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateMaterial(editingId, formData);
      } else {
        await createMaterial(formData);
      }

      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("Error saving material", err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert(
          "Error ! Material Name already exists or invalid data. Please check your input.",
        );
      }
    }
  };

  const handleEdit = (material) => {
    setEditingId(material.id);
    setFormData({
      materialCode: material.materialCode || "",
      description: material.description || "",
      baseUom: material.baseUom || "",
      materialType: material.materialType || "",
      industrySector: material.industrySector || "",
      documentDate: material.documentDate || "",
      plant: material.plant || "",
      storageLocation: material.storageLocation || "",
      movementType: material.movementType || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Move this material to recycle bin?")) return;
    try {
      await softDeleteMaterial(id);
      loadData();
    } catch (err) {
      console.error("Error deleting material", err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreMaterial(id);
      loadData();
    } catch (err) {
      console.error("Error restoring material", err);
    }
  };

  const currentList = showDeleted ? deletedMaterials : materials;

  return (
    <div className="page-container material-stock-page">
      <style>{`
        .page-container{
          max-width:1100px;
          margin:auto;
          padding:20px;
          font-family:Segoe UI, sans-serif;
        }

        h2{
          margin-bottom:16px;
        }

        .form-card{
          background:white;
          padding:16px;
          border-radius:6px;
          box-shadow:0 2px 6px rgba(0,0,0,0.1);
          margin-bottom:20px;
        }

        /* 3 fields per row */
        .form-row-3{
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap:12px 16px;
          margin-bottom:12px;
        }

        .form-field{
          display:flex;
          flex-direction:column;
        }

        .form-field label{
          font-size:14px;
          margin-bottom:4px;
        }

        .form-field input,
        .form-field select{
          width:100%;
          height:34px;
          padding:4px 8px;
          border:1px solid #cbd5e1;
          border-radius:4px;
          font-size:14px;
        }

        .form-actions{
          margin-top:12px;
          display:flex;
          gap:8px;
        }

        .form-actions button{
          padding:7px 14px;
          border:none;
          border-radius:4px;
          cursor:pointer;
          font-size:13px;
          background:#2563eb;
          color:white;
        }

        .form-actions button[type="button"]{
          background:#6b7280;
        }

        .list-header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin:16px 0;
        }

        .list-header button{
          padding:7px 14px;
          border:none;
          border-radius:4px;
          background:#6b7280;
          color:white;
          cursor:pointer;
          font-size:13px;
        }

        .data-table{
          width:100%;
          border-collapse:collapse;
        }

        .data-table th{
          background:#e0f2fe;
          padding:8px;
          border:1px solid #ddd;
          font-size:13px;
        }

        .data-table td{
          padding:6px;
          border:1px solid #ddd;
          font-size:13px;
        }

        .data-table tr:nth-child(even){
          background:#f9fafb;
        }

        .table-actions{
          display:flex;
          gap:6px;
        }

        .table-actions button{
          padding:4px 10px;
          border:none;
          border-radius:4px;
          cursor:pointer;
          font-size:12px;
          background:#2563eb;
          color:white;
        }

        .table-actions button:nth-child(2){
          background:#f59e0b;
        }

        @media (max-width: 900px){
          .form-row-3{
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h2>Material Stock</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className="form-row-3">
          <div className="form-field">
            <label>Material Code</label>
            <input
              name="materialCode"
              value={formData.materialCode}
              onChange={handleChange}
              required
              disabled={!!editingId}
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Base UoM</label>
            <select
              name="baseUom"
              value={formData.baseUom}
              onChange={handleChange}
              required
            >
              <option value="">-- Select UoM --</option>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="packets">packets</option>
              <option value="pieces">pieces</option>
              <option value="nos">nos</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row-3">
          <div className="form-field">
            <label>Material Type</label>
            <input
              name="materialType"
              value={formData.materialType}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Industry Sector</label>
            <input
              name="industrySector"
              value={formData.industrySector}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Document Date</label>
            <input
              type="date"
              name="documentDate"
              value={formData.documentDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="form-row-3">
          <div className="form-field">
            <label>Plant</label>
            <input
              name="plant"
              value={formData.plant}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Storage Location</label>
            <input
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Movement Type</label>
            <input
              name="movementType"
              value={formData.movementType}
              onChange={handleChange}
              required
              maxLength={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? "Update Material" : "Create Material"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? "Recycle Bin" : "Active Materials"}</h3>
        <button onClick={() => setShowDeleted((v) => !v)}>
          {showDeleted ? "Show Active" : "Show Recycle Bin"}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentList.length === 0 ? (
        <p>No records.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Base UoM</th>
              <th>Type</th>
              <th>Sector</th>
              <th>Plant</th>
              <th>Storage Loc</th>
              <th>Movement</th>
              <th>Document Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((m) => (
              <tr key={m.id}>
                <td>{m.materialCode}</td>
                <td>{m.description}</td>
                <td>{m.baseUom}</td>
                <td>{m.materialType}</td>
                <td>{m.industrySector}</td>
                <td>{m.plant}</td>
                <td>{m.storageLocation}</td>
                <td>{m.movementType}</td>
                <td>{m.documentDate}</td>
                <td>
                  {!showDeleted && (
                    <div className="table-actions">
                      <button type="button" onClick={() => handleEdit(m)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSoftDelete(m.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {showDeleted && (
                    <button type="button" onClick={() => handleRestore(m.id)}>
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MaterialStock;
