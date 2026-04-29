import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Select, Badge, Empty,
  message, Drawer, Progress, Timeline, Tabs,
} from 'antd';
import {
  FilterOutlined, EyeOutlined, CheckCircleOutlined, BellOutlined,
  ExclamationCircleFilled, WarningFilled, InfoCircleFilled,
  ClockCircleOutlined, SafetyCertificateOutlined, ThunderboltOutlined,
  LinkOutlined, TeamOutlined, CalendarOutlined, CloseOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { alerts } from '../../data/alerts';
import { departments, getDepartmentShortName, getDepartmentName } from '../../data/departments';
import { alertSeverityConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { Alert, AlertSeverity } from '../../types';

const { Title, Text } = Typography;

const severityIcons: Record<AlertSeverity, React.ReactNode> = {
  critical: <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: 20 }} />,
  warning: <WarningFilled style={{ color: '#faad14', fontSize: 20 }} />,
  info: <InfoCircleFilled style={{ color: '#1890ff', fontSize: 20 }} />,
};

const severityIconsLarge: Record<AlertSeverity, React.ReactNode> = {
  critical: <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: 28 }} />,
  warning: <WarningFilled style={{ color: '#faad14', fontSize: 28 }} />,
  info: <InfoCircleFilled style={{ color: '#1890ff', fontSize: 28 }} />,
};

const typeLabels: Record<string, string> = {
  over_budget: 'Vượt ngân sách',
  slow_disbursement: 'Giải ngân chậm',
  pending_payment: 'ĐNTT tồn đọng',
  low_budget: 'NS còn lại thấp',
  duplicate_staff: 'Trùng lịch NS',
  deadline: 'Sắp đến hạn',
};

const typeColors: Record<string, string> = {
  over_budget: '#ff4d4f',
  slow_disbursement: '#d97706',
  pending_payment: '#7c3aed',
  low_budget: '#dc2626',
  duplicate_staff: '#0891b2',
  deadline: '#2563eb',
};

const monStyles = `
  .mon-stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .mon-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15);
  }
  .mon-stat-card .mon-bg-icon {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .mon-stat-card:hover .mon-bg-icon {
    transform: rotate(15deg) scale(1.1);
  }
  .mon-alert-item {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.25s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    cursor: pointer;
  }
  .mon-alert-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27, 58, 92, 0.12);
  }
  .mon-alert-item.resolved {
    opacity: 0.55;
  }
  .mon-alert-item.resolved:hover {
    opacity: 0.8;
  }
`;

const getRelativeTime = (dateStr: string): string => {
  const now = new Date('2026-07-01');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
};

const severityBorderColors: Record<AlertSeverity, string> = {
  critical: '#ff4d4f',
  warning: '#faad14',
  info: '#1890ff',
};

