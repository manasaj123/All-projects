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
          <Link to="/master-inspections" className="qc-sidebar-link">
            Master Inspections
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link to="/inspection-methods" className="qc-sidebar-link">
            Inspection Methods
          </Link>
        </li>
          <li className="qc-sidebar-item">
          <Link to="/sampling-procedures" className="qc-sidebar-link">
            Sampling Procedures
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link to="/inspection-plans" className="qc-sidebar-link">
            Inspection Plans
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link to="/result-recording-usage-decision" className="qc-sidebar-link">
            Result & Usage 
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link to="/inspection-lots" className="qc-sidebar-link">
            Inspection Lots
          </Link>
        </li>
          <li className="qc-sidebar-item">
          <Link to="/in-process-inspections" className="qc-sidebar-link">
            In-Process Inspections
          </Link>
        </li>
          <li className="qc-sidebar-item">
          <Link to="/final-inspections" className="qc-sidebar-link">
            Final Inspections
          </Link>
        </li>
          <li className="qc-sidebar-item">
          <Link to="/defects-recording" className="qc-sidebar-link">
            Defects Recording
          </Link>
        </li>
          <li className="qc-sidebar-item">
          <Link to="/quality-notifications" className="qc-sidebar-link">
            Quality Notifications
          </Link>
        </li>

        {/* <li className="qc-sidebar-item">
          <Link to="/lots" className="qc-sidebar-link">
            Inspection 
          </Link>
        </li>

        <li className="qc-sidebar-item">
          <Link to="/reports" className="qc-sidebar-link">
            Audit Reports
          </Link>
        </li>*/}
      </ul>
    </div>
  );
}
