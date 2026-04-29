import { useMemo } from 'react';
import { Card, Typography, Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import dayjs from 'dayjs';

import { inventoryItems } from '../../data/inventory';
import { formatNumber, formatCurrency, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

const ReportAging = () => {
  const now = dayjs('2026-04-02');

  const agingData = useMemo(() => {
    const brackets = [
      { label: '0-30 ngày', min: 0, max: 30, items: [] as typeof inventoryItems },
      { label: '31-90 ngày', min: 31, max: 90, items: [] as typeof inventoryItems },
      { label: '91-180 ngày', min: 91, max: 180, items: [] as typeof inventoryItems },
      { label: '180+ ngày', min: 181, max: 99999, items: [] as typeof inventoryItems },
    ];

    inventoryItems.forEach((item) => {
      const age = now.diff(dayjs(item.receivedDate), 'day');
      const bracket = brackets.find((b) => age >= b.min && age <= b.max);
      if (bracket) bracket.items.push(item);
    });

    return brackets;
  }, []);

  const chartData = agingData.map((b) => ({
    bracket: b.label,
    quantity: b.items.reduce((s, i) => s + i.qtyOnHand, 0),
    value: b.items.reduce((s, i) => s + i.totalValue, 0),
  }));

  const tableData = inventoryItems.map((item) => ({
    key: item.id,
    productCode: item.productCode,
    productName: item.productName,
    warehouse: item.warehouseName,
    qty: item.qtyOnHand,
    value: item.totalValue,
    receivedDate: item.receivedDate,
    age: now.diff(dayjs(item.receivedDate), 'day'),
  })).sort((a, b) => b.age - a.age);

  const ageBracketTag = (age: number) => {
    if (age <= 30) return <Tag color="green">0-30</Tag>;
    if (age <= 90) return <Tag color="blue">31-90</Tag>;
    if (age <= 180) return <Tag color="orange">91-180</Tag>;
    return <Tag color="red">180+</Tag>;
  };

  const columns: ColumnsType<typeof tableData[0]> = [
    { title: 'Mã VT', dataIndex: 'productCode', key: 'productCode', width: 130 },
    { title: 'Tên VT', dataIndex: 'productName', key: 'productName', ellipsis: true },
    { title: 'Kho', dataIndex: 'warehouse', key: 'warehouse', width: 180 },
    { title: 'SL', dataIndex: 'qty', key: 'qty', width: 80, align: 'right', render: (v: number) => formatNumber(v) },
    { title: 'Giá trị', dataIndex: 'value', key: 'value', width: 110, align: 'right', render: (v: number) => formatCurrency(v) },
    { title: 'Ngày nhập', dataIndex: 'receivedDate', key: 'receivedDate', width: 110, render: (v: string) => formatDate(v) },
    {
      title: 'Tuổi (ngày)', dataIndex: 'age', key: 'age', width: 110, align: 'right',
      render: (v: number) => <Space>{ageBracketTag(v)} {v}</Space>,
      sorter: (a, b) => a.age - b.age,
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
            <FieldTimeOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Tuổi tồn kho</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Phân tích thời gian lưu kho của vật tư</Text>
          </div>
        </Space>
      </div>

      {/* Chart */}
      <Card style={{ borderRadius: 14, marginBottom: 16 }} title="Phân bổ theo độ tuổi tồn kho">
        <Column
          data={chartData}
          xField="bracket"
          yField="quantity"
          height={260}
          color={[colors.success, colors.info, colors.warning, colors.danger]}
          label={{ position: 'top' }}
          columnStyle={{ radius: [6, 6, 0, 0] }}
        />
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ReportAging;
