import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Row, Col, Input, Select, Space, Button,
  Drawer, Form, Dropdown, Empty, Tabs, message, Badge,
  Modal, Descriptions, Table,
} from 'antd';
import {
  FileTextOutlined, SearchOutlined, EyeOutlined, PlusOutlined,
  MoreOutlined, SendOutlined, CheckCircleOutlined, InboxOutlined,
  EditOutlined, EnvironmentOutlined, ToolOutlined, DollarOutlined,
  CarryOutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { materialRequests } from '../../data/materialRequests';
import { workOrders } from '../../data/workOrders';
import {
  materialRequestStatusConfig, workOrderStatusConfig,
  formatDate, formatCurrency,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { MaterialRequest, MaterialRequestStatus, MaterialRequestItem } from '../../types';

const { TextArea } = Input;

const pageStyles = `
  .mr-stat-card {
    position: relative; overflow: hidden; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px !important;
  }
  .mr-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .mr-stat-card:hover .stat-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .stat-bg-icon {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .section-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
  }
  .section-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1);
  }
  .status-tab .ant-tabs-tab { font-weight: 500; }
  .status-tab .ant-tabs-tab-active { font-weight: 700; }
  .mr-row {
    border-radius: 0; border: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer; overflow: hidden;
  }
  .mr-row:hover {
    background: #f8fafc !important;
    box-shadow: 0 2px 8px rgba(27,58,92,0.06);
  }
`;

/* ─── Stat Card ─── */
const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="mr-stat-card"
    style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '20px 20px 16px' } }}
  >
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>
            {value}
            {suffix && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
    </div>
    <div className="stat-bg-icon" style={{
      position: 'absolute', top: 12, right: 16,
      fontSize: 64, color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
    }}>
      {icon}
    </div>
  </Card>
);

