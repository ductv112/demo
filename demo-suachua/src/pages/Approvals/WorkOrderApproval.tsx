import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Row, Col, Space, Button, Statistic, Modal,
  Descriptions, Input, message, Dropdown,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarryOutOutlined,
  EyeOutlined,
  ExclamationCircleOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { workOrders } from '../../data/workOrders';
import {
  workOrderStatusConfig,
  repairTypeConfig,
  priorityConfig,
  formatDate,
  formatCurrency,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkOrder } from '../../types';

const { TextArea } = Input;

// ─── Styles ──────────────────────────────────────────────────────────
const pageStyles = `
  .approval-page .db-stat-card {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    min-height: 120px;
  }
  .approval-page .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .approval-page .db-stat-card:hover .db-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .approval-page .db-bg-icon {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 64px;
    opacity: 0.1;
    color: #ffffff;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .approval-page .db-stat-card .db-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255,255,255,0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #ffffff;
    margin-bottom: 12px;
  }
  .approval-page .db-stat-card .db-stat-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .approval-page .db-stat-card .db-stat-unit {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    margin-left: 4px;
  }
  .approval-page .db-stat-card .db-stat-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 4px;
  }
  .approval-page .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .approval-page .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
`;

const APPROVAL_STATUSES = ['pending_approval', 'approved', 'rejected'] as const;

