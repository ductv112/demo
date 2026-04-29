import { useState } from 'react';
import {
  Card, List, Typography, Button, Select, Space, Empty,
} from 'antd';
import {
  AlertOutlined, CheckCircleOutlined, BellOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, FireOutlined,
  OrderedListOutlined, EyeInvisibleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';
import { formatDate, mucDoCanhBaoConfig } from '../../utils/format';
import { PageHeader, SummaryCard, StatusBadge } from '../../components';
import type { SummaryCardItem } from '../../components';
import type { CanhBao, LoaiCanhBao, MucDoCanhBao } from '../../types';

const { Text } = Typography;

const loaiCanhBaoLabels: Record<LoaiCanhBao, { label: string; icon: React.ReactNode }> = {
  qua_han:     { label: 'Quá hạn hiệu chuẩn',  icon: <ExclamationCircleOutlined /> },
  sap_han:     { label: 'Sắp hết hạn',          icon: <BellOutlined /> },
  bat_thuong:  { label: 'Kết quả bất thường',   icon: <AlertOutlined /> },
  moi_truong:  { label: 'Môi trường phòng lab',  icon: <InfoCircleOutlined /> },
  he_thong:    { label: 'Hệ thống',             icon: <AlertOutlined /> },
};

const initAlerts: CanhBao[] = [
  { id: 'CB-001', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-003 Druck PACE5000 quá hạn hiệu chuẩn',           moTa: 'Thiết bị hiệu chuẩn áp suất Druck PACE5000 (TT.Cloud 367) đã quá hạn từ 20/01/2026. Cần gửi hiệu chuẩn ngay để phục vụ vận hành.', donVi: 'TT.Cloud 367', ngayTao: '2026-03-15', daDoc: false },
  { id: 'CB-002', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-010 Megger MIT1025 quá hạn hiệu chuẩn',            moTa: 'Máy đo điện trở cách điện Megger MIT1025 (TT Monitoring 291) quá hạn từ 01/12/2025. Đã thông báo đơn vị nhưng chưa xử lý.',         donVi: 'TT Monitoring 291', ngayTao: '2026-03-10', daDoc: false },
  { id: 'CB-003', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'TB-002 Tektronix MSO46 sắp hết hạn hiệu chuẩn',      moTa: 'Máy hiện sóng Tektronix MSO46 (TT Phần mềm 921) hết hạn ngày 10/04/2026. Còn 18 ngày – cần lên kế hoạch hiệu chuẩn.',               donVi: 'TT Phần mềm 921', ngayTao: '2026-03-18', daDoc: false },
  { id: 'CB-004', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'TB-008 Endress+Hauser F300 sắp hết hạn',              moTa: 'Lưu lượng kế Endress+Hauser Promass F300 (TT Phần mềm 935) hết hạn ngày 28/03/2026. Còn 5 ngày!',                                    donVi: 'TT Phần mềm 935', ngayTao: '2026-03-20', daDoc: false },
  { id: 'CB-005', loai: 'bat_thuong', mucDo: 'warning',  tieuDe: 'Kết quả đo TB-010 sai số vượt ngưỡng cho phép',       moTa: 'Kết quả hiệu chuẩn ban đầu Megger MIT1025 cho thấy sai số tại thang 10kV vượt 15% giới hạn cho phép.',                         donVi: 'TT Monitoring 291', ngayTao: '2026-03-12', daDoc: true },
  { id: 'CB-006', loai: 'moi_truong', mucDo: 'info',     tieuDe: 'Nhiệt độ phòng LAB-03 vượt ngưỡng cho phép',          moTa: 'Phòng Lab Tín hiệu - Truyền dẫn ghi nhận nhiệt độ 26.8°C (ngưỡng 20±2°C) lúc 14:30 ngày 22/03/2026.',                                donVi: 'Ban Đo lường', ngayTao: '2026-03-22', daDoc: false },
  { id: 'CB-007', loai: 'he_thong',   mucDo: 'info',     tieuDe: 'Sao lưu dữ liệu hệ thống hoàn tất',                   moTa: 'Hệ thống đã tự động sao lưu dữ liệu đo lường lúc 02:00 ngày 23/03/2026. Tổng dung lượng: 2.4 GB.',                            donVi: 'Hệ thống', ngayTao: '2026-03-23', daDoc: true },
  { id: 'CB-008', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-014 Bird 5012D hỏng – chưa có phương án thay thế',  moTa: 'Máy đo công suất tín hiệu Bird 5012D (TT Phần mềm 921) bị hỏng sensor. Chờ linh kiện thay thế, ảnh hưởng đến kiểm tra hệ thống monitoring.', donVi: 'TT Phần mềm 921', ngayTao: '2026-03-08', daDoc: false },
  { id: 'CB-009', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'Tiêu chuẩn ĐLVN 02:2018 sắp hết hiệu lực',           moTa: 'Tiêu chuẩn kiểm định áp kế lò xo ĐLVN 02:2018 sắp hết hiệu lực. Cần cập nhật phiên bản mới.',                                 donVi: 'Ban Đo lường', ngayTao: '2026-03-19', daDoc: true },
  { id: 'CB-010', loai: 'he_thong',   mucDo: 'info',     tieuDe: 'Cập nhật phần mềm quản lý phiên bản 2.1.0',           moTa: 'Hệ thống đã cập nhật phiên bản 2.1.0 với tính năng quản lý tiêu chuẩn mới.',                                                    donVi: 'Hệ thống', ngayTao: '2026-03-21', daDoc: true },
];

// Severity badge mapping for StatusBadge
const SEVERITY_STATUS: Record<MucDoCanhBao, string> = {
  critical: 'qua_han',
  warning: 'sap_han',
  info: 'moi_tao',
};

export default function GiamSat() {
  const [localAlerts, setLocalAlerts] = useState<CanhBao[]>(initAlerts);
  const [severityFilter, setSeverityFilter] = useState<MucDoCanhBao | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = localAlerts.filter((a) => !a.daDoc).length;
  const criticalCount = localAlerts.filter((a) => a.mucDo === 'critical').length;
  const warningCount = localAlerts.filter((a) => a.mucDo === 'warning').length;
  const infoCount = localAlerts.filter((a) => a.mucDo === 'info').length;

  const filtered = localAlerts.filter((a) => {
    const matchSeverity = severityFilter === 'all' || a.mucDo === severityFilter;
    const matchUnread = !showUnreadOnly || !a.daDoc;
    return matchSeverity && matchUnread;
  });

  const markAsRead = (id: string) => {
    setLocalAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, daDoc: true } : a)));
  };

  const markAllRead = () => {
    setLocalAlerts((prev) => prev.map((a) => ({ ...a, daDoc: true })));
  };

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Tổng cảnh báo', value: localAlerts.length, icon: <OrderedListOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'unread', label: 'Chưa đọc', value: unreadCount, icon: <EyeInvisibleOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'critical', label: 'Nghiêm trọng', value: criticalCount, icon: <FireOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'warning', label: 'Cảnh báo', value: warningCount, icon: <WarningOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'info', label: 'Thông tin', value: infoCount, icon: <InfoCircleOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <PageHeader
          icon={<FireOutlined />}
          title="Giám sát & Cảnh báo"
          subtitle="Theo dõi tình trạng thiết bị, phòng lab và cảnh báo hệ thống – Doanh nghiệp A"
        />
        {unreadCount > 0 && (
          <Button icon={<CheckCircleOutlined />} onClick={markAllRead} style={{ flexShrink: 0 }}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          marginBottom: 16, flexWrap: 'wrap',
        }}
      >
        <Select
          style={{ width: 180 }}
          value={severityFilter}
          onChange={(v) => setSeverityFilter(v)}
          options={[
            { value: 'all', label: 'Tất cả mức độ' },
            { value: 'critical', label: 'Nghiêm trọng' },
            { value: 'warning', label: 'Cảnh báo' },
            { value: 'info', label: 'Thông tin' },
          ]}
        />
        <Button
          type={showUnreadOnly ? 'primary' : 'default'}
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          size="middle"
        >
          {showUnreadOnly ? 'Hiện tất cả' : 'Chỉ chưa đọc'}
        </Button>
        <div style={{ flex: 1 }} />
        <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{filtered.length}</span>
          {' / '}{localAlerts.length} cảnh báo
        </Text>
      </div>

      {/* Alert feed */}
      <Card
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: 0 } }}
      >
        {filtered.length === 0 ? (
          <Empty description="Không có cảnh báo nào" style={{ padding: 40 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={filtered}
            renderItem={(alert: CanhBao) => {
              const sevCfg = mucDoCanhBaoConfig[alert.mucDo];
              return (
                <List.Item
                  style={{
                    padding: '16px 20px',
                    background: alert.daDoc ? '#fff' : sevCfg.bg,
                    borderLeft: `4px solid ${alert.daDoc ? '#e8e8e8' : sevCfg.border}`,
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.2s',
                  }}
                  actions={[
                    !alert.daDoc ? (
                      <Button key="read" type="text" size="small" icon={<CheckCircleOutlined />}
                        style={{ color: colors.navy, fontSize: 12 }}
                        onClick={() => markAsRead(alert.id)}
                      >
                        Đã đọc
                      </Button>
                    ) : null,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ paddingTop: 4 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: alert.daDoc ? '#d9d9d9' : sevCfg.border,
                          boxShadow: !alert.daDoc ? `0 0 0 3px ${sevCfg.bg}` : 'none',
                        }} />
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <StatusBadge status={SEVERITY_STATUS[alert.mucDo]} label={sevCfg.label} />
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 4, fontSize: 11,
                          color: '#8c8c8c', border: '1px solid #d9d9d9', background: '#fafafa',
                        }}>
                          {loaiCanhBaoLabels[alert.loai].icon}
                          {loaiCanhBaoLabels[alert.loai].label}
                        </span>
                        <Text style={{
                          fontWeight: alert.daDoc ? 400 : 600, fontSize: 14,
                          color: alert.daDoc ? '#8c8c8c' : '#1a1a2e',
                        }}>
                          {alert.tieuDe}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ fontSize: 13, color: '#8c8c8c', display: 'block', marginBottom: 6, lineHeight: 1.5 }}>
                          {alert.moTa}
                        </Text>
                        <Space size={16} wrap>
                          {alert.donVi && (
                            <Text style={{ fontSize: 12, color: colors.navy }}>
                              Đơn vị: <strong>{alert.donVi}</strong>
                            </Text>
                          )}
                          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{formatDate(alert.ngayTao)}</Text>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
