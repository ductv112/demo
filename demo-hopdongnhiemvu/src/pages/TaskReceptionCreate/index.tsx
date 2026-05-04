import React, { useState } from 'react';
import {
  Card, Button, Row, Col, Typography, Space, Steps,
  Form, Input, Select, InputNumber, DatePicker, Upload,
  Checkbox, Descriptions, Tag, Result, message,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, SolutionOutlined,
  FileTextOutlined, SaveOutlined, InboxOutlined,
  SafetyCertificateOutlined, TagsOutlined,
  CheckCircleOutlined, SendOutlined, WarningOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { departments } from '../../data/departments';
import {
  missionTypeConfig, missionPriorityConfig,
  missionComplexityConfig, executionScopeConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Text } = Typography;

const checklistItems = [
  { key: 'doc', label: 'Công văn / đơn đặt hàng gốc đầy đủ, hợp lệ' },
  { key: 'unit', label: 'Thông tin đơn vị giao dự án chính xác' },
  { key: 'equipment', label: 'Loại sản phẩm/hệ thống và số lượng rõ ràng' },
  { key: 'specs', label: 'Thông số kỹ thuật đầy đủ theo danh mục chuẩn' },
  { key: 'quality', label: 'Yêu cầu chất lượng được xác định' },
  { key: 'deadline', label: 'Thời hạn hoàn thành hợp lý, khả thi' },
  { key: 'scope', label: 'Phạm vi nhiệm vụ được xác định rõ' },
  { key: 'standard', label: 'Dữ liệu đã chuẩn hóa theo biểu mẫu hệ thống' },
];

const sectionIcon = (icon: React.ReactNode, gradient: string) => (
  <div style={{
    width: 28, height: 28, borderRadius: 7, background: gradient,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>{icon}</div>
);

const TaskReceptionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const technicalDepts = departments.filter(d => d.type === 'technical');
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === checklistItems.length;

  const formValues = Form.useWatch([], form) || {};

  const validateStep = async (step: number): Promise<boolean> => {
    try {
      if (step === 0) {
        await form.validateFields(['documentNumber', 'requestingUnit', 'name', 'equipmentType', 'description']);
        return true;
      }
      if (step === 1) return allChecked;
      if (step === 2) {
        await form.validateFields(['missionType', 'priority', 'complexity', 'executionScope', 'assignedDepartment']);
        return true;
      }
      return true;
    } catch { return false; }
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) {
      if (currentStep === 1) message.warning('Vui lòng tick đủ tất cả mục kiểm tra');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    message.success('Đã tiếp nhận và trình duyệt nhiệm vụ mới thành công');
    navigate('/missions');
  };

  const stepItems = [
    { title: 'Tiếp nhận', icon: <FileTextOutlined /> },
    { title: 'Kiểm tra', icon: <SafetyCertificateOutlined /> },
    { title: 'Phân loại', icon: <TagsOutlined /> },
    { title: 'Khởi tạo hồ sơ', icon: <SolutionOutlined /> },
    { title: 'Trình duyệt', icon: <SendOutlined /> },
  ];

  // ─── Step 1: Tiếp nhận yêu cầu ─────────────────────────
  const renderStep1 = () => (
    <>
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            {sectionIcon(<SolutionOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 14 }}>Thông tin tiếp nhận</Text>
          </Space>
        </div>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Số công văn / Đơn hàng" name="documentNumber" rules={[{ required: true, message: 'Nhập số công văn' }]}>
              <Input placeholder="VD: CV-361/2026-KT" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Ngày công văn" name="documentDate">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Đơn vị giao" name="requestingUnit" rules={[{ required: true, message: 'Nhập đơn vị giao' }]}>
              <Input placeholder="VD: Khối K01" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Tên nhiệm vụ" name="name" rules={[{ required: true, message: 'Nhập tên nhiệm vụ' }]}>
          <Input placeholder="VD: Nâng cấp hệ thống monitoring P-18 server-1245" />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Loại sản phẩm/hệ thống" name="equipmentType" rules={[{ required: true, message: 'Nhập loại sản phẩm/hệ thống' }]}>
              <Input placeholder="VD: Hệ thống monitoring P-18" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Số lượng" name="equipmentQuantity" initialValue={1}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Hạn hoàn thành" name="deadline">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Mô tả nhiệm vụ" name="description" rules={[{ required: true, message: 'Nhập mô tả' }]}>
          <Input.TextArea rows={3} placeholder="Mô tả chi tiết nội dung nhiệm vụ" />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Yêu cầu kỹ thuật" name="technicalRequirements">
              <Input.TextArea rows={2} placeholder="Thông số kỹ thuật, tiêu chuẩn cần đạt" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Yêu cầu chất lượng" name="qualityRequirements">
              <Input.TextArea rows={2} placeholder="VD: Tiêu chuẩn QS ISO 9001:2015" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            {sectionIcon(<UploadOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #7c3aed, #a78bfa)')}
            <Text strong style={{ color: colors.navy, fontSize: 14 }}>Tài liệu đính kèm</Text>
          </Space>
        </div>
        <Form.Item name="attachments" valuePropName="fileList" getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}>
          <Upload.Dragger beforeUpload={() => false} multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg">
            <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: colors.navyLight }} /></p>
            <p className="ant-upload-text" style={{ fontSize: 13 }}>Kéo thả hoặc nhấn để tải lên</p>
            <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>Công văn, đơn đặt hàng, hồ sơ kỹ thuật</p>
          </Upload.Dragger>
        </Form.Item>
      </Card>
    </>
  );

  // ─── Step 2: Kiểm tra & Chuẩn hóa ──────────────────────
  const renderStep2 = () => {
    const hasIssues = !formValues.technicalRequirements || !formValues.qualityRequirements;
    return (
      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card className="db-chart-card" style={{ borderRadius: 14, height: '100%' }} styles={{ body: { padding: 20 } }}
            title={<Space size={8}>{sectionIcon(<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}<Text strong style={{ color: colors.navy, fontSize: 14 }}>Hồ sơ đã nhập</Text></Space>}>
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600, color: colors.navy, width: 130, fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Số công văn">{formValues.documentNumber || <Tag color="warning">Chưa nhập</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị giao">{formValues.requestingUnit || <Tag color="warning">Chưa nhập</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Tên nhiệm vụ">{formValues.name || <Tag color="warning">Chưa nhập</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm/Hệ thống">{formValues.equipmentType ? `${formValues.equipmentType} — SL: ${formValues.equipmentQuantity || 1}` : <Tag color="warning">Chưa nhập</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Yêu cầu KT">{formValues.technicalRequirements || <Tag color="warning">Chưa có</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Yêu cầu CL">{formValues.qualityRequirements || <Tag color="warning">Chưa có</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Mô tả"><Text style={{ fontSize: 12 }}>{formValues.description || '—'}</Text></Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => setCurrentStep(0)}>Quay lại chỉnh sửa</Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}
            title={<Space size={8}>{sectionIcon(<SafetyCertificateOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #059669, #34d399)')}<Text strong style={{ color: colors.navy, fontSize: 14 }}>Checklist rà soát</Text><Tag color={allChecked ? 'success' : 'processing'}>{checkedCount}/{checklistItems.length}</Tag></Space>}>
            {hasIssues && (
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
                <div>
                  <Text strong style={{ fontSize: 12 }}>Thông tin chưa đầy đủ</Text>
                  <div style={{ fontSize: 11, color: '#666' }}>
                    {!formValues.technicalRequirements && <Tag color="warning" style={{ fontSize: 10 }}>Thiếu YC kỹ thuật</Tag>}
                    {!formValues.qualityRequirements && <Tag color="warning" style={{ fontSize: 10 }}>Thiếu YC chất lượng</Tag>}
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {checklistItems.map(item => (
                <div key={item.key} style={{
                  padding: '8px 12px', borderRadius: 8,
                  background: checked[item.key] ? '#f6ffed' : '#fafafa',
                  border: `1px solid ${checked[item.key] ? '#b7eb8f' : '#f0f0f0'}`,
                }}>
                  <Checkbox checked={!!checked[item.key]} onChange={e => setChecked(prev => ({ ...prev, [item.key]: e.target.checked }))}>
                    <Text style={{ fontSize: 13, color: checked[item.key] ? colors.success : '#333' }}>{item.label}</Text>
                  </Checkbox>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  // ─── Step 3: Phân loại ──────────────────────────────────
  const renderStep3 = () => (
    <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
      <div style={{ marginBottom: 16 }}>
        <Space align="center" size={8}>
          {sectionIcon(<TagsOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #d97706, #fbbf24)')}
          <Text strong style={{ color: colors.navy, fontSize: 14 }}>Phân loại nhiệm vụ</Text>
        </Space>
      </div>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Loại nhiệm vụ" name="missionType" rules={[{ required: true, message: 'Chọn loại' }]}>
            <Select placeholder="Chọn loại">
              {Object.entries(missionTypeConfig).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Mức ưu tiên" name="priority" rules={[{ required: true, message: 'Chọn mức' }]}>
            <Select placeholder="Chọn mức">
              {Object.entries(missionPriorityConfig).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Độ phức tạp kỹ thuật" name="complexity" rules={[{ required: true, message: 'Chọn mức' }]}>
            <Select placeholder="Chọn mức">
              {Object.entries(missionComplexityConfig).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Phạm vi thực hiện" name="executionScope" rules={[{ required: true, message: 'Chọn phạm vi' }]}>
            <Select placeholder="Chọn phạm vi">
              {Object.entries(executionScopeConfig).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Phân hệ xử lý chính" name="assignedDepartment" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
            <Select placeholder="Chọn trung tâm / phòng ban">
              {technicalDepts.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // ─── Step 4: Khởi tạo hồ sơ (tổng hợp) ─────────────────
  const renderStep4 = () => {
    const typeCfg = missionTypeConfig[formValues.missionType as keyof typeof missionTypeConfig];
    const prioCfg = missionPriorityConfig[formValues.priority as keyof typeof missionPriorityConfig];
    const compCfg = missionComplexityConfig[formValues.complexity as keyof typeof missionComplexityConfig];
    const scopeCfg = executionScopeConfig[formValues.executionScope as keyof typeof executionScopeConfig];
    const dept = departments.find(d => d.id === formValues.assignedDepartment);
    return (
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            {sectionIcon(<SolutionOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 14 }}>Tổng hợp hồ sơ nhiệm vụ</Text>
          </Space>
        </div>
        <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '14px 18px', marginBottom: 16, borderLeft: `4px solid ${colors.navy}` }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Mã nhiệm vụ (hệ thống tự cấp)</Text>
          <div><Text strong style={{ fontSize: 18, color: colors.navy }}>NV-2026-009</Text> <Tag color="default">Mới tiếp nhận</Tag></div>
        </div>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
          labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}>
          <Descriptions.Item label="Số công văn">{formValues.documentNumber}</Descriptions.Item>
          <Descriptions.Item label="Đơn vị giao">{formValues.requestingUnit}</Descriptions.Item>
          <Descriptions.Item label="Tên nhiệm vụ" span={2}>{formValues.name}</Descriptions.Item>
          <Descriptions.Item label="Sản phẩm/Hệ thống">{formValues.equipmentType} — SL: {formValues.equipmentQuantity || 1}</Descriptions.Item>
          <Descriptions.Item label="Hạn hoàn thành">{formValues.deadline ? formValues.deadline.format('DD/MM/YYYY') : '—'}</Descriptions.Item>
          <Descriptions.Item label="Loại nhiệm vụ">{typeCfg ? <Tag color={typeCfg.color}>{typeCfg.label}</Tag> : '—'}</Descriptions.Item>
          <Descriptions.Item label="Mức ưu tiên">{prioCfg ? <Tag color={prioCfg.color}>{prioCfg.label}</Tag> : '—'}</Descriptions.Item>
          <Descriptions.Item label="Độ phức tạp">{compCfg ? <Tag color={compCfg.color}>{compCfg.label}</Tag> : '—'}</Descriptions.Item>
          <Descriptions.Item label="Phạm vi">{scopeCfg ? <Tag color={scopeCfg.color}>{scopeCfg.label}</Tag> : '—'}</Descriptions.Item>
          <Descriptions.Item label="PX xử lý" span={2}>{dept?.name || '—'}</Descriptions.Item>
          {formValues.technicalRequirements && <Descriptions.Item label="YC kỹ thuật" span={2}>{formValues.technicalRequirements}</Descriptions.Item>}
          {formValues.qualityRequirements && <Descriptions.Item label="YC chất lượng" span={2}>{formValues.qualityRequirements}</Descriptions.Item>}
          <Descriptions.Item label="Kiểm tra hồ sơ" span={2}><Tag color="success">{checkedCount}/{checklistItems.length} đã kiểm tra</Tag></Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  // ─── Step 5: Trình duyệt ────────────────────────────────
  const renderStep5 = () => (
    <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
      <Result
        icon={<SendOutlined style={{ color: colors.navy }} />}
        title="Xác nhận trình duyệt nhiệm vụ"
        subTitle={
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <p>Nhiệm vụ <strong>{formValues.name}</strong> sẽ được gửi đến <strong>Ban Giám đốc</strong> để phê duyệt khởi tạo.</p>
            <p style={{ color: '#666' }}>Sau khi được phê duyệt, nhiệm vụ sẽ chuyển sang giai đoạn lập đề xuất & dự toán.</p>
          </div>
        }
        extra={
          <Space direction="vertical" align="center">
            <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '12px 24px', display: 'inline-flex', gap: 16 }}>
              <div><Text type="secondary" style={{ fontSize: 11 }}>Mã NV</Text><div><Text strong style={{ color: colors.navy }}>NV-2026-009</Text></div></div>
              <div><Text type="secondary" style={{ fontSize: 11 }}>Trình duyệt đến</Text><div><Text strong>Phạm Quốc Hưng</Text></div></div>
            </div>
          </Space>
        }
      />
    </Card>
  );

  const stepsContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ─── Hero Banner ─── */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} />
                <Space size={8} align="center">
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Tiếp nhận nhiệm vụ mới</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 5 bước — từ tiếp nhận đến trình duyệt</div>
                  </div>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ─── Steps ─── */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '16px 24px' } }}>
        <Steps current={currentStep} size="small" items={stepItems} onChange={(step) => { if (step < currentStep) setCurrentStep(step); }} />
      </Card>

      {/* ─── Content ─── */}
      <Form form={form} layout="vertical" requiredMark="optional">
        {stepsContent[currentStep]()}
      </Form>

      {/* ─── Sticky Footer ─── */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Bước {currentStep + 1} / {stepItems.length}: {stepItems[currentStep].title}</Text>
        <Space>
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
              Quay lại
            </Button>
          )}
          {currentStep < 4 ? (
            <Button type="primary" onClick={handleNext}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
              Tiếp theo
            </Button>
          ) : (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
              Xác nhận & Trình duyệt
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default TaskReceptionCreatePage;
