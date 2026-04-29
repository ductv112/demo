import type {
  TrangThaiTB, TrangThaiYC, MucDoUuTien, TrangThaiChuan,
  TrangThaiLab, KetLuan, LoaiTieuChuan, TrangThaiTC,
  MucDoCanhBao, VaiTro, TrangThaiKH, TrangThaiTHD,
} from '../types';

// ─── Date ──────────────────────────────────────────────────────────────────────

export const formatDate = (date: string): string => {
  if (!date) return '—';
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

// ─── Status configs ───────────────────────────────────────────────────────────

export const trangThaiTBConfig: Record<TrangThaiTB, { label: string; color: string }> = {
  con_han:    { label: 'Còn hạn',    color: 'green'   },
  sap_han:    { label: 'Sắp hạn',    color: 'orange'  },
  qua_han:    { label: 'Quá hạn',    color: 'red'     },
  bao_duong:  { label: 'Bảo dưỡng',  color: 'purple'  },
  hong:       { label: 'Hỏng',       color: 'default' },
};

export const trangThaiYCConfig: Record<TrangThaiYC, { label: string; color: string }> = {
  moi_tao:        { label: 'Mới tạo',        color: 'default'    },
  da_tiep_nhan:   { label: 'Đã tiếp nhận',   color: 'blue'       },
  da_lap_kh:      { label: 'Đã lập KH',      color: 'cyan'       },
  dang_do:        { label: 'Đang đo',        color: 'processing' },
  cho_phe_duyet:  { label: 'Chờ phê duyệt',  color: 'orange'     },
  hoan_thanh:     { label: 'Hoàn thành',     color: 'green'      },
  tu_choi:        { label: 'Từ chối',        color: 'red'        },
};

export const uuTienConfig: Record<MucDoUuTien, { label: string; color: string }> = {
  khan_cap:    { label: 'Khẩn cấp',    color: 'red'     },
  cao:         { label: 'Cao',          color: 'orange'  },
  trung_binh:  { label: 'Trung bình',   color: 'blue'    },
  thap:        { label: 'Thấp',        color: 'default' },
};

export const trangThaiChuanConfig: Record<TrangThaiChuan, { label: string; color: string }> = {
  hoat_dong:  { label: 'Hoạt động', color: 'green'  },
  bao_duong:  { label: 'Bảo dưỡng', color: 'purple' },
  het_han:    { label: 'Hết hạn',   color: 'red'    },
};

export const trangThaiLabConfig: Record<TrangThaiLab, { label: string; color: string }> = {
  hoat_dong: { label: 'Hoạt động', color: 'green'   },
  bao_tri:   { label: 'Bảo trì',   color: 'purple'  },
  tam_dung:  { label: 'Tạm dừng',  color: 'default' },
};

export const ketLuanConfig: Record<KetLuan, { label: string; color: string }> = {
  dat:       { label: 'ĐẠT',       color: 'green' },
  khong_dat: { label: 'KHÔNG ĐẠT', color: 'red'   },
};

export const loaiTieuChuanConfig: Record<LoaiTieuChuan, { label: string; color: string }> = {
  'ĐLVN':    { label: 'ĐLVN',    color: 'blue'    },
  'TCVN':    { label: 'TCVN',    color: 'green'   },
  'QCVN':    { label: 'QCVN',    color: 'red'     },
  'ISO':     { label: 'ISO',     color: 'purple'  },
  'Lệnh KT': { label: 'Lệnh KT', color: 'volcano' },
};

export const trangThaiTCConfig: Record<TrangThaiTC, { label: string; color: string }> = {
  hieu_luc:      { label: 'Hiệu lực',     color: 'green'   },
  het_hieu_luc:  { label: 'Hết hiệu lực', color: 'default' },
  thay_the:      { label: 'Thay thế',     color: 'orange'  },
};

export const trangThaiKHConfig: Record<TrangThaiKH, { label: string; color: string }> = {
  chua_lap:        { label: 'Chưa lập',        color: 'default'    },
  da_lap:          { label: 'Đã lập',          color: 'blue'       },
  da_duyet:        { label: 'Đã duyệt',        color: 'cyan'       },
  dang_thuc_hien:  { label: 'Đang thực hiện',  color: 'processing' },
  hoan_thanh:      { label: 'Hoàn thành',      color: 'green'      },
  tre_han:         { label: 'Trễ hạn',         color: 'red'        },
};

export const trangThaiTHDConfig: Record<TrangThaiTHD, { label: string; color: string }> = {
  chua_bat_dau:  { label: 'Chưa bắt đầu',  color: 'default'    },
  dang_do:       { label: 'Đang đo',        color: 'processing' },
  hoan_thanh:    { label: 'Hoàn thành',     color: 'green'      },
};

export const mucDoCanhBaoConfig: Record<MucDoCanhBao, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Nghiêm trọng', color: 'red',    bg: '#fff2f0', border: '#ff4d4f' },
  warning:  { label: 'Cảnh báo',     color: 'orange', bg: '#fff7e6', border: '#faad14' },
  info:     { label: 'Thông tin',     color: 'blue',   bg: '#e8f0fe', border: '#1890ff' },
};

export const vaiTroConfig: Record<VaiTro, { label: string; color: string }> = {
  sysadmin: { label: 'Admin hệ thống', color: 'red'     },
  admin:    { label: 'Quản trị',       color: 'volcano' },
  manager:  { label: 'Quản lý',        color: 'blue'    },
  ktv:      { label: 'KTV',            color: 'green'   },
  viewer:   { label: 'Lãnh đạo (xem)', color: 'purple'  },
};
