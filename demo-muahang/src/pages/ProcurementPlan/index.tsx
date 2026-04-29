import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Table,
  Typography,
  Progress,
  Input,
  Select,
  Space,
  Tooltip,
  Empty,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { procurementPlans } from '../../data/procurementPlans';
import { formatCurrency, formatDate, procurementPlanStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ProcurementPlan } from '../../types';

const { Title, Text } = Typography;

const ProcurementPlanPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // ── Summary stats ────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalPlans = procurementPlans.length;
    const totalEstimated = procurementPlans.reduce((s, p) => s + p.totalEstimated, 0);
    const totalApproved = procurementPlans.reduce((s, p) => s + p.approvedBudget, 0);
    const executing = procurementPlans.filter(p => p.status === 'executing').length;
    return { totalPlans, totalEstimated, totalApproved, executing };
  }, []);

  const statCards = [
    {
      title: 'Tổng KHMS',
      value: summary.totalPlans,
      suffix: 'kế hoạch',
      icon: <FileTextOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />,
      iconBadge: <FileTextOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    },
    {
      title: 'Tổng dự toán',
      value: formatCurrency(summary.totalEstimated),
      suffix: '',
      icon: <DollarOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />,
      iconBadge: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    },
    {
      title: 'Ngân sách duyệt',
      value: formatCurrency(summary.totalApproved),
      suffix: '',
      icon: <CheckCircleOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />,
      iconBadge: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    },
    {
      title: 'Đang thực hiện',
      value: summary.executing,
      suffix: 'kế hoạch',
      icon: <SyncOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />,
      iconBadge: <SyncOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
    },
  ];

  // Vietnamese labels for stat cards
  const statLabels = [
    'Tổng KHMS',
    'Tổng dự toán',
    'Ngân sách duyệt',
    'Đang thực hiện',
  ];

  // ── Filtered plans ───────────────────────────────────────────
  const filteredPlans = useMemo(() => {
    return procurementPlans.filter(p => {
      const matchSearch = !searchText
        || p.title.toLowerCase().includes(searchText.toLowerCase())
        || p.code.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchText, statusFilter]);

  // ── Items table columns ──────────────────────────────────────
  const itemColumns = [
    {
      title: 'Mã VT',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 110,
      render: (code: string) => (
        <Text strong style={{ color: colors.navy, fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'materialName',
      key: 'materialName',
      ellipsis: true,
    },
    {
      title: 'DVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      align: 'center' as const,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'right' as const,
    },
    {
      title: 'Đơn giá (tr)',
      dataIndex: 'estimatedPrice',
      key: 'estimatedPrice',
      width: 110,
      align: 'right' as const,
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    {
      title: 'Thành tiền (tr)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ color: colors.navy }}>{v.toLocaleString('vi-VN')}</Text>
      ),
    },
    {
      title: 'Hạn chót',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 110,
      render: (d: string) => formatDate(d),
    },
  ];

  // Vietnamese column titles
  const colTitles = ['Mã VT', 'Tên vật tư', 'ĐVT', 'SL', 'Đơn giá (tr)', 'Thành tiền (tr)', 'Hạn chót'];
  itemColumns[0].title = colTitles[0];
  itemColumns[1].title = colTitles[1];
  itemColumns[2].title = colTitles[2];
  itemColumns[3].title = colTitles[3];
  itemColumns[4].title = colTitles[4];
  itemColumns[5].title = colTitles[5];
  itemColumns[6].title = colTitles[6];

  // ── Budget bar helper ────────────────────────────────────────
  const renderBudgetBar = (plan: ProcurementPlan) => {
    const pct = plan.approvedBudget > 0
      ? Math.min(Math.round((plan.approvedBudget / plan.totalEstimated) * 100), 100)
      : 0;
    const overBudget = plan.totalEstimated > plan.approvedBudget && plan.approvedBudget > 0;
    return (
      <div style={{ marginTop: 12 }}>
        <Row justify="space-between" style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Dự toán: <Text strong>{formatCurrency(plan.totalEstimated)}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: plan.approvedBudget > 0 ? colors.success : '#999' }}>
            Duyệt: <Text strong style={{ color: plan.approvedBudget > 0 ? colors.success : '#999' }}>
              {plan.approvedBudget > 0 ? formatCurrency(plan.approvedBudget) : 'Chưa duyệt'}
            </Text>
          </Text>
        </Row>
        <div className="budget-progress">
          <Progress
            percent={pct}
            strokeColor={overBudget ? colors.warning : colors.success}
            trailColor="#f0f0f0"
            size="small"
            showInfo={false}
          />
        </div>
        {overBudget && (
          <Text style={{ fontSize: 11, color: colors.warning }}>
            Dự toán vượt ngân sách duyệt {formatCurrency(plan.totalEstimated - plan.approvedBudget)}
          </Text>
        )}
      </div>
    );
  };

  // ── Render plan card ─────────────────────────────────────────
  const renderPlanCard = (plan: ProcurementPlan) => {
    const statusConf = procurementPlanStatusConfig[plan.status];
    const isExecuting = plan.status === 'executing';

    return (
      <Card
        key={plan.id}
        style={{
          marginBottom: 20,
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          borderLeft: `4px solid ${isExecuting ? colors.navy : plan.status === 'completed' ? colors.success : plan.status === 'pending_approval' ? colors.warning : colors.navyLight}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        hoverable
      >
        {/* Card header */}
        <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space size={12} align="center">
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: `0 4px 12px ${colors.navy}30`,
              }}>
                {plan.quarter ? `Q${plan.quarter}` : 'NV'}
              </div>
              <div>
                <Space size={8}>
                  <Title level={5} style={{ margin: 0, color: colors.navy }}>
                    {plan.title}
                  </Title>
                  <Tag color={statusConf.color}>{statusConf.label}</Tag>
                </Space>
                <div style={{ marginTop: 2 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {plan.code} | Năm {plan.year}
                    {plan.quarter && ` - Quý ${plan.quarter}`}
                  </Text>
                  {plan.approvedBy && (
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 12 }}>
                      <UserOutlined style={{ marginRight: 2 }} />
                      Duyệt: {plan.approvedBy}
                      {plan.approvedDate && ` (${formatDate(plan.approvedDate)})`}
                    </Text>
                  )}
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Tổng giá trị dự toán">
                <div style={{
                  background: '#f0f7ff',
                  borderRadius: 8,
                  padding: '6px 14px',
                  textAlign: 'center',
                }}>
                  <Text style={{ fontSize: 11, color: '#999' }}>Dự toán</Text>
                  <div>
                    <Text strong style={{ fontSize: 16, color: colors.navy }}>
                      {formatCurrency(plan.totalEstimated)}
                    </Text>
                  </div>
                </div>
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {/* Items table */}
        <Table
          columns={itemColumns}
          dataSource={plan.items.map((it, idx) => ({ ...it, key: idx }))}
          pagination={false}
          size="small"
          style={{ marginBottom: 8 }}
        />

        {/* Budget bar */}
        {renderBudgetBar(plan)}

        {/* Note */}
        {plan.note && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#fffbe6',
            borderRadius: 8,
            borderLeft: `3px solid ${colors.warning}`,
          }}>
            <Text style={{ fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 6, color: colors.warning }} />
              {plan.note}
            </Text>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: colors.navy }}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Kế hoạch mua sắm
        </Title>
        <Text type="secondary">Quản lý kế hoạch mua sắm vật tư, thiết bị theo quý và nhiệm vụ</Text>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, border: 'none' }}
              bodyStyle={{ padding: '20px 18px', position: 'relative', overflow: 'hidden' }}
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
              {/* Icon badge */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 16, marginBottom: 12,
              }}>
                {card.iconBadge}
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>
                    {typeof card.value === 'number' ? card.value : card.value}
                  </span>
                  {card.suffix && (
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>
                      {card.suffix}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                  {statLabels[idx]}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder="Tìm kiếm theo tên, mã kế hoạch..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={v => setStatusFilter(v)}
              allowClear
              style={{ width: 180 }}
              options={Object.entries(procurementPlanStatusConfig).map(([k, v]) => ({
                label: v.label,
                value: k,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Plan cards */}
      {filteredPlans.length > 0 ? (
        filteredPlans.map(plan => renderPlanCard(plan))
      ) : (
        <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <Empty description="Không tìm thấy kế hoạch mua sắm nào" />
        </Card>
      )}
    </div>
  );
};

export default ProcurementPlanPage;
