import { Routes, Route } from "react-router-dom";
import QCDashboardPage from "./pages/QCDashboardPage";
import QCLotsPage from "./pages/QCLotsPage";
import QCAuditReportsPage from "./pages/QCAuditReportsPage";


function App() {
  return (
    
    <Routes>
      <Route path="/" element={<QCDashboardPage />} />
      <Route path="/lots" element={<QCLotsPage />} />
      <Route path="/reports" element={<QCAuditReportsPage />} />
    </Routes>
    
  );
}

export default App;
