import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Drawer,
  Tabs,
  Steps,
  Descriptions,
  Alert,
  Timeline,
  Form,
  Statistic,
  Badge,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  ToolOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  SendOutlined,
  CheckOutlined,
  WarningOutlined,
  RocketOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestPriority,
  ChangeRequestSource,
  ConfigurationRecord,
} from '../../types';
import { changeRequests as allChangeRequests, getPendingChangeRequests } from '../../data/changeRequests';
import { configurationRecords } from '../../data/configurations';
import { equipmentList } from '../../data/equipment';
import { useUser } from '../../contexts/UserContext';
import { configChangeTypeConfig, formatDate } from '../../utils/format';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<ChangeRequestSource, string> = {
  'pkkq-sanxuat': 'Phát triển',
  'pkkq-suachua': 'Khắc phục',
  'pkkq-daitu': 'Nâng cấp',
  'pkkq-baotri': 'Bảo trì',
  internal: 'Nội bộ',
};

const STATUS_CONFIG: Record<ChangeRequestStatus, { label: string; color: string }> = {
  draft:        { label: 'Nháp',           color: 'default' },
  submitted:    { label: 'Chờ xem xét',    color: 'warning' },
  under_review: { label: 'Đang đánh giá',  color: 'processing' },
  approved:     { label: 'Đã phê duyệt',   color: 'success' },
  rejected:     { label: 'Từ chối',        color: 'error' },
  implemented:  { label: 'Đã thực hiện',   color: 'success' },
};

const PRIORITY_CONFIG: Record<ChangeRequestPriority, { label: string; color: string }> = {
  critical: { label: 'Khẩn cấp', color: 'red' },
  high:     { label: 'Cao',      color: 'orange' },
  medium:   { label: 'Trung bình', color: 'blue' },
  low:      { label: 'Thấp',     color: 'default' },
};

const ALL_SUBSYSTEMS = [
  { key: 'pkkq-sanxuat',  label: 'Phát triển' },
  { key: 'pkkq-suachua',  label: 'Khắc phục' },
  { key: 'pkkq-daitu',    label: 'Nâng cấp' },
  { key: 'pkkq-chatluong',label: 'Chất lượng' },
  { key: 'pkkq-kho',      label: 'Kho tàng' },
];

// Step index for each status
function getStepIndex(cr: ChangeRequest): number {
  switch (cr.status) {
    case 'draft':        return 0;
    case 'submitted':    return 1;
    case 'under_review': return 2;
    case 'rejected':     return 3;
    case 'approved':     return cr.linkedConfigId ? 4 : 3;
    case 'implemented':  return 5;
    default:             return 0;
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: [string, string];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient }) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      borderRadius: 14,
      padding: '20px 24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.18)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
    }}
  >
    {/* Background icon */}
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 12,
        fontSize: 64,
        opacity: 0.08,
        lineHeight: 1,
        transition: '0.5s',
      }}
    >
      {icon}
    </div>
    {/* Icon badge */}
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        marginBottom: 12,
      }}
    >
      {icon}
    </div>
    <Statistic
      value={value}
      valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 26 }}
    />
    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>{title}</div>
  </div>
);

// ─── Detail Drawer ────────────────────────────────────────────────────────────

