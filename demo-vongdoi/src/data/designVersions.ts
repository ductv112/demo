import type { DesignVersion } from '../types';

export const designVersions: DesignVersion[] = [
  // ── EQ001: Hệ thống Monitoring P-18 ─────────────────────────────────────
  {
    id: 'DV001-V10', equipmentId: 'EQ001', equipmentCode: 'RD-P18-261-01',
    equipmentName: 'Hệ thống Monitoring P-18',
    version: 'V1.0', releaseDate: '2012-01-15',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu khi tiếp nhận từ đối tác Liên bang Nga. RF Gen2, DSP TMS320C40, RAM 64MB.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2012-01-20',
    configIds: ['CF_INIT_001'],
  },
  {
    id: 'DV001-V20', equipmentId: 'EQ001', equipmentCode: 'RD-P18-261-01',
    equipmentName: 'Hệ thống Monitoring P-18',
    version: 'V2.0', releaseDate: '2026-02-15',
    status: 'approved', isBaseline: false,
    description: 'Nâng cấp phần cứng lần 1: RF Gen3, DSP TMS320C6713, RAM 256MB. Cải thiện độ nhạy 15%.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2026-02-15',
    configIds: ['CF_INIT_001', 'CF001'],
  },
  {
    id: 'DV001-V21', equipmentId: 'EQ001', equipmentCode: 'RD-P18-261-01',
    equipmentName: 'Hệ thống Monitoring P-18',
    version: 'V2.1', releaseDate: '2026-03-10',
    status: 'published', isBaseline: true,
    description: 'Điều chỉnh thông số vận hành cho địa hình miền núi: công suất 210kW, độ nhạy -112dBm, góc quét 0-25°.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2026-03-12',
    configIds: ['CF_INIT_001', 'CF001', 'CF002'],
  },

  // ── EQ002: Hệ thống Monitoring ST-68U ──────────────────────────────────
  {
    id: 'DV002-V10', equipmentId: 'EQ002', equipmentCode: 'RD-ST68-361-01',
    equipmentName: 'Hệ thống Monitoring ST-68U',
    version: 'V1.0', releaseDate: '2015-06-01',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu khi tiếp nhận. Phần mềm xử lý SW v3.0, bộ lọc CFAR v2.0.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2015-06-05',
    configIds: [],
  },
  {
    id: 'DV002-V11', equipmentId: 'EQ002', equipmentCode: 'RD-ST68-361-01',
    equipmentName: 'Hệ thống Monitoring ST-68U',
    version: 'V1.1', releaseDate: '2025-08-20',
    status: 'published', isBaseline: true,
    description: 'Cập nhật phần mềm: SW v3.1, CFAR v2.3. Cải thiện phát hiện đối tượng mức thấp 8%.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2025-08-22',
    configIds: ['CF003'],
  },

  // ── EQ003: Hệ thống 36D6 ────────────────────────────────────────────────
  {
    id: 'DV003-V10', equipmentId: 'EQ003', equipmentCode: 'RD-36D6-367-01',
    equipmentName: 'Hệ thống Monitoring 36D6',
    version: 'V1.0', releaseDate: '2003-08-10',
    status: 'published', isBaseline: true,
    description: 'Cấu hình ban đầu khi tiếp nhận. Chưa có thay đổi cấu hình kể từ khi tiếp nhận.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2003-08-15',
    configIds: [],
  },

  // ── EQ004: Hệ thống dẫn hướng P-37 ─────────────────────────────────────
  {
    id: 'DV004-V10', equipmentId: 'EQ004', equipmentCode: 'RD-P37-363-01',
    equipmentName: 'Hệ thống dẫn hướng P-37',
    version: 'V1.0', releaseDate: '1985-01-01',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu năm 1985. Magnetron MI-244, tụ điện K50-6, biến áp TP-100.',
    approvedBy: 'Ban Giám đốc', approvedDate: '1985-01-05',
    configIds: [],
  },
  {
    id: 'DV004-V11', equipmentId: 'EQ004', equipmentCode: 'RD-P37-363-01',
    equipmentName: 'Hệ thống dẫn hướng P-37',
    version: 'V1.1', releaseDate: '2021-09-25',
    status: 'published', isBaseline: true,
    description: 'Nâng cấp 2021: thay magnetron MI-244A, tụ K50-6M, biến áp TP-100M. Toàn bộ linh kiện nguồn đã được thay mới.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2021-10-01',
    configIds: ['CF004'],
  },

  // ── EQ005: Module sản phẩm S-75M3 Dvina ────────────────────────────────
  {
    id: 'DV005-V10', equipmentId: 'EQ005', equipmentCode: 'TL-S75-261-01',
    equipmentName: 'Module sản phẩm S-75M3 Dvina',
    version: 'V1.0', releaseDate: '1972-03-01',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu 1972: toàn bộ hệ thống điều khiển analog, CRT đơn sắc.',
    approvedBy: 'Tổng công ty', approvedDate: '1972-03-10',
    configIds: ['CF_INIT_005'],
  },
  {
    id: 'DV005-V50', equipmentId: 'EQ005', equipmentCode: 'TL-S75-261-01',
    equipmentName: 'Module sản phẩm S-75M3 Dvina',
    version: 'V5.0', releaseDate: '2026-01-20',
    status: 'approved', isBaseline: false,
    description: 'Nâng cấp số hóa lớn: bảng điều khiển Digital LCD, máy tính tính toán kỹ thuật số, màn hình LCD 15".',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2026-01-22',
    configIds: ['CF_INIT_005', 'CF005'],
  },
  {
    id: 'DV005-V51', equipmentId: 'EQ005', equipmentCode: 'TL-S75-261-01',
    equipmentName: 'Module sản phẩm S-75M3 Dvina',
    version: 'V5.1', releaseDate: '2026-03-01',
    status: 'pending_approval', isBaseline: false,
    description: 'Cải tạo cabin điều hành: điều hòa DC-24V 1.5kW, vật liệu chống ẩm polyurethane. Đang chờ phê duyệt.',
    configIds: ['CF_INIT_005', 'CF005', 'CF009'],
  },

  // ── EQ006: Module sản phẩm S-125M Pechora ──────────────────────────────
  {
    id: 'DV006-V10', equipmentId: 'EQ006', equipmentCode: 'TL-S125-367-01',
    equipmentName: 'Module sản phẩm S-125M Pechora',
    version: 'V1.0', releaseDate: '2007-04-20',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu khi tiếp nhận năm 2007.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2007-04-25',
    configIds: [],
  },
  {
    id: 'DV006-V11', equipmentId: 'EQ006', equipmentCode: 'TL-S125-367-01',
    equipmentName: 'Module sản phẩm S-125M Pechora',
    version: 'V1.1', releaseDate: '2023-05-10',
    status: 'published', isBaseline: true,
    description: 'Nâng cấp 2023: thay ăng ten Low Blow tái chế, module nguồn cao áp BP-100R.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2023-05-15',
    configIds: ['CF006'],
  },

  // ── EQ007: Bệ triển khai 5P73 ──────────────────────────────────────────
  {
    id: 'DV007-V10', equipmentId: 'EQ007', equipmentCode: 'TL-5P73-367-01',
    equipmentName: 'Bệ triển khai sản phẩm 5P73',
    version: 'V1.0', releaseDate: '2007-04-20',
    status: 'published', isBaseline: true,
    description: 'Cấu hình ban đầu khi tiếp nhận. Chưa có thay đổi kết cấu kỹ thuật.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2007-04-25',
    configIds: [],
  },

  // ── EQ008: Hệ thống điều khiển vận hành SNR-125 ────────────────────────
  {
    id: 'DV008-V10', equipmentId: 'EQ008', equipmentCode: 'RD-SNR125-363-01',
    equipmentName: 'Hệ thống điều khiển vận hành SNR-125',
    version: 'V1.0', releaseDate: '2007-04-20',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu khi tiếp nhận. Phần mềm SW v6.0, ECCM v1.0.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2007-04-25',
    configIds: [],
  },
  {
    id: 'DV008-V11', equipmentId: 'EQ008', equipmentCode: 'RD-SNR125-363-01',
    equipmentName: 'Hệ thống điều khiển vận hành SNR-125',
    version: 'V1.1', releaseDate: '2022-08-05',
    status: 'published', isBaseline: true,
    description: 'Cập nhật phần mềm: SW v6.2, ECCM v2.1. Nâng cao khả năng chống nhiễu điện tử.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2022-08-08',
    configIds: ['CF007'],
  },

  // ── EQ009: Cụm server DG-200 ────────────────────────────────────────────
  {
    id: 'DV009-V10', equipmentId: 'EQ009', equipmentCode: 'CK-DG200-PKT-01',
    equipmentName: 'Cụm server DG-200',
    version: 'V1.0', releaseDate: '2008-03-15',
    status: 'published', isBaseline: true,
    description: 'Cấu hình ban đầu khi tiếp nhận. Chưa có thay đổi kỹ thuật đáng kể.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2008-03-20',
    configIds: [],
  },

  // ── EQ010: Thiết bị đo lường HP-5350B ──────────────────────────────────
  {
    id: 'DV010-V10', equipmentId: 'EQ010', equipmentCode: 'DT-HP5350-PKT-01',
    equipmentName: 'Thiết bị đo lường HP-5350B',
    version: 'V1.0', releaseDate: '2015-03-10',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu. Sai số ±2ppm, chưa hiệu chuẩn lại.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2015-03-15',
    configIds: [],
  },
  {
    id: 'DV010-V11', equipmentId: 'EQ010', equipmentCode: 'DT-HP5350-PKT-01',
    equipmentName: 'Thiết bị đo lường HP-5350B',
    version: 'V1.1', releaseDate: '2026-02-15',
    status: 'pending_approval', isBaseline: false,
    description: 'Hiệu chuẩn lại: sai số ±0.5ppm. Đang chờ phê duyệt từ Phòng Kỹ thuật.',
    configIds: ['CF008'],
  },

  // ── EQ011: Thiết bị giám sát Tektronix TDS3054C ───────────────────────
  {
    id: 'DV011-V10', equipmentId: 'EQ011', equipmentCode: 'DT-TDS3054-PKT-01',
    equipmentName: 'Thiết bị giám sát Tektronix TDS3054C',
    version: 'V1.0', releaseDate: '2012-05-10',
    status: 'published', isBaseline: true,
    description: 'Cấu hình ban đầu khi tiếp nhận. Chưa có thay đổi kỹ thuật.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2012-05-15',
    configIds: [],
  },

  // ── EQ012: Module truyền thông R-833 ───────────────────────────────────
  {
    id: 'DV012-V10', equipmentId: 'EQ012', equipmentCode: 'TT-R833-261-01',
    equipmentName: 'Module truyền thông R-833',
    version: 'V1.0', releaseDate: '1994-01-01',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu khi tiếp nhận năm 1994. PLL MCM69C432.',
    approvedBy: 'Ban Giám đốc', approvedDate: '1994-01-10',
    configIds: [],
  },
  {
    id: 'DV012-V11', equipmentId: 'EQ012', equipmentCode: 'TT-R833-261-01',
    equipmentName: 'Module truyền thông R-833',
    version: 'V1.1', releaseDate: '2026-04-05',
    status: 'draft', isBaseline: false,
    description: 'Thay thế bộ tổng hợp tần số PLL MCM69C432A. Đang ở giai đoạn nháp, chờ linh kiện.',
    configIds: ['CF011'],
  },

  // ── EQ013: Hệ thống bảo mật M-2100 ─────────────────────────────────────
  {
    id: 'DV013-V10', equipmentId: 'EQ013', equipmentCode: 'TT-M2100-361-01',
    equipmentName: 'Hệ thống bảo mật thông tin M-2100',
    version: 'V1.0', releaseDate: '2015-07-01',
    status: 'archived', isBaseline: false,
    description: 'Cấu hình ban đầu: phần mềm Gamma-SW v2.3, mã hóa AES 128-bit.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2015-07-05',
    configIds: [],
  },
  {
    id: 'DV013-V11', equipmentId: 'EQ013', equipmentCode: 'TT-M2100-361-01',
    equipmentName: 'Hệ thống bảo mật thông tin M-2100',
    version: 'V1.1', releaseDate: '2025-12-20',
    status: 'published', isBaseline: true,
    description: 'Cập nhật mật mã: SW v2.5, mã hóa AES-GCM 256-bit. Tăng cường an toàn thông tin.',
    approvedBy: 'Trần Đức Thắng', approvedDate: '2025-12-22',
    configIds: ['CF010'],
  },

  // ── EQ014: Cụm hạ tầng KrAZ-255 ────────────────────────────────────────
  {
    id: 'DV014-V10', equipmentId: 'EQ014', equipmentCode: 'CK-KRAZ255-PKT-01',
    equipmentName: 'Cụm hạ tầng KrAZ-255',
    version: 'V1.0', releaseDate: '1990-01-01',
    status: 'published', isBaseline: true,
    description: 'Cấu hình ban đầu khi tiếp nhận. Chưa có thay đổi cấu hình kỹ thuật lớn.',
    approvedBy: 'Ban Giám đốc', approvedDate: '1990-01-10',
    configIds: [],
  },

  // ── EQ015: Hệ thống P-35/37M ───────────────────────────────────────────
  {
    id: 'DV015-V10', equipmentId: 'EQ015', equipmentCode: 'RD-P35M-SD361-01',
    equipmentName: 'Hệ thống giám sát P-35/37M',
    version: 'V1.0', releaseDate: '2014-09-10',
    status: 'published', isBaseline: true,
    description: 'Cấu hình ban đầu khi tiếp nhận năm 2014. Chưa có thay đổi kỹ thuật.',
    approvedBy: 'Ban Giám đốc Trung tâm phần mềm Alpha', approvedDate: '2014-09-15',
    configIds: [],
  },
];

export const getVersionsByEquipment = (equipmentId: string): DesignVersion[] =>
  designVersions.filter(v => v.equipmentId === equipmentId)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

export const getBaselineVersion = (equipmentId: string): DesignVersion | undefined =>
  designVersions.find(v => v.equipmentId === equipmentId && v.isBaseline);
