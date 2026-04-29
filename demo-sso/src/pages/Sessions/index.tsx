import { Card, Table, Tag, Button, Typography, Space, Select } from 'antd';
import { HistoryOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { sessions } from '../../data/sessions';
import { formatDateTime, statusConfig } from '../../utils/format';
import { useState } from 'react';
import type { Session } from '../../types';

const { Title } = Typography;

export default function Sessions() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = sessions.filter(s => statusFilter === 'all' || s.status === statusFilter);

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 200,
      render: (_: unknown, r: Session) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.userName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{r.department}</div>
        </div>
      ),
    },
    { title: 'Địa chỉ IP', dataIndex: 'ip', key: 'ip', width: 120 },
    { title: 'Trình duyệt', dataIndex: 'browser', key: 'browser', width: 200 },
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
      title: 'Hoạt động gần nhất',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
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
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: unknown, r: Session) => (
        r.status === 'active' ? (
          <Button type="link" danger size="small" icon={<StopOutlined />}>
            Thu hồi
          </Button>
        ) : null
      ),
    },
  ];

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const expiredCount = sessions.filter(s => s.status === 'expired').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Quản lý phiên đăng nhập</Title>
        <Button icon={<ReloadOutlined />}>Làm mới</Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Card size="small" style={{ minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{activeCount}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Đang hoạt động</div>
        </Card>
        <Card size="small" style={{ minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14' }}>{expiredCount}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Hết hạn</div>
        </Card>
        <Card size="small" style={{ minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>
            {sessions.filter(s => s.status === 'revoked').length}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Đã thu hồi</div>
        </Card>
      </Space>

      <Card
        className="section-card"
        title={
          <span>
            <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', color: '#fff' }}>
              <HistoryOutlined />
            </span>
            Danh sách phiên
          </span>
        }
        extra={
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'expired', label: 'Hết hạn' },
              { value: 'revoked', label: 'Đã thu hồi' },
            ]}
          />
        }
      >
        <Table<Session>
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
