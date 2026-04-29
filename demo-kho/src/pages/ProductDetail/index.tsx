import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Tabs, Descriptions, Table, Tag, Button, Space, Row, Col,
  Typography, Empty, Statistic, Divider, Timeline, Alert,
  Result, Progress, Badge, App, Modal, Form, InputNumber, DatePicker, Input, Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, StopOutlined,
  AppstoreOutlined, DatabaseOutlined, SwapOutlined,
  EnvironmentOutlined, AuditOutlined,
  CheckCircleOutlined, WarningOutlined, InfoCircleOutlined,
  SafetyCertificateOutlined, NodeIndexOutlined, FieldTimeOutlined,
  InboxOutlined, ToolOutlined, ClockCircleOutlined,
  BarChartOutlined, ShoppingCartOutlined, CarOutlined,
  BarcodeOutlined, CalendarOutlined, StockOutlined, PlusOutlined,
  HistoryOutlined, SendOutlined,
} from '@ant-design/icons';
import { products } from '../../data/products';
import { inventoryItems } from '../../data/inventory';
import {
  productTypeConfig, trackingTypeConfig, productStatusConfig,
  formatNumber, formatDate, getStockLevelColor,
  stockParameterStatusConfig, validateStockParameters,
} from '../../utils/format';
import { getAppliedStockParameter, getStockParameterHistory } from '../../data/stockParameters';
import { getUnitConversions } from '../../data/unitConversions';
import type { Product, InventoryItem, StockParameterRecord, UnitConversionRecord } from '../../types';

const { Title, Text, Paragraph } = Typography;

