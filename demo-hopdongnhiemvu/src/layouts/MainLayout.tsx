import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Button, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AuditOutlined,
  ScheduleOutlined,
  CheckSquareOutlined,
  ReconciliationOutlined,
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
  HomeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { ClipboardList } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { alerts } from '../data/alerts';
import AppSwitcher from '../components/AppSwitcher';
import { useUser } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  planning: '#1B3A5C',
  department: '#0891b2',
  director: '#7c3aed',
};

// Breadcrumb route map
const breadcrumbNameMap: Record<string, string> = {
  '/missions': 'Tiếp nhận yêu cầu dự án',
  '/missions/create': 'Tiếp nhận mới',
  '/missions/edit': 'Chỉnh sửa',
  '/proposals/create': 'Đề xuất & Dự toán',
  '/proposals': 'Đề xuất',
  '/proposals/edit': 'Chỉnh sửa đề xuất',
  '/contracts': 'Hợp đồng',
  '/contracts/create': 'Tạo hợp đồng mới',
  '/contracts/edit': 'Chỉnh sửa hợp đồng',
  '/contracts/wbs': 'Phân rã công việc',
  '/progress': 'Theo dõi tiến độ',
  '/acceptance': 'Nghiệm thu & Bàn giao',
  '/settlement': 'Quyết toán',
  '/monitoring': 'Cảnh báo',
  '/reports': 'Báo cáo',
  '/approvals': 'Phê duyệt',
  '/approval-sign': 'Phê duyệt & Ký kết',
  '/approval-sign/workflow': 'Xử lý hồ sơ',
  '/approvals/missions': 'Phê duyệt dự án',
  '/approvals/proposals': 'Phê duyệt đề xuất',
  '/approvals/contracts': 'Phê duyệt hợp đồng',
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole, isPlanning, isDepartment, isDirector } = useUser();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const getMenuItems = (): MenuProps['items'] => {
    const commonItems: MenuProps['items'] = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
      },
    ];

    if (isPlanning) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/missions',
          icon: <SolutionOutlined />,
          label: 'Tiếp nhận yêu cầu dự án',
        },
        {
          key: '/proposals',
          icon: <DollarOutlined />,
          label: 'Đề xuất & Dự toán',
        },
        {
          key: '/approval-sign',
          icon: <AuditOutlined />,
          label: 'Phê duyệt & Ký kết',
        },
        {
          key: '/contracts',
          icon: <FileTextOutlined />,
          label: 'Hợp đồng',
        },
        {
          key: '/progress',
          icon: <ScheduleOutlined />,
          label: 'Theo dõi tiến độ',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/acceptance',
          icon: <CheckSquareOutlined />,
          label: 'Nghiệm thu & Bàn giao',
        },
        {
          key: '/settlement',
          icon: <ReconciliationOutlined />,
          label: 'Quyết toán',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/monitoring',
          icon: <BellOutlined />,
          label: (
            <span>
              Cảnh báo
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
        },
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
          key: '/contracts',
          icon: <FileTextOutlined />,
          label: 'Công việc được giao',
        },
        {
          key: '/progress',
          icon: <ScheduleOutlined />,
          label: 'Báo cáo tiến độ',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/monitoring',
          icon: <BellOutlined />,
          label: (
            <span>
              Cảnh báo
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
        },
      ];
    }

    if (isDirector) {
      return [
        ...commonItems,
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/approvals/missions',
          icon: <CheckCircleOutlined />,
          label: 'Phê duyệt dự án',
        },
        {
          key: '/approval-sign',
          icon: <AuditOutlined />,
          label: 'Phê duyệt & Ký kết',
        },
        {
          key: '/contracts',
          icon: <FileTextOutlined />,
          label: 'Hợp đồng',
        },
        {
          key: '/progress',
          icon: <ScheduleOutlined />,
          label: 'Theo dõi tiến độ',
        },
        { type: 'divider', style: { margin: '8px 16px', borderColor: 'rgba(255,255,255,0.06)' } },
        {
          key: '/monitoring',
          icon: <BellOutlined />,
          label: (
            <span>
              Giám sát & Cảnh báo
              {unreadAlerts > 0 && (
                <Badge count={unreadAlerts} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
        },
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo',
        },
      ];
    }

    return commonItems;
  };

  // Breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const items: { title: React.ReactNode; href?: string; key: string }[] = [
      {
        key: 'home',
        title: <><HomeOutlined style={{ marginRight: 4 }} />Tổng quan</>,
        href: '/',
      },
    ];

    let url = '';
    pathSnippets.forEach((snippet, index) => {
      url += `/${snippet}`;
      const isLast = index === pathSnippets.length - 1;
      const name = breadcrumbNameMap[url];

      // For detail pages like /missions/NV-001 or /contracts/HD-001
      if (!name && index > 0) {
        const parentUrl = '/' + pathSnippets.slice(0, index).join('/');
        const parentName = breadcrumbNameMap[parentUrl];
        if (parentName) {
          items.push({
            key: url,
            title: isLast ? `Chi tiết ${snippet}` : snippet,
          });
          return;
        }
      }

      if (name) {
        items.push({
          key: url,
          title: name,
          href: isLast ? undefined : url,
        });
      }
    });

    return items;
  }, [location.pathname]);

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['/'];
    if (path.startsWith('/approvals/missions')) return ['/approvals/missions'];
    if (path.startsWith('/approvals/proposals')) return ['/approvals/proposals'];
    if (path.startsWith('/approvals/contracts')) return ['/approvals/contracts'];
    if (path.startsWith('/approval-sign')) return ['/approval-sign'];
    if (path.startsWith('/proposals')) return ['/proposals'];
    if (path.startsWith('/missions')) return ['/missions'];
    if (path.startsWith('/contracts')) return ['/contracts'];
    if (path.startsWith('/progress')) return ['/progress'];
    if (path.startsWith('/acceptance')) return ['/acceptance'];
    if (path.startsWith('/settlement')) return ['/settlement'];
    if (path.startsWith('/monitoring')) return ['/monitoring'];
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
            <ClipboardList size={20} color="#0a1628" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Hợp đồng & Dự án
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
          {...(!collapsed ? { openKeys: getAllOpenKeys() } : {})}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
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
            {/* Role switcher */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['planning', 'department', 'director'] as const).map(role => (
                <div
                  key={role}
                  onClick={() => { switchRole(role); navigate('/'); }}
                  style={{
                    flex: 1, textAlign: 'center', padding: '4px 0', borderRadius: 6, cursor: 'pointer',
                    fontSize: 10, fontWeight: currentUser.role === role ? 600 : 400,
                    background: currentUser.role === role ? 'rgba(212,168,67,0.3)' : 'rgba(255,255,255,0.06)',
                    color: currentUser.role === role ? '#f0d890' : 'rgba(255,255,255,0.4)',
                    border: currentUser.role === role ? '1px solid rgba(212,168,67,0.4)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {role === 'planning' ? 'P.KH' : role === 'department' ? 'TT' : 'BGĐ'}
                </div>
              ))}
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
            <Breadcrumb
              items={breadcrumbItems.map(item => ({
                key: item.key,
                title: item.href ? (
                  <a onClick={(e) => { e.preventDefault(); navigate(item.href!); }} style={{ color: '#666' }}>
                    {item.title}
                  </a>
                ) : (
                  <span style={{ color: '#1B3A5C', fontWeight: 500 }}>{item.title}</span>
                ),
              }))}
              style={{ fontSize: 13 }}
            />
          </Space>
          <Space size={16}>
            <AppSwitcher currentApp="hopdongnhiemvu" />
            <Badge count={unreadAlerts} size="small" offset={[-2, 2]}>
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
