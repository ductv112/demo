import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Space, Button, Form,
  Input, Select, DatePicker, message, Steps,
} from 'antd';
import {
  ArrowLeftOutlined,
  AlertOutlined,
  SaveOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { incidents } from '../../data/incidents';
import {
  incidentSeverityConfig,
  incidentTypeConfig,
  incidentStatusConfig,
  formatDateTime,
} from '../../utils/format';

const { Title, Text } = Typography;

const stepLabels = [
  'Ghi nhận',
  'Phân loại & Đánh giá',
  'Điều tra nguyên nhân',
  'Xử lý & Khắc phục',
  'Đóng sự cố',
];

const workshopOptions = [
  { value: 'PX1', label: 'TT Phần mềm Alpha' },
  { value: 'PX2', label: 'TT Phần mềm Beta' },
  { value: 'PX3', label: 'TT Phần mềm Gamma' },
  { value: 'PX4', label: 'TT DevOps' },
  { value: 'PKT', label: 'Phòng Kỹ thuật' },
  { value: 'PKCDB', label: 'Phòng KCS & Đảm bảo CL' },
];

const IncidentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [stepForm] = Form.useForm();

  const isNew = !id || id === 'new';
  const incident = isNew ? null : incidents.find(i => i.id === id);

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Dữ liệu sự cố:', values);
      message.success(isNew ? 'Đã ghi nhận sự cố mới' : 'Đã cập nhật sự cố');
      navigate(isNew ? '/su-co' : `/su-co/${id}`);
    });
  };

  const handleAdvanceStep = () => {
    stepForm.validateFields().then(values => {
      console.log('Cập nhật bước xử lý:', values);
      message.success(`Đã chuyển sang bước: ${stepLabels[(incident?.currentStep ?? 0) + 1]}`);
      navigate(`/su-co/${id}`);
    });
  };

  // ─── Chế độ: Cập nhật bước xử lý (edit mode) ───
  if (!isNew && incident) {
    const nextStep = incident.currentStep + 1;
    const isLastStep = nextStep >= stepLabels.length - 1;

    return (
      <div>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space align="start" size={16}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/su-co/${id}`)} style={{ color: '#666' }} />
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
                Cập nhật xử lý — {incident.code}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{incident.title}</Text>
            </div>
          </Space>
        </div>

        {/* Workflow progress */}
        <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 20 }} styles={{ body: { padding: '24px 32px' } }}>
          <Steps
            current={incident.currentStep}
            items={stepLabels.map(label => ({
              title: <span style={{ fontSize: 13 }}>{label}</span>,
            }))}
          />
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space size={10}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>
                    Hoàn thành bước: {stepLabels[incident.currentStep]}
                  </Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 24 } }}
            >
              <Form form={stepForm} layout="vertical" requiredMark="optional">
                {incident.currentStep === 1 && (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="severity"
                          label="Mức độ nghiêm trọng"
                          rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
                          initialValue={incident.severity}
                        >
                          <Select options={Object.entries(incidentSeverityConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="type"
                          label="Loại sự cố"
                          rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                          initialValue={incident.type}
                        >
                          <Select options={Object.entries(incidentTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="injuryCount"
                      label="Số người bị thương"
                      initialValue={incident.injuryCount}
                    >
                      <Input type="number" min={0} />
                    </Form.Item>
                  </>
                )}

                {incident.currentStep === 2 && (
                  <>
                    <Form.Item
                      name="rootCause"
                      label="Nguyên nhân gốc rễ"
                      rules={[{ required: true, message: 'Vui lòng nhập nguyên nhân' }]}
                    >
                      <Input.TextArea rows={4} placeholder="Phân tích và xác định nguyên nhân gốc rễ của sự cố..." />
                    </Form.Item>
                  </>
                )}

                {incident.currentStep === 3 && (
                  <>
                    <Form.Item
                      name="correctiveAction"
                      label="Biện pháp khắc phục"
                      rules={[{ required: true, message: 'Vui lòng nhập biện pháp khắc phục' }]}
                    >
                      <Input.TextArea rows={4} placeholder="Các biện pháp kỹ thuật để khắc phục sự cố..." />
                    </Form.Item>
                    <Form.Item
                      name="preventiveAction"
                      label="Biện pháp phòng ngừa"
                    >
                      <Input.TextArea rows={3} placeholder="Biện pháp để ngăn ngừa sự cố tái diễn..." />
                    </Form.Item>
                  </>
                )}

                <Form.Item
                  name="actionNote"
                  label="Ghi chú hành động"
                  rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
                >
                  <Input.TextArea rows={3} placeholder={`Mô tả những gì đã thực hiện tại bước "${stepLabels[incident.currentStep]}"...`} />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <Button onClick={() => navigate(`/su-co/${id}`)} style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={isLastStep ? <CheckOutlined /> : <SaveOutlined />}
                    onClick={handleAdvanceStep}
                    style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}
                  >
                    {isLastStep ? 'Đóng sự cố' : `Chuyển sang: ${stepLabels[nextStep]}`}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={<Text strong style={{ color: '#1B3A5C' }}>Lịch sử xử lý</Text>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 16 } }}
            >
              {incident.actions.map((action, idx) => (
                <div key={idx} style={{
                  padding: '8px 0',
                  borderBottom: idx < incident.actions.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}>
                  <Text strong style={{ fontSize: 12, color: '#1B3A5C' }}>{stepLabels[action.step]}</Text>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{formatDateTime(action.timestamp)}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{action.note}</div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // ─── Chế độ: Ghi nhận sự cố mới ───
  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/su-co')} style={{ color: '#666' }} />
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Ghi nhận sự cố mới
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Doanh nghiệp A — Điền đầy đủ thông tin sự cố
            </Text>
          </div>
        </Space>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Row gutter={[16, 0]}>
          <Col xs={24} lg={16}>
            {/* ─── Thông tin cơ bản ─── */}
            <Card
              title={
                <Space size={10}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AlertOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Thông tin sự cố</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 24 } }}
            >
              <Form.Item
                name="title"
                label="Tên / Tiêu đề sự cố"
                rules={[{ required: true, message: 'Vui lòng nhập tên sự cố' }]}
              >
                <Input placeholder="Mô tả ngắn gọn sự cố..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="type" label="Loại sự cố" rules={[{ required: true }]}>
                    <Select
                      placeholder="Chọn loại sự cố"
                      options={Object.entries(incidentTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="severity" label="Mức độ nghiêm trọng" rules={[{ required: true }]}>
                    <Select
                      placeholder="Chọn mức độ"
                      options={Object.entries(incidentSeverityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="workshopId" label="Trung tâm / Bộ phận" rules={[{ required: true }]}>
                    <Select placeholder="Chọn trung tâm" options={workshopOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="location" label="Vị trí cụ thể" rules={[{ required: true }]}>
                    <Input placeholder="VD: Khu B, máy tiện MT-05..." />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="occurredAt"
                    label="Thời điểm xảy ra"
                    rules={[{ required: true, message: 'Chọn thời điểm xảy ra' }]}
                    initialValue={dayjs()}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="injuryCount" label="Số người bị thương" initialValue={0}>
                    <Input type="number" min={0} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="relatedEquipment" label="Thiết bị liên quan">
                <Input placeholder="Tên thiết bị, mã số..." />
              </Form.Item>
            </Card>

            {/* ─── Mô tả & Hành động khẩn cấp ─── */}
            <Card
              title={<Text strong style={{ color: '#1B3A5C' }}>Mô tả chi tiết</Text>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 24 } }}
            >
              <Form.Item
                name="description"
                label="Mô tả sự cố"
                rules={[{ required: true, message: 'Vui lòng mô tả sự cố' }]}
              >
                <Input.TextArea
                  rows={5}
                  placeholder="Mô tả chi tiết tình huống, điều kiện xảy ra, những gì đã quan sát được..."
                />
              </Form.Item>
              <Form.Item
                name="immediateAction"
                label="Hành động khẩn cấp đã thực hiện"
                rules={[{ required: true, message: 'Vui lòng mô tả hành động khẩn cấp' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Những biện pháp xử lý tức thời đã được thực hiện ngay sau khi sự cố xảy ra..."
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={<Text strong style={{ color: '#1B3A5C' }}>Thông tin bổ sung</Text>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 72 }}
              styles={{ body: { padding: 24 } }}
            >
              <Form.Item name="reportedBy" label="Người báo cáo" rules={[{ required: true }]}>
                <Input placeholder="Họ tên, chức vụ..." />
              </Form.Item>
              <Form.Item name="damageEstimate" label="Thiệt hại ước tính (đồng)">
                <Input type="number" min={0} placeholder="0" />
              </Form.Item>

              <div style={{
                background: '#fff7e6', borderRadius: 8, padding: '12px 14px',
                border: '1px solid #ffd591', marginBottom: 16,
              }}>
                <Text strong style={{ fontSize: 12, color: '#d97706', display: 'block', marginBottom: 4 }}>
                  Lưu ý
                </Text>
                <Text style={{ fontSize: 12, color: '#8c5000' }}>
                  Sự cố sẽ được ghi nhận với trạng thái &quot;Mới ghi nhận&quot;. Phòng An toàn sẽ tiếp nhận và phân loại trong vòng 2 giờ.
                </Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  block
                  onClick={handleSave}
                  style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 44, fontWeight: 600 }}
                >
                  Ghi nhận sự cố
                </Button>
                <Button block onClick={() => navigate('/su-co')} style={{ borderRadius: 8, height: 40 }}>
                  Hủy
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default IncidentFormPage;
