import React, { useEffect, useState } from "react";
import qcMasterApi from "../../api/qcMasterApi";



export default function QCPlanForm({ materialId }) {
  const [params, setParams] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await qcMasterApi.getTemplate(materialId);
      setParams(res.data || []);
    };
    if (materialId) load();
  }, [materialId]);

  return (
    <div>
      <h3>QC Plan for Material #{materialId}</h3>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Parameter</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Unit</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Spec Limit</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Required</th>
          </tr>
        </thead>
        <tbody>
          {params.map(p => (
            <tr key={p.parameter_id}>
              <td>{p.parameter_name}</td>
              <td>{p.unit}</td>
              <td>
                {(p.lower_spec_limit ?? "")} - {(p.upper_spec_limit ?? "")}
              </td>
              <td>{p.required ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
}
