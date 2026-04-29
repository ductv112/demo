import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Row, Col, Input, Select, Button,
  Drawer, Form, Dropdown, Empty, Tabs, message, Badge, Progress,
} from 'antd';
import {
  SafetyCertificateOutlined, ExperimentOutlined, CheckCircleOutlined,
  SwapOutlined, SearchOutlined, EyeOutlined, MoreOutlined,
  CarryOutOutlined, EditOutlined,
  EnvironmentOutlined, CalendarOutlined, UserOutlined, ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { workOrders } from '../../data/workOrders';
import {
  workOrderStatusConfig, priorityConfig,
  getProgressColor,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkOrder, WorkOrderStatus } from '../../types';

const { TextArea } = Input;

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

const pageStyles = `
  .ih-stat-card {
    position: relative; overflow: hidden; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px !important;
  }
  .ih-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .ih-stat-card:hover .stat-bg-icon {
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
  .ih-row {
    border-radius: 0; border: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer; overflow: hidden;
  }
  .ih-row:hover {
    background: #f8fafc !important;
  }
`;

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="ih-stat-card"
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

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const RELEVANT_STATUSES: WorkOrderStatus[] = ['quality_check', 'testing', 'accepted', 'handed_over', 'closed'];

const getStatusBorderColor = (status: WorkOrderStatus): string => {
  const map: Record<string, string> = {
    quality_check: '#1890ff',
    testing: '#722ed1',
    accepted: '#52c41a',
    handed_over: '#1B3A5C',
    closed: '#1B3A5C',
  };
  return map[status] || '#1B3A5C';
};

type TabPhase = 'quality_check' | 'testing' | 'accepted' | 'handover';

const phaseStatusMap: Record<TabPhase, WorkOrderStatus[]> = {
  quality_check: ['quality_check'],
  testing: ['testing'],
  accepted: ['accepted'],
  handover: ['handed_over', 'closed'],
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

const InspectionHandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<TabPhase>('quality_check');

  // Drawer states
  const [inspectionDrawerOpen, setInspectionDrawerOpen] = useState(false);
  const [handoverDrawerOpen, setHandoverDrawerOpen] = useState(false);
  const [drawerWo, setDrawerWo] = useState<WorkOrder | null>(null);
  const [inspectionForm] = Form.useForm();
  const [handoverForm] = Form.useForm();

  // Filtered WOs — only relevant statuses
  const relevantWos = useMemo(() =>
    workOrders.filter(w => RELEVANT_STATUSES.includes(w.status)),
  []);

  // Counts
  const counts = useMemo(() => {
    const qualityCheck = relevantWos.filter(w => w.status === 'quality_check').length;
    const testing = relevantWos.filter(w => w.status === 'testing').length;
    const accepted = relevantWos.filter(w => w.status === 'accepted').length;
    const handedOver = relevantWos.filter(w => w.status === 'handed_over' || w.status === 'closed').length;
    return { qualityCheck, testing, accepted, handedOver };
  }, [relevantWos]);

  // Filtered list by tab + search
  const filteredWos = useMemo(() => {
    const statusList = phaseStatusMap[activeTab];
    return relevantWos.filter(w => {
      const matchStatus = statusList.includes(w.status);
      const matchSearch = !searchText ||
        w.code.toLowerCase().includes(searchText.toLowerCase()) ||
        w.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
        w.unitName.toLowerCase().includes(searchText.toLowerCase()) ||
        w.assignedTeam.toLowerCase().includes(searchText.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [relevantWos, activeTab, searchText]);

  // Open inspection drawer
  const openInspectionDrawer = (wo: WorkOrder) => {
    setDrawerWo(wo);
    const defaultType = wo.status === 'testing' ? 'testing' : wo.status === 'accepted' ? 'acceptance' : 'quality';
    inspectionForm.setFieldsValue({
      inspectionType: defaultType,
      result: undefined,
      criteria: [],
      inspector: '',
      date: '',
      notes: '',
    });
    setInspectionDrawerOpen(true);
  };

  // Open handover drawer
  const openHandoverDrawer = (wo: WorkOrder) => {
    setDrawerWo(wo);
    handoverForm.setFieldsValue({
      receivingUnit: wo.unitName,
      handoverPerson: '',
      receiverPerson: '',
      handoverDate: '',
      notes: '',
    });
    setHandoverDrawerOpen(true);
  };

  // Save inspection
  const handleSaveInspection = () => {
    inspectionForm.validateFields().then(() => {
      message.success('Đã lưu kết quả kiểm tra thành công');
      setInspectionDrawerOpen(false);
      setDrawerWo(null);
    });
  };

  // Save handover
  const handleSaveHandover = () => {
    handoverForm.validateFields().then(() => {
      message.success('Đã xác nhận bàn giao thiết bị thành công');
      setHandoverDrawerOpen(false);
      setDrawerWo(null);
    });
  };

  // Dropdown menu per status
  const getActionMenu = (wo: WorkOrder) => {
    const items: {
      key: string;
      icon?: React.ReactNode;
      label: string | React.ReactNode;
      onClick?: () => void;
      type?: 'divider';
    }[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/work-orders/${wo.id}`),
      },
      { key: 'div1', type: 'divider', label: '' },
    ];

    if (wo.status === 'quality_check') {
      items.push({
        key: 'enter-qc',
        icon: <EditOutlined style={{ color: '#1890ff' }} />,
        label: <span style={{ color: '#1890ff', fontWeight: 500 }}>Nhập kết quả kiểm tra CL</span>,
        onClick: () => openInspectionDrawer(wo),
      });
      items.push({
        key: 'to-testing',
        icon: <ExperimentOutlined style={{ color: '#722ed1' }} />,
        label: <span style={{ color: '#722ed1', fontWeight: 500 }}>Chuyển thử nghiệm</span>,
        onClick: () => message.success('Đã chuyển sang giai đoạn thử nghiệm'),
      });
    } else if (wo.status === 'testing') {
      items.push({
        key: 'enter-test',
        icon: <EditOutlined style={{ color: '#722ed1' }} />,
        label: <span style={{ color: '#722ed1', fontWeight: 500 }}>Nhập kết quả thử nghiệm</span>,
        onClick: () => openInspectionDrawer(wo),
      });
      items.push({
        key: 'accept',
        icon: <CheckCircleOutlined style={{ color: colors.success }} />,
        label: <span style={{ color: colors.success, fontWeight: 500 }}>Nghiệm thu</span>,
        onClick: () => message.success('Đã chuyển sang nghiệm thu'),
      });
    } else if (wo.status === 'accepted') {
      items.push({
        key: 'confirm-complete',
        icon: <CheckCircleOutlined style={{ color: colors.success }} />,
        label: <span style={{ color: colors.success, fontWeight: 500 }}>Xác nhận hoàn thành</span>,
        onClick: () => message.success('Đã xác nhận hoàn thành sửa chữa'),
      });
      items.push({
        key: 'handover',
        icon: <SwapOutlined style={{ color: colors.success }} />,
        label: <span style={{ color: colors.success, fontWeight: 500 }}>Bàn giao thiết bị</span>,
        onClick: () => openHandoverDrawer(wo),
      });
    } else if (wo.status === 'handed_over') {
      items.push({
        key: 'close',
        icon: <CarryOutOutlined style={{ color: colors.navy }} />,
        label: <span style={{ color: colors.navy, fontWeight: 500 }}>Đóng lệnh SC</span>,
        onClick: () => message.success('Đã đóng lệnh sửa chữa'),
      });
    }
    // closed: only "Xem chi tiết" — remove trailing divider
    if (wo.status === 'closed') {
      items.pop(); // remove divider
    }

    return items;
  };

  // Tab items
  const tabItems = [
    {
      key: 'quality_check',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          Kiểm tra CL
          <Badge count={counts.qualityCheck} style={{ backgroundColor: '#1890ff', marginLeft: 6 }} size="small" />
        </span>
      ),
    },
    {
      key: 'testing',
      label: (
        <span>
          <ExperimentOutlined style={{ marginRight: 6 }} />
          Thử nghiệm
          <Badge count={counts.testing} style={{ backgroundColor: '#722ed1', marginLeft: 6 }} size="small" showZero />
        </span>
      ),
    },
    {
      key: 'accepted',
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 6 }} />
          Nghiệm thu
          <Badge count={counts.accepted} style={{ backgroundColor: colors.success, marginLeft: 6 }} size="small" showZero />
        </span>
      ),
    },
    {
      key: 'handover',
      label: (
        <span>
          <SwapOutlined style={{ marginRight: 6 }} />
          Bàn giao
          <Badge count={counts.handedOver} style={{ backgroundColor: colors.navy, marginLeft: 6 }} size="small" showZero />
        </span>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════

  return (
    <div>
      <style>{pageStyles}</style>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Kiểm tra CL"
            value={counts.qualityCheck}
            icon={<SafetyCertificateOutlined />}
            gradient="linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)"
            suffix="lệnh"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Thử nghiệm"
            value={counts.testing}
            icon={<ExperimentOutlined />}
            gradient="linear-gradient(135deg, #722ed1 0%, #b37feb 100%)"
            suffix="lệnh"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Nghiệm thu"
            value={counts.accepted}
            icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #52c41a 0%, #95de64 100%)"
            suffix="lệnh"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đã bàn giao"
            value={counts.handedOver}
            icon={<SwapOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
            suffix="lệnh"
          />
        </Col>
      </Row>

      {/* Main Card */}
      <Card className="section-card" styles={{ body: { padding: 20 } }}>
        {/* Card Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16,
          }}>
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>
              Kiểm tra, Nghiệm thu & Bàn giao
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              Quản lý quy trình kiểm tra chất lượng, thử nghiệm, nghiệm thu và bàn giao thiết bị
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          className="status-tab"
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key as TabPhase); setSearchText(''); }}
          items={tabItems}
          style={{ marginBottom: 12 }}
        />

        {/* Filters */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={10}>
            <Input
              placeholder="Tìm kiếm mã lệnh, thiết bị, đơn vị, tổ sửa chữa..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        {/* List View */}
        {filteredWos.length > 0 ? (
          <div style={{ border: '1px solid #eef0f3', borderRadius: 10, overflow: 'hidden' }}>
            {/* List header */}
            <div style={{
              background: '#f5f7fa', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid #eef0f3',
            }}>
              <div style={{ width: 28 }} />
              <div style={{ flex: 2.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Mã lệnh / Thiết bị</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Đơn vị</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Tổ sửa chữa</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.navy }}>Trạng thái</div>
              <div style={{ flex: 0.8, fontSize: 12, fontWeight: 600, color: colors.navy }}>Ưu tiên</div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: colors.navy }}>Tiến độ</div>
              <div style={{ width: 36 }} />
            </div>

            {/* List rows */}
            {filteredWos.map((wo, idx) => {
              const statusCfg = workOrderStatusConfig[wo.status];
              const priCfg = priorityConfig[wo.priority];
              const borderColor = getStatusBorderColor(wo.status);
              const orderNum = idx + 1;

              return (
                <div
                  key={wo.id}
                  className="ih-row"
                  style={{
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: idx < filteredWos.length - 1 ? '1px solid #f5f5f5' : 'none',
                    transition: 'background 0.15s',
                    background: '#fff',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  {/* Order number */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `${borderColor}15`, color: borderColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {orderNum}
                  </div>

                  {/* Code + Equipment */}
                  <div style={{ flex: 2.5, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: colors.navy, cursor: 'pointer' }}
                      onClick={() => navigate(`/work-orders/${wo.id}`)}>
                      {wo.code}
                    </div>
                    <div style={{
                      fontSize: 12, color: '#555', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }} title={wo.equipmentName}>
                      {wo.equipmentName}
                    </div>
                  </div>

                  {/* Unit */}
                  <div style={{ flex: 1.5, fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <EnvironmentOutlined style={{ color: '#bbb', fontSize: 11 }} />
                    {wo.unitName}
                  </div>

                  {/* Assigned Team */}
                  <div style={{ flex: 1.5, fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ToolOutlined style={{ color: '#bbb', fontSize: 11 }} />
                    {wo.assignedTeam}
                  </div>

                  {/* Status Tag */}
                  <div style={{ flex: 1 }}>
                    <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>{statusCfg.label}</Tag>
                  </div>

                  {/* Priority Tag */}
                  <div style={{ flex: 0.8 }}>
                    <Tag color={priCfg.color} style={{ margin: 0, fontSize: 11 }}>{priCfg.label}</Tag>
                  </div>

                  {/* Progress */}
                  <div style={{ flex: 1.5 }}>
                    <Progress
                      percent={wo.progress}
                      size="small"
                      strokeColor={getProgressColor(wo.progress)}
                      style={{ margin: 0 }}
                    />
                  </div>

                  {/* Action Menu */}
                  <div style={{ width: 36, textAlign: 'center' }}>
                    <Dropdown
                      menu={{ items: getActionMenu(wo) as never[] }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined style={{ fontSize: 16 }} />}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      />
                    </Dropdown>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="Không có lệnh sửa chữa nào phù hợp" style={{ padding: '40px 0' }} />
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Drawer: Nhập kết quả kiểm tra */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Drawer
        open={inspectionDrawerOpen}
        onClose={() => { setInspectionDrawerOpen(false); setDrawerWo(null); }}
        width={780}
        closable={false}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
      >
        {/* Navy gradient header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          padding: '20px 24px', color: '#fff',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            <EditOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nhập kết quả kiểm tra</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{drawerWo?.code}</div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Read-only WO info */}
          <SectionHeader title="Thông tin lệnh sửa chữa" icon={<ToolOutlined />} />
          <div style={{
            background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 24,
            border: '1px solid #eef0f3',
          }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Mã lệnh SC</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{drawerWo?.code}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Thiết bị</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{drawerWo?.equipmentName}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Đơn vị</div>
                <div style={{ fontSize: 13 }}>{drawerWo?.unitName}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Tổ sửa chữa</div>
                <div style={{ fontSize: 13 }}>{drawerWo?.assignedTeam}</div>
              </Col>
            </Row>
          </div>

          {/* Inspection form */}
          <SectionHeader title="Kết quả kiểm tra" icon={<SafetyCertificateOutlined />} />
          <Form form={inspectionForm} layout="vertical">
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="inspectionType"
                  label="Loại kiểm tra"
                  rules={[{ required: true, message: 'Vui lòng chọn loại kiểm tra' }]}
                >
                  <Select
                    placeholder="Chọn loại kiểm tra"
                    options={[
                      { value: 'quality', label: 'Kiểm tra chất lượng' },
                      { value: 'testing', label: 'Thử nghiệm' },
                      { value: 'acceptance', label: 'Nghiệm thu' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="result"
                  label="Kết quả"
                  rules={[{ required: true, message: 'Vui lòng chọn kết quả' }]}
                >
                  <Select
                    placeholder="Chọn kết quả"
                    options={[
                      { value: 'passed', label: 'Đạt' },
                      { value: 'failed', label: 'Không đạt' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="criteria" label="Tiêu chí kiểm tra">
              <Select
                mode="tags"
                placeholder="Nhập tiêu chí và nhấn Enter"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item name="inspector" label="Người kiểm tra">
                  <Input
                    prefix={<UserOutlined style={{ color: '#bbb' }} />}
                    placeholder="Nhập tên người kiểm tra"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="date" label="Ngày kiểm tra">
                  <Input
                    type="date"
                    prefix={<CalendarOutlined style={{ color: '#bbb' }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={3} placeholder="Ghi chú thêm về kết quả kiểm tra..." />
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 24px', borderTop: '1px solid #eef0f3',
          background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <Button onClick={() => { setInspectionDrawerOpen(false); setDrawerWo(null); }}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSaveInspection}
            style={{ background: colors.navy, borderColor: colors.navy }}
          >
            Lưu kết quả
          </Button>
        </div>
      </Drawer>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Drawer: Bàn giao thiết bị */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Drawer
        open={handoverDrawerOpen}
        onClose={() => { setHandoverDrawerOpen(false); setDrawerWo(null); }}
        width={780}
        closable={false}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
      >
        {/* Navy gradient header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          padding: '20px 24px', color: '#fff',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            <SwapOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Bàn giao thiết bị</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{drawerWo?.code}</div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Read-only equipment info */}
          <SectionHeader title="Thông tin thiết bị" icon={<ToolOutlined />} />
          <div style={{
            background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 24,
            border: '1px solid #eef0f3',
          }}>
            <Row gutter={[16, 12]}>
              <Col span={8}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Mã lệnh SC</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{drawerWo?.code}</div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Thiết bị</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{drawerWo?.equipmentName}</div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Đơn vị</div>
                <div style={{ fontSize: 13 }}>{drawerWo?.unitName}</div>
              </Col>
            </Row>
          </div>

          {/* Handover form */}
          <SectionHeader title="Thông tin bàn giao" icon={<SwapOutlined />} />
          <Form form={handoverForm} layout="vertical">
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="receivingUnit"
                  label="Đơn vị nhận"
                  rules={[{ required: true, message: 'Vui lòng nhập đơn vị nhận' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined style={{ color: '#bbb' }} />}
                    placeholder="Nhập đơn vị nhận"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="handoverDate"
                  label="Ngày bàn giao"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày bàn giao' }]}
                >
                  <Input
                    type="date"
                    prefix={<CalendarOutlined style={{ color: '#bbb' }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="handoverPerson"
                  label="Người bàn giao"
                  rules={[{ required: true, message: 'Vui lòng nhập người bàn giao' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#bbb' }} />}
                    placeholder="Nhập tên người bàn giao"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="receiverPerson"
                  label="Người nhận"
                  rules={[{ required: true, message: 'Vui lòng nhập người nhận' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#bbb' }} />}
                    placeholder="Nhập tên người nhận"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="notes" label="Ghi chú bàn giao">
              <TextArea rows={3} placeholder="Ghi chú thêm về việc bàn giao..." />
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 24px', borderTop: '1px solid #eef0f3',
          background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <Button onClick={() => { setHandoverDrawerOpen(false); setDrawerWo(null); }}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSaveHandover}
            style={{ background: colors.success, borderColor: colors.success }}
          >
            Xác nhận bàn giao
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default InspectionHandoverPage;
