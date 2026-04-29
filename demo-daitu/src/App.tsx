import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import OverhaulReception from './pages/OverhaulReception';
import OverhaulReceptionDetail from './pages/OverhaulReception/OverhaulReceptionDetail';
import CreateReception from './pages/OverhaulReception/CreateReception';
import OverhaulOrder from './pages/OverhaulOrder';
import OverhaulOrderDetail from './pages/OverhaulOrder/OverhaulOrderDetail';
import CreateOrder from './pages/OverhaulOrder/CreateOrder';
import Disassembly from './pages/Disassembly';
import DisassemblyDetail from './pages/Disassembly/DisassemblyDetail';
import CreateDisassembly from './pages/Disassembly/CreateDisassembly';
import TechnicalInspection from './pages/TechnicalInspection';
import TechnicalInspectionDetail from './pages/TechnicalInspection/TechnicalInspectionDetail';
import CreateTechnicalInspection from './pages/TechnicalInspection/CreateTechnicalInspection';
import Restoration from './pages/Restoration';
import RestorationDetail from './pages/Restoration/RestorationDetail';
import CreateRestoration from './pages/Restoration/CreateRestoration';
import Assembly from './pages/Assembly';
import AssemblyDetail from './pages/Assembly/AssemblyDetail';
import CreateAssembly from './pages/Assembly/CreateAssembly';
import TestAcceptance from './pages/TestAcceptance';
import TestAcceptanceDetail from './pages/TestAcceptance/TestAcceptanceDetail';
import CreateTestAcceptance from './pages/TestAcceptance/CreateTestAcceptance';
import Traceability from './pages/Traceability';
import TraceabilityDetail from './pages/Traceability/TraceabilityDetail';
import MaterialRequestList from './pages/MaterialRequest';
import MaterialRequestDetail from './pages/MaterialRequest/MaterialRequestDetail';
import CreateMaterialRequest from './pages/MaterialRequest/CreateMaterialRequest';
import Categories from './pages/Categories';
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
                {/* Quy trình 1: Tiếp nhận & Đánh giá */}
                <Route path="overhaul-receptions" element={<OverhaulReception />} />
                <Route path="overhaul-receptions/new" element={<CreateReception />} />
                <Route path="overhaul-receptions/:id" element={<OverhaulReceptionDetail />} />
                {/* Quy trình 2: Lệnh đại tu & Kế hoạch */}
                <Route path="overhaul-orders" element={<OverhaulOrder />} />
                <Route path="overhaul-orders/new" element={<CreateOrder />} />
                <Route path="overhaul-orders/:id" element={<OverhaulOrderDetail />} />
                {/* Quy trình 3: Tháo rã & Cấu phần */}
                <Route path="disassemblies" element={<Disassembly />} />
                <Route path="disassemblies/new" element={<CreateDisassembly />} />
                <Route path="disassemblies/:id" element={<DisassemblyDetail />} />
                {/* Quy trình 4: Kiểm tra kỹ thuật */}
                <Route path="technical-inspections" element={<TechnicalInspection />} />
                <Route path="technical-inspections/new" element={<CreateTechnicalInspection />} />
                <Route path="technical-inspections/:id" element={<TechnicalInspectionDetail />} />
                {/* Quy trình 5: Phục hồi & Thay thế */}
                <Route path="restorations" element={<Restoration />} />
                <Route path="restorations/new" element={<CreateRestoration />} />
                <Route path="restorations/:id" element={<RestorationDetail />} />
                {/* Quy trình 6: Lắp ráp & Hiệu chỉnh */}
                <Route path="assemblies" element={<Assembly />} />
                <Route path="assemblies/new" element={<CreateAssembly />} />
                <Route path="assemblies/:id" element={<AssemblyDetail />} />
                {/* Quy trình 7: Thử nghiệm & Nghiệm thu */}
                <Route path="test-acceptances" element={<TestAcceptance />} />
                <Route path="test-acceptances/new" element={<CreateTestAcceptance />} />
                <Route path="test-acceptances/:id" element={<TestAcceptanceDetail />} />
                {/* Quy trình 8: Truy vết & Cấu hình */}
                <Route path="traceability" element={<Traceability />} />
                <Route path="traceability/:id" element={<TraceabilityDetail />} />
                {/* Yêu cầu vật tư */}
                <Route path="material-requests" element={<MaterialRequestList />} />
                <Route path="material-requests/new" element={<CreateMaterialRequest />} />
                <Route path="material-requests/:id" element={<MaterialRequestDetail />} />
                {/* Báo cáo & Danh mục */}
<Route path="categories" element={<Categories />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
