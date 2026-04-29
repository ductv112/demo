import { useMemo } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReconciliationOutlined,
  AuditOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import { stockCounts } from '../../data/stockCounts';
import { formatDate, stockCountStatusConfig, adjustmentTypeConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import StatCard from './StatCard';

const { Title, Text } = Typography;

const ReportStockCount = () => {
  const data = useMemo(() => {
    return stockCounts.map((sc) => ({
      key: sc.id,
      code: sc.code,
      warehouse: sc.warehouseName,
      type: sc.type,
      scheduledDate: sc.scheduledDate,
      totalItems: sc.totalItems,
      totalDifference: sc.totalDifference,
      status: sc.status,
    }));
  }, []);

  const totalDiff = data.reduce((s, d) => s + Math.abs(d.totalDifference), 0);
  const completedCount = data.filter((d) => d.status === 'done').length;

  const columns: ColumnsType<typeof data[0]> = [
    { title: 'Đợt kiểm kê', dataIndex: 'code', key: 'code', width: 140 },
    { title: 'Kho', dataIndex: 'warehouse', key: 'warehouse', width: 200 },
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 110,
      render: (v: string) => {
        const cfg = adjustmentTypeConfig[v as keyof typeof adjustmentTypeConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : v;
      },
    },
    { title: 'Ngày', dataIndex: 'scheduledDate', key: 'scheduledDate', width: 110, render: (v: string) => formatDate(v) },
    { title: 'Số mặt hàng', dataIndex: 'totalItems', key: 'totalItems', width: 100, align: 'right' },
    {
      title: 'Tổng chênh lệch', dataIndex: 'totalDifference', key: 'totalDifference', width: 130, align: 'right',
      render: (v: number) => (
        <Text style={{ color: v === 0 ? colors.success : colors.danger, fontWeight: 600 }}>
          {v > 0 ? '+' : ''}{v}
        </Text>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (v: string) => {
        const cfg = stockCountStatusConfig[v as keyof typeof stockCountStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : v;
      },
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size={16}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ReconciliationOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Kiểm kê</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Kết quả kiểm kê và chênh lệch tồn kho</Text>
          </div>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard
            icon={<AuditOutlined />}
            label="Tổng đợt kiểm kê"
            value={data.length}
            gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`}
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            icon={<AuditOutlined />}
            label="Đã hoàn thành"
            value={completedCount}
            gradient={`linear-gradient(135deg, ${colors.success}, #3ea812)`}
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            icon={<WarningOutlined />}
            label="Tổng chênh lệch tuyệt đối"
            value={totalDiff}
            gradient={`linear-gradient(135deg, ${colors.danger}, #d63031)`}
          />
        </Col>
      </Row>

      {/* Table */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={data} columns={columns} rowKey="key" size="small" pagination={false} scroll={{ x: 800 }} />
      </Card>
    </div>
  );
};

export default ReportStockCount;
