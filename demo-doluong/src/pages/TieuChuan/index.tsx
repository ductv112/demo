import { useState } from 'react';
import { Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';
import { loaiTieuChuanConfig } from '../../utils/format';
import { PageHeader, FilterBar, DataTable, StatusBadge } from '../../components';
import type { FilterField } from '../../components';
import type { TieuChuan, LoaiTieuChuan, TrangThaiTC } from '../../types';

const { Text } = Typography;

const danhSachTieuChuan: TieuChuan[] = [
  { id: 'TC-001', ma: 'ĐLVN 18:2021',  ten: 'Phương tiện đo độ dài – Thước cuộn',                  loai: 'ĐLVN', namBanHanh: 2021, linhVuc: 'Hình học',            trangThai: 'hieu_luc',     moTa: 'Quy trình kiểm định phương tiện đo độ dài thước cuộn' },
  { id: 'TC-002', ma: 'ĐLVN 76:2020',  ten: 'Nhiệt kế điện trở – Kiểm định',                      loai: 'ĐLVN', namBanHanh: 2020, linhVuc: 'Nhiệt độ',            trangThai: 'hieu_luc',     moTa: 'Quy trình kiểm định nhiệt kế điện trở' },
  { id: 'TC-003', ma: 'TCVN 6165:2009', ten: 'Từ vựng quốc tế về đo lường học (VIM)',               loai: 'TCVN', namBanHanh: 2009, linhVuc: 'Chung',               trangThai: 'hieu_luc',     moTa: 'Tiêu chuẩn từ vựng quốc tế về đo lường học cơ bản' },
  { id: 'TC-004', ma: 'TCVN ISO/IEC 17025:2017', ten: 'Yêu cầu chung năng lực PTN thử nghiệm và hiệu chuẩn', loai: 'TCVN', namBanHanh: 2017, linhVuc: 'Quản lý chất lượng', trangThai: 'hieu_luc', moTa: 'Yêu cầu năng lực phòng thí nghiệm' },
  { id: 'TC-005', ma: 'QCVN 01:2019/BKHCN', ten: 'Quy chuẩn kỹ thuật quốc gia về xăng, nhiên liệu điêzen', loai: 'QCVN', namBanHanh: 2019, linhVuc: 'Hóa lý',         trangThai: 'hieu_luc',     moTa: 'Quy chuẩn an toàn nhiên liệu phục vụ vận hành nội bộ' },
  { id: 'TC-006', ma: 'ISO 10012:2003', ten: 'Hệ thống quản lý đo lường – Yêu cầu với quá trình đo', loai: 'ISO', namBanHanh: 2003, linhVuc: 'Quản lý chất lượng', trangThai: 'hieu_luc',     moTa: 'Hệ thống quản lý đo lường đảm bảo chất lượng' },
  { id: 'TC-007', ma: 'ISO/IEC 17025:2017', ten: 'General requirements for competence of testing and calibration laboratories', loai: 'ISO', namBanHanh: 2017, linhVuc: 'Quản lý chất lượng', trangThai: 'hieu_luc', moTa: 'Phiên bản quốc tế – năng lực phòng thí nghiệm' },
  { id: 'TC-008', ma: 'ĐLVN 154:2015', ten: 'Máy hiện sóng – Hiệu chuẩn',                         loai: 'ĐLVN', namBanHanh: 2015, linhVuc: 'Điện - Điện tử',      trangThai: 'thay_the',     moTa: 'Quy trình hiệu chuẩn máy hiện sóng (đã thay thế bởi ĐLVN 154:2022)' },
  { id: 'TC-009', ma: 'ĐLVN 154:2022', ten: 'Máy hiện sóng – Hiệu chuẩn (phiên bản mới)',         loai: 'ĐLVN', namBanHanh: 2022, linhVuc: 'Điện - Điện tử',      trangThai: 'hieu_luc',     moTa: 'Quy trình hiệu chuẩn máy hiện sóng phiên bản cập nhật' },
  { id: 'TC-010', ma: 'QĐ-NB/2025-01', ten: 'Quy định kiểm tra định kỳ thiết bị đo hệ thống monitoring 2025', loai: 'Lệnh KT', namBanHanh: 2025, linhVuc: 'Truyền dẫn - Tín hiệu', trangThai: 'hieu_luc',  moTa: 'Quy định nội bộ kiểm tra định kỳ thiết bị đo lường phục vụ hệ thống monitoring Doanh nghiệp A' },
  { id: 'TC-011', ma: 'ĐLVN 259:2019', ten: 'Cân phân tích – Kiểm định',                          loai: 'ĐLVN', namBanHanh: 2019, linhVuc: 'Khối lượng',           trangThai: 'hieu_luc',     moTa: 'Quy trình kiểm định cân phân tích và cân kỹ thuật' },
  { id: 'TC-012', ma: 'TCVN 9595-3:2013', ten: 'Đánh giá độ không đảm bảo đo (GUM)',               loai: 'TCVN', namBanHanh: 2013, linhVuc: 'Chung',               trangThai: 'hieu_luc',     moTa: 'Hướng dẫn tính toán độ không đảm bảo đo theo GUM' },
  { id: 'TC-013', ma: 'ĐLVN 02:2018',  ten: 'Áp kế lò xo – Kiểm định',                           loai: 'ĐLVN', namBanHanh: 2018, linhVuc: 'Áp suất',             trangThai: 'het_hieu_luc', moTa: 'Quy trình kiểm định áp kế lò xo (hết hiệu lực)' },
  { id: 'TC-014', ma: 'QĐ-NB/2024-03', ten: 'Quy định kiểm tra đột xuất thiết bị đo TT.Cloud 367',        loai: 'Lệnh KT', namBanHanh: 2024, linhVuc: 'Áp suất',           trangThai: 'het_hieu_luc', moTa: 'Quy định kiểm tra đột xuất đã hoàn thành' },
  { id: 'TC-015', ma: 'ISO 6789:2017', ten: 'Assembly tools for screws and nuts – Hand torque tools', loai: 'ISO', namBanHanh: 2017, linhVuc: 'Lực - Mô men',        trangThai: 'hieu_luc',     moTa: 'Tiêu chuẩn hiệu chuẩn cờ lê lực' },
];

// Map for "Loai" badge
const loaiStyles: Record<string, { bg: string; color: string; border: string }> = {
  'ĐLVN':    { bg: '#e8f4fd', color: '#1E6FD9', border: '#91caff' },
  'TCVN':    { bg: '#f0fce8', color: '#389e0d', border: '#b7eb8f' },
  'QCVN':    { bg: '#fff1f0', color: '#cf1322', border: '#ffa39e' },
  'ISO':     { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
  'Lệnh KT': { bg: '#fff7e6', color: '#d48806', border: '#ffd591' },
};

export default function TieuChuanPage() {
  const [search, setSearch] = useState('');
  const [loaiFilter, setLoaiFilter] = useState('');

  const filtered = danhSachTieuChuan.filter((tc) => {
    const matchSearch = !search ||
      tc.ma.toLowerCase().includes(search.toLowerCase()) ||
      tc.ten.toLowerCase().includes(search.toLowerCase()) ||
      tc.linhVuc.toLowerCase().includes(search.toLowerCase());
    const matchLoai = !loaiFilter || tc.loai === loaiFilter;
    return matchSearch && matchLoai;
  });

  const filterFields: FilterField[] = [
    {
      key: 'loai', placeholder: 'Loại tiêu chuẩn', value: loaiFilter, width: 200,
      onChange: (v) => setLoaiFilter(v || ''),
      options: Object.keys(loaiTieuChuanConfig).map((k) => ({ value: k, label: k })),
    },
  ];

  const columns = [
    {
      title: 'Mã tiêu chuẩn', dataIndex: 'ma', key: 'ma', width: 200,
      render: (v: string) => <Text style={{ color: colors.navy, fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Tên tiêu chuẩn', dataIndex: 'ten', key: 'ten', ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{v}</Text>,
    },
    {
      title: 'Loại', dataIndex: 'loai', key: 'loai', width: 110,
      render: (v: LoaiTieuChuan) => {
        const s = loaiStyles[v] || loaiStyles['ĐLVN'];
        return (
          <span style={{
            display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 12,
            fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}>{v}</span>
        );
      },
    },
    {
      title: 'Năm ban hành', dataIndex: 'namBanHanh', key: 'namBanHanh', width: 120,
      align: 'center' as const,
      sorter: (a: TieuChuan, b: TieuChuan) => a.namBanHanh - b.namBanHanh,
      render: (v: number) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Lĩnh vực', dataIndex: 'linhVuc', key: 'linhVuc', width: 160,
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 130,
      render: (v: TrangThaiTC) => <StatusBadge status={v} />,
    },
    {
      title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</Text>,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<BookOutlined />}
        title="Kho Tri thức & Tiêu chuẩn"
        subtitle="Quản lý tiêu chuẩn, quy trình đo lường & văn bản kỹ thuật – Doanh nghiệp A"
      />

      <div style={{ marginBottom: 16 }}>
        <FilterBar
          searchText={search}
          searchPlaceholder="Tìm theo mã, tên, lĩnh vực..."
          onSearchChange={setSearch}
          filters={filterFields}
          resultCount={filtered.length}
          totalCount={danhSachTieuChuan.length}
          onClearAll={() => { setSearch(''); setLoaiFilter(''); }}
        />
      </div>

      <DataTable
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        totalLabel="tiêu chuẩn"
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
