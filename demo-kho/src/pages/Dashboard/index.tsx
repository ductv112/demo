import { useMemo } from 'react';
import { Row, Col, Card, Typography, Space, Badge, Tag, Progress } from 'antd';
import {
  ImportOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  InboxOutlined,
  DollarOutlined,
  BellOutlined,
  EnvironmentOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';

import { inventoryItems } from '../../data/inventory';
import { alerts } from '../../data/alerts';
import { warehouses } from '../../data/warehouses';
import { inboundOrders } from '../../data/inboundOrders';
import { outboundOrders } from '../../data/outboundOrders';
import { products } from '../../data/products';
import { useUser } from '../../contexts/UserContext';
import { formatNumber, alertSeverityConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

// ─── Helper: format value as "XX.X ty" or "XXX tr" ─────────
const formatValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} tỷ`;
  }
  return `${value} tr`;
};

// ─── Helper: time ago in Vietnamese ─────────────────────────
const timeAgo = (dateStr: string): string => {
  const now = dayjs('2026-04-02');
  const date = dayjs(dateStr);
  const diffMinutes = now.diff(date, 'minute');
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = now.diff(date, 'hour');
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = now.diff(date, 'day');
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffMonths = now.diff(date, 'month');
  return `${diffMonths} tháng trước`;
};

const Dashboard = () => {
  const { currentUser } = useUser();

  // ─── Computed KPIs ────────────────────────────────────────
  const stats = useMemo(() => {
    const uniqueProducts = new Set(inventoryItems.map((i) => i.productId)).size;
    const totalQty = inventoryItems.reduce((sum, i) => sum + i.qtyOnHand, 0);
    const totalValue = inventoryItems.reduce((sum, i) => sum + i.totalValue, 0);
    const unreadAlerts = alerts.filter((a) => !a.isRead).length;

    // Current month: March 2026 (mock data context, today is 2026-04-02 but most recent done orders are in earlier months)
    // We count done inbound in current month (April 2026) and recent months
    const currentMonth = dayjs('2026-04-02');
    const inboundDoneThisMonth = inboundOrders.filter(
      (o) => o.status === 'done' && o.receivedDate && dayjs(o.receivedDate).month() === currentMonth.month() && dayjs(o.receivedDate).year() === currentMonth.year()
    ).length;
    const outboundDoneThisMonth = outboundOrders.filter(
      (o) => o.status === 'done' && o.updatedAt && dayjs(o.updatedAt).month() === currentMonth.month() && dayjs(o.updatedAt).year() === currentMonth.year()
    ).length;

    // Pending: inbound waiting/receiving + outbound submitted/approved
    const pendingInbound = inboundOrders.filter(
      (o) => o.status === 'waiting' || o.status === 'receiving'
    ).length;
    const pendingOutbound = outboundOrders.filter(
      (o) => o.status === 'submitted' || o.status === 'approved'
    ).length;
    const pendingTotal = pendingInbound + pendingOutbound;

    // Below minimum stock: compare inventory qtyAvailable with product minStock
    const belowMinCount = inventoryItems.filter((inv) => {
      const product = products.find((p) => p.id === inv.productId || p.code === inv.productCode);
      if (!product) return false;
      return inv.qtyAvailable < product.minStock;
    }).length;

    return {
      uniqueProducts,
      totalQty,
      totalValue,
      unreadAlerts,
      inboundDoneThisMonth,
      outboundDoneThisMonth,
      pendingTotal,
      belowMinCount,
    };
  }, []);

  // ─── Chart Data: 6-month inbound/outbound ─────────────────
  const monthlyChartData = useMemo(() => {
    const months = [
      { label: 'T10/2025', month: 9, year: 2025 },
      { label: 'T11/2025', month: 10, year: 2025 },
      { label: 'T12/2025', month: 11, year: 2025 },
      { label: 'T01/2026', month: 0, year: 2026 },
      { label: 'T02/2026', month: 1, year: 2026 },
      { label: 'T03/2026', month: 2, year: 2026 },
    ];

    // Mock monthly totals (derived from real orders where possible, supplemented with realistic numbers)
    const mockInbound = [4, 3, 5, 6, 4, 3];
    const mockOutbound = [3, 5, 4, 5, 6, 4];

    // Count actual done orders per month to supplement
    months.forEach((m, idx) => {
      const ibCount = inboundOrders.filter(
        (o) => o.status === 'done' && o.receivedDate &&
          dayjs(o.receivedDate).month() === m.month && dayjs(o.receivedDate).year() === m.year
      ).length;
      const obCount = outboundOrders.filter(
        (o) => o.status === 'done' && o.updatedAt &&
          dayjs(o.updatedAt).month() === m.month && dayjs(o.updatedAt).year() === m.year
      ).length;
      if (ibCount > 0) mockInbound[idx] = ibCount;
      if (obCount > 0) mockOutbound[idx] = obCount;
    });

    const data: { month: string; value: number; type: string }[] = [];
    months.forEach((m, idx) => {
      data.push({ month: m.label, value: mockInbound[idx], type: 'Nhập kho' });
      data.push({ month: m.label, value: mockOutbound[idx], type: 'Xuất kho' });
    });
    return data;
  }, []);

  // ─── Chart Data: Pie — inventory value per warehouse ──────
  const warehousePieData = useMemo(() => {
    return warehouses.map((wh) => ({
      name: wh.name,
      value: wh.totalValue,
    }));
  }, []);

  // ─── Recent unread alerts (top 5) ─────────────────────────
  const recentAlerts = useMemo(() => {
    return alerts
      .filter((a) => !a.isRead)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      .slice(0, 5);
  }, []);

  // ─── Warehouse fill data ──────────────────────────────────
  const warehouseStats = useMemo(() => {
    // Use warehouse totalProducts and a capacity estimate
    const capacities: Record<string, number> = {
      'wh-001': 1000,
      'wh-002': 500,
      'wh-003': 400,
      'wh-004': 250,
      'wh-005': 100,
    };
    return warehouses.map((wh) => {
      const cap = capacities[wh.id] || 500;
      const fillPercent = Math.round((wh.totalProducts / cap) * 100);
      return {
        ...wh,
        capacity: cap,
        fillPercent: Math.min(fillPercent, 100),
      };
    });
  }, []);

  // ─── Chart configs ────────────────────────────────────────
  const columnConfig = {
    data: monthlyChartData,
    xField: 'month',
    yField: 'value',
    colorField: 'type',
    group: true,
    style: {
      radiusTopLeft: 4,
      radiusTopRight: 4,
    },
    scale: {
      color: {
        range: [colors.navy, colors.gold],
      },
    },
    axis: {
      y: {
        title: 'Số phiếu',
        titleFontSize: 12,
      },
    },
    height: 300,
    legend: {
      color: {
        position: 'top' as const,
        layout: { justifyContent: 'flex-end' as const },
      },
    },
    interaction: {
      legendFilter: false,
    },
  };

  const pieConfig = {
    data: warehousePieData,
    angleField: 'value',
    colorField: 'name',
    radius: 0.85,
    innerRadius: 0.55,
    label: {
      text: 'name',
      position: 'outside' as const,
      style: { fontSize: 11 },
    },
    legend: {
      color: {
        position: 'bottom' as const,
        layout: { justifyContent: 'center' as const },
      },
    },
    scale: {
      color: {
        range: [colors.navy, colors.navyLight, colors.gold, '#059669', '#6366f1'],
      },
    },
    height: 300,
    tooltip: {
      items: [
        {
          channel: 'y',
          valueFormatter: (v: number) => `${formatNumber(v)} tr`,
        },
      ],
    },
  };

  // ─── KPI card definitions ─────────────────────────────────
  const kpiCards = [
    {
      label: 'Nhập kho tháng này',
      value: stats.inboundDoneThisMonth,
      suffix: 'phiếu',
      gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
      icon: <ImportOutlined style={{ fontSize: 64 }} />,
      badgeIcon: <ImportOutlined style={{ fontSize: 18, color: '#fff' }} />,
    },
    {
      label: 'Xuất kho tháng này',
      value: stats.outboundDoneThisMonth,
      suffix: 'phiếu',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      icon: <ExportOutlined style={{ fontSize: 64 }} />,
      badgeIcon: <ExportOutlined style={{ fontSize: 18, color: '#fff' }} />,
    },
    {
      label: 'Chờ xử lý',
      value: stats.pendingTotal,
      suffix: 'phiếu',
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      icon: <ClockCircleOutlined style={{ fontSize: 64 }} />,
      badgeIcon: <ClockCircleOutlined style={{ fontSize: 18, color: '#fff' }} />,
    },
    {
      label: 'Dưới mức tối thiểu',
      value: stats.belowMinCount,
      suffix: 'mặt hàng',
      gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
      icon: <WarningOutlined style={{ fontSize: 64 }} />,
      badgeIcon: <WarningOutlined style={{ fontSize: 18, color: '#fff' }} />,
    },
  ];

  return (
    <div>
      {/* ═══ HERO BANNER ═══ */}
      <div className="hero-banner animate-fade-in">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500 }}>
            Tổng quan kho
          </Text>
          <Title level={4} style={{ color: '#fff', margin: '4px 0 6px', fontWeight: 700 }}>
            Xin chào, {currentUser.name}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            Theo dõi toàn bộ hoạt động nhập — xuất — tồn kho và bổ sung vật tư của Trung tâm Hà Nội
          </Text>
        </div>
      </div>

      {/* ═══ KPI STAT CARDS ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {kpiCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              styles={{ body: { padding: 20, position: 'relative', overflow: 'hidden' } }}
              style={{ background: card.gradient, border: 'none' }}
            >
              <div
                className="db-bg-icon"
                style={{ position: 'absolute', top: -8, right: -8, opacity: 0.1, color: '#fff', lineHeight: 1 }}
              >
                {card.icon}
              </div>
              <Space direction="vertical" size={8} style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {card.badgeIcon}
                </div>
                <div>
                  <span style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
                    {card.value}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 6 }}>
                    {card.suffix}
                  </span>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.label}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ═══ CHARTS ROW ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-5"
            title={
              <Space size={12}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ImportOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <Text strong style={{ fontSize: 15, color: colors.navy }}>
                  Biến động xuất nhập kho 6 tháng
                </Text>
              </Space>
            }
          >
            <Column {...columnConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <Space size={12}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <EnvironmentOutlined style={{ fontSize: 16, color: colors.navyDark }} />
                </div>
                <Text strong style={{ fontSize: 15, color: colors.navy }}>
                  Phân bổ tồn kho theo kho
                </Text>
              </Space>
            }
          >
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* ═══ BOTTOM SECTION ═══ */}
      <Row gutter={[16, 16]}>
        {/* ── Recent Alerts ── */}
        <Col xs={24} lg={14}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-5"
            title={
              <Space size={12}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BellOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <Text strong style={{ fontSize: 15, color: colors.navy }}>
                  Cảnh báo mới nhất
                </Text>
                <Badge count={stats.unreadAlerts} style={{ backgroundColor: colors.danger }} />
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentAlerts.map((alert) => {
                const severityConf = alertSeverityConfig[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={`alert-card ${alert.severity}`}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      borderRadius: 0,
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Space size={8} style={{ marginBottom: 4 }}>
                          <Tag color={severityConf.color} style={{ margin: 0, fontSize: 11 }}>
                            {severityConf.label}
                          </Tag>
                          <Text strong style={{ fontSize: 13, color: colors.navyDark }}>
                            {alert.title}
                          </Text>
                        </Space>
                        <div>
                          <Text style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                            {alert.description}
                          </Text>
                        </div>
                      </div>
                      <Text style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', marginLeft: 12 }}>
                        {timeAgo(alert.createdAt)}
                      </Text>
                    </div>
                  </div>
                );
              })}
              {recentAlerts.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                  Không có cảnh báo mới
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* ── Warehouse fill levels ── */}
        <Col xs={24} lg={10}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-6"
            title={
              <Space size={12}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DatabaseOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <Text strong style={{ fontSize: 15, color: colors.navy }}>
                  Tồn kho theo kho
                </Text>
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {warehouseStats.map((wh) => {
                const progressColor =
                  wh.fillPercent > 90 ? colors.danger :
                  wh.fillPercent > 70 ? colors.warning :
                  colors.navy;

                return (
                  <div
                    key={wh.id}
                    className="db-dept-row"
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <Text strong style={{ fontSize: 13, color: colors.navyDark }}>
                          {wh.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>
                          {wh.code}
                        </Text>
                      </div>
                      <RightOutlined style={{ fontSize: 10, color: '#ccc' }} />
                    </div>
                    <Progress
                      percent={wh.fillPercent}
                      size="small"
                      strokeColor={progressColor}
                      format={() => `${wh.fillPercent}%`}
                      style={{ marginBottom: 4 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: '#999' }}>
                        {formatNumber(wh.totalProducts)} mặt hàng
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.navy, fontWeight: 600 }}>
                        {formatValue(wh.totalValue)}
                      </Text>
                    </div>
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
