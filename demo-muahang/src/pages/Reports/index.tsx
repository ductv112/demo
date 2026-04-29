import React, { useMemo, useState } from 'react';
import {
  Card, Table, Typography, Tag, Row, Col, Space, Tabs, Progress,
} from 'antd';
import {
  PieChartOutlined, BarChartOutlined, TeamOutlined,
  DollarOutlined, FileTextOutlined, ShoppingCartOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Pie, Column } from '@ant-design/charts';
import { supplyPlans } from '../../data/supplyPlans';
import { contracts } from '../../data/contracts';
import { payments } from '../../data/payments';
import { suppliers, supplierEvaluations } from '../../data/suppliers';
import { formatCurrency, formatDate, supplyPlanStatusConfig, contractStatusConfig, supplierRatingConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { SupplierEvaluation, SupplierRating, ProcurementContract, SupplyPlan, SupplyPlanStatus, ContractStatus } from '../../types';

const { Title, Text } = Typography;

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');

  // ═══════════════════════════════════════
  // TAB 1: SUMMARY STATS
  // ═══════════════════════════════════════
  const summaryStats = useMemo(() => {
    const totalPlans = supplyPlans.length;
    const totalContracts = contracts.length;
    const totalContractValue = contracts.reduce((s, c) => s + c.totalValue, 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.paymentAmount, 0);
    return { totalPlans, totalContracts, totalContractValue, totalPaid };
  }, []);

  // Pie chart: Phân bổ giá trị theo NCC (from contracts)
  const supplierPieData = useMemo(() => {
    const supplierMap = new Map<string, number>();
    contracts.forEach(c => {
      supplierMap.set(c.supplierName, (supplierMap.get(c.supplierName) || 0) + c.totalValue);
    });
    return Array.from(supplierMap.entries()).map(([type, value]) => ({ type, value }));
  }, []);

  // Column chart: Giá trị HĐ vs Đã thanh toán theo NCC
  const supplierColumnData = useMemo(() => {
    const supplierMap = new Map<string, { contract: number; paid: number }>();
    contracts.forEach(c => {
      const shortName = c.supplierName.length > 18 ? c.supplierName.substring(0, 18) + '...' : c.supplierName;
      const existing = supplierMap.get(shortName) || { contract: 0, paid: 0 };
      existing.contract += c.totalValue;
      existing.paid += c.paidValue;
      supplierMap.set(shortName, existing);
    });
    return Array.from(supplierMap.entries()).flatMap(([supplier, data]) => [
      { supplier, type: 'Giá trị HĐ', value: data.contract },
      { supplier, type: 'Đã thanh toán', value: data.paid },
    ]);
  }, []);

  // Supply plan summary table columns
  const supplyPlanColumns: ColumnsType<SupplyPlan> = [
    {
      title: 'Mã KH', dataIndex: 'code', width: 150,
      render: (t: string) => <Text strong style={{ color: colors.navy }}>{t}</Text>,
    },
    { title: 'Tên kế hoạch', dataIndex: 'title', width: 280 },
    {
      title: 'Dự toán (tr)', dataIndex: 'totalEstimated', width: 120, align: 'right',
      render: (v: number) => <Text strong>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Ngân sách duyệt (tr)', dataIndex: 'approvedBudget', width: 140, align: 'right',
      render: (v: number) => v > 0 ? <Text strong style={{ color: colors.success }}>{formatCurrency(v)}</Text> : <Text type="secondary">Chưa duyệt</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 130, align: 'center',
      render: (s: SupplyPlanStatus) => {
        const cfg = supplyPlanStatusConfig[s];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  // ═══════════════════════════════════════
  // TAB 2: CONTRACT TABLE
  // ═══════════════════════════════════════
  const contractColumns: ColumnsType<ProcurementContract> = [
    {
      title: 'Mã HĐ', dataIndex: 'code', width: 130,
      render: (t: string) => <Text strong style={{ color: colors.navy }}>{t}</Text>,
    },
    { title: 'Nhà cung cấp', dataIndex: 'supplierName', width: 200 },
    {
      title: 'Giá trị (tr)', dataIndex: 'totalValue', width: 110, align: 'right',
      render: (v: number) => <Text strong>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Đã TT (tr)', dataIndex: 'paidValue', width: 110, align: 'right',
      render: (v: number) => <Text style={{ color: v > 0 ? colors.success : colors.textSecondary }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Còn lại (tr)', dataIndex: 'remainingValue', width: 110, align: 'right',
      render: (v: number) => <Text style={{ color: v > 0 ? colors.warning : colors.success }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Tiến độ giao', width: 160,
      render: (_: unknown, record: ProcurementContract) => {
        const percent = record.totalValue > 0 ? Math.round((record.deliveredValue / record.totalValue) * 100) : 0;
        return (
          <Progress
            percent={percent}
            size="small"
            strokeColor={percent >= 100 ? colors.success : percent > 0 ? colors.navy : colors.border}
            format={() => `${percent}%`}
          />
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 130, align: 'center',
      render: (s: ContractStatus) => {
        const cfg = contractStatusConfig[s];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  const contractTotals = useMemo(() => {
    return {
      totalValue: contracts.reduce((s, c) => s + c.totalValue, 0),
      paidValue: contracts.reduce((s, c) => s + c.paidValue, 0),
      remainingValue: contracts.reduce((s, c) => s + c.remainingValue, 0),
      deliveredValue: contracts.reduce((s, c) => s + c.deliveredValue, 0),
    };
  }, []);

  // ═══════════════════════════════════════
  // TAB 3: SUPPLIER EVALUATION
  // ═══════════════════════════════════════
  const evalColumns: ColumnsType<SupplierEvaluation> = [
    { title: 'Nhà cung cấp', dataIndex: 'supplierName', width: 200, render: (t: string) => <Text strong>{t}</Text> },
    {
      title: 'Xếp hạng', dataIndex: 'rating', width: 120, align: 'center',
      render: (r: SupplierRating) => {
        const cfg = supplierRatingConfig[r];
        return <Tag color={cfg.color}>{r} - {cfg.label}</Tag>;
      },
    },
    {
      title: 'Điểm giá', dataIndex: 'priceScore', width: 90, align: 'center',
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: 'Điểm giao hàng', dataIndex: 'deliveryScore', width: 110, align: 'center',
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: 'Điểm CL', dataIndex: 'qualityScore', width: 90, align: 'center',
      render: (v: number) => <Text style={{ color: v >= 95 ? colors.success : v >= 85 ? colors.warning : colors.danger }}>{v}</Text>,
    },
    {
      title: 'Điểm tổng', dataIndex: 'totalScore', width: 100, align: 'center',
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{v}</Text>,
    },
    {
      title: 'Tỷ lệ lỗi', dataIndex: 'defectRate', width: 90, align: 'center',
      render: (v: number) => (
        <Text style={{ color: v <= 5 ? colors.success : v <= 10 ? colors.warning : colors.danger }}>{v}%</Text>
      ),
    },
    {
      title: 'Giao trễ', dataIndex: 'lateDeliveries', width: 80, align: 'center',
      render: (v: number) => v === 0 ? <Tag color="success">0</Tag> : <Tag color="warning">{v} lần</Tag>,
    },
    {
      title: 'Số HĐ', dataIndex: 'totalContracts', width: 70, align: 'center',
    },
  ];

  // Pie data: Phân bổ xếp hạng NCC
  const ratingPieData = useMemo(() => {
    const ratingMap = new Map<string, number>();
    supplierEvaluations.forEach(e => {
      const label = `${e.rating} - ${supplierRatingConfig[e.rating].label}`;
      ratingMap.set(label, (ratingMap.get(label) || 0) + 1);
    });
    return Array.from(ratingMap.entries()).map(([type, value]) => ({ type, value }));
  }, []);

  const ratingColorMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    (['A', 'B', 'C', 'D'] as SupplierRating[]).forEach(r => {
      map[`${r} - ${supplierRatingConfig[r].label}`] = supplierRatingConfig[r].color;
    });
    return map;
  }, []);

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{ padding: 0 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: colors.navy }}>Báo cáo mua sắm</Title>
        <Text type="secondary">Tổng hợp báo cáo, thống kê hoạt động mua sắm vật tư</Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: 'summary',
            label: (
              <Space size={6}>
                <PieChartOutlined />
                <span>Tổng hợp mua sắm</span>
              </Space>
            ),
            children: (
              <div>
                {/* Summary stat cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  {[
                    { title: 'Tổng KH bảo đảm VT', value: summaryStats.totalPlans, suffix: 'kế hoạch', icon: <FileTextOutlined />, gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` },
                    { title: 'Tổng hợp đồng', value: summaryStats.totalContracts, suffix: 'hợp đồng', icon: <ShoppingCartOutlined />, gradient: `linear-gradient(135deg, #0891b2, #22d3ee)` },
                    { title: 'Tổng giá trị HĐ', value: formatCurrency(summaryStats.totalContractValue), icon: <DollarOutlined />, gradient: `linear-gradient(135deg, ${colors.success}, #73d13d)` },
                    { title: 'Đã thanh toán', value: formatCurrency(summaryStats.totalPaid), icon: <CheckCircleOutlined />, gradient: `linear-gradient(135deg, #7c3aed, #a78bfa)` },
                  ].map((card, idx) => (
                    <Col xs={12} sm={12} md={6} key={idx}>
                      <Card className="db-stat-card" styles={{ body: { padding: 20 } }} style={{ background: card.gradient, border: 'none' }}>
                        <div style={{ position: 'relative' }}>
                          <div className="db-bg-icon" style={{
                            position: 'absolute', top: -8, right: -8, fontSize: 64, opacity: 0.1, color: '#fff',
                          }}>
                            {card.icon}
                          </div>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                            color: '#fff', fontSize: 16,
                          }}>
                            {card.icon}
                          </div>
                          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                            {card.value}
                            {card.suffix && <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>{card.suffix}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.title}</div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Charts row */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col xs={24} md={12}>
                    <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 20 } }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        }}>
                          <PieChartOutlined />
                        </span>
                        Phân bổ giá trị theo NCC
                      </div>
                      <Pie
                        {...{
                          data: supplierPieData,
                          angleField: 'value',
                          colorField: 'type',
                          radius: 0.85,
                          innerRadius: 0.55,
                          height: 300,
                          label: {
                            text: 'type',
                            position: 'outside',
                            style: { fontSize: 11 },
                          },
                          tooltip: {
                            title: 'type',
                            items: [{ channel: 'y', valueFormatter: (v: number) => formatCurrency(v) }],
                          },
                          legend: {
                            position: 'bottom',
                          },
                          style: {
                            stroke: '#fff',
                            lineWidth: 2,
                          },
                        } as any}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 20 } }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        }}>
                          <BarChartOutlined />
                        </span>
                        Giá trị hợp đồng vs đã thanh toán theo NCC
                      </div>
                      <Column
                        {...{
                          data: supplierColumnData,
                          xField: 'supplier',
                          yField: 'value',
                          colorField: 'type',
                          group: true,
                          height: 300,
                          axis: {
                            y: { title: 'Triệu đồng' },
                          },
                          tooltip: {
                            items: [{ channel: 'y', valueFormatter: (v: number) => formatCurrency(v) }],
                          },
                          style: {
                            radiusTopLeft: 4,
                            radiusTopRight: 4,
                          },
                        } as any}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Summary table by supply plan */}
                <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 20 } }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `linear-gradient(135deg, ${colors.warning}, #ffc53d)`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      <FileTextOutlined />
                    </span>
                    Tổng hợp theo kế hoạch bảo đảm vật tư
                  </div>
                  <Table
                    dataSource={supplyPlans.map(p => ({ ...p, key: p.id }))}
                    columns={supplyPlanColumns}
                    pagination={false}
                    size="middle"
                    scroll={{ x: 800 }}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <Text strong style={{ color: colors.navy }}>Tổng cộng</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right">
                            <Text strong style={{ color: colors.navy }}>
                              {formatCurrency(supplyPlans.reduce((s, p) => s + p.totalEstimated, 0))}
                            </Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="right">
                            <Text strong style={{ color: colors.success }}>
                              {formatCurrency(supplyPlans.reduce((s, p) => s + p.approvedBudget, 0))}
                            </Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'contracts',
            label: (
              <Space size={6}>
                <ShoppingCartOutlined />
                <span>Theo hợp đồng</span>
              </Space>
            ),
            children: (
              <div>
                <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 20 } }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      <ShoppingCartOutlined />
                    </span>
                    Danh sách hợp đồng mua sắm
                  </div>
                  <Table
                    dataSource={contracts.map(c => ({ ...c, key: c.id }))}
                    columns={contractColumns}
                    pagination={false}
                    size="middle"
                    scroll={{ x: 1000 }}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <Text strong style={{ color: colors.navy }}>Tổng cộng ({contracts.length} hợp đồng)</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right">
                            <Text strong style={{ color: colors.navy }}>{formatCurrency(contractTotals.totalValue)}</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="right">
                            <Text strong style={{ color: colors.success }}>{formatCurrency(contractTotals.paidValue)}</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} align="right">
                            <Text strong style={{ color: colors.warning }}>{formatCurrency(contractTotals.remainingValue)}</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5}>
                            <Progress
                              percent={contractTotals.totalValue > 0 ? Math.round((contractTotals.deliveredValue / contractTotals.totalValue) * 100) : 0}
                              size="small"
                              strokeColor={colors.navy}
                            />
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={6} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'suppliers',
            label: (
              <Space size={6}>
                <TeamOutlined />
                <span>Đánh giá NCC</span>
              </Space>
            ),
            children: (
              <div>
                {/* Supplier evaluation table */}
                <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      <TeamOutlined />
                    </span>
                    Đánh giá nhà cung cấp năm 2025
                  </div>
                  <Table
                    dataSource={supplierEvaluations.map(e => ({ ...e, key: e.supplierId }))}
                    columns={evalColumns}
                    pagination={false}
                    size="middle"
                    scroll={{ x: 1000 }}
                  />
                </Card>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  {/* Pie chart: Rating distribution */}
                  <Col xs={24} md={12}>
                    <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 20 } }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colors.navyDark,
                        }}>
                          <PieChartOutlined />
                        </span>
                        Phân bổ xếp hạng NCC
                      </div>
                      <Pie
                        {...{
                          data: ratingPieData,
                          angleField: 'value',
                          colorField: 'type',
                          radius: 0.85,
                          innerRadius: 0.55,
                          height: 280,
                          color: (datum: any) => ratingColorMap[datum.type] || colors.navy,
                          label: {
                            text: (datum: any) => `${datum.type}: ${datum.value}`,
                            position: 'outside',
                            style: { fontSize: 11 },
                          },
                          tooltip: {
                            title: 'type',
                            items: [{ channel: 'y', valueFormatter: (v: number) => `${v} nhà cung cấp` }],
                          },
                          legend: {
                            position: 'bottom',
                          },
                          style: {
                            stroke: '#fff',
                            lineWidth: 2,
                          },
                        } as any}
                      />
                    </Card>
                  </Col>

                  {/* Rating summary cards */}
                  <Col xs={24} md={12}>
                    <Row gutter={[16, 16]}>
                      {(['A', 'B', 'C', 'D'] as SupplierRating[]).map(rating => {
                        const cfg = supplierRatingConfig[rating];
                        const count = supplierEvaluations.filter(e => e.rating === rating).length;
                        const total = suppliers.filter(s => s.rating === rating).length;
                        const avgScore = supplierEvaluations
                          .filter(e => e.rating === rating)
                          .reduce((s, e) => s + e.totalScore, 0);
                        const avg = count > 0 ? (avgScore / count).toFixed(1) : '-';
                        return (
                          <Col xs={12} key={rating}>
                            <Card size="small" style={{ borderRadius: 14, borderLeft: `4px solid ${cfg.color}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Xếp hạng {rating}</Text>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{cfg.label}</div>
                                  <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                                    Tổng NCC: {total} | Điểm TB: {avg}
                                  </div>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: cfg.color }}>{count}</div>
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>
                </Row>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Reports;
