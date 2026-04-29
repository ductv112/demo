import React, { useState, useMemo } from 'react';
import {
  Table, Input, Select, Card, Space, Row, Col, Typography, Badge, Tag,
} from 'antd';
import {
  SearchOutlined, AppstoreOutlined,
  WarningOutlined, DollarOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { inventoryItems } from '../../data/inventory';
import type { InventoryItem } from '../../types';
import { formatNumber, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

// ─── Unique warehouse options from data ─────────────────────
const warehouseOptions = [
  ...new Map(
    inventoryItems.map((i) => [i.warehouseId, { id: i.warehouseId, name: i.warehouseName }])
  ).values(),
];

// ─── Unique location options ────────────────────────────────
const locationOptions = [
  ...new Map(
    inventoryItems
      .filter((i) => i.locationCode)
      .map((i) => [i.locationCode!, { code: i.locationCode!, label: i.locationCode! }])
  ).values(),
];

// ─── Stock level filter ─────────────────────────────────────
type StockLevelFilter = 'all' | 'below_min' | 'above_max' | 'zero';
type ExpiryFilter = 'all' | 'expired' | 'near_expiry';

const formatValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} tỷ`;
  }
  return `${value.toFixed(0)} tr`;
};

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();

  // ─── Filter state ─────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState<string | undefined>(undefined);
  const [filterLocation, setFilterLocation] = useState<string | undefined>(undefined);
  const [filterStockLevel, setFilterStockLevel] = useState<StockLevelFilter>('all');
  const [filterExpiry, setFilterExpiry] = useState<ExpiryFilter>('all');

  const today = dayjs();

  // ─── Filtered data ────────────────────────────────────────
  const filteredData = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchSearch =
        !searchText ||
        item.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.lotNumber || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.serialNumber || '').toLowerCase().includes(searchText.toLowerCase());
      const matchWarehouse = !filterWarehouse || item.warehouseId === filterWarehouse;
      const matchLocation = !filterLocation || item.locationCode === filterLocation;

      let matchStock = true;
      if (filterStockLevel === 'zero') matchStock = item.qtyOnHand === 0;
      else if (filterStockLevel === 'below_min') matchStock = item.qtyAvailable <= 2;
      else if (filterStockLevel === 'above_max') matchStock = item.qtyOnHand >= 50;

      let matchExpiry = true;
      if (filterExpiry === 'expired') {
        matchExpiry = !!item.expiryDate && dayjs(item.expiryDate).isBefore(today, 'day');
      } else if (filterExpiry === 'near_expiry') {
        matchExpiry =
          !!item.expiryDate &&
          dayjs(item.expiryDate).isAfter(today, 'day') &&
          dayjs(item.expiryDate).diff(today, 'day') <= 30;
      }

      return matchSearch && matchWarehouse && matchLocation && matchStock && matchExpiry;
    });
  }, [searchText, filterWarehouse, filterLocation, filterStockLevel, filterExpiry, today]);

  // ─── Summary stats ────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const totalItems = filteredData.length;
    const totalQty = filteredData.reduce((sum, i) => sum + i.qtyOnHand, 0);
    const totalValue = filteredData.reduce((sum, i) => sum + i.totalValue, 0);
    const belowMin = filteredData.filter((i) => i.qtyAvailable <= 2 && i.qtyAvailable > 0).length;
    return { totalItems, totalQty, totalValue, belowMin };
  }, [filteredData]);

  // ─── Row class for highlighting ───────────────────────────
  const getRowClassName = (record: InventoryItem): string => {
    if (record.expiryDate && dayjs(record.expiryDate).isBefore(today, 'day')) {
      return 'row-expired';
    }
    if (record.qtyAvailable <= 2 && record.qtyAvailable > 0) {
      return 'row-low-stock';
    }
    if (record.qtyOnHand === 0) {
      return 'row-expired';
    }
    return '';
  };

  // ─── Table columns ────────────────────────────────────────
  const columns: ColumnsType<InventoryItem> = [
    {
      title: 'Mã VT',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 130,
      fixed: 'left',
      render: (code: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      key: 'productName',
      width: 220,
      fixed: 'left',
      ellipsis: true,
      render: (name: string, record: InventoryItem) => (
        <a
          onClick={() => navigate(`/products/${record.productId}`)}
          style={{ color: '#1B3A5C', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}
        >
          {name}
        </a>
      ),
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 170,
      ellipsis: true,
      render: (name: string) => (
        <Text style={{ fontSize: 13 }}>{name}</Text>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: 100,
      render: (code: string) =>
        code ? (
          <Tag style={{ borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{code}</Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Lo/Serial',
      key: 'tracking',
      width: 130,
      render: (_: unknown, record: InventoryItem) => {
        if (record.serialNumber) {
          return <Text style={{ fontFamily: 'monospace', fontSize: 11 }}>{record.serialNumber}</Text>;
        }
        if (record.lotNumber) {
          return <Text style={{ fontFamily: 'monospace', fontSize: 11 }}>{record.lotNumber}</Text>;
        }
        return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
      },
    },
    {
      title: 'Tồn thực tế',
      dataIndex: 'qtyOnHand',
      key: 'qtyOnHand',
      width: 100,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontWeight: 600, fontSize: 13 }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'Đã giữ',
      dataIndex: 'qtyReserved',
      key: 'qtyReserved',
      width: 80,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontSize: 13, color: val > 0 ? '#d48806' : '#999' }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'Khả dụng',
      dataIndex: 'qtyAvailable',
      key: 'qtyAvailable',
      width: 95,
      align: 'right',
      render: (val: number) => {
        let color = '#52c41a';
        if (val === 0) color = '#ff4d4f';
        else if (val <= 2) color = '#faad14';
        return (
          <Text style={{ fontWeight: 700, fontSize: 13, color }}>{formatNumber(val)}</Text>
        );
      },
    },
    {
      title: 'Sắp nhập',
      dataIndex: 'qtyIncoming',
      key: 'qtyIncoming',
      width: 90,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontSize: 13, color: val > 0 ? '#1890ff' : '#999' }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'Sắp xuất',
      dataIndex: 'qtyOutgoing',
      key: 'qtyOutgoing',
      width: 90,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontSize: 13, color: val > 0 ? '#ff7a45' : '#999' }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'DVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 65,
      render: (unit: string) => (
        <Text style={{ fontSize: 12 }}>{unit}</Text>
      ),
    },
    {
      title: 'Giá trị (tr)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>
          {formatNumber(val)}
        </Text>
      ),
    },
    {
      title: 'Hạn SD',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (date: string) => {
        if (!date) return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
        const isExpired = dayjs(date).isBefore(today, 'day');
        const isNearExpiry = !isExpired && dayjs(date).diff(today, 'day') <= 30;
        return (
          <Text
            style={{
              fontSize: 12,
              color: isExpired ? '#ff4d4f' : isNearExpiry ? '#faad14' : undefined,
              fontWeight: isExpired || isNearExpiry ? 600 : 400,
            }}
          >
            {formatDate(date)}
          </Text>
        );
      },
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 110,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>{formatDate(date)}</Text>
      ),
    },
  ];

  // ─── Stat card config ─────────────────────────────────────
  const statCards = [
    {
      label: 'Tổng mặt hàng',
      value: formatNumber(summaryStats.totalItems),
      suffix: 'dòng',
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <AppstoreOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Tổng số lượng',
      value: formatNumber(summaryStats.totalQty),
      suffix: '',
      gradient: 'linear-gradient(135deg, #08979c, #36cfc9)',
      icon: <InboxOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Giá trị tồn kho',
      value: formatValue(summaryStats.totalValue),
      suffix: '',
      gradient: 'linear-gradient(135deg, #531dab, #722ed1)',
      icon: <DollarOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Dưới mức tối thiểu',
      value: formatNumber(summaryStats.belowMin),
      suffix: 'dòng',
      gradient: 'linear-gradient(135deg, #d48806, #faad14)',
      icon: <WarningOutlined style={{ fontSize: 64 }} />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Page Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AppstoreOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Tồn kho</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Tra cứu tồn kho vật tư, linh kiện theo kho, vị trí, lô hàng</Text>
          </div>
        </Space>
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder="Tìm mã VT, tên, lô, serial..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Kho"
              value={filterWarehouse}
              onChange={setFilterWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouseOptions.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Vị trí"
              value={filterLocation}
              onChange={setFilterLocation}
              allowClear
              style={{ width: '100%' }}
              options={locationOptions.map((l) => ({
                value: l.code,
                label: l.label,
              }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Mức tồn kho"
              value={filterStockLevel}
              onChange={setFilterStockLevel}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'below_min', label: 'Dưới mức tối thiểu' },
                { value: 'above_max', label: 'Vượt mức tối đa' },
                { value: 'zero', label: 'Hết hàng' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Hạn sử dụng"
              value={filterExpiry}
              onChange={setFilterExpiry}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'expired', label: 'Đã hết hạn' },
                { value: 'near_expiry', label: 'Sắp hết hạn (30 ngày)' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* ─── Summary Stat Row ────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, idx) => (
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
              styles={{ body: { padding: '18px 20px', position: 'relative', zIndex: 1 } }}
            >
              {/* Background icon */}
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
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
                  {card.suffix && (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>
                      {card.suffix}
                    </span>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Table ───────────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center" size={8}>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  Danh sách tồn kho
                </Text>
                <Badge
                  count={filteredData.length}
                  style={{ backgroundColor: '#e8f0fe', color: '#1B3A5C', fontSize: 11 }}
                />
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hiển thị {filteredData.length} / {inventoryItems.length} dòng
              </Text>
            </Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          rowClassName={getRowClassName}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} dòng`,
          }}
          scroll={{ x: 1700 }}
          size="middle"
          style={{ padding: '0 4px' }}
        />
      </Card>

      {/* ─── Row highlight styles ────────────────────────────── */}
      <style>{`
        .row-low-stock td {
          background-color: #fffbe6 !important;
        }
        .row-low-stock:hover td {
          background-color: #fff1b8 !important;
        }
        .row-expired td {
          background-color: #fff2f0 !important;
        }
        .row-expired:hover td {
          background-color: #ffccc7 !important;
        }
      `}</style>
    </div>
  );
};

export default InventoryPage;
