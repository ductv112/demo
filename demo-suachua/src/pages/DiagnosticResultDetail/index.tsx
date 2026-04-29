import React, { useMemo } from 'react';
import {
  Card, Tag, Row, Col, Descriptions, Space, Button,
  Typography, Breadcrumb, Divider, message,
} from 'antd';
import {
  ArrowLeftOutlined, ExperimentOutlined, CheckCircleOutlined,
  WarningOutlined, FileSearchOutlined, EditOutlined,
  ToolOutlined, InfoCircleOutlined, AlertOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diagnosticResults } from '../../data/diagnosticResults';
import { repairRequests } from '../../data/repairRequests';
import {
  diagnosticStatusConfig, repairMethodConfig, equipmentTypeConfig,
  repairRequestStatusConfig, formatDate,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { DiagnosticStatus } from '../../types';

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
`;

const severityConfig: Record<string, { label: string; color: string }> = {
  minor: { label: 'Nhẹ', color: 'green' },
  moderate: { label: 'Trung bình', color: 'blue' },
  major: { label: 'Lớn', color: 'orange' },
  critical: { label: 'Nghiêm trọng', color: 'red' },
};

const DiagnosticResultDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = useMemo(() => diagnosticResults.find(d => d.id === id), [id]);
  const relatedRequest = useMemo(
    () => record ? repairRequests.find(r => r.id === record.repairRequestId) : null,
    [record],
  );

  if (!record) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Text type="secondary" style={{ fontSize: 16 }}>Không tìm thấy kết quả chẩn đoán</Text>
        <br /><br />
        <Button type="primary" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/diagnostic-results')}
          style={{ background: colors.navy }}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const statusCfg = diagnosticStatusConfig[record.status];
  const sevCfg = severityConfig[record.severity];
  const eqCfg = equipmentTypeConfig[record.equipmentType];
  const actionCfg = repairMethodConfig[record.recommendedAction];
  const hasDiagnosis = record.status !== 'pending';

  return (
    <>
      <style>{pageStyles}</style>

      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <Link to="/">Tổng quan</Link> },
        { title: <Link to="/diagnostic-results">Tiếp nhận kết quả chẩn đoán</Link> },
        { title: record.repairRequestCode },
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
                onClick={() => navigate('/diagnostic-results')}
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
                  <ExperimentOutlined />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    {record.repairRequestCode}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {record.equipmentName} — {record.unitName}
                  </div>
                </div>
              </div>
              <Space size={8}>
                <Tag color={statusCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{statusCfg.label}</Tag>
                <Tag color={sevCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{sevCfg.label}</Tag>
                <Tag color={eqCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{eqCfg.label}</Tag>
                {actionCfg && <Tag color={actionCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>{actionCfg.label}</Tag>}
              </Space>
            </div>

            {/* Action buttons */}
            <Space>
              {record.status === 'received' && (
                <>
                  <Button type="primary" icon={<CheckCircleOutlined />}
                    onClick={() => message.success(`Đã xác nhận kết quả chẩn đoán ${record.repairRequestCode}`)}
                    style={{ background: '#fff', color: colors.navy, fontWeight: 600, border: 'none' }}>
                    Xác nhận kết quả
                  </Button>
                  <Button icon={<WarningOutlined />}
                    onClick={() => message.warning(`Đã yêu cầu chẩn đoán lại ${record.repairRequestCode}`)}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }}>
                    Yêu cầu CĐ lại
                  </Button>
                </>
              )}
              {record.status === 'pending' && (
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: 13 }}>
                  <InfoCircleOutlined style={{ marginRight: 6 }} />
                  Đang chờ kết quả chẩn đoán từ phân hệ Sự cố & Chẩn đoán
                </Text>
              )}
            </Space>
          </div>
        </div>
      </Card>

      {/* Đối chiếu thông tin */}
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
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Đối chiếu thông tin</span>
          </div>
        }
      >
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ background: '#fff7e6', borderRadius: 10, padding: 16, border: '1px solid #ffd591', height: '100%' }}>
              <div style={{ fontWeight: 700, color: '#fa8c16', marginBottom: 12, fontSize: 14 }}>
                <AlertOutlined /> Thông tin ban đầu (Yêu cầu SC)
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Tình trạng ban đầu</div>
                <div style={{ fontSize: 13, color: '#262626' }}>{record.initialCondition}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Triệu chứng</div>
                <Space wrap>
                  {record.symptoms.map((s, i) => <Tag key={i} color="orange">{s}</Tag>)}
                </Space>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ background: '#e6f7ff', borderRadius: 10, padding: 16, border: '1px solid #91d5ff', height: '100%' }}>
              <div style={{ fontWeight: 700, color: '#1890ff', marginBottom: 12, fontSize: 14 }}>
                <ExperimentOutlined /> Kết luận chẩn đoán
              </div>
              {hasDiagnosis ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Chẩn đoán</div>
                    <div style={{ fontSize: 13, color: '#262626' }}>{record.diagnosis}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Nguyên nhân gốc</div>
                    <div style={{ fontSize: 13, color: '#262626' }}>{record.rootCause}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Linh kiện ảnh hưởng</div>
                    <Space wrap>
                      {record.affectedComponents.map((c, i) => <Tag key={i} color="blue">{c}</Tag>)}
                    </Space>
                  </div>
                </>
              ) : (
                <div style={{ color: '#8c8c8c', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
                  Chưa có kết quả chẩn đoán
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Chi tiết kết quả chẩn đoán */}
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
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Chi tiết kết quả chẩn đoán</span>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
          <Descriptions.Item label="Mã yêu cầu">
            <span style={{ fontWeight: 700, color: colors.navy, fontSize: 14 }}>{record.repairRequestCode}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thiết bị">{record.equipmentName}</Descriptions.Item>
          <Descriptions.Item label="Loại thiết bị">
            <Tag color={eqCfg.color}>{eqCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị">{record.unitName}</Descriptions.Item>
          <Descriptions.Item label="Mức độ hư hỏng">
            <Tag color={sevCfg.color}>{sevCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kết luận chẩn đoán" span={2}>
            {hasDiagnosis ? record.diagnosis : <Text type="secondary" italic>Chưa có</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Nguyên nhân gốc" span={2}>
            {hasDiagnosis ? record.rootCause : <Text type="secondary" italic>Chưa có</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Linh kiện ảnh hưởng" span={2}>
            {record.affectedComponents.length > 0 ? (
              <Space wrap>
                {record.affectedComponents.map((c, i) => <Tag key={i} color="orange">{c}</Tag>)}
              </Space>
            ) : (
              <Text type="secondary" italic>Chưa có</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Phương án xử lý đề xuất">
            {actionCfg ? <Tag color={actionCfg.color}>{actionCfg.label}</Tag> : record.recommendedAction}
          </Descriptions.Item>
          <Descriptions.Item label="Người chẩn đoán">
            {record.diagnosedBy || <Text type="secondary" italic>Chưa có</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày chẩn đoán">
            {record.diagnosedDate ? formatDate(record.diagnosedDate) : <Text type="secondary" italic>Chưa có</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Người xác nhận">
            {record.confirmedBy || <Text type="secondary" italic>Chưa xác nhận</Text>}
          </Descriptions.Item>
          {record.confirmedDate && (
            <Descriptions.Item label="Ngày xác nhận">
              {formatDate(record.confirmedDate)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ghi chú" span={2}>{record.notes || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Yêu cầu sửa chữa liên quan */}
      {relatedRequest && (
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
              <span style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Yêu cầu sửa chữa liên quan</span>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
            <Descriptions.Item label="Mã yêu cầu">
              <a onClick={() => navigate(`/repair-reception/${relatedRequest.id}`)}
                style={{ fontWeight: 700, color: colors.navy, cursor: 'pointer' }}>
                {relatedRequest.code}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={repairRequestStatusConfig[relatedRequest.status].color}>
                {repairRequestStatusConfig[relatedRequest.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thiết bị">{relatedRequest.equipmentName}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị">{relatedRequest.unitName}</Descriptions.Item>
            <Descriptions.Item label="Ngày tiếp nhận">{formatDate(relatedRequest.receivedDate)}</Descriptions.Item>
            <Descriptions.Item label="Người tiếp nhận">{relatedRequest.receivedBy}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </>
  );
};

export default DiagnosticResultDetail;
