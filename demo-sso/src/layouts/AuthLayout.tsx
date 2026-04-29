import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';

/**
 * AuthLayout bọc các trang public (login).
 * Nếu đã đăng nhập → navigate nội bộ về "/" để RootRedirect xử lý.
 * KHÔNG redirect trực tiếp ra Portal ở đây — tránh double redirect với Login page.
 */
export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
