import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col,
  Form, Input, Select, DatePicker, Table, InputNumber,
  Divider, message, Tag, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  InboxOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ShoppingCartOutlined, ToolOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { warehouses } from '../../data/warehouses';
import { products } from '../../data/products';
import { inventoryItems } from '../../data/inventory';
import { replenishments as replenishmentsData } from '../../data/replenishments';
import type { ReplenishmentAction } from '../../types';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

// ─── Static options ────────────────────────────────────────
const requestingUnitOptions = [
  { value: 'PX1', label: 'PX1 — Trung tâm Sửa chữa Monitoring' },
  { value: 'PX2', label: 'PX2 — Trung tâm Sửa chữa Module sản phẩm' },
  { value: 'PX3', label: 'PX3 — Trung tâm Hạ tầng & DevOps' },
  { value: 'PX4', label: 'PX4 — Trung tâm Phần mềm Gamma' },
  { value: 'PKT', label: 'PKT — Phòng Kỹ thuật' },
  { value: 'PKH', label: 'PKH — Phòng Kế hoạch' },
  { value: 'PHCKT', label: 'PHCKT — Phòng Logistics - Kỹ thuật' },
];

const purposeOptions = [
  { value: 'issue',      label: 'Cấp phát vật tư cho nhiệm vụ' },
  { value: 'production', label: 'Phục vụ sản xuất nội bộ' },
  { value: 'repair',     label: 'Sửa chữa / Đại tu khẩn cấp' },
  { value: 'internal',   label: 'Sử dụng nội bộ' },
];

// ─── Section header (same pattern as InboundForm) ──────────
const SectionHeader = ({ gradient, icon, title }: {
  gradient: string; icon: React.ReactNode; title: string;
}) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 7,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

// ─── Line item ─────────────────────────────────────────────
interface DemandLine {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
  currentStock: number;
  forecastStock: number;
  shortage: number;
  suggestedAction: ReplenishmentAction;
  neededByDate: string;
}

// ─── Compute inventory for a product + warehouse ───────────
function getInventoryInfo(productId: string, warehouseId?: string) {
  const wh = warehouses.find(w => w.id === warehouseId);
  const items = inventoryItems.filter(i =>
    i.productId === productId && (!wh || i.warehouseId === wh.code),
  );
  const onHand   = items.reduce((s, i) => s + i.qtyOnHand, 0);
  const incoming = items.reduce((s, i) => s + i.qtyIncoming, 0);
  const outgoing = items.reduce((s, i) => s + i.qtyOutgoing, 0);
  return { onHand, forecast: onHand + incoming - outgoing };
}

