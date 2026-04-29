import React, { useState } from 'react';
import { Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Progress, Dropdown } from 'antd';
import {
  SearchOutlined, SolutionOutlined, EyeOutlined, PlusOutlined,
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
  MoreOutlined, EditOutlined, DeleteOutlined, CalendarOutlined,
  DollarOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { overhaulOrders } from '../../data/overhaulOrders';
import { overhaulOrderStatusConfig, formatDate, formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { OverhaulOrder } from '../../types';

const { Title, Text } = Typography;

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  in_progress:      { bg: 'rgba(37,99,235,0.1)',  color: '#1d4ed8', border: 'rgba(37,99,235,0.3)' },
  approved:         { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.3)' },
  pending_approval: { bg: 'rgba(217,119,6,0.1)',   color: '#b45309', border: 'rgba(217,119,6,0.3)' },
  completed:        { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.3)' },
  closed:           { bg: 'rgba(124,58,237,0.1)',  color: '#6d28d9', border: 'rgba(124,58,237,0.3)' },
  draft:            { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: 'rgba(107,114,128,0.3)' },
};

const OverhaulOrder: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workshopFilter, setWorkshopFilter] = useState('');

  const filtered = overhaulOrders.filter(o => {
    const matchSearch = !search || o.code.toLowerCase().includes(search.toLowerCase()) || o.equipmentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    const matchWorkshop = !workshopFilter || o.workshopId === workshopFilter;
    return matchSearch && matchStatus && matchWorkshop;
  });

  const kpis = [
    { label: 'Tổng lệnh', value: overhaulOrders.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <SolutionOutlined /> },
    { label: 'Đang thực hiện', value: overhaulOrders.filter(o => o.status === 'in_progress').length, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ToolOutlined /> },
    { label: 'Đã hoàn thành', value: overhaulOrders.filter(o => ['completed', 'closed'].includes(o.status)).length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
    { label: 'Chờ duyệt', value: overhaulOrders.filter(o => o.status === 'pending_approval').length, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <ClockCircleOutlined /> },
  ];

  const progressColor = (p: number) => p < 30 ? '#ff4d4f' : p < 70 ? '#faad14' : '#52c41a';

  const renderCard = (r: OverhaulOrder) => {
    const cfg = overhaulOrderStatusConfig[r.status as keyof typeof overhaulOrderStatusConfig];
    const sty = STATUS_STYLE[r.status] ?? STATUS_STYLE.draft;
    return (
      <Col key={r.id} xs={24} sm={12} xl={8}>
        <Card
          hoverable
          onClick={() => navigate(`/overhaul-orders/${r.id}`)}
          style={{ borderRadius: 12, border: '1px solid #e8e8e8', cursor: 'pointer', height: '100%' }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Card header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
            <Row justify="space-between" align="top">
              <Col flex="auto">
                <Text strong style={{ color: colors.navy, fontSize: 13, fontFamily: 'monospace' }}>{r.code}</Text>
                <div style={{ marginTop: 3 }}>
                  <Text strong style={{ fontSize: 14 }}>{r.equipmentName}</Text>
                </div>
                {r.equipmentModel && (
                  <Text type="secondary" style={{ fontSize: 11 }}>{r.equipmentModel}</Text>
                )}
              </Col>
              <Col>
                <Space size={6}>
                  <div style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: sty.bg, color: sty.color, border: `1px solid ${sty.border}`,
                  }}>
                    {cfg?.label}
                  </div>
                  <Dropdown
                    trigger={['click']}
                    menu={{ items: [
                      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: ({ domEvent }) => { domEvent.stopPropagation(); navigate(`/overhaul-orders/${r.id}`); } },
                      { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: ({ domEvent }) => domEvent.stopPropagation() },
                      { type: 'divider' },
                      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: ({ domEvent }) => domEvent.stopPropagation() },
                    ]}}
                  >
                    <Button
                      type="text" size="small" icon={<MoreOutlined />}
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#888' }}
                    />
                  </Dropdown>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Card body */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Phân xưởng + phạm vi */}
            <Row justify="space-between" align="middle">
              <Space size={4}>
                <ApartmentOutlined style={{ color: '#888', fontSize: 12 }} />
                <Text style={{ fontSize: 12, color: '#555' }}>{r.workshopName}</Text>
              </Space>
              <Tag color={r.overhaulScope === 'full' ? 'blue' : 'cyan'} style={{ fontSize: 11, margin: 0 }}>
                {r.overhaulScope === 'full' ? 'Toàn bộ' : 'Một phần'}
              </Tag>
            </Row>

            {/* Ngày */}
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
                    <CalendarOutlined style={{ color: '#888', fontSize: 10 }} />
                    <Text type="secondary" style={{ fontSize: 10 }}>Bắt đầu</Text>
                  </div>
                  <Text strong style={{ fontSize: 12 }}>{formatDate(r.plannedStartDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
                    <CalendarOutlined style={{ color: '#888', fontSize: 10 }} />
                    <Text type="secondary" style={{ fontSize: 10 }}>Kết thúc</Text>
                  </div>
                  <Text strong style={{ fontSize: 12 }}>{formatDate(r.plannedEndDate)}</Text>
                </div>
              </Col>
            </Row>

            {/* Chi phí */}
            <Row justify="space-between" align="middle">
              <Space size={4}>
                <DollarOutlined style={{ color: '#d97706', fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Chi phí kế hoạch</Text>
              </Space>
              <Text strong style={{ color: colors.navy, fontSize: 13 }}>{formatCurrency(r.plannedCost)}</Text>
            </Row>

            {/* Tiến độ */}
            <div>
              <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ</Text>
                <Text strong style={{ fontSize: 12, color: progressColor(r.progress) }}>{r.progress}%</Text>
              </Row>
              <Progress
                percent={r.progress} showInfo={false} size="small"
                strokeColor={progressColor(r.progress)}
                trailColor="#e8e8e8"
              />
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SolutionOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Lệnh Đại tu</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 2 · Kế hoạch và lệnh thực hiện đại tu</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/overhaul-orders/new')} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Lập lệnh đại tu
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* KPI */}
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

      {/* Filter */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: '14px 16px' }}>
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Input prefix={<SearchOutlined style={{ color: '#ccc' }} />} placeholder="Tìm theo mã lệnh, thiết bị..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 8 }} />
          </Col>
          <Col>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(overhaulOrderStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
          <Col>
            <Select value={workshopFilter} onChange={setWorkshopFilter} style={{ width: 180 }}
              options={[{ value: '', label: 'Tất cả phân xưởng' }, { value: 'PX1', label: 'PX1 - Radar' }, { value: 'PX2', label: 'PX2 - Tên lửa' }]}
            />
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>{filtered.length} lệnh</Text>
          </Col>
        </Row>
      </Card>

      {/* Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {filtered.map(renderCard)}
      </Row>
    </div>
  );
};

export default OverhaulOrder;
