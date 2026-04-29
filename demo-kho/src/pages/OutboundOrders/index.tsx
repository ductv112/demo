import React, { useState, useMemo } from 'react';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography, Badge, Dropdown,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, ExportOutlined, MoreOutlined,
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined,
  EyeOutlined, EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { outboundOrders } from '../../data/outboundOrders';
import { warehouses } from '../../data/warehouses';
import { departments } from '../../data/departments';
import type { OutboundOrder, OutboundType, OutboundStatus } from '../../types';
import {
  outboundStatusConfig,
  formatDate,
  formatNumber,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

// ─── Label mappings ──────────────────────────────────────────
const outboundTypeLabels: Record<OutboundType, { label: string; color: string }> = {
  dispatch: { label: 'Cấp phát', color: '#1B3A5C' },
  production: { label: 'Sản xuất', color: '#531dab' },
  transfer_out: { label: 'Điều chuyển', color: '#08979c' },
  scrap: { label: 'Thanh lý', color: '#d48806' },
};

const strategyLabels: Record<string, { label: string; color: string }> = {
  fifo: { label: 'FIFO', color: 'blue' },
  fefo: { label: 'FEFO', color: 'orange' },
  nearest: { label: 'Gần nhất', color: 'cyan' },
};

// ─── Format value ────────────────────────────────────────────
const formatValue = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} N`;
  return formatNumber(value);
};

const OutboundOrders: React.FC = () => {
  const navigate = useNavigate();

  // ─── Filter state ────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterWarehouse, setFilterWarehouse] = useState<string | undefined>(undefined);

  // ─── Filtered data ───────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return outboundOrders.filter((o) => {
      const matchSearch =
        !searchText ||
        o.code.toLowerCase().includes(searchText.toLowerCase()) ||
        o.destinationName.toLowerCase().includes(searchText.toLowerCase()) ||
        o.warehouseName.toLowerCase().includes(searchText.toLowerCase()) ||
        (o.referenceCode && o.referenceCode.toLowerCase().includes(searchText.toLowerCase()));
      const matchType = !filterType || o.type === filterType;
      const matchStatus = !filterStatus || o.status === filterStatus;
      const matchWarehouse = !filterWarehouse || o.warehouseId === filterWarehouse;
      return matchSearch && matchType && matchStatus && matchWarehouse;
    });
  }, [searchText, filterType, filterStatus, filterWarehouse]);

  // ─── Summary stats ──────────────────────────────────────
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const done = filteredOrders.filter((o) => o.status === 'done').length;
    const processing = filteredOrders.filter(
      (o) => o.status === 'submitted' || o.status === 'approved' || o.status === 'picking' || o.status === 'packing',
    ).length;
    const totalValue = filteredOrders.reduce((sum, o) => sum + o.totalValue, 0);
    return { total, done, processing, totalValue };
  }, [filteredOrders]);

  const statCards = [
    {
      title: 'Tổng phiếu',
      value: stats.total,
      suffix: 'phiếu',
      icon: <FileTextOutlined />,
      gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
    },
    {
      title: 'Đã xuất',
      value: stats.done,
      suffix: 'phiếu',
      icon: <CheckCircleOutlined />,
      gradient: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
    },
    {
      title: 'Đang xử lý',
      value: stats.processing,
      suffix: 'phiếu',
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #fa8c16, #ffc53d)',
    },
    {
      title: 'Tổng giá trị',
      value: formatValue(stats.totalValue),
      suffix: '',
      icon: <DollarOutlined />,
      gradient: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
    },
  ];

  // ─── Department name lookup ─────────────────────────────
  const getDepartmentName = (id?: string): string => {
    if (!id) return '-';
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.shortName : id;
  };

  // ─── Table columns ─────────────────────────────────────
  const tableColumns: ColumnsType<OutboundOrder> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
      render: (code: string, record: OutboundOrder) => (
        <a
          onClick={() => navigate(`/outbound/${record.id}`)}
          style={{ color: colors.navy, fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}
        >
          {code}
        </a>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: OutboundType) => {
        const cfg = outboundTypeLabels[type];
        return <Tag color={cfg.color} style={{ borderRadius: 4, fontSize: 12 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Kho xuất',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 180,
      ellipsis: true,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Nơi nhận',
      dataIndex: 'destinationName',
      key: 'destinationName',
      width: 200,
      ellipsis: true,
      render: (name: string) => <Text strong style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Đơn vị nhận',
      dataIndex: 'departmentId',
      key: 'departmentId',
      width: 100,
      render: (_: unknown, record: OutboundOrder) => (
        <Text style={{ fontSize: 13 }}>{getDepartmentName(record.departmentId)}</Text>
      ),
    },
    {
      title: 'Số mặt hàng',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 100,
      align: 'center',
      render: (val: number) => (
        <Badge count={val} showZero style={{ backgroundColor: colors.navy }} />
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right',
      sorter: (a: OutboundOrder, b: OutboundOrder) => a.totalValue - b.totalValue,
      render: (val: number) => (
        <Text strong style={{ color: colors.navy, fontSize: 13 }}>{formatValue(val)}</Text>
      ),
    },
    {
      title: 'Chiến lược',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 90,
      align: 'center',
      render: (strategy: string) => {
        const cfg = strategyLabels[strategy];
        return cfg ? <Tag color={cfg.color} style={{ borderRadius: 4 }}>{cfg.label}</Tag> : strategy;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: OutboundStatus) => {
        const cfg = outboundStatusConfig[status];
        return <Tag color={cfg.color} style={{ borderRadius: 4, fontWeight: 500 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      width: 120,
      sorter: (a: OutboundOrder, b: OutboundOrder) => a.requestedDate.localeCompare(b.requestedDate),
      render: (date: string) => <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_: unknown, record: OutboundOrder) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/outbound/${record.id}`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Page Header ──────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ExportOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: colors.navy }}>Xuất kho & Cấp phát</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý phiếu xuất kho, cấp phát vật tư, điều chuyển, thanh lý
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/outbound/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Tạo phiếu xuất
        </Button>
      </div>

      {/* ─── Filter Bar ───────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm mã phiếu, nơi nhận..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Loại phiếu"
              value={filterType}
              onChange={(v) => setFilterType(v)}
              allowClear
              style={{ width: '100%', borderRadius: 6 }}
              options={[
                { value: 'dispatch', label: 'Cấp phát' },
                { value: 'production', label: 'Sản xuất' },
                { value: 'transfer_out', label: 'Điều chuyển' },
                { value: 'scrap', label: 'Thanh lý' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={(v) => setFilterStatus(v)}
              allowClear
              style={{ width: '100%', borderRadius: 6 }}
              options={Object.entries(outboundStatusConfig).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              }))}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Kho xuất"
              value={filterWarehouse}
              onChange={(v) => setFilterWarehouse(v)}
              allowClear
              style={{ width: '100%', borderRadius: 6 }}
              options={warehouses.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* ─── Stat Cards ───────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              style={{
                borderRadius: 14,
                background: card.gradient,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              styles={{ body: { padding: '20px 20px', position: 'relative', zIndex: 1 } }}
              className="stat-card-hover"
            >
              {/* Background icon */}
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 64,
                  opacity: 0.1,
                  color: '#fff',
                  transition: 'all 0.5s ease',
                }}
                className="stat-bg-icon"
              >
                {card.icon}
              </div>
              <Space direction="vertical" size={4}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff',
                    marginBottom: 4,
                  }}
                >
                  {card.icon}
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  {card.title}
                </Text>
                <div>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 26,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                  </Text>
                  {card.suffix && (
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 6 }}>
                      {card.suffix}
                    </Text>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Table ────────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 20px 0' }}>
          <Text strong style={{ color: colors.navy, fontSize: 15 }}>
            Danh sách phiếu xuất kho
          </Text>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
            ({filteredOrders.length} phiếu)
          </Text>
        </div>
        <Table
          dataSource={filteredOrders}
          columns={tableColumns}
          rowKey="id"
          size="middle"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu`,
          }}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default OutboundOrders;
