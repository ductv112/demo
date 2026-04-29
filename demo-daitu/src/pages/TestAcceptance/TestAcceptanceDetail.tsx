import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions,
  Drawer, Form, Input, DatePicker, Select, Alert, Tabs, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EditOutlined, SendOutlined, ExperimentOutlined,
  ClockCircleOutlined, FileTextOutlined, WarningOutlined,
  TrophyOutlined, TeamOutlined, RocketOutlined,
} from '@ant-design/icons';
import { testAcceptances } from '../../data/testAcceptances';
import { overhaulOrders } from '../../data/overhaulOrders';
import { testAcceptanceStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_STEP: Record<string, number> = {
  pending_test: 1,
  testing:      2,
  passed:       3,
  failed:       5,
  retesting:    5,
  accepted:     4,
  delivered:    6,
};

const TABS = [
  { key: '1', label: 'Chuẩn bị',       icon: <ExperimentOutlined />,    color: '#1B3A5C' },
  { key: '2', label: 'Gửi yêu cầu',    icon: <SendOutlined />,          color: '#0891b2' },
  { key: '3', label: 'Kết quả',        icon: <FileTextOutlined />,      color: '#7c3aed' },
  { key: '4', label: 'Nghiệm thu',     icon: <TrophyOutlined />,        color: '#16a34a' },
  { key: '5', label: 'Xử lý không đạt', icon: <WarningOutlined />,      color: '#dc2626' },
  { key: '6', label: 'Bàn giao',       icon: <TeamOutlined />,          color: '#d97706' },
];

const TestAcceptanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerForm] = Form.useForm();
  const [resultForm] = Form.useForm();
  const [resultDrawerOpen, setResultDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [resultSubmitted, setResultSubmitted] = useState(false);

  const record = testAcceptances.find(t => t.id === id);
  const order = overhaulOrders.find(o => record && o.id === record.orderId);

  if (!record) return <div style={{ padding: 24 }}>Không tìm thấy hồ sơ thử nghiệm.</div>;

  const statusCfg = testAcceptanceStatusConfig[record.status];
  const currentStep = STATUS_STEP[record.status] ?? 1;
  const passed = record.testResult === 'pass';
  const failed = record.testResult === 'fail';

  const renderMetricRows = (raw: string) =>
    raw.split(';').map((item, i) => {
      const trimmed = item.trim();
      if (!trimmed) return null;
      const ok = trimmed.includes('✓');
      const fail = trimmed.includes('✗');
      return (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '8px 12px', borderRadius: 8, marginBottom: 6,
          background: ok ? '#f6ffed' : fail ? '#fff2f0' : '#f8fafc',
          border: `1px solid ${ok ? '#b7eb8f' : fail ? '#ffa39e' : '#e8e8e8'}`,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: ok ? '#16a34a' : fail ? '#ff4d4f' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, flexShrink: 0, marginTop: 1 }}>
            {ok ? '✓' : fail ? '✗' : '–'}
          </div>
          <Text style={{ fontSize: 13, flex: 1 }}>{trimmed.replace(' ✓', '').replace(' ✗', '')}</Text>
        </div>
      );
    });

  const tabLabel = (tab: typeof TABS[0]) => {
    const stepNum = Number(tab.key);
    const done = record.status === 'delivered' ||
      (stepNum < currentStep && !(stepNum === 5 && !failed));
    const active = currentStep === stepNum;
    const skip = stepNum === 5 && passed && record.status !== 'retesting' && record.status !== 'failed';
    if (skip) return (
      <Space size={6}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#e8e8e8', border: '1.5px solid #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#bbb', fontWeight: 700 }}>{tab.key}</div>
        <span style={{ color: '#bbb' }}>{tab.label}</span>
      </Space>
    );
    return (
      <Space size={6}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: done ? '#16a34a' : active ? tab.color : `${tab.color}33`,
          border: `1.5px solid ${done ? '#16a34a' : tab.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: (done || active) ? '#fff' : tab.color, fontWeight: 700,
        }}>
          {done ? '✓' : tab.key}
        </div>
        {tab.label}
      </Space>
    );
  };

  const tabItems = [
    // ── Tab 1: Chuẩn bị ──────────────────────────────────────────────────────
    {
      key: '1',
      label: tabLabel(TABS[0]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {currentStep === 1 && (
            <Alert type="info" showIcon message="Đang chuẩn bị thử nghiệm"
              description="Xác định kịch bản, môi trường và tiêu chuẩn đánh giá trước khi thực hiện."
              style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }} />
          )}
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1B3A5C' }}
            title={<Space><ExperimentOutlined style={{ color: '#1B3A5C' }} /><Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Kịch bản thử nghiệm</Text></Space>}>
            <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <Text style={{ fontSize: 13 }}>{record.testScenario}</Text>
            </div>
          </Card>
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1B3A5C' }}
            title={<Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Môi trường & điều kiện thử nghiệm</Text>}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e8e8e8' }}>
              <Text style={{ fontSize: 13 }}>{record.testEnvironment}</Text>
            </div>
          </Card>
          {record.testRequirements && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1B3A5C' }}
              title={<Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Tiêu chuẩn đánh giá</Text>}>
              {record.testRequirements.split(';').map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e8e8e8', marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1B3A5C', flexShrink: 0 }} />
                  <Text style={{ fontSize: 13 }}>{req.trim()}</Text>
                </div>
              ))}
            </Card>
          )}
        </div>
      ),
    },

    // ── Tab 2: Gửi yêu cầu ───────────────────────────────────────────────────
    {
      key: '2',
      label: tabLabel(TABS[1]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {currentStep === 2 && (
            <Alert type="info" showIcon message="Đang thử nghiệm"
              description="Thiết bị đã chuyển sang bệ thử, quá trình thử nghiệm đang tiến hành."
              style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }} />
          )}
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0891b2' }}
            title={<Space><SendOutlined style={{ color: '#0891b2' }} /><Text strong style={{ color: '#0891b2', fontSize: 13 }}>Thông tin yêu cầu thử nghiệm</Text></Space>}>
            <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Lệnh đại tu"><Text strong style={{ color: colors.navy }}>{order?.code || record.orderId}</Text></Descriptions.Item>
              <Descriptions.Item label="Phân xưởng"><Text>{record.workshopName || order?.workshopName}</Text></Descriptions.Item>
              <Descriptions.Item label="Ngày gửi yêu cầu">
                {record.testRequestDate ? <Text strong>{formatDate(record.testRequestDate)}</Text> : <Text type="secondary">Chưa gửi</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg?.color}>{statusCfg?.label}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" style={{ borderRadius: 10 }}
            title={<Text strong style={{ color: '#0891b2', fontSize: 13 }}>Cấu hình & thông số cần kiểm tra</Text>}>
            <div style={{ padding: '10px 14px', background: '#ecfeff', borderRadius: 8, border: '1px solid #a5f3fc' }}>
              <Text style={{ fontSize: 13 }}>{record.testScenario}</Text>
            </div>
            <div style={{ marginTop: 10 }}>
              {record.testRequirements?.split(';').map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', marginBottom: 4 }}>
                  <RocketOutlined style={{ color: '#0891b2', fontSize: 11 }} />
                  <Text style={{ fontSize: 12, color: '#555' }}>{req.trim()}</Text>
                </div>
              ))}
            </div>
          </Card>
          {currentStep > 2 && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Yêu cầu thử nghiệm đã gửi và được tiếp nhận"
              style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
          )}
        </div>
      ),
    },

    // ── Tab 3: Kết quả thử nghiệm ─────────────────────────────────────────────
    {
      key: '3',
      label: tabLabel(TABS[2]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {!record.testResult && !resultSubmitted && (
            <div style={{ padding: 24, textAlign: 'center', background: '#faf5ff', borderRadius: 10, border: '1px dashed #c4b5fd' }}>
              <FileTextOutlined style={{ fontSize: 40, color: '#7c3aed', marginBottom: 12 }} />
              <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 14, color: '#7c3aed' }}>Chưa có kết quả thử nghiệm</Text></div>
              <div style={{ marginBottom: 16 }}><Text type="secondary" style={{ fontSize: 13 }}>Thiết bị đang trong quá trình thử nghiệm. Khi hoàn thành, nhập kết quả để chuyển sang bước nghiệm thu.</Text></div>
              <Button type="primary" icon={<FileTextOutlined />}
                style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                onClick={() => setResultDrawerOpen(true)}>
                Nhập kết quả thử nghiệm
              </Button>
            </div>
          )}
          {resultSubmitted && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Đã lưu kết quả thử nghiệm"
              description="Kết quả đã được ghi nhận. Chuyển sang Tab Nghiệm thu để ký phê duyệt (nếu đạt) hoặc Tab Xử lý không đạt (nếu không đạt)."
              style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
          )}
          {record.testDate && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${passed ? '#16a34a' : '#ff4d4f'}` }}
              title={
                <Space>
                  {passed ? <CheckCircleOutlined style={{ color: '#16a34a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  <Text strong style={{ color: passed ? '#16a34a' : '#ff4d4f', fontSize: 13 }}>
                    Kết quả: {passed ? 'ĐẠT' : 'KHÔNG ĐẠT'} — {formatDate(record.testDate)}
                  </Text>
                </Space>
              }>
              <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                <Descriptions.Item label="Ngày thử nghiệm"><Text strong>{formatDate(record.testDate)}</Text></Descriptions.Item>
                <Descriptions.Item label="Kết quả">
                  <Tag color={passed ? 'success' : 'error'}>{passed ? 'Đạt' : 'Không đạt'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Môi trường" span={2}><Text style={{ fontSize: 12 }}>{record.testEnvironment}</Text></Descriptions.Item>
              </Descriptions>
            </Card>
          )}
          {record.performanceMetrics && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${passed ? '#16a34a' : '#ff4d4f'}` }}
              title={<Text strong style={{ color: passed ? '#16a34a' : '#ff4d4f', fontSize: 13 }}>Chỉ tiêu kỹ thuật đo được</Text>}>
              {renderMetricRows(record.performanceMetrics)}
            </Card>
          )}
          {record.retestDate && (
            <Alert type="info" showIcon
              message={`Thử nghiệm lại: ${formatDate(record.retestDate)}`}
              description="Sau khi xử lý khắc phục, thiết bị sẽ được thử nghiệm lại để xác nhận đạt yêu cầu."
              style={{ borderRadius: 8 }} />
          )}
        </div>
      ),
    },

    // ── Tab 4: Nghiệm thu ─────────────────────────────────────────────────────
    {
      key: '4',
      label: tabLabel(TABS[3]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {!record.acceptedBy ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <ClockCircleOutlined style={{ fontSize: 36, color: '#ccc', marginBottom: 10 }} />
              <div><Text type="secondary">{record.testResult === 'pass' ? 'Đang chờ phê duyệt nghiệm thu' : 'Chưa đủ điều kiện nghiệm thu'}</Text></div>
            </div>
          ) : (
            <>
              <Alert type="success" showIcon icon={<TrophyOutlined />}
                message="Thiết bị đã được nghiệm thu chính thức"
                description="Kết quả thử nghiệm đạt yêu cầu, phê duyệt nghiệm thu đại tu đã được ký."
                style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #16a34a' }}
                title={<Space><TrophyOutlined style={{ color: '#16a34a' }} /><Text strong style={{ color: '#16a34a', fontSize: 13 }}>Biên bản nghiệm thu</Text></Space>}>
                <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Người nghiệm thu" span={2}><Text strong>{record.acceptedBy}</Text></Descriptions.Item>
                  <Descriptions.Item label="Ngày nghiệm thu"><Text strong style={{ color: '#16a34a' }}>{formatDate(record.acceptedDate!)}</Text></Descriptions.Item>
                  <Descriptions.Item label="Trạng thái"><Tag color="success">Đã nghiệm thu</Tag></Descriptions.Item>
                </Descriptions>
              </Card>
            </>
          )}
        </div>
      ),
    },

    // ── Tab 5: Xử lý không đạt ────────────────────────────────────────────────
    {
      key: '5',
      label: tabLabel(TABS[4]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {!record.failureReason ? (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Không có vấn đề cần xử lý"
              description="Thiết bị đạt toàn bộ chỉ tiêu thử nghiệm ngay lần đầu, không cần xử lý khắc phục."
              style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
          ) : (
            <>
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #dc2626' }}
                title={<Space><CloseCircleOutlined style={{ color: '#dc2626' }} /><Text strong style={{ color: '#dc2626', fontSize: 13 }}>Nguyên nhân không đạt</Text></Space>}>
                <div style={{ padding: '10px 14px', background: '#fff2f0', borderRadius: 8, border: '1px solid #ffa39e' }}>
                  <Text style={{ fontSize: 13 }}>{record.failureReason}</Text>
                </div>
              </Card>
              {record.correctiveAction && (
                <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #d97706' }}
                  title={<Space><WarningOutlined style={{ color: '#d97706' }} /><Text strong style={{ color: '#d97706', fontSize: 13 }}>Hành động khắc phục</Text></Space>}>
                  <div style={{ padding: '10px 14px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                    <Text style={{ fontSize: 13 }}>{record.correctiveAction}</Text>
                  </div>
                  {record.retestDate && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RocketOutlined style={{ color: '#0891b2' }} />
                      <Text style={{ fontSize: 13 }}>Ngày thử nghiệm lại: <Text strong style={{ color: '#0891b2' }}>{formatDate(record.retestDate)}</Text></Text>
                    </div>
                  )}
                </Card>
              )}
              {record.retestResult && (
                <Alert
                  type={record.retestResult === 'pass' ? 'success' : 'error'}
                  showIcon
                  message={`Kết quả thử lại: ${record.retestResult === 'pass' ? 'ĐẠT' : 'CHƯA ĐẠT'}`}
                  style={{ borderRadius: 8 }}
                />
              )}
            </>
          )}
        </div>
      ),
    },

    // ── Tab 6: Bàn giao & đóng hồ sơ ─────────────────────────────────────────
    {
      key: '6',
      label: tabLabel(TABS[5]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {!record.deliveredTo ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <ClockCircleOutlined style={{ fontSize: 36, color: '#ccc', marginBottom: 10 }} />
              <div><Text type="secondary">{record.acceptedBy ? 'Đang chuẩn bị thủ tục bàn giao' : 'Chưa sẵn sàng bàn giao'}</Text></div>
            </div>
          ) : (
            <>
              <Alert type="success" showIcon icon={<CheckCircleOutlined />}
                message="Hoàn tất bàn giao và đóng hồ sơ đại tu"
                style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }} />
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #d97706' }}
                title={<Space><TeamOutlined style={{ color: '#d97706' }} /><Text strong style={{ color: '#d97706', fontSize: 13 }}>Thông tin bàn giao</Text></Space>}>
                <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Bàn giao cho" span={2}><Text strong style={{ color: colors.navy, fontSize: 14 }}>{record.deliveredTo}</Text></Descriptions.Item>
                  <Descriptions.Item label="Ngày bàn giao"><Text strong style={{ color: '#d97706' }}>{formatDate(record.deliveredDate!)}</Text></Descriptions.Item>
                  <Descriptions.Item label="Trạng thái"><Tag color="purple">Đã bàn giao</Tag></Descriptions.Item>
                </Descriptions>
              </Card>
              {record.closedBy && (
                <Card size="small" style={{ borderRadius: 10 }}
                  title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Đóng hồ sơ đại tu</Text>}>
                  <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                    <Descriptions.Item label="Người đóng hồ sơ"><Text strong>{record.closedBy}</Text></Descriptions.Item>
                    <Descriptions.Item label="Ngày đóng"><Text strong style={{ color: '#16a34a' }}>{formatDate(record.closedDate!)}</Text></Descriptions.Item>
                    <Descriptions.Item label="Lệnh đại tu" span={2}><Text strong>{order?.code} — Đã đóng</Text></Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </>
          )}
          {record.notes && (
            <div style={{ padding: '10px 14px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Ghi chú</Text>
              <Text style={{ fontSize: 13 }}>{record.notes}</Text>
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
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/test-acceptances')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyCertificateOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Space size={8}>
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{record.id}</Title>
                    <Tag style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 600 }}>{statusCfg?.label}</Tag>
                    {record.testResult && (
                      <Tag style={{ background: record.testResult === 'pass' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)', border: 'none', color: '#fff', fontWeight: 600 }}>
                        {record.testResult === 'pass' ? 'Đạt' : 'Không đạt'}
                      </Tag>
                    )}
                  </Space>
                  <div><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{record.equipmentName} · {order?.code}</Text></div>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                {record.status === 'testing' && !record.testResult && !resultSubmitted && (
                  <Button icon={<FileTextOutlined />}
                    onClick={() => { setResultDrawerOpen(true); setActiveTab('3'); }}
                    style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#fff', fontWeight: 600 }}>
                    Nhập kết quả thử nghiệm
                  </Button>
                )}
                {!['accepted', 'delivered'].includes(record.status) && (
                  <Button icon={<EditOutlined />} onClick={() => setDrawerOpen(true)}
                    style={{ background: '#0891b2', borderColor: '#0891b2', color: '#fff', fontWeight: 600 }}>
                    Cập nhật tiến độ
                  </Button>
                )}
                {record.status === 'passed' && (
                  <Button icon={<TrophyOutlined />}
                    style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 600 }}>
                    Ký nghiệm thu
                  </Button>
                )}
                {record.status === 'accepted' && (
                  <Button icon={<TeamOutlined />}
                    style={{ background: '#d97706', borderColor: '#d97706', color: '#fff', fontWeight: 600 }}>
                    Bàn giao
                  </Button>
                )}
                {record.status === 'delivered' && (
                  <Tag style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, padding: '4px 12px', borderRadius: 6 }}>
                    <CheckCircleOutlined style={{ marginRight: 4 }} />Hoàn tất
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
            style={{ marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8 }} />

          <Form.Item label="Chuyển trạng thái" name="status">
            <Select options={[
              { value: 'pending_test', label: 'Bước 1 — Chờ thử nghiệm' },
              { value: 'testing',      label: 'Bước 2–3 — Đang thử nghiệm' },
              { value: 'passed',       label: 'Bước 3 — Đạt thử nghiệm' },
              { value: 'failed',       label: 'Bước 3 — Không đạt' },
              { value: 'retesting',    label: 'Bước 5 — Đang thử lại' },
              { value: 'accepted',     label: 'Bước 4 — Đã nghiệm thu' },
              { value: 'delivered',    label: 'Bước 6 — Đã bàn giao' },
            ]} style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Ngày thử nghiệm" name="testDate">
            <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Kết quả thử nghiệm" name="testResult">
            <Select options={[{ value: 'pass', label: 'Đạt' }, { value: 'fail', label: 'Không đạt' }]} style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Chỉ tiêu kỹ thuật đo được" name="performanceMetrics">
            <TextArea rows={4} placeholder="Tầm phát hiện: 285km (TT: ≥250km) ✓; Công suất: 98kW ✓; ..." style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Divider style={{ margin: '8px 0' }} />

          <Form.Item label="Nguyên nhân không đạt (nếu có)" name="failureReason">
            <TextArea rows={2} placeholder="Mô tả vấn đề phát hiện..." style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Form.Item label="Người nghiệm thu" name="acceptedBy">
            <Input placeholder="Đại tá / Kỹ sư phê duyệt nghiệm thu" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Bàn giao cho" name="deliveredTo">
            <Input placeholder="Đơn vị / Trung đoàn tiếp nhận" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={2} placeholder="Ghi chú bổ sung..." style={{ borderRadius: 6, fontSize: 12 }} />
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

      {/* Result Entry Drawer */}
      <Drawer
        title={<Space><FileTextOutlined style={{ color: '#7c3aed' }} /><Text strong style={{ color: '#7c3aed' }}>Nhập kết quả thử nghiệm — {record.id}</Text></Space>}
        open={resultDrawerOpen} onClose={() => setResultDrawerOpen(false)} width={520} destroyOnClose>
        <Form form={resultForm} layout="vertical">
          <Alert type="info" showIcon
            message={`Thiết bị: ${record.equipmentName}`}
            description="Điền đầy đủ kết quả đo được so với tiêu chuẩn kỹ thuật đã xác định."
            style={{ marginBottom: 16, background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8 }} />

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Ngày thử nghiệm" name="testDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kết quả tổng thể" name="testResult" rules={[{ required: true, message: 'Chọn kết quả' }]}>
                <Select placeholder="Chọn kết quả..." style={{ borderRadius: 6 }}
                  options={[
                    { value: 'pass', label: 'Đạt — toàn bộ chỉ tiêu' },
                    { value: 'fail', label: 'Không đạt — có chỉ tiêu vi phạm' },
                  ]} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Chỉ tiêu kỹ thuật đo được"
            name="performanceMetrics"
            extra={<Text type="secondary" style={{ fontSize: 11 }}>Phân cách bằng dấu ; · Thêm ✓ nếu đạt, ✗ nếu không đạt</Text>}>
            <TextArea rows={6}
              placeholder={record.testRequirements
                ? record.testRequirements.split(';').map(r => `${r.trim()} ✓`).join(';\n')
                : 'VD: Tầm phát hiện: 285km (TT: ≥250km) ✓; Công suất: 98kW (TT: ≥95kW) ✓'}
              style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={2} placeholder="Ghi chú về điều kiện thử, sự cố trong quá trình thử (nếu có)..." style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between">
            <Button onClick={() => setResultDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" icon={<CheckCircleOutlined />}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
              onClick={() => {
                resultForm.validateFields().then(() => {
                  setResultDrawerOpen(false);
                  setResultSubmitted(true);
                  setActiveTab('3');
                });
              }}>
              Lưu kết quả thử nghiệm
            </Button>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default TestAcceptanceDetail;
