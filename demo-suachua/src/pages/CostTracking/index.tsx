import React, { useMemo } from 'react';
import { Card, Table, Tag, Row, Col, Space, Statistic, Progress, Typography } from 'antd';
import {
  DollarOutlined,
  ToolOutlined,
  TeamOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { workOrders } from '../../data/workOrders';
import { formatCurrency, workOrderStatusConfig, getProgressColor } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkOrder } from '../../types';

const { Text } = Typography;

const pageStyles = `
  .db-stat-card {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    min-height: 120px;
  }
  .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .db-stat-card:hover .db-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .db-bg-icon {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 64px;
    opacity: 0.1;
    color: #ffffff;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .db-stat-card .db-icon-badge {
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
  .db-stat-card .db-stat-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .db-stat-card .db-stat-unit {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    margin-left: 4px;
  }
  .db-stat-card .db-stat-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 4px;
  }

  .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
  .db-chart-card .ant-card-head {
    border-bottom: 1px solid ${colors.border};
  }
  .db-chart-card .ant-card-head-title {
    font-weight: 600;
    color: ${colors.navy};
  }

  .db-card-title-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-right: 10px;
    color: #ffffff;
  }

  .cost-tracking-page {
    animation: ctFadeIn 0.5s ease-out;
  }
  @keyframes ctFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cost-bar {
    height: 8px;
    border-radius: 4px;
    display: flex;
    overflow: hidden;
    background: #f0f0f0;
  }
  .cost-bar-material {
    background: ${colors.navy};
    transition: width 0.3s;
  }
  .cost-bar-labor {
    background: ${colors.gold};
    transition: width 0.3s;
  }
`;

const CostTracking: React.FC = () => {
  const costStats = useMemo(() => {
    const totalActual = workOrders.reduce((sum, wo) => sum + wo.actualCost, 0);
    const totalMaterial = workOrders.reduce((sum, wo) => sum + wo.materialCost, 0);
    const totalLabor = workOrders.reduce((sum, wo) => sum + wo.laborCost, 0);
    const totalEstimated = workOrders.reduce((sum, wo) => sum + wo.estimatedCost, 0);
    const remaining = totalEstimated - totalActual;
    return { totalActual, totalMaterial, totalLabor, remaining };
  }, []);

  const columns = [
    {
      title: 'Mã lệnh',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => (
        <Text strong style={{ color: colors.navy, fontSize: 13 }}>{text}</Text>
      ),
    },
    {
      title: 'Khí tài',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Dự toán (tr)',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      width: 110,
      align: 'right' as const,
      render: (val: number) => <span>{formatCurrency(val)}</span>,
    },
    {
      title: 'Vật tư (tr)',
      dataIndex: 'materialCost',
      key: 'materialCost',
      width: 110,
      align: 'right' as const,
      render: (val: number) => <span style={{ color: colors.navy }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Nhân công (tr)',
      dataIndex: 'laborCost',
      key: 'laborCost',
      width: 120,
      align: 'right' as const,
      render: (val: number) => <span style={{ color: colors.gold }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Thực tế (tr)',
      dataIndex: 'actualCost',
      key: 'actualCost',
      width: 110,
      align: 'right' as const,
      render: (val: number) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Còn lại (tr)',
      key: 'remaining',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: WorkOrder) => {
        const rem = record.estimatedCost - record.actualCost;
        const isNegative = rem < 0;
        return (
          <span style={{ color: isNegative ? colors.danger : colors.success, fontWeight: 600 }}>
            {isNegative ? '-' : ''}{formatCurrency(Math.abs(rem))}
          </span>
        );
      },
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      width: 160,
      render: (_: unknown, record: WorkOrder) => {
        const pct = record.estimatedCost > 0
          ? Math.round((record.actualCost / record.estimatedCost) * 100)
          : 0;
        return (
          <Progress
            percent={pct}
            size="small"
            strokeColor={getProgressColor(pct > 100 ? 10 : 100 - pct)}
            format={(p) => `${p}%`}
          />
        );
      },
    },
    {
      title: 'Phân bổ chi phí',
      key: 'breakdown',
      width: 180,
      render: (_: unknown, record: WorkOrder) => {
        const total = record.actualCost || 1;
        const matPct = (record.materialCost / total) * 100;
        const labPct = (record.laborCost / total) * 100;
        return (
          <div>
            <div className="cost-bar">
              <div className="cost-bar-material" style={{ width: `${matPct}%` }} />
              <div className="cost-bar-labor" style={{ width: `${labPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
              <span style={{ color: colors.navy }}>VT: {Math.round(matPct)}%</span>
              <span style={{ color: colors.gold }}>NC: {Math.round(labPct)}%</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const cfg = workOrderStatusConfig[status as keyof typeof workOrderStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : status;
      },
    },
  ];

  return (
    <div className="cost-tracking-page">
      <style>{pageStyles}</style>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
          >
            <div className="db-bg-icon"><DollarOutlined /></div>
            <div className="db-icon-badge"><DollarOutlined /></div>
            <div className="db-stat-value">{formatCurrency(costStats.totalActual)}</div>
            <div className="db-stat-label">Tổng chi phí</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, #3d6db5, ${colors.info})` }}
          >
            <div className="db-bg-icon"><ToolOutlined /></div>
            <div className="db-icon-badge"><ToolOutlined /></div>
            <div className="db-stat-value">{formatCurrency(costStats.totalMaterial)}</div>
            <div className="db-stat-label">Chi phí vật tư</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, ${colors.gold}, #c49b38)` }}
          >
            <div className="db-bg-icon"><TeamOutlined /></div>
            <div className="db-icon-badge"><TeamOutlined /></div>
            <div className="db-stat-value">{formatCurrency(costStats.totalLabor)}</div>
            <div className="db-stat-label">Chi phí nhân công</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, #3d9a50, ${colors.success})` }}
          >
            <div className="db-bg-icon"><FundOutlined /></div>
            <div className="db-icon-badge"><FundOutlined /></div>
            <div className="db-stat-value">{formatCurrency(costStats.remaining)}</div>
            <div className="db-stat-label">Dự toán còn lại</div>
          </div>
        </Col>
      </Row>

      {/* Cost Table */}
      <Card
        className="db-chart-card"
        title={
          <Space>
            <span
              className="db-card-title-icon"
              style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
            >
              <DollarOutlined />
            </span>
            <span>Chi phí theo lệnh sửa chữa</span>
          </Space>
        }
      >
        <Table
          dataSource={workOrders}
          columns={columns}
          rowKey="id"
          size="middle"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng: ${total} lệnh` }}
        />
      </Card>
    </div>
  );
};

export default CostTracking;
