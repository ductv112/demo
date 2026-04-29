import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Select, Tooltip,
  Input, Dropdown, Tabs, Calendar, Badge, Popover,
} from 'antd';
import {
  CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
  SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  MoreOutlined, RobotOutlined, UserOutlined, ThunderboltOutlined,
  UnorderedListOutlined, ScheduleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { maintenancePlans } from '../../data/maintenancePlans';
import { planStatusConfig, priorityConfig, formatDate } from '../../utils/format';
import type { MaintenancePlan, PlanStatus, PlanPriority, PlanSource } from '../../types';

const { Title, Text } = Typography;

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="db-stat-card"
    style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '20px 20px 16px' } }}
  >
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>
            {value}
            {suffix && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
    </div>
    <div className="db-bg-icon" style={{
      position: 'absolute', top: 12, right: 16, fontSize: 64,
      color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
    }}>
      {icon}
    </div>
  </Card>
);

// ─── Labels ───────────────────────────────────────────────────
const typeLabels: Record<string, { label: string; color: string }> = {
  periodic: { label: 'Định kỳ', color: 'processing' },
  corrective: { label: 'Sửa chữa', color: 'warning' },
  inspection: { label: 'Kiểm tra', color: 'cyan' },
};

const sourceConfig: Record<PlanSource, { label: string; color: string; icon: React.ReactNode }> = {
  auto: { label: 'Tự động', color: '#0891b2', icon: <RobotOutlined /> },
  manual: { label: 'Thủ công', color: '#6b7280', icon: <UserOutlined /> },
};

const statusColors: Record<PlanStatus, string> = {
  draft: '#d9d9d9',
  pending_approval: '#faad14',
  approved: '#1B3A5C',
  in_progress: '#0891b2',
  completed: '#52c41a',
  cancelled: '#ff4d4f',
};

