import { useState, useMemo } from 'react';
import { Card, Typography, Table, Tag, Space, Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { inboundOrders } from '../../data/inboundOrders';
import { outboundOrders } from '../../data/outboundOrders';
import { stockTransfers } from '../../data/stockTransfers';
import { formatNumber, formatDate } from '../../utils/format';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportHistory = () => {
  const [filterType, setFilterType] = useState<string>('all');

  const movements = useMemo(() => {
    const rows: {
      key: string; date: string; type: string; code: string;
      warehouse: string; product: string; qty: number; counterparty: string;
    }[] = [];

    inboundOrders.forEach((o) => {
      o.lines.forEach((line, idx) => {
        rows.push({
          key: `in-${o.id}-${idx}`,
          date: o.receivedDate || o.expectedDate,
          type: 'inbound',
          code: o.code,
          warehouse: o.warehouseName,
          product: line.productName,
          qty: line.receivedQty || line.expectedQty,
          counterparty: o.sourceName,
        });
      });
    });

    outboundOrders.forEach((o) => {
      o.lines.forEach((line, idx) => {
        rows.push({
          key: `out-${o.id}-${idx}`,
          date: o.dispatchedDate || o.requestedDate,
          type: 'outbound',
          code: o.code,
          warehouse: o.warehouseName,
          product: line.productName,
          qty: line.pickedQty || line.requestedQty,
          counterparty: o.destinationName,
        });
      });
    });

    stockTransfers.forEach((t) => {
      t.lines.forEach((line, idx) => {
        rows.push({
          key: `tf-${t.id}-${idx}`,
          date: t.shippedAt || t.requestedAt,
          type: 'transfer',
          code: t.code,
          warehouse: `${t.fromWarehouseName} -> ${t.toWarehouseName}`,
          product: line.productName,
          qty: line.qty,
          counterparty: 'Nội bộ',
        });
      });
    });

    rows.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
    return rows;
  }, []);

  const filtered = filterType === 'all' ? movements : movements.filter((m) => m.type === filterType);

  const typeTag = (type: string) => {
    switch (type) {
      case 'inbound': return <Tag color="green">Nhập</Tag>;
      case 'outbound': return <Tag color="red">Xuất</Tag>;
      case 'transfer': return <Tag color="blue">Điều chuyển</Tag>;
      default: return <Tag>{type}</Tag>;
    }
  };

  const columns: ColumnsType<typeof movements[0]> = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', width: 110, render: (v: string) => formatDate(v) },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 110, render: (_, r) => typeTag(r.type) },
    { title: 'Mã phiếu', dataIndex: 'code', key: 'code', width: 140 },
    { title: 'Kho', dataIndex: 'warehouse', key: 'warehouse', width: 200, ellipsis: true },
    { title: 'Vật tư', dataIndex: 'product', key: 'product', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', width: 100, align: 'right', render: (v: number) => formatNumber(v) },
    { title: 'Đối tác', dataIndex: 'counterparty', key: 'counterparty', width: 180, ellipsis: true },
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
            <HistoryOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Lịch sử xuất nhập</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Toàn bộ giao dịch nhập, xuất, điều chuyển vật tư</Text>
          </div>
        </Space>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          value={filterType}
          onChange={setFilterType}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: 'Tất cả loại' },
            { value: 'inbound', label: 'Nhập kho' },
            { value: 'outbound', label: 'Xuất kho' },
            { value: 'transfer', label: 'Điều chuyển' },
          ]}
        />
        <RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
      </Space>

      {/* Table */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="key"
          size="small"
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} dòng` }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default ReportHistory;
