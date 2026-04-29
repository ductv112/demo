import React, { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Input, Select, Tabs, Tag, Drawer, Progress, Divider, Badge, Button, Form, InputNumber, message } from 'antd';
import type { FormInstance } from 'antd';
import {
  ExperimentOutlined, DashboardOutlined,
  CloudOutlined, ThunderboltOutlined,
  UnorderedListOutlined, EnvironmentOutlined,
  SearchOutlined, UserOutlined,
  SafetyCertificateOutlined, ToolOutlined,
  FileTextOutlined, ClockCircleOutlined,
  CheckCircleOutlined, SyncOutlined,
  CloseCircleOutlined, InboxOutlined, PlusOutlined,
} from '@ant-design/icons';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { colors } from '../../theme/themeConfig';
import { danhSachPhongLab } from '../../data/phongLab';
import { danhSachYeuCau } from '../YeuCau/data';
import { danhSachKeHoach } from '../../data/keHoachDo';
import { danhSachThietBi } from '../../data/thietBi';
import { PageHeader, StatusBadge } from '../../components';
import type { PhongLab, TrangThaiLab } from '../../types';

const { Text } = Typography;
const { Option } = Select;

const envRows: { key: keyof Pick<PhongLab, 'nhietDo' | 'doAm' | 'rungDong'>; label: string; icon: React.ReactNode; unit: string }[] = [
  { key: 'nhietDo', label: 'Nhiệt độ', icon: <DashboardOutlined />, unit: '' },
  { key: 'doAm', label: 'Độ ẩm', icon: <CloudOutlined />, unit: '' },
  { key: 'rungDong', label: 'Rung động', icon: <ThunderboltOutlined />, unit: '' },
];

const STATUS_COLOR: Record<string, string> = { hoat_dong: '#10b981', bao_tri: '#8b5cf6', tam_dung: '#9ca3af' };
const STATUS_LABEL: Record<string, string> = { hoat_dong: 'Hoạt động', bao_tri: 'Bảo trì', tam_dung: 'Tạm dừng' };

/* Map lab ID → YeuCau phongLab name for counting */
const LAB_YC_MAP: Record<string, string[]> = {
  'LAB-01': ['Phòng Lab Điện-Điện tử'],
  'LAB-02': ['Phòng Lab Áp suất', 'Phòng Lab Lưu lượng'],
  'LAB-03': ['Phòng Lab Tần số-Vô tuyến'],
  'LAB-04': ['Phòng Lab Nhiệt-Quang'],
  'LAB-05': ['Phòng Lab Rung động'],
  'LAB-06': ['Phòng Lab Khối lượng-Hình học'],
};

/* Get equipment for a lab — match by phongLab field directly */

const TB_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  con_han: { label: 'Còn hạn', color: '#15803d', bg: '#f0fdf4' },
  sap_han: { label: 'Sắp hạn', color: '#d97706', bg: '#fffbeb' },
  het_han: { label: 'Hết hạn', color: '#dc2626', bg: '#fef2f2' },
  dang_hieu_chuan: { label: 'Đang HC', color: '#7c3aed', bg: '#f5f3ff' },
};

interface SiteGroup {
  labs: PhongLab[];
  lat: number; lng: number;
  donVi: string; viTri: string;
}

function groupByLocation(labs: PhongLab[]): SiteGroup[] {
  const map: Record<string, SiteGroup> = {};
  labs.forEach((l) => {
    const key = `${l.toaDo.lat}-${l.toaDo.lng}`;
    if (!map[key]) map[key] = { labs: [], lat: l.toaDo.lat, lng: l.toaDo.lng, donVi: l.donVi, viTri: l.viTri };
    map[key].labs.push(l);
  });
  return Object.values(map);
}

