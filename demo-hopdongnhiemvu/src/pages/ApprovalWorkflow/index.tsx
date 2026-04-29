import React, { useMemo, useState } from 'react';
import {
  Card, Tag, Descriptions, Row, Col, Typography, Space, Table, Tabs,
  Button, Steps, Timeline, Input, InputNumber, message, Empty, Modal,
  Drawer, Form, Select,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, ToolOutlined, DollarOutlined,
  TeamOutlined, FileProtectOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EditOutlined, SendOutlined,
  FieldTimeOutlined, SafetyCertificateOutlined,
  FileDoneOutlined, ClockCircleOutlined, SwapOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { missions, proposals } from '../../data/missions';
import { contracts } from '../../data/contracts';
import {
  getCostVersionsByProposal,
  getApprovalsByProposal,
  getAuditLogsByEntity,
} from '../../data/approvals';
import { departments } from '../../data/departments';
import {
  formatCurrency, formatCurrencyFull, formatNumber, formatDate, formatDateTime,
  proposalStatusConfig, missionTypeConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ProposalStatus, CostItem, WorkVolume } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const sectionIcon = (icon: React.ReactNode, gradient: string) => (
  <div style={{
    width: 32, height: 32, borderRadius: 8, background: gradient,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 14,
  }}>{icon}</div>
);

const costCategoryConfig: Record<string, { label: string; color: string }> = {
  material: { label: 'Vật tư', color: '#2563eb' },
  labor: { label: 'Nhân công', color: '#059669' },
  equipment: { label: 'Thiết bị', color: '#d97706' },
  overhead: { label: 'Chi phí chung', color: '#7c3aed' },
  other: { label: 'Khác', color: '#6b7280' },
};

const roleLabels: Record<string, string> = {
  PKH: 'Phòng Kế hoạch',
  TCKT: 'Phòng Tài chính Kế toán',
  BGD: 'Ban Giám đốc',
};

const approvalTypeLabels: Record<string, string> = {
  cost_review: 'Thẩm định chi phí',
  approval: 'Phê duyệt',
};

const approvalResultConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Đang chờ', color: 'orange' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
  revision: { label: 'Yêu cầu chỉnh sửa', color: 'orange' },
};

/** Map proposal status to workflow step index */
const getWorkflowStep = (status: string): number => {
  const map: Record<string, number> = {
    draft: 0,
    submitted: 0,
    pending_cost_review: 1,
    cost_reviewing: 1,
    cost_reviewed: 1,
    cost_rejected: 1,
    pending_approval: 2,
    approved: 2,
    rejected: 2,
    revision: 2,
    negotiating: 3,
    contract_created: 4,
    contract_signed: 4,
  };
  return map[status] ?? 0;
};

