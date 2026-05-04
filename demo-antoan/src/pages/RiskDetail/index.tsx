import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Space, Tag, Button,
  Alert, Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  WarningOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { technicalRisks } from '../../data/risks';
import { safetyStandards } from '../../data/safetyStandards';
import {
  riskLevelConfig,
  riskStatusConfig,
  riskDataSourceConfig,
  hazardCategoryConfig,
  probabilityLabels,
  impactLabels,
  formatDate,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Text } = Typography;

const RiskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSafety } = useUser();

  const risk = technicalRisks.find(r => r.id === id);

  if (!risk) {
    return (
      <Alert
        message="Không tìm thấy rủi ro"
        description="Rủi ro này không tồn tại hoặc đã bị xóa."
        type="error"
        showIcon
        action={<Button onClick={() => navigate('/rui-ro')}>Quay lại</Button>}
      />
    );
  }

  const levelCfg    = riskLevelConfig[risk.riskLevel];
  const statusCfg   = riskStatusConfig[risk.status];
  const catCfg      = hazardCategoryConfig[risk.hazardCategory];
  const residualCfg = risk.residualRisk ? riskLevelConfig[risk.residualRisk] : null;

  const relatedStandards = safetyStandards.filter(s =>
    risk.relatedStandardIds.includes(s.id),
  );

  return (
    <div>
      {/* ─── Hero header banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 60%, #2d5a8e 100%)',
        borderRadius: 14, marginBottom: 0,
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space align="center" size={14}>
            <button
              onClick={() => navigate('/rui-ro')}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}
            >
              <ArrowLeftOutlined />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <WarningOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
                {risk.title}
              </div>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {risk.code}
                </Tag>
                <Tag style={{ background: `${levelCfg.bg}33`, color: '#fff', border: `1px solid ${levelCfg.bg}80`, borderRadius: 4, fontSize: 11 }}>
                  {levelCfg.label}
                </Tag>
              </Space>
            </div>
          </Space>

          {/* Status + actions */}
          <Space size={8} style={{ flexShrink: 0, marginTop: 4 }}>
            <Tag color={statusCfg.color} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
            {isSafety && risk.status !== 'closed' && (
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/rui-ro/${risk.id}/edit`)}
                style={{ borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                Chỉnh sửa
              </Button>
            )}
          </Space>
        </div>

        {/* Info strip */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Trung tâm', value: <span style={{ color: '#fff', fontWeight: 600 }}>{risk.workshopName}</span> },
            { label: 'Thiết bị / Quy trình', value: <span style={{ color: '#fff', fontWeight: 600 }}>{risk.equipmentOrProcess}</span> },
            { label: 'Loại nguy cơ', value: <Tag style={{ color: catCfg.color, borderColor: catCfg.color, background: 'transparent', margin: 0 }}>{catCfg.label}</Tag> },
            ...(risk.dataSource ? [{
              label: 'Nguồn nhận diện',
              value: (() => {
                const ds = riskDataSourceConfig[risk.dataSource!];
                return <Tag style={{ color: ds.color, borderColor: ds.color, background: 'transparent', margin: 0 }}>{ds.label}</Tag>;
              })(),
            }] : []),
            { label: 'Xác suất', value: <span style={{ color: '#fff', fontWeight: 600 }}>{risk.probability} — {probabilityLabels[risk.probability]}</span> },
            { label: 'Tác động', value: <span style={{ color: '#fff', fontWeight: 600 }}>{risk.impact} — {impactLabels[risk.impact]}</span> },
            { label: 'Trạng thái', value: <Tag color={statusCfg.color} style={{ margin: 0 }}>{statusCfg.label}</Tag> },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ margin: '16px 24px', padding: '12px 16px', borderLeft: '3px solid #D4A843', background: 'rgba(255,255,255,0.05)', borderRadius: '0 8px 8px 0' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{risk.description}</Text>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ margin: '16px 0' }}>
        {[
          {
            label: 'Điểm rủi ro',
            value: risk.riskScore,
            unit: 'điểm',
            gradient: `linear-gradient(135deg, ${levelCfg.bg}, ${levelCfg.bg}cc)`,
          },
          {
            label: 'Mức rủi ro',
            value: levelCfg.label,
            unit: '',
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          },
          {
            label: 'Xác suất × Tác động',
            value: `${risk.probability} × ${risk.impact}`,
            unit: '',
            gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
          },
          {
            label: 'Rủi ro còn lại',
            value: residualCfg ? residualCfg.label : 'Chưa đánh giá',
            unit: '',
            gradient: residualCfg
              ? `linear-gradient(135deg, ${residualCfg.bg}, ${residualCfg.bg}cc)`
              : 'linear-gradient(135deg, #8c8c8c, #bfbfbf)',
          },
        ].map(card => (
          <Col xs={12} sm={6} key={card.label}>
            <div
              style={{
                background: card.gradient, borderRadius: 12, padding: '16px 20px',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {card.value}
                {card.unit && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>{card.unit}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{card.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Nội dung chính ─── */}
      <Row gutter={[16, 16]}>
        {/* ─── Cột trái ─── */}
        <Col xs={24} lg={14}>
          {/* Mô tả & thông tin chi tiết */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #cf1322, #ff4d4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WarningOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Thông tin rủi ro</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              {[
                {
                  label: <><ToolOutlined style={{ marginRight: 4 }} />Thiết bị / Quy trình</>,
                  value: <Text strong>{risk.equipmentOrProcess}</Text>,
                  span: 2,
                },
                {
                  label: <><UserOutlined style={{ marginRight: 4 }} />Người phụ trách</>,
                  value: risk.responsiblePerson,
                  span: 1,
                },
                {
                  label: 'Trung tâm',
                  value: <Text strong>{risk.workshopName}</Text>,
                  span: 1,
                },
                ...(risk.dataSource ? [{
                  label: 'Nguồn nhận diện',
                  value: (() => {
                    const ds = riskDataSourceConfig[risk.dataSource!];
                    return <Tag style={{ borderRadius: 4, color: ds.color, borderColor: ds.color }}>{ds.label}</Tag>;
                  })(),
                  span: 1 as const,
                }] : []),
                {
                  label: <><CalendarOutlined style={{ marginRight: 4 }} />Ngày nhận diện</>,
                  value: formatDate(risk.identifiedAt),
                  span: 1,
                },
                ...(risk.assessedAt ? [{
                  label: 'Ngày đánh giá',
                  value: formatDate(risk.assessedAt),
                  span: 1 as const,
                }] : []),
                ...(risk.reviewDate ? [{
                  label: 'Ngày xem xét lại',
                  value: <Text style={{ color: '#fa8c16' }}>{formatDate(risk.reviewDate)}</Text>,
                  span: 1 as const,
                }] : []),
              ].map((row, idx) => (
                <div key={idx} style={{ width: row.span === 2 ? '100%' : '50%', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 3 }}>{row.label}</div>
                  <div style={{ fontSize: 13 }}>{row.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Biện pháp kiểm soát */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Biện pháp kiểm soát</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '8px 20px 20px' } }}
          >
            <Timeline
              style={{ marginTop: 16 }}
              items={risk.controlMeasures.map((measure, idx) => ({
                color: '#52c41a',
                children: (
                  <Text style={{ fontSize: 13 }}>
                    <Text strong style={{ color: '#1B3A5C', marginRight: 6 }}>{idx + 1}.</Text>
                    {measure}
                  </Text>
                ),
              }))}
            />
          </Card>

          {/* Ghi chú */}
          {risk.note && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ApartmentOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Ghi chú</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{risk.note}</Text>
            </Card>
          )}
        </Col>

        {/* ─── Cột phải ─── */}
        <Col xs={24} lg={10}>
          {/* Panel điểm rủi ro */}
          <Card
            style={{
              borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              marginBottom: 16,
              background: `linear-gradient(135deg, ${levelCfg.bg}15, ${levelCfg.bg}08)`,
              border: `1px solid ${levelCfg.bg}30`,
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>Điểm rủi ro</div>
              <div style={{
                width: 80, height: 80, borderRadius: 16,
                background: levelCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: 32, fontWeight: 800, color: levelCfg.color,
                boxShadow: `0 8px 24px ${levelCfg.bg}60`,
              }}>
                {risk.riskScore}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: levelCfg.bg }}>{levelCfg.label}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
                Xác suất {risk.probability} × Tác động {risk.impact}
              </div>
            </div>

            {residualCfg && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                borderRadius: 8, background: 'rgba(255,255,255,0.6)',
                border: `1px solid ${residualCfg.bg}30`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 13 }}>Rủi ro còn lại sau kiểm soát</Text>
                <Tag style={{ background: residualCfg.bg, color: residualCfg.color, border: 'none' }}>
                  {residualCfg.label}
                </Tag>
              </div>
            )}
          </Card>

          {/* Ghi nhận chấp nhận rủi ro */}
          {risk.status === 'accepted' && risk.acceptanceNote && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #8c8c8c, #bfbfbf)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Lý do chấp nhận rủi ro</Text>
                </Space>
              }
              style={{
                borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                marginBottom: 16, border: '1px solid #d9d9d9',
                background: '#fafafa',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#595959' }}>{risk.acceptanceNote}</Text>
            </Card>
          )}

          {/* Tiêu chuẩn liên quan */}
          {relatedStandards.length > 0 && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Tiêu chuẩn liên quan</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 0 } }}
            >
              {relatedStandards.map((std, idx) => (
                <div
                  key={std.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: idx < relatedStandards.length - 1 ? '1px solid #f5f5f5' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => navigate('/tieu-chuan')}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>
                      {std.code}: {std.title}
                    </Text>
                    <Tag color="success" style={{ fontSize: 11 }}>v{std.version}</Tag>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default RiskDetailPage;
