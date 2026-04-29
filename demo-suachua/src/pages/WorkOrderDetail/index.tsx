import React, { useMemo } from 'react';
import {
  Card, Descriptions, Tag, Table, Progress, Steps, Row, Col, Button, Space,
  Typography, Breadcrumb, Divider, message,
} from 'antd';
import {
  ArrowLeftOutlined, CarryOutOutlined, ToolOutlined,
  FileTextOutlined, DollarOutlined, ExperimentOutlined,
  SendOutlined, PlayCircleOutlined, ExportOutlined,
  AlertOutlined, FileSearchOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getWorkOrderById } from '../../data/workOrders';
import { getTasksByWorkOrder } from '../../data/repairTasks';
import { getMaterialsByWorkOrder } from '../../data/materials';
import {
  workOrderStatusConfig, repairMethodConfig, repairTypeConfig, priorityConfig,
  repairStageConfig, repairTaskStatusConfig, formatDate, formatCurrency,
  getProgressColor, equipmentTypeConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
const { Title, Text } = Typography;

const pageStyles = `
  .detail-header-card {
    border-radius: 14px !important; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: none;
  }
  .detail-section-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
  }
  .detail-section-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1);
  }
  .step-timeline .ant-steps-item-title { font-size: 13px !important; }
  .wod-material-status-used { color: #52c41a; }
  .wod-material-status-requested { color: #faad14; }
  .wod-material-status-returned { color: #1890ff; }
  .wod-material-status-issued { color: #0891b2; }
`;

const statusStepMap: Record<string, number> = {
  draft: 0,
  pending_approval: 1,
  approved: 2,
  in_progress: 3,
  quality_check: 4,
  testing: 5,
  accepted: 6,
  handed_over: 7,
  closed: 8,
};

const stepItems = [
  { title: 'Nháp' },
  { title: 'Chờ duyệt' },
  { title: 'Đã duyệt' },
  { title: 'Thực hiện' },
  { title: 'Kiểm tra CL' },
  { title: 'Thử nghiệm' },
  { title: 'Nghiệm thu' },
  { title: 'Bàn giao' },
  { title: 'Đóng' },
];

const materialStatusLabels: Record<string, { label: string; color: string }> = {
  requested: { label: 'Yêu cầu', color: 'warning' },
  issued: { label: 'Đã cấp', color: 'processing' },
  used: { label: 'Đã dùng', color: 'success' },
  returned: { label: 'Đã trả', color: 'cyan' },
};

const materialTypeLabels: Record<string, string> = {
  component: 'Linh kiện',
  module: 'Mô-đun',
  consumable: 'Vật tư tiêu hao',
  tool: 'Dụng cụ',
};

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser: _currentUser } = useUser();

  const workOrder = useMemo(() => getWorkOrderById(id || ''), [id]);
  const tasks = useMemo(() => getTasksByWorkOrder(id || ''), [id]);
  const orderMaterials = useMemo(() => getMaterialsByWorkOrder(id || ''), [id]);

  if (!workOrder) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Text type="secondary" style={{ fontSize: 16 }}>Không tìm thấy lệnh sửa chữa</Text>
        <br /><br />
        <Button type="primary" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/work-orders')}
          style={{ background: colors.navy }}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const statusCfg = workOrderStatusConfig[workOrder.status];
  const priorityCfg = priorityConfig[workOrder.priority];
  const methodCfg = repairMethodConfig[workOrder.repairMethod];
  const typeCfg = repairTypeConfig[workOrder.repairType];
  const eqTypeCfg = equipmentTypeConfig[workOrder.equipmentType];
  const currentStep = statusStepMap[workOrder.status] ?? 0;

  const getStepStatus = () => {
    if (workOrder.status === 'closed') return 'finish' as const;
    if (workOrder.status === 'rejected') return 'error' as const;
    return 'process' as const;
  };

  const taskColumns = [
    {
      title: 'STT',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 60,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Công việc',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 260,
      ellipsis: true,
      render: (text: string) => <Text strong style={{ color: colors.navy }}>{text}</Text>,
    },
    {
      title: 'Công đoạn',
      dataIndex: 'stage',
      key: 'stage',
      width: 110,
      render: (s: string) => {
        const cfg = repairStageConfig[s as keyof typeof repairStageConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : s;
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => {
        const cfg = repairTaskStatusConfig[s as keyof typeof repairTaskStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : s;
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 130,
      render: (p: number) => (
        <Progress percent={p} size="small" strokeColor={getProgressColor(p)} style={{ marginBottom: 0 }} />
      ),
    },
    {
      title: 'Giờ KH',
      dataIndex: 'plannedHours',
      key: 'plannedHours',
      width: 80,
      align: 'center' as const,
      render: (v: number) => `${v}h`,
    },
    {
      title: 'Giờ TT',
      dataIndex: 'actualHours',
      key: 'actualHours',
      width: 80,
      align: 'center' as const,
      render: (v: number) => <Text type={v > 0 ? undefined : 'secondary'}>{v > 0 ? `${v}h` : '-'}</Text>,
    },
  ];

  const materialColumns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      ellipsis: true,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (text: string) => <Text code style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (t: string) => materialTypeLabels[t] || t,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Đơn giá (tr)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 110,
      align: 'right' as const,
      render: (v: number) => v > 0 ? `${v}` : '-',
    },
    {
      title: 'Thành tiền (tr)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{v > 0 ? `${v}` : '-'}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => {
        const cfg = materialStatusLabels[s];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : s;
      },
    },
  ];

  const totalMaterialCost = orderMaterials.reduce((sum, m) => sum + m.totalPrice, 0);

  return (
    <>
      <style>{pageStyles}</style>

      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/">Tổng quan</Link> },
          { title: <Link to="/work-orders">Lập lệnh sửa chữa</Link> },
          { title: workOrder.code },
        ]}
      />

      {/* Header Card - Navy gradient */}
      <Card className="detail-header-card" styles={{ body: { padding: 0 } }} style={{ marginBottom: 16 }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 80, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <Button type="text" icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/work-orders')}
                style={{ color: 'rgba(255,255,255,0.7)', padding: '0 0 8px', fontSize: 13 }}>
                Quay lại danh sách
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20,
                }}>
                  <CarryOutOutlined />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    {workOrder.code}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {workOrder.equipmentName} — {workOrder.unitName}
                  </div>
                </div>
              </div>
              <Space size={8}>
                <Tag color={statusCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{statusCfg.label}</Tag>
                <Tag color={priorityCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{priorityCfg.label}</Tag>
                <Tag color={methodCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{methodCfg.label}</Tag>
                <Tag color={eqTypeCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{eqTypeCfg.label}</Tag>
              </Space>
            </div>

            {/* Action buttons */}
            <Space>
              {workOrder.status === 'draft' && (
                <Button type="primary" icon={<SendOutlined />}
                  onClick={() => message.success(`Đã gửi phê duyệt lệnh ${workOrder.code}`)}
                  style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                  Gửi phê duyệt
                </Button>
              )}
              {workOrder.status === 'approved' && (
                <>
                  <Button icon={<ExportOutlined />}
                    onClick={() => message.success(`Đã gửi yêu cầu xuất kho cho ${workOrder.code}`)}
                    style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                    Yêu cầu xuất kho
                  </Button>
                  <Button type="primary" icon={<PlayCircleOutlined />}
                    onClick={() => message.success(`Đã bắt đầu thực hiện lệnh ${workOrder.code}`)}
                    style={{ background: '#fff', color: colors.success, fontWeight: 600, border: 'none' }}>
                    Bắt đầu thực hiện
                  </Button>
                </>
              )}
              <Progress
                type="circle"
                percent={workOrder.progress}
                size={56}
                strokeColor={getProgressColor(workOrder.progress)}
                format={p => <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p}%</span>}
              />
            </Space>
          </div>
        </div>

        {/* Steps timeline */}
        <div style={{ padding: '16px 28px 20px', background: '#f8fafc' }} className="step-timeline">
          <Steps
            current={currentStep}
            size="small"
            status={getStepStatus()}
            items={stepItems}
          />
        </div>
      </Card>

      {/* Đối chiếu chẩn đoán */}
      <Card className="detail-section-card" style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #fa8c16, #ffc069)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <FileSearchOutlined />
            </div>
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Đối chiếu chẩn đoán</span>
          </div>
        }
      >
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ background: '#fff7e6', borderRadius: 10, padding: 16, border: '1px solid #ffd591', height: '100%' }}>
              <div style={{ fontWeight: 700, color: '#fa8c16', marginBottom: 12, fontSize: 14 }}>
                <AlertOutlined /> Kết quả chẩn đoán
              </div>
              <div style={{ fontSize: 13, color: '#262626', lineHeight: 1.6 }}>
                {workOrder.diagnosticSummary}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ background: '#e6f7ff', borderRadius: 10, padding: 16, border: '1px solid #91d5ff', height: '100%' }}>
              <div style={{ fontWeight: 700, color: '#1890ff', marginBottom: 12, fontSize: 14 }}>
                <ToolOutlined /> Phương án xử lý
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Phương pháp sửa chữa</div>
                <Tag color={methodCfg.color}>{methodCfg.label}</Tag>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Loại sửa chữa</div>
                <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Tổ sửa chữa</div>
                <div style={{ fontSize: 13, color: '#262626' }}>{workOrder.assignedTeam}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Dự toán chi phí</div>
                <div style={{ fontSize: 13, color: '#262626', fontWeight: 600 }}>{formatCurrency(workOrder.estimatedCost)}</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Thông tin lệnh sửa chữa */}
      <Card className="detail-section-card" style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <FileTextOutlined />
            </div>
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Thông tin lệnh sửa chữa</span>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <Descriptions.Item label="Mã lệnh">
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 14 }}>{workOrder.code}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Mã yêu cầu">{workOrder.repairRequestCode}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khí tài">{workOrder.equipmentName}</Descriptions.Item>
          <Descriptions.Item label="Loại khí tài">
            <Tag color={eqTypeCfg.color}>{eqTypeCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị">{workOrder.unitName}</Descriptions.Item>
          <Descriptions.Item label="Loại sửa chữa">
            <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phương pháp">
            <Tag color={methodCfg.color}>{methodCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Độ ưu tiên">
            <Tag color={priorityCfg.color}>{priorityCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tổ sửa chữa">{workOrder.assignedTeam}</Descriptions.Item>
          <Descriptions.Item label="Tổ trưởng">{workOrder.leader}</Descriptions.Item>
          <Descriptions.Item label="Tiến độ">
            <Progress percent={workOrder.progress} size="small" strokeColor={getProgressColor(workOrder.progress)} style={{ width: 120, marginBottom: 0 }} />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu (KH)">{workOrder.plannedStart ? formatDate(workOrder.plannedStart) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc (KH)">{workOrder.plannedEnd ? formatDate(workOrder.plannedEnd) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu (TT)">{workOrder.actualStart ? formatDate(workOrder.actualStart) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc (TT)">{workOrder.actualEnd ? formatDate(workOrder.actualEnd) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Người tạo">{workOrder.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{workOrder.createdDate ? formatDate(workOrder.createdDate) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Người phê duyệt">{workOrder.approvedBy || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày phê duyệt">{workOrder.approvedDate ? formatDate(workOrder.approvedDate) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Chẩn đoán tóm tắt" span={3}>{workOrder.diagnosticSummary}</Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={3}>{workOrder.notes || '-'}</Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Chi phí */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #d97706, #fbbf24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14,
          }}>
            <DollarOutlined />
          </div>
          <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Chi phí</span>
        </div>
        <Row gutter={[24, 12]}>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Dự toán</Text>
            <Text strong style={{ fontSize: 18, color: colors.navy }}>{formatCurrency(workOrder.estimatedCost)}</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Thực tế</Text>
            <Text strong style={{ fontSize: 18, color: colors.success }}>{formatCurrency(workOrder.actualCost)}</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Vật tư</Text>
            <Text strong style={{ fontSize: 18, color: colors.info }}>{formatCurrency(workOrder.materialCost)}</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Nhân công</Text>
            <Text strong style={{ fontSize: 18, color: colors.gold }}>{formatCurrency(workOrder.laborCost)}</Text>
          </Col>
        </Row>
      </Card>

      {/* Công việc sửa chữa */}
      <Card className="detail-section-card" style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #0891b2, #67e8f9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <ToolOutlined />
            </div>
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>
              Công việc sửa chữa ({tasks.length})
            </span>
          </div>
        }
      >
        <Table
          dataSource={tasks}
          columns={taskColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>

      {/* Vật tư sử dụng */}
      <Card className="detail-section-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #059669, #34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <ExperimentOutlined />
            </div>
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>
              Vật tư sử dụng ({orderMaterials.length})
            </span>
            <Text type="secondary" style={{ marginLeft: 'auto', fontSize: 13 }}>
              Tổng: <Text strong style={{ color: colors.navy }}>{formatCurrency(totalMaterialCost)}</Text>
            </Text>
          </div>
        }
      >
        <Table
          dataSource={orderMaterials}
          columns={materialColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>
    </>
  );
};

export default WorkOrderDetail;
