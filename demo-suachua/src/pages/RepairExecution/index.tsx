import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Row, Col, Input, Select, Space, Button,
  Drawer, Form, Dropdown, Empty, Pagination,
  Tabs, message, Badge, Progress, Slider, Segmented, Tooltip,
} from 'antd';
import {
  ToolOutlined, SearchOutlined, EyeOutlined, PlusOutlined,
  MoreOutlined, CalendarOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SyncOutlined,
  CloseCircleOutlined, EditOutlined, SendOutlined,
  UserOutlined, UnorderedListOutlined, AppstoreOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { repairTasks } from '../../data/repairTasks';
import {
  repairTaskStatusConfig, repairStageConfig, formatDate, getProgressColor,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { RepairTask, RepairTaskStatus, RepairStage } from '../../types';

const { TextArea } = Input;

const pageStyles = `
  .exec-stat-card {
    position: relative; overflow: hidden; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px !important;
  }
  .exec-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .exec-stat-card:hover .stat-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .stat-bg-icon {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .section-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
  }
  .section-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1);
  }
  .status-tab .ant-tabs-tab { font-weight: 500; }
  .status-tab .ant-tabs-tab-active { font-weight: 700; }
  .request-card {
    border-radius: 12px !important; border: 1px solid #eef0f3;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer; overflow: hidden;
  }
  .request-card:hover {
    border-color: ${colors.navy}30;
    box-shadow: 0 8px 24px rgba(27,58,92,0.10);
    transform: translateY(-2px);
  }
  .request-card .card-code {
    color: ${colors.navy}; font-weight: 700; font-size: 14px;
  }
  .request-card .card-equip {
    font-weight: 600; font-size: 13px; color: #1a1a2e;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .request-card .card-meta {
    font-size: 12px; color: #8c8c8c; display: flex; align-items: center; gap: 4px;
  }
  .cal-grid { display: grid; grid-template-columns: 110px repeat(7, 1fr); border: 1px solid #eef0f3; border-radius: 10px; overflow: hidden; }
  .cal-header { background: #f5f7fa; padding: 12px 8px; font-size: 12px; font-weight: 600; color: ${colors.navy}; text-align: center; border-bottom: 1px solid #eef0f3; }
  .cal-header-today { background: ${colors.navy}10; color: ${colors.navy}; }
  .cal-label { background: #fafbfc; padding: 10px; font-size: 12px; font-weight: 600; color: #555; border-right: 1px solid #eef0f3; border-bottom: 1px solid #f0f0f0; display: flex; align-items: flex-start; gap: 6px; }
  .cal-cell { padding: 6px; border-right: 1px solid #f5f5f5; border-bottom: 1px solid #f0f0f0; min-height: 90px; vertical-align: top; }
  .cal-task { padding: 8px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 6px; cursor: pointer; transition: all 0.15s; border-left: 3px solid transparent; }
  .cal-task:hover { filter: brightness(0.95); transform: translateX(2px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .cal-task-name { font-weight: 600; font-size: 12px; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cal-task-meta { font-size: 10px; opacity: 0.75; display: flex; align-items: center; gap: 3px; }
  .cal-task-progress { margin-top: 4px; }
`;

const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="exec-stat-card"
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
    <div className="stat-bg-icon" style={{
      position: 'absolute', top: 12, right: 16,
      fontSize: 64, color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
    }}>
      {icon}
    </div>
  </Card>
);

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div style={{
    fontSize: 14, fontWeight: 700, color: colors.navy,
    paddingBottom: 10, marginBottom: 16, marginTop: 4,
    borderBottom: `2px solid ${colors.navy}15`,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    {icon && <span style={{ fontSize: 15, color: colors.navyLight }}>{icon}</span>}
    {title}
  </div>
);

const getStageBorder = (stage: RepairStage): string => {
  const map: Record<RepairStage, string> = {
    electronic: '#1890ff',
    mechanical: '#fa8c16',
    optical: '#722ed1',
    assembly: '#13c2c2',
    testing: '#52c41a',
  };
  return map[stage];
};

interface MaterialRow {
  key: string;
  name: string;
  quantity: number;
  unit: string;
}

const PAGE_SIZE = 12;

const RepairExecutionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [stageFilter, setStageFilter] = useState<RepairStage | 'all'>('all');
  const [woFilter, setWoFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => {
    // Tìm tuần có task gần nhất đang in_progress
    const activeTasks = repairTasks.filter(t => t.status === 'in_progress' && t.plannedStart);
    if (activeTasks.length > 0) {
      return dayjs(activeTasks[0].plannedStart).startOf('week');
    }
    return dayjs().startOf('week');
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTask, setDrawerTask] = useState<RepairTask | null>(null);
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [newMaterial, setNewMaterial] = useState<MaterialRow>({ key: '', name: '', quantity: 1, unit: 'Cái' });

  // Counts
  const counts = useMemo(() => {
    const all = repairTasks.length;
    const pending = repairTasks.filter(t => t.status === 'pending').length;
    const inProgress = repairTasks.filter(t => t.status === 'in_progress').length;
    const completed = repairTasks.filter(t => t.status === 'completed').length;
    const failed = repairTasks.filter(t => t.status === 'failed').length;
    return { all, pending, inProgress, completed, failed };
  }, []);

  // Unique work order codes
  const uniqueWoCodes = useMemo(() => {
    const codes = Array.from(new Set(repairTasks.map(t => t.workOrderCode)));
    return codes.sort();
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return repairTasks.filter(t => {
      const matchSearch = !searchText ||
        t.workOrderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        t.taskName.toLowerCase().includes(searchText.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchText.toLowerCase());
      const matchStage = stageFilter === 'all' || t.stage === stageFilter;
      const matchWo = woFilter === 'all' || t.workOrderCode === woFilter;
      const matchTab = activeTab === 'all' || t.status === activeTab;
      return matchSearch && matchStage && matchWo && matchTab;
    });
  }, [searchText, stageFilter, woFilter, activeTab]);

  // Pagination
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTasks.slice(start, start + PAGE_SIZE);
  }, [filteredTasks, currentPage]);

  // Reset page on filter change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  // Stage options
  const stageOptions = [
    { label: 'Tất cả công đoạn', value: 'all' },
    ...Object.entries(repairStageConfig).map(([k, v]) => ({ label: v.label, value: k })),
  ];

  // WO options
  const woOptions = [
    { label: 'Tất cả lệnh SC', value: 'all' },
    ...uniqueWoCodes.map(c => ({ label: c, value: c })),
  ];

  // Open progress drawer
  const openProgressDrawer = (task: RepairTask) => {
    setDrawerTask(task);
    form.setFieldsValue({
      progress: task.progress,
      actualHours: task.actualHours,
      notes: '',
    });
    setMaterials([]);
    setNewMaterial({ key: '', name: '', quantity: 1, unit: 'Cái' });
    setDrawerOpen(true);
  };

  // Save progress
  const handleSaveProgress = () => {
    form.validateFields().then(() => {
      message.success('Đã cập nhật tiến độ công việc thành công');
      setDrawerOpen(false);
      setDrawerTask(null);
    });
  };

  // Add material row
  const handleAddMaterial = () => {
    if (!newMaterial.name.trim()) {
      message.warning('Vui lòng nhập tên vật tư');
      return;
    }
    setMaterials(prev => [...prev, { ...newMaterial, key: `mat-${Date.now()}` }]);
    setNewMaterial({ key: '', name: '', quantity: 1, unit: 'Cái' });
  };

  // Remove material row
  const handleRemoveMaterial = (key: string) => {
    setMaterials(prev => prev.filter(m => m.key !== key));
  };

  // Dropdown menu per status
  const getActionMenu = (record: RepairTask) => {
    const items: {
      key: string;
      icon?: React.ReactNode;
      label: string | React.ReactNode;
      onClick?: () => void;
      type?: 'divider';
      danger?: boolean;
    }[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/repair-execution/${record.id}`),
      },
      { key: 'div1', type: 'divider', label: '' },
    ];

    if (record.status === 'pending') {
      items.push({
        key: 'confirm-ready',
        icon: <CheckCircleOutlined style={{ color: colors.navy }} />,
        label: <span style={{ color: colors.navy, fontWeight: 500 }}>Xác nhận sẵn sàng</span>,
        onClick: () => message.success('Đã xác nhận sẵn sàng thực hiện'),
      });
    } else if (record.status === 'in_progress') {
      items.push({
        key: 'update-progress',
        icon: <EditOutlined style={{ color: '#1890ff' }} />,
        label: <span style={{ color: '#1890ff', fontWeight: 500 }}>Cập nhật tiến độ</span>,
        onClick: () => openProgressDrawer(record),
      });
      items.push({
        key: 'complete',
        icon: <CheckCircleOutlined style={{ color: colors.success }} />,
        label: <span style={{ color: colors.success, fontWeight: 500 }}>Hoàn thành công việc</span>,
        onClick: () => message.success('Đã đánh dấu hoàn thành công việc'),
      });
    } else if (record.status === 'completed') {
      items.push({
        key: 'send-qc',
        icon: <SendOutlined style={{ color: colors.navy }} />,
        label: <span style={{ color: colors.navy, fontWeight: 500 }}>Gửi nghiệm thu</span>,
        onClick: () => message.success('Đã chuyển sang kiểm tra chất lượng'),
      });
    }

    // Remove trailing divider if no action after it
    if (record.status === 'failed') {
      items.pop(); // remove divider
    }

    return items;
  };

  // Tab items with badge counts
  const tabItems = [
    { key: 'all', label: <span>Tất cả <Badge count={counts.all} style={{ backgroundColor: colors.navy, marginLeft: 6 }} size="small" /></span> },
    { key: 'pending', label: <span>Chờ thực hiện <Badge count={counts.pending} style={{ backgroundColor: '#8c8c8c', marginLeft: 6 }} size="small" /></span> },
    { key: 'in_progress', label: <span>Đang thực hiện <Badge count={counts.inProgress} style={{ backgroundColor: '#1890ff', marginLeft: 6 }} size="small" /></span> },
    { key: 'completed', label: <span>Hoàn thành <Badge count={counts.completed} style={{ backgroundColor: colors.success, marginLeft: 6 }} size="small" /></span> },
    { key: 'failed', label: <span>Thất bại <Badge count={counts.failed} style={{ backgroundColor: colors.danger, marginLeft: 6 }} size="small" showZero /></span> },
  ];

  return (
    <div>
      <style>{pageStyles}</style>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng công việc"
            value={counts.all}
            icon={<ToolOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
            suffix="công việc"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Chờ thực hiện"
            value={counts.pending}
            icon={<ClockCircleOutlined />}
            gradient="linear-gradient(135deg, #595959 0%, #8c8c8c 100%)"
            suffix="công việc"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đang thực hiện"
            value={counts.inProgress}
            icon={<SyncOutlined />}
            gradient="linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)"
            suffix="công việc"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Hoàn thành"
            value={counts.completed}
            icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
            suffix="công việc"
          />
        </Col>
      </Row>

      {/* Main Card */}
      <Card className="section-card" styles={{ body: { padding: 20 } }}>
        {/* Card Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16,
          }}>
            <ToolOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>Thực hiện sửa chữa</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Triển khai và theo dõi tiến độ công việc sửa chữa</div>
          </div>
        </div>

        {/* View toggle + Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Tabs
            className="status-tab"
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            style={{ marginBottom: 0, flex: 1 }}
          />
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as 'list' | 'calendar')}
            options={[
              { value: 'list', icon: <AppstoreOutlined />, label: 'Danh sách' },
              { value: 'calendar', icon: <CalendarOutlined />, label: 'Lịch biểu' },
            ]}
            size="small"
            style={{ flexShrink: 0 }}
          />
        </div>

        {viewMode === 'list' ? (
        <>
        {/* Filters */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tìm kiếm công việc, mã lệnh, người thực hiện..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
              allowClear
            />
          </Col>
          <Col xs={12} sm={5}>
            <Select
              value={stageFilter}
              onChange={v => { setStageFilter(v); setCurrentPage(1); }}
              options={stageOptions}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={5}>
            <Select
              value={woFilter}
              onChange={v => { setWoFilter(v); setCurrentPage(1); }}
              options={woOptions}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        {/* Task List */}
        {paginatedTasks.length > 0 ? (
          <div style={{ border: '1px solid #eef0f3', borderRadius: 10, overflow: 'hidden' }}>
            {/* List header */}
            <div style={{ background: '#f5f7fa', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #eef0f3' }}>
              <div style={{ width: 28 }} />
              <div style={{ flex: 3, fontSize: 12, fontWeight: 600, color: colors.navy }}>Công việc</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Lệnh SC</div>
              <div style={{ flex: 1.2, fontSize: 12, fontWeight: 600, color: colors.navy }}>Công đoạn</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Người TH</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>Trạng thái</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Tiến độ</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>Giờ KH/TT</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>Hạn</div>
              <div style={{ width: 36 }} />
            </div>

            {/* List rows */}
            {paginatedTasks.map((task, idx) => {
              const statusCfg = repairTaskStatusConfig[task.status];
              const stageCfg = repairStageConfig[task.stage];
              const borderColor = getStageBorder(task.stage);

              return (
                <div key={task.id}
                  onClick={() => navigate(`/repair-execution/${task.id}`)}
                  style={{
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: idx < paginatedTasks.length - 1 ? '1px solid #f5f5f5' : 'none',
                    borderLeft: `3px solid ${borderColor}`,
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: '#fff',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: `${borderColor}15`, color: borderColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {task.sequence}
                  </div>
                  <div style={{ flex: 3, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={task.taskName}>
                      {task.taskName}
                    </div>
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <span style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>{task.workOrderCode}</span>
                  </div>
                  <div style={{ flex: 1.2 }}>
                    <Tag color={stageCfg.color} style={{ margin: 0, fontSize: 11 }}>{stageCfg.label}</Tag>
                  </div>
                  <div style={{ flex: 1.5, fontSize: 12, color: '#555' }}>{task.assignee}</div>
                  <div style={{ flex: 1 }}>
                    <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>{statusCfg.label}</Tag>
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <Progress percent={task.progress} size="small" strokeColor={getProgressColor(task.progress)} style={{ margin: 0 }} />
                  </div>
                  <div style={{ flex: 1, fontSize: 11, color: '#8c8c8c' }}>
                    {task.plannedHours}h / {task.actualHours > 0 ? `${task.actualHours}h` : '—'}
                  </div>
                  <div style={{ flex: 1, fontSize: 11, color: '#8c8c8c' }}>
                    {task.plannedEnd ? formatDate(task.plannedEnd) : '—'}
                  </div>
                  <div style={{ width: 36, textAlign: 'center' }}>
                    <Dropdown menu={{ items: getActionMenu(task) as never[] }} trigger={['click']} placement="bottomRight">
                      <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    </Dropdown>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="Không có công việc nào phù hợp" style={{ padding: '40px 0' }} />
        )}

        {/* Pagination */}
        {filteredTasks.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredTasks.length}
              onChange={setCurrentPage}
              showTotal={total => `Tổng ${total} công việc`}
              showSizeChanger={false}
            />
          </div>
        )}
        </>
        ) : (
        <>
          {/* ═══ Calendar View ═══ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <Button size="small" icon={<LeftOutlined />} onClick={() => setCalendarWeekStart(prev => prev.subtract(7, 'day'))} />
              <span style={{ fontWeight: 600, color: colors.navy, fontSize: 14, minWidth: 200, textAlign: 'center', display: 'inline-block' }}>
                {calendarWeekStart.format('DD/MM')} — {calendarWeekStart.add(6, 'day').format('DD/MM/YYYY')}
              </span>
              <Button size="small" icon={<RightOutlined />} onClick={() => setCalendarWeekStart(prev => prev.add(7, 'day'))} />
              <Button size="small" onClick={() => setCalendarWeekStart(dayjs().startOf('week'))}>Tuần này</Button>
            </Space>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {filteredTasks.length} công việc
            </div>
          </div>

          {(() => {
            const weekDays = Array.from({ length: 7 }, (_, i) => calendarWeekStart.add(i, 'day'));
            const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            const today = dayjs().format('YYYY-MM-DD');

            // Group tasks by stage (rows)
            const stages: RepairStage[] = ['electronic', 'mechanical', 'optical', 'assembly', 'testing'];
            const activeStages = stages.filter(s =>
              filteredTasks.some(t => t.stage === s)
            );

            const getTasksForCell = (stage: RepairStage, day: dayjs.Dayjs) => {
              const dayStr = day.format('YYYY-MM-DD');
              return filteredTasks.filter(t => {
                if (t.stage !== stage) return false;
                const start = t.actualStart || t.plannedStart;
                const end = t.actualEnd || t.plannedEnd;
                if (!start) return false;
                return dayStr >= start && dayStr <= (end || start);
              });
            };

            const stageColorMap: Record<RepairStage, string> = {
              electronic: '#e6f4ff', mechanical: '#fff7e6', optical: '#f9f0ff',
              assembly: '#e6fffb', testing: '#f6ffed',
            };
            const stageTextMap: Record<RepairStage, string> = {
              electronic: '#1677ff', mechanical: '#d46b08', optical: '#531dab',
              assembly: '#08979c', testing: '#389e0d',
            };

            return (
              <div className="cal-grid">
                {/* Header row */}
                <div className="cal-header" style={{ borderRight: '1px solid #eef0f3' }}>Công đoạn</div>
                {weekDays.map((day, i) => (
                  <div key={i} className={`cal-header ${day.format('YYYY-MM-DD') === today ? 'cal-header-today' : ''}`}>
                    <div>{dayLabels[i]}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{day.format('DD')}</div>
                  </div>
                ))}

                {/* Stage rows */}
                {activeStages.map(stage => {
                  const cfg = repairStageConfig[stage];
                  return (
                    <React.Fragment key={stage}>
                      <div className="cal-label">
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: getStageBorder(stage), flexShrink: 0 }} />
                        {cfg.label}
                      </div>
                      {weekDays.map((day, di) => {
                        const tasks = getTasksForCell(stage, day);
                        return (
                          <div key={di} className="cal-cell" style={{ background: day.format('YYYY-MM-DD') === today ? `${colors.navy}04` : undefined }}>
                            {tasks.map(t => {
                              const statusCfg = repairTaskStatusConfig[t.status];
                              return (
                                <div key={t.id} className="cal-task"
                                  style={{ background: stageColorMap[stage],}}
                                  onClick={() => navigate(`/repair-execution/${t.id}`)}>
                                  <div className="cal-task-name" style={{ color: stageTextMap[stage] }}>
                                    {t.taskName}
                                  </div>
                                  <div className="cal-task-meta" style={{ color: stageTextMap[stage] }}>
                                    <UserOutlined /> {t.assignee.split(' ').slice(-2).join(' ')}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                    <div className="cal-task-meta" style={{ color: stageTextMap[stage] }}>
                                      <ClockCircleOutlined /> {t.actualHours > 0 ? `${t.actualHours}h` : `${t.plannedHours}h KH`}
                                      <Tag color={statusCfg.color} style={{ margin: '0 0 0 4px', fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
                                        {t.progress}%
                                      </Tag>
                                    </div>
                                    {t.status === 'in_progress' && (
                                      <Tooltip title="Cập nhật tiến độ">
                                        <Button type="text" size="small"
                                          icon={<EditOutlined style={{ fontSize: 12 }} />}
                                          onClick={(e) => { e.stopPropagation(); openProgressDrawer(t); }}
                                          style={{ width: 22, height: 22, minWidth: 22, padding: 0,
                                            borderRadius: 4, background: `${stageTextMap[stage]}15`, color: stageTextMap[stage] }}
                                        />
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {activeStages.length === 0 && (
                  <>
                    <div className="cal-label">—</div>
                    {weekDays.map((_, i) => (
                      <div key={i} className="cal-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i === 3 && <span style={{ color: '#bfbfbf', fontSize: 12 }}>Không có công việc</span>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })()}
        </>
        )}
      </Card>

      {/* Drawer: Cập nhật tiến độ */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setDrawerTask(null); }}
        width={780}
        closable={false}
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => { setDrawerOpen(false); setDrawerTask(null); }}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSaveProgress}
              style={{ background: colors.navy }}
            >
              Lưu tiến độ
            </Button>
          </div>
        }
      >
        {/* Drawer Header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20,
          }}>
            <EditOutlined />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Cập nhật tiến độ công việc</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{drawerTask?.taskName}</div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Section: Thông tin công việc */}
          <SectionHeader title="Thông tin công việc" icon={<UnorderedListOutlined />} />
          {drawerTask && (
            <div style={{
              background: '#f5f7fa', borderRadius: 10, padding: 16, marginBottom: 24,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px',
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Tên công việc</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{drawerTask.taskName}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Mã lệnh SC</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{drawerTask.workOrderCode}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Công đoạn</div>
                <Tag color={repairStageConfig[drawerTask.stage]?.color}>{repairStageConfig[drawerTask.stage]?.label}</Tag>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Người thực hiện</div>
                <div style={{ fontSize: 13 }}>{drawerTask.assignee}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Giờ kế hoạch</div>
                <div style={{ fontSize: 13 }}>{drawerTask.plannedHours}h</div>
              </div>
            </div>
          )}

          {/* Section: Cập nhật tiến độ */}
          <SectionHeader title="Cập nhật tiến độ" icon={<SyncOutlined />} />
          <Form form={form} layout="vertical" style={{ marginBottom: 24 }}>
            <Form.Item label="Tiến độ hoàn thành" name="progress">
              <Slider
                min={0} max={100}
                marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                tooltip={{ formatter: (v) => `${v}%` }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giờ thực tế" name="actualHours">
                  <Input type="number" suffix="giờ" min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Ghi chú / Phát sinh" name="notes">
              <TextArea rows={3} placeholder="Nhập ghi chú về tiến độ, vấn đề phát sinh..." />
            </Form.Item>
          </Form>

          {/* Section: Vật tư đã sử dụng */}
          <SectionHeader title="Vật tư đã sử dụng" icon={<ToolOutlined />} />
          <div style={{
            border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 80px 40px',
              gap: 8, padding: '10px 14px',
              background: '#f5f7fa', fontWeight: 600, fontSize: 13, color: colors.navy,
            }}>
              <div>Tên vật tư</div>
              <div style={{ textAlign: 'center' }}>SL</div>
              <div style={{ textAlign: 'center' }}>ĐVT</div>
              <div />
            </div>

            {/* Existing rows */}
            {materials.map(mat => (
              <div
                key={mat.key}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 80px 40px',
                  gap: 8, padding: '8px 14px',
                  borderTop: '1px solid #f0f0f0', alignItems: 'center', fontSize: 13,
                }}
              >
                <div>{mat.name}</div>
                <div style={{ textAlign: 'center' }}>{mat.quantity}</div>
                <div style={{ textAlign: 'center' }}>{mat.unit}</div>
                <Button
                  type="text" danger size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleRemoveMaterial(mat.key)}
                  style={{ width: 28, height: 28 }}
                />
              </div>
            ))}

            {/* Inline add row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 80px 40px',
              gap: 8, padding: '8px 14px',
              borderTop: '1px solid #f0f0f0', alignItems: 'center',
            }}>
              <Input
                size="small"
                placeholder="Tên vật tư..."
                value={newMaterial.name}
                onChange={e => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                size="small"
                type="number"
                min={1}
                value={newMaterial.quantity}
                onChange={e => setNewMaterial(prev => ({ ...prev, quantity: Number(e.target.value) || 1 }))}
                style={{ textAlign: 'center' }}
              />
              <Select
                size="small"
                value={newMaterial.unit}
                onChange={v => setNewMaterial(prev => ({ ...prev, unit: v }))}
                options={[
                  { label: 'Cái', value: 'Cái' },
                  { label: 'Bộ', value: 'Bộ' },
                  { label: 'Mét', value: 'Mét' },
                  { label: 'Kg', value: 'Kg' },
                  { label: 'Lít', value: 'Lít' },
                  { label: 'Cuộn', value: 'Cuộn' },
                ]}
                style={{ width: '100%' }}
              />
              <Button
                type="text" size="small"
                icon={<PlusOutlined style={{ color: colors.navy }} />}
                onClick={handleAddMaterial}
                style={{ width: 28, height: 28 }}
              />
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default RepairExecutionPage;
