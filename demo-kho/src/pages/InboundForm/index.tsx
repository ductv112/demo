import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col,
  Form, Input, Select, DatePicker, Table, InputNumber,
  Divider, message, Tag, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined, ImportOutlined, SaveOutlined,
  PlusOutlined, DeleteOutlined, InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { warehouses } from '../../data/warehouses';
import { products } from '../../data/products';
import { getUnitOptions, convertToBase } from '../../data/unitConversions';
import type { InboundType } from '../../types';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

interface LineItem {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  baseUnit: string;
  inputUnit: string;   // đơn vị người dùng nhập (có thể là alternate)
  inputQty: number;    // số lượng theo inputUnit
  expectedQty: number; // số lượng quy đổi về baseUnit (lưu vào hệ thống)
  lotNumber: string;
  note: string;
}

const inboundTypeOptions: { value: InboundType; label: string }[] = [
  { value: 'purchase', label: 'Mua sắm' },
  { value: 'production', label: 'Từ sản xuất' },
  { value: 'transfer_in', label: 'Điều chuyển từ kho khác' },
  { value: 'return', label: 'Hoàn trả' },
];

const sourceTypeOptions = [
  { value: 'Nhà cung cấp', label: 'Nhà cung cấp' },
  { value: 'Trung tâm', label: 'Trung tâm nội bộ' },
  { value: 'Kho khác', label: 'Kho khác' },
  { value: 'Đơn vị bên ngoài', label: 'Đơn vị bên ngoài' },
];

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const InboundForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

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
    trackingType: p.trackingType,
  }));

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + (l.expectedQty || 0), 0),
    [lines],
  );

  const addLine = () => {
    if (!selectedProductId) { message.warning('Vui lòng chọn vật tư trước'); return; }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    if (lines.find(l => l.productId === selectedProductId)) {
      message.warning('Vật tư này đã có trong danh sách');
      return;
    }
    const newLine: LineItem = {
      key: `line-${Date.now()}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      baseUnit: product.baseUnit,
      inputUnit: product.baseUnit,
      inputQty: 1,
      expectedQty: 1,
      lotNumber: '',
      note: '',
    };
    setLines(prev => [...prev, newLine]);
    setSelectedProductId('');
  };

  const removeLine = (key: string) => {
    setLines(prev => prev.filter(l => l.key !== key));
  };

  const updateLine = (key: string, field: keyof LineItem, value: string | number) => {
    setLines(prev => prev.map(l => {
      if (l.key !== key) return l;
      const updated = { ...l, [field]: value };
      // Recalculate expectedQty whenever inputQty or inputUnit changes
      if (field === 'inputQty' || field === 'inputUnit') {
        updated.expectedQty = convertToBase(
          field === 'inputQty' ? (value as number) : l.inputQty,
          field === 'inputUnit' ? (value as string) : l.inputUnit,
          l.productId,
          l.baseUnit,
        );
      }
      return updated;
    }));
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (lines.length === 0) { message.warning('Vui lòng thêm ít nhất một vật tư'); return; }
      message.success('Tạo phiếu nhập kho thành công');
      navigate('/inbound');
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const columns: ColumnsType<LineItem> = [
    {
      title: 'STT',
      width: 50,
      render: (_, __, index) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{index + 1}</Text>
      ),
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'productCode',
      width: 140,
      render: (code) => <Tag color="blue" style={{ fontFamily: 'monospace' }}>{code}</Tag>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Đơn vị nhập',
      dataIndex: 'inputUnit',
      width: 170,
      render: (unit: string, record) => {
        const opts = getUnitOptions(record.productId, record.baseUnit);
        return (
          <Select
            value={unit}
            size="small"
            style={{ width: '100%' }}
            options={opts.map(o => ({ value: o.value, label: o.value }))}
            onChange={val => updateLine(record.key, 'inputUnit', val)}
          />
        );
      },
    },
    {
      title: 'Số lượng nhập',
      dataIndex: 'inputQty',
      width: 130,
      render: (qty: number, record) => (
        <InputNumber
          min={1}
          value={qty}
          onChange={val => updateLine(record.key, 'inputQty', val ?? 1)}
          style={{ width: '100%' }}
          size="small"
        />
      ),
    },
    {
      title: 'Quy về ĐVT chuẩn',
      key: 'expectedQty',
      width: 130,
      render: (_: unknown, record) => (
        record.inputUnit === record.baseUnit ? (
          <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        ) : (
          <Tag color="blue" style={{ fontSize: 12 }}>
            = {record.expectedQty} {record.baseUnit}
          </Tag>
        )
      ),
    },
    {
      title: 'Số lô / Serial',
      dataIndex: 'lotNumber',
      width: 160,
      render: (lot, record) => (
        <Input
          value={lot}
          placeholder="Nhập số lô..."
          onChange={e => updateLine(record.key, 'lotNumber', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      render: (note, record) => (
        <Input
          value={note}
          placeholder="Ghi chú..."
          onChange={e => updateLine(record.key, 'note', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: '',
      width: 48,
      render: (_, record) => (
        <Tooltip title="Xóa dòng">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => removeLine(record.key)}
          />
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
                onClick={() => navigate('/inbound')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImportOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>Tạo phiếu nhập kho</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Khai báo thông tin nhập kho — Trung tâm Hà Nội</Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left: Basic info */}
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<InboxOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Thông tin phiếu nhập"
            />
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                type: 'purchase',
                sourceType: 'Nhà cung cấp',
                expectedDate: dayjs().add(7, 'day'),
                qcRequired: true,
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Loại nhập kho"
                    name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại nhập kho' }]}
                  >
                    <Select options={inboundTypeOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Kho nhận"
                    name="warehouseId"
                    rules={[{ required: true, message: 'Vui lòng chọn kho nhận' }]}
                  >
                    <Select options={warehouseOptions} placeholder="Chọn kho..." showSearch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Loại nguồn"
                    name="sourceType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại nguồn' }]}
                  >
                    <Select options={sourceTypeOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên nguồn cung cấp"
                    name="sourceName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nguồn' }]}
                  >
                    <Input placeholder="VD: Bosch Rexroth, Trung tâm PX1..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Mã tham chiếu (HĐ/Lệnh SX)" name="referenceCode">
                    <Input placeholder="VD: PO-2026-018, HĐ-2025-045..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ngày dự kiến nhận"
                    name="expectedDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Yêu cầu kiểm tra chất lượng" name="qcRequired">
                    <Select
                      options={[
                        { value: true, label: 'Có — Yêu cầu kiểm tra CL' },
                        { value: false, label: 'Không — Nhập thẳng' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm về phiếu nhập..." />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Product lines */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #52c41a, #73d13d)"
              icon={<PlusOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title={`Danh sách vật tư nhập kho${lines.length > 0 ? ` (${lines.length} dòng)` : ''}`}
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
                options={productOptions}
                placeholder="Tìm và chọn vật tư..."
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ flex: 1 }}
                optionLabelProp="label"
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
              scroll={{ x: 900 }}
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
              icon={<ImportOutlined style={{ color: '#0a1628', fontSize: 13 }} />}
              title="Tóm tắt phiếu nhập"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#f8f9ff', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tổng số vật tư (loại)</Text>
                <Text strong style={{ fontSize: 22, color: colors.navy }}>{lines.length}</Text>
                <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>vật tư</Text>
              </div>
              <div style={{ padding: '12px 14px', background: '#f8f9ff', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tổng số lượng dự kiến</Text>
                <Text strong style={{ fontSize: 22, color: '#52c41a' }}>{totalItems.toLocaleString('vi-VN')}</Text>
                <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>đơn vị</Text>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Trạng thái ban đầu</Text>
                <Tag color="default" style={{ fontSize: 13, padding: '2px 10px' }}>Nháp</Tag>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Quy trình xử lý</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Tạo phiếu (Nháp)', 'Chờ nhận hàng', 'Đang nhận', 'Kiểm tra CL', 'Hoàn thành'].map((step, i) => (
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

              <Divider style={{ margin: '4px 0' }} />

              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                block
                size="large"
                style={{ background: colors.navy }}
              >
                Lưu phiếu nhập kho
              </Button>
              <Button block onClick={() => navigate('/inbound')}>
                Hủy bỏ
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Action Buttons ─────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row justify="end">
          <Col>
            <Space size={12}>
              <Button onClick={() => navigate('/inbound')}>Hủy</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}
              >
                Lưu phiếu nhập
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InboundForm;
