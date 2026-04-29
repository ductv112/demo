import { useMemo, useState } from 'react';
import {
  Card, Typography, Tag, Button, Space, Tabs, Table, Row, Col,
  Descriptions, Progress, Popconfirm, App,
  Drawer, Form, Input, Select, InputNumber,
} from 'antd';
import type { TableProps } from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  DollarOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlusOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { warehouses, warehouseLocations, getLocationsByWarehouse } from '../../data/warehouses';
import { inventoryItems, getInventoryByWarehouse } from '../../data/inventory';
import {
  formatNumber, formatCurrency, locationTypeConfig, productTypeConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { products } from '../../data/products';

import type { WarehouseLocation, InventoryItem } from '../../types';

const { Title, Text } = Typography;

// ─── Format value as "XX.X ty" or "XXX tr" ──────────────────
const formatValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} tỷ`;
  }
  return `${value} tr`;
};

const warehouseStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Hoạt động', color: 'success' },
  inactive: { label: 'Ngừng hoạt động', color: 'default' },
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

const WarehouseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [activeTab, setActiveTab] = useState('locations');

  const warehouse = useMemo(() => warehouses.find((w) => w.id === id), [id]);

  const [whStatus, setWhStatus] = useState<'active' | 'inactive'>(
    () => (warehouse?.status ?? 'active') as 'active' | 'inactive',
  );

  const handleToggleStatus = () => {
    const next = whStatus === 'active' ? 'inactive' : 'active';
    setWhStatus(next);
    message.success(
      next === 'active'
        ? `Đã kích hoạt kho "${warehouse?.name}"`
        : `Đã vô hiệu hóa kho "${warehouse?.name}"`,
    );
  };

  // ─── Location local state ────────────────────────────────────
  const [locList, setLocList] = useState<WarehouseLocation[]>(
    () => warehouse ? getLocationsByWarehouse(warehouse.id) : [],
  );
  const [locDrawerOpen, setLocDrawerOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<WarehouseLocation | null>(null);
  const [locForm] = Form.useForm();

  const generateLocCode = (parentId?: string) => {
    if (parentId) {
      const parent = locList.find(l => l.id === parentId);
      const childCount = locList.filter(l => l.parentId === parentId).length;
      return `${parent?.code ?? ''}-${String(childCount + 1).padStart(2, '0')}`;
    }
    const rootCount = locList.filter(l => !l.parentId).length;
    return `${warehouse?.code ?? 'WH'}-${String(rootCount + 1).padStart(2, '0')}`;
  };

  const openCreateLoc = () => {
    setEditingLoc(null);
    locForm.resetFields();
    locForm.setFieldsValue({ code: generateLocCode() });
    setLocDrawerOpen(true);
  };

  const handleLocParentChange = (parentId: string | undefined) => {
    if (!editingLoc) {
      locForm.setFieldsValue({ code: generateLocCode(parentId) });
    }
  };

  const openEditLoc = (loc: WarehouseLocation) => {
    setEditingLoc(loc);
    locForm.setFieldsValue({
      code:     loc.code,
      name:     loc.name,
      type:     loc.type,
      parentId: loc.parentId ?? null,
      capacity: loc.capacity ?? null,
    });
    setLocDrawerOpen(true);
  };

  const handleSaveLoc = async () => {
    const values = await locForm.validateFields();
    if (editingLoc) {
      setLocList(prev => prev.map(l =>
        l.id === editingLoc.id
          ? { ...l, ...values, capacity: values.capacity ?? undefined, parentId: values.parentId ?? undefined }
          : l,
      ));
      message.success('Đã cập nhật vị trí');
    } else {
      const newLoc: WarehouseLocation = {
        id:          `loc-${Date.now()}`,
        warehouseId: warehouse!.id,
        currentQty:  0,
        isActive:    true,
        ...values,
        capacity:  values.capacity ?? undefined,
        parentId:  values.parentId ?? undefined,
      };
      setLocList(prev => [...prev, newLoc]);
      message.success('Đã tạo vị trí mới');
    }
    setLocDrawerOpen(false);
  };

  const handleToggleLoc = (loc: WarehouseLocation) => {
    if (loc.isActive) {
      modal.confirm({
        title: 'Vô hiệu hóa vị trí',
        content: `Vị trí "${loc.name}" sẽ không dùng được cho các nghiệp vụ mới.`,
        okText: 'Vô hiệu hóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        centered: true,
        onOk: () => {
          setLocList(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: false } : l));
          message.success(`Đã vô hiệu hóa "${loc.name}"`);
        },
      });
    } else {
      setLocList(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: true } : l));
      message.success(`Đã kích hoạt "${loc.name}"`);
    }
  };

  // Get inventory using warehouse CODE (inventory uses code-based warehouseId like 'WH01')
  const warehouseInventory = useMemo(() => {
    if (!warehouse) return [];
    return getInventoryByWarehouse(warehouse.code);
  }, [warehouse]);

  // Stats computations
  const stats = useMemo(() => {
    const totalItems = warehouseInventory.length;
    const totalValue = warehouseInventory.reduce((sum, i) => sum + i.totalValue, 0);
    const totalQty = warehouseInventory.reduce((sum, i) => sum + i.qtyOnHand, 0);

    // Items with low availability (available = 0)
    const lowStockItems = warehouseInventory.filter((i) => i.qtyAvailable <= 0).length;

    // Items near expiry (within 90 days from today 2026-04-02)
    const today = dayjs('2026-04-02');
    const nearExpiryItems = warehouseInventory.filter((i) => {
      if (!i.expiryDate) return false;
      const expiry = dayjs(i.expiryDate);
      const diff = expiry.diff(today, 'day');
      return diff >= 0 && diff <= 90;
    }).length;

    // Expired items
    const expiredItems = warehouseInventory.filter((i) => {
      if (!i.expiryDate) return false;
      return dayjs(i.expiryDate).isBefore(today);
    }).length;

    return { totalItems, totalValue, totalQty, lowStockItems, nearExpiryItems, expiredItems };
  }, [warehouseInventory]);

  // Product type distribution for stats tab
  const typeDistribution = useMemo(() => {
    const productMap = new Map(products.map((p) => [p.id, p]));
    const counts: Record<string, { count: number; value: number }> = {};

    warehouseInventory.forEach((inv) => {
      const product = productMap.get(inv.productId);
      const type = product?.productType || 'consumable';
      const cfg = productTypeConfig[type] || { label: type, color: '#999' };
      if (!counts[cfg.label]) {
        counts[cfg.label] = { count: 0, value: 0 };
      }
      counts[cfg.label].count += inv.qtyOnHand;
      counts[cfg.label].value += inv.totalValue;
    });

    return Object.entries(counts).map(([label, data]) => ({
      label,
      count: data.count,
      value: data.value,
    }));
  }, [warehouseInventory]);

  // ─── Build tree data for locations ──────────────────────────
  const locationTreeData = useMemo(() => {
    // Separate root and children
    const roots = locList.filter((loc) => !loc.parentId);
    const childMap = new Map<string, WarehouseLocation[]>();
    locList.forEach((loc) => {
      if (loc.parentId) {
        const arr = childMap.get(loc.parentId) || [];
        arr.push(loc);
        childMap.set(loc.parentId, arr);
      }
    });

    // Flatten into table rows with indentation level
    const result: (WarehouseLocation & { _level: number })[] = [];
    const addNode = (node: WarehouseLocation, level: number) => {
      result.push({ ...node, _level: level });
      const children = childMap.get(node.id) || [];
      children.forEach((child) => addNode(child, level + 1));
    };
    roots.forEach((root) => addNode(root, 0));

    return result;
  }, [locList]);

  // ─── If warehouse not found ─────────────────────────────────
  if (!warehouse) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} style={{ color: colors.textSecondary }}>
          Không tìm thấy kho
        </Title>
        <Button type="primary" onClick={() => navigate('/warehouses')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusCfg = warehouseStatusConfig[whStatus] || warehouseStatusConfig.active;

  // ═══════════════════════════════════════════════════════════════
  // Location columns
  // ═══════════════════════════════════════════════════════════════
  const locationColumns: TableProps<WarehouseLocation & { _level: number }>['columns'] = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string, record) => (
        <Text strong style={{ paddingLeft: record._level * 24, fontSize: 13, color: colors.navy }}>
          {record._level > 0 ? '-- ' : ''}{code}
        </Text>
      ),
    },
    {
      title: 'Tên vị trí',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text style={{ fontWeight: 500 }}>{name}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: string) => {
        const cfg = locationTypeConfig[type as keyof typeof locationTypeConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      align: 'right' as const,
      render: (val: number | undefined) => (val != null ? formatNumber(val) : '--'),
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'currentQty',
      key: 'currentQty',
      width: 140,
      align: 'right' as const,
      render: (qty: number, record) => {
        if (record.capacity && record.capacity > 0) {
          const pct = Math.round((qty / record.capacity) * 100);
          const color = pct >= 90 ? colors.danger : pct >= 70 ? colors.warning : colors.success;
          return (
            <Space size={8}>
              <Text strong>{formatNumber(qty)}</Text>
              <Progress
                percent={pct}
                size="small"
                strokeColor={color}
                style={{ width: 60 }}
                format={() => `${pct}%`}
              />
            </Space>
          );
        }
        return <Text strong>{formatNumber(qty)}</Text>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      width: 110,
      align: 'center' as const,
      render: (_: unknown, record) => (
        <Tag color={record.isActive ? 'success' : 'default'}>
          {record.isActive ? 'Hoạt động' : 'Không HĐ'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [
              { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
              { type: 'divider' },
              record.isActive
                ? { key: 'deactivate', icon: <StopOutlined style={{ color: '#ff4d4f' }} />, label: <span style={{ color: '#ff4d4f' }}>Vô hiệu hóa</span> }
                : { key: 'activate', label: 'Kích hoạt', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
            ],
            onClick: ({ key }) => {
              if (key === 'edit') openEditLoc(record);
              else if (key === 'deactivate' || key === 'activate') handleToggleLoc(record);
            },
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // Inventory columns
  // ═══════════════════════════════════════════════════════════════
  const inventoryColumns: TableProps<InventoryItem>['columns'] = [
    {
      title: 'Mã VT',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 130,
      render: (code: string) => (
        <Text strong style={{ color: colors.navy, fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (name: string) => <Text style={{ fontWeight: 500 }}>{name}</Text>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: 100,
      render: (code: string) => code || '--',
    },
    {
      title: 'Lo/Serial',
      key: 'lotSerial',
      width: 140,
      render: (_: unknown, record: InventoryItem) => (
        <div>
          {record.lotNumber && (
            <div style={{ fontSize: 12, color: colors.textSecondary }}>{record.lotNumber}</div>
          )}
          {record.serialNumber && (
            <div style={{ fontSize: 11, color: colors.info }}>{record.serialNumber}</div>
          )}
          {!record.lotNumber && !record.serialNumber && '--'}
        </div>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'qtyOnHand',
      key: 'qtyOnHand',
      width: 70,
      align: 'right' as const,
      render: (qty: number) => <Text strong>{formatNumber(qty)}</Text>,
    },
    {
      title: 'Đã giữ',
      dataIndex: 'qtyReserved',
      key: 'qtyReserved',
      width: 80,
      align: 'right' as const,
      render: (qty: number) => (
        <Text style={{ color: qty > 0 ? colors.warning : colors.textSecondary }}>
          {formatNumber(qty)}
        </Text>
      ),
    },
    {
      title: 'Khả dụng',
      dataIndex: 'qtyAvailable',
      key: 'qtyAvailable',
      width: 90,
      align: 'right' as const,
      render: (qty: number) => (
        <Text
          strong
          style={{ color: qty <= 0 ? colors.danger : colors.success }}
        >
          {formatNumber(qty)}
        </Text>
      ),
    },
    {
      title: 'DVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Giá trị (tr)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 110,
      align: 'right' as const,
      render: (val: number) => (
        <Text strong style={{ color: colors.navy }}>
          {formatNumber(val)}
        </Text>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ─── Back button ────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/warehouses')}
          style={{ color: colors.navy, fontWeight: 500 }}
        >
          Quay lại danh sách
        </Button>
      </div>

      {/* ─── Header Card ─────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 20,
          overflow: 'hidden',
          border: '1px solid #e8e8e8',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight}, ${colors.gold})`,
          }}
        />
        <div style={{ padding: 24 }}>
          <Row gutter={24} align="middle">
            <Col flex="auto">
              <Space size={12} align="start">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HomeOutlined style={{ color: '#fff', fontSize: 24 }} />
                </div>
                <div>
                  <Space size={8} align="center">
                    <Title level={4} style={{ margin: 0, color: colors.navy, letterSpacing: -0.3 }}>
                      {warehouse.name}
                    </Title>
                    <Tag color={statusCfg.color} style={{ fontWeight: 600 }}>
                      {statusCfg.label}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Mã: {warehouse.code} | {warehouse.address}
                  </Text>
                </div>
              </Space>

              <Descriptions
                size="small"
                column={3}
                style={{ marginTop: 16 }}
                labelStyle={{ fontWeight: 600, color: colors.navy, fontSize: 13 }}
                contentStyle={{ fontSize: 13 }}
              >
                <Descriptions.Item label="Quản lý kho">
                  {warehouse.managerName}
                </Descriptions.Item>
                <Descriptions.Item label="Số vị trí">
                  {warehouse.locationCount}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng giá trị">
                  <Text strong style={{ color: colors.gold, fontSize: 15 }}>
                    {formatValue(warehouse.totalValue)} đồng
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {warehouse.description && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                  {warehouse.description}
                </Text>
              )}
            </Col>
          </Row>
        </div>
      </Card>

      {/* ─── Tabs ────────────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e8e8e8',
        }}
        styles={{ body: { padding: '4px 20px 20px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            // ═══ Tab 1: Vị trí luu tru ═══
            {
              key: 'locations',
              label: (
                <Space size={6}>
                  <EnvironmentOutlined />
                  Vị trí lưu trữ ({locList.length})
                </Space>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openCreateLoc}
                      style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}
                    >
                      Thêm vị trí
                    </Button>
                  </div>
                  <Table
                    dataSource={locationTreeData}
                    columns={locationColumns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    scroll={{ x: 860 }}
                    rowClassName={(record) =>
                      record._level === 0 ? 'location-root-row' : ''
                    }
                  />
                </div>
              ),
            },
            // ═══ Tab 2: Tồn kho ═══
            {
              key: 'inventory',
              label: (
                <Space size={6}>
                  <InboxOutlined />
                  Tồn kho ({warehouseInventory.length})
                </Space>
              ),
              children: (
                <Table
                  dataSource={warehouseInventory}
                  columns={inventoryColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng: ${t} dòng` }}
                  size="middle"
                  scroll={{ x: 900 }}
                  rowClassName={(record) =>
                    record.qtyAvailable <= 0 ? 'row-low-stock' : ''
                  }
                />
              ),
            },
            // ═══ Tab 3: Thong ke ═══
            {
              key: 'stats',
              label: (
                <Space size={6}>
                  <DatabaseOutlined />
                  Thống kê
                </Space>
              ),
              children: (
                <div>
                  {/* Summary stat cards */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {[
                      {
                        icon: <InboxOutlined />,
                        label: 'Tổng mặt hàng',
                        value: stats.totalItems,
                        bg: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                      },
                      {
                        icon: <DollarOutlined />,
                        label: 'Tổng giá trị',
                        value: formatValue(stats.totalValue),
                        suffix: ' đồng',
                        bg: `linear-gradient(135deg, ${colors.gold}, #c4983a)`,
                      },
                      {
                        icon: <WarningOutlined />,
                        label: 'Hết khả dụng',
                        value: stats.lowStockItems,
                        bg: `linear-gradient(135deg, ${colors.danger}, #ff7875)`,
                      },
                      {
                        icon: <ClockCircleOutlined />,
                        label: 'Sắp hết hạn',
                        value: stats.nearExpiryItems + stats.expiredItems,
                        bg: `linear-gradient(135deg, ${colors.warning}, #ffc53d)`,
                      },
                    ].map((stat, idx) => (
                      <Col xs={12} lg={6} key={idx}>
                        <Card
                          style={{
                            borderRadius: 12,
                            background: stat.bg,
                            border: 'none',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                          styles={{ body: { padding: 16, position: 'relative', zIndex: 1 } }}
                        >
                          {/* Background icon */}
                          <div
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              fontSize: 64,
                              opacity: 0.1,
                              color: '#fff',
                              lineHeight: 1,
                            }}
                          >
                            {stat.icon}
                          </div>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: 'rgba(255,255,255,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 8,
                              color: '#fff',
                              fontSize: 16,
                            }}
                          >
                            {stat.icon}
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            {stat.value}
                            {stat.suffix && (
                              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>
                                {stat.suffix}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                            {stat.label}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Distribution by product type */}
                  <Card
                    style={{
                      borderRadius: 12,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #e8e8e8',
                    }}
                    styles={{ body: { padding: 20 } }}
                  >
                    <Space size={12} style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DatabaseOutlined style={{ color: '#fff', fontSize: 16 }} />
                      </div>
                      <Title level={5} style={{ margin: 0, color: colors.navy }}>
                        Phân bổ theo loại vật tư
                      </Title>
                    </Space>

                    {typeDistribution.length > 0 ? (
                      <Row gutter={[16, 12]}>
                        {typeDistribution.map((item, idx) => {
                          const barColors = ['#1B3A5C', '#52c41a', '#722ed1', '#1890ff'];
                          const maxCount = Math.max(...typeDistribution.map((d) => d.count), 1);
                          const pct = Math.round((item.count / maxCount) * 100);
                          return (
                            <Col span={24} key={idx}>
                              <div style={{ marginBottom: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <Text style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</Text>
                                  <Space size={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {formatNumber(item.count)} đơn vị
                                    </Text>
                                    <Text strong style={{ fontSize: 12, color: colors.navy }}>
                                      {formatValue(item.value)} đồng
                                    </Text>
                                  </Space>
                                </div>
                                <div
                                  style={{
                                    height: 8,
                                    background: '#f0f2f5',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${pct}%`,
                                      background: barColors[idx % barColors.length],
                                      borderRadius: 4,
                                      transition: 'width 0.5s ease',
                                    }}
                                  />
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    ) : (
                      <Text type="secondary">Không có dữ liệu tồn kho</Text>
                    )}
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ─── Drawer: Tạo / Chỉnh sửa vị trí ────────────────── */}
      <Drawer
        open={locDrawerOpen}
        onClose={() => setLocDrawerOpen(false)}
        width={480}
        closable={false}
        title={null}
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setLocDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }} onClick={handleSaveLoc}>
              {editingLoc ? 'Lưu thay đổi' : 'Tạo vị trí'}
            </Button>
          </div>
        }
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', padding: '20px 24px 16px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EnvironmentOutlined style={{ fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {editingLoc ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {editingLoc ? `Cập nhật thông tin vị trí ${editingLoc.code}` : `Khai báo vị trí lưu trữ trong ${warehouse?.name}`}
              </div>
            </div>
          </Space>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px' }}>
          <Form form={locForm} layout="vertical">
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item
                  label={<Space size={4}><Text strong>Mã vị trí</Text><Tag color="blue" style={{ fontSize: 10, margin: 0 }}>Tự động</Tag></Space>}
                  name="code"
                >
                  <Input
                    readOnly
                    style={{ fontFamily: 'monospace', background: '#f5f7fa', cursor: 'default', color: '#1B3A5C', fontWeight: 600 }}
                  />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item label={<Text strong>Tên vị trí</Text>} name="name" rules={[{ required: true, message: 'Nhập tên vị trí' }]}>
                  <Input placeholder="VD: Kệ 01 - Linh kiện Monitoring" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={<Text strong>Loại vị trí</Text>} name="type" rules={[{ required: true, message: 'Chọn loại vị trí' }]}>
              <Select placeholder="Chọn loại vị trí" options={[
                { label: 'Nội bộ (lưu trữ thực tế)', value: 'internal' },
                { label: 'Nhà cung cấp (điểm vào)', value: 'supplier' },
                { label: 'Khách hàng (điểm ra)', value: 'customer' },
                { label: 'Trung chuyển', value: 'transit' },
                { label: 'Sản xuất', value: 'production' },
                { label: 'Thất thoát tồn kho', value: 'scrap' },
                { label: 'Ảo (cấu trúc hệ thống)', value: 'virtual' },
              ]} />
            </Form.Item>
            <Form.Item label={<Text strong>Vị trí cha</Text>} name="parentId">
              <Select
                placeholder="Không có (vị trí gốc)"
                allowClear
                onChange={handleLocParentChange}
                options={locList
                  .filter(l => !editingLoc || l.id !== editingLoc.id)
                  .map(l => ({ label: `${l.code} — ${l.name}`, value: l.id }))}
              />
            </Form.Item>
            <Form.Item label={<Text strong>Sức chứa tối đa</Text>} name="capacity" style={{ marginBottom: 0 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Để trống nếu không giới hạn" addonAfter="đơn vị" />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default WarehouseDetail;
