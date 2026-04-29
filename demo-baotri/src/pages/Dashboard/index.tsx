import React, { useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Badge,
  Table,
} from 'antd';
import {
  ToolOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  AlertOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Column, Pie, Bar, Line } from '@ant-design/charts';
import { equipmentList } from '../../data/equipment';
import { scheduledWorkOrders, repairRequests } from '../../data/workOrders';
import { alerts } from '../../data/alerts';
import { maintenancePlans } from '../../data/maintenancePlans';
import { maintenanceKPIs, teamPerformances } from '../../data/history';
import { maintenanceTeams } from '../../data/staff';
import { useUser } from '../../contexts/UserContext';
import {
  formatDate,
  formatNumber,
  workOrderStatusConfig,
  alertSeverityConfig,
  equipmentStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { MonitoringAlert } from '../../types';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { currentUser, isDepartment, isDirector } = useUser();

  // ─── KPI calculations ──────────────────────────────────────────
  const operationalCount = useMemo(
    () => equipmentList.filter((e) => e.status === 'operational').length,
    []
  );

  const inProgressPlans = useMemo(
    () => maintenancePlans.filter((p) => p.status === 'in_progress').length,
    []
  );

  const pendingRepairs = useMemo(
    () => repairRequests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length,
    []
  );

  const unresolvedAlerts = useMemo(
    () => alerts.filter((a) => !a.isResolved).length,
    []
  );

  // ─── Hero banner mini stats ────────────────────────────────────
  const avgMTBF = useMemo(() => {
    const total = maintenanceKPIs.reduce((s, k) => s + k.mtbf, 0);
    return Math.round(total / maintenanceKPIs.length);
  }, []);

  const avgCompliance = useMemo(() => {
    const total = maintenanceKPIs.reduce((s, k) => s + k.complianceRate, 0);
    return Math.round(total / maintenanceKPIs.length);
  }, []);

  // ─── Welcome message by role ──────────────────────────────────
  const welcomeMessage = useMemo(() => {
    if (isDirector) return 'Tổng quan tình hình bảo trì toàn Doanh nghiệp';
    if (isDepartment) return `Tình hình bảo trì - ${currentUser.departmentName}`;
    return 'Quản lý & Giám sát Bảo trì Thiết bị';
  }, [isDirector, isDepartment, currentUser.departmentName]);

  const welcomeSub = useMemo(() => {
    if (isDirector) return 'Doanh nghiệp A - Tổng công ty';
    if (isDepartment) return `${currentUser.position} | ${currentUser.departmentName}`;
    return `${currentUser.position} | Phòng Kỹ thuật - Doanh nghiệp A`;
  }, [isDirector, isDepartment, currentUser]);

  // ─── Stat cards config ─────────────────────────────────────────
  const statCardsData = [
    {
      title: 'Thiết bi dang van hanh',
      displayTitle: 'Thiết bị đang vận hành',
      value: operationalCount,
      total: equipmentList.length,
      icon: <ToolOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      sub: `/ ${equipmentList.length} thiết bị`,
    },
    {
      title: 'Kế hoạch đang thực hiện',
      displayTitle: 'Kế hoạch đang thực hiện',
      value: inProgressPlans,
      total: maintenancePlans.length,
      icon: <CalendarOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      sub: `/ ${maintenancePlans.length} kế hoạch`,
    },
    {
      title: 'Yêu cầu sửa chữa',
      displayTitle: 'Yêu cầu sửa chữa',
      value: pendingRepairs,
      total: repairRequests.length,
      icon: <ExperimentOutlined />,
      gradient: 'linear-gradient(135deg, #D4A843 0%, #f0d890 100%)',
      sub: `cần xử lý`,
    },
    {
      title: 'Cảnh báo chưa xử lý',
      displayTitle: 'Cảnh báo chưa xử lý',
      value: unresolvedAlerts,
      total: alerts.length,
      icon: <AlertOutlined />,
      gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
      sub: `/ ${alerts.length} cảnh báo`,
    },
  ];

  // ─── Column chart data: Bao tri theo thang ────────────────────
  const monthlyMaintenanceData = useMemo(() => {
    const months = ['Th01', 'Th02', 'Th03', 'Th04', 'Th05', 'Th06'];
    const periodicCounts = [3, 4, 5, 3, 4, 2];
    const correctiveCounts = [1, 2, 3, 2, 1, 1];
    const result: { month: string; value: number; category: string }[] = [];
    months.forEach((m, i) => {
      result.push({ month: m, value: periodicCounts[i], category: 'Định kỳ' });
      result.push({ month: m, value: correctiveCounts[i], category: 'Sửa chữa' });
    });
    return result;
  }, []);

  const columnConfig: any = {
    data: monthlyMaintenanceData,
    xField: 'month',
    yField: 'value',
    colorField: 'category',
    group: true,
    height: 300,
    scale: { color: { range: [colors.navy, colors.gold] } },
    axis: {
      y: { labelFormatter: (v: number) => `${v}` },
    },
    legend: {
      color: {
        position: 'top',
        layout: { justifyContent: 'flex-end' },
        maxRows: 1,
      },
    },
    style: { maxWidth: 30 },
    padding: [8, 16, 8, 16],
  };

  // ─── Pie chart data: Trang thai thiet bi ──────────────────────
  const equipmentStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    equipmentList.forEach((eq) => {
      const label = equipmentStatusConfig[eq.status]?.label || eq.status;
      statusMap[label] = (statusMap[label] || 0) + 1;
    });
    return Object.entries(statusMap).map(([type, value]) => ({ type, value }));
  }, []);

  const pieConfig: any = {
    data: equipmentStatusData,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.55,
    height: 300,
    scale: {
      color: { range: [colors.success, colors.warning, colors.danger, '#6b7280'] },
    },
    label: {
      text: (d: any) => {
        const total = equipmentStatusData.reduce((s, i) => s + i.value, 0);
        return `${((d.value / total) * 100).toFixed(0)}%`;
      },
      style: { fontSize: 11, fontWeight: 600, fill: '#fff' },
      position: 'inside',
    },
    tooltip: {
      title: '',
      items: [{ channel: 'y', valueFormatter: (v: number) => `${v} thiết bị` }],
    },
    legend: {
      color: {
        position: 'bottom',
        layout: { justifyContent: 'center' },
        maxRows: 2,
        itemSpacing: 16,
      },
    },
    interaction: { elementHighlight: true },
    padding: [8, 8, 8, 8],
  };

  // ─── Upcoming work orders ─────────────────────────────────────
  const upcomingWorkOrders = useMemo(
    () =>
      scheduledWorkOrders
        .filter((wo) => wo.status === 'pending' || wo.status === 'in_progress')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 5),
    []
  );

  const workOrderColumns = [
    {
      title: 'Mã lệnh',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (text: string) => (
        <Text strong style={{ fontSize: 12, color: colors.navy }}>{text}</Text>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      ellipsis: true,
      render: (text: string) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Ngày dự kiến',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 110,
      render: (text: string) => (
        <Text style={{ fontSize: 12 }}>{formatDate(text)}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const config = workOrderStatusConfig[status as keyof typeof workOrderStatusConfig];
        return config ? <Tag color={config.color}>{config.label}</Tag> : status;
      },
    },
  ];

  // ─── Recent alerts ────────────────────────────────────────────
  const latestAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    []
  );

  const severityStyles: Record<
    string,
    { bg: string; border: string; icon: React.ReactNode; dotColor: string }
  > = {
    critical: {
      bg: '#fff2f0',
      border: '#ffccc7',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      dotColor: '#ff4d4f',
    },
    warning: {
      bg: '#fffbe6',
      border: '#ffe58f',
      icon: <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />,
      dotColor: '#faad14',
    },
    info: {
      bg: '#f0f7ff',
      border: '#bae0ff',
      icon: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 18 }} />,
      dotColor: '#1890ff',
    },
  };

  const renderAlertItem = (alert: MonitoringAlert) => {
    const style = severityStyles[alert.severity] || severityStyles.info;
    const config = alertSeverityConfig[alert.severity];
    return (
      <div
        key={alert.id}
        className="db-feed-item"
        style={{
          display: 'flex',
          gap: 12,
          padding: '12px 16px',
          background: '#fff',
          borderBottom: '1px solid #f5f5f5',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row justify="space-between" align="top">
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: '18px' }}>
                {alert.equipmentName}
                {!alert.isRead && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: style.dotColor,
                      marginLeft: 6,
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </Text>
            </Col>
            <Col flex="none">
              <Tag
                color={
                  alert.severity === 'critical'
                    ? 'error'
                    : alert.severity === 'warning'
                      ? 'warning'
                      : 'processing'
                }
                style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}
              >
                {config.label}
              </Tag>
            </Col>
          </Row>
          <Text
            type="secondary"
            style={{ fontSize: 11, display: 'block', marginTop: 2, lineHeight: '16px' }}
          >
            {alert.message}
          </Text>
          <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#bbb' }}>
              <ClockCircleOutlined style={{ marginRight: 3 }} />
              {alert.timestamp}
            </Text>
            {alert.isResolved && (
              <Tag color="success" style={{ fontSize: 9, lineHeight: '16px', margin: 0 }}>
                Đã xử lý
              </Tag>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ═══ Hero Banner ═══ */}
      <div className="hero-banner animate-fade-in animate-delay-1">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title
                level={4}
                style={{ color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}
              >
                <DashboardOutlined style={{ marginRight: 8 }} />
                {welcomeMessage}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, display: 'block' }}>
                {welcomeSub}
              </Text>
            </Col>
            <Col>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                Cập nhật: 02/04/2026
              </Text>
            </Col>
          </Row>

          {/* Glass stat mini cards */}
          <Row gutter={[12, 12]} style={{ marginTop: 20 }}>
            <Col xs={12} sm={6}>
              <div className="glass-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ToolOutlined style={{ color: colors.gold, fontSize: 18 }} />
                  <div>
                    <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: '24px' }}>
                      {equipmentList.length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                      Tổng thiết bị
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="glass-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined style={{ color: colors.gold, fontSize: 18 }} />
                  <div>
                    <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: '24px' }}>
                      {maintenanceTeams.length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                      Đội bảo trì
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="glass-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: colors.gold, fontSize: 18 }} />
                  <div>
                    <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: '24px' }}>
                      {avgCompliance}%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                      Tuân thủ KH
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="glass-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FieldTimeOutlined style={{ color: colors.gold, fontSize: 18 }} />
                  <div>
                    <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: '24px' }}>
                      {avgMTBF}h
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                      MTBF trung bình
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* ═══ Row 1: 4 KPI Stat Cards ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div
              className={`db-stat-card animate-fade-in animate-delay-${idx + 2}`}
              style={{
                background: card.gradient,
                borderRadius: 14,
                padding: '14px 16px 12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background icon */}
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 64,
                  color: 'rgba(255,255,255,0.1)',
                  lineHeight: 1,
                }}
              >
                {card.icon}
              </div>
              {/* Title row with small icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff',
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.displayTitle}
                </div>
              </div>
              {/* Value */}
              <div
                style={{
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: '30px',
                  letterSpacing: '-0.5px',
                }}
              >
                {formatNumber(card.value)}{' '}
                <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>
                  {card.sub}
                </span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ═══ Row 2: Column Chart + Pie Chart ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-5"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <CalendarOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>
                  Tình hình bảo trì theo tháng
                </span>
              </div>
            }
          >
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-5"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <ToolOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>
                  Trạng thái thiết bị
                </span>
              </div>
            }
          >
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* ═══ Row 3: MTBF theo thiết bị + Hiệu suất đội ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={12}>
          <Card className="db-chart-card animate-fade-in animate-delay-5"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #059669, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
                  <FieldTimeOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>Độ tin cậy thiết bị — TG trung bình giữa các lần hỏng (giờ)</span>
              </div>
            }>
            <Bar
              data={maintenanceKPIs.map(k => ({
                equipment: k.equipmentName.replace('Hệ thống monitoring ', '').replace('Sản phẩm chủ lực ', '').replace('Hệ thống ', '').replace(' số 01', ''),
                mtbf: k.mtbf,
              })).sort((a, b) => a.mtbf - b.mtbf)}
              xField="equipment"
              yField="mtbf"
              height={300}
              colorField="mtbf"
              scale={{ color: { range: ['#ff4d4f', '#faad14', '#52c41a', '#1B3A5C'] } }}
              label={{
                text: (d: { mtbf: number }) => `${d.mtbf}h`,
                position: 'right',
                style: { fontSize: 11, fontWeight: 600 },
              }}
              axis={{
                y: { labelFormatter: (v: number) => `${v}h` },
              }}
              style={{ maxWidth: 24, radiusTopRight: 4, radiusBottomRight: 4 }}
              padding={[8, 40, 8, 8]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #D4A843, #f0d890)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a1628', fontSize: 14 }}>
                  <TeamOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>Hiệu suất đội bảo trì</span>
              </div>
            }>
            <Column
              data={teamPerformances.flatMap(t => [
                { team: t.teamName.replace('Đội bảo trì ', ''), metric: 'Tuân thủ KH', value: t.complianceRate },
                { team: t.teamName.replace('Đội bảo trì ', ''), metric: 'Chất lượng', value: t.qualityScore },
              ])}
              xField="team"
              yField="value"
              colorField="metric"
              group={true}
              height={300}
              scale={{ color: { range: [colors.navy, colors.gold] } }}
              axis={{ y: { labelFormatter: (v: number) => `${v}%` } }}
              label={{
                text: (d: { value: number }) => `${d.value}%`,
                position: 'inside',
                style: { fontSize: 10, fontWeight: 600, fill: '#fff' },
              }}
              legend={{
                color: { position: 'top', layout: { justifyContent: 'flex-end' }, maxRows: 1 },
              }}
              style={{ maxWidth: 28, radiusTopLeft: 4, radiusTopRight: 4 }}
              padding={[8, 16, 8, 16]}
            />
          </Card>
        </Col>
      </Row>

      {/* ═══ Row 4: Line chart — Chi phí & Thời gian dừng ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={24}>
          <Card className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0891b2, #67e8f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
                  <DashboardOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>Xu hướng chi phí bảo trì & thời gian dừng thiết bị</span>
              </div>
            }>
            <Line
              data={[
                { month: 'Th10', metric: 'Chi phí BT (tr)', value: 42 },
                { month: 'Th11', metric: 'Chi phí BT (tr)', value: 38 },
                { month: 'Th12', metric: 'Chi phí BT (tr)', value: 55 },
                { month: 'Th01', metric: 'Chi phí BT (tr)', value: 48 },
                { month: 'Th02', metric: 'Chi phí BT (tr)', value: 62 },
                { month: 'Th03', metric: 'Chi phí BT (tr)', value: 45 },
                { month: 'Th10', metric: 'Thời gian dừng (giờ)', value: 18 },
                { month: 'Th11', metric: 'Thời gian dừng (giờ)', value: 12 },
                { month: 'Th12', metric: 'Thời gian dừng (giờ)', value: 28 },
                { month: 'Th01', metric: 'Thời gian dừng (giờ)', value: 22 },
                { month: 'Th02', metric: 'Thời gian dừng (giờ)', value: 35 },
                { month: 'Th03', metric: 'Thời gian dừng (giờ)', value: 15 },
              ]}
              xField="month"
              yField="value"
              colorField="metric"
              height={280}
              scale={{ color: { range: [colors.navy, colors.danger] } }}
              point={{ shapeField: 'circle', sizeField: 3 }}
              style={{ lineWidth: 2.5 }}
              interaction={{ tooltip: { marker: true } }}
              axis={{ y: { labelFormatter: (v: number) => `${v}` } }}
              legend={{ color: { position: 'top', layout: { justifyContent: 'flex-end' }, maxRows: 1 } }}
              padding={[8, 16, 8, 16]}
            />
          </Card>
        </Col>
      </Row>

      {/* ═══ Row 5: Upcoming Work Orders + Alert Feed ═══ */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <CalendarOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>
                  Công việc sắp tới
                </span>
                <Tag color="blue">{upcomingWorkOrders.length} lệnh</Tag>
              </div>
            }
          >
            <Table
              dataSource={upcomingWorkOrders}
              columns={workOrderColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 480 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <WarningOutlined />
                </div>
                <span style={{ color: colors.navy, fontWeight: 600 }}>
                  Cảnh báo gần đây
                </span>
                <Badge
                  count={alerts.filter((a) => !a.isRead).length}
                  style={{ backgroundColor: colors.danger }}
                />
              </div>
            }
            bodyStyle={{ padding: 0 }}
          >
            {latestAlerts.map(renderAlertItem)}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
