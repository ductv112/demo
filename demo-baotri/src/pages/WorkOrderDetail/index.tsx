import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Tag, Button, Row, Col, Typography, Space,
  Progress, Checkbox, Empty, Breadcrumb, Divider, Avatar, Steps, message,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined,
  UserOutlined, ToolOutlined, FileProtectOutlined, AuditOutlined,
  ExclamationCircleOutlined, PlayCircleOutlined, SendOutlined,
  StopOutlined, PlusCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { maintenanceWorkOrders } from '../../data/maintenanceWorkOrders';
import {
  poStatusConfig, evaluationResultConfig, formatDate, formatDateTime,
} from '../../utils/format';
import type {
  MaintenanceWorkOrder, POStatus, POChecklistItem, POTestResult,
  EvaluationResult, SparePartUsage,
} from '../../types';

const { Title, Text } = Typography;

const statusStepMap: Record<POStatus, number> = {
  draft: 0, assigned: 1, in_progress: 2, checking: 3,
  evaluated: 4, accepted: 5, rejected: 4, cancelled: 0,
};

// ── Gradient badge helper ──
const GradientBadge: React.FC<{ gradient: string; icon: React.ReactNode }> = ({ gradient, icon }) => (
  <div style={{
    width: 32, height: 32, borderRadius: 8, background: gradient,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 14,
  }}>
    {icon}
  </div>
);

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const po = maintenanceWorkOrders.find(w => w.id === id);

  if (!po) {
    return (
      <div style={{ padding: 40 }}>
        <Empty description="Không tìm thấy lệnh công việc" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/work-orders')}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const statusCfg = poStatusConfig[po.status];
  const completedChecklist = po.checklistItems.filter(c => c.isCompleted).length;
  const totalChecklist = po.checklistItems.length;
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
  const currentStep = statusStepMap[po.status] ?? 0;
  const isRejected = po.status === 'rejected';

  // ── Action buttons based on status ──
  const handleAction = (action: string) => {
    message.success(`Đã thực hiện: ${action}`);
  };

  const renderActionButtons = () => {
    switch (po.status) {
      case 'draft':
        return (
          <Button type="primary" block icon={<SendOutlined />}
            style={{ background: '#1B3A5C', height: 42, fontWeight: 600 }}
            onClick={() => handleAction('Phân công nhân sự')}>
            Phân công thực hiện
          </Button>
        );
      case 'assigned':
        return (
          <Button type="primary" block icon={<PlayCircleOutlined />}
            style={{ background: '#0891b2', height: 42, fontWeight: 600 }}
            onClick={() => handleAction('Bắt đầu thực hiện')}>
            Bắt đầu thực hiện
          </Button>
        );
      case 'in_progress':
        return (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Button type="primary" block icon={<CheckCircleOutlined />}
              style={{ background: '#D4A843', borderColor: '#D4A843', height: 42, fontWeight: 600 }}
              onClick={() => handleAction('Hoàn thành & gửi kiểm tra')}>
              Hoàn thành & gửi kiểm tra
            </Button>
            <Button block icon={<StopOutlined />} danger onClick={() => handleAction('Tạm dừng')}>
              Tạm dừng
            </Button>
          </Space>
        );
      case 'checking':
        return (
          <Button type="primary" block icon={<AuditOutlined />}
            style={{ background: '#1B3A5C', height: 42, fontWeight: 600 }}
            onClick={() => handleAction('Thực hiện đánh giá')}>
            Thực hiện đánh giá
          </Button>
        );
      case 'evaluated':
        return (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Button type="primary" block icon={<CheckCircleOutlined />}
              style={{ background: '#52c41a', borderColor: '#52c41a', height: 42, fontWeight: 600 }}
              onClick={() => handleAction('Nghiệm thu')}>
              Xác nhận nghiệm thu
            </Button>
            {po.evaluation?.result === 'fail' && (
              <Button block icon={<PlusCircleOutlined />} danger
                style={{ height: 42, fontWeight: 600 }}
                onClick={() => {
                  message.info('Tạo WO sửa chữa mới từ lệnh không đạt');
                  navigate(`/work-orders/create-from/${po.id}`);
                }}>
                Tạo WO sửa chữa
              </Button>
            )}
          </Space>
        );
      case 'rejected':
        return (
          <Button type="primary" block icon={<PlusCircleOutlined />} danger
            style={{ height: 42, fontWeight: 600 }}
            onClick={() => {
              message.info('Tạo WO sửa chữa mới từ lệnh không đạt');
              navigate(`/work-orders/create-from/${po.id}`);
            }}>
            Tạo WO sửa chữa mới
          </Button>
        );
      case 'accepted':
        return (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
            <div><Text strong style={{ color: '#52c41a' }}>Đã nghiệm thu</Text></div>
          </div>
        );
      default:
        return null;
    }
  };

  // ── Table columns ──
  const checklistColumns: ColumnsType<POChecklistItem> = [
    { title: 'STT', dataIndex: 'order', width: 55, align: 'center',
      render: (order: number) => <Text strong style={{ color: '#1B3A5C' }}>{order}</Text> },
    { title: 'Nội dung', dataIndex: 'content',
      render: (content: string, record: POChecklistItem) => (
        <div>
          <Text style={{ fontSize: 13 }}>{content}</Text>
          {record.notes && <div style={{ marginTop: 2 }}><Text type="warning" style={{ fontSize: 11 }}><ExclamationCircleOutlined style={{ marginRight: 4 }} />{record.notes}</Text></div>}
        </div>
      ) },
    { title: 'Hoàn thành', dataIndex: 'isCompleted', width: 90, align: 'center',
      render: (v: boolean) => <Checkbox checked={v} disabled /> },
  ];

  const sparePartColumns: ColumnsType<SparePartUsage> = [
    { title: 'Tên vật tư', dataIndex: 'partName', render: (n: string) => <Text strong style={{ fontSize: 13 }}>{n}</Text> },
    { title: 'Mã', dataIndex: 'partCode', width: 120, render: (c: string) => <Text style={{ color: '#1B3A5C' }}>{c}</Text> },
    { title: 'Lô/Serial', key: 'tracking', width: 120,
      render: (_: unknown, r: SparePartUsage) => r.lotNumber ? <Tag style={{ fontSize: 11 }}>{r.lotNumber}</Tag> : r.serialNumber ? <Tag color="cyan" style={{ fontSize: 11 }}>{r.serialNumber}</Tag> : <Text type="secondary" style={{ fontSize: 11 }}>—</Text> },
    { title: 'Yêu cầu', dataIndex: 'requestedQty', width: 70, align: 'center' },
    { title: 'Đã dùng', dataIndex: 'usedQty', width: 70, align: 'center', render: (q: number) => <Text strong>{q}</Text> },
    { title: 'Hoàn trả', dataIndex: 'returnedQty', width: 70, align: 'center', render: (q: number) => <Text style={{ color: q > 0 ? '#52c41a' : undefined }}>{q}</Text> },
    { title: 'ĐVT', dataIndex: 'unit', width: 50, align: 'center' },
    { title: 'Phiếu XK', key: 'outbound', width: 110,
      render: (_: unknown, r: SparePartUsage) => r.outboundOrderCode ? <Tag color="processing" style={{ fontSize: 11 }}>{r.outboundOrderCode}</Tag> : <Text type="secondary" style={{ fontSize: 11 }}>—</Text> },
  ];

  const measurementColumns: ColumnsType<POTestResult> = [
    { title: 'Thông số', dataIndex: 'parameter', render: (p: string) => <Text strong style={{ fontSize: 13 }}>{p}</Text> },
    { title: 'Giá trị chuẩn', dataIndex: 'standardValue', width: 130, align: 'center', render: (v: string) => <Text type="secondary">{v}</Text> },
    { title: 'Giá trị đo', dataIndex: 'measuredValue', width: 130, align: 'center', render: (v: string) => <Text strong style={{ color: '#1B3A5C' }}>{v}</Text> },
    { title: 'Đơn vị', dataIndex: 'unit', width: 70, align: 'center' },
    { title: 'Kết quả', dataIndex: 'status', width: 110, align: 'center',
      render: (s: 'pass' | 'fail' | 'warning') => {
        const m = { pass: { l: 'Đạt', c: 'success' }, fail: { l: 'Không đạt', c: 'error' }, warning: { l: 'Cảnh báo', c: 'warning' } };
        return <Tag color={m[s].c}>{m[s].l}</Tag>;
      } },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <Breadcrumb items={[
        { title: 'Tổng quan' },
        { title: <a onClick={() => navigate('/work-orders')}>Phiếu công việc</a> },
        { title: `Chi tiết ${po.code}` },
      ]} style={{ marginBottom: 8 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GradientBadge gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" icon={<FileProtectOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Chi tiết lệnh công việc (WO)</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{po.code} — {po.workItemName}</Text>
          </div>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/work-orders')}>Quay lại</Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* ══ LEFT ══ */}
        <Col xs={24} lg={16}>
          {/* Card 1: Thông tin PO */}
          <Card title={<Space><GradientBadge gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" icon={<FileProtectOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Thông tin lệnh công việc</Text></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" labelStyle={{ fontWeight: 600, color: '#595959', fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Mã WO"><Text strong style={{ color: '#1B3A5C' }}>{po.code}</Text></Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color={statusCfg.color}>{statusCfg.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="Kế hoạch"><a style={{ color: '#1B3A5C', fontWeight: 600 }} onClick={() => navigate(`/maintenance-plans/${po.planId}`)}>{po.planCode}</a></Descriptions.Item>
              <Descriptions.Item label="Hạng mục">{po.workItemName}</Descriptions.Item>
              <Descriptions.Item label="Thiết bị"><Text strong>{po.equipmentName}</Text> <Text type="secondary">({po.equipmentCode})</Text></Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">
                <Space size={6}><Avatar size={20} style={{ background: '#1B3A5C', fontSize: 10 }}>{po.assignedStaffName.split(' ').pop()?.charAt(0)}</Avatar>{po.assignedStaffName}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="Đội">{po.teamName}</Descriptions.Item>
              <Descriptions.Item label="Ngày thực hiện"><ClockCircleOutlined style={{ marginRight: 4 }} />{formatDate(po.scheduledDate)}</Descriptions.Item>
              <Descriptions.Item label="TG dự kiến">{po.estimatedHours} giờ</Descriptions.Item>
              <Descriptions.Item label="TG thực tế">{po.actualHours ? `${po.actualHours} giờ` : '—'}</Descriptions.Item>
              {po.description && <Descriptions.Item label="Mô tả" span={2}>{po.description}</Descriptions.Item>}
              <Descriptions.Item label="Bắt buộc">{po.isMandatory ? <Tag color="red">Bắt buộc</Tag> : <Tag>Không bắt buộc</Tag>}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Card 2: Checklist */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space><GradientBadge gradient="linear-gradient(135deg, #059669, #34d399)" icon={<CheckCircleOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Checklist thực hiện</Text><Tag color="processing">{totalChecklist} mục</Tag></Space>
                <Progress type="circle" percent={checklistPercent} size={38} strokeColor={checklistPercent === 100 ? '#52c41a' : '#1B3A5C'}
                  format={() => <span style={{ fontSize: 10, fontWeight: 700 }}>{completedChecklist}/{totalChecklist}</span>} />
              </div>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 0 } }}>
            <Table<POChecklistItem> columns={checklistColumns} dataSource={po.checklistItems} rowKey="id" pagination={false} size="middle" />
          </Card>

          {/* Card 3: Vật tư */}
          {po.spareParts.length > 0 && (
            <Card title={<Space><GradientBadge gradient="linear-gradient(135deg, #722ed1, #b37feb)" icon={<ToolOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Vật tư sử dụng</Text></Space>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 0 } }}>
              <Table<SparePartUsage> columns={sparePartColumns} dataSource={po.spareParts} rowKey="partCode" pagination={false} size="middle" />
            </Card>
          )}

          {/* Card 4: Đánh giá kết quả */}
          {po.evaluation ? (
            <Card title={<Space><GradientBadge gradient="linear-gradient(135deg, #0891b2, #06b6d4)" icon={<AuditOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Đánh giá kết quả</Text></Space>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
              {/* Kết quả tổng */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Kết quả tổng:</Text>
                <Tag color={evaluationResultConfig[po.evaluation.result].color} style={{ fontSize: 15, padding: '4px 16px', fontWeight: 600 }}>
                  {evaluationResultConfig[po.evaluation.result].label}
                </Tag>
                {po.evaluation.result === 'fail' && (
                  <Text type="danger" style={{ marginLeft: 12, fontSize: 12 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    Cần tạo WO sửa chữa mới
                  </Text>
                )}
              </div>

              {/* Bảng đo lường */}
              {po.evaluation.measurements.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Text strong style={{ color: '#1B3A5C', fontSize: 13, display: 'block', marginBottom: 8 }}>Bảng đo lường</Text>
                  <Table<POTestResult> columns={measurementColumns} dataSource={po.evaluation.measurements} rowKey="id" pagination={false} size="small" style={{ marginBottom: 16 }} />
                </>
              )}

              {/* Ý kiến */}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Ý kiến đánh giá:</Text>
                <div><Text style={{ fontSize: 13 }}>{po.evaluation.evaluatorNotes}</Text></div>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 12, marginBottom: 12 }}>
                <div><Text type="secondary">Người đánh giá: </Text><Space size={4}><Avatar size={18} style={{ background: '#0891b2', fontSize: 9 }}>{po.evaluation.evaluatorName.split(' ').pop()?.charAt(0)}</Avatar><Text strong>{po.evaluation.evaluatorName}</Text></Space></div>
                <div><Text type="secondary">Ngày: </Text><Text strong>{formatDate(po.evaluation.evaluatedDate)}</Text></div>
              </div>

              {/* Nghiệm thu */}
              {po.evaluation.acceptedBy && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ background: 'linear-gradient(135deg, rgba(82,196,26,0.06), rgba(82,196,26,0.02))', borderRadius: 10, padding: 16, border: '1px solid rgba(82,196,26,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                      <Text strong style={{ color: '#52c41a', fontSize: 14 }}>Đã nghiệm thu</Text>
                    </div>
                    <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
                      <div><Text type="secondary">Người nghiệm thu: </Text><Text strong>{po.evaluation.acceptedBy}</Text></div>
                      {po.evaluation.acceptedDate && <div><Text type="secondary">Ngày: </Text><Text strong>{formatDate(po.evaluation.acceptedDate)}</Text></div>}
                    </div>
                    {po.evaluation.acceptanceNotes && <div style={{ marginTop: 6 }}><Text type="secondary" style={{ fontSize: 12 }}>Ghi chú: </Text><Text style={{ fontSize: 12 }}>{po.evaluation.acceptanceNotes}</Text></div>}
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card title={<Space><GradientBadge gradient="linear-gradient(135deg, #0891b2, #06b6d4)" icon={<AuditOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Đánh giá kết quả</Text></Space>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa đánh giá">
                <Button type="primary" icon={<AuditOutlined />} disabled={po.status !== 'checking'}
                  onClick={() => handleAction('Thực hiện đánh giá')}>
                  Thực hiện đánh giá
                </Button>
              </Empty>
            </Card>
          )}
        </Col>

        {/* ══ RIGHT ══ */}
        <Col xs={24} lg={8}>
          {/* Action buttons */}
          <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
            {renderActionButtons()}
          </Card>

          {/* Status summary card */}
          <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#fff' }}>
                <FileProtectOutlined />
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block' }}>{po.code}</Text>
              <Title level={5} style={{ color: '#fff', margin: '4px 0 16px' }}>{po.workItemName}</Title>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                <Row gutter={[8, 12]}>
                  <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>Trạng thái</Text><Tag color={statusCfg.color} style={{ marginTop: 4 }}>{statusCfg.label}</Tag></Col>
                  <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>Ngày thực hiện</Text><Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{formatDate(po.scheduledDate)}</Text></Col>
                  <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>Thời gian</Text><Text style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{po.estimatedHours}h</Text></Col>
                  <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>Checklist</Text><Text style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{completedChecklist}/{totalChecklist}</Text></Col>
                </Row>
              </div>
            </div>
          </Card>

          {/* Vòng đời PO */}
          <Card title={<Space><GradientBadge gradient="linear-gradient(135deg, #D4A843, #f0d890)" icon={<ClockCircleOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Vòng đời WO</Text></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <Steps direction="vertical" size="small" current={currentStep}
              status={isRejected ? 'error' : 'process'}
              items={[
                { title: 'Tạo WO', description: currentStep > 0 ? 'Hoàn thành' : 'Đang xử lý' },
                { title: 'Phân công', description: currentStep > 1 ? po.assignedStaffName : currentStep === 1 ? 'Đang xử lý' : 'Chờ' },
                { title: 'Thực hiện', description: currentStep > 2 ? (po.actualStart ? formatDateTime(po.actualStart) : 'Hoàn thành') : currentStep === 2 ? 'Đang thực hiện' : 'Chờ' },
                { title: 'Kiểm tra', description: currentStep > 3 ? 'Hoàn thành' : currentStep === 3 ? 'Đang kiểm tra' : 'Chờ' },
                { title: 'Đánh giá', description: po.evaluation ? `${evaluationResultConfig[po.evaluation.result].label} — ${formatDate(po.evaluation.evaluatedDate)}` : isRejected ? 'Không đạt' : 'Chờ', status: isRejected ? 'error' : undefined },
                { title: 'Nghiệm thu', description: po.evaluation?.acceptedBy ? `${po.evaluation.acceptedBy}` : 'Chờ' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkOrderDetail;