const Monitoring: React.FC = () => {
  const { currentUser, isDepartment } = useUser();
  const deptId = currentUser.departmentId;

  const [data, setData] = useState<Alert[]>(alerts);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(undefined);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Role-based data: PB chỉ xem cảnh báo phòng mình
  const baseData = useMemo(() => {
    if (isDepartment) return data.filter(a => a.departmentId === deptId);
    return data;
  }, [data, isDepartment, deptId]);

  const filteredData = useMemo(() => {
    let result = baseData;
    if (severityFilter) result = result.filter((a) => a.severity === severityFilter);
    if (departmentFilter) result = result.filter((a) => a.departmentId === departmentFilter);
    if (resolvedFilter !== undefined) result = result.filter((a) => a.isResolved === resolvedFilter);
    // Tab filter
    if (activeTab === 'unread') result = result.filter(a => !a.isRead);
    if (activeTab === 'unresolved') result = result.filter(a => !a.isResolved);
    if (activeTab === 'resolved') result = result.filter(a => a.isResolved);
    return result;
  }, [baseData, severityFilter, departmentFilter, resolvedFilter, activeTab]);

  const stats = useMemo(() => ({
    total: baseData.filter(a => !a.isResolved).length,
    critical: baseData.filter((a) => a.severity === 'critical' && !a.isResolved).length,
    warning: baseData.filter((a) => a.severity === 'warning' && !a.isResolved).length,
    info: baseData.filter((a) => a.severity === 'info' && !a.isResolved).length,
    unread: baseData.filter(a => !a.isRead).length,
  }), [baseData]);

  const statCardsData = [
    {
      title: 'Nghiêm trọng',
      value: stats.critical,
      suffix: 'cảnh báo',
      icon: <ExclamationCircleFilled />,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
    },
    {
      title: 'Cảnh báo',
      value: stats.warning,
      suffix: 'cảnh báo',
      icon: <WarningFilled />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    },
    {
      title: 'Thông tin',
      value: stats.info,
      suffix: 'thông báo',
      icon: <InfoCircleFilled />,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    },
    {
      title: 'Tổng chưa xử lý',
      value: stats.total,
      suffix: 'mục',
      icon: <BellOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    },
  ];

  // Available departments for filter
  const availableDepts = useMemo(() => {
    const ids = new Set(baseData.map(a => a.departmentId));
    return departments.filter(d => ids.has(d.id));
  }, [baseData]);

  const markRead = (id: string) => {
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    message.success('Đã đánh dấu đã đọc');
  };

  const markResolved = (id: string) => {
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, isResolved: true, isRead: true } : a)));
    message.success('Đã đánh dấu đã xử lý');
    // Update drawer state if open
    setSelectedAlert(prev => prev && prev.id === id ? { ...prev, isResolved: true, isRead: true } : prev);
  };

  const markAllRead = () => {
    setData((prev) => prev.map((a) => ({ ...a, isRead: true })));
    message.success('Đã đánh dấu tất cả đã đọc');
  };

  const openDetail = (alert: Alert) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
    // Auto mark as read
    if (!alert.isRead) {
      setData((prev) => prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a)));
    }
  };

  // ═══════════════════════════════════════════════════════════
  // DETAIL DRAWER
  // ═══════════════════════════════════════════════════════════
  const renderDetailDrawer = () => {
    if (!selectedAlert) return null;
    const alert = selectedAlert;
    const sevCfg = alertSeverityConfig[alert.severity];

    const sevBg: Record<AlertSeverity, string> = {
      critical: 'linear-gradient(135deg, #dc2626 0%, #991b1b 60%, #7f1d1d 100%)',
      warning: 'linear-gradient(135deg, #d97706 0%, #92400e 60%, #78350f 100%)',
      info: 'linear-gradient(135deg, #2563eb 0%, #1e40af 60%, #1e3a8a 100%)',
    };

    return (
      <Drawer
        title={null}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedAlert(null); }}
        width={560}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
      >
        {/* Gradient header */}
        <div style={{
          background: sevBg[alert.severity],
          padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {severityIconsLarge[alert.severity]}
              </div>
              <div>
                <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', fontSize: 11 }}>
                  {sevCfg.label}
                </Tag>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: 'none', fontSize: 10, marginLeft: 4 }}>
                  {typeLabels[alert.type] || alert.type}
                </Tag>
              </div>
            </div>
            <Button type="text" onClick={() => { setDrawerOpen(false); setSelectedAlert(null); }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginTop: -4 }}>×</Button>
          </div>

          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: '24px', maxWidth: 420 }}>
            {alert.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(alert.createdAt)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              · {getRelativeTime(alert.createdAt)}
            </Text>
            {alert.isResolved && (
              <Tag style={{ background: 'rgba(82,196,26,0.3)', color: '#fff', border: 'none', fontSize: 10 }}>
                <CheckCircleOutlined style={{ marginRight: 3 }} /> Đã xử lý
              </Tag>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 28px' }}>
          {/* Description */}
          <div style={{
            padding: '14px 16px', borderRadius: 10, marginBottom: 20,
            background: alert.severity === 'critical' ? '#fef2f2' : alert.severity === 'warning' ? '#fffbeb' : '#eff6ff',
            borderLeft: `3px solid ${severityBorderColors[alert.severity]}`,
          }}>
            <Text style={{ fontSize: 10, color: '#999', display: 'block', marginBottom: 4 }}>Mô tả chi tiết</Text>
            <Text style={{ fontSize: 13, lineHeight: '20px' }}>{alert.description}</Text>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Mã cảnh báo</Text>
              <Text strong style={{ fontSize: 13, fontFamily: 'monospace' }}>{alert.id}</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Loại cảnh báo</Text>
              <Tag color={typeColors[alert.type]} style={{ margin: '2px 0 0', fontSize: 11 }}>
                {typeLabels[alert.type] || alert.type}
              </Tag>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phòng ban</Text>
              <Text strong style={{ fontSize: 12 }}>{getDepartmentName(alert.departmentId || '')}</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Mức độ</Text>
              <Tag color={sevCfg.color} style={{ margin: '2px 0 0', fontSize: 11, color: '#fff' }}>
                {sevCfg.label}
              </Tag>
            </div>
          </div>

          {/* Related entity */}
          {alert.relatedEntity && (
            <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              title={<Space><LinkOutlined style={{ color: colors.navy }} /><span style={{ fontSize: 13 }}>Đối tượng liên quan</span></Space>}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${colors.navy}10`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <ThunderboltOutlined style={{ color: colors.navy, fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 13 }}>{alert.relatedEntity}</Text>
                  {alert.relatedEntityId && (
                    <div><Text style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{alert.relatedEntityId}</Text></div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<span style={{ fontSize: 13 }}>Lịch sử</span>}>
            <Timeline items={[
              {
                color: severityBorderColors[alert.severity],
                dot: <AlertOutlined style={{ fontSize: 14 }} />,
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>Phát sinh cảnh báo</Text>
                    <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(alert.createdAt)} — Hệ thống tự động</Text></div>
                  </div>
                ),
              },
              ...(alert.isRead ? [{
                color: 'blue' as const,
                dot: <EyeOutlined style={{ fontSize: 14 }} />,
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>Đã xem</Text>
                    <div><Text type="secondary" style={{ fontSize: 11 }}>Người dùng đã đọc cảnh báo</Text></div>
                  </div>
                ),
              }] : []),
              ...(alert.isResolved ? [{
                color: 'green' as const,
                dot: <CheckCircleOutlined style={{ fontSize: 14 }} />,
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>Đã xử lý</Text>
                    <div><Text type="secondary" style={{ fontSize: 11 }}>Cảnh báo đã được giải quyết</Text></div>
                  </div>
                ),
              }] : []),
            ]} />
          </Card>

          {/* Actions */}
          {!alert.isResolved && (
            <Card size="small" style={{ borderRadius: 10, border: '1px dashed #d9d9d9' }}
              bodyStyle={{ padding: '16px 20px' }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Xử lý cảnh báo</Text>
              <Space>
                <Button type="primary" icon={<CheckCircleOutlined />}
                  onClick={() => markResolved(alert.id)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                  Đánh dấu đã xử lý
                </Button>
                <Button icon={<EyeOutlined />}
                  onClick={() => message.info('Chuyển đến đối tượng liên quan...')}>
                  Xem chi tiết đối tượng
                </Button>
              </Space>
            </Card>
          )}
        </div>
      </Drawer>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div>
      <style>{monStyles}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ color: colors.navy, margin: 0 }}>Giám sát &amp; Cảnh báo</Title>
          {isDepartment && (
            <Text style={{ fontSize: 12, color: '#999' }}>
              {getDepartmentName(deptId)}
            </Text>
          )}
        </div>
        {stats.unread > 0 && (
          <Button type="default" size="small" onClick={markAllRead}
            style={{ borderRadius: 6 }}>
            <BellOutlined /> Đánh dấu tất cả đã đọc ({stats.unread})
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="mon-stat-card" style={{
              background: card.gradient,
              borderRadius: 12, padding: '14px 16px 12px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div className="mon-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
              }}>
                {card.icon}
              </div>
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
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {String(card.value).padStart(2, '0')} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.suffix}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FilterOutlined style={{ color: '#999' }} />
          <Select
            allowClear
            placeholder="Mức độ"
            style={{ width: 150 }}
            value={severityFilter}
            onChange={setSeverityFilter}
            options={Object.entries(alertSeverityConfig).map(([k, v]) => ({ label: v.label, value: k }))}
          />
          {!isDepartment && (
            <Select
              allowClear
              placeholder="Phòng ban"
              style={{ width: 200 }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={availableDepts.map((d) => ({ label: d.shortName, value: d.id }))}
            />
          )}
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={resolvedFilter}
            onChange={setResolvedFilter}
            options={[
              { label: 'Chưa xử lý', value: false },
              { label: 'Đã xử lý', value: true },
            ]}
          />
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
            Hiển thị {filteredData.length} / {baseData.length} cảnh báo
          </Text>
        </div>
      </Card>

      {/* Tab quick filters */}
      <Card style={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: <span>Tất cả <Badge count={baseData.length} size="small" style={{ marginLeft: 4 }} showZero /></span> },
            { key: 'unread', label: <span>Chưa đọc {stats.unread > 0 && <Badge count={stats.unread} size="small" style={{ marginLeft: 4, backgroundColor: '#ff4d4f' }} />}</span> },
            { key: 'unresolved', label: <span>Chưa xử lý <Badge count={stats.total} size="small" style={{ marginLeft: 4, backgroundColor: '#faad14' }} showZero /></span> },
            { key: 'resolved', label: 'Đã xử lý' },
          ]}
        />

        {/* Alert list */}
        {filteredData.length === 0 ? (
          <Empty description="Không có cảnh báo nào" style={{ padding: '40px 0' }} />
        ) : (
          <Row gutter={[16, 16]} style={{ marginTop: 4 }}>
            {filteredData.map((alert) => {
              const sevCfg = alertSeverityConfig[alert.severity];
              return (
                <Col xs={24} lg={12} key={alert.id}>
                  <div
                    className={`mon-alert-item ${alert.isResolved ? 'resolved' : ''}`}
                    onClick={() => openDetail(alert)}
                    style={{
                      borderLeft: `4px solid ${severityBorderColors[alert.severity]}`,
                    }}
                  >
                    <div style={{ padding: '14px 18px' }}>
                      {/* Row 1: Severity + Type + Time + Unread badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <Space size={6}>
                          <Tag color={sevCfg.color} style={{ fontSize: 10, margin: 0, color: '#fff', border: 'none', lineHeight: '18px' }}>
                            {sevCfg.label}
                          </Tag>
                          <Tag style={{ fontSize: 10, margin: 0, color: typeColors[alert.type], background: `${typeColors[alert.type]}10`, border: `1px solid ${typeColors[alert.type]}30`, lineHeight: '18px' }}>
                            {typeLabels[alert.type] || alert.type}
                          </Tag>
                        </Space>
                        <Space size={6}>
                          {!alert.isRead && (
                            <Badge status="processing" />
                          )}
                          {alert.isResolved && (
                            <Tag color="success" style={{ fontSize: 9, margin: 0, lineHeight: '16px' }}>Đã xử lý</Tag>
                          )}
                        </Space>
                      </div>

                      {/* Row 2: Title */}
                      <Text strong style={{
                        fontSize: 14, display: 'block', marginBottom: 6, lineHeight: '20px',
                        color: !alert.isRead && !alert.isResolved ? colors.navy : undefined,
                      }}>
                        {alert.title}
                      </Text>

                      {/* Row 3: Description (truncated) */}
                      <Text style={{ fontSize: 12, color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', lineHeight: '18px', marginBottom: 8 }}>
                        {alert.description}
                      </Text>

                      {/* Row 4: Meta info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size={12}>
                          <Text style={{ fontSize: 11, color: '#999' }}>
                            <TeamOutlined style={{ marginRight: 3 }} />
                            {getDepartmentShortName(alert.departmentId || '')}
                          </Text>
                          {alert.relatedEntity && (
                            <Text style={{ fontSize: 11, color: '#bbb' }}>
                              <LinkOutlined style={{ marginRight: 3 }} />
                              {alert.relatedEntity.length > 30 ? alert.relatedEntity.substring(0, 30) + '...' : alert.relatedEntity}
                            </Text>
                          )}
                        </Space>
                        <Text style={{ fontSize: 11, color: '#bbb' }}>
                          <ClockCircleOutlined style={{ marginRight: 3 }} />
                          {getRelativeTime(alert.createdAt)}
                        </Text>
                      </div>

                      {/* Urgency indicator for critical */}
                      {alert.severity === 'critical' && !alert.isResolved && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: '#fee2e2' }}>
                            <div style={{
                              width: '85%', height: '100%',
                              background: 'linear-gradient(90deg, #ff4d4f, #dc2626)',
                              borderRadius: 2,
                              animation: 'pulse 2s infinite',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Detail Drawer */}
      {renderDetailDrawer()}
    </div>
  );
};

export default Monitoring;
