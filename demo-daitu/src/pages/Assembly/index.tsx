import React, { useState } from 'react';
import { Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Dropdown } from 'antd';
import {
  SearchOutlined, BuildOutlined, EyeOutlined, PlusOutlined, ToolOutlined,
  CheckCircleOutlined, SettingOutlined, MoreOutlined, EditOutlined, DeleteOutlined,
  CalendarOutlined, TeamOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { assemblies } from '../../data/assemblies';
import { assemblyStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { AssemblyRecord } from '../../types';

const { Title, Text } = Typography;

const STATUS_PILL: Record<string, { bg: string; border: string; text: string }> = {
  preparing:    { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' },
  assembling:   { bg: '#e6f4ff', border: '#91caff', text: '#0958d9' },
  calibrating:  { bg: '#f3e8ff', border: '#d3adf7', text: '#531dab' },
  pending_test: { bg: '#fff7e6', border: '#ffe58f', text: '#d48806' },
  completed:    { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
};

const Assembly: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = assemblies.filter(a => {
    const matchSearch = !search || a.equipmentName.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: 'Tổng hồ sơ',     value: assemblies.length,                                              gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <BuildOutlined /> },
    { label: 'Đang lắp ráp',   value: assemblies.filter(a => a.status === 'assembling').length,        gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ToolOutlined /> },
    { label: 'Đang hiệu chỉnh',value: assemblies.filter(a => a.status === 'calibrating').length,       gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: <SettingOutlined /> },
    { label: 'Hoàn thành',     value: assemblies.filter(a => a.status === 'completed').length,         gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
  ];

  const renderCard = (a: AssemblyRecord) => {
    const statusCfg = assemblyStatusConfig[a.status as keyof typeof assemblyStatusConfig];
    const pill = STATUS_PILL[a.status] ?? { bg: '#f5f5f5', border: '#d9d9d9', text: '#555' };

    return (
      <Col xs={24} sm={12} xl={8} key={a.id}>
        <Card
          bodyStyle={{ padding: 0 }}
          style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e8e8', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
          hoverable
          onClick={() => navigate(`/assemblies/${a.id}`)}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text strong style={{ color: colors.navy, fontSize: 13 }}>{a.id}</Text>
                <div style={{ padding: '1px 8px', borderRadius: 20, background: pill.bg, border: `1px solid ${pill.border}`, fontSize: 11, fontWeight: 600, color: pill.text, whiteSpace: 'nowrap' }}>
                  {statusCfg?.label}
                </div>
              </div>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', lineHeight: 1.3, display: 'block' }}>{a.equipmentName}</Text>
            </div>
            <Dropdown
              trigger={['click']}
              menu={{ items: [
                { key: 'view',   icon: <EyeOutlined />,    label: 'Xem chi tiết', onClick: ({ domEvent }) => { domEvent.stopPropagation(); navigate(`/assemblies/${a.id}`); } },
                { key: 'edit',   icon: <EditOutlined />,   label: 'Chỉnh sửa',   onClick: ({ domEvent }) => domEvent.stopPropagation() },
                { type: 'divider' },
                { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: ({ domEvent }) => domEvent.stopPropagation() },
              ]}}
            >
              <Button type="text" size="small" icon={<MoreOutlined />} onClick={e => e.stopPropagation()} style={{ flexShrink: 0, color: '#aaa' }} />
            </Dropdown>
          </div>

          {/* Body */}
          <div style={{ padding: '12px 16px' }}>
            {/* Workshop + Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <TeamOutlined style={{ color: '#888', fontSize: 12 }} />
              <Text style={{ fontSize: 12, color: '#555' }}>{a.workshopName}</Text>
            </div>
            {a.performedBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <BuildOutlined style={{ color: '#888', fontSize: 12 }} />
                <Text style={{ fontSize: 12, color: '#666' }} ellipsis>{a.performedBy}</Text>
              </div>
            )}

            {/* Dates */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, padding: '6px 10px', background: '#eff6ff', borderRadius: 7, border: '1px solid #bfdbfe' }}>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Bắt đầu</Text>
                <Text strong style={{ fontSize: 12, color: colors.navy }}>{formatDate(a.startDate)}</Text>
              </div>
              <div style={{ flex: 1, padding: '6px 10px', background: a.endDate ? '#f6ffed' : '#f8fafc', borderRadius: 7, border: `1px solid ${a.endDate ? '#b7eb8f' : '#e8e8e8'}` }}>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Kết thúc</Text>
                <Text strong style={{ fontSize: 12, color: a.endDate ? '#16a34a' : '#aaa' }}>{a.endDate ? formatDate(a.endDate) : '—'}</Text>
              </div>
            </div>

            {/* Step tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Tag color={a.componentCount ? 'blue' : 'default'} style={{ fontSize: 11, margin: 0 }}>
                {a.componentCount ? `${a.componentCount} cấu phần` : 'Chưa có cấu phần'}
              </Tag>
              <Tag color={a.torqueRecords ? 'cyan' : 'default'} style={{ fontSize: 11, margin: 0 }}>
                {a.torqueRecords ? 'Mômen ✓' : 'Chưa có mômen'}
              </Tag>
              <Tag color={a.calibrationParams ? 'purple' : 'default'} style={{ fontSize: 11, margin: 0 }}>
                {a.calibrationParams ? 'Hiệu chỉnh ✓' : 'Chưa hiệu chỉnh'}
              </Tag>
              {a.readyForTest && <Tag color="success" style={{ fontSize: 11, margin: 0 }}>Sẵn sàng thử</Tag>}
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
                  <BuildOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Lắp ráp & Hiệu chỉnh</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 6 · Lắp ráp cấu phần và hiệu chỉnh thông số kỹ thuật</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/assemblies/new')} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Tạo hồ sơ lắp ráp
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* KPI cards */}
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

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#ccc' }} />}
          placeholder="Tìm theo mã, thiết bị..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 8, flex: 1 }}
        />
        <Select
          value={statusFilter} onChange={setStatusFilter} style={{ width: 200 }}
          options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(assemblyStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
        />
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>{filtered.length} hồ sơ</Text>
        </div>
      </div>

      {/* Card grid */}
      <Row gutter={[16, 16]}>
        {filtered.map(a => renderCard(a))}
      </Row>
    </div>
  );
};

export default Assembly;
