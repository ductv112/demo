import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import EquipmentRegistry from './pages/EquipmentRegistry';
import LifecyclePlan from './pages/LifecyclePlan';
import Configuration from './pages/Configuration';
import ActualConfiguration from './pages/ActualConfiguration';
import OperationHistory from './pages/OperationHistory';
import LifespanAnalysis from './pages/LifespanAnalysis';
import Monitoring from './pages/Monitoring';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import EquipmentDetail from './pages/EquipmentDetail';
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
                <Route path="equipment" element={<EquipmentRegistry />} />
                <Route path="equipment/:id" element={<EquipmentDetail />} />
                <Route path="lifecycle-plans" element={<LifecyclePlan />} />
                <Route path="configurations" element={<Configuration />} />
                <Route path="actual-configurations" element={<ActualConfiguration />} />
                <Route path="operation-history" element={<OperationHistory />} />
                <Route path="lifespan-analysis" element={<LifespanAnalysis />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="reports" element={<Reports />} />
                <Route path="categories" element={<Categories />} />
                <Route path="categories/equipment-types" element={<Categories />} />
                <Route path="categories/military-units" element={<Categories />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
