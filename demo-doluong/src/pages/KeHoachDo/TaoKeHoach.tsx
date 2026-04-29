import { useState, useMemo } from 'react';
import {
  Typography, Button, Input, Select, DatePicker, Row, Col, Tabs, Table, Tag, message, Drawer, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined,
  PlusOutlined, DeleteOutlined,
  FileTextOutlined, TeamOutlined,
  ClockCircleOutlined, BarChartOutlined,
  InfoCircleOutlined, SearchOutlined,
  AimOutlined, EnvironmentOutlined, ThunderboltOutlined,
  ExperimentOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { danhSachDonVi } from '../../data/donVi';
import { danhSachPhongLab } from '../../data/phongLab';
import { danhSachChuanDo } from '../../data/chuanDo';
import { danhSachNguoiDung } from '../../data/nguoiDung';
import { formatDate } from '../../utils/format';
import { StatusBadge, PriorityBadge } from '../../components';
import type { YeuCau } from '../../types';
import { danhSachYeuCau } from '../YeuCau/data';
import { danhSachKeHoach } from '../../data/keHoachDo';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const donViMap = Object.fromEntries(danhSachDonVi.map((dv) => [dv.id, dv.ten]));
const ktvList = danhSachNguoiDung.filter((nd) => ['ktv', 'manager'].includes(nd.vaiTro));
const mappedYC = new Set(danhSachKeHoach.map((kh) => kh.maYeuCau));
const availableYC = danhSachYeuCau.filter((yc) => !mappedYC.has(yc.id) && !['hoan_thanh', 'tu_choi'].includes(yc.trangThai));

function getThamSo(ycId: string) {
  return [
    { key: `${ycId}-1`, nguon: ycId, ten: 'Tần số trung tâm', donVi: 'MHz', daiDo: '100–120', saiSo: '±0.2', ghiChu: 'So sánh tài liệu chuẩn' },
    { key: `${ycId}-2`, nguon: ycId, ten: 'Công suất phát xung', donVi: 'kW', daiDo: '200–250', saiSo: '±5%', ghiChu: 'Đo ở chế độ công tác' },
    { key: `${ycId}-3`, nguon: ycId, ten: 'Độ rộng xung', donVi: 'μs', daiDo: '2–10', saiSo: '±0.1', ghiChu: '' },
    { key: `${ycId}-4`, nguon: ycId, ten: 'Tần số lặp xung', donVi: 'Hz', daiDo: '300–400', saiSo: '±1', ghiChu: '' },
  ];
}

interface TaskRow { id: string; ten: string; ngayBD: string; ngayKT: string; ktv: string; phuHop: string; ghiChu: string; }
const defaultTasks: Omit<TaskRow, 'id' | 'ktv' | 'phuHop'>[] = [
  { ten: 'Tiếp nhận đối tượng đo', ngayBD: '2026-03-28', ngayKT: '2026-03-28', ghiChu: '' },
  { ten: 'Kiểm tra tình trạng ban đầu', ngayBD: '2026-03-28', ngayKT: '2026-03-29', ghiChu: '' },
  { ten: 'Cấu hình hệ thống đo', ngayBD: '2026-03-29', ngayKT: '2026-03-30', ghiChu: '' },
  { ten: 'Thực hiện đo lần 1', ngayBD: '2026-03-30', ngayKT: '2026-04-01', ghiChu: '' },
  { ten: 'Thực hiện đo bổ sung (nếu cần)', ngayBD: '2026-04-01', ngayKT: '2026-04-02', ghiChu: '' },
  { ten: 'Tổng hợp dữ liệu đo', ngayBD: '2026-04-02', ngayKT: '2026-04-03', ghiChu: '' },
  { ten: 'Đánh giá kết quả', ngayBD: '2026-04-03', ngayKT: '2026-04-04', ghiChu: '' },
  { ten: 'Hoàn thiện biên bản', ngayBD: '2026-04-04', ngayKT: '2026-04-05', ghiChu: '' },
];

// ── Gantt colors per task index ──
const GANTT_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1',
  '#14b8a6', '#f97316', '#84cc16', '#a855f7',
];

// AI Lab scoring
function scoreLabForYC(labId: string, ycs: YeuCau[]): { score: number; reasons: string[] } {
  const lab = danhSachPhongLab.find((l) => l.id === labId);
  if (!lab) return { score: 0, reasons: [] };
  let score = 0; const reasons: string[] = [];
  if (lab.trangThai === 'hoat_dong') { score += 30; reasons.push('Đang hoạt động'); } else { score -= 50; reasons.push('Không hoạt động'); }
  const text = ycs.map((y) => `${y.thietBi} ${y.phongLab}`).join(' ').toLowerCase();
  if (lab.ten.toLowerCase().split(' ').some((w) => text.includes(w) && w.length > 2)) { score += 40; reasons.push('Lĩnh vực phù hợp'); }
  score += Math.floor(Math.random() * 20) + 10;
  reasons.push('Lịch trống trong khoảng thời gian KH');
  return { score: Math.min(100, Math.max(0, score)), reasons };
}

