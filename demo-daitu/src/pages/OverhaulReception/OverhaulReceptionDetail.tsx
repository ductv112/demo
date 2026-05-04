import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Typography, Tag, Button, Space, Descriptions, Divider, Timeline,
  Alert, List, Row, Col, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, FileSearchOutlined, CheckCircleOutlined, ExperimentOutlined,
  FileTextOutlined, ToolOutlined, SolutionOutlined, LinkOutlined,
  ClockCircleOutlined, ApartmentOutlined, FileDoneOutlined, CalendarOutlined,
  UserOutlined, TeamOutlined, RadarChartOutlined, BranchesOutlined,
} from '@ant-design/icons';
import { overhaulReceptions } from '../../data/overhaulReceptions';
import { receptionStatusConfig, wearLevelConfig, formatDate, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

const overhaulTypeLabel: Record<string, string> = {
  scheduled: 'Theo chu kỳ',
  condition_based: 'Theo tình trạng',
  priority: 'Ưu tiên / Khẩn cấp',
};
const overhaulTypeColor: Record<string, string> = {
  scheduled: 'blue',
  condition_based: 'orange',
  priority: 'red',
};
const overhaulTypeDesc: Record<string, string> = {
  scheduled: 'Đại tu theo chu kỳ định kỳ quy định',
  condition_based: 'Đại tu dựa trên đánh giá thực trạng kỹ thuật',
  priority: 'Đại tu khẩn cấp theo yêu cầu nhiệm vụ',
};

const wearLevelDesc: Record<string, string> = {
  low: 'Hao mòn ở mức nhẹ, thiết bị còn trong giới hạn cho phép',
  medium: 'Hao mòn ở mức vừa phải, cần can thiệp đại tu',
  high: 'Hao mòn nặng, nhiều cụm vượt ngưỡng kỹ thuật',
  critical: 'Hao mòn nghiêm trọng, thiết bị không còn khả năng vận hành an toàn',
};

// Nút hành động theo trạng thái
const ActionButton: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'pending_reception') {
    return (
      <Button type="primary" icon={<CheckCircleOutlined />} size="large" style={{ background: '#0891b2', borderColor: '#0891b2' }}>
        Xác nhận tiếp nhận
      </Button>
    );
  }
  if (status === 'received') {
    return (
      <Button type="primary" icon={<ExperimentOutlined />} size="large" style={{ background: colors.navy, borderColor: colors.navy }}>
        Bắt đầu kiểm tra
      </Button>
    );
  }
  if (status === 'assessing') {
    return (
      <Button type="primary" icon={<CheckCircleOutlined />} size="large" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
        Hoàn thành đánh giá
      </Button>
    );
  }
  if (status === 'assessed') {
    return (
      <Button type="primary" icon={<SolutionOutlined />} size="large" style={{ background: colors.navy, borderColor: colors.navy }}>
        Chuyển lập kế hoạch
      </Button>
    );
  }
  return (
    <Button disabled size="large" icon={<CheckCircleOutlined />}>
      Đã chuyển lập kế hoạch
    </Button>
  );
};

// Badge số bước
const StepBadge: React.FC<{ step: string | number; done: boolean; active?: boolean }> = ({ step, done, active }) => {
  const bg = done ? '#16a34a' : active ? colors.navy : '#d9d9d9';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 12, fontWeight: 700,
      boxShadow: (done || active) ? `0 2px 8px ${bg}60` : 'none',
    }}>
      {done ? <CheckCircleOutlined style={{ fontSize: 13 }} /> : step}
    </div>
  );
};

// Block hiển thị text dạng trích dẫn
const QuoteBlock: React.FC<{ text: string; color?: string; icon?: React.ReactNode }> = ({ text, color = colors.navy, icon }) => (
  <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 16px', borderLeft: `4px solid ${color}` }}>
    <Space align="start" size={8}>
      {icon && <span style={{ color, flexShrink: 0, marginTop: 2 }}>{icon}</span>}
      <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{text}</Text>
    </Space>
  </div>
);

