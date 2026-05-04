import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag, Badge, Progress } from 'antd';
import {
  AlertOutlined,
  WarningOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/charts';
import { incidents } from '../../data/incidents';
import { technicalRisks } from '../../data/risks';
import { violations } from '../../data/violations';
import { safetyAlerts } from '../../data/alerts';
import {
  incidentSeverityConfig,
  incidentStatusConfig,
  riskLevelConfig,
  violationStatusConfig,
  alertSeverityConfig,
  formatDate,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

// ─── Dữ liệu biểu đồ xu hướng sự cố theo tháng ───
const incidentTrendData = [
  { thang: 'T10/2025', loai: 'Nghiêm trọng', soLuong: 1 },
  { thang: 'T10/2025', loai: 'Trung bình',   soLuong: 2 },
  { thang: 'T10/2025', loai: 'Nhẹ',          soLuong: 3 },
  { thang: 'T11/2025', loai: 'Nghiêm trọng', soLuong: 0 },
  { thang: 'T11/2025', loai: 'Trung bình',   soLuong: 1 },
  { thang: 'T11/2025', loai: 'Nhẹ',          soLuong: 2 },
  { thang: 'T12/2025', loai: 'Nghiêm trọng', soLuong: 1 },
  { thang: 'T12/2025', loai: 'Trung bình',   soLuong: 2 },
  { thang: 'T12/2025', loai: 'Nhẹ',          soLuong: 2 },
  { thang: 'T1/2026',  loai: 'Nghiêm trọng', soLuong: 0 },
  { thang: 'T1/2026',  loai: 'Trung bình',   soLuong: 1 },
  { thang: 'T1/2026',  loai: 'Nhẹ',          soLuong: 3 },
  { thang: 'T2/2026',  loai: 'Nghiêm trọng', soLuong: 0 },
  { thang: 'T2/2026',  loai: 'Trung bình',   soLuong: 1 },
  { thang: 'T2/2026',  loai: 'Nhẹ',          soLuong: 1 },
  { thang: 'T3/2026',  loai: 'Nghiêm trọng', soLuong: 1 },
  { thang: 'T3/2026',  loai: 'Trung bình',   soLuong: 2 },
  { thang: 'T3/2026',  loai: 'Nhẹ',          soLuong: 1 },
  { thang: 'T4/2026',  loai: 'Nghiêm trọng', soLuong: 1 },
  { thang: 'T4/2026',  loai: 'Trung bình',   soLuong: 2 },
  { thang: 'T4/2026',  loai: 'Nhẹ',          soLuong: 1 },
];

const complianceTrendData = [
  { thang: 'T10/2025', tiLeThang: 88 },
  { thang: 'T11/2025', tiLeThang: 91 },
  { thang: 'T12/2025', tiLeThang: 85 },
  { thang: 'T1/2026',  tiLeThang: 93 },
  { thang: 'T2/2026',  tiLeThang: 90 },
  { thang: 'T3/2026',  tiLeThang: 87 },
  { thang: 'T4/2026',  tiLeThang: 84 },
];

const workshopComplianceData = [
  { xuong: 'TT Phần mềm Alpha', tiLe: 88, soViPham: 2 },
  { xuong: 'TT Phần mềm Beta',  tiLe: 72, soViPham: 3 },
  { xuong: 'TT Phần mềm Gamma', tiLe: 91, soViPham: 1 },
  { xuong: 'TT DevOps',         tiLe: 69, soViPham: 3 },
];

const kpiCards = [
  {
    title: 'Tổng sự cố tháng này',
    icon: <AlertOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <AlertOutlined />,
    gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    shadowColor: 'rgba(27,58,92,0.35)',
    link: '/su-co',
  },
  {
    title: 'Rủi ro mức cao/rất cao',
    icon: <WarningOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <WarningOutlined />,
    gradient: 'linear-gradient(135deg, #cf1322 0%, #ff4d4f 100%)',
    shadowColor: 'rgba(207,19,34,0.35)',
    link: '/rui-ro',
  },
  {
    title: 'Tỷ lệ tuân thủ',
    icon: <SafetyOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <SafetyOutlined />,
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadowColor: 'rgba(5,150,105,0.35)',
    link: '/vi-pham',
  },
  {
    title: 'Vi phạm chưa xử lý',
    icon: <FileProtectOutlined style={{ fontSize: 26, color: '#fff' }} />,
    bgIcon: <FileProtectOutlined />,
    gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    shadowColor: 'rgba(217,119,6,0.35)',
    link: '/vi-pham',
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  // Tính toán KPI
  const currentMonth = '2026-04';
  const monthlyIncidents = incidents.filter(i => i.occurredAt.startsWith(currentMonth));
  const totalMonthlyIncidents = monthlyIncidents.length;

  const highRisks = technicalRisks.filter(r =>
    (r.riskLevel === 'high' || r.riskLevel === 'very_high') && r.status !== 'closed'
  ).length;

  const openViolations = violations.filter(v => v.status === 'new' || v.status === 'handling').length;
  const totalViolations = violations.length;
  const resolvedViolations = violations.filter(v => v.status === 'resolved' || v.status === 'closed').length;
  const complianceRate = totalViolations > 0 ? Math.round((resolvedViolations / totalViolations) * 100) : 100;

  const unresolvedAlerts = safetyAlerts.filter(a => !a.isResolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical');

  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const kpiValues = [totalMonthlyIncidents, highRisks, complianceRate, openViolations];
  const kpiUnits  = ['sự cố', 'rủi ro', '%', 'vi phạm'];

  // ─── Chart configs ───
  const columnConfig = {
    data: incidentTrendData,
    xField: 'thang',
    yField: 'soLuong',
    colorField: 'loai',
    stack: true,
    scale: { color: { range: ['#ff4d4f', '#faad14', '#52c41a'] } },
  };

  const lineConfig = {
    data: complianceTrendData,
    xField: 'thang',
    yField: 'tiLeThang',
    style: { lineWidth: 2.5, stroke: '#1B3A5C' },
    point: { size: 4, style: { fill: '#1B3A5C', stroke: '#fff', lineWidth: 2 } },
    scale: { y: { domainMin: 70, domainMax: 100 } },
  };

  const recentIncidents = [...incidents]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 5);

  const topRisks = technicalRisks
    .filter(r => r.status !== 'closed')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <div>
      {/* ─── Hero Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 50%, #2d5a8e 100%)',
        borderRadius: 16, padding: '28px 32px 24px',
        position: 'relative', overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{
          position: 'absolute', top: '-50%', right: '-20%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(45,90,142,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 4 }}>{dateStr}</div>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
              Tổng quan An toàn Kỹ thuật
            </Title>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
              Doanh nghiệp A — Xin chào, <strong style={{ color: '#D4A843' }}>{currentUser.name}</strong>
            </div>
          </Col>
          <Col>
            {criticalAlerts.length > 0 && (
              <div style={{
                background: 'rgba(255,77,79,0.15)', border: '1px solid rgba(255,77,79,0.4)',
                borderRadius: 10, padding: '10px 18px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <AlertOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                <div>
                  <div style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 14 }}>
                    {criticalAlerts.length} cảnh báo nghiêm trọng
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Cần xử lý ngay</div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* ─── KPI Cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {kpiCards.map((cfg, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <div
              className="db-stat-card"
              style={{
                background: cfg.gradient,
                borderRadius: 14, padding: '20px 24px',
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${cfg.shadowColor}`,
              }}
              onClick={() => navigate(cfg.link)}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = `0 12px 32px ${cfg.shadowColor}`;
                const icon = el.querySelector('.db-bg-icon') as HTMLElement;
                if (icon) icon.style.transform = 'rotate(15deg) scale(1.15)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = `0 4px 16px ${cfg.shadowColor}`;
                const icon = el.querySelector('.db-bg-icon') as HTMLElement;
                if (icon) icon.style.transform = 'rotate(0) scale(1)';
              }}
            >
              <div className="db-bg-icon" style={{
                position: 'absolute', top: 12, right: 16,
                fontSize: 64, opacity: 0.1, color: '#fff',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                {cfg.bgIcon}
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#fff', marginBottom: 12,
              }}>
                {cfg.icon}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {kpiValues[idx]}
                <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>
                  {kpiUnits[idx]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                {cfg.title}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Biểu đồ ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 14 }}>Xu hướng sự cố</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>6 tháng gần nhất</div>
                </div>
              </Space>
            }
            styles={{ body: { padding: '16px 20px 20px' } }}
          >
            <Column {...columnConfig} height={220} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RiseOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 14 }}>Tỷ lệ tuân thủ an toàn</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>Mục tiêu ≥ 90%</div>
                </div>
              </Space>
            }
            styles={{ body: { padding: '16px 20px 20px' } }}
          >
            <Line {...lineConfig} height={220} />
          </Card>
        </Col>
      </Row>

      {/* ─── Cảnh báo nóng + Tình trạng tuân thủ ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #cf1322, #ff4d4f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <WarningOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 14 }}>Rủi ro cần xử lý ngay</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>Top 5 rủi ro cao nhất đang mở</div>
                </div>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
            extra={
              <Text
                style={{ fontSize: 12, color: '#1B3A5C', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/rui-ro')}
              >
                Xem tất cả →
              </Text>
            }
          >
            {topRisks.map((risk, idx) => {
              const levelCfg = riskLevelConfig[risk.riskLevel];
              return (
                <div
                  key={risk.id}
                  onClick={() => navigate(`/rui-ro/${risk.id}`)}
                  style={{
                    padding: '12px 20px',
                    borderBottom: idx < topRisks.length - 1 ? '1px solid #f5f5f5' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: levelCfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: levelCfg.color,
                    flexShrink: 0,
                  }}>
                    {risk.riskScore}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {risk.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {risk.workshopName} — {risk.equipmentOrProcess}
                    </div>
                  </div>
                  <Tag style={{ background: levelCfg.bg, color: levelCfg.color, border: 'none', flexShrink: 0 }}>
                    {levelCfg.label}
                  </Tag>
                </div>
              );
            })}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SafetyOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 14 }}>Tình trạng tuân thủ theo trung tâm</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>Tháng 04/2026</div>
                </div>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            {workshopComplianceData.map((wx, idx) => {
              const color = wx.tiLe >= 90 ? '#52c41a' : wx.tiLe >= 80 ? '#faad14' : '#ff4d4f';
              return (
                <div key={idx} style={{
                  padding: '14px 20px',
                  borderBottom: idx < workshopComplianceData.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{wx.xuong}</Text>
                    <Space size={8}>
                      {wx.soViPham > 0 && (
                        <Tag color="error" style={{ margin: 0, fontSize: 11 }}>
                          {wx.soViPham} vi phạm
                        </Tag>
                      )}
                      <Text strong style={{ color, fontSize: 13 }}>{wx.tiLe}%</Text>
                    </Space>
                  </div>
                  <Progress
                    percent={wx.tiLe}
                    strokeColor={color}
                    showInfo={false}
                    size="small"
                    style={{ marginBottom: 0 }}
                  />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>

      {/* ─── Sự cố gần đây + Cảnh báo hệ thống ─── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 14 }}>Sự cố gần đây</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>5 sự cố mới nhất</div>
                </div>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
            extra={
              <Text
                style={{ fontSize: 12, color: '#1B3A5C', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/su-co')}
              >
                Xem tất cả →
              </Text>
            }
          >
            {recentIncidents.map((inc, idx) => {
              const severityCfg = incidentSeverityConfig[inc.severity];
              const statusCfg   = incidentStatusConfig[inc.status];
              return (
                <div
                  key={inc.id}
                  onClick={() => navigate(`/su-co/${inc.id}`)}
                  style={{
                    padding: '12px 20px',
                    borderBottom: idx < recentIncidents.length - 1 ? '1px solid #f5f5f5' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: severityCfg.color, flexShrink: 0,
                    marginTop: 2,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      [{inc.code}] {inc.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {inc.workshopName} — {formatDate(inc.occurredAt.split(' ')[0])}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <Tag color={severityCfg.color} style={{ border: 'none', margin: 0, fontSize: 11 }}>
                      {severityCfg.label}
                    </Tag>
                    <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>
                      {statusCfg.label}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            className="db-chart-card"
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #d97706, #fbbf24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClockCircleOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 14 }}>Cảnh báo hệ thống</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>
                    {unresolvedAlerts.length} cảnh báo chưa xử lý
                  </div>
                </div>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            {unresolvedAlerts.slice(0, 6).map((alert, idx) => {
              const cfg = alertSeverityConfig[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`alert-card ${alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}`}
                  style={{
                    padding: '10px 16px',
                    borderBottom: idx < unresolvedAlerts.length - 1 ? '1px solid #f5f5f5' : 'none',
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: alert.isRead ? 400 : 600, color: '#1a1a2e', fontSize: 12, flex: 1, paddingRight: 8 }}>
                      {alert.title}
                    </div>
                    <Badge color={cfg.color} />
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                    {alert.description.substring(0, 70)}…
                  </div>
                </div>
              );
            })}

            {/* ─── Tóm tắt trạng thái sự cố ─── */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f5f5f5', display: 'flex', gap: 12 }}>
              {[
                { label: 'Đã đóng', count: incidents.filter(i => i.status === 'closed').length, color: '#52c41a', icon: <CheckCircleOutlined /> },
                { label: 'Đang xử lý', count: incidents.filter(i => i.status !== 'closed').length, color: '#faad14', icon: <ClockCircleOutlined /> },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '10px 8px' }}>
                  <div style={{ color: s.color, fontSize: 18, fontWeight: 700 }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
