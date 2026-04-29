import { useState, useMemo } from 'react';
import { Card, Typography, Row, Col, Table, Tag, Progress, Space, Tabs, Select } from 'antd';
import {
  BarChartOutlined, CheckCircleOutlined, WarningOutlined,
  ExperimentOutlined, ClockCircleOutlined, TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Column } from '@ant-design/charts';
import { productionOrders, productionPlans } from '../../data/productionOrders';
import { productionLogs } from '../../data/productionLogs';
import { orderTypeConfig, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

const ReportsPage: React.FC = () => {
  const [filterYear, setFilterYear] = useState<number>(2026);
  const [filterQuarter, setFilterQuarter] = useState<number | undefined>(undefined);

  // Filter orders theo kỳ
  const filteredProductionOrders = useMemo(() => {
    return productionOrders.filter(o => {
      const plan = productionPlans.find(p => p.id === o.planId);
      if (!plan) return false;
      if (plan.year !== filterYear) return false;
      if (filterQuarter && plan.quarter !== filterQuarter) return false;
      return true;
    });
  }, [filterYear, filterQuarter]);
  // === 1. Kế hoạch vs Thực hiện theo loại ===
  const planVsActual = useMemo(() => {
    const map: Record<string, { planned: number; actual: number; rate: number }> = {};
    filteredProductionOrders.forEach(o => {
      const label = orderTypeConfig[o.type]?.label || o.type;
      if (!map[label]) map[label] = { planned: 0, actual: 0, rate: 0 };
      map[label].planned += o.quantity;
      map[label].actual += o.completedQty;
    });
    return Object.entries(map).map(([type, v]) => ({
      type,
      planned: v.planned,
      actual: v.actual,
      rate: v.planned > 0 ? Math.round((v.actual / v.planned) * 100) : 0,
    }));
  }, [filteredProductionOrders]);

  // === 2. Phân tích vật tư — tiêu hao từ production logs ===
  const materialAnalysis = useMemo(() => {
    const map: Record<string, { name: string; totalUsed: number; orderCount: number }> = {};
    productionLogs.forEach(log => {
      log.materialsUsed.forEach(m => {
        if (!map[m.materialCode]) map[m.materialCode] = { name: m.materialName, totalUsed: 0, orderCount: 0 };
        map[m.materialCode].totalUsed += m.quantity;
        map[m.materialCode].orderCount += 1;
      });
    });
    return Object.entries(map)
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.totalUsed - a.totalUsed);
  }, []);

  // === 3. Phân tích giờ công từ logs ===
  const laborAnalysis = useMemo(() => {
    const byOrder: Record<string, { code: string; totalHours: number; logCount: number }> = {};
    productionLogs.forEach(log => {
      if (!log.laborHours) return;
      if (!byOrder[log.orderId]) byOrder[log.orderId] = { code: log.orderId, totalHours: 0, logCount: 0 };
      byOrder[log.orderId].totalHours += log.laborHours;
      byOrder[log.orderId].logCount += 1;
    });
    return Object.values(byOrder).sort((a, b) => b.totalHours - a.totalHours);
  }, []);

  // === 4. Tổng hợp theo PX ===
  const workshopSummary = useMemo(() => {
    const map: Record<string, { name: string; totalOrders: number; completed: number; inProgress: number; totalQty: number; doneQty: number; defectQty: number }> = {};
    filteredProductionOrders.forEach(o => {
      const ws = o.workshopId;
      if (!map[ws]) map[ws] = { name: o.workshopName, totalOrders: 0, completed: 0, inProgress: 0, totalQty: 0, doneQty: 0, defectQty: 0 };
      map[ws].totalOrders += 1;
      map[ws].totalQty += o.quantity;
      map[ws].doneQty += o.completedQty;
      map[ws].defectQty += o.defectQty;
      if (o.status === 'completed' || o.status === 'closed') map[ws].completed += 1;
      if (o.status === 'in_progress') map[ws].inProgress += 1;
    });
    return Object.entries(map).map(([id, v]) => ({ workshopId: id, ...v, completionRate: v.totalQty > 0 ? Math.round((v.doneQty / v.totalQty) * 100) : 0, defectRate: v.doneQty > 0 ? ((v.defectQty / v.doneQty) * 100).toFixed(1) : '0' }));
  }, [filteredProductionOrders]);

  // === 5. Chất lượng theo sản phẩm ===
  const qualityByProduct = useMemo(() => {
    const map: Record<string, { name: string; totalDone: number; defect: number }> = {};
    filteredProductionOrders.forEach(o => {
      if (o.completedQty === 0) return;
      if (!map[o.productCode]) map[o.productCode] = { name: o.productName, totalDone: 0, defect: 0 };
      map[o.productCode].totalDone += o.completedQty;
      map[o.productCode].defect += o.defectQty;
    });
    return Object.entries(map).map(([code, v]) => ({
      code, ...v,
      defectRate: v.totalDone > 0 ? ((v.defect / v.totalDone) * 100).toFixed(1) : '0',
    })).sort((a, b) => parseFloat(b.defectRate) - parseFloat(a.defectRate));
  }, [filteredProductionOrders]);

  // Chart data: completion rate by workshop
  const wsChartData = workshopSummary.flatMap(ws => [
    { workshop: ws.workshopId, category: 'Kế hoạch', value: ws.totalQty },
    { workshop: ws.workshopId, category: 'Hoàn thành', value: ws.doneQty },
  ]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChartOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Báo cáo sản xuất</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Phân tích kế hoạch vs thực hiện, vật tư, giờ công, chất lượng</Text>
          </div>
        </Space>
      </div>

      {/* Filter bar */}
      <Card size="small" style={{ borderRadius: 14, marginBottom: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '10px 20px' } }}>
        <Space size={12} align="center">
          <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Kỳ báo cáo:</Text>
          <Select value={filterYear} onChange={setFilterYear} style={{ width: 100 }}
            options={[{ value: 2025, label: '2025' }, { value: 2026, label: '2026' }]} />
          <Select value={filterQuarter} onChange={setFilterQuarter} allowClear placeholder="Cả năm" style={{ width: 120 }}
            options={[{ value: 1, label: 'Quý I' }, { value: 2, label: 'Quý II' }, { value: 3, label: 'Quý III' }, { value: 4, label: 'Quý IV' }]} />
          <Tag color="#1B3A5C" style={{ fontSize: 12 }}>{filteredProductionOrders.length} lệnh sản xuất</Tag>
        </Space>
      </Card>

      <Tabs
        className="order-detail-tabs"
        items={[
          // === Tab 1: Kế hoạch vs Thực hiện ===
          {
            key: 'plan',
            label: <span><CheckCircleOutlined style={{ marginRight: 6 }} />Kế hoạch vs Thực hiện</span>,
            children: (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} md={16}>
                    <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
                      <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Sản lượng kế hoạch vs hoàn thành theo phân xưởng</Text>
                      <div style={{ marginTop: 12, height: 280 }}>
                        <Column data={wsChartData} xField="workshop" yField="value" seriesField="category" isGroup
                          color={['#1B3A5C', '#52c41a']} columnWidthRatio={0.4}
                          label={{ position: 'top', style: { fontSize: 11 } }} />
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="db-chart-card" style={{ borderRadius: 14, height: '100%' }} styles={{ body: { padding: 20 } }}>
                      <Text strong style={{ color: '#1B3A5C', fontSize: 14, display: 'block', marginBottom: 12 }}>Tỉ lệ hoàn thành theo loại</Text>
                      {planVsActual.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                            <Text>{item.type}</Text>
                            <Text strong style={{ color: '#1B3A5C' }}>{item.actual}/{item.planned} ({item.rate}%)</Text>
                          </div>
                          <Progress percent={item.rate} size="small" strokeColor={item.rate >= 80 ? '#52c41a' : item.rate >= 50 ? '#faad14' : '#ff4d4f'} showInfo={false} />
                        </div>
                      ))}
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          // === Tab 2: Vật tư tiêu hao ===
          {
            key: 'material',
            label: <span><ExperimentOutlined style={{ marginRight: 6 }} />Vật tư tiêu hao</span>,
            children: (
              <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
                <div style={{ padding: '16px 20px 8px' }}>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Vật tư tiêu hao thực tế</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Tổng hợp từ nhật ký sản xuất</Text>
                </div>
                <Table
                  dataSource={materialAnalysis} rowKey="code" size="middle" pagination={false}
                  columns={[
                    { title: 'Mã vật tư', dataIndex: 'code', width: 130, render: (v: string) => <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{v}</Text> },
                    { title: 'Tên vật tư', dataIndex: 'name' },
                    { title: 'Tổng sử dụng', dataIndex: 'totalUsed', width: 120, align: 'right', render: (v: number) => <Text strong>{v}</Text> },
                    { title: 'Số lần xuất', dataIndex: 'orderCount', width: 100, align: 'center' },
                  ]}
                />
              </Card>
            ),
          },
          // === Tab 3: Giờ công ===
          {
            key: 'labor',
            label: <span><ClockCircleOutlined style={{ marginRight: 6 }} />Giờ công</span>,
            children: (
              <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
                <div style={{ padding: '16px 20px 8px' }}>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Giờ công thực tế theo lệnh sản xuất</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Tổng hợp từ nhật ký</Text>
                </div>
                <Table
                  dataSource={laborAnalysis} rowKey="code" size="middle" pagination={false}
                  columns={[
                    { title: 'Lệnh sản xuất', dataIndex: 'code', width: 160, render: (v: string) => <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{v}</Text> },
                    { title: 'Tổng giờ công', dataIndex: 'totalHours', width: 120, align: 'right', render: (v: number) => <Text strong>{v} giờ</Text> },
                    { title: 'Số lần cập nhật', dataIndex: 'logCount', width: 130, align: 'center' },
                  ]}
                />
              </Card>
            ),
          },
          // === Tab 4: Tổng hợp theo PX ===
          {
            key: 'workshop',
            label: <span><TeamOutlined style={{ marginRight: 6 }} />Theo phân xưởng</span>,
            children: (
              <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
                <div style={{ padding: '16px 20px 8px' }}>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tổng hợp kết quả sản xuất theo phân xưởng</Text>
                </div>
                <Table
                  dataSource={workshopSummary} rowKey="workshopId" size="middle" pagination={false}
                  columns={[
                    { title: 'Phân xưởng', dataIndex: 'name', width: 200 },
                    { title: 'Tổng lệnh', dataIndex: 'totalOrders', width: 90, align: 'center' },
                    { title: 'Đang SX', dataIndex: 'inProgress', width: 80, align: 'center', render: (v: number) => v > 0 ? <Tag color="processing">{v}</Tag> : <Text type="secondary">0</Text> },
                    { title: 'Hoàn thành', dataIndex: 'completed', width: 90, align: 'center', render: (v: number) => v > 0 ? <Tag color="success">{v}</Tag> : <Text type="secondary">0</Text> },
                    { title: 'Tỉ lệ hoàn thành', dataIndex: 'completionRate', width: 140, render: (v: number) => <Progress percent={v} size="small" strokeColor={v >= 80 ? '#52c41a' : v >= 50 ? '#faad14' : '#ff4d4f'} /> },
                    { title: 'Tỉ lệ lỗi', dataIndex: 'defectRate', width: 100, align: 'center', render: (v: string) => <Text style={{ color: parseFloat(v) > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>{v}%</Text> },
                  ]}
                />
              </Card>
            ),
          },
          // === Tab 5: Chất lượng ===
          {
            key: 'quality',
            label: <span><WarningOutlined style={{ marginRight: 6 }} />Chất lượng</span>,
            children: (
              <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
                <div style={{ padding: '16px 20px 8px' }}>
                  <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tỉ lệ lỗi theo sản phẩm</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Sản phẩm có lỗi cao nhất xếp trước</Text>
                </div>
                <Table
                  dataSource={qualityByProduct} rowKey="code" size="middle" pagination={false}
                  columns={[
                    { title: 'Mã sản phẩm', dataIndex: 'code', width: 130, render: (v: string) => <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{v}</Text> },
                    { title: 'Tên sản phẩm', dataIndex: 'name' },
                    { title: 'Hoàn thành', dataIndex: 'totalDone', width: 100, align: 'right' },
                    { title: 'Lỗi', dataIndex: 'defect', width: 70, align: 'right', render: (v: number) => <Text style={{ color: v > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>{v}</Text> },
                    { title: 'Tỉ lệ lỗi', dataIndex: 'defectRate', width: 100, align: 'center', render: (v: string) => {
                      const rate = parseFloat(v);
                      return <Tag color={rate > 5 ? 'error' : rate > 0 ? 'warning' : 'success'}>{v}%</Tag>;
                    }},
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      <style>{`
        .order-detail-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
          padding: 0 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e8e8e8;
        }
        .order-detail-tabs .ant-tabs-tab {
          padding: 12px 20px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #8c8c8c !important;
        }
        .order-detail-tabs .ant-tabs-tab:hover { color: #1B3A5C !important; }
        .order-detail-tabs .ant-tabs-tab-active { color: #1B3A5C !important; font-weight: 600 !important; }
        .order-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #1B3A5C !important; }
        .order-detail-tabs .ant-tabs-ink-bar { background: #1B3A5C !important; }
        .order-detail-tabs .ant-tabs-content-holder { padding: 16px 0; }
      `}</style>
    </div>
  );
};

export default ReportsPage;
