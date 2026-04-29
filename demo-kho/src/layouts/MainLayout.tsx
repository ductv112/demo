import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  HomeOutlined,
  ImportOutlined,
  ExportOutlined,
  SwapOutlined,
  AppstoreOutlined,
  InboxOutlined,
  AuditOutlined,
  BarChartOutlined,
  AlertOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  StockOutlined,
  HistoryOutlined,
  TeamOutlined,
  ReconciliationOutlined,
  FieldTimeOutlined,
  TagsOutlined,
  BoxPlotOutlined,
  BarcodeOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  FormOutlined,
  FundOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Warehouse } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { alerts } from '../data/alerts';
import AppSwitcher from '../components/AppSwitcher';
import { useUser } from '../contexts/UserContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// ─── Breadcrumb path → label mapping ───────────────────────
const pathNameMap: Record<string, string> = {
  'products':         'Danh mục vật tư',
  'product-requests': 'Yêu cầu bổ sung DM',
  'product-classifications': 'Phân loại vật tư',
  'warehouses':       'Kho & Vị trí',
  'inbound':          'Nhập kho',
  'outbound':         'Xuất kho & Cấp phát',
  'transfers':        'Điều chuyển kho',
  'inventory':        'Tồn kho',
  'replenishment':    'Bổ sung vật tư',
  'demand':           'Bổ sung theo Nhu cầu',
  'plan':             'Lập kế hoạch Bổ sung',
  'approval':         'Phê duyệt',
  'stock-count':      'Kiểm kê & Điều chỉnh',
  'packages':         'Kiện hàng & Đóng gói',
  'tracking':         'Theo dõi vật tư',
  'lifecycle':        'Vòng đời & Hạn sử dụng',
  'traceability':     'Truy xuất nguồn gốc',
  'data-quality':     'Kiểm soát & Chuẩn hóa dữ liệu',
  'alerts':           'Cảnh báo',
  'reports':          'Báo cáo',
  'new':              'Tạo mới',
  'edit':             'Chỉnh sửa',
  'forecast':         'Dự báo & Giám sát',
  'locations':        'Vị trí lưu trữ',
  'history':          'Lịch sử xuất nhập',
  'dispatch':         'Cấp phát vật tư',
  'aging':            'Tuổi tồn kho',
  'slow-moving':      'Chậm luân chuyển',
};

