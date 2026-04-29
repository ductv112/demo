import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Typography, Row, Col,
  Tooltip, Badge,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, SearchOutlined,
  InboxOutlined, CarOutlined, UnlockOutlined, CheckCircleOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { PackageRecord, PackageStatus, PackageType } from '../../types';
import { packages } from '../../data/packages';

const { Title, Text } = Typography;
const { Search } = Input;

// ─── Status config ────────────────────────────────────────
const statusConfig: Record<PackageStatus, { label: string; color: string; icon: React.ReactNode }> = {
  in_stock:   { label: 'Trong kho',    color: 'success', icon: <InboxOutlined />  },
  in_transit: { label: 'Đang vận chuyển', color: 'blue',    icon: <CarOutlined /> },
  opened:     { label: 'Đã mở',        color: 'warning', icon: <UnlockOutlined /> },
  dispatched: { label: 'Đã xuất',      color: 'default', icon: <CheckCircleOutlined /> },
};

// ─── Type config ──────────────────────────────────────────
const typeConfig: Record<PackageType, string> = {
  thùng: '#1B3A5C',
  pallet: '#2d5a8e',
  container: '#7c3aed',
  kiện: '#d97706',
  túi: '#059669',
};

const typeLabel: Record<PackageType, string> = {
  thùng: 'Thùng',
  pallet: 'Pallet',
  container: 'Container',
  kiện: 'Kiện',
  túi: 'Túi',
};

// ─── Stat card ────────────────────────────────────────────
interface StatCardProps { label: string; value: number; icon: React.ReactNode; gradient: string; }

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient }) => (
  <div
    style={{
      background: gradient,
      borderRadius: 12,
      padding: '18px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}
    className="stat-card-pkg"
  >
    <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 56, opacity: 0.1 }}>
      {icon}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{label}</div>
  </div>
);

const PackageList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('');

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      packages.length,
    in_stock:   packages.filter(p => p.status === 'in_stock').length,
    in_transit: packages.filter(p => p.status === 'in_transit').length,
    opened:     packages.filter(p => p.status === 'opened').length,
    dispatched: packages.filter(p => p.status === 'dispatched').length,
  }), []);

  // ── Warehouse options ────────────────────────────────────
  const warehouseOptions = useMemo(() => {
    const map = new Map<string, string>();
    packages.forEach(p => {
      if (p.warehouseId && p.warehouseName) map.set(p.warehouseId, p.warehouseName);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, []);

  // ── Filtered data ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return packages.filter(p => {
      const matchSearch = !q ||
        p.code.toLowerCase().includes(q) ||
        p.items.some(it => it.productName.toLowerCase().includes(q) || it.productCode.toLowerCase().includes(q)) ||
        (p.warehouseName ?? '').toLowerCase().includes(q);
      const matchStatus    = !filterStatus    || p.status === filterStatus;
      const matchType      = !filterType      || p.type === filterType;
      const matchWarehouse = !filterWarehouse || p.warehouseId === filterWarehouse;
      return matchSearch && matchStatus && matchType && matchWarehouse;
    });
  }, [search, filterStatus, filterType, filterWarehouse]);

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<PackageRecord> = [
    {
      title: 'Mã kiện hàng',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string, r) => (
        <Space direction="vertical" size={0}>
          <Text
            strong
            style={{ color: '#1B3A5C', cursor: 'pointer', fontSize: 13 }}
            onClick={() => navigate(`/packages/${r.id}`)}
          >
            {code}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.items.length} loại vật tư
          </Text>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: PackageType) => (
        <Tag color={typeConfig[type]} style={{ fontWeight: 500 }}>
          {typeLabel[type]}
        </Tag>
      ),
    },
    {
      title: 'Vật tư chứa',
      key: 'items',
      render: (_: unknown, r: PackageRecord) => (
        <Space direction="vertical" size={2}>
          {r.items.slice(0, 2).map(it => (
            <Text key={it.productId} style={{ fontSize: 12 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{it.productCode}</Text>
              {' '}· {it.productName.length > 32 ? it.productName.slice(0, 32) + '…' : it.productName}
              {' '}
              <Badge
                count={`${it.qty} ${it.unit}`}
                style={{ background: '#e6f4ff', color: '#1B3A5C', fontSize: 10, fontWeight: 500 }}
              />
            </Text>
          ))}
          {r.items.length > 2 && (
            <Text type="secondary" style={{ fontSize: 11 }}>+{r.items.length - 2} loại khác</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: PackageStatus) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Kho lưu',
      key: 'warehouse',
      width: 180,
      render: (_: unknown, r: PackageRecord) => r.warehouseName ? (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>{r.warehouseName}</Text>
          {r.locationCode && (
            <Text type="secondary" style={{ fontSize: 11 }}>Vị trí: {r.locationCode}</Text>
          )}
        </Space>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Khối lượng',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 110,
      render: (w: number | undefined) => w != null
        ? <Text style={{ fontSize: 13 }}>{w.toLocaleString('vi-VN')} kg</Text>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(d).toLocaleDateString('vi-VN')}
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_: unknown, r: PackageRecord) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/packages/${r.id}`)}
            style={{ color: '#1B3A5C' }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BoxPlotOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Kiện hàng & Đóng gói</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý kiện hàng, pallet, thùng — theo dõi vị trí và trạng thái vận chuyển
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/packages/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
        >
          Tạo kiện hàng
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} md={4} lg={4}>
          <StatCard label="Tổng kiện hàng" value={stats.total} icon={<BoxPlotOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Trong kho" value={stats.in_stock} icon={<InboxOutlined />}
            gradient="linear-gradient(135deg, #237804, #52c41a)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Đang vận chuyển" value={stats.in_transit} icon={<CarOutlined />}
            gradient="linear-gradient(135deg, #1677ff, #40a9ff)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Đã mở" value={stats.opened} icon={<UnlockOutlined />}
            gradient="linear-gradient(135deg, #d46b08, #faad14)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Đã xuất" value={stats.dispatched} icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #595959, #8c8c8c)" />
        </Col>
      </Row>

      {/* ── Filter card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8} lg={7}>
            <Search
              placeholder="Mã kiện, vật tư, kho..."
              allowClear
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus || undefined}
              onChange={v => setFilterStatus(v ?? '')}
              options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Loại kiện"
              allowClear
              style={{ width: '100%' }}
              value={filterType || undefined}
              onChange={v => setFilterType(v ?? '')}
              options={Object.entries(typeLabel).map(([v, l]) => ({ value: v, label: l }))}
            />
          </Col>
          <Col xs={12} sm={8} md={5} lg={5}>
            <Select
              placeholder="Kho lưu trữ"
              allowClear
              style={{ width: '100%' }}
              value={filterWarehouse || undefined}
              onChange={v => setFilterWarehouse(v ?? '')}
              options={warehouseOptions}
            />
          </Col>
        </Row>
      </Card>

      {/* ── Table card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="small"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kiện hàng`,
            pageSizeOptions: ['10', '15', '25'],
          }}
          onRow={(r) => ({
            onClick: () => navigate(`/packages/${r.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <style>{`
        .stat-card-pkg:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(27,58,92,0.18) !important;
        }
      `}</style>
    </div>
  );
};

export default PackageList;
