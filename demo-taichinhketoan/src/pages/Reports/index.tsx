import React, { useMemo } from 'react';
import {
  Card, Table, Typography, Button, Space, Tag, Row, Col, Progress, Divider,
  message,
} from 'antd';
import {
  FileExcelOutlined, FilePdfOutlined, PrinterOutlined,
  BankOutlined, DollarOutlined, FundOutlined, PieChartOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { Column, Pie, DualAxes } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';
import { allocations2026 } from '../../data/allocations';
import { departments, getDepartmentShortName, getDepartmentName } from '../../data/departments';
import { paymentRequests } from '../../data/paymentRequests';
import { monthlySpending2026 } from '../../data/alerts';
import { categoryTypeConfig, formatCurrency, formatNumber, getProgressColor, paymentStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { CategoryType } from '../../types';

const { Title, Text } = Typography;

interface CategoryRow {
  key: string;
  category: string;
  color: string;
  icon: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  count: number;
}

const rptStyles = `
  .rpt-stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .rpt-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15);
  }
  .rpt-stat-card .rpt-bg-icon {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .rpt-stat-card:hover .rpt-bg-icon {
    transform: rotate(15deg) scale(1.1);
  }
  .rpt-section {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .rpt-section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1B3A5C;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  @media print {
    .no-print { display: none !important; }
    .rpt-section { break-inside: avoid; box-shadow: none; border: 1px solid #e8e8e8; }
  }
`;

const Reports: React.FC = () => {
  const { isDepartment, currentUser } = useUser();
  const deptId = currentUser.departmentId;

  // Role-based data
  const baseAllocations = useMemo(() => {
    if (isDepartment) return allocations2026.filter(a => a.departmentId === deptId);
    return allocations2026;
  }, [isDepartment, deptId]);

  const basePayments = useMemo(() => {
    if (isDepartment) return paymentRequests.filter(p => p.departmentId === deptId);
    return paymentRequests;
  }, [isDepartment, deptId]);

  // ═══════════════════════════════════════
  // SUMMARY STATS
  // ═══════════════════════════════════════
  const stats = useMemo(() => {
    const totalAllocated = baseAllocations.reduce((s, a) => s + a.totalAllocated, 0);
    const totalSpent = baseAllocations.reduce((s, a) => s + a.spent, 0);
    const totalCommitted = baseAllocations.reduce((s, a) => s + a.committed, 0);
    const totalRemaining = baseAllocations.reduce((s, a) => s + a.remaining, 0);
    const spentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    const paidAmount = basePayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pendingPayments = basePayments.filter(p => ['submitted', 'reviewing'].includes(p.status)).length;
    return { totalAllocated, totalSpent, totalCommitted, totalRemaining, spentPct, paidAmount, pendingPayments };
  }, [baseAllocations, basePayments]);

  // ═══════════════════════════════════════
  // CATEGORY SUMMARY
  // ═══════════════════════════════════════
  const categorySummary = useMemo<CategoryRow[]>(() => {
    const map = new Map<string, CategoryRow>();
    baseAllocations.forEach((a) => {
      const cfg = categoryTypeConfig[a.categoryType];
      const existing = map.get(a.categoryType);
      if (existing) {
        existing.allocated += a.totalAllocated;
        existing.spent += a.spent;
        existing.committed += a.committed;
        existing.remaining += a.remaining;
        existing.count += 1;
      } else {
        map.set(a.categoryType, {
          key: a.categoryType,
          category: cfg?.label || a.categoryType,
          color: cfg?.color || colors.navy,
          icon: cfg?.icon || '',
          allocated: a.totalAllocated,
          spent: a.spent,
          committed: a.committed,
          remaining: a.remaining,
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [baseAllocations]);

  // Department summary (only for GĐ/TC)
  const deptSummary = useMemo(() => {
    if (isDepartment) return [];
    const map = new Map<string, { dept: string; fullName: string; allocated: number; spent: number; remaining: number }>();
    baseAllocations.forEach(a => {
      const existing = map.get(a.departmentId);
      if (existing) {
        existing.allocated += a.totalAllocated;
        existing.spent += a.spent;
        existing.remaining += a.remaining;
      } else {
        map.set(a.departmentId, {
          dept: getDepartmentShortName(a.departmentId),
          fullName: getDepartmentName(a.departmentId),
          allocated: a.totalAllocated,
          spent: a.spent,
          remaining: a.remaining,
        });
      }
    });
    return Array.from(map.values());
  }, [baseAllocations, isDepartment]);

  // Payment status summary
  const paymentSummary = useMemo(() => {
    const map = new Map<string, { status: string; label: string; color: string; count: number; amount: number }>();
    basePayments.forEach(p => {
      const cfg = paymentStatusConfig[p.status];
      const existing = map.get(p.status);
      if (existing) {
        existing.count += 1;
        existing.amount += p.amount;
      } else {
        map.set(p.status, { status: p.status, label: cfg?.label || p.status, color: cfg?.color || 'default', count: 1, amount: p.amount });
      }
    });
    return Array.from(map.values());
  }, [basePayments]);

  // ═══════════════════════════════════════
  // CHART DATA
  // ═══════════════════════════════════════

  // 1. Pie chart: Budget by category
  const pieData = categorySummary.map(c => ({
    type: c.category,
    value: c.allocated,
  }));

  // 2. Column chart: Spent vs Allocated by category
  const columnData = categorySummary.flatMap(c => [
    { category: c.category, type: 'Phân bổ', value: c.allocated },
    { category: c.category, type: 'Đã chi', value: c.spent },
    { category: c.category, type: 'Cam kết', value: c.committed },
  ]);

  // 3. DualAxes chart: Monthly planned vs actual
  const monthlyData = monthlySpending2026.map(m => ({
    month: m.month,
    'Kế hoạch': m.planned,
    'Thực tế': m.actual || null,
  }));

  // 4. Column chart: Department budget (only GĐ/TC)
  const deptChartData = deptSummary.flatMap(d => [
    { department: d.dept, type: 'Phân bổ', value: d.allocated },
    { department: d.dept, type: 'Đã chi', value: d.spent },
  ]);

  // ═══════════════════════════════════════
  // TABLE COLUMNS
  // ═══════════════════════════════════════
  const categoryColumns: ColumnsType<CategoryRow> = [
    {
      title: 'Hạng mục', dataIndex: 'category', width: 180,
      render: (text: string, r: CategoryRow) => (
        <Space size={6}>
          <span>{r.icon}</span>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    { title: 'Số PB', dataIndex: 'count', width: 70, align: 'center' },
    {
      title: 'Phân bổ (tr)', dataIndex: 'allocated', width: 120, align: 'right',
      render: (v: number) => <Text style={{ color: colors.navy, fontWeight: 600 }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Đã chi (tr)', dataIndex: 'spent', width: 110, align: 'right',
      render: (v: number) => <Text style={{ color: '#059669' }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Cam kết (tr)', dataIndex: 'committed', width: 110, align: 'right',
      render: (v: number) => <Text style={{ color: '#d97706' }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Còn lại (tr)', dataIndex: 'remaining', width: 110, align: 'right',
      render: (v: number, r: CategoryRow) => {
        const pct = Math.round((r.spent / r.allocated) * 100);
        return <Text style={{ color: pct > 80 ? colors.danger : '#2563eb' }}>{formatNumber(v)}</Text>;
      },
    },
    {
      title: '% Sử dụng', width: 130,
      render: (_: unknown, r: CategoryRow) => {
        const pct = Math.round((r.spent / r.allocated) * 100);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={pct} size="small" showInfo={false} strokeColor={getProgressColor(pct)} style={{ flex: 1, margin: 0 }} />
            <Text style={{ fontSize: 12, fontWeight: 600, color: getProgressColor(pct), width: 32 }}>{pct}%</Text>
          </div>
        );
      },
    },
  ];

  // ═══════════════════════════════════════
  // STAT CARDS
  // ═══════════════════════════════════════
  const statCardsData = [
    {
      title: 'Tổng ngân sách',
      value: formatCurrency(stats.totalAllocated),
      icon: <BankOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      suffix: `${baseAllocations.length} hạng mục`,
    },
    {
      title: 'Đã chi',
      value: formatCurrency(stats.totalSpent),
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      suffix: `${stats.spentPct}% ngân sách`,
    },
    {
      title: 'Cam kết chi',
      value: formatCurrency(stats.totalCommitted),
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      suffix: '',
    },
    {
      title: 'ĐNTT đã thanh toán',
      value: formatCurrency(stats.paidAmount),
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      suffix: stats.pendingPayments > 0 ? `${stats.pendingPayments} chờ duyệt` : '',
    },
  ];

  const handleExport = (type: 'excel' | 'pdf') => {
    message.success(`Đang xuất báo cáo ${type === 'excel' ? 'Excel' : 'PDF'}...`);
  };

  return (
    <div>
      <style>{rptStyles}</style>

      {/* Header + Export buttons */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ color: colors.navy, margin: 0 }}>Báo cáo tổng hợp chi phí</Title>
          <Text style={{ fontSize: 12, color: '#999' }}>
            KHCP Năm 2026 {isDepartment ? `— ${getDepartmentName(deptId)}` : '— Toàn viện'}
          </Text>
        </div>
        <Space>
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}
            style={{ borderRadius: 8, color: '#059669', borderColor: '#059669' }}>
            Xuất Excel
          </Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}
            style={{ borderRadius: 8, color: '#dc2626', borderColor: '#dc2626' }}>
            Xuất PDF
          </Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}
            style={{ borderRadius: 8 }}>
            In báo cáo
          </Button>
        </Space>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="rpt-stat-card" style={{
              background: card.gradient,
              borderRadius: 12, padding: '14px 16px 12px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div className="rpt-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
              }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>{card.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {card.value}
                {card.suffix && <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>{card.suffix}</span>}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ═══════════════════════════════════
          SECTION 1: CHARTS ROW
          ═══════════════════════════════════ */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        {/* Pie chart: Cơ cấu ngân sách */}
        <Col xs={24} lg={10}>
          <div className="rpt-section">
            <div className="rpt-section-title">
              <PieChartOutlined /> Cơ cấu ngân sách theo hạng mục
            </div>
            <Pie
              data={pieData}
              angleField="value"
              colorField="type"
              innerRadius={0.55}
              radius={0.85}
              height={300}
              label={{
                text: 'type',
                style: { fontSize: 11 },
                position: 'outside',
              }}
              tooltip={{
                title: 'type',
                items: [{ channel: 'y', valueFormatter: (v: number) => `${formatNumber(v)} triệu` }],
              }}
              legend={{ position: 'bottom', layout: 'horizontal', itemSpacing: 12 }}
              style={{ stroke: '#fff', lineWidth: 2 }}
              annotations={[{
                type: 'text',
                style: {
                  text: `${formatCurrency(stats.totalAllocated)}`,
                  x: '50%', y: '50%',
                  textAlign: 'center',
                  fontSize: 18, fontWeight: 'bold',
                  fill: colors.navy,
                },
              }]}
            />
          </div>
        </Col>

        {/* Column chart: So sánh phân bổ / đã chi / cam kết */}
        <Col xs={24} lg={14}>
          <div className="rpt-section">
            <div className="rpt-section-title">
              <FundOutlined /> Phân bổ vs Thực chi theo hạng mục
            </div>
            <Column
              data={columnData}
              xField="category"
              yField="value"
              colorField="type"
              group
              height={300}
              style={{ maxWidth: 40, radiusTopLeft: 4, radiusTopRight: 4 }}
              scale={{ color: { range: [colors.navy, '#34d399', '#fbbf24'] } }}
              axis={{
                x: { labelAutoRotate: true, labelSpacing: 4, style: { labelFontSize: 11 } },
                y: { title: 'Triệu đồng', labelFormatter: (v: number) => formatNumber(v) },
              }}
              tooltip={{
                items: [{ channel: 'y', valueFormatter: (v: number) => `${formatNumber(v)} tr` }],
              }}
              legend={{ position: 'top-right' }}
            />
          </div>
        </Col>
      </Row>

      {/* ═══════════════════════════════════
          SECTION 2: MONTHLY TREND
          ═══════════════════════════════════ */}
      <div className="rpt-section">
        <div className="rpt-section-title">
          <FundOutlined /> Giải ngân theo tháng — Kế hoạch vs Thực tế (năm 2026)
        </div>
        <DualAxes
          data={monthlyData}
          xField="month"
          height={280}
          children={[
            {
              type: 'interval',
              yField: 'Kế hoạch',
              style: { fill: `${colors.navy}30`, radiusTopLeft: 4, radiusTopRight: 4, maxWidth: 32 },
              axis: { y: { title: 'Triệu đồng', labelFormatter: (v: number) => formatNumber(v) } },
            },
            {
              type: 'line',
              yField: 'Thực tế',
              style: { stroke: '#059669', lineWidth: 2.5 },
              point: { style: { fill: '#059669', r: 4 } },
              axis: { y: false },
            },
          ]}
          tooltip={{
            items: [
              { channel: 'y', name: 'Kế hoạch', valueFormatter: (v: number) => v ? `${formatNumber(v)} tr` : '—' },
              { channel: 'y1', name: 'Thực tế', valueFormatter: (v: number) => v ? `${formatNumber(v)} tr` : 'Chưa có' },
            ],
          }}
          legend={{ position: 'top-right' }}
        />
      </div>

      {/* ═══════════════════════════════════
          SECTION 3: DEPARTMENT CHART (GĐ/TC only)
          ═══════════════════════════════════ */}
      {!isDepartment && (
        <div className="rpt-section">
          <div className="rpt-section-title">
            <BankOutlined /> Ngân sách theo phòng ban
          </div>
          <Column
            data={deptChartData}
            xField="department"
            yField="value"
            colorField="type"
            group
            height={260}
            style={{ maxWidth: 36, radiusTopLeft: 4, radiusTopRight: 4 }}
            scale={{ color: { range: [colors.navyLight, '#34d399'] } }}
            axis={{
              x: { style: { labelFontSize: 11 } },
              y: { title: 'Triệu đồng', labelFormatter: (v: number) => formatNumber(v) },
            }}
            tooltip={{
              items: [{ channel: 'y', valueFormatter: (v: number) => `${formatNumber(v)} tr` }],
            }}
            legend={{ position: 'top-right' }}
          />
        </div>
      )}

      {/* ═══════════════════════════════════
          SECTION 4: SUMMARY TABLE
          ═══════════════════════════════════ */}
      <div className="rpt-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="rpt-section-title" style={{ marginBottom: 0 }}>
            <BankOutlined /> Bảng tổng hợp ngân sách theo hạng mục
          </div>
        </div>
        <Table<CategoryRow>
          columns={categoryColumns}
          dataSource={categorySummary}
          rowKey="key"
          size="small"
          pagination={false}
          bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ background: '#f8fafc' }}>
                <Table.Summary.Cell index={0}>
                  <Text strong style={{ color: colors.navy }}>TỔNG CỘNG</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">
                  <Text strong>{baseAllocations.length}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <Text strong style={{ color: colors.navy }}>{formatNumber(stats.totalAllocated)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text strong style={{ color: '#059669' }}>{formatNumber(stats.totalSpent)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text strong style={{ color: '#d97706' }}>{formatNumber(stats.totalCommitted)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text strong style={{ color: '#2563eb' }}>{formatNumber(stats.totalRemaining)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <Text strong style={{ color: getProgressColor(stats.spentPct) }}>{stats.spentPct}%</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>

      {/* ═══════════════════════════════════
          SECTION 5: PAYMENT STATUS SUMMARY
          ═══════════════════════════════════ */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <div className="rpt-section">
            <div className="rpt-section-title">
              <DollarOutlined /> Tình hình đề nghị thanh toán
            </div>
            <Row gutter={[12, 12]}>
              {paymentSummary.map(ps => (
                <Col xs={12} sm={8} key={ps.status}>
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: ps.status === 'paid' ? '#f0fdf4' : ps.status === 'approved' ? '#eff6ff' : '#f8fafc',
                    textAlign: 'center',
                  }}>
                    <Tag color={ps.color} style={{ fontSize: 11, marginBottom: 6 }}>{ps.label}</Tag>
                    <div style={{ fontSize: 22, fontWeight: 700, color: colors.navy }}>{ps.count}</div>
                    <Text style={{ fontSize: 11, color: '#999' }}>{formatCurrency(ps.amount)}</Text>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Quick stats row */}
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Tổng ĐNTT</Text>
                  <Text strong style={{ fontSize: 18, color: colors.navy }}>{basePayments.length}</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Tổng giá trị</Text>
                  <Text strong style={{ fontSize: 18, color: '#059669' }}>
                    {formatCurrency(basePayments.reduce((s, p) => s + p.amount, 0))}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Tỷ lệ thanh toán</Text>
                  <Text strong style={{ fontSize: 18, color: '#2563eb' }}>
                    {basePayments.length > 0
                      ? Math.round((basePayments.filter(p => p.status === 'paid').length / basePayments.length) * 100)
                      : 0}%
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        {/* Budget usage by department (GĐ/TC only) or Category progress (PB) */}
        <Col xs={24} lg={10}>
          <div className="rpt-section">
            <div className="rpt-section-title">
              <WarningOutlined /> Tỷ lệ sử dụng ngân sách
            </div>
            {(isDepartment ? categorySummary : deptSummary).map((item, idx) => {
              const name = 'category' in item ? (item as CategoryRow).category : (item as typeof deptSummary[0]).dept;
              const allocated = 'allocated' in item ? item.allocated : 0;
              const spent = 'spent' in item ? item.spent : 0;
              const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
              return (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 12 }}>{name}</Text>
                    <Space size={8}>
                      <Text style={{ fontSize: 11, color: '#999' }}>{formatCurrency(spent)}/{formatCurrency(allocated)}</Text>
                      <Text style={{ fontSize: 12, fontWeight: 600, color: getProgressColor(pct) }}>{pct}%</Text>
                    </Space>
                  </div>
                  <Progress percent={pct} size="small" showInfo={false} strokeColor={getProgressColor(pct)} />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>

      {/* Footer note */}
      <div style={{ textAlign: 'center', padding: '16px 0', color: '#bbb', fontSize: 11 }}>
        Báo cáo được tạo tự động từ hệ thống Quản lý TCKT — Doanh nghiệp A · Dữ liệu cập nhật: 01/07/2026
      </div>
    </div>
  );
};

export default Reports;
