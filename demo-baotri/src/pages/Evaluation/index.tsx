import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tabs,
  Row,
  Col,
  Progress,
  Breadcrumb,
  Typography,
  Space,
  Tag,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';
import { maintenanceKPIs, teamPerformances } from '../../data/history';
import { formatNumber, formatCurrency } from '../../utils/format';
import type { MaintenanceKPI, TeamPerformance } from '../../types';

const { Title, Text } = Typography;

const EvaluationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('kpi');

  // KPI averages
  const kpiAverages = useMemo(() => {
    const count = maintenanceKPIs.length;
    const avgMtbf = maintenanceKPIs.reduce((s, k) => s + k.mtbf, 0) / count;
    const avgMttr = maintenanceKPIs.reduce((s, k) => s + k.mttr, 0) / count;
    const avgAvailability = maintenanceKPIs.reduce((s, k) => s + k.availability, 0) / count;
    const avgCompliance = maintenanceKPIs.reduce((s, k) => s + k.complianceRate, 0) / count;
    return { avgMtbf, avgMttr, avgAvailability, avgCompliance };
  }, []);

  const kpiColumns: ColumnsType<MaintenanceKPI> = [
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 220,
      fixed: 'left',
      render: (name: string) => <Text strong style={{ color: '#1B3A5C' }}>{name}</Text>,
    },
    {
      title: 'MTBF (giờ)',
      dataIndex: 'mtbf',
      key: 'mtbf',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.mtbf - b.mtbf,
      render: (val: number) => (
        <Text style={{ color: val < 500 ? '#ff4d4f' : '#1B3A5C', fontWeight: 600 }}>
          {formatNumber(val)}
        </Text>
      ),
    },
    {
      title: 'MTTR (giờ)',
      dataIndex: 'mttr',
      key: 'mttr',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.mttr - b.mttr,
      render: (val: number) => (
        <Text style={{ fontWeight: 500 }}>{val}</Text>
      ),
    },
    {
      title: 'Khả dụng (%)',
      dataIndex: 'availability',
      key: 'availability',
      width: 140,
      align: 'center',
      sorter: (a, b) => a.availability - b.availability,
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          format={p => `${p}%`}
          strokeColor={val < 95 ? '#faad14' : '#52c41a'}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Số lần hỏng',
      dataIndex: 'failureCount',
      key: 'failureCount',
      width: 100,
      align: 'center',
      render: (val: number) => (
        val > 0 ? <Tag color="error">{val}</Tag> : <Tag color="success">0</Tag>
      ),
    },
    {
      title: 'Thời gian dừng',
      dataIndex: 'totalDowntime',
      key: 'totalDowntime',
      width: 130,
      align: 'center',
      render: (val: number) => <Text>{val} giờ</Text>,
    },
    {
      title: 'Chi phí BT',
      dataIndex: 'maintenanceCost',
      key: 'maintenanceCost',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.maintenanceCost - b.maintenanceCost,
      render: (val: number) => (
        <Text strong>{formatCurrency(val)}</Text>
      ),
    },
    {
      title: 'Tuân thủ KH (%)',
      dataIndex: 'complianceRate',
      key: 'complianceRate',
      width: 140,
      align: 'center',
      sorter: (a, b) => a.complianceRate - b.complianceRate,
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          format={p => `${p}%`}
          strokeColor={val < 90 ? '#faad14' : '#52c41a'}
          style={{ width: 100 }}
        />
      ),
    },
  ];

  const renderKpiTab = () => (
    <div>
      {/* Summary averages */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          {
            label: 'MTBF trung bình',
            value: `${Math.round(kpiAverages.avgMtbf)} giờ`,
            icon: <DashboardOutlined />,
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          },
          {
            label: 'MTTR trung bình',
            value: `${kpiAverages.avgMttr.toFixed(1)} giờ`,
            icon: <BarChartOutlined />,
            gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
          },
          {
            label: 'Khả dụng trung bình',
            value: `${kpiAverages.avgAvailability.toFixed(1)}%`,
            icon: <TrophyOutlined />,
            gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
          },
          {
            label: 'Tuân thủ KH trung bình',
            value: `${kpiAverages.avgCompliance.toFixed(1)}%`,
            icon: <TeamOutlined />,
            gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
          },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={card.label}>
            <div
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{
                background: card.gradient,
                borderRadius: 14,
                padding: '20px 18px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 64,
                  opacity: 0.1,
                  color: '#fff',
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  color: '#fff',
                  fontSize: 16,
                }}
              >
                {card.icon}
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* KPI Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
        className="animate-fade-in animate-delay-3"
      >
        <Table<MaintenanceKPI>
          columns={kpiColumns}
          dataSource={maintenanceKPIs}
          rowKey="equipmentId"
          pagination={false}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>
    </div>
  );

  // Team performance
  const teamColumns: ColumnsType<TeamPerformance> = [
    {
      title: 'Đội bảo trì',
      dataIndex: 'teamName',
      key: 'teamName',
      width: 180,
      render: (name: string) => <Text strong style={{ color: '#1B3A5C' }}>{name}</Text>,
    },
    {
      title: 'Hoàn thành',
      key: 'completed',
      width: 130,
      align: 'center',
      render: (_: unknown, record: TeamPerformance) => (
        <Text>
          <Text strong style={{ color: '#52c41a' }}>{record.completedTasks}</Text>
          {' / '}
          {record.totalTasks}
        </Text>
      ),
    },
    {
      title: 'TG trung bình',
      dataIndex: 'averageTime',
      key: 'averageTime',
      width: 120,
      align: 'center',
      render: (val: number) => <Text>{val} giờ</Text>,
    },
    {
      title: 'Tuân thủ KH',
      dataIndex: 'complianceRate',
      key: 'complianceRate',
      width: 150,
      align: 'center',
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          strokeColor={val < 90 ? '#faad14' : '#52c41a'}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Điểm chất lượng',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 150,
      align: 'center',
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          strokeColor={val >= 90 ? '#52c41a' : val >= 80 ? '#1B3A5C' : '#faad14'}
          style={{ width: 100 }}
        />
      ),
    },
  ];

  const chartData = useMemo(() => {
    const data: { team: string; metric: string; value: number }[] = [];
    teamPerformances.forEach(t => {
      data.push({ team: t.teamName.replace('Đội bảo trì ', ''), metric: 'Tuân thủ KH (%)', value: t.complianceRate });
      data.push({ team: t.teamName.replace('Đội bảo trì ', ''), metric: 'Chất lượng (%)', value: t.qualityScore });
      data.push({ team: t.teamName.replace('Đội bảo trì ', ''), metric: 'Hoàn thành (%)', value: Math.round((t.completedTasks / t.totalTasks) * 100) });
    });
    return data;
  }, []);

  const renderTeamTab = () => (
    <div>
      {/* Chart */}
      <Card
        title={
          <Space>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
              }}
            >
              <BarChartOutlined />
            </div>
            <Text strong style={{ color: '#1B3A5C' }}>So sánh hiệu suất đội bảo trì</Text>
          </Space>
        }
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        className="animate-fade-in animate-delay-1"
      >
        <div style={{ height: 320 }}>
          <Column
            data={chartData}
            xField="team"
            yField="value"
            colorField="metric"
            isGroup={true}
            color={['#1B3A5C', '#D4A843', '#0891b2']}
            label={{
              position: 'top',
              style: { fontSize: 11 },
            }}
            legend={{ position: 'top-right' }}
            yAxis={{
              title: { text: 'Phần trăm (%)' },
              max: 110,
            }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card
        title={
          <Space>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
              }}
            >
              <TeamOutlined />
            </div>
            <Text strong style={{ color: '#1B3A5C' }}>Chi tiết hiệu suất đội bảo trì</Text>
          </Space>
        }
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
        className="animate-fade-in animate-delay-2"
      >
        <Table<TeamPerformance>
          columns={teamColumns}
          dataSource={teamPerformances}
          rowKey="teamId"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Đánh giá & Cải tiến' },
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
            <TrophyOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              Đánh giá & Cải tiến
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              KPI thiết bị và hiệu suất đội bảo trì - Doanh nghiệp A
            </Text>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'kpi',
            label: (
              <span>
                <DashboardOutlined style={{ marginRight: 6 }} />
                KPI Thiết bị
              </span>
            ),
            children: renderKpiTab(),
          },
          {
            key: 'team',
            label: (
              <span>
                <TeamOutlined style={{ marginRight: 6 }} />
                Hiệu suất đội
              </span>
            ),
            children: renderTeamTab(),
          },
        ]}
      />
    </div>
  );
};

export default EvaluationPage;
