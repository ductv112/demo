import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Typography, Row, Col,
  Tooltip, Drawer, Form, DatePicker, InputNumber, Badge,
} from 'antd';
import {
  ClockCircleOutlined, WarningOutlined, CheckCircleOutlined,
  StopOutlined, SearchOutlined, ExclamationCircleOutlined,
  RollbackOutlined, DeleteOutlined, EyeOutlined,
  FieldTimeOutlined, MoreOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { LifecycleRecord, LifecycleStatus } from '../../types';
import { lifecycleRecords } from '../../data/lifecycle';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

// ─── Status config ────────────────────────────────────────
const statusConfig: Record<LifecycleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  valid:       { label: 'Còn hạn',      color: 'success',   icon: <CheckCircleOutlined /> },
  near_expiry: { label: 'Sắp hết hạn',  color: 'warning',   icon: <WarningOutlined /> },
  expired:     { label: 'Hết hạn',      color: 'error',     icon: <ExclamationCircleOutlined /> },
  disposed:    { label: 'Đã thanh lý',  color: 'default',   icon: <DeleteOutlined /> },
  recalled:    { label: 'Đã thu hồi',   color: 'purple',    icon: <RollbackOutlined /> },
};

// ─── Stat card ────────────────────────────────────────────
interface StatCardProps { label: string; value: number; icon: React.ReactNode; gradient: string; }

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient }) => (
  <div
    style={{
      background: gradient,
      borderRadius: 12,
      padding: '18px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    }}
    className="stat-card-lc"
  >
    <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 56, opacity: 0.1 }}>
      {icon}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{label}</div>
  </div>
);

// ─── Drawer section header ────────────────────────────────
const DrawerSection: React.FC<{ title: string }> = ({ title }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: '#1B3A5C', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12, marginTop: 4,
    paddingBottom: 6, borderBottom: '1px solid #f0f0f0',
  }}>{title}</div>
);

type ActionType = 'extend' | 'recall' | 'dispose';

const actionConfig: Record<ActionType, { label: string; gradient: string; icon: React.ReactNode }> = {
  extend:  { label: 'Gia hạn sử dụng',  gradient: 'linear-gradient(135deg, #1677ff, #40a9ff)', icon: <ClockCircleOutlined /> },
  recall:  { label: 'Thu hồi vật tư',   gradient: 'linear-gradient(135deg, #d46b08, #faad14)', icon: <RollbackOutlined /> },
  dispose: { label: 'Thanh lý vật tư',  gradient: 'linear-gradient(135deg, #595959, #8c8c8c)', icon: <DeleteOutlined /> },
};

