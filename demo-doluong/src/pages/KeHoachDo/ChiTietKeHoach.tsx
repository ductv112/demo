import React, { useMemo } from 'react';
import {
  Typography, Button, Progress, Empty, Tag, Dropdown, Tabs, Row, Col,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SyncOutlined, PlayCircleOutlined,
  CheckCircleOutlined, MoreOutlined, PauseCircleOutlined, StopOutlined,
  PrinterOutlined, HistoryOutlined,
  FileTextOutlined, TeamOutlined, ClockCircleOutlined, BarChartOutlined,
  ExperimentOutlined, SafetyCertificateOutlined, AimOutlined,
  EnvironmentOutlined, UserOutlined, CalendarOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { danhSachKeHoach } from '../../data/keHoachDo';
import { danhSachPhongLab } from '../../data/phongLab';
import { danhSachNguoiDung } from '../../data/nguoiDung';
import { danhSachYeuCau } from '../YeuCau/data';
import { danhSachDonVi } from '../../data/donVi';
import { formatDate } from '../../utils/format';
import { StatusBadge, PriorityBadge } from '../../components';
import { colors } from '../../theme/themeConfig';
import type { KeHoachDo } from '../../types';

const { Title, Text } = Typography;

const TODAY = new Date('2026-03-27');
const donViMap = Object.fromEntries(danhSachDonVi.map((dv) => [dv.id, dv.ten]));

const token = {
  cardBg: '#ffffff', cardRadius: 8,
  cardShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)',
  cardBorder: '1px solid #eef1f6', sectionGap: 24,
  mutedText: '#9ca3af', divider: '#eef1f6', pageBg: '#f7f8fa',
};

const GANTT_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1'];

const KH_STEPS = [
  { key: 'chua_lap', label: 'Chưa lập' },
  { key: 'da_lap', label: 'Đã lập' },
  { key: 'da_duyet', label: 'Đã duyệt' },
  { key: 'dang_thuc_hien', label: 'Đang thực hiện' },
  { key: 'hoan_thanh', label: 'Hoàn thành' },
];

function getStepIndex(kh: KeHoachDo): number {
  const map: Record<string, number> = { chua_lap: 0, da_lap: 1, da_duyet: 2, dang_thuc_hien: 3, hoan_thanh: 4, tre_han: 3 };
  return map[kh.trangThai] ?? 0;
}

function getThamSo(ycId: string) {
  return [
    { key: `${ycId}-1`, nguon: ycId, ten: 'Tần số trung tâm', donVi: 'MHz', daiDo: '100–120', saiSo: '±0.2', ghiChu: 'So sánh tài liệu chuẩn' },
    { key: `${ycId}-2`, nguon: ycId, ten: 'Công suất phát xung', donVi: 'kW', daiDo: '200–250', saiSo: '±5%', ghiChu: 'Đo ở chế độ công tác' },
    { key: `${ycId}-3`, nguon: ycId, ten: 'Độ rộng xung', donVi: 'μs', daiDo: '2–10', saiSo: '±0.1', ghiChu: '' },
    { key: `${ycId}-4`, nguon: ycId, ten: 'Tần số lặp xung', donVi: 'Hz', daiDo: '300–400', saiSo: '±1', ghiChu: '' },
  ];
}

const pageCSS = `
  .ctkh-tabs .ant-tabs-nav { margin-bottom: 0; }
  .ctkh-tabs .ant-tabs-nav::before { border-bottom: 1px solid ${token.divider}; }
  .ctkh-tabs .ant-tabs-tab {
    padding: 14px 6px !important; font-size: 13px !important;
    font-weight: 500 !important; color: #6b7280 !important;
  }
  .ctkh-tabs .ant-tabs-tab:hover { color: ${colors.navy} !important; }
  .ctkh-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${colors.navy} !important; font-weight: 600 !important; }
  .ctkh-tabs .ant-tabs-ink-bar { height: 2.5px !important; border-radius: 2px; }
  .ctkh-tabs .ant-tabs-content-holder { padding-top: 24px; }
  .ctkh-tabs .ant-tabs-tab .ant-tag {
    font-size: 10px !important; line-height: 16px !important;
    padding: 0 5px !important; margin-left: 6px !important;
    border-radius: 4px !important; min-width: 18px; text-align: center;
  }
  .timeline-row-detail { transition: background 0.15s; }
  .timeline-row-detail:hover { background: #f8faff !important; }
`;

