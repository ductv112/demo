import { useEffect } from 'react';
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
import { PORTAL_URL } from './utils/portal';
import { getToken } from './utils/ssoAuth';
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
 * Route "/" — Sysadmin (R06) → /admin, user thường → Portal.
 * Chưa login → về /sso/login.
 */
function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Mọi tài khoản sau đăng nhập đều vào Portal.
      // localStorage không chia sẻ giữa 2 domain → truyền token qua URL param.
      const token = getToken();
      const params = new URLSearchParams({
        sso_token: token?.token || '',
        sso_user_id: currentUser.id,
        sso_username: currentUser.username,
        sso_expires: token?.expiresAt || '',
      });
      window.location.href = `${PORTAL_URL}?${params.toString()}`;
    }
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return <Navigate to="/sso/login" replace />;
  }
  return null;
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
