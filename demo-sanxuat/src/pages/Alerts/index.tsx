import { useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Button, Select, Switch, Tag, Badge, Space, Empty, Dropdown } from 'antd';
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ToolOutlined,
  BellOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { alerts } from '../../data/alerts';
import { alertSeverityConfig, formatDateTime } from '../../utils/format';
import type { AlertSeverity } from '../../types';

const { Title, Text, Paragraph } = Typography;

const alertTypeLabels: Record<string, string> = {
  delay: 'Chậm tiến độ',
  material_shortage: 'Thiếu vật tư',
  quality_issue: 'Lỗi chất lượng',
  capacity_overload: 'Quá tải công suất',
  material_variance: 'Sai lệch vật tư',
  step_blocked: 'Tắc nghẽn công đoạn',
};

const workshopLabels: Record<string, string> = {
  PX1: 'PX1 - Bảo trì Hệ thống Monitoring',
  PX2: 'PX2 - Bảo trì Cluster Server',
  PX3: 'PX3 - Hạ tầng',
  PX4: 'PX4 - Phát triển Phần mềm',
};

const severityIcons: Record<AlertSeverity, React.ReactNode> = {
  critical: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
  warning: <WarningOutlined style={{ color: '#faad14' }} />,
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
};

const statCardStyles: Record<AlertSeverity, { bg: string; border: string }> = {
  critical: {
    bg: 'linear-gradient(135deg, #ff4d4f, #cf1322)',
    border: '#ff4d4f',
  },
  warning: {
    bg: 'linear-gradient(135deg, #faad14, #d48806)',
    border: '#faad14',
  },
  info: {
    bg: 'linear-gradient(135deg, #1890ff, #096dd9)',
    border: '#1890ff',
  },
};

const Alerts = () => {
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (!showResolved && a.isResolved) return false;
      return true;
    });
  }, [severityFilter, typeFilter, showResolved]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.isResolved).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.isResolved).length;
  const infoCount = alerts.filter((a) => a.severity === 'info' && !a.isResolved).length;

  const statCards: { key: AlertSeverity; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'critical', label: 'Nghiêm trọng', count: criticalCount, icon: <ExclamationCircleOutlined /> },
    { key: 'warning', label: 'Cảnh báo', count: warningCount, icon: <WarningOutlined /> },
    { key: 'info', label: 'Thông tin', count: infoCount, icon: <InfoCircleOutlined /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          Cảnh báo sản xuất
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Theo dõi và xử lý cảnh báo trong quá trình sản xuất — Trung tâm Phần mềm Alpha
        </Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((stat) => (
          <Col xs={24} sm={8} key={stat.key}>
            <Card
              className="db-stat-card"
              style={{
                background: statCardStyles[stat.key].bg,
                borderRadius: 14,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  fontSize: 64,
                  opacity: 0.1,
                  color: '#fff',
                }}
              >
                {stat.icon}
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  color: '#fff',
                  marginBottom: 10,
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                  {stat.count}
                  <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 6, fontWeight: 400 }}>
                    cảnh báo
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        style={{ borderRadius: 14, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '12px 20px' } }}
      >
        <Space wrap size="middle" style={{ width: '100%' }}>
          <div>
            <Text style={{ fontSize: 12, color: '#8c8c8c', marginRight: 8 }}>Mức độ:</Text>
            <Select
              value={severityFilter}
              onChange={setSeverityFilter}
              style={{ width: 160 }}
              size="small"
              options={[
                { value: 'all', label: 'Tất cả mức độ' },
                { value: 'critical', label: 'Nghiêm trọng' },
                { value: 'warning', label: 'Cảnh báo' },
                { value: 'info', label: 'Thông tin' },
              ]}
            />
          </div>
          <div>
            <Text style={{ fontSize: 12, color: '#8c8c8c', marginRight: 8 }}>Loại:</Text>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 200 }}
              size="small"
              options={[
                { value: 'all', label: 'Tất cả loại' },
                ...Object.entries(alertTypeLabels).map(([k, v]) => ({ value: k, label: v })),
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Hiển thị đã xử lý:</Text>
            <Switch
              size="small"
              checked={showResolved}
              onChange={setShowResolved}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị {filteredAlerts.length}/{alerts.length} cảnh báo
          </Text>
        </Space>
      </Card>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.map((alert) => {
          const sevConfig = alertSeverityConfig[alert.severity];
          return (
            <Card
              key={alert.id}
              className={`alert-card ${alert.severity}`}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                opacity: alert.isResolved ? 0.7 : 1,
              }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    {severityIcons[alert.severity]}
                    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>
                      {!alert.isRead && (
                        <Badge dot offset={[-4, 0]} style={{ marginRight: 6 }}>
                          <span />
                        </Badge>
                      )}
                      {alert.title}
                    </Text>
                    <Tag
                      color={sevConfig.color}
                      style={{ fontSize: 11, marginLeft: 4 }}
                    >
                      {sevConfig.label}
                    </Tag>
                    {alert.isResolved && (
                      <Tag
                        icon={<CheckCircleOutlined />}
                        color="success"
                        style={{ fontSize: 11 }}
                      >
                        Đã xử lý
                      </Tag>
                    )}
                  </div>
                  <Paragraph
                    type="secondary"
                    style={{ fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {alert.description}
                  </Paragraph>
                  <Space size="middle" wrap>
                    {alert.relatedOrderCode && (
                      <Text style={{ fontSize: 12, color: '#1B3A5C' }}>
                        <FileTextOutlined style={{ marginRight: 4, opacity: 0.6 }} />
                        Lệnh SX: <strong>{alert.relatedOrderCode}</strong>
                      </Text>
                    )}
                    {alert.workshopId && (
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {workshopLabels[alert.workshopId] || alert.workshopId}
                      </Text>
                    )}
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                      Loại: {alertTypeLabels[alert.type] || alert.type}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {formatDateTime(alert.createdAt)}
                    </Text>
                  </Space>
                </Col>
                <Col flex="none">
                  {!alert.isResolved && (
                    <Dropdown
                      menu={{
                        items: [
                          ...(!alert.isRead ? [{ key: 'read', icon: <EyeOutlined />, label: 'Đánh dấu đã đọc' }] : []),
                          { key: 'resolve', icon: <ToolOutlined />, label: 'Xử lý' },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
                    </Dropdown>
                  )}
                </Col>
              </Row>
            </Card>
          );
        })}

        {filteredAlerts.length === 0 && (
          <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
            <Empty
              description={
                <Text type="secondary">Không có cảnh báo nào phù hợp với bộ lọc</Text>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Alerts;
