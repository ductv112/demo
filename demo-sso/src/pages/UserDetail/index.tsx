import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Table, Button, Avatar, Row, Col, Typography, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { users } from '../../data/users';
import { roles } from '../../data/roles';
import { permissions } from '../../data/permissions';
import { apps } from '../../data/apps';
import { auditLog } from '../../data/auditLog';
import { formatDateTime, statusConfig, permissionConfig, actionConfig } from '../../utils/format';
import type { UserPermission, AuditLogEntry } from '../../types';

const { Title } = Typography;

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = users.find(u => u.id === id);

  if (!user) {
    return (
      <Card>
        <p>Không tìm thấy người dùng</p>
        <Button onClick={() => navigate('/admin/users')}>Quay lại</Button>
      </Card>
    );
  }

  const role = roles.find(r => r.id === user.roleId);
  const userPerms = permissions.filter(p => p.userId === user.id);
  const userLogs = auditLog.filter(l => l.userId === user.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const cfg = statusConfig[user.status];

  const permColumns = [
    {
      title: 'Phần mềm',
      key: 'app',
      width: 280,
      render: (_: unknown, r: UserPermission) => {
        const app = apps.find(a => a.id === r.appId);
        return app ? (
          <span>
            <Tag>{app.badge}</Tag> {app.name}
          </span>
        ) : r.appId;
      },
    },
    {
      title: 'Nhóm',
      key: 'group',
      width: 160,
      render: (_: unknown, r: UserPermission) => apps.find(a => a.id === r.appId)?.group || '—',
    },
    {
      title: 'Quyền',
      dataIndex: 'permission',
      key: 'permission',
      width: 120,
      render: (p: UserPermission['permission']) => {
        const pc = permissionConfig[p];
        return <Tag color={pc.color}>{pc.label}</Tag>;
      },
    },
  ];

  const logColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (a: AuditLogEntry['action']) => {
        const ac = actionConfig[a];
        return <Tag color={ac.color}>{ac.label}</Tag>;
      },
    },
    { title: 'Chi tiết', dataIndex: 'detail', key: 'detail' },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
    {
      title: 'Kết quả',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => (
        <Tag color={s === 'success' ? 'success' : 'error'}>
          {s === 'success' ? 'Thành công' : 'Thất bại'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/users')}>Quay lại</Button>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Chi tiết người dùng</Title>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="section-card">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Avatar size={72} style={{ background: '#1B3A5C', fontSize: 28, fontWeight: 700 }}>
                {user.fullName.split(' ').pop()?.charAt(0)}
              </Avatar>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#1B3A5C' }}>{user.fullName}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{user.position}</div>
                <Tag color={cfg.color} style={{ marginTop: 8 }}>{cfg.label}</Tag>
              </div>
            </div>

            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500, color: '#1B3A5C' }}>
              <Descriptions.Item label="Username">@{user.username}</Descriptions.Item>
              <Descriptions.Item label="Cấp bậc">{user.rank}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị">{user.departmentName}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                {role ? <Tag color={role.color}>{role.name}</Tag> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Điện thoại">{user.phone}</Descriptions.Item>
              <Descriptions.Item label="Đăng nhập gần nhất">
                {user.lastLogin ? formatDateTime(user.lastLogin) : '—'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Button icon={<EditOutlined />} block>Chỉnh sửa</Button>
              {user.status === 'locked' ? (
                <Button icon={<UnlockOutlined />} block>Mở khóa</Button>
              ) : (
                <Button icon={<LockOutlined />} danger block>Khóa TK</Button>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            className="section-card"
            title="Quyền truy cập ứng dụng"
            style={{ marginBottom: 16 }}
          >
            <Table<UserPermission>
              dataSource={userPerms}
              columns={permColumns}
              rowKey={r => `${r.userId}-${r.appId}`}
              pagination={false}
              size="small"
            />
            {userPerms.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                Chưa được phân quyền ứng dụng nào
              </div>
            )}
          </Card>

          <Card className="section-card" title="Nhật ký hoạt động">
            <Table<AuditLogEntry>
              dataSource={userLogs}
              columns={logColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
