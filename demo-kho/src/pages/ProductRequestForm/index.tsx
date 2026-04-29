import React, { useState, useEffect } from 'react';
import {
  Form, Input, Select, InputNumber, Button, Card, Row, Col,
  Space, Typography, Tag, Divider, Alert, message,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, InfoCircleOutlined,
  ExclamationCircleOutlined, CheckCircleOutlined, EditOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productRequests } from '../../data/productRequests';

const { Title, Text, Paragraph } = Typography;

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);
const { TextArea } = Input;

const categoryOptions = [
  { value: 'Linh kiện monitoring', label: 'Linh kiện monitoring' },
  { value: 'Linh kiện module sản phẩm', label: 'Linh kiện module sản phẩm' },
  { value: 'Vật tư cơ khí', label: 'Vật tư cơ khí' },
  { value: 'Vật tư điện tử', label: 'Vật tư điện tử' },
  { value: 'Vật tư tiêu hao', label: 'Vật tư tiêu hao' },
  { value: 'Thiết bị đo lường', label: 'Thiết bị đo lường' },
];

const unitOptions = [
  { value: 'Cái', label: 'Cái' },
  { value: 'Bộ', label: 'Bộ' },
  { value: 'Mô-đun', label: 'Mô-đun' },
  { value: 'Cuộn', label: 'Cuộn' },
  { value: 'Hộp', label: 'Hộp' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Lít', label: 'Lít' },
  { value: 'Mét', label: 'Mét' },
  { value: 'Tấm', label: 'Tấm' },
];

const deptOptions = [
  { value: 'PX1', label: 'PX Sửa chữa Monitoring (PX1)' },
  { value: 'PX2', label: 'PX Sửa chữa Module sản phẩm (PX2)' },
  { value: 'PX3', label: 'PX Cơ khí (PX3)' },
  { value: 'PX4', label: 'PX Điện tử (PX4)' },
  { value: 'PKH', label: 'Phòng Kế hoạch (P.KH)' },
  { value: 'PKT', label: 'Phòng Kỹ thuật (P.KT)' },
  { value: 'PHCKT', label: 'Phòng LG-KT (P.LGKT)' },
];

// Workflow steps display
const workflowSteps = [
  { title: 'Tạo yêu cầu',    description: 'Trung tâm/Phòng ban' },
  { title: 'Kiểm tra trùng', description: 'P.KCS tự động' },
  { title: 'Chuẩn hóa',      description: 'P.KT xử lý' },
  { title: 'Phê duyệt',      description: 'Ban Giám đốc' },
  { title: 'Ban hành',       description: 'Hoàn tất' },
];

const ProductRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const existingRequest = id ? productRequests.find(r => r.id === id) : null;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (existingRequest) {
      form.setFieldsValue({
        requestedName:     existingRequest.requestedName,
        requestedCategory: existingRequest.requestedCategory,
        requestedType:     existingRequest.requestedType,
        requestedUnit:     existingRequest.requestedUnit,
        estimatedQty:      existingRequest.estimatedQty,
        specifications:    existingRequest.specifications ?? '',
        purpose:           existingRequest.purpose ?? '',
        requesterDeptId:   existingRequest.requesterDeptId,
        requesterName:     existingRequest.requesterName,
      });
    }
  }, [existingRequest, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log('Submit values:', values);
    if (isEdit) {
      message.success('Đã cập nhật yêu cầu thành công!');
    } else {
      message.success('Đã nộp yêu cầu thành công! Hệ thống sẽ tự động kiểm tra trùng lặp.');
    }
    setSubmitting(false);
    navigate('/product-requests');
  };

  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();
    console.log('Draft values:', values);
    message.success('Đã lưu nháp yêu cầu.');
    navigate('/product-requests');
  };

  return (
    <div style={{ padding: 0 }}>
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
                onClick={() => navigate('/product-requests')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isEdit
                    ? <EditOutlined style={{ color: '#fff', fontSize: 18 }} />
                    : <AuditOutlined style={{ color: '#fff', fontSize: 18 }} />
                  }
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>
                    {isEdit ? `Chỉnh sửa yêu cầu${existingRequest ? ` · ${existingRequest.requestCode}` : ''}` : 'Tạo yêu cầu bổ sung danh mục'}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {isEdit ? 'Cập nhật thông tin yêu cầu bổ sung danh mục' : 'Đề xuất bổ sung vật tư/linh kiện mới vào hệ thống quản lý kho'}
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      {/* ─── Workflow Steps ───────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, marginBottom: 20, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <SectionHeader
          gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
          icon={<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />}
          title="Quy trình xử lý sau khi nộp yêu cầu"
        />
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              {/* Step item */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 8 }}>
                  {/* Left connector */}
                  <div style={{
                    flex: 1, height: 1,
                    background: idx === 0 ? 'transparent' : '#d0dff8',
                  }} />
                  {/* Circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(27,58,92,0.25)',
                  }}>
                    {idx + 1}
                  </div>
                  {/* Right connector */}
                  <div style={{
                    flex: 1, height: 1,
                    background: idx === workflowSteps.length - 1 ? 'transparent' : '#d0dff8',
                  }} />
                </div>
                {/* Text */}
                <div style={{ textAlign: 'center', paddingInline: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1B3A5C', lineHeight: 1.4 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2, lineHeight: 1.4 }}>{step.description}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Row gutter={[20, 20]}>
        {/* ─── Main Form ───────────────────────────────────────── */}
        <Col xs={24} lg={16}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* Thông tin vật tư */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
                icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thông tin vật tư/linh kiện"
              />

              <Row gutter={[16, 0]}>
                <Col xs={24}>
                  <Form.Item
                    label={<Text strong>Tên vật tư/linh kiện</Text>}
                    name="requestedName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên vật tư' }]}
                  >
                    <Input
                      placeholder="VD: Bộ khuếch đại cao tần P-18, Van khí nén S-75..."
                      size="large"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Danh mục</Text>}
                    name="requestedCategory"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select
                      placeholder="Chọn danh mục..."
                      size="large"
                      options={categoryOptions}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Loại vật tư</Text>}
                    name="requestedType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                  >
                    <Select
                      placeholder="Chọn loại..."
                      size="large"
                      options={[
                        { value: 'spare_part', label: 'Linh kiện thay thế' },
                        { value: 'consumable', label: 'Vật tư tiêu hao' },
                        { value: 'equipment', label: 'Thiết bị' },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Đơn vị tính</Text>}
                    name="requestedUnit"
                    rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                  >
                    <Select
                      placeholder="Chọn đơn vị..."
                      size="large"
                      options={unitOptions}
                      showSearch
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Số lượng ước tính cần dùng</Text>}
                    name="estimatedQty"
                  >
                    <InputNumber
                      placeholder="0"
                      min={1}
                      style={{ width: '100%', borderRadius: 6 }}
                      size="large"
                      addonAfter="(theo đơn vị tính)"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label={<Text strong>Thông số kỹ thuật</Text>}
                    name="specifications"
                  >
                    <TextArea
                      placeholder="Mô tả chi tiết thông số kỹ thuật: điện áp, tần số, kích thước, vật liệu, tiêu chuẩn..."
                      rows={3}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Mục đích sử dụng */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #531dab, #722ed1)"
                icon={<ExclamationCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Mục đích sử dụng & Thông tin yêu cầu"
              />

              <Row gutter={[16, 0]}>
                <Col xs={24}>
                  <Form.Item
                    label={<Text strong>Mục đích sử dụng / Lý do yêu cầu</Text>}
                    name="purpose"
                    rules={[{ required: true, message: 'Vui lòng mô tả mục đích sử dụng' }]}
                  >
                    <TextArea
                      placeholder="VD: Thay thế linh kiện hỏng trong đại tu monitoring P-18 Trung tâm 291; Bảo dưỡng định kỳ S-75..."
                      rows={4}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Đơn vị yêu cầu</Text>}
                    name="requesterDeptId"
                    rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                  >
                    <Select
                      placeholder="Chọn phòng ban/trung tâm..."
                      size="large"
                      options={deptOptions}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Người yêu cầu</Text>}
                    name="requesterName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên người yêu cầu' }]}
                  >
                    <Input
                      placeholder="VD: Nguyễn Văn A..."
                      size="large"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ─── Bottom action card ─────────────────────────── */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '16px 24px' } }}
            >
              <Row justify="end">
                <Col>
                  <Space size={12}>
                    <Button onClick={() => navigate(isEdit ? `/product-requests/${id}` : '/product-requests')}>Hủy</Button>
                    {!isEdit && (
                      <Button onClick={handleSaveDraft} style={{ borderColor: '#1B3A5C', color: '#1B3A5C' }}>Lưu nháp</Button>
                    )}
                    <Button type="primary" htmlType="submit" loading={submitting}
                      style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
                      {isEdit ? 'Lưu thay đổi' : 'Nộp yêu cầu'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

          </Form>
        </Col>

        {/* ─── Right Panel ─────────────────────────────────────── */}
        <Col xs={24} lg={8}>
          {/* Hướng dẫn */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #D4A843, #f0d890)"
              icon={<InfoCircleOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
              title="Lưu ý khi tạo yêu cầu"
            />
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {[
                'Kiểm tra kỹ danh mục hiện có trước khi tạo yêu cầu mới',
                'Ghi rõ thông số kỹ thuật để giảm thời gian chuẩn hóa',
                'Mục đích sử dụng cần liên kết với thiết bị/dự án cụ thể',
                'Hệ thống sẽ tự động kiểm tra trùng lặp sau khi nộp',
                'Quá trình phê duyệt dự kiến 5-7 ngày làm việc',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                  <Text style={{ fontSize: 13, color: '#555' }}>{tip}</Text>
                </div>
              ))}
            </Space>
          </Card>

          {/* Trạng thái yêu cầu sau nộp */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Các bước xử lý tiếp theo"
            />
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {[
                { step: '1', title: 'Kiểm tra trùng lặp', actor: 'P.KCS', color: '#1890ff' },
                { step: '2', title: 'Chuẩn hóa thông tin', actor: 'P.KT', color: '#722ed1' },
                { step: '3', title: 'Phê duyệt', actor: 'Ban Giám đốc', color: '#1B3A5C' },
                { step: '4', title: 'Khởi tạo & Ban hành', actor: 'Hệ thống', color: '#237804' },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    background: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{item.step}</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{item.actor}</Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductRequestForm;
