import React, { useState } from 'react';
import {
  Layout, Menu, Avatar, Dropdown, Badge, Space, Typography,
  Button, Breadcrumb, theme,
} from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ScheduleOutlined,
  SettingOutlined,
  HistoryOutlined,
  LineChartOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  CrownOutlined,
  TeamOutlined,
  ToolOutlined,
  CheckSquareOutlined,
  ApartmentOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { alerts } from '../data/alerts';
import AppSwitcher from '../components/AppSwitcher';
import { useUser } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  vongdoi:    '#1B3A5C',
  department: '#0891b2',
  director:   '#7c3aed',
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  vongdoi:    <ToolOutlined />,
  department: <TeamOutlined />,
  director:   <CrownOutlined />,
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { currentUser, isVongDoi, isDepartment, isDirector } = useUser();

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const monitoringLabel = (
    <span>
      Giám sát & Cảnh báo
      {unreadCount > 0 && <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />}
    </span>
  );

  const getMenuItems = (): MenuProps['items'] => {
    const common: MenuProps['items'] = [
      { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
    ];

    if (isVongDoi) {
      return [
        ...common,
        {
          key: 'equipment-group',
          icon: <DatabaseOutlined />,
          label: 'Quản lý Thiết bị',
          children: [
            { key: '/equipment',         icon: <DatabaseOutlined />,  label: 'Hồ sơ trang thiết bị' },
            { key: '/lifecycle-plans',   icon: <ScheduleOutlined />,  label: 'Kế hoạch vòng đời' },
            { key: '/configurations',        icon: <ApartmentOutlined />, label: 'Cấu hình thiết kế' },
            { key: '/actual-configurations', icon: <SettingOutlined />,    label: 'Cấu hình thực tế' },
            { key: '/operation-history',     icon: <HistoryOutlined />,    label: 'Lịch sử vận hành' },
          ],
        },
        {
          key: 'analysis-group',
          icon: <LineChartOutlined />,
          label: 'Phân tích & Báo cáo',
          children: [
            { key: '/lifespan-analysis', icon: <LineChartOutlined />, label: 'Phân tích tuổi thọ' },
            { key: '/monitoring',        icon: <BellOutlined />,      label: monitoringLabel },
            { key: '/reports',           icon: <BarChartOutlined />,  label: 'Báo cáo' },
          ],
        },
        {
          key: 'categories-group',
          icon: <AppstoreOutlined />,
          label: 'Danh mục',
          children: [
            { key: '/categories/equipment-types', icon: <AppstoreOutlined />, label: 'Loại trang thiết bị' },
            { key: '/categories/military-units',  icon: <TeamOutlined />,     label: 'Đơn vị sử dụng' },
          ],
        },
      ];
    }

    if (isDepartment) {
      return [
        ...common,
        {
          key: 'work-group',
          icon: <ToolOutlined />,
          label: 'Nghiệp vụ',
          children: [
            { key: '/equipment',         icon: <DatabaseOutlined />, label: 'Hồ sơ trang thiết bị' },
            { key: '/lifecycle-plans',   icon: <ScheduleOutlined />, label: 'Kế hoạch vòng đời' },
            { key: '/operation-history', icon: <HistoryOutlined />,  label: 'Cập nhật vận hành' },
          ],
        },
        {
          key: 'monitor-dept-group',
          icon: <BellOutlined />,
          label: 'Giám sát',
          children: [
            { key: '/monitoring', icon: <BellOutlined />, label: monitoringLabel },
          ],
        },
      ];
    }

    if (isDirector) {
      return [
        ...common,
        {
          key: 'approval-group',
          icon: <CheckSquareOutlined />,
          label: 'Phê duyệt',
          children: [
            { key: '/lifecycle-plans?filter=pending', icon: <ScheduleOutlined />,  label: 'Phê duyệt kế hoạch VĐ' },
            { key: '/configurations?filter=pending',  icon: <ApartmentOutlined />, label: 'Phê duyệt cấu hình' },
          ],
        },
        {
          key: 'lookup-group',
          icon: <DatabaseOutlined />,
          label: 'Tra cứu',
          children: [
            { key: '/equipment',         icon: <DatabaseOutlined />,  label: 'Hồ sơ trang thiết bị' },
            { key: '/lifespan-analysis', icon: <LineChartOutlined />, label: 'Phân tích tuổi thọ' },
          ],
        },
        {
          key: 'monitor-dir-group',
          icon: <BarChartOutlined />,
          label: 'Giám sát & Báo cáo',
          children: [
            { key: '/monitoring', icon: <BellOutlined />,     label: monitoringLabel },
            { key: '/reports',    icon: <BarChartOutlined />, label: 'Báo cáo' },
          ],
        },
      ];
    }

    return common;
  };

  const ROUTE_LABELS: Record<string, string | string[]> = {
    '/equipment':              'Hồ sơ trang thiết bị',
    '/lifecycle-plans':        'Kế hoạch vòng đời',
    '/configurations':         'Cấu hình thiết kế',
    '/actual-configurations':  'Cấu hình thực tế',
    '/operation-history':      'Lịch sử vận hành',
    '/lifespan-analysis':      'Phân tích tuổi thọ',
    '/monitoring':             'Giám sát & Cảnh báo',
    '/reports':                'Báo cáo',
    '/categories/equipment-types': ['Danh mục', 'Loại trang thiết bị'],
    '/categories/military-units':  ['Danh mục', 'Đơn vị sử dụng'],
  };

  const getBreadcrumbItems = () => {
    const p = location.pathname;
    const home = { title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><HomeOutlined /> Dashboard</span> };
    if (p === '/' || p === '') return [home];
    const match = Object.entries(ROUTE_LABELS).find(([key]) => p.startsWith(key));
    if (!match) return [home];
    const labels = Array.isArray(match[1]) ? match[1] : [match[1]];
    return [home, ...labels.map(label => ({ title: label }))];
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile',  icon: <UserOutlined />,  label: 'Thông tin cá nhân' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
  ];

  const getSelectedKey = (): string[] => {
    const p = location.pathname + location.search;
    if (p === '/' || p === '') return ['/'];
    if (p.startsWith('/equipment'))         return ['/equipment'];
    if (p.includes('/lifecycle-plans?filter=pending')) return ['/lifecycle-plans?filter=pending'];
    if (p.startsWith('/lifecycle-plans'))   return ['/lifecycle-plans'];
    if (p.includes('/configurations?filter=pending'))  return ['/configurations?filter=pending'];
    if (p.startsWith('/actual-configurations')) return ['/actual-configurations'];
    if (p.startsWith('/configurations'))    return ['/configurations'];
    if (p.startsWith('/operation-history')) return ['/operation-history'];
    if (p.startsWith('/lifespan-analysis')) return ['/lifespan-analysis'];
    if (p.startsWith('/monitoring'))        return ['/monitoring'];
    if (p.startsWith('/reports'))           return ['/reports'];
    if (p.startsWith('/categories/equipment-types')) return ['/categories/equipment-types'];
    if (p.startsWith('/categories/military-units'))  return ['/categories/military-units'];
    return [location.pathname];
  };

  // Group keys (không navigate khi click)
  const groupKeys = new Set([
    'equipment-group', 'analysis-group', 'categories-group',
    'work-group', 'monitor-dept-group',
    'approval-group', 'lookup-group', 'monitor-dir-group',
  ]);

  const siderMenuStyles = `
    .sider-menu .ant-menu-submenu > .ant-menu-submenu-title {
      font-weight: 600 !important;
      font-size: 13px !important;
      color: rgba(255,255,255,0.9) !important;
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
    .sider-menu > .ant-menu-item:hover { color: #fff !important; }
    .sider-menu > .ant-menu-item-selected {
      color: #fff !important;
      background: rgba(27,58,92,0.6) !important;
      font-weight: 600 !important;
    }
    .sider-menu .ant-menu-item-divider { border-color: rgba(255,255,255,0.06) !important; }
  `;

  void token;

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
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)',
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #D4A843 0%, #f0d890 50%, #D4A843 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13, color: '#0a1628',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
            letterSpacing: '-0.5px',
          }}>
            VĐ
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Vòng đời &amp; Cấu hình
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 400 }}>
                Doanh nghiệp A
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          className="sider-menu"
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={getMenuItems()}
          onClick={({ key }) => { if (!groupKeys.has(key)) navigate(key); }}
          style={{ borderRight: 0, marginTop: 8, background: 'transparent' }}
        />

        {/* User panel */}
        {!collapsed && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 18px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                size={32}
                style={{
                  background: `linear-gradient(135deg, ${roleColors[currentUser.role]}, ${roleColors[currentUser.role]}88)`,
                  fontSize: 12, fontWeight: 600,
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
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eef0f3',
          position: 'sticky', top: 0, zIndex: 99,
          height: 56,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <Space size={12}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, color: '#666' }}
            />
            <div style={{ height: 20, width: 1, background: '#e8e8e8' }} />
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ fontSize: 13 }}
            />
          </Space>
          <Space size={16}>
            <AppSwitcher currentApp="vongdoi" />
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#666' }} />}
                onClick={() => navigate('/monitoring')}
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
        <Content style={{ margin: 16, minHeight: 'calc(100vh - 56px - 32px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
