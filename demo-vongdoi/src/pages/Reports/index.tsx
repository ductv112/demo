import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Button, Space, Table, Tag, Statistic, Select, Divider,
} from 'antd';
import {
  BarChartOutlined, DownloadOutlined, PrinterOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';
import { equipmentList } from '../../data/equipment';
import { lifecyclePlans } from '../../data/lifecyclePlans';
import { operationLogs } from '../../data/operationHistory';
import {
  equipmentStatusConfig, equipmentTypeConfig, lifecyclePhaseConfig,
  getLifespanPercent, getHoursPercent, formatCurrency, getProgressColor,
} from '../../utils/format';
import type { ColumnsType } from 'antd/es/table';
import type { Equipment, EquipmentType, EquipmentStatus, LifecyclePhase } from '../../types';
import { message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'equipment' | 'lifecycle' | 'operation'>('equipment');
  const [msg, contextHolder] = message.useMessage();

  // ─── Summary stats ──────────────────────────────────────────────
  const totalEquipment = equipmentList.length;
  const inService = equipmentList.filter(e => e.status === 'in_service').length;
  const totalLifecycleCost = lifecyclePlans.reduce((s, p) => s + p.estimatedCost, 0);
  const completedPlans = lifecyclePlans.filter(p => p.status === 'completed').length;
  const totalOpHours = operationLogs.reduce((s, l) => s + l.hoursThisSession, 0);

  // ─── Chart data ─────────────────────────────────────────────────
  const statusDist = Object.entries(equipmentStatusConfig).map(([key, cfg]) => ({
    type: cfg.label,
    value: equipmentList.filter(e => e.status === key).length,
  })).filter(d => d.value > 0);

  const typeDist: Record<string, number> = {};
  equipmentList.forEach(e => {
    const label = equipmentTypeConfig[e.type]?.label || e.type;
    typeDist[label] = (typeDist[label] || 0) + 1;
  });
  const typeData = Object.entries(typeDist).map(([type, count]) => ({ type, count }));

  const phaseCostData = Object.entries(lifecyclePhaseConfig).map(([key, cfg]) => ({
    phase: cfg.label,
    cost: lifecyclePlans.filter(p => p.phase === key).reduce((s, p) => s + p.estimatedCost, 0),
  })).filter(d => d.cost > 0);

  // ─── Equipment columns ───────────────────────────────────────────
  const equipColumns: ColumnsType<Equipment> = [
    { title: 'Mã', dataIndex: 'code', width: 140, render: (c) => <Text code style={{ fontSize: 11 }}>{c}</Text> },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      render: (n) => <Text style={{ fontSize: 12, fontWeight: 600 }}>{n}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 100,
      render: (t: EquipmentType) => (
        <Tag style={{ background: equipmentTypeConfig[t]?.color, color: '#fff', border: 'none', fontSize: 10 }}>
          {equipmentTypeConfig[t]?.label}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 135,
      render: (s: EquipmentStatus) => <Tag color={equipmentStatusConfig[s]?.color} style={{ fontSize: 11 }}>{equipmentStatusConfig[s]?.label}</Tag>,
    },
    { title: 'Đơn vị', dataIndex: 'unitName', width: 130, render: (n) => <Text style={{ fontSize: 12 }}>{n}</Text> },
    {
      title: 'Tuổi thọ (%)',
      width: 90,
      render: (_, r) => {
        const pct = getLifespanPercent(r.yearReceived, r.designLifespan);
        return <Text style={{ fontSize: 12, color: getProgressColor(pct), fontWeight: 600 }}>{pct}%</Text>;
      },
    },
    {
      title: 'Giờ HĐ (%)',
      width: 85,
      render: (_, r) => {
        const pct = getHoursPercent(r.operatingHours, r.maxOperatingHours);
        return <Text style={{ fontSize: 12, color: getProgressColor(pct), fontWeight: 600 }}>{pct}%</Text>;
      },
    },
  ];

  const handleExport = () => {
    msg.info('Tính năng xuất báo cáo đang được phát triển');
  };

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChartOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Báo cáo Thống kê</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Tổng hợp báo cáo tình trạng vòng đời thiết bị / hệ thống Doanh nghiệp A</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<PrinterOutlined />} onClick={handleExport} style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>In báo cáo</Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>Xuất Excel</Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng trang thiết bị', value: totalEquipment, suffix: 'thiết bị', color: '#1B3A5C' },
          { title: 'Đang vận hành', value: inService, suffix: 'thiết bị', color: '#52c41a' },
          { title: 'Chi phí VĐ (dự toán)', value: formatCurrency(totalLifecycleCost), isStr: true, color: '#1B3A5C' },
          { title: 'KH VĐ hoàn thành', value: completedPlans, suffix: 'kế hoạch', color: '#7c3aed' },
          { title: 'Tổng giờ vận hành (ghi nhận)', value: totalOpHours, suffix: 'giờ', color: '#0891b2' },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={8} md={4} lg={4}>
            <Card bodyStyle={{ padding: '14px 16px', textAlign: 'center' }} style={{ borderRadius: 10 }}>
              <div style={{ fontSize: (s as any).isStr ? 16 : 20, fontWeight: 700, color: s.color }}>
                {(s as any).isStr ? s.value : s.value}
                {!((s as any).isStr) && s.suffix && <span style={{ fontSize: 11, fontWeight: 400, color: '#666', marginLeft: 4 }}>{s.suffix}</span>}
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{s.title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tab selector */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          {[
            { key: 'equipment', label: 'Trang thiết bị', icon: <FileTextOutlined /> },
            { key: 'lifecycle', label: 'Vòng đời', icon: <BarChartOutlined /> },
            { key: 'operation', label: 'Vận hành', icon: <BarChartOutlined /> },
          ].map(tab => (
            <Button
              key={tab.key}
              type={reportType === tab.key ? 'primary' : 'default'}
              icon={tab.icon}
              onClick={() => setReportType(tab.key as any)}
            >
              {tab.label}
            </Button>
          ))}
        </Space>
      </div>

      {reportType === 'equipment' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={10}>
              <Card
                className="db-chart-card"
                title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}><BarChartOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Phân bố theo trạng thái</Text></Space>}
              >
                <Pie
                  data={statusDist}
                  angleField="value"
                  colorField="type"
                  radius={0.85}
                  innerRadius={0.55}
                  height={240}
                  legend={{ position: 'bottom', flipPage: false }}
                  statistic={{ title: { content: 'Tổng', style: { fontSize: 14 } }, content: { content: `${totalEquipment}`, style: { fontSize: 22 } } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card
                className="db-chart-card"
                title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#D4A84318', border: '1px solid #D4A84333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#D4A843' }}><BarChartOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Phân bố theo loại sản phẩm</Text></Space>}
              >
                <Column
                  data={typeData}
                  xField="type"
                  yField="count"
                  height={240}
                  color="#1B3A5C"
                  label={{ position: 'top', style: { fontSize: 12 } }}
                />
              </Card>
            </Col>
          </Row>
          <Card
            style={{ borderRadius: 12 }}
            title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}><FileTextOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Danh sách trang thiết bị</Text></Space>}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={equipmentList}
              columns={equipColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          </Card>
        </>
      )}

      {reportType === 'lifecycle' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={10}>
              <Card
                className="db-chart-card"
                title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#7c3aed18', border: '1px solid #7c3aed33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7c3aed' }}><BarChartOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Chi phí theo giai đoạn vòng đời</Text></Space>}
              >
                <Pie
                  data={phaseCostData}
                  angleField="cost"
                  colorField="phase"
                  radius={0.85}
                  innerRadius={0.55}
                  height={240}
                  legend={{ position: 'bottom', flipPage: false }}
                  label={{ type: 'inner', offset: '-30%', content: (datum: { cost: number }) => `${formatCurrency(datum.cost)}`, style: { fontSize: 11 } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card
                className="db-chart-card"
                title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#D4A84318', border: '1px solid #D4A84333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#D4A843' }}><BarChartOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Số lượng kế hoạch theo năm</Text></Space>}
              >
                <Column
                  data={[
                    { year: '2024', count: lifecyclePlans.filter(p => p.planYear === 2024).length },
                    { year: '2025', count: lifecyclePlans.filter(p => p.planYear === 2025).length },
                    { year: '2026', count: lifecyclePlans.filter(p => p.planYear === 2026).length },
                    { year: '2027', count: lifecyclePlans.filter(p => p.planYear === 2027).length },
                  ]}
                  xField="year"
                  yField="count"
                  height={240}
                  color="#7c3aed"
                  label={{ position: 'top', style: { fontSize: 12 } }}
                />
              </Card>
            </Col>
          </Row>
          <Card
            style={{ borderRadius: 12 }}
            title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#7c3aed18', border: '1px solid #7c3aed33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7c3aed' }}><FileTextOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tổng hợp kế hoạch vòng đời</Text></Space>}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={lifecyclePlans}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              columns={[
                { title: 'Thiết bị', key: 'eq', render: (_, r) => <Text style={{ fontSize: 12, fontWeight: 600 }}>{r.equipmentName}</Text> },
                { title: 'Giai đoạn', dataIndex: 'phase', render: (p: LifecyclePhase) => <Tag color={lifecyclePhaseConfig[p]?.color} style={{ fontSize: 11 }}>{lifecyclePhaseConfig[p]?.label}</Tag> },
                { title: 'Năm', dataIndex: 'planYear', width: 70, render: (y) => <Text style={{ fontSize: 12 }}>{y}</Text> },
                { title: 'Dự toán', dataIndex: 'estimatedCost', render: (c) => <Text strong style={{ color: '#1B3A5C', fontSize: 12 }}>{formatCurrency(c)}</Text> },
                { title: 'Thực tế', dataIndex: 'actualCost', render: (c) => c ? <Text style={{ color: '#52c41a', fontSize: 12 }}>{formatCurrency(c)}</Text> : '—' },
                { title: 'P. phụ trách', dataIndex: 'responsibleDeptName', render: (n) => <Text style={{ fontSize: 11 }}>{n}</Text> },
              ]}
            />
          </Card>
        </>
      )}

      {reportType === 'operation' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              className="db-chart-card"
              title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#0891b218', border: '1px solid #0891b233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#0891b2' }}><BarChartOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Sự kiện vận hành theo loại</Text></Space>}
            >
              <Column
                data={Object.entries({
                  'Vận hành': operationLogs.filter(l => l.eventType === 'operation_log').length,
                  'Tiếp nhận': operationLogs.filter(l => l.eventType === 'transfer_in').length,
                  'Bàn giao': operationLogs.filter(l => l.eventType === 'transfer_out').length,
                  'Kiểm tra': operationLogs.filter(l => l.eventType === 'inspection').length,
                  'Hiệu chuẩn': operationLogs.filter(l => l.eventType === 'calibration').length,
                  'Chạy thử': operationLogs.filter(l => l.eventType === 'test_run').length,
                }).map(([type, count]) => ({ type, count }))}
                xField="type"
                yField="count"
                height={260}
                color="#0891b2"
                label={{ position: 'top', style: { fontSize: 12 } }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              className="db-chart-card"
              title={<Space size={10}><div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}><BarChartOutlined /></div><Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Kết quả vận hành</Text></Space>}
            >
              <Pie
                data={[
                  { type: 'Bình thường', value: operationLogs.filter(l => l.result === 'normal').length },
                  { type: 'Cần chú ý', value: operationLogs.filter(l => l.result === 'needs_attention').length },
                  { type: 'Bất thường', value: operationLogs.filter(l => l.result === 'abnormal').length },
                ]}
                angleField="value"
                colorField="type"
                radius={0.85}
                innerRadius={0.55}
                height={260}
                legend={{ position: 'bottom' }}
                theme={{ colors10: ['#52c41a', '#faad14', '#ff4d4f'] }}
                statistic={{ title: { content: 'Tổng', style: { fontSize: 13 } }, content: { content: `${operationLogs.length}`, style: { fontSize: 20 } } }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Reports;
