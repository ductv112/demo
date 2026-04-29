import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography,
  Dropdown, App, Alert, Divider, Modal, InputNumber, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, PlusOutlined, FundOutlined, MoreOutlined,
  EyeOutlined, DeleteOutlined, ExclamationCircleOutlined,
  SyncOutlined, SettingOutlined, CheckCircleOutlined, DatabaseOutlined,
  ThunderboltOutlined, WarningOutlined, FileTextOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { replenishments as replenishmentsSource } from '../../data/replenishments';
import { inventoryItems } from '../../data/inventory';
import { products } from '../../data/products';
import { warehouses } from '../../data/warehouses';
import type { Replenishment, ReplenishmentStatus } from '../../types';
import { replenishmentStatusConfig, formatDate, formatNumber } from '../../utils/format';
import { expandedRowRender } from '../Replenishment/ExpandedRow';

const { Title, Text } = Typography;

const formatValue = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)} tỷ` : `${v} tr`;

interface ForecastAlert {
  key: string;
  productId: string; productCode: string; productName: string; unit: string;
  warehouseId: string; warehouseName: string;
  onHand: number; incoming: number; outgoing: number;
  forecastStock: number; minStock: number; shortage: number; suggestedQty: number;
  leadTimeDays: number; hasProposal: boolean;
}

const ReplenishmentForecastInner: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [repList, setRepList] = useState<Replenishment[]>([...replenishmentsSource]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReplenishmentStatus | undefined>();
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('14/04/2026 08:30');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [forecastConfigOpen, setForecastConfigOpen] = useState(false);
  const [forecastDays, setForecastDays] = useState(90);

  const syncAndSet = (updater: (prev: Replenishment[]) => Replenishment[]) => {
    setRepList(prev => {
      const next = updater(prev);
      replenishmentsSource.splice(0, replenishmentsSource.length, ...next);
      return next;
    });
  };

  const baseData = useMemo(() => repList.filter(r => r.source === 'forecast'), [repList]);

  const filteredData = useMemo(() => baseData.filter(r => {
    const matchSearch = !searchText
      || r.code.toLowerCase().includes(searchText.toLowerCase())
      || r.warehouseName.toLowerCase().includes(searchText.toLowerCase())
      || (r.note || '').toLowerCase().includes(searchText.toLowerCase());
    return matchSearch && (!filterStatus || r.status === filterStatus);
  }), [baseData, searchText, filterStatus]);

  const stats = useMemo(() => ({
    total:     baseData.length,
    submitted: baseData.filter(r => r.status === 'submitted').length,
    approved:  baseData.filter(r => r.status === 'approved').length,
    done:      baseData.filter(r => r.status === 'done').length,
  }), [baseData]);

  const forecastAlerts = useMemo((): ForecastAlert[] => {
    const results: ForecastAlert[] = [];
    for (const product of products) {
      for (const wh of warehouses) {
        const whItems = inventoryItems.filter(i => i.productId === product.id && i.warehouseId === wh.code);
        if (!whItems.length) continue;
        const onHand    = whItems.reduce((s, i) => s + i.qtyOnHand, 0);
        const incoming  = whItems.reduce((s, i) => s + i.qtyIncoming, 0);
        const outgoing  = whItems.reduce((s, i) => s + i.qtyOutgoing, 0);
        const forecastStock = onHand + incoming - outgoing;
        if (forecastStock > product.minStock) continue;
        const hasProposal = repList.some(r =>
          r.source === 'forecast' && r.warehouseId === wh.id &&
          r.lines.some(l => l.productId === product.id)
        );
        results.push({
          key: `${product.id}-${wh.id}`,
          productId: product.id, productCode: product.code,
          productName: product.name, unit: product.baseUnit,
          warehouseId: wh.id, warehouseName: wh.name,
          onHand, incoming, outgoing, forecastStock,
          minStock: product.minStock, shortage: product.minStock - forecastStock,
          suggestedQty: Math.max(0, product.maxStock - forecastStock),
          leadTimeDays: product.leadTimeDays, hasProposal,
        });
      }
    }
    return results;
  }, [repList]);

  const handleCreateForecastProposal = (alert: ForecastAlert) => {
    const product = products.find(p => p.id === alert.productId);
    if (!product) return;
    const newCode = `DB-2026-${String(repList.length + 1).padStart(3, '0')}`;
    const newRep: Replenishment = {
      id: `rp-forecast-${Date.now()}`,
      code: newCode,
      source: 'forecast', status: 'submitted',
      warehouseId: alert.warehouseId, warehouseName: alert.warehouseName,
      lines: [{
        id: `rp-forecast-${Date.now()}-l1`,
        productId: product.id, productCode: product.code, productName: product.name,
        currentStock: alert.onHand, minStock: alert.minStock, maxStock: product.maxStock,
        forecastDemand: alert.shortage, suggestedQty: alert.suggestedQty, unit: alert.unit,
        action: product.code.startsWith('CK-') ? 'produce' : 'purchase',
        leadTimeDays: alert.leadTimeDays, neededByDate: '', orderByDate: '',
      }],
      totalItems: 1, totalValue: 0,
      note: `Dự báo: tồn ${alert.forecastStock} ${alert.unit} ≤ tối thiểu ${alert.minStock} ${alert.unit}`,
      createdAt: new Date().toISOString(),
    };
    syncAndSet(prev => [newRep, ...prev]);
    message.success(`Đã tạo đề xuất ${newCode} cho ${alert.productName}`);
  };

  const handleCreateSelectedProposals = () => {
    const toCreate = forecastAlerts.filter(a => selectedAlerts.includes(a.key) && !a.hasProposal);
    if (!toCreate.length) { message.warning('Không có vật tư nào cần tạo đề xuất'); return; }
    toCreate.forEach(a => handleCreateForecastProposal(a));
    setSelectedAlerts([]);
    message.success(`Đã tạo ${toCreate.length} đề xuất bổ sung`);
  };

  const handleScan = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 1200));
    setScanning(false);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setLastScanned(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`);
    message.success(`Quét hoàn tất — phát hiện ${forecastAlerts.filter(a => !a.hasProposal).length} vật tư cần bổ sung`);
  };

  const hasActiveFilters = searchText || filterStatus;
  const handleResetFilters = () => {
    setSearchText('');
    setFilterStatus(undefined);
  };

  const columns: ColumnsType<Replenishment> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 140,
      render: (c: string) => <Text style={{ color: '#531dab', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{c}</Text>,
    },
    {
      title: 'Kho', dataIndex: 'warehouseName', key: 'wh', width: 200, ellipsis: true,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
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
      render: (v: number) => <Text style={{ fontWeight: 600, color: '#531dab', fontSize: 13 }}>{formatValue(v)}</Text>,
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
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #531dab, #722ed1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FundOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Dự báo & Giám sát</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Theo dõi tồn kho dự báo, phát hiện nguy cơ thiếu hụt tự động</Text>
          </div>
        </Space>
        <Button icon={<SettingOutlined />} onClick={() => setForecastConfigOpen(true)} style={{ borderRadius: 8 }}>
          Cấu hình dự báo
        </Button>
      </div>

      {/* ─── Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          {
            label: 'Tổng đề xuất', value: stats.total, suffix: 'đề xuất',
            gradient: 'linear-gradient(135deg, #531dab, #722ed1)',
            icon: <FileTextOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Chờ phê duyệt', value: stats.submitted, suffix: 'đề xuất',
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
            icon: <ClockCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đã phê duyệt', value: stats.approved, suffix: 'đề xuất',
            gradient: 'linear-gradient(135deg, #237804, #52c41a)',
            icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Nguy cơ thiếu hụt', value: forecastAlerts.filter(a => !a.hasProposal).length, suffix: 'vật tư',
            gradient: 'linear-gradient(135deg, #a8071a, #ff4d4f)',
            icon: <WarningOutlined style={{ fontSize: 64 }} />,
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

      {/* ─── Forecast Monitoring Panel */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '20px' } }}
      >
        {/* Scan bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space size={16} align="center">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #531dab, #722ed1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DatabaseOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Giám sát tồn kho dự báo</Text>
              <div style={{ fontSize: 12, color: '#999' }}>Lần quét cuối: {lastScanned}</div>
            </div>
          </Space>
          <Space>
            {selectedAlerts.length > 0 && (
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleCreateSelectedProposals}
                style={{ background: '#531dab', borderColor: '#531dab', borderRadius: 8, fontWeight: 600 }}>
                Tạo {selectedAlerts.length} đề xuất đã chọn
              </Button>
            )}
            <Button icon={<SyncOutlined spin={scanning} />} loading={scanning} onClick={handleScan} style={{ borderRadius: 8 }}>
              Quét tự động
            </Button>
          </Space>
        </div>

        {/* At-risk table or safe alert */}
        {forecastAlerts.length > 0 ? (
          <Table<ForecastAlert>
            rowSelection={{
              selectedRowKeys: selectedAlerts,
              onChange: keys => setSelectedAlerts(keys as string[]),
              getCheckboxProps: r => ({ disabled: r.hasProposal }),
            }}
            columns={[
              {
                title: 'Vật tư', key: 'product', width: 220,
                render: (_: unknown, r: ForecastAlert) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13, fontWeight: 600 }}>{r.productName}</Text>
                    <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#531dab' }}>{r.productCode}</Text>
                  </Space>
                ),
              },
              { title: 'Kho', dataIndex: 'warehouseName', key: 'wh', width: 150, ellipsis: true, render: (n: string) => <Text style={{ fontSize: 12 }}>{n}</Text> },
              {
                title: 'Tồn hiện có', dataIndex: 'onHand', key: 'onHand', width: 100, align: 'right' as const,
                render: (v: number, r: ForecastAlert) => <Text style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>{formatNumber(v)} {r.unit}</Text>,
              },
              {
                title: () => <Tooltip title="Tồn hiện có + Sắp nhập − Sắp xuất"><span>Tồn dự báo <WarningOutlined style={{ fontSize: 10, color: '#faad14' }} /></span></Tooltip>,
                key: 'forecast', width: 150, align: 'center' as const,
                render: (_: unknown, r: ForecastAlert) => (
                  <Space direction="vertical" size={0} align="center">
                    <Tag color="error" style={{ borderRadius: 4, fontSize: 12, fontWeight: 700, margin: 0 }}>{formatNumber(r.forecastStock)} {r.unit}</Tag>
                    <Text style={{ fontSize: 10, color: '#999' }}>{formatNumber(r.onHand)}+{formatNumber(r.incoming)}−{formatNumber(r.outgoing)}</Text>
                  </Space>
                ),
              },
              { title: 'Tối thiểu', dataIndex: 'minStock', key: 'min', width: 80, align: 'right' as const, render: (v: number, r: ForecastAlert) => <Text style={{ fontSize: 13 }}>{formatNumber(v)} {r.unit}</Text> },
              { title: 'Thiếu hụt', dataIndex: 'shortage', key: 'shortage', width: 90, align: 'right' as const, render: (v: number, r: ForecastAlert) => <Text style={{ fontSize: 13, fontWeight: 700, color: '#ff4d4f' }}>+{formatNumber(v)} {r.unit}</Text> },
              { title: 'SL đề xuất', dataIndex: 'suggestedQty', key: 'suggested', width: 100, align: 'right' as const, render: (v: number, r: ForecastAlert) => <Text style={{ fontSize: 13, fontWeight: 700, color: '#1B3A5C' }}>{formatNumber(v)} {r.unit}</Text> },
              { title: 'TG cung ứng', dataIndex: 'leadTimeDays', key: 'lead', width: 90, align: 'center' as const, render: (v: number) => <Text style={{ fontSize: 12 }}>{v} ngày</Text> },
              {
                title: 'Trạng thái', key: 'pst', width: 130, align: 'center' as const,
                render: (_: unknown, r: ForecastAlert) => r.hasProposal
                  ? <Tag color="blue" style={{ borderRadius: 4, fontSize: 11 }}>Đã có đề xuất</Tag>
                  : <Tag color="warning" style={{ borderRadius: 4, fontSize: 11 }}>Chưa xử lý</Tag>,
              },
              {
                title: 'Thao tác', key: 'act', width: 120, align: 'center' as const,
                render: (_: unknown, r: ForecastAlert) => r.hasProposal
                  ? <Button size="small" type="link" icon={<EyeOutlined />} style={{ fontSize: 12 }}>Xem đề xuất</Button>
                  : <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => handleCreateForecastProposal(r)}
                      style={{ background: '#531dab', borderColor: '#531dab', borderRadius: 6, fontSize: 12 }}>Tạo đề xuất</Button>,
              },
            ] as ColumnsType<ForecastAlert>}
            dataSource={forecastAlerts}
            rowKey="key"
            size="small"
            bordered
            pagination={false}
            scroll={{ x: 1100 }}
            rowClassName={r => r.hasProposal ? '' : 'forecast-alert-row'}
          />
        ) : (
          <Alert
            message={<span style={{ fontSize: 13, fontWeight: 600 }}>Tất cả vật tư đang ở mức tồn kho an toàn</span>}
            description={<span style={{ fontSize: 12 }}>Hệ thống không phát hiện vật tư nào có tồn kho dự báo dưới mức tối thiểu. Nhấn 'Quét tự động' để kiểm tra lại.</span>}
            type="success" showIcon icon={<CheckCircleOutlined style={{ fontSize: 14 }} />}
            style={{ borderRadius: 8, padding: '8px 12px' }}
          />
        )}
      </Card>

      {/* ─── Filter Bar */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: 'none' }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo mã đề xuất, kho..."
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

      {/* ─── Proposals Table */}
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
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} đề xuất`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* ─── Forecast Config Modal */}
      <Modal
        open={forecastConfigOpen} onCancel={() => setForecastConfigOpen(false)}
        title={<Space><SettingOutlined style={{ color: '#1B3A5C' }} /><span style={{ color: '#1B3A5C', fontWeight: 700 }}>Cấu hình tham số dự báo</span></Space>}
        footer={<Space>
          <Button onClick={() => setForecastConfigOpen(false)}>Đóng</Button>
          <Button type="primary" onClick={() => { message.success('Đã lưu cấu hình dự báo'); setForecastConfigOpen(false); }} style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}>Lưu cấu hình</Button>
        </Space>}
        width={480} styles={{ body: { padding: '20px 24px' } }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <div>
            <Text style={{ fontWeight: 600, color: '#1B3A5C', display: 'block', marginBottom: 8 }}>Số ngày nhìn trước (horizon)</Text>
            <Row gutter={8} align="middle">
              <Col><InputNumber min={30} max={365} value={forecastDays} onChange={v => setForecastDays(v ?? 90)} style={{ width: 100, borderRadius: 6 }} addonAfter="ngày" /></Col>
              <Col>
                <Space size={4}>
                  {[30, 60, 90, 180].map(d => (
                    <Button key={d} size="small" type={forecastDays === d ? 'primary' : 'default'} onClick={() => setForecastDays(d)}
                      style={{ borderRadius: 6, ...(forecastDays === d ? { background: '#1B3A5C', borderColor: '#1B3A5C' } : {}) }}>
                      {d}N
                    </Button>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>
          <Divider style={{ margin: '4px 0' }} />
          <div>
            <Text style={{ fontWeight: 600, color: '#1B3A5C', display: 'block', marginBottom: 8 }}>Phương pháp dự báo</Text>
            <Select defaultValue="avg_3m" style={{ width: '100%' }} options={[
              { value: 'avg_3m', label: 'Trung bình động 3 tháng' },
              { value: 'avg_6m', label: 'Trung bình động 6 tháng' },
              { value: 'exponential', label: 'Làm mịn theo hàm mũ (ETS)' },
              { value: 'manual', label: 'Nhập thủ công' },
            ]} />
          </div>
          <div>
            <Text style={{ fontWeight: 600, color: '#1B3A5C', display: 'block', marginBottom: 8 }}>Ngưỡng cảnh báo tồn kho thấp</Text>
            <Row gutter={8} align="middle">
              <Col><InputNumber min={1} max={90} defaultValue={14} style={{ width: 80, borderRadius: 6 }} addonAfter="ngày" /></Col>
              <Col><Text type="secondary" style={{ fontSize: 12 }}>Cảnh báo khi tồn còn đủ dùng ít hơn N ngày</Text></Col>
            </Row>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

const ReplenishmentForecast: React.FC = () => (
  <App>
    <ReplenishmentForecastInner />
  </App>
);

export default ReplenishmentForecast;
