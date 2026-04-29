import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Typography, Button, Form,
  Input, Select, DatePicker, Table, Tag,
} from 'antd';
import {
  ArrowLeftOutlined, CheckSquareOutlined, SaveOutlined,
  InfoCircleOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { hazardCategoryConfig } from '../../utils/format';
import type { HazardCategory, CheckItemResult } from '../../types';

const { Text } = Typography;
const { TextArea } = Input;

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Sửa chữa Radar' },
  { value: 'PX2', label: 'PX2 - Sửa chữa Tên lửa' },
  { value: 'PX3', label: 'PX3 - Cơ khí' },
  { value: 'PX4', label: 'PX4 - Điện tử' },
];

const shiftOptions = [
  { value: 'ca1', label: 'Ca 1 (06:00 – 14:00)' },
  { value: 'ca2', label: 'Ca 2 (14:00 – 22:00)' },
  { value: 'ca3', label: 'Ca 3 (22:00 – 06:00)' },
];

const checkItemResultConfig: Record<CheckItemResult, { label: string; color: string }> = {
  pass:    { label: 'Đạt',              color: 'success' },
  fail:    { label: 'Không đạt',        color: 'error'   },
  na:      { label: 'Không áp dụng',   color: 'default' },
  pending: { label: 'Chưa kiểm tra',   color: 'warning' },
};

const defaultCheckItems = [
  { id: 'ci1', category: 'dien_ap_cao' as HazardCategory, description: 'Kiểm tra cách điện và tiếp địa thiết bị', requirement: 'Điện trở cách điện ≥ 1 MΩ', result: 'pending' as CheckItemResult },
  { id: 'ci2', category: 'dien_ap_cao' as HazardCategory, description: 'Kiểm tra bảng điện và aptomat bảo vệ', requirement: 'Không có aptomat hỏng, tiếp xúc tốt', result: 'pending' as CheckItemResult },
  { id: 'ci3', category: 'chay_no' as HazardCategory, description: 'Kiểm tra bình chữa cháy trong phân xưởng', requirement: 'Đủ số lượng, còn hạn sử dụng, dễ lấy', result: 'pending' as CheckItemResult },
  { id: 'ci4', category: 'chay_no' as HazardCategory, description: 'Kiểm tra lối thoát hiểm và biển chỉ dẫn', requirement: 'Thông thoáng, biển chỉ dẫn rõ ràng', result: 'pending' as CheckItemResult },
  { id: 'ci5', category: 'co_hoc' as HazardCategory, description: 'Kiểm tra tình trạng thiết bị nâng hạ', requirement: 'Không có dấu hiệu nứt, mòn, bôi trơn đủ', result: 'pending' as CheckItemResult },
  { id: 'ci6', category: 'co_hoc' as HazardCategory, description: 'Kiểm tra bảo hộ lao động cá nhân', requirement: 'Đủ số lượng, đúng quy cách, còn hạn', result: 'pending' as CheckItemResult },
  { id: 'ci7', category: 'nhiet_do' as HazardCategory, description: 'Kiểm tra nhiệt độ và thông gió phân xưởng', requirement: 'Nhiệt độ ≤ 35°C, thông gió đảm bảo', result: 'pending' as CheckItemResult },
];

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; gradient: string }> = ({ icon, title, gradient }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>{title}</Text>
  </div>
);

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  padding: 24, marginBottom: 16,
};

const SafetyControlFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = React.useState(defaultCheckItems);

  const columns = [
    {
      title: 'Hạng mục kiểm tra',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      render: (text: string, record: typeof defaultCheckItems[0]) => (
        <div>
          <Tag color={hazardCategoryConfig[record.category].color} style={{ marginBottom: 4, fontSize: 11 }}>
            {hazardCategoryConfig[record.category].label}
          </Tag>
          <div style={{ fontSize: 13 }}>{text}</div>
        </div>
      ),
    },
    {
      title: 'Yêu cầu',
      dataIndex: 'requirement',
      key: 'requirement',
      width: '30%',
      render: (text: string) => <Text type="secondary" style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Giá trị đo',
      key: 'measuredValue',
      width: '15%',
      render: (_: unknown, _record: typeof defaultCheckItems[0], idx: number) => (
        <Input
          size="small"
          style={{ borderRadius: 6 }}
          placeholder="Nhập giá trị..."
          onChange={() => {}}
        />
      ),
    },
    {
      title: 'Kết quả',
      key: 'result',
      width: '20%',
      render: (_: unknown, record: typeof defaultCheckItems[0]) => (
        <Select
          size="small"
          style={{ width: '100%', borderRadius: 6 }}
          value={record.result}
          onChange={(val) => setItems(prev => prev.map(it => it.id === record.id ? { ...it, result: val as CheckItemResult } : it))}
          options={Object.entries(checkItemResultConfig).map(([k, v]) => ({ value: k, label: v.label }))}
        />
      ),
    },
  ];

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
          onClick={() => navigate('/kiem-soat-van-hanh')}
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
          background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckSquareOutlined style={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
            Tạo Phiếu Kiểm soát Điều kiện An toàn
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            Kiểm soát điều kiện an toàn đầu ca theo phân xưởng — Nhà máy Z119
          </div>
        </div>
      </div>

      <Form layout="vertical">
        {/* ─── Thông tin chung ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Thông tin ca kiểm tra"
            gradient="linear-gradient(135deg, #0891b2, #06b6d4)"
          />
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Phân xưởng <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="workshopId"
                rules={[{ required: true, message: 'Vui lòng chọn phân xưởng' }]}
              >
                <Select style={{ borderRadius: 8 }} placeholder="Chọn phân xưởng..." options={workshopOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ca làm việc <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="shift"
                rules={[{ required: true, message: 'Vui lòng chọn ca' }]}
              >
                <Select style={{ borderRadius: 8 }} placeholder="Chọn ca..." options={shiftOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ngày kiểm tra <span style={{ color: '#ff4d4f' }}>*</span></Text>}
                name="date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Người kiểm tra <span style={{ color: '#ff4d4f' }}>*</span></Text>}
            name="inspector"
            rules={[{ required: true, message: 'Vui lòng nhập người kiểm tra' }]}
            style={{ marginBottom: 0 }}
          >
            <Input style={{ borderRadius: 8 }} placeholder="Họ tên, chức vụ người kiểm tra..." />
          </Form.Item>
        </div>

        {/* ─── Danh mục kiểm tra ─── */}
        <div style={cardStyle}>
          <SectionHeader
            icon={<UnorderedListOutlined style={{ color: '#fff', fontSize: 16 }} />}
            title="Danh mục điểm kiểm tra"
            gradient="linear-gradient(135deg, #7c3aed, #a855f7)"
          />
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ borderRadius: 8, overflow: 'hidden' }}
            scroll={{ x: 700 }}
          />
        </div>

        {/* ─── Ghi chú ─── */}
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <Form.Item
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ghi chú tổng quát</Text>}
            name="note"
            style={{ marginBottom: 0 }}
          >
            <TextArea rows={3} style={{ borderRadius: 8 }} placeholder="Ghi chú về tình trạng chung, vấn đề cần lưu ý..." />
          </Form.Item>
        </div>

        {/* ─── Action bar ─── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, paddingBottom: 8 }}>
          <Button
            style={{ borderRadius: 8, height: 40, minWidth: 88 }}
            onClick={() => navigate('/kiem-soat-van-hanh')}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, fontWeight: 500 }}
            onClick={() => navigate('/kiem-soat-van-hanh')}
          >
            Lưu phiếu
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SafetyControlFormPage;
