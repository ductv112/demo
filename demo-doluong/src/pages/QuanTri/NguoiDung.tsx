import { useState } from 'react';
import {
  Typography, Button, Modal, Form, Row, Col, Avatar, Dropdown,
  Input, Select, Drawer,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined, KeyOutlined,
  UserOutlined, MoreOutlined,
  TeamOutlined, CheckCircleOutlined, SafetyCertificateOutlined, ToolOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';
import { formatDate, vaiTroConfig } from '../../utils/format';
import { PageHeader, SummaryCard, FilterBar, DataTable, StatusBadge } from '../../components';
import type { SummaryCardItem, FilterField } from '../../components';
import type { NguoiDung, VaiTro } from '../../types';

const { Text } = Typography;

const initUsers: NguoiDung[] = [
  { id: '1', ma: 'DL001', hoTen: 'Nguyễn Đức Mạnh',  capBac: 'Phó Giám đốc', chucVu: 'Trưởng Ban Đo lường',       vaiTro: 'admin',    email: 'ndmanh@doanhnghiepa.vn',    dangNhapCuoi: '2026-03-22', trangThai: 'active' },
  { id: '2', ma: 'DL002', hoTen: 'Lê Quốc Hùng',      capBac: 'Trưởng phòng',  chucVu: 'Phó Trưởng Ban Đo lường',   vaiTro: 'manager',  email: 'lqhung@doanhnghiepa.vn',    dangNhapCuoi: '2026-03-21', trangThai: 'active' },
  { id: '3', ma: 'DL003', hoTen: 'Trần Văn Bình',        capBac: 'Phó Trưởng phòng',    chucVu: 'KTV Hiệu chuẩn',            vaiTro: 'ktv',      email: 'tvbinh@doanhnghiepa.vn',    dangNhapCuoi: '2026-03-22', trangThai: 'active' },
  { id: '4', ma: 'DL004', hoTen: 'Phạm Tuấn Anh',        capBac: 'Phó Trưởng phòng',    chucVu: 'KTV Hiệu chuẩn',            vaiTro: 'ktv',      email: 'ptanh@doanhnghiepa.vn',     dangNhapCuoi: '2026-03-20', trangThai: 'active' },
  { id: '5', ma: 'DL005', hoTen: 'Hoàng Minh Đức',     capBac: 'CV cao cấp',  chucVu: 'KTV Hiệu chuẩn',            vaiTro: 'ktv',      email: 'hmduc@doanhnghiepa.vn',     dangNhapCuoi: '2026-03-19', trangThai: 'active' },
  { id: '6', ma: 'LD001', hoTen: 'Vũ Minh Tuấn',         capBac: 'Giám đốc',    chucVu: 'Phó TGĐ Doanh nghiệp A',      vaiTro: 'viewer',   email: 'vmtuan@doanhnghiepa.vn',    dangNhapCuoi: '2026-03-15', trangThai: 'active' },
  { id: '7', ma: 'IT001', hoTen: 'Hoàng Văn Bình',     capBac: 'CV cao cấp',  chucVu: 'Quản trị hệ thống',          vaiTro: 'sysadmin', email: 'hvbinh@doanhnghiepa.vn',    dangNhapCuoi: '2026-03-22', trangThai: 'active' },
  { id: '8', ma: 'DL006', hoTen: 'Ngô Sỹ Toàn',       capBac: 'CV cao cấp',  chucVu: 'KTV Hiệu chuẩn',            vaiTro: 'ktv',      email: 'nstoan@doanhnghiepa.vn',    dangNhapCuoi: '2026-03-18', trangThai: 'inactive' },
];

function getInitials(name: string): string {
  const parts = name.split(' ');
  return parts.slice(-2).map((p) => p[0]).join('').toUpperCase();
}

// Map vaiTro to StatusBadge-compatible status strings
const ROLE_STATUS: Record<VaiTro, { bg: string; color: string; dot: string }> = {
  sysadmin: { bg: '#fff1f0', color: '#cf1322', dot: '#ff4d4f' },
  admin:    { bg: '#fff7e6', color: '#d48806', dot: '#faad14' },
  manager:  { bg: '#e8f4fd', color: '#1E6FD9', dot: '#1E6FD9' },
  ktv:      { bg: '#f0fce8', color: '#389e0d', dot: '#52c41a' },
  viewer:   { bg: '#f3e8ff', color: '#6b21a8', dot: '#7c3aed' },
};

export default function NguoiDungPage() {
  const [users, setUsers] = useState<NguoiDung[]>(initUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NguoiDung | null>(null);
  const [form] = Form.useForm<NguoiDung>();

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.hoTen.toLowerCase().includes(search.toLowerCase()) || u.ma.toLowerCase().includes(search.toLowerCase()) || u.chucVu.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.vaiTro === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (rec: NguoiDung) => { setEditing(rec); form.setFieldsValue(rec); setModalOpen(true); };

  const handleOk = () => {
    form.validateFields().then((vals) => {
      if (editing) {
        setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...vals } : u)));
      } else {
        setUsers((prev) => [...prev, { ...vals, id: String(Date.now()), dangNhapCuoi: '—' }]);
      }
      setModalOpen(false);
      form.resetFields();
    });
  };

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Tổng người dùng', value: users.length, icon: <TeamOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'active', label: 'Đang hoạt động', value: users.filter((u) => u.trangThai === 'active').length, icon: <CheckCircleOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
    { key: 'admin', label: 'Quản lý & Admin', value: users.filter((u) => ['admin', 'manager', 'sysadmin'].includes(u.vaiTro)).length, icon: <SafetyCertificateOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'ktv', label: 'KTV', value: users.filter((u) => u.vaiTro === 'ktv').length, icon: <ToolOutlined />, accentColor: '#6b21a8', bgColor: '#f3e8ff' },
  ];

  const filterFields: FilterField[] = [
    {
      key: 'vaiTro', placeholder: 'Vai trò', value: roleFilter, width: 180,
      onChange: (v) => setRoleFilter(v || ''),
      options: Object.entries(vaiTroConfig).map(([k, v]) => ({ value: k, label: v.label })),
    },
  ];

  const columns = [
    {
      title: 'Mã NV', dataIndex: 'ma', key: 'ma', width: 90,
      render: (v: string) => <Text style={{ color: colors.navy, fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Họ tên & Cấp bậc', key: 'name',
      render: (_: unknown, rec: NguoiDung) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={32} style={{ background: `linear-gradient(135deg, #0A1628 0%, #1E6FD9 100%)`, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {getInitials(rec.hoTen)}
          </Avatar>
          <div>
            <Text style={{ fontSize: 13, fontWeight: 600, display: 'block' }}>{rec.hoTen}</Text>
            <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{rec.capBac}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Chức vụ', dataIndex: 'chucVu', key: 'chucVu', ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Vai trò', dataIndex: 'vaiTro', key: 'vaiTro', width: 150,
      render: (r: VaiTro) => {
        const s = ROLE_STATUS[r];
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px 3px 8px', borderRadius: 6,
            background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            {vaiTroConfig[r].label}
          </span>
        );
      },
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</Text>,
    },
    {
      title: 'Đăng nhập cuối', dataIndex: 'dangNhapCuoi', key: 'dangNhapCuoi', width: 150,
      render: (v: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{v === '—' ? '—' : formatDate(v)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 120,
      render: (s: NguoiDung['trangThai']) => (
        <StatusBadge status={s === 'active' ? 'hoat_dong' : 'tam_dung'} label={s === 'active' ? 'Đang HĐ' : 'Tạm khoá'} />
      ),
    },
    {
      title: '', key: 'action', width: 48, fixed: 'right' as const,
      render: (_: unknown, rec: NguoiDung) => {
        const items: MenuProps['items'] = [
          { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
          { key: 'reset', label: 'Đặt lại mật khẩu', icon: <KeyOutlined /> },
        ];
        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === 'edit') openEdit(rec);
                if (key === 'reset') Modal.confirm({
                  title: `Đặt lại mật khẩu cho ${rec.hoTen}?`,
                  content: 'Mật khẩu mới sẽ được gửi về email đăng ký.',
                  okText: 'Xác nhận', cancelText: 'Hủy', onOk: () => {},
                });
              },
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} size="small" onClick={(e) => e.stopPropagation()} style={{ color: '#8c8c8c' }} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<UserOutlined />}
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản và quyền truy cập hệ thống – Ban Đo lường Doanh nghiệp A"
        ctaLabel="Thêm người dùng"
        onCtaClick={openAdd}
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar
          searchText={search}
          searchPlaceholder="Tìm theo họ tên, mã NV, chức vụ..."
          onSearchChange={setSearch}
          filters={filterFields}
          resultCount={filtered.length}
          totalCount={users.length}
          onClearAll={() => { setSearch(''); setRoleFilter(''); }}
        />
      </div>

      <DataTable
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        totalLabel="người dùng"
        scroll={{ x: 1100 }}
      />

      <Drawer
        open={modalOpen}
        title={editing ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
        onClose={() => { setModalOpen(false); form.resetFields(); }}
        width={600}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" onClick={handleOk}>Lưu</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item label="Mã nhân viên" name="ma" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="DL001" style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="Họ và tên" name="hoTen" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="VD: Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Chức danh" name="capBac">
                <Select placeholder="Chọn chức danh" options={[
                  { value: 'TGĐ', label: 'TGĐ' }, { value: 'Phó TGĐ', label: 'Phó TGĐ' },
                  { value: 'Giám đốc', label: 'Giám đốc' }, { value: 'Phó Giám đốc', label: 'Phó Giám đốc' },
                  { value: 'Trưởng phòng', label: 'Trưởng phòng' }, { value: 'Phó Trưởng phòng', label: 'Phó Trưởng phòng' },
                  { value: 'Trưởng nhóm', label: 'Trưởng nhóm' }, { value: 'CV cao cấp', label: 'CV cao cấp' },
                  { value: 'Chuyên viên', label: 'Chuyên viên' }, { value: 'Nhân viên', label: 'Nhân viên' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="Chức vụ" name="chucVu"><Input placeholder="VD: KTV Hiệu chuẩn" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="example@doanhnghiepa.vn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vai trò" name="vaiTro" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select placeholder="Chọn vai trò..." options={Object.entries(vaiTroConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="trangThai" initialValue="active">
                <Select options={[{ value: 'active', label: 'Đang hoạt động' }, { value: 'inactive', label: 'Tạm khoá' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