const auditLogColor = (action: string): string => {
  if (action.includes('phê duyệt') || action.includes('Phê duyệt') || action.includes('hoàn thành')) return colors.success;
  if (action.includes('từ chối') || action.includes('Từ chối')) return colors.danger;
  if (action.includes('thẩm định') || action.includes('Thẩm định')) return colors.info;
  if (action.includes('đàm phán')) return '#7c3aed';
  return colors.navy;
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ApprovalWorkflowPage: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();

  const [approvalComment, setApprovalComment] = useState('');

  // Drawer gán người xử lý
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [assignType, setAssignType] = useState<'cost_review' | 'approval'>('cost_review');
  const [assignForm] = Form.useForm();

  // Mock danh sách người xử lý theo role
  const reviewersByRole = {
    TCKT: [
      { id: 'U-TCKT-01', name: 'Nguyễn Thị Lan', position: 'Trưởng phòng TC-KT' },
      { id: 'U-TCKT-02', name: 'Phạm Văn Hải', position: 'Phó phòng TC-KT' },
    ],
    BGD: [
      { id: 'U003', name: 'Phạm Quốc Hưng', position: 'Giám đốc Doanh nghiệp A' },
      { id: 'U-BGD-02', name: 'Lê Minh Đức', position: 'Phó Giám đốc' },
    ],
  };

  const handleOpenAssign = (type: 'cost_review' | 'approval') => {
    setAssignType(type);
    assignForm.resetFields();
    setAssignDrawerOpen(true);
  };

  const handleConfirmAssign = () => {
    assignForm.validateFields().then(values => {
      const reviewer = assignType === 'cost_review'
        ? reviewersByRole.TCKT.find(r => r.id === values.reviewer)
        : reviewersByRole.BGD.find(r => r.id === values.reviewer);
      const actionLabel = assignType === 'cost_review' ? 'thẩm định tài chính' : 'phê duyệt';
      message.success(`Đã gửi ${actionLabel} cho ${reviewer?.name || ''} — ${reviewer?.position || ''}`);
      setAssignDrawerOpen(false);
    });
  };

  const proposal = useMemo(() => proposals.find(p => p.id === proposalId), [proposalId]);
  const mission = useMemo(
    () => (proposal ? missions.find(m => m.id === proposal.missionId) : undefined),
    [proposal],
  );
  const costVersions = useMemo(
    () => (proposal ? getCostVersionsByProposal(proposal.id) : []),
    [proposal],
  );
  const approvalRequests = useMemo(
    () => (proposal ? getApprovalsByProposal(proposal.id) : []),
    [proposal],
  );
  const auditLogs = useMemo(
    () => (proposal ? getAuditLogsByEntity(proposal.id) : []),
    [proposal],
  );
  const linkedContract = useMemo(
    () => (proposal ? contracts.find(c => c.proposalId === proposal.id) : undefined),
    [proposal],
  );


  if (!proposal) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy đề xuất</Title>
        <Button type="link" onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const proposalStatus = proposalStatusConfig[proposal.status as ProposalStatus];
  const missionType = mission ? missionTypeConfig[mission.missionType] : undefined;
  const currentStep = getWorkflowStep(proposal.status);

  // ═══════════════════════════════════════════════════════════════
  // TAB 1: Phương án kỹ thuật
  // ═══════════════════════════════════════════════════════════════
  const renderTechnicalPlan = () => (
    <div>
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
        title={
          <Space size={8}>
            {sectionIcon(<ToolOutlined />, 'linear-gradient(135deg, #059669, #34d399)')}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Phương án kỹ thuật</Text>
          </Space>
        }>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
          labelStyle={{ fontWeight: 600, color: colors.navy, width: 180, fontSize: 12 }}>
          <Descriptions.Item label="Phương án kỹ thuật" span={2}>{proposal.technicalPlan}</Descriptions.Item>
          <Descriptions.Item label="Quy trình công nghệ" span={2}>{proposal.workProcess}</Descriptions.Item>
          {proposal.configReference && (
            <Descriptions.Item label="Tham chiếu cấu hình" span={2}>
              <Tag color="purple">{proposal.configReference}</Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Thời gian dự kiến">
            <Text strong style={{ color: colors.navy }}>{proposal.estimatedDuration} ngày</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày lập">{proposal.preparedAt}</Descriptions.Item>
          {proposal.reviewNote && (
            <Descriptions.Item label="Nhận xét duyệt" span={2}>
              <Text style={{ color: '#059669' }}>{proposal.reviewNote}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={
          <Space size={8}>
            {sectionIcon(<FieldTimeOutlined />, 'linear-gradient(135deg, #d97706, #fbbf24)')}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Khối lượng công việc</Text>
            <Tag color="blue">{proposal.workVolumes.length} hạng mục</Tag>
          </Space>
        }>
        <Table<WorkVolume>
          dataSource={proposal.workVolumes}
          columns={[
            { title: 'STT', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
            { title: 'Tên hạng mục', dataIndex: 'name', key: 'name' },
            { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 100 },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
            {
              title: 'Số ngày', dataIndex: 'estimatedDays', key: 'estimatedDays', width: 100, align: 'center',
              render: (v: number) => <Text strong>{v}</Text>,
            },
            {
              title: 'Đơn vị thực hiện', dataIndex: 'assignedUnit', key: 'assignedUnit', width: 200,
              render: (unitId: string) => {
                const dept = departments.find(d => d.id === unitId);
                return dept ? <Tag color="blue">{dept.name}</Tag> : unitId;
              },
            },
          ]}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          summary={() => {
            const days = proposal.workVolumes.reduce((s, w) => s + w.estimatedDays, 0);
            return (
              <Table.Summary.Row style={{ background: '#f5f7fa' }}>
                <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center"><Text strong style={{ color: colors.navy }}>{days} ngày</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // TAB 2: Dự toán chi phí
  // ═══════════════════════════════════════════════════════════════
  const costMiniCards = [
    { label: 'Vật tư', value: proposal.materialCost, gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', icon: <ToolOutlined /> },
    { label: 'Nhân công', value: proposal.laborCost, gradient: 'linear-gradient(135deg, #059669, #34d399)', icon: <TeamOutlined /> },
    { label: 'Thiết bị', value: proposal.equipmentCost, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', icon: <ToolOutlined /> },
    { label: 'Chi phí chung', value: proposal.overheadCost, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: <DollarOutlined /> },
  ];

  const renderCostEstimate = () => (
    <div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {costMiniCards.map((item, idx) => (
          <Col xs={12} md={6} key={idx}>
            <div style={{ background: item.gradient, borderRadius: 10, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -6, right: -6, fontSize: 48, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>{item.icon}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{formatCurrency(item.value)}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={
          <Space size={8}>
            {sectionIcon(<DollarOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Chi tiết dự toán</Text>
            <Tag color="blue">{proposal.costItems.length} hạng mục</Tag>
          </Space>
        }>
        <Table<CostItem>
          dataSource={proposal.costItems}
          columns={[
            { title: 'STT', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
            { title: 'Hạng mục', dataIndex: 'name', key: 'name' },
            {
              title: 'Phân loại', dataIndex: 'category', key: 'category', width: 140,
              render: (cat: string) => { const cfg = costCategoryConfig[cat]; return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : cat; },
            },
            { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 100 },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
            { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: (v: number) => formatNumber(v) },
            { title: 'Thành tiền (tr)', dataIndex: 'totalPrice', key: 'totalPrice', width: 140, align: 'right', render: (v: number) => <Text strong style={{ color: colors.navy }}>{formatNumber(v)}</Text> },
          ]}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          summary={() => (
            <Table.Summary.Row style={{ background: '#f5f7fa' }}>
              <Table.Summary.Cell index={0} colSpan={6} align="right"><Text strong>TỔNG CỘNG</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ color: colors.navy, fontSize: 15 }}>{formatNumber(proposal.totalCost)} tr</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // TAB 3: Thẩm định
  // ═══════════════════════════════════════════════════════════════
  const renderReview = () => {
    const v1 = costVersions.find(cv => cv.version === 1);
    const v2 = costVersions.find(cv => cv.version === 2);
    const hasResult = !!v2;
    const costReviewRequest = approvalRequests.find(a => a.type === 'cost_review');

    const costCompareRow = (label: string, val1: number, val2: number | undefined) => {
      const diff = val2 !== undefined ? val2 - val1 : 0;
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${colors.border}` }}>
          <Text style={{ fontSize: 13, color: '#666', flex: 1 }}>{label}</Text>
          <Text style={{ fontSize: 13, flex: 1, textAlign: 'right' }}>{formatNumber(val1)} tr</Text>
          {val2 !== undefined ? (
            <>
              <Text style={{ fontSize: 13, flex: 1, textAlign: 'right', fontWeight: 600 }}>{formatNumber(val2)} tr</Text>
              <Text style={{
                fontSize: 12, flex: '0 0 100px', textAlign: 'right',
                color: diff < 0 ? colors.success : diff > 0 ? colors.danger : '#666',
                fontWeight: 600,
              }}>
                {diff === 0 ? '---' : `${diff > 0 ? '+' : ''}${formatNumber(diff)} tr`}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 13, flex: 1, textAlign: 'right', color: '#999' }}>---</Text>
              <Text style={{ fontSize: 12, flex: '0 0 100px', textAlign: 'right', color: '#999' }}>---</Text>
            </>
          )}
        </div>
      );
    };

    const handleSyncResult = () => {
      setSyncLoading(true);
      setTimeout(() => {
        setSyncLoading(false);
        if (hasResult) {
          setSyncDone(true);
          Modal.success({
            title: 'Đã nhận kết quả thẩm định từ P. Tài chính Kế toán',
            width: 500,
            content: (
              <div>
                <div style={{ background: '#f6ffed', borderRadius: 8, padding: '12px 16px', marginBottom: 12, borderLeft: '3px solid #52c41a' }}>
                  <Text strong style={{ fontSize: 13, color: '#059669', display: 'block', marginBottom: 4 }}>Kết quả: Đạt — Có điều chỉnh chi phí</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>{v2?.note || 'Đã thẩm định và điều chỉnh chi phí'}</Text>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Người thẩm định</Text>
                    <Text strong style={{ fontSize: 13 }}>{costReviewRequest?.reviewedBy || 'P. Tài chính Kế toán'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngày thẩm định</Text>
                    <Text strong style={{ fontSize: 13 }}>{costReviewRequest?.reviewedAt ? formatDate(costReviewRequest.reviewedAt) : '—'}</Text>
                  </Col>
                </Row>
                {v2 && (
                  <div style={{ marginTop: 12, background: '#f5f7fa', borderRadius: 8, padding: '10px 14px' }}>
                    <Text strong style={{ fontSize: 12, color: colors.navy, display: 'block', marginBottom: 4 }}>Chi phí sau thẩm định</Text>
                    <Row gutter={8}>
                      <Col span={12}><Text style={{ fontSize: 12 }}>Tổng dự toán: <strong>{formatCurrency(v2.totalCost)}</strong></Text></Col>
                      <Col span={12}><Text style={{ fontSize: 12 }}>Giá đề xuất: <strong>{formatCurrency(v2.proposedPrice)}</strong></Text></Col>
                    </Row>
                  </div>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                  Trạng thái hồ sơ đã được cập nhật thành <Tag color="cyan">Đã thẩm định</Tag>
                </div>
              </div>
            ),
          });
        } else {
          Modal.info({
            title: 'Chưa có kết quả thẩm định',
            content: (
              <div>
                <p>P. Tài chính Kế toán chưa hoàn thành thẩm định hồ sơ này.</p>
                <p style={{ color: '#666', fontSize: 13 }}>Vui lòng kiểm tra lại sau hoặc liên hệ P. TC-KT để theo dõi tiến độ.</p>
              </div>
            ),
          });
        }
      }, 1500);
    };

    return (
      <div>
        {/* Trạng thái thẩm định */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size={8}>
                {sectionIcon(<AuditOutlined />, 'linear-gradient(135deg, #0891b2, #67e8f9)')}
                <Text strong style={{ color: colors.navy, fontSize: 15 }}>Trạng thái thẩm định tài chính</Text>
              </Space>
              <Button icon={<SwapOutlined />} onClick={handleSyncResult} loading={syncLoading}
                style={{ borderColor: colors.info, color: colors.info }}>
                {syncDone ? 'Đồng bộ lại' : 'Đồng bộ kết quả'}
              </Button>
            </div>
          }>
          {costReviewRequest ? (
            <div>
              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Gửi thẩm định</Text>
                  <Text strong style={{ fontSize: 13 }}>{formatDate(costReviewRequest.submittedAt)}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Người gửi</Text>
                  <Text strong style={{ fontSize: 13 }}>Phòng Kế hoạch</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Gửi đến</Text>
                  <Text strong style={{ fontSize: 13 }}>Phòng TC-KT</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Kết quả</Text>
                  {costReviewRequest.status === 'approved' ? (
                    <Tag color="green">Đã thẩm định — Đạt</Tag>
                  ) : costReviewRequest.status === 'rejected' ? (
                    <Tag color="red">Từ chối</Tag>
                  ) : (
                    <Tag color="orange">Đang chờ kết quả</Tag>
                  )}
                </Col>
              </Row>
              {costReviewRequest.reviewedAt && (
                <Row gutter={16}>
                  <Col span={6}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngày thẩm định</Text>
                    <Text style={{ fontSize: 13 }}>{formatDate(costReviewRequest.reviewedAt)}</Text>
                  </Col>
                  <Col span={18}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ý kiến TC-KT</Text>
                    <Text style={{ fontSize: 13 }}>{costReviewRequest.comment || '—'}</Text>
                  </Col>
                </Row>
              )}
              {!costReviewRequest.reviewedAt && !syncDone && (
                <div style={{ background: '#fffbe6', borderRadius: 8, padding: '12px 16px', marginTop: 8, borderLeft: '3px solid #faad14' }}>
                  <Text style={{ fontSize: 13, color: '#d97706' }}>
                    Đang chờ P. Tài chính Kế toán thẩm định. Bấm "Đồng bộ kết quả" để kiểm tra cập nhật.
                  </Text>
                </div>
              )}
              {syncDone && hasResult && (
                <div style={{ background: '#f6ffed', borderRadius: 8, padding: '12px 16px', marginTop: 8, borderLeft: '3px solid #52c41a' }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    <div>
                      <Text strong style={{ fontSize: 13, color: '#059669' }}>Đã nhận kết quả thẩm định từ P. Tài chính Kế toán</Text>
                      <Text style={{ fontSize: 12, color: '#666', display: 'block' }}>
                        Trạng thái: Đã thẩm định | Kết quả: {costReviewRequest.status === 'approved' ? 'Đạt' : 'Có điều chỉnh'} | Có thể trình BGĐ phê duyệt
                      </Text>
                    </div>
                  </Space>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: '#fafafa', borderRadius: 8, padding: 24, textAlign: 'center', border: '1px dashed #d9d9d9' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa gửi thẩm định tài chính</Text>
            </div>
          )}
        </Card>

        {/* So sánh chi phí — chỉ hiện khi có kết quả */}
        {v1 && (
          <Card className="db-chart-card" style={{ borderRadius: 14 }}
            title={
              <Space size={8}>
                {sectionIcon(<SwapOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
                <Text strong style={{ color: colors.navy, fontSize: 15 }}>So sánh chi phí gốc vs Sau thẩm định</Text>
                {hasResult && <Tag color="green">Đã có kết quả</Tag>}
              </Space>
            }>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 12px', borderBottom: `2px solid ${colors.navy}` }}>
                <Text strong style={{ fontSize: 13, color: colors.navy, flex: 1 }}>Hạng mục</Text>
                <Text strong style={{ fontSize: 13, color: colors.navy, flex: 1, textAlign: 'right' }}>Dự toán gốc (V1)</Text>
                <Text strong style={{ fontSize: 13, color: hasResult ? '#059669' : '#999', flex: 1, textAlign: 'right' }}>
                  {hasResult ? 'Sau thẩm định (V2)' : 'Chờ kết quả'}
                </Text>
                <Text strong style={{ fontSize: 13, color: colors.navy, flex: '0 0 100px', textAlign: 'right' }}>Chênh lệch</Text>
              </div>
              {costCompareRow('Chi phí vật tư', v1.materialCost, v2?.materialCost)}
              {costCompareRow('Chi phí nhân công', v1.laborCost, v2?.laborCost)}
              {costCompareRow('Chi phí thiết bị', v1.equipmentCost, v2?.equipmentCost)}
              {costCompareRow('Chi phí chung', v1.overheadCost, v2?.overheadCost)}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', background: '#f5f7fa', marginTop: 4, borderRadius: 6 }}>
                <Text strong style={{ fontSize: 14, color: colors.navy, flex: 1 }}>TỔNG DỰ TOÁN</Text>
                <Text strong style={{ fontSize: 14, color: colors.navy, flex: 1, textAlign: 'right' }}>{formatNumber(v1.totalCost)} tr</Text>
                {v2 ? (
                  <>
                    <Text strong style={{ fontSize: 14, color: '#059669', flex: 1, textAlign: 'right' }}>{formatNumber(v2.totalCost)} tr</Text>
                    <Text strong style={{
                      fontSize: 13, flex: '0 0 100px', textAlign: 'right',
                      color: v2.totalCost - v1.totalCost < 0 ? colors.success : colors.danger,
                    }}>
                      {v2.totalCost - v1.totalCost > 0 ? '+' : ''}{formatNumber(v2.totalCost - v1.totalCost)} tr
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 14, flex: 1, textAlign: 'right', color: '#999' }}>—</Text>
                    <Text style={{ fontSize: 13, flex: '0 0 100px', textAlign: 'right', color: '#999' }}>—</Text>
                  </>
                )}
              </div>
              {v2?.note && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#f6ffed', borderRadius: 8, borderLeft: '3px solid #52c41a' }}>
                  <Text strong style={{ fontSize: 12, color: '#059669' }}>Ghi chú từ P. TC-KT: </Text>
                  <Text style={{ fontSize: 13 }}>{v2.note}</Text>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 4: Phê duyệt
  // ═══════════════════════════════════════════════════════════════
  const renderApproval = () => (
    <div>
      {/* Lịch sử phê duyệt */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
        title={
          <Space size={8}>
            {sectionIcon(<SafetyCertificateOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Lịch sử phê duyệt</Text>
            <Tag color="blue">{approvalRequests.length} yêu cầu</Tag>
          </Space>
        }>
        {approvalRequests.length > 0 ? (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {approvalRequests.map(ar => {
              const resultConf = approvalResultConfig[ar.status] || { label: ar.status, color: 'default' };
              return (
                <div
                  key={ar.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    borderLeft: `3px solid ${
                      ar.status === 'approved' ? colors.success
                      : ar.status === 'rejected' ? colors.danger
                      : colors.warning
                    }`,
                  }}
                >
                  <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
                    <Col>
                      <Space size={8}>
                        <Tag color="blue" style={{ fontSize: 12 }}>{approvalTypeLabels[ar.type] || ar.type}</Tag>
                        <Tag color={resultConf.color}>{resultConf.label}</Tag>
                      </Space>
                    </Col>
                    <Col>
                      <Text style={{ fontSize: 12, color: '#999' }}>{ar.submittedAt}</Text>
                    </Col>
                  </Row>
                  <div style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>Từ: </Text>
                    <Text strong style={{ fontSize: 13 }}>{roleLabels[ar.fromRole] || ar.fromRole}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}> &rarr; Đến: </Text>
                    <Text strong style={{ fontSize: 13 }}>{roleLabels[ar.toRole] || ar.toRole}</Text>
                  </div>
                  {ar.reviewedAt && (
                    <Text style={{ fontSize: 12, color: '#999' }}>Ngày xử lý: {ar.reviewedAt}</Text>
                  )}
                  {ar.comment && (
                    <div style={{ marginTop: 6, padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                      <Text style={{ fontSize: 13 }}>{ar.comment}</Text>
                    </div>
                  )}
                </div>
              );
            })}
          </Space>
        ) : (
          <Empty description="Chưa có yêu cầu phê duyệt" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* Form comment mới */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={
          <Space size={8}>
            {sectionIcon(<EditOutlined />, 'linear-gradient(135deg, #059669, #34d399)')}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Thêm ý kiến</Text>
          </Space>
        }>
        <TextArea
          rows={3}
          value={approvalComment}
          onChange={e => setApprovalComment(e.target.value)}
          placeholder="Nhập ý kiến, nhận xét..."
          style={{ borderRadius: 8, marginBottom: 12 }}
        />
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              if (!approvalComment.trim()) {
                message.warning('Vui lòng nhập nội dung ý kiến');
                return;
              }
              message.success('Đã gửi ý kiến');
              setApprovalComment('');
            }}
            style={{ background: colors.navy }}
          >
            Gửi ý kiến
          </Button>
        </div>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // TAB 5: Hợp đồng
  // ═══════════════════════════════════════════════════════════════
  const renderContract = () => {
    if (linkedContract) {
      return (
        <Card className="db-chart-card" style={{ borderRadius: 14 }}
          title={
            <Space size={8}>
              {sectionIcon(<FileProtectOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 15 }}>Hợp đồng liên kết</Text>
            </Space>
          }>
          <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}>
            <Descriptions.Item label="Mã hợp đồng">
              <Text strong style={{ color: colors.navy }}>{linkedContract.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={linkedContract.status === 'executing' ? 'cyan' : linkedContract.status === 'signed' ? 'purple' : 'blue'}>
                {linkedContract.status === 'executing' ? 'Đang thực hiện'
                  : linkedContract.status === 'signed' ? 'Đã ký kết'
                  : linkedContract.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên hợp đồng" span={2}>{linkedContract.name}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={linkedContract.contractType === 'contract' ? 'blue' : 'purple'}>
                {linkedContract.contractType === 'contract' ? 'Hợp đồng' : 'Quyết định giao NV'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị đối tác">{linkedContract.partnerUnit}</Descriptions.Item>
            <Descriptions.Item label="Giá trị hợp đồng">
              <Text strong style={{ color: colors.navy }}>{formatCurrencyFull(linkedContract.contractValue)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tạm ứng">
              <Text strong style={{ color: colors.success }}>{formatCurrencyFull(linkedContract.advancePayment)}</Text>
            </Descriptions.Item>
            {linkedContract.signedDate && (
              <Descriptions.Item label="Ngày ký">{linkedContract.signedDate}</Descriptions.Item>
            )}
            <Descriptions.Item label="Thời gian thực hiện">
              {linkedContract.startDate} — {linkedContract.endDate}
            </Descriptions.Item>
            {linkedContract.signedBy && (
              <Descriptions.Item label="Người ký">{linkedContract.signedBy}</Descriptions.Item>
            )}
          </Descriptions>
          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              style={{ background: colors.navy }}
              onClick={() => navigate(`/contracts/${linkedContract.id}`)}
            >
              Xem chi tiết hợp đồng
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={
          <Space size={8}>
            {sectionIcon(<FileProtectOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Hợp đồng</Text>
          </Space>
        }>
        <Empty
          description="Chưa có hợp đồng liên kết"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => navigate(`/contracts/create?proposalId=${proposal.id}`)}
            style={{ background: colors.navy }}
          >
            Tạo hợp đồng
          </Button>
        </Empty>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RIGHT SIDEBAR
  // ═══════════════════════════════════════════════════════════════
  const renderActions = () => {
      const status = proposal.status;
      const btnStyle: React.CSSProperties = { borderRadius: 8, height: 38, padding: '0 20px' };

      switch (status) {
        case 'pending_cost_review':
          return (
            <Button type="primary" icon={<SendOutlined />} style={{ ...btnStyle, background: colors.navy }}
              onClick={() => handleOpenAssign('cost_review')}>Gửi thẩm định TC</Button>
          );
        case 'cost_reviewing':
          return (
            <>
              <Button type="primary" icon={<CheckCircleOutlined />} style={{ ...btnStyle, background: colors.success }}
                onClick={() => message.success('Đã duyệt chi phí')}>Duyệt chi phí</Button>
              <Button icon={<EditOutlined />} style={{ ...btnStyle, borderColor: colors.warning, color: colors.warning }}
                onClick={() => message.info('Chuyển sang điều chỉnh chi phí')}>Điều chỉnh chi phí</Button>
              <Button danger icon={<CloseCircleOutlined />} style={btnStyle}
                onClick={() => message.info('TC đã từ chối')}>TC từ chối</Button>
            </>
          );
        case 'cost_reviewed':
          return (
            <Button type="primary" icon={<SendOutlined />} style={{ ...btnStyle, background: colors.navy }}
              onClick={() => handleOpenAssign('approval')}>Trình BGĐ phê duyệt</Button>
          );
        case 'cost_rejected':
        case 'revision':
          return (
            <Button type="primary" icon={<EditOutlined />} style={{ ...btnStyle, background: colors.warning }}
              onClick={() => message.info('Chuyển sang chỉnh sửa')}>Chỉnh sửa lại</Button>
          );
        case 'pending_approval':
          return null;
        case 'approved':
          return (
            <Button type="primary" icon={<SendOutlined />} style={{ ...btnStyle, background: '#7c3aed' }}
              onClick={() => message.success('Bắt đầu đàm phán')}>Bắt đầu đàm phán</Button>
          );
        case 'negotiating':
          return (
            <Button type="primary" icon={<FileDoneOutlined />} style={{ ...btnStyle, background: colors.navy }}
              onClick={() => navigate(`/contracts/create?proposalId=${proposal.id}`)}>Tạo hợp đồng</Button>
          );
        case 'contract_created':
          return (
            <Button type="primary" icon={<FileProtectOutlined />} style={{ ...btnStyle, background: colors.navy }}
              onClick={() => message.success('Đã trình ký kết hợp đồng')}>Trình ký kết</Button>
          );
        case 'contract_signed':
          return (
            <Button disabled icon={<CheckCircleOutlined />} style={btnStyle}>Đã hoàn thành</Button>
          );
        default:
          return null;
      }
  };

  const renderSidebar = () => {
    return (
      <div style={{ position: 'sticky', top: 80 }}>
        {/* Workflow Steps */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
          <Text strong style={{ color: colors.navy, fontSize: 14, display: 'block', marginBottom: 16 }}>Quy trình xử lý</Text>
          <Steps
            direction="vertical"
            size="small"
            current={currentStep}
            items={[
              { title: <Text style={{ fontSize: 13 }}>Đề xuất</Text>, description: <Text style={{ fontSize: 12, color: '#999' }}>Lập và trình duyệt</Text> },
              { title: <Text style={{ fontSize: 13 }}>Thẩm định</Text>, description: <Text style={{ fontSize: 12, color: '#999' }}>P. Tài chính Kế toán</Text> },
              { title: <Text style={{ fontSize: 13 }}>Phê duyệt</Text>, description: <Text style={{ fontSize: 12, color: '#999' }}>Ban Giám đốc</Text> },
              { title: <Text style={{ fontSize: 13 }}>Đàm phán</Text>, description: <Text style={{ fontSize: 12, color: '#999' }}>Thống nhất điều khoản</Text> },
              { title: <Text style={{ fontSize: 13 }}>Ký kết</Text>, description: <Text style={{ fontSize: 12, color: '#999' }}>Hợp đồng / QĐ giao NV</Text> },
            ]}
          />
        </Card>

        {/* Audit Timeline */}
        <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 16 } }}>
          <Text strong style={{ color: colors.navy, fontSize: 14, display: 'block', marginBottom: 16 }}>Lịch sử thay đổi</Text>
          {auditLogs.length > 0 ? (
            <Timeline
              items={auditLogs.map(log => ({
                color: auditLogColor(log.action),
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{log.action}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{log.performedBy}</Text>
                    <div>
                      <ClockCircleOutlined style={{ fontSize: 11, color: '#999', marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: '#999' }}>{formatDateTime(log.performedAt)}</Text>
                    </div>
                  </div>
                ),
              }))}
            />
          ) : (
            <Text style={{ fontSize: 13, color: '#999' }}>Chưa có lịch sử</Text>
          )}
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════
  const tabItems = [
    {
      key: 'technical',
      label: <span><ToolOutlined style={{ marginRight: 6 }} />Phương án kỹ thuật</span>,
      children: renderTechnicalPlan(),
    },
    {
      key: 'cost',
      label: <span><DollarOutlined style={{ marginRight: 6 }} />Dự toán chi phí</span>,
      children: renderCostEstimate(),
    },
    {
      key: 'review',
      label: <span><AuditOutlined style={{ marginRight: 6 }} />Thẩm định</span>,
      children: renderReview(),
    },
    {
      key: 'approval',
      label: <span><SafetyCertificateOutlined style={{ marginRight: 6 }} />Phê duyệt</span>,
      children: renderApproval(),
    },
    {
      key: 'contract',
      label: <span><FileProtectOutlined style={{ marginRight: 6 }} />Hợp đồng</span>,
      children: renderContract(),
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Hero Banner */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#fff' }} onClick={() => navigate(-1)} />
            <AuditOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                {proposal.code} — {mission ? mission.name : 'Đề xuất'}
              </Title>
              <Space size={6} style={{ marginTop: 4 }}>
                {mission && (
                  <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                    {mission.code}
                  </Tag>
                )}
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  {proposalStatus.label}
                </Tag>
              </Space>
            </div>
          </Space>
          <Tag color={proposalStatus.color} style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}>
            {proposalStatus.label}
          </Tag>
        </div>

        {/* Metadata row */}
        <div style={{ padding: '14px 24px', background: '#fff', display: 'flex', gap: 32, flexWrap: 'wrap', borderTop: '1px solid #f0f0f0' }}>
          {mission && (
            <>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Mã NV</Text>
                <Text strong style={{ fontSize: 13 }}>{mission.code}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tên NV</Text>
                <Text strong style={{ fontSize: 13 }}>{mission.name}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Đơn vị yêu cầu</Text>
                <Text strong style={{ fontSize: 13 }}>{mission.requestingUnit}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Loại NV</Text>
                {missionType
                  ? <Tag color={missionType.color} style={{ margin: 0 }}>{missionType.label}</Tag>
                  : <Text strong style={{ fontSize: 13 }}>{mission.missionType}</Text>
                }
              </div>
            </>
          )}
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tổng dự toán</Text>
            <Text strong style={{ fontSize: 13, color: colors.navy }}>{formatCurrency(proposal.totalCost)}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Giá đề xuất</Text>
            <Text strong style={{ fontSize: 13, color: colors.gold }}>{formatCurrency(proposal.proposedPrice)}</Text>
          </div>
        </div>
      </Card>

      {/* Main Content: 2 columns */}
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="technical" items={tabItems} type="card" />
        </Col>
        <Col xs={24} lg={8}>
          {renderSidebar()}
        </Col>
      </Row>

      {/* Sticky Footer — Thao tác chính */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff', padding: '12px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {proposalStatusConfig[proposal.status]?.label || proposal.status}
        </Text>
        <Space>
          {renderActions()}
        </Space>
      </div>

      {/* Drawer gán người xử lý */}
      <Drawer
        title={null}
        placement="right"
        width={480}
        open={assignDrawerOpen}
        onClose={() => setAssignDrawerOpen(false)}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setAssignDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: colors.navy, borderColor: colors.navy }}
              onClick={handleConfirmAssign}>
              {assignType === 'cost_review' ? 'Gửi thẩm định' : 'Trình phê duyệt'}
            </Button>
          </div>
        }
      >
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SendOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {assignType === 'cost_review' ? 'Gửi thẩm định tài chính' : 'Trình lãnh đạo phê duyệt'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {proposal.code} — {mission?.name || ''}
              </div>
            </div>
          </Space>
        </div>

        <div style={{ padding: 20 }}>
          {/* Thông tin hồ sơ */}
          <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', marginBottom: 20, borderLeft: `3px solid ${colors.navy}` }}>
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Tổng dự toán</Text>
                <div><Text strong style={{ fontSize: 14, color: colors.navy }}>{formatCurrency(proposal.totalCost)}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Giá đề xuất</Text>
                <div><Text strong style={{ fontSize: 14, color: colors.success }}>{formatCurrency(proposal.proposedPrice)}</Text></div>
              </Col>
            </Row>
          </div>

          <Form form={assignForm} layout="vertical" requiredMark="optional">
            <Form.Item
              label={assignType === 'cost_review' ? 'Chọn người thẩm định (Phòng TC-KT)' : 'Chọn người phê duyệt (Ban Giám đốc)'}
              name="reviewer"
              rules={[{ required: true, message: 'Vui lòng chọn người xử lý' }]}
            >
              <Select placeholder="Chọn người xử lý" size="large" optionLabelProp="label">
                {(assignType === 'cost_review' ? reviewersByRole.TCKT : reviewersByRole.BGD).map(person => (
                  <Select.Option key={person.id} value={person.id} label={person.name}>
                    <div>
                      <Text strong style={{ fontSize: 13 }}>{person.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{person.position}</Text>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Ghi chú / Yêu cầu" name="note">
              <Input.TextArea rows={3} placeholder={
                assignType === 'cost_review'
                  ? 'Đề nghị thẩm định chi phí, lưu ý kiểm tra đơn giá vật tư...'
                  : 'Kính trình lãnh đạo phê duyệt phương án và dự toán...'
              } />
            </Form.Item>

            <Form.Item label="Mức độ ưu tiên" name="priority" initialValue="normal">
              <Select>
                <Select.Option value="urgent">Khẩn cấp</Select.Option>
                <Select.Option value="high">Cao</Select.Option>
                <Select.Option value="normal">Bình thường</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default ApprovalWorkflowPage;
