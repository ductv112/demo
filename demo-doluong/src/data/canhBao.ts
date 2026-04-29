import type { CanhBao } from '../types';

const canhBao: CanhBao[] = [
  { id: 'CB-001', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-003 Druck PACE5000 quá hạn hiệu chuẩn',           moTa: 'Thiết bị hiệu chuẩn áp suất Druck PACE5000 (TT.Cloud) đã quá hạn từ 20/01/2026.',       donVi: 'TT.Cloud', ngayTao: '2026-03-15', daDoc: false },
  { id: 'CB-002', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-010 Megger MIT1025 quá hạn hiệu chuẩn',            moTa: 'Máy đo điện trở cách điện Megger MIT1025 (TT.Gamma) quá hạn từ 01/12/2025.',             donVi: 'TT.Gamma', ngayTao: '2026-03-10', daDoc: false },
  { id: 'CB-003', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'TB-002 Tektronix MSO46 sắp hết hạn hiệu chuẩn',      moTa: 'Máy hiện sóng Tektronix MSO46 (TT.Alpha) hết hạn ngày 10/04/2026.',                      donVi: 'TT.Alpha', ngayTao: '2026-03-18', daDoc: false },
  { id: 'CB-004', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'TB-008 Endress+Hauser F300 sắp hết hạn',              moTa: 'Lưu lượng kế Endress+Hauser Promass F300 (TT.Cloud) hết hạn ngày 28/03/2026.',           donVi: 'TT.Cloud', ngayTao: '2026-03-20', daDoc: false },
  { id: 'CB-005', loai: 'bat_thuong', mucDo: 'warning',  tieuDe: 'Kết quả đo TB-010 sai số vượt ngưỡng cho phép',       moTa: 'Kết quả hiệu chuẩn Megger MIT1025 sai số tại thang 10kV vượt 15% giới hạn.',             donVi: 'TT.Gamma', ngayTao: '2026-03-12', daDoc: true },
  { id: 'CB-006', loai: 'moi_truong', mucDo: 'info',     tieuDe: 'Nhiệt độ phòng LAB-03 vượt ngưỡng cho phép',          moTa: 'Phòng Lab Tín hiệu - Truyền dẫn ghi nhận nhiệt độ 26.8°C lúc 14:30 ngày 22/03/2026.',    donVi: 'P.QA', ngayTao: '2026-03-22', daDoc: false },
  { id: 'CB-007', loai: 'he_thong',   mucDo: 'info',     tieuDe: 'Sao lưu dữ liệu hệ thống hoàn tất',                   moTa: 'Hệ thống đã tự động sao lưu dữ liệu đo lường lúc 02:00 ngày 23/03/2026.',               donVi: 'Hệ thống', ngayTao: '2026-03-23', daDoc: true },
  { id: 'CB-008', loai: 'qua_han',    mucDo: 'critical', tieuDe: 'TB-014 Bird 5012D hỏng – chưa có phương án thay thế', moTa: 'Máy đo công suất tín hiệu Bird 5012D (TT.Alpha) bị hỏng sensor, cần gửi bảo trì.',       donVi: 'TT.Alpha', ngayTao: '2026-03-08', daDoc: false },
  { id: 'CB-009', loai: 'sap_han',    mucDo: 'warning',  tieuDe: 'Tiêu chuẩn ĐLVN 02:2018 sắp hết hiệu lực',           moTa: 'Tiêu chuẩn kiểm định áp kế lò xo ĐLVN 02:2018 sắp hết hiệu lực.',                      donVi: 'P.QA', ngayTao: '2026-03-19', daDoc: true },
  { id: 'CB-010', loai: 'he_thong',   mucDo: 'info',     tieuDe: 'Cập nhật phần mềm quản lý phiên bản 2.1.0',           moTa: 'Hệ thống đã cập nhật phiên bản 2.1.0 với tính năng quản lý tiêu chuẩn mới.',            donVi: 'Hệ thống', ngayTao: '2026-03-21', daDoc: true },
];

export default canhBao;
