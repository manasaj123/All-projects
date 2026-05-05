// frontend/src/pages/PreSalesActivities.js
import React, { useEffect, useState } from 'react';
import {
  getInquiries,
  createInquiry,
  updateInquiry,
  softDeleteInquiry,
} from '../services/inquiryService';
import { getCustomers } from '../services/customerService';

function PreSalesActivities() {
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    inquiryType: 'IN',
    salesOrg: '',
    distributionChannel: '',
    division: '',
    soldToPartyId: '',
    shipToPartyId: '',
    materialCode: '',
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

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateInquiry(editingId, form);
        setEditingId(null);
      } else {
        await createInquiry(form);
      }
      setForm({
        inquiryType: 'IN',
        salesOrg: '',
        distributionChannel: '',
        division: '',
        soldToPartyId: '',
        shipToPartyId: '',
        materialCode: '',
        quantity: 1,
      });
      loadInquiries();
    } catch (err) {
      console.error('Save inquiry error:', err);
    }
  };

  const handleEdit = inq => {
    setEditingId(inq.id);
    setForm({
      inquiryType: inq.inquiryType,
      salesOrg: inq.salesOrg,
      distributionChannel: inq.distributionChannel,
      division: inq.division,
      soldToPartyId: inq.soldToPartyId,
      shipToPartyId: inq.shipToPartyId,
      materialCode: inq.materialCode || '',
      quantity: inq.quantity,
    });
  };

  const handleDelete = async id => {
    await softDeleteInquiry(id);
    loadInquiries();
  };

  const displayCustomer = id => {
    const c = customers.find(x => x.id === Number(id));
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
            />
          </div>
          <div className="form-row">
            <input
              name="salesOrg"
              value={form.salesOrg}
              onChange={handleChange}
              placeholder="Sales Org"
            />
          </div>
          <div className="form-row">
            <input
              name="distributionChannel"
              value={form.distributionChannel}
              onChange={handleChange}
              placeholder="Dist. Channel"
            />
          </div>
          <div className="form-row">
            <input
              name="division"
              value={form.division}
              onChange={handleChange}
              placeholder="Division"
            />
          </div>
          <div className="form-row">
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
          </div>
          <div className="form-row">
            <input
              name="materialCode"
              value={form.materialCode}
              onChange={handleChange}
              placeholder="Material Code"
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Qty"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn">
            {editingId ? 'Update Inquiry' : 'Create Inquiry'}
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
          {inquiries.map(inq => (
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
