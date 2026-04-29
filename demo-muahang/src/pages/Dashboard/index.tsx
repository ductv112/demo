import { useMemo } from 'react';
import { Row, Col, Card, Tag, Table, Typography, Space, Progress, Tooltip } from 'antd';
import {
  ShoppingCartOutlined,
  FileTextOutlined,
  AuditOutlined,
  DollarOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { materialRequests } from '../../data/materialRequests';
import { supplyPlans } from '../../data/supplyPlans';
import { contracts } from '../../data/contracts';
import { payments } from '../../data/payments';
import { suppliers } from '../../data/suppliers';
import { alerts, monthlyProcurement } from '../../data/alerts';
import { formatCurrency, alertSeverityConfig, contractStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { Alert } from '../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { currentUser } = useUser();

  // ─── KPI Calculations ────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalProcurementValue = contracts.reduce((sum, c) => sum + c.totalValue, 0);
    const executingContracts = contracts.filter(c => c.status === 'executing').length;
    const unresolvedAlerts = alerts.filter(a => !a.isResolved).length;

    // On-time delivery rate
    const allDeliveries = contracts.flatMap(c => c.deliveries);
    const completedDeliveries = allDeliveries.filter(d => d.status === 'delivered');
    const onTimeDeliveries = completedDeliveries.filter(d => {
      if (!d.actualDate) return false;
      return d.actualDate <= d.plannedDate;
    });
    const onTimeRate = completedDeliveries.length > 0
      ? Math.round((onTimeDeliveries.length / completedDeliveries.length) * 100)
      : 0;

    const totalMaterialRequests = materialRequests.length;
    const approvedRequests = materialRequests.length;

    const totalPlans = supplyPlans.length;
    const totalPlanValue = supplyPlans.reduce((sum, p) => sum + p.totalEstimated, 0);

    const totalContracts = contracts.length;
    const totalContractValue = contracts.reduce((sum, c) => sum + c.totalValue, 0);

    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.paymentAmount, 0);

    return {
      totalProcurementValue,
      executingContracts,
      unresolvedAlerts,
      onTimeRate,
      totalMaterialRequests,
      approvedRequests,
      totalPlans,
      totalPlanValue,
      totalContracts,
      totalContractValue,
      totalPaid,
    };
  }, []);

  // ─── Line Chart Config ───────────────────────────────────────
  const lineChartData = useMemo(() => {
    const result: { month: string; value: number; category: string }[] = [];
    monthlyProcurement.forEach(item => {
      result.push({ month: item.month, value: item.ordered, category: 'Đặt hàng' });
      if (item.received > 0) {
        result.push({ month: item.month, value: item.received, category: 'Nhận hàng' });
      }
      if (item.paid > 0) {
        result.push({ month: item.month, value: item.paid, category: 'Thanh toán' });
      }
    });
    return result;
  }, []);

  const lineConfig: any = {
    data: lineChartData,
    xField: 'month',
    yField: 'value',
    colorField: 'category',
    shapeField: 'smooth',
    height: 300,
    style: { lineWidth: 2.5 },
    scale: {
      color: { range: [colors.navy, colors.success, colors.gold] },
    },
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

  // ─── Alert list ──────────────────────────────────────────────
  const recentAlerts = useMemo(() => {
    return [...alerts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, []);

  // ─── Contract Table ──────────────────────────────────────────
  const contractColumns: ColumnsType<typeof contracts[0]> = [
    {
      title: 'Mã HĐ',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (text: string) => <Text strong style={{ color: colors.navy }}>{text}</Text>,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
    },
    {
      title: 'Giá trị (tr)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <Text strong>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidValue',
      key: 'paidValue',
      width: 130,
      align: 'right' as const,
      render: (v: number, record: typeof contracts[0]) => {
        const pct = record.totalValue > 0 ? Math.round((v / record.totalValue) * 100) : 0;
        return (
          <Space direction="vertical" size={0}>
            <Text>{formatCurrency(v)}</Text>
            <Progress
              percent={pct}
              size="small"
              strokeColor={colors.navy}
              style={{ margin: 0, width: 80 }}
              format={(pct: number | undefined) => `${pct}%`}
            />
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const cfg = contractStatusConfig[status as keyof typeof contractStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : status;
      },
    },
  ];

  // ─── Supplier Rating Overview ────────────────────────────────
  const topSuppliers = useMemo(() => {
    return [...suppliers]
      .filter(s => s.status === 'active')
      .sort((a, b) => {
        const ratingOrder: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
        return (ratingOrder[a.rating] || 9) - (ratingOrder[b.rating] || 9);
      })
      .slice(0, 6);
  }, []);

  const ratingColors: Record<string, string> = {
    A: colors.success,
    B: colors.info,
    C: colors.warning,
    D: colors.danger,
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <Title level={4} style={{ color: colors.navy, margin: 0 }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Xin chào, {currentUser.name} - {currentUser.position} | Cập nhật: 02/04/2026
        </Text>
      </div>

      {/* ══════════════════════════════════════════════════════════
          STAT CARDS — 4 KPI cards with gradient backgrounds
          ══════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Card 1: Tổng giá trị mua sắm */}
        <Col xs={12} sm={12} md={6}>
          <Card
            className="db-stat-card animate-fade-in animate-delay-1"
            style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', border: 'none' }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <DollarOutlined style={{ fontSize: 16, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {formatCurrency(kpis.totalProcurementValue)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Tổng giá trị hợp đồng
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {kpis.totalContracts} hợp đồng | {kpis.executingContracts} đang thực hiện
              </div>
            </div>
            <div
              className="db-bg-icon"
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 64, color: 'rgba(255,255,255,0.1)' }}
            >
              <DollarOutlined />
            </div>
          </Card>
        </Col>

        {/* Card 2: Nhu cầu & Kế hoạch */}
        <Col xs={12} sm={12} md={6}>
          <Card
            className="db-stat-card animate-fade-in animate-delay-2"
            style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', border: 'none' }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <ShoppingCartOutlined style={{ fontSize: 16, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {kpis.totalMaterialRequests}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Nhu cầu vật tư
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {kpis.approvedRequests} yêu cầu | {kpis.totalPlans} KH bảo đảm
              </div>
            </div>
            <div
              className="db-bg-icon"
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 64, color: 'rgba(255,255,255,0.1)' }}
            >
              <ShoppingCartOutlined />
            </div>
          </Card>
        </Col>

        {/* Card 3: Đã thanh toán */}
        <Col xs={12} sm={12} md={6}>
          <Card
            className="db-stat-card animate-fade-in animate-delay-3"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <CheckCircleOutlined style={{ fontSize: 16, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {formatCurrency(kpis.totalPaid)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Đã thanh toán
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                Giao đúng hạn: {kpis.onTimeRate}%
              </div>
            </div>
            <div
              className="db-bg-icon"
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 64, color: 'rgba(255,255,255,0.1)' }}
            >
              <CheckCircleOutlined />
            </div>
          </Card>
        </Col>

        {/* Card 4: Cảnh báo */}
        <Col xs={12} sm={12} md={6}>
          <Card
            className="db-stat-card animate-fade-in animate-delay-4"
            style={{ background: kpis.unresolvedAlerts > 0 ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none' }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <AlertOutlined style={{ fontSize: 16, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {kpis.unresolvedAlerts}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Cảnh báo chưa xử lý
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {alerts.filter(a => a.severity === 'critical' && !a.isResolved).length} nghiêm trọng
              </div>
            </div>
            <div
              className="db-bg-icon"
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 64, color: 'rgba(255,255,255,0.1)' }}
            >
              <AlertOutlined />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ══════════════════════════════════════════════════════════
          CHART + ALERTS — Two column layout
          ══════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Line Chart */}
        <Col xs={24} md={14}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-3"
            title={
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RiseOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 600, color: colors.navy }}>Biến động mua sắm theo tháng</span>
              </Space>
            }
          >
            <div className="chart-container">
              <Line {...lineConfig} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colors.border}` }}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>Tổng đặt hàng</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy }}>
                  {formatCurrency(monthlyProcurement.reduce((s, m) => s + m.ordered, 0))}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>Tổng nhận hàng</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.success }}>
                  {formatCurrency(monthlyProcurement.reduce((s, m) => s + m.received, 0))}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>Tổng thanh toán</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.gold }}>
                  {formatCurrency(monthlyProcurement.reduce((s, m) => s + m.paid, 0))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Alerts */}
        <Col xs={24} md={10}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-4"
            title={
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.danger}, #ff7875)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 600, color: colors.navy }}>Cảnh báo gần đây</span>
                {kpis.unresolvedAlerts > 0 && (
                  <Tag color="error" style={{ marginLeft: 4 }}>{kpis.unresolvedAlerts} chưa xử lý</Tag>
                )}
              </Space>
            }
          >
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {recentAlerts.map((alert: Alert) => {
                const severityCfg = alertSeverityConfig[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={`alert-card ${alert.severity}`}
                    style={{
                      padding: '12px 14px',
                      marginBottom: 8,
                      borderRadius: 8,
                      background: alert.isRead ? '#fafafa' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 13, color: colors.navy, flex: 1 }}>
                        {!alert.isRead && (
                          <span style={{
                            display: 'inline-block', width: 6, height: 6,
                            borderRadius: '50%', background: colors.danger,
                            marginRight: 6, verticalAlign: 'middle',
                          }} />
                        )}
                        {alert.title}
                      </Text>
                      <Tag
                        color={severityCfg.color}
                        style={{ fontSize: 11, marginLeft: 8, flexShrink: 0 }}
                      >
                        {severityCfg.label}
                      </Tag>
                    </div>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.4 }}>
                      {alert.description}
                    </Text>
                    <div style={{ marginTop: 6 }}>
                      <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>
                        {alert.createdAt}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ══════════════════════════════════════════════════════════
          CONTRACT TABLE + SUPPLIER RATING
          ══════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]}>
        {/* Contract Status Summary */}
        <Col xs={24} md={14}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-5"
            title={
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, #7c3aed, #a855f7)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AuditOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 600, color: colors.navy }}>Tình hình hợp đồng</span>
              </Space>
            }
          >
            <Table
              columns={contractColumns}
              dataSource={contracts}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
            <div style={{
              display: 'flex', gap: 16, marginTop: 12, paddingTop: 12,
              borderTop: `1px solid ${colors.border}`, flexWrap: 'wrap',
            }}>
              {Object.entries(contractStatusConfig).map(([key, cfg]) => {
                const count = contracts.filter(c => c.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
                    <Text style={{ fontSize: 13, fontWeight: 600 }}>{count}</Text>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Supplier Rating Overview */}
        <Col xs={24} md={10}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrophyOutlined style={{ fontSize: 16, color: colors.navyDark }} />
                </div>
                <span style={{ fontWeight: 600, color: colors.navy }}>Đánh giá nhà cung cấp</span>
              </Space>
            }
          >
            <div>
              {topSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="db-feed-item"
                  style={{
                    padding: '10px 12px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: `linear-gradient(135deg, ${ratingColors[supplier.rating] || colors.info}, ${ratingColors[supplier.rating] || colors.info}44)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{supplier.rating}</Text>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Text strong style={{ fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {supplier.shortName}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                          {supplier.type === 'military' ? 'Đối tác CL' : supplier.type === 'foreign' ? 'Nước ngoài' : 'Trong nước'}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Tooltip title={`Giao đúng hạn: ${supplier.onTimeRate}% | Chất lượng: ${supplier.qualityRate}%`}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 11, color: colors.textSecondary }}>
                            <ClockCircleOutlined style={{ marginRight: 3 }} />{supplier.onTimeRate}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: colors.textSecondary }}>
                            <SafetyCertificateOutlined style={{ marginRight: 3 }} />{supplier.qualityRate}%
                          </div>
                        </div>
                        <div>
                          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                            {supplier.totalContracts} HD
                          </Text>
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
            {/* Rating distribution summary */}
            <div style={{
              display: 'flex', gap: 12, marginTop: 12, paddingTop: 12,
              borderTop: `1px solid ${colors.border}`, justifyContent: 'center',
            }}>
              {(['A', 'B', 'C', 'D'] as const).map((rating) => {
                const count = suppliers.filter(s => s.rating === rating && s.status === 'active').length;
                return (
                  <div key={rating} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: ratingColors[rating],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 4px',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{rating}</Text>
                    </div>
                    <Text style={{ fontSize: 12, fontWeight: 600 }}>{count}</Text>
                    <div style={{ fontSize: 10, color: colors.textSecondary }}>NCC</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
