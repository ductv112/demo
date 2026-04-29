import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography,
  Dropdown, App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, PlusOutlined, FormOutlined, MoreOutlined,
  EyeOutlined, EditOutlined, SendOutlined, DeleteOutlined,
  ExclamationCircleOutlined, FileTextOutlined,
  SyncOutlined, CheckCircleOutlined, HourglassOutlined,
} from '@ant-design/icons';
import { replenishments as replenishmentsSource } from '../../data/replenishments';
import type { Replenishment, ReplenishmentSource, ReplenishmentStatus } from '../../types';
import { replenishmentStatusConfig, formatDate, formatNumber } from '../../utils/format';
import { expandedRowRender } from '../Replenishment/ExpandedRow';

const { Title, Text } = Typography;

const sourceLabels: Record<ReplenishmentSource, { label: string; color: string }> = {
  demand:    { label: 'Nhu cầu phát sinh', color: '#1B3A5C' },
  forecast:  { label: 'Dự báo', color: '#531dab' },
  min_stock: { label: 'Mức tối thiểu', color: '#d48806' },
  manual:    { label: 'Thủ công', color: '#08979c' },
};
const formatValue = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)} tỷ` : `${v} tr`;

const ReplenishmentDemandInner: React.FC = () => {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();

  const [repList, setRepList] = useState<Replenishment[]>([...replenishmentsSource]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReplenishmentStatus | undefined>();
  const [filterWarehouse, setFilterWarehouse] = useState<string | undefined>();

  const syncAndSet = (updater: (prev: Replenishment[]) => Replenishment[]) => {
    setRepList(prev => {
      const next = updater(prev);
      replenishmentsSource.splice(0, replenishmentsSource.length, ...next);
      return next;
    });
  };

  const baseData = useMemo(
    () => repList.filter(r => r.source === 'demand' || r.source === 'min_stock'),
    [repList],
  );

  const filteredData = useMemo(() => baseData.filter(r => {
    const matchSearch = !searchText
      || r.code.toLowerCase().includes(searchText.toLowerCase())
      || r.warehouseName.toLowerCase().includes(searchText.toLowerCase())
      || (r.note || '').toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchWh = !filterWarehouse || r.warehouseId === filterWarehouse;
    return matchSearch && matchStatus && matchWh;
  }), [baseData, searchText, filterStatus, filterWarehouse]);

  const stats = useMemo(() => ({
    total:      baseData.length,
    draft:      baseData.filter(r => r.status === 'draft').length,
    inProgress: baseData.filter(r => r.status === 'in_progress').length,
    done:       baseData.filter(r => r.status === 'done').length,
  }), [baseData]);

  const warehouseOpts = useMemo(() => [...new Map(
    baseData.map(r => [r.warehouseId, { id: r.warehouseId, name: r.warehouseName }])
  ).values()], [baseData]);

  const handleSubmitRequest = (record: Replenishment) => {
    modal.confirm({
      title: 'Nộp yêu cầu bổ sung',
      icon: <ExclamationCircleOutlined />,
      content: `Nộp yêu cầu ${record.code}? Hệ thống sẽ tự động kiểm tra tồn kho và xử lý.`,
      okText: 'Nộp yêu cầu', cancelText: 'Hủy',
      okButtonProps: { style: { background: '#1B3A5C' } },
      onOk: () => {
        syncAndSet(prev => prev.map(r => r.id === record.id ? { ...r, status: 'in_progress' } : r));
        message.success(`Đã nộp ${record.code} — hệ thống đang xử lý`);
      },
    });
  };

  const handleDelete = (record: Replenishment) => {
    modal.confirm({
      title: 'Xóa yêu cầu',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `Xóa yêu cầu ${record.code}? Hành động này không thể hoàn tác.`,
      okText: 'Xóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
      onOk: () => {
        syncAndSet(prev => prev.filter(r => r.id !== record.id));
        message.success(`Đã xóa ${record.code}`);
      },
    });
  };

  const hasActiveFilters = searchText || filterStatus || filterWarehouse;
  const handleResetFilters = () => {
    setSearchText('');
    setFilterStatus(undefined);
    setFilterWarehouse(undefined);
  };

  const columns: ColumnsType<Replenishment> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 140,
      render: (code: string) => <Text style={{ color: '#1B3A5C', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{code}</Text>,
    },
    {
      title: 'Kho', dataIndex: 'warehouseName', key: 'wh', width: 200, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: 'Nguồn', dataIndex: 'source', key: 'source', width: 160,
      render: (src: ReplenishmentSource) => {
        const c = sourceLabels[src];
        return <Tag color={c.color} style={{ borderRadius: 4, fontSize: 12 }}>{c.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (st: ReplenishmentStatus) => {
        const c = replenishmentStatusConfig[st];
        return <Tag color={c.color} style={{ borderRadius: 4, fontSize: 12 }}>{c.label}</Tag>;
      },
    },
    {
      title: 'Số mặt hàng', dataIndex: 'totalItems', key: 'items', width: 110, align: 'right',
      render: (v: number) => <Text style={{ fontWeight: 500, fontSize: 13 }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Giá trị', dataIndex: 'totalValue', key: 'val', width: 110, align: 'right',
      render: (v: number) => <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{formatValue(v)}</Text>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'date', width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 60, align: 'center',
      render: (_: unknown, record: Replenishment) => {
        const items: import('antd').MenuProps['items'] = [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/replenishment/${record.id}`) },
        ];
        if (record.status === 'draft') {
          items.push(
            { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: () => navigate(`/replenishment/${record.id}/edit`) },
            { type: 'divider' },
            { key: 'submit', icon: <SendOutlined />, label: 'Nộp yêu cầu', onClick: () => handleSubmitRequest(record) },
            { type: 'divider' },
            { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record) },
          );
        }
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      {/* ─── Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FormOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Bổ sung theo Nhu cầu</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Yêu cầu bổ sung phát sinh từ nhu cầu sử dụng thực tế</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
          onClick={() => navigate('/replenishment/new')}>
          Tạo yêu cầu
        </Button>
      </div>

      {/* ─── Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          {
            label: 'Tổng yêu cầu', value: stats.total, suffix: 'yêu cầu',
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <FileTextOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Bản nháp', value: stats.draft, suffix: 'yêu cầu',
            gradient: 'linear-gradient(135deg, #595959, #8c8c8c)',
            icon: <FileTextOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đang xử lý', value: stats.inProgress, suffix: 'yêu cầu',
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
            icon: <SyncOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Hoàn thành', value: stats.done, suffix: 'yêu cầu',
            gradient: 'linear-gradient(135deg, #237804, #52c41a)',
            icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
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
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{card.label}</Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{card.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>{card.suffix}</span>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Filter Bar */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo mã đề xuất, kho, ghi chú..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus} allowClear style={{ width: '100%' }}
              options={Object.entries(replenishmentStatusConfig).map(([k, c]) => ({ value: k, label: c.label }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Kho" value={filterWarehouse} onChange={setFilterWarehouse} allowClear style={{ width: '100%' }}
              options={warehouseOpts.map(w => ({ value: w.id, label: w.name }))} />
          </Col>
          {hasActiveFilters && (
            <Col xs={12} sm={6} md={4}>
              <Button onClick={handleResetFilters} style={{ borderRadius: 6 }}>Xóa bộ lọc</Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* ─── Table */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          style={{ borderRadius: 14, overflow: 'hidden' }}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          expandable={{ expandedRowRender, rowExpandable: r => r.lines.length > 0 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '50'],
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} yêu cầu`,
          }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

const ReplenishmentDemand: React.FC = () => (
  <App>
    <ReplenishmentDemandInner />
  </App>
);

export default ReplenishmentDemand;
