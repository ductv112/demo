import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Space, Table, Tabs, Input, Dropdown } from 'antd';
import { SearchOutlined, DatabaseOutlined, PlusOutlined, TeamOutlined, AppstoreOutlined, ToolOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { equipment } from '../../data/equipment';
import { departments } from '../../data/departments';
import { materials } from '../../data/materials';
import { equipmentCategoryConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Equipment, Department, Material } from '../../types';

const { Title, Text } = Typography;

const Categories: React.FC = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [search, setSearch] = useState('');

  const filteredEquipment = equipment.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase()) || e.model.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMaterials = materials.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())
  );

  const equipmentStatusMap: Record<string, { label: string; color: string }> = {
    operational: { label: 'Hoạt động', color: 'success' },
    degraded: { label: 'Suy giảm', color: 'warning' },
    non_operational: { label: 'Không HĐ', color: 'error' },
    in_overhaul: { label: 'Đang đại tu', color: 'processing' },
  };

  const materialCategoryMap: Record<string, string> = {
    spare_part: 'Phụ tùng', consumable: 'Vật tư tiêu hao', chemical: 'Hóa chất', tool: 'Dụng cụ',
  };

  const equipmentColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 120, render: (v: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{v}</Text> },
    { title: 'Tên thiết bị', dataIndex: 'name', key: 'name', width: 220, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Model', dataIndex: 'model', key: 'model', width: 120 },
    { title: 'Serial', dataIndex: 'serial', key: 'serial', width: 160, render: (v: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 130,
      render: (v: string) => { const c = equipmentCategoryConfig[v as keyof typeof equipmentCategoryConfig]; return <Tag color={c?.color}>{c?.label}</Tag>; }
    },
    { title: 'Đơn vị sử dụng', dataIndex: 'ownerUnit', key: 'ownerUnit', width: 200, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Số giờ HĐ', dataIndex: 'operatingHours', key: 'operatingHours', width: 110, render: (v: number) => <Text>{v.toLocaleString('vi-VN')} h</Text> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (v: string) => { const c = equipmentStatusMap[v]; return <Tag color={c?.color}>{c?.label}</Tag>; }
    },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: () => (
      <Dropdown trigger={['click']} menu={{ items: [
        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
      ]}}>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    )},
  ];

  const departmentColumns = [
    { title: 'Mã', dataIndex: 'id', key: 'id', width: 100, render: (v: string) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Tên đơn vị', dataIndex: 'name', key: 'name', width: 280, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Viết tắt', dataIndex: 'shortName', key: 'shortName', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 140,
      render: (v: string) => {
        const map: Record<string, { label: string; color: string }> = { leadership: { label: 'Lãnh đạo', color: 'gold' }, admin: { label: 'Hành chính', color: 'blue' }, technical: { label: 'Kỹ thuật', color: 'processing' } };
        const c = map[v]; return <Tag color={c?.color}>{c?.label}</Tag>;
      }
    },
    { title: 'Trưởng đơn vị', dataIndex: 'head', key: 'head', width: 200, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: () => (
      <Dropdown trigger={['click']} menu={{ items: [
        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
      ]}}>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    )},
  ];

  const materialColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 130, render: (v: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{v}</Text> },
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name', width: 260, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 150, render: (v: string) => <Tag>{materialCategoryMap[v] || v}</Tag> },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier', width: 200, render: (v?: string) => v || '—' },
    { title: 'Thay bắt buộc', dataIndex: 'isMandatoryReplace', key: 'isMandatoryReplace', width: 120,
      render: (v: boolean) => <Tag color={v ? 'error' : 'default'}>{v ? 'Bắt buộc' : 'Tùy chọn'}</Tag>
    },
    { title: '', key: 'action', width: 48, fixed: 'right' as const, render: () => (
      <Dropdown trigger={['click']} menu={{ items: [
        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
      ]}}>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    )},
  ];

  const tabItems = [
    {
      key: 'equipment',
      label: <Space><DatabaseOutlined />Danh mục thiết bị ({equipment.length})</Space>,
      children: (
        <Table dataSource={filteredEquipment} columns={equipmentColumns} rowKey="id" size="small" scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} thiết bị` }} />
      ),
    },
    {
      key: 'departments',
      label: <Space><DatabaseOutlined />Phòng ban / Trung tâm ({departments.length})</Space>,
      children: (
        <Table dataSource={departments} columns={departmentColumns} rowKey="id" size="small" scroll={{ x: 800 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} đơn vị` }} />
      ),
    },
    {
      key: 'materials',
      label: <Space><DatabaseOutlined />Vật tư & Linh kiện ({materials.length})</Space>,
      children: (
        <Table dataSource={filteredMaterials} columns={materialColumns} rowKey="id" size="small" scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} vật tư` }} />
      ),
    },
  ];

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Danh mục dữ liệu</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quản lý danh mục thiết bị, phòng ban, vật tư và dữ liệu tham chiếu</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}>
                Thêm danh mục
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Thiết bị', value: equipment.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <DatabaseOutlined /> },
          { label: 'Phòng ban / Trung tâm', value: departments.length, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <TeamOutlined /> },
          { label: 'Vật tư & Linh kiện', value: materials.length, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', icon: <AppstoreOutlined /> },
          { label: 'Đang đại tu', value: equipment.filter(e => e.status === 'in_overhaul').length, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <ToolOutlined /> },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14, height: 110 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.label}</Text>
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input prefix={<SearchOutlined style={{ color: '#ccc' }} />} placeholder="Tìm kiếm trong danh mục..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 8 }} />
          </Col>
        </Row>
        <Tabs activeKey={activeTab} onChange={key => { setActiveTab(key); setSearch(''); }} items={tabItems} />
      </Card>
    </div>
  );
};

export default Categories;
