import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Space, Typography, Row, Col, Progress, Input, Select, Button,
  Dropdown, Modal, message, Drawer, Form, InputNumber, Badge, Tooltip, Tabs,
} from 'antd';
import {
  DashboardOutlined, SettingOutlined, TeamOutlined, WarningOutlined,
  SearchOutlined, MoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  ExclamationCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined,
  ThunderboltOutlined, SwapOutlined, EyeOutlined, CheckCircleOutlined,
  ToolOutlined, RocketOutlined, ScheduleOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';
import type { ProductionResource, CapacityPlan } from '../../types';
import { formatNumber, getUtilizationColor, orderStatusConfig } from '../../utils/format';
import { productionOrders } from '../../data/productionOrders';

const { Text, Title } = Typography;

// ─── Workshop & resource data ────────────────────────────────────────────────

const capacityPlans: CapacityPlan[] = [
  { workshopId: 'PX1', workshopName: 'Trung tâm Bảo trì Hệ thống Monitoring (PX1)', totalCapacity: 120, usedCapacity: 96, availableCapacity: 24, utilizationRate: 80, bottleneck: false, resources: [] },
  { workshopId: 'PX2', workshopName: 'Trung tâm Bảo trì Cluster Server (PX2)', totalCapacity: 100, usedCapacity: 92, availableCapacity: 8, utilizationRate: 92, bottleneck: true, resources: [] },
  { workshopId: 'PX3', workshopName: 'Trung tâm Hạ tầng (PX3)', totalCapacity: 80, usedCapacity: 54, availableCapacity: 26, utilizationRate: 67.5, bottleneck: false, resources: [] },
  { workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)', totalCapacity: 150, usedCapacity: 123, availableCapacity: 27, utilizationRate: 82, bottleneck: false, resources: [] },
];

const initialResources: (ProductionResource & { trend: 'up' | 'down' | 'stable'; activeOrders: number })[] = [
  { id: 'RES-001', code: 'TB-OSC-001', name: 'Máy hiện sóng Tektronix MSO46', type: 'machine', workshopId: 'PX4', workshopName: 'PX4', capacityPerDay: 8, unit: 'giờ', currentUtilization: 87.5, status: 'busy', trend: 'up', activeOrders: 2 },
  { id: 'RES-002', code: 'TB-SMT-001', name: 'Máy hàn SMT #1', type: 'machine', workshopId: 'PX4', workshopName: 'PX4', capacityPerDay: 50, unit: 'bo mạch/ngày', currentUtilization: 85, status: 'busy', trend: 'up', activeOrders: 3 },
  { id: 'RES-013', code: 'TB-SMT-002', name: 'Máy hàn SMT #2', type: 'machine', workshopId: 'PX4', workshopName: 'PX4', capacityPerDay: 50, unit: 'bo mạch/ngày', currentUtilization: 70, status: 'busy', trend: 'stable', activeOrders: 2 },
  { id: 'RES-003', code: 'TB-CNC-001', name: 'Máy phay CNC Siemens SINUMERIK', type: 'machine', workshopId: 'PX3', workshopName: 'PX3', capacityPerDay: 16, unit: 'giờ', currentUtilization: 62.5, status: 'busy', trend: 'down', activeOrders: 1 },
  { id: 'RES-004', code: 'TB-CNC-002', name: 'Máy tiện CNC Fanuc', type: 'machine', workshopId: 'PX3', workshopName: 'PX3', capacityPerDay: 16, unit: 'giờ', currentUtilization: 50, status: 'available', trend: 'down', activeOrders: 1 },
  { id: 'RES-005', code: 'TB-SPC-001', name: 'Máy phân tích phổ tín hiệu', type: 'machine', workshopId: 'PX1', workshopName: 'PX1', capacityPerDay: 10, unit: 'module/ngày', currentUtilization: 93.8, status: 'busy', trend: 'up', activeOrders: 3 },
  { id: 'RES-006', code: 'TB-WLD-001', name: 'Máy hàn TIG Lincoln Electric', type: 'machine', workshopId: 'PX3', workshopName: 'PX3', capacityPerDay: 8, unit: 'giờ', currentUtilization: 25, status: 'available', trend: 'down', activeOrders: 0 },
  { id: 'RES-007', code: 'NL-PX1-T01', name: 'Tổ kỹ thuật monitoring (5 người)', type: 'worker', workshopId: 'PX1', workshopName: 'PX1', capacityPerDay: 40, unit: 'giờ công', currentUtilization: 82, status: 'busy', trend: 'stable', activeOrders: 2 },
  { id: 'RES-008', code: 'NL-PX2-T01', name: 'Tổ kỹ thuật cluster server (4 người)', type: 'worker', workshopId: 'PX2', workshopName: 'PX2', capacityPerDay: 32, unit: 'giờ công', currentUtilization: 95, status: 'busy', trend: 'up', activeOrders: 4 },
  { id: 'RES-009', code: 'NL-PX3-T01', name: 'Tổ hạ tầng chính xác (3 người)', type: 'machine', workshopId: 'PX3', workshopName: 'PX3', capacityPerDay: 24, unit: 'giờ công', currentUtilization: 70.8, status: 'busy', trend: 'stable', activeOrders: 1 },
  { id: 'RES-010', code: 'NL-PX4-T01', name: 'Tổ điện tử - vi mạch (6 người)', type: 'worker', workshopId: 'PX4', workshopName: 'PX4', capacityPerDay: 30, unit: 'bo mạch/ngày', currentUtilization: 85, status: 'busy', trend: 'up', activeOrders: 3 },
  { id: 'RES-011', code: 'TB-TST-001', name: 'Hệ thống thử nghiệm monitoring', type: 'machine', workshopId: 'PX1', workshopName: 'PX1', capacityPerDay: 8, unit: 'giờ', currentUtilization: 0, status: 'maintenance', trend: 'stable', activeOrders: 0 },
  { id: 'RES-012', code: 'TB-TST-002', name: 'Bàn thử cluster Sigma-125', type: 'machine', workshopId: 'PX2', workshopName: 'PX2', capacityPerDay: 8, unit: 'giờ', currentUtilization: 100, status: 'busy', trend: 'up', activeOrders: 2 },
];

// ─── Actionable alerts ────────────────────────────────────────────────────────

type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';
type AlertActionType = 'overload' | 'bottleneck' | 'maintenance' | 'idle';

interface CapacityAlertItem {
  id: string;
  severity: AlertSeverity;
  type: AlertActionType;
  resourceId: string;
  resourceName: string;
  workshopId: string;
  utilizationRate: number;
  cause: string;
  impact: string;
  affectedOrders: number;
}

const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Nguy hiểm', color: '#ff4d4f', bg: 'rgba(255,77,79,0.06)', border: '#ff4d4f' },
  high:     { label: 'Cao',       color: '#fa8c16', bg: 'rgba(250,140,22,0.06)', border: '#fa8c16' },
  medium:   { label: 'Trung bình',color: '#faad14', bg: 'rgba(250,173,20,0.06)', border: '#faad14' },
  info:     { label: 'Thông tin', color: '#1890ff', bg: 'rgba(24,144,255,0.06)', border: '#1890ff' },
};

