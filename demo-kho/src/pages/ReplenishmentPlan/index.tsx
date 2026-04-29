import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography,
  Dropdown, App, Drawer, Form, InputNumber, DatePicker, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, PlusOutlined, CalendarOutlined, MoreOutlined,
  EyeOutlined, DeleteOutlined, CloseOutlined, ScheduleOutlined,
  AimOutlined, ArrowRightOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, FileTextOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { replenishments as replenishmentsSource } from '../../data/replenishments';
import { products } from '../../data/products';
import { warehouses } from '../../data/warehouses';
import type { Replenishment, ReplenishmentStatus } from '../../types';
import { replenishmentStatusConfig, formatDate, formatNumber } from '../../utils/format';
import { expandedRowRender } from '../Replenishment/ExpandedRow';

const { Title, Text } = Typography;
const formatValue = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)} tỷ` : `${v} tr`;

interface PlanTimelineItem {
  id: string; code: string; warehouseName: string; period: string;
  neededByDate: string; orderByDate: string;
  status: 'overdue' | 'urgent' | 'on_track';
  productName: string; leadTimeDays: number;
}

const ReplenishmentPlanInner: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [repList, setRepList] = useState<Replenishment[]>([...replenishmentsSource]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReplenishmentStatus | undefined>();

  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [planForm] = Form.useForm();

  const [leadTimeDrawerOpen, setLeadTimeDrawerOpen] = useState(false);
  const [leadTimeForm] = Form.useForm();
  const [ltLeadPurchase, setLtLeadPurchase] = useState(0);
  const [ltLeadProduce, setLtLeadProduce] = useState(0);
  const [ltLeadTransport, setLtLeadTransport] = useState(0);
  const [ltLeadBuffer, setLtLeadBuffer] = useState(3);
  const [ltNeededDate, setLtNeededDate] = useState<Dayjs | null>(null);

  const ltTotalDays = ltLeadPurchase + ltLeadProduce + ltLeadTransport + ltLeadBuffer;
  const ltOrderDate: Dayjs | null = ltNeededDate ? ltNeededDate.subtract(ltTotalDays, 'day') : null;
  const ltOrderDateStatus: 'overdue' | 'urgent' | 'ok' | null = ltOrderDate
    ? ltOrderDate.isBefore(dayjs(), 'day') ? 'overdue'
      : ltOrderDate.diff(dayjs(), 'day') <= 7 ? 'urgent' : 'ok'
    : null;

  const syncAndSet = (updater: (prev: Replenishment[]) => Replenishment[]) => {
    setRepList(prev => {
      const next = updater(prev);
      replenishmentsSource.splice(0, replenishmentsSource.length, ...next);
      return next;
    });
  };

  const baseData = useMemo(() => repList.filter(r => !!r.period), [repList]);

  const filteredData = useMemo(() => baseData.filter(r => {
    const matchSearch = !searchText
      || r.code.toLowerCase().includes(searchText.toLowerCase())
      || r.warehouseName.toLowerCase().includes(searchText.toLowerCase())
      || (r.note || '').toLowerCase().includes(searchText.toLowerCase());
    return matchSearch && (!filterStatus || r.status === filterStatus);
  }), [baseData, searchText, filterStatus]);

  const planMonitorData = useMemo(() => {
    const today = dayjs();
    let overdue = 0, urgent = 0, onTrack = 0;
    const timeline: PlanTimelineItem[] = [];
    for (const r of baseData) {
      for (const l of r.lines) {
        if (!l.orderByDate) continue;
        const orderDate = dayjs(l.orderByDate);
        const diff = orderDate.diff(today, 'day');
        const st: PlanTimelineItem['status'] = orderDate.isBefore(today, 'day') ? 'overdue' : diff <= 7 ? 'urgent' : 'on_track';
        if (st === 'overdue') overdue++;
        else if (st === 'urgent') urgent++;
        else onTrack++;
        timeline.push({
          id: `${r.id}-${l.id}`, code: r.code, warehouseName: r.warehouseName,
          period: r.period || '', neededByDate: l.neededByDate, orderByDate: l.orderByDate,
          status: st, productName: l.productName, leadTimeDays: l.leadTimeDays,
        });
      }
    }
    timeline.sort((a, b) => ({ overdue: 0, urgent: 1, on_track: 2 }[a.status] - { overdue: 0, urgent: 1, on_track: 2 }[b.status]));
    return { total: baseData.length, overdue, urgent, onTrack, timeline };
  }, [baseData]);

  const closeLtDrawer = () => {
    setLeadTimeDrawerOpen(false);
    leadTimeForm.resetFields();
    setLtNeededDate(null);
    setLtLeadPurchase(0); setLtLeadProduce(0); setLtLeadTransport(0); setLtLeadBuffer(3);
  };

  const handlePlanSubmit = () => {
    planForm.validateFields().then(values => {
      const product = products.find(p => p.id === values.productId);
      const warehouse = warehouses.find(w => w.id === values.warehouseId);
      if (!product || !warehouse) return;
      const period = values.period as { format: (f: string) => string };
      const newRep: Replenishment = {
        id: `rp-plan-${Date.now()}`,
        code: `KH-2026-${String(repList.length + 1).padStart(3, '0')}`,
        source: 'forecast', status: 'draft',
        warehouseId: warehouse.id, warehouseName: warehouse.name,
        period: period.format('YYYY-[Q]Q'),
        lines: [{
          id: `rp-plan-${Date.now()}-l1`,
          productId: product.id, productCode: product.code, productName: product.name,
          currentStock: 0, minStock: product.minStock, maxStock: product.maxStock,
          forecastDemand: values.qty, suggestedQty: values.qty, unit: product.baseUnit,
          action: 'purchase', leadTimeDays: product.leadTimeDays,
          neededByDate: '', orderByDate: '',
        }],
        totalItems: 1, totalValue: 0,
        note: values.note || '', createdAt: new Date().toISOString(),
      };
      syncAndSet(prev => [newRep, ...prev]);
      message.success('Đã tạo kế hoạch bổ sung vật tư');
      setPlanDrawerOpen(false);
      planForm.resetFields();
    });
  };

  const handleLeadTimePlanSubmit = () => {
    leadTimeForm.validateFields().then(values => {
      const product = products.find(p => p.id === values.productId);
      const warehouse = warehouses.find(w => w.id === values.warehouseId);
      if (!product || !warehouse || !ltNeededDate || !ltOrderDate) return;
      const q = Math.ceil((ltNeededDate.month() + 1) / 3);
      const newRep: Replenishment = {
        id: `rp-lt-${Date.now()}`,
        code: `KH-2026-${String(repList.length + 1).padStart(3, '0')}`,
        source: 'forecast', status: 'draft',
        warehouseId: warehouse.id, warehouseName: warehouse.name,
        period: `Q${q}-${ltNeededDate.year()}`,
        lines: [{
          id: `rp-lt-${Date.now()}-l1`,
          productId: product.id, productCode: product.code, productName: product.name,
          currentStock: 0, minStock: product.minStock, maxStock: product.maxStock,
          forecastDemand: values.qty, suggestedQty: values.qty, unit: product.baseUnit,
          action: values.action || 'purchase', leadTimeDays: ltTotalDays,
          neededByDate: ltNeededDate.format('YYYY-MM-DD'),
          orderByDate: ltOrderDate.format('YYYY-MM-DD'),
        }],
        totalItems: 1, totalValue: 0,
        note: `TGCU ${ltTotalDays}N [Mua:${ltLeadPurchase}N SX:${ltLeadProduce}N VCh:${ltLeadTransport}N DP:${ltLeadBuffer}N]${values.note ? '. ' + values.note : ''}`,
        createdAt: dayjs().toISOString(),
      };
      syncAndSet(prev => [newRep, ...prev]);
      message.success(`Đã tạo ${newRep.code} — cần đặt hàng trước ${ltOrderDate.format('DD/MM/YYYY')}`);
      closeLtDrawer();
    });
  };

  const hasActiveFilters = searchText || filterStatus;
  const handleResetFilters = () => {
    setSearchText('');
    setFilterStatus(undefined);
  };

  const columns: ColumnsType<Replenishment> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 140,
      render: (c: string) => <Text style={{ color: '#08979c', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{c}</Text>,
    },
    {
      title: 'Kho', dataIndex: 'warehouseName', key: 'wh', width: 180, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: 'Kỳ kế hoạch', dataIndex: 'period', key: 'period', width: 120,
      render: (p: string) => p ? <Tag color="#08979c" style={{ borderRadius: 4, fontSize: 12 }}>{p}</Tag> : <Text type="secondary">--</Text>,
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
      render: (v: number) => <Text style={{ fontWeight: 600, color: '#08979c', fontSize: 13 }}>{formatValue(v)}</Text>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'date', width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 60, align: 'center',
      render: (_: unknown, record: Replenishment) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/replenishment/${record.id}`) },
          { type: 'divider' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => {
            syncAndSet(prev => prev.filter(r => r.id !== record.id));
            message.success(`Đã xóa ${record.code}`);
          }},
        ] }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #006d75, #08979c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Lập kế hoạch Bổ sung</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Kế hoạch bổ sung theo kỳ và theo thời gian cung ứng ngược</Text>
          </div>
        </Space>
        <Space>
          <Button icon={<CalendarOutlined />} onClick={() => setPlanDrawerOpen(true)} style={{ borderRadius: 8 }}>
            Kế hoạch theo kỳ
          </Button>
          <Button type="primary" icon={<ScheduleOutlined />} onClick={() => setLeadTimeDrawerOpen(true)}
            style={{ background: '#08979c', borderColor: '#08979c', borderRadius: 8, fontWeight: 500 }}>
            Kế hoạch theo TGCU
          </Button>
        </Space>
      </div>

      {/* ─── Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          {
            label: 'Tổng kế hoạch', value: planMonitorData.total, suffix: 'kế hoạch',
            gradient: 'linear-gradient(135deg, #006d75, #08979c)',
            icon: <FileTextOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đã trễ hạn đặt hàng', value: planMonitorData.overdue, suffix: 'dòng',
            gradient: 'linear-gradient(135deg, #a8071a, #ff4d4f)',
            icon: <WarningOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Cần đặt trong 7 ngày', value: planMonitorData.urgent, suffix: 'dòng',
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
            icon: <ClockCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đúng tiến độ', value: planMonitorData.onTrack, suffix: 'dòng',
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

      {/* ─── Plan monitoring panel */}
      {planMonitorData.timeline.length > 0 && (
        <Card
          style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
          styles={{ body: { padding: '20px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #006d75, #08979c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockCircleOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Giám sát thời điểm đặt hàng</Text>
              <div style={{ fontSize: 12, color: '#999' }}>Theo dõi kế hoạch theo thời gian cung ứng</div>
            </div>
          </div>
          <Table<PlanTimelineItem>
            dataSource={planMonitorData.timeline} rowKey="id" size="small" bordered pagination={false}
            columns={[
              { title: 'Vật tư', dataIndex: 'productName', key: 'p', width: 200, ellipsis: true, render: (n: string) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{n}</Text> },
              {
                title: 'Kế hoạch', dataIndex: 'code', key: 'c', width: 150,
                render: (code: string, r: PlanTimelineItem) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C', fontFamily: 'monospace' }}>{code}</Text>
                    <Tag color="#08979c" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>{r.period}</Tag>
                  </Space>
                ),
              },
              { title: 'Kho', dataIndex: 'warehouseName', key: 'wh', width: 150, ellipsis: true, render: (n: string) => <Text style={{ fontSize: 12 }}>{n}</Text> },
              { title: 'Ngày cần', dataIndex: 'neededByDate', key: 'nd', width: 110, render: (d: string) => d ? <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text> : <Text type="secondary">--</Text> },
              {
                title: 'Hạn đặt hàng', dataIndex: 'orderByDate', key: 'od', width: 120,
                render: (d: string, r: PlanTimelineItem) => {
                  const color = r.status === 'overdue' ? '#ff4d4f' : r.status === 'urgent' ? '#faad14' : '#52c41a';
                  return d ? <Text style={{ fontSize: 13, fontWeight: 700, color }}>{formatDate(d)}</Text> : <Text type="secondary">--</Text>;
                },
              },
              { title: 'TGCU', dataIndex: 'leadTimeDays', key: 'lt', width: 80, align: 'center' as const, render: (v: number) => <Text style={{ fontSize: 12 }}>{v} ngày</Text> },
              {
                title: 'Trạng thái', dataIndex: 'status', key: 'st', width: 140, align: 'center' as const,
                render: (st: string) => {
                  if (st === 'overdue') return <Tag color="error" style={{ borderRadius: 4, fontSize: 11 }}>Đã trễ hạn</Tag>;
                  if (st === 'urgent') return <Tag color="warning" style={{ borderRadius: 4, fontSize: 11 }}>Cần xử lý ngay</Tag>;
                  return <Tag color="success" style={{ borderRadius: 4, fontSize: 11 }}>Đúng tiến độ</Tag>;
                },
              },
            ] as ColumnsType<PlanTimelineItem>}
          />
        </Card>
      )}

      {/* ─── Filter Bar */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo mã kế hoạch, kho..."
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
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} kế hoạch`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* ─── Kỳ Drawer */}
      <Drawer open={planDrawerOpen} onClose={() => { setPlanDrawerOpen(false); planForm.resetFields(); }}
        closable={false} title={null} width={520} styles={{ body: { padding: 0 } }}>
        <div style={{ background: 'linear-gradient(135deg, #006d75, #08979c)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Lập kế hoạch bổ sung theo kỳ</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Tháng / Quý</div>
          </div>
          <Button type="text" icon={<CloseOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />}
            onClick={() => { setPlanDrawerOpen(false); planForm.resetFields(); }} style={{ padding: 4 }} />
        </div>
        <div style={{ padding: '24px' }}>
          <Form form={planForm} layout="vertical">
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="period" label="Kỳ kế hoạch" rules={[{ required: true, message: 'Chọn kỳ' }]}>
                  <DatePicker picker="quarter" style={{ width: '100%', borderRadius: 6 }} placeholder="Chọn quý" format="[Q]Q-YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="warehouseId" label="Kho" rules={[{ required: true, message: 'Chọn kho' }]}>
                  <Select placeholder="Chọn kho" options={warehouses.map(w => ({ value: w.id, label: w.name }))} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="productId" label="Vật tư" rules={[{ required: true, message: 'Chọn vật tư' }]}>
              <Select showSearch placeholder="Tìm và chọn vật tư..." optionFilterProp="label"
                options={products.map(p => ({ value: p.id, label: `${p.code} — ${p.name}` }))} />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="qty" label="Số lượng kế hoạch" rules={[{ required: true, message: 'Nhập SL' }]}>
                  <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="action" label="Phương thức" initialValue="purchase">
                  <Select options={[{ value: 'purchase', label: 'Mua sắm' }, { value: 'produce', label: 'Sản xuất' }, { value: 'transfer', label: 'Điều chuyển' }]} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Ghi chú kế hoạch..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Form>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setPlanDrawerOpen(false); planForm.resetFields(); }} style={{ flex: 1, borderRadius: 8, height: 40 }}>Hủy</Button>
            <Button type="primary" onClick={handlePlanSubmit} style={{ flex: 2, borderRadius: 8, height: 40, background: '#08979c', borderColor: '#08979c', fontWeight: 600 }}>Tạo kế hoạch</Button>
          </div>
        </div>
      </Drawer>

      {/* ─── TGCU Drawer */}
      <Drawer open={leadTimeDrawerOpen} onClose={closeLtDrawer}
        closable={false} title={null} width={560} styles={{ body: { padding: 0 } }}>
        <div style={{ background: 'linear-gradient(135deg, #005a6e, #08979c)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClockCircleOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Lập kế hoạch theo thời gian cung ứng</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Tính ngược từ ngày cần để xác định thời điểm đặt hàng</div>
          </div>
          <Button type="text" icon={<CloseOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />} onClick={closeLtDrawer} style={{ padding: 4 }} />
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
          <Form form={leadTimeForm} layout="vertical" size="middle">

            {/* Bước 1 */}
            <div style={{ background: '#f0f4fa', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1B3A5C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: '#1B3A5C', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
                Xác định nhu cầu vật tư
              </div>
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item name="productId" label="Vật tư" rules={[{ required: true, message: 'Chọn vật tư' }]} style={{ marginBottom: 8 }}>
                    <Select showSearch placeholder="Tìm và chọn vật tư..." optionFilterProp="label"
                      options={products.map(p => ({ value: p.id, label: `${p.code} — ${p.name}` }))}
                      onChange={(id: string) => {
                        const p = products.find(pp => pp.id === id);
                        if (!p) return;
                        const transport = p.leadTimeTransport ?? 5;
                        const produce = p.leadTimeProduction ?? 0;
                        setLtLeadTransport(transport);
                        setLtLeadProduce(produce);
                        setLtLeadPurchase(Math.max(0, p.leadTimeDays - produce - transport));
                        setLtLeadBuffer(3);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="warehouseId" label="Kho nhận" rules={[{ required: true, message: 'Chọn kho' }]} style={{ marginBottom: 8 }}>
                    <Select placeholder="Chọn kho" options={warehouses.map(w => ({ value: w.id, label: w.name }))} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="qty" label="Số lượng cần" rules={[{ required: true, message: 'Nhập SL' }]} style={{ marginBottom: 0 }}>
                    <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="action" label="Phương thức" initialValue="purchase" style={{ marginBottom: 0 }}>
                    <Select options={[{ value: 'purchase', label: 'Mua sắm' }, { value: 'produce', label: 'Sản xuất' }, { value: 'transfer', label: 'Điều chuyển' }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="neededByDate" label="Ngày cần sử dụng" rules={[{ required: true, message: 'Chọn ngày' }]} style={{ marginBottom: 0 }}>
                    <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY"
                      disabledDate={d => d.isBefore(dayjs(), 'day')}
                      onChange={d => setLtNeededDate(d)} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Bước 2 */}
            <div style={{ background: '#f5f7fa', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1B3A5C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: '#1B3A5C', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</div>
                Thông tin thời gian cung ứng
              </div>
              <Row gutter={[12, 8]}>
                {([
                  { label: 'Thời gian mua hàng', color: '#1B3A5C', val: ltLeadPurchase, set: setLtLeadPurchase },
                  { label: 'Thời gian sản xuất', color: '#531dab', val: ltLeadProduce, set: setLtLeadProduce },
                  { label: 'Thời gian vận chuyển', color: '#08979c', val: ltLeadTransport, set: setLtLeadTransport },
                  { label: 'Thời gian dự phòng', color: '#d48806', val: ltLeadBuffer, set: setLtLeadBuffer },
                ] as { label: string; color: string; val: number; set: (v: number) => void }[]).map((f, i) => (
                  <Col span={12} key={i}>
                    <div>
                      <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: f.color, marginRight: 6 }} />
                        {f.label} (ngày)
                      </div>
                      <InputNumber min={0} value={f.val} onChange={v => f.set(v ?? 0)} style={{ width: '100%', borderRadius: 6 }} addonAfter="ngày" />
                    </div>
                  </Col>
                ))}
              </Row>
              {ltTotalDays > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                    Tổng thời gian cung ứng: <span style={{ fontWeight: 700, color: '#1B3A5C' }}>{ltTotalDays} ngày</span>
                  </div>
                  <div style={{ display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                    {([
                      { label: 'Mua hàng', days: ltLeadPurchase, color: '#1B3A5C' },
                      { label: 'Sản xuất', days: ltLeadProduce, color: '#531dab' },
                      { label: 'Vận chuyển', days: ltLeadTransport, color: '#08979c' },
                      { label: 'Dự phòng', days: ltLeadBuffer, color: '#d48806' },
                    ] as { label: string; days: number; color: string }[]).filter(s => s.days > 0).map((seg, i) => (
                      <Tooltip key={i} title={`${seg.label}: ${seg.days} ngày`}>
                        <div style={{ flex: seg.days, background: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600, minWidth: 24, cursor: 'default' }}>
                          {seg.days}N
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                    {([
                      { label: 'Mua hàng', days: ltLeadPurchase, color: '#1B3A5C' },
                      { label: 'Sản xuất', days: ltLeadProduce, color: '#531dab' },
                      { label: 'Vận chuyển', days: ltLeadTransport, color: '#08979c' },
                      { label: 'Dự phòng', days: ltLeadBuffer, color: '#d48806' },
                    ] as { label: string; days: number; color: string }[]).filter(s => s.days > 0).map((seg, i) => (
                      <span key={i} style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, display: 'inline-block' }} />
                        {seg.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bước 3 */}
            {ltNeededDate && ltTotalDays > 0 && (
              <div style={{
                background: ltOrderDateStatus === 'overdue' ? '#fff1f0' : ltOrderDateStatus === 'urgent' ? '#fffbe6' : '#f6ffed',
                border: `1px solid ${ltOrderDateStatus === 'overdue' ? '#ffccc7' : ltOrderDateStatus === 'urgent' ? '#ffe58f' : '#b7eb8f'}`,
                borderRadius: 10, padding: '14px 16px', marginBottom: 16,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1B3A5C', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: '#1B3A5C', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
                  Kết quả tính toán thời điểm đặt hàng
                </div>
                <Row gutter={12} align="middle">
                  <Col span={11}>
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Ngày cần sử dụng</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3A5C' }}>{ltNeededDate.format('DD/MM/YYYY')}</div>
                    </div>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    <ArrowRightOutlined style={{ color: '#999', fontSize: 16 }} />
                  </Col>
                  <Col span={11}>
                    <div style={{
                      textAlign: 'center', padding: '10px 12px', borderRadius: 8,
                      background: ltOrderDateStatus === 'overdue' ? '#ff4d4f' : ltOrderDateStatus === 'urgent' ? '#faad14' : '#52c41a',
                    }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>Cần đặt hàng/SX trước</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{ltOrderDate?.format('DD/MM/YYYY')}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        {ltOrderDateStatus === 'overdue' ? 'Đã trễ — cần xử lý ngay' : `Còn ${ltOrderDate?.diff(dayjs(), 'day')} ngày`}
                      </div>
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: 10, fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AimOutlined style={{ color: '#1B3A5C' }} />
                  Tính ngược: {ltNeededDate.format('DD/MM/YYYY')} − {ltTotalDays} ngày = {ltOrderDate?.format('DD/MM/YYYY')}
                </div>
              </div>
            )}

            <Form.Item name="note" label="Ghi chú" style={{ marginBottom: 16 }}>
              <Input.TextArea rows={2} placeholder="Ghi chú thêm về kế hoạch..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Form>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={closeLtDrawer} style={{ flex: 1, borderRadius: 8, height: 40 }}>Hủy</Button>
            <Button type="primary" onClick={handleLeadTimePlanSubmit} disabled={!ltNeededDate || ltTotalDays === 0}
              style={{ flex: 2, borderRadius: 8, height: 40, background: '#08979c', borderColor: '#08979c', fontWeight: 600 }}>
              Tạo kế hoạch bổ sung
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

const ReplenishmentPlan: React.FC = () => (
  <App>
    <ReplenishmentPlanInner />
  </App>
);

export default ReplenishmentPlan;
