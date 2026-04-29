import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Row, Col, Typography, Input, Select,
  Space, Button, Dropdown,
} from 'antd';
import {
  WarningOutlined,
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  MoreOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { technicalRisks } from '../../data/risks';
import {
  riskLevelConfig,
  riskStatusConfig,
  riskDataSourceConfig,
  hazardCategoryConfig,
  probabilityLabels,
  impactLabels,
  formatDate,
} from '../../utils/format';
import type { TechnicalRisk, RiskLevel, RiskStatus, HazardCategory, RiskDataSource } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const statCards = [
  {
    key: 'total',
    label: 'Tổng rủi ro',
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
    icon: <WarningOutlined />,
  },
  {
    key: 'very_high',
    label: 'Rất cao',
    gradient: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
    icon: <ExclamationCircleOutlined />,
  },
  {
    key: 'high',
    label: 'Cao',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
    icon: <WarningOutlined />,
  },
  {
    key: 'controlled',
    label: 'Đã kiểm soát',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    icon: <CheckCircleOutlined />,
  },
];

const RisksPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSafety } = useUser();

  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<RiskLevel | undefined>();
  const [statusFilter, setStatusFilter] = useState<RiskStatus | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<HazardCategory | undefined>();
  const [workshopFilter, setWorkshopFilter] = useState<string | undefined>();
  const [dataSourceFilter, setDataSourceFilter] = useState<RiskDataSource | undefined>();

  const stats = useMemo(() => ({
    total:      technicalRisks.filter(r => r.status !== 'closed').length,
    very_high:  technicalRisks.filter(r => r.riskLevel === 'very_high' && r.status !== 'closed').length,
    high:       technicalRisks.filter(r => r.riskLevel === 'high' && r.status !== 'closed').length,
    controlled: technicalRisks.filter(r => r.status === 'controlled').length,
  }), []);

  const filteredData = useMemo(() => {
    let result = [...technicalRisks].sort((a, b) => b.riskScore - a.riskScore);
    if (levelFilter)      result = result.filter(r => r.riskLevel === levelFilter);
    if (statusFilter)     result = result.filter(r => r.status === statusFilter);
    if (categoryFilter)   result = result.filter(r => r.hazardCategory === categoryFilter);
    if (workshopFilter)   result = result.filter(r => r.workshopId === workshopFilter);
    if (dataSourceFilter) result = result.filter(r => r.dataSource === dataSourceFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(r =>
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.workshopName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [searchText, levelFilter, statusFilter, categoryFilter, workshopFilter, dataSourceFilter]);

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
          <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>rủi ro</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{cfg.label}</div>
      </div>
    </Col>
  );

  const columns: ColumnsType<TechnicalRisk> = [
    {
      title: 'Mã rủi ro',
      dataIndex: 'code',
      width: 100,
      fixed: 'left',
      render: (code: string) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên rủi ro',
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string, record: TechnicalRisk) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1B3A5C', fontSize: 13 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.equipmentOrProcess}</div>
        </div>
      ),
    },
    {
      title: 'Nguy cơ',
      dataIndex: 'hazardCategory',
      width: 130,
      render: (cat: HazardCategory) => {
        const cfg = hazardCategoryConfig[cat];
        return (
          <Tag style={{ borderRadius: 4, color: cfg.color, borderColor: cfg.color }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Xác suất',
      dataIndex: 'probability',
      width: 80,
      align: 'center',
      render: (p: number) => (
        <Tag style={{ borderRadius: 4, background: '#f0f2f5', border: 'none', color: '#1B3A5C', fontWeight: 600 }}>
          {p}
        </Tag>
      ),
    },
    {
      title: 'Tác động',
      dataIndex: 'impact',
      width: 80,
      align: 'center',
      render: (i: number) => (
        <Tag style={{ borderRadius: 4, background: '#f0f2f5', border: 'none', color: '#1B3A5C', fontWeight: 600 }}>
          {i}
        </Tag>
      ),
    },
    {
      title: 'Điểm rủi ro',
      dataIndex: 'riskScore',
      width: 100,
      align: 'center',
      sorter: (a, b) => b.riskScore - a.riskScore,
      render: (score: number, record: TechnicalRisk) => {
        const cfg = riskLevelConfig[record.riskLevel];
        return (
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: cfg.color, margin: '0 auto',
          }}>
            {score}
          </div>
        );
      },
    },
    {
      title: 'Mức rủi ro',
      dataIndex: 'riskLevel',
      width: 120,
      render: (level: RiskLevel) => {
        const cfg = riskLevelConfig[level];
        return (
          <Tag style={{ background: cfg.bg, color: cfg.color, border: 'none', borderRadius: 4 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Phân xưởng',
      dataIndex: 'workshopName',
      width: 160,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Nguồn nhận diện',
      dataIndex: 'dataSource',
      width: 150,
      render: (src: TechnicalRisk['dataSource']) => {
        if (!src) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        const cfg = riskDataSourceConfig[src];
        return <Tag style={{ borderRadius: 4, color: cfg.color, borderColor: cfg.color, fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status: RiskStatus) => {
        const cfg = riskStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: TechnicalRisk) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/rui-ro/${record.id}`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  const workshopOptions = [
    { value: 'PX1', label: 'PX1 - Radar' },
    { value: 'PX2', label: 'PX2 - Tên lửa' },
    { value: 'PX3', label: 'PX3 - Cơ khí' },
    { value: 'PX4', label: 'PX4 - Điện tử' },
  ];

  return (
    <div>
      {/* ─── Page header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WarningOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Danh sách Rủi ro Kỹ thuật
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Nhận diện và kiểm soát rủi ro an toàn tại Nhà máy Z119
            </Text>
          </div>
        </Space>
        <Space>
          <Button
            icon={<ApartmentOutlined />}
            onClick={() => navigate('/ma-tran-rui-ro')}
            style={{ borderRadius: 8 }}
          >
            Ma trận rủi ro
          </Button>
          {isSafety && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/rui-ro/new')}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
            >
              Thêm rủi ro
            </Button>
          )}
        </Space>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {renderStatCard(statCards[0], stats.total)}
        {renderStatCard(statCards[1], stats.very_high)}
        {renderStatCard(statCards[2], stats.high)}
        {renderStatCard(statCards[3], stats.controlled)}
      </Row>

      {/* ─── Filter + Table ─── */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
        }}>
          <Input
            placeholder="Tìm theo mã, tên rủi ro, phân xưởng..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Mức rủi ro"
            value={levelFilter}
            onChange={v => setLevelFilter(v)}
            allowClear style={{ width: 150 }}
            options={Object.entries(riskLevelConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={v => setStatusFilter(v)}
            allowClear style={{ width: 160 }}
            options={Object.entries(riskStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="Loại nguy cơ"
            value={categoryFilter}
            onChange={v => setCategoryFilter(v)}
            allowClear style={{ width: 150 }}
            options={Object.entries(hazardCategoryConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="Phân xưởng"
            value={workshopFilter}
            onChange={v => setWorkshopFilter(v)}
            allowClear style={{ width: 160 }}
            options={workshopOptions}
          />
          <Select
            placeholder="Nguồn nhận diện"
            value={dataSourceFilter}
            onChange={v => setDataSourceFilter(v)}
            allowClear style={{ width: 170 }}
            options={Object.entries(riskDataSourceConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c' }}>
            Hiển thị <Text strong>{filteredData.length}</Text>/{technicalRisks.length} rủi ro
          </div>
        </div>
        <Table<TechnicalRisk>
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} rủi ro`,
          }}
          scroll={{ x: 1300 }}
          size="middle"
          style={{ margin: 0 }}
        />
      </Card>

      {/* ─── Chú thích xác suất / tác động ─── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card
            title={<Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Thang đo xác suất</Text>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 16 } }}
          >
            {([1, 2, 3, 4, 5] as const).map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 5,
                  background: '#1B3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {p}
                </div>
                <Text style={{ fontSize: 13 }}>{probabilityLabels[p]}</Text>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={<Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Thang đo tác động</Text>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 16 } }}
          >
            {([1, 2, 3, 4, 5] as const).map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 5,
                  background: '#1B3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {i}
                </div>
                <Text style={{ fontSize: 13 }}>{impactLabels[i]}</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RisksPage;
