import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Space, List, Divider, Select, DatePicker } from 'antd';
import {
  BarChartOutlined, FileTextOutlined, ToolOutlined, AuditOutlined, SafetyCertificateOutlined,
  DollarOutlined, TeamOutlined, DownloadOutlined, EyeOutlined, SettingOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { overhaulOrders } from '../../data/overhaulOrders';
import { restorations } from '../../data/restorations';
import { colors } from '../../theme/themeConfig';
import { formatCurrency } from '../../utils/format';

const { Title, Text } = Typography;

const reportGroups = [
  {
    group: 'Báo cáo tổng hợp',
    icon: <BarChartOutlined />,
    color: colors.navy,
    reports: [
      { id: 'R01', name: 'Tổng hợp tình hình đại tu theo kỳ', type: 'Định kỳ', format: 'PDF/Excel' },
      { id: 'R02', name: 'Tình hình thực hiện so với kế hoạch', type: 'Định kỳ', format: 'PDF' },
      { id: 'R03', name: 'Báo cáo tiến độ theo phân xưởng', type: 'Định kỳ', format: 'Excel' },
      { id: 'R04', name: 'Tổng hợp chi phí đại tu thực tế', type: 'Tài chính', format: 'PDF/Excel' },
    ],
  },
  {
    group: 'Báo cáo quy trình kỹ thuật',
    icon: <ToolOutlined />,
    color: '#0891b2',
    reports: [
      { id: 'R05', name: 'Kết quả tháo rã và phân loại cấu phần', type: 'Kỹ thuật', format: 'PDF' },
      { id: 'R06', name: 'Tổng hợp kết quả kiểm tra kỹ thuật', type: 'Kỹ thuật', format: 'PDF/Excel' },
      { id: 'R07', name: 'Tỷ lệ cấu phần: Giữ lại / Phục hồi / Thay mới', type: 'Phân tích', format: 'PDF' },
      { id: 'R08', name: 'Hồ sơ kỹ thuật công đoạn lắp ráp', type: 'Kỹ thuật', format: 'PDF' },
      { id: 'R09', name: 'Biên bản thử nghiệm và nghiệm thu', type: 'Kỹ thuật', format: 'PDF' },
    ],
  },
  {
    group: 'Báo cáo chất lượng & nghiệm thu',
    icon: <SafetyCertificateOutlined />,
    color: '#16a34a',
    reports: [
      { id: 'R10', name: 'Kết quả nghiệm thu theo tiêu chuẩn kỹ thuật quân sự', type: 'Nghiệm thu', format: 'PDF' },
      { id: 'R11', name: 'Thống kê lỗi và không phù hợp', type: 'Chất lượng', format: 'Excel' },
      { id: 'R12', name: 'Theo dõi hành động khắc phục phòng ngừa', type: 'Chất lượng', format: 'PDF' },
      { id: 'R13', name: 'Phân tích nguyên nhân cấu phần hư hỏng', type: 'Phân tích', format: 'PDF' },
      { id: 'R14', name: 'Tỷ lệ đạt / không đạt qua các lần thử', type: 'Phân tích', format: 'Excel' },
    ],
  },
  {
    group: 'Báo cáo vật tư & chi phí',
    icon: <DollarOutlined />,
    color: '#d97706',
    reports: [
      { id: 'R15', name: 'Kế hoạch và thực tế sử dụng vật tư', type: 'Vật tư', format: 'Excel' },
      { id: 'R16', name: 'Chi phí phân bổ theo lệnh đại tu', type: 'Tài chính', format: 'PDF/Excel' },
      { id: 'R17', name: 'So sánh chi phí đại tu và thay mới', type: 'Phân tích', format: 'PDF' },
      { id: 'R18', name: 'Tổng hợp chi phí vật tư theo nguồn cung cấp', type: 'Tài chính', format: 'Excel' },
    ],
  },
  {
    group: 'Báo cáo nhân lực',
    icon: <TeamOutlined />,
    color: '#7c3aed',
    reports: [
      { id: 'R19', name: 'Phân bổ nhân lực theo công đoạn', type: 'Nhân lực', format: 'Excel' },
      { id: 'R20', name: 'Năng suất lao động kỹ thuật', type: 'Phân tích', format: 'PDF' },
      { id: 'R21', name: 'Thống kê chứng chỉ và năng lực KTV', type: 'Nhân lực', format: 'Excel' },
    ],
  },
  {
    group: 'Báo cáo truy vết & lịch sử',
    icon: <AuditOutlined />,
    color: '#059669',
    reports: [
      { id: 'R22', name: 'Lịch sử đại tu theo thiết bị', type: 'Truy vết', format: 'PDF' },
      { id: 'R23', name: 'Hồ sơ cấu hình sau đại tu', type: 'Truy vết', format: 'PDF' },
      { id: 'R24', name: 'Thống kê số lần đại tu theo loại khí tài', type: 'Thống kê', format: 'Excel' },
      { id: 'R25', name: 'Danh sách thiết bị đã bàn giao', type: 'Bàn giao', format: 'PDF' },
    ],
  },
  {
    group: 'Báo cáo phân tích chiến lược',
    icon: <SettingOutlined />,
    color: '#dc2626',
    reports: [
      { id: 'R26', name: 'Phân tích độ tin cậy thiết bị sau đại tu', type: 'Phân tích', format: 'PDF' },
      { id: 'R27', name: 'Dự báo nhu cầu đại tu kỳ tiếp theo', type: 'Dự báo', format: 'PDF' },
      { id: 'R28', name: 'Đánh giá hiệu quả chiến lược đại tu', type: 'Phân tích', format: 'PDF' },
      { id: 'R29', name: 'Phân tích xu hướng hư hỏng theo loại cấu phần', type: 'Phân tích', format: 'Excel' },
      { id: 'R30', name: 'Tổng kết năm và đề xuất cải tiến', type: 'Định kỳ', format: 'PDF' },
    ],
  },
];

const workshopData = [
  { workshop: 'PX1 - Radar', value: overhaulOrders.filter(o => o.workshopId === 'PX1').length },
  { workshop: 'PX2 - Tên lửa', value: overhaulOrders.filter(o => o.workshopId === 'PX2').length },
  { workshop: 'PX3 - Cơ khí', value: overhaulOrders.filter(o => o.workshopId === 'PX3').length },
];

const statusChartData = [
  { status: 'Đang thực hiện', count: overhaulOrders.filter(o => o.status === 'in_progress').length },
  { status: 'Hoàn thành', count: overhaulOrders.filter(o => o.status === 'completed').length },
  { status: 'Đã đóng', count: overhaulOrders.filter(o => o.status === 'closed').length },
  { status: 'Chờ duyệt', count: overhaulOrders.filter(o => o.status === 'pending_approval').length },
  { status: 'Đã duyệt', count: overhaulOrders.filter(o => o.status === 'approved').length },
].filter(d => d.count > 0);

const totalCost = restorations.reduce((sum, r) => sum + (r.cost || 0), 0);

const Reports: React.FC = () => {
  const [period, setPeriod] = useState('2026');

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChartOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Báo cáo & Thống kê</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Hệ thống báo cáo tổng hợp và phân tích đại tu</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Select value={period} onChange={setPeriod} style={{ width: 120 }}
                options={[{ value: '2024', label: 'Năm 2024' }, { value: '2025', label: 'Năm 2025' }, { value: '2026', label: 'Năm 2026' }]}
              />
            </Col>
          </Row>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 12 }} title={<Space><BarChartOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy }}>Lệnh đại tu theo phân xưởng</Text></Space>}>
            <Column data={workshopData} xField="workshop" yField="value" color={colors.navy}
              columnWidthRatio={0.5}
              label={{ position: 'top', style: { fill: colors.navy, fontWeight: 600 } }}
              yAxis={{ title: { text: 'Số lệnh', style: { fill: '#999' } } }}
              xAxis={{ label: { style: { fill: '#555', fontSize: 12 } } }}
              height={200}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 12 }} title={<Space><FileTextOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy }}>Phân bổ trạng thái lệnh</Text></Space>}>
            <Pie data={statusChartData} angleField="count" colorField="status"
              color={['#1B3A5C', '#52c41a', '#aaa', '#faad14', '#1890ff']}
              radius={0.8} innerRadius={0.5}
              label={{ type: 'inner', offset: '-30%', content: '{value}', style: { fill: '#fff', fontWeight: 600, fontSize: 13 } }}
              legend={{ position: 'bottom', flipPage: false }}
              height={200}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng lệnh đại tu', value: overhaulOrders.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <FileTextOutlined /> },
          { label: 'Đang thực hiện', value: overhaulOrders.filter(o => o.status === 'in_progress').length, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ToolOutlined /> },
          { label: 'Hoàn thành/Bàn giao', value: overhaulOrders.filter(o => ['completed', 'closed'].includes(o.status)).length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <CheckCircleOutlined /> },
          { label: 'Tổng chi phí phục hồi', value: formatCurrency(totalCost), gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <DollarOutlined /> },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14, height: 110 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.label}</Text>
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {reportGroups.map((group) => (
        <Card key={group.group} style={{ borderRadius: 12, marginBottom: 16 }}
          title={
            <Space>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: group.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>{group.icon}</div>
              <Text strong style={{ color: group.color }}>{group.group}</Text>
              <Tag>{group.reports.length} báo cáo</Tag>
            </Space>
          }
        >
          <List dataSource={group.reports} renderItem={(report, i) => (
            <List.Item
              key={report.id}
              style={{ padding: '10px 0', borderBottom: i < group.reports.length - 1 ? '1px solid #f5f5f5' : 'none' }}
              actions={[
                <Button key="view" type="text" icon={<EyeOutlined />} size="small">Xem mẫu</Button>,
                <Button key="export" type="primary" icon={<DownloadOutlined />} size="small" style={{ background: group.color, borderColor: group.color }}>Xuất</Button>,
              ]}
            >
              <Space size={8}>
                <Text strong style={{ color: group.color, fontSize: 11, minWidth: 45 }}>{report.id}</Text>
                <Text style={{ fontSize: 13 }}>{report.name}</Text>
                <Tag color="default" style={{ fontSize: 11 }}>{report.type}</Tag>
                <Tag color="blue" style={{ fontSize: 11 }}>{report.format}</Tag>
              </Space>
            </List.Item>
          )} />
        </Card>
      ))}
    </div>
  );
};

export default Reports;
