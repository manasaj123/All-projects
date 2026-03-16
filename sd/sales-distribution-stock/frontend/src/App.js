import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './styles/main.css';

// PAGES
import Customers from './pages/Customers';
import CustomerAccountGroup from './pages/CustomerAccountGroup';
import MaterialSalesView from './pages/MaterialSalesView';
import MaterialStock from './pages/MaterialStock';
import Quota from './pages/Quota';
import Credit from './pages/Credit';
import PricingConfig from './pages/PricingConfig';
import ScheduleLine from './pages/ScheduleLine';
import ItemCategoriesConfig from './pages/ItemCategoriesConfig';
import SalesDocumentConfig from './pages/SalesDocumentConfig';
import SalesOrders from './pages/SalesOrders';
import Billing from './pages/Billing';
import Deliveries from './pages/Deliveries';
import Picking from './pages/Picking';
import Shipping from './pages/Shipping';
import Inquiry from './pages/Inquiry';
import Agreement from './pages/Agreement';
import RoutePage from './pages/Route';
import Conditions from './pages/Conditions';
import PreSalesActivities from './pages/PreSalesActivities';
// (0‑byte placeholder pages you can wire later if you want)

const App = () => {
  return (
    <div className="app-root">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Routes>
            

            <Route path="/customers" element={<Customers />} />
            <Route
              path="/customer-account-groups"
              element={<CustomerAccountGroup />}
            />

            <Route path="/material-sales-view" element={<MaterialSalesView />} />
            <Route path="/material-stock" element={<MaterialStock />} />

            <Route path="/quota" element={<Quota />} />
            <Route path="/credit" element={<Credit />} />
            <Route path="/pricing-config" element={<PricingConfig />} />
            <Route path="/schedule-line" element={<ScheduleLine />} />
            <Route
              path="/item-categories-config"
              element={<ItemCategoriesConfig />}
            />
            <Route
              path="/sales-document-config"
              element={<SalesDocumentConfig />}
            />

            <Route path="/sales-orders" element={<SalesOrders />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/picking" element={<Picking />} />
            <Route path="/shipping" element={<Shipping />} />

            <Route path="/inquiry" element={<Inquiry />} />
            <Route path="/agreement" element={<Agreement />} />
            <Route path="/route" element={<RoutePage />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route
              path="/pre-sales-activities"
              element={<PreSalesActivities />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
