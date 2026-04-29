import React, { useState, useMemo } from 'react';
import {
  Typography, Progress, Button, Dropdown,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  CalendarOutlined, MoreOutlined, EyeOutlined, EditOutlined,
  DatabaseOutlined, WarningOutlined,
  PlayCircleOutlined, CheckCircleOutlined, PauseCircleOutlined,
  StopOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { danhSachKeHoach } from '../../data/keHoachDo';
import { danhSachPhongLab } from '../../data/phongLab';
import { danhSachNguoiDung } from '../../data/nguoiDung';
import { formatDate, trangThaiKHConfig } from '../../utils/format';
import { PageHeader, SummaryCard, FilterBar, DataTable, StatusBadge } from '../../components';
import type { SummaryCardItem, FilterField } from '../../components';
import type { KeHoachDo, TrangThaiKH } from '../../types';

const { Text } = Typography;

const TODAY = new Date('2026-03-27');
const isLate = (kh: KeHoachDo) => !['hoan_thanh'].includes(kh.trangThai) && new Date(kh.ngayKetThuc) < TODAY;
const isNear = (kh: KeHoachDo) => {
  if (['hoan_thanh'].includes(kh.trangThai)) return false;
  const d = Math.ceil((new Date(kh.ngayKetThuc).getTime() - TODAY.getTime()) / 864e5);
  return d >= 0 && d <= 3;
};

const ktvList = danhSachNguoiDung.filter((nd) => ['ktv', 'manager'].includes(nd.vaiTro));
const labNames = Object.fromEntries(danhSachPhongLab.map((l) => [l.id, l.ten]));

const KeHoachDoPage: React.FC = () => {
  const navigate = useNavigate();
  const data = danhSachKeHoach;
  const [searchText, setSearchText] = useState('');
  const [filterTT, setFilterTT] = useState<TrangThaiKH | ''>('');
  const [filterLab, setFilterLab] = useState('');
  const [filterKtv, setFilterKtv] = useState('');

  const filtered = useMemo(() => data.filter((kh) => {
    const s = searchText.toLowerCase();
    const matchText = !s ||
      kh.id.toLowerCase().includes(s) || kh.maYeuCau.toLowerCase().includes(s) ||
      kh.tenKeHoach.toLowerCase().includes(s) || kh.thietBiCanDo.toLowerCase().includes(s) ||
      kh.tenKtv.toLowerCase().includes(s) || kh.donVi.toLowerCase().includes(s);
    return matchText && (!filterTT || kh.trangThai === filterTT) &&
      (!filterLab || kh.phongLab === filterLab) && (!filterKtv || kh.ktvPhuTrach === filterKtv);
  }), [data, searchText, filterTT, filterLab, filterKtv]);

  // ─── KPI ──────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => ({
    total: data.length,
    dangTH: data.filter((k) => k.trangThai === 'dang_thuc_hien').length,
    treHan: data.filter((k) => isLate(k) || isNear(k)).length,
    hoanThanh: data.filter((k) => k.trangThai === 'hoan_thanh').length,
  }), [data]);

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Tổng kế hoạch', value: kpi.total, icon: <DatabaseOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'running', label: 'Đang thực hiện', value: kpi.dangTH, icon: <PlayCircleOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'late', label: 'Chậm / Sắp trễ', value: kpi.treHan, icon: <WarningOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'done', label: 'Hoàn thành', value: kpi.hoanThanh, icon: <CheckCircleOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
  ];

  const filterFields: FilterField[] = [
    { key: 'tt', placeholder: 'Trạng thái', value: filterTT, width: 160, onChange: (v) => setFilterTT((v || '') as TrangThaiKH | ''), options: Object.entries(trangThaiKHConfig).map(([k, c]) => ({ value: k, label: c.label })) },
    { key: 'lab', placeholder: 'Phòng Lab', value: filterLab, width: 180, onChange: (v) => setFilterLab(v || ''), options: danhSachPhongLab.map((l) => ({ value: l.id, label: l.ten })) },
    { key: 'ktv', placeholder: 'Người phụ trách', value: filterKtv, width: 180, onChange: (v) => setFilterKtv(v || ''), options: ktvList.map((nd) => ({ value: nd.id, label: `${nd.capBac} ${nd.hoTen}` })) },
  ];

  // ─── Context menu ─────────────────────────────────────────────────────────
  const getMenu = (r: KeHoachDo): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/ke-hoach-do/${r.id}`) },
      { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
    ];
    if (r.trangThai === 'dang_thuc_hien') {
      items.push(
        { type: 'divider' },
        { key: 'progress', icon: <PlayCircleOutlined />, label: <span style={{ color: colors.navy, fontWeight: 600 }}>Cập nhật tiến độ</span> },
        { key: 'assign', icon: <UserOutlined />, label: 'Gán người phụ trách' },
        { key: 'pause', icon: <PauseCircleOutlined />, label: 'Tạm dừng kế hoạch' },
      );
    }
    if (!['hoan_thanh'].includes(r.trangThai)) {
      items.push({ type: 'divider' }, { key: 'cancel', icon: <StopOutlined />, label: 'Hủy kế hoạch', danger: true });
    }
    return items;
  };

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnsType<KeHoachDo> = [
    {
      title: 'Mã KH', dataIndex: 'id', key: 'id', width: 120,
      render: (t: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{t}</Text>,
    },
    {
      title: 'Tên kế hoạch', dataIndex: 'tenKeHoach', key: 'tenKeHoach', width: 260, ellipsis: { showTitle: true },
      render: (t: string) => <Text style={{ fontSize: 13, fontWeight: 500 }} title={t}>{t}</Text>,
    },
    {
      title: 'YC liên kết', dataIndex: 'maYeuCau', key: 'maYeuCau', width: 115,
      render: (t: string) => (
        <Text style={{ color: colors.navy, fontSize: 13, cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); navigate(`/yeu-cau/${t}`); }}>
          {t}
        </Text>
      ),
    },
    {
      title: 'Đối tượng đo', key: 'doiTuong', width: 240, ellipsis: { showTitle: true },
      render: (_: unknown, r: KeHoachDo) => (
        <div>
          <Text style={{ fontSize: 13, display: 'block' }} title={r.thietBiCanDo}>{r.thietBiCanDo}</Text>
          <Text style={{ fontSize: 11, color: '#8c8c8c', fontFamily: 'monospace' }}>{r.maThietBiCanDo}</Text>
        </div>
      ),
    },
    {
      title: 'Phòng Lab', dataIndex: 'phongLab', key: 'phongLab', width: 150,
      render: (id: string) => <Text style={{ fontSize: 12 }}>{labNames[id] || id}</Text>,
    },
    {
      title: 'Người phụ trách', dataIndex: 'tenKtv', key: 'tenKtv', width: 170,
      render: (t: string) => <Text style={{ fontSize: 13 }}>{t}</Text>,
    },
    {
      title: 'Thời gian', key: 'thoiGian', width: 165,
      render: (_: unknown, r: KeHoachDo) => {
        const late = isLate(r); const near = isNear(r);
        return (
          <div>
            <Text style={{ fontSize: 12, color: late ? '#ff4d4f' : '#595959', fontWeight: late ? 600 : 400 }}>
              {formatDate(r.ngayBatDau)} → {formatDate(r.ngayKetThuc)}
            </Text>
            {late && <div style={{ fontSize: 10, color: '#ff4d4f', fontWeight: 600, marginTop: 1 }}>Trễ hạn!</div>}
            {near && !late && <div style={{ fontSize: 10, color: '#d48806', fontWeight: 600, marginTop: 1 }}>Sắp đến hạn</div>}
          </div>
        );
      },
    },
    {
      title: 'Tiến độ', dataIndex: 'tienDo', key: 'tienDo', width: 110,
      render: (v: number, r: KeHoachDo) => {
        const c = isLate(r) ? '#ff4d4f' : v >= 100 ? '#52c41a' : colors.navy;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={v} size="small" showInfo={false} strokeColor={c} style={{ width: 55, margin: 0 }} />
            <Text style={{ fontSize: 12, fontWeight: 600, color: c }}>{v}%</Text>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 140,
      render: (tt: TrangThaiKH) => <StatusBadge status={tt} />,
    },
    {
      title: '', key: 'act', width: 44, fixed: 'right',
      render: (_: unknown, r: KeHoachDo) => (
        <Dropdown menu={{ items: getMenu(r) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small"
            onClick={(e) => e.stopPropagation()} style={{ color: '#8c8c8c' }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <style>{`
        .row-late td { background: #fff1f0 !important; }
        .row-late:hover td { background: #ffe4e6 !important; }
        .row-near td { background: #fffbe6 !important; }
        .row-near:hover td { background: #fff7cc !important; }
      `}</style>

      <PageHeader
        icon={<CalendarOutlined />}
        title="Quản lý Kế hoạch đo"
        subtitle="Measurement Planning Management — Doanh nghiệp A"
        ctaLabel="Tạo kế hoạch đo"
        onCtaClick={() => navigate('/ke-hoach-do/tao-moi')}
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar
          searchText={searchText}
          searchPlaceholder="Tìm theo mã KH, mã YC, đối tượng đo, phòng Lab..."
          onSearchChange={setSearchText}
          filters={filterFields}
          resultCount={filtered.length}
          totalCount={data.length}
          onClearAll={() => { setSearchText(''); setFilterTT(''); setFilterLab(''); setFilterKtv(''); }}
        />
      </div>

      <DataTable<KeHoachDo>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        onRowClick={(r) => navigate(`/ke-hoach-do/${r.id}`)}
        totalLabel="kế hoạch"
        rowClassName={(r) => isLate(r) ? 'row-late' : isNear(r) ? 'row-near' : ''}
        scroll={{ x: 1500 }}
      />
    </div>
  );
};

export default KeHoachDoPage;
