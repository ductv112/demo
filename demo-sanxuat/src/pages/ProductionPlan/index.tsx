import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Row, Col, Typography, Progress, Tooltip, Space, Button, Input, Select, Dropdown, Modal, message } from 'antd';
import {
  FileTextOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ScheduleOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { productionPlans } from '../../data/productionOrders';
import { planStatusConfig, formatDate } from '../../utils/format';
import type { ProductionPlan } from '../../types';

const { Title, Text } = Typography;

const statCards = [
  {
    key: 'total',
    label: 'Tổng KHSX',
    icon: <FileTextOutlined />,
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    key: 'in_progress',
    label: 'Đang thực hiện',
    icon: <SyncOutlined />,
    gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  },
  {
    key: 'completed',
    label: 'Hoàn thành',
    icon: <CheckCircleOutlined />,
    gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
  },
];

const ProductionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);

  const filteredPlans = useMemo(() => {
    return productionPlans.filter((p) => {
      const matchSearch = !searchText ||
        p.code.toLowerCase().includes(searchText.toLowerCase()) ||
        p.name.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || p.status === filterStatus;
      const matchYear = !filterYear || p.year === filterYear;
      return matchSearch && matchStatus && matchYear;
    });
  }, [searchText, filterStatus, filterYear]);

  const handleDelete = (plan: ProductionPlan) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa kế hoạch "${plan.name}" (${plan.code})?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => message.success('Đã xóa kế hoạch sản xuất'),
    });
  };

  const stats = useMemo(() => {
    const total = productionPlans.length;
    const inProgress = productionPlans.filter((p) => p.status === 'in_progress').length;
    const completed = productionPlans.filter((p) => p.status === 'completed').length;
    return { total, in_progress: inProgress, completed };
  }, []);

  const calcPercent = (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const renderStatCard = (cfg: (typeof statCards)[number], value: number) => (
    <Col xs={24} sm={8} key={cfg.key}>
      <div
        className="stat-card"
        style={{
          background: cfg.gradient,
          borderRadius: 14,
          padding: '20px 24px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)';
          const iconEl = el.querySelector('.stat-bg-icon') as HTMLElement;
          if (iconEl) iconEl.style.transform = 'rotate(15deg) scale(1.15)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
          const iconEl = el.querySelector('.stat-bg-icon') as HTMLElement;
          if (iconEl) iconEl.style.transform = 'rotate(0) scale(1)';
        }}
      >
        <div
          className="stat-bg-icon"
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            fontSize: 64,
            opacity: 0.1,
            color: '#fff',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {cfg.icon}
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
            fontSize: 16,
            color: '#fff',
            marginBottom: 12,
          }}
        >
          {cfg.icon}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
          {value}
          <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>
            kế hoạch
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          {cfg.label}
        </div>
      </div>
    </Col>
  );

  const statusBorderColor = (status: ProductionPlan['status']): string => {
    switch (status) {
      case 'in_progress': return '#52c41a';
      case 'completed': return '#1890ff';
      case 'draft': return '#d9d9d9';
      case 'approved': return '#1B3A5C';
      case 'cancelled': return '#ff4d4f';
      default: return '#e8e8e8';
    }
  };

  const renderPlanCard = (plan: ProductionPlan) => {
    const orderPercent = calcPercent(plan.completedOrders, plan.totalOrders);
    const productPercent = calcPercent(plan.completedProducts, plan.totalProducts);
    const cfg = planStatusConfig[plan.status];

    return (
      <Col xs={24} md={12} xl={8} key={plan.id}>
        <Card
          style={{
            borderRadius: 14,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            height: '100%',
          }}
          styles={{ body: { padding: 20 } }}
          hoverable
          onClick={() => navigate(`/production-plans/${plan.id}`)}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'translateY(-4px)';
            el.style.boxShadow = '0 8px 24px rgba(27, 58, 92, 0.1)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{plan.code}</Text>
              <Title level={5} style={{ margin: '4px 0 0', color: '#1B3A5C', fontSize: 15, fontWeight: 600 }}>
                {plan.name}
              </Title>
            </div>
            <Space size={4}>
              <Tag color={cfg.color}>{cfg.label}</Tag>
              <Dropdown
                menu={{
                  items: [
                    { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
                    { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                    ...(plan.status === 'draft' ? [{ key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true as const }] : []),
                  ],
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    if (key === 'view') navigate(`/production-plans/${plan.id}`);
                    if (key === 'edit') navigate(`/production-plans/${plan.id}/edit`);
                    if (key === 'delete') handleDelete(plan);
                  },
                }}
                trigger={['click']}
              >
                <Button type="text" size="small" icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()} style={{ color: '#8c8c8c' }} />
              </Dropdown>
            </Space>
          </div>

          {/* Thời gian */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, color: '#595959', fontSize: 13 }}>
            <CalendarOutlined style={{ color: '#1B3A5C' }} />
            <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
            {plan.quarter && (
              <Tag
                style={{
                  marginLeft: 'auto',
                  borderRadius: 4,
                  fontSize: 11,
                  background: 'rgba(27,58,92,0.08)',
                  border: 'none',
                  color: '#1B3A5C',
                }}
              >
                Quý {plan.quarter}/{plan.year}
              </Tag>
            )}
          </div>

          {/* Tiến độ lệnh sản xuất */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Lệnh sản xuất</Text>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#1B3A5C' }}>
                {plan.completedOrders}/{plan.totalOrders}
              </Text>
            </div>
            <Progress
              percent={orderPercent}
              size="small"
              strokeColor={plan.totalOrders === 0 ? '#d9d9d9' : '#1B3A5C'}
              format={(p) => `${p}%`}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Tiến độ sản phẩm */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Sản phẩm hoàn thành</Text>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#1B3A5C' }}>
                {plan.completedProducts}/{plan.totalProducts}
              </Text>
            </div>
            <Progress
              percent={productPercent}
              size="small"
              strokeColor={plan.totalProducts === 0 ? '#d9d9d9' : '#D4A843'}
              format={(p) => `${p}%`}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Phê duyệt */}
          {plan.approvedBy && (
            <div
              style={{
                borderTop: '1px solid #f0f0f0',
                paddingTop: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#8c8c8c',
              }}
            >
              <UserOutlined style={{ color: '#D4A843' }} />
              <span>
                Phê duyệt: <Text style={{ fontSize: 12, fontWeight: 500 }}>{plan.approvedBy}</Text>
              </span>
              {plan.approvedAt && (
                <span style={{ marginLeft: 'auto' }}>{formatDate(plan.approvedAt)}</span>
              )}
            </div>
          )}

          {/* Ghi chú */}
          {plan.note && (
            <Tooltip title={plan.note}>
              <div
                style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  background: 'rgba(27,58,92,0.04)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#595959',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <InboxOutlined style={{ marginRight: 4, color: '#1B3A5C' }} />
                {plan.note}
              </div>
            </Tooltip>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ScheduleOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Kế hoạch sản xuất
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý kế hoạch sản xuất theo quý/năm của Trung tâm Phần mềm Alpha
            </Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/production-plans/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Thêm mới
        </Button>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {renderStatCard(statCards[0], stats.total)}
        {renderStatCard(statCards[1], stats.in_progress)}
        {renderStatCard(statCards[2], stats.completed)}
      </Row>

      {/* Filter bar */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tìm kiếm theo mã, tên kế hoạch..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus}
              allowClear style={{ width: '100%' }}
              options={Object.entries(planStatusConfig).map(([key, cfg]) => ({ value: key, label: cfg.label }))}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Năm" value={filterYear} onChange={setFilterYear}
              allowClear style={{ width: '100%' }}
              options={[2025, 2026, 2027].map((y) => ({ value: y, label: String(y) }))}
            />
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredPlans.length}/{productionPlans.length} kết quả</Text>
              <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); setFilterYear(undefined); }}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Plan cards */}
      <Row gutter={[16, 16]}>
        {filteredPlans.map((plan) => renderPlanCard(plan))}
      </Row>
    </div>
  );
};

export default ProductionPlanPage;
