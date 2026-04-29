import React, { useState } from 'react';
import {
  Card, Table, Tag, Input, Select, Button, Space, Typography, Row, Col, Statistic, Radio,
  Progress, Dropdown, Drawer, Form, InputNumber, message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BarcodeOutlined,
  SearchOutlined,
  EyeOutlined,
  NodeIndexOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SwapOutlined,
  MoreOutlined,
  ExportOutlined,
  RollbackOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { TrackingRecord } from '../../types';
import { trackingRecords } from '../../data/tracking';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Mock data cho modal ──────────────────────────────────
const warehouses = [
  { id: 'kv1', name: 'Kho Vật tư Kỹ thuật (KV1)' },
  { id: 'kv2', name: 'Kho Vật tư Module sản phẩm (KV2)' },
  { id: 'kv3', name: 'Kho Vật tư Tổng hợp (KV3)' },
];
const departments = [
  'PX1 — Trung tâm Sửa chữa Monitoring',
  'PX2 — Trung tâm Sửa chữa Module sản phẩm',
  'PX3 — Trung tâm Hạ tầng & DevOps',
  'PX4 — Trung tâm Phần mềm Gamma',
  'P.KT — Phòng Kỹ thuật',
  'P.LGKT — Phòng Logistics - Kỹ thuật',
  'P.KCS — Phòng KCS & Đảm bảo CL',
];
const maintenanceUnits = [
  'P.KT — Phòng Kỹ thuật',
  'P.KCS — Phòng KCS & Đảm bảo CL',
  'Trung tâm phần mềm Alpha',
  'Trung tâm phần mềm Beta',
  'Viện KH-CN Doanh nghiệp',
];

const actionMeta: Record<string, { title: string; okText: string; okDanger?: boolean; color: string }> = {
  issue:              { title: 'Ghi nhận cấp phát',    okText: 'Xác nhận cấp phát',   color: '#faad14' },
  transfer:           { title: 'Ghi nhận điều chuyển', okText: 'Xác nhận điều chuyển', color: '#1890ff' },
  maintenance_send:   { title: 'Gửi đi bảo trì',       okText: 'Xác nhận gửi bảo trì', color: '#eb2f96' },
  maintenance_return: { title: 'Trả lại sau bảo trì',  okText: 'Xác nhận trả bảo trì', color: '#13c2c2' },
  return:             { title: 'Ghi nhận thu hồi',      okText: 'Xác nhận thu hồi',    color: '#722ed1' },
  scrap:              { title: 'Ghi nhận thanh lý',     okText: 'Xác nhận thanh lý',   okDanger: true, color: '#ff4d4f' },
};

// ─── Status config ────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string }> = {
  in_stock:    { label: 'Trong kho',      color: 'green' },
  in_use:      { label: 'Đang sử dụng',   color: 'blue' },
  in_transit:  { label: 'Đang vận chuyển',color: 'orange' },
  maintenance: { label: 'Đang bảo trì',   color: 'purple' },
  disposed:    { label: 'Đã thanh lý',    color: 'red' },
  returned:    { label: 'Đã thu hồi',     color: 'default' },
};

const movementTypeLabel: Record<string, string> = {
  inbound:            'Nhập kho',
  outbound:           'Xuất kho',
  transfer:           'Điều chuyển',
  issue:              'Cấp phát',
  return:             'Thu hồi',
  maintenance_send:   'Gửi bảo trì',
  maintenance_return: 'Trả bảo trì',
  scrap:              'Thanh lý',
};

// ─── Section header helper ───────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color?: string }> = ({
  icon, title, color = '#1B3A5C',
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      boxShadow: `0 2px 6px ${color}33`,
    }}>
      <span style={{ color: '#fff', fontSize: 13 }}>{icon}</span>
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </div>
);

type ActionType = 'issue' | 'transfer' | 'maintenance_send' | 'maintenance_return' | 'return' | 'scrap';

