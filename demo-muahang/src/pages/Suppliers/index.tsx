import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Row, Col, Tag, Typography, Input, Select, Space, Empty, Button,
  Table, Dropdown, Drawer, Form, Checkbox, message, Segmented, Divider,
} from 'antd';
import {
  TeamOutlined, CheckCircleOutlined, TrophyOutlined, SafetyCertificateOutlined,
  SearchOutlined, PhoneOutlined, MailOutlined, UserOutlined, EnvironmentOutlined,
  ShopOutlined, PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, FilterOutlined, AppstoreOutlined, UnorderedListOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

import { suppliers } from '../../data/suppliers';
import { formatCurrency, supplierStatusConfig, supplierRatingConfig, materialCategoryConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import { usePageHeader } from '../../contexts/PageHeaderContext';
import type { Supplier, MaterialCategory, SupplierStatus, SupplierRating } from '../../types';

const { Title, Text } = Typography;

const supplierTypeConfig: Record<string, { label: string; color: string }> = {
  military: { label: 'Đối tác chiến lược', color: '#1B3A5C' },
  domestic: { label: 'Trong nước', color: '#0891b2' },
  foreign: { label: 'Nước ngoài', color: '#7c3aed' },
};

const SuppliersPage: React.FC = () => {
  const { isProcurement } = useUser();
  const { setHeaderActions } = usePageHeader();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [ratingFilter, setRatingFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  // Stats
  const summary = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    ratingA: suppliers.filter(s => s.rating === 'A').length,
    military: suppliers.filter(s => s.type === 'military').length,
  }), []);

  // Filter
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q) && !s.shortName.toLowerCase().includes(q)) return false;
      }
      if (typeFilter && s.type !== typeFilter) return false;
      if (ratingFilter && s.rating !== ratingFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      return true;
    });
  }, [searchText, typeFilter, ratingFilter, statusFilter]);

  // Modal handlers
  const openCreate = () => {
    setEditingSupplier(null);
    form.resetFields();
    setModalOpen(true);
  };


  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue({
      name: supplier.name,
      shortName: supplier.shortName,
      type: supplier.type,
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      contactPerson: supplier.contactPerson,
      taxCode: supplier.taxCode,
      categories: supplier.categories,
      certifications: supplier.certifications.join(', '),
    });
    setModalOpen(true);
  };

  const handleSubmitForm = () => {
    form.validateFields().then((values) => {
      if (editingSupplier) {
        message.success(`Đã cập nhật nhà cung cấp ${editingSupplier.code}`);
      } else {
        message.success(`Đã thêm nhà cung cấp: ${values.name}`);
      }
      setModalOpen(false);
      form.resetFields();
      setEditingSupplier(null);
    });
  };

  const handleDelete = (supplier: Supplier) => {
    message.success(`Đã xóa nhà cung cấp ${supplier.code} - ${supplier.name}`);
  };

  // Action menu
  const getActionMenuItems = (supplier: Supplier): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/suppliers/${supplier.id}`) },
    ];
    if (isProcurement) {
      items.push(
        { type: 'divider' },
        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: () => openEdit(supplier) },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(supplier) },
      );
    }
    return items;
  };

  // Table columns
  const columns: ColumnsType<Supplier> = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      fixed: 'left' as const,
      render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text>,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: string) => {
        const cfg = supplierTypeConfig[type];
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Xếp hạng',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      align: 'center',
      render: (rating: SupplierRating) => {
        const cfg = supplierRatingConfig[rating];
        return (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: cfg.color, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{rating}</span>
          </div>
        );
      },
      sorter: (a: Supplier, b: Supplier) => a.rating.localeCompare(b.rating),
    },
    {
      title: 'Liên hệ',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => <Text style={{ fontSize: 12 }}>{phone}</Text>,
    },
    {
      title: 'Số HĐ',
      dataIndex: 'totalContracts',
      key: 'totalContracts',
      width: 70,
      align: 'center',
      render: (v: number) => <Text strong>{v}</Text>,
      sorter: (a: Supplier, b: Supplier) => a.totalContracts - b.totalContracts,
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 100,
      align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{formatCurrency(v)}</Text>,
      sorter: (a: Supplier, b: Supplier) => a.totalValue - b.totalValue,
    },
    {
      title: 'Đúng hạn',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      width: 85,
      align: 'center',
      render: (v: number) => <Text strong style={{ color: v >= 90 ? colors.success : v >= 80 ? colors.warning : colors.danger }}>{v}%</Text>,
      sorter: (a: Supplier, b: Supplier) => a.onTimeRate - b.onTimeRate,
    },
    {
      title: 'Chất lượng',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 85,
      align: 'center',
      render: (v: number) => <Text strong style={{ color: v >= 90 ? colors.success : v >= 80 ? colors.warning : colors.danger }}>{v}%</Text>,
      sorter: (a: Supplier, b: Supplier) => a.qualityRate - b.qualityRate,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SupplierStatus) => {
        const cfg = supplierStatusConfig[status];
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 70,
      align: 'center',
      fixed: 'right' as const,
      render: (_: unknown, record: Supplier) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />} style={{ color: '#999' }} />
        </Dropdown>
      ),
    },
  ];

  // Card render
  const renderSupplierCard = (supplier: Supplier) => {
    const statusConf = supplierStatusConfig[supplier.status];
    const ratingConf = supplierRatingConfig[supplier.rating];
    const typeConf = supplierTypeConfig[supplier.type];

    return (
      <Col xs={24} md={12} key={supplier.id}>
        <Card
          style={{
            borderRadius: 14, border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            height: '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          hoverable
          styles={{ body: { padding: 20 } }}
        >
          {/* Header */}
          <Row align="top" justify="space-between" style={{ marginBottom: 14 }}>
            <Col flex="auto">
              <Space size={10} align="start">
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  <ShopOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: colors.navy, fontSize: 15 }}>{supplier.name}</Title>
                  <Space size={6} style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{supplier.code}</Text>
                    <Tag color={typeConf.color} style={{ fontSize: 11 }}>{typeConf.label}</Tag>
                    <Tag color={statusConf.color} style={{ fontSize: 11 }}>{statusConf.label}</Tag>
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              <Space size={8}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: ratingConf.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{supplier.rating}</span>
                </div>
                <Dropdown menu={{ items: getActionMenuItems(supplier) }} trigger={['click']} placement="bottomRight">
                  <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} style={{ color: '#999' }} />
                </Dropdown>
              </Space>
            </Col>
          </Row>

          {/* Contact */}
          <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
            <Row gutter={[16, 6]}>
              <Col span={24}>
                <Text style={{ fontSize: 12, color: '#666' }}><EnvironmentOutlined style={{ marginRight: 6, color: colors.navy }} />{supplier.address}</Text>
              </Col>
              <Col span={12}>
                <Text style={{ fontSize: 12, color: '#666' }}><PhoneOutlined style={{ marginRight: 6, color: colors.navy }} />{supplier.phone}</Text>
              </Col>
              <Col span={12}>
                <Text style={{ fontSize: 12, color: '#666' }}><UserOutlined style={{ marginRight: 6, color: colors.navy }} />{supplier.contactPerson}</Text>
              </Col>
            </Row>
          </div>

          {/* Stats */}
          <Row gutter={8} style={{ marginBottom: 14 }}>
            {[
              { label: 'Số HĐ', value: supplier.totalContracts, bg: '#f0f7ff', color: colors.navy },
              { label: 'Giá trị', value: formatCurrency(supplier.totalValue), bg: '#f0f7ff', color: colors.navy },
              { label: 'Đúng hạn', value: `${supplier.onTimeRate}%`, bg: supplier.onTimeRate >= 90 ? '#f0fdf4' : '#fffbe6', color: supplier.onTimeRate >= 90 ? colors.success : colors.warning },
              { label: 'Chất lượng', value: `${supplier.qualityRate}%`, bg: supplier.qualityRate >= 90 ? '#f0fdf4' : '#fffbe6', color: supplier.qualityRate >= 90 ? colors.success : colors.warning },
            ].map((stat, idx) => (
              <Col span={6} key={idx}>
                <div style={{ textAlign: 'center', padding: '8px 4px', background: stat.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Categories + Certs */}
          <div style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, color: '#999' }}>Danh mục: </Text>
            <Space size={4} wrap>
              {supplier.categories.map(cat => {
                const cfg = materialCategoryConfig[cat];
                return <Tag key={cat} color={cfg.color} style={{ fontSize: 11, margin: 0 }}>{cfg.label}</Tag>;
              })}
            </Space>
          </div>
          <div>
            <Text style={{ fontSize: 11, color: '#999' }}>Chứng nhận: </Text>
            <Space size={4} wrap>
              {supplier.certifications.map(cert => (
                <Tag key={cert} icon={<SafetyCertificateOutlined />} style={{ fontSize: 11, margin: 0, background: '#f5f7fa', border: '1px solid #e8e8e8', color: colors.navy }}>
                  {cert}
                </Tag>
              ))}
            </Space>
          </div>
        </Card>
      </Col>
    );
  };

  const clearFilters = () => {
    setSearchText('');
    setTypeFilter(undefined);
    setRatingFilter(undefined);
    setStatusFilter(undefined);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4, color: colors.navy }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            Quản lý nhà cung cấp
          </Title>
          <Text type="secondary">Danh sách, đánh giá và phân loại nhà cung cấp vật tư, thiết bị</Text>
        </div>
        {isProcurement && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm nhà cung cấp
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng NCC', value: summary.total, unit: 'NCC', bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <TeamOutlined /> },
          { label: 'Đang hoạt động', value: summary.active, unit: 'NCC', bg: 'linear-gradient(135deg, #059669, #10b981)', icon: <CheckCircleOutlined /> },
          { label: 'Xếp loại A', value: summary.ratingA, unit: 'NCC', bg: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <TrophyOutlined /> },
          { label: 'Đối tác chiến lược', value: summary.military, unit: 'đơn vị', bg: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <SafetyCertificateOutlined /> },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card className="db-stat-card" style={{ background: card.bg, position: 'relative', overflow: 'hidden' }} styles={{ body: { padding: '20px 18px', position: 'relative', zIndex: 1 } }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -8, fontSize: 64, opacity: 0.1, color: '#fff', zIndex: 0 }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>{card.icon}</div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{card.label}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{card.value}<span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>{card.unit}</span></div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card style={{ marginBottom: 16, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: colors.navy }} />}
              placeholder="Tìm theo tên, mã NCC..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Loại NCC" value={typeFilter} onChange={setTypeFilter} allowClear style={{ width: '100%' }}
              options={Object.entries(supplierTypeConfig).map(([k, v]) => ({ label: v.label, value: k }))}
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select placeholder="Xếp hạng" value={ratingFilter} onChange={setRatingFilter} allowClear style={{ width: '100%' }}
              options={Object.entries(supplierRatingConfig).map(([k, v]) => ({ label: `${k} - ${v.label}`, value: k }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Trạng thái" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: '100%' }}
              options={Object.entries(supplierStatusConfig).map(([k, v]) => ({ label: v.label, value: k }))}
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button icon={<FilterOutlined />} onClick={clearFilters}>Xóa lọc</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space size={8}>
              <Segmented
                value={viewMode}
                onChange={(v) => setViewMode(v as 'card' | 'table')}
                options={[
                  { value: 'table', icon: <UnorderedListOutlined /> },
                  { value: 'card', icon: <AppstoreOutlined /> },
                ]}
                size="small"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content — Table or Card view */}
      {viewMode === 'table' ? (
        <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
          <div style={{ padding: '16px 20px 0' }}>
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Danh sách nhà cung cấp ({filteredSuppliers.length})</Text>
          </div>
          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            rowKey="id"
            size="middle"
            scroll={{ x: 1400 }}
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng ${total} NCC` }}
            style={{ marginTop: 8 }}
          />
        </Card>
      ) : (
        filteredSuppliers.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredSuppliers.map(s => renderSupplierCard(s))}
          </Row>
        ) : (
          <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <Empty description="Không tìm thấy nhà cung cấp nào" />
          </Card>
        )
      )}

      {/* Drawer Thêm / Sửa NCC */}
      <Drawer
        open={modalOpen}
        onClose={() => { setModalOpen(false); form.resetFields(); setEditingSupplier(null); }}
        width={560}
        destroyOnClose
        closable={false}
        styles={{
          header: {
            padding: 0,
            border: 'none',
            background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`,
          },
          body: { padding: 0 },
        }}
        title={
          <div style={{
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {editingSupplier
                ? <EditOutlined style={{ fontSize: 18, color: colors.goldLight }} />
                : <PlusOutlined style={{ fontSize: 18, color: colors.goldLight }} />
              }
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                {editingSupplier ? editingSupplier.code : 'Đăng ký nhà cung cấp vào hệ thống'}
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '4px 0' }}>
            <Button onClick={() => { setModalOpen(false); form.resetFields(); setEditingSupplier(null); }}>
              Hủy
            </Button>
            <Button type="primary" icon={editingSupplier ? <EditOutlined /> : <PlusOutlined />} onClick={handleSubmitForm}>
              {editingSupplier ? 'Cập nhật' : 'Thêm nhà cung cấp'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          {/* Định danh */}
          <div style={{ marginBottom: 4 }}>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>Định danh</Text>
          </div>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Nhập tên NCC' }]}>
                <Input placeholder="VD: Trung tâm phần mềm Alpha" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shortName" label="Tên viết tắt" rules={[{ required: true, message: 'Nhập tên tắt' }]}>
                <Input placeholder="VD: Alpha" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Loại NCC" rules={[{ required: true, message: 'Chọn loại' }]}>
                <Select placeholder="Chọn loại NCC" options={Object.entries(supplierTypeConfig).map(([k, v]) => ({ label: v.label, value: k }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true, message: 'Nhập MST' }]}>
                <Input placeholder="VD: 0100xxx001" />
              </Form.Item>
            </Col>
          </Row>

          {/* Liên hệ */}
          <div style={{ marginBottom: 4, marginTop: 8 }}>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>Thông tin liên hệ</Text>
          </div>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
            <Input placeholder="VD: Thanh Xuân, Hà Nội" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Người liên hệ" rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input placeholder="Họ tên người liên hệ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                <Input placeholder="VD: 024-3854-xxxx" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="Email">
            <Input placeholder="VD: contact@company.com" />
          </Form.Item>

          {/* Phân loại & Năng lực */}
          <div style={{ marginBottom: 4, marginTop: 8 }}>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>Phân loại & Năng lực</Text>
          </div>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="categories" label="Danh mục cung cấp" rules={[{ required: true, message: 'Chọn ít nhất 1 danh mục' }]}>
            <Checkbox.Group
              options={Object.entries(materialCategoryConfig).map(([k, v]) => ({ label: v.label, value: k }))}
            />
          </Form.Item>
          <Form.Item name="certifications" label="Chứng nhận (phân cách bằng dấu phẩy)">
            <Input placeholder="VD: ISO 9001:2015, TCQS, ISO 14001" />
          </Form.Item>

          {/* Ghi chú */}
          <div style={{ marginBottom: 4, marginTop: 8 }}>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>Ghi chú</Text>
          </div>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về nhà cung cấp" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default SuppliersPage;
