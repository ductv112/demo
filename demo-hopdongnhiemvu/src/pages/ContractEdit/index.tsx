import React, { useState, useMemo } from 'react';
import {
  Card, Button, Row, Col, Typography, Space, Steps,
  Form, Input, Select, InputNumber, Descriptions,
  Tag, Result, message, DatePicker, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, FileTextOutlined,
  SaveOutlined, SendOutlined, DollarOutlined,
  AuditOutlined, SolutionOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { missions, proposals } from '../../data/missions';
import { contracts } from '../../data/contracts';
import { departments } from '../../data/departments';
import {
  formatCurrency, formatDate,
  missionTypeConfig, missionPriorityConfig,
  proposalStatusConfig, contractStatusConfig,
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

const ContractEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const contract = useMemo(() => contracts.find(c => c.id === id), [id]);
  const linkedProposal = useMemo(() => contract ? proposals.find(p => p.id === contract.proposalId) : null, [contract]);
  const linkedMission = useMemo(() => contract ? missions.find(m => m.id === contract.missionId) : null, [contract]);

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  // Block editing for certain statuses
  const readOnlyStatuses = ['signed', 'executing', 'completed', 'cancelled'];
  const isReadOnly = contract ? readOnlyStatuses.includes(contract.status) : false;

  if (!contract) {
    return (
      <div style={{ padding: '0 0 24px' }}>
        <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 40, textAlign: 'center' } }}>
          <Result
            status="404"
            title="Không tìm thấy hợp đồng"
            subTitle={`Mã hợp đồng "${id}" không tồn tại trong hệ thống.`}
            extra={<Button type="primary" onClick={() => navigate('/contracts')} style={{ background: colors.navy, borderColor: colors.navy }}>Quay lại danh sách</Button>}
          />
        </Card>
      </div>
    );
  }

  const statusCfg = contractStatusConfig[contract.status];

  const handleNext = async () => {
    try {
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
    message.success('Đã lưu và trình duyệt chỉnh sửa hợp đồng thành công');
    navigate(`/contracts/${contract.id}`);
  };

  const stepItems = [
    { title: 'Hồ sơ ĐX', icon: <FileTextOutlined /> },
    { title: 'Thẩm định CP', icon: <DollarOutlined /> },
    { title: 'Nội dung HĐ', icon: <EditOutlined /> },
    { title: 'Xem lại', icon: <AuditOutlined /> },
    { title: 'Trình duyệt', icon: <SendOutlined /> },
  ];

  // ─── Step 1: Hồ sơ đề xuất (read-only) ────────────────────
  const renderStep1 = () => {
    const typeCfg = linkedMission ? missionTypeConfig[linkedMission.missionType] : null;
    const prioCfg = linkedMission ? missionPriorityConfig[linkedMission.priority] : null;
    const proposalStatusCfg = linkedProposal ? proposalStatusConfig[linkedProposal.status] : null;

    return (
      <div>
        {/* Thông tin đề xuất */}
        {linkedProposal ? (
          <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
            <div style={{ marginBottom: 16 }}>
              <Space align="center" size={8}>
                {sectionIcon(<SolutionOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #059669, #34d399)')}
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>Thông tin đề xuất</Text>
                <Tag color="blue">{linkedProposal.code}</Tag>
                {proposalStatusCfg && <Tag color={proposalStatusCfg.color}>{proposalStatusCfg.label}</Tag>}
              </Space>
            </div>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
              labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}
              contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Mã đề xuất">{linkedProposal.code}</Descriptions.Item>
              <Descriptions.Item label="Tổng dự toán">
                <Text strong style={{ color: colors.navy }}>{formatCurrency(linkedProposal.totalCost)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phương án kỹ thuật" span={2}>{linkedProposal.technicalPlan}</Descriptions.Item>
              <Descriptions.Item label="Giá đề xuất">
                <Text strong style={{ color: colors.success }}>{formatCurrency(linkedProposal.proposedPrice)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">{linkedProposal.estimatedDuration} ngày</Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20, textAlign: 'center' } }}>
            <Text type="secondary">Không tìm thấy đề xuất liên kết</Text>
          </Card>
        )}

        {/* Thông tin nhiệm vụ */}
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
              <Descriptions.Item label="Loại sản phẩm/hệ thống">{linkedMission.equipmentType} — SL: {linkedMission.equipmentQuantity}</Descriptions.Item>
              <Descriptions.Item label="Loại nhiệm vụ">{typeCfg ? <Tag color={typeCfg.color}>{typeCfg.label}</Tag> : '—'}</Descriptions.Item>
              <Descriptions.Item label="Mức ưu tiên">{prioCfg ? <Tag color={prioCfg.color}>{prioCfg.label}</Tag> : '—'}</Descriptions.Item>
              <Descriptions.Item label="Hạn hoàn thành">{formatDate(linkedMission.deadline)}</Descriptions.Item>
              <Descriptions.Item label="Phân xưởng xử lý">
                {linkedMission.assignedDepartment ? departments.find(d => d.id === linkedMission.assignedDepartment)?.name || linkedMission.assignedDepartment : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>
    );
  };

  // ─── Step 2: Thẩm định chi phí ────────────────────────────
  const renderStep2 = () => {
    if (!linkedProposal) return null;

    const costBreakdown = [
      { label: 'Chi phí vật tư', value: linkedProposal.materialCost, color: '#1890ff', bg: 'linear-gradient(135deg, #e6f7ff, #bae7ff)' },
      { label: 'Chi phí nhân công', value: linkedProposal.laborCost, color: '#52c41a', bg: 'linear-gradient(135deg, #f6ffed, #d9f7be)' },
      { label: 'Chi phí thiết bị', value: linkedProposal.equipmentCost, color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f0ff, #d3adf7)' },
      { label: 'Chi phí chung', value: linkedProposal.overheadCost, color: '#d97706', bg: 'linear-gradient(135deg, #fffbe6, #ffe58f)' },
      { label: 'TỔNG DỰ TOÁN', value: linkedProposal.totalCost, color: colors.navy, bg: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` },
    ];

    return (
      <>
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              {sectionIcon(<DollarOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #7c3aed, #a78bfa)')}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Chi phí từ đề xuất & dự toán</Text>
              <Tag color="blue">{linkedProposal.code}</Tag>
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
            <Text strong style={{ color: colors.success, fontSize: 16 }}>{formatCurrency(linkedProposal.proposedPrice)}</Text>
          </div>
        </Card>

        <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              {sectionIcon(<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Kết quả thẩm định với phân hệ TC-KT</Text>
            </Space>
          </div>
          <Form.Item
            label="Ghi nhận kết quả thẩm định"
            name="assessmentNote"
          >
            <Input.TextArea rows={4} placeholder="Ghi nhận kết quả thẩm định chi phí với phân hệ Tài chính Kế toán..." disabled={isReadOnly} />
          </Form.Item>
          <Form.Item
            label="Kết quả thẩm định"
            name="assessmentResult"
            rules={[{ required: true, message: 'Vui lòng chọn kết quả thẩm định' }]}
            initialValue="approved"
          >
            <Select placeholder="Chọn kết quả thẩm định" size="large" disabled={isReadOnly}>
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

  // ─── Step 3: Nội dung hợp đồng ────────────────────────────
  const renderStep3 = () => (
    <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
      <div style={{ marginBottom: 16 }}>
        <Space align="center" size={8}>
          {sectionIcon(<EditOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
          <Text strong style={{ color: colors.navy, fontSize: 14 }}>Nội dung hợp đồng</Text>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Loại hợp đồng"
            name="contractType"
            rules={[{ required: true, message: 'Chọn loại hợp đồng' }]}
            initialValue={contract.contractType}
          >
            <Select size="large" disabled={isReadOnly}>
              <Select.Option value="contract">Hợp đồng</Select.Option>
              <Select.Option value="assignment">Quyết định giao NV</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Mã hợp đồng">
            <Input value={contract.code} disabled style={{ fontWeight: 600, color: colors.navy }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Tên hợp đồng"
        name="name"
        rules={[{ required: true, message: 'Nhập tên hợp đồng' }]}
        initialValue={contract.name}
      >
        <Input placeholder="VD: HĐ nâng cấp hệ thống monitoring P-18 server-1245" size="large" disabled={isReadOnly} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Khách hàng / Bên A"
            name="partnerUnit"
            rules={[{ required: true, message: 'Nhập khách hàng' }]}
            initialValue={contract.partnerUnit}
          >
            <Input placeholder="VD: Khối K01" size="large" disabled={isReadOnly} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Giá trị hợp đồng (triệu đồng)"
            name="contractValue"
            rules={[{ required: true, message: 'Nhập giá trị hợp đồng' }]}
            initialValue={contract.contractValue}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 1650" size="large" disabled={isReadOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Tạm ứng (triệu đồng)"
            name="advancePayment"
            initialValue={contract.advancePayment}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 495" size="large" disabled={isReadOnly} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
            initialValue={dayjs(contract.startDate)}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" size="large" disabled={isReadOnly} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}
            initialValue={dayjs(contract.endDate)}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" size="large" disabled={isReadOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Điều khoản hợp đồng"
        name="terms"
        initialValue={contract.terms}
      >
        <Input.TextArea rows={4} placeholder="Nhập các điều khoản chính của hợp đồng..." disabled={isReadOnly} />
      </Form.Item>
    </Card>
  );

  // ─── Step 4: Xem lại hồ sơ ────────────────────────────────
  const renderStep4 = () => {
    const formValues = form.getFieldsValue();
    const ctLabel = contractTypeConfig[formValues.contractType || contract.contractType] || contract.contractType;
    const startDate = formValues.startDate || dayjs(contract.startDate);
    const endDate = formValues.endDate || dayjs(contract.endDate);

    return (
      <div>
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              {sectionIcon(<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
              <Text strong style={{ color: colors.navy, fontSize: 14 }}>Thông tin hợp đồng</Text>
              <Tag color="blue">{contract.code}</Tag>
            </Space>
          </div>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
            labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}
            contentStyle={{ fontSize: 13 }}>
            <Descriptions.Item label="Mã hợp đồng">{contract.code}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={(formValues.contractType || contract.contractType) === 'contract' ? 'blue' : 'purple'}>{ctLabel}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên hợp đồng" span={2}>{formValues.name || contract.name}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị đặt hàng">{formValues.partnerUnit || contract.partnerUnit}</Descriptions.Item>
            <Descriptions.Item label="Giá trị HĐ">
              <Text strong style={{ color: colors.navy }}>{formatCurrency(formValues.contractValue || contract.contractValue)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tạm ứng">{formatCurrency(formValues.advancePayment ?? contract.advancePayment)}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {startDate.format('DD/MM/YYYY')} — {endDate.format('DD/MM/YYYY')}
            </Descriptions.Item>
            {(formValues.terms || contract.terms) && (
              <Descriptions.Item label="Điều khoản" span={2}>{formValues.terms || contract.terms}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {linkedProposal && (
          <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
            <div style={{ marginBottom: 16 }}>
              <Space align="center" size={8}>
                {sectionIcon(<SolutionOutlined style={{ color: '#fff', fontSize: 13 }} />, 'linear-gradient(135deg, #059669, #34d399)')}
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>Đề xuất liên kết</Text>
                <Tag color="green">{linkedProposal.code}</Tag>
              </Space>
            </div>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
              labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}
              contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Mã đề xuất">{linkedProposal.code}</Descriptions.Item>
              <Descriptions.Item label="Tổng dự toán">{formatCurrency(linkedProposal.totalCost)}</Descriptions.Item>
              <Descriptions.Item label="Giá đề xuất">{formatCurrency(linkedProposal.proposedPrice)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian DK">{linkedProposal.estimatedDuration} ngày</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

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

  // ─── Step 5: Trình duyệt ──────────────────────────────────
  const renderStep5 = () => {
    const formValues = form.getFieldsValue();
    return (
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
        <Result
          icon={<SendOutlined style={{ color: colors.navy }} />}
          title="Xác nhận trình duyệt chỉnh sửa hợp đồng"
          subTitle={
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <p>Thay đổi hợp đồng <strong>{formValues.name || contract.name}</strong> sẽ được gửi đến <strong>Ban Giám đốc</strong> để phê duyệt lại.</p>
              <p style={{ color: '#666' }}>Sau khi phê duyệt, nội dung hợp đồng sẽ được cập nhật trên hệ thống.</p>
            </div>
          }
          extra={
            <Space direction="vertical" align="center" size={12}>
              <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '14px 24px', display: 'inline-flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Mã HĐ</Text>
                  <div><Text strong style={{ color: colors.navy }}>{contract.code}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Đề xuất</Text>
                  <div><Text strong style={{ color: colors.navy }}>{linkedProposal?.code}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Giá trị HĐ</Text>
                  <div><Text strong style={{ color: colors.success }}>{formatCurrency(formValues.contractValue || contract.contractValue)}</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Đơn vị</Text>
                  <div><Text strong>{formValues.partnerUnit || contract.partnerUnit}</Text></div>
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

  const stepsContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

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
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <EditOutlined style={{ color: '#0a1628', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Chỉnh sửa hợp đồng</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {contract.code} — {contract.name}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col>
              {statusCfg && <Tag color={statusCfg.color} style={{ fontSize: 12 }}>{statusCfg.label}</Tag>}
            </Col>
          </Row>
        </div>
      </Card>

      {/* Read-only alert */}
      {isReadOnly && (
        <Alert
          type="warning"
          showIcon
          message="Hợp đồng không thể chỉnh sửa"
          description={`Hợp đồng đang ở trạng thái "${statusCfg.label}", không được phép chỉnh sửa. Chỉ có thể xem thông tin.`}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {/* ─── Steps ─── */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '16px 24px' } }}>
        <Steps current={currentStep} size="small" items={stepItems} onChange={(step) => setCurrentStep(step)} />
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
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} disabled={isReadOnly}
              style={{ background: isReadOnly ? undefined : colors.navy, borderColor: isReadOnly ? undefined : colors.navy, borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
              Lưu & Trình duyệt
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ContractEditPage;
