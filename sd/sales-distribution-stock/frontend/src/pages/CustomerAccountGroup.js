// frontend/src/pages/CustomerAccountGroup.js
import React, { useEffect, useState } from 'react';
import {
  getCustomerGroups,
  getDeletedCustomerGroups,
  createCustomerGroup,
  updateCustomerGroup,
  softDeleteCustomerGroup,
  restoreCustomerGroup,
} from '../services/customerGroupService';

const initialForm = {
  accountGroup: '',
  name: '',
  fieldStatusGeneral: 'optional',
  fieldStatusCompanyCode: 'optional',
  fieldStatusSales: 'optional',
};

const CustomerAccountGroup = () => {

  const [groups, setGroups] = useState([]);
  const [deletedGroups, setDeletedGroups] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {

      const [activeRes, deletedRes] = await Promise.all([
        getCustomerGroups(),
        getDeletedCustomerGroups(),
      ]);

      setGroups(activeRes.data);
      setDeletedGroups(deletedRes.data);

    } catch (err) {
      console.error('Error loading customer groups', err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {

    e.preventDefault();

    if (!formData.accountGroup || formData.accountGroup.length !== 4) {
      alert('Account Group must be 4 characters');
      return;
    }

    try {

      if (editingId) {
        await updateCustomerGroup(editingId, formData);
      } else {
        await createCustomerGroup(formData);
      }

      setFormData(initialForm);
      setEditingId(null);
      loadData();

    } catch (err) {
      console.error('Error saving customer group', err);
    }
  };

  const handleEdit = group => {

    setEditingId(group.id);

    setFormData({
      accountGroup: group.accountGroup || '',
      name: group.name || '',
      fieldStatusGeneral: group.fieldStatusGeneral || 'optional',
      fieldStatusCompanyCode: group.fieldStatusCompanyCode || 'optional',
      fieldStatusSales: group.fieldStatusSales || 'optional',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {

    if (!window.confirm('Move this customer account group to recycle bin?')) return;

    await softDeleteCustomerGroup(id);
    loadData();
  };

  const handleRestore = async id => {

    await restoreCustomerGroup(id);
    loadData();
  };

  const currentList = showDeleted ? deletedGroups : groups;

  return (

<div className="page-container cag-page">

<style>{`

.cag-page{
max-width:1000px;
margin:auto;
font-family:Segoe UI;
}

/* FORM */

.form-card{
background:white;
padding:20px;
border-radius:6px;
box-shadow:0 2px 6px rgba(0,0,0,0.1);
border:1px solid #e5e7eb;
margin-bottom:20px;
}

.form-row{
display:flex;
flex-direction:column;
margin-bottom:12px;
}

.form-row label{
font-size:14px;
margin-bottom:4px;
color:#374151;
align-self:flex-start;
}

.form-row input,
.form-row select{
width:300px;
height:36px;
padding:6px 10px;
border:1px solid #3b82f6;
border-radius:4px;
font-size:14px;
align-self:flex-start;
}

h4{
margin-top:15px;
margin-bottom:10px;
border-bottom:1px solid #e5e7eb;
padding-bottom:4px;
}

/* BUTTONS */

.form-actions{
margin-top:16px;
display:flex;
gap:10px;
}

button{
padding:6px 14px;
border:none;
border-radius:4px;
cursor:pointer;
font-size:14px;
}

button[type="submit"]{
background:#2563eb;
color:white;
}

button[type="submit"]:hover{
background:#1d4ed8;
}

.form-actions button[type="button"]{
background:#9ca3af;
color:white;
}

.form-actions button[type="button"]:hover{
background:#6b7280;
}

/* HEADER */

.list-header{
display:flex;
justify-content:space-between;
align-items:center;
margin:20px 0;
}

.list-header button{
background:#f97316;
color:white;
}

.list-header button:hover{
background:#ea580c;
}

/* TABLE */

.data-table{
width:100%;
border-collapse:collapse;
background:white;
border:1px solid #e5e7eb;
}

.data-table th{
background:#eef2ff;
padding:8px;
border:1px solid #e5e7eb;
font-size:14px;
}

.data-table td{
padding:8px;
border:1px solid #e5e7eb;
font-size:13px;
}

.data-table tr:nth-child(even){
background:#f9fafb;
}

/* TABLE BUTTONS */

.data-table button{
margin-right:6px;
padding:4px 10px;
font-size:12px;
}

.data-table button:nth-child(1){
background:#3b82f6;
color:white;
}

.data-table button:nth-child(2){
background:#ef4444;
color:white;
}

.data-table button:nth-child(1):hover{
background:#2563eb;
}

.data-table button:nth-child(2):hover{
background:#dc2626;
}

`}</style>

<h2>Customer Account Groups</h2>

<form className="form-card" onSubmit={handleSubmit}>
<div className="form-grid">
<div className="form-row">
<label>Customer Account Group (4-digit)</label>
<input
name="accountGroup"
maxLength={4}
value={formData.accountGroup}
onChange={handleChange}
required
disabled={!!editingId}
/>
</div>

<div className="form-row">
<label>Name (General Data)</label>
<input
name="name"
value={formData.name}
onChange={handleChange}
required
/>
</div>

<h4>Field Status</h4>

<div className="form-row">
<label>General Data</label>
<select
name="fieldStatusGeneral"
value={formData.fieldStatusGeneral}
onChange={handleChange}
>
<option value="required">Required</option>
<option value="optional">Optional</option>
<option value="hidden">Hidden</option>
</select>
</div>

<div className="form-row">
<label>Company Code Data</label>
<select
name="fieldStatusCompanyCode"
value={formData.fieldStatusCompanyCode}
onChange={handleChange}
>
<option value="required">Required</option>
<option value="optional">Optional</option>
<option value="hidden">Hidden</option>
</select>
</div>

<div className="form-row">
<label>Sales Data</label>
<select
name="fieldStatusSales"
value={formData.fieldStatusSales}
onChange={handleChange}
>
<option value="required">Required</option>
<option value="optional">Optional</option>
<option value="hidden">Hidden</option>
</select>
</div>
</div>
<div className="form-actions">

<button type="submit">
{editingId ? 'Update Account Group' : 'Create Account Group'}
</button>

{editingId && (
<button type="button" onClick={handleCancelEdit}>
Cancel
</button>
)}

</div>

</form>

<div className="list-header">

<h3>{showDeleted ? 'Recycle Bin' : 'Active Account Groups'}</h3>

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
<th>Account Group</th>
<th>Name</th>
<th>General Data</th>
<th>Company Code Data</th>
<th>Sales Data</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{currentList.map(g => (

<tr key={g.id}>

<td>{g.accountGroup}</td>
<td>{g.name}</td>
<td>{g.fieldStatusGeneral}</td>
<td>{g.fieldStatusCompanyCode}</td>
<td>{g.fieldStatusSales}</td>

<td>

{!showDeleted && (
<>
<button onClick={() => handleEdit(g)}>Edit</button>
<button onClick={() => handleSoftDelete(g.id)}>Delete</button>
</>
)}

{showDeleted && (
<button onClick={() => handleRestore(g.id)}>Restore</button>
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

export default CustomerAccountGroup;
