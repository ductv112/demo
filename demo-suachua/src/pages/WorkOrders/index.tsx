import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Row, Col, Input, Select, Space, Button,
  Drawer, Form, Dropdown, Empty, Pagination,
  Tabs, message, Badge, Progress,
} from 'antd';
import {
  CarryOutOutlined, SearchOutlined, EyeOutlined,
  PlusOutlined, MoreOutlined, EnvironmentOutlined,
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ToolOutlined, EditOutlined, SendOutlined,
  FileSearchOutlined, DollarOutlined, TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { workOrders } from '../../data/workOrders';
import { repairRequests } from '../../data/repairRequests';
import { departments } from '../../data/departments';
import { inventory } from '../../data/inventory';
import type { InventoryItem } from '../../data/inventory';
import {
  workOrderStatusConfig, repairMethodConfig, repairTypeConfig,
  priorityConfig, formatDate, getProgressColor,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkOrder, WorkOrderStatus, Priority } from '../../types';

const pageStyles = `
  .reception-stat-card {
    position: relative; overflow: hidden; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px !important;
  }
  .reception-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .reception-stat-card:hover .stat-bg-icon {
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
  .step-form .ant-form-item-label > label {
    font-weight: 600; color: ${colors.navy};
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
`;

const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="reception-stat-card"
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
      position: 'absolute', top: 12, right: 16, fontSize: 64,
      color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
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

const WorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [methodFilter, setMethodFilter] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTab, setDrawerTab] = useState('info');
  const [form] = Form.useForm();
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);

  // Stats
  const stats = useMemo(() => ({
    total: workOrders.length,
    draft: workOrders.filter((w) => w.status === 'draft').length,
    pending_approval: workOrders.filter((w) => w.status === 'pending_approval').length,
    in_progress: workOrders.filter((w) =>
      w.status === 'in_progress' || w.status === 'quality_check' || w.status === 'testing',
    ).length,
    completed: workOrders.filter((w) =>
      w.status === 'accepted' || w.status === 'handed_over' || w.status === 'closed',
    ).length,
  }), []);

  // Filtered data
  const filteredData = useMemo(() => {
    let result = workOrders as WorkOrder[];

    if (activeTab === 'draft') {
      result = result.filter((w) => w.status === 'draft');
    } else if (activeTab === 'pending_approval') {
      result = result.filter((w) => w.status === 'pending_approval');
    } else if (activeTab === 'in_progress') {
      result = result.filter((w) =>
        w.status === 'in_progress' || w.status === 'quality_check' || w.status === 'testing',
      );
    } else if (activeTab === 'completed') {
      result = result.filter((w) =>
        w.status === 'accepted' || w.status === 'handed_over' || w.status === 'closed',
      );
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (w) => w.code.toLowerCase().includes(lower)
          || w.equipmentName.toLowerCase().includes(lower)
          || w.unitName.toLowerCase().includes(lower)
          || w.assignedTeam.toLowerCase().includes(lower),
      );
    }
    if (priorityFilter) result = result.filter((w) => w.priority === priorityFilter);
    if (methodFilter) result = result.filter((w) => w.repairMethod === methodFilter);

    return result;
  }, [searchText, priorityFilter, methodFilter, activeTab]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1); }, [activeTab, searchText, priorityFilter, methodFilter]);

  // Priority border color
  const getPriorityBorder = (p: Priority) => {
    const map: Record<Priority, string> = {
      critical: colors.danger, high: '#fa8c16', medium: colors.navy, low: '#d9d9d9',
    };
    return map[p];
  };

  // Dropdown menu per status
  const getActionMenu = (record: WorkOrder) => {
    const items: any[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/work-orders/${record.id}`),
      },
    ];

    if (record.status === 'draft') {
      items.push(
        { type: 'divider' },
        {
          key: 'edit',
          icon: <EditOutlined style={{ color: colors.navy }} />,
          label: <span style={{ color: colors.navy, fontWeight: 500 }}>Sửa lệnh</span>,
          onClick: () => message.info(`Mở sửa lệnh ${record.code}`),
        },
        {
          key: 'submit',
          icon: <SendOutlined style={{ color: colors.success }} />,
          label: <span style={{ color: colors.success, fontWeight: 500 }}>Gửi phê duyệt</span>,
          onClick: () => message.success(`Đã gửi phê duyệt lệnh ${record.code}`),
        },
      );
    }

    if (record.status === 'approved') {
      items.push(
        { type: 'divider' },
        {
          key: 'request-material',
          icon: <CarryOutOutlined style={{ color: colors.navy }} />,
          label: <span style={{ color: colors.navy, fontWeight: 500 }}>Yêu cầu xuất kho</span>,
          onClick: () => message.info(`Yêu cầu xuất kho cho ${record.code}`),
        },
        {
          key: 'start',
          icon: <ToolOutlined style={{ color: colors.success }} />,
          label: <span style={{ color: colors.success, fontWeight: 500 }}>Bắt đầu thực hiện</span>,
          onClick: () => message.success(`Bắt đầu thực hiện lệnh ${record.code}`),
        },
      );
    }

    return items;
  };

  // Tab items
  const tabItems = [
    {
      key: 'all',
      label: <span>Tất cả <Badge count={stats.total} style={{ backgroundColor: colors.navy }} size="small" /></span>,
    },
    {
      key: 'draft',
      label: <span>Nháp <Badge count={stats.draft} style={{ backgroundColor: '#8c8c8c' }} size="small" /></span>,
    },
    {
      key: 'pending_approval',
      label: <span>Chờ phê duyệt <Badge count={stats.pending_approval} style={{ backgroundColor: colors.warning }} size="small" /></span>,
    },
    {
      key: 'in_progress',
      label: <span>Đang thực hiện <Badge count={stats.in_progress} style={{ backgroundColor: '#1890ff' }} size="small" /></span>,
    },
    {
      key: 'completed',
      label: <span>Hoàn thành <Badge count={stats.completed} style={{ backgroundColor: colors.success }} size="small" /></span>,
    },
  ];

  // Available repair requests for creating work orders
  const availableRequests = useMemo(() =>
    repairRequests.filter((r) => r.status === 'diagnosed' || r.status === 'ready'),
  []);

  // Technical departments for team assignment
  const technicalDepts = useMemo(() =>
    departments.filter((d) => d.type === 'technical' && d.id.startsWith('PX')),
  []);

  // Selected repair request details
  const selectedRequest = useMemo(() =>
    repairRequests.find((r) => r.id === selectedRequestId),
  [selectedRequestId]);

  // Drawer handlers
  const handleCreateOpen = () => {
    setDrawerVisible(true);
    setDrawerTab('info');
    setSelectedRequestId(undefined);
    form.resetFields();
  };

  const handleCreateSubmit = () => {
    form.validateFields().then(() => {
      message.success('Đã tạo lệnh sửa chữa mới thành công');
      setDrawerVisible(false);
      form.resetFields();
      setSelectedRequestId(undefined);
    }).catch(() => {});
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    form.resetFields();
    setSelectedRequestId(undefined);
  };

  // Drawer Tab 1: Thông tin lệnh
  const renderTabInfo = () => (
    <>
      <SectionHeader title="Yêu cầu sửa chữa" icon={<FileSearchOutlined />} />
      <Form.Item name="repairRequestId" label="Chọn yêu cầu sửa chữa" rules={[{ required: true, message: 'Vui lòng chọn yêu cầu' }]}>
        <Select
          placeholder="Chọn yêu cầu đã chẩn đoán..."
          allowClear
          value={selectedRequestId}
          onChange={(val) => setSelectedRequestId(val)}
          options={availableRequests.map((r) => ({
            value: r.id,
            label: `${r.code} - ${r.equipmentName} (${r.unitName})`,
          }))}
        />
      </Form.Item>
      {selectedRequest && (
        <div style={{
          background: '#f5f7fa', borderRadius: 8, padding: 14, marginBottom: 20,
          border: `1px solid ${colors.navy}15`,
        }}>
          <Row gutter={[12, 8]}>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Thiết bị</div>
              <div style={{ fontWeight: 600, color: colors.navy, fontSize: 13 }}>{selectedRequest.equipmentName}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Số serial</div>
              <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{selectedRequest.serialNumber}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Đơn vị gửi</div>
              <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{selectedRequest.unitName}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Độ ưu tiên</div>
              <Tag color={priorityConfig[selectedRequest.priority].color} style={{ margin: 0, marginTop: 2 }}>
                {priorityConfig[selectedRequest.priority].label}
              </Tag>
            </Col>
          </Row>
        </div>
      )}

      <SectionHeader title="Phương án xử lý" icon={<ToolOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="repairMethod" label="Phương pháp sửa chữa" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn phương pháp"
              options={Object.entries(repairMethodConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="repairType" label="Loại sửa chữa" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn loại sửa chữa"
              options={Object.entries(repairTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <SectionHeader title="Phân công nhân lực" icon={<TeamOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="assignedTeamId" label="Tổ/Phân xưởng thực hiện" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn phân xưởng"
              options={technicalDepts.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="leader" label="Tổ trưởng phụ trách" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
            <Input placeholder="VD: Nguyễn Văn Bình" />
          </Form.Item>
        </Col>
      </Row>

      <SectionHeader title="Lịch thực hiện" icon={<CalendarOutlined />} />
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="plannedStart" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
            <Input type="date" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="plannedEnd" label="Ngày kết thúc" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
            <Input type="date" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="priority" label="Độ ưu tiên" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn"
              options={Object.entries(priorityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <SectionHeader title="Dự toán chi phí" icon={<DollarOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="estimatedCost" label="Chi phí dự toán">
            <Input type="number" placeholder="VD: 150" suffix="triệu đồng" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Task list state
  const [taskList, setTaskList] = useState<{ name: string; stage: string; assignee: string; hours: number }[]>([]);
  const [materialList, setMaterialList] = useState<{ name: string; quantity: number; unit: string; price: number }[]>([]);
  const [taskForm] = Form.useForm();
  const [materialForm] = Form.useForm();

  const stageOptions = [
    { value: 'electronic', label: 'Điện tử' },
    { value: 'mechanical', label: 'Cơ khí' },
    { value: 'optical', label: 'Quang học' },
    { value: 'assembly', label: 'Lắp ráp' },
    { value: 'testing', label: 'Thử nghiệm' },
  ];

  const handleAddTask = () => {
    taskForm.validateFields().then((values) => {
      setTaskList([...taskList, values]);
      taskForm.resetFields();
    }).catch(() => {});
  };

  const handleRemoveTask = (idx: number) => {
    setTaskList(taskList.filter((_, i) => i !== idx));
  };

  const handleAddMaterial = () => {
    materialForm.validateFields().then((values) => {
      setMaterialList([...materialList, values]);
      materialForm.resetFields();
    }).catch(() => {});
  };

  const handleRemoveMaterial = (idx: number) => {
    setMaterialList(materialList.filter((_, i) => i !== idx));
  };

  // Drawer Tab 2: Công việc & Vật tư
  const renderTabTasks = () => (
    <>
      {/* ═══ Danh sách công việc ═══ */}
      <SectionHeader title="Danh sách công việc" icon={<UnorderedListOutlined />} />

      <div style={{ border: '1px solid #eef0f3', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        {/* Header */}
        <div style={{ background: '#f5f7fa', padding: '8px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #eef0f3' }}>
          <div style={{ width: 28 }} />
          <div style={{ flex: 3, fontSize: 12, fontWeight: 600, color: colors.navy }}>Tên công việc</div>
          <div style={{ flex: 2, fontSize: 12, fontWeight: 600, color: colors.navy }}>Công đoạn</div>
          <div style={{ flex: 2, fontSize: 12, fontWeight: 600, color: colors.navy }}>Người thực hiện</div>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>Giờ</div>
          <div style={{ width: 40 }} />
        </div>

        {/* Existing rows */}
        {taskList.map((task, idx) => (
          <div key={idx} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid #f5f5f5', background: '#fff' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${colors.navy}10`, color: colors.navy,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {idx + 1}
            </div>
            <div style={{ flex: 3, fontWeight: 500, fontSize: 13 }}>{task.name}</div>
            <div style={{ flex: 2 }}>
              <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                {stageOptions.find(s => s.value === task.stage)?.label || task.stage}
              </Tag>
            </div>
            <div style={{ flex: 2, fontSize: 12, color: '#555' }}>{task.assignee || '—'}</div>
            <div style={{ flex: 1, fontSize: 12, color: '#555' }}>{task.hours || '—'}</div>
            <div style={{ width: 40, textAlign: 'center' }}>
              <Button type="text" size="small" danger onClick={() => handleRemoveTask(idx)} style={{ fontSize: 11, padding: '0 4px' }}>Xóa</Button>
            </div>
          </div>
        ))}

        {/* Inline add row */}
        <Form form={taskForm} style={{ margin: 0 }}>
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
            background: '#fafbfc', borderTop: taskList.length > 0 ? '1px dashed #e8e8e8' : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${colors.success}15`, color: colors.success,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              <PlusOutlined />
            </div>
            <div style={{ flex: 3 }}>
              <Form.Item name="name" style={{ margin: 0 }}>
                <Input size="small" placeholder="Tên công việc..." style={{ borderRadius: 4 }} />
              </Form.Item>
            </div>
            <div style={{ flex: 2 }}>
              <Form.Item name="stage" style={{ margin: 0 }}>
                <Select size="small" placeholder="Công đoạn" options={stageOptions} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div style={{ flex: 2 }}>
              <Form.Item name="assignee" style={{ margin: 0 }}>
                <Input size="small" placeholder="Người thực hiện" style={{ borderRadius: 4 }} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="hours" style={{ margin: 0 }}>
                <Input size="small" type="number" placeholder="Giờ" style={{ borderRadius: 4 }} />
              </Form.Item>
            </div>
            <div style={{ width: 40, textAlign: 'center' }}>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddTask}
                style={{ background: colors.navy, borderRadius: 4, width: 32, padding: 0 }} />
            </div>
          </div>
        </Form>
      </div>

      {/* ═══ Nhu cầu vật tư ═══ */}
      <SectionHeader title="Nhu cầu vật tư & Thiết bị" icon={<ToolOutlined />} />

      <div style={{ border: '1px solid #eef0f3', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#f5f7fa', padding: '8px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #eef0f3' }}>
          <div style={{ width: 28 }} />
          <div style={{ flex: 4, fontSize: 12, fontWeight: 600, color: colors.navy }}>Tên vật tư / Linh kiện</div>
          <div style={{ flex: 1.2, fontSize: 12, fontWeight: 600, color: colors.navy }}>Tồn kho</div>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>SL yêu cầu</div>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>ĐVT</div>
          <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Đơn giá (tr)</div>
          <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Thành tiền</div>
          <div style={{ width: 40 }} />
        </div>

        {/* Existing rows */}
        {materialList.map((mat, idx) => {
          const inv = inventory.find(i => i.name === mat.name);
          const stock = inv?.stock ?? 0;
          const overStock = mat.quantity > stock;
          return (
            <div key={idx} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid #f5f5f5', background: overStock ? '#fff1f0' : '#fff' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${colors.gold}20`, color: colors.gold,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {idx + 1}
              </div>
              <div style={{ flex: 4 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{mat.name}</div>
                {inv && <div style={{ fontSize: 11, color: '#8c8c8c' }}>{inv.code} — {inv.location}</div>}
              </div>
              <div style={{ flex: 1.2 }}>
                <Tag color={stock > 0 ? (overStock ? 'warning' : 'success') : 'error'}
                  style={{ margin: 0, fontSize: 11 }}>
                  {stock} {mat.unit}
                </Tag>
                {overStock && <div style={{ fontSize: 10, color: colors.danger, marginTop: 2 }}>Thiếu {mat.quantity - stock}</div>}
              </div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{mat.quantity}</div>
              <div style={{ flex: 1, fontSize: 12 }}>{mat.unit || '—'}</div>
              <div style={{ flex: 1.5, fontSize: 12 }}>{mat.price || '—'}</div>
              <div style={{ flex: 1.5 }}>
                {mat.price > 0 && mat.quantity > 0 && (
                  <Tag color="green" style={{ margin: 0, fontSize: 11 }}>{mat.price * mat.quantity} tr</Tag>
                )}
              </div>
              <div style={{ width: 40, textAlign: 'center' }}>
                <Button type="text" size="small" danger onClick={() => handleRemoveMaterial(idx)} style={{ fontSize: 11, padding: '0 4px' }}>Xóa</Button>
              </div>
            </div>
          );
        })}

        {/* Inline add row — Select from inventory */}
        <div style={{ padding: '12px 16px', background: '#fafbfc', borderTop: materialList.length > 0 ? '1px dashed #e8e8e8' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${colors.success}15`, color: colors.success,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              <PlusOutlined />
            </div>
            <div style={{ flex: 1 }}>
              <Select
                size="small"
                placeholder="Chọn vật tư từ danh mục kho..."
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                }
                value={undefined}
                onChange={(_, option: any) => {
                  const inv = inventory.find(i => i.id === option.value);
                  if (inv) {
                    setMaterialList(prev => [...prev, {
                      name: inv.name, quantity: 1, unit: inv.unit, price: inv.unitPrice,
                    }]);
                  }
                }}
                options={inventory
                  .filter(inv => !materialList.some(m => m.name === inv.name))
                  .map(inv => ({
                    value: inv.id,
                    label: `${inv.code} — ${inv.name} (Tồn: ${inv.stock} ${inv.unit}, ${inv.unitPrice} tr/${inv.unit})`,
                  }))}
              />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c', paddingLeft: 36 }}>
            Dữ liệu tồn kho từ phân hệ <b>Quản lý Kho tàng (pkkq-kho)</b>. Tồn kho = 0 sẽ cần đặt hàng.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{pageStyles}</style>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Tổng lệnh SC" value={stats.total}
            icon={<CarryOutOutlined />}
            gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`}
            suffix="lệnh" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Nháp" value={stats.draft}
            icon={<EditOutlined />}
            gradient="linear-gradient(135deg, #595959, #8c8c8c)"
            suffix="lệnh" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Chờ phê duyệt" value={stats.pending_approval}
            icon={<ClockCircleOutlined />}
            gradient={`linear-gradient(135deg, ${colors.warning}, #ffc53d)`}
            suffix="lệnh" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Đang thực hiện" value={stats.in_progress}
            icon={<ToolOutlined />}
            gradient="linear-gradient(135deg, #1890ff, #69c0ff)"
            suffix="lệnh" />
        </Col>
      </Row>

      {/* Main content card */}
      <Card className="section-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15,
              }}>
                <CarryOutOutlined />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Lập lệnh & Kế hoạch sửa chữa</div>
                <div style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>Quản lý lệnh sửa chữa khí tài tại Nhà máy Z119</div>
              </div>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOpen}
              style={{ background: colors.navy, fontWeight: 600 }}>
              Tạo lệnh sửa chữa
            </Button>
          </div>
        }
        style={{ borderRadius: 14 }}
      >
        {/* Status Tabs */}
        <Tabs className="status-tab" activeKey={activeTab} onChange={(key) => { setActiveTab(key); setCurrentPage(1); }}
          items={tabItems} style={{ marginBottom: 12 }} />

        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap size="middle">
            <Input
              placeholder="Tìm kiếm mã lệnh, khí tài, đơn vị..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              prefix={<SearchOutlined style={{ color: colors.navy }} />}
            />
            <Select placeholder="Độ ưu tiên" allowClear style={{ width: 160 }}
              value={priorityFilter} onChange={(v) => setPriorityFilter(v)}
              options={Object.entries(priorityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Select placeholder="Phương pháp" allowClear style={{ width: 170 }}
              value={methodFilter} onChange={(v) => setMethodFilter(v)}
              options={Object.entries(repairMethodConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Space>
        </div>

        {/* Card Grid */}
        {paginatedData.length === 0 ? (
          <Empty description="Không có lệnh sửa chữa nào" style={{ padding: 40 }} />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedData.map((record) => {
                const statusCfg = workOrderStatusConfig[record.status];
                const prioCfg = priorityConfig[record.priority];
                const methodCfg = repairMethodConfig[record.repairMethod];

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={record.id}>
                    <Card
                      className="request-card"
                      onClick={() => navigate(`/work-orders/${record.id}`)}
                      styles={{ body: { padding: 0 } }}
                      style={{}}
                    >
                      {/* Card header */}
                      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="card-code">{record.code}</div>
                          <div className="card-equip" title={record.equipmentName}>{record.equipmentName}</div>
                        </div>
                        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
                          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: 28, height: 28, flexShrink: 0, marginTop: -2, marginRight: -4 }}
                          />
                        </Dropdown>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '0 16px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                          <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>{statusCfg.label}</Tag>
                          <Tag color={prioCfg.color} style={{ margin: 0, fontSize: 11 }}>{prioCfg.label}</Tag>
                          <Tag color={methodCfg.color} style={{ margin: 0, fontSize: 11 }}>{methodCfg.label}</Tag>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div className="card-meta">
                            <EnvironmentOutlined /> {record.unitName}
                          </div>
                          <div className="card-meta">
                            <CalendarOutlined /> {record.plannedEnd ? formatDate(record.plannedEnd) : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div style={{
                        padding: '8px 16px', borderTop: '1px solid #f0f0f0',
                        background: '#fafbfc',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: '#8c8c8c' }}>{record.assignedTeam}</span>
                          <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{record.progress}%</span>
                        </div>
                        <Progress
                          percent={record.progress}
                          size="small"
                          strokeColor={getProgressColor(record.progress)}
                          showInfo={false}
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page) => setCurrentPage(page)}
                showTotal={(t) => `Tổng ${t} lệnh`}
                showSizeChanger={false}
                size="small"
              />
            </div>
          </>
        )}
      </Card>

      {/* Create Drawer */}
      <Drawer
        title={null}
        open={drawerVisible}
        onClose={handleDrawerClose}
        width={780}
        styles={{
          header: { display: 'none' },
          body: { padding: 0 },
          footer: { borderTop: '1px solid #eef0f3', padding: '12px 24px' },
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleDrawerClose}>
              Hủy
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSubmit}
              style={{ background: colors.navy, fontWeight: 600 }}>
              Tạo lệnh sửa chữa
            </Button>
          </div>
        }
      >
        {/* Navy gradient header */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, flexShrink: 0,
          }}>
            <PlusOutlined />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, lineHeight: '22px' }}>
              Tạo lệnh sửa chữa mới
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: '18px' }}>
              Lập kế hoạch sửa chữa khí tài
            </div>
          </div>
        </div>

        {/* Tabs inside drawer */}
        <div style={{ padding: '0 24px' }}>
          <Tabs
            activeKey={drawerTab}
            onChange={(key) => setDrawerTab(key)}
            items={[
              {
                key: 'info',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CarryOutOutlined />
                    Thông tin lệnh
                  </span>
                ),
              },
              {
                key: 'tasks',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UnorderedListOutlined />
                    Công việc & Vật tư
                  </span>
                ),
              },
            ]}
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Form content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <Form form={form} layout="vertical" className="step-form"
            requiredMark={(label, { required }) => (
              <>
                {required && <span style={{ color: colors.danger, marginRight: 2 }}>*</span>}
                {label}
              </>
            )}
          >
            {drawerTab === 'info' ? renderTabInfo() : renderTabTasks()}
          </Form>
        </div>
      </Drawer>
    </>
  );
};

export default WorkOrdersPage;
