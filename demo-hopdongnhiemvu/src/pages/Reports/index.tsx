import React, { useState, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Card, Row, Col, Table, Tag, Progress, Typography, Tabs, Select,
  Button, Space, Tooltip, Statistic, Alert, Badge, Divider, DatePicker,
} from 'antd';
import {
  BarChartOutlined, ProjectOutlined, DollarOutlined, SafetyCertificateOutlined,
  FileExcelOutlined, FilePdfOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, WarningOutlined, ClockCircleOutlined, RiseOutlined,
  FallOutlined, TeamOutlined, AuditOutlined, ReconciliationOutlined,
  InfoCircleOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import {
  factContracts, monthlyTrends, deptWorkloads, costBreakdowns,
  acceptanceQuality, settlementSummaries, dashboardKPI, dataAsOf,
  type FactContract, type DeptWorkload, type CostBreakdown,
  type AcceptanceQuality, type SettlementSummary,
} from '../../data/reports';
import { formatCurrency, formatDate, contractStatusConfig, settlementStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CardTitle = ({ icon, title, gradient }: { icon: React.ReactNode; title: string; gradient?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, fontSize: 15, color: '#fff',
      background: gradient ?? `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{icon}</div>
    <span style={{ fontWeight: 600, color: colors.navy }}>{title}</span>
  </div>
);

const ExportBar = ({ onExcel, onPdf }: { onExcel: () => void; onPdf: () => void }) => (
  <Space size={6}>
    <Button size="small" icon={<FileExcelOutlined />} onClick={onExcel} style={{ color: '#217346', borderColor: '#b7eb8f' }}>Excel</Button>
    <Button size="small" icon={<FilePdfOutlined />} onClick={onPdf} style={{ color: '#c41c1c', borderColor: '#ffccc7' }}>PDF</Button>
  </Space>
);

const VarianceTag = ({ pct, showAbs = false }: { pct: number; showAbs?: boolean }) => {
  const abs = Math.abs(pct);
  const color = pct > 5 ? 'red' : pct > 0 ? 'orange' : pct < -5 ? 'cyan' : 'green';
  const prefix = pct > 0 ? '+' : '';
  return <Tag color={color} style={{ fontSize: 11, fontWeight: 600 }}>{showAbs ? `${abs.toFixed(1)}%` : `${prefix}${pct.toFixed(1)}%`}</Tag>;
};

const DataAsOfBanner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 6,
    background: '#f0f7ff', border: '1px solid #bae0ff',
    fontSize: 12, color: '#096dd9',
  }}>
    <InfoCircleOutlined />
    Dữ liệu tính đến: <strong>{formatDate(dataAsOf)} {dataAsOf.slice(11, 16)}</strong>
    <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>(cập nhật mỗi 15 phút)</Text>
  </div>
);

// ─── BC-01: Tổng hợp hợp đồng ─────────────────────────────────────────────────
const ContractSummaryReport: React.FC<{ contracts: FactContract[] }> = ({ contracts }) => {
  const navigate = useNavigate();
  const data = contracts;

  const overdueCount = data.filter(c => c.daysOverdue > 0).length;
  const behindCount  = data.filter(c => c.progressVariancePct < -10).length;

  const columns: ColumnsType<FactContract> = [
    {
      title: 'Mã HĐ', dataIndex: 'contractCode', width: 130,
      render: (v: string, row) => (
        <Text strong style={{ color: colors.navy, cursor: 'pointer', fontSize: 13 }}
          onClick={() => navigate(`/contracts/${row.contractId}`)}>{v}</Text>
      ),
    },
    { title: 'Tên hợp đồng', dataIndex: 'contractName', ellipsis: true, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Đơn vị', dataIndex: 'partnerUnit', width: 160, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'Giá trị HĐ', dataIndex: 'contractValue', width: 110, sorter: (a, b) => a.contractValue - b.contractValue,
      render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Tiến độ', key: 'progress', width: 160,
      sorter: (a, b) => a.overallProgressPct - b.overallProgressPct,
      render: (_: unknown, row) => {
        const behind = row.progressVariancePct < -10;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11 }}>TH: {row.overallProgressPct}%</Text>
              <Text style={{ fontSize: 11, color: behind ? colors.danger : '#999' }}>KH: {row.expectedProgressPct}%</Text>
            </div>
            <Progress
              percent={row.overallProgressPct}
              size="small" showInfo={false}
              strokeColor={behind ? colors.danger : row.overallProgressPct >= 60 ? colors.success : colors.warning}
            />
          </div>
        );
      },
    },
    {
      title: 'Chênh lệch CP', key: 'cv', width: 110, sorter: (a, b) => a.costVariancePct - b.costVariancePct,
      render: (_: unknown, row) => <VarianceTag pct={row.costVariancePct} />,
    },
    {
      title: 'Trạng thái', dataIndex: 'contractStatus', width: 130,
      filters: Object.entries(contractStatusConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (v, row) => row.contractStatus === v,
      render: (v: string) => { const c = contractStatusConfig[v as keyof typeof contractStatusConfig]; return c ? <Tag color={c.color}>{c.label}</Tag> : <Tag>{v}</Tag>; },
    },
    {
      title: 'Hạn', dataIndex: 'endDate', width: 100,
      render: (v: string, row) => (
        <div>
          <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text>
          {row.daysOverdue > 0 && <div><Tag color="red" style={{ fontSize: 10, margin: 0 }}>Trễ {row.daysOverdue}N</Tag></div>}
        </div>
      ),
    },
  ];

  return (
    <div>
      {(overdueCount > 0 || behindCount > 0) && (
        <Alert
          type="warning" showIcon
          message={`${overdueCount > 0 ? `${overdueCount} hợp đồng quá hạn` : ''}${overdueCount > 0 && behindCount > 0 ? ' · ' : ''}${behindCount > 0 ? `${behindCount} hợp đồng chậm tiến độ >10%` : ''}`}
          style={{ marginBottom: 12, borderRadius: 8 }}
        />
      )}
      <div style={{ display: 'flex', marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>{data.length} hợp đồng</Text>
      </div>
      <Table columns={columns} dataSource={data} rowKey="contractId" size="middle" pagination={false} scroll={{ x: 1000 }}
        rowClassName={row => row.daysOverdue > 0 ? 'ant-table-row-danger' : ''} />
    </div>
  );
};

// ─── BC-02: Tiến độ thực hiện ─────────────────────────────────────────────────
const ProgressReport: React.FC<{ contracts: FactContract[] }> = ({ contracts }) => {
  const navigate = useNavigate();

  const trendData = useMemo(() => {
    const rows: { month: string; value: number; series: string }[] = [];
    monthlyTrends.forEach(m => {
      rows.push({ month: m.month, value: m.plannedProgress, series: 'Kế hoạch' });
      rows.push({ month: m.month, value: m.actualProgress, series: 'Thực tế' });
    });
    return rows;
  }, []);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            title={<CardTitle icon={<BarChartOutlined />} title="Tiến độ tổng thể theo tháng (Kế hoạch vs Thực tế)" />}
          >
            <Line
              data={trendData}
              xField="month" yField="value" colorField="series"
              style={{ height: 220 }}
              axis={{ y: { title: '% Hoàn thành', max: 100 } }}
              point={{ shapeField: 'circle', sizeField: 4 }}
              scale={{ color: { range: [colors.navyLight, colors.success] } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}
            title={<CardTitle icon={<ClockCircleOutlined />} title="HĐ chậm tiến độ" gradient={`linear-gradient(135deg, ${colors.warning}, #ffc53d)`} />}
          >
            {contracts.filter(c => c.progressVariancePct < -5).map(c => (
              <div key={c.contractId} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                onClick={() => navigate(`/contracts/${c.contractId}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 12, color: colors.navy }}>{c.contractCode}</Text>
                  <Tag color="red" style={{ fontSize: 10 }}>{c.progressVariancePct.toFixed(1)}%</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>{c.contractName}</Text>
                <div style={{ marginTop: 4 }}>
                  <Progress percent={c.overallProgressPct} size="small" showInfo={false} strokeColor={colors.danger} />
                  <Text style={{ fontSize: 10, color: '#999' }}>TH {c.overallProgressPct}% / KH {c.expectedProgressPct}%</Text>
                </div>
              </div>
            ))}
            {contracts.filter(c => c.progressVariancePct < -5).length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: colors.success }}>
                <CheckCircleOutlined style={{ fontSize: 24 }} />
                <div style={{ marginTop: 6, fontSize: 13 }}>Tất cả đúng tiến độ</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Per-contract progress table */}
      <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        title={<CardTitle icon={<ProjectOutlined />} title="Tiến độ chi tiết từng hợp đồng" />}
      >
        <Table
          dataSource={contracts} rowKey="contractId" size="middle" pagination={false}
          columns={[
            {
              title: 'Hợp đồng', key: 'hd',
              render: (_: unknown, row) => (
                <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${row.contractId}`)}>
                  <Text strong style={{ fontSize: 13, color: colors.navy }}>{row.contractCode}</Text>
                  <div style={{ fontSize: 12, color: '#666' }}>{row.contractName}</div>
                </div>
              ),
            },
            {
              title: 'Hạng mục', key: 'wbs', width: 100, align: 'center' as const,
              render: (_: unknown, row) => (
                <div style={{ textAlign: 'center' as const }}>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: colors.navy }}>{row.completedWbsCount}/{row.wbsItemCount}</Text>
                  <div style={{ fontSize: 11, color: '#999' }}>hoàn thành</div>
                </div>
              ),
            },
            {
              title: 'Tiến độ TH', key: 'progress', width: 200,
              sorter: (a, b) => a.overallProgressPct - b.overallProgressPct,
              render: (_: unknown, row) => {
                const behind = row.progressVariancePct < -10;
                return (
                  <div>
                    <Progress
                      percent={row.overallProgressPct}
                      strokeColor={behind ? colors.danger : colors.success}
                      format={p => <span style={{ fontSize: 12, fontWeight: 600 }}>{p}%</span>}
                    />
                    <Text style={{ fontSize: 11, color: behind ? colors.danger : '#999' }}>
                      KH: {row.expectedProgressPct}% {behind && <WarningOutlined />}
                    </Text>
                  </div>
                );
              },
            },
            {
              title: 'Lệch TĐ', key: 'pv', width: 100, align: 'center' as const,
              sorter: (a, b) => a.progressVariancePct - b.progressVariancePct,
              render: (_: unknown, row) => <VarianceTag pct={row.progressVariancePct} />,
            },
            {
              title: 'Ngày kết thúc', dataIndex: 'endDate', width: 120,
              render: (v: string, row) => (
                <div>
                  <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text>
                  {row.daysOverdue > 0 && <Tag color="red" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>Trễ {row.daysOverdue}N</Tag>}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

// ─── BC-04: Tổng hợp theo đơn vị ─────────────────────────────────────────────
const DeptWorkloadReport: React.FC = () => {
  const chartData = useMemo(() =>
    deptWorkloads.map(d => [
      { dept: d.orgShort, value: d.completedWorkOrders, type: 'Hoàn thành' },
      { dept: d.orgShort, value: d.activeWorkOrders,    type: 'Đang TH' },
    ]).flat(),
  []);

  const columns: ColumnsType<DeptWorkload> = [
    { title: 'Đơn vị', dataIndex: 'orgName', render: (v: string, row) => <div><Text strong style={{ fontSize: 13 }}>{v}</Text><Tag style={{ marginLeft: 6 }}>{row.orgShort}</Tag></div> },
    { title: 'Phiếu công việc', key: 'wo', width: 130, align: 'center' as const,
      render: (_: unknown, row) => <div style={{ textAlign: 'center' as const }}><Text style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>{row.totalWorkOrders}</Text><div style={{ fontSize: 11, color: '#999' }}>{row.completedWorkOrders} hoàn thành</div></div> },
    { title: 'Tiến độ', key: 'prog', width: 160,
      sorter: (a, b) => a.progressPct - b.progressPct,
      render: (_: unknown, row) => <Progress percent={row.progressPct} strokeColor={row.progressPct >= 60 ? colors.success : colors.warning} /> },
    { title: 'Thực chi', dataIndex: 'actualCost', width: 110, sorter: (a, b) => a.actualCost - b.actualCost,
      render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(v)}</Text> },
    { title: 'Số HĐ tham gia', dataIndex: 'contractCount', width: 120, align: 'center' as const,
      render: (v: number) => <Text style={{ fontSize: 14, fontWeight: 600, color: colors.info }}>{v}</Text> },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            title={<CardTitle icon={<TeamOutlined />} title="Khối lượng công việc theo đơn vị" />}
          >
            <Column
              data={chartData}
              xField="dept" yField="value" colorField="type"
              style={{ height: 220 }}
              stack={true}
              scale={{ color: { range: [colors.success, colors.navyLight] } }}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}
            title={<CardTitle icon={<ThunderboltOutlined />} title="Tải công việc (đang TH)" gradient="linear-gradient(135deg, #7c3aed, #a78bfa)" />}
          >
            {deptWorkloads.map(d => (
              <div key={d.orgId} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>{d.orgShort}</Text>
                  <Text style={{ fontSize: 12 }}>{d.activeWorkOrders} đang TH</Text>
                </div>
                <Progress
                  percent={Math.round((d.activeWorkOrders / Math.max(1, d.totalWorkOrders)) * 100)}
                  size="small" showInfo={false}
                  strokeColor={d.activeWorkOrders >= 5 ? colors.danger : d.activeWorkOrders >= 3 ? colors.warning : colors.success}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        title={<CardTitle icon={<TeamOutlined />} title="Chi tiết theo đơn vị" />}
      >
        <Table columns={columns} dataSource={deptWorkloads} rowKey="orgId" size="middle" pagination={false} />
      </Card>
    </div>
  );
};

// ─── BC-05: Chi phí dự toán vs thực tế ───────────────────────────────────────
const CostVarianceReport: React.FC<{ breakdowns: CostBreakdown[] }> = ({ breakdowns }) => {
  const navigate = useNavigate();

  const barData = useMemo(() => {
    const rows: { contract: string; value: number; type: string }[] = [];
    breakdowns.forEach(c => {
      const label = c.contractCode;
      rows.push({ contract: label, value: c.plannedTotal, type: 'Dự toán' });
      rows.push({ contract: label, value: c.actualTotal,  type: 'Thực chi' });
    });
    return rows;
  }, []);

  const categoryData = useMemo(() => {
    const mat = breakdowns.reduce((s, c) => ({ p: s.p + c.plannedMaterial, a: s.a + c.actualMaterial }), { p: 0, a: 0 });
    const lab = breakdowns.reduce((s, c) => ({ p: s.p + c.plannedLabor,    a: s.a + c.actualLabor    }), { p: 0, a: 0 });
    const eqp = breakdowns.reduce((s, c) => ({ p: s.p + c.plannedEquipment,a: s.a + c.actualEquipment}), { p: 0, a: 0 });
    const ovh = breakdowns.reduce((s, c) => ({ p: s.p + c.plannedOverhead, a: s.a + c.actualOverhead }),  { p: 0, a: 0 });
    return [
      { category: 'Vật tư',      planned: mat.p, actual: mat.a },
      { category: 'Nhân công',   planned: lab.p, actual: lab.a },
      { category: 'Thiết bị',    planned: eqp.p, actual: eqp.a },
      { category: 'CP chung',    planned: ovh.p, actual: ovh.a },
    ];
  }, []);

  const columns: ColumnsType<CostBreakdown> = [
    {
      title: 'Hợp đồng', key: 'hd',
      render: (_: unknown, row) => (
        <Text strong style={{ fontSize: 13, color: colors.navy, cursor: 'pointer' }}
          onClick={() => navigate(`/contracts/${row.contractId}`)}>{row.contractCode}</Text>
      ),
    },
    { title: 'Vật tư (DT/TT)', key: 'mat', width: 130,
      render: (_: unknown, row) => <div><Text style={{ fontSize: 12 }}>{formatCurrency(row.plannedMaterial)}</Text><span style={{ color: '#999', margin: '0 4px' }}>/</span><Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(row.actualMaterial)}</Text></div> },
    { title: 'Nhân công (DT/TT)', key: 'lab', width: 130,
      render: (_: unknown, row) => <div><Text style={{ fontSize: 12 }}>{formatCurrency(row.plannedLabor)}</Text><span style={{ color: '#999', margin: '0 4px' }}>/</span><Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(row.actualLabor)}</Text></div> },
    { title: 'Thiết bị (DT/TT)', key: 'eqp', width: 130,
      render: (_: unknown, row) => <div><Text style={{ fontSize: 12 }}>{formatCurrency(row.plannedEquipment)}</Text><span style={{ color: '#999', margin: '0 4px' }}>/</span><Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(row.actualEquipment)}</Text></div> },
    { title: 'Tổng DT', dataIndex: 'plannedTotal', width: 100, sorter: (a, b) => a.plannedTotal - b.plannedTotal,
      render: (v: number) => <Text style={{ fontSize: 12 }}>{formatCurrency(v)}</Text> },
    { title: 'Tổng TT', dataIndex: 'actualTotal', width: 100, sorter: (a, b) => a.actualTotal - b.actualTotal,
      render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(v)}</Text> },
    { title: 'Chênh lệch', key: 'var', width: 110, sorter: (a, b) => a.variancePct - b.variancePct,
      render: (_: unknown, row) => (
        <div>
          <Text style={{ fontSize: 12, color: row.variancePct > 0 ? colors.danger : colors.success }}>
            {row.varianceTotal > 0 ? '+' : ''}{formatCurrency(row.varianceTotal)}
          </Text>
          <div style={{ marginTop: 2 }}><VarianceTag pct={row.variancePct} /></div>
        </div>
      ) },
  ];

  const totalPlanned = breakdowns.reduce((s, c) => s + c.plannedTotal, 0);
  const totalActual  = breakdowns.reduce((s, c) => s + c.actualTotal,  0);

  return (
    <div>
      {/* Summary KPIs */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { title: 'Tổng dự toán', value: totalPlanned, color: colors.navy },
          { title: 'Tổng thực chi', value: totalActual, color: totalActual > totalPlanned ? colors.danger : colors.success },
          { title: 'Chênh lệch', value: totalActual - totalPlanned, color: (totalActual - totalPlanned) > 0 ? colors.danger : colors.success },
        ].map((item, idx) => (
          <Col span={8} key={idx}>
            <Card bordered={false} style={{ borderRadius: 8, background: '#f5f7fa' }} styles={{ body: { padding: '12px 16px' } }}>
              <Statistic title={item.title} value={Math.abs(item.value)} suffix="tr"
                prefix={item.value < 0 ? '-' : item.title === 'Chênh lệch' && item.value > 0 ? '+' : ''}
                valueStyle={{ fontSize: 20, fontWeight: 700, color: item.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            title={<CardTitle icon={<DollarOutlined />} title="Dự toán vs Thực chi theo hợp đồng" gradient={`linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`} />}
          >
            <Column
              data={barData}
              xField="contract" yField="value" colorField="type"
              style={{ height: 220 }}
              group={true}
              scale={{ color: { range: [colors.navyLight, colors.warning] } }}
              axis={{ y: { title: 'Triệu đồng' } }}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}
            title={<CardTitle icon={<BarChartOutlined />} title="Cơ cấu chi phí thực tế" />}
          >
            {categoryData.map(cat => (
              <div key={cat.category} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 12 }}>{cat.category}</Text>
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>DT {formatCurrency(cat.planned)}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>TT {formatCurrency(cat.actual)}</Text>
                    {cat.actual > cat.planned
                      ? <RiseOutlined style={{ color: colors.danger, fontSize: 11 }} />
                      : <FallOutlined style={{ color: colors.success, fontSize: 11 }} />}
                  </Space>
                </div>
                <Progress percent={Math.round((cat.actual / Math.max(1, cat.planned)) * 100)} size="small" showInfo={false}
                  strokeColor={cat.actual > cat.planned ? colors.danger : colors.success}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        title={<CardTitle icon={<DollarOutlined />} title="Chi tiết chi phí theo hợp đồng" gradient={`linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`} />}
      >
        <Table
          columns={columns} dataSource={breakdowns} rowKey="contractId" size="small" pagination={false} scroll={{ x: 900 }}
          summary={rows => {
            const sP = rows.reduce((s, r) => s + r.plannedTotal, 0);
            const sA = rows.reduce((s, r) => s + r.actualTotal, 0);
            return (
              <Table.Summary.Row style={{ background: '#f5f7fa', fontWeight: 600 }}>
                <Table.Summary.Cell index={0}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={3} />
                <Table.Summary.Cell index={4}><Text strong style={{ fontSize: 12 }}>{formatCurrency(sP)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={5}><Text strong style={{ fontSize: 12 }}>{formatCurrency(sA)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <Text strong style={{ fontSize: 12, color: (sA - sP) > 0 ? colors.danger : colors.success }}>
                    {(sA - sP) > 0 ? '+' : ''}{formatCurrency(sA - sP)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

// ─── BC-07: Nghiệm thu & Chất lượng ──────────────────────────────────────────
const AcceptanceReport: React.FC<{ quality: AcceptanceQuality[] }> = ({ quality }) => {
  const navigate = useNavigate();

  const pieData = useMemo(() => {
    const totals = quality.reduce((s, a) => ({
      passed: s.passed + a.passedCount,
      failed: s.failed + a.failedCount,
      conditional: s.conditional + a.conditionalCount,
      pending: s.pending + a.pendingCount,
    }), { passed: 0, failed: 0, conditional: 0, pending: 0 });
    return [
      { type: 'Đạt',             value: totals.passed,      color: colors.success },
      { type: 'Không đạt',       value: totals.failed,      color: colors.danger  },
      { type: 'Đạt có ĐK',       value: totals.conditional, color: colors.warning },
      { type: 'Chờ kết quả',     value: totals.pending,     color: '#999'         },
    ].filter(d => d.value > 0);
  }, []);

  const totalAcc = quality.reduce((s, a) => s + a.totalAcceptances, 0);
  const totalPassed = quality.reduce((s, a) => s + a.passedCount, 0);
  const avgFPY = quality.length > 0 ? Math.round(quality.reduce((s, a) => s + a.firstPassYield, 0) / quality.length) : 0;

  const columns: ColumnsType<AcceptanceQuality> = [
    { title: 'Hợp đồng', key: 'hd', render: (_: unknown, row) => (
      <Text strong style={{ fontSize: 13, color: colors.navy, cursor: 'pointer' }}
        onClick={() => navigate(`/contracts/${row.contractId}`)}>{row.contractCode}</Text>
    )},
    { title: 'Tên', dataIndex: 'contractName', ellipsis: true, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Tổng NT', dataIndex: 'totalAcceptances', width: 80, align: 'center' as const,
      render: (v: number) => <Text style={{ fontSize: 14, fontWeight: 700, color: colors.navy }}>{v}</Text> },
    { title: 'Đạt / Không đạt', key: 'result', width: 130, align: 'center' as const,
      render: (_: unknown, row) => (
        <Space size={4}>
          <Tag color="green">{row.passedCount}</Tag>
          <Tag color="red">{row.failedCount}</Tag>
          {row.conditionalCount > 0 && <Tag color="orange">{row.conditionalCount}</Tag>}
        </Space>
      )},
    { title: 'Tỷ lệ NT lần đầu', dataIndex: 'firstPassYield', width: 140, sorter: (a, b) => a.firstPassYield - b.firstPassYield,
      render: (v: number) => (
        <div>
          <Progress percent={v} size="small" strokeColor={v >= 80 ? colors.success : v >= 60 ? colors.warning : colors.danger}
            format={p => <span style={{ fontSize: 11 }}>{p}%</span>} />
        </div>
      )},
    { title: 'Số lần NT', dataIndex: 'avgCyclesToPass', width: 90, align: 'center' as const,
      render: (v: number) => <Tag color={v <= 1 ? 'green' : v <= 1.5 ? 'orange' : 'red'} style={{ fontWeight: 600 }}>{v.toFixed(1)}</Tag> },
    { title: 'TB ngày NT đạt', dataIndex: 'avgDaysToPass', width: 115, align: 'center' as const,
      render: (v: number) => <Text style={{ fontSize: 12 }}>{v} ngày</Text> },
    { title: 'Lỗi mở', dataIndex: 'openDefects', width: 80, align: 'center' as const,
      render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : <CheckCircleOutlined style={{ color: colors.success }} /> },
  ];

  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { title: 'Tổng nghiệm thu', value: totalAcc, suffix: 'phiếu', color: colors.navy },
          { title: 'Đã đạt', value: totalPassed, suffix: 'phiếu', color: colors.success },
          { title: 'Tỷ lệ NT lần đầu', value: avgFPY, suffix: '%', color: avgFPY >= 80 ? colors.success : colors.warning },
        ].map((item, idx) => (
          <Col span={8} key={idx}>
            <Card bordered={false} style={{ borderRadius: 8, background: '#f5f7fa' }} styles={{ body: { padding: '12px 16px' } }}>
              <Statistic title={item.title} value={item.value} suffix={item.suffix}
                valueStyle={{ fontSize: 20, fontWeight: 700, color: item.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            title={<CardTitle icon={<SafetyCertificateOutlined />} title="Phân bố kết quả NT" gradient={`linear-gradient(135deg, ${colors.success}, #73d13d)`} />}
          >
            <Pie data={pieData} angleField="value" colorField="type"
              style={{ height: 200 }}
              scale={{ color: { range: [colors.success, colors.danger, colors.warning, '#999'] } }}
              label={{ text: 'value', style: { fontSize: 12 } }}
              legend={{ position: 'bottom' }}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}
            title={<CardTitle icon={<BarChartOutlined />} title="Tỷ lệ NT đạt lần đầu theo tháng" />}
          >
            <Column
              data={monthlyTrends.map(m => ({ month: m.month, value: m.firstPassYield, type: 'Tỷ lệ NT lần đầu (%)' }))}
              xField="month" yField="value"
              style={{ height: 200 }}
              axis={{ y: { title: 'Tỷ lệ NT lần đầu (%)', max: 100 } }}
              scale={{ color: { range: [colors.success] } }}
              label={{ text: 'value', style: { fontSize: 12 } }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        title={<CardTitle icon={<SafetyCertificateOutlined />} title="Chi tiết nghiệm thu theo hợp đồng" gradient={`linear-gradient(135deg, ${colors.success}, #73d13d)`} />}
      >
        <Table columns={columns} dataSource={quality} rowKey="contractId" size="middle" pagination={false} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

// ─── BC-08: Quyết toán tổng hợp ──────────────────────────────────────────────
const SettlementReport: React.FC<{ summaries: SettlementSummary[] }> = ({ summaries }) => {
  const navigate = useNavigate();

  const barData = useMemo(() => summaries.flatMap(s => ([
    { contract: s.contractCode, value: s.contractValue, type: 'Giá trị HĐ' },
    { contract: s.contractCode, value: s.actualCost,    type: 'Thực chi'   },
    { contract: s.contractCode, value: s.grossProfit,   type: 'Lợi nhuận'  },
  ])), []);

  const columns: ColumnsType<SettlementSummary> = [
    { title: 'Mã QT', dataIndex: 'settlementCode', width: 130,
      render: (v: string) => <Text strong style={{ fontSize: 13, color: colors.navy }}>{v}</Text> },
    { title: 'Hợp đồng', key: 'hd', render: (_: unknown, row) => (
      <Text style={{ fontSize: 13, color: colors.navy, cursor: 'pointer' }}
        onClick={() => navigate(`/contracts/${row.contractId}`)}>{row.contractCode} — {row.contractName}</Text>
    )},
    { title: 'Giá trị HĐ', dataIndex: 'contractValue', width: 110, render: (v: number) => <Text style={{ fontSize: 12 }}>{formatCurrency(v)}</Text> },
    { title: 'Dự toán',    dataIndex: 'plannedCost',    width: 100, render: (v: number) => <Text style={{ fontSize: 12 }}>{formatCurrency(v)}</Text> },
    { title: 'Thực chi',   dataIndex: 'actualCost',     width: 100, render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(v)}</Text> },
    { title: 'Chênh lệch', key: 'var', width: 110, render: (_: unknown, row) => (
      <div>
        <Text style={{ fontSize: 12, color: row.costVariance > 0 ? colors.danger : colors.success }}>
          {row.costVariance > 0 ? '+' : ''}{formatCurrency(row.costVariance)}
        </Text>
        <div style={{ marginTop: 2 }}><VarianceTag pct={row.costVariancePct} /></div>
      </div>
    )},
    { title: 'Lợi nhuận', dataIndex: 'grossProfit', width: 100, render: (v: number) => (
      <Text style={{ fontSize: 12, fontWeight: 600, color: v >= 0 ? colors.success : colors.danger }}>{formatCurrency(v)}</Text>
    )},
    { title: 'Tỷ suất LN', dataIndex: 'profitMarginPct', width: 100,
      render: (v: number) => <Tag color={v >= 15 ? 'green' : v >= 5 ? 'blue' : 'orange'} style={{ fontWeight: 600 }}>{v.toFixed(1)}%</Tag> },
    { title: 'Trạng thái', dataIndex: 'settlementStatus', width: 120,
      render: (v: string) => { const c = settlementStatusConfig[v as keyof typeof settlementStatusConfig]; return c ? <Tag color={c.color}>{c.label}</Tag> : <Tag>{v}</Tag>; } },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            title={<CardTitle icon={<ReconciliationOutlined />} title="Giá trị HĐ / Thực chi / Lợi nhuận" />}
          >
            <Column
              data={barData}
              xField="contract" yField="value" colorField="type"
              style={{ height: 220 }}
              group={true}
              scale={{ color: { range: [colors.navy, colors.warning, colors.success] } }}
              axis={{ y: { title: 'Triệu đồng' } }}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}
            title={<CardTitle icon={<AuditOutlined />} title="Tóm tắt quyết toán" />}
          >
            {[
              { label: 'Tổng giá trị HĐ',  val: summaries.reduce((s, r) => s + r.contractValue, 0), color: colors.navy },
              { label: 'Tổng thực chi',     val: summaries.reduce((s, r) => s + r.actualCost, 0),    color: colors.warning },
              { label: 'Tổng lợi nhuận',    val: summaries.reduce((s, r) => s + r.grossProfit, 0),   color: colors.success },
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color, marginTop: 2 }}>{formatCurrency(item.val)}</div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        title={<CardTitle icon={<ReconciliationOutlined />} title="Chi tiết quyết toán" />}
      >
        <Table columns={columns} dataSource={summaries} rowKey="contractId" size="middle" pagination={false} scroll={{ x: 1000 }} />
      </Card>
    </div>
  );
};

// ─── Main Reports page ────────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleResetFilter = () => {
    setFilterStatus('all');
    setFilterDateRange(null);
  };

  // ─── Global filtered data ─────────────────────────────────────────────────
  const filteredContracts = useMemo(() => {
    let result = factContracts;
    if (filterStatus !== 'all') {
      result = result.filter(c => c.contractStatus === filterStatus);
    }
    if (filterDateRange) {
      const [from, to] = filterDateRange;
      result = result.filter(c => {
        const d = dayjs(c.signedDate);
        return (d.isAfter(from, 'day') || d.isSame(from, 'day')) &&
               (d.isBefore(to, 'day') || d.isSame(to, 'day'));
      });
    }
    return result;
  }, [filterStatus, filterDateRange]);

  const filteredIds = useMemo(
    () => new Set(filteredContracts.map(c => c.contractId)),
    [filteredContracts],
  );

  const filteredCostBreakdowns      = useMemo(() => costBreakdowns.filter(c => filteredIds.has(c.contractId)),    [filteredIds]);
  const filteredAcceptanceQuality   = useMemo(() => acceptanceQuality.filter(c => filteredIds.has(c.contractId)), [filteredIds]);
  const filteredSettlementSummaries = useMemo(() => settlementSummaries.filter(c => filteredIds.has(c.contractId)),[filteredIds]);

  const isFiltered = filterStatus !== 'all' || filterDateRange !== null;

  // Overall KPIs
  const kpi = dashboardKPI;

  const kpiCards = [
    {
      title: 'HĐ đang thực hiện', value: kpi.activeContracts.toString(), suffix: 'HĐ',
      icon: <ProjectOutlined />, gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
    },
    {
      title: 'Tiến độ tổng thể', value: kpi.avgProgressPct.toString(), suffix: '%',
      icon: <BarChartOutlined />, gradient: `linear-gradient(135deg, ${colors.info} 0%, #69b1ff 100%)`,
    },
    {
      title: 'HĐ quá hạn / chậm', value: `${kpi.overdueContracts}/${kpi.contractsBehindSchedule}`, suffix: '',
      icon: <ExclamationCircleOutlined />, gradient: `linear-gradient(135deg, ${colors.warning} 0%, #ffc53d 100%)`,
    },
    {
      title: 'Tổng thực chi', value: formatCurrency(kpi.totalActualCost), suffix: '',
      icon: <DollarOutlined />, gradient: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
      light: true,
    },
    {
      title: 'Tỷ lệ NT lần đầu', value: kpi.overallFirstPassYield.toString(), suffix: '%',
      icon: <SafetyCertificateOutlined />, gradient: `linear-gradient(135deg, ${colors.success} 0%, #73d13d 100%)`,
    },
  ];

  const tabItems = useMemo(() => [
    {
      key: 'contract',
      label: <span><ProjectOutlined style={{ marginRight: 4 }} />BC-01 · Tổng hợp HĐ</span>,
      children: <ContractSummaryReport contracts={filteredContracts} />,
    },
    {
      key: 'progress',
      label: <span><BarChartOutlined style={{ marginRight: 4 }} />BC-02 · Tiến độ</span>,
      children: <ProgressReport contracts={filteredContracts} />,
    },
    {
      key: 'dept',
      label: <span><TeamOutlined style={{ marginRight: 4 }} />BC-03 · Đơn vị TH</span>,
      children: <DeptWorkloadReport />,
    },
    {
      key: 'cost',
      label: <span><DollarOutlined style={{ marginRight: 4 }} />BC-04 · Chi phí</span>,
      children: <CostVarianceReport breakdowns={filteredCostBreakdowns} />,
    },
    {
      key: 'acceptance',
      label: <span><SafetyCertificateOutlined style={{ marginRight: 4 }} />BC-05 · Nghiệm thu</span>,
      children: <AcceptanceReport quality={filteredAcceptanceQuality} />,
    },
    {
      key: 'settlement',
      label: <span><ReconciliationOutlined style={{ marginRight: 4 }} />BC-06 · Quyết toán</span>,
      children: <SettlementReport summaries={filteredSettlementSummaries} />,
    },
  ], [filteredContracts, filteredCostBreakdowns, filteredAcceptanceQuality, filteredSettlementSummaries]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <BarChartOutlined style={{ marginRight: 8 }} />Báo cáo & Phân tích
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tổng hợp hợp đồng · tiến độ · chi phí · nghiệm thu · quyết toán
          </Text>
        </div>
        <Space>
          <DataAsOfBanner />
          <Button icon={<ReloadOutlined spin={refreshing} />} loading={refreshing} onClick={handleRefresh}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[10, 10]} style={{ marginBottom: 20 }}>
        {kpiCards.map((card, idx) => (
          <Col flex="1" key={idx} style={{ minWidth: 0 }}>
            <div style={{
              background: card.gradient, borderRadius: 10, padding: '10px 14px 9px',
              position: 'relative', overflow: 'hidden', height: '100%',
            }}>
              <div style={{
                position: 'absolute', top: -6, right: -6, fontSize: 48, opacity: 0.1,
                color: card.light ? colors.navyDark : '#fff', lineHeight: 1,
              }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: 'rgba(255,255,255,0.22)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: card.light ? colors.navyDark : '#fff', fontSize: 12,
                }}>
                  {card.icon}
                </div>
                <div style={{ color: card.light ? 'rgba(10,22,40,0.6)' : 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 500, lineHeight: '14px' }}>
                  {card.title}
                </div>
              </div>
              <div style={{ color: card.light ? colors.navyDark : '#fff', fontSize: 20, fontWeight: 700, lineHeight: '24px' }}>
                {card.value}
                {card.suffix && <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.75, marginLeft: 3 }}>{card.suffix}</span>}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Global Filter Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginBottom: 14, padding: '10px 16px',
        background: '#f5f7fa', borderRadius: 10,
        border: isFiltered ? `1px solid ${colors.navyLight}` : '1px solid #e8e8e8',
      }}>
        <Text style={{ fontSize: 12, fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap' }}>
          Bộ lọc chung:
        </Text>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          size="small"
          style={{ width: 190 }}
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            ...Object.entries(contractStatusConfig).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
        <RangePicker
          size="small"
          placeholder={['Ngày ký từ', 'Đến ngày']}
          style={{ width: 230 }}
          value={filterDateRange}
          onChange={dates => setFilterDateRange(dates as [Dayjs, Dayjs] | null)}
          format="DD/MM/YYYY"
        />
        {isFiltered && (
          <Button size="small" onClick={handleResetFilter}>Xóa bộ lọc</Button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {isFiltered
              ? <><Badge status="processing" />{filteredContracts.length}/{factContracts.length} hợp đồng</>
              : <>{factContracts.length} hợp đồng</>
            }
          </Text>
          <Divider type="vertical" style={{ margin: 0 }} />
          <ExportBar onExcel={() => {}} onPdf={() => {}} />
        </div>
      </div>

      {/* Report Tabs */}
      <Card
        bordered={false}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { paddingTop: 0 } }}
      >
        <Tabs
          items={tabItems}
          tabBarStyle={{ marginBottom: 16, paddingTop: 4 }}
          destroyInactiveTabPane={false}
        />
      </Card>
    </div>
  );
};

export default Reports;
