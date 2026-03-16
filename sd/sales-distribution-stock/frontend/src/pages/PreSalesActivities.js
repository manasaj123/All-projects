// frontend/src/pages/PreSalesActivities.js
import React, { useEffect, useState } from 'react';


function PreSalesActivities() {
  const [inquiries, setInquiries] = useState([]);
  const [form, setForm] = useState({
    inquiry_type: 'IN',
    sales_org: '',
    distribution_channel: '',
    division: '',
    sold_to_party: '',
    ship_to_party: '',
    material_code: '',
    quantity: 1,
  });
  const [editingId, setEditingId] = useState(null);

  const loadInquiries = async () => {
    const res = await inquiryApi.getAll();
    setInquiries(res.data);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await inquiryApi.update(editingId, form);
      setEditingId(null);
    } else {
      await inquiryApi.create(form);
    }
    setForm({
      inquiry_type: 'IN',
      sales_org: '',
      distribution_channel: '',
      division: '',
      sold_to_party: '',
      ship_to_party: '',
      material_code: '',
      quantity: 1,
    });
    loadInquiries();
  };

  const handleEdit = (inq) => {
    setEditingId(inq.id);
    setForm({
      inquiry_type: inq.inquiry_type,
      sales_org: inq.sales_org,
      distribution_channel: inq.distribution_channel,
      division: inq.division,
      sold_to_party: inq.sold_to_party,
      ship_to_party: inq.ship_to_party,
      material_code: inq.material_code,
      quantity: inq.quantity,
    });
  };

  const handleDelete = async (id) => {
    await inquiryApi.delete(id);
    loadInquiries();
  };

  return (
    <div>
      <h2>Pre-Sales Activities - Inquiries</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="inquiry_type"
          value={form.inquiry_type}
          onChange={handleChange}
          placeholder="Inquiry Type"
        />
        <input
          name="sales_org"
          value={form.sales_org}
          onChange={handleChange}
          placeholder="Sales Org"
        />
        <input
          name="distribution_channel"
          value={form.distribution_channel}
          onChange={handleChange}
          placeholder="Dist. Channel"
        />
        <input
          name="division"
          value={form.division}
          onChange={handleChange}
          placeholder="Division"
        />
        <input
          name="sold_to_party"
          value={form.sold_to_party}
          onChange={handleChange}
          placeholder="Sold-To-Party"
        />
        <input
          name="ship_to_party"
          value={form.ship_to_party}
          onChange={handleChange}
          placeholder="Ship-To-Party"
        />
        <input
          name="material_code"
          value={form.material_code}
          onChange={handleChange}
          placeholder="Material Code"
        />
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Qty"
        />
        <button type="submit">
          {editingId ? 'Update Inquiry' : 'Create Inquiry'}
        </button>
      </form>

      <table>
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
              <td>{inq.inquiry_type}</td>
              <td>{inq.sales_org}</td>
              <td>{inq.sold_to_party}</td>
              <td>{inq.material_code}</td>
              <td>{inq.quantity}</td>
              <td>
                <button onClick={() => handleEdit(inq)}>Edit</button>
                <button onClick={() => handleDelete(inq.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PreSalesActivities;
