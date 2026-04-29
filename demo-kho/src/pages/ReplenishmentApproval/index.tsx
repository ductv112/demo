import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography, App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, CheckCircleOutlined,
  CheckOutlined, CloseOutlined, EyeOutlined, ExclamationCircleOutlined,
  SyncOutlined, FileTextOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { replenishments as replenishmentsSource } from '../../data/replenishments';
import type { Replenishment, ReplenishmentSource, ReplenishmentStatus } from '../../types';
import { replenishmentStatusConfig, formatDate, formatNumber } from '../../utils/format';
import { expandedRowRender } from '../Replenishment/ExpandedRow';

const { Title, Text } = Typography;

const sourceLabels: Record<ReplenishmentSource, { label: string; color: string }> = {
  demand:    { label: 'Nhu cầu', color: '#1B3A5C' },
  forecast:  { label: 'Dự báo', color: '#531dab' },
  min_stock: { label: 'Mức tối thiểu', color: '#d48806' },
  manual:    { label: 'Thủ công', color: '#08979c' },
};
const formatValue = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)} tỷ` : `${v} tr`;

const ReplenishmentApprovalInner: React.FC = () => {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();

  const [repList, setRepList] = useState<Replenishment[]>([...replenishmentsSource]);
  const [searchText, setSearchText] = useState('');
  const [filterSource, setFilterSource] = useState<ReplenishmentSource | undefined>();

  const syncAndSet = (updater: (prev: Replenishment[]) => Replenishment[]) => {
    setRepList(prev => {
      const next = updater(prev);
      replenishmentsSource.splice(0, replenishmentsSource.length, ...next);
      return next;
    });
  };

  const baseData = useMemo(
    () => repList.filter(r => r.status === 'submitted' || r.status === 'approved'),
    [repList],
  );

  const filteredData = useMemo(() => baseData.filter(r => {
    const matchSearch = !searchText
      || r.code.toLowerCase().includes(searchText.toLowerCase())
      || r.warehouseName.toLowerCase().includes(searchText.toLowerCase())
      || (r.note || '').toLowerCase().includes(searchText.toLowerCase());
    return matchSearch && (!filterSource || r.source === filterSource);
  }), [baseData, searchText, filterSource]);

  const stats = useMemo(() => ({
    pending:    baseData.filter(r => r.status === 'submitted').length,
    approved:   baseData.filter(r => r.status === 'approved').length,
    total:      baseData.length,
    totalValue: baseData.filter(r => r.status === 'approved').reduce((s, r) => s + r.totalValue, 0),
  }), [baseData]);

  const hasActiveFilters = searchText || filterSource;
  const handleResetFilters = () => {
    setSearchText('');
    setFilterSource(undefined);
  };

  const handleApprove = (record: Replenishment) => {
    modal.confirm({
      title: 'Xác nhận phê duyệt',
      icon: <ExclamationCircleOutlined />,
      content: `Phê duyệt đề xuất ${record.code}?`,
      okText: 'Phê duyệt', cancelText: 'Hủy',
      okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } },
      onOk: () => {
        syncAndSet(prev => prev.map(r => r.id === record.id ? { ...r, status: 'approved' } : r));
        message.success(`Đã phê duyệt ${record.code}`);
      },
    });
  };

  const handleReject = (record: Replenishment) => {
    modal.confirm({
      title: 'Từ chối đề xuất',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `Từ chối đề xuất ${record.code}?`,
      okText: 'Từ chối', okButtonProps: { danger: true }, cancelText: 'Hủy',
      onOk: () => {
        syncAndSet(prev => prev.map(r => r.id === record.id ? { ...r, status: 'rejected' } : r));
        message.success(`Đã từ chối ${record.code}`);
      },
    });
  };

  const columns: ColumnsType<Replenishment> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 140,
      render: (c: string) => <Text style={{ color: '#1B3A5C', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{c}</Text>,
    },
    {
      title: 'Kho', dataIndex: 'warehouseName', key: 'wh', width: 180, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: 'Nguồn', dataIndex: 'source', key: 'source', width: 140,
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
      title: 'Thao tác', key: 'actions', width: 180, align: 'center',
      render: (_: unknown, record: Replenishment) => {
        if (record.status === 'submitted') {
          return (
            <Space size={4}>
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/replenishment/${record.id}`)}
                style={{ fontSize: 12 }} />
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}
                style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 6, fontSize: 12 }}>
                Duyệt
              </Button>
              <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record)}
                style={{ borderRadius: 6, fontSize: 12 }}>
                Từ chối
              </Button>
            </Space>
          );
        }
        return (
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/replenishment/${record.id}`)}
            style={{ fontSize: 12 }}>
            Xem
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* ─── Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #237804, #52c41a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Phê duyệt đề xuất</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Xem xét và phê duyệt các đề xuất bổ sung đang chờ xử lý</Text>
          </div>
        </Space>
      </div>

      {/* ─── Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          {
            label: 'Tổng trong danh sách', value: stats.total, suffix: 'đề xuất',
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <FileTextOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Chờ phê duyệt', value: stats.pending, suffix: 'đề xuất',
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
            icon: <SyncOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đã phê duyệt', value: stats.approved, suffix: 'đề xuất',
            gradient: 'linear-gradient(135deg, #237804, #52c41a)',
            icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Giá trị đã duyệt', value: formatValue(stats.totalValue), suffix: '',
            gradient: 'linear-gradient(135deg, #391085, #531dab)',
            icon: <CloseCircleOutlined style={{ fontSize: 64 }} />,
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
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: typeof card.value === 'string' ? 20 : 26 }}>{card.value}</span>
                  {card.suffix && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>{card.suffix}</span>}
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
            <Select placeholder="Nguồn" value={filterSource} onChange={setFilterSource} allowClear style={{ width: '100%' }}
              options={Object.entries(sourceLabels).map(([k, c]) => ({ value: k, label: c.label }))} />
          </Col>
          {hasActiveFilters && (
            <Col xs={12} sm={6} md={4}>
              <Button onClick={handleResetFilters} style={{ borderRadius: 6 }}>Xóa bộ lọc</Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* ─── Pending table */}
      {filteredData.filter(r => r.status === 'submitted').length > 0 && (
        <Card
          style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
          styles={{ body: { padding: 0 } }}
          title={
            <Space style={{ padding: '4px 0' }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: '#faad14' }} />
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>
                Chờ phê duyệt ({filteredData.filter(r => r.status === 'submitted').length})
              </Text>
            </Space>
          }
        >
          <Table
            style={{ borderRadius: 14, overflow: 'hidden' }}
            columns={columns}
            dataSource={filteredData.filter(r => r.status === 'submitted')}
            rowKey="id"
            expandable={{ expandedRowRender, rowExpandable: r => r.lines.length > 0 }}
            pagination={false}
            scroll={{ x: 1100 }}
            size="middle"
          />
        </Card>
      )}

      {/* ─── Approved table */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        title={
          <Space style={{ padding: '4px 0' }}>
            <div style={{ width: 4, height: 16, borderRadius: 2, background: '#52c41a' }} />
            <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>
              Đã phê duyệt ({filteredData.filter(r => r.status === 'approved').length})
            </Text>
          </Space>
        }
        styles={{ header: { borderBottom: '1px solid #f0f0f0', padding: '0 20px' }, body: { padding: 0 } }}
      >
        <Table
          style={{ borderRadius: 14, overflow: 'hidden' }}
          columns={columns}
          dataSource={filteredData.filter(r => r.status === 'approved')}
          rowKey="id"
          expandable={{ expandedRowRender, rowExpandable: r => r.lines.length > 0 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '50'],
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} đề xuất`,
          }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

const ReplenishmentApproval: React.FC = () => (
  <App>
    <ReplenishmentApprovalInner />
  </App>
);

export default ReplenishmentApproval;
