import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Select, Dropdown,
  Input, Progress,
} from 'antd';
import {
  InboxOutlined, WarningOutlined, CloseCircleOutlined, SafetyCertificateOutlined,
  SearchOutlined, EyeOutlined, PlusOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { sparePartInventory } from '../../data/spareParts';
import { formatNumber } from '../../utils/format';
import type { SparePartInventory } from '../../types';

const { Title, Text } = Typography;

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: string | number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="db-stat-card"
    style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '20px 20px 16px' } }}
  >
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>
            {value}
            {suffix && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
    </div>
    <div className="db-bg-icon" style={{
      position: 'absolute', top: 12, right: 16, fontSize: 64,
      color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
    }}>
      {icon}
    </div>
  </Card>
);

// ─── Product Type Config ──────────────────────────────────────
const productTypeConfig: Record<string, { label: string; color: string }> = {
  consumable: { label: 'Tiêu hao', color: 'blue' },
  spare_part: { label: 'Phụ tùng', color: 'cyan' },
  equipment: { label: 'Thiết bị', color: '#1B3A5C' },
};

const trackingTypeConfig: Record<string, { label: string; color: string }> = {
  none: { label: '\u2014', color: 'default' },
  lot: { label: 'Theo lô', color: 'processing' },
  serial: { label: 'Theo serial', color: 'success' },
};

// ─── Page Component ────────────────────────────────────────────
const SparePartsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [productTypeFilter, setProductTypeFilter] = useState<string | undefined>(undefined);
  const [stockStatusFilter, setStockStatusFilter] = useState<string | undefined>(undefined);

  const categories = useMemo(() => {
    const set = new Set(sparePartInventory.map((p) => p.category));
    return Array.from(set).sort();
  }, []);

  const filteredData = useMemo(() => {
    let result = sparePartInventory;
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) => r.partName.toLowerCase().includes(lower) || r.partCode.toLowerCase().includes(lower),
      );
    }
    if (categoryFilter) result = result.filter((r) => r.category === categoryFilter);
    if (productTypeFilter) result = result.filter((r) => r.productType === productTypeFilter);
    if (stockStatusFilter) {
      if (stockStatusFilter === 'in_stock') {
        result = result.filter((r) => r.availableStock >= r.reorderPoint);
      } else if (stockStatusFilter === 'low_stock') {
        result = result.filter((r) => r.availableStock > 0 && r.availableStock < r.reorderPoint);
      } else if (stockStatusFilter === 'out_of_stock') {
        result = result.filter((r) => r.availableStock === 0);
      }
    }
    return result;
  }, [searchText, categoryFilter, productTypeFilter, stockStatusFilter]);

  const stats = useMemo(() => ({
    total: sparePartInventory.length,
    belowReorder: sparePartInventory.filter((p) => p.availableStock < p.reorderPoint && p.availableStock > 0).length,
    outOfStock: sparePartInventory.filter((p) => p.availableStock === 0).length,
    militaryGrade: sparePartInventory.filter((p) => p.militaryGrade === true).length,
  }), []);

  const columns: ColumnsType<SparePartInventory> = [
    {
      title: 'Mã VT', dataIndex: 'partCode', width: 140,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>,
    },
    {
      title: 'Tên vật tư', dataIndex: 'partName', ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Loại', dataIndex: 'productType', width: 100, align: 'center',
      render: (type: string) => {
        const cfg = productTypeConfig[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Theo dõi', dataIndex: 'trackingType', width: 110, align: 'center',
      render: (type: string) => {
        const cfg = trackingTypeConfig[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Kho', key: 'warehouse', width: 170, ellipsis: true,
      render: (_: unknown, record: SparePartInventory) => (
        <div>
          <div>{record.warehouseName}</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{record.warehouseLocation}</div>
        </div>
      ),
    },
    {
      title: 'Tồn kho', key: 'stock', width: 110, align: 'right',
      render: (_: unknown, record: SparePartInventory) => (
        <Text strong style={{ color: record.availableStock < record.reorderPoint ? '#ff4d4f' : undefined }}>
          {formatNumber(record.availableStock)} / {formatNumber(record.currentStock)}
        </Text>
      ),
    },
    {
      title: 'Mức tồn', key: 'stockLevel', width: 130,
      render: (_: unknown, record: SparePartInventory) => {
        const percent = record.maxStock > 0 ? Math.round((record.availableStock / record.maxStock) * 100) : 0;
        let strokeColor = '#52c41a';
        if (percent < 20) strokeColor = '#ff4d4f';
        else if (percent < 50) strokeColor = '#faad14';
        return (
          <Progress
            percent={percent}
            size="small"
            strokeColor={strokeColor}
            format={() => formatNumber(record.availableStock)}
          />
        );
      },
    },
    {
      title: 'TG cung ứng', dataIndex: 'leadTimeDays', width: 110, align: 'center',
      render: (days: number) => `${days} ngày`,
    },
    {
      title: '', key: 'action', width: 50, align: 'center',
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
          { key: 'request', icon: <PlusOutlined />, label: 'Yêu cầu bổ sung' },
        ]}} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
          <InboxOutlined style={{ marginRight: 8 }} />
          Vật tư bảo trì
        </Title>
        <Text type="secondary">Quản lý tồn kho vật tư, phụ tùng phục vụ bảo trì thiết bị — Doanh nghiệp A</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Tổng mặt hàng" value={stats.total} icon={<InboxOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Dưới mức đặt hàng" value={stats.belowReorder} icon={<WarningOutlined />}
            gradient="linear-gradient(135deg, #b8860b, #D4A843)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Hết hàng" value={stats.outOfStock} icon={<CloseCircleOutlined />}
            gradient="linear-gradient(135deg, #b91c1c, #ff4d4f)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Bảo mật cao" value={stats.militaryGrade} icon={<SafetyCertificateOutlined />}
            gradient="linear-gradient(135deg, #0a1628, #1B3A5C)" />
        </Col>
      </Row>

      {/* Filter & Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm mã VT, tên vật tư..."
            style={{ width: 280 }}
            allowClear
            prefix={<SearchOutlined />}
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => { if (!e.target.value) setSearchText(''); }}
          />
          <Select
            placeholder="Danh mục" allowClear style={{ width: 170 }}
            onChange={(v) => setCategoryFilter(v)}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <Select
            placeholder="Loại sản phẩm" allowClear style={{ width: 150 }}
            onChange={(v) => setProductTypeFilter(v)}
            options={[
              { value: 'consumable', label: 'Tiêu hao' },
              { value: 'spare_part', label: 'Phụ tùng' },
              { value: 'equipment', label: 'Thiết bị' },
            ]}
          />
          <Select
            placeholder="Trạng thái tồn" allowClear style={{ width: 150 }}
            onChange={(v) => setStockStatusFilter(v)}
            options={[
              { value: 'in_stock', label: 'Đủ hàng' },
              { value: 'low_stock', label: 'Cần bổ sung' },
              { value: 'out_of_stock', label: 'Hết hàng' },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1B3A5C' }}>
            Nhập kho
          </Button>
        </div>

        <Table<SparePartInventory>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          rowClassName={(record) => {
            if (record.availableStock === 0) return 'row-highlight';
            if (record.availableStock < record.reorderPoint) return 'row-highlight';
            return '';
          }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} mặt hàng` }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default SparePartsPage;
