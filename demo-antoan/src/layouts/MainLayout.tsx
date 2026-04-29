import React, { useState } from 'react';
import {
  Layout, Menu, Avatar, Dropdown, Badge, Space, Typography,
  Button, Breadcrumb,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { HardHat } from 'lucide-react';
import {
  DashboardOutlined,
  WarningOutlined,
  AlertOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  CrownOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CheckSquareOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useUser, roleLabels } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';
import { safetyAlerts } from '../data/alerts';
import AppSwitcher from '../components/AppSwitcher';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  safety:     '#1B3A5C',
  department: '#0891b2',
  director:   '#7c3aed',
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  safety:     <SafetyOutlined />,
  department: <TeamOutlined />,
  director:   <CrownOutlined />,
};

const pathNameMap: Record<string, string> = {
  'su-co':                'Sự cố & Tai nạn',
  'rui-ro':               'Rủi ro Kỹ thuật',
  'ma-tran-rui-ro':       'Ma trận Rủi ro',
  'kiem-soat-van-hanh':   'Phiếu Kiểm soát An toàn',
  'vi-pham':              'Vi phạm An toàn',
  'tieu-chuan':           'Tiêu chuẩn An toàn',
  'cai-tien-phong-ngua':  'Cải tiến & Phòng ngừa',
  'bao-cao':              'Báo cáo Tổng hợp',
  'new':                  'Thêm mới',
  'edit':                 'Chỉnh sửa',
};

