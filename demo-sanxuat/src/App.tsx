import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ProductStructure from './pages/ProductStructure';
import ProductStructureDetail from './pages/ProductStructureDetail';
import ProductStructureForm from './pages/ProductStructureForm';
import ProcessRouting from './pages/ProcessRouting';
import ProcessRoutingDetail from './pages/ProcessRoutingDetail';
import ProcessRoutingForm from './pages/ProcessRoutingForm';
import ProductionPlan from './pages/ProductionPlan';
import ProductionPlanDetail from './pages/ProductionPlanDetail';
import ProductionPlanForm from './pages/ProductionPlanForm';
import ProductionOrder from './pages/ProductionOrder';
import ProductionOrderDetail from './pages/ProductionOrderDetail';
import ProductionOrderForm from './pages/ProductionOrderForm';
import Completion from './pages/Completion';
import CompletionDetail from './pages/CompletionDetail';
import EngineeringChange from './pages/EngineeringChange';
import EngineeringChangeDetail from './pages/EngineeringChangeDetail';
import EngineeringChangeForm from './pages/EngineeringChangeForm';
import MaterialProduction from './pages/MaterialProduction';
import MaterialProductionDetail from './pages/MaterialProductionDetail';
import MaterialProductionForm from './pages/MaterialProductionForm';
import WIPTracking from './pages/WIPTracking';
import WIPTrackingDetail from './pages/WIPTrackingDetail';
import CapacityManagement from './pages/CapacityManagement';
import Reports from './pages/Reports';
// Alerts gộp vào Dashboard
// import Alerts from './pages/Alerts';
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
                <Route path="product-structures" element={<ProductStructure />} />
                <Route path="product-structures/new" element={<ProductStructureForm />} />
                <Route path="product-structures/:id" element={<ProductStructureDetail />} />
                <Route path="product-structures/:id/edit" element={<ProductStructureForm />} />
                <Route path="process-routings" element={<ProcessRouting />} />
                <Route path="process-routings/new" element={<ProcessRoutingForm />} />
                <Route path="process-routings/:id" element={<ProcessRoutingDetail />} />
                <Route path="process-routings/:id/edit" element={<ProcessRoutingForm />} />
                <Route path="production-plans" element={<ProductionPlan />} />
                <Route path="production-plans/new" element={<ProductionPlanForm />} />
                <Route path="production-plans/:id" element={<ProductionPlanDetail />} />
                <Route path="production-plans/:id/edit" element={<ProductionPlanForm />} />
                <Route path="production-orders" element={<ProductionOrder />} />
                <Route path="production-orders/new" element={<ProductionOrderForm />} />
                <Route path="production-orders/:id" element={<ProductionOrderDetail />} />
                <Route path="production-orders/:id/edit" element={<ProductionOrderForm />} />
                <Route path="completion" element={<Completion />} />
                <Route path="completion/:id" element={<CompletionDetail />} />
                <Route path="engineering-changes" element={<EngineeringChange />} />
                <Route path="engineering-changes/new" element={<EngineeringChangeForm />} />
                <Route path="engineering-changes/:id" element={<EngineeringChangeDetail />} />
                <Route path="engineering-changes/:id/edit" element={<EngineeringChangeForm />} />
                <Route path="material-production" element={<MaterialProduction />} />
                <Route path="material-production/new" element={<MaterialProductionForm />} />
                <Route path="material-production/:id" element={<MaterialProductionDetail />} />
                <Route path="material-production/:id/edit" element={<MaterialProductionForm />} />
                <Route path="wip-tracking" element={<WIPTracking />} />
                <Route path="wip-tracking/:id" element={<WIPTrackingDetail />} />
                <Route path="capacity" element={<CapacityManagement />} />
                <Route path="reports" element={<Reports />} />
                {/* alerts gộp vào dashboard */}
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