/* ─── Section Header ─── */
const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div style={{
    fontSize: 14, fontWeight: 700, color: colors.navy,
    paddingBottom: 10, marginBottom: 16, marginTop: 4,
    borderBottom: `2px solid ${colors.navy}15`,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    {icon && <span style={{ fontSize: 15, color: colors.navyLight }}>{icon}</span>}
    {title}
  </div>
);

/* ─── Border color per status ─── */
const getStatusBorderColor = (status: MaterialRequestStatus): string => {
  const map: Record<MaterialRequestStatus, string> = {
    draft: '#8c8c8c',
    submitted: '#1890ff',
    approved: '#13c2c2',
    issuing: '#fa8c16',
    received: '#52c41a',
    rejected: '#ff4d4f',
  };
  return map[status];
};

/* ─── New item row type ─── */
interface NewItemRow {
  name: string;
  code: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
}

const MaterialRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [drawerItems, setDrawerItems] = useState<NewItemRow[]>([]);
  const [newItem, setNewItem] = useState<NewItemRow>({ name: '', code: '', quantity: 1, unit: 'cái', estimatedPrice: 0 });

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  // Counts
  const counts = useMemo(() => {
    const all = materialRequests.length;
    const draft = materialRequests.filter(r => r.status === 'draft').length;
    const submitted = materialRequests.filter(r => r.status === 'submitted').length;
    const approved = materialRequests.filter(r => r.status === 'approved').length;
    const issuing = materialRequests.filter(r => r.status === 'issuing').length;
    const received = materialRequests.filter(r => r.status === 'received').length;
    const rejected = materialRequests.filter(r => r.status === 'rejected').length;
    return { all, draft, submitted, approved, issuing, received, rejected };
  }, []);

  // Eligible work orders for creating new material request
  const eligibleWOs = useMemo(() => {
    return workOrders.filter(wo => wo.status === 'approved' || wo.status === 'in_progress');
  }, []);

  // Selected work order info
  const selectedWO = useMemo(() => {
    if (!selectedWOId) return null;
    return workOrders.find(wo => wo.id === selectedWOId) || null;
  }, [selectedWOId]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return materialRequests.filter(r => {
      const matchSearch = !searchText ||
        r.code.toLowerCase().includes(searchText.toLowerCase()) ||
        r.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.workOrderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        r.unitName.toLowerCase().includes(searchText.toLowerCase());
      const matchTab = activeTab === 'all' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [searchText, activeTab]);

  // Open detail modal
  const openDetail = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  // Open create drawer
  const openCreateDrawer = () => {
    form.resetFields();
    setSelectedWOId(null);
    setDrawerItems([]);
    setNewItem({ name: '', code: '', quantity: 1, unit: 'cái', estimatedPrice: 0 });
    setDrawerOpen(true);
  };

  // Add item row in drawer
  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      message.warning('Vui lòng nhập tên vật tư');
      return;
    }
    if (!newItem.code.trim()) {
      message.warning('Vui lòng nhập mã vật tư');
      return;
    }
    setDrawerItems(prev => [...prev, { ...newItem }]);
    setNewItem({ name: '', code: '', quantity: 1, unit: 'cái', estimatedPrice: 0 });
  };

  // Remove item row
  const handleRemoveItem = (index: number) => {
    setDrawerItems(prev => prev.filter((_, i) => i !== index));
  };

  // Submit create form
  const handleCreate = () => {
    if (!selectedWOId) {
      message.warning('Vui lòng chọn lệnh sửa chữa');
      return;
    }
    if (drawerItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất 1 vật tư');
      return;
    }
    message.success('Đã tạo phiếu yêu cầu vật tư thành công');
    setDrawerOpen(false);
  };

  // Dropdown menu per status
  const getActionMenu = (record: MaterialRequest) => {
    const items: {
      key: string;
      icon?: React.ReactNode;
      label: string | React.ReactNode;
      onClick?: () => void;
      type?: 'divider';
      danger?: boolean;
    }[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => openDetail(record),
      },
    ];

    if (record.status === 'draft') {
      items.push({ key: 'div1', type: 'divider', label: '' });
      items.push({
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Sửa phiếu',
        onClick: () => message.info('Mở chỉnh sửa phiếu yêu cầu'),
      });
      items.push({
        key: 'send',
        icon: <SendOutlined style={{ color: '#1890ff' }} />,
        label: <span style={{ color: '#1890ff', fontWeight: 500 }}>Gửi yêu cầu kho</span>,
        onClick: () => message.success('Đã gửi yêu cầu sang phân hệ Kho'),
      });
    } else if (record.status === 'approved') {
      items.push({ key: 'div1', type: 'divider', label: '' });
      items.push({
        key: 'confirm-issue',
        icon: <InboxOutlined style={{ color: '#fa8c16' }} />,
        label: <span style={{ color: '#fa8c16', fontWeight: 500 }}>Xác nhận cấp phát</span>,
        onClick: () => message.success('Đã xác nhận bắt đầu cấp phát vật tư'),
      });
    } else if (record.status === 'issuing') {
      items.push({ key: 'div1', type: 'divider', label: '' });
      items.push({
        key: 'confirm-received',
        icon: <CheckCircleOutlined style={{ color: colors.success }} />,
        label: <span style={{ color: colors.success, fontWeight: 500 }}>Xác nhận đã nhận</span>,
        onClick: () => message.success('Đã xác nhận nhận đủ vật tư'),
      });
    } else if (record.status === 'rejected') {
      items.push({ key: 'div1', type: 'divider', label: '' });
      items.push({
        key: 'resend',
        icon: <SendOutlined style={{ color: '#1890ff' }} />,
        label: <span style={{ color: '#1890ff', fontWeight: 500 }}>Gửi lại kho</span>,
        onClick: () => message.success('Đã gửi lại yêu cầu sang phân hệ Kho tàng'),
      });
    }

    return items;
  };

  // Tab items
  const tabItems = [
    { key: 'all', label: <span>Tất cả <Badge count={counts.all} style={{ backgroundColor: colors.navy, marginLeft: 6 }} size="small" /></span> },
    { key: 'draft', label: <span>Nháp <Badge count={counts.draft} style={{ backgroundColor: '#8c8c8c', marginLeft: 6 }} size="small" showZero /></span> },
    { key: 'submitted', label: <span>Đã gửi kho <Badge count={counts.submitted} style={{ backgroundColor: '#1890ff', marginLeft: 6 }} size="small" showZero /></span> },
    { key: 'approved', label: <span>Kho đã duyệt <Badge count={counts.approved} style={{ backgroundColor: '#13c2c2', marginLeft: 6 }} size="small" showZero /></span> },
    { key: 'issuing', label: <span>Đang cấp phát <Badge count={counts.issuing} style={{ backgroundColor: '#fa8c16', marginLeft: 6 }} size="small" showZero /></span> },
    { key: 'received', label: <span>Đã nhận <Badge count={counts.received} style={{ backgroundColor: colors.success, marginLeft: 6 }} size="small" showZero /></span> },
  ];

  // Detail modal item columns
  const detailItemColumns = [
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name', width: 220 },
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' as const },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60 },
    {
      title: 'Đơn giá (tr)', dataIndex: 'estimatedPrice', key: 'estimatedPrice', width: 100,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
  ];

  return (
    <div>
      <style>{pageStyles}</style>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng phiếu"
            value={counts.all}
            icon={<FileTextOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
            suffix="phiếu"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Chờ kho duyệt"
            value={counts.submitted}
            icon={<SendOutlined />}
            gradient="linear-gradient(135deg, #0958d9 0%, #4096ff 100%)"
            suffix="phiếu"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đang cấp phát"
            value={counts.approved + counts.issuing}
            icon={<InboxOutlined />}
            gradient="linear-gradient(135deg, #d46b08 0%, #ffa940 100%)"
            suffix="phiếu"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đã nhận"
            value={counts.received}
            icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
            suffix="phiếu"
          />
        </Col>
      </Row>

      {/* Main Card */}
      <Card className="section-card" styles={{ body: { padding: 20 } }}>
        {/* Card Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16,
            }}>
              <InboxOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>Yêu cầu vật tư</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Quản lý yêu cầu xuất kho vật tư liên kết phân hệ Kho (pkkq-kho)</div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div style={{
          padding: '10px 16px', marginBottom: 16, borderRadius: 8,
          background: '#e6f7ff', border: '1px solid #91d5ff',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1a1a2e',
        }}>
          <InboxOutlined style={{ color: '#1890ff', fontSize: 15 }} />
          <span>Phiếu yêu cầu vật tư được <b>tạo tự động</b> khi lệnh sửa chữa được phê duyệt, dựa trên danh sách vật tư trong lệnh SC. Liên kết phân hệ <b>Quản lý Kho (pkkq-kho)</b>.</span>
        </div>

        {/* Tabs */}
        <Tabs
          className="status-tab"
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key); }}
          items={tabItems}
          style={{ marginBottom: 12 }}
        />

        {/* Search */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={10}>
            <Input
              placeholder="Tìm kiếm mã phiếu, tên thiết bị, mã lệnh SC, đơn vị..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        {/* List view */}
        {filteredRequests.length > 0 ? (
          <div style={{ border: '1px solid #eef0f3', borderRadius: 10, overflow: 'hidden' }}>
            {/* List header */}
            <div style={{ background: '#f5f7fa', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #eef0f3' }}>
              <div style={{ width: 28 }} />
              <div style={{ flex: 3, fontSize: 12, fontWeight: 600, color: colors.navy }}>Phiếu yêu cầu</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Lệnh SC</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Đơn vị</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Vật tư / Chi phí</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>Trạng thái</div>
              <div style={{ width: 36 }} />
            </div>

            {/* List rows */}
            {filteredRequests.map((req, idx) => {
              const statusCfg = materialRequestStatusConfig[req.status];
              const borderColor = getStatusBorderColor(req.status);

              return (
                <div key={req.id}
                  className="mr-row"
                  onClick={() => openDetail(req)}
                  style={{
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: idx < filteredRequests.length - 1 ? '1px solid #f5f5f5' : 'none',
                    background: '#fff',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `${borderColor}15`, color: borderColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 3, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: colors.navy }}>{req.code}</div>
                    <div style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {req.equipmentName}
                    </div>
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <span style={{ fontSize: 12, color: colors.navy, fontWeight: 500 }}>{req.workOrderCode}</span>
                  </div>
                  <div style={{ flex: 1.5, fontSize: 12, color: '#555' }}>{req.unitName}</div>
                  <div style={{ flex: 1.5 }}>
                    <div style={{ fontSize: 12, color: '#555' }}>
                      {req.items.length} vật tư
                      <span style={{ margin: '0 4px', color: '#d9d9d9' }}>|</span>
                      <span style={{ fontWeight: 600, color: colors.navy }}>{formatCurrency(req.totalEstimatedCost)}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>{statusCfg.label}</Tag>
                  </div>
                  <div style={{ width: 36, textAlign: 'center' }}>
                    <Dropdown menu={{ items: getActionMenu(req) as never[] }} trigger={['click']} placement="bottomRight">
                      <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    </Dropdown>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="Không có phiếu yêu cầu nào phù hợp" style={{ padding: '40px 0' }} />
        )}
      </Card>

      {/* ═══ Detail Drawer ═══ */}
      <Drawer
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        width={780}
        title={null}
        styles={{ header: { display: 'none' }, body: { padding: 0 },
          footer: { borderTop: '1px solid #eef0f3', padding: '12px 24px' } }}
        footer={
          selectedRequest && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {selectedRequest.status === 'draft' && (
                <Button type="primary" icon={<SendOutlined />}
                  onClick={() => { message.success('Đã gửi yêu cầu sang phân hệ Kho'); setDetailModalOpen(false); }}
                  style={{ background: '#1890ff' }}>
                  Gửi yêu cầu kho
                </Button>
              )}
              {selectedRequest.status === 'issuing' && (
                <Button type="primary" icon={<CheckCircleOutlined />}
                  onClick={() => { message.success('Đã xác nhận nhận đủ vật tư'); setDetailModalOpen(false); }}
                  style={{ background: colors.success }}>
                  Xác nhận đã nhận
                </Button>
              )}
              <Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>
            </div>
          )
        }
      >
        {/* Navy gradient header */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, flexShrink: 0,
          }}>
            <InboxOutlined />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, lineHeight: '22px' }}>
              Chi tiết yêu cầu vật tư
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: '18px' }}>
              {selectedRequest?.code} — {selectedRequest?.equipmentName}
            </div>
          </div>
          {selectedRequest && (
            <Tag color={materialRequestStatusConfig[selectedRequest.status].color}
              style={{ fontSize: 13, padding: '2px 12px', margin: 0 }}>
              {materialRequestStatusConfig[selectedRequest.status].label}
            </Tag>
          )}
        </div>

        {selectedRequest && (
          <div style={{ padding: '20px 24px' }}>
            {/* Thông tin phiếu */}
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã phiếu">
                <span style={{ fontWeight: 700, color: colors.navy }}>{selectedRequest.code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Lệnh SC">
                <a onClick={() => { setDetailModalOpen(false); navigate(`/work-orders/${selectedRequest.workOrderId}`); }}
                  style={{ color: colors.navy, fontWeight: 600, cursor: 'pointer' }}>
                  {selectedRequest.workOrderCode}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị">{selectedRequest.equipmentName}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị">{selectedRequest.unitName}</Descriptions.Item>
              <Descriptions.Item label="Tổng chi phí dự kiến">
                <span style={{ fontWeight: 700, color: colors.navy }}>{formatCurrency(selectedRequest.totalEstimatedCost)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Người yêu cầu">{selectedRequest.requestedBy}</Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">{selectedRequest.requestedDate ? formatDate(selectedRequest.requestedDate) : '—'}</Descriptions.Item>
              {selectedRequest.approvedBy ? (
                <Descriptions.Item label="Kho duyệt bởi">{selectedRequest.approvedBy}</Descriptions.Item>
              ) : <Descriptions.Item label="Kho duyệt bởi">—</Descriptions.Item>}
              {selectedRequest.approvedDate ? (
                <Descriptions.Item label="Ngày duyệt">{formatDate(selectedRequest.approvedDate)}</Descriptions.Item>
              ) : <Descriptions.Item label="Ngày duyệt">—</Descriptions.Item>}
              {selectedRequest.issuedBy ? (
                <Descriptions.Item label="Người xuất kho">{selectedRequest.issuedBy}</Descriptions.Item>
              ) : <Descriptions.Item label="Người xuất kho">—</Descriptions.Item>}
              {selectedRequest.receivedBy ? (
                <Descriptions.Item label="Người nhận">{selectedRequest.receivedBy}</Descriptions.Item>
              ) : <Descriptions.Item label="Người nhận">—</Descriptions.Item>}
              {selectedRequest.warehouseNote && (
                <Descriptions.Item label="Ghi chú từ kho" span={2}>{selectedRequest.warehouseNote}</Descriptions.Item>
              )}
              {selectedRequest.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>{selectedRequest.notes}</Descriptions.Item>
              )}
            </Descriptions>

            {/* Items table */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.navy, marginBottom: 10 }}>
                Danh sách vật tư ({selectedRequest.items.length})
              </div>
              <Table
                dataSource={selectedRequest.items}
                columns={detailItemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
              />
            </div>

            {/* Info box */}
            {selectedRequest.status === 'submitted' && (
              <div style={{
                background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8,
                padding: '12px 16px', fontSize: 13, color: '#0050b3',
              }}>
                <SendOutlined style={{ marginRight: 8 }} />
                Phiếu đã được gửi sang phân hệ <b>Quản lý Kho (pkkq-kho)</b>. Đang chờ kho duyệt.
              </div>
            )}
            {selectedRequest.status === 'issuing' && (
              <div style={{
                background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8,
                padding: '12px 16px', fontSize: 13, color: '#ad6800',
              }}>
                <InboxOutlined style={{ marginRight: 8 }} />
                Kho đang cấp phát vật tư. Vui lòng đến kho để nhận.
              </div>
            )}
            {selectedRequest.status === 'approved' && (
              <div style={{
                background: '#e6fffb', border: '1px solid #87e8de', borderRadius: 8,
                padding: '12px 16px', fontSize: 13, color: '#006d75',
              }}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Kho đã duyệt yêu cầu. Đang chuẩn bị cấp phát vật tư.
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MaterialRequestsPage;
