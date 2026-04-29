import React, { useMemo, useState, useEffect } from 'react';
import {
  Card, Tag, Row, Col, Typography, Progress, Space, Table, Button,
  Select, Dropdown, Input, message,
} from 'antd';
import {
  FileTextOutlined, SyncOutlined, ClockCircleOutlined,
  CalendarOutlined,
  MoreOutlined, EyeOutlined, SendOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, SearchOutlined, FilterOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

import { supplyPlans } from '../../data/supplyPlans';
import { formatCurrency, formatDate, supplyPlanStatusConfig } from '../../utils/format';
import { useUser } from '../../contexts/UserContext';
import { usePageHeader } from '../../contexts/PageHeaderContext';
import { colors } from '../../theme/themeConfig';
import type { SupplyPlan, SupplyPlanStatus } from '../../types';

const { Title, Text } = Typography;

const SupplyPlanPage: React.FC = () => {
  const { isProcurement } = useUser();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<SupplyPlanStatus | undefined>(undefined);

  // Filtered data
  const filteredPlans = useMemo(() => {
    return supplyPlans.filter(p => {
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!p.code.toLowerCase().includes(s) && !p.title.toLowerCase().includes(s) && !(p.relatedTask || '').toLowerCase().includes(s)) return false;
      }
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    });
  }, [searchText, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: supplyPlans.length,
    executing: supplyPlans.filter(p => p.status === 'executing').length,
    pendingApproval: supplyPlans.filter(p => p.status === 'pending_approval').length,
    draft: supplyPlans.filter(p => p.status === 'draft').length,
  }), []);

  // Helpers
  const getCompletedCount = (plan: SupplyPlan): number =>
    plan.items.filter(i => i.status === 'completed' || i.status === 'issued').length;

  const getProgressPercent = (plan: SupplyPlan): number =>
    plan.items.length > 0 ? Math.round((getCompletedCount(plan) / plan.items.length) * 100) : 0;

  const getOverdueCount = (plan: SupplyPlan): number =>
    plan.items.filter(i => dayjs(i.deadline).isBefore(dayjs()) && i.status !== 'completed' && i.status !== 'issued').length;

  // Action menu
  const getActionMenuItems = (plan: SupplyPlan): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/supply-plans/${plan.id}`),
      },
    ];

    if (isProcurement && (plan.status === 'draft' || plan.status === 'approved')) {
      items.push(
        { type: 'divider' },
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Chỉnh sửa',
          onClick: () => navigate(`/supply-plans/${plan.id}/edit`),
        },
      );
    }

    if (isProcurement && plan.status === 'draft') {
      items.push(
        {
          key: 'submit',
          icon: <SendOutlined />,
          label: 'Trình duyệt',
          onClick: () => message.info(`Đã trình duyệt ${plan.code}`),
        },
        { type: 'divider' },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa kế hoạch',
          danger: true,
          onClick: () => message.success(`Đã xóa kế hoạch ${plan.code}`),
        },
      );
    }

    return items;
  };

  // Table columns
  const columns: ColumnsType<SupplyPlan> = [
    {
      title: 'Mã KH',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left' as const,
      render: (code: string, record: SupplyPlan) => (
        <Text strong style={{ color: colors.navy, cursor: 'pointer' }} onClick={() => navigate(`/supply-plans/${record.id}`)}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Tên kế hoạch',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      ellipsis: true,
      render: (title: string, record: SupplyPlan) => (
        <Text style={{ cursor: 'pointer' }} onClick={() => navigate(`/supply-plans/${record.id}`)}>{title}</Text>
      ),
    },
    {
      title: 'Kỳ',
      key: 'period',
      width: 110,
      align: 'center',
      render: (_: unknown, record: SupplyPlan) => (
        <Tag color={colors.navy} style={{ fontSize: 12 }}>
          {record.quarter ? `Quý ${record.quarter}/${record.year}` : `Năm ${record.year}`}
        </Tag>
      ),
    },
    {
      title: 'Nhiệm vụ liên quan',
      dataIndex: 'relatedTask',
      key: 'relatedTask',
      width: 220,
      ellipsis: true,
      render: (task: string | undefined) => task || <Text type="secondary">--</Text>,
    },
    {
      title: 'SL vật tư',
      key: 'itemCount',
      width: 85,
      align: 'center',
      render: (_: unknown, record: SupplyPlan) => (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          color: '#fff', fontSize: 13, fontWeight: 600,
        }}>
          {record.items.length}
        </span>
      ),
    },
    {
      title: 'Dự toán',
      dataIndex: 'totalEstimated',
      key: 'totalEstimated',
      width: 100,
      align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{formatCurrency(v)}</Text>,
      sorter: (a: SupplyPlan, b: SupplyPlan) => a.totalEstimated - b.totalEstimated,
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 140,
      render: (_: unknown, record: SupplyPlan) => {
        const pct = getProgressPercent(record);
        const completed = getCompletedCount(record);
        const overdue = getOverdueCount(record);
        return (
          <Space size={8} align="center">
            <Progress
              type="circle" percent={pct} size={36}
              strokeColor={pct >= 100 ? colors.success : colors.navy}
              format={(p) => <span style={{ fontSize: 10, fontWeight: 600 }}>{p}%</span>}
            />
            <div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>{completed}/{record.items.length}</div>
              {overdue > 0 && (
                <div style={{ fontSize: 11, color: colors.danger }}>
                  <ExclamationCircleOutlined style={{ marginRight: 2 }} />{overdue} trễ
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: SupplyPlanStatus) => {
        const cfg = supplyPlanStatusConfig[status];
        return <Tag color={cfg.color} style={{ fontSize: 12 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày lập',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 105,
      render: (d: string) => formatDate(d),
      sorter: (a: SupplyPlan, b: SupplyPlan) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 70,
      align: 'center',
      fixed: 'right' as const,
      render: (_: unknown, record: SupplyPlan) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />} style={{ color: '#999' }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4, color: colors.navy }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Kế hoạch bảo đảm vật tư
          </Title>
          <Text type="secondary">
            Lập và theo dõi tiến độ thực hiện kế hoạch cung ứng vật tư theo quý hoặc nhiệm vụ
          </Text>
        </div>
        {isProcurement && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/supply-plans/new')}>
            Tạo kế hoạch mới
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng kế hoạch', value: stats.total, unit: 'KH', bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <FileTextOutlined /> },
          { label: 'Đang thực hiện', value: stats.executing, unit: 'KH', bg: 'linear-gradient(135deg, #059669, #10b981)', icon: <SyncOutlined /> },
          { label: 'Chờ phê duyệt', value: stats.pendingApproval, unit: 'KH', bg: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <ClockCircleOutlined /> },
          { label: 'Đang lập', value: stats.draft, unit: 'KH', bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <EditOutlined /> },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{ background: card.bg, position: 'relative', overflow: 'hidden' }}
              styles={{ body: { padding: '20px 18px', position: 'relative', zIndex: 1 } }}
            >
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -8, fontSize: 64, opacity: 0.1, color: '#fff', zIndex: 0 }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>{card.icon}</div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{card.label}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{card.value}<span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>{card.unit}</span></div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={7}>
            <Input
              placeholder="Tìm theo mã, tên KH, nhiệm vụ..."
              prefix={<SearchOutlined style={{ color: colors.navy }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(supplyPlanStatusConfig).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.label}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Button icon={<FilterOutlined />} onClick={() => { setSearchText(''); setFilterStatus(undefined); }}>Xóa lọc</Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 20px 0' }}>
          <Text strong style={{ color: colors.navy, fontSize: 15 }}>
            Danh sách kế hoạch ({filteredPlans.length})
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredPlans}
          rowKey="id"
          size="middle"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng ${total} kế hoạch` }}
          onRow={(record) => ({
            onDoubleClick: () => navigate(`/supply-plans/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default SupplyPlanPage;
