import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import RepairReception from './pages/RepairReception';
import RepairReceptionDetail from './pages/RepairReceptionDetail';
import DiagnosticResults from './pages/DiagnosticResults';
import DiagnosticResultDetail from './pages/DiagnosticResultDetail';
import WorkOrders from './pages/WorkOrders';
import MaterialRequests from './pages/MaterialRequests';
import WorkOrderDetail from './pages/WorkOrderDetail';
import RepairExecution from './pages/RepairExecution';
import RepairExecutionDetail from './pages/RepairExecutionDetail';
import InspectionHandover from './pages/InspectionHandover';
import RepairHistory from './pages/RepairHistory';
import CostTracking from './pages/CostTracking';
import Monitoring from './pages/Monitoring';
import WorkOrderApproval from './pages/Approvals/WorkOrderApproval';
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
                <Route path="repair-reception" element={<RepairReception />} />
                <Route path="repair-reception/:id" element={<RepairReceptionDetail />} />
                <Route path="diagnostic-results" element={<DiagnosticResults />} />
                <Route path="diagnostic-results/:id" element={<DiagnosticResultDetail />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="material-requests" element={<MaterialRequests />} />
                <Route path="work-orders/:id" element={<WorkOrderDetail />} />
                <Route path="repair-execution" element={<RepairExecution />} />
                <Route path="repair-execution/:id" element={<RepairExecutionDetail />} />
                <Route path="inspection-handover" element={<InspectionHandover />} />
                <Route path="repair-history" element={<RepairHistory />} />
                <Route path="cost-tracking" element={<CostTracking />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="approvals/work-orders" element={<WorkOrderApproval />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
