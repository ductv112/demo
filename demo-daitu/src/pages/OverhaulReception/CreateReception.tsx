import React, { useState } from 'react';
import {
  Form, Input, Select, DatePicker, InputNumber, Radio, Button,
  Card, Row, Col, Typography, Space, Divider, Tag, App, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, FileSearchOutlined, SaveOutlined, PlusOutlined,
  MinusCircleOutlined, FileTextOutlined, ToolOutlined, ApartmentOutlined,
  CheckCircleOutlined, ExperimentOutlined, FileDoneOutlined, RadarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { equipment } from '../../data/equipment';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

const workshopOptions = [
  { value: 'PX1', label: 'TT Alpha – Bảo trì Hệ thống monitoring' },
  { value: 'PX2', label: 'TT Beta – Module sản phẩm' },
  { value: 'PX3', label: 'TT Hạ tầng – Cơ khí phần cứng' },
  { value: 'PX4', label: 'TT DevOps – Điện tử & Mạng' },
];

const equipmentOptions = equipment.map(e => ({
  value: e.id,
  label: `${e.name} (${e.model} · ${e.serial})`,
  name: e.name,
  model: e.model,
  serial: e.serial,
  ownerUnit: e.ownerUnit,
  operatingHours: e.operatingHours,
}));

const StepCard: React.FC<{
  step: number;
  color: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ step, color, title, subtitle, icon, children, style }) => (
  <Card style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', ...style }} bodyStyle={{ padding: '20px 24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 15, boxShadow: `0 4px 12px ${color}40`,
      }}>
        {step}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color, fontSize: 13 }}>{icon}</span>
          <Text strong style={{ color, fontSize: 14 }}>{title}</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>
      </div>
    </div>
    {children}
  </Card>
);

