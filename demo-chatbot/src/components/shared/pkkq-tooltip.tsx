'use client';

/**
 * PkkqTooltip — Recharts custom tooltip with PKKQ navy-bordered white look.
 * Dùng thay cho <Tooltip content={...} /> mặc định của Recharts.
 */

interface PkkqTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
    unit?: string;
  }>;
  /** Formatter cho value */
  valueFormatter?: (value: number | string) => string;
  /** Ẩn label khi cần (ví dụ: pie chart) */
  hideLabel?: boolean;
}

export function PkkqTooltip({
  active,
  label,
  payload,
  valueFormatter,
  hideLabel = false,
}: PkkqTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        borderLeft: '3px solid #1B3A5C',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '12px 14px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        minWidth: 160,
      }}
    >
      {!hideLabel && label !== undefined && label !== '' && (
        <div
          style={{
            color: '#1B3A5C',
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {payload.map((entry, idx) => {
          const raw = entry.value;
          const formatted =
            valueFormatter && raw !== undefined
              ? valueFormatter(raw)
              : typeof raw === 'number'
                ? raw.toLocaleString('vi-VN')
                : String(raw ?? '');
          return (
            <div
              key={`${entry.dataKey}-${idx}`}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: entry.color ?? '#1B3A5C',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#5b6b7f', fontSize: 12 }}>{entry.name}</span>
              </div>
              <span style={{ color: '#1B3A5C', fontWeight: 700, fontSize: 13 }}>
                {formatted}
                {entry.unit ? <span style={{ fontWeight: 400, opacity: 0.7 }}> {entry.unit}</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
