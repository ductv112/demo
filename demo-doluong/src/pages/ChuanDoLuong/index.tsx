import React, { useState, useMemo } from 'react';
import {
  Card, Typography, Modal, Form, Input, Select, DatePicker, Row, Col,
  Button, Dropdown, message, Drawer,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  AimOutlined, DatabaseOutlined, CheckCircleOutlined,
  SafetyCertificateOutlined, GlobalOutlined,
  MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors } from '../../theme/themeConfig';
import { danhSachChuanDo as initData } from '../../data/chuanDo';
import { formatDate, trangThaiChuanConfig } from '../../utils/format';
import { PageHeader, SummaryCard, DataTable, StatusBadge } from '../../components';
import type { SummaryCardItem } from '../../components';
import type { ChuanDoLuong, CapChuan, TrangThaiChuan } from '../../types';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Traceability chain ──────────────────────────────────────────────────────
const traceabilityNodes = [
  { label: 'Chuẩn Quốc gia', sub: 'VMI / PTB', icon: '🏛', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', light: '#fef2f2' },
  { label: 'Chuẩn Tổng công ty', sub: 'Doanh nghiệp A', icon: '⭐', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', light: '#fff7ed' },
  { label: 'Chuẩn làm việc', sub: 'Working', icon: '🔧', gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', light: '#f0fdf4' },
  { label: 'Thiết bị đo', sub: 'TMDE', icon: '📐', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', light: '#e8f0fe' },
];

// ─── Cap badge styles ────────────────────────────────────────────────────────
const capStyles: Record<CapChuan, { bg: string; color: string; border: string }> = {
  'Quốc gia': { bg: '#fef2f2', color: '#dc2626', border: '#ef4444' },
  'Tổng công ty': { bg: '#fff7ed', color: '#d97706', border: '#f59e0b' },
  'Làm việc': { bg: '#f0fdf4', color: '#16a34a', border: '#22c55e' },
};

const linhVucOptions = [
  'Điện - Điện tử', 'Áp suất', 'Tần số - Thời gian', 'Tần số - Vô tuyến',
  'Nhiệt độ', 'Khối lượng', 'Lưu lượng', 'Quang học', 'Hình học',
  'Rung động - Gia tốc', 'Lực - Mô men',
];

// ─── Component ──────────────────────────────────────────────────────────────
const ChuanDoLuongPage: React.FC = () => {
  const [data, setData] = useState<ChuanDoLuong[]>(initData);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ChuanDoLuong | null>(null);
  const [form] = Form.useForm();

  // ─── Stats (computed from state) ──────────────────────────────────────────
  const thongKe = useMemo(() => ({
    tongChuan: data.length,
    hoatDong: data.filter((c) => c.trangThai === 'hoat_dong').length,
    capQC: data.filter((c) => c.cap === 'Tổng công ty').length,
    capQG: data.filter((c) => c.cap === 'Quốc gia').length,
  }), [data]);

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Tổng chuẩn', value: thongKe.tongChuan, icon: <DatabaseOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'active', label: 'Hoạt động', value: thongKe.hoatDong, icon: <CheckCircleOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
    { key: 'capQC', label: 'Cấp TCT', value: thongKe.capQC, icon: <SafetyCertificateOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'capQG', label: 'Cấp QG', value: thongKe.capQG, icon: <GlobalOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
  ];

  // ─── Modal handlers ───────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedRecord(null);
    setModalMode('add');
    form.resetFields();
    form.setFieldsValue({ trangThai: 'hoat_dong' });
  };

  const openEdit = (record: ChuanDoLuong) => {
    setSelectedRecord(record);
    setModalMode('edit');
    form.setFieldsValue({
      ...record,
      hanHieuChuan: record.hanHieuChuan ? dayjs(record.hanHieuChuan) : undefined,
    });
  };

  const openView = (record: ChuanDoLuong) => {
    setSelectedRecord(record);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedRecord(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const formData: ChuanDoLuong = {
        ...values,
        hanHieuChuan: values.hanHieuChuan ? values.hanHieuChuan.format('YYYY-MM-DD') : '',
      };

      if (modalMode === 'add') {
        const newId = `CD-${String(data.length + 1).padStart(3, '0')}`;
        setData((prev) => [...prev, { ...formData, id: newId }]);
        message.success('Đã thêm chuẩn đo lường mới');
      } else if (modalMode === 'edit' && selectedRecord) {
        setData((prev) => prev.map((item) =>
          item.id === selectedRecord.id ? { ...formData, id: selectedRecord.id } : item,
        ));
        message.success('Đã cập nhật chuẩn đo lường');
      }
      closeModal();
    });
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    message.success('Đã xóa chuẩn đo lường');
  };

  // ─── Action menu ──────────────────────────────────────────────────────────
  const getActionMenu = (record: ChuanDoLuong): MenuProps => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
      { key: 'edit', icon: <EditOutlined />, label: 'Sửa' },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === 'view') openView(record);
      else if (key === 'edit') openEdit(record);
      else if (key === 'delete') {
        Modal.confirm({
          title: `Xóa chuẩn ${record.id}?`,
          content: `Bạn có chắc muốn xóa "${record.ten}"? Thao tác này không thể hoàn tác.`,
          okText: 'Xóa',
          okType: 'danger',
          cancelText: 'Hủy',
          onOk: () => handleDelete(record.id),
        });
      }
    },
  });

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnsType<ChuanDoLuong> = [
    {
      title: 'Mã', dataIndex: 'id', key: 'id', width: 90,
      render: (text: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Tên chuẩn', dataIndex: 'ten', key: 'ten', width: 260,
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Model', dataIndex: 'model', key: 'model', width: 200,
      render: (text: string) => <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Cấp', dataIndex: 'cap', key: 'cap', width: 120,
      render: (cap: CapChuan) => {
        const s = capStyles[cap];
        return (
          <span style={{
            display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 12,
            fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}>{cap}</span>
        );
      },
    },
    {
      title: 'Dải đo', dataIndex: 'daiDo', key: 'daiDo', width: 220, ellipsis: true,
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Độ KĐB', dataIndex: 'doKhongDamBao', key: 'doKhongDamBao', width: 180,
      render: (text: string) => <Text style={{ fontFamily: 'monospace', color: '#d48806', fontWeight: 700, fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Hạn HC', dataIndex: 'hanHieuChuan', key: 'hanHieuChuan', width: 110,
      render: (d: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 120,
      render: (tt: TrangThaiChuan) => <StatusBadge status={tt} />,
    },
    {
      title: '', key: 'actions', width: 48, fixed: 'right',
      render: (_: unknown, record: ChuanDoLuong) => (
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
      <PageHeader
        icon={<AimOutlined />}
        title="Danh mục Chuẩn đo lường"
        subtitle="Quản lý chuỗi liên kết chuẩn đo lường — đảm bảo tính liên kết chuẩn Doanh nghiệp A"
        ctaLabel="Thêm chuẩn"
        onCtaClick={openAdd}
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      {/* Traceability Chain */}
      <Card
        style={{ marginBottom: 20, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 100%)`,
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14 }}>🔗</span>
          </div>
          <div>
            <Text strong style={{ color: '#fff', fontSize: 14 }}>Chuỗi liên kết chuẩn đo lường</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, display: 'block' }}>Traceability Chain — ISO 17025</Text>
          </div>
        </div>
        <div style={{ padding: '24px 24px 20px', background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute', top: '50%', left: '5%', right: '5%', height: 2,
              background: `linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, ${colors.navy})`,
              transform: 'translateY(-50%)', zIndex: 0, borderRadius: 1,
              opacity: 0.3,
            }} />

            {traceabilityNodes.map((node, idx) => (
              <React.Fragment key={node.label}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  {/* Icon circle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: node.gradient, boxShadow: `0 4px 16px ${node.light}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 10,
                    border: '3px solid #fff',
                  }}>
                    {node.icon}
                  </div>
                  {/* Card */}
                  <div style={{
                    background: '#fff', borderRadius: 10, padding: '10px 16px',
                    textAlign: 'center', width: '100%', maxWidth: 180,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  >
                    <Text strong style={{ fontSize: 13, color: '#1a1a2e', display: 'block', lineHeight: 1.3 }}>{node.label}</Text>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{node.sub}</Text>
                  </div>
                  {/* Step number */}
                  <div style={{
                    marginTop: 8, width: 20, height: 20, borderRadius: '50%',
                    background: node.light, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#8c8c8c',
                  }}>{idx + 1}</div>
                </div>
                {idx < traceabilityNodes.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, zIndex: 1, flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke={colors.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      <DataTable<ChuanDoLuong>
        columns={columns}
        dataSource={data}
        rowKey="id"
        onRowClick={(record) => openView(record)}
        totalLabel="chuẩn"
        scroll={{ x: 1300 }}
      />

      {/* ── Detail Drawer (View) ──────────────────────────────────────────── */}
      <Drawer
        open={modalMode === 'view'}
        onClose={closeModal}
        width={640}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {selectedRecord && (
          <>
            <div style={{
              background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
              padding: '24px 28px',
            }}>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{selectedRecord.ten}</Title>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{selectedRecord.id}</Text>
                <StatusBadge status={selectedRecord.trangThai} />
              </div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                {[
                  { label: 'Model', value: selectedRecord.model },
                  { label: 'Cấp', value: selectedRecord.cap },
                  { label: 'Lĩnh vực', value: selectedRecord.linhVuc },
                  { label: 'Dải đo', value: selectedRecord.daiDo },
                  { label: 'Độ không đảm bảo', value: selectedRecord.doKhongDamBao },
                  { label: 'Hạn hiệu chuẩn', value: formatDate(selectedRecord.hanHieuChuan) },
                  { label: 'Nguồn gốc', value: selectedRecord.nguonGoc },
                  { label: 'Trạng thái', value: trangThaiChuanConfig[selectedRecord.trangThai].label },
                ].map((field) => (
                  <div key={field.label}>
                    <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>{field.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 500 }}>{field.value || '—'}</Text>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Mô tả</Text>
                  <Text style={{ fontSize: 14 }}>{selectedRecord.moTa || '—'}</Text>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <Button type="primary" icon={<EditOutlined />}
                  onClick={() => { if (selectedRecord) { closeModal(); openEdit(selectedRecord); } }}>
                  Sửa
                </Button>
                <Button onClick={closeModal}>Đóng</Button>
              </div>
            </div>
          </>
        )}
      </Drawer>

      {/* ── Add/Edit Drawer ───────────────────────────────────────────────── */}
      <Drawer
        open={modalMode === 'add' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'add' ? 'Thêm chuẩn đo lường mới' : `Sửa chuẩn ${selectedRecord?.id || ''}`}
        width={640}
        destroyOnClose
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={closeModal}>Hủy</Button>
            <Button type="primary" onClick={handleSave}>{modalMode === 'add' ? 'Thêm' : 'Lưu'}</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="ten" label="Tên chuẩn" rules={[{ required: true, message: 'Nhập tên chuẩn' }]}>
                <Input placeholder="VD: Chuẩn điện áp DC Fluke 732B" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Nhập model' }]}>
                <Input placeholder="VD: Fluke 732B" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="cap" label="Cấp" rules={[{ required: true, message: 'Chọn cấp' }]}>
                <Select placeholder="Chọn cấp">
                  <Option value="Quốc gia">Quốc gia</Option>
                  <Option value="Tổng công ty">Tổng công ty</Option>
                  <Option value="Làm việc">Làm việc</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="linhVuc" label="Lĩnh vực" rules={[{ required: true, message: 'Chọn lĩnh vực' }]}>
                <Select placeholder="Chọn lĩnh vực">
                  {linhVucOptions.map((lv) => (
                    <Option key={lv} value={lv}>{lv}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                <Select placeholder="Chọn trạng thái">
                  {Object.entries(trangThaiChuanConfig).map(([key, cfg]) => (
                    <Option key={key} value={key}>{cfg.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="daiDo" label="Dải đo" rules={[{ required: true, message: 'Nhập dải đo' }]}>
                <Input placeholder="VD: 1.018 V và 10 V DC" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="doKhongDamBao" label="Độ không đảm bảo (KĐB)" rules={[{ required: true, message: 'Nhập độ KĐB' }]}>
                <Input placeholder="VD: ±0.5 ppm (k=2)" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hanHieuChuan" label="Hạn hiệu chuẩn" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="nguonGoc" label="Nguồn gốc">
                <Input placeholder="VD: Viện Đo lường Việt Nam (VMI)" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết về chuẩn đo lường" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ChuanDoLuongPage;
