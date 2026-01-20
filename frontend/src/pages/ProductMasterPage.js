import React, { useEffect, useState } from "react";
import productApi from "../api/productApi";

function ProductMasterPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await productApi.list();
    setRows(data);
  };

  const handleCreate = async () => {
    if (!code || !name) return;
    await productApi.create({ code, name });
    setCode("");
    setName("");
    await load();
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
        }

        input {
          padding: 8px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
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
      `}</style>

      <h2>Products</h2>

      <div className="form-row">
        <input
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreate}>Add Product</button>
      </div>

      <table className="pp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.code}</td>
              <td>{r.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductMasterPage;
