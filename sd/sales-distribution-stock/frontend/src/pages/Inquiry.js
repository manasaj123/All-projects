// frontend/src/pages/Inquiry.js
import React, { useEffect, useState } from 'react';
import {
  getInquiries,
  getDeletedInquiries,
  createInquiry,
  updateInquiry,
  softDeleteInquiry,
  restoreInquiry,
  getCustomers,
  getMaterials,
} from '../services/inquiryService';

const initialForm = {
  inquiryType: 'IN',
  salesOrg: '',
  distributionChannel: '',
  division: '',
  soldToPartyId: '',
  shipToPartyId: '',
};

const initialItem = {
  materialId: '',
  quantity: '',
  uom: '',
};

const Inquiry = () => {
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [deletedInquiries, setDeletedInquiries] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState(initialItem);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, matRes, activeRes, deletedRes] = await Promise.all([
        getCustomers(),
        getMaterials(),
        getInquiries(),
        getDeletedInquiries(),
      ]);
      setCustomers(custRes.data);
      setMaterials(matRes.data);
      setInquiries(activeRes.data);
      setDeletedInquiries(deletedRes.data);
    } catch (err) {
      console.error('Error loading inquiry data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = e => {
    const { name, value } = e.target;
    setItemForm(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (!itemForm.materialId || !itemForm.quantity || !itemForm.uom) {
      alert('Fill material, quantity and UoM');
      return;
    }
    setItems(prev => [...prev, { ...itemForm }]);
    setItemForm(initialItem);
  };

  const removeItem = index => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.soldToPartyId || !formData.shipToPartyId) {
      alert('Select Sold-To and Ship-To parties');
      return;
    }
    if (items.length === 0) {
      alert('Add at least one item');
      return;
    }
    const payload = {
      ...formData,
      itemsJson: JSON.stringify(items),
    };
    try {
      if (editingId) {
        await updateInquiry(editingId, payload);
      } else {
        await createInquiry(payload);
      }
      setFormData(initialForm);
      setItems([]);
      setItemForm(initialItem);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving inquiry', err);
    }
  };

  const handleEdit = inq => {
    setEditingId(inq.id);
    setFormData({
      inquiryType: inq.inquiryType || 'IN',
      salesOrg: inq.salesOrg || '',
      distributionChannel: inq.distributionChannel || '',
      division: inq.division || '',
      soldToPartyId: inq.soldToPartyId || '',
      shipToPartyId: inq.shipToPartyId || '',
    });
    let parsedItems = [];
    try {
      parsedItems = inq.itemsJson ? JSON.parse(inq.itemsJson) : [];
    } catch {
      parsedItems = [];
    }
    setItems(parsedItems);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
    setItems([]);
    setItemForm(initialItem);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this inquiry to recycle bin?')) return;
    try {
      await softDeleteInquiry(id);
      loadData();
    } catch (err) {
      console.error('Error deleting inquiry', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreInquiry(id);
      loadData();
    } catch (err) {
      console.error('Error restoring inquiry', err);
    }
  };

  const currentList = showDeleted ? deletedInquiries : inquiries;

  const displayCustomerName = id => {
    const c = customers.find(x => x.id === id);
    return c ? `${c.customerCode} - ${c.name}` : id;
  };

  const displayItemsSummary = inq => {
    try {
      const arr = inq.itemsJson ? JSON.parse(inq.itemsJson) : [];
      if (!Array.isArray(arr) || arr.length === 0) return '';
      return arr
        .map(it => {
          const m = materials.find(mm => mm.id === Number(it.materialId));
          const matLabel = m ? m.materialCode : it.materialId;
          return `${matLabel} (${it.quantity} ${it.uom})`;
        })
        .join(', ');
    } catch {
      return '';
    }
  };

  return (
    <div className="page-container">
      <h2>Pre-Sales Activities – Inquiry</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Header</h4>
        <div className="form-row">
          <label>Inquiry Type</label>
          <input
            name="inquiryType"
            value={formData.inquiryType}
            onChange={handleChange}
          />
        </div>

        <h4>Organizational Data</h4>
        <div className="form-row">
          <label>Sales Organization</label>
          <input
            name="salesOrg"
            value={formData.salesOrg}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Distribution Channel</label>
          <input
            name="distributionChannel"
            value={formData.distributionChannel}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Division</label>
          <input
            name="division"
            value={formData.division}
            onChange={handleChange}
            required
          />
        </div>

        <h4>Partner Functions</h4>
        <div className="form-row">
          <label>Sold-To Party</label>
          <select
            name="soldToPartyId"
            value={formData.soldToPartyId}
            onChange={handleChange}
            required
          >
            <option value="">Select Sold-To Party</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.customerCode} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Ship-To Party</label>
          <select
            name="shipToPartyId"
            value={formData.shipToPartyId}
            onChange={handleChange}
            required
          >
            <option value="">Select Ship-To Party</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.customerCode} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <h4>Items</h4>
        <div className="items-form-row">
          <select
            name="materialId"
            value={itemForm.materialId}
            onChange={handleItemChange}
          >
            <option value="">Material</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.materialCode} - {m.description}
              </option>
            ))}
          </select>
          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Qty"
            value={itemForm.quantity}
            onChange={handleItemChange}
          />
          <input
            name="uom"
            placeholder="UoM"
            value={itemForm.uom}
            onChange={handleItemChange}
          />
          <button type="button" onClick={addItem}>
            Add Item
          </button>
        </div>

        {items.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>UoM</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const m = materials.find(mm => mm.id === Number(it.materialId));
                return (
                  <tr key={idx}>
                    <td>
                      {m
                        ? `${m.materialCode} - ${m.description}`
                        : it.materialId}
                    </td>
                    <td>{it.quantity}</td>
                    <td>{it.uom}</td>
                    <td>
                      <button type="button" onClick={() => removeItem(idx)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Inquiry' : 'Create Inquiry'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Inquiries'}</h3>
        <button onClick={() => setShowDeleted(v => !v)}>
          {showDeleted ? 'Show Active' : 'Show Recycle Bin'}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentList.length === 0 ? (
        <p>No records.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Inquiry Type</th>
              <th>Sales Org</th>
              <th>Dist. Channel</th>
              <th>Division</th>
              <th>Sold-To</th>
              <th>Ship-To</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(inq => (
              <tr key={inq.id}>
                <td>{inq.inquiryType}</td>
                <td>{inq.salesOrg}</td>
                <td>{inq.distributionChannel}</td>
                <td>{inq.division}</td>
                <td>{displayCustomerName(inq.soldToPartyId)}</td>
                <td>{displayCustomerName(inq.shipToPartyId)}</td>
                <td>{displayItemsSummary(inq)}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(inq)}>Edit</button>
                      <button onClick={() => handleSoftDelete(inq.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(inq.id)}>
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Inquiry;
