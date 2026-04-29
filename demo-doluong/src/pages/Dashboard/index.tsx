import { useMemo } from 'react';
import { Card, Row, Col, Typography, Progress, Tag, Badge, Tooltip } from 'antd';
import {
  SafetyCertificateOutlined, ExclamationCircleOutlined,
  RightOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, InfoCircleOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { thongKeThietBi } from '../../data/thietBi';
import { danhSachDonVi } from '../../data/donVi';
import { danhSachKetQua } from '../../data/ketQuaDo';
import { formatDate, mucDoCanhBaoConfig } from '../../utils/format';
import { StatusBadge, DonutChart } from '../../components';
import type { CanhBao, YeuCau, MucDoCanhBao } from '../../types';

const { Text } = Typography;

// ─── Mock data ──────────────────────────────────────────────────────────────
const canhBaoList: CanhBao[] = [
  { id: 'CB-001', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-003 Druck PACE5000 quá hạn hiệu chuẩn',             moTa: 'Thiết bị hiệu chuẩn áp suất Druck PACE5000 (TT.Cloud 367) đã quá hạn từ 20/01/2026.', donVi: 'TT.Cloud 367', ngayTao: '2026-03-15', daDoc: false },
  { id: 'CB-002', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-010 Megger MIT1025 quá hạn hiệu chuẩn',              moTa: 'Máy đo điện trở cách điện Megger MIT1025 (TT Monitoring 291) quá hạn từ 01/12/2025.', donVi: 'TT Monitoring 291', ngayTao: '2026-03-10', daDoc: false },
  { id: 'CB-003', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'TB-002 Tektronix MSO46 sắp hết hạn hiệu chuẩn',        moTa: 'Máy hiện sóng Tektronix MSO46 (TT Phần mềm 921) hết hạn ngày 10/04/2026.', donVi: 'TT Phần mềm 921', ngayTao: '2026-03-18', daDoc: false },
  { id: 'CB-004', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'TB-008 Endress+Hauser F300 sắp hết hạn',                moTa: 'Lưu lượng kế Endress+Hauser Promass F300 (TT Phần mềm 935) hết hạn ngày 28/03/2026.', donVi: 'TT Phần mềm 935', ngayTao: '2026-03-20', daDoc: false },
  { id: 'CB-005', loai: 'bat_thuong', mucDo: 'warning',  tieuDe: 'Kết quả đo TB-010 sai số vượt ngưỡng cho phép',         moTa: 'Sai số tại thang 10kV vượt 15% giới hạn cho phép.', donVi: 'TT Monitoring 291', ngayTao: '2026-03-12', daDoc: true },
  { id: 'CB-006', loai: 'moi_truong', mucDo: 'info',     tieuDe: 'Nhiệt độ phòng LAB-03 vượt ngưỡng cho phép',            moTa: 'Phòng Lab Tín hiệu - Truyền dẫn ghi nhận nhiệt độ 26.8°C.', donVi: 'Ban Đo lường', ngayTao: '2026-03-22', daDoc: false },
  { id: 'CB-008', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-014 Bird 5012D hỏng – chưa có phương án thay thế',   moTa: 'Máy đo công suất tín hiệu Bird 5012D bị hỏng sensor.', donVi: 'TT Phần mềm 921', ngayTao: '2026-03-08', daDoc: false },
];

const yeuCauList: YeuCau[] = [
  { id: 'YC-001', donVi: 'DV-001', thietBi: 'Đồng hồ vạn năng Fluke 87V', maThietBi: 'TB-001', mucDich: 'Hiệu chuẩn định kỳ', uuTien: 'trung_binh', ngayGui: '2026-03-20', ngayHen: '2026-04-05', trangThai: 'da_tiep_nhan', nguoiGui: 'Nguyễn Văn A', phongLab: 'LAB-01', ghiChu: '' },
  { id: 'YC-002', donVi: 'DV-004', thietBi: 'Druck PACE5000', maThietBi: 'TB-003', mucDich: 'Hiệu chuẩn khẩn cấp', uuTien: 'khan_cap', ngayGui: '2026-03-18', ngayHen: '2026-03-25', trangThai: 'dang_do', nguoiGui: 'Trần Văn B', phongLab: 'LAB-02', ghiChu: 'Quá hạn - cần xử lý gấp' },
  { id: 'YC-003', donVi: 'DV-002', thietBi: 'Tektronix MSO46', maThietBi: 'TB-002', mucDich: 'Hiệu chuẩn trước hạn', uuTien: 'cao', ngayGui: '2026-03-19', ngayHen: '2026-04-01', trangThai: 'moi_tao', nguoiGui: 'Lê Thị C', phongLab: 'LAB-01', ghiChu: '' },
  { id: 'YC-004', donVi: 'DV-005', thietBi: 'Endress+Hauser F300', maThietBi: 'TB-008', mucDich: 'Hiệu chuẩn trước diễn tập vận hành', uuTien: 'cao', ngayGui: '2026-03-21', ngayHen: '2026-03-30', trangThai: 'da_tiep_nhan', nguoiGui: 'Phạm Văn D', phongLab: 'LAB-03', ghiChu: '' },
  { id: 'YC-005', donVi: 'DV-007', thietBi: 'Cân phân tích Mettler Toledo XPR205', maThietBi: 'TB-007', mucDich: 'Hiệu chuẩn định kỳ', uuTien: 'thap', ngayGui: '2026-03-15', ngayHen: '2026-04-15', trangThai: 'hoan_thanh', nguoiGui: 'Hoàng Văn E', phongLab: 'LAB-04', ghiChu: '' },
  { id: 'YC-006', donVi: 'DV-008', thietBi: 'Megger MIT1025', maThietBi: 'TB-010', mucDich: 'Hiệu chuẩn sau sửa chữa', uuTien: 'khan_cap', ngayGui: '2026-03-16', ngayHen: '2026-03-26', trangThai: 'cho_phe_duyet', nguoiGui: 'Vũ Thị F', phongLab: 'LAB-01', ghiChu: 'Đã đo xong, chờ phê duyệt kết quả' },
];

// ─── Mock trend data (6 tháng) ──────────────────────────────────────────────
const trendData = [
  { thang: 'T10/25', yeuCau: 8, hoanThanh: 7, khongDat: 1 },
  { thang: 'T11/25', yeuCau: 12, hoanThanh: 10, khongDat: 0 },
  { thang: 'T12/25', yeuCau: 6, hoanThanh: 5, khongDat: 1 },
  { thang: 'T01/26', yeuCau: 14, hoanThanh: 12, khongDat: 2 },
  { thang: 'T02/26', yeuCau: 10, hoanThanh: 9, khongDat: 1 },
  { thang: 'T03/26', yeuCau: 6, hoanThanh: 1, khongDat: 2 },
];

// ─── Severity helpers ───────────────────────────────────────────────────────
function severityIcon(mucDo: MucDoCanhBao) {
  if (mucDo === 'critical') return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
  if (mucDo === 'warning') return <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />;
  return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />;
}

// ─── Computed KPIs ──────────────────────────────────────────────────────────
const tongThietBi = thongKeThietBi.tongSo;
const conHanCount = thongKeThietBi.conHan;
const hopLePercent = tongThietBi > 0 ? Math.round((conHanCount / tongThietBi) * 100) : 0;

const tongYeuCau = yeuCauList.length;
const ycHoanThanh = yeuCauList.filter((yc) => yc.trangThai === 'hoan_thanh').length;
const dungHanPercent = tongYeuCau > 0 ? Math.round((ycHoanThanh / tongYeuCau) * 100) : 0;

const kqDat = danhSachKetQua.filter((kq) => kq.ketLuan === 'dat').length;
const kqKhongDat = danhSachKetQua.filter((kq) => kq.ketLuan === 'khong_dat').length;
const passRate = danhSachKetQua.length > 0 ? Math.round((kqDat / danhSachKetQua.length) * 100) : 0;

const criticalCount = canhBaoList.filter((cb) => cb.mucDo === 'critical').length;
const tongCanhBao = canhBaoList.filter((cb) => !cb.daDoc).length;

// Equipment status for donut
// Donut data — dùng SVG custom, đảm bảo màu khớp 100%
const tbDonutData = [
  { label: 'Còn hạn', value: thongKeThietBi.conHan, color: '#52c41a' },
  { label: 'Sắp hạn', value: thongKeThietBi.sapHan, color: '#faad14' },
  { label: 'Quá hạn', value: thongKeThietBi.quaHan, color: '#ff4d4f' },
  { label: 'Bảo dưỡng', value: thongKeThietBi.baoDuong, color: '#7c3aed' },
  { label: 'Hỏng', value: thongKeThietBi.hong, color: '#8c8c8c' },
].filter((d) => d.value > 0);

const qualityDonutData = [
  { label: 'Đạt', value: kqDat, color: '#52c41a' },
  { label: 'Không đạt', value: kqKhongDat, color: '#ff4d4f' },
];

// Trend column chart data
const trendColumnData = trendData.flatMap((d) => [
  { thang: d.thang, loai: 'Yêu cầu', value: d.yeuCau },
  { thang: d.thang, loai: 'Hoàn thành', value: d.hoanThanh },
]);

// Top don vi with performance
const donViPerformance = [...danhSachDonVi]
  .sort((a, b) => b.soThietBi - a.soThietBi)
  .slice(0, 6)
  .map((dv) => ({
    ...dv,
    compliance: dv.soThietBi > 0 ? Math.round(((dv.soThietBi - dv.quaHan) / dv.soThietBi) * 100) : 100,
  }));

// ─── KPI Card Component ─────────────────────────────────────────────────────
function KpiCard({ title, question, value, suffix, trend, trendLabel, icon, gradient }: {
  title: string; question: string; value: string | number; suffix?: string;
  trend: number; trendLabel: string; statusColor?: string;
  icon: React.ReactNode; gradient: string;
}) {
  const trendUp = trend > 0;
  const trendBg = trendUp ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)';
  const trendIcon = trendUp
    ? <ArrowUpOutlined style={{ fontSize: 10 }} />
    : <ArrowDownOutlined style={{ fontSize: 10 }} />;

  return (
    <Tooltip title={question} placement="top">
      <div
        style={{
          background: gradient,
          borderRadius: 12,
          padding: '20px 22px 18px',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          cursor: 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
        }}
      >
        {/* Decorative bg icon */}
        <div style={{
          position: 'absolute', right: -6, top: -6,
          fontSize: 60, color: 'rgba(255,255,255,0.1)', lineHeight: 1, pointerEvents: 'none',
        }}>
          {icon}
        </div>

        {/* Header row: icon + trend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff',
          }}>
            {icon}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: trendBg, color: '#fff',
          }}>
            {trendIcon}
            {Math.abs(trend)}%
          </div>
        </div>

        {/* Value */}
        <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 3, position: 'relative' }}>
          {value}<span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{suffix}</span>
        </div>
        {/* Label */}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 6, position: 'relative' }}>{title}</div>
        {/* Trend context */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', position: 'relative' }}>{trendLabel}</div>
      </div>
    </Tooltip>
  );
}

