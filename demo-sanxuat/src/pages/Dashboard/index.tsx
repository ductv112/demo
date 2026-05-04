import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag, Progress, Badge, Avatar } from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import { productionOrders } from '../../data/productionOrders';
import { alerts } from '../../data/alerts';
import { orderStatusConfig, priorityConfig, alertSeverityConfig, formatDate } from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

// ─── Mock data: sản lượng theo tháng ───
const monthlyOutputData = [
  { month: 'T1/2026', type: 'Kế hoạch', value: 6 },
  { month: 'T1/2026', type: 'Thực tế', value: 5 },
  { month: 'T2/2026', type: 'Kế hoạch', value: 8 },
  { month: 'T2/2026', type: 'Thực tế', value: 9 },
  { month: 'T3/2026', type: 'Kế hoạch', value: 10 },
  { month: 'T3/2026', type: 'Thực tế', value: 10 },
  { month: 'T4/2026', type: 'Kế hoạch', value: 12 },
  { month: 'T4/2026', type: 'Thực tế', value: 7 },
  { month: 'T5/2026', type: 'Kế hoạch', value: 15 },
  { month: 'T5/2026', type: 'Thực tế', value: 0 },
  { month: 'T6/2026', type: 'Kế hoạch', value: 14 },
  { month: 'T6/2026', type: 'Thực tế', value: 0 },
];

const workshopOutputData = [
  { workshop: 'PX1 - Monitoring', value: 7, type: 'Hoàn thành' },
  { workshop: 'PX1 - Monitoring', value: 11, type: 'Kế hoạch' },
  { workshop: 'PX2 - Cluster', value: 0, type: 'Hoàn thành' },
  { workshop: 'PX2 - Cluster', value: 0, type: 'Kế hoạch' },
  { workshop: 'PX3 - Hạ tầng', value: 0, type: 'Hoàn thành' },
  { workshop: 'PX3 - Hạ tầng', value: 3, type: 'Kế hoạch' },
  { workshop: 'PX4 - Phát triển PM', value: 20, type: 'Hoàn thành' },
  { workshop: 'PX4 - Phát triển PM', value: 33, type: 'Kế hoạch' },
];

// ─── Workshop utilization data ───
const workshopUtilization = [
  {
    id: 'PX1',
    name: 'PX1 - Bảo trì Hệ thống Monitoring',
    utilization: 105,
    activeOrders: 2,
    workers: 18,
    status: 'overloaded' as const,
  },
  {
    id: 'PX2',
    name: 'PX2 - Bảo trì Cluster Server',
    utilization: 45,
    activeOrders: 0,
    workers: 14,
    status: 'normal' as const,
  },
  {
    id: 'PX3',
    name: 'PX3 - Hạ tầng',
    utilization: 30,
    activeOrders: 0,
    workers: 22,
    status: 'normal' as const,
  },
  {
    id: 'PX4',
    name: 'PX4 - Phát triển Phần mềm',
    utilization: 82,
    activeOrders: 2,
    workers: 16,
    status: 'warning' as const,
  },
];

const getUtilColor = (rate: number) => {
  if (rate >= 95) return '#ff4d4f';
  if (rate >= 80) return '#faad14';
  if (rate >= 50) return '#52c41a';
  return '#8c8c8c';
};

const getUtilLabel = (status: string) => {
  switch (status) {
    case 'overloaded': return { text: 'Quá tải', color: '#ff4d4f' };
    case 'warning': return { text: 'Cao', color: '#faad14' };
    case 'normal': return { text: 'Bình thường', color: '#52c41a' };
    default: return { text: 'Bình thường', color: '#52c41a' };
  }
};