// KTV recommendation mock
function ktvFitLabel(ktvId: string): { label: string; color: string; bg: string } {
  const idx = ktvList.findIndex((k) => k.id === ktvId);
  if (idx === 0) return { label: 'Phù hợp cao', color: '#389e0d', bg: '#f0fce8' };
  if (idx === 1) return { label: 'Phù hợp', color: '#0070cc', bg: '#e6f7ff' };
  return { label: 'Khả dụng', color: '#8c8c8c', bg: '#f5f5f5' };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CSS-in-JS tokens                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
const token = {
  cardBg: '#ffffff',
  cardRadius: 8,
  cardShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)',
  cardBorder: '1px solid #eef1f6',
  sectionGap: 24,
  labelColor: '#4b5563',
  labelSize: 13,
  inputHeight: 36,
  mutedText: '#9ca3af',
  divider: '#eef1f6',
  pageBg: '#f7f8fa',
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Shared sub-components                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
function SectionCard({ title, subtitle, icon, extra, children, noPad }: {
  title: string; subtitle?: string; icon?: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode; noPad?: boolean;
}) {
  return (
    <div style={{
      background: token.cardBg, borderRadius: token.cardRadius,
      border: token.cardBorder, boxShadow: token.cardShadow,
      marginBottom: token.sectionGap, overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${token.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && <span style={{ color: colors.navy, fontSize: 15 }}>{icon}</span>}
          <div>
            <Text strong style={{ fontSize: 14, color: '#111827', letterSpacing: '-0.01em' }}>{title}</Text>
            {subtitle && <Text style={{ fontSize: 12, color: token.mutedText, display: 'block', marginTop: 1, lineHeight: '16px' }}>{subtitle}</Text>}
          </div>
        </div>
        {extra}
      </div>
      <div style={noPad ? {} : { padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <Text style={{ fontSize: token.labelSize, fontWeight: 500, color: token.labelColor }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </Text>
      {hint && <Text style={{ fontSize: 11, color: token.mutedText }}>{hint}</Text>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { height: token.inputHeight, borderRadius: 6 };
const readonlyStyle: React.CSSProperties = { ...inputStyle, background: '#f9fafb', color: '#374151', fontWeight: 500 };

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Global CSS for this page                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */
const pageCSS = `
  .tkh-tabs .ant-tabs-nav { margin-bottom: 0; }
  .tkh-tabs .ant-tabs-nav::before { border-bottom: 1px solid ${token.divider}; }
  .tkh-tabs .ant-tabs-tab {
    padding: 14px 6px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #6b7280 !important;
    transition: color 0.2s;
  }
  .tkh-tabs .ant-tabs-tab:hover { color: ${colors.navy} !important; }
  .tkh-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${colors.navy} !important; font-weight: 600 !important; }
  .tkh-tabs .ant-tabs-ink-bar { height: 2.5px !important; border-radius: 2px; }
  .tkh-tabs .ant-tabs-content-holder { padding-top: 24px; }

  .tkh-tabs .ant-tabs-tab .ant-tag {
    font-size: 10px !important; line-height: 16px !important;
    padding: 0 5px !important; margin-left: 6px !important;
    border-radius: 4px !important; min-width: 18px; text-align: center;
  }

  .tkh-table .ant-table-thead > tr > th {
    background: #f8f9fb !important; font-size: 11px !important;
    font-weight: 600 !important; color: #6b7280 !important;
    text-transform: uppercase !important; letter-spacing: 0.4px !important;
    padding: 10px 14px !important; border-bottom: 1px solid ${token.divider} !important;
  }
  .tkh-table .ant-table-tbody > tr > td {
    padding: 12px 14px !important; font-size: 13px !important;
    border-bottom: 1px solid #f3f4f6 !important;
  }
  .tkh-table .ant-table-tbody > tr:hover > td { background: #f8faff !important; }
  .tkh-table .ant-table-tbody > tr:last-child > td { border-bottom: none !important; }

  .tkh-input .ant-input, .tkh-input .ant-select-selector, .tkh-input .ant-picker {
    border-radius: 6px !important; height: ${token.inputHeight}px !important;
  }
  .tkh-input .ant-select-selector { display: flex !important; align-items: center !important; }

  .lab-card { cursor: pointer; transition: all 0.2s ease; }
  .lab-card:hover { border-color: ${colors.navy} !important; box-shadow: 0 2px 8px rgba(30,111,217,0.1) !important; }

  .timeline-row { transition: background 0.15s; }
  .timeline-row:hover { background: #f8faff !important; }
`;

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Main Component                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function TaoKeHoach() {
  const navigate = useNavigate();
  const [selectedYCs, setSelectedYCs] = useState<YeuCau[]>([]);
  const [ycDrawerOpen, setYcDrawerOpen] = useState(false);
  const [ycSearch, setYcSearch] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState('');
  const [tasks, setTasks] = useState<TaskRow[]>(defaultTasks.map((t, i) => ({ ...t, id: `T-${i + 1}`, ktv: '', phuHop: '' })));

  const thamSo = useMemo(() => selectedYCs.flatMap((yc) => getThamSo(yc.id)), [selectedYCs]);
  const selectedLab = useMemo(() => danhSachPhongLab.find((l) => l.id === selectedLabId), [selectedLabId]);

  const labScores = useMemo(() => {
    if (selectedYCs.length === 0) return [];
    return danhSachPhongLab.map((l) => {
      const { score, reasons } = scoreLabForYC(l.id, selectedYCs);
      return { lab: l, score, reasons, available: l.trangThai === 'hoat_dong' };
    }).sort((a, b) => b.score - a.score);
  }, [selectedYCs]);

  const filteredAvailable = useMemo(() => {
    const sel = new Set(selectedYCs.map((y) => y.id));
    const s = ycSearch.toLowerCase();
    return availableYC.filter((yc) => !sel.has(yc.id) && (!s || yc.id.toLowerCase().includes(s) || yc.thietBi.toLowerCase().includes(s) || (donViMap[yc.donVi] || '').toLowerCase().includes(s)));
  }, [selectedYCs, ycSearch]);

  return (
    <div style={{ minHeight: '100%', background: token.pageBg }}>
      <style>{pageCSS}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, #edf4fc 0%, #f4f8fd 100%)',
        borderBottom: '1px solid #dce6f2',
        padding: '16px 32px 20px',
      }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/ke-hoach-do')}
          style={{ color: '#6b7280', padding: 0, fontSize: 13, fontWeight: 500, marginBottom: 12, height: 'auto' }}>
          Quay lại danh sách
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Title level={4} style={{ color: '#111827', margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Tạo mới Kế hoạch đo
              </Title>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb',
              }}>
                Bản nháp
              </span>
            </div>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Measurement Plan — Doanh nghiệp A</Text>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon={<SaveOutlined />} style={{
              height: 38, borderRadius: 6, fontWeight: 500, fontSize: 13,
              borderColor: '#d1d5db', color: '#374151',
            }}>
              Lưu nháp
            </Button>
            <Button type="primary" icon={<CheckCircleOutlined />}
              disabled={selectedYCs.length === 0 || !selectedLabId}
              onClick={() => { message.success('Đã phê duyệt kế hoạch'); navigate('/ke-hoach-do'); }}
              style={{
                height: 38, borderRadius: 6, fontWeight: 600, fontSize: 13,
                boxShadow: '0 1px 3px rgba(30,111,217,0.3)',
              }}>
              Phê duyệt kế hoạch
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ padding: '0 32px 40px' }} className="tkh-input">
        <Tabs className="tkh-tabs" defaultActiveKey="info" items={[

          /* ─── TAB 1: Thông tin kế hoạch ─────────────────────────────────── */
          {
            key: 'info',
            label: <span><FileTextOutlined style={{ marginRight: 6 }} />Thông tin kế hoạch</span>,
            children: (
              <div>
                {/* Yêu cầu đo liên kết — ĐẶT LÊN ĐẦU */}
                <SectionCard title="Yêu cầu đo liên kết" icon={<AimOutlined />} subtitle="Chọn 1 yêu cầu đo đã tiếp nhận làm căn cứ lập kế hoạch">
                  <Row gutter={20}>
                    <Col span={10}>
                      <FieldLabel label="Chọn yêu cầu đo" required />
                      <Select
                        placeholder="Tìm theo mã YC, đối tượng đo, đơn vị..."
                        showSearch optionFilterProp="children"
                        style={{ width: '100%' }}
                        value={selectedYCs.length > 0 ? selectedYCs[0].id : undefined}
                        onChange={(v) => { const yc = availableYC.find((y) => y.id === v); setSelectedYCs(yc ? [yc] : []); }}
                        allowClear onClear={() => setSelectedYCs([])}
                      >
                        {availableYC.map((yc) => (
                          <Option key={yc.id} value={yc.id}>
                            <span style={{ fontWeight: 600, color: colors.navy, fontFamily: 'monospace' }}>{yc.id}</span>
                            <span style={{ margin: '0 6px', color: '#d1d5db' }}>—</span>
                            {yc.thietBi.substring(0, 40)}
                            <span style={{ color: '#9ca3af', marginLeft: 6 }}>· {donViMap[yc.donVi] || yc.donVi}</span>
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={14}>
                      {selectedYCs.length > 0 ? (() => {
                        const yc = selectedYCs[0];
                        return (
                          <div style={{
                            padding: '14px 18px', background: '#f8fbff', borderRadius: 8,
                            border: '1px solid #dce8f5', marginTop: 22,
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                  <Text strong style={{ color: colors.navy, fontSize: 13, fontFamily: 'monospace' }}>{yc.id}</Text>
                                  <StatusBadge status={yc.trangThai} />
                                  <PriorityBadge priority={yc.uuTien} />
                                </div>
                                <Text style={{ fontSize: 13, fontWeight: 500, display: 'block', color: '#1f2937', marginBottom: 2 }}>{yc.thietBi}</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                  {donViMap[yc.donVi] || yc.donVi}
                                  <span style={{ margin: '0 8px', color: '#d1d5db' }}>·</span>
                                  {yc.mucDich}
                                </Text>
                              </div>
                              <div style={{
                                padding: '4px 10px', borderRadius: 6,
                                background: '#fffbeb', border: '1px solid #fde68a',
                              }}>
                                <Text style={{ fontSize: 11, color: '#92400e', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  Hạn: {formatDate(yc.ngayHen)}
                                </Text>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <div style={{
                          padding: '14px 18px', background: '#fafafa', borderRadius: 8,
                          border: '1px dashed #d9d9d9', marginTop: 22, textAlign: 'center',
                        }}>
                          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                            Thông tin yêu cầu đo sẽ hiển thị tại đây
                          </Text>
                        </div>
                      )}
                    </Col>
                  </Row>
                </SectionCard>

                {/* Thông tin chung */}
                <SectionCard title="Thông tin chung" icon={<FileTextOutlined />} subtitle="Mã kế hoạch, phân loại và người tạo">
                  <Row gutter={20} style={{ marginBottom: 18 }}>
                    <Col span={4}>
                      <FieldLabel label="Mã KH" />
                      <Input value="KH-2026-008" disabled style={{ ...readonlyStyle, fontWeight: 600, color: colors.navy, fontFamily: 'monospace' }} />
                    </Col>
                    <Col span={5}>
                      <FieldLabel label="Ngày tạo" />
                      <DatePicker value={dayjs('2026-03-27')} disabled style={{ ...readonlyStyle, width: '100%' }} format="DD/MM/YYYY" />
                    </Col>
                    <Col span={6}>
                      <FieldLabel label="Loại kế hoạch" required />
                      <Select placeholder="Chọn loại kế hoạch" style={{ width: '100%' }}>
                        {['KH đo định kỳ', 'KH đo sau sửa chữa', 'KH kiểm tra nghiệm thu', 'KH đo đột xuất'].map((l) => (
                          <Option key={l} value={l}>{l}</Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={4}>
                      <FieldLabel label="Ưu tiên" />
                      <Select placeholder="Chọn" style={{ width: '100%' }}>
                        {[
                          { v: 'thap', l: 'Thấp' }, { v: 'trung_binh', l: 'Trung bình' },
                          { v: 'cao', l: 'Cao' }, { v: 'khan_cap', l: 'Khẩn cấp' },
                        ].map((o) => <Option key={o.v} value={o.v}>{o.l}</Option>)}
                      </Select>
                    </Col>
                    <Col span={5}>
                      <FieldLabel label="Người tạo" />
                      <Input value="Đ/tá Nguyễn Văn Thắng" disabled style={readonlyStyle} />
                    </Col>
                  </Row>

                  <Row gutter={20}>
                    <Col span={24}>
                      <FieldLabel label="Tên kế hoạch đo" required hint="Tên ngắn gọn, mô tả mục đích" />
                      <Input placeholder="VD: KH đo sau bảo trì khối phát hệ thống monitoring TX-18 Terek" style={inputStyle} />
                    </Col>
                  </Row>
                </SectionCard>

                {/* Thời gian kế hoạch */}
                <SectionCard title="Thời gian kế hoạch" icon={<ClockCircleOutlined />} subtitle="Khoảng thời gian dự kiến thực hiện">
                  <Row gutter={20}>
                    <Col span={6}>
                      <FieldLabel label="Ngày bắt đầu" required />
                      <DatePicker style={{ width: '100%', ...inputStyle }} format="DD/MM/YYYY" placeholder="Chọn ngày"
                        onChange={(d) => setHasTime(!!d)} />
                    </Col>
                    <Col span={6}>
                      <FieldLabel label="Ngày kết thúc" required />
                      <DatePicker style={{ width: '100%', ...inputStyle }} format="DD/MM/YYYY" placeholder="Chọn ngày"
                        onChange={(d) => setHasTime(!!d)} />
                    </Col>
                    <Col span={5}>
                      <FieldLabel label="Ca thực hiện" />
                      <Select placeholder="Chọn ca" style={{ width: '100%' }}>
                        <Option value="sang">Sáng</Option>
                        <Option value="chieu">Chiều</Option>
                        <Option value="ca_ngay">Cả ngày</Option>
                      </Select>
                    </Col>
                    <Col span={7}>
                      <FieldLabel label="Mô tả ngắn" hint="Tùy chọn" />
                      <Input placeholder="Mô tả tổng quan kế hoạch..." style={inputStyle} />
                    </Col>
                  </Row>

                  {hasTime && selectedYCs.length > 0 && (
                    <Alert type="info" showIcon icon={<InfoCircleOutlined />}
                      style={{ marginTop: 16, borderRadius: 8, border: '1px solid #bfdbfe', background: '#eff6ff' }}
                      message={<Text style={{ fontSize: 13, color: '#1e40af' }}>Chuyển sang tab <strong>Phòng lab & Nguồn lực</strong> để xem gợi ý phòng lab phù hợp.</Text>}
                    />
                  )}
                </SectionCard>
              </div>
            ),
          },

          /* ─── TAB 2: Phòng lab & Nguồn lực ─────────────────────────────── */
          {
            key: 'lab',
            label: <span><TeamOutlined style={{ marginRight: 6 }} />Phòng lab & Nguồn lực</span>,
            children: (
              <div>
                {selectedYCs.length === 0 ? (
                  <Alert type="warning" showIcon
                    message="Cần chọn yêu cầu đo và thời gian kế hoạch trước"
                    description="Quay lại tab Thông tin kế hoạch để chọn yêu cầu đo liên kết và nhập thời gian thực hiện."
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <>
                    {/* Lab recommendation */}
                    <SectionCard
                      title="Gợi ý phòng lab phù hợp"
                      icon={<ExperimentOutlined />}
                      subtitle="Phân tích dựa trên yêu cầu đo, năng lực phòng lab và lịch khả dụng"
                      extra={
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: '#f5f3ff', color: '#7c3aed', border: '1px solid #e9d5ff',
                        }}>
                          <ThunderboltOutlined /> AI gợi ý
                        </span>
                      }
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {labScores.map(({ lab: l, score, reasons, available }, idx) => {
                          const isSelected = l.id === selectedLabId;
                          const isBest = idx === 0 && available;
                          return (
                            <div key={l.id} className="lab-card"
                              onClick={() => available && setSelectedLabId(l.id)}
                              style={{
                                padding: 20, borderRadius: 10,
                                cursor: available ? 'pointer' : 'not-allowed',
                                border: `1.5px solid ${isSelected ? colors.navy : '#e5e7eb'}`,
                                background: isSelected ? '#f0f7ff' : available ? '#fff' : '#fafafa',
                                opacity: available ? 1 : 0.45,
                                position: 'relative',
                              }}>
                              {/* Best match indicator */}
                              {isBest && !isSelected && (
                                <div style={{
                                  position: 'absolute', top: -1, right: 16,
                                  padding: '2px 10px', borderRadius: '0 0 6px 6px',
                                  background: '#059669', color: '#fff', fontSize: 10, fontWeight: 600,
                                }}>
                                  Đề xuất
                                </div>
                              )}

                              {/* Header row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong style={{ fontSize: 14, color: isSelected ? colors.navy : '#111827' }}>{l.ten}</Text>
                                {/* Score */}
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  padding: '3px 10px', borderRadius: 20,
                                  background: score >= 70 ? '#f0fdf4' : score >= 40 ? '#fffbeb' : '#fef2f2',
                                  border: `1px solid ${score >= 70 ? '#bbf7d0' : score >= 40 ? '#fde68a' : '#fecaca'}`,
                                }}>
                                  {score >= 70 && <ThunderboltOutlined style={{ fontSize: 11, color: '#16a34a' }} />}
                                  <Text style={{
                                    fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                                    color: score >= 70 ? '#15803d' : score >= 40 ? '#a16207' : '#dc2626',
                                  }}>{score}%</Text>
                                </div>
                              </div>

                              {/* Reason tags */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                                {reasons.map((r, i) => (
                                  <span key={i} style={{
                                    padding: '2px 8px', borderRadius: 4, fontSize: 11,
                                    background: '#f3f4f6', color: '#4b5563', fontWeight: 500,
                                  }}>{r}</span>
                                ))}
                              </div>

                              {/* Lab details */}
                              <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
                                padding: '12px 14px', background: isSelected ? '#e8f0fe' : '#f9fafb',
                                borderRadius: 6,
                              }}>
                                {[
                                  { label: 'Nhiệt độ', value: l.nhietDo },
                                  { label: 'Độ ẩm', value: l.doAm },
                                  { label: 'Trưởng phòng', value: l.truongPhong },
                                ].map((item) => (
                                  <div key={item.label}>
                                    <Text style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.label}</Text>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginTop: 2 }}>{item.value}</div>
                                  </div>
                                ))}
                              </div>

                              {isSelected && (
                                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <CheckCircleOutlined style={{ color: colors.navy, fontSize: 13 }} />
                                  <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 600 }}>Đã chọn phòng lab này</Text>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </SectionCard>

                    {/* Nguồn lực */}
                    {selectedLab && (
                      <SectionCard
                        title="Nguồn lực thực hiện"
                        icon={<SafetyCertificateOutlined />}
                        subtitle={`Phòng lab đã chọn: ${selectedLab.ten}`}
                      >
                        <Row gutter={20} style={{ marginBottom: 18 }}>
                          <Col span={8}>
                            <FieldLabel label="Địa điểm" />
                            <Input value={selectedLab.viTri} disabled style={readonlyStyle} />
                          </Col>
                          <Col span={8}>
                            <FieldLabel label="Người quản lý Lab" />
                            <Input value={selectedLab.truongPhong} disabled style={readonlyStyle} />
                          </Col>
                          <Col span={8}>
                            <FieldLabel label="Trạng thái" />
                            <div style={{ height: token.inputHeight, display: 'flex', alignItems: 'center' }}>
                              <StatusBadge status={selectedLab.trangThai} />
                            </div>
                          </Col>
                        </Row>
                        <Row gutter={20}>
                          <Col span={12}>
                            <FieldLabel label="Chuẩn đo / TB dự kiến sử dụng" />
                            <Select mode="multiple" placeholder="Chọn chuẩn đo, thiết bị..." style={{ width: '100%' }}>
                              {danhSachChuanDo.map((c) => <Option key={c.id} value={c.id}>{c.ten}</Option>)}
                            </Select>
                          </Col>
                          <Col span={12}>
                            <FieldLabel label="Ghi chú nguồn lực" />
                            <Input placeholder="Lưu ý đặc biệt về nguồn lực..." style={inputStyle} />
                          </Col>
                        </Row>
                      </SectionCard>
                    )}
                  </>
                )}
              </div>
            ),
          },

          /* ─── TAB 3: Timeline công việc ─────────────────────────────────── */
          {
            key: 'timeline',
            label: <span><ClockCircleOutlined style={{ marginRight: 6 }} />Timeline công việc</span>,
            children: (
              <div>
                {!selectedLabId ? (
                  <Alert type="warning" showIcon
                    message="Cần chọn phòng lab trước"
                    description="Quay lại tab Phòng lab & Nguồn lực để chọn phòng lab phù hợp."
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <>
                  <SectionCard
                    title="Kế hoạch công việc"
                    icon={<ClockCircleOutlined />}
                    subtitle="Xây dựng timeline và phân công kỹ thuật viên cho từng đầu mục"
                    noPad
                    extra={
                      <Button type="primary" ghost size="small" icon={<PlusOutlined />}
                        style={{ borderRadius: 6, fontWeight: 500, fontSize: 12 }}
                        onClick={() => setTasks((p) => [...p, { id: `T-${p.length + 1}`, ten: '', ngayBD: '', ngayKT: '', ktv: '', phuHop: '', ghiChu: '' }])}>
                        Thêm đầu mục
                      </Button>
                    }
                  >
                    {/* Table header */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 210px 100px 1fr 40px',
                      gap: 8, padding: '10px 20px', fontSize: 10, fontWeight: 600, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.4px',
                      background: '#f8f9fb', borderBottom: `1px solid ${token.divider}`,
                    }}>
                      <span style={{ textAlign: 'center' }}>#</span>
                      <span>Đầu mục công việc</span>
                      <span>Ngày BĐ</span>
                      <span>Ngày KT</span>
                      <span>KTV phụ trách</span>
                      <span>Mức phù hợp</span>
                      <span>Ghi chú</span>
                      <span />
                    </div>

                    {/* Rows */}
                    <div>
                      {tasks.map((t, i) => {
                        const fit = t.ktv ? ktvFitLabel(t.ktv) : null;
                        return (
                          <div key={t.id} className="timeline-row" style={{
                            display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 210px 100px 1fr 40px',
                            gap: 8, padding: '10px 20px', alignItems: 'center',
                            borderBottom: i < tasks.length - 1 ? `1px solid #f3f4f6` : 'none',
                            background: '#fff',
                          }}>
                            {/* STT */}
                            <div style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 24, height: 24, borderRadius: '50%',
                                background: '#eef2ff', color: colors.navy,
                                fontSize: 11, fontWeight: 700,
                              }}>{i + 1}</span>
                            </div>

                            {/* Tên */}
                            <Input size="small" variant="borderless" value={t.ten} placeholder="Tên công việc"
                              style={{ fontWeight: 500, fontSize: 13 }}
                              onChange={(e) => setTasks((p) => p.map((x, j) => j === i ? { ...x, ten: e.target.value } : x))} />

                            {/* Ngày BĐ */}
                            <DatePicker size="small" format="DD/MM" style={{ width: '100%' }} placeholder="Bắt đầu"
                              value={t.ngayBD ? dayjs(t.ngayBD) : null}
                              onChange={(d) => setTasks((p) => p.map((x, j) => j === i ? { ...x, ngayBD: d ? d.format('YYYY-MM-DD') : '' } : x))} />

                            {/* Ngày KT */}
                            <DatePicker size="small" format="DD/MM" style={{ width: '100%' }} placeholder="Kết thúc"
                              value={t.ngayKT ? dayjs(t.ngayKT) : null}
                              onChange={(d) => setTasks((p) => p.map((x, j) => j === i ? { ...x, ngayKT: d ? d.format('YYYY-MM-DD') : '' } : x))} />

                            {/* KTV */}
                            <Select size="small" placeholder="Chọn KTV" style={{ width: '100%' }} allowClear
                              value={t.ktv || undefined}
                              onChange={(v) => setTasks((p) => p.map((x, j) => j === i ? { ...x, ktv: v || '' } : x))}>
                              {ktvList.map((nd) => {
                                const f = ktvFitLabel(nd.id);
                                return (
                                  <Option key={nd.id} value={nd.id}>
                                    <span>{nd.capBac} {nd.hoTen}</span>
                                    <span style={{ fontSize: 10, color: f.color, marginLeft: 6, fontWeight: 600 }}>• {f.label}</span>
                                  </Option>
                                );
                              })}
                            </Select>

                            {/* Mức phù hợp */}
                            <div>
                              {fit ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center',
                                  padding: '2px 8px', borderRadius: 4,
                                  fontSize: 11, fontWeight: 600,
                                  color: fit.color, background: fit.bg,
                                }}>
                                  {fit.label}
                                </span>
                              ) : (
                                <Text style={{ fontSize: 11, color: '#d1d5db' }}>—</Text>
                              )}
                            </div>

                            {/* Ghi chú */}
                            <Input size="small" variant="borderless" value={t.ghiChu} placeholder="Ghi chú..."
                              style={{ fontSize: 12, color: '#6b7280' }}
                              onChange={(e) => setTasks((p) => p.map((x, j) => j === i ? { ...x, ghiChu: e.target.value } : x))} />

                            {/* Xóa */}
                            <div style={{ textAlign: 'center' }}>
                              <Button type="text" size="small" icon={<DeleteOutlined style={{ fontSize: 12, color: '#d1d5db' }} />}
                                disabled={tasks.length <= 1}
                                onClick={() => setTasks((p) => p.filter((_, j) => j !== i))}
                                style={{ width: 28, height: 28 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI hint */}
                    <div style={{
                      margin: '0 20px 20px', padding: '12px 16px',
                      background: '#faf5ff', borderRadius: 8, border: '1px solid #ede9fe',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <ThunderboltOutlined style={{ color: '#7c3aed', fontSize: 14, marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <Text style={{ fontSize: 12, color: '#6d28d9', fontWeight: 600 }}>Gợi ý phân công thông minh</Text>
                        <Text style={{ fontSize: 12, color: '#7c3aed', display: 'block', marginTop: 2, lineHeight: '18px' }}>
                          KTV được gợi ý dựa trên chuyên môn, phòng lab <strong>{selectedLab?.ten}</strong> và lịch khả dụng.
                          Mức "Phù hợp cao" ưu tiên KTV có kinh nghiệm với loại phép đo tương tự.
                        </Text>
                      </div>
                    </div>
                  </SectionCard>

                  {/* GANTT CHART */}
                  {(() => {
                    const tasksWithDates = tasks.filter((t) => t.ngayBD && t.ngayKT);
                    if (tasksWithDates.length === 0) return null;

                    const allDates = tasksWithDates.flatMap((t) => [new Date(t.ngayBD).getTime(), new Date(t.ngayKT).getTime()]);
                    const minDate = Math.min(...allDates);
                    const maxDate = Math.max(...allDates);
                    const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / 864e5));

                    // Generate date columns for header
                    const dateCols: { label: string; date: string }[] = [];
                    for (let d = 0; d <= totalDays; d++) {
                      const dt = new Date(minDate + d * 864e5);
                      dateCols.push({
                        label: `${dt.getDate()}/${dt.getMonth() + 1}`,
                        date: dt.toISOString().slice(0, 10),
                      });
                    }

                    return (
                      <SectionCard
                        title="Biểu đồ Gantt"
                        icon={<BarChartOutlined />}
                        subtitle={`${tasksWithDates.length} đầu mục · ${dateCols[0]?.label} → ${dateCols[dateCols.length - 1]?.label}`}
                        noPad
                      >
                        <div style={{ overflowX: 'auto' }}>
                          <div style={{ minWidth: Math.max(700, 220 + dateCols.length * 48) }}>
                            {/* Header: date columns */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: `220px repeat(${dateCols.length}, 1fr)`,
                              borderBottom: `1px solid ${token.divider}`,
                              background: '#f8f9fb',
                            }}>
                              <div style={{
                                padding: '10px 20px', fontSize: 10, fontWeight: 600,
                                color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px',
                                borderRight: `1px solid ${token.divider}`,
                              }}>
                                Đầu mục công việc
                              </div>
                              {dateCols.map((dc, ci) => {
                                const isWeekend = [0, 6].includes(new Date(dc.date).getDay());
                                return (
                                  <div key={ci} style={{
                                    padding: '10px 2px', textAlign: 'center',
                                    fontSize: 10, fontWeight: 600,
                                    color: isWeekend ? '#ef4444' : '#6b7280',
                                    background: isWeekend ? '#fef2f2' : 'transparent',
                                    borderRight: ci < dateCols.length - 1 ? `1px solid #f3f4f6` : 'none',
                                  }}>
                                    {dc.label}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Rows */}
                            {tasks.map((t, i) => {
                              const hasDates = t.ngayBD && t.ngayKT;
                              const startDay = hasDates ? Math.max(0, Math.ceil((new Date(t.ngayBD).getTime() - minDate) / 864e5)) : 0;
                              const endDay = hasDates ? Math.max(startDay, Math.ceil((new Date(t.ngayKT).getTime() - minDate) / 864e5)) : 0;
                              const barColor = GANTT_COLORS[i % GANTT_COLORS.length];

                              return (
                                <div key={t.id} style={{
                                  display: 'grid',
                                  gridTemplateColumns: `220px repeat(${dateCols.length}, 1fr)`,
                                  borderBottom: i < tasks.length - 1 ? '1px solid #f3f4f6' : 'none',
                                  alignItems: 'center',
                                  minHeight: 40,
                                }}>
                                  {/* Task name */}
                                  <div style={{
                                    padding: '8px 12px 8px 20px',
                                    fontSize: 12, fontWeight: 500, color: '#374151',
                                    borderRight: `1px solid ${token.divider}`,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                  }}>
                                    <span style={{
                                      width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                                      background: barColor,
                                    }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.ten}>
                                      {t.ten || `Công việc ${i + 1}`}
                                    </span>
                                  </div>

                                  {/* Date cells with bar */}
                                  {dateCols.map((dc, ci) => {
                                    const isInRange = hasDates && ci >= startDay && ci <= endDay;
                                    const isStart = ci === startDay;
                                    const isEnd = ci === endDay;
                                    const isWeekend = [0, 6].includes(new Date(dc.date).getDay());

                                    return (
                                      <div key={ci} style={{
                                        padding: '6px 1px', height: '100%', display: 'flex', alignItems: 'center',
                                        background: isWeekend && !isInRange ? '#fefafa' : 'transparent',
                                        borderRight: ci < dateCols.length - 1 ? `1px solid #f9fafb` : 'none',
                                      }}>
                                        {isInRange && (
                                          <div style={{
                                            height: 22, width: '100%',
                                            background: barColor,
                                            opacity: 0.85,
                                            borderRadius: isStart && isEnd ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0,
                                            position: 'relative',
                                          }}>
                                            {/* Show duration label on first cell of bar */}
                                            {isStart && (endDay - startDay + 1) >= 2 && (
                                              <span style={{
                                                position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                                                fontSize: 9, fontWeight: 700, color: '#fff',
                                                whiteSpace: 'nowrap',
                                              }}>
                                                {endDay - startDay + 1}d
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}

                            {/* Today line overlay info */}
                            <div style={{
                              padding: '10px 20px', borderTop: `1px solid ${token.divider}`,
                              display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#9ca3af',
                            }}>
                              <span>Tổng: <strong style={{ color: '#374151' }}>{totalDays + 1} ngày</strong></span>
                              <span style={{ color: '#d1d5db' }}>·</span>
                              <span>{tasksWithDates.length} đầu mục đã có lịch</span>
                              <span style={{ color: '#d1d5db' }}>·</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 1, background: '#fecaca', border: '1px solid #fca5a5' }} />
                                Cuối tuần
                              </span>
                            </div>
                          </div>
                        </div>
                      </SectionCard>
                    );
                  })()}
                  </>
                )}
              </div>
            ),
          },

          /* ─── TAB 4: Tham số kế thừa ───────────────────────────────────── */
          {
            key: 'thamSo',
            label: (
              <span>
                <BarChartOutlined style={{ marginRight: 6 }} />Tham số kế thừa
                {thamSo.length > 0 && (
                  <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, lineHeight: '16px', padding: '0 5px', borderRadius: 4, minWidth: 18, textAlign: 'center' }}>
                    {thamSo.length}
                  </Tag>
                )}
              </span>
            ),
            children: (
              <div>
                <SectionCard
                  title={`Tham số đo kế thừa${thamSo.length > 0 ? ` (${thamSo.length})` : ''}`}
                  icon={<BarChartOutlined />}
                  subtitle="Tự động kế thừa từ yêu cầu đo liên kết — không cần nhập lại"
                  noPad
                >
                  {thamSo.length > 0 ? (
                    <div className="tkh-table">
                      <Table
                        dataSource={thamSo}
                        rowKey="key"
                        pagination={false}
                        size="middle"
                        columns={[
                          {
                            title: 'Nguồn YC', dataIndex: 'nguon', key: 'nguon', width: 110,
                            render: (v: string) => <Text style={{ color: colors.navy, fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{v}</Text>,
                          },
                          {
                            title: 'Tên tham số', dataIndex: 'ten', key: 'ten', width: 180,
                            render: (v: string) => <Text style={{ fontWeight: 600, color: '#111827' }}>{v}</Text>,
                          },
                          { title: 'Đơn vị', dataIndex: 'donVi', key: 'dv', width: 80,
                            render: (v: string) => <Text style={{ color: '#6b7280' }}>{v}</Text>,
                          },
                          {
                            title: 'Dải đo', dataIndex: 'daiDo', key: 'dd', width: 120,
                            render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#374151' }}>{v}</Text>,
                          },
                          {
                            title: 'Sai số CP', dataIndex: 'saiSo', key: 'ss', width: 110,
                            render: (v: string) => (
                              <span style={{
                                padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace',
                                background: '#fffbeb', color: '#a16207', fontWeight: 700, fontSize: 12,
                                border: '1px solid #fde68a',
                              }}>{v}</span>
                            ),
                          },
                          {
                            title: 'Ghi chú', dataIndex: 'ghiChu', key: 'gc',
                            render: (v: string) => <Text style={{ color: v ? '#6b7280' : '#d1d5db', fontSize: 12 }}>{v || '—'}</Text>,
                          },
                        ]}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '56px 0', color: '#d1d5db' }}>
                      <BarChartOutlined style={{ fontSize: 40, marginBottom: 12, color: '#e5e7eb' }} />
                      <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>Chưa có tham số</div>
                      <div style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>Chọn yêu cầu đo ở tab "Thông tin kế hoạch" để kế thừa tham số</div>
                    </div>
                  )}
                </SectionCard>
              </div>
            ),
          },

          /* ─── TAB 5: Ghi chú ───────────────────────────────────────────── */
          {
            key: 'notes',
            label: <span><FileTextOutlined style={{ marginRight: 6 }} />Ghi chú</span>,
            children: (
              <div>
                <SectionCard title="Ghi chú và lưu ý thực hiện" icon={<FileTextOutlined />} subtitle="Thông tin bổ sung hỗ trợ quá trình thực hiện kế hoạch đo">
                  <Row gutter={24}>
                    <Col span={12}>
                      <div style={{ marginBottom: 20 }}>
                        <FieldLabel label="Yêu cầu phối hợp" hint="Đơn vị, nhân sự cần phối hợp" />
                        <TextArea rows={4} placeholder="VD: Phối hợp với Trung tâm 64 chuẩn bị đối tượng đo tại vị trí triển khai..."
                          style={{ borderRadius: 6, resize: 'none' }} />
                      </div>
                      <div>
                        <FieldLabel label="Rủi ro dự kiến" hint="Các yếu tố có thể ảnh hưởng" />
                        <TextArea rows={4} placeholder="VD: Thời tiết có thể ảnh hưởng đến phép đo ngoài trời..."
                          style={{ borderRadius: 6, resize: 'none' }} />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 20 }}>
                        <FieldLabel label="Lưu ý kỹ thuật" hint="Yêu cầu kỹ thuật đặc biệt" />
                        <TextArea rows={4} placeholder="VD: Cần khởi động thiết bị 30 phút trước khi đo để ổn định nhiệt..."
                          style={{ borderRadius: 6, resize: 'none' }} />
                      </div>
                      <div>
                        <FieldLabel label="Ý kiến chỉ huy" hint="Chỉ đạo, phê duyệt" />
                        <TextArea rows={4} placeholder="Ghi nhận ý kiến chỉ đạo từ chỉ huy đơn vị..."
                          style={{ borderRadius: 6, resize: 'none' }} />
                      </div>
                    </Col>
                  </Row>
                </SectionCard>
              </div>
            ),
          },
        ]} />

      </div>

      {/* ═══ DRAWER (YC picker — kept for future use) ═══ */}
      <Drawer open={ycDrawerOpen} onClose={() => setYcDrawerOpen(false)} title={null} width={620} closable={false} styles={{ body: { padding: 0 } }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ background: `linear-gradient(135deg, ${colors.navyDark}, ${colors.navy})`, padding: '18px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Title level={5} style={{ color: '#fff', margin: 0, fontSize: 15 }}>Chọn yêu cầu đo</Title>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Chọn YC đã tiếp nhận để gắn vào KH</Text>
              </div>
              <Button type="text" onClick={() => setYcDrawerOpen(false)} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>×</Button>
            </div>
          </div>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <Input placeholder="Tìm mã YC, đối tượng đo, đơn vị..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} value={ycSearch} onChange={(e) => setYcSearch(e.target.value)} allowClear />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredAvailable.map((yc) => (
              <div key={yc.id} style={{ padding: '12px 24px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => { setSelectedYCs([yc]); setYcDrawerOpen(false); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Text strong style={{ color: colors.navy, fontSize: 13 }}>{yc.id}</Text>
                    <PriorityBadge priority={yc.uuTien} />
                    <StatusBadge status={yc.trangThai} />
                  </div>
                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Hạn: {formatDate(yc.ngayHen)}</Text>
                </div>
                <Text style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{yc.thietBi}</Text>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}><EnvironmentOutlined /> {donViMap[yc.donVi] || yc.donVi}</Text>
                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}><AimOutlined /> {yc.mucDich}</Text>
                </div>
              </div>
            ))}
            {filteredAvailable.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#bfbfbf' }}>Không tìm thấy YC phù hợp</div>}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
