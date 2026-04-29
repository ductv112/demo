import { useState } from 'react';
import { Card, Table, Tag, Select, Input, Typography, Space } from 'antd';
import { SearchOutlined, AuditOutlined } from '@ant-design/icons';
import { auditLog } from '../../data/auditLog';
import { formatDateTime, actionConfig } from '../../utils/format';
import type { AuditLogEntry } from '../../types';

const { Title } = Typography;

export default function AuditLog() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const sorted = [...auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const filtered = sorted.filter(l => {
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchSearch = !search || l.userName.toLowerCase().includes(search.toLowerCase()) || l.detail.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (a: AuditLogEntry['action']) => {
        const cfg = actionConfig[a];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Chi tiết',
      dataIndex: 'detail',
      key: 'detail',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
    },
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
      <Title level={4} style={{ marginBottom: 20, color: '#1B3A5C' }}>
        Nhật ký truy cập
      </Title>

      <Card
        className="section-card"
        title={
          <span>
            <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #722ed1, #9254de)', color: '#fff' }}>
              <AuditOutlined />
            </span>
            Lịch sử hoạt động
          </span>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên, chi tiết..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            style={{ width: 180 }}
            options={[
              { value: 'all', label: 'Tất cả hành động' },
              { value: 'login', label: 'Đăng nhập' },
              { value: 'logout', label: 'Đăng xuất' },
              { value: 'switch_app', label: 'Chuyển app' },
              { value: 'failed_login', label: 'Đăng nhập lỗi' },
              { value: 'password_change', label: 'Đổi mật khẩu' },
              { value: 'role_change', label: 'Thay đổi quyền' },
              { value: 'lock_account', label: 'Khóa tài khoản' },
            ]}
          />
        </Space>

        <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
          Hiển thị <strong>{filtered.length}</strong> / {auditLog.length} bản ghi
        </div>

        <Table<AuditLogEntry>
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
