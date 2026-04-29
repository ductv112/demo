import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Dropdown } from 'antd';
import { SearchOutlined, SettingOutlined, EyeOutlined, PlusOutlined, ToolOutlined, CheckCircleOutlined, DollarOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { restorations } from '../../data/restorations';
import { restorationActionConfig, formatDate, formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { RestorationRecord } from '../../types';

const { Title, Text } = Typography;

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ thực hiện', color: 'geekblue' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

const Restoration: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = restorations.filter(r => {
    const matchSearch = !search || r.componentName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchAction = !actionFilter || r.action === actionFilter;
    return matchSearch && matchStatus && matchAction;
  });

  const totalCost = restorations.filter(r => r.cost).reduce((sum, r) => sum + (r.cost || 0), 0);

  const kpis = [
    { label: 'Tổng hạng mục', value: restorations.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <SettingOutlined /> },
    { label: 'Chờ / Đang thực hiện', value: restorations.filter(r => r.status === 'pending' || r.status === 'in_progress').length, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <ToolOutlined /> },
    { label: 'Hoàn thành', value: restorations.filter(r => r.status === 'completed').length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
    { label: 'Tổng chi phí', value: formatCurrency(totalCost), gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <DollarOutlined /> },
  ];

  const columns = [
    { title: 'Mã phục hồi', dataIndex: 'id', key: 'id', width: 140, render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Cấu phần', dataIndex: 'componentName', key: 'componentName', width: 230, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Hành động', dataIndex: 'action', key: 'action', width: 120,
      render: (v: string) => { const c = restorationActionConfig[v as keyof typeof restorationActionConfig]; return <Tag color={c?.color}>{c?.label}</Tag>; }
    },
    { title: 'Phương pháp / Chi tiết', key: 'detail', width: 280, render: (_: unknown, r: RestorationRecord) => (
      r.method ? <Text style={{ fontSize: 12 }}>{r.method}</Text> : r.newPartName ? <Text style={{ fontSize: 12 }}>Thay: {r.newPartName}</Text> : <Text type="secondary">—</Text>
    )},
    { title: 'Người thực hiện', dataIndex: 'performedBy', key: 'performedBy', width: 200, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', width: 120, render: (v: string) => formatDate(v) },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', width: 120, render: (v?: string) => v ? formatDate(v) : '—' },
    { title: 'Chi phí (tr)', dataIndex: 'cost', key: 'cost', width: 100, render: (v?: number) => v ? <Text strong style={{ color: colors.navy }}>{v} tr</Text> : '—' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => {
        if (s === 'in_progress') return <Tag style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)', fontWeight: 500 }}>{statusMap[s]?.label}</Tag>;
        if (s === 'pending') return <Tag style={{ background: 'rgba(37,99,235,0.12)', color: '#1d4ed8', border: '1px solid rgba(37,99,235,0.3)', fontWeight: 500 }}>{statusMap[s]?.label}</Tag>;
        return <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag>;
      }
    },
    { title: '', key: 'action2', width: 48, fixed: 'right' as const, render: (_: unknown, r: RestorationRecord) => (
      <Dropdown
        trigger={['click']}
        menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/restorations/${r.id}`) },
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
                  <SettingOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Phục hồi & Thay thế</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 5 · Phục hồi, thay thế và nâng cấp cấu phần</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/restorations/new')} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Tạo phiếu phục hồi
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
            <Input prefix={<SearchOutlined style={{ color: '#ccc' }} />} placeholder="Tìm theo mã, cấu phần..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 8 }} />
          </Col>
          <Col>
            <Select value={actionFilter} onChange={setActionFilter} style={{ width: 160 }}
              options={[{ value: '', label: 'Tất cả hành động' }, ...Object.entries(restorationActionConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
          <Col>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" scroll={{ x: 1500 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} hạng mục` }} />
      </Card>
    </div>
  );
};

export default Restoration;
