import type { MaintenanceWorkOrder } from '../types';

export const maintenanceWorkOrders: MaintenanceWorkOrder[] = [
  // ══════════════════════════════════════════════════════════════
  // PO từ MP006 — BT S-300PMU Q1/2026 (đã hoàn thành + nghiệm thu)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PO001', code: 'WO-2026-001', planId: 'MP006', planCode: 'KHBT-2026-006',
    workItemId: 'WI040', workItemName: 'Kiểm tra bệ thử & cơ cấu nâng',
    equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU', equipmentCode: 'TL-S300-001',
    status: 'accepted',
    assignedStaffId: 'MS004', assignedStaffName: 'Phạm Thanh Sơn',
    teamId: 'TM002', teamName: 'Đội bảo trì Sản phẩm chủ lực',
    scheduledDate: '2026-03-05', estimatedHours: 2, actualHours: 2,
    actualStart: '2026-03-05 08:00', actualEnd: '2026-03-05 10:00',
    isMandatory: true,
    description: 'Kiểm tra cơ cấu nâng, hạ bệ thử, bôi trơn khớp xoay, đo áp suất thủy lực',
    checklistItems: [
      { id: 'CL001', order: 1, content: 'Kiểm tra ngoại quan bệ thử', isCompleted: true },
      { id: 'CL002', order: 2, content: 'Đo áp suất thủy lực nâng/hạ', isCompleted: true },
      { id: 'CL003', order: 3, content: 'Bôi trơn khớp xoay', isCompleted: true },
      { id: 'CL004', order: 4, content: 'Kiểm tra hành trình nâng 0-85°', isCompleted: true },
    ],
    spareParts: [
      { partName: 'Mỡ bôi trơn Siemens', partCode: 'MBT-SM-001', requestedQty: 1, usedQty: 0.5, returnedQty: 0.5, unit: 'kg', lotNumber: 'LOT-2025-SM-008', outboundOrderCode: 'PX-2026-015' },
    ],
    evaluation: {
      result: 'pass',
      measurements: [
        { id: 'M001', parameter: 'Áp suất thủy lực', standardValue: '12-15', measuredValue: '13.5', unit: 'MPa', status: 'pass' },
        { id: 'M002', parameter: 'Hành trình nâng', standardValue: '0-85', measuredValue: '0-84.5', unit: '°', status: 'pass' },
      ],
      evaluatorNotes: 'Bệ thử hoạt động bình thường, thông số đạt tiêu chuẩn.',
      evaluatorName: 'Trần Đức Mạnh',
      evaluatedDate: '2026-03-05',
      acceptedBy: 'Phạm Quốc Hưng',
      acceptedDate: '2026-03-06',
      acceptanceNotes: 'Đồng ý nghiệm thu.',
    },
  },
  {
    id: 'PO002', code: 'WO-2026-002', planId: 'MP006', planCode: 'KHBT-2026-006',
    workItemId: 'WI041', workItemName: 'Kiểm tra hệ thống điều khiển vận hành',
    equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU', equipmentCode: 'TL-S300-001',
    status: 'accepted',
    assignedStaffId: 'MS004', assignedStaffName: 'Phạm Thanh Sơn',
    teamId: 'TM002', teamName: 'Đội bảo trì Sản phẩm chủ lực',
    scheduledDate: '2026-03-05', estimatedHours: 2.5, actualHours: 2,
    actualStart: '2026-03-05 10:30', actualEnd: '2026-03-05 12:30',
    isMandatory: true,
    checklistItems: [
      { id: 'CL005', order: 1, content: 'Kiểm tra panel điều khiển', isCompleted: true },
      { id: 'CL006', order: 2, content: 'Test tín hiệu điều khiển', isCompleted: true },
      { id: 'CL007', order: 3, content: 'Kiểm tra tiếp điểm relay', isCompleted: true },
    ],
    spareParts: [
      { partName: 'Bộ tiếp điểm điều khiển', partCode: 'BTD-S300-002', requestedQty: 4, usedQty: 3, returnedQty: 1, unit: 'cái', lotNumber: 'LOT-2025-BTD-003', outboundOrderCode: 'PX-2026-015', returnOrderCode: 'PN-2026-009' },
    ],
    evaluation: {
      result: 'pass',
      measurements: [
        { id: 'M003', parameter: 'Tín hiệu điều khiển', standardValue: '> -20', measuredValue: '-15', unit: 'dBm', status: 'pass' },
        { id: 'M004', parameter: 'Thời gian phản hồi', standardValue: '< 2', measuredValue: '1.2', unit: 's', status: 'pass' },
      ],
      evaluatorNotes: 'Hệ thống điều khiển hoạt động tốt. Đã thay 3 tiếp điểm.',
      evaluatorName: 'Trần Đức Mạnh',
      evaluatedDate: '2026-03-05',
      acceptedBy: 'Phạm Quốc Hưng',
      acceptedDate: '2026-03-06',
    },
  },
  // ══════════════════════════════════════════════════════════════
  // PO từ MP003 — Kiểm tra S-125 (thủ công, đang thực hiện)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PO010', code: 'WO-2026-010', planId: 'MP003', planCode: 'KHBT-2026-003',
    workItemId: 'WI070', workItemName: 'Kiểm tra hệ thống điều phối',
    equipmentId: 'EQ006', equipmentName: 'Sản phẩm chủ lực S-125 Pechora', equipmentCode: 'TL-S125-001',
    status: 'evaluated',
    assignedStaffId: 'MS004', assignedStaffName: 'Phạm Thanh Sơn',
    teamId: 'TM002', teamName: 'Đội bảo trì Sản phẩm chủ lực',
    scheduledDate: '2026-04-01', estimatedHours: 4, actualHours: 4,
    actualStart: '2026-04-01 08:00', actualEnd: '2026-04-01 12:00',
    isMandatory: true,
    description: 'Xác định lỗi mã E-045, đo tín hiệu đầu ra hệ thống điều phối',
    checklistItems: [
      { id: 'CL010', order: 1, content: 'Kiểm tra nguồn cấp hệ thống điều phối', isCompleted: true },
      { id: 'CL011', order: 2, content: 'Đo tín hiệu đầu ra', isCompleted: true },
      { id: 'CL012', order: 3, content: 'Xác định module lỗi', isCompleted: true },
    ],
    spareParts: [],
    evaluation: {
      result: 'fail',
      measurements: [
        { id: 'M010', parameter: 'Tín hiệu điều phối', standardValue: '> -25', measuredValue: '-32', unit: 'dBm', status: 'fail', notes: 'Tín hiệu yếu hơn chuẩn' },
        { id: 'M011', parameter: 'Nguồn cấp chính', standardValue: '220 ± 5%', measuredValue: '218', unit: 'V', status: 'pass' },
      ],
      evaluatorNotes: 'Module điều phối bị lỗi mạch khuếch đại, cần thay thế. Nguồn cấp bình thường.',
      evaluatorName: 'Trần Đức Mạnh',
      evaluatedDate: '2026-04-01',
    },
  },
  {
    id: 'PO011', code: 'WO-2026-011', planId: 'MP003', planCode: 'KHBT-2026-003',
    workItemId: 'WI073', workItemName: 'Thay thế module điều phối',
    equipmentId: 'EQ006', equipmentName: 'Sản phẩm chủ lực S-125 Pechora', equipmentCode: 'TL-S125-001',
    status: 'in_progress',
    assignedStaffId: 'MS004', assignedStaffName: 'Phạm Thanh Sơn',
    teamId: 'TM002', teamName: 'Đội bảo trì Sản phẩm chủ lực',
    scheduledDate: '2026-04-02', estimatedHours: 4,
    actualStart: '2026-04-02 08:00',
    isMandatory: true,
    description: 'Thay thế module điều phối bị lỗi, chờ linh kiện từ kho',
    checklistItems: [
      { id: 'CL015', order: 1, content: 'Tháo module cũ', isCompleted: true },
      { id: 'CL016', order: 2, content: 'Lắp module mới', isCompleted: false, notes: 'Đang chờ linh kiện' },
      { id: 'CL017', order: 3, content: 'Test tín hiệu sau thay thế', isCompleted: false },
    ],
    spareParts: [
      { partName: 'Module điều phối S-125', partCode: 'MDD-S125-001', requestedQty: 1, usedQty: 0, returnedQty: 0, unit: 'cái', serialNumber: 'SN-MDD-S125-007', outboundOrderCode: 'PX-2026-021' },
    ],
  },
  // ══════════════════════════════════════════════════════════════
  // PO từ MP001 — BT Monitoring P-18 Q2 (chưa thực hiện)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'PO020', code: 'WO-2026-020', planId: 'MP001', planCode: 'KHBT-2026-001',
    workItemId: 'WI001', workItemName: 'Kiểm tra hệ thống anten',
    equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', equipmentCode: 'RD-P18-001',
    status: 'assigned',
    assignedStaffId: 'MS001', assignedStaffName: 'Nguyễn Văn Hùng',
    teamId: 'TM001', teamName: 'Đội bảo trì Hạ tầng',
    scheduledDate: '2026-04-15', estimatedHours: 2,
    isMandatory: true,
    description: 'Kiểm tra cơ cấu xoay, góc nâng, tín hiệu phản xạ',
    checklistItems: [
      { id: 'CL020', order: 1, content: 'Kiểm tra cơ cấu xoay anten', isCompleted: false },
      { id: 'CL021', order: 2, content: 'Đo góc nâng', isCompleted: false },
      { id: 'CL022', order: 3, content: 'Kiểm tra tín hiệu phản xạ', isCompleted: false },
    ],
    spareParts: [],
  },
  {
    id: 'PO021', code: 'WO-2026-021', planId: 'MP001', planCode: 'KHBT-2026-001',
    workItemId: 'WI002', workItemName: 'Kiểm tra module xử lý',
    equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', equipmentCode: 'RD-P18-001',
    status: 'assigned',
    assignedStaffId: 'MS002', assignedStaffName: 'Trần Văn Bình',
    teamId: 'TM001', teamName: 'Đội bảo trì Hạ tầng',
    scheduledDate: '2026-04-15', estimatedHours: 1.5,
    isMandatory: true,
    description: 'Đo throughput, kiểm tra nhiệt độ, quạt làm mát',
    checklistItems: [
      { id: 'CL025', order: 1, content: 'Đo throughput', isCompleted: false },
      { id: 'CL026', order: 2, content: 'Kiểm tra nhiệt độ module xử lý', isCompleted: false },
      { id: 'CL027', order: 3, content: 'Kiểm tra quạt làm mát', isCompleted: false },
    ],
    spareParts: [
      { partName: 'Module tín hiệu monitoring', partCode: 'MTH-RD-001', requestedQty: 1, usedQty: 0, returnedQty: 0, unit: 'cái', productId: 'PRD-002' },
    ],
  },
  {
    id: 'PO022', code: 'WO-2026-022', planId: 'MP001', planCode: 'KHBT-2026-001',
    workItemId: 'WI004', workItemName: 'Hiệu chỉnh tần số',
    equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', equipmentCode: 'RD-P18-001',
    status: 'assigned',
    assignedStaffId: 'MS002', assignedStaffName: 'Trần Văn Bình',
    teamId: 'TM001', teamName: 'Đội bảo trì Hạ tầng',
    scheduledDate: '2026-04-15', estimatedHours: 1,
    isMandatory: true,
    checklistItems: [
      { id: 'CL030', order: 1, content: 'Đo tần số phát hiện tại', isCompleted: false },
      { id: 'CL031', order: 2, content: 'Hiệu chỉnh theo tiêu chuẩn', isCompleted: false },
      { id: 'CL032', order: 3, content: 'Kiểm tra đồng bộ phát/thu', isCompleted: false },
    ],
    spareParts: [],
  },
  {
    id: 'PO023', code: 'WO-2026-023', planId: 'MP001', planCode: 'KHBT-2026-001',
    workItemId: 'WI007', workItemName: 'Chạy thử & nghiệm thu',
    equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', equipmentCode: 'RD-P18-001',
    status: 'draft',
    assignedStaffId: 'MS001', assignedStaffName: 'Nguyễn Văn Hùng',
    teamId: 'TM001', teamName: 'Đội bảo trì Hạ tầng',
    scheduledDate: '2026-04-16', estimatedHours: 0.5,
    isMandatory: true,
    checklistItems: [
      { id: 'CL035', order: 1, content: 'Chạy thử toàn hệ thống', isCompleted: false },
      { id: 'CL036', order: 2, content: 'Đo thông số đầu ra', isCompleted: false },
      { id: 'CL037', order: 3, content: 'Lập biên bản nghiệm thu', isCompleted: false },
    ],
    spareParts: [],
  },
];
