import React from 'react';

export interface SummaryCardItem {
  key: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
}

interface SummaryCardProps {
  items: SummaryCardItem[];
}

// ── Gradient generator: tạo gradient từ accentColor ─────────────────────────
function buildGradient(color: string): string {
  const MAP: Record<string, string> = {
    '#1E6FD9': 'linear-gradient(135deg, #1E6FD9 0%, #3B8AE8 100%)',
    '#389e0d': 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)',
    '#cf1322': 'linear-gradient(135deg, #cf1322 0%, #ff4d4f 100%)',
    '#d48806': 'linear-gradient(135deg, #d48806 0%, #faad14 100%)',
    '#6b21a8': 'linear-gradient(135deg, #6b21a8 0%, #a78bfa 100%)',
    '#0070cc': 'linear-gradient(135deg, #0070cc 0%, #40a9ff 100%)',
  };
  return MAP[color] || `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ items }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: 14 }}>
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            background: buildGradient(item.accentColor),
            borderRadius: 12,
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
          }}
        >
          {/* Decorative circle */}
          <div
            style={{
              position: 'absolute',
              right: -12,
              top: -12,
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }}
          />

          {/* Icon */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#fff',
              flexShrink: 0,
              backdropFilter: 'blur(4px)',
            }}
          >
            {item.icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.1,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.4,
                marginTop: 3,
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
              }}
            >
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard;
