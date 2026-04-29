import React, { useState } from 'react';
import { Typography, Card, Row, Col, Table, Tag, Button, Input, Select, Empty, message } from 'antd';
import {
  SafetyCertificateOutlined, SearchOutlined, FilePdfOutlined,
  DownloadOutlined, EyeOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { PageHeader } from '../../components';

const { Text } = Typography;
const { Option } = Select;


interface ChungChiRecord {
  id: string;
  maChungChi: string;
  maYeuCau: string;
  thietBi: string;
  donVi: string;
  ngayCap: string;
  ngayHetHan: string;
  ktvKy: string;
  truongPhongKy: string;
  ketLuan: 'dat' | 'khong_dat';
  trangThai: 'da_cap' | 'cho_ky' | 'ban_nhap';
  loai: 'Chứng chỉ HC' | 'Biên bản KĐ' | 'Tem K-Stamp';
}

const chungChiData: ChungChiRecord[] = [
  { id: 'CC-001', maChungChi: 'CC-2026-0001', maYeuCau: 'YC-2026-001', thietBi: 'Khối phát hệ thống monitoring TX-18 Terek', donVi: 'TT Phần mềm Alpha 361', ngayCap: '2026-03-18', ngayHetHan: '2027-03-18', ktvKy: 'Trần Văn Bình', truongPhongKy: 'Phạm Quang Huy', ketLuan: 'dat', trangThai: 'da_cap', loai: 'Chứng chỉ HC' },
  { id: 'CC-002', maChungChi: 'CC-2026-0002', maYeuCau: 'YC-2026-003', thietBi: 'Hệ thống làm mát data center DC-300 — module thủy lực', donVi: 'TT.Cloud 367', ngayCap: '2026-03-22', ngayHetHan: '2027-03-22', ktvKy: 'Phạm Quang Huy', truongPhongKy: 'Nguyễn Văn Thắng', ketLuan: 'dat', trangThai: 'cho_ky', loai: 'Chứng chỉ HC' },
  { id: 'CC-003', maChungChi: 'CC-2026-0003', maYeuCau: 'YC-2026-004', thietBi: 'Bộ nguồn cao áp module SA-6 Kub', donVi: 'TT Phần mềm 921', ngayCap: '2026-03-25', ngayHetHan: '2027-03-25', ktvKy: 'Trần Văn Bình', truongPhongKy: '', ketLuan: 'dat', trangThai: 'ban_nhap', loai: 'Biên bản KĐ' },
  { id: 'CC-004', maChungChi: 'CC-2026-0004', maYeuCau: 'YC-2026-005', thietBi: 'Kênh thu hệ thống monitoring 36D6', donVi: 'TT Monitoring 26', ngayCap: '2026-03-15', ngayHetHan: '2027-03-15', ktvKy: 'Phạm Tuấn Anh', truongPhongKy: 'Phạm Quang Huy', ketLuan: 'dat', trangThai: 'da_cap', loai: 'Chứng chỉ HC' },
  { id: 'CC-005', maChungChi: '', maYeuCau: 'YC-2026-007', thietBi: 'Module dẫn truyền dữ liệu KH-29', donVi: 'TT Monitoring 291', ngayCap: '', ngayHetHan: '', ktvKy: '', truongPhongKy: '', ketLuan: 'khong_dat', trangThai: 'ban_nhap', loai: 'Biên bản KĐ' },
];

const ttConfig: Record<string, { label: string; color: string }> = {
  da_cap: { label: 'Đã cấp', color: '#16a34a' },
  cho_ky: { label: 'Chờ ký', color: '#d97706' },
  ban_nhap: { label: 'Bản nháp', color: '#6b7280' },
};

const ChungChiPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterTT, setFilterTT] = useState('');

  const filtered = chungChiData.filter((r) => {
    const s = search.toLowerCase();
    const matchText = !s || r.maChungChi.toLowerCase().includes(s) || r.thietBi.toLowerCase().includes(s) || r.maYeuCau.toLowerCase().includes(s);
    const matchTT = !filterTT || r.trangThai === filterTT;
    return matchText && matchTT;
  });

  const stats = { total: chungChiData.length, daCap: chungChiData.filter((r) => r.trangThai === 'da_cap').length, choKy: chungChiData.filter((r) => r.trangThai === 'cho_ky').length };

  const columns = [
    { title: 'Mã CC', dataIndex: 'maChungChi', width: 140, render: (v: string) => v ? <Text strong style={{ color: colors.navy, fontFamily: 'monospace' }}>{v}</Text> : <Text style={{ color: '#bfbfbf' }}>Chưa cấp</Text> },
    { title: 'Mã YC', dataIndex: 'maYeuCau', width: 120, render: (v: string) => <Text style={{ color: colors.navy, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/yeu-cau/${v}`)}>{v}</Text> },
    { title: 'Đối tượng đo', dataIndex: 'thietBi', ellipsis: true, render: (v: string) => <Text style={{ fontWeight: 500 }}>{v}</Text> },
    { title: 'Đơn vị', dataIndex: 'donVi', width: 160 },
    { title: 'Loại', dataIndex: 'loai', width: 120, render: (v: string) => <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>{v}</Tag> },
    { title: 'Ngày cấp', dataIndex: 'ngayCap', width: 110, render: (v: string) => v ? v.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1') : '—' },
    { title: 'Kết luận', dataIndex: 'ketLuan', width: 100, render: (v: string) => v === 'dat' ? <Tag icon={<CheckCircleOutlined />} color="success">Đạt</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">K.Đạt</Tag> },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 110, render: (v: string) => { const c = ttConfig[v]; return <Tag style={{ borderRadius: 4, margin: 0, fontWeight: 600, color: c.color, background: c.color + '12', border: `1px solid ${c.color}30` }}>{c.label}</Tag>; } },
    { title: '', width: 100, render: (_: unknown, r: ChungChiRecord) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => message.info(`Xem ${r.id}`)} />
        {r.trangThai === 'da_cap' && <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => message.success('Tải PDF')} />}
        {r.trangThai === 'da_cap' && <Button type="text" size="small" icon={<PrinterOutlined />} onClick={() => message.info('In chứng chỉ')} />}
      </div>
    )},
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<SafetyCertificateOutlined />}
        title="Cấp Chứng chỉ điện tử"
        subtitle="e-Certificate — Sinh chứng chỉ hiệu chuẩn PDF, chữ ký số, tem K-Stamp"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng chứng chỉ', value: stats.total, gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' },
          { label: 'Đã cấp', value: stats.daCap, gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
          { label: 'Chờ ký duyệt', value: stats.choKy, gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '16px 18px', borderRadius: 10, background: s.gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'block' }}>{s.label}</Text>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{s.value}</Text>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, padding: '14px 20px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Input placeholder="Tìm mã CC, mã YC, thiết bị..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ flex: '1 1 250px', maxWidth: 320 }} />
        <Select placeholder="Trạng thái" value={filterTT || undefined} onChange={(v) => setFilterTT(v || '')} allowClear style={{ flex: '0 1 150px' }}>
          {Object.entries(ttConfig).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
        </Select>
      </div>

      <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={false} size="middle" scroll={{ x: 1100 }} />
      </Card>
    </div>
  );
};

export default ChungChiPage;
