import { useMemo } from 'react';
import { Card, Typography, Space, Alert } from 'antd';
import {
  LineChartOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';

import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

const ReportForecast = () => {
  const forecastData = useMemo(() => {
    const months = ['04/2026', '05/2026', '06/2026'];
    const items = [
      { name: 'Bo mạch xử lý P-18', base: 12, delta: [-2, -3, -4], incoming: [0, 4, 0], min: 5 },
      { name: 'Máy phát cao tần 36D6', base: 4, delta: [-1, -1, -1], incoming: [0, 0, 2], min: 2 },
      { name: 'Đầu nối RF N-type', base: 82, delta: [-15, -20, -12], incoming: [30, 0, 0], min: 50 },
      { name: 'Tụ điện CS cao', base: 45, delta: [-8, -10, -7], incoming: [0, 20, 0], min: 20 },
      { name: 'Bộ nguồn AC/DC', base: 15, delta: [-3, -4, -3], incoming: [10, 0, 5], min: 8 },
    ];

    const chartData: { month: string; product: string; qty: number }[] = [];
    items.forEach((item) => {
      let current = item.base;
      months.forEach((month, idx) => {
        current = current + item.delta[idx] + item.incoming[idx];
        chartData.push({ month, product: item.name, qty: Math.max(0, current) });
      });
    });
    return { chartData, items, months };
  }, []);

  const alertItems = forecastData.items.filter((item) => {
    let current = item.base;
    for (let i = 0; i < 3; i++) {
      current = current + item.delta[i] + item.incoming[i];
      if (current < item.min) return true;
    }
    return false;
  });

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
            <LineChartOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Dự báo tồn kho</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Dự báo biến động tồn kho trong 3 tháng tới</Text>
          </div>
        </Space>
      </div>

      {/* Chart */}
      <Card style={{ borderRadius: 14, marginBottom: 16 }} title={
        <Space>
          <LineChartOutlined style={{ color: colors.navy }} />
          <span>Dự báo tồn kho 3 tháng tới</span>
        </Space>
      }>
        <Line
          data={forecastData.chartData}
          xField="month"
          yField="qty"
          seriesField="product"
          height={320}
          point={{ size: 4, shape: 'circle' }}
          legend={{ position: 'top' }}
          smooth
        />
      </Card>

      {/* Alerts */}
      {alertItems.length > 0 && (
        <Card style={{ borderRadius: 14 }} title={
          <Space>
            <WarningOutlined style={{ color: colors.danger }} />
            <span>Cảnh báo dưới mức tối thiểu</span>
          </Space>
        }>
          {alertItems.map((item, idx) => (
            <Alert
              key={idx}
              type="warning"
              showIcon
              style={{ marginBottom: idx < alertItems.length - 1 ? 8 : 0 }}
              message={`${item.name} — dự báo giảm xuống dưới mức tối thiểu (${item.min}) trong 3 tháng tới`}
            />
          ))}
        </Card>
      )}
    </div>
  );
};

export default ReportForecast;
