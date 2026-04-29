import React from 'react';
import { Row, Col, Card, Typography, Tag, Space, Progress, Badge, Button, List, Avatar } from 'antd';
import {
  DatabaseOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined,
  AlertOutlined, RightOutlined, ToolOutlined, ApartmentOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Line, Pie, Column } from '@ant-design/charts';
import { equipmentList } from '../../data/equipment';
import { lifecyclePlans } from '../../data/lifecyclePlans';
import { alerts } from '../../data/alerts';
import { useUser } from '../../contexts/UserContext';
import {
  equipmentStatusConfig, equipmentTypeConfig,
  lifecyclePlanStatusConfig, lifecyclePhaseConfig,
  alertSeverityConfig, getLifespanPercent, getHoursPercent, getProgressColor, formatDate,
} from '../../utils/format';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  // ─── KPI calculations ───────────────────────────────────────────
  const total = equipmentList.length;
  const inService = equipmentList.filter(e => e.status === 'in_service').length;
  const inProgress = equipmentList.filter(e => ['maintenance', 'repair', 'overhaul'].includes(e.status)).length;
  const nearEndOfLife = equipmentList.filter(e => {
    const lifePct = getLifespanPercent(e.yearReceived, e.designLifespan);
    const hoursPct = getHoursPercent(e.operatingHours, e.maxOperatingHours);
    return lifePct >= 85 || hoursPct >= 85;
  }).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const unread = alerts.filter(a => !a.isRead).length;

  // ─── Chart data ─────────────────────────────────────────────────
  const statusDist = [
    { type: 'Đang vận hành', value: inService },
    { type: 'Đang bảo trì/SC/ĐT', value: inProgress },
    { type: 'Dự trữ', value: equipmentList.filter(e => e.status === 'storage').length },
    { type: 'Đã thanh lý', value: equipmentList.filter(e => e.status === 'decommission').length },
    { type: 'Tiếp nhận mới', value: equipmentList.filter(e => e.status === 'new').length },
  ].filter(d => d.value > 0);

  const typeDist: Record<string, number> = {};
  equipmentList.forEach(e => {
    const label = equipmentTypeConfig[e.type]?.label || e.type;
    typeDist[label] = (typeDist[label] || 0) + 1;
  });
  const typeChartData = Object.entries(typeDist).map(([type, count]) => ({ type, count }));

  const conditionDist = [
    { type: 'Tốt', value: equipmentList.filter(e => e.technicalCondition === 'excellent').length },
    { type: 'Khá', value: equipmentList.filter(e => e.technicalCondition === 'good').length },
    { type: 'Trung bình', value: equipmentList.filter(e => e.technicalCondition === 'fair').length },
    { type: 'Yếu', value: equipmentList.filter(e => e.technicalCondition === 'poor').length },
    { type: 'Nguy hiểm', value: equipmentList.filter(e => e.technicalCondition === 'critical').length },
  ].filter(d => d.value > 0);

  const statusTrendData = [
    { month: 'T11/2025', status: 'Đang vận hành',    value: 7 },
    { month: 'T11/2025', status: 'Bảo trì/SC/ĐT',    value: 6 },
    { month: 'T11/2025', status: 'Dự trữ / Khác',     value: 2 },
    { month: 'T12/2025', status: 'Đang vận hành',    value: 8 },
    { month: 'T12/2025', status: 'Bảo trì/SC/ĐT',    value: 5 },
    { month: 'T12/2025', status: 'Dự trữ / Khác',     value: 2 },
    { month: 'T1/2026',  status: 'Đang vận hành',    value: 8 },
    { month: 'T1/2026',  status: 'Bảo trì/SC/ĐT',    value: 6 },
    { month: 'T1/2026',  status: 'Dự trữ / Khác',     value: 1 },
    { month: 'T2/2026',  status: 'Đang vận hành',    value: 9 },
    { month: 'T2/2026',  status: 'Bảo trì/SC/ĐT',    value: 5 },
    { month: 'T2/2026',  status: 'Dự trữ / Khác',     value: 1 },
    { month: 'T3/2026',  status: 'Đang vận hành',    value: 10 },
    { month: 'T3/2026',  status: 'Bảo trì/SC/ĐT',    value: 4 },
    { month: 'T3/2026',  status: 'Dự trữ / Khác',     value: 1 },
    { month: 'T4/2026',  status: 'Đang vận hành',    value: inService },
    { month: 'T4/2026',  status: 'Bảo trì/SC/ĐT',    value: inProgress },
    { month: 'T4/2026',  status: 'Dự trữ / Khác',     value: equipmentList.filter(e => e.status === 'storage' || e.status === 'decommission').length },
  ];

  // ─── Upcoming lifecycle events ──────────────────────────────────
  const upcoming = lifecyclePlans
    .filter(p => ['approved', 'in_progress', 'draft'].includes(p.status))
    .sort((a, b) => new Date(a.plannedEndDate).getTime() - new Date(b.plannedEndDate).getTime())
    .slice(0, 6);

  // ─── Critical equipment list ────────────────────────────────────
  const criticalEquipment = equipmentList
    .filter(e => {
      const lifePct = getLifespanPercent(e.yearReceived, e.designLifespan);
      const hoursPct = getHoursPercent(e.operatingHours, e.maxOperatingHours);
      return lifePct >= 85 || hoursPct >= 85 || e.status === 'storage';
    })
    .slice(0, 5);

  // ─── Stat card colors ────────────────────────────────────────────
  const statCards = [
    {
      title: 'Tổng trang thiết bị',
      value: total,
      unit: 'thiết bị',
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <DatabaseOutlined />,
    },
    {
      title: 'Đang vận hành',
      value: inService,
      unit: 'thiết bị',
      gradient: 'linear-gradient(135deg, #166534, #16a34a)',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Đang bảo trì / SC / ĐT',
      value: inProgress,
      unit: 'thiết bị',
      gradient: 'linear-gradient(135deg, #7c3aed, #9333ea)',
      icon: <ToolOutlined />,
    },
    {
      title: 'Gần hết tuổi thọ',
      value: nearEndOfLife,
      unit: 'thiết bị',
      gradient: 'linear-gradient(135deg, #b45309, #d97706)',
      icon: <WarningOutlined />,
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: '#0a1628',
              }}>VĐ</div>
            </div>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              Tổng quan Quản lý Vòng đời Sản phẩm (SDLC)
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, display: 'block' }}>
              Doanh nghiệp A — Cập nhật: 15/04/2026
            </Text>
          </div>

        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</span>
                  {card.unit && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 6 }}>{card.unit}</span>}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Row gutter={[16, 16]}>
        {/* Line chart: status trend */}
        <Col xs={24} lg={16}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#D4A84318', border: '1px solid #D4A84333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#D4A843' }}><ApartmentOutlined /></div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Xu hướng trạng thái vận hành (6 tháng)</Text>
              </Space>
            }
            styles={{ body: { padding: '8px 16px 16px' } }}
          >
            <Line
              data={statusTrendData}
              xField="month"
              yField="value"
              colorField="status"
              height={260}
              style={{ lineWidth: 2 }}
              point={{ size: 5, style: { fillOpacity: 1 } }}
              axis={{
                x: { labelFontSize: 11 },
                y: { labelFormatter: (v: number) => `${v} TB`, title: 'Số thiết bị' },
              }}
              legend={{ position: 'bottom' }}
              scale={{ color: { range: ['#52c41a', '#722ed1', '#1890ff'] } }}
            />
          </Card>
        </Col>

        {/* Pie chart: technical condition */}
        <Col xs={24} lg={8}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}><DatabaseOutlined /></div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Phân bố tình trạng kỹ thuật</Text>
              </Space>
            }
            styles={{ body: { padding: '8px 16px 16px' } }}
          >
            <Pie
              data={conditionDist}
              angleField="value"
              colorField="type"
              radius={0.85}
              innerRadius={0.6}
              height={260}
              legend={{ position: 'bottom' }}
              label={{
                text: (d: { type: string; value: number }) => `${d.type}: ${d.value}`,
                position: 'outside',
                fontSize: 12,
              }}
              scale={{ color: { range: ['#52c41a', '#1890ff', '#faad14', '#ff7a00', '#ff4d4f'] } }}
            />
          </Card>
        </Col>

        {/* Column chart: by type */}
        <Col span={24}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}><DatabaseOutlined /></div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Phân bố theo loại sản phẩm</Text>
              </Space>
            }
            styles={{ body: { padding: '8px 16px 16px' } }}
          >
            <Column
              data={typeChartData}
              xField="type"
              yField="count"
              height={260}
              style={{ fill: '#1B3A5C', fillOpacity: 0.85, radius: 4 }}
              label={{
                text: (d: { count: number }) => String(d.count),
                position: 'top',
                fontSize: 12,
                fill: '#1B3A5C',
              }}
              axis={{ x: { labelFontSize: 12 } }}
            />
          </Card>
        </Col>

        {/* Critical equipment */}
        <Col span={24}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#ff4d4f18', border: '1px solid #ff4d4f33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#ff4d4f' }}><WarningOutlined /></div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Thiết bị cần chú ý</Text>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            {criticalEquipment.map((eq, i) => {
              const lifePct = getLifespanPercent(eq.yearReceived, eq.designLifespan);
              const hoursPct = getHoursPercent(eq.operatingHours, eq.maxOperatingHours);
              const maxPct = Math.max(lifePct, hoursPct);
              return (
                <div
                  key={eq.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < criticalEquipment.length - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => navigate('/equipment')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{eq.name}</Text>
                    <Tag color={equipmentStatusConfig[eq.status]?.color} style={{ fontSize: 10 }}>
                      {equipmentStatusConfig[eq.status]?.label}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: '#999', marginBottom: 3 }}>Tuổi thọ: {lifePct}%</div>
                      <Progress percent={lifePct} size="small" showInfo={false} strokeColor={getProgressColor(lifePct)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: '#999', marginBottom: 3 }}>Giờ hoạt động: {hoursPct}%</div>
                      <Progress percent={hoursPct} size="small" showInfo={false} strokeColor={getProgressColor(hoursPct)} />
                    </div>
                  </div>
                  {maxPct >= 90 && (
                    <div style={{ marginTop: 6 }}>
                      <Tag color="error" icon={<ClockCircleOutlined />} style={{ fontSize: 10 }}>
                        Cần xử lý khẩn cấp
                      </Tag>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </Col>

        {/* Alerts */}
        <Col span={24}>
          <Card
            className="db-chart-card"
            title={
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#dc262618', border: '1px solid #dc262633', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#dc2626' }}><AlertOutlined /></div>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Cảnh báo cần xử lý</Text>
                  {unread > 0 && <Badge count={unread} size="small" />}
                </Space>
                <Button type="link" size="small" onClick={() => navigate('/monitoring')} style={{ padding: 0 }}>
                  Xem tất cả <RightOutlined />
                </Button>
              </Space>
            }
            styles={{ body: { padding: '4px 0' } }}
          >
            <List
              dataSource={alerts.filter(a => !a.isRead).slice(0, 5)}
              renderItem={item => (
                <List.Item
                  style={{ padding: '10px 16px', cursor: 'pointer' }}
                  onClick={() => navigate('/monitoring')}
                  className={`alert-card ${item.severity}`}
                >
                  <Space align="start" style={{ width: '100%' }}>
                    <ExclamationCircleOutlined style={{ color: alertSeverityConfig[item.severity].color, fontSize: 14, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', lineHeight: '18px' }}>
                        {item.equipmentName}
                      </div>
                      <div style={{ fontSize: 11, color: '#666', lineHeight: '16px', marginTop: 2 }}>
                        {item.message.length > 70 ? item.message.substring(0, 70) + '...' : item.message}
                      </div>
                    </div>
                    <Tag color={item.severity === 'critical' ? 'error' : item.severity === 'warning' ? 'warning' : 'processing'} style={{ fontSize: 10 }}>
                      {alertSeverityConfig[item.severity].label}
                    </Tag>
                  </Space>
                </List.Item>
              )}
              locale={{ emptyText: 'Không có cảnh báo mới' }}
            />
          </Card>
        </Col>

        {/* Upcoming lifecycle plans */}
        <Col span={24}>
          <Card
            className="db-chart-card"
            title={
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#7c3aed18', border: '1px solid #7c3aed33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7c3aed' }}><ClockCircleOutlined /></div>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Kế hoạch vòng đời sắp tới</Text>
                </Space>
                <Button type="link" size="small" onClick={() => navigate('/lifecycle-plans')} style={{ padding: 0 }}>
                  Xem tất cả <RightOutlined />
                </Button>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            {upcoming.map((plan, i) => {
              const now = new Date('2026-04-15');
              const end = new Date(plan.plannedEndDate);
              const daysLeft = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0;
              return (
                <div
                  key={plan.id}
                  style={{
                    padding: '12px 20px',
                    borderBottom: i < upcoming.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => navigate('/lifecycle-plans')}
                >
                  <Avatar
                    size={36}
                    style={{
                      background: lifecyclePhaseConfig[plan.phase]?.color === 'success' ? '#52c41a' : '#7c3aed',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {plan.equipmentCode.substring(0, 2)}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {plan.equipmentName}
                    </div>
                    <Space size={4} style={{ marginTop: 2 }}>
                      <Tag color={lifecyclePhaseConfig[plan.phase]?.color} style={{ fontSize: 10, margin: 0 }}>
                        {lifecyclePhaseConfig[plan.phase]?.label}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {plan.responsibleDeptName}
                      </Text>
                    </Space>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Tag color={lifecyclePlanStatusConfig[plan.status]?.color} style={{ fontSize: 10 }}>
                      {lifecyclePlanStatusConfig[plan.status]?.label}
                    </Tag>
                    <div style={{ fontSize: 11, marginTop: 4, color: isOverdue ? '#ff4d4f' : daysLeft <= 30 ? '#faad14' : '#666' }}>
                      {isOverdue ? `Quá hạn ${Math.abs(daysLeft)} ngày` : `Còn ${daysLeft} ngày`}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>

      {/* Footer context */}
      <div style={{ marginTop: 16, textAlign: 'center', padding: '12px 0' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Xin chào, {currentUser.name} ({currentUser.position}) — Doanh nghiệp A | Hệ thống Quản lý vòng đời v1.0
        </Text>
      </div>
    </div>
  );
};

export default Dashboard;
