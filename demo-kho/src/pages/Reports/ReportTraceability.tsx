import { useState, useMemo } from 'react';
import { Card, Typography, Space, Select, Timeline, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { inventoryItems } from '../../data/inventory';
import { inboundOrders } from '../../data/inboundOrders';
import { outboundOrders } from '../../data/outboundOrders';
import { stockTransfers } from '../../data/stockTransfers';
import { formatDate } from '../../utils/format';

const { Title, Text } = Typography;

const ReportTraceability = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const productOptions = useMemo(() => {
    const unique = new Map<string, string>();
    inventoryItems.forEach((item) => unique.set(item.productCode, item.productName));
    return Array.from(unique.entries()).map(([code, name]) => ({ value: code, label: `${code} — ${name}` }));
  }, []);

  const timeline = useMemo(() => {
    if (!selectedProduct) return [];
    const events: { date: string; label: string; color: string; description: string }[] = [];

    inboundOrders.forEach((o) => {
      o.lines.forEach((line) => {
        if (line.productCode === selectedProduct) {
          events.push({
            date: o.receivedDate || o.expectedDate,
            label: `Nhập kho — ${o.code}`,
            color: 'green',
            description: `SL: ${line.receivedQty || line.expectedQty} | Từ: ${o.sourceName} | Kho: ${o.warehouseName}`,
          });
        }
      });
    });

    outboundOrders.forEach((o) => {
      o.lines.forEach((line) => {
        if (line.productCode === selectedProduct) {
          events.push({
            date: o.dispatchedDate || o.requestedDate,
            label: `Xuất kho — ${o.code}`,
            color: 'red',
            description: `SL: ${line.pickedQty || line.requestedQty} | Đến: ${o.destinationName} | Kho: ${o.warehouseName}`,
          });
        }
      });
    });

    stockTransfers.forEach((t) => {
      t.lines.forEach((line) => {
        if (line.productCode === selectedProduct) {
          events.push({
            date: t.shippedAt || t.requestedAt,
            label: `Điều chuyển — ${t.code}`,
            color: 'blue',
            description: `SL: ${line.qty} | ${t.fromWarehouseName} -> ${t.toWarehouseName}`,
          });
        }
      });
    });

    events.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
    return events;
  }, [selectedProduct]);

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
            <SearchOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Truy vết vật tư</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Truy xuất nguồn gốc và vòng đời vật tư theo lô/serial</Text>
          </div>
        </Space>
      </div>

      {/* Product selector */}
      <Card style={{ borderRadius: 14, marginBottom: 16 }}>
        <Space wrap>
          <Select
            showSearch
            style={{ width: 400 }}
            placeholder="Chọn mã vật tư"
            options={productOptions}
            value={selectedProduct}
            onChange={setSelectedProduct}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Space>
      </Card>

      {/* Timeline */}
      {selectedProduct && timeline.length > 0 ? (
        <Card style={{ borderRadius: 14 }} title={`Lịch sử vận chuyển — ${selectedProduct}`}>
          <Timeline
            items={timeline.map((ev) => ({
              color: ev.color,
              children: (
                <div>
                  <Text strong>{ev.label}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(ev.date)}</Text>
                  <br />
                  <Text style={{ fontSize: 13 }}>{ev.description}</Text>
                </div>
              ),
            }))}
          />
        </Card>
      ) : selectedProduct ? (
        <Card style={{ borderRadius: 14 }}><Empty description="Không tìm thấy lịch sử vận chuyển" /></Card>
      ) : null}
    </div>
  );
};

export default ReportTraceability;
