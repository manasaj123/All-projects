import React, { useEffect, useState } from "react";
import productApi from "../api/productApi";

function ProductMasterPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productApi.list();
      setRows(data);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateCode = (value) => {
    const codeRegex = /^[a-zA-Z0-9]+$/;
    return codeRegex.test(value);
  };

  const validateName = (value) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(value);
  };

  const validateForm = (codeVal, nameVal) => {
    if (!codeVal.trim() || !nameVal.trim()) {
      setError("Both Code and Name are required.");
      return false;
    }

    if (!validateCode(codeVal.trim())) {
      setError("Code must contain only letters and numbers (no special characters).");
      return false;
    }

    if (!validateName(nameVal.trim())) {
      setError("Name must contain only letters and spaces.");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    setError("");
    setSuccessMsg("");

    if (!validateForm(code, name)) return;

    // Check for duplicate code
    const duplicate = rows.find(
      (r) => r.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (duplicate) {
      setError(`Product with code "${code.trim()}" already exists!`);
      return;
    }

    setLoading(true);
    try {
      await productApi.create({ 
        code: code.trim(), 
        name: name.trim() 
      });
      
      setSuccessMsg(`Product "${code.trim()}" added successfully!`);
      setCode("");
      setName("");
      await load();
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create product. Please try again.";
      setError(errorMsg);
      console.error("Create error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditCode(row.code);
    setEditName(row.name);
    setError("");
    setSuccessMsg("");
  };

  const handleUpdate = async () => {
    setError("");
    setSuccessMsg("");

    if (!validateForm(editCode, editName)) return;

    // Check for duplicate code (excluding current editing item)
    const duplicate = rows.find(
      (r) => r.id !== editingId && 
           r.code.toLowerCase() === editCode.trim().toLowerCase()
    );
    if (duplicate) {
      setError(`Product with code "${editCode.trim()}" already exists!`);
      return;
    }

    setLoading(true);
    try {
      await productApi.update(editingId, {
        code: editCode.trim(),
        name: editName.trim()
      });
      
      setSuccessMsg("Product updated successfully!");
      setEditingId(null);
      setEditCode("");
      setEditName("");
      await load();
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update product. Please try again.";
      setError(errorMsg);
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    setError("");
    setSuccessMsg("");
    setLoading(true);
    
    try {
      await productApi.delete(id);
      setSuccessMsg("Product deleted successfully!");
      await load();
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCode("");
    setEditName("");
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingId) {
        handleUpdate();
      } else {
        handleCreate();
      }
    }
  };

  const handleCodeChange = (value, isEdit = false) => {
    // Only allow letters and numbers
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
    if (isEdit) {
      setEditCode(sanitized);
    } else {
      setCode(sanitized);
    }
    setError("");
  };

  const handleNameChange = (value, isEdit = false) => {
    // Only allow letters and spaces
    const sanitized = value.replace(/[^a-zA-Z\s]/g, '');
    if (isEdit) {
      setEditName(sanitized);
    } else {
      setName(sanitized);
    }
    setError("");
  };

  return (
    <div className="pp-container">
      
      <style>{`
        .pp-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        h2 {
          margin-bottom: 16px;
          color: #333;
        }

        .form-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          align-items: center;
        }

        input {
          padding: 8px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.3s;
        }

        input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        input.error {
          border-color: #dc3545;
        }

        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s, opacity 0.3s;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-success {
          background-color: #28a745;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #218838;
        }

        .btn-warning {
          background-color: #0730ff;
          color: #f6efef;
        }

        .btn-warning:hover:not(:disabled) {
          background-color: #3100e0;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #c82333;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .pp-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .pp-table th,
        .pp-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .pp-table th {
          background-color: #f4f6f8;
        }

        .pp-table tr:nth-child(even) {
          background-color: #fafafa;
        }

        .pp-table tr:hover {
          background-color: #f1f1f1;
        }

        .message {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease-in;
        }

        .message-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stats {
          background-color: #e7f3ff;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          color: #004085;
        }

        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
      `}</style>

      <h2>Products</h2>

      {/* Messages */}
      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="message message-success">
          {successMsg}
        </div>
      )}
      {loading && !rows.length && (
        <div className="message message-info">
          <div className="loading-spinner"></div>
          Loading products...
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        Total Products: <strong>{rows.length}</strong>
      </div>

      {/* Create Form */}
      <div className="form-row">
        <div>
          <input
            className={error && !code ? "error" : ""}
            placeholder="Code (letters and numbers only)"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={editingId !== null}
          />
          
        </div>
        <div>
          <input
            className={error && !name ? "error" : ""}
            placeholder="Name (letters only)"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={editingId !== null}
          />
          
        </div>
        <button 
          className="btn-primary"
          onClick={handleCreate} 
          disabled={loading || editingId !== null}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>

      {/* Products Table */}
      <table className="pp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && !loading ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "#666" }}>
                No products found. Add your first product!
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  {editingId === r.id ? (
                    <input
                      className={error ? "error" : ""}
                      value={editCode}
                      onChange={(e) => handleCodeChange(e.target.value, true)}
                      onKeyPress={handleKeyPress}
                      placeholder="Code"
                    />
                  ) : (
                    r.code
                  )}
                </td>
                <td>
                  {editingId === r.id ? (
                    <input
                      className={error ? "error" : ""}
                      value={editName}
                      onChange={(e) => handleNameChange(e.target.value, true)}
                      onKeyPress={handleKeyPress}
                      placeholder="Name"
                    />
                  ) : (
                    r.name
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === r.id ? (
                      <>
                        <button 
                          className="btn-success"
                          onClick={handleUpdate}
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-warning"
                          onClick={() => handleEdit(r)}
                          disabled={loading || editingId !== null}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleDelete(r.id)}
                          disabled={loading || editingId !== null}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductMasterPage;