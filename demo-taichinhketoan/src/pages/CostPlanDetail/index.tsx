import React, { useState, useMemo } from 'react';
import {
  Card, Tabs, Table, Tag, Progress, Statistic, Row, Col, Typography, Space,
  Badge, Alert as AntAlert, Drawer, Timeline, Descriptions, Button, Breadcrumb,
  Empty, Collapse, message,
} from 'antd';
import {
  ArrowLeftOutlined, FundOutlined, AppstoreOutlined, TeamOutlined,
  HistoryOutlined, WarningOutlined, CheckCircleOutlined, FormOutlined,
  DollarOutlined, RocketOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, ClockCircleOutlined, BankOutlined,
  WalletOutlined, SafetyCertificateOutlined, PieChartOutlined, PlusOutlined,
  FileTextOutlined, EyeOutlined, SendOutlined, CloseCircleOutlined,
  FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { costPlans } from '../../data/costPlans';
import { allocations2026 } from '../../data/allocations';
import { tasks2026, workItems2026 } from '../../data/tasks';
import { budgetRegistrations2027 } from '../../data/budgetRegistrations';
import { paymentRequests } from '../../data/paymentRequests';
import { getDepartmentName, getDepartmentShortName } from '../../data/departments';
import { alerts, adjustments2026 } from '../../data/alerts';
import {
  formatCurrency, formatCurrencyFull, formatDate, formatNumber, costPlanStatusConfig,
  categoryTypeConfig, getProgressColor, paymentStatusConfig,
  budgetRegistrationStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { BudgetAllocation, CategoryType, Task, PaymentRequest } from '../../types';

const { Title, Text } = Typography;

const CostPlanDetailPage: React.FC = () => {
  const { id: costPlanId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isDepartment } = useUser();
  const deptId = currentUser.departmentId;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<BudgetAllocation | null>(null);
  const [paymentDrawerVisible, setPaymentDrawerVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);

  const costPlan = costPlans.find((p) => p.id === costPlanId);

  // ─── Data filtering ──────────────────────────────────────────
  const planAllocations = useMemo(
    () => {
      const all = allocations2026.filter((a) => a.costPlanId === costPlanId);
      return isDepartment ? all.filter(a => a.departmentId === deptId) : all;
    },
    [costPlanId, isDepartment, deptId],
  );

  const planTasks = useMemo(
    () => {
      const all = tasks2026.filter((t) => t.costPlanId === costPlanId);
      return isDepartment ? all.filter(t => t.departmentId === deptId) : all;
    },
    [costPlanId, isDepartment, deptId],
  );

  const planPayments = useMemo(
    () => {
      const all = paymentRequests.filter((p) => p.costPlanId === costPlanId);
      return isDepartment ? all.filter(p => p.departmentId === deptId) : all;
    },
    [costPlanId, isDepartment, deptId],
  );

  const planRegistrations = useMemo(
    () => {
      const all = budgetRegistrations2027.filter((r) => r.costPlanId === costPlanId);
      return isDepartment ? all.filter(r => r.departmentId === deptId) : all;
    },
    [costPlanId, isDepartment, deptId],
  );

  const planAlerts = useMemo(
    () => {
      const all = alerts.filter((a) => !a.isResolved);
      return isDepartment ? all.filter(a => a.departmentId === deptId) : all;
    },
    [isDepartment, deptId],
  );

  const planAdjustments = useMemo(
    () => adjustments2026.filter((a) => a.costPlanId === costPlanId),
    [costPlanId],
  );

  if (!costPlan) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy kế hoạch chi phí</Title>
        <Button type="link" onClick={() => navigate('/cost-plans')}>Quay lại danh sách</Button>
      </Card>
    );
  }

  const statusConfig = costPlanStatusConfig[costPlan.status];
  const isCollecting = ['draft', 'collecting', 'consolidating', 'pending_approval'].includes(costPlan.status);
  const isExecuting = ['approved', 'allocating', 'executing', 'settling'].includes(costPlan.status);
  const isSettled = costPlan.status === 'settled';

  const totalAllocated = planAllocations.reduce((s, a) => s + a.totalAllocated, 0);
  const totalSpent = planAllocations.reduce((s, a) => s + a.spent, 0);
  const totalCommitted = planAllocations.reduce((s, a) => s + a.committed, 0);
  const totalRemaining = planAllocations.reduce((s, a) => s + a.remaining, 0);

  const tasksInProgress = planTasks.filter(t => t.status === 'in_progress').length;
  const tasksCompleted = planTasks.filter(t => t.status === 'completed').length;
  const tasksPlanning = planTasks.filter(t => t.status === 'planning').length;

  // ─── Overview styles ──────────────────────────────────────────
  const overviewStyles = `
    .ov-stat-card {
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .ov-stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15);
    }
    .ov-stat-card .ov-bg-icon {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ov-stat-card:hover .ov-bg-icon {
      transform: rotate(15deg) scale(1.1);
    }
    .ov-summary-card {
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .ov-summary-card:hover {
      box-shadow: 0 6px 20px rgba(27, 58, 92, 0.1);
    }
    .ov-mini-stat {
      padding: 12px;
      border-radius: 10px;
      text-align: center;
      transition: all 0.2s;
    }
    .ov-mini-stat:hover {
      transform: scale(1.03);
    }
  `;

  // ════════════════════════════════════════════════════════════════
  // TAB: TỔNG QUAN
  // ════════════════════════════════════════════════════════════════
  const budgetTotal = isDepartment ? totalAllocated : costPlan.totalBudget;
  const spentPct = budgetTotal > 0 ? Math.round((totalSpent / budgetTotal) * 100) : 0;
  const committedPct = budgetTotal > 0 ? Math.round((totalCommitted / budgetTotal) * 100) : 0;
  const remainPct = budgetTotal > 0 ? Math.round((totalRemaining / budgetTotal) * 100) : 0;

  const statCardsData = [
    {
      title: isDepartment ? 'NS được phân bổ' : 'Tổng ngân sách',
      value: budgetTotal,
      icon: <BankOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      light: true,
      sub: `KHCP ${costPlan.year}`,
    },
    {
      title: 'Đã giải ngân',
      value: totalSpent,
      icon: <WalletOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      light: true,
      sub: `${spentPct}% ngân sách`,
    },
    {
      title: 'Cam kết chi',
      value: totalCommitted,
      icon: <SafetyCertificateOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      light: true,
      sub: `${committedPct}% ngân sách`,
    },
    {
      title: 'Còn lại',
      value: totalRemaining,
      icon: <PieChartOutlined />,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      light: true,
      sub: `${remainPct}% ngân sách`,
    },
  ];

  const renderOverviewTab = () => (
    <div>
      <style>{overviewStyles}</style>

      {/* ─── Stat Cards Row ─── */}
      <Row gutter={[16, 16]}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="ov-stat-card" style={{
              background: card.gradient,
              borderRadius: 12, padding: '14px 16px 12px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Background icon - rotates on hover */}
              <div className="ov-bg-icon" style={{
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

      {/* ─── Execution Progress + Task/Payment Summary ─── */}
      {(isExecuting || isSettled) && (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {/* Progress ring card */}
          <Col xs={24} lg={8}>
            <Card className="ov-summary-card" bodyStyle={{
              padding: '24px 20px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', height: '100%',
            }}>
              <Progress
                type="dashboard"
                percent={spentPct}
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
                <Row justify="space-between" style={{ marginTop: 8 }}>
                  <Space size={16}>
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
            </Card>
          </Col>

          {/* Nhiệm vụ summary */}
          <Col xs={24} lg={8}>
            <Card className="ov-summary-card" bodyStyle={{ padding: '20px' }}
              style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RocketOutlined style={{ color: '#fff', fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', lineHeight: '18px' }}>Nhiệm vụ</Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>{planTasks.length} nhiệm vụ</Text>
                </div>
              </div>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <div className="ov-mini-stat" style={{ background: '#f0f7ff' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.navy, lineHeight: '28px' }}>
                      {tasksInProgress}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Đang TH</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="ov-mini-stat" style={{ background: '#f0fdf4' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.success, lineHeight: '28px' }}>
                      {tasksCompleted}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Hoàn thành</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="ov-mini-stat" style={{ background: '#f5f5f5' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#999', lineHeight: '28px' }}>
                      {tasksPlanning}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Lập KH</div>
                  </div>
                </Col>
              </Row>
              {/* Mini progress */}
              <div style={{ marginTop: 14 }}>
                <Row justify="space-between" style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, color: '#999' }}>Tiến độ chung</Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>
                    {planTasks.length > 0 ? Math.round(planTasks.reduce((s, t) => s + t.progress, 0) / planTasks.length) : 0}%
                  </Text>
                </Row>
                <Progress
                  percent={planTasks.length > 0 ? Math.round(planTasks.reduce((s, t) => s + t.progress, 0) / planTasks.length) : 0}
                  strokeColor={{ '0%': colors.navy, '100%': '#34d399' }}
                  size="small" showInfo={false}
                />
              </div>
            </Card>
          </Col>

          {/* Thanh toán summary */}
          <Col xs={24} lg={8}>
            <Card className="ov-summary-card" bodyStyle={{ padding: '20px' }}
              style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${colors.gold} 0%, #f0d890 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DollarOutlined style={{ color: '#5c3d00', fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', lineHeight: '18px' }}>Thanh toán</Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>
                    {formatCurrency(planPayments.reduce((s, p) => s + p.amount, 0))} tổng
                  </Text>
                </div>
              </div>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <div className="ov-mini-stat" style={{ background: '#f0f7ff' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.navy, lineHeight: '28px' }}>
                      {planPayments.length}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Tổng ĐNTT</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="ov-mini-stat" style={{ background: '#f0fdf4' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.success, lineHeight: '28px' }}>
                      {planPayments.filter(p => p.status === 'paid').length}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Đã TT</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="ov-mini-stat" style={{ background: '#fffbe6' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.warning, lineHeight: '28px' }}>
                      {planPayments.filter(p => ['submitted', 'reviewing'].includes(p.status)).length}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Chờ xử lý</div>
                  </div>
                </Col>
              </Row>
              {/* Payment amount bar */}
              <div style={{ marginTop: 14 }}>
                <Row justify="space-between" style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, color: '#999' }}>Đã thanh toán</Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>
                    {formatCurrency(planPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0))}
                  </Text>
                </Row>
                <Progress
                  percent={planPayments.length > 0
                    ? Math.round(planPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
                      / planPayments.reduce((s, p) => s + p.amount, 0) * 100) : 0}
                  strokeColor={{ '0%': colors.gold, '100%': '#f0d890' }}
                  size="small" showInfo={false}
                />
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {planAlerts.length > 0 && (
        <Card style={{ marginTop: 16 }}
          title={<Space><WarningOutlined style={{ color: colors.danger }} /><span>Cảnh báo</span>
            <Badge count={planAlerts.filter(a => !a.isRead).length} style={{ backgroundColor: colors.danger }} />
          </Space>}
          bodyStyle={{ padding: 0 }}>
          {planAlerts.slice(0, 5).map((alert) => {
            const relatedTask = alert.relatedEntityId.startsWith('T-')
              ? tasks2026.find(t => t.id === alert.relatedEntityId) : null;
            const sevMap: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
              critical: { bg: '#fff2f0', border: '#ff4d4f', icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> },
              warning: { bg: '#fffbe6', border: '#faad14', icon: <WarningOutlined style={{ color: '#faad14' }} /> },
              info: { bg: '#f0f7ff', border: '#1890ff', icon: <InfoCircleOutlined style={{ color: '#1890ff' }} /> },
            };
            const sev = sevMap[alert.severity] || sevMap.info;
            return (
              <div key={alert.id} style={{
                display: 'flex', gap: 10, padding: '10px 16px',
                background: alert.isRead ? '#fff' : sev.bg,
                borderLeft: `3px solid ${sev.border}`,
                borderBottom: '1px solid #f5f5f5',
              }}>
                <div style={{ paddingTop: 2 }}>{sev.icon}</div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 13 }}>{alert.title}</Text>
                  {relatedTask && (
                    <div style={{ marginTop: 2 }}>
                      <Tag color={categoryTypeConfig[relatedTask.categoryType]?.color}
                        style={{ fontSize: 9, margin: 0, border: 'none' }}>
                        {categoryTypeConfig[relatedTask.categoryType]?.label}
                      </Tag>
                      <Text style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>{relatedTask.name}</Text>
                    </div>
                  )}
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                    {alert.description}
                  </Text>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // TAB: ĐĂNG KÝ NHU CẦU CHI PHÍ
  // ════════════════════════════════════════════════════════════════
  const renderRegistrationTab = () => {
    if (planRegistrations.length === 0 && !isCollecting) {
      return <Empty description="Không có dữ liệu đăng ký nhu cầu cho kế hoạch này" />;
    }

    const categoryOrder: CategoryType[] = ['project', 'research', 'document', 'standard', 'training', 'admin'];
    const regByCategory = categoryOrder.map(type => {
      const regs = planRegistrations.filter(r => r.categoryType === type);
      if (regs.length === 0) return null;
      const config = categoryTypeConfig[type];
      const totalEstimated = regs.reduce((s, r) => s + r.estimatedAmount, 0);
      const totalPrevYear = regs.reduce((s, r) => s + (r.previousYearActual || 0), 0);
      return { type, config, regs, totalEstimated, totalPrevYear };
    }).filter(Boolean) as any[];

    const grandTotalEstimated = planRegistrations.reduce((s, r) => s + r.estimatedAmount, 0);
    const submittedCount = planRegistrations.filter(r => r.status === 'submitted').length;
    const grandTotalPrev = planRegistrations.reduce((s, r) => s + (r.previousYearActual || 0), 0);
    const growthPct = grandTotalPrev > 0 ? Math.round(((grandTotalEstimated - grandTotalPrev) / grandTotalPrev) * 100) : 0;

    const regStatCards = [
      {
        title: 'Tổng nhu cầu đăng ký',
        value: grandTotalEstimated,
        fmt: 'money' as const,
        icon: <BankOutlined />,
        gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        sub: grandTotalPrev > 0 ? `${growthPct >= 0 ? '+' : ''}${growthPct}% so với năm trước` : '',
      },
      {
        title: 'Đã gửi đăng ký',
        value: submittedCount,
        fmt: 'count' as const,
        icon: <CheckCircleOutlined />,
        gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
        sub: `${planRegistrations.length - submittedCount} bản nháp`,
      },
      {
        title: 'Hạng mục chi phí',
        value: regByCategory.length,
        fmt: 'count' as const,
        icon: <AppstoreOutlined />,
        gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
        sub: `${planRegistrations.length} đăng ký từ các phòng ban`,
      },
    ];

    return (
      <div>
        {/* Stat cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {regStatCards.map((card, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <div className="ov-stat-card" style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="ov-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
                }}>
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff',
                  }}>{card.icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
                </div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px' }}>
                  {card.fmt === 'money'
                    ? <>{formatNumber(card.value)} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>tr</span></>
                    : <>{String(card.value).padStart(2, '0')}</>
                  }
                </div>
                {card.sub && <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{card.sub}</div>}
              </div>
            </Col>
          ))}
        </Row>

        {/* Category cards */}
        {regByCategory.map((cat: any) => (
          <Card key={cat.type} className="ov-summary-card" style={{ marginBottom: 12 }}
            bodyStyle={{ padding: 0 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: cat.config.color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14,
                }}>{cat.config.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: colors.navy, fontSize: 14 }}>{cat.config.label}</div>
                  <div style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>
                    {cat.regs.length} phòng ban đăng ký
                    {cat.totalPrevYear > 0 && ` · Năm trước: ${formatCurrency(cat.totalPrevYear)}`}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>{formatCurrency(cat.totalEstimated)}</div>
              </div>
            }>
            {cat.regs.map((reg: any) => {
              const statusConf = budgetRegistrationStatusConfig[reg.status as keyof typeof budgetRegistrationStatusConfig];
              return (
                <div key={reg.id} style={{
                  padding: '12px 16px', borderTop: '1px solid #f5f5f5',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <Row justify="space-between" align="middle">
                    <Col flex="auto">
                      <Text strong style={{ fontSize: 13 }}>{getDepartmentName(reg.departmentId)}</Text>
                    </Col>
                    <Col>
                      <Space size={8}>
                        <Text style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>
                          {formatCurrency(reg.estimatedAmount)}
                        </Text>
                        <Tag color={statusConf?.color} style={{ fontSize: 10, margin: 0 }}>{statusConf?.label}</Tag>
                      </Space>
                    </Col>
                  </Row>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {reg.justification}
                  </Text>
                  {reg.previousYearActual && (
                    <Text style={{ fontSize: 11, color: '#bbb', display: 'block', marginTop: 2 }}>
                      Thực tế năm trước: {formatCurrency(reg.previousYearActual)}
                      {reg.estimatedAmount > reg.previousYearActual && (
                        <span style={{ color: colors.warning, marginLeft: 6 }}>
                          (+{((reg.estimatedAmount - reg.previousYearActual) / reg.previousYearActual * 100).toFixed(0)}%)
                        </span>
                      )}
                    </Text>
                  )}
                </div>
              );
            })}
          </Card>
        ))}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // TAB: PHÂN BỔ CHI PHÍ (Hạng mục > Phòng ban)
  // ════════════════════════════════════════════════════════════════
  const categoryTypeOrder: CategoryType[] = ['project', 'research', 'document', 'standard', 'training', 'admin'];

  const treeData = useMemo(() => {
    return categoryTypeOrder
      .map((type) => {
        const items = planAllocations.filter((a) => a.categoryType === type);
        if (items.length === 0) return null;
        const config = categoryTypeConfig[type];
        const totalAlloc = items.reduce((s, i) => s + i.totalAllocated, 0);
        const totalSpentCat = items.reduce((s, i) => s + i.spent, 0);
        const totalRemainingCat = items.reduce((s, i) => s + i.remaining, 0);

        return {
          key: type,
          categoryName: `${config.icon} ${config.label}`,
          department: `${items.length} phòng ban`,
          totalAllocated: totalAlloc,
          spent: totalSpentCat,
          remaining: totalRemainingCat,
          progress: totalAlloc > 0 ? Math.round((totalSpentCat / totalAlloc) * 100) : 0,
          isGroup: true,
          children: items.map((item) => ({
            key: item.id,
            categoryName: getDepartmentName(item.departmentId),
            department: '',
            totalAllocated: item.totalAllocated,
            spent: item.spent,
            remaining: item.remaining,
            progress: item.totalAllocated > 0 ? Math.round((item.spent / item.totalAllocated) * 100) : 0,
            isGroup: false,
            _raw: item,
          })),
        };
      })
      .filter(Boolean);
  }, [planAllocations]);

  const allocationColumns = [
    {
      title: 'Hạng mục / Phòng ban', dataIndex: 'categoryName', key: 'categoryName', width: 280,
      render: (text: string, record: any) => (
        <span style={{ fontWeight: record.isGroup ? 600 : 400, paddingLeft: record.isGroup ? 0 : 16 }}>{text}</span>
      ),
    },
    { title: 'Phân bổ (tr)', dataIndex: 'totalAllocated', key: 'totalAllocated', width: 120,
      align: 'right' as const, render: (val: number) => formatCurrency(val) },
    { title: 'Đã chi (tr)', dataIndex: 'spent', key: 'spent', width: 120,
      align: 'right' as const, render: (val: number) => formatCurrency(val) },
    { title: 'Còn lại (tr)', dataIndex: 'remaining', key: 'remaining', width: 120,
      align: 'right' as const, render: (val: number) => formatCurrency(val) },
    {
      title: 'Tiến độ giải ngân', dataIndex: 'progress', key: 'progress', width: 180,
      render: (percent: number) => <Progress percent={percent} size="small" strokeColor={getProgressColor(percent)} />,
    },
  ];

  const handleRowClick = (record: any) => {
    if (!record.isGroup && record._raw) {
      setSelectedAllocation(record._raw);
      setDrawerVisible(true);
    }
  };

  const renderAllocationTab = () => {
    if (planAllocations.length === 0) {
      return <Empty description="Chưa có phân bổ ngân sách cho kế hoạch này" />;
    }

    const allocBudget = isDepartment ? totalAllocated : costPlan.totalBudget;
    const allocPct = allocBudget > 0 ? Math.round((totalAllocated / allocBudget) * 100) : 0;
    const allocSpentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    const deptCount = new Set(planAllocations.map(a => a.departmentId)).size;

    const allocStatCards = [
      {
        title: 'Tổng phân bổ',
        value: totalAllocated,
        icon: <AppstoreOutlined />,
        gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        sub: `${allocPct}% ngân sách KHCP`,
      },
      {
        title: 'Đã giải ngân',
        value: totalSpent,
        icon: <WalletOutlined />,
        gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
        sub: `${allocSpentPct}% phân bổ`,
      },
      {
        title: 'Cam kết chi',
        value: totalCommitted,
        icon: <SafetyCertificateOutlined />,
        gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
        sub: 'Đang xử lý',
      },
      {
        title: 'Còn lại',
        value: totalRemaining,
        icon: <PieChartOutlined />,
        gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
        sub: `${deptCount} phòng ban · ${planAllocations.length} dòng phân bổ`,
      },
    ];

    return (
      <div>
        {/* Summary stat cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {allocStatCards.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <div className="ov-stat-card" style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="ov-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
                }}>
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
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
                  {formatNumber(card.value)} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>tr</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>
                  {card.sub}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Allocation by category cards */}
        <Row gutter={[16, 16]}>
          {(treeData as any[]).map((group: any) => {
            const catConfig = categoryTypeConfig[group.key as CategoryType];
            const catPct = group.totalAllocated > 0
              ? Math.round((group.spent / group.totalAllocated) * 100) : 0;
            const catBudgetPct = totalAllocated > 0
              ? Math.round((group.totalAllocated / totalAllocated) * 100) : 0;

            return (
              <Col xs={24} lg={12} key={group.key}>
                <Card
                  className="ov-summary-card"
                  style={{ marginBottom: 0, height: '100%' }}
                  bodyStyle={{ padding: 0 }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: catConfig?.color || colors.navy,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14,
                      }}>
                        {catConfig?.icon || <AppstoreOutlined />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: colors.navy, fontSize: 14 }}>
                          {catConfig?.label}
                        </div>
                        <div style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>
                          {group.children?.length || 0} phòng ban · {catBudgetPct}% tổng phân bổ
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>
                          {formatCurrency(group.totalAllocated)}
                        </div>
                      </div>
                    </div>
                  }
                >
                  {/* Category progress bar */}
                  <div style={{ padding: '12px 16px 8px' }}>
                    <Row justify="space-between" style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, color: '#999' }}>
                        Đã chi: {formatCurrency(group.spent)}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#999' }}>
                        Còn lại: {formatCurrency(group.remaining)}
                      </Text>
                    </Row>
                    <Progress
                      percent={catPct}
                      strokeColor={getProgressColor(catPct)}
                      size="small"
                      format={(p) => `${p}%`}
                    />
                  </div>

                  {/* Department rows */}
                  {group.children?.map((child: any) => {
                    const childPct = child.totalAllocated > 0
                      ? Math.round((child.spent / child.totalAllocated) * 100) : 0;
                    const raw = child._raw as BudgetAllocation | undefined;
                    return (
                      <div
                        key={child.key}
                        style={{
                          padding: '10px 16px',
                          borderTop: '1px solid #f5f5f5',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => { if (raw) { setSelectedAllocation(raw); setDrawerVisible(true); } }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Row justify="space-between" align="middle">
                          <Col flex="auto">
                            <Space size={8}>
                              <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: catConfig?.color || '#999',
                              }} />
                              <Text strong style={{ fontSize: 13 }}>{child.categoryName}</Text>
                            </Space>
                          </Col>
                          <Col>
                            <Space size={16}>
                              <div style={{ textAlign: 'right' }}>
                                <Text style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>
                                  {formatCurrency(child.totalAllocated)}
                                </Text>
                              </div>
                              <div style={{ width: 80 }}>
                                <Progress
                                  percent={childPct}
                                  size={4}
                                  strokeColor={getProgressColor(childPct)}
                                  format={(p) => <span style={{ fontSize: 10 }}>{p}%</span>}
                                />
                              </div>
                            </Space>
                          </Col>
                        </Row>
                        {/* Quarterly mini bars */}
                        {raw && (
                          <Row gutter={8} style={{ marginTop: 6, paddingLeft: 14 }}>
                            {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => {
                              const qVal = raw[q];
                              const qMax = Math.max(raw.q1, raw.q2, raw.q3, raw.q4, 1);
                              const qPct = Math.round((qVal / qMax) * 100);
                              return (
                                <Col span={6} key={q}>
                                  <div style={{ fontSize: 10, color: '#bbb', marginBottom: 2 }}>
                                    {q.toUpperCase()}: {formatCurrency(qVal)}
                                  </div>
                                  <div style={{
                                    height: 3, borderRadius: 2, background: '#f0f0f0', overflow: 'hidden',
                                  }}>
                                    <div style={{
                                      width: `${qPct}%`, height: '100%',
                                      background: catConfig?.color || colors.navy,
                                      borderRadius: 2,
                                      transition: 'width 0.4s ease',
                                    }} />
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                        )}
                      </div>
                    );
                  })}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // TAB: THỰC HIỆN (Hạng mục → Nhiệm vụ → Công việc)
  // ════════════════════════════════════════════════════════════════
  const renderExecutionTab = () => {
    if (planTasks.length === 0) {
      return <Empty description="Chưa có nhiệm vụ nào được khai báo" />;
    }

    const tasksByCategory = categoryTypeOrder.map(type => {
      const catTasks = planTasks.filter(t => t.categoryType === type);
      if (catTasks.length === 0) return null;
      const config = categoryTypeConfig[type];
      const totalPlanned = catTasks.reduce((s, t) => s + t.plannedBudget, 0);
      const totalSpentCat = catTasks.reduce((s, t) => s + t.spent, 0);
      return { type, config, tasks: catTasks, totalPlanned, totalSpent: totalSpentCat };
    }).filter(Boolean) as any[];

    const taskStatusColor: Record<string, string> = {
      planning: 'default', in_progress: 'processing', completed: 'success', on_hold: 'warning',
    };
    const taskStatusLabel: Record<string, string> = {
      planning: 'Lập KH', in_progress: 'Đang thực hiện', completed: 'Hoàn thành', on_hold: 'Tạm dừng',
    };
    const wiStatusLabel: Record<string, string> = {
      not_started: 'Chưa bắt đầu', in_progress: 'Đang thực hiện', completed: 'Hoàn thành',
    };

    const totalPlannedAll = planTasks.reduce((s, t) => s + t.plannedBudget, 0);
    const totalSpentAll = planTasks.reduce((s, t) => s + t.spent, 0);
    const avgProgress = planTasks.length > 0 ? Math.round(planTasks.reduce((s, t) => s + t.progress, 0) / planTasks.length) : 0;

    const execStatCards = [
      { title: 'Tổng nhiệm vụ', value: planTasks.length, fmt: 'count' as const, icon: <RocketOutlined />,
        gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', sub: `${tasksInProgress} đang thực hiện · ${tasksCompleted} hoàn thành` },
      { title: 'NS kế hoạch', value: totalPlannedAll, fmt: 'money' as const, icon: <BankOutlined />,
        gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', sub: `Đã chi: ${formatCurrency(totalSpentAll)}` },
      { title: 'Tiến độ TB', value: avgProgress, fmt: 'pct' as const, icon: <FundOutlined />,
        gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', sub: `${tasksByCategory.length} hạng mục` },
    ];

    return (
      <div>
        {/* Stat cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {execStatCards.map((card, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <div className="ov-stat-card" style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="ov-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
                }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff',
                  }}>{card.icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
                </div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px' }}>
                  {card.fmt === 'money'
                    ? <>{formatNumber(card.value)} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>tr</span></>
                    : card.fmt === 'pct'
                      ? <>{card.value}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>%</span></>
                      : <>{String(card.value).padStart(2, '0')}</>
                  }
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{card.sub}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Category panels */}
        <Collapse defaultActiveKey={tasksByCategory.map((c: any) => c.type)} ghost
          style={{ background: 'transparent' }}>
          {tasksByCategory.map((cat: any) => {
            const catPct = cat.totalPlanned > 0 ? Math.round((cat.totalSpent / cat.totalPlanned) * 100) : 0;
            return (
              <Collapse.Panel key={cat.type}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', paddingRight: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: cat.config.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0,
                    }}>{cat.config.icon}</div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 13 }}>{cat.config.label}</Text>
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{cat.tasks.length} nhiệm vụ</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 80 }}>
                        <Progress percent={catPct} size={4} strokeColor={getProgressColor(catPct)} format={(p) => <span style={{ fontSize: 10 }}>{p}%</span>} />
                      </div>
                      <Text style={{ fontSize: 12, color: '#999', minWidth: 120, textAlign: 'right' }}>
                        {formatCurrency(cat.totalSpent)} / {formatCurrency(cat.totalPlanned)}
                      </Text>
                    </div>
                  </div>
                }>
                {cat.tasks.map((task: Task) => {
                  const taskWIs = workItems2026.filter(w => w.taskId === task.id);
                  const taskPct = task.plannedBudget > 0 ? Math.round((task.spent / task.plannedBudget) * 100) : 0;
                  return (
                    <Card key={task.id} size="small" className="ov-summary-card"
                      style={{ marginBottom: 8 }}
                      bodyStyle={{ padding: '12px 16px' }}>
                      <Row justify="space-between" align="top">
                        <Col flex="auto">
                          <Space size={8}>
                            <div style={{
                              width: 4, height: 20, borderRadius: 2, background: cat.config.color, flexShrink: 0,
                            }} />
                            <div>
                              <Space size={8}>
                                <Text strong style={{ fontSize: 13 }}>{task.name}</Text>
                                <Tag color={taskStatusColor[task.status]} style={{ fontSize: 10 }}>
                                  {taskStatusLabel[task.status]}
                                </Tag>
                              </Space>
                              {!isDepartment && (
                                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                                  {getDepartmentName(task.departmentId)}
                                </Text>
                              )}
                            </div>
                          </Space>
                        </Col>
                        <Col style={{ textAlign: 'right' }}>
                          <Text style={{ fontSize: 14, fontWeight: 600, color: colors.navy }}>
                            {formatCurrency(task.plannedBudget)}
                          </Text>
                          <div>
                            <Text style={{ fontSize: 11, color: '#999' }}>
                              Đã chi: {formatCurrency(task.spent)} | Còn lại: {formatCurrency(task.remaining)}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 8 }}>
                        <Row justify="space-between" style={{ marginBottom: 2 }}>
                          <Text style={{ fontSize: 11, color: '#999' }}>Tiến độ</Text>
                          <Text style={{ fontSize: 11, color: '#999' }}>{task.progress}%</Text>
                        </Row>
                        <Progress percent={task.progress} size="small" strokeColor={getProgressColor(taskPct)} showInfo={false} />
                      </div>
                      {taskWIs.length > 0 && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #f0f0f0' }}>
                          <Text style={{ fontSize: 11, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                            Công việc ({taskWIs.length})
                          </Text>
                          {taskWIs.map(wi => (
                            <div key={wi.id} style={{ marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${cat.config.color}30` }}>
                              <Row justify="space-between" align="middle">
                                <Col flex="auto">
                                  <Space size={6}>
                                    <Text style={{ fontSize: 12 }}>{wi.name}</Text>
                                    <Tag color={wi.status === 'completed' ? 'success' : wi.status === 'in_progress' ? 'processing' : 'default'}
                                      style={{ fontSize: 9, lineHeight: '16px' }}>
                                      {wiStatusLabel[wi.status]}
                                    </Tag>
                                  </Space>
                                </Col>
                                <Col>
                                  <Text style={{ fontSize: 11, color: '#999' }}>
                                    {formatCurrency(wi.actualAmount)}/{formatCurrency(wi.plannedAmount)}
                                  </Text>
                                </Col>
                              </Row>
                              <Progress percent={wi.progress} size={3} showInfo={false}
                                strokeColor={wi.status === 'completed' ? '#52c41a' : colors.navy} />
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // TAB: THANH TOÁN
  // ════════════════════════════════════════════════════════════════
  const renderPaymentTab = () => {
    const paidCount = planPayments.filter(p => p.status === 'paid').length;
    const pendingCount = planPayments.filter(p => ['submitted', 'reviewing'].includes(p.status)).length;
    const totalAmt = planPayments.reduce((s, p) => s + p.amount, 0);
    const paidAmt = planPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

    const payStatCards = [
      { title: 'Tổng ĐNTT', value: totalAmt, fmt: 'money' as const, icon: <DollarOutlined />,
        gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', sub: `${planPayments.length} đề nghị` },
      { title: 'Đã thanh toán', value: paidAmt, fmt: 'money' as const, icon: <CheckCircleOutlined />,
        gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', sub: `${paidCount} đề nghị` },
      { title: 'Chờ xử lý', value: pendingCount, fmt: 'count' as const, icon: <ClockCircleOutlined />,
        gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', sub: 'Cần phê duyệt' },
    ];

    return (
      <div>
        {/* Header with stat cards + action button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div />
          {isDepartment && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/payment-requests')}>
              Lập đề nghị thanh toán
            </Button>
          )}
        </div>

        {/* Stat cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {payStatCards.map((card, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <div className="ov-stat-card" style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="ov-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
                }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff',
                  }}>{card.icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
                </div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px' }}>
                  {card.fmt === 'money'
                    ? <>{formatNumber(card.value)} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>tr</span></>
                    : <>{String(card.value).padStart(2, '0')}</>
                  }
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{card.sub}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Payment list - card-based layout */}
        {planPayments.length === 0 ? (
          <Empty description="Chưa có đề nghị thanh toán" />
        ) : (
          <Row gutter={[16, 16]}>
            {planPayments.map(pr => {
              const task = tasks2026.find(t => t.id === pr.taskId);
              const statusConf = paymentStatusConfig[pr.status];
              const typeConf = categoryTypeConfig[pr.categoryType];
              const statusStepsMap: Record<string, number> = {
                draft: 0, submitted: 1, reviewing: 2, approved: 3, paid: 4, rejected: -1, returned: -1,
              };
              const step = statusStepsMap[pr.status] ?? -1;
              const isActive = ['submitted', 'reviewing'].includes(pr.status);

              return (
                <Col xs={24} lg={12} key={pr.id}>
                  <div className="ov-payment-card" onClick={() => { setSelectedPayment(pr); setPaymentDrawerVisible(true); }}
                    style={{
                      background: '#fff', borderRadius: 10, overflow: 'hidden',
                      borderLeft: `4px solid ${statusConf.color === 'default' ? '#d9d9d9' : statusConf.color}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(27,58,92,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
                  >
                    <div style={{ padding: '14px 18px' }}>
                      {/* Row 1: Code + Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <Space size={8}>
                            <Text style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>{pr.code}</Text>
                            <Tag color={typeConf?.color} style={{ fontSize: 10, margin: 0, border: 'none', lineHeight: '18px' }}>{typeConf?.label}</Tag>
                          </Space>
                        </div>
                        <Tag color={statusConf.color} style={{ fontSize: 11, margin: 0, fontWeight: 500 }}>
                          {statusConf.label}
                        </Tag>
                      </div>

                      {/* Row 2: Title */}
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 6, lineHeight: '20px' }}>
                        {pr.title}
                      </Text>

                      {/* Row 3: Task + Dept */}
                      <div style={{ marginBottom: 10 }}>
                        {task && <Text style={{ fontSize: 12, color: '#666' }}>{task.name}</Text>}
                        <div style={{ marginTop: 2 }}>
                          {!isDepartment && <Text style={{ fontSize: 11, color: '#999' }}>{getDepartmentName(pr.departmentId)}</Text>}
                          {pr.vendor && <Text style={{ fontSize: 11, color: '#bbb', marginLeft: isDepartment ? 0 : 10 }}>{!isDepartment && '· '}{pr.vendor}</Text>}
                        </div>
                      </div>

                      {/* Row 4: Amount + Date + Attachments */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>
                          {formatCurrency(pr.amount)}
                        </Text>
                        <Space size={12}>
                          {pr.attachments.length > 0 && (
                            <Space size={4}>
                              <FileTextOutlined style={{ fontSize: 12, color: '#bbb' }} />
                              <Text style={{ fontSize: 11, color: '#bbb' }}>{pr.attachments.length}</Text>
                            </Space>
                          )}
                          {pr.submittedAt && (
                            <Text style={{ fontSize: 11, color: '#bbb' }}>
                              <ClockCircleOutlined style={{ marginRight: 3 }} />
                              {formatDate(pr.submittedAt)}
                            </Text>
                          )}
                        </Space>
                      </div>

                      {/* Progress mini bar for active items */}
                      {isActive && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: '#f0f0f0' }}>
                            <div style={{
                              width: `${step >= 0 ? (step / 4) * 100 : 0}%`,
                              height: '100%',
                              background: statusConf.color === 'processing' ? '#1890ff' : statusConf.color,
                              borderRadius: 2, transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // TAB: THEO PHÒNG BAN
  // ════════════════════════════════════════════════════════════════
  const departmentSummary = useMemo(() => {
    const deptMap = new Map<string, {
      totalAllocated: number; spent: number; committed: number; remaining: number;
      allocCount: number; taskCount: number; pendingPayments: number;
    }>();
    planAllocations.forEach((a) => {
      const existing = deptMap.get(a.departmentId) || {
        totalAllocated: 0, spent: 0, committed: 0, remaining: 0,
        allocCount: 0, taskCount: 0, pendingPayments: 0,
      };
      existing.totalAllocated += a.totalAllocated;
      existing.spent += a.spent;
      existing.committed += a.committed;
      existing.remaining += a.remaining;
      existing.allocCount += 1;
      existing.taskCount += tasks2026.filter(t => t.allocationId === a.id).length;
      deptMap.set(a.departmentId, existing);
    });
    planPayments.forEach(p => {
      if (['submitted', 'reviewing'].includes(p.status)) {
        const existing = deptMap.get(p.departmentId);
        if (existing) existing.pendingPayments += 1;
      }
    });
    return Array.from(deptMap.entries()).map(([id, data]) => ({
      key: id, departmentId: id, departmentName: getDepartmentName(id), ...data,
    }));
  }, [planAllocations, planPayments]);

  const renderDepartmentTab = () => {
    if (departmentSummary.length === 0) return <Empty description="Chưa có dữ liệu phân bổ theo phòng ban" />;

    const maxAlloc = Math.max(...departmentSummary.map(d => d.totalAllocated), 1);

    return (
      <div>
        <Row gutter={[16, 16]}>
          {departmentSummary.map((dept) => {
            const pct = dept.totalAllocated > 0 ? Math.round((dept.spent / dept.totalAllocated) * 100) : 0;
            const barWidth = Math.round((dept.totalAllocated / maxAlloc) * 100);
            return (
              <Col xs={24} lg={12} key={dept.key}>
                <Card className="ov-summary-card" bodyStyle={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block' }}>
                        {dept.departmentName}
                      </Text>
                      <Space size={12} style={{ marginTop: 4 }}>
                        <Text style={{ fontSize: 11, color: '#999' }}>{dept.allocCount} hạng mục</Text>
                        <Text style={{ fontSize: 11, color: '#999' }}>{dept.taskCount} nhiệm vụ</Text>
                        {dept.pendingPayments > 0 && (
                          <Badge count={dept.pendingPayments} size="small" style={{ backgroundColor: '#faad14' }}>
                            <Text style={{ fontSize: 11, color: '#999', paddingRight: 12 }}>ĐNTT chờ</Text>
                          </Badge>
                        )}
                      </Space>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>
                        {formatCurrency(dept.totalAllocated)}
                      </Text>
                    </div>
                  </div>
                  {/* Proportional bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ height: 6, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}>
                      <div style={{
                        width: `${barWidth}%`, height: '100%',
                        background: `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight})`,
                        borderRadius: 3, transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                  {/* Mini stats */}
                  <Row gutter={8}>
                    <Col span={8}>
                      <div className="ov-mini-stat" style={{ background: '#f0f7ff' }}>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: colors.navy, display: 'block' }}>
                          {formatCurrency(dept.spent)}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#999' }}>Đã chi ({pct}%)</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="ov-mini-stat" style={{ background: '#fff7e6' }}>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: '#d97706', display: 'block' }}>
                          {formatCurrency(dept.committed)}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#999' }}>Cam kết</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="ov-mini-stat" style={{ background: '#f0fdf4' }}>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: '#059669', display: 'block' }}>
                          {formatCurrency(dept.remaining)}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#999' }}>Còn lại</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // TAB: LỊCH SỬ ĐIỀU CHỈNH
  // ════════════════════════════════════════════════════════════════
  const renderHistoryTab = () => (
    <div>
      {planAdjustments.length === 0 ? (
        <Empty description="Chưa có lịch sử điều chỉnh nào" />
      ) : (
        <Timeline
          items={planAdjustments.map((adj) => ({
            key: adj.id,
            color: adj.status === 'approved' ? 'green' : adj.status === 'pending' ? 'orange' : 'red',
            children: (
              <Card className="ov-summary-card" size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: adj.status === 'approved' ? '#059669' : adj.status === 'pending' ? '#d97706' : '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12,
                      }}>
                        <HistoryOutlined />
                      </div>
                      <Text strong style={{ fontSize: 14 }}>Phiên bản {adj.version}</Text>
                      <Tag color={adj.status === 'approved' ? 'success' : adj.status === 'pending' ? 'warning' : 'error'}>
                        {adj.status === 'approved' ? 'Đã duyệt' : adj.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(adj.adjustedAt)}</Text>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      <strong>Người điều chỉnh:</strong> {adj.adjustedBy}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666', display: 'block', marginTop: 4 }}>
                      <strong>Lý do:</strong> {adj.reason}
                    </Text>
                  </div>
                  {/* Changes as styled rows */}
                  <div style={{ marginTop: 8 }}>
                    {adj.changes.map((change: any) => (
                      <div key={change.allocationId} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', borderBottom: '1px solid #f5f5f5',
                      }}>
                        <div>
                          <Text strong style={{ fontSize: 12 }}>{change.categoryName}</Text>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{change.departmentName}</Text>
                        </div>
                        <Space size={16}>
                          <div style={{ textAlign: 'right' }}>
                            <Text style={{ fontSize: 11, color: '#999' }}>{formatCurrency(change.previousAmount)}</Text>
                            <Text style={{ fontSize: 11, display: 'block' }}>→ {formatCurrency(change.newAmount)}</Text>
                          </div>
                          <Tag color={change.difference > 0 ? 'green' : 'red'} style={{ fontSize: 11, minWidth: 60, textAlign: 'center' }}>
                            {change.difference > 0 ? '+' : ''}{formatCurrency(change.difference)}
                          </Tag>
                        </Space>
                      </div>
                    ))}
                  </div>
                </Space>
              </Card>
            ),
          }))}
        />
      )}
    </div>
  );

  // ─── Drawer chi tiết phân bổ ────────────────────────────────
  const renderAllocationDrawer = () => {
    if (!selectedAllocation) return null;
    const a = selectedAllocation;
    const progress = a.totalAllocated > 0 ? Math.round((a.spent / a.totalAllocated) * 100) : 0;
    const typeConfig = categoryTypeConfig[a.categoryType];
    const allocTasks = tasks2026.filter(t => t.allocationId === a.id);

    return (
      <Drawer
        title={<Space><span>Chi tiết phân bổ</span><Tag color={typeConfig?.color}>{typeConfig?.label}</Tag></Space>}
        open={drawerVisible}
        onClose={() => { setDrawerVisible(false); setSelectedAllocation(null); }}
        width={560}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Hạng mục">{typeConfig?.label}</Descriptions.Item>
          <Descriptions.Item label="Phòng ban">{getDepartmentName(a.departmentId)}</Descriptions.Item>
          <Descriptions.Item label="Tổng phân bổ">{formatCurrency(a.totalAllocated)}</Descriptions.Item>
          <Descriptions.Item label="Đã chi">{formatCurrency(a.spent)}</Descriptions.Item>
          <Descriptions.Item label="Cam kết chi">{formatCurrency(a.committed)}</Descriptions.Item>
          <Descriptions.Item label="Còn lại">{formatCurrency(a.remaining)}</Descriptions.Item>
        </Descriptions>
        <Card size="small" style={{ marginTop: 16 }} title="Phân bổ theo quý">
          <Row gutter={16}>
            <Col span={6}><Statistic title="Q1" value={a.q1} suffix="tr" /></Col>
            <Col span={6}><Statistic title="Q2" value={a.q2} suffix="tr" /></Col>
            <Col span={6}><Statistic title="Q3" value={a.q3} suffix="tr" /></Col>
            <Col span={6}><Statistic title="Q4" value={a.q4} suffix="tr" /></Col>
          </Row>
        </Card>
        <Card size="small" style={{ marginTop: 16 }} title="Tiến độ giải ngân">
          <Progress percent={progress} strokeColor={getProgressColor(progress)} />
        </Card>
        {allocTasks.length > 0 && (
          <Card size="small" style={{ marginTop: 16 }} title={`Nhiệm vụ (${allocTasks.length})`}>
            {allocTasks.map(task => (
              <div key={task.id} style={{ marginBottom: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Row justify="space-between" align="middle">
                  <Text strong style={{ fontSize: 13 }}>{task.name}</Text>
                  <Tag color={task.status === 'in_progress' ? 'processing' : task.status === 'completed' ? 'success' : 'default'}>
                    {task.status === 'in_progress' ? 'Đang TH' : task.status === 'completed' ? 'Hoàn thành' : 'Lập KH'}
                  </Tag>
                </Row>
                <Row justify="space-between" style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatCurrency(task.spent)} / {formatCurrency(task.plannedBudget)}
                  </Text>
                  <Text style={{ fontSize: 11 }}>{task.progress}%</Text>
                </Row>
                <Progress percent={task.progress} size="small" showInfo={false} strokeColor={getProgressColor(task.progress)} />
              </div>
            ))}
          </Card>
        )}
      </Drawer>
    );
  };

  const renderPaymentDrawer = () => {
    if (!selectedPayment) return null;
    const pr = selectedPayment;
    const task = tasks2026.find(t => t.id === pr.taskId);
    const statusCfg = paymentStatusConfig[pr.status];
    const typeCfg = categoryTypeConfig[pr.categoryType];
    const allocation = allocations2026.find(a => a.id === pr.allocationId);
    const canReview = pr.status === 'submitted' || pr.status === 'reviewing';

    const paymentMethodLabel = pr.paymentMethod === 'transfer' ? 'Chuyển khoản'
      : pr.paymentMethod === 'advance' ? 'Tạm ứng' : pr.paymentMethod === 'direct' ? 'Trực tiếp' : '—';

    const statusStepsMap: Record<string, number> = {
      draft: 0, submitted: 1, reviewing: 2, approved: 3, paid: 4, rejected: -1, returned: -1,
    };
    const step = statusStepsMap[pr.status] ?? -1;
    const progressPct = step >= 0 ? Math.round((step / 4) * 100) : 0;

    const fileIconMap: Record<string, React.ReactNode> = {
      pdf: <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      xlsx: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
      docx: <FileWordOutlined style={{ color: '#1890ff', fontSize: 18 }} />,
    };

    // Timeline
    const timelineItems = [
      {
        color: 'green' as const,
        dot: <ClockCircleOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Tạo đề nghị</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(pr.createdAt)} — {pr.createdBy}</Text></div>
          </div>
        ),
      },
      ...(pr.submittedAt ? [{
        color: 'blue' as const,
        dot: <SendOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Gửi duyệt</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(pr.submittedAt)}</Text></div>
          </div>
        ),
      }] : []),
      ...(pr.reviewedBy && pr.status === 'reviewing' ? [{
        color: 'orange' as const,
        dot: <EyeOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Đang xem xét</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>Người xem xét: {pr.reviewedBy}</Text></div>
          </div>
        ),
      }] : []),
      ...(pr.reviewedAt ? [{
        color: (pr.status === 'approved' || pr.status === 'paid' ? 'green' : 'red') as 'green' | 'red',
        dot: pr.status === 'rejected' ? <CloseCircleOutlined style={{ fontSize: 14 }} /> : <CheckCircleOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>{pr.status === 'rejected' ? 'Từ chối' : 'Phê duyệt'}</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(pr.reviewedAt)} — {pr.reviewedBy}</Text></div>
            {pr.reviewNote && <div><Text italic style={{ fontSize: 12 }}>"{pr.reviewNote}"</Text></div>}
          </div>
        ),
      }] : []),
      ...(pr.status === 'paid' ? [{
        color: 'green' as const,
        dot: <DollarOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Đã thanh toán</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>Hoàn tất {formatCurrencyFull(pr.amount)}</Text></div>
          </div>
        ),
      }] : []),
    ];

    return (
      <Drawer
        title={null}
        open={paymentDrawerVisible}
        onClose={() => { setPaymentDrawerVisible(false); setSelectedPayment(null); }}
        width={640}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
      >
        {/* Gradient header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, #2d5a8e 60%, ${colors.navyLight} 100%)`,
          padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{pr.code}</Text>
              <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, marginTop: 4, maxWidth: 380 }}>{pr.title}</div>
            </div>
            <Button type="text" onClick={() => { setPaymentDrawerVisible(false); setSelectedPayment(null); }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginTop: -4 }}>×</Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 700, lineHeight: '36px' }}>
                {formatCurrency(pr.amount)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                {formatCurrencyFull(pr.amount)}
              </div>
            </div>
            <Tag
              color={statusCfg.color}
              style={{ fontSize: 13, padding: '4px 14px', borderRadius: 6, fontWeight: 500 }}
            >
              {statusCfg.label}
            </Tag>
          </div>

          {/* Status progress mini bar */}
          {step >= 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.15)' }}>
                <div style={{
                  width: `${progressPct}%`, height: '100%',
                  background: 'linear-gradient(90deg, #34d399, #fbbf24, #60a5fa)',
                  borderRadius: 2, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {['Tạo', 'Gửi', 'Xem xét', 'Duyệt', 'Thanh toán'].map((label, i) => (
                  <Text key={label} style={{
                    fontSize: 9, color: i <= step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                    fontWeight: i === step ? 600 : 400,
                  }}>{label}</Text>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 28px' }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phòng ban</Text>
              <Text strong style={{ fontSize: 13 }}>{getDepartmentName(pr.departmentId)}</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Loại hạng mục</Text>
              <Tag color={typeCfg?.color} style={{ margin: '2px 0 0', fontSize: 11 }}>{typeCfg?.label}</Tag>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Nhiệm vụ</Text>
              <Text strong style={{ fontSize: 12 }}>{task?.name || '—'}</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phương thức TT</Text>
              <Text strong style={{ fontSize: 13 }}>{paymentMethodLabel}</Text>
            </div>
            {pr.vendor && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Nhà cung cấp</Text>
                <Text strong style={{ fontSize: 12 }}>{pr.vendor}</Text>
              </div>
            )}
            {pr.contractNo && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Số hợp đồng</Text>
                <Text strong style={{ fontSize: 13 }}>{pr.contractNo}</Text>
              </div>
            )}
          </div>

          {/* Description */}
          {pr.description && (
            <div style={{ padding: '14px 16px', background: '#f0f7ff', borderRadius: 10, marginBottom: 20, borderLeft: `3px solid ${colors.navy}` }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block', marginBottom: 4 }}>Mô tả chi tiết</Text>
              <Text style={{ fontSize: 13 }}>{pr.description}</Text>
            </div>
          )}

          {/* Allocation info */}
          {allocation && (
            <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              title={<Space><BankOutlined style={{ color: colors.navy }} /><span style={{ fontSize: 13 }}>Ngân sách phân bổ</span></Space>}
            >
              <Row gutter={12}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: colors.navy, display: 'block' }}>
                      {formatCurrency(allocation.totalAllocated)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Tổng phân bổ</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: '#059669', display: 'block' }}>
                      {formatCurrency(allocation.spent)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Đã chi</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: '#d97706', display: 'block' }}>
                      {formatCurrency(allocation.remaining)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Còn lại</Text>
                  </div>
                </Col>
              </Row>
              <Progress
                percent={allocation.totalAllocated > 0 ? Math.round((allocation.spent / allocation.totalAllocated) * 100) : 0}
                strokeColor={getProgressColor(allocation.totalAllocated > 0 ? Math.round((allocation.spent / allocation.totalAllocated) * 100) : 0)}
                size="small" style={{ marginTop: 4 }}
              />
            </Card>
          )}

          {/* Attachments */}
          {pr.attachments && pr.attachments.length > 0 && (
            <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              title={<span style={{ fontSize: 13 }}>Tài liệu đính kèm ({pr.attachments.length})</span>}>
              {pr.attachments.map(att => (
                <div key={att.id} style={{
                  padding: '8px 0', borderBottom: '1px solid #f5f5f5',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {fileIconMap[att.type] || <FileTextOutlined style={{ fontSize: 18, color: '#999' }} />}
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>{att.name}</Text>
                    <Text type="secondary" style={{ fontSize: 10, marginLeft: 8 }}>{att.size}</Text>
                  </div>
                  <Button type="link" size="small">Tải xuống</Button>
                </div>
              ))}
            </Card>
          )}

          {/* Timeline */}
          <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<span style={{ fontSize: 13 }}>Lịch sử xử lý</span>}>
            <Timeline items={timelineItems} />
          </Card>

          {/* Review actions */}
          {canReview && !isDepartment && (
            <Card size="small" style={{ borderRadius: 10, border: '1px dashed #d9d9d9' }}
              bodyStyle={{ padding: '16px 20px' }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Phê duyệt đề nghị</Text>
              <Space>
                <Button type="primary" icon={<CheckCircleOutlined />}
                  onClick={() => message.success('Đã phê duyệt đề nghị thanh toán!')}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                  Phê duyệt
                </Button>
                <Button danger icon={<CloseCircleOutlined />}
                  onClick={() => message.warning('Đã từ chối đề nghị thanh toán.')}>
                  Từ chối
                </Button>
                <Button icon={<ExclamationCircleOutlined />}
                  onClick={() => message.info('Đã yêu cầu bổ sung hồ sơ.')}>
                  Yêu cầu bổ sung
                </Button>
              </Space>
            </Card>
          )}
        </div>
      </Drawer>
    );
  };

  // ─── Tab config ──────────────────────────────────────────────
  const tabItems = [];
  tabItems.push({ key: 'overview', label: <span><FundOutlined /> Tổng quan</span>, children: renderOverviewTab() });

  if (isCollecting || planRegistrations.length > 0) {
    tabItems.push({ key: 'registration', label: <span><FormOutlined /> Đăng ký nhu cầu</span>, children: renderRegistrationTab() });
  }
  if (isExecuting || isSettled || planAllocations.length > 0) {
    tabItems.push({ key: 'allocation', label: <span><AppstoreOutlined /> Phân bổ chi phí</span>, children: renderAllocationTab() });
  }
  if (isExecuting || isSettled) {
    tabItems.push({ key: 'execution', label: <span><RocketOutlined /> Thực hiện</span>, children: renderExecutionTab() });
  }
  if ((isExecuting || isSettled) && (planPayments.length > 0 || isDepartment)) {
    const pendingCount = planPayments.filter(p => ['submitted', 'reviewing'].includes(p.status)).length;
    tabItems.push({
      key: 'payments',
      label: <span><DollarOutlined /> Thanh toán {pendingCount > 0 && <Badge count={pendingCount} size="small" style={{ marginLeft: 4 }} />}</span>,
      children: renderPaymentTab(),
    });
  }
  if (!isDepartment && planAllocations.length > 0) {
    tabItems.push({ key: 'departments', label: <span><TeamOutlined /> Theo phòng ban</span>, children: renderDepartmentTab() });
  }
  if (planAdjustments.length > 0) {
    tabItems.push({ key: 'history', label: <span><HistoryOutlined /> Điều chỉnh</span>, children: renderHistoryTab() });
  }

  const defaultTab = isCollecting && planRegistrations.length > 0 ? 'registration' : 'overview';

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/cost-plans">Kế hoạch chi phí</Link> },
          { title: `KHCP Năm ${costPlan.year}` },
        ]} />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space direction="vertical" size="small">
            <Space align="center">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/cost-plans')} />
              <Title level={4} style={{ margin: 0 }}>KHCP NĂM {costPlan.year}</Title>
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            </Space>
          </Space>
          {(isExecuting || isSettled) && (
            <Row gutter={32}>
              <Col>
                <Statistic title="Tổng NS" value={isDepartment ? totalAllocated : costPlan.totalBudget}
                  suffix="tr" valueStyle={{ fontSize: 18 }} formatter={(val) => formatNumber(val as number)} />
              </Col>
              <Col>
                <Statistic title="Đã chi" value={totalSpent} suffix="tr"
                  valueStyle={{ fontSize: 18, color: '#52c41a' }} formatter={(val) => formatNumber(val as number)} />
              </Col>
              <Col>
                <Statistic title="Còn lại" value={totalRemaining} suffix="tr"
                  valueStyle={{ fontSize: 18, color: '#faad14' }} formatter={(val) => formatNumber(val as number)} />
              </Col>
            </Row>
          )}
        </div>
      </Card>
      <Card><Tabs items={tabItems} defaultActiveKey={defaultTab} /></Card>
      {renderAllocationDrawer()}
      {renderPaymentDrawer()}
    </div>
  );
};

export default CostPlanDetailPage;
