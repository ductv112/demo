/**
 * PKKQ chart theme — shared Recharts styling tokens.
 *
 * Đồng bộ look với các phần mềm khác của hệ thống PKKQ (Ant Design Charts).
 * Dùng cho mọi <BarChart>, <AreaChart>, <LineChart>, <PieChart> trong pkkq-dms.
 */

// ── Palette (đồng nhất với PKKQ Navy + Gold system) ──────────────
export const PKKQ_CHART_COLORS = {
  navy: '#1B3A5C',
  navyLight: '#2d5a8e',
  gold: '#D4A843',
  goldLight: '#f0d890',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
  muted: '#5b6b7f',
  gridStroke: '#f0f2f5',
  axisStroke: '#e8e8e8',
} as const;

// ── 6-color multi-series palette ─────────────────────────────────
// Dùng cho charts có nhiều series (stacked bar, multi-line…) — tham
// chiếu pkkq-taichinhketoan (roleColors + categoryTypeConfig).
export const PKKQ_CHART_SERIES_COLORS = [
  '#1B3A5C', // navy
  '#7c3aed', // violet
  '#0891b2', // cyan
  '#059669', // emerald
  '#D4A843', // gold
  '#6b7280', // slate
] as const;

// Backward-compatible alias — new code nên dùng PKKQ_CHART_SERIES_COLORS.
export const PKKQ_SERIES = [
  PKKQ_CHART_COLORS.navy,
  PKKQ_CHART_COLORS.gold,
  PKKQ_CHART_COLORS.success,
  PKKQ_CHART_COLORS.warning,
  PKKQ_CHART_COLORS.info,
];

// ── Axis props dùng cho <XAxis>/<YAxis> ─────────────────────────
export const AXIS_PROPS = {
  tick: { fontSize: 12, fill: PKKQ_CHART_COLORS.muted, fontFamily: 'Inter, sans-serif' },
  axisLine: { stroke: PKKQ_CHART_COLORS.axisStroke },
  tickLine: false as const,
} as const;

// ── Grid props dùng cho <CartesianGrid> ─────────────────────────
export const GRID_PROPS = {
  strokeDasharray: '3 3' as const,
  stroke: PKKQ_CHART_COLORS.gridStroke,
  vertical: false as const,
};

// ── Legend style (truyền vào wrapperStyle) ───────────────────────
export const LEGEND_STYLE = {
  fontSize: '12px',
  color: PKKQ_CHART_COLORS.navy,
  fontFamily: 'Inter, sans-serif',
  paddingBottom: '8px',
};

// ── Bar element defaults ─────────────────────────────────────────
export const BAR_RADIUS: [number, number, number, number] = [8, 8, 0, 0];
export const BAR_MAX_SIZE = 36;
