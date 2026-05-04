import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Empty, Table, Tabs,
  Progress, Modal, message, Drawer, Form, InputNumber, Input, Select,
} from 'antd';
import {
  ArrowLeftOutlined, PlayCircleOutlined, EditOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  PauseCircleOutlined, CaretRightOutlined, LockOutlined,
  SendOutlined, ToolOutlined, TeamOutlined, ExperimentOutlined,
  RiseOutlined, SwapOutlined, NodeIndexOutlined,
} from '@ant-design/icons';
import { productionOrders } from '../../data/productionOrders';
import { processRoutings, processSteps } from '../../data/processRoutings';
import { bomItems } from '../../data/productStructures';
import { productionLogs } from '../../data/productionLogs';
import type { ProcessStep, MaterialConsumption, BOMItem, ProductionLog } from '../../types';
import {
  orderStatusConfig, orderTypeConfig, priorityConfig,
  formatDate, formatNumber,
} from '../../utils/format';

const { Title, Text } = Typography;

const ProductionOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedStep, setSelectedStep] = useState<number | undefined>(undefined);

  const order = useMemo(() => productionOrders.find((o) => o.id === id), [id]);

  const routing = useMemo(
    () => order ? processRoutings.find((r) => r.productId === order.productId) : undefined,
    [order],
  );

  const steps = useMemo(
    () => routing ? processSteps.filter((s) => s.routingId === routing.id).sort((a, b) => a.stepNo - b.stepNo) : [],
    [routing],
  );

  const orderBomItems = useMemo(
    () => order ? bomItems.filter((b) => b.bomId === order.productId) : [],
    [order],
  );

  const logs = useMemo(
    () => order ? productionLogs.filter((l) => l.orderId === order.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [],
    [order],
  );

  // Compute current step index based on completion progress
  const currentStepIndex = useMemo(() => {
    if (!order || !steps.length) return 0;
    if (order.status === 'completed' || order.status === 'closed') return steps.length;
    if (order.status === 'draft' || order.status === 'ready' || order.status === 'pending_material') return 0;
    const progress = order.completedQty / order.quantity;
    return Math.min(Math.floor(progress * steps.length) + 1, steps.length - 1);
  }, [order, steps]);

  // Unique workshops from steps
  const workshopTags = useMemo(() => {
    const unique = Array.from(new Set(steps.map((s) => s.workshopName)));
    return unique;
  }, [steps]);

  // Mock material consumption data
  const materialConsumptions: MaterialConsumption[] = useMemo(() => {
    if (!order) return [];
    return orderBomItems.map((item, idx) => {
      const planned = item.quantity * order.quantity;
      const actual = order.status === 'completed' || order.status === 'closed'
        ? planned + Math.floor((Math.random() - 0.3) * 2)
        : Math.floor(planned * (order.completedQty / order.quantity));
      return {
        id: `MC-${idx + 1}`,
        orderId: order.id,
        stepExecutionId: `SE-${idx}`,
        materialCode: item.materialCode,
        materialName: item.materialName,
        unit: item.unit,
        plannedQty: planned,
        actualQty: actual,
        variance: actual - planned,
        issuedDate: order.actualStartDate || order.startDate,
      };
    });
  }, [order, orderBomItems]);

  // Drawer step materials sync
  const drawerMaterials = useMemo(() => {
    if (selectedStep === undefined) return orderBomItems;
    return orderBomItems.filter((b) => b.usedInStep?.includes(selectedStep));
  }, [selectedStep, orderBomItems]);

  useEffect(() => {
    if (drawerOpen && steps.length > 0) {
      const idx = Math.min(currentStepIndex, steps.length - 1);
      setSelectedStep(steps[idx]?.stepNo);
    }
  }, [drawerOpen, steps, currentStepIndex]);

  if (!order) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/production-orders')}>Quay lại</Button>
        <Empty description="Không tìm thấy lệnh sản xuất" style={{ marginTop: 64 }} />
      </div>
    );
  }

  const progressPercent = order.quantity > 0 ? Math.round((order.completedQty / order.quantity) * 100) : 0;
  const remaining = order.quantity - order.completedQty - order.defectQty;
  const statusCfg = orderStatusConfig[order.status];
  const typeCfg = orderTypeConfig[order.type];
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

  // --- Step table columns ---
  const stepColumns = [
    {
      title: 'Bước',
      dataIndex: 'stepNo',
      width: '4%',
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
      title: 'Công đoạn',
      dataIndex: 'name',
      width: '22%',
      render: (name: string, rec: ProcessStep) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{rec.description}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      width: '10%',
      render: (_: unknown, __: ProcessStep, idx: number) => {
        const st = getStepStatus(idx);
        return <Tag color={st.color} style={{ borderRadius: 4 }}>{st.label}</Tag>;
      },
    },
    {
      title: 'Trung tâm',
      dataIndex: 'workshopName',
      width: '10%',
      render: (ws: string) => <Tag icon={<ToolOutlined />}>{ws}</Tag>,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentRequired',
      width: '18%',
      render: (eq: string[]) => eq.map((e) => <Tag key={e} style={{ marginBottom: 2 }}>{e}</Tag>),
    },
    {
      title: 'Kỹ năng',
      dataIndex: 'skillRequired',
      width: '12%',
      render: (skills: string[]) => skills.map((s) => <Tag key={s} color="blue">{s}</Tag>),
    },
    {
      title: 'Giờ',
      dataIndex: 'estimatedHours',
      width: '5%',
      align: 'center' as const,
      render: (h: number) => <Text strong>{h}h</Text>,
    },
    {
      title: 'Nhân lực',
      dataIndex: 'requiredWorkers',
      width: '4%',
      align: 'center' as const,
      render: (w: number) => <Tag icon={<TeamOutlined />}>{w}</Tag>,
    },
    {
      title: 'Tiêu chuẩn chất lượng',
      dataIndex: 'qualityStandard',
      width: '15%',
      render: (qs: string | undefined) => qs ? <Text style={{ fontSize: 12 }}>{qs}</Text> : <Text type="secondary">-</Text>,
    },
  ];

  // --- Material consumption columns ---
  const materialColumns = [
    { title: 'Mã vật tư', dataIndex: 'materialCode', width: 120 },
    { title: 'Tên vật tư', dataIndex: 'materialName', width: 200 },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    {
      title: 'Số lượng kế hoạch', dataIndex: 'plannedQty', width: 110, align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Số lượng thực tế', dataIndex: 'actualQty', width: 110, align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Chênh lệch', dataIndex: 'variance', width: 110, align: 'right' as const,
      render: (v: number) => (
        <Text style={{ color: v > 0 ? '#ff4d4f' : v < 0 ? '#52c41a' : undefined, fontWeight: 600 }}>
          {v > 0 ? `+${v}` : v}
        </Text>
      ),
    },
    {
      title: 'Ngày cấp', dataIndex: 'issuedDate', width: 120,
      render: (d: string) => formatDate(d),
    },
  ];

  // --- Action color for logs ---
  const actionColorMap: Record<string, string> = {
    update: '#1890ff',
    pause: '#faad14',
    resume: '#1890ff',
    complete: '#52c41a',
  };
  const actionLabelMap: Record<string, string> = {
    update: 'Cập nhật',
    pause: 'Tạm dừng',
    resume: 'Tiếp tục',
    complete: 'Hoàn thành',
  };

  const showMaterialTab = ['in_progress', 'paused', 'completed', 'closed'].includes(order.status);

  return (
    <div style={{ padding: 16 }}>
      {/* ========== 1. HEADER CARD ========== */}
      <Card
        style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Navy gradient banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button
              type="text" icon={<ArrowLeftOutlined />}
              style={{ color: '#fff' }}
              onClick={() => navigate('/production-orders')}
            />
            <PlayCircleOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{order.code}</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  {order.productName}
                </Tag>
                <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
                <Tag color={prioCfg.color}>{prioCfg.label}</Tag>
              </Space>
            </div>
          </Space>
          <Space>
            <Tag
              color={statusCfg.color}
              style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}
            >
              {statusCfg.label}
            </Tag>
            {order.status === 'draft' && (
              <>
                <Button icon={<EditOutlined />} onClick={() => navigate(`/production-orders/${order.id}/edit`)}>
                  Chỉnh sửa
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={() => handleWorkflow('release')}>
                  Phát hành
                </Button>
              </>
            )}
            {order.status === 'ready' && (
              <Button type="primary" icon={<CaretRightOutlined />} onClick={() => handleWorkflow('start')}>
                Bắt đầu sản xuất
              </Button>
            )}
            {order.status === 'completed' && (
              <>
                <Button type="primary" icon={<LockOutlined />} onClick={() => handleWorkflow('close')}>
                  Đóng lệnh
                </Button>
                <Button icon={<CheckCircleOutlined />} onClick={() => navigate('/completion')}
                  style={{ background: 'rgba(82,196,26,0.15)', border: 'none', color: '#52c41a', fontWeight: 500 }}
                >
                  Chuyển nhập kho
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 24px' }}>
          <Row gutter={[24, 12]}>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Sản phẩm</Text>
              <br />
              <Text strong>{order.productName}</Text>
            </Col>
            <Col span={3}>
              <Text type="secondary" style={{ fontSize: 12 }}>BOM version</Text>
              <br />
              <Tag color="#1B3A5C">{order.bomVersion}</Tag>
            </Col>
            <Col span={3}>
              <Text type="secondary" style={{ fontSize: 12 }}>Routing version</Text>
              <br />
              <Tag color="#1B3A5C">{order.routingVersion}</Tag>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Trung tâm tham gia</Text>
              <br />
              <Space size={4} wrap>
                {workshopTags.length > 0 ? workshopTags.map((w) => (
                  <Tag key={w} icon={<ToolOutlined />} color="blue">{w}</Tag>
                )) : <Tag>{order.workshopName}</Tag>}
              </Space>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Phụ trách</Text>
              <br />
              <Text strong>{order.assignedTo || '-'}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Thời gian</Text>
              <br />
              <Text>{formatDate(order.startDate)} - {formatDate(order.endDate)}</Text>
            </Col>
            <Col span={3}>
              <Text type="secondary" style={{ fontSize: 12 }}>Số lượng hoàn thành / tổng</Text>
              <br />
              <Text strong style={{ color: '#1B3A5C', fontSize: 16 }}>
                {order.completedQty}/{order.quantity}
              </Text>
            </Col>
            <Col span={3}>
              <Text type="secondary" style={{ fontSize: 12 }}>Bắt đầu thực tế</Text>
              <br />
              <Text>{order.actualStartDate ? formatDate(order.actualStartDate) : '-'}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Kết thúc thực tế</Text>
              <br />
              <Text>{order.actualEndDate ? formatDate(order.actualEndDate) : '-'}</Text>
            </Col>
          </Row>
        </div>

        {/* Note bar */}
        {order.note && (
          <div style={{
            margin: '0 24px 16px', padding: '10px 16px', borderRadius: 8,
            borderLeft: '4px solid #D4A843', background: 'rgba(212,168,67,0.06)',
          }}>
            <Text style={{ fontSize: 13 }}>
              <ExclamationCircleOutlined style={{ color: '#D4A843', marginRight: 8 }} />
              {order.note}
            </Text>
          </div>
        )}

        {/* Action buttons */}
        {(order.status === 'in_progress' || order.status === 'paused' || order.status === 'pending_material') && (
          <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              icon={<NodeIndexOutlined />}
              onClick={() => navigate('/wip-tracking')}
              style={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 500 }}
            >
              Theo dõi bán thành phẩm
            </Button>
            <Button
              icon={<ExperimentOutlined />}
              onClick={() => navigate('/material-production/new')}
              style={{ borderColor: '#0891b2', color: '#0891b2', fontWeight: 500 }}
            >
              Tạo lệnh SX vật tư
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => navigate('/engineering-changes/new')}
              style={{ borderColor: '#eb2f96', color: '#eb2f96', fontWeight: 500 }}
            >
              Yêu cầu thay đổi kỹ thuật
            </Button>
            {(order.status === 'in_progress' || order.status === 'paused') && (
              <Button
                type="primary" size="large"
                icon={<RiseOutlined />}
                style={{ background: '#1B3A5C', borderColor: '#1B3A5C', fontWeight: 600 }}
                onClick={() => setDrawerOpen(true)}
              >
                Cập nhật tiến độ sản xuất
              </Button>
            )}
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
            <Text strong style={{ fontSize: 20, color: '#1B3A5C' }}>{order.quantity}</Text>
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Hoàn thành</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#52c41a' }}>{order.completedQty}</Text>
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Lỗi</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: order.defectQty > 0 ? '#ff4d4f' : undefined }}>
              {order.defectQty}
            </Text>
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Còn lại</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#faad14' }}>{remaining}</Text>
          </Col>
        </Row>
      </Card>

      {/* ========== Tiến độ vs Kế hoạch ========== */}
      {(order.status === 'in_progress' || order.status === 'paused') && (() => {
        const today = new Date();
        const start = new Date(order.startDate);
        const end = new Date(order.endDate);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const expectedPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
        const actualPercent = order.quantity > 0 ? Math.round((order.completedQty / order.quantity) * 100) : 0;
        const diff = actualPercent - expectedPercent;
        const remainDays = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        return (
          <Card size="small" style={{ borderRadius: 14, marginBottom: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '12px 20px' } }}
          >
            <Row gutter={24} align="middle">
              <Col flex="auto">
                <Space size={16}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ kỳ vọng</Text>
                    <div style={{ fontWeight: 600, color: '#8c8c8c', fontSize: 14 }}>{expectedPercent}%</div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ thực tế</Text>
                    <div style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 14 }}>{actualPercent}%</div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Chênh lệch</Text>
                    <div style={{
                      fontWeight: 700, fontSize: 14,
                      color: diff >= 0 ? '#52c41a' : '#ff4d4f',
                    }}>
                      {diff >= 0 ? `+${diff}%` : `${diff}%`}
                      <Text style={{ fontSize: 11, color: diff >= 0 ? '#52c41a' : '#ff4d4f', marginLeft: 4 }}>
                        {diff >= 0 ? '(đúng/sớm tiến độ)' : '(chậm tiến độ)'}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Col>
              <Col>
                <Tag color={remainDays <= 3 ? '#ff4d4f' : remainDays <= 7 ? '#faad14' : '#1B3A5C'}
                  style={{ fontSize: 12, padding: '4px 12px' }}
                >
                  Còn {remainDays} ngày
                </Tag>
              </Col>
            </Row>
          </Card>
        );
      })()}

      {/* ========== 3. TABS CARD ========== */}
      <Card style={{ borderRadius: 14, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Tabs
          className="order-detail-tabs"
          defaultActiveKey="routing"
          items={[
            // --- Tab 1: Quy trinh cong nghe ---
            {
              key: 'routing',
              label: <span><ClockCircleOutlined style={{ marginRight: 6 }} />Quy trình công nghệ</span>,
              children: (
                <div>
                  {routing && (
                    <Space style={{ marginBottom: 12 }}>
                      <Text strong style={{ color: '#1B3A5C' }}>{routing.code}</Text>
                      <Tag color="#1B3A5C">{routing.version}</Tag>
                      <Tag color="green">{routing.totalSteps} bước</Tag>
                      <Tag color="blue">{routing.estimatedDays} ngày</Tag>
                    </Space>
                  )}
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
                </div>
              ),
            },
            // --- Tab 2: Vat tu tieu hao ---
            ...(showMaterialTab ? [{
              key: 'materials',
              label: <span><ExperimentOutlined style={{ marginRight: 6 }} />Vật tư tiêu hao</span>,
              children: (
                <Table
                  dataSource={materialConsumptions}
                  columns={materialColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ),
            }] : []),
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
                      title: 'Thời gian', dataIndex: 'timestamp', width: 130,
                      render: (v: string) => (
                        <Text style={{ fontSize: 12 }}>{new Date(v).toLocaleString('vi-VN')}</Text>
                      ),
                    },
                    {
                      title: 'Hành động', dataIndex: 'action', width: 100,
                      render: (v: string) => <Tag color={actionColorMap[v]}>{actionLabelMap[v]}</Tag>,
                    },
                    {
                      title: 'Công đoạn', dataIndex: 'currentStep', width: 160,
                      render: (v?: string) => v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Sản lượng', width: 70, align: 'center',
                      render: (_: unknown, log: ProductionLog) => (
                        <Space size={4} direction="vertical" style={{ lineHeight: 1.2 }}>
                          {log.addedQty > 0 && <Text style={{ color: '#52c41a', fontWeight: 600, fontSize: 12 }}>+{log.addedQty}</Text>}
                          {log.defectQty > 0 && <Text style={{ color: '#ff4d4f', fontSize: 11 }}>{log.defectQty} lỗi</Text>}
                          {log.addedQty === 0 && log.defectQty === 0 && <Text type="secondary">--</Text>}
                        </Space>
                      ),
                    },
                    {
                      title: 'Giờ công', dataIndex: 'laborHours', width: 70, align: 'center',
                      render: (v?: number) => v ? <Text style={{ fontSize: 12 }}>{v}h</Text> : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Vật tư đã dùng', width: 200,
                      render: (_: unknown, log: ProductionLog) => log.materialsUsed.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {log.materialsUsed.map((m) => (
                            <Tag key={m.materialCode} style={{ fontSize: 10, margin: 0 }}>{m.materialName} x{m.quantity}</Tag>
                          ))}
                        </div>
                      ) : <Text type="secondary">--</Text>,
                    },
                    {
                      title: 'Kiểm tra chất lượng', dataIndex: 'qualityResult', width: 160, ellipsis: true,
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
        styles={{
          header: { display: 'none' },
          body: { padding: 0 },
        }}
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
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{order.code} — {order.productName}</div>
            </div>
          </Space>
        </div>

        <div style={{ padding: 20 }}>
          <Form form={form} layout="vertical" requiredMark="optional">

            {/* 1. Tiến độ hiện tại (chỉ hiển thị) */}
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 20, border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Tiến độ hiện tại</Text>
                <Text strong style={{ color: '#1B3A5C' }}>{order.completedQty}/{order.quantity} SP ({progressPercent}%)</Text>
              </div>
              <Progress percent={progressPercent} strokeColor="#1B3A5C" size="small" showInfo={false} />
            </div>

            {/* 2. Công đoạn + trạng thái */}
            <Row gutter={12}>
              <Col span={14}>
                <Form.Item label="Công đoạn đang thực hiện" name="stepNo" rules={[{ required: true, message: 'Chọn công đoạn' }]}>
                  <Select
                    placeholder="Chọn công đoạn"
                    value={selectedStep}
                    onChange={(v) => setSelectedStep(v)}
                    options={steps.map((s) => ({ value: s.stepNo, label: `${s.stepNo}. ${s.name}` }))}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="Trạng thái" name="stepStatus" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                  <Select placeholder="Chọn" options={[
                    { value: 'in_progress', label: 'Đang thực hiện' },
                    { value: 'completed', label: 'Hoàn thành CĐ' },
                    { value: 'failed', label: 'Không đạt' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>

            {/* 3. Mô tả công việc */}
            <Form.Item label="Mô tả công việc đã thực hiện" name="workDescription">
              <Input.TextArea rows={2} placeholder="VD: Hàn SMT 4 bo mạch khuếch đại, gắn IC xử lý..." />
            </Form.Item>

            {/* 4. Sản lượng + giờ công */}
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
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }}
                    placeholder={selectedStep ? `Ước tính: ${steps.find((s) => s.stepNo === selectedStep)?.estimatedHours || 0}` : '0'} />
                </Form.Item>
              </Col>
            </Row>

            {/* 5. Vật tư đã dùng */}
            <Text strong style={{ color: '#1B3A5C', display: 'block', marginBottom: 8, fontSize: 13 }}>
              Vật tư đã sử dụng
              {drawerMaterials.length > 0 && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>({drawerMaterials.length} vật tư)</Text>}
            </Text>
            {drawerMaterials.length > 0 ? (
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f7fa' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', color: '#1B3A5C', fontWeight: 600 }}>Vật tư</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: 50, color: '#1B3A5C' }}>ĐVT</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: 60, color: '#1B3A5C' }}>Đ.mức</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: 80, color: '#1B3A5C' }}>Số lượng dùng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawerMaterials.map((m) => (
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
                  {selectedStep ? 'Không có vật tư cho công đoạn này' : 'Chọn công đoạn để hiển thị vật tư'}
                </Text>
              </div>
            )}

            {/* 6. Kết quả kiểm tra */}
            <Form.Item label="Kết quả kiểm tra chất lượng" name="qualityResult">
              <Input.TextArea rows={2} placeholder="VD: Đạt AOI 100%, công suất đầu ra 96% (yêu cầu >= 95%)" />
            </Form.Item>

            {/* 7. Hành động */}
            <Form.Item label="Sau khi cập nhật" name="action" initialValue="update">
              <Select options={[
                { value: 'update', label: 'Tiếp tục sản xuất' },
                { value: 'pause', label: 'Tạm dừng lệnh sản xuất' },
                { value: 'complete', label: 'Hoàn thành lệnh sản xuất' },
              ]} />
            </Form.Item>

            {/* 8. Ghi chú */}
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

export default ProductionOrderDetail;
