// ─── BI / Reports layer ────────────────────────────────────────────────────────
// Pre-aggregated data simulating an OLAP / Data Warehouse layer.
// These would normally be computed by an ETL pipeline and stored in Agg_* tables.
// Direct OLTP queries are NOT used here — this is the "reports data" module.

import dayjs from 'dayjs';

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const dataAsOf = '2026-04-10T07:45:00'; // Simulated ETL last-run timestamp
export const etlDelay = 15; // minutes

// ─── Fact_Contract (simulated) ────────────────────────────────────────────────
export interface FactContract {
  contractId: string;
  contractCode: string;
  contractName: string;
  partnerUnit: string;
  contractType: string;
  contractStatus: string;
  signedDate: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  costVariancePct: number;
  grossProfit: number;
  profitMarginPct: number;
  plannedDurationDays: number;
  actualDurationDays: number;
  daysOverdue: number;
  overallProgressPct: number;
  expectedProgressPct: number;
  progressVariancePct: number;
  wbsItemCount: number;
  completedWbsCount: number;
  acceptanceCount: number;
  failedAcceptanceCount: number;
  firstPassYield: number;         // % NT đạt ngay lần đầu
  orgId: string;                  // Trung tâm chính thực hiện
}

const today = dayjs('2026-04-10');
const calcExpected = (start: string, end: string) => {
  const s = dayjs(start); const e = dayjs(end);
  if (today.isBefore(s)) return 0;
  if (today.isAfter(e)) return 100;
  return Math.min(100, Math.round(today.diff(s, 'day') / (e.diff(s, 'day') || 1) * 100));
};

export const factContracts: FactContract[] = [
  {
    contractId: 'HD-001',
    contractCode: 'HĐ-2026-001',
    contractName: 'Nâng cấp hệ thống monitoring P-18 server-1245',
    partnerUnit: 'Khối K01',
    contractType: 'repair',
    contractStatus: 'executing',
    signedDate: '2026-02-01',
    startDate: '2026-02-10',
    endDate: '2026-06-30',
    contractValue: 850,
    plannedCost: 680,
    actualCost: 430,
    costVariance: -250,
    costVariancePct: -36.8,
    grossProfit: 420,
    profitMarginPct: 49.4,
    plannedDurationDays: 140,
    actualDurationDays: 59,
    daysOverdue: 0,
    overallProgressPct: 72,
    expectedProgressPct: calcExpected('2026-02-10', '2026-06-30'),
    progressVariancePct: 72 - calcExpected('2026-02-10', '2026-06-30'),
    wbsItemCount: 5,
    completedWbsCount: 3,
    acceptanceCount: 3,
    failedAcceptanceCount: 1,
    firstPassYield: 67,
    orgId: 'PX1',
  },
  {
    contractId: 'HD-002',
    contractCode: 'HĐ-2026-002',
    contractName: 'Nâng cấp tổng thể module CRM S-125 Pechora',
    partnerUnit: 'Trung tâm 285',
    contractType: 'overhaul',
    contractStatus: 'executing',
    signedDate: '2026-02-15',
    startDate: '2026-02-20',
    endDate: '2026-05-31',
    contractValue: 1200,
    plannedCost: 980,
    actualCost: 542,
    costVariance: -438,
    costVariancePct: -44.7,
    grossProfit: 658,
    profitMarginPct: 54.8,
    plannedDurationDays: 100,
    actualDurationDays: 49,
    daysOverdue: 0,
    overallProgressPct: 48,
    expectedProgressPct: calcExpected('2026-02-20', '2026-05-31'),
    progressVariancePct: 48 - calcExpected('2026-02-20', '2026-05-31'),
    wbsItemCount: 6,
    completedWbsCount: 1,
    acceptanceCount: 2,
    failedAcceptanceCount: 0,
    firstPassYield: 100,
    orgId: 'PX2',
  },
  {
    contractId: 'HD-003',
    contractCode: 'HĐ-2026-003',
    contractName: 'Sản xuất cụm module thay thế hệ thống monitoring 36D6',
    partnerUnit: 'Trung tâm Hệ thống 291',
    contractType: 'manufacturing',
    contractStatus: 'acceptance',
    signedDate: '2026-01-10',
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    contractValue: 480,
    plannedCost: 385,
    actualCost: 378,
    costVariance: -7,
    costVariancePct: -1.8,
    grossProfit: 102,
    profitMarginPct: 21.3,
    plannedDurationDays: 90,
    actualDurationDays: 85,
    daysOverdue: 0,
    overallProgressPct: 95,
    expectedProgressPct: calcExpected('2026-01-15', '2026-04-15'),
    progressVariancePct: 95 - calcExpected('2026-01-15', '2026-04-15'),
    wbsItemCount: 4,
    completedWbsCount: 4,
    acceptanceCount: 4,
    failedAcceptanceCount: 0,
    firstPassYield: 100,
    orgId: 'PX3',
  },
  {
    contractId: 'HD-004',
    contractCode: 'HĐ-2025-012',
    contractName: 'Bảo trì hệ thống định vị ST-68',
    partnerUnit: 'Khối K07',
    contractType: 'repair',
    contractStatus: 'executing',
    signedDate: '2025-11-01',
    startDate: '2025-11-15',
    endDate: '2026-03-31',
    contractValue: 320,
    plannedCost: 265,
    actualCost: 298,
    costVariance: 33,
    costVariancePct: 12.5,
    grossProfit: 22,
    profitMarginPct: 6.9,
    plannedDurationDays: 136,
    actualDurationDays: 136,
    daysOverdue: 10,  // đã quá deadline 31/3
    overallProgressPct: 88,
    expectedProgressPct: 100,
    progressVariancePct: -12,
    wbsItemCount: 3,
    completedWbsCount: 2,
    acceptanceCount: 2,
    failedAcceptanceCount: 0,
    firstPassYield: 100,
    orgId: 'PX4',
  },
  {
    contractId: 'HD-005',
    contractCode: 'HĐ-2025-008',
    contractName: 'Nghiên cứu cải tiến module P-37',
    partnerUnit: 'Viện KH-CN Doanh nghiệp A',
    contractType: 'research',
    contractStatus: 'executing',
    signedDate: '2025-09-01',
    startDate: '2025-09-15',
    endDate: '2026-06-30',
    contractValue: 650,
    plannedCost: 520,
    actualCost: 185,
    costVariance: -335,
    costVariancePct: -64.4,
    grossProfit: 465,
    profitMarginPct: 71.5,
    plannedDurationDays: 288,
    actualDurationDays: 207,
    daysOverdue: 0,
    overallProgressPct: 35,
    expectedProgressPct: calcExpected('2025-09-15', '2026-06-30'),
    progressVariancePct: 35 - calcExpected('2025-09-15', '2026-06-30'),
    wbsItemCount: 4,
    completedWbsCount: 1,
    acceptanceCount: 1,
    failedAcceptanceCount: 0,
    firstPassYield: 100,
    orgId: 'PKT',
  },
];

