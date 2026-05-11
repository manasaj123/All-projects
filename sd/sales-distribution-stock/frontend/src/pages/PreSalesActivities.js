// frontend/src/pages/PreSalesActivities.js
import React, { useEffect, useState } from "react";
import {
  getInquiries,
  createInquiry,
  updateInquiry,
  softDeleteInquiry,
} from "../services/inquiryService";
import { getCustomers } from "../services/customerService";

function PreSalesActivities() {
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    inquiryType: "IN",
    salesOrg: "",
    distributionChannel: "",
    division: "",
    soldToPartyId: "",
    shipToPartyId: "",
    materialCode: "",
    quantity: 1,
  });
  const [editingId, setEditingId] = useState(null);

  const loadInquiries = async () => {
    const res = await getInquiries();
    setInquiries(res.data);
  };

  const loadCustomers = async () => {
    const res = await getCustomers();
    setCustomers(res.data);
  };

  useEffect(() => {
    loadInquiries();
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Inquiry Type validation
    if (!form.inquiryType.trim()) {
      alert("Inquiry Type is required");
      return;
    }

    // Sales Org validation
    if (!form.salesOrg.trim()) {
      alert("Sales Organization is required");
      return;
    }

    // Distribution Channel validation
    const validChannels = ["01", "02"];

    if (!validChannels.includes(form.distributionChannel)) {
      alert(
        "Invalid Distribution Channel. Use 01 = Electronics or 02 = Machinery",
      );
      return;
    }

    // Division validation
    if (!form.division.trim()) {
      alert("Division is required");
      return;
    }

    // Material validation
    if (!form.materialCode.trim()) {
      alert("Material Code is required");
      return;
    }

    // Inquiry Type format validation
    if (!/^[A-Za-z0-9]+$/.test(form.inquiryType)) {
      alert("Inquiry Type contains invalid characters");
      return;
    }

    // Sales Org format validation
    if (!/^[A-Za-z0-9]+$/.test(form.salesOrg)) {
      alert("Sales Organization should contain only letters and numbers");
      return;
    }

    // Division format validation
    if (!/^[A-Za-z0-9\s]+$/.test(form.division)) {
      alert("Division contains invalid characters");
      return;
    }

    // Material Code format validation
    if (!/^[A-Za-z0-9-]+$/.test(form.materialCode)) {
      alert("Material Code contains invalid characters");
      return;
    }

    // Customer validation
    if (!form.soldToPartyId || !form.shipToPartyId) {
      alert("Select Sold-To and Ship-To Party");
      return;
    }

    // Sold-To and Ship-To should not be same
    if (form.soldToPartyId === form.shipToPartyId) {
      alert("Sold-To Party and Ship-To Party cannot be the same");
      return;
    }

    // Quantity validation
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    // Duplicate inquiry validation
    const duplicate = inquiries.find(
      (inq) =>
        inq.salesOrg === form.salesOrg &&
        inq.distributionChannel === form.distributionChannel &&
        inq.division === form.division &&
        String(inq.soldToPartyId) === String(form.soldToPartyId) &&
        inq.materialCode === form.materialCode &&
        Number(inq.quantity) === Number(form.quantity) &&
        inq.id !== editingId,
    );

    if (duplicate) {
      alert("Duplicate Inquiry already exists");
      return;
    }

    try {
      if (editingId) {
        await updateInquiry(editingId, form);
        setEditingId(null);
      } else {
        await createInquiry(form);
      }

      setForm({
        inquiryType: "IN",
        salesOrg: "",
        distributionChannel: "",
        division: "",
        soldToPartyId: "",
        shipToPartyId: "",
        materialCode: "",
        quantity: 1,
      });

      loadInquiries();
    } catch (err) {
      console.error("Save inquiry error:", err);
    }
  };

  const handleEdit = (inq) => {
    setEditingId(inq.id);
    setForm({
      inquiryType: inq.inquiryType,
      salesOrg: inq.salesOrg,
      distributionChannel: inq.distributionChannel,
      division: inq.division,
      soldToPartyId: inq.soldToPartyId,
      shipToPartyId: inq.shipToPartyId,
      materialCode: inq.materialCode || "",
      quantity: inq.quantity,
    });
  };

  const handleDelete = async (id) => {
    await softDeleteInquiry(id);
    loadInquiries();
  };

  const displayCustomer = (id) => {
    const c = customers.find((x) => x.id === Number(id));
    return c ? `${c.customerCode} - ${c.name}` : id;
  };

  return (
    <div className="page-container">
      <style>{`
        .page-container{
          max-width:900px;
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
        .form-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:8px;
        }
        .form-row{
          display:flex;
          flex-direction:column;
        }
        .form-row input{
          height:32px;
          padding:4px 8px;
          border:1px solid #cbd5e1;
          border-radius:4px;
          font-size:14px;
        }
        .form-row input::placeholder{
          font-size:12px;
        }
        .form-row select{
          height:32px;
          padding:4px 8px;
          border:1px solid #cbd5e1;
          border-radius:4px;
          font-size:14px;
        }
        .form-actions{
          margin-top:12px;
        }
        .btn{
          padding:7px 14px;
          border:none;
          border-radius:4px;
          cursor:pointer;
          color:white;
          font-size:13px;
          background:#2563eb;
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
        .btn-small{
          padding:4px 10px;
          font-size:12px;
          border:none;
          border-radius:4px;
          cursor:pointer;
          color:white;
          margin-right:6px;
        }
        .btn-edit{
          background:#3b82f6;
        }
        .btn-delete{
          background:#f59e0b;
        }
      `}</style>

      <h2>Pre-Sales Activities - Inquiries</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-row">
            <input
              name="inquiryType"
              value={form.inquiryType}
              onChange={handleChange}
              placeholder="Inquiry Type"
              required
            />
          </div>
          <div className="form-row">
            <input
              name="salesOrg"
              value={form.salesOrg}
              onChange={handleChange}
              placeholder="Sales Org"
              required
            />
          </div>
          <div className="form-row">
            {/* <input
              name="distributionChannel"
              value={form.distributionChannel}
              onChange={handleChange}
              placeholder="Dist. Channel"
            /> */}
            <select
              name="distributionChannel"
              value={form.distributionChannel}
              onChange={handleChange}
              required
            >
              <option value="">Select Distribution Channel</option>
              <option value="01">01 - Electronics</option>
              <option value="02">02 - Machinery</option>
            </select>
          </div>
          <div className="form-row">
            <input
              name="division"
              value={form.division}
              onChange={handleChange}
              placeholder="Division"
              required
            />
          </div>
          {/* <div className="form-row">
            <input
              name="soldToPartyId"
              value={form.soldToPartyId}
              onChange={handleChange}
              placeholder="Sold-To-Party (Customer ID)"
            />
          </div>
          <div className="form-row">
            <input
              name="shipToPartyId"
              value={form.shipToPartyId}
              onChange={handleChange}
              placeholder="Ship-To-Party (Customer ID)"
            />
          </div> */}
          <div className="form-row">
            <select
              name="soldToPartyId"
              value={form.soldToPartyId}
              onChange={handleChange}
              required
            >
              <option value="">Select Sold-To Party</option>

              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerCode} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <select
              name="shipToPartyId"
              value={form.shipToPartyId}
              onChange={handleChange}
              required
            >
              <option value="">Select Ship-To Party</option>

              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerCode} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              name="materialCode"
              value={form.materialCode}
              onChange={handleChange}
              placeholder="Material Code"
              required
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Qty"
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn">
            {editingId ? "Update Inquiry" : "Create Inquiry"}
          </button>
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Sales Org</th>
            <th>Sold-To</th>
            <th>Material</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => (
            <tr key={inq.id}>
              <td>{inq.id}</td>
              <td>{inq.inquiryType}</td>
              <td>{inq.salesOrg}</td>
              <td>{displayCustomer(inq.soldToPartyId)}</td>
              <td>{inq.materialCode}</td>
              <td>{inq.quantity}</td>
              <td>
                <button
                  type="button"
                  className="btn-small btn-edit"
                  onClick={() => handleEdit(inq)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-small btn-delete"
                  onClick={() => handleDelete(inq.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PreSalesActivities;
