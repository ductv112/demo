import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Row, Col, Typography, Input, Select,
  Space, Button, Dropdown, Progress,
} from 'antd';
import {
  BulbOutlined, SearchOutlined, EyeOutlined,
  PlusOutlined, MoreOutlined,
  CheckCircleOutlined, SyncOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { improvements } from '../../data/improvements';
import {
  improvementStatusConfig, improvementSourceConfig, improvementPriorityConfig,
  formatDate, formatNumber,
} from '../../utils/format';
import type { ImprovementProposal, ImprovementStatus, ImprovementSource, ImprovementPriority } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;


const ImprovementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSafety, isDirector } = useUser();

  const [searchText, setSearchText]       = useState('');
  const [statusFilter, setStatusFilter]   = useState<ImprovementStatus | undefined>();
  const [sourceFilter, setSourceFilter]   = useState<ImprovementSource | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<ImprovementPriority | undefined>();
  const [workshopFilter, setWorkshopFilter] = useState<string | undefined>();

  const stats = useMemo(() => ({
    total:        improvements.length,
    implementing: improvements.filter(i => i.status === 'implementing' || i.status === 'evaluating').length,
    closed:       improvements.filter(i => i.status === 'closed').length,
    proposed:     improvements.filter(i => i.status === 'proposed' || i.status === 'approved').length,
  }), []);

  const totalCost = improvements
    .filter(i => i.status !== 'rejected')
    .reduce((s, i) => s + (i.estimatedCost ?? 0), 0);

  const filteredData = useMemo(() => {
    let result = [...improvements].sort((a, b) => b.proposedAt.localeCompare(a.proposedAt));
    if (statusFilter)   result = result.filter(i => i.status === statusFilter);
    if (sourceFilter)   result = result.filter(i => i.source === sourceFilter);
    if (priorityFilter) result = result.filter(i => i.priority === priorityFilter);
    if (workshopFilter) result = result.filter(i => i.workshopIds.includes(workshopFilter));
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(i =>
        i.code.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q),
      );
    }
    return result;
  }, [searchText, statusFilter, sourceFilter, priorityFilter, workshopFilter]);

  const columns: ColumnsType<ImprovementProposal> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 90,
      fixed: 'left',
      render: (code: string) => <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{code}</Text>,
    },
    {
      title: 'Nội dung đề xuất cải tiến',
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string, record: ImprovementProposal) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1B3A5C', fontSize: 13 }}>{title}</div>
          {record.relatedCode && (
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>Liên quan: {record.relatedCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      width: 160,
      render: (src: ImprovementSource) => {
        const cfg = improvementSourceConfig[src];
        return <Tag style={{ borderRadius: 4, color: cfg.color, borderColor: cfg.color, fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      width: 100,
      align: 'center',
      render: (p: ImprovementPriority) => {
        const cfg = improvementPriorityConfig[p];
        return <Tag style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}40`, borderRadius: 4 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Tiến độ',
      width: 160,
      render: (_: unknown, record: ImprovementProposal) => {
        const cfg = improvementStatusConfig[record.status];
        const step = cfg.step;
        const pct  = record.status === 'rejected' ? 0 : Math.round((step / 4) * 100);
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>
            </div>
            {record.status !== 'rejected' && (
              <Progress percent={pct} size="small" strokeColor="#1B3A5C" showInfo={false} trailColor="#f0f2f5" />
            )}
          </div>
        );
      },
    },
    {
      title: 'Đơn vị',
      width: 120,
      render: (_: unknown, record: ImprovementProposal) => (
        <Space size={4} wrap>
          {record.workshopIds.map(ws => <Tag key={ws} style={{ fontSize: 11, margin: 0 }}>{ws}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Đề xuất',
      dataIndex: 'proposedAt',
      width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Thao tác',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: ImprovementProposal) => (
        <Dropdown
          menu={{
            items: [{ key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' }],
            onClick: ({ key }) => { if (key === 'view') navigate(`/cai-tien-phong-ngua/${record.id}`); },
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
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BulbOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Theo dõi, Cải tiến & Phòng ngừa Rủi ro
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý đề xuất cải tiến phát sinh từ phân tích sự cố, rủi ro và vi phạm — Nhà máy Z119
            </Text>
          </div>
        </Space>
        {(isSafety || isDirector) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/cai-tien-phong-ngua/new')}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
          >
            Đề xuất cải tiến
          </Button>
        )}
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng đề xuất',       value: stats.total,        gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <BulbOutlined />,        unit: 'đề xuất' },
          { label: 'Đang triển khai',     value: stats.implementing,  gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <SyncOutlined />,        unit: 'đề xuất' },
          { label: 'Chờ phê duyệt',       value: stats.proposed,      gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', icon: <ClockCircleOutlined />, unit: 'đề xuất' },
          { label: 'Đã hoàn thành',       value: stats.closed,        gradient: 'linear-gradient(135deg, #059669, #10b981)', icon: <CheckCircleOutlined />, unit: 'đề xuất' },
        ].map(card => (
          <Col xs={24} sm={12} md={6} key={card.label}>
            <div style={{
              background: card.gradient, borderRadius: 14, padding: '20px 24px',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {card.value}<span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>{card.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Nguồn đề xuất ─── */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[24, 0]} align="middle">
          <Col xs={24} md={14}>
            <Text strong style={{ color: '#1B3A5C', display: 'block', marginBottom: 12 }}>Nguồn đề xuất</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(improvementSourceConfig).map(([key, cfg]) => {
                const count = improvements.filter(i => i.source === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: '#fafbfc', border: '1px solid #f0f0f0' }}>
                    <Tag style={{ borderRadius: 4, color: cfg.color, borderColor: cfg.color, margin: 0 }}>{cfg.label}</Tag>
                    <Text strong style={{ color: '#1B3A5C' }}>{count}</Text>
                  </div>
                );
              })}
            </div>
          </Col>
          <Col xs={24} md={10}>
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#f0f7ff', border: '1px solid #91caff' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Tổng chi phí ước tính</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3A5C', marginTop: 2 }}>
                {formatNumber(Math.round(totalCost / 1000000))} triệu đồng
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ─── Filter + Table ─── */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo mã, nội dung đề xuất..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 260 }} allowClear
          />
          <Select placeholder="Trạng thái" value={statusFilter} onChange={v => setStatusFilter(v)} allowClear style={{ width: 160 }}
            options={Object.entries(improvementStatusConfig).filter(([k]) => k !== 'rejected').map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Nguồn đề xuất" value={sourceFilter} onChange={v => setSourceFilter(v)} allowClear style={{ width: 170 }}
            options={Object.entries(improvementSourceConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Ưu tiên" value={priorityFilter} onChange={v => setPriorityFilter(v)} allowClear style={{ width: 140 }}
            options={Object.entries(improvementPriorityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Phân xưởng" value={workshopFilter} onChange={v => setWorkshopFilter(v)} allowClear style={{ width: 160 }} options={workshopOptions} />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c' }}>
            <Text strong>{filteredData.length}</Text>/{improvements.length} đề xuất
          </div>
        </div>
        <Table<ImprovementProposal>
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: t => `Tổng ${t} đề xuất` }}
          scroll={{ x: 1200 }}
          size="middle"
          style={{ margin: 0 }}
        />
      </Card>
    </div>
  );
};

export default ImprovementsPage;
