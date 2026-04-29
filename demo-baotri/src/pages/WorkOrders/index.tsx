import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Select,
  Input, Avatar, Progress, Dropdown,
} from 'antd';
import {
  FileProtectOutlined, SyncOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SearchOutlined, EyeOutlined, AuditOutlined, PlayCircleOutlined,
  SendOutlined, PlusCircleOutlined, MoreOutlined, StopOutlined,
  CalendarOutlined, UserOutlined, ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { maintenanceWorkOrders } from '../../data/maintenanceWorkOrders';
import { poStatusConfig, formatDate } from '../../utils/format';
import type { MaintenanceWorkOrder, POStatus } from '../../types';

const { Title, Text } = Typography;

// ─── Status border color ─────────────────────────────────────
const statusBorderColor: Record<POStatus, string> = {
  draft: '#d9d9d9', assigned: '#1890ff', in_progress: '#0891b2',
  checking: '#faad14', evaluated: '#13c2c2', accepted: '#52c41a',
  rejected: '#ff4d4f', cancelled: '#d9d9d9',
};

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode; gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card className="db-stat-card" style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '18px 18px 14px' } }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 6 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{value}{suffix && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>{icon}</div>
      </div>
    </div>
    <div className="db-bg-icon" style={{ position: 'absolute', top: 10, right: 14, fontSize: 56, color: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}>{icon}</div>
  </Card>
);

// ─── PO Card ──────────────────────────────────────────────────
const POCard: React.FC<{ po: MaintenanceWorkOrder; onView: () => void; actionItems: { key: string; icon: React.ReactNode; label: string; danger?: boolean }[] }> = ({ po, onView, actionItems }) => {
  const statusCfg = poStatusConfig[po.status];
  const done = po.checklistItems.filter(c => c.isCompleted).length;
  const total = po.checklistItems.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
      }}
      styles={{ body: { padding: '16px 18px' } }}
      onClick={onView}
    >
      {/* Header: Code + Status + Menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <Text strong style={{ color: '#1B3A5C', fontSize: 15 }}>{po.code}</Text>
          <div style={{ marginTop: 4 }}>
            <Tag color={statusCfg.color} style={{ fontSize: 11 }}>{statusCfg.label}</Tag>
            {po.isMandatory && <Tag color="error" style={{ fontSize: 10 }}>Bắt buộc</Tag>}
          </div>
        </div>
        <Dropdown menu={{ items: [{ key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: onView }, ...actionItems] }}
          trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />}
            onClick={e => e.stopPropagation()} />
        </Dropdown>
      </div>

      {/* Work item name */}
      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8, lineHeight: '18px' }}>
        {po.workItemName}
      </Text>

      {/* Equipment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, color: '#666' }}>
        <ToolOutlined style={{ fontSize: 11 }} />
        <Text type="secondary" style={{ fontSize: 12 }} ellipsis>{po.equipmentName}</Text>
      </div>

      {/* Plan code */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, color: '#666' }}>
        <CalendarOutlined style={{ fontSize: 11 }} />
        <Tag style={{ fontSize: 11, margin: 0 }}>{po.planCode}</Tag>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Checklist</Text>
          <Text style={{ fontSize: 11, fontWeight: 600 }}>{done}/{total}</Text>
        </div>
        <Progress percent={pct} size="small" showInfo={false}
          strokeColor={pct === 100 ? '#52c41a' : '#1B3A5C'} />
      </div>

      {/* Footer: Staff + Date + Hours */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: 10 }}>
        <Space size={6}>
          <Avatar size={22} style={{ backgroundColor: '#1B3A5C', fontSize: 10 }}>
            {po.assignedStaffName.split(' ').pop()?.charAt(0)}
          </Avatar>
          <Text style={{ fontSize: 12, color: '#595959' }}>{po.assignedStaffName}</Text>
        </Space>
        <Space size={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(po.scheduledDate)}</Text>
          <Text style={{ fontSize: 11, fontWeight: 600, color: '#1B3A5C' }}>{po.actualHours ?? po.estimatedHours}h</Text>
        </Space>
      </div>
    </Card>
  );
};

