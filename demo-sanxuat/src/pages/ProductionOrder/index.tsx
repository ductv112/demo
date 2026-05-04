import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Row, Col, Typography, Progress, Input, Select, Space, Button, Tooltip, Dropdown,
  Drawer, Form, InputNumber, message,
} from 'antd';
import {
  UnorderedListOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { productionOrders } from '../../data/productionOrders';
import { processRoutings, processSteps } from '../../data/processRoutings';
import { bomItems } from '../../data/productStructures';
import type { BOMItem } from '../../types';
import {
  orderStatusConfig,
  orderTypeConfig,
  priorityConfig,
  formatDate,
} from '../../utils/format';
import type { ProductionOrder, ProductionOrderStatus, ProductionOrderType } from '../../types';

const { Title, Text } = Typography;

const statCards = [
  {
    key: 'total',
    label: 'Tổng lệnh sản xuất',
    icon: <UnorderedListOutlined />,
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    key: 'in_progress',
    label: 'Đang sản xuất',
    icon: <SyncOutlined />,
    gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
  },
  {
    key: 'pending_material',
    label: 'Chờ vật tư',
    icon: <ClockCircleOutlined />,
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
  },
  {
    key: 'completed',
    label: 'Hoàn thành',
    icon: <CheckCircleOutlined />,
    gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  },
];

const ProductionOrderPage: React.FC = () => {
  const navigate = useNavigate();

  // --- Drawer cập nhật tiến độ ---
  const [progressDrawerOpen, setProgressDrawerOpen] = useState(false);
  const [progressOrder, setProgressOrder] = useState<ProductionOrder | null>(null);
  const [progressForm] = Form.useForm();
  const [materialUsage, setMaterialUsage] = useState<(BOMItem & { actualQty: number })[]>([]);

  const selectedStep = Form.useWatch('currentStep', progressForm);

  // Lấy steps + BOM items cho order đang cập nhật
  const progressSteps = useMemo(() => {
    if (!progressOrder) return [];
    const routing = processRoutings.find((r) => r.productId === progressOrder.productId);
    if (!routing) return [];
    return processSteps.filter((s) => s.routingId === routing.id);
  }, [progressOrder]);

  // Lọc vật tư theo công đoạn — dùng field usedInStep trên BOMItem
  const filteredMaterials = useMemo(() => {
    if (!progressOrder) return [];
    const allItems = bomItems.filter((bi) => bi.bomId === progressOrder.productId);
    if (!selectedStep) return allItems.map((bi) => ({ ...bi, actualQty: 0 }));

    // Tìm stepNo từ tên công đoạn đã chọn
    const step = progressSteps.find((s) => s.name === selectedStep);
    if (!step) return allItems.map((bi) => ({ ...bi, actualQty: 0 }));

    const filtered = allItems.filter((bi) =>
      bi.usedInStep && bi.usedInStep.includes(step.stepNo)
    );
    return (filtered.length > 0 ? filtered : allItems).map((bi) => ({ ...bi, actualQty: 0 }));
  }, [progressOrder, selectedStep, progressSteps]);

  // Auto-sync materialUsage khi filteredMaterials thay đổi (do đổi công đoạn)
  useEffect(() => {
    if (progressDrawerOpen && filteredMaterials.length > 0) {
      setMaterialUsage(filteredMaterials);
    }
  }, [filteredMaterials, progressDrawerOpen]);

  const openProgressDrawer = (order: ProductionOrder) => {
    setProgressOrder(order);
    progressForm.resetFields();
    progressForm.setFieldsValue({ addedQty: 1, action: 'update' });
    setProgressDrawerOpen(true);
  };

  const updateMaterialQty = (itemId: string, qty: number) => {
    setMaterialUsage((prev) => prev.map((m) => m.id === itemId ? { ...m, actualQty: qty } : m));
  };

  const handleUpdateProgress = () => {
    progressForm.validateFields().then((values) => {
      const usedMaterials = materialUsage.filter((m) => m.actualQty > 0);
      message.success(`Cập nhật tiến độ ${progressOrder?.code}: +${values.addedQty} SP, ${usedMaterials.length} vật tư`);
      setProgressDrawerOpen(false);
      setProgressOrder(null);
    });
  };

  const [statusFilter, setStatusFilter] = useState<ProductionOrderStatus | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<ProductionOrderType | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const stats = useMemo(() => ({
    total: productionOrders.length,
    in_progress: productionOrders.filter((o) => o.status === 'in_progress').length,
    pending_material: productionOrders.filter((o) => o.status === 'pending_material').length,
    completed: productionOrders.filter((o) => o.status === 'completed').length,
  }), []);

  const filteredData = useMemo(() => {
    let result = [...productionOrders];
    if (statusFilter) result = result.filter((o) => o.status === statusFilter);
    if (typeFilter) result = result.filter((o) => o.type === typeFilter);
    if (priorityFilter) result = result.filter((o) => o.priority === priorityFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (o) => o.code.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [statusFilter, typeFilter, priorityFilter, searchText]);

  const renderStatCard = (cfg: (typeof statCards)[number], value: number) => (
    <Col xs={24} sm={12} md={6} key={cfg.key}>
      <div
        style={{
          background: cfg.gradient,
          borderRadius: 14,
          padding: '20px 24px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)';
          const iconEl = el.querySelector('.stat-bg-icon') as HTMLElement;
          if (iconEl) iconEl.style.transform = 'rotate(15deg) scale(1.15)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
          const iconEl = el.querySelector('.stat-bg-icon') as HTMLElement;
          if (iconEl) iconEl.style.transform = 'rotate(0) scale(1)';
        }}
      >
        <div
          className="stat-bg-icon"
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            fontSize: 64,
            opacity: 0.1,
            color: '#fff',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {cfg.icon}
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
            fontSize: 16,
            color: '#fff',
            marginBottom: 12,
          }}
        >
          {cfg.icon}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
          {value}
          <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>lệnh</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          {cfg.label}
        </div>
      </div>
    </Col>
  );

  const getRowClassName = (record: ProductionOrder): string => {
    if (record.priority === 'critical') return 'row-critical';
    if (record.status === 'in_progress') return 'row-executing';
    return '';
  };

  const columns: ColumnsType<ProductionOrder> = [
    {
      title: 'Mã lệnh',
      dataIndex: 'code',
      width: 150,
      fixed: 'left',
      render: (code: string) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      width: 220,
      ellipsis: true,
      render: (name: string, record: ProductionOrder) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1B3A5C', fontSize: 13 }}>{name}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 140,
      render: (type: ProductionOrderType) => {
        const cfg = orderTypeConfig[type];
        return (
          <Tag style={{ color: '#fff', border: 'none', borderRadius: 4 }} color={cfg.color}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Số lượng (Hoàn thành/Tổng)',
      width: 130,
      render: (_: unknown, record: ProductionOrder) => {
        const pct = record.quantity > 0
          ? Math.round((record.completedQty / record.quantity) * 100)
          : 0;
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
              {record.completedQty}/{record.quantity}
            </div>
            <Progress
              percent={pct}
              size="small"
              strokeColor={pct >= 100 ? '#52c41a' : '#1B3A5C'}
              showInfo={false}
              style={{ marginBottom: 0 }}
            />
          </div>
        );
      },
    },
    {
      title: 'Trung tâm',
      dataIndex: 'workshopName',
      width: 130,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      width: 100,
      align: 'center',
      render: (priority: string) => {
        const cfg = priorityConfig[priority];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : priority;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status: ProductionOrderStatus) => {
        const cfg = orderStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Thao tác',
      width: 70,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: ProductionOrder) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...((record.status === 'in_progress' || record.status === 'paused')
                ? [{ key: 'progress', icon: <RiseOutlined />, label: 'Cập nhật tiến độ' }]
                : []),
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
              { key: 'print', icon: <PrinterOutlined />, label: 'In lệnh' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/production-orders/${record.id}`);
              if (key === 'edit') navigate(`/production-orders/${record.id}/edit`);
              if (key === 'progress') openProgressDrawer(record);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  const statusOptions = Object.entries(orderStatusConfig).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  const typeOptions = Object.entries(orderTypeConfig).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  const priorityOptions = Object.entries(priorityConfig).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

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
            <PlayCircleOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Lệnh sản xuất
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý lệnh sản xuất, theo dõi tiến độ thực hiện tại Trung tâm Phần mềm Alpha
            </Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/production-orders/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Thêm mới
        </Button>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {renderStatCard(statCards[0], stats.total)}
        {renderStatCard(statCards[1], stats.in_progress)}
        {renderStatCard(statCards[2], stats.pending_material)}
        {renderStatCard(statCards[3], stats.completed)}
      </Row>

      {/* Filter bar + Table */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Filter bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Tìm theo mã lệnh, tên sản phẩm..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            allowClear
            style={{ width: 160 }}
            options={statusOptions}
          />
          <Select
            placeholder="Loại lệnh"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            allowClear
            style={{ width: 160 }}
            options={typeOptions}
          />
          <Select
            placeholder="Ưu tiên"
            value={priorityFilter}
            onChange={(v) => setPriorityFilter(v)}
            allowClear
            style={{ width: 140 }}
            options={priorityOptions}
          />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c' }}>
            Hiển thị <Text strong>{filteredData.length}</Text>/{productionOrders.length} lệnh
          </div>
        </div>

        {/* Table */}
        <Table<ProductionOrder>
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          rowClassName={getRowClassName}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} lệnh sản xuất`,
          }}
          scroll={{ x: 1320 }}
          size="middle"
          style={{ margin: 0 }}
        />
      </Card>

      {/* Row highlight styles */}
      <style>{`
        .row-critical td {
          background: rgba(255, 77, 79, 0.04) !important;
        }
        .row-critical:hover td {
          background: rgba(255, 77, 79, 0.08) !important;
        }
        .row-executing td {
          background: rgba(24, 144, 255, 0.03) !important;
        }
        .row-executing:hover td {
          background: rgba(24, 144, 255, 0.07) !important;
        }
      `}</style>

      {/* ─── Drawer Cập nhật tiến độ ─── */}
      {progressOrder && (
        <Drawer
          title={
            <Space align="center" size={12}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RiseOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Cập nhật tiến độ</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {progressOrder.code} &mdash; {progressOrder.productName}
                </div>
              </div>
            </Space>
          }
          closeIcon={<span style={{ color: '#fff', fontSize: 16 }}>&#x2715;</span>}
          open={progressDrawerOpen}
          onClose={() => { setProgressDrawerOpen(false); setProgressOrder(null); }}
          width={640}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => { setProgressDrawerOpen(false); setProgressOrder(null); }}
                style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>Hủy</Button>
              <Button type="primary" icon={<RiseOutlined />} onClick={handleUpdateProgress}
                style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}>
                Cập nhật
              </Button>
            </div>
          }
          styles={{
            header: { background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)', borderBottom: 'none', padding: '20px 24px' },
            body: { padding: '24px', background: '#fafbfc' },
            footer: { borderTop: '1px solid #f0f0f0', padding: '16px 24px', background: '#fff' },
          }}
        >
          <Form form={progressForm} layout="vertical" requiredMark="optional">
            {/* Tiến độ hiện tại */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Tiến độ hiện tại</Text>
            </div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text>Đã hoàn thành</Text>
                <Text strong style={{ color: '#1B3A5C', fontSize: 16 }}>{progressOrder.completedQty}/{progressOrder.quantity}</Text>
              </div>
              <Progress percent={progressOrder.quantity > 0 ? Math.round((progressOrder.completedQty / progressOrder.quantity) * 100) : 0} strokeColor="#1B3A5C" />
            </Card>

            {/* Sản lượng */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Ghi nhận sản lượng</Text>
            </div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="addedQty" label="SL hoàn thành thêm" rules={[{ required: true, message: 'Nhập SL' }]}>
                    <InputNumber min={1} max={progressOrder.quantity - progressOrder.completedQty} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="defectQty" label="SL lỗi (nếu có)">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Công đoạn */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Công đoạn</Text>
            </div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="currentStep" label="Công đoạn hiện tại">
                    <Select placeholder="Chọn công đoạn"
                      options={progressSteps.map((s) => ({ value: s.name, label: `${s.stepNo}. ${s.name}` }))} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="stepStatus" label="Trạng thái">
                    <Select placeholder="Chọn" options={[
                      { value: 'in_progress', label: 'Đang thực hiện' },
                      { value: 'completed', label: 'Hoàn thành' },
                      { value: 'failed', label: 'Không đạt' },
                    ]} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Vật tư */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Vật tư sử dụng</Text>
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{materialUsage.length} vật tư</Text>
            </div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}
              styles={{ body: { padding: 0 } }}>
              {materialUsage.length > 0 ? (
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f7fa' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#1B3A5C', fontWeight: 600 }}>Vật tư</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 50 }}>ĐVT</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', width: 60 }}>Đ.mức</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>Thực tế</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', width: 70 }}>+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialUsage.map((m) => {
                      const diff = m.actualQty - m.quantity;
                      return (
                        <tr key={m.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '6px 12px' }}>
                            <Text style={{ fontSize: 12 }}>{m.materialName}</Text>
                          </td>
                          <td style={{ padding: '6px 12px', textAlign: 'center' }}>{m.unit}</td>
                          <td style={{ padding: '6px 12px', textAlign: 'right' }}>{m.quantity}</td>
                          <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                            <InputNumber size="small" min={0} value={m.actualQty} style={{ width: 70 }}
                              onChange={(v) => updateMaterialQty(m.id, v ?? 0)} />
                          </td>
                          <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                            {m.actualQty > 0 && (
                              <Text style={{ fontSize: 12, fontWeight: 600, color: diff > 0 ? '#ff4d4f' : diff < 0 ? '#52c41a' : '#8c8c8c' }}>
                                {diff > 0 ? `+${diff}` : diff}
                              </Text>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <Text type="secondary">Không có vật tư</Text>
                </div>
              )}
            </Card>

            {/* Hành động */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Hành động</Text>
            </div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}>
              <Form.Item name="action" style={{ marginBottom: 0 }}>
                <Select options={[
                  { value: 'update', label: 'Tiếp tục sản xuất' },
                  ...(progressOrder.status === 'in_progress' ? [{ value: 'pause', label: 'Tạm dừng lệnh' }] : []),
                  ...(progressOrder.status === 'paused' ? [{ value: 'resume', label: 'Tiếp tục (bỏ tạm dừng)' }] : []),
                  { value: 'complete', label: 'Hoàn thành lệnh sản xuất' },
                ]} />
              </Form.Item>
            </Card>

            {/* Ghi chú */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Ghi chú</Text>
            </div>
            <Card size="small" style={{ borderRadius: 10, border: '1px solid #e8e8e8', background: '#fff' }}>
              <Form.Item name="note" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={2} placeholder="Ghi chú về tiến độ, vấn đề phát sinh..." />
              </Form.Item>
            </Card>
          </Form>
        </Drawer>
      )}
    </div>
  );
};

export default ProductionOrderPage;
