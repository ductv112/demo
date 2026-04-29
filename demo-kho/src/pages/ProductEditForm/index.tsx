import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, InputNumber, Button, Card, Row, Col,
  Space, Typography, Tag, Switch, message, Result, Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, InfoCircleOutlined,
  BarChartOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { products } from '../../data/products';
import {
  productTypeConfig, trackingTypeConfig, productStatusConfig, formatDate,
} from '../../utils/format';
import type { Product } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ─── Options ─────────────────────────────────────────────
const categoryOptions = [
  { value: 'Linh kiện monitoring',    label: 'Linh kiện monitoring' },
  { value: 'Linh kiện module sản phẩm', label: 'Linh kiện module sản phẩm' },
  { value: 'Vật tư cơ khí',     label: 'Vật tư cơ khí' },
  { value: 'Vật tư điện tử',    label: 'Vật tư điện tử' },
  { value: 'Vật tư tiêu hao',   label: 'Vật tư tiêu hao' },
  { value: 'Thiết bị đo lường', label: 'Thiết bị đo lường' },
];

const unitOptions = [
  'Cái', 'Bộ', 'Chiếc', 'Mô-đun', 'Kg', 'Mét', 'Lít', 'Hộp', 'Thùng', 'Cuộn', 'Tấm',
].map((u) => ({ value: u, label: u }));

const manufacturerOptions = [
  'Trung tâm phần mềm Alpha', 'Trung tâm phần mềm Beta', 'Trung tâm phần mềm Gamma',
  'Viện KH-CN Doanh nghiệp', 'Bosch Rexroth', 'Siemens', 'Tektronix',
].map((m) => ({ value: m, label: m }));