const BreadcrumbNav: React.FC<{ pathname: string; navigate: (p: string) => void }> = ({
  pathname, navigate,
}) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

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
      const isId = seg.startsWith('SC-') || seg.startsWith('RR-') || seg.startsWith('VP-') || seg.startsWith('AT-') || /^[A-Z]{2,}\d{3}$/.test(seg);
      const label = pathNameMap[seg] ?? (isId ? seg : seg);
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
  const { currentUser, switchRole, isSafety, isDepartment, isDirector } = useUser();

  const unreadAlerts = safetyAlerts.filter(a => !a.isRead).length;

  const getMenuItems = (): MenuProps['items'] => {
    const dashboard: MenuProps['items'] = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
    ];

    type ItemType = NonNullable<MenuProps['items']>[number];
    const divider = (key: string): ItemType => ({
      type: 'divider',
      key,
      style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' },
    });

    if (isSafety) {
      return [
        ...dashboard,
        divider('d0'),
        { key: '/tieu-chuan', icon: <SafetyOutlined />, label: 'Tiêu chuẩn An toàn' },
        divider('d1'),
        { key: '/ma-tran-rui-ro',     icon: <ApartmentOutlined />,   label: 'Ma trận Rủi ro' },
        { key: '/rui-ro',             icon: <WarningOutlined />,     label: 'Rủi ro Kỹ thuật' },
        { key: '/kiem-soat-van-hanh', icon: <CheckSquareOutlined />, label: 'Phiếu Kiểm soát An toàn' },
        divider('d2'),
        {
          key: '/vi-pham',
          icon: <FileProtectOutlined />,
          label: (
            <span>
              Vi phạm An toàn
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
        },
        { key: '/su-co', icon: <AlertOutlined />, label: 'Sự cố & Tai nạn' },
        divider('d3'),
        { key: '/cai-tien-phong-ngua', icon: <BulbOutlined />, label: 'Cải tiến & Phòng ngừa' },
        divider('d4'),
        { key: '/bao-cao', icon: <BarChartOutlined />, label: 'Báo cáo Tổng hợp' },
      ];
    }

    if (isDepartment) {
      return [
        ...dashboard,
        divider('d0'),
        { key: '/tieu-chuan',         icon: <SafetyOutlined />,      label: 'Tiêu chuẩn An toàn' },
        divider('d1'),
        { key: '/rui-ro',             icon: <WarningOutlined />,     label: 'Rủi ro Kỹ thuật' },
        { key: '/kiem-soat-van-hanh', icon: <CheckSquareOutlined />, label: 'Phiếu Kiểm soát An toàn' },
        divider('d2'),
        { key: '/vi-pham', icon: <FileProtectOutlined />, label: 'Vi phạm An toàn' },
        { key: '/su-co',   icon: <AlertOutlined />,       label: 'Sự cố & Tai nạn' },
      ];
    }

    if (isDirector) {
      return [
        ...dashboard,
        divider('d0'),
        { key: '/ma-tran-rui-ro', icon: <ApartmentOutlined />, label: 'Ma trận Rủi ro' },
        { key: '/rui-ro',         icon: <WarningOutlined />,   label: 'Rủi ro Kỹ thuật' },
        divider('d1'),
        { key: '/vi-pham', icon: <FileProtectOutlined />, label: 'Vi phạm An toàn' },
        { key: '/su-co',   icon: <AlertOutlined />,       label: 'Sự cố & Tai nạn' },
        divider('d2'),
        { key: '/cai-tien-phong-ngua', icon: <BulbOutlined />, label: 'Cải tiến & Phòng ngừa' },
        divider('d3'),
        { key: '/bao-cao', icon: <BarChartOutlined />, label: 'Báo cáo Tổng hợp' },
      ];
    }

    return dashboard;
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile',  icon: <UserOutlined />,   label: 'Thông tin cá nhân' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: 'logout',   icon: <LogoutOutlined />,  label: 'Đăng xuất' },
  ];

  const getSelectedKey = (): string[] => {
    const p = location.pathname;
    if (p === '/') return ['/'];
    const map: Record<string, string> = {
      '/su-co':                '/su-co',
      '/ma-tran-rui-ro':       '/ma-tran-rui-ro',
      '/rui-ro':               '/rui-ro',
      '/kiem-soat-van-hanh':   '/kiem-soat-van-hanh',
      '/vi-pham':              '/vi-pham',
      '/tieu-chuan':           '/tieu-chuan',
      '/cai-tien-phong-ngua':  '/cai-tien-phong-ngua',
      '/bao-cao':              '/bao-cao',
    };
    for (const [prefix, key] of Object.entries(map)) {
      if (p.startsWith(prefix)) return [key];
    }
    return [p];
  };

  const siderMenuStyles = `
    .sider-menu .ant-menu-item {
      font-weight: 500 !important;
      font-size: 13px !important;
      color: rgba(255,255,255,0.75) !important;
    }
    .sider-menu .ant-menu-item:hover {
      color: #fff !important;
    }
    .sider-menu .ant-menu-item-selected {
      color: #fff !important;
      background: rgba(27, 58, 92, 0.6) !important;
      font-weight: 600 !important;
    }
    .sider-menu .ant-menu-item-divider {
      border-color: rgba(255,255,255,0.06) !important;
    }
    .ant-layout-sider-children {
      display: flex !important;
      flex-direction: column !important;
      height: 100% !important;
      overflow: hidden !important;
    }
    .sider-scroll-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .sider-scroll-area::-webkit-scrollbar {
      width: 5px;
    }
    .sider-scroll-area::-webkit-scrollbar-track {
      background: transparent;
    }
    .sider-scroll-area::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }
    .sider-scroll-area::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.2);
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
          overflow: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ─── Logo ─── */}
        <div style={{
          height: 64,
          flexShrink: 0,
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
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
          }}>
            <HardHat size={20} color="#0a1628" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                An toàn Kỹ thuật
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap' }}>
                Nhà máy Z119
              </div>
            </div>
          )}
        </div>

        {/* ─── Menu (scrollable) ─── */}
        <div className="sider-scroll-area">
          <Menu
            className="sider-menu"
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKey()}
            items={getMenuItems()}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, marginTop: 8, background: 'transparent' }}
          />
        </div>

        {/* ─── User info bottom ─── */}
        {!collapsed && (
          <div style={{
            flexShrink: 0,
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
            <BreadcrumbNav pathname={location.pathname} navigate={navigate} />
          </Space>

          <Space size={16}>
            <AppSwitcher currentApp="antoan" />
            <Badge count={unreadAlerts} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#666' }} />}
                onClick={() => navigate('/vi-pham')}
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