interface DetailDrawerProps {
  record: ChangeRequest | null;
  open: boolean;
  onClose: () => void;
  isVongDoi: boolean;
  onAction: (action: 'start_review' | 'approve' | 'reject' | 'implement', id: string) => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ record, open, onClose, isVongDoi, onAction }) => {
  if (!record) return null;

  const stepIndex = getStepIndex(record);
  const steps = [
    { title: 'Tiếp nhận' },
    { title: 'Đánh giá' },
    { title: 'Xây dựng phương án' },
    { title: 'Phê duyệt' },
    { title: 'Ban hành' },
    { title: 'Theo dõi' },
  ];

  const statusCfg = STATUS_CONFIG[record.status];

  const timelineItems = [];
  timelineItems.push({
    color: 'blue',
    children: (
      <>
        <Text strong>Tạo yêu cầu</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.requestedBy} — {formatDate(record.requestedAt)}
        </Text>
      </>
    ),
  });
  if (record.reviewedAt) {
    timelineItems.push({
      color: 'blue',
      children: (
        <>
          <Text strong>Bắt đầu đánh giá</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.reviewedBy} — {formatDate(record.reviewedAt)}
          </Text>
        </>
      ),
    });
  }
  if (record.approvedAt) {
    timelineItems.push({
      color: record.status === 'rejected' ? 'red' : 'green',
      dot:
        record.status === 'rejected' ? (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        ) : (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ),
      children: (
        <>
          <Text strong>{record.status === 'rejected' ? 'Từ chối' : 'Phê duyệt'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.approvedBy} — {formatDate(record.approvedAt)}
          </Text>
        </>
      ),
    });
  }
  if (record.implementedAt) {
    timelineItems.push({
      color: 'green',
      dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      children: (
        <>
          <Text strong>Hoàn thành thực hiện</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.implementedBy} — {formatDate(record.implementedAt)}
          </Text>
        </>
      ),
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      styles={{ body: { padding: 0, background: '#f0f2f5' } }}
      title={null}
      closable={false}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>
                {record.code}
              </Text>
              <Tag color={statusCfg.color} style={{ margin: 0 }}>
                {record.status === 'implemented' && <CheckCircleOutlined style={{ marginRight: 4 }} />}
                {statusCfg.label}
              </Tag>
            </div>
            <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 600 }}>
              {record.title}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {record.equipmentName} — {record.equipmentCode}
            </Text>
          </div>
          <Button onClick={onClose} type="text" style={{ color: '#fff', marginLeft: 8 }}>
            ✕
          </Button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <Tabs
          defaultActiveKey="detail"
          items={[
            {
              key: 'detail',
              label: 'Chi tiết',
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  {/* Workflow steps */}
                  <Card
                    size="small"
                    style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                  >
                    <Steps
                      current={stepIndex}
                      status={record.status === 'rejected' ? 'error' : 'process'}
                      size="small"
                      items={steps}
                    />
                  </Card>

                  {/* Core info */}
                  <Card
                    size="small"
                    style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                  >
                    <Descriptions bordered size="small" column={2}>
                      <Descriptions.Item label="Mã yêu cầu">
                        <Text style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{record.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mức ưu tiên">
                        <Tag color={PRIORITY_CONFIG[record.priority].color}>
                          {PRIORITY_CONFIG[record.priority].label}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thiết bị" span={2}>
                        {record.equipmentName}{' '}
                        <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          ({record.equipmentCode})
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nguồn yêu cầu">
                        {SOURCE_LABELS[record.source]}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã phiếu nguồn">
                        {record.sourceRef ? (
                          <Text style={{ fontFamily: 'monospace' }}>{record.sourceRef}</Text>
                        ) : (
                          <Text type="secondary">—</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày gửi">
                        {formatDate(record.requestedAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Người yêu cầu">
                        {record.requestedBy}
                      </Descriptions.Item>
                      <Descriptions.Item label="Đơn vị" span={2}>
                        {record.requestedDept}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* Nội dung */}
                  <Card
                    size="small"
                    title={
                      <span style={{ color: '#1B3A5C', fontWeight: 600 }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Nội dung yêu cầu
                      </span>
                    }
                    style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                        Mô tả thay đổi
                      </Text>
                      <div
                        style={{
                          marginTop: 6,
                          padding: '10px 12px',
                          border: '1px solid #e8e8e8',
                          borderRadius: 8,
                          background: '#eff6ff',
                          lineHeight: 1.6,
                        }}
                      >
                        {record.description}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                        Lý do thay đổi
                      </Text>
                      <div
                        style={{
                          marginTop: 6,
                          padding: '10px 12px',
                          border: '1px solid #e8e8e8',
                          borderRadius: 8,
                          background: '#eff6ff',
                          lineHeight: 1.6,
                        }}
                      >
                        {record.reason}
                      </div>
                    </div>
                  </Card>

                  {/* Affected serials */}
                  {record.affectedSerials && record.affectedSerials.length > 0 && (
                    <Card
                      size="small"
                      title={
                        <span style={{ color: '#1B3A5C', fontWeight: 600 }}>
                          <TagsOutlined style={{ marginRight: 8 }} />
                          Số hiệu bị ảnh hưởng
                        </span>
                      }
                      style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                    >
                      <Space wrap>
                        {record.affectedSerials.map(s => (
                          <Tag key={s} color="geekblue" style={{ fontFamily: 'monospace' }}>
                            {s}
                          </Tag>
                        ))}
                      </Space>
                    </Card>
                  )}

                  {/* Impact analysis */}
                  {record.impactAnalysis && (
                    <Alert
                      type="info"
                      showIcon
                      icon={<WarningOutlined />}
                      message="Phân tích tác động"
                      description={record.impactAnalysis}
                      style={{ borderRadius: 10 }}
                    />
                  )}

                  {/* Proposed solution */}
                  {record.proposedSolution && (
                    <Alert
                      type="info"
                      showIcon
                      icon={<ToolOutlined />}
                      message="Phương án đề xuất"
                      description={record.proposedSolution}
                      style={{ borderRadius: 10 }}
                    />
                  )}

                  {/* Review notes */}
                  {record.reviewNotes && record.status !== 'rejected' && (
                    <Alert
                      type="info"
                      showIcon
                      message="Ghi chú phê duyệt"
                      description={record.reviewNotes}
                      style={{ borderRadius: 10 }}
                    />
                  )}
                  {record.reviewNotes && record.status === 'rejected' && (
                    <Alert
                      type="warning"
                      showIcon
                      icon={<CloseCircleOutlined />}
                      message="Lý do từ chối"
                      description={record.reviewNotes}
                      style={{ borderRadius: 10 }}
                    />
                  )}

                  {/* Linked config */}
                  {record.linkedConfigId && (() => {
                    const cfg = configurationRecords.find(c => c.id === record.linkedConfigId);
                    return cfg ? (
                      <Alert
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        message="Đã tạo phiên bản cấu hình"
                        description={
                          <>
                            Mã cấu hình:{' '}
                            <Text style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>
                              {cfg.id}
                            </Text>{' '}
                            — Phiên bản <strong>{cfg.version}</strong> — Ngày{' '}
                            {formatDate(cfg.changeDate)}
                          </>
                        }
                        style={{ borderRadius: 10 }}
                      />
                    ) : null;
                  })()}

                  {/* Post change note */}
                  {record.postChangeNote && (
                    <Alert
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                      message="Kết quả sau thực hiện"
                      description={record.postChangeNote}
                      style={{ borderRadius: 10 }}
                    />
                  )}

                  {/* Action buttons */}
                  {isVongDoi && (
                    <Card
                      size="small"
                      style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                    >
                      <Space>
                        {record.status === 'submitted' && (
                          <Button
                            type="primary"
                            icon={<SyncOutlined />}
                            style={{ background: '#1890ff', borderColor: '#1890ff' }}
                            onClick={() => onAction('start_review', record.id)}
                          >
                            Bắt đầu đánh giá
                          </Button>
                        )}
                        {record.status === 'under_review' && (
                          <>
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              style={{ background: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => onAction('approve', record.id)}
                            >
                              Phê duyệt
                            </Button>
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              onClick={() => onAction('reject', record.id)}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {record.status === 'approved' && (
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{ background: '#1890ff', borderColor: '#1890ff' }}
                            onClick={() => onAction('implement', record.id)}
                          >
                            Đánh dấu đã thực hiện
                          </Button>
                        )}
                      </Space>
                    </Card>
                  )}
                </Space>
              ),
            },
            {
              key: 'history',
              label: 'Lịch sử xử lý',
              children: (
                <Card
                  size="small"
                  style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                >
                  <Timeline items={timelineItems} />
                </Card>
              ),
            },
          ]}
        />
      </div>
    </Drawer>
  );
};

// ─── Create Drawer ────────────────────────────────────────────────────────────

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateDrawer: React.FC<CreateDrawerProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then(() => {
        form.resetFields();
        onSuccess();
        onClose();
      })
      .catch(() => {});
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={600}
      title={
        <span style={{ color: '#1B3A5C', fontWeight: 700 }}>
          <PlusOutlined style={{ marginRight: 8 }} />
          Tạo yêu cầu thay đổi cấu hình
        </span>
      }
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Hủy bỏ</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
            >
              Gửi yêu cầu
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark>
        <Form.Item
          name="equipmentId"
          label="Thiết bị"
          rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
        >
          <Select
            showSearch
            placeholder="Chọn thiết bị"
            optionFilterProp="label"
            options={equipmentList.map(eq => ({
              value: eq.id,
              label: `${eq.name} (${eq.code})`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề yêu cầu"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Nhập tiêu đề mô tả ngắn gọn thay đổi..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Mức ưu tiên"
              initialValue="medium"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'critical', label: 'Khẩn cấp' },
                  { value: 'high',     label: 'Cao' },
                  { value: 'medium',   label: 'Trung bình' },
                  { value: 'low',      label: 'Thấp' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="source"
              label="Nguồn yêu cầu"
              initialValue="internal"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'pkkq-sanxuat', label: 'Phát triển' },
                  { value: 'pkkq-suachua', label: 'Khắc phục' },
                  { value: 'pkkq-daitu',   label: 'Nâng cấp' },
                  { value: 'pkkq-baotri',  label: 'Bảo trì' },
                  { value: 'internal',     label: 'Nội bộ' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="sourceRef" label="Mã phiếu nguồn">
          <Input placeholder="Ví dụ: SC-2026-0088 (không bắt buộc)" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Nội dung thay đổi"
          rules={[{ required: true, message: 'Vui lòng mô tả nội dung thay đổi' }]}
        >
          <TextArea
            rows={4}
            placeholder="Mô tả chi tiết thay đổi cần thực hiện..."
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do thay đổi"
          rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
        >
          <TextArea
            rows={3}
            placeholder="Nêu rõ lý do kỹ thuật hoặc vận hành dẫn đến yêu cầu thay đổi..."
          />
        </Form.Item>

        <Form.Item name="affectedSerials" label="Số hiệu bị ảnh hưởng">
          <Input placeholder="P18-SH001, P18-SH002 (cách nhau bằng dấu phẩy)" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ChangeRequestPage: React.FC = () => {
  const { isVongDoi, isDirector } = useUser();
  const [messageApi, contextHolder] = message.useMessage();

  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Config tab state
  const [cfgFilterStatus, setCfgFilterStatus] = useState<string>('all');
  const [cfgFilterEquipment, setCfgFilterEquipment] = useState<string>('all');

  // ── KPI ────────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const total = allChangeRequests.length;
    const pending = allChangeRequests.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
    const approved = allChangeRequests.filter(c => c.status === 'approved' || c.status === 'implemented').length;
    const rejected = allChangeRequests.filter(c => c.status === 'rejected').length;
    const inProgress = allChangeRequests.filter(c => c.status === 'approved').length;
    return { total, pending, approved, rejected, inProgress };
  }, []);

  const pendingCRs = getPendingChangeRequests();

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    return allChangeRequests.filter(cr => {
      if (filterStatus !== 'all' && cr.status !== filterStatus) return false;
      if (filterEquipment !== 'all' && cr.equipmentId !== filterEquipment) return false;
      if (filterPriority !== 'all' && cr.priority !== filterPriority) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !cr.code.toLowerCase().includes(q) &&
          !cr.title.toLowerCase().includes(q) &&
          !cr.equipmentName.toLowerCase().includes(q) &&
          !cr.equipmentCode.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [searchText, filterStatus, filterEquipment, filterPriority]);

  // ── Filtered config records ────────────────────────────────────────────────
  const filteredConfigs = useMemo(() => {
    return configurationRecords.filter(c => {
      if (cfgFilterStatus !== 'all' && c.status !== cfgFilterStatus) return false;
      if (cfgFilterEquipment !== 'all' && c.equipmentId !== cfgFilterEquipment) return false;
      return true;
    });
  }, [cfgFilterStatus, cfgFilterEquipment]);

  // ── Approved configs grouped by equipment ────────────────────────────────
  const approvedConfigsByEquipment = useMemo(() => {
    const approved = configurationRecords.filter(c => c.status === 'approved');
    const grouped: Record<string, { equipmentId: string; equipmentCode: string; equipmentName: string; configs: ConfigurationRecord[] }> = {};
    approved.forEach(c => {
      if (!grouped[c.equipmentId]) {
        grouped[c.equipmentId] = {
          equipmentId: c.equipmentId,
          equipmentCode: c.equipmentCode,
          equipmentName: c.equipmentName,
          configs: [],
        };
      }
      grouped[c.equipmentId].configs.push(c);
    });
    return Object.values(grouped);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenDetail = (cr: ChangeRequest) => {
    setSelectedCR(cr);
    setDetailOpen(true);
  };

  const handleAction = (action: 'start_review' | 'approve' | 'reject' | 'implement', _id: string) => {
    const labels: Record<string, string> = {
      start_review: 'Đã chuyển sang trạng thái đang đánh giá.',
      approve:      'Yêu cầu đã được phê duyệt.',
      reject:       'Yêu cầu đã bị từ chối.',
      implement:    'Yêu cầu đã được đánh dấu thực hiện.',
    };
    messageApi.success(labels[action]);
    setDetailOpen(false);
  };

  const handleApproveConfig = (_id: string) => {
    messageApi.success('Đã phê duyệt hồ sơ cấu hình.');
  };

  const handleRejectConfig = (_id: string) => {
    messageApi.warning('Đã từ chối hồ sơ cấu hình.');
  };

  const handlePublish = (configId: string, subsystem: string) => {
    messageApi.success(`Đã công bố cấu hình ${configId} đến hệ thống ${subsystem}.`);
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const crColumns: ColumnsType<ChangeRequest> = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: '#1B3A5C', fontSize: 12 }}>{v}</Text>
      ),
    },
    {
      title: 'Tiêu đề / Thiết bị',
      key: 'info',
      render: (_: unknown, cr: ChangeRequest) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1B3A5C', marginBottom: 2 }}>{cr.title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {cr.equipmentName}{' '}
            <span style={{ fontFamily: 'monospace' }}>({cr.equipmentCode})</span>
          </Text>
        </div>
      ),
    },
    {
      title: 'Mức ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (v: ChangeRequestPriority) => (
        <Tag color={PRIORITY_CONFIG[v].color}>{PRIORITY_CONFIG[v].label}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (v: ChangeRequestStatus) => (
        <Tag color={STATUS_CONFIG[v].color}>
          {v === 'implemented' && <CheckCircleOutlined style={{ marginRight: 4 }} />}
          {STATUS_CONFIG[v].label}
        </Tag>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 90,
      render: (v: ChangeRequestSource) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {SOURCE_LABELS[v]}
        </Text>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 100,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, cr: ChangeRequest) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={e => { e.stopPropagation(); handleOpenDetail(cr); }}
        />
      ),
    },
  ];

  const cfgColumns: ColumnsType<ConfigurationRecord> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: '#1B3A5C', fontSize: 12 }}>{v}</Text>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
    },
    {
      title: 'Loại thay đổi',
      dataIndex: 'changeType',
      key: 'changeType',
      render: (v: keyof typeof configChangeTypeConfig) => (
        <Tag color={configChangeTypeConfig[v].color}>{configChangeTypeConfig[v].label}</Tag>
      ),
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      width: 130,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'changeDate',
      key: 'changeDate',
      width: 100,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (v: string) => {
        const cfgStatusMap: Record<string, { label: string; color: string }> = {
          draft:            { label: 'Nháp',          color: 'default' },
          pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
          approved:         { label: 'Đã duyệt',      color: 'success' },
          rejected:         { label: 'Từ chối',       color: 'error' },
        };
        const cfg = cfgStatusMap[v] ?? { label: v, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      align: 'center' as const,
      render: (_: unknown, rec: ConfigurationRecord) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} />
          {(isVongDoi || isDirector) && rec.status === 'pending_approval' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleApproveConfig(rec.id)}
              >
                Duyệt
              </Button>
              {isDirector && (
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleRejectConfig(rec.id)}
                >
                  Từ chối
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingConfigCount = configurationRecords.filter(c => c.status === 'pending_approval').length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 0 }}>
      {contextHolder}

      {/* Hero banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 20,
          color: '#fff',
        }}
      >
        <Row align="middle" gutter={24}>
          <Col flex="1">
            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              Quản lý thay đổi cấu hình kỹ thuật
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              Tiếp nhận, đánh giá, phê duyệt và theo dõi các yêu cầu thay đổi cấu hình thiết bị
            </Text>
          </Col>
          <Col>
            <Steps
              current={-1}
              size="small"
              style={{ color: '#fff' }}
              items={[
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Tiếp nhận</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Đánh giá</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Phương án</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Phê duyệt</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Ban hành</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Theo dõi</span> },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* KPI cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12} style={{ display: 'flex' }}>
          <Row gutter={16} style={{ flex: 1 }}>
            <Col span={12}>
              <StatCard
                title="Tổng yêu cầu"
                value={kpi.total}
                icon={<FileTextOutlined />}
                gradient={['#1B3A5C', '#2d5a8e']}
              />
            </Col>
            <Col span={12}>
              <StatCard
                title="Chờ xem xét"
                value={kpi.pending}
                icon={<ClockCircleOutlined />}
                gradient={['#92400e', '#d97706']}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12} style={{ display: 'flex' }}>
          <Row gutter={16} style={{ flex: 1 }}>
            <Col span={8}>
              <StatCard
                title="Đã phê duyệt"
                value={kpi.approved}
                icon={<CheckCircleOutlined />}
                gradient={['#15803d', '#16a34a']}
              />
            </Col>
            <Col span={8}>
              <StatCard
                title="Từ chối"
                value={kpi.rejected}
                icon={<CloseCircleOutlined />}
                gradient={['#b91c1c', '#dc2626']}
              />
            </Col>
            <Col span={8}>
              <StatCard
                title="Đang thực hiện"
                value={kpi.inProgress}
                icon={<SyncOutlined />}
                gradient={['#1e40af', '#3b82f6']}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Main card with tabs */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 20px' }}
          items={[
            {
              key: 'list',
              label: (
                <span>
                  <ApartmentOutlined />
                  Danh sách yêu cầu
                </span>
              ),
              children: (
                <div style={{ padding: '0 0 20px' }}>
                  {/* Filter bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 16,
                      padding: '0 20px',
                    }}
                  >
                    <Input.Search
                      placeholder="Tìm mã, tiêu đề, thiết bị..."
                      style={{ width: 240 }}
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      allowClear
                    />
                    <Select
                      style={{ width: 140 }}
                      value={filterStatus}
                      onChange={setFilterStatus}
                      options={[
                        { value: 'all', label: 'Tất cả trạng thái' },
                        { value: 'draft', label: 'Nháp' },
                        { value: 'submitted', label: 'Chờ xem xét' },
                        { value: 'under_review', label: 'Đang đánh giá' },
                        { value: 'approved', label: 'Đã phê duyệt' },
                        { value: 'rejected', label: 'Từ chối' },
                        { value: 'implemented', label: 'Đã thực hiện' },
                      ]}
                    />
                    <Select
                      style={{ width: 160 }}
                      value={filterEquipment}
                      onChange={setFilterEquipment}
                      showSearch
                      optionFilterProp="label"
                      options={[
                        { value: 'all', label: 'Tất cả thiết bị' },
                        ...equipmentList.map(eq => ({
                          value: eq.id,
                          label: eq.name,
                        })),
                      ]}
                    />
                    <Select
                      style={{ width: 140 }}
                      value={filterPriority}
                      onChange={setFilterPriority}
                      options={[
                        { value: 'all', label: 'Tất cả ưu tiên' },
                        { value: 'critical', label: 'Khẩn cấp' },
                        { value: 'high', label: 'Cao' },
                        { value: 'medium', label: 'Trung bình' },
                        { value: 'low', label: 'Thấp' },
                      ]}
                    />
                    <Text type="secondary" style={{ flex: 1, fontSize: 13 }}>
                      {filteredList.length} yêu cầu
                    </Text>
                    {isVongDoi && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
                        onClick={() => setCreateOpen(true)}
                      >
                        Tạo yêu cầu
                      </Button>
                    )}
                  </div>

                  <div style={{ padding: '0 20px' }}>
                    <Table
                      columns={crColumns}
                      dataSource={filteredList}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10, size: 'small', showSizeChanger: false }}
                      onRow={cr => ({ onClick: () => handleOpenDetail(cr), style: { cursor: 'pointer' } })}
                      scroll={{ x: 900 }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'approval',
              label: (
                <span>
                  <EditOutlined />
                  Ghi nhận & Phê duyệt
                  {pendingConfigCount > 0 && (
                    <Badge count={pendingConfigCount} size="small" style={{ marginLeft: 6 }} />
                  )}
                </span>
              ),
              children: (
                <div style={{ padding: '0 0 20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 16,
                      padding: '0 20px',
                    }}
                  >
                    <Select
                      style={{ width: 160 }}
                      value={cfgFilterStatus}
                      onChange={setCfgFilterStatus}
                      options={[
                        { value: 'all', label: 'Tất cả trạng thái' },
                        { value: 'draft', label: 'Nháp' },
                        { value: 'pending_approval', label: 'Chờ phê duyệt' },
                        { value: 'approved', label: 'Đã duyệt' },
                        { value: 'rejected', label: 'Từ chối' },
                      ]}
                    />
                    <Select
                      style={{ width: 180 }}
                      value={cfgFilterEquipment}
                      onChange={setCfgFilterEquipment}
                      showSearch
                      optionFilterProp="label"
                      options={[
                        { value: 'all', label: 'Tất cả thiết bị' },
                        ...equipmentList.map(eq => ({
                          value: eq.id,
                          label: eq.name,
                        })),
                      ]}
                    />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {filteredConfigs.length} hồ sơ cấu hình
                    </Text>
                  </div>

                  <div style={{ padding: '0 20px' }}>
                    <Table
                      columns={cfgColumns}
                      dataSource={filteredConfigs}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10, size: 'small', showSizeChanger: false }}
                      expandable={{
                        expandedRowRender: (rec: ConfigurationRecord) => (
                          <div style={{ padding: '8px 16px' }}>
                            <Text strong style={{ color: '#1B3A5C', fontSize: 12 }}>
                              Danh sách linh kiện / thông số thay đổi:
                            </Text>
                            <Table
                              size="small"
                              pagination={false}
                              dataSource={rec.components.map((c, i) => ({ ...c, key: i }))}
                              columns={[
                                { title: 'Tên', dataIndex: 'name', key: 'name' },
                                { title: 'Giá trị cũ', dataIndex: 'oldValue', key: 'oldValue' },
                                { title: 'Giá trị mới', dataIndex: 'newValue', key: 'newValue' },
                                { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 80 },
                              ]}
                              style={{ marginTop: 8 }}
                            />
                          </div>
                        ),
                      }}
                      scroll={{ x: 900 }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'publish',
              label: (
                <span>
                  <GlobalOutlined />
                  Ban hành & Tích hợp
                </span>
              ),
              children: (
                <div style={{ padding: '0 20px 20px' }}>
                  {approvedConfigsByEquipment.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                      Chưa có cấu hình đã phê duyệt cần ban hành
                    </div>
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                      {approvedConfigsByEquipment.map(group => (
                        <Card
                          key={group.equipmentId}
                          size="small"
                          style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: 14,
                                }}
                              >
                                <ToolOutlined />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#1B3A5C' }}>
                                  {group.equipmentName}
                                </div>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 11, fontFamily: 'monospace' }}
                                >
                                  {group.equipmentCode}
                                </Text>
                              </div>
                              <Tag color="success" style={{ marginLeft: 8 }}>
                                {group.configs.length} cấu hình đã duyệt
                              </Tag>
                            </div>
                          }
                        >
                          <Space direction="vertical" style={{ width: '100%' }} size={12}>
                            {group.configs.map(cfg => (
                              <div key={cfg.id}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 8,
                                  }}
                                >
                                  <Text
                                    strong
                                    style={{ fontFamily: 'monospace', color: '#1B3A5C', fontSize: 12 }}
                                  >
                                    {cfg.id}
                                  </Text>
                                  <Text style={{ fontSize: 12 }}>{cfg.description.slice(0, 60)}...</Text>
                                  <Tag color={configChangeTypeConfig[cfg.changeType].color} style={{ marginLeft: 'auto' }}>
                                    {configChangeTypeConfig[cfg.changeType].label}
                                  </Tag>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {ALL_SUBSYSTEMS.map(sys => {
                                    const published = cfg.publishedTo?.find(p => p.system === sys.key);
                                    return published ? (
                                      <Tag
                                        key={sys.key}
                                        color="success"
                                        icon={<CheckCircleOutlined />}
                                        style={{ cursor: 'default' }}
                                      >
                                        {sys.label} ({formatDate(published.publishedDate)})
                                      </Tag>
                                    ) : (
                                      <Tag
                                        key={sys.key}
                                        style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                                        onClick={() => handlePublish(cfg.id, sys.label)}
                                      >
                                        <SendOutlined style={{ marginRight: 4 }} />
                                        Công bố: {sys.label}
                                      </Tag>
                                    );
                                  })}
                                </div>
                                <Divider style={{ margin: '10px 0 0' }} />
                              </div>
                            ))}
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Drawers */}
      <DetailDrawer
        record={selectedCR}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        isVongDoi={isVongDoi}
        onAction={handleAction}
      />

      <CreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => messageApi.success('Yêu cầu thay đổi cấu hình đã được tạo thành công.')}
      />

      {/* Pending alert */}
      {pendingCRs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Alert
            type="warning"
            showIcon
            icon={<SafetyOutlined />}
            message={
              <span>
                Có{' '}
                <strong>
                  {pendingCRs.length} yêu cầu
                </strong>{' '}
                đang chờ xem xét hoặc đánh giá.
              </span>
            }
            style={{ borderRadius: 10 }}
          />
        </div>
      )}
    </div>
  );
};

export default ChangeRequestPage;
