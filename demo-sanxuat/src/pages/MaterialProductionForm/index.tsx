import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col, Empty, Table, Tag, Checkbox,
  Form, Input, InputNumber, Select, DatePicker, message,
} from 'antd';
import {
  ArrowLeftOutlined, ExperimentOutlined, PlusOutlined, SaveOutlined,
  SearchOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { productionOrders } from '../../data/productionOrders';
import { bomItems } from '../../data/productStructures';
import { priorityConfig } from '../../utils/format';

const { Text, Title } = Typography;

// Mock tồn kho — trong thực tế lấy từ module Kho
const mockInventory: Record<string, number> = {
  'MG-001': 6, 'MC-001': 3, 'TN-001': 8, 'BM-KD': 5, 'BL-001': 4,
  'ADC-001': 2, 'RF-001': 20, 'CB-001': 15, 'VH-001': 0,
  'PCB-W': 12, 'IC-XL': 8, 'TD-002': 100, 'DT-002': 200,
  'BA-AC': 1, 'MOS-01': 10, 'TD-CS': 3, 'IC-PWM': 5, 'CC-BV': 20,
  'BM-P37': 0, 'RF-P37': 8, 'MG-P37': 2, 'OG-P37': 5, 'VH-P37': 1,
};

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Monitoring' },
  { value: 'PX2', label: 'PX2 - Cluster' },
  { value: 'PX3', label: 'PX3 - Hạ tầng' },
  { value: 'PX4', label: 'PX4 - Phát triển PM' },
];

// Gợi ý trung tâm theo loại vật tư
const suggestWorkshop = (code: string, name: string): string => {
  const lower = (code + name).toLowerCase();
  if (lower.includes('bm-') || lower.includes('bo mạch') || lower.includes('pcb') || lower.includes('ic') || lower.includes('tụ') || lower.includes('điện trở') || lower.includes('cáp') || lower.includes('adc') || lower.includes('cầu chì')) return 'PX4';
  if (lower.includes('vh-') || lower.includes('vỏ') || lower.includes('khung') || lower.includes('rf-') || lower.includes('đầu nối') || lower.includes('tản nhiệt')) return 'PX3';
  return 'PX4';
};

interface BomNeedRow {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  needed: number;
  inStock: number;
  shortage: number;
  selected: boolean;
  produceQty: number;
  workshopId: string;
}

const MaterialProductionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
  const [bomNeeds, setBomNeeds] = useState<BomNeedRow[]>([]);

  // Lệnh SX đang chạy/sẵn sàng — nguồn nhu cầu
  const sourceOrders = useMemo(() =>
    productionOrders.filter(o =>
      o.status === 'in_progress' || o.status === 'ready' || o.status === 'pending_material'
    ), []);

  // Khi chọn nguồn yêu cầu → tính nhu cầu vật tư
  const handleSourceChange = (orderId: string) => {
    setSelectedSource(orderId);
    const order = productionOrders.find(o => o.id === orderId);
    if (!order) return;

    // Lấy BOM items cho sản phẩm
    const items = bomItems.filter(bi => bi.bomId === order.productId);
    const needs: BomNeedRow[] = items.map(bi => {
      const needed = bi.quantity * order.quantity;
      const inStock = mockInventory[bi.materialCode] || 0;
      const shortage = Math.max(0, needed - inStock);
      return {
        id: bi.id,
        materialCode: bi.materialCode,
        materialName: bi.materialName,
        specification: bi.specification,
        unit: bi.unit,
        needed,
        inStock,
        shortage,
        selected: shortage > 0,
        produceQty: shortage,
        workshopId: suggestWorkshop(bi.materialCode, bi.materialName),
      };
    });
    setBomNeeds(needs);
  };

  const toggleSelect = (id: string) => {
    setBomNeeds(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const updateProduceQty = (id: string, qty: number) => {
    setBomNeeds(prev => prev.map(r => r.id === id ? { ...r, produceQty: qty } : r));
  };

  const updateWorkshop = (id: string, workshopId: string) => {
    setBomNeeds(prev => prev.map(r => r.id === id ? { ...r, workshopId } : r));
  };

  const selectedItems = bomNeeds.filter(r => r.selected && r.produceQty > 0);

  const handleSave = () => {
    form.validateFields().then(values => {
      if (selectedItems.length === 0) {
        message.warning('Vui lòng chọn ít nhất 1 vật tư cần sản xuất');
        return;
      }
      console.log('Tạo lệnh SX vật tư:', { ...values, items: selectedItems });
      message.success(`Đã tạo ${selectedItems.length} lệnh sản xuất vật tư`);
      navigate('/material-production');
    });
  };

  const sourceOrder = productionOrders.find(o => o.id === selectedSource);

  const columns: ColumnsType<BomNeedRow> = [
    {
      title: '', width: 40, align: 'center',
      render: (_: unknown, r: BomNeedRow) => (
        <Checkbox checked={r.selected} onChange={() => toggleSelect(r.id)} />
      ),
    },
    {
      title: 'Mã vật tư', dataIndex: 'materialCode', width: 100,
      render: (v: string) => <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C' }}>{v}</Text>,
    },
    { title: 'Tên vật tư', dataIndex: 'materialName', width: 200 },
    {
      title: 'Quy cách', dataIndex: 'specification', width: 160,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    { title: 'Đơn vị tính', dataIndex: 'unit', width: 70, align: 'center' },
    {
      title: 'Nhu cầu', dataIndex: 'needed', width: 80, align: 'right',
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Tồn kho', dataIndex: 'inStock', width: 80, align: 'right',
      render: (v: number) => <Text style={{ color: v > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: 'Thiếu', dataIndex: 'shortage', width: 70, align: 'right',
      render: (v: number) => v > 0
        ? <Text style={{ color: '#ff4d4f', fontWeight: 700 }}>{v}</Text>
        : <Text type="secondary">0</Text>,
    },
    {
      title: 'Số lượng sản xuất', width: 110, align: 'center',
      render: (_: unknown, r: BomNeedRow) => (
        <InputNumber size="small" min={0} value={r.produceQty} style={{ width: 75 }}
          disabled={!r.selected}
          onChange={(v) => updateProduceQty(r.id, v ?? 0)} />
      ),
    },
    {
      title: 'Trung tâm', width: 130,
      render: (_: unknown, r: BomNeedRow) => (
        <Select size="small" value={r.workshopId} style={{ width: 120 }}
          disabled={!r.selected}
          onChange={(v) => updateWorkshop(r.id, v)}
          options={workshopOptions} />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <Row align="middle">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/material-production')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Tạo lệnh sản xuất vật tư</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Phân tích nhu cầu → Đối chiếu tồn kho → Tạo lệnh</div>
                  </div>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Bước 1: Chọn nguồn nhu cầu */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SearchOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Bước 1: Chọn nguồn nhu cầu</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            Chọn lệnh sản xuất, yêu cầu sửa chữa hoặc đại tu cần vật tư
          </Text>
        </div>

        <Select
          placeholder="Chọn lệnh sản xuất cần vật tư..."
          style={{ width: '100%' }}
          showSearch
          value={selectedSource}
          onChange={handleSourceChange}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          options={sourceOrders.map(o => ({
            value: o.id,
            label: `${o.code} — ${o.productName} (${o.completedQty}/${o.quantity}, ${o.status === 'in_progress' ? 'Đang SX' : o.status === 'pending_material' ? 'Chờ vật tư' : 'Sẵn sàng'})`,
          }))}
        />

        {sourceOrder && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0f7ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Text type="secondary" style={{ fontSize: 11 }}>Sản phẩm</Text>
                <div style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{sourceOrder.productName}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary" style={{ fontSize: 11 }}>BOM</Text>
                <div><Tag style={{ fontFamily: 'monospace' }}>{sourceOrder.bomVersion}</Tag></div>
              </Col>
              <Col span={4}>
                <Text type="secondary" style={{ fontSize: 11 }}>Số lượng SX</Text>
                <div style={{ fontWeight: 600, color: '#1B3A5C' }}>{sourceOrder.quantity}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary" style={{ fontSize: 11 }}>Trung tâm</Text>
                <div style={{ fontSize: 12 }}>{sourceOrder.workshopName}</div>
              </Col>
              <Col span={6}>
                <Text type="secondary" style={{ fontSize: 11 }}>Trạng thái</Text>
                <div><Tag color={sourceOrder.status === 'pending_material' ? 'warning' : 'processing'}>
                  {sourceOrder.status === 'in_progress' ? 'Đang sản xuất' : sourceOrder.status === 'pending_material' ? 'Chờ vật tư' : 'Sẵn sàng'}
                </Tag></div>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Bước 2+3: Nhu cầu vật tư + Đối chiếu tồn kho */}
      {bomNeeds.length > 0 && (
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
          <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ExperimentOutlined style={{ color: '#0a1628', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Bước 2: Nhu cầu vật tư & Đối chiếu tồn kho</Text>
            </Space>
            <Space>
              {bomNeeds.filter(r => r.shortage > 0).length > 0 && (
                <Tag color="error" icon={<WarningOutlined />}>
                  {bomNeeds.filter(r => r.shortage > 0).length} vật tư thiếu
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đã chọn {selectedItems.length} vật tư để sản xuất
              </Text>
            </Space>
          </div>

          <Table<BomNeedRow>
            dataSource={bomNeeds}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={false}
            rowClassName={(r) => r.shortage > 0 ? 'row-shortage' : ''}
          />

          <style>{`
            .row-shortage td { background: rgba(255,77,79,0.03) !important; }
          `}</style>
        </Card>
      )}

      {/* Bước 4: Thông tin lệnh SX vật tư */}
      {selectedItems.length > 0 && (
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SaveOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Bước 3: Thông tin lệnh sản xuất</Text>
            </Space>
          </div>

          <Form form={form} layout="vertical" requiredMark="optional">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Ưu tiên" name="priority" initialValue="normal" rules={[{ required: true }]}>
                  <Select options={Object.entries(priorityConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Ngày cần hoàn thành" name="endDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cấu trúc sản phẩm (BOM)</Text>
                </div>
                <Tag style={{ fontFamily: 'monospace', fontSize: 13, padding: '4px 10px' }}>
                  {sourceOrder?.productCode} — {sourceOrder?.bomVersion}
                </Tag>
              </Col>
            </Row>
            <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, marginBottom: 12, fontSize: 12, color: '#595959', border: '1px solid #e8e8e8' }}>
              Trung tâm đã được gán riêng cho từng vật tư ở bảng trên (tự động gợi ý theo loại vật tư, có thể thay đổi).
            </div>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={2} placeholder="Ghi chú thêm về lệnh SX vật tư..." />
            </Form.Item>
          </Form>

          {/* Tóm tắt */}
          <div style={{ padding: '10px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
            <Text style={{ fontSize: 13 }}>
              Sẽ tạo <Text strong style={{ color: '#1B3A5C' }}>{selectedItems.length} lệnh sản xuất vật tư</Text> từ lệnh SX{' '}
              <Text strong style={{ fontFamily: 'monospace' }}>{sourceOrder?.code}</Text>:
            </Text>
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {selectedItems.map(item => {
                const ws = workshopOptions.find(w => w.value === item.workshopId);
                return (
                  <Tag key={item.id} color="#1B3A5C" style={{ fontSize: 11 }}>
                    {item.materialName} x{item.produceQty} → {ws?.label || item.workshopId}
                  </Tag>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Sticky bottom bar */}
      {bomNeeds.length > 0 && (
        <div style={{
          position: 'sticky', bottom: 0,
          background: '#fff', padding: '16px 20px', marginTop: 16,
          borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {selectedItems.length} vật tư cần sản xuất &middot; Tổng: {selectedItems.reduce((s, i) => s + i.produceQty, 0)} đơn vị
          </Text>
          <Space>
            <Button onClick={() => navigate('/material-production')} style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
              Hủy
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}
              disabled={selectedItems.length === 0}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
              Tạo lệnh sản xuất vật tư ({selectedItems.length})
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default MaterialProductionFormPage;
