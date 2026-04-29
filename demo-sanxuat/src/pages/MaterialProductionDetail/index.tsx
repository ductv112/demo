import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Empty, Table, Tabs,
  Progress, Modal, message, Drawer, Form, InputNumber, Input, Select,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined,
  LockOutlined, SendOutlined, CaretRightOutlined,
  ToolOutlined, TeamOutlined, ExperimentOutlined, RiseOutlined, LinkOutlined,
} from '@ant-design/icons';
import { productionOrders } from '../../data/productionOrders';
import { processRoutings, processSteps } from '../../data/processRoutings';
import { bomItems } from '../../data/productStructures';
import type { ProcessStep, BOMItem, MaterialProductionOrder } from '../../types';
import { orderStatusConfig, priorityConfig, formatDate, formatNumber } from '../../utils/format';

const { Title, Text } = Typography;

// --- Mock inventory helper ---
function getStockLevel(materialCode: string): number {
  const stockMap: Record<string, number> = {
    'MG-001': 8, 'MC-001': 12, 'TN-001': 15, 'BM-KD': 20, 'BL-001': 18,
    'ADC-001': 10, 'RF-001': 50, 'CB-001': 30, 'VH-001': 5,
    'KA-001': 3, 'PT-ANT': 48, 'CC-QUY': 5, 'VB-ANT': 12, 'CB-RF': 8,
    'BN-ANT': 100, 'MO-BT': 5,
    'PCB-W': 25, 'IC-XL': 15, 'TD-002': 200, 'DT-002': 500,
    'BA-AC': 6, 'MOS-01': 20, 'TD-CS': 30, 'IC-PWM': 10, 'CC-BV': 50,
    'IC-DK': 4, 'BM-GT': 8, 'RL-XG': 16, 'CB-DK': 20, 'DN-MIL': 12,
    'TD-DK': 40, 'VH-DK': 3,
    'MG-P37': 4, 'BT-P37': 6, 'BM-P37': 10, 'RF-P37': 40, 'OG-P37': 8,
    'CB-P37': 20, 'VH-P37': 3, 'TD-P37': 200, 'DT-P37': 300,
  };
  return stockMap[materialCode] ?? Math.floor(Math.random() * 20) + 5;
}

// --- Mock data (5 records, same as MaterialProduction page) ---
const materialOrders: MaterialProductionOrder[] = [
  {
    id: 'MPO-001', code: 'LSXVT-2026-001',
    materialCode: 'BM-XL', materialName: 'Bo mạch xử lý trung tần',
    specification: 'FPGA Xilinx, PCB 6 lớp',
    requestedQty: 20, completedQty: 20,
    sourceOrderCode: 'LSX-2026-0058',
    workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)',
    status: 'completed', priority: 'high',
    startDate: '2026-03-01', endDate: '2026-03-20', createdAt: '2026-02-25',
  },
  {
    id: 'MPO-002', code: 'LSXVT-2026-002',
    materialCode: 'VH-001', materialName: 'Vỏ hộp kim loại',
    specification: 'Nhôm 6061, 400x300x150mm',
    requestedQty: 10, completedQty: 10,
    sourceOrderCode: 'LSX-2026-0058',
    workshopId: 'PX3', workshopName: 'Trung tâm Hạ tầng (PX3)',
    status: 'completed', priority: 'normal',
    startDate: '2026-03-01', endDate: '2026-03-15', createdAt: '2026-02-25',
  },
  {
    id: 'MPO-003', code: 'LSXVT-2026-003',
    materialCode: 'RF-P37', materialName: 'Đầu nối RF cao tần Beta-37',
    specification: 'Type-N, 50 Ohm, niken mạ vàng',
    requestedQty: 60, completedQty: 36,
    sourceOrderCode: 'LSX-2026-0062',
    workshopId: 'PX3', workshopName: 'Trung tâm Hạ tầng (PX3)',
    status: 'in_progress', priority: 'high',
    startDate: '2026-04-01', endDate: '2026-04-20', createdAt: '2026-03-28',
  },
  {
    id: 'MPO-004', code: 'LSXVT-2026-004',
    materialCode: 'TD-CS', materialName: 'Tụ điện công suất 470uF/400V',
    specification: 'Rubycon YXF series, điện phân',
    requestedQty: 30, completedQty: 0,
    sourceOrderCode: 'LSX-2026-0064',
    workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)',
    status: 'ready', priority: 'normal',
    startDate: '2026-04-15', endDate: '2026-04-30', createdAt: '2026-04-05',
  },
  {
    id: 'MPO-005', code: 'LSXVT-2026-005',
    materialCode: 'CB-RF', materialName: 'Cáp RF đồng trục cho gateway',
    specification: 'RG-213, 50 Ohm, 5m, 2 đầu N-Type',
    requestedQty: 12, completedQty: 0,
    sourceOrderCode: 'LSX-2026-0061',
    workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)',
    status: 'pending_material', priority: 'critical',
    startDate: '2026-04-20', endDate: '2026-05-10', createdAt: '2026-04-05',
  },
];