// Empty state
const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ textAlign: 'center', padding: '20px 0' }}>
    <ClockCircleOutlined style={{ fontSize: 28, color: '#d9d9d9', display: 'block', marginBottom: 8 }} />
    <Text type="secondary" style={{ fontSize: 13 }}>{text}</Text>
  </div>
);

const OverhaulReceptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reception = overhaulReceptions.find(r => r.id === id);

  if (!reception) return <div style={{ padding: 40 }}><Text type="secondary">Không tìm thấy hồ sơ tiếp nhận.</Text></div>;

  const statusCfg = receptionStatusConfig[reception.status];
  const wearCfg = wearLevelConfig[reception.wearLevel];

  const step1Done = ['received', 'assessing', 'assessed', 'pending_plan'].includes(reception.status);
  const step2Active = reception.status === 'received';
  const step2Done = ['assessing', 'assessed', 'pending_plan'].includes(reception.status);
  const step3Active = reception.status === 'assessing';
  const step3Done = ['assessed', 'pending_plan'].includes(reception.status);
  const step45Done = ['assessed', 'pending_plan'].includes(reception.status);
  const step6Done = reception.status === 'pending_plan';

  // Bước hiện tại
  const currentStepMap: Record<string, number> = {
    pending_reception: 1, received: 2, assessing: 3, assessed: 5, pending_plan: 6,
  };
  const currentStep = currentStepMap[reception.status] ?? 1;

  return (
    <div>
      {/* ── Hero banner ── */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between" gutter={16}>
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Space size={12} align="start">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/overhaul-receptions')}
                  style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}
                >
                  Quay lại
                </Button>
                <div>
                  <Space size={8} align="center" style={{ flexWrap: 'wrap' }}>
                    <FileSearchOutlined style={{ color: '#D4A843', fontSize: 16 }} />
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{reception.code} — {reception.equipmentName}</Title>
                    <Tag color={statusCfg?.color}>{statusCfg?.label}</Tag>
                    {reception.overhaulType === 'priority' && <Tag color="error">Ưu tiên</Tag>}
                  </Space>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, display: 'block' }}>
                    Đơn vị gửi: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{reception.sendingUnit}</strong>
                    {' · '}Ngày tiếp nhận: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{formatDate(reception.receivedDate)}</strong>
                    {reception.receivedBy && <> · Người nhận: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{reception.receivedBy}</strong></>}
                  </Text>
                </div>
              </Space>
            </Col>
            <Col style={{ flexShrink: 0 }}>
              <ActionButton status={reception.status} />
            </Col>
          </Row>
        </div>
      </div>

      {/* ── Cảnh báo ── */}
      {reception.notes && (
        <Alert
          message={<Text strong>{reception.overhaulType === 'priority' ? 'Yêu cầu ưu tiên' : 'Lưu ý'}</Text>}
          description={reception.notes}
          type={reception.overhaulType === 'priority' ? 'error' : 'warning'}
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Row gutter={16} align="top">
        {/* ═══ Cột trái: Nội dung 6 bước ═══ */}
        <Col xs={24} lg={17}>

          {/* ── BƯỚC 1: Tiếp nhận thiết bị ── */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px 24px' }}
            title={
              <Space size={10}>
                <StepBadge step={1} done={step1Done} active={!step1Done} />
                <div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Tiếp nhận thiết bị & Hồ sơ kỹ thuật</Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Bước 1</Text>
                </div>
              </Space>
            }
          >
            {/* Thông tin thiết bị */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <Text strong style={{ color: '#555', fontSize: 12, display: 'block', marginBottom: 10 }}>
                <RadarChartOutlined style={{ marginRight: 6 }} />THÔNG TIN THIẾT BỊ
              </Text>
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" labelStyle={{ color: '#888', fontWeight: 500, minWidth: 100 }}>
                <Descriptions.Item label="Tên thiết bị" span={2}>
                  <Text strong style={{ color: colors.navy, fontSize: 13 }}>{reception.equipmentName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  <Text strong>{reception.equipmentModel}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số serial">
                  <Text style={{ fontFamily: 'monospace', fontSize: 12, background: '#f0f4f8', padding: '1px 6px', borderRadius: 4 }}>
                    {reception.equipmentSerial}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị bàn giao">
                  <Space size={4}><TeamOutlined style={{ color: '#888' }} />{reception.sendingUnit}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số giờ hoạt động">
                  <Text strong style={{ color: reception.operatingHours > 15000 ? '#ff4d4f' : colors.navy }}>
                    {reception.operatingHours.toLocaleString('vi-VN')} giờ
                  </Text>
                  {reception.operatingHours > 15000 && <Tag color="error" style={{ marginLeft: 6, fontSize: 10 }}>Vượt chu kỳ</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Thông tin tiếp nhận */}
            <div style={{ background: '#f0f4ff', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <Text strong style={{ color: '#555', fontSize: 12, display: 'block', marginBottom: 10 }}>
                <CalendarOutlined style={{ marginRight: 6 }} />THÔNG TIN TIẾP NHẬN
              </Text>
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" labelStyle={{ color: '#888', fontWeight: 500 }}>
                <Descriptions.Item label="Ngày tiếp nhận">
                  <Text strong>{formatDate(reception.receivedDate)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người tiếp nhận">
                  <Space size={4}>
                    <UserOutlined style={{ color: '#888' }} />
                    {reception.receivedBy ? <Text strong>{reception.receivedBy}</Text> : <Text type="secondary">Chưa cập nhật</Text>}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Loại đại tu">
                  <Tag color={overhaulTypeColor[reception.overhaulType]}>{overhaulTypeLabel[reception.overhaulType]}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Hồ sơ tài liệu */}
            <Divider style={{ margin: '0 0 14px' }} orientation="left" orientationMargin={0}>
              <Space size={6}>
                <FileTextOutlined style={{ color: '#888' }} />
                <Text style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                  Hồ sơ tài liệu đi kèm
                </Text>
                {reception.receivedDocuments && reception.receivedDocuments.length > 0
                  ? <Badge count={reception.receivedDocuments.length} style={{ background: colors.navy }} />
                  : <Tag color="default" style={{ fontSize: 10 }}>Chưa có</Tag>
                }
              </Space>
            </Divider>

            {reception.receivedDocuments && reception.receivedDocuments.length > 0 ? (
              <List
                size="small"
                dataSource={reception.receivedDocuments}
                renderItem={(doc, i) => (
                  <List.Item style={{ padding: '6px 0', borderBottom: i < reception.receivedDocuments!.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Space size={8} style={{ width: '100%' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: colors.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <Text style={{ fontSize: 13, flex: 1 }}>{doc}</Text>
                      <Tag color="success" style={{ fontSize: 10, padding: '0 5px', flexShrink: 0 }}>Đã nhận</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>Chưa ghi nhận danh mục hồ sơ tài liệu đi kèm</Text>
            )}

            {/* Lịch sử bảo trì */}
            {reception.maintenanceHistory && (
              <>
                <Divider style={{ margin: '14px 0 12px' }} orientation="left" orientationMargin={0}>
                  <Text style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Lịch sử vận hành & bảo trì</Text>
                </Divider>
                <QuoteBlock text={reception.maintenanceHistory} color="#7c3aed" icon={<SolutionOutlined />} />
              </>
            )}
          </Card>

          {/* ── BƯỚC 2: Kiểm tra tổng thể ban đầu ── */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px 24px' }}
            title={
              <Space size={10}>
                <StepBadge step={2} done={step2Done} active={step2Active} />
                <div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Kiểm tra tổng thể ban đầu</Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Bước 2</Text>
                </div>
                {reception.initialCheckDate && (
                  <Tag color="default" style={{ fontWeight: 400, fontSize: 11 }}>
                    {formatDate(reception.initialCheckDate)}
                  </Tag>
                )}
              </Space>
            }
            extra={reception.initialCheckBy && (
              <Space size={4}>
                <UserOutlined style={{ color: '#888', fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>KTV: <strong>{reception.initialCheckBy}</strong></Text>
              </Space>
            )}
          >
            {reception.initialCondition ? (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <div style={{ background: '#fffbe6', borderRadius: 8, padding: '14px 18px', borderLeft: '4px solid #faad14' }}>
                  <Text strong style={{ color: '#ad8b00', fontSize: 12, display: 'block', marginBottom: 6 }}>
                    <ToolOutlined style={{ marginRight: 6 }} />TÌNH TRẠNG QUAN SÁT
                  </Text>
                  <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{reception.initialCondition}</Text>
                </div>
                {reception.initialCheckDate && (
                  <Descriptions size="small" column={2} labelStyle={{ color: '#888', fontWeight: 500 }}>
                    <Descriptions.Item label="Ngày kiểm tra">
                      <Text strong>{formatDate(reception.initialCheckDate)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="KTV thực hiện">
                      <Text strong>{reception.initialCheckBy || '—'}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Space>
            ) : (
              <EmptyState text="Chưa thực hiện kiểm tra tổng thể ban đầu" />
            )}
          </Card>

          {/* ── BƯỚC 3: Đánh giá tình trạng kỹ thuật ── */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px 24px' }}
            title={
              <Space size={10}>
                <StepBadge step={3} done={step3Done} active={step3Active} />
                <div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Đánh giá tình trạng kỹ thuật & hao mòn</Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Bước 3</Text>
                </div>
                <Tag color={wearCfg?.color} style={{ fontWeight: 600 }}>{wearCfg?.label}</Tag>
              </Space>
            }
            extra={reception.assessedDate && (
              <Space size={4}>
                <UserOutlined style={{ color: '#888', fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>KTV: <strong>{reception.assessedBy}</strong> · {formatDate(reception.assessedDate)}</Text>
              </Space>
            )}
          >
            {/* Mức hao mòn - luôn hiển thị */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: reception.wearLevel === 'critical' ? '#fff1f0' : reception.wearLevel === 'high' ? '#fff7e6' : reception.wearLevel === 'medium' ? '#fffbe6' : '#f6ffed',
                borderRadius: 8, padding: '12px 16px',
                border: `1px solid ${reception.wearLevel === 'critical' ? '#ffa39e' : reception.wearLevel === 'high' ? '#ffd591' : reception.wearLevel === 'medium' ? '#ffe58f' : '#b7eb8f'}`,
              }}>
                <div>
                  <Text strong style={{ fontSize: 12, color: '#555', display: 'block' }}>Mức độ hao mòn</Text>
                  <Tag color={wearCfg?.color} style={{ marginTop: 4, fontSize: 13, padding: '2px 10px', fontWeight: 600 }}>{wearCfg?.label}</Tag>
                </div>
                <Divider type="vertical" style={{ height: 36 }} />
                <Text style={{ fontSize: 12, color: '#666', maxWidth: 260 }}>{wearLevelDesc[reception.wearLevel]}</Text>
              </div>
            </div>

            {reception.assessmentSummary ? (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <div>
                  <Text strong style={{ color: '#555', fontSize: 12, display: 'block', marginBottom: 8 }}>
                    KẾT LUẬN ĐÁNH GIÁ
                  </Text>
                  <QuoteBlock text={reception.assessmentSummary} color="#16a34a" />
                </div>
                <Descriptions size="small" column={2} labelStyle={{ color: '#888', fontWeight: 500 }}>
                  <Descriptions.Item label="Ngày hoàn thành">
                    <Text strong>{reception.assessedDate ? formatDate(reception.assessedDate) : '—'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="KTV phụ trách">
                    <Text strong>{reception.assessedBy || '—'}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            ) : (
              <EmptyState text="Chưa có kết luận đánh giá kỹ thuật" />
            )}
          </Card>

          {/* ── BƯỚC 4: Xác định phạm vi đại tu ── */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px 24px' }}
            title={
              <Space size={10}>
                <StepBadge step={4} done={step45Done} active={step3Done && !step45Done} />
                <div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Xác định phạm vi đại tu</Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Bước 4</Text>
                </div>
              </Space>
            }
          >
            {step45Done ? (
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px' }}>
                    <Text strong style={{ color: '#555', fontSize: 11, display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phạm vi đại tu</Text>
                    <Space direction="vertical" size={6}>
                      <Tag color={reception.overhaulScope === 'full' ? 'blue' : 'cyan'} style={{ fontSize: 13, padding: '3px 12px', fontWeight: 700 }}>
                        {reception.overhaulScope === 'full' ? 'Toàn bộ' : 'Một phần'}
                      </Tag>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {reception.overhaulScope === 'full'
                          ? 'Đại tu toàn diện — thay thế, phục hồi và nâng cấp tất cả cụm, hệ thống'
                          : 'Đại tu các cụm, hệ thống hư hỏng chính; giữ nguyên cụm còn sử dụng được'}
                      </Text>
                    </Space>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px' }}>
                    <Text strong style={{ color: '#555', fontSize: 11, display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mức hao mòn xác nhận</Text>
                    <Space direction="vertical" size={6}>
                      <Tag color={wearCfg?.color} style={{ fontSize: 13, padding: '3px 12px', fontWeight: 700 }}>{wearCfg?.label}</Tag>
                      <Text style={{ fontSize: 12, color: '#666' }}>{wearLevelDesc[reception.wearLevel]}</Text>
                    </Space>
                  </div>
                </Col>
              </Row>
            ) : (
              <EmptyState text="Chưa xác định phạm vi đại tu (cần hoàn thành đánh giá kỹ thuật trước)" />
            )}
          </Card>

          {/* ── BƯỚC 5: Phân loại và định tuyến ── */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px 24px' }}
            title={
              <Space size={10}>
                <StepBadge step={5} done={step45Done} active={step3Done && !step45Done} />
                <div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Phân loại và định tuyến đại tu</Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Bước 5</Text>
                </div>
              </Space>
            }
          >
            {step45Done ? (
              <Space direction="vertical" style={{ width: '100%' }} size={14}>
                {/* Loại đại tu */}
                <div>
                  <Text strong style={{ color: '#555', fontSize: 11, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <BranchesOutlined style={{ marginRight: 6 }} />Loại đại tu
                  </Text>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                    <Tag color={overhaulTypeColor[reception.overhaulType]} style={{ fontSize: 12, padding: '2px 10px', fontWeight: 600 }}>
                      {overhaulTypeLabel[reception.overhaulType]}
                    </Tag>
                    <Text style={{ fontSize: 12, color: '#666' }}>{overhaulTypeDesc[reception.overhaulType]}</Text>
                  </div>
                </div>

                {/* Định tuyến trung tâm */}
                <div>
                  <Text strong style={{ color: '#555', fontSize: 11, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <ApartmentOutlined style={{ marginRight: 6 }} />Trung tâm định tuyến
                  </Text>
                  <Row gutter={12} align="middle">
                    <Col>
                      <div style={{
                        background: `linear-gradient(135deg, ${colors.navy}, #2d5a8e)`,
                        borderRadius: 8, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 10,
                      }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                          {reception.routingWorkshop}
                        </div>
                        <div>
                          <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600, display: 'block', lineHeight: 1.3 }}>
                            {reception.routingWorkshopName || reception.routingWorkshop}
                          </Text>
                          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Trung tâm phụ trách đại tu</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Lý do định tuyến */}
                {reception.routingReason && (
                  <div>
                    <Text strong style={{ color: '#555', fontSize: 11, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lý do định tuyến</Text>
                    <div style={{ background: '#f0f4ff', borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid #2d5a8e` }}>
                      <Text style={{ fontSize: 13, color: '#333' }}>{reception.routingReason}</Text>
                    </div>
                  </div>
                )}
              </Space>
            ) : (
              <EmptyState text="Chưa định tuyến trung tâm (cần hoàn thành đánh giá kỹ thuật trước)" />
            )}
          </Card>

          {/* ── BƯỚC 6: Ghi nhận & Khởi tạo hồ sơ đại tu ── */}
          <Card
            style={{ borderRadius: 12, marginBottom: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px 24px' }}
            title={
              <Space size={10}>
                <StepBadge step={6} done={step6Done} active={step45Done && !step6Done} />
                <div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Ghi nhận & Khởi tạo hồ sơ đại tu</Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Bước 6</Text>
                </div>
              </Space>
            }
          >
            {reception.linkedOrderId ? (
              <div style={{ background: '#f6ffed', borderRadius: 8, padding: '16px 20px', border: '1px solid #b7eb8f' }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space size={12}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileDoneOutlined style={{ color: '#fff', fontSize: 18 }} />
                      </div>
                      <div>
                        <Text strong style={{ color: '#389e0d', display: 'block' }}>Hồ sơ đại tu đã được khởi tạo</Text>
                        <Space size={8} style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: 12, color: '#555' }}>Mã lệnh đại tu:</Text>
                          <Text strong style={{ color: colors.navy, fontFamily: 'monospace' }}>{reception.linkedOrderId}</Text>
                        </Space>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      onClick={() => navigate(`/overhaul-orders/${reception.linkedOrderId}`)}
                      style={{ background: colors.navy, borderColor: colors.navy }}
                    >
                      Xem lệnh đại tu
                    </Button>
                  </Col>
                </Row>
              </div>
            ) : reception.status === 'assessed' ? (
              <div style={{ background: '#e6f4ff', borderRadius: 8, padding: '16px 20px', border: '1px solid #91caff' }}>
                <Space size={12}>
                  <SolutionOutlined style={{ color: '#1677ff', fontSize: 24 }} />
                  <div>
                    <Text strong style={{ color: '#0958d9', display: 'block' }}>Sẵn sàng lập kế hoạch</Text>
                    <Text style={{ fontSize: 12, color: '#555' }}>
                      Hồ sơ đã hoàn thành đánh giá — nhấn "Chuyển lập kế hoạch" để tạo lệnh đại tu
                    </Text>
                  </div>
                </Space>
              </div>
            ) : (
              <EmptyState text={
                reception.status === 'pending_reception' || reception.status === 'received'
                  ? 'Cần hoàn thành kiểm tra và đánh giá kỹ thuật trước khi khởi tạo hồ sơ đại tu'
                  : 'Cần hoàn thành đánh giá kỹ thuật trước khi khởi tạo hồ sơ đại tu'
              } />
            )}
          </Card>
        </Col>

        {/* ═══ Cột phải: Sidebar ═══ */}
        <Col xs={24} lg={7}>

          {/* Tiến trình 6 bước */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '16px 20px' }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tiến trình xử lý</Text>}
          >
            <Timeline
              style={{ marginTop: 4 }}
              items={[
                {
                  color: step1Done ? 'green' : 'blue',
                  dot: step1Done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : undefined,
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 12, color: step1Done ? '#16a34a' : colors.navy }}>
                        Bước 1: Tiếp nhận thiết bị
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatDate(reception.receivedDate)}
                        {reception.receivedBy ? ` · ${reception.receivedBy}` : ''}
                      </Text>
                      {reception.receivedDocuments && reception.receivedDocuments.length > 0 && (
                        <><br /><Tag color="success" style={{ fontSize: 10, marginTop: 2 }}>{reception.receivedDocuments.length} tài liệu</Tag></>
                      )}
                    </div>
                  ),
                },
                {
                  color: step2Done ? 'green' : step2Active ? 'blue' : 'gray',
                  dot: step2Done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : undefined,
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 12, color: step2Done ? '#16a34a' : step2Active ? colors.navy : '#bbb' }}>
                        Bước 2: Kiểm tra ban đầu
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {reception.initialCondition
                          ? `${reception.initialCheckDate ? formatDate(reception.initialCheckDate) : ''}`
                          : <span style={{ color: '#bbb' }}>Chưa thực hiện</span>}
                      </Text>
                    </div>
                  ),
                },
                {
                  color: step3Done ? 'green' : step3Active ? 'blue' : 'gray',
                  dot: step3Done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : undefined,
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 12, color: step3Done ? '#16a34a' : step3Active ? colors.navy : '#bbb' }}>
                        Bước 3: Đánh giá kỹ thuật
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {reception.assessmentSummary
                          ? `${reception.assessedDate ? formatDate(reception.assessedDate) : ''} · ${reception.assessedBy || ''}`
                          : <span style={{ color: '#bbb' }}>Chưa thực hiện</span>}
                      </Text>
                      {step3Done && <><br /><Tag color={wearCfg?.color} style={{ fontSize: 10, marginTop: 2 }}>{wearCfg?.label}</Tag></>}
                    </div>
                  ),
                },
                {
                  color: step45Done ? 'green' : step3Done ? 'blue' : 'gray',
                  dot: step45Done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : undefined,
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 12, color: step45Done ? '#16a34a' : step3Done ? colors.navy : '#bbb' }}>
                        Bước 4: Xác định phạm vi đại tu
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {step45Done
                          ? <Tag color={reception.overhaulScope === 'full' ? 'blue' : 'cyan'} style={{ fontSize: 10 }}>
                              {reception.overhaulScope === 'full' ? 'Toàn bộ' : 'Một phần'}
                            </Tag>
                          : <span style={{ color: '#bbb' }}>Chưa xác định</span>}
                      </Text>
                    </div>
                  ),
                },
                {
                  color: step45Done ? 'green' : step3Done ? 'blue' : 'gray',
                  dot: step45Done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : undefined,
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 12, color: step45Done ? '#16a34a' : step3Done ? colors.navy : '#bbb' }}>
                        Bước 5: Phân loại & Định tuyến
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {step45Done
                          ? <><Tag color={overhaulTypeColor[reception.overhaulType]} style={{ fontSize: 10 }}>{overhaulTypeLabel[reception.overhaulType]}</Tag>
                              <span style={{ marginLeft: 4 }}>{reception.routingWorkshop}</span></>
                          : <span style={{ color: '#bbb' }}>Chưa định tuyến</span>}
                      </Text>
                    </div>
                  ),
                },
                {
                  color: step6Done ? 'green' : 'gray',
                  dot: step6Done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : undefined,
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 12, color: step6Done ? '#16a34a' : '#bbb' }}>
                        Bước 6: Khởi tạo hồ sơ đại tu
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {reception.linkedOrderId
                          ? <Tag color="success" style={{ fontSize: 10 }}>{reception.linkedOrderId}</Tag>
                          : <span style={{ color: '#bbb' }}>Chưa khởi tạo</span>}
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Thông tin nhanh */}
          <Card
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '16px 20px' }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Thông tin hồ sơ</Text>}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={0}>
              {[
                { label: 'Mã hồ sơ', value: <Text strong style={{ fontFamily: 'monospace' }}>{reception.code}</Text> },
                { label: 'Trạng thái', value: <Tag color={statusCfg?.color}>{statusCfg?.label}</Tag> },
                { label: 'Bước hiện tại', value: <Tag color="processing">Bước {currentStep}/6</Tag> },
                { label: 'Thiết bị', value: <Text style={{ fontSize: 12 }}>{reception.equipmentName}</Text> },
                { label: 'Đơn vị gửi', value: <Text style={{ fontSize: 12 }}>{reception.sendingUnit}</Text> },
                { label: 'Trung tâm', value: <Text style={{ fontSize: 12 }}>{reception.routingWorkshopName || reception.routingWorkshop}</Text> },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 5 ? '1px solid #f0f0f0' : 'none' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                  <div>{item.value}</div>
                </div>
              ))}
            </Space>
          </Card>

          {/* Meta thông tin */}
          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '14px 20px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Tạo lúc</Text>
                <Text style={{ fontSize: 11 }}>{formatDateTime(reception.createdAt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Cập nhật lần cuối</Text>
                <Text style={{ fontSize: 11 }}>{formatDateTime(reception.updatedAt)}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverhaulReceptionDetail;
