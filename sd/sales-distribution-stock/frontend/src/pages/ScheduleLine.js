// frontend/src/pages/ScheduleLine.js
import React, { useEffect, useState } from 'react';
import {
  getScheduleLines,
  getDeletedScheduleLines,
  createScheduleLine,
  updateScheduleLine,
  softDeleteScheduleLine,
  restoreScheduleLine,
} from '../services/scheduleLineService';

const initialForm = {
  scheduleLineCategory: '',
  description: '',
  requirementRelevant: '',
  availabilityCheck: '',
  movementType: '',
};

const ScheduleLine = () => {
  const [lines, setLines] = useState([]);
  const [deletedLines, setDeletedLines] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        getScheduleLines(),
        getDeletedScheduleLines(),
      ]);
      setLines(activeRes.data);
      setDeletedLines(deletedRes.data);
    } catch (err) {
      console.error('Error loading schedule lines', err);
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.scheduleLineCategory) {
      alert('Enter schedule line category');
      return;
    }

    const payload = { ...formData };

    try {
      if (editingId) {
        await updateScheduleLine(editingId, payload);
      } else {
        await createScheduleLine(payload);
      }
      setFormData(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Error saving schedule line', err);
    }
  };

  const handleEdit = row => {
    setEditingId(row.id);
    setFormData({
      scheduleLineCategory: row.scheduleLineCategory || '',
      description: row.description || '',
      requirementRelevant: row.requirementRelevant || '',
      availabilityCheck: row.availabilityCheck || '',
      movementType: row.movementType || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSoftDelete = async id => {
    if (!window.confirm('Move this schedule line to recycle bin?')) return;
    try {
      await softDeleteScheduleLine(id);
      loadData();
    } catch (err) {
      console.error('Error deleting schedule line', err);
    }
  };

  const handleRestore = async id => {
    try {
      await restoreScheduleLine(id);
      loadData();
    } catch (err) {
      console.error('Error restoring schedule line', err);
    }
  };

  const currentList = showDeleted ? deletedLines : lines;

  return (
    <div className="page-container">
      <h2>Schedule Line Categories</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Schedule Line Category</label>
          <input
            name="scheduleLineCategory"
            value={formData.scheduleLineCategory}
            onChange={handleChange}
            required
            disabled={!!editingId}
          />
        </div>
        <div className="form-row">
          <label>Description</label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Requirement Relevant</label>
          <input
            name="requirementRelevant"
            value={formData.requirementRelevant}
            onChange={handleChange}
            placeholder="Y / N"
          />
        </div>
        <div className="form-row">
          <label>Availability Check</label>
          <input
            name="availabilityCheck"
            value={formData.availabilityCheck}
            onChange={handleChange}
            placeholder="e.g. 01, 02"
          />
        </div>
        <div className="form-row">
          <label>Movement Type</label>
          <input
            name="movementType"
            value={formData.movementType}
            onChange={handleChange}
            placeholder="e.g. 601"
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingId ? 'Update Schedule Line' : 'Create Schedule Line'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="list-header">
        <h3>{showDeleted ? 'Recycle Bin' : 'Active Schedule Line Categories'}</h3>
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
              <th>Schedule Line Category</th>
              <th>Description</th>
              <th>Requirement Relevant</th>
              <th>Availability Check</th>
              <th>Movement Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(row => (
              <tr key={row.id}>
                <td>{row.scheduleLineCategory}</td>
                <td>{row.description}</td>
                <td>{row.requirementRelevant}</td>
                <td>{row.availabilityCheck}</td>
                <td>{row.movementType}</td>
                <td>
                  {!showDeleted && (
                    <>
                      <button onClick={() => handleEdit(row)}>Edit</button>
                      <button onClick={() => handleSoftDelete(row.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button onClick={() => handleRestore(row.id)}>
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

export default ScheduleLine;
