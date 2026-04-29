import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Card, Row, Col, Typography, Dropdown, Select } from 'antd';
import {
  SearchOutlined, ClusterOutlined, EyeOutlined, CheckCircleOutlined,
  SyncOutlined, ClockCircleOutlined, MoreOutlined, EditOutlined, DeleteOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { traceabilityRecords } from '../../data/traceability';
import { traceabilityStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { TraceabilityRecord } from '../../types';

const { Title, Text } = Typography;

const STATUS_STEP_MAP: Record<string, number> = {
  collecting: 1,
  updating: 2,
  configuring: 3,
  recording: 4,
  tracing: 5,
  syncing: 6,
  completed: 6,
};

const Traceability: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = traceabilityRecords.filter(r => {
    const matchSearch = !search
      || r.equipmentName.toLowerCase().includes(search.toLowerCase())
      || r.id.toLowerCase().includes(search.toLowerCase())
      || r.orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCount = traceabilityRecords.length;
  const completedCount = traceabilityRecords.filter(r => r.status === 'completed').length;
  const inProgressCount = traceabilityRecords.filter(r => r.status !== 'completed').length;
  const pendingSyncCount = traceabilityRecords.filter(r =>
    r.linkedSystems.some(s => s.status === 'pending')
  ).length;

  const kpis = [
    {
      label: 'Tổng hồ sơ',
      value: totalCount,
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <ClusterOutlined />,
    },
    {
      label: 'Hoàn thành',
      value: completedCount,
      gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
      icon: <CheckCircleOutlined />,
    },
    {
      label: 'Đang xử lý',
      value: inProgressCount,
      gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
      icon: <ApartmentOutlined />,
    },
    {
      label: 'Chờ đồng bộ',
      value: pendingSyncCount,
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      icon: <ClockCircleOutlined />,
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...Object.entries(traceabilityStatusConfig).map(([key, cfg]) => ({
      value: key,
      label: cfg.label,
    })),
  ];

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (v: string) => (
        <Text strong style={{ color: colors.navy }}>{v}</Text>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 240,
      render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Lệnh đại tu',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 110,
      render: (v: string) => <Text style={{ color: colors.navy }}>{v}</Text>,
    },
    {
      title: 'Phân xưởng',
      dataIndex: 'workshopName',
      key: 'workshopName',
      width: 220,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'overhaulDate',
      key: 'overhaulDate',
      width: 140,
      render: (v: string) => (
        <Text style={{ fontSize: 13 }}>{formatDate(v)}</Text>
      ),
    },
    {
      title: 'Bước hiện tại',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (v: string) => {
        const cfg = traceabilityStatusConfig[v];
        if (!cfg) return null;
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Tiến độ bước',
      key: 'stepProgress',
      width: 110,
      render: (_: unknown, r: TraceabilityRecord) => {
        const step = STATUS_STEP_MAP[r.status] ?? 1;
        const done = r.status === 'completed';
        return (
          <Space size={4}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: done ? '#f6ffed' : '#eff6ff',
              border: `1px solid ${done ? '#b7eb8f' : '#bfdbfe'}`,
              borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600,
              color: done ? '#16a34a' : colors.navy,
            }}>
              {done ? '6/6 ✓' : `${step}/6`}
            </div>
          </Space>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 48,
      fixed: 'right' as const,
      render: (_: unknown, r: TraceabilityRecord) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Xem chi tiết',
                onClick: () => navigate(`/traceability/${r.id}`),
              },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
            ],
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(212,168,67,0.2)',
                  border: '1px solid rgba(212,168,67,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClusterOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
                    Truy vết & Cấu hình sau đại tu
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    Quy trình 8 · Lịch sử đại tu, cấu hình, truy vết cấu phần và đồng bộ hệ thống
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {kpis.map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, border: 'none', borderRadius: 14, height: 110 }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  className="db-bg-icon"
                  style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}
                >
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13,
                  }}>
                    {card.icon}
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>
                    {card.label}
                  </Text>
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <Card style={{ borderRadius: 12 }}>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined style={{ color: '#ccc' }} />}
              placeholder="Tìm theo mã hồ sơ, thiết bị, lệnh đại tu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 8 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              style={{ width: 200, borderRadius: 8 }}
            />
          </Col>
        </Row>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} hồ sơ` }}
          onRow={(r) => ({ onDoubleClick: () => navigate(`/traceability/${r.id}`) })}
        />
      </Card>
    </div>
  );
};

export default Traceability;
