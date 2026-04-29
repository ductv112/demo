import type { DisassemblyRecord } from '../types';

export const disassemblies: DisassemblyRecord[] = [

  // ── DIS-001: Hoàn thành đầy đủ — dữ liệu mẫu tất cả 6 bước ─────────────
  {
    id: 'DIS-001', orderId: 'WO-001', equipmentName: 'Hệ thống monitoring P-37',
    startDate: '2025-11-18', endDate: '2025-11-21',
    performedBy: 'Nhóm tháo rã PX1 — KTV Nguyễn Văn An (trưởng nhóm), KTV Trần Hữu Bình, KTV Lê Quang Dũng',
    totalComponents: 42, status: 'completed',
    notes: 'Phát hiện 3 bu lông bị gãy tại vị trí R3-B7, đã xử lý bằng đầu tháo chuyên dụng. Tất cả cấu phần đã được đánh dấu và giao nhận đầy đủ.',
    // Bước 1: Chuẩn bị
    receivedOrderDate: '2025-11-17',
    technicalDocuments: [
      'Sơ đồ cấu tạo hệ thống monitoring P-37 (Bản A3 — Alpha-P37-2024)',
      'Hướng dẫn tháo rã theo HDSD-P37-Alpha-2024 (Rev.3)',
      'Danh mục cấu phần theo lệnh đại tu WO-001',
      'Phiếu kiểm tra tình trạng trước khi tháo rã',
      'Bản vẽ kỹ thuật hệ thống anten và cơ cấu quay',
    ],
    toolsRequired: [
      'Bộ cờ-lê vòng 8–36 mm (3 bộ)',
      'Tuốc-nơ-vít điện đa năng và bộ cơ',
      'Máy đo điện vạn năng Fluke 287',
      'Giá đỡ chuyên dụng hệ thống anten P-37',
      'Thùng nhựa phân loại có nắp và nhãn dán (20 thùng)',
      'Đầu tháo bu lông gãy chuyên dụng',
    ],
    workAreaNotes: 'Khu vực PX1 – Khoang A đã chuẩn bị: sạch sẽ, thông thoáng, đèn chiếu sáng đủ cường độ 500 lux. Thảm chống tĩnh điện đã trải. Hệ thống nâng hạ 2 tấn sẵn sàng. Khu vực phân loại cấu phần được bố trí riêng biệt.',
    // Bước 2: Tháo rã
    disassemblySequence: 'Bước 1: Cắt nguồn điện và kiểm tra an toàn → Bước 2: Tháo hệ thống nguồn điện phụ → Bước 3: Tháo hệ thống làm mát → Bước 4: Tháo các module điện tử → Bước 5: Tháo hệ thống thu tín hiệu → Bước 6: Tháo cụm truyền nhận (Magnetron) → Bước 7: Tháo cơ cấu quay anten → Bước 8: Tháo khung bệ và cấu kiện cơ khí',
    disassemblyMethodNote: 'Tuân thủ nghiêm quy trình HDSD-P37-Alpha-2024. Bu lông gãy tại R3-B7 xử lý bằng đầu tháo chuyên dụng, không ảnh hưởng ren. Đánh dấu vị trí lắp và hướng trước khi tháo từng cụm. Chụp ảnh ghi lại trạng thái trước/sau tháo.',
    // Bước 6: Chuẩn bị kiểm tra
    readyForInspectionDate: '2025-11-22',
    inspectionGroupingNotes: 'Nhóm 1 — Điện tử (8 cấu phần): gửi Phòng KT kiểm tra chuyên sâu. Nhóm 2 — Cơ khí anten (6 cấu phần): kiểm tra tại PX1. Nhóm 3 — Vật tư tiêu hao (12 cấu phần): thay mới toàn bộ không kiểm tra. Nhóm 4 — Cấu kiện còn lại (16 cấu phần): kiểm tra nhanh tại chỗ.',
  },

  // ── DIS-002: Hoàn thành ───────────────────────────────────────────────────
  {
    id: 'DIS-002', orderId: 'WO-002', equipmentName: 'Hệ thống monitoring 36D6',
    startDate: '2026-01-05', endDate: '2026-01-08',
    performedBy: 'Nhóm tháo rã PX1 — KTV Trần Bá Thành (trưởng nhóm), KTV Phạm Văn Hải',
    totalComponents: 56, status: 'completed',
    notes: 'Tháo rã các cụm phát thu, làm mát. Phát hiện rò rỉ dầu tại bơm làm mát.',
    receivedOrderDate: '2026-01-04',
    technicalDocuments: [
      'Tài liệu kỹ thuật hệ thống 36D6 (HDSD-36D6-Alpha)',
      'Sơ đồ phân hệ phát-thu và làm mát',
      'Danh mục cấu phần lệnh WO-002',
    ],
    toolsRequired: [
      'Bộ dụng cụ tháo module điện tử (ESD-safe)',
      'Khóa lực 50–200 N·m',
      'Thiết bị đo nhiễu RF',
    ],
    workAreaNotes: 'PX1 – Khoang B. Khu vực ESD được kiểm tra trước khi bắt đầu.',
    disassemblySequence: 'Tháo module thu-phát → Tháo hệ thống làm mát → Tháo cụm xử lý tín hiệu DSP → Tháo cụm anten',
    disassemblyMethodNote: 'Ghi nhận rò rỉ dầu tại bơm làm mát trước khi tháo, xử lý theo quy trình an toàn.',
    readyForInspectionDate: '2026-01-09',
    inspectionGroupingNotes: 'Nhóm điện tử gửi PKT. Nhóm cơ khí kiểm tra PX1.',
  },

  // ── DIS-003: Hoàn thành ───────────────────────────────────────────────────
  {
    id: 'DIS-003', orderId: 'WO-003', equipmentName: 'Hệ thống monitoring P-18',
    startDate: '2026-01-20', endDate: '2026-01-24',
    performedBy: 'Nhóm tháo rã PX1 — KTV Lê Minh Đức (trưởng nhóm), KTV Vũ Thanh Tùng',
    totalComponents: 68, status: 'completed',
    notes: 'Phát hiện nhiều linh kiện hư hỏng nặng hơn đánh giá ban đầu. Ống Magnetron hết tuổi thọ, màn hình PPI hỏng hoàn toàn.',
    receivedOrderDate: '2026-01-19',
    technicalDocuments: [
      'Hướng dẫn tháo rã P-18 (HDSD-P18-Alpha)',
      'Sơ đồ cấu tạo hệ thống hiển thị',
      'Danh mục linh kiện cần kiểm tra ưu tiên',
    ],
    toolsRequired: [
      'Dụng cụ tháo ống Magnetron chuyên dụng',
      'Bộ bảo hộ cao áp (ống phát tần số cao)',
      'Thùng chứa đặc biệt cho vật tư nguy hiểm',
    ],
    workAreaNotes: 'PX1 – Khoang A. Tuân thủ quy trình an toàn cao áp.',
    disassemblySequence: 'Xả điện cao áp → Tháo Magnetron và bộ điều chế → Tháo hệ thống hiển thị → Tháo cơ cấu anten → Tháo hệ thống điện',
    disassemblyMethodNote: 'Magnetron xử lý theo quy trình vật liệu nguy hiểm. Màn hình PPI vỡ kính — đóng gói cẩn thận trước khi di chuyển.',
    readyForInspectionDate: '2026-01-25',
    inspectionGroupingNotes: 'Nhóm truyền nhận: kiểm tra và xác nhận thay mới. Nhóm cơ khí: đo lường kích thước. Nhóm hiển thị: đánh giá phục hồi khả thi.',
  },

  // ── DIS-004: Hoàn thành ───────────────────────────────────────────────────
  {
    id: 'DIS-004', orderId: 'WO-004', equipmentName: 'Module S-125 Pechora',
    startDate: '2026-02-01', endDate: '2026-02-04',
    performedBy: 'Nhóm tháo rã PX2 — KTV Hoàng Văn Minh (trưởng nhóm), KTV Trịnh Xuân Hòa',
    totalComponents: 48, status: 'completed',
    notes: 'Tháo rã hệ thống dẫn đường và bộ phận điện tử. Bộ điều khiển dẫn hướng hỏng IC chính.',
    receivedOrderDate: '2026-01-31',
    technicalDocuments: [
      'Tài liệu kỹ thuật S-125 Pechora (bản dịch tiếng Việt)',
      'Sơ đồ hệ thống dẫn đường và điện tử',
      'Quy trình tháo rã cụm bệ triển khai',
    ],
    toolsRequired: [
      'Bộ dụng cụ chuyên dụng tháo hệ thống S-125',
      'Cần trục 5 tấn (tháo cụm bệ triển khai)',
      'Thiết bị đo kiểm điện tử công nghiệp',
    ],
    workAreaNotes: 'PX2 – Khu vực ngoài trời có mái che. Cần trục đã sẵn sàng.',
    disassemblySequence: 'Tháo cabin điều khiển → Tháo hệ thống điện tử dẫn đường → Tháo cụm thủy lực → Tháo khung bệ triển khai',
    disassemblyMethodNote: 'Cụm thủy lực xả áp trước khi tháo. Đánh dấu phân cực và hướng lắp các đầu nối điện tử.',
    readyForInspectionDate: '2026-02-05',
    inspectionGroupingNotes: 'Điện tử dẫn đường: PKT kiểm tra. Cơ khí thủy lực: PX2. Vật tư tiêu hao: thay mới.',
  },

  // ── DIS-005: Đang thực hiện ───────────────────────────────────────────────
  {
    id: 'DIS-005', orderId: 'WO-005', equipmentName: 'Module S-75 Dvina',
    startDate: '2026-03-10',
    performedBy: 'Nhóm tháo rã PX2 — KTV Nguyễn Đức Thắng (trưởng nhóm), KTV Bùi Văn Kiên, KTV Đỗ Mạnh Hà',
    totalComponents: 84, status: 'in_progress',
    notes: 'Đang tháo rã. Phát hiện một số linh kiện có dấu hiệu quá hạn sử dụng. Dự kiến hoàn thành 15/03/2026.',
    receivedOrderDate: '2026-03-08',
    technicalDocuments: [
      'Tài liệu kỹ thuật S-75 Dvina — Tập 2 (Bảo dưỡng sửa chữa)',
      'Sơ đồ cấu tạo bệ triển khai và hệ thống nâng hạ',
      'Hướng dẫn tháo rã động cơ thủy lực',
      'Danh mục 84 cấu phần theo WO-005',
    ],
    toolsRequired: [
      'Cần trục 10 tấn (cụm xi-lanh thủy lực nặng)',
      'Bộ dụng cụ tháo xi-lanh thủy lực S-75',
      'Thiết bị đo kiểm thủy lực',
      'Bình chứa dầu thủy lực (tháo dầu trước)',
    ],
    workAreaNotes: 'PX2 – Sân bãi ngoài trời khu B. Đã trải bạt chống ẩm. Cần trục 10 tấn đã định vị.',
    disassemblySequence: 'Xả hệ thống thủy lực → Tháo động cơ điện nâng hạ → Tháo xi-lanh thủy lực → Tháo trục khuỷu cơ cấu nâng → (đang thực hiện)',
    disassemblyMethodNote: 'Xả toàn bộ dầu thủy lực vào thùng chứa trước khi tháo. Đánh dấu từng xi-lanh theo vị trí (T1-T4, P1-P4).',
  },

  // ── DIS-006: Hoàn thành ───────────────────────────────────────────────────
  {
    id: 'DIS-006', orderId: 'WO-006', equipmentName: 'Hệ thống đo lường ST-68',
    startDate: '2026-02-20', endDate: '2026-02-22',
    performedBy: 'Nhóm tháo rã PX1 — KTV Trần Bá Thành (trưởng nhóm), KTV Nguyễn Thanh Sơn',
    totalComponents: 28, status: 'completed',
    notes: 'Tháo rã cụm quay anten, hệ thống đo lường. Phát hiện rò rỉ dầu tại hộp giảm tốc và mòn vòng bi trục quay.',
    receivedOrderDate: '2026-02-19',
    technicalDocuments: [
      'Tài liệu kỹ thuật hệ thống đo lường ST-68 (bản tiếng Nga có dịch)',
      'Sơ đồ hệ thống quay anten và cơ cấu dẫn động',
      'Quy trình tháo rã hộp giảm tốc đặc biệt',
    ],
    toolsRequired: [
      'Dụng cụ tháo vòng bi SKF chuyên dụng',
      'Khóa lực chính xác 10–120 N·m',
      'Thước đo độ mòn (micrometer)',
    ],
    workAreaNotes: 'PX1 – Khoang C. Khu vực chống dầu mỡ đã chuẩn bị.',
    disassemblySequence: 'Tháo anten → Tháo động cơ quay → Tháo hộp giảm tốc → Tháo ổ trục chính → Tháo hệ thống đo lường',
    disassemblyMethodNote: 'Hộp giảm tốc tháo trong khu vực sạch, thu hồi dầu. Vòng bi đo độ mòn ngay sau tháo.',
    readyForInspectionDate: '2026-02-23',
    inspectionGroupingNotes: 'Nhóm cơ khí quay (3 cấu phần): đo lường kiểm định. Nhóm điện tử (5 cấu phần): PKT kiểm tra. Vật tư tiêu hao: thay mới.',
  },

  // ── DIS-007: Chờ thực hiện ────────────────────────────────────────────────
  {
    id: 'DIS-007', orderId: 'WO-007', equipmentName: 'Hệ thống monitoring P-18 (3)',
    startDate: '2026-04-22',
    performedBy: 'Nhóm tháo rã PX1 — KTV Lê Minh Đức (trưởng nhóm)',
    totalComponents: 65, status: 'pending',
    receivedOrderDate: '2026-04-20',
    technicalDocuments: [
      'Hướng dẫn tháo rã P-18 (HDSD-P18-Alpha)',
      'Danh mục 65 cấu phần lệnh WO-007',
      'Sơ đồ hệ thống anten và truyền nhận',
    ],
    toolsRequired: [
      'Dụng cụ tháo Magnetron chuyên dụng',
      'Bộ bảo hộ cao áp',
      'Bộ dụng cụ đo kiểm điện tử',
    ],
    workAreaNotes: 'Chờ chuẩn bị khu vực PX1 – Khoang A (đang dùng cho DIS-001 bàn giao). Dự kiến bắt đầu 22/04/2026.',
  },
];
