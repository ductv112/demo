import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Card, Space, Row, Col, Typography, Tag, Button,
  Dropdown, Modal, message,
} from 'antd';
import {
  SearchOutlined, ApartmentOutlined, CheckCircleOutlined,
  ClockCircleOutlined, FileTextOutlined, EyeOutlined,
  EditOutlined, CopyOutlined, PartitionOutlined, MoreOutlined,
  PlusOutlined, DeleteOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { productStructures as initialData } from '../../data/productStructures';
import type { ProductStructure, BOMStatus } from '../../types';
import { bomStatusConfig, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

const typeLabels: Record<ProductStructure['type'], { label: string; color: string }> = {
  finished:      { label: 'Thành phẩm',       color: '#1B3A5C' },
  module:        { label: 'Mô-đun',            color: '#0891b2' },
  semi_finished: { label: 'Bán thành phẩm', color: '#7c3aed' },
  part:          { label: 'Chi tiết',               color: '#d97706' },
};

const scopeLabels: Record<ProductStructure['scope'], string> = {
  new_production: 'Sản xuất mới',
  repair:         'Sửa chữa',
  overhaul:       'Đại tu',
};

interface StatItem {
  key: string;
  label: string;
  value: number;
  gradient: string;
  IconComp: React.FC<{ style?: React.CSSProperties }>;
  unit: string;
}

const ProductStructurePage: React.FC = () => {
  const [data, setData] = useState<ProductStructure[]>([...initialData]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  // Stats
  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((p) => p.status === 'active').length;
    const pending = data.filter((p) => p.status === 'pending_approval').length;
    const draft = data.filter((p) => p.status === 'draft').length;
    return { total, active, pending, draft };
  }, [data]);

  const statCards: StatItem[] = [
    {
      key: 'total', label: 'Tổng cấu trúc', value: stats.total, unit: 'cấu trúc',
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', IconComp: ApartmentOutlined,
    },
    {
      key: 'active', label: 'Đang sử dụng', value: stats.active, unit: 'cấu trúc',
      gradient: 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)', IconComp: CheckCircleOutlined,
    },
    {
      key: 'pending', label: 'Chờ duyệt', value: stats.pending, unit: 'cấu trúc',
      gradient: 'linear-gradient(135deg, #d48806 0%, #faad14 100%)', IconComp: ClockCircleOutlined,
    },
    {
      key: 'draft', label: 'Nháp', value: stats.draft, unit: 'cấu trúc',
      gradient: 'linear-gradient(135deg, #595959 0%, #8c8c8c 100%)', IconComp: FileTextOutlined,
    },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        !searchText ||
        item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.equipmentModel.toLowerCase().includes(searchText.toLowerCase());
      const matchType = !filterType || item.type === filterType;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [data, searchText, filterType, filterStatus]);

  // --- CRUD Handlers ---
  const handleAdd = () => {
    navigate('/product-structures/new');
  };

  const handleEdit = (record: ProductStructure) => {
    navigate(`/product-structures/${record.id}/edit`);
  };

  const handleClone = (record: ProductStructure) => {
    const newVersion = record.version.replace(/(\d+)$/, (m) => String(Number(m) + 1));
    const cloned: ProductStructure = {
      ...record,
      id: `BOM-${String(data.length + 1).padStart(3, '0')}`,
      code: `${record.code}-COPY`,
      version: newVersion,
      status: 'draft',
      effectiveFrom: undefined,
      effectiveTo: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
      createdAt: dayjs().format('YYYY-MM-DD'),
      updatedAt: dayjs().format('YYYY-MM-DD'),
    };
    setData([cloned, ...data]);
    message.success('Nhân bản thành công');
  };

  const handleDelete = (record: ProductStructure) => {
    setData(data.filter((d) => d.id !== record.id));
    message.success('Đã xóa cấu trúc sản phẩm');
  };

  const handleView = (record: ProductStructure) => {
    navigate(`/product-structures/${record.id}`);
  };



  // --- Dropdown menu for each row ---
  const getRowMenuItems = (record: ProductStructure) => {
    const items = [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
    ];
    if (record.status === 'draft' || record.status === 'pending_approval') {
      items.push({ key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' });
    }
    items.push({ key: 'copy', icon: <CopyOutlined />, label: 'Nhân bản' });
    if (record.status === 'draft') {
      items.push({ key: 'delete', icon: <DeleteOutlined />, label: 'Xóa' });
    }
    return items;
  };

  const handleMenuClick = (key: string, record: ProductStructure) => {
    switch (key) {
      case 'view': handleView(record); break;
      case 'edit': handleEdit(record); break;
      case 'copy': handleClone(record); break;
      case 'delete':
        Modal.confirm({
          title: 'Xác nhận xóa',
          icon: <ExclamationCircleOutlined />,
          content: `Bạn có chắc muốn xóa cấu trúc "${record.name}" (${record.code})?`,
          okText: 'Xóa',
          okType: 'danger',
          cancelText: 'Hủy',
          onOk: () => handleDelete(record),
        });
        break;
    }
  };


  // --- Table columns ---
  const columns: ColumnsType<ProductStructure> = [
    {
      title: 'Mã SP', dataIndex: 'code', key: 'code', width: 160,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{code}</Text>,
    },
    {
      title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', width: 260, ellipsis: true,
      render: (_: string, record: ProductStructure) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>Model: {record.equipmentModel}</Text>
        </div>
      ),
    },
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 140,
      render: (type: ProductStructure['type']) => {
        const config = typeLabels[type];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Version', dataIndex: 'version', key: 'version', width: 90, align: 'center' as const,
      render: (v: string) => <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'Phạm vi', dataIndex: 'scope', key: 'scope', width: 130,
      render: (scope: ProductStructure['scope']) => <Text style={{ fontSize: 13 }}>{scopeLabels[scope]}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (status: BOMStatus) => {
        const config = bomStatusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Hiệu lực từ', dataIndex: 'effectiveFrom', key: 'effectiveFrom', width: 120,
      render: (date: string | undefined) =>
        date ? <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
             : <Text type="secondary" style={{ fontSize: 12 }}>--</Text>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 70, align: 'center' as const,
      render: (_: unknown, record: ProductStructure) => (
        <Dropdown
          menu={{
            items: getRowMenuItems(record),
            onClick: ({ key }) => handleMenuClick(key, record),
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="center" size={12}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PartitionOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Cấu trúc sản phẩm (BOM)</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản lý cấu trúc sản phẩm, định mức vật tư</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Thêm mới
        </Button>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((stat, idx) => (
          <Col xs={12} sm={12} md={6} key={stat.key}>
            <Card
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{ background: stat.gradient, border: 'none', borderRadius: 14, overflow: 'hidden' }}
              styles={{ body: { padding: '20px 18px', position: 'relative' } }}
            >
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, pointerEvents: 'none' }}>
                <stat.IconComp style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  <stat.IconComp style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                  {stat.value}
                  <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{stat.unit}</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{stat.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={8}>
            <Input
              placeholder="Tìm kiếm theo mã, tên, model..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select placeholder="Loại sản phẩm" value={filterType} onChange={setFilterType}
              allowClear style={{ width: '100%' }}
              options={[
                { value: 'finished', label: 'Thành phẩm' },
                { value: 'module', label: 'Mô-đun' },
                { value: 'semi_finished', label: 'Bán thành phẩm' },
                { value: 'part', label: 'Chi tiết' },
              ]}
            />
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus}
              allowClear style={{ width: '100%' }}
              options={Object.entries(bomStatusConfig).map(([key, cfg]) => ({ value: key, label: cfg.label }))}
            />
          </Col>
          <Col xs={24} sm={6} md={6} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredData.length}/{data.length} kết quả</Text>
              <Button size="small" onClick={() => { setSearchText(''); setFilterType(undefined); setFilterStatus(undefined); }}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ApartmentOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Danh sách cấu trúc sản phẩm</Title>
          </Space>
        </div>
        <Table<ProductStructure>
          columns={columns} dataSource={filteredData} rowKey="id" size="middle"
          pagination={{
            pageSize: 10, showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi`,
          }}
          scroll={{ x: 1100 }} style={{ marginTop: 4 }}
        />
      </Card>
    </div>
  );
};

export default ProductStructurePage;
