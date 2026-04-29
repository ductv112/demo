import React, { useMemo } from 'react';
import {
  Card, Tag, Row, Col, Descriptions, Steps, Space, Button,
  Typography, Breadcrumb, Divider, Table, message,
} from 'antd';
import {
  ArrowLeftOutlined, FileSearchOutlined, ToolOutlined,
  RadarChartOutlined, CheckCircleOutlined, SolutionOutlined,
  EditOutlined, SendOutlined, ClockCircleOutlined,
  AlertOutlined, InfoCircleOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { repairRequests } from '../../data/repairRequests';
import { getDiagnosticByRequestId } from '../../data/diagnosticResults';
import { workOrders } from '../../data/workOrders';
import {
  repairRequestStatusConfig, repairTypeConfig, equipmentTypeConfig,
  priorityConfig, receptionSourceConfig, formatDate,
  repairMethodConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { RepairRequestStatus } from '../../types';

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

const getStatusStepIndex = (status: RepairRequestStatus): number => {
  const map: Record<RepairRequestStatus, number> = {
    received: 0, diagnosing: 1, diagnosed: 2, planning: 3, ready: 4,
  };
  return map[status];
};

const RepairReceptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const request = useMemo(() => repairRequests.find(r => r.id === id), [id]);
  const diagnostic = useMemo(() => request ? getDiagnosticByRequestId(request.id) : null, [request]);
  const relatedWO = useMemo(() => request ? workOrders.find(w => w.repairRequestId === request.id) : null, [request]);

  if (!request) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Text type="secondary" style={{ fontSize: 16 }}>Không tìm thấy yêu cầu sửa chữa</Text>
        <br /><br />
        <Button type="primary" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/repair-reception')}
          style={{ background: colors.navy }}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const statusCfg = repairRequestStatusConfig[request.status];
  const typeCfg = repairTypeConfig[request.repairType];
  const eqCfg = equipmentTypeConfig[request.equipmentType];
  const prioCfg = priorityConfig[request.priority];
  const srcCfg = receptionSourceConfig[request.receptionSource];

  return (
    <>
      <style>{pageStyles}</style>

      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <Link to="/">Tổng quan</Link> },
        { title: <Link to="/repair-reception">Tiếp nhận sửa chữa</Link> },
        { title: request.code },
      ]} />

      {/* Header Card - Navy gradient */}
      <Card className="detail-header-card" styles={{ body: { padding: 0 } }} style={{ marginBottom: 16 }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative */}
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
                onClick={() => navigate('/repair-reception')}
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
                  <FileSearchOutlined />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    {request.code}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {request.equipmentName} — {request.unitName}
                  </div>
                </div>
              </div>
              <Space size={8}>
                <Tag color={statusCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{statusCfg.label}</Tag>
                <Tag color={prioCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{prioCfg.label}</Tag>
                <Tag color={typeCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{typeCfg.label}</Tag>
                <Tag color={eqCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{eqCfg.label}</Tag>
              </Space>
            </div>

            {/* Action buttons */}
            <Space>
              {request.status === 'received' && (
                <Button type="primary" icon={<SendOutlined />}
                  onClick={() => message.success(`Đã chuyển ${request.code} sang chẩn đoán`)}
                  style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                  Yêu cầu chẩn đoán
                </Button>
              )}
              {request.status === 'diagnosed' && (
                <Button type="primary" icon={<EditOutlined />}
                  onClick={() => message.info(`Chuyển lập kế hoạch cho ${request.code}`)}
                  style={{ background: '#fff', color: colors.success, fontWeight: 600, border: 'none' }}>
                  Lập kế hoạch SC
                </Button>
              )}
              {request.status === 'ready' && relatedWO && (
                <Button icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/work-orders/${relatedWO.id}`)}
                  style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                  Xem lệnh sửa chữa
                </Button>
              )}
            </Space>
          </div>
        </div>

        {/* Steps timeline */}
        <div style={{ padding: '16px 28px 20px', background: '#f8fafc' }} className="step-timeline">
          <Steps size="small" current={getStatusStepIndex(request.status)}
            items={[
              { title: 'Tiếp nhận', icon: <FileSearchOutlined /> },
              { title: 'Chẩn đoán', icon: <SolutionOutlined /> },
              { title: 'Đã chẩn đoán', icon: <CheckCircleOutlined /> },
              { title: 'Lập kế hoạch', icon: <EditOutlined /> },
              { title: 'Sẵn sàng SC', icon: <ToolOutlined /> },
            ]}
          />
        </div>
      </Card>

      {/* Thông tin thiết bị */}
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
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Thông tin thiết bị & Tiếp nhận</span>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
          <Descriptions.Item label="Mã yêu cầu">
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 14 }}>{request.code}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên thiết bị">{request.equipmentName}</Descriptions.Item>
          <Descriptions.Item label="Loại thiết bị">
            <Tag color={eqCfg.color}>{eqCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số serial">{request.serialNumber}</Descriptions.Item>
          <Descriptions.Item label="Mã thiết bị">{request.equipmentId}</Descriptions.Item>
          <Descriptions.Item label="Đơn vị gửi">{request.unitName}</Descriptions.Item>
          <Descriptions.Item label="Nguồn tiếp nhận">
            <Tag color={srcCfg.color}>{srcCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tiếp nhận">{formatDate(request.receivedDate)}</Descriptions.Item>
          <Descriptions.Item label="Người tiếp nhận">{request.receivedBy}</Descriptions.Item>
          <Descriptions.Item label="Độ ưu tiên">
            <Tag color={prioCfg.color}>{prioCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phân loại sửa chữa">
            <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Lý do phân loại" span={2}>{request.classificationReason}</Descriptions.Item>
          <Descriptions.Item label="Tình trạng ban đầu" span={2}>{request.initialCondition}</Descriptions.Item>
          <Descriptions.Item label="Triệu chứng" span={2}>
            <Space wrap>
              {request.symptoms.map((s, i) => <Tag key={i} color="blue">{s}</Tag>)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>{request.notes || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Kết quả chẩn đoán */}
      {diagnostic && (
        <Card className="detail-section-card" style={{ marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14,
              }}>
                <RadarChartOutlined />
              </div>
              <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Kết quả chẩn đoán</span>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
            <Descriptions.Item label="Chẩn đoán" span={2}>{diagnostic.diagnosis}</Descriptions.Item>
            <Descriptions.Item label="Nguyên nhân gốc" span={2}>{diagnostic.rootCause}</Descriptions.Item>
            <Descriptions.Item label="Linh kiện ảnh hưởng" span={2}>
              <Space wrap>
                {diagnostic.affectedComponents.map((c, i) => <Tag key={i} color="orange">{c}</Tag>)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Mức độ">
              <Tag color={
                diagnostic.severity === 'critical' ? 'red'
                  : diagnostic.severity === 'major' ? 'orange'
                  : diagnostic.severity === 'moderate' ? 'blue' : 'green'
              }>
                {diagnostic.severity === 'critical' ? 'Nghiêm trọng'
                  : diagnostic.severity === 'major' ? 'Lớn'
                  : diagnostic.severity === 'moderate' ? 'Trung bình' : 'Nhẹ'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phương án xử lý">
              {(() => {
                const cfg = repairMethodConfig[diagnostic.recommendedAction];
                return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : diagnostic.recommendedAction;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày chẩn đoán">{formatDate(diagnostic.diagnosedDate)}</Descriptions.Item>
            <Descriptions.Item label="Người chẩn đoán">{diagnostic.diagnosedBy}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>{diagnostic.notes || '—'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

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
            <Descriptions.Item label="Mã lệnh">
              <a onClick={() => navigate(`/work-orders/${relatedWO.id}`)}
                style={{ fontWeight: 700, color: colors.navy, cursor: 'pointer' }}>
                {relatedWO.code}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={
                relatedWO.status === 'in_progress' ? 'processing'
                  : relatedWO.status === 'handed_over' || relatedWO.status === 'closed' ? 'success'
                  : relatedWO.status === 'pending_approval' ? 'warning' : 'default'
              }>
                {relatedWO.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổ sửa chữa">{relatedWO.assignedTeam}</Descriptions.Item>
            <Descriptions.Item label="Phương pháp">
              {(() => {
                const cfg = repairMethodConfig[relatedWO.repairMethod];
                return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : relatedWO.repairMethod;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Tiến độ">
              <span style={{ fontWeight: 600 }}>{relatedWO.progress}%</span>
            </Descriptions.Item>
            <Descriptions.Item label="Dự toán">
              <span style={{ fontWeight: 600 }}>{relatedWO.estimatedCost} tr</span>
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" icon={<ArrowRightOutlined />}
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

export default RepairReceptionDetail;
