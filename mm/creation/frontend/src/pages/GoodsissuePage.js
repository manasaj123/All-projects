
import React, { useEffect, useState } from "react";
import grApi from "../api/grApi";
import poApi from "../api/poApi";

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
  minWidth: "160px",
  
};

const inputStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
    border: "1px solid #d1d5db",
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
  backgroundColor: "#6b7280",
  marginLeft: "8px"
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
    textAlign: "left",
    borderBottom: "1px solid #d1d5db"
};

const tdStyle = {
  padding: "6px",
    borderBottom: "1px solid #f3f4f6"
};

const smallBtn = {
  padding: "4px 8px",
  fontSize: "12px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  marginRight: "4px"
};

const stockTypeOptions = [
  { value: "UNRESTRICTED", label: "Unrestricted" },
  { value: "QUALITY", label: "Quality" },
  { value: "BLOCKED", label: "Blocked" }
];

export default function GoodsissuePage() {
  const [poList, setPoList] = useState([]);
  const [grs, setGRs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPoId, setSelectedPoId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [header, setHeader] = useState({
    gr_no: "",
    doc_date: "",
    posting_date: "",
    po_id: "",
    plant: "",
    status: "POSTED",
    location_id: 1
  });

  const [items, setItems] = useState([]);

  const toInputDate = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

  const loadPOs = async () => {
    const res = await poApi.getAll();
    setPoList(res.data);
  };

  const loadGRs = async () => {
    const res = await grApi.getAll();
    setGRs(res.data);
  };

  useEffect(() => {
    loadPOs();
    loadGRs();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setHeader({
      gr_no: "",
      doc_date: "",
      posting_date: "",
      po_id: "",
      plant: "",
      status: "POSTED",
      location_id: 1
    });
    setItems([]);
    setSelectedPoId("");
  };

  const handleSelectPO = async (poId) => {
    setSelectedPoId(poId);
    if (!poId) {
      setItems([]);
      setHeader((h) => ({ ...h, po_id: "", plant: "" }));
      return;
    }
    const res = await poApi.getById(poId);
    const poHeader = res.data.header;
    const poItems = res.data.items || [];

    setHeader((h) => ({
      ...h,
      po_id: poId,
      plant: poHeader.plant || h.plant
    }));

    setItems(
      poItems.map((it) => ({
        po_item_id: it.id,
        material_id: it.material_id,
        material_desc: it.material_name || it.description || "",
        qty: it.qty,
        storage_location: poHeader.storage_location || "",
        stock_type: "UNRESTRICTED",
        unit_cost: it.price || 0
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
    const payload = {
      header,
      items: items.map((it) => ({
        ...it,
        qty: Number(it.qty),
        unit_cost: Number(it.unit_cost || 0)
      }))
    };

    try {
      if (editingId) {
        await grApi.update(editingId, payload);
        alert("Goods Receipt updated");
      } else {
        const res = await grApi.create(payload);
        alert(`Goods Receipt saved : ${res.data.gr_no}`);
      }
      resetForm();
      loadGRs();
    } catch (err) {
      console.error(err);
      alert("Error saving Goods Receipt");
    }
  };

  const handleEdit = async (gr) => {
    setEditingId(gr.id);
    const res = await grApi.getById(gr.id);
    const { header: h, items: its } = res.data;

    setHeader({
      gr_no: h.gr_no,
      doc_date: toInputDate(h.doc_date),
      posting_date: toInputDate(h.posting_date),
      po_id: h.po_id,
      plant: h.plant,
      status: h.status || "POSTED",
      location_id: 1
    });
    setSelectedPoId(String(h.po_id || ""));

    setItems(
      (its || []).map((it) => ({
        po_item_id: it.po_item_id,
        material_id: it.material_id,
        material_desc: it.material_desc,
        qty: String(it.qty),
        storage_location: it.storage_location,
        stock_type: it.stock_type,
        unit_cost: "" // if you want cost editable, store separately or add column to gr_items
      }))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Goods Receipt?")) return;
    await grApi.deleteById(id);
    if (editingId === id) resetForm();
    loadGRs();
  };

  const filteredGRs = grs.filter((g) => {
    const term = search.toLowerCase();
    return (
      g.gr_no?.toLowerCase().includes(term) ||
      g.po_no?.toLowerCase().includes(term) ||
      g.plant?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={titleStyle}>Goods issue</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              Gi No
              <input
                style={inputStyle}
                value={
                  editingId ? header.gr_no : header.gr_no || "Auto Generated"
                }
                disabled
              />
            </label>
            <label style={labelStyle}>
              Document Date
              <input
                style={inputStyle}
                type="date"
                name="doc_date"
                value={header.doc_date}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Posting Date
              <input
                style={inputStyle}
                type="date"
                name="posting_date"
                value={header.posting_date}
                onChange={handleHeaderChange}
                required
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
              Plant
              <input
                style={inputStyle}
                name="plant"
                value={header.plant}
                onChange={handleHeaderChange}
              />
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
                GR Lines
              </div>
              {items.map((it, idx) => (
                <div key={idx} style={formRowStyle}>
                  <label style={labelStyle}>
                    Material
                    <input
                      style={inputStyle}
                      value={it.material_id}
                      disabled
                    />
                  </label>
                  <label style={labelStyle}>
                    Description
                    <input
                      style={inputStyle}
                      value={it.material_desc}
                      disabled
                    />
                  </label>
                  <label style={labelStyle}>
                    Qty
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.qty}
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Storage Location
                    <input
                      style={inputStyle}
                      value={it.storage_location}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "storage_location",
                          e.target.value
                        )
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Stock Type
                    <select
                      style={inputStyle}
                      value={it.stock_type}
                      onChange={(e) =>
                        handleItemChange(idx, "stock_type", e.target.value)
                      }
                    >
                      {stockTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
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
              {editingId ? "Update GR" : "Save GR"}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={resetForm}
            >
              New / Clear
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <div
          style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}
        >
          Existing Goods Receipts
        </div>

        <input
          style={{
            ...inputStyle,
            marginBottom: "8px",
            maxWidth: "260px"
          }}
          placeholder="Search by Gi No, PO No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Gi No</th>
              <th style={thStyle}>Doc Date</th>
              <th style={thStyle}>Posting Date</th>
              <th style={thStyle}>PO</th>
              <th style={thStyle}>Plant</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGRs.map((g) => (
              <tr key={g.id}>
                <td style={tdStyle}>{g.gr_no}</td>
                <td style={tdStyle}>{toInputDate(g.doc_date)}</td>
                <td style={tdStyle}>{toInputDate(g.posting_date)}</td>
                <td style={tdStyle}>{g.po_no}</td>
                <td style={tdStyle}>{g.plant}</td>
                <td style={tdStyle}>{g.status}</td>
                <td style={tdStyle}>
                  <button
                    style={{
                      ...smallBtn,
                      backgroundColor: "#2563eb",
                      color: "#fff"
                    }}
                    onClick={() => handleEdit(g)}
                  >
                     Edit
                  </button>
                  <button
                    style={{
                      ...smallBtn,
                      backgroundColor: "#dc2626",
                      color: "#fff"
                    }}
                    onClick={() => handleDelete(g.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredGRs.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  No Goods issued found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
