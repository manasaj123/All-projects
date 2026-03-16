import React, { useEffect, useState } from "react";
import poApi from "../api/poApi";
import vendorApi from "../api/vendorApi";
import materialApi from "../api/materialApi";
import prApi from "../api/prApi";

// Helper to normalize date to yyyy-MM-dd for <input type="date"> and DB
const formatDateYMD = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0]; // yyyy-MM-dd
  } catch {
    return "";
  }
};

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
  marginBottom: "8px"
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  color: "#4b5563",
  flex: 1
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

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  borderBottom: "2px solid #e5e7eb"
};

const tdStyle = {
  padding: "6px 8px",
  borderBottom: "1px solid #f3f4f6"
};

export default function POPage() {
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [prs, setPRs] = useState([]);
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [header, setHeader] = useState({
    po_no: "",
    po_date: "",
    vendor_id: "",
    payment_terms: "",
    currency: "INR",
    po_type: "STOCK",
    source_type: "DIRECT"
  });

  const [items, setItems] = useState([
    { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
  ]);

  const [selectedPrId, setSelectedPrId] = useState("");
  const [selectedPrDetails, setSelectedPrDetails] = useState(null);

  const loadRefs = async () => {
    try {
      const [vRes, mRes, prRes] = await Promise.all([
        vendorApi.getAll(),
        materialApi.getAll(),
        prApi.getAll()
      ]);
      setVendors(vRes.data);
      setMaterials(mRes.data);
      setPRs(prRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPOs = async () => {
    try {
      setLoading(true);
      const res = await poApi.getAll();
      setPOs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    loadPOs();
  }, []);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((h) => ({ ...h, [name]: value }));

    if (name === "source_type" && value !== "PR") {
      setSelectedPrId("");
      setSelectedPrDetails(null);
      setItems([
        { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
      ]);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedPrId("");
    setSelectedPrDetails(null);
    setHeader({
      po_no: "",
      po_date: "",
      vendor_id: "",
      payment_terms: "",
      currency: "INR",
      po_type: "STOCK",
      source_type: "DIRECT"
    });
    setItems([
      { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header: {
          po_no: header.po_no,
          po_date: formatDateYMD(header.po_date),
          vendor_id: Number(header.vendor_id),
          payment_terms: header.payment_terms,
          currency: header.currency,
          po_type: header.po_type,
          source_type: header.source_type
        },
        items: items
          .filter((i) => i.material_id && i.qty && i.price)
          .map((i) => ({
            ...i,
            material_id: Number(i.material_id),
            qty: Number(i.qty),
            price: Number(i.price),
            tax_percent: Number(i.tax_percent) || 0,
            delivery_date: formatDateYMD(i.delivery_date) || null
          }))
      };

      if (editingId) {
        await poApi.update(editingId, payload);
      } else {
        await poApi.create(payload);
      }

      resetForm();
      await loadPOs();
    } catch (e) {
      console.error(e);
    }
  };

  const applyPRToPO = async (prId) => {
    if (!prId) {
      setSelectedPrDetails(null);
      return;
    }
    try {
      const res = await prApi.getById(prId); // must return { header, items }
      const { header: prHeader, items: prItems } = res.data;

      setSelectedPrDetails({ header: prHeader, items: prItems });

      setItems(
        (prItems || []).map((it) => ({
          material_id: it.material_id,
          qty: it.qty,
          price: "",
          tax_percent: "",
          delivery_date: formatDateYMD(it.required_date)
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const editPO = async (po) => {
    setEditingId(po.id);
    setSelectedPrId("");
    setSelectedPrDetails(null);

    const baseHeader = {
      po_no: po.po_no || "",
      po_date: po.po_date,
      vendor_id: po.vendor_id,
      payment_terms: po.payment_terms,
      currency: po.currency,
      po_type: po.po_type || "STOCK",
      source_type: po.source_type || "DIRECT"
    };
    setHeader(baseHeader);

    try {
      const res = await poApi.getById(po.id);
      const { header: fullHeader, items: fullItems } = res.data;
      setHeader({
        po_no: fullHeader.po_no || "",
        po_date: fullHeader.po_date,
        vendor_id: fullHeader.vendor_id,
        payment_terms: fullHeader.payment_terms,
        currency: fullHeader.currency,
        po_type: fullHeader.po_type || "STOCK",
        source_type: fullHeader.source_type || "DIRECT"
      });
      setItems(
        (fullItems || []).map((it) => ({
          material_id: it.material_id,
          qty: it.qty,
          price: it.price,
          tax_percent: it.tax_percent,
          delivery_date: it.delivery_date
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const deletePO = async (id) => {
    if (!window.confirm("Delete this PO?")) return;
    try {
      await poApi.deleteById(id);
      await loadPOs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Purchase Orders</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              PO No
              <input
                style={inputStyle}
                name="po_no"
                value={header.po_no}
                readOnly
                placeholder="Auto"
              />
            </label>
            <label style={labelStyle}>
              PO Date
              <input
                style={inputStyle}
                type="date"
                name="po_date"
                value={formatDateYMD(header.po_date)}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Vendor
              <select
                style={inputStyle}
                name="vendor_id"
                value={header.vendor_id}
                onChange={handleHeaderChange}
                required
              >
                <option value="">Select</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Payment Terms
              <input
                style={inputStyle}
                name="payment_terms"
                value={header.payment_terms}
                onChange={handleHeaderChange}
              />
            </label>
            <label style={labelStyle}>
              Currency
              <input
                style={inputStyle}
                name="currency"
                value={header.currency}
                onChange={handleHeaderChange}
              />
            </label>

            <label style={labelStyle}>
              PO Type
              <select
                style={inputStyle}
                name="po_type"
                value={header.po_type}
                onChange={handleHeaderChange}
              >
                <option value="SUB_CONTRACT">Sub Contract</option>
                <option value="CONSUMER">Consumer</option>
                <option value="STOCK">Stock Transfer</option>
                <option value="SERVICE">Service</option>
              </select>
            </label>

            <label style={labelStyle}>
              Order Source
              <select
                style={inputStyle}
                name="source_type"
                value={header.source_type}
                onChange={handleHeaderChange}
              >
                <option value="DIRECT">Direct</option>
                <option value="PR">PR</option>
                <option value="RFQ">RFQ</option>
                <option value="QA">QA</option>
              </select>
            </label>
          </div>

          {header.source_type === "PR" && (
            <>
              <div style={formRowStyle}>
                <label style={labelStyle}>
                  Source PR
                  <select
                    style={inputStyle}
                    value={selectedPrId}
                    onChange={(e) => {
                      const prId = e.target.value;
                      setSelectedPrId(prId);
                      applyPRToPO(prId);
                    }}
                  >
                    <option value="">Select PR</option>
                    {prs.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.req_no} - {pr.requester}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedPrDetails && (
                <div style={{ marginTop: "8px", fontSize: "13px" }}>
                  <div style={{ marginBottom: "4px", fontWeight: 500 }}>
                    Selected PR
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    PR No: {selectedPrDetails.header.req_no} | Date:{" "}
                    {formatDateYMD(selectedPrDetails.header.req_date)} | Requester:{" "}
                    {selectedPrDetails.header.requester}
                  </div>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Material</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Required Date</th>
                        <th style={thStyle}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrDetails.items.map((it, idx) => (
                        <tr key={idx}>
                          <td style={tdStyle}>{it.material_id}</td>
                          <td style={tdStyle}>{it.qty}</td>
                          <td style={tdStyle}>{formatDateYMD(it.required_date)}</td>
                          <td style={tdStyle}>{it.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div style={{ fontSize: "13px", fontWeight: 500, margin: "8px 0" }}>
            Items
          </div>

          {items.map((it, idx) => (
            <div key={idx} style={formRowStyle}>
              <label style={labelStyle}>
                Material
                <select
                  style={inputStyle}
                  value={it.material_id}
                  onChange={(e) =>
                    handleItemChange(idx, "material_id", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
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
                Price
                <input
                  style={inputStyle}
                  type="number"
                  value={it.price}
                  onChange={(e) =>
                    handleItemChange(idx, "price", e.target.value)
                  }
                />
              </label>
              <label style={labelStyle}>
                Tax %
                <input
                  style={inputStyle}
                  type="number"
                  value={it.tax_percent}
                  onChange={(e) =>
                    handleItemChange(idx, "tax_percent", e.target.value)
                  }
                />
              </label>
              <label style={labelStyle}>
                Delivery Date
                <input
                  style={inputStyle}
                  type="date"
                  value={formatDateYMD(it.delivery_date)}
                  onChange={(e) =>
                    handleItemChange(idx, "delivery_date", e.target.value)
                  }
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: "#6b7280",
              marginRight: "8px"
            }}
            onClick={addRow}
          >
            + Add Row
          </button>

          <button type="submit" style={buttonStyle}>
            {editingId ? "Update PO" : "Save PO"}
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}>
          Existing POs
        </div>

        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : pos.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            No POs found.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PO No</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Vendor</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>PO Type</th>
                <th style={thStyle}>Source Type</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id}>
                  <td style={tdStyle}>{po.po_no}</td>
                  <td style={tdStyle}>{formatDateYMD(po.po_date)}</td>
                  <td style={tdStyle}>{po.vendor_name}</td>
                  <td style={tdStyle}>{po.status}</td>
                  <td style={tdStyle}>{po.gross_amount}</td>
                  <td style={tdStyle}>{po.po_type}</td>
                  <td style={tdStyle}>{po.source_type}</td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        marginRight: "4px",
                        fontSize: "12px"
                      }}
                      type="button"
                      onClick={() => editPO(po)}
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#dc2626"
                      }}
                      type="button"
                      onClick={() => deletePO(po.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
