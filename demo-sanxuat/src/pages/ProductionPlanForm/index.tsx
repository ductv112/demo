import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col, Empty,
  Form, Input, InputNumber, Select, DatePicker, message,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, ScheduleOutlined,
  PlusOutlined, SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { productionPlans } from '../../data/productionOrders';
import { planStatusConfig } from '../../utils/format';

const { Text } = Typography;

const ProductionPlanFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const existingRecord = isEdit ? productionPlans.find((p) => p.id === id) : null;

  const [form] = Form.useForm();

  // Initialize form values
  React.useEffect(() => {
    if (existingRecord) {
      form.setFieldsValue({
        ...existingRecord,
        startDate: existingRecord.startDate ? dayjs(existingRecord.startDate) : undefined,
        endDate: existingRecord.endDate ? dayjs(existingRecord.endDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'draft', year: 2026 });
    }
  }, [existingRecord, form]);

  // Not found
  if (isEdit && !existingRecord) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy kế hoạch sản xuất" />
        <Button type="primary" onClick={() => navigate('/production-plans')}
          style={{ marginTop: 16, background: '#1B3A5C' }}>Quay lại danh sách</Button>
      </div>
    );
  }

  // --- Save ---
  const handleSave = () => {
    form.validateFields().then((values) => {
      const startDate = values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined;
      const endDate = values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined;
      console.log('Saving:', { ...values, startDate, endDate });
      message.success(isEdit ? 'Cập nhật kế hoạch sản xuất thành công' : 'Thêm mới kế hoạch sản xuất thành công');
      navigate('/production-plans');
    });
  };

  return (
    <div>
      {/* --- Header Banner --- */}
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
                  onClick={() => navigate(isEdit ? `/production-plans/${id}` : '/production-plans')}
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
                      {isEdit ? 'Chỉnh sửa kế hoạch sản xuất' : 'Thêm mới kế hoạch sản xuất'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {isEdit ? `${existingRecord?.code} — Quý ${existingRecord?.quarter}/${existingRecord?.year}` : 'Điền thông tin kế hoạch sản xuất mới'}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col />
          </Row>
        </div>
      </Card>

      {/* --- Form Section --- */}
      <Form form={form} layout="vertical" requiredMark="optional">
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '20px' } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ScheduleOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Thông tin kế hoạch</Text>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label="Mã kế hoạch" rules={[{ required: true, message: 'Vui lòng nhập mã kế hoạch' }]}>
                <Input placeholder="VD: KHSX-2026-Q3" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="Tên kế hoạch" rules={[{ required: true, message: 'Vui lòng nhập tên kế hoạch' }]}>
                <Input placeholder="VD: Kế hoạch sản xuất Quý III/2026" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="year" label="Năm" rules={[{ required: true, message: 'Vui lòng nhập năm' }]}>
                <InputNumber min={2024} max={2030} style={{ width: '100%' }} placeholder="2026" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quarter" label="Quý">
                <Select placeholder="Chọn quý" allowClear options={[
                  { value: 1, label: 'Quý I' },
                  { value: 2, label: 'Quý II' },
                  { value: 3, label: 'Quý III' },
                  { value: 4, label: 'Quý IV' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="startDate" label="Thời gian bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="endDate" label="Thời gian kết thúc" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={Object.entries(planStatusConfig).map(([key, cfg]) => ({ value: key, label: cfg.label }))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="VD: Ưu tiên phát triển module thu phát Alpha-18 phục vụ dự trữ chiến lược" />
          </Form.Item>
        </Card>
      </Form>

      {/* --- Bottom Action Bar --- */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      }}>
        <Space>
          <Button onClick={() => navigate(isEdit ? `/production-plans/${id}` : '/production-plans')}
            style={{ borderRadius: 8, height: 40, padding: '0 24px' }}
          >
            Hủy
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}
          >
            {isEdit ? 'Cập nhật kế hoạch' : 'Lưu kế hoạch sản xuất'}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProductionPlanFormPage;
