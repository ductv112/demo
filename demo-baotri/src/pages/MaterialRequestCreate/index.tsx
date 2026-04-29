import React, { useState } from 'react';
import {
  Card, Form, Input, Select, InputNumber, Button, Row, Col,
  Typography, Space, Divider, Table, Tag, message, Breadcrumb,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined,
  SaveOutlined, SendOutlined, ShoppingCartOutlined,
  WarningOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { sparePartInventory } from '../../data/spareParts';
import { maintenanceWorkOrders } from '../../data/maintenanceWorkOrders';
import { maintenancePlans } from '../../data/maintenancePlans';
import { equipmentList } from '../../data/equipment';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface MaterialLineRow {
  key: string;
  productId: string;
  partCode: string;
  partName: string;
  unit: string;
  requestedQty: number;
  qtyAvailable: number;
  warehouseName: string;
  trackingType: string;
}

// Warehouse options (derived from spare parts)
const warehouseOptions = [...new Set(sparePartInventory.map(p => JSON.stringify({ id: p.warehouseId, name: p.warehouseName })))].map(s => JSON.parse(s));

const MaterialRequestCreate: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [form] = Form.useForm();
  const [lines, setLines] = useState<MaterialLineRow[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>();

  // Vật tư khả dụng theo kho đã chọn
  const availableParts = selectedWarehouse
    ? sparePartInventory.filter(p => p.warehouseId === selectedWarehouse)
    : sparePartInventory;

  // PO đang thực hiện (để liên kết)
  const activePOs = maintenanceWorkOrders.filter(po => ['assigned', 'in_progress'].includes(po.status));

  // ─── Line CRUD ─────────────────────────────────────────────────
  const handleAddLine = () => {
    setLines([...lines, {
      key: `ln-${Date.now()}`, productId: '', partCode: '', partName: '', unit: '',
      requestedQty: 1, qtyAvailable: 0, warehouseName: '', trackingType: 'none',
    }]);
  };

  const handleRemoveLine = (key: string) => {
    setLines(lines.filter(l => l.key !== key));
  };

  const handleSelectPart = (key: string, productId: string) => {
    const part = sparePartInventory.find(p => p.productId === productId);
    if (!part) return;
    setLines(lines.map(l => l.key !== key ? l : {
      ...l, productId, partCode: part.partCode, partName: part.partName,
      unit: part.unit, qtyAvailable: part.availableStock,
      warehouseName: part.warehouseName || '', trackingType: part.trackingType,
    }));
  };

  const handleQtyChange = (key: string, qty: number) => {
    setLines(lines.map(l => l.key !== key ? l : { ...l, requestedQty: qty }));
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSave = (isDraft: boolean) => {
    if (lines.length === 0) { message.warning('Vui lòng thêm ít nhất 1 dòng vật tư'); return; }
    if (lines.some(l => !l.productId)) { message.warning('Vui lòng chọn vật tư cho tất cả dòng'); return; }

    form.validateFields().then(values => {
      const data = {
        ...values, type: 'issue', status: isDraft ? 'draft' : 'submitted',
        requestedBy: currentUser.name, departmentId: currentUser.departmentId, departmentName: currentUser.departmentName,
        lines: lines.map(l => ({ productId: l.productId, partCode: l.partCode, partName: l.partName, unit: l.unit, requestedQty: l.requestedQty, qtyAvailable: l.qtyAvailable })),
        totalItems: lines.length,
      };
      console.log('Material request:', data);
      message.success(isDraft ? 'Đã lưu bản nháp yêu cầu vật tư' : 'Đã gửi yêu cầu vật tư');
      navigate('/material-requests');
    }).catch(() => message.error('Vui lòng điền đầy đủ thông tin bắt buộc'));
  };

  const totalQty = lines.reduce((s, l) => s + l.requestedQty, 0);
  const hasStockWarning = lines.some(l => l.productId && l.requestedQty > l.qtyAvailable);

  // ─── Line columns ──────────────────────────────────────────────
  const lineColumns: ColumnsType<MaterialLineRow> = [
    { title: 'STT', width: 45, align: 'center', render: (_: unknown, __: MaterialLineRow, i: number) => i + 1 },
    {
      title: 'Vật tư', key: 'part',
      render: (_: unknown, record: MaterialLineRow) => (
        <Select
          showSearch size="small" placeholder="Chọn vật tư từ kho..."
          optionFilterProp="label" style={{ width: '100%' }}
          value={record.productId || undefined}
          onChange={v => handleSelectPart(record.key, v)}
          options={availableParts.map(p => ({
            value: p.productId || p.id,
            label: `${p.partCode} — ${p.partName} (tồn: ${p.availableStock} ${p.unit})`,
          }))}
        />
      ),
    },
    {
      title: 'Tồn KD', key: 'stock', width: 80, align: 'center',
      render: (_: unknown, r: MaterialLineRow) => {
        if (!r.productId) return <Text type="secondary">—</Text>;
        const isLow = r.qtyAvailable < r.requestedQty;
        return (
          <Text style={{ color: isLow ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
            {r.qtyAvailable}
          </Text>
        );
      },
    },
    {
      title: 'SL yêu cầu', key: 'qty', width: 100, align: 'center',
      render: (_: unknown, r: MaterialLineRow) => (
        <InputNumber size="small" min={1} value={r.requestedQty} style={{ width: '100%' }}
          onChange={v => handleQtyChange(r.key, v || 1)}
          status={r.productId && r.requestedQty > r.qtyAvailable ? 'warning' : undefined} />
      ),
    },
    {
      title: 'ĐVT', key: 'unit', width: 60, align: 'center',
      render: (_: unknown, r: MaterialLineRow) => r.unit || '—',
    },
    {
      title: 'Theo dõi', key: 'tracking', width: 90, align: 'center',
      render: (_: unknown, r: MaterialLineRow) => {
        if (!r.productId) return '—';
        if (r.trackingType === 'serial') return <Tag color="success" style={{ fontSize: 11 }}>Serial</Tag>;
        if (r.trackingType === 'lot') return <Tag color="processing" style={{ fontSize: 11 }}>Lô</Tag>;
        return <Tag style={{ fontSize: 11 }}>—</Tag>;
      },
    },
    {
      title: 'Trạng thái', key: 'status', width: 95, align: 'center',
      render: (_: unknown, r: MaterialLineRow) => {
        if (!r.productId) return '—';
        if (r.qtyAvailable === 0) return <Tag color="error"><WarningOutlined /> Hết</Tag>;
        if (r.requestedQty > r.qtyAvailable) return <Tag color="warning"><WarningOutlined /> Thiếu</Tag>;
        return <Tag color="success"><CheckCircleOutlined /> Đủ</Tag>;
      },
    },
    {
      title: '', width: 40, align: 'center',
      render: (_: unknown, r: MaterialLineRow) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveLine(r.key)} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <Breadcrumb items={[
        { title: 'Tổng quan' },
        { title: <a onClick={() => navigate('/material-requests')}>Quản lý vật tư</a> },
        { title: 'Tạo yêu cầu' },
      ]} style={{ marginBottom: 8 }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
            <ShoppingCartOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Tạo yêu cầu cấp phát vật tư</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Chọn vật tư từ kho, kiểm tra tồn kho khả dụng, gửi yêu cầu cấp phát</Text>
          </div>
        </div>
        <Space>
          <Button icon={<SaveOutlined />} onClick={() => handleSave(true)}>Lưu nháp</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={() => handleSave(false)} style={{ background: '#1B3A5C' }}>Gửi yêu cầu</Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/material-requests')}>Quay lại</Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        {/* Card 1: Thông tin chung */}
        <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item label="Kho xuất" name="warehouseId" rules={[{ required: true, message: 'Chọn kho' }]}>
                <Select placeholder="Chọn kho xuất" onChange={v => { setSelectedWarehouse(v); setLines([]); }}
                  options={warehouseOptions.map((w: { id: string; name: string }) => ({ value: w.id, label: w.name }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Liên kết WO" name="poId">
                <Select placeholder="Chọn WO (tùy chọn)" allowClear showSearch optionFilterProp="label"
                  onChange={v => {
                    const po = maintenanceWorkOrders.find(p => p.id === v);
                    if (po) { form.setFieldValue('equipmentId', po.equipmentId); }
                  }}
                  options={activePOs.map(po => ({ value: po.id, label: `${po.code} — ${po.workItemName}` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Thiết bị liên quan" name="equipmentId">
                <Select placeholder="Chọn thiết bị (tùy chọn)" allowClear showSearch optionFilterProp="label"
                  options={equipmentList.map(e => ({ value: e.id, label: `${e.code} — ${e.name}` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Liên kết KH" name="planId">
                <Select placeholder="Chọn KH (tùy chọn)" allowClear showSearch optionFilterProp="label"
                  options={maintenancePlans.filter(p => ['approved', 'in_progress'].includes(p.status)).map(p => ({ value: p.id, label: `${p.code} — ${p.name}` }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Ghi chú" name="notes" style={{ marginBottom: 0 }}>
            <TextArea rows={2} placeholder="Lý do yêu cầu, ghi chú đặc biệt..." />
          </Form.Item>
        </Card>

        {/* Card 2: Danh sách vật tư */}
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #722ed1, #b37feb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>
                  <ShoppingCartOutlined />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Danh sách vật tư yêu cầu</Text>
                {lines.length > 0 && (
                  <Space size={6}>
                    <Tag color="processing">{lines.length} dòng</Tag>
                    <Tag>{totalQty} đơn vị</Tag>
                    {hasStockWarning && <Tag color="warning"><WarningOutlined /> Có vật tư thiếu tồn</Tag>}
                  </Space>
                )}
              </Space>
              <Button icon={<PlusOutlined />} onClick={handleAddLine} disabled={!selectedWarehouse}>
                Thêm vật tư
              </Button>
            </div>
          }
          style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

          {!selectedWarehouse ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <ShoppingCartOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 12 }} />
              <div><Text type="secondary">Vui lòng chọn <Text strong>Kho xuất</Text> ở trên trước khi thêm vật tư.</Text></div>
            </div>
          ) : lines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <ShoppingCartOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 12 }} />
              <div><Text type="secondary">Chưa có vật tư. Hệ thống sẽ kiểm tra tồn kho khả dụng khi bạn chọn.</Text></div>
              <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 12 }} onClick={handleAddLine}>Thêm vật tư đầu tiên</Button>
            </div>
          ) : (
            <>
              <Table columns={lineColumns} dataSource={lines} rowKey="key" pagination={false} size="small" />
              <div style={{ padding: '8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddLine}>Thêm vật tư</Button>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary" style={{ fontSize: 12 }}><Text strong>{lines.length}</Text> dòng</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng: <Text strong>{totalQty}</Text> đơn vị</Text>
                  {hasStockWarning && <Text type="warning" style={{ fontSize: 12 }}><WarningOutlined /> Một số vật tư thiếu tồn kho</Text>}
                </Space>
              </div>
            </>
          )}
        </Card>
      </Form>
    </div>
  );
};

export default MaterialRequestCreate;