const staticAlerts: CapacityAlertItem[] = [
  {
    id: 'ALT-001', severity: 'critical', type: 'overload',
    resourceId: 'RES-012', resourceName: 'Bàn thử cluster Sigma-125', workshopId: 'PX2', utilizationRate: 100,
    cause: 'Chỉ có 1 bàn thử trong khi 2 lệnh Sigma-125 và 1 lệnh SA-3 đang cùng yêu cầu',
    impact: 'Dự kiến trễ 3–5 ngày cho LSX-2026-0062', affectedOrders: 3,
  },
  {
    id: 'ALT-002', severity: 'high', type: 'overload',
    resourceId: 'RES-008', resourceName: 'Tổ kỹ thuật cluster server (4 người)', workshopId: 'PX2', utilizationRate: 95,
    cause: '4 lệnh SX đồng thời tại PX2, không có dự phòng nhân lực',
    impact: 'Nguy cơ trễ 2 lệnh ưu tiên cao vào tuần tới', affectedOrders: 4,
  },
  {
    id: 'ALT-003', severity: 'high', type: 'overload',
    resourceId: 'RES-005', resourceName: 'Máy phân tích phổ tín hiệu', workshopId: 'PX1', utilizationRate: 93.8,
    cause: '3 lệnh hệ thống Alpha-18 đều cần kiểm tra phổ tần, thiết bị không đủ thời lượng',
    impact: 'Công đoạn kiểm tra tần số có thể tạo nút thắt cổ chai tại PX1', affectedOrders: 3,
  },
  {
    id: 'ALT-004', severity: 'medium', type: 'bottleneck',
    resourceId: 'PX2', resourceName: 'Trung tâm Bảo trì Cluster Server', workshopId: 'PX2', utilizationRate: 92,
    cause: 'Tổng năng lực trung tâm PX2 đạt 92%, vượt ngưỡng khuyến nghị 85%',
    impact: 'Toàn bộ lệnh SX tại PX2 có nguy cơ bị trễ trong 2 tuần tới', affectedOrders: 5,
  },
  {
    id: 'ALT-005', severity: 'info', type: 'maintenance',
    resourceId: 'RES-011', resourceName: 'Hệ thống thử nghiệm monitoring', workshopId: 'PX1', utilizationRate: 0,
    cause: 'Đang bảo trì định kỳ theo lịch, dự kiến hoàn thành 18/04/2026',
    impact: 'Các lệnh cần thử nghiệm monitoring phải xếp hàng chờ sau 18/04', affectedOrders: 1,
  },
  {
    id: 'ALT-006', severity: 'info', type: 'idle',
    resourceId: 'RES-006', resourceName: 'Máy hàn TIG Lincoln Electric', workshopId: 'PX3', utilizationRate: 25,
    cause: 'Chỉ được phân công 2 giờ/ngày, công việc hàn kết cấu ít',
    impact: 'Lãng phí 6 giờ/ngày. Có thể nhận thêm 2–3 lệnh hàn hạ tầng', affectedOrders: 0,
  },
];

// ─── Auto-suggest data ────────────────────────────────────────────────────────

