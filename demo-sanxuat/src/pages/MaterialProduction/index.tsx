import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Space, Typography, Row, Col, Input, Select, Button, Dropdown, Modal, message,
} from 'antd';
import {
  ToolOutlined, SyncOutlined, CheckCircleOutlined, SearchOutlined,
  MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined,
  PlusOutlined, ExperimentOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MaterialProductionOrder, ProductionOrderStatus } from '../../types';
import { orderStatusConfig, priorityConfig, formatDate, formatNumber } from '../../utils/format';

const { Text, Title } = Typography;

// --- Mock data — tham chiếu đúng lệnh SX thật ---
const materialOrders: MaterialProductionOrder[] = [
  {
    id: 'MPO-001', code: 'LSXVT-2026-001',
    materialCode: 'BM-XL', materialName: 'Bo mạch xử lý trung tần',
    specification: 'FPGA Xilinx, PCB 6 lớp',
    requestedQty: 20, completedQty: 20,
    sourceOrderCode: 'LSX-2026-0058',
    workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)',
    status: 'completed', priority: 'high',
    startDate: '2026-03-01', endDate: '2026-03-20', createdAt: '2026-02-25',
  },
  {
    id: 'MPO-002', code: 'LSXVT-2026-002',
    materialCode: 'VH-001', materialName: 'Vỏ hộp kim loại',
    specification: 'Nhôm 6061, 400x300x150mm',
    requestedQty: 10, completedQty: 10,
    sourceOrderCode: 'LSX-2026-0058',
    workshopId: 'PX3', workshopName: 'Trung tâm Hạ tầng (PX3)',
    status: 'completed', priority: 'normal',
    startDate: '2026-03-01', endDate: '2026-03-15', createdAt: '2026-02-25',
  },
  {
    id: 'MPO-003', code: 'LSXVT-2026-003',
    materialCode: 'RF-P37', materialName: 'Đầu nối RF cao tần Beta-37',
    specification: 'Type-N, 50 Ohm, niken mạ vàng',
    requestedQty: 60, completedQty: 36,
    sourceOrderCode: 'LSX-2026-0062',
    workshopId: 'PX3', workshopName: 'Trung tâm Hạ tầng (PX3)',
    status: 'in_progress', priority: 'high',
    startDate: '2026-04-01', endDate: '2026-04-20', createdAt: '2026-03-28',
  },
  {
    id: 'MPO-004', code: 'LSXVT-2026-004',
    materialCode: 'TD-CS', materialName: 'Tụ điện công suất 470uF/400V',
    specification: 'Rubycon YXF series, điện phân',
    requestedQty: 30, completedQty: 0,
    sourceOrderCode: 'LSX-2026-0064',
    workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)',
    status: 'ready', priority: 'normal',
    startDate: '2026-04-15', endDate: '2026-04-30', createdAt: '2026-04-05',
  },
  {
    id: 'MPO-005', code: 'LSXVT-2026-005',
    materialCode: 'CB-RF', materialName: 'Cáp RF đồng trục cho gateway',
    specification: 'RG-213, 50 Ohm, 5m, 2 đầu N-Type',
    requestedQty: 12, completedQty: 0,
    sourceOrderCode: 'LSX-2026-0061',
    workshopId: 'PX4', workshopName: 'Trung tâm Phát triển Phần mềm (PX4)',
    status: 'pending_material', priority: 'critical',
    startDate: '2026-04-20', endDate: '2026-05-10', createdAt: '2026-04-05',
  },
];

const MaterialProductionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProductionOrderStatus | undefined>(undefined);

  const filteredData = useMemo(() => {
    return materialOrders.filter((o) => {
      const matchSearch = !searchText ||
        o.code.toLowerCase().includes(searchText.toLowerCase()) ||
        o.materialName.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [searchText, filterStatus]);

  const stats = {
    total: materialOrders.length,
    inProgress: materialOrders.filter(o => o.status === 'in_progress').length,
    completed: materialOrders.filter(o => o.status === 'completed').length,
    totalQty: materialOrders.reduce((s, o) => s + o.requestedQty, 0),
  };

  const handleDelete = (record: MaterialProductionOrder) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Xóa lệnh sản xuất vật tư "${record.materialName}" (${record.code})?`,
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: () => message.success('Đã xóa lệnh sản xuất vật tư'),
    });
  };

  const columns: ColumnsType<MaterialProductionOrder> = [
    {
      title: 'Mã lệnh', dataIndex: 'code', key: 'code', width: 160,
      render: (v: string) => <Text strong style={{ color: '#1B3A5C', fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'Vật tư', key: 'material', width: 220,
      render: (_: unknown, r: MaterialProductionOrder) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.materialName}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.materialCode} — {r.specification}</div>
        </div>
      ),
    },
    {
      title: 'Số lượng', key: 'qty', width: 120, align: 'center',
      render: (_: unknown, r: MaterialProductionOrder) => (
        <Text>
          <Text style={{ color: r.completedQty >= r.requestedQty ? '#52c41a' : '#1B3A5C', fontWeight: 600 }}>
            {formatNumber(r.completedQty)}
          </Text>
          <Text type="secondary"> / {formatNumber(r.requestedQty)}</Text>
        </Text>
      ),
    },
    {
      title: 'Trung tâm', dataIndex: 'workshopName', key: 'workshopName', width: 180,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Nguồn yêu cầu', dataIndex: 'sourceOrderCode', key: 'source', width: 150,
      render: (v?: string) => v
        ? <Button type="link" size="small" style={{ padding: 0, fontFamily: 'monospace', fontSize: 12 }}
            onClick={() => {
              const orderId = materialOrders.find(o => o.sourceOrderCode === v)?.sourceOrderCode;
              if (orderId) navigate(`/production-orders`);
            }}>{v}</Button>
        : <Text type="secondary">--</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: ProductionOrderStatus) => {
        const cfg = orderStatusConfig[s];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 100,
      render: (p: string) => {
        const cfg = priorityConfig[p];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác', key: 'actions', width: 70, align: 'center',
      render: (_: unknown, record: MaterialProductionOrder) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(record.status === 'draft' || record.status === 'ready' ? [
                { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true as const },
              ] : []),
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/material-production/${record.id}`);
              if (key === 'edit') navigate(`/material-production/${record.id}/edit`);
              if (key === 'delete') handleDelete(record);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ExperimentOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Sản xuất vật tư kỹ thuật</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổ chức sản xuất vật tư, phụ tùng phục vụ sản xuất và sửa chữa</Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/material-production/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}>
          Tạo lệnh SX vật tư
        </Button>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng lệnh', value: stats.total, icon: <ToolOutlined />, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Đang sản xuất', value: stats.inProgress, icon: <SyncOutlined />, gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)' },
          { label: 'Hoàn thành', value: stats.completed, icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #52c41a, #73d13d)' },
          { label: 'Tổng số lượng yêu cầu', value: stats.totalQty, icon: <ExperimentOutlined />, gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
        ].map((card, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }}
              styles={{ body: { padding: '16px 18px', position: 'relative' } }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, pointerEvents: 'none' }}>
                <span style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }}>{card.icon}</span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{card.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8}>
            <Input placeholder="Tìm kiếm theo mã lệnh, tên vật tư..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }} />
          </Col>
          <Col xs={12} sm={5}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus}
              allowClear style={{ width: '100%' }}
              options={Object.entries(orderStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col xs={12} sm={11} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredData.length}/{materialOrders.length} kết quả</Text>
              <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); }}>Xóa bộ lọc</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ExperimentOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Danh sách lệnh sản xuất vật tư</Title>
          </Space>
        </div>
        <Table<MaterialProductionOrder>
          columns={columns} dataSource={filteredData} rowKey="id" size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi` }}
        />
      </Card>
    </div>
  );
};

export default MaterialProductionPage;