// ─── Section header component ───────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const recentAlerts = useMemo(() =>
    [...canhBaoList].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao)).slice(0, 5),
  []);

  const recentYC = useMemo(() =>
    [...yeuCauList].sort((a, b) => b.ngayGui.localeCompare(a.ngayGui)).slice(0, 5),
  []);

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <style>{`
        .alert-feed-item { transition: background 0.15s; cursor: pointer; }
        .alert-feed-item:hover { background: #fafafa !important; }
        .yc-feed-item { transition: background 0.15s; cursor: pointer; }
        .yc-feed-item:hover { background: #fafafa !important; }
      `}</style>

      {/* ═══ PAGE HEADER ═══════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
            Tổng quan hệ thống TC-ĐL-CL
          </div>
          <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
            Bảng điều khiển ra quyết định — Cập nhật đến ngày 23/03/2026
          </Text>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 8, background: '#f0fce8', border: '1px solid #b7eb8f',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
          <Text style={{ fontSize: 12, color: '#389e0d', fontWeight: 600 }}>Hệ thống hoạt động bình thường</Text>
        </div>
      </div>

      {/* ═══ ROW 1: 4 KPI CARDS ═══════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="TB hợp lệ hiệu chuẩn"
            question="Bao nhiêu % thiết bị đã được hiệu chuẩn đúng hạn?"
            value={hopLePercent} suffix="%"
            trend={3} trendLabel="So với tháng trước: 54%"
            statusColor={hopLePercent >= 80 ? '#52c41a' : hopLePercent >= 60 ? '#faad14' : '#ff4d4f'}
            icon={<SafetyCertificateOutlined />}
            gradient="linear-gradient(90deg, #52c41a, #95de64)"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Hoàn thành đúng hạn"
            question="Bao nhiêu % yêu cầu đo lường được xử lý đúng hạn?"
            value={dungHanPercent} suffix="%"
            trend={-8} trendLabel="So với tháng trước: 25%"
            statusColor={dungHanPercent >= 80 ? '#52c41a' : dungHanPercent >= 50 ? '#faad14' : '#ff4d4f'}
            icon={<ClockCircleOutlined />}
            gradient="linear-gradient(90deg, #faad14, #ffd666)"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Tỷ lệ đạt (Pass Rate)"
            question="Bao nhiêu % kết quả đo nằm trong ngưỡng cho phép?"
            value={passRate} suffix="%"
            trend={5} trendLabel="So với tháng trước: 62%"
            statusColor={passRate >= 90 ? '#52c41a' : passRate >= 70 ? '#faad14' : '#ff4d4f'}
            icon={<CheckCircleOutlined />}
            gradient="linear-gradient(90deg, #1E6FD9, #60a5fa)"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Cảnh báo nghiêm trọng"
            question="Có bao nhiêu vấn đề cần xử lý ngay?"
            value={criticalCount} suffix={` / ${canhBaoList.length}`}
            trend={criticalCount > 2 ? 50 : -10}
            trendLabel={`${tongCanhBao} chưa đọc`}
            statusColor={criticalCount >= 3 ? '#ff4d4f' : criticalCount >= 1 ? '#faad14' : '#52c41a'}
            icon={<FireOutlined />}
            gradient="linear-gradient(90deg, #ff4d4f, #ff7875)"
          />
        </Col>
      </Row>

      {/* ═══ ROW 2: TREND CHART (full width) ════════════════════════════════ */}
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}
        styles={{ body: { padding: 20 } }}
      >
        <SectionHeader title="Xu hướng yêu cầu đo lường" subtitle="6 tháng gần nhất — Yêu cầu vs Hoàn thành" />
        <Column
          data={trendColumnData}
          xField="thang"
          yField="value"
          seriesField="loai"
          isGroup
          height={200}
          color={['#1E6FD9', '#52c41a']}
          legend={{ position: 'top-right' }}
          columnStyle={{ radius: [4, 4, 0, 0] }}
          label={false}
          xAxis={{ label: { style: { fontSize: 11, fill: '#8c8c8c' } } }}
          yAxis={{ label: { style: { fontSize: 11, fill: '#8c8c8c' } }, grid: { line: { style: { stroke: '#f0f0f0' } } } }}
        />
      </Card>

      {/* ═══ ROW 3: EQUIPMENT + QUALITY (cùng 1 hàng, layout ngang) ════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Tình trạng thiết bị */}
        <Col xs={24} xl={12}>
          <Card
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <DonutChart
                data={tbDonutData}
                size={150}
                strokeWidth={22}
                centerLabel={`${hopLePercent}%`}
                centerSublabel="Hợp lệ"
                centerColor={hopLePercent >= 80 ? '#52c41a' : '#faad14'}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>Tình trạng thiết bị</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 16 }}>{tongThietBi} thiết bị đo lường</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tbDonutData.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                        <Text style={{ fontSize: 13, color: '#595959' }}>{item.label}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <Text style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{item.value}</Text>
                        <Text style={{ fontSize: 11, color: '#bfbfbf' }}>
                          ({tongThietBi > 0 ? Math.round((item.value / tongThietBi) * 100) : 0}%)
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Chất lượng kết quả */}
        <Col xs={24} xl={12}>
          <Card
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <DonutChart
                data={qualityDonutData}
                size={150}
                strokeWidth={22}
                centerLabel={`${passRate}%`}
                centerSublabel="Đạt chuẩn"
                centerColor={passRate >= 80 ? '#52c41a' : '#ff4d4f'}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>Chất lượng kết quả</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 16 }}>{danhSachKetQua.length} phép đo đã thực hiện</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Đạt', value: kqDat, color: '#52c41a', desc: 'Nằm trong ngưỡng cho phép' },
                    { label: 'Không đạt', value: kqKhongDat, color: '#ff4d4f', desc: 'Vượt ngưỡng sai số' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                          <Text style={{ fontSize: 13, color: '#595959' }}>{item.label}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <Text style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{item.value}</Text>
                          <Text style={{ fontSize: 11, color: '#bfbfbf' }}>
                            ({danhSachKetQua.length > 0 ? Math.round((item.value / danhSachKetQua.length) * 100) : 0}%)
                          </Text>
                        </div>
                      </div>
                      <Text style={{ fontSize: 11, color: '#bfbfbf', marginLeft: 18 }}>{item.desc}</Text>
                    </div>
                  ))}
                </div>
                {/* Stacked bar */}
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 16 }}>
                  <div style={{ width: `${passRate}%`, background: '#52c41a', transition: 'width 0.6s ease' }} />
                  <div style={{ flex: 1, background: '#ff4d4f' }} />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ═══ ROW 4: CẢNH BÁO + YÊU CẦU (cùng 1 hàng) ═══════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Cảnh báo & Rủi ro */}
        <Col xs={24} xl={12}>
          <Card
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{
              padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Cảnh báo & Rủi ro</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>Top 5 vấn đề quan trọng nhất</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: '#fff1f0', color: '#cf1322',
                }}>{criticalCount} nghiêm trọng</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: '#fff7e6', color: '#d48806',
                }}>{canhBaoList.filter((cb) => cb.mucDo === 'warning').length} cảnh báo</span>
              </div>
            </div>

            <div>
              {recentAlerts.map((alert) => {
                const sevCfg = mucDoCanhBaoConfig[alert.mucDo];
                return (
                  <div
                    key={alert.id}
                    className="alert-feed-item"
                    onClick={() => navigate('/giam-sat')}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 20px',
                      borderLeft: `3px solid ${sevCfg.border}`,
                      background: alert.daDoc ? 'transparent' : sevCfg.bg,
                      borderBottom: '1px solid #f5f5f5',
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{severityIcon(alert.mucDo)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 13, fontWeight: alert.daDoc ? 400 : 600, color: '#1a1a2e', display: 'block', lineHeight: 1.4 }} ellipsis>
                        {alert.tieuDe}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <Tag color={sevCfg.color} style={{ fontSize: 10, margin: 0, lineHeight: '16px' }}>{sevCfg.label}</Tag>
                        <Text style={{ fontSize: 11, color: '#bfbfbf' }}>{formatDate(alert.ngayTao)}</Text>
                        {!alert.daDoc && <Badge dot style={{ marginLeft: 2 }} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{ padding: '10px 20px', textAlign: 'center', cursor: 'pointer', borderTop: '1px solid #f0f0f0' }}
              onClick={() => navigate('/giam-sat')}
            >
              <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 600 }}>
                Xem tất cả cảnh báo <RightOutlined style={{ fontSize: 10 }} />
              </Text>
            </div>
          </Card>
        </Col>

        {/* Yêu cầu đo lường gần đây */}
        <Col xs={24} xl={12}>
          <Card
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{
              padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Yêu cầu đo lường gần đây</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{tongYeuCau} yêu cầu đang mở</div>
              </div>
              <div
                style={{ fontSize: 12, color: colors.navy, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => navigate('/yeu-cau')}
              >
                Xem tất cả <RightOutlined style={{ fontSize: 10 }} />
              </div>
            </div>

            <div>
              {recentYC.map((yc) => (
                <div
                  key={yc.id}
                  className="yc-feed-item"
                  onClick={() => navigate('/yeu-cau')}
                  style={{ padding: '10px 20px', borderBottom: '1px solid #f5f5f5' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{yc.id}</Text>
                      <StatusBadge status={yc.trangThai} />
                    </div>
                    <Text style={{ fontSize: 11, color: '#bfbfbf' }}>{formatDate(yc.ngayGui)}</Text>
                  </div>
                  <Text style={{ fontSize: 12, color: '#595959', display: 'block' }} ellipsis>{yc.thietBi}</Text>
                  <Text style={{ fontSize: 11, color: '#bfbfbf' }}>{yc.mucDich}</Text>
                </div>
              ))}
            </div>

            <div
              style={{ padding: '10px 20px', textAlign: 'center', cursor: 'pointer', borderTop: '1px solid #f0f0f0' }}
              onClick={() => navigate('/yeu-cau')}
            >
              <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 600 }}>
                Xem tất cả yêu cầu <RightOutlined style={{ fontSize: 10 }} />
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ═══ ROW 5: UNIT PERFORMANCE (full width) ═════════════════════════════ */}
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <SectionHeader title="Hiệu suất đơn vị" subtitle="Tỷ lệ thiết bị hợp lệ hiệu chuẩn theo đơn vị" />
          <div
            style={{ fontSize: 12, color: colors.navy, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => navigate('/don-vi')}
          >
            Xem tất cả <RightOutlined style={{ fontSize: 10 }} />
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr minmax(70px,90px) minmax(70px,90px) minmax(70px,90px) minmax(100px,160px)',
          padding: '8px 12px', borderBottom: '2px solid #e2e8f0',
          fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px',
        }}>
          <span>#</span>
          <span>Đơn vị</span>
          <span style={{ textAlign: 'center' }}>Tổng TB</span>
          <span style={{ textAlign: 'center' }}>Quá hạn</span>
          <span style={{ textAlign: 'center' }}>Sắp hạn</span>
          <span style={{ textAlign: 'right' }}>Tỷ lệ hợp lệ</span>
        </div>

        {/* Rows */}
        {donViPerformance.map((dv, idx) => {
          const compColor = dv.compliance >= 90 ? '#52c41a' : dv.compliance >= 80 ? '#faad14' : '#ff4d4f';
          const sapHan = Math.max(0, Math.floor(dv.soThietBi * 0.08));
          return (
            <div
              key={dv.id}
              style={{
                display: 'grid', gridTemplateColumns: '40px 1fr minmax(70px,90px) minmax(70px,90px) minmax(70px,90px) minmax(100px,160px)',
                padding: '10px 12px', borderBottom: '1px solid #f5f5f5', alignItems: 'center',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onClick={() => navigate('/thiet-bi')}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: idx < 3 ? colors.navy : '#e8e8e8',
                color: idx < 3 ? '#fff' : '#8c8c8c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {idx + 1}
              </div>
              <Text style={{ fontSize: 13, fontWeight: 500 }} ellipsis>{dv.ten}</Text>
              <Text style={{ fontSize: 13, textAlign: 'center', fontWeight: 600 }}>{dv.soThietBi}</Text>
              <Text style={{ fontSize: 13, textAlign: 'center', fontWeight: 600, color: dv.quaHan > 0 ? '#ff4d4f' : '#8c8c8c' }}>
                {dv.quaHan}
              </Text>
              <Text style={{ fontSize: 13, textAlign: 'center', fontWeight: 600, color: sapHan > 0 ? '#d48806' : '#8c8c8c' }}>
                {sapHan}
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <Progress
                  percent={dv.compliance} showInfo={false}
                  strokeColor={compColor} trailColor="#f0f0f0"
                  size="small" style={{ width: 70, margin: 0 }}
                />
                <Text style={{ fontSize: 12, fontWeight: 700, color: compColor, minWidth: 36, textAlign: 'right' }}>
                  {dv.compliance}%
                </Text>
              </div>
            </div>
          );
        })}
      </Card>

    </div>
  );
}
