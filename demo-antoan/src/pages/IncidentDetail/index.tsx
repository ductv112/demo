import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Space, Tag, Button,
  Steps, Timeline,
} from 'antd';
import {
  ArrowLeftOutlined, AlertOutlined,
  EditOutlined, UserOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { incidents } from '../../data/incidents';
import {
  incidentStatusConfig, incidentSeverityConfig,
  incidentTypeConfig, formatDate, formatDateTime, formatNumber,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Text } = Typography;

const stepLabels = [
  'Ghi nhận',
  'Phân loại & Đánh giá',
  'Điều tra nguyên nhân',
  'Xử lý & Khắc phục',
  'Đóng sự cố',
];

const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSafety } = useUser();

  const incident = incidents.find(i => i.id === id);

  if (!incident) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Text type="secondary">Không tìm thấy sự cố</Text>
        <br />
        <Button style={{ marginTop: 12 }} onClick={() => navigate('/su-co')}>Quay lại</Button>
      </div>
    );
  }

  const statusCfg   = incidentStatusConfig[incident.status];
  const severityCfg = incidentSeverityConfig[incident.severity];
  const typeCfg     = incidentTypeConfig[incident.type];

  return (
    <div>
      {/* ─── Hero header banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 60%, #2d5a8e 100%)',
        borderRadius: 14, marginBottom: 0, overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space align="center" size={14}>
            <button
              onClick={() => navigate('/su-co')}
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
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AlertOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
                {incident.title}
              </div>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {incident.code}
                </Tag>
                <Tag style={{ background: `${severityCfg.color}30`, color: severityCfg.color, border: `1px solid ${severityCfg.color}60`, borderRadius: 4, fontSize: 11 }}>
                  {severityCfg.label}
                </Tag>
              </Space>
            </div>
          </Space>

          {/* Status + actions */}
          <Space size={8} style={{ flexShrink: 0, marginTop: 4 }}>
            <Tag color={statusCfg.color} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
            {isSafety && incident.status !== 'closed' && (
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/su-co/${incident.id}/edit`)}
                style={{ borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                Cập nhật xử lý
              </Button>
            )}
          </Space>
        </div>

        {/* Info strip */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Phân xưởng', value: <span style={{ color: '#fff', fontWeight: 600 }}>{incident.workshopName}</span> },
            { label: 'Vị trí', value: <span style={{ color: 'rgba(255,255,255,0.85)' }}>{incident.location}</span> },
            { label: 'Thời điểm xảy ra', value: <span style={{ color: '#fff', fontWeight: 600 }}>{formatDateTime(incident.occurredAt)}</span> },
            { label: 'Người báo cáo', value: <span style={{ color: '#fff', fontWeight: 600 }}>{incident.reportedBy}</span> },
            { label: 'Loại sự cố', value: <Tag style={{ color: typeCfg.color, borderColor: typeCfg.color, background: 'transparent', margin: 0 }}>{typeCfg.label}</Tag> },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ margin: '16px 24px', padding: '12px 16px', borderLeft: '3px solid #D4A843', background: 'rgba(255,255,255,0.05)', borderRadius: '0 8px 8px 0' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{incident.description}</Text>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ margin: '16px 0' }}>
        {[
          {
            label: 'Mức độ sự cố',
            value: severityCfg.label,
            isText: true,
            gradient: `linear-gradient(135deg, ${severityCfg.color}, ${severityCfg.color}cc)`,
          },
          {
            label: 'Số người bị thương',
            value: incident.injuryCount,
            unit: 'người',
            gradient: incident.injuryCount > 0
              ? 'linear-gradient(135deg, #cf1322, #ff4d4f)'
              : 'linear-gradient(135deg, #059669, #10b981)',
          },
          {
            label: 'Thiệt hại ước tính',
            value: incident.damageEstimate && incident.damageEstimate > 0
              ? `${formatNumber(Math.round(incident.damageEstimate / 1000000))} tr`
              : '—',
            isText: true,
            gradient: incident.damageEstimate && incident.damageEstimate > 0
              ? 'linear-gradient(135deg, #d97706, #fbbf24)'
              : 'linear-gradient(135deg, #6b7280, #9ca3af)',
          },
          {
            label: 'Bước xử lý hiện tại',
            value: `${incident.currentStep + 1}/${stepLabels.length}`,
            isText: true,
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          },
        ].map((card, i) => (
          <Col xs={12} sm={6} key={i}>
            <div style={{
              background: card.gradient, borderRadius: 12, padding: '16px 20px',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: card.isText ? 18 : 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {card.value}
                {!card.isText && 'unit' in card && card.unit && (
                  <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>{card.unit}</span>
                )}
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
          {/* Workflow Steps */}
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 32px' } }}
          >
            <Steps
              current={incident.currentStep}
              status={incident.status === 'closed' ? 'finish' : 'process'}
              items={stepLabels.map((label, idx) => ({
                title: <span style={{ fontSize: 13, fontWeight: idx === incident.currentStep ? 600 : 400 }}>{label}</span>,
                description: incident.actions[idx]
                  ? <span style={{ fontSize: 11, color: '#8c8c8c' }}>{formatDateTime(incident.actions[idx].timestamp)}</span>
                  : undefined,
              }))}
            />
          </Card>

          {/* Hành động khẩn cấp */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#d97706' }}>Hành động khẩn cấp ban đầu</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{incident.immediateAction}</Text>
          </Card>

          {/* Phân tích nguyên nhân & Biện pháp */}
          {(incident.rootCause || incident.correctiveAction || incident.preventiveAction) && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Phân tích & Biện pháp xử lý</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 20 } }}
            >
              {incident.rootCause && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 13, color: '#1B3A5C', display: 'block', marginBottom: 6 }}>Nguyên nhân gốc rễ</Text>
                  <div style={{ background: '#fff7e6', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #faad14' }}>
                    <Text style={{ fontSize: 13 }}>{incident.rootCause}</Text>
                  </div>
                </div>
              )}
              {incident.correctiveAction && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 13, color: '#1B3A5C', display: 'block', marginBottom: 6 }}>Biện pháp khắc phục</Text>
                  <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #1890ff' }}>
                    <Text style={{ fontSize: 13 }}>{incident.correctiveAction}</Text>
                  </div>
                </div>
              )}
              {incident.preventiveAction && (
                <div>
                  <Text strong style={{ fontSize: 13, color: '#1B3A5C', display: 'block', marginBottom: 6 }}>Biện pháp phòng ngừa</Text>
                  <div style={{ background: '#f6ffed', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #52c41a' }}>
                    <Text style={{ fontSize: 13 }}>{incident.preventiveAction}</Text>
                  </div>
                </div>
              )}
            </Card>
          )}
        </Col>

        {/* ─── Cột phải ─── */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Lịch sử xử lý</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 72 }}
            styles={{ body: { padding: 20 } }}
          >
            <Timeline
              items={incident.actions.map((action, idx) => ({
                color: idx === incident.actions.length - 1 ? '#1B3A5C' : '#52c41a',
                children: (
                  <div style={{ paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>
                        {stepLabels[action.step]}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatDateTime(action.timestamp)}
                      </Text>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      <UserOutlined style={{ marginRight: 4 }} />{action.actor}
                    </div>
                    <div style={{ fontSize: 12, color: '#1a1a2e', marginTop: 6, background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>
                      {action.note}
                    </div>
                  </div>
                ),
              }))}
            />

            {incident.status === 'closed' && incident.closedAt && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #f6ffed, #e6f7e9)', border: '1px solid #b7eb8f' }}>
                <div style={{ fontWeight: 600, color: '#389e0d', fontSize: 13 }}>
                  <CheckCircleOutlined style={{ marginRight: 6 }} />Sự cố đã được đóng
                </div>
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>
                  {formatDate(incident.closedAt)} — {incident.closedBy}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IncidentDetailPage;
