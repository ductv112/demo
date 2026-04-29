// ─── Đơn vị ──────────────────────────────────────────────────────────────────

export interface DonVi {
  id: string;
  ten: string;
  vietTat: string;
  loai: 'leadership' | 'admin' | 'technical';
  soThietBi: number;
  quaHan: number;
  truongDonVi: string;
}

// ─── Thiết bị đo (TMDE) ─────────────────────────────────────────────────────

export type TrangThaiTB = 'con_han' | 'sap_han' | 'qua_han' | 'bao_duong' | 'hong';

export interface HangMucDo {
  id: string;
  tenHangMuc: string;     // VD: "Điện áp DC", "Tần số phát"
  daiDo: string;          // VD: "0 ~ 1000 V"
  doCx: string;           // Độ chính xác / Sai số cho phép, VD: "±0.05%"
  donViDo: string;        // VD: "V", "Hz", "°C", "bar"
  tieuChuanAD: string;    // Tiêu chuẩn áp dụng, VD: "ĐLVN 154:2022"
}

export interface ThietBi {
  id: string;
  ten: string;
  maSerial: string;
  donVi: string;
  linhVuc: string;
  daiDo: string;
  hanHieuChuan: string;
  chuKy: number;          // tháng
  lanHieuChuanCuoi: string;
  trangThai: TrangThaiTB;
  viTri: string;
  ghiChu: string;
  phongLab?: string;
  khaNangDo?: HangMucDo[];
}

// ─── Yêu cầu đo lường (MRM) ─────────────────────────────────────────────────

export type TrangThaiYC = 'moi_tao' | 'da_tiep_nhan' | 'da_lap_kh' | 'dang_do' | 'cho_phe_duyet' | 'hoan_thanh' | 'tu_choi';
export type MucDoUuTien = 'khan_cap' | 'cao' | 'trung_binh' | 'thap';

export interface YeuCau {
  id: string;
  donVi: string;
  thietBi: string;
  maThietBi: string;
  mucDich: string;
  uuTien: MucDoUuTien;
  ngayGui: string;
  ngayHen: string;
  trangThai: TrangThaiYC;
  nguoiGui: string;
  phongLab: string;
  ghiChu: string;
}

// ─── Chuẩn đo lường (MS) ────────────────────────────────────────────────────

export type CapChuan = 'Quốc gia' | 'Tổng công ty' | 'Làm việc';
export type TrangThaiChuan = 'hoat_dong' | 'bao_duong' | 'het_han';

export interface ChuanDoLuong {
  id: string;
  ten: string;
  model: string;
  cap: CapChuan;
  linhVuc: string;
  daiDo: string;
  doKhongDamBao: string;
  hanHieuChuan: string;
  trangThai: TrangThaiChuan;
  nguonGoc: string;
  moTa: string;
}

// ─── Phòng thí nghiệm (Lab) ─────────────────────────────────────────────────

export type TrangThaiLab = 'hoat_dong' | 'bao_tri' | 'tam_dung';

export interface PhongLab {
  id: string;
  ten: string;
  viTri: string;
  donVi: string;
  vungMien: 'bac' | 'trung' | 'nam';
  toaDo: { lat: number; lng: number };
  truongPhong: string;
  nhietDo: string;
  doAm: string;
  rungDong: string;
  capDo: string;
  soThietBi: number;
  trangThai: TrangThaiLab;
}

// ─── Kết quả đo ─────────────────────────────────────────────────────────────

export type KetLuan = 'dat' | 'khong_dat';
export type TrangThaiDG = 'cho_danh_gia' | 'da_danh_gia' | 'da_cap_cc';

export interface KetQuaDo {
  id: string;
  maYeuCau: string;
  thietBi: string;
  kyThuatVien: string;
  ngayDo: string;
  giaTriChuan: string;
  giaTriDo: string;
  saiSo: string;
  doKhongDamBao: string;
  ketLuan: KetLuan;
  trangThaiDG: TrangThaiDG;
  maChungChi: string;
  phongLab: string;
}

// ─── Tiêu chuẩn & Quy trình ─────────────────────────────────────────────────

export type LoaiTieuChuan = 'ĐLVN' | 'TCVN' | 'QCVN' | 'ISO' | 'Lệnh KT';
export type TrangThaiTC = 'hieu_luc' | 'het_hieu_luc' | 'thay_the';

export interface TieuChuan {
  id: string;
  ma: string;
  ten: string;
  loai: LoaiTieuChuan;
  namBanHanh: number;
  linhVuc: string;
  trangThai: TrangThaiTC;
  moTa: string;
}

// ─── Kế hoạch đo ─────────────────────────────────────────────────────────────

export type TrangThaiKH = 'chua_lap' | 'da_lap' | 'da_duyet' | 'dang_thuc_hien' | 'hoan_thanh' | 'tre_han';

export interface CongViecKH {
  id: string;
  ten: string;
  trangThai: 'chua_lam' | 'dang_lam' | 'hoan_thanh';
  thuTu: number;
}

export interface KeHoachDo {
  id: string;
  tenKeHoach: string;
  maYeuCau: string;
  thietBiCanDo: string;
  maThietBiCanDo: string;
  donVi: string;
  phongLab: string;
  chuanDo: string;          // mã chuẩn đo sử dụng
  tenChuanDo: string;
  ktvPhuTrach: string;
  tenKtv: string;
  tieuChuan: string;        // ĐLVN, ISO...
  ngayBatDau: string;
  ngayKetThuc: string;
  ngayHenYC: string;        // từ YC gốc
  trangThai: TrangThaiKH;
  tienDo: number;           // 0-100
  congViec: CongViecKH[];
  ghiChu: string;
  // Năng lực check
  labHoatDong: boolean;
  chuanConHan: boolean;
  daiDoPhuhop: boolean;
}

// ─── Thực hiện đo ────────────────────────────────────────────────────────────

export type TrangThaiTHD = 'chua_bat_dau' | 'dang_do' | 'hoan_thanh';

export interface DiemDo {
  id: string;
  diemDo: string;
  giaTriChuan: string;
  giaTriDo: string;
  saiSo: string;
  doKhongDamBao: string;
  nhanXet: 'dat' | 'khong_dat';
}

export interface ThucHienDo {
  id: string;
  maKeHoach: string;
  maYeuCau: string;
  ktvThucHien: string;
  tenKtv: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: TrangThaiTHD;
  dieuKienMoiTruong: string;
  diemDo: DiemDo[];
  ghiChu: string;
}

// ─── Cảnh báo ────────────────────────────────────────────────────────────────

export type LoaiCanhBao = 'qua_han' | 'sap_han' | 'bat_thuong' | 'moi_truong' | 'he_thong';
export type MucDoCanhBao = 'critical' | 'warning' | 'info';

export interface CanhBao {
  id: string;
  loai: LoaiCanhBao;
  mucDo: MucDoCanhBao;
  tieuDe: string;
  moTa: string;
  donVi: string;
  ngayTao: string;
  daDoc: boolean;
}

// ─── Người dùng ──────────────────────────────────────────────────────────────

export type VaiTro = 'admin' | 'manager' | 'ktv' | 'viewer' | 'sysadmin';

export interface NguoiDung {
  id: string;
  ma: string;
  hoTen: string;
  capBac: string;
  chucVu: string;
  vaiTro: VaiTro;
  email: string;
  dangNhapCuoi: string;
  trangThai: 'active' | 'inactive';
}