function SC({ title, subtitle, icon, extra, children, noPad }: {
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

function InfoField({ label, value, mono, link, onClick }: {
  label: string; value: string; mono?: boolean; link?: boolean; onClick?: () => void;
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 3 }}>
        {label}
      </Text>
      <Text style={{
        fontSize: 13, fontWeight: 500, color: link ? colors.navy : '#111827',
        fontFamily: mono ? 'monospace' : 'inherit', cursor: link ? 'pointer' : 'default',
      }} onClick={onClick}>
        {value || 'Chưa cập nhật'}
      </Text>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
const ChiTietKeHoach: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const kh = useMemo(() => danhSachKeHoach.find((k) => k.id === id), [id]);

  if (!kh) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Empty description={`Không tìm thấy kế hoạch ${id}`} />
        <Button type="primary" onClick={() => navigate('/ke-hoach-do')} style={{ marginTop: 16 }}>Quay lại danh sách</Button>
      </div>
    );
  }

  const isLate = !['hoan_thanh'].includes(kh.trangThai) && new Date(kh.ngayKetThuc) < TODAY;
  const isNear = !['hoan_thanh'].includes(kh.trangThai) && !isLate && (() => {
    const d = Math.ceil((new Date(kh.ngayKetThuc).getTime() - TODAY.getTime()) / 864e5);
    return d >= 0 && d <= 3;
  })();
  const totalCV = kh.congViec.length;
  const doneCV = kh.congViec.filter((cv) => cv.trangThai === 'hoan_thanh').length;
  const doingCV = kh.congViec.filter((cv) => cv.trangThai === 'dang_lam').length;
  const waitCV = kh.congViec.filter((cv) => cv.trangThai === 'chua_lam').length;
  const stepIdx = getStepIndex(kh);

  const linkedYC = danhSachYeuCau.find((yc) => yc.id === kh.maYeuCau);
  const linkedLab = danhSachPhongLab.find((l) => l.id === kh.phongLab);
  const ktvInfo = danhSachNguoiDung.find((nd) => nd.id === kh.ktvPhuTrach);
  const thamSo = getThamSo(kh.maYeuCau);
  const progressColor = isLate ? '#ef4444' : kh.tienDo >= 100 ? '#10b981' : colors.navy;

  const moreMenu: MenuProps['items'] = [
    { key: 'pause', icon: <PauseCircleOutlined />, label: 'Tạm dừng kế hoạch' },
    { key: 'cancel', icon: <StopOutlined />, label: 'Hủy kế hoạch', danger: true },
    { type: 'divider' },
    { key: 'print', icon: <PrinterOutlined />, label: 'In kế hoạch' },
    { key: 'history', icon: <HistoryOutlined />, label: 'Xem lịch sử xử lý' },
  ];

  return (
    <div style={{ minHeight: '100%', background: token.pageBg }}>
      <style>{pageCSS}</style>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, #edf4fc 0%, #f4f8fd 100%)',
        borderBottom: '1px solid #dce6f2', padding: '16px 32px 20px',
      }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/ke-hoach-do')}
          style={{ color: '#6b7280', padding: 0, fontSize: 13, fontWeight: 500, marginBottom: 12, height: 'auto' }}>
          Quay lại danh sách kế hoạch
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Title level={4} style={{ color: '#111827', margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Chi tiết Kế hoạch đo
              </Title>
              <StatusBadge status={kh.trangThai} />
              {isLate && <Tag color="red" style={{ margin: 0, borderRadius: 4 }}>Trễ hạn</Tag>}
              {isNear && <Tag color="orange" style={{ margin: 0, borderRadius: 4 }}>Sắp đến hạn</Tag>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
              <Text style={{ fontSize: 13, color: '#374151' }}>
                <span style={{ color: token.mutedText }}>Mã KH:</span>{' '}
                <strong style={{ color: colors.navy, fontFamily: 'monospace' }}>{kh.id}</strong>
              </Text>
              <span style={{ color: '#d1d5db' }}>|</span>
              <Text style={{ fontSize: 13, color: '#374151' }}>
                <UserOutlined style={{ marginRight: 4, color: token.mutedText }} />{kh.tenKtv}
              </Text>
              <span style={{ color: '#d1d5db' }}>|</span>
              <Text style={{ fontSize: 13, color: '#374151' }}>
                <CalendarOutlined style={{ marginRight: 4, color: token.mutedText }} />{formatDate(kh.ngayBatDau)}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button icon={<EditOutlined />}
              style={{ height: 36, borderRadius: 6, fontWeight: 500, fontSize: 13, borderColor: '#d1d5db', color: '#374151' }}>
              Chỉnh sửa
            </Button>
            <Button icon={<SyncOutlined />}
              style={{ height: 36, borderRadius: 6, fontWeight: 500, fontSize: 13, borderColor: '#d1d5db', color: '#374151' }}>
              Cập nhật tiến độ
            </Button>
            {kh.trangThai === 'da_duyet' && (
              <Button type="primary" icon={<PlayCircleOutlined />}
                style={{ height: 36, borderRadius: 6, fontWeight: 600, fontSize: 13, boxShadow: '0 1px 3px rgba(30,111,217,0.3)' }}>
                Bắt đầu thực hiện
              </Button>
            )}
            {kh.trangThai === 'dang_thuc_hien' && (
              <Button type="primary" icon={<CheckCircleOutlined />}
                style={{ height: 36, borderRadius: 6, fontWeight: 600, fontSize: 13, background: '#059669', borderColor: '#059669' }}>
                Hoàn thành kế hoạch
              </Button>
            )}
            <Dropdown menu={{ items: moreMenu }} trigger={['click']}>
              <Button icon={<MoreOutlined />} style={{ height: 36, width: 36, borderRadius: 6, borderColor: '#d1d5db' }} />
            </Dropdown>
          </div>
        </div>

        {/* Progress stepper */}
        <div style={{
          marginTop: 20, padding: '14px 24px', background: '#fff',
          borderRadius: 8, border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center',
        }}>
          {KH_STEPS.map((step, i) => {
            const isCompleted = i < stepIdx;
            const isCurrent = i === stepIdx;
            const isError = isCurrent && isLate;
            return (
              <React.Fragment key={step.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: isCompleted ? '#10b981' : isCurrent ? (isError ? '#ef4444' : colors.navy) : '#e5e7eb',
                    color: isCompleted || isCurrent ? '#fff' : '#9ca3af',
                  }}>
                    {isCompleted ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : i + 1}
                  </div>
                  <Text style={{
                    fontSize: 12, fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                    color: isCompleted ? '#059669' : isCurrent ? (isError ? '#ef4444' : colors.navy) : '#9ca3af',
                  }}>
                    {step.label}
                  </Text>
                </div>
                {i < KH_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: '0 16px', background: isCompleted ? '#10b981' : '#e5e7eb', borderRadius: 1 }} />
                )}
              </React.Fragment>
            );
          })}
          <div style={{ marginLeft: 24, flexShrink: 0 }}>
            <Progress type="circle" percent={kh.tienDo} size={48} strokeColor={progressColor} strokeWidth={8}
              format={(p) => <span style={{ fontSize: 13, fontWeight: 700, color: progressColor }}>{p}%</span>} />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ padding: '0 32px 40px' }}>
        <Tabs className="ctkh-tabs" defaultActiveKey="info" items={[

          /* TAB 1 */
          {
            key: 'info',
            label: <span><FileTextOutlined style={{ marginRight: 6 }} />Thông tin kế hoạch</span>,
            children: (
              <div>
                <SC title="Thông tin chung" icon={<FileTextOutlined />} subtitle="Thông tin cơ bản của kế hoạch đo">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 32px' }}>
                    <InfoField label="Mã kế hoạch" value={kh.id} mono />
                    <InfoField label="Tên kế hoạch đo" value={kh.tenKeHoach} />
                    <InfoField label="Ngày tạo" value={formatDate(kh.ngayBatDau)} />
                    <InfoField label="Người tạo" value="Nguyễn Văn Thắng" />
                    <InfoField label="Loại kế hoạch" value="KH đo sau bảo trì" />
                    <div>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 3 }}>
                        Mức ưu tiên
                      </Text>
                      <PriorityBadge priority="cao" />
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 3 }}>
                        Trạng thái
                      </Text>
                      <StatusBadge status={kh.trangThai} />
                    </div>
                    <InfoField label="Mô tả ngắn" value={kh.ghiChu || 'Không có mô tả'} />
                  </div>
                </SC>

                <SC title="Yêu cầu đo liên kết" icon={<AimOutlined />} subtitle="Yêu cầu đo làm căn cứ lập kế hoạch" noPad>
                  {linkedYC ? (
                    <>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 100px 100px 110px',
                        fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
                        letterSpacing: '0.4px', padding: '10px 24px',
                        background: '#f8f9fb', borderBottom: `1px solid ${token.divider}`,
                      }}>
                        <span>Mã YC</span><span>Đơn vị</span><span>Đối tượng đo</span>
                        <span>Mục đích</span><span>Ưu tiên</span><span>Hạn trả</span><span>Trạng thái</span>
                      </div>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 100px 100px 110px',
                        padding: '14px 24px', alignItems: 'center',
                      }}>
                        <Text style={{ color: colors.navy, fontWeight: 600, fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={() => navigate(`/yeu-cau/${linkedYC.id}`)}>
                          {linkedYC.id}
                        </Text>
                        <Text style={{ fontSize: 12 }}>{donViMap[linkedYC.donVi] || linkedYC.donVi}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 500 }}>{linkedYC.thietBi}</Text>
                        <Text style={{ fontSize: 12, color: '#6b7280' }}>{linkedYC.mucDich}</Text>
                        <PriorityBadge priority={linkedYC.uuTien} />
                        <Text style={{ fontSize: 12, fontWeight: 600, color: isLate ? '#ef4444' : '#374151' }}>{formatDate(linkedYC.ngayHen)}</Text>
                        <StatusBadge status={linkedYC.trangThai} />
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: 24, textAlign: 'center', color: token.mutedText }}>Không tìm thấy yêu cầu đo liên kết</div>
                  )}
                </SC>

                <SC title="Thời gian kế hoạch" icon={<ClockCircleOutlined />} subtitle="Thời gian dự kiến thực hiện và tiến độ tổng thể">
                  <Row gutter={32}>
                    <Col span={4}><InfoField label="Ngày bắt đầu" value={formatDate(kh.ngayBatDau)} /></Col>
                    <Col span={4}><InfoField label="Ngày kết thúc" value={formatDate(kh.ngayKetThuc)} /></Col>
                    <Col span={4}><InfoField label="Ca thực hiện" value="Cả ngày" /></Col>
                    <Col span={6}>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 6 }}>
                        Tiến độ tổng thể
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Progress percent={kh.tienDo} size="small" showInfo={false} strokeColor={progressColor} style={{ flex: 1, margin: 0 }} />
                        <Text style={{ fontSize: 14, fontWeight: 700, color: progressColor, fontFamily: 'monospace' }}>{kh.tienDo}%</Text>
                      </div>
                    </Col>
                    <Col span={6}>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 6 }}>
                        Tình trạng
                      </Text>
                      {isLate ? (
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Trễ tiến độ</span>
                      ) : isNear ? (
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#fffbeb', color: '#a16207', border: '1px solid #fde68a' }}>Sắp trễ</span>
                      ) : kh.tienDo >= 100 ? (
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>Hoàn thành</span>
                      ) : (
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>Đúng tiến độ</span>
                      )}
                    </Col>
                  </Row>
                </SC>
              </div>
            ),
          },

          /* TAB 2 */
          {
            key: 'lab',
            label: <span><TeamOutlined style={{ marginRight: 6 }} />Phòng lab & Nguồn lực</span>,
            children: (
              <div>
                <SC title="Phòng lab đã chọn" icon={<ExperimentOutlined />} subtitle="Phòng lab thực hiện kế hoạch đo">
                  {linkedLab ? (
                    <div style={{ padding: 20, borderRadius: 10, border: `1.5px solid ${colors.navy}`, background: '#f0f7ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <Text strong style={{ fontSize: 16, color: colors.navy }}>{linkedLab.ten}</Text>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', border: '1px solid #bbf7d0',
                        }}>
                          <ThunderboltOutlined style={{ fontSize: 11, color: '#16a34a' }} />
                          <Text style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#15803d' }}>98%</Text>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                        {['Đang hoạt động', 'Lĩnh vực phù hợp', 'Lịch trống'].map((r) => (
                          <span key={r} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#e0f2fe', color: '#0369a1', fontWeight: 500 }}>{r}</span>
                        ))}
                      </div>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16,
                        padding: '14px 16px', background: '#e8f0fe', borderRadius: 6,
                      }}>
                        {[
                          { label: 'Trưởng phòng', value: linkedLab.truongPhong },
                          { label: 'Địa điểm', value: linkedLab.viTri },
                          { label: 'Nhiệt độ', value: linkedLab.nhietDo },
                          { label: 'Độ ẩm', value: linkedLab.doAm },
                          { label: 'Trạng thái', value: '' },
                        ].map((item) => (
                          <div key={item.label}>
                            <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.label}</Text>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginTop: 2 }}>
                              {item.value || <StatusBadge status={linkedLab.trangThai} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Text style={{ color: token.mutedText }}>Chưa chọn phòng lab</Text>
                  )}
                </SC>

                <SC title="Nguồn lực thực hiện" icon={<SafetyCertificateOutlined />} subtitle="Chuẩn đo, thiết bị và ghi chú nguồn lực">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 32px' }}>
                    <InfoField label="Chuẩn đo sử dụng" value={kh.tenChuanDo} />
                    <InfoField label="Tiêu chuẩn áp dụng" value={kh.tieuChuan} />
                    <InfoField label="Ghi chú nguồn lực" value={kh.ghiChu || 'Không có ghi chú'} />
                  </div>
                  <div style={{ marginTop: 20, padding: '16px 20px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>Kiểm tra năng lực</Text>
                    <div style={{ display: 'flex', gap: 24 }}>
                      {[
                        { label: 'Phòng Lab hoạt động', ok: kh.labHoatDong },
                        { label: 'Chuẩn đo còn hạn', ok: kh.chuanConHan },
                        { label: 'Dải đo phù hợp', ok: kh.daiDoPhuhop },
                        { label: 'Thời gian kịp hẹn', ok: new Date(kh.ngayKetThuc) <= new Date(kh.ngayHenYC) },
                      ].map((c) => (
                        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: '50%',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: c.ok ? '#f0fdf4' : '#fef2f2',
                            color: c.ok ? '#16a34a' : '#dc2626', fontSize: 10,
                          }}>
                            {c.ok ? <CheckCircleOutlined /> : <span style={{ fontWeight: 700 }}>!</span>}
                          </span>
                          <Text style={{ fontSize: 12, color: c.ok ? '#374151' : '#dc2626', fontWeight: 500 }}>{c.label}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </SC>

                <SC title="Nhân sự tham gia" icon={<UserOutlined />} subtitle="Người phụ trách và nhân sự thực hiện">
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{
                      flex: 1, padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafafa',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.navy}, #3b82f6)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0,
                      }}>
                        {ktvInfo?.hoTen?.split(' ').pop()?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block' }}>{kh.tenKtv}</Text>
                        <Text style={{ fontSize: 11, color: token.mutedText }}>{ktvInfo?.chucVu || 'Kỹ thuật viên'}</Text>
                        <div style={{ marginTop: 4 }}>
                          <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#eff6ff', color: colors.navy }}>
                            Phụ trách chính
                          </span>
                        </div>
                      </div>
                    </div>
                    {danhSachNguoiDung.filter((nd) => nd.vaiTro === 'ktv' && nd.id !== kh.ktvPhuTrach).slice(0, 2).map((nd) => (
                      <div key={nd.id} style={{
                        flex: 1, padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafafa',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', background: '#e5e7eb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#6b7280', fontSize: 16, fontWeight: 700, flexShrink: 0,
                        }}>
                          {nd.hoTen.split(' ').pop()?.charAt(0)}
                        </div>
                        <div>
                          <Text style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block' }}>{nd.capBac} {nd.hoTen}</Text>
                          <Text style={{ fontSize: 11, color: token.mutedText }}>{nd.chucVu}</Text>
                          <div style={{ marginTop: 4 }}>
                            <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }}>Hỗ trợ</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SC>
              </div>
            ),
          },

          /* TAB 3 */
          {
            key: 'timeline',
            label: (
              <span>
                <ClockCircleOutlined style={{ marginRight: 6 }} />Timeline công việc
                <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, lineHeight: '16px', padding: '0 5px', borderRadius: 4 }}>{doneCV}/{totalCV}</Tag>
              </span>
            ),
            children: (
              <div>
                <div style={{ display: 'flex', gap: 16, marginBottom: token.sectionGap }}>
                  {[
                    { label: 'Tổng đầu mục', value: totalCV, color: '#374151', bg: '#f3f4f6' },
                    { label: 'Hoàn thành', value: doneCV, color: '#15803d', bg: '#f0fdf4' },
                    { label: 'Đang thực hiện', value: doingCV, color: '#a16207', bg: '#fffbeb' },
                    { label: 'Chưa bắt đầu', value: waitCV, color: '#6b7280', bg: '#f9fafb' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      flex: 1, padding: '14px 18px', borderRadius: 8,
                      background: s.bg, border: `1px solid ${token.divider}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</Text>
                      <Text style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.value}</Text>
                    </div>
                  ))}
                </div>

                <SC title="Danh sách công việc" icon={<ClockCircleOutlined />}
                  subtitle="Timeline và phân công kỹ thuật viên" noPad
                  extra={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="small" icon={<SyncOutlined />} style={{ borderRadius: 6, fontSize: 12 }}>Cập nhật timeline</Button>
                      <Button type="primary" ghost size="small" icon={<span style={{ fontSize: 12 }}>+</span>}
                        style={{ borderRadius: 6, fontWeight: 500, fontSize: 12 }}>Thêm đầu mục</Button>
                    </div>
                  }
                >
                  <div style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 180px 100px 110px 1fr',
                    gap: 8, padding: '10px 20px', fontSize: 10, fontWeight: 600, color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                    background: '#f8f9fb', borderBottom: `1px solid ${token.divider}`,
                  }}>
                    <span style={{ textAlign: 'center' }}>#</span>
                    <span>Đầu mục công việc</span><span>Ngày BĐ</span><span>Ngày KT</span>
                    <span>KTV phụ trách</span><span>Phù hợp</span><span>Trạng thái</span><span>Ghi chú</span>
                  </div>

                  {kh.congViec.sort((a, b) => a.thuTu - b.thuTu).map((cv, i) => {
                    const isDone = cv.trangThai === 'hoan_thanh';
                    const isDoing = cv.trangThai === 'dang_lam';
                    const statusBg = isDone ? '#f0fdf4' : isDoing ? '#fffbeb' : '#fff';
                    const barColor = GANTT_COLORS[i % GANTT_COLORS.length];
                    const bdDate = new Date(kh.ngayBatDau);
                    bdDate.setDate(bdDate.getDate() + i);
                    const ktDate = new Date(bdDate);
                    ktDate.setDate(ktDate.getDate() + 1);

                    return (
                      <div key={cv.id} className="timeline-row-detail" style={{
                        display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 180px 100px 110px 1fr',
                        gap: 8, padding: '12px 20px', alignItems: 'center',
                        borderBottom: i < totalCV - 1 ? '1px solid #f3f4f6' : 'none',
                        background: statusBg,
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 24, height: 24, borderRadius: '50%',
                            background: isDone ? '#10b981' : isDoing ? '#f59e0b' : '#eef2ff',
                            color: isDone || isDoing ? '#fff' : colors.navy,
                            fontSize: 11, fontWeight: 700,
                          }}>
                            {isDone ? <CheckCircleOutlined style={{ fontSize: 12 }} /> : cv.thuTu}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 4, height: 20, borderRadius: 2, background: barColor, flexShrink: 0 }} />
                          <Text style={{
                            fontSize: 13, fontWeight: 500,
                            color: isDone ? '#6b7280' : '#111827',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>{cv.ten}</Text>
                        </div>
                        <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{formatDate(bdDate.toISOString().slice(0, 10))}</Text>
                        <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{formatDate(ktDate.toISOString().slice(0, 10))}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 500 }}>{kh.tenKtv}</Text>
                        <span style={{
                          display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
                          fontSize: 11, fontWeight: 600, color: '#389e0d', background: '#f0fce8',
                        }}>Phù hợp cao</span>
                        <StatusBadge
                          status={isDone ? 'hoan_thanh' : isDoing ? 'dang_thuc_hien' : 'chua_bat_dau'}
                          label={isDone ? 'Hoàn thành' : isDoing ? 'Đang làm' : 'Chưa bắt đầu'}
                        />
                        <Text style={{ fontSize: 12, color: '#9ca3af' }}>—</Text>
                      </div>
                    );
                  })}
                </SC>

                {/* Gantt */}
                {(() => {
                  const cvSorted = [...kh.congViec].sort((a, b) => a.thuTu - b.thuTu);
                  const baseDate = new Date(kh.ngayBatDau).getTime();
                  const totalDays = Math.max(7, Math.ceil((new Date(kh.ngayKetThuc).getTime() - baseDate) / 864e5) + 2);
                  const dateCols: { label: string; date: string }[] = [];
                  for (let d = 0; d <= totalDays; d++) {
                    const dt = new Date(baseDate + d * 864e5);
                    dateCols.push({ label: `${dt.getDate()}/${dt.getMonth() + 1}`, date: dt.toISOString().slice(0, 10) });
                  }

                  return (
                    <SC title="Biểu đồ Gantt" icon={<BarChartOutlined />}
                      subtitle={`${cvSorted.length} đầu mục · ${dateCols[0]?.label} → ${dateCols[dateCols.length - 1]?.label}`}
                      noPad>
                      <div style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: Math.max(700, 220 + dateCols.length * 44) }}>
                          <div style={{
                            display: 'grid', gridTemplateColumns: `220px repeat(${dateCols.length}, 1fr)`,
                            borderBottom: `1px solid ${token.divider}`, background: '#f8f9fb',
                          }}>
                            <div style={{
                              padding: '10px 20px', fontSize: 10, fontWeight: 600, color: '#6b7280',
                              textTransform: 'uppercase', letterSpacing: '0.4px', borderRight: `1px solid ${token.divider}`,
                            }}>Đầu mục</div>
                            {dateCols.map((dc, ci) => {
                              const isWeekend = [0, 6].includes(new Date(dc.date).getDay());
                              return (
                                <div key={ci} style={{
                                  padding: '10px 2px', textAlign: 'center', fontSize: 10, fontWeight: 600,
                                  color: isWeekend ? '#ef4444' : '#6b7280',
                                  background: isWeekend ? '#fef2f2' : 'transparent',
                                  borderRight: ci < dateCols.length - 1 ? '1px solid #f3f4f6' : 'none',
                                }}>{dc.label}</div>
                              );
                            })}
                          </div>

                          {cvSorted.map((cv, i) => {
                            const startDay = i;
                            const endDay = Math.min(i + 1, totalDays);
                            const isDone = cv.trangThai === 'hoan_thanh';
                            const barColor = isDone ? '#10b981' : cv.trangThai === 'dang_lam' ? '#f59e0b' : GANTT_COLORS[i % GANTT_COLORS.length];

                            return (
                              <div key={cv.id} style={{
                                display: 'grid', gridTemplateColumns: `220px repeat(${dateCols.length}, 1fr)`,
                                borderBottom: i < cvSorted.length - 1 ? '1px solid #f3f4f6' : 'none',
                                alignItems: 'center', minHeight: 38,
                              }}>
                                <div style={{
                                  padding: '6px 12px 6px 20px', fontSize: 12, fontWeight: 500, color: '#374151',
                                  borderRight: `1px solid ${token.divider}`,
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                }}>
                                  <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: barColor }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={cv.ten}>{cv.ten}</span>
                                </div>
                                {dateCols.map((dc, ci) => {
                                  const isInRange = ci >= startDay && ci <= endDay;
                                  const isStart = ci === startDay;
                                  const isEnd = ci === endDay;
                                  const isWeekend = [0, 6].includes(new Date(dc.date).getDay());
                                  return (
                                    <div key={ci} style={{
                                      padding: '5px 1px', height: '100%', display: 'flex', alignItems: 'center',
                                      background: isWeekend && !isInRange ? '#fefafa' : 'transparent',
                                      borderRight: ci < dateCols.length - 1 ? '1px solid #f9fafb' : 'none',
                                    }}>
                                      {isInRange && (
                                        <div style={{
                                          height: 20, width: '100%', background: barColor, opacity: 0.85,
                                          borderRadius: isStart && isEnd ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0,
                                        }} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}

                          <div style={{
                            padding: '10px 20px', borderTop: `1px solid ${token.divider}`,
                            display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#9ca3af',
                          }}>
                            <span>Tổng: <strong style={{ color: '#374151' }}>{totalDays + 1} ngày</strong></span>
                            <span style={{ color: '#d1d5db' }}>·</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} /> Hoàn thành
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }} /> Đang làm
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6' }} /> Chưa bắt đầu
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 1, background: '#fecaca', border: '1px solid #fca5a5' }} /> Cuối tuần
                            </span>
                          </div>
                        </div>
                      </div>
                    </SC>
                  );
                })()}
              </div>
            ),
          },

          /* TAB 4 */
          {
            key: 'thamSo',
            label: (
              <span>
                <BarChartOutlined style={{ marginRight: 6 }} />Tham số kế thừa
                <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, lineHeight: '16px', padding: '0 5px', borderRadius: 4 }}>{thamSo.length}</Tag>
              </span>
            ),
            children: (
              <SC title={`Tham số đo kế thừa (${thamSo.length})`} icon={<BarChartOutlined />}
                subtitle="Tự động kế thừa từ yêu cầu đo liên kết" noPad>
                <div style={{
                  display: 'grid', gridTemplateColumns: '100px 1fr 80px 120px 110px 1fr',
                  gap: 8, padding: '10px 24px', fontSize: 10, fontWeight: 600, color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.4px',
                  background: '#f8f9fb', borderBottom: `1px solid ${token.divider}`,
                }}>
                  <span>Nguồn YC</span><span>Tên tham số</span><span>Đơn vị</span>
                  <span>Dải đo</span><span>Sai số CP</span><span>Ghi chú</span>
                </div>
                {thamSo.map((ts, i) => (
                  <div key={ts.key} style={{
                    display: 'grid', gridTemplateColumns: '100px 1fr 80px 120px 110px 1fr',
                    gap: 8, padding: '14px 24px', alignItems: 'center',
                    borderBottom: i < thamSo.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}>
                    <Text style={{ color: colors.navy, fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{ts.nguon}</Text>
                    <Text style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{ts.ten}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>{ts.donVi}</Text>
                    <Text style={{ fontFamily: 'monospace', color: '#374151', fontSize: 12 }}>{ts.daiDo}</Text>
                    <span style={{
                      display: 'inline-flex', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace',
                      background: '#fffbeb', color: '#a16207', fontWeight: 700, fontSize: 12, border: '1px solid #fde68a',
                    }}>{ts.saiSo}</span>
                    <Text style={{ color: ts.ghiChu ? '#6b7280' : '#d1d5db', fontSize: 12 }}>{ts.ghiChu || '—'}</Text>
                  </div>
                ))}
              </SC>
            ),
          },

          /* TAB 5 */
          {
            key: 'notes',
            label: <span><FileTextOutlined style={{ marginRight: 6 }} />Ghi chú</span>,
            children: (
              <SC title="Ghi chú và lưu ý thực hiện" icon={<FileTextOutlined />} subtitle="Thông tin bổ sung hỗ trợ quá trình thực hiện kế hoạch đo">
                <Row gutter={24}>
                  <Col span={12}>
                    <div style={{ marginBottom: 24 }}>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 8 }}>
                        Yêu cầu phối hợp
                      </Text>
                      <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6', minHeight: 80 }}>
                        <Text style={{ fontSize: 13, color: kh.ghiChu ? '#374151' : '#9ca3af', lineHeight: '20px' }}>
                          {kh.ghiChu || 'Chưa cập nhật'}
                        </Text>
                      </div>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 8 }}>
                        Rủi ro dự kiến
                      </Text>
                      <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6', minHeight: 80 }}>
                        <Text style={{ fontSize: 13, color: '#9ca3af' }}>Chưa cập nhật</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 24 }}>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 8 }}>
                        Lưu ý kỹ thuật
                      </Text>
                      <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6', minHeight: 80 }}>
                        <Text style={{ fontSize: 13, color: '#9ca3af' }}>Chưa cập nhật</Text>
                      </div>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: token.mutedText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 8 }}>
                        Ý kiến chỉ huy
                      </Text>
                      <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6', minHeight: 80 }}>
                        <Text style={{ fontSize: 13, color: '#9ca3af' }}>Chưa cập nhật</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </SC>
            ),
          },
        ]} />
      </div>
    </div>
  );
};

export default ChiTietKeHoach;
