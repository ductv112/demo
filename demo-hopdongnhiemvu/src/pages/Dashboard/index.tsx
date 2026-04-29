import React, { useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Progress,
  Typography,
  Space,
  Badge,
  Tooltip,
  Empty,
} from 'antd';
import {
  SolutionOutlined,
  FileProtectOutlined,
  DollarOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  RightOutlined,
  FundOutlined,
  AuditOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ToolOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Line, Pie, Column } from '@ant-design/charts';
import { missions } from '../../data/missions';
import { contracts, workItems } from '../../data/contracts';
import { alerts, monthlyProgress2026 } from '../../data/alerts';
import { getDepartmentShortName } from '../../data/departments';
import { dataAsOf, factContracts } from '../../data/reports';
import {
  formatCurrency,
  formatNumber,
  missionStatusConfig,
  contractStatusConfig,
  missionTypeConfig,
  alertSeverityConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Alert } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isPlanning, isDepartment, isDirector } = useUser();
  const deptId = currentUser.departmentId;

  // ─── Filter data by role ──────────────────────────────────────
  const filteredWorkItems = useMemo(
    () => isDepartment ? workItems.filter(w => w.assignedUnit === deptId) : workItems,
    [isDepartment, deptId],
  );

  const filteredContracts = useMemo(() => {
    if (!isDepartment) return contracts;
    const relevantContractIds = new Set(filteredWorkItems.map(w => w.contractId));
    return contracts.filter(c => relevantContractIds.has(c.id));
  }, [isDepartment, filteredWorkItems]);

  const filteredMissions = useMemo(() => {
    if (!isDepartment) return missions;
    return missions.filter(m => m.assignedDepartment === deptId);
  }, [isDepartment, deptId]);

  const filteredAlerts = useMemo(
    () => isDepartment ? alerts.filter(a => a.departmentId === deptId) : alerts,
    [isDepartment, deptId],
  );

  // ─── Stat computations ──────────────────────────────────────────
  const executingContracts = filteredContracts.filter(c => c.status === 'executing');
  const totalContractValue = filteredContracts.reduce((s, c) => s + c.contractValue, 0);
  const unreadAlerts = filteredAlerts.filter(a => !a.isRead).length;
  const pendingApprovalCount = isDirector
    ? contracts.filter(c => c.status === 'pending_approval').length
    : 0;

  // Overall progress across all work items
  const overallProgress = useMemo(() => {
    if (filteredWorkItems.length === 0) return 0;
    const totalPlanned = filteredWorkItems.reduce((s, w) => s + w.plannedCost, 0);
    if (totalPlanned === 0) return 0;
    const weightedProgress = filteredWorkItems.reduce(
      (s, w) => s + (w.progress * w.plannedCost) / totalPlanned, 0,
    );
    return Math.round(weightedProgress);
  }, [filteredWorkItems]);

  // ─── Aggregations ──────────────────────────────────────────────
  // Missions by type for Pie chart
  const missionsByType = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMissions.forEach(m => {
      const label = missionTypeConfig[m.missionType]?.label || m.missionType;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([type, value]) => ({ type, value }));
  }, [filteredMissions]);

  // Contract value by partner unit for Column chart
  const contractValueByPartner = useMemo(() => {
    if (isDepartment) return [];
    const map: Record<string, number> = {};
    filteredContracts.forEach(c => {
      map[c.partnerUnit] = (map[c.partnerUnit] || 0) + c.contractValue;
    });
    return Object.entries(map).map(([unit, value]) => ({
      unit: unit.length > 15 ? unit.substring(0, 15) + '...' : unit,
      value,
    }));
  }, [filteredContracts, isDepartment]);

  // Line chart data
  const lineData = useMemo(() => {
    const result: { month: string; value: number; category: string }[] = [];
    monthlyProgress2026.forEach(m => {
      result.push({ month: m.month, value: m.planned, category: 'Kế hoạch' });
      if (m.actual > 0) {
        result.push({ month: m.month, value: m.actual, category: 'Thực tế' });
      }
    });
    return result;
  }, []);

  // Latest alerts
  const latestAlerts = useMemo(
    () => [...filteredAlerts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [filteredAlerts],
  );

  // Recent contracts
  const recentContracts = useMemo(
    () => [...filteredContracts]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [filteredContracts],
  );

  // ─── Alert severity styles ────────────────────────────────────
  const severityStyles: Record<Alert['severity'], { bg: string; border: string; icon: React.ReactNode; dotColor: string }> = {
    critical: {
      bg: '#fff2f0', border: '#ffccc7',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      dotColor: '#ff4d4f',
    },
    warning: {
      bg: '#fffbe6', border: '#ffe58f',
      icon: <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />,
      dotColor: '#faad14',
    },
    info: {
      bg: '#f0f7ff', border: '#bae0ff',
      icon: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 18 }} />,
      dotColor: '#1890ff',
    },
  };

  // ─── Alert feed item renderer ────────────────────────────────
  const renderAlertItem = (alert: Alert) => {
    const style = severityStyles[alert.severity];
    const config = alertSeverityConfig[alert.severity];
    return (
      <div
        key={alert.id}
        className="db-feed-item"
        style={{
          display: 'flex', gap: 12, padding: '12px 16px',
          background: '#fff',
          borderBottom: '1px solid #f5f5f5',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row justify="space-between" align="top">
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: '18px' }}>
                {alert.title}
                {!alert.isRead && (
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: style.dotColor, marginLeft: 6, verticalAlign: 'middle',
                  }} />
                )}
              </Text>
            </Col>
            <Col flex="none">
              <Tag
                color={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'processing'}
                style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}
              >
                {config.label}
              </Tag>
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2, lineHeight: '16px' }}>
            {alert.description}
          </Text>
          <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#bbb' }}>
              <ClockCircleOutlined style={{ marginRight: 3 }} />
              {alert.createdAt}
            </Text>
            {!isDepartment && alert.departmentId && (
              <Text style={{ fontSize: 10, color: '#bbb' }}>
                {getDepartmentShortName(alert.departmentId)}
              </Text>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Contract feed item renderer ─────────────────────────────
  const renderContractItem = (c: typeof contracts[0]) => {
    const statusConf = contractStatusConfig[c.status];
    return (
      <div
        key={c.id}
        className="db-feed-item"
        style={{
          display: 'flex', gap: 12, padding: '12px 16px',
          borderBottom: '1px solid #f5f5f5',
        }}
      >
        <div style={{
          width: 56, minHeight: 56, borderRadius: 10,
          background: `${colors.navy}08`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          padding: '4px 2px',
        }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: colors.navy, lineHeight: '18px' }}>
            {formatCurrency(c.contractValue)}
          </Text>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row justify="space-between" align="top">
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: '18px' }}>
                {c.name}
              </Text>
            </Col>
            <Col flex="none">
              <Tag color={statusConf.color} style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                {statusConf.label}
              </Tag>
            </Col>
          </Row>
          <div style={{ marginTop: 2, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 11, color: '#666' }}>
              {c.partnerUnit}
            </Text>
          </div>
          <div style={{ marginTop: 3, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 10, color: '#999' }}>
              {c.code}
            </Text>
            <Text style={{ fontSize: 10, color: '#bbb' }}>
              <ClockCircleOutlined style={{ marginRight: 3 }} />
              {c.updatedAt}
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: '#d9d9d9' }}>
          <RightOutlined style={{ fontSize: 10 }} />
        </div>
      </div>
    );
  };

  // ─── Stat cards ───────────────────────────────────────────────
  const statCardsData = [
    {
      title: isDepartment ? `Nhiệm vụ của ${currentUser.departmentName}` : 'Tổng nhiệm vụ',
      value: filteredMissions.length,
      unit: 'NV',
      icon: <SolutionOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: `${filteredMissions.filter(m => m.status === 'executing').length} đang thực hiện`,
    },
    {
      title: 'HĐ đang thực hiện',
      value: executingContracts.length,
      unit: 'HĐ',
      icon: <FileProtectOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: `${filteredContracts.length} tổng số hợp đồng`,
    },
    {
      title: 'Tổng giá trị HĐ',
      value: totalContractValue,
      unit: 'tr',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: `Tạm ứng: ${formatCurrency(filteredContracts.reduce((s, c) => s + c.advancePayment, 0))}`,
    },
    {
      title: 'Cảnh báo',
      value: unreadAlerts,
      unit: '',
      icon: <WarningOutlined />,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: isDirector
        ? `${pendingApprovalCount} chờ phê duyệt`
        : `${filteredAlerts.filter(a => a.severity === 'critical').length} nghiêm trọng`,
    },
  ];

  // ─── Chart configs (@ant-design/charts v2) ─────────────────────
  const lineConfig: any = {
    data: lineData,
    xField: 'month',
    yField: 'value',
    colorField: 'category',
    shapeField: 'smooth',
    height: 300,
    style: { lineWidth: 2.5 },
    scale: { color: { range: [colors.navy, colors.gold] } },
    axis: {
      y: { labelFormatter: (v: number) => `${v}%` },
    },
    legend: {
      color: {
        position: 'top',
        layout: { justifyContent: 'flex-end' },
        maxRows: 1,
        itemMarker: 'smooth',
      },
    },
    point: { shapeField: 'circle', sizeField: 4 },
    padding: [8, 16, 8, 16],
  };

  const pieConfig: any = {
    data: missionsByType,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.55,
    height: 300,
    scale: {
      color: { range: ['#1890ff', '#7c3aed', '#059669', '#d97706'] },
    },
    label: {
      text: (d: any) => {
        const total = missionsByType.reduce((s, i) => s + i.value, 0);
        return `${((d.value / total) * 100).toFixed(0)}%`;
      },
      style: { fontSize: 11, fontWeight: 600, fill: '#fff' },
      position: 'inside',
    },
    tooltip: {
      title: '',
      items: [{ channel: 'y', valueFormatter: (v: number) => `${v} nhiệm vụ` }],
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

  const columnConfig: any = {
    data: contractValueByPartner,
    xField: 'unit',
    yField: 'value',
    height: 300,
    color: colors.navy,
    scale: { color: { range: [colors.navy] } },
    axis: {
      y: { labelFormatter: (v: number) => formatCurrency(v) },
    },
    style: { maxWidth: 40, fill: colors.navy, radiusTopLeft: 4, radiusTopRight: 4 },
    tooltip: {
      title: '',
      items: [{ channel: 'y', valueFormatter: (v: number) => `${formatNumber(v)} triệu` }],
    },
    padding: [8, 16, 8, 16],
  };

  // ─── Work items progress for department view ──────────────────
  const renderWorkItemProgress = () => {
    if (filteredWorkItems.length === 0) {
      return <Empty description="Không có hạng mục công việc" style={{ padding: 40 }} />;
    }
    return (
      <div style={{ padding: '8px 0' }}>
        {filteredWorkItems.map(w => {
          const pct = w.progress;
          const strokeColor = pct >= 90 ? colors.success : pct >= 60 ? colors.info : pct >= 30 ? colors.warning : colors.danger;
          return (
            <div key={w.id} style={{ marginBottom: 12, padding: '0 16px' }}>
              <Row justify="space-between">
                <Col flex="auto">
                  <Text strong style={{ fontSize: 12 }}>{w.name}</Text>
                  <Text style={{ fontSize: 10, color: '#999', marginLeft: 8 }}>{w.code}</Text>
                </Col>
                <Col>
                  <Text style={{ fontSize: 11, color: '#999' }}>
                    {formatCurrency(w.actualCost)} / {formatCurrency(w.plannedCost)}
                  </Text>
                </Col>
              </Row>
              <Progress percent={pct} strokeColor={strokeColor} size="small" format={p => `${p}%`} />
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <>
      <div style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <RiseOutlined style={{ marginRight: 8 }} />
            {isDepartment
              ? `Tổng quan HĐ & DA - ${currentUser.departmentName}`
              : 'Tổng quan Hợp đồng & Dự án - Năm 2026'
            }
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isDepartment
                ? `Cập nhật đến tháng 4/2026 | ${currentUser.departmentName}`
                : 'Cập nhật đến tháng 4/2026 | Doanh nghiệp A'
              }
            </Text>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f0f7ff', border: '1px solid #bae0ff',
              borderRadius: 6, padding: '2px 10px',
            }}>
              <SyncOutlined style={{ fontSize: 11, color: '#1890ff' }} />
              <Text style={{ fontSize: 11, color: '#1890ff' }}>
                Dữ liệu BI cập nhật lúc{' '}
                <strong>{dataAsOf.replace('T', ' ').substring(0, 16)}</strong>
              </Text>
            </div>
          </div>
        </div>

        {/* Row 1: Stat Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statCardsData.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <div className="db-stat-card" style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="db-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, color: 'rgba(255,255,255,0.1)',
                  lineHeight: 1,
                }}>
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: card.iconBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: '#fff',
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                    {card.title}
                  </div>
                </div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                  {card.unit === 'tr' ? formatNumber(card.value) : card.value}
                  {card.unit && (
                    <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{card.unit}</span>
                  )}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>
                  {card.sub}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Row 2: Gauge + Line chart */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={6}>
            <Card
              className="db-chart-card"
              styles={{ body: {
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', padding: '24px 16px',
              }}}
              style={{ height: '100%' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14,
                }}>
                  <FundOutlined />
                </div>
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>Tiến độ tổng thể</Text>
              </div>
              <Progress
                type="dashboard"
                percent={overallProgress}
                strokeColor={{ '0%': colors.navy, '100%': colors.gold }}
                strokeWidth={10}
                size={140}
                format={(pct) => (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: colors.navy }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: '#999' }}>Hoàn thành</div>
                  </div>
                )}
              />
              {/* Breakdown */}
              <div style={{ width: '100%', marginTop: 20 }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <div className="db-mini-stat" style={{ background: '#f0f7ff' }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.navy, display: 'block' }}>
                        {filteredWorkItems.filter(w => w.status === 'completed').length}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#999' }}>Hoàn thành</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="db-mini-stat" style={{ background: '#fff7e6' }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.gold, display: 'block' }}>
                        {filteredWorkItems.filter(w => w.status === 'in_progress').length}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#999' }}>Đang thực hiện</Text>
                    </div>
                  </Col>
                </Row>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <div className="db-mini-stat" style={{ background: '#f6f6f6' }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: '#666', display: 'block' }}>
                        {filteredWorkItems.filter(w => w.status === 'pending').length}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#999' }}>Chờ thực hiện</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="db-mini-stat" style={{ background: '#f0f7ff' }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: colors.navy, display: 'block' }}>
                        {filteredWorkItems.length}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#999' }}>Tổng hạng mục</Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={18}>
            <Card
              className="db-chart-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14,
                  }}>
                    <FundOutlined />
                  </div>
                  <span style={{ color: colors.navy, fontWeight: 600 }}>Tiến độ hàng tháng: Kế hoạch vs Thực tế</span>
                </div>
              }
            >
              <Line {...lineConfig} />
            </Card>
          </Col>
        </Row>

        {/* Row 3: Pie + Column / WorkItem progress */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={12}>
            <Card
              className="db-chart-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14,
                  }}>
                    <PieChartOutlined />
                  </div>
                  <span style={{ color: colors.navy, fontWeight: 600 }}>Nhiệm vụ theo loại</span>
                </div>
              }
            >
              {missionsByType.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <Empty description="Chưa có dữ liệu" style={{ padding: 40 }} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            {isDepartment ? (
              <Card
                className="db-chart-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14,
                    }}>
                      <ToolOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Tiến độ hạng mục công việc</span>
                    <Tag color="blue" style={{ marginLeft: 4 }}>{filteredWorkItems.length} hạng mục</Tag>
                  </div>
                }
                styles={{ body: { padding: 0 } }}
              >
                {renderWorkItemProgress()}
              </Card>
            ) : (
              <Card
                className="db-chart-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14,
                    }}>
                      <BarChartOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Giá trị HĐ theo đơn vị đặt hàng</span>
                  </div>
                }
              >
                {contractValueByPartner.length > 0 ? (
                  <Column {...columnConfig} />
                ) : (
                  <Empty description="Chưa có dữ liệu" style={{ padding: 40 }} />
                )}
              </Card>
            )}
          </Col>
        </Row>

        {/* Row 3b: Cost variance snapshot — directors and planning only */}
        {!isDepartment && (
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24}>
              <Card
                className="db-chart-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14,
                    }}>
                      <DollarOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Biến động chi phí theo hợp đồng</span>
                    <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>
                      (nguồn OLAP · {dataAsOf.replace('T', ' ').substring(0, 16)})
                    </span>
                  </div>
                }
                styles={{ body: { padding: '8px 0 4px' } }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f5f7fa' }}>
                        {['Hợp đồng', 'Dự toán', 'Thực tế', 'Biến động', '%', 'Tiến độ TH', 'Tiến độ KH'].map(h => (
                          <th key={h} style={{
                            padding: '8px 12px', textAlign: h === 'Hợp đồng' ? 'left' : 'right',
                            color: colors.navy, fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {factContracts.map((fc, i) => {
                        const isOver = fc.costVariance > 0;
                        const varColor = isOver ? colors.danger : colors.success;
                        return (
                          <tr
                            key={fc.contractId}
                            style={{
                              background: i % 2 === 0 ? '#fff' : '#fafafa',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                          >
                            <td style={{ padding: '8px 12px' }}>
                              <div style={{ fontWeight: 600, color: colors.navy, fontSize: 12 }}>
                                {fc.contractCode}
                              </div>
                              <div style={{ fontSize: 10, color: '#888', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {fc.contractName}
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {fc.plannedCost} tr
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {fc.actualCost} tr
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', color: varColor, fontWeight: 600 }}>
                              {isOver ? '+' : ''}{fc.costVariance} tr
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', color: varColor }}>
                              {isOver ? '+' : ''}{fc.costVariancePct.toFixed(1)}%
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <span style={{
                                color: fc.overallProgressPct >= fc.expectedProgressPct ? colors.success : colors.warning,
                                fontWeight: 600,
                              }}>
                                {fc.overallProgressPct}%
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', color: '#666' }}>
                              {fc.expectedProgressPct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Row 4: Alerts + Recent contracts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card
              className="db-chart-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14,
                  }}>
                    <WarningOutlined />
                  </div>
                  <span style={{ color: colors.navy, fontWeight: 600 }}>Cảnh báo gần đây</span>
                  <Badge
                    count={unreadAlerts}
                    style={{ backgroundColor: colors.danger }}
                  />
                </div>
              }
              styles={{ body: { padding: 0 } }}
            >
              {latestAlerts.length > 0 ? (
                <>
                  {latestAlerts.map(renderAlertItem)}
                  {filteredAlerts.length > 5 && (
                    <div
                      className="db-feed-item"
                      style={{
                        textAlign: 'center', padding: '10px 16px',
                        borderTop: '1px solid #f0f0f0',
                      }}
                      onClick={() => navigate('/progress-tracking')}
                    >
                      <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>
                        Xem tất cả {filteredAlerts.length} cảnh báo <RightOutlined style={{ fontSize: 10 }} />
                      </Text>
                    </div>
                  )}
                </>
              ) : (
                <Empty description="Không có cảnh báo" style={{ padding: 32 }} />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              className="db-chart-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14,
                  }}>
                    <AuditOutlined />
                  </div>
                  <span style={{ color: colors.navy, fontWeight: 600 }}>
                    {isDepartment ? 'Hợp đồng liên quan' : 'Hợp đồng gần đây'}
                  </span>
                  <Badge
                    count={recentContracts.length}
                    style={{ backgroundColor: colors.warning }}
                  />
                </div>
              }
              styles={{ body: { padding: 0 } }}
            >
              {recentContracts.length > 0 ? (
                <>
                  {recentContracts.map(renderContractItem)}
                  {filteredContracts.length > 5 && (
                    <div
                      className="db-feed-item"
                      style={{
                        textAlign: 'center', padding: '10px 16px',
                        borderTop: '1px solid #f0f0f0',
                      }}
                      onClick={() => navigate('/contracts')}
                    >
                      <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>
                        Xem tất cả {filteredContracts.length} hợp đồng <RightOutlined style={{ fontSize: 10 }} />
                      </Text>
                    </div>
                  )}
                </>
              ) : (
                <Empty description="Không có hợp đồng" style={{ padding: 32 }} />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Dashboard;
