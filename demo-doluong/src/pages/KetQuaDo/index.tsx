import React, { useState, useMemo } from 'react';
import { Typography, Card, Row, Col, Tabs, Tag, Button, Input, Select, Table, message, Drawer, Form, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import {
  ExperimentOutlined, CheckCircleOutlined,
  CloseCircleOutlined, SafetyCertificateOutlined,
  BarChartOutlined, SearchOutlined,
  EyeOutlined, DownloadOutlined, PrinterOutlined,
  FileTextOutlined, MoreOutlined, EditOutlined,
  UserOutlined, CalendarOutlined, KeyOutlined,
  SendOutlined, LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { danhSachKetQua } from '../../data/ketQuaDo';
import { formatDate } from '../../utils/format';
import { PageHeader, SummaryCard, DataTable, StatusBadge } from '../../components';
import type { SummaryCardItem } from '../../components';
import type { KetQuaDo, KetLuan, TrangThaiDG } from '../../types';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Chứng chỉ data ──────────────────────────────────────────────────────────
interface ChungChiRecord {
  id: string; maChungChi: string; maYeuCau: string; thietBi: string; donVi: string;
  ngayCap: string; ngayHetHan: string; ktvKy: string; truongPhongKy: string;
  ketLuan: 'dat' | 'khong_dat'; trangThai: 'da_cap' | 'cho_ky' | 'ban_nhap';
  loai: string;
}

const chungChiData: ChungChiRecord[] = [
  { id: 'CC-001', maChungChi: 'CC-2026-0001', maYeuCau: 'YC-2026-001', thietBi: 'Khối phát hệ thống monitoring TX-18 Terek', donVi: 'TT Phần mềm Alpha 361', ngayCap: '2026-03-18', ngayHetHan: '2027-03-18', ktvKy: 'Trần Văn Bình', truongPhongKy: 'Phạm Quang Huy', ketLuan: 'dat', trangThai: 'da_cap', loai: 'Chứng chỉ HC' },
  { id: 'CC-002', maChungChi: 'CC-2026-0002', maYeuCau: 'YC-2026-003', thietBi: 'Hệ thống làm mát data center DC-300 — module thủy lực', donVi: 'TT.Cloud 367', ngayCap: '2026-03-22', ngayHetHan: '2027-03-22', ktvKy: 'Phạm Quang Huy', truongPhongKy: 'Nguyễn Văn Thắng', ketLuan: 'dat', trangThai: 'cho_ky', loai: 'Chứng chỉ HC' },
  { id: 'CC-003', maChungChi: 'CC-2026-0003', maYeuCau: 'YC-2026-004', thietBi: 'Bộ nguồn cao áp module SA-6 Kub', donVi: 'TT Phần mềm 921', ngayCap: '2026-03-25', ngayHetHan: '2027-03-25', ktvKy: 'Trần Văn Bình', truongPhongKy: '', ketLuan: 'dat', trangThai: 'ban_nhap', loai: 'Biên bản KĐ' },
  { id: 'CC-004', maChungChi: 'CC-2026-0004', maYeuCau: 'YC-2026-005', thietBi: 'Kênh thu hệ thống monitoring 36D6', donVi: 'TT Monitoring 26', ngayCap: '2026-03-15', ngayHetHan: '2027-03-15', ktvKy: 'Phạm Tuấn Anh', truongPhongKy: 'Phạm Quang Huy', ketLuan: 'dat', trangThai: 'da_cap', loai: 'Chứng chỉ HC' },
  { id: 'CC-005', maChungChi: '', maYeuCau: 'YC-2026-007', thietBi: 'Module dẫn truyền dữ liệu KH-29', donVi: 'TT Monitoring 291', ngayCap: '', ngayHetHan: '', ktvKy: '', truongPhongKy: '', ketLuan: 'khong_dat', trangThai: 'ban_nhap', loai: 'Biên bản KĐ' },
];

const ttConfig: Record<string, { label: string; color: string }> = {
  da_cap: { label: 'Đã cấp', color: '#389e0d' },
  cho_ky: { label: 'Chờ ký', color: '#d48806' },
  ban_nhap: { label: 'Bản nháp', color: '#8c8c8c' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const KetQuaDoPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<KetQuaDo[]>(danhSachKetQua);
  const [ccData, setCcData] = useState<ChungChiRecord[]>(chungChiData);
  const [ccSearch, setCcSearch] = useState('');
  const [ccFilterTT, setCcFilterTT] = useState('');
  const [selectedKQ, setSelectedKQ] = useState<KetQuaDo | null>(null);
  const [evalForm] = Form.useForm();
  const [signCC, setSignCC] = useState<ChungChiRecord | null>(null);
  const [signForm] = Form.useForm();

  const thongKe = useMemo(() => ({
    hoanThanh: data.length,
    dat: data.filter((kq) => kq.ketLuan === 'dat').length,
    khongDat: data.filter((kq) => kq.ketLuan === 'khong_dat').length,
    chungChi: ccData.filter((c) => c.trangThai === 'da_cap').length,
  }), [data, ccData]);

  const summaryItems: SummaryCardItem[] = [
    { key: 'done', label: 'Phép đo hoàn thành', value: thongKe.hoanThanh, icon: <BarChartOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'pass', label: 'Đạt chuẩn', value: thongKe.dat, icon: <CheckCircleOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
    { key: 'fail', label: 'Không đạt', value: thongKe.khongDat, icon: <CloseCircleOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'cert', label: 'Chứng chỉ đã cấp', value: thongKe.chungChi, icon: <SafetyCertificateOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
  ];

  const dgStatusConfig: Record<TrangThaiDG, { label: string; color: string; bg: string }> = {
    cho_danh_gia: { label: 'Chờ đánh giá', color: '#d48806', bg: '#fff7e6' },
    da_danh_gia: { label: 'Đã đánh giá', color: '#1E6FD9', bg: '#e8f4fd' },
    da_cap_cc: { label: 'Đã cấp CC', color: '#389e0d', bg: '#f0fce8' },
  };

  // Open eval drawer
  const openEval = (record: KetQuaDo) => {
    setSelectedKQ(record);
    evalForm.setFieldsValue({ ketLuan: record.ketLuan, nhanXet: '' });
  };

  const handleEvalSave = () => {
    evalForm.validateFields().then((vals) => {
      if (selectedKQ) {
        setData((prev) => prev.map((r) => r.id === selectedKQ.id ? { ...r, ketLuan: vals.ketLuan, trangThaiDG: 'da_danh_gia' } : r));
        message.success(`Đã đánh giá ${selectedKQ.id}: ${vals.ketLuan === 'dat' ? 'ĐẠT' : 'KHÔNG ĐẠT'}`);
        setSelectedKQ(null);
        evalForm.resetFields();
      }
    });
  };

  // ─── Tab 1: columns ─────────────────────────────────────────────────────────
  const kqColumns: ColumnsType<KetQuaDo> = [
    { title: 'Mã', dataIndex: 'id', key: 'id', width: 120, render: (t: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{t}</Text> },
    { title: 'Đối tượng đo', dataIndex: 'thietBi', key: 'thietBi', width: 220, ellipsis: true, render: (t: string) => <Text strong style={{ fontSize: 13 }}>{t}</Text> },
    { title: 'KTV', dataIndex: 'kyThuatVien', key: 'kyThuatVien', width: 170, render: (t: string) => <Text style={{ fontSize: 13 }}>{t}</Text> },
    { title: 'Ngày đo', dataIndex: 'ngayDo', key: 'ngayDo', width: 100, render: (d: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{formatDate(d)}</Text> },
    { title: 'GT chuẩn', dataIndex: 'giaTriChuan', key: 'giaTriChuan', width: 120, render: (t: string) => <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{t}</Text> },
    { title: 'GT đo', dataIndex: 'giaTriDo', key: 'giaTriDo', width: 120, render: (t: string) => <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{t}</Text> },
    { title: 'Sai số', dataIndex: 'saiSo', key: 'saiSo', width: 100, render: (t: string) => <Text style={{ fontFamily: 'monospace', color: '#d48806', fontWeight: 700, fontSize: 13 }}>{t}</Text> },
    { title: 'Độ KĐB', dataIndex: 'doKhongDamBao', key: 'doKhongDamBao', width: 120, render: (t: string) => <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{t}</Text> },
    { title: 'Kết luận', dataIndex: 'ketLuan', key: 'ketLuan', width: 115, render: (kl: KetLuan) => <StatusBadge status={kl} /> },
    {
      title: 'Trạng thái', dataIndex: 'trangThaiDG', key: 'trangThaiDG', width: 130,
      render: (tt: TrangThaiDG) => {
        const c = dgStatusConfig[tt];
        return (
          <Tag style={{ margin: 0, borderRadius: 4, fontWeight: 600, fontSize: 11, color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
            {c.label}
          </Tag>
        );
      },
    },
    { title: '', width: 44, fixed: 'right' as const, render: (_: unknown, r: KetQuaDo) => {
      const items: MenuProps['items'] = [
        { key: 'view-yc', icon: <FileTextOutlined />, label: 'Xem yêu cầu đo' },
      ];

      // Chờ đánh giá → cho phép đánh giá
      if (r.trangThaiDG === 'cho_danh_gia') {
        items.unshift(
          { key: 'eval', icon: <EditOutlined />, label: <span style={{ color: colors.navy, fontWeight: 600 }}>Đánh giá kết quả</span> },
          { type: 'divider' },
        );
      }

      // Đã đánh giá + Đạt → cho phép cấp CC
      if (r.trangThaiDG === 'da_danh_gia' && r.ketLuan === 'dat') {
        items.unshift(
          { key: 'cap-cc', icon: <SafetyCertificateOutlined />, label: <span style={{ color: '#389e0d', fontWeight: 600 }}>Cấp chứng chỉ</span> },
          { type: 'divider' },
        );
      }

      // Đã đánh giá → cho phép đánh giá lại
      if (r.trangThaiDG === 'da_danh_gia') {
        items.splice(items.length - 1, 0,
          { key: 'eval', icon: <EditOutlined />, label: 'Đánh giá lại' },
        );
      }

      // Đã cấp CC → xem/tải
      if (r.trangThaiDG === 'da_cap_cc') {
        items.unshift(
          { key: 'view-cc', icon: <EyeOutlined />, label: 'Xem chứng chỉ' },
          { key: 'download', icon: <DownloadOutlined />, label: 'Tải PDF' },
          { type: 'divider' },
        );
      }

      const menu: MenuProps = {
        items,
        onClick: ({ key }) => {
          if (key === 'eval') openEval(r);
          if (key === 'view-yc') navigate(`/yeu-cau/${r.maYeuCau}`);
          if (key === 'cap-cc') {
            setData((prev) => prev.map((item) => item.id === r.id ? { ...item, trangThaiDG: 'da_cap_cc', maChungChi: `HC-2026-${String(Math.floor(Math.random() * 900) + 100)}` } : item));
            message.success(`Đã cấp chứng chỉ cho ${r.id}`);
          }
          if (key === 'view-cc') message.info(`Xem chứng chỉ ${r.maChungChi}`);
          if (key === 'download') message.success('Đang tải PDF...');
        },
      };
      return (
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: '#8c8c8c' }} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      );
    }},
  ];

  // ─── Tab 2: Chứng chỉ ───────────────────────────────────────────────────────
  const ccFiltered = ccData.filter((r) => {
    const s = ccSearch.toLowerCase();
    const matchText = !s || r.maChungChi.toLowerCase().includes(s) || r.thietBi.toLowerCase().includes(s) || r.maYeuCau.toLowerCase().includes(s);
    const matchTT = !ccFilterTT || r.trangThai === ccFilterTT;
    return matchText && matchTT;
  });

  const handleSign = () => {
    signForm.validateFields().then(() => {
      if (signCC) {
        setCcData((prev) => prev.map((r) => r.id === signCC.id ? {
          ...r,
          trangThai: 'da_cap' as const,
          truongPhongKy: 'Nguyễn Văn Thắng',
          ngayCap: new Date().toISOString().split('T')[0],
        } : r));
        message.success(`Đã ký số và cấp chứng chỉ ${signCC.maChungChi || signCC.id}`);
        setSignCC(null);
        signForm.resetFields();
      }
    });
  };

  const ccColumns: ColumnsType<ChungChiRecord> = [
    { title: 'Mã CC', dataIndex: 'maChungChi', width: 140, render: (v: string) => v ? <Text strong style={{ color: colors.navy, fontFamily: 'monospace', fontSize: 13 }}>{v}</Text> : <Text style={{ color: '#bfbfbf', fontSize: 13 }}>Chưa cấp</Text> },
    { title: 'Mã YC', dataIndex: 'maYeuCau', width: 120, render: (v: string) => <Text style={{ color: colors.navy, fontSize: 13, cursor: 'pointer' }} onClick={() => navigate(`/yeu-cau/${v}`)}>{v}</Text> },
    { title: 'Đối tượng đo', dataIndex: 'thietBi', ellipsis: true, render: (v: string) => <Text style={{ fontWeight: 500, fontSize: 13 }}>{v}</Text> },
    { title: 'Đơn vị', dataIndex: 'donVi', width: 150, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Loại', dataIndex: 'loai', width: 115, render: (v: string) => <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>{v}</Tag> },
    { title: 'Ngày cấp', dataIndex: 'ngayCap', width: 105, render: (v: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{v ? v.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1') : '—'}</Text> },
    { title: 'Kết luận', dataIndex: 'ketLuan', width: 95, render: (v: string) => v === 'dat' ? <Tag icon={<CheckCircleOutlined />} color="success">Đạt</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">K.Đạt</Tag> },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 115, render: (v: string) => { const c = ttConfig[v]; return <Tag style={{ borderRadius: 4, margin: 0, fontWeight: 600, color: c.color, background: c.color + '15', border: `1px solid ${c.color}30` }}>{c.label}</Tag>; } },
    { title: '', width: 44, fixed: 'right' as const, render: (_: unknown, r: ChungChiRecord) => {
      const items: MenuProps['items'] = [];

      // Bản nháp → Trình ký
      if (r.trangThai === 'ban_nhap') {
        items.push(
          { key: 'submit', icon: <SendOutlined />, label: <span style={{ color: colors.navy, fontWeight: 600 }}>Trình ký duyệt</span> },
          { type: 'divider' },
        );
      }

      // Chờ ký → Ký số
      if (r.trangThai === 'cho_ky') {
        items.push(
          { key: 'sign', icon: <KeyOutlined />, label: <span style={{ color: '#389e0d', fontWeight: 600 }}>Ký số & Cấp chứng chỉ</span> },
          { type: 'divider' },
        );
      }

      // Đã cấp → Tải, In
      if (r.trangThai === 'da_cap') {
        items.push(
          { key: 'download', icon: <DownloadOutlined />, label: 'Tải PDF' },
          { key: 'print', icon: <PrinterOutlined />, label: 'In chứng chỉ' },
          { type: 'divider' },
        );
      }

      items.push(
        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
        { key: 'yc', icon: <FileTextOutlined />, label: 'Xem yêu cầu đo' },
      );

      const menu: MenuProps = {
        items,
        onClick: ({ key }) => {
          if (key === 'yc') navigate(`/yeu-cau/${r.maYeuCau}`);
          if (key === 'download') message.success('Đang tải PDF...');
          if (key === 'print') message.info('In chứng chỉ...');
          if (key === 'view') message.info(`Xem ${r.id}`);
          if (key === 'submit') {
            setCcData((prev) => prev.map((item) => item.id === r.id ? { ...item, trangThai: 'cho_ky' as const } : item));
            message.success(`Đã trình ký ${r.maChungChi || r.id}`);
          }
          if (key === 'sign') {
            setSignCC(r);
            signForm.resetFields();
          }
        },
      };
      return (
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: '#8c8c8c' }} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      );
    }},
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <style>{`
        .row-khong-dat td { background: #fff0f6 !important; }
        .row-khong-dat:hover td { background: #ffe8ef !important; }
      `}</style>

      <PageHeader
        icon={<ExperimentOutlined />}
        title="Kết luận & Cấp chứng chỉ"
        subtitle="Đánh giá kết quả đo lường và quản lý chứng chỉ hiệu chuẩn điện tử"
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      <Tabs defaultActiveKey="ketqua" size="large" items={[
        {
          key: 'ketqua',
          label: <span><BarChartOutlined style={{ marginRight: 6 }} />Kết quả đo lường ({data.length})</span>,
          children: (
            <DataTable<KetQuaDo>
              columns={kqColumns}
              dataSource={data}
              rowKey="id"
              totalLabel="kết quả"
              onRowClick={(r) => openEval(r)}
              rowClassName={(record) => record.ketLuan === 'khong_dat' ? 'row-khong-dat' : ''}
              scroll={{ x: 1400 }}
            />
          ),
        },
        {
          key: 'chungchi',
          label: (
            <span>
              <SafetyCertificateOutlined style={{ marginRight: 6 }} />Chứng chỉ hiệu chuẩn
              <span style={{ marginLeft: 6, background: '#389e0d', color: '#fff', borderRadius: 8, fontSize: 10, padding: '1px 6px', fontWeight: 600 }}>
                {ccData.filter((c) => c.trangThai === 'da_cap').length}
              </span>
            </span>
          ),
          children: (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, padding: '14px 20px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <Input placeholder="Tìm mã CC, mã YC, đối tượng đo..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  value={ccSearch} onChange={(e) => setCcSearch(e.target.value)} allowClear style={{ flex: '1 1 250px', maxWidth: 360 }} />
                <Select placeholder="Trạng thái" value={ccFilterTT || undefined} onChange={(v) => setCcFilterTT(v || '')} allowClear style={{ flex: '0 1 150px', minWidth: 120 }}>
                  {Object.entries(ttConfig).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
                <Text style={{ fontSize: 13, color: '#8c8c8c', alignSelf: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{ccFiltered.length}</span> / {ccData.length}
                </Text>
              </div>
              <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} styles={{ body: { padding: 0 } }}>
                <Table dataSource={ccFiltered} columns={ccColumns} rowKey="id" pagination={false} size="middle" scroll={{ x: 1100 }} />
              </Card>
            </div>
          ),
        },
      ]} />

      {/* ═══ DRAWER: Đánh giá kết quả ═══ */}
      <Drawer
        open={!!selectedKQ}
        onClose={() => { setSelectedKQ(null); evalForm.resetFields(); }}
        title={null} width={560} closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {selectedKQ && (
          <div>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
              padding: '20px 24px',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginBottom: 4 }}>Đánh giá kết quả</Text>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>{selectedKQ.id}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginTop: 4 }}>
                So sánh kết quả và sai số với dung sai kỹ thuật để kết luận
              </Text>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Thông tin kết quả đo */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 14 }}>Thông tin phép đo</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
                {[
                  { label: 'Đối tượng đo', value: selectedKQ.thietBi },
                  { label: 'Mã yêu cầu', value: selectedKQ.maYeuCau },
                  { label: 'KTV thực hiện', value: selectedKQ.kyThuatVien },
                  { label: 'Ngày đo', value: formatDate(selectedKQ.ngayDo) },
                ].map((f) => (
                  <div key={f.label}>
                    <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>{f.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{f.value}</Text>
                  </div>
                ))}
              </div>

              {/* Kết quả đo */}
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Giá trị chuẩn</Text>
                    <Text style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#374151' }}>{selectedKQ.giaTriChuan}</Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Giá trị đo</Text>
                    <Text style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#374151' }}>{selectedKQ.giaTriDo}</Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Sai số</Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#d48806' }}>{selectedKQ.saiSo}</Text>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
                  <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Độ không đảm bảo đo (U)</Text>
                  <Text style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#7c3aed' }}>{selectedKQ.doKhongDamBao}</Text>
                </div>
              </div>

              <Divider style={{ margin: '0 0 20px' }} />

              {/* Form đánh giá */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 14 }}>Đánh giá của người phụ trách</Text>
              <Form form={evalForm} layout="vertical">
                <Form.Item name="ketLuan" label="Kết luận" rules={[{ required: true, message: 'Chọn kết luận' }]}>
                  <Select size="large">
                    <Option value="dat">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircleOutlined style={{ color: '#389e0d' }} />
                        <span style={{ fontWeight: 600, color: '#389e0d' }}>ĐẠT — Sai số nằm trong ngưỡng cho phép</span>
                      </div>
                    </Option>
                    <Option value="khong_dat">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CloseCircleOutlined style={{ color: '#cf1322' }} />
                        <span style={{ fontWeight: 600, color: '#cf1322' }}>KHÔNG ĐẠT — Sai số vượt ngưỡng cho phép</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item name="nhanXet" label="Nhận xét / Lý do">
                  <TextArea rows={3} placeholder="Nhận xét của người đánh giá, lý do kết luận Đạt hoặc Không đạt..." />
                </Form.Item>

                <Form.Item name="nguoiDanhGia" label="Người đánh giá" initialValue="Nguyễn Văn Thắng">
                  <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                </Form.Item>
              </Form>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                <Button onClick={() => { setSelectedKQ(null); evalForm.resetFields(); }}>Hủy</Button>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleEvalSave}>
                  Xác nhận đánh giá
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ═══ DRAWER: Ký số chứng chỉ ═══ */}
      <Drawer
        open={!!signCC}
        onClose={() => { setSignCC(null); signForm.resetFields(); }}
        title={null} width={520} closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {signCC && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
              padding: '20px 24px',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginBottom: 4 }}>
                <KeyOutlined style={{ marginRight: 4 }} />Xác nhận ký số
              </Text>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Cấp chứng chỉ hiệu chuẩn</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginTop: 4 }}>
                Ký số điện tử và cấp chứng chỉ chính thức
              </Text>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Thông tin chứng chỉ */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 14 }}>Thông tin chứng chỉ</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
                <div>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Mã chứng chỉ</Text>
                  <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: colors.navy }}>{signCC.maChungChi || 'Chưa cấp mã'}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Loại</Text>
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>{signCC.loai}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Đối tượng đo</Text>
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>{signCC.thietBi}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Đơn vị</Text>
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>{signCC.donVi}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>KTV thực hiện</Text>
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>{signCC.ktvKy || '—'}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Kết luận</Text>
                  {signCC.ketLuan === 'dat'
                    ? <Tag icon={<CheckCircleOutlined />} color="success">Đạt</Tag>
                    : <Tag icon={<CloseCircleOutlined />} color="error">Không đạt</Tag>}
                </div>
              </div>

              <Divider style={{ margin: '0 0 20px' }} />

              {/* Form ký số */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 14 }}>
                <LockOutlined style={{ marginRight: 6, color: '#389e0d' }} />Xác nhận ký số điện tử
              </Text>

              <div style={{
                padding: '14px 16px', borderRadius: 8, marginBottom: 16,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#16a34a', fontSize: 18,
                  }}>
                    <SafetyCertificateOutlined />
                  </div>
                  <div>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#15803d', display: 'block' }}>Chứng chỉ sẽ được ký số</Text>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>Tích hợp chữ ký số CA, tem kiểm định K-Stamp điện tử</Text>
                  </div>
                </div>
              </div>

              <Form form={signForm} layout="vertical">
                <Form.Item name="nguoiKy" label="Người ký duyệt" initialValue="Nguyễn Văn Thắng" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                </Form.Item>
                <Form.Item name="chucVu" label="Chức vụ" initialValue="Trưởng Ban ĐL-CL Doanh nghiệp A">
                  <Input />
                </Form.Item>
                <Form.Item name="lyDo" label="Ghi chú (nếu có)">
                  <TextArea rows={2} placeholder="Ghi chú khi ký duyệt..." />
                </Form.Item>

                <div style={{
                  padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                  background: '#fffbeb', border: '1px solid #fde68a',
                }}>
                  <Text style={{ fontSize: 12, color: '#92400e' }}>
                    Bằng việc xác nhận, bạn đồng ý ký số điện tử lên chứng chỉ này.
                    Chứng chỉ sau khi ký <strong>không thể chỉnh sửa</strong>.
                  </Text>
                </div>
              </Form>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                <Button onClick={() => { setSignCC(null); signForm.resetFields(); }}>Hủy</Button>
                <Button type="primary" icon={<KeyOutlined />}
                  style={{ background: '#389e0d', borderColor: '#389e0d' }}
                  onClick={handleSign}>
                  Xác nhận ký số & Cấp CC
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default KetQuaDoPage;
