import type { MonitoringAlert } from '../types';

export const alerts: MonitoringAlert[] = [
  {
    id: 'AL001', equipmentId: 'EQ006', equipmentName: 'Sản phẩm chủ lực S-125 Pechora',
    type: 'signal', severity: 'critical',
    message: 'Mất tín hiệu điều phối - mã lỗi E-045',
    timestamp: '2026-03-28 14:25', isRead: false, isResolved: false,
    threshold: -25, actualValue: -45,
  },
  {
    id: 'AL002', equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01',
    type: 'temperature', severity: 'warning',
    message: 'Nhiệt độ module xử lý đang tăng dần, hiện tại 72°C (ngưỡng: 80°C)',
    timestamp: '2026-04-01 09:15', isRead: false, isResolved: false,
    threshold: 80, actualValue: 72,
  },
  {
    id: 'AL003', equipmentId: 'EQ003', equipmentName: 'Hệ thống monitoring P-37 số 01',
    type: 'general', severity: 'critical',
    message: 'Thiết bị đang trong trạng thái bảo trì kéo dài, đã chuyển sang sửa chữa lớn',
    timestamp: '2026-03-25 16:00', isRead: true, isResolved: false,
  },
  {
    id: 'AL004', equipmentId: 'EQ009', equipmentName: 'Máy tiện CNC vạn năng',
    type: 'vibration', severity: 'warning',
    message: 'Rung động bất thường phát hiện, mức rung 4.2 mm/s (ngưỡng: 3.5 mm/s)',
    timestamp: '2026-04-01 10:30', isRead: false, isResolved: false,
    threshold: 3.5, actualValue: 4.2,
  },
  {
    id: 'AL005', equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01',
    type: 'hours', severity: 'info',
    message: 'Thiết bị đạt 4850 giờ vận hành, gần mốc bảo trì 5000 giờ',
    timestamp: '2026-04-01 06:00', isRead: true, isResolved: false,
    threshold: 5000, actualValue: 4850,
  },
  {
    id: 'AL006', equipmentId: 'EQ008', equipmentName: 'Hệ thống truyền thông nội - ngoại bộ',
    type: 'signal', severity: 'warning',
    message: 'Chất lượng tín hiệu kênh 3 giảm xuống -18 dBm (ngưỡng: -15 dBm)',
    timestamp: '2026-03-30 11:45', isRead: false, isResolved: false,
    threshold: -15, actualValue: -18,
  },
  {
    id: 'AL007', equipmentId: 'EQ005', equipmentName: 'Sản phẩm chủ lực S-75 Dvina',
    type: 'hours', severity: 'info',
    message: 'Sắp đến kỳ bảo trì định kỳ, còn 15 ngày (20/05/2026)',
    timestamp: '2026-04-01 00:00', isRead: true, isResolved: false,
  },
  {
    id: 'AL008', equipmentId: 'EQ004', equipmentName: 'Hệ thống monitoring ST-68 số 01',
    type: 'temperature', severity: 'info',
    message: 'Nhiệt độ hoạt động bình thường: 58°C',
    timestamp: '2026-04-01 08:00', isRead: true, isResolved: true,
    threshold: 80, actualValue: 58,
  },
];
