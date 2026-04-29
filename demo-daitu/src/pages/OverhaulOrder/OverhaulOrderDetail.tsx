import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions,
  Table, Progress, Steps, Statistic, List, Alert, Divider, Badge, Tabs,
} from 'antd';
import {
  ArrowLeftOutlined, SolutionOutlined, CheckCircleOutlined,
  ToolOutlined, AppstoreOutlined, ShoppingCartOutlined,
  TeamOutlined, CalendarOutlined, FileTextOutlined,
  ClockCircleOutlined, DollarOutlined, UserOutlined, AuditOutlined,
  WarningOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { workStages } from '../../data/workStages';
import { overhaulOrderStatusConfig, formatDate, formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkStage } from '../../types';

const { Title, Text } = Typography;

// ─── Shared sub-components ───────────────────────────────────────────────────

// Màu riêng cho từng bước
const STEP_COLORS = ['#1B3A5C', '#2e7d32', '#e65100', '#6a1b9a', '#0277bd', '#c62828'];

const StepBadge: React.FC<{ step: number; active?: boolean }> = ({ step, active }) => {
  const baseColor = STEP_COLORS[step - 1] ?? '#888';
  const bg = active ? baseColor : `${baseColor}22`;
  const textColor = active ? '#fff' : baseColor;
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: bg,
      border: `1.5px solid ${baseColor}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: 11, fontWeight: 700, color: textColor,
      transition: 'all 0.2s',
    }}>
      {step}
    </div>
  );
};

const QuoteBlock: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = colors.navy }) => (
  <div style={{
    borderLeft: `3px solid ${color}`, paddingLeft: 12, paddingTop: 8, paddingBottom: 8,
    background: `${color}06`, borderRadius: '0 6px 6px 0', marginTop: 8,
  }}>
    <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-line' }}>{children}</Text>
  </div>
);

const EmptyState: React.FC<{ text?: string }> = ({ text = 'Chưa có dữ liệu cho bước này' }) => (
  <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
    <ClockCircleOutlined style={{ fontSize: 28, marginBottom: 10, display: 'block' }} />
    <Text style={{ color: '#bbb', fontSize: 13 }}>{text}</Text>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OverhaulOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');

  const order = overhaulOrders.find(o => o.id === id);
  const stages = workStages.filter(s => s.orderId === id).sort((a, b) => a.sequence - b.sequence);

  if (!order) return (
    <div style={{ padding: 32 }}>
      <Text>Không tìm thấy lệnh đại tu.</Text>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/overhaul-orders')} style={{ marginLeft: 12 }}>Quay lại</Button>
    </div>
  );

  const statusCfg = overhaulOrderStatusConfig[order.status];
  const currentStageIndex = stages.findIndex(s => s.status === 'in_progress');
  const completedStages = stages.filter(s => s.status === 'completed').length;

  const statusOrder = ['draft', 'pending_approval', 'approved', 'in_progress', 'completed', 'closed'];
  const statusIdx = statusOrder.indexOf(order.status);
  const step1Done = statusIdx >= 1;
  const step2Done = statusIdx >= 3;
  const step3Done = !!(order.materialRequirements && order.materialRequirements.length > 0);
  const step4Done = !!(order.personnelPlan);
  const step5Done = statusIdx >= 2;
  const step6Done = statusIdx >= 2;

  const stepDone = [step1Done, step2Done, step3Done, step4Done, step5Done, step6Done];

  const ActionButton: React.FC = () => {
    if (order.status === 'draft') return (
      <Button type="primary" icon={<AuditOutlined />}
        style={{ background: '#722ed1', borderColor: '#722ed1', borderRadius: 8 }}>
        Trình duyệt
      </Button>
    );
    if (order.status === 'pending_approval') return (
      <Button type="primary" icon={<CheckCircleOutlined />}
        style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }}>
        Phê duyệt lệnh
      </Button>
    );
    if (order.status === 'approved') return (
      <Button type="primary" icon={<ToolOutlined />}
        style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8 }}>
        Bắt đầu thực hiện
      </Button>
    );
    if (order.status === 'in_progress') return (
      <Button type="primary" icon={<CheckCircleOutlined />}
        style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }}>
        Hoàn thành
      </Button>
    );
    return <Button disabled icon={<CheckCircleOutlined />} style={{ borderRadius: 8 }}>Đã đóng</Button>;
  };

  const stageColumns = [
    { title: 'TT', dataIndex: 'sequence', key: 'sequence', width: 44 },
    {
      title: 'Công đoạn', dataIndex: 'name', key: 'name', width: 200,
      render: (v: string, r: WorkStage) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{v}</Text>
          <div><Text style={{ fontSize: 11, color: '#888' }}>{r.description}</Text></div>
        </div>
      ),
    },
    { title: 'Đội thực hiện', dataIndex: 'assignedTeam', key: 'assignedTeam', width: 160, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'KH bắt đầu', dataIndex: 'plannedStartDate', key: 'plannedStartDate', width: 110, render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text> },
    { title: 'KH kết thúc', dataIndex: 'plannedEndDate', key: 'plannedEndDate', width: 110, render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text> },
    {
      title: 'KH / TT (ngày)', key: 'duration', width: 120, align: 'center' as const,
      render: (_: unknown, r: WorkStage) => (
        <Text style={{ fontSize: 12 }}>
          {r.plannedDuration}{r.actualDuration ? <> / <Text strong style={{ color: colors.navy }}>{r.actualDuration}</Text></> : ''}
        </Text>
      ),
    },
    {
      title: 'Tiến độ', key: 'progress', width: 120,
      render: (_: unknown, r: WorkStage) => (
        <Progress percent={r.progress} size="small"
          strokeColor={r.progress === 100 ? '#52c41a' : r.status === 'in_progress' ? '#1890ff' : '#d9d9d9'} />
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (v: string) => {
        const map: Record<string, { label: string; color: string }> = {
          pending: { label: 'Chưa bắt đầu', color: 'geekblue' },
          in_progress: { label: 'Đang thực hiện', color: 'processing' },
          completed: { label: 'Hoàn thành', color: 'success' },
          skipped: { label: 'Bỏ qua', color: 'volcano' },
        };
        const c = map[v] || { label: v, color: 'geekblue' };
        return <Tag color={c.color}>{c.label}</Tag>;
      },
    },
  ];

  // Tab label helper
  const tabLabel = (step: number, label: string) => (
    <Space size={8} style={{ padding: '0 6px' }}>
      <StepBadge step={step} active={activeTab === String(step)} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
    </Space>
  );

  const tabItems = [
    {
      key: '1',
      label: tabLabel(1, 'Phương án'),
      children: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Phương án đại tu</Text>
          <QuoteBlock>{order.strategy}</QuoteBlock>

          {order.technicalStandards && <>
            <Divider style={{ margin: '16px 0 10px' }} />
            <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Tiêu chuẩn & Chỉ thị kỹ thuật</Text>
            <QuoteBlock color="#1890ff">{order.technicalStandards}</QuoteBlock>
          </>}

          {order.interventionScope && <>
            <Divider style={{ margin: '16px 0 10px' }} />
            <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Mức can thiệp theo từng cụm hệ thống</Text>
            <QuoteBlock color="#722ed1">{order.interventionScope}</QuoteBlock>
          </>}

          <Divider style={{ margin: '16px 0 10px' }} />
          <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
            <Descriptions.Item label="Phân xưởng thực hiện">
              <Text strong style={{ color: colors.navy }}>{order.workshopName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phạm vi">
              <Tag color={order.overhaulScope === 'full' ? 'blue' : 'cyan'}>
                {order.overhaulScope === 'full' ? 'Đại tu toàn bộ' : 'Đại tu một phần'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: '2',
      label: tabLabel(2, 'Công đoạn'),
      children: (
        <div style={{ padding: '4px 0' }}>
          {stages.length > 0 ? <>
            <Steps
              current={currentStageIndex >= 0 ? currentStageIndex : completedStages}
              size="small"
              style={{ marginBottom: 20 }}
              items={stages.map(s => ({
                title: <Text style={{ fontSize: 12 }}>{s.name}</Text>,
                status: s.status === 'completed' ? 'finish' : s.status === 'in_progress' ? 'process' : 'wait',
                description: <Text style={{ fontSize: 11, color: '#aaa' }}>{s.plannedDuration} ngày</Text>,
              }))}
            />
            <Table
              dataSource={stages}
              columns={stageColumns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 900 }}
            />
          </> : <EmptyState text="Chưa có công đoạn nào được lập kế hoạch" />}
        </div>
      ),
    },
    {
      key: '3',
      label: tabLabel(3, 'Vật tư'),
      children: (
        <div style={{ padding: '4px 0' }}>
          {step3Done ? (
            <Row gutter={[20, 16]}>
              <Col xs={24} md={14}>
                <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                  Danh mục vật tư chính
                </Text>
                <List
                  size="small"
                  style={{ marginTop: 10 }}
                  dataSource={order.materialRequirements || []}
                  renderItem={(item, idx) => (
                    <List.Item style={{ padding: '7px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', background: `${colors.navy}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: colors.navy, flexShrink: 0,
                        }}>{idx + 1}</div>
                        <Text style={{ fontSize: 13 }}>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Col>
              <Col xs={24} md={10}>
                {order.mandatoryReplacements && order.mandatoryReplacements.length > 0 && <>
                  <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                    Vật tư bắt buộc thay thế
                  </Text>
                  <div style={{
                    marginTop: 10, background: '#fff2f0', border: '1px solid #ffccc7',
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    {order.mandatoryReplacements.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, paddingBottom: 6,
                        borderBottom: idx < (order.mandatoryReplacements?.length || 0) - 1 ? '1px solid #ffccc7' : 'none',
                      }}>
                        <WarningOutlined style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2, flexShrink: 0 }} />
                        <Text style={{ fontSize: 13 }}>{item}</Text>
                      </div>
                    ))}
                  </div>
                </>}
                {order.estimatedMaterialCost !== undefined && (
                  <div style={{ marginTop: 14, padding: '12px 16px', background: `${colors.navy}06`, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, color: '#888' }}>Chi phí vật tư ước tính</Text>
                    <div style={{ fontSize: 22, fontWeight: 700, color: colors.navy, marginTop: 4 }}>
                      {formatCurrency(order.estimatedMaterialCost)}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          ) : <EmptyState text="Chưa lập danh mục vật tư" />}
        </div>
      ),
    },
    {
      key: '4',
      label: tabLabel(4, 'Nhân lực'),
      children: (
        <div style={{ padding: '4px 0' }}>
          {step4Done ? (
            <>
              <Row gutter={[16, 12]}>
                <Col xs={24} md={17}>
                  <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                    Kế hoạch phân công
                  </Text>
                  <QuoteBlock color="#52c41a">{order.personnelPlan}</QuoteBlock>
                </Col>
                <Col xs={24} md={7}>
                  <div style={{ padding: '16px', background: `${colors.navy}08`, borderRadius: 10, textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: 28, color: colors.navy, marginBottom: 8, display: 'block' }} />
                    <div style={{ fontSize: 30, fontWeight: 700, color: colors.navy }}>{order.teamSize || '—'}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Kỹ thuật viên</div>
                  </div>
                </Col>
              </Row>
              {stages.length > 0 && <>
                <Divider style={{ margin: '16px 0 12px' }} />
                <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                  Phân công theo công đoạn
                </Text>
                <Row gutter={[10, 10]} style={{ marginTop: 12 }}>
                  {stages.map(s => (
                    <Col xs={24} sm={12} key={s.id}>
                      <div style={{
                        padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.navy}20`,
                        background: s.status === 'completed' ? '#f6ffed' : s.status === 'in_progress' ? '#eff6ff' : '#f8faff',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <Text strong style={{ fontSize: 12 }}>{s.name}</Text>
                          <div><Text style={{ fontSize: 11, color: '#888' }}>{s.assignedTeam}</Text></div>
                        </div>
                        <Badge
                          status={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'processing' : 'default'}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </>}
            </>
          ) : <EmptyState text="Chưa lập kế hoạch nhân lực" />}
        </div>
      ),
    },
    {
      key: '5',
      label: tabLabel(5, 'Thời gian'),
      children: (
        <div style={{ padding: '4px 0' }}>
          {step5Done ? (
            <>
              <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                {[
                  { label: 'KH bắt đầu', value: formatDate(order.plannedStartDate), icon: <CalendarOutlined />, color: colors.navy },
                  { label: 'KH kết thúc', value: formatDate(order.plannedEndDate), icon: <CalendarOutlined />, color: colors.navy },
                  { label: 'TT bắt đầu', value: order.actualStartDate ? formatDate(order.actualStartDate) : '—', icon: <ClockCircleOutlined />, color: '#faad14' },
                  { label: 'TT kết thúc', value: order.actualEndDate ? formatDate(order.actualEndDate) : '—', icon: <ClockCircleOutlined />, color: '#52c41a' },
                ].map((item, i) => (
                  <Col xs={12} sm={6} key={i}>
                    <div style={{ padding: '10px 14px', background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, color: item.color }}>{item.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.color, marginTop: 4 }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
              <Row gutter={[12, 0]} style={{ marginBottom: 16 }}>
                <Col xs={12}>
                  <div style={{ padding: '10px 14px', background: '#f0f2f5', borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, color: '#888' }}>Thời gian kế hoạch</Text>
                    <div style={{ fontSize: 22, fontWeight: 700, color: colors.navy }}>{order.plannedDuration} ngày</div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: order.actualDuration && order.actualDuration > order.plannedDuration ? '#fff2f0' : '#f6ffed',
                  }}>
                    <Text style={{ fontSize: 12, color: '#888' }}>Thời gian thực tế</Text>
                    <div style={{ fontSize: 22, fontWeight: 700, color: order.actualDuration ? (order.actualDuration > order.plannedDuration ? '#ff4d4f' : '#52c41a') : '#aaa' }}>
                      {order.actualDuration ? `${order.actualDuration} ngày` : '—'}
                    </div>
                  </div>
                </Col>
              </Row>
              {stages.length > 0 && <>
                <Divider style={{ margin: '14px 0 12px' }} />
                <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                  Phân bổ thời gian theo công đoạn
                </Text>
                <div style={{ marginTop: 12 }}>
                  {stages.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <Text style={{ fontSize: 12, width: 180, flexShrink: 0, color: '#555' }}>{s.name}</Text>
                      <Progress
                        percent={Math.round(s.plannedDuration / order.plannedDuration * 100)}
                        format={() => `${s.plannedDuration}ng`}
                        size="small"
                        style={{ flex: 1 }}
                        strokeColor={s.status === 'completed' ? '#52c41a' : s.status === 'in_progress' ? '#1890ff' : `${colors.navy}50`}
                      />
                    </div>
                  ))}
                </div>
              </>}
            </>
          ) : <EmptyState text="Chưa có kế hoạch thời gian" />}
        </div>
      ),
    },
    {
      key: '6',
      label: tabLabel(6, 'Phê duyệt'),
      children: (
        <div style={{ padding: '4px 0' }}>
          {step6Done ? (
            <>
              <div style={{
                background: `linear-gradient(135deg, ${colors.navy}08, ${colors.navy}14)`,
                border: `1px solid ${colors.navy}25`, borderRadius: 10, padding: '16px 20px', marginBottom: 16,
              }}>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title={<Text style={{ fontSize: 12, color: '#888' }}>Mã lệnh đại tu</Text>}
                      value={order.code}
                      valueStyle={{ fontSize: 18, fontWeight: 700, color: colors.navy }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title={<Text style={{ fontSize: 12, color: '#888' }}>Trạng thái</Text>}
                      value=" "
                      prefix={<Tag color={statusCfg?.color} style={{ fontSize: 13, padding: '2px 12px' }}>{statusCfg?.label}</Tag>}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title={<Text style={{ fontSize: 12, color: '#888' }}>Tiến độ</Text>}
                      value={order.progress}
                      suffix="%"
                      valueStyle={{ fontSize: 18, fontWeight: 700, color: order.progress < 50 ? '#faad14' : '#52c41a' }}
                    />
                  </Col>
                </Row>
              </div>
              <Descriptions column={2} size="small" labelStyle={{ color: '#888', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                <Descriptions.Item label="Người phê duyệt">
                  <Text strong>{order.approvedBy || '—'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày phê duyệt">
                  {order.approvedDate ? formatDate(order.approvedDate) : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Chi phí kế hoạch">
                  <Text strong style={{ color: colors.navy }}>{formatCurrency(order.plannedCost)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chi phí thực tế">
                  <Text strong style={{ color: '#52c41a' }}>{order.actualCost ? formatCurrency(order.actualCost) : '—'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo lệnh">{formatDate(order.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">{formatDate(order.updatedAt)}</Descriptions.Item>
              </Descriptions>
              {order.status === 'pending_approval' && (
                <Alert type="warning" showIcon style={{ marginTop: 16, borderRadius: 8 }}
                  message="Lệnh đại tu đang chờ phê duyệt"
                  description="Lệnh đại tu đã được trình duyệt và đang chờ cấp có thẩm quyền phê duyệt để bắt đầu thực hiện."
                />
              )}
            </>
          ) : (
            <Alert type="info" showIcon style={{ borderRadius: 8 }}
              message="Chưa ban hành lệnh"
              description="Lệnh đại tu chưa được trình duyệt. Hoàn thiện các bước 1–5 và trình duyệt để ban hành lệnh."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.navy} 0%, #2d5a8e 100%)`,
        borderRadius: 14, padding: '20px 24px', marginBottom: 20,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.07 }}>
          <SolutionOutlined style={{ fontSize: 96 }} />
        </div>
        <Row align="middle" justify="space-between">
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/overhaul-orders')}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, marginBottom: 12 }}>
              Quay lại
            </Button>
            <div>
              <Space size={10} wrap>
                <Title level={4} style={{ margin: 0, color: '#fff' }}>{order.code}</Title>
                <Tag style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 12 }}>
                  {statusCfg?.label}
                </Tag>
                <Tag color={order.overhaulScope === 'full' ? 'blue' : 'cyan'} style={{ fontWeight: 600, fontSize: 12 }}>
                  {order.overhaulScope === 'full' ? 'Đại tu toàn bộ' : 'Đại tu một phần'}
                </Tag>
              </Space>
              <div style={{ marginTop: 6 }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                  {order.equipmentName} — {order.equipmentModel}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {order.workshopName} · Tạo: {formatDate(order.createdAt)}
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <ActionButton />
          </Col>
        </Row>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          {
            title: 'Tiến độ tổng thể', value: `${order.progress}%`, icon: <SafetyCertificateOutlined />,
            color: order.progress < 30 ? '#ff4d4f' : order.progress < 70 ? '#faad14' : '#52c41a',
          },
          { title: 'Thời gian kế hoạch', value: `${order.plannedDuration} ngày`, icon: <CalendarOutlined />, color: colors.navy },
          { title: 'Chi phí kế hoạch', value: formatCurrency(order.plannedCost), icon: <DollarOutlined />, color: colors.navy },
          {
            title: 'Chi phí thực tế', value: order.actualCost ? formatCurrency(order.actualCost) : '—',
            icon: <DollarOutlined />, color: '#16a34a',
          },
        ].map((stat, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 10, textAlign: 'center' }} styles={{ body: { padding: '14px 12px' } }}>
              <div style={{ fontSize: 22, color: stat.color, marginBottom: 2 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{stat.title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Main content: Tabs (left) + Sidebar (right) ──────────── */}
      <Row gutter={[20, 0]}>
        <Col xs={24} lg={17}>
          <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '0 20px 20px' } }} className="order-detail-tabs">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="small"
              style={{ minHeight: 320 }}
              items={tabItems}
              tabBarStyle={{ marginBottom: 20, paddingTop: 6 }}
              tabBarGutter={0}
              indicator={{ size: (origin) => origin - 16 }}
            />
          </Card>
        </Col>

        {/* RIGHT: sidebar */}
        <Col xs={24} lg={7}>
          {/* Thông tin chung */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '16px 20px' } }}>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>Thông tin chung</Text>
            <Descriptions column={1} size="small" style={{ marginTop: 12 }}
              labelStyle={{ color: '#888', fontSize: 12, width: 130 }}
              contentStyle={{ fontSize: 13, fontWeight: 500 }}>
              <Descriptions.Item label="Thiết bị">{order.equipmentName}</Descriptions.Item>
              <Descriptions.Item label="Model">{order.equipmentModel}</Descriptions.Item>
              <Descriptions.Item label="Phân xưởng">
                <Text style={{ color: colors.navy, fontWeight: 600 }}>{order.workshopName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phạm vi">
                <Tag color={order.overhaulScope === 'full' ? 'blue' : 'cyan'} style={{ fontSize: 11 }}>
                  {order.overhaulScope === 'full' ? 'Đại tu toàn bộ' : 'Đại tu một phần'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số KTV">
                <Text strong>{order.teamSize ? `${order.teamSize} người` : '—'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="CP vật tư">
                <Text strong style={{ color: colors.navy }}>
                  {order.estimatedMaterialCost ? formatCurrency(order.estimatedMaterialCost) : '—'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Công đoạn mini */}
          {stages.length > 0 && (
            <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '16px 20px' } }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
                <Text strong style={{ fontSize: 14, color: colors.navy }}>Công đoạn</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>
                  {completedStages}/{stages.length} hoàn thành
                </Text>
              </Row>
              <Progress
                percent={Math.round(completedStages / stages.length * 100)}
                size="small"
                strokeColor={colors.navy}
                style={{ marginBottom: 12 }}
              />
              {stages.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <Text style={{ fontSize: 12, color: '#555' }}>{s.sequence}. {s.name}</Text>
                  <Tag style={{ fontSize: 10, padding: '0 6px' }}
                    color={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'processing' : 'default'}>
                    {s.status === 'completed' ? 'Xong' : s.status === 'in_progress' ? 'Đang làm' : 'Chờ'}
                  </Tag>
                </div>
              ))}
            </Card>
          )}

          {/* Timestamps */}
          <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '16px 20px' } }}>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>Lịch sử cập nhật</Text>
            <Descriptions column={1} size="small" style={{ marginTop: 12 }}
              labelStyle={{ color: '#888', fontSize: 12, width: 130 }}
              contentStyle={{ fontSize: 12 }}>
              <Descriptions.Item label="Ngày tạo">{formatDate(order.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">{formatDate(order.updatedAt)}</Descriptions.Item>
              {order.approvedDate && (
                <Descriptions.Item label="Ngày phê duyệt">{formatDate(order.approvedDate)}</Descriptions.Item>
              )}
              {order.approvedBy && (
                <Descriptions.Item label="Người phê duyệt">{order.approvedBy}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverhaulOrderDetail;
