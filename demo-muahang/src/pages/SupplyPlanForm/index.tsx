import React, { useState, useMemo, useCallback } from 'react';
import {
  Card, Row, Col, Typography, Table, Space, Button, Form, Input,
  InputNumber, Select, DatePicker, message, Tag, Checkbox,
  Empty, Tooltip, Tabs,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, CalendarOutlined,
  PlusOutlined, SaveOutlined, SendOutlined,
  CheckCircleOutlined, ToolOutlined, DatabaseOutlined,
  DollarOutlined, HistoryOutlined, RiseOutlined, FallOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { supplyPlans } from '../../data/supplyPlans';
import { materialRequests } from '../../data/materialRequests';
import { getMaterialById } from '../../data/materials';
import { suppliers } from '../../data/suppliers';
import { priceHistories } from '../../data/suppliers';
import { formatDate, priorityConfig, materialRequestSourceConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { SupplySource, MaterialRequest } from '../../types';

const { Title, Text } = Typography;

const sourceOptions: { value: SupplySource; label: string }[] = [
  { value: 'purchase', label: 'Mua mới' },
  { value: 'transfer', label: 'Điều chuyển' },
];

interface AggregatedItem {
  key: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  unitPrice: number;
  totalNeed: number;
  inStock: number;
  toPurchase: number;
  toTransfer: number;
  estimatedCost: number;
  source: SupplySource;
  deadline: string;
  fromRequestIds: string[];
  selectedSupplierId?: string;
  selectedSupplierName?: string;
}

interface SupplierPriceRow {
  key: string;
  supplierId: string;
  supplierName: string;
  shortName: string;
  onTimeRate: number;
  qualityRate: number;
  rating: string;
  prices: Record<number, number>;
  latestPrice: number;
  latestYear: number;
  trend: number | null;
}

const SupplyPlanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEdit = !!id;
  const plan = isEdit ? supplyPlans.find(p => p.id === id) : null;

  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>(
    plan ? plan.materialRequestIds : []
  );
  const [step3ExpandedKey, setStep3ExpandedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('1');

  // Aggregated items
  const aggregatedItems = useMemo(() => {
    const selectedRequests = materialRequests.filter(r => selectedRequestIds.includes(r.id));
    const map = new Map<string, AggregatedItem>();

    selectedRequests.forEach(req => {
      req.items.forEach(item => {
        const existing = map.get(item.materialId);
        if (existing) {
          existing.totalNeed += item.quantity;
          if (!existing.fromRequestIds.includes(req.id)) {
            existing.fromRequestIds.push(req.id);
          }
        } else {
          const mat = getMaterialById(item.materialId);
          const stock = mat?.currentStock ?? 0;
          const price = mat?.unitPrice ?? 0;
          const purchase = Math.max(0, item.quantity - stock);
          map.set(item.materialId, {
            key: item.materialId,
            materialId: item.materialId,
            materialCode: item.materialCode,
            materialName: item.materialName,
            unit: item.unit,
            unitPrice: price,
            totalNeed: item.quantity,
            inStock: stock,
            toPurchase: purchase,
            toTransfer: 0,
            estimatedCost: purchase * price,
            source: 'purchase',
            deadline: '',
            fromRequestIds: [req.id],
          });
        }
      });
    });

    if (plan) {
      plan.items.forEach(saved => {
        const item = map.get(saved.materialId);
        if (item) {
          item.toTransfer = saved.toTransfer;
          item.source = saved.source;
          item.deadline = saved.deadline;
          item.unitPrice = saved.unitPrice;
          item.toPurchase = Math.max(0, item.totalNeed - item.inStock - item.toTransfer);
          item.estimatedCost = item.toPurchase * item.unitPrice;
        }
      });
    }

    return Array.from(map.values());
  }, [selectedRequestIds, plan]);

  // Overrides for editable fields
  const [itemOverrides, setItemOverrides] = useState<Record<string, Partial<AggregatedItem>>>({});

  const getItem = useCallback((item: AggregatedItem): AggregatedItem => {
    const override = itemOverrides[item.materialId] || {};
    const merged = { ...item, ...override };
    merged.inStock = item.inStock;
    merged.toPurchase = Math.max(0, merged.totalNeed - merged.inStock - merged.toTransfer);
    merged.estimatedCost = merged.toPurchase * merged.unitPrice;
    // Chỉ auto-set source khi bắt buộc (tồn kho = 0 và không điều chuyển)
    const forced = merged.inStock === 0 && merged.toTransfer === 0;
    if (forced) merged.source = 'purchase';
    return merged;
  }, [itemOverrides]);

  const updateItemField = (materialId: string, field: string, value: any) => {
    setItemOverrides(prev => ({ ...prev, [materialId]: { ...prev[materialId], [field]: value } }));
  };

  // NCC lookup cho từng vật tư
  const getSuppliersForMaterial = (materialId: string) => {
    const mat = getMaterialById(materialId);
    if (!mat) return [];
    return suppliers.filter(s => s.status === 'active' && s.categories.includes(mat.category));
  };

  const getPriceHistory = (materialId: string) => {
    return priceHistories.find(p => p.materialId === materialId);
  };

  // Toggle nhu cầu
  const toggleRequest = (requestId: string, checked: boolean) => {
    if (checked) setSelectedRequestIds(prev => [...prev, requestId]);
    else setSelectedRequestIds(prev => prev.filter(id => id !== requestId));
  };
  const selectAll = () => setSelectedRequestIds(materialRequests.map(r => r.id));
  const deselectAll = () => setSelectedRequestIds([]);

  // Handlers
  const handleSave = () => {
    form.validateFields().then(() => {
      if (selectedRequestIds.length === 0) { message.warning('Vui lòng chọn ít nhất một yêu cầu nhu cầu vật tư'); return; }
      message.success(isEdit ? `Đã cập nhật kế hoạch ${plan?.code}` : 'Đã lưu kế hoạch mới');
      navigate('/supply-plans');
    });
  };

  const handleSaveAndSubmit = () => {
    form.validateFields().then(() => {
      if (selectedRequestIds.length === 0) { message.warning('Vui lòng chọn ít nhất một yêu cầu nhu cầu vật tư'); return; }
      const items = aggregatedItems.map(getItem);
      if (items.some(i => !i.deadline && i.toPurchase > 0)) { message.warning('Vui lòng nhập hạn chót cho vật tư cần mua'); return; }
      message.success(isEdit ? `Đã cập nhật và trình duyệt ${plan?.code}` : 'Đã lưu và trình duyệt kế hoạch mới');
      navigate('/supply-plans');
    });
  };

  // Totals
  const finalItems = aggregatedItems.map(getItem);
  const totalNeed = finalItems.reduce((s, i) => s + i.totalNeed, 0);
  const totalPurchase = finalItems.reduce((s, i) => s + i.toPurchase, 0);
  const totalStock = finalItems.reduce((s, i) => s + i.inStock, 0);
  const totalEstimated = finalItems.filter(i => i.source === 'purchase').reduce((s, i) => s + i.estimatedCost, 0);

  // ═══ Bước 1 columns ═══
  const requestColumns: ColumnsType<MaterialRequest> = [
    { title: '', key: 'select', width: 50, align: 'center',
      render: (_: unknown, record: MaterialRequest) => <Checkbox checked={selectedRequestIds.includes(record.id)} onChange={(e) => toggleRequest(record.id, e.target.checked)} /> },
    { title: 'Mã YC', dataIndex: 'code', key: 'code', width: 120,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{code}</Text> },
    { title: 'Nguồn', key: 'source', width: 130,
      render: (_: unknown, record: MaterialRequest) => {
        const cfg = materialRequestSourceConfig[record.source];
        return <Tag color={cfg.color} icon={record.source === 'technical_plan' ? <ToolOutlined /> : <DatabaseOutlined />} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      } },
    { title: 'Đơn vị', dataIndex: 'departmentName', key: 'dept', width: 170, ellipsis: true },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 85, align: 'center',
      render: (p: string) => { const cfg = priorityConfig[p as keyof typeof priorityConfig]; return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>; } },
    { title: 'SL VT', key: 'count', width: 65, align: 'center',
      render: (_: unknown, record: MaterialRequest) => <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, color: '#fff', fontSize: 12, fontWeight: 600 }}>{record.items.length}</span> },
    { title: 'Ngày YC', dataIndex: 'requestedDate', key: 'date', width: 100,
      render: (d: string) => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text> },
  ];

  // ═══ Bước 2 columns ═══
  const step2Columns: ColumnsType<AggregatedItem> = [
    { title: 'STT', key: 'stt', width: 50, align: 'center',
      render: (_: unknown, __: AggregatedItem, idx: number) => <Text strong style={{ color: colors.navy }}>{idx + 1}</Text> },
    { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 100,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{code}</Text> },
    { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name', width: 200, ellipsis: true },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60, align: 'center' },
    { title: 'SL cần', key: 'need', width: 75, align: 'right',
      render: (_: unknown, r: AggregatedItem) => <Text strong>{getItem(r).totalNeed}</Text> },
    { title: 'Tồn kho', key: 'stock', width: 75, align: 'right',
      render: (_: unknown, r: AggregatedItem) => {
        const s = r.inStock; const ok = s >= r.totalNeed;
        return <Text strong style={{ color: ok ? colors.success : s > 0 ? colors.warning : colors.danger }}>{s}</Text>;
      } },
    { title: 'Điều chuyển', key: 'transfer', width: 90,
      render: (_: unknown, r: AggregatedItem) => <InputNumber min={0} value={getItem(r).toTransfer || undefined} onChange={(v) => updateItemField(r.materialId, 'toTransfer', v || 0)} style={{ width: '100%' }} size="small" placeholder="0" /> },
    { title: 'Mua mới', key: 'purchase', width: 75, align: 'right',
      render: (_: unknown, r: AggregatedItem) => { const item = getItem(r); return <Text strong style={{ color: item.toPurchase > 0 ? colors.navy : colors.textSecondary }}>{item.toPurchase}</Text>; } },
    { title: 'Nguồn', key: 'source', width: 110,
      render: (_: unknown, r: AggregatedItem) => {
        const item = getItem(r);
        const forced = item.inStock === 0 && item.toTransfer === 0;
        return (
          <Select
            value={item.source}
            onChange={(v) => updateItemField(r.materialId, 'source', v)}
            options={sourceOptions}
            style={{ width: '100%' }}
            size="small"
            disabled={forced}
          />
        );
      } },
    { title: 'Hạn chót', key: 'deadline', width: 135,
      render: (_: unknown, r: AggregatedItem) => { const item = getItem(r); return <DatePicker value={item.deadline ? dayjs(item.deadline) : null} onChange={(d) => updateItemField(r.materialId, 'deadline', d ? d.format('YYYY-MM-DD') : '')} format="DD/MM/YYYY" style={{ width: '100%' }} size="small" placeholder="Chọn ngày" />; } },
    { title: 'Từ YC', key: 'from', width: 100,
      render: (_: unknown, r: AggregatedItem) => <Space size={2} wrap>{r.fromRequestIds.map(rid => { const req = materialRequests.find(rr => rr.id === rid); return <Tag key={rid} style={{ fontSize: 10, margin: 0 }}>{req?.code || rid}</Tag>; })}</Space> },
  ];

  // ═══ Bước 3: Build supplier price comparison data ═══
  const getSupplierPriceRows = (materialId: string): SupplierPriceRow[] => {
    const nccList = getSuppliersForMaterial(materialId);
    const history = getPriceHistory(materialId);
    const years = new Set<number>();
    if (history) history.records.forEach(r => years.add(r.year));

    return nccList.map(s => {
      const prices: Record<number, number> = {};
      if (history) {
        history.records.filter(r => r.supplierId === s.id).forEach(r => { prices[r.year] = r.unitPrice; });
      }
      const priceEntries = Object.entries(prices).map(([y, p]) => ({ year: Number(y), price: p })).sort((a, b) => b.year - a.year);
      const latestPrice = priceEntries.length > 0 ? priceEntries[0].price : 0;
      const latestYear = priceEntries.length > 0 ? priceEntries[0].year : 0;
      const prevPrice = priceEntries.length > 1 ? priceEntries[1].price : null;
      const trend = prevPrice ? ((latestPrice - prevPrice) / prevPrice * 100) : null;

      return {
        key: s.id,
        supplierId: s.id,
        supplierName: s.name,
        shortName: s.shortName,
        onTimeRate: s.onTimeRate,
        qualityRate: s.qualityRate,
        rating: s.rating,
        prices,
        latestPrice,
        latestYear,
        trend,
      };
    });
  };

  // All years across all price histories for display
  const getAllYears = (materialId: string): number[] => {
    const history = getPriceHistory(materialId);
    if (!history) return [];
    const years = new Set<number>();
    history.records.forEach(r => years.add(r.year));
    return Array.from(years).sort();
  };

  // Expanded row for Bước 3
  const renderStep3ExpandedRow = (record: AggregatedItem) => {
    const item = getItem(record);
    const rows = getSupplierPriceRows(record.materialId);
    const years = getAllYears(record.materialId);

    if (rows.length === 0) {
      return <div style={{ padding: '16px 24px' }}><Empty description="Chưa có nhà cung cấp nào cho vật tư này" image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>;
    }

    return (
      <div style={{ padding: '16px 24px', background: '#fafbfc' }}>
        <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 12 }}>
          So sánh giá nhà cung cấp — {record.materialName}
        </Text>
        <Table
          dataSource={rows}
          rowKey="key"
          size="small"
          pagination={false}
          rowClassName={(r) => r.supplierId === item.selectedSupplierId ? 'row-executing' : ''}
          columns={[
            {
              title: 'Nhà cung cấp', key: 'name', width: 200,
              render: (_: unknown, r: SupplierPriceRow) => (
                <div>
                  <Text strong style={{ fontSize: 13 }}>{r.supplierName}</Text>
                  <div style={{ marginTop: 2 }}>
                    <Tag style={{ fontSize: 10, margin: 0, background: r.rating === 'A' ? '#f0fdf4' : r.rating === 'B' ? '#f0f7ff' : '#fffbe6', border: 'none', color: r.rating === 'A' ? colors.success : r.rating === 'B' ? colors.info : colors.warning }}>
                      Hạng {r.rating}
                    </Tag>
                  </div>
                </div>
              ),
            },
            ...years.map(year => ({
              title: `${year}`,
              key: `price_${year}`,
              width: 100,
              align: 'right' as const,
              render: (_: unknown, r: SupplierPriceRow) => {
                const price = r.prices[year];
                if (!price) return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
                return <Text style={{ fontSize: 13, fontWeight: 500 }}>{price} tr</Text>;
              },
            })),
            {
              title: 'Biến động', key: 'trend', width: 100, align: 'center' as const,
              render: (_: unknown, r: SupplierPriceRow) => {
                if (r.trend === null) return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
                return (
                  <Text style={{ fontSize: 12, fontWeight: 600, color: r.trend > 0 ? colors.danger : r.trend < 0 ? colors.success : colors.textSecondary }}>
                    {r.trend > 0 ? <RiseOutlined style={{ marginRight: 2 }} /> : r.trend < 0 ? <FallOutlined style={{ marginRight: 2 }} /> : null}
                    {r.trend > 0 ? '+' : ''}{r.trend.toFixed(1)}%
                  </Text>
                );
              },
            },
            {
              title: 'Đúng hạn', key: 'ontime', width: 80, align: 'center' as const,
              render: (_: unknown, r: SupplierPriceRow) => (
                <Text style={{ fontSize: 12, fontWeight: 600, color: r.onTimeRate >= 90 ? colors.success : r.onTimeRate >= 80 ? colors.warning : colors.danger }}>
                  {r.onTimeRate}%
                </Text>
              ),
            },
            {
              title: 'Chất lượng', key: 'quality', width: 80, align: 'center' as const,
              render: (_: unknown, r: SupplierPriceRow) => (
                <Text style={{ fontSize: 12, fontWeight: 600, color: r.qualityRate >= 90 ? colors.success : r.qualityRate >= 80 ? colors.warning : colors.danger }}>
                  {r.qualityRate}%
                </Text>
              ),
            },
            {
              title: 'Chọn', key: 'select', width: 60, align: 'center' as const,
              render: (_: unknown, r: SupplierPriceRow) => (
                <input
                  type="radio"
                  name={`supplier_${record.materialId}`}
                  checked={item.selectedSupplierId === r.supplierId}
                  onChange={() => {
                    updateItemField(record.materialId, 'selectedSupplierId', r.supplierId);
                    updateItemField(record.materialId, 'selectedSupplierName', r.supplierName);
                    if (r.latestPrice > 0) {
                      updateItemField(record.materialId, 'unitPrice', r.latestPrice);
                    }
                  }}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: colors.navy }}
                />
              ),
            },
          ]}
        />
      </div>
    );
  };

  // Bước 3 main columns
  const step3Columns: ColumnsType<AggregatedItem> = [
    { title: 'STT', key: 'stt', width: 50, align: 'center',
      render: (_: unknown, __: AggregatedItem, idx: number) => <Text strong style={{ color: colors.navy }}>{idx + 1}</Text> },
    { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 100,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{code}</Text> },
    { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name', width: 220, ellipsis: true },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 55, align: 'center' },
    { title: 'SL mua', key: 'purchase', width: 70, align: 'right',
      render: (_: unknown, r: AggregatedItem) => <Text strong style={{ color: colors.navy, fontSize: 14 }}>{getItem(r).toPurchase}</Text> },
    { title: 'NCC được chọn', key: 'selectedSupplier', width: 180,
      render: (_: unknown, r: AggregatedItem) => {
        const item = getItem(r);
        if (!item.selectedSupplierName) return <Text type="secondary" style={{ fontSize: 12 }}>Chưa chọn — mở rộng để chọn</Text>;
        return <Tag color={colors.navy} style={{ fontSize: 12 }}>{item.selectedSupplierName}</Tag>;
      } },
    { title: 'Đơn giá (tr)', key: 'unitPrice', width: 110,
      render: (_: unknown, r: AggregatedItem) => {
        const item = getItem(r);
        return (
          <InputNumber min={0} step={0.1} value={item.unitPrice}
            onChange={(v) => updateItemField(r.materialId, 'unitPrice', v || 0)}
            style={{ width: '100%' }} size="small" />
        );
      } },
    { title: 'Dự toán (tr)', key: 'cost', width: 110, align: 'right',
      render: (_: unknown, r: AggregatedItem) => {
        const item = getItem(r);
        return <Text strong style={{ color: item.estimatedCost > 0 ? colors.navy : colors.textSecondary, fontSize: 15 }}>{item.estimatedCost.toFixed(1)}</Text>;
      } },
  ];

  const purchaseItems = aggregatedItems.filter(i => {
    const item = getItem(i);
    return item.toPurchase > 0 && item.source === 'purchase';
  });

  return (
    <div>
      {/* Breadcrumb */}
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/supply-plans')} style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}>
        Quay lại danh sách
      </Button>

      {/* Hero */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`, padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isEdit ? <FileTextOutlined style={{ fontSize: 22, color: colors.goldLight }} /> : <PlusOutlined style={{ fontSize: 22, color: colors.goldLight }} />}
            </div>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20 }}>
                {isEdit ? `Chỉnh sửa: ${plan?.title}` : 'Tạo kế hoạch bảo đảm vật tư mới'}
              </Title>
              {isEdit && plan && <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', marginTop: 6 }}>{plan.code}</Tag>}
            </div>
            <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Yêu cầu</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{selectedRequestIds.length}</div>
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Loại VT</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{aggregatedItems.length}</div>
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Dự toán</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.goldLight, lineHeight: 1.1 }}>{totalEstimated.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 3 }}>tr</span></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Thông tin KH */}
      <Card
        title={<Space size={10}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined style={{ fontSize: 14, color: '#fff' }} /></div><span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Thông tin kế hoạch</span></Space>}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        <Form form={form} layout="vertical" initialValues={plan ? { title: plan.title, year: plan.year, quarter: plan.quarter, relatedTask: plan.relatedTask } : { year: 2026 }}>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item name="title" label="Tên kế hoạch" rules={[{ required: true, message: 'Nhập tên kế hoạch' }]}>
                <Input placeholder="Ví dụ: Kế hoạch bảo đảm vật tư Quý 2/2026" style={{ fontSize: 15 }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="year" label="Năm" rules={[{ required: true, message: 'Nhập năm' }]}>
                <InputNumber style={{ width: '100%', fontSize: 15 }} min={2024} max={2030} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="quarter" label="Quý">
                <Select placeholder="Chọn quý" allowClear>
                  <Select.Option value={1}>Quý 1</Select.Option>
                  <Select.Option value={2}>Quý 2</Select.Option>
                  <Select.Option value={3}>Quý 3</Select.Option>
                  <Select.Option value={4}>Quý 4</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="relatedTask" label="Nhiệm vụ liên quan">
                <Input placeholder="Ví dụ: Nâng cấp hệ thống P-37 Khối Vận hành 367" style={{ fontSize: 15 }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={1} placeholder="Ghi chú thêm" style={{ fontSize: 15 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* ═══ Tabs 3 bước ═══ */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
        styles={{ body: { padding: '0 24px 24px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <Space size={6}>
                  <CheckCircleOutlined />
                  <span>Chọn nhu cầu vật tư</span>
                  <Tag color={colors.navy} style={{ marginLeft: 4, fontSize: 11 }}>{selectedRequestIds.length}</Tag>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>Chọn các yêu cầu nhu cầu vật tư đã duyệt để đưa vào kế hoạch</Text>
                    <Space size={8}>
                      <Button size="small" onClick={selectAll}>Chọn tất cả</Button>
                      <Button size="small" onClick={deselectAll}>Bỏ chọn</Button>
                      <Tag color={colors.navy}>{selectedRequestIds.length}/{materialRequests.length} đã chọn</Tag>
                    </Space>
                  </div>
                  <Table columns={requestColumns} dataSource={materialRequests} rowKey="id" size="small" pagination={false} scroll={{ x: 900 }}
                    rowClassName={(record) => selectedRequestIds.includes(record.id) ? 'row-executing' : ''} />
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <Space size={6}>
                  <CalendarOutlined />
                  <span>Nguồn cung & Hạn chót</span>
                  <Tag color={colors.navy} style={{ marginLeft: 4, fontSize: 11 }}>{aggregatedItems.length}</Tag>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f0f7ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DatabaseOutlined style={{ color: colors.navy }} />
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Cột <Text strong style={{ fontSize: 12 }}>Tồn kho</Text> được lấy tự động từ <Text strong style={{ fontSize: 12 }}>Quản lý Kho</Text>.
                      Cột <Text strong style={{ fontSize: 12 }}>Mua mới</Text> = SL cần - Tồn kho - Điều chuyển.
                    </Text>
                  </div>
                  {aggregatedItems.length === 0 ? (
                    <Empty description="Chưa chọn nhu cầu vật tư nào. Quay lại Bước 1 để chọn." style={{ padding: '40px 0' }} />
                  ) : (
                    <Table columns={step2Columns} dataSource={aggregatedItems} rowKey="key" size="small" pagination={false} scroll={{ x: 1100 }}
                      summary={() => (
                        <Table.Summary.Row style={{ backgroundColor: colors.bgLight }}>
                          <Table.Summary.Cell index={0} colSpan={4}><Text strong style={{ fontSize: 13 }}>TỔNG CỘNG</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right"><Text strong>{totalNeed}</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right"><Text strong style={{ color: colors.success }}>{totalStock}</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={3} />
                          <Table.Summary.Cell index={4} align="right"><Text strong style={{ color: colors.navy }}>{totalPurchase}</Text></Table.Summary.Cell>
                          <Table.Summary.Cell index={5} colSpan={3} />
                        </Table.Summary.Row>
                      )}
                    />
                  )}
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <Space size={6}>
                  <DollarOutlined />
                  <span>Lập dự toán kinh phí</span>
                  <Tag color="#d97706" style={{ marginLeft: 4, fontSize: 11 }}>{totalEstimated.toFixed(1)} tr</Tag>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fffbe6', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HistoryOutlined style={{ color: '#d97706' }} />
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      <Text strong style={{ fontSize: 12 }}>Click vào từng dòng</Text> để mở bảng so sánh giá các nhà cung cấp.
                      Chọn NCC sẽ tự điền đơn giá mới nhất. Có thể chỉnh tay đơn giá sau khi chọn.
                      <Text strong style={{ fontSize: 12 }}> Dự toán</Text> = SL mua x Đơn giá.
                    </Text>
                  </div>
                  {purchaseItems.length === 0 ? (
                    <Empty description="Không có vật tư nào cần mua mới. Quay lại Bước 2 để kiểm tra." style={{ padding: '40px 0' }} />
                  ) : (
                    <Table
                      columns={step3Columns}
                      dataSource={purchaseItems}
                      rowKey="key"
                      size="small"
                      pagination={false}
                      scroll={{ x: 900 }}
                      expandable={{
                        expandedRowRender: renderStep3ExpandedRow,
                        expandedRowKeys: step3ExpandedKey ? [step3ExpandedKey] : [],
                        onExpand: (expanded, record) => setStep3ExpandedKey(expanded ? record.key : null),
                        expandRowByClick: true,
                      }}
                      summary={() => (
                        <Table.Summary fixed>
                          <Table.Summary.Row style={{ backgroundColor: colors.bgLight }}>
                            <Table.Summary.Cell index={0} colSpan={6}><Text strong style={{ fontSize: 13 }}>TỔNG DỰ TOÁN</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={6} />
                            <Table.Summary.Cell index={7} />
                            <Table.Summary.Cell index={8} align="right">
                              <Text strong style={{ color: colors.navy, fontSize: 15 }}>{totalEstimated.toFixed(1)} tr</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Action bar */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: '16px 24px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {selectedRequestIds.length} yêu cầu | {aggregatedItems.length} loại VT | Mua mới: {totalPurchase} | Dự toán: {totalEstimated.toFixed(1)} tr
          </Text>
          <Space size={12}>
            <Button onClick={() => navigate('/supply-plans')}>Hủy</Button>
            <Button icon={<SaveOutlined />} onClick={handleSave}>{isEdit ? 'Cập nhật' : 'Lưu nháp'}</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSaveAndSubmit}>{isEdit ? 'Cập nhật & Trình duyệt' : 'Lưu & Trình duyệt'}</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SupplyPlanForm;