// ─── Page Component ────────────────────────────────────────────
const MaintenancePlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<PlanPriority | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<PlanSource | undefined>(undefined);

  const filteredData = useMemo(() => {
    let result = maintenancePlans;
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(lower) || r.code.toLowerCase().includes(lower)
          || r.equipmentName.toLowerCase().includes(lower),
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    if (priorityFilter) result = result.filter((r) => r.priority === priorityFilter);
    if (typeFilter) result = result.filter((r) => r.type === typeFilter);
    if (sourceFilter) result = result.filter((r) => r.source === sourceFilter);
    return result;
  }, [searchText, statusFilter, priorityFilter, typeFilter, sourceFilter]);

  const stats = useMemo(() => ({
    total: maintenancePlans.length,
    auto: maintenancePlans.filter((p) => p.source === 'auto').length,
    pending: maintenancePlans.filter((p) => p.status === 'pending_approval' || p.status === 'draft').length,
    inProgress: maintenancePlans.filter((p) => p.status === 'in_progress' || p.status === 'approved').length,
  }), []);

  const columns: ColumnsType<MaintenancePlan> = [
    {
      title: 'Mã KH', dataIndex: 'code', width: 145,
      render: (code: string, record: MaintenancePlan) => (
        <Space size={4} direction="vertical">
          <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{code}</Text>
          <Tag
            icon={sourceConfig[record.source].icon}
            color={record.source === 'auto' ? 'cyan' : 'default'}
            style={{ fontSize: 10, lineHeight: '16px', padding: '0 5px' }}
          >
            {sourceConfig[record.source].label}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Tên kế hoạch', dataIndex: 'name', ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Thiết bị', dataIndex: 'equipmentName', width: 180, ellipsis: true,
      render: (name: string, record: MaintenancePlan) => (
        <Tooltip title={record.equipmentCode}>
          <Text>{name}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Loại', dataIndex: 'type', width: 100, align: 'center',
      render: (type: string) => {
        const cfg = typeLabels[type] || { label: type, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', width: 100, align: 'center',
      render: (priority: PlanPriority) => {
        const cfg = priorityConfig[priority];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 135, align: 'center',
      render: (status: PlanStatus) => {
        const cfg = planStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thời gian', key: 'time', width: 175,
      render: (_: unknown, record: MaintenancePlan) => (
        <div style={{ fontSize: 12 }}>
          <div>{formatDate(record.scheduledStart)} - {formatDate(record.scheduledEnd)}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.estimatedDuration} giờ</Text>
        </div>
      ),
    },
    {
      title: 'Đội thực hiện', dataIndex: 'teamName', width: 150, ellipsis: true,
    },
    {
      title: '', key: 'action', width: 50, align: 'center',
      render: (_: unknown, record: MaintenancePlan) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/maintenance-plans/${record.id}`) },
          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
          { type: 'divider' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
        ]}} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  // ─── Calendar helpers ──────────────────────────────────────────
  const getPlansForDate = (date: Dayjs): MaintenancePlan[] => {
    const dateStr = date.format('YYYY-MM-DD');
    return maintenancePlans.filter(plan => {
      const start = dayjs(plan.scheduledStart);
      const end = dayjs(plan.scheduledEnd);
      return date.isSame(start, 'day') || date.isSame(end, 'day')
        || (date.isAfter(start, 'day') && date.isBefore(end, 'day'));
    });
  };

  const dateCellRender = (date: Dayjs) => {
    const plans = getPlansForDate(date);
    if (plans.length === 0) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {plans.slice(0, 3).map((plan) => (
          <Popover
            key={plan.id}
            placement="right"
            title={
              <div style={{ maxWidth: 280 }}>
                <Text strong style={{ color: '#1B3A5C' }}>{plan.code}</Text>
                <div style={{ fontSize: 12, color: '#666' }}>{plan.name}</div>
              </div>
            }
            content={
              <div style={{ maxWidth: 280, fontSize: 12 }}>
                <div style={{ marginBottom: 4 }}><Text type="secondary">Thiết bị:</Text> {plan.equipmentName}</div>
                <div style={{ marginBottom: 4 }}><Text type="secondary">Đội:</Text> {plan.teamName}</div>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary">Thời gian:</Text> {formatDate(plan.scheduledStart)} - {formatDate(plan.scheduledEnd)}
                  <Text type="secondary" style={{ marginLeft: 6 }}>({plan.estimatedDuration}h)</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Tag color={planStatusConfig[plan.status].color} style={{ fontSize: 11 }}>{planStatusConfig[plan.status].label}</Tag>
                  <Tag color={priorityConfig[plan.priority].color} style={{ fontSize: 11 }}>{priorityConfig[plan.priority].label}</Tag>
                  <Tag icon={sourceConfig[plan.source].icon} color={plan.source === 'auto' ? 'cyan' : 'default'} style={{ fontSize: 11 }}>{sourceConfig[plan.source].label}</Tag>
                </div>
                <Button type="link" size="small" style={{ padding: 0, fontSize: 12, color: '#1B3A5C' }}
                  onClick={() => navigate(`/maintenance-plans/${plan.id}`)}>
                  Xem chi tiết
                </Button>
              </div>
            }
          >
            <div
              style={{
                background: statusColors[plan.status],
                color: '#fff',
                fontSize: 10,
                lineHeight: '18px',
                padding: '0 6px',
                borderRadius: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {plan.equipmentCode.split('-')[0]} — {plan.name.length > 18 ? plan.name.slice(0, 18) + '…' : plan.name}
            </div>
          </Popover>
        ))}
        {plans.length > 3 && (
          <Text type="secondary" style={{ fontSize: 10 }}>+{plans.length - 3} kế hoạch khác</Text>
        )}
      </div>
    );
  };

  const monthCellRender = (date: Dayjs) => {
    const month = date.month();
    const year = date.year();
    const plansInMonth = maintenancePlans.filter(plan => {
      const start = dayjs(plan.scheduledStart);
      return start.month() === month && start.year() === year;
    });
    if (plansInMonth.length === 0) return null;
    return (
      <div>
        <Badge status="processing" text={<span style={{ fontSize: 11 }}>{plansInMonth.length} kế hoạch</span>} />
      </div>
    );
  };

  const cellRender = (current: Dayjs, info: { type: string }) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return monthCellRender(current);
    return null;
  };

  // ─── Legend ────────────────────────────────────────────────────
  const calendarLegend = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
      {Object.entries(planStatusConfig).map(([key, cfg]) => (
        <Space size={4} key={key}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: statusColors[key as PlanStatus] }} />
          <Text style={{ fontSize: 11, color: '#666' }}>{cfg.label}</Text>
        </Space>
      ))}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Kế hoạch & Lịch bảo trì
            </Title>
            <Text type="secondary">
              Kế hoạch được tự động sinh từ chu kỳ & giờ vận hành thiết bị, hoặc tạo thủ công khi phát sinh nhu cầu
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1B3A5C' }}
            onClick={() => navigate('/maintenance-plans/create')}>
            Tạo thủ công
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Tổng kế hoạch" value={stats.total} icon={<CalendarOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Tự động sinh" value={stats.auto} icon={<ThunderboltOutlined />}
            gradient="linear-gradient(135deg, #0891b2, #06b6d4)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Chờ xử lý" value={stats.pending} icon={<ClockCircleOutlined />}
            gradient="linear-gradient(135deg, #b8860b, #D4A843)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Đang thực hiện" value={stats.inProgress} icon={<SyncOutlined />}
            gradient="linear-gradient(135deg, #15803d, #52c41a)" />
        </Col>
      </Row>

      {/* Tabs: Danh sách | Lịch */}
      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: 'list',
            label: <span><UnorderedListOutlined /> Danh sách kế hoạch</span>,
            children: (
              <Card
                style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <Input.Search
                    placeholder="Tìm kiếm mã KH, tên kế hoạch, thiết bị..."
                    style={{ width: 300 }}
                    allowClear
                    prefix={<SearchOutlined />}
                    onSearch={(v) => setSearchText(v)}
                    onChange={(e) => { if (!e.target.value) setSearchText(''); }}
                  />
                  <Select placeholder="Trạng thái" allowClear style={{ width: 150 }} onChange={(v) => setStatusFilter(v)}
                    options={Object.entries(planStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                  <Select placeholder="Ưu tiên" allowClear style={{ width: 130 }} onChange={(v) => setPriorityFilter(v)}
                    options={Object.entries(priorityConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                  <Select placeholder="Nguồn" allowClear style={{ width: 130 }} onChange={(v) => setSourceFilter(v)}
                    options={[{ value: 'auto', label: 'Tự động' }, { value: 'manual', label: 'Thủ công' }]} />
                  <Select placeholder="Loại" allowClear style={{ width: 130 }} onChange={(v) => setTypeFilter(v)}
                    options={[{ value: 'periodic', label: 'Định kỳ' }, { value: 'corrective', label: 'Sửa chữa' }, { value: 'inspection', label: 'Kiểm tra' }]} />
                </div>

                <Table<MaintenancePlan>
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} kế hoạch` }}
                  scroll={{ x: 1200 }}
                  size="middle"
                />
              </Card>
            ),
          },
          {
            key: 'calendar',
            label: <span><ScheduleOutlined /> Lịch bảo trì</span>,
            children: (
              <Card
                style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                styles={{ body: { padding: '16px 20px' } }}
              >
                {calendarLegend}
                <Calendar cellRender={cellRender} />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default MaintenancePlanPage;