const CreateReception: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleEquipmentChange = (value: string) => {
    const eq = equipmentOptions.find(e => e.value === value);
    if (eq) {
      form.setFieldsValue({
        equipmentModel: eq.model,
        equipmentSerial: eq.serial,
        sendingUnit: eq.ownerUnit,
        operatingHours: eq.operatingHours,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSaving(true);
      await new Promise(r => setTimeout(r, 800));
      message.success('Tạo hồ sơ tiếp nhận thành công!');
      navigate('/overhaul-receptions');
    } catch {
      // validation failed
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ── Hero banner ── */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileSearchOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
                    Tạo hồ sơ tiếp nhận đại tu
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    Quy trình 1 · Tiếp nhận thiết bị, kiểm tra ban đầu và xác định phạm vi đại tu
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/overhaul-receptions')}
                  style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}
                >
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSubmit}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}
                >
                  Lưu hồ sơ
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <Form form={form} layout="vertical" size="middle">
        <Row gutter={20} align="top">

          {/* ═══ Cột trái: Bước 1 → 3 ═══ */}
          <Col xs={24} lg={16}>

            {/* BƯỚC 1: Tiếp nhận thiết bị và hồ sơ kỹ thuật */}
            <StepCard step={1} color={colors.navy} title="Tiếp nhận thiết bị và hồ sơ kỹ thuật"
              subtitle="Xác định thiết bị, ghi nhận thông tin tiếp nhận từ đơn vị bàn giao"
              icon={<RadarChartOutlined />}>

              <Form.Item label="Chọn thiết bị" name="equipmentId" rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
                <Select
                  showSearch size="large"
                  placeholder="Tìm theo tên, model, serial..."
                  options={equipmentOptions}
                  onChange={handleEquipmentChange}
                  filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Model" name="equipmentModel">
                    <Input disabled style={{ background: '#f8fafc', color: '#555' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số serial" name="equipmentSerial">
                    <Input disabled style={{ background: '#f8fafc', color: '#555', fontFamily: 'monospace' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số giờ hoạt động (h)" name="operatingHours" rules={[{ required: true, message: 'Nhập số giờ' }]}>
                    <InputNumber style={{ width: '100%' }} min={0}
                      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      placeholder="VD: 12.450" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={10}>
                  <Form.Item label="Đơn vị bàn giao" name="sendingUnit" rules={[{ required: true, message: 'Nhập đơn vị' }]}>
                    <Input placeholder="VD: Khối K361, Phòng P291, Đơn vị A42..." />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item label="Ngày tiếp nhận" name="receivedDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item label="Người tiếp nhận" name="receivedBy" rules={[{ required: true, message: 'Nhập tên' }]}>
                    <Input placeholder="Họ tên KTV tiếp nhận..." />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '4px 0 16px' }} orientation="left" orientationMargin={0}>
                <Text style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
                  <FileTextOutlined style={{ marginRight: 6 }} />Hồ sơ tài liệu đi kèm
                </Text>
              </Divider>

              <Form.List name="receivedDocuments">
                {(fields, { add, remove }) => (
                  <div>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField} name={[name]}
                          rules={[{ required: true, message: 'Nhập tên tài liệu' }]}
                          style={{ margin: 0, width: '100%' }}
                        >
                          <Input placeholder="VD: Lý lịch kỹ thuật, Nhật ký vận hành, Biên bản bàn giao..." />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: 16 }} />
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 4 }}>
                      Thêm tài liệu
                    </Button>
                  </div>
                )}
              </Form.List>

              <Divider style={{ margin: '16px 0 12px' }} />

              <Form.Item label="Tóm tắt lịch sử vận hành & bảo trì" name="maintenanceHistory" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={3}
                  placeholder="VD: Đại tu lần 1 năm 2018. Sửa chữa anten 2021. Suy giảm công suất phát từ 2024. Ghi nhận sự cố lần gần nhất..." />
              </Form.Item>
            </StepCard>

            {/* BƯỚC 2: Kiểm tra tổng thể ban đầu */}
            <StepCard step={2} color="#d97706" title="Kiểm tra tổng thể ban đầu"
              subtitle="Kiểm tra tổng quan bên ngoài và trạng thái hiện tại để xác định tình trạng ban đầu"
              icon={<ToolOutlined />}>

              <Form.Item
                label="Tình trạng quan sát ban đầu"
                name="initialCondition"
                rules={[{ required: true, message: 'Nhập tình trạng quan sát' }]}
                extra={<Text type="secondary" style={{ fontSize: 11 }}>Ghi nhận rò rỉ dầu, nứt vỡ, biến dạng; tình trạng bề mặt và các cụm chính; đánh giá sơ bộ mức độ hư hỏng</Text>}
              >
                <Input.TextArea rows={4}
                  placeholder="VD: Phát hiện rò rỉ dầu tại hệ thống làm mát; vỏ anten có vết nứt góc trái; cụm quay anten phát ra tiếng ồn bất thường; bề mặt cơ khí nhiều vị trí biến dạng..." />
              </Form.Item>

              <Row gutter={16} style={{ marginBottom: 0 }}>
                <Col span={12}>
                  <Form.Item label="Ngày kiểm tra ban đầu" name="initialCheckDate" style={{ marginBottom: 0 }}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="KTV thực hiện kiểm tra" name="initialCheckBy" style={{ marginBottom: 0 }}>
                    <Input placeholder="Họ tên kỹ thuật viên..." />
                  </Form.Item>
                </Col>
              </Row>
            </StepCard>

            {/* BƯỚC 3: Đánh giá tình trạng kỹ thuật và hao mòn */}
            <StepCard step={3} color="#0891b2" title="Đánh giá tình trạng kỹ thuật và hao mòn"
              subtitle="Phân tích tình trạng tổng thể dựa trên dữ liệu vận hành, biểu hiện thực tế và chỉ số kỹ thuật"
              icon={<ExperimentOutlined />}>

              <Form.Item
                label="Mức độ hao mòn tổng thể"
                name="wearLevel"
                rules={[{ required: true, message: 'Chọn mức hao mòn' }]}
              >
                <Radio.Group style={{ width: '100%' }}>
                  <Row gutter={[8, 8]}>
                    {[
                      { value: 'low', color: 'success', label: 'Thấp', desc: 'Hao mòn nhẹ, trong giới hạn cho phép' },
                      { value: 'medium', color: 'warning', label: 'Trung bình', desc: 'Hao mòn vừa, cần can thiệp đại tu' },
                      { value: 'high', color: 'orange', label: 'Nặng', desc: 'Nhiều cụm vượt ngưỡng kỹ thuật' },
                      { value: 'critical', color: 'error', label: 'Nghiêm trọng', desc: 'Không đảm bảo vận hành an toàn' },
                    ].map(opt => (
                      <Col span={12} key={opt.value}>
                        <Radio value={opt.value} style={{ width: '100%' }}>
                          <Tag color={opt.color} style={{ marginRight: 4, fontWeight: 600 }}>{opt.label}</Tag>
                          <Text style={{ fontSize: 11, color: '#777' }}>{opt.desc}</Text>
                        </Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              <Divider style={{ margin: '12px 0' }} />

              <Form.Item
                label="Kết luận đánh giá kỹ thuật"
                name="assessmentSummary"
                extra={<Text type="secondary" style={{ fontSize: 11 }}>Phân tích mức hao mòn xi-lanh/cụm chính, dấu hiệu quá nhiệt/quá tải, xu hướng hỏng hóc theo lịch sử</Text>}
              >
                <Input.TextArea rows={3}
                  placeholder="VD: Đánh giá mức độ hao mòn xi-lanh vượt 35% ngưỡng; phát hiện dấu hiệu quá nhiệt tại cụm biến áp chính; xu hướng suy giảm công suất tăng nhanh từ Q3/2025..." />
              </Form.Item>

              <Row gutter={16} style={{ marginBottom: 0 }}>
                <Col span={12}>
                  <Form.Item label="Ngày hoàn thành đánh giá" name="assessedDate" style={{ marginBottom: 0 }}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="KTV phụ trách đánh giá" name="assessedBy" style={{ marginBottom: 0 }}>
                    <Input placeholder="Họ tên kỹ thuật viên..." />
                  </Form.Item>
                </Col>
              </Row>
            </StepCard>
          </Col>

          {/* ═══ Cột phải: Bước 4 → 6 + Ghi chú ═══ */}
          <Col xs={24} lg={8}>

            {/* BƯỚC 4: Xác định phạm vi đại tu */}
            <StepCard step={4} color="#7c3aed" title="Xác định phạm vi đại tu"
              subtitle="Phạm vi công việc cần thực hiện trong đợt đại tu"
              icon={<CheckCircleOutlined />}>

              <Form.Item
                name="overhaulScope"
                rules={[{ required: true, message: 'Chọn phạm vi' }]}
                style={{ marginBottom: 0 }}
              >
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    {[
                      { value: 'full', color: 'blue', tag: 'Toàn bộ', desc: 'Đại tu toàn diện — thay thế, phục hồi và nâng cấp tất cả cụm' },
                      { value: 'partial', color: 'cyan', tag: 'Một phần', desc: 'Đại tu các cụm chính hư hỏng, giữ nguyên cụm còn sử dụng được' },
                    ].map(opt => (
                      <Radio key={opt.value} value={opt.value}>
                        <Tag color={opt.color} style={{ marginRight: 6, fontWeight: 600 }}>{opt.tag}</Tag>
                        <Text style={{ fontSize: 11, color: '#666' }}>{opt.desc}</Text>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </StepCard>

            {/* BƯỚC 5: Phân loại và định tuyến đại tu */}
            <StepCard step={5} color="#0891b2" title="Phân loại và định tuyến"
              subtitle="Xác định loại đại tu và định tuyến xưởng phù hợp theo năng lực kỹ thuật"
              icon={<ApartmentOutlined />}>

              <Form.Item label="Loại đại tu" name="overhaulType" rules={[{ required: true, message: 'Chọn loại' }]}>
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    {[
                      { value: 'scheduled', color: 'blue', tag: 'Theo chu kỳ', desc: 'Đến hạn đại tu định kỳ theo quy định' },
                      { value: 'condition_based', color: 'orange', tag: 'Theo tình trạng', desc: 'Dựa trên thực trạng kỹ thuật thực tế' },
                      { value: 'priority', color: 'red', tag: 'Ưu tiên', desc: 'Yêu cầu nhiệm vụ khẩn cấp, ưu tiên cao' },
                    ].map(opt => (
                      <Radio key={opt.value} value={opt.value}>
                        <Tag color={opt.color} style={{ marginRight: 6 }}>{opt.tag}</Tag>
                        <Text style={{ fontSize: 11, color: '#666' }}>{opt.desc}</Text>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Divider style={{ margin: '8px 0 14px' }} />

              <Form.Item label="Trung tâm định tuyến" name="routingWorkshop" rules={[{ required: true, message: 'Chọn trung tâm' }]}>
                <Select options={workshopOptions} placeholder="Chọn trung tâm phụ trách..." />
              </Form.Item>

              <Form.Item label="Lý do định tuyến" name="routingReason" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={2}
                  placeholder="VD: Hệ thống monitoring P-18 thuộc năng lực TT Alpha; Yêu cầu thiết bị hiệu chỉnh chuyên dụng tại TT Alpha..." />
              </Form.Item>
            </StepCard>

            {/* BƯỚC 6: Thông tin */}
            <Card style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px dashed #d9d9d9' }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>6</div>
                <Text strong style={{ color: '#16a34a', fontSize: 13 }}>Ghi nhận & Khởi tạo hồ sơ</Text>
              </div>
              <Alert
                type="info"
                showIcon
                icon={<FileDoneOutlined />}
                message={null}
                description={
                  <Text style={{ fontSize: 12 }}>
                    Sau khi lưu, hệ thống sẽ tạo hồ sơ đại tu với mã theo dõi riêng và trạng thái <strong>Chờ tiếp nhận</strong>. Hồ sơ sẵn sàng để theo dõi xuyên suốt các quy trình tiếp theo.
                  </Text>
                }
                style={{ borderRadius: 6, padding: '8px 12px' }}
              />
            </Card>

            {/* Ghi chú */}
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '16px 20px' }}>
              <Text strong style={{ display: 'block', marginBottom: 10, color: '#555', fontSize: 13 }}>
                Ghi chú / Yêu cầu đặc biệt
              </Text>
              <Form.Item name="notes" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={3}
                  placeholder="Ưu tiên xử lý, yêu cầu đặc biệt, lưu ý kỹ thuật quan trọng..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* ── Action bar cuối trang ── */}
        <Card style={{ borderRadius: 12, marginTop: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '14px 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Trường có dấu <span style={{ color: '#ff4d4f' }}>*</span> là bắt buộc · Bước 2, 3 có thể bổ sung sau khi tiếp nhận chính thức
              </Text>
            </Col>
            <Col>
              <Space>
                <Button onClick={() => navigate('/overhaul-receptions')}>Hủy</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSubmit}
                  style={{ background: colors.navy, borderColor: colors.navy, fontWeight: 600 }}
                >
                  Lưu hồ sơ tiếp nhận
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default CreateReception;
