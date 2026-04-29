import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col,
  Form, Input, Select, Table, InputNumber,
  Divider, message, Tag, Tooltip, Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined, SwapOutlined, SaveOutlined,
  PlusOutlined, DeleteOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { warehouses } from '../../data/warehouses';
import { products } from '../../data/products';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

interface LineItem {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
  lotNumber: string;
  note: string;
}

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const StockTransferForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [fromWarehouseId, setFromWarehouseId] = useState<string>('');
  const [toWarehouseId, setToWarehouseId] = useState<string>('');

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

  const totalQty = useMemo(
    () => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
    [lines],
  );

  const fromWarehouseName = warehouses.find(w => w.id === fromWarehouseId)?.name;
  const toWarehouseName = warehouses.find(w => w.id === toWarehouseId)?.name;
  const sameWarehouse = fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId;

  const addLine = () => {
    if (!selectedProductId) { message.warning('Vui lòng chọn vật tư trước'); return; }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    if (lines.find(l => l.productId === selectedProductId)) {
      message.warning('Vật tư này đã có trong danh sách');
      return;
    }
    setLines(prev => [...prev, {
      key: `line-${Date.now()}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      unit: product.baseUnit,
      qty: 1,
      lotNumber: '',
      note: '',
    }]);
    setSelectedProductId('');
  };

  const removeLine = (key: string) => setLines(prev => prev.filter(l => l.key !== key));

  const updateLine = (key: string, field: keyof LineItem, value: string | number) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l));
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (sameWarehouse) { message.error('Kho xuất và kho nhận không được trùng nhau'); return; }
      if (lines.length === 0) { message.warning('Vui lòng thêm ít nhất một vật tư'); return; }
      message.success('Tạo phiếu điều chuyển thành công');
      navigate('/transfers');
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const columns: ColumnsType<LineItem> = [
    {
      title: 'STT', width: 50,
      render: (_, __, index) => <Text type="secondary" style={{ fontSize: 13 }}>{index + 1}</Text>,
    },
    {
      title: 'Mã vật tư', dataIndex: 'productCode', width: 140,
      render: (code) => <Tag color="cyan" style={{ fontFamily: 'monospace' }}>{code}</Tag>,
    },
    {
      title: 'Tên vật tư', dataIndex: 'productName',
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'ĐVT', dataIndex: 'unit', width: 80,
      render: (unit) => <Text type="secondary" style={{ fontSize: 13 }}>{unit}</Text>,
    },
    {
      title: 'Số lượng', dataIndex: 'qty', width: 140,
      render: (qty, record) => (
        <InputNumber min={1} value={qty}
          onChange={val => updateLine(record.key, 'qty', val ?? 1)}
          style={{ width: '100%' }} size="small"
        />
      ),
    },
    {
      title: 'Số lô / Serial', dataIndex: 'lotNumber', width: 160,
      render: (lot, record) => (
        <Input value={lot} placeholder="Số lô..."
          onChange={e => updateLine(record.key, 'lotNumber', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Ghi chú', dataIndex: 'note',
      render: (note, record) => (
        <Input value={note} placeholder="Ghi chú..."
          onChange={e => updateLine(record.key, 'note', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: '', width: 48,
      render: (_, record) => (
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
                onClick={() => navigate(-1)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SwapOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>Tạo phiếu điều chuyển</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Điều chuyển vật tư giữa các kho — Trung tâm Hà Nội</Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      {sameWarehouse && (
        <Alert
          type="error"
          message="Kho xuất và kho nhận không được trùng nhau. Vui lòng chọn lại."
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {/* Warehouse selection — visual highlight */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<SwapOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Thông tin điều chuyển"
            />
            <Form form={form} layout="vertical">
              {/* From → To warehouse visual */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
                padding: '16px', background: '#faf5ff', borderRadius: 10, border: '1px solid #d3adf7',
              }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label={<Text strong style={{ color: '#722ed1' }}>Kho xuất (nguồn)</Text>}
                    name="fromWarehouseId"
                    rules={[{ required: true, message: 'Vui lòng chọn kho xuất' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      options={warehouseOptions} placeholder="Chọn kho xuất..." showSearch
                      onChange={val => setFromWarehouseId(val)}
                      status={sameWarehouse ? 'error' : undefined}
                    />
                  </Form.Item>
                  {fromWarehouseName && (
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                      {fromWarehouseName}
                    </Text>
                  )}
                </div>
                <div style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 22,
                  background: 'linear-gradient(135deg, #722ed1, #9254de)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(114,46,209,0.3)',
                }}>
                  <SwapOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label={<Text strong style={{ color: '#52c41a' }}>Kho nhận (đích)</Text>}
                    name="toWarehouseId"
                    rules={[{ required: true, message: 'Vui lòng chọn kho nhận' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      options={warehouseOptions} placeholder="Chọn kho nhận..." showSearch
                      onChange={val => setToWarehouseId(val)}
                      status={sameWarehouse ? 'error' : undefined}
                    />
                  </Form.Item>
                  {toWarehouseName && (
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                      {toWarehouseName}
                    </Text>
                  )}
                </div>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Lý do điều chuyển" name="reason"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do điều chuyển' }]}
                  >
                    <Select
                      options={[
                        { value: 'Cân đối tồn kho', label: 'Cân đối tồn kho' },
                        { value: 'Phục vụ sản xuất', label: 'Phục vụ sản xuất' },
                        { value: 'Phục vụ sửa chữa', label: 'Phục vụ sửa chữa' },
                        { value: 'Tối ưu lưu trữ', label: 'Tối ưu lưu trữ' },
                        { value: 'Theo lệnh', label: 'Theo lệnh' },
                        { value: 'Khác', label: 'Khác' },
                      ]}
                      placeholder="Chọn lý do..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Mã tham chiếu" name="referenceCode">
                    <Input placeholder="VD: QĐ-2026-012, LSX-2026-0058..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
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
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<PlusOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title={`Danh sách vật tư điều chuyển${lines.length > 0 ? ` (${lines.length} dòng)` : ''}`}
            />
            <div style={{
              display: 'flex', gap: 10, marginBottom: 16, padding: '12px 14px',
              background: '#faf5ff', borderRadius: 8, border: '1px dashed #d3adf7',
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
                style={{ background: '#722ed1', borderColor: '#722ed1' }}
              >
                Thêm dòng
              </Button>
            </div>
            <Table
              dataSource={lines} columns={columns} rowKey="key"
              pagination={false} size="small" scroll={{ x: 900 }}
              locale={{ emptyText: 'Chưa có vật tư nào. Chọn vật tư ở trên và nhấn "Thêm dòng".' }}
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
              icon={<SwapOutlined style={{ color: '#0a1628', fontSize: 13 }} />}
              title="Tóm tắt điều chuyển"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {fromWarehouseName && toWarehouseName && (
                <div style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: sameWarehouse ? '#fff1f0' : '#faf5ff',
                  border: `1px solid ${sameWarehouse ? '#ffccc7' : '#d3adf7'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <Text strong style={{ color: '#722ed1' }}>{fromWarehouseName}</Text>
                    <SwapOutlined style={{ color: sameWarehouse ? '#ff4d4f' : '#722ed1' }} />
                    <Text strong style={{ color: '#52c41a' }}>{toWarehouseName}</Text>
                  </div>
                </div>
              )}
              <div style={{ padding: '12px 14px', background: '#faf5ff', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Số loại vật tư</Text>
                <Text strong style={{ fontSize: 22, color: '#722ed1' }}>{lines.length}</Text>
                <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>loại</Text>
              </div>
              <div style={{ padding: '12px 14px', background: '#faf5ff', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tổng số lượng</Text>
                <Text strong style={{ fontSize: 22, color: colors.navy }}>{totalQty.toLocaleString('vi-VN')}</Text>
                <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>đơn vị</Text>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: '#f6ffed', border: '1px solid #b7eb8f',
              }}>
                <Space>
                  <InfoCircleOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ fontSize: 12, color: '#555' }}>
                    Điều chuyển cần được phê duyệt trước khi thực hiện
                  </Text>
                </Space>
              </div>
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
              <Button onClick={() => navigate(-1)}>Hủy</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}
                style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}
                disabled={!!sameWarehouse}
              >
                Lưu phiếu
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StockTransferForm;
