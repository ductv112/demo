import React from 'react';

// ── Semantic color map ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  // Trạng thái YC
  moi_tao:       { bg: '#f0f0f0',   color: '#595959', dot: '#8c8c8c' },
  da_tiep_nhan:  { bg: '#e8f4fd',   color: '#1E6FD9', dot: '#1E6FD9' },
  dang_do:       { bg: '#e6f7ff',   color: '#0070cc', dot: '#0070cc' },
  cho_phe_duyet: { bg: '#fff7e6',   color: '#d48806', dot: '#faad14' },
  hoan_thanh:    { bg: '#f0fce8',   color: '#389e0d', dot: '#52c41a' },
  tu_choi:       { bg: '#fff1f0',   color: '#cf1322', dot: '#ff4d4f' },

  // Trạng thái TB
  con_han:       { bg: '#f0fce8',   color: '#389e0d', dot: '#52c41a' },
  sap_han:       { bg: '#fff7e6',   color: '#d48806', dot: '#faad14' },
  qua_han:       { bg: '#fff1f0',   color: '#cf1322', dot: '#ff4d4f' },
  bao_duong:     { bg: '#f3e8ff',   color: '#6b21a8', dot: '#7c3aed' },
  hong:          { bg: '#f0f0f0',   color: '#595959', dot: '#8c8c8c' },

  // Trạng thái Chuẩn
  hoat_dong:     { bg: '#f0fce8',   color: '#389e0d', dot: '#52c41a' },
  het_han:       { bg: '#fff1f0',   color: '#cf1322', dot: '#ff4d4f' },

  // Trạng thái Lab
  bao_tri:       { bg: '#f3e8ff',   color: '#6b21a8', dot: '#7c3aed' },
  tam_dung:      { bg: '#f0f0f0',   color: '#595959', dot: '#8c8c8c' },

  // Trạng thái Tiêu chuẩn
  hieu_luc:      { bg: '#f0fce8',   color: '#389e0d', dot: '#52c41a' },
  het_hieu_luc:  { bg: '#f0f0f0',   color: '#595959', dot: '#8c8c8c' },
  thay_the:      { bg: '#fff7e6',   color: '#d48806', dot: '#faad14' },

  // Trạng thái Kế hoạch đo
  chua_lap:        { bg: '#f0f0f0',   color: '#595959', dot: '#8c8c8c' },
  da_lap:          { bg: '#e8f4fd',   color: '#1E6FD9', dot: '#1E6FD9' },
  da_duyet:        { bg: '#e6f7ff',   color: '#0070cc', dot: '#0070cc' },
  dang_thuc_hien:  { bg: '#fff7e6',   color: '#d48806', dot: '#faad14' },
  tre_han:         { bg: '#fff1f0',   color: '#cf1322', dot: '#ff4d4f' },

  // Trạng thái YC bổ sung
  da_lap_kh:       { bg: '#e6f7ff',   color: '#0070cc', dot: '#0070cc' },

  // Trạng thái Thực hiện đo
  chua_bat_dau:    { bg: '#f0f0f0',   color: '#595959', dot: '#8c8c8c' },

  // Kết luận đo
  dat:             { bg: '#f0fce8',   color: '#389e0d', dot: '#52c41a' },
  khong_dat:       { bg: '#fff1f0',   color: '#cf1322', dot: '#ff4d4f' },
  can_kiem_tra:    { bg: '#fff7e6',   color: '#d48806', dot: '#faad14' },
};

const PRIORITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  khan_cap:   { bg: '#fff1f0', color: '#cf1322', border: '#ffa39e' },
  cao:        { bg: '#fff7e6', color: '#d48806', border: '#ffd591' },
  trung_binh: { bg: '#e8f4fd', color: '#1E6FD9', border: '#91caff' },
  thap:       { bg: '#f0f0f0', color: '#595959', border: '#d9d9d9' },
};

// ── Config maps (label only) ────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  moi_tao: 'Mới tạo',
  da_tiep_nhan: 'Đã tiếp nhận',
  dang_do: 'Đang đo',
  cho_phe_duyet: 'Chờ phê duyệt',
  hoan_thanh: 'Hoàn thành',
  tu_choi: 'Từ chối',
  con_han: 'Còn hạn',
  sap_han: 'Sắp hạn',
  qua_han: 'Quá hạn',
  bao_duong: 'Bảo dưỡng',
  hong: 'Hỏng',
  hoat_dong: 'Hoạt động',
  het_han: 'Hết hạn',
  bao_tri: 'Bảo trì',
  tam_dung: 'Tạm dừng',
  hieu_luc: 'Hiệu lực',
  het_hieu_luc: 'Hết hiệu lực',
  thay_the: 'Thay thế',
  dat: 'ĐẠT',
  khong_dat: 'KHÔNG ĐẠT',
  can_kiem_tra: 'Cần kiểm tra',
  // Kế hoạch đo
  chua_lap: 'Chưa lập',
  da_lap: 'Đã lập',
  da_duyet: 'Đã duyệt',
  dang_thuc_hien: 'Đang thực hiện',
  tre_han: 'Trễ hạn',
  // YC bổ sung
  da_lap_kh: 'Đã lập KH',
  // Thực hiện đo
  chua_bat_dau: 'Chưa bắt đầu',
};

const PRIORITY_LABELS: Record<string, string> = {
  khan_cap: 'Khẩn cấp',
  cao: 'Cao',
  trung_binh: 'Trung bình',
  thap: 'Thấp',
};

// ── Status Badge (with dot indicator) ───────────────────────────────────────
interface StatusBadgeProps {
  status: string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.moi_tao;
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px 3px 8px',
        borderRadius: 6,
        background: style.bg,
        color: style.color,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.dot,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
};

// ── Priority Badge (outlined style) ─────────────────────────────────────────
interface PriorityBadgeProps {
  priority: string;
  label?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, label }) => {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.trung_binh;
  const displayLabel = label || PRIORITY_LABELS[priority] || priority;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 4,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}
    >
      {displayLabel}
    </span>
  );
};
