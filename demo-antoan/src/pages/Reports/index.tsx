import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Select, Progress, Tag } from 'antd';
import { Column, Line } from '@ant-design/charts';
import {
  BarChartOutlined,
  FileTextOutlined,
  SafetyOutlined,
  WarningOutlined,
  AuditOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { incidents } from '../../data/incidents';
import { technicalRisks } from '../../data/risks';
import { violations } from '../../data/violations';
import {
  riskLevelConfig,
  violationSeverityConfig,
  incidentSeverityConfig,
  hazardCategoryConfig,
} from '../../utils/format';

const { Title, Text } = Typography;

// ─── Mock data tổng hợp 6 tháng ─────────────────────────────────

const monthLabels = ['Tháng 11/25', 'Tháng 12/25', 'Tháng 1/26', 'Tháng 2/26', 'Tháng 3/26', 'Tháng 4/26'];

const incidentTrendData = [
  { month: 'Tháng 11/25', loai: 'Nghiêm trọng', count: 1 },
  { month: 'Tháng 11/25', loai: 'Trung bình',   count: 2 },
  { month: 'Tháng 11/25', loai: 'Nhẹ',          count: 1 },
  { month: 'Tháng 12/25', loai: 'Nghiêm trọng', count: 2 },
  { month: 'Tháng 12/25', loai: 'Trung bình',   count: 1 },
  { month: 'Tháng 12/25', loai: 'Nhẹ',          count: 3 },
  { month: 'Tháng 1/26',  loai: 'Nghiêm trọng', count: 1 },
  { month: 'Tháng 1/26',  loai: 'Trung bình',   count: 3 },
  { month: 'Tháng 1/26',  loai: 'Nhẹ',          count: 2 },
  { month: 'Tháng 2/26',  loai: 'Nghiêm trọng', count: 0 },
  { month: 'Tháng 2/26',  loai: 'Trung bình',   count: 2 },
  { month: 'Tháng 2/26',  loai: 'Nhẹ',          count: 1 },
  { month: 'Tháng 3/26',  loai: 'Nghiêm trọng', count: 2 },
  { month: 'Tháng 3/26',  loai: 'Trung bình',   count: 1 },
  { month: 'Tháng 3/26',  loai: 'Nhẹ',          count: 2 },
  { month: 'Tháng 4/26',  loai: 'Nghiêm trọng', count: 1 },
  { month: 'Tháng 4/26',  loai: 'Trung bình',   count: 2 },
  { month: 'Tháng 4/26',  loai: 'Nhẹ',          count: 1 },
];

const complianceTrendData = monthLabels.map((m, i) => ({
  month: m,
  tuanThu: [72, 75, 80, 84, 87, 88][i],
  mucTieu: 90,
}));

const workshopComplianceData = [
  { workshop: 'PX1 - Radar',    tuanThu: 85, vi_pham: 2, su_co: 2 },
  { workshop: 'PX2 - Tên lửa', tuanThu: 76, vi_pham: 3, su_co: 3 },
  { workshop: 'PX3 - Cơ khí',  tuanThu: 91, vi_pham: 2, su_co: 1 },
  { workshop: 'PX4 - Điện tử', tuanThu: 88, vi_pham: 3, su_co: 2 },
];

const violationTrendData = [
  { month: 'Tháng 11/25', muc: 'Nghiêm trọng', count: 1 },
  { month: 'Tháng 11/25', muc: 'Nặng',         count: 1 },
  { month: 'Tháng 11/25', muc: 'Nhẹ',          count: 0 },
  { month: 'Tháng 12/25', muc: 'Nghiêm trọng', count: 0 },
  { month: 'Tháng 12/25', muc: 'Nặng',         count: 2 },
  { month: 'Tháng 12/25', muc: 'Nhẹ',          count: 1 },
  { month: 'Tháng 1/26',  muc: 'Nghiêm trọng', count: 1 },
  { month: 'Tháng 1/26',  muc: 'Nặng',         count: 1 },
  { month: 'Tháng 1/26',  muc: 'Nhẹ',          count: 0 },
  { month: 'Tháng 2/26',  muc: 'Nghiêm trọng', count: 1 },
  { month: 'Tháng 2/26',  muc: 'Nặng',         count: 1 },
  { month: 'Tháng 2/26',  muc: 'Nhẹ',          count: 1 },
  { month: 'Tháng 3/26',  muc: 'Nghiêm trọng', count: 0 },
  { month: 'Tháng 3/26',  muc: 'Nặng',         count: 2 },
  { month: 'Tháng 3/26',  muc: 'Nhẹ',          count: 1 },
  { month: 'Tháng 4/26',  muc: 'Nghiêm trọng', count: 2 },
  { month: 'Tháng 4/26',  muc: 'Nặng',         count: 1 },
  { month: 'Tháng 4/26',  muc: 'Nhẹ',          count: 0 },
];

const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('6m');

  // Thống kê tổng quan
  const totalIncidents     = incidents.length;
  const openIncidents      = incidents.filter(i => i.status !== 'closed').length;
  const totalViolations    = violations.length;
  const openViolations     = violations.filter(v => v.status !== 'closed').length;
  const totalRisks         = technicalRisks.filter(r => r.status !== 'closed').length;
  const highRisks          = technicalRisks.filter(r => (r.riskLevel === 'high' || r.riskLevel === 'very_high') && r.status !== 'closed').length;
  const avgCompliance      = Math.round(workshopComplianceData.reduce((s, w) => s + w.tuanThu, 0) / workshopComplianceData.length);

  // Phân bổ rủi ro theo loại nguy cơ
  const riskByCategory = Object.keys(hazardCategoryConfig).map(cat => ({
    category: hazardCategoryConfig[cat as keyof typeof hazardCategoryConfig].label,
    count: technicalRisks.filter(r => r.hazardCategory === cat && r.status !== 'closed').length,
    color: hazardCategoryConfig[cat as keyof typeof hazardCategoryConfig].color,
  })).filter(d => d.count > 0);

  return (
    <div>
      {/* ─── Page header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChartOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Báo cáo Tổng hợp An toàn
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Phân tích xu hướng, tỷ lệ tuân thủ và hiệu quả kiểm soát rủi ro — Nhà máy Z119
            </Text>
          </div>
        </Space>
        <Select
          value={period}
          onChange={v => setPeriod(v)}
          style={{ width: 160, borderRadius: 8 }}
          options={[
            { value: '3m',  label: '3 tháng gần đây' },
            { value: '6m',  label: '6 tháng gần đây' },
            { value: '12m', label: '12 tháng gần đây' },
          ]}
        />
      </div>

      {/* ─── KPI tổng quan ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng sự cố',     value: totalIncidents,    sub: `${openIncidents} đang xử lý`,   gradient: 'linear-gradient(135deg, #cf1322, #ff4d4f)',    icon: <AlertOutlined /> },
          { label: 'Vi phạm',         value: totalViolations,   sub: `${openViolations} chưa đóng`,   gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',    icon: <AuditOutlined /> },
          { label: 'Rủi ro đang mở',  value: totalRisks,        sub: `${highRisks} mức cao / rất cao`,gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',    icon: <WarningOutlined /> },
          { label: 'Tỷ lệ tuân thủ',  value: `${avgCompliance}%`, sub: 'Mục tiêu: 90%',              gradient: 'linear-gradient(135deg, #059669, #10b981)',    icon: <SafetyOutlined /> },
        ].map(card => (
          <Col xs={24} sm={12} md={6} key={card.label}>
            <div style={{
              background: card.gradient, borderRadius: 14, padding: '20px 24px',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 56, opacity: 0.1, color: '#fff' }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{card.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{card.sub}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Biểu đồ xu hướng sự cố + Tuân thủ ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #cf1322, #ff4d4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Xu hướng sự cố theo mức độ</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 20 } }}
          >
            <Column
              data={incidentTrendData}
              xField="month"
              yField="count"
              colorField="loai"
              stack={true}
              legend={{ position: 'top-right' }}
              color={['#ff4d4f', '#faad14', '#52c41a']}
              axis={{ y: { title: 'Số sự cố' } }}
              style={{ height: 240 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Tỷ lệ tuân thủ an toàn</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 20 } }}
          >
            <Line
              data={[
                ...complianceTrendData.map(d => ({ month: d.month, value: d.tuanThu, series: 'Thực tế' })),
                ...complianceTrendData.map(d => ({ month: d.month, value: d.mucTieu, series: 'Mục tiêu' })),
              ]}
              xField="month"
              yField="value"
              colorField="series"
              legend={{ position: 'top-right' }}
              color={['#1B3A5C', '#faad14']}
              axis={{ y: { title: '%', min: 60, max: 100 } }}
              style={{ height: 240 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Vi phạm theo tháng + Tuân thủ theo phân xưởng ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AuditOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Vi phạm theo tháng</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 20 } }}
          >
            <Column
              data={violationTrendData}
              xField="month"
              yField="count"
              colorField="muc"
              stack={true}
              color={['#ff4d4f', '#fa8c16', '#faad14']}
              legend={{ position: 'top-right' }}
              style={{ height: 240 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Tuân thủ theo phân xưởng</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ padding: '8px 0' }}>
              {workshopComplianceData.map(ws => (
                <div key={ws.workshop} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: 500 }}>{ws.workshop}</Text>
                    <Space size={6}>
                      <Tag style={{ fontSize: 11, margin: 0 }}>{ws.vi_pham} vi phạm</Tag>
                      <Tag style={{ fontSize: 11, margin: 0 }}>{ws.su_co} sự cố</Tag>
                      <Text strong style={{ color: ws.tuanThu >= 90 ? '#52c41a' : ws.tuanThu >= 80 ? '#faad14' : '#ff4d4f', fontSize: 13 }}>
                        {ws.tuanThu}%
                      </Text>
                    </Space>
                  </div>
                  <Progress
                    percent={ws.tuanThu}
                    strokeColor={ws.tuanThu >= 90 ? '#52c41a' : ws.tuanThu >= 80 ? '#faad14' : '#ff4d4f'}
                    trailColor="#f0f2f5"
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Phân bổ rủi ro theo nguy cơ + Mức rủi ro ─── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WarningOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Rủi ro theo loại nguy cơ</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 20 } }}
          >
            {riskByCategory.map(cat => (
              <div key={cat.category} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>{cat.category}</Text>
                  <Text strong style={{ color: cat.color, fontSize: 13 }}>{cat.count} rủi ro</Text>
                </div>
                <Progress
                  percent={Math.round((cat.count / technicalRisks.filter(r => r.status !== 'closed').length) * 100)}
                  strokeColor={cat.color}
                  trailColor="#f0f2f5"
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #cf1322, #ff4d4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Phân bổ theo mức rủi ro</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 20 } }}
          >
            {Object.entries(riskLevelConfig).reverse().map(([key, cfg]) => {
              const count = technicalRisks.filter(r => r.riskLevel === key && r.status !== 'closed').length;
              const pct   = totalRisks > 0 ? Math.round((count / totalRisks) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Space size={6}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: cfg.bg }} />
                      <Text style={{ fontSize: 13 }}>{cfg.label}</Text>
                    </Space>
                    <Text strong style={{ fontSize: 13, color: cfg.bg }}>{count} ({pct}%)</Text>
                  </div>
                  <Progress
                    percent={pct}
                    strokeColor={cfg.bg}
                    trailColor="#f0f2f5"
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;
