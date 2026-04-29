import React, { useState, useMemo } from 'react';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col,
  Typography, Badge, Dropdown,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, MoreOutlined,
  AuditOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SyncOutlined, CloseCircleOutlined,
  EyeOutlined, EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { productRequests } from '../../data/productRequests';
import type { ProductCreationRequest, RequestStatus } from '../../types';
import { requestStatusConfig, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

const ProductRequests: React.FC = () => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | undefined>(undefined);
  const [filterDept, setFilterDept] = useState<string | undefined>(undefined);

  // ─── Dept options ─────────────────────────────────────────
  const deptOptions = useMemo(() => {
    const map = new Map<string, string>();
    productRequests.forEach((r) => map.set(r.requesterDeptId, r.requesterDeptName));
    return [...map.entries()].map(([id, name]) => ({ value: id, label: name }));
  }, []);

  // ─── Filtered data ────────────────────────────────────────
  const filtered = useMemo(() => {
    return productRequests.filter((r) => {
      const q = searchText.toLowerCase();
      const matchSearch =
        !searchText ||
        r.requestCode.toLowerCase().includes(q) ||
        r.requestedName.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchDept = !filterDept || r.requesterDeptId === filterDept;
      return matchSearch && matchStatus && matchDept;
    });
  }, [searchText, filterStatus, filterDept]);

  // ─── Summary stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const all = productRequests;
    return {
      total: all.length,
      pending: all.filter((r) =>
        ['submitted', 'checking_duplicate', 'duplicate_found', 'unique_confirmed',
          'pending_normalization', 'pending_approval'].includes(r.status)
      ).length,
      published: all.filter((r) => r.status === 'published').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
    };
  }, []);

  // ─── Columns ──────────────────────────────────────────────
  const columns: ColumnsType<ProductCreationRequest> = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'requestCode',
      key: 'requestCode',
      width: 130,
      render: (code: string, record) => (
        <a
          onClick={() => navigate(`/product-requests/${record.id}`)}
          style={{ color: '#1B3A5C', fontWeight: 600, fontFamily: 'monospace', fontSize: 13, cursor: 'pointer' }}
        >
          {code}
        </a>
      ),
    },
    {
      title: 'Tên vật tư yêu cầu',
      dataIndex: 'requestedName',
      key: 'requestedName',
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>{name}</Text>
          {record.normalizedName && record.normalizedName !== name && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              → {record.normalizedName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'requestedCategory',
      key: 'requestedCategory',
      width: 160,
      render: (cat: string) => (
        <Text style={{ fontSize: 13 }}>{cat}</Text>
      ),
    },
    {
      title: 'Đơn vị yêu cầu',
      key: 'dept',
      width: 180,
      render: (_: unknown, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>{record.requesterDeptName}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.requesterName}</Text>
        </Space>
      ),
    },
    {
      title: 'Mã dự kiến',
      dataIndex: 'assignedCode',
      key: 'assignedCode',
      width: 120,
      render: (code?: string) =>
        code ? (
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>
            {code}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: RequestStatus) => {
        const cfg = requestStatusConfig[status];
        return (
          <Tag color={cfg.color} style={{ borderRadius: 4, fontSize: 12 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_: unknown, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/product-requests/${record.id}`);
              if (key === 'edit') navigate(`/product-requests/${record.id}/edit`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  // ─── Stat cards ────────────────────────────────────────────
  const statCards = [
    {
      label: 'Tổng yêu cầu',
      value: stats.total,
      suffix: 'YC',
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <AuditOutlined style={{ fontSize: 28 }} />,
    },
    {
      label: 'Đang xử lý',
      value: stats.pending,
      suffix: 'YC',
      gradient: 'linear-gradient(135deg, #d48806, #faad14)',
      icon: <SyncOutlined style={{ fontSize: 28 }} />,
    },
    {
      label: 'Đã ban hành',
      value: stats.published,
      suffix: 'YC',
      gradient: 'linear-gradient(135deg, #237804, #52c41a)',
      icon: <CheckCircleOutlined style={{ fontSize: 28 }} />,
    },
    {
      label: 'Từ chối',
      value: stats.rejected,
      suffix: 'YC',
      gradient: 'linear-gradient(135deg, #a8071a, #ff4d4f)',
      icon: <CloseCircleOutlined style={{ fontSize: 28 }} />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AuditOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Yêu cầu bổ sung danh mục</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản lý quy trình bổ sung sản phẩm vào danh mục kho</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/product-requests/new')} style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}>
          Tạo yêu cầu
        </Button>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────────── */}
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
              bodyStyle={{ padding: '18px 20px', position: 'relative', zIndex: 1 }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  color: 'rgba(255,255,255,0.1)',
                  fontSize: 56,
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
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>
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

      {/* ─── Filter Bar ──────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, marginBottom: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder="Tìm theo mã, tên vật tư, người yêu cầu..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(requestStatusConfig).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              }))}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Đơn vị yêu cầu"
              value={filterDept}
              onChange={setFilterDept}
              allowClear
              style={{ width: '100%' }}
              options={deptOptions}
            />
          </Col>
        </Row>
      </Card>

      {/* ─── Table ───────────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center" size={8}>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  Danh sách yêu cầu
                </Text>
                <Badge
                  count={filtered.length}
                  style={{ backgroundColor: '#e8f0fe', color: '#1B3A5C', fontSize: 11 }}
                />
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hiển thị {filtered.length} / {productRequests.length} yêu cầu
              </Text>
            </Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} yêu cầu`,
          }}
          scroll={{ x: 1100 }}
          size="middle"
          style={{ padding: '0 4px' }}
        />
      </Card>
    </div>
  );
};

export default ProductRequests;
