import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, Tag, Segmented } from 'antd';
import {
  DashboardOutlined,
  FileSearchOutlined,
  SolutionOutlined,
  ToolOutlined,
  ExperimentOutlined,
  BuildOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  AppstoreOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  CrownOutlined,
  BankOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { RefreshCw } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { alerts } from '../data/alerts';
import { useUser, roleLabels } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';
import AppSwitcher from '../components/AppSwitcher';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  technical: '#1B3A5C',
  department: '#0891b2',
  director: '#7c3aed',
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  technical: <ToolOutlined />,
  department: <TeamOutlined />,
  director: <CrownOutlined />,
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole } = useUser();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const getMenuItems = (): MenuProps['items'] => {
    return [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
      },
      { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
      {
        key: 'reception-group',
        icon: <FileSearchOutlined />,
        label: 'Tiếp nhận & Kế hoạch',
        children: [
          { key: '/overhaul-receptions', icon: <FileSearchOutlined />, label: 'Tiếp nhận đánh giá' },
          { key: '/overhaul-orders', icon: <SolutionOutlined />, label: 'Lệnh đại tu' },
        ],
      },
      {
        key: 'execution-group',
        icon: <ToolOutlined />,
        label: 'Thực hiện đại tu',
        children: [
          { key: '/disassemblies', icon: <ToolOutlined />, label: 'Tháo rã & Cấu phần' },
          { key: '/material-requests', icon: <ShoppingCartOutlined />, label: 'Yêu cầu vật tư' },
          { key: '/technical-inspections', icon: <ExperimentOutlined />, label: 'Kiểm tra kỹ thuật' },
          { key: '/restorations', icon: <BuildOutlined />, label: 'Phục hồi & Thay thế' },
          { key: '/assemblies', icon: <SettingOutlined />, label: 'Lắp ráp & Hiệu chỉnh' },
        ],
      },
      {
        key: 'acceptance-group',
        icon: <CheckCircleOutlined />,
        label: 'Nghiệm thu & Truy vết',
        children: [
          { key: '/test-acceptances', icon: <CheckCircleOutlined />, label: 'Thử nghiệm & Nghiệm thu' },
          { key: '/traceability', icon: <AuditOutlined />, label: 'Truy vết & Cấu hình' },
        ],
      },
      { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
      {
        key: '/categories',
        icon: <AppstoreOutlined />,
        label: 'Danh mục',
      },
    ];
  };

  const roleOptions = (['technical', 'department', 'director'] as UserRole[]).map((role) => ({
    label: (
      <Space size={4} style={{ padding: '0 4px' }}>
        {roleIcons[role]}
        <span>{roleLabels[role]}</span>
      </Space>
    ),
    value: role,
  }));

  const handleRoleChange = (value: string | number) => {
    switchRole(value as UserRole);
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['/'];
    if (path.startsWith('/overhaul-receptions')) return ['/overhaul-receptions'];
    if (path.startsWith('/overhaul-orders')) return ['/overhaul-orders'];
    if (path.startsWith('/disassemblies')) return ['/disassemblies'];
    if (path.startsWith('/technical-inspections')) return ['/technical-inspections'];
    if (path.startsWith('/restorations')) return ['/restorations'];
    if (path.startsWith('/assemblies')) return ['/assemblies'];
    if (path.startsWith('/test-acceptances')) return ['/test-acceptances'];
    if (path.startsWith('/traceability')) return ['/traceability'];
    if (path.startsWith('/material-requests')) return ['/material-requests'];
if (path.startsWith('/categories')) return ['/categories'];
    return [path];
  };

  const getAllOpenKeys = (): string[] => {
    const keys: string[] = [];
    const items = getMenuItems() || [];
    items.forEach((item: any) => {
      if (item?.children) {
        keys.push(item.key);
      }
    });
    return keys;
  };

  const siderMenuStyles = `
    .sider-menu .ant-menu-submenu > .ant-menu-submenu-title {
      font-weight: 600 !important;
      font-size: 13px !important;
      letter-spacing: 0.3px;
      color: rgba(255,255,255,0.9) !important;
      margin-top: 4px;
    }
    .sider-menu .ant-menu-submenu-arrow {
      display: none !important;
    }
    .sider-menu .ant-menu-sub.ant-menu-inline {
      background: rgba(0,0,0,0.15) !important;
      border-radius: 0 0 8px 8px;
      margin: 0 8px;
      padding: 4px 0;
    }
    .sider-menu .ant-menu-sub .ant-menu-item {
      font-size: 12.5px !important;
      font-weight: 400 !important;
      padding-left: 44px !important;
      color: rgba(255,255,255,0.6) !important;
      height: 36px !important;
      line-height: 36px !important;
      margin: 0 !important;
      border-radius: 6px !important;
    }
    .sider-menu .ant-menu-sub .ant-menu-item:hover,
    .sider-menu .ant-menu-sub .ant-menu-item-selected {
      color: #fff !important;
      background: rgba(255,255,255,0.08) !important;
    }
    .sider-menu > .ant-menu-item {
      font-weight: 500 !important;
      font-size: 13px !important;
      color: rgba(255,255,255,0.75) !important;
    }
    .sider-menu > .ant-menu-item:hover {
      color: #fff !important;
    }
    .sider-menu > .ant-menu-item-selected {
      color: #fff !important;
      background: rgba(27, 58, 92, 0.6) !important;
      font-weight: 600 !important;
    }
    .sider-menu .ant-menu-item-divider {
      border-color: rgba(255,255,255,0.06) !important;
    }
  `;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <style>{siderMenuStyles}</style>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)',
        }}
      >
        {/* ─── Logo Area ─── */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            gap: 12,
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #D4A843 0%, #f0d890 50%, #D4A843 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 14,
            color: '#0a1628',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
            letterSpacing: '-0.5px',
          }}>
            ĐT
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Quản lý Đại tu
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 400 }}>
                Trung tâm Đại tu hệ thống Alpha
              </div>
            </div>
          )}
        </div>

        {/* ─── Menu ─── */}
        <Menu
          className="sider-menu"
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          {...(!collapsed ? { openKeys: getAllOpenKeys() } : {})}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8, background: 'transparent' }}
        />

        {/* ─── Sidebar footer — user info ─── */}
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 18px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                size={32}
                style={{
                  background: `linear-gradient(135deg, ${roleColors[currentUser.role]}, ${roleColors[currentUser.role]}88)`,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {currentUser.name.split(' ').pop()?.charAt(0)}
              </Avatar>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, whiteSpace: 'nowrap' }}>
                  {currentUser.position}
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #eef0f3',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 56,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <Space size={12}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, color: '#666' }}
            />
            {/* Role switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag
                icon={<ThunderboltOutlined />}
                color="default"
                style={{ margin: 0, fontSize: 10, color: '#999', border: '1px dashed #d9d9d9' }}
              >
                Demo
              </Tag>
              <Segmented
                options={roleOptions}
                value={currentUser.role}
                onChange={handleRoleChange}
                size="small"
                style={{ fontSize: 12 }}
              />
            </div>
          </Space>
          <Space size={16}>
            <AppSwitcher currentApp="daitu" />
            <Badge count={unreadAlerts} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#666' }} />}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={32}
                  style={{
                    background: `linear-gradient(135deg, ${roleColors[currentUser.role]}, ${roleColors[currentUser.role]}88)`,
                    fontWeight: 600,
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ lineHeight: '18px' }}>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>{currentUser.name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{currentUser.position}</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 16,
            minHeight: 'calc(100vh - 56px - 32px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
