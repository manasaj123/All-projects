import { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerOnboarding() {
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:5001/api/customers");
    setCustomers(res.data);
  };

  
  const addCustomer = async () => {
    if (!customerName || !address || !contact) return;

    await axios.post("http://localhost:5001/api/customers", {
      name: customerName,
      address,
      contact,
    });

    
    fetchCustomers();

    
    setCustomerName("");
    setAddress("");
    setContact("");
  };

  return (
    <div>
      <h2>Customer Onboarding</h2>

      <input
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
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

      <button onClick={addCustomer}>Add Customer</button>

      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            <b>{c.name}</b> | {c.address} | {c.contact}
          </li>
        ))}
      </ul>
    </div>
  );
}