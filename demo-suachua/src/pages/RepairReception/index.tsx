import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Row, Col, Input, Select, Space, Button,
  Drawer, Form, Dropdown, Empty, Pagination,
  Tabs, message, Badge,
} from 'antd';
import {
  FileSearchOutlined, SearchOutlined, EyeOutlined,
  PlusOutlined, ToolOutlined, RadarChartOutlined, AlertOutlined,
  CheckCircleOutlined, SendOutlined, EditOutlined,
  ClockCircleOutlined, AppstoreOutlined,
  ArrowRightOutlined, MoreOutlined,
  EnvironmentOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { repairRequests } from '../../data/repairRequests';
import {
  repairRequestStatusConfig, repairTypeConfig, equipmentTypeConfig,
  priorityConfig, receptionSourceConfig, formatDate, formatDateTime,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type {
  RepairRequest, RepairRequestStatus, EquipmentType, Priority,
  ReceptionSource,
} from '../../types';

const { Search } = Input;
const { TextArea } = Input;

const pageStyles = `
  .reception-stat-card {
    position: relative; overflow: hidden; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px !important;
  }
  .reception-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .reception-stat-card:hover .stat-bg-icon {
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
  .step-form .ant-form-item-label > label {
    font-weight: 600; color: ${colors.navy};
  }
  .status-tab .ant-tabs-tab { font-weight: 500; }
  .status-tab .ant-tabs-tab-active { font-weight: 700; }
  .request-card {
    border-radius: 12px !important; border: 1px solid #eef0f3;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer; overflow: hidden;
  }
  .request-card:hover {
    border-color: ${colors.navy}30;
    box-shadow: 0 8px 24px rgba(27,58,92,0.10);
    transform: translateY(-2px);
  }
  .request-card .card-code {
    color: ${colors.navy}; font-weight: 700; font-size: 14px;
  }
  .request-card .card-equip {
    font-weight: 600; font-size: 13px; color: #1a1a2e;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .request-card .card-meta {
    font-size: 12px; color: #8c8c8c; display: flex; align-items: center; gap: 4px;
  }
`;

const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="reception-stat-card"
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
      position: 'absolute', top: 12, right: 16, fontSize: 64,
      color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
    }}>
      {icon}
    </div>
  </Card>
);

