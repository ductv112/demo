import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Row, Col, Space, Button, Statistic, Modal, Descriptions, Dropdown,
} from 'antd';
import {
  SwapOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CarryOutOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { workOrders } from '../../data/workOrders';
import { workOrderStatusConfig, formatDate, formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkOrder } from '../../types';

// ─── Styles ──────────────────────────────────────────────────────────
const pageStyles = `
  .handover-page .db-stat-card {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    min-height: 120px;
  }
  .handover-page .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .handover-page .db-stat-card:hover .db-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .handover-page .db-bg-icon {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 64px;
    opacity: 0.1;
    color: #ffffff;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .handover-page .db-stat-card .db-icon-badge {
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
  .handover-page .db-stat-card .db-stat-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .handover-page .db-stat-card .db-stat-unit {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    margin-left: 4px;
  }
  .handover-page .db-stat-card .db-stat-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 4px;
  }
  .handover-page .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .handover-page .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
`;

const HANDOVER_STATUSES = ['accepted', 'handed_over', 'closed'] as const;

const Handover: React.FC = () => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // ─── Filtered data (only handover-related statuses) ──────────────
  const handoverOrders = useMemo(() => {
    return workOrders.filter(wo =>
      (HANDOVER_STATUSES as readonly string[]).includes(wo.status)
    );
  }, []);

  // ─── Statistics ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = handoverOrders.length;
    const pending = handoverOrders.filter(wo => wo.status === 'accepted').length;
    const completed = handoverOrders.filter(wo =>
      wo.status === 'handed_over' || wo.status === 'closed'
    ).length;
    return { total, pending, completed };
  }, [handoverOrders]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleViewDetail = (record: WorkOrder) => {
    setSelectedOrder(record);
    setDetailModalOpen(true);
  };

  // ─── Action menu ────────────────────────────────────────────────
  const getActionMenu = (record: WorkOrder) => {
    const items: any[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => handleViewDetail(record),
      },
    ];
    if (record.status === 'accepted') {
      items.push(
        { type: 'divider' },
        {
          key: 'handover',
          icon: <CarryOutOutlined style={{ color: '#1B3A5C' }} />,
          label: 'Bàn giao',
          onClick: () => handleHandover(record),
        },
      );
    }
    return items;
  };

  const handleHandover = (record: WorkOrder) => {
    Modal.confirm({
      title: 'Xác nhận bàn giao',
      content: `Bàn giao thiết bị "${record.equipmentName}" (${record.code}) cho đơn vị ${record.unitName}?`,
      okText: 'Xác nhận bàn giao',
      cancelText: 'Hủy',
      onOk: () => {
        Modal.success({
          title: 'Bàn giao thành công',
          content: `Đã bàn giao thiết bị ${record.equipmentName} cho ${record.unitName}.`,
        });
      },
    });
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
      title: 'Đơn vị',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 150,
    },
    {
      title: 'Tổ sửa chữa',
      dataIndex: 'assignedTeam',
      key: 'assignedTeam',
      width: 200,
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'actualEnd',
      key: 'actualEnd',
      width: 140,
      render: (date: string) => date ? formatDate(date) : '--',
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
      title: 'Tổng chi phí',
      dataIndex: 'actualCost',
      key: 'actualCost',
      width: 130,
      align: 'right',
      render: (cost: number) => (
        <span style={{ fontWeight: 600, color: colors.navy }}>
          {cost > 0 ? formatCurrency(cost) : '--'}
        </span>
      ),
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
      title: 'Tổng bàn giao',
      value: stats.total,
      unit: 'lệnh',
      gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
      icon: <SwapOutlined />,
      badgeIcon: <SwapOutlined />,
    },
    {
      title: 'Chờ bàn giao',
      value: stats.pending,
      unit: 'lệnh',
      gradient: `linear-gradient(135deg, ${colors.warning}, #ffc53d)`,
      icon: <CarryOutOutlined />,
      badgeIcon: <CarryOutOutlined />,
    },
    {
      title: 'Đã bàn giao',
      value: stats.completed,
      unit: 'lệnh',
      gradient: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
      icon: <CheckCircleOutlined />,
      badgeIcon: <CheckCircleOutlined />,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      <style>{pageStyles}</style>
      <div className="handover-page" style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: 0, color: colors.navy, fontSize: 18, fontWeight: 700 }}>
            <SwapOutlined style={{ marginRight: 8 }} />
            Bàn giao thiết bị
          </h4>
          <span style={{ color: colors.textSecondary, fontSize: 13 }}>
            Quản lý bàn giao thiết bị sau sửa chữa cho đơn vị
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
                <SwapOutlined />
              </div>
              <span style={{ color: colors.navy, fontWeight: 600 }}>
                Danh sách bàn giao
              </span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={handoverOrders}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: colors.navy }} />
            <span>Chi tiết bàn giao</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={
          <Button onClick={() => {
            setDetailModalOpen(false);
            setSelectedOrder(null);
          }}>
            Đóng
          </Button>
        }
        width={780}
      >
        {selectedOrder && (
          <Descriptions
            bordered
            column={1}
            size="small"
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
            <Descriptions.Item label="Tổ sửa chữa">
              {selectedOrder.assignedTeam}
            </Descriptions.Item>
            <Descriptions.Item label="Tổ trưởng">
              {selectedOrder.leader}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={workOrderStatusConfig[selectedOrder.status].color}>
                {workOrderStatusConfig[selectedOrder.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {selectedOrder.actualStart ? formatDate(selectedOrder.actualStart) : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hoàn thành">
              {selectedOrder.actualEnd ? formatDate(selectedOrder.actualEnd) : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí vật tư">
              {selectedOrder.materialCost > 0 ? formatCurrency(selectedOrder.materialCost) : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí nhân công">
              {selectedOrder.laborCost > 0 ? formatCurrency(selectedOrder.laborCost) : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi phí">
              <span style={{ color: colors.navy, fontWeight: 700, fontSize: 15 }}>
                {selectedOrder.actualCost > 0 ? formatCurrency(selectedOrder.actualCost) : '--'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedOrder.notes || '--'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default Handover;
