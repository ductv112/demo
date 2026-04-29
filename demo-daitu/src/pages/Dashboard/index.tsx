import React from 'react';
import { Row, Col, Card, Typography, Tag, Table, Progress, Badge, Space, Avatar } from 'antd';
import {
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, AlertOutlined, ApartmentOutlined, DollarOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { overhaulReceptions } from '../../data/overhaulReceptions';
import { disassemblies } from '../../data/disassemblies';
import { technicalInspections } from '../../data/technicalInspections';
import { restorations } from '../../data/restorations';
import { assemblies } from '../../data/assemblies';
import { testAcceptances } from '../../data/testAcceptances';
import { traceabilityRecords } from '../../data/traceability';
import { alerts } from '../../data/alerts';
import { formatDate, overhaulOrderStatusConfig, alertSeverityConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

// ── Helpers ──────────────────────────────────────────────────────────────────

const GradientBar: React.FC<{ pct: number; color: string; height?: number }> = ({ pct, color, height = 8 }) => (
  <div style={{ height, background: '#e8f0fe', borderRadius: height / 2, overflow: 'hidden' }}>
    <div style={{ width: `${Math.max(pct, 0)}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 0.6s ease' }} />
  </div>
);

// ── SVG Donut ─────────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[]; centerLabel?: string }> = ({ segments, centerLabel }) => {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const R = 54, CX = 70, CY = 70, SW = 18;
  const circ = 2 * Math.PI * R;
  let cumPct = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={140} height={140} style={{ flexShrink: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f2f5" strokeWidth={SW} />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dash = pct * circ;
          const offset = -(cumPct * circ) + circ * 0.25; // start from top
          cumPct += pct;
          return (
            <circle key={i} cx={CX} cy={CY} r={R} fill="none"
              stroke={seg.color} strokeWidth={SW}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          );
        })}
        <text x={CX} y={CY - 8} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: colors.navy }}>{total}</text>
        <text x={CX} y={CY + 10} textAnchor="middle" style={{ fontSize: 11, fill: '#888' }}>{centerLabel ?? 'Tổng'}</text>
      </svg>
      <div style={{ flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
            <Text style={{ fontSize: 12, flex: 1, color: '#444' }}>{seg.label}</Text>
            <Text strong style={{ fontSize: 13, color: colors.navy }}>{seg.value}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const total = overhaulOrders.length;
  const inProgress = overhaulOrders.filter(o => o.status === 'in_progress').length;
  const completed = overhaulOrders.filter(o => ['completed', 'closed'].includes(o.status)).length;
  const delayed = overhaulOrders.filter(o => o.status === 'in_progress' && o.progress < 50 && o.plannedEndDate < '2026-04-10').length;
  const pending = overhaulOrders.filter(o => ['draft', 'pending_approval', 'approved'].includes(o.status)).length;

  const kpiCards = [
    { title: 'Tổng lệnh đại tu',  value: total,      unit: 'lệnh', icon: <FileTextOutlined />,          gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', sub: 'Năm 2026' },
    { title: 'Đang thực hiện',    value: inProgress,  unit: 'lệnh', icon: <ToolOutlined />,               gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', sub: `${Math.round(inProgress / total * 100)}% tổng số` },
    { title: 'Hoàn thành',        value: completed,   unit: 'lệnh', icon: <CheckCircleOutlined />,        gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', sub: 'Đã bàn giao' },
    { title: 'Chậm tiến độ',      value: delayed,     unit: 'lệnh', icon: <ExclamationCircleOutlined />,  gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', sub: 'Cần xử lý' },
    { title: 'Chờ thực hiện',     value: pending,     unit: 'lệnh', icon: <ClockCircleOutlined />,        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', sub: 'Đã duyệt / Chờ duyệt' },
  ];

  // ── Chart 1: Trạng thái lệnh đại tu ──────────────────────────────────────
  const statusSegments = [
    { label: 'Nháp',            value: overhaulOrders.filter(o => o.status === 'draft').length,            color: '#d9d9d9' },
    { label: 'Chờ duyệt',       value: overhaulOrders.filter(o => o.status === 'pending_approval').length, color: '#faad14' },
    { label: 'Đã duyệt',        value: overhaulOrders.filter(o => o.status === 'approved').length,         color: '#1890ff' },
    { label: 'Đang thực hiện',  value: overhaulOrders.filter(o => o.status === 'in_progress').length,      color: '#1B3A5C' },
    { label: 'Hoàn thành',      value: overhaulOrders.filter(o => o.status === 'completed').length,        color: '#16a34a' },
    { label: 'Đã đóng',         value: overhaulOrders.filter(o => o.status === 'closed').length,           color: '#555' },
  ].filter(d => d.value > 0);

  // ── Chart 2: Phân bổ theo phân xưởng ─────────────────────────────────────
  const workshopRows = [
    { label: 'PX1 – Sửa chữa Radar',    value: overhaulOrders.filter(o => o.workshopId === 'PX1').length, color: 'linear-gradient(90deg, #1B3A5C, #2d5a8e)' },
    { label: 'PX2 – Sửa chữa Tên lửa', value: overhaulOrders.filter(o => o.workshopId === 'PX2').length, color: 'linear-gradient(90deg, #0891b2, #06b6d4)' },
    { label: 'PX3 – Cơ khí',            value: overhaulOrders.filter(o => o.workshopId === 'PX3').length, color: 'linear-gradient(90deg, #7c3aed, #9d5ff7)' },
  ];
  const maxWorkshop = Math.max(...workshopRows.map(w => w.value), 1);

  // ── Chart 3: Phễu quy trình ───────────────────────────────────────────────
  const STEP_COLORS = ['#1B3A5C','#0891b2','#7c3aed','#d97706','#16a34a','#0891b2','#7c3aed','#D4A843'];
  const pipelineSteps = [
    { label: 'Tiếp nhận',        count: overhaulReceptions.filter(r => !['delivered','cancelled'].includes(r.status)).length },
    { label: 'Lệnh đại tu',      count: overhaulOrders.filter(o => ['approved','in_progress'].includes(o.status)).length },
    { label: 'Tháo rã',          count: disassemblies.filter(d => d.status !== 'completed').length },
    { label: 'Kiểm tra KT',      count: technicalInspections.filter(i => i.status !== 'completed').length },
    { label: 'Phục hồi',         count: restorations.filter(r => r.status !== 'completed').length },
    { label: 'Lắp ráp',          count: assemblies.filter(a => a.status !== 'completed').length },
    { label: 'Thử nghiệm',       count: testAcceptances.filter(t => t.status !== 'delivered').length },
    { label: 'Truy vết',         count: traceabilityRecords.filter(t => t.status !== 'completed').length },
  ];
  const maxPipeline = Math.max(...pipelineSteps.map(s => s.count), 1);

  // ── Chart 4: Chi phí đại tu ───────────────────────────────────────────────
  const costRows = overhaulOrders
    .filter(o => o.plannedCost)
    .map(o => ({
      code: o.code,
      name: o.equipmentName,
      planned: o.plannedCost ?? 0,
      actual: (o as typeof o & { actualCost?: number }).actualCost ?? 0,
    }))
    .sort((a, b) => b.planned - a.planned);
  const maxCost = Math.max(...costRows.map(r => r.planned), 1);

  // ── Chart 5: Phân loại linh kiện ─────────────────────────────────────────
  const totalInsp = technicalInspections.length;
  const dispositionStats = [
    { label: 'Sử dụng được', count: technicalInspections.filter(i => i.disposition === 'serviceable').length, color: '#16a34a', bg: '#f6ffed', border: '#b7eb8f' },
    { label: 'Phục hồi',     count: technicalInspections.filter(i => i.disposition === 'restore').length,     color: '#d97706', bg: '#fffbe6', border: '#ffe58f' },
    { label: 'Thay thế',     count: technicalInspections.filter(i => i.disposition === 'replace').length,     color: '#dc2626', bg: '#fff2f0', border: '#ffa39e' },
  ];

  // ── Table ─────────────────────────────────────────────────────────────────
  const recentOrders = [...overhaulOrders].filter(o => o.status === 'in_progress').sort((a, b) => b.progress - a.progress);
  const unreadAlerts = alerts.filter(a => !a.isRead && !a.isResolved);

  const orderColumns = [
    { title: 'Mã lệnh', dataIndex: 'code', key: 'code', width: 140, render: (v: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{v}</Text> },
    { title: 'Thiết bị', dataIndex: 'equipmentName', key: 'equipmentName', width: 200 },
    { title: 'Phân xưởng', dataIndex: 'workshopName', key: 'workshopName', width: 240, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'Tiến độ', key: 'progress', width: 160,
      render: (_: unknown, record: typeof overhaulOrders[0]) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Progress percent={record.progress} size="small" strokeColor={record.progress < 40 ? '#ff4d4f' : record.progress < 70 ? '#faad14' : '#52c41a'} />
          <Text style={{ fontSize: 11, color: '#999' }}>Hạn: {formatDate(record.plannedEndDate)}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => {
        const cfg = overhaulOrderStatusConfig[s as keyof typeof overhaulOrderStatusConfig];
        return <Tag color={cfg?.color}>{cfg?.label}</Tag>;
      },
    },
  ];

  // ── Card header helper ────────────────────────────────────────────────────
  const cardTitle = (icon: React.ReactNode, label: string, iconColor: string) => (
    <Space size={10}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${iconColor}18`, border: `1px solid ${iconColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: iconColor }}>
        {icon}
      </div>
      <Text strong style={{ color: colors.navy, fontSize: 14 }}>{label}</Text>
    </Space>
  );

  return (
    <div>
      {/* Hero */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ToolOutlined style={{ fontSize: 24, color: '#D4A843' }} />
            </div>
            <div>
              <Title level={4} style={{ color: '#fff', marginBottom: 2, fontWeight: 700, letterSpacing: '-0.3px' }}>Quản lý Đại tu — Nhà máy Z119</Title>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Quân chủng Phòng không Không quân · Năm 2026</Text>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {kpiCards.map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14, height: 130 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 64, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>{card.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 4 }}>{card.unit}</span>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{card.sub}</Text>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Row gutter={[16, 16]}>

        {/* ── Row 1: Trạng thái + Phân xưởng ── */}
        <Col xs={24} lg={10}>
          <Card className="db-chart-card" title={cardTitle(<FileTextOutlined />, 'Trạng thái lệnh đại tu', colors.navy)} style={{ height: '100%' }}>
            <DonutChart segments={statusSegments} centerLabel="lệnh" />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card className="db-chart-card" title={cardTitle(<ToolOutlined />, 'Phân bổ theo phân xưởng', '#0891b2')} style={{ height: '100%' }}>
            <div style={{ paddingTop: 8 }}>
              {workshopRows.map((row, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{row.label}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Text strong style={{ fontSize: 20, color: colors.navy, lineHeight: 1 }}>{row.value}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>lệnh</Text>
                    </div>
                  </div>
                  <div style={{ height: 12, background: '#e8f0fe', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${(row.value / maxWorkshop) * 100}%`, height: '100%', background: row.color, borderRadius: 6, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* ── Row 2: Phễu quy trình ── */}
        <Col span={24}>
          <Card className="db-chart-card" title={cardTitle(<ApartmentOutlined />, 'Phễu quy trình — Hồ sơ đang xử lý tại mỗi bước', colors.navy)}>
            <Row gutter={[0, 0]}>
              {pipelineSteps.map((step, i) => (
                <Col xs={12} sm={6} md={3} key={i}>
                  <div style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < pipelineSteps.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${STEP_COLORS[i]}15`, border: `2px solid ${STEP_COLORS[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 12, fontWeight: 700, color: STEP_COLORS[i] }}>
                      {i + 1}
                    </div>
                    <Text style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 8, lineHeight: 1.3 }}>{step.label}</Text>
                    <div style={{ height: 6, background: '#f0f2f5', borderRadius: 3, margin: '0 8px 8px' }}>
                      <div style={{ width: `${(step.count / maxPipeline) * 100}%`, height: '100%', background: STEP_COLORS[i], borderRadius: 3 }} />
                    </div>
                    <Text strong style={{ fontSize: 22, color: step.count > 0 ? STEP_COLORS[i] : '#ccc', lineHeight: 1 }}>{step.count}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* ── Row 3: Chi phí + Phân loại linh kiện ── */}
        <Col xs={24} lg={14}>
          <Card className="db-chart-card" title={cardTitle(<DollarOutlined />, 'Chi phí kế hoạch đại tu (triệu đồng)', '#d97706')}>
            <div style={{ paddingTop: 4 }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <Space size={6}><div style={{ width: 12, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #1B3A5C, #2d5a8e)' }} /><Text style={{ fontSize: 11, color: '#666' }}>Kế hoạch</Text></Space>
                <Space size={6}><div style={{ width: 12, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #D4A843, #f0d890)' }} /><Text style={{ fontSize: 11, color: '#666' }}>Thực tế</Text></Space>
              </div>
              {costRows.map((row, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>
                      <Text style={{ color: colors.navy, fontWeight: 600 }}>{row.code}</Text>
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>{row.name}</Text>
                    </Text>
                    <Text strong style={{ fontSize: 12, color: colors.navy }}>{row.planned} tr</Text>
                  </div>
                  <div style={{ height: 7, background: '#e8f0fe', borderRadius: 4, marginBottom: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(row.planned / maxCost) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #1B3A5C, #2d5a8e)', borderRadius: 4 }} />
                  </div>
                  {row.actual > 0 && (
                    <div style={{ height: 5, background: '#fef9e7', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(row.actual / maxCost) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #D4A843, #f0d890)', borderRadius: 3 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="db-chart-card" title={cardTitle(<CheckCircleOutlined />, 'Phân loại linh kiện kiểm tra', '#16a34a')} style={{ height: '100%' }}>
            <div style={{ paddingTop: 8 }}>
              {/* Total */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text strong style={{ fontSize: 36, color: colors.navy, lineHeight: 1 }}>{totalInsp}</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>linh kiện đã kiểm tra</Text></div>
              </div>
              {/* Stat rows */}
              {dispositionStats.map((stat, i) => (
                <div key={i} style={{ padding: '12px 14px', background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: stat.color }}>{stat.label}</Text>
                    <Space size={4}>
                      <Text strong style={{ fontSize: 18, color: stat.color, lineHeight: 1 }}>{stat.count}</Text>
                      <Text style={{ fontSize: 11, color: stat.color, opacity: 0.7 }}>({totalInsp > 0 ? Math.round(stat.count / totalInsp * 100) : 0}%)</Text>
                    </Space>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.6)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${totalInsp > 0 ? (stat.count / totalInsp) * 100 : 0}%`, height: '100%', background: stat.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* ── Active orders table ── */}
        <Col span={24}>
          <Card title={cardTitle(<ToolOutlined />, 'Lệnh đại tu đang thực hiện', colors.navy)} className="db-chart-card" style={{ marginBottom: 0 }}>
            <Table dataSource={recentOrders} columns={orderColumns} rowKey="id" size="small" pagination={false} scroll={{ x: 800 }} />
          </Card>
        </Col>

        {/* ── Alerts ── */}
        <Col span={24}>
          <Card title={
            <Space>
              {cardTitle(<AlertOutlined />, 'Cảnh báo & Thông báo', '#ff4d4f')}
              <Badge count={unreadAlerts.length} />
            </Space>
          } className="db-chart-card">
            {unreadAlerts.length === 0 ? (
              <Text type="secondary">Không có cảnh báo mới</Text>
            ) : (
              <div>
                {unreadAlerts.map(alert => (
                  <div key={alert.id} style={{ padding: '12px 16px', marginBottom: 8, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer' }}>
                    <Row align="middle" justify="space-between">
                      <Col flex="auto">
                        <Space size={8}>
                          <Avatar size={24} style={{ background: alert.severity === 'critical' ? '#ff4d4f' : alert.severity === 'warning' ? '#faad14' : '#1890ff', fontSize: 11 }}>
                            {alert.severity === 'critical' ? '!' : alert.severity === 'warning' ? '⚠' : 'i'}
                          </Avatar>
                          <div>
                            <Text strong style={{ fontSize: 13 }}>{alert.title}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{alert.description}</Text>
                          </div>
                        </Space>
                      </Col>
                      <Col>
                        <Tag color={alertSeverityConfig[alert.severity].color === '#ff4d4f' ? 'error' : alert.severity === 'warning' ? 'warning' : 'processing'}>
                          {alertSeverityConfig[alert.severity].label}
                        </Tag>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default Dashboard;
