import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography,
  Badge, Modal, Dropdown, App, Tooltip,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, SwapOutlined, MoreOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SendOutlined, CarOutlined,
  EyeOutlined, ExclamationCircleOutlined, SyncOutlined,
  CheckOutlined, CloseOutlined, ArrowRightOutlined, WarningOutlined,
  InboxOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { stockTransfers as stockTransfersSource } from '../../data/stockTransfers';
import type { StockTransfer, TransferStatus } from '../../types';
import { transferStatusConfig, formatNumber, formatDate, formatDateTime } from '../../utils/format';

const { Title, Text } = Typography;

// ─── Transfer suggestion interface ───────────────────────
interface TransferSuggestion {
  key: string;
  productCode: string;
  productName: string;
  unit: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  fromOnHand: number;
  toOnHand: number;
  toMinStock: number;
  suggestedQty: number;
  urgency: 'high' | 'medium' | 'low';
}

// ─── Static balance analysis data (TT-HN01 context) ────────
const BALANCE_SUGGESTIONS: TransferSuggestion[] = [
  {
    key: 'sug-001',
    productCode: 'RD-BM-001', productName: 'Bo mạch xử lý tín hiệu monitoring P-18', unit: 'Cái',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Vật tư chính',
    toWarehouseId: 'wh-002', toWarehouseName: 'Kho Linh kiện Điện tử',
    fromOnHand: 18, toOnHand: 2, toMinStock: 5, suggestedQty: 6, urgency: 'high',
  },
  {
    key: 'sug-002',
    productCode: 'RD-TD-001', productName: 'Tụ điện công suất cao 10µF/1600V', unit: 'Cái',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Vật tư chính',
    toWarehouseId: 'wh-003', toWarehouseName: 'Kho Kỹ thuật',
    fromOnHand: 48, toOnHand: 3, toMinStock: 10, suggestedQty: 12, urgency: 'high',
  },
  {
    key: 'sug-003',
    productCode: 'EL-PSU-009', productName: 'Bộ nguồn AC/DC 220V/28VDC', unit: 'Cái',
    fromWarehouseId: 'wh-002', fromWarehouseName: 'Kho Linh kiện Điện tử',
    toWarehouseId: 'wh-004', toWarehouseName: 'Kho Phụ tùng Module sản phẩm',
    fromOnHand: 22, toOnHand: 0, toMinStock: 5, suggestedQty: 8, urgency: 'high',
  },
  {
    key: 'sug-004',
    productCode: 'RF-CA-004', productName: 'Cáp đồng trục RG-214 doanh nghiệp', unit: 'm',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Vật tư chính',
    toWarehouseId: 'wh-005', toWarehouseName: 'Kho Sản xuất PX4',
    fromOnHand: 120, toOnHand: 15, toMinStock: 30, suggestedQty: 40, urgency: 'medium',
  },
  {
    key: 'sug-005',
    productCode: 'MC-ROT-015', productName: 'Cơ cấu quay anten monitoring', unit: 'Bộ',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Vật tư chính',
    toWarehouseId: 'wh-003', toWarehouseName: 'Kho Kỹ thuật',
    fromOnHand: 9, toOnHand: 1, toMinStock: 3, suggestedQty: 3, urgency: 'medium',
  },
  {
    key: 'sug-006',
    productCode: 'CK-VIT-001', productName: 'Vít M5×20 thép không gỉ doanh nghiệp', unit: 'Cái',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Vật tư chính',
    toWarehouseId: 'wh-005', toWarehouseName: 'Kho Sản xuất PX4',
    fromOnHand: 850, toOnHand: 45, toMinStock: 100, suggestedQty: 200, urgency: 'low',
  },
];

// ─── Unique warehouse options from data ──────────────────
const warehouseOptions = (() => {
  const map = new Map<string, string>();
  stockTransfersSource.forEach(t => {
    map.set(t.fromWarehouseId, t.fromWarehouseName);
    map.set(t.toWarehouseId, t.toWarehouseName);
  });
  return [...map.entries()].map(([id, name]) => ({ id, name }));
})();

const urgencyConfig = {
  high:   { label: 'Khẩn cấp', color: 'error' },
  medium: { label: 'Cần xử lý', color: 'warning' },
  low:    { label: 'Bình thường', color: 'default' },
};

const StockTransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  // ─── Local mutable state ──────────────────────────────
  const [transferList, setTransferList] = useState<StockTransfer[]>([...stockTransfersSource]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<TransferStatus | undefined>(undefined);
  const [filterFromWh, setFilterFromWh] = useState<string | undefined>(undefined);
  const [filterToWh, setFilterToWh] = useState<string | undefined>(undefined);

  // ─── Balance analysis panel ───────────────────────────
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('14/04/2026 07:45');
  const [createdSuggestions, setCreatedSuggestions] = useState<string[]>([]);

  // ─── Detail modal ─────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);

  const syncAndSet = (updater: (prev: StockTransfer[]) => StockTransfer[]) => {
    setTransferList(prev => {
      const next = updater(prev);
      stockTransfersSource.splice(0, stockTransfersSource.length, ...next);
      return next;
    });
  };

  const filteredData = useMemo(() => transferList.filter(t => {
    const matchSearch = !searchText
      || t.code.toLowerCase().includes(searchText.toLowerCase())
      || t.fromWarehouseName.toLowerCase().includes(searchText.toLowerCase())
      || t.toWarehouseName.toLowerCase().includes(searchText.toLowerCase())
      || t.requestedBy.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchFrom = !filterFromWh || t.fromWarehouseId === filterFromWh;
    const matchTo = !filterToWh || t.toWarehouseId === filterToWh;
    return matchSearch && matchStatus && matchFrom && matchTo;
  }), [transferList, searchText, filterStatus, filterFromWh, filterToWh]);

  const stats = useMemo(() => ({
    total:     transferList.length,
    inTransit: transferList.filter(t => t.status === 'in_transit').length,
    done:      transferList.filter(t => t.status === 'done').length,
    pending:   transferList.filter(t => t.status === 'submitted' || t.status === 'draft').length,
  }), [transferList]);

  const hasActiveFilters = searchText || filterStatus || filterFromWh || filterToWh;
  const handleResetFilters = () => {
    setSearchText('');
    setFilterStatus(undefined);
    setFilterFromWh(undefined);
    setFilterToWh(undefined);
  };

  // ─── Scan handler ─────────────────────────────────────
  const handleScan = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 1400));
    setScanning(false);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setLastScanned(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`);
    message.success(`Quét hoàn tất — phát hiện ${BALANCE_SUGGESTIONS.filter(s => !createdSuggestions.includes(s.key)).length} vị trí cần cân đối`);
  };

  // ─── Create transfer from suggestion ─────────────────
  const handleCreateFromSuggestion = (sug: TransferSuggestion) => {
    const newTransfer: StockTransfer = {
      id: `tf-sug-${Date.now()}`,
      code: `DC-2026-${String(transferList.length + 1).padStart(3, '0')}`,
      fromWarehouseId: sug.fromWarehouseId,
      fromWarehouseName: sug.fromWarehouseName,
      toWarehouseId: sug.toWarehouseId,
      toWarehouseName: sug.toWarehouseName,
      status: 'submitted',
      lines: [{
        id: `tf-sug-${Date.now()}-l1`,
        productId: sug.key,
        productCode: sug.productCode,
        productName: sug.productName,
        qty: sug.suggestedQty,
        unit: sug.unit,
      }],
      totalItems: 1,
      reason: 'Cân đối tồn kho — hệ thống đề xuất tự động',
      requestedBy: 'Hệ thống tự động (AI Scan)',
      requestedAt: new Date().toISOString(),
      note: `Tồn tại ${sug.fromWarehouseName}: ${sug.fromOnHand} ${sug.unit}. Tồn tại ${sug.toWarehouseName}: ${sug.toOnHand} ${sug.unit} (tối thiểu ${sug.toMinStock} ${sug.unit}).`,
      createdAt: new Date().toISOString(),
    };
    syncAndSet(prev => [newTransfer, ...prev]);
    setCreatedSuggestions(prev => [...prev, sug.key]);
    message.success(`Đã tạo phiếu ${newTransfer.code} — điều chuyển ${sug.suggestedQty} ${sug.unit} ${sug.productCode}`);
  };

  // ─── Workflow actions ─────────────────────────────────
  const handleSubmit = (record: StockTransfer) => {
    modal.confirm({
      title: 'Gửi đề xuất điều chuyển',
      icon: <ExclamationCircleOutlined />,
      content: `Gửi phiếu ${record.code} để phê duyệt?`,
      okText: 'Gửi đề xuất', cancelText: 'Hủy',
      okButtonProps: { style: { background: '#1B3A5C' } },
      onOk: () => {
        syncAndSet(prev => prev.map(t => t.id === record.id ? { ...t, status: 'submitted' } : t));
        message.success(`Đã gửi ${record.code} chờ phê duyệt`);
      },
    });
  };

  const handleApprove = (record: StockTransfer) => {
    modal.confirm({
      title: 'Phê duyệt điều chuyển',
      icon: <ExclamationCircleOutlined />,
      content: `Phê duyệt phiếu ${record.code}? Kho nguồn sẽ được phép xuất hàng.`,
      okText: 'Phê duyệt', cancelText: 'Hủy',
      okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } },
      onOk: () => {
        syncAndSet(prev => prev.map(t => t.id === record.id
          ? { ...t, status: 'approved', approvedBy: 'Phạm Hồng Sơn', approvedAt: new Date().toISOString() }
          : t));
        message.success(`Đã phê duyệt ${record.code}`);
      },
    });
  };

  const handleStartTransit = (record: StockTransfer) => {
    modal.confirm({
      title: 'Bắt đầu vận chuyển',
      icon: <ExclamationCircleOutlined />,
      content: `Xác nhận kho nguồn đã xuất hàng và đang vận chuyển cho phiếu ${record.code}?`,
      okText: 'Bắt đầu vận chuyển', cancelText: 'Hủy',
      okButtonProps: { style: { background: '#d48806', borderColor: '#d48806' } },
      onOk: () => {
        syncAndSet(prev => prev.map(t => t.id === record.id
          ? { ...t, status: 'in_transit', shippedAt: new Date().toISOString() }
          : t));
        message.success(`Phiếu ${record.code} đang vận chuyển`);
      },
    });
  };

  const handleReceive = (record: StockTransfer) => {
    modal.confirm({
      title: 'Xác nhận nhận hàng',
      icon: <ExclamationCircleOutlined />,
      content: `Xác nhận kho nhận đã nhận đủ hàng theo phiếu ${record.code}?`,
      okText: 'Xác nhận nhận hàng', cancelText: 'Hủy',
      okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } },
      onOk: () => {
        syncAndSet(prev => prev.map(t => t.id === record.id
          ? { ...t, status: 'done', receivedAt: new Date().toISOString() }
          : t));
        message.success(`Hoàn thành điều chuyển ${record.code}. Tồn kho đã được cập nhật.`);
      },
    });
  };

  const handleCancel = (record: StockTransfer) => {
    modal.confirm({
      title: 'Hủy phiếu điều chuyển',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `Hủy phiếu ${record.code}? Hành động này không thể hoàn tác.`,
      okText: 'Hủy phiếu', okButtonProps: { danger: true }, cancelText: 'Đóng',
      onOk: () => {
        syncAndSet(prev => prev.map(t => t.id === record.id ? { ...t, status: 'cancelled' } : t));
        message.success(`Đã hủy phiếu ${record.code}`);
      },
    });
  };

  // ─── Table columns ────────────────────────────────────
  const columns: ColumnsType<StockTransfer> = [
    {
      title: 'Mã phiếu', dataIndex: 'code', key: 'code', width: 140,
      render: (code: string, record: StockTransfer) => (
        <a onClick={() => { setSelectedTransfer(record); setDetailOpen(true); }}
          style={{ color: '#1B3A5C', fontWeight: 600, fontFamily: 'monospace', fontSize: 13, cursor: 'pointer' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Kho nguồn', dataIndex: 'fromWarehouseName', key: 'from', width: 160, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: '', key: 'arrow', width: 36,
      render: () => <ArrowRightOutlined style={{ color: '#D4A843', fontSize: 14 }} />,
    },
    {
      title: 'Kho đích', dataIndex: 'toWarehouseName', key: 'to', width: 160, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: 'Mặt hàng', dataIndex: 'totalItems', key: 'items', width: 90, align: 'right',
      render: (v: number) => <Text style={{ fontWeight: 500, fontSize: 13 }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 150,
      render: (st: TransferStatus) => {
        const cfg = transferStatusConfig[st];
        return <Tag color={cfg.color} style={{ borderRadius: 4, fontSize: 12 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Người yêu cầu', dataIndex: 'requestedBy', key: 'req', width: 170, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: 'Ngày yêu cầu', dataIndex: 'requestedAt', key: 'date', width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 80, align: 'center',
      render: (_: unknown, record: StockTransfer) => {
        const items: import('antd').MenuProps['items'] = [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => { setSelectedTransfer(record); setDetailOpen(true); } },
          { type: 'divider' },
        ];
        if (record.status === 'draft') {
          items.push({ key: 'submit', icon: <SendOutlined />, label: 'Gửi đề xuất', onClick: () => handleSubmit(record) });
        }
        if (record.status === 'submitted') {
          items.push(
            { key: 'approve', icon: <CheckOutlined />, label: 'Phê duyệt', onClick: () => handleApprove(record) },
            { key: 'cancel-sub', icon: <CloseOutlined />, label: 'Từ chối', danger: true, onClick: () => handleCancel(record) },
          );
        }
        if (record.status === 'approved') {
          items.push(
            { key: 'transit', icon: <CarOutlined />, label: 'Bắt đầu vận chuyển', onClick: () => handleStartTransit(record) },
            { key: 'cancel-apv', icon: <CloseOutlined />, label: 'Hủy', danger: true, onClick: () => handleCancel(record) },
          );
        }
        if (record.status === 'in_transit') {
          items.push({ key: 'receive', icon: <CheckCircleOutlined />, label: 'Xác nhận nhận hàng', onClick: () => handleReceive(record) });
        }
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  // ─── Balance suggestion columns ───────────────────────
  const suggestionColumns: ColumnsType<TransferSuggestion> = [
    {
      title: 'Vật tư', key: 'product', width: 220,
      render: (_: unknown, r: TransferSuggestion) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13, fontWeight: 600 }}>{r.productName}</Text>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#1B3A5C' }}>{r.productCode}</Text>
        </Space>
      ),
    },
    {
      title: 'Kho nguồn (thừa)', key: 'from', width: 180,
      render: (_: unknown, r: TransferSuggestion) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12, fontWeight: 500 }}>{r.fromWarehouseName}</Text>
          <Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 700 }}>Tồn: {formatNumber(r.fromOnHand)} {r.unit}</Text>
        </Space>
      ),
    },
    {
      title: '', key: 'arrow2', width: 32,
      render: () => <ArrowRightOutlined style={{ color: '#D4A843', fontSize: 14 }} />,
    },
    {
      title: 'Kho nhận (thiếu)', key: 'to', width: 180,
      render: (_: unknown, r: TransferSuggestion) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12, fontWeight: 500 }}>{r.toWarehouseName}</Text>
          <Space size={4}>
            <Text style={{ fontSize: 12, color: '#ff4d4f', fontWeight: 700 }}>Tồn: {formatNumber(r.toOnHand)} {r.unit}</Text>
            <Text style={{ fontSize: 11, color: '#999' }}>(tối thiểu {r.toMinStock})</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'SL đề xuất', dataIndex: 'suggestedQty', key: 'qty', width: 100, align: 'right',
      render: (v: number, r: TransferSuggestion) => (
        <Text style={{ fontWeight: 700, fontSize: 14, color: '#1B3A5C' }}>{formatNumber(v)} {r.unit}</Text>
      ),
    },
    {
      title: 'Mức độ', dataIndex: 'urgency', key: 'urgency', width: 110, align: 'center',
      render: (u: TransferSuggestion['urgency']) => (
        <Tag color={urgencyConfig[u].color} style={{ borderRadius: 4, fontSize: 11 }}>{urgencyConfig[u].label}</Tag>
      ),
    },
    {
      title: 'Thao tác', key: 'act', width: 130, align: 'center',
      render: (_: unknown, r: TransferSuggestion) => {
        const created = createdSuggestions.includes(r.key);
        return created
          ? <Tag color="success" style={{ borderRadius: 4, fontSize: 11 }}>Đã tạo phiếu</Tag>
          : (
            <Button size="small" type="primary" icon={<PlusOutlined />}
              onClick={() => handleCreateFromSuggestion(r)}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 6, fontSize: 12 }}>
              Tạo phiếu
            </Button>
          );
      },
    },
  ];

  // ─── Detail modal line columns ────────────────────────
  const lineColumns: ColumnsType<StockTransfer['lines'][0]> = [
    { title: 'Mã VT', dataIndex: 'productCode', key: 'code', width: 130, render: (c: string) => <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>{c}</Text> },
    { title: 'Tên vật tư', dataIndex: 'productName', key: 'name', ellipsis: true, render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text> },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', width: 100, align: 'right', render: (v: number) => <Text style={{ fontWeight: 600, fontSize: 13 }}>{formatNumber(v)}</Text> },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 80 },
    {
      title: 'Lô / Serial', key: 'tracking', width: 160,
      render: (_: unknown, r: StockTransfer['lines'][0]) => {
        if (r.serialNumbers?.length) return <Text style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.serialNumbers.join(', ')}</Text>;
        if (r.lotNumber) return <Text style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.lotNumber}</Text>;
        return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
      },
    },
  ];

  const pendingSuggestions = BALANCE_SUGGESTIONS.filter(s => !createdSuggestions.includes(s.key));

  return (
    <div>
      {/* ─── Page Header ─────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SwapOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Điều chuyển kho</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Cân đối và điều chuyển vật tư giữa các kho — Trung tâm Hà Nội</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/transfers/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}>
          Tạo phiếu điều chuyển
        </Button>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Tổng phiếu', value: stats.total, suffix: 'phiếu', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <SwapOutlined style={{ fontSize: 64 }} /> },
          { label: 'Chờ xử lý', value: stats.pending, suffix: 'phiếu', gradient: 'linear-gradient(135deg, #1d5fa5, #1890ff)', icon: <InboxOutlined style={{ fontSize: 64 }} /> },
          { label: 'Đang vận chuyển', value: stats.inTransit, suffix: 'phiếu', gradient: 'linear-gradient(135deg, #d48806, #faad14)', icon: <CarOutlined style={{ fontSize: 64 }} /> },
          { label: 'Hoàn thành', value: stats.done, suffix: 'phiếu', gradient: 'linear-gradient(135deg, #237804, #52c41a)', icon: <CheckCircleOutlined style={{ fontSize: 64 }} /> },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card className="db-stat-card"
              style={{ background: card.gradient, borderRadius: 14, border: 'none', position: 'relative', overflow: 'hidden' }}
              bodyStyle={{ padding: '18px 20px', position: 'relative', zIndex: 1 }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: 8, right: 12, color: 'rgba(255,255,255,0.1)', fontSize: 64, lineHeight: 1, zIndex: 0 }}>
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{card.label}</Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{formatNumber(card.value)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>{card.suffix}</span>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Balance Analysis Panel ──────────────────────── */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '20px' } }}>

        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space size={16} align="center">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DatabaseOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Phân tích cân đối tồn kho</Text>
              <div style={{ fontSize: 12, color: '#999' }}>Lần quét cuối: {lastScanned}</div>
            </div>
          </Space>
          <Button icon={<SyncOutlined spin={scanning} />} loading={scanning} onClick={handleScan} style={{ borderRadius: 8 }}>
            Quét tự động
          </Button>
        </div>

        {/* Mini stats */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {[
            { label: 'Vị trí mất cân đối', value: BALANCE_SUGGESTIONS.length, color: '#1B3A5C', bg: '#e8eef5' },
            { label: 'Cần xử lý khẩn', value: BALANCE_SUGGESTIONS.filter(s => s.urgency === 'high').length, color: '#ff4d4f', bg: '#fff1f0' },
            { label: 'Chưa tạo phiếu', value: pendingSuggestions.length, color: '#faad14', bg: '#fffbe6' },
            { label: 'Đã tạo phiếu', value: createdSuggestions.length, color: '#52c41a', bg: '#f6ffed' },
          ].map((s, i) => (
            <Col xs={12} sm={6} key={i}>
              <div style={{ background: s.bg, borderRadius: 10, padding: '12px 16px', border: `1px solid ${s.color}20` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Workflow steps info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, background: '#f5f7fa', borderRadius: 10, padding: '10px 16px', overflowX: 'auto' }}>
          {[
            { step: '1', label: 'Phát sinh nhu cầu', color: '#1B3A5C' },
            { step: '2', label: 'Kiểm tra tồn toàn hệ thống', color: '#1890ff' },
            { step: '3', label: 'Đề xuất điều chuyển', color: '#722ed1' },
            { step: '4', label: 'Phê duyệt', color: '#d48806' },
            { step: '5', label: 'Lệnh điều chuyển', color: '#08979c' },
            { step: '6', label: 'Thực hiện', color: '#237804' },
            { step: '7', label: 'Cập nhật tồn kho', color: '#52c41a' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: s.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.step}
                </div>
                <Text style={{ fontSize: 12, color: s.color, fontWeight: 500, whiteSpace: 'nowrap' }}>{s.label}</Text>
              </div>
              {i < 6 && <ArrowRightOutlined style={{ color: '#ccc', fontSize: 11, margin: '0 8px', flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Suggestions table */}
        <Table<TransferSuggestion>
          columns={suggestionColumns}
          dataSource={BALANCE_SUGGESTIONS}
          rowKey="key"
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 1000 }}
          rowClassName={r => r.urgency === 'high' && !createdSuggestions.includes(r.key) ? 'forecast-alert-row' : ''}
        />
      </Card>

      {/* ─── Filter Bar ───────────────────────────────────── */}
      <Card style={{ borderRadius: 14, marginBottom: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              placeholder="Tìm theo mã phiếu, kho, người yêu cầu..."
              value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ borderRadius: 6 }} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus} allowClear style={{ width: '100%' }}
              options={Object.entries(transferStatusConfig).map(([k, cfg]) => ({ value: k, label: cfg.label }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Kho nguồn" value={filterFromWh} onChange={setFilterFromWh} allowClear style={{ width: '100%' }}
              options={warehouseOptions.map(w => ({ value: w.id, label: w.name }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Kho đích" value={filterToWh} onChange={setFilterToWh} allowClear style={{ width: '100%' }}
              options={warehouseOptions.map(w => ({ value: w.id, label: w.name }))} />
          </Col>
          {hasActiveFilters && (
            <Col xs={12} sm={6} md={3}>
              <Button onClick={handleResetFilters} style={{ borderRadius: 6 }}>Xóa bộ lọc</Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* ─── Transfer List Table ──────────────────────────── */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}>
        <Table
          style={{ borderRadius: 14, overflow: 'hidden' }}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: ['10', '15', '20', '50'], showTotal: (t, r) => `${r[0]}-${r[1]} / ${t} phiếu` }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* ─── Detail Modal ─────────────────────────────────── */}
      <Modal open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={900}
        title={selectedTransfer ? (
          <Space size={12} align="center">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SwapOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>{selectedTransfer.code}</Text>
              <Tag color={transferStatusConfig[selectedTransfer.status].color} style={{ borderRadius: 4, fontSize: 12, marginLeft: 8 }}>
                {transferStatusConfig[selectedTransfer.status].label}
              </Tag>
            </div>
          </Space>
        ) : null}>
        {selectedTransfer && (
          <div>
            {/* Workflow progress */}
            <div style={{ background: '#f5f7fa', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {(['draft', 'submitted', 'approved', 'in_transit', 'done'] as TransferStatus[]).map((st, i, arr) => {
                  const cfg = transferStatusConfig[st];
                  const statuses: TransferStatus[] = ['draft', 'submitted', 'approved', 'in_transit', 'done'];
                  const currentIdx = statuses.indexOf(selectedTransfer.status as TransferStatus);
                  const stepIdx = statuses.indexOf(st);
                  const isDone = stepIdx <= currentIdx && selectedTransfer.status !== 'cancelled';
                  const isCurrent = st === selectedTransfer.status;
                  return (
                    <React.Fragment key={st}>
                      <div style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: isCurrent ? 700 : 400,
                        background: isDone ? (isCurrent ? '#1B3A5C' : '#e8eef5') : '#f0f0f0',
                        color: isDone ? (isCurrent ? '#fff' : '#1B3A5C') : '#bbb',
                      }}>
                        {cfg.label}
                      </div>
                      {i < arr.length - 1 && <ArrowRightOutlined style={{ color: '#ccc', fontSize: 11 }} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Transfer info */}
            <Card style={{ borderRadius: 10, marginBottom: 16, background: '#f5f7fa', border: 'none' }} styles={{ body: { padding: 16 } }}>
              <Row gutter={[24, 12]}>
                <Col xs={12} sm={10}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Kho nguồn (xuất)</Text>
                  <Text strong style={{ fontSize: 13 }}>{selectedTransfer.fromWarehouseName}</Text>
                </Col>
                <Col xs={12} sm={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tooltip title="Điều chuyển nội bộ"><SendOutlined style={{ fontSize: 18, color: '#D4A843' }} /></Tooltip>
                  </div>
                </Col>
                <Col xs={12} sm={10}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Kho nhận (đích)</Text>
                  <Text strong style={{ fontSize: 13 }}>{selectedTransfer.toWarehouseName}</Text>
                </Col>
              </Row>
              <div style={{ borderTop: '1px solid #e8e8e8', marginTop: 12, paddingTop: 12 }}>
                <Row gutter={[24, 8]}>
                  <Col xs={12} sm={6}><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Người yêu cầu</Text><Text style={{ fontSize: 13 }}>{selectedTransfer.requestedBy}</Text></Col>
                  <Col xs={12} sm={6}><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày yêu cầu</Text><Text style={{ fontSize: 13 }}>{formatDateTime(selectedTransfer.requestedAt)}</Text></Col>
                  <Col xs={12} sm={6}><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Phê duyệt bởi</Text><Text style={{ fontSize: 13 }}>{selectedTransfer.approvedBy || '--'}</Text></Col>
                  <Col xs={12} sm={6}><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày phê duyệt</Text><Text style={{ fontSize: 13 }}>{selectedTransfer.approvedAt ? formatDateTime(selectedTransfer.approvedAt) : '--'}</Text></Col>
                </Row>
                {(selectedTransfer.shippedAt || selectedTransfer.receivedAt) && (
                  <Row gutter={[24, 8]} style={{ marginTop: 8 }}>
                    <Col xs={12} sm={6}><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày xuất kho</Text><Text style={{ fontSize: 13 }}>{selectedTransfer.shippedAt ? formatDateTime(selectedTransfer.shippedAt) : '--'}</Text></Col>
                    <Col xs={12} sm={6}><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày nhận hàng</Text><Text style={{ fontSize: 13 }}>{selectedTransfer.receivedAt ? formatDateTime(selectedTransfer.receivedAt) : '--'}</Text></Col>
                  </Row>
                )}
              </div>
            </Card>

            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Lý do điều chuyển:</Text>
              <div style={{ marginTop: 4, padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}>
                <Text style={{ fontSize: 13 }}>{selectedTransfer.reason}</Text>
              </div>
            </div>
            {selectedTransfer.note && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú:</Text>
                <div style={{ marginTop: 4, padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}>
                  <Text style={{ fontSize: 13, color: '#666' }}>{selectedTransfer.note}</Text>
                </div>
              </div>
            )}

            <Text strong style={{ fontSize: 14, color: '#1B3A5C', display: 'block', marginBottom: 8 }}>
              Chi tiết vật tư ({selectedTransfer.lines.length} mặt hàng)
            </Text>
            <Table columns={lineColumns} dataSource={selectedTransfer.lines} rowKey="id" pagination={false} size="small" scroll={{ x: 600 }} />

            {/* Workflow action buttons inside modal */}
            {(selectedTransfer.status === 'submitted' || selectedTransfer.status === 'approved' || selectedTransfer.status === 'in_transit') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                {selectedTransfer.status === 'submitted' && (
                  <>
                    <Button danger onClick={() => { handleCancel(selectedTransfer); setDetailOpen(false); }}>Từ chối</Button>
                    <Button type="primary" icon={<CheckOutlined />} onClick={() => { handleApprove(selectedTransfer); setDetailOpen(false); }}
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}>Phê duyệt</Button>
                  </>
                )}
                {selectedTransfer.status === 'approved' && (
                  <Button type="primary" icon={<CarOutlined />} onClick={() => { handleStartTransit(selectedTransfer); setDetailOpen(false); }}
                    style={{ background: '#d48806', borderColor: '#d48806' }}>Bắt đầu vận chuyển</Button>
                )}
                {selectedTransfer.status === 'in_transit' && (
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { handleReceive(selectedTransfer); setDetailOpen(false); }}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}>Xác nhận nhận hàng</Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const StockTransferPageWrapper: React.FC = () => (
  <App>
    <StockTransferPage />
  </App>
);

export default StockTransferPageWrapper;
