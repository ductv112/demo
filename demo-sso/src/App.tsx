import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { AuthProvider, useAuth } from './contexts/UserContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Sessions from './pages/Sessions';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import SsoLogout from './pages/SsoLogout';
import SsoSession from './pages/SsoSession';
import SsoCallback from './pages/SsoCallback';
import './App.css';

// ============================================================
// Guards
// ============================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/sso/login" replace />;
  }
  return <>{children}</>;
}

/**
 * Route "/" — login xong vào /admin của SSO. User muốn sang Portal thì
 * click qua AppSwitcher (yêu cầu Portal đã khởi ở localhost:3000).
 * Trong demo local nhẹ RAM, không bắt buộc Portal phải chạy.
 */
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/sso/login" replace />;
  }
  return <Navigate to="/admin" replace />;
}

// ============================================================
// Routing
// ============================================================

function AppRoutes() {
  return (
    <Routes>
      {/* ===== SSO Endpoints ===== */}

      {/* /sso/login — trang đăng nhập chính thức */}
      <Route element={<AuthLayout />}>
        <Route path="/sso/login" element={<Login />} />
      </Route>

      {/* /login — alias backward-compat → /sso/login */}
      <Route path="/login" element={<Navigate to="/sso/login" replace />} />

      {/* /sso/logout — global logout, nhận client_id + post_logout_redirect_uri */}
      <Route path="/sso/logout" element={<SsoLogout />} />

      {/* /sso/session — check SSO session, redirect về app hoặc login */}
      <Route path="/sso/session" element={<SsoSession />} />

      {/* /sso/callback — OAuth2 callback handler */}
      <Route path="/sso/callback" element={<SsoCallback />} />

      {/* ===== Root redirect ===== */}
      <Route path="/" element={<RootRedirect />} />

      {/* ===== SSO Admin (từ Portal truy cập) ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="audit-log" element={<AuditLog />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
