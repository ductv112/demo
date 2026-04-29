import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Badge,
  Button,
  message,
  Input,
  Select,
  Space,
  Tooltip,
} from 'antd';
import {
  ExclamationCircleFilled,
  WarningFilled,
  InfoCircleFilled,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  AlertOutlined,
  SearchOutlined,
  CheckOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { alerts } from '../../data/alerts';
import { alertSeverityConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Alert, AlertSeverity } from '../../types';

const { Title, Text } = Typography;

const severityIcons: Record<AlertSeverity, React.ReactNode> = {
  critical: <ExclamationCircleFilled style={{ color: colors.danger, fontSize: 20 }} />,
  warning: <WarningFilled style={{ color: colors.warning, fontSize: 20 }} />,
  info: <InfoCircleFilled style={{ color: colors.info, fontSize: 20 }} />,
};

const severityBgColors: Record<AlertSeverity, string> = {
  critical: '#fff2f0',
  warning: '#fffbe6',
  info: '#f0f7ff',
};

const severityBorderColors: Record<AlertSeverity, string> = {
  critical: colors.danger,
  warning: colors.warning,
  info: colors.info,
};

const Monitoring: React.FC = () => {
  const [data, setData] = useState<Alert[]>(alerts);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Stats — dựa trên toàn bộ data, không bị ảnh hưởng bởi filter
  const stats = useMemo(() => ({
    total: data.length,
    critical: data.filter(a => a.severity === 'critical').length,
    warning: data.filter(a => a.severity === 'warning').length,
    info: data.filter(a => a.severity === 'info').length,
  }), [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(a => {
      const keyword = search.trim().toLowerCase();
      if (keyword) {
        const inTitle = a.title.toLowerCase().includes(keyword);
        const inDesc = a.description?.toLowerCase().includes(keyword) ?? false;
        const inEntity = a.relatedEntityId?.toLowerCase().includes(keyword) ?? false;
        if (!inTitle && !inDesc && !inEntity) return false;
      }
      if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
      if (filterStatus === 'unread' && a.isRead) return false;
      if (filterStatus === 'read' && (!a.isRead || a.isResolved)) return false;
      if (filterStatus === 'resolved' && !a.isResolved) return false;
      return true;
    });
  }, [data, search, filterSeverity, filterStatus]);

  const hasFilter = search !== '' || filterSeverity !== 'all' || filterStatus !== 'all';
  const clearFilter = () => {
    setSearch('');
    setFilterSeverity('all');
    setFilterStatus('all');
  };

  const statCards = [
    {
      title: 'Tổng cảnh báo',
      value: stats.total,
      suffix: 'cảnh báo',
      icon: <BellOutlined />,
      gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
    },
    {
      title: 'Nghiêm trọng',
      value: stats.critical,
      suffix: 'cảnh báo',
      icon: <ExclamationCircleFilled />,
      gradient: `linear-gradient(135deg, #dc2626 0%, #f87171 100%)`,
    },
    {
      title: 'Cảnh báo',
      value: stats.warning,
      suffix: 'cảnh báo',
      icon: <WarningFilled />,
      gradient: `linear-gradient(135deg, #d97706 0%, #fbbf24 100%)`,
    },
    {
      title: 'Thông tin',
      value: stats.info,
      suffix: 'thông báo',
      icon: <InfoCircleFilled />,
      gradient: `linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)`,
    },
  ];

  const markRead = (id: string) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    message.success('Đã đánh dấu đã đọc');
  };

  const markResolved = (id: string) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, isResolved: true, isRead: true } : a));
    message.success('Đã đánh dấu đã xử lý');
  };

  const markAllRead = () => {
    setData(prev => prev.map(a => ({ ...a, isRead: true })));
    message.success('Đã đánh dấu tất cả đã đọc');
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: colors.navy }}>
          <AlertOutlined style={{ marginRight: 8 }} />Giám sát & Cảnh báo
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Theo dõi và xử lý các cảnh báo hệ thống
        </Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              styles={{ body: { padding: 0 } }}
              bordered={false}
            >
              <div style={{
                background: card.gradient,
                padding: '20px 20px 18px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div className="db-bg-icon" style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 64,
                  opacity: 0.1,
                  color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 16,
                  marginBottom: 12,
                }}>
                  {card.icon}
                </div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '32px' }}>
                  {card.value}
                  <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>
                    {card.suffix}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
                  {card.title}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Filter Card ─── */}
      <Card
        bordered={false}
        style={{ borderRadius: 14, marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Space size={12} wrap>
              <Input
                placeholder="Tìm kiếm theo tiêu đề, mô tả, mã hợp đồng..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 300 }}
                allowClear
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Select
                placeholder="Mức độ"
                style={{ width: 160 }}
                allowClear
                value={filterSeverity === 'all' ? undefined : filterSeverity}
                onChange={v => setFilterSeverity(v ?? 'all')}
                options={[
                  { value: 'critical', label: 'Nghiêm trọng' },
                  { value: 'warning', label: 'Cảnh báo' },
                  { value: 'info', label: 'Thông tin' },
                ]}
              />
              <Select
                placeholder="Trạng thái"
                style={{ width: 160 }}
                allowClear
                value={filterStatus === 'all' ? undefined : filterStatus}
                onChange={v => setFilterStatus(v ?? 'all')}
                options={[
                  { value: 'unread', label: 'Chưa đọc' },
                  { value: 'read', label: 'Đã đọc' },
                  { value: 'resolved', label: 'Đã xử lý' },
                ]}
              />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {filteredData.length}/{data.length} kết quả
              </Text>
              {hasFilter && (
                <Button size="small" onClick={clearFilter}>Xóa bộ lọc</Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Alert List */}
      <Card
        className="db-chart-card"
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 16,
              }}>
                <BellOutlined />
              </div>
              <span style={{ fontWeight: 600, color: colors.navy }}>Danh sách cảnh báo</span>
            </div>
            <Button
              size="small"
              icon={<ReadOutlined />}
              style={{ fontSize: 12, color: colors.navyLight, borderColor: colors.navyLight }}
              onClick={markAllRead}
            >
              Đọc tất cả
            </Button>
          </div>
        }
      >
        {/* ─── Alert Items ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredData.map(alert => {
            const sevCfg = alertSeverityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: alert.isResolved
                    ? '#fafafa'
                    : alert.isRead
                      ? '#fff'
                      : severityBgColors[alert.severity],
                  borderLeft: `4px solid ${alert.isResolved ? colors.border : severityBorderColors[alert.severity]}`,
                  boxShadow: alert.isResolved ? 'none' : '0 1px 6px rgba(0,0,0,0.07)',
                  opacity: alert.isResolved ? 0.6 : 1,
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Severity Icon */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: alert.isResolved ? '#f0f0f0' : `${severityBorderColors[alert.severity]}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {alert.isResolved
                    ? <CheckCircleOutlined style={{ color: colors.success, fontSize: 20 }} />
                    : severityIcons[alert.severity]
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 13, lineHeight: '20px' }}>
                        {alert.title}
                      </Text>
                      {!alert.isRead && (
                        <Badge
                          count="Mới"
                          style={{
                            fontSize: 10,
                            height: 16,
                            lineHeight: '16px',
                            padding: '0 5px',
                            background: severityBorderColors[alert.severity],
                          }}
                        />
                      )}
                      {alert.isResolved && (
                        <Tag color="success" style={{ fontSize: 10, margin: 0 }}>Đã xử lý</Tag>
                      )}
                    </div>
                    <Tag
                      color={sevCfg.color}
                      style={{ fontSize: 10, lineHeight: '18px', margin: 0, flexShrink: 0 }}
                    >
                      {sevCfg.label}
                    </Tag>
                  </div>

                  {/* Description */}
                  <Text style={{ fontSize: 12, color: '#666', display: 'block', lineHeight: '18px' }}>
                    {alert.description}
                  </Text>

                  {/* Footer row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                    gap: 8,
                  }}>
                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 11, color: '#bbb' }}>
                        <ClockCircleOutlined style={{ marginRight: 3 }} />
                        {alert.createdAt}
                      </Text>
                      {alert.relatedEntity && (
                        <Tag style={{ fontSize: 10, lineHeight: '16px', margin: 0, border: 'none', background: '#f0f0f0' }}>
                          {alert.relatedEntity === 'contract' ? 'Hợp đồng' : 'Nhiệm vụ'}: {alert.relatedEntityId}
                        </Tag>
                      )}
                      {alert.departmentId && (
                        <Text style={{ fontSize: 10, color: '#bbb' }}>{alert.departmentId}</Text>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!alert.isResolved && (
                      <Space size={6} style={{ flexShrink: 0 }}>
                        {!alert.isRead && (
                          <Tooltip title="Đánh dấu đã đọc">
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => markRead(alert.id)}
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: colors.navyLight,
                                borderColor: colors.navyLight,
                                background: '#f0f5ff',
                                borderRadius: 6,
                                height: 30,
                                paddingInline: 10,
                              }}
                            >
                              Đã đọc
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Đánh dấu đã xử lý xong">
                          <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => markResolved(alert.id)}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              background: colors.success,
                              borderColor: colors.success,
                              borderRadius: 6,
                              height: 30,
                              paddingInline: 10,
                              boxShadow: '0 2px 6px rgba(82,196,26,0.35)',
                            }}
                          >
                            Đã xử lý
                          </Button>
                        </Tooltip>
                      </Space>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredData.length === 0 && !hasFilter && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bbb' }}>
              <BellOutlined style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
              <Text type="secondary">Không có cảnh báo nào</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Monitoring;
