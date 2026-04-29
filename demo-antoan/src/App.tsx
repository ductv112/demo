import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import themeConfig from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';

// Pages
import DashboardPage       from './pages/Dashboard';
import IncidentsPage       from './pages/Incidents';
import IncidentDetailPage  from './pages/IncidentDetail';
import IncidentFormPage    from './pages/IncidentForm';
import RiskMatrixPage      from './pages/RiskMatrix';
import RisksPage           from './pages/Risks';
import RiskDetailPage      from './pages/RiskDetail';
import ViolationsPage      from './pages/Violations';
import ViolationDetailPage from './pages/ViolationDetail';
import ViolationFormPage   from './pages/ViolationForm';
import SafetyStandardsPage      from './pages/SafetyStandards';
import SafetyStandardDetailPage from './pages/SafetyStandardDetail';
import SafetyControlPage        from './pages/SafetyControl';
import SafetyControlDetailPage  from './pages/SafetyControlDetail';
import SafetyControlFormPage    from './pages/SafetyControlForm';
import RiskFormPage             from './pages/RiskForm';
import ImprovementsPage         from './pages/Improvements';
import ImprovementDetailPage    from './pages/ImprovementDetail';
import ImprovementFormPage      from './pages/ImprovementForm';
import ReportsPage              from './pages/Reports';

const App: React.FC = () => (
  <ConfigProvider theme={themeConfig} locale={viVN}>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route index element={<DashboardPage />} />

            {/* Sự cố & Tai nạn */}
            <Route path="/su-co"             element={<IncidentsPage />} />
            <Route path="/su-co/:id"         element={<IncidentDetailPage />} />
            <Route path="/su-co/:id/edit"    element={<IncidentFormPage />} />

            {/* Rủi ro */}
            <Route path="/ma-tran-rui-ro"    element={<RiskMatrixPage />} />
            <Route path="/rui-ro"            element={<RisksPage />} />
            <Route path="/rui-ro/new"        element={<RiskFormPage />} />
            <Route path="/rui-ro/:id"        element={<RiskDetailPage />} />
            <Route path="/rui-ro/:id/edit"   element={<RiskFormPage />} />

            {/* Vi phạm */}
            <Route path="/vi-pham"           element={<ViolationsPage />} />
            <Route path="/vi-pham/new"       element={<ViolationFormPage />} />
            <Route path="/vi-pham/:id"       element={<ViolationDetailPage />} />
            <Route path="/vi-pham/:id/edit"  element={<ViolationDetailPage />} />

            {/* Kiểm soát điều kiện vận hành */}
            <Route path="/kiem-soat-van-hanh"       element={<SafetyControlPage />} />
            <Route path="/kiem-soat-van-hanh/new"   element={<SafetyControlFormPage />} />
            <Route path="/kiem-soat-van-hanh/:id"   element={<SafetyControlDetailPage />} />

            {/* Tiêu chuẩn */}
            <Route path="/tieu-chuan"           element={<SafetyStandardsPage />} />
            <Route path="/tieu-chuan/:id"       element={<SafetyStandardDetailPage />} />
            <Route path="/tieu-chuan/:id/edit"  element={<SafetyStandardDetailPage />} />

            {/* Cải tiến & Phòng ngừa */}
            <Route path="/cai-tien-phong-ngua"      element={<ImprovementsPage />} />
            <Route path="/cai-tien-phong-ngua/new" element={<ImprovementFormPage />} />
            <Route path="/cai-tien-phong-ngua/:id"  element={<ImprovementDetailPage />} />

            {/* Báo cáo */}
            <Route path="/bao-cao"           element={<ReportsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </ConfigProvider>
);

export default App;
