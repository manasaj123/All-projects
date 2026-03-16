import React, { useEffect, useState, useCallback } from "react";

const formRowStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
  flexWrap: "wrap"
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "13px",
  color: "#1f2937",
  flex: 1,
  minWidth: "180px"
};

const inputStyle = {
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "6px",
  border: "2px solid #e5e7eb",
  backgroundColor: "#fafbfc",
  transition: "all 0.2s",
  outline: "none"
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer"
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s",
  marginRight: "8px"
};

const primaryBtnStyle = {
  ...buttonStyle,
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
};

const cancelBtnStyle = {
  ...buttonStyle,
  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(107, 114, 128, 0.3)"
};

const getDefaultFormState = () => ({
  material_number: "",
  industry_sector: "",
  material_type: "",
  material_group: "",
  storage_type: "",
  warehouse_number: "",
  sales_org: "",
  storage_location: "",
  distribution_channel: "",
  gross_weight: "",
  net_weight: "",
  name: "",
  uom: "",
  shelf_life_days: "",
  valuation_method: "MOVING_AVG",
  issue_type: "FIFO",
  perishable: false,
  qty: ""
});

export default function MaterialForm({ onSave, editingMaterial, onCancelEdit }) {
  const [form, setForm] = useState(getDefaultFormState);

  const safeString = useCallback((val) => {
    if (val === null || val === undefined || val === "") return "";
    return String(val);
  }, []);

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        material_number: safeString(editingMaterial.material_number),
        industry_sector: safeString(editingMaterial.industry_sector),
        material_type: safeString(editingMaterial.material_type),
        material_group: safeString(editingMaterial.material_group),
        storage_type: safeString(editingMaterial.storage_type),
        warehouse_number: safeString(editingMaterial.warehouse_number),
        sales_org: safeString(editingMaterial.sales_org),
        storage_location: safeString(editingMaterial.storage_location),
        distribution_channel: safeString(editingMaterial.distribution_channel),
        gross_weight: safeString(editingMaterial.gross_weight),
        net_weight: safeString(editingMaterial.net_weight),
        name: safeString(editingMaterial.name),
        uom: safeString(editingMaterial.uom),
        shelf_life_days: safeString(editingMaterial.shelf_life_days),
        valuation_method:
          safeString(editingMaterial.valuation_method) || "MOVING_AVG",
        issue_type: safeString(editingMaterial.issue_type) || "FIFO",
        perishable: !!editingMaterial.perishable,
        qty: safeString(editingMaterial.qty)
      });
    } else {
      setForm(getDefaultFormState());
    }
  }, [editingMaterial, safeString]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const ControlledInput = ({ name, value, ...props }) => (
    <input
      name={name}
      value={safeString(value)}
      onChange={handleChange}
      style={inputStyle}
      {...props}
    />
  );

  const ControlledSelect = ({ name, value, children, ...props }) => (
    <select
      name={name}
      value={safeString(value)}
      onChange={handleChange}
      style={selectStyle}
      {...props}
    >
      {children}
    </select>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const basePayload = {
      industry_sector: form.industry_sector || null,
      material_type: form.material_type || null,
      material_group: form.material_group || null,
      storage_type: form.storage_type || null,
      warehouse_number: form.warehouse_number || null,
      sales_org: form.sales_org || null,
      storage_location: form.storage_location || null,
      distribution_channel: form.distribution_channel || null,
      gross_weight: form.gross_weight ? Number(form.gross_weight) : null,
      net_weight: form.net_weight ? Number(form.net_weight) : null,
      name: form.name || null,
      uom: form.uom || null,
      shelf_life_days: form.shelf_life_days
        ? Number(form.shelf_life_days)
        : null,
      valuation_method: form.valuation_method || "MOVING_AVG",
      issue_type: form.issue_type || "FIFO",
      perishable: form.perishable ? 1 : 0,
      qty: form.qty ? Number(form.qty) : null
    };

    const payload = editingMaterial
      ? { ...basePayload, material_number: form.material_number }
      : basePayload;

    await onSave(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}
    >
      {/* Row 1: Material Number + Name + UOM + Qty */}
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Material Number
          <ControlledInput
            name="material_number"
            value={form.material_number || ""}
            readOnly
            placeholder="Auto"
          />
        </label>

        <label style={labelStyle}>
          Name*
          <ControlledInput name="name" value={form.name} required />
        </label>

        <label style={labelStyle}>
          UOM*
          <ControlledInput name="uom" value={form.uom} required />
        </label>

        <label style={labelStyle}>
          Qty
          <ControlledInput
            type="number"
            name="qty"
            value={form.qty}
            min="0"
          />
        </label>
      </div>

      {/* Row 2 */}
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Industry Sector
          <ControlledSelect
            name="industry_sector"
            value={form.industry_sector}
          >
            <option value="">Select Sector</option>
            <option value="CHEMICALS">Chemicals</option>
            <option value="PHARMA">Pharmaceuticals</option>
            <option value="FOOD">Food & Beverages</option>
            <option value="ELECTRONICS">Electronics</option>
          </ControlledSelect>
        </label>

        <label style={labelStyle}>
          Material Type
          <ControlledSelect name="material_type" value={form.material_type}>
            <option value="">Select Type</option>
            <option value="RAW">Raw Material</option>
            <option value="SEMI">Semi-Finished</option>
            <option value="FINISHED">Finished Good</option>
            <option value="OTHER">Other</option>
          </ControlledSelect>
        </label>
      </div>

      {/* Row 3 */}
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Material Group
          <ControlledInput
            name="material_group"
            value={form.material_group}
          />
        </label>
        <label style={labelStyle}>
          Storage Type
          <ControlledSelect name="storage_type" value={form.storage_type}>
            <option value="">Select Type</option>
            <option value="BULK">Bulk</option>
            <option value="PALLET">Pallet</option>
            <option value="SHELF">Shelf</option>
          </ControlledSelect>
        </label>
        <label style={labelStyle}>
          Warehouse Number
          <ControlledInput
            name="warehouse_number"
            value={form.warehouse_number}
          />
        </label>
      </div>

      {/* Row 4 */}
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Sales Org
          <ControlledInput name="sales_org" value={form.sales_org} />
        </label>
        <label style={labelStyle}>
          Storage Location
          <ControlledInput
            name="storage_location"
            value={form.storage_location}
          />
        </label>
        <label style={labelStyle}>
          Distribution Channel
          <ControlledSelect
            name="distribution_channel"
            value={form.distribution_channel}
          >
            <option value="">Select Channel</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
            <option value="EXPORT">Export</option>
          </ControlledSelect>
        </label>
      </div>

      {/* Row 5 */}
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Gross Weight
          <ControlledInput
            type="number"
            step="0.01"
            name="gross_weight"
            value={form.gross_weight}
          />
        </label>
        <label style={labelStyle}>
          Net Weight
          <ControlledInput
            type="number"
            step="0.01"
            name="net_weight"
            value={form.net_weight}
          />
        </label>
        <label style={labelStyle}>
          Shelf Life (days)
          <ControlledInput
            type="number"
            name="shelf_life_days"
            value={form.shelf_life_days}
          />
        </label>
      </div>

      {/* Row 6: Valuation + Issue Type */}
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Valuation Method
          <ControlledSelect
            name="valuation_method"
            value={form.valuation_method}
          >
            <option value="MOVING_AVG">Moving Average</option>
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
          </ControlledSelect>
        </label>
        <label style={labelStyle}>
          Issue Type
          <ControlledSelect name="issue_type" value={form.issue_type}>
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
            <option value="FEFO">FEFO</option>
          </ControlledSelect>
        </label>
      </div>

      {/* Perishable toggle */}
      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
          borderLeft: "4px solid #3b82f6"
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#1e40af"
          }}
        >
          <input
            type="checkbox"
            name="perishable"
            checked={!!form.perishable}
            onChange={handleChange}
          />
          <span>Perishable item (has expiry date)</span>
        </label>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          type="submit"
          style={primaryBtnStyle}
          onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.target.style.transform = "none")}
        >
          {editingMaterial ? "Update Material" : "Save Material"}
        </button>
        {editingMaterial && (
          <button
            type="button"
            style={cancelBtnStyle}
            onClick={onCancelEdit}
            onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.target.style.transform = "none")}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
