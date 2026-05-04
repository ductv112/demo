import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Row, Col, Typography, Input, Select,
  Space, Button, Dropdown,
} from 'antd';
import {
  AlertOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  CloseCircleOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { incidents } from '../../data/incidents';
import {
  incidentStatusConfig,
  incidentSeverityConfig,
  incidentTypeConfig,
  formatDate,
} from '../../utils/format';
import type { SafetyIncident, IncidentStatus, IncidentSeverity, IncidentType } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const statCards = [
  {
    key: 'total',
    label: 'Tổng sự cố',
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
    icon: <AlertOutlined />,
  },
  {
    key: 'nghiem_trong',
    label: 'Nghiêm trọng',
    gradient: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
    icon: <CloseCircleOutlined />,
  },
  {
    key: 'open',
    label: 'Đang xử lý',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
    icon: <AuditOutlined />,
  },
  {
    key: 'closed',
    label: 'Đã đóng',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    icon: <AlertOutlined />,
  },
];

const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSafety } = useUser();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter]   = useState<IncidentStatus | undefined>();
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | undefined>();
  const [typeFilter, setTypeFilter]       = useState<IncidentType | undefined>();
  const [workshopFilter, setWorkshopFilter] = useState<string | undefined>();

  const stats = useMemo(() => ({
    total:         incidents.length,
    nghiem_trong:  incidents.filter(i => i.severity === 'nghiem_trong').length,
    open:          incidents.filter(i => i.status !== 'closed').length,
    closed:        incidents.filter(i => i.status === 'closed').length,
  }), []);

  const filteredData = useMemo(() => {
    let result = [...incidents].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    if (statusFilter)   result = result.filter(i => i.status === statusFilter);
    if (severityFilter) result = result.filter(i => i.severity === severityFilter);
    if (typeFilter)     result = result.filter(i => i.type === typeFilter);
    if (workshopFilter) result = result.filter(i => i.workshopId === workshopFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(i =>
        i.code.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.workshopName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [searchText, statusFilter, severityFilter, typeFilter, workshopFilter]);

  const renderStatCard = (cfg: (typeof statCards)[number], value: number) => (
    <Col xs={24} sm={12} md={6} key={cfg.key}>
      <div
        style={{
          background: cfg.gradient, borderRadius: 14, padding: '20px 24px',
          position: 'relative', overflow: 'hidden', cursor: 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)';
          const icon = el.querySelector('.stat-bg-icon') as HTMLElement;
          if (icon) icon.style.transform = 'rotate(15deg) scale(1.15)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
          const icon = el.querySelector('.stat-bg-icon') as HTMLElement;
          if (icon) icon.style.transform = 'rotate(0) scale(1)';
        }}
      >
        <div className="stat-bg-icon" style={{
          position: 'absolute', top: 12, right: 16,
          fontSize: 64, opacity: 0.1, color: '#fff',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {cfg.icon}
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#fff', marginBottom: 12,
        }}>
          {cfg.icon}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
          {value}
          <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>sự cố</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{cfg.label}</div>
      </div>
    </Col>
  );

  const columns: ColumnsType<SafetyIncident> = [
    {
      title: 'Mã sự cố',
      dataIndex: 'code',
      width: 110,
      fixed: 'left',
      render: (code: string) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên sự cố',
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string, record: SafetyIncident) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1B3A5C', fontSize: 13 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.location}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 150,
      render: (type: IncidentType) => {
        const cfg = incidentTypeConfig[type];
        return <Tag style={{ borderRadius: 4 }} color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      width: 120,
      align: 'center',
      render: (severity: IncidentSeverity) => {
        const cfg = incidentSeverityConfig[severity];
        return (
          <Tag style={{ background: cfg.color, color: '#fff', border: 'none', borderRadius: 4 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Trung tâm',
      dataIndex: 'workshopName',
      width: 160,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Ngày xảy ra',
      dataIndex: 'occurredAt',
      width: 120,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d.split(' ')[0])}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (status: IncidentStatus) => {
        const cfg = incidentStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: SafetyIncident) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(isSafety && record.status !== 'closed'
                ? [{ key: 'edit', icon: <EditOutlined />, label: 'Cập nhật xử lý' }]
                : []),
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/su-co/${record.id}`);
              if (key === 'edit') navigate(`/su-co/${record.id}/edit`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  const getRowClassName = (record: SafetyIncident): string => {
    if (record.severity === 'nghiem_trong' && record.status !== 'closed') return 'row-critical';
    if (record.status !== 'closed') return 'row-in-progress';
    return '';
  };

  const workshopOptions = [
    { value: 'PX1', label: 'TT Phần mềm Alpha' },
    { value: 'PX2', label: 'TT Phần mềm Beta' },
    { value: 'PX3', label: 'TT Phần mềm Gamma' },
    { value: 'PX4', label: 'TT DevOps' },
  ];

  return (
    <div>
      {/* ─── Page header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Sự cố & Tai nạn Kỹ thuật
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý, điều tra và xử lý sự cố an toàn tại Doanh nghiệp A
            </Text>
          </div>
        </Space>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {renderStatCard(statCards[0], stats.total)}
        {renderStatCard(statCards[1], stats.nghiem_trong)}
        {renderStatCard(statCards[2], stats.open)}
        {renderStatCard(statCards[3], stats.closed)}
      </Row>

      {/* ─── Filter + Table ─── */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
        }}>
          <Input
            placeholder="Tìm theo mã, tên sự cố, trung tâm..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={v => setStatusFilter(v)}
            allowClear style={{ width: 160 }}
            options={Object.entries(incidentStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="Mức độ"
            value={severityFilter}
            onChange={v => setSeverityFilter(v)}
            allowClear style={{ width: 150 }}
            options={Object.entries(incidentSeverityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="Trung tâm"
            value={workshopFilter}
            onChange={v => setWorkshopFilter(v)}
            allowClear style={{ width: 160 }}
            options={workshopOptions}
          />
          <Select
            placeholder="Loại sự cố"
            value={typeFilter}
            onChange={v => setTypeFilter(v)}
            allowClear style={{ width: 160 }}
            options={Object.entries(incidentTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c' }}>
            Hiển thị <Text strong>{filteredData.length}</Text>/{incidents.length} sự cố
          </div>
        </div>
        <Table<SafetyIncident>
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          rowClassName={getRowClassName}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} sự cố`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
          style={{ margin: 0 }}
        />
      </Card>
    </div>
  );
};

export default IncidentsPage;
