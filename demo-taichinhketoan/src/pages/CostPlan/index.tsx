import React, { useState, useMemo } from 'react';
import {
  Button,
  Tag,
  Progress,
  Modal,
  Select,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Steps,
  Tooltip,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  EyeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FundOutlined,
  FileTextOutlined,
  UserOutlined,
  BankOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { costPlans } from '../../data/costPlans';
import { formatCurrency, formatNumber, costPlanStatusConfig } from '../../utils/format';
import type { CostPlan, CostPlanStatus } from '../../types';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

// Status → step index mapping
const statusStepMap: Record<CostPlanStatus, number> = {
  draft: 0,
  collecting: 1,
  consolidating: 2,
  pending_approval: 3,
  approved: 4,
  allocating: 4,
  executing: 5,
  settling: 6,
  settled: 7,
};

const stepItems = [
  { title: 'Lập KH' },
  { title: 'Thu thập' },
  { title: 'Tổng hợp' },
  { title: 'Phê duyệt' },
  { title: 'Phân bổ' },
  { title: 'Thực hiện' },
  { title: 'Quyết toán' },
  { title: 'Hoàn thành' },
];

const CostPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDepartment } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [copyFromPrevious, setCopyFromPrevious] = useState(false);

  const existingYears = costPlans.map((p) => p.year);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i)
    .filter((y) => !existingYears.includes(y))
    .map((y) => ({ label: `Năm ${y}`, value: y }));

  // Summary stats
  const summary = useMemo(() => {
    const executing = costPlans.find(p => p.status === 'executing');
    return {
      totalPlans: costPlans.length,
      executingPlan: executing,
    };
  }, []);

  const handleCreatePlan = () => {
    if (selectedYear) {
      setIsCreateModalOpen(false);
      setSelectedYear(undefined);
      setCopyFromPrevious(false);
    }
  };

  // Sort: executing first, then by year desc
  const sortedPlans = useMemo(() =>
    [...costPlans].sort((a, b) => {
      if (a.status === 'executing' && b.status !== 'executing') return -1;
      if (b.status === 'executing' && a.status !== 'executing') return 1;
      return b.year - a.year;
    }),
  []);

  const getStatusStepStatus = (plan: CostPlan) => {
    if (plan.status === 'settled') return 'finish' as const;
    if (plan.status === 'pending_approval') return 'wait' as const;
    return 'process' as const;
  };

  // Compute summary stat card data
  const execPlan = summary.executingPlan;
  const execSpentPct = execPlan && execPlan.totalBudget > 0
    ? Math.round((execPlan.spentBudget / execPlan.totalBudget) * 100) : 0;
  const execAllocPct = execPlan && execPlan.totalBudget > 0
    ? Math.round((execPlan.allocatedBudget / execPlan.totalBudget) * 100) : 0;
  const execRemaining = execPlan ? execPlan.remainingBudget : 0;
  const execRemainPct = execPlan && execPlan.totalBudget > 0
    ? Math.round((execRemaining / execPlan.totalBudget) * 100) : 0;

  const summaryCards = [
    {
      title: 'Tổng số KHCP',
      value: summary.totalPlans,
      valueSuffix: 'kế hoạch',
      icon: <FileTextOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      sub: `Năm ${costPlans[0]?.year || ''}–${costPlans[costPlans.length - 1]?.year || ''}`,
    },
    {
      title: 'KHCP hiện hành',
      value: execPlan?.year || 0,
      valueSuffix: '',
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
      sub: execPlan ? `Trạng thái: ${costPlanStatusConfig[execPlan.status].label}` : 'Chưa có',
    },
    {
      title: 'NS hiện hành',
      value: execPlan?.totalBudget || 0,
      valueSuffix: 'tr',
      icon: <BankOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      sub: execPlan ? `Đã phân bổ ${execAllocPct}%` : '',
    },
    {
      title: 'Giải ngân hiện hành',
      value: execSpentPct,
      valueSuffix: '%',
      icon: <WalletOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      sub: execPlan ? `${formatCurrency(execPlan.spentBudget)} / ${formatCurrency(execPlan.totalBudget)}` : '',
    },
  ];

  const renderPlanCard = (plan: CostPlan) => {
    const executionRate = plan.totalBudget > 0
      ? parseFloat(((plan.spentBudget / plan.totalBudget) * 100).toFixed(1))
      : 0;
    const allocRate = plan.totalBudget > 0
      ? parseFloat(((plan.allocatedBudget / plan.totalBudget) * 100).toFixed(1))
      : 0;
    const isActive = plan.status === 'executing';
    const isSettled = plan.status === 'settled';
    const statusConf = costPlanStatusConfig[plan.status];
    const stepCurrent = statusStepMap[plan.status] ?? 0;

    const cardBg = isActive
      ? 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 40%)'
      : isSettled
        ? '#fafafa'
        : 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 40%)';

    const accentColor = isActive ? colors.navy : isSettled ? '#bbb' : '#0891b2';

    return (
      <Card
        key={plan.id}
        hoverable
        style={{
          borderLeft: `4px solid ${accentColor}`,
          background: cardBg,
          marginBottom: 16,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        className="cp-plan-card"
        bodyStyle={{ padding: '20px 24px' }}
        onClick={() => navigate(`/cost-plans/${plan.id}`)}
      >
        {/* Header row */}
        <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space size={12} align="center">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: isActive
                  ? `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`
                  : isSettled
                    ? 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)'
                    : 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16,
                boxShadow: `0 4px 12px ${accentColor}30`,
              }}>
                {plan.year}
              </div>
              <div>
                <Space size={8}>
                  <Title level={5} style={{ margin: 0, color: isSettled ? '#999' : colors.navy }}>
                    Kế hoạch chi phí năm {plan.year}
                  </Title>
                  {isActive && <Tag color="blue" style={{ fontSize: 11 }}>Hiện hành</Tag>}
                </Space>
                <div style={{ marginTop: 2 }}>
                  <Tag color={statusConf.color} style={{ fontSize: 11 }}>{statusConf.label}</Tag>
                  {plan.approvedBy && (
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                      <UserOutlined style={{ marginRight: 2 }} />
                      Phê duyệt: {plan.approvedBy}
                      {plan.approvedDate && ` (${plan.approvedDate})`}
                    </Text>
                  )}
                  {plan.registrationDeadline && !plan.approvedDate && (
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                      <ClockCircleOutlined style={{ marginRight: 2 }} />
                      Hạn đăng ký: {plan.registrationDeadline}
                    </Text>
                  )}
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type={isActive ? 'primary' : 'default'}
              icon={<EyeOutlined />}
              onClick={(e) => { e.stopPropagation(); navigate(`/cost-plans/${plan.id}`); }}
              style={{ borderRadius: 8 }}
            >
              Chi tiết
            </Button>
          </Col>
        </Row>

        {/* Workflow Steps */}
        <div style={{
          background: 'rgba(0,0,0,0.02)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 16,
        }}>
          <Steps
            current={stepCurrent}
            size="small"
            status={getStatusStepStatus(plan)}
            items={stepItems}
            style={{ fontSize: 11 }}
          />
        </div>

        {/* Budget overview */}
        {plan.totalBudget > 0 ? (
          <Row gutter={24} align="middle">
            {/* Progress ring */}
            <Col flex="none">
              <Tooltip title={`Tỷ lệ giải ngân: ${executionRate}%`}>
                <Progress
                  type="circle"
                  percent={executionRate}
                  size={80}
                  strokeColor={
                    executionRate >= 90
                      ? colors.danger
                      : executionRate >= 60
                      ? colors.gold
                      : { '0%': colors.navy, '100%': colors.navyLight }
                  }
                  format={(pct) => (
                    <span style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>{pct}%</span>
                  )}
                />
              </Tooltip>
            </Col>

            {/* Budget numbers */}
            <Col flex="auto">
              <Row gutter={[24, 8]}>
                <Col xs={12} sm={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tổng ngân sách</Text>
                    <Text strong style={{ fontSize: 16, color: colors.navy }}>
                      {formatCurrency(plan.totalBudget)}
                    </Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đã phân bổ</Text>
                    <Text strong style={{ fontSize: 16, color: '#0891b2' }}>
                      {formatCurrency(plan.allocatedBudget)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>{allocRate}%</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đã chi</Text>
                    <Text strong style={{ fontSize: 16, color: colors.success }}>
                      {formatCurrency(plan.spentBudget)}
                    </Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Còn lại</Text>
                    <Text strong style={{ fontSize: 16, color: plan.remainingBudget < 2000 ? colors.danger : colors.gold }}>
                      {formatCurrency(plan.remainingBudget)}
                    </Text>
                  </div>
                </Col>
              </Row>
              {/* Stacked progress bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{
                  height: 8, borderRadius: 4, background: '#f0f0f0',
                  overflow: 'hidden', display: 'flex',
                }}>
                  <div style={{
                    width: `${executionRate}%`,
                    background: `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight})`,
                    borderRadius: '4px 0 0 4px',
                    transition: 'width 0.6s ease',
                  }} />
                  <div style={{
                    width: `${Math.max(0, allocRate - executionRate)}%`,
                    background: colors.gold,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <Row justify="space-between" style={{ marginTop: 4 }}>
                  <Space size={16}>
                    <Space size={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: colors.navy }} />
                      <Text style={{ fontSize: 10, color: '#999' }}>Đã chi ({executionRate}%)</Text>
                    </Space>
                    <Space size={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: colors.gold }} />
                      <Text style={{ fontSize: 10, color: '#999' }}>Đã phân bổ ({allocRate}%)</Text>
                    </Space>
                    <Space size={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f0f0f0' }} />
                      <Text style={{ fontSize: 10, color: '#999' }}>Chưa phân bổ</Text>
                    </Space>
                  </Space>
                </Row>
              </div>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Text type="secondary">
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {plan.note || 'Chưa có dữ liệu ngân sách'}
            </Text>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <style>{`
        .cp-plan-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15) !important;
        }
        .cp-stat-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .cp-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15);
        }
        .cp-stat-card .cp-bg-icon {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cp-stat-card:hover .cp-bg-icon {
          transform: rotate(15deg) scale(1.1);
        }
      `}</style>

      {/* Page header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Danh sách Kế hoạch chi phí
          </Title>
          <Text type="secondary">
            {isDepartment ? 'Kế hoạch chi phí liên quan đến phòng ban' : 'Quản lý kế hoạch chi phí toàn Viện qua các năm'}
          </Text>
        </Col>
        {!isDepartment && (
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ borderRadius: 8 }}
            >
              Tạo KHCP năm mới
            </Button>
          </Col>
        )}
      </Row>

      {/* Summary cards - gradient style */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summaryCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="cp-stat-card" style={{
              background: card.gradient,
              borderRadius: 12, padding: '14px 16px 12px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Background icon - rotates on hover */}
              <div className="cp-bg-icon" style={{
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
              {/* Value */}
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {card.valueSuffix === 'tr'
                  ? <>{formatNumber(card.value)} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>tr</span></>
                  : card.valueSuffix === '%'
                    ? <>{card.value}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>%</span></>
                    : <>{card.value} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.valueSuffix}</span></>
                }
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>
                {card.sub}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Plan cards */}
      {sortedPlans.length > 0 ? (
        sortedPlans.map(renderPlanCard)
      ) : (
        <Card>
          <Empty description="Chưa có kế hoạch chi phí nào" />
        </Card>
      )}

      {/* Create modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: colors.navy }} />
            <span>Tạo Kế hoạch chi phí mới</span>
          </Space>
        }
        open={isCreateModalOpen}
        onOk={handleCreatePlan}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setSelectedYear(undefined);
          setCopyFromPrevious(false);
        }}
        okText="Tạo mới"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedYear }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Chọn năm kế hoạch:</div>
            <Select
              placeholder="Chọn năm"
              style={{ width: '100%' }}
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              size="large"
            />
          </div>
          <div>
            <Button
              icon={<CopyOutlined />}
              type={copyFromPrevious ? 'primary' : 'default'}
              onClick={() => setCopyFromPrevious(!copyFromPrevious)}
              block
            >
              {copyFromPrevious ? 'Sao chép từ năm trước' : 'Sao chép từ năm trước'}
            </Button>
            {copyFromPrevious && (
              <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>
                Dữ liệu phân bổ từ năm trước sẽ được sao chép làm mẫu cho năm mới.
              </div>
            )}
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default CostPlanPage;
