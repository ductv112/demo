import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Select, Typography, Drawer,
  Descriptions, Form, DatePicker, Input, InputNumber, Row, Col,
  Timeline, message, Dropdown, Badge,
} from 'antd';
import {
  PlusOutlined, ScheduleOutlined, EditOutlined, CheckOutlined,
  FilterOutlined, CloseOutlined, EyeOutlined,
  DatabaseOutlined, ClockCircleOutlined, CheckCircleOutlined, DollarOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { lifecyclePlans } from '../../data/lifecyclePlans';
import { equipmentList } from '../../data/equipment';
import type { LifecyclePlan, LifecyclePhase, LifecyclePlanStatus } from '../../types';
import {
  lifecyclePhaseConfig, lifecyclePlanStatusConfig,
  formatDate, formatCurrency,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;

const LifecyclePlanPage: React.FC = () => {
  const { isVongDoi, isDirector } = useUser();

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | null>(null);

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LifecyclePlan | null>(null);

  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const filtered = useMemo(() => {
    return lifecyclePlans.filter(p => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterPhase && p.phase !== filterPhase) return false;
      if (filterYear && p.planYear !== filterYear) return false;
      return true;
    });
  }, [filterStatus, filterPhase, filterYear]);

  // ─── Summary stats ──────────────────────────────────────────────
  const stats = {
    total: lifecyclePlans.length,
    inProgress: lifecyclePlans.filter(p => p.status === 'in_progress').length,
    pending: lifecyclePlans.filter(p => p.status === 'pending_approval' || p.status === 'draft').length,
    completed: lifecyclePlans.filter(p => p.status === 'completed').length,
    totalCost: lifecyclePlans.reduce((sum, p) => sum + p.estimatedCost, 0),
  };

  const handleView = (record: LifecyclePlan) => {
    setSelectedPlan(record);
    setViewDrawerOpen(true);
  };

  const handleEdit = (record: LifecyclePlan) => {
    setSelectedPlan(record);
    form.setFieldsValue({
      ...record,
      plannedStartDate: dayjs(record.plannedStartDate),
      plannedEndDate: dayjs(record.plannedEndDate),
      actualStartDate: record.actualStartDate ? dayjs(record.actualStartDate) : undefined,
      actualEndDate: record.actualEndDate ? dayjs(record.actualEndDate) : undefined,
    });
    setEditDrawerOpen(true);
  };

  const handleApprove = (record: LifecyclePlan) => {
    msg.success(`Đã phê duyệt kế hoạch vòng đời: ${record.equipmentName}`);
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      msg.success('Đã lưu kế hoạch vòng đời thành công');
      setEditDrawerOpen(false);
      setAddDrawerOpen(false);
      form.resetFields();
    });
  };

  // ─── Calculate progress ─────────────────────────────────────────
  const getDaysInfo = (plan: LifecyclePlan) => {
    const now = new Date('2026-04-15');
    const start = new Date(plan.plannedStartDate);
    const end = new Date(plan.plannedEndDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = total > 0 ? Math.min(Math.round((elapsed / total) * 100), 100) : 0;
    const daysLeft = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { progress: Math.max(0, progress), daysLeft };
  };

  const columns: ColumnsType<LifecyclePlan> = [
    {
      title: 'Trang thiết bị',
      key: 'equipment',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{record.equipmentName}</div>
          <Text code style={{ fontSize: 11 }}>{record.equipmentCode}</Text>
        </div>
      ),
    },
    {
      title: 'Giai đoạn VĐ',
      dataIndex: 'phase',
      key: 'phase',
      width: 150,
      render: (phase: LifecyclePhase) => (
        <Tag color={lifecyclePhaseConfig[phase]?.color} style={{ fontSize: 11 }}>
          {lifecyclePhaseConfig[phase]?.label}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 145,
      render: (status: LifecyclePlanStatus) => (
        <Tag color={lifecyclePlanStatusConfig[status]?.color} style={{ fontSize: 11 }}>
          {lifecyclePlanStatusConfig[status]?.label}
        </Tag>
      ),
    },
    {
      title: 'Thời gian kế hoạch',
      key: 'dates',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12 }}>{formatDate(record.plannedStartDate)}</div>
          <div style={{ fontSize: 11, color: '#999' }}>đến {formatDate(record.plannedEndDate)}</div>
        </div>
      ),
    },
    {
      title: 'Tiến độ / Còn lại',
      key: 'progress',
      width: 130,
      render: (_, record) => {
        const { daysLeft } = getDaysInfo(record);
        if (record.status === 'completed') {
          return <Tag color="success" style={{ fontSize: 11 }}>Hoàn thành</Tag>;
        }
        if (record.status === 'in_progress') {
          return (
            <div>
              <div style={{ fontSize: 12, color: daysLeft < 0 ? '#ff4d4f' : daysLeft <= 30 ? '#faad14' : '#52c41a', fontWeight: 600 }}>
                {daysLeft < 0 ? `Trễ ${Math.abs(daysLeft)} ngày` : `Còn ${daysLeft} ngày`}
              </div>
            </div>
          );
        }
        return (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.status === 'draft' ? 'Chưa phê duyệt' : 'Chờ bắt đầu'}
          </Text>
        );
      },
    },
    {
      title: 'Phòng phụ trách',
      dataIndex: 'responsibleDeptName',
      key: 'dept',
      width: 160,
      render: (name) => <Text style={{ fontSize: 12 }}>{name}</Text>,
    },
    {
      title: 'Chi phí (dự toán)',
      dataIndex: 'estimatedCost',
      key: 'cost',
      width: 130,
      render: (cost) => <Text strong style={{ fontSize: 12, color: '#1B3A5C' }}>{formatCurrency(cost)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 48,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(isVongDoi ? [{ key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' }] : []),
              ...((isDirector || isVongDoi) && record.status === 'pending_approval'
                ? [{ key: 'approve', icon: <CheckOutlined />, label: 'Phê duyệt', style: { color: '#52c41a' } }]
                : []),
            ],
            onClick: ({ key }) => {
              if (key === 'view') handleView(record);
              if (key === 'edit') handleEdit(record);
              if (key === 'approve') handleApprove(record);
            },
          }}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  // ─── Form for add/edit ──────────────────────────────────────────
  const renderForm = () => (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="equipmentId" label="Trang thiết bị" rules={[{ required: true }]}>
        <Select placeholder="Chọn trang thiết bị" showSearch optionFilterProp="children">
          {equipmentList.map(e => (
            <Option key={e.id} value={e.id}>{e.name} — {e.code}</Option>
          ))}
        </Select>
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="phase" label="Giai đoạn vòng đời" rules={[{ required: true }]}>
            <Select placeholder="Chọn giai đoạn">
              {Object.entries(lifecyclePhaseConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select placeholder="Trạng thái kế hoạch">
              {Object.entries(lifecyclePlanStatusConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="plannedStartDate" label="Ngày bắt đầu KH" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="plannedEndDate" label="Ngày kết thúc KH" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="actualStartDate" label="Ngày bắt đầu thực tế">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="actualEndDate" label="Ngày kết thúc thực tế">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="responsibleDeptId" label="Phòng phụ trách" rules={[{ required: true }]}>
            <Select placeholder="Chọn phòng ban">
              <Option value="PX1">TT Monitoring</Option>
              <Option value="PX2">TT Sản phẩm</Option>
              <Option value="PX3">TT Hạ tầng</Option>
              <Option value="PX4">TT Tích hợp</Option>
              <Option value="PKT">Phòng Kỹ thuật</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="estimatedCost" label="Chi phí dự toán (triệu VND)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="tr" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="planYear" label="Năm kế hoạch" rules={[{ required: true }]}>
            <InputNumber min={2020} max={2035} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Mô tả công việc" rules={[{ required: true }]}>
        <Input.TextArea rows={4} placeholder="Mô tả chi tiết công việc cần thực hiện..." />
      </Form.Item>
      <Form.Item name="notes" label="Ghi chú">
        <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScheduleOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Kế hoạch Vòng đời Trang thiết bị</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Lập, theo dõi và phê duyệt kế hoạch vòng đời cho toàn bộ trang thiết bị</Text>
                </div>
              </Space>
            </Col>
            {isVongDoi && (
              <Col>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => { form.resetFields(); setAddDrawerOpen(true); }}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}
                >
                  Tạo kế hoạch
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { title: 'Tổng kế hoạch', value: stats.total, unit: 'kế hoạch', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <DatabaseOutlined /> },
          { title: 'Đang thực hiện', value: stats.inProgress, unit: 'kế hoạch', gradient: 'linear-gradient(135deg, #7c3aed, #9333ea)', icon: <ClockCircleOutlined /> },
          { title: 'Chờ phê duyệt', value: stats.pending, unit: 'kế hoạch', gradient: 'linear-gradient(135deg, #b45309, #d97706)', icon: <ScheduleOutlined /> },
          { title: 'Đã hoàn thành', value: stats.completed, unit: 'kế hoạch', gradient: 'linear-gradient(135deg, #166534, #16a34a)', icon: <CheckCircleOutlined /> },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</span>
                  {card.unit && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 6 }}>{card.unit}</span>}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 10 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          <Select
            placeholder={<><FilterOutlined /> Trạng thái</>}
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v || '')}
            style={{ width: 160 }}
            allowClear
          >
            {Object.entries(lifecyclePlanStatusConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Giai đoạn VĐ"
            value={filterPhase || undefined}
            onChange={v => setFilterPhase(v || '')}
            style={{ width: 160 }}
            allowClear
          >
            {Object.entries(lifecyclePhaseConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Năm"
            value={filterYear || undefined}
            onChange={v => setFilterYear(v || null)}
            style={{ width: 100 }}
            allowClear
          >
            {[2024, 2025, 2026, 2027].map(y => <Option key={y} value={y}>{y}</Option>)}
          </Select>
          {(isDirector) && (
            <Badge count={lifecyclePlans.filter(p => p.status === 'pending_approval').length} offset={[4, 0]}>
              <Button
                type={filterStatus === 'pending_approval' ? 'primary' : 'default'}
                icon={<CheckOutlined />}
                onClick={() => setFilterStatus(filterStatus === 'pending_approval' ? '' : 'pending_approval')}
                size="small"
              >
                Chờ phê duyệt
              </Button>
            </Badge>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị {filtered.length}/{lifecyclePlans.length} kế hoạch
          </Text>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} kế hoạch` }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* View drawer */}
      <Drawer
        title={
          selectedPlan ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1B3A5C' }}>{selectedPlan.equipmentName}</div>
              <Space style={{ marginTop: 4 }}>
                <Tag color={lifecyclePhaseConfig[selectedPlan.phase]?.color} style={{ fontSize: 11 }}>
                  {lifecyclePhaseConfig[selectedPlan.phase]?.label}
                </Tag>
                <Tag color={lifecyclePlanStatusConfig[selectedPlan.status]?.color} style={{ fontSize: 11 }}>
                  {lifecyclePlanStatusConfig[selectedPlan.status]?.label}
                </Tag>
              </Space>
            </div>
          ) : 'Chi tiết kế hoạch vòng đời'
        }
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        width={580}
        footer={
          <Space>
            {isVongDoi && selectedPlan && (
              <Button icon={<EditOutlined />} onClick={() => { setViewDrawerOpen(false); handleEdit(selectedPlan); }}>
                Chỉnh sửa
              </Button>
            )}
            {(isDirector || isVongDoi) && selectedPlan?.status === 'pending_approval' && (
              <Button type="primary" icon={<CheckOutlined />} onClick={() => { handleApprove(selectedPlan!); setViewDrawerOpen(false); }}>
                Phê duyệt
              </Button>
            )}
            <Button onClick={() => setViewDrawerOpen(false)}>Đóng</Button>
          </Space>
        }
      >
        {selectedPlan && (
          <div>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã thiết bị" span={2}>
                <Text code>{selectedPlan.equipmentCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giai đoạn">
                <Tag color={lifecyclePhaseConfig[selectedPlan.phase]?.color}>
                  {lifecyclePhaseConfig[selectedPlan.phase]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Năm kế hoạch">{selectedPlan.planYear}</Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu KH">{formatDate(selectedPlan.plannedStartDate)}</Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc KH">{formatDate(selectedPlan.plannedEndDate)}</Descriptions.Item>
              {selectedPlan.actualStartDate && (
                <Descriptions.Item label="Ngày bắt đầu TT">{formatDate(selectedPlan.actualStartDate)}</Descriptions.Item>
              )}
              {selectedPlan.actualEndDate && (
                <Descriptions.Item label="Ngày kết thúc TT">{formatDate(selectedPlan.actualEndDate)}</Descriptions.Item>
              )}
              <Descriptions.Item label="Phòng phụ trách">{selectedPlan.responsibleDeptName}</Descriptions.Item>
              <Descriptions.Item label="Chi phí dự toán">
                <Text strong style={{ color: '#1B3A5C' }}>{formatCurrency(selectedPlan.estimatedCost)}</Text>
              </Descriptions.Item>
              {selectedPlan.actualCost && (
                <Descriptions.Item label="Chi phí thực tế">
                  <Text strong style={{ color: '#52c41a' }}>{formatCurrency(selectedPlan.actualCost)}</Text>
                </Descriptions.Item>
              )}
              {selectedPlan.approvedBy && (
                <Descriptions.Item label="Người phê duyệt">{selectedPlan.approvedBy}</Descriptions.Item>
              )}
              {selectedPlan.approvedDate && (
                <Descriptions.Item label="Ngày phê duyệt">{formatDate(selectedPlan.approvedDate)}</Descriptions.Item>
              )}
            </Descriptions>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Mô tả công việc</Text>
              <div style={{ marginTop: 6, padding: '10px 12px', background: '#eff6ff', borderRadius: 6, fontSize: 13, lineHeight: '1.6' }}>
                {selectedPlan.description}
              </div>
            </div>
            {selectedPlan.notes && (
              <div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Ghi chú</Text>
                <div style={{ marginTop: 6, padding: '10px 12px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f', fontSize: 12 }}>
                  {selectedPlan.notes}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Timeline thực hiện</Text>
              <Timeline
                style={{ marginTop: 12 }}
                items={[
                  {
                    color: '#1B3A5C',
                    children: <div><strong>Tạo kế hoạch</strong> <Text type="secondary" style={{ fontSize: 11 }}>(Phòng KT)</Text></div>,
                  },
                  {
                    color: selectedPlan.status !== 'draft' ? '#52c41a' : '#d9d9d9',
                    children: (
                      <div>
                        <strong>Phê duyệt kế hoạch</strong>
                        {selectedPlan.approvedBy && (
                          <Text type="secondary" style={{ fontSize: 11 }}> — {selectedPlan.approvedBy} ({selectedPlan.approvedDate ? formatDate(selectedPlan.approvedDate) : ''})</Text>
                        )}
                      </div>
                    ),
                  },
                  {
                    color: selectedPlan.status === 'in_progress' || selectedPlan.status === 'completed' ? '#7c3aed' : '#d9d9d9',
                    children: (
                      <div>
                        <strong>Bắt đầu thực hiện</strong>
                        {selectedPlan.actualStartDate && (
                          <Text type="secondary" style={{ fontSize: 11 }}> — {formatDate(selectedPlan.actualStartDate)}</Text>
                        )}
                      </div>
                    ),
                  },
                  {
                    color: selectedPlan.status === 'completed' ? '#52c41a' : '#d9d9d9',
                    children: (
                      <div>
                        <strong>Hoàn thành &amp; nghiệm thu</strong>
                        {selectedPlan.actualEndDate && (
                          <Text type="secondary" style={{ fontSize: 11 }}> — {formatDate(selectedPlan.actualEndDate)}</Text>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Add drawer */}
      <Drawer
        title={<Space><PlusOutlined style={{ color: '#1B3A5C' }} /><span style={{ fontWeight: 700, color: '#1B3A5C' }}>Tạo kế hoạch vòng đời mới</span></Space>}
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        width={600}
        footer={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleSave}>Tạo kế hoạch</Button>
            <Button onClick={() => setAddDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        {renderForm()}
      </Drawer>

      {/* Edit drawer */}
      <Drawer
        title={<Space><EditOutlined style={{ color: '#1B3A5C' }} /><span style={{ fontWeight: 700, color: '#1B3A5C' }}>Chỉnh sửa kế hoạch vòng đời</span></Space>}
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        width={600}
        footer={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleSave}>Lưu thay đổi</Button>
            <Button onClick={() => setEditDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        {renderForm()}
      </Drawer>
    </div>
  );
};

export default LifecyclePlanPage;
