import React, { useState, useMemo } from 'react';
import {
  Typography, Modal, Form, Input, Select, Row, Col,
  DatePicker, Button, Dropdown, message, Progress, Tooltip, Drawer,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  FileSearchOutlined, EyeOutlined, EditOutlined,
  MoreOutlined, OrderedListOutlined,
  CheckCircleOutlined,
  CalendarOutlined, SendOutlined, AuditOutlined,
  ExperimentOutlined, WarningOutlined, PercentageOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { danhSachDonVi } from '../../data/donVi';
import { danhSachKeHoach } from '../../data/keHoachDo';
import { formatDate, trangThaiYCConfig, uuTienConfig } from '../../utils/format';
import { PageHeader, SummaryCard, FilterBar, DataTable, StatusBadge, PriorityBadge } from '../../components';
import type { SummaryCardItem, FilterField } from '../../components';
import type { YeuCau, TrangThaiYC, MucDoUuTien } from '../../types';
import { colors } from '../../theme/themeConfig';
import { danhSachYeuCau } from './data';

const { Text } = Typography;
const { Option } = Select;

const donViMap = Object.fromEntries(danhSachDonVi.map((dv) => [dv.id, dv.ten]));
const khByYc = Object.fromEntries(danhSachKeHoach.map((kh) => [kh.maYeuCau, kh]));

// ─── Deadline ───────────────────────────────────────────────────────────────
const TODAY = new Date('2026-03-27');
const daysTo = (d: string) => Math.ceil((new Date(d).getTime() - TODAY.getTime()) / 864e5);
const isOver = (yc: YeuCau) => !['hoan_thanh', 'tu_choi'].includes(yc.trangThai) && daysTo(yc.ngayHen) < 0;
const isNear = (yc: YeuCau) => !['hoan_thanh', 'tu_choi'].includes(yc.trangThai) && daysTo(yc.ngayHen) >= 0 && daysTo(yc.ngayHen) <= 3;

// ═════════════════════════════════════════════════════════════════════════════
const YeuCauPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterTT, setFilterTT] = useState<TrangThaiYC | ''>('');
  const [filterUT, setFilterUT] = useState<MucDoUuTien | ''>('');
  const [createVisible, setCreateVisible] = useState(false);
  const [form] = Form.useForm();

  const filtered = useMemo(() => danhSachYeuCau.filter((yc) => {
    const s = searchText.toLowerCase();
    const matchText = !s || yc.id.toLowerCase().includes(s) || yc.thietBi.toLowerCase().includes(s) || (donViMap[yc.donVi] || '').toLowerCase().includes(s) || yc.maThietBi.toLowerCase().includes(s);
    return matchText && (!filterTT || yc.trangThai === filterTT) && (!filterUT || yc.uuTien === filterUT);
  }), [searchText, filterTT, filterUT]);

  // ─── KPI ──────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const t = danhSachYeuCau.length;
    const over = danhSachYeuCau.filter(isOver).length;
    const near = danhSachYeuCau.filter(isNear).length;
    const hasKH = danhSachYeuCau.filter((yc) => !!khByYc[yc.id]).length;
    const pct = t > 0 ? Math.round(((t - over) / t) * 100) : 0;
    return { total: t, dungHan: pct, treHan: over + near, daLapKH: hasKH };
  }, []);

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Tổng yêu cầu', value: kpi.total, icon: <OrderedListOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'ontime', label: 'Đúng hạn', value: `${kpi.dungHan}%`, icon: <PercentageOutlined />, accentColor: kpi.dungHan >= 80 ? '#389e0d' : '#d48806', bgColor: kpi.dungHan >= 80 ? '#f0fce8' : '#fff7e6' },
    { key: 'late', label: 'Trễ / Sắp trễ hạn', value: kpi.treHan, icon: <WarningOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'planned', label: 'Đã lập KH', value: `${kpi.daLapKH}/${kpi.total}`, icon: <CalendarOutlined />, accentColor: '#0070cc', bgColor: '#e8f4fd' },
  ];

  const filterFields: FilterField[] = [
    { key: 'tt', placeholder: 'Trạng thái', value: filterTT, width: 160, onChange: (v) => setFilterTT((v || '') as TrangThaiYC | ''), options: Object.entries(trangThaiYCConfig).map(([k, c]) => ({ value: k, label: c.label })) },
    { key: 'ut', placeholder: 'Ưu tiên', value: filterUT, width: 140, onChange: (v) => setFilterUT((v || '') as MucDoUuTien | ''), options: Object.entries(uuTienConfig).map(([k, c]) => ({ value: k, label: c.label })) },
  ];

  // ─── Context menu ─────────────────────────────────────────────────────────
  const getMenu = (r: YeuCau): MenuProps['items'] => {
    const kh = khByYc[r.id];
    const items: MenuProps['items'] = [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/yeu-cau/${r.id}`) },
    ];
    switch (r.trangThai) {
      case 'moi_tao':
        items.push({ type: 'divider' },
          { key: 'tiep', icon: <SendOutlined />, label: <span style={{ color: colors.navy, fontWeight: 600 }}>Tiếp nhận yêu cầu</span>, onClick: () => message.success(`Đã tiếp nhận ${r.id}`) });
        break;
      case 'da_tiep_nhan':
        items.push({ type: 'divider' },
          kh ? { key: 'kh', icon: <CalendarOutlined />, label: 'Xem kế hoạch đo', onClick: () => navigate(`/ke-hoach-do/${kh.id}`) }
             : { key: 'kh', icon: <CalendarOutlined />, label: <span style={{ color: '#0070cc', fontWeight: 600 }}>Tạo kế hoạch đo</span>, onClick: () => navigate('/ke-hoach-do/tao-moi') });
        break;
      case 'dang_do':
        if (kh) items.push({ type: 'divider' }, { key: 'kh', icon: <ExperimentOutlined />, label: 'Xem tiến độ đo', onClick: () => navigate(`/ke-hoach-do/${kh.id}`) });
        break;
      case 'cho_phe_duyet':
        items.push({ type: 'divider' },
          { key: 'duyet', icon: <AuditOutlined />, label: <span style={{ color: '#389e0d', fontWeight: 600 }}>Phê duyệt kết quả</span>, onClick: () => message.success(`Đã phê duyệt ${r.id}`) });
        break;
      case 'hoan_thanh':
        items.push({ type: 'divider' }, { key: 'kq', icon: <CheckCircleOutlined />, label: 'Xem kết quả & Chứng chỉ', onClick: () => navigate('/ket-qua') });
        break;
    }
    if (!['hoan_thanh', 'tu_choi'].includes(r.trangThai)) {
      items.push({ type: 'divider' },
        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: () => message.info(`Chỉnh sửa ${r.id}`) },
        { key: 'cancel', icon: <StopOutlined />, label: 'Hủy yêu cầu', danger: true, onClick: () => Modal.confirm({ title: `Hủy ${r.id}?`, content: 'Bạn có chắc muốn hủy yêu cầu này?', okText: 'Hủy YC', okType: 'danger', cancelText: 'Không', onOk: () => message.success(`Đã hủy ${r.id}`) }) });
    }
    return items;
  };

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnsType<YeuCau> = [
    {
      title: 'Mã YC', dataIndex: 'id', key: 'id', width: 120,
      render: (t: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{t}</Text>,
    },
    {
      title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 155,
      render: (id: string) => <Text style={{ fontSize: 13 }}>{donViMap[id] || id}</Text>,
    },
    {
      title: 'Đối tượng đo', key: 'doiTuong', width: 290, ellipsis: { showTitle: true },
      render: (_: unknown, r: YeuCau) => (
        <div>
          <Text style={{ fontSize: 13, fontWeight: 500, display: 'block', lineHeight: 1.4 }} title={r.thietBi}>{r.thietBi}</Text>
          <Text style={{ fontSize: 11, color: '#8c8c8c', fontFamily: 'monospace' }}>{r.maThietBi}</Text>
        </div>
      ),
    },
    {
      title: 'Mục đích', dataIndex: 'mucDich', key: 'mucDich', width: 165,
      render: (t: string) => <Text style={{ fontSize: 12, color: '#595959' }}>{t}</Text>,
    },
    {
      title: 'Ưu tiên', dataIndex: 'uuTien', key: 'uuTien', width: 100,
      render: (ut: MucDoUuTien) => <PriorityBadge priority={ut} />,
    },
    {
      title: 'Hạn trả', dataIndex: 'ngayHen', key: 'ngayHen', width: 110,
      render: (d: string, r: YeuCau) => {
        const o = isOver(r); const n = isNear(r); const dd = daysTo(d);
        return (
          <div>
            <Text style={{ fontSize: 13, fontWeight: o || n ? 600 : 400, color: o ? '#ff4d4f' : n ? '#d48806' : '#595959' }}>{formatDate(d)}</Text>
            {o && <div style={{ fontSize: 10, color: '#ff4d4f', fontWeight: 600, marginTop: 1 }}>Trễ {Math.abs(dd)} ngày</div>}
            {n && !o && <div style={{ fontSize: 10, color: '#d48806', fontWeight: 600, marginTop: 1 }}>Còn {dd} ngày</div>}
          </div>
        );
      },
    },
    {
      title: 'Kế hoạch', key: 'kh', width: 115,
      render: (_: unknown, r: YeuCau) => {
        const kh = khByYc[r.id];
        if (!kh) return <Text style={{ fontSize: 11, color: '#bfbfbf' }}>Chưa lập</Text>;
        return (
          <Tooltip title={`${kh.id} — ${kh.tienDo}%`}>
            <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate(`/ke-hoach-do/${kh.id}`); }}>
              <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>{kh.id}</Text>
              <Progress percent={kh.tienDo} size="small" showInfo={false}
                strokeColor={kh.tienDo >= 100 ? '#52c41a' : colors.navy}
                style={{ width: 72, margin: '2px 0 0' }} />
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 145,
      render: (tt: TrangThaiYC) => <StatusBadge status={tt} />,
    },
    {
      title: '', key: 'act', width: 44, fixed: 'right',
      render: (_: unknown, r: YeuCau) => (
        <Dropdown menu={{ items: getMenu(r) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small"
            onClick={(e) => e.stopPropagation()} style={{ color: '#8c8c8c' }} />
        </Dropdown>
      ),
    },
  ];

  const handleCreate = () => {
    form.validateFields().then((values) => {
      console.log('Tạo:', values);
      message.success('Đã tạo yêu cầu đo lường mới');
      setCreateVisible(false); form.resetFields();
    });
  };

  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <style>{`
        .row-overdue td { background: #fff1f0 !important; }
        .row-overdue:hover td { background: #ffe4e6 !important; }
        .row-near td { background: #fffbe6 !important; }
        .row-near:hover td { background: #fff7cc !important; }
      `}</style>

      <PageHeader
        icon={<FileSearchOutlined />}
        title="Quản lý Yêu cầu đo lường"
        subtitle="Measurement Request Management (MRM) — Doanh nghiệp A"
        ctaLabel="Tạo yêu cầu"
        onCtaClick={() => navigate('/yeu-cau/tao-moi')}
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar
          searchText={searchText}
          searchPlaceholder="Tìm theo mã YC, đối tượng đo, đơn vị..."
          onSearchChange={setSearchText}
          filters={filterFields}
          resultCount={filtered.length}
          totalCount={danhSachYeuCau.length}
          onClearAll={() => { setSearchText(''); setFilterTT(''); setFilterUT(''); }}
        />
      </div>

      <DataTable<YeuCau>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        onRowClick={(r) => navigate(`/yeu-cau/${r.id}`)}
        totalLabel="yêu cầu"
        rowClassName={(r) => isOver(r) ? 'row-overdue' : isNear(r) ? 'row-near' : ''}
        scroll={{ x: 1350 }}
      />

      {/* ═══ TẠO YÊU CẦU ═══════════════════════════════════════════════════ */}
      <Drawer
        open={createVisible}
        onClose={() => { setCreateVisible(false); form.resetFields(); }}
        title="Tạo yêu cầu đo lường mới"
        width={680}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => { setCreateVisible(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" onClick={handleCreate}>Tạo yêu cầu</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="donVi" label="Đơn vị yêu cầu" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                <Select placeholder="Chọn đơn vị" showSearch optionFilterProp="children">
                  {danhSachDonVi.map((dv) => <Option key={dv.id} value={dv.id}>{dv.ten}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mucDich" label="Mục đích đo" rules={[{ required: true, message: 'Chọn mục đích' }]}>
                <Select placeholder="Chọn mục đích">
                  <Option value="Kiểm tra định kỳ">Kiểm tra định kỳ</Option>
                  <Option value="Đánh giá sau bảo trì">Đánh giá sau bảo trì</Option>
                  <Option value="Đo kiểm nghiệm thu">Đo kiểm nghiệm thu</Option>
                  <Option value="Xác minh sai lệch kỹ thuật">Xác minh sai lệch kỹ thuật</Option>
                  <Option value="Kiểm tra phục vụ bảo trì">Kiểm tra phục vụ bảo trì</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="thietBi" label="Đối tượng đo (tên thiết bị / hệ thống kỹ thuật)" rules={[{ required: true, message: 'Nhập tên đối tượng đo' }]}>
            <Input placeholder="VD: Khối phát thiết bị monitoring TX-18, Hệ thống làm mát data center DC-125 — module thủy lực bơm tuần hoàn" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="maThietBi" label="Mã / Ký hiệu đối tượng" rules={[{ required: true, message: 'Nhập mã' }]}>
                <Input placeholder="VD: DTD-RA18-361-01" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="uuTien" label="Mức ưu tiên" rules={[{ required: true, message: 'Chọn' }]}>
                <Select placeholder="Chọn mức ưu tiên">
                  {Object.entries(uuTienConfig).map(([k, c]) => <Option key={k} value={k}>{c.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ngayHen" label="Hạn trả kết quả" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="phongLab" label="Phòng Lab yêu cầu" rules={[{ required: true, message: 'Chọn' }]}>
            <Select placeholder="Chọn phòng Lab">
              {['Phòng Lab Điện-Điện tử', 'Phòng Lab Tín hiệu - Truyền dẫn', 'Phòng Lab Nhiệt-Quang', 'Phòng Lab Áp suất', 'Phòng Lab Khối lượng-Hình học', 'Phòng Lab Lưu lượng', 'Phòng Lab Rung động'].map((l) => (
                <Option key={l} value={l}>{l}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="ghiChu" label="Ghi chú / Mô tả yêu cầu">
            <Input.TextArea rows={3} placeholder="Mô tả nội dung cần đo, lý do, lưu ý đặc biệt..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default YeuCauPage;
