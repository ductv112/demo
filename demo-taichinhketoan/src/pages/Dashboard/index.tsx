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
  DollarOutlined,
  FundOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BankOutlined,
  RiseOutlined,
  ProjectOutlined,
  RightOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { costPlans } from '../../data/costPlans';
import { allocations2026 } from '../../data/allocations';
import { paymentRequests } from '../../data/paymentRequests';
import { alerts, monthlySpending2026 } from '../../data/alerts';
import { getDepartmentShortName } from '../../data/departments';
import {
  formatCurrency,
  formatNumber,
  categoryTypeConfig,
  alertSeverityConfig,
  paymentStatusConfig,
} from '../../utils/format';
import { tasks2026 } from '../../data/tasks';
import { colors } from '../../theme/themeConfig';
import type { Alert, PaymentRequest, CategoryType, BudgetAllocation } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

import { Line, Pie, Column } from '@ant-design/charts';

// Dashboard styles now in App.css

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isDepartment } = useUser();
  const deptId = currentUser.departmentId;

  // ─── Filter data by role ──────────────────────────────────────
  const deptAllocations = useMemo(
    () => isDepartment ? allocations2026.filter(a => a.departmentId === deptId) : allocations2026,
    [isDepartment, deptId]
  );
  const deptPayments = useMemo(
    () => isDepartment ? paymentRequests.filter(p => p.departmentId === deptId) : paymentRequests,
    [isDepartment, deptId]
  );
  const deptAlerts = useMemo(
    () => isDepartment ? alerts.filter(a => a.departmentId === deptId) : alerts,
    [isDepartment, deptId]
  );

  // ─── Current plan data ──────────────────────────────────────────
  const currentPlan = costPlans.find((p) => p.year === 2026)!;
  const prevPlan = costPlans.find((p) => p.year === 2025);

  // Budget numbers: department-scoped or global
  const totalBudget = isDepartment
    ? deptAllocations.reduce((s, a) => s + a.totalAllocated, 0)
    : currentPlan.totalBudget;
  const spent = isDepartment
    ? deptAllocations.reduce((s, a) => s + a.spent, 0)
    : currentPlan.spentBudget;
  const committed = deptAllocations.reduce((s, a) => s + a.committed, 0);
  const remaining = totalBudget - spent - committed;
  const executionRate = totalBudget > 0
    ? parseFloat(((spent / totalBudget) * 100).toFixed(1))
    : 0;

  // Year-over-year deltas (only for global view)
  const prevTotal = prevPlan?.totalBudget ?? 0;
  const prevSpent = prevPlan?.spentBudget ?? 0;
  const totalDelta = !isDepartment && prevTotal > 0 ? ((currentPlan.totalBudget - prevTotal) / prevTotal) * 100 : null;
  const spentDelta = !isDepartment && prevSpent > 0 ? ((currentPlan.spentBudget - prevSpent) / prevSpent) * 100 : null;

  const spentPct = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  const committedPct = totalBudget > 0 ? Math.round((committed / totalBudget) * 100) : 0;
  const remainPct = totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

  // ─── Aggregations ──────────────────────────────────────────────
  const budgetByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    deptAllocations.forEach((a) => {
      map[a.categoryType] = (map[a.categoryType] || 0) + a.totalAllocated;
    });
    return Object.entries(map).map(([type, value]) => ({
      type: categoryTypeConfig[type as CategoryType]?.label || type,
      value,
      color: categoryTypeConfig[type as CategoryType]?.color,
    }));
  }, [deptAllocations]);

  const budgetByDepartment = useMemo(() => {
    if (isDepartment) return []; // not needed for department view
    const map: Record<string, { allocated: number; spent: number }> = {};
    allocations2026.forEach((a) => {
      if (!map[a.departmentId]) map[a.departmentId] = { allocated: 0, spent: 0 };
      map[a.departmentId].allocated += a.totalAllocated;
      map[a.departmentId].spent += a.spent;
    });
    return Object.entries(map).map(([id, data]) => ({
      department: getDepartmentShortName(id),
      'Phân bổ': data.allocated,
      'Đã chi': data.spent,
    }));
  }, [isDepartment]);

  // Line chart data
  const lineData = useMemo(() => {
    if (isDepartment) return []; // department has no monthly line data
    const result: { month: string; value: number; category: string }[] = [];
    monthlySpending2026.forEach((m) => {
      result.push({ month: m.month, value: m.planned, category: 'Kế hoạch' });
      if (m.actual > 0) {
        result.push({ month: m.month, value: m.actual, category: 'Thực tế' });
      }
    });
    return result;
  }, [isDepartment]);

  // ─── Payments for display ──────────────────────────────────────
  const pendingPayments = useMemo(
    () => isDepartment
      ? deptPayments // Phòng ban: hiển thị tất cả ĐNTT của phòng
      : deptPayments.filter(pr => pr.status === 'submitted' || pr.status === 'reviewing'),
    [deptPayments, isDepartment]
  );

  // ─── Latest alerts ────────────────────────────────────────────
  const latestAlerts = useMemo(
    () =>
      [...deptAlerts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [deptAlerts]
  );

  // ─── Alert feed item ──────────────────────────────────────────
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

  const renderAlertItem = (alert: Alert) => {
    const style = severityStyles[alert.severity];
    const config = alertSeverityConfig[alert.severity];
    const relatedTask = alert.relatedEntityId.startsWith('T-')
      ? tasks2026.find(t => t.id === alert.relatedEntityId) : null;
    const relatedCategoryLabel = relatedTask
      ? categoryTypeConfig[relatedTask.categoryType]?.label : null;
    return (
      <div
        key={alert.id}
        className="db-feed-item"
        style={{
          display: 'flex', gap: 12, padding: '12px 16px',
          background: alert.isRead ? '#fff' : style.bg,
          borderLeft: `3px solid ${style.dotColor}`,
          borderBottom: '1px solid #f5f5f5',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${style.dotColor}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {style.icon}
        </div>
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
          {relatedTask && (
            <div style={{ marginTop: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
              <Tag color={categoryTypeConfig[relatedTask.categoryType]?.color}
                style={{ fontSize: 9, lineHeight: '16px', margin: 0, border: 'none' }}>
                {relatedCategoryLabel}
              </Tag>
              <Text style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>
                {relatedTask.name}
              </Text>
            </div>
          )}
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

  // ─── Payment feed item ─────────────────────────────────────────
  const renderPaymentItem = (pr: PaymentRequest) => {
    const statusConf = paymentStatusConfig[pr.status];
    const typeConf = categoryTypeConfig[pr.categoryType];
    const prTask = tasks2026.find(t => t.id === pr.taskId);
    return (
      <div
        key={pr.id}
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
            {formatCurrency(pr.amount)}
          </Text>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row justify="space-between" align="top">
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: '18px' }}>
                {pr.title}
              </Text>
            </Col>
            <Col flex="none">
              <Tag color={statusConf.color} style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                {statusConf.label}
              </Tag>
            </Col>
          </Row>
          <div style={{ marginTop: 2, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tag color={typeConf?.color} style={{ fontSize: 9, lineHeight: '16px', margin: 0, border: 'none' }}>
              {typeConf?.label}
            </Tag>
            {prTask && (
              <Text style={{ fontSize: 11, color: '#666' }}>
                {prTask.name}
              </Text>
            )}
          </div>
          <div style={{ marginTop: 3, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 10, color: '#999' }}>
              {pr.code}
            </Text>
            {!isDepartment && (
              <Text style={{ fontSize: 10, color: '#bbb' }}>
                {getDepartmentShortName(pr.departmentId)}
              </Text>
            )}
            {pr.submittedAt && (
              <Text style={{ fontSize: 10, color: '#bbb' }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />
                {pr.submittedAt}
              </Text>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: '#d9d9d9' }}>
          <RightOutlined style={{ fontSize: 10 }} />
        </div>
      </div>
    );
  };

  // ─── Stat cards config ─────────────────────────────────────────
  const statCardsData = [
    {
      title: isDepartment ? 'NS được phân bổ' : 'Tổng NS 2026',
      value: totalBudget,
      icon: <BankOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: totalDelta !== null
        ? `${totalDelta >= 0 ? '+' : ''}${totalDelta.toFixed(1)}% so với 2025`
        : `${deptAllocations.length} hạng mục`,
    },
    {
      title: 'Đã chi',
      value: spent,
      icon: <WalletOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: spentDelta !== null
        ? `${spentDelta >= 0 ? '+' : ''}${spentDelta.toFixed(1)}% so với cùng kỳ`
        : `${executionRate}% ngân sách`,
    },
    {
      title: 'Đã cam kết',
      value: committed,
      icon: <SafetyCertificateOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: `${committedPct}% đang xử lý`,
    },
    {
      title: 'Còn lại',
      value: remaining,
      icon: <PieChartOutlined />,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      sub: totalBudget > 0 ? `${remainPct}% tổng NS` : '',
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
      y: { labelFormatter: (v: number) => `${v.toLocaleString('vi-VN')} tr` },
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
    data: budgetByCategory,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.55,
    height: 300,
    scale: {
      color: { range: [colors.navy, '#7c3aed', '#0891b2', '#059669', colors.gold, '#6b7280'] },
    },
    label: {
      text: (d: any) => `${((d.value / budgetByCategory.reduce((s: number, i: any) => s + i.value, 0)) * 100).toFixed(0)}%`,
      style: { fontSize: 11, fontWeight: 600, fill: '#fff' },
      position: 'inside',
    },
    tooltip: {
      title: '',
      items: [{ channel: 'y', valueFormatter: (v: number) => `${formatNumber(v)} triệu` }],
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

  const columnData = budgetByDepartment.flatMap((d) => [
    { department: d.department, value: d['Phân bổ'], category: 'Phân bổ' },
    { department: d.department, value: d['Đã chi'], category: 'Đã chi' },
  ]);

  const columnConfig: any = {
    data: columnData,
    xField: 'department',
    yField: 'value',
    colorField: 'category',
    group: true,
    height: 300,
    scale: { color: { range: [colors.navy, colors.gold] } },
    axis: {
      y: { labelFormatter: (v: number) => `${(v / 1000).toFixed(1)} tỷ` },
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

  // ─── Department: allocation card ─────────────────────────────
  const renderAllocationCard = (alloc: BudgetAllocation) => {
    const pct = alloc.totalAllocated > 0
      ? parseFloat(((alloc.spent / alloc.totalAllocated) * 100).toFixed(1))
      : 0;
    const strokeColor = pct >= 80 ? colors.danger : pct >= 60 ? colors.warning : colors.success;
    const typeConf = categoryTypeConfig[alloc.categoryType];
    const allocTasks = tasks2026.filter(t => t.allocationId === alloc.id);
    return (
      <div key={alloc.id} className="db-dept-row">
        <Row justify="space-between" align="middle" style={{ marginBottom: 4 }}>
          <Col flex="auto">
            <Space size={8}>
              <Tag color={typeConf?.color} style={{ fontSize: 11 }}>{typeConf?.icon} {typeConf?.label}</Tag>
              <Text style={{ fontSize: 12, color: '#999' }}>
                {formatCurrency(alloc.spent)} / {formatCurrency(alloc.totalAllocated)}
              </Text>
            </Space>
          </Col>
          <Col>
            <Tag color={alloc.status === 'executing' ? 'processing' : alloc.status === 'completed' ? 'success' : 'default'}>
              {alloc.status === 'executing' ? 'Đang thực hiện' : alloc.status === 'completed' ? 'Hoàn thành' : 'Đã phân bổ'}
            </Tag>
          </Col>
        </Row>
        <Progress percent={pct} strokeColor={strokeColor} size="small" style={{ marginBottom: 4 }} />
        {allocTasks.length > 0 && (
          <div style={{ marginTop: 6, paddingLeft: 8, borderLeft: `2px solid ${typeConf?.color || '#ddd'}22` }}>
            {allocTasks.map(task => {
              const taskPct = task.plannedBudget > 0
                ? Math.round((task.spent / task.plannedBudget) * 100) : 0;
              return (
                <div key={task.id} style={{ marginBottom: 4 }}>
                  <Row justify="space-between" align="middle">
                    <Col flex="auto">
                      <Text style={{ fontSize: 12 }}>{task.name}</Text>
                    </Col>
                    <Col>
                      <Text style={{ fontSize: 11, color: '#999' }}>
                        {formatCurrency(task.spent)}/{formatCurrency(task.plannedBudget)}
                      </Text>
                    </Col>
                  </Row>
                  <Progress percent={taskPct} size={3} strokeColor={strokeColor} showInfo={false} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <>
      <div style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <RiseOutlined style={{ marginRight: 8 }} />
            {isDepartment
              ? `Tổng quan Chi phí - ${currentUser.departmentName}`
              : 'Tổng quan Quản lý Kinh phí - Năm 2026'
            }
          </Title>
          <Text type="secondary">
            {isDepartment
              ? `Kế hoạch chi phí ${currentPlan.id} | ${currentUser.departmentName}`
              : `Cập nhật đến tháng 6/2026 | Kế hoạch chi phí: ${currentPlan.id}`
            }
          </Text>
        </div>

        {/* ═══ Row 1: Gradient Stat Cards ═══ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statCardsData.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <div className="db-stat-card" style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Background icon - rotates on hover */}
                <div className="db-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, color: 'rgba(255,255,255,0.1)',
                  lineHeight: 1,
                }}>
                  {card.icon}
                </div>
                {/* Title row with small icon */}
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
                {/* Value */}
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                  {formatNumber(card.value)} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>tr</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>
                  {card.sub}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ═══ Row 2: Gauge + Chart/TaskList ═══ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {/* Gauge / Progress */}
          <Col xs={24} lg={6}>
            <Card
              className="db-chart-card"
              bodyStyle={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', padding: '24px 16px',
              }}
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
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>Tỷ lệ giải ngân</Text>
              </div>
              <Progress
                type="dashboard"
                percent={executionRate}
                strokeColor={{ '0%': colors.navy, '100%': colors.gold }}
                strokeWidth={10}
                width={140}
                format={(pct) => (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: colors.navy }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: '#999' }}>Giải ngân</div>
                  </div>
                )}
              />
              {/* Stacked bar */}
              <div style={{ width: '100%', marginTop: 20 }}>
                <div style={{
                  display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden',
                  background: '#f0f0f0', width: '100%',
                }}>
                  <div style={{ width: `${spentPct}%`, background: `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight})`, transition: 'width 0.6s ease' }} />
                  <div style={{ width: `${committedPct}%`, background: colors.gold, transition: 'width 0.6s ease' }} />
                </div>
                <Row justify="center" style={{ marginTop: 8 }}>
                  <Space size={12}>
                    <Space size={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: colors.navy }} />
                      <Text style={{ fontSize: 10, color: '#999' }}>Đã chi</Text>
                    </Space>
                    <Space size={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: colors.gold }} />
                      <Text style={{ fontSize: 10, color: '#999' }}>Cam kết</Text>
                    </Space>
                    <Space size={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f0f0f0' }} />
                      <Text style={{ fontSize: 10, color: '#999' }}>Còn lại</Text>
                    </Space>
                  </Space>
                </Row>
              </div>
              {/* Mini stats */}
              <Row gutter={8} style={{ marginTop: 16, width: '100%' }}>
                <Col span={12}>
                  <div className="db-mini-stat" style={{ background: '#f0f7ff' }}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: colors.navy, display: 'block' }}>
                      {formatCurrency(spent)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Đã chi</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="db-mini-stat" style={{ background: '#fff7e6' }}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: colors.gold, display: 'block' }}>
                      {formatCurrency(remaining)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Còn lại</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Main content area */}
          <Col xs={24} lg={18}>
            {isDepartment ? (
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
                      <ProjectOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Hạng mục chi phí được phân bổ</span>
                    <Tag color="blue" style={{ marginLeft: 4 }}>{deptAllocations.length} hạng mục</Tag>
                  </div>
                }
                bodyStyle={{ padding: 0 }}
              >
                {deptAllocations.length > 0
                  ? deptAllocations.map(renderAllocationCard)
                  : <Empty description="Chưa có hạng mục nào được phân bổ" style={{ padding: 40 }} />
                }
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
                      <FundOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Chi tiêu hàng tháng: Kế hoạch vs Thực tế</span>
                  </div>
                }
              >
                <Line {...lineConfig} />
              </Card>
            )}
          </Col>
        </Row>

        {/* ═══ Row 3: Pie + Column/TaskBudget ═══ */}
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
                  <span style={{ color: colors.navy, fontWeight: 600 }}>Ngân sách theo Hạng mục chi phí</span>
                </div>
              }
            >
              {budgetByCategory.length > 0 ? (
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
                      <CheckCircleOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Tiến độ giải ngân theo Hạng mục</span>
                  </div>
                }
              >
                <div style={{ padding: '8px 0' }}>
                  {deptAllocations.map((alloc) => {
                    const pct = alloc.totalAllocated > 0
                      ? parseFloat(((alloc.spent / alloc.totalAllocated) * 100).toFixed(1))
                      : 0;
                    const strokeColor = pct >= 80 ? colors.danger : pct >= 60 ? colors.warning : colors.success;
                    return (
                      <div key={alloc.id} style={{ marginBottom: 12, padding: '0 4px' }}>
                        <Row justify="space-between">
                          <Text strong style={{ fontSize: 12 }}>{categoryTypeConfig[alloc.categoryType]?.label || alloc.categoryType}</Text>
                          <Text style={{ fontSize: 11, color: '#999' }}>
                            {formatCurrency(alloc.spent)} / {formatCurrency(alloc.totalAllocated)}
                          </Text>
                        </Row>
                        <Progress percent={pct} strokeColor={strokeColor} size="small" format={(p) => `${p}%`} />
                      </div>
                    );
                  })}
                </div>
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
                      <BankOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Ngân sách theo phòng ban</span>
                  </div>
                }
              >
                <Column {...columnConfig} />
              </Card>
            )}
          </Col>
        </Row>

        {/* ═══ Row 4: Department progress bars (global only) ═══ */}
        {!isDepartment && (
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={24}>
              <Card
                className="db-chart-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14,
                    }}>
                      <CheckCircleOutlined />
                    </div>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>Tiến độ giải ngân theo phòng ban</span>
                  </div>
                }
              >
                <Row gutter={[16, 12]}>
                  {budgetByDepartment.map((dept) => {
                    const pct =
                      dept['Phân bổ'] > 0
                        ? parseFloat(((dept['Đã chi'] / dept['Phân bổ']) * 100).toFixed(1))
                        : 0;
                    const strokeColor =
                      pct >= 80 ? colors.danger : pct >= 60 ? colors.warning : colors.success;
                    return (
                      <Col xs={24} sm={12} lg={8} key={dept.department}>
                        <div style={{ marginBottom: 4 }}>
                          <Row justify="space-between">
                            <Text strong style={{ fontSize: 13 }}>{dept.department}</Text>
                            <Text style={{ fontSize: 12, color: '#999' }}>
                              {formatCurrency(dept['Đã chi'])} / {formatCurrency(dept['Phân bổ'])}
                            </Text>
                          </Row>
                          <Progress percent={pct} strokeColor={strokeColor} size="small" format={(p) => `${p}%`} />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </Col>
          </Row>
        )}

        {/* ═══ Row 5: Alerts + ĐNTT (feed style) ═══ */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={isDepartment ? 12 : 14}>
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
                    count={deptAlerts.filter((a) => !a.isRead).length}
                    style={{ backgroundColor: colors.danger }}
                  />
                </div>
              }
              bodyStyle={{ padding: 0 }}
            >
              {latestAlerts.length > 0 ? (
                <>
                  {latestAlerts.map(renderAlertItem)}
                  {deptAlerts.length > 5 && (
                    <div
                      className="db-feed-item"
                      style={{
                        textAlign: 'center', padding: '10px 16px',
                        borderTop: '1px solid #f0f0f0',
                      }}
                      onClick={() => navigate('/monitoring')}
                    >
                      <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>
                        Xem tất cả {deptAlerts.length} cảnh báo <RightOutlined style={{ fontSize: 10 }} />
                      </Text>
                    </div>
                  )}
                </>
              ) : (
                <Empty description="Không có cảnh báo" style={{ padding: 32 }} />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={isDepartment ? 12 : 10}>
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
                    <FileTextOutlined />
                  </div>
                  <span style={{ color: colors.navy, fontWeight: 600 }}>
                    {isDepartment ? 'ĐNTT của phòng' : 'ĐNTT chờ xử lý'}
                  </span>
                  <Badge
                    count={pendingPayments.length}
                    style={{ backgroundColor: colors.warning }}
                  />
                </div>
              }
              bodyStyle={{ padding: 0 }}
            >
              {pendingPayments.length > 0 ? (
                <>
                  {pendingPayments.slice(0, 5).map(renderPaymentItem)}
                  {pendingPayments.length > 5 && (
                    <div
                      className="db-feed-item"
                      style={{
                        textAlign: 'center', padding: '10px 16px',
                        borderTop: '1px solid #f0f0f0',
                      }}
                      onClick={() => navigate('/payment-requests')}
                    >
                      <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>
                        Xem tất cả {pendingPayments.length} đề nghị <RightOutlined style={{ fontSize: 10 }} />
                      </Text>
                    </div>
                  )}
                </>
              ) : (
                <Empty description={isDepartment ? 'Không có ĐNTT đang chờ' : 'Không có ĐNTT chờ xử lý'} style={{ padding: 32 }} />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Dashboard;
