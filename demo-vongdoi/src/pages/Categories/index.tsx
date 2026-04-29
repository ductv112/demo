import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Drawer, Form,
  Input, Select, Tabs, message, Row, Col, Dropdown,
} from 'antd';
import {
  PlusOutlined, AppstoreOutlined, EditOutlined, TeamOutlined,
  DatabaseOutlined, ApartmentOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { equipmentTypeConfig } from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface EquipCategory {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface MilitaryUnit {
  id: string;
  name: string;
  shortName: string;
  type: string;
  parent?: string;
}

const equipCategories: EquipCategory[] = [
  { id: 'CAT001', name: 'Hệ thống Monitoring 2D',     type: 'radar',        description: 'Hệ thống monitoring 2 chiều' },
  { id: 'CAT002', name: 'Hệ thống đo cao',             type: 'radar',        description: 'Hệ thống đo độ cao đối tượng' },
  { id: 'CAT003', name: 'Hệ thống phát hiện 3D',       type: 'radar',        description: 'Hệ thống phát hiện 3 chiều' },
  { id: 'CAT004', name: 'Hệ thống điều khiển vận hành', type: 'radar',       description: 'Hệ thống dẫn hướng và điều khiển sản phẩm' },
  { id: 'CAT005', name: 'Module sản phẩm tầm trung',   type: 'missile',      description: 'Module sản phẩm phần mềm tầm trung' },
  { id: 'CAT006', name: 'Module sản phẩm tầm thấp',    type: 'missile',      description: 'Module sản phẩm phần mềm tầm thấp' },
  { id: 'CAT007', name: 'Bệ triển khai sản phẩm',      type: 'missile',      description: 'Bệ triển khai và cơ cấu nâng hạ' },
  { id: 'CAT008', name: 'Module truyền thông',         type: 'communication', description: 'Thiết bị thông tin liên lạc nội bộ' },
  { id: 'CAT009', name: 'Thiết bị bảo mật thông tin',  type: 'communication', description: 'Hệ thống mã hóa bảo mật doanh nghiệp' },
  { id: 'CAT010', name: 'Thiết bị đo tần số',          type: 'measurement',  description: 'Đo và kiểm tra tần số tín hiệu' },
  { id: 'CAT011', name: 'Thiết bị giám sát kỹ thuật số', type: 'measurement', description: 'Đo và hiển thị dạng sóng điện tử' },
  { id: 'CAT012', name: 'Cụm server diesel',           type: 'mechanical',   description: 'Nguồn điện dự phòng cho trung tâm vận hành' },
  { id: 'CAT013', name: 'Cụm hạ tầng chuyên dụng',     type: 'mechanical',   description: 'Hạ tầng vận chuyển và bảo trì sản phẩm' },
];

const militaryUnits: MilitaryUnit[] = [
  { id: 'Z119',  name: 'Trung tâm phần mềm Alpha',       shortName: 'Alpha',          type: 'factory' },
  { id: 'SD361', name: 'Khối vận hành 361',              shortName: 'Khối 361',       type: 'division' },
  { id: 'SD363', name: 'Khối vận hành 363',              shortName: 'Khối 363',       type: 'division' },
  { id: 'SD367', name: 'Khối vận hành 367',              shortName: 'Khối 367',       type: 'division' },
  { id: 'TR261', name: 'Phòng vận hành Sản phẩm 261',    shortName: 'Phòng 261',      type: 'regiment', parent: 'SD361' },
  { id: 'TR285', name: 'Phòng vận hành Monitoring 285',  shortName: 'Phòng 285',      type: 'regiment', parent: 'SD363' },
  { id: 'TR291', name: 'Phòng vận hành Sản phẩm 291',    shortName: 'Phòng 291',      type: 'regiment', parent: 'SD367' },
];

const unitTypeLabel: Record<string, string> = {
  division:  'Khối',
  regiment:  'Phòng',
  battalion: 'Tổ',
  factory:   'Trung tâm',
};
const unitTypeColor: Record<string, string> = {
  division: '#1B3A5C',
  regiment: '#0891b2',
  factory:  '#D4A843',
};

const Categories: React.FC = () => {
  const { isVongDoi } = useUser();
  const [activeTab, setActiveTab] = useState('types');
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addUnitDrawerOpen, setAddUnitDrawerOpen] = useState(false);
  const [editCatDrawerOpen, setEditCatDrawerOpen] = useState(false);
  const [editUnitDrawerOpen, setEditUnitDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [unitForm] = Form.useForm();
  const [editCatForm] = Form.useForm();
  const [editUnitForm] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const handleEditCat = (record: EquipCategory) => {
    editCatForm.setFieldsValue(record);
    setEditCatDrawerOpen(true);
  };
  const handleEditUnit = (record: MilitaryUnit) => {
    editUnitForm.setFieldsValue(record);
    setEditUnitDrawerOpen(true);
  };

  // ─── Table columns ───────────────────────────────────────────────
  const catColumns: ColumnsType<EquipCategory> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      width: 90,
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id}</Text>,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      render: (n: string) => <Text style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{n}</Text>,
    },
    {
      title: 'Loại sản phẩm',
      dataIndex: 'type',
      width: 130,
      render: (t: string) => (
        <Tag
          style={{
            background: equipmentTypeConfig[t as keyof typeof equipmentTypeConfig]?.color || '#666',
            color: '#fff', border: 'none', fontSize: 11,
          }}
        >
          {equipmentTypeConfig[t as keyof typeof equipmentTypeConfig]?.label || t}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{d}</Text>,
    },
    ...(isVongDoi ? [{
      title: 'Thao tác',
      key: 'action',
      width: 48,
      render: (_: unknown, record: EquipCategory) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [{ key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' }],
            onClick: ({ key }) => { if (key === 'edit') handleEditCat(record); },
          }}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    }] : []),
  ];

  const unitColumns: ColumnsType<MilitaryUnit> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      width: 90,
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id}</Text>,
    },
    {
      title: 'Tên đơn vị',
      dataIndex: 'name',
      render: (n: string) => <Text style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{n}</Text>,
    },
    {
      title: 'Tên viết tắt',
      dataIndex: 'shortName',
      width: 140,
      render: (n: string) => <Text style={{ fontSize: 12 }}>{n}</Text>,
    },
    {
      title: 'Cấp đơn vị',
      dataIndex: 'type',
      width: 120,
      render: (t: string) => (
        <Tag
          style={{
            background: unitTypeColor[t] || '#999',
            color: '#fff', border: 'none', fontSize: 11,
          }}
        >
          {unitTypeLabel[t] || t}
        </Tag>
      ),
    },
    {
      title: 'Trực thuộc',
      dataIndex: 'parent',
      width: 140,
      render: (p?: string) => p
        ? <Text style={{ fontSize: 12 }}>{militaryUnits.find(u => u.id === p)?.shortName || p}</Text>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    ...(isVongDoi ? [{
      title: 'Thao tác',
      key: 'action',
      width: 48,
      render: (_: unknown, record: MilitaryUnit) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [{ key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' }],
            onClick: ({ key }) => { if (key === 'edit') handleEditUnit(record); },
          }}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    }] : []),
  ];

  // ─── Stats ───────────────────────────────────────────────────────
  const typeCount = Object.keys(equipmentTypeConfig).length;
  const radarCount    = equipCategories.filter(c => c.type === 'radar').length;
  const missileCount  = equipCategories.filter(c => c.type === 'missile').length;
  const divisionCount = militaryUnits.filter(u => u.type === 'division').length;

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AppstoreOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Danh mục hệ thống</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    Quản lý danh mục loại trang thiết bị và đơn vị sử dụng
                  </Text>
                </div>
              </Space>
            </Col>
            {isVongDoi && (
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => activeTab === 'types' ? setAddDrawerOpen(true) : setAddUnitDrawerOpen(true)}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}
                >
                  Thêm mới
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          {
            title: 'Loại trang thiết bị',
            value: equipCategories.length,
            unit: 'danh mục',
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <AppstoreOutlined />,
          },
          {
            title: 'Nhóm Monitoring',
            value: radarCount,
            unit: 'danh mục',
            gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            icon: <DatabaseOutlined />,
          },
          {
            title: 'Nhóm Sản phẩm',
            value: missileCount,
            unit: 'danh mục',
            gradient: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            icon: <AppstoreOutlined />,
          },
          {
            title: 'Đơn vị sử dụng',
            value: militaryUnits.length,
            unit: 'đơn vị',
            gradient: 'linear-gradient(135deg, #166534, #16a34a)',
            icon: <TeamOutlined />,
          },
          {
            title: 'Khối trực thuộc',
            value: divisionCount,
            unit: 'khối',
            gradient: 'linear-gradient(135deg, #b45309, #d97706)',
            icon: <ApartmentOutlined />,
          },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, border: 'none', borderRadius: 14 }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  className="db-bg-icon"
                  style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}
                >
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13,
                  }}>
                    {card.icon}
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 6 }}>{card.unit}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'types',
            label: (
              <Space size={6}>
                <AppstoreOutlined />
                <span>Loại trang thiết bị</span>
                <Tag style={{ marginLeft: 2, fontSize: 11 }}>{equipCategories.length}</Tag>
              </Space>
            ),
            children: (
              <Card
                style={{ borderRadius: 12 }}
                title={
                  <Space size={10}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: '#1B3A5C18', border: '1px solid #1B3A5C33',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: '#1B3A5C',
                    }}>
                      <AppstoreOutlined />
                    </div>
                    <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Danh mục loại trang thiết bị</Text>
                  </Space>
                }
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  dataSource={equipCategories}
                  columns={catColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: 'units',
            label: (
              <Space size={6}>
                <TeamOutlined />
                <span>Đơn vị sử dụng</span>
                <Tag style={{ marginLeft: 2, fontSize: 11 }}>{militaryUnits.length}</Tag>
              </Space>
            ),
            children: (
              <Card
                style={{ borderRadius: 12 }}
                title={
                  <Space size={10}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: '#0891b218', border: '1px solid #0891b233',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: '#0891b2',
                    }}>
                      <TeamOutlined />
                    </div>
                    <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Đơn vị sử dụng trang thiết bị</Text>
                  </Space>
                }
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  dataSource={militaryUnits}
                  columns={unitColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Add category drawer */}
      <Drawer
        title={
          <Space>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: '#1B3A5C18', border: '1px solid #1B3A5C33',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#1B3A5C',
            }}>
              <PlusOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#1B3A5C' }}>Thêm loại trang thiết bị</span>
          </Space>
        }
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        width={480}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                form.validateFields().then(() => {
                  msg.success('Đã thêm danh mục');
                  setAddDrawerOpen(false);
                  form.resetFields();
                });
              }}
            >
              Lưu danh mục
            </Button>
            <Button onClick={() => setAddDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input placeholder="Tên loại trang thiết bị" />
          </Form.Item>
          <Form.Item name="type" label="Loại sản phẩm" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại sản phẩm">
              {Object.entries(equipmentTypeConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về loại trang thiết bị" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Edit category drawer */}
      <Drawer
        title={
          <Space>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B3A5C18', border: '1px solid #1B3A5C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#1B3A5C' }}>
              <EditOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#1B3A5C' }}>Chỉnh sửa loại trang thiết bị</span>
          </Space>
        }
        open={editCatDrawerOpen}
        onClose={() => setEditCatDrawerOpen(false)}
        width={480}
        footer={
          <Space>
            <Button type="primary" onClick={() => { editCatForm.validateFields().then(() => { msg.success('Đã cập nhật danh mục'); setEditCatDrawerOpen(false); }); }}>Lưu thay đổi</Button>
            <Button onClick={() => setEditCatDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        <Form form={editCatForm} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input placeholder="Tên loại trang thiết bị" />
          </Form.Item>
          <Form.Item name="type" label="Loại sản phẩm" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại sản phẩm">
              {Object.entries(equipmentTypeConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về loại trang thiết bị" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Edit unit drawer */}
      <Drawer
        title={
          <Space>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0891b218', border: '1px solid #0891b233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#0891b2' }}>
              <EditOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#1B3A5C' }}>Chỉnh sửa đơn vị sử dụng</span>
          </Space>
        }
        open={editUnitDrawerOpen}
        onClose={() => setEditUnitDrawerOpen(false)}
        width={480}
        footer={
          <Space>
            <Button type="primary" onClick={() => { editUnitForm.validateFields().then(() => { msg.success('Đã cập nhật đơn vị'); setEditUnitDrawerOpen(false); }); }}>Lưu thay đổi</Button>
            <Button onClick={() => setEditUnitDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        <Form form={editUnitForm} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên đơn vị" rules={[{ required: true }]}>
            <Input placeholder="Tên đầy đủ của đơn vị" />
          </Form.Item>
          <Form.Item name="shortName" label="Tên viết tắt" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Khối 361" />
          </Form.Item>
          <Form.Item name="type" label="Cấp đơn vị" rules={[{ required: true }]}>
            <Select placeholder="Cấp đơn vị">
              <Option value="division">Khối</Option>
              <Option value="regiment">Phòng</Option>
              <Option value="battalion">Tổ</Option>
              <Option value="factory">Trung tâm</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parent" label="Trực thuộc">
            <Select placeholder="Đơn vị cấp trên (nếu có)" allowClear>
              {militaryUnits.filter(u => u.type === 'division').map(u => (
                <Option key={u.id} value={u.id}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Add unit drawer */}
      <Drawer
        title={
          <Space>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: '#0891b218', border: '1px solid #0891b233',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#0891b2',
            }}>
              <PlusOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#1B3A5C' }}>Thêm đơn vị sử dụng</span>
          </Space>
        }
        open={addUnitDrawerOpen}
        onClose={() => setAddUnitDrawerOpen(false)}
        width={480}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                unitForm.validateFields().then(() => {
                  msg.success('Đã thêm đơn vị');
                  setAddUnitDrawerOpen(false);
                  unitForm.resetFields();
                });
              }}
            >
              Lưu đơn vị
            </Button>
            <Button onClick={() => setAddUnitDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        <Form form={unitForm} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên đơn vị" rules={[{ required: true }]}>
            <Input placeholder="Tên đầy đủ của đơn vị" />
          </Form.Item>
          <Form.Item name="shortName" label="Tên viết tắt" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Khối 361" />
          </Form.Item>
          <Form.Item name="type" label="Cấp đơn vị" rules={[{ required: true }]}>
            <Select placeholder="Cấp đơn vị">
              <Option value="division">Khối</Option>
              <Option value="regiment">Phòng</Option>
              <Option value="battalion">Tổ</Option>
              <Option value="factory">Trung tâm</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parent" label="Trực thuộc">
            <Select placeholder="Đơn vị cấp trên (nếu có)" allowClear>
              {militaryUnits.filter(u => u.type === 'division').map(u => (
                <Option key={u.id} value={u.id}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Categories;