const RepairReception: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairRequestStatus | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<EquipmentType | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Create drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // Filtered data
  const filteredData = useMemo(() => {
    let result = repairRequests;
    if (activeTab !== 'all') {
      result = result.filter((r) => r.status === activeTab);
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) => r.code.toLowerCase().includes(lower)
          || r.equipmentName.toLowerCase().includes(lower)
          || r.unitName.toLowerCase().includes(lower),
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    if (typeFilter) result = result.filter((r) => r.equipmentType === typeFilter);
    if (priorityFilter) result = result.filter((r) => r.priority === priorityFilter);
    return result;
  }, [searchText, statusFilter, typeFilter, priorityFilter, activeTab]);

  // Stats
  const stats = useMemo(() => ({
    total: repairRequests.length,
    received: repairRequests.filter((r) => r.status === 'received').length,
    diagnosing: repairRequests.filter((r) => r.status === 'diagnosing').length,
    diagnosed: repairRequests.filter((r) => r.status === 'diagnosed').length,
    planning: repairRequests.filter((r) => r.status === 'planning').length,
    ready: repairRequests.filter((r) => r.status === 'ready').length,
  }), []);

  // Dropdown menu per status
  const getActionMenu = (record: RepairRequest) => {
    const items: any[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/repair-reception/${record.id}`),
      },
    ];

    if (record.status === 'received') {
      items.push(
        { type: 'divider' },
        {
          key: 'diagnose',
          icon: <SendOutlined style={{ color: colors.navy }} />,
          label: <span style={{ color: colors.navy, fontWeight: 500 }}>Yêu cầu chẩn đoán</span>,
          onClick: () => message.success(`Đã chuyển ${record.code} sang chẩn đoán`),
        },
      );
    }

    if (record.status === 'diagnosed') {
      items.push(
        { type: 'divider' },
        {
          key: 'plan',
          icon: <EditOutlined style={{ color: colors.success }} />,
          label: <span style={{ color: colors.success, fontWeight: 500 }}>Lập kế hoạch SC</span>,
          onClick: () => message.info(`Chuyển lập kế hoạch cho ${record.code}`),
        },
      );
    }

    if (record.status === 'ready') {
      items.push(
        { type: 'divider' },
        {
          key: 'view-wo',
          icon: <ArrowRightOutlined style={{ color: colors.navy }} />,
          label: <span style={{ color: colors.navy, fontWeight: 500 }}>Xem lệnh sửa chữa</span>,
          onClick: () => message.info(`Mở lệnh SC cho ${record.code}`),
        },
      );
    }

    return items;
  };

  // Create form handlers
  const handleCreateOpen = () => {
    setDrawerVisible(true);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue({
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: currentUser.name,
    });
  };

  const handleStepNext = () => {
    form.validateFields().then(() => {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }).catch(() => {});
  };

  const handleStepPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleCreateSubmit = () => {
    form.validateFields().then(() => {
      message.success('Đã tiếp nhận yêu cầu sửa chữa mới và chuyển sang chẩn đoán');
      setDrawerVisible(false);
      form.resetFields();
      setCurrentStep(0);
    }).catch(() => {});
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  // Priority border color
  const getPriorityBorder = (p: Priority) => {
    const map: Record<Priority, string> = {
      critical: colors.danger, high: '#fa8c16', medium: colors.navy, low: '#d9d9d9',
    };
    return map[p];
  };

  // Tab items
  const tabItems = [
    { key: 'all', label: <span>Tất cả <Badge count={stats.total} style={{ backgroundColor: colors.navy }} size="small" /></span> },
    { key: 'received', label: <span>Mới tiếp nhận <Badge count={stats.received} style={{ backgroundColor: '#1890ff' }} size="small" /></span> },
    { key: 'diagnosing', label: <span>Đang chẩn đoán <Badge count={stats.diagnosing} style={{ backgroundColor: colors.warning }} size="small" /></span> },
    { key: 'diagnosed', label: <span>Đã chẩn đoán <Badge count={stats.diagnosed} style={{ backgroundColor: '#13c2c2' }} size="small" /></span> },
    { key: 'planning', label: <span>Đang lập KH <Badge count={stats.planning} style={{ backgroundColor: '#fa8c16' }} size="small" /></span> },
    { key: 'ready', label: <span>Sẵn sàng SC <Badge count={stats.ready} style={{ backgroundColor: colors.success }} size="small" /></span> },
  ];

  // Section header component (matching reference style)
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

  // Drawer tab: Thông tin thiết bị
  const renderTabEquipment = () => (
    <>
      {/* Định danh */}
      <SectionHeader title="Định danh" icon={<FileSearchOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="equipmentName" label="Tên thiết bị" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Đài radar P-18" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="serialNumber" label="Số serial (S/N)" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
            <Input placeholder="VD: P18-2019-0042" />
          </Form.Item>
        </Col>
      </Row>

      {/* Phân loại & Nguồn */}
      <SectionHeader title="Phân loại & Nguồn tiếp nhận" icon={<AppstoreOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="equipmentType" label="Loại thiết bị" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn loại thiết bị"
              options={Object.entries(equipmentTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="unitName" label="Đơn vị gửi" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
            <Input placeholder="VD: Sư đoàn 361" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="receptionSource" label="Nguồn tiếp nhận" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn nguồn tiếp nhận"
              options={Object.entries(receptionSourceConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="priority" label="Độ ưu tiên" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn độ ưu tiên"
              options={Object.entries(priorityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Thông tin tiếp nhận */}
      <SectionHeader title="Thông tin tiếp nhận" icon={<ClockCircleOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mã yêu cầu (tự động)">
            <Input value={`YCSC-2026-0${repairRequests.length + 1}`} disabled
              style={{ fontWeight: 600, color: colors.navy, background: '#f5f7fa' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="receivedDate" label="Ngày tiếp nhận">
            <Input disabled style={{ background: '#f5f7fa' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="receivedBy" label="Người tiếp nhận">
            <Input disabled style={{ background: '#f5f7fa' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Drawer tab: Kiểm tra & Phân loại
  const renderTabInspection = () => (
    <>
      {/* Kiểm tra tình trạng */}
      <SectionHeader title="Kiểm tra tình trạng ban đầu" icon={<AlertOutlined />} />
      <Form.Item name="initialCondition" label="Mô tả tình trạng" rules={[{ required: true, message: 'Vui lòng mô tả' }]}>
        <TextArea rows={3} placeholder="Mô tả tình trạng thiết bị khi tiếp nhận&#10;VD: Không phát tín hiệu, màn hình nhiễu, đèn báo lỗi sáng" />
      </Form.Item>
      <Form.Item name="symptoms" label="Triệu chứng phát hiện" rules={[{ required: true, message: 'Vui lòng nhập triệu chứng' }]}>
        <Select mode="tags" placeholder="Nhập triệu chứng và nhấn Enter" style={{ width: '100%' }} />
      </Form.Item>

      {/* Phân loại sửa chữa */}
      <SectionHeader title="Phân loại sửa chữa" icon={<ToolOutlined />} />
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="repairType" label="Loại sửa chữa" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
            <Select placeholder="Chọn loại sửa chữa">
              <Select.Option value="small">Sửa chữa nhỏ</Select.Option>
              <Select.Option value="medium">Sửa chữa vừa</Select.Option>
              <Select.Option value="field">Sửa chữa hiện trường</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="classificationReason" label="Lý do phân loại" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
        <TextArea rows={2} placeholder="Giải thích lý do phân loại (VD: Cần tháo mô-đun để kiểm tra)" />
      </Form.Item>

      {/* Ghi chú */}
      <SectionHeader title="Ghi chú" icon={<EditOutlined />} />
      <Form.Item name="notes" label="Ghi chú bổ sung">
        <TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" />
      </Form.Item>
    </>
  );

  return (
    <>
      <style>{pageStyles}</style>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Tổng yêu cầu" value={stats.total}
            icon={<FileSearchOutlined />}
            gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`}
            suffix="yêu cầu" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Mới tiếp nhận" value={stats.received}
            icon={<AlertOutlined />}
            gradient={`linear-gradient(135deg, #1890ff, #69c0ff)`}
            suffix="yêu cầu" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Đang chẩn đoán" value={stats.diagnosing + stats.diagnosed}
            icon={<RadarChartOutlined />}
            gradient={`linear-gradient(135deg, ${colors.warning}, #ffc53d)`}
            suffix="yêu cầu" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Sẵn sàng SC" value={stats.ready}
            icon={<CheckCircleOutlined />}
            gradient={`linear-gradient(135deg, ${colors.success}, #73d13d)`}
            suffix="yêu cầu" />
        </Col>
      </Row>

      {/* Main content card */}
      <Card className="section-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15,
              }}>
                <ToolOutlined />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Tiếp nhận & Phân loại sửa chữa</div>
                <div style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>Quản lý yêu cầu sửa chữa khí tài tại Nhà máy Z119</div>
              </div>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOpen}
              style={{ background: colors.navy, fontWeight: 600 }}>
              Tiếp nhận mới
            </Button>
          </div>
        }
        style={{ borderRadius: 14 }}
      >
        {/* Status Tabs */}
        <Tabs className="status-tab" activeKey={activeTab} onChange={setActiveTab}
          items={tabItems} style={{ marginBottom: 12 }} />

        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap size="middle">
            <Search placeholder="Tìm kiếm mã, thiết bị, đơn vị..."
              allowClear onSearch={(v) => setSearchText(v)}
              onChange={(e) => { if (!e.target.value) setSearchText(''); }}
              style={{ width: 280 }}
              prefix={<SearchOutlined style={{ color: colors.navy }} />}
            />
            {activeTab === 'all' && (
              <Select placeholder="Trạng thái" allowClear style={{ width: 170 }}
                value={statusFilter} onChange={(v) => setStatusFilter(v)}
                options={Object.entries(repairRequestStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            )}
            <Select placeholder="Loại thiết bị" allowClear style={{ width: 170 }}
              value={typeFilter} onChange={(v) => setTypeFilter(v)}
              options={Object.entries(equipmentTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Select placeholder="Độ ưu tiên" allowClear style={{ width: 150 }}
              value={priorityFilter} onChange={(v) => setPriorityFilter(v)}
              options={Object.entries(priorityConfig).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Space>
        </div>

        {/* Card Grid */}
        {paginatedData.length === 0 ? (
          <Empty description="Không có yêu cầu nào" style={{ padding: 40 }} />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedData.map((record) => {
                const statusCfg = repairRequestStatusConfig[record.status];
                const typeCfg = repairTypeConfig[record.repairType];
                const eqCfg = equipmentTypeConfig[record.equipmentType];
                const prioCfg = priorityConfig[record.priority];
                const srcCfg = receptionSourceConfig[record.receptionSource];

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={record.id}>
                    <Card
                      className="request-card"
                      onClick={() => navigate(`/repair-reception/${record.id}`)}
                      styles={{ body: { padding: 0 } }}
                      style={{}}
                    >
                      {/* Card header */}
                      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="card-code">{record.code}</div>
                          <div className="card-equip" title={record.equipmentName}>{record.equipmentName}</div>
                        </div>
                        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
                          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: 28, height: 28, flexShrink: 0, marginTop: -2, marginRight: -4 }}
                          />
                        </Dropdown>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '0 16px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                          <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>{statusCfg.label}</Tag>
                          <Tag color={prioCfg.color} style={{ margin: 0, fontSize: 11 }}>{prioCfg.label}</Tag>
                          <Tag color={eqCfg.color} style={{ margin: 0, fontSize: 11 }}>{eqCfg.label}</Tag>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div className="card-meta">
                            <EnvironmentOutlined /> {record.unitName}
                          </div>
                          <div className="card-meta">
                            <CalendarOutlined /> {formatDate(record.receivedDate)}
                          </div>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div style={{
                        padding: '8px 16px', borderTop: '1px solid #f0f0f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: '#fafbfc',
                      }}>
                        <Tag color={typeCfg.color} style={{ margin: 0, fontSize: 11 }}>{typeCfg.label}</Tag>
                        <Tag style={{ margin: 0, fontSize: 11, background: 'transparent', border: '1px dashed #d9d9d9', color: '#8c8c8c' }}>
                          {srcCfg.label}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page) => setCurrentPage(page)}
                showTotal={(t) => `Tổng ${t} yêu cầu`}
                showSizeChanger={false}
                size="small"
              />
            </div>
          </>
        )}
      </Card>

      {/* Create Drawer — Tab-based form matching reference style */}
      <Drawer
        title={null}
        open={drawerVisible}
        onClose={() => { setDrawerVisible(false); setCurrentStep(0); form.resetFields(); }}
        width={780}
        styles={{
          header: { display: 'none' },
          body: { padding: 0 },
          footer: { borderTop: '1px solid #eef0f3', padding: '12px 24px' },
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setDrawerVisible(false); setCurrentStep(0); form.resetFields(); }}>
              Hủy
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSubmit}
              style={{ background: colors.navy, fontWeight: 600 }}>
              Tiếp nhận yêu cầu
            </Button>
          </div>
        }
      >
        {/* Custom header with navy background like reference */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, flexShrink: 0,
          }}>
            <PlusOutlined />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, lineHeight: '22px' }}>
              Tiếp nhận yêu cầu sửa chữa mới
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: '18px' }}>
              Đăng ký yêu cầu sửa chữa khí tài vào hệ thống
            </div>
          </div>
        </div>

        {/* Tabs inside drawer */}
        <div style={{ padding: '0 24px' }}>
          <Tabs
            activeKey={currentStep === 0 ? 'equipment' : 'inspection'}
            onChange={(key) => setCurrentStep(key === 'equipment' ? 0 : 1)}
            items={[
              {
                key: 'equipment',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileSearchOutlined />
                    Thông tin thiết bị
                  </span>
                ),
              },
              {
                key: 'inspection',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ToolOutlined />
                    Kiểm tra & Phân loại
                  </span>
                ),
              },
            ]}
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Form content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <Form form={form} layout="vertical" className="step-form"
            requiredMark={(label, { required }) => (
              <>
                {required && <span style={{ color: colors.danger, marginRight: 2 }}>*</span>}
                {label}
              </>
            )}
          >
            {currentStep === 0 ? renderTabEquipment() : renderTabInspection()}
          </Form>
        </div>
      </Drawer>
    </>
  );
};

export default RepairReception;
