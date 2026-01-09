import { useState, useEffect } from "react";
import axios from "axios";

export default function FarmerOnboarding() {
  const [farmers, setFarmers] = useState([]);
  const [farmerName, setFarmerName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

 
  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    const res = await axios.get("http://localhost:5000/api/farmers");
    setFarmers(res.data);
  };

  
  const addFarmer = async () => {
    if (!farmerName || !address || !contact) return;

    await axios.post("http://localhost:5000/api/farmers", {
      name: farmerName,
      address,
      contact,
    });

    
    fetchFarmers();

    
    setFarmerName("");
    setAddress("");
    setContact("");
  };

  return (
    <div>
      <h2>Farmer Onboarding</h2>

      <input
        placeholder="Farmer Name"
        value={farmerName}
        onChange={(e) => setFarmerName(e.target.value)}
      />

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        placeholder="Contact Number"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />

      <button onClick={addFarmer}>Add Farmer</button>

      <ul>
        {farmers.map((f) => (
          <li key={f.id}>
            <b>{f.name}</b> | {f.address} | {f.contact}
          </li>
        ))}
      </ul>
    </div>
  );
}
