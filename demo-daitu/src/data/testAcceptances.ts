import type { TestAcceptance } from '../types';

export const testAcceptances: TestAcceptance[] = [
  // ─── TA-001: WO-001 P-37 — Đã bàn giao (hoàn tất toàn bộ 6 bước) ──────────
  {
    id: 'TA-001',
    orderId: 'WO-001',
    equipmentName: 'Đài radar P-37',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    // Bước 1
    testScenario: 'Thử nghiệm toàn diện: đo tầm phát hiện, độ chính xác góc phương vị, công suất phát, thử nghiệm vận hành 8 giờ liên tục tại bệ thử sân kỹ thuật',
    testEnvironment: 'Bệ thử sân kỹ thuật Nhà máy Z119, kết hợp kiểm tra ngoài trời; nhiệt độ 22–28°C, độ ẩm 65–75%',
    testRequirements: 'Tầm phát hiện: ≥250km; Công suất phát: ≥95kW; Độ chính xác góc: ≤0.5°; Vận hành liên tục: 8 giờ không lỗi; Điện trở cách điện: ≥20MΩ',
    // Bước 2
    testRequestDate: '2025-12-18',
    // Bước 3
    testDate: '2025-12-19',
    testResult: 'pass',
    performanceMetrics: 'Tầm phát hiện: 285km (TT: ≥250km) ✓; Công suất phát: 98kW (TT: ≥95kW) ✓; Độ chính xác góc phương vị: 0.3° (TT: ≤0.5°) ✓; Vận hành liên tục 8h: Không lỗi ✓; Điện trở cách điện: 50MΩ (TT: ≥20MΩ) ✓; Tiêu thụ điện: 42kW (TT: ≤45kW) ✓',
    // Bước 4
    acceptedBy: 'Đại tá Phạm Quốc Hưng — Giám đốc Nhà máy Z119',
    acceptedDate: '2025-12-23',
    // Bước 6
    deliveredTo: 'Trung đoàn 291 — Sư đoàn 363',
    deliveredDate: '2025-12-25',
    closedBy: 'Hoàng Minh Tuấn — Phòng Kế hoạch',
    closedDate: '2025-12-26',
    status: 'delivered',
    notes: 'Thiết bị đạt và vượt một số chỉ tiêu kỹ thuật. Lệnh đại tu LDT-2025-001 đã đóng chính thức.',
  },

  // ─── TA-002: WO-002 36D6 — Đang thử lại (lần 1 không đạt) ─────────────────
  {
    id: 'TA-002',
    orderId: 'WO-002',
    equipmentName: 'Đài radar 36D6',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    // Bước 1
    testScenario: 'Thử nghiệm hệ thống phát thu, đo độ chính xác cự ly, kiểm tra hệ thống làm mát dưới tải; chạy thử 4 giờ liên tục',
    testEnvironment: 'Bệ thử sân kỹ thuật Nhà máy Z119; nhiệt độ 24°C, vận tốc gió 3m/s',
    testRequirements: 'Công suất phát: ≥50kW; Làm mát: ≤70°C; Không rung bất thường; Cự ly đo: ±50m; Vận hành liên tục 4h: không lỗi',
    // Bước 2
    testRequestDate: '2026-02-27',
    // Bước 3
    testDate: '2026-02-28',
    testResult: 'fail',
    performanceMetrics: 'Công suất phát: 52kW (TT: ≥50kW) ✓; Làm mát: 68°C (TT: ≤70°C) ✓; Cự ly đo: ±45m (TT: ±50m) ✓; Rung 2.5kHz sau 2h vận hành: Phát hiện ✗',
    // Bước 5
    failureReason: 'Phát hiện rung bất thường tần số 2.5kHz sau 2 giờ vận hành liên tục. Nguyên nhân xác định: khớp nối card DSP bị lỏng do giãn nở nhiệt, đệm giảm rung chưa đủ độ cứng.',
    correctiveAction: 'Siết lại 4 khớp nối DSP theo mô-men 35 N·m; thay đệm giảm rung bằng loại silicon 60 Shore A; kiểm tra lại toàn bộ mối ghép board điện tử; hẹn thử nghiệm lại sau 7 ngày xử lý.',
    retestDate: '2026-04-10',
    status: 'retesting',
    notes: 'Đang xử lý khắc phục. Dự kiến thử lại ngày 10/04/2026.',
  },

  // ─── TA-003: WO-006 ST-68 — Chờ thử nghiệm ─────────────────────────────────
  {
    id: 'TA-003',
    orderId: 'WO-006',
    equipmentName: 'Đài đo cao ST-68',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    // Bước 1
    testScenario: 'Thử nghiệm hệ thống quay anten: tốc độ, độ ổn định, tiếng ồn cơ học; kiểm tra chức năng đo cao và hiển thị dữ liệu',
    testEnvironment: 'Bệ thử sân kỹ thuật Nhà máy Z119',
    testRequirements: 'Tốc độ quay anten: 6±0.2 rpm; Tiếng ồn: ≤75dB; Đo cao chính xác: ±30m; Không rò rỉ dầu bôi trơn',
    status: 'pending_test',
    notes: 'Chờ hoàn thành lắp ráp ASM-006. Dự kiến bắt đầu thử nghiệm 28/03/2026.',
  },

  // ─── TA-004: WO-003 P-18 — Đang thử nghiệm ─────────────────────────────────
  {
    id: 'TA-004',
    orderId: 'WO-003',
    equipmentName: 'Đài radar P-18',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    // Bước 1
    testScenario: 'Thử nghiệm toàn diện: công suất phát, tầm phát hiện, tốc độ quay anten, độ ổn định dải tần, chạy thử 6 giờ liên tục',
    testEnvironment: 'Bệ thử sân kỹ thuật Nhà máy Z119; thời tiết: nắng, nhiệt độ 27°C',
    testRequirements: 'Tầm phát hiện: ≥200km; Công suất phát: ≥80kW; Tốc độ quay: 6±0.2 rpm; Dải tần: 150–170 MHz; Vận hành 6h: không lỗi',
    // Bước 2
    testRequestDate: '2026-03-12',
    // Bước 3 — đang tiến hành
    testDate: '2026-03-15',
    status: 'testing',
    notes: 'Đang trong quá trình thử nghiệm. Đã hoàn thành 3/6 giờ chạy liên tục, các thông số ban đầu ổn định.',
  },

  // ─── TA-005: WO-004 S-125 — Đạt, chờ nghiệm thu ────────────────────────────
  {
    id: 'TA-005',
    orderId: 'WO-004',
    equipmentName: 'Bệ phóng tên lửa S-125',
    workshopName: 'Phân xưởng PX2 - Sửa chữa Tên lửa',
    // Bước 1
    testScenario: 'Thử nghiệm hệ thống thủy lực nâng hạ, kiểm tra cơ cấu quay và khóa bệ, thử nghiệm hệ thống điều khiển điện',
    testEnvironment: 'Bệ thử chuyên dụng Phân xưởng PX2; áp suất thủy lực 180 bar',
    testRequirements: 'Hành trình nâng hạ: 0°–85° đầy đủ; Tốc độ nâng: 8°/s; Độ chính xác góc: ±0.1°; Áp suất thủy lực: 180±5 bar; Không rò rỉ dầu',
    // Bước 2
    testRequestDate: '2026-03-22',
    // Bước 3
    testDate: '2026-03-25',
    testResult: 'pass',
    performanceMetrics: 'Hành trình nâng hạ 0°–85°: Hoàn thành ✓; Tốc độ nâng: 8.2°/s (TT: 8±0.5°/s) ✓; Độ chính xác góc: ±0.08° (TT: ±0.1°) ✓; Áp suất thủy lực: 182 bar (TT: 180±5) ✓; Kiểm tra rò rỉ 2h: Không phát hiện ✓; Hệ thống khóa bệ: Hoạt động đúng ✓',
    status: 'passed',
    notes: 'Toàn bộ thông số đạt yêu cầu. Đang chờ Ban Giám đốc ký nghiệm thu chính thức.',
  },

  // ─── TA-006: WO-005 S-75 — Đã nghiệm thu, chờ bàn giao ─────────────────────
  {
    id: 'TA-006',
    orderId: 'WO-005',
    equipmentName: 'Tổ hợp tên lửa S-75 Dvina',
    workshopName: 'Phân xưởng PX2 - Sửa chữa Tên lửa',
    // Bước 1
    testScenario: 'Thử nghiệm toàn tổ hợp: hệ thống dẫn đường, cơ cấu phóng, hệ thống điều khiển, thử nghiệm mô phỏng phóng 10 chu kỳ',
    testEnvironment: 'Bãi thử chuyên dụng Sư đoàn 361, cách Nhà máy Z119 12km',
    testRequirements: 'Hệ thống dẫn đường: sai số ≤5m; Thời gian phản ứng: ≤3.5s; Cơ cấu phóng: 10/10 chu kỳ; Không lỗi hệ thống điều khiển trong 8h',
    // Bước 2
    testRequestDate: '2026-03-28',
    // Bước 3
    testDate: '2026-04-02',
    testResult: 'pass',
    performanceMetrics: 'Hệ thống dẫn đường: sai số 3.8m (TT: ≤5m) ✓; Thời gian phản ứng: 3.1s (TT: ≤3.5s) ✓; Cơ cấu phóng: 10/10 chu kỳ ✓; Vận hành liên tục 8h: Không lỗi ✓; Kiểm tra mô-men quay anten: 85 N·m (TT: 80–90) ✓',
    // Bước 4
    acceptedBy: 'Đại tá Phạm Quốc Hưng — Giám đốc Nhà máy Z119',
    acceptedDate: '2026-04-05',
    status: 'accepted',
    notes: 'Nghiệm thu đạt. Đang chuẩn bị thủ tục bàn giao cho Trung đoàn 261.',
  },
];
