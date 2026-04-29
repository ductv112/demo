export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  stock: number;
  unitPrice: number;
  category: 'module' | 'component' | 'consumable' | 'tool';
  location: string;
}

export const inventory: InventoryItem[] = [
  { id: 'INV001', code: 'LK-RF-P18', name: 'Mô-đun thu phát RF P-18', unit: 'cái', stock: 2, unitPrice: 85, category: 'module', location: 'Kho A - Kệ R01' },
  { id: 'INV002', code: 'LK-KD-500', name: 'Mạch khuếch đại công suất 500W', unit: 'cái', stock: 5, unitPrice: 18, category: 'component', location: 'Kho A - Kệ R02' },
  { id: 'INV003', code: 'LK-EC-001', name: 'Đầu đọc encoder quang học', unit: 'cái', stock: 3, unitPrice: 32, category: 'component', location: 'Kho A - Kệ R03' },
  { id: 'INV004', code: 'LK-LNA-36D', name: 'Bộ khuếch đại tạp âm thấp LNA', unit: 'cái', stock: 1, unitPrice: 45, category: 'module', location: 'Kho A - Kệ R04' },
  { id: 'INV005', code: 'LK-CPU-S125', name: 'Board xử lý trung tâm S-125', unit: 'cái', stock: 0, unitPrice: 165, category: 'module', location: 'Kho B - Kệ M01' },
  { id: 'INV006', code: 'LK-FW-321', name: 'Chip firmware v3.2.1', unit: 'cái', stock: 4, unitPrice: 12, category: 'component', location: 'Kho A - Kệ E01' },
  { id: 'INV007', code: 'LK-CB-S12', name: 'Bộ cáp kết nối sensor 12 sợi', unit: 'bộ', stock: 2, unitPrice: 58, category: 'component', location: 'Kho B - Kệ M02' },
  { id: 'INV008', code: 'LK-PSU-P37', name: 'Mô-đun nguồn chính P-37', unit: 'cái', stock: 0, unitPrice: 120, category: 'module', location: 'Đặt hàng Z111' },
  { id: 'INV009', code: 'LK-TR-50W', name: 'Transistor công suất RF 50W', unit: 'cái', stock: 12, unitPrice: 8, category: 'component', location: 'Kho A - Kệ E02' },
  { id: 'INV010', code: 'LK-SMA-001', name: 'Đầu nối RF SMA', unit: 'cái', stock: 30, unitPrice: 2.5, category: 'component', location: 'Kho A - Kệ E03' },
  { id: 'INV011', code: 'LK-DSP-S300', name: 'Module DSP radar dẫn bắn S-300', unit: 'cái', stock: 1, unitPrice: 150, category: 'module', location: 'Kho B - Kệ M03' },
  { id: 'INV012', code: 'LK-CON-1553', name: 'Connector MIL-STD-1553', unit: 'cái', stock: 20, unitPrice: 5, category: 'component', location: 'Kho A - Kệ E04' },
  { id: 'INV013', code: 'LK-FPGA-ST68', name: 'Chip FPGA xử lý tín hiệu ST-68', unit: 'cái', stock: 2, unitPrice: 25, category: 'component', location: 'Kho A - Kệ E05' },
  { id: 'INV014', code: 'LK-MEM-CAL', name: 'Bộ nhớ tham số hiệu chuẩn', unit: 'cái', stock: 5, unitPrice: 8, category: 'component', location: 'Kho A - Kệ E06' },
  { id: 'INV015', code: 'VT-GL-TL01', name: 'Gioăng thủy lực chịu áp cao', unit: 'cái', stock: 8, unitPrice: 8, category: 'consumable', location: 'Kho C - Kệ V01' },
  { id: 'INV016', code: 'LK-VAN-TL', name: 'Van điều khiển thủy lực (Bosch)', unit: 'cái', stock: 0, unitPrice: 35, category: 'component', location: 'Đặt hàng Bosch' },
  { id: 'INV017', code: 'VT-DAU-5606', name: 'Dầu thủy lực MIL-H-5606', unit: 'lít', stock: 50, unitPrice: 1.5, category: 'consumable', location: 'Kho C - Kệ V02' },
  { id: 'INV018', code: 'LK-MOT-ANT', name: 'Motor quay anten 24V DC', unit: 'cái', stock: 3, unitPrice: 18, category: 'module', location: 'Kho B - Kệ M04' },
  { id: 'INV019', code: 'VT-VB-001', name: 'Vòng bi chịu tải trọng', unit: 'cái', stock: 10, unitPrice: 5, category: 'component', location: 'Kho C - Kệ V03' },
  { id: 'INV020', code: 'VT-TL-001', name: 'Bộ dụng cụ tháo lắp chuyên dụng', unit: 'bộ', stock: 4, unitPrice: 5, category: 'tool', location: 'Kho D - Dụng cụ' },
  { id: 'INV021', code: 'VT-TR-001', name: 'Chất tẩy rửa mạch điện tử', unit: 'chai', stock: 15, unitPrice: 0.5, category: 'consumable', location: 'Kho C - Kệ V04' },
  { id: 'INV022', code: 'LK-MOD-RF36', name: 'Mô-đun RF Đài radar 36D6', unit: 'cái', stock: 1, unitPrice: 95, category: 'module', location: 'Kho A - Kệ R05' },
];

export const getInventoryByCode = (code: string) => inventory.find(i => i.code === code);