const rebalanceSuggestions = [
  {
    id: 'SUG-001', priority: 'Khẩn cấp',
    from: 'Tổ kỹ thuật cluster server PX2 (95%)',
    action: 'Tăng ca thứ 7 và Chủ nhật (8h/ngày × 2 người)',
    effect: 'Giảm tải xuống ~78%, xử lý thêm được 16 giờ công/tuần',
    ordersAffected: 'LSX-2026-0062, LSX-VT-2026-0120',
  },
  {
    id: 'SUG-002', priority: 'Cao',
    from: 'Bàn thử cluster Sigma-125 PX2 (100%)',
    action: 'Lùi lịch kiểm tra LSX-VT-2026-0120 sang tuần 3/5 (ưu tiên thấp hơn)',
    effect: 'Giải phóng 2 ngày cho lệnh ưu tiên khẩn cấp',
    ordersAffected: 'LSX-2026-0062',
  },
  {
    id: 'SUG-003', priority: 'Trung bình',
    from: 'Máy phân tích phổ PX1 (93.8%)',
    action: 'Chạy 2 ca/ngày (thêm ca tối 17:00–21:00) trong 5 ngày tới',
    effect: 'Tăng công suất thêm 40%, giải tỏa 3 lệnh đang xếp hàng',
    ordersAffected: 'LSX-2026-0058, LSX-2026-0064',
  },
  {
    id: 'SUG-004', priority: 'Thấp',
    from: 'Máy hàn TIG Lincoln (PX3, 25%)',
    action: 'Phân công thêm 2 lệnh hàn kết cấu hạ tầng từ danh sách chờ',
    effect: 'Tăng sử dụng lên ~65%, không lãng phí thiết bị',
    ordersAffected: 'Danh sách chờ PX3',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const resourceTypeConfig: Record<string, { label: string; color: string }> = {
  machine: { label: 'Thiết bị', color: '#1B3A5C' },
  line:    { label: 'Dây chuyền', color: '#7c3aed' },
  worker:  { label: 'Nhân lực', color: '#0891b2' },
};

const resourceStatusConfig: Record<string, { label: string; color: string }> = {
  available:   { label: 'Sẵn sàng',     color: 'success' },
  busy:        { label: 'Đang sử dụng', color: 'processing' },
  maintenance: { label: 'Bảo trì',      color: 'warning' },
  offline:     { label: 'Ngừng',        color: 'error' },
};

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Monitoring' },
  { value: 'PX2', label: 'PX2 - Cluster' },
  { value: 'PX3', label: 'PX3 - Hạ tầng' },
  { value: 'PX4', label: 'PX4 - Phát triển PM' },
];

const getCapacityColor = (rate: number) =>
  rate >= 90 ? '#ff4d4f' : rate >= 70 ? '#faad14' : '#52c41a';

// ─── Component ────────────────────────────────────────────────────────────────

const CapacityManagementPage: React.FC = () => {
  const [resources, setResources] = useState(initialResources);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterWorkshop, setFilterWorkshop] = useState<string | undefined>(undefined);
  const [tableTab, setTableTab] = useState('all');

  // Drawers / Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ProductionResource | null>(null);
  const [detailResource, setDetailResource] = useState<typeof initialResources[0] | null>(null);
  const [suggestModal, setSuggestModal] = useState(false);
  const [form] = Form.useForm();

  // ─── KPI computations ──────────────────────────────────────────────────────

  const kpi = useMemo(() => {
    const active = resources.filter(r => r.status !== 'offline');
    const avgUtil = Math.round(active.reduce((s, r) => s + r.currentUtilization, 0) / (active.length || 1));
    const overloaded = active.filter(r => r.currentUtilization >= 90).length;
    const idle = active.filter(r => r.currentUtilization < 30 && r.status === 'available').length;
    const maintenance = resources.filter(r => r.status === 'maintenance').length;
    return { avgUtil, overloaded, idle, maintenance };
  }, [resources]);

  // ─── Table filtering ────────────────────────────────────────────────────────

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch = !searchText ||
        r.code.toLowerCase().includes(searchText.toLowerCase()) ||
        r.name.toLowerCase().includes(searchText.toLowerCase());
      const matchType = !filterType || r.type === filterType;
      const matchWorkshop = !filterWorkshop || r.workshopId === filterWorkshop;
      const matchTab = tableTab === 'all' ? true
        : tableTab === 'overload' ? r.currentUtilization >= 90
        : tableTab === 'normal'   ? r.currentUtilization >= 30 && r.currentUtilization < 90
        : tableTab === 'idle'     ? r.currentUtilization < 30 && r.status === 'available'
        : r.status === 'maintenance';
      return matchSearch && matchType && matchWorkshop && matchTab;
    });
  }, [resources, searchText, filterType, filterWorkshop, tableTab]);

  // ─── Chart data ─────────────────────────────────────────────────────────────

  const chartData = capacityPlans.map(ws => ({
    workshop: ws.workshopId,
    value: ws.utilizationRate,
    color: getCapacityColor(ws.utilizationRate),
  }));

  const chartConfig: any = {
    data: chartData,
    xField: 'workshop',
    yField: 'value',
    colorField: 'workshop',
    height: 220,
    scale: {
      color: { range: chartData.map(d => d.color) },
      y: { domainMax: 100 },
    },
    axis: {
      y: {
        labelFormatter: (v: number) => `${v}%`,
        title: '% Sử dụng',
        gridLineDash: [4, 4],
        gridLineStroke: '#f0f0f0',
      },
    },
    style: { maxWidth: 60, radiusTopLeft: 6, radiusTopRight: 6 },
    label: {
      text: (d: { value: number }) => `${d.value}%`,
      position: 'outside',
      style: { fontSize: 12, fontWeight: 600, fill: '#1B3A5C' },
    },
    legend: false,
    annotations: [
      { type: 'lineY', data: [90], style: { stroke: '#ff4d4f', lineDash: [4, 4], lineWidth: 1.5 }, label: { text: '90% — Ngưỡng quá tải', style: { fill: '#ff4d4f', fontSize: 10 }, position: 'left' } },
      { type: 'lineY', data: [70], style: { stroke: '#faad14', lineDash: [4, 4], lineWidth: 1 }, label: { text: '70% — Cảnh báo', style: { fill: '#faad14', fontSize: 10 }, position: 'left' } },
    ],
    tooltip: { items: [{ channel: 'y', valueFormatter: (v: number) => `${v}%` }] },
  };

  // ─── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAdd = () => {
    setEditingResource(null);
    form.resetFields();
    form.setFieldsValue({ type: 'machine', status: 'available', unit: 'giờ', currentUtilization: 0 });
    setDrawerOpen(true);
  };

  const handleEdit = (record: ProductionResource) => {
    setEditingResource(record);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleDelete = (record: ProductionResource) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Xóa nguồn lực "${record.name}" (${record.code})?`,
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: () => { setResources(resources.filter(r => r.id !== record.id)); message.success('Đã xóa'); },
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const wsName = workshopOptions.find(w => w.value === values.workshopId)?.label?.split(' - ')[0] || values.workshopId;
      if (editingResource) {
        setResources(resources.map(r => r.id === editingResource.id ? { ...r, ...values, workshopName: wsName } : r));
        message.success('Cập nhật thành công');
      } else {
        setResources([...resources, { id: `RES-${Date.now()}`, ...values, workshopName: wsName, trend: 'stable' as const, activeOrders: 0 }]);
        message.success('Thêm mới thành công');
      }
      setDrawerOpen(false);
    });
  };

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns: ColumnsType<typeof initialResources[0]> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 130,
      render: (v: string) => <Text strong style={{ color: '#1B3A5C', fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    { title: 'Tên thiết bị / nhân lực', dataIndex: 'name', key: 'name', width: 240 },
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 90,
      render: (t: string) => { const cfg = resourceTypeConfig[t]; return <Tag color={cfg?.color}>{cfg?.label}</Tag>; },
    },
    {
      title: 'PX', dataIndex: 'workshopId', key: 'workshopId', width: 55,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Sử dụng',
      key: 'currentUtilization', width: 180,
      defaultSortOrder: 'descend' as const,
      sorter: (a, b) => a.currentUtilization - b.currentUtilization,
      render: (_: unknown, r: typeof initialResources[0]) => {
        const color = getCapacityColor(r.currentUtilization);
        const actual = Math.round(r.capacityPerDay * r.currentUtilization / 100 * 10) / 10;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <Text style={{ color, fontWeight: 600 }}>{actual} / {r.capacityPerDay} {r.unit}</Text>
              <Text style={{ color, fontWeight: 700 }}>{r.currentUtilization}%</Text>
            </div>
            <Progress percent={r.currentUtilization} size="small" strokeColor={color} showInfo={false} />
          </div>
        );
      },
    },
    {
      title: 'Xu hướng', dataIndex: 'trend', key: 'trend', width: 80, align: 'center' as const,
      render: (t: string) => (
        <Tooltip title={t === 'up' ? 'Tải đang tăng' : t === 'down' ? 'Tải đang giảm' : 'Ổn định'}>
          {t === 'up'
            ? <Tag color="red" style={{ margin: 0 }}><ArrowUpOutlined /> Tăng</Tag>
            : t === 'down'
              ? <Tag color="green" style={{ margin: 0 }}><ArrowDownOutlined /> Giảm</Tag>
              : <Tag style={{ margin: 0 }}><MinusOutlined /> Ổn định</Tag>}
        </Tooltip>
      ),
    },
    {
      title: 'Lệnh đang chạy', dataIndex: 'activeOrders', key: 'activeOrders', width: 100, align: 'center' as const,
      sorter: (a, b) => a.activeOrders - b.activeOrders,
      render: (n: number) => n > 0
        ? <Badge count={n} style={{ backgroundColor: n >= 3 ? '#ff4d4f' : '#1B3A5C' }} />
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (s: string) => { const cfg = resourceStatusConfig[s]; return <Tag color={cfg?.color}>{cfg?.label}</Tag>; },
    },
    {
      title: 'Thao tác', key: 'actions', width: 80, align: 'center' as const,
      render: (_: unknown, record: typeof initialResources[0]) => (
        <Space size={2}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setDetailResource(record)} />
          </Tooltip>
          <Dropdown menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
              { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
            ],
            onClick: ({ key }) => { if (key === 'edit') handleEdit(record); if (key === 'delete') handleDelete(record); },
          }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // ─── Utilization matrix data ─────────────────────────────────────────────────

  const matrixData = ['PX1', 'PX2', 'PX3', 'PX4'].map(ws => {
    const wsResources = resources.filter(r => r.workshopId === ws);
    const machines = wsResources.filter(r => r.type === 'machine');
    const workers = wsResources.filter(r => r.type === 'worker');
    const avgMachine = machines.length ? Math.round(machines.reduce((s, r) => s + r.currentUtilization, 0) / machines.length) : 0;
    const avgWorker = workers.length ? Math.round(workers.reduce((s, r) => s + r.currentUtilization, 0) / workers.length) : 0;
    return { ws, avgMachine, avgWorker };
  });

  const MatrixCell = ({ value }: { value: number }) => {
    const bg = value >= 90 ? '#ff4d4f' : value >= 70 ? '#faad14' : '#52c41a';
    const textColor = value >= 70 ? '#fff' : '#fff';
    return (
      <div style={{
        background: bg, color: textColor, borderRadius: 6, padding: '6px 0',
        textAlign: 'center', fontWeight: 700, fontSize: 13,
      }}>
        {value}%
      </div>
    );
  };

  // ─── Active orders for detail drawer ────────────────────────────────────────

  const detailOrders = useMemo(() => {
    if (!detailResource) return [];
    return productionOrders.filter(o =>
      o.workshopId === detailResource.workshopId &&
      (o.status === 'in_progress' || o.status === 'ready')
    );
  }, [detailResource]);

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DashboardOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Năng lực sản xuất</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Theo dõi, phân tích và ra quyết định điều độ nguồn lực Trung tâm Phần mềm Alpha</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}>
          Thêm nguồn lực
        </Button>
      </div>

      {/* ── KPI Bar ─────────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Sử dụng toàn hệ thống', value: `${kpi.avgUtil}%`,
            sub: `${resources.filter(r => r.status !== 'offline').length} nguồn lực đang theo dõi`,
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <DashboardOutlined />, warn: kpi.avgUtil >= 85,
          },
          {
            label: 'Quá tải (≥90%)', value: kpi.overloaded,
            sub: kpi.overloaded > 0 ? 'Cần xử lý ngay' : 'Không có vấn đề',
            gradient: kpi.overloaded > 0 ? 'linear-gradient(135deg, #cf1322, #ff4d4f)' : 'linear-gradient(135deg, #237804, #52c41a)',
            icon: <WarningOutlined />, warn: kpi.overloaded > 0,
          },
          {
            label: 'Nhàn rỗi (<30%)', value: kpi.idle,
            sub: kpi.idle > 0 ? 'Có thể nhận thêm việc' : 'Phân bổ hợp lý',
            gradient: 'linear-gradient(135deg, #006d75, #08979c)',
            icon: <CheckCircleOutlined />, warn: false,
          },
          {
            label: 'Đang bảo trì', value: kpi.maintenance,
            sub: kpi.maintenance > 0 ? 'Không khả dụng' : 'Tất cả hoạt động',
            gradient: 'linear-gradient(135deg, #614700, #d48806)',
            icon: <ToolOutlined />, warn: false,
          },
        ].map((card, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14, overflow: 'hidden' }}
              styles={{ body: { padding: '18px 20px', position: 'relative' } }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, pointerEvents: 'none' }}>
                <span style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }}>{card.icon}</span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{card.sub}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Workshop Overview cards ──────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {capacityPlans.map(ws => {
          const color = getCapacityColor(ws.utilizationRate);
          const isSelected = filterWorkshop === ws.workshopId;
          return (
            <Col xs={12} sm={12} md={6} key={ws.workshopId}>
              <Card hoverable
                onClick={() => setFilterWorkshop(isSelected ? undefined : ws.workshopId)}
                style={{ borderRadius: 14, boxShadow: isSelected ? `0 0 0 2px ${color}, 0 4px 16px rgba(0,0,0,0.08)` : '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.25s' }}
                styles={{ body: { padding: '16px 20px' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1B3A5C' }}>{ws.workshopId}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 1 }}>
                      {ws.workshopName.replace(` (${ws.workshopId})`, '').replace('Trung tâm ', '')}
                    </div>
                  </div>
                  {ws.bottleneck
                    ? <Tag color="error" style={{ fontSize: 10, margin: 0 }}>Tắc nghẽn</Tag>
                    : <Tag color="success" style={{ fontSize: 10, margin: 0 }}>Bình thường</Tag>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Progress type="circle" percent={ws.utilizationRate} strokeColor={color} size={68}
                    format={(p) => <span style={{ fontSize: 14, fontWeight: 700, color }}>{p}%</span>} />
                  <div style={{ flex: 1 }}>
                    {[
                      { label: 'Sử dụng', val: ws.usedCapacity, color },
                      { label: 'Còn lại', val: ws.availableCapacity, color: '#52c41a' },
                      { label: 'Tổng', val: ws.totalCapacity, color: '#1B3A5C' },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: '#8c8c8c' }}>{s.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Column chart */}
        <Col xs={24} md={15}>
          <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px 20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DashboardOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tỷ lệ sử dụng theo trung tâm</Text>
              <Tag style={{ marginLeft: 'auto', fontSize: 11 }}>Ngưỡng đỏ: 90%</Tag>
            </div>
            <Column {...chartConfig} />
          </Card>
        </Col>

        {/* Utilization matrix */}
        <Col xs={24} md={9}>
          <Card className="db-chart-card" style={{ borderRadius: 14, height: '100%' }} styles={{ body: { padding: '16px 20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #D4A843, #f0d890)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RocketOutlined style={{ color: '#1B3A5C', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Ma trận sử dụng nguồn lực</Text>
            </div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 6, marginBottom: 6 }}>
              <div />
              <div style={{ textAlign: 'center', fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>Thiết bị</div>
              <div style={{ textAlign: 'center', fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>Nhân lực</div>
            </div>
            {matrixData.map(row => (
              <div key={row.ws} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 6, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 13, color: '#1B3A5C' }}>{row.ws}</div>
                <MatrixCell value={row.avgMachine} />
                <MatrixCell value={row.avgWorker} />
              </div>
            ))}
            <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: 11 }}>
              {[{ color: '#52c41a', label: '<70%' }, { color: '#faad14', label: '70–90%' }, { color: '#ff4d4f', label: '≥90%' }].map(l => (
                <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                  <span style={{ color: '#8c8c8c' }}>{l.label}</span>
                </span>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Actionable Alerts ───────────────────────────────────────────────── */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #faad14, #ffc53d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WarningOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Cảnh báo cần xử lý</Text>
            <Badge count={staticAlerts.filter(a => a.severity !== 'info').length} color="#ff4d4f" />
          </div>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setSuggestModal(true)}
            style={{ background: '#D4A843', borderColor: '#D4A843', color: '#1B3A5C', borderRadius: 8, fontWeight: 600 }}>
            Gợi ý phân bổ tự động
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {staticAlerts.map(alert => {
            const cfg = alertSeverityConfig[alert.severity];
            return (
              <div key={alert.id} style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#fff', borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                {/* Severity */}
                <div style={{ minWidth: 72, paddingTop: 2 }}>
                  <Tag color={cfg.border} style={{ fontSize: 11, fontWeight: 700, borderRadius: 4 }}>{cfg.label}</Tag>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{alert.resourceName}</Text>
                    <Tag style={{ fontSize: 10, margin: 0 }}>{alert.workshopId}</Tag>
                    {alert.utilizationRate > 0 && (
                      <Text style={{ fontSize: 12, color: cfg.border, fontWeight: 600 }}>{alert.utilizationRate}%</Text>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 2 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Nguyên nhân: </Text>{alert.cause}
                  </div>
                  <div style={{ fontSize: 12, color: '#595959' }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Ảnh hưởng: </Text>
                    <Text style={{ color: alert.affectedOrders > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
                      {alert.impact}
                    </Text>
                  </div>
                </div>

                {/* Action buttons */}
                <Space size={6} style={{ flexShrink: 0 }}>
                  {alert.type !== 'idle' && alert.type !== 'maintenance' && (
                    <Button size="small" icon={<SwapOutlined />} onClick={() => setSuggestModal(true)}
                      style={{ borderRadius: 6, fontSize: 12 }}>Phân bổ lại</Button>
                  )}
                  <Button size="small" icon={<EyeOutlined />}
                    onClick={() => setDetailResource(resources.find(r => r.id === alert.resourceId) ?? null)}
                    style={{ borderRadius: 6, fontSize: 12 }}>Chi tiết</Button>
                  <Button size="small" icon={<ScheduleOutlined />}
                    onClick={() => message.info('Điều hướng đến Kế hoạch sản xuất')}
                    style={{ borderRadius: 6, fontSize: 12 }}>Điều chỉnh KH</Button>
                </Space>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Điều độ nhanh ───────────────────────────────────────────────────── */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #531dab, #722ed1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SwapOutlined style={{ color: '#fff', fontSize: 13 }} />
          </div>
          <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Bảng điều độ nhanh</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>— Nguồn lực quá tải và còn capacity</Text>
        </div>

        <Row gutter={[16, 0]}>
          {/* Overloaded */}
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Tag color="red" style={{ fontWeight: 600 }}>Quá tải / Cần giảm tải</Tag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resources.filter(r => r.currentUtilization >= 85 && r.status !== 'maintenance').map(r => (
                <div key={r.id} style={{ padding: '10px 14px', background: 'rgba(255,77,79,0.04)', borderRadius: 8, border: '1px solid rgba(255,77,79,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: 12, color: '#1B3A5C' }}>{r.name}</Text>
                      <Tag style={{ marginLeft: 6, fontSize: 10 }}>{r.workshopId}</Tag>
                    </div>
                    <Text style={{ fontWeight: 700, color: getCapacityColor(r.currentUtilization), fontSize: 13 }}>
                      {r.currentUtilization}%
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Progress percent={r.currentUtilization} size="small" strokeColor={getCapacityColor(r.currentUtilization)} showInfo={false} />
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                    {r.activeOrders} lệnh đang chiếm tải · {r.trend === 'up' ? '↑ Tải đang tăng' : r.trend === 'down' ? '↓ Tải đang giảm' : '~ Ổn định'}
                  </div>
                </div>
              ))}
            </div>
          </Col>

          {/* Available */}
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Tag color="green" style={{ fontWeight: 600 }}>Còn capacity / Có thể nhận thêm</Tag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resources.filter(r => r.currentUtilization < 70 && r.status !== 'maintenance').map(r => (
                <div key={r.id} style={{ padding: '10px 14px', background: 'rgba(82,196,26,0.04)', borderRadius: 8, border: '1px solid rgba(82,196,26,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: 12, color: '#1B3A5C' }}>{r.name}</Text>
                      <Tag style={{ marginLeft: 6, fontSize: 10 }}>{r.workshopId}</Tag>
                    </div>
                    <Text style={{ fontWeight: 700, color: '#52c41a', fontSize: 13 }}>
                      {r.currentUtilization}%
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Progress percent={r.currentUtilization} size="small" strokeColor="#52c41a" showInfo={false} />
                  </div>
                  <div style={{ fontSize: 11, color: '#52c41a', marginTop: 4 }}>
                    Còn {100 - r.currentUtilization}% capacity trống — có thể nhận thêm việc
                  </div>
                </div>
              ))}
              {resources.filter(r => r.status === 'maintenance').map(r => (
                <div key={r.id} style={{ padding: '10px 14px', background: 'rgba(24,144,255,0.04)', borderRadius: 8, border: '1px solid rgba(24,144,255,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: 12, color: '#1B3A5C' }}>{r.name}</Text>
                      <Tag style={{ marginLeft: 6, fontSize: 10 }}>{r.workshopId}</Tag>
                    </div>
                    <Tag color="blue" style={{ fontSize: 10 }}>Bảo trì</Tag>
                  </div>
                  <div style={{ fontSize: 11, color: '#1890ff', marginTop: 6 }}>Khả dụng sau 18/04/2026</div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setSuggestModal(true)}
            style={{ background: '#531dab', borderColor: '#531dab', borderRadius: 8 }}>
            Xem gợi ý phân bổ tự động ({rebalanceSuggestions.length} đề xuất)
          </Button>
        </div>
      </Card>

      {/* ── Filter + Table ──────────────────────────────────────────────────── */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        {/* Quick filter tabs + search */}
        <div style={{ padding: '12px 20px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <Space align="center" size={8}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SettingOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Chi tiết nguồn lực</Text>
            </Space>
            <Space>
              <Input placeholder="Tìm kiếm mã, tên..." prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
                value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ borderRadius: 6, width: 220 }} />
              <Select placeholder="Loại" value={filterType} onChange={setFilterType} allowClear style={{ width: 120 }}
                options={Object.entries(resourceTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
              <Select placeholder="Trung tâm" value={filterWorkshop} onChange={setFilterWorkshop} allowClear style={{ width: 130 }}
                options={workshopOptions} />
              <Button size="small" onClick={() => { setSearchText(''); setFilterType(undefined); setFilterWorkshop(undefined); setTableTab('all'); }}>
                Xóa bộ lọc
              </Button>
            </Space>
          </div>

          <Tabs activeKey={tableTab} onChange={setTableTab} size="small" style={{ marginBottom: -1 }}
            items={[
              { key: 'all', label: `Tất cả (${resources.length})` },
              { key: 'overload', label: <span style={{ color: '#ff4d4f' }}>Quá tải ({resources.filter(r => r.currentUtilization >= 90).length})</span> },
              { key: 'normal', label: <span style={{ color: '#faad14' }}>Bình thường ({resources.filter(r => r.currentUtilization >= 30 && r.currentUtilization < 90).length})</span> },
              { key: 'idle', label: <span style={{ color: '#52c41a' }}>Nhàn rỗi ({resources.filter(r => r.currentUtilization < 30 && r.status === 'available').length})</span> },
              { key: 'maintenance', label: `Bảo trì (${resources.filter(r => r.status === 'maintenance').length})` },
            ]}
          />
        </div>

        <Table<typeof initialResources[0]>
          columns={columns}
          dataSource={filteredResources}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi` }}
          rowClassName={(r) =>
            r.currentUtilization >= 90 ? 'row-overloaded' :
            r.currentUtilization >= 70 ? 'row-warning' : ''}
        />
      </Card>

      {/* ── Resource Detail Drawer (drill-down) ─────────────────────────────── */}
      <Drawer
        title={null} placement="right" width={520}
        open={!!detailResource}
        onClose={() => setDetailResource(null)}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
      >
        {detailResource && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {detailResource.type === 'worker' ? <TeamOutlined style={{ color: '#fff', fontSize: 22 }} /> : <SettingOutlined style={{ color: '#fff', fontSize: 22 }} />}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{detailResource.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{detailResource.code} · {detailResource.workshopId}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Tỷ lệ sử dụng', val: `${detailResource.currentUtilization}%`, color: getCapacityColor(detailResource.currentUtilization) },
                  { label: 'Năng lực/ngày', val: `${detailResource.capacityPerDay} ${detailResource.unit}`, color: '#fff' },
                  { label: 'Lệnh đang chạy', val: detailResource.activeOrders, color: '#f0d890' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <Progress percent={detailResource.currentUtilization} strokeColor={getCapacityColor(detailResource.currentUtilization)}
                trailColor="rgba(255,255,255,0.15)" showInfo={false} style={{ marginTop: 14 }} />
            </div>

            <div style={{ padding: 20 }}>
              <Text strong style={{ color: '#1B3A5C', fontSize: 13, display: 'block', marginBottom: 10 }}>
                Lệnh SX đang chiếm tải tại {detailResource.workshopId}
              </Text>
              {detailOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa' }}>Không có lệnh đang chạy</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detailOrders.map(o => {
                    const cfg = orderStatusConfig[o.status];
                    const pct = Math.round(o.completedQty / o.quantity * 100);
                    return (
                      <div key={o.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text strong style={{ fontSize: 12, fontFamily: 'monospace', color: '#1B3A5C' }}>{o.code}</Text>
                          <Space size={4}>
                            <Tag color={cfg.color} style={{ fontSize: 10, margin: 0 }}>{cfg.label}</Tag>
                            {o.priority === 'critical' && <Tag color="red" style={{ fontSize: 10, margin: 0 }}>Khẩn</Tag>}
                          </Space>
                        </div>
                        <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>{o.productName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Progress percent={pct} size="small" strokeColor="#1B3A5C" style={{ flex: 1, margin: 0 }} showInfo={false} />
                          <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{o.completedQty}/{o.quantity} — {pct}%</Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Space>
                  <Button type="primary" icon={<SwapOutlined />} onClick={() => { setDetailResource(null); setSuggestModal(true); }}
                    style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}>
                    Gợi ý phân bổ lại
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => { setDetailResource(null); handleEdit(detailResource); }}
                    style={{ borderRadius: 8 }}>
                    Chỉnh sửa nguồn lực
                  </Button>
                </Space>
              </div>
            </div>
          </>
        )}
      </Drawer>

      {/* ── Auto-suggest Modal ──────────────────────────────────────────────── */}
      <Modal
        title={null} open={suggestModal} onCancel={() => setSuggestModal(false)}
        footer={<Button type="primary" onClick={() => setSuggestModal(false)} style={{ background: '#1B3A5C' }}>Đóng</Button>}
        width={620}
      >
        <div style={{ background: 'linear-gradient(135deg, #531dab, #722ed1)', borderRadius: '8px 8px 0 0', padding: '16px 20px', margin: '-20px -20px 20px' }}>
          <Space>
            <ThunderboltOutlined style={{ color: '#fff', fontSize: 20 }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Gợi ý phân bổ tự động</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Hệ thống phân tích và đề xuất {rebalanceSuggestions.length} phương án tối ưu</div>
            </div>
          </Space>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rebalanceSuggestions.map((s, idx) => (
            <div key={s.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Đề xuất {idx + 1}</Text>
                <Tag color={s.priority === 'Khẩn cấp' ? 'red' : s.priority === 'Cao' ? 'orange' : s.priority === 'Trung bình' ? 'gold' : 'default'}>
                  {s.priority}
                </Tag>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <Text type="secondary">Nguồn vấn đề: </Text>{s.from}
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <Text type="secondary">Hành động: </Text><Text style={{ color: '#531dab', fontWeight: 500 }}>{s.action}</Text>
              </div>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                <Text type="secondary">Kết quả dự kiến: </Text><Text style={{ color: '#52c41a', fontWeight: 500 }}>{s.effect}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Ảnh hưởng: {s.ordersAffected}</Text>
                <Button size="small" type="primary" onClick={() => { message.success('Đã ghi nhận phương án điều chỉnh'); setSuggestModal(false); }}
                  style={{ background: '#531dab', borderColor: '#531dab', borderRadius: 6, fontSize: 12 }}>
                  Áp dụng
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Drawer Add/Edit */}
      <Drawer title={null} placement="right" width={500} open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" style={{ background: '#1B3A5C' }} onClick={handleSave}>
              {editingResource ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {editingResource ? <EditOutlined style={{ color: '#fff', fontSize: 18 }} /> : <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{editingResource ? 'Chỉnh sửa nguồn lực' : 'Thêm nguồn lực mới'}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {editingResource ? `${editingResource.code} — ${editingResource.name}` : 'Khai báo thiết bị, máy móc hoặc nhân lực'}
              </div>
            </div>
          </Space>
        </div>
        <div style={{ padding: 20 }}>
          <Form form={form} layout="vertical" requiredMark="optional">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mã nguồn lực" name="code" rules={[{ required: true, message: 'Nhập mã' }]}>
                  <Input placeholder="VD: TB-CNC-003" disabled={!!editingResource} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
                  <Select options={Object.entries(resourceTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Tên thiết bị / nhân lực" name="name" rules={[{ required: true, message: 'Nhập tên' }]}>
              <Input placeholder="VD: Máy phay CNC Siemens SINUMERIK" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Trung tâm" name="workshopId" rules={[{ required: true }]}>
                  <Select options={workshopOptions} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Năng lực / ngày" name="capacityPerDay" rules={[{ required: true, message: 'Nhập năng lực' }]}>
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Đơn vị" name="unit" rules={[{ required: true }]}>
                  <Select options={[
                    { value: 'giờ', label: 'Giờ' },
                    { value: 'giờ công', label: 'Giờ công' },
                    { value: 'bo mạch/ngày', label: 'Bo mạch/ngày' },
                    { value: 'module/ngày', label: 'Module/ngày' },
                    { value: 'sản phẩm/ngày', label: 'Sản phẩm/ngày' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Sử dụng hiện tại (%)" name="currentUtilization">
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
                  <Select options={Object.entries(resourceStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Drawer>

      <style>{`
        .row-overloaded td { background: #fff2f0 !important; }
        .row-warning td { background: #fffbe6 !important; }
      `}</style>
    </div>
  );
};

export default CapacityManagementPage;
