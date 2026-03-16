








import React, { useEffect, useState } from "react";
import grnApi from "../api/grnApi";
import poApi from "../api/poApi";
import vendorApi from "../api/vendorApi";

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  marginBottom: "16px"
};

const formRowStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
  flexWrap: "wrap"
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  color: "#4b5563",
  flex: 1,
  minWidth: "160px"
};

const inputStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "1px solid #d1d5db"
};

const buttonStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  cursor: "pointer"
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6b7280"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
  marginTop: "12px"
};

const thStyle = {
  backgroundColor: "#e5e7eb",
  padding: "6px",
  border: "1px solid #d1d5db",
  textAlign: "left"
};

const tdStyle = {
  padding: "6px",
  border: "1px solid #e5e7eb"
};

const smallBtn = {
  padding: "4px 8px",
  fontSize: "12px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  marginRight: "4px"
};

export default function GRNPage() {
  const [poList, setPoList] = useState([]);
  const [grns, setGrns] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [vendors, setVendors] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [header, setHeader] = useState({
    grn_no: "",
    grn_date: "",
    vendor_id: "",
    po_id: "",
    location_id: 1,
    status: "POSTED"
  });

  const [items, setItems] = useState([]);

  const toInputDate = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

  const loadPOs = async () => {
    try {
      const res = await poApi.getAll();
      setPoList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await vendorApi.getAll();
      setVendors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadGRNs = async () => {
    try {
      const res = await grnApi.getAll();
      setGrns(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPOs();
    loadVendors();
    loadGRNs();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setHeader({
      grn_no: "",
      grn_date: "",
      vendor_id: "",
      po_id: "",
      location_id: 1,
      status: "POSTED"
    });
    setItems([]);
    setSelectedPoId("");
  };

  const handleSelectPO = async (poId) => {
    setSelectedPoId(poId);
    if (!poId) {
      setItems([]);
      setHeader((h) => ({ ...h, po_id: "", vendor_id: "" }));
      return;
    }
    const res = await poApi.getById(poId);
    const poHeader = res.data.header;
    const poItems = res.data.items || [];

    setHeader((h) => ({
      ...h,
      po_id: poId,
      vendor_id: poHeader.vendor_id
    }));

    setItems(
      poItems.map((it) => ({
        po_item_id: it.id,
        material_id: it.material_id,
        received_qty: it.qty,
        accepted_qty: it.qty,
        rejected_qty: 0,
        batch_no: "",
        mfg_date: "",
        expiry_date: "",
        unit_cost: it.price
      }))
    );
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((h) => ({ ...h, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header,
        items: items.map((it) => ({
          ...it,
          received_qty: Number(it.received_qty),
          accepted_qty: Number(it.accepted_qty),
          rejected_qty: Number(it.rejected_qty),
          unit_cost: Number(it.unit_cost)
        }))
      };

      if (editingId) {
        await grnApi.update(editingId, payload);
        alert("GRN updated");
      } else {
        const res = await grnApi.create(payload);
        alert(`GRN saved : ${res.data.grn_no}`);
      }

      resetForm();
      loadGRNs();
    } catch (e) {
      console.error(e);
      alert("Error saving GRN");
    }
  };

  const handleEdit = async (grn) => {
    setEditingId(grn.id);
    const res = await grnApi.getById(grn.id);
    const { header: h, items: its } = res.data;

    setHeader({
      grn_no: h.grn_no,
      grn_date: toInputDate(h.grn_date),
      vendor_id: h.vendor_id,
      po_id: h.po_id,
      location_id: h.location_id,
      status: h.status || "POSTED"
    });
    setSelectedPoId(String(h.po_id || ""));
    setItems(
      (its || []).map((it) => ({
        po_item_id: it.po_item_id,
        material_id: it.material_id,
        received_qty: String(it.received_qty),
        accepted_qty: String(it.accepted_qty),
        rejected_qty: String(it.rejected_qty),
        batch_no: it.batch_no || "",
        mfg_date: toInputDate(it.mfg_date),
        expiry_date: toInputDate(it.expiry_date),
        unit_cost: String(it.unit_cost || 0)
      }))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this GRN?")) return;
    await grnApi.deleteById(id);
    if (editingId === id) resetForm();
    loadGRNs();
  };

  return (
    <div>
      <div style={titleStyle}>Goods Receipt (GRN)</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              GRN No
              <input
                style={inputStyle}
                value={
                  editingId
                    ? header.grn_no
                    : header.grn_no || "Auto Generated"
                }
                disabled
              />
            </label>
            <label style={labelStyle}>
              GRN Date
              <input
                style={inputStyle}
                type="date"
                name="grn_date"
                value={header.grn_date}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Location Id
              <input
                style={inputStyle}
                type="number"
                name="location_id"
                value={header.location_id}
                onChange={handleHeaderChange}
              />
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              PO
              <select
                style={inputStyle}
                value={selectedPoId}
                onChange={(e) => handleSelectPO(e.target.value)}
                required
              >
                <option value="">Select PO</option>
                {poList.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_no} - {po.vendor_name}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Vendor
              <select
                style={inputStyle}
                name="vendor_id"
                value={header.vendor_id}
                onChange={handleHeaderChange}
                disabled
              >
                <option value="">Select</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Status
              <input
                style={inputStyle}
                name="status"
                value={header.status}
                onChange={handleHeaderChange}
              />
            </label>
          </div>

          {items.length > 0 && (
            <>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  margin: "8px 0"
                }}
              >
                GRN Lines
              </div>
              {items.map((it, idx) => (
                <div key={idx} style={formRowStyle}>
                  <label style={labelStyle}>
                    Material ID
                    <input
                      style={inputStyle}
                      value={it.material_id}
                      disabled
                    />
                  </label>
                  <label style={labelStyle}>
                    Received
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.received_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "received_qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Accepted
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.accepted_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "accepted_qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Rejected
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.rejected_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "rejected_qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Batch No
                    <input
                      style={inputStyle}
                      value={it.batch_no}
                      onChange={(e) =>
                        handleItemChange(idx, "batch_no", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Mfg Date
                    <input
                      style={inputStyle}
                      type="date"
                      value={it.mfg_date}
                      onChange={(e) =>
                        handleItemChange(idx, "mfg_date", e.target.value)
                      }
                    />
                    
                  </label>
                  <label style={labelStyle}>
                    Expiry Date
                    <input
                      style={inputStyle}
                      type="date"
                      value={it.expiry_date}
                      onChange={(e) =>
                        handleItemChange(idx, "expiry_date", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Unit Cost
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.unit_cost}
                      onChange={(e) =>
                        handleItemChange(idx, "unit_cost", e.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </>
          )}

          <div>
            <button
              type="submit"
              style={buttonStyle}
              disabled={!items.length}
            >
              {editingId ? "Update GRN" : "Save GRN"}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={resetForm}
            >
              Cancel / Clear
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
          Existing GRNs
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>GRN No</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>PO</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {grns.map((g) => (
              <tr key={g.id}>
                <td style={tdStyle}>{g.grn_no}</td>
                <td style={tdStyle}>{toInputDate(g.grn_date)}</td>
                <td style={tdStyle}>{g.po_no}</td>
                <td style={tdStyle}>{g.vendor_name}</td>
                <td style={tdStyle}>{g.location_id}</td>
                <td style={tdStyle}>{g.status}</td>
                <td style={tdStyle}>
                  <button
                    style={{ ...smallBtn, backgroundColor: "#2563eb", color: "#fff" }}
                    onClick={() => handleEdit(g)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...smallBtn, backgroundColor: "#dc2626", color: "#fff" }}
                    onClick={() => handleDelete(g.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {grns.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  No GRNs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
