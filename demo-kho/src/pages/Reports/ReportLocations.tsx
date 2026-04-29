import { useMemo } from 'react';
import { Card, Typography, Table, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EnvironmentOutlined } from '@ant-design/icons';

import { inventoryItems } from '../../data/inventory';
import { warehouses } from '../../data/warehouses';
import { formatNumber } from '../../utils/format';

const { Title, Text } = Typography;

const ReportLocations = () => {
  const data = useMemo(() => {
    return inventoryItems.map((item) => {
      const wh = warehouses.find((w) => w.id === item.warehouseId || w.code === item.warehouseId);
      return {
        key: item.id,
        warehouse: wh?.name || item.warehouseName,
        locationCode: item.locationCode || '-',
        productCode: item.productCode,
        productName: item.productName,
        qty: item.qtyOnHand,
        unit: item.unit,
      };
    });
  }, []);

  const columns: ColumnsType<typeof data[0]> = [
    { title: 'Kho', dataIndex: 'warehouse', key: 'warehouse', width: 200, filters: [...new Set(data.map(d => d.warehouse))].map(v => ({ text: v, value: v })), onFilter: (value, record) => record.warehouse === value },
    { title: 'Vị trí', dataIndex: 'locationCode', key: 'locationCode', width: 120 },
    { title: 'Mã VT', dataIndex: 'productCode', key: 'productCode', width: 130 },
    { title: 'Tên VT', dataIndex: 'productName', key: 'productName', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', width: 100, align: 'right', render: (v: number) => formatNumber(v) },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70 },
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
            <EnvironmentOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Vị trí lưu trữ</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Chi tiết vật tư theo vị trí lưu trữ trong kho</Text>
          </div>
        </Space>
      </div>

      {/* Table */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={data} columns={columns} rowKey="key" size="small" pagination={{ pageSize: 15 }} scroll={{ x: 700 }} />
      </Card>
    </div>
  );
};

export default ReportLocations;
