import { Card, Table, Tag, Button, Typography, Row, Col, Descriptions } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { roles } from '../../data/roles';
import { users } from '../../data/users';
import type { Role } from '../../types';

const { Title } = Typography;

export default function Roles() {
  const columns = [
    {
      title: 'Vai trò',
      key: 'name',
      width: 180,
      render: (_: unknown, r: Role) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: r.color,
          }} />
          <span style={{ fontWeight: 600, color: '#1B3A5C' }}>{r.name}</span>
        </div>
      ),
    },
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (v: number) => v === 0 ? <Tag color="error">System</Tag> : v,
    },
    {
      title: 'Số người dùng',
      key: 'userCount',
      width: 120,
      render: (_: unknown, r: Role) => {
        const count = users.filter(u => u.roleId === r.id).length;
        return <Tag color="processing">{count}</Tag>;
      },
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: () => <Button type="link" size="small">Sửa</Button>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Quản lý vai trò</Title>
        <Button type="primary" icon={<PlusOutlined />}>Thêm vai trò</Button>
      </div>

      {/* Stat summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {roles.map(r => (
          <Col xs={12} sm={8} lg={4} key={r.id}>
            <Card size="small" className="section-card" style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 24, color: r.color, marginBottom: 8 }} />
              <div style={{ fontWeight: 600, color: '#1B3A5C' }}>{r.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: r.color }}>
                {users.filter(u => u.roleId === r.id).length}
              </div>
              <div style={{ fontSize: 11, color: '#999' }}>người dùng</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="section-card" title="Danh sách vai trò">
        <Table<Role>
          dataSource={roles}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          expandable={{
            expandedRowRender: (r: Role) => {
              const roleUsers = users.filter(u => u.roleId === r.id);
              return (
                <Descriptions size="small" column={1} title={`Danh sách ${r.name}`}>
                  {roleUsers.length > 0 ? roleUsers.map(u => (
                    <Descriptions.Item key={u.id} label={u.rank}>
                      {u.fullName} — {u.position} ({u.departmentName})
                    </Descriptions.Item>
                  )) : (
                    <Descriptions.Item label="">Chưa có người dùng nào</Descriptions.Item>
                  )}
                </Descriptions>
              );
            },
          }}
        />
      </Card>
    </div>
  );
}
