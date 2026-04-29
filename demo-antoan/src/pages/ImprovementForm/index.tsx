import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Typography, Space, Button, Form,
  Input, Select, DatePicker, InputNumber, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, BulbOutlined, SaveOutlined,
  SearchOutlined, AimOutlined, BookOutlined, DeploymentUnitOutlined,
} from '@ant-design/icons';
import {
  improvementSourceConfig,
  improvementPriorityConfig,
  forwardedToConfig,
} from '../../utils/format';
import { safetyStandards } from '../../data/safetyStandards';

const { Text } = Typography;
const { TextArea } = Input;

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Sửa chữa Radar' },
  { value: 'PX2', label: 'PX2 - Sửa chữa Tên lửa' },
  { value: 'PX3', label: 'PX3 - Cơ khí' },
  { value: 'PX4', label: 'PX4 - Điện tử' },
];

const standardOptions = safetyStandards.map(s => ({
  value: s.id,
  label: `${s.code} — ${s.title}`,
}));

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  gradient: string;
}> = ({ icon, title, gradient }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>{title}</Text>
  </div>
);

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  padding: 24,
  marginBottom: 16,
};

const ImprovementFormPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* ─── Header banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 60%, #2d5a8e 100%)',
        borderRadius: 14, marginBottom: 20, overflow: 'hidden',
        padding: '18px 24px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => navigate('/cai-tien-phong-ngua')}
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none', flexShrink: 0,
            background: 'rgba(255,255,255,0.12)', color: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}
        >
          <ArrowLeftOutlined />
        </button>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BulbOutlined style={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
            Đề xuất cải tiến & phòng ngừa
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            Ghi nhận phân tích và đề xuất biện pháp cải tiến an toàn — Nhà máy Z119
          </div>
        </div>
      </div>

      <Form layout="vertical">
        {/* ─── B2+B3: Phân tích xu hướng & nguyên nhân ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<SearchOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Phân tích xu hướng & nguyên nhân gốc"
            gradient="linear-gradient(135deg, #1890ff, #40a9ff)"
          />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Nguồn phát sinh <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="source"
                rules={[{ required: true, message: 'Vui lòng chọn nguồn' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn nguồn..."
                  options={Object.entries(improvementSourceConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mã tham chiếu liên quan</Text>}
                name="relatedCode"
              >
                <Input style={{ borderRadius: 8 }} placeholder="VD: SC-001, VP-003, RR-007..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Nguyên nhân gốc / Điểm yếu hệ thống <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="rootCause"
            rules={[{ required: true, message: 'Vui lòng mô tả nguyên nhân gốc' }]}
            style={{ marginBottom: 0 }}
          >
            <TextArea
              rows={4}
              style={{ borderRadius: 8 }}
              placeholder="Mô tả nguyên nhân sâu xa, điểm yếu của quy trình / thiết bị / điều kiện vận hành dẫn đến rủi ro..."
            />
          </Form.Item>
        </div>

        {/* ─── B4: Nội dung đề xuất ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<BulbOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Nội dung đề xuất cải tiến"
            gradient="linear-gradient(135deg, #7c3aed, #a855f7)"
          />
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Tiêu đề đề xuất <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input style={{ borderRadius: 8 }} placeholder="Mô tả ngắn gọn biện pháp cải tiến..." />
          </Form.Item>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mô tả chi tiết <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea
              rows={4}
              style={{ borderRadius: 8 }}
              placeholder="Mô tả chi tiết giải pháp, phương án thực hiện, trang thiết bị cần thiết..."
            />
          </Form.Item>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Kết quả kỳ vọng</Text>}
            name="expectedOutcome"
          >
            <TextArea
              rows={3}
              style={{ borderRadius: 8 }}
              placeholder="Mô tả kết quả mong muốn sau khi triển khai (chỉ số, mức giảm rủi ro...)..."
            />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mức ưu tiên <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="priority"
                rules={[{ required: true, message: 'Vui lòng chọn ưu tiên' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn ưu tiên..."
                  options={Object.entries(improvementPriorityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Phân xưởng áp dụng <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="workshopIds"
                rules={[{ required: true, message: 'Vui lòng chọn phân xưởng' }]}
              >
                <Select
                  mode="multiple"
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn phân xưởng..."
                  options={workshopOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: 0 }}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Chi phí ước tính (VNĐ)</Text>}
                name="estimatedCost"
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: 8 }}
                  placeholder="0"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Hạn hoàn thành</Text>}
                name="estimatedDeadline"
                style={{ marginBottom: 0 }}
              >
                <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ─── B6: Liên kết cập nhật ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<BookOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Liên kết cập nhật sau cải tiến"
            gradient="linear-gradient(135deg, #059669, #10b981)"
          />
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Tiêu chuẩn an toàn cần cập nhật</Text>}
            name="linkedStandardIds"
          >
            <Select
              mode="multiple"
              style={{ borderRadius: 8 }}
              placeholder="Chọn tiêu chuẩn liên quan..."
              options={standardOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
          <Form.Item
            label={
              <Space size={6}>
                <DeploymentUnitOutlined style={{ color: '#0891b2' }} />
                <Text style={{ fontSize: 13, fontWeight: 500 }}>Quy trình phân hệ cần cập nhật</Text>
              </Space>
            }
            name="linkedProcessModules"
            style={{ marginBottom: 0 }}
          >
            <Select
              mode="multiple"
              style={{ borderRadius: 8 }}
              placeholder="Chọn phân hệ nhận cập nhật quy trình..."
              options={Object.entries(forwardedToConfig).map(([k, v]) => ({ value: k, label: v.label }))}
              allowClear
            />
          </Form.Item>
        </div>

        {/* ─── Action bar ─── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          gap: 12, paddingTop: 4, paddingBottom: 8,
        }}>
          <Button
            style={{ borderRadius: 8, height: 40, minWidth: 88 }}
            onClick={() => navigate('/cai-tien-phong-ngua')}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, fontWeight: 500 }}
            onClick={() => navigate('/cai-tien-phong-ngua')}
          >
            Gửi đề xuất
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ImprovementFormPage;
