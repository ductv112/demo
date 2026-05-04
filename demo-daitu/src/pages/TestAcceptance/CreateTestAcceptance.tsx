import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Button, Space, Tabs, Form, Input, Select,
  DatePicker, Alert, Tag, Divider, Table,
} from 'antd';
import {
  ArrowLeftOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  SaveOutlined, SendOutlined, ExperimentOutlined, RocketOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { assemblies } from '../../data/assemblies';
import { testAcceptances } from '../../data/testAcceptances';
import { technicalInspections } from '../../data/technicalInspections';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_COLORS = ['#1B3A5C', '#0891b2'];

const CreateTestAcceptance: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Lệnh có hồ sơ lắp ráp sẵn sàng (pending_test hoặc completed) và chưa có hồ sơ thử nghiệm
  const existingTAOrderIds = new Set(testAcceptances.map(t => t.orderId));
  const readyOrders = overhaulOrders.filter(o => {
    const asm = assemblies.find(a => a.orderId === o.id);
    return asm && ['pending_test', 'completed'].includes(asm.status) && !existingTAOrderIds.has(o.id);
  });

  const selectedOrder = overhaulOrders.find(o => o.id === selectedOrderId);
  const selectedAssembly = assemblies.find(a => a.orderId === selectedOrderId);

  const handleOrderChange = (val: string) => {
    setSelectedOrderId(val);
    form.resetFields(['testScenario', 'testEnvironment', 'testRequirements', 'testRequestDate', 'notes']);
  };

  const tabLabel = (n: number, label: string, color: string) => (
    <Space size={6}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === String(n) ? color : `${color}33`, border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === String(n) ? '#fff' : color }}>{n}</div>
      {label}
    </Space>
  );

  const tabItems = [
    {
      key: '1',
      label: tabLabel(1, 'Chuẩn bị thử nghiệm', STEP_COLORS[0]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 1: Xác định yêu cầu và chuẩn bị điều kiện thử nghiệm"
            description="Chọn lệnh đại tu đã hoàn thành lắp ráp, xác định kịch bản và tiêu chuẩn đánh giá."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }} />

          <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
            <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Chọn lệnh đại tu</Text>
            <Form.Item name="orderId" style={{ marginTop: 12, marginBottom: 0 }}>
              <Select placeholder="Chọn lệnh đại tu đã sẵn sàng thử nghiệm..." style={{ width: '100%' }} onChange={handleOrderChange}
                options={readyOrders.length > 0
                  ? readyOrders.map(o => ({ value: o.id, label: `${o.code} — ${o.equipmentName}` }))
                  : overhaulOrders.filter(o => ['in_progress', 'approved'].includes(o.status)).map(o => ({ value: o.id, label: `${o.code} — ${o.equipmentName}` }))
                }
              />
            </Form.Item>
            {selectedOrder && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <Row gutter={16}>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Thiết bị</Text><div><Text strong>{selectedOrder.equipmentName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Trung tâm</Text><div><Text strong>{selectedOrder.workshopName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Lắp ráp</Text><div>
                    {selectedAssembly
                      ? <Tag color={selectedAssembly.status === 'pending_test' ? 'warning' : 'success'} style={{ fontSize: 11 }}>
                          {selectedAssembly.status === 'pending_test' ? 'Chờ thử nghiệm' : 'Hoàn thành'}
                        </Tag>
                      : <Text type="secondary" style={{ fontSize: 12 }}>Chưa có</Text>
                    }
                  </div></Col>
                </Row>
              </div>
            )}
          </Card>

          {selectedOrderId && (() => {
            const insps = technicalInspections.filter(i => i.orderId === selectedOrderId && i.status === 'completed');
            if (insps.length === 0) return null;
            const passCount = insps.filter(i => i.result === 'pass').length;
            const failCount = insps.filter(i => i.result === 'fail').length;
            const marginalCount = insps.filter(i => i.result === 'marginal').length;
            const resultCfg: Record<string, { label: string; color: string }> = {
              pass: { label: 'Đạt', color: 'success' },
              fail: { label: 'Không đạt', color: 'error' },
              marginal: { label: 'Cận biên', color: 'warning' },
            };
            const dispositionCfg: Record<string, { label: string; color: string }> = {
              serviceable: { label: 'Sử dụng được', color: 'green' },
              replace: { label: 'Thay thế', color: 'red' },
              restore: { label: 'Phục hồi', color: 'orange' },
              scrap: { label: 'Loại bỏ', color: 'default' },
            };
            const cols = [
              { title: 'Cấu phần', dataIndex: 'componentName', key: 'componentName', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
              { title: 'Đo được / Tiêu chuẩn', key: 'measure', render: (_: unknown, r: typeof insps[0]) => (
                r.measuredValue
                  ? <><Text style={{ fontSize: 11, color: '#1B3A5C', fontWeight: 600 }}>{r.measuredValue}</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{r.technicalLimit}</Text></>
                  : <Text type="secondary" style={{ fontSize: 11 }}>{r.comparisonNote?.slice(0, 40)}…</Text>
              )},
              { title: 'Kết quả', dataIndex: 'result', key: 'result', width: 100,
                render: (v: string) => <Tag color={resultCfg[v]?.color} style={{ fontSize: 11 }}>{resultCfg[v]?.label}</Tag> },
              { title: 'Xử lý', dataIndex: 'disposition', key: 'disposition', width: 110,
                render: (v: string) => <Tag color={dispositionCfg[v]?.color} style={{ fontSize: 11 }}>{dispositionCfg[v]?.label}</Tag> },
            ];
            return (
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #16a34a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text strong style={{ color: '#15803d', fontSize: 13 }}>Kết quả kiểm tra linh kiện (Quy trình 4)</Text>
                  <Space size={6}>
                    <Tag color="success" style={{ margin: 0 }}>{passCount} đạt</Tag>
                    {marginalCount > 0 && <Tag color="warning" style={{ margin: 0 }}>{marginalCount} cận biên</Tag>}
                    {failCount > 0 && <Tag color="error" style={{ margin: 0 }}>{failCount} không đạt</Tag>}
                  </Space>
                </div>
                <Table
                  dataSource={insps}
                  columns={cols}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  style={{ fontSize: 12 }}
                />
              </Card>
            );
          })()}

          <Card size="small" style={{ borderRadius: 10 }}>
            <Text strong style={{ color: colors.navy, fontSize: 13 }}>Kịch bản & điều kiện thử nghiệm</Text>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              <Form.Item label="Kịch bản thử nghiệm" name="testScenario" style={{ marginBottom: 0 }}>
                <TextArea rows={3} placeholder="Mô tả kịch bản: đo thông số chức năng, thử nghiệm tải, chạy liên tục..." style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
              <Form.Item label="Môi trường / Bệ thử" name="testEnvironment" style={{ marginBottom: 0 }}>
                <Input placeholder="VD: Bệ thử kỹ thuật Trung tâm phần mềm Alpha; nhiệt độ 22–28°C" style={{ borderRadius: 6 }} />
              </Form.Item>
              <Form.Item label="Tiêu chuẩn đánh giá" name="testRequirements" style={{ marginBottom: 0 }}>
                <TextArea rows={3} placeholder="VD: Tầm phát hiện: ≥250km; Công suất: ≥95kW; Vận hành liên tục: 8 giờ không lỗi;..." style={{ borderRadius: 6, fontSize: 12 }} />
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
      label: tabLabel(2, 'Gửi yêu cầu', STEP_COLORS[1]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 2: Gửi yêu cầu thử nghiệm chính thức"
            description="Điền thông tin người phụ trách và ngày gửi yêu cầu. Kết quả thử nghiệm sẽ cập nhật sau."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }} />

          <Card size="small" style={{ borderRadius: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Ngày gửi yêu cầu" name="testRequestDate" style={{ marginBottom: 0 }}>
                    <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Người phụ trách" name="responsiblePerson" style={{ marginBottom: 0 }}>
                    <Input placeholder="Tên KTV / Kỹ sư phụ trách" style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Ghi chú" name="notes" style={{ marginBottom: 0 }}>
                <TextArea rows={3} placeholder="Yêu cầu đặc biệt, lưu ý kỹ thuật cho quá trình thử nghiệm..." style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </div>
          </Card>

          <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
            <Space>
              <ExperimentOutlined style={{ color: '#0891b2' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sau khi tạo, hồ sơ sẽ ở trạng thái <Tag color="gold">Chờ thử nghiệm</Tag>. Kết quả cập nhật trong trang chi tiết.
              </Text>
            </Space>
          </div>

          {selectedOrder && (
            <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Space>
                <CheckCircleOutlined style={{ color: '#16a34a' }} />
                <Text style={{ fontSize: 13 }}>
                  Tạo hồ sơ thử nghiệm cho <Text strong>{selectedOrder.equipmentName}</Text> — {selectedOrder.code}
                </Text>
              </Space>
            </Card>
          )}

          <Divider style={{ margin: '4px 0' }} />
          <Row justify="space-between">
            <Button onClick={() => setActiveTab('1')} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            <Space>
              <Button icon={<SaveOutlined />}>Lưu nháp</Button>
              <Button type="primary" icon={<RocketOutlined />}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => navigate('/test-acceptances')}>
                Tạo hồ sơ thử nghiệm
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
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/test-acceptances')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyCertificateOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tạo hồ sơ thử nghiệm</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 7 · Thử nghiệm chức năng và nghiệm thu</Text>
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

export default CreateTestAcceptance;
