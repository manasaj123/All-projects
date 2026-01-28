import { Link } from "react-router-dom";
import "./componentstyles.css";

export default function Sidebar() {
  return (
    <div className="qc-sidebar">
      <h3 className="qc-sidebar-title">QC Dashboard</h3>

      <ul className="qc-sidebar-menu">
        <li className="qc-sidebar-item">
          <Link to="/" className="qc-sidebar-link">
            Dashboard
          </Link>
        </li>

        <li className="qc-sidebar-item">
          <Link to="/lots" className="qc-sidebar-link">
            Inspection Lots
          </Link>
        </li>

        <li className="qc-sidebar-item">
          <Link to="/reports" className="qc-sidebar-link">
            Audit Reports
          </Link>
        </li>
      </ul>
    </div>
  );
}