function FitBounds({ sites }: { sites: SiteGroup[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (sites.length > 0) {
      const bounds = sites.map((s) => [s.lat, s.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }, [sites, map]);
  return null;
}

/* Get YC stats for a lab */
function getLabYCStats(labId: string) {
  const names = LAB_YC_MAP[labId] || [];
  const related = danhSachYeuCau.filter((yc) => names.includes(yc.phongLab));
  const active = related.filter((yc) => ['da_tiep_nhan', 'dang_do', 'cho_phe_duyet'].includes(yc.trangThai));
  const done = related.filter((yc) => yc.trangThai === 'hoan_thanh');
  return { total: related.length, active: active.length, done: done.length, list: related };
}

/* Get KH stats for a lab */
function getLabKHStats(labId: string) {
  const related = danhSachKeHoach.filter((kh) => kh.phongLab === labId);
  const active = related.filter((kh) => ['dang_thuc_hien', 'da_duyet'].includes(kh.trangThai));
  return { total: related.length, active: active.length, list: related };
}

/* Get equipment for a lab by phongLab field */
function getLabThietBi(labId: string) {
  return danhSachThietBi.filter((tb) => tb.phongLab === labId);
}

const pageCSS = `
  .lab-tabs .ant-tabs-nav { margin-bottom: 0; }
  .lab-tabs .ant-tabs-nav::before { border-bottom: 1px solid #eef1f6; }
  .lab-tabs .ant-tabs-tab { padding: 12px 6px !important; font-size: 13px !important; font-weight: 500 !important; color: #6b7280 !important; }
  .lab-tabs .ant-tabs-tab:hover { color: ${colors.navy} !important; }
  .lab-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${colors.navy} !important; font-weight: 600 !important; }
  .lab-tabs .ant-tabs-ink-bar { height: 2.5px !important; border-radius: 2px; }
  .lab-tabs .ant-tabs-content-holder { padding-top: 20px; }
  .leaflet-popup-content-wrapper { border-radius: 10px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important; padding: 0 !important; }
  .leaflet-popup-content { margin: 0 !important; width: 340px !important; }
  .leaflet-popup-close-button { display: none !important; }
  .leaflet-container { border-radius: 10px; font-family: inherit; }
  .lab-card-hover { transition: all 0.2s !important; }
  .lab-card-hover:hover { transform: translateY(-2px) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
`;

const PhongLabPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterTT, setFilterTT] = useState('');
  const [filterVung, setFilterVung] = useState('');
  const [selectedLab, setSelectedLab] = useState<PhongLab | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return danhSachPhongLab.filter((lab) => {
      const matchText = !s || lab.ten.toLowerCase().includes(s) || lab.id.toLowerCase().includes(s) || lab.truongPhong.toLowerCase().includes(s) || lab.donVi.toLowerCase().includes(s);
      const matchTT = !filterTT || lab.trangThai === filterTT;
      const matchVung = !filterVung || lab.vungMien === filterVung;
      return matchText && matchTT && matchVung;
    });
  }, [search, filterTT, filterVung]);

  const stats = useMemo(() => ({
    total: danhSachPhongLab.length,
    hoatDong: danhSachPhongLab.filter((l) => l.trangThai === 'hoat_dong').length,
    baoTri: danhSachPhongLab.filter((l) => l.trangThai === 'bao_tri').length,
    tamDung: danhSachPhongLab.filter((l) => l.trangThai === 'tam_dung').length,
    totalTB: danhSachPhongLab.reduce((s, l) => s + l.soThietBi, 0),
  }), []);

  const sites = useMemo(() => groupByLocation(danhSachPhongLab), []);

  const labYC = useMemo(() => selectedLab ? getLabYCStats(selectedLab.id) : null, [selectedLab]);
  const labKH = useMemo(() => selectedLab ? getLabKHStats(selectedLab.id) : null, [selectedLab]);
  const labTB = useMemo(() => selectedLab ? getLabThietBi(selectedLab.id) : [], [selectedLab]);

  const ycStatusIcon: Record<string, React.ReactNode> = {
    moi_tao: <InboxOutlined style={{ color: '#6b7280' }} />,
    da_tiep_nhan: <ClockCircleOutlined style={{ color: '#1E6FD9' }} />,
    dang_do: <SyncOutlined spin style={{ color: '#f59e0b' }} />,
    cho_phe_duyet: <FileTextOutlined style={{ color: '#8b5cf6' }} />,
    hoan_thanh: <CheckCircleOutlined style={{ color: '#10b981' }} />,
    tu_choi: <CloseCircleOutlined style={{ color: '#ef4444' }} />,
  };
  const ycStatusLabel: Record<string, string> = {
    moi_tao: 'Mới tạo', da_tiep_nhan: 'Đã tiếp nhận', dang_do: 'Đang đo',
    cho_phe_duyet: 'Chờ phê duyệt', hoan_thanh: 'Hoàn thành', tu_choi: 'Từ chối',
  };

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <style>{pageCSS}</style>

      <PageHeader
        icon={<ExperimentOutlined />}
        title="Quản lý Phòng thí nghiệm"
        subtitle="Hệ thống phòng thí nghiệm hiệu chuẩn — Trung tâm Đo lường Doanh nghiệp A"
        ctaLabel="Thêm phòng TN"
        onCtaClick={() => { addForm.resetFields(); setAddOpen(true); }}
      />

      {/* Summary gradient cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng phòng lab', value: stats.total, gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', icon: <ExperimentOutlined /> },
          { label: 'Hoạt động', value: stats.hoatDong, gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', icon: <CheckCircleOutlined /> },
          { label: 'Bảo trì', value: stats.baoTri, gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)', icon: <ToolOutlined /> },
          { label: 'Tạm dừng', value: stats.tamDung, gradient: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)', icon: <ClockCircleOutlined /> },
          { label: 'Tổng thiết bị', value: stats.totalTB, gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', icon: <DashboardOutlined /> },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '16px 18px', borderRadius: 10,
            background: s.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <div>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'block' }}>{s.label}</Text>
              <Text style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'monospace', lineHeight: 1.2 }}>{s.value}</Text>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'rgba(255,255,255,0.8)',
            }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
        <Input placeholder="Tìm phòng lab, đơn vị, trưởng phòng..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ flex: '1 1 250px', maxWidth: 320, height: 36, borderRadius: 6 }} />
        <Select placeholder="Trạng thái" value={filterTT || undefined} onChange={(v) => setFilterTT(v || '')} allowClear style={{ width: 150 }}>
          <Option value="hoat_dong">Hoạt động</Option>
          <Option value="bao_tri">Bảo trì</Option>
          <Option value="tam_dung">Tạm dừng</Option>
        </Select>
        <Select placeholder="Vùng miền" value={filterVung || undefined} onChange={(v) => setFilterVung(v || '')} allowClear style={{ width: 140 }}>
          <Option value="bac">Miền Bắc</Option>
          <Option value="trung">Miền Trung</Option>
          <Option value="nam">Miền Nam</Option>
        </Select>
        <Text style={{ fontSize: 12, color: '#9ca3af', alignSelf: 'center', marginLeft: 8 }}>
          {filtered.length} / {danhSachPhongLab.length} phòng
        </Text>
      </div>

      <Tabs className="lab-tabs" defaultActiveKey="list" items={[

        /* ═══ TAB 1: Danh sách ═══ */
        {
          key: 'list',
          label: <span><UnorderedListOutlined style={{ marginRight: 6 }} />Danh sách ({filtered.length})</span>,
          children: (
            <Row gutter={[16, 16]}>
              {filtered.map((lab) => {
                const isActive = lab.trangThai === 'hoat_dong';
                const ycStats = getLabYCStats(lab.id);
                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={lab.id}>
                    <Card className="lab-card-hover" hoverable
                      onClick={() => setSelectedLab(lab)}
                      style={{
                        borderRadius: 10, overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%', cursor: 'pointer',
                      }} styles={{ body: { padding: 0 } }}>
                      <div style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`
                          : lab.trangThai === 'bao_tri'
                            ? 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                        padding: '14px 18px',
                      }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, lineHeight: '18px' }}>
                          {lab.ten}
                        </Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>{lab.soThietBi} thiết bị</Text>
                          <StatusBadge status={lab.trangThai as TrangThaiLab} />
                        </div>
                      </div>
                      <div style={{ padding: '10px 18px' }}>
                        {envRows.map((env) => (
                          <div key={env.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 0', borderBottom: '1px solid #f5f5f5',
                          }}>
                            <Space size={6}>
                              {React.cloneElement(env.icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { color: env.key === 'nhietDo' ? colors.danger : env.key === 'doAm' ? colors.info : colors.warning } })}
                              <Text type="secondary" style={{ fontSize: 12 }}>{env.label}</Text>
                            </Space>
                            <Space size={6}>
                              <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{lab[env.key]}</Text>
                              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: colors.success }} />
                            </Space>
                          </div>
                        ))}
                        {/* YC badge */}
                        {ycStats.active > 0 && (
                          <div style={{
                            marginTop: 8, padding: '6px 10px', borderRadius: 6,
                            background: '#eff6ff', border: '1px solid #dbeafe',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}>
                            <Text style={{ fontSize: 11, color: '#1e40af' }}>
                              <SyncOutlined spin style={{ marginRight: 4 }} />Đang xử lý
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>{ycStats.active} yêu cầu</Text>
                          </div>
                        )}
                        <div style={{ marginTop: ycStats.active > 0 ? 6 : 8 }}>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block', fontWeight: 500 }}>{lab.donVi}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>{lab.viTri}</Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ),
        },

        /* ═══ TAB 2: Bản đồ ═══ */
        {
          key: 'map',
          label: <span><EnvironmentOutlined style={{ marginRight: 6 }} />Bản đồ phân bố</span>,
          children: (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 1000,
                background: 'rgba(255,255,255,0.95)', borderRadius: 8,
                padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(8px)',
              }}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  {sites.length} điểm đặt · {danhSachPhongLab.length} phòng lab
                </Text>
                {[
                  { label: 'Tất cả hoạt động', color: '#10b981' },
                  { label: 'Có phòng bảo trì', color: '#8b5cf6' },
                  { label: 'Có phòng tạm dừng', color: '#f59e0b' },
                ].map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    <Text style={{ fontSize: 10, color: '#6b7280' }}>{l.label}</Text>
                  </div>
                ))}
              </div>

              <MapContainer
                center={[16.0, 106.5]}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: 'calc(100vh - 280px)', minHeight: 600, width: '100%', borderRadius: 10, border: '1px solid #e5e7eb' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds sites={sites} />

                {sites.map((site) => {
                  const count = site.labs.length;
                  const allActive = site.labs.every((l) => l.trangThai === 'hoat_dong');
                  const hasBaoTri = site.labs.some((l) => l.trangThai === 'bao_tri');
                  const pinColor = hasBaoTri ? '#8b5cf6' : allActive ? '#10b981' : '#f59e0b';
                  const r = Math.max(10, 7 + count * 3);

                  return (
                    <CircleMarker
                      key={`${site.lat}-${site.lng}`}
                      center={[site.lat, site.lng]}
                      radius={r}
                      pathOptions={{ fillColor: pinColor, fillOpacity: 0.85, color: '#fff', weight: 2.5 }}
                    >
                      <Popup>
                        <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 280 }}>
                          <div style={{
                            background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                            padding: '14px 18px', borderRadius: '10px 10px 0 0',
                          }}>
                            <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{site.donVi}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
                              <EnvironmentOutlined /><span>{site.viTri}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                              {[
                                { v: site.labs.length, l: 'Phòng lab' },
                                { v: site.labs.reduce((s, l) => s + l.soThietBi, 0), l: 'Thiết bị' },
                                { v: site.labs.filter((l) => l.trangThai === 'hoat_dong').length, l: 'Hoạt động' },
                              ].map((item) => (
                                <div key={item.l} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
                                  <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{item.v}</div>
                                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>{item.l}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ padding: '10px 16px', maxHeight: 220, overflowY: 'auto' }}>
                            {site.labs.map((lab) => (
                              <div key={lab.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                                borderBottom: '1px solid #f3f4f6',
                              }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                  background: STATUS_COLOR[lab.trangThai],
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', fontSize: 9, fontWeight: 700,
                                }}>{lab.id.replace('LAB-', '')}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{lab.ten}</div>
                                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{lab.soThietBi} TB</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          ),
        },
      ]} />

      {/* ═══ DRAWER THÊM PHÒNG THÍ NGHIỆM ═══ */}
      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={null}
        width={720}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          padding: '24px 28px',
        }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginBottom: 4 }}>
            <PlusOutlined style={{ marginRight: 4 }} />Thêm mới
          </Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Phòng thí nghiệm</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block', marginTop: 4 }}>
            Điền đầy đủ thông tin để đăng ký phòng thí nghiệm mới vào hệ thống
          </Text>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <Form form={addForm} layout="vertical" requiredMark="optional">
            {/* Section 1: Thông tin cơ bản */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 14 }}>
                <ExperimentOutlined style={{ marginRight: 6, color: colors.navy }} />Thông tin cơ bản
              </Text>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="ten" label="Tên phòng thí nghiệm" rules={[{ required: true, message: 'Nhập tên phòng' }]}>
                    <Input placeholder="VD: Phòng TN Điện - Điện tử" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="id" label="Mã phòng" rules={[{ required: true, message: 'Nhập mã' }]}>
                    <Input placeholder="VD: LAB-39" style={{ fontFamily: 'monospace' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="donVi" label="Đơn vị quản lý" rules={[{ required: true, message: 'Nhập đơn vị' }]}>
                    <Input placeholder="VD: Trung tâm Đo lường" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="truongPhong" label="Trưởng phòng" rules={[{ required: true, message: 'Nhập tên' }]}>
                    <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="VD: Nguyễn Văn A" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="trangThai" label="Trạng thái" initialValue="hoat_dong" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="hoat_dong">Hoạt động</Select.Option>
                      <Select.Option value="bao_tri">Bảo trì</Select.Option>
                      <Select.Option value="tam_dung">Tạm dừng</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="soThietBi" label="Số thiết bị" initialValue={0}>
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="capDo" label="Cấp độ" initialValue="ISO/IEC 17025:2017">
                    <Select>
                      <Select.Option value="ISO/IEC 17025:2017">ISO/IEC 17025:2017</Select.Option>
                      <Select.Option value="ISO 9001:2015">ISO 9001:2015</Select.Option>
                      <Select.Option value="Nội bộ">Nội bộ</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: '0 0 24px' }} />

            {/* Section 2: Vị trí địa lý */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 14 }}>
                <EnvironmentOutlined style={{ marginRight: 6, color: colors.navy }} />Vị trí địa lý
              </Text>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="viTri" label="Địa chỉ / Vị trí" rules={[{ required: true, message: 'Nhập vị trí' }]}>
                    <Input prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />} placeholder="VD: Sơn Tây, Hà Nội" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="vungMien" label="Vùng miền" initialValue="bac" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="bac">Miền Bắc</Select.Option>
                      <Select.Option value="trung">Miền Trung</Select.Option>
                      <Select.Option value="nam">Miền Nam</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="lat" label="Vĩ độ (Latitude)" rules={[{ required: true, message: 'Nhập vĩ độ' }]}>
                    <InputNumber style={{ width: '100%' }} step={0.01} placeholder="VD: 21.03" min={8} max={24} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lng" label="Kinh độ (Longitude)" rules={[{ required: true, message: 'Nhập kinh độ' }]}>
                    <InputNumber style={{ width: '100%' }} step={0.01} placeholder="VD: 105.84" min={100} max={112} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: '0 0 24px' }} />

            {/* Section 3: Điều kiện môi trường */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 14 }}>
                <DashboardOutlined style={{ marginRight: 6, color: colors.navy }} />Điều kiện môi trường
              </Text>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="nhietDo" label="Nhiệt độ" initialValue="23 ± 2 °C" rules={[{ required: true }]}>
                    <Input prefix={<DashboardOutlined style={{ color: '#ef4444' }} />} placeholder="23 ± 2 °C" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="doAm" label="Độ ẩm" initialValue="45 ± 10 %RH" rules={[{ required: true }]}>
                    <Input prefix={<CloudOutlined style={{ color: '#3b82f6' }} />} placeholder="45 ± 10 %RH" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="rungDong" label="Rung động" initialValue="< 0.005 m/s²" rules={[{ required: true }]}>
                    <Input prefix={<ThunderboltOutlined style={{ color: '#f59e0b' }} />} placeholder="< 0.005 m/s²" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
              <Button onClick={() => setAddOpen(false)}>Hủy</Button>
              <Button onClick={() => addForm.resetFields()}>Đặt lại</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                addForm.validateFields().then(() => {
                  message.success('Đã thêm phòng thí nghiệm mới');
                  setAddOpen(false);
                  addForm.resetFields();
                });
              }}>
                Thêm phòng TN
              </Button>
            </div>
          </Form>
        </div>
      </Drawer>

      {/* ═══ DRAWER CHI TIẾT PHÒNG LAB ═══ */}
      <Drawer
        open={!!selectedLab}
        onClose={() => setSelectedLab(null)}
        width={680}
        closable={false}
        styles={{ body: { padding: 0 }, header: { display: 'none' } }}
      >
        {selectedLab && (() => {
          const lab = selectedLab;
          const yc = labYC!;
          const kh = labKH!;
          const tbList = labTB;

          return (
            <div>
              {/* Header */}
              <div style={{
                background: lab.trangThai === 'hoat_dong'
                  ? `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`
                  : lab.trangThai === 'bao_tri'
                    ? 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                padding: '24px 28px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginBottom: 4 }}>{lab.id} · {lab.donVi}</Text>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700, display: 'block', lineHeight: '24px' }}>{lab.ten}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block', marginTop: 4 }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />{lab.viTri}
                    </Text>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 12px',
                    fontSize: 12, fontWeight: 600, color: '#fff',
                  }}>
                    {STATUS_LABEL[lab.trangThai]}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  {[
                    { v: lab.soThietBi, l: 'Thiết bị' },
                    { v: yc.active, l: 'YC đang xử lý' },
                    { v: kh.active, l: 'KH đang chạy' },
                    { v: yc.done, l: 'YC hoàn thành' },
                    { v: tbList.length, l: 'TB đo đạc' },
                  ].map((item) => (
                    <div key={item.l} style={{
                      flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 6px', textAlign: 'center',
                    }}>
                      <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{item.v}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, marginTop: 2 }}>{item.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultActiveKey="info" size="small" style={{ padding: '0 28px' }}
                items={[
                  /* Tab 1: Thông tin */
                  {
                    key: 'info',
                    label: <span><ExperimentOutlined style={{ marginRight: 4 }} />Thông tin</span>,
                    children: (
                      <div style={{ paddingBottom: 24 }}>
                        {/* Thông tin chung */}
                        <div style={{ marginBottom: 20 }}>
                          <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 12 }}>Thông tin chung</Text>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px' }}>
                            {[
                              { icon: <UserOutlined />, label: 'Trưởng phòng', value: lab.truongPhong },
                              { icon: <SafetyCertificateOutlined />, label: 'Cấp độ', value: lab.capDo },
                              { icon: <ToolOutlined />, label: 'Số thiết bị', value: `${lab.soThietBi} thiết bị` },
                              { icon: <EnvironmentOutlined />, label: 'Đơn vị', value: lab.donVi },
                              { icon: <EnvironmentOutlined />, label: 'Vị trí', value: lab.viTri },
                              { icon: <EnvironmentOutlined />, label: 'Vùng miền', value: lab.vungMien === 'bac' ? 'Miền Bắc' : lab.vungMien === 'trung' ? 'Miền Trung' : 'Miền Nam' },
                            ].map((f) => (
                              <div key={f.label}>
                                <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginBottom: 2 }}>{f.label}</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {React.cloneElement(f.icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { color: '#6b7280', fontSize: 12 } })}
                                  <Text style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{f.value}</Text>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Divider style={{ margin: '0 0 16px' }} />

                        {/* Môi trường */}
                        <div style={{ marginBottom: 20 }}>
                          <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 12 }}>Điều kiện môi trường</Text>
                          <div style={{ display: 'flex', gap: 10 }}>
                            {[
                              { label: 'Nhiệt độ', value: lab.nhietDo, icon: <DashboardOutlined />, color: '#ef4444', bg: '#fef2f2' },
                              { label: 'Độ ẩm', value: lab.doAm, icon: <CloudOutlined />, color: '#3b82f6', bg: '#eff6ff' },
                              { label: 'Rung động', value: lab.rungDong, icon: <ThunderboltOutlined />, color: '#f59e0b', bg: '#fffbeb' },
                            ].map((e) => (
                              <div key={e.label} style={{
                                flex: 1, padding: '12px 10px', borderRadius: 8,
                                background: e.bg, border: `1px solid ${e.color}20`, textAlign: 'center',
                              }}>
                                {React.cloneElement(e.icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { color: e.color, fontSize: 16 } })}
                                <Text style={{ fontSize: 12, fontFamily: 'monospace', display: 'block', fontWeight: 600, color: '#374151', marginTop: 4 }}>{e.value}</Text>
                                <Text style={{ fontSize: 9, color: '#9ca3af' }}>{e.label}</Text>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ),
                  },

                  /* Tab 2: Thiết bị đo */
                  {
                    key: 'thietbi',
                    label: <span><ToolOutlined style={{ marginRight: 4 }} />Thiết bị đo ({tbList.length})</span>,
                    children: (
                      <div style={{ paddingBottom: 24 }}>
                        {tbList.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {tbList.map((tb) => {
                              const st = TB_STATUS_CONFIG[tb.trangThai] || { label: tb.trangThai, color: '#6b7280', bg: '#f9fafb' };
                              const hanDate = tb.hanHieuChuan ? new Date(tb.hanHieuChuan) : null;
                              const daysLeft = hanDate ? Math.ceil((hanDate.getTime() - Date.now()) / 86400000) : null;

                              return (
                                <div key={tb.id} style={{
                                  background: '#fff', borderRadius: 10, border: '1px solid #eef1f6',
                                  overflow: 'hidden',
                                }}>
                                  {/* TB header */}
                                  <div style={{
                                    padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
                                    borderBottom: '1px solid #f5f5f5',
                                  }}>
                                    <div style={{
                                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                                      background: `${st.color}12`, border: `1.5px solid ${st.color}30`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      <ToolOutlined style={{ color: st.color, fontSize: 16 }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <Text style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', lineHeight: '18px' }}>{tb.ten}</Text>
                                      <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                        <Text style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>{tb.maSerial}</Text>
                                        <Tag style={{ fontSize: 9, borderRadius: 4, margin: 0, lineHeight: '16px', padding: '0 6px', background: st.bg, color: st.color, border: 'none' }}>
                                          {st.label}
                                        </Tag>
                                        {daysLeft !== null && daysLeft <= 60 && daysLeft > 0 && (
                                          <Tag style={{ fontSize: 9, borderRadius: 4, margin: 0, lineHeight: '16px', padding: '0 6px', background: '#fffbeb', color: '#d97706', border: 'none' }}>
                                            Còn {daysLeft} ngày
                                          </Tag>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* TB details grid */}
                                  <div style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                                    <div>
                                      <Text style={{ fontSize: 9, color: '#9ca3af', display: 'block' }}>Lĩnh vực</Text>
                                      <Text style={{ fontSize: 11, fontWeight: 500, color: '#374151' }}>{tb.linhVuc}</Text>
                                    </div>
                                    <div>
                                      <Text style={{ fontSize: 9, color: '#9ca3af', display: 'block' }}>Chu kỳ HC</Text>
                                      <Text style={{ fontSize: 11, fontWeight: 500, color: '#374151' }}>{tb.chuKy} tháng</Text>
                                    </div>
                                    <div>
                                      <Text style={{ fontSize: 9, color: '#9ca3af', display: 'block' }}>Hạn hiệu chuẩn</Text>
                                      <Text style={{ fontSize: 11, fontWeight: 500, color: '#374151' }}>
                                        {tb.hanHieuChuan?.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')}
                                      </Text>
                                    </div>
                                    <div>
                                      <Text style={{ fontSize: 9, color: '#9ca3af', display: 'block' }}>Dải đo</Text>
                                      <Text style={{ fontSize: 11, fontWeight: 500, color: '#374151', fontFamily: 'monospace' }}>{tb.daiDo}</Text>
                                    </div>
                                  </div>

                                  {/* Khả năng đo */}
                                  {tb.khaNangDo && tb.khaNangDo.length > 0 && (
                                    <div style={{ padding: '0 16px 12px' }}>
                                      <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Khả năng đo ({tb.khaNangDo.length})</Text>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {tb.khaNangDo.map((hm) => (
                                          <Tag key={hm.id} style={{
                                            fontSize: 9, borderRadius: 4, margin: 0, padding: '1px 8px',
                                            background: '#f0f5ff', color: '#1e40af', border: '1px solid #dbeafe',
                                          }}>
                                            {hm.tenHangMuc}
                                          </Tag>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ padding: 40, textAlign: 'center', background: '#f9fafb', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                            <ToolOutlined style={{ fontSize: 32, color: '#d1d5db' }} />
                            <Text style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginTop: 8 }}>Chưa có dữ liệu thiết bị đo</Text>
                            <Text style={{ fontSize: 11, color: '#d1d5db' }}>Thiết bị sẽ được liên kết theo lĩnh vực đo của phòng lab</Text>
                          </div>
                        )}
                      </div>
                    ),
                  },

                  /* Tab 3: Yêu cầu & Kế hoạch */
                  {
                    key: 'yeucau',
                    label: (
                      <span>
                        <FileTextOutlined style={{ marginRight: 4 }} />
                        Yêu cầu & KH
                        {yc.active > 0 && (
                          <span style={{
                            marginLeft: 6, background: '#1E6FD9', color: '#fff', borderRadius: 8,
                            fontSize: 10, padding: '1px 6px', fontWeight: 600,
                          }}>{yc.active}</span>
                        )}
                      </span>
                    ),
                    children: (
                      <div style={{ paddingBottom: 24 }}>
                        {/* Yêu cầu */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text strong style={{ fontSize: 13, color: '#374151' }}>Yêu cầu đo lường</Text>
                            {yc.active > 0 && (
                              <Badge count={yc.active} style={{ backgroundColor: '#1E6FD9' }}>
                                <Tag color="blue" style={{ fontSize: 10, borderRadius: 4, margin: 0 }}>đang xử lý</Tag>
                              </Badge>
                            )}
                          </div>
                          {yc.list.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {yc.list.map((item) => {
                                const isActiveYC = ['da_tiep_nhan', 'dang_do', 'cho_phe_duyet'].includes(item.trangThai);
                                return (
                                  <div key={item.id} style={{
                                    padding: '10px 14px', borderRadius: 8,
                                    background: isActiveYC ? '#f8faff' : '#fafafa',
                                    border: `1px solid ${isActiveYC ? '#dbeafe' : '#f0f0f0'}`,
                                    display: 'flex', alignItems: 'center', gap: 10,
                                  }}>
                                    <div style={{ flexShrink: 0 }}>{ycStatusIcon[item.trangThai]}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <Text style={{ fontSize: 12, fontWeight: 600, color: colors.navy, display: 'block' }}>{item.id}</Text>
                                      <Text style={{ fontSize: 11, color: '#6b7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.thietBi}
                                      </Text>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                      <Text style={{ fontSize: 10, fontWeight: 500, color: '#6b7280' }}>{ycStatusLabel[item.trangThai]}</Text>
                                      <Text style={{ fontSize: 9, color: '#9ca3af', display: 'block' }}>Hạn: {item.ngayHen?.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')}</Text>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ padding: 16, textAlign: 'center', background: '#f9fafb', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                              <InboxOutlined style={{ fontSize: 24, color: '#d1d5db' }} />
                              <Text style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginTop: 4 }}>Chưa có yêu cầu liên kết</Text>
                            </div>
                          )}
                        </div>

                        <Divider style={{ margin: '0 0 16px' }} />

                        {/* Kế hoạch */}
                        <div>
                          <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 10 }}>Kế hoạch đo liên kết</Text>
                          {kh.list.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {kh.list.map((item) => (
                                <div key={item.id} style={{
                                  padding: '10px 14px', borderRadius: 8,
                                  background: '#fafafa', border: '1px solid #f0f0f0',
                                  display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontSize: 12, fontWeight: 600, color: colors.navy }}>{item.id}</Text>
                                    <Text style={{ fontSize: 11, color: '#6b7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {item.tenKeHoach}
                                    </Text>
                                  </div>
                                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <StatusBadge status={item.trangThai} />
                                    <Progress percent={item.tienDo} size="small" style={{ width: 80, marginTop: 4 }}
                                      strokeColor={item.tienDo >= 100 ? '#10b981' : '#1E6FD9'} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ padding: 16, textAlign: 'center', background: '#f9fafb', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                              <InboxOutlined style={{ fontSize: 24, color: '#d1d5db' }} />
                              <Text style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginTop: 4 }}>Chưa có kế hoạch liên kết</Text>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default PhongLabPage;
