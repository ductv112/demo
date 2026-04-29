import React, { useMemo } from 'react';
import {
  Card, Tag, Row, Col, Descriptions, Progress, Space, Button,
  Typography, Breadcrumb, Table, Empty, message,
} from 'antd';
import {
  ArrowLeftOutlined, ToolOutlined, CheckCircleOutlined,
  SendOutlined, EditOutlined, CarryOutOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { repairTasks } from '../../data/repairTasks';
import { getMaterialsByTask } from '../../data/materials';
import { workOrders } from '../../data/workOrders';
import {
  repairTaskStatusConfig, repairStageConfig, formatDate,
  getProgressColor, workOrderStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Text } = Typography;

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
`;

const materialTypeLabels: Record<string, string> = {
  component: 'Linh kiện',
  module: 'Mô-đun',
  consumable: 'Vật tư tiêu hao',
  tool: 'Dụng cụ',
};

const materialStatusLabels: Record<string, { label: string; color: string }> = {
  requested: { label: 'Yêu cầu', color: 'warning' },
  issued: { label: 'Đã cấp', color: 'processing' },
  used: { label: 'Đã dùng', color: 'success' },
  returned: { label: 'Đã trả', color: 'cyan' },
};

const RepairExecutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const task = useMemo(() => repairTasks.find(t => t.id === id), [id]);
  const taskMaterials = useMemo(() => getMaterialsByTask(id || ''), [id]);
  const relatedWO = useMemo(() => task ? workOrders.find(w => w.id === task.workOrderId) : null, [task]);

  if (!task) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Text type="secondary" style={{ fontSize: 16 }}>Không tìm thấy công việc sửa chữa</Text>
        <br /><br />
        <Button type="primary" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/repair-execution')}
          style={{ background: colors.navy }}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const statusCfg = repairTaskStatusConfig[task.status];
  const stageCfg = repairStageConfig[task.stage];
  const hourDiff = task.actualHours > 0 ? task.actualHours - task.plannedHours : null;

  const materialColumns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      width: 240,
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
      render: (t: string) => {
        const label = materialTypeLabels[t] || t;
        return <Tag color="blue">{label}</Tag>;
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      align: 'center' as const,
    },
    {
      title: 'Đơn giá (tr)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 110,
      align: 'right' as const,
      render: (v: number) => v > 0 ? `${v}` : '—',
    },
    {
      title: 'Thành tiền (tr)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{v > 0 ? `${v}` : '—'}</Text>,
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

  return (
    <>
      <style>{pageStyles}</style>

      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <Link to="/">Tổng quan</Link> },
        { title: <Link to="/repair-execution">Thực hiện sửa chữa</Link> },
        { title: task.taskName },
      ]} />

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
                onClick={() => navigate('/repair-execution')}
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
                  <ToolOutlined />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    {task.taskName}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {task.workOrderCode} — {task.assignee}
                  </div>
                </div>
              </div>
              <Space size={8}>
                <Tag color={statusCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{statusCfg.label}</Tag>
                <Tag color={stageCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{stageCfg.label}</Tag>
              </Space>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Progress
                type="circle"
                percent={task.progress}
                size={64}
                strokeColor="#fff"
                trailColor="rgba(255,255,255,0.2)"
                format={p => <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p}%</span>}
              />
              <Space>
                {task.status === 'pending' && (
                  <Button icon={<CarryOutOutlined />}
                    onClick={() => message.success(`Đã xác nhận sẵn sàng cho "${task.taskName}"`)}
                    style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                    Xác nhận sẵn sàng
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <Button icon={<EditOutlined />}
                      onClick={() => message.info(`Cập nhật tiến độ cho "${task.taskName}"`)}
                      style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                      Cập nhật tiến độ
                    </Button>
                    <Button icon={<CheckCircleOutlined />}
                      onClick={() => message.success(`Đã hoàn thành "${task.taskName}"`)}
                      style={{ background: '#fff', color: colors.success, fontWeight: 600, border: 'none' }}>
                      Hoàn thành
                    </Button>
                  </>
                )}
                {task.status === 'completed' && (
                  <Button icon={<SendOutlined />}
                    onClick={() => message.success(`Đã chuyển "${task.taskName}" sang kiểm tra chất lượng`)}
                    style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                    Gửi nghiệm thu
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* Thông tin công việc */}
      <Card className="detail-section-card" style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <InfoCircleOutlined />
            </div>
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Thông tin công việc</span>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Tên công việc" span={2}>{task.taskName}</Descriptions.Item>
          <Descriptions.Item label="Mã lệnh SC">
            <a onClick={() => navigate(`/work-orders/${task.workOrderId}`)}
              style={{ fontWeight: 700, color: colors.navy, cursor: 'pointer' }}>
              {task.workOrderCode}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Công đoạn">
            <Tag color={stageCfg.color}>{stageCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Người thực hiện">{task.assignee}</Descriptions.Item>
          <Descriptions.Item label="Mã người TH">
            <Text code style={{ fontSize: 12 }}>{task.assigneeId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Giờ kế hoạch">
            <Text strong>{task.plannedHours}h</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Giờ thực tế">
            {task.actualHours > 0 ? <Text strong>{task.actualHours}h</Text> : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Chênh lệch">
            {hourDiff !== null ? (
              <Text style={{
                color: hourDiff > 0 ? colors.danger : colors.success,
                fontWeight: 600,
              }}>
                {hourDiff > 0 ? '+' : ''}{hourDiff}h
              </Text>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu KH">{task.plannedStart ? formatDate(task.plannedStart) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc KH">{task.plannedEnd ? formatDate(task.plannedEnd) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu TT">{task.actualStart ? formatDate(task.actualStart) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc TT">{task.actualEnd ? formatDate(task.actualEnd) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Tiến độ" span={2}>
            <Progress percent={task.progress} size="small" strokeColor={getProgressColor(task.progress)} style={{ width: 200, marginBottom: 0 }} />
          </Descriptions.Item>
          <Descriptions.Item label="Thứ tự công việc">{task.sequence}</Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>{task.notes || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Vật tư sử dụng */}
      <Card className="detail-section-card" style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #059669, #34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <ToolOutlined />
            </div>
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Vật tư sử dụng</span>
          </div>
        }
      >
        {taskMaterials.length > 0 ? (
          <Table
            dataSource={taskMaterials}
            columns={materialColumns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
            size="small"
          />
        ) : (
          <Empty description="Công việc này không sử dụng vật tư" />
        )}
      </Card>

      {/* Lệnh sửa chữa liên quan */}
      {relatedWO && (
        <Card className="detail-section-card"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.gold}, #f0d890)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.navyDark, fontSize: 14,
              }}>
                <ToolOutlined />
              </div>
              <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Lệnh sửa chữa liên quan</span>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
            <Descriptions.Item label="Mã lệnh SC">
              <a onClick={() => navigate(`/work-orders/${relatedWO.id}`)}
                style={{ fontWeight: 700, color: colors.navy, cursor: 'pointer' }}>
                {relatedWO.code}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Tên thiết bị">{relatedWO.equipmentName}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {(() => {
                const woCfg = workOrderStatusConfig[relatedWO.status];
                return woCfg ? <Tag color={woCfg.color}>{woCfg.label}</Tag> : relatedWO.status;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Tiến độ">
              <Progress percent={relatedWO.progress} size="small" strokeColor={getProgressColor(relatedWO.progress)} style={{ width: 150, marginBottom: 0 }} />
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" icon={<ToolOutlined />}
              onClick={() => navigate(`/work-orders/${relatedWO.id}`)}
              style={{ background: colors.navy }}>
              Xem chi tiết lệnh SC
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default RepairExecutionDetail;
