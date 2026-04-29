import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, Row, Col, Typography, Dropdown } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined, EyeOutlined, PlusOutlined, ExperimentOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { testAcceptances } from '../../data/testAcceptances';
import { testAcceptanceStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { TestAcceptance } from '../../types';

const { Title, Text } = Typography;

const resultMap: Record<string, { label: string; color: string }> = {
  pass: { label: 'Đạt', color: 'success' },
  fail: { label: 'Không đạt', color: 'error' },
};

const TestAcceptancePage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = testAcceptances.filter(t => {
    const matchSearch = !search || t.equipmentName.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: 'Tổng hồ sơ', value: testAcceptances.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <SafetyCertificateOutlined /> },
    { label: 'Đang thử nghiệm', value: testAcceptances.filter(t => ['testing', 'retesting'].includes(t.status)).length, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ExperimentOutlined /> },
    { label: 'Đạt nghiệm thu', value: testAcceptances.filter(t => ['accepted', 'delivered'].includes(t.status)).length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
    { label: 'Không đạt', value: testAcceptances.filter(t => t.testResult === 'fail').length, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', icon: <ExclamationCircleOutlined /> },
  ];

  const columns = [
    { title: 'Mã nghiệm thu', dataIndex: 'id', key: 'id', width: 130, render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Thiết bị', dataIndex: 'equipmentName', key: 'equipmentName', width: 220, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Kịch bản thử nghiệm', dataIndex: 'testScenario', key: 'testScenario', width: 300, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Ngày thử', dataIndex: 'testDate', key: 'testDate', width: 120, render: (v?: string) => v ? formatDate(v) : '—' },
    { title: 'Kết quả thử', dataIndex: 'testResult', key: 'testResult', width: 120,
      render: (v?: string) => v ? <Tag color={resultMap[v]?.color}>{resultMap[v]?.label}</Tag> : <Tag color="default">Chưa thử</Tag>
    },
    { title: 'Ngày nghiệm thu', dataIndex: 'acceptedDate', key: 'acceptedDate', width: 140, render: (v?: string) => v ? formatDate(v) : '—' },
    { title: 'Bàn giao cho', key: 'delivery', width: 180, render: (_: unknown, r: TestAcceptance) => (
      r.deliveredTo ? <><Text style={{ fontSize: 12 }}>{r.deliveredTo}</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{r.deliveredDate ? formatDate(r.deliveredDate) : ''}</Text></> : <Text type="secondary">—</Text>
    )},
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 150,
      render: (s: string) => { const c = testAcceptanceStatusConfig[s as keyof typeof testAcceptanceStatusConfig]; return <Tag color={c?.color}>{c?.label}</Tag>; }
    },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: (_: unknown, r: TestAcceptance) => (
      <Dropdown
        trigger={['click']}
        menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/test-acceptances/${r.id}`) },
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
                  <SafetyCertificateOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Thử nghiệm & Nghiệm thu</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 7 · Thử nghiệm kỹ thuật và nghiệm thu bàn giao</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/test-acceptances/new')} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Tạo hồ sơ thử nghiệm
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
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 200 }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(testAcceptanceStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))]}
            />
          </Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} hồ sơ` }} />
      </Card>
    </div>
  );
};

export default TestAcceptancePage;
