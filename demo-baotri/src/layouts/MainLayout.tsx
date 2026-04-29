import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, theme, Tag, Segmented } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ToolOutlined,
  AlertOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  MonitorOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  AppstoreOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Wrench } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { alerts } from '../data/alerts';
import { useUser, roleLabels } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';
import AppSwitcher from '../components/AppSwitcher';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  maintenance: '#1B3A5C',
  department: '#0891b2',
  director: '#7c3aed',
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  maintenance: <ToolOutlined />,
  department: <TeamOutlined />,
  director: <CrownOutlined />,
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole, isMaintenance, isDepartment, isDirector } = useUser();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  // ─── Divider helper ─────────────────────────────────────────
  const menuDivider = { type: 'divider' as const, style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } };

  const getMenuItems = (): MenuProps['items'] => {
    if (isMaintenance) {
      return [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: 'Tổng quan',
        },
        menuDivider,
        // ── Nhóm 1: Kế hoạch & Nguồn lực ──
        {
          key: 'plan-group',
          icon: <CalendarOutlined />,
          label: 'Kế hoạch & Nguồn lực',
          children: [
            { key: '/maintenance-plans', icon: <CalendarOutlined />, label: 'Kế hoạch bảo trì' },
            { key: '/maintenance-team', icon: <TeamOutlined />, label: 'Đội ngũ kỹ thuật' },
            { key: '/procedures', icon: <FileTextOutlined />, label: 'Quy trình & Hướng dẫn' },
            { key: '/material-requests', icon: <ShoppingCartOutlined />, label: 'Quản lý vật tư' },
          ],
        },
        // ── Nhóm 2: Thực hiện bảo trì ──
        {
          key: 'execution-group',
          icon: <ToolOutlined />,
          label: 'Thực hiện bảo trì',
          children: [
            { key: '/work-orders', icon: <FileProtectOutlined />, label: 'Lệnh công việc (WO)' },
            { key: '/scheduled-maintenance', icon: <ToolOutlined />, label: 'Bảo trì định kỳ' },
            { key: '/corrective-maintenance', icon: <ExperimentOutlined />, label: 'Sửa chữa nhỏ' },
          ],
        },
        // ── Nhóm 3: Giám sát & Phân tích ──
        {
          key: 'monitoring-group',
          icon: <MonitorOutlined />,
          label: (
            <span>
              Giám sát & Phân tích
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
          children: [
            { key: '/equipment-monitoring', icon: <MonitorOutlined />, label: 'Theo dõi thiết bị' },
            { key: '/maintenance-history', icon: <HistoryOutlined />, label: 'Lịch sử bảo trì' },
            { key: '/evaluation', icon: <RiseOutlined />, label: 'Đánh giá & Cải tiến' },
          ],
        },
        menuDivider,
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo',
        },
      ];
    }

    if (isDepartment) {
      return [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: 'Tổng quan',
        },
        menuDivider,
        // ── Thực hiện bảo trì ──
        {
          key: 'execution-group',
          icon: <ToolOutlined />,
          label: 'Thực hiện bảo trì',
          children: [
            { key: '/work-orders', icon: <FileProtectOutlined />, label: 'Lệnh công việc (WO)' },
            { key: '/scheduled-maintenance', icon: <ToolOutlined />, label: 'Bảo trì định kỳ' },
            { key: '/corrective-maintenance', icon: <ExperimentOutlined />, label: 'Yêu cầu sửa chữa' },
            { key: '/material-requests', icon: <ShoppingCartOutlined />, label: 'Quản lý vật tư' },
          ],
        },
        // ── Giám sát ──
        {
          key: 'monitoring-group',
          icon: <MonitorOutlined />,
          label: (
            <span>
              Giám sát thiết bị
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
          children: [
            { key: '/equipment-monitoring', icon: <MonitorOutlined />, label: 'Theo dõi thiết bị' },
            { key: '/maintenance-history', icon: <HistoryOutlined />, label: 'Lịch sử bảo trì' },
          ],
        },
      ];
    }

    if (isDirector) {
      return [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: 'Tổng quan',
        },
        menuDivider,
        // ── Phê duyệt ──
        {
          key: 'approval-group',
          icon: <CheckCircleOutlined />,
          label: 'Phê duyệt',
          children: [
            { key: '/maintenance-plans', icon: <CalendarOutlined />, label: 'Kế hoạch bảo trì' },
          ],
        },
        // ── Theo dõi thực hiện ──
        {
          key: 'execution-group',
          icon: <ToolOutlined />,
          label: 'Theo dõi thực hiện',
          children: [
            { key: '/work-orders', icon: <FileProtectOutlined />, label: 'Lệnh công việc (WO)' },
            { key: '/scheduled-maintenance', icon: <ToolOutlined />, label: 'Bảo trì định kỳ' },
            { key: '/corrective-maintenance', icon: <ExperimentOutlined />, label: 'Sửa chữa nhỏ' },
          ],
        },
        // ── Giám sát & Đánh giá ──
        {
          key: 'monitoring-group',
          icon: <MonitorOutlined />,
          label: (
            <span>
              Giám sát & Đánh giá
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
          children: [
            { key: '/equipment-monitoring', icon: <MonitorOutlined />, label: 'Theo dõi thiết bị' },
            { key: '/evaluation', icon: <RiseOutlined />, label: 'Đánh giá & Cải tiến' },
          ],
        },
        menuDivider,
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo',
        },
      ];
    }

    return [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
      },
    ];
  };

  const roleOptions = (['maintenance', 'department', 'director'] as UserRole[]).map((role) => ({
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
    if (path.startsWith('/maintenance-team')) return ['/maintenance-team'];
    if (path.startsWith('/procedures')) return ['/procedures'];
    if (path.startsWith('/maintenance-plans')) return ['/maintenance-plans'];
    if (path.startsWith('/work-orders')) return ['/work-orders'];
    if (path.startsWith('/scheduled-maintenance')) return ['/scheduled-maintenance'];
    if (path.startsWith('/corrective-maintenance')) return ['/corrective-maintenance'];
    if (path.startsWith('/material-requests')) return ['/material-requests'];
    if (path.startsWith('/equipment-monitoring')) return ['/equipment-monitoring'];
    if (path.startsWith('/maintenance-history')) return ['/maintenance-history'];
    if (path.startsWith('/evaluation')) return ['/evaluation'];
    if (path.startsWith('/reports')) return ['/reports'];
    return [path];
  };

  // ─── Quản lý submenu mở/đóng theo click ────────────────────
  const getDefaultOpenKey = (): string[] => {
    const path = location.pathname;
    if (path.startsWith('/maintenance-plans') || path.startsWith('/maintenance-team') || path.startsWith('/procedures') || path.startsWith('/material-requests')) return ['plan-group'];
    if (path.startsWith('/work-orders') || path.startsWith('/scheduled-maintenance') || path.startsWith('/corrective-maintenance')) return ['execution-group'];
    if (path.startsWith('/equipment-monitoring') || path.startsWith('/maintenance-history') || path.startsWith('/evaluation')) return ['monitoring-group'];
    if (path.startsWith('/approvals')) return ['approval-group'];
    return [];
  };
  const [openKeys, setOpenKeys] = useState<string[]>(getDefaultOpenKey());

  const siderMenuStyles = `
    .sider-menu .ant-menu-submenu > .ant-menu-submenu-title {
      font-weight: 600 !important;
      font-size: 13px !important;
      letter-spacing: 0.3px;
      color: rgba(255,255,255,0.9) !important;
      margin-top: 4px;
    }
    .sider-menu .ant-menu-submenu-arrow {
      color: rgba(255,255,255,0.35) !important;
      font-size: 10px !important;
    }
    .sider-menu .ant-menu-submenu-open > .ant-menu-submenu-title > .ant-menu-submenu-arrow {
      color: rgba(255,255,255,0.6) !important;
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
            fontWeight: 800,
            fontSize: 14,
            color: '#0a1628',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
            letterSpacing: '-0.5px',
          }}>
            BT
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Quản lý Bảo trì
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
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8, background: 'transparent' }}
        />

        {/* Sidebar footer — user info */}
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
            <AppSwitcher currentApp="baotri" />
            <Badge count={unreadAlerts} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#666' }} />}
                onClick={() => navigate('/equipment-monitoring')}
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
