import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Form, Input, Select, Switch, InputNumber, Button, Space, Row, Col,
  Typography, Divider, Tag, Alert, Descriptions, App, Spin,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, SendOutlined, CheckCircleOutlined,
  WarningOutlined, InfoCircleOutlined, TagsOutlined, SafetyOutlined,
  ToolOutlined, FileTextOutlined, StockOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { products } from '../../data/products';
import { productClassifications } from '../../data/productClassifications';
import { inboundOrders } from '../../data/inboundOrders';
import { outboundOrders } from '../../data/outboundOrders';
import {
  productTypeConfig, trackingTypeConfig, validateClassification,
  productTypeAttributeRules,
} from '../../utils/format';
import type { ProductType, TrackingType, ManagementAttributes, ProductClassificationRecord } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

// ─── Form state ───────────────────────────────────────────
interface FormValues {
  productType: ProductType;
  trackingType: TrackingType;
  militaryGrade: boolean;
  trackExpiry: boolean;
  shelfLife: number | null;
  qcRequiredOnReceipt: boolean;
  qcRequiredOnDispatch: boolean;
  requiresMaintenance: boolean;
  maintenanceIntervalDays: number | null;
  criticalPart: boolean;
  // minStock / maxStock / reorderPoint đã tách sang StockParameterRecord
  classificationReason: string;
  note: string | null;
}

// ─── Chỉ cho phép re-classify vật tư đã có phân loại ────
const classifiedProductIds = new Set(
  productClassifications
    .filter(r => r.classificationStatus === 'applied')
    .map(r => r.productId)
);
const reclassifiableProducts = products.filter(p => classifiedProductIds.has(p.id));

const ProductClassificationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modal, message } = App.useApp();
  const { currentUser } = useUser();

  const isEdit = Boolean(id);
  const productIdParam = searchParams.get('productId');

  // ─── Bước chọn vật tư khi chưa có productId ──────────────
  const [selectedProductId, setSelectedProductId] = useState<string | null>(productIdParam);

  const effectiveProductId = selectedProductId;

  // ─── Load existing record (edit) or target product (new) ──
  const existingRecord = useMemo<ProductClassificationRecord | null>(() => {
    if (!isEdit || !id) return null;
    return productClassifications.find(r => r.id === id) || null;
  }, [isEdit, id]);

  const targetProduct = useMemo(() => {
    const pid = existingRecord?.productId || effectiveProductId;
    if (!pid) return null;
    return products.find(p => p.id === pid) || null;
  }, [existingRecord, effectiveProductId]);

  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  // ─── Watch fields for live validation ────────────────────
  const watchedType = Form.useWatch('productType', form);
  const watchedTracking = Form.useWatch('trackingType', form);
  const watchedTrackExpiry = Form.useWatch('trackExpiry', form);
  const watchedRequiresMaint = Form.useWatch('requiresMaintenance', form);
  const watchedAttrs = Form.useWatch(
    ['trackExpiry', 'shelfLife', 'qcRequiredOnReceipt', 'qcRequiredOnDispatch',
      'requiresMaintenance', 'maintenanceIntervalDays', 'criticalPart'],
    form,
  );

  const attrs: Partial<ManagementAttributes> = useMemo(() => ({
    trackExpiry: watchedAttrs?.[0] ?? false,
    shelfLife: watchedAttrs?.[1] ?? null,
    qcRequiredOnReceipt: watchedAttrs?.[2] ?? false,
    qcRequiredOnDispatch: watchedAttrs?.[3] ?? false,
    requiresMaintenance: watchedAttrs?.[4] ?? false,
    maintenanceIntervalDays: watchedAttrs?.[5] ?? null,
    criticalPart: watchedAttrs?.[6] ?? false,
  }), [watchedAttrs]);

  const validationErrors = useMemo(() => {
    if (!watchedType || !watchedTracking) return [];
    return validateClassification(watchedType, watchedTracking, attrs);
  }, [watchedType, watchedTracking, attrs]);

  // ─── Kiểm tra vật tư đã có giao dịch chưa ────────────────
  const productHasTransactions = useMemo(() => {
    const pid = existingRecord?.productId || effectiveProductId;
    if (!pid) return false;
    const product = products.find(p => p.id === pid);
    if (!product) return false;
    const hasInbound = inboundOrders.some(o =>
      o.lines.some(l => l.productId === pid || l.productCode === product.code)
    );
    const hasOutbound = outboundOrders.some(o =>
      o.lines.some(l => l.productId === pid || l.productCode === product.code)
    );
    return hasInbound || hasOutbound;
  }, [existingRecord, effectiveProductId]);

  // ─── Block đổi productType nếu đã có giao dịch ───────────
  const originalProductType = existingRecord?.productType ?? null;
  useEffect(() => {
    if (!watchedType || !originalProductType) return;
    if (watchedType !== originalProductType && productHasTransactions) {
      modal.warning({
        title: 'Không thể thay đổi loại vật tư',
        content: (
          <div>
            <p>Vật tư này đã có giao dịch nhập/xuất kho trong hệ thống.</p>
            <p style={{ color: '#8c8c8c', fontSize: 13 }}>
              Thay đổi <strong>Loại vật tư</strong> khi đã có giao dịch có thể gây xung đột dữ liệu lịch sử. Vui lòng liên hệ quản trị hệ thống nếu thực sự cần thay đổi.
            </p>
          </div>
        ),
        okText: 'Đã hiểu',
        onOk: () => {
          form.setFieldsValue({ productType: originalProductType });
        },
      });
    }
  }, [watchedType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Apply attribute rules: auto-set forbidden fields ─────
  useEffect(() => {
    if (!watchedType) return;
    const rules = productTypeAttributeRules[watchedType];
    const forbidden = rules.filter(r => r.rule === 'forbidden');
    const defaults: Partial<FormValues> = {};
    forbidden.forEach(r => {
      defaults[r.field as keyof FormValues] = r.defaultValue as never;
    });
    // For equipment: enforce serial tracking
    if (watchedType === 'equipment' && watchedTracking !== 'serial') {
      defaults.trackingType = 'serial';
    }
    if (Object.keys(defaults).length > 0) {
      form.setFieldsValue(defaults);
    }
  }, [watchedType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Initialize form values ───────────────────────────────
  useEffect(() => {
    if (existingRecord) {
      form.setFieldsValue({
        productType: existingRecord.productType,
        trackingType: existingRecord.trackingType,
        militaryGrade: existingRecord.militaryGrade,
        trackExpiry: existingRecord.trackExpiry,
        shelfLife: existingRecord.shelfLife,
        qcRequiredOnReceipt: existingRecord.qcRequiredOnReceipt,
        qcRequiredOnDispatch: existingRecord.qcRequiredOnDispatch,
        requiresMaintenance: existingRecord.requiresMaintenance,
        maintenanceIntervalDays: existingRecord.maintenanceIntervalDays,
        criticalPart: existingRecord.criticalPart,
        classificationReason: existingRecord.classificationReason,
        note: existingRecord.note,
      });
    } else if (targetProduct) {
      form.setFieldsValue({
        productType: targetProduct.productType,
        trackingType: targetProduct.trackingType,
        militaryGrade: targetProduct.militaryGrade ?? false,
        trackExpiry: targetProduct.trackExpiry ?? false,
        shelfLife: targetProduct.shelfLife ?? null,
        qcRequiredOnReceipt: targetProduct.qcRequiredOnReceipt ?? false,
        qcRequiredOnDispatch: targetProduct.qcRequiredOnDispatch ?? false,
        requiresMaintenance: targetProduct.requiresMaintenance ?? false,
        maintenanceIntervalDays: targetProduct.maintenanceIntervalDays ?? null,
        criticalPart: targetProduct.criticalPart ?? false,
        classificationReason: '',
        note: null,
      });
    }
  }, [existingRecord, targetProduct, form]);

  // ─── Màn chọn vật tư nếu chưa có productId ──────────────
  if (!existingRecord && !targetProduct) {
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
                  onClick={() => navigate('/product-classifications')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
                />
                <Space align="center" size={10}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TagsOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>Chọn vật tư cần cập nhật phân loại</Title>
                  </div>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={16}>
          <Col span={14}>
            <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: 'none' }} styles={{ body: { padding: 24 } }}>
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ fontSize: 14, color: '#1B3A5C', display: 'block', marginBottom: 6 }}>
                  Chọn vật tư
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chỉ hiển thị vật tư đã có phân loại được áp dụng. Phân loại ban đầu được nhập khi tạo vật tư — chức năng này dành cho việc cập nhật lại phân loại khi cần thay đổi.
                </Text>
              </div>

              <Select
                showSearch
                placeholder="Tìm mã hoặc tên vật tư..."
                style={{ width: '100%', marginBottom: 20 }}
                size="large"
                filterOption={(input, option) =>
                  (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(val: string) => setSelectedProductId(val)}
                optionLabelProp="label"
              >
                {reclassifiableProducts.map(p => (
                  <Option key={p.id} value={p.id} label={`${p.code} — ${p.name}`}>
                    <div>
                      <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{p.code}</Text>
                      <Text style={{ fontSize: 13, marginLeft: 8 }}>{p.name}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>{p.category}</Text>
                  </Option>
                ))}
              </Select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => navigate('/product-classifications')}>Hủy</Button>
                <Button
                  type="primary"
                  disabled={!selectedProductId}
                  onClick={() => {
                    if (selectedProductId) {
                      setSearchParams({ productId: selectedProductId });
                    }
                  }}
                  style={{ background: '#1B3A5C', border: 'none' }}
                >
                  Tiếp tục
                </Button>
              </div>
            </Card>
          </Col>

          <Col span={10}>
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: 'none' }}
              styles={{ body: { padding: 20 } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #D4A843, #f0d890)"
                icon={<InfoCircleOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
                title="Hướng dẫn"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { step: '1', text: 'Chọn vật tư cần cập nhật phân loại từ danh sách bên trái' },
                  { step: '2', text: 'Điều chỉnh thông tin: loại vật tư, phương thức theo dõi, thuộc tính QC & bảo trì' },
                  { step: '3', text: 'Lưu nháp để hoàn thiện sau, hoặc gửi phê duyệt Ban Giám đốc ngay' },
                  { step: '4', text: 'Sau khi BGĐ phê duyệt, phân loại mới được áp dụng và ghi vào lịch sử thay đổi' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                    }}>
                      {item.step}
                    </div>
                    <Text style={{ fontSize: 12, color: '#595959', lineHeight: 1.6 }}>{item.text}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  const product = targetProduct!;

  // ─── Handlers ─────────────────────────────────────────────
  const handleSaveDraft = async () => {
    try {
      await form.validateFields(['productType', 'trackingType', 'classificationReason']);
    } catch {
      message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      message.success('Đã lưu bản nháp thành công');
      navigate('/product-classifications');
    }, 800);
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      const errors = validationErrors.filter(e => e.type === 'error');
      if (errors.length > 0) {
        message.error('Vui lòng sửa các lỗi kiểm tra trước khi gửi phê duyệt');
        return;
      }
      modal.confirm({
        title: 'Gửi phê duyệt',
        content: (
          <div>
            <p>Bạn có chắc chắn muốn gửi hồ sơ phân loại này lên Ban Giám đốc phê duyệt?</p>
            <p style={{ color: '#8c8c8c', fontSize: 13 }}>
              Sau khi gửi, hồ sơ sẽ chuyển sang trạng thái <strong>Chờ phê duyệt</strong> và không thể chỉnh sửa cho đến khi có phản hồi.
            </p>
          </div>
        ),
        okText: 'Gửi phê duyệt',
        okType: 'primary',
        cancelText: 'Hủy',
        onOk: () => {
          setSaving(true);
          setTimeout(() => {
            setSaving(false);
            message.success('Đã gửi phê duyệt thành công');
            navigate('/product-classifications');
          }, 800);
        },
      });
    }).catch(() => {
      message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
    });
  };

  // ─── Forbidden field check ────────────────────────────────
  const isForbidden = (field: keyof ManagementAttributes): boolean => {
    if (!watchedType) return false;
    const rules = productTypeAttributeRules[watchedType];
    return rules.some(r => r.field === field && r.rule === 'forbidden');
  };

  const isRequired = (field: keyof ManagementAttributes): boolean => {
    if (!watchedType) return false;
    const rules = productTypeAttributeRules[watchedType];
    return rules.some(r => r.field === field && r.rule === 'required');
  };

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warnCount = validationErrors.filter(e => e.type === 'warning').length;

  return (
    <Spin spinning={saving}>
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
                onClick={() => navigate('/product-classifications')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={10}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TagsOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>
                    {isEdit ? 'Chỉnh sửa phân loại' : 'Cập nhật phân loại'}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{product.code} — {product.name} · {product.category}</Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space size={12}>
              <Button icon={<SaveOutlined />} onClick={handleSaveDraft}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}>
                Lưu nháp
              </Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}
                style={{ background: 'rgba(212,168,67,0.9)', border: '1px solid rgba(212,168,67,0.6)', color: '#0a1628', borderRadius: 8, fontWeight: 600 }}>
                Gửi phê duyệt
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>
        <Row gutter={16}>
          {/* ─── Left: form sections ──────────────────────── */}
          <Col span={16}>

            {/* Section 1: Loại vật tư */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
              styles={{ body: { padding: 20 } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
                icon={<TagsOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Loại vật tư & Phương thức theo dõi"
              />
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="productType"
                    label={<span style={{ fontSize: 13, fontWeight: 500 }}>Loại vật tư</span>}
                    rules={[{ required: true, message: 'Chọn loại vật tư' }]}
                  >
                    <Select placeholder="Chọn loại" size="middle">
                      {Object.entries(productTypeConfig).map(([k, v]) => (
                        <Option key={k} value={k}>
                          <Tag color={v.color} style={{ marginRight: 4 }}>{v.label}</Tag>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="trackingType"
                    label={<span style={{ fontSize: 13, fontWeight: 500 }}>Phương thức theo dõi</span>}
                    rules={[{ required: true, message: 'Chọn phương thức theo dõi' }]}
                    extra={watchedType === 'equipment' ? <span style={{ fontSize: 11, color: '#faad14' }}>Thiết bị bắt buộc dùng Serial</span> : undefined}
                  >
                    <Select
                      placeholder="Chọn phương thức"
                      disabled={watchedType === 'equipment'}
                    >
                      {Object.entries(trackingTypeConfig).map(([k, v]) => (
                        <Option key={k} value={k}>
                          <Tag color={v.color}>{v.label}</Tag>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="militaryGrade"
                    label={<span style={{ fontSize: 13, fontWeight: 500 }}>Tiêu chuẩn doanh nghiệp</span>}
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Có"
                      unCheckedChildren="Không"
                      style={{ background: undefined }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="classificationReason"
                label={<span style={{ fontSize: 13, fontWeight: 500 }}>Lý do phân loại <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập lý do phân loại' }, { min: 20, message: 'Tối thiểu 20 ký tự' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Mô tả lý do chọn loại vật tư, phương thức theo dõi và các thuộc tính quản lý..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Card>

            {/* Section 2: Thuộc tính theo dõi */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
              styles={{ body: { padding: 20 } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #0958d9, #1890ff)"
                icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thuộc tính theo dõi"
              />
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Form.Item
                    name="trackExpiry"
                    label={<span style={{ fontSize: 13, fontWeight: 500 }}>Theo dõi hạn sử dụng</span>}
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Có"
                      unCheckedChildren="Không"
                      disabled={isForbidden('trackExpiry')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="shelfLife"
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        Hạn sử dụng (ngày)
                        {watchedTrackExpiry && <span style={{ color: '#ff4d4f' }}> *</span>}
                      </span>
                    }
                    rules={watchedTrackExpiry ? [{ required: true, message: 'Nhập hạn sử dụng' }] : []}
                  >
                    <InputNumber
                      min={1}
                      max={9999}
                      placeholder="VD: 365"
                      disabled={!watchedTrackExpiry}
                      style={{ width: '100%' }}
                      addonAfter="ngày"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="criticalPart"
                    label={<span style={{ fontSize: 13, fontWeight: 500 }}>Linh kiện quan trọng</span>}
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Section 3: QC & Bảo trì */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
              styles={{ body: { padding: 20 } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #389e0d, #52c41a)"
                icon={<SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Kiểm soát chất lượng & Bảo trì"
              />
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="qcRequiredOnReceipt"
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        QC khi nhập kho
                        {isRequired('qcRequiredOnReceipt') && <span style={{ color: '#ff4d4f' }}> *</span>}
                      </span>
                    }
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Có"
                      unCheckedChildren="Không"
                      disabled={isForbidden('qcRequiredOnReceipt')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="qcRequiredOnDispatch"
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        QC khi xuất kho
                        {isRequired('qcRequiredOnDispatch') && <span style={{ color: '#ff4d4f' }}> *</span>}
                      </span>
                    }
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Có"
                      unCheckedChildren="Không"
                      disabled={isForbidden('qcRequiredOnDispatch')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '4px 0 16px', borderColor: '#f0f0f0' }} />

              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Form.Item
                    name="requiresMaintenance"
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        Yêu cầu bảo trì định kỳ
                        {isRequired('requiresMaintenance') && <span style={{ color: '#ff4d4f' }}> *</span>}
                      </span>
                    }
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Có"
                      unCheckedChildren="Không"
                      disabled={isForbidden('requiresMaintenance')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="maintenanceIntervalDays"
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        Chu kỳ bảo trì
                        {watchedRequiresMaint && <span style={{ color: '#ff4d4f' }}> *</span>}
                      </span>
                    }
                    rules={watchedRequiresMaint ? [{ required: true, message: 'Nhập chu kỳ bảo trì' }] : []}
                  >
                    <InputNumber
                      min={1}
                      max={3650}
                      placeholder="VD: 180"
                      disabled={!watchedRequiresMaint || isForbidden('requiresMaintenance')}
                      style={{ width: '100%' }}
                      addonAfter="ngày"
                    />
                  </Form.Item>
                </Col>
                {watchedType === 'consumable' && (
                  <Col span={8}>
                    <div style={{
                      background: '#fff7e6',
                      border: '1px solid #ffd591',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      color: '#d46b08',
                    }}>
                      <WarningOutlined style={{ marginRight: 6 }} />
                      Vật tư tiêu hao không được gán yêu cầu bảo trì
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Section 4: Ghi chú */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
              styles={{ body: { padding: 20 } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #595959, #8c8c8c)"
                icon={<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Ghi chú bổ sung"
              />
              <Form.Item name="note" noStyle>
                <TextArea
                  rows={3}
                  placeholder="Ghi chú thêm về quyết định phân loại (không bắt buộc)..."
                  maxLength={300}
                  showCount
                />
              </Form.Item>
            </Card>
          </Col>

          {/* ─── Right panel ──────────────────────────────── */}
          <Col span={8}>

            {/* Product info */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
              styles={{ body: { padding: 16 } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #D4A843, #f0d890)"
                icon={<ToolOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
                title="Thông tin vật tư"
              />
              <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12, width: 120 }} contentStyle={{ fontSize: 12, fontWeight: 500 }}>
                <Descriptions.Item label="Mã vật tư">{product.code}</Descriptions.Item>
                <Descriptions.Item label="Tên vật tư">
                  <span style={{ color: '#1B3A5C', fontWeight: 600 }}>{product.name}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm">{product.category}</Descriptions.Item>
                <Descriptions.Item label="Đơn vị tính">{product.baseUnit}</Descriptions.Item>
                <Descriptions.Item label="Nhà sản xuất">{product.manufacturer || '—'}</Descriptions.Item>
                {product.specifications && (
                  <Descriptions.Item label="Thông số">
                    <span style={{ color: '#595959' }}>{product.specifications}</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
              {product.militaryGrade && (
                <Tag color="#1B3A5C" style={{ marginTop: 8, fontSize: 11 }}>Tiêu chuẩn doanh nghiệp</Tag>
              )}
            </Card>

            {/* Live validation */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
              styles={{ body: { padding: 16 } }}
            >
              <Space align="center" size={10} style={{ marginBottom: 18, width: '100%', justifyContent: 'space-between' }}>
                <Space align="center" size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: errorCount === 0 ? 'linear-gradient(135deg, #237804, #52c41a)' : 'linear-gradient(135deg, #cf1322, #ff4d4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Kiểm tra quy tắc</Text>
                </Space>
                {(errorCount > 0 || warnCount > 0) && (
                  <Space size={4}>
                    {errorCount > 0 && <Tag color="error" style={{ fontSize: 11, margin: 0 }}>{errorCount} lỗi</Tag>}
                    {warnCount > 0 && <Tag color="warning" style={{ fontSize: 11, margin: 0 }}>{warnCount} cảnh báo</Tag>}
                  </Space>
                )}
              </Space>
              {validationErrors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#52c41a' }}>
                  <CheckCircleOutlined style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
                  <Text style={{ fontSize: 12, color: '#52c41a' }}>Tất cả quy tắc đều hợp lệ</Text>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {validationErrors.map((err, i) => (
                    <Alert
                      key={i}
                      type={err.type}
                      message={<span style={{ fontSize: 12 }}>{err.message}</span>}
                      showIcon
                      style={{ padding: '6px 10px', borderRadius: 8 }}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Stock parameters notice */}
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: '1px solid #d9f0ff' }}
              styles={{ body: { padding: 14, background: '#f0f9ff', borderRadius: 14 } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <StockOutlined style={{ color: '#1890ff', fontSize: 16, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0958d9', marginBottom: 4 }}>
                    Tham số tồn kho được quản lý riêng
                  </div>
                  <div style={{ fontSize: 11, color: '#4a6fa5', lineHeight: 1.6 }}>
                    Mức tồn kho tối thiểu, tối đa và điểm đặt hàng lại (<strong>minStock / maxStock / reorderPoint</strong>) được quản lý tại tab <strong>"Tham số tồn kho"</strong> trong Danh mục vật tư.
                  </div>
                  {targetProduct && (
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: '4px 0', fontSize: 11, height: 'auto', marginTop: 4 }}
                      onClick={() => navigate(`/products/${targetProduct.id}?tab=stock-params`)}
                    >
                      Xem tham số tồn kho →
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Version / edit info */}
            {existingRecord && (
              <Card
                style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
                styles={{ body: { padding: 16 } }}
              >
                <SectionHeader
                  gradient="linear-gradient(135deg, #0958d9, #1890ff)"
                  icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
                  title="Thông tin hồ sơ"
                />
                <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12, width: 100 }} contentStyle={{ fontSize: 12 }}>
                  <Descriptions.Item label="Mã hồ sơ">{existingRecord.code}</Descriptions.Item>
                  <Descriptions.Item label="Phiên bản">v{existingRecord.version}</Descriptions.Item>
                  <Descriptions.Item label="Người tạo">{existingRecord.createdBy}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {existingRecord.classificationStatus === 'returned_for_edit' && (
                      <Tag color="orange" style={{ fontSize: 11 }}>Trả về sửa</Tag>
                    )}
                    {existingRecord.classificationStatus === 'draft' && (
                      <Tag color="processing" style={{ fontSize: 11 }}>Nháp</Tag>
                    )}
                  </Descriptions.Item>
                  {existingRecord.approvalNote && (
                    <Descriptions.Item label="Ghi chú BGĐ">
                      <span style={{ color: '#d46b08' }}>{existingRecord.approvalNote}</span>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Submit help text */}
            <div style={{
              background: '#e6f4ff',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 12,
              color: '#0958d9',
              border: '1px solid #91caff',
            }}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />
              <strong>Lưu nháp</strong> để tiếp tục chỉnh sửa sau. Chọn <strong>Gửi phê duyệt</strong> khi đã hoàn tất — Ban Giám đốc sẽ xem xét và phê duyệt trong vòng 1–2 ngày làm việc.
            </div>
          </Col>
        </Row>

      </Form>
    </Spin>
  );
};

export default ProductClassificationForm;
