import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Row, Col, Tag, Table, Typography, Input, Select, Space, Button, Dropdown, message,
} from 'antd';
import {
  AuditOutlined, ClockCircleOutlined, CheckCircleOutlined, DollarOutlined,
  SearchOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined, FilterOutlined, SendOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

import { biddingPackages } from '../../data/bidding';
import { formatCurrency, formatDate, biddingStatusConfig, biddingTypeConfig } from '../../utils/format';
import { useUser } from '../../contexts/UserContext';
import { usePageHeader } from '../../contexts/PageHeaderContext';
import { colors } from '../../theme/themeConfig';
import type { BiddingPackage, BiddingStatus, BiddingType } from '../../types';

const { Title, Text } = Typography;

const BiddingPage: React.FC = () => {
  const { isProcurement } = useUser();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<BiddingStatus | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<BiddingType | undefined>(undefined);

  // Stats
  const stats = useMemo(() => ({
    total: biddingPackages.length,
    evaluating: biddingPackages.filter(p => p.status === 'evaluating' || p.status === 'receiving').length,
    completed: biddingPackages.filter(p => p.status === 'completed' || p.status === 'approved').length,
    totalValue: biddingPackages.reduce((s, p) => s + p.estimatedValue, 0),
  }), []);

  // Filter
  const filteredData = useMemo(() => {
    return biddingPackages.filter(p => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!p.code.toLowerCase().includes(q) && !p.title.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      if (typeFilter && p.type !== typeFilter) return false;
      return true;
    });
  }, [searchText, statusFilter, typeFilter]);

  // Action menu
  const getActionMenuItems = (pkg: BiddingPackage): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/bidding/${pkg.id}`) },
    ];
    if (isProcurement && pkg.status === 'draft') {
      items.push(
        { type: 'divider' },
        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: () => navigate(`/bidding/${pkg.id}/edit`) },
        { key: 'publish', icon: <SendOutlined />, label: 'Đăng tải', onClick: () => message.info(`Đã đăng tải ${pkg.code}`) },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => message.success(`Đã xóa ${pkg.code}`) },
      );
    }
    return items;
  };

  // Table columns
  const columns: ColumnsType<BiddingPackage> = [
    {
      title: 'Mã gói thầu', dataIndex: 'code', key: 'code', width: 130, fixed: 'left' as const,
      render: (code: string, record: BiddingPackage) => (
        <Text strong style={{ color: colors.navy, cursor: 'pointer' }} onClick={() => navigate(`/bidding/${record.id}`)}>{code}</Text>
      ),
    },
    {
      title: 'Tên gói thầu', dataIndex: 'title', key: 'title', width: 300, ellipsis: true,
      render: (title: string, record: BiddingPackage) => (
        <Text style={{ cursor: 'pointer' }} onClick={() => navigate(`/bidding/${record.id}`)}>{title}</Text>
      ),
    },
    {
      title: 'Hình thức', dataIndex: 'type', key: 'type', width: 150, align: 'center',
      render: (type: BiddingType) => {
        const cfg = biddingTypeConfig[type];
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Giá trị dự toán', dataIndex: 'estimatedValue', key: 'value', width: 120, align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.estimatedValue - b.estimatedValue,
    },
    {
      title: 'SL vật tư', key: 'items', width: 85, align: 'center',
      render: (_: unknown, record: BiddingPackage) => (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          color: '#fff', fontSize: 13, fontWeight: 600,
        }}>{record.items.length}</span>
      ),
    },
    {
      title: 'Hồ sơ dự thầu', key: 'submissions', width: 110, align: 'center',
      render: (_: unknown, record: BiddingPackage) => (
        <Text>{record.submissions.length} hồ sơ</Text>
      ),
    },
    {
      title: 'Thời gian TH', dataIndex: 'executionDays', key: 'execution', width: 110, align: 'center',
      render: (v: number) => <Text style={{ fontSize: 13 }}>{v} ngày</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (status: BiddingStatus) => {
        const cfg = biddingStatusConfig[status];
        return <Tag color={cfg.color} style={{ fontSize: 12 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'NCC trúng thầu', key: 'selected', width: 160, ellipsis: true,
      render: (_: unknown, record: BiddingPackage) => {
        if (!record.selectedSupplierName) return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
        return <Tag color={colors.success}>{record.selectedSupplierName}</Tag>;
      },
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdDate', key: 'date', width: 105,
      render: (d: string) => formatDate(d),
      sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: 'Thao tác', key: 'action', width: 70, align: 'center', fixed: 'right' as const,
      render: (_: unknown, record: BiddingPackage) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />} style={{ color: '#999' }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4, color: colors.navy }}>
            <AuditOutlined style={{ marginRight: 8 }} />
            Đấu thầu & Chào giá
          </Title>
          <Text type="secondary">Quản lý gói thầu, hồ sơ mời thầu, đánh giá và lựa chọn nhà cung cấp</Text>
        </div>
        {isProcurement && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/bidding/new')}>
            Tạo gói thầu
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng gói thầu', value: stats.total, unit: 'gói', bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <AuditOutlined /> },
          { label: 'Đang đánh giá', value: stats.evaluating, unit: 'gói', bg: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <ClockCircleOutlined /> },
          { label: 'Đã hoàn thành', value: stats.completed, unit: 'gói', bg: 'linear-gradient(135deg, #059669, #10b981)', icon: <CheckCircleOutlined /> },
          { label: 'Tổng giá trị', value: formatCurrency(stats.totalValue), unit: '', bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <DollarOutlined /> },
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
          <Col xs={24} sm={12} md={7}>
            <Input prefix={<SearchOutlined style={{ color: colors.navy }} />} placeholder="Tìm theo mã, tên gói thầu..." value={searchText} onChange={e => setSearchText(e.target.value)} allowClear />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Hình thức" value={typeFilter} onChange={v => setTypeFilter(v)} allowClear style={{ width: '100%' }}
              options={Object.entries(biddingTypeConfig).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Trạng thái" value={statusFilter} onChange={v => setStatusFilter(v)} allowClear style={{ width: '100%' }}
              options={Object.entries(biddingStatusConfig).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Button icon={<FilterOutlined />} onClick={() => { setSearchText(''); setStatusFilter(undefined); setTypeFilter(undefined); }}>Xóa lọc</Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 0' }}>
          <Text strong style={{ color: colors.navy, fontSize: 15 }}>Danh sách gói thầu ({filteredData.length})</Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng ${total} gói thầu` }}
          onRow={(record) => ({ onDoubleClick: () => navigate(`/bidding/${record.id}`), style: { cursor: 'pointer' } })}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default BiddingPage;
