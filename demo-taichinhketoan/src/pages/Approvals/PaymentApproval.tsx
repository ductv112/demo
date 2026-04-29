import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Modal, Space, Statistic, Row, Col,
  Typography, Input, InputNumber, Radio, message, Descriptions, Divider,
} from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, ClockCircleOutlined, WalletOutlined, BankOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { paymentRequests } from '../../data/paymentRequests';
import { getDepartmentShortName } from '../../data/departments';
import {
  formatCurrency, formatNumber, formatDate,
  paymentStatusConfig,
} from '../../utils/format';
import { tasks2026 } from '../../data/tasks';
import { colors } from '../../theme/themeConfig';
import type { PaymentRequest } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Styles ──────────────────────────────────────────────────────────
const pageStyles = `
  .dashboard-card {
    transition: all 0.3s ease;
    border-radius: 8px;
  }
  .dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(27, 58, 92, 0.12);
  }
  .stat-card {
    border-radius: 8px;
    overflow: hidden;
  }
  .stat-card .ant-statistic-title {
    font-size: 13px;
    color: #666;
  }
  .stat-card .ant-statistic-content-value {
    font-weight: 700;
  }
  .approval-table .ant-table-thead > tr > th {
    background: ${colors.bgLight};
    color: ${colors.navy};
    font-weight: 600;
  }
  .approval-table .ant-table-tbody > tr:hover > td {
    background: #e8f0fe !important;
  }
`;

type DisbursementType = 'full' | 'partial';

