import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Row, Col, Typography, Input, Select, App, Dropdown, Tooltip,
} from 'antd';
import {
  AppstoreAddOutlined, SearchOutlined, FilterOutlined, ReloadOutlined,
  MoreOutlined, EyeOutlined, EditOutlined, SendOutlined,
  CheckCircleOutlined, CloseCircleOutlined, RollbackOutlined,
  DatabaseOutlined, ClockCircleOutlined, StopOutlined, AuditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { productClassifications } from '../../data/productClassifications';
import { products } from '../../data/products';
import {
  classificationStatusConfig, productTypeConfig, trackingTypeConfig, formatDateTime,
} from '../../utils/format';
import type { ProductClassificationRecord, ClassificationStatus, ProductType } from '../../types';

const { Text, Title } = Typography;

// ─── Stat card gradient map ───────────────────────────────
const statCards = [
  {
    label: 'Chưa phân loại',
    gradient: 'linear-gradient(135deg, #595959, #8c8c8c)',
    icon: <DatabaseOutlined style={{ fontSize: 64 }} />,
  },
  {
    label: 'Đang xử lý',
    gradient: 'linear-gradient(135deg, #d48806, #faad14)',
    icon: <ClockCircleOutlined style={{ fontSize: 64 }} />,
  },
  {
    label: 'Đã áp dụng',
    gradient: 'linear-gradient(135deg, #237804, #52c41a)',
    icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
  },
  {
    label: 'Bị từ chối',
    gradient: 'linear-gradient(135deg, #a8071a, #ff4d4f)',
    icon: <StopOutlined style={{ fontSize: 64 }} />,
  },
];

const ProductClassifications: React.FC = () => {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  // ─── Local state ──────────────────────────────────────
  const [records, setRecords] = useState<ProductClassificationRecord[]>(productClassifications);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ClassificationStatus | undefined>(undefined);
  const [filterType, setFilterType] = useState<ProductType | undefined>(undefined);

  // ─── Summary stats ────────────────────────────────────
  const stats = useMemo(() => {
    // Count products not yet classified (active products without a classification record)
    const classifiedProductIds = new Set(records.map(r => r.productId));
    const unclassifiedCount = products.filter(p => !classifiedProductIds.has(p.id)).length;
    const pending = records.filter(r =>
      r.classificationStatus === 'pending_approval' || r.classificationStatus === 'returned_for_edit' || r.classificationStatus === 'draft'
    ).length;
    const applied = records.filter(r => r.classificationStatus === 'applied').length;
    const rejected = records.filter(r => r.classificationStatus === 'rejected').length;
    return { unclassified: unclassifiedCount, pending, applied, rejected };
  }, [records]);

  const statValues = [stats.unclassified, stats.pending, stats.applied, stats.rejected];

  // ─── Unclassified products rows ───────────────────────
  const unclassifiedProducts = useMemo(() => {
    const classifiedIds = new Set(records.map(r => r.productId));
    return products
      .filter(p => !classifiedIds.has(p.id))
      .map(p => ({
        id: `UNCL-${p.id}`,
        code: '',
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        productCategory: p.category,
        classificationStatus: 'not_classified' as ClassificationStatus,
        productType: p.productType,
        trackingType: p.trackingType,
        version: 0,
        createdBy: '—',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        // fill required ManagementAttributes with defaults
        trackExpiry: false, shelfLife: null, qcRequiredOnReceipt: false,
        qcRequiredOnDispatch: false, requiresMaintenance: false,
        maintenanceIntervalDays: null, criticalPart: false,
        militaryGrade: p.militaryGrade ?? false,
        minStock: p.minStock, maxStock: p.maxStock, reorderPoint: p.reorderPoint,
        classificationReason: '', submittedBy: null, submittedAt: null,
        approvedBy: null, approvedAt: null, approvalNote: null, appliedAt: null,
        note: null, auditLog: [],
      }));
  }, [records]);

  // ─── Combined + filtered list ─────────────────────────
  const allRows = useMemo<ProductClassificationRecord[]>(() => {
    return [...records, ...unclassifiedProducts] as ProductClassificationRecord[];
  }, [records, unclassifiedProducts]);

  const filtered = useMemo(() => {
    return allRows.filter(r => {
      const matchSearch = !searchText ||
        r.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        (r.code && r.code.toLowerCase().includes(searchText.toLowerCase()));
      const matchStatus = !filterStatus || r.classificationStatus === filterStatus;
      const matchType = !filterType || r.productType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [allRows, searchText, filterStatus, filterType]);

  // ─── Handlers ────────────────────────────────────────
  const handleSubmit = (record: ProductClassificationRecord) => {
    modal.confirm({
      title: 'Trình phê duyệt',
      content: (
        <span>
          Trình phê duyệt phân loại vật tư <strong>{record.productName}</strong> ({record.productCode})?
          <br /><span style={{ color: '#888', fontSize: 13 }}>Sau khi trình, bạn không thể chỉnh sửa cho đến khi có phản hồi.</span>
        </span>
      ),
      okText: 'Trình phê duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        setRecords(prev => prev.map(r =>
          r.id === record.id
            ? { ...r, classificationStatus: 'pending_approval', submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : r
        ));
        message.success('Đã trình phê duyệt thành công');
      },
    });
  };

  const handleApprove = (record: ProductClassificationRecord) => {
    modal.confirm({
      title: 'Phê duyệt phân loại',
      content: (
        <span>
          Phê duyệt phân loại vật tư <strong>{record.productName}</strong>?
          <br /><span style={{ color: '#888', fontSize: 13 }}>Sau khi phê duyệt, hệ thống sẽ tự động áp dụng vào danh mục.</span>
        </span>
      ),
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        setRecords(prev => prev.map(r =>
          r.id === record.id
            ? {
                ...r,
                classificationStatus: 'applied',
                approvedBy: 'Phạm Quốc Hưng',
                approvedAt: new Date().toISOString(),
                appliedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : r
        ));
        message.success('Đã phê duyệt và áp dụng phân loại');
      },
    });
  };

  const handleReject = (record: ProductClassificationRecord) => {
    let rejectNote = '';
    modal.confirm({
      title: 'Từ chối phân loại',
      content: (
        <div>
          <p>Từ chối phân loại vật tư <strong>{record.productName}</strong>?</p>
          <Input.TextArea
            placeholder="Lý do từ chối (bắt buộc)..."
            rows={3}
            onChange={e => { rejectNote = e.target.value; }}
          />
        </div>
      ),
      okText: 'Từ chối',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        if (!rejectNote.trim()) {
          message.error('Vui lòng nhập lý do từ chối');
          return Promise.reject();
        }
        setRecords(prev => prev.map(r =>
          r.id === record.id
            ? {
                ...r,
                classificationStatus: 'rejected',
                approvedBy: 'Phạm Quốc Hưng',
                approvedAt: new Date().toISOString(),
                approvalNote: rejectNote,
                updatedAt: new Date().toISOString(),
              }
            : r
        ));
        message.success('Đã từ chối phân loại');
      },
    });
  };

  const handleReturn = (record: ProductClassificationRecord) => {
    let returnNote = '';
    modal.confirm({
      title: 'Trả lại để chỉnh sửa',
      content: (
        <div>
          <p>Trả lại hồ sơ phân loại <strong>{record.productName}</strong> để bổ sung?</p>
          <Input.TextArea
            placeholder="Ghi chú yêu cầu bổ sung (bắt buộc)..."
            rows={3}
            onChange={e => { returnNote = e.target.value; }}
          />
        </div>
      ),
      okText: 'Trả lại',
      cancelText: 'Hủy',
      onOk: () => {
        if (!returnNote.trim()) {
          message.error('Vui lòng nhập ghi chú');
          return Promise.reject();
        }
        setRecords(prev => prev.map(r =>
          r.id === record.id
            ? {
                ...r,
                classificationStatus: 'returned_for_edit',
                approvalNote: returnNote,
                updatedAt: new Date().toISOString(),
              }
            : r
        ));
        message.success('Đã trả lại hồ sơ');
      },
    });
  };

  // ─── Table columns ────────────────────────────────────
  const columns: ColumnsType<ProductClassificationRecord> = [
    {
      title: 'Mã phân loại',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
      render: (code: string) =>
        code ? (
          <Text strong style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C' }}>{code}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        ),
    },
    {
      title: 'Mã VT',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (code: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      key: 'productName',
      width: 240,
      ellipsis: true,
      render: (name: string, record) => (
        <div>
          <Text style={{ fontSize: 13, fontWeight: 500, color: '#1B3A5C', cursor: 'pointer' }}
            onClick={() => record.code && navigate(`/product-classifications/${record.id}`)}
          >
            {name}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.productCategory}</Text>
        </div>
      ),
    },
    {
      title: 'Loại VT',
      dataIndex: 'productType',
      key: 'productType',
      width: 150,
      render: (type: ProductType) => {
        const cfg = productTypeConfig[type];
        return <Tag color={cfg.color} style={{ fontSize: 11, borderRadius: 4 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Theo dõi',
      dataIndex: 'trackingType',
      key: 'trackingType',
      width: 120,
      render: (type: import('../../types').TrackingType) => {
        const cfg = trackingTypeConfig[type];
        return <Tag color={cfg.color} style={{ fontSize: 11, borderRadius: 4 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái PL',
      dataIndex: 'classificationStatus',
      key: 'classificationStatus',
      width: 145,
      render: (status: ClassificationStatus) => {
        const cfg = classificationStatusConfig[status];
        return (
          <Tag
            color={cfg.color === '#1B3A5C' ? undefined : cfg.color}
            style={cfg.color === '#1B3A5C' ? { background: '#1B3A5C', color: '#fff', borderRadius: 4, fontSize: 11, border: 'none' } : { fontSize: 11, borderRadius: 4 }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Phụ trách',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 160,
      ellipsis: true,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (dt: string) => <Text style={{ fontSize: 12, color: '#888' }}>{formatDateTime(dt)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: ProductClassificationRecord) => {
        const s = record.classificationStatus;
        const menuItems = [
          ...(s !== 'not_classified' ? [{ key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' }] : []),
          ...(s === 'draft' || s === 'returned_for_edit' || s === 'not_classified'
            ? [{ key: 'edit', icon: <EditOutlined />, label: s === 'not_classified' ? 'Phân loại ngay' : 'Chỉnh sửa' }]
            : []),
          ...(s === 'draft' || s === 'returned_for_edit'
            ? [{ type: 'divider' as const }, { key: 'submit', icon: <SendOutlined />, label: 'Trình phê duyệt' }]
            : []),
          ...(s === 'pending_approval'
            ? [
                { type: 'divider' as const },
                { key: 'approve', icon: <CheckCircleOutlined />, label: 'Phê duyệt' },
                { key: 'return', icon: <RollbackOutlined />, label: 'Trả lại sửa' },
                { key: 'reject', icon: <CloseCircleOutlined />, label: 'Từ chối', danger: true },
              ]
            : []),
        ];
        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'view') navigate(`/product-classifications/${record.id}`);
                if (key === 'edit') navigate(`/product-classifications/${s === 'not_classified' ? 'new' : record.id + '/edit'}?productId=${record.productId}`);
                if (key === 'submit') handleSubmit(record);
                if (key === 'approve') handleApprove(record);
                if (key === 'reject') handleReject(record);
                if (key === 'return') handleReturn(record);
              },
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 0 }}>

      {/* ─── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AuditOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Phân loại & Thuộc tính Vật tư</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản lý phân loại và gán thuộc tính quản lý cho toàn bộ danh mục vật tư</Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<AppstoreAddOutlined />}
          onClick={() => navigate('/product-classifications/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Phân loại mới
        </Button>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{ background: card.gradient, borderRadius: 14, border: 'none', position: 'relative', overflow: 'hidden' }}
              styles={{ body: { padding: '18px 20px', position: 'relative', zIndex: 1 } }}
            >
              <div className="db-bg-icon" style={{
                position: 'absolute', top: 8, right: 12,
                color: 'rgba(255,255,255,0.1)', fontSize: 64, lineHeight: 1, zIndex: 0,
              }}>
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{card.label}</Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{statValues[idx]}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>bản ghi</span>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Filter ─────────────────────────────────────── */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder="Tìm mã VT, tên VT, mã PC..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={filterStatus}
              onChange={v => setFilterStatus(v)}
              options={[
                { value: 'not_classified', label: 'Chưa phân loại' },
                { value: 'draft', label: 'Đang soạn' },
                { value: 'pending_approval', label: 'Chờ phê duyệt' },
                { value: 'approved', label: 'Đã phê duyệt' },
                { value: 'applied', label: 'Đã áp dụng' },
                { value: 'rejected', label: 'Bị từ chối' },
                { value: 'returned_for_edit', label: 'Trả lại sửa' },
              ]}
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              placeholder="Loại vật tư"
              style={{ width: '100%' }}
              allowClear
              value={filterType}
              onChange={v => setFilterType(v)}
              options={[
                { value: 'consumable', label: 'Vật tư tiêu hao' },
                { value: 'spare_part', label: 'Linh kiện thay thế' },
                { value: 'equipment', label: 'Thiết bị' },
              ]}
            />
          </Col>
          <Col xs={24} sm={0} md={6} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setFilterStatus(undefined); setFilterType(undefined); }} />
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 12, lineHeight: '32px' }}>
              Hiển thị {filtered.length} / {allRows.length} bản ghi
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ─── Table ──────────────────────────────────────── */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={8}>
            <FilterOutlined style={{ color: '#1B3A5C' }} />
            <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Danh sách phân loại vật tư</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{filtered.length} bản ghi</Text>
        </div>
        <Table<ProductClassificationRecord>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t} bản ghi`, pageSizeOptions: ['10', '15', '20', '50'] }}
          rowClassName={(r) => r.classificationStatus === 'not_classified' ? 'ant-table-row-not-classified' : ''}
          style={{ borderRadius: 14, overflow: 'hidden' }}
        />
      </Card>

      <style>{`
        .ant-table-row-not-classified td { background: #fffbe6 !important; }
        .ant-table-row-not-classified:hover td { background: #fff1b8 !important; }
      `}</style>
    </div>
  );
};

export default ProductClassifications;
