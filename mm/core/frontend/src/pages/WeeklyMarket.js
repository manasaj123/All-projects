import { useState, useEffect } from "react";
import axios from "axios";

export default function WeeklyMarket() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    fetchWeeklyMarket();
  }, []);

  const fetchWeeklyMarket = async () => {
  try {
    setLoading(true);
    const res = await axios.get("http://localhost:5001/api/stock/weekly");
    console.log("API Response:", res.data);  
    setWeeklyData(res.data);
  } catch (err) {
    console.error("Weekly market error:", err.response?.data || err.message);
    alert("Failed to load weekly market data: " + (err.response?.data?.error || err.message));
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return <div className="container"><h2>Weekly Market – FRO View</h2><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <h2>Weekly Market – FRO View</h2>
      
      {weeklyData.length === 0 ? (
        <p>No market data available</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Farmer</th>
              <th>Material</th>
              <th>Total Qty</th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((item, index) => (
              <tr key={index}>
                <td>{item.customerName || "-"}</td>   
                <td>{item.partyName || item.farmerName || "-"}</td> 
                <td>{item.materialName}</td>
                <td>{item.totalQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
