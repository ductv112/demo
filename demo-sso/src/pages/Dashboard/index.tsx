import { Row, Col, Card, Table, Tag, Typography, Timeline } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  DesktopOutlined,
  AppstoreOutlined,
  LoginOutlined,
  WarningOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { users } from '../../data/users';
import { sessions } from '../../data/sessions';
import { auditLog } from '../../data/auditLog';
import { apps } from '../../data/apps';
import { formatDateTime, statusConfig, actionConfig } from '../../utils/format';
import type { Session, AuditLogEntry } from '../../types';

const { Title } = Typography;

const stats = [
  {
    label: 'Tổng người dùng',
    value: users.length,
    icon: <TeamOutlined />,
    bgIcon: <TeamOutlined className="stat-bg-icon" />,
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    label: 'Đang hoạt động',
    value: users.filter(u => u.status === 'active').length,
    icon: <UserOutlined />,
    bgIcon: <UserOutlined className="stat-bg-icon" />,
    gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
  },
  {
    label: 'Phiên đăng nhập',
    value: sessions.filter(s => s.status === 'active').length,
    icon: <DesktopOutlined />,
    bgIcon: <DesktopOutlined className="stat-bg-icon" />,
    gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
  },
  {
    label: 'Phần mềm kết nối',
    value: apps.length,
    icon: <AppstoreOutlined />,
    bgIcon: <AppstoreOutlined className="stat-bg-icon" />,
    gradient: 'linear-gradient(135deg, #722ed1, #9254de)',
  },
  {
    label: 'Đăng nhập hôm nay',
    value: auditLog.filter(l => l.action === 'login' && l.status === 'success' && l.timestamp.startsWith('2026-04-01')).length,
    icon: <LoginOutlined />,
    bgIcon: <LoginOutlined className="stat-bg-icon" />,
    gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)',
  },
  {
    label: 'Đăng nhập lỗi',
    value: auditLog.filter(l => l.action === 'failed_login').length,
    icon: <WarningOutlined />,
    bgIcon: <WarningOutlined className="stat-bg-icon" />,
    gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
  },
];

const sessionColumns = [
  { title: 'Người dùng', dataIndex: 'userName', key: 'userName', width: 200 },
  { title: 'Đơn vị', dataIndex: 'department', key: 'department', width: 180 },
  { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
  {
    title: 'Đang dùng',
    dataIndex: 'currentApp',
    key: 'currentApp',
    width: 180,
    render: (app: string) => app ? <Tag color="processing">{app}</Tag> : <Tag>—</Tag>,
  },
  {
    title: 'Đăng nhập lúc',
    dataIndex: 'loginTime',
    key: 'loginTime',
    width: 150,
    render: (v: string) => formatDateTime(v),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (s: Session['status']) => {
      const cfg = statusConfig[s];
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
];

export default function Dashboard() {
  const recentLogs = [...auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 8);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20, color: '#1B3A5C' }}>
        Tổng quan hệ thống SSO
      </Title>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <Col xs={12} sm={8} lg={4} key={i}>
            <div className="stat-card" style={{ background: s.gradient }}>
              {s.bgIcon}
              <div className="stat-icon-badge">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Active Sessions */}
        <Col xs={24} lg={16}>
          <Card
            className="section-card"
            title={
              <span>
                <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', color: '#fff' }}>
                  <DesktopOutlined />
                </span>
                Phiên đang hoạt động
              </span>
            }
          >
            <Table<Session>
              dataSource={sessions.filter(s => s.status === 'active')}
              columns={sessionColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card
            className="section-card"
            title={
              <span>
                <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #722ed1, #9254de)', color: '#fff' }}>
                  <AuditOutlined />
                </span>
                Hoạt động gần đây
              </span>
            }
          >
            <Timeline
              items={recentLogs.map((log: AuditLogEntry) => {
                const cfg = actionConfig[log.action];
                return {
                  color: log.status === 'failure' ? 'red' : 'blue',
                  children: (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{log.userName}</div>
                      <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{log.detail}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{formatDateTime(log.timestamp)}</div>
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
