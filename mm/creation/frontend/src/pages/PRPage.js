import React, { useEffect, useState } from "react";
import prApi from "../api/prApi";
import materialApi from "../api/materialApi";

export default function PRPage() {
  /* ---------------- INTERNAL CSS ---------------- */

  const styles = {
    container: {
      maxWidth: "950px",
      margin: "5px auto",
      padding: "10px",
      background: "#f4f6f9",
      borderRadius: "10px",
      fontFamily: "Arial"
    },
    title: {
      textAlign: "center",
      marginBottom: "10px"
    },
    formGroup: {
      marginBottom: "15px"
    },
    formRow: {
      display: "flex",
      gap: "16px",
      marginBottom: "10px",
      flexWrap: "wrap"
    },
    formCol: {
      flex: 1,
      minWidth: "220px"
    },
    label: {
      fontWeight: "bold",
      display: "block",
      marginBottom: "5px"
    },
    input: {
      padding: "7px",
      width: "100%",
      borderRadius: "5px",
      border: "1px solid #ccc",
      boxSizing: "border-box"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "15px",
      background: "white"
    },
    th: {
      background: "#2563eb",
      color: "white",
      padding: "8px",
      border: "1px solid #ddd"
    },
    td: {
      padding: "6px",
      border: "1px solid #ddd"
    },
    button: {
      padding: "10px 15px",
      marginTop: "15px",
      marginRight: "10px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    },
    addBtn: {
      background: "#2563eb",
      color: "white"
    },
    saveBtn: {
      background: "#16a34a",
      color: "white"
    },
    editBtn: {
      background: "#0b61f5",
      color: "white",
      padding: "4px 8px",
      marginRight: "4px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer"
    },
    deleteBtn: {
      background: "#dc2626",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer"
    },
    searchBox: {
      padding: "7px",
      width: "250px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "10px"
    }
  };

  /* ---------------- STATE ---------------- */

  const [materials, setMaterials] = useState([]);
  const [prs, setPRs] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [header, setHeader] = useState({
    req_date: "",
    requester: "",
    uom: "",
    batch: "",
    plant: "",
    purchase_org: ""
  });

  const [items, setItems] = useState([
    { material_id: "", qty: "", required_date: "", remarks: "" }
  ]);

  /* ---------------- LOAD DATA ---------------- */

  const loadPRs = async () => {
    const res = await prApi.getAll();
    setPRs(res.data);
  };

  const loadMaterials = async () => {
    const res = await materialApi.getAll();
    setMaterials(res.data);
  };

  useEffect(() => {
    loadPRs();
    loadMaterials();
  }, []);

  /* ---------------- HANDLERS ---------------- */

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
    setItems((prev) => [
      ...prev,
      { material_id: "", qty: "", required_date: "", remarks: "" }
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setHeader({
      req_date: "",
      requester: "",
      uom: "",
      batch: "",
      plant: "",
      purchase_org: ""
    });
    setItems([{ material_id: "", qty: "", required_date: "", remarks: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      header,
      items: items
        .filter((i) => i.material_id && i.qty)
        .map((i) => ({
          ...i,
          qty: Number(i.qty)
        }))
    };

    if (editingId) {
      await prApi.update(editingId, payload);
      alert("PR Updated");
    } else {
      const res = await prApi.create(payload);
      alert(`PR Created : ${res.data.req_no}`);
    }

    resetForm();
    loadPRs();
  };

  const editPR = async (pr) => {
    setEditingId(pr.id);
    try {
      const res = await prApi.getById(pr.id);
      const { header: h, items: its } = res.data;

      setHeader({
        req_date: h.req_date || "",
        requester: h.requester || "",
        uom: h.uom || "",
        batch: h.batch || "",
        plant: h.plant || "",
        purchase_org: h.purchase_org || ""
      });

      setItems(
        (its || []).map((it) => ({
          material_id: String(it.material_id),
          qty: String(it.qty),
          required_date: it.required_date || "",
          remarks: it.remarks || ""
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deletePR = async (id) => {
    if (!window.confirm("Delete this PR?")) return;
    await prApi.deleteById(id);
    if (editingId === id) resetForm();
    loadPRs();
  };

  const filteredPRs = prs.filter((pr) => {
    const term = search.toLowerCase();
    return (
      pr.req_no?.toLowerCase().includes(term) ||
      pr.requester?.toLowerCase().includes(term)
    );
  });

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Purchase Requisition</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Req No</label>
          <input
            style={styles.input}
            value={editingId ? "(Editing existing PR)" : "Auto Generated"}
            disabled
          />
        </div>

        {/* Row 1: Req Date + Requestor */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>Req Date</label>
            <input
              style={styles.input}
              type="date"
              name="req_date"
              value={header.req_date}
              onChange={handleHeaderChange}
              required
            />
          </div>

          <div style={styles.formCol}>
            <label style={styles.label}>Requestor</label>
            <input
              style={styles.input}
              name="requester"
              value={header.requester}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Row 2: UOM + Batch */}
        <div style={styles.formRow}>
          <div style={styles.formCol}>
            <label style={styles.label}>UOM</label>
            <input
              style={styles.input}
              name="uom"
              value={header.uom}
              onChange={handleHeaderChange}
            />
          </div>

          <div style={styles.formCol}>
            <label style={styles.label}>Batch</label>
            <input
              style={styles.input}
              name="batch"
              value={header.batch}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Row 3: Plant + Purchase Org */}
        <div style={styles.formRow}>
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
            <label style={styles.label}>Purchase Organization</label>
            <input
              style={styles.input}
              name="purchase_org"
              value={header.purchase_org}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* -------- ITEMS TABLE -------- */}
        <h4>Items</h4>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "35%" }}>Material</th>
              <th style={{ ...styles.th, width: "15%" }}>Qty</th>
              <th style={{ ...styles.th, width: "25%" }}>Required Date</th>
              <th style={{ ...styles.th, width: "25%" }}>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td style={styles.td}>
                  <select
                    style={styles.input}
                    value={it.material_id}
                    onChange={(e) => {
                      const materialId = e.target.value;
                      const selectedMaterial = materials.find(
                        (m) => String(m.id) === materialId
                      );

                      setItems((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? {
                                ...row,
                                material_id: materialId,
                                qty:
                                  selectedMaterial &&
                                  selectedMaterial.qty != null
                                    ? String(selectedMaterial.qty)
                                    : ""
                              }
                            : row
                        )
                      );
                    }}
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

                <td style={styles.td}>
                  <input
                    style={styles.input}
                    type="date"
                    value={it.required_date}
                    onChange={(e) =>
                      handleItemChange(idx, "required_date", e.target.value)
                    }
                  />
                </td>

                <td style={styles.td}>
                  <input
                    style={styles.input}
                    value={it.remarks}
                    onChange={(e) =>
                      handleItemChange(idx, "remarks", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
          {editingId ? "Update PR" : "Save PR"}
        </button>
      </form>

      {/* -------- EXISTING PR TABLE -------- */}
      <h3 style={{ marginTop: "30px" }}>Existing PRs</h3>

      <input
        style={styles.searchBox}
        placeholder="Search by PR No / Requestor"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>PR No</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Requestor</th>
            <th style={styles.th}>UOM</th>
            <th style={styles.th}>Batch</th>
            <th style={styles.th}>Plant</th>
            <th style={styles.th}>Purchase Org</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Items</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredPRs.map((pr) => (
            <tr key={pr.id}>
              <td style={styles.td}>{pr.req_no}</td>
              <td style={styles.td}>{pr.req_date}</td>
              <td style={styles.td}>{pr.requester}</td>
              <td style={styles.td}>{pr.uom}</td>
              <td style={styles.td}>{pr.batch}</td>
              <td style={styles.td}>{pr.plant}</td>
              <td style={styles.td}>{pr.purchase_org}</td>
              <td style={styles.td}>{pr.total_qty}</td>
              <td style={styles.td}>{pr.item_count}</td>
              <td style={styles.td}>
                <button
                  style={styles.editBtn}
                  type="button"
                  onClick={() => editPR(pr)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteBtn}
                  type="button"
                  onClick={() => deletePR(pr.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredPRs.length === 0 && (
            <tr>
              <td style={styles.td} colSpan={10}>
                No PRs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
