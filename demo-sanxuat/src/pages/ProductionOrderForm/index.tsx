import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col, Empty,
  Form, Input, InputNumber, Select, DatePicker, message,
} from 'antd';
import {
  ArrowLeftOutlined, PlayCircleOutlined, EditOutlined, SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { productionOrders, productionPlans } from '../../data/productionOrders';
import { productStructures } from '../../data/productStructures';

const { Text } = Typography;

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Trung tâm Bảo trì Hệ thống Monitoring' },
  { value: 'PX2', label: 'PX2 - Trung tâm Bảo trì Cluster Server' },
  { value: 'PX3', label: 'PX3 - Trung tâm Hạ tầng' },
  { value: 'PX4', label: 'PX4 - Trung tâm Phát triển Phần mềm' },
];

const typeOptions = [
  { value: 'new_product', label: 'Sản xuất mới' },
  { value: 'spare_part', label: 'Phụ tùng' },
  { value: 'semi_finished', label: 'Bán thành phẩm' },
  { value: 'repair_support', label: 'Phục vụ sửa chữa' },
];

const priorityOptions = [
  { value: 'critical', label: 'Khẩn cấp' },
  { value: 'high', label: 'Cao' },
  { value: 'normal', label: 'Bình thường' },
  { value: 'low', label: 'Thấp' },
];

const sourceTypeOptions = [
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'repair_request', label: 'Yêu cầu sửa chữa' },
  { value: 'overhaul_plan', label: 'Kế hoạch đại tu' },
  { value: 'inventory_reserve', label: 'Dự trữ' },
  { value: 'other', label: 'Khác' },
];

const ProductionOrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const existingRecord = isEdit ? productionOrders.find((o) => o.id === id) : null;

  const [form] = Form.useForm();

  const planOptions = useMemo(() =>
    productionPlans.map((p) => ({
      value: p.id,
      label: `${p.code} — ${p.name}`,
    })), [],
  );

  const productOptions = useMemo(() =>
    productStructures.map((p) => ({
      value: p.id,
      label: `${p.code} — ${p.name} (${p.version})`,
      name: p.name,
      code: p.code,
    })), [],
  );

  React.useEffect(() => {
    if (existingRecord) {
      form.setFieldsValue({
        ...existingRecord,
        startDate: existingRecord.startDate ? dayjs(existingRecord.startDate) : undefined,
        endDate: existingRecord.endDate ? dayjs(existingRecord.endDate) : undefined,
      });
    } else {
      form.setFieldsValue({
        type: 'new_product',
        priority: 'normal',
        quantity: 1,
      });
    }
  }, [existingRecord, form]);

  if (isEdit && !existingRecord) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy lệnh sản xuất" />
        <Button type="primary" onClick={() => navigate('/production-orders')}
          style={{ marginTop: 16, background: '#1B3A5C' }}>Quay lại danh sách</Button>
      </div>
    );
  }

  const handleProductChange = (value: string) => {
    const product = productStructures.find((p) => p.id === value);
    if (product) {
      form.setFieldsValue({
        productName: product.name,
        productCode: product.code,
      });
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      };
      console.log('Saving production order:', payload);
      message.success(isEdit ? 'Cập nhật lệnh sản xuất thành công' : 'Thêm mới lệnh sản xuất thành công');
      navigate('/production-orders');
    });
  };

  return (
    <div>
      {/* ─── Header Banner ─── */}
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
                  onClick={() => navigate(isEdit ? `/production-orders/${id}` : '/production-orders')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: isEdit ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isEdit
                      ? <EditOutlined style={{ color: '#f0d890', fontSize: 18 }} />
                      : <PlayCircleOutlined style={{ color: '#fff', fontSize: 18 }} />}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {isEdit ? 'Chỉnh sửa lệnh sản xuất' : 'Thêm mới lệnh sản xuất'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {isEdit
                        ? `${existingRecord?.code} — ${existingRecord?.productName}`
                        : 'Điền thông tin để tạo lệnh sản xuất mới'}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col />
          </Row>
        </div>
      </Card>

      {/* ─── Form ─── */}
      <Form form={form} layout="vertical" requiredMark="optional">
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '20px' } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PlayCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Thông tin lệnh sản xuất</Text>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label="Mã lệnh" rules={[{ required: true, message: 'Vui lòng nhập mã lệnh' }]}>
                <Input placeholder="VD: LSX-2026-0065" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="planId" label="Kế hoạch SX" rules={[{ required: true, message: 'Chọn kế hoạch' }]}>
                <Select
                  placeholder="Chọn kế hoạch sản xuất"
                  options={planOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
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
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="productName" label="Tên sản phẩm">
                <Input disabled placeholder="Tự động theo sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bomVersion" label="BOM version" rules={[{ required: true, message: 'Nhập BOM version' }]}>
                <Input placeholder="VD: V2.3" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="routingVersion" label="Routing version" rules={[{ required: true, message: 'Nhập Routing version' }]}>
                <Input placeholder="VD: V2.0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                <Select options={typeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Số lượng sản xuất" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}>
                <Select options={priorityOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="workshopId" label="Phân xưởng" rules={[{ required: true, message: 'Chọn phân xưởng' }]}>
                <Select placeholder="Chọn phân xưởng" options={workshopOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="assignedTo" label="Phụ trách">
                <Input placeholder="VD: Nguyễn Hữu Long" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sourceType" label="Nguồn nhu cầu">
                <Select placeholder="Chọn nguồn nhu cầu" options={sourceTypeOptions} allowClear />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="sourceReference" label="Tham chiếu nguồn">
                <Input placeholder="VD: HĐ-2026-015 hoặc YC-SC-2026-088" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="VD: Ưu tiên phục vụ Trung tâm dữ liệu khu vực 361, đảm bảo tiến độ trước 25/04" />
          </Form.Item>
        </Card>
      </Form>

      {/* ─── Sticky Bottom Bar ─── */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      }}>
        <Space>
          <Button onClick={() => navigate(isEdit ? `/production-orders/${id}` : '/production-orders')}
            style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
            Hủy
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
            {isEdit ? 'Cập nhật lệnh sản xuất' : 'Lưu lệnh sản xuất'}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProductionOrderFormPage;
