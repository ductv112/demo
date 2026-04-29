import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, InputNumber, Button, Card, Row, Col,
  Space, Typography, Tag, message, Divider, Switch, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, DatabaseOutlined, InfoCircleOutlined,
  CheckCircleOutlined, AuditOutlined, LinkOutlined, CloseCircleOutlined,
  StockOutlined, RightOutlined, SafetyCertificateOutlined, WarningOutlined,
} from '@ant-design/icons';
import { productTypeConfig, trackingTypeConfig } from '../../utils/format';
import { products } from '../../data/products';
import { productRequests } from '../../data/productRequests';
import type { ProductCreationRequest } from '../../types';

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

const subCategoryOptions: Record<string, string[]> = {
  'Linh kiện monitoring':    ['Bo mạch', 'Máy phát', 'Ăng-ten', 'Bộ thu', 'Khối hiển thị', 'Khác'],
  'Linh kiện module sản phẩm': ['Đầu tự dẫn', 'Động cơ', 'Cánh lái', 'Hệ điều khiển', 'Ngòi nổ', 'Khác'],
  'Vật tư cơ khí':     ['Bánh răng', 'Vòng bi', 'Bu lông', 'Phớt', 'Đệm', 'Khác'],
  'Vật tư điện tử':    ['IC', 'Tụ điện', 'Điện trở', 'Cuộn cảm', 'Transistor', 'Khác'],
  'Vật tư tiêu hao':   ['Dầu bôi trơn', 'Dung môi', 'Hóa chất', 'Vật liệu hàn', 'Khác'],
  'Thiết bị đo lường': ['Đo điện', 'Đo tần số', 'Đo áp suất', 'Đo nhiệt độ', 'Khác'],
};

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

// ─── Code generation ─────────────────────────────────────
const categoryPrefixMap: Record<string, string> = {
  'Linh kiện monitoring':    'RD',
  'Linh kiện module sản phẩm': 'TL',
  'Vật tư cơ khí':     'CK',
  'Vật tư điện tử':    'DT',
  'Vật tư tiêu hao':   'TH',
  'Thiết bị đo lường': 'DL',
};

const generateCode = (category: string, subCategory?: string): string => {
  const prefix = categoryPrefixMap[category] || 'XX';
  const subPrefix = subCategory
    ? subCategory.replace(/[^a-zA-ZÀ-ỹ]/g, '').toUpperCase().substring(0, 2)
    : 'XX';
  const existing = products.filter((p) => p.code.startsWith(`${prefix}-`));
  const nextNum = String(existing.length + 1).padStart(3, '0');
  return `${prefix}-${subPrefix}-${nextNum}`;
};

