import React, { useState, useMemo } from 'react';
import {
  Table, Typography, Button, Space, Tag, Drawer, Form, Input, Select,
  Popconfirm, message, Row, Col, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined,
  FundProjectionScreenOutlined, AppstoreOutlined, TeamOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocation, useNavigate } from 'react-router-dom';
import { budgetSources, costCategories } from '../../data/costPlans';
import { departments } from '../../data/departments';
import type { BudgetSource, CostCategory, Department } from '../../types';

const { Title, Text } = Typography;

// ─── Label maps ──────────────────────────────────────────────────
const sourceTypeLabels: Record<string, { label: string; color: string }> = {
  state: { label: 'Nhà nước', color: 'blue' },
  project: { label: 'Dự án', color: 'green' },
  research: { label: 'NCKH', color: 'purple' },
  service: { label: 'Dịch vụ', color: 'cyan' },
  internal: { label: 'Nội bộ', color: 'orange' },
  special: { label: 'Đặc thù', color: 'red' },
};

const deptTypeLabels: Record<string, { label: string; color: string }> = {
  leadership: { label: 'Ban Giám đốc', color: 'gold' },
  admin: { label: 'Hành chính', color: 'blue' },
  technical: { label: 'Kỹ thuật', color: 'green' },
};

// ─── Tab config ──────────────────────────────────────────────────
type CatTab = 'sources' | 'cost-types' | 'departments';
const tabConfig: Record<CatTab, { title: string; icon: React.ReactNode; description: string }> = {
  sources: { title: 'Nguồn kinh phí', icon: <FundProjectionScreenOutlined />, description: 'Quản lý các nguồn kinh phí được cấp và sử dụng' },
  'cost-types': { title: 'Loại chi phí', icon: <AppstoreOutlined />, description: 'Quản lý phân loại các hạng mục chi phí' },
  departments: { title: 'Phòng ban', icon: <TeamOutlined />, description: 'Quản lý danh sách phòng ban đơn vị' },
};

