import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSublabel?: string;
  centerColor?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 150,
  strokeWidth = 20,
  centerLabel,
  centerSublabel,
  centerColor = '#1a1a2e',
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Build segments
  let cumulativeOffset = 0;
  const segments = data.map((segment) => {
    const pct = segment.value / total;
    const dashLength = pct * circumference;
    const gapLength = circumference - dashLength;
    const rotation = cumulativeOffset * 360 - 90; // start from top
    cumulativeOffset += pct;

    return {
      ...segment,
      dashArray: `${dashLength} ${gapLength}`,
      rotation,
    };
  });

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth}
        />
        {/* Data segments */}
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={0}
            strokeLinecap="butt"
            transform={`rotate(${seg.rotation} ${center} ${center})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
      </svg>
      {/* Center text */}
      {centerLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: centerColor, lineHeight: 1 }}>
            {centerLabel}
          </div>
          {centerSublabel && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 3 }}>
              {centerSublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
