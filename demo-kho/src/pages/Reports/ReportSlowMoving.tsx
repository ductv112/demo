import { useMemo } from 'react';
import { Row, Col, Card, Typography, Table, Space, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PauseCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { inventoryItems } from '../../data/inventory';
import { formatNumber, formatCurrency, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import StatCard from './StatCard';

const { Title, Text } = Typography;

const ReportSlowMoving = () => {
  const now = dayjs('2026-04-02');
  const THRESHOLD_DAYS = 90;

  const slowItems = useMemo(() => {
    return inventoryItems
      .map((item) => {
        const daysSinceMovement = now.diff(dayjs(item.lastMovementDate), 'day');
        return {
          key: item.id,
          productCode: item.productCode,
          productName: item.productName,
          warehouse: item.warehouseName,
          qty: item.qtyOnHand,
          value: item.totalValue,
          lastMovement: item.lastMovementDate,
          daysSinceMovement,
        };
      })
      .filter((item) => item.daysSinceMovement >= THRESHOLD_DAYS)
      .sort((a, b) => b.daysSinceMovement - a.daysSinceMovement);
  }, []);

  const totalSlowValue = slowItems.reduce((s, i) => s + i.value, 0);

  const columns: ColumnsType<typeof slowItems[0]> = [
    { title: 'Mã VT', dataIndex: 'productCode', key: 'productCode', width: 130 },
    { title: 'Tên VT', dataIndex: 'productName', key: 'productName', ellipsis: true },
    { title: 'Kho', dataIndex: 'warehouse', key: 'warehouse', width: 180 },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', width: 90, align: 'right', render: (v: number) => formatNumber(v) },
    { title: 'Giá trị', dataIndex: 'value', key: 'value', width: 110, align: 'right', render: (v: number) => formatCurrency(v) },
    { title: 'Ngày xuất cuối', dataIndex: 'lastMovement', key: 'lastMovement', width: 120, render: (v: string) => formatDate(v) },
    {
      title: 'Số ngày', dataIndex: 'daysSinceMovement', key: 'daysSinceMovement', width: 100, align: 'right',
      render: (v: number) => <Text style={{ color: v > 180 ? colors.danger : colors.warning, fontWeight: 600 }}>{v}</Text>,
      sorter: (a, b) => a.daysSinceMovement - b.daysSinceMovement,
      defaultSortOrder: 'descend',
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
            <PauseCircleOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Chậm luân chuyển</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Vật tư không phát sinh xuất kho trong thời gian dài</Text>
          </div>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard
            icon={<StopOutlined />}
            label="Mặt hàng chậm luân chuyển"
            value={slowItems.length}
            gradient={`linear-gradient(135deg, ${colors.warning}, #e67e22)`}
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            icon={<ClockCircleOutlined />}
            label="Giá trị tồn đọng"
            value={formatCurrency(totalSlowValue)}
            gradient={`linear-gradient(135deg, ${colors.danger}, #d63031)`}
          />
        </Col>
      </Row>

      {/* Table */}
      {slowItems.length > 0 ? (
        <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
          <Table dataSource={slowItems} columns={columns} rowKey="key" size="small" pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
        </Card>
      ) : (
        <Card style={{ borderRadius: 14 }}>
          <Empty description="Không có vật tư chậm luân chuyển (>90 ngày)" />
        </Card>
      )}
    </div>
  );
};

export default ReportSlowMoving;
