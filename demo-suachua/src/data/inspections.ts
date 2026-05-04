import type { Inspection } from '../types';

export const inspections: Inspection[] = [
  {
    id: 'INS001', workOrderId: 'WO001', workOrderCode: 'LSC-2026-001', equipmentName: 'Hệ thống monitoring P-18',
    type: 'quality', status: 'passed', inspector: 'KCS Trần Minh Quang', inspectorId: 'PKCDB-01',
    date: '2026-02-05', criteria: ['Tín hiệu phát đạt chuẩn', 'Công suất đầu ra >= 90% định mức', 'Nhiễu pha < ngưỡng cho phép'],
    results: 'Đạt tất cả chỉ tiêu kỹ thuật', passed: true, notes: 'Công suất phát đạt 96% định mức',
  },
  {
    id: 'INS002', workOrderId: 'WO001', workOrderCode: 'LSC-2026-001', equipmentName: 'Hệ thống monitoring P-18',
    type: 'testing', status: 'passed', inspector: 'Kỹ sư Phạm Đức Minh', inspectorId: 'PX1-02',
    date: '2026-02-08', criteria: ['Chạy thử 24h liên tục', 'Đo ổn định tín hiệu', 'Kiểm tra chế độ quay quét'],
    results: 'Thiết bị hoạt động ổn định sau 24h chạy thử', passed: true, notes: 'Không phát sinh lỗi trong quá trình thử nghiệm',
  },
  {
    id: 'INS003', workOrderId: 'WO001', workOrderCode: 'LSC-2026-001', equipmentName: 'Hệ thống monitoring P-18',
    type: 'acceptance', status: 'passed', inspector: 'Phạm Quốc Hưng — Giám đốc', inspectorId: 'BGD-01',
    date: '2026-02-10', criteria: ['Biên bản kiểm tra chất lượng đạt', 'Kết quả thử nghiệm đạt', 'Hồ sơ kỹ thuật đầy đủ'],
    results: 'Phê duyệt nghiệm thu - đạt yêu cầu', passed: true, notes: 'Đồng ý bàn giao cho đơn vị',
  },
  {
    id: 'INS004', workOrderId: 'WO003', workOrderCode: 'LSC-2026-003', equipmentName: 'Module S-125 Pechora',
    type: 'quality', status: 'pending', inspector: 'KCS Trần Minh Quang', inspectorId: 'PKCDB-01',
    date: '2026-03-08', criteria: ['Board xử lý hoạt động đúng', 'Kết nối sensor ổn định', 'Tự động phát hiện mục tiêu'],
    results: '', passed: false, notes: 'Chờ kiểm tra sau khi hoàn thành chạy thử',
  },
  {
    id: 'INS005', workOrderId: 'WO004', workOrderCode: 'LSC-2026-004', equipmentName: 'Thiết bị truyền dữ liệu liên kết',
    type: 'quality', status: 'passed', inspector: 'KCS Lê Văn Hải', inspectorId: 'PKCDB-02',
    date: '2026-02-15', criteria: ['Công suất phát đạt chuẩn', 'Độ nhạy thu đạt chuẩn', 'Chất lượng âm thanh rõ'],
    results: 'Đạt các chỉ tiêu kỹ thuật', passed: true, notes: 'Công suất đạt 95% định mức',
  },
  {
    id: 'INS006', workOrderId: 'WO004', workOrderCode: 'LSC-2026-004', equipmentName: 'Thiết bị truyền dữ liệu liên kết',
    type: 'acceptance', status: 'passed', inspector: 'Phạm Quốc Hưng — Giám đốc', inspectorId: 'BGD-01',
    date: '2026-02-17', criteria: ['Kết quả QC đạt', 'Thiết bị hoạt động ổn định', 'Hồ sơ đầy đủ'],
    results: 'Đạt nghiệm thu', passed: true, notes: 'Đồng ý bàn giao',
  },
];