// ─── Monthly trend (Fact_Progress aggregated) ─────────────────────────────────
export interface MonthlyTrend {
  month: string;         // MM/YYYY
  plannedProgress: number;
  actualProgress: number;
  plannedCost: number;
  actualCost: number;
  acceptanceCount: number;
  firstPassYield: number;
}

export const monthlyTrends: MonthlyTrend[] = [
  { month: '01/2026', plannedProgress: 12, actualProgress: 10, plannedCost: 180,  actualCost: 145,  acceptanceCount: 1, firstPassYield: 100 },
  { month: '02/2026', plannedProgress: 24, actualProgress: 21, plannedCost: 320,  actualCost: 278,  acceptanceCount: 2, firstPassYield: 50  },
  { month: '03/2026', plannedProgress: 40, actualProgress: 38, plannedCost: 485,  actualCost: 432,  acceptanceCount: 3, firstPassYield: 67  },
  { month: '04/2026', plannedProgress: 56, actualProgress: 52, plannedCost: 620,  actualCost: 575,  acceptanceCount: 2, firstPassYield: 100 },
];

// ─── Department workload ───────────────────────────────────────────────────────
export interface DeptWorkload {
  orgId: string;
  orgName: string;
  orgShort: string;
  activeWorkOrders: number;
  completedWorkOrders: number;
  totalWorkOrders: number;
  progressPct: number;
  actualCost: number;
  contractCount: number;
}

