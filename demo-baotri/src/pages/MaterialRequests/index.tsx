import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Select, Dropdown,
  Input, Tabs, Progress,
} from 'antd';
import {
  InboxOutlined, SyncOutlined, CheckCircleOutlined, UndoOutlined,
  SearchOutlined, PlusOutlined, MoreOutlined, EyeOutlined, CheckOutlined,
  CloseOutlined, ShoppingCartOutlined, SwapOutlined, AuditOutlined,
  ExportOutlined, ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { materialRequests } from '../../data/materialRequests';
import {
  materialRequestStatusConfig,
  materialRequestTypeConfig,
  formatDate,
} from '../../utils/format';
import type { MaterialRequest, MaterialRequestStatus } from '../../types';

const { Title, Text } = Typography;

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode; gradient: string;
}> = ({ title, value, icon, gradient }) => (
  <Card className="db-stat-card" style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '18px 18px 14px' } }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 6 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{value}</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>{icon}</div>
      </div>
    </div>
    <div className="db-bg-icon" style={{ position: 'absolute', top: 10, right: 14, fontSize: 56, color: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}>{icon}</div>
  </Card>
);

// ─── Shared table helpers ───────────────────────────────────────
const buildColumns = (navigate: ReturnType<typeof useNavigate>, getActionMenu: (r: MaterialRequest) => MenuProps['items']): ColumnsType<MaterialRequest> => [
  {
    title: 'Mã YC', dataIndex: 'code', width: 155,
    render: (code: string, record: MaterialRequest) => (
      <Text strong style={{ color: '#1B3A5C', cursor: 'pointer' }}
        onClick={() => navigate(`/material-requests/${record.id}`)}>
        {code}
      </Text>
    ),
  },
  {
    title: 'Loại', dataIndex: 'type', width: 95,
    render: (type: string) => {
      const cfg = materialRequestTypeConfig[type as keyof typeof materialRequestTypeConfig];
      return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
    },
  },
  {
    title: 'WO / KH', key: 'ref', width: 140,
    render: (_: unknown, r: MaterialRequest) => (
      <Space size={4} direction="vertical">
        {r.poCode ? <Tag style={{ fontSize: 11 }}>{r.poCode}</Tag> : null}
        {r.planCode ? <Text type="secondary" style={{ fontSize: 11 }}>{r.planCode}</Text> : null}
        {!r.poCode && !r.planCode ? <Text type="secondary">—</Text> : null}
      </Space>
    ),
  },
  { title: 'Thiết bị', dataIndex: 'equipmentName', width: 170, ellipsis: true },
  { title: 'Kho', dataIndex: 'warehouseName', width: 160, ellipsis: true },
  { title: 'Người yêu cầu', dataIndex: 'requestedBy', width: 140 },
  {
    title: 'Ngày', dataIndex: 'requestedDate', width: 100,
    render: (d: string) => formatDate(d),
    sorter: (a: MaterialRequest, b: MaterialRequest) => a.requestedDate.localeCompare(b.requestedDate),
  },
  {
    title: 'Vật tư', key: 'items', width: 80, align: 'center',
    render: (_: unknown, r: MaterialRequest) => {
      const total = r.lines.reduce((s, l) => s + l.requestedQty, 0);
      return <Text>{r.totalItems} <Text type="secondary" style={{ fontSize: 11 }}>({total})</Text></Text>;
    },
  },
  {
    title: 'Tiến độ', key: 'progress', width: 120,
    render: (_: unknown, r: MaterialRequest) => {
      const map: Record<string, number> = { draft: 0, submitted: 20, warehouse_processing: 40, issued: 60, received: 80, returning: 90, returned: 100, cancelled: 0 };
      const pct = map[r.status] || 0;
      return <Progress percent={pct} size="small" strokeColor={pct === 100 ? '#52c41a' : '#1B3A5C'} format={() => <span style={{ fontSize: 10 }}>{pct}%</span>} />;
    },
  },
  {
    title: 'Trạng thái', dataIndex: 'status', width: 135,
    render: (status: MaterialRequestStatus) => {
      const cfg = materialRequestStatusConfig[status];
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'Phiếu Kho', key: 'orderCode', width: 125,
    render: (_: unknown, r: MaterialRequest) => {
      if (r.outboundOrderCode) return <Tag color="processing" style={{ fontSize: 11 }}><ExportOutlined style={{ marginRight: 4 }} />{r.outboundOrderCode}</Tag>;
      if (r.inboundOrderCode) return <Tag color="success" style={{ fontSize: 11 }}><ImportOutlined style={{ marginRight: 4 }} />{r.inboundOrderCode}</Tag>;
      return <Text type="secondary">—</Text>;
    },
  },
  {
    title: '', key: 'action', width: 45, align: 'center',
    render: (_: unknown, record: MaterialRequest) => (
      <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
        <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
      </Dropdown>
    ),
  },
];

// ─── Page Component ────────────────────────────────────────────
const MaterialRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | undefined>();

  // ── Stats ──
  const stats = useMemo(() => ({
    total: materialRequests.length,
    issueCount: materialRequests.filter(r => r.type === 'issue').length,
    returnCount: materialRequests.filter(r => r.type === 'return').length,
    processing: materialRequests.filter(r => ['submitted', 'warehouse_processing'].includes(r.status)).length,
    needReconcile: materialRequests.filter(r => r.type === 'issue' && r.status === 'received' && r.lines.some(l => (l.receivedQty || 0) > (l.returnedQty || 0) && (l.requestedQty - (l.returnedQty || 0)) > 0)).length,
  }), []);

  // ── Filter helper ──
  const filterData = (type?: 'issue' | 'return') => {
    return materialRequests.filter(r => {
      if (type && r.type !== type) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!r.code.toLowerCase().includes(q) && !(r.poCode?.toLowerCase().includes(q)) && !(r.equipmentName?.toLowerCase().includes(q)) && !r.requestedBy.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  };

  // ── Action menu builder ──
  const getActionMenu = (record: MaterialRequest): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/material-requests/${record.id}`) },
    ];
    if (record.status === 'submitted') items.push({ key: 'approve', icon: <CheckOutlined />, label: 'Phê duyệt' });
    if (record.status === 'issued') items.push({ key: 'confirm', icon: <CheckCircleOutlined />, label: 'Xác nhận đã nhận' });
    if (record.status === 'received' && record.type === 'issue') items.push({ key: 'return', icon: <UndoOutlined />, label: 'Tạo phiếu trả kho' });
    if (['draft', 'submitted'].includes(record.status)) items.push({ type: 'divider' }, { key: 'cancel', icon: <CloseOutlined />, label: 'Hủy yêu cầu', danger: true });
    return items;
  };

  const columns = buildColumns(navigate, getActionMenu);

  // ── Filter bar ──
  const renderFilterBar = (showCreateBtn: boolean = true) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
      <Input placeholder="Tìm mã YC, PO, thiết bị, người yêu cầu..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ width: 300 }} />
      <Select placeholder="Trạng thái" allowClear value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 170 }}
        options={Object.entries(materialRequestStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
      {showCreateBtn && <>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1B3A5C' }}
          onClick={() => navigate('/material-requests/create')}>Tạo yêu cầu</Button>
      </>}
    </div>
  );

  // ── Tab items ──
  const tabItems = [
    {
      key: 'issue',
      label: <span><ExportOutlined /> Cấp phát <Tag color="processing" style={{ marginLeft: 4 }}>{stats.issueCount}</Tag></span>,
      children: (
        <div>
          {renderFilterBar()}
          <Table<MaterialRequest> columns={columns} dataSource={filterData('issue')} rowKey="id"
            pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} phiếu cấp phát` }} scroll={{ x: 1500 }} size="middle" />
        </div>
      ),
    },
    {
      key: 'return',
      label: <span><ImportOutlined /> Trả kho <Tag color="warning" style={{ marginLeft: 4 }}>{stats.returnCount}</Tag></span>,
      children: (
        <div>
          {renderFilterBar(false)}
          <Table<MaterialRequest> columns={columns} dataSource={filterData('return')} rowKey="id"
            pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} phiếu trả kho` }} scroll={{ x: 1500 }} size="middle" />
        </div>
      ),
    },
    {
      key: 'reconcile',
      label: <span><AuditOutlined /> Đối soát <Tag style={{ marginLeft: 4 }}>{stats.needReconcile}</Tag></span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Đối soát vật tư giữa cấp phát — sử dụng — hoàn trả. Các yêu cầu đã nhận hàng nhưng chưa trả hết sẽ hiển thị ở đây.</Text>
          </div>
          {renderFilterBar(false)}
          <Table<MaterialRequest>
            columns={[
              ...columns.slice(0, -2), // bỏ cột trạng thái + action
              {
                title: 'Cấp phát', key: 'issued', width: 80, align: 'center',
                render: (_: unknown, r: MaterialRequest) => <Text strong>{r.lines.reduce((s, l) => s + (l.issuedQty || l.requestedQty), 0)}</Text>,
              },
              {
                title: 'Đã dùng', key: 'used', width: 80, align: 'center',
                render: (_: unknown, r: MaterialRequest) => {
                  const issued = r.lines.reduce((s, l) => s + (l.issuedQty || l.requestedQty), 0);
                  const returned = r.lines.reduce((s, l) => s + (l.returnedQty || 0), 0);
                  return <Text strong style={{ color: '#1B3A5C' }}>{issued - returned}</Text>;
                },
              },
              {
                title: 'Hoàn trả', key: 'returned', width: 80, align: 'center',
                render: (_: unknown, r: MaterialRequest) => {
                  const returned = r.lines.reduce((s, l) => s + (l.returnedQty || 0), 0);
                  return <Text style={{ color: returned > 0 ? '#52c41a' : undefined }}>{returned}</Text>;
                },
              },
              {
                title: 'Chênh lệch', key: 'diff', width: 90, align: 'center',
                render: (_: unknown, r: MaterialRequest) => {
                  const issued = r.lines.reduce((s, l) => s + (l.issuedQty || l.requestedQty), 0);
                  const used = r.lines.reduce((s, l) => s + (l.receivedQty || 0) - (l.returnedQty || 0), 0);
                  const returned = r.lines.reduce((s, l) => s + (l.returnedQty || 0), 0);
                  const diff = issued - used - returned;
                  return diff === 0
                    ? <Tag color="success">Khớp</Tag>
                    : <Tag color="warning">Lệch {diff}</Tag>;
                },
              },
              columns[columns.length - 1], // action column
            ]}
            dataSource={materialRequests.filter(r => r.type === 'issue' && ['received', 'returned'].includes(r.status))}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} phiếu cần đối soát` }}
            scroll={{ x: 1500 }}
            size="middle"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
            <ShoppingCartOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Quản lý vật tư bảo trì</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Cấp phát, sử dụng, hoàn trả, đối soát vật tư — liên kết hệ thống Kho</Text>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}><StatCard title="Tổng yêu cầu" value={stats.total} icon={<InboxOutlined />} gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" /></Col>
        <Col xs={12} sm={6}><StatCard title="Đang xử lý" value={stats.processing} icon={<SyncOutlined />} gradient="linear-gradient(135deg, #0891b2, #06b6d4)" /></Col>
        <Col xs={12} sm={6}><StatCard title="Phiếu cấp phát" value={stats.issueCount} icon={<ExportOutlined />} gradient="linear-gradient(135deg, #52c41a, #73d13d)" /></Col>
        <Col xs={12} sm={6}><StatCard title="Phiếu trả kho" value={stats.returnCount} icon={<ImportOutlined />} gradient="linear-gradient(135deg, #D4A843, #f0d890)" /></Col>
      </Row>

      {/* 3 Tabs */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default MaterialRequestsPage;
