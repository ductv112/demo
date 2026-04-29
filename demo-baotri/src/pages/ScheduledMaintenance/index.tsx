import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Select, Dropdown,
  Input, Progress, Tooltip,
} from 'antd';
import {
  ToolOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
  SearchOutlined, EyeOutlined, EditOutlined, PrinterOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { scheduledWorkOrders } from '../../data/workOrders';
import { workOrderStatusConfig, formatDate } from '../../utils/format';
import type { ScheduledWorkOrder, WorkOrderStatus } from '../../types';

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

// ─── Page Component ────────────────────────────────────────────
const ScheduledMaintenancePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | undefined>(undefined);

  const filteredData = useMemo(() => {
    let result = scheduledWorkOrders;
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) => r.code.toLowerCase().includes(lower) || r.equipmentName.toLowerCase().includes(lower),
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    return result;
  }, [searchText, statusFilter]);

  const stats = useMemo(() => ({
    total: scheduledWorkOrders.length,
    pending: scheduledWorkOrders.filter((w) => w.status === 'pending' || w.status === 'preparing').length,
    inProgress: scheduledWorkOrders.filter((w) => w.status === 'in_progress' || w.status === 'locked' || w.status === 'checking').length,
    completed: scheduledWorkOrders.filter((w) => w.status === 'completed').length,
  }), []);

  const columns: ColumnsType<ScheduledWorkOrder> = [
    {
      title: 'Mã lệnh', dataIndex: 'code', width: 140,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>,
    },
    {
      title: 'Thiết bị', key: 'equipment', width: 200, ellipsis: true,
      render: (_: unknown, record: ScheduledWorkOrder) => (
        <div>
          <div><Text strong>{record.equipmentName}</Text></div>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.equipmentCode}</Text>
        </div>
      ),
    },
    {
      title: 'Quy trình', dataIndex: 'procedureName', width: 200, ellipsis: true,
    },
    {
      title: 'Đội thực hiện', dataIndex: 'teamName', width: 150, ellipsis: true,
    },
    {
      title: 'Nhân sự', key: 'staff', width: 160, ellipsis: true,
      render: (_: unknown, record: ScheduledWorkOrder) => (
        <Tooltip title={record.assignedStaffNames.join(', ')}>
          <Text>{record.assignedStaffNames.length} người</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 130, align: 'center',
      render: (status: WorkOrderStatus) => {
        const cfg = workOrderStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày thực hiện', key: 'date', width: 120,
      render: (_: unknown, record: ScheduledWorkOrder) => formatDate(record.scheduledDate),
    },
    {
      title: 'Checklist', key: 'checklist', width: 140,
      render: (_: unknown, record: ScheduledWorkOrder) => {
        const pct = record.checklistTotal > 0
          ? Math.round((record.checklistCompleted / record.checklistTotal) * 100)
          : 0;
        return (
          <div>
            <Progress
              percent={pct}
              size="small"
              strokeColor={pct === 100 ? '#52c41a' : '#1B3A5C'}
              format={() => `${record.checklistCompleted}/${record.checklistTotal}`}
            />
          </div>
        );
      },
    },
    {
      title: '', key: 'action', width: 50, align: 'center',
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
          { key: 'edit', icon: <EditOutlined />, label: 'Cập nhật' },
          { key: 'print', icon: <PrinterOutlined />, label: 'In phiếu' },
        ]}} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
          <ToolOutlined style={{ marginRight: 8 }} />
          Bảo trì định kỳ
        </Title>
        <Text type="secondary">Quản lý lệnh bảo trì định kỳ, theo dõi tiến độ checklist — Doanh nghiệp A</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Tổng lệnh BT" value={stats.total} icon={<ToolOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Chờ thực hiện" value={stats.pending} icon={<ClockCircleOutlined />}
            gradient="linear-gradient(135deg, #b8860b, #D4A843)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Đang thực hiện" value={stats.inProgress} icon={<SyncOutlined />}
            gradient="linear-gradient(135deg, #0e7490, #22d3ee)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Hoàn thành" value={stats.completed} icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #15803d, #52c41a)" />
        </Col>
      </Row>

      {/* Filter & Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm mã lệnh, thiết bị..."
            style={{ width: 280 }}
            allowClear
            prefix={<SearchOutlined />}
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => { if (!e.target.value) setSearchText(''); }}
          />
          <Select
            placeholder="Trạng thái" allowClear style={{ width: 160 }}
            onChange={(v) => setStatusFilter(v)}
            options={Object.entries(workOrderStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </div>

        <Table<ScheduledWorkOrder>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} lệnh bảo trì` }}
          scroll={{ x: 1300 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default ScheduledMaintenancePage;
