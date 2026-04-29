import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Button, Space, Tabs, Form, Input, Select,
  DatePicker, Alert, Tag, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, BuildOutlined, CheckCircleOutlined,
  SaveOutlined, SendOutlined, InfoCircleOutlined, UserOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { restorations } from '../../data/restorations';
import { assemblies } from '../../data/assemblies';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_COLORS = ['#1B3A5C', '#0891b2'];

const availableOrders = overhaulOrders.filter(o =>
  ['approved', 'in_progress'].includes(o.status)
);

const CreateAssembly: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const selectedOrder = availableOrders.find(o => o.id === selectedOrderId);

  const readyComponents = restorations.filter(r =>
    r.orderId === selectedOrderId && r.readyForAssembly === true
  );

  const handleOrderChange = (val: string) => {
    setSelectedOrderId(val);
    form.resetFields(['workshopName', 'performedBy', 'startDate', 'checklistNotes', 'notes']);
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '1' ? STEP_COLORS[0] : `${STEP_COLORS[0]}33`, border: `1.5px solid ${STEP_COLORS[0]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '1' ? '#fff' : STEP_COLORS[0] }}>1</div>
          Tiếp nhận & Chuẩn bị
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 1: Tiếp nhận cấu phần và chuẩn bị điều kiện lắp ráp"
            description="Chọn lệnh đại tu, xác nhận các cấu phần sẵn sàng lắp ráp từ quy trình phục hồi."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
            <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Chọn lệnh đại tu</Text>
            <Form.Item name="orderId" style={{ marginTop: 12, marginBottom: 0 }}>
              <Select placeholder="Chọn lệnh đại tu..." style={{ width: '100%' }} onChange={handleOrderChange}
                options={availableOrders.map(o => ({
                  value: o.id,
                  label: `${o.code} — ${o.equipmentName}`,
                }))}
              />
            </Form.Item>
            {selectedOrder && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <Row gutter={16}>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Thiết bị</Text><div><Text strong>{selectedOrder.equipmentName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Phân xưởng</Text><div><Text strong>{selectedOrder.workshopName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Cấu phần sẵn sàng</Text><div><Text strong style={{ color: readyComponents.length > 0 ? '#16a34a' : '#d97706' }}>{readyComponents.length} cấu phần</Text></div></Col>
                </Row>
              </div>
            )}
          </Card>

          {selectedOrderId && readyComponents.length > 0 && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid #16a34a` }}
              title={<Text strong style={{ color: '#16a34a', fontSize: 13 }}><CheckCircleOutlined style={{ marginRight: 6 }} />Cấu phần sẵn sàng lắp ráp ({readyComponents.length})</Text>}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {readyComponents.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                    <Space size={8}>
                      <CheckCircleOutlined style={{ color: '#16a34a' }} />
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{r.componentName}</Text>
                        <div style={{ fontSize: 11, color: '#888' }}>{r.id}</div>
                      </div>
                    </Space>
                    <Tag color="success" style={{ fontSize: 11 }}>Sẵn sàng</Tag>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {selectedOrderId && readyComponents.length === 0 && (
            <Alert type="warning" showIcon
              message="Chưa có cấu phần sẵn sàng lắp ráp"
              description="Các cấu phần của lệnh này chưa hoàn thành quy trình phục hồi. Vẫn có thể tạo hồ sơ lắp ráp và bổ sung sau."
              style={{ borderRadius: 10 }}
            />
          )}

          <Card size="small" style={{ borderRadius: 10 }}>
            <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Thông tin chuẩn bị</Text>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              <Form.Item label="Phân xưởng thực hiện" name="workshopName" style={{ marginBottom: 0 }}>
                <Select placeholder="Chọn phân xưởng..." style={{ width: '100%' }}
                  options={[
                    { value: 'Phân xưởng PX1 - Sửa chữa Radar', label: 'PX1 — Sửa chữa Radar' },
                    { value: 'Phân xưởng PX2 - Sửa chữa Tên lửa', label: 'PX2 — Sửa chữa Tên lửa' },
                    { value: 'Phân xưởng PX3 - Cơ khí', label: 'PX3 — Cơ khí' },
                    { value: 'Phân xưởng PX4 - Điện tử', label: 'PX4 — Điện tử' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Ghi chú kiểm tra đầu vào" name="checklistNotes" style={{ marginBottom: 0 }}>
                <TextArea rows={3} placeholder="Mô tả tình trạng tiếp nhận: đủ cấu phần, dụng cụ chuyên dụng, điều kiện khu vực lắp ráp..." style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={() => setActiveTab('2')}
              style={{ background: STEP_COLORS[1], borderColor: STEP_COLORS[1] }}>
              Tiếp theo: Thông tin thực hiện
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '2' ? STEP_COLORS[1] : `${STEP_COLORS[1]}33`, border: `1.5px solid ${STEP_COLORS[1]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '2' ? '#fff' : STEP_COLORS[1] }}>2</div>
          Thông tin thực hiện
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 2–4: Điền thông tin đội thực hiện và khởi tạo hồ sơ"
            description="Các thông tin lắp ráp chi tiết (mômen xiết, khe hở, hiệu chỉnh) sẽ được ghi nhận trong quá trình thực hiện."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          <Card size="small" style={{ borderRadius: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              <Form.Item label="Đội / Tổ lắp ráp" name="performedBy" style={{ marginBottom: 0 }}>
                <Input prefix={<UserOutlined style={{ color: '#ccc' }} />}
                  placeholder="VD: Tổ lắp ráp PX1 — KTV Nguyễn Thanh Sơn (trưởng tổ), KTV ..."
                  style={{ borderRadius: 6 }} />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Ngày bắt đầu" name="startDate" style={{ marginBottom: 0 }}>
                    <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" placeholder="Ngày bắt đầu lắp ráp" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Chi phí dự kiến (triệu đồng)" name="cost" style={{ marginBottom: 0 }}>
                    <Input type="number" placeholder="0" style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Ghi chú chung" name="notes" style={{ marginBottom: 0 }}>
                <TextArea rows={3} placeholder="Yêu cầu đặc biệt, điều kiện kỹ thuật cần lưu ý trong quá trình lắp ráp..." style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </div>
          </Card>

          <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />
              Sau khi tạo, hồ sơ lắp ráp sẽ ở trạng thái <Tag color="gold">Chuẩn bị</Tag>.
              Tiến độ các bước tiếp theo được cập nhật trong trang chi tiết.
            </Text>
          </div>

          <Divider style={{ margin: '4px 0' }} />

          <Row justify="space-between">
            <Button onClick={() => setActiveTab('1')} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            <Space>
              <Button icon={<SaveOutlined />}>Lưu nháp</Button>
              <Button type="primary" icon={<SendOutlined />}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => navigate('/assemblies')}>
                Tạo hồ sơ lắp ráp
              </Button>
            </Space>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assemblies')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BuildOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tạo hồ sơ lắp ráp</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 6 · Lắp ráp, hiệu chỉnh và kiểm soát kỹ thuật</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="order-detail-tabs" />
        </Card>
      </Form>
    </div>
  );
};

export default CreateAssembly;
