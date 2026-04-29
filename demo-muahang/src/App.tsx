import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import { PageHeaderProvider } from './contexts/PageHeaderContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MaterialRequests from './pages/MaterialRequests';
import MaterialRequestDetail from './pages/MaterialRequestDetail';
import SupplyPlan from './pages/SupplyPlan';
import SupplyPlanDetail from './pages/SupplyPlanDetail';
import SupplyPlanForm from './pages/SupplyPlanForm';
import Suppliers from './pages/Suppliers';
import SupplierDetail from './pages/SupplierDetail';
import Bidding from './pages/Bidding';
import BiddingDetail from './pages/BiddingDetail';
import BiddingForm from './pages/BiddingForm';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import ContractForm from './pages/ContractForm';
import Receiving from './pages/Receiving';
import Payments from './pages/Payments';
import PaymentDetail from './pages/PaymentDetail';
import PaymentForm from './pages/PaymentForm';
import Reports from './pages/Reports';
import Approvals from './pages/Approvals';
import './App.css';

function App() {
  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AntApp>
        <UserProvider>
          <PageHeaderProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="material-requests" element={<MaterialRequests />} />
                <Route path="material-requests/:id" element={<MaterialRequestDetail />} />
                <Route path="supply-plans" element={<SupplyPlan />} />
                <Route path="supply-plans/new" element={<SupplyPlanForm />} />
                <Route path="supply-plans/:id" element={<SupplyPlanDetail />} />
                <Route path="supply-plans/:id/edit" element={<SupplyPlanForm />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="suppliers/:id" element={<SupplierDetail />} />
                <Route path="bidding" element={<Bidding />} />
                <Route path="bidding/new" element={<BiddingForm />} />
                <Route path="bidding/:id" element={<BiddingDetail />} />
                <Route path="bidding/:id/edit" element={<BiddingForm />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="contracts/new" element={<ContractForm />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="contracts/:id/edit" element={<ContractForm />} />
                <Route path="receiving" element={<Receiving />} />
                <Route path="payments" element={<Payments />} />
                <Route path="payments/new" element={<PaymentForm />} />
                <Route path="payments/:id" element={<PaymentDetail />} />
                <Route path="reports" element={<Reports />} />
                <Route path="approvals/plans" element={<Approvals />} />
                <Route path="approvals/bidding" element={<Approvals />} />
                <Route path="approvals/payments" element={<Approvals />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </PageHeaderProvider>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
