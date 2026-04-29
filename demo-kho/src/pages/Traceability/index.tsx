import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Typography, Row, Col, Badge,
} from 'antd';
import {
  NodeIndexOutlined, SearchOutlined, InboxOutlined,
  ExportOutlined, SwapOutlined, CheckCircleOutlined,
  RollbackOutlined, DeleteOutlined, EyeOutlined, MoreOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { TraceabilityRecord, TraceCurrentStatus } from '../../types';
import { traceabilityRecords } from '../../data/traceability';

const { Title, Text } = Typography;
const { Search } = Input;

// ─── Status config ────────────────────────────────────────
const statusConfig: Record<TraceCurrentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  in_stock:    { label: 'Trong kho',        color: 'success',    icon: <InboxOutlined /> },
  dispatched:  { label: 'Đã cấp phát',      color: 'blue',       icon: <ExportOutlined /> },
  in_use:      { label: 'Đang sử dụng',     color: 'blue',       icon: <CheckCircleOutlined /> },
  returned:    { label: 'Đã trả về',        color: 'cyan',       icon: <RollbackOutlined /> },
  transferred: { label: 'Đã điều chuyển',   color: 'purple',     icon: <SwapOutlined /> },
  scrapped:    { label: 'Đã thanh lý',      color: 'default',    icon: <DeleteOutlined /> },
};

// ─── Stat card ────────────────────────────────────────────
interface StatCardProps { label: string; value: number; icon: React.ReactNode; gradient: string; }

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient }) => (
  <div
    style={{
      background: gradient, borderRadius: 12, padding: '18px 20px',
      color: '#fff', position: 'relative', overflow: 'hidden',
      cursor: 'default', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}
    className="stat-card-trc"
  >
    <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 56, opacity: 0.1 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{label}</div>
  </div>
);

const Traceability: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      traceabilityRecords.length,
    serial:     traceabilityRecords.filter(r => r.trackingType === 'serial').length,
    lot:        traceabilityRecords.filter(r => r.trackingType === 'lot').length,
    dispatched: traceabilityRecords.filter(r => r.currentStatus === 'dispatched' || r.currentStatus === 'in_use').length,
    in_stock:   traceabilityRecords.filter(r => r.currentStatus === 'in_stock').length,
  }), []);

  // ── Filtered data ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return traceabilityRecords.filter(r => {
      const matchSearch = !q ||
        r.productCode.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.trackingCode.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q) ||
        r.inboundOrderCode.toLowerCase().includes(q) ||
        (r.currentLocation ?? '').toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.currentStatus === filterStatus;
      const matchType   = !filterType   || r.trackingType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [search, filterStatus, filterType]);

  const getMenuItems = (r: TraceabilityRecord) => [
    { key: 'view', label: 'Xem chi tiết truy vết', icon: <EyeOutlined /> },
    { key: 'copy', label: 'Sao chép mã lô/serial', icon: <NodeIndexOutlined /> },
  ];

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<TraceabilityRecord> = [
    {
      title: 'Vật tư',
      key: 'product',
      render: (_: unknown, r: TraceabilityRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{r.productCode}</Text>
          <Text style={{ fontSize: 12 }}>
            {r.productName.length > 42 ? r.productName.slice(0, 42) + '…' : r.productName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Mã lô / Serial',
      dataIndex: 'trackingCode',
      key: 'trackingCode',
      width: 180,
      render: (code: string, r: TraceabilityRecord) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C' }}>{code}</Text>
          <Tag
            color={r.trackingType === 'serial' ? '#1B3A5C' : '#2d5a8e'}
            style={{ fontSize: 10, margin: 0, fontWeight: 500 }}
          >
            {r.trackingType === 'serial' ? 'Serial' : 'Lô hàng'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Nguồn nhập',
      key: 'origin',
      width: 190,
      render: (_: unknown, r: TraceabilityRecord) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{r.supplier}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.inboundOrderCode} &nbsp;·&nbsp; {new Date(r.inboundDate).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái hiện tại',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      width: 150,
      render: (s: TraceCurrentStatus) => {
        const cfg = statusConfig[s];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Vị trí / Đơn vị nhận',
      key: 'location',
      width: 200,
      render: (_: unknown, r: TraceabilityRecord) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{r.currentLocation ?? '—'}</Text>
          {r.currentDept && (
            <Text type="secondary" style={{ fontSize: 11 }}>{r.currentDept}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      key: 'qty',
      width: 110,
      render: (_: unknown, r: TraceabilityRecord) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            {r.currentQty.toLocaleString('vi-VN')} / {r.totalQty.toLocaleString('vi-VN')} {r.unit}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.events.length} sự kiện
          </Text>
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_: unknown, r: TraceabilityRecord) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: getMenuItems(r),
              onClick: ({ key }) => {
                if (key === 'view') navigate(`/traceability/${r.id}`);
              },
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: '#595959' }}
            />
          </Dropdown>
        </div>
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
            <NodeIndexOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Truy xuất nguồn gốc vật tư</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tra cứu lịch sử đầy đủ theo serial / lô hàng — từ nhập kho đến điểm sử dụng cuối
            </Text>
          </div>
        </Space>
      </div>

      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Tổng bản ghi theo dõi" value={stats.total} icon={<NodeIndexOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={8} md={4} lg={4}>
          <StatCard label="Serial" value={stats.serial} icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #006d75, #13c2c2)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Lô hàng" value={stats.lot} icon={<InboxOutlined />}
            gradient="linear-gradient(135deg, #2d5a8e, #1677ff)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Đang cấp phát / sử dụng" value={stats.dispatched} icon={<ExportOutlined />}
            gradient="linear-gradient(135deg, #d46b08, #faad14)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Còn trong kho" value={stats.in_stock} icon={<InboxOutlined />}
            gradient="linear-gradient(135deg, #237804, #52c41a)" />
        </Col>
      </Row>

      {/* ── Filter card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={9} lg={8}>
            <Search
              placeholder="Mã vật tư, serial, mã lô, nhà cung cấp, phiếu nhập..."
              allowClear
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Loại theo dõi"
              allowClear
              style={{ width: '100%' }}
              value={filterType || undefined}
              onChange={v => setFilterType(v ?? '')}
              options={[
                { value: 'serial', label: 'Serial' },
                { value: 'lot',    label: 'Lô hàng' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={5} lg={5}>
            <Select
              placeholder="Trạng thái hiện tại"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus || undefined}
              onChange={v => setFilterStatus(v ?? '')}
              options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
            />
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <Badge color="#1B3A5C" /> {filtered.length} bản ghi
            </Text>
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
          scroll={{ x: 1050 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            pageSizeOptions: ['10', '15', '25'],
          }}
          onRow={r => ({
            onClick: () => navigate(`/traceability/${r.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <style>{`
        .stat-card-trc:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(27,58,92,0.18) !important;
        }
      `}</style>
    </div>
  );
};

export default Traceability;
