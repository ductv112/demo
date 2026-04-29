import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input, Select, Card, Space, Row, Col, Typography, Tag, Button, Tooltip, Empty, Dropdown,
} from 'antd';
import {
  SearchOutlined, NodeIndexOutlined, CheckCircleOutlined,
  FileTextOutlined, EyeOutlined, EditOutlined,
  CalendarOutlined, UserOutlined, OrderedListOutlined,
  ClockCircleOutlined, BranchesOutlined, MoreOutlined, PlusOutlined,
} from '@ant-design/icons';

import { processRoutings } from '../../data/processRoutings';
import type { ProcessRouting, RoutingStatus } from '../../types';
import { routingStatusConfig, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

// ─── Type labels ────────────────────────────────────────────
const routingTypeLabels: Record<ProcessRouting['type'], { label: string; color: string }> = {
  new_production: { label: 'Sản xuất mới', color: '#1B3A5C' },
  repair:         { label: 'Sửa chữa',          color: '#d97706' },
  overhaul:       { label: 'Đại tu',            color: '#7c3aed' },
};

// ─── Status → border-left color ─────────────────────────────
const statusBorderColor: Record<RoutingStatus, string> = {
  active:     '#52c41a',
  approved:   '#1890ff',
  draft:      '#8c8c8c',
  deprecated: '#ff4d4f',
};

// ─── Stat card config ───────────────────────────────────────
interface StatItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  gradient: string;
  IconComp: React.FC<{ style?: React.CSSProperties }>;
}

