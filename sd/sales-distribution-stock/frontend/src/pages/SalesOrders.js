// frontend/src/pages/SalesOrders.js
import React, { useEffect, useState } from 'react';
import {
  getSalesOrders,
  getDeletedSalesOrders,
  createSalesOrder,
  updateSalesOrder,
  softDeleteSalesOrder,
  restoreSalesOrder,
  getCustomers,
  getInquiries,
  getQuotations,
  getMaterials,
} from '../services/salesOrderService';

const initialForm = {
  orderType: '',
  salesOrg: '',
  distributionChannel: '',
  division: '',
  referenceInquiryId: '',
  referenceQuotationId: '',
  soldToPartyId: '',
  shipToPartyId: '',
};

const initialItem = {
  materialId: '',
  quantity: '',
  uom: '',
};

const SalesOrders = () => {
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [orders, setOrders] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState(initialItem);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        custRes,
        inqRes,
        quoRes,
        matRes,
        activeRes,
        deletedRes,
      ] = await Promise.all([
        getCustomers(),
        getInquiries(),
        getQuotations(),
        getMaterials(),
        getSalesOrders(),
        getDeletedSalesOrders(),
      ]);
      setCustomers(custRes.data);
      setInquiries(inqRes.data);
      setQuotations(quoRes.data);
      setMaterials(matRes.data);
      setOrders(activeRes.data);
      setDeletedOrders(deletedRes.data);
    } catch (err) {
      console.error('Error loading sales orders', err);
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
    if (!formData.orderType) {
      alert('Enter order type');
      return;
    }
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
        await updateSalesOrder(editingId, payload);
      } else {
        await createSalesOrder(payload);
      }
      setFormData(initialForm);
      setItems([]);
      setItemForm(initialItem);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving sales order', err);
    }
  };

  const handleEdit = order => {
    setEditingId(order.id);
    setFormData({
      orderType: order.orderType || '',
      salesOrg: order.salesOrg || '',
      distributionChannel: order.distributionChannel || '',
      division: order.division || '',
      referenceInquiryId: order.referenceInquiryId || '',
      referenceQuotationId: order.referenceQuotationId || '',
      soldToPartyId: order.soldToPartyId || '',
      shipToPartyId: order.shipToPartyId || '',
    });
    let parsedItems = [];
    try {
      parsedItems = order.itemsJson ? JSON.parse(order.itemsJson) : [];
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
    if (!window.confirm('Move this sales order to recycle bin?')) return;
    try {
      await softDeleteSalesOrder(id);
      loadData();
    } catch (err) {
      console.error('Error deleting sales order', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreSalesOrder(id);
      loadData();
    } catch (err) {
      console.error('Error restoring sales order', err);
    }
  };

  const currentList = showDeleted ? deletedOrders : orders;

  const displayCustomerName = id => {
    const c = customers.find(x => x.id === id);
    return c ? `${c.customerCode} - ${c.name}` : id;
  };

  const displayInquiryRef = id => {
    const i = inquiries.find(x => x.id === id);
    return i ? `INQ-${i.id}` : id;
  };

  const displayQuotationRef = id => {
    const q = quotations.find(x => x.id === id);
    return q ? `QT-${q.id}` : id;
  };

  const displayItemsSummary = order => {
    try {
      const arr = order.itemsJson ? JSON.parse(order.itemsJson) : [];
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
      <h2>Sales Orders</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h4>Header</h4>
        <div className="form-row">
          <label>Order Type</label>
          <input
            name="orderType"
            value={formData.orderType}
            onChange={handleChange}
            placeholder="e.g. OR, SO"
            required
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

        <h4>Reference</h4>
        <div className="form-row">
          <label>Reference Inquiry</label>
          <select
            name="referenceInquiryId"
            value={formData.referenceInquiryId}
            onChange={handleChange}
          >
            <option value="">None</option>
            {inquiries.map(i => (
              <option key={i.id} value={i.id}>
                INQ-{i.id}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Reference Quotation</label>
          <select
            name="referenceQuotationId"
            value={formData.referenceQuotationId}
            onChange={handleChange}
          >
            <option value="">None</option>
            {quotations.map(q => (
              <option key={q.id} value={q.id}>
                QT-{q.id}
              </option>
            ))}
          </select>
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
            {editingId ? 'Update Sales Order' : 'Create Sales Order'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Sales Orders'}</h3>
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
              <th>Order Type</th>
              <th>Sales Org</th>
              <th>Dist. Channel</th>
              <th>Division</th>
              <th>Sold-To</th>
              <th>Ship-To</th>
              <th>Ref Inquiry</th>
              <th>Ref Quotation</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(order => (
              <tr key={order.id}>
                <td>{order.orderType}</td>
                <td>{order.salesOrg}</td>
                <td>{order.distributionChannel}</td>
                <td>{order.division}</td>
                <td>{displayCustomerName(order.soldToPartyId)}</td>
                <td>{displayCustomerName(order.shipToPartyId)}</td>
                <td>
                  {order.referenceInquiryId &&
                    displayInquiryRef(order.referenceInquiryId)}
                </td>
                <td>
                  {order.referenceQuotationId &&
                    displayQuotationRef(order.referenceQuotationId)}
                </td>
                <td>{displayItemsSummary(order)}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(order)}>Edit</button>
                      <button onClick={() => handleSoftDelete(order.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(order.id)}>
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

export default SalesOrders;