const PaymentApproval: React.FC = () => {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [disbursementType, setDisbursementType] = useState<DisbursementType>('full');
  const [partialAmount, setPartialAmount] = useState<number | null>(null);

  // ─── Data: filter requests needing director approval ─────────────
  const approvalData = useMemo(() => {
    return paymentRequests.filter(
      (r) => r.status === 'approved' || r.status === 'submitted'
    );
  }, []);

  // ─── Statistics ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pendingDisbursement = paymentRequests.filter(
      (r) => r.status === 'approved' || r.status === 'submitted'
    );
    const paidThisMonth = paymentRequests.filter((r) => r.status === 'paid');
    const pendingTotal = pendingDisbursement.reduce((sum, r) => sum + r.amount, 0);
    const paidTotal = paidThisMonth.reduce((sum, r) => sum + r.amount, 0);
    return {
      pendingCount: pendingDisbursement.length,
      paidCount: paidThisMonth.length,
      pendingTotal,
      paidTotal,
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleOpenApprove = (record: PaymentRequest) => {
    setSelectedRequest(record);
    setApprovalNote('');
    setDisbursementType('full');
    setPartialAmount(null);
    setApproveModalOpen(true);
  };

  const handleApprove = () => {
    const amountText =
      disbursementType === 'full'
        ? `${formatNumber(selectedRequest!.amount)} triệu đồng`
        : `${formatNumber(partialAmount || 0)} triệu đồng (một phần)`;
    message.success(
      `Đã duyệt giải ngân ${selectedRequest?.code} - Số tiền: ${amountText}`
    );
    setApproveModalOpen(false);
    setSelectedRequest(null);
    setApprovalNote('');
  };

  const handleReject = (record: PaymentRequest) => {
    Modal.confirm({
      title: 'Xác nhận từ chối giải ngân',
      content: `Bạn có chắc chắn muốn từ chối giải ngân cho đề nghị ${record.code}?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => {
        message.warning(`Đã từ chối giải ngân ${record.code}`);
      },
    });
  };

  // ─── Columns ─────────────────────────────────────────────────────
  const columns: ColumnsType<PaymentRequest> = [
    {
      title: 'Mã ĐNTT',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string) => (
        <Text strong style={{ color: colors.navy }}>{code}</Text>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: PaymentRequest) => {
        const task = tasks2026.find(t => t.id === record.taskId);
        return (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 2 }}>{title}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{task?.name || record.categoryType}</Text>
          </div>
        );
      },
    },
    {
      title: 'Phòng ban',
      dataIndex: 'departmentId',
      key: 'departmentId',
      width: 110,
      render: (deptId: string) => (
        <Tag>{getDepartmentShortName(deptId)}</Tag>
      ),
    },
    {
      title: 'Số tiền (tr)',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: colors.navy }}>
          {formatNumber(amount)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PaymentRequest['status']) => {
        const config = paymentStatusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 120,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{date ? formatDate(date) : '—'}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 260,
      render: (_: unknown, record: PaymentRequest) => (
        <Space size={8}>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: colors.success, borderColor: colors.success }}
            onClick={() => handleOpenApprove(record)}
          >
            Duyệt giải ngân
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  // ─── Stat cards config ───────────────────────────────────────────
  const statCards = [
    {
      title: 'Chờ giải ngân',
      value: stats.pendingCount,
      icon: <ClockCircleOutlined style={{ fontSize: 28, color: colors.navy }} />,
      borderColor: colors.navy,
      suffix: 'đề nghị',
    },
    {
      title: 'Đã giải ngân tháng này',
      value: stats.paidTotal,
      icon: <WalletOutlined style={{ fontSize: 28, color: colors.success }} />,
      borderColor: colors.success,
      suffix: 'tr',
      isFormatted: true,
    },
    {
      title: 'Tổng số tiền chờ duyệt',
      value: stats.pendingTotal,
      icon: <DollarOutlined style={{ fontSize: 28, color: colors.gold }} />,
      borderColor: colors.gold,
      suffix: 'tr',
      isFormatted: true,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      <style>{pageStyles}</style>
      <div style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <DollarOutlined style={{ marginRight: 8 }} />
            Quyết định Giải ngân
          </Title>
          <Text type="secondary">
            Có {stats.pendingCount} đề nghị thanh toán đang chờ Ban Giám đốc quyết định giải ngân
          </Text>
        </div>

        {/* ═══ Stat Cards ═══ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statCards.map((card, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <Card
                className="dashboard-card stat-card"
                style={{
                  borderLeft: `4px solid ${card.borderColor}`,
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <Row align="middle" justify="space-between">
                  <Col flex="auto">
                    <Statistic
                      title={card.title}
                      value={card.value}
                      suffix={card.suffix}
                      formatter={(val) =>
                        card.isFormatted ? formatNumber(val as number) : String(val)
                      }
                      valueStyle={{
                        color: card.borderColor,
                        fontSize: 26,
                        fontWeight: 700,
                      }}
                    />
                  </Col>
                  <Col>{card.icon}</Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ═══ Table ═══ */}
        <Card
          className="dashboard-card"
          title={
            <Space>
              <BankOutlined style={{ color: colors.navy }} />
              <Text strong style={{ color: colors.navy }}>
                Danh sách Đề nghị Thanh toán chờ giải ngân
              </Text>
            </Space>
          }
        >
          <Table
            className="approval-table"
            columns={columns}
            dataSource={approvalData}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      </div>

      {/* ═══ Modal: Duyệt giải ngân ═══ */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: colors.success }} />
            <span>Quyết định Giải ngân</span>
          </Space>
        }
        open={approveModalOpen}
        onCancel={() => {
          setApproveModalOpen(false);
          setSelectedRequest(null);
          setApprovalNote('');
        }}
        footer={null}
        width={640}
      >
        {selectedRequest && (
          <div>
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 16 }}
              labelStyle={{ fontWeight: 600, width: 180, backgroundColor: colors.bgLight }}
            >
              <Descriptions.Item label="Mã đề nghị">
                <Text strong style={{ color: colors.navy }}>{selectedRequest.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                {selectedRequest.title}
              </Descriptions.Item>
              <Descriptions.Item label="Nhiệm vụ">
                {tasks2026.find(t => t.id === selectedRequest.taskId)?.name || selectedRequest.categoryType}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                <Tag>{getDepartmentShortName(selectedRequest.departmentId)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền đề nghị">
                <Text strong style={{ color: colors.danger, fontSize: 16 }}>
                  {formatNumber(selectedRequest.amount)} triệu đồng
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">
                {selectedRequest.vendor || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Số hợp đồng">
                {selectedRequest.contractNo || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Người đề nghị">
                {selectedRequest.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày gửi">
                {selectedRequest.submittedAt ? formatDate(selectedRequest.submittedAt) : '—'}
              </Descriptions.Item>
              {selectedRequest.reviewNote && (
                <Descriptions.Item label="Ý kiến xem xét">
                  <Text type="secondary">{selectedRequest.reviewNote}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left" style={{ color: colors.navy, fontSize: 13 }}>
              Hình thức giải ngân
            </Divider>

            <Radio.Group
              value={disbursementType}
              onChange={(e) => {
                setDisbursementType(e.target.value);
                if (e.target.value === 'full') {
                  setPartialAmount(null);
                }
              }}
              style={{ marginBottom: 16 }}
            >
              <Space direction="vertical">
                <Radio value="full">
                  <Text strong>Giải ngân toàn bộ</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({formatNumber(selectedRequest.amount)} triệu đồng)
                  </Text>
                </Radio>
                <Radio value="partial">
                  <Text strong>Giải ngân một phần</Text>
                </Radio>
              </Space>
            </Radio.Group>

            {disbursementType === 'partial' && (
              <div style={{ marginBottom: 16, paddingLeft: 24 }}>
                <Text style={{ display: 'block', marginBottom: 8 }}>
                  Số tiền giải ngân (triệu đồng):
                </Text>
                <InputNumber
                  style={{ width: 250 }}
                  min={0}
                  max={selectedRequest.amount}
                  value={partialAmount}
                  onChange={(val) => setPartialAmount(val)}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => Number(value!.replace(/,/g, ''))}
                  placeholder="Nhập số tiền giải ngân"
                  addonAfter="triệu"
                />
                <Text
                  type="secondary"
                  style={{ display: 'block', marginTop: 4, fontSize: 12 }}
                >
                  Tối đa: {formatNumber(selectedRequest.amount)} triệu đồng
                </Text>
              </div>
            )}

            <Divider orientation="left" style={{ color: colors.navy, fontSize: 13 }}>
              Ý kiến phê duyệt
            </Divider>

            <TextArea
              rows={3}
              placeholder="Nhập ý kiến giải ngân (nếu có)..."
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={() => {
                    setApproveModalOpen(false);
                    setSelectedRequest(null);
                    setApprovalNote('');
                  }}
                >
                  Huỷ
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: colors.success, borderColor: colors.success }}
                  onClick={handleApprove}
                  disabled={
                    disbursementType === 'partial' &&
                    (!partialAmount || partialAmount <= 0)
                  }
                >
                  Xác nhận Giải ngân
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PaymentApproval;
