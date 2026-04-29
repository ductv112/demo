import { useMemo, useState } from 'react';
import { Row, Col, Card, Typography, Table, Space, Input, Select, Tag, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  StockOutlined, DatabaseOutlined, BarChartOutlined,
  ArrowUpOutlined, ArrowDownOutlined, SearchOutlined,
  WarningOutlined, CheckCircleOutlined, CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { inventoryItems } from '../../data/inventory';
import type { InventoryItem } from '../../types';
import { formatNumber, formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import StatCard from './StatCard';

const { Title, Text } = Typography;
const { Search } = Input;

const TODAY = new Date('2026-04-15');

// ─── Tính tình trạng hạn sử dụng ─────────────────────────────
const getExpiryStatus = (expiryDate?: string) => {
  if (!expiryDate) return null;
  const days = Math.floor((new Date(expiryDate).getTime() - TODAY.getTime()) / 86400000);
  if (days < 0)   return { label: 'Hết hạn',     color: 'error'   as const, days };
  if (days <= 30) return { label: 'Sắp hết hạn', color: 'warning' as const, days };
  return              { label: 'Còn hạn',      color: 'success' as const, days };
};

// ─── Aggregate items theo product ────────────────────────────
interface AggRow {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  totalIncoming: number;
  totalOutgoing: number;
  totalValue: number;
  warehouses: string[];
  hasExpiry: boolean;
  hasExpired: boolean;
  hasNearExpiry: boolean;
  lines: InventoryItem[];
}

const buildAggregated = (items: InventoryItem[]): AggRow[] => {
  const map = new Map<string, AggRow>();
  items.forEach(item => {
    const exp = getExpiryStatus(item.expiryDate);
    const existing = map.get(item.productId);
    if (existing) {
      existing.totalOnHand    += item.qtyOnHand;
      existing.totalReserved  += item.qtyReserved;
      existing.totalAvailable += item.qtyAvailable;
      existing.totalIncoming  += item.qtyIncoming;
      existing.totalOutgoing  += item.qtyOutgoing;
      existing.totalValue     += item.totalValue;
      if (!existing.warehouses.includes(item.warehouseName))
        existing.warehouses.push(item.warehouseName);
      if (exp) {
        existing.hasExpiry = true;
        if (exp.days < 0)   existing.hasExpired    = true;
        if (exp.days <= 30) existing.hasNearExpiry = true;
      }
      existing.lines.push(item);
    } else {
      map.set(item.productId, {
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        unit: item.unit,
        totalOnHand: item.qtyOnHand,
        totalReserved: item.qtyReserved,
        totalAvailable: item.qtyAvailable,
        totalIncoming: item.qtyIncoming,
        totalOutgoing: item.qtyOutgoing,
        totalValue: item.totalValue,
        warehouses: [item.warehouseName],
        hasExpiry: !!exp,
        hasExpired: !!exp && exp.days < 0,
        hasNearExpiry: !!exp && exp.days >= 0 && exp.days <= 30,
        lines: [item],
      });
    }
  });
  return Array.from(map.values());
};

// ─── Danh sách kho ───────────────────────────────────────────
const warehouseOptions = Array.from(
  new Set(inventoryItems.map(i => i.warehouseName))
).map(w => ({ value: w, label: w }));

// ─── Expand: bảng lô/serial chi tiết ─────────────────────────
const ExpandedLines = ({ lines }: { lines: InventoryItem[] }) => {
  const cols: ColumnsType<InventoryItem> = [
    {
      title: 'Lô / Serial', key: 'tracking', width: 180,
      render: (_: unknown, r: InventoryItem) => (
        <Space direction="vertical" size={0}>
          {r.lotNumber    && <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#1B3A5C' }}>Lô: {r.lotNumber}</Text>}
          {r.serialNumber && <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#531dab' }}>SN: {r.serialNumber}</Text>}
          {!r.lotNumber && !r.serialNumber && <Text type="secondary" style={{ fontSize: 11 }}>—</Text>}
        </Space>
      ),
    },
    {
      title: 'Kho / Vị trí', key: 'location', width: 180,
      render: (_: unknown, r: InventoryItem) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 11 }}>{r.warehouseName}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.locationCode}</Text>
        </Space>
      ),
    },
    {
      title: 'Tồn', dataIndex: 'qtyOnHand', key: 'qtyOnHand', width: 70, align: 'right' as const,
      render: (v: number, r: InventoryItem) => (
        <Text strong style={{ fontSize: 12 }}>{formatNumber(v)} {r.unit}</Text>
      ),
    },
    {
      title: 'Khả dụng', dataIndex: 'qtyAvailable', key: 'qtyAvailable', width: 80, align: 'right' as const,
      render: (v: number) => <Text style={{ fontSize: 12, color: colors.success }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Ngày nhập', dataIndex: 'receivedDate', key: 'receivedDate', width: 100,
      render: (d: string) => <Text type="secondary" style={{ fontSize: 11 }}>{new Date(d).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      title: 'Hạn sử dụng', key: 'expiry', width: 130,
      render: (_: unknown, r: InventoryItem) => {
        const exp = getExpiryStatus(r.expiryDate);
        if (!exp) return <Text type="secondary" style={{ fontSize: 11 }}>Không giới hạn</Text>;
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 11 }}>{new Date(r.expiryDate!).toLocaleDateString('vi-VN')}</Text>
            <Tag color={exp.color} style={{ fontSize: 10, lineHeight: '16px' }}>
              {exp.days < 0 ? `Quá hạn ${Math.abs(exp.days)}n` : `Còn ${exp.days} ngày`}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Tình trạng', key: 'status', width: 110,
      render: (_: unknown, r: InventoryItem) => {
        const exp = getExpiryStatus(r.expiryDate);
        if (exp?.days !== undefined && exp.days < 0)
          return <Tag icon={<CloseCircleOutlined />} color="error">Hết hạn</Tag>;
        if (exp?.days !== undefined && exp.days <= 30)
          return <Tag icon={<WarningOutlined />}       color="warning">Sắp hết hạn</Tag>;
        if (r.qtyAvailable === 0)
          return <Tag icon={<MinusCircleOutlined />}   color="default">Đã giữ hết</Tag>;
        return   <Tag icon={<CheckCircleOutlined />}   color="success">Còn hàng</Tag>;
      },
    },
  ];

  return (
    <div style={{ background: '#fafafa', padding: '8px 16px 12px' }}>
      <Table
        dataSource={lines}
        columns={cols}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 700 }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
const ReportInventory = () => {
  const [search,       setSearch]       = useState('');
  const [filterWh,     setFilterWh]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode,     setViewMode]     = useState<'product' | 'lot'>('product');

  // ─── Filtered raw items (dùng cho cả 2 view) ─────────────
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return inventoryItems.filter(item => {
      const matchSearch = !q ||
        item.productCode.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.lotNumber    ?? '').toLowerCase().includes(q) ||
        (item.serialNumber ?? '').toLowerCase().includes(q);
      const matchWh = !filterWh || item.warehouseName === filterWh;
      if (!matchSearch || !matchWh) return false;
      if (!filterStatus) return true;
      const exp = getExpiryStatus(item.expiryDate);
      if (filterStatus === 'expired')     return exp !== null && exp.days < 0;
      if (filterStatus === 'near_expiry') return exp !== null && exp.days >= 0 && exp.days <= 30;
      if (filterStatus === 'ok')          return !exp || exp.days > 30;
      if (filterStatus === 'no_stock')    return item.qtyAvailable === 0;
      return true;
    });
  }, [search, filterWh, filterStatus]);

  const aggregated = useMemo(() => buildAggregated(filteredItems), [filteredItems]);

  // ─── KPIs ─────────────────────────────────────────────────
  const kpi = useMemo(() => ({
    products:   aggregated.length,
    totalQty:   aggregated.reduce((s, r) => s + r.totalOnHand, 0),
    totalValue: aggregated.reduce((s, r) => s + r.totalValue, 0),
    available:  aggregated.reduce((s, r) => s + r.totalAvailable, 0),
  }), [aggregated]);

  // ─── Columns: theo vật tư ─────────────────────────────────
  const colsProduct: ColumnsType<AggRow> = [
    {
      title: 'Mã vật tư', dataIndex: 'productCode', key: 'productCode', width: 130,
      render: (v: string) => <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: 'Tên vật tư', dataIndex: 'productName', key: 'productName',
      render: (v: string, r: AggRow) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 13 }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.warehouses.join(', ')}</Text>
        </Space>
      ),
    },
    {
      title: 'Tổng tồn', dataIndex: 'totalOnHand', key: 'totalOnHand', width: 90, align: 'right' as const,
      render: (v: number, r: AggRow) => <Text strong>{formatNumber(v)} {r.unit}</Text>,
      sorter: (a: AggRow, b: AggRow) => a.totalOnHand - b.totalOnHand,
    },
    {
      title: 'Đã giữ', dataIndex: 'totalReserved', key: 'totalReserved', width: 80, align: 'right' as const,
      render: (v: number) => v > 0 ? <Text type="warning">{formatNumber(v)}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Khả dụng', dataIndex: 'totalAvailable', key: 'totalAvailable', width: 90, align: 'right' as const,
      render: (v: number) => <Text style={{ color: colors.success, fontWeight: 600 }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Sắp nhập', dataIndex: 'totalIncoming', key: 'totalIncoming', width: 80, align: 'right' as const,
      render: (v: number) => v > 0 ? <Text style={{ color: colors.info }}>{formatNumber(v)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Giá trị', dataIndex: 'totalValue', key: 'totalValue', width: 120, align: 'right' as const,
      render: (v: number) => <Text>{formatCurrency(v)}</Text>,
      sorter: (a: AggRow, b: AggRow) => a.totalValue - b.totalValue,
    },
    {
      title: 'Tình trạng', key: 'status', width: 120,
      render: (_: unknown, r: AggRow) => {
        if (r.hasExpired)    return <Tag icon={<CloseCircleOutlined />} color="error">Có hết hạn</Tag>;
        if (r.hasNearExpiry) return <Tag icon={<WarningOutlined />}     color="warning">Sắp hết hạn</Tag>;
        if (r.totalAvailable === 0) return <Tag icon={<MinusCircleOutlined />} color="default">Hết khả dụng</Tag>;
        return <Tag icon={<CheckCircleOutlined />} color="success">Bình thường</Tag>;
      },
    },
  ];

  // ─── Columns: theo lô/serial ──────────────────────────────
  const colsLot: ColumnsType<InventoryItem> = [
    {
      title: 'Mã vật tư', dataIndex: 'productCode', key: 'productCode', width: 130,
      render: (v: string) => <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: 'Tên vật tư', dataIndex: 'productName', key: 'productName',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Lô / Serial', key: 'tracking', width: 180,
      render: (_: unknown, r: InventoryItem) => (
        <Space direction="vertical" size={0}>
          {r.lotNumber    && <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#1B3A5C' }}>Lô: {r.lotNumber}</Text>}
          {r.serialNumber && <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#531dab' }}>SN: {r.serialNumber}</Text>}
          {!r.lotNumber && !r.serialNumber && <Text type="secondary" style={{ fontSize: 11 }}>—</Text>}
        </Space>
      ),
    },
    {
      title: 'Kho / Vị trí', key: 'location', width: 170,
      render: (_: unknown, r: InventoryItem) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{r.warehouseName}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.locationCode}</Text>
        </Space>
      ),
    },
    {
      title: 'Tồn', dataIndex: 'qtyOnHand', key: 'qtyOnHand', width: 80, align: 'right' as const,
      render: (v: number, r: InventoryItem) => <Text strong style={{ fontSize: 12 }}>{formatNumber(v)} {r.unit}</Text>,
      sorter: (a: InventoryItem, b: InventoryItem) => a.qtyOnHand - b.qtyOnHand,
    },
    {
      title: 'Khả dụng', dataIndex: 'qtyAvailable', key: 'qtyAvailable', width: 80, align: 'right' as const,
      render: (v: number) => <Text style={{ color: colors.success, fontWeight: 600 }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Ngày nhập', dataIndex: 'receivedDate', key: 'receivedDate', width: 100,
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{new Date(d).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      title: 'Hạn sử dụng', key: 'expiry', width: 130,
      render: (_: unknown, r: InventoryItem) => {
        const exp = getExpiryStatus(r.expiryDate);
        if (!exp) return <Text type="secondary" style={{ fontSize: 12 }}>Không giới hạn</Text>;
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 11 }}>{new Date(r.expiryDate!).toLocaleDateString('vi-VN')}</Text>
            <Tag color={exp.color} style={{ fontSize: 10, lineHeight: '16px' }}>
              {exp.days < 0 ? `Quá ${Math.abs(exp.days)}n` : `Còn ${exp.days}n`}
            </Tag>
          </Space>
        );
      },
      sorter: (a: InventoryItem, b: InventoryItem) => {
        const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return da - db;
      },
    },
    {
      title: 'Tình trạng', key: 'status', width: 120,
      render: (_: unknown, r: InventoryItem) => {
        const exp = getExpiryStatus(r.expiryDate);
        if (exp && exp.days < 0)   return <Tag icon={<CloseCircleOutlined />} color="error">Hết hạn</Tag>;
        if (exp && exp.days <= 30) return <Tag icon={<WarningOutlined />}     color="warning">Sắp hết hạn</Tag>;
        if (r.qtyAvailable === 0)  return <Tag icon={<MinusCircleOutlined />} color="default">Đã giữ hết</Tag>;
        return                            <Tag icon={<CheckCircleOutlined />} color="success">Còn hàng</Tag>;
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Space align="center" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StockOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Báo cáo tồn kho theo vật tư</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng hợp số lượng, giá trị và tình trạng vật tư — tích hợp theo dõi lô/serial
            </Text>
          </div>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard icon={<DatabaseOutlined />}  label="Mặt hàng"       value={kpi.products}              gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard icon={<BarChartOutlined />}  label="Tổng số lượng"  value={formatNumber(kpi.totalQty)} gradient="linear-gradient(135deg, #2d5a8e, #4a8bc2)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard icon={<ArrowUpOutlined />}   label="Giá trị tồn"    value={formatCurrency(kpi.totalValue)} gradient={`linear-gradient(135deg, ${colors.gold}, #c49835)`} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard icon={<ArrowDownOutlined />} label="Khả dụng"       value={formatNumber(kpi.available)}   gradient={`linear-gradient(135deg, ${colors.success}, #3ea812)`} />
        </Col>
      </Row>

      {/* Filter card */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={[12, 10]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Search
              placeholder="Mã vật tư, tên, mã lô, serial..."
              allowClear
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Kho" allowClear style={{ width: '100%' }}
              value={filterWh || undefined} onChange={v => setFilterWh(v ?? '')}
              options={warehouseOptions} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Tình trạng" allowClear style={{ width: '100%' }}
              value={filterStatus || undefined} onChange={v => setFilterStatus(v ?? '')}
              options={[
                { value: 'ok',          label: 'Còn hàng' },
                { value: 'near_expiry', label: 'Sắp hết hạn' },
                { value: 'expired',     label: 'Hết hạn' },
                { value: 'no_stock',    label: 'Hết khả dụng' },
              ]} />
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)}
              optionType="button" buttonStyle="solid" size="small">
              <Radio.Button value="product">Theo vật tư</Radio.Button>
              <Radio.Button value="lot">Theo lô / serial</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}>
        {viewMode === 'product' ? (
          <Table
            dataSource={aggregated}
            columns={colsProduct}
            rowKey="productId"
            size="small"
            scroll={{ x: 900 }}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `Tổng ${t} vật tư`, pageSizeOptions: ['15', '30', '50'] }}
            expandable={{
              expandedRowRender: (r: AggRow) => <ExpandedLines lines={r.lines} />,
              rowExpandable: (r: AggRow) => r.lines.length > 0,
            }}
          />
        ) : (
          <Table
            dataSource={filteredItems}
            columns={colsLot}
            rowKey="id"
            size="small"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `Tổng ${t} dòng`, pageSizeOptions: ['15', '30', '50'] }}
          />
        )}
      </Card>
    </div>
  );
};

export default ReportInventory;
