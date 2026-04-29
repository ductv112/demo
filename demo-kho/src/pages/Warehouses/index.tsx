import { useMemo, useState } from 'react';
import {
  Row, Col, Card, Typography, Tag, Button, Space,
  Drawer, Form, Input, Select, App, Dropdown,
} from 'antd';
import {
  HomeOutlined, PlusOutlined, EnvironmentOutlined, InboxOutlined,
  DollarOutlined, UserOutlined, MoreOutlined, EditOutlined,
  CheckCircleOutlined, StopOutlined, SearchOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Warehouse } from '../../types';
import { warehouses as initialWarehouses } from '../../data/warehouses';
import { formatNumber } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const formatValue = (value: number): string =>
  value >= 1000 ? `${(value / 1000).toFixed(1)} tỷ` : `${value} tr`;

const warehouseStatusConfig: Record<string, { label: string; color: string }> = {
  active:   { label: 'Hoạt động',        color: 'success' },
  inactive: { label: 'Ngừng hoạt động',  color: 'default' },
};

const Warehouses = () => {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [whList, setWhList] = useState<Warehouse[]>(initialWarehouses);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editingWh, setEditingWh]     = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  // ─── Filters ─────────────────────────────────────────────────
  const [searchText, setSearchText]     = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const stats = useMemo(() => ({
    total:         whList.length,
    active:        whList.filter(w => w.status === 'active').length,
    inactive:      whList.filter(w => w.status === 'inactive').length,
    totalLocations: whList.reduce((s, w) => s + w.locationCount, 0),
  }), [whList]);

  const statCards = [
    {
      label: 'Tổng kho',
      value: stats.total,
      suffix: 'kho',
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <BankOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Đang hoạt động',
      value: stats.active,
      suffix: 'kho',
      gradient: 'linear-gradient(135deg, #237804, #52c41a)',
      icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Ngừng hoạt động',
      value: stats.inactive,
      suffix: 'kho',
      gradient: 'linear-gradient(135deg, #595959, #8c8c8c)',
      icon: <StopOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Tổng vị trí',
      value: stats.totalLocations,
      suffix: 'vị trí',
      gradient: 'linear-gradient(135deg, #ad6800, #d48806)',
      icon: <EnvironmentOutlined style={{ fontSize: 64 }} />,
    },
  ];

  const filteredList = useMemo(() => {
    return whList.filter(wh => {
      const matchSearch = !searchText ||
        wh.name.toLowerCase().includes(searchText.toLowerCase()) ||
        wh.code.toLowerCase().includes(searchText.toLowerCase()) ||
        (wh.managerName ?? '').toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || wh.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [whList, searchText, filterStatus]);

  // ─── Sinh mã kho tự động ─────────────────────────────────
  const generateWhCode = () => {
    const maxNum = whList.reduce((max, w) => {
      const m = w.code.match(/^WH(\d+)$/i);
      return m ? Math.max(max, parseInt(m[1])) : max;
    }, 0);
    return `WH${String(maxNum + 1).padStart(2, '0')}`;
  };

  // ─── Mở drawer tạo mới ───────────────────────────────────
  const openCreate = () => {
    setEditingWh(null);
    form.resetFields();
    form.setFieldsValue({ code: generateWhCode() });
    setDrawerOpen(true);
  };

  // ─── Mở drawer chỉnh sửa ─────────────────────────────────────
  const openEdit = (wh: Warehouse) => {
    setEditingWh(wh);
    form.setFieldsValue({
      name:        wh.name,
      code:        wh.code,
      address:     wh.address ?? '',
      managerName: wh.managerName,
      description: wh.description ?? '',
    });
    setDrawerOpen(true);
  };

  // ─── Lưu form ────────────────────────────────────────────
  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingWh) {
      setWhList(prev => prev.map(w => w.id === editingWh.id ? { ...w, ...values } : w));
      message.success('Đã cập nhật thông tin kho');
    } else {
      const newWh: Warehouse = {
        id:            `wh-${Date.now()}`,
        managerId:     'u-new',
        status:        'active',
        locationCount: 0,
        totalProducts: 0,
        totalValue:    0,
        ...values,
      };
      setWhList(prev => [...prev, newWh]);
      message.success('Đã tạo kho mới thành công');
    }
    setDrawerOpen(false);
  };

  // ─── Kích hoạt / Vô hiệu hóa ─────────────────────────────
  const handleToggleStatus = (wh: Warehouse) => {
    const isActive = wh.status === 'active';
    if (isActive) {
      modal.confirm({
        title: 'Vô hiệu hóa kho',
        content: `Kho "${wh.name}" sẽ không dùng được cho các nghiệp vụ mới.`,
        okText: 'Vô hiệu hóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        centered: true,
        onOk: () => {
          setWhList(prev => prev.map(w => w.id === wh.id ? { ...w, status: 'inactive' } : w));
          message.success(`Đã vô hiệu hóa "${wh.name}"`);
        },
      });
    } else {
      setWhList(prev => prev.map(w => w.id === wh.id ? { ...w, status: 'active' } : w));
      message.success(`Đã kích hoạt "${wh.name}"`);
    }
  };

  return (
    <div>
      {/* ═══ Page Header ═══ */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: colors.navy }}>Kho & Vị trí</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản lý danh sách kho và vị trí lưu trữ tại Trung tâm Hà Nội</Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Thêm kho
        </Button>
      </div>

      {/* ═══ Stat Cards ═══ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, borderRadius: 14, border: 'none', position: 'relative', overflow: 'hidden' }}
              styles={{ body: { padding: '18px 20px', position: 'relative', zIndex: 1 } }}
            >
              <div className="db-bg-icon" style={{ position: 'absolute', top: 8, right: 12, color: 'rgba(255,255,255,0.1)', lineHeight: 1, zIndex: 0 }}>
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{card.label}</Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{formatNumber(card.value)}</span>
                  {card.suffix && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>{card.suffix}</span>}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ═══ Search & Filter ═══ */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm theo tên, mã kho, người quản lý..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus || undefined}
              onChange={v => setFilterStatus(v ?? '')}
              allowClear
              onClear={() => setFilterStatus('')}
              style={{ width: '100%' }}
              options={[
                { label: 'Hoạt động', value: 'active' },
                { label: 'Ngừng hoạt động', value: 'inactive' },
              ]}
            />
          </Col>
          <Col xs={24} sm={4} md={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {filteredList.length} / {whList.length} kho
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ═══ Warehouse Cards Grid ═══ */}
      <Row gutter={[20, 20]}>
        {filteredList.map((wh) => {
          const statusCfg = warehouseStatusConfig[wh.status] ?? warehouseStatusConfig.active;
          return (
            <Col xs={24} sm={12} lg={8} key={wh.id}>
              <Card
                hoverable
                onClick={() => navigate(`/warehouses/${wh.id}`)}
                style={{
                  borderRadius: 14, cursor: 'pointer', overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e8e8e8',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  opacity: wh.status === 'inactive' ? 0.7 : 1,
                }}
                styles={{ body: { padding: 20 } }}
              >
                {/* Gradient top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight})` }} />

                {/* Name + Code + Status + 3-dot */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Title level={5} style={{ margin: 0, color: colors.navy, fontWeight: 700, fontSize: 15, letterSpacing: -0.3, flex: 1, marginRight: 8 }}>
                      {wh.name}
                    </Title>
                    <Space size={6}>
                      <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
                        {statusCfg.label}
                      </Tag>
                      {/* 3-dot menu */}
                      <div onClick={e => e.stopPropagation()}>
                        <Dropdown
                          trigger={['click']}
                          placement="bottomRight"
                          menu={{
                            items: [
                              { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
                              { type: 'divider' },
                              wh.status === 'active'
                                ? {
                                    key: 'deactivate',
                                    icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
                                    label: <span style={{ color: '#ff4d4f' }}>Vô hiệu hóa</span>,
                                  }
                                : {
                                    key: 'activate',
                                    label: 'Kích hoạt',
                                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                  },
                            ],
                            onClick: ({ key }) => {
                              if (key === 'edit') openEdit(wh);
                              else if (key === 'deactivate' || key === 'activate') handleToggleStatus(wh);
                            },
                          }}
                        >
                          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} style={{ color: '#8c8c8c' }} />
                        </Dropdown>
                      </div>
                    </Space>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Mã: {wh.code}</Text>
                </div>

                {/* Manager */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '6px 10px', background: colors.bgLight, borderRadius: 8 }}>
                  <UserOutlined style={{ color: colors.navy, fontSize: 13 }} />
                  <Text style={{ fontSize: 13, fontWeight: 500, color: colors.textPrimary }}>{wh.managerName}</Text>
                </div>

                {/* Stats */}
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px 4px', background: '#f0f5ff', borderRadius: 8 }}>
                      <EnvironmentOutlined style={{ color: colors.navy, fontSize: 16 }} />
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors.navy, lineHeight: 1.3, marginTop: 2 }}>{wh.locationCount}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>Vị trí</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px 4px', background: '#f0fff0', borderRadius: 8 }}>
                      <InboxOutlined style={{ color: colors.success, fontSize: 16 }} />
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors.success, lineHeight: 1.3, marginTop: 2 }}>{formatNumber(wh.totalProducts)}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>Mặt hàng</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px 4px', background: '#fffbe6', borderRadius: 8 }}>
                      <DollarOutlined style={{ color: colors.gold, fontSize: 16 }} />
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors.gold, lineHeight: 1.3, marginTop: 2 }}>{formatValue(wh.totalValue)}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>Giá trị</div>
                    </div>
                  </Col>
                </Row>

                {/* Description */}
                {wh.description && (
                  <Text type="secondary" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', display: '-webkit-box' }}>
                    {wh.description}
                  </Text>
                )}
              </Card>
            </Col>
          );
        })}

        {filteredList.length === 0 && (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: '48px 0', color: colors.textSecondary }}>
              <HomeOutlined style={{ fontSize: 40, opacity: 0.3, display: 'block', marginBottom: 12 }} />
              <Text type="secondary">Không tìm thấy kho nào phù hợp</Text>
            </div>
          </Col>
        )}
      </Row>

      {/* ═══ Drawer: Tạo / Chỉnh sửa kho ═══ */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        closable={false}
        title={null}
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }} onClick={handleSave}>
              {editingWh ? 'Lưu thay đổi' : 'Tạo kho'}
            </Button>
          </div>
        }
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', padding: '20px 24px 16px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HomeOutlined style={{ fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {editingWh ? 'Chỉnh sửa kho' : 'Tạo kho mới'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {editingWh ? `Cập nhật thông tin kho ${editingWh.code}` : 'Khai báo kho vật lý vào hệ thống'}
              </div>
            </div>
          </Space>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px' }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item label={<Text strong>Tên kho</Text>} name="name" rules={[{ required: true, message: 'Nhập tên kho' }]}>
                  <Input placeholder="VD: Kho Vật tư chính, Kho Linh kiện..." />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label={<Space size={4}><Text strong>Mã kho</Text><Tag color="blue" style={{ fontSize: 10, margin: 0 }}>Tự động</Tag></Space>}
                  name="code"
                >
                  <Input
                    readOnly
                    style={{ fontFamily: 'monospace', background: '#f5f7fa', cursor: 'default', color: '#1B3A5C', fontWeight: 600 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={<Text strong>Địa chỉ / Vị trí</Text>} name="address">
              <Input placeholder="VD: Khu A, Trung tâm Hà Nội, Hà Nội" />
            </Form.Item>
            <Form.Item label={<Text strong>Người quản lý kho</Text>} name="managerName" rules={[{ required: true, message: 'Nhập tên người quản lý' }]}>
              <Input placeholder="VD: Nguyễn Văn An" prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
            </Form.Item>
            <Form.Item label={<Text strong>Mô tả</Text>} name="description" style={{ marginBottom: 0 }}>
              <TextArea rows={3} placeholder="Mô tả chức năng và phạm vi sử dụng của kho..." />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default Warehouses;
