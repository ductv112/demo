import React, { useState, useMemo } from 'react';
import { Typography, Tag, Input, Select, Timeline, Card, Row, Col, Empty } from 'antd';
import {
  HistoryOutlined, SearchOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExperimentOutlined, CalendarOutlined,
  UserOutlined, FileTextOutlined, ToolOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';
import { PageHeader, StatusBadge } from '../../components';
import { danhSachThietBi } from '../../data/thietBi';
import { danhSachDonVi } from '../../data/donVi';

const { Text } = Typography;
const { Option } = Select;

const donViMap = Object.fromEntries(danhSachDonVi.map((d) => [d.id, d.ten]));

interface LichSuRecord {
  id: string;
  maThietBi: string;
  tenThietBi: string;
  donVi: string;
  ngayDo: string;
  ktvThucHien: string;
  phongLab: string;
  ketLuan: 'dat' | 'khong_dat';
  maChungChi: string;
  saiSo: string;
  ghiChu: string;
}

const lichSuData: LichSuRecord[] = [
  { id: 'LS-001', maThietBi: 'TB-001', tenThietBi: 'Thiết bị kiểm tra chẩn đoán DTA-144C', donVi: 'DV-001', ngayDo: '2025-08-15', ktvThucHien: 'Trần Văn Bình', phongLab: 'Phòng TN Điện - Điện tử', ketLuan: 'dat', maChungChi: 'CC-2025-0087', saiSo: '±0.8%', ghiChu: 'Đạt tất cả tham số' },
  { id: 'LS-002', maThietBi: 'TB-001', tenThietBi: 'Thiết bị kiểm tra chẩn đoán DTA-144C', donVi: 'DV-001', ngayDo: '2024-08-10', ktvThucHien: 'Phạm Tuấn Anh', phongLab: 'Phòng TN Điện - Điện tử', ketLuan: 'dat', maChungChi: 'CC-2024-0045', saiSo: '±0.6%', ghiChu: '' },
  { id: 'LS-003', maThietBi: 'TB-002', tenThietBi: 'Máy đo đồ thị V-A Assist-Asa', donVi: 'DV-002', ngayDo: '2025-04-10', ktvThucHien: 'Trần Văn Bình', phongLab: 'Phòng TN Điện - Điện tử', ketLuan: 'dat', maChungChi: 'CC-2025-0032', saiSo: '±1.2%', ghiChu: '' },
  { id: 'LS-004', maThietBi: 'TB-003', tenThietBi: 'Thiết bị phân tích ảnh nhiệt IR-384', donVi: 'DV-004', ngayDo: '2025-01-20', ktvThucHien: 'Phạm Quang Huy', phongLab: 'Phòng TN Nhiệt - Quang', ketLuan: 'dat', maChungChi: 'CC-2025-0008', saiSo: '±1.8°C', ghiChu: '' },
  { id: 'LS-005', maThietBi: 'TB-003', tenThietBi: 'Thiết bị phân tích ảnh nhiệt IR-384', donVi: 'DV-004', ngayDo: '2024-01-15', ktvThucHien: 'Phạm Quang Huy', phongLab: 'Phòng TN Nhiệt - Quang', ketLuan: 'khong_dat', maChungChi: '', saiSo: '±3.5°C', ghiChu: 'Sai lệch vượt ngưỡng, yêu cầu hiệu chỉnh lại' },
  { id: 'LS-006', maThietBi: 'TB-006', tenThietBi: 'Máy phân tích phổ Keysight N9010B', donVi: 'DV-006', ngayDo: '2025-09-18', ktvThucHien: 'Trần Văn Bình', phongLab: 'Phòng TN Tín hiệu - Truyền dẫn', ketLuan: 'dat', maChungChi: 'CC-2025-0102', saiSo: '±0.3 dB', ghiChu: '' },
  { id: 'LS-007', maThietBi: 'TB-007', tenThietBi: 'Cân phân tích Mettler Toledo XPR205', donVi: 'DV-007', ngayDo: '2025-05-12', ktvThucHien: 'Phạm Tuấn Anh', phongLab: 'Phòng TN Khối lượng - Hình học', ketLuan: 'dat', maChungChi: 'CC-2025-0056', saiSo: '±0.015 mg', ghiChu: '' },
  { id: 'LS-008', maThietBi: 'TB-014', tenThietBi: 'Đồng hồ vạn năng Fluke 8846A', donVi: 'DV-002', ngayDo: '2025-02-15', ktvThucHien: 'Trần Văn Bình', phongLab: 'Phòng TN Điện - Điện tử', ketLuan: 'khong_dat', maChungChi: '', saiSo: 'Lỗi đầu dò dòng', ghiChu: 'Hỏng đầu dò dòng điện, chuyển bảo trì' },
  { id: 'LS-009', maThietBi: 'TB-009', tenThietBi: 'Bộ mô-đun Keysight 34980A', donVi: 'DV-002', ngayDo: '2025-12-05', ktvThucHien: 'Hoàng Minh Đức', phongLab: 'Phòng TN Điện - Điện tử', ketLuan: 'dat', maChungChi: 'CC-2025-0145', saiSo: '±0.004%', ghiChu: '' },
  { id: 'LS-010', maThietBi: 'TB-004', tenThietBi: 'Gia tốc kế đo rung B&K Type 4534-B', donVi: 'DV-003', ngayDo: '2024-11-01', ktvThucHien: 'Phạm Quang Huy', phongLab: 'Phòng TN Rung động - Gia tốc', ketLuan: 'dat', maChungChi: 'CC-2024-0189', saiSo: '±1.5%', ghiChu: '' },
];

const LichSuKiemDinhPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterKL, setFilterKL] = useState('');
  const [filterDV, setFilterDV] = useState('');
  const [selectedTB, setSelectedTB] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return lichSuData.filter((r) => {
      const matchText = !s || r.tenThietBi.toLowerCase().includes(s) || r.maThietBi.toLowerCase().includes(s) || r.maChungChi.toLowerCase().includes(s);
      const matchKL = !filterKL || r.ketLuan === filterKL;
      const matchDV = !filterDV || r.donVi === filterDV;
      const matchTB = !selectedTB || r.maThietBi === selectedTB;
      return matchText && matchKL && matchDV && matchTB;
    });
  }, [search, filterKL, filterDV, selectedTB]);

  const stats = useMemo(() => ({
    total: lichSuData.length,
    dat: lichSuData.filter((r) => r.ketLuan === 'dat').length,
    khongDat: lichSuData.filter((r) => r.ketLuan === 'khong_dat').length,
  }), []);

  const tbOptions = useMemo(() => {
    const unique = [...new Set(lichSuData.map((r) => r.maThietBi))];
    return unique.map((id) => {
      const r = lichSuData.find((l) => l.maThietBi === id);
      return { value: id, label: `${id} — ${r?.tenThietBi?.substring(0, 30) || ''}` };
    });
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<HistoryOutlined />}
        title="Lịch sử kiểm định thiết bị"
        subtitle="Tra cứu toàn bộ lịch sử các lần hiệu chuẩn, kiểm định thiết bị đo"
      />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng lần kiểm định', value: stats.total, gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' },
          { label: 'Đạt', value: stats.dat, gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
          { label: 'Không đạt', value: stats.khongDat, gradient: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '16px 18px', borderRadius: 10, background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <div>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'block' }}>{s.label}</Text>
              <Text style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{s.value}</Text>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, padding: '14px 20px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Input placeholder="Tìm theo mã TB, tên, mã chứng chỉ..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ flex: '1 1 250px', maxWidth: 320 }} />
        <Select placeholder="Thiết bị" value={selectedTB || undefined} onChange={(v) => setSelectedTB(v || null)} allowClear
          style={{ flex: '0 1 280px', minWidth: 200 }} options={tbOptions} showSearch optionFilterProp="label" />
        <Select placeholder="Kết luận" value={filterKL || undefined} onChange={(v) => setFilterKL(v || '')} allowClear
          style={{ flex: '0 1 140px', minWidth: 120 }}>
          <Option value="dat">Đạt</Option>
          <Option value="khong_dat">Không đạt</Option>
        </Select>
        <Select placeholder="Đơn vị" value={filterDV || undefined} onChange={(v) => setFilterDV(v || '')} allowClear
          style={{ flex: '0 1 200px', minWidth: 150 }}>
          {danhSachDonVi.map((dv) => <Option key={dv.id} value={dv.id}>{dv.ten}</Option>)}
        </Select>
        <Text style={{ fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>{filtered.length} / {lichSuData.length}</Text>
      </div>

      {/* Timeline */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((r) => {
            const isDat = r.ketLuan === 'dat';
            return (
              <div key={r.id} style={{
                background: '#fff', borderRadius: 10, border: `1px solid ${isDat ? '#d1fae5' : '#fecaca'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '16px 20px',
                borderLeft: `4px solid ${isDat ? '#10b981' : '#ef4444'}`,
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: isDat ? '#f0fdf4' : '#fef2f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDat ? '#10b981' : '#ef4444', fontSize: 20,
                }}>
                  {isDat ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: 13, color: colors.navy }}>{r.maThietBi}</Text>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.tenThietBi}</Text>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}><CalendarOutlined style={{ marginRight: 3 }} />{r.ngayDo.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')}</Text>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}><UserOutlined style={{ marginRight: 3 }} />{r.ktvThucHien}</Text>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}><ExperimentOutlined style={{ marginRight: 3 }} />{r.phongLab}</Text>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}><ToolOutlined style={{ marginRight: 3 }} />{donViMap[r.donVi] || r.donVi}</Text>
                  </div>
                  {r.ghiChu && <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginTop: 4, fontStyle: 'italic' }}>{r.ghiChu}</Text>}
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Tag color={isDat ? 'success' : 'error'} style={{ margin: 0, fontWeight: 600, borderRadius: 4 }}>
                    {isDat ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                  </Tag>
                  <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280', display: 'block', marginTop: 4 }}>{r.saiSo}</Text>
                  {r.maChungChi && (
                    <Text style={{ fontSize: 10, color: colors.navy, display: 'block', marginTop: 2 }}>
                      <FileTextOutlined style={{ marginRight: 2 }} />{r.maChungChi}
                    </Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 10, padding: 60, textAlign: 'center' }}>
          <Empty description="Không tìm thấy lịch sử kiểm định" />
        </div>
      )}
    </div>
  );
};

export default LichSuKiemDinhPage;
