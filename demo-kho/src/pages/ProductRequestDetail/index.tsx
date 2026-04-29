import React, { useMemo } from 'react';
import {
  Card, Row, Col, Space, Typography, Tag, Button, Descriptions,
  Timeline, Alert, Table, Divider, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, CheckCircleOutlined,
  WarningOutlined, ClockCircleOutlined, UserOutlined,
  FileTextOutlined, SearchOutlined, SyncOutlined, TagsOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { productRequests } from '../../data/productRequests';
import { productClassifications } from '../../data/productClassifications';
import type { AuditLogEntry, DuplicateCandidate } from '../../types';
import { requestStatusConfig, formatDateTime, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

// Returns a colored step icon for timeline
const getTimelineColor = (action: string): string => {
  if (action.includes('Từ chối')) return '#ff4d4f';
  if (action.includes('Phê duyệt') || action.includes('Ban hành') || action.includes('Xác nhận')) return '#52c41a';
  if (action.includes('trùng') || action.includes('Trùng')) return '#faad14';
  return '#1B3A5C';
};

const dupColumns: ColumnsType<DuplicateCandidate> = [
  {
    title: 'Mã SP',
    dataIndex: 'productCode',
    key: 'productCode',
    width: 120,
    render: (code: string) => (
      <Text style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>
        {code}
      </Text>
    ),
  },
  {
    title: 'Tên sản phẩm hiện có',
    dataIndex: 'productName',
    key: 'productName',
    render: (name: string, rec: DuplicateCandidate) => (
      <Space direction="vertical" size={0}>
        <Text style={{ fontSize: 13 }}>{name}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{rec.category}</Text>
      </Space>
    ),
  },
  {
    title: 'Độ tương đồng',
    dataIndex: 'similarity',
    key: 'similarity',
    width: 120,
    render: (val: number) => (
      <Tag color={val >= 80 ? 'error' : 'warning'} style={{ fontWeight: 700 }}>
        {val}%
      </Tag>
    ),
  },
  {
    title: 'Lý do',
    dataIndex: 'matchReason',
    key: 'matchReason',
    render: (reason: string) => (
      <Text type="secondary" style={{ fontSize: 12 }}>{reason}</Text>
    ),
  },
];

const ProductRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const request = useMemo(
    () => productRequests.find((r) => r.id === id),
    [id]
  );

  if (!request) {
    return (
      <Card style={{ borderRadius: 14, border: 'none' }}>
        <Alert
          type="error"
          message="Không tìm thấy yêu cầu"
          description="Yêu cầu không tồn tại hoặc đã bị xóa."
          showIcon
          action={
            <Button onClick={() => navigate('/product-requests')} type="primary">
              Quay lại
            </Button>
          }
        />
      </Card>
    );
  }

  const statusCfg = requestStatusConfig[request.status];

  // Progress percentage by status
  const progressMap: Record<string, number> = {
    draft: 5, submitted: 20, checking_duplicate: 30, duplicate_found: 30,
    unique_confirmed: 40, pending_normalization: 55, pending_approval: 70,
    approved: 85, initializing: 90, initialized: 95, published: 100,
    rejected: 100, returned_for_edit: 25, closed_duplicate: 100,
  };
  const progress = progressMap[request.status] ?? 0;

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Header Banner ────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
        }}
      >
        <Row justify="space-between" align="middle" wrap={false}>
          <Col>
            <Space size={12} align="center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/product-requests')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AuditOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <div>
                <Space align="center" size={10}>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>
                    {request.requestCode}
                  </Title>
                  <Tag
                    color={statusCfg.color}
                    style={{ borderRadius: 4, fontSize: 12, fontWeight: 600 }}
                  >
                    {statusCfg.label}
                  </Tag>
                </Space>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  {request.requestedName}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            {/* Progress circle */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `conic-gradient(#D4A843 ${progress * 3.6}deg, rgba(255,255,255,0.2) 0)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'rgba(27,58,92,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                    {progress}%
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ─── Phân loại CTA (chỉ hiện khi published & chưa có phân loại) ── */}
      {request.status === 'published' && (() => {
        const hasClassification = request.productMasterId
          ? productClassifications.some(r => r.productId === request.productMasterId)
          : false;
        if (hasClassification) {
          return (
            <div style={{
              background: '#f6ffed', border: '1px solid #b7eb8f',
              borderRadius: 10, padding: '12px 18px', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                <Text style={{ fontSize: 13, color: '#389e0d' }}>
                  Vật tư đã được phân loại và áp dụng thuộc tính quản lý.
                </Text>
              </Space>
              <Button
                size="small"
                icon={<TagsOutlined />}
                onClick={() => navigate('/product-classifications')}
                style={{ borderColor: '#52c41a', color: '#52c41a' }}
              >
                Xem phân loại
              </Button>
            </div>
          );
        }
        return (
          <div style={{
            background: 'linear-gradient(135deg, #fff7e6, #fffbe6)',
            border: '1px solid #ffd591',
            borderRadius: 10, padding: '14px 18px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Space>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #d48806, #faad14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <TagsOutlined style={{ color: '#fff', fontSize: 15 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 13, color: '#7c4c00', display: 'block' }}>
                  Vật tư mới cần được phân loại
                </Text>
                <Text style={{ fontSize: 12, color: '#ad6800' }}>
                  Sản phẩm đã ban hành nhưng chưa có hồ sơ phân loại thuộc tính quản lý kho.
                </Text>
              </div>
            </Space>
            <Button
              type="primary"
              icon={<TagsOutlined />}
              onClick={() => navigate(
                request.productMasterId
                  ? `/product-classifications/new?productId=${request.productMasterId}`
                  : '/product-classifications/new'
              )}
              style={{ background: '#d48806', border: 'none', fontWeight: 500, flexShrink: 0 }}
            >
              Tạo phân loại
            </Button>
          </div>
        );
      })()}

      <Row gutter={[20, 20]}>
        {/* ─── Left Column ─────────────────────────────────────── */}
        <Col xs={24} lg={16}>
          {/* Alert for duplicate_found */}
          {request.status === 'duplicate_found' && request.duplicateCandidates && (
            <Alert
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              style={{ borderRadius: 10, marginBottom: 16 }}
              message={
                <Text strong>Phát hiện sản phẩm tương tự trong hệ thống</Text>
              }
              description={
                <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13 }}>{request.duplicateCheckNote}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Vui lòng xem xét danh sách bên dưới và quyết định: dùng sản phẩm hiện có hoặc xác nhận đây là sản phẩm mới cần bổ sung.
                  </Text>
                </Space>
              }
            />
          )}

          {/* Alert for rejected */}
          {request.status === 'rejected' && (
            <Alert
              type="error"
              showIcon
              style={{ borderRadius: 10, marginBottom: 16 }}
              message={<Text strong>Yêu cầu bị từ chối</Text>}
              description={request.rejectionReason}
            />
          )}

          {/* Thông tin yêu cầu gốc */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <Space align="center" size={10} style={{ marginBottom: 16 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                Thông tin yêu cầu gốc
              </Text>
            </Space>

            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered={false}>
              <Descriptions.Item
                label={<Text type="secondary" style={{ fontSize: 13 }}>Tên vật tư</Text>}
                span={2}
              >
                <Text strong style={{ fontSize: 14 }}>{request.requestedName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 13 }}>Danh mục</Text>}>
                <Text style={{ fontSize: 13 }}>{request.requestedCategory}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 13 }}>Loại</Text>}>
                <Tag color="blue" style={{ fontSize: 12 }}>
                  {request.requestedType === 'spare_part' ? 'Linh kiện thay thế'
                    : request.requestedType === 'consumable' ? 'Vật tư tiêu hao' : 'Thiết bị'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 13 }}>Đơn vị tính</Text>}>
                <Text style={{ fontSize: 13 }}>{request.requestedUnit}</Text>
              </Descriptions.Item>
              {request.estimatedQty !== undefined && (
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 13 }}>Số lượng ước tính</Text>}>
                  <Text strong style={{ fontSize: 13 }}>
                    {request.estimatedQty} {request.requestedUnit}
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={<Text type="secondary" style={{ fontSize: 13 }}>Mục đích sử dụng</Text>}
                span={2}
              >
                <Text style={{ fontSize: 13 }}>{request.purpose}</Text>
              </Descriptions.Item>
              {request.specifications && (
                <Descriptions.Item
                  label={<Text type="secondary" style={{ fontSize: 13 }}>Thông số kỹ thuật</Text>}
                  span={2}
                >
                  <Text style={{ fontSize: 13 }}>{request.specifications}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Kết quả trùng lặp */}
          {request.duplicateCandidates && request.duplicateCandidates.length > 0 && (
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <Space align="center" size={10} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: 'linear-gradient(135deg, #d48806, #faad14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  Kết quả kiểm tra trùng lặp
                </Text>
                <Badge count={request.duplicateCandidates.length} style={{ backgroundColor: '#faad14' }} />
              </Space>
              <Table
                columns={dupColumns}
                dataSource={request.duplicateCandidates}
                rowKey="productId"
                pagination={false}
                size="small"
              />
              {request.status === 'duplicate_found' && (
                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Button
                    style={{ borderColor: '#52c41a', color: '#52c41a', borderRadius: 8 }}
                    icon={<CheckCircleOutlined />}
                  >
                    Dùng sản phẩm hiện có
                  </Button>
                  <Button
                    type="primary"
                    style={{
                      background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                      borderRadius: 8,
                    }}
                  >
                    Xác nhận đây là sản phẩm mới
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Thông tin sau chuẩn hóa */}
          {request.normalizedName && (
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <Space align="center" size={10} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: 'linear-gradient(135deg, #531dab, #722ed1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SyncOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  Thông tin sau chuẩn hóa (P.KT)
                </Text>
              </Space>

              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Tên chuẩn hóa" span={2}>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>
                    {request.normalizedName}
                  </Text>
                </Descriptions.Item>
                {request.assignedCode && (
                  <Descriptions.Item label="Mã vật tư dự kiến">
                    <Tag
                      color="#1B3A5C"
                      style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}
                    >
                      {request.assignedCode}
                    </Tag>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Danh mục chuẩn hóa">
                  <Text style={{ fontSize: 13 }}>{request.normalizedCategory}</Text>
                </Descriptions.Item>
                {request.normalizationNote && (
                  <Descriptions.Item label="Ghi chú chuẩn hóa" span={2}>
                    <Text style={{ fontSize: 13 }}>{request.normalizationNote}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* Kết quả phê duyệt */}
          {(request.approvedBy || request.rejectionReason) && (
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <Space align="center" size={10} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: request.status === 'rejected'
                      ? 'linear-gradient(135deg, #a8071a, #ff4d4f)'
                      : 'linear-gradient(135deg, #237804, #52c41a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  Kết quả phê duyệt
                </Text>
              </Space>

              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                {request.approvedBy && (
                  <Descriptions.Item label="Người phê duyệt">
                    <Text style={{ fontSize: 13 }}>{request.approvedBy}</Text>
                  </Descriptions.Item>
                )}
                {request.approvedAt && (
                  <Descriptions.Item label="Ngày phê duyệt">
                    <Text style={{ fontSize: 13 }}>{formatDateTime(request.approvedAt)}</Text>
                  </Descriptions.Item>
                )}
                {request.approvalNote && (
                  <Descriptions.Item label="Ý kiến phê duyệt" span={2}>
                    <Text style={{ fontSize: 13, color: '#237804' }}>{request.approvalNote}</Text>
                  </Descriptions.Item>
                )}
                {request.rejectionReason && (
                  <Descriptions.Item label="Lý do từ chối" span={2}>
                    <Text style={{ fontSize: 13, color: '#a8071a' }}>{request.rejectionReason}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* ─── Right Column ─────────────────────────────────────── */}
        <Col xs={24} lg={8}>
          {/* Thông tin yêu cầu */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            bodyStyle={{ padding: '18px 20px' }}
          >
            <Text strong style={{ fontSize: 14, color: '#1B3A5C', display: 'block', marginBottom: 14 }}>
              Thông tin chung
            </Text>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái</Text>
                <Tag color={statusCfg.color} style={{ borderRadius: 4, fontWeight: 600 }}>
                  {statusCfg.label}
                </Tag>
              </Row>
              <Divider style={{ margin: '4px 0' }} />
              <Row justify="space-between">
                <Text type="secondary" style={{ fontSize: 13 }}>Đơn vị</Text>
                <Text style={{ fontSize: 13, fontWeight: 500 }}>{request.requesterDeptName}</Text>
              </Row>
              <Row justify="space-between">
                <Text type="secondary" style={{ fontSize: 13 }}>Người YC</Text>
                <Text style={{ fontSize: 13 }}>{request.requesterName}</Text>
              </Row>
              <Divider style={{ margin: '4px 0' }} />
              <Row justify="space-between">
                <Text type="secondary" style={{ fontSize: 13 }}>Ngày tạo</Text>
                <Text style={{ fontSize: 13 }}>{formatDate(request.createdAt)}</Text>
              </Row>
              {request.submittedAt && (
                <Row justify="space-between">
                  <Text type="secondary" style={{ fontSize: 13 }}>Ngày nộp</Text>
                  <Text style={{ fontSize: 13 }}>{formatDate(request.submittedAt)}</Text>
                </Row>
              )}
              {request.publishedAt && (
                <Row justify="space-between">
                  <Text type="secondary" style={{ fontSize: 13 }}>Ngày ban hành</Text>
                  <Text style={{ fontSize: 13, color: '#52c41a', fontWeight: 500 }}>
                    {formatDate(request.publishedAt)}
                  </Text>
                </Row>
              )}
              {request.productMasterId && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <Row justify="space-between">
                    <Text type="secondary" style={{ fontSize: 13 }}>Mã sản phẩm</Text>
                    <Text style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1B3A5C' }}>
                      {request.assignedCode}
                    </Text>
                  </Row>
                </>
              )}
            </Space>
          </Card>

          {/* Lịch sử thao tác */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '18px 20px' }}
          >
            <Space align="center" size={8} style={{ marginBottom: 16 }}>
              <ClockCircleOutlined style={{ color: '#1B3A5C' }} />
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>
                Lịch sử thao tác
              </Text>
            </Space>

            <Timeline
              items={[...request.auditLog].reverse().map((entry: AuditLogEntry) => ({
                color: getTimelineColor(entry.action),
                children: (
                  <div style={{ paddingBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{entry.action}</Text>
                    <br />
                    <Space size={6}>
                      <UserOutlined style={{ color: '#999', fontSize: 11 }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {entry.actor}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        ({entry.actorRole})
                      </Text>
                    </Space>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDateTime(entry.timestamp)}
                    </Text>
                    {entry.note && (
                      <div
                        style={{
                          marginTop: 4,
                          padding: '4px 8px',
                          background: '#f8f9fa',
                          borderRadius: 4,
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#666' }}>{entry.note}</Text>
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductRequestDetail;
