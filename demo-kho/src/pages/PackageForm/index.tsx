import React, { useState } from 'react';
import {
  Card, Form, Input, Select, Button, Space, Typography, Row, Col,
  InputNumber, Table, Divider, App,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, BoxPlotOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { PackageType } from '../../types';
import { products } from '../../data/products';
import { warehouses } from '../../data/warehouses';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Types ─────────────────────────────────────────────────
const typeOptions: { value: PackageType; label: string }[] = [
  { value: 'thùng',     label: 'Thùng' },
  { value: 'pallet',    label: 'Pallet' },
  { value: 'container', label: 'Container' },
  { value: 'kiện',      label: 'Kiện' },
  { value: 'túi',       label: 'Túi' },
];

interface LineItem {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
}

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const PackageForm: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [addProductId, setAddProductId] = useState<string | undefined>();
  const [addQty, setAddQty] = useState<number>(1);

  // ── Add line ──────────────────────────────────────────────
  const addLine = () => {
    if (!addProductId) return;
    if (lines.some(l => l.productId === addProductId)) {
      message.warning('Vật tư này đã được thêm vào danh sách');
      return;
    }
    const prod = products.find(p => p.id === addProductId);
    if (!prod) return;
    setLines(prev => [...prev, {
      key: addProductId,
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      unit: prod.baseUnit,
      qty: addQty,
    }]);
    setAddProductId(undefined);
    setAddQty(1);
  };

  const removeLine = (key: string) => {
    setLines(prev => prev.filter(l => l.key !== key));
  };

  const updateQty = (key: string, qty: number) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, qty } : l));
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (values: {
    type: PackageType;
    warehouseId?: string;
    locationCode?: string;
    totalWeight?: number;
    dimensions?: string;
    note?: string;
  }) => {
    if (lines.length === 0) {
      message.error('Vui lòng thêm ít nhất 1 vật tư vào kiện hàng');
      return;
    }
    console.log('Create package:', { ...values, items: lines });
    message.success('Tạo kiện hàng thành công!');
    navigate('/packages');
  };

  // ── Line table columns ────────────────────────────────────
  const lineColumns: ColumnsType<LineItem> = [
    {
      title: 'Mã',
      dataIndex: 'productCode',
      width: 120,
      render: (v: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      width: 80,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Số lượng',
      key: 'qty',
      width: 120,
      render: (_: unknown, r: LineItem) => (
        <InputNumber
          min={1}
          value={r.qty}
          onChange={v => v && updateQty(r.key, v)}
          size="small"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: '',
      key: 'del',
      width: 48,
      render: (_: unknown, r: LineItem) => (
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeLine(r.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ─── Header Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/packages')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }} />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BoxPlotOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>Tạo kiện hàng mới</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Đóng gói vật tư thành kiện hàng để vận chuyển hoặc lưu kho</Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[20, 20]}>
        {/* ── Left: form ── */}
        <Col xs={24} lg={16}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* Thông tin cơ bản */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
                icon={<BoxPlotOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thông tin kiện hàng"
              />
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Loại bao bì"
                    name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại bao bì' }]}
                  >
                    <Select placeholder="Chọn loại bao bì" options={typeOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Khối lượng (kg)" name="totalWeight">
                    <InputNumber
                      min={0}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="VD: 12.5"
                      addonAfter="kg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Kích thước" name="dimensions">
                    <Input placeholder="VD: 1200x800x400mm" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Kho lưu trữ */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #237804, #52c41a)"
                icon={<BoxPlotOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Kho lưu trữ (tuỳ chọn)"
              />
              <Row gutter={16}>
                <Col xs={24} sm={14}>
                  <Form.Item label="Kho" name="warehouseId">
                    <Select
                      placeholder="Chọn kho (để trống nếu đang vận chuyển)"
                      allowClear
                      options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={10}>
                  <Form.Item label="Mã vị trí" name="locationCode">
                    <Input placeholder="VD: A-03-08" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Vật tư trong kiện */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1677ff, #40a9ff)"
                icon={<PlusOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Vật tư trong kiện"
              />
              {/* Add line row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <Select
                  showSearch
                  placeholder="Tìm và chọn vật tư..."
                  style={{ flex: 1, minWidth: 240 }}
                  value={addProductId}
                  onChange={v => setAddProductId(v)}
                  filterOption={(input, opt) =>
                    (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={products.map(p => ({
                    value: p.id,
                    label: `[${p.code}] ${p.name}`,
                  }))}
                />
                <InputNumber
                  min={1}
                  value={addQty}
                  onChange={v => setAddQty(v ?? 1)}
                  style={{ width: 100 }}
                  placeholder="SL"
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={addLine}
                  disabled={!addProductId}
                  style={{ borderColor: '#1B3A5C', color: '#1B3A5C' }}
                >
                  Thêm
                </Button>
              </div>

              <Table
                columns={lineColumns}
                dataSource={lines}
                rowKey="key"
                size="small"
                pagination={false}
                locale={{ emptyText: 'Chưa có vật tư nào. Thêm vật tư ở trên.' }}
                summary={() =>
                  lines.length > 0 ? (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                      <Table.Summary.Cell index={3}>
                        <Text strong style={{ color: '#1B3A5C' }}>
                          {lines.reduce((s, l) => s + l.qty, 0).toLocaleString('vi-VN')} đơn vị
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} />
                    </Table.Summary.Row>
                  ) : null
                }
              />
            </Card>

            {/* Ghi chú */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <Form.Item label="Ghi chú" name="note" style={{ marginBottom: 0 }}>
                <TextArea rows={3} placeholder="Mô tả mục đích, nguồn gốc kiện hàng..." />
              </Form.Item>
            </Card>
          </Form>
        </Col>

        {/* ── Right: hướng dẫn ── */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Text strong style={{ color: '#1B3A5C', fontSize: 14, display: 'block', marginBottom: 12 }}>
              Hướng dẫn
            </Text>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: 12 }}>Loại bao bì</Text>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li><Text style={{ fontSize: 12 }}><b>Thùng</b> — thùng carton / gỗ</Text></li>
                  <li><Text style={{ fontSize: 12 }}><b>Pallet</b> — nhiều thùng trên pallet</Text></li>
                  <li><Text style={{ fontSize: 12 }}><b>Container</b> — container vận chuyển</Text></li>
                  <li><Text style={{ fontSize: 12 }}><b>Kiện</b> — bọc màng co / đóng đai</Text></li>
                  <li><Text style={{ fontSize: 12 }}><b>Túi</b> — túi nilon / túi chân không</Text></li>
                </ul>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text strong style={{ fontSize: 12 }}>Kho lưu trữ</Text>
                <Text style={{ fontSize: 12, display: 'block', marginTop: 4, color: '#666' }}>
                  Để trống nếu kiện hàng đang trên đường vận chuyển, chưa nhập kho.
                </Text>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text strong style={{ fontSize: 12 }}>Vật tư</Text>
                <Text style={{ fontSize: 12, display: 'block', marginTop: 4, color: '#666' }}>
                  Một kiện hàng có thể chứa nhiều loại vật tư. Số lượng tính theo đơn vị tính chuẩn của từng vật tư.
                </Text>
              </div>
            </Space>
          </Card>

          <Card
            style={{ borderRadius: 14, background: '#f0f7ff', border: '1px solid #bae0ff' }}
            styles={{ body: { padding: '14px 16px' } }}
          >
            <Text strong style={{ color: '#1677ff', fontSize: 13 }}>Trạng thái ban đầu</Text>
            <Text style={{ fontSize: 12, display: 'block', marginTop: 6, color: '#444' }}>
              Kiện hàng mới tạo sẽ mặc định ở trạng thái <b>Trong kho</b> nếu có kho gán, hoặc <b>Đang vận chuyển</b> nếu chưa gán kho.
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ── Bottom action card ── */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 20 }}
        styles={{ body: { padding: '16px 24px' } }}>
        <Row justify="end">
          <Col>
            <Space size={12}>
              <Button onClick={() => navigate('/packages')}>Hủy</Button>
              <Button type="primary" onClick={() => form.submit()}
                style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
                Tạo kiện hàng
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PackageForm;
