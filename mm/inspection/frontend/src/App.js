import { Routes, Route } from "react-router-dom";
import QCDashboardPage from "./pages/QCDashboardPage";
import QCLotsPage from "./pages/QCLotsPage";
import QCAuditReportsPage from "./pages/QCAuditReportsPage";
import MasterInspectionPage from "./pages/MasterInspectionPage";
import InspectionMethodPage from "./pages/InspectionMethodPage";
import SamplingProcedurePage from "./pages/SamplingProcedurePage";
import InspectionPlanPage from "./pages/InspectionPlanPage";
import ResultRecordingUsageDecisionPage from "./pages/ResultRecordingUsageDecisionPage";
import InspectionLotPage from "./pages/InspectionLotPage";
import InProcessInspectionPage from "./pages/InProcessInspectionPage";
import FinalInspectionPage from "./pages/FinalInspectionPage";
import DefectsRecordingPage from "./pages/DefectsRecordingPage";
import QualityNotificationPage from "./pages/QualityNotificationPage";

function App() {
  return (
    
    <Routes>
      <Route path="/" element={<QCDashboardPage />} />
        <Route path="/master-inspections" element={<MasterInspectionPage />} />
        <Route path="/inspection-methods" element={<InspectionMethodPage />} />
        <Route path="/sampling-procedures" element={<SamplingProcedurePage />} />
        <Route path="/inspection-plans" element={<InspectionPlanPage />} />
        <Route path="/result-recording-usage-decision" element={<ResultRecordingUsageDecisionPage />} />
        <Route path="/inspection-lots" element={< InspectionLotPage />} />
        <Route path="/in-process-inspections" element={<InProcessInspectionPage />} />
        <Route path="/final-inspections" element={<FinalInspectionPage />} />
        <Route path="/defects-recording" element={<DefectsRecordingPage />} />
        <Route path="/quality-notifications" element={<QualityNotificationPage />} />
      <Route path="/lots" element={<QCLotsPage />} />
      <Route path="/reports" element={<QCAuditReportsPage />} />

    </Routes>
    
  );
}

export default App;
