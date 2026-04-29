import React, { useState } from 'react';
import {
  Table, Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Dropdown,
} from 'antd';
import {
  SearchOutlined, FileSearchOutlined, PlusOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExperimentOutlined,
  MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { overhaulReceptions } from '../../data/overhaulReceptions';
import { receptionStatusConfig, wearLevelConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { OverhaulReception } from '../../types';

const { Title, Text } = Typography;

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending_reception', label: 'Chờ tiếp nhận' },
  { value: 'received', label: 'Đã tiếp nhận' },
  { value: 'assessing', label: 'Đang đánh giá' },
  { value: 'assessed', label: 'Đã đánh giá' },
  { value: 'pending_plan', label: 'Chờ lập kế hoạch' },
];

const overhaulTypeLabel: Record<string, string> = {
  scheduled: 'Theo chu kỳ',
  condition_based: 'Theo tình trạng',
  priority: 'Ưu tiên',
};
const overhaulTypeColor: Record<string, string> = {
  scheduled: 'blue',
  condition_based: 'orange',
  priority: 'red',
};


// ── Trang danh sách ─────────────────────────────────────────────────────────
const OverhaulReception: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = overhaulReceptions.filter(r => {
    const matchSearch = !search || r.code.toLowerCase().includes(search.toLowerCase()) || r.equipmentName.toLowerCase().includes(search.toLowerCase()) || r.sendingUnit.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = overhaulReceptions.length;
  const inEarly = overhaulReceptions.filter(r => ['pending_reception', 'received'].includes(r.status)).length;
  const assessing = overhaulReceptions.filter(r => r.status === 'assessing').length;
  const assessed = overhaulReceptions.filter(r => r.status === 'assessed').length;
  const pendingPlan = overhaulReceptions.filter(r => r.status === 'pending_plan').length;

  const kpis = [
    { label: 'Tổng hồ sơ', value: total, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <FileSearchOutlined /> },
    { label: 'Chờ / Đã tiếp nhận', value: inEarly, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: <ClockCircleOutlined /> },
    { label: 'Đang đánh giá', value: assessing, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ExperimentOutlined /> },
    { label: 'Đã đánh giá / Chờ KH', value: assessed + pendingPlan, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
  ];

  const columns = [
    { title: 'Mã tiếp nhận', dataIndex: 'code', key: 'code', width: 140, render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Thiết bị', key: 'equipment', width: 220, render: (_: unknown, r: OverhaulReception) => (
      <div><Text strong style={{ fontSize: 13 }}>{r.equipmentName}</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{r.equipmentModel} · {r.equipmentSerial}</Text></div>
    )},
    { title: 'Đơn vị gửi', dataIndex: 'sendingUnit', key: 'sendingUnit', width: 160 },
    { title: 'Ngày tiếp nhận', dataIndex: 'receivedDate', key: 'receivedDate', width: 130, render: (v: string) => v ? formatDate(v) : '—' },
    { title: 'Số giờ HĐ', dataIndex: 'operatingHours', key: 'operatingHours', width: 110, render: (v: number) => <Text>{v.toLocaleString('vi-VN')} h</Text> },
    { title: 'Loại ĐT', dataIndex: 'overhaulType', key: 'overhaulType', width: 120,
      render: (v: string) => <Tag color={overhaulTypeColor[v]}>{overhaulTypeLabel[v]}</Tag> },
    { title: 'Mức hao mòn', dataIndex: 'wearLevel', key: 'wearLevel', width: 120, render: (v: string) => { const c = wearLevelConfig[v]; return <Tag color={c?.color}>{c?.label}</Tag>; } },
    { title: 'Phạm vi ĐT', dataIndex: 'overhaulScope', key: 'overhaulScope', width: 110, render: (v: string) => <Tag color={v === 'full' ? 'blue' : 'cyan'}>{v === 'full' ? 'Toàn bộ' : 'Một phần'}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160, render: (v: string) => { const c = receptionStatusConfig[v as keyof typeof receptionStatusConfig]; return <Tag color={c?.color}>{c?.label}</Tag>; } },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: (_: unknown, r: OverhaulReception) => (
      <Dropdown
        trigger={['click']}
        menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/overhaul-receptions/${r.id}`) },
          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
          { type: 'divider' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
        ]}}
      >
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    )},
  ];

  return (
    <div>
        <div className="hero-banner" style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Space size={12}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileSearchOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tiếp nhận & Đánh giá tổng thể</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 1 · Tiếp nhận khí tài và đánh giá tình trạng kỹ thuật</Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}
                  onClick={() => navigate('/overhaul-receptions/new')}
                >
                  Tạo hồ sơ tiếp nhận
                </Button>
              </Col>
            </Row>
          </div>
        </div>

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

        <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
          <Row gutter={12} style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <Input prefix={<SearchOutlined style={{ color: '#ccc' }} />} placeholder="Tìm theo mã, thiết bị, đơn vị..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 8 }} />
            </Col>
            <Col>
              <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} style={{ width: 200 }} />
            </Col>
          </Row>
          <Table dataSource={filtered} columns={columns} rowKey="id" size="small" scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} hồ sơ` }} />
        </Card>

    </div>
  );
};

export default OverhaulReception;
