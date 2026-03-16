import { useState, useEffect } from "react";
import axios from "axios";
import "./Stock.css";  

export default function Stock() {
  const [materials, setMaterials] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, collectionsRes] = await Promise.all([
        axios.get("http://localhost:5001/api/materials"),
        axios.get("http://localhost:5001/api/collections")
      ]);
      setMaterials(materialsRes.data);
      setCollections(collectionsRes.data);
    } catch (err) {
      console.error("Stock data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStock = (materialId) => {
    let materialCollections = collections.filter(
      (c) => c.materialId === Number(materialId)
    );

    const material = materials.find((m) => m.id === Number(materialId));
    if (!material) return [];

    if (material.issue_type === "FIFO") {
      materialCollections.sort(
        (a, b) => new Date(a.mfgDate) - new Date(b.mfgDate)
      );
    } else {
      materialCollections.sort(
        (a, b) => new Date(b.mfgDate) - new Date(a.mfgDate)
      );
    }
    return materialCollections;
  };

  if (loading) {
    return <div className="container"><h2 className="page-title">Stock</h2><p className="loading">Loading...</p></div>;
  }

  return (
    <div className="container">
      <h2 className="page-title">Stock Management (Smart FIFO/LIFO)</h2>
      
      {materials.length === 0 ? (
        <p className="no-data">No materials added</p>
      ) : (
        <div className="materials-grid">
          {materials.map((m) => {
            const stock = getStock(m.id);
            return (
              <div 
                key={m.id} 
                className={`material-card ${m.issue_type.toLowerCase()}`}
              >
                <h3 className="material-header">
                  📦 {m.name.toUpperCase()} ({m.unit})
                  <span className={`issue-type ${m.issue_type.toLowerCase()}`}>
                    {m.issue_type}
                  </span>
                </h3>
                
                {stock.length === 0 ? (
                  <p className="no-stock">No stock available for {m.name}</p>
                ) : (
                  <table className="stock-table">
                    <thead>
                      <tr>
                        <th className="table-corner-left">Party</th>
                        <th>Qty</th>
                        <th>MFG Date</th>
                        <th>Expiry</th>
                        <th className="table-corner-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.map((c, index) => (
                        <tr key={index} className={index === 0 ? "highlight-row" : ""}>
                          <td>{c.partyName || c.farmerName}</td>
                          <td className="qty-cell">{c.qty} {m.unit}</td>
                          <td>{c.mfgDate || '-'}</td>
                          <td>{c.expiryDate}</td>
                          <td>{c.status || 'Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <button className="refresh-btn" onClick={fetchData}>
        🔄 Refresh Stock
      </button>
    </div>
  );
}
