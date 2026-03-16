import React, { useEffect, useState } from "react";
import rfqApi from "../api/rfqApi";
import vendorApi from "../api/vendorApi";
import materialApi from "../api/materialApi";

export default function RequestForQuotationPage() {
  const styles = {
    container: {
      maxWidth: "1100px",
      margin: "10px auto",
      padding: "16px",
      background: "#f4f6f9",
      borderRadius: "10px",
      fontFamily: "Arial, sans-serif"
    },
    title: {
      textAlign: "center",
      marginBottom: "16px"
    },
    sectionTitle: {
      marginTop: "20px",
      marginBottom: "8px",
      fontSize: "16px"
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "16px",
      marginBottom: "10px"
    },
    formCol: {},
    label: {
      fontWeight: "bold",
      display: "block",
      marginBottom: "4px"
    },
    input: {
      padding: "7px",
      width: "100%",
      borderRadius: "5px",
      border: "1px solid #ccc",
      boxSizing: "border-box"
    },
    tableWrapper: {
      marginTop: "10px",
      overflowX: "auto"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white"
    },
    th: {
      background: "#2563eb",
      color: "white",
      padding: "8px",
      border: "1px solid #ddd",
      fontSize: "13px",
      whiteSpace: "nowrap"
    },
    td: {
      padding: "6px",
      border: "1px solid #ddd",
      fontSize: "13px",
      verticalAlign: "middle"
    },
    button: {
      padding: "8px 14px",
      marginTop: "15px",
      marginRight: "10px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px"
    },
    addBtn: { background: "#2563eb", color: "white" },
    saveBtn: { background: "#16a34a", color: "white" },
    editBtn: {
      background: "#0b51f5",
      color: "white",
      padding: "4px 10px",
      marginRight: "4px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px"
    },
    deleteBtn: {
      background: "#dc2626",
      color: "white",
      padding: "4px 10px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px"
    },
    searchBox: {
      padding: "7px",
      width: "260px",
      borderRadius: "5px",
        border: "1px solid #ccc",
         marginBottom: "10px",
    }
  };

  const [rfqs, setRFQs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [header, setHeader] = useState({
    rfq_type: "",
    rfq_date: "",
    question_deadline: "",
    purchase_org: "",
    delivery_date: "",
    material_group: "",
    plant: "",
    storage_location: "",
    vendor_id: "",
    supplying_plant: "",
    reference_pr_id: ""
  });

  const [items, setItems] = useState([{ material_id: "", qty: "" }]);

  const loadRFQs = async () => {
    const res = await rfqApi.getAll();
    setRFQs(res.data);
  };

  const loadMaterials = async () => {
    const res = await materialApi.getAll();
    setMaterials(res.data);
  };

  const loadVendors = async () => {
    const res = await vendorApi.getAll();
    setVendors(res.data);
  };

  useEffect(() => {
    loadRFQs();
    loadMaterials();
    loadVendors();
  }, []);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((h) => ({ ...h, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const addRow = () => {
    setItems((prev) => [...prev, { material_id: "", qty: "" }]);
  };

  const resetForm = () => {
    setEditingId(null);
    setHeader({
      rfq_type: "",
      rfq_date: "",
      question_deadline: "",
      purchase_org: "",
      delivery_date: "",
      material_group: "",
      plant: "",
      storage_location: "",
      vendor_id: "",
      supplying_plant: "",
      reference_pr_id: ""
    });
    setItems([{ material_id: "", qty: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      header: {
        ...header,
        vendor_id: header.vendor_id ? Number(header.vendor_id) : null,
        reference_pr_id: header.reference_pr_id
          ? Number(header.reference_pr_id)
          : null
      },
      items: items
        .filter((i) => i.material_id && i.qty)
        .map((i) => ({
          material_id: Number(i.material_id),
          qty: Number(i.qty)
        }))
    };

    if (editingId) {
      await rfqApi.update(editingId, payload);
      alert("RFQ Updated");
    } else {
      const res = await rfqApi.create(payload);
      alert(`RFQ Created : ${res.data.rfq_no}`);
    }

    resetForm();
    loadRFQs();
  };

  const toInputDate = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

  const editRFQ = async (rfq) => {
    setEditingId(rfq.id);
    const res = await rfqApi.getById(rfq.id);
    const { header: h, items: its } = res.data;

    setHeader({
      rfq_type: h.rfq_type || "",
      rfq_date: toInputDate(h.rfq_date),
      question_deadline: toInputDate(h.question_deadline),
      purchase_org: h.purchase_org || "",
      delivery_date: toInputDate(h.delivery_date),
      material_group: h.material_group || "",
      plant: h.plant || "",
      storage_location: h.storage_location || "",
      vendor_id: h.vendor_id ? String(h.vendor_id) : "",
      supplying_plant: h.supplying_plant || "",
      reference_pr_id: h.reference_pr_id ? String(h.reference_pr_id) : ""
    });

    setItems(
      (its || []).map((it) => ({
        material_id: String(it.material_id),
        qty: String(it.qty)
      }))
    );
  };

  const deleteRFQ = async (id) => {
    if (!window.confirm("Delete this RFQ?")) return;
    await rfqApi.deleteById(id);
    if (editingId === id) resetForm();
    loadRFQs();
  };

  const filteredRFQs = rfqs.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.rfq_no?.toLowerCase().includes(term) ||
      r.rfq_type?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Request for Question</h2>

      <form onSubmit={handleSubmit}>
        

        {/* Row 1: RFQ No, RFQ Type, Purchase Org */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>RFQ No</label>
            <input
              style={styles.input}
              value={editingId ? "(Editing existing RFQ)" : "Auto Generated"}
              disabled
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>RFQ Type</label>
            <input
              style={styles.input}
              name="rfq_type"
              value={header.rfq_type}
              onChange={handleHeaderChange}
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Purchase Organization</label>
            <input
              style={styles.input}
              name="purchase_org"
              value={header.purchase_org}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Row 2: RFQ Date, Question Deadline, Delivery Date */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>RFQ Date</label>
            <input
              style={styles.input}
              type="date"
              name="rfq_date"
              value={header.rfq_date}
              onChange={handleHeaderChange}
              required
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Question Deadline</label>
            <input
              style={styles.input}
              type="date"
              name="question_deadline"
              value={header.question_deadline}
              onChange={handleHeaderChange}
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Delivery Date</label>
            <input
              style={styles.input}
              type="date"
              name="delivery_date"
              value={header.delivery_date}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Row 3: Material Group, Plant, Storage Location */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Material Group</label>
            <input
              style={styles.input}
              name="material_group"
              value={header.material_group}
              onChange={handleHeaderChange}
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Plant</label>
            <input
              style={styles.input}
              name="plant"
              value={header.plant}
              onChange={handleHeaderChange}
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Storage Location</label>
            <input
              style={styles.input}
              name="storage_location"
              value={header.storage_location}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Row 4: Supplying Plant, Vendor, Reference PR */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Supplying Plant</label>
            <input
              style={styles.input}
              name="supplying_plant"
              value={header.supplying_plant}
              onChange={handleHeaderChange}
            />
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Vendor</label>
            <select
              style={styles.input}
              name="vendor_id"
              value={header.vendor_id}
              onChange={handleHeaderChange}
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formCol}>
            <label style={styles.label}>Reference Purchase Requisition</label>
            <input
              style={styles.input}
              name="reference_pr_id"
              value={header.reference_pr_id}
              onChange={handleHeaderChange}
              placeholder="PR ID"
            />
          </div>
        </div>

        <h4 style={styles.sectionTitle}>Materials (Material & Qty)</h4>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Material</th>
                <th style={styles.th}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>
                    <select
                      style={styles.input}
                      value={it.material_id}
                      onChange={(e) =>
                        handleItemChange(idx, "material_id", e.target.value)
                      }
                    >
                      <option value="">Select Material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.input}
                      type="number"
                      value={it.qty}
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          style={{ ...styles.button, ...styles.addBtn }}
          onClick={addRow}
        >
          Add Row
        </button>

        <button
          type="submit"
          style={{ ...styles.button, ...styles.saveBtn }}
        >
          {editingId ? "Update RFQ" : "Save RFQ"}
        </button>
      </form>

      <h3 style={{ marginTop: "30px" }}>Existing RFQs</h3>

      <input
        style={styles.searchBox}
        placeholder="Search by RFQ No / Type"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>RFQ No</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>RFQ Date</th>
              <th style={styles.th}>Question Deadline</th>
              <th style={styles.th}>Purchase Org</th>
              <th style={styles.th}>Delivery Date</th>
              <th style={styles.th}>Plant</th>
              <th style={styles.th}>Vendor</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRFQs.map((r) => (
              <tr key={r.id}>
                <td style={styles.td}>{r.rfq_no}</td>
                <td style={styles.td}>{r.rfq_type}</td>
                <td style={styles.td}>{toInputDate(r.rfq_date)}</td>
                <td style={styles.td}>{toInputDate(r.question_deadline)}</td>
                <td style={styles.td}>{r.purchase_org}</td>
                <td style={styles.td}>{toInputDate(r.delivery_date)}</td>
                <td style={styles.td}>{r.plant}</td>
                <td style={styles.td}>{r.vendor_id}</td>
                <td style={styles.td}>{r.total_qty}</td>
                <td style={styles.td}>{r.item_count}</td>
                <td style={styles.td}>
                  <button
                    type="button"
                    style={styles.editBtn}
                    onClick={() => editRFQ(r)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => deleteRFQ(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredRFQs.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={11}>
                  No RFQs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
