import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Modal, Space, Statistic, Row, Col,
  Typography, Input, message, Descriptions, Divider,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  ClockCircleOutlined, FileDoneOutlined, DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { costPlans, budgetSources } from '../../data/costPlans';
import { formatCurrency, formatNumber, formatDate, costPlanStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { CostPlan } from '../../types';

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

const CostPlanApproval: React.FC = () => {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CostPlan | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // ─── Statistics ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = costPlans.filter(p => p.status === 'pending_approval');
    const approved = costPlans.filter(p => p.status === 'approved' || p.status === 'executing' || p.status === 'settled');
    const pendingBudget = pending.reduce((sum, p) => sum + p.totalBudget, 0);
    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      pendingBudget,
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleOpenApprove = (plan: CostPlan) => {
    setSelectedPlan(plan);
    setReviewNote('');
    setApproveModalOpen(true);
  };

  const handleOpenDetail = (plan: CostPlan) => {
    setSelectedPlan(plan);
    setDetailModalOpen(true);
  };

  const handleApprove = () => {
    message.success(`Đã phê duyệt Kế hoạch Chi phí ${selectedPlan?.id} thành công!`);
    setApproveModalOpen(false);
    setSelectedPlan(null);
    setReviewNote('');
  };

  const handleReject = (plan: CostPlan) => {
    Modal.confirm({
      title: 'Xác nhận từ chối',
      content: `Bạn có chắc chắn muốn từ chối Kế hoạch Chi phí ${plan.id}?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => {
        message.warning(`Đã từ chối Kế hoạch Chi phí ${plan.id}`);
      },
    });
  };

  // ─── Columns ─────────────────────────────────────────────────────
  const columns: ColumnsType<CostPlan> = [
    {
      title: 'Mã KHCP',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        <Text strong style={{ color: colors.navy }}>{id}</Text>
      ),
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      align: 'center',
      render: (year: number) => <Tag color="blue">{year}</Tag>,
    },
    {
      title: 'Tổng ngân sách',
      dataIndex: 'totalBudget',
      key: 'totalBudget',
      width: 150,
      align: 'right',
      render: (val: number) => (
        <Text strong style={{ color: colors.navy }}>
          {val > 0 ? `${formatNumber(val)} tr` : 'Chưa xác định'}
        </Text>
      ),
    },
    {
      title: 'Đã phân bổ',
      dataIndex: 'allocatedBudget',
      key: 'allocatedBudget',
      width: 140,
      align: 'right',
      render: (val: number) => (
        <Text>{val > 0 ? `${formatNumber(val)} tr` : '—'}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: CostPlan['status']) => {
        const config = costPlanStatusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Ngày trình duyệt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      render: (date: string) => <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 280,
      render: (_: unknown, record: CostPlan) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: colors.success, borderColor: colors.success }}
            onClick={() => handleOpenApprove(record)}
          >
            Phê duyệt
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
      title: 'Chờ phê duyệt',
      value: stats.pendingCount,
      icon: <ClockCircleOutlined style={{ fontSize: 28, color: colors.navy }} />,
      borderColor: colors.navy,
      suffix: 'kế hoạch',
    },
    {
      title: 'Đã phê duyệt',
      value: stats.approvedCount,
      icon: <FileDoneOutlined style={{ fontSize: 28, color: colors.success }} />,
      borderColor: colors.success,
      suffix: 'kế hoạch',
    },
    {
      title: 'Tổng ngân sách chờ duyệt',
      value: stats.pendingBudget,
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
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            Phê duyệt Kế hoạch Chi phí
          </Title>
          <Text type="secondary">
            Có {stats.pendingCount} kế hoạch chi phí đang chờ Ban Giám đốc phê duyệt
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
              <FileDoneOutlined style={{ color: colors.navy }} />
              <Text strong style={{ color: colors.navy }}>
                Danh sách Kế hoạch Chi phí
              </Text>
            </Space>
          }
        >
          <Table
            className="approval-table"
            columns={columns}
            dataSource={costPlans}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      </div>

      {/* ═══ Modal: Phê duyệt KHCP ═══ */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: colors.success }} />
            <span>Phê duyệt Kế hoạch Chi phí</span>
          </Space>
        }
        open={approveModalOpen}
        onCancel={() => {
          setApproveModalOpen(false);
          setSelectedPlan(null);
          setReviewNote('');
        }}
        footer={null}
        width={640}
      >
        {selectedPlan && (
          <div>
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 16 }}
              labelStyle={{ fontWeight: 600, width: 180, backgroundColor: colors.bgLight }}
            >
              <Descriptions.Item label="Mã kế hoạch">
                <Text strong style={{ color: colors.navy }}>{selectedPlan.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Năm kế hoạch">
                <Tag color="blue">{selectedPlan.year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng ngân sách">
                <Text strong style={{ color: colors.navy, fontSize: 16 }}>
                  {selectedPlan.totalBudget > 0
                    ? `${formatNumber(selectedPlan.totalBudget)} triệu đồng`
                    : 'Chưa xác định'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedPlan.note || '—'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ color: colors.navy, fontSize: 13 }}>
              Phân bổ theo nguồn kinh phí
            </Divider>

            <div style={{ marginBottom: 16 }}>
              {budgetSources.map((source) => (
                <div
                  key={source.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: 13,
                  }}
                >
                  <Text>{source.name}</Text>
                  <Text type="secondary">{source.description}</Text>
                </div>
              ))}
            </div>

            <Divider orientation="left" style={{ color: colors.navy, fontSize: 13 }}>
              Ý kiến phê duyệt
            </Divider>

            <TextArea
              rows={3}
              placeholder="Nhập ý kiến phê duyệt (nếu có)..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setApproveModalOpen(false);
                  setSelectedPlan(null);
                  setReviewNote('');
                }}>
                  Huỷ
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: colors.success, borderColor: colors.success }}
                  onClick={handleApprove}
                >
                  Phê duyệt KHCP
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ Modal: Xem chi tiết ═══ */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: colors.navy }} />
            <span>Chi tiết Kế hoạch Chi phí</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedPlan(null);
        }}
        footer={
          <Button onClick={() => {
            setDetailModalOpen(false);
            setSelectedPlan(null);
          }}>
            Đóng
          </Button>
        }
        width={600}
      >
        {selectedPlan && (
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600, width: 180, backgroundColor: colors.bgLight }}
          >
            <Descriptions.Item label="Mã kế hoạch">
              <Text strong style={{ color: colors.navy }}>{selectedPlan.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Năm kế hoạch">
              <Tag color="blue">{selectedPlan.year}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={costPlanStatusConfig[selectedPlan.status].color}>
                {costPlanStatusConfig[selectedPlan.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng ngân sách">
              <Text strong>
                {selectedPlan.totalBudget > 0
                  ? `${formatNumber(selectedPlan.totalBudget)} triệu đồng`
                  : 'Chưa xác định'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Đã phân bổ">
              {selectedPlan.allocatedBudget > 0
                ? `${formatNumber(selectedPlan.allocatedBudget)} triệu đồng`
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Đã chi">
              {selectedPlan.spentBudget > 0
                ? `${formatNumber(selectedPlan.spentBudget)} triệu đồng`
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Còn lại">
              {selectedPlan.remainingBudget > 0
                ? `${formatNumber(selectedPlan.remainingBudget)} triệu đồng`
                : '—'}
            </Descriptions.Item>
            {selectedPlan.approvedDate && (
              <Descriptions.Item label="Ngày phê duyệt">
                {formatDate(selectedPlan.approvedDate)}
              </Descriptions.Item>
            )}
            {selectedPlan.approvedBy && (
              <Descriptions.Item label="Người phê duyệt">
                {selectedPlan.approvedBy}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ghi chú">
              {selectedPlan.note || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(selectedPlan.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDate(selectedPlan.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default CostPlanApproval;
