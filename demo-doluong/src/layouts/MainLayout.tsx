import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar, Button, Tooltip, Breadcrumb, Segmented } from 'antd';
import {
  DashboardOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  AimOutlined,
  ControlOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  BookOutlined,
  AlertOutlined,
  UserOutlined,
  AppstoreOutlined,
  SafetyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  EditOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  OrderedListOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { Scale } from 'lucide-react';
import { colors } from '../theme/themeConfig';
import { useUser, roleLabels } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';
import canhBao from '../data/canhBao';
import AppSwitcher from '../components/AppSwitcher';

const { Sider, Header, Content } = Layout;

// ─── Breadcrumb map ──────────────────────────────────────────────────────────
const breadcrumbMap: Record<string, { parent?: string; label: string }> = {
  '/': { label: 'Tổng quan' },
  '/yeu-cau': { parent: 'Yêu cầu & Kế hoạch', label: 'Yêu cầu đo kiểm' },
  '/ke-hoach-do': { parent: 'Yêu cầu & Kế hoạch', label: 'Kế hoạch đo' },
  '/chuan-do': { parent: 'Chuẩn & Thiết bị', label: 'Chuẩn đo lường' },
  '/thiet-bi': { parent: 'Chuẩn & Thiết bị', label: 'Thiết bị đo (TMDE)' },
  '/phong-lab': { label: 'Phòng thí nghiệm' },
  '/thuc-hien-do': { parent: 'Đo lường & Phân tích', label: 'Nhập dữ liệu đo (MDC)' },
  '/phan-tich-sai-so': { parent: 'Đo lường & Phân tích', label: 'Phân tích sai số' },
  '/ket-qua': { parent: 'Đo lường & Phân tích', label: 'Kết luận & Chứng chỉ' },
  '/tieu-chuan': { parent: 'Kho Tri thức & TC', label: 'Tiêu chuẩn & Lệnh KT' },
  '/quy-trinh-do': { parent: 'Kho Tri thức & TC', label: 'Quy trình đo' },
  '/giam-sat': { parent: 'Giám sát & Cảnh báo', label: 'Cảnh báo hệ thống' },
  '/bieu-do-spc': { parent: 'Giám sát & Cảnh báo', label: 'Biểu đồ SPC & Drift' },
  '/don-vi': { parent: 'Cổng đơn vị', label: 'Danh sách đơn vị' },
  '/theo-doi-han-hc': { parent: 'Cổng đơn vị', label: 'Theo dõi hạn HC' },
  '/lich-su-kiem-dinh': { parent: 'Cổng đơn vị', label: 'Lịch sử kiểm định' },
  '/quan-tri/nguoi-dung': { parent: 'Quản trị hệ thống', label: 'Người dùng' },
  '/quan-tri/danh-muc': { parent: 'Quản trị hệ thống', label: 'Danh mục dùng chung' },
  '/quan-tri/phan-quyen': { parent: 'Quản trị hệ thống', label: 'Phân quyền' },
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole } = useUser();

  const pathname = location.pathname;
  const unreadAlerts = canhBao.filter((a) => !a.daDoc).length;

  const getSelectedKey = (): string => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/don-vi') return 'don-vi';
    if (pathname === '/yeu-cau' || pathname.startsWith('/yeu-cau/')) return 'yeu-cau';
    if (pathname === '/ke-hoach-do' || pathname.startsWith('/ke-hoach-do/')) return 'ke-hoach-do';
    if (pathname === '/chuan-do') return 'chuan-do';
    if (pathname === '/thiet-bi') return 'thiet-bi';
    if (pathname === '/phong-lab') return 'phong-lab';
    if (pathname === '/thuc-hien-do') return 'thuc-hien-do';
    if (pathname === '/phan-tich-sai-so') return 'phan-tich-sai-so';
    if (pathname === '/ket-qua') return 'ket-qua';
    if (pathname === '/tieu-chuan') return 'tieu-chuan';
    if (pathname === '/quy-trinh-do') return 'quy-trinh-do';
    if (pathname === '/giam-sat') return 'giam-sat';
    if (pathname === '/bieu-do-spc') return 'bieu-do-spc';
    if (pathname === '/theo-doi-han-hc') return 'theo-doi-han-hc';
    if (pathname === '/lich-su-kiem-dinh') return 'lich-su-kiem-dinh';
    if (pathname === '/quan-tri/nguoi-dung') return 'nguoi-dung';
    if (pathname === '/quan-tri/danh-muc') return 'danh-muc';
    if (pathname === '/quan-tri/phan-quyen') return 'phan-quyen';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      onClick: () => navigate('/'),
    },
    {
      key: 'cong-don-vi',
      icon: <SafetyCertificateOutlined />,
      label: 'Cổng đơn vị',
      children: [
        { key: 'don-vi', icon: <TeamOutlined />, label: 'Danh sách đơn vị', onClick: () => navigate('/don-vi') },
        { key: 'theo-doi-han-hc', icon: <CalendarOutlined />, label: 'Theo dõi hạn HC', onClick: () => navigate('/theo-doi-han-hc') },
        { key: 'lich-su-kiem-dinh', icon: <FileDoneOutlined />, label: 'Lịch sử kiểm định', onClick: () => navigate('/lich-su-kiem-dinh') },
      ],
    },
    {
      key: 'yeu-cau-ke-hoach',
      icon: <FileSearchOutlined />,
      label: 'Yêu cầu & Kế hoạch',
      children: [
        { key: 'yeu-cau', icon: <FileSearchOutlined />, label: 'Yêu cầu đo kiểm', onClick: () => navigate('/yeu-cau') },
        { key: 'ke-hoach-do', icon: <CalendarOutlined />, label: 'Kế hoạch đo', onClick: () => navigate('/ke-hoach-do') },
      ],
    },
    {
      key: 'chuan-thiet-bi',
      icon: <AimOutlined />,
      label: 'Chuẩn & Thiết bị',
      children: [
        { key: 'chuan-do', icon: <AimOutlined />, label: 'Chuẩn đo lường', onClick: () => navigate('/chuan-do') },
        { key: 'thiet-bi', icon: <ControlOutlined />, label: 'Thiết bị đo (TMDE)', onClick: () => navigate('/thiet-bi') },
      ],
    },
    {
      key: 'phong-lab',
      icon: <ExperimentOutlined />,
      label: 'Phòng thí nghiệm',
      onClick: () => navigate('/phong-lab'),
    },
    {
      key: 'do-luong-phan-tich',
      icon: <FileDoneOutlined />,
      label: 'Đo lường & Phân tích',
      children: [
        { key: 'thuc-hien-do', icon: <EditOutlined />, label: 'Nhập dữ liệu đo (MDC)', onClick: () => navigate('/thuc-hien-do') },
        { key: 'phan-tich-sai-so', icon: <CalculatorOutlined />, label: 'Phân tích sai số', onClick: () => navigate('/phan-tich-sai-so') },
        { key: 'ket-qua', icon: <FileDoneOutlined />, label: 'Kết luận & Chứng chỉ', onClick: () => navigate('/ket-qua') },
      ],
    },
    {
      key: 'kho-tri-thuc',
      icon: <BookOutlined />,
      label: 'Kho Tri thức & TC',
      children: [
        { key: 'tieu-chuan', icon: <BookOutlined />, label: 'Tiêu chuẩn & Lệnh KT', onClick: () => navigate('/tieu-chuan') },
        { key: 'quy-trinh-do', icon: <OrderedListOutlined />, label: 'Quy trình đo', onClick: () => navigate('/quy-trinh-do') },
      ],
    },
    {
      key: 'giam-sat-group',
      icon: <AlertOutlined />,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Giám sát & Cảnh báo</span>
          {!collapsed && unreadAlerts > 0 && (
            <Badge
              count={unreadAlerts}
              style={{ backgroundColor: '#ff4d4f', fontSize: 10, marginLeft: 4 }}
            />
          )}
        </span>
      ),
      children: [
        { key: 'giam-sat', icon: <AlertOutlined />, label: 'Cảnh báo hệ thống', onClick: () => navigate('/giam-sat') },
        { key: 'bieu-do-spc', icon: <LineChartOutlined />, label: 'Biểu đồ SPC & Drift', onClick: () => navigate('/bieu-do-spc') },
      ],
    },
    {
      key: 'quan-tri',
      icon: <SettingOutlined />,
      label: 'Quản trị hệ thống',
      children: [
        { key: 'nguoi-dung', icon: <UserOutlined />, label: 'Người dùng', onClick: () => navigate('/quan-tri/nguoi-dung') },
        { key: 'danh-muc', icon: <AppstoreOutlined />, label: 'Danh mục dùng chung', onClick: () => navigate('/quan-tri/danh-muc') },
        { key: 'phan-quyen', icon: <SafetyOutlined />, label: 'Phân quyền', onClick: () => navigate('/quan-tri/phan-quyen') },
      ],
    },
  ];

  // Build breadcrumb
  let bcInfo = breadcrumbMap[pathname];
  const isYcDetail = !bcInfo && pathname.startsWith('/yeu-cau/');
  const isKhDetail = !bcInfo && pathname.startsWith('/ke-hoach-do/');
  if (isYcDetail) {
    const ycId = pathname.split('/').pop() || '';
    bcInfo = { parent: 'Yêu cầu & Kế hoạch', label: ycId };
  }
  if (isKhDetail) {
    const khId = pathname.split('/').pop() || '';
    bcInfo = { parent: 'Yêu cầu & Kế hoạch', label: khId };
  }
  const isDetailPage = isYcDetail || isKhDetail;
  const detailParentPath = isYcDetail ? '/yeu-cau' : '/ke-hoach-do';
  const detailParentLabel = isYcDetail ? 'Yêu cầu đo kiểm' : 'Kế hoạch đo';
  const breadcrumbItems = bcInfo
    ? [
        { title: <span style={{ cursor: 'pointer', color: colors.navy }} onClick={() => navigate('/')}>Trang chủ</span> },
        ...(bcInfo.parent ? [{ title: isDetailPage
          ? <span style={{ cursor: 'pointer', color: colors.navy }} onClick={() => navigate(detailParentPath)}>{bcInfo.parent}</span>
          : <span style={{ color: '#8c8c8c' }}>{bcInfo.parent}</span>
        }] : []),
        ...(isDetailPage ? [{ title: <span style={{ cursor: 'pointer', color: colors.navy }} onClick={() => navigate(detailParentPath)}>{detailParentLabel}</span> }] : []),
        { title: <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{bcInfo.label}</span> },
      ]
    : [{ title: 'Trang chủ' }];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <Sider
        width={260}
        collapsedWidth={80}
        collapsed={collapsed}
        className="sidebar-wrapper"
        style={{
          background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '18px 0' : '18px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            minHeight: 64,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #D4A843 0%, #f0d890 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 800,
              color: colors.navyDark,
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(212,168,67,0.35)',
            }}
          >
            DA
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                Đo lường & Kiểm định
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap' }}>
                Doanh nghiệp A
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={collapsed ? [] : ['chuan-thiet-bi', 'do-luong-phan-tich']}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 4,
            flex: 1,
          }}
        />

        {/* Sidebar bottom user card */}
        {!collapsed && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(0,0,0,0.2)',
          }}>
            <Avatar
              size={32}
              style={{
                background: 'linear-gradient(135deg, #D4A843 0%, #f0d890 100%)',
                flexShrink: 0,
                border: '2px solid rgba(212,168,67,0.3)',
                color: colors.navyDark,
                fontWeight: 700,
              }}
              icon={<UserOutlined />}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1, whiteSpace: 'nowrap' }}>
                {currentUser.position}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .ant-menu-dark,
          .ant-menu-dark .ant-menu-sub {
            background: transparent !important;
          }
          .ant-menu-dark .ant-menu-item,
          .ant-menu-dark .ant-menu-submenu-title {
            border-radius: 8px !important;
            margin: 2px 8px !important;
            width: calc(100% - 16px) !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: rgba(255,255,255,0.75) !important;
            transition: all 0.15s !important;
          }
          .ant-menu-dark .ant-menu-item-selected {
            background: rgba(27,58,92,0.6) !important;
            color: #fff !important;
            font-weight: 600 !important;
            position: relative;
          }
          .ant-menu-dark .ant-menu-item-selected::before {
            content: '';
            position: absolute;
            left: 0;
            top: 25%;
            height: 50%;
            width: 3px;
            border-radius: 0 3px 3px 0;
            background: linear-gradient(180deg, #D4A843, #f0d890);
          }
          .ant-menu-dark .ant-menu-item-selected .ant-menu-item-icon,
          .ant-menu-dark .ant-menu-item-selected svg {
            color: #D4A843 !important;
          }
          .ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover,
          .ant-menu-dark .ant-menu-submenu-title:hover {
            background: rgba(255,255,255,0.06) !important;
            color: #fff !important;
          }
          .ant-menu-dark .ant-menu-item .ant-menu-item-icon,
          .ant-menu-dark .ant-menu-submenu-title .ant-menu-item-icon {
            color: rgba(255,255,255,0.55) !important;
          }
          .ant-menu-dark .ant-menu-submenu-selected > .ant-menu-submenu-title {
            color: #fff !important;
          }
          .ant-menu-dark .ant-menu-submenu-selected > .ant-menu-submenu-title .ant-menu-item-icon {
            color: #D4A843 !important;
          }
          .ant-menu-dark .ant-menu-submenu-arrow {
            color: rgba(255,255,255,0.35) !important;
          }
          .ant-menu-dark.ant-menu-inline .ant-menu-sub.ant-menu-inline {
            background: rgba(0,0,0,0.15) !important;
            border-radius: 0 0 8px 8px;
          }
          .ant-layout-sider::-webkit-scrollbar { width: 4px; }
          .ant-layout-sider::-webkit-scrollbar-track { background: transparent; }
          .ant-layout-sider::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        `}</style>
      </Sider>

      {/* ─── Main area ──────────────────────────────────────────────────── */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            background: '#ffffff',
            borderBottom: '1px solid #e8e8e8',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Left: toggle + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#666', fontSize: 16 }}
            />
            <div style={{ height: 20, width: 1, background: '#e8e8e8' }} />
            <Breadcrumb items={breadcrumbItems} style={{ fontSize: 13 }} />
          </div>

          {/* Right: role switcher + demo tag + bell + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Segmented
              size="small"
              value={currentUser.role}
              onChange={(val) => switchRole(val as UserRole)}
              options={[
                { value: 'metrology', icon: <SafetyCertificateOutlined />, label: roleLabels.metrology },
                { value: 'department', icon: <TeamOutlined />, label: roleLabels.department },
                { value: 'director', icon: <CrownOutlined />, label: roleLabels.director },
              ]}
              style={{ fontSize: 12 }}
            />

            <div
              style={{
                background: '#e8f0fe',
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 4,
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}
            >
              DEMO
            </div>

            <AppSwitcher currentApp="doluong" />

            <Tooltip title={`${unreadAlerts} cảnh báo chưa đọc`}>
              <Badge count={unreadAlerts} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                  style={{ color: unreadAlerts > 0 ? '#ff4d4f' : '#666' }}
                  onClick={() => navigate('/giam-sat')}
                />
              </Badge>
            </Tooltip>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <Avatar
                size={30}
                style={{ background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`, fontSize: 13 }}
                icon={<UserOutlined />}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{currentUser.position}</div>
              </div>
            </div>
          </div>
        </Header>

        {/* Page content */}
        <Content style={{ minHeight: 'calc(100vh - 56px)', background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