export const deptWorkloads: DeptWorkload[] = [
  { orgId: 'PX1', orgName: 'Trung tâm Hệ thống Monitoring', orgShort: 'PX1', activeWorkOrders: 6,  completedWorkOrders: 8,  totalWorkOrders: 14, progressPct: 57, actualCost: 312, contractCount: 3 },
  { orgId: 'PX2', orgName: 'Trung tâm Module CRM',           orgShort: 'PX2', activeWorkOrders: 4,  completedWorkOrders: 2,  totalWorkOrders: 6,  progressPct: 33, actualCost: 228, contractCount: 1 },
  { orgId: 'PX3', orgName: 'Trung tâm Hạ tầng',              orgShort: 'PX3', activeWorkOrders: 5,  completedWorkOrders: 10, totalWorkOrders: 15, progressPct: 67, actualCost: 158, contractCount: 2 },
  { orgId: 'PX4', orgName: 'Trung tâm Phần mềm',             orgShort: 'PX4', activeWorkOrders: 3,  completedWorkOrders: 5,  totalWorkOrders: 8,  progressPct: 63, actualCost: 198, contractCount: 2 },
  { orgId: 'PKT', orgName: 'Phòng Kỹ thuật',                 orgShort: 'P.KT',activeWorkOrders: 2,  completedWorkOrders: 1,  totalWorkOrders: 3,  progressPct: 33, actualCost: 42,  contractCount: 1 },
];

// ─── Cost breakdown by category × contract (simulated Fact_Cost pivot) ────────
export interface CostBreakdown {
  contractId: string;
  contractCode: string;
  contractName: string;
  plannedMaterial: number; actualMaterial: number;
  plannedLabor: number;    actualLabor: number;
  plannedEquipment: number;actualEquipment: number;
  plannedOverhead: number; actualOverhead: number;
  plannedTotal: number;    actualTotal: number;
  varianceTotal: number;   variancePct: number;
}

export const costBreakdowns: CostBreakdown[] = [
  {
    contractId: 'HD-001',
    contractCode: 'HĐ-2026-001', contractName: 'Nâng cấp hệ thống monitoring P-18',
    plannedMaterial: 280, actualMaterial: 312,
    plannedLabor:    185, actualLabor:    198,
    plannedEquipment:130, actualEquipment:145,
    plannedOverhead:  85, actualOverhead: 101,
    plannedTotal:    680, actualTotal:    756,
    varianceTotal: 76,    variancePct: 11.2,
  },
  {
    contractId: 'HD-002',
    contractCode: 'HĐ-2026-002', contractName: 'Nâng cấp module CRM S-125 Pechora',
    plannedMaterial: 420, actualMaterial: 228,
    plannedLabor:    280, actualLabor:    145,
    plannedEquipment:180, actualEquipment: 98,
    plannedOverhead: 100, actualOverhead:  71,
    plannedTotal:    980, actualTotal:    542,
    varianceTotal:-438,   variancePct:-44.7,
  },
  {
    contractId: 'HD-003',
    contractCode: 'HĐ-2026-003', contractName: 'Sản xuất module 36D6',
    plannedMaterial: 160, actualMaterial: 158,
    plannedLabor:    105, actualLabor:    102,
    plannedEquipment: 70, actualEquipment: 68,
    plannedOverhead:  50, actualOverhead:  50,
    plannedTotal:    385, actualTotal:    378,
    varianceTotal:  -7,   variancePct: -1.8,
  },
  {
    contractId: 'HD-004',
    contractCode: 'HĐ-2025-012', contractName: 'Bảo trì ST-68',
    plannedMaterial: 110, actualMaterial: 128,
    plannedLabor:     82, actualLabor:     92,
    plannedEquipment: 45, actualEquipment: 52,
    plannedOverhead:  28, actualOverhead:  26,
    plannedTotal:    265, actualTotal:    298,
    varianceTotal:  33,   variancePct: 12.5,
  },
  {
    contractId: 'HD-005',
    contractCode: 'HĐ-2025-008', contractName: 'Nghiên cứu module P-37',
    plannedMaterial: 220, actualMaterial:  72,
    plannedLabor:    160, actualLabor:     68,
    plannedEquipment: 90, actualEquipment: 30,
    plannedOverhead:  50, actualOverhead:  15,
    plannedTotal:    520, actualTotal:    185,
    varianceTotal:-335,   variancePct:-64.4,
  },
];

// ─── Acceptance quality summary ────────────────────────────────────────────────
export interface AcceptanceQuality {
  contractId: string;
  contractCode: string;
  contractName: string;
  totalAcceptances: number;
  passedCount: number;
  failedCount: number;
  conditionalCount: number;
  pendingCount: number;
  firstPassYield: number;   // %
  avgCyclesToPass: number;
  openDefects: number;
  reworkCount: number;
  avgDaysToPass: number;
}

