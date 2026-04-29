import React, { useState, useMemo } from 'react';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography, Badge, Dropdown, App,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, DatabaseOutlined, MoreOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StopOutlined,
  EyeOutlined, EditOutlined, TagsOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { products } from '../../data/products';
import { inventoryItems } from '../../data/inventory';
import { productClassifications } from '../../data/productClassifications';
import type { Product, ClassificationStatus } from '../../types';
import {
  productTypeConfig,
  trackingTypeConfig,
  productStatusConfig,
  classificationStatusConfig,
  formatNumber,
  getStockLevelColor,
} from '../../utils/format';

const { Title, Text } = Typography;

// ─── Category color mapping ─────────────────────────────────
const categoryColorMap: Record<string, string> = {
  'Linh kiện monitoring': '#1B3A5C',
  'Linh kiện module sản phẩm': '#c41d7f',
  'Vật tư cơ khí': '#08979c',
  'Vật tư điện tử': '#531dab',
  'Vật tư tiêu hao': '#d48806',
  'Thiết bị đo lường': '#389e0d',
};

// ─── Aggregate inventory by productCode ─────────────────────
const stockByProductCode: Record<string, number> = {};
inventoryItems.forEach((item) => {
  const key = item.productCode;
  stockByProductCode[key] = (stockByProductCode[key] || 0) + item.qtyOnHand;
});

// ─── Build a name-based fallback lookup ─────────────────────
const stockByProductName: Record<string, number> = {};
inventoryItems.forEach((item) => {
  const key = item.productName;
  stockByProductName[key] = (stockByProductName[key] || 0) + item.qtyOnHand;
});

const getStockForProduct = (product: Product): number => {
  if (stockByProductCode[product.code] !== undefined) {
    return stockByProductCode[product.code];
  }
  if (stockByProductName[product.name] !== undefined) {
    return stockByProductName[product.name];
  }
  return 0;
};

// ─── Extract unique categories ──────────────────────────────
const categories = [...new Set(products.map((p) => p.category))].sort();

const ProductCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  // ─── Local products state (simulate deactivate/activate) ─
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  // ─── Filter state ───────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterProductType, setFilterProductType] = useState<string | undefined>(undefined);
  const [filterTrackingType, setFilterTrackingType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterClassification, setFilterClassification] = useState<ClassificationStatus | undefined>(undefined);

  // ─── Classification lookup (productId → status) ─────────
  const classificationByProductId = useMemo(() => {
    const map: Record<string, ClassificationStatus> = {};
    productClassifications.forEach(r => {
      // Keep the latest record per product
      if (!map[r.productId] || r.classificationStatus === 'applied') {
        map[r.productId] = r.classificationStatus;
      }
    });
    return map;
  }, []);

  // ─── Handlers ───────────────────────────────────────────
  const handleDeactivate = (record: Product) => {
    modal.confirm({
      title: 'Vô hiệu hóa vật tư',
      content: (
        <span>
          Vô hiệu hóa <strong>{record.name}</strong> ({record.code})?
          Vật tư sẽ không xuất hiện trong các giao dịch mới.
        </span>
      ),
      okText: 'Vô hiệu hóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        setLocalProducts((prev) =>
          prev.map((p) =>
            p.id === record.id
              ? { ...p, status: 'inactive' as const, updatedAt: new Date().toISOString() }
              : p
          )
        );
        message.success('Đã vô hiệu hóa vật tư');
      },
    });
  };

  const handleActivate = (record: Product) => {
    modal.confirm({
      title: 'Kích hoạt lại vật tư',
      content: (
        <span>
          Kích hoạt lại <strong>{record.name}</strong> ({record.code})?
        </span>
      ),
      okText: 'Kích hoạt',
      cancelText: 'Hủy',
      onOk: () => {
        setLocalProducts((prev) =>
          prev.map((p) =>
            p.id === record.id
              ? { ...p, status: 'active' as const, updatedAt: new Date().toISOString() }
              : p
          )
        );
        message.success('Đã kích hoạt vật tư');
      },
    });
  };

  // ─── Filtered data ──────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return localProducts.filter((p) => {
      const matchSearch =
        !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.code.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = !filterCategory || p.category === filterCategory;
      const matchType = !filterProductType || p.productType === filterProductType;
      const matchTracking = !filterTrackingType || p.trackingType === filterTrackingType;
      const matchStatus = !filterStatus || p.status === filterStatus;
      const productClassStatus = classificationByProductId[p.id] ?? 'not_classified';
      const matchClassification = !filterClassification || productClassStatus === filterClassification;
      return matchSearch && matchCategory && matchType && matchTracking && matchStatus && matchClassification;
    });
  }, [localProducts, searchText, filterCategory, filterProductType, filterTrackingType, filterStatus]);

  // ─── Summary stats ─────────────────────────────────────
  const catalogStats = useMemo(() => ({
    total: localProducts.length,
    active: localProducts.filter((p) => p.status === 'active').length,
    pending: localProducts.filter((p) => p.status === 'pending_approval').length,
    inactive: localProducts.filter((p) => p.status === 'inactive').length,
  }), [localProducts]);

  // ─── Table columns ─────────────────────────────────────
  const columns: ColumnsType<Product> = [
    {
      title: 'Mã VT',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      fixed: 'left',
      render: (code: string) => (
        <Text strong style={{ color: '#1B3A5C', fontFamily: 'monospace', fontSize: 12 }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      fixed: 'left',
      ellipsis: true,
      render: (name: string, record: Product) => (
        <a
          onClick={() => navigate(`/products/${record.id}`)}
          style={{ color: '#1B3A5C', fontWeight: 500, cursor: 'pointer' }}
        >
          {name}
        </a>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => (
        <Tag
          color={categoryColorMap[category] || '#1B3A5C'}
          style={{ borderRadius: 4, fontSize: 11 }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'productType',
      key: 'productType',
      width: 140,
      render: (type: Product['productType']) => {
        const config = productTypeConfig[type];
        return <Tag color={config.color} style={{ borderRadius: 4, fontSize: 11 }}>{config.label}</Tag>;
      },
    },
    {
      title: 'Theo dõi',
      dataIndex: 'trackingType',
      key: 'trackingType',
      width: 110,
      render: (type: Product['trackingType']) => {
        const config = trackingTypeConfig[type];
        return <Tag color={config.color} style={{ borderRadius: 4, fontSize: 11 }}>{config.label}</Tag>;
      },
    },
    {
      title: 'ĐVT',
      dataIndex: 'baseUnit',
      key: 'baseUnit',
      width: 70,
      align: 'center',
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: 100,
      align: 'right',
      sorter: (a, b) => getStockForProduct(a) - getStockForProduct(b),
      render: (_: unknown, record: Product) => {
        const stock = getStockForProduct(record);
        const color = getStockLevelColor(stock, record.minStock, record.maxStock);
        return (
          <Text strong style={{ color, fontSize: 13 }}>
            {formatNumber(stock)}
          </Text>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: Product['status']) => {
        const config = productStatusConfig[status];
        return (
          <Tag color={config.color} style={{ borderRadius: 4, fontSize: 11 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Phân loại',
      key: 'classificationStatus',
      width: 145,
      render: (_: unknown, record: Product) => {
        const clStatus = classificationByProductId[record.id] ?? 'not_classified';
        const cfg = classificationStatusConfig[clStatus];
        if (clStatus === 'not_classified') {
          return (
            <Tag
              icon={<TagsOutlined />}
              style={{ fontSize: 11, borderRadius: 4, cursor: 'pointer', borderColor: '#d9d9d9', color: '#8c8c8c' }}
              onClick={() => navigate(`/product-classifications/new?productId=${record.id}`)}
            >
              Chưa phân loại
            </Tag>
          );
        }
        return (
          <Tag
            color={cfg.color === '#1B3A5C' ? undefined : cfg.color}
            style={
              cfg.color === '#1B3A5C'
                ? { background: '#1B3A5C', color: '#fff', fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer' }
                : { fontSize: 11, borderRadius: 4, cursor: 'pointer' }
            }
            onClick={() => navigate('/product-classifications')}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: Product) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
              { type: 'divider' },
              record.status !== 'inactive'
                ? { key: 'deactivate', icon: <StopOutlined />, label: 'Vô hiệu hóa', danger: true }
                : { key: 'activate', icon: <CheckCircleOutlined />, label: 'Kích hoạt lại' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/products/${record.id}`);
              if (key === 'edit') navigate(`/products/${record.id}/edit`);
              if (key === 'deactivate') handleDeactivate(record);
              if (key === 'activate') handleActivate(record);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  // ─── Reset filters ──────────────────────────────────────
  const handleResetFilters = () => {
    setSearchText('');
    setFilterCategory(undefined);
    setFilterProductType(undefined);
    setFilterTrackingType(undefined);
    setFilterStatus(undefined);
    setFilterClassification(undefined);
  };

  const hasActiveFilters =
    searchText || filterCategory || filterProductType || filterTrackingType || filterStatus || filterClassification;

  return (
    <div>
      {/* ─── Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DatabaseOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Danh mục vật tư</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản lý danh mục vật tư, linh kiện, thiết bị toàn nhà máy</Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/products/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Thêm vật tư
        </Button>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          {
            label: 'Tổng vật tư', value: catalogStats.total, suffix: 'mã',
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <DatabaseOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đang sử dụng', value: catalogStats.active, suffix: 'mã',
            gradient: 'linear-gradient(135deg, #237804, #52c41a)',
            icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Chờ phê duyệt', value: catalogStats.pending, suffix: 'mã',
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
            icon: <ClockCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Ngừng sử dụng', value: catalogStats.inactive, suffix: 'mã',
            gradient: 'linear-gradient(135deg, #595959, #8c8c8c)',
            icon: <StopOutlined style={{ fontSize: 64 }} />,
          },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{
                background: card.gradient,
                borderRadius: 14,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '18px 20px', position: 'relative', zIndex: 1 }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: 8, right: 12,
                  color: 'rgba(255,255,255,0.1)',
                  fontSize: 64,
                  lineHeight: 1,
                  zIndex: 0,
                }}
              >
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {card.label}
                </Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>
                    {card.value}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>
                    {card.suffix}
                  </span>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Filter Bar ──────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 16,
          border: 'none',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm mã, tên vật tư..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Nhóm vật tư"
              value={filterCategory}
              onChange={setFilterCategory}
              allowClear
              style={{ width: '100%' }}
              options={categories.map((c) => ({ label: c, value: c }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Loại"
              value={filterProductType}
              onChange={setFilterProductType}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(productTypeConfig).map(([key, cfg]) => ({
                label: cfg.label,
                value: key,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Theo dõi"
              value={filterTrackingType}
              onChange={setFilterTrackingType}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(trackingTypeConfig).map(([key, cfg]) => ({
                label: cfg.label,
                value: key,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={3}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(productStatusConfig).map(([key, cfg]) => ({
                label: cfg.label,
                value: key,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Phân loại"
              value={filterClassification}
              onChange={setFilterClassification}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(classificationStatusConfig).map(([key, cfg]) => ({
                label: cfg.label,
                value: key,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={3}>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} style={{ borderRadius: 6 }}>
                Xóa bộ lọc
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* ─── Data Table ──────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: 'none',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<Product>
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} vật tư`,
            pageSizeOptions: ['10', '15', '20', '50'],
          }}
          scroll={{ x: 1380 }}
          size="middle"
          style={{ borderRadius: 14, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

export default ProductCatalog;