const originOptions = [
  'Việt Nam', 'Nga', 'Đức', 'Mỹ', 'Nhật Bản', 'Trung Quốc', 'Pháp',
].map((o) => ({ value: o, label: o }));

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const ProductEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const original = products.find((p) => p.id === id);

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [militaryGrade, setMilitaryGrade] = useState(original?.militaryGrade ?? false);
  const [productData, setProductData] = useState<Product | undefined>(original);

  if (!productData) {
    return (
      <Result
        status="404"
        title="Không tìm thấy vật tư"
        subTitle={`Mã vật tư "${id}" không tồn tại.`}
        extra={
          <Button type="primary" onClick={() => navigate('/products')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }

  const typeConfig = productTypeConfig[productData.productType];
  const statusConfig = productStatusConfig[productData.status];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      setProductData((prev) =>
        prev ? { ...prev, ...values, militaryGrade, updatedAt: new Date().toISOString() } : prev
      );
      message.success('Đã lưu thay đổi thành công');
      setSubmitting(false);
      navigate(`/products/${id}`);
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
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
                onClick={() => navigate(`/products/${id}`)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EditOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>Chỉnh sửa vật tư</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{productData.code} — {productData.name}</Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          name:          productData.name,
          category:      productData.category,
          subCategory:   productData.subCategory,
          productType:   productData.productType,
          trackingType:  productData.trackingType,
          baseUnit:      productData.baseUnit,
          manufacturer:  productData.manufacturer,
          origin:        productData.origin,
          specifications: productData.specifications,
          shelfLife:     productData.shelfLife,
          minStock:      productData.minStock,
          maxStock:      productData.maxStock,
          reorderPoint:  productData.reorderPoint,
          leadTimeDays:  productData.leadTimeDays,
        }}
      >
        <Row gutter={[20, 20]}>

          {/* ─── LEFT: Main form ──────────────────────────────── */}
          <Col xs={24} lg={16}>

            {/* Section 1: Danh mục */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
                icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Danh mục & Phân loại"
              />
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Nhóm vật tư</Text>}
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn nhóm vật tư' }]}
                  >
                    <Select placeholder="Chọn nhóm..." size="large" options={categoryOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Phân nhóm</Text>} name="subCategory">
                    <Input placeholder="Phân nhóm" size="large" style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Section 2: Thông tin vật tư */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #531dab, #722ed1)"
                icon={<EditOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thông tin vật tư"
              />
              <Row gutter={[16, 0]}>
                <Col xs={24}>
                  <Form.Item
                    label={<Text strong>Tên vật tư</Text>}
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên vật tư' }]}
                  >
                    <Input size="large" style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Loại sản phẩm</Text>}
                    name="productType"
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      options={Object.entries(productTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Phương thức theo dõi</Text>}
                    name="trackingType"
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      options={Object.entries(trackingTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Đơn vị tính</Text>}
                    name="baseUnit"
                    rules={[{ required: true }]}
                  >
                    <Select size="large" options={unitOptions} showSearch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Nhà sản xuất</Text>} name="manufacturer">
                    <Select size="large" showSearch allowClear options={manufacturerOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Xuất xứ</Text>} name="origin">
                    <Select size="large" showSearch allowClear options={originOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Hạn sử dụng (ngày)</Text>} name="shelfLife">
                    <InputNumber
                      min={0}
                      placeholder="Không giới hạn"
                      style={{ width: '100%', borderRadius: 6 }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label={<Text strong>Quy cách kỹ thuật</Text>} name="specifications">
                    <TextArea rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="militaryGrade">
                    <Space size={10} align="center">
                      <Switch
                        checked={militaryGrade}
                        onChange={setMilitaryGrade}
                        style={militaryGrade ? { background: '#1B3A5C' } : {}}
                      />
                      <SafetyCertificateOutlined style={{ color: militaryGrade ? '#1B3A5C' : '#ccc', fontSize: 16 }} />
                      <Text style={{ color: militaryGrade ? '#1B3A5C' : '#999', fontWeight: militaryGrade ? 600 : 400 }}>
                        Vật tư cấp doanh nghiệp (Military Grade)
                      </Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Section 3: Tồn kho & Cung ứng */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #237804, #52c41a)"
                icon={<BarChartOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Mức tồn kho & Cung ứng"
              />
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Tồn kho tối thiểu</Text>}
                    name="minStock"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} style={{ width: '100%', borderRadius: 6 }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Tồn kho tối đa</Text>}
                    name="maxStock"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} style={{ width: '100%', borderRadius: 6 }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Điểm đặt hàng lại</Text>}
                    name="reorderPoint"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} style={{ width: '100%', borderRadius: 6 }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Thời gian cung ứng (ngày)</Text>}
                    name="leadTimeDays"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} size="large" />
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
                    <Button onClick={() => navigate(`/products/${id}`)}>Hủy</Button>
                    <Button type="primary" loading={submitting} onClick={handleSubmit}
                      style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
                      Lưu thay đổi
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

          </Col>

          {/* ─── RIGHT panel ──────────────────────────────────── */}
          <Col xs={24} lg={8}>

            {/* Product info summary */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #D4A843, #f0d890)"
                icon={<InfoCircleOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
                title="Thông tin hiện tại"
              />
              <Descriptions column={1} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                <Descriptions.Item label="Mã vật tư">
                  <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{productData.code}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại">
                  <Tag color={typeConfig.color} style={{ fontSize: 11 }}>{typeConfig.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusConfig.color} style={{ fontSize: 11 }}>{statusConfig.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDate(productData.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                  {formatDate(productData.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Notes */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #d48806, #faad14)"
                icon={<ClockCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Lưu ý khi chỉnh sửa"
              />
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {[
                  'Mã vật tư không thể thay đổi sau khi tạo',
                  'Thay đổi đơn vị tính ảnh hưởng đến các giao dịch tồn kho hiện có',
                  'Thay đổi mức Min/Max sẽ cập nhật ngay vào module Cảnh báo',
                  'Thay đổi thông tin kỹ thuật nên ghi chú lý do trong Quy cách',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircleOutlined style={{ color: '#faad14', fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                    <Paragraph style={{ fontSize: 13, color: '#555', margin: 0 }}>{tip}</Paragraph>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductEditForm;
