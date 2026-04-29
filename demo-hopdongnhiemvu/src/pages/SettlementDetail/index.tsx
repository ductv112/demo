import React, { useState } from 'react';
import {
  Card, Row, Col, Tabs, Tag, Typography, Button, Space, Tooltip,
  Descriptions, Table, Timeline, Modal, Drawer, Form, Input, Select,
  Statistic, Alert, Progress, Steps, Divider, message, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, LockOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, FileTextOutlined, AuditOutlined,
  DollarOutlined, HistoryOutlined, ReconciliationOutlined,
  SyncOutlined, CheckOutlined, CloseOutlined, EditOutlined,
  InfoCircleOutlined, FileDoneOutlined, SafetyCertificateOutlined,
  ThunderboltOutlined, WarningOutlined, SendOutlined,
  BarChartOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSettlementById,
  getSettlementItems,
  getVarianceReport,
  getFinancialTransactions,
  getContractClosure,
  getVersionLogs,
  getSettlementsByContract,
} from '../../data/settlement';
import { contracts } from '../../data/contracts';
import { formatCurrency, formatDate, formatDateTime, settlementStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { SettlementItem, FinancialTransaction, SettlementVersionLog } from '../../types';

const { Title, Text, Paragraph } = Typography;

// ─── Status step index ────────────────────────────────────────────────────────
const STATUS_STEPS = ['draft', 'submitted', 'reviewing', 'approved', 'closed'];

const SettlementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectDrawerOpen, setRejectDrawerOpen] = useState(false);
  const [syncingFT, setSyncingFT] = useState(false);
  const [rejectForm] = Form.useForm();
  const [approveForm] = Form.useForm();

  const settlement = getSettlementById(id ?? '');
  if (!settlement) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Text type="secondary">Không tìm thấy hồ sơ quyết toán</Text>
        <br />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/settlement')}>Quay lại</Button>
      </div>
    );
  }

  const contract = contracts.find(c => c.id === settlement.contractId);
  const items = getSettlementItems(settlement.id);
  const varReport = getVarianceReport(settlement.id);
  const transactions = getFinancialTransactions(settlement.contractId);
  const closure = getContractClosure(settlement.contractId);
  const versionLogs = getVersionLogs(settlement.id);
  const allVersions = getSettlementsByContract(settlement.contractId);

  const statusCfg = settlementStatusConfig[settlement.status] ?? { label: settlement.status, color: 'default' };
  const stepIndex = STATUS_STEPS.indexOf(settlement.status);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const varianceCategoryConfig = {
    within_budget: { label: 'Trong dự toán', color: 'green', icon: <CheckCircleOutlined /> },
    minor_overrun: { label: 'Vượt nhẹ (≤5%)', color: 'orange', icon: <ExclamationCircleOutlined /> },
    major_overrun: { label: 'Vượt lớn (>5%)', color: 'red', icon: <WarningOutlined /> },
    savings: { label: 'Tiết kiệm (>5%)', color: 'cyan', icon: <ThunderboltOutlined /> },
  };
  const vc = varReport ? varianceCategoryConfig[varReport.varianceCategory] : null;

  const handleApprove = () => {
    approveForm.validateFields().then(() => {
      setApproveModalOpen(false);
      approveForm.resetFields();
      message.success('Đã phê duyệt hồ sơ quyết toán');
    });
  };

  const handleReject = () => {
    rejectForm.validateFields().then(() => {
      setRejectDrawerOpen(false);
      rejectForm.resetFields();
      message.success('Đã từ chối — hồ sơ trả về để chỉnh sửa');
    });
  };

  const handleSyncFT = () => {
    setSyncingFT(true);
    setTimeout(() => { setSyncingFT(false); message.success('Đã đồng bộ 11 giao dịch từ hệ thống Tài chính'); }, 1500);
  };

  // ─── Tab 1: Tổng quan ────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div>
      {/* Workflow stepper */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Steps
          current={stepIndex}
          size="small"
          items={[
            { title: 'Nháp', description: settlement.preparedBy },
            { title: 'Đã trình', description: settlement.submittedBy ?? '—' },
            { title: 'Đang xem xét', description: settlement.reviewedBy ?? '—' },
            { title: 'Đã phê duyệt', description: settlement.approvedBy ?? '—' },
            { title: 'Đã đóng HĐ', description: closure?.closedBy ?? '—' },
          ]}
          status={settlement.status === 'closed' ? 'finish' : 'process'}
        />
      </Card>

      {/* Review note */}
      {settlement.reviewNote && (
        <Alert
          type="info"
          message="Nhận xét thẩm định (P.TCKT)"
          description={settlement.reviewNote}
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}
      {settlement.rejectionReason && (
        <Alert
          type="error"
          message="Lý do từ chối"
          description={settlement.rejectionReason}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16}>
        {/* Left: Cost overview */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={<Text strong style={{ color: colors.navy }}><DollarOutlined style={{ marginRight: 6 }} />Tổng hợp chi phí</Text>}
            style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
          >
            <Row gutter={12}>
              <Col span={12}>
                <Statistic
                  title="Giá trị hợp đồng"
                  value={settlement.contractValue}
                  suffix="tr"
                  valueStyle={{ color: colors.navy, fontSize: 22, fontWeight: 700 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Dự toán"
                  value={settlement.plannedCost}
                  suffix="tr"
                  valueStyle={{ fontSize: 22, fontWeight: 700 }}
                />
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Row gutter={12}>
              <Col span={12}>
                <Statistic
                  title="Thực chi"
                  value={settlement.actualCost}
                  suffix="tr"
                  valueStyle={{
                    color: settlement.costVariance > 0 ? colors.danger : colors.success,
                    fontSize: 22, fontWeight: 700,
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Chênh lệch"
                  value={Math.abs(settlement.costVariance)}
                  prefix={settlement.costVariance > 0 ? '+' : '-'}
                  suffix="tr"
                  valueStyle={{
                    color: settlement.costVariance > 0 ? colors.danger : colors.success,
                    fontSize: 22, fontWeight: 700,
                  }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {settlement.costVariancePct > 0 ? '+' : ''}{settlement.costVariancePct.toFixed(1)}% so với dự toán
                </Text>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            {/* Cost breakdown bar */}
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Cơ cấu chi phí thực tế</Text>
            {[
              { label: 'Vật tư', val: settlement.materialCostActual, color: '#1890ff' },
              { label: 'Nhân công', val: settlement.laborCostActual, color: '#52c41a' },
              { label: 'Thiết bị', val: settlement.equipmentCostActual, color: '#faad14' },
              { label: 'Chi phí chung', val: settlement.overheadCostActual, color: '#722ed1' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 12 }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(item.val)}</Text>
                </div>
                <Progress
                  percent={Math.round((item.val / settlement.actualCost) * 100)}
                  showInfo={false}
                  strokeColor={item.color}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* Right: Variance + profitability */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={<Text strong style={{ color: colors.navy }}><BarChartOutlined style={{ marginRight: 6 }} />Phân tích chênh lệch</Text>}
            style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
          >
            {vc && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                background: vc.color === 'red' ? '#fff2f0' : vc.color === 'orange' ? '#fffbe6' : vc.color === 'green' ? '#f6ffed' : '#e6fffb',
                border: `1px solid ${vc.color === 'red' ? '#ffccc7' : vc.color === 'orange' ? '#ffe58f' : vc.color === 'green' ? '#b7eb8f' : '#87e8de'}`,
              }}>
                <span style={{ fontSize: 16 }}>{vc.icon}</span>
                <Text strong style={{ fontSize: 13 }}>{vc.label}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
                  {settlement.costVariancePct > 0 ? '+' : ''}{settlement.costVariancePct.toFixed(1)}%
                </Text>
              </div>
            )}

            {varReport?.explanationRequired && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: '#8a5700', fontWeight: 500 }}>Giải trình chênh lệch</Text>
                <Paragraph style={{ fontSize: 12, marginTop: 4, color: '#555' }}>
                  {varReport.explanationNote ?? 'Chưa có giải trình.'}
                </Paragraph>
                {varReport.approvedWithVariance && (
                  <Alert
                    type="success"
                    message={<Text style={{ fontSize: 12 }}>{varReport.varianceApprovalNote}</Text>}
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ borderRadius: 6 }}
                  />
                )}
              </div>
            )}

            <Divider style={{ margin: '10px 0' }} />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Kết quả tài chính</Text>
            <Row gutter={12}>
              <Col span={12}>
                <Statistic
                  title="Lợi nhuận gộp"
                  value={settlement.grossProfit}
                  suffix="tr"
                  valueStyle={{
                    fontSize: 20, fontWeight: 700,
                    color: settlement.grossProfit >= 0 ? colors.success : colors.danger,
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tỷ suất lợi nhuận"
                  value={settlement.profitMargin}
                  suffix="%"
                  precision={1}
                  valueStyle={{
                    fontSize: 20, fontWeight: 700,
                    color: settlement.profitMargin >= 0 ? colors.success : colors.danger,
                  }}
                />
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Khối lượng</Text>
            <Row gutter={12}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>{settlement.plannedQuantity}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Hợp đồng</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors.info }}>{settlement.actualQuantity}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Thực hiện</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors.success }}>{settlement.acceptedQuantity}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Nghiệm thu</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Metadata */}
      <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Hợp đồng">
            <Text
              style={{ color: colors.navy, cursor: 'pointer', fontWeight: 500 }}
              onClick={() => navigate(`/contracts/${settlement.contractId}`)}
            >
              {contract?.code} — {contract?.name}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại quyết toán">
            <Tag color={settlement.settlementType === 'final' ? 'purple' : 'blue'}>
              {settlement.settlementType === 'final' ? 'Toàn bộ' : 'Từng phần'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kỳ quyết toán">
            {formatDate(settlement.coveredPeriod.from)} – {formatDate(settlement.coveredPeriod.to)}
          </Descriptions.Item>
          <Descriptions.Item label="Đối chiếu TC">
            <Tag color={
              settlement.reconciliationStatus === 'reconciled' ? 'green' :
              settlement.reconciliationStatus === 'discrepancy' ? 'red' : 'orange'
            }>
              {settlement.reconciliationStatus === 'reconciled' ? 'Đã đối chiếu' :
               settlement.reconciliationStatus === 'discrepancy' ? 'Lệch số liệu' : 'Chưa đối chiếu'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Người lập">{settlement.preparedBy}</Descriptions.Item>
          <Descriptions.Item label="Ngày lập">{formatDate(settlement.preparedAt)}</Descriptions.Item>
          {settlement.approvedBy && (
            <Descriptions.Item label="Người phê duyệt">{settlement.approvedBy}</Descriptions.Item>
          )}
          {settlement.approvedAt && (
            <Descriptions.Item label="Ngày phê duyệt">{formatDate(settlement.approvedAt)}</Descriptions.Item>
          )}
          {settlement.archiveRef && (
            <Descriptions.Item label="Mã lưu trữ">
              <Text code>{settlement.archiveRef}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
        {settlement.notes && (
          <>
            <Divider style={{ margin: '10px 0' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú: </Text>
            <Text style={{ fontSize: 12 }}>{settlement.notes}</Text>
          </>
        )}
      </Card>
    </div>
  );

  // ─── Tab 2: Chi tiết hạng mục ────────────────────────────────────────────────
  const itemColumns: ColumnsType<SettlementItem> = [
    {
      title: 'Mã',
      dataIndex: 'itemCode',
      width: 110,
      render: (v: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'Tên hạng mục',
      dataIndex: 'itemName',
      ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      width: 60,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'KL HĐ',
      dataIndex: 'contractQuantity',
      width: 70,
      align: 'center' as const,
      render: (v: number) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'KL NT',
      dataIndex: 'acceptedQuantity',
      width: 70,
      align: 'center' as const,
      render: (v: number) => (
        <Text style={{ fontSize: 12, color: v === 0 ? colors.warning : 'inherit' }}>{v}</Text>
      ),
    },
    {
      title: 'Chi phí DT',
      dataIndex: 'plannedCost',
      width: 100,
      render: (v: number) => <Text style={{ fontSize: 12 }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Chi phí TT',
      dataIndex: 'actualCost',
      width: 100,
      render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'costVariance',
      width: 110,
      render: (v: number, row) => (
        <div>
          <Text style={{ fontSize: 12, color: v > 0 ? colors.danger : colors.success }}>
            {v > 0 ? '+' : ''}{formatCurrency(v)}
          </Text>
          <div>
            <Tag
              color={Math.abs(row.costVariancePct) > 10 ? 'red' : row.costVariancePct > 0 ? 'orange' : 'green'}
              style={{ fontSize: 10, padding: '0 4px', margin: 0 }}
            >
              {row.costVariancePct > 0 ? '+' : ''}{row.costVariancePct.toFixed(1)}%
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Vật tư',
      dataIndex: 'materialCost',
      width: 90,
      render: (v: number) => <Text style={{ fontSize: 11, color: '#1890ff' }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Nhân công',
      dataIndex: 'laborCost',
      width: 90,
      render: (v: number) => <Text style={{ fontSize: 11, color: '#52c41a' }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentCost',
      width: 90,
      render: (v: number) => <Text style={{ fontSize: 11, color: '#faad14' }}>{formatCurrency(v)}</Text>,
    },
  ];

  const renderItems = () => {
    const totalPlanned = items.reduce((s, i) => s + i.plannedCost, 0);
    const totalActual = items.reduce((s, i) => s + i.actualCost, 0);
    const totalVariance = totalActual - totalPlanned;

    return (
      <div>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f5f7fa', borderRadius: 8 }} styles={{ body: { padding: '12px 16px' } }}>
              <Statistic title="Tổng dự toán" value={totalPlanned} suffix="tr" valueStyle={{ fontSize: 18, color: colors.navy }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f5f7fa', borderRadius: 8 }} styles={{ body: { padding: '12px 16px' } }}>
              <Statistic title="Tổng thực chi" value={totalActual} suffix="tr" valueStyle={{ fontSize: 18, fontWeight: 700 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: totalVariance > 0 ? '#fff2f0' : '#f6ffed', borderRadius: 8 }} styles={{ body: { padding: '12px 16px' } }}>
              <Statistic
                title="Tổng chênh lệch"
                value={Math.abs(totalVariance)}
                prefix={totalVariance > 0 ? '+' : '-'}
                suffix="tr"
                valueStyle={{ fontSize: 18, color: totalVariance > 0 ? colors.danger : colors.success }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f5f7fa', borderRadius: 8 }} styles={{ body: { padding: '12px 16px' } }}>
              <Statistic
                title="% Chênh lệch"
                value={Math.abs((totalVariance / totalPlanned) * 100)}
                suffix="%"
                precision={1}
                prefix={totalVariance > 0 ? '+' : '-'}
                valueStyle={{ fontSize: 18, color: totalVariance > 0 ? colors.danger : colors.success }}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 1100 }}
          summary={pageData => {
            const sPlanned = pageData.reduce((s, r) => s + r.plannedCost, 0);
            const sActual = pageData.reduce((s, r) => s + r.actualCost, 0);
            const sDiff = sActual - sPlanned;
            return (
              <Table.Summary.Row style={{ background: '#f5f7fa', fontWeight: 600 }}>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text strong style={{ fontSize: 12 }}>{formatCurrency(sPlanned)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <Text strong style={{ fontSize: 12 }}>{formatCurrency(sActual)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <Text strong style={{ fontSize: 12, color: sDiff > 0 ? colors.danger : colors.success }}>
                    {sDiff > 0 ? '+' : ''}{formatCurrency(sDiff)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} colSpan={3} />
              </Table.Summary.Row>
            );
          }}
        />

        {/* Variance items */}
        {varReport?.topVarianceItems && varReport.topVarianceItems.length > 0 && (
          <Card
            bordered={false}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}><WarningOutlined style={{ marginRight: 6, color: colors.warning }} />Phân tích nguyên nhân chênh lệch</Text>}
            style={{ marginTop: 16, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
          >
            {varReport.topVarianceItems.map((vi, idx) => (
              <div key={vi.wbsItemId} style={{
                padding: '10px 0',
                borderBottom: idx < varReport.topVarianceItems.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>{vi.itemName}</Text>
                  <Tag color={vi.variancePct > 10 ? 'red' : 'orange'} style={{ fontWeight: 600 }}>
                    +{vi.variancePct.toFixed(1)}%
                  </Tag>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    DT: {formatCurrency(vi.plannedCost)} → TT: {formatCurrency(vi.actualCost)} (+{formatCurrency(vi.variance)})
                  </Text>
                </div>
                {vi.rootCause && (
                  <div style={{ marginTop: 4, padding: '6px 10px', background: '#fffbe6', borderRadius: 6, borderLeft: `3px solid ${colors.warning}` }}>
                    <Text style={{ fontSize: 12, color: '#8a5700' }}>Nguyên nhân: {vi.rootCause}</Text>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    );
  };

  // ─── Tab 3: Đối chiếu tài chính ──────────────────────────────────────────────
  const ftColumns: ColumnsType<FinancialTransaction> = [
    {
      title: 'Mã chứng từ',
      dataIndex: 'transactionCode',
      width: 140,
      render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'transactionType',
      width: 120,
      render: (v: string) => {
        const map: Record<string, { label: string; color: string }> = {
          purchase: { label: 'Mua vật tư', color: 'blue' },
          labor: { label: 'Nhân công', color: 'green' },
          equipment: { label: 'Thiết bị', color: 'orange' },
          overhead: { label: 'Chi phí chung', color: 'purple' },
          depreciation: { label: 'Khấu hao', color: 'default' },
          advance: { label: 'Tạm ứng', color: 'cyan' },
        };
        const cfg = map[v] ?? { label: v, color: 'default' };
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'transactionDate',
      width: 110,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text>,
    },
    {
      title: 'Số tiền (tr)',
      dataIndex: 'amount',
      width: 110,
      render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Mã TK',
      dataIndex: 'accountCode',
      width: 80,
      render: (v: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'TTCP',
      dataIndex: 'costCenter',
      width: 80,
      render: (v: string) => <Tag style={{ fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: 'Đối chiếu',
      dataIndex: 'isReconciled',
      width: 100,
      render: (v: boolean) => v
        ? <Tag color="green" icon={<CheckOutlined />} style={{ fontSize: 11 }}>Khớp</Tag>
        : <Tag color="red" icon={<CloseOutlined />} style={{ fontSize: 11 }}>Chưa khớp</Tag>,
    },
    {
      title: 'Ref TC',
      dataIndex: 'financeSystemRef',
      width: 140,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text>,
    },
  ];

  const reconciledCount = transactions.filter(t => t.isReconciled).length;
  const totalFT = transactions.reduce((s, t) => s + t.amount, 0);

  const renderFinance = () => (
    <div>
      {/* Reconciliation header */}
      <Card
        bordered={false}
        style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: settlement.reconciliationStatus === 'reconciled'
                  ? 'linear-gradient(135deg, #52c41a, #73d13d)' : 'linear-gradient(135deg, #faad14, #ffc53d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22,
              }}>
                {settlement.reconciliationStatus === 'reconciled' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              </div>
              <div>
                <Text strong style={{ fontSize: 14 }}>
                  Trạng thái đối chiếu: {' '}
                  {settlement.reconciliationStatus === 'reconciled' ? (
                    <span style={{ color: colors.success }}>Đã đối chiếu khớp</span>
                  ) : settlement.reconciliationStatus === 'discrepancy' ? (
                    <span style={{ color: colors.danger }}>Lệch số liệu</span>
                  ) : (
                    <span style={{ color: colors.warning }}>Chưa đối chiếu</span>
                  )}
                </Text>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  Đồng bộ lần cuối: {formatDateTime(transactions[transactions.length - 1]?.syncedAt ?? settlement.updatedAt)}
                </div>
              </div>
            </div>
          </Col>
          <Col>
            <Row gutter={24} style={{ textAlign: 'center' as const }}>
              <Col>
                <div style={{ fontSize: 20, fontWeight: 700, color: colors.navy }}>{formatCurrency(totalFT)}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>Tổng giao dịch</Text>
              </Col>
              <Col>
                <div style={{ fontSize: 20, fontWeight: 700, color: colors.success }}>{reconciledCount}/{transactions.length}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>Đã đối chiếu</Text>
              </Col>
            </Row>
          </Col>
          <Col>
            <Button
              icon={<SyncOutlined spin={syncingFT} />}
              loading={syncingFT}
              onClick={handleSyncFT}
            >
              Đồng bộ lại
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={ftColumns}
        dataSource={transactions}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 900 }}
        summary={pageData => {
          const total = pageData.reduce((s, r) => s + r.amount, 0);
          return (
            <Table.Summary.Row style={{ background: '#f5f7fa' }}>
              <Table.Summary.Cell index={0} colSpan={3}><Text strong>Tổng</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><Text strong style={{ fontSize: 12 }}>{formatCurrency(total)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4} colSpan={4} />
            </Table.Summary.Row>
          );
        }}
      />
    </div>
  );

  // ─── Tab 4: Phê duyệt ────────────────────────────────────────────────────────
  const renderApproval = () => {
    const isReviewer = settlement.status === 'submitted' || settlement.status === 'reviewing';
    const isApprover = settlement.status === 'reviewing';

    return (
      <div>
        {/* Approval timeline */}
        <Card
          bordered={false}
          title={<Text strong style={{ color: colors.navy }}>Tiến trình phê duyệt</Text>}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
        >
          <Timeline
            items={[
              {
                dot: <CheckCircleOutlined style={{ fontSize: 16, color: colors.navy }} />,
                color: colors.navy,
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>P.KH lập hồ sơ quyết toán</Text>
                    <div style={{ fontSize: 12, color: '#999' }}>{settlement.preparedBy} · {formatDateTime(settlement.preparedAt)}</div>
                    <Tag color="blue" style={{ fontSize: 11, marginTop: 4 }}>Đã lập</Tag>
                  </div>
                ),
              },
              {
                dot: settlement.submittedAt
                  ? <CheckCircleOutlined style={{ fontSize: 16, color: colors.success }} />
                  : <ClockCircleOutlined style={{ fontSize: 16, color: '#999' }} />,
                color: settlement.submittedAt ? colors.success : '#999',
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>Trình P.TCKT thẩm định</Text>
                    {settlement.submittedAt ? (
                      <>
                        <div style={{ fontSize: 12, color: '#999' }}>{settlement.submittedBy} · {formatDateTime(settlement.submittedAt)}</div>
                        <Tag color="cyan" style={{ fontSize: 11, marginTop: 4 }}>Đã trình</Tag>
                      </>
                    ) : <div style={{ fontSize: 12, color: '#bbb' }}>Chưa trình</div>}
                  </div>
                ),
              },
              {
                dot: settlement.reviewedAt && !settlement.rejectedAt
                  ? <CheckCircleOutlined style={{ fontSize: 16, color: colors.success }} />
                  : settlement.rejectedAt
                    ? <CloseOutlined style={{ fontSize: 16, color: colors.danger }} />
                    : <ClockCircleOutlined style={{ fontSize: 16, color: '#999' }} />,
                color: settlement.reviewedAt && !settlement.rejectedAt ? colors.success : settlement.rejectedAt ? colors.danger : '#999',
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>P.TCKT thẩm định</Text>
                    {settlement.reviewedAt ? (
                      <>
                        <div style={{ fontSize: 12, color: '#999' }}>{settlement.reviewedBy} · {formatDateTime(settlement.reviewedAt)}</div>
                        {settlement.rejectedAt ? (
                          <>
                            <Tag color="red" style={{ fontSize: 11, marginTop: 4 }}>Từ chối</Tag>
                            <div style={{ marginTop: 6, padding: '6px 10px', background: '#fff2f0', borderRadius: 6, fontSize: 12, color: '#a8071a' }}>
                              {settlement.rejectionReason}
                            </div>
                          </>
                        ) : (
                          <>
                            <Tag color="green" style={{ fontSize: 11, marginTop: 4 }}>Đã thẩm định</Tag>
                            {settlement.reviewNote && (
                              <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0f9ff', borderRadius: 6, fontSize: 12, color: '#0958d9' }}>
                                {settlement.reviewNote}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : <div style={{ fontSize: 12, color: '#bbb' }}>Chưa thẩm định</div>}
                  </div>
                ),
              },
              {
                dot: settlement.approvedAt
                  ? <CheckCircleOutlined style={{ fontSize: 16, color: colors.success }} />
                  : <ClockCircleOutlined style={{ fontSize: 16, color: '#999' }} />,
                color: settlement.approvedAt ? colors.success : '#999',
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>BGĐ phê duyệt</Text>
                    {settlement.approvedAt ? (
                      <>
                        <div style={{ fontSize: 12, color: '#999' }}>{settlement.approvedBy} · {formatDateTime(settlement.approvedAt)}</div>
                        <Tag color="green" style={{ fontSize: 11, marginTop: 4 }}>Đã phê duyệt</Tag>
                        {varReport?.varianceApprovalNote && (
                          <div style={{ marginTop: 6, padding: '6px 10px', background: '#f6ffed', borderRadius: 6, fontSize: 12, color: '#389e0d' }}>
                            {varReport.varianceApprovalNote}
                          </div>
                        )}
                      </>
                    ) : <div style={{ fontSize: 12, color: '#bbb' }}>Chờ phê duyệt</div>}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Action buttons */}
        {!settlement.isLocked && (isReviewer || isApprover) && (
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text strong style={{ display: 'block', marginBottom: 12, color: colors.navy }}>
              {isApprover ? 'Phê duyệt quyết toán (BGĐ)' : 'Thẩm định quyết toán (P.TCKT)'}
            </Text>
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setApproveModalOpen(true)}
                style={{ background: colors.success, borderColor: colors.success }}
              >
                {isApprover ? 'Phê duyệt' : 'Xác nhận thẩm định'}
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectDrawerOpen(true)}
              >
                Từ chối / Yêu cầu chỉnh sửa
              </Button>
            </Space>
          </Card>
        )}
      </div>
    );
  };

  // ─── Tab 5: Lịch sử phiên bản ────────────────────────────────────────────────
  const versionLogColumns: ColumnsType<SettlementVersionLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'performedAt',
      width: 160,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDateTime(v)}</Text>,
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      width: 80,
      render: (v: number) => <Tag color="blue" style={{ fontSize: 11 }}>v{v}</Tag>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: 130,
      render: (v: string) => {
        const map: Record<string, { label: string; color: string }> = {
          created: { label: 'Tạo mới', color: 'blue' },
          edited: { label: 'Chỉnh sửa', color: 'orange' },
          submitted: { label: 'Trình duyệt', color: 'cyan' },
          reviewed: { label: 'Thẩm định', color: 'geekblue' },
          approved: { label: 'Phê duyệt', color: 'green' },
          rejected: { label: 'Từ chối', color: 'red' },
          locked: { label: 'Khóa', color: 'purple' },
        };
        const cfg = map[v] ?? { label: v, color: 'default' };
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performedBy',
      width: 160,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'comment',
      ellipsis: true,
      render: (v?: string) => v
        ? <Text style={{ fontSize: 12, color: '#555' }}>{v}</Text>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
  ];

  const renderHistory = () => (
    <div>
      {/* All versions of this contract */}
      {allVersions.length > 1 && (
        <Card
          bordered={false}
          title={<Text strong style={{ color: colors.navy }}>Các phiên bản hồ sơ quyết toán</Text>}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {allVersions.map(s => {
              const cfg = settlementStatusConfig[s.status];
              const isCurrent = s.id === settlement.id;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 12px',
                    background: isCurrent ? '#e8f0fe' : '#fafafa',
                    borderRadius: 8,
                    border: `1px solid ${isCurrent ? '#c5d8f7' : '#f0f0f0'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => s.id !== settlement.id && navigate(`/settlement/${s.id}`)}
                >
                  <Tag color="blue" style={{ fontSize: 11 }}>v{s.version}</Tag>
                  <Text style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400 }}>
                    {s.code} {isCurrent && <Text type="secondary" style={{ fontSize: 11 }}>(bản hiện tại)</Text>}
                  </Text>
                  <Tag color={cfg?.color} style={{ fontSize: 11 }}>{cfg?.label}</Tag>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>{formatDate(s.preparedAt)}</Text>
                  {s.rejectionReason && (
                    <Tooltip title={s.rejectionReason}>
                      <ExclamationCircleOutlined style={{ color: colors.danger }} />
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </Space>
        </Card>
      )}

      {/* Version logs */}
      <Card
        bordered={false}
        title={<Text strong style={{ color: colors.navy }}><HistoryOutlined style={{ marginRight: 6 }} />Nhật ký thay đổi</Text>}
        style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Table
          columns={versionLogColumns}
          dataSource={versionLogs}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  const tabItems = [
    { key: 'overview', label: <span><FileTextOutlined />Tổng quan</span>, children: renderOverview() },
    { key: 'items', label: <span><AuditOutlined />Chi tiết hạng mục</span>, children: renderItems() },
    { key: 'finance', label: <span><DollarOutlined />Đối chiếu tài chính</span>, children: renderFinance() },
    { key: 'approval', label: <span><CheckCircleOutlined />Phê duyệt</span>, children: renderApproval() },
    { key: 'history', label: <span><HistoryOutlined />Lịch sử</span>, children: renderHistory() },
  ];

  return (
    <div>
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`,
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(212,168,67,0.08)',
        }} />
        <div style={{
          position: 'absolute', right: 40, bottom: -60,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Button
                type="text"
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/settlement')}
                style={{ color: 'rgba(255,255,255,0.7)', padding: 0 }}
              />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quản lý quyết toán</Text>
            </div>
            <Title level={4} style={{ color: '#fff', margin: 0, letterSpacing: -0.3 }}>
              {settlement.code}
            </Title>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 12 }}>
                v{settlement.version}
              </Tag>
              <Tag style={{ background: 'rgba(212,168,67,0.3)', border: '1px solid rgba(212,168,67,0.5)', color: '#f0d890', fontSize: 12 }}>
                {settlement.settlementType === 'final' ? 'Quyết toán toàn bộ' : 'Quyết toán từng phần'}
              </Tag>
              <Tag color={statusCfg.color} style={{ fontSize: 12 }}>{statusCfg.label}</Tag>
              {settlement.isLocked && (
                <Tag style={{ background: 'rgba(114,46,209,0.3)', border: '1px solid rgba(114,46,209,0.5)', color: '#d3adf7', fontSize: 12 }}>
                  <LockOutlined style={{ marginRight: 4 }} />Đã khóa
                </Tag>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' as const }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>Thực chi / Dự toán</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
              {formatCurrency(settlement.actualCost)}
              <span style={{ fontSize: 14, opacity: 0.7, margin: '0 4px' }}>/</span>
              <span style={{ fontSize: 16, opacity: 0.8 }}>{formatCurrency(settlement.plannedCost)}</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag style={{
                background: settlement.costVariance > 0 ? 'rgba(255,77,79,0.2)' : 'rgba(82,196,26,0.2)',
                border: `1px solid ${settlement.costVariance > 0 ? 'rgba(255,77,79,0.5)' : 'rgba(82,196,26,0.5)'}`,
                color: settlement.costVariance > 0 ? '#ff7875' : '#95de64',
                fontSize: 12,
              }}>
                {settlement.costVariance > 0 ? '+' : ''}{settlement.costVariancePct.toFixed(1)}% so dự toán
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card bordered={false} style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ minHeight: 400 }}
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        open={approveModalOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: colors.success }} />
            <span>Phê duyệt hồ sơ quyết toán</span>
          </div>
        }
        onOk={handleApprove}
        onCancel={() => setApproveModalOpen(false)}
        okText="Xác nhận phê duyệt"
        okButtonProps={{ style: { background: colors.success, borderColor: colors.success } }}
      >
        <Form form={approveForm} layout="vertical">
          {varReport?.explanationRequired && (
            <Alert
              type="warning"
              message={`Hồ sơ này có chênh lệch chi phí ${settlement.costVariancePct.toFixed(1)}% so với dự toán`}
              description="Phê duyệt sẽ xác nhận chấp thuận khoản vượt dự toán có giải trình."
              showIcon
              style={{ marginBottom: 14 }}
            />
          )}
          <Form.Item
            name="approvalNote"
            label="Ý kiến phê duyệt"
            rules={[{ required: true, message: 'Vui lòng nhập ý kiến' }]}
          >
            <Input.TextArea rows={3} placeholder="Ghi nhận ý kiến phê duyệt của BGĐ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Drawer */}
      <Drawer
        open={rejectDrawerOpen}
        onClose={() => setRejectDrawerOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloseOutlined style={{ color: colors.danger }} />
            <span>Từ chối / Yêu cầu chỉnh sửa</span>
          </div>
        }
        width={480}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setRejectDrawerOpen(false)}>Hủy</Button>
            <Button danger icon={<CloseOutlined />} onClick={handleReject}>Từ chối & trả về</Button>
          </Space>
        }
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectionReason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea rows={4} placeholder="Nêu rõ lý do từ chối và hướng dẫn chỉnh sửa..." />
          </Form.Item>
          <Form.Item name="requiredItems" label="Các mục cần bổ sung">
            <Select
              mode="tags"
              placeholder="Thêm danh sách yêu cầu bổ sung..."
              options={[
                { value: 'missing_invoices', label: 'Thiếu hóa đơn vật tư' },
                { value: 'missing_labor_records', label: 'Thiếu bảng chấm công' },
                { value: 'missing_variance_explanation', label: 'Thiếu giải trình chênh lệch' },
                { value: 'missing_acceptance_docs', label: 'Thiếu biên bản nghiệm thu' },
                { value: 'quantity_mismatch', label: 'Khối lượng không khớp' },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default SettlementDetail;
