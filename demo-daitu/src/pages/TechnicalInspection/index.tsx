import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Dropdown } from 'antd';
import { SearchOutlined, AuditOutlined, EyeOutlined, PlusOutlined, ExperimentOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { technicalInspections } from '../../data/technicalInspections';
import { inspectionTypeConfig, dispositionActionConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { TechnicalInspection } from '../../types';

const { Title, Text } = Typography;

const statusMap: Record<string, { label: string; color: string }> = {
  requested: { label: 'Đã yêu cầu', color: 'geekblue' },
  in_progress: { label: 'Đang kiểm tra', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

const resultMap: Record<string, { label: string; color: string }> = {
  pass: { label: 'Đạt', color: 'success' },
  fail: { label: 'Không đạt', color: 'error' },
  marginal: { label: 'Cận giới hạn', color: 'warning' },
};

const TechnicalInspection: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = technicalInspections.filter(i => {
    const matchSearch = !search || i.componentName.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchType = !typeFilter || i.inspectionType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const kpis = [
    { label: 'Tổng yêu cầu', value: technicalInspections.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <AuditOutlined /> },
    { label: 'Chờ nhận kết quả', value: technicalInspections.filter(i => i.status === 'requested' || i.status === 'in_progress').length, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <ExperimentOutlined /> },
    { label: 'Hoàn thành', value: technicalInspections.filter(i => i.status === 'completed').length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
    { label: 'Cần xử lý', value: technicalInspections.filter(i => i.disposition === 'restore' || i.disposition === 'replace' || i.disposition === 'upgrade').length, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', icon: <ExclamationCircleOutlined /> },
  ];

  const columns = [
    { title: 'Mã KT', dataIndex: 'id', key: 'id', width: 110, render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Cấu phần', dataIndex: 'componentName', key: 'componentName', width: 220, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Loại kiểm tra', dataIndex: 'inspectionType', key: 'inspectionType', width: 180,
      render: (v: string) => { const c = inspectionTypeConfig[v as keyof typeof inspectionTypeConfig]; return <Tag color={c?.color}>{c?.label}</Tag>; }
    },
    { title: 'Ngày yêu cầu', dataIndex: 'requestDate', key: 'requestDate', width: 130, render: (v: string) => formatDate(v) },
    { title: 'Ngày hoàn thành', dataIndex: 'completedDate', key: 'completedDate', width: 140, render: (v?: string) => v ? formatDate(v) : '—' },
    { title: 'Giá trị đo', key: 'measured', width: 180, render: (_: unknown, r: TechnicalInspection) => (
      r.measuredValue ? <div><Text style={{ fontSize: 12 }}>{r.measuredValue}</Text>{r.technicalLimit && <><br /><Text type="secondary" style={{ fontSize: 11 }}>Giới hạn: {r.technicalLimit}</Text></>}</div> : <Text type="secondary">—</Text>
    )},
    { title: 'Kết quả', dataIndex: 'result', key: 'result', width: 120,
      render: (v?: string) => v ? <Tag color={resultMap[v]?.color}>{resultMap[v]?.label}</Tag> : <Tag color="default">Chưa có</Tag>
    },
    { title: 'Kết luận', dataIndex: 'disposition', key: 'disposition', width: 140,
      render: (v?: string) => v ? <Tag color={dispositionActionConfig[v as keyof typeof dispositionActionConfig]?.color}>{dispositionActionConfig[v as keyof typeof dispositionActionConfig]?.label}</Tag> : '—'
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag>
    },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: (_: unknown, r: TechnicalInspection) => (
      <Dropdown
        trigger={['click']}
        menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/technical-inspections/${r.id}`) },
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
                  <AuditOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Kiểm tra & Đánh giá kỹ thuật</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 4 · Kiểm tra kỹ thuật cấu phần và ra kết luận xử lý</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/technical-inspections/new')} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Tạo yêu cầu kiểm tra
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
            <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 200 }}
              options={[{ value: '', label: 'Tất cả loại kiểm tra' }, ...Object.entries(inspectionTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
          <Col>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" scroll={{ x: 1350 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} phiếu` }} />
      </Card>
    </div>
  );
};

export default TechnicalInspection;
