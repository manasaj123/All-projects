// frontend/src/components/qc/QCLotDetail.js
import React, { useEffect, useState, useCallback } from "react";
import qcLotApi from "../../api/qcLotApi";
import qcMasterApi from "../../api/qcMasterApi";

const inputStyle = {
  padding: "4px 6px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "1px solid #d1d5db"
};

const styles = {
  container: {
    padding: 16,
    fontSize: 13,
    minHeight: "100vh",
    backgroundImage:
      "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(16,185,129,0.15), rgba(239,68,68,0.15))"
  },
  headerBox: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: 13,
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  th: {
    textAlign: "left",
    padding: "6px 8px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb"
  },
  td: {
    padding: "6px 8px",
    borderBottom: "1px solid #f3f4f6"
  },
  defectRow: {
    display: "flex",
    gap: 8,
    marginBottom: 6
  },
  buttonPrimary: {
    padding: "4px 10px",
    fontSize: 13,
    borderRadius: 4,
    border: "1px solid #2563eb",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer"
  },
  buttonGhost: {
    padding: "2px 8px",
    fontSize: 12,
    borderRadius: 4,
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    cursor: "pointer"
  }
};

export default function QCLotDetail({ lotId }) {
  const [lot, setLot] = useState(null);
  const [params, setParams] = useState([]);
  const [results, setResults] = useState({});
  const [decision, setDecision] = useState("ACCEPT");
  const [defects, setDefects] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!lotId) return;

    const lotRes = await qcLotApi.get(lotId);
    setLot(lotRes.data.lot);

    const tmplRes = await qcMasterApi.getTemplate(lotRes.data.lot.material_id);
    setParams(tmplRes.data || []);

    const initial = {};
    (tmplRes.data || []).forEach(p => {
      initial[p.parameter_id] = { value: "", pass_fail: true, remark: "" };
    });
    setResults(initial);
  }, [lotId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResultChange = (paramId, field, value) => {
    setResults(prev => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        [field]: value
      }
    }));
  };

  const addDefectRow = () => {
    setDefects(d => [
      ...d,
      {
        defect_type: "",
        qty_rejected: "",
        unit: lot?.unit || "",
        severity: "MINOR",
        remarks: ""
      }
    ]);
  };

  const updateDefect = (index, field, value) => {
    setDefects(ds =>
      ds.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resultArray = params.map(p => {
        const r = results[p.parameter_id] || {};
        return {
          parameter_id: p.parameter_id,
          measured_value: r.value === "" ? null : Number(r.value),
          unit: p.unit,
          pass_fail: r.pass_fail !== false,
          remark: r.remark || ""
        };
      });

      const payload = {
        decision,
        results: resultArray,
        defects: defects
          .filter(d => d.defect_type && d.qty_rejected)
          .map(d => ({
            defect_type: d.defect_type,
            qty_rejected: Number(d.qty_rejected) || 0,
            unit: d.unit,
            severity: d.severity,
            remarks: d.remarks
          }))
      };

      await qcLotApi.recordResults(lotId, payload);
      alert("QC results saved");
      await load();
    } catch (e) {
      console.error(e);
      alert("Error saving QC results");
    } finally {
      setSaving(false);
    }
  };

  if (!lot) {
    return <div style={{ padding: 16, fontSize: 13 }}>Loading lot...</div>;
  }

  return (
    <div style={styles.container}>
      {/* header */}
      <div style={styles.headerBox}>
        <h3 style={{ margin: "0 0 8px" }}>QC Lot #{lot.id}</h3>
        <div style={styles.headerRow}>
          <div>Material: {lot.material_id}</div>
          <div>Vendor: {lot.vendor_id}</div>
          <div>Batch: {lot.batch_id}</div>
          <div>Stage: {lot.stage}</div>
          <div>Status: {lot.status}</div>
        </div>
      </div>

      {/* Parameters */}
      <div style={styles.sectionTitle}>Parameters</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Parameter</th>
            <th style={styles.th}>Spec</th>
            <th style={styles.th}>Measured</th>
            <th style={styles.th}>Pass?</th>
            <th style={styles.th}>Remark</th>
          </tr>
        </thead>
        <tbody>
          {params.map(p => {
            const r = results[p.parameter_id] || {};
            const spec =
              p.lower_spec_limit != null || p.upper_spec_limit != null
                ? `${p.lower_spec_limit ?? ""} - ${p.upper_spec_limit ?? ""} ${
                    p.unit || ""
                  }`
                : "";
            return (
              <tr key={p.parameter_id}>
                <td style={styles.td}>{p.parameter_name || p.name}</td>
                <td style={styles.td}>{spec}</td>
                <td style={styles.td}>
                  <input
                    style={inputStyle}
                    type="number"
                    value={r.value ?? ""}
                    onChange={e =>
                      handleResultChange(
                        p.parameter_id,
                        "value",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td style={styles.td}>
                  <select
                    style={inputStyle}
                    value={r.pass_fail ? "PASS" : "FAIL"}
                    onChange={e =>
                      handleResultChange(
                        p.parameter_id,
                        "pass_fail",
                        e.target.value === "PASS"
                      )
                    }
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <input
                    style={inputStyle}
                    value={r.remark || ""}
                    onChange={e =>
                      handleResultChange(
                        p.parameter_id,
                        "remark",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Defects */}
      <div style={styles.sectionTitle}>Defects</div>
      <button
        type="button"
        onClick={addDefectRow}
        style={{ ...styles.buttonGhost, marginBottom: 8 }}
      >
        + Add defect
      </button>
      {defects.map((d, idx) => (
        <div key={idx} style={styles.defectRow}>
          <input
            style={inputStyle}
            placeholder="Defect type"
            value={d.defect_type}
            onChange={e => updateDefect(idx, "defect_type", e.target.value)}
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Qty rejected"
            value={d.qty_rejected}
            onChange={e => updateDefect(idx, "qty_rejected", e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Unit"
            value={d.unit}
            onChange={e => updateDefect(idx, "unit", e.target.value)}
          />
          <select
            style={inputStyle}
            value={d.severity}
            onChange={e => updateDefect(idx, "severity", e.target.value)}
          >
            <option value="MINOR">MINOR</option>
            <option value="MAJOR">MAJOR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <input
            style={inputStyle}
            placeholder="Remarks"
            value={d.remarks}
            onChange={e => updateDefect(idx, "remarks", e.target.value)}
          />
        </div>
      ))}

      {/* Decision */}
      <div style={styles.sectionTitle}>Decision</div>
      <select
        style={inputStyle}
        value={decision}
        onChange={e => setDecision(e.target.value)}
      >
        <option value="ACCEPT">ACCEPT</option>
        <option value="REJECT">REJECT</option>
        <option value="ACCEPT_WITH_DEVIATION">ACCEPT WITH DEVIATION</option>
      </select>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={styles.buttonPrimary}
        >
          {saving ? "Saving..." : "Save QC Results"}
        </button>
      </div>
    </div>
  );
}