// ─── Section header (reuse pattern từ ProductRequestForm) ──
const SectionHeader = ({
  gradient, icon, title,
}: {
  gradient: string;
  icon: React.ReactNode;
  title: string;
}) => (
  <Space align="center" size={10} style={{ marginBottom: 16 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 7, background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

// ─── Mock approval timeline ────────────────────────────────
const buildApprovalTimeline = (product: Product) => [
  {
    color: '#52c41a',
    dot: <CheckCircleOutlined />,
    children: (
      <div>
        <Text strong style={{ fontSize: 13 }}>Ban hành vật tư</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Nguyễn Văn Hùng — P.LGKT &nbsp;|&nbsp; {formatDate(product.updatedAt)}
        </Text>
        <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
          Mã vật tư <Text code style={{ fontSize: 11 }}>{product.code}</Text> đã được ban hành chính thức vào danh mục.
        </div>
      </div>
    ),
  },
  {
    color: '#1B3A5C',
    dot: <CheckCircleOutlined />,
    children: (
      <div>
        <Text strong style={{ fontSize: 13 }}>Phê duyệt</Text>&nbsp;
        <Tag color="success" style={{ fontSize: 11 }}>Đồng ý</Tag>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Phạm Quốc Hưng — Ban Giám đốc &nbsp;|&nbsp; {formatDate(product.createdAt)}
        </Text>
        <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
          "Phê duyệt. Bổ sung đúng nhu cầu bảo trì, sửa chữa thiết bị Trung tâm Hà Nội."
        </div>
      </div>
    ),
  },
  {
    color: '#722ed1',
    dot: <CheckCircleOutlined />,
    children: (
      <div>
        <Text strong style={{ fontSize: 13 }}>Chuẩn hóa thông tin</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Lê Minh Đức — P.KT &nbsp;|&nbsp; {formatDate(product.createdAt)}
        </Text>
        <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
          Đã chuẩn hóa tên vật tư và bổ sung thông số kỹ thuật theo TL-2025/KT.
        </div>
      </div>
    ),
  },
  {
    color: '#1890ff',
    dot: <CheckCircleOutlined />,
    children: (
      <div>
        <Text strong style={{ fontSize: 13 }}>Kiểm tra trùng lặp</Text>&nbsp;
        <Tag color="blue" style={{ fontSize: 11 }}>Không trùng</Tag>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Hệ thống — P.KCS &nbsp;|&nbsp; {formatDate(product.createdAt)}
        </Text>
        <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
          Kiểm tra tự động: không phát hiện vật tư trùng lặp trong danh mục hiện có.
        </div>
      </div>
    ),
  },
  {
    color: '#888',
    dot: <CheckCircleOutlined />,
    children: (
      <div>
        <Text strong style={{ fontSize: 13 }}>Nộp yêu cầu tạo vật tư</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Kỹ sư Trần Văn Nam — PX1 &nbsp;|&nbsp; {formatDate(product.createdAt)}
        </Text>
        <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
          Yêu cầu bổ sung vật tư phục vụ đại tu thiết bị {product.category.toLowerCase()}.
        </div>
      </div>
    ),
  },
];

// ─── Mock audit log ────────────────────────────────────────
const buildAuditLog = (product: Product) => [
  {
    key: 'a3',
    timestamp: product.updatedAt,
    actor: 'Nguyễn Văn Hùng',
    actorRole: 'P.LGKT',
    action: 'Cập nhật mức tồn kho',
    field: 'minStock / maxStock',
    oldValue: `${Math.max(1, product.minStock - 2)} / ${product.maxStock - 5}`,
    newValue: `${product.minStock} / ${product.maxStock}`,
    note: 'Điều chỉnh theo nhu cầu thực tế Quý II/2026',
  },
  {
    key: 'a2',
    timestamp: product.createdAt,
    actor: 'Lê Minh Đức',
    actorRole: 'P.KT',
    action: 'Cập nhật quy cách kỹ thuật',
    field: 'specifications',
    oldValue: '(trống)',
    newValue: product.specifications
      ? product.specifications.substring(0, 60) + '…'
      : '(trống)',
    note: 'Bổ sung thông số theo tài liệu kỹ thuật TL-2025/KT',
  },
  {
    key: 'a1',
    timestamp: product.createdAt,
    actor: 'Nguyễn Văn Hùng',
    actorRole: 'P.LGKT',
    action: 'Tạo vật tư',
    field: '—',
    oldValue: '—',
    newValue: '—',
    note: 'Tạo mới vật tư vào danh mục Trung tâm Hà Nội',
  },
];

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { modal, message } = App.useApp();
  const initialTab = searchParams.get('tab') === 'stock-params' ? 'stock-params' : 'info';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [spModalOpen, setSpModalOpen] = useState(false);
  const [spForm] = Form.useForm();

  // UOM state
  const [uomRecords, setUomRecords] = useState<UnitConversionRecord[]>(
    () => getUnitConversions(id ?? '')
  );
  const [uomModalOpen, setUomModalOpen] = useState(false);
  const [uomForm] = Form.useForm();

  const [productData, setProductData] = useState<Product | undefined>(
    () => products.find((p) => p.id === id)
  );
  const product = productData;

  if (!product) {
    return (
      <Result
        status="404"
        title="Không tìm thấy vật tư"
        subTitle={`Mã vật tư "${id}" không tồn tại trong hệ thống.`}
        extra={<Button type="primary" onClick={() => navigate('/products')}>Quay lại danh mục</Button>}
      />
    );
  }

  // ─── Inventory aggregates ──────────────────────────────
  const productInventory = inventoryItems.filter(
    (inv) => inv.productCode === product.code || inv.productId === product.id
  );
  const totalOnHand    = productInventory.reduce((s, i) => s + i.qtyOnHand, 0);
  const totalAvailable = productInventory.reduce((s, i) => s + i.qtyAvailable, 0);
  const totalReserved  = productInventory.reduce((s, i) => s + i.qtyReserved, 0);
  const totalIncoming  = productInventory.reduce((s, i) => s + i.qtyIncoming, 0);
  const totalOutgoing  = productInventory.reduce((s, i) => s + i.qtyOutgoing, 0);
  const warehouseCount = new Set(productInventory.map((i) => i.warehouseId)).size;
  const typeConfig   = productTypeConfig[product.productType];
  const trackConfig  = trackingTypeConfig[product.trackingType];
  const statusConfig = productStatusConfig[product.status];
  const auditLog     = buildAuditLog(product);
  const approvalTimeline = buildApprovalTimeline(product);

  // ─── Stock parameters (before stockColor so effectiveMin/Max can be used) ──
  const appliedSP        = useMemo(() => getAppliedStockParameter(product.id), [product.id]);
  const spHistory        = useMemo(() => getStockParameterHistory(product.id), [product.id]);
  const effectiveMin     = appliedSP?.minStock     ?? product.minStock;
  const effectiveMax     = appliedSP?.maxStock      ?? product.maxStock;
  const effectiveReorder = appliedSP?.reorderPoint  ?? product.reorderPoint;

  const stockColor     = getStockLevelColor(totalOnHand, effectiveMin, effectiveMax);
  const stockPct       = effectiveMax > 0
    ? Math.min(Math.round((totalOnHand / effectiveMax) * 100), 100)
    : 0;

  // ─── Handlers ─────────────────────────────────────────
  const handleDeactivate = () => {
    modal.confirm({
      title: 'Vô hiệu hóa vật tư',
      content: (
        <span>
          Vô hiệu hóa <strong>{product.name}</strong>?
          Vật tư sẽ không xuất hiện trong các giao dịch mới.
          Tồn kho hiện có vẫn được giữ nguyên.
        </span>
      ),
      okText: 'Vô hiệu hóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        setProductData((prev) =>
          prev ? { ...prev, status: 'inactive', updatedAt: new Date().toISOString() } : prev
        );
        message.success('Đã vô hiệu hóa vật tư');
      },
    });
  };

  const handleActivate = () => {
    modal.confirm({
      title: 'Kích hoạt lại vật tư',
      content: <span>Kích hoạt lại <strong>{product.name}</strong>?</span>,
      okText: 'Kích hoạt',
      cancelText: 'Hủy',
      onOk: () => {
        setProductData((prev) =>
          prev ? { ...prev, status: 'active', updatedAt: new Date().toISOString() } : prev
        );
        message.success('Đã kích hoạt vật tư');
      },
    });
  };

  // ══════════════════════════════════════════════════════════
  // TAB 1 — Thông tin chung
  // ══════════════════════════════════════════════════════════
  const renderInfoTab = () => (
    <Row gutter={[20, 20]}>
      {/* Left: Master data */}
      <Col xs={24} lg={16}>
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '20px 24px' } }}>
          <SectionHeader
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
            icon={<AppstoreOutlined style={{ color: '#fff', fontSize: 13 }} />}
            title="Thông tin định danh"
          />
          <Descriptions
            column={{ xs: 1, sm: 2 }}
            labelStyle={{ fontWeight: 500, color: '#1B3A5C', fontSize: 13 }}
            contentStyle={{ fontSize: 13 }}
          >
            <Descriptions.Item label="Mã vật tư">
              <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C', fontSize: 14 }}>
                {product.code}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên vật tư" span={2}>
              <Text strong style={{ fontSize: 14 }}>{product.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm vật tư">{product.category}</Descriptions.Item>
            <Descriptions.Item label="Phân nhóm">
              {product.subCategory || <Text type="secondary">—</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Loại sản phẩm">
              <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị tính chuẩn">
              <Tag>{product.baseUnit}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nhà sản xuất">
              {product.manufacturer || <Text type="secondary">—</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Xuất xứ">
              {product.origin || <Text type="secondary">—</Text>}
            </Descriptions.Item>
            {product.shelfLife && (
              <Descriptions.Item label="Hạn sử dụng">
                {formatNumber(product.shelfLife)} ngày ({Math.round(product.shelfLife / 365)} năm)
              </Descriptions.Item>
            )}
            {product.warrantyMonths && (
              <Descriptions.Item label="Bảo hành">
                {product.warrantyMonths} tháng
              </Descriptions.Item>
            )}
            {product.militaryGrade && (
              <Descriptions.Item label="Cấp doanh nghiệp" span={2}>
                <Space>
                  <SafetyCertificateOutlined style={{ color: '#1B3A5C' }} />
                  <Text style={{ color: '#1B3A5C', fontWeight: 600 }}>Military Grade</Text>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Quy cách kỹ thuật" span={2}>
              <Text style={{ fontSize: 13, color: '#444' }}>
                {product.specifications || <Text type="secondary">Chưa cập nhật</Text>}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* Right: Source + timestamps */}
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {/* Nguồn tạo */}
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '18px 20px' } }}>
            <SectionHeader
              gradient="linear-gradient(135deg, #D4A843, #f0d890)"
              icon={<AuditOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
              title="Nguồn gốc & Công bố"
            />
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Nguồn tạo</Text>
                <Tag color="blue" style={{ fontSize: 11 }}>Qua workflow</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Ngày tạo</Text>
                <Text style={{ fontSize: 13 }}>{formatDate(product.createdAt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Người tạo</Text>
                <Text style={{ fontSize: 13 }}>N.V. Hùng</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Cập nhật cuối</Text>
                <Text style={{ fontSize: 13 }}>{formatDate(product.updatedAt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Người cập nhật</Text>
                <Text style={{ fontSize: 13 }}>N.V. Hùng</Text>
              </div>
            </Space>
          </Card>

          {/* Stock mini summary */}
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '18px 20px' } }}>
            <SectionHeader
              gradient="linear-gradient(135deg, #237804, #52c41a)"
              icon={<DatabaseOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Tồn kho nhanh"
            />
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Progress
                type="circle"
                percent={stockPct}
                strokeColor={stockColor}
                size={100}
                format={() => (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: stockColor, lineHeight: 1.1 }}>
                      {formatNumber(totalOnHand)}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{product.baseUnit}</div>
                  </div>
                )}
              />
            </div>
            {totalOnHand < effectiveMin && (
              <Alert
                type="error"
                message={`Dưới mức tối thiểu (${formatNumber(effectiveMin)} ${product.baseUnit})`}
                showIcon
                style={{ borderRadius: 8, fontSize: 12, padding: '4px 10px' }}
              />
            )}
            {totalOnHand > effectiveMax && (
              <Alert
                type="warning"
                message={`Vượt mức tối đa (${formatNumber(effectiveMax)} ${product.baseUnit})`}
                showIcon
                style={{ borderRadius: 8, fontSize: 12, padding: '4px 10px' }}
              />
            )}
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // ══════════════════════════════════════════════════════════
  // TAB 2 — Thuộc tính quản lý kho
  // ══════════════════════════════════════════════════════════
  const renderStorageTab = () => {
    const flagItems = [
      { label: 'Theo dõi Serial / Lot', value: <Tag color={trackConfig.color}>{trackConfig.label}</Tag> },
      { label: 'Quản lý hạn sử dụng', value: product.shelfLife ? <Tag color="orange">Có</Tag> : <Tag color="default">Không</Tag> },
      { label: 'Yêu cầu kiểm tra QC đầu vào', value: <Tag color="blue">Bắt buộc</Tag> },
      { label: 'Cho phép điều chuyển kho', value: <Tag color="green">Có</Tag> },
      { label: 'Cấp doanh nghiệp (Military Grade)', value: product.militaryGrade ? <Tag color="purple">Military Grade</Tag> : <Tag color="default">Không</Tag> },
    ];

    return (
      <Row gutter={[20, 20]}>
        {/* Cờ cấu hình */}
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}>
            <SectionHeader
              gradient="linear-gradient(135deg, #531dab, #722ed1)"
              icon={<NodeIndexOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Cấu hình theo dõi & Kiểm soát"
            />
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {flagItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 8, background: '#fafafa',
                  border: '1px solid #f0f0f0',
                }}>
                  <Text style={{ fontSize: 13, color: '#444' }}>{item.label}</Text>
                  {item.value}
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Mức tồn kho */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '20px 24px' } }}>
              <SectionHeader
                gradient="linear-gradient(135deg, #237804, #52c41a)"
                icon={<BarChartOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Ngưỡng tồn kho"
              />
              {[
                { label: 'Tối thiểu', value: effectiveMin, color: '#ff4d4f', pct: effectiveMax > 0 ? (effectiveMin / effectiveMax) * 100 : 0 },
                { label: 'Điểm đặt hàng lại', value: effectiveReorder, color: '#faad14', pct: effectiveMax > 0 ? (effectiveReorder / effectiveMax) * 100 : 0 },
                { label: 'Tồn hiện tại', value: totalOnHand, color: stockColor, pct: stockPct },
                { label: 'Tối đa', value: effectiveMax, color: '#1B3A5C', pct: 100 },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>{row.label}</Text>
                    <Text strong style={{ fontSize: 13, color: row.color }}>
                      {formatNumber(row.value)} {product.baseUnit}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.round(row.pct)}
                    strokeColor={row.color}
                    showInfo={false}
                    size="small"
                    style={{ marginBottom: 0 }}
                  />
                </div>
              ))}
            </Card>

            {/* Lead time */}
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '20px 24px' } }}>
              <SectionHeader
                gradient="linear-gradient(135deg, #1890ff, #40a9ff)"
                icon={<FieldTimeOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Thời gian cung ứng"
              />
              <Row gutter={[12, 12]}>
                {[
                  { label: 'Tổng', value: product.leadTimeDays, icon: <ShoppingCartOutlined />, color: '#1890ff' },
                  { label: 'Sản xuất', value: product.leadTimeProduction, icon: <ToolOutlined />, color: '#52c41a' },
                  { label: 'Vận chuyển', value: product.leadTimeTransport, icon: <CarOutlined />, color: '#faad14' },
                ].map((lt) => lt.value ? (
                  <Col span={8} key={lt.label}>
                    <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 8, background: '#f8f9ff', border: '1px solid #e8f0fe' }}>
                      <div style={{ color: lt.color, fontSize: 18, marginBottom: 4 }}>{lt.icon}</div>
                      <Text strong style={{ fontSize: 16, color: lt.color, display: 'block' }}>{lt.value}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{lt.label} (ngày)</Text>
                    </div>
                  </Col>
                ) : null)}
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>
    );
  };

  // ══════════════════════════════════════════════════════════
  // TAB 3 — Đơn vị & Quy đổi
  // ══════════════════════════════════════════════════════════
  const handleAddUom = () => {
    uomForm.resetFields();
    setUomModalOpen(true);
  };

  const handleSaveUom = async () => {
    try {
      const values = await uomForm.validateFields();
      // Check duplicate
      if (uomRecords.some(r => r.alternateUnit === values.alternateUnit)) {
        message.error(`Đơn vị "${values.alternateUnit}" đã tồn tại`);
        return;
      }
      const newRecord: UnitConversionRecord = {
        id: `UOM-${Date.now()}`,
        productId: product.id,
        alternateUnit: values.alternateUnit,
        factor: values.factor,
        note: values.note ?? '',
        createdBy: 'Trần Văn Minh',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUomRecords(prev => [...prev, newRecord]);
      setUomModalOpen(false);
      message.success(`Đã thêm quy đổi: 1 ${values.alternateUnit} = ${values.factor} ${product.baseUnit}`);
    } catch { /* validation failed */ }
  };

  const handleDeleteUom = (record: UnitConversionRecord) => {
    modal.confirm({
      title: 'Xóa quy đổi đơn vị',
      content: `Xóa quy đổi 1 ${record.alternateUnit} = ${record.factor} ${product.baseUnit}?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        setUomRecords(prev => prev.filter(r => r.id !== record.id));
        message.success('Đã xóa quy đổi');
      },
    });
  };

  const renderUnitsTab = () => (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={14}>
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '20px 24px' } }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<SwapOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Đơn vị tính & Quy đổi"
            />
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddUom}
              style={{ background: '#1B3A5C', border: 'none', borderRadius: 6 }}
            >
              Thêm quy đổi
            </Button>
          </div>

          {/* Base unit banner */}
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(27,58,92,0.05)', border: '1px solid #d0dff8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag style={{ fontWeight: 700, fontSize: 14, padding: '2px 10px' }}>{product.baseUnit}</Tag>
            <Text style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500 }}>Đơn vị tính chuẩn</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>— Mọi giao dịch nhập/xuất đều quy về đơn vị này</Text>
          </div>

          {/* Conversion table */}
          {uomRecords.length > 0 ? (
            <Table
              dataSource={uomRecords}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Đơn vị thay thế',
                  dataIndex: 'alternateUnit',
                  width: 140,
                  render: (v: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{v}</Tag>,
                },
                {
                  title: 'Quy đổi',
                  render: (_: unknown, r: UnitConversionRecord) => (
                    <Text style={{ fontSize: 13 }}>
                      1 <Text code>{r.alternateUnit}</Text> = <Text strong style={{ color: '#1B3A5C' }}>{r.factor}</Text> <Text code>{product.baseUnit}</Text>
                    </Text>
                  ),
                },
                {
                  title: 'Ghi chú',
                  dataIndex: 'note',
                  render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '—'}</Text>,
                },
                {
                  title: 'Người tạo',
                  dataIndex: 'createdBy',
                  width: 160,
                  render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
                },
                {
                  title: '',
                  width: 48,
                  render: (_: unknown, r: UnitConversionRecord) => (
                    <Tooltip title="Xóa">
                      <Button
                        type="text" danger size="small"
                        icon={<span style={{ fontSize: 14 }}>✕</span>}
                        onClick={() => handleDeleteUom(r)}
                      />
                    </Tooltip>
                  ),
                },
              ]}
            />
          ) : (
            <Empty
              description={<span>Chưa có quy đổi nào — <a onClick={handleAddUom}>Thêm quy đổi</a></span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>

        {/* Add UOM Modal */}
        <Modal
          title={
            <Space size={10}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SwapOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong>Thêm quy đổi đơn vị</Text>
            </Space>
          }
          open={uomModalOpen}
          onCancel={() => setUomModalOpen(false)}
          onOk={handleSaveUom}
          okText="Lưu"
          cancelText="Hủy"
          okButtonProps={{ style: { background: '#1B3A5C', borderColor: '#1B3A5C' } }}
          width={480}
        >
          <div style={{ margin: '12px 0 8px', padding: '8px 12px', borderRadius: 8, background: 'rgba(27,58,92,0.04)', border: '1px solid #d0dff8' }}>
            <Text style={{ fontSize: 13 }}>Đơn vị chuẩn: <Tag style={{ fontWeight: 700 }}>{product.baseUnit}</Tag></Text>
          </div>
          <Form form={uomForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label={<Text strong>Đơn vị thay thế</Text>}
              name="alternateUnit"
              rules={[{ required: true, message: 'Nhập tên đơn vị thay thế' }]}
            >
              <Input placeholder="VD: Hộp, Thùng, Bộ, Cuộn..." size="large" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item
              label={<Text strong>Hệ số quy đổi</Text>}
              name="factor"
              rules={[{ required: true, message: 'Nhập hệ số quy đổi' }, { type: 'number', min: 0.001, message: 'Phải lớn hơn 0' }]}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  1 [đơn vị thay thế] = [hệ số] {product.baseUnit}. VD: 1 Hộp = 50 Cái → hệ số = 50
                </Text>
              }
            >
              <InputNumber min={0.001} step={1} style={{ width: '100%', borderRadius: 6 }} size="large" />
            </Form.Item>
            <Form.Item label={<Text strong>Ghi chú</Text>} name="note">
              <Input placeholder="VD: Dùng khi nhập từ nhà cung cấp, đóng gói 50 cái/hộp..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Form>
        </Modal>
      </Col>

      <Col xs={24} lg={10}>
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '20px 24px' } }}>
          <SectionHeader
            gradient="linear-gradient(135deg, #D4A843, #f0d890)"
            icon={<InboxOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
            title="Đóng gói"
          />
          {product.packaging ? (
            <Descriptions column={1} size="small"
              labelStyle={{ fontWeight: 500, color: '#1B3A5C', fontSize: 12 }}
              contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Loại bao bì">{product.packaging.type}</Descriptions.Item>
              <Descriptions.Item label="Số lượng / gói">
                {formatNumber(product.packaging.qtyPerPackage)} {product.baseUnit}
              </Descriptions.Item>
              {product.packaging.weight && (
                <Descriptions.Item label="Trọng lượng">{product.packaging.weight} kg</Descriptions.Item>
              )}
              {product.packaging.dimensions && (
                <Descriptions.Item label="Kích thước">{product.packaging.dimensions}</Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Empty description="Chưa cấu hình đóng gói" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>

        {/* Hướng dẫn */}
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 16 }}
          styles={{ body: { padding: '18px 20px' } }}>
          <SectionHeader
            gradient="linear-gradient(135deg, #1890ff, #40a9ff)"
            icon={<InfoCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
            title="Hướng dẫn"
          />
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {[
              'Đơn vị thay thế dùng khi nhập/xuất kho theo đóng gói nhà cung cấp (thùng, hộp, bộ...)',
              'Hệ thống tự động quy đổi về đơn vị chuẩn khi ghi nhận giao dịch',
              'Hệ số = số lượng đơn vị chuẩn trong 1 đơn vị thay thế',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12, marginTop: 2, flexShrink: 0 }} />
                <Text style={{ fontSize: 12, color: '#555' }}>{tip}</Text>
              </div>
            ))}
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // ══════════════════════════════════════════════════════════
  // TAB 4 — Tồn kho & Truy vết
  // ══════════════════════════════════════════════════════════
  const renderStockTab = () => {
    // Group by warehouse
    const byWarehouse = Object.values(
      productInventory.reduce<Record<string, {
        warehouseId: string; warehouseName: string;
        onHand: number; available: number; reserved: number; incoming: number;
      }>>((acc, inv) => {
        const key = inv.warehouseId;
        if (!acc[key]) acc[key] = {
          warehouseId: inv.warehouseId,
          warehouseName: inv.warehouseName,
          onHand: 0, available: 0, reserved: 0, incoming: 0,
        };
        acc[key].onHand    += inv.qtyOnHand;
        acc[key].available += inv.qtyAvailable;
        acc[key].reserved  += inv.qtyReserved;
        acc[key].incoming  += inv.qtyIncoming;
        return acc;
      }, {})
    );

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {/* Warnings */}
        {totalOnHand < effectiveMin && (
          <Alert type="error" showIcon
            message={`Tồn kho dưới mức tối thiểu — Hiện có ${formatNumber(totalOnHand)}, mức tối thiểu ${formatNumber(effectiveMin)} ${product.baseUnit}`}
            style={{ borderRadius: 10 }}
          />
        )}
        {totalOnHand > effectiveMax && (
          <Alert type="warning" showIcon
            message={`Tồn kho vượt mức tối đa — Hiện có ${formatNumber(totalOnHand)}, mức tối đa ${formatNumber(effectiveMax)} ${product.baseUnit}`}
            style={{ borderRadius: 10 }}
          />
        )}

        {/* Stat row */}
        <Row gutter={[12, 12]}>
          {[
            { label: 'Tổng tồn kho', value: totalOnHand, color: '#1B3A5C' },
            { label: 'Khả dụng',     value: totalAvailable, color: '#52c41a' },
            { label: 'Đang giữ',     value: totalReserved,  color: '#faad14' },
            { label: 'Sắp nhập',     value: totalIncoming,  color: '#1890ff' },
            { label: 'Sắp xuất',     value: totalOutgoing,  color: '#ff4d4f' },
          ].map((s) => (
            <Col xs={12} sm={8} md={4} key={s.label}>
              <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 10, background: '#fff', border: '1px solid #f0f0f0' }}>
                <Text strong style={{ fontSize: 18, color: s.color, display: 'block' }}>
                  {formatNumber(s.value)}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{s.label}</Text>
              </div>
            </Col>
          ))}
        </Row>

        {/* By warehouse */}
        <Card title={
          <Space>
            <EnvironmentOutlined style={{ color: '#1B3A5C' }} />
            <Text strong style={{ color: '#1B3A5C' }}>Tồn kho theo kho hàng</Text>
            <Badge count={byWarehouse.length} style={{ backgroundColor: '#e8f0fe', color: '#1B3A5C', fontSize: 11 }} />
          </Space>
        } style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}>
          {byWarehouse.length > 0 ? (
            <Table
              dataSource={byWarehouse.map((w, i) => ({ ...w, key: i }))}
              columns={[
                { title: 'Kho', dataIndex: 'warehouseName', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                { title: 'Tồn kho', dataIndex: 'onHand', align: 'right' as const, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
                { title: 'Khả dụng', dataIndex: 'available', align: 'right' as const, render: (v: number) => <Text style={{ color: '#52c41a' }}>{formatNumber(v)}</Text> },
                { title: 'Đang giữ', dataIndex: 'reserved', align: 'right' as const, render: (v: number) => <Text style={{ color: '#faad14' }}>{formatNumber(v)}</Text> },
                { title: 'Sắp nhập', dataIndex: 'incoming', align: 'right' as const, render: (v: number) => <Text style={{ color: '#1890ff' }}>{formatNumber(v)}</Text> },
                {
                  title: 'Tình trạng', align: 'center' as const,
                  render: (_: unknown, r: { onHand: number }) => {
                    const clr = getStockLevelColor(r.onHand, effectiveMin, effectiveMax);
                    return <Badge color={clr} text={
                      r.onHand < effectiveMin ? 'Thiếu' :
                      r.onHand > effectiveMax ? 'Dư' : 'Bình thường'
                    } />;
                  },
                },
              ]}
              pagination={false}
              size="small"
            />
          ) : (
            <div style={{ padding: 24 }}>
              <Empty description="Chưa có tồn kho" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </Card>

        {/* Lot/Serial detail */}
        <Card title={
          <Space>
            <BarcodeOutlined style={{ color: '#1B3A5C' }} />
            <Text strong style={{ color: '#1B3A5C' }}>
              Chi tiết {product.trackingType === 'serial' ? 'Serial' : 'Lô hàng'}
            </Text>
            <Badge count={productInventory.length} style={{ backgroundColor: '#e8f0fe', color: '#1B3A5C', fontSize: 11 }} />
          </Space>
        } style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}>
          {productInventory.length > 0 ? (
            <Table
              dataSource={productInventory.map((inv) => ({ ...inv, key: inv.id }))}
              columns={[
                { title: 'Kho', dataIndex: 'warehouseName', width: 160 },
                { title: 'Vị trí', dataIndex: 'locationCode', width: 90, render: (v: string) => v || '—' },
                { title: 'Mã lô', dataIndex: 'lotNumber', width: 130, render: (v: string) => v ? <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</Tag> : '—' },
                { title: 'Serial', dataIndex: 'serialNumber', width: 130, render: (v: string) => v ? <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</Tag> : '—' },
                { title: 'Tồn kho', dataIndex: 'qtyOnHand', width: 90, align: 'right' as const, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
                { title: 'Khả dụng', dataIndex: 'qtyAvailable', width: 90, align: 'right' as const, render: (v: number) => <Text style={{ color: v > 0 ? '#52c41a' : '#ff4d4f' }}>{formatNumber(v)}</Text> },
                { title: 'Ngày nhập', dataIndex: 'receivedDate', width: 110, render: (v: string) => formatDate(v) },
                { title: 'Biến động', dataIndex: 'lastMovementDate', width: 110, render: (v: string) => formatDate(v) },
              ]}
              pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}` }}
              size="small"
              scroll={{ x: 900 }}
            />
          ) : (
            <div style={{ padding: 24 }}>
              <Empty description={`Chưa có dữ liệu ${product.trackingType === 'serial' ? 'serial' : 'lô hàng'}`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </Card>
      </Space>
    );
  };

  // ══════════════════════════════════════════════════════════
  // TAB 5 — Phê duyệt & Công bố
  // ══════════════════════════════════════════════════════════
  const renderApprovalTab = () => (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={14}>
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '20px 24px' } }}>
          <SectionHeader
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
            icon={<AuditOutlined style={{ color: '#fff', fontSize: 13 }} />}
            title="Lịch sử phê duyệt & Công bố"
          />
          <Timeline items={approvalTimeline} style={{ marginTop: 8 }} />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '18px 20px' } }}>
          <SectionHeader
            gradient="linear-gradient(135deg, #D4A843, #f0d890)"
            icon={<CheckCircleOutlined style={{ color: '#7c4f00', fontSize: 13 }} />}
            title="Kết quả phê duyệt"
          />
          <Descriptions column={1} size="small"
            labelStyle={{ fontWeight: 500, color: '#1B3A5C', fontSize: 12 }}
            contentStyle={{ fontSize: 13 }}>
            <Descriptions.Item label="Mã yêu cầu gốc">
              <Text style={{ fontFamily: 'monospace', color: '#1B3A5C', fontWeight: 600 }}>
                YC-DM-{product.id.replace('PRD-', '')}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị đề nghị">PX Sửa chữa Monitoring (PX1)</Descriptions.Item>
            <Descriptions.Item label="Người đề nghị">Kỹ sư Trần Văn Nam</Descriptions.Item>
            <Descriptions.Item label="Người chuẩn hóa">Lê Minh Đức (P.KT)</Descriptions.Item>
            <Descriptions.Item label="Người phê duyệt">Phạm Quốc Hưng</Descriptions.Item>
            <Descriptions.Item label="Kết quả">
              <Tag color="success">Phê duyệt</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày phê duyệt">{formatDate(product.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Ngày công bố">{formatDate(product.updatedAt)}</Descriptions.Item>
            <Descriptions.Item label="Người công bố">Nguyễn Văn Hùng (P.LGKT)</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );

  // ══════════════════════════════════════════════════════════
  // TAB 6 — Lịch sử thay đổi
  // ══════════════════════════════════════════════════════════
  const renderHistoryTab = () => (
    <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      styles={{ body: { padding: '20px 24px' } }}>
      <SectionHeader
        gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
        icon={<CalendarOutlined style={{ color: '#fff', fontSize: 13 }} />}
        title="Lịch sử thay đổi"
      />
      <Table
        dataSource={auditLog}
        columns={[
          {
            title: 'Thời điểm', dataIndex: 'timestamp', width: 130,
            render: (v: string) => (
              <Space direction="vertical" size={0}>
                <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{v.split('T')[1]?.substring(0, 5) || ''}</Text>
              </Space>
            ),
          },
          {
            title: 'Người thao tác', dataIndex: 'actor', width: 160,
            render: (v: string, r: { actorRole: string }) => (
              <Space direction="vertical" size={0}>
                <Text style={{ fontSize: 13, fontWeight: 500 }}>{v}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{r.actorRole}</Text>
              </Space>
            ),
          },
          {
            title: 'Hành động', dataIndex: 'action', width: 160,
            render: (v: string) => <Tag color="blue" style={{ fontSize: 11 }}>{v}</Tag>,
          },
          { title: 'Trường', dataIndex: 'field', width: 130, render: (v: string) => <Text code style={{ fontSize: 11 }}>{v}</Text> },
          { title: 'Giá trị cũ', dataIndex: 'oldValue', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
          { title: 'Giá trị mới', dataIndex: 'newValue', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
          { title: 'Ghi chú', dataIndex: 'note', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
        ]}
        pagination={{ pageSize: 10, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}` }}
        size="small"
        scroll={{ x: 900 }}
      />
    </Card>
  );

  // ══════════════════════════════════════════════════════════
  // TAB 7 — Tham số tồn kho
  // ══════════════════════════════════════════════════════════
  const renderStockParamsTab = () => {
    const pendingSP = spHistory.find(r => r.status === 'pending_approval' || r.status === 'draft');

    const spColumns = [
      {
        title: 'Mã hồ sơ', dataIndex: 'code', width: 160,
        render: (v: string, r: StockParameterRecord) => (
          <Space direction="vertical" size={0}>
            <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</Tag>
            <Tag color={stockParameterStatusConfig[r.status].color} style={{ fontSize: 11, marginTop: 2 }}>
              {stockParameterStatusConfig[r.status].label}
            </Tag>
          </Space>
        ),
      },
      {
        title: 'Phiên bản', dataIndex: 'version', width: 80, align: 'center' as const,
        render: (v: number) => <Text strong style={{ color: '#1B3A5C' }}>v{v}</Text>,
      },
      {
        title: 'Tối thiểu', dataIndex: 'minStock', width: 90, align: 'right' as const,
        render: (v: number, r: StockParameterRecord) => (
          <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>{formatNumber(v)} <Text type="secondary" style={{ fontSize: 11 }}>{product.baseUnit}</Text></Text>
        ),
      },
      {
        title: 'Điểm đặt lại', dataIndex: 'reorderPoint', width: 110, align: 'right' as const,
        render: (v: number) => (
          <Text style={{ color: '#faad14', fontWeight: 600 }}>{formatNumber(v)} <Text type="secondary" style={{ fontSize: 11 }}>{product.baseUnit}</Text></Text>
        ),
      },
      {
        title: 'Tối đa', dataIndex: 'maxStock', width: 90, align: 'right' as const,
        render: (v: number) => (
          <Text style={{ color: '#1B3A5C', fontWeight: 600 }}>{formatNumber(v)} <Text type="secondary" style={{ fontSize: 11 }}>{product.baseUnit}</Text></Text>
        ),
      },
      {
        title: 'Hiệu lực từ', dataIndex: 'effectiveFrom', width: 110,
        render: (v: string) => formatDate(v),
      },
      {
        title: 'Người tạo', dataIndex: 'createdBy', width: 160,
        render: (v: string, r: StockParameterRecord) => (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12 }}>{v}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(r.createdAt)}</Text>
          </Space>
        ),
      },
      {
        title: 'Người duyệt', dataIndex: 'approvedBy', width: 160,
        render: (v: string | null, r: StockParameterRecord) => v ? (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12 }}>{v}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.approvedAt ? formatDate(r.approvedAt) : ''}</Text>
          </Space>
        ) : <Text type="secondary">—</Text>,
      },
      {
        title: 'Lý do thay đổi', dataIndex: 'changeReason', ellipsis: true,
        render: (v: string) => <Tooltip title={v}><Text style={{ fontSize: 12 }}>{v}</Text></Tooltip>,
      },
    ];

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={16}>

        {/* Current applied params card */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <SectionHeader
                gradient="linear-gradient(135deg, #237804, #52c41a)"
                icon={<StockOutlined style={{ color: '#fff', fontSize: 13 }} />}
                title="Tham số đang áp dụng"
              />
              {appliedSP ? (
                <>
                  <Row gutter={[16, 12]}>
                    {[
                      { label: 'Tối thiểu (minStock)',   value: appliedSP.minStock,    color: '#ff4d4f', desc: 'Tồn kho dưới mức này → cảnh báo' },
                      { label: 'Điểm đặt hàng lại',      value: appliedSP.reorderPoint, color: '#faad14', desc: 'Kích hoạt bổ sung khi đạt mức này' },
                      { label: 'Tối đa (maxStock)',       value: appliedSP.maxStock,    color: '#1B3A5C', desc: 'Tồn kho tối đa cho phép' },
                    ].map((item) => (
                      <Col xs={8} key={item.label}>
                        <div style={{
                          textAlign: 'center', padding: '14px 12px', borderRadius: 10,
                          background: `linear-gradient(135deg, ${item.color}10, ${item.color}06)`,
                          border: `1px solid ${item.color}30`,
                        }}>
                          <Text strong style={{ fontSize: 22, color: item.color, display: 'block' }}>
                            {formatNumber(item.value)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>{product.baseUnit}</Text>
                          <Divider style={{ margin: '8px 0 6px' }} />
                          <Text style={{ fontSize: 11, color: '#595959', display: 'block', fontWeight: 500 }}>{item.label}</Text>
                          <Text type="secondary" style={{ fontSize: 10 }}>{item.desc}</Text>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <Divider style={{ margin: '16px 0 12px' }} />
                  <Descriptions column={2} size="small"
                    labelStyle={{ fontSize: 12, color: '#8c8c8c' }} contentStyle={{ fontSize: 12 }}>
                    <Descriptions.Item label="Mã hồ sơ">
                      <Tag style={{ fontFamily: 'monospace' }}>{appliedSP.code}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phiên bản">v{appliedSP.version}</Descriptions.Item>
                    <Descriptions.Item label="Hiệu lực từ">{formatDate(appliedSP.effectiveFrom)}</Descriptions.Item>
                    <Descriptions.Item label="Áp dụng lúc">{appliedSP.appliedAt ? formatDate(appliedSP.appliedAt) : '—'}</Descriptions.Item>
                    <Descriptions.Item label="Người duyệt" span={2}>
                      {appliedSP.approvedBy || '—'}
                      {appliedSP.approvedAt ? ` — ${formatDate(appliedSP.approvedAt)}` : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lý do thay đổi" span={2}>
                      <Text style={{ color: '#595959' }}>{appliedSP.changeReason}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </>
              ) : (
                <Empty
                  description={<span style={{ fontSize: 13 }}>Chưa có tham số tồn kho được áp dụng</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setSpModalOpen(true)}
                    style={{ background: '#1B3A5C', border: 'none' }}
                  >
                    Tạo tham số đầu tiên
                  </Button>
                </Empty>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {/* Pending SP notice */}
              {pendingSP && (
                <Alert
                  type={pendingSP.status === 'pending_approval' ? 'warning' : 'info'}
                  showIcon
                  message={
                    <Text strong style={{ fontSize: 12 }}>
                      {pendingSP.status === 'pending_approval' ? 'Đang chờ phê duyệt' : 'Có bản nháp'}
                    </Text>
                  }
                  description={
                    <div style={{ fontSize: 12 }}>
                      <div>Hồ sơ <Tag style={{ fontFamily: 'monospace', fontSize: 10 }}>{pendingSP.code}</Tag></div>
                      <div style={{ marginTop: 4 }}>
                        Min: <strong>{formatNumber(pendingSP.minStock)}</strong> /
                        Max: <strong>{formatNumber(pendingSP.maxStock)}</strong> /
                        Reorder: <strong>{formatNumber(pendingSP.reorderPoint)}</strong>
                      </div>
                    </div>
                  }
                  style={{ borderRadius: 10 }}
                />
              )}

              <Card
                style={{ borderRadius: 12, border: '1px solid #e8f4e8', background: '#f6ffed' }}
                styles={{ body: { padding: '16px 18px' } }}
              >
                <Text strong style={{ fontSize: 12, color: '#389e0d', display: 'block', marginBottom: 8 }}>
                  Luồng phê duyệt tham số
                </Text>
                {[
                  { step: '1', text: 'Trưởng phòng HCKT tạo hồ sơ tham số mới' },
                  { step: '2', text: 'Gửi lên Trưởng phòng phê duyệt (không cần BGĐ)' },
                  { step: '3', text: 'Sau khi duyệt, tham số được áp dụng tự động' },
                  { step: '4', text: 'Lịch sử các phiên bản được lưu đầy đủ' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>{item.step}</div>
                    <Text style={{ fontSize: 11, color: '#595959', lineHeight: 1.6 }}>{item.text}</Text>
                  </div>
                ))}
              </Card>

              <Button
                block
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setSpModalOpen(true)}
                disabled={!!pendingSP}
                style={{ background: '#1B3A5C', border: 'none', borderRadius: 8, height: 38 }}
              >
                Tạo hồ sơ tham số mới
              </Button>
              {pendingSP && (
                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
                  Đang có hồ sơ {pendingSP.status === 'pending_approval' ? 'chờ duyệt' : 'nháp'} — hoàn thiện trước khi tạo mới
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {/* History table */}
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ color: '#1B3A5C' }} />
              <Text strong style={{ color: '#1B3A5C' }}>Lịch sử phiên bản tham số</Text>
              <Badge count={spHistory.length} style={{ backgroundColor: '#e8f0fe', color: '#1B3A5C', fontSize: 11 }} />
            </Space>
          }
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          {spHistory.length > 0 ? (
            <Table
              dataSource={spHistory.map((r) => ({ ...r, key: r.id }))}
              columns={spColumns}
              pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}` }}
              size="small"
              scroll={{ x: 1100 }}
              rowClassName={(r) => r.status === 'applied' ? '' : 'ant-table-row-selected'}
            />
          ) : (
            <div style={{ padding: 32 }}>
              <Empty description="Chưa có lịch sử tham số tồn kho" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </Card>

        {/* Create new SP modal */}
        <Modal
          title={
            <Space>
              <StockOutlined style={{ color: '#1B3A5C' }} />
              <span>Tạo hồ sơ tham số tồn kho mới</span>
            </Space>
          }
          open={spModalOpen}
          onCancel={() => { setSpModalOpen(false); spForm.resetFields(); }}
          footer={null}
          width={520}
        >
          <Form
            form={spForm}
            layout="vertical"
            onFinish={(vals) => {
              const errors = validateStockParameters(vals.minStock, vals.maxStock, vals.reorderPoint);
              const hardErrors = errors.filter(e => e.type === 'error');
              if (hardErrors.length > 0) {
                hardErrors.forEach(e => message.error(e.message));
                return;
              }
              message.success('Đã tạo hồ sơ tham số — chờ Trưởng phòng phê duyệt');
              setSpModalOpen(false);
              spForm.resetFields();
            }}
          >
            <Alert
              type="info"
              showIcon
              message="Hồ sơ sẽ được gửi lên Trưởng phòng HCKT phê duyệt (không cần BGĐ)"
              style={{ marginBottom: 16, borderRadius: 8, fontSize: 12 }}
            />
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  name="minStock"
                  label={<span style={{ fontSize: 13 }}>Tối thiểu <span style={{ color: '#ff4d4f' }}>*</span></span>}
                  rules={[{ required: true, message: 'Nhập mức tối thiểu' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} addonAfter={product.baseUnit} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="reorderPoint"
                  label={<span style={{ fontSize: 13 }}>Điểm đặt lại <span style={{ color: '#ff4d4f' }}>*</span></span>}
                  rules={[{ required: true, message: 'Nhập điểm đặt hàng lại' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} addonAfter={product.baseUnit} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maxStock"
                  label={<span style={{ fontSize: 13 }}>Tối đa <span style={{ color: '#ff4d4f' }}>*</span></span>}
                  rules={[{ required: true, message: 'Nhập mức tối đa' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} addonAfter={product.baseUnit} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="effectiveFrom"
              label={<span style={{ fontSize: 13 }}>Ngày hiệu lực <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[{ required: true, message: 'Chọn ngày hiệu lực' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày..." />
            </Form.Item>
            <Form.Item
              name="changeReason"
              label={<span style={{ fontSize: 13 }}>Lý do thay đổi <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[{ required: true, message: 'Nhập lý do' }, { min: 10, message: 'Tối thiểu 10 ký tự' }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả lý do điều chỉnh tham số tồn kho..." showCount maxLength={300} />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button onClick={() => { setSpModalOpen(false); spForm.resetFields(); }}>Hủy</Button>
              <Button
                htmlType="submit"
                style={{ background: '#1B3A5C', border: 'none', color: '#fff' }}
                icon={<SendOutlined />}
              >
                Lưu & Gửi duyệt
              </Button>
            </div>
          </Form>
        </Modal>
      </Space>
    );
  };

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  const tabItems = [
    { key: 'info',         label: <span><AppstoreOutlined style={{ marginRight: 5 }} />Thông tin chung</span>,       children: renderInfoTab() },
    { key: 'storage',      label: <span><DatabaseOutlined style={{ marginRight: 5 }} />Thuộc tính kho</span>,        children: renderStorageTab() },
    { key: 'units',        label: <span><SwapOutlined style={{ marginRight: 5 }} />Đơn vị & Quy đổi</span>,         children: renderUnitsTab() },
    { key: 'stock',        label: <span><EnvironmentOutlined style={{ marginRight: 5 }} />Tồn kho & Truy vết</span>, children: renderStockTab() },
    {
      key: 'stock-params',
      label: (
        <span>
          <StockOutlined style={{ marginRight: 5 }} />
          Tham số tồn kho
          {spHistory.some(r => r.status === 'pending_approval') && (
            <Badge dot style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
      children: renderStockParamsTab(),
    },
    { key: 'approval',     label: <span><AuditOutlined style={{ marginRight: 5 }} />Phê duyệt & Công bố</span>,     children: renderApprovalTab() },
    { key: 'history',      label: <span><ClockCircleOutlined style={{ marginRight: 5 }} />Lịch sử thay đổi</span>,  children: renderHistoryTab() },
  ];

  return (
    <div style={{ padding: 0 }}>

      {/* ─── Header Banner ──────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: product.status === 'inactive' ? 16 : 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle" gutter={[0, 12]}>
          <Col flex="auto">
            <Space size={12} align="center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/products')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={12}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ToolOutlined style={{ color: '#fff', fontSize: 20 }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>{product.name}</Title>
                  <Space size={6} style={{ marginTop: 6 }} wrap>
                    <Tag style={{ fontFamily: 'monospace', fontWeight: 700, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 12 }}>
                      {product.code}
                    </Tag>
                    <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                    <Tag color={trackConfig.color}>{trackConfig.label}</Tag>
                    <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                    {product.militaryGrade && <Tag color="purple"><SafetyCertificateOutlined /> MIL</Tag>}
                  </Space>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space size={8}>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/products/${id}/edit`)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              >
                Chỉnh sửa
              </Button>
              {product.status !== 'inactive' ? (
                <Button
                  icon={<StopOutlined />}
                  onClick={handleDeactivate}
                  danger
                  style={{ borderRadius: 8 }}
                >
                  Vô hiệu hóa
                </Button>
              ) : (
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={handleActivate}
                  style={{ background: 'rgba(82,196,26,0.2)', border: '1px solid rgba(82,196,26,0.4)', color: '#b7eb8f', borderRadius: 8 }}
                >
                  Kích hoạt lại
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* ─── Status banner khi inactive ─────────────────────────── */}
      {product.status === 'inactive' && (
        <Alert
          type="warning"
          showIcon
          icon={<StopOutlined />}
          message={<Text strong>Vật tư đã ngừng sử dụng</Text>}
          description={`Vật tư "${product.name}" đã được vô hiệu hóa. Không thể sử dụng trong các giao dịch mới. ${totalOnHand > 0 ? `Hiện còn ${formatNumber(totalOnHand)} ${product.baseUnit} trong kho.` : ''}`}
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* ─── Summary stat cards ─────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Tồn hiện có', value: totalOnHand, suffix: product.baseUnit,
            gradient: `linear-gradient(135deg, ${stockColor === '#ff4d4f' ? '#a8071a, #ff4d4f' : stockColor === '#722ed1' ? '#391085, #722ed1' : '#237804, #52c41a'})`,
            icon: <DatabaseOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Tồn khả dụng', value: totalAvailable, suffix: product.baseUnit,
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Đang giữ / Reserve', value: totalReserved, suffix: product.baseUnit,
            gradient: 'linear-gradient(135deg, #d48806, #faad14)',
            icon: <ClockCircleOutlined style={{ fontSize: 64 }} />,
          },
          {
            label: 'Kho đang có tồn', value: warehouseCount, suffix: 'kho',
            gradient: 'linear-gradient(135deg, #531dab, #722ed1)',
            icon: <EnvironmentOutlined style={{ fontSize: 64 }} />,
          },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, borderRadius: 14, border: 'none', position: 'relative', overflow: 'hidden' }}
              styles={{ body: { padding: '18px 20px', position: 'relative', zIndex: 1 } }}
            >
              <div className="db-bg-icon" style={{ position: 'absolute', top: 8, right: 12, color: 'rgba(255,255,255,0.1)', fontSize: 64, zIndex: 0 }}>
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{card.label}</Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{formatNumber(card.value)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>{card.suffix}</span>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Tabs ───────────────────────────────────────────────── */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: 'none' }}
        styles={{ body: { padding: '0 4px 4px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ padding: '0 16px' }}
        />
      </Card>
    </div>
  );
};

export default ProductDetail;