const Categories: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Determine active tab from URL
  const activeTab: CatTab = useMemo(() => {
    if (location.pathname.includes('/cost-types')) return 'cost-types';
    if (location.pathname.includes('/departments')) return 'departments';
    return 'sources';
  }, [location.pathname]);

  const cfg = tabConfig[activeTab];

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const openDrawer = (mode: 'add' | 'edit', record?: any) => {
    setDrawerMode(mode);
    setEditingRecord(record || null);
    if (mode === 'edit' && record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success(drawerMode === 'add' ? 'Đã thêm thành công (demo)' : 'Đã cập nhật thành công (demo)');
      setDrawerOpen(false);
      form.resetFields();
    });
  };

  const handleDelete = (_record: any) => {
    message.success('Đã xóa thành công (demo)');
  };

  // ─── Action column helper ─────────────────────────────────────
  const actionColumn = {
    title: 'Thao tác',
    key: 'actions',
    width: 100,
    align: 'center' as const,
    render: (_: any, record: any) => (
      <Space size={4}>
        <Tooltip title="Sửa">
          <Button type="text" size="small" icon={<EditOutlined />}
            style={{ color: '#1B3A5C' }}
            onClick={() => openDrawer('edit', record)} />
        </Tooltip>
        <Popconfirm title="Xác nhận xóa?" description="Bạn có chắc chắn muốn xóa mục này?"
          onConfirm={() => handleDelete(record)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Tooltip title="Xóa">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  };

  // ═══════════════════════════════════════════════════════════════
  //  Tab 1: Budget Sources
  // ═══════════════════════════════════════════════════════════════
  const sourceColumns: ColumnsType<BudgetSource> = [
    {
      title: 'Mã', dataIndex: 'id', width: 100,
      render: (v: string) => <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Tên nguồn kinh phí', dataIndex: 'name', width: 280,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Loại', dataIndex: 'type', width: 120,
      render: (t: string) => {
        const c = sourceTypeLabels[t] || { label: t, color: 'default' };
        return <Tag color={c.color}>{c.label}</Tag>;
      },
      filters: Object.entries(sourceTypeLabels).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value, record) => record.type === value,
    },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    actionColumn,
  ];

  // ═══════════════════════════════════════════════════════════════
  //  Tab 2: Cost Categories (tree)
  // ═══════════════════════════════════════════════════════════════
  const categoryColumns: ColumnsType<CostCategory> = [
    {
      title: 'Mã', dataIndex: 'code', width: 120,
      render: (v: string) => <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Tên loại chi phí', dataIndex: 'name',
      render: (v: string, record: CostCategory) => (
        <Text strong={!!record.children}>{v}</Text>
      ),
    },
    {
      title: 'Mã nội bộ', dataIndex: 'id', width: 140,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Số hạng mục con', key: 'childCount', width: 140, align: 'center',
      render: (_: any, record: CostCategory) => (
        record.children ? (
          <Tag color="blue">{record.children.length} hạng mục</Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        )
      ),
    },
    actionColumn,
  ];

  // ═══════════════════════════════════════════════════════════════
  //  Tab 3: Departments
  // ═══════════════════════════════════════════════════════════════
  const deptColumns: ColumnsType<Department> = [
    {
      title: 'Mã', dataIndex: 'id', width: 90,
      render: (v: string) => <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Tên phòng ban', dataIndex: 'name', width: 300,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Tên viết tắt', dataIndex: 'shortName', width: 100,
      render: (v: string) => <Tag style={{ fontWeight: 500 }}>{v}</Tag>,
    },
    {
      title: 'Loại hình', dataIndex: 'type', width: 130,
      render: (t: string) => {
        const c = deptTypeLabels[t] || { label: t, color: 'default' };
        return <Tag color={c.color}>{c.label}</Tag>;
      },
      filters: Object.entries(deptTypeLabels).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Trưởng phòng', dataIndex: 'head',
      render: (v: string) => <Text>{v}</Text>,
    },
    actionColumn,
  ];

  // ─── Select table + data based on active tab ──────────────────
  const getTableProps = () => {
    switch (activeTab) {
      case 'sources':
        return { columns: sourceColumns, dataSource: budgetSources, rowKey: 'id', expandable: undefined };
      case 'cost-types':
        return {
          columns: categoryColumns, dataSource: costCategories, rowKey: 'id',
          expandable: { childrenColumnName: 'children' as const, defaultExpandAllRows: true },
        };
      case 'departments':
        return { columns: deptColumns, dataSource: departments, rowKey: 'id', expandable: undefined };
    }
  };

  const tableProps = getTableProps();

  // ─── Drawer form fields based on tab ──────────────────────────
  const renderDrawerForm = () => {
    switch (activeTab) {
      case 'sources':
        return (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="id" label="Mã nguồn" rules={[{ required: true, message: 'Nhập mã' }]}>
                  <Input placeholder="NS-xxx" disabled={drawerMode === 'edit'} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="name" label="Tên nguồn kinh phí" rules={[{ required: true, message: 'Nhập tên' }]}>
                  <Input placeholder="Tên nguồn kinh phí" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Chọn loại' }]}>
              <Select placeholder="Chọn loại nguồn">
                {Object.entries(sourceTypeLabels).map(([k, v]) => (
                  <Select.Option key={k} value={k}>{v.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} placeholder="Mô tả nguồn kinh phí" />
            </Form.Item>
          </>
        );
      case 'cost-types':
        return (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="code" label="Mã loại" rules={[{ required: true, message: 'Nhập mã' }]}>
                  <Input placeholder="DA-01" disabled={drawerMode === 'edit'} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="name" label="Tên loại chi phí" rules={[{ required: true, message: 'Nhập tên' }]}>
                  <Input placeholder="Tên loại chi phí" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="id" label="Mã nội bộ" rules={[{ required: true, message: 'Nhập mã nội bộ' }]}>
              <Input placeholder="CC-xxx" disabled={drawerMode === 'edit'} />
            </Form.Item>
            <Form.Item name="parentId" label="Thuộc hạng mục cha">
              <Select placeholder="Chọn hạng mục cha (để trống nếu là gốc)" allowClear>
                {costCategories.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case 'departments':
        return (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="id" label="Mã PB" rules={[{ required: true, message: 'Nhập mã' }]}>
                  <Input placeholder="PVT" disabled={drawerMode === 'edit'} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="name" label="Tên phòng ban" rules={[{ required: true, message: 'Nhập tên' }]}>
                  <Input placeholder="Tên đầy đủ phòng ban" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="shortName" label="Tên viết tắt" rules={[{ required: true }]}>
                  <Input placeholder="P.VT" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="type" label="Loại hình" rules={[{ required: true }]}>
                  <Select placeholder="Chọn loại">
                    {Object.entries(deptTypeLabels).map(([k, v]) => (
                      <Select.Option key={k} value={k}>{v.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="head" label="Trưởng phòng">
              <Input placeholder="Họ tên trưởng phòng" />
            </Form.Item>
          </>
        );
    }
  };

  return (
    <div className="cat-page">
      <style>{`
        .cat-page .cat-header {
          background: linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%);
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        .cat-page .cat-header::before {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(212, 168, 67, 0.12);
        }
        .cat-page .cat-header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          right: 60px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
        }
        .cat-page .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }
        .cat-page .ant-table-thead > tr > th {
          background: #f5f7fa !important;
          color: #1B3A5C !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          border-bottom: 2px solid #e8e8e8 !important;
          padding: 12px 16px !important;
        }
        .cat-page .ant-table-tbody > tr > td {
          padding: 10px 16px !important;
          font-size: 13px;
        }
        .cat-page .ant-table-tbody > tr:hover > td {
          background: #e8f0fe !important;
        }
        .cat-page .ant-table-tbody > tr.ant-table-row-level-0 > td {
          font-weight: 500;
        }
        .cat-page .ant-table-tbody > tr.ant-table-row-level-1 > td {
          font-weight: 400;
          color: #555;
        }
        .cat-page .cat-drawer-header {
          background: linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%);
          padding: 20px 24px;
          margin: -20px -24px 20px -24px;
          position: relative;
          overflow: hidden;
        }
        .cat-page .cat-drawer-header::before {
          content: '';
          position: absolute;
          top: -20px;
          right: -20px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(212, 168, 67, 0.15);
        }
      `}</style>

      {/* ─── Page Header ────────────────────────────────────────── */}
      <div className="cat-header">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22, color: '#D4A843' }}>{cfg.icon}</span>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{cfg.title}</Title>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cfg.description}</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openDrawer('add')}
            style={{
              background: 'linear-gradient(135deg, #D4A843, #f0d890)',
              border: 'none',
              color: '#0a1628',
              fontWeight: 600,
              height: 38,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
            }}
          >
            Thêm mới
          </Button>
        </div>
      </div>

      {/* ─── Summary row ────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '10px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderLeft: '3px solid #D4A843',
      }}>
        <Space size={24}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tổng số: <Text strong style={{ color: '#1B3A5C', fontSize: 15 }}>
              {activeTab === 'sources' ? budgetSources.length :
               activeTab === 'cost-types' ? costCategories.length :
               departments.length}
            </Text> {activeTab === 'sources' ? 'nguồn' : activeTab === 'cost-types' ? 'hạng mục gốc' : 'phòng ban'}
          </Text>
          {activeTab === 'cost-types' && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              Tổng hạng mục con: <Text strong style={{ color: '#1B3A5C' }}>
                {costCategories.reduce((sum, c) => sum + (c.children?.length || 0), 0)}
              </Text>
            </Text>
          )}
          {activeTab === 'departments' && (
            <>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Kỹ thuật: <Text strong style={{ color: '#52c41a' }}>
                  {departments.filter(d => d.type === 'technical').length}
                </Text>
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Hành chính: <Text strong style={{ color: '#1890ff' }}>
                  {departments.filter(d => d.type === 'admin').length}
                </Text>
              </Text>
            </>
          )}
        </Space>
      </div>

      {/* ─── Table ──────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <Table
          {...tableProps}
          columns={tableProps.columns as any}
          dataSource={tableProps.dataSource as any}
          expandable={tableProps.expandable as any}
          pagination={false}
          size="middle"
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* ─── Drawer for Add/Edit ─────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        width={480}
        headerStyle={{ display: 'none' }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        {/* Custom gradient header */}
        <div className="cat-drawer-header">
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {drawerMode === 'add' ? 'THÊM MỚI' : 'CHỈNH SỬA'}
              </Text>
              <Title level={5} style={{ color: '#fff', margin: '4px 0 0' }}>
                {drawerMode === 'add' ? `Thêm ${cfg.title.toLowerCase()}` : `Sửa ${cfg.title.toLowerCase()}`}
              </Title>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined style={{ color: '#fff' }} />}
              onClick={() => { setDrawerOpen(false); form.resetFields(); }}
              style={{ color: '#fff' }}
            />
          </div>
        </div>

        <Form form={form} layout="vertical" size="middle">
          {renderDrawerForm()}
        </Form>

        {/* Footer actions */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 24px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
          >
            {drawerMode === 'add' ? 'Thêm' : 'Lưu thay đổi'}
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default Categories;
