import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Input, Select, Button, Space, Avatar, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { users } from '../../data/users';
import { roles } from '../../data/roles';
import { departments } from '../../data/departments';
import { formatDateTime, statusConfig } from '../../utils/format';
import type { SSOUser } from '../../types';

const { Title } = Typography;

export default function Users() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = users.filter(u => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.includes(search);
    const matchDept = deptFilter === 'all' || u.departmentId === deptFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 260,
      render: (_: unknown, r: SSOUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ background: '#1B3A5C', fontWeight: 600 }}>
            {r.fullName.split(' ').pop()?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, color: '#1B3A5C' }}>{r.fullName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>@{r.username}</div>
          </div>
        </div>
      ),
    },
    { title: 'Cấp bậc', dataIndex: 'rank', key: 'rank', width: 100 },
    { title: 'Chức vụ', dataIndex: 'position', key: 'position', width: 200 },
    { title: 'Đơn vị', dataIndex: 'departmentName', key: 'dept', width: 200 },
    {
      title: 'Vai trò',
      dataIndex: 'roleId',
      key: 'role',
      width: 140,
      render: (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        return role ? <Tag color={role.color}>{role.name}</Tag> : '—';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: SSOUser['status']) => {
        const cfg = statusConfig[s];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (v: string) => v ? formatDateTime(v) : '—',
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, r: SSOUser) => (
        <Button type="link" size="small" onClick={() => navigate(`/admin/users/${r.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
          Quản lý người dùng
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>Thêm người dùng</Button>
      </div>

      <Card className="section-card">
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên, username..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            style={{ width: 220 }}
            options={[
              { value: 'all', label: 'Tất cả đơn vị' },
              ...departments.map(d => ({ value: d.id, label: d.name })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Vô hiệu' },
              { value: 'locked', label: 'Đã khóa' },
            ]}
          />
        </Space>

        <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
          <TeamOutlined style={{ marginRight: 6 }} />
          Tìm thấy <strong>{filtered.length}</strong> người dùng
        </div>

        <Table<SSOUser>
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
