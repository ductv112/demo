import type { RepairTask } from '../types';

export const repairTasks: RepairTask[] = [
  // WO001 - Đài radar P-18 (hoàn thành)
  {
    id: 'RT001', workOrderId: 'WO001', workOrderCode: 'LSC-2026-001',
    taskName: 'Tháo mô-đun thu phát RF bị hỏng', description: 'Tháo rời mô-đun thu phát RF khỏi khung máy chính, kiểm tra visual',
    stage: 'electronic', assignee: 'KTV Nguyễn Anh Tuấn', assigneeId: 'PX1-01',
    plannedHours: 8, actualHours: 7, plannedStart: '2026-01-18', plannedEnd: '2026-01-20',
    actualStart: '2026-01-18', actualEnd: '2026-01-19', progress: 100, status: 'completed',
    materials: ['MAT001', 'MAT002'], notes: 'Hoàn thành tốt, phát hiện thêm lỗi mạch lọc', sequence: 1,
  },
  {
    id: 'RT002', workOrderId: 'WO001', workOrderCode: 'LSC-2026-001',
    taskName: 'Thay thế mô-đun RF và mạch khuếch đại', description: 'Lắp đặt mô-đun RF mới, thay mạch khuếch đại công suất',
    stage: 'electronic', assignee: 'KTV Nguyễn Anh Tuấn', assigneeId: 'PX1-01',
    plannedHours: 16, actualHours: 14, plannedStart: '2026-01-21', plannedEnd: '2026-01-28',
    actualStart: '2026-01-21', actualEnd: '2026-01-27', progress: 100, status: 'completed',
    materials: ['MAT003', 'MAT004'], notes: 'Thay thế thành công, cần hiệu chuẩn', sequence: 2,
  },
  {
    id: 'RT003', workOrderId: 'WO001', workOrderCode: 'LSC-2026-001',
    taskName: 'Hiệu chuẩn và kiểm tra chức năng', description: 'Hiệu chuẩn hệ thống sau thay thế, kiểm tra các thông số kỹ thuật',
    stage: 'testing', assignee: 'Kỹ sư Phạm Đức Minh', assigneeId: 'PX1-02',
    plannedHours: 12, actualHours: 10, plannedStart: '2026-01-29', plannedEnd: '2026-02-05',
    actualStart: '2026-01-29', actualEnd: '2026-02-03', progress: 100, status: 'completed',
    materials: [], notes: 'Đạt chuẩn các thông số kỹ thuật', sequence: 3,
  },
  // WO002 - Đài radar 36D6 (đang thực hiện)
  {
    id: 'RT004', workOrderId: 'WO002', workOrderCode: 'LSC-2026-002',
    taskName: 'Phục hồi encoder góc phương vị', description: 'Sửa chữa cơ khí encoder, thay thế đầu đọc bị mòn',
    stage: 'mechanical', assignee: 'KTV Trần Văn Hải', assigneeId: 'PX3-01',
    plannedHours: 20, actualHours: 16, plannedStart: '2026-01-25', plannedEnd: '2026-02-05',
    actualStart: '2026-01-25', actualEnd: '2026-02-03', progress: 100, status: 'completed',
    materials: ['MAT005'], notes: 'Đã phục hồi encoder, cần hiệu chuẩn lại góc', sequence: 1,
  },
  {
    id: 'RT005', workOrderId: 'WO002', workOrderCode: 'LSC-2026-002',
    taskName: 'Thay thế bộ thu LNA và hiệu chuẩn', description: 'Thay thế bộ khuếch đại tạp âm thấp (LNA) và hiệu chuẩn độ nhạy',
    stage: 'electronic', assignee: 'KTV Nguyễn Anh Tuấn', assigneeId: 'PX1-01',
    plannedHours: 16, actualHours: 8, plannedStart: '2026-04-07', plannedEnd: '2026-04-11',
    actualStart: '2026-04-07', actualEnd: '', progress: 50, status: 'in_progress',
    materials: ['MAT006'], notes: 'Đã thay LNA, đang chờ linh kiện để hiệu chuẩn', sequence: 2,
  },
  // WO003 - Hệ thống S-125 (kiểm tra CL)
  {
    id: 'RT006', workOrderId: 'WO003', workOrderCode: 'LSC-2026-003',
    taskName: 'Thay board xử lý trung tâm', description: 'Gỡ bỏ board cũ, lắp đặt board xử lý trung tâm mới, nạp firmware',
    stage: 'electronic', assignee: 'KTV Lê Văn Cường', assigneeId: 'PX2-01',
    plannedHours: 24, actualHours: 22, plannedStart: '2026-02-01', plannedEnd: '2026-02-12',
    actualStart: '2026-02-01', actualEnd: '2026-02-11', progress: 100, status: 'completed',
    materials: ['MAT007', 'MAT008'], notes: 'Đã nạp firmware v3.2.1 thành công', sequence: 1,
  },
  {
    id: 'RT007', workOrderId: 'WO003', workOrderCode: 'LSC-2026-003',
    taskName: 'Thay thế toàn bộ cáp kết nối sensor', description: 'Tháo cáp cũ bị oxi hóa, lắp cáp mới, kiểm tra thông mạch',
    stage: 'assembly', assignee: 'KTV Nguyễn Thanh Sơn', assigneeId: 'PX2-02',
    plannedHours: 16, actualHours: 15, plannedStart: '2026-02-13', plannedEnd: '2026-02-20',
    actualStart: '2026-02-13', actualEnd: '2026-02-19', progress: 100, status: 'completed',
    materials: ['MAT009'], notes: 'Đã thay toàn bộ 12 sợi cáp, thông mạch tốt', sequence: 2,
  },
  {
    id: 'RT008', workOrderId: 'WO003', workOrderCode: 'LSC-2026-003',
    taskName: 'Kiểm tra tổng hợp và chạy thử', description: 'Kiểm tra tổng hợp hệ thống, chạy thử các chế độ hoạt động',
    stage: 'testing', assignee: 'Kỹ sư Nguyễn Văn An', assigneeId: 'PX2-03',
    plannedHours: 20, actualHours: 12, plannedStart: '2026-04-07', plannedEnd: '2026-04-13',
    actualStart: '2026-04-07', actualEnd: '', progress: 60, status: 'in_progress',
    materials: [], notes: 'Đang chạy thử chế độ tự động, còn 2 chế độ chưa test', sequence: 3,
  },
  // WO004 - Thiết bị thông tin liên lạc (hoàn thành)
  {
    id: 'RT009', workOrderId: 'WO004', workOrderCode: 'LSC-2026-004',
    taskName: 'Thay transistor khuếch đại và sửa dây cáp anten', description: 'Thay 2 transistor công suất, hàn lại 3 điểm nối cáp anten',
    stage: 'electronic', assignee: 'KTV Hoàng Văn Long', assigneeId: 'PX4-01',
    plannedHours: 12, actualHours: 10, plannedStart: '2026-02-08', plannedEnd: '2026-02-14',
    actualStart: '2026-02-08', actualEnd: '2026-02-13', progress: 100, status: 'completed',
    materials: ['MAT010', 'MAT011'], notes: 'Hoàn thành, công suất phát đạt 95% định mức', sequence: 1,
  },
  // WO005 - Đài radar P-37 (đang thực hiện)
  {
    id: 'RT010', workOrderId: 'WO005', workOrderCode: 'LSC-2026-005',
    taskName: 'Tháo và kiểm tra mô-đun nguồn', description: 'Tháo mô-đun nguồn, kiểm tra các thành phần bị hỏng',
    stage: 'electronic', assignee: 'KTV Nguyễn Anh Tuấn', assigneeId: 'PX1-01',
    plannedHours: 8, actualHours: 8, plannedStart: '2026-02-18', plannedEnd: '2026-02-20',
    actualStart: '2026-02-18', actualEnd: '2026-02-20', progress: 100, status: 'completed',
    materials: [], notes: 'Xác nhận hỏng MOSFET và cầu chì, cần thay toàn bộ module', sequence: 1,
  },
  {
    id: 'RT011', workOrderId: 'WO005', workOrderCode: 'LSC-2026-005',
    taskName: 'Thay thế mô-đun nguồn mới', description: 'Lắp đặt mô-đun nguồn mới, kiểm tra điện áp đầu ra',
    stage: 'electronic', assignee: 'KTV Nguyễn Anh Tuấn', assigneeId: 'PX1-01',
    plannedHours: 16, actualHours: 4, plannedStart: '2026-04-08', plannedEnd: '2026-04-12',
    actualStart: '2026-04-08', actualEnd: '', progress: 25, status: 'in_progress',
    materials: ['MAT012'], notes: 'Đang lắp mô-đun nguồn từ Nhà máy Z111', sequence: 2,
  },
];

export const getTasksByWorkOrder = (workOrderId: string) =>
  repairTasks.filter(t => t.workOrderId === workOrderId).sort((a, b) => a.sequence - b.sequence);
