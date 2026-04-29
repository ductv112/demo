import type { TraceabilityRecord } from '../types';

export const traceabilityRecords: TraceabilityRecord[] = [
  // ─── TRC-001: WO-001 P-37 — Hoàn thành toàn bộ 6 bước ──────────────────────
  {
    id: 'TRC-001',
    orderId: 'WO-001',
    equipmentId: 'EQ-P37-001',
    equipmentName: 'Đài radar P-37 (P37-291-001)',
    status: 'completed',
    // Bước 1
    overhaulStartDate: '2025-11-15',
    overhaulEndDate: '2025-12-25',
    overhaulDate: '2025-12-25',
    overhaulScope: 'Đại tu toàn bộ: hệ thống phát sóng, anten, cơ khí, hệ thống làm mát',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    totalComponents: 42,
    replacedCount: 8,
    restoredCount: 12,
    testResult: 'pass',
    testAcceptanceId: 'TA-001',
    // Bước 2
    completedItems: [
      'Tháo rã và kiểm tra 42 cấu phần (6 ngày)',
      'Thay thế 8 linh kiện bắt buộc theo chu kỳ',
      'Phục hồi 12 cấu phần cơ khí và điện tử',
      'Nâng cấp hệ thống hiển thị CRT → LED',
      'Lắp ráp và hiệu chỉnh toàn bộ hệ thống',
      'Thử nghiệm 8 giờ liên tục — đạt toàn bộ chỉ tiêu',
      'Nghiệm thu và bàn giao Trung đoàn 291',
    ],
    responsiblePerson: 'Thượng tá Nguyễn Văn Hải — Trưởng phòng Kỹ thuật',
    supervisorName: 'Đại tá Phạm Quốc Hưng — Giám đốc Nhà máy Z119',
    overhaulCost: 2850000000,
    // Bước 3
    configVersion: 'v2.3',
    configItems: [
      { parameter: 'Tần số phát', before: '162.5 MHz', after: '165.0 MHz', reason: 'Theo phân vùng tần số mới 2025' },
      { parameter: 'Tốc độ quay anten', before: '6 rpm', after: '6 rpm', reason: 'Không thay đổi' },
      { parameter: 'Phiên bản cấu hình', before: 'v2.1', after: 'v2.3', reason: 'Cập nhật sau nâng cấp hệ thống hiển thị' },
      { parameter: 'Tầm phát hiện tối đa', before: '250 km', after: '285 km', reason: 'Cải thiện sau thay thế ống dẫn sóng mới' },
      { parameter: 'Công suất phát', before: '95 kW', after: '98 kW', reason: 'Đạt tốt hơn sau thay thế linh kiện' },
    ],
    configChanges: [
      'Tần số phát: 162.5MHz → 165.0MHz',
      'Phiên bản cấu hình: v2.1 → v2.3',
      'Tầm phát hiện: 250km → 285km',
    ],
    // Bước 4
    technicalChangeItems: [
      { type: 'standard', description: 'Áp dụng TCQS-2025-RADAR về độ rung và chấn động', reference: 'TCQS-2025-RADAR', appliedDate: '2025-12-01' },
      { type: 'design', description: 'Cải tiến hệ thống làm mát theo Bản sửa đổi kỹ thuật', reference: 'BK-2024-015', appliedDate: '2025-12-03' },
      { type: 'material', description: 'Thay đệm silicon 60 Shore A thay cho cao su tiêu chuẩn', reference: 'VL-2025-042' },
      { type: 'document', description: 'Cập nhật tài liệu vận hành theo phiên bản mới v3.2', reference: 'TL-P37-OP-V32', appliedDate: '2025-12-20' },
    ],
    technicalChanges: [
      'Áp dụng TCQS-2025-RADAR về độ rung',
      'Cải tiến hệ thống làm mát (BK-2024-015)',
    ],
    // Bước 5
    componentTraceItems: [
      { componentId: 'CMP-001-01', componentName: 'Ống dẫn sóng chính', action: 'replace', serialNo: 'WG-2025-001', supplier: 'Nhà máy Z175', installDate: '2025-12-05', lifeRemaining: '10 năm' },
      { componentId: 'CMP-001-02', componentName: 'Vòng bi trục anten (×4)', action: 'replace', serialNo: 'BRG-SKF-2025', supplier: 'Tổng cục CNQP', installDate: '2025-12-07', lifeRemaining: '8 năm' },
      { componentId: 'CMP-001-03', componentName: 'Tụ điện tần số cao (×8)', action: 'replace', serialNo: 'CAP-HF-2025', supplier: 'Nhà máy Z111', installDate: '2025-12-08' },
      { componentId: 'CMP-001-04', componentName: 'Bộ hiển thị radar', action: 'upgrade', serialNo: 'DSP-LED-001', supplier: 'Công ty Điện tử Hà Nội', installDate: '2025-12-10', lifeRemaining: '15 năm' },
      { componentId: 'CMP-001-05', componentName: 'Bộ gioăng làm kín (bộ)', action: 'replace', supplier: 'Nhà máy Z119 tự sản xuất', installDate: '2025-12-06' },
      { componentId: 'CMP-001-06', componentName: 'Cơ cấu dẫn động anten', action: 'restore', installDate: '2025-12-09', lifeRemaining: '5 năm' },
      { componentId: 'CMP-001-07', componentName: 'Hộp số giảm tốc', action: 'restore', installDate: '2025-12-09', lifeRemaining: '6 năm' },
      { componentId: 'CMP-001-08', componentName: 'Bo mạch xử lý tín hiệu', action: 'serviceable', installDate: '2025-12-11', lifeRemaining: '7 năm' },
    ],
    replacedComponents: ['Ống dẫn sóng chính', 'Vòng bi trục anten (×4)', 'Tụ điện tần số cao (×8)', 'Bộ gioăng làm kín (bộ)', 'Cáp RF nối anten (×3)', 'Phớt dầu hộp số (×6)'],
    upgradedComponents: ['Bộ hiển thị: CRT → LED', 'Firmware xử lý tín hiệu: v3.2'],
    // Bước 6
    linkedSystems: [
      { system: 'Quản lý Tài chính Kế toán', status: 'synced', syncDate: '2025-12-26' },
      { system: 'Quản lý Vòng đời & Cấu hình', status: 'synced', syncDate: '2025-12-26' },
      { system: 'Quản lý Bảo trì', status: 'synced', syncDate: '2025-12-27' },
      { system: 'Quản lý Sửa chữa', status: 'synced', syncDate: '2025-12-27' },
    ],
    syncedAt: '2025-12-27',
    notes: 'Hồ sơ truy vết hoàn thành. Thiết bị bàn giao Trung đoàn 291 ngày 25/12/2025. Lệnh đại tu WO-001 đã đóng.',
  },

  // ─── TRC-002: WO-005 S-75 — Bước 6: Đang đồng bộ ────────────────────────────
  {
    id: 'TRC-002',
    orderId: 'WO-005',
    equipmentId: 'EQ-S75-001',
    equipmentName: 'Tổ hợp tên lửa S-75 Dvina (S75-361-003)',
    status: 'syncing',
    // Bước 1
    overhaulStartDate: '2026-01-15',
    overhaulEndDate: '2026-04-05',
    overhaulDate: '2026-04-05',
    overhaulScope: 'Đại tu toàn diện: hệ thống dẫn đường, cơ cấu phóng, hệ thống điều khiển, thiết bị điện tử',
    workshopName: 'Phân xưởng PX2 - Sửa chữa Tên lửa',
    totalComponents: 78,
    replacedCount: 15,
    restoredCount: 22,
    testResult: 'pass',
    testAcceptanceId: 'TA-006',
    // Bước 2
    completedItems: [
      'Tháo rã và kiểm tra 78 cấu phần (12 ngày)',
      'Thay thế 15 linh kiện bắt buộc theo chu kỳ',
      'Phục hồi 22 cấu phần cơ khí và điện tử',
      'Đại tu hệ thống dẫn đường radar',
      'Phục hồi cơ cấu phóng và hệ thống thủy lực',
      'Kiểm tra và hiệu chỉnh hệ thống điều khiển',
      'Thử nghiệm mô phỏng phóng 10 chu kỳ — đạt',
      'Nghiệm thu Đại tá Phạm Quốc Hưng ngày 05/04/2026',
    ],
    responsiblePerson: 'Thiếu tá Trần Đức Mạnh — Trưởng PX2',
    supervisorName: 'Đại tá Phạm Quốc Hưng — Giám đốc Nhà máy Z119',
    overhaulCost: 5400000000,
    // Bước 3
    configVersion: 'v4.1',
    configItems: [
      { parameter: 'Phiên bản phần mềm dẫn đường', before: 'v3.8', after: 'v4.1', reason: 'Cập nhật theo tài liệu kỹ thuật mới' },
      { parameter: 'Sai số dẫn đường', before: '≤5m (thiết kế)', after: '3.8m (thực đo)', reason: 'Cải thiện sau phục hồi module dẫn đường' },
      { parameter: 'Thời gian phản ứng', before: '≤3.5s', after: '3.1s', reason: 'Đạt tốt hơn sau cập nhật firmware' },
      { parameter: 'Áp suất thủy lực cơ cấu phóng', before: '175 bar', after: '180 bar', reason: 'Điều chỉnh theo tiêu chuẩn mới' },
    ],
    configChanges: ['Phần mềm dẫn đường: v3.8 → v4.1', 'Sai số dẫn đường: ≤5m → 3.8m thực đo'],
    // Bước 4
    technicalChangeItems: [
      { type: 'standard', description: 'Áp dụng tiêu chuẩn TCQS-2026-MIS về độ chính xác dẫn đường', reference: 'TCQS-2026-MIS', appliedDate: '2026-03-15' },
      { type: 'design', description: 'Cải tiến cơ cấu khóa bệ theo Bản sửa đổi kỹ thuật BK-2025-032', reference: 'BK-2025-032', appliedDate: '2026-03-20' },
      { type: 'document', description: 'Cập nhật hướng dẫn vận hành và bảo quản tổ hợp', reference: 'TL-S75-OP-2026' },
    ],
    technicalChanges: ['Áp dụng TCQS-2026-MIS', 'Cải tiến khóa bệ (BK-2025-032)'],
    // Bước 5
    componentTraceItems: [
      { componentId: 'CMP-005-01', componentName: 'Module dẫn đường radar', action: 'restore', installDate: '2026-03-10', lifeRemaining: '8 năm' },
      { componentId: 'CMP-005-02', componentName: 'Bơm thủy lực cơ cấu phóng', action: 'replace', serialNo: 'HYD-2026-015', supplier: 'Bosch Rexroth (qua Tổng cục)', installDate: '2026-03-12', lifeRemaining: '12 năm' },
      { componentId: 'CMP-005-03', componentName: 'Bộ điều khiển điện trung tâm', action: 'restore', installDate: '2026-03-15', lifeRemaining: '6 năm' },
      { componentId: 'CMP-005-04', componentName: 'Cụm encoder góc phương vị', action: 'replace', serialNo: 'ENC-ABS-2026', supplier: 'Nhà máy Z111', installDate: '2026-03-16', lifeRemaining: '10 năm' },
      { componentId: 'CMP-005-05', componentName: 'Cơ cấu quay anten dẫn đường', action: 'restore', installDate: '2026-03-18', lifeRemaining: '7 năm' },
    ],
    replacedComponents: ['Bơm thủy lực', 'Encoder góc phương vị', 'Vòng bi ổ đỡ (×6)', 'Cáp tín hiệu điều khiển (×12)', 'Bộ lọc dầu thủy lực'],
    upgradedComponents: ['Phần mềm dẫn đường v4.1', 'Cơ cấu khóa bệ (cải tiến BK-2025-032)'],
    // Bước 6 — đang đồng bộ
    linkedSystems: [
      { system: 'Quản lý Tài chính Kế toán', status: 'synced', syncDate: '2026-04-08' },
      { system: 'Quản lý Vòng đời & Cấu hình', status: 'pending' },
      { system: 'Quản lý Bảo trì', status: 'pending' },
      { system: 'Quản lý Sửa chữa', status: 'synced', syncDate: '2026-04-08' },
    ],
    notes: 'Đã hoàn thành 5/6 bước. Đang đồng bộ với Quản lý Vòng đời và Bảo trì.',
  },

  // ─── TRC-003: WO-004 S-125 — Bước 5: Đang thiết lập truy vết ────────────────
  {
    id: 'TRC-003',
    orderId: 'WO-004',
    equipmentId: 'EQ-S125-002',
    equipmentName: 'Bệ phóng tên lửa S-125 Pechora (S125-363-002)',
    status: 'tracing',
    // Bước 1
    overhaulStartDate: '2026-01-20',
    overhaulEndDate: '2026-03-25',
    overhaulDate: '2026-03-25',
    overhaulScope: 'Đại tu hệ thống thủy lực nâng hạ, cơ cấu quay và khóa bệ, hệ thống điều khiển điện',
    workshopName: 'Phân xưởng PX2 - Sửa chữa Tên lửa',
    totalComponents: 54,
    replacedCount: 11,
    restoredCount: 16,
    testResult: 'pass',
    testAcceptanceId: 'TA-005',
    // Bước 2
    completedItems: [
      'Tháo rã và kiểm tra 54 cấu phần',
      'Thay thế 11 linh kiện bắt buộc theo chu kỳ',
      'Phục hồi 16 cấu phần thủy lực và cơ khí',
      'Đại tu hệ thống nâng hạ 0°–85°',
      'Kiểm tra và hiệu chỉnh cơ cấu quay',
      'Thử nghiệm toàn hệ thống — đạt',
    ],
    responsiblePerson: 'Thiếu tá Trần Đức Mạnh — Trưởng PX2',
    supervisorName: 'Đại tá Phạm Quốc Hưng',
    overhaulCost: 3200000000,
    // Bước 3
    configVersion: 'v3.2',
    configItems: [
      { parameter: 'Hành trình nâng hạ', before: '0°–83°', after: '0°–85°', reason: 'Phục hồi đúng thiết kế sau thay xy-lanh' },
      { parameter: 'Tốc độ nâng', before: '7.5°/s', after: '8.2°/s', reason: 'Cải thiện sau thay bơm thủy lực mới' },
      { parameter: 'Độ chính xác góc', before: '±0.15°', after: '±0.08°', reason: 'Cải thiện sau thay encoder mới' },
      { parameter: 'Áp suất thủy lực làm việc', before: '175 bar', after: '182 bar', reason: 'Điều chỉnh theo bơm mới' },
    ],
    configChanges: ['Hành trình nâng: 83° → 85°', 'Tốc độ nâng: 7.5 → 8.2°/s', 'Độ chính xác: ±0.15° → ±0.08°'],
    // Bước 4
    technicalChangeItems: [
      { type: 'standard', description: 'Áp dụng TCQS-2026-HYD về tiêu chuẩn hệ thống thủy lực quân sự', reference: 'TCQS-2026-HYD', appliedDate: '2026-03-01' },
      { type: 'material', description: 'Thay dầu thủy lực MIL-H-5606 bằng MIL-PRF-5606H cải tiến', reference: 'VL-HYD-2026-003' },
    ],
    technicalChanges: ['Áp dụng TCQS-2026-HYD', 'Thay dầu thủy lực MIL-PRF-5606H'],
    // Bước 5 — đang thiết lập (chưa đầy đủ)
    componentTraceItems: [
      { componentId: 'CMP-004-01', componentName: 'Xy-lanh thủy lực nâng chính', action: 'replace', serialNo: 'CYL-HYD-2026-04', supplier: 'Nhà máy Z175', installDate: '2026-03-05', lifeRemaining: '12 năm' },
      { componentId: 'CMP-004-02', componentName: 'Bơm thủy lực chính', action: 'replace', serialNo: 'PMP-HYD-2026-04', supplier: 'Bosch Rexroth (qua Tổng cục)', installDate: '2026-03-06', lifeRemaining: '10 năm' },
      { componentId: 'CMP-004-03', componentName: 'Encoder góc nâng hạ', action: 'replace', serialNo: 'ENC-2026-S125', supplier: 'Nhà máy Z111', installDate: '2026-03-08' },
    ],
    replacedComponents: ['Xy-lanh thủy lực nâng chính', 'Bơm thủy lực chính', 'Encoder góc nâng hạ', 'Vòng bi ổ đỡ chính (×4)', 'Phớt kín dầu (bộ)'],
    upgradedComponents: [],
    // Bước 6 — chưa bắt đầu
    linkedSystems: [
      { system: 'Quản lý Tài chính Kế toán', status: 'pending' },
      { system: 'Quản lý Vòng đời & Cấu hình', status: 'pending' },
      { system: 'Quản lý Bảo trì', status: 'pending' },
      { system: 'Quản lý Sửa chữa', status: 'pending' },
    ],
    notes: 'Đang hoàn thiện danh sách truy vết cấu phần (còn 8 cấu phần chưa nhập serial). Dự kiến đồng bộ hệ thống sau 3 ngày.',
  },

  // ─── TRC-004: WO-003 P-18 — Bước 3: Cập nhật cấu hình ────────────────────────
  {
    id: 'TRC-004',
    orderId: 'WO-003',
    equipmentId: 'EQ-P18-001',
    equipmentName: 'Đài radar P-18 (P18-367-001)',
    status: 'configuring',
    // Bước 1
    overhaulStartDate: '2026-01-18',
    overhaulEndDate: '2026-03-20',
    overhaulDate: '2026-03-20',
    overhaulScope: 'Đại tu hệ thống phát thu, thay thế Magnetron, phục hồi hệ thống điều chế xung',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    totalComponents: 38,
    replacedCount: 9,
    restoredCount: 14,
    testResult: 'pass',
    testAcceptanceId: 'TA-004',
    // Bước 2
    completedItems: [
      'Tháo rã và kiểm tra 38 cấu phần',
      'Thay thế ống Magnetron phát sóng (hết tuổi thọ)',
      'Phục hồi bộ điều chế xung và máy phát điện phụ',
      'Thay thế các linh kiện bắt buộc theo chu kỳ',
      'Lắp ráp và hiệu chỉnh hệ thống',
      'Thử nghiệm — đang trong quá trình chạy 6 giờ',
    ],
    responsiblePerson: 'KS. Trần Văn Hùng — Phòng Kỹ thuật',
    supervisorName: 'Thượng tá Nguyễn Văn Hải',
    overhaulCost: 2100000000,
    // Bước 3 — đang cập nhật
    configVersion: 'v3.1',
    configItems: [
      { parameter: 'Phiên bản cấu hình', before: 'v2.9', after: 'v3.1', reason: 'Cập nhật sau thay Magnetron mới' },
      { parameter: 'Công suất phát', before: '75 kW', after: '≥80 kW (mục tiêu)', reason: 'Cải thiện với Magnetron mới' },
    ],
    configChanges: ['Phiên bản cấu hình: v2.9 → v3.1', 'Magnetron mới — đang cập nhật thông số'],
    // Bước 4 — chưa bắt đầu
    technicalChangeItems: [],
    technicalChanges: [],
    // Bước 5 — chưa bắt đầu
    componentTraceItems: [],
    replacedComponents: ['Ống Magnetron phát sóng', 'Tụ điện bộ điều chế xung (×4)', 'Máy biến áp điều chế'],
    upgradedComponents: [],
    // Bước 6 — chưa bắt đầu
    linkedSystems: [
      { system: 'Quản lý Tài chính Kế toán', status: 'pending' },
      { system: 'Quản lý Vòng đời & Cấu hình', status: 'pending' },
      { system: 'Quản lý Bảo trì', status: 'pending' },
      { system: 'Quản lý Sửa chữa', status: 'pending' },
    ],
    notes: 'Đang cập nhật thông số cấu hình thiết bị sau khi thay Magnetron. Chờ kết quả thử nghiệm cuối.',
  },

  // ─── TRC-005: WO-002 36D6 — Bước 1: Đang tổng hợp dữ liệu ──────────────────
  {
    id: 'TRC-005',
    orderId: 'WO-002',
    equipmentId: 'EQ-36D6-001',
    equipmentName: 'Đài radar 36D6 (36D6-361-001)',
    status: 'collecting',
    // Bước 1 — đang tổng hợp
    overhaulStartDate: '2026-01-08',
    overhaulDate: '2026-04-10',
    overhaulScope: 'Đại tu hệ thống phát thu, làm mát, khắc phục rung bất thường',
    workshopName: 'Phân xưởng PX1 - Sửa chữa Radar',
    totalComponents: 31,
    replacedCount: 5,
    restoredCount: 8,
    testResult: 'fail',
    testAcceptanceId: 'TA-002',
    // Bước 2 — chưa đầy đủ
    completedItems: [
      'Tháo rã và kiểm tra 31 cấu phần',
      'Thay thế mô-đun phát sóng chính (hỏng hoàn toàn)',
      'Thay bơm làm mát (rò rỉ dầu nghiêm trọng)',
      'Phục hồi mô-đun thu tín hiệu (hiệu chỉnh bộ lọc)',
      'Lắp ráp và chạy thử — phát hiện rung 2.5kHz',
      'Đang khắc phục: siết khớp nối DSP, thay đệm giảm rung',
    ],
    responsiblePerson: 'KS. Nguyễn Thanh Sơn — PX1',
    supervisorName: 'Thượng tá Nguyễn Văn Hải',
    overhaulCost: 1850000000,
    // Bước 3–5 chưa bắt đầu
    configVersion: 'v2.1',
    configItems: [],
    configChanges: [],
    technicalChangeItems: [],
    technicalChanges: [],
    componentTraceItems: [],
    replacedComponents: ['Mô-đun phát sóng chính', 'Bơm làm mát chính'],
    upgradedComponents: [],
    // Bước 6 — chưa bắt đầu
    linkedSystems: [
      { system: 'Quản lý Tài chính Kế toán', status: 'pending' },
      { system: 'Quản lý Vòng đời & Cấu hình', status: 'pending' },
      { system: 'Quản lý Bảo trì', status: 'pending' },
      { system: 'Quản lý Sửa chữa', status: 'pending' },
    ],
    notes: 'Thiết bị đang trong quá trình thử lại sau khắc phục rung. Hồ sơ truy vết sẽ hoàn thiện sau khi nghiệm thu.',
  },
];
