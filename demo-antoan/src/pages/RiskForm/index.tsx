import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Row, Col, Typography, Space, Button, Form,
  Input, Select, InputNumber, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, WarningOutlined, SaveOutlined,
  AimOutlined, SafetyOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { technicalRisks } from '../../data/risks';
import { safetyStandards } from '../../data/safetyStandards';
import {
  hazardCategoryConfig,
  riskDataSourceConfig,
  calcRiskLevel,
  riskLevelConfig,
} from '../../utils/format';

const { Text } = Typography;
const { TextArea } = Input;

const workshopOptions = [
  { value: 'PX1', label: 'TT Phần mềm Alpha' },
  { value: 'PX2', label: 'TT Phần mềm Beta' },
  { value: 'PX3', label: 'TT Phần mềm Gamma' },
  { value: 'PX4', label: 'TT DevOps' },
];

const probabilityOptions = [
  { value: 1, label: '1 — Rất thấp (hiếm xảy ra)' },
  { value: 2, label: '2 — Thấp (không thường xuyên)' },
  { value: 3, label: '3 — Trung bình (đôi khi xảy ra)' },
  { value: 4, label: '4 — Cao (thường xuyên)' },
  { value: 5, label: '5 — Rất cao (hầu như luôn)' },
];

const impactOptions = [
  { value: 1, label: '1 — Không đáng kể' },
  { value: 2, label: '2 — Nhỏ' },
  { value: 3, label: '3 — Trung bình' },
  { value: 4, label: '4 — Nghiêm trọng' },
  { value: 5, label: '5 — Thảm họa' },
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

const RiskFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const existing = isEdit ? technicalRisks.find(r => r.id === id) : null;

  const [form] = Form.useForm();
  const [probability, setProbability] = React.useState<number>(existing?.probability ?? 3);
  const [impact, setImpact] = React.useState<number>(existing?.impact ?? 3);

  const riskScore = probability * impact;
  const riskLevel = calcRiskLevel(probability, impact);
  const levelCfg = riskLevelConfig[riskLevel];

  const initialValues = existing ? {
    code: existing.code,
    title: existing.title,
    description: existing.description,
    hazardCategory: existing.hazardCategory,
    workshopId: existing.workshopId,
    equipmentOrProcess: existing.equipmentOrProcess,
    dataSource: existing.dataSource,
    probability: existing.probability,
    impact: existing.impact,
    controlMeasures: existing.controlMeasures.join('\n'),
    responsiblePerson: existing.responsiblePerson,
    relatedStandardIds: existing.relatedStandardIds,
    note: existing.note,
  } : undefined;

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
          onClick={() => navigate(isEdit ? `/rui-ro/${id}` : '/rui-ro')}
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
          background: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <WarningOutlined style={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
            {isEdit ? `Chỉnh sửa: ${existing?.title ?? ''}` : 'Nhận diện & Đánh giá rủi ro mới'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            {isEdit ? `Mã: ${existing?.code}` : 'Ghi nhận rủi ro kỹ thuật tại Doanh nghiệp A'}
          </div>
        </div>
      </div>

      <Form layout="vertical" form={form} initialValues={initialValues}>
        {/* ─── Thông tin cơ bản ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Thông tin cơ bản"
            gradient="linear-gradient(135deg, #1890ff, #40a9ff)"
          />
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mã rủi ro <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="code"
                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
              >
                <Input style={{ borderRadius: 8 }} placeholder="VD: RR-001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Tên rủi ro <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input style={{ borderRadius: 8 }} placeholder="Mô tả ngắn gọn rủi ro..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mô tả chi tiết <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="description"
            rules={[{ required: true, message: 'Vui lòng mô tả rủi ro' }]}
          >
            <TextArea rows={3} style={{ borderRadius: 8 }} placeholder="Mô tả chi tiết về rủi ro, điều kiện phát sinh..." />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Loại nguy cơ <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="hazardCategory"
                rules={[{ required: true, message: 'Vui lòng chọn loại nguy cơ' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn loại nguy cơ..."
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
                <Select style={{ borderRadius: 8 }} placeholder="Chọn trung tâm..." options={workshopOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Nguồn nhận diện</Text>}
                name="dataSource"
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn nguồn..."
                  allowClear
                  options={Object.entries(riskDataSourceConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Thiết bị / Quy trình liên quan <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="equipmentOrProcess"
            rules={[{ required: true, message: 'Vui lòng nhập thiết bị/quy trình' }]}
            style={{ marginBottom: 0 }}
          >
            <Input style={{ borderRadius: 8 }} placeholder="VD: Hệ thống monitoring P-18, Quy trình nạp chất làm mát..." />
          </Form.Item>
        </div>

        {/* ─── Đánh giá rủi ro ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<AimOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Đánh giá mức độ rủi ro"
            gradient="linear-gradient(135deg, #cf1322, #ff4d4f)"
          />
          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Xác suất xảy ra <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="probability"
                rules={[{ required: true, message: 'Vui lòng chọn xác suất' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn mức xác suất..."
                  options={probabilityOptions}
                  onChange={(v) => setProbability(v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Mức độ tác động <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="impact"
                rules={[{ required: true, message: 'Vui lòng chọn tác động' }]}
              >
                <Select
                  style={{ borderRadius: 8 }}
                  placeholder="Chọn mức tác động..."
                  options={impactOptions}
                  onChange={(v) => setImpact(v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={4}>
              <div style={{ paddingTop: 30 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Điểm rủi ro</div>
                <div style={{
                  background: levelCfg.bg,
                  color: '#fff', fontWeight: 700, fontSize: 22,
                  borderRadius: 10, padding: '8px 0', textAlign: 'center',
                }}>
                  {riskScore}
                </div>
                <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: levelCfg.bg, fontWeight: 600 }}>
                  {levelCfg.label}
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '4px 0 16px' }} />

          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Biện pháp kiểm soát <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="controlMeasures"
            rules={[{ required: true, message: 'Vui lòng nhập biện pháp kiểm soát' }]}
          >
            <TextArea
              rows={4}
              style={{ borderRadius: 8 }}
              placeholder="Liệt kê từng biện pháp trên một dòng..."
            />
          </Form.Item>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Người chịu trách nhiệm <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="responsiblePerson"
            rules={[{ required: true, message: 'Vui lòng nhập người chịu trách nhiệm' }]}
            style={{ marginBottom: 0 }}
          >
            <Input style={{ borderRadius: 8 }} placeholder="Họ tên, chức vụ..." />
          </Form.Item>
        </div>

        {/* ─── Liên kết tiêu chuẩn ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<SafetyOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Tiêu chuẩn an toàn liên quan"
            gradient="linear-gradient(135deg, #059669, #10b981)"
          />
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Tiêu chuẩn tham chiếu</Text>}
            name="relatedStandardIds"
            style={{ marginBottom: 12 }}
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
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ghi chú</Text>}
            name="note"
            style={{ marginBottom: 0 }}
          >
            <TextArea rows={2} style={{ borderRadius: 8 }} placeholder="Ghi chú bổ sung (nếu có)..." />
          </Form.Item>
        </div>

        {/* ─── Action bar ─── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          gap: 12, paddingTop: 4, paddingBottom: 8,
        }}>
          <Button
            style={{ borderRadius: 8, height: 40, minWidth: 88 }}
            onClick={() => navigate(isEdit ? `/rui-ro/${id}` : '/rui-ro')}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, fontWeight: 500 }}
            onClick={() => navigate('/rui-ro')}
          >
            {isEdit ? 'Lưu thay đổi' : 'Lưu rủi ro'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RiskFormPage;
