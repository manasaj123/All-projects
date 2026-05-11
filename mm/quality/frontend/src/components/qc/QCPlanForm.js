import React, { useEffect, useState } from "react";
import qcMasterApi from "../../api/qcMasterApi";

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e5e7eb"
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "#e0e7ff",
    color: "#3730a3"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    fontWeight: "600",
    color: "#374151"
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f3f4f6"
  },
  input: {
    padding: "6px 8px",
    fontSize: "13px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  },
  select: {
    padding: "6px 8px",
    fontSize: "13px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
    outline: "none"
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer"
  },
  buttonPrimary: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500"
  },
  buttonSecondary: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "500",
    marginLeft: "8px"
  },
  buttonDanger: {
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#fff",
    cursor: "pointer"
  },
  addButton: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px dashed #2563eb",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    marginTop: "16px",
    width: "100%"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af"
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280"
  },
  error: {
    padding: "10px 16px",
    borderRadius: "6px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    fontSize: "13px",
    marginBottom: "16px"
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb"
  },
  requiredMark: {
    color: "#ef4444",
    marginLeft: "2px"
  }
};

export default function QCPlanForm({ materialId, mode = "view", onSave }) {
  const [params, setParams] = useState([]);
  const [originalParams, setOriginalParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!materialId) return;
      
      setLoading(true);
      setError("");
      
      try {
        const res = await qcMasterApi.getTemplate(materialId);
        const data = res.data || [];
        setParams(data);
        setOriginalParams(JSON.parse(JSON.stringify(data))); // Deep copy
      } catch (err) {
        setError("Failed to load QC plan");
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [materialId]);

  const handleParamChange = (index, field, value) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: value };
    setParams(updated);
    setHasChanges(true);
  };

  const addNewParam = () => {
    const newParam = {
      parameter_id: null, // New parameter
      parameter_name: "",
      unit: "",
      lower_spec_limit: "",
      upper_spec_limit: "",
      required: true,
      isNew: true
    };
    setParams([...params, newParam]);
    setHasChanges(true);
  };

  const removeParam = (index) => {
    if (window.confirm("Are you sure you want to remove this parameter?")) {
      const updated = params.filter((_, i) => i !== index);
      setParams(updated);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    // Validate
    for (const p of params) {
      if (!p.parameter_name.trim()) {
        setError("All parameters must have a name");
        return;
      }
    }
    
    setSaving(true);
    setError("");
    
    try {
      await qcMasterApi.saveTemplate(materialId, params);
      setOriginalParams(JSON.parse(JSON.stringify(params)));
      setHasChanges(false);
      if (onSave) onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save QC plan");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm("Discard changes?")) return;
    setParams(JSON.parse(JSON.stringify(originalParams)));
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingText}>
        Loading QC Plan for Material #{materialId}...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          QC Plan: Material #{materialId}
          <span style={{...styles.badge, marginLeft: "12px"}}>
            {params.length} Parameters
          </span>
        </h3>
        {mode === "edit" && (
          <span style={{ fontSize: "12px", color: "#d97706" }}>
            {hasChanges ? "⚠ Unsaved changes" : "✓ Saved"}
          </span>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {params.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📝</div>
          <p>No quality parameters defined for this material.</p>
          {mode === "edit" && (
            <button style={styles.buttonPrimary} onClick={addNewParam}>
              + Add First Parameter
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>
                  Parameter Name
                  {mode === "edit" && <span style={styles.requiredMark}>*</span>}
                </th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Lower Limit</th>
                <th style={styles.th}>Upper Limit</th>
                <th style={styles.th}>Required</th>
                {mode === "edit" && <th style={styles.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {params.map((p, idx) => (
                <tr key={p.parameter_id || idx}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        value={p.parameter_name}
                        onChange={e => handleParamChange(idx, "parameter_name", e.target.value)}
                        placeholder="Parameter name"
                      />
                    ) : (
                      <strong>{p.parameter_name}</strong>
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        value={p.unit || ""}
                        onChange={e => handleParamChange(idx, "unit", e.target.value)}
                        placeholder="e.g., mm, kg"
                      />
                    ) : (
                      p.unit || "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        type="number"
                        step="any"
                        value={p.lower_spec_limit ?? ""}
                        onChange={e => handleParamChange(idx, "lower_spec_limit", e.target.value)}
                        placeholder="Min"
                      />
                    ) : (
                      p.lower_spec_limit ?? "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        type="number"
                        step="any"
                        value={p.upper_spec_limit ?? ""}
                        onChange={e => handleParamChange(idx, "upper_spec_limit", e.target.value)}
                        placeholder="Max"
                      />
                    ) : (
                      p.upper_spec_limit ?? "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={p.required}
                        onChange={e => handleParamChange(idx, "required", e.target.checked)}
                      />
                    ) : (
                      p.required ? "✅ Yes" : "❌ No"
                    )}
                  </td>
                  {mode === "edit" && (
                    <td style={styles.td}>
                      <button
                        style={styles.buttonDanger}
                        onClick={() => removeParam(idx)}
                        title="Remove parameter"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Parameter Button (Edit Mode) */}
      {mode === "edit" && (
        <button style={styles.addButton} onClick={addNewParam}>
          + Add Parameter
        </button>
      )}

      {/* Save/Cancel Buttons (Edit Mode) */}
      {mode === "edit" && hasChanges && (
        <div style={styles.actionsRow}>
          <button style={styles.buttonSecondary} onClick={handleCancel}>
            Cancel
          </button>
          <button 
            style={styles.buttonPrimary} 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}