// ─── KPI stat card config ───
const kpiCards = [
  {
    title: 'Tổng lệnh SX',
    value: 8,
    unit: 'lệnh',
    icon: <PlayCircleOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <PlayCircleOutlined />,
    gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    shadowColor: 'rgba(27,58,92,0.35)',
    link: '/production-orders',
  },
  {
    title: 'Đang sản xuất',
    value: 3,
    unit: 'lệnh',
    icon: <ToolOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <ToolOutlined />,
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    shadowColor: 'rgba(8,145,178,0.35)',
    link: '/production-orders',
  },
  {
    title: 'Hoàn thành',
    value: 2,
    unit: 'lệnh',
    icon: <CheckCircleOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <CheckCircleOutlined />,
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadowColor: 'rgba(5,150,105,0.35)',
    link: '/completion',
  },
  {
    title: 'Sản lượng',
    value: 45,
    unit: 'SP',
    icon: <InboxOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <InboxOutlined />,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    shadowColor: 'rgba(124,58,237,0.35)',
    link: '/reports',
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [_refreshKey] = useState(0);

  // Computed stats
  const totalOrders = productionOrders.length;
  const inProgressOrders = productionOrders.filter(o => o.status === 'in_progress').length;
  const completedOrders = productionOrders.filter(o => o.status === 'completed').length;
  const totalQty = productionOrders.reduce((sum, o) => sum + o.quantity, 0);
  const completedQty = productionOrders.reduce((sum, o) => sum + o.completedQty, 0);
  const overallProgress = totalQty > 0 ? Math.round((completedQty / totalQty) * 100) : 0;
  const unresolvedAlerts = alerts.filter(a => !a.isResolved).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isResolved).length;

  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ─── Chart configs ───
  const lineConfig = {
    data: monthlyOutputData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#1B3A5C', '#D4A843'],
    lineStyle: {
      lineWidth: 2.5,
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    legend: {
      position: 'top-right' as const,
    },
    yAxis: {
      title: {
        text: 'Sản phẩm',
        style: { fontSize: 12, fill: '#8c8c8c' },
      },
      grid: {
        line: {
          style: { stroke: '#f0f0f0', lineDash: [4, 4] },
        },
      },
    },
    xAxis: {
      label: {
        style: { fontSize: 12 },
      },
    },
    tooltip: {
      shared: true,
      showMarkers: true,
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1200,
      },
    },
  };

  const columnConfig = {
    data: workshopOutputData,
    xField: 'workshop',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    color: ['#1B3A5C', '#D4A843'],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    legend: {
      position: 'top-right' as const,
    },
    yAxis: {
      title: {
        text: 'Sản phẩm',
        style: { fontSize: 12, fill: '#8c8c8c' },
      },
      grid: {
        line: {
          style: { stroke: '#f0f0f0', lineDash: [4, 4] },
        },
      },
    },
    label: {
      position: 'top' as const,
      style: {
        fontSize: 11,
        fill: '#595959',
      },
    },
    tooltip: {
      shared: true,
    },
    animation: {
      appear: {
        animation: 'grow-in-y',
        duration: 1000,
      },
    },
  };

  // Sort alerts by date (newest first), take unresolved ones
  const sortedAlerts = [...alerts]
    .filter(a => !a.isResolved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Recent orders (sorted by created date)
  const recentOrders = [...productionOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);


  return (
    <div style={{ padding: 0 }}>
      {/* ══════════════════════════════════════════════════════════════
          HERO BANNER
          ══════════════════════════════════════════════════════════════ */}
      <div className="hero-banner animate-fade-in">
        <Row align="middle" gutter={[24, 16]}>
          <Col xs={24} md={14}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Quản lý Sản xuất - Trung tâm Phần mềm Alpha
              </Text>
              <Title
                level={3}
                style={{
                  color: '#ffffff',
                  margin: '0 0 4px 0',
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: -0.3,
                }}
              >
                Xin chào, {currentUser.name}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                {dateStr}
              </Text>
              <div style={{ marginTop: 14 }}>
                <Space size={8}>
                  {criticalAlerts > 0 && (
                    <Tag
                      color="#ff4d4f"
                      style={{
                        borderRadius: 12,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                      }}
                    >
                      <WarningOutlined style={{ marginRight: 4 }} />
                      {criticalAlerts} cảnh báo nghiêm trọng
                    </Tag>
                  )}
                  <Tag
                    style={{
                      borderRadius: 12,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 500,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Quý II/2026
                  </Tag>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} md={10}>
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div className="glass-stat-card" style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.2,
                    }}
                  >
                    {totalOrders}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    Tổng lệnh SX
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="glass-stat-card" style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: '#D4A843',
                      lineHeight: 1.2,
                    }}
                  >
                    {overallProgress}%
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    Tiến độ chung
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="glass-stat-card" style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: unresolvedAlerts > 3 ? '#ff4d4f' : '#faad14',
                      lineHeight: 1.2,
                    }}
                  >
                    {unresolvedAlerts}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    Cảnh báo
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* Shimmer decoration line */}
        <div
          className="shimmer-line"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          KPI STAT CARDS
          ══════════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {kpiCards.map((card, index) => (
          <Col xs={12} sm={12} md={6} key={card.title}>
            <div
              className={`db-stat-card animate-fade-in animate-delay-${index + 1}`}
              style={{
                background: card.gradient,
                borderRadius: 14,
                padding: '22px 20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => navigate(card.link)}
            >
              {/* Background icon */}
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  fontSize: 64,
                  color: 'rgba(255,255,255,0.1)',
                  lineHeight: 1,
                }}
              >
                {card.bgIcon}
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    marginBottom: 12,
                  }}
                >
                  {card.icon}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                  }}
                >
                  {card.value}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      opacity: 0.7,
                      marginLeft: 6,
                    }}
                  >
                    {card.unit}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.8)',
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {card.title}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ══════════════════════════════════════════════════════════════
          CHARTS ROW
          ══════════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Line chart: Sản lượng theo tháng */}
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-5"
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <RiseOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1B3A5C',
                    display: 'block',
                    lineHeight: 1.3,
                  }}
                >
                  Sản lượng theo tháng
                </Text>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                  Kế hoạch vs Thực tế - 6 tháng đầu năm 2026
                </Text>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>

        {/* Column chart: Sản lượng theo trung tâm */}
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-6"
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <ToolOutlined style={{ color: '#1B3A5C', fontSize: 16 }} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1B3A5C',
                    display: 'block',
                    lineHeight: 1.3,
                  }}
                >
                  Sản lượng theo trung tâm
                </Text>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                  Hoàn thành vs Kế hoạch - Quý II/2026
                </Text>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <Column {...columnConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ══════════════════════════════════════════════════════════════
          WORKSHOP UTILIZATION + ALERTS
          ══════════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Workshop utilization */}
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card"
            style={{ height: '100%' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <ToolOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1B3A5C',
                    display: 'block',
                    lineHeight: 1.3,
                  }}
                >
                  Công suất trung tâm
                </Text>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                  Tỷ lệ sử dụng công suất hiện tại
                </Text>
              </div>
            </div>

            <Row gutter={[12, 12]}>
              {workshopUtilization.map(ws => {
                const statusInfo = getUtilLabel(ws.status);
                return (
                  <Col xs={24} sm={12} key={ws.id}>
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: 10,
                        padding: '16px 18px',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate('/capacity')}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#1B3A5C',
                          }}
                        >
                          {ws.name}
                        </Text>
                        <Tag
                          color={statusInfo.color}
                          style={{
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 600,
                            border: 'none',
                            padding: '0 8px',
                          }}
                        >
                          {statusInfo.text}
                        </Tag>
                      </div>

                      <Progress
                        percent={Math.min(ws.utilization, 100)}
                        strokeColor={getUtilColor(ws.utilization)}
                        trailColor="#e8e8e8"
                        size="small"
                        format={() => `${ws.utilization}%`}
                      />

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 8,
                          fontSize: 11,
                          color: '#8c8c8c',
                        }}
                      >
                        <span>
                          <PlayCircleOutlined style={{ marginRight: 3 }} />
                          {ws.activeOrders} lệnh đang chạy
                        </span>
                        <span>{ws.workers} nhân viên</span>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>

        {/* Alerts feed */}
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card"
            style={{ height: '100%' }}
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <WarningOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1B3A5C',
                    display: 'block',
                    lineHeight: 1.3,
                  }}
                >
                  Cảnh báo sản xuất
                </Text>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {unresolvedAlerts} chưa xử lý
                </Text>
              </div>
              {criticalAlerts > 0 && (
                <Badge
                  count={criticalAlerts}
                  style={{
                    backgroundColor: '#ff4d4f',
                    boxShadow: '0 0 0 2px #fff',
                  }}
                />
              )}
            </div>

            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {sortedAlerts.map(alert => {
                  const severityInfo = alertSeverityConfig[alert.severity];
                  return (
                    <div
                      key={alert.id}
                      className={`alert-card ${alert.severity}`}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: alert.severity === 'critical'
                          ? 'rgba(255,77,79,0.04)'
                          : alert.severity === 'warning'
                          ? 'rgba(250,173,20,0.04)'
                          : 'rgba(24,144,255,0.04)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const order = productionOrders.find(o => o.code === alert.relatedOrderCode);
                        if (order) navigate(`/production-orders/${order.id}`);
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ flex: 1, marginRight: 8 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            {!alert.isRead && (
                              <Badge
                                className={alert.severity === 'critical' ? 'pulse-badge' : ''}
                                dot
                                color={severityInfo.color}
                              />
                            )}
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#1B3A5C',
                                lineHeight: 1.3,
                              }}
                            >
                              {alert.title}
                            </Text>
                          </div>
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#595959',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {alert.description}
                          </Text>
                        </div>
                        <Tag
                          style={{
                            borderRadius: 10,
                            fontSize: 10,
                            fontWeight: 600,
                            border: 'none',
                            padding: '0 6px',
                            flexShrink: 0,
                          }}
                          color={severityInfo.color}
                        >
                          {severityInfo.label}
                        </Tag>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ClockCircleOutlined style={{ marginRight: 3 }} />
                          {formatDate(alert.createdAt)}
                        </Text>
                        {alert.relatedOrderCode && (
                          <Tag
                            style={{
                              fontSize: 10,
                              borderRadius: 4,
                              padding: '0 5px',
                              background: 'rgba(27,58,92,0.06)',
                              border: '1px solid rgba(27,58,92,0.1)',
                              color: '#1B3A5C',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const order = productionOrders.find(o => o.code === alert.relatedOrderCode);
                              if (order) navigate(`/production-orders/${order.id}`);
                            }}
                          >
                            {alert.relatedOrderCode}
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ══════════════════════════════════════════════════════════════
          RECENT PRODUCTION ORDERS
          ══════════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={24}>
          <Card
            className="db-chart-card"
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <PlayCircleOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1B3A5C',
                    display: 'block',
                    lineHeight: 1.3,
                  }}
                >
                  Lệnh sản xuất gần đây
                </Text>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {recentOrders.length} lệnh mới nhất
                </Text>
              </div>
            </div>

            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              {recentOrders.map((order, idx) => {
                const statusInfo = orderStatusConfig[order.status];
                const prioInfo = priorityConfig[order.priority];
                const progress =
                  order.quantity > 0
                    ? Math.round((order.completedQty / order.quantity) * 100)
                    : 0;

                return (
                  <div
                    key={order.id}
                    className="db-feed-item"
                    style={{
                      padding: '14px 16px',
                      borderBottom:
                        idx < recentOrders.length - 1
                          ? '1px solid #f0f0f0'
                          : 'none',
                      borderRadius: idx === 0 ? '8px 8px 0 0' : idx === recentOrders.length - 1 ? '0 0 8px 8px' : 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/production-orders/${order.id}`)}
                  >
                    <Row align="middle" gutter={16}>
                      {/* Avatar / Icon */}
                      <Col flex="none">
                        <Avatar
                          size={40}
                          style={{
                            background:
                              order.status === 'in_progress'
                                ? 'linear-gradient(135deg, #059669, #10b981)'
                                : order.status === 'completed'
                                ? 'linear-gradient(135deg, #1B3A5C, #2d5a8e)'
                                : order.status === 'pending_material'
                                ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                                : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {order.workshopId}
                        </Avatar>
                      </Col>

                      {/* Order info */}
                      <Col flex="auto">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 4,
                          }}
                        >
                          <div>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#1B3A5C',
                              }}
                            >
                              {order.code}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: '#595959',
                                marginLeft: 8,
                              }}
                            >
                              {order.productName}
                            </Text>
                          </div>
                          <Space size={4}>
                            <Tag
                              color={prioInfo?.color}
                              style={{
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 500,
                                border: 'none',
                                padding: '0 6px',
                              }}
                            >
                              {prioInfo?.label}
                            </Tag>
                            <Tag
                              color={statusInfo?.color}
                              style={{
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 500,
                                padding: '0 6px',
                              }}
                            >
                              {statusInfo?.label}
                            </Tag>
                          </Space>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                            {order.workshopName}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                            SL: {order.completedQty}/{order.quantity}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                            {formatDate(order.startDate)} - {formatDate(order.endDate)}
                          </Text>
                          <div
                            style={{
                              flex: 1,
                              maxWidth: 120,
                            }}
                          >
                            <Progress
                              percent={progress}
                              size="small"
                              strokeColor={
                                progress >= 100
                                  ? '#52c41a'
                                  : progress >= 50
                                  ? '#1B3A5C'
                                  : '#faad14'
                              }
                              format={p => (
                                <span style={{ fontSize: 11 }}>{p}%</span>
                              )}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM ROW: Quick stats summary
          ══════════════════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        {/* Production progress summary */}
        <Col xs={24} lg={8}>
          <Card
            className="db-chart-card"
            style={{ height: '100%' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <RiseOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1B3A5C',
                }}
              >
                Tiến độ Quý II/2026
              </Text>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Progress
                type="dashboard"
                percent={overallProgress}
                strokeColor={{
                  '0%': '#1B3A5C',
                  '100%': '#2d5a8e',
                }}
                trailColor="#e8e8e8"
                format={p => (
                  <div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#1B3A5C',
                        lineHeight: 1,
                      }}
                    >
                      {p}%
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                      hoàn thành
                    </div>
                  </div>
                )}
                size={140}
              />
            </div>

            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div
                  className="db-mini-stat"
                  style={{ background: 'rgba(27,58,92,0.04)' }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1B3A5C' }}>
                    {completedQty}
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>SP hoàn thành</div>
                </div>
              </Col>
              <Col span={12}>
                <div
                  className="db-mini-stat"
                  style={{ background: 'rgba(212,168,67,0.06)' }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#D4A843' }}>
                    {totalQty - completedQty}
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>SP còn lại</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Order status distribution */}
        <Col xs={24} lg={8}>
          <Card
            className="db-chart-card"
            style={{ height: '100%' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <PlayCircleOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1B3A5C',
                }}
              >
                Phân bổ trạng thái
              </Text>
            </div>

            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {[
                {
                  label: 'Đang sản xuất',
                  count: inProgressOrders,
                  color: '#52c41a',
                  bg: 'rgba(82,196,26,0.08)',
                },
                {
                  label: 'Hoàn thành',
                  count: completedOrders,
                  color: '#1B3A5C',
                  bg: 'rgba(27,58,92,0.06)',
                },
                {
                  label: 'Chờ vật tư',
                  count: productionOrders.filter(o => o.status === 'pending_material').length,
                  color: '#faad14',
                  bg: 'rgba(250,173,20,0.06)',
                },
                {
                  label: 'Sẵn sàng',
                  count: productionOrders.filter(o => o.status === 'ready').length,
                  color: '#1890ff',
                  bg: 'rgba(24,144,255,0.06)',
                },
                {
                  label: 'Nháp',
                  count: productionOrders.filter(o => o.status === 'draft').length,
                  color: '#8c8c8c',
                  bg: 'rgba(140,140,140,0.06)',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: item.bg,
                    borderRadius: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: item.color,
                      }}
                    />
                    <Text style={{ fontSize: 13, color: '#595959' }}>
                      {item.label}
                    </Text>
                  </div>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    {item.count}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Priority breakdown */}
        <Col xs={24} lg={8}>
          <Card
            className="db-chart-card"
            style={{ height: '100%' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <WarningOutlined style={{ color: '#1B3A5C', fontSize: 16 }} />
              </div>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1B3A5C',
                }}
              >
                Theo mức ưu tiên
              </Text>
            </div>

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {(['critical', 'high', 'normal', 'low'] as const).map(prio => {
                const count = productionOrders.filter(o => o.priority === prio).length;
                const info = priorityConfig[prio];
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                return (
                  <div key={prio}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tag
                          color={info.color}
                          style={{
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            border: 'none',
                            padding: '0 6px',
                            margin: 0,
                          }}
                        >
                          {info.label}
                        </Tag>
                      </div>
                      <Text style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>
                        {count} lệnh
                      </Text>
                    </div>
                    <Progress
                      percent={pct}
                      strokeColor={info.color}
                      trailColor="#f0f0f0"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                );
              })}
            </Space>

            <div
              style={{
                marginTop: 18,
                padding: '12px 14px',
                background: 'rgba(255,77,79,0.04)',
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: '#595959' }}>
                <WarningOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
                {productionOrders.filter(o => o.priority === 'critical').length > 0
                  ? `${productionOrders.filter(o => o.priority === 'critical').length} lệnh khẩn cấp cần ưu tiên xử lý`
                  : 'Không có lệnh khẩn cấp'}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
