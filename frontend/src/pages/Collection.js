import { useState, useEffect } from "react";
import axios from "axios";

export default function Collection() {
  const [farmers, setFarmers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [collections, setCollections] = useState([]);

  const [partyType, setPartyType] = useState(""); // farmer | customer
  const [partyId, setPartyId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [qty, setQty] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // 🔹 Load all data from DB on mount
  useEffect(() => {
    fetchFarmers();
    fetchCustomers();
    fetchMaterials();
    fetchCollections();
  }, []);

  const fetchFarmers = async () => {
    const res = await axios.get("http://localhost:5000/api/farmers");
    setFarmers(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:5000/api/customers");
    setCustomers(res.data);
  };

  const fetchMaterials = async () => {
    const res = await axios.get("http://localhost:5000/api/materials");
    setMaterials(res.data);
  };

  const fetchCollections = async () => {
    const res = await axios.get("http://localhost:5000/api/collections");
    setCollections(res.data);
  };

  const handleMfgChange = (date) => {
    setMfgDate(date);

    const material = materials.find(m => m.id === Number(materialId));
    if (!material?.shelfLife) return;

    const exp = new Date(date);
    exp.setDate(exp.getDate() + Number(material.shelfLife));
    setExpiryDate(exp.toISOString().split("T")[0]);
  };

  const saveCollection = async () => {
    if (!partyType || !partyId || !materialId || !qty || !expiryDate) {
      return alert("All fields are required");
    }

    try {
      await axios.post("http://localhost:5000/api/collections", {
        partyType,
        partyId: Number(partyId),
        materialId: Number(materialId),
        qty: Number(qty),
        mfgDate: partyType === "farmer" ? mfgDate : null,
        expiryDate,
      });

      // Reload collections from DB
      fetchCollections();

      // Reset fields
      setPartyType("");
      setPartyId("");
      setMaterialId("");
      setQty("");
      setMfgDate("");
      setExpiryDate("");
    } catch (err) {
      console.error("Error saving collection:", err);
      alert("Failed to save collection");
    }
  };

  return (
    <div className="container">
      <h2>Collection App</h2>

      {/* Party Type */}
      <label>
        <input
          type="radio"
          value="farmer"
          checked={partyType === "farmer"}
          onChange={() => {
            setPartyType("farmer");
            setPartyId("");
            setMfgDate("");
          }}
        /> Farmer
      </label>

      <label style={{ marginLeft: "20px" }}>
        <input
          type="radio"
          value="customer"
          checked={partyType === "customer"}
          onChange={() => {
            setPartyType("customer");
            setPartyId("");
            setMfgDate("");
          }}
        /> Customer
      </label>

      <br /><br />

      {/* Farmer / Customer dropdown */}
      {partyType === "farmer" && (
        <select value={partyId} onChange={e => setPartyId(e.target.value)}>
          <option value="">Select Farmer</option>
          {farmers.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      )}

      {partyType === "customer" && (
        <select value={partyId} onChange={e => setPartyId(e.target.value)}>
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* Material dropdown */}
      <select value={materialId} onChange={e => setMaterialId(e.target.value)}>
        <option value="">Select Material</option>
        {materials.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={qty}
        onChange={e => setQty(e.target.value)}
      />

      {/* MFG Date only for Farmer */}
      {partyType === "farmer" && (
        <input
          type="date"
          value={mfgDate}
          onChange={e => handleMfgChange(e.target.value)}
        />
      )}

      {/* Expiry Date always visible */}
      <input
        type="date"
        value={expiryDate}
        onChange={e => setExpiryDate(e.target.value)}
      />

      <br /><br />

      <button onClick={saveCollection}>Save Collection</button>

      <br /><br />

      {/* Display collections */}
      {collections.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Party</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>MFG Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {collections.map(c => (
              <tr key={c.id}>
                <td>{c.partyName}</td>
                <td>{c.materialName}</td>
                <td>{c.qty}</td>
                <td>{c.mfgDate || "-"}</td>
                <td>{c.expiryDate}</td>
                <td>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
