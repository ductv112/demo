import React, { useMemo } from 'react';
import { Row, Col, Card, Tag, Table, Progress, Typography, Space, Badge } from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileSearchOutlined,
  AlertOutlined,
  BarChartOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Area, Pie, Column } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { workOrders } from '../../data/workOrders';
import { repairRequests } from '../../data/repairRequests';
import { alerts } from '../../data/alerts';
import { monthlyRepairStats } from '../../data/repairHistory';
import {
  workOrderStatusConfig,
  repairRequestStatusConfig,
  priorityConfig,
  formatDate,
  formatCurrency,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

const pageStyles = `
  .db-dashboard {
    animation: dbFadeIn 0.5s ease-out;
  }

  @keyframes dbFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: dbFadeIn 0.5s ease-out forwards;
    opacity: 0;
  }
  .animate-delay-1 { animation-delay: 0.1s; }
  .animate-delay-2 { animation-delay: 0.2s; }
  .animate-delay-3 { animation-delay: 0.3s; }
  .animate-delay-4 { animation-delay: 0.4s; }
  .animate-delay-5 { animation-delay: 0.5s; }

  .hero-banner {
    background: linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 50%, ${colors.navyLight} 100%);
    border-radius: 14px;
    padding: 28px 32px 24px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }
  .hero-banner::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero-banner::after {
    content: '';
    position: absolute;
    bottom: -60px;
    left: 30%;
    width: 300px;
    height: 150px;
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
    border-radius: 50%;
  }

  .hero-title {
    color: #ffffff !important;
    font-size: 22px !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
    letter-spacing: -0.3px;
  }
  .hero-subtitle {
    color: rgba(255,255,255,0.7) !important;
    font-size: 13px !important;
    margin-bottom: 20px !important;
  }

  .glass-stat-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 16px 18px;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-stat-card:hover {
    background: rgba(255,255,255,0.16);
    transform: translateY(-2px);
  }
  .glass-stat-card .glass-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #ffffff;
    margin-bottom: 10px;
  }
  .glass-stat-card .glass-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .glass-stat-card .glass-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 2px;
  }

  .db-stat-card {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    min-height: 120px;
  }
  .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .db-stat-card:hover .db-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .db-bg-icon {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 64px;
    opacity: 0.1;
    color: #ffffff;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .db-stat-card .db-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255,255,255,0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #ffffff;
    margin-bottom: 12px;
  }
  .db-stat-card .db-stat-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .db-stat-card .db-stat-unit {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    margin-left: 4px;
  }
  .db-stat-card .db-stat-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 4px;
  }

  .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
  .db-chart-card .ant-card-head {
    border-bottom: 1px solid ${colors.border};
  }
  .db-chart-card .ant-card-head-title {
    font-weight: 600;
    color: ${colors.navy};
  }

  .db-card-title-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-right: 10px;
    color: #ffffff;
  }

  .db-alert-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid ${colors.border};
    transition: background 0.2s;
  }
  .db-alert-row:last-child {
    border-bottom: none;
  }
  .db-alert-row:hover {
    background: #f5f7fa;
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 8px;
  }
  .db-alert-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .db-alert-content {
    flex: 1;
    min-width: 0;
  }
  .db-alert-title {
    font-size: 13px;
    font-weight: 600;
    color: ${colors.navyDark};
    margin-bottom: 2px;
  }
  .db-alert-desc {
    font-size: 12px;
    color: ${colors.textSecondary};
    line-height: 1.5;
  }
  .db-alert-date {
    font-size: 11px;
    color: ${colors.textSecondary};
    white-space: nowrap;
    margin-top: 2px;
  }

  .db-table-row {
    cursor: pointer;
  }
`;

const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const inProgressCount = workOrders.filter(
      (wo) => ['in_progress', 'quality_check', 'testing'].includes(wo.status)
    ).length;
    const completedCount = workOrders.filter(
      (wo) => ['handed_over', 'closed'].includes(wo.status)
    ).length;
    const unresolvedAlerts = alerts.filter((a) => !a.isResolved).length;
    const pendingApproval = workOrders.filter(
      (wo) => wo.status === 'pending_approval'
    ).length;
    const completionRate = workOrders.length > 0
      ? Math.round((completedCount / workOrders.length) * 100)
      : 0;
    const totalCost = workOrders.reduce((sum, wo) => sum + wo.actualCost, 0);

    return {
      totalRequests: repairRequests.length,
      inProgress: inProgressCount,
      completed: completedCount,
      unresolvedAlerts,
      totalWorkOrders: workOrders.length,
      pendingApproval,
      completionRate,
      totalCost,
    };
  }, []);

  const lineChartData = useMemo(() => {
    const data: { month: string; value: number; category: string }[] = [];
    monthlyRepairStats.forEach((item) => {
      const label = item.month.replace('2026-', 'T');
      data.push({ month: label, value: item.received, category: 'Tiếp nhận' });
      data.push({ month: label, value: item.completed, category: 'Hoàn thành' });
    });
    return data;
  }, []);

  const areaConfig = {
    data: lineChartData,
    xField: 'month',
    yField: 'value',
    colorField: 'category',
    color: [colors.navy, colors.success],
    smooth: true,
    line: { size: 2.5 },
    point: { size: 4, shape: 'diamond' },
    height: 300,
    legend: { position: 'top-right' as const },
    style: { fillOpacity: 0.15 },
    axis: { y: { title: 'Số lượng' } },
  };

  const recentWorkOrders = useMemo(() => {
    return [...workOrders]
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate))
      .slice(0, 5);
  }, []);

  const unresolvedAlerts = useMemo(() => {
    return alerts
      .filter((a) => !a.isResolved)
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate))
      .slice(0, 5);
  }, []);

  const severityColorMap: Record<string, string> = {
    critical: colors.danger,
    warning: colors.warning,
    info: colors.info,
  };

  const columns = [
    {
      title: 'Mã lệnh',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => (
        <Text strong style={{ color: colors.navy, fontSize: 13 }}>{text}</Text>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const cfg = workOrderStatusConfig[status as keyof typeof workOrderStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : status;
      },
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (priority: string) => {
        const cfg = priorityConfig[priority as keyof typeof priorityConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : priority;
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 140,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={
            progress >= 90 ? colors.success
            : progress >= 60 ? colors.info
            : progress >= 30 ? colors.warning
            : colors.danger
          }
        />
      ),
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'plannedEnd',
      key: 'plannedEnd',
      width: 130,
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div className="db-dashboard">
      <style>{pageStyles}</style>

      {/* Hero Banner */}
      <div className="hero-banner animate-fade-in">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Title level={4} className="hero-title">
            Xin chào, {currentUser.name}
          </Title>
          <Text className="hero-subtitle">
            Tổng quan tình hình sửa chữa thiết bị -- Doanh nghiệp A
          </Text>

        </div>
      </div>

      {/* Gradient Stat Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card animate-fade-in animate-delay-1"
            style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
          >
            <div className="db-bg-icon"><ToolOutlined /></div>
            <div className="db-icon-badge"><ToolOutlined /></div>
            <div className="db-stat-value">{stats.totalWorkOrders}</div>
            <div className="db-stat-label">Tổng lệnh sửa chữa</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card animate-fade-in animate-delay-2"
            style={{ background: `linear-gradient(135deg, ${colors.gold}, #c49b38)` }}
          >
            <div className="db-bg-icon"><ClockCircleOutlined /></div>
            <div className="db-icon-badge"><ClockCircleOutlined /></div>
            <div className="db-stat-value">{stats.pendingApproval}</div>
            <div className="db-stat-label">Chờ phê duyệt</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card animate-fade-in animate-delay-3"
            style={{ background: `linear-gradient(135deg, #3d9a50, ${colors.success})` }}
          >
            <div className="db-bg-icon"><RiseOutlined /></div>
            <div className="db-icon-badge"><RiseOutlined /></div>
            <div>
              <span className="db-stat-value">{stats.completionRate}</span>
              <span className="db-stat-unit">%</span>
            </div>
            <div className="db-stat-label">Tỉ lệ hoàn thành</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card animate-fade-in animate-delay-4"
            style={{ background: `linear-gradient(135deg, #d94444, ${colors.danger})` }}
          >
            <div className="db-bg-icon"><BarChartOutlined /></div>
            <div className="db-icon-badge"><BarChartOutlined /></div>
            <div>
              <span className="db-stat-value">{formatCurrency(stats.totalCost)}</span>
            </div>
            <div className="db-stat-label">Chi phí tổng (triệu đồng)</div>
          </div>
        </Col>
      </Row>

      {/* Biểu đồ đường - Xu hướng sửa chữa theo tháng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card className="db-chart-card animate-fade-in animate-delay-3"
            title={<Space>
              <span className="db-card-title-icon" style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}>
                <BarChartOutlined />
              </span>
              <span>Xu hướng tiếp nhận & hoàn thành sửa chữa theo tháng</span>
            </Space>}
          >
            <Area {...areaConfig} />
          </Card>
        </Col>
      </Row>

      {/* 2 biểu đồ thanh ngang */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Phân bổ trạng thái lệnh SC */}
        <Col xs={24} lg={12}>
          <Card className="db-chart-card animate-fade-in animate-delay-4"
            title={<Space>
              <span className="db-card-title-icon" style={{ background: `linear-gradient(135deg, ${colors.gold}, #c49b38)` }}>
                <RiseOutlined />
              </span>
              <span>Phân bổ trạng thái lệnh sửa chữa</span>
            </Space>}
          >
            {(() => {
              const statusData = [
                { name: 'Nháp / Chờ duyệt', value: workOrders.filter(w => ['draft', 'pending_approval'].includes(w.status)).length, color: colors.warning },
                { name: 'Đang thực hiện', value: workOrders.filter(w => w.status === 'in_progress').length, color: '#1890ff' },
                { name: 'KT / Thử nghiệm', value: workOrders.filter(w => ['quality_check', 'testing'].includes(w.status)).length, color: '#722ed1' },
                { name: 'Nghiệm thu', value: workOrders.filter(w => w.status === 'accepted').length, color: colors.success },
                { name: 'Bàn giao / Đóng', value: workOrders.filter(w => ['handed_over', 'closed'].includes(w.status)).length, color: colors.navy },
              ].filter(s => s.value > 0);
              const maxVal = Math.max(...statusData.map(d => d.value), 1);
              return (
                <div style={{ padding: '8px 0' }}>
                  {statusData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 130, fontSize: 13, fontWeight: 500, color: '#444', textAlign: 'right', flexShrink: 0 }}>
                        {item.name}
                      </div>
                      <div style={{ flex: 1, position: 'relative', height: 28, background: '#f5f7fa', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(item.value / maxVal) * 100}%`, height: '100%',
                          background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                          borderRadius: 6, transition: 'width 0.8s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                          minWidth: 32,
                        }}>
                          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{item.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </Col>

        {/* Phân loại sửa chữa - Donut + legend cards */}
        <Col xs={24} lg={12}>
          <Card className="db-chart-card animate-fade-in animate-delay-5"
            title={<Space>
              <span className="db-card-title-icon" style={{ background: `linear-gradient(135deg, ${colors.success}, #3d9a50)` }}>
                <ToolOutlined />
              </span>
              <span>Phân loại sửa chữa</span>
            </Space>}
          >
            {(() => {
              const typeData = [
                { name: 'Sửa chữa nhỏ', value: repairRequests.filter(r => r.repairType === 'small').length, color: '#36cfc9', desc: 'Thay linh kiện đơn lẻ' },
                { name: 'Sửa chữa vừa', value: repairRequests.filter(r => r.repairType === 'medium').length, color: colors.navy, desc: 'Tháo mô-đun kiểm tra' },
                { name: 'SC hiện trường', value: repairRequests.filter(r => r.repairType === 'field').length, color: colors.gold, desc: 'Xử lý tại đơn vị' },
              ];
              const total = typeData.reduce((s, d) => s + d.value, 0);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {/* Donut */}
                  <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
                    <svg viewBox="0 0 180 180" style={{ width: 180, height: 180, transform: 'rotate(-90deg)' }}>
                      {typeData.reduce((acc: { offset: number; elements: React.ReactNode[] }, item, idx) => {
                        const pct = total > 0 ? (item.value / total) * 100 : 0;
                        const circumference = 2 * Math.PI * 65;
                        const dash = (pct / 100) * circumference;
                        const gap = circumference - dash;
                        acc.elements.push(
                          <circle key={idx} cx="90" cy="90" r="65" fill="none"
                            stroke={item.color} strokeWidth="24" strokeLinecap="round"
                            strokeDasharray={`${dash - 3} ${gap + 3}`}
                            strokeDashoffset={-acc.offset}
                            style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
                          />
                        );
                        acc.offset += dash;
                        return acc;
                      }, { offset: 0, elements: [] }).elements}
                    </svg>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: colors.navy, lineHeight: 1 }}>{total}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>yêu cầu</div>
                    </div>
                  </div>

                  {/* Legend cards */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {typeData.map((item, idx) => {
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 10,
                          background: `${item.color}08`, border: `1px solid ${item.color}18`,
                          transition: 'all 0.2s',
                        }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0,
                            boxShadow: `0 0 0 3px ${item.color}25`,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{item.desc}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{pct}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </Card>
        </Col>

      </Row>

      {/* Biểu đồ cột - Chi phí theo trung tâm */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card className="db-chart-card animate-fade-in animate-delay-5"
            title={<Space>
              <span className="db-card-title-icon" style={{ background: `linear-gradient(135deg, ${colors.success}, #3d9a50)` }}>
                <BarChartOutlined />
              </span>
              <span>Chi phí sửa chữa theo trung tâm (triệu đồng)</span>
            </Space>}
          >
            <Column
              data={(() => {
                const teamCosts: Record<string, { materialCost: number; laborCost: number }> = {};
                workOrders.forEach(wo => {
                  if (wo.actualCost > 0) {
                    const team = wo.assignedTeam.replace('Trung tâm ', '');
                    if (!teamCosts[team]) teamCosts[team] = { materialCost: 0, laborCost: 0 };
                    teamCosts[team].materialCost += wo.materialCost;
                    teamCosts[team].laborCost += wo.laborCost;
                  }
                });
                const data: { team: string; value: number; type: string }[] = [];
                Object.entries(teamCosts).forEach(([team, costs]) => {
                  data.push({ team, value: costs.materialCost, type: 'Vật tư' });
                  data.push({ team, value: costs.laborCost, type: 'Nhân công' });
                });
                return data;
              })()}
              xField="team"
              yField="value"
              colorField="type"
              stack={true}
              height={320}
              color={[colors.navy, colors.gold]}
              legend={{ position: 'top-right' as const }}
              label={{ text: 'value', position: 'inside', style: { fill: '#fff', fontSize: 11 } }}
              axis={{ y: { title: 'Triệu đồng' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            className="db-chart-card animate-fade-in animate-delay-4"
            title={
              <Space>
                <span
                  className="db-card-title-icon"
                  style={{ background: `linear-gradient(135deg, ${colors.danger}, #d94444)` }}
                >
                  <AlertOutlined />
                </span>
                <span>Cảnh báo gần đây</span>
              </Space>
            }
          >
            {unresolvedAlerts.map((alert) => (
              <div key={alert.id} className="db-alert-row">
                <div
                  className="db-alert-dot"
                  style={{ background: severityColorMap[alert.severity] || colors.info }}
                />
                <div className="db-alert-content">
                  <div className="db-alert-title">{alert.title}</div>
                  <div className="db-alert-desc">{alert.description}</div>
                </div>
                <div className="db-alert-date">{formatDate(alert.createdDate)}</div>
              </div>
            ))}
            {unresolvedAlerts.length === 0 && (
              <Text type="secondary" style={{ fontSize: 13 }}>Không có cảnh báo</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Work Orders Table */}
      <Card
        className="db-chart-card animate-fade-in animate-delay-5"
        title={
          <Space>
            <span
              className="db-card-title-icon"
              style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
            >
              <ToolOutlined />
            </span>
            <span>Lệnh sửa chữa gần đây</span>
          </Space>
        }
      >
        <Table
          dataSource={recentWorkOrders}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: 900 }}
          rowClassName="db-table-row"
          onRow={(record) => ({
            onClick: () => navigate(`/work-orders/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
