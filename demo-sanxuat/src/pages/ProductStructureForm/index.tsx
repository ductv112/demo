import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Space, Typography, Row, Col, Empty,
  Form, Input, InputNumber, Select, DatePicker, Modal, message,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, PartitionOutlined, PlusOutlined,
  DeleteOutlined, ExclamationCircleOutlined, SaveOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { productStructures, bomItems as allBomItems } from '../../data/productStructures';
import type { ProductStructure, BOMItem } from '../../types';
import { bomStatusConfig } from '../../utils/format';

const { Text } = Typography;

const typeLabels: Record<ProductStructure['type'], { label: string; color: string }> = {
  finished:      { label: 'Thành phẩm',     color: '#1B3A5C' },
  module:        { label: 'Mô-đun',          color: '#0891b2' },
  semi_finished: { label: 'Bán thành phẩm',  color: '#7c3aed' },
  part:          { label: 'Chi tiết',         color: '#d97706' },
};


const ProductStructureFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const existingRecord = isEdit ? productStructures.find((p) => p.id === id) : null;

  // Main form
  const [form] = Form.useForm();

  // BOM Items state
  const [bomItemsList, setBomItemsList] = useState<BOMItem[]>(
    isEdit ? allBomItems.filter((item) => item.bomId === id) : []
  );


  // Parent options (can be parent of this structure)
  const parentOptions = useMemo(() => {
    return productStructures
      .filter((p) => p.id !== id && (p.type === 'finished' || p.type === 'module'))
      .map((p) => ({
        value: p.id,
        label: `${p.code} — ${p.name} (${p.version})`,
      }));
  }, [id]);

  // Initialize form values
  React.useEffect(() => {
    if (existingRecord) {
      form.setFieldsValue({
        ...existingRecord,
        effectiveFrom: existingRecord.effectiveFrom ? dayjs(existingRecord.effectiveFrom) : undefined,
        effectiveTo: existingRecord.effectiveTo ? dayjs(existingRecord.effectiveTo) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'draft', scope: 'new_production', type: 'module' });
    }
  }, [existingRecord, form]);

  // Not found
  if (isEdit && !existingRecord) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy cấu trúc sản phẩm" />
        <Button type="primary" onClick={() => navigate('/product-structures')}
          style={{ marginTop: 16, background: '#1B3A5C' }}>Quay lại danh sách</Button>
      </div>
    );
  }

  // --- Save ---
  const handleSave = () => {
    form.validateFields().then((values) => {
      const effectiveFrom = values.effectiveFrom ? dayjs(values.effectiveFrom).format('YYYY-MM-DD') : undefined;
      const effectiveTo = values.effectiveTo ? dayjs(values.effectiveTo).format('YYYY-MM-DD') : undefined;

      if (bomItemsList.length === 0) {
        Modal.confirm({
          title: 'Chưa có định mức vật tư',
          icon: <ExclamationCircleOutlined />,
          content: 'Cấu trúc sản phẩm chưa có định mức vật tư nào. Bạn vẫn muốn lưu?',
          okText: 'Lưu',
          cancelText: 'Quay lại thêm vật tư',
          onOk: () => doSave(values, effectiveFrom, effectiveTo),
        });
      } else {
        doSave(values, effectiveFrom, effectiveTo);
      }
    });
  };

  const doSave = (values: Record<string, unknown>, effectiveFrom?: string, effectiveTo?: string) => {
    console.log('Saving:', { ...values, effectiveFrom, effectiveTo, bomItems: bomItemsList });
    message.success(isEdit ? 'Cập nhật cấu trúc sản phẩm thành công' : 'Thêm mới cấu trúc sản phẩm thành công');
    navigate('/product-structures');
  };

  // --- BOM Item CRUD ---
  const handleAddItem = () => {
    const newItem: BOMItem = {
      id: `BI-NEW-${Date.now()}`,
      bomId: id || 'NEW',
      materialCode: '',
      materialName: '',
      specification: '',
      unit: 'Cái',
      quantity: 1,
      type: 'main',
    };
    setBomItemsList([...bomItemsList, newItem]);
  };

  const updateItem = (itemId: string, field: string, value: unknown) => {
    setBomItemsList((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
    );
  };

  const handleDeleteItem = (item: BOMItem) => {
    setBomItemsList(bomItemsList.filter((i) => i.id !== item.id));
    message.success('Đã xóa vật tư');
  };

  // --- BOM Table Columns ---
  const bomColumns: ColumnsType<BOMItem> = [
    {
      title: 'STT', key: 'stt', width: 45, align: 'center',
      render: (_: unknown, __: BOMItem, index: number) => <Text style={{ color: '#1B3A5C' }}>{index + 1}</Text>,
    },
    {
      title: 'Mã vật tư', dataIndex: 'materialCode', key: 'materialCode', width: 120,
      render: (v: string, record: BOMItem) => (
        <Input size="small" placeholder="VD: MG-001" value={v}
          onChange={(e) => updateItem(record.id, 'materialCode', e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 12 }} />
      ),
    },
    {
      title: 'Tên vật tư', dataIndex: 'materialName', key: 'materialName', width: 180,
      render: (v: string, record: BOMItem) => (
        <Input size="small" placeholder="Tên vật tư" value={v}
          onChange={(e) => updateItem(record.id, 'materialName', e.target.value)} />
      ),
    },
    {
      title: 'Quy cách', dataIndex: 'specification', key: 'specification', width: 160,
      render: (v: string, record: BOMItem) => (
        <Input size="small" placeholder="Quy cách kỹ thuật" value={v}
          onChange={(e) => updateItem(record.id, 'specification', e.target.value)} />
      ),
    },
    {
      title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 65, align: 'center',
      render: (v: string, record: BOMItem) => (
        <Input size="small" placeholder="Cái" value={v} style={{ width: 55 }}
          onChange={(e) => updateItem(record.id, 'unit', e.target.value)} />
      ),
    },
    {
      title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 65, align: 'right',
      render: (v: number, record: BOMItem) => (
        <InputNumber size="small" min={1} value={v} style={{ width: 55 }}
          onChange={(val) => updateItem(record.id, 'quantity', val ?? 1)} />
      ),
    },
    {
      title: 'Phân loại', dataIndex: 'type', key: 'type', width: 105,
      render: (t: string, record: BOMItem) => (
        <Select size="small" value={t} style={{ width: 95 }}
          onChange={(val) => updateItem(record.id, 'type', val)}
          options={[
            { value: 'main', label: 'Chính' },
            { value: 'auxiliary', label: 'Phụ' },
            { value: 'consumable', label: 'Tiêu hao' },
            { value: 'replacement', label: 'Thay thế' },
          ]} />
      ),
    },
    {
      title: 'Vị trí', dataIndex: 'position', key: 'position', width: 110,
      render: (v: string | undefined, record: BOMItem) => (
        <Input size="small" placeholder="Vị trí" value={v || ''}
          onChange={(e) => updateItem(record.id, 'position', e.target.value)} />
      ),
    },
    {
      title: 'Thao tác', key: 'actions', width: 55, align: 'center',
      render: (_: unknown, record: BOMItem) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record)} />
      ),
    },
  ];

  const totalQty = bomItemsList.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div>
      {/* ─── Header ─── */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(212,168,67,0.06)',
          }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(isEdit ? `/product-structures/${id}` : '/product-structures')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: isEdit ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isEdit
                      ? <EditOutlined style={{ color: '#f0d890', fontSize: 18 }} />
                      : <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {isEdit ? 'Chỉnh sửa cấu trúc sản phẩm' : 'Thêm mới cấu trúc sản phẩm'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {isEdit ? `${existingRecord?.code} — ${existingRecord?.version}` : 'Điền thông tin và thiết lập định mức vật tư'}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col />
          </Row>
        </div>
      </Card>

      <Form form={form} layout="vertical" requiredMark="optional">
        {/* ─── Section 1: Thông tin cơ bản ─── */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '20px' } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PartitionOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Thông tin cơ bản</Text>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label="Mã sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                <Input placeholder="VD: SP-P18-TPR" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="version" label="Phiên bản" rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}>
                <Input placeholder="VD: V2.3" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="previousVersion" label="Kế thừa từ phiên bản">
                <Input placeholder="VD: V2.2 (để trống nếu là phiên bản đầu)" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Module thu phát Alpha-18" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả phạm vi áp dụng">
            <Input.TextArea rows={2} placeholder="VD: Áp dụng cho toàn bộ hệ thống Alpha-18 đang vận hành tại đơn vị, trừ các hệ thống đã nâng cấp sang cấu hình mới" />
          </Form.Item>
        </Card>

        {/* ─── Section 2: Phân loại & Cấu trúc ─── */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '20px' } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PartitionOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Phân loại & Cấu trúc</Text>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="type" label="Loại sản phẩm" rules={[{ required: true }]}>
                <Select options={Object.entries(typeLabels).map(([key, cfg]) => ({ value: key, label: cfg.label }))} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="scope" label="Phạm vi áp dụng" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'new_production', label: 'Sản xuất mới' },
                  { value: 'repair', label: 'Sửa chữa' },
                  { value: 'overhaul', label: 'Đại tu' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="equipmentModel" label="Model thiết bị" rules={[{ required: true, message: 'Nhập model' }]}>
                <Input placeholder="VD: P-18" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="parentId" label="Thuộc cấu trúc cha">
                <Select
                  allowClear
                  placeholder="Không có (cấp cao nhất)"
                  options={parentOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={Object.entries(bomStatusConfig).map(([key, cfg]) => ({ value: key, label: cfg.label }))} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="effectiveFrom" label="Hiệu lực từ">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="effectiveTo" label="Hiệu lực đến">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>

      {/* ─── Section 3: Định mức vật tư ─── */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PartitionOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Định mức vật tư</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{bomItemsList.length} vật tư</Text>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
          >
            Thêm vật tư
          </Button>
        </div>

        <div>
          {bomItemsList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Empty description="Chưa có định mức vật tư" />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}
                style={{ marginTop: 16, background: '#1B3A5C', borderColor: '#1B3A5C' }}
              >
                Thêm vật tư đầu tiên
              </Button>
            </div>
          ) : (
            <Table<BOMItem>
              columns={bomColumns}
              dataSource={bomItemsList}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 1050 }}
              style={{ marginTop: 4 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <Text strong style={{ color: '#1B3A5C' }}>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{totalQty}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} colSpan={4} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          )}
        </div>
      </Card>

      {/* ─── Bottom action bar ─── */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {bomItemsList.length} vật tư &middot; Tổng SL: {totalQty}
        </Text>
        <Space>
          <Button onClick={() => navigate(isEdit ? `/product-structures/${id}` : '/product-structures')}
            style={{ borderRadius: 8, height: 40, padding: '0 24px' }}
          >
            Hủy
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}
          >
            {isEdit ? 'Cập nhật cấu trúc' : 'Lưu cấu trúc sản phẩm'}
          </Button>
        </Space>
      </div>

    </div>
  );
};

export default ProductStructureFormPage;
