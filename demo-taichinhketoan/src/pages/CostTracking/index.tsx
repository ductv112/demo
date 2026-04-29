import React, { useState, useMemo } from 'react';
import {
  Card, Tabs, Typography, Select, Space, Progress, Alert as AntAlert,
  Row, Col, Tag, Empty,
} from 'antd';
import {
  FilterOutlined, WarningOutlined, FundOutlined, DollarOutlined,
  ClockCircleOutlined, BankOutlined,
  PieChartOutlined, BarChartOutlined, CalendarOutlined, TeamOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { allocations2026 } from '../../data/allocations';
import { departments, getDepartmentShortName, getDepartmentName } from '../../data/departments';
import { categoryTypeConfig, getProgressColor, formatCurrency, formatNumber } from '../../utils/format';
import { tasks2026 } from '../../data/tasks';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { BudgetAllocation, CategoryType } from '../../types';

const { Title, Text } = Typography;

interface DepartmentAggregate {
  departmentId: string;
  shortName: string;
  fullName: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  taskCount: number;
}

interface CategoryAggregate {
  categoryType: CategoryType;
  categoryId: string;
  label: string;
  color: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  deptCount: number;
  departments: { departmentId: string; shortName: string; allocated: number; spent: number; remaining: number }[];
}

const ctStyles = `
  .ct-stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .ct-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15);
  }
  .ct-stat-card .ct-bg-icon {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ct-stat-card:hover .ct-bg-icon {
    transform: rotate(15deg) scale(1.1);
  }
  .ct-task-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.25s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    cursor: pointer;
    border: none;
  }
  .ct-task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27, 58, 92, 0.12);
  }
  .ct-dept-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.25s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border: none;
  }
  .ct-dept-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27, 58, 92, 0.12);
  }
  .ct-quarter-card {
    background: #fff;
    border-radius: 10px;
    transition: all 0.25s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border: none;
  }
  .ct-quarter-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27, 58, 92, 0.12);
  }
`;

const CostTracking: React.FC = () => {
  const { currentUser, isDepartment, isFinance, isDirector } = useUser();
  const deptId = currentUser.departmentId;
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<CategoryType | undefined>(undefined);

  // Role-based data: PB chỉ xem phòng mình
  const baseData = useMemo(() => {
    if (isDepartment) return allocations2026.filter(a => a.departmentId === deptId);
    return allocations2026;
  }, [isDepartment, deptId]);

  const filteredData = useMemo(() => {
    let result = baseData;
    if (departmentFilter) result = result.filter((r) => r.departmentId === departmentFilter);
    if (categoryTypeFilter) result = result.filter((r) => r.categoryType === categoryTypeFilter);
    return result;
  }, [baseData, departmentFilter, categoryTypeFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const totalAllocated = baseData.reduce((s, a) => s + a.totalAllocated, 0);
    const totalSpent = baseData.reduce((s, a) => s + a.spent, 0);
    const totalCommitted = baseData.reduce((s, a) => s + a.committed, 0);
    const totalRemaining = baseData.reduce((s, a) => s + a.remaining, 0);
    const issueCount = baseData.filter(a => (a.spent / a.totalAllocated) * 100 > 80).length;
    const spentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    return { totalAllocated, totalSpent, totalCommitted, totalRemaining, issueCount, spentPct };
  }, [baseData]);

  const departmentAggregates = useMemo<DepartmentAggregate[]>(() => {
    const map = new Map<string, DepartmentAggregate>();
    baseData.forEach((a) => {
      const existing = map.get(a.departmentId);
      if (existing) {
        existing.allocated += a.totalAllocated;
        existing.spent += a.spent;
        existing.committed += a.committed;
        existing.remaining += a.remaining;
        existing.taskCount += 1;
      } else {
        map.set(a.departmentId, {
          departmentId: a.departmentId,
          shortName: getDepartmentShortName(a.departmentId),
          fullName: getDepartmentName(a.departmentId),
          allocated: a.totalAllocated,
          spent: a.spent,
          committed: a.committed,
          remaining: a.remaining,
          taskCount: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [baseData]);

  // Gom theo hạng mục chi phí (categoryType) — mỗi hạng mục 1 dòng duy nhất
  const categoryAggregates = useMemo<CategoryAggregate[]>(() => {
    const map = new Map<string, CategoryAggregate>();
    filteredData.forEach((a) => {
      const typeCfg = categoryTypeConfig[a.categoryType];
      const existing = map.get(a.categoryType);
      const deptInfo = { departmentId: a.departmentId, shortName: getDepartmentShortName(a.departmentId), allocated: a.totalAllocated, spent: a.spent, remaining: a.remaining };
      if (existing) {
        existing.allocated += a.totalAllocated;
        existing.spent += a.spent;
        existing.committed += a.committed;
        existing.remaining += a.remaining;
        existing.deptCount += 1;
        existing.departments.push(deptInfo);
      } else {
        map.set(a.categoryType, {
          categoryType: a.categoryType,
          categoryId: a.categoryId,
          label: typeCfg?.label || a.categoryType,
          color: typeCfg?.color || colors.navy,
          allocated: a.totalAllocated,
          spent: a.spent,
          committed: a.committed,
          remaining: a.remaining,
          deptCount: 1,
          departments: [deptInfo],
        });
      }
    });
    return Array.from(map.values());
  }, [filteredData]);

  const hasIssue = (r: BudgetAllocation) => ((r.spent / r.totalAllocated) * 100) > 80;

  // Available departments for filter (only departments with data)
  const availableDepts = useMemo(() => {
    const ids = new Set(baseData.map(a => a.departmentId));
    return departments.filter(d => ids.has(d.id));
  }, [baseData]);

  // ═══════════════════════════════════════════════════════════
  // STAT CARDS
  // ═══════════════════════════════════════════════════════════
  const statCardsData = [
    {
      title: 'Tổng ngân sách',
      value: formatCurrency(stats.totalAllocated),
      icon: <BankOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      suffix: '',
    },
    {
      title: 'Đã chi',
      value: formatCurrency(stats.totalSpent),
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      suffix: `${stats.spentPct}%`,
    },
    {
      title: 'Cam kết chi',
      value: formatCurrency(stats.totalCommitted),
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      suffix: '',
    },
    {
      title: 'Còn lại',
      value: formatCurrency(stats.totalRemaining),
      icon: <FundOutlined />,
      gradient: stats.issueCount > 0
        ? 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)'
        : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      suffix: stats.issueCount > 0 ? `${stats.issueCount} cảnh báo` : '',
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // TAB 1: THEO HẠNG MỤC (gom theo categoryType, mỗi HM 1 card)
  // ═══════════════════════════════════════════════════════════
  const issueCategories = categoryAggregates.filter(c => (c.spent / c.allocated) * 100 > 80);
  const categoryTab = (
    <div>
      {issueCategories.length > 0 && (
        <AntAlert
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
          message={`${issueCategories.length} hạng mục chi phí có tỷ lệ chi > 80% ngân sách — cần theo dõi sát`}
        />
      )}

      {categoryAggregates.length === 0 ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        <Row gutter={[16, 16]}>
          {categoryAggregates.map(cat => {
            const spentPct = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
            const commitPct = cat.allocated > 0 ? Math.round(((cat.spent + cat.committed) / cat.allocated) * 100) : 0;
            const issue = spentPct > 80;
            const typeCfg = categoryTypeConfig[cat.categoryType];

            return (
              <Col xs={24} lg={12} key={cat.categoryType}>
                <div className="ct-task-card"
                  style={{
                    borderLeft: `4px solid ${issue ? colors.danger : cat.color}`,
                  }}>
                  <div style={{ padding: '16px 18px' }}>
                    {/* Header: Icon + Category name + Warning */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: `${cat.color}15`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 18,
                        }}>
                          {typeCfg?.icon}
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 16, color: colors.navy, display: 'block', lineHeight: '22px' }}>
                            {cat.label}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#999' }}>
                            {cat.deptCount} phòng ban tham gia
                          </Text>
                        </div>
                      </div>
                      {issue && (
                        <Tag color="error" style={{ fontSize: 10, margin: 0, fontWeight: 500 }}>
                          <WarningOutlined style={{ marginRight: 2 }} /> Vượt 80%
                        </Tag>
                      )}
                    </div>

                    {/* Budget breakdown grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phân bổ</Text>
                        <Text strong style={{ fontSize: 13, color: colors.navy }}>{formatCurrency(cat.allocated)}</Text>
                      </div>
                      <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Đã chi</Text>
                        <Text strong style={{ fontSize: 13, color: '#059669' }}>{formatCurrency(cat.spent)}</Text>
                      </div>
                      <div style={{ padding: '8px 10px', background: '#fffbeb', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Cam kết</Text>
                        <Text strong style={{ fontSize: 13, color: '#d97706' }}>{formatCurrency(cat.committed)}</Text>
                      </div>
                      <div style={{ padding: '8px 10px', background: issue ? '#fef2f2' : '#eff6ff', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Còn lại</Text>
                        <Text strong style={{ fontSize: 13, color: issue ? colors.danger : '#2563eb' }}>{formatCurrency(cat.remaining)}</Text>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 10, color: '#999' }}>Đã chi</Text>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: getProgressColor(spentPct) }}>{spentPct}%</Text>
                      </div>
                      <Progress percent={spentPct} size="small" showInfo={false} strokeColor={getProgressColor(spentPct)} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, marginBottom: 2 }}>
                        <Text style={{ fontSize: 10, color: '#999' }}>Cam kết + Đã chi</Text>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: getProgressColor(commitPct) }}>{commitPct}%</Text>
                      </div>
                      <Progress percent={commitPct} size="small" showInfo={false}
                        strokeColor={{ '0%': '#d97706', '100%': '#f59e0b' }}
                      />
                    </div>

                    {/* Department breakdown (chỉ hiện cho GĐ & TC) */}
                    {!isDepartment && cat.departments.length > 0 && (
                      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block', marginBottom: 6 }}>Chi tiết theo phòng ban</Text>
                        {cat.departments.map(dept => {
                          const deptPct = dept.allocated > 0 ? Math.round((dept.spent / dept.allocated) * 100) : 0;
                          return (
                            <div key={dept.departmentId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <Text style={{ fontSize: 11, color: '#666', width: 60, flexShrink: 0 }}>{dept.shortName}</Text>
                              <div style={{ flex: 1 }}>
                                <Progress percent={deptPct} size="small" showInfo={false} strokeColor={getProgressColor(deptPct)} />
                              </div>
                              <Text style={{ fontSize: 11, color: '#999', width: 75, textAlign: 'right', flexShrink: 0 }}>
                                {formatCurrency(dept.spent)}/{formatCurrency(dept.allocated)}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB 2: THEO PHÒNG BAN (card-based) — chỉ GĐ & TC
  // ═══════════════════════════════════════════════════════════
  const deptTab = (
    <div>
      {departmentAggregates.length === 0 ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        <Row gutter={[16, 16]}>
          {departmentAggregates.map(dept => {
            const spentPct = dept.allocated > 0 ? Math.round((dept.spent / dept.allocated) * 100) : 0;
            const commitPct = dept.allocated > 0 ? Math.round(((dept.spent + dept.committed) / dept.allocated) * 100) : 0;

            return (
              <Col xs={24} md={12} lg={8} key={dept.departmentId}>
                <div className="ct-dept-card">
                  {/* Dept header */}
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                    padding: '14px 18px', position: 'relative', overflow: 'hidden',
                    borderRadius: '10px 10px 0 0',
                  }}>
                    <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{dept.shortName}</Text>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{dept.fullName}</div>
                      </div>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'rgba(255,255,255,0.15)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, color: '#fff',
                      }}>
                        <TeamOutlined />
                      </div>
                    </div>
                  </div>

                  {/* Dept body */}
                  <div style={{ padding: '16px 18px' }}>
                    {/* Budget stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                      <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phân bổ</Text>
                        <Text strong style={{ fontSize: 14, color: colors.navy }}>{formatCurrency(dept.allocated)}</Text>
                      </div>
                      <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Đã chi</Text>
                        <Text strong style={{ fontSize: 14, color: '#059669' }}>{formatCurrency(dept.spent)}</Text>
                      </div>
                      <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Cam kết</Text>
                        <Text strong style={{ fontSize: 14, color: '#d97706' }}>{formatCurrency(dept.committed)}</Text>
                      </div>
                      <div style={{ padding: '10px 12px', background: spentPct > 80 ? '#fef2f2' : '#eff6ff', borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Còn lại</Text>
                        <Text strong style={{ fontSize: 14, color: spentPct > 80 ? colors.danger : '#2563eb' }}>{formatCurrency(dept.remaining)}</Text>
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 10, color: '#999' }}>Đã chi / Phân bổ</Text>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: getProgressColor(spentPct) }}>{spentPct}%</Text>
                      </div>
                      <Progress percent={spentPct} size="small" showInfo={false} strokeColor={getProgressColor(spentPct)} />
                    </div>

                    {/* Footer info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, color: '#bbb' }}>{dept.taskCount} hạng mục</Text>
                      <Text style={{ fontSize: 11, color: '#bbb' }}>
                        Cam kết+Chi: {commitPct}%
                      </Text>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB 3: GIẢI NGÂN THEO QUÝ (card-based)
  // ═══════════════════════════════════════════════════════════
  const disbursementData = useMemo(() => {
    const qKeys: ('q1' | 'q2' | 'q3' | 'q4')[] = ['q1', 'q2', 'q3', 'q4'];
    const qLabels = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
    const qMonths = ['T1 – T3', 'T4 – T6', 'T7 – T9', 'T10 – T12'];
    return qLabels.map((label, qi) => {
      const planned = filteredData.reduce((s, a) => s + a[qKeys[qi]], 0);
      const actual = qi < 2 ? Math.round(planned * (0.9 + Math.random() * 0.15)) : 0;
      const pct = planned > 0 ? Math.round((actual / planned) * 100) : 0;
      return { key: qKeys[qi], label, months: qMonths[qi], planned, actual, pct, isFuture: qi >= 2 };
    });
  }, [filteredData]);

  const totalPlanned = disbursementData.reduce((s, q) => s + q.planned, 0);
  const totalActual = disbursementData.reduce((s, q) => s + q.actual, 0);

  const disbursementTab = (
    <div>
      {/* Summary bar */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
        borderRadius: 12, padding: '16px 24px', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Tổng KH giải ngân năm 2026</Text>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalPlanned)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Đã giải ngân</Text>
          <div style={{ color: '#34d399', fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalActual)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Tỷ lệ</Text>
          <div style={{ color: '#fbbf24', fontSize: 24, fontWeight: 700 }}>
            {totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Quarter cards */}
      <Row gutter={[16, 16]}>
        {disbursementData.map((q, idx) => {
          const diff = q.actual - q.planned;
          const isOver = diff > 0;

          return (
            <Col xs={24} sm={12} lg={6} key={q.key}>
              <div className="ct-quarter-card">
                {/* Quarter header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <Text strong style={{ fontSize: 15, color: colors.navy }}>{q.label}</Text>
                    <div style={{ fontSize: 11, color: '#999' }}>{q.months}</div>
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: q.isFuture ? '#f5f5f5' : (q.pct >= 80 ? '#dcfce7' : '#fef9c3'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CalendarOutlined style={{ color: q.isFuture ? '#bbb' : (q.pct >= 80 ? '#059669' : '#d97706') }} />
                  </div>
                </div>

                {/* Quarter body */}
                <div style={{ padding: '14px 16px' }}>
                  {q.isFuture ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <Text style={{ fontSize: 18, fontWeight: 700, color: colors.navy, display: 'block' }}>
                        {formatCurrency(q.planned)}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#999' }}>Kế hoạch giải ngân</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="default" style={{ fontSize: 11 }}>Chưa đến kỳ</Tag>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                          <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Kế hoạch</Text>
                          <Text strong style={{ fontSize: 14, color: colors.navy }}>{formatCurrency(q.planned)}</Text>
                        </div>
                        <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                          <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Thực tế</Text>
                          <Text strong style={{ fontSize: 14, color: '#059669' }}>{formatCurrency(q.actual)}</Text>
                        </div>
                      </div>

                      {/* Progress */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 10, color: '#999' }}>Tỷ lệ giải ngân</Text>
                          <Text style={{ fontSize: 11, fontWeight: 600, color: getProgressColor(100 - q.pct) }}>{q.pct}%</Text>
                        </div>
                        <Progress percent={q.pct} size="small" showInfo={false}
                          strokeColor={q.pct >= 90 ? '#52c41a' : q.pct >= 70 ? '#1890ff' : '#faad14'} />
                      </div>

                      {/* Diff */}
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ fontSize: 11, color: isOver ? colors.danger : '#059669' }}>
                          {isOver ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          {' '}{isOver ? 'Vượt' : 'Tiết kiệm'} {formatCurrency(Math.abs(diff))}
                        </Text>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );


  // ═══════════════════════════════════════════════════════════
  // TAB CONFIG
  // ═══════════════════════════════════════════════════════════
  const tabItems = [
    { key: 'category', label: <span><PieChartOutlined /> Theo hạng mục</span>, children: categoryTab },
  ];

  // Tab "Theo phòng ban" chỉ hiển thị cho GĐ & TC, PB chỉ có 1 phòng nên ko cần
  if (!isDepartment) {
    tabItems.push({ key: 'dept', label: <span><TeamOutlined /> Theo phòng ban</span>, children: deptTab });
  }

  tabItems.push({ key: 'disbursement', label: <span><BarChartOutlined /> Giải ngân theo quý</span>, children: disbursementTab });

  return (
    <div>
      <style>{ctStyles}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ color: colors.navy, margin: 0 }}>Theo dõi thực hiện chi phí</Title>
          {isDepartment && (
            <Text style={{ fontSize: 12, color: '#999' }}>
              {getDepartmentName(deptId)} — Năm 2026
            </Text>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="ct-stat-card" style={{
              background: card.gradient,
              borderRadius: 12, padding: '14px 16px 12px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div className="ct-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
              }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.title}
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {card.value}
                {card.suffix && <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>{card.suffix}</span>}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FilterOutlined style={{ color: '#999' }} />
          <Select disabled value={2026} style={{ width: 100 }} options={[{ label: '2026', value: 2026 }]} />
          {!isDepartment && (
            <Select
              allowClear
              placeholder="Phòng ban"
              style={{ width: 200 }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={availableDepts.map((d) => ({ label: d.shortName, value: d.id }))}
            />
          )}
          <Select
            allowClear
            placeholder="Loại hạng mục"
            style={{ width: 160 }}
            value={categoryTypeFilter}
            onChange={setCategoryTypeFilter}
            options={Object.entries(categoryTypeConfig).map(([k, v]) => ({ label: v.label, value: k }))}
          />
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
            Hiển thị {filteredData.length} / {baseData.length} hạng mục chi phí
          </Text>
        </div>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Tabs defaultActiveKey="category" items={tabItems} />
      </Card>

    </div>
  );
};

export default CostTracking;
