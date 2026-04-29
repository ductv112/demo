import type { ActualConfiguration } from '../types';

export const actualConfigurations: ActualConfiguration[] = [
  // ── EQ001 P-18 SH001 — khớp thiết kế ───────────────────────────────────────
  {
    id: 'AC001',
    equipmentId: 'EQ001',
    equipmentCode: 'RADAR-001',
    equipmentName: 'Hệ thống P-18 (Monitoring)',
    serialNumber: 'P18-SH001',
    designVersionRef: 'RADAR-001-v2.1',
    recordedAt: '2025-03-10',
    source: 'pkkq-daitu',
    sourceRef: 'DT-2025-003',
    recordedBy: 'Kỹ thuật viên Nguyễn Văn Thắng',
    confirmedBy: 'Trưởng nhóm Trần Đức Minh',
    confirmedAt: '2025-03-12',
    status: 'synced',
    notes: 'Ghi nhận sau đợt nâng cấp tháng 3/2025. Tất cả thông số đạt chuẩn thiết kế.',
    components: [
      { name: 'Công suất phát xạ', code: 'TX-PWR', group: 'Hệ thống phát', designValue: '160', actualValue: '160', unit: 'kW', isDeviated: false },
      { name: 'Tần số trung tâm', code: 'TX-FREQ', group: 'Hệ thống phát', designValue: '170', actualValue: '170', unit: 'MHz', isDeviated: false },
      { name: 'Độ nhạy máy thu', code: 'RX-SENS', group: 'Hệ thống thu', designValue: '-108', actualValue: '-108', unit: 'dBm', isDeviated: false },
      { name: 'Tốc độ quay anten', code: 'ANT-RPM', group: 'Anten', designValue: '6', actualValue: '6', unit: 'vòng/phút', isDeviated: false },
      { name: 'Độ rộng búp sóng', code: 'ANT-BW', group: 'Anten', designValue: '3.5', actualValue: '3.5', unit: 'độ', isDeviated: false },
      { name: 'Cự ly phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '250', actualValue: '252', unit: 'km', isDeviated: false },
    ],
  },

  // ── EQ001 P-18 SH002 — lệch thông số ───────────────────────────────────────
  {
    id: 'AC002',
    equipmentId: 'EQ001',
    equipmentCode: 'RADAR-001',
    equipmentName: 'Hệ thống P-18 (Monitoring)',
    serialNumber: 'P18-SH002',
    designVersionRef: 'RADAR-001-v2.1',
    recordedAt: '2025-06-20',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2025-118',
    recordedBy: 'Kỹ thuật viên Lê Hữu Bình',
    confirmedBy: 'Trưởng nhóm Trần Đức Minh',
    confirmedAt: '2025-06-22',
    status: 'deviated',
    notes: 'Công suất phát xạ giảm 8% so với thiết kế. Đề nghị kiểm tra bộ khuếch đại cao tần.',
    components: [
      { name: 'Công suất phát xạ', code: 'TX-PWR', group: 'Hệ thống phát', designValue: '160', actualValue: '147', unit: 'kW', isDeviated: true, deviationNote: 'Giảm 8.1%, vượt ngưỡng cho phép ±5%' },
      { name: 'Tần số trung tâm', code: 'TX-FREQ', group: 'Hệ thống phát', designValue: '170', actualValue: '170', unit: 'MHz', isDeviated: false },
      { name: 'Độ nhạy máy thu', code: 'RX-SENS', group: 'Hệ thống thu', designValue: '-108', actualValue: '-105', unit: 'dBm', isDeviated: true, deviationNote: 'Giảm 3 dBm so với thiết kế',
        deviationHandling: { action: 'accepted', handledBy: 'Trưởng nhóm Trần Đức Minh', handledAt: '2025-06-25', reason: 'Độ lệch 3 dBm nằm trong dải chấp nhận được theo TCVN 8095-161. Không ảnh hưởng đến nhiệm vụ vận hành.' } },
      { name: 'Tốc độ quay anten', code: 'ANT-RPM', group: 'Anten', designValue: '6', actualValue: '6', unit: 'vòng/phút', isDeviated: false },
      { name: 'Độ rộng búp sóng', code: 'ANT-BW', group: 'Anten', designValue: '3.5', actualValue: '3.6', unit: 'độ', isDeviated: false },
      { name: 'Cự ly phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '250', actualValue: '231', unit: 'km', isDeviated: true, deviationNote: 'Giảm 19 km do công suất phát giảm',
        deviationHandling: { action: 'repair_requested', handledBy: 'Kỹ thuật viên Lê Hữu Bình', handledAt: '2025-06-23', reason: 'Cự ly giảm do công suất phát xuống cấp. Yêu cầu đưa vào khắc phục bộ khuếch đại TX.', linkedModule: 'pkkq-suachua', linkedRef: 'SC-2025-201' } },
    ],
  },

  // ── EQ002 36D6 SH001 — khớp thiết kế ────────────────────────────────────────
  {
    id: 'AC003',
    equipmentId: 'EQ002',
    equipmentCode: 'RADAR-002',
    equipmentName: 'Hệ thống 36D6 (Phát hiện)',
    serialNumber: '36D6-SH001',
    designVersionRef: 'RADAR-002-v1.0',
    recordedAt: '2025-01-15',
    source: 'pkkq-suachua',
    sourceRef: 'SC-2024-089',
    recordedBy: 'Kỹ thuật viên Phạm Quang Sáng',
    confirmedBy: 'Trưởng nhóm Hoàng Minh Tuấn',
    confirmedAt: '2025-01-17',
    status: 'synced',
    notes: 'Ghi nhận sau khắc phục cuối năm 2024.',
    components: [
      { name: 'Công suất đỉnh', code: 'PEAK-PWR', group: 'Hệ thống phát', designValue: '380', actualValue: '380', unit: 'kW', isDeviated: false },
      { name: 'Dải tần hoạt động', code: 'FREQ-BAND', group: 'Hệ thống phát', designValue: 'E/F', actualValue: 'E/F', unit: 'Band', isDeviated: false },
      { name: 'Tầm phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '360', actualValue: '358', unit: 'km', isDeviated: false },
      { name: 'Độ phân giải cự ly', code: 'RNG-RES', group: 'Hiệu năng', designValue: '100', actualValue: '100', unit: 'm', isDeviated: false },
    ],
  },

  // ── EQ005 S-75 SH001 — chờ cập nhật (chờ bản thiết kế mới) ─────────────────
  {
    id: 'AC004',
    equipmentId: 'EQ005',
    equipmentCode: 'MISSILE-001',
    equipmentName: 'Module S-75 (Dvina)',
    serialNumber: 'S75-SH001',
    designVersionRef: 'MISSILE-001-v5.0',
    recordedAt: '2025-04-05',
    source: 'pkkq-daitu',
    sourceRef: 'DT-2025-007',
    recordedBy: 'Kỹ thuật viên Nguyễn Đình Khoa',
    confirmedBy: 'Trưởng nhóm Vũ Tiến Dũng',
    confirmedAt: '2025-04-08',
    status: 'pending_update',
    notes: 'Phiên bản thiết kế V5.1 đang chờ phê duyệt. Sau khi V5.1 được duyệt sẽ đối chiếu lại.',
    components: [
      { name: 'Phạm vi vận hành tối đa', code: 'MAX-RNG', group: 'Tính năng vận hành', designValue: '34', actualValue: '34', unit: 'km', isDeviated: false },
      { name: 'Trần vận hành', code: 'MAX-ALT', group: 'Tính năng vận hành', designValue: '25', actualValue: '25', unit: 'km', isDeviated: false },
      { name: 'Tốc độ phản hồi', code: 'SPEED', group: 'Tính năng vận hành', designValue: '3.5', actualValue: '3.4', unit: 'Mach', isDeviated: false },
      { name: 'Hệ thống dẫn hướng', code: 'GUID-SYS', group: 'Điện tử', designValue: 'SARH Nâng cấp', actualValue: 'SARH Nâng cấp', unit: '', isDeviated: false },
      { name: 'Phần mềm điều khiển', code: 'SW-VER', group: 'Điện tử', designValue: 'v5.1-RC', actualValue: 'v5.0', unit: '', isDeviated: true, deviationNote: 'Chờ cập nhật lên v5.1 sau khi phiên bản thiết kế được duyệt' },
    ],
  },

  // ── EQ005 S-75 SH002 — lệch thông số ────────────────────────────────────────
  {
    id: 'AC005',
    equipmentId: 'EQ005',
    equipmentCode: 'MISSILE-001',
    equipmentName: 'Module S-75 (Dvina)',
    serialNumber: 'S75-SH002',
    designVersionRef: 'MISSILE-001-v5.0',
    recordedAt: '2025-02-20',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2025-043',
    recordedBy: 'Kỹ thuật viên Trịnh Văn Nam',
    confirmedBy: 'Trưởng nhóm Vũ Tiến Dũng',
    confirmedAt: '2025-02-22',
    status: 'deviated',
    notes: 'Bộ triển khai thủy lực thay thế bằng linh kiện tương đương do hết hàng chính hãng.',
    components: [
      { name: 'Phạm vi vận hành tối đa', code: 'MAX-RNG', group: 'Tính năng vận hành', designValue: '34', actualValue: '34', unit: 'km', isDeviated: false },
      { name: 'Trần vận hành', code: 'MAX-ALT', group: 'Tính năng vận hành', designValue: '25', actualValue: '25', unit: 'km', isDeviated: false },
      { name: 'Bộ triển khai thủy lực', code: 'HYD-LAUNCH', group: 'Cơ khí triển khai', designValue: 'Type A-75M OEM', actualValue: 'Type A-75M Tương đương (Beta)', unit: '', isDeviated: true, deviationNote: 'Thay thế bằng linh kiện do Trung tâm phần mềm Beta sản xuất, đã kiểm định đạt tiêu chuẩn',
        deviationHandling: { action: 'accepted', handledBy: 'Phạm Quốc Hưng', handledAt: '2025-02-25', reason: 'Linh kiện tương đương do Trung tâm phần mềm Beta sản xuất đã qua kiểm định kỹ thuật, đạt toàn bộ thông số yêu cầu. Chấp nhận thay thế vĩnh viễn do nguồn OEM không còn cung cấp.' } },
      { name: 'Áp suất thủy lực', code: 'HYD-PRESS', group: 'Cơ khí triển khai', designValue: '210', actualValue: '208', unit: 'bar', isDeviated: false },
    ],
  },

  // ── EQ007 S-125 SH001 — chưa ghi nhận ──────────────────────────────────────
  {
    id: 'AC006',
    equipmentId: 'EQ007',
    equipmentCode: 'MISSILE-003',
    equipmentName: 'Module S-125 (Pechora)',
    serialNumber: 'S125-SH001',
    designVersionRef: 'MISSILE-003-v1.0',
    recordedAt: '2024-11-30',
    source: 'manual',
    recordedBy: 'Kỹ thuật viên Cao Xuân Trường',
    status: 'unrecorded',
    notes: 'Hồ sơ nhập kho đầu vào. Chưa qua kiểm định kỹ thuật chi tiết.',
    components: [
      { name: 'Phạm vi vận hành', code: 'MAX-RNG', group: 'Tính năng vận hành', designValue: '25', actualValue: '—', unit: 'km', isDeviated: false },
      { name: 'Trần vận hành', code: 'MAX-ALT', group: 'Tính năng vận hành', designValue: '18', actualValue: '—', unit: 'km', isDeviated: false },
      { name: 'Số kênh xử lý', code: 'FIRE-CH', group: 'Khả năng vận hành', designValue: '2', actualValue: '—', unit: 'kênh', isDeviated: false },
    ],
  },

  // ── EQ009 ST-68 SH001 — khớp thiết kế ────────────────────────────────
  {
    id: 'AC007',
    equipmentId: 'EQ009',
    equipmentCode: 'RADAR-005',
    equipmentName: 'Hệ thống ST-68 (Đo cao)',
    serialNumber: 'ST68-SH001',
    designVersionRef: 'RADAR-005-v1.0',
    recordedAt: '2025-05-18',
    source: 'pkkq-suachua',
    sourceRef: 'SC-2025-056',
    recordedBy: 'Kỹ thuật viên Bùi Thế Hùng',
    confirmedBy: 'Trưởng nhóm Hoàng Minh Tuấn',
    confirmedAt: '2025-05-20',
    status: 'synced',
    notes: 'Tất cả thông số kỹ thuật đạt chuẩn thiết kế sau khắc phục.',
    components: [
      { name: 'Băng tần hoạt động', code: 'FREQ-BAND', group: 'Hệ thống RF', designValue: 'E', actualValue: 'E', unit: 'Band', isDeviated: false },
      { name: 'Độ chính xác đo cao', code: 'ALT-ACC', group: 'Hiệu năng', designValue: '500', actualValue: '480', unit: 'm', isDeviated: false },
      { name: 'Tầm phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '400', actualValue: '405', unit: 'km', isDeviated: false },
    ],
  },

  // ── EQ010 Thiết bị giám sát SH001 — lệch thông số ────────────────────
  {
    id: 'AC008',
    equipmentId: 'EQ010',
    equipmentCode: 'ELEC-001',
    equipmentName: 'Thiết bị giám sát kỹ thuật số',
    serialNumber: 'OSC-SH001',
    designVersionRef: 'ELEC-001-v1.0',
    recordedAt: '2025-07-12',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2025-201',
    recordedBy: 'Kỹ sư Đặng Văn Khánh',
    confirmedBy: 'Kỹ sư Phạm Thanh Hà',
    confirmedAt: '2025-07-14',
    status: 'deviated',
    notes: 'Thăm dò kênh CH3 bị nhiễu ở tần số > 150 MHz. Đề nghị hiệu chuẩn lại.',
    components: [
      { name: 'Băng thông kênh', code: 'BW-CH', group: 'Thông số kỹ thuật', designValue: '200', actualValue: '200', unit: 'MHz', isDeviated: false },
      { name: 'Số kênh đo', code: 'NUM-CH', group: 'Thông số kỹ thuật', designValue: '4', actualValue: '4', unit: 'kênh', isDeviated: false },
      { name: 'Độ phân giải dọc', code: 'V-RES', group: 'Thông số kỹ thuật', designValue: '8', actualValue: '8', unit: 'bit', isDeviated: false },
      { name: 'Nhiễu kênh CH3 (>150MHz)', code: 'NOISE-CH3', group: 'Chất lượng tín hiệu', designValue: '< -60', actualValue: '-48', unit: 'dBc', isDeviated: true, deviationNote: 'Vượt ngưỡng nhiễu cho phép tại tần số cao',
        deviationHandling: { action: 'repair_requested', handledBy: 'Kỹ sư Đặng Văn Khánh', handledAt: '2025-07-14', reason: 'Nghi ngờ tụ lọc nhiễu RF bị lão hóa. Yêu cầu bảo trì hiệu chuẩn lại kênh CH3.', linkedModule: 'pkkq-baotri', linkedRef: 'BT-2025-208' } },
    ],
  },

  // ── EQ003 P-37 SH001 — khớp thiết kế ────────────────────────────────────────
  {
    id: 'AC009',
    equipmentId: 'EQ003',
    equipmentCode: 'RADAR-003',
    equipmentName: 'Hệ thống P-37 (Dẫn hướng)',
    serialNumber: 'P37-SH001',
    designVersionRef: 'RADAR-003-v2.0',
    recordedAt: '2025-08-01',
    source: 'pkkq-daitu',
    sourceRef: 'DT-2025-011',
    recordedBy: 'Kỹ thuật viên Ngô Quang Hải',
    confirmedBy: 'Trưởng nhóm Trần Đức Minh',
    confirmedAt: '2025-08-03',
    status: 'synced',
    notes: 'Ghi nhận sau nâng cấp định kỳ tháng 7-8/2025.',
    components: [
      { name: 'Công suất phát', code: 'TX-PWR', group: 'Hệ thống phát', designValue: '800', actualValue: '798', unit: 'kW', isDeviated: false },
      { name: 'Tần số băng P', code: 'TX-FREQ', group: 'Hệ thống phát', designValue: '155~175', actualValue: '155~175', unit: 'MHz', isDeviated: false },
      { name: 'Tầm phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '500', actualValue: '495', unit: 'km', isDeviated: false },
      { name: 'Số đối tượng theo dõi', code: 'TRK-TGT', group: 'Hiệu năng', designValue: '40', actualValue: '40', unit: 'đối tượng', isDeviated: false },
    ],
  },

  // ── EQ006 Pechora SH002 — chờ cập nhật ──────────────────────────────────────
  {
    id: 'AC010',
    equipmentId: 'EQ006',
    equipmentCode: 'MISSILE-002',
    equipmentName: 'Module SA-3 (Goa)',
    serialNumber: 'SA3-SH002',
    designVersionRef: 'MISSILE-002-v3.0',
    recordedAt: '2025-09-15',
    source: 'pkkq-suachua',
    sourceRef: 'SC-2025-112',
    recordedBy: 'Kỹ thuật viên Lý Hoàng Nam',
    status: 'pending_update',
    notes: 'Phiên bản cấu hình thực tế cần xác nhận từ phòng kỹ thuật trước khi chốt.',
    components: [
      { name: 'Đầu xử lý', code: 'WARHEAD', group: 'Sản phẩm', designValue: '60 kg phân mảnh', actualValue: '60 kg phân mảnh', unit: '', isDeviated: false },
      { name: 'Hệ thống điều khiển', code: 'FCS', group: 'Điện tử', designValue: 'RSNA-75M3', actualValue: 'RSNA-75M3', unit: '', isDeviated: false },
      { name: 'Tốc độ phản hồi', code: 'SPEED', group: 'Tính năng', designValue: '2.5', actualValue: '2.5', unit: 'Mach', isDeviated: false },
    ],
  },

  // ── EQ001 P-18 SH001 — lịch sử: lần ghi nhận cũ hơn (2023) ────────────────
  {
    id: 'AC011',
    equipmentId: 'EQ001',
    equipmentCode: 'RADAR-001',
    equipmentName: 'Hệ thống P-18 (Monitoring)',
    serialNumber: 'P18-SH001',
    designVersionRef: 'RADAR-001-v2.0',
    recordedAt: '2023-08-20',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2023-076',
    recordedBy: 'Kỹ thuật viên Lê Hữu Bình',
    confirmedBy: 'Trưởng nhóm Trần Đức Minh',
    confirmedAt: '2023-08-22',
    status: 'deviated',
    notes: 'Phát hiện công suất phát giảm sau đợt bảo trì tháng 8/2023. Lên kế hoạch nâng cấp.',
    components: [
      { name: 'Công suất phát xạ', code: 'TX-PWR', group: 'Hệ thống phát', designValue: '160', actualValue: '151', unit: 'kW', isDeviated: true, deviationNote: 'Giảm 5.6%, cần kiểm tra bộ khuếch đại' },
      { name: 'Tần số trung tâm', code: 'TX-FREQ', group: 'Hệ thống phát', designValue: '170', actualValue: '170', unit: 'MHz', isDeviated: false },
      { name: 'Độ nhạy máy thu', code: 'RX-SENS', group: 'Hệ thống thu', designValue: '-108', actualValue: '-106', unit: 'dBm', isDeviated: false },
      { name: 'Tốc độ quay anten', code: 'ANT-RPM', group: 'Anten', designValue: '6', actualValue: '6', unit: 'vòng/phút', isDeviated: false },
      { name: 'Cự ly phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '250', actualValue: '240', unit: 'km', isDeviated: true, deviationNote: 'Giảm do công suất phát thấp' },
    ],
  },

  // ── EQ001 P-18 SH001 — lịch sử: lần ghi nhận ban đầu (2021) ────────────────
  {
    id: 'AC012',
    equipmentId: 'EQ001',
    equipmentCode: 'RADAR-001',
    equipmentName: 'Hệ thống P-18 (Monitoring)',
    serialNumber: 'P18-SH001',
    designVersionRef: 'RADAR-001-v2.0',
    recordedAt: '2021-04-10',
    source: 'manual',
    recordedBy: 'Kỹ thuật viên Nguyễn Văn Thắng',
    confirmedBy: 'Trưởng nhóm Hoàng Minh Tuấn',
    confirmedAt: '2021-04-12',
    status: 'synced',
    notes: 'Ghi nhận ban đầu khi nhận bàn giao thiết bị từ Phòng vận hành 261.',
    components: [
      { name: 'Công suất phát xạ', code: 'TX-PWR', group: 'Hệ thống phát', designValue: '160', actualValue: '160', unit: 'kW', isDeviated: false },
      { name: 'Tần số trung tâm', code: 'TX-FREQ', group: 'Hệ thống phát', designValue: '170', actualValue: '170', unit: 'MHz', isDeviated: false },
      { name: 'Độ nhạy máy thu', code: 'RX-SENS', group: 'Hệ thống thu', designValue: '-108', actualValue: '-108', unit: 'dBm', isDeviated: false },
      { name: 'Tốc độ quay anten', code: 'ANT-RPM', group: 'Anten', designValue: '6', actualValue: '6', unit: 'vòng/phút', isDeviated: false },
      { name: 'Cự ly phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '250', actualValue: '250', unit: 'km', isDeviated: false },
    ],
  },

  // ── EQ005 S-75 SH001 — lịch sử: lần ghi nhận trước (2023) ──────────────────
  {
    id: 'AC013',
    equipmentId: 'EQ005',
    equipmentCode: 'MISSILE-001',
    equipmentName: 'Module S-75 (Dvina)',
    serialNumber: 'S75-SH001',
    designVersionRef: 'MISSILE-001-v4.0',
    recordedAt: '2023-06-15',
    source: 'pkkq-suachua',
    sourceRef: 'SC-2023-055',
    recordedBy: 'Kỹ thuật viên Nguyễn Đình Khoa',
    confirmedBy: 'Trưởng nhóm Vũ Tiến Dũng',
    confirmedAt: '2023-06-17',
    status: 'synced',
    notes: 'Ghi nhận sau khắc phục định kỳ. Tất cả thông số trong giới hạn cho phép.',
    components: [
      { name: 'Phạm vi vận hành tối đa', code: 'MAX-RNG', group: 'Tính năng vận hành', designValue: '34', actualValue: '34', unit: 'km', isDeviated: false },
      { name: 'Trần vận hành', code: 'MAX-ALT', group: 'Tính năng vận hành', designValue: '25', actualValue: '25', unit: 'km', isDeviated: false },
      { name: 'Tốc độ phản hồi', code: 'SPEED', group: 'Tính năng vận hành', designValue: '3.5', actualValue: '3.5', unit: 'Mach', isDeviated: false },
      { name: 'Hệ thống dẫn hướng', code: 'GUID-SYS', group: 'Điện tử', designValue: 'SARH Nâng cấp', actualValue: 'SARH Nâng cấp', unit: '', isDeviated: false },
      { name: 'Phần mềm điều khiển', code: 'SW-VER', group: 'Điện tử', designValue: 'v4.2', actualValue: 'v4.2', unit: '', isDeviated: false },
    ],
  },

  // ── EQ001 P-18 SH002 — lịch sử: lần ghi nhận trước (2023) ──────────────────
  {
    id: 'AC014',
    equipmentId: 'EQ001',
    equipmentCode: 'RADAR-001',
    equipmentName: 'Hệ thống P-18 (Monitoring)',
    serialNumber: 'P18-SH002',
    designVersionRef: 'RADAR-001-v2.0',
    recordedAt: '2023-11-05',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2023-142',
    recordedBy: 'Kỹ thuật viên Lê Hữu Bình',
    confirmedBy: 'Trưởng nhóm Trần Đức Minh',
    confirmedAt: '2023-11-07',
    status: 'synced',
    notes: 'Ghi nhận sau bảo trì định kỳ quý 4/2023. Thông số ổn định.',
    components: [
      { name: 'Công suất phát xạ', code: 'TX-PWR', group: 'Hệ thống phát', designValue: '160', actualValue: '158', unit: 'kW', isDeviated: false },
      { name: 'Tần số trung tâm', code: 'TX-FREQ', group: 'Hệ thống phát', designValue: '170', actualValue: '170', unit: 'MHz', isDeviated: false },
      { name: 'Độ nhạy máy thu', code: 'RX-SENS', group: 'Hệ thống thu', designValue: '-108', actualValue: '-107', unit: 'dBm', isDeviated: false },
      { name: 'Tốc độ quay anten', code: 'ANT-RPM', group: 'Anten', designValue: '6', actualValue: '6', unit: 'vòng/phút', isDeviated: false },
      { name: 'Cự ly phát hiện', code: 'DET-RNG', group: 'Hiệu năng', designValue: '250', actualValue: '248', unit: 'km', isDeviated: false },
    ],
  },
];

// Trả về tất cả bản ghi của 1 serial (sắp xếp mới nhất trước)
export function getHistoryBySerial(serialNumber: string): ActualConfiguration[] {
  return actualConfigurations
    .filter(a => a.serialNumber === serialNumber)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

// Trả về bản ghi mới nhất của mỗi serial number (dùng cho danh sách)
export function getLatestBySerial(): ActualConfiguration[] {
  const map = new Map<string, ActualConfiguration>();
  actualConfigurations
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .forEach(a => { if (!map.has(a.serialNumber)) map.set(a.serialNumber, a); });
  return [...map.values()];
}

export function getActualConfigsByEquipment(equipmentId: string): ActualConfiguration[] {
  return getLatestBySerial().filter(a => a.equipmentId === equipmentId);
}

export function getActualConfigBySerial(serial: string): ActualConfiguration | undefined {
  return getLatestBySerial().find(a => a.serialNumber === serial);
}
