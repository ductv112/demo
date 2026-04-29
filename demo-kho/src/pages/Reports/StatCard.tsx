import { Card } from 'antd';

const StatCard = ({ icon, label, value, suffix, gradient }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  gradient: string;
}) => (
  <Card
    style={{ borderRadius: 14, overflow: 'hidden', border: 'none' }}
    styles={{ body: { padding: 20, background: gradient, position: 'relative' } }}
    className="stat-card"
  >
    <div style={{
      position: 'absolute', top: -8, right: -8, fontSize: 64, opacity: 0.1, color: '#fff',
      transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
    }} className="stat-card-bg-icon">
      {icon}
    </div>
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      fontSize: 16, marginBottom: 12,
    }}>
      {icon}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
      {value}
      {suffix && <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}
    </div>
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{label}</div>
  </Card>
);

export default StatCard;