const LifecycleList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [activeRecord, setActiveRecord] = useState<LifecycleRecord | null>(null);
  const [form] = Form.useForm();

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       lifecycleRecords.length,
    valid:       lifecycleRecords.filter(r => r.status === 'valid').length,
    near_expiry: lifecycleRecords.filter(r => r.status === 'near_expiry').length,
    expired:     lifecycleRecords.filter(r => r.status === 'expired').length,
    disposed:    lifecycleRecords.filter(r => r.status === 'disposed' || r.status === 'recalled').length,
  }), []);

  // ── Warehouse options ─────────────────────────────────────
  const warehouseOptions = useMemo(() => {
    const map = new Map<string, string>();
    lifecycleRecords.forEach(r => {
      if (r.warehouseId && r.warehouseName) map.set(r.warehouseId, r.warehouseName);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, []);

  // ── Filtered data ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lifecycleRecords.filter(r => {
      const matchSearch = !q ||
        r.productCode.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.trackingCode.toLowerCase().includes(q) ||
        (r.warehouseName ?? '').toLowerCase().includes(q);
      const matchStatus    = !filterStatus    || r.status === filterStatus;
      const matchType      = !filterType      || r.trackingType === filterType;
      const matchWarehouse = !filterWarehouse || r.warehouseId === filterWarehouse;
      return matchSearch && matchStatus && matchType && matchWarehouse;
    });
  }, [search, filterStatus, filterType, filterWarehouse]);

  // ── Open action drawer ────────────────────────────────────
  const openAction = (record: LifecycleRecord, action: ActionType) => {
    setActiveRecord(record);
    setActiveAction(action);
    setDrawerOpen(true);
    form.resetFields();
  };

  const getMenuItems = (record: LifecycleRecord) => {
    const items: { key: string; label: React.ReactNode; icon: React.ReactNode; danger?: boolean }[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <EyeOutlined />,
      },
    ];

    if (record.status === 'valid' || record.status === 'near_expiry') {
      items.push({ key: 'extend', label: 'Gia hạn sử dụng', icon: <ClockCircleOutlined /> });
    }
    if (record.status === 'near_expiry' || record.status === 'expired') {
      items.push({ key: 'recall', label: 'Thu hồi', icon: <RollbackOutlined /> });
    }
    if (record.status === 'expired' || record.status === 'recalled') {
      items.push({ key: 'dispose', label: 'Thanh lý', icon: <DeleteOutlined />, danger: true });
    }

    return items;
  };

  const handleMenuClick = (key: string, record: LifecycleRecord) => {
    if (key === 'view') {
      navigate(`/lifecycle/${record.id}`);
    } else {
      openAction(record, key as ActionType);
    }
  };

  // ── Days remaining display ────────────────────────────────
  const renderDaysRemaining = (days: number, status: LifecycleStatus) => {
    if (status === 'disposed') return <Text type="secondary">—</Text>;
    if (status === 'recalled') return <Text type="secondary">Thu hồi</Text>;
    if (days < 0) return <Text type="danger" strong>Quá hạn {Math.abs(days)} ngày</Text>;
    if (days <= 30) return <Text style={{ color: '#faad14' }} strong>Còn {days} ngày</Text>;
    return <Text style={{ color: '#52c41a' }}>Còn {days} ngày</Text>;
  };

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<LifecycleRecord> = [
    {
      title: 'Vật tư',
      key: 'product',
      render: (_: unknown, r: LifecycleRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{r.productCode}</Text>
          <Text style={{ fontSize: 12 }}>{r.productName.length > 40 ? r.productName.slice(0, 40) + '…' : r.productName}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.trackingCode}</Text>
        </Space>
      ),
    },
    {
      title: 'Loại TT',
      dataIndex: 'trackingType',
      key: 'trackingType',
      width: 95,
      render: (t: string) => (
        <Tag color={t === 'serial' ? '#1B3A5C' : '#2d5a8e'} style={{ fontWeight: 500, fontSize: 11 }}>
          {t === 'serial' ? 'Serial' : 'Lô hàng'}
        </Tag>
      ),
    },
    {
      title: 'Hạn sử dụng',
      key: 'expiry',
      width: 130,
      render: (_: unknown, r: LifecycleRecord) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>
            {new Date(r.expiryDate).toLocaleDateString('vi-VN')}
          </Text>
          {renderDaysRemaining(r.daysRemaining, r.status)}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: LifecycleStatus) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Kho / Vị trí',
      key: 'warehouse',
      width: 180,
      render: (_: unknown, r: LifecycleRecord) => r.warehouseName ? (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{r.warehouseName}</Text>
          {r.location && <Text type="secondary" style={{ fontSize: 11 }}>Vị trí: {r.location}</Text>}
        </Space>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Số lượng',
      key: 'qty',
      width: 100,
      render: (_: unknown, r: LifecycleRecord) => (
        <Text style={{ fontSize: 13 }}>{r.quantity.toLocaleString('vi-VN')} {r.unit}</Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_: unknown, r: LifecycleRecord) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: getMenuItems(r),
              onClick: ({ key }) => handleMenuClick(key, r),
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Tooltip title="Thao tác">
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined style={{ fontSize: 16 }} />}
                style={{ color: '#595959' }}
              />
            </Tooltip>
          </Dropdown>
        </div>
      ),
    },
  ];

  // ── Drawer render ─────────────────────────────────────────
  const cfg = activeAction ? actionConfig[activeAction] : null;

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClockCircleOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Vòng đời & Hạn sử dụng</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Theo dõi hạn sử dụng, cảnh báo sắp hết hạn và quản lý thu hồi / thanh lý vật tư
            </Text>
          </div>
        </Space>
      </div>

      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Tổng vật tư theo dõi" value={stats.total} icon={<FieldTimeOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={8} md={4} lg={4}>
          <StatCard label="Còn hạn" value={stats.valid} icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #237804, #52c41a)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Sắp hết hạn" value={stats.near_expiry} icon={<WarningOutlined />}
            gradient="linear-gradient(135deg, #d46b08, #faad14)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Đã hết hạn" value={stats.expired} icon={<ExclamationCircleOutlined />}
            gradient="linear-gradient(135deg, #a8071a, #ff4d4f)" />
        </Col>
        <Col xs={12} sm={8} md={5} lg={5}>
          <StatCard label="Đã xử lý" value={stats.disposed} icon={<StopOutlined />}
            gradient="linear-gradient(135deg, #595959, #8c8c8c)" />
        </Col>
      </Row>

      {/* ── Filter card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8} lg={7}>
            <Search
              placeholder="Mã vật tư, tên, mã lô/serial, kho..."
              allowClear
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus || undefined}
              onChange={v => setFilterStatus(v ?? '')}
              options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Loại theo dõi"
              allowClear
              style={{ width: '100%' }}
              value={filterType || undefined}
              onChange={v => setFilterType(v ?? '')}
              options={[
                { value: 'serial', label: 'Serial' },
                { value: 'lot',    label: 'Lô hàng' },
              ]}
            />
          </Col>
          <Col xs={12} sm={8} md={5} lg={5}>
            <Select
              placeholder="Kho lưu trữ"
              allowClear
              style={{ width: '100%' }}
              value={filterWarehouse || undefined}
              onChange={v => setFilterWarehouse(v ?? '')}
              options={warehouseOptions}
            />
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <Badge color="#1B3A5C" /> {filtered.length} bản ghi
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ── Table card ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="small"
          scroll={{ x: 1050 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            pageSizeOptions: ['10', '15', '25'],
          }}
          onRow={(r) => ({
            onClick: () => navigate(`/lifecycle/${r.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* ── Action Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        width={480}
        closable={false}
        title={null}
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button
              type="primary"
              style={cfg ? { background: cfg.gradient.includes('40a9ff') ? '#1677ff' : cfg.gradient.includes('faad14') ? '#d46b08' : '#595959', border: 'none' } : {}}
              onClick={() => { setDrawerOpen(false); form.resetFields(); }}
            >
              {activeAction === 'extend' ? 'Xác nhận gia hạn' : activeAction === 'recall' ? 'Xác nhận thu hồi' : 'Xác nhận thanh lý'}
            </Button>
          </div>
        }
      >
        {cfg && activeRecord && (
          <>
            {/* Gradient header */}
            <div style={{
              background: cfg.gradient,
              padding: '20px 24px 16px',
              color: '#fff',
              borderRadius: '0 0 0 0',
            }}>
              <Space align="center" size={12}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {cfg.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{cfg.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{activeRecord.productCode} — {activeRecord.trackingCode}</div>
                </div>
              </Space>
              {/* Info bar */}
              <div style={{
                marginTop: 14, background: 'rgba(0,0,0,0.15)', borderRadius: 8,
                padding: '10px 14px', display: 'flex', gap: 24, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>TRẠNG THÁI HIỆN TẠI</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {statusConfig[activeRecord.status].label}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>HẠN SỬ DỤNG</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {new Date(activeRecord.expiryDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>SỐ NGÀY CÒN LẠI</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {activeRecord.daysRemaining < 0
                      ? `Quá hạn ${Math.abs(activeRecord.daysRemaining)} ngày`
                      : `${activeRecord.daysRemaining} ngày`}
                  </div>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding: '20px 24px' }}>
              <Form form={form} layout="vertical" size="small">

                {activeAction === 'extend' && (
                  <>
                    <DrawerSection title="Thông tin gia hạn" />
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Ngày gia hạn đến" name="newExpiryDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={d => d.isBefore(dayjs())} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Số tháng gia hạn" name="extendMonths">
                          <InputNumber min={1} max={60} style={{ width: '100%' }} addonAfter="tháng" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <DrawerSection title="Căn cứ gia hạn" />
                    <Form.Item label="Số biên bản / quyết định" name="docRef" rules={[{ required: true, message: 'Nhập số văn bản' }]}>
                      <Input placeholder="VD: BB-GH-2026-001" />
                    </Form.Item>
                    <Form.Item label="Cơ quan kiểm định" name="certBody">
                      <Input placeholder="VD: Trung tâm Đo lường Quân khu" />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="note">
                      <TextArea rows={3} placeholder="Lý do gia hạn, kết quả kiểm tra..." />
                    </Form.Item>
                  </>
                )}

                {activeAction === 'recall' && (
                  <>
                    <DrawerSection title="Thông tin thu hồi" />
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Ngày thu hồi" name="recallDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Vị trí cách ly" name="isolationLocation">
                          <Input placeholder="VD: Khu cách ly KV-01" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <DrawerSection title="Lý do & Xử lý" />
                    <Form.Item label="Lý do thu hồi" name="recallReason" rules={[{ required: true, message: 'Nhập lý do' }]}>
                      <Select options={[
                        { value: 'expired', label: 'Hết hạn sử dụng' },
                        { value: 'quality', label: 'Không đạt chất lượng' },
                        { value: 'safety',  label: 'Nguy cơ an toàn' },
                        { value: 'policy',  label: 'Theo quy định' },
                      ]} placeholder="Chọn lý do" />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="note">
                      <TextArea rows={3} placeholder="Mô tả tình trạng, phương án xử lý tiếp theo..." />
                    </Form.Item>
                  </>
                )}

                {activeAction === 'dispose' && (
                  <>
                    <DrawerSection title="Thông tin thanh lý" />
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Ngày thanh lý" name="disposeDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Phương thức" name="disposeMethod" rules={[{ required: true, message: 'Chọn phương thức' }]}>
                          <Select options={[
                            { value: 'destroy',  label: 'Tiêu hủy' },
                            { value: 'return',   label: 'Trả nhà cung cấp' },
                            { value: 'transfer', label: 'Bàn giao đơn vị khác' },
                            { value: 'recycle',  label: 'Tái chế / thu hồi vật liệu' },
                          ]} placeholder="Chọn phương thức" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <DrawerSection title="Thẩm quyền phê duyệt" />
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Số quyết định thanh lý" name="decisionRef" rules={[{ required: true, message: 'Nhập số quyết định' }]}>
                          <Input placeholder="VD: QĐ-TL-2026-015" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Người phê duyệt" name="approvedBy">
                          <Input placeholder="VD: Phạm Quốc Hưng" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="Ghi chú" name="note">
                      <TextArea rows={3} placeholder="Mô tả quá trình, kết quả thanh lý..." />
                    </Form.Item>
                  </>
                )}
              </Form>
            </div>
          </>
        )}
      </Drawer>

      <style>{`
        .stat-card-lc:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(27,58,92,0.18) !important;
        }
      `}</style>
    </div>
  );
};

export default LifecycleList;
