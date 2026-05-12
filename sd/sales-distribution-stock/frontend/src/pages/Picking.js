// frontend/src/pages/Picking.js
import React, { useEffect, useState } from "react";
import {
  getPickings,
  getDeletedPickings,
  createPicking,
  updatePicking,
  softDeletePicking,
  restorePicking,
  getDeliveries,
} from "../services/pickingService";

const initialForm = {
  deliveryId: "",
  warehouse: "",
  plant: "",
  pickingStatus: "OPEN",
  packingStatus: "OPEN",
  postGoodsIssue: false,
};

const Picking = () => {
  const [pickings, setPickings] = useState([]);
  const [deletedPickings, setDeletedPickings] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [deliveries, setDeliveries] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pickRes, delPickRes, delRes] = await Promise.all([
        getPickings(),
        getDeletedPickings(),
        getDeliveries(),
      ]);
      setPickings(pickRes.data);
      setDeletedPickings(delPickRes.data);
      setDeliveries(delRes.data);
    } catch (err) {
      console.error("Error loading picking data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const alphaNumRegex = /^[A-Za-z0-9\s-]+$/;

    // 1. Required fields first
    if (!formData.deliveryId) {
      alert("Select delivery");
      return;
    }

    if (!formData.warehouse?.trim()) {
      alert("Warehouse is required");
      return;
    }

    if (!formData.plant?.trim()) {
      alert("Plant is required");
      return;
    }

    // 2. Format validation
    if (!alphaNumRegex.test(formData.warehouse)) {
      alert("Invalid Warehouse (no special characters)");
      return;
    }

    if (!alphaNumRegex.test(formData.plant)) {
      alert("Invalid Plant (no special characters)");
      return;
    }

    // 3. Business rule
    if (
      formData.pickingStatus === "PICKED" &&
      formData.packingStatus !== "PACKED"
    ) {
      alert("Cannot PICK before PACKING is completed");
      return;
    }

    const payload = {
      ...formData,
      deliveryId: Number(formData.deliveryId),
    };

    try {
      if (editingId) {
        await updatePicking(editingId, payload);
      } else {
        await createPicking(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("Error saving picking", err);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      deliveryId: p.deliveryId || "",
      warehouse: p.warehouse || "",
      plant: p.plant || "",
      pickingStatus: p.pickingStatus || "OPEN",
      packingStatus: p.packingStatus || "OPEN",
      postGoodsIssue: !!p.postGoodsIssue,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Move this picking record to recycle bin?")) return;
    try {
      await softDeletePicking(id);
      loadData();
    } catch (err) {
      console.error("Error deleting picking", err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restorePicking(id);
      loadData();
    } catch (err) {
      console.error("Error restoring picking", err);
    }
  };

  const currentList = showDeleted ? deletedPickings : pickings;

  const displayDeliveryRef = (id) => {
    const d = deliveries.find((x) => x.id === id);
    return d ? `DEL-${d.id} (${d.shippingPoint || ""})` : id;
  };

  return (
    <div className="page-container">
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

        h4{
          margin:10px 0 6px;
          font-size:14px;
        }

        /* normal vertical form like Deliveries */
        .form-row{
          display:flex;
          flex-direction:column;
          margin-bottom:10px;
        }

        .form-row label{
          font-size:14px;
          margin-bottom:3px;
          align-self:flex-start;
        }

        .form-row input,
        .form-row select{
          height:32px;
          padding:3px 8px;
          border:1px solid #cbd5e1;
          border-radius:4px;
          font-size:13px;
          align-self:flex-start;
          width:300px;
        }

        .form-row input[type="checkbox"]{
          height:auto;
          width:auto;
          margin-right:6px;
        }

        .form-actions{
          margin-top:14px;
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
          margin-top:8px;
        }

        .data-table th{
          background:#e0f2fe;
          padding:6px;
          border:1px solid #ddd;
          font-size:12px;
        }

        .data-table td{
          padding:5px;
          border:1px solid #ddd;
          font-size:12px;
        }

        .data-table tr:nth-child(even){
          background:#f9fafb;
        }

        .data-table button{
          padding:3px 8px;
          border:none;
          border-radius:4px;
          cursor:pointer;
          font-size:11px;
          background:#2563eb;
          color:white;
          margin-right:4px;
        }

        .data-table button:nth-child(2){
          background:#f59e0b;
        }
      `}</style>

      <h2>Picking & Packing</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Reference Delivery</h4>
        <div className="form-row">
          <label>Delivery</label>
          <select
            name="deliveryId"
            value={formData.deliveryId}
            onChange={handleChange}
            required
          >
            <option value="">Select Delivery</option>
            {deliveries.map((d) => (
              <option key={d.id} value={d.id}>
                DEL-{d.id}
              </option>
            ))}
          </select>
        </div>

        <h4>Warehouse Data</h4>
        <div className="form-row">
          <label>Warehouse</label>
          <input
            name="warehouse"
            value={formData.warehouse}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Plant</label>
          <input name="plant" value={formData.plant} onChange={handleChange} />
        </div>

        <h4>Status</h4>
        <div className="form-row">
          <label>Picking Status</label>
          <select
            name="pickingStatus"
            value={formData.pickingStatus}
            onChange={handleChange}
          >
            <option value="OPEN">OPEN</option>
            <option value="PICKED">PICKED</option>
          </select>
        </div>
        <div className="form-row">
          <label>Packing Status</label>
          <select
            name="packingStatus"
            value={formData.packingStatus}
            onChange={handleChange}
          >
            <option value="OPEN">OPEN</option>
            <option value="PACKED">PACKED</option>
          </select>
        </div>
        <div className="form-row">
          <label>
            <input
              type="checkbox"
              name="postGoodsIssue"
              checked={formData.postGoodsIssue}
              onChange={handleChange}
            />
            Post Goods Issue Done
          </label>
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? "Update Picking" : "Create Picking"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? "Recycle Bin" : "Active Picking Records"}</h3>
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
              <th>Delivery</th>
              <th>Warehouse</th>
              <th>Plant</th>
              <th>Picking Status</th>
              <th>Packing Status</th>
              <th>PGI Done</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((p) => (
              <tr key={p.id}>
                <td>{displayDeliveryRef(p.deliveryId)}</td>
                <td>{p.warehouse}</td>
                <td>{p.plant}</td>
                <td>{p.pickingStatus}</td>
                <td>{p.packingStatus}</td>
                <td>{p.postGoodsIssue ? "Yes" : "No"}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(p)}>Edit</button>
                      <button onClick={() => handleSoftDelete(p.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(p.id)}>Restore</button>
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

export default Picking;