const TrackingList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [actionTarget, setActionTarget] = useState<{ record: TrackingRecord; action: ActionType } | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const openAction = (record: TrackingRecord, action: ActionType) => {
    form.resetFields();
    setActionTarget({ record, action });
  };

  const handleOk = () => {
    form.validateFields().then(() => {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setActionTarget(null);
        message.success('Thao tác thực hiện thành công');
      }, 800);
    });
  };

  const getMenuItems = (record: TrackingRecord): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/tracking/${record.id}`),
      },
      { type: 'divider' },
    ];

    if (record.status === 'in_stock') {
      items.push(
        { key: 'issue', icon: <ExportOutlined />, label: 'Cấp phát', onClick: () => openAction(record, 'issue') },
        { key: 'transfer', icon: <SwapOutlined />, label: 'Điều chuyển', onClick: () => openAction(record, 'transfer') },
        { key: 'maintenance_send', icon: <ToolOutlined />, label: 'Gửi bảo trì', onClick: () => openAction(record, 'maintenance_send') },
      );
    }
    if (record.status === 'in_use') {
      items.push(
        { key: 'return', icon: <RollbackOutlined />, label: 'Thu hồi', onClick: () => openAction(record, 'return') },
        { key: 'maintenance_send', icon: <ToolOutlined />, label: 'Gửi bảo trì', onClick: () => openAction(record, 'maintenance_send') },
      );
    }
    if (record.status === 'maintenance') {
      items.push(
        { key: 'maintenance_return', icon: <CheckCircleOutlined />, label: 'Trả bảo trì', onClick: () => openAction(record, 'maintenance_return') },
      );
    }
    if (record.status === 'in_transit') {
      items.push(
        { key: 'maintenance_return', icon: <CheckCircleOutlined />, label: 'Xác nhận nhận hàng', onClick: () => openAction(record, 'maintenance_return') },
      );
    }
    if (record.status !== 'disposed') {
      items.push(
        { type: 'divider' },
        { key: 'scrap', icon: <DeleteOutlined />, label: 'Thanh lý', danger: true, onClick: () => openAction(record, 'scrap') },
      );
    }
    return items;
  };

  // ── Drawer section header ─────────────────────────────────
  const DrawerSection: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: '#1B3A5C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 4 }}>
      {title}
    </div>
  );

  // ── Drawer form content ───────────────────────────────────
  const renderDrawerContent = () => {
    if (!actionTarget) return null;
    const { record, action } = actionTarget;
    const isLot = record.trackingType === 'lot';

    if (action === 'issue') return (
      <>
        <DrawerSection title="Thông tin cấp phát" />
        <Form.Item label="Đơn vị nhận" name="department" rules={[{ required: true, message: 'Chọn đơn vị nhận' }]}>
          <Select placeholder="Chọn trung tâm / đơn vị nhận">
            {departments.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
        </Form.Item>
        <Row gutter={12}>
          {isLot && (
            <Col span={12}>
              <Form.Item label="Số lượng cấp phát" name="qty" rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, max: record.currentQuantity }]}>
                <InputNumber min={1} max={record.currentQuantity} style={{ width: '100%' }} addonAfter={record.baseUnit} />
              </Form.Item>
            </Col>
          )}
          <Col span={isLot ? 12 : 24}>
            <Form.Item label="Mã phiếu xuất kho" name="orderCode">
              <Input placeholder="VD: XK-2026-..." />
            </Form.Item>
          </Col>
        </Row>
        <DrawerSection title="Ghi chú" />
        <Form.Item name="note" noStyle>
          <TextArea rows={3} placeholder="Mục đích cấp phát, lệnh sản xuất liên quan..." />
        </Form.Item>
      </>
    );

    if (action === 'transfer') return (
      <>
        <DrawerSection title="Thông tin điều chuyển" />
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Kho nguồn">
              <Input disabled value={record.currentWarehouseName || '—'} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Kho đích" name="toWarehouse" rules={[{ required: true, message: 'Chọn kho đích' }]}>
              <Select placeholder="Chọn kho đích">
                {warehouses.filter(w => w.id !== record.currentWarehouseId).map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          {isLot && (
            <Col span={12}>
              <Form.Item label="Số lượng điều chuyển" name="qty" rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, max: record.currentQuantity }]}>
                <InputNumber min={1} max={record.currentQuantity} style={{ width: '100%' }} addonAfter={record.baseUnit} />
              </Form.Item>
            </Col>
          )}
          <Col span={isLot ? 12 : 24}>
            <Form.Item label="Mã phiếu điều chuyển" name="orderCode">
              <Input placeholder="VD: DC-2026-..." />
            </Form.Item>
          </Col>
        </Row>
        <DrawerSection title="Lý do điều chuyển" />
        <Form.Item name="note" noStyle rules={[{ required: true, message: 'Nhập lý do' }]}>
          <TextArea rows={3} placeholder="Lý do điều chuyển, nhiệm vụ liên quan..." />
        </Form.Item>
      </>
    );

    if (action === 'maintenance_send') return (
      <>
        <DrawerSection title="Thông tin gửi bảo trì" />
        <Form.Item label="Đơn vị tiếp nhận bảo trì" name="toUnit" rules={[{ required: true, message: 'Chọn đơn vị bảo trì' }]}>
          <Select placeholder="Chọn đơn vị bảo trì / kiểm định">
            {maintenanceUnits.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
        </Form.Item>
        <DrawerSection title="Mô tả hiện tượng / yêu cầu" />
        <Form.Item name="note" noStyle rules={[{ required: true, message: 'Nhập mô tả' }]}>
          <TextArea rows={4} placeholder="Mô tả hiện tượng lỗi, nội dung cần kiểm tra hoặc sửa chữa..." />
        </Form.Item>
      </>
    );

    if (action === 'maintenance_return') return (
      <>
        <DrawerSection title="Nhập về kho" />
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item label="Kho nhập" name="toWarehouse" rules={[{ required: true, message: 'Chọn kho' }]}>
              <Select placeholder="Chọn kho nhập về">
                {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Vị trí" name="location">
              <Input placeholder="VD: KV1-A02-R03" />
            </Form.Item>
          </Col>
        </Row>
        <DrawerSection title="Kết quả bảo trì" />
        <Form.Item name="note" noStyle rules={[{ required: true, message: 'Nhập kết quả' }]}>
          <TextArea rows={4} placeholder="Kết quả kiểm tra / sửa chữa, tình trạng vật tư sau bảo trì..." />
        </Form.Item>
      </>
    );

    if (action === 'return') return (
      <>
        <DrawerSection title="Thông tin thu hồi" />
        <Row gutter={12}>
          <Col span={isLot ? 14 : 24}>
            <Form.Item label="Thu hồi về kho" name="toWarehouse" rules={[{ required: true, message: 'Chọn kho' }]}>
              <Select placeholder="Chọn kho nhập lại">
                {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          {isLot && (
            <Col span={10}>
              <Form.Item label="Số lượng thu hồi" name="qty" rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1 }]}>
                <InputNumber min={1} style={{ width: '100%' }} addonAfter={record.baseUnit} />
              </Form.Item>
            </Col>
          )}
        </Row>
        <DrawerSection title="Lý do thu hồi" />
        <Form.Item name="note" noStyle rules={[{ required: true, message: 'Nhập lý do' }]}>
          <TextArea rows={3} placeholder="Lý do thu hồi, tình trạng vật tư khi nhận lại..." />
        </Form.Item>
      </>
    );

    if (action === 'scrap') return (
      <>
        <DrawerSection title="Thông tin thanh lý" />
        <Row gutter={12}>
          {isLot && (
            <Col span={12}>
              <Form.Item label="Số lượng thanh lý" name="qty" rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, max: record.currentQuantity }]}>
                <InputNumber min={1} max={record.currentQuantity} style={{ width: '100%' }} addonAfter={record.baseUnit} />
              </Form.Item>
            </Col>
          )}
          <Col span={isLot ? 12 : 24}>
            <Form.Item label="Số biên bản thanh lý" name="orderCode">
              <Input placeholder="VD: BB-TL-2026-..." />
            </Form.Item>
          </Col>
        </Row>
        <DrawerSection title="Lý do thanh lý" />
        <Form.Item name="note" noStyle rules={[{ required: true, message: 'Nhập lý do thanh lý' }]}>
          <TextArea rows={3} placeholder="Lý do thanh lý (hỏng hóc không sửa được, hết hạn, không phù hợp tiêu chuẩn...)..." />
        </Form.Item>
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff2f0', borderRadius: 8, border: '1px solid #ffccc7', fontSize: 12, color: '#ff4d4f' }}>
          Thao tác này sẽ cập nhật trạng thái thành <strong>Đã thanh lý</strong> và không thể hoàn tác.
        </div>
      </>
    );

    return null;
  };

  // ── Filtered data ───────────────────────────────────────
  const filtered = trackingRecords.filter(r => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'serial' && r.trackingType === 'serial') ||
      (activeTab === 'lot' && r.trackingType === 'lot');

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.trackingCode.toLowerCase().includes(q) ||
      r.productCode.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      (r.currentWarehouseName || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchTab && matchSearch && matchStatus;
  });

  // ── Stats ────────────────────────────────────────────────
  const total      = trackingRecords.length;
  const serialCnt  = trackingRecords.filter(r => r.trackingType === 'serial').length;
  const lotCnt     = trackingRecords.filter(r => r.trackingType === 'lot').length;
  const inStockCnt = trackingRecords.filter(r => r.status === 'in_stock').length;
  const inUseCnt   = trackingRecords.filter(r => r.status === 'in_use').length;
  const maintCnt   = trackingRecords.filter(r => r.status === 'maintenance').length;

  // ── Stat cards ───────────────────────────────────────────
  const statCards = [
    {
      label: 'Tổng bản ghi',
      value: total,
      icon: <BarcodeOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      suffix: 'bản ghi',
    },
    {
      label: 'Serial (đơn chiếc)',
      value: serialCnt,
      icon: <NodeIndexOutlined />,
      gradient: 'linear-gradient(135deg, #0d5c3a, #1a8c5a)',
      suffix: 'serial',
    },
    {
      label: 'Lô hàng',
      value: lotCnt,
      icon: <InboxOutlined />,
      gradient: 'linear-gradient(135deg, #5c3d0d, #8c6020)',
      suffix: 'lô',
    },
    {
      label: 'Đang bảo trì',
      value: maintCnt,
      icon: <ToolOutlined />,
      gradient: 'linear-gradient(135deg, #5c0d3d, #8c1a5a)',
      suffix: 'mục',
    },
  ];

  // ── Table columns ────────────────────────────────────────
  const columns: ColumnsType<TrackingRecord> = [
    {
      title: 'Mã tracking',
      dataIndex: 'trackingCode',
      key: 'trackingCode',
      width: 180,
      render: (code: string, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 13, color: '#1B3A5C', fontFamily: 'monospace' }}>
            {code}
          </Text>
          <Tag color={record.trackingType === 'serial' ? 'geekblue' : 'gold'} style={{ fontSize: 11 }}>
            {record.trackingType === 'serial' ? 'Serial' : 'Lô'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Vật tư',
      key: 'product',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 13 }}>{record.productName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.productCode} · {record.productCategory}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      key: 'qty',
      width: 160,
      render: (_, record) => {
        if (record.trackingType === 'serial') {
          return <Text style={{ fontSize: 13 }}>1 {record.baseUnit}</Text>;
        }
        const pct = Math.round((record.currentQuantity / record.initialQuantity) * 100);
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text style={{ fontSize: 12 }}>
              <Text strong>{record.currentQuantity.toLocaleString('vi-VN')}</Text>
              <Text type="secondary"> / {record.initialQuantity.toLocaleString('vi-VN')} {record.baseUnit}</Text>
            </Text>
            <Progress
              percent={pct}
              size="small"
              showInfo={false}
              strokeColor={pct > 50 ? '#52c41a' : pct > 20 ? '#faad14' : '#ff4d4f'}
            />
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg?.color}>{cfg?.label || status}</Tag>;
      },
    },
    {
      title: 'Vị trí hiện tại',
      key: 'location',
      render: (_, record) => {
        if (record.status === 'in_use') {
          return (
            <Space direction="vertical" size={2}>
              <Text style={{ fontSize: 12 }}>{record.currentUnitName || '—'}</Text>
              <Tag color="blue" style={{ fontSize: 11 }}>Đang sử dụng</Tag>
            </Space>
          );
        }
        if (record.status === 'in_transit') {
          return (
            <Space direction="vertical" size={2}>
              <Text style={{ fontSize: 12 }}>Đang vận chuyển</Text>
              <Tag color="orange" style={{ fontSize: 11 }}>In transit</Tag>
            </Space>
          );
        }
        return (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: 12 }}>{record.currentWarehouseName || '—'}</Text>
            {record.currentLocation && (
              <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                {record.currentLocation}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Lần di chuyển cuối',
      key: 'lastMovement',
      width: 180,
      render: (_, record) => {
        const last = record.movements[record.movements.length - 1];
        if (!last) return <Text type="secondary">—</Text>;
        return (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: 12 }}>{movementTypeLabel[last.type] || last.type}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {new Date(last.date).toLocaleDateString('vi-VN')}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
              style={{ color: '#666' }}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ── Page header ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarcodeOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Theo dõi vật tư</Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Truy vết vật tư theo số serial và số lô — lịch sử di chuyển toàn bộ vòng đời
            </Typography.Text>
          </div>
        </Space>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((s) => (
          <Col key={s.label} xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: s.gradient,
                borderRadius: 14,
                border: 'none',
                cursor: 'default',
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              styles={{ body: { padding: '18px 20px', position: 'relative', overflow: 'hidden' } }}
              className="stat-card"
            >
              <div style={{
                position: 'absolute', top: 8, right: 12,
                fontSize: 64, opacity: 0.1, color: '#fff',
                lineHeight: 1, transition: 'transform 0.5s',
              }} className="stat-bg-icon">
                {s.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16, flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <Statistic
                    value={s.value}
                    suffix={<span style={{ fontSize: 13, opacity: 0.7, color: '#fff' }}>{s.suffix}</span>}
                    valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 26 }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Status mini-cards ───────────────────────────────── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Trong kho', count: inStockCnt, icon: <CheckCircleOutlined />, color: '#52c41a' },
          { label: 'Đang sử dụng', count: inUseCnt, icon: <SwapOutlined />, color: '#1890ff' },
          { label: 'Đang bảo trì', count: maintCnt, icon: <ToolOutlined />, color: '#722ed1' },
        ].map(s => (
          <Col key={s.label} xs={24} sm={8}>
            <Card
              style={{ borderRadius: 10, border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Space>
                <span style={{ color: s.color, fontSize: 18 }}>{s.icon}</span>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div>
                    <Text strong style={{ fontSize: 18, color: s.color }}>{s.count}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}> mục</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Filter card ──────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm mã tracking, mã vật tư, tên vật tư..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ── Table card ───────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="middle"
          scroll={{ x: 900 }}
          onRow={record => ({
            onClick: () => navigate(`/tracking/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            size: 'small',
          }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Card>

      {/* ── Action drawer ──────────────────────────────────── */}
      {(() => {
        const meta = actionTarget ? actionMeta[actionTarget.action] : null;
        const actionIcons: Record<string, React.ReactNode> = {
          issue: <ExportOutlined />, transfer: <SwapOutlined />,
          maintenance_send: <ToolOutlined />, maintenance_return: <CheckCircleOutlined />,
          return: <RollbackOutlined />, scrap: <DeleteOutlined />,
        };
        return (
          <Drawer
            open={actionTarget !== null}
            onClose={() => setActionTarget(null)}
            width={480}
            destroyOnClose
            closable={false}
            title={null}
            styles={{
              body: { padding: 0 },
              footer: { padding: '12px 20px', borderTop: '1px solid #f0f0f0' },
            }}
            footer={
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button onClick={() => setActionTarget(null)}>Hủy</Button>
                <Button
                  type="primary"
                  danger={meta?.okDanger}
                  loading={submitting}
                  style={!meta?.okDanger ? { background: meta?.color, borderColor: meta?.color } : undefined}
                  onClick={handleOk}
                >
                  {meta?.okText}
                </Button>
              </Space>
            }
          >
            {actionTarget && meta && (
              <>
                {/* Gradient header */}
                <div style={{
                  background: `linear-gradient(135deg, ${meta.color}dd 0%, ${meta.color} 100%)`,
                  padding: '20px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Space size={14} align="center">
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: '#fff',
                    }}>
                      {actionIcons[actionTarget.action]}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: '22px' }}>
                        {meta.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{actionTarget.record.trackingCode}</span>
                        {' · '}{actionTarget.record.productName}
                      </div>
                    </div>
                  </Space>
                  <Button
                    type="text"
                    icon={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>✕</span>}
                    onClick={() => setActionTarget(null)}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32 }}
                  />
                </div>

                {/* Thông tin vật tư */}
                <div style={{
                  margin: '16px 24px 0',
                  padding: '10px 14px',
                  background: '#f5f7fa',
                  borderRadius: 8,
                  display: 'flex', gap: 24,
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Danh mục</div>
                    <Text style={{ fontSize: 12 }}>{actionTarget.record.productCategory}</Text>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Loại tracking</div>
                    <Text style={{ fontSize: 12 }}>
                      {actionTarget.record.trackingType === 'serial' ? 'Serial đơn chiếc' : 'Lô hàng'}
                    </Text>
                  </div>
                  {actionTarget.record.trackingType === 'lot' && (
                    <div>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Còn lại</div>
                      <Text strong style={{ fontSize: 12, color: '#1B3A5C' }}>
                        {actionTarget.record.currentQuantity.toLocaleString('vi-VN')} {actionTarget.record.baseUnit}
                      </Text>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Vị trí</div>
                    <Text style={{ fontSize: 12 }}>{actionTarget.record.currentWarehouseName || actionTarget.record.currentUnitName || '—'}</Text>
                  </div>
                </div>

                {/* Form */}
                <div style={{ padding: '20px 24px' }}>
                  <Form form={form} layout="vertical" size="middle">
                    {renderDrawerContent()}
                  </Form>
                </div>
              </>
            )}
          </Drawer>
        );
      })()}
    </div>
  );
};

export default TrackingList;
