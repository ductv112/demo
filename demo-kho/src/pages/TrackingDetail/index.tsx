import React, { useState } from 'react';
import {
  Card, Tag, Typography, Row, Col, Space, Button, Descriptions, Timeline, Progress,
  Divider, Modal, Form, Select, Input, InputNumber, message, Tooltip,
} from 'antd';
import {
  BarcodeOutlined,
  ArrowLeftOutlined,
  NodeIndexOutlined,
  InboxOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  ShopOutlined,
  ExportOutlined,
  SwapOutlined,
  ToolOutlined,
  RollbackOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { TrackingRecord, TrackingMovement } from '../../types';
import { getTrackingById } from '../../data/tracking';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Status config ────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string }> = {
  in_stock:    { label: 'Trong kho',       color: 'green' },
  in_use:      { label: 'Đang sử dụng',    color: 'blue' },
  in_transit:  { label: 'Đang vận chuyển', color: 'orange' },
  maintenance: { label: 'Đang bảo trì',    color: 'purple' },
  disposed:    { label: 'Đã thanh lý',     color: 'red' },
  returned:    { label: 'Đã thu hồi',      color: 'default' },
};

const movementTypeConfig: Record<string, { label: string; color: string; dot: string }> = {
  inbound:            { label: 'Nhập kho',      color: '#52c41a', dot: '↓' },
  outbound:           { label: 'Xuất kho',       color: '#ff4d4f', dot: '↑' },
  transfer:           { label: 'Điều chuyển',    color: '#1890ff', dot: '⇄' },
  issue:              { label: 'Cấp phát',       color: '#faad14', dot: '→' },
  return:             { label: 'Thu hồi',        color: '#722ed1', dot: '←' },
  maintenance_send:   { label: 'Gửi bảo trì',   color: '#eb2f96', dot: '⚙' },
  maintenance_return: { label: 'Trả bảo trì',   color: '#13c2c2', dot: '✓' },
  scrap:              { label: 'Thanh lý',       color: 'default', dot: '✕' },
};

// ─── Mock warehouses & departments ───────────────────────
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

// ─── Section header ───────────────────────────────────────
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

// ─── Not found ────────────────────────────────────────────
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
      <BarcodeOutlined style={{ fontSize: 48, color: '#bbb', marginBottom: 16 }} />
      <Title level={4} style={{ color: '#888' }}>Không tìm thấy bản ghi tracking</Title>
      <Button type="primary" onClick={() => navigate('/tracking')}>Quay lại danh sách</Button>
    </Card>
  );
};

// ─── Action modal types ───────────────────────────────────
type ActionType = 'issue' | 'transfer' | 'maintenance_send' | 'maintenance_return' | 'return' | 'scrap' | null;

const actionMeta: Record<NonNullable<ActionType>, {
  title: string; okText: string; okDanger?: boolean; color: string;
}> = {
  issue:              { title: 'Ghi nhận cấp phát',     okText: 'Xác nhận cấp phát',  color: '#faad14' },
  transfer:           { title: 'Ghi nhận điều chuyển',  okText: 'Xác nhận điều chuyển', color: '#1890ff' },
  maintenance_send:   { title: 'Gửi đi bảo trì',        okText: 'Xác nhận gửi bảo trì', color: '#eb2f96' },
  maintenance_return: { title: 'Trả lại sau bảo trì',   okText: 'Xác nhận trả bảo trì', color: '#13c2c2' },
  return:             { title: 'Ghi nhận thu hồi',       okText: 'Xác nhận thu hồi',   color: '#722ed1' },
  scrap:              { title: 'Ghi nhận thanh lý',      okText: 'Xác nhận thanh lý',  okDanger: true, color: '#ff4d4f' },
};

const TrackingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [action, setAction] = useState<ActionType>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const record = id ? getTrackingById(id) : undefined;
  if (!record) return <NotFound />;

  const statusCfg = statusConfig[record.status] || { label: record.status, color: 'default' };
  const isSerial = record.trackingType === 'serial';
  const consumedPct = isSerial
    ? 100
    : Math.round(((record.initialQuantity - record.currentQuantity) / record.initialQuantity) * 100);
  const remainPct = 100 - consumedPct;

  // ── Action buttons by status ──────────────────────────────
  const renderActions = () => {
    const btnStyle = {
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.3)',
      color: '#fff',
      borderRadius: 8,
    };

    const buttons: React.ReactNode[] = [];

    if (record.status === 'in_stock') {
      buttons.push(
        <Tooltip key="issue" title="Cấp phát cho trung tâm / đơn vị">
          <Button icon={<ExportOutlined />} style={btnStyle} onClick={() => openAction('issue')}>
            Cấp phát
          </Button>
        </Tooltip>,
        <Tooltip key="transfer" title="Điều chuyển sang kho khác">
          <Button icon={<SwapOutlined />} style={btnStyle} onClick={() => openAction('transfer')}>
            Điều chuyển
          </Button>
        </Tooltip>,
        <Tooltip key="maintenance_send" title="Gửi đi bảo trì / kiểm định">
          <Button icon={<ToolOutlined />} style={btnStyle} onClick={() => openAction('maintenance_send')}>
            Gửi bảo trì
          </Button>
        </Tooltip>,
      );
    }

    if (record.status === 'in_use') {
      buttons.push(
        <Tooltip key="return" title="Thu hồi về kho">
          <Button icon={<RollbackOutlined />} style={btnStyle} onClick={() => openAction('return')}>
            Thu hồi
          </Button>
        </Tooltip>,
        <Tooltip key="maintenance_send" title="Gửi đi bảo trì">
          <Button icon={<ToolOutlined />} style={btnStyle} onClick={() => openAction('maintenance_send')}>
            Gửi bảo trì
          </Button>
        </Tooltip>,
      );
    }

    if (record.status === 'maintenance') {
      buttons.push(
        <Tooltip key="maintenance_return" title="Trả về kho sau bảo trì">
          <Button icon={<CheckCircleOutlined />} style={btnStyle} onClick={() => openAction('maintenance_return')}>
            Trả bảo trì
          </Button>
        </Tooltip>,
      );
    }

    if (record.status === 'in_transit') {
      buttons.push(
        <Tooltip key="maintenance_return" title="Xác nhận đã nhận tại kho đích">
          <Button icon={<CheckCircleOutlined />} style={btnStyle} onClick={() => openAction('maintenance_return')}>
            Xác nhận nhận hàng
          </Button>
        </Tooltip>,
      );
    }

    if (record.status !== 'disposed') {
      buttons.push(
        <Tooltip key="scrap" title="Ghi nhận thanh lý vật tư">
          <Button
            icon={<DeleteOutlined />}
            style={{ ...btnStyle, border: '1px solid rgba(255,77,79,0.5)', background: 'rgba(255,77,79,0.15)' }}
            onClick={() => openAction('scrap')}
          >
            Thanh lý
          </Button>
        </Tooltip>,
      );
    }

    return buttons;
  };

  // ── Modal handlers ────────────────────────────────────────
  const openAction = (a: ActionType) => {
    form.resetFields();
    setAction(a);
  };

  const handleOk = () => {
    form.validateFields().then(() => {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setAction(null);
        const meta = action ? actionMeta[action] : null;
        message.success(`${meta?.okText || 'Thao tác'} thành công`);
      }, 800);
    });
  };

  // ── Modal form content by action ──────────────────────────
  const renderModalContent = () => {
    if (!action) return null;

    const isLot = !isSerial;

    if (action === 'issue') {
      return (
        <>
          <Form.Item label="Cấp phát cho" name="department" rules={[{ required: true, message: 'Chọn đơn vị nhận' }]}>
            <Select placeholder="Chọn trung tâm / đơn vị nhận">
              {departments.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </Form.Item>
          {isLot && (
            <Form.Item label="Số lượng cấp phát" name="qty"
              rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, max: record.currentQuantity, message: `Tối đa ${record.currentQuantity} ${record.baseUnit}` }]}>
              <InputNumber min={1} max={record.currentQuantity} style={{ width: '100%' }}
                addonAfter={record.baseUnit} />
            </Form.Item>
          )}
          <Form.Item label="Mã phiếu xuất kho" name="orderCode">
            <Input placeholder="VD: XK-2026-..." />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Mục đích cấp phát, nhiệm vụ liên quan..." />
          </Form.Item>
        </>
      );
    }

    if (action === 'transfer') {
      return (
        <>
          <Form.Item label="Kho nguồn">
            <Input disabled value={record.currentWarehouseName || '—'} />
          </Form.Item>
          <Form.Item label="Kho đích" name="toWarehouse" rules={[{ required: true, message: 'Chọn kho đích' }]}>
            <Select placeholder="Chọn kho đích">
              {warehouses
                .filter(w => w.id !== record.currentWarehouseId)
                .map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)
              }
            </Select>
          </Form.Item>
          {isLot && (
            <Form.Item label="Số lượng điều chuyển" name="qty"
              rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, max: record.currentQuantity }]}>
              <InputNumber min={1} max={record.currentQuantity} style={{ width: '100%' }}
                addonAfter={record.baseUnit} />
            </Form.Item>
          )}
          <Form.Item label="Mã phiếu điều chuyển" name="orderCode">
            <Input placeholder="VD: DC-2026-..." />
          </Form.Item>
          <Form.Item label="Lý do điều chuyển" name="note" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <TextArea rows={3} placeholder="Lý do điều chuyển..." />
          </Form.Item>
        </>
      );
    }

    if (action === 'maintenance_send') {
      return (
        <>
          <Form.Item label="Gửi đến" name="toUnit" rules={[{ required: true, message: 'Nhập nơi bảo trì' }]}>
            <Select placeholder="Chọn đơn vị bảo trì">
              {['P.KT — Phòng Kỹ thuật', 'P.KCS — Phòng KCS & Đảm bảo CL', 'Trung tâm phần mềm Alpha', 'Trung tâm phần mềm Beta', 'Viện KH-CN Doanh nghiệp'].map(d =>
                <Option key={d} value={d}>{d}</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item label="Lý do bảo trì / kiểm định" name="note" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <TextArea rows={3} placeholder="Mô tả hiện tượng lỗi, nội dung cần kiểm tra..." />
          </Form.Item>
        </>
      );
    }

    if (action === 'maintenance_return') {
      return (
        <>
          <Form.Item label="Nhập về kho" name="toWarehouse" rules={[{ required: true, message: 'Chọn kho nhập' }]}>
            <Select placeholder="Chọn kho nhập hàng về">
              {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Vị trí" name="location">
            <Input placeholder="VD: KV1-A02-R03" />
          </Form.Item>
          <Form.Item label="Kết quả bảo trì" name="note" rules={[{ required: true, message: 'Nhập kết quả' }]}>
            <TextArea rows={3} placeholder="Kết quả kiểm tra / sửa chữa, tình trạng sau bảo trì..." />
          </Form.Item>
        </>
      );
    }

    if (action === 'return') {
      return (
        <>
          <Form.Item label="Thu hồi về kho" name="toWarehouse" rules={[{ required: true, message: 'Chọn kho' }]}>
            <Select placeholder="Chọn kho nhập lại">
              {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
            </Select>
          </Form.Item>
          {isLot && (
            <Form.Item label="Số lượng thu hồi" name="qty"
              rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1 }]}>
              <InputNumber min={1} style={{ width: '100%' }} addonAfter={record.baseUnit} />
            </Form.Item>
          )}
          <Form.Item label="Lý do thu hồi" name="note" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <TextArea rows={3} placeholder="Lý do thu hồi, tình trạng vật tư..." />
          </Form.Item>
        </>
      );
    }

    if (action === 'scrap') {
      return (
        <>
          {isLot && (
            <Form.Item label="Số lượng thanh lý" name="qty"
              rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, max: record.currentQuantity }]}>
              <InputNumber min={1} max={record.currentQuantity} style={{ width: '100%' }}
                addonAfter={record.baseUnit} />
            </Form.Item>
          )}
          <Form.Item label="Lý do thanh lý" name="note" rules={[{ required: true, message: 'Nhập lý do thanh lý' }]}>
            <TextArea rows={3} placeholder="Lý do thanh lý (hỏng hóc, hết hạn, không phù hợp...)..." />
          </Form.Item>
          <Form.Item label="Số biên bản thanh lý" name="orderCode">
            <Input placeholder="VD: BB-TL-2026-..." />
          </Form.Item>
          <div style={{
            padding: '10px 14px', background: '#fff2f0', borderRadius: 8,
            border: '1px solid #ffccc7', fontSize: 12, color: '#ff4d4f',
          }}>
            Thao tác này sẽ cập nhật trạng thái vật tư thành <strong>Đã thanh lý</strong> và không thể hoàn tác.
          </div>
        </>
      );
    }

    return null;
  };

  // ── Movement timeline items ───────────────────────────────
  const timelineItems = [...record.movements].reverse().map((mv: TrackingMovement) => {
    const cfg = movementTypeConfig[mv.type] || { label: mv.type, color: 'default', dot: '·' };
    return {
      color: cfg.color,
      dot: (
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: cfg.color, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#fff', fontWeight: 700,
        }}>
          {cfg.dot}
        </div>
      ),
      children: (
        <div style={{ paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Tag color={cfg.color} style={{ fontSize: 11, margin: 0 }}>{cfg.label}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {new Date(mv.date).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </div>
          {(mv.fromWarehouseName || mv.toWarehouseName) && (
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
              {mv.fromWarehouseName && (
                <span>
                  <Text type="secondary">Từ: </Text>
                  <Text>{mv.fromWarehouseName}{mv.fromLocation ? ` · ${mv.fromLocation}` : ''}</Text>
                </span>
              )}
              {mv.fromWarehouseName && mv.toWarehouseName && (
                <Text type="secondary"> → </Text>
              )}
              {mv.toWarehouseName && (
                <span>
                  <Text type="secondary">{mv.fromWarehouseName ? '' : 'Đến: '}</Text>
                  <Text>{mv.toWarehouseName}{mv.toLocation ? ` · ${mv.toLocation}` : ''}</Text>
                </span>
              )}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
            <Text type="secondary">Số lượng: </Text>
            <Text strong>{mv.quantity.toLocaleString('vi-VN')} {mv.unit}</Text>
            {mv.orderCode && (
              <>
                <Text type="secondary"> · Mã phiếu: </Text>
                <Text style={{ fontFamily: 'monospace' }}>{mv.orderCode}</Text>
              </>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            <Text type="secondary">Thực hiện: </Text>
            <Text>{mv.performedBy}</Text>
            {mv.department && <Text type="secondary"> ({mv.department})</Text>}
          </div>
          {mv.note && (
            <div style={{
              marginTop: 6, padding: '6px 10px',
              background: '#f5f7fa', borderRadius: 6, fontSize: 12,
              borderLeft: `3px solid ${cfg.color}`,
            }}>
              {mv.note}
            </div>
          )}
        </div>
      ),
    };
  });

  const currentActionMeta = action ? actionMeta[action] : null;

  return (
    <div>
      {/* ── Gradient banner ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 20,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row align="middle" justify="space-between" wrap={false}>
          <Col flex="auto">
            <Space align="center" size={12}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/tracking')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  borderRadius: 8,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>
                    {record.trackingCode}
                  </Title>
                  <Tag
                    color={isSerial ? 'geekblue' : 'gold'}
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    {isSerial ? 'Serial' : 'Lô hàng'}
                  </Tag>
                  <Tag color={statusCfg.color} style={{ fontSize: 12, fontWeight: 600 }}>
                    {statusCfg.label}
                  </Tag>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                  {record.productCode} — {record.productName}
                </Text>
              </div>
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8} wrap>
              {renderActions()}
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        {/* ── Left column ──────────────────────────────────── */}
        <Col xs={24} lg={16}>
          {/* Thông tin tracking */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader icon={<InfoCircleOutlined />} title="Thông tin theo dõi" />
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              size="small"
              styles={{ label: { color: '#888', fontSize: 12 }, content: { fontSize: 13 } }}
            >
              <Descriptions.Item label="Loại tracking">
                <Tag color={isSerial ? 'geekblue' : 'gold'}>
                  {isSerial ? 'Serial — đơn chiếc' : 'Lô hàng (Lot)'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã vật tư">{record.productCode}</Descriptions.Item>
              <Descriptions.Item label="Tên vật tư">{record.productName}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{record.productCategory}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị tính">{record.baseUnit}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhập kho">
                {new Date(record.receivedDate).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              {record.inboundOrderCode && (
                <Descriptions.Item label="Phiếu nhập kho">
                  <Text style={{ fontFamily: 'monospace' }}>{record.inboundOrderCode}</Text>
                </Descriptions.Item>
              )}
              {record.expiryDate && (
                <Descriptions.Item label="Hạn sử dụng">
                  <Text style={{ color: '#faad14' }}>
                    {new Date(record.expiryDate).toLocaleDateString('vi-VN')}
                  </Text>
                </Descriptions.Item>
              )}
              {record.unitPrice && (
                <Descriptions.Item label="Đơn giá">
                  {record.unitPrice.toLocaleString('vi-VN')} đ/{record.baseUnit}
                </Descriptions.Item>
              )}
              {record.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {record.note}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Lịch sử di chuyển */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              icon={<HistoryOutlined />}
              title={`Lịch sử di chuyển (${record.movements.length} sự kiện)`}
              color="#0d5c3a"
            />
            <Timeline items={timelineItems} />
          </Card>
        </Col>

        {/* ── Right column ─────────────────────────────────── */}
        <Col xs={24} lg={8}>
          {/* Vị trí hiện tại */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader icon={<EnvironmentOutlined />} title="Vị trí hiện tại" color="#5c3d0d" />
            {record.status === 'in_use' ? (
              <div>
                <Tag color="blue" style={{ marginBottom: 8 }}>Đang sử dụng</Tag>
                <div style={{ fontSize: 13, color: '#333' }}>
                  {record.currentUnitName || 'Đơn vị nhận'}
                </div>
              </div>
            ) : record.status === 'in_transit' ? (
              <div>
                <Tag color="orange" style={{ marginBottom: 8 }}>Đang vận chuyển</Tag>
                <div style={{ fontSize: 13, color: '#888' }}>Chưa xác nhận điểm đến</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {record.currentWarehouseName || '—'}
                </div>
                {record.currentLocation && (
                  <Tag style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {record.currentLocation}
                  </Tag>
                )}
              </div>
            )}
          </Card>

          {/* Số lượng tồn (chỉ với lot) */}
          {!isSerial && (
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader icon={<InboxOutlined />} title="Số lượng lô hàng" color="#722ed1" />
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Progress
                  type="circle"
                  percent={remainPct}
                  size={100}
                  strokeColor={remainPct > 50 ? '#52c41a' : remainPct > 20 ? '#faad14' : '#ff4d4f'}
                  format={pct => (
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{pct}%<br />
                      <span style={{ fontSize: 10, fontWeight: 400 }}>còn lại</span>
                    </span>
                  )}
                />
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Số lượng ban đầu</Text>
                  <Text strong style={{ fontSize: 12 }}>
                    {record.initialQuantity.toLocaleString('vi-VN')} {record.baseUnit}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đã sử dụng</Text>
                  <Text style={{ fontSize: 12, color: '#ff4d4f' }}>
                    {(record.initialQuantity - record.currentQuantity).toLocaleString('vi-VN')} {record.baseUnit}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Còn lại</Text>
                  <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                    {record.currentQuantity.toLocaleString('vi-VN')} {record.baseUnit}
                  </Text>
                </div>
              </Space>
            </Card>
          )}

          {/* Nhà cung cấp */}
          {record.supplier && (
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: isSerial ? 16 : 0 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader icon={<ShopOutlined />} title="Nhà cung cấp" color="#0d3a5c" />
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{record.supplier}</div>
              {record.inboundOrderCode && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Phiếu nhập: </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{record.inboundOrderCode}</Text>
                </div>
              )}
              {record.unitPrice && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đơn giá: </Text>
                  <Text style={{ fontSize: 12 }}>
                    {record.unitPrice.toLocaleString('vi-VN')} đ/{record.baseUnit}
                  </Text>
                </div>
              )}
            </Card>
          )}

          {/* Serial badge */}
          {isSerial && (
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader icon={<NodeIndexOutlined />} title="Thông tin serial" color="#1B3A5C" />
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  display: 'inline-block',
                  background: '#f0f2f5',
                  border: '2px dashed #d9d9d9',
                  borderRadius: 10,
                  padding: '12px 20px',
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1B3A5C',
                  letterSpacing: 1,
                }}>
                  {record.trackingCode}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Đơn chiếc — 1 {record.baseUnit}
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* ── Action modal ──────────────────────────────────── */}
      <Modal
        open={action !== null}
        title={
          <Space>
            <span style={{
              display: 'inline-flex', width: 28, height: 28, borderRadius: 8,
              background: currentActionMeta?.color || '#1B3A5C',
              alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13,
            }}>
              {action === 'issue' && <ExportOutlined />}
              {action === 'transfer' && <SwapOutlined />}
              {action === 'maintenance_send' && <ToolOutlined />}
              {action === 'maintenance_return' && <CheckCircleOutlined />}
              {action === 'return' && <RollbackOutlined />}
              {action === 'scrap' && <DeleteOutlined />}
            </span>
            <span style={{ fontSize: 15 }}>{currentActionMeta?.title}</span>
          </Space>
        }
        onCancel={() => setAction(null)}
        onOk={handleOk}
        okText={currentActionMeta?.okText}
        cancelText="Hủy"
        okButtonProps={{
          danger: currentActionMeta?.okDanger,
          loading: submitting,
          style: !currentActionMeta?.okDanger
            ? { background: currentActionMeta?.color, borderColor: currentActionMeta?.color }
            : undefined,
        }}
        width={480}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f5f7fa', borderRadius: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Vật tư: </Text>
          <Text strong style={{ fontSize: 12 }}>{record.trackingCode}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}> · </Text>
          <Text style={{ fontSize: 12 }}>{record.productName}</Text>
        </div>
        <Form form={form} layout="vertical" size="middle">
          {renderModalContent()}
        </Form>
      </Modal>
    </div>
  );
};

export default TrackingDetail;
