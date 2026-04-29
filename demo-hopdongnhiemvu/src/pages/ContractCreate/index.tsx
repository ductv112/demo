import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Button, Row, Col, Typography, Space, Steps, Table, Upload,
  Form, Input, Select, InputNumber, Descriptions,
  Tag, Result, message, DatePicker, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, FileTextOutlined,
  SaveOutlined, SendOutlined, DollarOutlined,
  AuditOutlined, SolutionOutlined, EditOutlined,
  FieldTimeOutlined, ToolOutlined, TeamOutlined,
  InboxOutlined, ScanOutlined, CheckCircleOutlined,
  UploadOutlined, UserSwitchOutlined, ShopOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { missions, proposals } from '../../data/missions';
import { contracts } from '../../data/contracts';
import { approvalRequests } from '../../data/approvals';
import { departments } from '../../data/departments';
import {
  formatCurrency, formatDate,
  missionTypeConfig, missionPriorityConfig,
  proposalStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Text } = Typography;

const sectionIcon = (icon: React.ReactNode, gradient: string) => (
  <div style={{
    width: 28, height: 28, borderRadius: 7, background: gradient,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>{icon}</div>
);

const contractTypeConfig: Record<string, string> = {
  contract: 'Hop dong',
  assignment: 'Quyet dinh giao NV',
};

// Mock staff per department (tham chiếu từ Phân hệ Quản lý Nguồn lực)
const staffByDept: Record<string, { id: string; name: string; position: string }[]> = {
  PX1: [
    { id: 'PX1-01', name: 'Nguyễn Thanh Sơn', position: 'Trưởng Trung tâm Alpha' },
    { id: 'PX1-02', name: 'Lê Đức Hải', position: 'Trưởng nhóm hệ thống monitoring' },
    { id: 'PX1-03', name: 'Nguyễn Văn An', position: 'Chuyên viên hệ thống monitoring' },
    { id: 'PX1-04', name: 'Trần Quốc Bình', position: 'Nhân viên điện tử' },
  ],
  PX2: [
    { id: 'PX2-01', name: 'Bùi Minh Trí', position: 'Trưởng Trung tâm Beta' },
    { id: 'PX2-02', name: 'Phạm Văn Hùng', position: 'Trưởng nhóm Module CRM' },
    { id: 'PX2-03', name: 'Đặng Minh Khoa', position: 'Chuyên viên hạ tầng' },
  ],
  PX3: [
    { id: 'PX3-01', name: 'Lý Hoàng Nam', position: 'Trưởng Trung tâm Gamma' },
    { id: 'PX3-02', name: 'Đỗ Văn Lực', position: 'Trưởng nhóm hạ tầng' },
    { id: 'PX3-03', name: 'Vũ Tiến Dũng', position: 'Nhân viên kỹ thuật' },
  ],
  PX4: [
    { id: 'PX4-01', name: 'Trần Anh Dũng', position: 'Trưởng Trung tâm Phần mềm' },
    { id: 'PX4-02', name: 'Hoàng Thị Thu', position: 'Chuyên viên điện tử' },
    { id: 'PX4-03', name: 'Nguyễn Đức Long', position: 'Nhân viên điện tử' },
  ],
  PKT: [
    { id: 'PKT-01', name: 'Vũ Đình Thắng', position: 'Trưởng phòng KT' },
    { id: 'PKT-02', name: 'Đinh Văn Minh', position: 'Kỹ sư thiết kế' },
    { id: 'PKT-03', name: 'Cao Thị Hương', position: 'Kỹ sư công nghệ' },
  ],
  PKCDB: [
    { id: 'KCS-01', name: 'Đỗ Quang Huy', position: 'Trưởng phòng KCS' },
    { id: 'KCS-02', name: 'Nguyễn Thị Ngọc', position: 'Kiểm định viên' },
  ],
};

const technicalDepts = ['PX1', 'PX2', 'PX3', 'PX4', 'PKT', 'PKCDB'];

const ContractCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProposalId = searchParams.get('proposalId') || '';

  const [selectedProposalId, setSelectedProposalId] = useState(initialProposalId);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [ocrDone, setOcrDone] = useState(false);

  // State phân công nguồn lực (step 4)
  const [assignments, setAssignments] = useState<Record<string, { unit: string; lead: string }>>({});

  const updateAssignment = (wvId: string, field: 'unit' | 'lead', value: string) => {
    setAssignments(prev => ({
      ...prev,
      [wvId]: { ...(prev[wvId] || { unit: '', lead: '' }), [field]: value },
    }));
  };

  // Tự động điền kết quả thẩm định từ approvalRequests
  useEffect(() => {
    if (initialProposalId) autoFillAssessment(initialProposalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoFillAssessment = (proposalId: string) => {
    const costReview = approvalRequests.find(
      ar => ar.proposalId === proposalId && ar.type === 'cost_review' && ar.status === 'approved',
    );
    if (costReview) {
      form.setFieldsValue({
        assessmentResult: 'approved',
        assessmentNote: costReview.comment || 'Đã thẩm định và đồng ý dự toán.',
      });
    }
  };

  // Proposals that are approved and don't already have a contract
  const availableProposals = useMemo(() => {
    const linkedProposalIds = contracts.map(c => c.proposalId);
    return proposals.filter(p => p.status === 'approved' && !linkedProposalIds.includes(p.id));
  }, []);

  const selectedProposal = proposals.find(p => p.id === selectedProposalId);
  const linkedMission = selectedProposal ? missions.find(m => m.id === selectedProposal.missionId) : null;

  // Auto-generated code
  const nextCode = useMemo(() => {
    const existingCodes = contracts.filter(c => c.contractType === 'contract').length;
    return `HĐ-2026-${String(existingCodes + 1).padStart(3, '0')}`;
  }, []);

  const handleNext = async () => {
    try {
      if (currentStep === 0 && !selectedProposal) {
        message.warning('Vui lòng chọn đề xuất');
        return;
      }
      if (currentStep === 1) {
        await form.validateFields(['assessmentResult']);
      }
      if (currentStep === 2) {
        await form.validateFields(['contractType', 'name', 'partnerUnit', 'contractValue', 'startDate', 'endDate']);
      }
      setCurrentStep(prev => prev + 1);
    } catch {
      message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
  };

  const handleSubmit = () => {
    message.success('Đã lưu và trình duyệt hợp đồng thành công');
    navigate('/contracts');
  };

  const stepItems = [
    { title: 'Hồ sơ ĐX', icon: <FileTextOutlined /> },
    { title: 'Thẩm định CP', icon: <DollarOutlined /> },
    { title: 'Nội dung HĐ', icon: <EditOutlined /> },
    { title: 'Phân công NL', icon: <UserSwitchOutlined /> },
    { title: 'Xem lại', icon: <AuditOutlined /> },
    { title: 'Trình duyệt', icon: <SendOutlined /> },
  ];

  // ─── Step 1: Hồ sơ đề xuất ────────────────────────────────
  const renderStep1 = () => {
    const typeCfg = linkedMission ? missionTypeConfig[linkedMission.missionType] : null;
    const prioCfg = linkedMission ? missionPriorityConfig[linkedMission.priority] : null;
    const proposalStatusCfg = selectedProposal ? proposalStatusConfig[selectedProposal.status] : null;

    return (
      <div>
        {/* Chọn đề xuất */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              {sectionIcon(<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Chọn đề xuất đã duyệt</Text>
            </Space>
          </div>
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Chọn đề xuất đã được phê duyệt để lập hợp đồng"
            value={selectedProposalId || undefined}
            onChange={(val) => {
              setSelectedProposalId(val);
              const p = proposals.find(pr => pr.id === val);
              const m = p ? missions.find(ms => ms.id === p.missionId) : null;
              if (p && m) {
                form.setFieldsValue({
                  name: `HĐ ${m.name.toLowerCase()}`,
                  partnerUnit: m.requestingUnit,
                  contractValue: p.proposedPrice,
                  contractType: 'contract',
                });
              }
              autoFillAssessment(val);
            }}
            optionFilterProp="label"
            size="large"
            options={availableProposals.map(p => {
              const m = missions.find(ms => ms.id === p.missionId);
              return {
                value: p.id,
                label: `${p.code} — ${m?.name || 'Không rõ'} (${formatCurrency(p.proposedPrice)})`,
              };
            })}
          />
        </Card>

        {/* Hồ sơ đề xuất */}
        {selectedProposal ? (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              {/* Cột trái: PA kỹ thuật + NV liên kết */}
              <Col xs={24} lg={12}>
                <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16, height: 'calc(100% - 16px)' }} styles={{ body: { padding: 20 } }}>
                  <div style={{ marginBottom: 16 }}>
                    <Space align="center" size={8}>
                      {sectionIcon(<SolutionOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #059669, #34d399)')}
                      <Text strong style={{ color: colors.navy, fontSize: 14 }}>Phương án kỹ thuật</Text>
                      <Tag color="blue">{selectedProposal.code}</Tag>
                      {proposalStatusCfg && <Tag color={proposalStatusCfg.color}>{proposalStatusCfg.label}</Tag>}
                    </Space>
                  </div>
                  <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600, color: colors.navy, width: 140, fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                    <Descriptions.Item label="Phương án KT">{selectedProposal.technicalPlan}</Descriptions.Item>
                    <Descriptions.Item label="Quy trình CN">{selectedProposal.workProcess}</Descriptions.Item>
                    {selectedProposal.configReference && (
                      <Descriptions.Item label="Tham chiếu CH"><Tag color="purple">{selectedProposal.configReference}</Tag></Descriptions.Item>
                    )}
                    <Descriptions.Item label="Thời gian DK"><Text strong style={{ color: colors.navy }}>{selectedProposal.estimatedDuration} ngày</Text></Descriptions.Item>
                  </Descriptions>
                  {/* NV liên kết */}
                  {linkedMission && (
                    <div style={{ marginTop: 16, padding: '12px 16px', background: `${colors.navy}06`, borderRadius: 8, borderLeft: `3px solid ${colors.navy}` }}>
                      <Text strong style={{ fontSize: 12, color: colors.navy, display: 'block', marginBottom: 6 }}>Nhiệm vụ: {linkedMission.code}</Text>
                      <Row gutter={[8, 4]}>
                        <Col span={24}><Text style={{ fontSize: 12 }}>{linkedMission.name}</Text></Col>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>Đơn vị: </Text><Text style={{ fontSize: 11 }}>{linkedMission.requestingUnit}</Text></Col>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>Sản phẩm/Hệ thống: </Text><Text style={{ fontSize: 11 }}>{linkedMission.equipmentType} x{linkedMission.equipmentQuantity}</Text></Col>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>Loại: </Text>{typeCfg && <Tag color={typeCfg.color} style={{ fontSize: 10 }}>{typeCfg.label}</Tag>}</Col>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>Ưu tiên: </Text>{prioCfg && <Tag color={prioCfg.color} style={{ fontSize: 10 }}>{prioCfg.label}</Tag>}</Col>
                      </Row>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Cột phải: Khối lượng CV */}
              <Col xs={24} lg={12}>
                <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16, height: 'calc(100% - 16px)' }} styles={{ body: { padding: 20 } }}>
                  <div style={{ marginBottom: 16 }}>
                    <Space align="center" size={8}>
                      {sectionIcon(<FieldTimeOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #d97706, #fbbf24)')}
                      <Text strong style={{ color: colors.navy, fontSize: 14 }}>Khối lượng công việc</Text>
                      <Tag color="blue">{selectedProposal.workVolumes.length} hạng mục</Tag>
                    </Space>
                  </div>
                  <Table
                    dataSource={selectedProposal.workVolumes}
                    columns={[
                      { title: 'STT', key: 'i', width: 40, render: (_: unknown, __: unknown, i: number) => i + 1 },
                      { title: 'Hạng mục', dataIndex: 'name', key: 'name', ellipsis: true },
                      { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60 },
                      { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 45, align: 'center' as const },
                      { title: 'Ngày', dataIndex: 'estimatedDays', key: 'estimatedDays', width: 55, align: 'center' as const, render: (v: number) => <Text strong>{v}</Text> },
                      { title: 'ĐV TH', dataIndex: 'assignedUnit', key: 'assignedUnit', width: 70, render: (id: string) => { const d = departments.find(x => x.id === id); return d ? <Tag style={{ fontSize: 10 }}>{d.shortName}</Tag> : id; } },
                    ]}
                    rowKey="id" pagination={false} size="small"
                    summary={() => {
                      const totalDays = selectedProposal.workVolumes.reduce((s, w) => s + w.estimatedDays, 0);
                      return (<Table.Summary.Row style={{ background: '#f5f7fa' }}>
                        <Table.Summary.Cell index={0} colSpan={4}><Text strong style={{ fontSize: 12 }}>Tổng</Text></Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="center"><Text strong style={{ color: colors.navy, fontSize: 12 }}>{totalDays}</Text></Table.Summary.Cell>
                        <Table.Summary.Cell index={2} />
                      </Table.Summary.Row>);
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Chi phí dự toán: stat cards + bảng chi tiết */}
            <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
              <div style={{ marginBottom: 16 }}>
                <Space align="center" size={8}>
                  {sectionIcon(<DollarOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>Chi phí dự toán</Text>
                </Space>
              </div>

              {/* Stat cards */}
              <Row gutter={12} style={{ marginBottom: 16 }}>
                {[
                  { label: 'Vật tư', value: selectedProposal.materialCost, gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', icon: <ToolOutlined /> },
                  { label: 'Nhân công', value: selectedProposal.laborCost, gradient: 'linear-gradient(135deg, #059669, #34d399)', icon: <TeamOutlined /> },
                  { label: 'Thiết bị', value: selectedProposal.equipmentCost, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', icon: <ToolOutlined /> },
                  { label: 'Chi phí chung', value: selectedProposal.overheadCost, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: <DollarOutlined /> },
                ].map((item, idx) => (
                  <Col xs={12} md={6} key={idx}>
                    <div style={{ background: item.gradient, borderRadius: 10, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
                      <div className="db-bg-icon" style={{ position: 'absolute', top: -6, right: -6, fontSize: 48, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>{item.icon}</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{formatCurrency(item.value)}</div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Bảng chi tiết */}
              <Table
                dataSource={selectedProposal.costItems}
                columns={[
                  { title: 'STT', key: 'i', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
                  { title: 'Hạng mục chi phí', dataIndex: 'name', key: 'name' },
                  { title: 'Nhóm', dataIndex: 'category', key: 'category', width: 120, render: (cat: string) => { const c: Record<string, {label:string;color:string}> = { material:{label:'Vật tư',color:'#2563eb'}, labor:{label:'Nhân công',color:'#059669'}, equipment:{label:'Thiết bị',color:'#d97706'}, overhead:{label:'CP chung',color:'#7c3aed'}, other:{label:'Khác',color:'#999'} }; const cfg = c[cat]; return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : cat; } },
                  { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 100 },
                  { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' as const },
                  { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, align: 'right' as const },
                  { title: 'Thành tiền (tr)', dataIndex: 'totalPrice', key: 'totalPrice', width: 110, align: 'right' as const, render: (v: number) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
                ]}
                rowKey="id" pagination={false} size="small"
                summary={() => (
                  <Table.Summary.Row style={{ background: '#f5f7fa' }}>
                    <Table.Summary.Cell index={0} colSpan={6} align="right"><Text strong>TỔNG CỘNG</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: colors.navy, fontSize: 14 }}>{formatCurrency(selectedProposal.totalCost)}</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />

              {/* Tổng hợp */}
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', borderLeft: `4px solid ${colors.navy}` }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tổng dự toán</Text>
                    <Text strong style={{ fontSize: 18, color: colors.navy }}>{formatCurrency(selectedProposal.totalCost)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: '#f6ffed', borderRadius: 8, padding: '12px 16px', borderLeft: '4px solid #52c41a' }}>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá đề xuất</Text>
                    <Text strong style={{ fontSize: 18, color: '#059669' }}>{formatCurrency(selectedProposal.proposedPrice)}</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </>
        ) : (
          <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 40, textAlign: 'center' } }}>
            <Text type="secondary" style={{ fontSize: 14 }}>Vui lòng chọn đề xuất đã duyệt để xem thông tin hồ sơ</Text>
          </Card>
        )}
      </div>
    );
  };

  // ─── Step 2: Thẩm định chi phí ────────────────────────────
  const renderStep2 = () => {
    if (!selectedProposal) return null;

    const costBreakdown = [
      { label: 'Chi phí vật tư', value: selectedProposal.materialCost, color: '#1890ff', bg: 'linear-gradient(135deg, #e6f7ff, #bae7ff)' },
      { label: 'Chi phí nhân công', value: selectedProposal.laborCost, color: '#52c41a', bg: 'linear-gradient(135deg, #f6ffed, #d9f7be)' },
      { label: 'Chi phí thiết bị', value: selectedProposal.equipmentCost, color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f0ff, #d3adf7)' },
      { label: 'Chi phí chung', value: selectedProposal.overheadCost, color: '#d97706', bg: 'linear-gradient(135deg, #fffbe6, #ffe58f)' },
      { label: 'TỔNG DỰ TOÁN', value: selectedProposal.totalCost, color: colors.navy, bg: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` },
    ];

    return (
      <>
        {/* Cost breakdown display */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              {sectionIcon(<DollarOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #7c3aed, #a78bfa)')}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Chi phí từ đề xuất & dự toán</Text>
              <Tag color="blue">{selectedProposal.code}</Tag>
            </Space>
          </div>

          <Row gutter={12} style={{ marginBottom: 16 }}>
            {costBreakdown.map((card, idx) => {
              const isTotal = idx === costBreakdown.length - 1;
              return (
                <Col xs={12} md={isTotal ? 8 : 4} key={card.label}>
                  <Card style={{
                    borderRadius: 10, border: 'none', background: card.bg,
                    textAlign: 'center',
                  }} styles={{ body: { padding: '12px 8px' } }}>
                    <div style={{ fontSize: 11, color: isTotal ? 'rgba(255,255,255,0.8)' : card.color, fontWeight: 500, marginBottom: 4 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: isTotal ? 20 : 16, fontWeight: 700, color: isTotal ? '#fff' : card.color }}>
                      {formatCurrency(card.value)}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', borderRadius: 8, background: '#f0f7ff',
            borderLeft: `4px solid ${colors.navy}`, marginBottom: 8,
          }}>
            <Text style={{ fontSize: 13 }}>Giá đề xuất</Text>
            <Text strong style={{ color: colors.success, fontSize: 16 }}>{formatCurrency(selectedProposal.proposedPrice)}</Text>
          </div>
        </Card>

        {/* Assessment form */}
        <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 12 }}>
            <Space align="center" size={8}>
              {sectionIcon(<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Kết quả thẩm định với phân hệ TC-KT</Text>
            </Space>
          </div>
          {approvalRequests.some(ar => ar.proposalId === selectedProposalId && ar.type === 'cost_review' && ar.status === 'approved') && (
            <Alert
              type="success"
              showIcon
              message="Đã tự động điền từ kết quả thẩm định"
              description="Đề xuất này đã được P. Tài chính Kế toán thẩm định và chấp thuận. Bạn có thể chỉnh sửa nếu cần."
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}
          <Form.Item
            label="Ghi nhận kết quả thẩm định"
            name="assessmentNote"
          >
            <Input.TextArea rows={4} placeholder="Ghi nhận kết quả thẩm định chi phí với phân hệ Tài chính Kế toán..." />
          </Form.Item>
          <Form.Item
            label="Kết quả thẩm định"
            name="assessmentResult"
            rules={[{ required: true, message: 'Vui lòng chọn kết quả thẩm định' }]}
          >
            <Select placeholder="Chọn kết quả thẩm định" size="large">
              <Select.Option value="approved">
                <Tag color="green">Đồng ý dự toán</Tag>
              </Select.Option>
              <Select.Option value="adjusted">
                <Tag color="orange">Điều chỉnh dự toán</Tag>
              </Select.Option>
              <Select.Option value="rejected">
                <Tag color="red">Từ chối dự toán</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Card>
      </>
    );
  };

  // ─── Step 3: Upload hợp đồng + OCR + Dữ liệu quản lý ─────
  const handleOcrSimulate = () => {
    message.loading({ content: 'Đang quét OCR hợp đồng...', key: 'ocr', duration: 2 });
    setTimeout(() => {
      // Giả lập OCR trích xuất dữ liệu từ file upload
      if (selectedProposal && linkedMission) {
        form.setFieldsValue({
          contractType: 'contract',
          name: `HĐ ${linkedMission.name.toLowerCase()}`,
          partnerUnit: linkedMission.requestingUnit,
          contractValue: selectedProposal.proposedPrice,
          advancePayment: Math.round(selectedProposal.proposedPrice * 0.3),
        });
      }
      setOcrDone(true);
      message.success({ content: 'OCR hoàn tất — dữ liệu đã được trích xuất tự động', key: 'ocr' });
    }, 2000);
  };

  const renderStep3 = () => (
    <div>
      {/* Upload file hợp đồng */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            {sectionIcon(<UploadOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #7c3aed, #a78bfa)')}
            <Text strong style={{ color: colors.navy, fontSize: 14 }}>Tải lên hợp đồng</Text>
          </Space>
        </div>
        <Form.Item name="contractFile" valuePropName="fileList" getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}>
          <Upload.Dragger
            beforeUpload={() => false}
            accept=".pdf,.doc,.docx"
            maxCount={1}
            onChange={(info) => {
              if (info.fileList.length > 0 && !ocrDone) {
                handleOcrSimulate();
              }
            }}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: colors.navyLight, fontSize: 40 }} /></p>
            <p className="ant-upload-text" style={{ fontSize: 14 }}>Kéo thả hoặc nhấn để tải lên file hợp đồng</p>
            <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
              Hệ thống sẽ tự động quét OCR và trích xuất thông tin quản lý (PDF, Word)
            </p>
          </Upload.Dragger>
        </Form.Item>
        {ocrDone && (
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8,
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            <div>
              <Text strong style={{ fontSize: 13, color: '#52c41a' }}>OCR hoàn tất</Text>
              <Text style={{ fontSize: 12, color: '#666', display: 'block' }}>Dữ liệu đã được trích xuất tự động. Vui lòng kiểm tra và chỉnh sửa nếu cần.</Text>
            </div>
          </div>
        )}
      </Card>

      {/* Dữ liệu quản lý hợp đồng — chỉ hiện sau khi OCR hoàn tất */}
      {ocrDone && <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            {sectionIcon(<EditOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 14 }}>Dữ liệu quản lý hợp đồng</Text>
            {ocrDone && <Tag color="green"><ScanOutlined /> Trích xuất từ OCR</Tag>}
          </Space>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Dữ liệu được trích xuất tự động từ file hợp đồng. Kiểm tra và chỉnh sửa nếu cần.</Text>
          </div>
        </div>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Loại hợp đồng" name="contractType"
              rules={[{ required: true, message: 'Chọn loại' }]} initialValue="contract">
              <Select>
                <Select.Option value="contract">Hợp đồng</Select.Option>
                <Select.Option value="assignment">Quyết định giao NV</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Mã hợp đồng (tự sinh)">
              <Input value={nextCode} disabled style={{ fontWeight: 600, color: colors.navy }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Số hợp đồng gốc" name="originalCode">
              <Input placeholder="VD: 25/2026/HĐ-DNA" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Tên hợp đồng" name="name"
          rules={[{ required: true, message: 'Nhập tên' }]}>
          <Input placeholder="VD: HĐ nâng cấp hệ thống monitoring P-18 server-1245" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Khách hàng / Bên A" name="partnerUnit"
              rules={[{ required: true, message: 'Nhập khách hàng' }]}>
              <Input placeholder="VD: Khối K01" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Giá trị hợp đồng (triệu đồng)" name="contractValue"
              rules={[{ required: true, message: 'Nhập giá trị' }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 1650" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Tạm ứng (triệu đồng)" name="advancePayment">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 495" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Ngày bắt đầu" name="startDate"
              rules={[{ required: true, message: 'Chọn ngày' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Ngày kết thúc" name="endDate"
              rules={[{ required: true, message: 'Chọn ngày' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Điều khoản chính" name="terms">
          <Input.TextArea rows={3} placeholder="Nhập tóm tắt điều khoản chính (hoặc để trống nếu đã có trong file)..." />
        </Form.Item>
      </Card>}
    </div>
  );

  // ─── Step 4: Phân công nguồn lực ─────────────────────────
  const renderStep4 = () => {
    const workVolumes = selectedProposal?.workVolumes || [];
    const materials = (selectedProposal?.costItems || []).filter((ci: any) => ci.category === 'material');
    const allAssigned = workVolumes.every(wv => assignments[wv.id]?.unit && assignments[wv.id]?.lead);

    return (
      <div>
        {!selectedProposal && (
          <Alert type="warning" showIcon message="Vui lòng chọn đề xuất ở Bước 1 trước khi phân công nguồn lực." style={{ marginBottom: 16, borderRadius: 8 }} />
        )}

        {/* Phân công đơn vị & cán bộ phụ trách */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space align="center" size={8}>
              {sectionIcon(<UserSwitchOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, #7c3aed, #a78bfa)`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Phân công đơn vị & cán bộ phụ trách</Text>
              <Tag color="purple">{workVolumes.length} hạng mục</Tag>
            </Space>
            {allAssigned && <Tag color="green"><CheckCircleOutlined /> Đã phân công đầy đủ</Tag>}
          </div>
          {workVolumes.length === 0 ? (
            <Alert type="info" showIcon message="Chọn đề xuất để xem danh sách hạng mục công việc." />
          ) : (
            <div>
              {workVolumes.map((wv: any, idx: number) => {
                const asgn = assignments[wv.id] || { unit: wv.assignedUnit || '', lead: '' };
                const deptStaff = staffByDept[asgn.unit] || [];
                const dept = departments.find(d => d.id === asgn.unit);

                // Auto-init unit from workVolume default
                if (!assignments[wv.id] && wv.assignedUnit) {
                  setTimeout(() => updateAssignment(wv.id, 'unit', wv.assignedUnit), 0);
                }

                return (
                  <div key={wv.id} style={{
                    padding: '14px 16px', marginBottom: 10, borderRadius: 10,
                    border: `1px solid ${asgn.unit && asgn.lead ? '#b7eb8f' : '#e8e8e8'}`,
                    background: asgn.unit && asgn.lead ? '#f6ffed' : '#fafafa',
                    transition: 'all 0.2s',
                  }}>
                    <Row gutter={[12, 8]} align="middle">
                      <Col flex="none">
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, background: colors.navy,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                      </Col>
                      <Col flex="auto">
                        <Text strong style={{ fontSize: 13, color: colors.navy }}>{wv.name}</Text>
                        <div style={{ marginTop: 2, display: 'flex', gap: 8 }}>
                          <Text style={{ fontSize: 11, color: '#888' }}>
                            {wv.quantity} {wv.unit} · {wv.estimatedDays} ngày
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Đơn vị thực hiện</Text>
                        <Select
                          size="small"
                          style={{ width: '100%' }}
                          placeholder="Chọn phân xưởng/bộ phận"
                          value={asgn.unit || undefined}
                          onChange={val => {
                            updateAssignment(wv.id, 'unit', val);
                            updateAssignment(wv.id, 'lead', ''); // reset lead khi đổi unit
                          }}
                          options={departments
                            .filter(d => technicalDepts.includes(d.id))
                            .map(d => ({ value: d.id, label: `${d.shortName} — ${d.name}` }))
                          }
                        />
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Cán bộ phụ trách</Text>
                        <Select
                          size="small"
                          style={{ width: '100%' }}
                          placeholder={asgn.unit ? 'Chọn cán bộ' : 'Chọn đơn vị trước'}
                          disabled={!asgn.unit}
                          value={asgn.lead || undefined}
                          onChange={val => updateAssignment(wv.id, 'lead', val)}
                          optionLabelProp="label"
                        >
                          {dept && (
                            <Select.Option value={`head-${dept.id}`} label={dept.head}>
                              <div>
                                <Text strong style={{ fontSize: 12 }}>{dept.head}</Text>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Trưởng {dept.shortName}</Text>
                              </div>
                            </Select.Option>
                          )}
                          {deptStaff.map(s => (
                            <Select.Option key={s.id} value={s.id} label={s.name}>
                              <div>
                                <Text strong style={{ fontSize: 12 }}>{s.name}</Text>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{s.position}</Text>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Nhu cầu vật tư tham chiếu từ QL Kho */}
        <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 14 }}>
            <Space align="center" size={8}>
              {sectionIcon(<ShopOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Nhu cầu vật tư & thiết bị</Text>
              <Tag color="orange">{materials.length} loại</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>Tham chiếu từ QL Kho tàng</Text>
            </Space>
          </div>
          {materials.length === 0 ? (
            <Alert type="info" showIcon message="Chọn đề xuất để xem nhu cầu vật tư." />
          ) : (
            <Table
              dataSource={materials}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: 'Vật tư / Thiết bị', dataIndex: 'name', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
                { title: 'Đơn vị', dataIndex: 'unit', width: 80, align: 'center' as const,
                  render: (v: string) => <Tag style={{ fontSize: 11 }}>{v}</Tag> },
                { title: 'Số lượng', dataIndex: 'quantity', width: 90, align: 'center' as const,
                  render: (v: number) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', width: 110, align: 'right' as const,
                  render: (v: number) => <Text style={{ fontSize: 12 }}>{v} tr</Text> },
                { title: 'Thành tiền (tr)', dataIndex: 'totalPrice', width: 120, align: 'right' as const,
                  render: (v: number) => <Text strong style={{ fontSize: 12, color: colors.navy }}>{v} tr</Text> },
                { title: 'Tình trạng kho', width: 130, align: 'center' as const,
                  render: (_: unknown, row: any) => (
                    row.note?.includes('Nhập khẩu')
                      ? <Tag color="orange">Cần nhập khẩu</Tag>
                      : <Tag color="blue">Tham chiếu QL Kho</Tag>
                  )},
              ]}
              summary={rows => {
                const total = rows.reduce((s: number, r: any) => s + (r.totalPrice || 0), 0);
                return (
                  <Table.Summary.Row style={{ background: '#f5f7fa' }}>
                    <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng nhu cầu vật tư</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right"><Text strong style={{ color: colors.navy }}>{total} tr</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={5} />
                  </Table.Summary.Row>
                );
              }}
            />
          )}
        </Card>
      </div>
    );
  };

  // ─── Step 5: Xem lại hồ sơ ────────────────────────────────
  const renderStep5 = () => {
    const formValues = form.getFieldsValue();
    const ctLabel = contractTypeConfig[formValues.contractType] || formValues.contractType;
    const startDate = formValues.startDate;
    const endDate = formValues.endDate;

    return (
      <div>
        {/* Contract info */}
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              {sectionIcon(<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Thông tin hợp đồng</Text>
              <Tag color="blue">{nextCode}</Tag>
            </Space>
          </div>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
            labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}
            contentStyle={{ fontSize: 13 }}>
            <Descriptions.Item label="Mã hợp đồng">{nextCode}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={formValues.contractType === 'contract' ? 'blue' : 'purple'}>{ctLabel}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên hợp đồng" span={2}>{formValues.name}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị đặt hàng">{formValues.partnerUnit}</Descriptions.Item>
            <Descriptions.Item label="Giá trị HĐ">
              <Text strong style={{ color: colors.navy }}>{formatCurrency(formValues.contractValue || 0)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tạm ứng">{formValues.advancePayment ? formatCurrency(formValues.advancePayment) : '—'}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {startDate ? startDate.format('DD/MM/YYYY') : '—'} — {endDate ? endDate.format('DD/MM/YYYY') : '—'}
            </Descriptions.Item>
            {formValues.terms && (
              <Descriptions.Item label="Điều khoản" span={2}>{formValues.terms}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Linked proposal */}
        {selectedProposal && (
          <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
            <div style={{ marginBottom: 16 }}>
              <Space align="center" size={8}>
                {sectionIcon(<SolutionOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #059669, #34d399)')}
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>Đề xuất liên kết</Text>
                <Tag color="green">{selectedProposal.code}</Tag>
              </Space>
            </div>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
              labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}
              contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Mã đề xuất">{selectedProposal.code}</Descriptions.Item>
              <Descriptions.Item label="Tổng dự toán">{formatCurrency(selectedProposal.totalCost)}</Descriptions.Item>
              <Descriptions.Item label="Giá đề xuất">{formatCurrency(selectedProposal.proposedPrice)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian DK">{selectedProposal.estimatedDuration} ngày</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Linked mission */}
        {linkedMission && (
          <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
            <div style={{ marginBottom: 16 }}>
              <Space align="center" size={8}>
                {sectionIcon(<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #d97706, #fbbf24)')}
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>Nhiệm vụ liên kết</Text>
                <Tag color="blue">{linkedMission.code}</Tag>
              </Space>
            </div>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
              labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}
              contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Tên nhiệm vụ" span={2}>{linkedMission.name}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị giao">{linkedMission.requestingUnit}</Descriptions.Item>
              <Descriptions.Item label="Loại sản phẩm/hệ thống">{linkedMission.equipmentType}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>
    );
  };

  // ─── Step 6: Trình duyệt ký kết ──────────────────────────
  const renderStep6 = () => {
    const formValues = form.getFieldsValue();
    return (
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
        <Result
          icon={<SendOutlined style={{ color: colors.navy }} />}
          title="Xác nhận trình duyệt hợp đồng"
          subTitle={
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <p>Hợp đồng <strong>{formValues.name}</strong> sẽ được gửi đến <strong>Ban Giám đốc</strong> để phê duyệt và ký kết.</p>
              <p style={{ color: '#666' }}>Sau khi được ký kết, hợp đồng sẽ chuyển sang giai đoạn phân rã công việc và theo dõi thực hiện.</p>
            </div>
          }
          extra={
            <Space direction="vertical" align="center" size={12}>
              <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '14px 24px', display: 'inline-flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Mã HĐ</Text>
                  <div><Text strong style={{ color: colors.navy }}>{nextCode}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Đề xuất</Text>
                  <div><Text strong style={{ color: colors.navy }}>{selectedProposal?.code}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Giá trị HĐ</Text>
                  <div><Text strong style={{ color: colors.success }}>{formatCurrency(formValues.contractValue || 0)}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Đơn vị</Text>
                  <div><Text strong>{formValues.partnerUnit}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Trình duyệt đến</Text>
                  <div><Text strong>Phạm Quốc Hưng</Text></div>
                </div>
              </div>
            </Space>
          }
        />
      </Card>
    );
  };

  const stepsContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ─── Hero Banner ─── */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} />
                <Space size={8} align="center">
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Tạo hợp đồng mới</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      Quy trình 6 bước{selectedProposal ? ` — ${selectedProposal.code}` : ''}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ─── Steps ─── */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '16px 24px' } }}>
        <Steps current={currentStep} size="small" items={stepItems} onChange={(step) => { if (step < currentStep) setCurrentStep(step); }} />
      </Card>

      {/* ─── Content ─── */}
      <Form form={form} layout="vertical" requiredMark="optional">
        {stepsContent[currentStep]()}
      </Form>

      {/* ─── Sticky Footer ─── */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Bước {currentStep + 1} / {stepItems.length}: {stepItems[currentStep].title}</Text>
        <Space>
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
              Quay lại
            </Button>
          )}
          {currentStep < 4 ? (
            <Button type="primary" onClick={handleNext}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
              Tiếp theo
            </Button>
          ) : (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
              Lưu & Trình duyệt
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ContractCreatePage;
