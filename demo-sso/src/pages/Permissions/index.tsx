import { useState } from 'react';
import { Card, Table, Tag, Select, Typography, Space } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { users } from '../../data/users';
import { apps } from '../../data/apps';
import { permissions } from '../../data/permissions';
import { departments } from '../../data/departments';
import { permissionConfig } from '../../utils/format';
import type { PermissionLevel } from '../../types';

const { Title } = Typography;

export default function Permissions() {
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    if (deptFilter === 'all') return true;
    return u.departmentId === deptFilter;
  }).filter(u => u.status === 'active');

  // Nhóm apps theo group
  const appGroups = [...new Set(apps.map(a => a.group))];

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      fixed: 'left' as const,
      width: 200,
      render: (_: unknown, r: typeof filteredUsers[0]) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.fullName}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{r.position}</div>
        </div>
      ),
    },
    ...apps.map(app => ({
      title: (
        <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
          <Tag style={{ fontSize: 10, padding: '0 4px' }}>{app.badge}</Tag>
          <div style={{ fontSize: 10, marginTop: 2 }}>{app.name.replace('Quản lý ', '')}</div>
        </div>
      ),
      key: app.id,
      width: 90,
      render: (_: unknown, user: typeof filteredUsers[0]) => {
        const perm = permissions.find(p => p.userId === user.id && p.appId === app.id);
        const level: PermissionLevel = perm?.permission || 'none';
        const cfg = permissionConfig[level];
        return (
          <div style={{ textAlign: 'center' }}>
            <Tag color={cfg.color} style={{ fontSize: 11, margin: 0 }}>{cfg.label}</Tag>
          </div>
        );
      },
    })),
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20, color: '#1B3A5C' }}>
        Phân quyền ứng dụng
      </Title>

      {/* Legend */}
      <Card className="section-card" size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <span style={{ fontSize: 13, fontWeight: 500, marginRight: 8 }}>Chú thích:</span>
          {Object.entries(permissionConfig).map(([key, cfg]) => (
            <Tag key={key} color={cfg.color}>{cfg.label}</Tag>
          ))}
        </Space>
      </Card>

      {/* App groups summary */}
      <Card className="section-card" size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          {appGroups.map(g => (
            <span key={g} style={{ fontSize: 12 }}>
              <strong>{g}:</strong>{' '}
              {apps.filter(a => a.group === g).map(a => (
                <Tag key={a.id} style={{ fontSize: 11 }}>{a.badge}</Tag>
              ))}
            </span>
          ))}
        </Space>
      </Card>

      <Card
        className="section-card permission-matrix"
        title={
          <span>
            <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #D4A843, #f0d890)', color: '#0a1628' }}>
              <KeyOutlined />
            </span>
            Ma trận phân quyền
          </span>
        }
        extra={
          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            style={{ width: 220 }}
            options={[
              { value: 'all', label: 'Tất cả đơn vị' },
              ...departments.map(d => ({ value: d.id, label: d.name })),
            ]}
          />
        }
      >
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 1800 }}
          bordered
        />
      </Card>
    </div>
  );
}
