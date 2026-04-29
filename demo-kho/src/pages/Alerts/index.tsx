import { useState, useMemo } from 'react';
import {
  Row, Col, Card, Typography, Tag, Button, Space, Badge,
  Select, Input, Empty, Tooltip, Divider,
} from 'antd';
import {
  AlertOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BellOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  ExportOutlined,
  FieldTimeOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { alerts as alertsData } from '../../data/alerts';
import type { Alert, AlertSeverity, AlertType } from '../../types';
import { alertSeverityConfig, alertTypeConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

// ─── Alert type icons ────────────────────────────────────
const alertTypeIcons: Record<AlertType, React.ReactNode> = {
  low_stock: <FallOutlined />,
  expired: <CloseCircleOutlined />,
  near_expiry: <FieldTimeOutlined />,
  overstock: <RiseOutlined />,
  slow_moving: <ClockCircleOutlined />,
  pending_receipt: <InboxOutlined />,
  pending_dispatch: <ExportOutlined />,
};

// ─── Severity styles ─────────────────────────────────────
const severityBorder: Record<AlertSeverity, string> = {
  critical: '#ff4d4f',
  warning: '#faad14',
  info: '#1890ff',
};

// ─── Time ago helper ──────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const now = dayjs('2026-04-14');
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

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);
  const [searchText, setSearchText] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  // ─── Stats ────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    unread: alerts.filter(a => !a.isRead).length,
    resolved: alerts.filter(a => a.isResolved).length,
  }), [alerts]);

  // ─── Filtered alerts ──────────────────────────────────
  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (searchText && !a.title.toLowerCase().includes(searchText.toLowerCase()) &&
        !a.description.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
      if (filterType !== 'all' && a.type !== filterType) return false;
      if (filterRead === 'unread' && a.isRead) return false;
      if (filterRead === 'read' && !a.isRead) return false;
      return true;
    });
  }, [alerts, searchText, filterSeverity, filterType, filterRead]);

  // ─── Actions ──────────────────────────────────────────
  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const resolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true, isRead: true } : a));
  };

  // ─── Stat card style ──────────────────────────────────
  const statCardStyle = (gradient: string) => ({
    background: gradient,
    borderRadius: 12,
    border: 'none',
    cursor: 'default',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s',
  });

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: colors.navy }}>Cảnh báo hệ thống</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Theo dõi và xử lý các cảnh báo tồn kho, hạn sử dụng và vật tư bất thường</Text>
          </div>
        </Space>
      </div>

      {/* ── KPI Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Tổng cảnh báo',
            value: stats.total,
            icon: <BellOutlined style={{ fontSize: 64, color: '#fff' }} />,
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          },
          {
            label: 'Nghiêm trọng',
            value: stats.critical,
            icon: <CloseCircleOutlined style={{ fontSize: 64, color: '#fff' }} />,
            gradient: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
          },
          {
            label: 'Cảnh báo',
            value: stats.warning,
            icon: <WarningOutlined style={{ fontSize: 64, color: '#fff' }} />,
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
          },
          {
            label: 'Chưa đọc',
            value: stats.unread,
            icon: <EyeOutlined style={{ fontSize: 64, color: '#fff' }} />,
            gradient: 'linear-gradient(135deg, #096dd9, #1890ff)',
          },
        ].map(({ label, value, icon, gradient }) => (
          <Col xs={12} sm={6} key={label}>
            <Card style={statCardStyle(gradient)} styles={{ body: { padding: '16px 20px' } }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: -8, right: -8, opacity: 0.1,
                  fontSize: 64, lineHeight: 1, pointerEvents: 'none',
                }}>
                  {icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>{label}</div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                  {value}
                  <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, opacity: 0.7 }}>cảnh báo</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Filter card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm cảnh báo..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              value={filterSeverity}
              onChange={setFilterSeverity}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả mức độ' },
                { value: 'critical', label: 'Nghiêm trọng' },
                { value: 'warning', label: 'Cảnh báo' },
                { value: 'info', label: 'Thông tin' },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả loại' },
                { value: 'low_stock', label: 'Dưới mức tối thiểu' },
                { value: 'expired', label: 'Đã hết hạn' },
                { value: 'near_expiry', label: 'Sắp hết hạn' },
                { value: 'overstock', label: 'Vượt mức tối đa' },
                { value: 'slow_moving', label: 'Chậm luân chuyển' },
                { value: 'pending_receipt', label: 'Chờ nhận hàng' },
                { value: 'pending_dispatch', label: 'Chờ xuất hàng' },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filterRead}
              onChange={setFilterRead}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'unread', label: 'Chưa đọc' },
                { value: 'read', label: 'Đã đọc' },
              ]}
            />
          </Col>
          <Col xs={24} md={3} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {filtered.length} / {alerts.length}
            </Text>
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
            >
              Đánh dấu đã đọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ── Main card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Alert list */}
        <div style={{ padding: '12px 16px' }}>
          {filtered.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có cảnh báo nào"
              style={{ padding: '40px 0' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid #f0f0f0',
                    background: '#fff',
                    opacity: alert.isResolved ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      {!alert.isRead && (
                        <Badge color={severityBorder[alert.severity]} />
                      )}
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color: alert.isRead ? '#555' : colors.navy,
                        }}
                      >
                        {alert.title}
                      </Text>
                      <Tag
                        color={alertSeverityConfig[alert.severity].color}
                        style={{ fontSize: 11, padding: '0 6px', lineHeight: '18px', border: 'none' }}
                      >
                        {alertSeverityConfig[alert.severity].label}
                      </Tag>
                      <Tag
                        style={{
                          fontSize: 11, padding: '0 6px', lineHeight: '18px',
                          background: `${alertTypeConfig[alert.type].color}15`,
                          border: `1px solid ${alertTypeConfig[alert.type].color}40`,
                          color: alertTypeConfig[alert.type].color,
                        }}
                      >
                        {alertTypeIcons[alert.type]} {alertTypeConfig[alert.type].label}
                      </Tag>
                      {alert.isResolved && (
                        <Tag color="success" style={{ fontSize: 11, padding: '0 6px', lineHeight: '18px' }}>
                          <CheckCircleOutlined /> Đã xử lý
                        </Tag>
                      )}
                    </div>
                    <Text style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
                      {alert.description}
                    </Text>
                    <Space size={16} style={{ flexWrap: 'wrap' }}>
                      {alert.warehouseId && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <InboxOutlined style={{ marginRight: 4 }} />
                          {alert.warehouseId}
                        </Text>
                      )}
                      {alert.productId && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ShoppingCartOutlined style={{ marginRight: 4 }} />
                          {alert.productId}
                        </Text>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {timeAgo(alert.createdAt)}
                      </Text>
                    </Space>
                  </div>

                  {/* Actions */}
                  <Space direction="vertical" size={6} style={{ flexShrink: 0 }}>
                    {!alert.isRead && (
                      <Tooltip title="Đánh dấu đã đọc">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => markAsRead(alert.id)}
                          style={{ fontSize: 12 }}
                        >
                          Đã đọc
                        </Button>
                      </Tooltip>
                    )}
                    {!alert.isResolved && (
                      <Tooltip title="Đánh dấu đã xử lý">
                        <Button
                          size="small"
                          type={alert.isRead ? 'primary' : 'default'}
                          icon={<CheckCircleOutlined />}
                          onClick={() => resolve(alert.id)}
                          style={{ fontSize: 12 }}
                        >
                          Xử lý xong
                        </Button>
                      </Tooltip>
                    )}
                  </Space>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex', gap: 20, flexWrap: 'wrap',
          }}>
            {['critical', 'warning', 'info'].map((sev) => {
              const count = filtered.filter(a => a.severity === sev).length;
              if (!count) return null;
              const cfg = alertSeverityConfig[sev as AlertSeverity];
              return (
                <Space key={sev} size={6}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: cfg.color }} />
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {cfg.label}: <strong>{count}</strong>
                  </Text>
                </Space>
              );
            })}
            <Divider type="vertical" />
            <Space size={6}>
              <InfoCircleOutlined style={{ color: '#999', fontSize: 12 }} />
              <Text style={{ fontSize: 12, color: '#999' }}>
                Đã xử lý: {filtered.filter(a => a.isResolved).length} / {filtered.length}
              </Text>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AlertsPage;
