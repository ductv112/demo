import React, { useState } from 'react';
import { Card, List, Tag, Button, Space, Typography, Badge, Divider, Row, Col, Empty, message } from 'antd';
import {
  AlertOutlined, CheckOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, WarningOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { alerts } from '../../data/alerts';
import { alertSeverityConfig, alertTypeConfig, formatDate } from '../../utils/format';
import type { VongDoiAlert } from '../../types';

const { Title, Text } = Typography;

const MonitoringPage: React.FC = () => {
  const [localAlerts, setLocalAlerts] = useState<VongDoiAlert[]>(alerts);
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [msg, contextHolder] = message.useMessage();

  const filtered = filterSeverity
    ? localAlerts.filter(a => a.severity === filterSeverity)
    : localAlerts;

  const unread = localAlerts.filter(a => !a.isRead).length;
  const critical = localAlerts.filter(a => a.severity === 'critical').length;
  const warning = localAlerts.filter(a => a.severity === 'warning').length;

  const markRead = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllRead = () => {
    setLocalAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    msg.success('Đã đánh dấu tất cả cảnh báo là đã đọc');
  };

  const getIcon = (severity: string) => {
    if (severity === 'critical') return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    if (severity === 'warning') return <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />;
    return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 18 }} />;
  };

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Theo dõi Cảnh báo</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Cảnh báo và thông báo về tình trạng thiết bị / hệ thống Doanh nghiệp A</Text>
                </div>
              </Space>
            </Col>
            {unread > 0 && (
              <Col>
                <Button icon={<CheckOutlined />} onClick={markAllRead} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                  Đánh dấu tất cả đã đọc ({unread})
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* Summary */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Tổng cảnh báo', value: localAlerts.length, color: '#1B3A5C', bg: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)' },
          { label: 'Nghiêm trọng', value: critical, color: '#fff', bg: 'linear-gradient(135deg,#ff4d4f,#ff7875)' },
          { label: 'Cảnh báo', value: warning, color: '#fff', bg: 'linear-gradient(135deg,#faad14,#ffd666)' },
          { label: 'Chưa đọc', value: unread, color: '#fff', bg: 'linear-gradient(135deg,#722ed1,#9254de)' },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={6}>
            <Card
              bodyStyle={{ padding: '14px 18px', background: s.bg, borderRadius: 12, textAlign: 'center' }}
              style={{ border: 'none', borderRadius: 12, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter buttons */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button
            type={filterSeverity === '' ? 'primary' : 'default'}
            size="small"
            onClick={() => setFilterSeverity('')}
          >
            Tất cả ({localAlerts.length})
          </Button>
          <Button
            type={filterSeverity === 'critical' ? 'primary' : 'default'}
            danger={filterSeverity === 'critical'}
            size="small"
            icon={<ExclamationCircleOutlined />}
            onClick={() => setFilterSeverity(filterSeverity === 'critical' ? '' : 'critical')}
          >
            Nghiêm trọng ({critical})
          </Button>
          <Button
            type={filterSeverity === 'warning' ? 'primary' : 'default'}
            size="small"
            icon={<WarningOutlined style={{ color: '#faad14' }} />}
            onClick={() => setFilterSeverity(filterSeverity === 'warning' ? '' : 'warning')}
          >
            Cảnh báo ({warning})
          </Button>
          <Button
            type={filterSeverity === 'info' ? 'primary' : 'default'}
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => setFilterSeverity(filterSeverity === 'info' ? '' : 'info')}
          >
            Thông tin ({localAlerts.filter(a => a.severity === 'info').length})
          </Button>
          <Button icon={<ReloadOutlined />} size="small" type="text" onClick={() => { setLocalAlerts(alerts); setFilterSeverity(''); }}>
            Làm mới
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40 }}>
            <Empty description="Không có cảnh báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <List
            dataSource={filtered}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '14px 20px',
                  borderLeft: `4px solid ${alertSeverityConfig[item.severity].color}`,
                  background: item.isRead ? '#fff' : item.severity === 'critical' ? '#fff5f5' : item.severity === 'warning' ? '#fffdf0' : '#f0f8ff',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
                actions={[
                  !item.isRead && (
                    <Button
                      key="read"
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => { e.stopPropagation(); markRead(item.id); }}
                      style={{ color: '#52c41a' }}
                    >
                      Đã đọc
                    </Button>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ marginTop: 2 }}>
                      {!item.isRead && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: alertSeverityConfig[item.severity].color,
                          marginBottom: 6, marginLeft: 4,
                        }} />
                      )}
                      {getIcon(item.severity)}
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{item.equipmentName}</Text>
                      <Text code style={{ fontSize: 11 }}>{item.equipmentCode}</Text>
                      <Tag color={item.severity === 'critical' ? 'error' : item.severity === 'warning' ? 'warning' : 'processing'} style={{ fontSize: 10, margin: 0 }}>
                        {alertSeverityConfig[item.severity].label}
                      </Tag>
                      <Tag color="default" style={{ fontSize: 10, margin: 0 }}>{alertTypeConfig[item.type].label}</Tag>
                      {!item.isRead && <Badge status="processing" text={<span style={{ fontSize: 10, color: '#666' }}>Chưa đọc</span>} />}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 13, color: '#333', lineHeight: '1.5', marginBottom: 4 }}>{item.message}</div>
                      <Space size={16}>
                        {item.dueDate && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Hạn xử lý: <strong style={{ color: new Date(item.dueDate) < new Date('2026-04-15') ? '#ff4d4f' : '#faad14' }}>{formatDate(item.dueDate)}</strong>
                          </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 11 }}>Tạo lúc: {formatDate(item.createdAt)}</Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
            split={false}
          />
        )}
      </Card>

      <Divider style={{ margin: '20px 0 12px' }} />
      <Text type="secondary" style={{ fontSize: 12 }}>
        Hệ thống cảnh báo tự động kiểm tra định kỳ: tuổi thọ thiết bị, giờ vận hành, kỳ đại tu/bảo trì và tiến độ kế hoạch vòng đời.
      </Text>
    </div>
  );
};

export default MonitoringPage;
