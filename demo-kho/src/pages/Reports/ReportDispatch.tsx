import { useMemo } from 'react';
import { Row, Col, Card, Typography, Table, Space, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TeamOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';

import { outboundOrders } from '../../data/outboundOrders';
import { formatNumber, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

const ReportDispatch = () => {
  const dispatchData = useMemo(() => {
    const rows: {
      key: string; destination: string; code: string; date: string;
      product: string; qty: number; value: number;
    }[] = [];
    outboundOrders
      .filter((o) => o.type === 'dispatch')
      .forEach((o) => {
        o.lines.forEach((line, idx) => {
          rows.push({
            key: `d-${o.id}-${idx}`,
            destination: o.destinationName,
            code: o.code,
            date: o.dispatchedDate || o.requestedDate,
            product: line.productName,
            qty: line.pickedQty || line.requestedQty,
            value: (line.pickedQty || line.requestedQty) * line.unitCost,
          });
        });
      });
    return rows;
  }, []);

  const columns: ColumnsType<typeof dispatchData[0]> = [
    { title: 'Đơn vị nhận', dataIndex: 'destination', key: 'destination', width: 200 },
    { title: 'Mã phiếu', dataIndex: 'code', key: 'code', width: 140 },
    { title: 'Ngày', dataIndex: 'date', key: 'date', width: 110, render: (v: string) => formatDate(v) },
    { title: 'Vật tư', dataIndex: 'product', key: 'product', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', width: 100, align: 'right', render: (v: number) => formatNumber(v) },
    {
      title: 'Giá trị', dataIndex: 'value', key: 'value', width: 130, align: 'right',
      render: (v: number) => v > 1_000_000 ? `${(v / 1_000_000).toFixed(1)} tr` : formatNumber(v),
    },
  ];

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    dispatchData.forEach((d) => {
      map.set(d.destination, (map.get(d.destination) || 0) + d.qty);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [dispatchData]);

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
            <TeamOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Cấp phát vật tư</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Theo dõi vật tư đã cấp phát theo đơn vị nhận</Text>
          </div>
        </Space>
      </div>

      {/* Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={dispatchData}
              columns={columns}
              rowKey="key"
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 14 }} title="Phân bổ theo đơn vị">
            {pieData.length > 0 ? (
              <Pie
                data={pieData}
                angleField="value"
                colorField="name"
                radius={0.85}
                innerRadius={0.55}
                height={260}
                label={{ type: 'outer', content: '{name}: {value}' }}
                legend={{ position: 'bottom' }}
              />
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportDispatch;
