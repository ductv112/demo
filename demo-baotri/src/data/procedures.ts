import type { MaintenanceProcedure } from '../types';

export const procedures: MaintenanceProcedure[] = [
  // ══════════════════════════════════════════════════════════════
  // QT-001: Bảo trì định kỳ Monitoring P-18
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PR001', code: 'QT-RD-P18-001', name: 'Quy trình bảo trì định kỳ Monitoring P-18',
    equipmentType: 'Hệ thống giám sát hạ tầng P-18', equipmentCategory: 'radar',
    type: 'periodic', version: '2.1', status: 'active',
    totalEstimatedHours: 8,
    description: 'Quy trình bảo trì định kỳ 60 ngày cho hệ thống monitoring P-18. Áp dụng cho tất cả node P-18 đang vận hành.',
    workItemTemplates: [
      { id: 'WT001', order: 1, name: 'Kiểm tra hệ thống anten', description: 'Kiểm tra cơ cấu xoay, góc nâng, tín hiệu phản xạ anten', estimatedHours: 2, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK001', order: 1, content: 'Kiểm tra ngoại quan cơ cấu xoay anten', isMandatory: true },
          { id: 'CK002', order: 2, content: 'Đo tốc độ quay anten (6 vòng/phút ± 0.5)', isMandatory: true },
          { id: 'CK003', order: 3, content: 'Kiểm tra góc nâng (0-45°)', isMandatory: true },
          { id: 'CK004', order: 4, content: 'Đo tín hiệu phản xạ anten', isMandatory: true },
          { id: 'CK005', order: 5, content: 'Bôi trơn khớp xoay', isMandatory: false },
        ],
      },
      { id: 'WT002', order: 2, name: 'Kiểm tra module xử lý', description: 'Đo throughput, kiểm tra nhiệt độ, quạt làm mát', estimatedHours: 1.5, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK006', order: 1, content: 'Đo throughput (> 200 kQPS)', isMandatory: true },
          { id: 'CK007', order: 2, content: 'Kiểm tra nhiệt độ module xử lý (< 70°C)', isMandatory: true },
          { id: 'CK008', order: 3, content: 'Kiểm tra hoạt động quạt làm mát', isMandatory: true },
          { id: 'CK009', order: 4, content: 'Kiểm tra module khuếch đại', isMandatory: false },
        ],
      },
      { id: 'WT003', order: 3, name: 'Kiểm tra bộ thu tín hiệu', description: 'Đo độ nhạy thu, mức nhiễu, lọc tín hiệu', estimatedHours: 1.5, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK010', order: 1, content: 'Đo độ nhạy bộ thu (< -100 dBm)', isMandatory: true },
          { id: 'CK011', order: 2, content: 'Kiểm tra mức nhiễu nền', isMandatory: true },
          { id: 'CK012', order: 3, content: 'Kiểm tra bộ lọc tín hiệu', isMandatory: true },
        ],
      },
      { id: 'WT004', order: 4, name: 'Hiệu chỉnh tần số', description: 'Hiệu chỉnh tần số phát/thu theo tiêu chuẩn 150-170 MHz', estimatedHours: 1, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK013', order: 1, content: 'Đo tần số phát hiện tại', isMandatory: true },
          { id: 'CK014', order: 2, content: 'Hiệu chỉnh theo tiêu chuẩn (150-170 MHz)', isMandatory: true },
          { id: 'CK015', order: 3, content: 'Kiểm tra đồng bộ phát/thu', isMandatory: true },
        ],
      },
      { id: 'WT005', order: 5, name: 'Kiểm tra nguồn điện', description: 'Đo điện áp, dòng điện, kiểm tra ổn áp, UPS', estimatedHours: 1, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK016', order: 1, content: 'Đo điện áp nguồn (220V ± 5%)', isMandatory: true },
          { id: 'CK017', order: 2, content: 'Kiểm tra ổn áp', isMandatory: true },
          { id: 'CK018', order: 3, content: 'Kiểm tra UPS (nếu có)', isMandatory: false },
        ],
      },
      { id: 'WT006', order: 6, name: 'Vệ sinh tổng thể', description: 'Vệ sinh khoang máy, lọc bụi, tra mỡ', estimatedHours: 0.5, isMandatory: false,
        checklistItems: [
          { id: 'CK019', order: 1, content: 'Vệ sinh khoang module xử lý', isMandatory: false },
          { id: 'CK020', order: 2, content: 'Lọc bụi bộ lọc gió', isMandatory: false },
        ],
      },
      { id: 'WT007', order: 7, name: 'Chạy thử & nghiệm thu', description: 'Chạy thử toàn hệ thống, đo thông số đầu ra, lập biên bản', estimatedHours: 0.5, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK021', order: 1, content: 'Chạy thử toàn hệ thống', isMandatory: true },
          { id: 'CK022', order: 2, content: 'Đo thông số đầu ra (phạm vi giám sát, độ chính xác)', isMandatory: true },
          { id: 'CK023', order: 3, content: 'Lập biên bản nghiệm thu', isMandatory: true },
        ],
      },
    ],
    suggestedParts: [
      { productId: 'PRD-002', partCode: 'MTH-RD-001', partName: 'Module tín hiệu monitoring', quantity: 1, unit: 'cái', notes: 'Dự phòng thay thế nếu phát hiện lỗi' },
      { productId: 'PRD-003', partCode: 'BDK-AT-003', partName: 'Bộ dây kết nối anten', quantity: 1, unit: 'bộ', notes: 'Thay nếu hao mòn > 30%' },
      { productId: 'PRD-020', partCode: 'QLM-RD-005', partName: 'Quạt làm mát module xử lý', quantity: 1, unit: 'cái', notes: 'Dự phòng' },
    ],
    documents: [
      { id: 'DOC001', name: 'Sơ đồ hệ thống Monitoring P-18', type: 'diagram', fileName: 'P18_system_diagram.pdf', uploadDate: '2025-06-15' },
      { id: 'DOC002', name: 'Hướng dẫn bảo trì P-18 (NSX)', type: 'manual', fileName: 'P18_maintenance_manual.pdf', uploadDate: '2025-06-15' },
      { id: 'DOC003', name: 'Bản vẽ cơ cấu anten', type: 'drawing', fileName: 'P18_antenna_drawing.pdf', uploadDate: '2025-08-20' },
    ],
    versionHistory: [
      { version: '1.0', changedBy: 'Trần Đức Mạnh', changedDate: '2025-01-10', changeDescription: 'Phiên bản khởi tạo' },
      { version: '2.0', changedBy: 'Trần Đức Mạnh', changedDate: '2025-08-15', changeDescription: 'Bổ sung bước kiểm tra module khuếch đại, cập nhật ngưỡng tần số' },
      { version: '2.1', changedBy: 'Trần Đức Mạnh', changedDate: '2026-01-20', changeDescription: 'Cập nhật checklist bộ thu theo tiêu chuẩn mới' },
    ],
    createdDate: '2025-01-10', updatedDate: '2026-01-20', createdBy: 'Trần Đức Mạnh',
    approvedBy: 'Phạm Quốc Hưng', approvedDate: '2026-01-22',
  },

  // ══════════════════════════════════════════════════════════════
  // QT-002: Bảo trì định kỳ Monitoring 36D6
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PR002', code: 'QT-RD-36D6-001', name: 'Quy trình bảo trì định kỳ Monitoring 36D6',
    equipmentType: 'Hệ thống phát hiện sự cố 36D6', equipmentCategory: 'radar',
    type: 'periodic', version: '1.2', status: 'active',
    totalEstimatedHours: 6,
    description: 'Quy trình bảo trì định kỳ 60 ngày cho hệ thống monitoring 36D6.',
    workItemTemplates: [
      { id: 'WT010', order: 1, name: 'Kiểm tra hệ thống anten', estimatedHours: 1.5, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK030', order: 1, content: 'Kiểm tra cơ cấu xoay anten', isMandatory: true },
          { id: 'CK031', order: 2, content: 'Đo biên độ tín hiệu', isMandatory: true },
        ],
      },
      { id: 'WT011', order: 2, name: 'Hiệu chỉnh tần số phát/thu', estimatedHours: 1.5, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK032', order: 1, content: 'Đo tần số phát', isMandatory: true },
          { id: 'CK033', order: 2, content: 'Hiệu chỉnh theo tiêu chuẩn', isMandatory: true },
        ],
      },
      { id: 'WT012', order: 3, name: 'Thay bộ lọc tần số (nếu cần)', estimatedHours: 1, isMandatory: false, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK034', order: 1, content: 'Kiểm tra bộ lọc hiện tại', isMandatory: true },
          { id: 'CK035', order: 2, content: 'Thay bộ lọc mới', isMandatory: false },
        ],
      },
      { id: 'WT013', order: 4, name: 'Kiểm tra nguồn & ổn áp', estimatedHours: 1, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK036', order: 1, content: 'Đo điện áp nguồn', isMandatory: true },
          { id: 'CK037', order: 2, content: 'Kiểm tra ổn áp', isMandatory: true },
        ],
      },
      { id: 'WT014', order: 5, name: 'Chạy thử & nghiệm thu', estimatedHours: 1, isMandatory: true, requiredSkill: 'Monitoring',
        checklistItems: [
          { id: 'CK038', order: 1, content: 'Chạy thử toàn hệ thống', isMandatory: true },
          { id: 'CK039', order: 2, content: 'Lập biên bản nghiệm thu', isMandatory: true },
        ],
      },
    ],
    suggestedParts: [
      { productId: 'PRD-008', partCode: 'BLT-36D6-001', partName: 'Bộ lọc tần số 36D6', quantity: 1, unit: 'bộ', notes: 'Thay nếu suy giảm > 3dB' },
    ],
    documents: [
      { id: 'DOC004', name: 'Sơ đồ hệ thống Monitoring 36D6', type: 'diagram', fileName: '36D6_system_diagram.pdf', uploadDate: '2025-03-10' },
    ],
    versionHistory: [
      { version: '1.0', changedBy: 'Trần Đức Mạnh', changedDate: '2025-03-10', changeDescription: 'Phiên bản khởi tạo' },
      { version: '1.2', changedBy: 'Trần Đức Mạnh', changedDate: '2025-11-05', changeDescription: 'Bổ sung bước thay bộ lọc' },
    ],
    createdDate: '2025-03-10', updatedDate: '2025-11-05', createdBy: 'Trần Đức Mạnh',
    approvedBy: 'Phạm Quốc Hưng', approvedDate: '2025-11-08',
  },

  // ══════════════════════════════════════════════════════════════
  // QT-003: Bảo trì định kỳ S-300PMU
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PR003', code: 'QT-TL-S300-001', name: 'Quy trình bảo trì định kỳ S-300PMU',
    equipmentType: 'Sản phẩm chủ lực S-300PMU', equipmentCategory: 'missile',
    type: 'periodic', version: '1.0', status: 'active',
    totalEstimatedHours: 12,
    description: 'Quy trình bảo trì định kỳ 90 ngày cho sản phẩm S-300PMU. Yêu cầu chứng chỉ an toàn vận hành sản phẩm.',
    workItemTemplates: [
      { id: 'WT020', order: 1, name: 'Kiểm tra bệ thử & cơ cấu nâng', estimatedHours: 2, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK040', order: 1, content: 'Kiểm tra ngoại quan bệ thử', isMandatory: true },
          { id: 'CK041', order: 2, content: 'Đo áp suất thủy lực (12-15 MPa)', isMandatory: true },
          { id: 'CK042', order: 3, content: 'Bôi trơn khớp xoay', isMandatory: true },
          { id: 'CK043', order: 4, content: 'Kiểm tra hành trình nâng (0-85°)', isMandatory: true },
        ],
      },
      { id: 'WT021', order: 2, name: 'Kiểm tra hệ thống điều khiển vận hành', estimatedHours: 2.5, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK044', order: 1, content: 'Kiểm tra panel điều khiển', isMandatory: true },
          { id: 'CK045', order: 2, content: 'Test tín hiệu điều khiển (> -20 dBm)', isMandatory: true },
          { id: 'CK046', order: 3, content: 'Kiểm tra tiếp điểm relay', isMandatory: true },
          { id: 'CK047', order: 4, content: 'Đo thời gian phản hồi (< 2s)', isMandatory: true },
        ],
      },
      { id: 'WT022', order: 3, name: 'Thay tiếp điểm điều khiển', estimatedHours: 1.5, isMandatory: false, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK048', order: 1, content: 'Tháo tiếp điểm cũ', isMandatory: true },
          { id: 'CK049', order: 2, content: 'Lắp tiếp điểm mới', isMandatory: true },
          { id: 'CK050', order: 3, content: 'Test sau khi thay', isMandatory: true },
        ],
      },
      { id: 'WT023', order: 4, name: 'Kiểm tra hệ thống monitoring liên kết', estimatedHours: 2, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK051', order: 1, content: 'Kiểm tra anten monitoring liên kết', isMandatory: true },
          { id: 'CK052', order: 2, content: 'Đo tín hiệu liên kết', isMandatory: true },
        ],
      },
      { id: 'WT024', order: 5, name: 'Kiểm tra hệ thống truyền thông nội bộ', estimatedHours: 1, isMandatory: false,
        checklistItems: [
          { id: 'CK053', order: 1, content: 'Test kết nối giữa các trạm', isMandatory: true },
        ],
      },
      { id: 'WT025', order: 6, name: 'Chạy thử tổng hợp & nghiệm thu', estimatedHours: 3, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK054', order: 1, content: 'Chạy thử mô phỏng toàn hệ thống', isMandatory: true },
          { id: 'CK055', order: 2, content: 'Kiểm tra phối hợp các phân hệ', isMandatory: true },
          { id: 'CK056', order: 3, content: 'Lập biên bản nghiệm thu', isMandatory: true },
        ],
      },
    ],
    suggestedParts: [
      { productId: 'PRD-011', partCode: 'BTD-S300-002', partName: 'Bộ tiếp điểm điều khiển S-300', quantity: 4, unit: 'cái' },
      { productId: 'PRD-031', partCode: 'MBT-SM-001', partName: 'Mỡ bôi trơn Siemens', quantity: 1, unit: 'kg' },
    ],
    documents: [
      { id: 'DOC005', name: 'Sơ đồ hệ thống S-300PMU', type: 'diagram', fileName: 'S300_system.pdf', uploadDate: '2025-06-20' },
      { id: 'DOC006', name: 'Hướng dẫn bảo trì S-300 (NSX)', type: 'manual', fileName: 'S300_maintenance.pdf', uploadDate: '2025-06-20' },
    ],
    versionHistory: [
      { version: '1.0', changedBy: 'Trần Đức Mạnh', changedDate: '2025-06-20', changeDescription: 'Phiên bản khởi tạo' },
    ],
    createdDate: '2025-06-20', updatedDate: '2025-06-20', createdBy: 'Trần Đức Mạnh',
    approvedBy: 'Phạm Quốc Hưng', approvedDate: '2025-06-25',
  },

  // ══════════════════════════════════════════════════════════════
  // QT-004: Bảo trì máy tiện CNC
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PR004', code: 'QT-CK-CNC-001', name: 'Quy trình bảo trì định kỳ máy tiện CNC',
    equipmentType: 'Máy tiện CNC vạn năng', equipmentCategory: 'mechanical',
    type: 'periodic', version: '1.1', status: 'active',
    totalEstimatedHours: 4,
    description: 'Quy trình bảo trì định kỳ 30 ngày cho máy tiện CNC.',
    workItemTemplates: [
      { id: 'WT030', order: 1, name: 'Xả & thay dầu bôi trơn', estimatedHours: 1, isMandatory: true, requiredSkill: 'Cơ khí',
        checklistItems: [
          { id: 'CK060', order: 1, content: 'Xả dầu cũ hoàn toàn', isMandatory: true },
          { id: 'CK061', order: 2, content: 'Vệ sinh bể chứa dầu', isMandatory: true },
          { id: 'CK062', order: 3, content: 'Đổ dầu mới đúng loại & mức', isMandatory: true },
        ],
      },
      { id: 'WT031', order: 2, name: 'Kiểm tra độ chính xác trục X/Y/Z', estimatedHours: 1, isMandatory: true, requiredSkill: 'Cơ khí',
        checklistItems: [
          { id: 'CK063', order: 1, content: 'Đo độ rung trục X (< 0.01mm)', isMandatory: true },
          { id: 'CK064', order: 2, content: 'Đo độ rung trục Y (< 0.01mm)', isMandatory: true },
          { id: 'CK065', order: 3, content: 'Đo độ rung trục Z (< 0.01mm)', isMandatory: true },
        ],
      },
      { id: 'WT032', order: 3, name: 'Kiểm tra hệ thống thủy lực', estimatedHours: 0.5, isMandatory: true, requiredSkill: 'Cơ khí',
        checklistItems: [
          { id: 'CK066', order: 1, content: 'Kiểm tra áp suất thủy lực', isMandatory: true },
          { id: 'CK067', order: 2, content: 'Kiểm tra rò rỉ', isMandatory: true },
        ],
      },
      { id: 'WT033', order: 4, name: 'Kiểm tra dao cắt & đầu kẹp', estimatedHours: 0.5, isMandatory: false,
        checklistItems: [
          { id: 'CK068', order: 1, content: 'Kiểm tra độ mòn dao', isMandatory: false },
          { id: 'CK069', order: 2, content: 'Kiểm tra đầu kẹp', isMandatory: false },
        ],
      },
      { id: 'WT034', order: 5, name: 'Chạy thử gia công mẫu', estimatedHours: 1, isMandatory: true, requiredSkill: 'Cơ khí',
        checklistItems: [
          { id: 'CK070', order: 1, content: 'Gia công chi tiết mẫu', isMandatory: true },
          { id: 'CK071', order: 2, content: 'Đo kích thước sản phẩm mẫu', isMandatory: true },
        ],
      },
    ],
    suggestedParts: [
      { productId: 'PRD-030', partCode: 'DBT-CNC-001', partName: 'Dầu bôi trơn công nghiệp', quantity: 5, unit: 'lít' },
      { productId: 'PRD-021', partCode: 'VB-SKF-6205', partName: 'Vòng bi SKF 6205', quantity: 2, unit: 'cái', notes: 'Thay nếu rung > 0.02mm' },
    ],
    documents: [
      { id: 'DOC007', name: 'Hướng dẫn bảo trì CNC-450 (Bosch)', type: 'manual', fileName: 'CNC450_manual.pdf', uploadDate: '2025-08-15' },
    ],
    versionHistory: [
      { version: '1.0', changedBy: 'Trần Đức Mạnh', changedDate: '2025-08-15', changeDescription: 'Phiên bản khởi tạo' },
      { version: '1.1', changedBy: 'Trần Đức Mạnh', changedDate: '2026-02-10', changeDescription: 'Bổ sung ngưỡng đo rung' },
    ],
    createdDate: '2025-08-15', updatedDate: '2026-02-10', createdBy: 'Trần Đức Mạnh',
    approvedBy: 'Phạm Quốc Hưng', approvedDate: '2026-02-12',
  },

  // ══════════════════════════════════════════════════════════════
  // QT-005: Bảo trì hệ thống truyền thông
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PR005', code: 'QT-TT-VCS-001', name: 'Quy trình bảo trì hệ thống truyền thông nội - ngoại bộ',
    equipmentType: 'Hệ thống truyền thông', equipmentCategory: 'communication',
    type: 'periodic', version: '1.0', status: 'active',
    totalEstimatedHours: 4,
    description: 'Quy trình bảo trì định kỳ 30 ngày cho hệ thống truyền thông nội - ngoại bộ.',
    workItemTemplates: [
      { id: 'WT040', order: 1, name: 'Kiểm tra chất lượng tín hiệu các kênh', estimatedHours: 1.5, isMandatory: true, requiredSkill: 'Điện tử',
        checklistItems: [
          { id: 'CK080', order: 1, content: 'Đo SNR kênh 1-5 (> 20 dB)', isMandatory: true },
          { id: 'CK081', order: 2, content: 'Kiểm tra nhiễu xuyên kênh', isMandatory: true },
        ],
      },
      { id: 'WT041', order: 2, name: 'Kiểm tra & thay cáp tín hiệu RF', estimatedHours: 1, isMandatory: true, requiredSkill: 'Điện tử',
        checklistItems: [
          { id: 'CK082', order: 1, content: 'Đo suy hao cáp (< 3 dB)', isMandatory: true },
          { id: 'CK083', order: 2, content: 'Kiểm tra đầu nối', isMandatory: true },
          { id: 'CK084', order: 3, content: 'Thay cáp nếu suy hao > 3 dB', isMandatory: false },
        ],
      },
      { id: 'WT042', order: 3, name: 'Bảo dưỡng thiết bị mã hóa', estimatedHours: 1, isMandatory: true, requiredSkill: 'Điện tử',
        checklistItems: [
          { id: 'CK085', order: 1, content: 'Kiểm tra hoạt động bộ mã hóa', isMandatory: true },
          { id: 'CK086', order: 2, content: 'Cập nhật firmware (nếu có)', isMandatory: false },
        ],
      },
      { id: 'WT043', order: 4, name: 'Chạy thử kết nối & nghiệm thu', estimatedHours: 0.5, isMandatory: true, requiredSkill: 'Điện tử',
        checklistItems: [
          { id: 'CK087', order: 1, content: 'Test kết nối tất cả kênh', isMandatory: true },
          { id: 'CK088', order: 2, content: 'Lập biên bản nghiệm thu', isMandatory: true },
        ],
      },
    ],
    suggestedParts: [
      { productId: 'PRD-015', partCode: 'CTH-RF-002', partName: 'Cáp tín hiệu RF', quantity: 3, unit: 'cuộn' },
      { productId: 'PRD-005', partCode: 'DN-RF-001', partName: 'Đầu nối RF cao tần', quantity: 6, unit: 'cái' },
    ],
    documents: [
      { id: 'DOC008', name: 'Sơ đồ hệ thống VCS-2000', type: 'diagram', fileName: 'VCS2000_diagram.pdf', uploadDate: '2025-02-01' },
    ],
    versionHistory: [
      { version: '1.0', changedBy: 'Trần Đức Mạnh', changedDate: '2025-02-01', changeDescription: 'Phiên bản khởi tạo' },
    ],
    createdDate: '2025-02-01', updatedDate: '2025-02-01', createdBy: 'Trần Đức Mạnh',
    approvedBy: 'Phạm Quốc Hưng', approvedDate: '2025-02-05',
  },

  // ══════════════════════════════════════════════════════════════
  // QT-006: Bảo trì S-75 Dvina (bản nháp)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PR006', code: 'QT-TL-S75-001', name: 'Quy trình bảo trì định kỳ S-75 Dvina',
    equipmentType: 'Sản phẩm chủ lực S-75', equipmentCategory: 'missile',
    type: 'periodic', version: '0.1', status: 'draft',
    totalEstimatedHours: 10,
    description: 'Dự thảo quy trình bảo trì S-75. Đang chờ phê duyệt.',
    workItemTemplates: [
      { id: 'WT050', order: 1, name: 'Kiểm tra bệ thử & cơ cấu nâng hạ', estimatedHours: 2, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK090', order: 1, content: 'Kiểm tra ngoại quan', isMandatory: true },
          { id: 'CK091', order: 2, content: 'Đo áp suất thủy lực (18-22 MPa)', isMandatory: true },
        ],
      },
      { id: 'WT051', order: 2, name: 'Kiểm tra hệ thống thủy lực', estimatedHours: 2, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK092', order: 1, content: 'Kiểm tra rò rỉ dầu', isMandatory: true },
          { id: 'CK093', order: 2, content: 'Thay dầu thủy lực nếu cần', isMandatory: false },
        ],
      },
      { id: 'WT052', order: 3, name: 'Kiểm tra hệ thống điều phối', estimatedHours: 2, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK094', order: 1, content: 'Đo tín hiệu điều phối', isMandatory: true },
        ],
      },
      { id: 'WT053', order: 4, name: 'Kiểm tra hệ thống điện & cáp', estimatedHours: 1.5, isMandatory: true,
        checklistItems: [
          { id: 'CK095', order: 1, content: 'Kiểm tra cách điện', isMandatory: true },
        ],
      },
      { id: 'WT054', order: 5, name: 'Bảo dưỡng cơ cấu cơ khí', estimatedHours: 1, isMandatory: false,
        checklistItems: [
          { id: 'CK096', order: 1, content: 'Tra mỡ cơ cấu', isMandatory: false },
        ],
      },
      { id: 'WT055', order: 6, name: 'Chạy thử tổng hợp & nghiệm thu', estimatedHours: 1.5, isMandatory: true, requiredSkill: 'Sản phẩm chủ lực',
        checklistItems: [
          { id: 'CK097', order: 1, content: 'Chạy thử mô phỏng', isMandatory: true },
          { id: 'CK098', order: 2, content: 'Lập biên bản', isMandatory: true },
        ],
      },
    ],
    suggestedParts: [],
    documents: [],
    versionHistory: [
      { version: '0.1', changedBy: 'Trần Đức Mạnh', changedDate: '2026-03-15', changeDescription: 'Dự thảo ban đầu' },
    ],
    createdDate: '2026-03-15', updatedDate: '2026-03-15', createdBy: 'Trần Đức Mạnh',
  },
];
