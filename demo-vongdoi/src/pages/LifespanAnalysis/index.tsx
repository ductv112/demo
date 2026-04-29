import React, { useState, useRef } from 'react';
import { Card, Row, Col, Typography, Select, Table, Tag, Progress, Space, Segmented } from 'antd';
import {
  LineChartOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { equipmentList } from '../../data/equipment';
import {
  equipmentTypeConfig, equipmentStatusConfig, technicalConditionConfig,
  getLifespanPercent, getHoursPercent, getProgressColor, formatHours,
} from '../../utils/format';
import type { ColumnsType } from 'antd/es/table';
import type { Equipment, EquipmentType, EquipmentStatus, TechnicalCondition } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Quadrant Chart ──────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  'Monitoring':  '#1B3A5C',
  'Sản phẩm':    '#0891b2',
  'Hạ tầng':     '#d97706',
  'Đo lường':    '#7c3aed',
  'Truyền thông':'#059669',
  'Điện tử':     '#db2777',
};

interface ScatterPoint { x: number; y: number; name: string; type: string; status: string; }

const QuadrantChart: React.FC<{ data: ScatterPoint[] }> = ({ data }) => {
  const [hovered, setHovered] = useState<ScatterPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 800, H = 320;
  const PAD = { top: 20, right: 24, bottom: 48, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const minVal = 45, maxVal = 105;
  const toX = (v: number) => ((v - minVal) / (maxVal - minVal)) * plotW;
  const toY = (v: number) => plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
  const thresh = 90;
  const threshX = toX(thresh);
  const threshY = toY(thresh);

  const ticks = [50, 60, 70, 80, 90, 100];

  const types = [...new Set(data.map(d => d.type))];

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, paddingLeft: PAD.left }}>
        {types.map(t => (
          <Space key={t} size={5}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: TYPE_COLORS[t] ?? '#999' }} />
            <Text style={{ fontSize: 12, color: '#666' }}>{t}</Text>
          </Space>
        ))}
        <Space size={5} style={{ marginLeft: 16 }}>
          <div style={{ width: 20, height: 2, background: '#ff4d4f', borderTop: '2px dashed #ff4d4f' }} />
          <Text style={{ fontSize: 11, color: '#ff4d4f' }}>Ngưỡng nghiêm trọng 90%</Text>
        </Space>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 320, display: 'block' }}
        onMouseMove={(e) => {
          setMousePos({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Quadrant backgrounds */}
          <rect x={0}        y={0}        width={threshX} height={threshY}          fill="#f6ffed" opacity={0.6} />
          <rect x={threshX}  y={0}        width={plotW - threshX} height={threshY}  fill="#fffbe6" opacity={0.6} />
          <rect x={0}        y={threshY}  width={threshX} height={plotH - threshY}  fill="#fffbe6" opacity={0.6} />
          <rect x={threshX}  y={threshY}  width={plotW - threshX} height={plotH - threshY} fill="#fff1f0" opacity={0.6} />

          {/* Grid lines */}
          {ticks.map(t => (
            <g key={t}>
              <line x1={toX(t)} y1={0} x2={toX(t)} y2={plotH} stroke="#e8e8e8" strokeWidth={1} />
              <line x1={0} y1={toY(t)} x2={plotW} y2={toY(t)} stroke="#e8e8e8" strokeWidth={1} />
            </g>
          ))}

          {/* Threshold lines */}
          <line x1={threshX} y1={0} x2={threshX} y2={plotH} stroke="#ff4d4f" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.8} />
          <line x1={0} y1={threshY} x2={plotW} y2={threshY} stroke="#ff4d4f" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.8} />

          {/* Quadrant labels */}
          <text x={threshX / 2} y={threshY / 2} textAnchor="middle" fontSize={11} fill="#52c41a" opacity={0.7} fontWeight={600}>Bình thường</text>
          <text x={(threshX + plotW) / 2} y={threshY / 2} textAnchor="middle" fontSize={11} fill="#faad14" opacity={0.7} fontWeight={600}>Cảnh báo tuổi thọ</text>
          <text x={threshX / 2} y={(threshY + plotH) / 2} textAnchor="middle" fontSize={11} fill="#faad14" opacity={0.7} fontWeight={600}>Cảnh báo giờ HĐ</text>
          <text x={(threshX + plotW) / 2} y={(threshY + plotH) / 2} textAnchor="middle" fontSize={11} fill="#ff4d4f" opacity={0.8} fontWeight={700}>Nghiêm trọng</text>

          {/* Axes */}
          <line x1={0} y1={plotH} x2={plotW} y2={plotH} stroke="#ccc" strokeWidth={1} />
          <line x1={0} y1={0}     x2={0}     y2={plotH} stroke="#ccc" strokeWidth={1} />

          {/* X ticks + labels */}
          {ticks.map(t => (
            <g key={t}>
              <line x1={toX(t)} y1={plotH} x2={toX(t)} y2={plotH + 4} stroke="#ccc" strokeWidth={1} />
              <text x={toX(t)} y={plotH + 16} textAnchor="middle" fontSize={10} fill="#888">{t}%</text>
            </g>
          ))}
          <text x={plotW / 2} y={plotH + 38} textAnchor="middle" fontSize={12} fill="#555" fontWeight={500}>Tuổi thọ sử dụng (%)</text>

          {/* Y ticks + labels */}
          {ticks.map(t => (
            <g key={t}>
              <line x1={-4} y1={toY(t)} x2={0} y2={toY(t)} stroke="#ccc" strokeWidth={1} />
              <text x={-8} y={toY(t) + 4} textAnchor="end" fontSize={10} fill="#888">{t}%</text>
            </g>
          ))}
          <text transform={`translate(-40,${plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize={12} fill="#555" fontWeight={500}>Giờ hoạt động (%)</text>

          {/* Data points */}
          {data.map((d, i) => {
            const cx = toX(d.x), cy = toY(d.y);
            const fill = TYPE_COLORS[d.type] ?? '#999';
            const isHov = hovered === d;
            return (
              <g key={i}
                onMouseEnter={() => setHovered(d)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={cx} cy={cy} r={isHov ? 9 : 7} fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={1.5} />
                {isHov && <circle cx={cx} cy={cy} r={13} fill={fill} fillOpacity={0.15} stroke={fill} strokeWidth={1} />}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 14,
          top: mousePos.y - 10,
          background: 'rgba(20,30,48,0.92)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          pointerEvents: 'none',
          zIndex: 9999,
          maxWidth: 220,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          lineHeight: '1.8',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: TYPE_COLORS[hovered.type] ?? '#fff' }}>{hovered.name}</div>
          <div>Loại: {hovered.type}</div>
          <div>Tuổi thọ: <b>{hovered.x}%</b></div>
          <div>Giờ HĐ: <b>{hovered.y}%</b></div>
          <div style={{ marginTop: 4, fontSize: 11, color: hovered.x >= 90 && hovered.y >= 90 ? '#ff7875' : '#ffd666' }}>
            {hovered.x >= 90 && hovered.y >= 90 ? 'Nghiêm trọng — cần xử lý khẩn' : hovered.x >= 90 || hovered.y >= 90 ? 'Cảnh báo — lên kế hoạch sớm' : 'Bình thường'}
          </div>
        </div>
      )}
    </div>
  );
};


const LifespanAnalysis: React.FC = () => {
  const [viewMode, setViewMode] = useState<'lifespan' | 'hours'>('lifespan');
  const [filterType, setFilterType] = useState<string>('');

  const filtered = filterType ? equipmentList.filter(e => e.type === filterType) : equipmentList;

  // ─── Chart data ─────────────────────────────────────────────────
  const lifespanChartData = [...filtered]
    .sort((a, b) => getLifespanPercent(b.yearReceived, b.designLifespan) - getLifespanPercent(a.yearReceived, a.designLifespan))
    .map(e => ({
      name: e.name.length > 25 ? e.name.substring(0, 25) + '…' : e.name,
      value: getLifespanPercent(e.yearReceived, e.designLifespan),
      fullName: e.name,
      status: e.status,
    }));

  const hoursChartData = [...filtered]
    .sort((a, b) => getHoursPercent(b.operatingHours, b.maxOperatingHours) - getHoursPercent(a.operatingHours, a.maxOperatingHours))
    .map(e => ({
      name: e.name.length > 25 ? e.name.substring(0, 25) + '…' : e.name,
      value: getHoursPercent(e.operatingHours, e.maxOperatingHours),
      fullName: e.name,
    }));

  const scatterData = filtered.map(e => ({
    x: getLifespanPercent(e.yearReceived, e.designLifespan),
    y: getHoursPercent(e.operatingHours, e.maxOperatingHours),
    name: e.name,
    type: equipmentTypeConfig[e.type]?.label,
    status: e.status,
  }));

  // ─── Risk categories ────────────────────────────────────────────
  const critical = filtered.filter(e => {
    const lp = getLifespanPercent(e.yearReceived, e.designLifespan);
    const hp = getHoursPercent(e.operatingHours, e.maxOperatingHours);
    return lp >= 90 || hp >= 90;
  });
  const warning = filtered.filter(e => {
    const lp = getLifespanPercent(e.yearReceived, e.designLifespan);
    const hp = getHoursPercent(e.operatingHours, e.maxOperatingHours);
    return (lp >= 75 && lp < 90) || (hp >= 75 && hp < 90);
  });
  const good = filtered.filter(e => {
    const lp = getLifespanPercent(e.yearReceived, e.designLifespan);
    const hp = getHoursPercent(e.operatingHours, e.maxOperatingHours);
    return lp < 75 && hp < 75;
  });

  const columns: ColumnsType<Equipment> = [
    {
      title: 'Trang thiết bị',
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{r.name}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.unitName}</Text>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 100,
      render: (t: EquipmentType) => (
        <Tag style={{ background: equipmentTypeConfig[t]?.color, color: '#fff', border: 'none', fontSize: 10 }}>
          {equipmentTypeConfig[t]?.label}
        </Tag>
      ),
    },
    {
      title: 'Tuổi thọ (%)',
      key: 'lifespan',
      width: 160,
      render: (_, r) => {
        const pct = getLifespanPercent(r.yearReceived, r.designLifespan);
        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: getProgressColor(pct), marginBottom: 3 }}>
              {pct}% ({2026 - r.yearReceived}/{r.designLifespan} năm)
            </div>
            <Progress percent={pct} size="small" showInfo={false} strokeColor={getProgressColor(pct)} />
          </div>
        );
      },
      sorter: (a, b) => getLifespanPercent(b.yearReceived, b.designLifespan) - getLifespanPercent(a.yearReceived, a.designLifespan),
    },
    {
      title: 'Giờ HĐ (%)',
      key: 'hours',
      width: 160,
      render: (_, r) => {
        const pct = getHoursPercent(r.operatingHours, r.maxOperatingHours);
        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: getProgressColor(pct), marginBottom: 3 }}>
              {pct}% ({formatHours(r.operatingHours)}/{formatHours(r.maxOperatingHours)})
            </div>
            <Progress percent={pct} size="small" showInfo={false} strokeColor={getProgressColor(pct)} />
          </div>
        );
      },
      sorter: (a, b) => getHoursPercent(b.operatingHours, b.maxOperatingHours) - getHoursPercent(a.operatingHours, a.maxOperatingHours),
    },
    {
      title: 'Tình trạng KT',
      dataIndex: 'technicalCondition',
      width: 120,
      render: (tc: TechnicalCondition) => (
        <Tag color={technicalConditionConfig[tc]?.color === '#52c41a' ? 'success' : undefined}
          style={technicalConditionConfig[tc]?.color !== '#52c41a' ? { background: technicalConditionConfig[tc]?.color, color: '#fff', border: 'none' } : {}}
        >
          {technicalConditionConfig[tc]?.label}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (s: EquipmentStatus) => <Tag color={equipmentStatusConfig[s]?.color} style={{ fontSize: 11 }}>{equipmentStatusConfig[s]?.label}</Tag>,
    },
    {
      title: 'Mức độ rủi ro',
      key: 'risk',
      width: 120,
      render: (_, r) => {
        const lp = getLifespanPercent(r.yearReceived, r.designLifespan);
        const hp = getHoursPercent(r.operatingHours, r.maxOperatingHours);
        const max = Math.max(lp, hp);
        if (max >= 90) return <Tag color="error" icon={<WarningOutlined />} style={{ fontSize: 11 }}>Nghiêm trọng</Tag>;
        if (max >= 75) return <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontSize: 11 }}>Cảnh báo</Tag>;
        return <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 11 }}>Tốt</Tag>;
      },
      sorter: (a, b) => {
        const aMax = Math.max(getLifespanPercent(a.yearReceived, a.designLifespan), getHoursPercent(a.operatingHours, a.maxOperatingHours));
        const bMax = Math.max(getLifespanPercent(b.yearReceived, b.designLifespan), getHoursPercent(b.operatingHours, b.maxOperatingHours));
        return bMax - aMax;
      },
      defaultSortOrder: 'ascend',
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LineChartOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Phân tích Tuổi thọ Trang thiết bị</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Đánh giá mức độ hao mòn và dự báo tuổi thọ còn lại của trang thiết bị</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Risk summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          {
            label: 'Nghiêm trọng (>= 90%)',
            value: critical.length,
            gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
            icon: <WarningOutlined />,
            desc: 'Cần xử lý khẩn cấp',
          },
          {
            label: 'Cảnh báo (75-90%)',
            value: warning.length,
            gradient: 'linear-gradient(135deg, #faad14, #ffd666)',
            icon: <ClockCircleOutlined />,
            desc: 'Lên kế hoạch sớm',
          },
          {
            label: 'Bình thường (< 75%)',
            value: good.length,
            gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
            icon: <CheckCircleOutlined />,
            desc: 'Tình trạng tốt',
          },
          {
            label: 'Ngoài vận hành',
            value: filtered.filter(e => e.status === 'storage' || e.status === 'decommission').length,
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <ClockCircleOutlined />,
            desc: 'Cất kho / Thanh lý',
          },
        ].map((s, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: s.gradient, border: 'none', borderRadius: 14 }} styles={{ body: { padding: '16px 20px' } }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{s.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{s.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{s.label}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{s.value}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 }}>{s.desc}</div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filter & Chart toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <Space>
          <Select
            placeholder="Lọc theo loại sản phẩm"
            value={filterType || undefined}
            onChange={v => setFilterType(v || '')}
            style={{ width: 160 }}
            allowClear
          >
            {Object.entries(equipmentTypeConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
        </Space>
        <Segmented
          options={[
            { label: 'Theo tuổi thọ', value: 'lifespan' },
            { label: 'Theo giờ HĐ', value: 'hours' },
          ]}
          value={viewMode}
          onChange={v => setViewMode(v as 'lifespan' | 'hours')}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Bar chart */}
        <Col span={24}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}><LineChartOutlined /></div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>{viewMode === 'lifespan' ? 'Mức độ hao mòn tuổi thọ (%)' : 'Mức độ hao mòn giờ vận hành (%)'}</Text>
              </Space>
            }
          >
            {(() => {
              const chartData = viewMode === 'lifespan' ? lifespanChartData : hoursChartData;
              const colCount = 2;
              const half = Math.ceil(chartData.length / colCount);
              const cols = [chartData.slice(0, half), chartData.slice(half)];
              return (
                <Row gutter={[32, 0]}>
                  {cols.map((colData, ci) => (
                    <Col key={ci} span={12}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {colData.map((item, idx) => {
                          const rank = ci * half + idx + 1;
                          const color = item.value >= 90 ? '#ff4d4f' : item.value >= 75 ? '#faad14' : '#52c41a';
                          const bg = item.value >= 90 ? '#fff1f0' : item.value >= 75 ? '#fffbe6' : '#f6ffed';
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                background: rank <= 3 ? color : '#e8edf2',
                                color: rank <= 3 ? '#fff' : '#8c98a8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 700,
                              }}>{rank}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <Text
                                    ellipsis={{ tooltip: item.fullName }}
                                    style={{ fontSize: 12, fontWeight: 500, color: '#1B3A5C', maxWidth: '75%' }}
                                  >
                                    {item.name}
                                  </Text>
                                  <span style={{
                                    fontSize: 12, fontWeight: 700, color,
                                    background: bg, padding: '1px 7px', borderRadius: 10,
                                    border: `1px solid ${color}33`,
                                  }}>
                                    {item.value}%
                                  </span>
                                </div>
                                <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${Math.min(item.value, 100)}%`,
                                    background: item.value >= 90
                                      ? 'linear-gradient(90deg, #ff7875, #ff4d4f)'
                                      : item.value >= 75
                                      ? 'linear-gradient(90deg, #ffd666, #faad14)'
                                      : 'linear-gradient(90deg, #95de64, #52c41a)',
                                    borderRadius: 3,
                                    transition: 'width 0.6s ease',
                                  }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Col>
                  ))}
                </Row>
              );
            })()}
          </Card>
        </Col>

        {/* Scatter: lifespan vs hours */}
        <Col span={24}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#7c3aed18', border: '1px solid #7c3aed33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7c3aed' }}><LineChartOutlined /></div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tương quan tuổi thọ vs giờ HĐ</Text>
              </Space>
            }
          >
            <QuadrantChart data={scatterData} />
          </Card>
        </Col>
      </Row>

      {/* Detail table */}
      <Card
        style={{ borderRadius: 12 }}
        title={
          <Space size={10}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#D4A84318', border: '1px solid #D4A84333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#D4A843' }}><LineChartOutlined /></div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Chi tiết phân tích từng thiết bị</Text>
          </Space>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
          rowClassName={(r) => {
            const lp = getLifespanPercent(r.yearReceived, r.designLifespan);
            const hp = getHoursPercent(r.operatingHours, r.maxOperatingHours);
            if (lp >= 90 || hp >= 90) return 'row-highlight';
            return '';
          }}
        />
      </Card>
    </div>
  );
};

export default LifespanAnalysis;