export const acceptanceQuality: AcceptanceQuality[] = [
  { contractId: 'HD-001', contractCode: 'HĐ-2026-001', contractName: 'Nâng cấp hệ thống monitoring P-18',    totalAcceptances: 3, passedCount: 2, failedCount: 1, conditionalCount: 0, pendingCount: 0, firstPassYield: 67, avgCyclesToPass: 1.5, openDefects: 0, reworkCount: 1, avgDaysToPass: 18 },
  { contractId: 'HD-002', contractCode: 'HĐ-2026-002', contractName: 'Nâng cấp module CRM S-125 Pechora',   totalAcceptances: 2, passedCount: 1, failedCount: 0, conditionalCount: 1, pendingCount: 0, firstPassYield: 100, avgCyclesToPass: 1.0, openDefects: 0, reworkCount: 0, avgDaysToPass: 5 },
  { contractId: 'HD-003', contractCode: 'HĐ-2026-003', contractName: 'Sản xuất module 36D6',totalAcceptances: 4, passedCount: 4, failedCount: 0, conditionalCount: 0, pendingCount: 0, firstPassYield: 100, avgCyclesToPass: 1.0, openDefects: 0, reworkCount: 0, avgDaysToPass: 3 },
  { contractId: 'HD-004', contractCode: 'HĐ-2025-012', contractName: 'Bảo trì ST-68',         totalAcceptances: 2, passedCount: 2, failedCount: 0, conditionalCount: 0, pendingCount: 0, firstPassYield: 100, avgCyclesToPass: 1.0, openDefects: 0, reworkCount: 0, avgDaysToPass: 4 },
  { contractId: 'HD-005', contractCode: 'HĐ-2025-008', contractName: 'Nghiên cứu module P-37',  totalAcceptances: 1, passedCount: 1, failedCount: 0, conditionalCount: 0, pendingCount: 0, firstPassYield: 100, avgCyclesToPass: 1.0, openDefects: 0, reworkCount: 0, avgDaysToPass: 6 },
];

// ─── Settlement summary ───────────────────────────────────────────────────────
export interface SettlementSummary {
  contractId: string;
  contractCode: string;
  contractName: string;
  settlementCode: string;
  settlementStatus: string;
  contractValue: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  costVariancePct: number;
  revenue: number;
  grossProfit: number;
  profitMarginPct: number;
  approvedDate?: string;
}

export const settlementSummaries: SettlementSummary[] = [
  { contractId: 'HD-001', contractCode: 'HĐ-2026-001', contractName: 'Nâng cấp hệ thống monitoring P-18',    settlementCode: 'QT-2026-001', settlementStatus: 'approved', contractValue: 850, plannedCost: 680, actualCost: 756, costVariance: 76,  costVariancePct: 11.2,  revenue: 850, grossProfit: 94,  profitMarginPct: 11.1, approvedDate: '2026-05-24' },
  { contractId: 'HD-002', contractCode: 'HĐ-2026-002', contractName: 'Nâng cấp module CRM S-125 Pechora',   settlementCode: 'QT-2026-002', settlementStatus: 'reviewing', contractValue: 1200,plannedCost: 980, actualCost: 542, costVariance: -438,costVariancePct: -44.7, revenue: 600, grossProfit: 58,  profitMarginPct: 9.7 },
  { contractId: 'HD-003', contractCode: 'HĐ-2026-003', contractName: 'Sản xuất module 36D6',settlementCode: 'QT-2026-003', settlementStatus: 'draft',     contractValue: 480, plannedCost: 385, actualCost: 378, costVariance: -7,  costVariancePct: -1.8,  revenue: 480, grossProfit: 102, profitMarginPct: 21.3 },
];

// ─── Dashboard KPI (Agg_Dashboard_KPI simulated) ──────────────────────────────
export const dashboardKPI = {
  totalContracts: factContracts.length,
  activeContracts: factContracts.filter(c => c.contractStatus === 'executing' || c.contractStatus === 'acceptance').length,
  completedContracts: factContracts.filter(c => c.contractStatus === 'completed').length,
  overdueContracts: factContracts.filter(c => c.daysOverdue > 0).length,
  totalContractValue: factContracts.reduce((s, c) => s + c.contractValue, 0),
  totalActualCost: factContracts.reduce((s, c) => s + c.actualCost, 0),
  totalPlannedCost: factContracts.reduce((s, c) => s + c.plannedCost, 0),
  avgProgressPct: Math.round(factContracts.reduce((s, c) => s + c.overallProgressPct, 0) / factContracts.length),
  overallFirstPassYield: Math.round(
    factContracts.reduce((s, c) => s + c.firstPassYield * c.acceptanceCount, 0) /
    Math.max(1, factContracts.reduce((s, c) => s + c.acceptanceCount, 0))
  ),
  contractsBehindSchedule: factContracts.filter(c => c.progressVariancePct < -10).length,
  dataAsOf,
};
