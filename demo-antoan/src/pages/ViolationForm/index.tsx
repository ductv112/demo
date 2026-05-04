import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Typography, Button, Form,
  Input, Select, DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, SaveOutlined,
  InfoCircleOutlined, ToolOutlined,
} from '@ant-design/icons';
import {
  violationSeverityConfig,
  violationSourceConfig,
  hazardCategoryConfig,
  forwardedToConfig,
} from '../../utils/format';
import { technicalRisks } from '../../data/risks';
import { safetyStandards } from '../../data/safetyStandards';

const { Text } = Typography;
const { TextArea } = Input;

const workshopOptions = [
  { value: 'PX1', label: 'TT Phần mềm Alpha' },
  { value: 'PX2', label: 'TT Phần mềm Beta' },
  { value: 'PX3', label: 'TT Phần mềm Gamma' },
  { value: 'PX4', label: 'TT DevOps' },
];

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

const ViolationFormPage: React.FC = () => {
  const navigate = useNavigate();

  const standardOptions = safetyStandards.map(s => ({
    value: s.id,
    label: `${s.code} — ${s.title}`,
  }));

  const riskOptions = technicalRisks.map(r => ({
    value: r.id,
    label: `${r.code} — ${r.title}`,
  }));

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
          onClick={() => navigate('/vi-pham')}
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
          background: 'linear-gradient(135deg, #d97706, #fbbf24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AuditOutlined style={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
            Ghi nhận vi phạm an toàn
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            Ghi nhận vi phạm mới phát hiện tại Doanh nghiệp A
          </div>
        </div>
      </div>

      <Form layout="vertical">
        {/* ─── Thông tin vi phạm ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Thông tin vi phạm"
            gradient="linear-gradient(135deg, #d97706, #fbbf24)"
          />
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Tiêu đề vi phạm <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề vi phạm' }]}
          >
            <Input style={{ borderRadius: 8 }} placeholder="Mô tả ngắn gọn vi phạm..." />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mức độ vi phạm <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="severity"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn mức độ..."
                  options={Object.entries(violationSeverityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Loại vi phạm <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="violationType"
                rules={[{ required: true, message: 'Vui lòng chọn loại vi phạm' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn loại..."
                  options={Object.entries(hazardCategoryConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Trung tâm <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="workshopId"
                rules={[{ required: true, message: 'Vui lòng chọn trung tâm' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn trung tâm..."
                  options={workshopOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Nguồn phát hiện <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="source"
                rules={[{ required: true, message: 'Vui lòng chọn nguồn' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn nguồn..."
                  options={Object.entries(violationSourceConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Tiêu chuẩn bị vi phạm</Text>}
                name="relatedStandardId"
              >
                <Select
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
            </Col>
          </Row>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mô tả chi tiết vi phạm <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            style={{ marginBottom: 0 }}
          >
            <TextArea
              rows={4}
              style={{ borderRadius: 8 }}
              placeholder="Mô tả chi tiết vi phạm, bối cảnh và các yếu tố liên quan..."
            />
          </Form.Item>
        </div>

        {/* ─── Thông tin xử lý ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<ToolOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Thông tin xử lý & Phân công"
            gradient="linear-gradient(135deg, #1890ff, #40a9ff)"
          />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Người phát hiện <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="detectedBy"
                rules={[{ required: true, message: 'Vui lòng nhập tên người phát hiện' }]}
              >
                <Input style={{ borderRadius: 8 }} placeholder="Họ tên, quân hàm..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ngày phát hiện <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="detectedAt"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Giao xử lý cho</Text>}
                name="assignedTo"
              >
                <Input style={{ borderRadius: 8 }} placeholder="Họ tên người chịu trách nhiệm..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Hạn xử lý</Text>}
                name="deadline"
              >
                <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Rủi ro liên quan</Text>}
                name="relatedRiskId"
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn rủi ro liên quan..."
                  options={riskOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: 0 }}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Chuyển yêu cầu đến</Text>}
                name="forwardedTo"
                style={{ marginBottom: 0 }}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn phân hệ xử lý..."
                  options={Object.entries(forwardedToConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Yêu cầu khắc phục</Text>}
                name="remedyRequest"
                style={{ marginBottom: 0 }}
              >
                <TextArea
                  rows={2}
                  style={{ borderRadius: 8 }}
                  placeholder="Biện pháp khắc phục cụ thể..."
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ─── Action bar ─── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          gap: 12, paddingTop: 4, paddingBottom: 8,
        }}>
          <Button
            style={{ borderRadius: 8, height: 40, minWidth: 88 }}
            onClick={() => navigate('/vi-pham')}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, fontWeight: 500 }}
            onClick={() => navigate('/vi-pham')}
          >
            Lưu vi phạm
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ViolationFormPage;
