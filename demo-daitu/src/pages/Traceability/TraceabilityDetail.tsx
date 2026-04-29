import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions,
  Alert, Tabs, Drawer, Form, Input, DatePicker, Select, Table,
} from 'antd';
import {
  ArrowLeftOutlined, ClusterOutlined, CheckCircleOutlined,
  SyncOutlined, CloseCircleOutlined, FileTextOutlined,
  ToolOutlined, ApartmentOutlined, SettingOutlined,
  SafetyCertificateOutlined, LinkOutlined, DatabaseOutlined,
  TrophyOutlined, WarningOutlined,
} from '@ant-design/icons';
import { traceabilityRecords } from '../../data/traceability';
import { testAcceptances } from '../../data/testAcceptances';
import { traceabilityStatusConfig, testAcceptanceStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ConfigChangeItem, TechnicalChangeItem, ComponentTraceItem } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_STEP: Record<string, number> = {
  collecting: 1,
  updating: 2,
  configuring: 3,
  recording: 4,
  tracing: 5,
  syncing: 6,
  completed: 6,
};

const TABS = [
  { key: '1', label: 'Tổng hợp dữ liệu',    icon: <DatabaseOutlined />,    color: '#1B3A5C' },
  { key: '2', label: 'Lịch sử đại tu',       icon: <FileTextOutlined />,    color: '#0891b2' },
  { key: '3', label: 'Cấu hình thiết bị',    icon: <SettingOutlined />,     color: '#7c3aed' },
  { key: '4', label: 'Thay đổi kỹ thuật',    icon: <ToolOutlined />,        color: '#d97706' },
  { key: '5', label: 'Truy vết cấu phần',    icon: <ApartmentOutlined />,   color: '#0891b2' },
  { key: '6', label: 'Đồng bộ hệ thống',     icon: <LinkOutlined />,        color: '#16a34a' },
  { key: '7', label: 'Lịch sử nghiệm thu',   icon: <SafetyCertificateOutlined />, color: '#7c3aed' },
];

const techTypeConfig: Record<string, { label: string; color: string }> = {
  standard: { label: 'Tiêu chuẩn',    color: 'blue' },
  design:   { label: 'Thiết kế',      color: 'purple' },
  material: { label: 'Vật liệu',      color: 'orange' },
  document: { label: 'Tài liệu',      color: 'default' },
};

const actionConfig: Record<string, { label: string; color: string }> = {
  replace:     { label: 'Thay thế', color: 'red' },
  restore:     { label: 'Phục hồi', color: 'orange' },
  upgrade:     { label: 'Nâng cấp', color: 'purple' },
  serviceable: { label: 'Sử dụng tiếp', color: 'green' },
};

const STEP_BUTTONS: Record<string, { label: string; type: 'primary' | 'default'; style: React.CSSProperties }> = {
  collecting:  { label: 'Cập nhật lịch sử đại tu',  type: 'primary', style: { background: '#1B3A5C', borderColor: '#1B3A5C' } },
  updating:    { label: 'Cập nhật cấu hình',         type: 'primary', style: { background: '#7c3aed', borderColor: '#7c3aed' } },
  configuring: { label: 'Ghi nhận thay đổi KT',      type: 'primary', style: { background: '#d97706', borderColor: '#d97706' } },
  recording:   { label: 'Thiết lập truy vết',        type: 'primary', style: { background: '#0891b2', borderColor: '#0891b2' } },
  tracing:     { label: 'Đồng bộ hệ thống',          type: 'primary', style: { background: '#D4A843', borderColor: '#D4A843', color: '#0a1628' } },
  syncing:     { label: 'Hoàn tất đồng bộ',          type: 'primary', style: { background: '#16a34a', borderColor: '#16a34a' } },
};

const STEP_DRAWER_TITLES: Record<string, string> = {
  collecting:  'Cập nhật lịch sử đại tu',
  updating:    'Cập nhật cấu hình thiết bị',
  configuring: 'Ghi nhận thay đổi kỹ thuật',
  recording:   'Thiết lập truy vết cấu phần',
  tracing:     'Đồng bộ hệ thống',
  syncing:     'Hoàn tất đồng bộ hồ sơ',
};

const TraceabilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

  const record = traceabilityRecords.find(r => r.id === id);

  if (!record) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Text type="secondary">Không tìm thấy hồ sơ truy vết.</Text>
      </div>
    );
  }

  const statusCfg = traceabilityStatusConfig[record.status];
  const currentStep = STATUS_STEP[record.status] ?? 1;
  const isCompleted = record.status === 'completed';

  // Duration calculation
  const getDuration = () => {
    if (record.overhaulStartDate && record.overhaulEndDate) {
      const start = dayjs(record.overhaulStartDate);
      const end = dayjs(record.overhaulEndDate);
      return end.diff(start, 'day');
    }
    return null;
  };

  const duration = getDuration();

  // Format cost
  const formatCost = (cost: number) => {
    const billions = cost / 1_000_000_000;
    if (billions >= 1) return `${billions.toFixed(1)} tỷ đồng`;
    return `${(cost / 1_000_000).toFixed(0)} triệu đồng`;
  };

  // Tab label renderer
  const tabLabel = (tab: typeof TABS[0]) => {
    const stepNum = Number(tab.key);
    const done = isCompleted || (stepNum < currentStep);
    const active = currentStep === stepNum && !isCompleted;
    return (
      <Space size={6}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: done ? '#16a34a' : active ? tab.color : `${tab.color}33`,
          border: `1.5px solid ${done ? '#16a34a' : tab.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10,
          color: (done || active) ? '#fff' : tab.color,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {done ? '✓' : tab.key}
        </div>
        <span style={{ color: done ? '#16a34a' : active ? tab.color : '#aaa' }}>
          {tab.label}
        </span>
      </Space>
    );
  };

  // Config table columns
  const configColumns = [
    {
      title: 'Thông số',
      dataIndex: 'parameter',
      key: 'parameter',
      width: 220,
      render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Giá trị cũ',
      dataIndex: 'before',
      key: 'before',
      width: 160,
      render: (v: string) => <Text style={{ color: '#888', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Giá trị mới',
      dataIndex: 'after',
      key: 'after',
      width: 160,
      render: (v: string, row: ConfigChangeItem) => (
        <Text strong style={{ color: row.before !== row.after ? '#1B3A5C' : '#888', fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: 'Lý do thay đổi',
      dataIndex: 'reason',
      key: 'reason',
      render: (v: string) => <Text style={{ fontSize: 12, color: '#666' }}>{v || '—'}</Text>,
    },
  ];

  // Component trace table columns
  const traceColumns = [
    {
      title: 'Mã cấu phần',
      dataIndex: 'componentId',
      key: 'componentId',
      width: 120,
      render: (v: string) => <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: 'Tên cấu phần',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 220,
      render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (v: string) => {
        const cfg = actionConfig[v] || { label: v, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Số sê-ri',
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 140,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v || '—'}</Text>,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 200,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v || '—'}</Text>,
    },
    {
      title: 'Ngày lắp',
      dataIndex: 'installDate',
      key: 'installDate',
      width: 120,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? formatDate(v) : '—'}</Text>,
    },
    {
      title: 'Tuổi thọ còn lại',
      dataIndex: 'lifeRemaining',
      key: 'lifeRemaining',
      width: 130,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v || '—'}</Text>,
    },
  ];

  const stepAlertMessages: Record<string, { message: string; description: string }> = {
    collecting:  { message: 'Bước 1: Đang tổng hợp dữ liệu đại tu', description: 'Thu thập và xác nhận toàn bộ thông tin từ quá trình đại tu trước khi chuyển bước.' },
    updating:    { message: 'Bước 2: Đang cập nhật lịch sử đại tu', description: 'Ghi nhận đầy đủ hạng mục đã thực hiện, nhân sự và chi phí vào hồ sơ.' },
    configuring: { message: 'Bước 3: Đang cập nhật cấu hình thiết bị', description: 'Cập nhật tham số cấu hình mới của thiết bị sau khi hoàn thành đại tu.' },
    recording:   { message: 'Bước 4: Đang ghi nhận thay đổi kỹ thuật', description: 'Ghi lại các thay đổi về tiêu chuẩn, thiết kế và vật liệu đã áp dụng.' },
    tracing:     { message: 'Bước 5: Đang thiết lập truy vết cấu phần', description: 'Nhập đầy đủ thông tin các cấu phần đã thay thế, phục hồi và nâng cấp.' },
    syncing:     { message: 'Bước 6: Đang đồng bộ hệ thống', description: 'Cập nhật thông tin sang các hệ thống liên kết: Tài chính, Vòng đời, Bảo trì, Sửa chữa.' },
  };

  const tabItems = [
    // ── Tab 1: Tổng hợp dữ liệu ─────────────────────────────────────────────────
    {
      key: '1',
      label: tabLabel(TABS[0]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.status === 'collecting' && stepAlertMessages.collecting && (
            <Alert
              type="info" showIcon
              message={stepAlertMessages.collecting.message}
              description={stepAlertMessages.collecting.description}
              style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}
            />
          )}

          {/* Thông tin tổng quát */}
          <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${colors.navy}` }}
            title={
              <Space>
                <DatabaseOutlined style={{ color: colors.navy }} />
                <Text strong style={{ color: colors.navy, fontSize: 13 }}>Thông tin tổng quát</Text>
              </Space>
            }
          >
            <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Thiết bị" span={2}>
                <Text strong style={{ color: colors.navy }}>{record.equipmentName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lệnh đại tu">
                <Text strong style={{ color: colors.navy }}>{record.orderId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phân xưởng">
                <Text>{record.workshopName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian đại tu">
                <Text>
                  {record.overhaulStartDate ? formatDate(record.overhaulStartDate) : '—'}
                  {' → '}
                  {record.overhaulEndDate ? formatDate(record.overhaulEndDate) : (record.overhaulDate ? formatDate(record.overhaulDate) : '—')}
                  {duration !== null && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>{duration} ngày</Tag>
                  )}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phạm vi đại tu" span={2}>
                <div style={{ background: '#eff6ff', borderRadius: 6, padding: '6px 10px', border: '1px solid #bfdbfe' }}>
                  <Text style={{ fontSize: 13 }}>{record.overhaulScope}</Text>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Summary stats */}
          <Row gutter={12}>
            {[
              {
                label: 'Tổng cấu phần',
                value: record.totalComponents ?? '—',
                color: colors.navy,
                bg: '#eff6ff',
                border: '#bfdbfe',
              },
              {
                label: 'Thay thế',
                value: record.replacedCount ?? '—',
                color: '#dc2626',
                bg: '#fff2f0',
                border: '#ffa39e',
              },
              {
                label: 'Phục hồi',
                value: record.restoredCount ?? '—',
                color: '#d97706',
                bg: '#fffbe6',
                border: '#ffe58f',
              },
              {
                label: 'Kết quả thử nghiệm',
                value: record.testResult === 'pass'
                  ? <Tag color="success">Đạt</Tag>
                  : record.testResult === 'fail'
                    ? <Tag color="error">Không đạt</Tag>
                    : <Tag color="default">Chưa có</Tag>,
                color: '#16a34a',
                bg: '#f6ffed',
                border: '#b7eb8f',
              },
            ].map((item, i) => (
              <Col span={6} key={i}>
                <div style={{
                  background: item.bg, border: `1px solid ${item.border}`,
                  borderRadius: 10, padding: '14px 16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 4 }}>
                    {item.value}
                  </div>
                  <Text style={{ fontSize: 12, color: '#888' }}>{item.label}</Text>
                </div>
              </Col>
            ))}
          </Row>

          {/* Link hồ sơ thử nghiệm */}
          {record.testAcceptanceId && (
            <Card size="small" style={{ borderRadius: 10, background: '#f8fafc', border: '1px solid #e8e8e8' }}>
              <Space>
                <SafetyCertificateOutlined style={{ color: colors.navy }} />
                <Text style={{ fontSize: 13 }}>Hồ sơ thử nghiệm & nghiệm thu:</Text>
                <Button
                  type="link"
                  size="small"
                  style={{ color: colors.navy, fontWeight: 600, padding: 0 }}
                  onClick={() => navigate(`/test-acceptance/${record.testAcceptanceId}`)}
                >
                  Xem hồ sơ {record.testAcceptanceId}
                </Button>
              </Space>
            </Card>
          )}
        </div>
      ),
    },

    // ── Tab 2: Lịch sử đại tu ────────────────────────────────────────────────────
    {
      key: '2',
      label: tabLabel(TABS[1]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.status === 'updating' && stepAlertMessages.updating && (
            <Alert
              type="info" showIcon
              message={stepAlertMessages.updating.message}
              description={stepAlertMessages.updating.description}
              style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}
            />
          )}

          {/* Nhân sự */}
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0891b2' }}
            title={
              <Space>
                <FileTextOutlined style={{ color: '#0891b2' }} />
                <Text strong style={{ color: '#0891b2', fontSize: 13 }}>Nhân sự & Chi phí thực hiện</Text>
              </Space>
            }
          >
            <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Người phụ trách" span={2}>
                <Text strong>{record.responsiblePerson || '—'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người giám sát" span={2}>
                <Text>{record.supervisorName || '—'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian thực hiện">
                <Text>
                  {record.overhaulStartDate ? formatDate(record.overhaulStartDate) : '—'}
                  {' → '}
                  {record.overhaulEndDate ? formatDate(record.overhaulEndDate) : '—'}
                </Text>
              </Descriptions.Item>
              {duration !== null && (
                <Descriptions.Item label="Tổng thời gian">
                  <Tag color="blue">{duration} ngày</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Chi phí đại tu" span={2}>
                {record.overhaulCost ? (
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>
                    {formatCost(record.overhaulCost)}
                  </Text>
                ) : <Text type="secondary">Chưa cập nhật</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Hạng mục đã hoàn thành */}
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0891b2' }}
            title={
              <Text strong style={{ color: '#0891b2', fontSize: 13 }}>
                Hạng mục đã hoàn thành ({record.completedItems.length})
              </Text>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {record.completedItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    background: '#f6ffed', border: '1px solid #b7eb8f',
                  }}
                >
                  <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 14, marginTop: 2, flexShrink: 0 }} />
                  <Text style={{ fontSize: 13, flex: 1 }}>{item}</Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },

    // ── Tab 3: Cấu hình thiết bị ─────────────────────────────────────────────────
    {
      key: '3',
      label: tabLabel(TABS[2]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.status === 'configuring' && stepAlertMessages.configuring && (
            <Alert
              type="warning" showIcon
              message={stepAlertMessages.configuring.message}
              description={stepAlertMessages.configuring.description}
              style={{ borderRadius: 8 }}
            />
          )}

          {(!record.configItems || record.configItems.length === 0) ? (
            <Card size="small" style={{ borderRadius: 10 }}>
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa' }}>
                <SettingOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                <Text type="secondary">Chưa có dữ liệu cấu hình. Dữ liệu sẽ được cập nhật ở bước này.</Text>
              </div>
            </Card>
          ) : (
            <>
              {/* Phiên bản cấu hình */}
              {record.configVersion && (
                <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #7c3aed' }}>
                  <Space size={16}>
                    <SettingOutlined style={{ color: '#7c3aed', fontSize: 18 }} />
                    <div>
                      <Text style={{ fontSize: 12, color: '#888' }}>Phiên bản cấu hình hiện tại</Text>
                      <div>
                        <Text strong style={{ fontSize: 18, color: '#7c3aed' }}>{record.configVersion}</Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              )}

              {/* Bảng cấu hình */}
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #7c3aed' }}
                title={
                  <Text strong style={{ color: '#7c3aed', fontSize: 13 }}>
                    Bảng thông số cấu hình ({record.configItems.length} mục)
                  </Text>
                }
              >
                <Table
                  dataSource={record.configItems}
                  columns={configColumns}
                  rowKey="parameter"
                  size="small"
                  pagination={false}
                  scroll={{ x: 700 }}
                  rowClassName={(row: ConfigChangeItem) =>
                    row.before !== row.after ? 'config-changed-row' : ''
                  }
                  onRow={(row: ConfigChangeItem) => ({
                    style: row.before !== row.after
                      ? { background: '#eff6ff' }
                      : {},
                  })}
                />
              </Card>
            </>
          )}
        </div>
      ),
    },

    // ── Tab 4: Thay đổi kỹ thuật ─────────────────────────────────────────────────
    {
      key: '4',
      label: tabLabel(TABS[3]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.status === 'recording' && stepAlertMessages.recording && (
            <Alert
              type="warning" showIcon
              message={stepAlertMessages.recording.message}
              description={stepAlertMessages.recording.description}
              style={{ borderRadius: 8 }}
            />
          )}

          {(!record.technicalChangeItems || record.technicalChangeItems.length === 0) ? (
            <Card size="small" style={{ borderRadius: 10 }}>
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa' }}>
                <ToolOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                <Text type="secondary">Chưa có thay đổi kỹ thuật được ghi nhận. Dữ liệu sẽ được cập nhật ở bước này.</Text>
              </div>
            </Card>
          ) : (
            <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #d97706' }}
              title={
                <Text strong style={{ color: '#d97706', fontSize: 13 }}>
                  Danh sách thay đổi kỹ thuật ({record.technicalChangeItems.length} mục)
                </Text>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {record.technicalChangeItems.map((item: TechnicalChangeItem, i: number) => {
                  const typeCfg = techTypeConfig[item.type] || { label: item.type, color: 'default' };
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '12px 14px', borderRadius: 8,
                        background: '#fffbe6', border: '1px solid #ffe58f',
                      }}
                    >
                      <Tag color={typeCfg.color} style={{ flexShrink: 0, marginTop: 1 }}>
                        {typeCfg.label}
                      </Tag>
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, display: 'block' }}>{item.description}</Text>
                        <Space size={8} style={{ marginTop: 4 }}>
                          {item.reference && (
                            <Tag color="default" style={{ fontSize: 11 }}>
                              Ref: {item.reference}
                            </Tag>
                          )}
                          {item.appliedDate && (
                            <Text style={{ fontSize: 11, color: '#888' }}>
                              Áp dụng: {formatDate(item.appliedDate)}
                            </Text>
                          )}
                        </Space>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      ),
    },

    // ── Tab 5: Truy vết cấu phần ─────────────────────────────────────────────────
    {
      key: '5',
      label: tabLabel(TABS[4]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.status === 'tracing' && stepAlertMessages.tracing && (
            <Alert
              type="info" showIcon
              message={stepAlertMessages.tracing.message}
              description={stepAlertMessages.tracing.description}
              style={{ borderRadius: 8, background: '#ecfeff', border: '1px solid #a5f3fc' }}
            />
          )}

          {(!record.componentTraceItems || record.componentTraceItems.length === 0) ? (
            <Card size="small" style={{ borderRadius: 10 }}>
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa' }}>
                <ApartmentOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                <Text type="secondary">Chưa có dữ liệu truy vết cấu phần. Dữ liệu sẽ được nhập ở bước này.</Text>
              </div>
            </Card>
          ) : (
            <>
              <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0891b2' }}
                title={
                  <Text strong style={{ color: '#0891b2', fontSize: 13 }}>
                    Danh sách cấu phần ({record.componentTraceItems.length} mục)
                  </Text>
                }
              >
                <Table
                  dataSource={record.componentTraceItems}
                  columns={traceColumns}
                  rowKey="componentId"
                  size="small"
                  pagination={false}
                  scroll={{ x: 1100 }}
                />
              </Card>

              {/* Summary */}
              {(() => {
                const items = record.componentTraceItems!;
                const replaceCount = items.filter((c: ComponentTraceItem) => c.action === 'replace').length;
                const restoreCount = items.filter((c: ComponentTraceItem) => c.action === 'restore').length;
                const upgradeCount = items.filter((c: ComponentTraceItem) => c.action === 'upgrade').length;
                const serviceCount = items.filter((c: ComponentTraceItem) => c.action === 'serviceable').length;
                return (
                  <Row gutter={12}>
                    {[
                      { label: 'Thay thế', count: replaceCount, color: '#dc2626', bg: '#fff2f0', border: '#ffa39e' },
                      { label: 'Phục hồi', count: restoreCount, color: '#d97706', bg: '#fffbe6', border: '#ffe58f' },
                      { label: 'Nâng cấp', count: upgradeCount, color: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
                      { label: 'Sử dụng tiếp', count: serviceCount, color: '#16a34a', bg: '#f6ffed', border: '#b7eb8f' },
                    ].map((s, i) => (
                      <Col span={6} key={i}>
                        <div style={{
                          background: s.bg, border: `1px solid ${s.border}`,
                          borderRadius: 10, padding: '12px 16px', textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.count}</div>
                          <Text style={{ fontSize: 12, color: '#888' }}>{s.label}</Text>
                        </div>
                      </Col>
                    ))}
                  </Row>
                );
              })()}
            </>
          )}
        </div>
      ),
    },

    // ── Tab 6: Đồng bộ hệ thống ──────────────────────────────────────────────────
    {
      key: '6',
      label: tabLabel(TABS[5]),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          {record.status === 'syncing' && stepAlertMessages.syncing && (
            <Alert
              type="info" showIcon icon={<SyncOutlined spin />}
              message={stepAlertMessages.syncing.message}
              description={stepAlertMessages.syncing.description}
              style={{ borderRadius: 8, background: '#fffbe6', border: '1px solid #ffe58f' }}
            />
          )}

          {isCompleted && (
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              message="Hồ sơ truy vết hoàn thành"
              description={record.syncedAt
                ? `Đã đồng bộ toàn bộ hệ thống vào lúc ${formatDate(record.syncedAt)}. Lệnh đại tu đã đóng.`
                : 'Tất cả hệ thống đã được đồng bộ thành công.'}
              style={{ borderRadius: 8 }}
            />
          )}

          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #16a34a' }}
            title={
              <Space>
                <LinkOutlined style={{ color: '#16a34a' }} />
                <Text strong style={{ color: '#16a34a', fontSize: 13 }}>
                  Trạng thái đồng bộ hệ thống ({record.linkedSystems.length} hệ thống)
                </Text>
              </Space>
            }
          >
            <Row gutter={[12, 12]}>
              {record.linkedSystems.map((sys, i) => {
                const isSynced = sys.status === 'synced';
                const isFailed = sys.status === 'failed';
                const isPending = sys.status === 'pending';

                const bgColor = isSynced ? '#f6ffed' : isFailed ? '#fff2f0' : '#fffbe6';
                const borderColor = isSynced ? '#b7eb8f' : isFailed ? '#ffa39e' : '#ffe58f';
                const textColor = isSynced ? '#16a34a' : isFailed ? '#ff4d4f' : '#d97706';
                const statusLabel = isSynced ? 'Đã đồng bộ' : isFailed ? 'Lỗi đồng bộ' : 'Chờ đồng bộ';

                return (
                  <Col xs={24} sm={12} key={i}>
                    <div style={{
                      background: bgColor, border: `1px solid ${borderColor}`,
                      borderRadius: 10, padding: '14px 16px',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}>
                      <div style={{ marginTop: 2 }}>
                        {isSynced && <CheckCircleOutlined style={{ fontSize: 18, color: '#16a34a' }} />}
                        {isFailed && <CloseCircleOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />}
                        {isPending && <SyncOutlined style={{ fontSize: 18, color: '#d97706' }} spin={record.status === 'syncing'} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 13, display: 'block', color: '#1a1a2e' }}>
                          {sys.system}
                        </Text>
                        <Text style={{ fontSize: 12, color: textColor, fontWeight: 600 }}>
                          {statusLabel}
                        </Text>
                        {sys.syncDate && (
                          <Text style={{ fontSize: 11, color: '#888', display: 'block', marginTop: 2 }}>
                            {formatDate(sys.syncDate)}
                          </Text>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>

            {record.syncedAt && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#16a34a' }} />
                  <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                    Hoàn tất đồng bộ lúc: {formatDate(record.syncedAt)}
                  </Text>
                </Space>
              </div>
            )}
          </Card>

          {record.notes && (
            <Card size="small" style={{ borderRadius: 10 }}
              title={<Text strong style={{ color: '#888', fontSize: 13 }}>Ghi chú</Text>}
            >
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                <Text style={{ fontSize: 13 }}>{record.notes}</Text>
              </div>
            </Card>
          )}
        </div>
      ),
    },

    // ── Tab 7: Lịch sử nghiệm thu ───────────────────────────────────────────────
    {
      key: '7',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#7c3aed33', border: '1.5px solid #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#7c3aed', fontWeight: 700 }}>7</div>
          <span>Lịch sử nghiệm thu</span>
        </Space>
      ),
      children: (() => {
        const taRecords = testAcceptances.filter(t => t.orderId === record.orderId);
        if (taRecords.length === 0) {
          return (
            <div style={{ padding: 40, textAlign: 'center', background: '#faf5ff', borderRadius: 10, border: '1px dashed #c4b5fd' }}>
              <SafetyCertificateOutlined style={{ fontSize: 40, color: '#c4b5fd', marginBottom: 12 }} />
              <div><Text type="secondary">Chưa có hồ sơ thử nghiệm & nghiệm thu cho lệnh đại tu này.</Text></div>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
            {taRecords.map(ta => {
              const taStatus = testAcceptanceStatusConfig[ta.status];
              const isPass = ta.testResult === 'pass';
              const isFail = ta.testResult === 'fail';
              return (
                <Card key={ta.id} size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${isPass ? '#16a34a' : isFail ? '#ff4d4f' : '#1B3A5C'}` }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Space size={8}>
                      <SafetyCertificateOutlined style={{ color: '#7c3aed', fontSize: 16 }} />
                      <Text strong style={{ color: '#7c3aed', fontSize: 14 }}>{ta.id}</Text>
                      <Tag color={taStatus?.color}>{taStatus?.label}</Tag>
                      {ta.testResult && (
                        <Tag color={isPass ? 'success' : 'error'}>{isPass ? 'Đạt' : 'Không đạt'}</Tag>
                      )}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>{ta.equipmentName}</Text>
                  </div>

                  {/* Thông tin cơ bản */}
                  <Row gutter={[12, 8]} style={{ marginBottom: 12 }}>
                    <Col span={8}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày gửi yêu cầu</Text>
                      <Text strong style={{ fontSize: 13 }}>{ta.testRequestDate ? formatDate(ta.testRequestDate) : '—'}</Text>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày thử nghiệm</Text>
                      <Text strong style={{ fontSize: 13 }}>{ta.testDate ? formatDate(ta.testDate) : '—'}</Text>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày nghiệm thu</Text>
                      <Text strong style={{ fontSize: 13, color: ta.acceptedDate ? '#16a34a' : '#888' }}>{ta.acceptedDate ? formatDate(ta.acceptedDate) : '—'}</Text>
                    </Col>
                  </Row>

                  {/* Kịch bản */}
                  {ta.testScenario && (
                    <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: 10 }}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>Kịch bản thử nghiệm</Text>
                      <Text style={{ fontSize: 12 }}>{ta.testScenario}</Text>
                    </div>
                  )}

                  {/* Chỉ tiêu đo được */}
                  {ta.performanceMetrics && (
                    <div style={{ marginBottom: 10 }}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>Chỉ tiêu kỹ thuật đo được</Text>
                      {ta.performanceMetrics.split(';').map((item, i) => {
                        const t = item.trim();
                        if (!t) return null;
                        const ok = t.includes('✓');
                        const fail = t.includes('✗');
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px', borderRadius: 6, marginBottom: 4, background: ok ? '#f6ffed' : fail ? '#fff2f0' : '#f8fafc', border: `1px solid ${ok ? '#b7eb8f' : fail ? '#ffa39e' : '#e8e8e8'}` }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: ok ? '#16a34a' : fail ? '#ff4d4f' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, flexShrink: 0, marginTop: 1 }}>{ok ? '✓' : fail ? '✗' : '–'}</div>
                            <Text style={{ fontSize: 12 }}>{t.replace(' ✓', '').replace(' ✗', '')}</Text>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Nghiệm thu */}
                  {ta.acceptedBy && (
                    <div style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', marginBottom: 10 }}>
                      <Space>
                        <TrophyOutlined style={{ color: '#16a34a' }} />
                        <Text style={{ fontSize: 12 }}><Text strong>Nghiệm thu bởi:</Text> {ta.acceptedBy}</Text>
                      </Space>
                    </div>
                  )}

                  {/* Xử lý không đạt */}
                  {ta.failureReason && (
                    <div style={{ padding: '8px 12px', background: '#fff2f0', borderRadius: 8, border: '1px solid #ffa39e', marginBottom: 10 }}>
                      <Space align="start">
                        <WarningOutlined style={{ color: '#ff4d4f', marginTop: 2 }} />
                        <div>
                          <Text style={{ fontSize: 12, display: 'block' }}><Text strong>Nguyên nhân không đạt:</Text> {ta.failureReason}</Text>
                          {ta.correctiveAction && (
                            <Text style={{ fontSize: 12, display: 'block', marginTop: 4 }}><Text strong>Khắc phục:</Text> {ta.correctiveAction}</Text>
                          )}
                          {ta.retestDate && (
                            <Text style={{ fontSize: 12, display: 'block', marginTop: 4 }}><Text strong>Thử lại:</Text> {formatDate(ta.retestDate)}</Text>
                          )}
                        </div>
                      </Space>
                    </div>
                  )}

                  {/* Bàn giao */}
                  {ta.deliveredTo && (
                    <div style={{ padding: '8px 12px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                      <Text style={{ fontSize: 12 }}><Text strong>Bàn giao:</Text> {ta.deliveredTo}{ta.deliveredDate ? ` — ${formatDate(ta.deliveredDate)}` : ''}</Text>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        );
      })(),
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="hero-banner"
        style={{ marginBottom: 20, borderRadius: 14 }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between" wrap={false}>
            <Col flex="auto">
              <Space size={12} align="start">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/traceability')}
                  style={{
                    borderRadius: 8, background: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.2)', color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  Quay lại
                </Button>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(212,168,67,0.2)',
                  border: '1px solid rgba(212,168,67,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClusterOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Space size={8} align="center">
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
                      {record.id}
                    </Title>
                    {statusCfg && (
                      <Tag color={statusCfg.color} style={{ fontSize: 12 }}>
                        {statusCfg.label}
                      </Tag>
                    )}
                  </Space>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block', marginTop: 2 }}>
                    {record.equipmentName}
                  </Text>
                </div>
              </Space>
            </Col>
            <Col flex="none">
              {isCompleted ? (
                <Tag
                  color="success"
                  style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, fontWeight: 600 }}
                >
                  Hoàn thành
                </Tag>
              ) : (
                STEP_BUTTONS[record.status] && (
                  <Button
                    type="primary"
                    style={STEP_BUTTONS[record.status].style}
                    onClick={() => setDrawerOpen(true)}
                  >
                    {STEP_BUTTONS[record.status].label}
                  </Button>
                )
              )}
            </Col>
          </Row>
        </div>
      </div>

      {/* Tabs */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: '0 20px 20px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
          style={{ paddingTop: 4 }}
        />
      </Card>

      {/* Drawer: Cập nhật bước tiếp theo */}
      <Drawer
        title={
          <Space>
            <ClusterOutlined style={{ color: colors.navy }} />
            <Text strong style={{ color: colors.navy }}>
              {STEP_DRAWER_TITLES[record.status] || 'Cập nhật bước tiếp theo'}
            </Text>
          </Space>
        }
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>
                Hủy
              </Button>
              <Button
                type="primary"
                style={{ background: colors.navy, borderColor: colors.navy }}
                onClick={() => {
                  form.validateFields().then(() => {
                    setDrawerOpen(false);
                    form.resetFields();
                  });
                }}
              >
                Lưu &amp; Chuyển bước tiếp
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical" size="small">
          {record.status === 'collecting' && (
            <>
              <Form.Item label="Người phụ trách" name="responsiblePerson"
                rules={[{ required: true, message: 'Vui lòng nhập người phụ trách' }]}>
                <Input placeholder="Họ tên và chức danh..." />
              </Form.Item>
              <Form.Item label="Người giám sát" name="supervisorName">
                <Input placeholder="Họ tên và chức danh..." />
              </Form.Item>
              <Form.Item label="Chi phí đại tu (đồng)" name="overhaulCost">
                <Input placeholder="VD: 2850000000" />
              </Form.Item>
              <Form.Item label="Ghi chú bổ sung" name="notes">
                <TextArea rows={3} placeholder="Thông tin bổ sung..." />
              </Form.Item>
            </>
          )}
          {record.status === 'updating' && (
            <>
              <Form.Item label="Phiên bản cấu hình" name="configVersion"
                rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}>
                <Input placeholder="VD: v2.3" />
              </Form.Item>
              <Form.Item label="Mô tả thay đổi cấu hình" name="configNote">
                <TextArea rows={4} placeholder="Liệt kê các thay đổi cấu hình chính..." />
              </Form.Item>
            </>
          )}
          {record.status === 'configuring' && (
            <>
              <Form.Item label="Tiêu chuẩn kỹ thuật áp dụng" name="standard">
                <Input placeholder="VD: TCQS-2025-RADAR" />
              </Form.Item>
              <Form.Item label="Bản sửa đổi kỹ thuật" name="designChange">
                <Input placeholder="VD: BK-2024-015" />
              </Form.Item>
              <Form.Item label="Mô tả thay đổi kỹ thuật" name="techNote">
                <TextArea rows={4} placeholder="Mô tả chi tiết thay đổi..." />
              </Form.Item>
            </>
          )}
          {record.status === 'recording' && (
            <>
              <Form.Item label="Tổng số cấu phần cần truy vết" name="traceTotal"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                <Input type="number" placeholder="VD: 8" />
              </Form.Item>
              <Form.Item label="Ghi chú truy vết" name="traceNote">
                <TextArea rows={4} placeholder="Thông tin serial, nhà cung cấp, ngày lắp..." />
              </Form.Item>
            </>
          )}
          {record.status === 'tracing' && (
            <>
              <Form.Item label="Hệ thống cần đồng bộ" name="syncTargets">
                <Select
                  mode="multiple"
                  placeholder="Chọn hệ thống..."
                  options={[
                    { value: 'finance', label: 'Quản lý Tài chính Kế toán' },
                    { value: 'lifecycle', label: 'Quản lý Vòng đời & Cấu hình' },
                    { value: 'maintenance', label: 'Quản lý Bảo trì' },
                    { value: 'repair', label: 'Quản lý Sửa chữa' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Ngày đồng bộ" name="syncDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </>
          )}
          {record.status === 'syncing' && (
            <>
              <Form.Item label="Ngày hoàn tất đồng bộ" name="syncedAt"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" defaultValue={dayjs()} />
              </Form.Item>
              <Form.Item label="Xác nhận toàn bộ hệ thống đã đồng bộ" name="confirm">
                <Select
                  placeholder="Chọn..."
                  options={[
                    { value: 'yes', label: 'Đã xác nhận — Đồng bộ hoàn thành' },
                    { value: 'partial', label: 'Chưa hoàn toàn — Cần theo dõi thêm' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Ghi chú đóng hồ sơ" name="closeNote">
                <TextArea rows={3} placeholder="Ghi chú khi đóng hồ sơ truy vết..." />
              </Form.Item>
            </>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default TraceabilityDetail;
