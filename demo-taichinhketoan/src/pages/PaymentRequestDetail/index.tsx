import React, { useMemo } from 'react';
import {
  Card, Tag, Button, Space, Row, Col, Typography, message,
  Breadcrumb, Timeline, Alert, Progress,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, FileTextOutlined, FilePdfOutlined,
  FileExcelOutlined, FileWordOutlined, ClockCircleOutlined,
  SendOutlined, EyeOutlined, DollarOutlined, BankOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { paymentRequests } from '../../data/paymentRequests';
import { getDepartmentName } from '../../data/departments';
import { allocations2026 } from '../../data/allocations';
import { alerts } from '../../data/alerts';
import {
  formatCurrency, formatCurrencyFull, formatDate,
  paymentStatusConfig, categoryTypeConfig, getProgressColor,
} from '../../utils/format';
import { tasks2026 } from '../../data/tasks';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { PaymentRequestStatus } from '../../types';

const { Title, Text } = Typography;

const fileIconMap: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
  xlsx: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
  docx: <FileWordOutlined style={{ color: '#1890ff', fontSize: 18 }} />,
};

const statusSteps: Record<PaymentRequestStatus, number> = {
  draft: 0, submitted: 1, reviewing: 2, approved: 3, paid: 4, rejected: -1, returned: -1,
};

const detailStyles = `
  .prd-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .prd-info-cell {
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 10px;
    transition: background 0.2s;
  }
  .prd-info-cell:hover {
    background: #f0f7ff;
  }
  .prd-attach-item {
    transition: background 0.2s;
    border-radius: 8px;
  }
  .prd-attach-item:hover {
    background: #f8fafc;
  }
`;

const PaymentRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDepartment } = useUser();

  const request = useMemo(() => paymentRequests.find(r => r.id === id), [id]);
  const relatedAlerts = useMemo(() => alerts.filter(a => a.relatedEntityId === id), [id]);

  if (!request) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy đề nghị thanh toán</Title>
        <Button type="link" onClick={() => navigate('/payment-requests')}>Quay lại danh sách</Button>
      </Card>
    );
  }

  const statusCfg = paymentStatusConfig[request.status];
  const typeCfg = categoryTypeConfig[request.categoryType];
  const task = tasks2026.find(t => t.id === request.taskId);
  const allocation = allocations2026.find(a => a.id === request.allocationId);
  const canReview = request.status === 'submitted' || request.status === 'reviewing';
  const step = statusSteps[request.status];
  const progressPct = step >= 0 ? Math.round((step / 4) * 100) : 0;

  const paymentMethodLabel: Record<string, string> = {
    transfer: 'Chuyển khoản', advance: 'Tạm ứng', direct: 'Trực tiếp',
  };

  const timelineItems = [
    {
      color: 'green' as const,
      dot: <ClockCircleOutlined style={{ fontSize: 14 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Tạo đề nghị</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(request.createdAt)} — {request.createdBy}</Text></div>
        </div>
      ),
    },
    ...(request.submittedAt ? [{
      color: 'blue' as const,
      dot: <SendOutlined style={{ fontSize: 14 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Gửi duyệt</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(request.submittedAt)}</Text></div>
        </div>
      ),
    }] : []),
    ...(request.reviewedBy && request.status === 'reviewing' ? [{
      color: 'orange' as const,
      dot: <EyeOutlined style={{ fontSize: 14 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Đang xem xét</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>Người xem xét: {request.reviewedBy}</Text></div>
        </div>
      ),
    }] : []),
    ...(request.reviewedAt ? [{
      color: (request.status === 'approved' || request.status === 'paid' ? 'green' : 'red') as 'green' | 'red',
      dot: request.status === 'rejected' ? <CloseCircleOutlined style={{ fontSize: 14 }} /> : <CheckCircleOutlined style={{ fontSize: 14 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>{request.status === 'rejected' ? 'Từ chối' : 'Phê duyệt'}</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(request.reviewedAt)} — {request.reviewedBy}</Text></div>
          {request.reviewNote && <div><Text italic style={{ fontSize: 12, color: '#666' }}>"{request.reviewNote}"</Text></div>}
        </div>
      ),
    }] : []),
    ...(request.status === 'paid' ? [{
      color: 'green' as const,
      dot: <DollarOutlined style={{ fontSize: 14 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Đã thanh toán</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>Hoàn tất {formatCurrencyFull(request.amount)}</Text></div>
        </div>
      ),
    }] : []),
  ];

  return (
    <div>
      <style>{detailStyles}</style>

      <Breadcrumb style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/payment-requests">Đề nghị thanh toán</Link> },
          { title: request.code },
        ]}
      />

      {/* Alerts */}
      {relatedAlerts.map(alert => (
        <Alert key={alert.id}
          type={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
          message={alert.title} description={alert.description}
          showIcon closable style={{ marginBottom: 12, borderRadius: 8 }}
        />
      ))}

      {/* Header card with gradient */}
      <Card style={{ marginBottom: 16, borderRadius: 12, border: 'none', overflow: 'hidden', padding: 0 }}
        bodyStyle={{ padding: 0 }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, #2d5a8e 60%, ${colors.navyLight} 100%)`,
          padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 80, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Space>
                <Button type="text" icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/payment-requests')}
                  style={{ color: 'rgba(255,255,255,0.7)' }} />
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{request.code}</Text>
                  <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 2 }}>{request.title}</div>
                </div>
              </Space>
            </div>
            <Tag color={statusCfg.color}
              style={{ fontSize: 14, padding: '4px 14px', borderRadius: 6, fontWeight: 500 }}>
              {statusCfg.label}
            </Tag>
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ color: '#fff', fontSize: 34, fontWeight: 700, lineHeight: '38px' }}>
                {formatCurrency(request.amount)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                {formatCurrencyFull(request.amount)}
              </div>
            </div>
          </div>

          {/* Status progress */}
          {step >= 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.15)' }}>
                <div style={{
                  width: `${progressPct}%`, height: '100%',
                  background: 'linear-gradient(90deg, #34d399, #fbbf24, #60a5fa)',
                  borderRadius: 2, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {['Tạo', 'Gửi', 'Xem xét', 'Duyệt', 'Thanh toán'].map((label, i) => (
                  <Text key={label} style={{
                    fontSize: 10, color: i <= step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                    fontWeight: i === step ? 600 : 400,
                  }}>{label}</Text>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Row gutter={16}>
        {/* Left column */}
        <Col xs={24} lg={16}>
          {/* Info grid */}
          <Card style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={<Text strong style={{ fontSize: 14 }}>Thông tin chi tiết</Text>}>
            <div className="prd-info-grid">
              <div className="prd-info-cell">
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phòng ban</Text>
                <Text strong style={{ fontSize: 13 }}>{getDepartmentName(request.departmentId)}</Text>
              </div>
              <div className="prd-info-cell">
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Loại hạng mục</Text>
                <Tag color={typeCfg.color} style={{ margin: '2px 0 0', fontSize: 11 }}>{typeCfg.label}</Tag>
              </div>
              <div className="prd-info-cell">
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Nhiệm vụ</Text>
                <Text strong style={{ fontSize: 12 }}>{task?.name || '—'}</Text>
              </div>
              <div className="prd-info-cell">
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phương thức TT</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {request.paymentMethod ? paymentMethodLabel[request.paymentMethod] : '—'}
                </Text>
              </div>
              {request.vendor && (
                <div className="prd-info-cell">
                  <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Nhà cung cấp</Text>
                  <Text strong style={{ fontSize: 12 }}>{request.vendor}</Text>
                </div>
              )}
              {request.contractNo && (
                <div className="prd-info-cell">
                  <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Số hợp đồng</Text>
                  <Text strong style={{ fontSize: 13 }}>{request.contractNo}</Text>
                </div>
              )}
              <div className="prd-info-cell">
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Người tạo</Text>
                <Text strong style={{ fontSize: 13 }}>{request.createdBy}</Text>
              </div>
              <div className="prd-info-cell">
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Ngày tạo</Text>
                <Text strong style={{ fontSize: 13 }}>{formatDate(request.createdAt)}</Text>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div style={{
                padding: '14px 16px', background: '#f0f7ff', borderRadius: 10, marginTop: 16,
                borderLeft: `3px solid ${colors.navy}`,
              }}>
                <Text style={{ fontSize: 10, color: '#999', display: 'block', marginBottom: 4 }}>Mô tả chi tiết</Text>
                <Text style={{ fontSize: 13 }}>{request.description}</Text>
              </div>
            )}
          </Card>

          {/* Allocation info */}
          {allocation && (
            <Card style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              title={<Space><BankOutlined style={{ color: colors.navy }} /><Text strong style={{ fontSize: 14 }}>Ngân sách phân bổ</Text></Space>}>
              <Row gutter={12}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '10px 0', background: '#f0f7ff', borderRadius: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 700, color: colors.navy, display: 'block' }}>
                      {formatCurrency(allocation.totalAllocated)}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>Tổng phân bổ</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '10px 0', background: '#f0fdf4', borderRadius: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 700, color: '#059669', display: 'block' }}>
                      {formatCurrency(allocation.spent)}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>Đã chi</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '10px 0', background: '#fff7e6', borderRadius: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 700, color: '#d97706', display: 'block' }}>
                      {formatCurrency(allocation.remaining)}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>Còn lại</Text>
                  </div>
                </Col>
              </Row>
              <Progress
                percent={allocation.totalAllocated > 0 ? Math.round((allocation.spent / allocation.totalAllocated) * 100) : 0}
                strokeColor={getProgressColor(allocation.totalAllocated > 0 ? Math.round((allocation.spent / allocation.totalAllocated) * 100) : 0)}
                size="small" style={{ marginTop: 12 }}
              />
            </Card>
          )}

          {/* Attachments */}
          <Card style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={<Text strong style={{ fontSize: 14 }}>Tài liệu đính kèm ({request.attachments.length})</Text>}>
            {request.attachments.length === 0 ? (
              <Text type="secondary">Chưa có tài liệu đính kèm</Text>
            ) : (
              <div>
                {request.attachments.map(att => (
                  <div key={att.id} className="prd-attach-item"
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '10px 12px', gap: 12, borderBottom: '1px solid #f5f5f5',
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, background: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {fileIconMap[att.type] || <FileTextOutlined style={{ fontSize: 18, color: '#999' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 13 }}>{att.name}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {att.size} · Tải lên: {formatDate(att.uploadedAt)}
                        </Text>
                      </div>
                    </div>
                    <Button type="link" size="small">Tải xuống</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Review section */}
          {canReview && !isDepartment && (
            <Card style={{ marginBottom: 16, borderRadius: 12, border: '1px dashed #d9d9d9' }}
              title={<Text strong style={{ fontSize: 14 }}>Phê duyệt đề nghị</Text>}>
              <Alert
                message="Đề nghị thanh toán này đang chờ phê duyệt"
                description="Vui lòng kiểm tra đầy đủ hồ sơ trước khi phê duyệt hoặc từ chối."
                type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
              />
              <Space>
                <Button type="primary" icon={<CheckCircleOutlined />}
                  onClick={() => message.success('Đã phê duyệt đề nghị thanh toán!')}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                  Phê duyệt
                </Button>
                <Button danger icon={<CloseCircleOutlined />}
                  onClick={() => message.warning('Đã từ chối đề nghị thanh toán.')}>
                  Từ chối
                </Button>
                <Button icon={<ExclamationCircleOutlined />}
                  onClick={() => message.info('Đã yêu cầu bổ sung hồ sơ.')}>
                  Yêu cầu bổ sung
                </Button>
              </Space>
            </Card>
          )}
        </Col>

        {/* Right column: Timeline */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={<Text strong style={{ fontSize: 14 }}>Lịch sử xử lý</Text>}>
            <Timeline items={timelineItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentRequestDetailPage;
