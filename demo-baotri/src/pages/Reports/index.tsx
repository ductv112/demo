import React from 'react';
import {
  Card,
  Row,
  Col,
  Breadcrumb,
  Typography,
  Button,
} from 'antd';
import {
  CalendarOutlined,
  HistoryOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  LineChartOutlined,
  SwapOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  RiseOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ReportCategory {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const reportCategories: ReportCategory[] = [
  {
    key: 'plan_execution',
    icon: <CalendarOutlined />,
    title: 'KH & thực hiện BT',
    description: 'Báo cáo kế hoạch và tiến độ thực hiện bảo trì theo kỳ',
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    key: 'equipment_history',
    icon: <HistoryOutlined />,
    title: 'Lịch sử BT theo thiết bị',
    description: 'Tra cứu toàn bộ lịch sử bảo trì của từng thiết bị',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
  },
  {
    key: 'incident_repair',
    icon: <ToolOutlined />,
    title: 'Sự cố & sửa chữa',
    description: 'Thống kê sự cố và kết quả sửa chữa nhỏ',
    gradient: 'linear-gradient(135deg, #ff7a45, #ffa940)',
  },
  {
    key: 'downtime',
    icon: <ClockCircleOutlined />,
    title: 'Thời gian dừng TB',
    description: 'Phân tích thời gian dừng hoạt động của thiết bị',
    gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
  },
  {
    key: 'performance',
    icon: <DashboardOutlined />,
    title: 'Hiệu suất TB - MTBF/MTTR',
    description: 'Chỉ số MTBF, MTTR, khả dụng của thiết bị',
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    key: 'cost',
    icon: <DollarOutlined />,
    title: 'Chi phí BT',
    description: 'Tổng hợp chi phí bảo trì theo thiết bị, đội, thời gian',
    gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
  },
  {
    key: 'spare_part_consumption',
    icon: <ExperimentOutlined />,
    title: 'Tiêu hao vật tư',
    description: 'Thống kê vật tư phụ tùng đã sử dụng cho bảo trì',
    gradient: 'linear-gradient(135deg, #722ed1, #b37feb)',
  },
  {
    key: 'spare_part_inventory',
    icon: <DatabaseOutlined />,
    title: 'Tồn kho vật tư',
    description: 'Tình trạng tồn kho vật tư phụ tùng bảo trì',
    gradient: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
  },
  {
    key: 'team_productivity',
    icon: <TeamOutlined />,
    title: 'Năng suất đội BT',
    description: 'Đánh giá năng suất và hiệu quả của các đội bảo trì',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
  },
  {
    key: 'staff_assignment',
    icon: <UserOutlined />,
    title: 'Phân công nhân sự',
    description: 'Báo cáo phân công và tải trọng công việc nhân sự',
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    key: 'compliance',
    icon: <CheckCircleOutlined />,
    title: 'Tuân thủ KH BT',
    description: 'Mức độ tuân thủ kế hoạch bảo trì định kỳ',
    gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
  },
  {
    key: 'alerts',
    icon: <AlertOutlined />,
    title: 'Cảnh báo & bất thường',
    description: 'Tổng hợp cảnh báo và sự kiện bất thường từ thiết bị',
    gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
  },
  {
    key: 'failure_trend',
    icon: <LineChartOutlined />,
    title: 'Xu hướng hỏng hóc',
    description: 'Phân tích xu hướng hỏng hóc theo thời gian và thiết bị',
    gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
  },
  {
    key: 'equipment_comparison',
    icon: <SwapOutlined />,
    title: 'So sánh giữa TB',
    description: 'So sánh hiệu suất, chi phí, độ tin cậy giữa các thiết bị',
    gradient: 'linear-gradient(135deg, #722ed1, #b37feb)',
  },
  {
    key: 'team_comparison',
    icon: <BarChartOutlined />,
    title: 'So sánh giữa đội',
    description: 'So sánh năng suất và chất lượng giữa các đội bảo trì',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
  },
  {
    key: 'quality',
    icon: <SafetyCertificateOutlined />,
    title: 'Chất lượng BT',
    description: 'Đánh giá chất lượng công tác bảo trì theo tiêu chuẩn',
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    key: 'improvement',
    icon: <RiseOutlined />,
    title: 'Hiệu quả cải tiến',
    description: 'Theo dõi hiệu quả các biện pháp cải tiến đã áp dụng',
    gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
  },
  {
    key: 'dashboard',
    icon: <AppstoreOutlined />,
    title: 'Dashboard tổng hợp',
    description: 'Tổng quan toàn bộ hoạt động bảo trì trên một màn hình',
    gradient: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
  },
];

const ReportsPage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Báo cáo bảo trì' },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}
          >
            <FileTextOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              Báo cáo bảo trì
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hệ thống báo cáo phân tích hoạt động bảo trì - Doanh nghiệp A
            </Text>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {reportCategories.map((report, idx) => (
          <Col xs={24} sm={12} lg={8} key={report.key}>
            <Card
              className={`animate-fade-in animate-delay-${(idx % 6) + 1}`}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              hoverable
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: report.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {report.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 14, color: '#1B3A5C', display: 'block', marginBottom: 4 }}>
                    {report.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, lineHeight: 1.5 }}>
                    {report.description}
                  </Text>
                  <Button
                    type="primary"
                    size="small"
                    style={{
                      background: '#1B3A5C',
                      borderColor: '#1B3A5C',
                      fontSize: 12,
                    }}
                  >
                    Xem báo cáo
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ReportsPage;
