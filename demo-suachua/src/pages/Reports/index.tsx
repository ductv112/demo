import React from 'react';
import { Card, Row, Col, List, Button, Typography, Space, message } from 'antd';
import {
  BarChartOutlined,
  FileTextOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';

const { Text } = Typography;

const pageStyles = `
  .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
  .db-chart-card .ant-card-head {
    border-bottom: 1px solid ${colors.border};
  }
  .db-chart-card .ant-card-head-title {
    font-weight: 600;
    color: ${colors.navy};
  }

  .db-card-title-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-right: 10px;
    color: #ffffff;
  }

  .reports-page {
    animation: rpFadeIn 0.5s ease-out;
  }
  @keyframes rpFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .report-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
  }
  .report-item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }
  .report-item-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #ffffff;
    flex-shrink: 0;
  }
  .report-item-name {
    font-size: 13px;
    color: ${colors.navyDark};
    font-weight: 500;
  }
`;

interface ReportGroup {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  reports: string[];
}

const reportGroups: ReportGroup[] = [
  {
    title: 'Tiến độ & Trạng thái',
    icon: <BarChartOutlined />,
    gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
    reports: [
      'BC tiến độ sửa chữa',
      'BC trạng thái lệnh sửa chữa',
      'BC thời gian thực hiện sửa chữa',
      'BC chậm tiến độ',
    ],
  },
  {
    title: 'Tiếp nhận & Phân loại',
    icon: <FileTextOutlined />,
    gradient: `linear-gradient(135deg, ${colors.info}, #3d6db5)`,
    reports: [
      'BC tiếp nhận sửa chữa',
      'BC phân loại sửa chữa',
      'BC kết quả chẩn đoán sự cố',
      'BC phương án xử lý',
    ],
  },
  {
    title: 'Thực hiện',
    icon: <ToolOutlined />,
    gradient: `linear-gradient(135deg, ${colors.gold}, #c49b38)`,
    reports: [
      'BC công việc sửa chữa đã thực hiện',
      'BC vật tư sử dụng',
      'BC tiêu hao vật tư',
      'BC linh kiện thay thế',
    ],
  },
  {
    title: 'Kiểm tra & Nghiệm thu',
    icon: <SafetyCertificateOutlined />,
    gradient: `linear-gradient(135deg, #3d9a50, ${colors.success})`,
    reports: [
      'BC kết quả kiểm tra sau sửa chữa',
      'BC kết quả thử nghiệm sau sửa chữa',
      'BC nghiệm thu sửa chữa',
      'BC thiết bị không đạt',
    ],
  },
  {
    title: 'Chi phí',
    icon: <DollarOutlined />,
    gradient: `linear-gradient(135deg, #d94444, ${colors.danger})`,
    reports: [
      'BC chi phí sửa chữa theo thiết bị',
      'BC chi phí vật tư sửa chữa',
      'BC chi phí nhân công sửa chữa',
    ],
  },
  {
    title: 'Lịch sử & Hiệu quả',
    icon: <HistoryOutlined />,
    gradient: `linear-gradient(135deg, #7b61a6, #9b59b6)`,
    reports: [
      'BC lịch sử sửa chữa thiết bị',
      'BC tần suất hỏng theo thiết bị',
      'BC lỗi lặp lại sau sửa chữa',
      'BC hiệu quả sửa chữa',
      'BC tỷ lệ sửa chữa thành công lần đầu',
    ],
  },
];

const Reports: React.FC = () => {
  const handleViewReport = (reportName: string) => {
    message.info(`Đang mở: ${reportName} (bản demo)`);
  };

  return (
    <div className="reports-page">
      <style>{pageStyles}</style>

      <div style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 15, color: colors.navy, fontWeight: 600 }}>
          Hệ thống báo cáo sửa chữa
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 12 }}>
          24 báo cáo / 6 nhóm
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {reportGroups.map((group, index) => (
          <Col xs={24} lg={12} key={index}>
            <Card
              className="db-chart-card"
              title={
                <Space>
                  <span
                    className="db-card-title-icon"
                    style={{ background: group.gradient }}
                  >
                    {group.icon}
                  </span>
                  <span>{group.title}</span>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                    ({group.reports.length} báo cáo)
                  </Text>
                </Space>
              }
            >
              <List
                dataSource={group.reports}
                split
                renderItem={(reportName) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div className="report-item" style={{ width: '100%' }}>
                      <div className="report-item-left">
                        <div className="report-item-icon" style={{ background: group.gradient }}>
                          <FileTextOutlined />
                        </div>
                        <span className="report-item-name">{reportName}</span>
                      </div>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleViewReport(reportName)}
                        style={{ color: colors.navy, fontWeight: 500 }}
                      >
                        Xem
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Reports;
