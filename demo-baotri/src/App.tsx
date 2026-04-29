import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MaintenanceTeam from './pages/MaintenanceTeam';
import Procedures from './pages/Procedures';
import ProcedureCreate from './pages/ProcedureCreate';
import MaintenancePlan from './pages/MaintenancePlan';
import MaintenancePlanDetail from './pages/MaintenancePlanDetail';
import MaintenancePlanCreate from './pages/MaintenancePlanCreate';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetail from './pages/WorkOrderDetail';
import ScheduledMaintenance from './pages/ScheduledMaintenance';
import CorrectiveMaintenance from './pages/CorrectiveMaintenance';
import MaterialRequests from './pages/MaterialRequests';
import MaterialRequestCreate from './pages/MaterialRequestCreate';
import MaterialRequestDetail from './pages/MaterialRequestDetail';
import EquipmentMonitoring from './pages/EquipmentMonitoring';
import MaintenanceHistory from './pages/MaintenanceHistory';
import Evaluation from './pages/Evaluation';
import Reports from './pages/Reports';
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
                <Route path="maintenance-team" element={<MaintenanceTeam />} />
                <Route path="procedures" element={<Procedures />} />
                <Route path="procedures/create" element={<ProcedureCreate />} />
                <Route path="maintenance-plans" element={<MaintenancePlan />} />
                <Route path="maintenance-plans/create" element={<MaintenancePlanCreate />} />
                <Route path="maintenance-plans/:id" element={<MaintenancePlanDetail />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="work-orders/:id" element={<WorkOrderDetail />} />
                <Route path="scheduled-maintenance" element={<ScheduledMaintenance />} />
                <Route path="corrective-maintenance" element={<CorrectiveMaintenance />} />
                <Route path="material-requests" element={<MaterialRequests />} />
                <Route path="material-requests/create" element={<MaterialRequestCreate />} />
                <Route path="material-requests/:id" element={<MaterialRequestDetail />} />
                <Route path="equipment-monitoring" element={<EquipmentMonitoring />} />
                <Route path="maintenance-history" element={<MaintenanceHistory />} />
                <Route path="evaluation" element={<Evaluation />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
