import React from 'react';
import { Card, Row, Col, Typography, Progress, Button } from 'antd';
import {
  BankOutlined, RightOutlined,
  TeamOutlined, ToolOutlined,
  ExclamationCircleOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { danhSachDonVi } from '../../data/donVi';
import { PageHeader, SummaryCard } from '../../components';
import type { SummaryCardItem } from '../../components';
import type { DonVi } from '../../types';

const { Text } = Typography;

const tongDonVi = danhSachDonVi.length;
const tongTB = danhSachDonVi.reduce((s, dv) => s + dv.soThietBi, 0);
const tongQuaHan = danhSachDonVi.reduce((s, dv) => s + dv.quaHan, 0);
const tyLeDatChuan = tongTB > 0 ? Math.round(((tongTB - tongQuaHan) / tongTB) * 100) : 100;

const CongDonVi: React.FC = () => {
  const navigate = useNavigate();

  const summaryItems: SummaryCardItem[] = [
    { key: 'units', label: 'Tổng đơn vị', value: tongDonVi, icon: <TeamOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'equipment', label: 'Tổng thiết bị', value: tongTB, icon: <ToolOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
    { key: 'overdue', label: 'TB quá hạn', value: tongQuaHan, icon: <ExclamationCircleOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'compliance', label: 'Tỷ lệ đạt chuẩn', value: tyLeDatChuan, icon: <SafetyCertificateOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<BankOutlined />}
        title="Cổng thông tin Đơn vị"
        subtitle="Quản lý thông tin đơn vị trực thuộc Doanh nghiệp A"
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      <Row gutter={[16, 16]}>
        {danhSachDonVi.map((dv: DonVi) => {
          const compliance = dv.soThietBi > 0
            ? Math.round(((dv.soThietBi - dv.quaHan) / dv.soThietBi) * 100)
            : 100;
          const complianceColor = compliance >= 90 ? colors.success : compliance >= 80 ? colors.warning : '#ff4d4f';

          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={dv.id}>
              <Card
                style={{
                  borderRadius: 10, border: 'none', height: '100%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer',
                }}
                styles={{ body: { padding: 20 } }}
                hoverable
                onClick={() => navigate('/thiet-bi')}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>{dv.ten}</Text>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 11,
                    fontWeight: 600, background: '#e8f4fd', color: '#1E6FD9', border: '1px solid #91caff',
                  }}>{dv.loai}</span>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: '#e8f4fd', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>{dv.soThietBi}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>Thiết bị</div>
                  </div>
                  <div style={{
                    flex: 1, borderRadius: 8, padding: '8px 12px', textAlign: 'center',
                    background: dv.quaHan > 0 ? '#fff1f0' : '#f0fce8',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: dv.quaHan > 0 ? '#ff4d4f' : colors.success }}>{dv.quaHan}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>Quá hạn</div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Tỷ lệ đạt chuẩn</Text>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: complianceColor }}>{compliance}%</Text>
                  </div>
                  <Progress percent={compliance} strokeColor={complianceColor} trailColor="#f0f0f0" size="small" showInfo={false} />
                </div>

                <Button
                  type="link"
                  style={{ padding: 0, fontSize: 13, color: colors.navy, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => { e.stopPropagation(); navigate('/thiet-bi'); }}
                >
                  Xem thiết bị <RightOutlined style={{ fontSize: 10 }} />
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default CongDonVi;
