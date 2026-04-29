import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  FileTextOutlined,
  ShopOutlined,
  AuditOutlined,
  ContainerOutlined,
  InboxOutlined,
  DollarOutlined,
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
  BankOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { alerts } from '../data/alerts';
import AppSwitcher from '../components/AppSwitcher';
import { useUser } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';
import { usePageHeader } from '../contexts/PageHeaderContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  procurement: '#1B3A5C',
  department: '#0891b2',
  director: '#7c3aed',
};


const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isProcurement, isDepartment, isDirector } = useUser();
  const { headerActions } = usePageHeader();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  // ─── Dynamic menu based on role ─────────────────────────────────
  const getMenuItems = (): MenuProps['items'] => {
    const commonItems: MenuProps['items'] = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
    ];

    if (isProcurement) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: 'demand-group',
          icon: <FileTextOutlined />,
          label: 'Nhu cầu & Kế hoạch',
          children: [
            { key: '/material-requests', icon: <SolutionOutlined />, label: 'Nhu cầu vật tư' },
            { key: '/supply-plans', icon: <FileDoneOutlined />, label: 'KH bảo đảm vật tư' },
          ],
        },
        {
          key: 'sourcing-group',
          icon: <ShopOutlined />,
          label: 'Nhà cung cấp',
          children: [
            { key: '/suppliers', icon: <ShopOutlined />, label: 'Danh sách NCC' },
            { key: '/bidding', icon: <AuditOutlined />, label: 'Đấu thầu' },
          ],
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/contracts',
          icon: <ContainerOutlined />,
          label: 'Hợp đồng mua sắm',
        },
        {
          key: '/receiving',
          icon: <InboxOutlined />,
          label: 'Xử lý vật tư lỗi',
        },
        {
          key: '/payments',
          icon: <DollarOutlined />,
          label: 'Thanh toán & Đối soát',
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
          key: '/material-requests',
          icon: <SolutionOutlined />,
          label: 'Đề xuất nhu cầu',
        },
        {
          key: '/supply-plans',
          icon: <FileDoneOutlined />,
          label: 'KH bảo đảm vật tư',
        },
        {
          key: '/contracts',
          icon: <ContainerOutlined />,
          label: 'Hợp đồng mua sắm',
        },
      ];
    }

    if (isDirector) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: 'approval-group',
          icon: <CheckCircleOutlined />,
          label: 'Phê duyệt',
          children: [
            { key: '/approvals/plans', icon: <FileTextOutlined />, label: 'Phê duyệt kế hoạch' },
            { key: '/approvals/bidding', icon: <AuditOutlined />, label: 'Phê duyệt đấu thầu' },
            { key: '/approvals/payments', icon: <DollarOutlined />, label: 'Phê duyệt thanh toán' },
          ],
        },
        {
          key: '/supply-plans',
          icon: <FileDoneOutlined />,
          label: 'KH bảo đảm vật tư',
        },
        {
          key: '/contracts',
          icon: <ContainerOutlined />,
          label: 'Hợp đồng mua sắm',
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

  // ─── Breadcrumb ─────────────────────────────────────────────────
  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const home = { title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#1B3A5C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><HomeOutlined />Tổng quan</span> };

    const routeMap: { pattern: RegExp; crumbs: (m: RegExpMatchArray) => { title: React.ReactNode }[] }[] = [
      { pattern: /^\/material-requests\/(.+)$/, crumbs: () => [{ title: <span onClick={() => navigate('/material-requests')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Nhu cầu vật tư</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chi tiết</span> }] },
      { pattern: /^\/material-requests$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Nhu cầu vật tư</span> }] },
      { pattern: /^\/supply-plans\/new$/, crumbs: () => [{ title: <span onClick={() => navigate('/supply-plans')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>KH bảo đảm vật tư</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Tạo mới</span> }] },
      { pattern: /^\/supply-plans\/(.+)\/edit$/, crumbs: () => [{ title: <span onClick={() => navigate('/supply-plans')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>KH bảo đảm vật tư</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chỉnh sửa</span> }] },
      { pattern: /^\/supply-plans\/(.+)$/, crumbs: () => [{ title: <span onClick={() => navigate('/supply-plans')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>KH bảo đảm vật tư</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chi tiết</span> }] },
      { pattern: /^\/supply-plans$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>KH bảo đảm vật tư</span> }] },
      { pattern: /^\/suppliers\/(.+)$/, crumbs: () => [{ title: <span onClick={() => navigate('/suppliers')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Nhà cung cấp</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chi tiết</span> }] },
      { pattern: /^\/suppliers$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Nhà cung cấp</span> }] },
      { pattern: /^\/bidding\/new$/, crumbs: () => [{ title: <span onClick={() => navigate('/bidding')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Đấu thầu</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Tạo mới</span> }] },
      { pattern: /^\/bidding\/(.+)\/edit$/, crumbs: () => [{ title: <span onClick={() => navigate('/bidding')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Đấu thầu</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chỉnh sửa</span> }] },
      { pattern: /^\/bidding\/(.+)$/, crumbs: () => [{ title: <span onClick={() => navigate('/bidding')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Đấu thầu</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chi tiết</span> }] },
      { pattern: /^\/bidding$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Đấu thầu & Chào giá</span> }] },
      { pattern: /^\/contracts\/new$/, crumbs: () => [{ title: <span onClick={() => navigate('/contracts')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Hợp đồng</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Tạo mới</span> }] },
      { pattern: /^\/contracts\/(.+)\/edit$/, crumbs: () => [{ title: <span onClick={() => navigate('/contracts')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Hợp đồng</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chỉnh sửa</span> }] },
      { pattern: /^\/contracts\/(.+)$/, crumbs: () => [{ title: <span onClick={() => navigate('/contracts')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Hợp đồng</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chi tiết</span> }] },
      { pattern: /^\/contracts$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Hợp đồng mua sắm</span> }] },
      { pattern: /^\/receiving$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Xử lý vật tư lỗi</span> }] },
      { pattern: /^\/payments\/new$/, crumbs: () => [{ title: <span onClick={() => navigate('/payments')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Thanh toán & Đối soát</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Tạo phiếu</span> }] },
      { pattern: /^\/payments\/(.+)$/, crumbs: () => [{ title: <span onClick={() => navigate('/payments')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>Thanh toán & Đối soát</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Chi tiết</span> }] },
      { pattern: /^\/payments$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Thanh toán & Đối soát</span> }] },
      { pattern: /^\/reports$/, crumbs: () => [{ title: <span style={{ color: '#333', fontWeight: 500 }}>Báo cáo</span> }] },
      { pattern: /^\/approvals\/plans$/, crumbs: () => [{ title: <span style={{ color: '#1B3A5C' }}>Phê duyệt</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Kế hoạch</span> }] },
      { pattern: /^\/approvals\/bidding$/, crumbs: () => [{ title: <span style={{ color: '#1B3A5C' }}>Phê duyệt</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Đấu thầu</span> }] },
      { pattern: /^\/approvals\/payments$/, crumbs: () => [{ title: <span style={{ color: '#1B3A5C' }}>Phê duyệt</span> }, { title: <span style={{ color: '#333', fontWeight: 500 }}>Thanh toán</span> }] },
    ];

    if (path === '/') return [home];

    for (const route of routeMap) {
      const match = path.match(route.pattern);
      if (match) return [home, ...route.crumbs(match)];
    }

    return [home];
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
    if (path.startsWith('/approvals/plans')) return ['/approvals/plans'];
    if (path.startsWith('/approvals/bidding')) return ['/approvals/bidding'];
    if (path.startsWith('/approvals/payments')) return ['/approvals/payments'];
    if (path.startsWith('/material-requests')) return ['/material-requests'];
    if (path.startsWith('/supply-plans')) return ['/supply-plans'];
    if (path.startsWith('/suppliers')) return ['/suppliers'];
    if (path.startsWith('/bidding')) return ['/bidding'];
    if (path.startsWith('/contracts')) return ['/contracts'];
    if (path.startsWith('/receiving')) return ['/receiving'];
    if (path.startsWith('/payments')) return ['/payments'];
    if (path.startsWith('/reports')) return ['/reports'];
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
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
          }}>
            <ShoppingCart size={20} color="#0a1628" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Quản lý Mua hàng
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 400 }}>
                Doanh nghiệp A
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
          {/* Left: toggle + breadcrumb */}
          <Space size={12}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, color: '#666' }}
            />
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ fontSize: 13 }}
              separator={<span style={{ color: '#bbb' }}>/</span>}
            />
          </Space>

          {/* Right: bell + user */}
          <Space size={12}>
            <AppSwitcher currentApp="muahang" />
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
