import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions,
  Drawer, Form, Input, DatePicker, Select, Alert, Divider, Tabs,
} from 'antd';
import {
  ArrowLeftOutlined, BuildOutlined, ToolOutlined, SettingOutlined,
  CheckCircleOutlined, ClockCircleOutlined, EditOutlined,
  AuditOutlined, FileTextOutlined,
  SafetyCertificateOutlined, CheckSquareOutlined, SendOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { assemblies } from '../../data/assemblies';
import { overhaulOrders } from '../../data/overhaulOrders';
import { assemblyStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_STATUS: Record<string, number> = {
  preparing: 1,
  assembling: 2,
  calibrating: 3,
  pending_test: 4,
  completed: 5,
};

const STEPS = [
  { key: '1', label: 'Chuẩn bị',    icon: <CheckSquareOutlined />, color: '#1B3A5C' },
  { key: '2', label: 'Lắp ráp',     icon: <BuildOutlined />,       color: '#0891b2' },
  { key: '3', label: 'Hiệu chỉnh',  icon: <SettingOutlined />,     color: '#7c3aed' },
  { key: '4', label: 'Ghi nhận',    icon: <FileTextOutlined />,    color: '#d97706' },
  { key: '5', label: 'Thử nghiệm',  icon: <RocketOutlined />,      color: '#16a34a' },
];

const AssemblyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  const record = assemblies.find(a => a.id === id);
  const order = overhaulOrders.find(o => record && o.id === record.orderId);

  if (!record) return <div style={{ padding: 24 }}>Không tìm thấy hồ sơ lắp ráp.</div>;

  const statusCfg = assemblyStatusConfig[record.status];
  const currentStep = STEP_STATUS[record.status] ?? 1;

  const renderTechRows = (raw: string, bgColor: string, borderColor: string) =>
    raw.split(';').map((item, i) => {
      const trimmed = item.trim();
      if (!trimmed) return null;
      const passed = trimmed.includes('✓');
      return (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '8px 12px', background: bgColor, borderRadius: 8,
          border: `1px solid ${borderColor}`, marginBottom: 6,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: passed ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, flexShrink: 0, marginTop: 1 }}>
            {passed ? '✓' : '…'}
          </div>
          <Text style={{ fontSize: 13, flex: 1 }}>{trimmed.replace(' ✓', '')}</Text>
        </div>
      );
    });

  const tabLabel = (step: typeof STEPS[0]) => {
    const done = currentStep > Number(step.key);
    const active = currentStep === Number(step.key);
    return (
      <Space size={6}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: done ? '#16a34a' : active ? step.color : `${step.color}33`,
          border: `1.5px solid ${done ? '#16a34a' : step.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: done || active ? '#fff' : step.color, fontWeight: 700,
        }}>
          {done ? '✓' : step.key}
        </div>
        {step.label}
      </Space>
    );
  };

  const tabItems = [
    // ── Tab 1: Chuẩn bị ──────────────────────────────────────────────────────
    {
      key: '1',
      label: tabLabel(STEPS[0]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {currentStep === 1 && (
            <Alert type="info" showIcon message="Bước đang thực hiện"
              description="Tiếp nhận cấu phần đã xử lý, kiểm tra đầy đủ và chuẩn bị điều kiện lắp ráp."
              style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }} />
          )}
          <Row gutter={16}>
            {record.componentCount !== undefined && (
              <Col span={6}>
                <div style={{ padding: '16px', background: currentStep > 1 ? '#f6ffed' : '#eff6ff', borderRadius: 10, border: `1px solid ${currentStep > 1 ? '#b7eb8f' : '#bfdbfe'}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: currentStep > 1 ? '#16a34a' : colors.navy }}>{record.componentCount}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cấu phần tiếp nhận</Text>
                  {currentStep > 1 && <div style={{ marginTop: 4 }}><Tag color="success" style={{ fontSize: 11 }}>Đủ</Tag></div>}
                </div>
              </Col>
            )}
            <Col span={record.componentCount !== undefined ? 18 : 24}>
              {record.checklistNotes ? (
                <div style={{ padding: '14px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', height: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
                    <CheckSquareOutlined style={{ marginRight: 4 }} />Biên bản kiểm tra đầu vào
                  </Text>
                  <Text style={{ fontSize: 13 }}>{record.checklistNotes}</Text>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>Chưa ghi nhận thông tin chuẩn bị.</Text>
                </div>
              )}
            </Col>
          </Row>
          {record.checklistNotes && currentStep > 1 && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Bước 1 hoàn thành — Đã tiếp nhận đủ cấu phần và chuẩn bị điều kiện lắp ráp"
              style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
          )}
        </div>
      ),
    },

    // ── Tab 2: Lắp ráp ───────────────────────────────────────────────────────
    {
      key: '2',
      label: tabLabel(STEPS[1]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {currentStep === 2 && (
            <Alert type="info" showIcon message="Bước đang thực hiện"
              description="Lắp ráp hệ thống theo trình tự kỹ thuật, kiểm soát mômen xiết và khe hở lắp ghép."
              style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }} />
          )}
          {record.torqueRecords ? (
            <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0891b2' }}
              title={<Space><ToolOutlined style={{ color: '#0891b2' }} /><Text strong style={{ color: '#0891b2', fontSize: 13 }}>Ghi nhận mômen xiết bu lông</Text></Space>}>
              {renderTechRows(record.torqueRecords, '#ecfeff', '#a5f3fc')}
            </Card>
          ) : (
            <div style={{ padding: '14px 16px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa ghi nhận mômen xiết.</Text>
            </div>
          )}
          {record.clearanceRecords ? (
            <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0891b2' }}
              title={<Space><SafetyCertificateOutlined style={{ color: '#0891b2' }} /><Text strong style={{ color: '#0891b2', fontSize: 13 }}>Kiểm tra khe hở & dung sai lắp ghép</Text></Space>}>
              {renderTechRows(record.clearanceRecords, '#f0f9ff', '#bae6fd')}
            </Card>
          ) : (
            <div style={{ padding: '14px 16px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa ghi nhận khe hở & dung sai.</Text>
            </div>
          )}
          {record.torqueRecords && record.clearanceRecords && currentStep > 2 && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Bước 2 hoàn thành — Lắp ráp đạt yêu cầu kỹ thuật"
              style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
          )}
        </div>
      ),
    },

    // ── Tab 3: Hiệu chỉnh ────────────────────────────────────────────────────
    {
      key: '3',
      label: tabLabel(STEPS[2]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {currentStep === 3 && (
            <Alert type="info" showIcon message="Bước đang thực hiện"
              description="Điều chỉnh các thông số kỹ thuật để đảm bảo hệ thống hoạt động đúng thiết kế."
              style={{ borderRadius: 8, background: '#f5f3ff', border: '1px solid #ddd6fe' }} />
          )}
          {record.calibrationParams ? (
            <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #7c3aed' }}
              title={<Space><SettingOutlined style={{ color: '#7c3aed' }} /><Text strong style={{ color: '#7c3aed', fontSize: 13 }}>Thông số hiệu chỉnh hệ thống</Text></Space>}>
              {renderTechRows(record.calibrationParams, '#faf5ff', '#e9d5ff')}
            </Card>
          ) : (
            <div style={{ padding: '14px 16px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa ghi nhận thông số hiệu chỉnh.</Text>
            </div>
          )}
          {record.calibrationParams && currentStep > 3 && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Bước 3 hoàn thành — Tất cả thông số hiệu chỉnh đạt yêu cầu"
              style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
          )}
        </div>
      ),
    },

    // ── Tab 4: Ghi nhận ──────────────────────────────────────────────────────
    {
      key: '4',
      label: tabLabel(STEPS[3]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {currentStep === 4 && (
            <Alert type="info" showIcon message="Bước đang thực hiện"
              description="Ghi nhận toàn bộ thông tin lắp ráp, cấu hình lắp và người thực hiện để phục vụ truy vết."
              style={{ borderRadius: 8, background: '#fffbe6', border: '1px solid #ffe58f' }} />
          )}
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #d97706' }}
            title={<Space><AuditOutlined style={{ color: '#d97706' }} /><Text strong style={{ color: '#d97706', fontSize: 13 }}>Thông tin hồ sơ lắp ráp</Text></Space>}>
            <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontWeight: 500, fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Người thực hiện" span={2}><Text>{record.performedBy}</Text></Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu"><Text>{formatDate(record.startDate)}</Text></Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {record.endDate
                  ? <Text style={{ color: '#16a34a', fontWeight: 600 }}>{formatDate(record.endDate)}</Text>
                  : <Text type="secondary">Đang thực hiện</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí">
                {record.cost ? <Text strong style={{ color: '#d97706' }}>{record.cost} triệu đồng</Text> : <Text type="secondary">Chưa xác định</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color={statusCfg?.color}>{statusCfg?.label}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
          {record.configSnapshot ? (
            <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #d97706' }}
              title={<Space><FileTextOutlined style={{ color: '#d97706' }} /><Text strong style={{ color: '#d97706', fontSize: 13 }}>Snapshot cấu hình lắp ráp</Text></Space>}>
              <div style={{ padding: '12px 14px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                <Text style={{ fontSize: 13 }}>{record.configSnapshot}</Text>
              </div>
            </Card>
          ) : (
            <div style={{ padding: '14px 16px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa ghi nhận snapshot cấu hình.</Text>
            </div>
          )}
          {record.notes && (
            <Card size="small" style={{ borderRadius: 10 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Ghi chú</Text>}>
              <div style={{ padding: '10px 14px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                <Text style={{ fontSize: 13 }}>{record.notes}</Text>
              </div>
            </Card>
          )}
        </div>
      ),
    },

    // ── Tab 5: Thử nghiệm ────────────────────────────────────────────────────
    {
      key: '5',
      label: tabLabel(STEPS[4]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.readyForTest ? (
            <>
              <Alert type="success" showIcon icon={<CheckCircleOutlined />}
                message="Thiết bị đủ điều kiện chuyển sang thử nghiệm chức năng"
                description="Toàn bộ thông số lắp ráp và hiệu chỉnh đạt yêu cầu kỹ thuật. Có thể tạo yêu cầu thử nghiệm và chuyển sang bệ thử."
                style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #16a34a' }}
                title={<Space><RocketOutlined style={{ color: '#16a34a' }} /><Text strong style={{ color: '#16a34a', fontSize: 13 }}>Các hành động tiếp theo</Text></Space>}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {[
                    'Chuyển thiết bị sang bệ thử nghiệm',
                    'Cập nhật trạng thái "Chờ thử nghiệm" trong hệ thống',
                    'Tạo yêu cầu thử nghiệm chức năng',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, flexShrink: 0 }}>{i + 1}</div>
                      <Text style={{ fontSize: 13 }}>{item}</Text>
                    </div>
                  ))}
                </div>
                <Divider style={{ margin: '14px 0 10px' }} />
                <Button type="primary" icon={<RocketOutlined />}
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => navigate('/test-acceptances')}>
                  Xem hồ sơ thử nghiệm
                </Button>
              </Card>
            </>
          ) : (
            <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8', textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 36, color: '#ccc', marginBottom: 12 }} />
              <div><Text type="secondary" style={{ fontSize: 14 }}>Chưa sẵn sàng chuyển thử nghiệm</Text></div>
              <div style={{ marginTop: 6 }}><Text type="secondary" style={{ fontSize: 12 }}>Hoàn thành các bước Lắp ráp, Hiệu chỉnh và Ghi nhận trước khi chuyển sang thử nghiệm.</Text></div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Hero */}
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
                  <Space size={8}>
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{record.id}</Title>
                    <Tag style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 600 }}>{statusCfg?.label}</Tag>
                  </Space>
                  <div><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{record.equipmentName} · {order?.code} · {record.workshopName}</Text></div>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                {record.status !== 'completed' && record.status !== 'pending_test' && (
                  <Button icon={<EditOutlined />} onClick={() => setDrawerOpen(true)}
                    style={{ background: '#0891b2', borderColor: '#0891b2', color: '#fff', fontWeight: 600 }}>
                    Cập nhật tiến độ
                  </Button>
                )}
                {record.status === 'pending_test' && (
                  <Button icon={<RocketOutlined />} onClick={() => navigate('/test-acceptances')}
                    style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 600 }}>
                    Chuyển sang Thử nghiệm
                  </Button>
                )}
                {record.status === 'completed' && (
                  <Tag style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, padding: '4px 12px', borderRadius: 6 }}>
                    <CheckCircleOutlined style={{ marginRight: 4 }} />Hoàn thành
                  </Tag>
                )}
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="order-detail-tabs" />
      </Card>

      {/* Update Drawer */}
      <Drawer
        title={<Space><EditOutlined style={{ color: '#0891b2' }} /><Text strong style={{ color: '#0891b2' }}>Cập nhật tiến độ — {record.id}</Text></Space>}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480} destroyOnClose>
        <Form form={drawerForm} layout="vertical">
          <Alert type="info" showIcon
            message={`Trạng thái hiện tại: ${statusCfg?.label}`}
            style={{ marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8 }}
          />

          <Form.Item label="Chuyển sang bước" name="status">
            <Select options={[
              { value: 'preparing',    label: 'Bước 1 — Chuẩn bị' },
              { value: 'assembling',   label: 'Bước 2 — Đang lắp ráp' },
              { value: 'calibrating',  label: 'Bước 3 — Đang hiệu chỉnh' },
              { value: 'pending_test', label: 'Bước 4/5 — Chờ thử nghiệm' },
              { value: 'completed',    label: 'Hoàn thành' },
            ]} style={{ borderRadius: 6 }} />
          </Form.Item>

          {(record.status === 'assembling' || record.status === 'preparing') && (
            <>
              <Form.Item label="Ghi nhận mômen xiết (Bước 2)" name="torqueRecords">
                <TextArea rows={3} placeholder="Bu lông M16: 85 N·m (TT: 80-90); Bu lông M12: 55 N·m..." style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
              <Form.Item label="Ghi nhận khe hở & dung sai (Bước 2)" name="clearanceRecords">
                <TextArea rows={3} placeholder="Khe hở vòng bi: 0.012mm (TT: 0.005-0.020mm); ..." style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </>
          )}

          {record.status === 'calibrating' && (
            <Form.Item label="Thông số hiệu chỉnh (Bước 3)" name="calibrationParams">
              <TextArea rows={4} placeholder="Tốc độ quay: 6.0 rpm (TT: 6±0.1); Công suất: 98 kW (TT: ≥95); ..." style={{ borderRadius: 6, fontSize: 12 }} />
            </Form.Item>
          )}

          <Form.Item label="Ngày hoàn thành (nếu xong)" name="endDate">
            <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Ghi chú tiến độ" name="notes">
            <TextArea rows={2} placeholder="Ghi chú phát sinh, vấn đề kỹ thuật..." style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Row justify="space-between">
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" icon={<SendOutlined />}
              style={{ background: '#0891b2', borderColor: '#0891b2' }}
              onClick={() => setDrawerOpen(false)}>
              Lưu cập nhật
            </Button>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default AssemblyDetail;
