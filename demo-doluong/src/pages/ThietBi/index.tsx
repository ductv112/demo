import React, { useState, useMemo } from 'react';
import {
  Typography, Modal, Form, Input, Select, DatePicker, Row, Col,
  Button, Dropdown, message, Steps, Tabs, Drawer,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  ToolOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  DatabaseOutlined, WarningOutlined, ClockCircleOutlined, ExperimentOutlined,
  SendOutlined, CheckCircleOutlined, MedicineBoxOutlined,
  PlusOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors } from '../../theme/themeConfig';
import { danhSachThietBi as initData } from '../../data/thietBi';
import { danhSachDonVi } from '../../data/donVi';
import { danhSachPhongLab } from '../../data/phongLab';
import { formatDate, trangThaiTBConfig } from '../../utils/format';
import { PageHeader, SummaryCard, FilterBar, DataTable, StatusBadge } from '../../components';
import type { SummaryCardItem, FilterField } from '../../components';
import type { ThietBi, TrangThaiTB, HangMucDo } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const donViMap = Object.fromEntries(danhSachDonVi.map((dv) => [dv.id, dv.ten]));
const labMap = Object.fromEntries(danhSachPhongLab.map((l) => [l.id, l.ten]));
const linhVucOptions = [
  'Điện - Điện tử', 'Áp suất', 'Tần số - Vô tuyến', 'Tần số - Thời gian',
  'Nhiệt độ', 'Nhiệt độ - Độ ẩm', 'Khối lượng', 'Lưu lượng', 'Quang học',
  'Hình học', 'Rung động - Gia tốc',
];

// ─── Workflow: action nào khả dụng theo trạng thái ──────────────────────────
const workflowActions: Record<TrangThaiTB, { label: string; icon: React.ReactNode; nextStatus: TrangThaiTB; color: string }[]> = {
  con_han: [
    { label: 'Gửi hiệu chuẩn', icon: <SendOutlined />, nextStatus: 'bao_duong', color: '#7c3aed' },
  ],
  sap_han: [
    { label: 'Gửi hiệu chuẩn', icon: <SendOutlined />, nextStatus: 'bao_duong', color: '#7c3aed' },
  ],
  qua_han: [
    { label: 'Gửi hiệu chuẩn', icon: <SendOutlined />, nextStatus: 'bao_duong', color: '#7c3aed' },
  ],
  bao_duong: [
    { label: 'Đạt HC → Còn hạn', icon: <CheckCircleOutlined />, nextStatus: 'con_han', color: '#52c41a' },
    { label: 'Không đạt → Gửi bảo trì', icon: <MedicineBoxOutlined />, nextStatus: 'hong', color: '#ff4d4f' },
  ],
  hong: [
    { label: 'Sửa xong → Gửi HC lại', icon: <SendOutlined />, nextStatus: 'bao_duong', color: '#7c3aed' },
  ],
};

