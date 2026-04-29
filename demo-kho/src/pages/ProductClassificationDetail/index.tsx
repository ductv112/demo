import React, { useState } from 'react';
import {
  Card, Tabs, Tag, Button, Space, Row, Col, Typography, Descriptions, Timeline,
  Table, Switch, App, Divider, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SendOutlined, CheckCircleOutlined,
  CloseCircleOutlined, RollbackOutlined, TagsOutlined, SafetyOutlined,
  BarChartOutlined, AuditOutlined, UserOutlined, CalendarOutlined,
  FileTextOutlined, ToolOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { productClassifications } from '../../data/productClassifications';
import { products } from '../../data/products';
import {
  classificationStatusConfig, productTypeConfig, trackingTypeConfig,
  formatDateTime, formatDate,
} from '../../utils/format';
import type { ClassificationAuditEntry } from '../../types';

const { Title, Text } = Typography;

// ─── Action label map ─────────────────────────────────────
const actionLabelMap: Record<string, { label: string; color: string }> = {
  created:          { label: 'Tạo hồ sơ',         color: '#1890ff' },
  submitted:        { label: 'Gửi phê duyệt',      color: '#faad14' },
  approved:         { label: 'Phê duyệt',           color: '#52c41a' },
  rejected:         { label: 'Từ chối',             color: '#ff4d4f' },
  returned_for_edit:{ label: 'Trả về sửa',         color: '#fa8c16' },
  applied:          { label: 'Áp dụng vào hệ thống', color: '#13c2c2' },
  updated:          { label: 'Cập nhật',            color: '#722ed1' },
};

// ─── Attribute row ────────────────────────────────────────
const AttrRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #f5f5f5',
  }}>
    <Text style={{ fontSize: 13, color: '#595959' }}>{label}</Text>
    <div>{value}</div>
  </div>
);

// ─── Section header ───────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; gradient: string }> = ({ icon, title, gradient }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 7,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 13, flexShrink: 0,
    }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{title}</Text>
  </div>
);

const ProductClassificationDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { modal, message } = App.useApp();
  const [activeTab, setActiveTab] = useState('info');

  const record = productClassifications.find(r => r.id === id);
  const product = record ? products.find(p => p.id === record.productId) : null;

  if (!record) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Text type="secondary">Không tìm thấy hồ sơ phân loại.</Text>
        <br /><br />
        <Button onClick={() => navigate('/product-classifications')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const statusCfg = classificationStatusConfig[record.classificationStatus];
  const typeCfg = productTypeConfig[record.productType];
  const trackCfg = trackingTypeConfig[record.trackingType];

  // ─── Action handlers ──────────────────────────────────────
  const handleSubmit = () => {
    modal.confirm({
      title: 'Gửi phê duyệt',
      content: 'Xác nhận gửi hồ sơ phân loại này lên Ban Giám đốc phê duyệt?',
      okText: 'Gửi',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: () => {
        message.success('Đã gửi phê duyệt');
        navigate('/product-classifications');
      },
    });
  };

  const handleApprove = () => {
    modal.confirm({
      title: 'Phê duyệt phân loại',
      content: 'Xác nhận phê duyệt hồ sơ phân loại này? Sau khi phê duyệt, hệ thống sẽ tự động áp dụng vào danh mục vật tư.',
      okText: 'Phê duyệt',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: () => {
        message.success('Đã phê duyệt — hệ thống đang áp dụng');
        navigate('/product-classifications');
      },
    });
  };

  const handleReject = () => {
    modal.confirm({
      title: 'Từ chối phân loại',
      content: 'Xác nhận từ chối hồ sơ này? Người tạo sẽ được thông báo.',
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        message.info('Đã từ chối hồ sơ');
        navigate('/product-classifications');
      },
    });
  };

  const handleReturn = () => {
    modal.confirm({
      title: 'Trả về để sửa',
      content: 'Hồ sơ sẽ được trả về cho người tạo để bổ sung/chỉnh sửa thông tin.',
      okText: 'Trả về',
      okType: 'default',
      cancelText: 'Hủy',
      onOk: () => {
        message.info('Đã trả về hồ sơ');
        navigate('/product-classifications');
      },
    });
  };

  // ─── Audit log columns ────────────────────────────────────
  const auditCols: ColumnsType<ClassificationAuditEntry> = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDateTime(v)}</Text>,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      render: (v: string) => {
        const cfg = actionLabelMap[v] || { label: v, color: 'default' };
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'actor',
      key: 'actor',
      render: (v: string, row: ClassificationAuditEntry) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{row.actorRole}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 240,
      render: (_: unknown, row: ClassificationAuditEntry) => (
        <Space size={4}>
          {row.fromStatus && (
            <>
              <Tag style={{ fontSize: 10 }}>{classificationStatusConfig[row.fromStatus]?.label}</Tag>
              <span style={{ color: '#8c8c8c', fontSize: 10 }}>→</span>
            </>
          )}
          {row.toStatus && (
            <Tag color={classificationStatusConfig[row.toStatus]?.color} style={{ fontSize: 10 }}>
              {classificationStatusConfig[row.toStatus]?.label}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (v: string) => v ? <Text style={{ fontSize: 12, color: '#595959' }}>{v}</Text> : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
  ];

  // ─── Render action buttons by status ─────────────────────
  const renderActions = () => {
    const s = record.classificationStatus;
    return (
      <Space>
        {(s === 'draft' || s === 'returned_for_edit') && (
          <>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/product-classifications/${record.id}/edit`)}
            >
              Chỉnh sửa
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              style={{ background: '#1B3A5C', border: 'none' }}
            >
              Gửi phê duyệt
            </Button>
          </>
        )}
        {s === 'pending_approval' && (
          <>
            <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>Từ chối</Button>
            <Button icon={<RollbackOutlined />} onClick={handleReturn}>Trả về sửa</Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              style={{ background: '#52c41a', border: 'none' }}
            >
              Phê duyệt
            </Button>
          </>
        )}
      </Space>
    );
  };

  return (
    <div>
      {/* ─── Banner ──────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/product-classifications')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
          />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 3 }}>
              {record.code} · v{record.version}
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
              {record.productName}
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={statusCfg.color} style={{ fontSize: 11, margin: 0 }}>{statusCfg.label}</Tag>
              <Tag color={typeCfg.color} style={{ fontSize: 11, margin: 0 }}>{typeCfg.label}</Tag>
              <Tag color={trackCfg.color} style={{ fontSize: 11, margin: 0 }}>{trackCfg.label}</Tag>
              {record.militaryGrade && <Tag color="#D4A843" style={{ fontSize: 11, margin: 0, color: '#0a1628' }}>Doanh nghiệp</Tag>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {renderActions()}
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Cập nhật: {formatDate(record.updatedAt)}
          </Text>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────── */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginBottom: 0 }}
        items={[
          {
            key: 'info',
            label: (
              <span>
                <TagsOutlined style={{ marginRight: 6 }} />
                Thông tin phân loại
              </span>
            ),
            children: (
              <Row gutter={16}>
                {/* Left column */}
                <Col span={16}>
                  {/* Loại vật tư */}
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <SectionHeader
                      icon={<TagsOutlined />}
                      title="Loại vật tư & Phương thức theo dõi"
                      gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
                    />
                    <Row gutter={[16, 0]}>
                      <Col span={8}>
                        <AttrRow
                          label="Loại vật tư"
                          value={<Tag color={typeCfg.color}>{typeCfg.label}</Tag>}
                        />
                      </Col>
                      <Col span={8}>
                        <AttrRow
                          label="Theo dõi"
                          value={<Tag color={trackCfg.color}>{trackCfg.label}</Tag>}
                        />
                      </Col>
                      <Col span={8}>
                        <AttrRow
                          label="Tiêu chuẩn doanh nghiệp"
                          value={<Switch checked={record.militaryGrade} disabled size="small" />}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: '12px 0', borderColor: '#f5f5f5' }} />
                    <div>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Lý do phân loại</Text>
                      <div style={{
                        background: '#f6f8fb', borderRadius: 8, padding: '12px 14px',
                        fontSize: 13, color: '#262626', lineHeight: 1.6,
                      }}>
                        {record.classificationReason}
                      </div>
                    </div>
                  </Card>

                  {/* Thuộc tính theo dõi */}
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <SectionHeader
                      icon={<InfoCircleOutlined />}
                      title="Thuộc tính theo dõi"
                      gradient="linear-gradient(135deg, #0958d9, #1890ff)"
                    />
                    <AttrRow
                      label="Theo dõi hạn sử dụng"
                      value={<Switch checked={record.trackExpiry} disabled size="small" />}
                    />
                    <AttrRow
                      label="Hạn sử dụng"
                      value={record.shelfLife ? <Text strong>{record.shelfLife} ngày</Text> : <Text type="secondary">—</Text>}
                    />
                    <AttrRow
                      label="Linh kiện quan trọng"
                      value={
                        record.criticalPart
                          ? <Tag color="red" style={{ fontSize: 11 }}>Quan trọng</Tag>
                          : <Text type="secondary" style={{ fontSize: 12 }}>Không</Text>
                      }
                    />
                  </Card>

                  {/* QC & Bảo trì */}
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <SectionHeader
                      icon={<SafetyOutlined />}
                      title="Kiểm soát chất lượng & Bảo trì"
                      gradient="linear-gradient(135deg, #389e0d, #52c41a)"
                    />
                    <AttrRow
                      label="QC khi nhập kho"
                      value={
                        <Switch checked={record.qcRequiredOnReceipt} disabled size="small" />
                      }
                    />
                    <AttrRow
                      label="QC khi xuất kho"
                      value={<Switch checked={record.qcRequiredOnDispatch} disabled size="small" />}
                    />
                    <AttrRow
                      label="Yêu cầu bảo trì định kỳ"
                      value={<Switch checked={record.requiresMaintenance} disabled size="small" />}
                    />
                    <AttrRow
                      label="Chu kỳ bảo trì"
                      value={
                        record.maintenanceIntervalDays
                          ? <Text strong>{record.maintenanceIntervalDays} ngày</Text>
                          : <Text type="secondary">—</Text>
                      }
                    />
                  </Card>

                  {/* Tham số tồn kho — chuyển về ProductDetail */}
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #d9f0ff', background: '#f0f9ff' }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <BarChartOutlined style={{ color: '#1890ff', fontSize: 16, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0958d9', marginBottom: 4 }}>
                          Tham số tồn kho được quản lý riêng
                        </div>
                        <div style={{ fontSize: 11, color: '#4a6fa5', lineHeight: 1.6 }}>
                          Mức tồn kho tối thiểu, tối đa và điểm đặt hàng lại được quản lý tại tab <strong>"Tham số tồn kho"</strong> trong Danh mục vật tư — yêu cầu phê duyệt Trưởng phòng riêng.
                        </div>
                        {product && (
                          <Button
                            type="link"
                            size="small"
                            style={{ padding: '4px 0', fontSize: 11, height: 'auto', marginTop: 4 }}
                            onClick={() => navigate(`/products/${product.id}?tab=stock-params`)}
                          >
                            Xem tham số tồn kho →
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Right panel */}
                <Col span={8}>
                  {/* Product info */}
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 16 }}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ToolOutlined style={{ color: '#1B3A5C' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>Thông tin vật tư</span>
                      </div>
                    }
                    headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '12px 16px', minHeight: 'auto' }}
                  >
                    <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12, width: 110 }} contentStyle={{ fontSize: 12, fontWeight: 500 }}>
                      <Descriptions.Item label="Mã vật tư">{record.productCode}</Descriptions.Item>
                      <Descriptions.Item label="Tên vật tư">
                        <span style={{ color: '#1B3A5C' }}>{record.productName}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nhóm">{record.productCategory}</Descriptions.Item>
                      {product && (
                        <>
                          <Descriptions.Item label="Đơn vị">{product.baseUnit}</Descriptions.Item>
                          <Descriptions.Item label="Nhà sx">{product.manufacturer || '—'}</Descriptions.Item>
                          <Descriptions.Item label="Thời gian cung ứng">{product.leadTimeDays} ngày</Descriptions.Item>
                        </>
                      )}
                    </Descriptions>
                    <div style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        type="link"
                        style={{ padding: 0, fontSize: 12, color: '#1B3A5C' }}
                        onClick={() => navigate(`/products/${record.productId}`)}
                      >
                        Xem chi tiết vật tư →
                      </Button>
                    </div>
                  </Card>

                  {/* Hồ sơ phân loại */}
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 16 }}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ color: '#1B3A5C' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>Hồ sơ phân loại</span>
                      </div>
                    }
                    headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '12px 16px', minHeight: 'auto' }}
                  >
                    <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12, width: 110 }} contentStyle={{ fontSize: 12 }}>
                      <Descriptions.Item label="Mã hồ sơ">{record.code}</Descriptions.Item>
                      <Descriptions.Item label="Phiên bản">v{record.version}</Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={statusCfg.color} style={{ fontSize: 11 }}>{statusCfg.label}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Người tạo">{record.createdBy}</Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">{formatDate(record.createdAt)}</Descriptions.Item>
                    </Descriptions>
                    {record.note && (
                      <div style={{ marginTop: 10, padding: '8px 10px', background: '#f6f8fb', borderRadius: 8, fontSize: 12, color: '#595959' }}>
                        {record.note}
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'approval',
            label: (
              <span>
                <AuditOutlined style={{ marginRight: 6 }} />
                Phê duyệt & Xác nhận
                {record.classificationStatus === 'pending_approval' && (
                  <Badge dot style={{ marginLeft: 4 }} />
                )}
              </span>
            ),
            children: (
              <Row gutter={16}>
                <Col span={16}>
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <SectionHeader
                      icon={<UserOutlined />}
                      title="Thông tin trình phê duyệt"
                      gradient="linear-gradient(135deg, #faad14, #d48806)"
                    />
                    <Descriptions column={2} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 12, fontWeight: 500 }}>
                      <Descriptions.Item label="Người trình">{record.submittedBy || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Ngày trình">
                        {record.submittedAt ? formatDateTime(record.submittedAt) : '—'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <SectionHeader
                      icon={<CheckCircleOutlined />}
                      title="Kết quả phê duyệt"
                      gradient={
                        record.classificationStatus === 'approved' || record.classificationStatus === 'applied'
                          ? 'linear-gradient(135deg, #389e0d, #52c41a)'
                          : record.classificationStatus === 'rejected'
                            ? 'linear-gradient(135deg, #a8071a, #ff4d4f)'
                            : 'linear-gradient(135deg, #595959, #8c8c8c)'
                      }
                    />
                    {record.approvedBy ? (
                      <Descriptions column={2} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 12, fontWeight: 500 }}>
                        <Descriptions.Item label="Người phê duyệt">{record.approvedBy}</Descriptions.Item>
                        <Descriptions.Item label="Ngày phê duyệt">
                          {record.approvedAt ? formatDateTime(record.approvedAt) : '—'}
                        </Descriptions.Item>
                        {record.approvalNote && (
                          <Descriptions.Item label="Ghi chú" span={2}>
                            <div style={{ padding: '8px 10px', background: '#f6f8fb', borderRadius: 8, color: '#595959' }}>
                              {record.approvalNote}
                            </div>
                          </Descriptions.Item>
                        )}
                        {record.appliedAt && (
                          <Descriptions.Item label="Áp dụng lúc">{formatDateTime(record.appliedAt)}</Descriptions.Item>
                        )}
                      </Descriptions>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
                        <CalendarOutlined style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {record.classificationStatus === 'pending_approval'
                            ? 'Đang chờ Ban Giám đốc phê duyệt'
                            : 'Chưa có thông tin phê duyệt'}
                        </Text>
                      </div>
                    )}
                  </Card>

                  {record.classificationStatus === 'pending_approval' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                      padding: '4px 0',
                    }}>
                      <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>Từ chối</Button>
                      <Button icon={<RollbackOutlined />} onClick={handleReturn}>Trả về sửa</Button>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleApprove}
                        style={{ background: '#52c41a', border: 'none' }}
                      >
                        Phê duyệt
                      </Button>
                    </div>
                  )}
                </Col>

                <Col span={8}>
                  <Card
                    style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                    bodyStyle={{ padding: 16 }}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>Trạng thái hiện tại</span>
                      </div>
                    }
                    headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '12px 16px', minHeight: 'auto' }}
                  >
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Tag
                        color={statusCfg.color}
                        style={{ fontSize: 14, padding: '6px 16px', borderRadius: 20 }}
                      >
                        {statusCfg.label}
                      </Tag>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c', lineHeight: 1.5 }}>
                        {statusCfg.description}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'history',
            label: (
              <span>
                <FileTextOutlined style={{ marginRight: 6 }} />
                Lịch sử thay đổi
              </span>
            ),
            children: (
              <Card
                style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>
                    Nhật ký thao tác
                  </Text>
                  <Tag style={{ fontSize: 12 }}>{record.auditLog.length} bản ghi</Tag>
                </div>

                {/* Timeline view */}
                <Timeline
                  style={{ marginLeft: 8, marginBottom: 24 }}
                  items={[...record.auditLog].reverse().map(entry => {
                    const cfg = actionLabelMap[entry.action] || { label: entry.action, color: 'default' };
                    return {
                      color: cfg.color,
                      children: (
                        <div style={{ paddingBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Tag color={cfg.color} style={{ fontSize: 11, margin: 0 }}>{cfg.label}</Tag>
                            <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{formatDateTime(entry.timestamp)}</Text>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>{entry.actor}</div>
                          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{entry.actorRole}</div>
                          {entry.note && (
                            <div style={{ marginTop: 4, fontSize: 12, color: '#595959', background: '#f6f8fb', padding: '4px 8px', borderRadius: 6 }}>
                              {entry.note}
                            </div>
                          )}
                        </div>
                      ),
                    };
                  })}
                />

                <Divider style={{ borderColor: '#f0f0f0' }}>Bảng chi tiết</Divider>

                <Table<ClassificationAuditEntry>
                  columns={auditCols}
                  dataSource={record.auditLog}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  scroll={{ x: 700 }}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ProductClassificationDetail;
