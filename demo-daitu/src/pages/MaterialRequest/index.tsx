import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Dropdown, Progress } from 'antd';
import {
  SearchOutlined, ShoppingCartOutlined, EyeOutlined, PlusOutlined,
  CheckCircleOutlined, ClockCircleOutlined, MoreOutlined, EditOutlined,
  DeleteOutlined, FireOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { materialRequests } from '../../data/materialRequests';
import { materialRequestItems } from '../../data/materialRequestItems';
import { materialRequestStatusConfig, materialRequestPriorityConfig, formatDate, formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { MaterialRequest } from '../../types';

const { Title, Text } = Typography;

const MaterialRequestList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const filtered = materialRequests.filter(r => {
    const matchSearch = !search
      || r.code.toLowerCase().includes(search.toLowerCase())
      || r.equipmentName.toLowerCase().includes(search.toLowerCase())
      || r.orderCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchPriority = !priorityFilter || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalCost = materialRequests.reduce((s, r) => s + (r.estimatedCost || 0), 0);
  const pendingCount = materialRequests.filter(r => r.status === 'pending_approval').length;
  const issuedCount = materialRequests.filter(r => ['issued', 'completed'].includes(r.status)).length;
  const criticalCount = materialRequests.filter(r => r.priority === 'critical').length;

  const kpis = [
    { label: 'Tổng phiếu', value: materialRequests.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <ShoppingCartOutlined /> },
    { label: 'Chờ duyệt', value: pendingCount, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <ClockCircleOutlined /> },
    { label: 'Đã cấp phát', value: issuedCount, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
    { label: 'Ưu tiên cao', value: criticalCount, gradient: 'linear-gradient(135deg, #c62828, #e53935)', icon: <FireOutlined /> },
  ];

  const issuanceRate = (req: MaterialRequest): number => {
    const items = materialRequestItems.filter(i => i.requestId === req.id);
    if (!items.length) return 0;
    const totalRequested = items.reduce((s, i) => s + i.requestedQty, 0);
    const totalIssued = items.reduce((s, i) => s + (i.issuedQty || 0), 0);
    return totalRequested > 0 ? Math.round((totalIssued / totalRequested) * 100) : 0;
  };

  const columns = [
    {
      title: 'Mã phiếu', dataIndex: 'code', key: 'code', width: 150,
      render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text>,
    },
    {
      title: 'Lệnh đại tu / Thiết bị', key: 'order', width: 220,
      render: (_: unknown, r: MaterialRequest) => (
        <div>
          <Text strong style={{ fontSize: 12, color: colors.navy }}>{r.orderCode}</Text>
          <br />
          <Text style={{ fontSize: 12 }}>{r.equipmentName}</Text>
        </div>
      ),
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 120,
      render: (v: string) => {
        const cfg = materialRequestPriorityConfig[v as keyof typeof materialRequestPriorityConfig];
        return (
          <Tag color={cfg?.color} icon={v === 'critical' ? <FireOutlined /> : v === 'urgent' ? <ExclamationCircleOutlined /> : undefined}>
            {cfg?.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày yêu cầu', dataIndex: 'requestDate', key: 'requestDate', width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Cần có trước', dataIndex: 'requiredDate', key: 'requiredDate', width: 120,
      render: (v: string) => <Text style={{ color: '#d97706' }}>{formatDate(v)}</Text>,
    },
    {
      title: 'Vật tư', key: 'items', width: 90, align: 'center' as const,
      render: (_: unknown, r: MaterialRequest) => (
        <Text strong style={{ color: colors.navy }}>{r.totalItems} mục</Text>
      ),
    },
    {
      title: 'Chi phí ước tính', dataIndex: 'estimatedCost', key: 'estimatedCost', width: 130,
      render: (v?: number) => v ? <Text strong style={{ color: colors.navy }}>{formatCurrency(v)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Tiến độ cấp phát', key: 'progress', width: 150,
      render: (_: unknown, r: MaterialRequest) => {
        const rate = issuanceRate(r);
        if (['draft', 'pending_approval', 'rejected'].includes(r.status)) return <Text type="secondary" style={{ fontSize: 11 }}>Chưa cấp phát</Text>;
        return <Progress percent={rate} size="small" strokeColor={rate < 50 ? '#faad14' : rate < 100 ? '#1890ff' : '#52c41a'} />;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160,
      render: (s: string) => {
        const c = materialRequestStatusConfig[s as keyof typeof materialRequestStatusConfig];
        if (s === 'partially_issued') return <Tag style={{ background: 'rgba(234,88,12,0.12)', color: '#c2410c', border: '1px solid rgba(234,88,12,0.3)', fontWeight: 500 }}>{c?.label}</Tag>;
        return <Tag color={c?.color}>{c?.label}</Tag>;
      },
    },
    {
      title: '', key: 'action', width: 48, fixed: 'right' as const,
      render: (_: unknown, r: MaterialRequest) => (
        <Dropdown
          trigger={['click']}
          menu={{ items: [
            { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/material-requests/${r.id}`) },
            { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
            { type: 'divider' },
            { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
          ]}}
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
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCartOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Yêu cầu vật tư</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quản lý phiếu yêu cầu cấp phát vật tư, linh kiện cho đại tu</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Tổng ước tính: <strong style={{ color: '#D4A843' }}>{formatCurrency(totalCost)}</strong></Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/material-requests/new')}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                  Lập phiếu yêu cầu
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {kpis.map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14, height: 110 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.label}</Text>
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card style={{ borderRadius: 12 }}>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input prefix={<SearchOutlined style={{ color: '#ccc' }} />} placeholder="Tìm theo mã phiếu, lệnh đại tu, thiết bị..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 8 }} />
          </Col>
          <Col>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(materialRequestStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
          <Col>
            <Select value={priorityFilter} onChange={setPriorityFilter} style={{ width: 160 }}
              options={[{ value: '', label: 'Tất cả ưu tiên' }, ...Object.entries(materialRequestPriorityConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
        </Row>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} phiếu` }}
        />
      </Card>
    </div>
  );
};

export default MaterialRequestList;
