import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, theme, Tag, Segmented, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Factory } from 'lucide-react';
import {
  DashboardOutlined,
  PartitionOutlined,
  ToolOutlined,
  ScheduleOutlined,
  PlayCircleOutlined,
  InboxOutlined,
  SwapOutlined,
  ExperimentOutlined,
  NodeIndexOutlined,
  DashboardFilled,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  CrownOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useUser, roleLabels } from '../contexts/UserContext';
import AppSwitcher from '../components/AppSwitcher';
import type { UserRole } from '../contexts/UserContext';
import { alerts } from '../data/alerts';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  production: '#1B3A5C',
  department: '#0891b2',
  director: '#7c3aed',
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  production: <ToolOutlined />,
  department: <TeamOutlined />,
  director: <CrownOutlined />,
};

// Breadcrumb mapping
const pathNameMap: Record<string, string> = {
  'product-structures': 'Cấu trúc sản phẩm',
  'process-routings': 'Công nghệ & Công đoạn',
  'production-plans': 'Kế hoạch sản xuất',
  'production-orders': 'Lệnh sản xuất',
  'completion': 'Hoàn thành & Nhập kho',
  'engineering-changes': 'Thay đổi kỹ thuật',
  'material-production': 'Sản xuất vật tư kỹ thuật',
  'wip-tracking': 'Bán thành phẩm',
  'capacity': 'Năng lực sản xuất',
  'reports': 'Báo cáo',
  'new': 'Thêm mới',
  'edit': 'Chỉnh sửa',
};

const BreadcrumbNav: React.FC<{ pathname: string; navigate: (path: string) => void }> = ({ pathname, navigate }) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const items = [
    {
      title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#1B3A5C' }}><HomeOutlined /> Dashboard</span>,
    },
    ...segments.map((seg, idx) => {
      const path = '/' + segments.slice(0, idx + 1).join('/');
      const label = pathNameMap[seg] || (seg.startsWith('BOM-') || seg.startsWith('RT-') || seg.startsWith('LSX-') || seg.startsWith('PL-') || seg.startsWith('ECR-') || seg.startsWith('MPO-') || seg.startsWith('WIP-') || seg.startsWith('CMP-') ? seg : seg);
      const isLast = idx === segments.length - 1;

      return {
        title: isLast
          ? <span style={{ color: '#8c8c8c' }}>{label}</span>
          : <span onClick={() => navigate(path)} style={{ cursor: 'pointer', color: '#1B3A5C' }}>{label}</span>,
      };
    }),
  ];

  if (segments.length === 0) return null;

  return (
    <Breadcrumb items={items} style={{ fontSize: 13 }} />
  );
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole, isProduction, isDepartment, isDirector } = useUser();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const getMenuItems = (): MenuProps['items'] => {
    const commonItems: MenuProps['items'] = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
    ];

    if (isProduction) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/product-structures',
          icon: <PartitionOutlined />,
          label: 'Cấu trúc sản phẩm',
        },
        {
          key: '/process-routings',
          icon: <NodeIndexOutlined />,
          label: 'Công nghệ & Công đoạn',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/production-plans',
          icon: <ScheduleOutlined />,
          label: 'Kế hoạch sản xuất',
        },
        {
          key: '/production-orders',
          icon: <PlayCircleOutlined />,
          label: 'Lệnh sản xuất',
        },
        {
          key: '/completion',
          icon: <InboxOutlined />,
          label: 'Hoàn thành & Nhập kho',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/engineering-changes',
          icon: <SwapOutlined />,
          label: 'Thay đổi kỹ thuật',
        },
        {
          key: '/material-production',
          icon: <ExperimentOutlined />,
          label: 'SX vật tư kỹ thuật',
        },
        {
          key: '/wip-tracking',
          icon: <NodeIndexOutlined />,
          label: 'Bán thành phẩm',
        },
        {
          key: '/capacity',
          icon: <DashboardFilled />,
          label: 'Năng lực sản xuất',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo',
        },
      ];
    }

    if (isDepartment) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/production-plans',
          icon: <ScheduleOutlined />,
          label: 'Kế hoạch sản xuất',
        },
        {
          key: '/production-orders',
          icon: <PlayCircleOutlined />,
          label: 'Lệnh sản xuất',
        },
        {
          key: '/wip-tracking',
          icon: <NodeIndexOutlined />,
          label: 'Bán thành phẩm',
        },
        {
          key: '/capacity',
          icon: <DashboardFilled />,
          label: 'Năng lực sản xuất',
        },
      ];
    }

    if (isDirector) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/production-plans',
          icon: <ScheduleOutlined />,
          label: 'Kế hoạch sản xuất',
        },
        {
          key: '/production-orders',
          icon: <PlayCircleOutlined />,
          label: 'Lệnh sản xuất',
        },
        {
          key: '/capacity',
          icon: <DashboardFilled />,
          label: 'Năng lực sản xuất',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo',
        },
      ];
    }

    return commonItems;
  };

  const roleOptions = (['production', 'department', 'director'] as UserRole[]).map((role) => ({
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
    if (path.startsWith('/product-structures')) return ['/product-structures'];
    if (path.startsWith('/process-routings')) return ['/process-routings'];
    if (path.startsWith('/production-plans')) return ['/production-plans'];
    if (path.startsWith('/production-orders')) return ['/production-orders'];
    if (path.startsWith('/completion')) return ['/completion'];
    if (path.startsWith('/engineering-changes')) return ['/engineering-changes'];
    if (path.startsWith('/material-production')) return ['/material-production'];
    if (path.startsWith('/wip-tracking')) return ['/wip-tracking'];
    if (path.startsWith('/capacity')) return ['/capacity'];
    if (path.startsWith('/reports')) return ['/reports'];
    return [path];
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
        {/* Logo Area */}
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
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
          }}>
            <Factory size={20} color="#0a1628" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Quản lý Sản xuất
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 400 }}>
                Trung tâm Phần mềm Alpha
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
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8, background: 'transparent' }}
        />

        {/* Sidebar footer */}
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
          <Space size={12} align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, color: '#666' }}
            />
            <BreadcrumbNav pathname={location.pathname} navigate={navigate} />
          </Space>
          <Space size={16}>
            <AppSwitcher currentApp="sanxuat" />
            <Badge count={unreadAlerts} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#666' }} />}
                onClick={() => navigate('/')}
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