// --- Mock production logs for material orders ---
interface MaterialProductionLog {
  id: string;
  orderId: string;
  timestamp: string;
  action: string;
  addedQty: number;
  defectQty: number;
  laborHours: number;
  materialsUsed: string;
  qualityResult?: string;
  note: string;
  createdBy: string;
}

const materialProductionLogs: MaterialProductionLog[] = [
  {
    id: 'MLOG-001', orderId: 'MPO-001', timestamp: '2026-03-05T09:00:00',
    action: 'update', addedQty: 8, defectQty: 0, laborHours: 16,
    materialsUsed: 'FPGA Xilinx x8, PCB 6 lớp x8',
    qualityResult: 'Đạt: 8/8 bo mạch kiểm tra AOI pass',
    note: 'Lô đầu tiên hoàn thành hàn SMT và kiểm tra.',
    createdBy: 'Lê Minh Quân',
  },
  {
    id: 'MLOG-002', orderId: 'MPO-001', timestamp: '2026-03-12T15:30:00',
    action: 'update', addedQty: 12, defectQty: 0, laborHours: 24,
    materialsUsed: 'FPGA Xilinx x12, PCB 6 lớp x12',
    qualityResult: 'Đạt: 20/20 bo mạch tổng cộng pass burn-in 48h',
    note: 'Hoàn thành toàn bộ 20 bo mạch. Chuyển nghiệm thu.',
    createdBy: 'Lê Minh Quân',
  },
  {
    id: 'MLOG-003', orderId: 'MPO-001', timestamp: '2026-03-18T10:00:00',
    action: 'complete', addedQty: 0, defectQty: 0, laborHours: 4,
    materialsUsed: '',
    qualityResult: 'Đạt: 20/20 bo mạch nghiệm thu QA',
    note: 'Hoàn thành nghiệm thu. Đóng lệnh sản xuất vật tư.',
    createdBy: 'Trần Văn Đức',
  },
  {
    id: 'MLOG-004', orderId: 'MPO-003', timestamp: '2026-04-03T08:30:00',
    action: 'update', addedQty: 20, defectQty: 0, laborHours: 12,
    materialsUsed: 'Phôi niken x20, Vàng mạ 0.5g',
    qualityResult: 'Đạt: 20/20 đầu nối kiểm tra trở kháng 50 Ohm',
    note: 'Lô 1: gia công CNC + mạ niken + mạ vàng hoàn thành.',
    createdBy: 'Trương Quốc Việt',
  },
  {
    id: 'MLOG-005', orderId: 'MPO-003', timestamp: '2026-04-07T14:00:00',
    action: 'update', addedQty: 16, defectQty: 0, laborHours: 10,
    materialsUsed: 'Phôi niken x16, Vàng mạ 0.4g',
    qualityResult: 'Đạt: 16/16 đầu nối kiểm tra VSWR < 1.2',
    note: 'Lô 2: 16 đầu nối hoàn thành. Tổng cộng 36/60.',
    createdBy: 'Trương Quốc Việt',
  },
];

const MaterialProductionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const order = useMemo(() => materialOrders.find((o) => o.id === id), [id]);

  // Find source production order
  const sourceOrder = useMemo(
    () => order ? productionOrders.find((o) => o.code === order.sourceOrderCode) : undefined,
    [order],
  );

  // Find routing via sourceOrder.productId
  const routing = useMemo(
    () => sourceOrder ? processRoutings.find((r) => r.productId === sourceOrder.productId) : undefined,
    [sourceOrder],
  );

  const steps = useMemo(
    () => routing ? processSteps.filter((s) => s.routingId === routing.id).sort((a, b) => a.stepNo - b.stepNo) : [],
    [routing],
  );

  // BOM items of source order's product = input materials needed
  const orderBomItems = useMemo(
    () => sourceOrder ? bomItems.filter((b) => b.bomId === sourceOrder.productId) : [],
    [sourceOrder],
  );

  // Logs for this material order
  const logs = useMemo(
    () => order ? materialProductionLogs.filter((l) => l.orderId === order.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [],
    [order],
  );

  // Compute current step index based on progress
  const currentStepIndex = useMemo(() => {
    if (!order || !steps.length) return 0;
    if (order.status === 'completed' || order.status === 'closed') return steps.length;
    if (order.status === 'draft' || order.status === 'ready' || order.status === 'pending_material') return 0;
    const progress = order.completedQty / order.requestedQty;
    return Math.min(Math.floor(progress * steps.length) + 1, steps.length - 1);
  }, [order, steps]);

  if (!order) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/material-production')}>Quay lại</Button>
        <Empty description="Không tìm thấy lệnh sản xuất vật tư" style={{ marginTop: 64 }} />
      </div>
    );
  }

  const progressPercent = order.requestedQty > 0 ? Math.round((order.completedQty / order.requestedQty) * 100) : 0;
  const remaining = order.requestedQty - order.completedQty;
  const statusCfg = orderStatusConfig[order.status];
  const prioCfg = priorityConfig[order.priority];

  const getStepStatus = (stepIdx: number): { label: string; color: string } => {
    if (order.status === 'completed' || order.status === 'closed') return { label: 'Hoàn thành', color: '#52c41a' };
    if (order.status === 'draft' || order.status === 'ready' || order.status === 'pending_material') return { label: 'Chưa thực hiện', color: '#d9d9d9' };
    if (stepIdx < currentStepIndex) return { label: 'Hoàn thành', color: '#52c41a' };
    if (stepIdx === currentStepIndex) {
      return order.status === 'paused'
        ? { label: 'Tạm dừng', color: '#faad14' }
        : { label: 'Đang thực hiện', color: '#1890ff' };
    }
    return { label: 'Chưa thực hiện', color: '#d9d9d9' };
  };

  const handleWorkflow = (action: string) => {
    const labels: Record<string, string> = {
      release: 'Phát hành lệnh sản xuất',
      start: 'Bắt đầu sản xuất',
      close: 'Đóng lệnh sản xuất',
      warehouse: 'Chuyển nhập kho',
    };
    Modal.confirm({
      title: labels[action] || action,
      content: `Bạn có chắc chắn muốn ${(labels[action] || action).toLowerCase()}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => message.success(`Đã ${(labels[action] || action).toLowerCase()} thành công!`),
    });
  };

  const handleDrawerSubmit = () => {
    form.validateFields().then(() => {
      message.success('Đã cập nhật tiến độ sản xuất thành công!');
      setDrawerOpen(false);
      form.resetFields();
    });
  };

  // --- Action color/label for logs ---
  const actionColorMap: Record<string, string> = {
    update: '#1890ff', pause: '#faad14', resume: '#1890ff', complete: '#52c41a',
  };
  const actionLabelMap: Record<string, string> = {
    update: 'Cập nhật', pause: 'Tạm dừng', resume: 'Tiếp tục', complete: 'Hoàn thành',
  };

  // --- Step table columns ---
  const stepColumns = [
    {
      title: 'Bước', dataIndex: 'stepNo', width: '4%',
      render: (no: number, _: ProcessStep, idx: number) => {
        const st = getStepStatus(idx);
        return (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
            background: st.color, color: '#fff',
          }}>
            {no}
          </div>
        );
      },
    },
    {
      title: 'Công đoạn', dataIndex: 'name', width: '22%',
      render: (name: string, rec: ProcessStep) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{rec.description}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái', width: '10%',
      render: (_: unknown, __: ProcessStep, idx: number) => {
        const st = getStepStatus(idx);
        return <Tag color={st.color} style={{ borderRadius: 4 }}>{st.label}</Tag>;
      },
    },
    {
      title: 'Trung tâm', dataIndex: 'workshopName', width: '10%',
      render: (ws: string) => <Tag icon={<ToolOutlined />}>{ws}</Tag>,
    },
    {
      title: 'Thiết bị yêu cầu', dataIndex: 'equipmentRequired', width: '18%',
      render: (eq: string[]) => eq.map((e) => <Tag key={e} style={{ marginBottom: 2 }}>{e}</Tag>),
    },
    {
      title: 'Kỹ năng', dataIndex: 'skillRequired', width: '12%',
      render: (skills: string[]) => skills.map((s) => <Tag key={s} color="blue">{s}</Tag>),
    },
    {
      title: 'Giờ', dataIndex: 'estimatedHours', width: '5%', align: 'center' as const,
      render: (h: number) => <Text strong>{h}h</Text>,
    },
    {
      title: 'Nhân lực', dataIndex: 'requiredWorkers', width: '4%', align: 'center' as const,
      render: (w: number) => <Tag icon={<TeamOutlined />}>{w}</Tag>,
    },
    {
      title: 'Tiêu chuẩn chất lượng', dataIndex: 'qualityStandard', width: '15%',
      render: (qs: string | undefined) => qs ? <Text style={{ fontSize: 12 }}>{qs}</Text> : <Text type="secondary">-</Text>,
    },
  ];

  // --- Input materials table columns with mock inventory ---
  const inputMaterialColumns = [
    { title: 'Mã NL', dataIndex: 'materialCode', width: 100 },
    { title: 'Tên nguyên liệu', dataIndex: 'materialName', width: 200 },
    { title: 'Quy cách', dataIndex: 'specification', width: 180 },
    { title: 'Đơn vị tính', dataIndex: 'unit', width: 80, align: 'center' as const },
    {
      title: 'Định mức', dataIndex: 'quantity', width: 80, align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Tồn kho', width: 80, align: 'right' as const,
      render: (_: unknown, rec: BOMItem) => {
        const stock = getStockLevel(rec.materialCode);
        return <Text style={{ fontWeight: 600 }}>{formatNumber(stock)}</Text>;
      },
    },
    {
      title: 'Trạng thái', width: 100, align: 'center' as const,
      render: (_: unknown, rec: BOMItem) => {
        const stock = getStockLevel(rec.materialCode);
        const enough = stock >= rec.quantity;
        return <Tag color={enough ? '#52c41a' : '#ff4d4f'}>{enough ? 'Đủ' : 'Thiếu'}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* ========== 1. HEADER CARD ========== */}
      <Card style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        {/* Navy gradient banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#fff' }}
              onClick={() => navigate('/material-production')} />
            <ExperimentOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{order.materialName}</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontFamily: 'monospace' }}>
                  {order.code}
                </Tag>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  {order.materialCode}
                </Tag>
                <Tag color={prioCfg.color}>{prioCfg.label}</Tag>
              </Space>
            </div>
          </Space>
          <Space>
            <Tag color={statusCfg.color} style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
            {order.status === 'draft' && (
              <Button type="primary" icon={<SendOutlined />} onClick={() => handleWorkflow('release')}>
                Phát hành
              </Button>
            )}
            {order.status === 'ready' && (
              <Button type="primary" icon={<CaretRightOutlined />} onClick={() => handleWorkflow('start')}>
                Bắt đầu SX
              </Button>
            )}
            {order.status === 'completed' && (
              <>
                <Button type="primary" icon={<LockOutlined />} onClick={() => handleWorkflow('close')}>
                  Đóng lệnh
                </Button>
                <Button icon={<CheckCircleOutlined />} onClick={() => navigate('/completion')}
                  style={{ background: 'rgba(82,196,26,0.15)', border: 'none', color: '#52c41a', fontWeight: 500 }}>
                  Chuyển nhập kho
                </Button>
                {order.sourceOrderCode && (
                  <Button icon={<LinkOutlined />}
                    onClick={() => {
                      Modal.success({
                        title: 'Vật tư đã sẵn sàng',
                        content: (
                          <div>
                            <p><strong>{order.materialName}</strong> đã hoàn thành sản xuất ({order.completedQty}/{order.requestedQty}).</p>
                            <p>Vật tư sẽ được nhập kho và sẵn sàng cấp phát cho lệnh sản xuất gốc <strong>{order.sourceOrderCode}</strong>.</p>
                            <p>Lệnh SX gốc có thể chuyển từ trạng thái "Chờ vật tư" → "Sẵn sàng" sản xuất.</p>
                          </div>
                        ),
                        okText: 'Xem lệnh SX gốc',
                        onOk: () => {
                          const sourceOrder = productionOrders.find(o => o.code === order.sourceOrderCode);
                          if (sourceOrder) navigate(`/production-orders/${sourceOrder.id}`);
                          else navigate('/production-orders');
                        },
                      });
                    }}
                    style={{ borderColor: '#1B3A5C', color: '#1B3A5C', fontWeight: 500 }}>
                    Thông báo lệnh SX gốc ({order.sourceOrderCode})
                  </Button>
                )}
              </>
            )}
          </Space>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 24px' }}>
          <Row gutter={[24, 12]}>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Mã vật tư</Text>
              <br />
              <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{order.materialCode}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Quy cách kỹ thuật</Text>
              <br />
              <Text strong>{order.specification}</Text>
            </Col>
            <Col span={5}>
              <Text type="secondary" style={{ fontSize: 12 }}>Trung tâm</Text>
              <br />
              <Tag icon={<ToolOutlined />} color="blue">{order.workshopName}</Tag>
            </Col>
            <Col span={5}>
              <Text type="secondary" style={{ fontSize: 12 }}>Nguồn yêu cầu</Text>
              <br />
              {order.sourceOrderCode ? (
                <Button type="link" size="small" style={{ padding: 0, fontFamily: 'monospace', fontSize: 13, color: '#1B3A5C' }}
                  onClick={() => {
                    if (sourceOrder) navigate(`/production-orders/${sourceOrder.id}`);
                  }}>
                  {order.sourceOrderCode}
                </Button>
              ) : <Text type="secondary">--</Text>}
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Số lượng</Text>
              <br />
              <Text strong style={{ color: '#1B3A5C', fontSize: 16 }}>
                {order.completedQty}/{order.requestedQty}
              </Text>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Thời gian</Text>
              <br />
              <Text>{formatDate(order.startDate)} - {formatDate(order.endDate)}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Ưu tiên</Text>
              <br />
              <Tag color={prioCfg.color}>{prioCfg.label}</Tag>
            </Col>
          </Row>
        </div>

        {/* Update progress button */}
        {(order.status === 'in_progress' || order.status === 'paused') && (
          <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" size="large" icon={<RiseOutlined />}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', fontWeight: 600 }}
              onClick={() => setDrawerOpen(true)}>
              Cập nhật tiến độ sản xuất
            </Button>
          </div>
        )}
      </Card>

      {/* ========== 2. PROGRESS CARD ========== */}
      <Card style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Text strong style={{ color: '#1B3A5C', marginBottom: 8, display: 'block' }}>Tiến độ tổng thể</Text>
            <Progress
              percent={progressPercent}
              strokeColor={{ from: '#1B3A5C', to: '#2d5a8e' }}
              strokeWidth={14}
              style={{ marginBottom: 0 }}
            />
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Số lượng yêu cầu</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#1B3A5C' }}>{order.requestedQty}</Text>
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Hoàn thành</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#52c41a' }}>{order.completedQty}</Text>
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Lỗi</Text>
            <br />
            <Text strong style={{ fontSize: 20 }}>0</Text>
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Còn lại</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#faad14' }}>{remaining}</Text>
          </Col>
        </Row>
      </Card>

      {/* ========== 3. TABS CARD ========== */}
      <Card style={{ borderRadius: 14, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Tabs
          className="order-detail-tabs"
          defaultActiveKey="routing"
          items={[
            // --- Tab 1: Quy trinh san xuat ---
            {
              key: 'routing',
              label: <span><ClockCircleOutlined style={{ marginRight: 6 }} />Quy trình sản xuất</span>,
              children: (
                <div>
                  {routing ? (
                    <>
                      <Space style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: '#1B3A5C' }}>{routing.code}</Text>
                        <Tag color="#1B3A5C">{routing.version}</Tag>
                        <Tag color="green">{routing.totalSteps} bước</Tag>
                        <Tag color="blue">{routing.estimatedDays} ngày</Tag>
                      </Space>
                      <Table
                        dataSource={steps}
                        columns={stepColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        tableLayout="fixed"
                        rowClassName={(_, idx) => {
                          if (['in_progress', 'paused'].includes(order.status) && idx === currentStepIndex) {
                            return 'current-step-row';
                          }
                          return '';
                        }}
                      />
                      <style>{`
                        .current-step-row td {
                          background: rgba(24,144,255,0.06) !important;
                          border-left: 3px solid #1890ff;
                        }
                      `}</style>
                    </>
                  ) : (
                    <Empty description="Không tìm thấy quy trình sản xuất cho lệnh nguồn" />
                  )}
                </div>
              ),
            },
            // --- Tab 2: Nguyen lieu dau vao ---
            {
              key: 'materials',
              label: <span><ExperimentOutlined style={{ marginRight: 6 }} />Nguyên liệu đầu vào</span>,
              children: orderBomItems.length > 0 ? (
                <Table
                  dataSource={orderBomItems}
                  columns={inputMaterialColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty description="Không có dữ liệu nguyên liệu đầu vào" />
              ),
            },
            // --- Tab 3: Nhat ky san xuat ---
            {
              key: 'logs',
              label: <span><RiseOutlined style={{ marginRight: 6 }} />Nhật ký sản xuất</span>,
              children: logs.length === 0 ? (
                <Empty description="Chưa có nhật ký sản xuất" />
              ) : (
                <Table
                  dataSource={logs}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Thời gian', dataIndex: 'timestamp', width: 140,
                      render: (v: string) => <Text style={{ fontSize: 12 }}>{new Date(v).toLocaleString('vi-VN')}</Text>,
                    },
                    {
                      title: 'Hành động', dataIndex: 'action', width: 100,
                      render: (v: string) => <Tag color={actionColorMap[v]}>{actionLabelMap[v]}</Tag>,
                    },
                    {
                      title: 'Số lượng', width: 80, align: 'center' as const,
                      render: (_: unknown, log: MaterialProductionLog) => (
                        <Space size={4} direction="vertical" style={{ lineHeight: 1.2 }}>
                          {log.addedQty > 0 && <Text style={{ color: '#52c41a', fontWeight: 600, fontSize: 12 }}>+{log.addedQty}</Text>}
                          {log.defectQty > 0 && <Text style={{ color: '#ff4d4f', fontSize: 11 }}>{log.defectQty} lỗi</Text>}
                          {log.addedQty === 0 && log.defectQty === 0 && <Text type="secondary">--</Text>}
                        </Space>
                      ),
                    },
                    {
                      title: 'Giờ công', dataIndex: 'laborHours', width: 70, align: 'center' as const,
                      render: (v: number) => v ? <Text style={{ fontSize: 12 }}>{v}h</Text> : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Nguyên liệu dùng', dataIndex: 'materialsUsed', width: 200,
                      render: (v: string) => v ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {v.split(', ').map((item, i) => <Tag key={i} style={{ fontSize: 10, margin: 0 }}>{item}</Tag>)}
                        </div>
                      ) : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Kiểm tra chất lượng', dataIndex: 'qualityResult', width: 200, ellipsis: true,
                      render: (v?: string) => v ? (
                        <Text style={{
                          fontSize: 11,
                          color: v.startsWith('Đạt') ? '#52c41a' : '#ff4d4f',
                        }}>
                          <CheckCircleOutlined style={{ marginRight: 3 }} />{v}
                        </Text>
                      ) : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Ghi chú', dataIndex: 'note', ellipsis: true,
                      render: (v?: string) => v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Người thực hiện', dataIndex: 'createdBy', width: 120,
                      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* ========== 4. DRAWER ========== */}
      <Drawer
        title={null}
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" style={{ background: '#1B3A5C' }} onClick={handleDrawerSubmit}>
              Cập nhật
            </Button>
          </div>
        }
      >
        {/* Drawer navy header */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px', color: '#fff',
        }}>
          <Space align="center" size={12}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RiseOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Cập nhật tiến độ sản xuất</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{order.code} — {order.materialName}</div>
            </div>
          </Space>
        </div>

        <div style={{ padding: 20 }}>
          <Form form={form} layout="vertical" requiredMark="optional">
            {/* 1. Tiến độ hiện tại */}
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 20, border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Tiến độ hiện tại</Text>
                <Text strong style={{ color: '#1B3A5C' }}>{order.completedQty}/{order.requestedQty} ({progressPercent}%)</Text>
              </div>
              <Progress percent={progressPercent} strokeColor="#1B3A5C" size="small" showInfo={false} />
            </div>

            {/* 2. Sản lượng + lỗi + giờ công */}
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item label="Số lượng hoàn thành thêm" name="addedQty" initialValue={0}>
                  <InputNumber min={0} max={remaining} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Số lượng lỗi" name="defectQty" initialValue={0}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Giờ công thực tế" name="laborHours" rules={[{ required: true, message: 'Nhập giờ' }]}>
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="0" />
                </Form.Item>
              </Col>
            </Row>

            {/* 3. Nguyên liệu đầu vào đã sử dụng */}
            <Text strong style={{ color: '#1B3A5C', display: 'block', marginBottom: 8, fontSize: 13 }}>
              Nguyên liệu đầu vào đã sử dụng
              {orderBomItems.length > 0 && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>({orderBomItems.length} nguyên liệu)</Text>}
            </Text>
            {orderBomItems.length > 0 ? (
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f7fa' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', color: '#1B3A5C', fontWeight: 600 }}>Nguyên liệu</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: 50, color: '#1B3A5C' }}>ĐVT</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: 60, color: '#1B3A5C' }}>Đ.mức</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: 80, color: '#1B3A5C' }}>Số lượng dùng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBomItems.map((m) => (
                      <tr key={m.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '5px 10px' }}>{m.materialName}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'center' }}>{m.unit}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', color: '#8c8c8c' }}>{m.quantity}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'center' }}>
                          <Form.Item name={['materials', m.id]} initialValue={0} style={{ margin: 0 }}>
                            <InputNumber min={0} size="small" style={{ width: 65 }} />
                          </Form.Item>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '10px 0', marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                  Không có dữ liệu nguyên liệu đầu vào
                </Text>
              </div>
            )}

            {/* 4. Kết quả kiểm tra chất lượng */}
            <Form.Item label="Kết quả kiểm tra chất lượng" name="qualityResult">
              <Input.TextArea rows={2} placeholder="VD: Đạt kiểm tra trở kháng 50 Ohm, VSWR < 1.2" />
            </Form.Item>

            {/* 5. Hành động */}
            <Form.Item label="Sau khi cập nhật" name="action" initialValue="update">
              <Select options={[
                { value: 'update', label: 'Tiếp tục sản xuất' },
                { value: 'pause', label: 'Tạm dừng lệnh sản xuất' },
                { value: 'complete', label: 'Hoàn thành lệnh sản xuất' },
              ]} />
            </Form.Item>

            {/* 6. Ghi chú */}
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={2} placeholder="Vấn đề phát sinh, lý do chậm trễ..." />
            </Form.Item>
          </Form>
        </div>
      </Drawer>

      <style>{`
        .order-detail-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
          padding: 0 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e8e8e8;
        }
        .order-detail-tabs .ant-tabs-tab {
          padding: 12px 20px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #8c8c8c !important;
          border: none !important;
          background: transparent !important;
          transition: all 0.2s;
        }
        .order-detail-tabs .ant-tabs-tab:hover {
          color: #1B3A5C !important;
        }
        .order-detail-tabs .ant-tabs-tab-active {
          background: #fff !important;
          color: #1B3A5C !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #1B3A5C !important;
        }
        .order-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1B3A5C !important;
        }
        .order-detail-tabs .ant-tabs-ink-bar {
          background: #1B3A5C !important;
          height: 2px !important;
        }
        .order-detail-tabs .ant-tabs-content-holder {
          padding: 16px 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default MaterialProductionDetail;
