import React, { useState, useMemo } from 'react';
import { Card, Tag, Row, Col, Select, Space, Button, Statistic, Badge, Checkbox, Typography } from 'antd';
import {
  AlertOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { alerts } from '../../data/alerts';
import { alertSeverityConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Alert, AlertSeverity } from '../../types';

const { Text } = Typography;

const pageStyles = `
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

  .monitoring-page {
    animation: monFadeIn 0.5s ease-out;
  }
  @keyframes monFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .alert-card {
    padding: 16px 20px;
    border-radius: 10px;
    border-left: 4px solid transparent;
    background: #ffffff;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .alert-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  .alert-card.critical {
    border-left-color: #ff4d4f;
    background: linear-gradient(90deg, rgba(255,77,79,0.03) 0%, #ffffff 30%);
  }
  .alert-card.warning {
    border-left-color: #faad14;
    background: linear-gradient(90deg, rgba(250,173,20,0.03) 0%, #ffffff 30%);
  }
  .alert-card.info {
    border-left-color: #1890ff;
    background: linear-gradient(90deg, rgba(24,144,255,0.03) 0%, #ffffff 30%);
  }
  .alert-card-content {
    flex: 1;
    min-width: 0;
  }
  .alert-card-title {
    font-size: 14px;
    font-weight: 600;
    color: ${colors.navyDark};
    margin-bottom: 4px;
  }
  .alert-card-desc {
    font-size: 13px;
    color: ${colors.textSecondary};
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .alert-card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .alert-card-date {
    font-size: 12px;
    color: ${colors.textSecondary};
  }
  .alert-card-code {
    font-size: 12px;
    font-weight: 600;
    color: ${colors.navy};
  }
  .alert-resolved {
    opacity: 0.5;
  }
`;

const severityIconMap: Record<string, React.ReactNode> = {
  critical: <WarningOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />,
  warning: <AlertOutlined style={{ fontSize: 20, color: '#faad14' }} />,
  info: <InfoCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />,
};

const alertTypeOptions = [
  { value: 'overdue', label: 'Chậm tiến độ' },
  { value: 'over_budget', label: 'Vượt dự toán' },
  { value: 'recurring_failure', label: 'Lỗi lặp lại' },
  { value: 'pending_approval', label: 'Chờ phê duyệt' },
];

const Monitoring: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [showResolved, setShowResolved] = useState(false);

  const stats = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter((a) => a.severity === 'critical').length;
    const unresolved = alerts.filter((a) => !a.isResolved).length;
    return { total, critical, unresolved };
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSeverity = !selectedSeverity || a.severity === selectedSeverity;
      const matchType = !selectedType || a.type === selectedType;
      const matchResolved = showResolved || !a.isResolved;
      return matchSeverity && matchType && matchResolved;
    }).sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }, [selectedSeverity, selectedType, showResolved]);

  return (
    <div className="monitoring-page">
      <style>{pageStyles}</style>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
          >
            <div className="db-bg-icon"><AlertOutlined /></div>
            <div className="db-icon-badge"><AlertOutlined /></div>
            <div className="db-stat-value">{stats.total}</div>
            <div className="db-stat-label">Tổng cảnh báo</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, #d94444, ${colors.danger})` }}
          >
            <div className="db-bg-icon"><WarningOutlined /></div>
            <div className="db-icon-badge"><WarningOutlined /></div>
            <div className="db-stat-value">{stats.critical}</div>
            <div className="db-stat-label">Nghiêm trọng</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, ${colors.gold}, #c49b38)` }}
          >
            <div className="db-bg-icon"><InfoCircleOutlined /></div>
            <div className="db-icon-badge"><InfoCircleOutlined /></div>
            <div className="db-stat-value">{stats.unresolved}</div>
            <div className="db-stat-label">Chưa xử lý</div>
          </div>
        </Col>
      </Row>

      {/* Filters + Alert List */}
      <Card
        className="db-chart-card"
        title={
          <Space>
            <span
              className="db-card-title-icon"
              style={{ background: `linear-gradient(135deg, ${colors.danger}, #d94444)` }}
            >
              <AlertOutlined />
            </span>
            <span>Danh sách cảnh báo</span>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Mức độ"
            value={selectedSeverity}
            onChange={(val) => setSelectedSeverity(val)}
            allowClear
            style={{ width: 160 }}
            options={Object.entries(alertSeverityConfig).map(([key, cfg]) => ({
              value: key,
              label: cfg.label,
            }))}
          />
          <Select
            placeholder="Loại cảnh báo"
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            allowClear
            style={{ width: 180 }}
            options={alertTypeOptions}
          />
          <Checkbox
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          >
            Hiển thị đã xử lý
          </Checkbox>
        </Space>

        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: colors.success, marginBottom: 12 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Không có cảnh báo nào</Text>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${alert.severity}${alert.isResolved ? ' alert-resolved' : ''}`}
            >
              <div style={{ paddingTop: 2 }}>
                {severityIconMap[alert.severity]}
              </div>
              <div className="alert-card-content">
                <div className="alert-card-title">
                  {alert.title}
                  {!alert.isRead && (
                    <Badge
                      dot
                      offset={[6, 0]}
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </div>
                <div className="alert-card-desc">{alert.description}</div>
                <div className="alert-card-meta">
                  <Tag color={alertSeverityConfig[alert.severity]?.color}>
                    {alertSeverityConfig[alert.severity]?.label}
                  </Tag>
                  {alert.relatedCode && (
                    <span className="alert-card-code">{alert.relatedCode}</span>
                  )}
                  <span className="alert-card-date">{formatDate(alert.createdDate)}</span>
                  {alert.isResolved && (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Đã xử lý</Tag>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default Monitoring;
