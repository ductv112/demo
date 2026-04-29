import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CostPlan from './pages/CostPlan';
import CostPlanDetail from './pages/CostPlanDetail';
import PaymentRequest from './pages/PaymentRequest';
import PaymentRequestDetail from './pages/PaymentRequestDetail';
import CostTracking from './pages/CostTracking';
import Monitoring from './pages/Monitoring';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import CostPlanApproval from './pages/Approvals/CostPlanApproval';
import PaymentApproval from './pages/Approvals/PaymentApproval';
import './App.css';

function App() {
  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AntApp>
        <UserProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="cost-plans" element={<CostPlan />} />
                <Route path="cost-plans/:id" element={<CostPlanDetail />} />
                <Route path="payment-requests" element={<PaymentRequest />} />
                <Route path="payment-requests/:id" element={<PaymentRequestDetail />} />
                <Route path="cost-tracking" element={<CostTracking />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="reports" element={<Reports />} />
                <Route path="categories/sources" element={<Categories />} />
                <Route path="categories/cost-types" element={<Categories />} />
                <Route path="categories/departments" element={<Categories />} />
                <Route path="categories" element={<Categories />} />
                <Route path="approvals/cost-plans" element={<CostPlanApproval />} />
                <Route path="approvals/payments" element={<PaymentApproval />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
