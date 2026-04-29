import type { ChangeRequest } from '../types';

const changeRequests: ChangeRequest[] = [
  // ── 1. Draft ────────────────────────────────────────────────────────────────
  {
    id: 'CR001',
    code: 'YCT-2026-001',
    title: 'Nâng cấp bộ lọc nhiễu thụ động cho Hệ thống P-18',
    equipmentId: 'EQ001',
    equipmentCode: 'RD-P18-261-01',
    equipmentName: 'Hệ thống Monitoring P-18',
    description:
      'Đề xuất nâng cấp bộ lọc nhiễu thụ động CFAR từ phiên bản v2.3 lên v3.0 nhằm cải thiện khả năng phát hiện đối tượng mức thấp trong điều kiện nhiễu nền mạnh.',
    reason:
      'Trong quá trình vận hành tại địa hình đồi núi, tỷ lệ báo động giả hiện đạt 12%, vượt ngưỡng cho phép 5%. Cần nâng cấp thuật toán lọc để đảm bảo hiệu quả vận hành.',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2026-0041',
    requestedBy: 'Nguyễn Văn Hải',
    requestedDept: 'TT Monitoring (TT1)',
    requestedAt: '2026-04-10',
    priority: 'high',
    status: 'draft',
    affectedSerials: ['P18-SH001', 'P18-SH002'],
  },

  // ── 2. Draft ────────────────────────────────────────────────────────────────
  {
    id: 'CR002',
    code: 'YCT-2026-002',
    title: 'Thay thế đèn magnetron dự phòng Hệ thống P-37',
    equipmentId: 'EQ003',
    equipmentCode: 'RD-P37-363-01',
    equipmentName: 'Hệ thống dẫn hướng P-37',
    description:
      'Thay thế 02 đèn magnetron MI-244A đã đến giới hạn tuổi thọ 3.000 giờ phát sóng. Linh kiện thay thế dự kiến lấy từ nguồn tồn kho của Trung tâm phần mềm Beta.',
    reason:
      'Đèn magnetron MI-244A số hiệu SN-2019-0034 và SN-2019-0037 đã đạt 2.950 giờ phát sóng, tiếp cận giới hạn thiết kế 3.000 giờ. Nếu không thay thế kịp thời sẽ ảnh hưởng đến khả năng vận hành liên tục.',
    source: 'internal',
    requestedBy: 'Vũ Đình Long',
    requestedDept: 'Phòng Kỹ thuật (PKT)',
    requestedAt: '2026-04-12',
    priority: 'medium',
    status: 'draft',
    affectedSerials: ['P37-SH001'],
  },

  // ── 3. Submitted ─────────────────────────────────────────────────────────────
  {
    id: 'CR003',
    code: 'YCT-2026-003',
    title: 'Cập nhật phần mềm điều khiển vận hành S-75 lên phiên bản 5.1',
    equipmentId: 'EQ005',
    equipmentCode: 'TL-S75-261-01',
    equipmentName: 'Module sản phẩm S-75M3 Dvina',
    description:
      'Cập nhật phần mềm điều khiển vận hành từ phiên bản 5.0 lên 5.1 nhằm vá các lỗi giao tiếp với màn hình LCD 15" mới tích hợp và cải thiện tốc độ tính toán.',
    reason:
      'Phiên bản 5.0 đang gặp lỗi hiển thị thông số khi màn hình LCD hoạt động ở chế độ độ sáng cao. Trung tâm phần mềm Gamma đã phát hành bản vá 5.1 khắc phục vấn đề này.',
    source: 'pkkq-sanxuat',
    sourceRef: 'SX-2026-0015',
    requestedBy: 'Đinh Văn Sơn',
    requestedDept: 'TT Sản phẩm (TT2)',
    requestedAt: '2026-03-25',
    priority: 'high',
    status: 'submitted',
    affectedSerials: ['S75-SH001', 'S75-SH002', 'S75-SH003'],
    proposedSolution:
      'Tải phần mềm v5.1 từ Trung tâm phần mềm Gamma, tiến hành cài đặt và kiểm thử trên thiết bị mô phỏng trước khi triển khai thực tế. Dự kiến thời gian thực hiện 2 ngày.',
  },

  // ── 4. Submitted ─────────────────────────────────────────────────────────────
  {
    id: 'CR004',
    code: 'YCT-2026-004',
    title: 'Thay thế module nguồn cao áp BP-100R cho Hệ thống S-125',
    equipmentId: 'EQ007',
    equipmentCode: 'TL-S125-367-01',
    equipmentName: 'Module sản phẩm S-125M Pechora',
    description:
      'Module nguồn cao áp BP-100R đã xuất hiện dấu hiệu suy giảm điện áp đầu ra, ảnh hưởng đến hiệu suất ăng ten chiếu xạ Low Blow. Đề xuất thay thế bằng module mới từ lô nhập tháng 3/2026.',
    reason:
      'Điện áp đầu ra module BP-100R đo được là 18.2 kV, thấp hơn 10% so với giá trị thiết kế 20.0 kV. Biên độ sai số vượt ngưỡng cho phép theo tiêu chuẩn kỹ thuật doanh nghiệp.',
    source: 'pkkq-suachua',
    sourceRef: 'SC-2026-0088',
    requestedBy: 'Trần Quang Minh',
    requestedDept: 'TT Tích hợp (TT4)',
    requestedAt: '2026-04-01',
    priority: 'critical',
    status: 'submitted',
    affectedSerials: ['S125-SH001'],
  },

  // ── 5. Under review ──────────────────────────────────────────────────────────
  {
    id: 'CR005',
    code: 'YCT-2025-009',
    title: 'Nâng cấp bộ xử lý tín hiệu số DSP cho Hệ thống 36D6',
    equipmentId: 'EQ002',
    equipmentCode: 'RD-36D6-361-01',
    equipmentName: 'Hệ thống phát hiện 36D6',
    description:
      'Thay thế bộ xử lý tín hiệu số DSP TMS320C40 (sản xuất 1994) bằng DSP TMS320C6713 thế hệ mới. Đây là bộ xử lý tương thích, cho phép nâng cấp các thuật toán phát hiện không cần thay đổi cơ học.',
    reason:
      'DSP TMS320C40 hiện tại đã sản xuất 30 năm, linh kiện thay thế ngày càng khan hiếm. Tốc độ xử lý 40 MFLOPS không đủ để chạy các thuật toán phát hiện đối tượng phức tạp thế hệ mới.',
    source: 'pkkq-daitu',
    sourceRef: 'DT-2025-0023',
    requestedBy: 'Phạm Minh Khoa',
    requestedDept: 'Phòng Kỹ thuật (PKT)',
    requestedAt: '2025-11-20',
    priority: 'high',
    status: 'under_review',
    affectedSerials: ['36D6-SH001', '36D6-SH002'],
    impactAnalysis:
      'Việc thay thế DSP sẽ yêu cầu viết lại 30% module phần mềm xử lý. Thời gian downtime ước tính 5-7 ngày làm việc. Ảnh hưởng đến khả năng vận hành liên tục của Phòng vận hành 261 trong giai đoạn nâng cấp. Cần điều phối với đơn vị sử dụng để bố trí thời điểm phù hợp.',
    proposedSolution:
      'Phối hợp với Viện KH-CN để thực hiện port phần mềm. Lên kế hoạch nâng cấp trong đợt bảo trì định kỳ tháng 6/2026 để giảm thiểu ảnh hưởng hoạt động.',
    reviewedBy: 'Trần Đức Thắng',
    reviewedAt: '2025-12-05',
  },

  // ── 6. Approved ─────────────────────────────────────────────────────────────
  {
    id: 'CR006',
    code: 'YCT-2025-007',
    title: 'Nâng cấp module thu phát RF Gen3 cho Hệ thống P-18',
    equipmentId: 'EQ001',
    equipmentCode: 'RD-P18-261-01',
    equipmentName: 'Hệ thống Monitoring P-18',
    description:
      'Thay thế toàn bộ module thu phát tần số từ Gen2 lên Gen3, đồng thời nâng cấp bộ xử lý tín hiệu số DSP TMS320C40 lên TMS320C6713 và tăng dung lượng RAM xử lý từ 64MB lên 256MB.',
    reason:
      'Module thu phát RF Gen2 đã hoạt động liên tục 14 năm, độ nhạy thu suy giảm 8% so với thông số thiết kế. Đây là nguyên nhân chính dẫn đến tỷ lệ phát hiện đối tượng giảm trong điều kiện thời tiết xấu.',
    source: 'pkkq-daitu',
    sourceRef: 'DT-2025-0019',
    requestedBy: 'Nguyễn Văn Hải',
    requestedDept: 'TT Monitoring (TT1)',
    requestedAt: '2025-12-01',
    priority: 'critical',
    status: 'approved',
    affectedSerials: ['P18-SH001'],
    impactAnalysis:
      'Nâng cấp sẽ cải thiện độ nhạy thu thêm 15%, giảm tỷ lệ bỏ sót đối tượng. Thời gian thực hiện 10 ngày làm việc trong đợt nâng cấp.',
    proposedSolution:
      'Mua module RF Gen3 từ đối tác Tektronix Việt Nam. Thực hiện nâng cấp tại TT1 trong đợt nâng cấp lần 3 (tháng 2/2026).',
    reviewedBy: 'Trần Đức Thắng',
    reviewedAt: '2025-12-15',
    approvedBy: 'Phạm Quốc Hưng',
    approvedAt: '2025-12-20',
    linkedConfigId: 'CF001',
    reviewNotes:
      'Yêu cầu hợp lý, cần thiết để đảm bảo khả năng vận hành. Phê duyệt thực hiện trong đợt nâng cấp tháng 2/2026. Lưu ý phối hợp với phòng QA kiểm tra sau nâng cấp.',
  },

  // ── 7. Rejected ─────────────────────────────────────────────────────────────
  {
    id: 'CR007',
    code: 'YCT-2025-005',
    title: 'Tích hợp màn hình hiển thị tình huống kỹ thuật số cho P-37',
    equipmentId: 'EQ003',
    equipmentCode: 'RD-P37-363-01',
    equipmentName: 'Hệ thống dẫn hướng P-37',
    description:
      'Đề xuất tích hợp thêm màn hình hiển thị tình huống dạng kỹ thuật số 24 inch để thay thế màn hình CRT đơn sắc hiện tại, kết nối qua giao thức Ethernet.',
    reason:
      'Màn hình CRT hiện tại khó hiệu chỉnh, tiêu tốn nhiều điện năng và không hỗ trợ hiển thị màu sắc cần thiết cho phân biệt đối tượng theo độ cao.',
    source: 'pkkq-suachua',
    sourceRef: 'SC-2025-0064',
    requestedBy: 'Vũ Đình Long',
    requestedDept: 'TT Tích hợp (TT4)',
    requestedAt: '2025-09-10',
    priority: 'medium',
    status: 'rejected',
    reviewedBy: 'Trần Đức Thắng',
    reviewedAt: '2025-09-25',
    approvedBy: 'Phạm Quốc Hưng',
    approvedAt: '2025-09-30',
    reviewNotes:
      'Đề xuất bị từ chối do: (1) Giao thức Ethernet không tương thích với hệ thống bus nội bộ RS-485 hiện tại của P-37, cần phát triển thêm lớp chuyển đổi giao thức tốn kém; (2) Thay đổi này không có trong kế hoạch nâng cấp đã phê duyệt; (3) Ngân sách năm 2025 không đủ. Đề nghị lập lại đề xuất trong kế hoạch nâng cấp năm 2027 kèm phân tích kinh phí đầy đủ.',
  },

  // ── 8. Implemented ──────────────────────────────────────────────────────────
  {
    id: 'CR008',
    code: 'YCT-2025-003',
    title: 'Cập nhật phần mềm mã hóa Gamma-SW lên phiên bản 2.5',
    equipmentId: 'EQ010',
    equipmentCode: 'DT-HP5350-PKT-01',
    equipmentName: 'Thiết bị giám sát kỹ thuật số',
    description:
      'Thay thế phần mềm hiệu chuẩn nội bộ của thiết bị giám sát từ phiên bản 2.3 lên 2.5, đồng thời nâng cấp module giao tiếp USB 2.0 lên USB 3.0 để tăng tốc độ truyền dữ liệu.',
    reason:
      'Phiên bản 2.3 bị lỗi khi đọc dữ liệu từ thiết bị đo hiện đại (tần số lấy mẫu > 500 MHz). Phiên bản 2.5 đã vá lỗi này theo khuyến nghị của nhà sản xuất Tektronix.',
    source: 'internal',
    requestedBy: 'Nguyễn Thị Thúy',
    requestedDept: 'Phòng Kỹ thuật (PKT)',
    requestedAt: '2025-07-15',
    priority: 'low',
    status: 'implemented',
    reviewedBy: 'Trần Đức Thắng',
    reviewedAt: '2025-07-22',
    approvedBy: 'Trần Đức Thắng',
    approvedAt: '2025-07-25',
    implementedAt: '2025-08-05',
    implementedBy: 'Nguyễn Thị Thúy',
    reviewNotes: 'Phê duyệt. Thay đổi nhỏ, rủi ro thấp, không ảnh hưởng đến thiết bị khác.',
    postChangeNote:
      'Đã cập nhật thành công. Phần mềm v2.5 hoạt động ổn định, tốc độ đọc dữ liệu tăng 3 lần. Đã thực hiện kiểm tra so sánh với chuẩn đo lường quốc gia, kết quả đạt yêu cầu.',
  },

  // ── 9. Implemented ──────────────────────────────────────────────────────────
  {
    id: 'CR009',
    code: 'YCT-2025-006',
    title: 'Cải tạo hệ thống điều hòa và chống ẩm cabin điều hành S-75',
    equipmentId: 'EQ005',
    equipmentCode: 'TL-S75-261-01',
    equipmentName: 'Module sản phẩm S-75M3 Dvina',
    description:
      'Lắp đặt hệ thống điều hòa không khí DC-24V 1.5 kW thay thế hệ thống quạt thông gió thủ công cũ, đồng thời thay toàn bộ vật liệu chống ẩm cabin bằng polyurethane thế hệ mới.',
    reason:
      'Nhiệt độ cabin điều hành vào mùa hè lên tới 42°C, vượt ngưỡng hoạt động an toàn (35°C) của các thiết bị điện tử. Độ ẩm cao gây oxy hóa các tiếp điểm điện, làm tăng tỷ lệ hỏng hóc linh kiện.',
    source: 'pkkq-baotri',
    sourceRef: 'BT-2025-0077',
    requestedBy: 'Đinh Văn Sơn',
    requestedDept: 'TT Sản phẩm (TT2)',
    requestedAt: '2025-10-05',
    priority: 'high',
    status: 'implemented',
    affectedSerials: ['S75-SH001', 'S75-SH002'],
    impactAnalysis:
      'Việc cải tạo sẽ yêu cầu tháo dỡ và lắp lại toàn bộ vỏ cabin, thời gian dự kiến 3 ngày. Trong thời gian này thiết bị không sẵn sàng hoạt động.',
    proposedSolution:
      'Thực hiện trong đợt bảo trì định kỳ tháng 11/2025. Trung tâm TT3 phụ trách thi công cơ khí, TT4 phụ trách lắp đặt điện.',
    reviewedBy: 'Trần Đức Thắng',
    reviewedAt: '2025-10-15',
    approvedBy: 'Phạm Quốc Hưng',
    approvedAt: '2025-10-20',
    linkedConfigId: 'CF009',
    implementedAt: '2025-11-18',
    implementedBy: 'Đinh Văn Sơn',
    reviewNotes: 'Phê duyệt. Cần thiết để đảm bảo tuổi thọ linh kiện điện tử. Thực hiện theo kế hoạch bảo trì tháng 11.',
    postChangeNote:
      'Hoàn thành cải tạo ngày 18/11/2025. Nhiệt độ cabin sau cải tạo đo được 28°C trong điều kiện ngoài trời 38°C, đạt yêu cầu kỹ thuật. Độ ẩm duy trì dưới 60%. Hệ thống điện tử hoạt động ổn định sau 30 ngày vận hành thử.',
  },
];

export { changeRequests };

export function getChangeRequestsByEquipment(equipmentId: string): ChangeRequest[] {
  return changeRequests.filter(cr => cr.equipmentId === equipmentId);
}

export function getPendingChangeRequests(): ChangeRequest[] {
  return changeRequests.filter(
    cr => cr.status === 'submitted' || cr.status === 'under_review',
  );
}