// ─── Page Component ────────────────────────────────────────────
const WorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | undefined>();
  const [planCodeFilter, setPlanCodeFilter] = useState<string | undefined>();

  const uniquePlanCodes = useMemo(() => [...new Set(maintenanceWorkOrders.map(wo => wo.planCode))].sort(), []);

  const filteredData = useMemo(() => {
    let result = maintenanceWorkOrders;
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(r => r.code.toLowerCase().includes(q) || r.workItemName.toLowerCase().includes(q) || r.equipmentName.toLowerCase().includes(q) || r.assignedStaffName.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter(r => r.status === statusFilter);
    if (planCodeFilter) result = result.filter(r => r.planCode === planCodeFilter);
    return result;
  }, [searchText, statusFilter, planCodeFilter]);

  const stats = useMemo(() => ({
    total: maintenanceWorkOrders.length,
    inProgress: maintenanceWorkOrders.filter(wo => wo.status === 'in_progress').length,
    checking: maintenanceWorkOrders.filter(wo => wo.status === 'checking' || wo.status === 'evaluated').length,
    accepted: maintenanceWorkOrders.filter(wo => wo.status === 'accepted').length,
  }), []);

  const getActionItems = (record: MaintenanceWorkOrder) => {
    const items: { key: string; icon: React.ReactNode; label: string; danger?: boolean }[] = [];
    const statusActions: Record<string, typeof items> = {
      draft: [{ key: 'assign', icon: <SendOutlined />, label: 'Phân công' }],
      assigned: [{ key: 'start', icon: <PlayCircleOutlined />, label: 'Bắt đầu' }],
      in_progress: [{ key: 'complete', icon: <CheckCircleOutlined />, label: 'Hoàn thành' }, { key: 'pause', icon: <StopOutlined />, label: 'Tạm dừng' }],
      checking: [{ key: 'evaluate', icon: <AuditOutlined />, label: 'Đánh giá' }],
      evaluated: [
        { key: 'accept', icon: <CheckCircleOutlined />, label: 'Nghiệm thu' },
        ...(record.evaluation?.result === 'fail' ? [{ key: 'rework', icon: <PlusCircleOutlined />, label: 'WO sửa chữa', danger: true as const }] : []),
      ],
      rejected: [{ key: 'rework', icon: <PlusCircleOutlined />, label: 'WO sửa chữa', danger: true as const }],
    };
    return statusActions[record.status] || items;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Space size={12} align="center">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
            <FileProtectOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Lệnh công việc bảo trì (Work Order)</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Quản lý và theo dõi các lệnh công việc (WO) bảo trì thiết bị</Text>
          </div>
        </Space>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}><StatCard title="Tổng WO" value={stats.total} icon={<FileProtectOutlined />} gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" suffix="phiếu" /></Col>
        <Col xs={12} sm={6}><StatCard title="Đang thực hiện" value={stats.inProgress} icon={<SyncOutlined />} gradient="linear-gradient(135deg, #0891b2, #22d3ee)" suffix="phiếu" /></Col>
        <Col xs={12} sm={6}><StatCard title="Chờ đánh giá" value={stats.checking} icon={<ClockCircleOutlined />} gradient="linear-gradient(135deg, #D4A843, #f0d890)" suffix="phiếu" /></Col>
        <Col xs={12} sm={6}><StatCard title="Đã nghiệm thu" value={stats.accepted} icon={<CheckCircleOutlined />} gradient="linear-gradient(135deg, #52c41a, #73d13d)" suffix="phiếu" /></Col>
      </Row>

      {/* Filters */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}
        styles={{ body: { padding: '14px 20px' } }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Input prefix={<SearchOutlined style={{ color: '#999' }} />} placeholder="Tìm mã WO, hạng mục, thiết bị, người thực hiện..."
            value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ width: 340 }} />
          <Select placeholder="Trạng thái" allowClear value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 160 }}
            options={Object.entries(poStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Select placeholder="Mã kế hoạch" allowClear value={planCodeFilter} onChange={v => setPlanCodeFilter(v)} style={{ width: 180 }}
            options={uniquePlanCodes.map(c => ({ value: c, label: c }))} />
          <div style={{ flex: 1 }} />
          <Text type="secondary" style={{ alignSelf: 'center', fontSize: 13 }}>{filteredData.length} phiếu</Text>
        </div>
      </Card>

      {/* PO Cards Grid */}
      <Row gutter={[16, 16]}>
        {filteredData.map((po) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={po.id}>
            <POCard
              po={po}
              onView={() => navigate(`/work-orders/${po.id}`)}
              actionItems={getActionItems(po)}
            />
          </Col>
        ))}
        {filteredData.length === 0 && (
          <Col span={24}>
            <Card style={{ borderRadius: 14, textAlign: 'center', padding: '40px 0' }}>
              <FileProtectOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 12 }} />
              <div><Text type="secondary">Không tìm thấy lệnh công việc nào</Text></div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default WorkOrders;