// ─── Breadcrumb component ───────────────────────────────────
const BreadcrumbNav: React.FC<{ pathname: string; navigate: (path: string) => void }> = ({ pathname, navigate }) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const isId = (seg: string) =>
    /^[a-z]+-\d+$/.test(seg) || /^[A-Z]{2,}-\d{4}-\d+$/.test(seg) || seg === 'new' || seg === 'edit';

  const items = [
    {
      title: (
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#1B3A5C' }}>
          <HomeOutlined /> Dashboard
        </span>
      ),
    },
    ...segments.map((seg, idx) => {
      const path = '/' + segments.slice(0, idx + 1).join('/');
      const label = pathNameMap[seg] || (isId(seg) ? 'Chi tiết' : seg);
      const isLast = idx === segments.length - 1;
      return {
        title: isLast
          ? <span style={{ color: '#8c8c8c' }}>{label}</span>
          : <span onClick={() => navigate(path)} style={{ cursor: 'pointer', color: '#1B3A5C' }}>{label}</span>,
      };
    }),
  ];

  return <Breadcrumb items={items} style={{ fontSize: 13 }} />;
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const divider = { type: 'divider' as const, style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } };

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    divider,
    // ── Danh mục vật tư (master data group) ─────────────
    {
      key: 'catalog-group',
      icon: <DatabaseOutlined />,
      label: 'Danh mục vật tư',
      children: [
        { key: '/products', icon: <DatabaseOutlined />, label: 'Danh mục vật tư' },
        { key: '/product-requests', icon: <AuditOutlined />, label: 'Yêu cầu bổ sung DM' },
        { key: '/product-classifications', icon: <TagsOutlined />,              label: 'Phân loại & Thuộc tính' },
        { key: '/data-quality',            icon: <SafetyCertificateOutlined />, label: 'Chuẩn hóa dữ liệu' },
      ],
    },
    divider,
    // ── Vận hành kho (ops group) ─────────────────────────
    {
      key: 'ops-group',
      icon: <AppstoreOutlined />,
      label: 'Vận hành kho',
      children: [
        { key: '/warehouses',   icon: <HomeOutlined />,          label: 'Kho & Vị trí' },
        { key: '/inventory',    icon: <AppstoreOutlined />,      label: 'Tồn kho' },
        { key: '/stock-count',  icon: <ReconciliationOutlined />,label: 'Kiểm kê & Điều chỉnh' },
        { key: '/inbound',      icon: <ImportOutlined />,        label: 'Nhập kho' },
        { key: '/outbound',     icon: <ExportOutlined />,        label: 'Xuất kho & Cấp phát' },
        { key: '/transfers',    icon: <SwapOutlined />,          label: 'Điều chuyển kho' },
      ],
    },
    divider,
    // ── Bổ sung vật tư ───────────────────────────────────
    {
      key: 'replenishment-group',
      icon: <InboxOutlined />,
      label: 'Bổ sung vật tư',
      children: [
        { key: '/replenishment/demand',     icon: <FormOutlined />,          label: 'Theo nhu cầu' },
        { key: '/replenishment/forecast',   icon: <FundOutlined />,          label: 'Dự báo & Giám sát' },
        { key: '/replenishment/plan',       icon: <CalendarOutlined />,      label: 'Lập kế hoạch' },
        { key: '/replenishment/approval',   icon: <CheckCircleOutlined />,   label: 'Phê duyệt' },
      ],
    },
    divider,
    // ── Truy xuất & Chất lượng ───────────────────────────
    {
      key: 'trace-group',
      icon: <NodeIndexOutlined />,
      label: 'Truy xuất & Chất lượng',
      children: [
        { key: '/packages',     icon: <BoxPlotOutlined />,       label: 'Kiện hàng & Đóng gói' },
        { key: '/tracking',     icon: <BarcodeOutlined />,       label: 'Theo dõi vật tư' },
        { key: '/lifecycle',    icon: <ClockCircleOutlined />,   label: 'Vòng đời & Hạn sử dụng' },
        { key: '/traceability', icon: <NodeIndexOutlined />,     label: 'Truy xuất nguồn gốc' },
      ],
    },
    divider,
    // ── Báo cáo ──────────────────────────────────────────
    {
      key: 'reports-group',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      children: [
        { key: '/reports/inventory',   icon: <StockOutlined />,          label: 'Tồn kho' },
        { key: '/reports/history',     icon: <HistoryOutlined />,        label: 'Lịch sử xuất nhập' },
        { key: '/reports/dispatch',    icon: <TeamOutlined />,           label: 'Cấp phát vật tư' },
        { key: '/reports/stock-count', icon: <ReconciliationOutlined />, label: 'Kiểm kê & chênh lệch' },
        { key: '/reports/aging',       icon: <FieldTimeOutlined />,      label: 'Tuổi tồn kho' },
      ],
    },
    // ── Cảnh báo ─────────────────────────────────────────
    {
      key: '/alerts',
      icon: <AlertOutlined />,
      label: (
        <span>
          Cảnh báo
          {unreadAlerts > 0 && <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['/'];
    // catalog group
    if (path.startsWith('/products')) return ['/products'];
    if (path.startsWith('/product-requests')) return ['/product-requests'];
    if (path.startsWith('/product-classifications')) return ['/product-classifications'];
    if (path.startsWith('/data-quality')) return ['/data-quality'];
    // transactions (flat)
    if (path.startsWith('/inbound')) return ['/inbound'];
    if (path.startsWith('/outbound')) return ['/outbound'];
    if (path.startsWith('/transfers')) return ['/transfers'];
    // ops group
    if (path.startsWith('/warehouses')) return ['/warehouses'];
    if (path.startsWith('/inventory')) return ['/inventory'];
    if (path.startsWith('/stock-count')) return ['/stock-count'];
    if (path.startsWith('/replenishment')) {
      const exact = ['/replenishment/demand', '/replenishment/forecast', '/replenishment/plan', '/replenishment/approval'];
      const match = exact.find(p => path.startsWith(p));
      return [match || '/replenishment'];
    }
    if (path.startsWith('/packages')) return ['/packages'];
    if (path.startsWith('/lifecycle')) return ['/lifecycle'];
    if (path.startsWith('/traceability')) return ['/traceability'];
    // reports group
    if (path.startsWith('/reports/')) return [path];
    if (path === '/reports') return ['/reports/inventory'];
    if (path.startsWith('/alerts')) return ['/alerts'];
    return [path];
  };

  const getOpenKeys = (): string[] => {
    const path = location.pathname;
    if (path.startsWith('/products') || path.startsWith('/product-requests') || path.startsWith('/product-classifications') || path.startsWith('/data-quality')) {
      return ['catalog-group'];
    }
    if (path.startsWith('/inbound') || path.startsWith('/outbound') || path.startsWith('/transfers') ||
        path.startsWith('/warehouses') || path.startsWith('/inventory') || path.startsWith('/stock-count')) {
      return ['ops-group'];
    }
    if (path.startsWith('/replenishment')) {
      return ['replenishment-group'];
    }
    if (path.startsWith('/packages') || path.startsWith('/tracking') || path.startsWith('/lifecycle') || path.startsWith('/traceability')) {
      return ['trace-group'];
    }
    if (path.startsWith('/reports')) return ['reports-group'];
    return [];
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
      color: rgba(255,255,255,0.35) !important;
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
        {/* Logo */}
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
            <Warehouse size={20} color="#0a1628" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Quản lý Kho
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
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8, background: 'transparent' }}
        />
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
            <div style={{ height: 20, width: 1, background: '#e8e8e8' }} />
            <BreadcrumbNav pathname={location.pathname} navigate={navigate} />
          </Space>
          <Space size={16}>
            <AppSwitcher currentApp="kho" />
            <Badge count={unreadAlerts} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#666' }} />}
                onClick={() => navigate('/alerts')}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={32}
                  style={{
                    background: 'linear-gradient(135deg, #1B3A5C, #1B3A5C88)',
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
