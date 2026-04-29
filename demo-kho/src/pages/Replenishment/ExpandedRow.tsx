import React from 'react';
import { Table, Tag, Typography, Descriptions, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Replenishment, ReplenishmentLine, ReplenishmentAction } from '../../types';
import { formatNumber, formatDate } from '../../utils/format';

const { Text } = Typography;

const actionLabels: Record<ReplenishmentAction, { label: string; color: string }> = {
  purchase: { label: 'Mua sắm', color: '#1B3A5C' },
  produce:  { label: 'Sản xuất', color: '#531dab' },
  transfer: { label: 'Điều chuyển', color: '#08979c' },
};

const purposeLabels: Record<string, string> = {
  issue:      'Cấp phát vật tư',
  production: 'Sản xuất nội bộ',
  repair:     'Sửa chữa khẩn cấp',
  internal:   'Sử dụng nội bộ',
};

const lineColumns: ColumnsType<ReplenishmentLine> = [
  {
    title: 'Vật tư', key: 'product', width: 250,
    render: (_: unknown, line: ReplenishmentLine) => (
      <Space direction="vertical" size={0}>
        <Text style={{ fontSize: 13, fontWeight: 500 }}>{line.productName}</Text>
        <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{line.productCode}</Text>
      </Space>
    ),
  },
  {
    title: 'Tồn hiện tại', dataIndex: 'currentStock', key: 'currentStock', width: 110, align: 'right',
    render: (val: number, line: ReplenishmentLine) => (
      <Text style={{ fontSize: 13, fontWeight: 600, color: val <= line.minStock ? '#ff4d4f' : val <= line.minStock * 1.5 ? '#faad14' : '#52c41a' }}>
        {formatNumber(val)} {line.unit}
      </Text>
    ),
  },
  { title: 'Tối thiểu', dataIndex: 'minStock', key: 'minStock', width: 80, align: 'right',
    render: (val: number) => <Text style={{ fontSize: 13 }}>{formatNumber(val)}</Text> },
  { title: 'Tối đa', dataIndex: 'maxStock', key: 'maxStock', width: 80, align: 'right',
    render: (val: number) => <Text style={{ fontSize: 13 }}>{formatNumber(val)}</Text> },
  { title: 'Nhu cầu', dataIndex: 'forecastDemand', key: 'forecastDemand', width: 80, align: 'right',
    render: (val: number) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{formatNumber(val)}</Text> },
  {
    title: 'SL đề xuất', dataIndex: 'suggestedQty', key: 'suggestedQty', width: 90, align: 'right',
    render: (val: number) => <Text style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>{formatNumber(val)}</Text>,
  },
  {
    title: 'SL duyệt', dataIndex: 'approvedQty', key: 'approvedQty', width: 80, align: 'right',
    render: (val: number | undefined) => val !== undefined
      ? <Text style={{ fontSize: 13, fontWeight: 600, color: '#52c41a' }}>{formatNumber(val)}</Text>
      : <Text type="secondary" style={{ fontSize: 12 }}>--</Text>,
  },
  {
    title: 'Đã dự trữ', dataIndex: 'reservedQty', key: 'reservedQty', width: 90, align: 'right',
    render: (val: number | undefined) => val && val > 0
      ? <Tag color="success" style={{ borderRadius: 4, fontSize: 12, margin: 0 }}>{formatNumber(val)}</Tag>
      : <Text type="secondary" style={{ fontSize: 12 }}>--</Text>,
  },
  {
    title: 'Hành động', dataIndex: 'action', key: 'action', width: 110,
    render: (action: ReplenishmentAction) => {
      const cfg = actionLabels[action];
      return <Tag color={cfg.color} style={{ borderRadius: 4, fontSize: 12 }}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'TG cung ứng', dataIndex: 'leadTimeDays', key: 'leadTimeDays', width: 90, align: 'right',
    render: (val: number) => <Text style={{ fontSize: 13 }}>{val} ngày</Text>,
  },
  {
    title: 'Ngày cần', dataIndex: 'neededByDate', key: 'neededByDate', width: 110,
    render: (date: string) => <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>,
  },
];

export const expandedRowRender = (record: Replenishment): React.ReactNode => (
  <div style={{ padding: '8px 0' }}>
    {record.source === 'demand' && (record.requestedUnit || record.demandRef) && (
      <div style={{ marginBottom: 8, padding: '8px 12px', background: '#f0f4fa', borderRadius: 8, border: '1px solid #dde6f5' }}>
        <Descriptions size="small" column={4}>
          <Descriptions.Item label="Đơn vị yêu cầu">
            <Text style={{ fontWeight: 600, color: '#1B3A5C' }}>{record.requestedUnit || '--'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mục đích">
            <Text style={{ fontWeight: 500 }}>{record.purpose ? purposeLabels[record.purpose] : '--'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã tham chiếu nhu cầu">
            <Text style={{ fontFamily: 'monospace', color: '#531dab', fontWeight: 600 }}>{record.demandRef || '--'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Người yêu cầu">
            <Text>{record.requestedBy || '--'}</Text>
          </Descriptions.Item>
        </Descriptions>
      </div>
    )}
    <Table
      columns={lineColumns}
      dataSource={record.lines}
      rowKey="id"
      pagination={false}
      size="small"
      bordered
      style={{ background: '#fafbfc' }}
    />
    {record.note && (
      <div style={{ marginTop: 8, padding: '8px 12px', background: '#f5f7fa', borderRadius: 6, fontSize: 13 }}>
        <Text type="secondary" style={{ fontWeight: 500 }}>Ghi chú: </Text>
        <Text style={{ fontSize: 13 }}>{record.note}</Text>
      </div>
    )}
  </div>
);
