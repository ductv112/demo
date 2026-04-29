import { useState, useMemo } from 'react';
import {
  Typography, Row, Col, Tabs, Table, Steps, Empty, Timeline, Tag, Button,
  Progress, message, Dropdown, Drawer, Form, Input, Select, DatePicker, InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  FileTextOutlined, ExperimentOutlined, CalendarOutlined,
  CloseCircleOutlined, CheckCircleOutlined, EnvironmentOutlined,
  UserOutlined, ArrowLeftOutlined, EditOutlined, SendOutlined,
  MoreOutlined, StopOutlined, PrinterOutlined, HistoryOutlined,
  SafetyCertificateOutlined, AimOutlined, WarningOutlined,
  FileSearchOutlined, LockOutlined, PlusOutlined, UploadOutlined,
  DatabaseOutlined, BarChartOutlined, InboxOutlined, SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { danhSachDonVi } from '../../data/donVi';
import { danhSachKetQua } from '../../data/ketQuaDo';
import { danhSachKeHoach } from '../../data/keHoachDo';
import { danhSachNguoiDung } from '../../data/nguoiDung';
import { formatDate } from '../../utils/format';
import { StatusBadge, PriorityBadge } from '../../components';
import type { TrangThaiYC } from '../../types';
import { colors } from '../../theme/themeConfig';
import { danhSachYeuCau } from './data';

const { Title, Text } = Typography;
const { Option } = Select;
const donViMap = Object.fromEntries(danhSachDonVi.map((dv) => [dv.id, dv.ten]));
const ktvList = danhSachNguoiDung.filter((nd) => ['ktv', 'manager'].includes(nd.vaiTro));

// ─── Workflow ────────────────────────────────────────────────────────────────
const WF = [
  { key: 'moi_tao', title: 'Mới tạo' }, { key: 'da_tiep_nhan', title: 'Tiếp nhận' },
  { key: 'da_lap_kh', title: 'Đã lập KH' }, { key: 'dang_do', title: 'Đang đo' },
  { key: 'cho_phe_duyet', title: 'Chờ duyệt' }, { key: 'hoan_thanh', title: 'Hoàn thành' },
];
const stepIdx = (s: TrangThaiYC) => { if (s === 'tu_choi') return -1; const i = WF.findIndex((w) => w.key === s); return i >= 0 ? i : 0; };

// ─── Mock tham số đo ────────────────────────────────────────────────────────
interface ThamSo { key: string; stt: number; ten: string; donVi: string; daiDo: string; saiSo: string; ghiChu: string; }
const getMockTS = (ycId: string): ThamSo[] => [
  { key: `${ycId}-1`, stt: 1, ten: 'Tần số trung tâm', donVi: 'MHz', daiDo: '100–120', saiSo: '±0.2', ghiChu: 'So sánh tài liệu chuẩn' },
  { key: `${ycId}-2`, stt: 2, ten: 'Công suất phát xung', donVi: 'kW', daiDo: '200–250', saiSo: '±5%', ghiChu: 'Đo ở chế độ công tác' },
  { key: `${ycId}-3`, stt: 3, ten: 'Độ rộng xung', donVi: 'μs', daiDo: '2–10', saiSo: '±0.1', ghiChu: '' },
  { key: `${ycId}-4`, stt: 4, ten: 'Tần số lặp xung', donVi: 'Hz', daiDo: '300–400', saiSo: '±1', ghiChu: '' },
];

// ─── Dữ liệu đo mẫu ────────────────────────────────────────────────────────
interface DuLieuDo {
  id: string; lanDo: number; thamSo: string;
  giaTriChuan: string; giaTri: string; donVi: string;
  saiSoTT: string; saiSoCP: string; doKDB: string;
  ketLuan: 'dat' | 'khong_dat' | 'can_kiem_tra';
  thoiGian: string; nguoiThucHien: string;
  dieuKienMT?: string;
}

const initDuLieu: DuLieuDo[] = [
  { id: 'DL-001', lanDo: 1, thamSo: 'Tần số trung tâm', giaTriChuan: '110', giaTri: '109.8', donVi: 'MHz', saiSoTT: '-0.2', saiSoCP: '±0.5', doKDB: '±0.05', ketLuan: 'dat', thoiGian: '2026-03-25 08:15', nguoiThucHien: 'Trần Văn Bình', dieuKienMT: '23.2°C / 44%RH' },
  { id: 'DL-002', lanDo: 1, thamSo: 'Công suất phát xung', giaTriChuan: '234', giaTri: '228', donVi: 'kW', saiSoTT: '-2.5%', saiSoCP: '±5%', doKDB: '±1.2%', ketLuan: 'dat', thoiGian: '2026-03-25 08:25', nguoiThucHien: 'Trần Văn Bình', dieuKienMT: '23.2°C / 44%RH' },
  { id: 'DL-003', lanDo: 1, thamSo: 'Độ rộng xung', giaTriChuan: '6.0', giaTri: '6.05', donVi: 'μs', saiSoTT: '+0.05', saiSoCP: '±0.3', doKDB: '±0.02', ketLuan: 'dat', thoiGian: '2026-03-25 08:35', nguoiThucHien: 'Trần Văn Bình', dieuKienMT: '23.2°C / 44%RH' },
  { id: 'DL-004', lanDo: 1, thamSo: 'Tần số lặp xung', giaTriChuan: '350', giaTri: '349', donVi: 'Hz', saiSoTT: '-1', saiSoCP: '±5', doKDB: '±0.5', ketLuan: 'dat', thoiGian: '2026-03-25 08:45', nguoiThucHien: 'Trần Văn Bình', dieuKienMT: '23.2°C / 44%RH' },
  { id: 'DL-005', lanDo: 2, thamSo: 'Tần số trung tâm', giaTriChuan: '110', giaTri: '109.6', donVi: 'MHz', saiSoTT: '-0.4', saiSoCP: '±0.5', doKDB: '±0.05', ketLuan: 'dat', thoiGian: '2026-03-25 10:10', nguoiThucHien: 'Phạm Quang Huy', dieuKienMT: '23.5°C / 45%RH' },
  { id: 'DL-006', lanDo: 2, thamSo: 'Công suất phát xung', giaTriChuan: '234', giaTri: '195', donVi: 'kW', saiSoTT: '-16.7%', saiSoCP: '±5%', doKDB: '±1.2%', ketLuan: 'khong_dat', thoiGian: '2026-03-25 10:20', nguoiThucHien: 'Phạm Quang Huy', dieuKienMT: '23.5°C / 45%RH' },
  { id: 'DL-007', lanDo: 3, thamSo: 'Công suất phát xung', giaTriChuan: '234', giaTri: '210', donVi: 'kW', saiSoTT: '-10.2%', saiSoCP: '±5%', doKDB: '±1.2%', ketLuan: 'can_kiem_tra', thoiGian: '2026-03-26 09:00', nguoiThucHien: 'Trần Văn Bình', dieuKienMT: '22.8°C / 46%RH' },
];

const mockFiles = [
  { name: 'Bien-ban-kiem-tra-ban-dau.pdf', size: '2.4 MB', date: '10/03/2026', type: 'pdf' },
  { name: 'Cau-hinh-khoi-phat-P18.xlsx', size: '856 KB', date: '10/03/2026', type: 'excel' },
  { name: 'Anh-hien-trang-monitoring-01.jpg', size: '3.1 MB', date: '10/03/2026', type: 'image' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
function SC({ title, subtitle, children, extra }: { title: string; subtitle?: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>{title}</Text>
          {subtitle && <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginTop: 1 }}>{subtitle}</Text>}
        </div>
        {extra}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function IF({ icon, label, value, mono, badge }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; badge?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.navy, fontSize: 14, flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div>
        <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>{label}</Text>
        {badge || <Text style={{ fontSize: 14, fontWeight: 500, fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</Text>}
      </div>
    </div>
  );
}

const klBadge = (kl: string) => {
  const m: Record<string, { label: string; color: string; bg: string }> = {
    dat: { label: 'Đạt', color: '#389e0d', bg: '#f0fce8' },
    khong_dat: { label: 'Không đạt', color: '#cf1322', bg: '#fff1f0' },
    can_kiem_tra: { label: 'Cần kiểm tra', color: '#d48806', bg: '#fff7e6' },
  };
  const c = m[kl] || m.can_kiem_tra;
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>{c.label}</span>;
};

// ═════════════════════════════════════════════════════════════════════════════
export default function ChiTietYeuCau() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const yc = useMemo(() => danhSachYeuCau.find((y) => y.id === id), [id]);
  const kh = useMemo(() => yc ? danhSachKeHoach.find((k) => k.maYeuCau === yc.id) : undefined, [yc]);
  void danhSachKetQua; // reserved for future kết quả integration
  const thamSo = useMemo(() => yc ? getMockTS(yc.id) : [], [yc]);
  const duLieu = initDuLieu;

  // ─── Computed: Đánh giá tham số (kế thừa từ Tham số đo + Dữ liệu đo) ────
  const danhGia = useMemo(() => thamSo.map((ts) => {
    const records = duLieu.filter((d) => d.thamSo === ts.ten);
    const latest = records.length > 0 ? records[records.length - 1] : null;
    const failCount = records.filter((r) => r.ketLuan === 'khong_dat').length;
    const warnCount = records.filter((r) => r.ketLuan === 'can_kiem_tra').length;
    let ketLuan: 'dat' | 'khong_dat' | 'can_kiem_tra' = 'dat';
    if (failCount > 0) ketLuan = 'khong_dat';
    else if (warnCount > 0) ketLuan = 'can_kiem_tra';
    else if (!latest) ketLuan = 'can_kiem_tra';
    return {
      key: ts.key, ten: ts.ten, gioiHan: ts.saiSo,
      ketQuaDaiDien: latest?.giaTri ? `${latest.giaTri} ${ts.donVi}` : '—',
      saiSoTT: latest?.saiSoTT || '—',
      danhGia: ketLuan, ketLuanTS: ketLuan,
      nhanXet: ketLuan === 'dat' ? 'Sai số trong giới hạn' : ketLuan === 'khong_dat' ? 'Sai lệch vượt ngưỡng cho phép' : 'Chưa đủ dữ liệu',
      soLanDo: records.length,
    };
  }), [thamSo, duLieu]);

  const dgStats = useMemo(() => ({
    total: danhGia.length,
    dat: danhGia.filter((d) => d.ketLuanTS === 'dat').length,
    khongDat: danhGia.filter((d) => d.ketLuanTS === 'khong_dat').length,
    canKT: danhGia.filter((d) => d.ketLuanTS === 'can_kiem_tra').length,
    ketLuanChung: danhGia.some((d) => d.ketLuanTS === 'khong_dat') ? 'khong_dat'
      : danhGia.some((d) => d.ketLuanTS === 'can_kiem_tra') ? 'can_kiem_tra' : 'dat',
  }), [danhGia]);

  if (!yc) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <Empty description={`Không tìm thấy ${id}`} />
      <Button type="primary" onClick={() => navigate('/yeu-cau')} style={{ marginTop: 16 }}>Quay lại</Button>
    </div>
  );

  const isDone = ['hoan_thanh', 'tu_choi'].includes(yc.trangThai);

  // Stats dữ liệu đo
  const dlStats = useMemo(() => ({
    total: duLieu.length,
    thamSoCoDL: new Set(duLieu.map((d) => d.thamSo)).size,
    dat: duLieu.filter((d) => d.ketLuan === 'dat').length,
    khongDat: duLieu.filter((d) => d.ketLuan === 'khong_dat').length,
    lastUpdate: duLieu.length > 0 ? duLieu[duLieu.length - 1].thoiGian : null,
  }), [duLieu]);

  const moreMenu: MenuProps = {
    items: [
      { key: 'cancel', icon: <StopOutlined />, label: 'Hủy yêu cầu', danger: true },
      { key: 'print', icon: <PrinterOutlined />, label: 'In phiếu yêu cầu' },
      { key: 'history', icon: <HistoryOutlined />, label: 'Lịch sử xử lý' },
    ],
    onClick: ({ key }) => message.info(`${key}: ${yc.id}`),
  };

  // Tham số columns
  const tsCols: ColumnsType<ThamSo> = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 50 },
    { title: 'Tên tham số đo', dataIndex: 'ten', key: 'ten', width: 200, render: (v: string) => <Text style={{ fontWeight: 500 }}>{v}</Text> },
    { title: 'Đơn vị đo', dataIndex: 'donVi', key: 'donVi', width: 90 },
    { title: 'Dải đo / Miền đo', dataIndex: 'daiDo', key: 'daiDo', width: 140, render: (v: string) => <Text style={{ fontFamily: 'monospace' }}>{v}</Text> },
    { title: 'Sai số cho phép', dataIndex: 'saiSo', key: 'saiSo', width: 130, render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#d48806', fontWeight: 600 }}>{v}</Text> },
    { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', render: (v: string) => <Text style={{ color: '#8c8c8c' }}>{v || '—'}</Text> },
  ];

  // Dữ liệu đo columns
  const dlCols: ColumnsType<DuLieuDo> = [
    { title: 'Lần đo', dataIndex: 'lanDo', key: 'lanDo', width: 70, render: (v: number) => <Text style={{ fontWeight: 600 }}>Lần {v}</Text> },
    { title: 'Tham số đo', dataIndex: 'thamSo', key: 'thamSo', width: 160, render: (v: string) => <Text style={{ fontWeight: 500 }}>{v}</Text> },
    { title: 'GT chuẩn', dataIndex: 'giaTriChuan', key: 'giaTriChuan', width: 90, render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#6b7280' }}>{v}</Text> },
    { title: 'GT đo', dataIndex: 'giaTri', key: 'giaTri', width: 90, render: (v: string) => <Text style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{v}</Text> },
    { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 60 },
    { title: 'Sai số TT', dataIndex: 'saiSoTT', key: 'saiSoTT', width: 90, render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#d48806', fontWeight: 600 }}>{v}</Text> },
    { title: 'Sai số CP', dataIndex: 'saiSoCP', key: 'saiSoCP', width: 85, render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{v}</Text> },
    { title: 'Độ KĐB', dataIndex: 'doKDB', key: 'doKDB', width: 85, render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#7c3aed', fontSize: 12 }}>{v}</Text> },
    { title: 'Kết luận', dataIndex: 'ketLuan', key: 'ketLuan', width: 110, render: (v: string) => klBadge(v) },
    { title: 'Thời gian', dataIndex: 'thoiGian', key: 'thoiGian', width: 140, render: (v: string) => <Text style={{ fontSize: 11, color: '#595959' }}>{v}</Text> },
    { title: 'Người TH', dataIndex: 'nguoiThucHien', key: 'nguoiThucHien', width: 160, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    { title: 'ĐKMT', dataIndex: 'dieuKienMT', key: 'dieuKienMT', width: 120, render: (v: string) => <Text style={{ fontSize: 10, color: '#9ca3af' }}>{v || '—'}</Text> },
  ];

  return (
    <div style={{ minHeight: '100%' }}>
      <style>{`
        .row-fail td { background: #fff1f0 !important; }
        .row-fail:hover td { background: #ffe4e6 !important; }
        .row-warn td { background: #fffbe6 !important; }
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <div style={{ background: '#edf4fc', borderBottom: '1px solid #d6e4f5', padding: '20px 32px' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/yeu-cau')}
          style={{ color: colors.navy, marginBottom: 8, padding: '4px 0', fontSize: 13 }}>
          Quay lại danh sách yêu cầu
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={4} style={{ color: '#1a1a2e', margin: '0 0 6px' }}>Chi tiết Yêu cầu đo lường</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: 600, color: colors.navy }}>{yc.id}</Text>
              <StatusBadge status={yc.trangThai} />
              <PriorityBadge priority={yc.uuTien} />
            </div>
            <Text style={{ color: '#1a1a2e', fontSize: 15 }}>{yc.thietBi}</Text>
            <div style={{ marginTop: 6, display: 'flex', gap: 20 }}>
              <Text style={{ color: '#595959', fontSize: 13 }}><EnvironmentOutlined /> {donViMap[yc.donVi] || yc.donVi}</Text>
              <Text style={{ color: '#595959', fontSize: 13 }}><UserOutlined /> {yc.nguoiGui}</Text>
              <Text style={{ color: '#595959', fontSize: 13 }}><CalendarOutlined /> Hạn: {formatDate(yc.ngayHen)}</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isDone && <Button icon={<EditOutlined />}>Chỉnh sửa</Button>}
            {yc.trangThai === 'moi_tao' && <Button type="primary" icon={<SendOutlined />}>Trình phê duyệt</Button>}
            {yc.trangThai === 'da_tiep_nhan' && !kh && <Button type="primary" icon={<CalendarOutlined />} onClick={() => navigate('/ke-hoach-do/tao-moi')}>Tạo kế hoạch đo</Button>}
            <Dropdown menu={moreMenu}><Button icon={<MoreOutlined />} /></Dropdown>
          </div>
        </div>
        {yc.trangThai !== 'tu_choi' ? (
          <div style={{ marginTop: 16, padding: '14px 20px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Steps size="small" current={stepIdx(yc.trangThai)} items={WF.map((s) => ({ title: <span style={{ fontSize: 12 }}>{s.title}</span> }))} style={{ maxWidth: 700 }} />
          </div>
        ) : (
          <div style={{ marginTop: 12, padding: '8px 16px', background: '#fff1f0', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #ffa39e' }}>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} /><Text style={{ color: '#cf1322', fontWeight: 600, fontSize: 13 }}>Từ chối</Text>
          </div>
        )}
      </div>

      {/* ═══ TABS ═════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 32px 32px' }}>
        <Tabs defaultActiveKey="info" style={{ marginTop: 4 }} size="large" items={[
          // ── TAB 1: Thông tin chung ─────────────────────────────────────
          {
            key: 'info', label: <span><FileTextOutlined /> Thông tin chung</span>,
            children: (
              <Row gutter={24}>
                <Col xs={24} md={16} xl={17}>
                  <SC title="Thông tin chung">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
                      <IF icon={<FileTextOutlined />} label="Mã yêu cầu" value={yc.id} />
                      <IF icon={<CalendarOutlined />} label="Ngày tạo" value={formatDate(yc.ngayGui)} />
                      <IF icon={<EnvironmentOutlined />} label="Đơn vị yêu cầu" value={donViMap[yc.donVi] || yc.donVi} />
                      <IF icon={<UserOutlined />} label="Người tạo yêu cầu" value={yc.nguoiGui} />
                      <IF icon={<FileSearchOutlined />} label="Mục đích đo" value={yc.mucDich} />
                      <IF icon={<CalendarOutlined />} label="Hạn trả kết quả" value={formatDate(yc.ngayHen)} />
                      <IF icon={<WarningOutlined />} label="Mức ưu tiên" value="" badge={<PriorityBadge priority={yc.uuTien} />} />
                      <IF icon={<LockOutlined />} label="Mức độ mật" value="Thường" />
                    </div>
                  </SC>
                  <SC title="Thông tin đối tượng đo" subtitle="Khí tài / hệ thống được yêu cầu đo">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
                      <IF icon={<AimOutlined />} label="Tên đối tượng đo" value={yc.thietBi} />
                      <IF icon={<FileTextOutlined />} label="Mã quản lý / Số hiệu" value={yc.maThietBi} mono />
                      <IF icon={<ExperimentOutlined />} label="Loại đối tượng đo" value="Hệ thống monitoring" />
                      <IF icon={<SafetyCertificateOutlined />} label="Model / Phiên bản" value="P-18 Terek" />
                      <IF icon={<EnvironmentOutlined />} label="Đơn vị quản lý" value={donViMap[yc.donVi] || yc.donVi} />
                      <IF icon={<WarningOutlined />} label="Tình trạng" value="Có nghi ngờ sai lệch" />
                    </div>
                    {yc.ghiChu && (
                      <div style={{ marginTop: 16, padding: '14px 18px', background: '#fffbe6', borderRadius: 8, border: '1px solid #fff1b8' }}>
                        <Text style={{ fontSize: 12, color: '#d48806', fontWeight: 600, display: 'block', marginBottom: 4 }}>Mô tả hiện tượng / Vấn đề kỹ thuật</Text>
                        <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{yc.ghiChu}</Text>
                      </div>
                    )}
                  </SC>
                  <SC title="Nội dung yêu cầu đo">
                    <Text style={{ fontSize: 14, lineHeight: 1.7, display: 'block', marginBottom: 16 }}>
                      Yêu cầu đo kiểm tra tham số phát hệ thống monitoring TX-18 bao gồm: tần số trung tâm, công suất phát xung, độ rộng xung, tần số lặp xung.
                      So sánh kết quả với tài liệu KT gốc. Phát hiện sụt giảm công suất phát khi kiểm tra vận hành định kỳ.
                    </Text>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Yêu cầu KT / Giới hạn</Text>
                        <Text style={{ fontSize: 13, lineHeight: 1.6 }}>Sai số tần số ≤0.2 MHz, công suất phát ≥85% danh định.</Text>
                      </Col>
                      <Col span={12}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Căn cứ KT / Tài liệu tham chiếu</Text>
                        <Text style={{ fontSize: 13, lineHeight: 1.6 }}>Tài liệu KT hệ thống monitoring TX-18, ĐLVN 154:2022.</Text>
                      </Col>
                    </Row>
                  </SC>
                  <SC title="Ghi chú và đề xuất">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' }}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c' }}>Đề xuất phòng Lab</Text><br /><Text style={{ fontSize: 13, fontWeight: 500 }}>{yc.phongLab}</Text></div>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c' }}>Đề xuất người phụ trách</Text><br /><Text style={{ fontSize: 13, color: '#bfbfbf' }}>Chưa cập nhật</Text></div>
                    </div>
                  </SC>
                </Col>
                {/* SIDEBAR */}
                <Col xs={24} md={8} xl={7}>
                  <div style={{ position: 'sticky', top: 120 }}>
                    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Trạng thái</Text>
                      <StatusBadge status={yc.trangThai} />
                    </div>
                    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>Kế hoạch đo</Text>
                      {kh ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{kh.id}</Text>
                            <StatusBadge status={kh.trangThai} />
                          </div>
                          <Progress percent={kh.tienDo} size="small" strokeColor={kh.tienDo >= 100 ? '#52c41a' : colors.navy} />
                          <Button type="link" style={{ padding: 0, marginTop: 8, fontSize: 12 }} onClick={() => navigate(`/ke-hoach-do/${kh.id}`)}>Xem chi tiết →</Button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                          <Text style={{ color: '#bfbfbf', fontSize: 12, display: 'block', marginBottom: 8 }}>Chưa lập</Text>
                          {!isDone && <Button type="primary" size="small" ghost icon={<CalendarOutlined />} onClick={() => navigate('/ke-hoach-do/tao-moi')}>Tạo KH đo</Button>}
                        </div>
                      )}
                    </div>
                    {/* Tóm tắt dữ liệu đo */}
                    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>Tóm tắt dữ liệu đo</Text>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Tổng lần đo', value: String(dlStats.total), color: '#1a1a2e' },
                          { label: 'Tham số đã đo', value: `${dlStats.thamSoCoDL}/${thamSo.length}`, color: colors.navy },
                          { label: 'Đạt', value: String(dlStats.dat), color: '#389e0d' },
                          { label: 'Không đạt', value: String(dlStats.khongDat), color: '#cf1322' },
                        ].map((s) => (
                          <div key={s.label} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 700, color: s.color, display: 'block' }}>{s.value}</Text>
                            <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{s.label}</Text>
                          </div>
                        ))}
                      </div>
                      {dlStats.lastUpdate && (
                        <Text style={{ fontSize: 11, color: '#bfbfbf', display: 'block', marginTop: 8 }}>Cập nhật: {dlStats.lastUpdate}</Text>
                      )}
                    </div>
                    {/* Tóm tắt đánh giá */}
                    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>Tóm tắt đánh giá</Text>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {[
                          { label: 'Tham số đánh giá', value: String(dgStats.total), color: '#1a1a2e' },
                          { label: 'Đạt', value: String(dgStats.dat), color: '#389e0d' },
                          { label: 'Không đạt', value: String(dgStats.khongDat), color: '#cf1322' },
                          { label: 'Cần KT lại', value: String(dgStats.canKT), color: '#d48806' },
                        ].map((s) => (
                          <div key={s.label} style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: s.color, display: 'block' }}>{s.value}</Text>
                            <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{s.label}</Text>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        padding: '8px 12px', borderRadius: 6, textAlign: 'center',
                        background: dgStats.ketLuanChung === 'dat' ? '#f0fce8' : dgStats.ketLuanChung === 'khong_dat' ? '#fff1f0' : '#fffbe6',
                      }}>
                        <Text style={{
                          fontSize: 12, fontWeight: 700,
                          color: dgStats.ketLuanChung === 'dat' ? '#389e0d' : dgStats.ketLuanChung === 'khong_dat' ? '#cf1322' : '#d48806',
                        }}>
                          {dgStats.ketLuanChung === 'dat' ? 'ĐẠT' : dgStats.ketLuanChung === 'khong_dat' ? 'KHÔNG ĐẠT' : 'CẦN KIỂM TRA'}
                        </Text>
                      </div>
                    </div>
                    {/* Timeline */}
                    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Timeline</Text>
                      <Timeline items={[
                        { color: '#1E6FD9', children: <div><Text style={{ fontSize: 12, fontWeight: 600 }}>Tạo yêu cầu</Text><br /><Text style={{ fontSize: 11, color: '#8c8c8c' }}>{formatDate(yc.ngayGui)}</Text></div> },
                        ...(['da_tiep_nhan', 'da_lap_kh', 'dang_do', 'cho_phe_duyet', 'hoan_thanh'].includes(yc.trangThai) ? [{ color: '#1E6FD9', children: <Text style={{ fontSize: 12, fontWeight: 600 }}>Tiếp nhận</Text> }] : []),
                        ...(kh ? [{ color: '#0070cc', children: <div><Text style={{ fontSize: 12, fontWeight: 600 }}>Lập kế hoạch</Text><br /><Text style={{ fontSize: 11, color: '#8c8c8c' }}>{kh.id}</Text></div> }] : []),
                        ...(duLieu.length > 0 ? [{ color: '#7c3aed', children: <div><Text style={{ fontSize: 12, fontWeight: 600 }}>Cập nhật dữ liệu đo</Text><br /><Text style={{ fontSize: 11, color: '#8c8c8c' }}>{dlStats.total} bản ghi</Text></div> }] : []),
                        ...(duLieu.length > 0 ? [{ color: dgStats.ketLuanChung === 'dat' ? '#52c41a' : '#d48806', children: <div><Text style={{ fontSize: 12, fontWeight: 600 }}>Đánh giá kết quả</Text><br /><Text style={{ fontSize: 11, color: '#8c8c8c' }}>{dgStats.dat}/{dgStats.total} đạt</Text></div> }] : []),
                        ...(yc.trangThai === 'hoan_thanh' ? [{ color: '#52c41a', children: <Text style={{ fontSize: 12, fontWeight: 600, color: '#389e0d' }}>Hoàn thành</Text> }] : []),
                        ...(yc.trangThai === 'tu_choi' ? [{ color: '#ff4d4f', children: <Text style={{ fontSize: 12, fontWeight: 600, color: '#cf1322' }}>Từ chối</Text> }] : []),
                      ]} />
                    </div>
                    {/* Checklist */}
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 20px', border: '1px solid #edf0f4' }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>Checklist</Text>
                      {[
                        { label: 'Thông tin chung', ok: true }, { label: 'Đối tượng đo', ok: true },
                        { label: 'Nội dung YC đo', ok: true }, { label: 'Tham số đo', ok: thamSo.length > 0 },
                        { label: 'Dữ liệu đo', ok: duLieu.length > 0 },
                        { label: 'Đánh giá', ok: duLieu.length > 0 }, { label: 'Kế hoạch đo', ok: !!kh },
                      ].map((c) => (
                        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          {c.ok ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13 }} /> : <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 13 }} />}
                          <Text style={{ fontSize: 12, color: c.ok ? '#1a1a2e' : '#bfbfbf' }}>{c.label}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            ),
          },

          // ── TAB 2: Tham số đo ──────────────────────────────────────────
          {
            key: 'thamSo', label: <span><BarChartOutlined /> Tham số đo</span>,
            children: (
              <SC title={`Tham số / Đại lượng cần đo (${thamSo.length})`} subtitle="Danh sách tham số kỹ thuật cần đo theo yêu cầu">
                <Table columns={tsCols} dataSource={thamSo} rowKey="key" pagination={false} size="middle" />
              </SC>
            ),
          },

          // ── TAB 3: Dữ liệu đo ─────────────────────────────────────────
          {
            key: 'duLieu', label: <span><DatabaseOutlined /> Dữ liệu đo <Tag style={{ marginLeft: 4, fontSize: 11 }}>{duLieu.length}</Tag></span>,
            children: (
              <div>
                <SC title="Dữ liệu đo thực tế" subtitle="Dữ liệu được đồng bộ từ module Nhập dữ liệu đo (MDC) — chỉ xem, không chỉnh sửa tại đây" extra={
                  <Button type="primary" icon={<ExperimentOutlined />} size="small" onClick={() => navigate('/thuc-hien-do')}>Nhập dữ liệu tại MDC</Button>
                }>
                  {duLieu.length > 0 ? (
                    <Table
                      columns={dlCols} dataSource={duLieu} rowKey="id"
                      pagination={false} size="middle" scroll={{ x: 1100 }}
                      rowClassName={(r) => r.ketLuan === 'khong_dat' ? 'row-fail' : r.ketLuan === 'can_kiem_tra' ? 'row-warn' : ''}
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu đo" style={{ padding: '48px 0' }} />
                  )}
                </SC>
              </div>
            ),
          },

          // ── TAB 4: Đánh giá ──────────────────────────────────────────
          {
            key: 'danhGia', label: <span><SafetyCertificateOutlined /> Đánh giá</span>,
            children: (
              <div>
                {/* Action bar trên đầu */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20,
                  padding: '12px 20px', background: '#fff', borderRadius: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <Button icon={<SaveOutlined />} onClick={() => message.info('Lưu đánh giá')}>Lưu đánh giá</Button>
                  <Button icon={<PrinterOutlined />} onClick={() => message.info('Xuất biên bản')}>Xuất biên bản</Button>
                  <Button type="primary" icon={<SendOutlined />} onClick={() => message.success('Đã trình duyệt kết quả')}>Trình duyệt kết quả</Button>
                  <Button onClick={() => navigate('/ket-qua')}>Cấp chứng chỉ</Button>
                </div>

                {/* Khối A: Summary KPI */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                  {[
                    { label: 'Tổng tham số', value: dgStats.total, color: '#1E6FD9', bg: '#e8f4fd' },
                    { label: 'Đạt', value: dgStats.dat, color: '#389e0d', bg: '#f0fce8' },
                    { label: 'Không đạt', value: dgStats.khongDat, color: '#cf1322', bg: '#fff1f0' },
                    { label: 'Cần kiểm tra', value: dgStats.canKT, color: '#d48806', bg: '#fff7e6' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: '16px 20px', borderRadius: 10, background: s.bg,
                      border: `1px solid ${s.color}20`, textAlign: 'center',
                    }}>
                      <Text style={{ fontSize: 28, fontWeight: 700, color: s.color, display: 'block', lineHeight: 1.1 }}>{s.value}</Text>
                      <Text style={{ fontSize: 12, color: s.color, fontWeight: 500, marginTop: 4 }}>{s.label}</Text>
                    </div>
                  ))}
                </div>

                {/* Khối B: Bảng đánh giá */}
                <SC title="Đánh giá theo tham số" subtitle="Tổng hợp kết quả đo so với giới hạn cho phép">
                  <Table
                    dataSource={danhGia} rowKey="key" pagination={false} size="middle"
                    rowClassName={(r) => r.ketLuanTS === 'khong_dat' ? 'row-fail' : r.ketLuanTS === 'can_kiem_tra' ? 'row-warn' : ''}
                    columns={[
                      { title: 'STT', key: 'stt', width: 50, render: (_: unknown, __: unknown, i: number) => <Text style={{ color: '#8c8c8c' }}>{i + 1}</Text> },
                      { title: 'Tham số đo', dataIndex: 'ten', key: 'ten', width: 180, render: (v: string) => <Text style={{ fontWeight: 500 }}>{v}</Text> },
                      { title: 'Giới hạn CP', dataIndex: 'gioiHan', key: 'gioiHan', width: 110, render: (v: string) => <Text style={{ fontFamily: 'monospace' }}>{v}</Text> },
                      { title: 'KQ đo đại diện', dataIndex: 'ketQuaDaiDien', key: 'kqdd', width: 140, render: (v: string) => <Text style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Text> },
                      { title: 'Sai số TT', dataIndex: 'saiSoTT', key: 'ss', width: 100, render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#d48806', fontWeight: 600 }}>{v}</Text> },
                      { title: 'Đánh giá', dataIndex: 'danhGia', key: 'dg', width: 120, render: (v: string) => klBadge(v) },
                      { title: 'Nhận xét', dataIndex: 'nhanXet', key: 'nx', render: (v: string) => <Text style={{ fontSize: 12, color: '#595959' }}>{v}</Text> },
                      { title: 'Kết luận', dataIndex: 'ketLuanTS', key: 'kl', width: 110, render: (v: string) => klBadge(v) },
                    ]}
                  />
                </SC>

                {/* Khối C: Nhận xét kết luận */}
                <SC title="Nhận xét và kết luận tổng thể">
                  <Row gutter={24}>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nhận xét kỹ thuật tổng thể</Text>
                        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #edf0f4', minHeight: 60 }}>
                          <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                            {dgStats.khongDat > 0
                              ? `Phát hiện ${dgStats.khongDat} tham số không đạt yêu cầu kỹ thuật. Công suất phát xung sụt giảm đáng kể so với danh định, cần kiểm tra khối khuếch đại công suất.`
                              : 'Tất cả tham số đo nằm trong giới hạn cho phép.'}
                          </Text>
                        </div>
                      </div>
                      <div>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nguyên nhân sơ bộ</Text>
                        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #edf0f4', minHeight: 60 }}>
                          <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                            {dgStats.khongDat > 0
                              ? 'Nghi ngờ hỏng hóc tại tầng khuếch đại công suất cuối (PA final stage). Cần kiểm tra module khuếch đại và các linh kiện bán dẫn công suất.'
                              : '—'}
                          </Text>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Đề xuất xử lý tiếp theo</Text>
                        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #edf0f4', minHeight: 60 }}>
                          <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                            {dgStats.khongDat > 0
                              ? 'Đề nghị chuyển đơn vị sửa chữa khối khuếch đại công suất, sau đó đo lại toàn bộ tham số phát.'
                              : 'Đề nghị phê duyệt kết quả và cấp chứng chỉ.'}
                          </Text>
                        </div>
                      </div>
                      <div>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kết luận cuối cùng</Text>
                        <div style={{
                          padding: '16px 20px', borderRadius: 10, textAlign: 'center',
                          background: dgStats.ketLuanChung === 'dat' ? '#f0fdf4' : dgStats.ketLuanChung === 'khong_dat' ? '#fef2f2' : '#fffbeb',
                          border: `2px solid ${dgStats.ketLuanChung === 'dat' ? '#bbf7d0' : dgStats.ketLuanChung === 'khong_dat' ? '#fecaca' : '#fde68a'}`,
                        }}>
                          {dgStats.ketLuanChung === 'dat' && <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a', marginBottom: 6 }} />}
                          {dgStats.ketLuanChung === 'khong_dat' && <CloseCircleOutlined style={{ fontSize: 28, color: '#ff4d4f', marginBottom: 6 }} />}
                          {dgStats.ketLuanChung === 'can_kiem_tra' && <WarningOutlined style={{ fontSize: 28, color: '#d48806', marginBottom: 6 }} />}
                          <div style={{
                            fontSize: 16, fontWeight: 700, marginTop: 4,
                            color: dgStats.ketLuanChung === 'dat' ? '#389e0d' : dgStats.ketLuanChung === 'khong_dat' ? '#cf1322' : '#d48806',
                          }}>
                            {dgStats.ketLuanChung === 'dat' ? 'ĐẠT — Đủ điều kiện phê duyệt'
                              : dgStats.ketLuanChung === 'khong_dat' ? 'KHÔNG ĐẠT — Cần xử lý kỹ thuật'
                              : 'CẦN ĐO LẠI — Chưa đủ dữ liệu'}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </SC>

                {/* Khối D: Thông tin đánh giá + Actions */}
                <SC title="Thông tin đánh giá">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Người đánh giá</Text>
                      <Text style={{ fontSize: 13, fontWeight: 500 }}>Trần Văn Bình</Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Thời gian đánh giá</Text>
                      <Text style={{ fontSize: 13, fontWeight: 500 }}>26/03/2026 14:30</Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Trạng thái đánh giá</Text>
                      {klBadge(dgStats.ketLuanChung)}
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Cập nhật cuối</Text>
                      <Text style={{ fontSize: 13, fontWeight: 500 }}>26/03/2026 14:30</Text>
                    </div>
                  </div>
                </SC>
              </div>
            ),
          },

          // ── TAB 5: Tệp đính kèm ───────────────────────────────────────
          {
            key: 'files', label: <span><InboxOutlined /> Tệp đính kèm <Tag style={{ marginLeft: 4, fontSize: 11 }}>{mockFiles.length}</Tag></span>,
            children: (
              <SC title={`Hồ sơ đính kèm (${mockFiles.length})`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mockFiles.map((f) => (
                    <div key={f.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 8, border: '1px solid #f0f0f0',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fafbfc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: f.type === 'pdf' ? '#fff1f0' : f.type === 'excel' ? '#f0fce8' : '#e8f4fd',
                          color: f.type === 'pdf' ? '#cf1322' : f.type === 'excel' ? '#389e0d' : '#1E6FD9', fontSize: 14,
                        }}><FileTextOutlined /></div>
                        <div>
                          <Text style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>{f.size} · {f.date}</Text>
                        </div>
                      </div>
                      <Button type="text" size="small" style={{ color: '#8c8c8c' }}>Tải</Button>
                    </div>
                  ))}
                </div>
              </SC>
            ),
          },
        ]} />
      </div>

      {/* Drawer đã chuyển sang module MDC */}
    </div>
  );
}
