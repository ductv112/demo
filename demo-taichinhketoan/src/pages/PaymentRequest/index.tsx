import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Button, Form, Input, Select, InputNumber,
  Space, Row, Col, Upload, Divider, Typography, message, Empty, Drawer,
  Descriptions, Progress, Timeline, Alert,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EyeOutlined, UploadOutlined,
  SendOutlined, FileSearchOutlined, CheckCircleOutlined, DollarOutlined,
  FilterOutlined, ClockCircleOutlined, FileTextOutlined,
  FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { paymentRequests } from '../../data/paymentRequests';
import { departments, getDepartmentShortName, getDepartmentName } from '../../data/departments';
import { allocations2026 } from '../../data/allocations';
import { formatCurrency, formatCurrencyFull, formatDate, formatNumber, paymentStatusConfig, categoryTypeConfig, getProgressColor } from '../../utils/format';
import { tasks2026 } from '../../data/tasks';
import { alerts } from '../../data/alerts';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { PaymentRequest, PaymentRequestStatus } from '../../types';

const { Title, Text } = Typography;

const fileIconMap: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
  xlsx: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
  docx: <FileWordOutlined style={{ color: '#1890ff', fontSize: 18 }} />,
};

const prStyles = `
  .pr-stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .pr-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15);
  }
  .pr-stat-card .pr-bg-icon {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pr-stat-card:hover .pr-bg-icon {
    transform: rotate(15deg) scale(1.1);
  }
  .pr-item-card {
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.25s ease;
    border: none;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    cursor: pointer;
  }
  .pr-item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27, 58, 92, 0.12);
  }
`;

const statusSteps: Record<PaymentRequestStatus, number> = {
  draft: 0, submitted: 1, reviewing: 2, approved: 3, paid: 4, rejected: -1, returned: -1,
};

const PaymentRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDepartment } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [filterDept, setFilterDept] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [selectedPR, setSelectedPR] = useState<PaymentRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const submitted = paymentRequests.filter(r => r.status === 'submitted').length;
    const reviewing = paymentRequests.filter(r => r.status === 'reviewing').length;
    const approved = paymentRequests.filter(r => r.status === 'approved').length;
    const paid = paymentRequests.filter(r => r.status === 'paid').length;
    const totalAmount = paymentRequests.reduce((s, r) => s + r.amount, 0);
    const paidAmount = paymentRequests.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
    return { submitted, reviewing, approved, paid, totalAmount, paidAmount };
  }, []);

  const statCardsData = [
    {
      title: 'Chờ duyệt',
      value: stats.submitted,
      suffix: 'đề nghị',
      icon: <SendOutlined />,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    },
    {
      title: 'Đang xem xét',
      value: stats.reviewing,
      suffix: 'đề nghị',
      icon: <FileSearchOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    },
    {
      title: 'Đã duyệt',
      value: stats.approved,
      suffix: 'đề nghị',
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    },
    {
      title: 'Đã thanh toán',
      value: stats.paid,
      suffix: 'đề nghị',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return paymentRequests.filter(r => {
      if (filterDept && r.departmentId !== filterDept) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (searchText) {
        const text = searchText.toLowerCase();
        const task = tasks2026.find(t => t.id === r.taskId);
        const taskName = task?.name || '';
        return (
          r.code.toLowerCase().includes(text) ||
          r.title.toLowerCase().includes(text) ||
          taskName.toLowerCase().includes(text)
        );
      }
      return true;
    });
  }, [filterDept, filterStatus, searchText]);

  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      console.log('New payment request:', values);
      message.success('Đã tạo đề nghị thanh toán thành công!');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const openDetail = (pr: PaymentRequest) => {
    setSelectedPR(pr);
    setDrawerOpen(true);
  };

  // ─── Detail Drawer ────────────────────────────────────────────
  const renderDetailDrawer = () => {
    if (!selectedPR) return null;
    const pr = selectedPR;
    const statusCfg = paymentStatusConfig[pr.status];
    const typeCfg = categoryTypeConfig[pr.categoryType];
    const task = tasks2026.find(t => t.id === pr.taskId);
    const allocation = allocations2026.find(a => a.id === pr.allocationId);
    const relatedAlerts = alerts.filter(a => a.relatedEntityId === pr.id);
    const canReview = pr.status === 'submitted' || pr.status === 'reviewing';

    const paymentMethodLabel = pr.paymentMethod === 'transfer' ? 'Chuyển khoản'
      : pr.paymentMethod === 'advance' ? 'Tạm ứng' : pr.paymentMethod === 'direct' ? 'Trực tiếp' : '—';

    // Timeline
    const timelineItems = [
      {
        color: 'green' as const,
        dot: <ClockCircleOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Tạo đề nghị</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(pr.createdAt)} — {pr.createdBy}</Text></div>
          </div>
        ),
      },
      ...(pr.submittedAt ? [{
        color: 'blue' as const,
        dot: <SendOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Gửi duyệt</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(pr.submittedAt)}</Text></div>
          </div>
        ),
      }] : []),
      ...(pr.reviewedBy && pr.status === 'reviewing' ? [{
        color: 'orange' as const,
        dot: <EyeOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Đang xem xét</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>Người xem xét: {pr.reviewedBy}</Text></div>
          </div>
        ),
      }] : []),
      ...(pr.reviewedAt ? [{
        color: (pr.status === 'approved' || pr.status === 'paid' ? 'green' : 'red') as 'green' | 'red',
        dot: pr.status === 'rejected' ? <CloseCircleOutlined style={{ fontSize: 14 }} /> : <CheckCircleOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>{pr.status === 'rejected' ? 'Từ chối' : 'Phê duyệt'}</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(pr.reviewedAt)} — {pr.reviewedBy}</Text></div>
            {pr.reviewNote && <div><Text italic style={{ fontSize: 12 }}>"{pr.reviewNote}"</Text></div>}
          </div>
        ),
      }] : []),
      ...(pr.status === 'paid' ? [{
        color: 'green' as const,
        dot: <DollarOutlined style={{ fontSize: 14 }} />,
        children: (
          <div>
            <Text strong style={{ fontSize: 13 }}>Đã thanh toán</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>Hoàn tất {formatCurrencyFull(pr.amount)}</Text></div>
          </div>
        ),
      }] : []),
    ];

    const step = statusSteps[pr.status];
    const progressPct = step >= 0 ? Math.round((step / 4) * 100) : 0;

    return (
      <Drawer
        title={null}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedPR(null); }}
        width={640}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
      >
        {/* Gradient header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, #2d5a8e 60%, ${colors.navyLight} 100%)`,
          padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{pr.code}</Text>
              <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, marginTop: 4, maxWidth: 380 }}>{pr.title}</div>
            </div>
            <Button type="text" onClick={() => { setDrawerOpen(false); setSelectedPR(null); }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginTop: -4 }}>×</Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 700, lineHeight: '36px' }}>
                {formatCurrency(pr.amount)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                {formatCurrencyFull(pr.amount)}
              </div>
            </div>
            <Tag
              color={statusCfg.color}
              style={{ fontSize: 13, padding: '4px 14px', borderRadius: 6, fontWeight: 500 }}
            >
              {statusCfg.label}
            </Tag>
          </div>

          {/* Status progress mini bar */}
          {step >= 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.15)' }}>
                <div style={{
                  width: `${progressPct}%`, height: '100%',
                  background: 'linear-gradient(90deg, #34d399, #fbbf24, #60a5fa)',
                  borderRadius: 2, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {['Tạo', 'Gửi', 'Xem xét', 'Duyệt', 'Thanh toán'].map((label, i) => (
                  <Text key={label} style={{
                    fontSize: 9, color: i <= step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                    fontWeight: i === step ? 600 : 400,
                  }}>{label}</Text>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 28px' }}>
          {/* Related alerts */}
          {relatedAlerts.map(alert => (
            <Alert
              key={alert.id}
              type={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
              message={alert.title}
              showIcon closable
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          ))}

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phòng ban</Text>
              <Text strong style={{ fontSize: 13 }}>{getDepartmentName(pr.departmentId)}</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Loại hạng mục</Text>
              <Tag color={typeCfg?.color} style={{ margin: '2px 0 0', fontSize: 11 }}>{typeCfg?.label}</Tag>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Nhiệm vụ</Text>
              <Text strong style={{ fontSize: 12 }}>{task?.name || '—'}</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Phương thức TT</Text>
              <Text strong style={{ fontSize: 13 }}>{paymentMethodLabel}</Text>
            </div>
            {pr.vendor && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Nhà cung cấp</Text>
                <Text strong style={{ fontSize: 12 }}>{pr.vendor}</Text>
              </div>
            )}
            {pr.contractNo && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <Text style={{ fontSize: 10, color: '#999', display: 'block' }}>Số hợp đồng</Text>
                <Text strong style={{ fontSize: 13 }}>{pr.contractNo}</Text>
              </div>
            )}
          </div>

          {/* Description */}
          {pr.description && (
            <div style={{ padding: '14px 16px', background: '#f0f7ff', borderRadius: 10, marginBottom: 20, borderLeft: `3px solid ${colors.navy}` }}>
              <Text style={{ fontSize: 10, color: '#999', display: 'block', marginBottom: 4 }}>Mô tả chi tiết</Text>
              <Text style={{ fontSize: 13 }}>{pr.description}</Text>
            </div>
          )}

          {/* Allocation info */}
          {allocation && (
            <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              title={<Space><BankOutlined style={{ color: colors.navy }} /><span style={{ fontSize: 13 }}>Ngân sách phân bổ</span></Space>}
            >
              <Row gutter={12}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: colors.navy, display: 'block' }}>
                      {formatCurrency(allocation.totalAllocated)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Tổng phân bổ</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: '#059669', display: 'block' }}>
                      {formatCurrency(allocation.spent)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Đã chi</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: '#d97706', display: 'block' }}>
                      {formatCurrency(allocation.remaining)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>Còn lại</Text>
                  </div>
                </Col>
              </Row>
              <Progress
                percent={allocation.totalAllocated > 0 ? Math.round((allocation.spent / allocation.totalAllocated) * 100) : 0}
                strokeColor={getProgressColor(allocation.totalAllocated > 0 ? Math.round((allocation.spent / allocation.totalAllocated) * 100) : 0)}
                size="small" style={{ marginTop: 4 }}
              />
            </Card>
          )}

          {/* Attachments */}
          {pr.attachments && pr.attachments.length > 0 && (
            <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              title={<span style={{ fontSize: 13 }}>Tài liệu đính kèm ({pr.attachments.length})</span>}>
              {pr.attachments.map(att => (
                <div key={att.id} style={{
                  padding: '8px 0', borderBottom: '1px solid #f5f5f5',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {fileIconMap[att.type] || <FileTextOutlined style={{ fontSize: 18, color: '#999' }} />}
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>{att.name}</Text>
                    <Text type="secondary" style={{ fontSize: 10, marginLeft: 8 }}>{att.size}</Text>
                  </div>
                  <Button type="link" size="small">Tải xuống</Button>
                </div>
              ))}
            </Card>
          )}

          {/* Timeline */}
          <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<span style={{ fontSize: 13 }}>Lịch sử xử lý</span>}>
            <Timeline items={timelineItems} />
          </Card>

          {/* Review actions */}
          {canReview && !isDepartment && (
            <Card size="small" style={{ borderRadius: 10, border: '1px dashed #d9d9d9' }}
              bodyStyle={{ padding: '16px 20px' }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Phê duyệt đề nghị</Text>
              <Space>
                <Button type="primary" icon={<CheckCircleOutlined />}
                  onClick={() => message.success('Đã phê duyệt đề nghị thanh toán!')}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                  Phê duyệt
                </Button>
                <Button danger icon={<CloseCircleOutlined />}
                  onClick={() => message.warning('Đã từ chối đề nghị thanh toán.')}>
                  Từ chối
                </Button>
                <Button icon={<ExclamationCircleOutlined />}
                  onClick={() => message.info('Đã yêu cầu bổ sung hồ sơ.')}>
                  Yêu cầu bổ sung
                </Button>
              </Space>
            </Card>
          )}
        </div>
      </Drawer>
    );
  };

  return (
    <div>
      <style>{prStyles}</style>

      {/* Header row: Title + action button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ color: colors.navy, margin: 0 }}>Đề nghị thanh toán</Title>
        {isDepartment && (
          <Button type="primary" icon={<PlusOutlined />} size="large"
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 8, fontWeight: 500 }}>
            Tạo đề nghị thanh toán
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="pr-stat-card" style={{
              background: card.gradient,
              borderRadius: 12, padding: '14px 16px 12px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div className="pr-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
              }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.title}
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {card.value} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.suffix}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FilterOutlined style={{ color: '#999' }} />
          <Select
            allowClear
            placeholder="Phòng ban"
            style={{ width: 180 }}
            value={filterDept}
            onChange={setFilterDept}
            options={departments.map(d => ({ label: d.shortName, value: d.id }))}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 160 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={Object.entries(paymentStatusConfig).map(([key, cfg]) => ({ label: cfg.label, value: key }))}
          />
          <Input
            placeholder="Tìm kiếm mã, nội dung..."
            prefix={<SearchOutlined />}
            style={{ width: 260 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
            Hiển thị {filteredData.length} / {paymentRequests.length} đề nghị
          </Text>
        </div>
      </Card>

      {/* Payment request cards */}
      {filteredData.length === 0 ? (
        <Card style={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Empty description="Không có đề nghị thanh toán nào" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map(pr => {
            const task = tasks2026.find(t => t.id === pr.taskId);
            const statusCfg = paymentStatusConfig[pr.status];
            const typeCfg = categoryTypeConfig[pr.categoryType];
            const step = statusSteps[pr.status];
            const isActive = ['submitted', 'reviewing'].includes(pr.status);

            return (
              <Col xs={24} lg={12} key={pr.id}>
                <div className="pr-item-card" onClick={() => openDetail(pr)}
                  style={{
                    background: '#fff', borderRadius: 10, overflow: 'hidden',
                    borderLeft: `4px solid ${statusCfg.color === 'default' ? '#d9d9d9' : statusCfg.color}`,
                  }}>
                  <div style={{ padding: '14px 18px' }}>
                    {/* Row 1: Code + Status + Amount */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <Space size={8}>
                          <Text style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>{pr.code}</Text>
                          <Tag color={typeCfg?.color} style={{ fontSize: 10, margin: 0, border: 'none', lineHeight: '18px' }}>{typeCfg?.label}</Tag>
                        </Space>
                      </div>
                      <Tag color={statusCfg.color} style={{ fontSize: 11, margin: 0, fontWeight: 500 }}>
                        {statusCfg.label}
                      </Tag>
                    </div>

                    {/* Row 2: Title */}
                    <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 6, lineHeight: '20px' }}>
                      {pr.title}
                    </Text>

                    {/* Row 3: Task + Dept */}
                    <div style={{ marginBottom: 10 }}>
                      {task && <Text style={{ fontSize: 12, color: '#666' }}>{task.name}</Text>}
                      <div style={{ marginTop: 2 }}>
                        <Text style={{ fontSize: 11, color: '#999' }}>{getDepartmentName(pr.departmentId)}</Text>
                        {pr.vendor && <Text style={{ fontSize: 11, color: '#bbb', marginLeft: 10 }}>· {pr.vendor}</Text>}
                      </div>
                    </div>

                    {/* Row 4: Amount + Date + Attachments */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>
                        {formatCurrency(pr.amount)}
                      </Text>
                      <Space size={12}>
                        {pr.attachments.length > 0 && (
                          <Space size={4}>
                            <FileTextOutlined style={{ fontSize: 12, color: '#bbb' }} />
                            <Text style={{ fontSize: 11, color: '#bbb' }}>{pr.attachments.length}</Text>
                          </Space>
                        )}
                        {pr.submittedAt && (
                          <Text style={{ fontSize: 11, color: '#bbb' }}>
                            <ClockCircleOutlined style={{ marginRight: 3 }} />
                            {formatDate(pr.submittedAt)}
                          </Text>
                        )}
                      </Space>
                    </div>

                    {/* Progress mini bar for active items */}
                    {isActive && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: '#f0f0f0' }}>
                          <div style={{
                            width: `${step >= 0 ? (step / 4) * 100 : 0}%`,
                            height: '100%',
                            background: statusCfg.color === 'processing' ? '#1890ff' : statusCfg.color,
                            borderRadius: 2, transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Detail Drawer */}
      {renderDetailDrawer()}

      {/* Create Drawer */}
      <Drawer
        title={null}
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); form.resetFields(); }}
        width={620}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
      >
        {/* Gradient header */}
        <div style={{
          background: `linear-gradient(135deg, #059669 0%, #34d399 100%)`,
          padding: '20px 28px 16px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Tạo đề nghị thanh toán</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Điền đầy đủ thông tin bên dưới</div>
            </div>
            <Button type="text" onClick={() => { setIsModalOpen(false); form.resetFields(); }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>×</Button>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: 'Chọn phòng ban' }]}>
                  <Select placeholder="Chọn phòng ban">
                    {departments.map(d => (
                      <Select.Option key={d.id} value={d.id}>{d.shortName} - {d.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="categoryType" label="Loại hạng mục" rules={[{ required: true, message: 'Chọn loại hạng mục' }]}>
                  <Select placeholder="Chọn loại hạng mục">
                    {Object.entries(categoryTypeConfig).map(([key, cfg]) => (
                      <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="taskId" label="Nhiệm vụ" rules={[{ required: true, message: 'Chọn nhiệm vụ' }]}>
              <Select placeholder="Chọn nhiệm vụ">
                {tasks2026.map(t => (
                  <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="title" label="Nội dung chi" rules={[{ required: true, message: 'Nhập nội dung' }]}>
              <Input.TextArea rows={2} placeholder="Mô tả nội dung thanh toán" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="amount" label="Số tiền (triệu đồng)" rules={[{ required: true, message: 'Nhập số tiền' }]}>
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="paymentMethod" label="Phương thức TT" rules={[{ required: true, message: 'Chọn PT' }]}>
                  <Select placeholder="Chọn">
                    <Select.Option value="transfer">Chuyển khoản</Select.Option>
                    <Select.Option value="advance">Tạm ứng</Select.Option>
                    <Select.Option value="direct">Trực tiếp</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="contractNo" label="Số hợp đồng">
                  <Input placeholder="VD: HĐ-2026-XXX" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="vendor" label="Nhà cung cấp">
              <Input placeholder="Tên nhà cung cấp / đơn vị thụ hưởng" />
            </Form.Item>

            <Divider style={{ margin: '16px 0' }} />

            <Form.Item name="attachments" label="Tài liệu đính kèm">
              <Upload beforeUpload={() => false} multiple>
                <Button icon={<UploadOutlined />}>Chọn tệp đính kèm</Button>
              </Upload>
            </Form.Item>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
                Hủy
              </Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleCreateSubmit}
                style={{ fontWeight: 500 }}>
                Gửi đề nghị
              </Button>
            </div>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default PaymentRequestPage;
