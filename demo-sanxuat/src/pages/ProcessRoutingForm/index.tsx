import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Empty,
  Form, Input, InputNumber, Select, Modal, message, Dropdown, Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, NodeIndexOutlined, PlusOutlined,
  DeleteOutlined, MoreOutlined, ExclamationCircleOutlined, SaveOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { processRoutings, processSteps as allProcessSteps } from '../../data/processRoutings';
import { productStructures } from '../../data/productStructures';
import type { ProcessStep, RoutingStatus } from '../../types';
import { routingStatusConfig } from '../../utils/format';

const { Text } = Typography;

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Radar' },
  { value: 'PX2', label: 'PX2 - Tên lửa' },
  { value: 'PX3', label: 'PX3 - Cơ khí' },
  { value: 'PX4', label: 'PX4 - Điện tử' },
  { value: 'KTR', label: 'Khu kiểm tra tổng hợp' },
];

const workshopNameMap: Record<string, string> = {
  PX1: 'PX1 - Radar', PX2: 'PX2 - Tên lửa', PX3: 'PX3 - Cơ khí',
  PX4: 'PX4 - Điện tử', KTR: 'Khu kiểm tra tổng hợp',
};

const ProcessRoutingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const existingRecord = isEdit ? processRoutings.find((r) => r.id === id) : null;

  const [form] = Form.useForm();
  const [stepsList, setStepsList] = useState<ProcessStep[]>(
    isEdit ? allProcessSteps.filter((s) => s.routingId === id) : [],
  );

  const productOptions = useMemo(() =>
    productStructures.map((p) => ({
      value: p.id,
      label: `${p.code} — ${p.name} (${p.version})`,
      name: p.name,
    })), [],
  );

  React.useEffect(() => {
    if (existingRecord) {
      form.setFieldsValue({ ...existingRecord });
    } else {
      form.setFieldsValue({ status: 'draft', type: 'new_production', estimatedDays: 1 });
    }
  }, [existingRecord, form]);

  if (isEdit && !existingRecord) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy quy trình công nghệ" />
        <Button type="primary" onClick={() => navigate('/process-routings')}
          style={{ marginTop: 16, background: '#1B3A5C' }}>Quay lại danh sách</Button>
      </div>
    );
  }

  // --- Save ---
  const handleSave = () => {
    form.validateFields().then((values) => {
      if (stepsList.length === 0) {
        Modal.confirm({
          title: 'Chưa có công đoạn',
          icon: <ExclamationCircleOutlined />,
          content: 'Quy trình chưa có công đoạn nào. Bạn vẫn muốn lưu?',
          okText: 'Lưu',
          cancelText: 'Quay lại thêm công đoạn',
          onOk: () => doSave(values),
        });
      } else {
        doSave(values);
      }
    });
  };

  const doSave = (values: Record<string, unknown>) => {
    console.log('Saving routing:', { ...values, steps: stepsList });
    message.success(isEdit ? 'Cập nhật quy trình thành công' : 'Thêm mới quy trình thành công');
    navigate('/process-routings');
  };

  // --- Step CRUD ---
  const handleAddStep = () => {
    const newStep: ProcessStep = {
      id: `PS-NEW-${Date.now()}`,
      routingId: id || 'NEW',
      stepNo: stepsList.length + 1,
      name: '',
      description: '',
      workshopId: 'PX1',
      workshopName: 'PX1 - Radar',
      equipmentRequired: [],
      skillRequired: [],
      requiredWorkers: 1,
      estimatedHours: 1,
      isMandatory: true,
    };
    setStepsList([...stepsList, newStep]);
  };

  const handleDeleteStep = (step: ProcessStep) => {
    setStepsList(stepsList.filter((s) => s.id !== step.id));
    message.success('Đã xóa công đoạn');
  };

  const handleProductChange = (value: string) => {
    const product = productStructures.find((p) => p.id === value);
    if (product) {
      form.setFieldsValue({ productName: product.name });
    }
  };

  // --- Update step field directly ---
  const updateStep = (stepId: string, field: string, value: unknown) => {
    setStepsList(stepsList.map((s) => {
      if (s.id !== stepId) return s;
      if (field === 'workshopId') {
        return { ...s, workshopId: value as string, workshopName: workshopNameMap[value as string] || value as string };
      }
      if (field === 'equipmentRequired' || field === 'skillRequired') {
        const arr = typeof value === 'string' ? value.split(',').map((x: string) => x.trim()).filter(Boolean) : [];
        return { ...s, [field]: arr };
      }
      return { ...s, [field]: value };
    }));
  };

  // --- Columns (always editable) ---
  const stepColumns: ColumnsType<ProcessStep> = [
    {
      title: 'STT', key: 'stt', width: 45, align: 'center',
      render: (_: unknown, __: ProcessStep, index: number) =>
        <Text style={{ color: '#1B3A5C' }}>{index + 1}</Text>,
    },
    {
      title: 'Tên công đoạn', dataIndex: 'name', key: 'name', width: 160,
      render: (v: string, record: ProcessStep) => (
        <Input size="small" value={v} placeholder="Tên công đoạn"
          onChange={(e) => updateStep(record.id, 'name', e.target.value)} />
      ),
    },
    {
      title: 'Mô tả', dataIndex: 'description', key: 'description', width: 180,
      render: (v: string, record: ProcessStep) => (
        <Input size="small" value={v} placeholder="Mô tả ngắn"
          onChange={(e) => updateStep(record.id, 'description', e.target.value)} />
      ),
    },
    {
      title: 'Phân xưởng', dataIndex: 'workshopId', key: 'workshopId', width: 130,
      render: (v: string, record: ProcessStep) => (
        <Select size="small" value={v} options={workshopOptions} style={{ width: 120 }}
          onChange={(val) => updateStep(record.id, 'workshopId', val)} />
      ),
    },
    {
      title: 'Thiết bị yêu cầu', dataIndex: 'equipmentRequired', key: 'equipmentRequired', width: 170,
      render: (v: string[], record: ProcessStep) => (
        <Input size="small" value={v?.join(', ')} placeholder="Máy CNC, Máy hàn..."
          onChange={(e) => updateStep(record.id, 'equipmentRequired', e.target.value)} />
      ),
    },
    {
      title: 'Nhân lực', key: 'workers', width: 130,
      render: (_: unknown, record: ProcessStep) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Input size="small" value={record.skillRequired?.join(', ')} placeholder="KS điện tử, KTV"
            onChange={(e) => updateStep(record.id, 'skillRequired', e.target.value)} />
          <InputNumber size="small" min={1} value={record.requiredWorkers} style={{ width: '100%' }}
            onChange={(val) => updateStep(record.id, 'requiredWorkers', val)} />
        </Space>
      ),
    },
    {
      title: 'Giờ công', dataIndex: 'estimatedHours', key: 'estimatedHours', width: 70, align: 'right',
      render: (v: number, record: ProcessStep) => (
        <InputNumber size="small" min={0.5} step={0.5} value={v} style={{ width: 60 }}
          onChange={(val) => updateStep(record.id, 'estimatedHours', val)} />
      ),
    },
    {
      title: 'Bắt buộc', dataIndex: 'isMandatory', key: 'isMandatory', width: 65, align: 'center',
      render: (v: boolean, record: ProcessStep) => (
        <Checkbox checked={v} onChange={(e) => updateStep(record.id, 'isMandatory', e.target.checked)} />
      ),
    },
    {
      title: 'Tiêu chuẩn chất lượng', dataIndex: 'qualityStandard', key: 'qualityStandard', width: 150,
      render: (v: string | undefined, record: ProcessStep) => (
        <Input size="small" value={v || ''} placeholder="Tiêu chuẩn chất lượng"
          onChange={(e) => updateStep(record.id, 'qualityStandard', e.target.value)} />
      ),
    },
    {
      title: '', key: 'actions', width: 45, align: 'center',
      render: (_: unknown, record: ProcessStep) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />}
          onClick={() => handleDeleteStep(record)} />
      ),
    },
  ];

  const totalHours = stepsList.reduce((sum, s) => sum + s.estimatedHours, 0);

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}>
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
                  onClick={() => navigate(isEdit ? `/process-routings/${id}` : '/process-routings')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: isEdit ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isEdit
                      ? <EditOutlined style={{ color: '#f0d890', fontSize: 18 }} />
                      : <NodeIndexOutlined style={{ color: '#fff', fontSize: 18 }} />}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {isEdit ? 'Chỉnh sửa quy trình công nghệ' : 'Thêm mới quy trình công nghệ'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {isEdit
                        ? `${existingRecord?.code} — ${existingRecord?.version}`
                        : 'Điền thông tin và thiết lập tuyến công đoạn'}
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
        {/* Section: Thông tin cơ bản */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '20px' } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <NodeIndexOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Thông tin cơ bản</Text>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label="Mã quy trình" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                <Input placeholder="VD: QT-P18-TPR" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="version" label="Phiên bản" rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}>
                <Input placeholder="VD: V2.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="previousVersion" label="Kế thừa từ">
                <Input placeholder="VD: V1.0 (để trống nếu phiên bản đầu)" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="productId" label="Sản phẩm liên kết" rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
                <Select
                  placeholder="Chọn sản phẩm"
                  options={productOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleProductChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="productName" label="Tên sản phẩm">
                <Input disabled placeholder="Tự động theo sản phẩm liên kết" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'new_production', label: 'Sản xuất mới' },
                  { value: 'repair', label: 'Sửa chữa' },
                  { value: 'overhaul', label: 'Đại tu' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={Object.entries(routingStatusConfig).map(([key, cfg]) => ({ value: key, label: cfg.label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimatedDays" label="Thời gian ước tính (ngày)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Số ngày" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="VD: Quy trình phát triển mới module thu phát, áp dụng cho toàn bộ hệ thống Alpha-18" />
          </Form.Item>
        </Card>
      </Form>

      {/* Section: Tuyến công đoạn */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <NodeIndexOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tuyến công đoạn</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{stepsList.length} công đoạn</Text>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStep}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}>
            Thêm công đoạn
          </Button>
        </div>

        <div>
          {stepsList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Empty description="Chưa có công đoạn nào" />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStep}
                style={{ marginTop: 16, background: '#1B3A5C', borderColor: '#1B3A5C' }}>
                Thêm công đoạn đầu tiên
              </Button>
            </div>
          ) : (
            <Table<ProcessStep>
              columns={stepColumns}
              dataSource={stepsList}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 1280 }}
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      </Card>

      {/* Sticky bottom bar */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {stepsList.length} công đoạn &middot; Tổng giờ công: {totalHours}h
        </Text>
        <Space>
          <Button onClick={() => navigate(isEdit ? `/process-routings/${id}` : '/process-routings')}
            style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
            Hủy
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
            {isEdit ? 'Cập nhật quy trình' : 'Lưu quy trình'}
          </Button>
        </Space>
      </div>

    </div>
  );
};

export default ProcessRoutingFormPage;
