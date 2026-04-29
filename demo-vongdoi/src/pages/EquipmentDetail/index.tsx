import React, { useState } from 'react';
import {
  Card, Tag, Button, Space, Typography, Descriptions, Progress,
  Tabs, Timeline, Row, Col, Badge, Tooltip, Image,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import {
  ArrowLeftOutlined, EditOutlined, DatabaseOutlined,
  ClockCircleOutlined, ApartmentOutlined, HistoryOutlined,
  ExclamationCircleOutlined, PrinterOutlined,
  EnvironmentOutlined, CalendarOutlined, TeamOutlined,
  ToolOutlined, ThunderboltOutlined, AppstoreOutlined,
  CheckCircleOutlined, WarningOutlined, StopOutlined,
  PictureOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentList } from '../../data/equipment';
import { getLifecyclePlansByEquipment } from '../../data/lifecyclePlans';
import { getConfigsByEquipment } from '../../data/configurations';
import { getLogsByEquipment } from '../../data/operationHistory';
import { getComponentsByEquipment } from '../../data/components';
import type { EquipComponent } from '../../data/components';
import {
  equipmentStatusConfig, equipmentTypeConfig, technicalConditionConfig,
  lifecyclePhaseConfig, lifecyclePlanStatusConfig,
  configChangeTypeConfig, operationEventTypeConfig,
  getLifespanPercent, getHoursPercent, getProgressColor,
  formatDate, formatHours,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

/* ── helpers ────────────────────────────────────────────────── */
const gradientByPct = (pct: number) =>
  pct >= 90 ? 'linear-gradient(135deg,#7f1d1d,#dc2626)'
  : pct >= 75 ? 'linear-gradient(135deg,#92400e,#d97706)'
  : 'linear-gradient(135deg,#14532d,#16a34a)';

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 7,
      background: `${color}18`, border: `1px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, color,
    }}>
      {icon}
    </div>
    <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{title}</Text>
  </div>
);

/* ── component ──────────────────────────────────────────────── */
const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isVongDoi } = useUser();
  const [activeTab, setActiveTab] = useState('info');

  const eq = equipmentList.find(e => e.id === id);
  if (!eq) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Text type="secondary">Không tìm thấy thiết bị.</Text><br />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/equipment')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const lifePct    = getLifespanPercent(eq.yearReceived, eq.designLifespan);
  const hoursPct   = getHoursPercent(eq.operatingHours, eq.maxOperatingHours);
  const plans      = getLifecyclePlansByEquipment(eq.id);
  const configs    = getConfigsByEquipment(eq.id);
  const logs       = getLogsByEquipment(eq.id);
  const components = getComponentsByEquipment(eq.id);
  const statusCfg  = equipmentStatusConfig[eq.status];
  const typeCfg    = equipmentTypeConfig[eq.type];

  /* ── Calendar state ─────────────────────────────────── */
  const [calendarDate, setCalendarDate] = useState<Dayjs>(dayjs());

  /* ── Condition config ───────────────────────────────── */
  const conditionConfig: Record<EquipComponent['condition'], { label: string; color: string; icon: React.ReactNode }> = {
    excellent: { label: 'Tốt',           color: '#16a34a', icon: <CheckCircleOutlined /> },
    good:      { label: 'Bình thường',   color: '#2563eb', icon: <CheckCircleOutlined /> },
    fair:      { label: 'Cần theo dõi',  color: '#d97706', icon: <WarningOutlined /> },
    poor:      { label: 'Cần thay thế',  color: '#dc2626', icon: <StopOutlined /> },
  };

  /* ── Calendar: nhóm events theo ngày ───────────────────*/
  const schedulePhases = ['periodic_maintenance', 'repair', 'overhaul', 'upgrade'] as const;
  const phaseCalColor: Record<string, string> = {
    periodic_maintenance: '#2563eb',
    repair:               '#d97706',
    overhaul:             '#7c3aed',
    upgrade:              '#0891b2',
  };

  const getEventsForDay = (day: Dayjs) =>
    plans.filter(p =>
      schedulePhases.includes(p.phase as typeof schedulePhases[number]) &&
      day.isBetween(dayjs(p.plannedStartDate).subtract(1, 'day'), dayjs(p.plannedEndDate).add(1, 'day'))
    );

  const getEventsForMonth = (month: Dayjs) =>
    plans.filter(p =>
      schedulePhases.includes(p.phase as typeof schedulePhases[number]) && (
        dayjs(p.plannedStartDate).isSame(month, 'month') ||
        dayjs(p.plannedEndDate).isSame(month, 'month') ||
        (dayjs(p.plannedStartDate).isBefore(month, 'month') && dayjs(p.plannedEndDate).isAfter(month, 'month'))
      )
    );

  const calendarCellRender = (date: Dayjs) => {
    const events = getEventsForDay(date);
    if (!events.length) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
        {events.map(e => (
          <Tooltip key={e.id} title={`${lifecyclePhaseConfig[e.phase]?.label}: ${e.description}`}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: phaseCalColor[e.phase] || '#1B3A5C',
              flexShrink: 0,
            }} />
          </Tooltip>
        ))}
      </div>
    );
  };

  /* ── KPI cards ─────────────────────────────────────── */
  const kpiCards = [
    {
      label: 'Tuổi thọ sử dụng',
      value: `${lifePct}%`,
      sub: `${2026 - eq.yearReceived} / ${eq.designLifespan} năm`,
      gradient: gradientByPct(lifePct),
      icon: <ThunderboltOutlined />,
    },
    {
      label: 'Giờ vận hành',
      value: `${hoursPct}%`,
      sub: `${formatHours(eq.operatingHours)} / ${formatHours(eq.maxOperatingHours)}`,
      gradient: gradientByPct(hoursPct),
      icon: <ClockCircleOutlined />,
    },
    {
      label: 'Kế hoạch vòng đời',
      value: plans.length,
      sub: `${plans.filter(p => p.status === 'in_progress').length} đang thực hiện`,
      gradient: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)',
      icon: <CalendarOutlined />,
    },
    {
      label: 'Thay đổi cấu hình',
      value: configs.length,
      sub: configs[0] ? `Gần nhất: ${formatDate(configs[0].changeDate)}` : 'Chưa có',
      gradient: 'linear-gradient(135deg,#5b21b6,#7c3aed)',
      icon: <ApartmentOutlined />,
    },
    {
      label: 'Lịch sử vận hành',
      value: logs.length,
      sub: logs[0] ? `Gần nhất: ${formatDate(logs[0].eventDate)}` : 'Chưa có',
      gradient: 'linear-gradient(135deg,#0e7490,#0891b2)',
      icon: <HistoryOutlined />,
    },
  ];

  return (
    <div>
      {/* ── Hero banner ──────────────────────────────────── */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between" wrap={false}>
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Space size={12} align="center">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/equipment')}
                  style={{ color: 'rgba(255,255,255,0.65)', padding: '4px 6px', flexShrink: 0 }}
                />
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg,rgba(212,168,67,0.25),rgba(240,216,144,0.15))',
                  border: '1px solid rgba(212,168,67,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DatabaseOutlined style={{ fontSize: 22, color: '#D4A843' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
                      {eq.name}
                    </Title>
                    <Tag style={{ background: statusCfg?.color, color: '#fff', border: 'none', fontSize: 11, borderRadius: 4 }}>
                      {statusCfg?.label}
                    </Tag>
                    <Tag style={{ background: typeCfg?.color, color: '#fff', border: 'none', fontSize: 11, borderRadius: 4 }}>
                      {typeCfg?.label}
                    </Tag>
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginTop: 2 }}>
                    {eq.code} &nbsp;·&nbsp; {eq.serialNumber} &nbsp;·&nbsp; {eq.unitName}
                  </Text>
                </div>
              </Space>
            </Col>
            <Col style={{ flexShrink: 0 }}>
              <Space>
                {isVongDoi && (
                  <Button
                    icon={<EditOutlined />}
                    style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 500 }}
                  >
                    Chỉnh sửa
                  </Button>
                )}
                <Button
                  icon={<PrinterOutlined />}
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
                >
                  In hồ sơ
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* ── KPI gradient cards ───────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {kpiCards.map((card, i) => (
          <div key={i} style={{ flex: '1 1 150px', minWidth: 0 }}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, border: 'none', borderRadius: 12 }}
              bodyStyle={{ padding: '14px 16px' }}
            >
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -6, right: -2, fontSize: 48, opacity: 0.1, color: '#fff' }}>
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                    {card.icon}
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 500 }}>{card.label}</Text>
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}>{card.value}</div>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, display: 'block', marginTop: 3 }}>{card.sub}</Text>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* ── Main tabs card ───────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '0 24px 24px' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{ marginBottom: 20, borderBottom: '2px solid #f0f2f5' }}
          items={[
            /* ── TAB 1: Thông tin chung ─────────────────── */
            {
              key: 'info',
              label: <Space size={6}><DatabaseOutlined />Thông tin chung</Space>,
              children: (
                <div>
                  {/* Quick-status ribbon */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 0,
                    borderRadius: 10, overflow: 'hidden', marginBottom: 24,
                    border: '1px solid #e8e8e8',
                  }}>
                    {[
                      { label: 'Trạng thái',          node: <Tag color={statusCfg?.color} style={{ margin: 0 }}>{statusCfg?.label}</Tag> },
                      { label: 'Tình trạng kỹ thuật', node: <Tag color={technicalConditionConfig[eq.technicalCondition]?.color} style={{ margin: 0 }}>{technicalConditionConfig[eq.technicalCondition]?.label}</Tag> },
                      { label: 'Loại sản phẩm',       node: <Tag style={{ background: typeCfg?.color, color: '#fff', border: 'none', margin: 0 }}>{typeCfg?.label}</Tag> },
                      { label: 'Đơn vị sử dụng',      node: <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{eq.unitName}</Text> },
                      { label: 'Phòng quản lý',        node: <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{eq.departmentName}</Text> },
                    ].map((item, i) => (
                      <div key={i} style={{
                        flex: '1 1 140px', padding: '10px 16px',
                        background: i % 2 === 0 ? '#fafbff' : '#f5f7fa',
                        borderRight: '1px solid #e8e8e8',
                      }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>{item.label}</Text>
                        {item.node}
                      </div>
                    ))}
                  </div>

                  {/* ── Row 1: Ảnh + Thông tin cơ bản ────── */}
                  <Row gutter={28} style={{ marginBottom: 24 }}>
                    {/* Left — image gallery */}
                    <Col xs={24} lg={12}>
                      <SectionHeader icon={<PictureOutlined />} title="Hình ảnh thiết bị" color="#0891b2" />
                      {eq.images && (
                        <Image.PreviewGroup
                          preview={{ countRender: (current, total) => `${current} / ${total}` }}
                        >
                          <div style={{ display: 'flex', gap: 8, height: 340 }}>
                            {/* Main image */}
                            <div style={{
                              flex: 1, height: '100%', overflow: 'hidden', borderRadius: 10,
                              border: '1px solid #e8e8e8',
                              boxShadow: '0 4px 16px rgba(27,58,92,0.10)',
                              position: 'relative',
                            }}>
                              <Image
                                src={eq.images.main}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                preview={{ mask: <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><EyeOutlined style={{ fontSize: 20 }} /><span style={{ fontSize: 12 }}>Xem ảnh</span></span> }}
                              />
                              <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(transparent, rgba(10,22,40,0.65))',
                                padding: '20px 12px 10px',
                                borderRadius: '0 0 10px 10px',
                                pointerEvents: 'none',
                              }}>
                                <span style={{ color: '#D4A843', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>ẢNH CHÍNH</span>
                              </div>
                            </div>
                            {/* Sub images */}
                            <div style={{ width: 110, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                              {eq.images.sub.slice(0, 3).map((src, i) => (
                                <div key={i} style={{
                                  flex: 1, overflow: 'hidden', borderRadius: 8,
                                  border: '1px solid #e8e8e8',
                                  boxShadow: '0 2px 8px rgba(27,58,92,0.07)',
                                  position: 'relative',
                                }}>
                                  <Image
                                    src={src}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    preview={{ mask: <EyeOutlined /> }}
                                  />
                                  <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    background: 'rgba(10,22,40,0.55)',
                                    padding: '3px 8px',
                                    borderRadius: '0 0 8px 8px',
                                    pointerEvents: 'none',
                                  }}>
                                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 500 }}>Ảnh {i + 2}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Image.PreviewGroup>
                      )}
                    </Col>

                    {/* Right — basic info */}
                    <Col xs={24} lg={12}>
                      <SectionHeader icon={<DatabaseOutlined />} title="Thông tin cơ bản" color="#1B3A5C" />
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                        {[
                          { label: 'Mã thiết bị',    value: <Text code style={{ fontSize: 12 }}>{eq.code}</Text> },
                          { label: 'Số seri',        value: eq.serialNumber },
                          { label: 'Nhà sản xuất',   value: eq.manufacturer },
                          { label: 'Xuất xứ',        value: eq.origin },
                          { label: 'Năm sản xuất',   value: eq.yearManufactured },
                          { label: 'Năm tiếp nhận',  value: eq.yearReceived },
                          { label: 'Vị trí hiện tại',value: <><EnvironmentOutlined style={{ marginRight: 4, color: '#1B3A5C' }} />{eq.location}</> },
                        ].map((row, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center',
                            padding: '9px 14px',
                            background: i % 2 === 0 ? '#fff' : '#fafbff',
                            borderBottom: i < 6 ? '1px solid #f0f2f5' : 'none',
                          }}>
                            <Text type="secondary" style={{ fontSize: 12, width: 130, flexShrink: 0 }}>{row.label}</Text>
                            <Text style={{ fontSize: 13, color: '#1a1a2e' }}>{row.value}</Text>
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>

                  {/* ── Row 2: Thông số vòng đời + Lịch bảo dưỡng ── */}
                  <Row gutter={28}>
                    {/* Left — lifespan */}
                    <Col xs={24} lg={12}>
                      <SectionHeader icon={<ThunderboltOutlined />} title="Thông số vòng đời" color="#16a34a" />
                      <div style={{ padding: '16px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 10, marginBottom: 12, border: '1px solid #bbf7d0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space size={6}>
                            <ClockCircleOutlined style={{ color: '#16a34a', fontSize: 13 }} />
                            <Text style={{ fontSize: 13, fontWeight: 500 }}>Tuổi thọ sử dụng</Text>
                          </Space>
                          <Text strong style={{ fontSize: 18, color: getProgressColor(lifePct) }}>{lifePct}%</Text>
                        </div>
                        <Progress
                          percent={lifePct}
                          strokeColor={{ '0%': getProgressColor(lifePct), '100%': getProgressColor(lifePct) }}
                          trailColor="rgba(0,0,0,0.08)"
                          strokeWidth={10}
                          showInfo={false}
                          style={{ marginBottom: 6 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {2026 - eq.yearReceived} năm sử dụng &nbsp;/&nbsp; {eq.designLifespan} năm thiết kế
                        </Text>
                      </div>
                      <div style={{ padding: '16px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space size={6}>
                            <ToolOutlined style={{ color: '#2563eb', fontSize: 13 }} />
                            <Text style={{ fontSize: 13, fontWeight: 500 }}>Giờ vận hành</Text>
                          </Space>
                          <Text strong style={{ fontSize: 18, color: getProgressColor(hoursPct) }}>{hoursPct}%</Text>
                        </div>
                        <Progress
                          percent={hoursPct}
                          strokeColor={{ '0%': getProgressColor(hoursPct), '100%': getProgressColor(hoursPct) }}
                          trailColor="rgba(0,0,0,0.08)"
                          strokeWidth={10}
                          showInfo={false}
                          style={{ marginBottom: 6 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatHours(eq.operatingHours)} &nbsp;/&nbsp; {formatHours(eq.maxOperatingHours)}
                        </Text>
                      </div>
                    </Col>

                    {/* Right — maintenance schedule */}
                    <Col xs={24} lg={12}>
                      <SectionHeader icon={<CalendarOutlined />} title="Lịch bảo dưỡng" color="#b45309" />
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                        {[
                          { label: 'Bảo trì lần cuối',   value: formatDate(eq.lastMaintenanceDate),  overdue: false },
                          { label: 'Bảo trì tiếp theo',  value: formatDate(eq.nextMaintenanceDate),  overdue: new Date(eq.nextMaintenanceDate) < new Date('2026-04-17') },
                          { label: 'Đại tu lần cuối',    value: formatDate(eq.lastOverhaulDate),     overdue: false },
                          { label: 'Đại tu tiếp theo',   value: formatDate(eq.nextOverhaulDate),     overdue: new Date(eq.nextOverhaulDate) < new Date('2026-04-17') },
                        ].map((row, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', padding: '9px 14px',
                            background: i % 2 === 0 ? '#fff' : '#fafbff',
                            borderBottom: i < 3 ? '1px solid #f0f2f5' : 'none',
                          }}>
                            <Text type="secondary" style={{ fontSize: 12, width: 140, flexShrink: 0 }}>{row.label}</Text>
                            <Text strong style={{ fontSize: 13, color: row.overdue ? '#dc2626' : '#1B3A5C' }}>
                              {row.overdue && <ExclamationCircleOutlined style={{ marginRight: 4, color: '#dc2626' }} />}
                              {row.value}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>

                  {eq.notes && (
                    <div style={{ marginTop: 16, padding: '14px 18px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <ExclamationCircleOutlined style={{ color: '#d97706', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                      <Text style={{ fontSize: 13, color: '#78350f' }}>{eq.notes}</Text>
                    </div>
                  )}
                </div>
              ),
            },

            /* ── TAB 2: Kế hoạch vòng đời ──────────────── */
            {
              key: 'lifecycle',
              label: (
                <Space size={6}>
                  <ClockCircleOutlined />
                  Kế hoạch vòng đời
                  <Badge count={plans.length} size="small" style={{ backgroundColor: '#1B3A5C' }} />
                </Space>
              ),
              children: (
                <div>
                  {plans.length === 0 ? (
                    <Text type="secondary">Chưa có kế hoạch vòng đời nào.</Text>
                  ) : (
                    <Timeline
                      items={plans.map(plan => {
                        const statusColor =
                          lifecyclePlanStatusConfig[plan.status]?.color === 'success' ? '#16a34a' :
                          lifecyclePlanStatusConfig[plan.status]?.color === 'processing' ? '#2563eb' :
                          lifecyclePlanStatusConfig[plan.status]?.color === 'warning' ? '#d97706' : '#9ca3af';
                        return {
                          color: statusColor,
                          dot: (
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusColor, boxShadow: `0 0 0 3px ${statusColor}33` }} />
                          ),
                          children: (
                            <div style={{ padding: '12px 16px', background: '#fff', borderRadius: 10, border: '1px solid #e8e8e8', marginBottom: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <Space size={6} wrap>
                                  <Tag color={lifecyclePhaseConfig[plan.phase]?.color} style={{ fontSize: 11, margin: 0 }}>
                                    {lifecyclePhaseConfig[plan.phase]?.label}
                                  </Tag>
                                  <Tag color={lifecyclePlanStatusConfig[plan.status]?.color} style={{ fontSize: 11, margin: 0 }}>
                                    {lifecyclePlanStatusConfig[plan.status]?.label}
                                  </Tag>
                                </Space>
                                <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap', marginLeft: 8 }}>
                                  {formatDate(plan.plannedStartDate)} – {formatDate(plan.plannedEndDate)}
                                </Text>
                              </div>
                              <div style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500, marginBottom: 6 }}>{plan.description}</div>
                              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Dự toán: <strong style={{ color: '#1B3A5C' }}>{plan.estimatedCost} tr</strong>
                                </Text>
                                {plan.actualCost && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Thực tế: <strong style={{ color: plan.actualCost > plan.estimatedCost ? '#dc2626' : '#16a34a' }}>{plan.actualCost} tr</strong>
                                  </Text>
                                )}
                              </div>
                            </div>
                          ),
                        };
                      })}
                    />
                  )}
                </div>
              ),
            },

            /* ── TAB 3: Quản lý cấu hình ────────────────── */
            {
              key: 'config',
              label: (
                <Space size={6}>
                  <ApartmentOutlined />
                  Quản lý cấu hình
                  <Badge count={configs.length} size="small" style={{ backgroundColor: '#7c3aed' }} />
                </Space>
              ),
              children: (
                <div>
                  {configs.length === 0 ? (
                    <Text type="secondary">Chưa có thay đổi cấu hình nào.</Text>
                  ) : (
                    configs.map(cfg => (
                      <div key={cfg.id} style={{ marginBottom: 14, borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        {/* Header */}
                        <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd6fe' }}>
                          <Space size={8}>
                            <Tag color={configChangeTypeConfig[cfg.changeType]?.color} style={{ fontSize: 11, margin: 0 }}>
                              {configChangeTypeConfig[cfg.changeType]?.label}
                            </Tag>
                            <Text code style={{ fontSize: 11 }}>{cfg.version}</Text>
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(cfg.changeDate)}</Text>
                        </div>
                        {/* Body */}
                        <div style={{ padding: '12px 16px', background: '#fff' }}>
                          <div style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500, marginBottom: 8 }}>{cfg.description}</div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                            <TeamOutlined style={{ marginRight: 4, color: '#1B3A5C' }} />
                            Thực hiện: <strong>{cfg.changedBy}</strong>
                            <span style={{ margin: '0 8px', color: '#d9d9d9' }}>|</span>
                            Phê duyệt: <strong>{cfg.approvedBy}</strong>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {cfg.components.map((c, ci) => (
                              <div key={ci} style={{ padding: '5px 10px', background: '#fafafa', borderRadius: 6, border: '1px solid #e8e8e8', fontSize: 12 }}>
                                <span style={{ color: '#666' }}>{c.name}: </span>
                                <span style={{ color: '#dc2626', fontWeight: 500 }}>{c.oldValue}</span>
                                <span style={{ color: '#9ca3af', margin: '0 4px' }}>→</span>
                                <span style={{ color: '#16a34a', fontWeight: 500 }}>{c.newValue}</span>
                                {c.unit && <span style={{ color: '#9ca3af' }}> {c.unit}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ),
            },

            /* ── TAB 4: Lịch sử vận hành ────────────────── */
            {
              key: 'history',
              label: (
                <Space size={6}>
                  <HistoryOutlined />
                  Lịch sử vận hành
                  <Badge count={logs.length} size="small" style={{ backgroundColor: '#0891b2' }} />
                </Space>
              ),
              children: (
                <div>
                  {logs.length === 0 ? (
                    <Text type="secondary">Chưa có bản ghi vận hành nào.</Text>
                  ) : (
                    logs.map(log => {
                      const evCfg = operationEventTypeConfig[log.eventType];
                      const borderColor = evCfg?.color === 'red' ? '#dc2626'
                        : evCfg?.color === 'orange' ? '#d97706'
                        : evCfg?.color === 'blue' ? '#2563eb'
                        : evCfg?.color === 'green' ? '#16a34a' : '#6b7280';
                      return (
                        <div key={log.id} style={{
                          marginBottom: 10,
                          padding: '12px 16px',
                          background: '#fff',
                          borderRadius: 10,
                          border: '1px solid #e8e8e8',
                          borderLeft: `4px solid ${borderColor}`,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Tag color={evCfg?.color} style={{ fontSize: 11, margin: 0 }}>
                              {evCfg?.label}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(log.eventDate)}</Text>
                          </div>
                          <div style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500, marginBottom: 6 }}>{log.notes}</div>
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Tích lũy: <strong style={{ color: '#1B3A5C' }}>{formatHours(log.operatingHoursTotal)}</strong>
                            </Text>
                            {log.hoursThisSession > 0 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Phiên này: <strong style={{ color: '#16a34a' }}>+{log.hoursThisSession} giờ</strong>
                              </Text>
                            )}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <TeamOutlined style={{ marginRight: 3 }} />{log.operatorName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <EnvironmentOutlined style={{ marginRight: 3 }} />{log.location}
                            </Text>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ),
            },

            /* ── TAB 5: Thành phần ──────────────────────── */
            {
              key: 'components',
              label: (
                <Space size={6}>
                  <AppstoreOutlined />
                  Thành phần
                  <Badge count={components.length} size="small" style={{ backgroundColor: '#0891b2' }} />
                </Space>
              ),
              children: (
                <div>
                  {components.length === 0 ? (
                    <Text type="secondary">Chưa có dữ liệu thành phần.</Text>
                  ) : (
                    (() => {
                      const groups = [...new Set(components.map(c => c.group))];
                      return groups.map(group => {
                        const items = components.filter(c => c.group === group);
                        return (
                          <div key={group} style={{ marginBottom: 20 }}>
                            {/* Group header */}
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 14px',
                              background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
                              borderRadius: '10px 10px 0 0',
                              border: '1px solid #bae6fd',
                              borderBottom: 'none',
                            }}>
                              <AppstoreOutlined style={{ color: '#0891b2', fontSize: 13 }} />
                              <Text strong style={{ color: '#0c4a6e', fontSize: 13 }}>{group}</Text>
                              <Tag style={{ marginLeft: 'auto', background: '#0891b218', color: '#0891b2', border: '1px solid #0891b233', fontSize: 11 }}>
                                {items.length} linh kiện
                              </Tag>
                            </div>

                            {/* Component rows */}
                            <div style={{ border: '1px solid #bae6fd', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                              {/* Table header */}
                              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <Text type="secondary" style={{ fontSize: 11, flex: '2', fontWeight: 600 }}>Tên linh kiện</Text>
                                <Text type="secondary" style={{ fontSize: 11, width: 120, flexShrink: 0, fontWeight: 600 }}>Mã linh kiện</Text>
                                <Text type="secondary" style={{ fontSize: 11, width: 80, flexShrink: 0, fontWeight: 600 }}>Số lượng</Text>
                                <Text type="secondary" style={{ fontSize: 11, width: 120, flexShrink: 0, fontWeight: 600 }}>Tình trạng</Text>
                                <Text type="secondary" style={{ fontSize: 11, width: 120, flexShrink: 0, fontWeight: 600 }}>Thay thế gần nhất</Text>
                                <Text type="secondary" style={{ fontSize: 11, width: 130, flexShrink: 0, fontWeight: 600 }}>Thay thế tiếp theo</Text>
                              </div>
                              {items.map((comp, ci) => {
                                const cond = conditionConfig[comp.condition];
                                const overdue = comp.nextReplaceDate && new Date(comp.nextReplaceDate) < new Date('2026-04-17');
                                return (
                                  <div key={comp.id} style={{
                                    display: 'flex', alignItems: 'center',
                                    padding: '10px 14px',
                                    background: ci % 2 === 0 ? '#fff' : '#fafbff',
                                    borderBottom: ci < items.length - 1 ? '1px solid #f0f2f5' : 'none',
                                    gap: 0,
                                  }}>
                                    {/* Name + notes */}
                                    <div style={{ flex: '2', minWidth: 0 }}>
                                      <Text style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500 }}>{comp.name}</Text>
                                      {comp.notes && (
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block', color: '#d97706' }}>
                                          <ExclamationCircleOutlined style={{ marginRight: 3 }} />{comp.notes}
                                        </Text>
                                      )}
                                    </div>
                                    <Text style={{ fontSize: 12, width: 120, flexShrink: 0, color: '#666' }}>
                                      <code style={{ fontSize: 11, background: '#f0f2f5', padding: '1px 4px', borderRadius: 3 }}>{comp.code}</code>
                                    </Text>
                                    <Text style={{ fontSize: 13, width: 80, flexShrink: 0, color: '#1B3A5C', fontWeight: 500 }}>
                                      {comp.quantity} <span style={{ fontSize: 11, color: '#999' }}>{comp.unit}</span>
                                    </Text>
                                    <div style={{ width: 120, flexShrink: 0 }}>
                                      <Tag style={{
                                        background: `${cond.color}18`, color: cond.color,
                                        border: `1px solid ${cond.color}33`, fontSize: 11, margin: 0,
                                      }}>
                                        {cond.icon} &nbsp;{cond.label}
                                      </Tag>
                                    </div>
                                    <Text style={{ fontSize: 12, width: 120, flexShrink: 0, color: '#555' }}>
                                      {comp.replacedDate ? formatDate(comp.replacedDate) : '—'}
                                    </Text>
                                    <Text style={{ fontSize: 12, width: 130, flexShrink: 0, color: overdue ? '#dc2626' : '#1B3A5C', fontWeight: comp.nextReplaceDate ? 500 : 400 }}>
                                      {comp.nextReplaceDate
                                        ? <>{overdue && <WarningOutlined style={{ marginRight: 3, color: '#dc2626' }} />}{formatDate(comp.nextReplaceDate)}</>
                                        : <span style={{ color: '#bbb' }}>—</span>}
                                    </Text>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}

                  {/* Summary stats */}
                  {components.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                      {(['excellent','good','fair','poor'] as const).map(cond => {
                        const count = components.filter(c => c.condition === cond).length;
                        if (!count) return null;
                        const cfg = conditionConfig[cond];
                        return (
                          <div key={cond} style={{ padding: '6px 14px', borderRadius: 8, background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: cfg.color, fontSize: 13 }}>{cfg.icon}</span>
                            <Text style={{ fontSize: 12, color: cfg.color, fontWeight: 500 }}>{cfg.label}</Text>
                            <Text strong style={{ fontSize: 14, color: cfg.color }}>{count}</Text>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            },

            /* ── TAB 6: Lịch bảo trì / SC / ĐT ────────── */
            {
              key: 'schedule',
              label: (
                <Space size={6}>
                  <CalendarOutlined />
                  Lịch Bảo trì / SC / ĐT
                  <Badge count={plans.filter(p => schedulePhases.includes(p.phase as typeof schedulePhases[number])).length} size="small" style={{ backgroundColor: '#7c3aed' }} />
                </Space>
              ),
              children: (
                (() => {
                  // ── Custom Calendar ──────────────────────────
                  const DOW = ['T2','T3','T4','T5','T6','T7','CN'];
                  const startOfMonth = calendarDate.startOf('month');
                  const daysInMonth  = calendarDate.daysInMonth();
                  // Monday-first offset
                  const startDow = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1;
                  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
                  const today = dayjs();

                  const allScheduledPlans = plans.filter(p =>
                    schedulePhases.includes(p.phase as typeof schedulePhases[number])
                  ).sort((a,b) => dayjs(a.plannedStartDate).diff(dayjs(b.plannedStartDate)));

                  const selectedDayEvents = getEventsForDay(calendarDate);
                  const monthEvents = getEventsForMonth(calendarDate);

                  return (
                    <Row gutter={24}>
                      {/* ── Left: Custom Calendar ── */}
                      <Col xs={24} lg={15}>
                        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                          {/* Calendar header */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px',
                            background: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)',
                          }}>
                            <Button
                              type="text" size="small"
                              onClick={() => setCalendarDate(calendarDate.subtract(1,'month'))}
                              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >‹</Button>
                            <Text strong style={{ color: '#fff', fontSize: 15, letterSpacing: 0.3 }}>
                              Tháng {calendarDate.format('MM')} năm {calendarDate.format('YYYY')}
                            </Text>
                            <Button
                              type="text" size="small"
                              onClick={() => setCalendarDate(calendarDate.add(1,'month'))}
                              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >›</Button>
                          </div>

                          {/* Day-of-week header */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {DOW.map((d, i) => (
                              <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: i === 6 ? '#dc2626' : '#64748b' }}>
                                {d}
                              </div>
                            ))}
                          </div>

                          {/* Day cells */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: '#fff' }}>
                            {Array.from({ length: totalCells }).map((_, idx) => {
                              const dayOffset = idx - startDow;
                              const isCurrentMonth = dayOffset >= 0 && dayOffset < daysInMonth;
                              const cellDate = startOfMonth.add(dayOffset, 'day');
                              const isToday2 = cellDate.isSame(today, 'day');
                              const isSelected = cellDate.isSame(calendarDate, 'day') && isCurrentMonth;
                              const events = isCurrentMonth ? getEventsForDay(cellDate) : [];
                              const isSunday = idx % 7 === 6;

                              return (
                                <div
                                  key={idx}
                                  onClick={() => isCurrentMonth && setCalendarDate(cellDate)}
                                  style={{
                                    minHeight: 68,
                                    padding: '6px 8px',
                                    borderRight: idx % 7 < 6 ? '1px solid #f1f5f9' : 'none',
                                    borderBottom: idx < totalCells - 7 ? '1px solid #f1f5f9' : 'none',
                                    cursor: isCurrentMonth ? 'pointer' : 'default',
                                    background: isSelected ? '#eff6ff' : isToday2 ? '#fefce8' : '#fff',
                                    transition: 'background 0.15s',
                                  }}
                                >
                                  {/* Date number */}
                                  <div style={{
                                    width: 26, height: 26, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: isToday2 || isSelected ? 700 : 400,
                                    color: isToday2 ? '#fff' : isSelected ? '#1B3A5C' : isCurrentMonth ? (isSunday ? '#dc2626' : '#374151') : '#cbd5e1',
                                    background: isToday2 ? '#1B3A5C' : 'transparent',
                                    marginBottom: 4,
                                  }}>
                                    {isCurrentMonth ? cellDate.date() : ''}
                                  </div>

                                  {/* Event bars */}
                                  {events.slice(0, 2).map(ev => (
                                    <Tooltip key={ev.id} title={`${lifecyclePhaseConfig[ev.phase]?.label}: ${ev.description}`}>
                                      <div style={{
                                        fontSize: 10, fontWeight: 500, lineHeight: '16px',
                                        borderRadius: 3, padding: '0 4px',
                                        background: `${phaseCalColor[ev.phase]}22`,
                                        color: phaseCalColor[ev.phase],
                                        borderLeft: `3px solid ${phaseCalColor[ev.phase]}`,
                                        marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                        cursor: 'pointer',
                                      }}>
                                        {lifecyclePhaseConfig[ev.phase]?.label}
                                      </div>
                                    </Tooltip>
                                  ))}
                                  {events.length > 2 && (
                                    <div style={{ fontSize: 10, color: '#94a3b8', paddingLeft: 4 }}>+{events.length - 2}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Legend */}
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            {Object.entries(phaseCalColor).map(([phase, color]) => (
                              <Space key={phase} size={5}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                                <Text style={{ fontSize: 11, color: '#64748b' }}>
                                  {lifecyclePhaseConfig[phase as keyof typeof lifecyclePhaseConfig]?.label}
                                </Text>
                              </Space>
                            ))}
                          </div>
                        </div>
                      </Col>

                      {/* ── Right: Detail panel ── */}
                      <Col xs={24} lg={9}>
                        {/* Selected day events */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#7c3aed18', border: '1px solid #7c3aed33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7c3aed' }}>
                              <CalendarOutlined />
                            </div>
                            <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>
                              {calendarDate.format('DD/MM/YYYY')}
                            </Text>
                            {selectedDayEvents.length > 0 && (
                              <Badge count={selectedDayEvents.length} style={{ backgroundColor: '#7c3aed' }} />
                            )}
                          </div>

                          {selectedDayEvents.length === 0 ? (
                            <div style={{ padding: '20px 16px', textAlign: 'center', background: '#fafbff', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>Không có sự kiện ngày này</Text>
                            </div>
                          ) : (
                            selectedDayEvents.map(plan => {
                              const color = phaseCalColor[plan.phase] || '#1B3A5C';
                              return (
                                <div key={plan.id} style={{ marginBottom: 8, borderRadius: 10, border: `1px solid ${color}30`, borderLeft: `4px solid ${color}`, background: `${color}06`, padding: '10px 14px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Tag style={{ background: `${color}20`, color, border: `1px solid ${color}40`, fontSize: 10, margin: 0 }}>
                                      {lifecyclePhaseConfig[plan.phase]?.label}
                                    </Tag>
                                    <Tag color={lifecyclePlanStatusConfig[plan.status]?.color} style={{ fontSize: 10, margin: 0 }}>
                                      {lifecyclePlanStatusConfig[plan.status]?.label}
                                    </Tag>
                                  </div>
                                  <Text style={{ fontSize: 12, color: '#1B3A5C', fontWeight: 500, display: 'block', marginBottom: 4 }}>{plan.description}</Text>
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    {formatDate(plan.plannedStartDate)} – {formatDate(plan.plannedEndDate)}
                                    &nbsp;·&nbsp; <strong>{plan.estimatedCost} tr</strong>
                                  </Text>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Month summary */}
                        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'linear-gradient(135deg,#f8faff,#eff4ff)', borderRadius: 10, border: '1px solid #dbeafe', display: 'flex', justifyContent: 'space-around' }}>
                          {Object.entries(phaseCalColor).map(([phase, color]) => {
                            const cnt = monthEvents.filter(p => p.phase === phase).length;
                            if (!cnt) return null;
                            return (
                              <div key={phase} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color }}>{cnt}</div>
                                <Text style={{ fontSize: 10, color: '#64748b' }}>{lifecyclePhaseConfig[phase as keyof typeof lifecyclePhaseConfig]?.label}</Text>
                              </div>
                            );
                          })}
                          {monthEvents.length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>Không có sự kiện</Text>}
                        </div>

                        {/* All plans timeline */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                            <ToolOutlined style={{ color: '#1B3A5C', fontSize: 12 }} />
                            <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>
                              Tất cả kế hoạch ({allScheduledPlans.length})
                            </Text>
                          </div>
                          <Timeline
                            items={allScheduledPlans.map(plan => {
                              const color = phaseCalColor[plan.phase] || '#1B3A5C';
                              const isDone = plan.status === 'completed';
                              return {
                                color,
                                dot: isDone
                                  ? <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 14 }} />
                                  : <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: `2px solid ${color}88` }} />,
                                children: (
                                  <div style={{ paddingBottom: 6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                      <Tag style={{ fontSize: 10, margin: 0, background: `${color}18`, color, border: `1px solid ${color}33` }}>
                                        {lifecyclePhaseConfig[plan.phase]?.label}
                                      </Tag>
                                      <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(plan.plannedStartDate)}</Text>
                                    </div>
                                    <Text style={{ fontSize: 12, color: '#374151' }}>{plan.description}</Text>
                                  </div>
                                ),
                              };
                            })}
                          />
                        </div>
                      </Col>
                    </Row>
                  );
                })()
              ),
            },
          ]}
        />
      </Card>

      {/* ── Footer actions ──────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/equipment')}>
          Quay lại danh sách
        </Button>
        {isVongDoi && (
          <Button type="primary" icon={<EditOutlined />}>
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetail;