// ─── Approved requests available to link ────────────────
const approvedRequests = productRequests.filter(
  (r) => r.status === 'approved'
);

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const ProductForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [previewCode, setPreviewCode] = useState<string>('--');
  const [militaryGrade, setMilitaryGrade] = useState(false);
  const [linkedRequest, setLinkedRequest] = useState<ProductCreationRequest | null>(null);
  const [nameWarnings, setNameWarnings] = useState<string[]>([]);
  const [codeWarnings, setCodeWarnings] = useState<string[]>([]);

  // ─── Pre-fill from approved request ──────────────────
  const handleLinkRequest = (reqId: string) => {
    const req = approvedRequests.find((r) => r.id === reqId);
    if (!req) return;
    setLinkedRequest(req);

    form.setFieldsValue({
      name:           req.requestedName,
      category:       req.requestedCategory,
      productType:    req.requestedType ?? undefined,
      baseUnit:       req.requestedUnit,
      specifications: req.specifications ?? '',
    });
    setSelectedCategory(req.requestedCategory);
    updateCode(req.requestedCategory, undefined);
  };

  const handleUnlinkRequest = () => {
    setLinkedRequest(null);
  };

  const checkName = (name: string) => {
    if (!name) { setNameWarnings([]); return; }
    const warns: string[] = [];
    if (name.length < 10) warns.push(`Tên vật tư quá ngắn (${name.length} ký tự) — quy chuẩn yêu cầu tối thiểu 10 ký tự`);
    if (name.length > 120) warns.push(`Tên vật tư quá dài (${name.length} ký tự) — quy chuẩn giới hạn 120 ký tự`);
    const similar = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase().trim()) || name.toLowerCase().trim().includes(p.name.toLowerCase()));
    if (similar.length > 0) warns.push(`Phát hiện ${similar.length} vật tư có tên tương tự: ${similar.slice(0, 2).map(p => p.name).join(', ')}${similar.length > 2 ? '...' : ''} — Kiểm tra trùng lặp trước khi tạo`);
    setNameWarnings(warns);
  };

  const checkCode = (code: string) => {
    if (!code || code === '--') { setCodeWarnings([]); return; }
    const warns: string[] = [];
    const codePattern = /^[A-Z0-9]+(-[A-Z0-9]+){1,3}$/;
    if (!codePattern.test(code)) warns.push(`Mã "${code}" không đúng định dạng — phải viết hoa, ngăn cách bằng dấu gạch ngang (VD: DT-IC-001)`);
    const existing = products.find(p => p.code === code);
    if (existing) warns.push(`Mã "${code}" đã tồn tại trong hệ thống (${existing.name}) — hệ thống sẽ tự tăng số thứ tự`);
    setCodeWarnings(warns);
  };

  const updateCode = (category?: string, subCategory?: string) => {
    const cat = category ?? selectedCategory;
    if (!cat) { setPreviewCode('--'); setCodeWarnings([]); return; }
    const code = generateCode(cat, subCategory);
    setPreviewCode(code);
    checkCode(code);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setFieldValue('subCategory', undefined);
    updateCode(value, undefined);
  };

  const handleSubCategoryChange = (value: string) => {
    updateCode(selectedCategory, value);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      message.success(`Đã tạo vật tư thành công! Mã: ${previewCode}`);
      setSubmitting(false);
      navigate('/products');
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
                onClick={() => navigate('/products')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DatabaseOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>Thêm vật tư mới</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Tạo mã vật tư trực tiếp vào danh mục — Trung tâm Hà Nội</Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      {/* ─── Link approved request ─────────────────────────── */}
      <Card
        style={{ borderRadius: 14, marginBottom: 16, border: linkedRequest ? '1.5px solid #b7eb8f' : '1.5px dashed #d0dff8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        {linkedRequest ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Space size={10} align="center">
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #237804, #52c41a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LinkOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#52c41a', fontWeight: 600, marginBottom: 2 }}>
                  Đã liên kết yêu cầu phê duyệt
                </div>
                <Space size={8}>
                  <Tag style={{ fontFamily: 'monospace', fontSize: 11, background: '#f6ffed', border: '1px solid #b7eb8f', color: '#237804' }}>
                    {linkedRequest.requestCode}
                  </Tag>
                  <Text style={{ fontSize: 13, fontWeight: 500, color: '#1B3A5C' }}>{linkedRequest.requestedName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>· {linkedRequest.requesterDeptName}</Text>
                </Space>
              </div>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={handleUnlinkRequest}
              style={{ color: '#8c8c8c', flexShrink: 0 }}
            >
              Bỏ liên kết
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #D4A843, #f0d890)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AuditOutlined style={{ color: '#7c4f00', fontSize: 14 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C', display: 'block', marginBottom: 6 }}>
                Tạo từ yêu cầu đã phê duyệt
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
                  (không bắt buộc — hoặc tạo thủ công bên dưới)
                </Text>
              </Text>
              <Select
                showSearch
                allowClear
                placeholder="Chọn yêu cầu đã được BGĐ phê duyệt..."
                style={{ width: '100%', maxWidth: 600 }}
                onChange={(val) => val && handleLinkRequest(val)}
                filterOption={(input, option) =>
                  (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={approvedRequests.map((r) => ({
                  value: r.id,
                  label: `${r.requestCode} — ${r.requestedName}`,
                  requestCode: r.requestCode,
                }))}
                optionRender={(opt) => {
                  const req = approvedRequests.find((r) => r.id === opt.value);
                  if (!req) return opt.label;
                  return (
                    <div>
                      <Space size={6}>
                        <Tag color="success" style={{ fontSize: 11, fontFamily: 'monospace' }}>{req.requestCode}</Tag>
                        <Text style={{ fontSize: 13 }}>{req.requestedName}</Text>
                      </Space>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                        {req.requestedCategory} · {req.requesterDeptName}
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        )}
      </Card>

      <Form form={form} layout="vertical" requiredMark={false}>
        <Row gutter={[20, 20]}>

          {/* ─── LEFT: Main form ────────────────────────────────── */}
          <Col xs={24} lg={16}>

            {/* Section 1: Danh mục */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
                icon={<DatabaseOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Danh mục & Phân loại"
              />
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Nhóm vật tư</Text>}
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn nhóm vật tư' }]}
                  >
                    <Select
                      placeholder="Chọn nhóm vật tư..."
                      size="large"
                      options={categoryOptions}
                      onChange={handleCategoryChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Phân nhóm</Text>} name="subCategory">
                    <Select
                      placeholder="Chọn phân nhóm..."
                      size="large"
                      disabled={!selectedCategory}
                      options={(subCategoryOptions[selectedCategory] || []).map((s) => ({ label: s, value: s }))}
                      onChange={handleSubCategoryChange}
                      allowClear
                    />
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
                icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thông tin vật tư"
              />
              <Row gutter={[16, 0]}>
                <Col xs={24}>
                  <Form.Item
                    label={<Text strong>Tên vật tư</Text>}
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên vật tư' }]}
                  >
                    <Input
                      placeholder="VD: Bo mạch xử lý tín hiệu monitoring P-18, Van khí nén S-75..."
                      size="large"
                      style={{ borderRadius: 6 }}
                      onBlur={e => checkName(e.target.value)}
                    />
                  </Form.Item>
                  {nameWarnings.map((w, i) => (
                    <Alert key={i} type="warning" showIcon icon={<WarningOutlined />}
                      message={w} style={{ marginTop: -8, marginBottom: 12, borderRadius: 8, fontSize: 12 }} />
                  ))}
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Loại vật tư</Text>}
                    name="productType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại vật tư' }]}
                  >
                    <Select
                      placeholder="Chọn loại..."
                      size="large"
                      options={Object.entries(productTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Phương thức theo dõi</Text>}
                    name="trackingType"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức theo dõi' }]}
                  >
                    <Select
                      placeholder="Chọn phương thức..."
                      size="large"
                      options={Object.entries(trackingTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Đơn vị tính</Text>}
                    name="baseUnit"
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
                  <Form.Item label={<Text strong>Hạn sử dụng (ngày)</Text>} name="shelfLife">
                    <InputNumber
                      min={0}
                      placeholder="Để trống nếu không giới hạn"
                      style={{ width: '100%', borderRadius: 6 }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Nhà sản xuất</Text>} name="manufacturer">
                    <Select
                      placeholder="Chọn hoặc nhập..."
                      size="large"
                      showSearch
                      allowClear
                      options={manufacturerOptions}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<Text strong>Xuất xứ</Text>} name="origin">
                    <Select
                      placeholder="Quốc gia..."
                      size="large"
                      showSearch
                      allowClear
                      options={originOptions}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label={<Text strong>Quy cách kỹ thuật</Text>} name="specifications">
                    <TextArea
                      placeholder="Mô tả thông số kỹ thuật, tiêu chuẩn áp dụng, điện áp, tần số, kích thước..."
                      rows={3}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="militaryGrade" style={{ marginBottom: 0 }}>
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

            {/* Section 3: Cung ứng */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #237804, #52c41a)"
                icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thông tin cung ứng"
              />
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Thời gian cung ứng (ngày)</Text>}
                    name="leadTimeDays"
                  >
                    <InputNumber min={1} placeholder="30" style={{ width: '100%', borderRadius: 6 }} size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#fff7e6', border: '1px solid #ffe7ba',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <StockOutlined style={{ color: '#d48806', fontSize: 14, marginTop: 1, flexShrink: 0 }} />
                <Text style={{ fontSize: 12, color: '#7c4f00' }}>
                  Các tham số tồn kho (mức tối thiểu, tối đa, điểm đặt hàng lại) được thiết lập riêng
                  sau khi vật tư đã được phân loại — xem tab <strong>Tham số tồn kho</strong> trong chi tiết vật tư.
                </Text>
              </div>
            </Card>

            {/* ─── Bottom action card ─────────────────────────── */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '16px 24px' } }}
            >
              <Row justify="end">
                <Col>
                  <Space size={12}>
                    <Button onClick={() => navigate('/products')}>Hủy</Button>
                    <Button type="primary" loading={submitting} onClick={handleSubmit}
                      style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
                      Tạo vật tư
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

          </Col>

          {/* ─── RIGHT panel ────────────────────────────────────── */}
          <Col xs={24} lg={8}>

            {/* Code preview */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #D4A843, #f0d890)"
                icon={<DatabaseOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
                title="Mã vật tư dự kiến"
              />

              <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                <Tag style={{
                  fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
                  padding: '6px 18px', borderRadius: 8,
                  background: previewCode === '--' ? '#f5f5f5' : 'rgba(27,58,92,0.08)',
                  border: `1px solid ${previewCode === '--' ? '#d9d9d9' : 'rgba(27,58,92,0.25)'}`,
                  color: previewCode === '--' ? '#bbb' : '#1B3A5C',
                }}>
                  {previewCode}
                </Tag>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Cập nhật khi chọn nhóm & phân nhóm
                  </Text>
                </div>
              </div>
              {codeWarnings.map((w, i) => (
                <Alert key={i} type="warning" showIcon icon={<WarningOutlined />}
                  message={w} style={{ marginBottom: 8, borderRadius: 8, fontSize: 12 }} />
              ))}

              <div style={{ marginTop: 12 }}>
                {Object.entries(categoryPrefixMap).map(([cat, pfx]) => (
                  <div key={cat} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 8px', borderRadius: 6, marginBottom: 2,
                    background: selectedCategory === cat ? 'rgba(27,58,92,0.06)' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: selectedCategory === cat ? '#1B3A5C' : '#888',
                      fontWeight: selectedCategory === cat ? 600 : 400,
                    }}>
                      {cat}
                    </Text>
                    <Tag style={{
                      fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                      color: '#1B3A5C', background: 'rgba(27,58,92,0.08)', border: 'none', margin: 0,
                    }}>
                      {pfx}-XX-NNN
                    </Tag>
                  </div>
                ))}
              </div>
            </Card>

            {/* Nguồn yêu cầu — hiện khi đã link */}
            {linkedRequest && (
              <Card
                style={{ borderRadius: 14, border: '1.5px solid #b7eb8f', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, background: '#f6ffed' }}
                styles={{ body: { padding: '16px 18px' } }}
              >
                <Space align="center" size={8} style={{ marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'linear-gradient(135deg, #237804, #52c41a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AuditOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ fontSize: 13, color: '#237804' }}>Nguồn yêu cầu</Text>
                </Space>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Mã yêu cầu</Text>
                    <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{linkedRequest.requestCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Đơn vị đề nghị</Text>
                    <Text style={{ fontSize: 12 }}>{linkedRequest.requesterDeptName}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Người đề nghị</Text>
                    <Text style={{ fontSize: 12 }}>{linkedRequest.requesterName}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Số lượng đề nghị</Text>
                    <Text style={{ fontSize: 12, fontWeight: 600 }}>{linkedRequest.estimatedQty} {linkedRequest.requestedUnit}</Text>
                  </div>
                  {linkedRequest.purpose && (
                    <>
                      <Divider style={{ margin: '6px 0' }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>Mục đích:</Text>
                      <Text style={{ fontSize: 12, color: '#444' }}>{linkedRequest.purpose}</Text>
                    </>
                  )}
                </Space>
              </Card>
            )}

            {/* Bước tiếp theo sau khi tạo */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #531dab, #722ed1)"
                icon={<RightOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Bước tiếp theo"
              />
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: '#f6ffed', border: '1px solid #b7eb8f',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <StockOutlined style={{ color: '#237804', fontSize: 14, marginTop: 1, flexShrink: 0 }} />
                <div>
                  <Text strong style={{ fontSize: 12, color: '#237804', display: 'block' }}>Tham số tồn kho</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>
                    Sau khi tạo, thiết lập mức tồn kho tối thiểu, tối đa và điểm đặt hàng lại trong tab <strong>Tham số tồn kho</strong> của vật tư
                  </Text>
                </div>
              </div>
            </Card>

            {/* Lưu ý */}
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1890ff, #40a9ff)"
                icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Lưu ý"
              />
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {[
                  'Chức năng này dành cho quản lý kho và admin — vật tư được tạo ngay, không qua workflow phê duyệt',
                  'Kiểm tra trùng lặp với danh mục hiện có trước khi tạo',
                  'Mã vật tư được sinh tự động theo nhóm và phân nhóm',
                  'Trung tâm/phòng ban sử dụng chức năng "Yêu cầu bổ sung" để đề xuất thêm vật tư',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginTop: 2, flexShrink: 0 }} />
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

export default ProductForm;
