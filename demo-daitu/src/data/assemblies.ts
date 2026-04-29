import type { AssemblyRecord } from '../types';

export const assemblies: AssemblyRecord[] = [
  // ─── WO-001: P-37 — Hoàn thành, sẵn sàng thử nghiệm ────────────────────────
  {
    id: 'ASM-001',
    orderId: 'WO-001',
    equipmentName: 'Hệ thống monitoring P-37',
    workshopName: 'PX1 - Trung tâm Hệ thống monitoring',
    startDate: '2025-12-11',
    endDate: '2025-12-18',
    performedBy: 'Nhóm lắp ráp PX1 — KTV Nguyễn Thanh Sơn (trưởng nhóm), KTV Phạm Văn Bình, KTV Lê Thị Hoa',
    status: 'completed',
    // Bước 1
    componentCount: 18,
    checklistNotes: 'Đủ 18/18 cụm cấu phần; dụng cụ chuyên dụng đầy đủ (cờ-lê lực, đồng hồ đo khe hở, thiết bị căn chỉnh laser); khu vực lắp ráp đã kiểm tra sạch sẽ và đủ điều kiện nhiệt độ, độ ẩm',
    // Bước 2
    torqueRecords: 'Bu lông anten M16: 85 N·m (TT: 80–90); Bu lông mặt bích M12: 55 N·m (TT: 50–60); Bu lông nắp hộp số M8: 25 N·m (TT: 22–28); Bu lông đế máy M20: 150 N·m (TT: 140–160)',
    clearanceRecords: 'Khe hở vòng bi trục chính: 0.012mm (TT: 0.005–0.020mm) ✓; Khe hở bánh răng cấp 1: 0.08mm (TT: 0.06–0.10mm) ✓; Độ đồng tâm trục: 0.005mm (TT: ≤0.010mm) ✓',
    // Bước 3
    calibrationParams: 'Tốc độ quay anten: 6.0 rpm (TT: 6±0.1) ✓; Công suất truyền nhận: 98 kW (TT: ≥95 kW) ✓; Góc ngẩng: 0°–90° liên tục ✓; Thời gian khởi động: 3.2 phút (TT: ≤4 phút) ✓; Điện trở cách điện: 50 MΩ (TT: ≥20 MΩ) ✓',
    // Bước 4
    configSnapshot: 'Cấu hình lắp: Anten + Bộ truyền động + Hộp số 2 cấp + Motor servo; Keo chống ẩm Loctite 243 tại 6 vị trí mặt bích; Mỡ Aeroshell 33 tại vòng bi trục; Gioăng làm kín PTFE tại đường làm mát',
    // Bước 5
    readyForTest: true,
    cost: 12.5,
    notes: 'Hoàn thành đúng tiến độ, tất cả thông số kỹ thuật đạt yêu cầu. Chuyển sang bệ thử nghiệm ngày 19/12/2025',
  },

  // ─── WO-002: 36D6 — Chờ thử nghiệm ─────────────────────────────────────────
  {
    id: 'ASM-002',
    orderId: 'WO-002',
    equipmentName: 'Hệ thống monitoring 36D6',
    workshopName: 'PX1 - Trung tâm Hệ thống monitoring',
    startDate: '2026-02-13',
    endDate: '2026-02-26',
    performedBy: 'Nhóm lắp ráp PX1 — KTV Lê Minh Đức (trưởng nhóm), KTV Trần Văn Hải, KTV Hoàng Thị Lan',
    status: 'pending_test',
    // Bước 1
    componentCount: 22,
    checklistNotes: 'Đủ 22/22 cụm; bơm làm mát mới đã nhận từ kho ngày 12/02; kiểm tra đường ống dẫn làm mát không rò rỉ trước khi lắp',
    // Bước 2
    torqueRecords: 'Bu lông rack máy phát M16: 90 N·m (TT: 85–95) ✓; Bu lông đường ống làm mát M10: 38 N·m (TT: 35–42) ✓; Bu lông coupling M12: 65 N·m (TT: 60–70) ✓',
    clearanceRecords: 'Khe hở bơm làm mát: 0.03mm (TT: 0.02–0.05mm) ✓; Khe hở coupling M12: 0.15mm (TT: 0.10–0.20mm) ✓; Độ thẳng đường ống: ≤0.5mm/m ✓',
    // Bước 3
    calibrationParams: 'Lưu lượng làm mát: 12 L/min (TT: ≥10 L/min) ✓; Nhiệt độ hoạt động: 65°C (TT: ≤70°C) ✓; Tần số hệ thống: 2.950 GHz (TT: 2.950±0.005 GHz) ✓; Áp suất làm mát: 2.1 bar (TT: 1.8–2.5 bar) ✓',
    // Bước 4
    configSnapshot: 'Cấu hình lắp: Khối máy phát + Hệ thống làm mát vòng kín + Bộ xử lý tín hiệu DSP; Keo Loctite 243 tại 8 vị trí kết nối; Dầu làm mát Shell Tellus 46 tổng 8L',
    // Bước 5
    readyForTest: true,
    cost: 9.8,
    notes: 'Hoàn thành lắp ráp và hiệu chỉnh. Đã tạo yêu cầu thử nghiệm TA-002, đang chờ xếp lịch bệ thử',
  },

  // ─── WO-003: P-18 — Đang hiệu chỉnh ────────────────────────────────────────
  {
    id: 'ASM-003',
    orderId: 'WO-003',
    equipmentName: 'Hệ thống monitoring P-18',
    workshopName: 'PX1 - Trung tâm Hệ thống monitoring',
    startDate: '2026-03-01',
    endDate: undefined,
    performedBy: 'Nhóm lắp ráp PX1 — KTV Vũ Đức Thắng (trưởng nhóm), KTV Nguyễn Văn An',
    status: 'calibrating',
    // Bước 1
    componentCount: 16,
    checklistNotes: 'Đủ 16/16 cụm; board khuếch đại mới từ phục hồi đã kiểm tra; motor quay anten đã thay vòng bi',
    // Bước 2
    torqueRecords: 'Bu lông anten M16: 82 N·m (TT: 80–90) ✓; Bu lông hộp khuếch đại M8: 22 N·m (TT: 20–25) ✓; Bu lông đế motor M12: 58 N·m (TT: 55–65) ✓',
    clearanceRecords: 'Khe hở vòng bi motor: 0.009mm (TT: 0.005–0.020mm) ✓; Khe hở bánh răng truyền động: 0.07mm (TT: 0.05–0.10mm) ✓',
    // Bước 3 — đang thực hiện
    calibrationParams: 'Tốc độ quay anten: 5.8 rpm (TT: 6±0.2) — đang điều chỉnh; Hệ số khuếch đại: đang đo; Dải tần công tác: chưa hoàn thành',
    cost: 7.2,
    notes: 'Lắp ráp hoàn thành. Đang trong giai đoạn hiệu chỉnh thông số, dự kiến hoàn thành hiệu chỉnh 10/03/2026',
  },

  // ─── WO-004: S-125 — Đang lắp ráp ──────────────────────────────────────────
  {
    id: 'ASM-004',
    orderId: 'WO-004',
    equipmentName: 'Bệ triển khai module S-125',
    workshopName: 'PX2 - Trung tâm Module sản phẩm',
    startDate: '2026-03-10',
    endDate: undefined,
    performedBy: 'Nhóm lắp ráp PX2 — KTV Đặng Minh Quân (trưởng nhóm), KTV Phan Văn Tùng, KTV Trịnh Thị Mai',
    status: 'assembling',
    // Bước 1
    componentCount: 24,
    checklistNotes: 'Nhận 24/24 cụm cấu phần; bơm thủy lực đã phục hồi, cáp RF đã thay mới; dụng cụ chuyên dụng đã chuẩn bị đủ',
    // Bước 2 — đang thực hiện
    torqueRecords: 'Bu lông xylanh thủy lực M20: 180 N·m (TT: 170–190) ✓; Bu lông mặt bích bơm M14: 75 N·m (TT: 70–80) ✓; Bu lông cụm điều khiển: đang lắp',
    clearanceRecords: 'Khe hở piston xylanh: 0.04mm (TT: 0.03–0.06mm) ✓; Khe hở khớp quay: đang đo',
    cost: 15.3,
    notes: 'Đang lắp ráp cụm thủy lực và điều khiển. Tiến độ đạt khoảng 60%, dự kiến hoàn thành lắp ráp 20/03/2026',
  },

  // ─── WO-005: S-75 — Chuẩn bị ────────────────────────────────────────────────
  {
    id: 'ASM-005',
    orderId: 'WO-005',
    equipmentName: 'Module S-75 Dvina',
    workshopName: 'PX2 - Trung tâm Module sản phẩm',
    startDate: '2026-03-20',
    endDate: undefined,
    performedBy: 'Nhóm lắp ráp PX2 — KTV Hoàng Văn Linh (trưởng nhóm)',
    status: 'preparing',
    // Bước 1
    componentCount: 19,
    checklistNotes: 'Đã nhận 17/19 cụm; còn chờ card DSP (phục hồi PX4, dự kiến 22/03) và đầu nối RF (đang thay thế). Dụng cụ đã kiểm tra đủ. Khu vực lắp ráp đã vệ sinh và đánh dấu vị trí',
    cost: 11.0,
    notes: 'Chờ đủ cấu phần từ phục hồi trước khi bắt đầu lắp ráp. Dự kiến khởi động lắp ráp 23/03/2026',
  },

  // ─── WO-006: ST-68 — Đang lắp ráp ──────────────────────────────────────────
  {
    id: 'ASM-006',
    orderId: 'WO-006',
    equipmentName: 'Hệ thống đo lường ST-68',
    workshopName: 'PX1 - Trung tâm Hệ thống monitoring',
    startDate: '2026-03-16',
    endDate: undefined,
    performedBy: 'Nhóm lắp ráp PX1 — KTV Nguyễn Thanh Sơn (trưởng nhóm), KTV Phạm Văn Bình',
    status: 'assembling',
    // Bước 1
    componentCount: 14,
    checklistNotes: 'Đủ 14/14 cụm; vòng bi trục chính mới đã tiếp nhận; motor servo đã phục hồi kiểm tra đạt',
    // Bước 2 — đang thực hiện
    torqueRecords: 'Bu lông vòng bi trục chính M20: 120 N·m (TT: 115–125) ✓; Bu lông mặt bích motor M12: 55 N·m (TT: 50–60) ✓; Bu lông cụm cao tần M8: đang lắp',
    clearanceRecords: 'Khe hở hướng kính vòng bi mới: 0.008mm (TT: ≤0.020mm) ✓; Độ đảo hướng trục: 0.010mm (TT: ≤0.015mm) ✓',
    cost: 6.8,
    notes: 'Đang lắp ráp cụm quay, đạt 85% tiến độ. Dự kiến hoàn thành lắp ráp và chuyển sang hiệu chỉnh ngày 25/03/2026',
  },
];