const WorkOrderApproval: React.FC = () => {
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // ─── Filtered data ──────────────────────────────────────────────
  const approvalOrders = useMemo(() => {
    return workOrders.filter(wo =>
      (APPROVAL_STATUSES as readonly string[]).includes(wo.status)
    );
  }, []);

  // ─── Statistics ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = approvalOrders.filter(wo => wo.status === 'pending_approval').length;
    const approved = approvalOrders.filter(wo => wo.status === 'approved').length;
    const rejected = approvalOrders.filter(wo => wo.status === 'rejected').length;
    return { pending, approved, rejected };
  }, [approvalOrders]);

  // ─── Action menu ────────────────────────────────────────────────
  const getActionMenu = (record: WorkOrder) => {
    const items: any[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => handleOpenApproval(record),
      },
    ];
    if (record.status === 'pending_approval') {
      items.push(
        { type: 'divider' },
        {
          key: 'approve',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          label: <span style={{ color: '#52c41a' }}>Phê duyệt</span>,
          onClick: () => handleOpenApproval(record),
        },
        {
          key: 'reject',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          label: <span style={{ color: '#ff4d4f' }}>Từ chối</span>,
          onClick: () => handleOpenApproval(record),
        },
      );
    }
    return items;
  };

  // ─── Handlers ────────────────────────────────────────────────────
  const handleOpenApproval = (record: WorkOrder) => {
    setSelectedOrder(record);
    setReviewNote('');
    setApprovalModalOpen(true);
  };

  const handleApprove = () => {
    message.success(`Đã phê duyệt lệnh sửa chữa ${selectedOrder?.code} thành công!`);
    setApprovalModalOpen(false);
    setSelectedOrder(null);
    setReviewNote('');
  };

  const handleReject = () => {
    if (!reviewNote.trim()) {
      message.warning('Vui lòng nhập lý do từ chối!');
      return;
    }
    message.warning(`Đã từ chối lệnh sửa chữa ${selectedOrder?.code}.`);
    setApprovalModalOpen(false);
    setSelectedOrder(null);
    setReviewNote('');
  };

  // ─── Columns ─────────────────────────────────────────────────────
  const columns: ColumnsType<WorkOrder> = [
    {
      title: 'Mã lệnh SC',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string) => (
        <span style={{ color: colors.navy, fontWeight: 600 }}>{code}</span>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 240,
    },
    {
      title: 'Loại sửa chữa',
      dataIndex: 'repairType',
      key: 'repairType',
      width: 150,
      render: (type: WorkOrder['repairType']) => {
        const cfg = repairTypeConfig[type];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: WorkOrder['priority']) => {
        const cfg = priorityConfig[priority];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Dự toán chi phí',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      width: 140,
      align: 'right',
      render: (cost: number) => (
        <span style={{ fontWeight: 600, color: colors.navy }}>
          {cost > 0 ? formatCurrency(cost) : '--'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: WorkOrder['status']) => {
        const cfg = workOrderStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
    },
    {
      title: '', key: 'action', width: 50, align: 'center', fixed: 'right',
      render: (_: unknown, record: WorkOrder) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      ),
    },
  ];

  // ─── Stat cards ──────────────────────────────────────────────────
  const statCards = [
    {
      title: 'Chờ phê duyệt',
      value: stats.pending,
      unit: 'lệnh',
      gradient: `linear-gradient(135deg, ${colors.warning}, #ffc53d)`,
      icon: <ExclamationCircleOutlined />,
      badgeIcon: <ExclamationCircleOutlined />,
    },
    {
      title: 'Đã phê duyệt',
      value: stats.approved,
      unit: 'lệnh',
      gradient: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
      icon: <CheckCircleOutlined />,
      badgeIcon: <CheckCircleOutlined />,
    },
    {
      title: 'Từ chối',
      value: stats.rejected,
      unit: 'lệnh',
      gradient: `linear-gradient(135deg, ${colors.danger}, #ff7875)`,
      icon: <CloseCircleOutlined />,
      badgeIcon: <CloseCircleOutlined />,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      <style>{pageStyles}</style>
      <div className="approval-page" style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: 0, color: colors.navy, fontSize: 18, fontWeight: 700 }}>
            <CarryOutOutlined style={{ marginRight: 8 }} />
            Phê duyệt lệnh SC
          </h4>
          <span style={{ color: colors.textSecondary, fontSize: 13 }}>
            {stats.pending > 0
              ? `Có ${stats.pending} lệnh sửa chữa đang chờ Ban Giám đốc phê duyệt`
              : 'Không có lệnh sửa chữa nào chờ phê duyệt'}
          </span>
        </div>

        {/* Stat Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statCards.map((card, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <div className="db-stat-card" style={{ background: card.gradient }}>
                <div className="db-bg-icon">{card.icon}</div>
                <div className="db-icon-badge">{card.badgeIcon}</div>
                <div>
                  <span className="db-stat-value">{card.value}</span>
                  <span className="db-stat-unit">{card.unit}</span>
                </div>
                <div className="db-stat-label">{card.title}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Table */}
        <Card
          className="db-chart-card"
          title={
            <Space>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', fontSize: 16,
              }}>
                <CarryOutOutlined />
              </div>
              <span style={{ color: colors.navy, fontWeight: 600 }}>
                Danh sách lệnh sửa chữa
              </span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={approvalOrders}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1300 }}
            size="middle"
          />
        </Card>
      </div>

      {/* Approval Modal */}
      <Modal
        title={
          <Space>
            {selectedOrder?.status === 'pending_approval' ? (
              <CarryOutOutlined style={{ color: colors.warning }} />
            ) : (
              <EyeOutlined style={{ color: colors.navy }} />
            )}
            <span>
              {selectedOrder?.status === 'pending_approval'
                ? 'Phê duyệt lệnh sửa chữa'
                : 'Chi tiết lệnh sửa chữa'}
            </span>
          </Space>
        }
        open={approvalModalOpen}
        onCancel={() => {
          setApprovalModalOpen(false);
          setSelectedOrder(null);
          setReviewNote('');
        }}
        footer={null}
        width={680}
      >
        {selectedOrder && (
          <div>
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 16 }}
              labelStyle={{ fontWeight: 600, width: 160, backgroundColor: colors.bgLight }}
            >
              <Descriptions.Item label="Mã lệnh SC">
                <span style={{ color: colors.navy, fontWeight: 600 }}>
                  {selectedOrder.code}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị">
                {selectedOrder.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị">
                {selectedOrder.unitName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại sửa chữa">
                <Tag color={repairTypeConfig[selectedOrder.repairType].color}>
                  {repairTypeConfig[selectedOrder.repairType].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ ưu tiên">
                <Tag color={priorityConfig[selectedOrder.priority].color}>
                  {priorityConfig[selectedOrder.priority].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chẩn đoán">
                {selectedOrder.diagnosticSummary}
              </Descriptions.Item>
              <Descriptions.Item label="Tổ sửa chữa">
                {selectedOrder.assignedTeam}
              </Descriptions.Item>
              <Descriptions.Item label="Tổ trưởng">
                {selectedOrder.leader}
              </Descriptions.Item>
              <Descriptions.Item label="Dự toán chi phí">
                <span style={{ color: colors.navy, fontWeight: 700, fontSize: 15 }}>
                  {selectedOrder.estimatedCost > 0
                    ? formatCurrency(selectedOrder.estimatedCost)
                    : '--'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">
                {selectedOrder.plannedStart && selectedOrder.plannedEnd
                  ? `${formatDate(selectedOrder.plannedStart)} - ${formatDate(selectedOrder.plannedEnd)}`
                  : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={workOrderStatusConfig[selectedOrder.status].color}>
                  {workOrderStatusConfig[selectedOrder.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {selectedOrder.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(selectedOrder.createdDate)}
              </Descriptions.Item>
              {selectedOrder.approvedBy && (
                <Descriptions.Item label="Người phê duyệt">
                  {selectedOrder.approvedBy}
                </Descriptions.Item>
              )}
              {selectedOrder.approvedDate && (
                <Descriptions.Item label="Ngày phê duyệt">
                  {formatDate(selectedOrder.approvedDate)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.notes || '--'}
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.status === 'pending_approval' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, color: colors.navy, fontSize: 13 }}>
                    Ý kiến phê duyệt
                  </span>
                </div>
                <TextArea
                  rows={3}
                  placeholder="Nhập ý kiến phê duyệt hoặc lý do từ chối..."
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  style={{ marginBottom: 16 }}
                />
                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => {
                      setApprovalModalOpen(false);
                      setSelectedOrder(null);
                      setReviewNote('');
                    }}>
                      Hủy
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={handleReject}
                    >
                      Từ chối
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      style={{ backgroundColor: colors.success, borderColor: colors.success }}
                      onClick={handleApprove}
                    >
                      Phê duyệt
                    </Button>
                  </Space>
                </div>
              </>
            )}

            {selectedOrder.status !== 'pending_approval' && (
              <div style={{ textAlign: 'right' }}>
                <Button onClick={() => {
                  setApprovalModalOpen(false);
                  setSelectedOrder(null);
                }}>
                  Đóng
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default WorkOrderApproval;
