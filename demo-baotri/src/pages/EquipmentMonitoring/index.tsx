import React, { useState, useMemo } from 'react';
import {
  Card,
  Tag,
  Tabs,
  Row,
  Col,
  Space,
  Badge,
  Breadcrumb,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ToolOutlined,
  WarningOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { equipmentList } from '../../data/equipment';
import { alerts } from '../../data/alerts';
import {
  equipmentStatusConfig,
  alertSeverityConfig,
  formatDate,
  formatDateTime,
} from '../../utils/format';
import type { Equipment, MonitoringAlert, EquipmentStatus, AlertSeverity } from '../../types';

const { Title, Text } = Typography;

const equipmentStatusBorderColor: Record<EquipmentStatus, string> = {
  operational: '#52c41a',
  maintenance: '#faad14',
  faulty: '#ff4d4f',
  decommissioned: '#8c8c8c',
};

const EquipmentMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState('equipment');

  const stats = useMemo(() => {
    const operational = equipmentList.filter(e => e.status === 'operational').length;
    const maintenance = equipmentList.filter(e => e.status === 'maintenance').length;
    const faulty = equipmentList.filter(e => e.status === 'faulty').length;
    const unresolvedAlerts = alerts.filter(a => !a.isResolved).length;
    return { operational, maintenance, faulty, unresolvedAlerts };
  }, []);

  const statCards = [
    {
      key: 'operational',
      label: 'Đang vận hành',
      title: 'Đang vận hành',
      value: stats.operational,
      suffix: 'thiết bị',
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
    },
    {
      key: 'maintenance',
      label: 'Đang bảo trì',
      title: 'Đang bảo trì',
      value: stats.maintenance,
      suffix: 'thiết bị',
      icon: <ToolOutlined />,
      gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
    },
    {
      key: 'faulty',
      label: 'Hỏng hóc',
      title: 'Hỏng hóc',
      value: stats.faulty,
      suffix: 'thiết bị',
      icon: <WarningOutlined />,
      gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
    },
    {
      key: 'alerts',
      label: 'Cảnh báo chưa xử lý',
      title: 'Cảnh báo chưa xử lý',
      value: stats.unresolvedAlerts,
      suffix: 'cảnh báo',
      icon: <AlertOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
    },
  ];

  const renderStatCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {statCards.map((card, idx) => (
        <Col xs={12} sm={12} md={6} key={card.key}>
          <div
            className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
            style={{
              background: card.gradient,
              borderRadius: 14,
              padding: '20px 18px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <div
              className="db-bg-icon"
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                fontSize: 64,
                opacity: 0.1,
                color: '#fff',
              }}
            >
              {card.icon}
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                color: '#fff',
                fontSize: 16,
              }}
            >
              {card.icon}
            </div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
              {card.value}
              <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>
                {card.suffix}
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
              {card.title}
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );

  const renderEquipmentTab = () => (
    <Row gutter={[16, 16]}>
      {equipmentList.map((eq: Equipment, idx: number) => {
        const statusCfg = equipmentStatusConfig[eq.status];
        const borderColor = equipmentStatusBorderColor[eq.status];
        return (
          <Col xs={24} sm={12} lg={8} key={eq.id}>
            <Card
              className={`animate-fade-in animate-delay-${(idx % 6) + 1}`}
              style={{
                borderRadius: 14,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                borderLeft: `4px solid ${borderColor}`,
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              hoverable
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 16,
                    }}
                  >
                    <RadarChartOutlined />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14, color: '#1B3A5C', display: 'block', lineHeight: 1.3 }}>
                      {eq.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{eq.code}</Text>
                  </div>
                </div>
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', margin: '12px 0' }} />

              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Loại thiết bị</Text>
                  <Text style={{ fontSize: 13 }}>{eq.type}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Giờ vận hành
                  </Text>
                  <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>
                    {eq.operatingHours.toLocaleString('vi-VN')} giờ
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>BT gần nhất</Text>
                  <Text style={{ fontSize: 13 }}>{formatDate(eq.lastMaintenanceDate)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>BT tiếp theo</Text>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#D4A843' }}>
                    {formatDate(eq.nextMaintenanceDate)}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    Vị trí
                  </Text>
                  <Text style={{ fontSize: 13 }}>{eq.location}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const renderAlertsTab = () => {
    const sortedAlerts = [...alerts].sort((a, b) => {
      const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {sortedAlerts.map((alert: MonitoringAlert, idx: number) => {
          const sevCfg = alertSeverityConfig[alert.severity];
          return (
            <Card
              key={alert.id}
              className={`alert-card ${alert.severity} animate-fade-in animate-delay-${(idx % 6) + 1}`}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Badge
                      status={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'processing'}
                    />
                    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>
                      {alert.equipmentName}
                    </Text>
                    <Tag
                      color={sevCfg.color}
                      style={{ marginLeft: 4, borderRadius: 4, fontSize: 11 }}
                    >
                      {sevCfg.label}
                    </Tag>
                    {!alert.isResolved && !alert.isRead && (
                      <Tag color="red" style={{ fontSize: 10 }}>Mới</Tag>
                    )}
                  </div>
                  <Text style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>
                    {alert.message}
                  </Text>
                  <Space size={16}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {formatDateTime(alert.timestamp)}
                    </Text>
                    {alert.threshold != null && alert.actualValue != null && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <DashboardOutlined style={{ marginRight: 4 }} />
                        Ngưỡng: {alert.threshold} | Thực tế: {alert.actualValue}
                      </Text>
                    )}
                  </Space>
                </div>
                <div>
                  {alert.isResolved ? (
                    <Tag color="success">Đã xử lý</Tag>
                  ) : (
                    <Tag color="warning">Chưa xử lý</Tag>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </Space>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Theo dõi tình trạng thiết bị' },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}
          >
            <DashboardOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              Theo dõi tình trạng thiết bị
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Giám sát trạng thái vận hành và cảnh báo - Doanh nghiệp A
            </Text>
          </div>
        </div>
      </div>

      {renderStatCards()}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'equipment',
            label: (
              <span>
                <RadarChartOutlined style={{ marginRight: 6 }} />
                Thiết bị
              </span>
            ),
            children: renderEquipmentTab(),
          },
          {
            key: 'alerts',
            label: (
              <span>
                <AlertOutlined style={{ marginRight: 6 }} />
                Cảnh báo
                <Badge
                  count={stats.unresolvedAlerts}
                  size="small"
                  style={{ marginLeft: 6 }}
                />
              </span>
            ),
            children: renderAlertsTab(),
          },
        ]}
      />
    </div>
  );
};

export default EquipmentMonitoring;
