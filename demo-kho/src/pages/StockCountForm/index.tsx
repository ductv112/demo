import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col,
  Form, Input, Select, DatePicker, Table, InputNumber,
  Divider, message, Tag, Tooltip, Alert as AntAlert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined, AuditOutlined, SaveOutlined,
  PlusOutlined, DeleteOutlined, CheckCircleOutlined,
  WarningOutlined, CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { warehouses } from '../../data/warehouses';
import { products } from '../../data/products';
import { inventoryItems } from '../../data/inventory';
import { getScheduleByWarehouseId, frequencyConfig } from '../../data/schedules';
import type { AdjustmentType } from '../../types';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

interface CountLine {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  locationCode: string;
  lotNumber: string;
  systemQty: number;
  countedQty: number;
  reason: string;
  scrapCategory?: string;
  unitValue?: number;
}

const adjustmentTypeOptions: { value: AdjustmentType; label: string; description: string }[] = [
  { value: 'count', label: 'Kiểm kê định kỳ', description: 'Kiểm kê theo chu kỳ, đối chiếu số liệu' },
  { value: 'correction', label: 'Điều chỉnh tồn kho', description: 'Điều chỉnh số liệu khi phát hiện sai lệch' },
  { value: 'scrap', label: 'Loại bỏ vật tư', description: 'Thanh lý vật tư hỏng, hết hạn, kém phẩm chất' },
];

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const scrapCategoryOptions = [
  { value: 'damage',    label: 'Hỏng hóc',              color: 'red' },
  { value: 'expired',   label: 'Hết hạn sử dụng',       color: 'orange' },
  { value: 'defective', label: 'Không đạt tiêu chuẩn',  color: 'volcano' },
  { value: 'other',     label: 'Lý do khác',             color: 'default' },
];

const StockCountForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Bước 2: Sinh danh sách từ lịch kiểm kê
  const fromScheduleWarehouseId = searchParams.get('warehouseId') ?? '';
  const fromScheduleId = searchParams.get('scheduleId') ?? '';
  const isFromSchedule = !!fromScheduleWarehouseId;

  const [form] = Form.useForm();
  const [lines, setLines] = useState<CountLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(fromScheduleWarehouseId);
  const [formType, setFormType] = useState<string>('count');

  // Tra cứu thông tin lịch nếu sinh từ lịch
  const scheduleInfo = isFromSchedule ? getScheduleByWarehouseId(fromScheduleWarehouseId) : null;

  // Bước 2: Tự động tải danh sách vật tư từ kho khi sinh từ lịch
  useEffect(() => {
    if (!isFromSchedule || !fromScheduleWarehouseId) return;

    const warehouse = warehouses.find(w => w.id === fromScheduleWarehouseId);
    if (!warehouse) return;

    // inventory dùng code (WH01) thay vì id (wh-001)
    const warehouseCode = warehouse.code;
    const items = inventoryItems.filter(i => i.warehouseId === warehouseCode);

    const autoLines: CountLine[] = items.map((item, idx) => ({
      key: `auto-${idx}-${item.id}`,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      unit: item.unit,
      locationCode: item.locationCode ?? '',
      lotNumber: item.lotNumber ?? '',
      systemQty: item.qtyOnHand,
      countedQty: item.qtyOnHand, // chưa kiểm đếm, đặt bằng hệ thống
      reason: '',
    }));

    setLines(autoLines);
    form.setFieldsValue({
      warehouseId: fromScheduleWarehouseId,
      type: 'count',
      scheduledDate: dayjs(),
    });
  }, [isFromSchedule, fromScheduleWarehouseId]);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: `${w.code} — ${w.name}`,
  }));

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
    code: p.code,
    name: p.name,
    unit: p.baseUnit,
  }));

  const isScrap = formType === 'scrap';

  const stats = useMemo(() => {
    const surplus  = lines.filter(l => l.countedQty > l.systemQty).length;
    const shortage = lines.filter(l => l.countedQty < l.systemQty).length;
    const match    = lines.filter(l => l.countedQty === l.systemQty).length;
    const totalDiff = lines.reduce((sum, l) => sum + Math.abs(l.countedQty - l.systemQty), 0);
    const totalLoss = lines.reduce((sum, l) => sum + (l.systemQty * (l.unitValue ?? 0)), 0);
    return { surplus, shortage, match, totalDiff, totalLoss };
  }, [lines]);

  const addLine = () => {
    if (!selectedProductId) { message.warning('Vui lòng chọn vật tư trước'); return; }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    if (lines.find(l => l.productId === selectedProductId)) {
      message.warning('Vật tư này đã có trong danh sách');
      return;
    }
    // Find system qty for this product in selected warehouse
    const invItem = inventoryItems.find(
      i => i.productId === product.id && (!selectedWarehouseId || i.warehouseId === selectedWarehouseId)
    );
    setLines(prev => [...prev, {
      key: `line-${Date.now()}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      unit: product.baseUnit,
      locationCode: invItem?.locationCode ?? '',
      lotNumber: invItem?.lotNumber ?? '',
      systemQty: invItem?.qtyOnHand ?? 0,
      countedQty: isScrap ? 0 : (invItem?.qtyOnHand ?? 0),
      reason: '',
      scrapCategory: isScrap ? 'damage' : undefined,
      unitValue: isScrap ? 0 : undefined,
    }]);
    setSelectedProductId('');
  };

  const removeLine = (key: string) => setLines(prev => prev.filter(l => l.key !== key));

  const updateLine = (key: string, field: keyof CountLine, value: string | number) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l));
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (lines.length === 0) { message.warning('Vui lòng thêm ít nhất một vật tư'); return; }
      message.success('Tạo phiếu kiểm kê thành công');
      navigate('/stock-count');
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const getDiffColor = (system: number, counted: number) => {
    if (counted === system) return '#52c41a';
    if (counted > system) return '#1890ff';
    return '#ff4d4f';
  };

  const columns: ColumnsType<CountLine> = [
    {
      title: 'STT', width: 50,
      render: (_, __, index) => <Text type="secondary" style={{ fontSize: 13 }}>{index + 1}</Text>,
    },
    {
      title: 'Mã vật tư', dataIndex: 'productCode', width: 130,
      render: (code) => <Tag color="orange" style={{ fontFamily: 'monospace', fontSize: 11 }}>{code}</Tag>,
    },
    {
      title: 'Tên vật tư', dataIndex: 'productName', ellipsis: true,
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'ĐVT', dataIndex: 'unit', width: 60,
      render: (unit) => <Text type="secondary" style={{ fontSize: 12 }}>{unit}</Text>,
    },
    {
      title: isScrap ? 'SL loại bỏ' : 'SL hệ thống',
      dataIndex: 'systemQty', width: 110,
      render: (qty, record) => isScrap
        ? (
          <InputNumber min={0} value={qty}
            onChange={val => updateLine(record.key, 'systemQty', val ?? 0)}
            style={{ width: '100%' }} size="small"
          />
        ) : (
          <Text strong style={{ fontSize: 13, color: colors.navy }}>{qty}</Text>
        ),
    },
    ...(!isScrap ? [{
      title: 'SL kiểm đếm', dataIndex: 'countedQty', width: 130,
      render: (qty: number, record: CountLine) => (
        <InputNumber min={0} value={qty}
          onChange={val => updateLine(record.key, 'countedQty', val ?? 0)}
          style={{ width: '100%' }} size="small"
        />
      ),
    }, {
      title: 'Chênh lệch', width: 100,
      render: (_: unknown, record: CountLine) => {
        const diff = record.countedQty - record.systemQty;
        const color = getDiffColor(record.systemQty, record.countedQty);
        return <Text strong style={{ fontSize: 13, color }}>{diff > 0 ? `+${diff}` : diff}</Text>;
      },
    }] : []),
    ...(isScrap ? [{
      title: 'Loại lý do', dataIndex: 'scrapCategory', width: 160,
      render: (val: string, record: CountLine) => (
        <Select
          value={val}
          size="small"
          style={{ width: '100%' }}
          onChange={v => updateLine(record.key, 'scrapCategory', v)}
          options={scrapCategoryOptions.map(o => ({ label: o.label, value: o.value }))}
        />
      ),
    }, {
      title: 'Đơn giá (tr)', dataIndex: 'unitValue', width: 120,
      render: (val: number, record: CountLine) => (
        <InputNumber
          min={0} value={val} size="small" style={{ width: '100%' }}
          onChange={v => updateLine(record.key, 'unitValue', v ?? 0)}
          placeholder="0.0"
        />
      ),
    }, {
      title: 'Tổn thất (tr)', width: 110,
      render: (_: unknown, record: CountLine) => {
        const loss = record.systemQty * (record.unitValue ?? 0);
        return <Text strong style={{ color: '#ff4d4f', fontSize: 13 }}>{loss.toFixed(1)}</Text>;
      },
    }] : []),
    {
      title: isScrap ? 'Lý do loại bỏ' : 'Lý do chênh lệch', dataIndex: 'reason',
      render: (reason: string, record: CountLine) => (
        <Input value={reason} placeholder={isScrap ? 'Mô tả tình trạng...' : 'Lý do...'}
          onChange={e => updateLine(record.key, 'reason', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: '', width: 48,
      render: (_: unknown, record: CountLine) => (
        <Tooltip title="Xóa dòng">
          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => removeLine(record.key)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Header Banner ─────────────────────────────────── */}
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
                onClick={() => navigate('/stock-count')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AuditOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>Tạo phiếu kiểm kê</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {isFromSchedule
                      ? `Sinh từ lịch kiểm kê định kỳ${scheduleInfo ? ` — ${scheduleInfo.warehouseName}` : ''}`
                      : 'Kiểm kê tồn kho theo vị trí — Trung tâm Hà Nội'}
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
          {isFromSchedule && (
            <Col>
              <Tag
                icon={<CalendarOutlined />}
                style={{ background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.5)', color: '#f0d890', fontSize: 12, borderRadius: 6, padding: '2px 10px' }}
              >
                Kiểm kê định kỳ
                {scheduleInfo && ` · ${frequencyConfig[scheduleInfo.frequency].label}`}
              </Tag>
            </Col>
          )}
        </Row>
      </div>

      {/* ─── Banner lịch kiểm kê (Bước 2) ─────────────────── */}
      {isFromSchedule && scheduleInfo && (
        <AntAlert
          type="info"
          icon={<CalendarOutlined />}
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
          message={
            <Space size={16}>
              <span>
                <strong>Kiểm kê định kỳ tự động</strong> — {scheduleInfo.warehouseName}
              </span>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                Tần suất: {frequencyConfig[scheduleInfo.frequency].label}
                {' · '}KK cuối: {dayjs(scheduleInfo.lastCountDate).format('DD/MM/YYYY')}
                {' · '}Hạn tiếp: {dayjs(scheduleInfo.nextCountDate).format('DD/MM/YYYY')}
              </span>
            </Space>
          }
          description={`Hệ thống đã tự động tải ${lines.length} vật tư từ kho vào danh sách kiểm kê. Nhân viên kho tiến hành nhập số lượng thực tế.`}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {/* Basic info */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Thông tin phiếu kiểm kê"
            />
            <Form form={form} layout="vertical"
              initialValues={{ type: 'count', scheduledDate: dayjs() }}
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item label="Loại kiểm kê" name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại kiểm kê' }]}
                  >
                    <Select
                      optionLabelProp="label"
                      disabled={isFromSchedule}
                      onChange={v => { setFormType(v); if (!isFromSchedule) setLines([]); }}
                    >
                      {adjustmentTypeOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                          <div>
                            <Text strong style={{ fontSize: 13 }}>{opt.label}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{opt.description}</Text>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Kho kiểm kê" name="warehouseId"
                    rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
                  >
                    <Select
                      options={warehouseOptions}
                      placeholder="Chọn kho..."
                      showSearch
                      disabled={isFromSchedule}
                      onChange={val => setSelectedWarehouseId(val)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Ngày kiểm kê" name="scheduledDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm kê' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={2} placeholder="Ghi chú về đợt kiểm kê..." />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {lines.length > 0 && (stats.shortage > 0 || stats.surplus > 0) && (
            <AntAlert
              type="warning"
              icon={<WarningOutlined />}
              message={`Phát hiện ${stats.shortage + stats.surplus} dòng có chênh lệch (${stats.shortage} thiếu, ${stats.surplus} thừa). Vui lòng ghi rõ lý do.`}
              showIcon
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}

          {/* Count lines */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<PlusOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title={`Danh sách vật tư kiểm kê${lines.length > 0 ? ` (${lines.length} dòng)` : ''}`}
            />
            <div style={{
              display: 'flex', gap: 10, marginBottom: 16, padding: '12px 14px',
              background: '#fffbe6', borderRadius: 8, border: '1px dashed #ffe58f',
            }}>
              <Select
                value={selectedProductId || undefined}
                onChange={setSelectedProductId}
                options={productOptions}
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
                style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
              >
                Thêm vật tư
              </Button>
            </div>
            <Table
              dataSource={lines} columns={columns} rowKey="key"
              pagination={false} size="small" scroll={{ x: 1000 }}
              locale={{ emptyText: 'Chưa có vật tư nào. Chọn vật tư ở trên và nhấn "Thêm vật tư".' }}
              rowClassName={record => {
                const diff = record.countedQty - record.systemQty;
                if (diff !== 0) return 'ant-table-row-highlighted';
                return '';
              }}
            />
          </Card>
        </Col>

        {/* Right: Summary */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 72 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #D4A843, #f0d890)"
              icon={<AuditOutlined style={{ color: '#0a1628', fontSize: 13 }} />}
              title="Kết quả kiểm kê"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#fffbe6', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tổng số vật tư kiểm</Text>
                <Text strong style={{ fontSize: 22, color: '#fa8c16' }}>{lines.length}</Text>
                <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>vật tư</Text>
              </div>

              <Row gutter={8}>
                <Col span={8}>
                  <div style={{ padding: '10px 10px', background: '#f6ffed', borderRadius: 8, textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, display: 'block', marginBottom: 4 }} />
                    <Text strong style={{ fontSize: 18, color: '#52c41a' }}>{stats.match}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Khớp</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '10px 10px', background: '#fff7e6', borderRadius: 8, textAlign: 'center' }}>
                    <WarningOutlined style={{ color: '#fa8c16', fontSize: 18, display: 'block', marginBottom: 4 }} />
                    <Text strong style={{ fontSize: 18, color: '#fa8c16' }}>{stats.surplus}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Thừa</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '10px 10px', background: '#fff1f0', borderRadius: 8, textAlign: 'center' }}>
                    <WarningOutlined style={{ color: '#ff4d4f', fontSize: 18, display: 'block', marginBottom: 4 }} />
                    <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>{stats.shortage}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Thiếu</Text>
                  </div>
                </Col>
              </Row>

              {!isScrap && stats.totalDiff > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: '#fff1f0', border: '1px solid #ffccc7',
                }}>
                  <Text style={{ fontSize: 12, color: '#cf1322' }}>
                    Tổng chênh lệch: <strong>{stats.totalDiff.toLocaleString('vi-VN')}</strong> đơn vị
                  </Text>
                </div>
              )}
              {isScrap && stats.totalLoss > 0 && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff1f0', border: '1px solid #ffccc7' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>Tổng giá trị tổn thất</Text>
                  <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>{stats.totalLoss.toFixed(1)}</Text>
                  <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>triệu VND</Text>
                </div>
              )}

              <Divider style={{ margin: '4px 0' }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Bottom Action Card ─────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row justify="end">
          <Col>
            <Space size={12}>
              <Button onClick={() => navigate('/stock-count')}>Hủy</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}
                style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
                Lưu phiếu
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StockCountForm;
