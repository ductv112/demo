import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Select, Dropdown,
  Input, Tooltip,
} from 'antd';
import {
  AlertOutlined, SyncOutlined, CheckCircleOutlined, SwapOutlined,
  SearchOutlined, EyeOutlined, EditOutlined, ExportOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { repairRequests } from '../../data/workOrders';
import { repairStatusConfig, severityConfig, formatDate } from '../../utils/format';
import type { RepairRequest, RepairRequestStatus, RepairSeverity } from '../../types';

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

// ─── Helper ────────────────────────────────────────────────────
const formatDowntime = (minutes: number | undefined): string => {
  if (!minutes || minutes === 0) return '-';
  if (minutes >= 1440) return `${(minutes / 1440).toFixed(1)} ngày`;
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)} giờ`;
  return `${minutes} phút`;
};

// ─── Page Component ────────────────────────────────────────────
const CorrectiveMaintenancePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairRequestStatus | undefined>(undefined);
  const [severityFilter, setSeverityFilter] = useState<RepairSeverity | undefined>(undefined);

  const filteredData = useMemo(() => {
    let result = repairRequests;
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) => r.code.toLowerCase().includes(lower)
          || r.equipmentName.toLowerCase().includes(lower)
          || r.symptom.toLowerCase().includes(lower),
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    if (severityFilter) result = result.filter((r) => r.severity === severityFilter);
    return result;
  }, [searchText, statusFilter, severityFilter]);

  const stats = useMemo(() => ({
    total: repairRequests.length,
    inProgress: repairRequests.filter((r) =>
      ['new', 'evaluating', 'assigned', 'in_progress', 'checking'].includes(r.status)).length,
    completed: repairRequests.filter((r) => r.status === 'completed').length,
    escalated: repairRequests.filter((r) => r.status === 'escalated').length,
  }), []);

  const columns: ColumnsType<RepairRequest> = [
    {
      title: 'Mã YC', dataIndex: 'code', width: 150,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>,
    },
    {
      title: 'Thiết bị', key: 'equipment', width: 200, ellipsis: true,
      render: (_: unknown, record: RepairRequest) => (
        <div>
          <div><Text strong>{record.equipmentName}</Text></div>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.equipmentCode}</Text>
        </div>
      ),
    },
    {
      title: 'Triệu chứng', dataIndex: 'symptom', ellipsis: true,
      render: (symptom: string) => (
        <Tooltip title={symptom}>
          <Text>{symptom}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Mức độ', dataIndex: 'severity', width: 120, align: 'center',
      render: (severity: RepairSeverity) => {
        const cfg = severityConfig[severity];
        return <Tag color={cfg.color} style={{ color: '#fff' }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 150, align: 'center',
      render: (status: RepairRequestStatus) => {
        const cfg = repairStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Người báo cáo', dataIndex: 'reportedBy', width: 180, ellipsis: true,
    },
    {
      title: 'Ngày báo cáo', dataIndex: 'reportedDate', width: 110,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'TG dừng máy', key: 'downtime', width: 100, align: 'right',
      render: (_: unknown, record: RepairRequest) => (
        <Text type={record.downtime && record.downtime > 1440 ? 'danger' : undefined}>
          {formatDowntime(record.downtime)}
        </Text>
      ),
    },
    {
      title: '', key: 'action', width: 50, align: 'center',
      render: (_: unknown, record: RepairRequest) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
          { key: 'edit', icon: <EditOutlined />, label: 'Cập nhật' },
          ...(record.status !== 'escalated' && record.status !== 'completed'
            ? [{ type: 'divider' as const }, { key: 'escalate', icon: <ExportOutlined />, label: 'Chuyển SC lớn', danger: true as const }]
            : []),
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
          <AlertOutlined style={{ marginRight: 8 }} />
          Sửa chữa nhỏ
        </Title>
        <Text type="secondary">Quản lý yêu cầu sửa chữa nhỏ, xử lý sự cố thiết bị — Doanh nghiệp A</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Tổng yêu cầu" value={stats.total} icon={<AlertOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Đang xử lý" value={stats.inProgress} icon={<SyncOutlined />}
            gradient="linear-gradient(135deg, #0e7490, #22d3ee)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Hoàn thành" value={stats.completed} icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #15803d, #52c41a)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Chuyển SC lớn" value={stats.escalated} icon={<SwapOutlined />}
            gradient="linear-gradient(135deg, #b91c1c, #ff4d4f)" />
        </Col>
      </Row>

      {/* Filter & Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm mã YC, thiết bị, triệu chứng..."
            style={{ width: 300 }}
            allowClear
            prefix={<SearchOutlined />}
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => { if (!e.target.value) setSearchText(''); }}
          />
          <Select
            placeholder="Mức độ" allowClear style={{ width: 140 }}
            onChange={(v) => setSeverityFilter(v)}
            options={Object.entries(severityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="Trạng thái" allowClear style={{ width: 160 }}
            onChange={(v) => setStatusFilter(v)}
            options={Object.entries(repairStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </div>

        <Table<RepairRequest>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} yêu cầu` }}
          scroll={{ x: 1300 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default CorrectiveMaintenancePage;
