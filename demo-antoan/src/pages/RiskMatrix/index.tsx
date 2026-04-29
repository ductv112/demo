import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Tag, Button, Tooltip } from 'antd';
import { ApartmentOutlined, WarningOutlined } from '@ant-design/icons';
import { technicalRisks } from '../../data/risks';
import { riskLevelConfig, getRiskMatrixColor, hazardCategoryConfig } from '../../utils/format';
import type { TechnicalRisk } from '../../types';

const { Title, Text } = Typography;

const PROB_LABELS: Record<number, string> = {
  5: 'Gần như chắc chắn (5)',
  4: 'Có khả năng cao (4)',
  3: 'Có thể xảy ra (3)',
  2: 'Ít có khả năng (2)',
  1: 'Hiếm khi (1)',
};

const IMPACT_LABELS: Record<number, string> = {
  1: 'Không đáng kể (1)',
  2: 'Nhẹ (2)',
  3: 'Trung bình (3)',
  4: 'Nghiêm trọng (4)',
  5: 'Thảm khốc (5)',
};

const RiskMatrixPage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCell, setHoveredCell] = useState<{ p: number; i: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  // Nhóm rủi ro theo ô ma trận
  const getRisksInCell = (probability: number, impact: number): TechnicalRisk[] =>
    technicalRisks.filter(r =>
      r.probability === probability &&
      r.impact === impact &&
      r.status !== 'closed'
    );

  const selectedRisks = selectedCell
    ? getRisksInCell(selectedCell.p, selectedCell.i)
    : [];

  // Thống kê theo mức
  const levelCounts = {
    very_high: technicalRisks.filter(r => r.riskLevel === 'very_high' && r.status !== 'closed').length,
    high:      technicalRisks.filter(r => r.riskLevel === 'high'      && r.status !== 'closed').length,
    medium:    technicalRisks.filter(r => r.riskLevel === 'medium'    && r.status !== 'closed').length,
    low:       technicalRisks.filter(r => r.riskLevel === 'low'       && r.status !== 'closed').length,
    very_low:  technicalRisks.filter(r => r.riskLevel === 'very_low'  && r.status !== 'closed').length,
  };

  return (
    <div>
      {/* ─── Page header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ApartmentOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Ma trận Rủi ro Kỹ thuật
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Phân bổ rủi ro theo mức xác suất và mức độ tác động — Nhà máy Z119
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<WarningOutlined />}
          onClick={() => navigate('/rui-ro')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}
        >
          Danh sách rủi ro
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* ─── Ma trận ─── */}
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(riskLevelConfig).reverse().map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: cfg.bg }} />
                  <Text style={{ fontSize: 12 }}>{cfg.label}: {levelCounts[key as keyof typeof levelCounts]}</Text>
                </div>
              ))}
            </div>

            {/* Ma trận 5×5 */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
                <colgroup>
                  <col style={{ width: 160 }} />
                  {[1, 2, 3, 4, 5].map(i => <col key={i} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 4px', textAlign: 'center', fontSize: 12, color: '#1B3A5C', fontWeight: 700, background: '#f5f7fa', borderRadius: 6 }}>
                      Xác suất \ Tác động
                    </th>
                    {[1, 2, 3, 4, 5].map(impact => (
                      <th key={impact} style={{
                        padding: '8px 6px', textAlign: 'center',
                        fontSize: 11, color: '#666', fontWeight: 600,
                        background: '#f5f7fa', borderRadius: 6,
                      }}>
                        {IMPACT_LABELS[impact].split(' (')[0]}
                        <br />
                        <span style={{ color: '#1B3A5C', fontWeight: 700 }}>({impact})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map(prob => (
                    <tr key={prob}>
                      <td style={{
                        padding: '8px 10px', fontSize: 11, color: '#666', fontWeight: 600,
                        background: '#f5f7fa', borderRadius: 6, textAlign: 'right',
                      }}>
                        {PROB_LABELS[prob].split(' (')[0]}
                        <br />
                        <span style={{ color: '#1B3A5C', fontWeight: 700 }}>({prob})</span>
                      </td>
                      {[1, 2, 3, 4, 5].map(impact => {
                        const cellColor = getRiskMatrixColor(prob, impact);
                        const cellRisks = getRisksInCell(prob, impact);
                        const isHovered = hoveredCell?.p === prob && hoveredCell?.i === impact;
                        const isSelected = selectedCell?.p === prob && selectedCell?.i === impact;

                        return (
                          <td key={impact}>
                            <Tooltip
                              title={
                                cellRisks.length > 0
                                  ? <div>{cellRisks.map(r => <div key={r.id}>{r.code}: {r.title.substring(0, 50)}...</div>)}</div>
                                  : 'Không có rủi ro'
                              }
                              placement="top"
                            >
                              <div
                                className="risk-matrix-cell"
                                style={{
                                  background: cellColor,
                                  opacity: isHovered ? 0.75 : 1,
                                  borderRadius: 6,
                                  minHeight: 64,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: cellRisks.length > 0 ? 'pointer' : 'default',
                                  border: isSelected ? '3px solid #0a1628' : '2px solid transparent',
                                  transition: 'all 0.2s',
                                  padding: 4,
                                }}
                                onMouseEnter={() => setHoveredCell({ p: prob, i: impact })}
                                onMouseLeave={() => setHoveredCell(null)}
                                onClick={() => {
                                  if (cellRisks.length > 0) {
                                    setSelectedCell(isSelected ? null : { p: prob, i: impact });
                                  }
                                }}
                              >
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                  {prob * impact}
                                </div>
                                {cellRisks.length > 0 && (
                                  <div style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 2,
                                  }}>
                                    {cellRisks.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: '#8c8c8c', textAlign: 'center' }}>
              Trục ngang: Mức độ tác động (1=Không đáng kể → 5=Thảm khốc) &nbsp;|&nbsp; Trục dọc: Xác suất xảy ra (1=Hiếm khi → 5=Gần như chắc chắn)
            </div>
          </Card>
        </Col>

        {/* ─── Panel bên phải ─── */}
        <Col xs={24} lg={8}>
          {/* Tóm tắt theo mức */}
          <Card
            title={<Text strong style={{ color: '#1B3A5C' }}>Tóm tắt rủi ro đang mở</Text>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 16 } }}
          >
            {Object.entries(riskLevelConfig).reverse().map(([key, cfg]) => {
              const count = levelCounts[key as keyof typeof levelCounts];
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8, marginBottom: 6,
                  background: `${cfg.bg}15`,
                }}>
                  <Space size={8}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: cfg.bg }} />
                    <Text style={{ fontSize: 13 }}>{cfg.label}</Text>
                  </Space>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: cfg.color,
                  }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Danh sách rủi ro trong ô đang chọn hoặc tất cả rủi ro cao */}
          <Card
            title={
              <Text strong style={{ color: '#1B3A5C' }}>
                {selectedCell
                  ? `Rủi ro ô (X:${selectedCell.i}, Y:${selectedCell.p})`
                  : 'Rủi ro mức cao / rất cao'}
              </Text>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 0 } }}
            extra={
              selectedCell ? (
                <Button type="text" size="small" onClick={() => setSelectedCell(null)} style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Bỏ chọn
                </Button>
              ) : null
            }
          >
            {(selectedCell ? selectedRisks : technicalRisks.filter(r =>
              (r.riskLevel === 'high' || r.riskLevel === 'very_high') && r.status !== 'closed'
            ).sort((a, b) => b.riskScore - a.riskScore)).map((risk, idx, arr) => {
              const levelCfg = riskLevelConfig[risk.riskLevel];
              const catCfg   = hazardCategoryConfig[risk.hazardCategory];
              return (
                <div
                  key={risk.id}
                  onClick={() => navigate(`/rui-ro/${risk.id}`)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: idx < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ fontWeight: 600, fontSize: 12, color: '#1B3A5C', flex: 1, paddingRight: 8 }}>
                      {risk.code}: {risk.title.substring(0, 55)}...
                    </Text>
                    <div style={{
                      width: 24, height: 24, borderRadius: 5, background: levelCfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: levelCfg.color, flexShrink: 0,
                    }}>
                      {risk.riskScore}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Tag style={{ fontSize: 10, margin: 0, borderRadius: 3, color: catCfg.color, borderColor: catCfg.color }}>
                      {catCfg.label}
                    </Tag>
                    <Tag style={{ fontSize: 10, margin: 0, borderRadius: 3 }}>
                      {risk.workshopName.split(' - ')[0]}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RiskMatrixPage;