const ProcessRoutingPage: React.FC = () => {
  const navigate = useNavigate();
  // ─── Filter state ─────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // ─── Computed stats ───────────────────────────────────────
  const stats = useMemo(() => {
    const total = processRoutings.length;
    const active = processRoutings.filter((r) => r.status === 'active').length;
    const draft = processRoutings.filter((r) => r.status === 'draft').length;
    return { total, active, draft };
  }, []);

  const statCards: StatItem[] = [
    {
      key: 'total',
      label: 'Tổng quy trình',
      value: stats.total,
      unit: 'quy trình',
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      IconComp: NodeIndexOutlined,
    },
    {
      key: 'active',
      label: 'Đang sử dụng',
      value: stats.active,
      unit: 'quy trình',
      gradient: 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)',
      IconComp: CheckCircleOutlined,
    },
    {
      key: 'draft',
      label: 'Nháp',
      value: stats.draft,
      unit: 'quy trình',
      gradient: 'linear-gradient(135deg, #595959 0%, #8c8c8c 100%)',
      IconComp: FileTextOutlined,
    },
  ];

  // ─── Filtered data ────────────────────────────────────────
  const filteredData = useMemo(() => {
    return processRoutings.filter((item) => {
      const matchSearch =
        !searchText ||
        item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchText.toLowerCase());
      const matchType = !filterType || item.type === filterType;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [searchText, filterType, filterStatus]);

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Page Header ──────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="center" size={12}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BranchesOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Quy trình công nghệ</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản lý quy trình công nghệ, công đoạn sản xuất</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/process-routings/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Thêm mới
        </Button>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((stat, idx) => (
          <Col xs={12} sm={8} md={8} key={stat.key}>
            <Card
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{
                background: stat.gradient,
                border: 'none',
                borderRadius: 14,
                overflow: 'hidden',
              }}
              styles={{ body: { padding: '20px 18px', position: 'relative' } }}
            >
              {/* Background icon */}
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -4,
                  pointerEvents: 'none',
                }}
              >
                <stat.IconComp style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Icon badge */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <stat.IconComp style={{ fontSize: 16, color: '#fff' }} />
                </div>
                {/* Value */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                  <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>
                    {stat.unit}
                  </span>
                </div>
                {/* Label */}
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  {stat.label}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Filters ──────────────────────────────────────── */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14, marginBottom: 20 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={8}>
            <Input
              placeholder="Tìm kiếm theo mã, tên sản phẩm..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select
              placeholder="Loại quy trình"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(routingTypeLabels).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              }))}
            />
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(routingStatusConfig).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={6} md={6} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {filteredData.length}/{processRoutings.length} kết quả
              </Text>
              <Button
                size="small"
                onClick={() => {
                  setSearchText('');
                  setFilterType(undefined);
                  setFilterStatus(undefined);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ─── Section Title ────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Space align="center" size={8}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NodeIndexOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>
            Danh sách quy trình công nghệ
          </Title>
        </Space>
      </div>

      {/* ─── Routing Cards ────────────────────────────────── */}
      {filteredData.length === 0 ? (
        <Card style={{ borderRadius: 14 }}>
          <Empty description="Không tìm thấy quy trình nào" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((routing, idx) => {
            const statusCfg = routingStatusConfig[routing.status];
            const typeCfg = routingTypeLabels[routing.type];
            const borderColor = statusBorderColor[routing.status];

            return (
              <Col xs={24} sm={24} md={12} key={routing.id}>
                <Card
                  className={`db-chart-card animate-fade-in animate-delay-${(idx % 6) + 1}`}
                  style={{
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                  styles={{ body: { padding: '20px 24px' } }}
                  hoverable
                >
                  {/* ─── Card Header ─────────────────── */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Space size={8} style={{ marginBottom: 6 }}>
                        <Text
                          strong
                          style={{
                            color: '#1B3A5C',
                            fontSize: 14,
                            fontFamily: 'monospace',
                          }}
                        >
                          {routing.code}
                        </Text>
                        <Tag
                          style={{ fontFamily: 'monospace', fontWeight: 600 }}
                        >
                          {routing.version}
                        </Tag>
                      </Space>
                      <div>
                        <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                          {routing.productName}
                        </Text>
                      </div>
                    </div>
                    <Space size={6}>
                      <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
                      <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                    </Space>
                  </div>

                  {/* ─── Card Body — Stats Grid ──────── */}
                  <Row gutter={[16, 10]} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <div
                        style={{
                          background: '#f5f7fa',
                          borderRadius: 8,
                          padding: '10px 12px',
                          textAlign: 'center',
                        }}
                      >
                        <OrderedListOutlined
                          style={{ color: '#1B3A5C', fontSize: 16, marginBottom: 4 }}
                        />
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#1B3A5C',
                            lineHeight: 1.3,
                          }}
                        >
                          {routing.totalSteps}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          Công đoạn
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          background: '#f5f7fa',
                          borderRadius: 8,
                          padding: '10px 12px',
                          textAlign: 'center',
                        }}
                      >
                        <ClockCircleOutlined
                          style={{ color: '#D4A843', fontSize: 16, marginBottom: 4 }}
                        />
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#D4A843',
                            lineHeight: 1.3,
                          }}
                        >
                          {routing.estimatedDays}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          Ngày (ước tính)
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          background: '#f5f7fa',
                          borderRadius: 8,
                          padding: '10px 12px',
                          textAlign: 'center',
                        }}
                      >
                        <CalendarOutlined
                          style={{ color: '#52c41a', fontSize: 16, marginBottom: 4 }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#1B3A5C',
                            lineHeight: 1.3,
                            marginTop: 2,
                          }}
                        >
                          {formatDate(routing.createdAt)}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          Ngày tạo
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* ─── Card Footer — Approved info & actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: 12,
                    }}
                  >
                    <div>
                      {routing.approvedBy ? (
                        <Space size={6}>
                          <UserOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                          <Text style={{ fontSize: 12, color: '#595959' }}>
                            Phê duyệt: <Text strong style={{ fontSize: 12 }}>{routing.approvedBy}</Text>
                          </Text>
                          {routing.approvedAt && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              ({formatDate(routing.approvedAt)})
                            </Text>
                          )}
                        </Space>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                          Chưa phê duyệt
                        </Text>
                      )}
                    </div>
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
                          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                        ],
                        onClick: ({ key }) => {
                          if (key === 'view') navigate(`/process-routings/${routing.id}`);
                          if (key === 'edit') navigate(`/process-routings/${routing.id}/edit`);
                        },
                      }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
                    </Dropdown>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default ProcessRoutingPage;
