import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Progress, Dropdown } from 'antd';
import { SearchOutlined, ToolOutlined, EyeOutlined, PlusOutlined, CheckCircleOutlined, AppstoreOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { disassemblies } from '../../data/disassemblies';
import { components } from '../../data/components';
import { disassemblyStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { DisassemblyRecord } from '../../types';

const { Title, Text } = Typography;

const Disassembly: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = disassemblies.filter(d => {
    const matchSearch = !search || d.equipmentName.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: 'Tổng hồ sơ', value: disassemblies.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <ToolOutlined /> },
    { label: 'Đang tháo rã', value: disassemblies.filter(d => d.status === 'in_progress').length, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ToolOutlined /> },
    { label: 'Hoàn thành', value: disassemblies.filter(d => d.status === 'completed').length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
    { label: 'Tổng cấu phần', value: components.length, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <AppstoreOutlined /> },
  ];

  const columns = [
    { title: 'Mã tháo rã', dataIndex: 'id', key: 'id', width: 130, render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Thiết bị', dataIndex: 'equipmentName', key: 'equipmentName', width: 220, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', width: 120, render: (v: string) => formatDate(v) },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', width: 120, render: (v?: string) => v ? formatDate(v) : '—' },
    { title: 'Nhân sự', dataIndex: 'performedBy', key: 'performedBy', width: 280, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'Số cấu phần', key: 'components', width: 120,
      render: (_: unknown, r: DisassemblyRecord) => {
        const cnt = components.filter(c => c.disassemblyId === r.id).length;
        return <Text strong style={{ color: colors.navy }}>{r.totalComponents} <Text type="secondary" style={{ fontSize: 11 }}>({cnt} đã ghi nhận)</Text></Text>;
      }
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => {
        const c = disassemblyStatusConfig[s as keyof typeof disassemblyStatusConfig];
        if (s === 'in_progress') return <Tag style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)', fontWeight: 500 }}>{c?.label}</Tag>;
        return <Tag color={c?.color}>{c?.label}</Tag>;
      }
    },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: (_: unknown, r: DisassemblyRecord) => (
      <Dropdown
        trigger={['click']}
        menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/disassemblies/${r.id}`) },
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
                  <ToolOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tháo rã & Cấu phần</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 3 · Tháo rã và ghi nhận tình trạng cấu phần</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/disassemblies/new')} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Tạo hồ sơ tháo rã
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

      <Card style={{ borderRadius: 12 }}>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input prefix={<SearchOutlined style={{ color: '#ccc' }} />} placeholder="Tìm theo mã, thiết bị..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 8 }} />
          </Col>
          <Col>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(disassemblyStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} hồ sơ` }} />
      </Card>
    </div>
  );
};

export default Disassembly;
