import React, { useState, useMemo } from 'react';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography, Badge, Dropdown,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, ImportOutlined, MoreOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, DollarOutlined,
  EyeOutlined, EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { inboundOrders } from '../../data/inboundOrders';
import type { InboundOrder, InboundType, InboundStatus } from '../../types';
import {
  inboundStatusConfig,
  formatNumber,
  formatDate,
} from '../../utils/format';

const { Title, Text } = Typography;

// ─── Inbound type labels ────────────────────────────────────
const inboundTypeLabels: Record<InboundType, { label: string; color: string }> = {
  purchase: { label: 'Mua sắm', color: '#1B3A5C' },
  production: { label: 'Sản xuất', color: '#531dab' },
  transfer_in: { label: 'Điều chuyển', color: '#08979c' },
  return: { label: 'Trả lại', color: '#d48806' },
};

// ─── Unique warehouse options from data ─────────────────────
const warehouseOptions = [
  ...new Map(
    inboundOrders.map((o) => [o.warehouseId, { id: o.warehouseId, name: o.warehouseName }])
  ).values(),
];

const InboundOrders: React.FC = () => {
  const navigate = useNavigate();

  // ─── Filter state ─────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<InboundType | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<InboundStatus | undefined>(undefined);
  const [filterWarehouse, setFilterWarehouse] = useState<string | undefined>(undefined);

  // ─── Filtered data ────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return inboundOrders.filter((o) => {
      const matchSearch =
        !searchText ||
        o.code.toLowerCase().includes(searchText.toLowerCase()) ||
        o.sourceName.toLowerCase().includes(searchText.toLowerCase()) ||
        (o.referenceCode || '').toLowerCase().includes(searchText.toLowerCase());
      const matchType = !filterType || o.type === filterType;
      const matchStatus = !filterStatus || o.status === filterStatus;
      const matchWarehouse = !filterWarehouse || o.warehouseId === filterWarehouse;
      return matchSearch && matchType && matchStatus && matchWarehouse;
    });
  }, [searchText, filterType, filterStatus, filterWarehouse]);

  // ─── Summary stats ────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const total = filteredOrders.length;
    const done = filteredOrders.filter((o) => o.status === 'done').length;
    const processing = filteredOrders.filter(
      (o) => o.status === 'waiting' || o.status === 'receiving' || o.status === 'quality_check'
    ).length;
    const totalValue = filteredOrders.reduce((sum, o) => sum + o.totalValue, 0);
    return { total, done, processing, totalValue };
  }, [filteredOrders]);

  // ─── Format value as "X.X ty" or "XXX tr" ────────────────
  const formatValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)} tr`;
    }
    return formatNumber(value);
  };

  // ─── Table columns ────────────────────────────────────────
  const columns: ColumnsType<InboundOrder> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string, record: InboundOrder) => (
        <a
          onClick={() => navigate(`/inbound/${record.id}`)}
          style={{ color: '#1B3A5C', fontWeight: 600, fontFamily: 'monospace', fontSize: 13, cursor: 'pointer' }}
        >
          {code}
        </a>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (type: InboundType) => {
        const config = inboundTypeLabels[type];
        return (
          <Tag color={config.color} style={{ borderRadius: 4, fontSize: 12 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Kho nhận',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 190,
      ellipsis: true,
      render: (name: string) => (
        <Text style={{ fontSize: 13 }}>{name}</Text>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'sourceName',
      key: 'sourceName',
      ellipsis: true,
      render: (name: string, record: InboundOrder) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>{name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.sourceType}</Text>
        </Space>
      ),
    },
    {
      title: 'Mã tham chiếu',
      dataIndex: 'referenceCode',
      key: 'referenceCode',
      width: 140,
      render: (code: string) =>
        code ? (
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#666' }}>{code}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Số mặt hàng',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontWeight: 500, fontSize: 13 }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>
          {formatValue(val)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: InboundStatus) => {
        const config = inboundStatusConfig[status];
        return (
          <Tag color={config.color} style={{ borderRadius: 4, fontSize: 12 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày dự kiến',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 120,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_: unknown, record: InboundOrder) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/inbound/${record.id}`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  // ─── Stat card config ─────────────────────────────────────
  const statCards = [
    {
      label: 'Tổng phiếu',
      value: summaryStats.total,
      suffix: 'phiếu',
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <ImportOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Đã hoàn thành',
      value: summaryStats.done,
      suffix: 'phiếu',
      gradient: 'linear-gradient(135deg, #237804, #52c41a)',
      icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Đang xử lý',
      value: summaryStats.processing,
      suffix: 'phiếu',
      gradient: 'linear-gradient(135deg, #d48806, #faad14)',
      icon: <SyncOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Tổng giá trị',
      value: formatValue(summaryStats.totalValue),
      suffix: '',
      gradient: 'linear-gradient(135deg, #531dab, #722ed1)',
      icon: <DollarOutlined style={{ fontSize: 64 }} />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Page Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ImportOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Nhập kho</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý phiếu nhập kho vật tư, linh kiện
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/inbound/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Tạo phiếu nhập
        </Button>
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder="Tìm theo mã phiếu, nguồn, mã tham chiếu..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loại nhập"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'purchase', label: 'Mua sắm' },
                { value: 'production', label: 'Sản xuất' },
                { value: 'transfer_in', label: 'Điều chuyển' },
                { value: 'return', label: 'Trả lại' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(inboundStatusConfig).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Kho nhận"
              value={filterWarehouse}
              onChange={setFilterWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouseOptions.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* ─── Summary Stat Row ────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{
                background: card.gradient,
                borderRadius: 14,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '18px 20px', position: 'relative', zIndex: 1 }}
            >
              {/* Background icon */}
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  color: 'rgba(255,255,255,0.1)',
                  fontSize: 64,
                  lineHeight: 1,
                  zIndex: 0,
                }}
              >
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {card.label}
                </Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>
                    {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                  </span>
                  {card.suffix && (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>
                      {card.suffix}
                    </span>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Table ───────────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center" size={8}>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  Danh sách phiếu nhập
                </Text>
                <Badge
                  count={filteredOrders.length}
                  style={{ backgroundColor: '#e8f0fe', color: '#1B3A5C', fontSize: 11 }}
                />
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hiển thị {filteredOrders.length} / {inboundOrders.length} phiếu
              </Text>
            </Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
          style={{ padding: '0 4px' }}
        />
      </Card>
    </div>
  );
};

export default InboundOrders;
