import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Row, Col, Input, Select, Space, Button,
  Drawer, Form, Dropdown, Empty, Pagination,
  Tabs, message, Badge,
} from 'antd';
import {
  ExperimentOutlined, SearchOutlined, EyeOutlined,
  MoreOutlined, EnvironmentOutlined,
  CalendarOutlined, CheckCircleOutlined,
  WarningOutlined, EditOutlined,
  FileSearchOutlined, AlertOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { diagnosticResults } from '../../data/diagnosticResults';
import {
  diagnosticStatusConfig, repairMethodConfig, equipmentTypeConfig, formatDate,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { DiagnosticResult, DiagnosticStatus, RepairMethod } from '../../types';

const { Search } = Input;
const { TextArea } = Input;

const pageStyles = `
  .diag-stat-card {
    position: relative; overflow: hidden; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px !important;
  }
  .diag-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .diag-stat-card:hover .stat-bg-icon {
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
  .diag-form .ant-form-item-label > label {
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
  .request-card .card-code { color: ${colors.navy}; font-weight: 700; font-size: 14px; }
  .request-card .card-equip {
    font-weight: 600; font-size: 13px; color: #1a1a2e;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .request-card .card-meta { font-size: 12px; color: #8c8c8c; display: flex; align-items: center; gap: 4px; }
`;

const severityConfig: Record<string, { label: string; color: string }> = {
  minor: { label: 'Nhẹ', color: 'green' },
  moderate: { label: 'Trung bình', color: 'blue' },
  major: { label: 'Lớn', color: 'orange' },
  critical: { label: 'Nghiêm trọng', color: 'red' },
};

const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode; gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card className="diag-stat-card" style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '20px 20px 16px' } }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>
            {value}
            {suffix && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
          {icon}
        </div>
      </div>
    </div>
    <div className="stat-bg-icon" style={{ position: 'absolute', top: 12, right: 16, fontSize: 64,
      color: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}>{icon}</div>
  </Card>
);

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div style={{ fontSize: 14, fontWeight: 700, color: colors.navy, paddingBottom: 10, marginBottom: 16, marginTop: 4,
    borderBottom: `2px solid ${colors.navy}15`, display: 'flex', alignItems: 'center', gap: 8 }}>
    {icon && <span style={{ fontSize: 15, color: colors.navyLight }}>{icon}</span>}
    {title}
  </div>
);

const DiagnosticResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined);
  const [methodFilter, setMethodFilter] = useState<RepairMethod | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<DiagnosticResult | null>(null);
  const [form] = Form.useForm();

  // Filtered data
  const filteredData = useMemo(() => {
    let result = diagnosticResults;
    if (activeTab !== 'all') result = result.filter(d => d.status === activeTab);
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(d =>
        d.repairRequestCode.toLowerCase().includes(lower)
        || d.equipmentName.toLowerCase().includes(lower)
        || d.diagnosis.toLowerCase().includes(lower),
      );
    }
    if (severityFilter) result = result.filter(d => d.severity === severityFilter);
    if (methodFilter) result = result.filter(d => d.recommendedAction === methodFilter);
    return result;
  }, [searchText, severityFilter, methodFilter, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  // Stats
  const stats = useMemo(() => ({
    total: diagnosticResults.length,
    pending: diagnosticResults.filter(d => d.status === 'pending').length,
    received: diagnosticResults.filter(d => d.status === 'received').length,
    confirmed: diagnosticResults.filter(d => d.status === 'confirmed').length,
    recheck: diagnosticResults.filter(d => d.status === 'recheck').length,
  }), []);

  // Severity border color
  const getSeverityBorder = (sev: string) => {
    const map: Record<string, string> = { critical: colors.danger, major: '#fa8c16', moderate: '#1890ff', minor: colors.success };
    return map[sev] || '#d9d9d9';
  };

  // Open drawer for input
  const openInputDrawer = (record: DiagnosticResult) => {
    setDrawerRecord(record);
    setDrawerVisible(true);
    form.resetFields();
    if (record.status === 'received' || record.status === 'recheck') {
      form.setFieldsValue({
        diagnosis: record.diagnosis,
        rootCause: record.rootCause,
        affectedComponents: record.affectedComponents,
        severity: record.severity,
        recommendedAction: record.recommendedAction,
        diagnosedBy: record.diagnosedBy,
        diagnosedDate: record.diagnosedDate,
        notes: record.notes,
      });
    }
  };

  const handleSaveResult = () => {
    form.validateFields().then(() => {
      message.success('Đã lưu kết quả chẩn đoán');
      setDrawerVisible(false);
      form.resetFields();
    }).catch(() => {});
  };

  // Action menu
  const getActionMenu = (record: DiagnosticResult) => {
    const items: any[] = [];

    if (record.status === 'pending') {
      items.push({
        key: 'input', icon: <EditOutlined style={{ color: colors.navy }} />,
        label: <span style={{ color: colors.navy, fontWeight: 500 }}>Nhập kết quả chẩn đoán</span>,
        onClick: () => openInputDrawer(record),
      });
    }

    if (record.status === 'received') {
      items.push(
        { key: 'detail', icon: <EyeOutlined />, label: 'Xem chi tiết',
          onClick: () => navigate(`/diagnostic-results/${record.id}`) },
        { type: 'divider' },
        { key: 'confirm', icon: <CheckCircleOutlined style={{ color: colors.success }} />,
          label: <span style={{ color: colors.success, fontWeight: 500 }}>Xác nhận kết quả</span>,
          onClick: () => message.success(`Đã xác nhận kết quả ${record.repairRequestCode}`) },
        { key: 'recheck', icon: <WarningOutlined style={{ color: '#fa8c16' }} />,
          label: <span style={{ color: '#fa8c16', fontWeight: 500 }}>Yêu cầu CĐ lại</span>,
          onClick: () => message.warning(`Đã gửi yêu cầu chẩn đoán lại ${record.repairRequestCode}`) },
      );
    }

    if (record.status === 'confirmed') {
      items.push({ key: 'detail', icon: <EyeOutlined />, label: 'Xem chi tiết',
        onClick: () => navigate(`/diagnostic-results/${record.id}`) });
    }

    if (record.status === 'recheck') {
      items.push({
        key: 'reinput', icon: <EditOutlined style={{ color: '#fa8c16' }} />,
        label: <span style={{ color: '#fa8c16', fontWeight: 500 }}>Nhập lại kết quả</span>,
        onClick: () => openInputDrawer(record),
      });
    }

    return items;
  };

  // Tab items
  const tabItems = [
    { key: 'all', label: <span>Tất cả <Badge count={stats.total} style={{ backgroundColor: colors.navy }} size="small" /></span> },
    { key: 'pending', label: <span>Chờ chẩn đoán <Badge count={stats.pending} style={{ backgroundColor: '#8c8c8c' }} size="small" /></span> },
    { key: 'received', label: <span>Đã có kết quả <Badge count={stats.received} style={{ backgroundColor: '#1890ff' }} size="small" /></span> },
    { key: 'confirmed', label: <span>Đã xác nhận <Badge count={stats.confirmed} style={{ backgroundColor: colors.success }} size="small" /></span> },
    { key: 'recheck', label: <span>Yêu cầu CĐ lại <Badge count={stats.recheck} style={{ backgroundColor: '#fa8c16' }} size="small" /></span> },
  ];

  return (
    <>
      <style>{pageStyles}</style>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Tổng yêu cầu" value={stats.total} icon={<ExperimentOutlined />}
            gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`} suffix="yêu cầu" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Chờ chẩn đoán" value={stats.pending} icon={<AlertOutlined />}
            gradient="linear-gradient(135deg, #8c8c8c, #bfbfbf)" suffix="yêu cầu" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Đã có kết quả" value={stats.received} icon={<FileSearchOutlined />}
            gradient="linear-gradient(135deg, #1890ff, #69c0ff)" suffix="yêu cầu" />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="Đã xác nhận" value={stats.confirmed} icon={<CheckCircleOutlined />}
            gradient={`linear-gradient(135deg, ${colors.success}, #73d13d)`} suffix="yêu cầu" />
        </Col>
      </Row>

      {/* Main Card */}
      <Card className="section-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
                <ExperimentOutlined />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: colors.navy, fontSize: 15 }}>Tiếp nhận kết quả chẩn đoán</div>
                <div style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>Tiếp nhận và xác nhận kết luận kỹ thuật từ phân hệ Sự cố & Chẩn đoán</div>
              </div>
            </div>
          </div>
        }
        style={{ borderRadius: 14 }}
      >
        <Tabs className="status-tab" activeKey={activeTab} onChange={(k) => { setActiveTab(k); setCurrentPage(1); }}
          items={tabItems} style={{ marginBottom: 12 }} />

        <div style={{ marginBottom: 16 }}>
          <Space wrap size="middle">
            <Search placeholder="Tìm kiếm mã, thiết bị, chẩn đoán..." allowClear
              onSearch={v => setSearchText(v)} onChange={e => { if (!e.target.value) setSearchText(''); }}
              style={{ width: 280 }} prefix={<SearchOutlined style={{ color: colors.navy }} />} />
            <Select placeholder="Mức độ" allowClear style={{ width: 160 }}
              value={severityFilter} onChange={v => setSeverityFilter(v)}
              options={Object.entries(severityConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
            <Select placeholder="Phương án xử lý" allowClear style={{ width: 170 }}
              value={methodFilter} onChange={v => setMethodFilter(v)}
              options={Object.entries(repairMethodConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Space>
        </div>

        {/* Card Grid */}
        {paginatedData.length === 0 ? (
          <Empty description="Không có kết quả nào" style={{ padding: 40 }} />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedData.map(record => {
                const statusCfg = diagnosticStatusConfig[record.status];
                const eqCfg = equipmentTypeConfig[record.equipmentType];
                const sevCfg = severityConfig[record.severity];
                const methodCfg = record.recommendedAction ? repairMethodConfig[record.recommendedAction] : null;

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={record.id}>
                    <Card className="request-card"
                      onClick={() => record.status !== 'pending' ? navigate(`/diagnostic-results/${record.id}`) : openInputDrawer(record)}
                      styles={{ body: { padding: 0 } }}
                      style={{}}>

                      {/* Header */}
                      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="card-code">{record.repairRequestCode}</div>
                          <div className="card-equip" title={record.equipmentName}>{record.equipmentName}</div>
                        </div>
                        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
                          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 28, height: 28, flexShrink: 0, marginTop: -2, marginRight: -4 }} />
                        </Dropdown>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '0 16px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                          <Tag color={statusCfg.color} style={{ margin: 0, fontSize: 11 }}>{statusCfg.label}</Tag>
                          {sevCfg && <Tag color={sevCfg.color} style={{ margin: 0, fontSize: 11 }}>{sevCfg.label}</Tag>}
                          <Tag color={eqCfg.color} style={{ margin: 0, fontSize: 11 }}>{eqCfg.label}</Tag>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div className="card-meta"><EnvironmentOutlined /> {record.unitName}</div>
                          <div className="card-meta">
                            <CalendarOutlined /> {record.diagnosedDate ? formatDate(record.diagnosedDate) : 'Chờ chẩn đoán'}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
                        {methodCfg && record.diagnosis ? (
                          <Tag color={methodCfg.color} style={{ margin: 0, fontSize: 11 }}>{methodCfg.label}</Tag>
                        ) : (
                          <span style={{ fontSize: 11, color: '#bfbfbf' }}>--</span>
                        )}
                        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                          {record.diagnosedBy || '--'}
                        </span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Pagination current={currentPage} pageSize={pageSize} total={filteredData.length}
                onChange={page => setCurrentPage(page)} showTotal={t => `Tổng ${t} yêu cầu`}
                showSizeChanger={false} size="small" />
            </div>
          </>
        )}
      </Card>

      {/* Drawer - Nhập kết quả chẩn đoán */}
      <Drawer
        title={null} open={drawerVisible}
        onClose={() => { setDrawerVisible(false); form.resetFields(); }}
        width={780}
        styles={{ header: { display: 'none' }, body: { padding: 0 },
          footer: { borderTop: '1px solid #eef0f3', padding: '12px 24px' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setDrawerVisible(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSaveResult}
              style={{ background: colors.navy, fontWeight: 600 }}>
              Lưu kết quả
            </Button>
          </div>
        }
      >
        {/* Navy gradient header */}
        <div style={{ padding: '18px 24px',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, flexShrink: 0 }}>
            <ExperimentOutlined />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, lineHeight: '22px' }}>
              Nhập kết quả chẩn đoán
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: '18px' }}>
              {drawerRecord?.repairRequestCode} — {drawerRecord?.equipmentName}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {drawerRecord && (
            <>
              {/* Thông tin yêu cầu (read-only) */}
              <SectionHeader title="Thông tin yêu cầu sửa chữa" icon={<FileSearchOutlined />} />
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid #eef0f3' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Mã yêu cầu</div>
                    <div style={{ fontWeight: 600, color: colors.navy }}>{drawerRecord.repairRequestCode}</div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Thiết bị</div>
                    <div style={{ fontWeight: 500 }}>{drawerRecord.equipmentName}</div>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 12 }}>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Đơn vị</div>
                    <div>{drawerRecord.unitName}</div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>Tình trạng ban đầu</div>
                    <div>{drawerRecord.initialCondition}</div>
                  </Col>
                </Row>
                {drawerRecord.symptoms.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Triệu chứng</div>
                    <Space wrap>
                      {drawerRecord.symptoms.map((s, i) => <Tag key={i} color="blue">{s}</Tag>)}
                    </Space>
                  </div>
                )}
              </div>

              {/* Form nhập kết quả */}
              <SectionHeader title="Kết quả chẩn đoán" icon={<ExperimentOutlined />} />
              <Form form={form} layout="vertical" className="diag-form">
                <Form.Item name="diagnosis" label="Kết luận chẩn đoán" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                  <TextArea rows={3} placeholder="VD: Hỏng mô-đun nguồn chính, cần thay thế" />
                </Form.Item>
                <Form.Item name="rootCause" label="Nguyên nhân gốc" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                  <TextArea rows={2} placeholder="VD: Điện áp đầu vào tăng đột ngột gây cháy MOSFET" />
                </Form.Item>
                <Form.Item name="affectedComponents" label="Linh kiện ảnh hưởng">
                  <Select mode="tags" placeholder="Nhập tên linh kiện và nhấn Enter" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="severity" label="Mức độ hư hỏng" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                      <Select placeholder="Chọn mức độ"
                        options={Object.entries(severityConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="recommendedAction" label="Phương án xử lý" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                      <Select placeholder="Chọn phương án"
                        options={Object.entries(repairMethodConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="diagnosedBy" label="Người chẩn đoán" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                      <Input placeholder="VD: Kỹ sư Nguyễn Văn An" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="diagnosedDate" label="Ngày chẩn đoán">
                      <Input placeholder="VD: 2026-03-15" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="notes" label="Ghi chú">
                  <TextArea rows={2} placeholder="Ghi chú bổ sung" />
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default DiagnosticResultsPage;