const ThietBiPage: React.FC = () => {
  const [data, setData] = useState<ThietBi[]>(initData);
  const [searchText, setSearchText] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState<TrangThaiTB | ''>('');
  const [filterLinhVuc, setFilterLinhVuc] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedTB, setSelectedTB] = useState<ThietBi | null>(null);
  const [form] = Form.useForm();
  const [editingKhaNangDo, setEditingKhaNangDo] = useState<HangMucDo[]>([]);

  const updateKhaNangDo = (idx: number, field: keyof HangMucDo, value: string) => {
    setEditingKhaNangDo((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter((tb) => {
      const matchText = !searchText ||
        tb.id.toLowerCase().includes(searchText.toLowerCase()) ||
        tb.ten.toLowerCase().includes(searchText.toLowerCase()) ||
        tb.maSerial.toLowerCase().includes(searchText.toLowerCase()) ||
        (donViMap[tb.donVi] || '').toLowerCase().includes(searchText.toLowerCase());
      const matchTrangThai = !filterTrangThai || tb.trangThai === filterTrangThai;
      const matchLinhVuc = !filterLinhVuc || tb.linhVuc === filterLinhVuc;
      return matchText && matchTrangThai && matchLinhVuc;
    });
  }, [data, searchText, filterTrangThai, filterLinhVuc]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    tongSo: data.length,
    quaHan: data.filter((tb) => tb.trangThai === 'qua_han').length,
    sapHan: data.filter((tb) => tb.trangThai === 'sap_han').length,
    baoDuong: data.filter((tb) => tb.trangThai === 'bao_duong').length,
  }), [data]);

  const linhVucList = useMemo(() => [...new Set(data.map((tb) => tb.linhVuc))].sort(), [data]);

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Tổng thiết bị', value: stats.tongSo, icon: <DatabaseOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'overdue', label: 'Quá hạn', value: stats.quaHan, icon: <WarningOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'expiring', label: 'Sắp hạn', value: stats.sapHan, icon: <ClockCircleOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'maintenance', label: 'Đang HC / Bảo trì', value: stats.baoDuong, icon: <ExperimentOutlined />, accentColor: '#7c3aed', bgColor: '#f3e8ff' },
  ];

  const filterFields: FilterField[] = [
    {
      key: 'trangThai', placeholder: 'Trạng thái', value: filterTrangThai, width: 150,
      onChange: (v) => setFilterTrangThai((v || '') as TrangThaiTB | ''),
      options: Object.entries(trangThaiTBConfig).map(([key, cfg]) => ({ value: key, label: cfg.label })),
    },
    {
      key: 'linhVuc', placeholder: 'Lĩnh vực', value: filterLinhVuc, width: 180,
      onChange: (v) => setFilterLinhVuc(v || ''),
      options: linhVucList.map((lv) => ({ value: lv, label: lv })),
    },
  ];

  // ─── Modal handlers ───────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedTB(null); setModalMode('add'); form.resetFields();
    setEditingKhaNangDo([]);
  };
  const openEdit = (record: ThietBi) => {
    setSelectedTB(record);
    setModalMode('edit');
    form.setFieldsValue({
      ...record,
      hanHieuChuan: record.hanHieuChuan ? dayjs(record.hanHieuChuan) : undefined,
      lanHieuChuanCuoi: record.lanHieuChuanCuoi ? dayjs(record.lanHieuChuanCuoi) : undefined,
    });
    setEditingKhaNangDo(record.khaNangDo ? [...record.khaNangDo] : []);
  };
  const openView = (record: ThietBi) => { setSelectedTB(record); setModalMode('view'); };
  const closeModal = () => { setModalMode(null); setSelectedTB(null); form.resetFields(); setEditingKhaNangDo([]); };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Filter out empty khaNangDo rows
      const validKhaNangDo = editingKhaNangDo.filter((item) => item.tenHangMuc.trim());
      const formData: ThietBi = {
        ...values,
        hanHieuChuan: values.hanHieuChuan ? values.hanHieuChuan.format('YYYY-MM-DD') : '',
        lanHieuChuanCuoi: values.lanHieuChuanCuoi ? values.lanHieuChuanCuoi.format('YYYY-MM-DD') : '',
        khaNangDo: validKhaNangDo.length > 0 ? validKhaNangDo : undefined,
      };
      if (modalMode === 'add') {
        const newId = `TB-${String(data.length + 1).padStart(3, '0')}`;
        setData((prev) => [...prev, { ...formData, id: newId }]);
        message.success('Đã thêm thiết bị mới');
      } else if (modalMode === 'edit' && selectedTB) {
        setData((prev) => prev.map((item) => item.id === selectedTB.id ? { ...formData, id: selectedTB.id } : item));
        message.success('Đã cập nhật thiết bị');
      }
      closeModal();
    });
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    message.success('Đã xóa thiết bị');
  };

  // ─── Workflow: chuyển trạng thái ──────────────────────────────────────────
  const handleChangeStatus = (record: ThietBi, nextStatus: TrangThaiTB, actionLabel: string) => {
    const updates: Partial<ThietBi> = { trangThai: nextStatus };

    // Nếu đạt HC → cập nhật ngày HC cuối + hạn HC mới
    if (nextStatus === 'con_han' && record.trangThai === 'bao_duong') {
      const today = dayjs().format('YYYY-MM-DD');
      const newHan = dayjs().add(record.chuKy, 'month').format('YYYY-MM-DD');
      updates.lanHieuChuanCuoi = today;
      updates.hanHieuChuan = newHan;
      updates.ghiChu = `Đạt hiệu chuẩn ${dayjs().format('DD/MM/YYYY')}. ${record.ghiChu || ''}`.trim();
    }

    // Nếu không đạt → ghi chú
    if (nextStatus === 'hong' && record.trangThai === 'bao_duong') {
      updates.ghiChu = `Không đạt HC ${dayjs().format('DD/MM/YYYY')}, chuyển bảo trì. ${record.ghiChu || ''}`.trim();
    }

    // Nếu gửi HC
    if (nextStatus === 'bao_duong') {
      updates.ghiChu = `Đang hiệu chuẩn từ ${dayjs().format('DD/MM/YYYY')}. ${record.ghiChu || ''}`.trim();
    }

    setData((prev) => prev.map((item) => item.id === record.id ? { ...item, ...updates } : item));
    message.success(`${record.id}: ${actionLabel}`);

    // Refresh selected if viewing
    if (selectedTB?.id === record.id) {
      setSelectedTB({ ...record, ...updates } as ThietBi);
    }
  };

  // ─── Action menu ──────────────────────────────────────────────────────────
  const getActionMenu = (record: ThietBi): MenuProps => {
    const wfActions = workflowActions[record.trangThai] || [];
    const wfItems: MenuProps['items'] = wfActions.length > 0 ? [
      { type: 'divider' },
      ...wfActions.map((action, idx) => ({
        key: `wf-${idx}`,
        icon: action.icon,
        label: <span style={{ color: action.color, fontWeight: 600 }}>{action.label}</span>,
      })),
    ] : [];

    return {
      items: [
        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
        { key: 'edit', icon: <EditOutlined />, label: 'Sửa' },
        ...wfItems,
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
      ],
      onClick: ({ key, domEvent }) => {
        domEvent.stopPropagation();
        if (key === 'view') openView(record);
        else if (key === 'edit') openEdit(record);
        else if (key === 'delete') {
          Modal.confirm({
            title: `Xóa thiết bị ${record.id}?`,
            content: `Bạn có chắc muốn xóa "${record.ten}"?`,
            okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
            onOk: () => handleDelete(record.id),
          });
        } else if (key.startsWith('wf-')) {
          const idx = parseInt(key.replace('wf-', ''), 10);
          const action = wfActions[idx];
          if (action) {
            Modal.confirm({
              title: action.label,
              content: `Xác nhận "${action.label}" cho ${record.ten} (${record.id})?`,
              okText: 'Xác nhận', cancelText: 'Hủy',
              onOk: () => handleChangeStatus(record, action.nextStatus, action.label),
            });
          }
        }
      },
    };
  };

  // ─── Workflow step for detail modal ───────────────────────────────────────
  const getWorkflowStep = (status: TrangThaiTB): number => {
    const map: Record<TrangThaiTB, number> = { con_han: 0, sap_han: 1, qua_han: 2, bao_duong: 3, hong: 4 };
    return map[status] ?? 0;
  };

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnsType<ThietBi> = [
    {
      title: 'Mã TB', dataIndex: 'id', key: 'id', width: 100,
      render: (text: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Tên thiết bị', key: 'tenSerial', width: 260,
      render: (_: unknown, record: ThietBi) => (
        <div>
          <Text strong style={{ fontSize: 13, display: 'block' }}>{record.ten}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>S/N: {record.maSerial}</Text>
        </div>
      ),
    },
    {
      title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 170,
      render: (donViId: string) => <Text style={{ fontSize: 13 }}>{donViMap[donViId] || donViId}</Text>,
    },
    {
      title: 'Phòng TN', dataIndex: 'phongLab', key: 'phongLab', width: 180,
      render: (labId: string) => labId ? (
        <Text style={{ fontSize: 12, color: '#1E6FD9' }}>
          <ExperimentOutlined style={{ marginRight: 4 }} />{labMap[labId] || labId}
        </Text>
      ) : <Text style={{ fontSize: 12, color: '#bfbfbf' }}>—</Text>,
    },
    {
      title: 'Lĩnh vực', dataIndex: 'linhVuc', key: 'linhVuc', width: 150,
      render: (lv: string) => (
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 12,
          fontWeight: 600, background: '#e8f4fd', color: '#1E6FD9', border: '1px solid #91caff',
        }}>{lv}</span>
      ),
    },
    {
      title: 'Dải đo', dataIndex: 'daiDo', key: 'daiDo', width: 180, ellipsis: true,
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Hạn HC', dataIndex: 'hanHieuChuan', key: 'hanHieuChuan', width: 110,
      render: (d: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Chu kỳ', dataIndex: 'chuKy', key: 'chuKy', width: 90,
      render: (ck: number) => <Text style={{ fontSize: 13, color: '#595959' }}>{ck} tháng</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 120,
      render: (trangThai: TrangThaiTB) => <StatusBadge status={trangThai} />,
    },
    {
      title: '', key: 'actions', width: 48, fixed: 'right',
      render: (_: unknown, record: ThietBi) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small"
            onClick={(e) => e.stopPropagation()} style={{ color: '#8c8c8c' }} />
        </Dropdown>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <style>{`
        .row-qua-han td { background: #fff1f0 !important; }
        .row-qua-han:hover td { background: #ffe8e6 !important; }
      `}</style>

      <PageHeader
        icon={<ToolOutlined />}
        title="Quản lý Hồ sơ Thiết bị (TMDE)"
        subtitle="Test, Measurement & Diagnostic Equipment — Doanh nghiệp A"
        ctaLabel="Thêm thiết bị"
        onCtaClick={openAdd}
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar
          searchText={searchText}
          searchPlaceholder="Tìm theo mã TB, tên, serial, đơn vị..."
          onSearchChange={setSearchText}
          filters={filterFields}
          resultCount={filteredData.length}
          totalCount={data.length}
          onClearAll={() => { setSearchText(''); setFilterTrangThai(''); setFilterLinhVuc(''); }}
        />
      </div>

      <DataTable<ThietBi>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        onRowClick={(record) => openView(record)}
        totalLabel="thiết bị"
        rowClassName={(record) => record.trangThai === 'qua_han' ? 'row-qua-han' : ''}
        scroll={{ x: 1300 }}
      />

      {/* ── Detail Drawer (View) ─────────────────────────────────────────── */}
      <Drawer
        open={modalMode === 'view'}
        onClose={closeModal}
        width={600}
        placement="right"
        closable={false}
        styles={{ body: { padding: 0 }, header: { display: 'none' } }}
      >
        {selectedTB && (() => {
          const khaNangDo = selectedTB.khaNangDo || [];
          const wfActions = workflowActions[selectedTB.trangThai] || [];
          const isOverdue = selectedTB.trangThai === 'qua_han';
          const isBroken = selectedTB.trangThai === 'hong';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* ─── Header ─────────────────────────────────────────── */}
              <div style={{
                background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 100%)`,
                padding: '20px 24px 16px', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Mã + Serial chip */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: 'rgba(255,255,255,0.15)', color: '#fff',
                      }}>{selectedTB.id}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11,
                        background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'monospace',
                      }}>S/N: {selectedTB.maSerial}</span>
                    </div>
                    {/* Tên TB */}
                    <Title level={5} style={{ color: '#fff', margin: 0, fontSize: 16, lineHeight: 1.4 }}>
                      {selectedTB.ten}
                    </Title>
                    {/* Đơn vị + Lĩnh vực */}
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                        {donViMap[selectedTB.donVi] || selectedTB.donVi}
                      </Text>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                        {selectedTB.linhVuc}
                      </Text>
                      {selectedTB.phongLab && (
                        <>
                          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                            <ExperimentOutlined style={{ marginRight: 3 }} />
                            {labMap[selectedTB.phongLab] || selectedTB.phongLab}
                          </Text>
                        </>
                      )}
                    </div>
                    {/* Status + cảnh báo */}
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <StatusBadge status={selectedTB.trangThai} />
                      {(isOverdue || isBroken) && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: 'rgba(255,77,79,0.2)', color: '#ff7875',
                        }}>
                          <WarningOutlined style={{ marginRight: 4 }} />
                          {isOverdue ? 'Cần hiệu chuẩn ngay' : 'Cần sửa chữa'}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button type="text" onClick={closeModal}
                    style={{ color: 'rgba(255,255,255,0.6)', marginTop: -4, marginRight: -8, fontSize: 18 }}>
                    ×
                  </Button>
                </div>
              </div>

              {/* ─── Body with Tabs ────────────────────────────────── */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <Tabs
                  defaultActiveKey="info"
                  style={{ height: '100%' }}
                  tabBarStyle={{ padding: '0 24px', margin: 0, borderBottom: '1px solid #f0f0f0' }}
                  items={[
                    {
                      key: 'info',
                      label: <span style={{ fontSize: 13 }}><DatabaseOutlined style={{ marginRight: 6 }} />Thông tin</span>,
                      children: (
                        <div style={{ padding: '16px 24px' }}>
                          {/* Workflow Steps */}
                          <div style={{ marginBottom: 20, padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                            <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              Quy trình hiệu chuẩn
                            </Text>
                            <Steps
                              size="small"
                              current={getWorkflowStep(selectedTB.trangThai)}
                              status={isBroken ? 'error' : isOverdue ? 'error' : 'process'}
                              items={[
                                { title: 'Còn hạn' },
                                { title: 'Sắp hạn' },
                                { title: 'Quá hạn' },
                                { title: 'Đang HC' },
                                { title: isBroken ? 'Bảo trì' : 'Hoàn tất' },
                              ]}
                            />
                          </div>

                          {/* Info cards */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Hiệu chuẩn card */}
                            <div style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                              <Text style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 10 }}>
                                Hiệu chuẩn
                              </Text>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Chu kỳ</Text>
                                  <Text style={{ fontSize: 14, fontWeight: 600 }}>{selectedTB.chuKy} tháng</Text>
                                </div>
                                <div>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Hạn HC</Text>
                                  <Text style={{ fontSize: 14, fontWeight: 600, color: isOverdue ? '#ff4d4f' : '#1a1a2e' }}>
                                    {formatDate(selectedTB.hanHieuChuan)}
                                  </Text>
                                </div>
                                <div>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Lần HC cuối</Text>
                                  <Text style={{ fontSize: 14, fontWeight: 600 }}>{formatDate(selectedTB.lanHieuChuanCuoi)}</Text>
                                </div>
                              </div>
                            </div>

                            {/* Thông số kỹ thuật card */}
                            <div style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                              <Text style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: 10 }}>
                                Thông số kỹ thuật
                              </Text>
                              <div>
                                <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Dải đo</Text>
                                <Text style={{ fontSize: 13, fontWeight: 500, fontFamily: 'monospace' }}>{selectedTB.daiDo}</Text>
                              </div>
                              <div style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Vị trí</Text>
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>{selectedTB.viTri || '—'}</Text>
                              </div>
                            </div>

                            {/* Ghi chú */}
                            {selectedTB.ghiChu && (
                              <div style={{ padding: '12px 16px', background: '#fffbe6', borderRadius: 8, border: '1px solid #fff1b8' }}>
                                <Text style={{ fontSize: 11, color: '#d48806', fontWeight: 600, display: 'block', marginBottom: 4 }}>Ghi chú</Text>
                                <Text style={{ fontSize: 13, lineHeight: 1.5 }}>{selectedTB.ghiChu}</Text>
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'khaNangDo',
                      label: (
                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ExperimentOutlined />Khả năng đo
                          {khaNangDo.length > 0 && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 18, height: 18, borderRadius: '50%', background: colors.navy,
                              color: '#fff', fontSize: 10, fontWeight: 700,
                            }}>{khaNangDo.length}</span>
                          )}
                        </span>
                      ),
                      children: (
                        <div style={{ padding: '16px 24px' }}>
                          {khaNangDo.length === 0 ? (
                            <div style={{
                              textAlign: 'center', padding: '48px 20px', background: '#fafbfc',
                              borderRadius: 8, border: '1px dashed #e8e8e8',
                            }}>
                              <ExperimentOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 8 }} />
                              <div style={{ color: '#8c8c8c', fontSize: 13 }}>Chưa khai báo khả năng đo</div>
                              <div style={{ color: '#bfbfbf', fontSize: 12, marginTop: 4 }}>
                                Bấm "Sửa" để thêm hạng mục đo cho thiết bị này
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {khaNangDo.map((hm, idx) => (
                                <div key={hm.id} style={{
                                  padding: '14px 16px', borderRadius: 10,
                                  border: '1px solid #e8f0fe', background: '#fafbff',
                                  position: 'relative',
                                }}>
                                  {/* Số thứ tự */}
                                  <div style={{
                                    position: 'absolute', top: -8, left: 12,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: colors.navy, color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 10, fontWeight: 700,
                                  }}>{idx + 1}</div>

                                  {/* Tên + Tiêu chuẩn */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>{hm.tenHangMuc}</Text>
                                    <span style={{
                                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                      background: '#e8f4fd', color: colors.navy, border: '1px solid #bdd8f5',
                                    }}>{hm.tieuChuanAD}</span>
                                  </div>

                                  {/* Specs grid */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
                                    <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                      <Text style={{ fontSize: 10, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Dải đo</Text>
                                      <Text style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 500 }}>{hm.daiDo}</Text>
                                    </div>
                                    <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                      <Text style={{ fontSize: 10, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Độ chính xác</Text>
                                      <Text style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#d48806' }}>{hm.doCx}</Text>
                                    </div>
                                    <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                      <Text style={{ fontSize: 10, color: '#8c8c8c', display: 'block', marginBottom: 2 }}>Đơn vị</Text>
                                      <Text style={{ fontSize: 12, fontWeight: 500 }}>{hm.donViDo}</Text>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'lichSu',
                      label: <span style={{ fontSize: 13 }}><ClockCircleOutlined style={{ marginRight: 6 }} />Lịch sử HC</span>,
                      children: (
                        <div style={{ padding: '16px 24px' }}>
                          {/* Placeholder timeline */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                              { date: selectedTB.lanHieuChuanCuoi, event: 'Hiệu chuẩn định kỳ', result: 'Đạt', color: '#52c41a' },
                              { date: (() => { const d = new Date(selectedTB.lanHieuChuanCuoi); d.setMonth(d.getMonth() - selectedTB.chuKy); return d.toISOString().split('T')[0]; })(), event: 'Hiệu chuẩn định kỳ', result: 'Đạt', color: '#52c41a' },
                              { date: (() => { const d = new Date(selectedTB.lanHieuChuanCuoi); d.setMonth(d.getMonth() - selectedTB.chuKy * 2); return d.toISOString().split('T')[0]; })(), event: 'Hiệu chuẩn ban đầu', result: 'Đạt', color: '#52c41a' },
                            ].map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 12 }}>
                                {/* Timeline line */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                                  <div style={{
                                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                    background: idx === 0 ? colors.navy : '#d9d9d9',
                                    border: idx === 0 ? `2px solid ${colors.navy}40` : 'none',
                                  }} />
                                  {idx < 2 && <div style={{ width: 2, flex: 1, background: '#f0f0f0', minHeight: 40 }} />}
                                </div>
                                {/* Content */}
                                <div style={{ paddingBottom: 20, flex: 1 }}>
                                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block' }}>{formatDate(item.date)}</Text>
                                  <Text style={{ fontSize: 13, fontWeight: 500, display: 'block', marginTop: 2 }}>{item.event}</Text>
                                  <span style={{
                                    display: 'inline-block', marginTop: 4,
                                    padding: '1px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                    background: `${item.color}15`, color: item.color,
                                  }}>
                                    {item.result}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              {/* ─── Footer ───────────────────────────────────────── */}
              <div style={{
                flexShrink: 0, padding: '12px 24px', borderTop: '1px solid #f0f0f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc',
              }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {wfActions.map((action, idx) => (
                    <Button key={idx} size="small" icon={action.icon}
                      style={{ color: action.color, borderColor: action.color, fontSize: 12 }}
                      onClick={() => {
                        Modal.confirm({
                          title: action.label,
                          content: `Xác nhận "${action.label}" cho ${selectedTB.ten}?`,
                          okText: 'Xác nhận', cancelText: 'Hủy',
                          onOk: () => handleChangeStatus(selectedTB, action.nextStatus, action.label),
                        });
                      }}>
                      {action.label}
                    </Button>
                  ))}
                </div>
                <Button size="small" icon={<EditOutlined />} type="primary"
                  onClick={() => { closeModal(); openEdit(selectedTB); }}>
                  Sửa
                </Button>
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* ── Add/Edit Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={modalMode === 'add' || modalMode === 'edit'}
        onClose={closeModal}
        width={620}
        placement="right"
        closable={false}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0d3b66 0%, #1E6FD9 100%)',
            padding: '18px 24px', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ToolOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontSize: 15 }}>
                    {modalMode === 'add' ? 'Thêm thiết bị mới' : `Sửa ${selectedTB?.id || ''}`}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                    {modalMode === 'add' ? 'Đăng ký thiết bị đo vào hệ thống TMDE' : 'Cập nhật thông tin thiết bị đo'}
                  </Text>
                </div>
              </div>
              <Button type="text" onClick={closeModal}
                style={{ color: 'rgba(255,255,255,0.7)', marginTop: -4, marginRight: -8 }}
                icon={<span style={{ fontSize: 18 }}>×</span>} />
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 20px' }}>
            <Tabs
            defaultActiveKey="info"
            style={{ marginTop: 4 }}
            items={[
              {
                key: 'info',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DatabaseOutlined />Thông tin thiết bị
                  </span>
                ),
                children: (
                  <Form form={form} layout="vertical" size="middle" style={{ paddingTop: 4 }}>
                    {/* Section: Định danh */}
                    <div style={{ marginBottom: 6 }}>
                      <Text strong style={{ fontSize: 13, color: '#1a1a2e' }}>Định danh</Text>
                    </div>
                    <Row gutter={16}>
                      <Col span={14}>
                        <Form.Item name="ten" label="Tên thiết bị" rules={[{ required: true, message: 'Nhập tên' }]}>
                          <Input placeholder="VD: Thiết bị kiểm tra chẩn đoán DTA-144C" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item name="maSerial" label="Số serial (S/N)" rules={[{ required: true, message: 'Nhập serial' }]}>
                          <Input placeholder="VD: DTA-144C-VN2024-0087" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Section: Phân loại & Vị trí */}
                    <div style={{ marginBottom: 6, marginTop: 4 }}>
                      <Text strong style={{ fontSize: 13, color: '#1a1a2e' }}>Phân loại & Vị trí</Text>
                    </div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="donVi" label="Đơn vị quản lý" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                          <Select placeholder="Chọn đơn vị" showSearch optionFilterProp="children">
                            {danhSachDonVi.map((dv) => (
                              <Option key={dv.id} value={dv.id}>{dv.ten}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="phongLab" label="Phòng thí nghiệm">
                          <Select placeholder="Chọn phòng TN" allowClear showSearch optionFilterProp="children">
                            {danhSachPhongLab.map((lab) => (
                              <Option key={lab.id} value={lab.id}>{lab.ten} ({lab.viTri})</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="linhVuc" label="Lĩnh vực đo" rules={[{ required: true, message: 'Chọn lĩnh vực' }]}>
                          <Select placeholder="Chọn lĩnh vực" showSearch optionFilterProp="children">
                            {linhVucOptions.map((lv) => <Option key={lv} value={lv}>{lv}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="viTri" label="Vị trí lắp đặt / kho">
                          <Input placeholder="VD: Xưởng SC SĐ PK 361" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true, message: 'Chọn' }]}
                          initialValue="con_han">
                          <Select>
                            {Object.entries(trangThaiTBConfig).map(([key, cfg]) => (
                              <Option key={key} value={key}>{cfg.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="daiDo" label="Dải đo tổng quát" rules={[{ required: true, message: 'Nhập dải đo' }]}>
                      <Input placeholder="VD: 144 kênh số, tốc độ 0.3 kHz ~ 5 MHz, nguồn 0-36V/6A" />
                    </Form.Item>

                    {/* Section: Hiệu chuẩn */}
                    <div style={{ marginBottom: 6, marginTop: 4 }}>
                      <Text strong style={{ fontSize: 13, color: '#1a1a2e' }}>Thông tin hiệu chuẩn</Text>
                    </div>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="chuKy" label="Chu kỳ HC" rules={[{ required: true, message: 'Chọn' }]}>
                          <Select placeholder="Chọn chu kỳ">
                            {[6, 12, 18, 24, 36].map((v) => <Option key={v} value={v}>{v} tháng</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="hanHieuChuan" label="Hạn hiệu chuẩn">
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="lanHieuChuanCuoi" label="Lần HC cuối">
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="ghiChu" label="Ghi chú" style={{ marginBottom: 0 }}>
                      <TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" />
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'khaNangDo',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ExperimentOutlined />
                    Khả năng đo
                    {editingKhaNangDo.length > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 20, height: 20, borderRadius: '50%', background: '#1E6FD9',
                        color: '#fff', fontSize: 11, fontWeight: 700,
                      }}>
                        {editingKhaNangDo.length}
                      </span>
                    )}
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: 4 }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8,
                      border: '1px dashed #d9d9d9',
                    }}>
                      <div>
                        <Text strong style={{ fontSize: 13, color: '#1a1a2e', display: 'block' }}>
                          Danh sách hạng mục đo đạc
                        </Text>
                        <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Thiết lập các phép đo mà thiết bị này có khả năng thực hiện
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        ghost
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const newItem: HangMucDo = {
                            id: `HM-NEW-${Date.now()}`,
                            tenHangMuc: '', daiDo: '', doCx: '', donViDo: '', tieuChuanAD: '',
                          };
                          setEditingKhaNangDo((prev) => [...prev, newItem]);
                        }}
                      >
                        Thêm hạng mục
                      </Button>
                    </div>

                    {/* Table or Empty */}
                    {editingKhaNangDo.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: '40px 20px', background: '#fafbfc',
                        borderRadius: 8, border: '1px dashed #e8e8e8',
                      }}>
                        <ExperimentOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 12 }} />
                        <div style={{ color: '#8c8c8c', fontSize: 14 }}>Chưa có hạng mục đo nào</div>
                        <div style={{ color: '#bfbfbf', fontSize: 12, marginTop: 4 }}>
                          Bấm "Thêm hạng mục" để khai báo khả năng đo của thiết bị
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {editingKhaNangDo.map((item, idx) => (
                          <div
                            key={item.id}
                            style={{
                              padding: '14px 16px', borderRadius: 8,
                              border: '1px solid #e8e8e8', background: '#fff',
                              transition: 'box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <Text strong style={{ fontSize: 12, color: colors.navy }}>
                                Hạng mục #{idx + 1}
                              </Text>
                              <Button type="text" danger size="small" icon={<MinusCircleOutlined />}
                                onClick={() => setEditingKhaNangDo((prev) => prev.filter((_, i) => i !== idx))}>
                                Xóa
                              </Button>
                            </div>
                            <Row gutter={12}>
                              <Col span={10}>
                                <div style={{ marginBottom: 4 }}>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Tên hạng mục đo *</Text>
                                </div>
                                <Input size="small" value={item.tenHangMuc} placeholder="VD: Điện áp DC"
                                  onChange={(e) => updateKhaNangDo(idx, 'tenHangMuc', e.target.value)} />
                              </Col>
                              <Col span={8}>
                                <div style={{ marginBottom: 4 }}>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Dải đo</Text>
                                </div>
                                <Input size="small" value={item.daiDo} placeholder="VD: 0 ~ 1000 V"
                                  onChange={(e) => updateKhaNangDo(idx, 'daiDo', e.target.value)} />
                              </Col>
                              <Col span={6}>
                                <div style={{ marginBottom: 4 }}>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Đơn vị đo</Text>
                                </div>
                                <Input size="small" value={item.donViDo} placeholder="V, Hz, °C"
                                  onChange={(e) => updateKhaNangDo(idx, 'donViDo', e.target.value)} />
                              </Col>
                            </Row>
                            <Row gutter={12} style={{ marginTop: 8 }}>
                              <Col span={10}>
                                <div style={{ marginBottom: 4 }}>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Độ chính xác / Sai số cho phép</Text>
                                </div>
                                <Input size="small" value={item.doCx} placeholder="VD: ±0.05%"
                                  onChange={(e) => updateKhaNangDo(idx, 'doCx', e.target.value)} />
                              </Col>
                              <Col span={14}>
                                <div style={{ marginBottom: 4 }}>
                                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Tiêu chuẩn áp dụng</Text>
                                </div>
                                <Input size="small" value={item.tieuChuanAD} placeholder="VD: ĐLVN 154:2022, ISO 10012:2003"
                                  onChange={(e) => updateKhaNangDo(idx, 'tieuChuanAD', e.target.value)} />
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
          </div>

          {/* Footer */}
          <div style={{
            flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 8,
            padding: '12px 24px', borderTop: '1px solid #f0f0f0', background: '#fafbfc',
          }}>
            <Button onClick={closeModal}>Hủy</Button>
            <Button type="primary" onClick={handleSave}>
              {modalMode === 'add' ? 'Thêm thiết bị' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ThietBiPage;