// ─── Component ────────────────────────────────────────────
const ReplenishmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [lines, setLines] = useState<DemandLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>();

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  // ─── Add line ─────────────────────────────────────────────
  const addLine = () => {
    if (!selectedProductId) { message.warning('Vui lòng chọn vật tư trước'); return; }
    if (lines.some(l => l.productId === selectedProductId)) {
      message.warning('Vật tư này đã có trong danh sách'); return;
    }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    const { onHand, forecast } = getInventoryInfo(selectedProductId, selectedWarehouseId);
    const isMechanical = product.code.startsWith('CK-');
    setLines(prev => [...prev, {
      key:             product.id,
      productId:       product.id,
      productCode:     product.code,
      productName:     product.name,
      unit:            product.baseUnit,
      qty:             1,
      currentStock:    onHand,
      forecastStock:   forecast,
      shortage:        Math.max(0, 1 - forecast),
      suggestedAction: isMechanical ? 'produce' : 'purchase',
      neededByDate:    '',
    }]);
    setSelectedProductId('');
  };

  const removeLine = (key: string) => setLines(prev => prev.filter(l => l.key !== key));

  const updateQty = (key: string, qty: number) =>
    setLines(prev => prev.map(l => l.key !== key ? l : {
      ...l, qty, shortage: Math.max(0, qty - l.forecastStock),
    }));

  const updateAction = (key: string, action: ReplenishmentAction) =>
    setLines(prev => prev.map(l => l.key === key ? { ...l, suggestedAction: action } : l));

  const updateDate = (key: string, date: string) =>
    setLines(prev => prev.map(l => l.key === key ? { ...l, neededByDate: date } : l));

  // ─── Summary ──────────────────────────────────────────────
  const summary = useMemo(() => ({
    total:      lines.length,
    shortage:   lines.filter(l => l.shortage > 0).length,
    purchase:   lines.filter(l => l.suggestedAction === 'purchase').length,
    produce:    lines.filter(l => l.suggestedAction === 'produce').length,
    sufficient: lines.filter(l => l.shortage === 0).length,
  }), [lines]);

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (lines.length === 0) { message.warning('Vui lòng thêm ít nhất một vật tư'); return; }
      const values = form.getFieldsValue();
      const wh = warehouses.find(w => w.id === values.warehouseId);
      const newCode = `YC-2026-${String(replenishmentsData.length + 1).padStart(3, '0')}`;
      const commonDate = values.neededByDate
        ? (values.neededByDate as { format: (f: string) => string }).format('YYYY-MM-DD')
        : '';
      replenishmentsData.push({
        id:            `rp-new-${Date.now()}`,
        code:          newCode,
        source:        'demand',
        status:        'draft',
        warehouseId:   wh?.id ?? '',
        warehouseName: wh?.name ?? '',
        requestedUnit: values.requestedUnit,
        requestedBy:   'Người dùng hiện tại',
        purpose:       values.purpose,
        demandRef:     newCode,
        lines: lines.map((l, idx) => ({
          id:             `rp-new-${Date.now()}-l${idx + 1}`,
          productId:      l.productId,
          productCode:    l.productCode,
          productName:    l.productName,
          currentStock:   l.currentStock,
          minStock:       products.find(p => p.id === l.productId)?.minStock ?? 0,
          maxStock:       products.find(p => p.id === l.productId)?.maxStock ?? 0,
          forecastDemand: l.qty,
          suggestedQty:   l.qty,
          unit:           l.unit,
          action:         l.suggestedAction,
          leadTimeDays:   products.find(p => p.id === l.productId)?.leadTimeDays ?? 30,
          neededByDate:   l.neededByDate || commonDate,
          orderByDate:    l.neededByDate || commonDate,
        })),
        totalItems: lines.length,
        totalValue: 0,
        note:        values.note || '',
        createdAt:   new Date().toISOString(),
      } as typeof replenishmentsData[0]);
      message.success(`Đã tạo yêu cầu ${newCode} với ${lines.length} loại vật tư`);
      navigate(-1);
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  // ─── Table columns ────────────────────────────────────────
  const columns: ColumnsType<DemandLine> = [
    {
      title: 'STT',
      width: 44,
      render: (_: unknown, __: DemandLine, idx: number) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{idx + 1}</Text>
      ),
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'productCode',
      width: 130,
      render: (code: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 12 }}>{code}</Tag>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Số lượng cần',
      key: 'qty',
      width: 130,
      render: (_: unknown, r: DemandLine) => (
        <InputNumber
          min={1}
          value={r.qty}
          onChange={val => updateQty(r.key, val ?? 1)}
          addonAfter={<span style={{ fontSize: 11 }}>{r.unit}</span>}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Tồn hiện có',
      key: 'currentStock',
      width: 110,
      align: 'right',
      render: (_: unknown, r: DemandLine) => (
        <Text style={{ fontSize: 13, fontWeight: 600,
          color: r.currentStock <= 0 ? '#ff4d4f' : '#52c41a' }}>
          {r.currentStock} {r.unit}
        </Text>
      ),
    },
    {
      title: 'Tồn dự báo',
      key: 'forecastStock',
      width: 110,
      align: 'right',
      render: (_: unknown, r: DemandLine) => (
        <Text style={{ fontSize: 13,
          color: r.forecastStock < r.qty ? '#faad14' : '#52c41a' }}>
          {r.forecastStock} {r.unit}
        </Text>
      ),
    },
    {
      title: 'Thiếu hụt',
      key: 'shortage',
      width: 110,
      align: 'center',
      render: (_: unknown, r: DemandLine) => (
        r.shortage > 0
          ? <Tag color="error" icon={<ExclamationCircleOutlined />} style={{ borderRadius: 4, fontSize: 11 }}>
              {r.shortage} {r.unit}
            </Tag>
          : <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 4, fontSize: 11 }}>
              Đủ tồn
            </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_: unknown, r: DemandLine) => (
        <Select
          value={r.suggestedAction}
          onChange={val => updateAction(r.key, val)}
          size="small"
          style={{ width: '100%' }}
          options={[
            { value: 'purchase', label: <Space size={4}><ShoppingCartOutlined />Mua sắm</Space> },
            { value: 'produce',  label: <Space size={4}><ToolOutlined />Sản xuất</Space> },
            { value: 'transfer', label: <Space size={4}><InboxOutlined />Điều chuyển</Space> },
          ]}
        />
      ),
    },
    {
      title: 'Ngày cần (tuỳ chọn)',
      key: 'neededByDate',
      width: 150,
      render: (_: unknown, r: DemandLine) => (
        <DatePicker
          size="small"
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          style={{ width: '100%' }}
          onChange={d => updateDate(r.key, d ? d.format('YYYY-MM-DD') : '')}
        />
      ),
    },
    {
      title: '',
      width: 44,
      align: 'center',
      render: (_: unknown, r: DemandLine) => (
        <Tooltip title="Xóa dòng">
          <Button type="text" danger icon={<DeleteOutlined />} size="small"
            onClick={() => removeLine(r.key)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Gradient Header Banner (same as InboundForm) ──── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size={12} align="center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  borderRadius: 8,
                }}
              />
              <Space align="center" size={10}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <InboxOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>
                    Tạo yêu cầu bổ sung vật tư
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    Phát sinh nhu cầu vật tư theo thực tế — Trung tâm Hà Nội
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        {/* ─── Left column ──────────────────────────────────── */}
        <Col xs={24} lg={16}>
          {/* Thông tin yêu cầu */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<InboxOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Thông tin yêu cầu"
            />
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="requestedUnit" label="Đơn vị yêu cầu"
                    rules={[{ required: true, message: 'Chọn đơn vị yêu cầu' }]}>
                    <Select placeholder="Chọn trung tâm / phòng ban..." options={requestingUnitOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="purpose" label="Mục đích sử dụng"
                    rules={[{ required: true, message: 'Chọn mục đích' }]}>
                    <Select placeholder="Chọn mục đích..." options={purposeOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="warehouseId" label="Kho cấp phát"
                    rules={[{ required: true, message: 'Chọn kho' }]}>
                    <Select
                      placeholder="Chọn kho..."
                      options={warehouses.map(w => ({ value: w.id, label: `${w.code} — ${w.name}` }))}
                      onChange={val => {
                        setSelectedWarehouseId(val);
                        setLines(prev => prev.map(l => {
                          const { onHand, forecast } = getInventoryInfo(l.productId, val);
                          return { ...l, currentStock: onHand, forecastStock: forecast, shortage: Math.max(0, l.qty - forecast) };
                        }));
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="neededByDate" label="Ngày cần hàng (chung)">
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày..."
                      style={{ width: '100%' }}
                      disabledDate={d => d && d < dayjs().startOf('day')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={2} placeholder="Lý do cụ thể, nhiệm vụ liên quan, thông tin bổ sung..." />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Danh sách vật tư */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #531dab, #722ed1)"
              icon={<PlusOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title={`Danh sách vật tư cần bổ sung${lines.length > 0 ? ` (${lines.length} loại)` : ''}`}
            />

            {/* Add product row */}
            <div style={{
              display: 'flex', gap: 10, marginBottom: 16,
              padding: '12px 14px', background: '#f8f9ff',
              borderRadius: 8, border: '1px dashed #d0d8f0',
            }}>
              <Select
                value={selectedProductId || undefined}
                onChange={setSelectedProductId}
                options={productOptions.filter(p => !lines.some(l => l.productId === p.value))}
                placeholder="Tìm và chọn vật tư..."
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addLine}
                style={{ background: colors.navy }}
              >
                Thêm dòng
              </Button>
            </div>

            <Table
              dataSource={lines}
              columns={columns}
              rowKey="key"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có vật tư nào. Chọn vật tư ở trên và nhấn "Thêm dòng".' }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>

        {/* ─── Right column: summary ─────────────────────────── */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 72 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #D4A843, #f0d890)"
              icon={<InboxOutlined style={{ color: '#0a1628', fontSize: 13 }} />}
              title="Tóm tắt yêu cầu"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#f8f9ff', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tổng loại vật tư</Text>
                <Text strong style={{ fontSize: 22, color: colors.navy }}>{summary.total}</Text>
                <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>loại</Text>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 12px', background: '#fff2f0', borderRadius: 8, border: '1px solid #ffccc7' }}>
                  <Text style={{ fontSize: 11, color: '#cf1322', display: 'block' }}>Cần bổ sung</Text>
                  <Text strong style={{ fontSize: 18, color: '#cf1322' }}>{summary.shortage}</Text>
                </div>
                <div style={{ padding: '10px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <Text style={{ fontSize: 11, color: '#389e0d', display: 'block' }}>Đủ tồn kho</Text>
                  <Text strong style={{ fontSize: 18, color: '#389e0d' }}>{summary.sufficient}</Text>
                </div>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Phân loại hành động</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {summary.purchase > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color="#1B3A5C" icon={<ShoppingCartOutlined />} style={{ borderRadius: 4, fontSize: 12 }}>Mua sắm</Tag>
                      <Text strong>{summary.purchase} loại</Text>
                    </div>
                  )}
                  {summary.produce > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color="#531dab" icon={<ToolOutlined />} style={{ borderRadius: 4, fontSize: 12 }}>Sản xuất</Tag>
                      <Text strong>{summary.produce} loại</Text>
                    </div>
                  )}
                  {summary.sufficient > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 4, fontSize: 12 }}>Cấp phát ngay</Tag>
                      <Text strong>{summary.sufficient} loại</Text>
                    </div>
                  )}
                  {summary.total === 0 && (
                    <Text type="secondary" style={{ fontSize: 13 }}>Chưa có vật tư nào.</Text>
                  )}
                </div>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Trạng thái ban đầu</Text>
                <Tag color="default" style={{ fontSize: 13, padding: '2px 10px' }}>Nháp</Tag>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Quy trình xử lý</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Tạo yêu cầu (Nháp)', 'Đang xử lý', 'Hoàn thành'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 10,
                        background: i === 0 ? colors.navy : '#e8e8e8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: i === 0 ? '#fff' : '#999', fontWeight: 600,
                      }}>{i + 1}</div>
                      <Text style={{ fontSize: 12, color: i === 0 ? colors.navy : '#999', fontWeight: i === 0 ? 600 : 400 }}>
                        {step}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Bottom action bar (same as InboundForm) ─────────── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row justify="end">
          <Col>
            <Space size={12}>
              <Button onClick={() => navigate(-1)}>Hủy</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}
              >
                Gửi yêu cầu ({lines.length} vật tư)
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ReplenishmentForm;
