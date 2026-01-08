import { useState, useEffect } from "react";
import axios from "axios";

export default function CallingApp() {
  const [collections, setCollections] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/collections");
      setCollections(res.data);
    } catch (err) {
      console.error("Fetch collections error:", err);
      alert("Failed to load collections");
    }
  };

  
  const filteredCollections = collections.filter(
    (c) => c.mfgDate === selectedDate || (!selectedDate && c.mfgDate)
  );

  const markCompleted = async (id) => {
    setLoading(true);
    try {
      
      await axios.patch(`http://localhost:5000/api/collections/${id}`, {
        status: "Completed"
      });
      
      
      fetchCollections();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Calling App</h2>

      <label>
        Select Date:{" "}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </label>

      <br /><br />

      {selectedDate && filteredCollections.length === 0 && (
        <p>No collections for this date</p>
      )}

      {filteredCollections.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Party</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>MFG Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollections.map((c) => (
              <tr key={c.id}>
                <td>{c.partyName}</td>        
                <td>{c.materialName}</td>     
                <td>{c.qty}</td>
                <td>{c.mfgDate || "-"}</td>
                <td>{c.expiryDate}</td>
                <td>{c.status || "Pending"}</td>
                <td>
                  {c.status === "Completed" ? (
                    "✔"
                  ) : (
                    <button 
                      onClick={() => markCompleted(c.id)}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Complete"}
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
}
