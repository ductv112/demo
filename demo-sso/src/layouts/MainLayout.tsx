import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, type MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  HistoryOutlined,
  AuditOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { PORTAL_URL } from '../utils/portal';
import AppSwitcher from '../components/AppSwitcher';

const { Sider, Header, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: 'portal',
    icon: <HomeOutlined />,
    label: 'Quay về Portal',
  },
  { type: 'divider' },
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  { type: 'divider' },
  {
    key: '/admin/users',
    icon: <TeamOutlined />,
    label: 'Quản lý người dùng',
  },
  {
    key: '/admin/roles',
    icon: <SafetyCertificateOutlined />,
    label: 'Quản lý vai trò',
  },
  {
    key: '/admin/permissions',
    icon: <KeyOutlined />,
    label: 'Phân quyền ứng dụng',
  },
  { type: 'divider' },
  {
    key: '/admin/sessions',
    icon: <HistoryOutlined />,
    label: 'Quản lý phiên',
  },
  {
    key: '/admin/audit-log',
    icon: <AuditOutlined />,
    label: 'Nhật ký truy cập',
  },
  { type: 'divider' },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: 'Cấu hình hệ thống',
  },
];

const siderMenuStyles = `
  .sider-menu .ant-menu-item {
    margin-inline: 8px;
    border-radius: 8px;
  }
  .sider-menu .ant-menu-item-divider {
    border-color: rgba(255,255,255,0.06);
    margin: 8px 16px;
  }
`;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'portal') {
      window.location.href = PORTAL_URL;
      return;
    }
    navigate(key);
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => {
        logout();
        // Sau khi logout, redirect về SSO login thông qua endpoint chuẩn
        window.location.href = '/sso/logout?client_id=pkkq-sso&post_logout_redirect_uri=' +
          encodeURIComponent(window.location.origin + '/sso/login');
      },
    },
  ];

  // Map pathname to menu key: /admin → /admin, /admin/users/U01 → /admin/users
  const pathParts = location.pathname.split('/').filter(Boolean);
  const selectedKey = pathParts.length <= 1
    ? '/admin'
    : '/' + pathParts.slice(0, 2).join('/');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <style>{siderMenuStyles}</style>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-badge">
            <Fingerprint size={20} color="#0a1628" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <h4>Đăng nhập SSO</h4>
              <p>Doanh nghiệp A</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey === '/' ? '/' : selectedKey]}
          items={menuItems}
          onClick={onMenuClick}
          className="sider-menu"
          style={{ background: 'transparent', borderRight: 'none', marginTop: 8 }}
        />

        {/* User info */}
        {!collapsed && currentUser && (
          <div className="sidebar-user">
            <Avatar
              size={32}
              style={{ background: 'linear-gradient(135deg, #D4A843, #f0d890)', color: '#0a1628', fontWeight: 700 }}
            >
              {currentUser.fullName.split(' ').pop()?.charAt(0)}
            </Avatar>
            <div>
              <div className="sidebar-user-name">{currentUser.fullName}</div>
              <div className="sidebar-user-role">{currentUser.position}</div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            background: '#ffffff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 56,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <AppSwitcher currentApp="sso" />
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: 16 }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar
                  size={32}
                  style={{ background: '#1B3A5C', fontWeight: 600 }}
                >
                  {currentUser?.fullName.split(' ').pop()?.charAt(0)}
                </Avatar>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1B3A5C' }}>
                  {currentUser?.fullName}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: 16, minHeight: 'calc(100vh - 56px - 32px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
