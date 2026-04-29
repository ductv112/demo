import React, { useState, useMemo } from 'react';
import {
  Button, Card, Row, Col, Table, Tag, Progress, Typography, Dropdown, Modal,
  Input, Select, Space, message, Drawer, Form, DatePicker, InputNumber,
} from 'antd';
import {
  ProjectOutlined, CheckCircleOutlined,
  WarningOutlined, ScheduleOutlined, MoreOutlined, EditOutlined,
  SearchOutlined, SyncOutlined, ExclamationCircleOutlined,
  RiseOutlined, FallOutlined, FileTextOutlined, ThunderboltOutlined,
  AimOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { contracts, workItems } from '../../data/contracts';
import { getDepartmentShortName } from '../../data/departments';
import {
  formatDate, formatCurrency, workItemStatusConfig, workItemTypeConfig, getProgressColor,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { WorkItem } from '../../types';

const { Title, Text } = Typography;

const calcExpectedProgress = (start: string, end: string): number => {
  const s = dayjs(start);
  const e = dayjs(end);
  const today = dayjs();
  if (today.isBefore(s)) return 0;
  if (today.isAfter(e)) return 100;
  return Math.min(100, Math.round(today.diff(s, 'day') / (e.diff(s, 'day') || 1) * 100));
};

const ProgressTracking: React.FC = () => {
  const { currentUser, isDepartment } = useUser();
  const deptId = currentUser.departmentId;
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterContract, setFilterContract] = useState<string | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [adjustDrawerOpen, setAdjustDrawerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<TableRecord | null>(null);
  const [reportForm] = Form.useForm();
  const [adjustForm] = Form.useForm();

  type TableRecord = WorkItem & {
    contractCode: string;
    delayDays: number;
    expectedProgress: number;
    costRatio: number;
  };

  const roleWorkItems = useMemo(() => {
    if (isDepartment) return workItems.filter(wi => wi.assignedUnit === deptId);
    return workItems;
  }, [isDepartment, deptId]);

  const roleContracts = useMemo(() => {
    const ids = new Set(roleWorkItems.map(wi => wi.contractId));
    return contracts.filter(c => ids.has(c.id));
  }, [roleWorkItems]);

  const getDelayDays = (item: WorkItem): number => {
    if (item.status === 'completed' || item.status === 'pending') return 0;
    const today = dayjs();
    if (today.isAfter(dayjs(item.plannedEnd))) return today.diff(dayjs(item.plannedEnd), 'day');
    const exp = calcExpectedProgress(item.plannedStart, item.plannedEnd);
    if (item.progress < exp - 15) {
      const total = dayjs(item.plannedEnd).diff(dayjs(item.plannedStart), 'day') || 1;
      return Math.round((exp - item.progress) * total / 100);
    }
    return 0;
  };

  const getCostRatio = (item: WorkItem): number =>
    item.plannedCost === 0 ? 0 : Math.round(item.actualCost / item.plannedCost * 100);

  const stats = useMemo(() => {
    const contractIds = new Set(roleWorkItems.map(wi => wi.contractId));
    const onTrack = roleWorkItems.filter(wi => wi.status === 'in_progress' && getDelayDays(wi) === 0).length;
    const behind = roleWorkItems.filter(wi => wi.status === 'in_progress' && getDelayDays(wi) > 0).length;
    const overBudget = roleWorkItems.filter(wi => wi.status !== 'completed' && getCostRatio(wi) > 80).length;
    const completed = roleWorkItems.filter(wi => wi.status === 'completed').length;
    return { contracts: contractIds.size, onTrack, behind, overBudget, completed };
  }, [roleWorkItems]);

  const filteredWorkItems = useMemo(() => {
    let result = roleWorkItems;
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(wi => wi.name.toLowerCase().includes(kw) || wi.code.toLowerCase().includes(kw));
    }
    if (filterStatus) result = result.filter(wi => wi.status === filterStatus);
    if (filterContract) result = result.filter(wi => wi.contractId === filterContract);
    return result;
  }, [roleWorkItems, searchText, filterStatus, filterContract]);

  const tableData = useMemo<TableRecord[]>(() => {
    return filteredWorkItems.map(wi => ({
      ...wi,
      contractCode: contracts.find(c => c.id === wi.contractId)?.code || wi.contractId,
      delayDays: getDelayDays(wi),
      expectedProgress: calcExpectedProgress(wi.plannedStart, wi.plannedEnd),
      costRatio: getCostRatio(wi),
    }));
  }, [filteredWorkItems]);

  // ─── Sync ────────────────────────────────────────────────────────────────
  const handleSync = () => {
    setSyncing(true);
    message.loading({ content: 'Đang đồng bộ dữ liệu từ các phân hệ...', key: 'sync', duration: 2 });
    setTimeout(() => {
      setSyncing(false);
      message.destroy('sync');
      Modal.success({
        title: 'Đồng bộ dữ liệu hoàn tất',
        width: 420,
        content: (
          <div style={{ paddingTop: 8 }}>
            <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px' }}>
              {(['Quản lý Sửa chữa', 'Quản lý Đại tu', 'Quản lý Sản xuất'] as const).map(s => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ fontSize: 13 }}>{s}</span><Tag color="blue">Đã cập nhật</Tag>
                </div>
              ))}
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              {dayjs().format('DD/MM/YYYY HH:mm:ss')}
            </Text>
          </div>
        ),
      });
    }, 2000);
  };

  // ─── Báo cáo tiến độ ─────────────────────────────────────────────────────
  const handleOpenReport = (record: TableRecord) => {
    setActiveItem(record);
    reportForm.setFieldsValue({ reportDate: dayjs(), progressPercent: record.progress, quantityCompleted: record.completedQuantity });
    setReportDrawerOpen(true);
  };
  const handleSaveReport = () => {
    reportForm.validateFields().then(values => {
      message.success(`Đã ghi nhận tiến độ ${activeItem?.code}: ${values.progressPercent}%`);
      setReportDrawerOpen(false);
      setActiveItem(null);
    });
  };

  // ─── Điều chỉnh kế hoạch ─────────────────────────────────────────────────
  const handleOpenAdjust = (record: TableRecord) => {
    setActiveItem(record);
    adjustForm.setFieldsValue({ newPlannedEnd: dayjs(record.plannedEnd), reason: '' });
    setAdjustDrawerOpen(true);
  };
  const handleSaveAdjust = () => {
    adjustForm.validateFields().then(values => {
      message.success(`Đã điều chỉnh kế hoạch ${activeItem?.code}: hạn mới ${values.newPlannedEnd.format('DD/MM/YYYY')}`);
      setAdjustDrawerOpen(false);
      setActiveItem(null);
    });
  };

  // ─── Columns ─────────────────────────────────────────────────────────────
  const columns: ColumnsType<TableRecord> = [
    {
      title: 'Hợp đồng', dataIndex: 'contractCode', key: 'contractCode', width: 140,
      render: (text: string) => <Text strong style={{ fontSize: 12, color: colors.navy }}>{text}</Text>,
    },
    {
      title: 'Mã WBS', dataIndex: 'code', key: 'code', width: 110,
      render: (text: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{text}</Text>,
    },
    { title: 'Tên công việc', dataIndex: 'name', key: 'name', ellipsis: true, minWidth: 180 },
    {
      title: 'Loại', dataIndex: 'workType', key: 'workType', width: 90,
      render: (type: string) => {
        const cfg = workItemTypeConfig[type as keyof typeof workItemTypeConfig];
        return cfg ? <Tag color={cfg.color} style={{ fontSize: 10 }}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Đơn vị', dataIndex: 'assignedUnit', key: 'assignedUnit', width: 70,
      render: (unit: string) => <Tag style={{ fontSize: 11 }}>{getDepartmentShortName(unit)}</Tag>,
    },
    {
      title: 'Khối lượng', key: 'quantity', width: 80, align: 'center' as const,
      render: (_: unknown, r: TableRecord) => (
        <Text style={{ fontSize: 12 }}>
          <Text strong style={{ color: r.completedQuantity >= r.plannedQuantity ? '#059669' : colors.navy }}>{r.completedQuantity}</Text>
          <Text type="secondary">/{r.plannedQuantity}</Text>
        </Text>
      ),
    },
    {
      title: 'Tiến độ TT / KH', key: 'progress', width: 155,
      render: (_: unknown, r: TableRecord) => (
        <div>
          <Progress percent={r.progress} size="small" strokeColor={getProgressColor(r.progress)} format={p => `${p}%`} />
          {r.status === 'in_progress' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {r.progress >= r.expectedProgress
                ? <RiseOutlined style={{ color: '#059669', fontSize: 10 }} />
                : <FallOutlined style={{ color: '#dc2626', fontSize: 10 }} />}
              <Text style={{ fontSize: 10, color: r.progress >= r.expectedProgress ? '#059669' : '#dc2626' }}>
                KH: {r.expectedProgress}%{r.progress < r.expectedProgress ? ` (chậm ${r.expectedProgress - r.progress}%)` : ''}
              </Text>
            </div>
          )}
        </div>
      ),
      sorter: (a: TableRecord, b: TableRecord) => a.progress - b.progress,
    },
    {
      title: 'Chi phí', key: 'cost', width: 120,
      render: (_: unknown, r: TableRecord) => (
        <div>
          <Text style={{ fontSize: 12 }}>{formatCurrency(r.actualCost)}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}> / {formatCurrency(r.plannedCost)}</Text>
          {r.costRatio > 80 && r.status !== 'completed' && (
            <div><Tag color={r.costRatio > 100 ? 'red' : 'orange'} style={{ fontSize: 9, marginTop: 2 }}>{r.costRatio}% dự toán</Tag></div>
          )}
        </div>
      ),
    },
    {
      title: 'Sai lệch', key: 'delay', width: 90, align: 'center' as const,
      render: (_: unknown, r: TableRecord) => {
        if (r.status === 'completed') return <Tag color="green" style={{ fontSize: 10 }}>Hoàn thành</Tag>;
        if (r.delayDays > 0) return <Tag color="red" style={{ fontSize: 10 }}><ExclamationCircleOutlined /> Trễ {r.delayDays}d</Tag>;
        if (r.status === 'pending') return <Tag color="blue" style={{ fontSize: 10 }}>Chờ TH</Tag>;
        return <Tag color="green" style={{ fontSize: 10 }}>Đúng KH</Tag>;
      },
      sorter: (a: TableRecord, b: TableRecord) => a.delayDays - b.delayDays,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110,
      render: (status: string) => {
        const cfg = workItemStatusConfig[status as keyof typeof workItemStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: '', key: 'action', width: 45, fixed: 'right' as const,
      render: (_: unknown, record: TableRecord) => {
        if (record.status !== 'in_progress') return null;
        return (
          <Dropdown
            menu={{
              items: [
                { key: 'report', icon: <FileTextOutlined />, label: 'Báo cáo tiến độ' },
                { key: 'adjust', icon: <EditOutlined />, label: 'Điều chỉnh kế hoạch' },
              ],
              onClick: ({ key }) => {
                if (key === 'report') handleOpenReport(record);
                if (key === 'adjust') handleOpenAdjust(record);
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

  const statCards = [
    { title: 'Hợp đồng đang TH', value: stats.contracts, suffix: 'HĐ', icon: <ProjectOutlined />, gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)` },
    { title: 'Đúng tiến độ', value: stats.onTrack, suffix: 'hạng mục', icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' },
    { title: 'Chậm tiến độ', value: stats.behind, suffix: 'hạng mục', icon: <WarningOutlined />, gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' },
    { title: 'Cảnh báo chi phí', value: stats.overBudget, suffix: 'hạng mục', icon: <ExclamationCircleOutlined />, gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)' },
    { title: 'Hoàn thành', value: stats.completed, suffix: 'hạng mục', icon: <CheckCircleOutlined />, gradient: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <ScheduleOutlined style={{ marginRight: 8 }} />Theo dõi tiến độ & Khối lượng
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Tổng hợp toàn bộ hạng mục — so sánh kế hoạch và phân tích sai lệch</Text>
        </div>
        <Button icon={<SyncOutlined spin={syncing} />} onClick={handleSync} loading={syncing}
          style={{ borderColor: colors.navy, color: colors.navy }}>
          Đồng bộ dữ liệu
        </Button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{ flex: '1 1 0', minWidth: 155 }}>
            <div className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{ background: card.gradient, borderRadius: 12, padding: '14px 16px 12px', position: 'relative', overflow: 'hidden' }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -8, fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff' }}>{card.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px' }}>
                {card.value} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Space size={10} wrap>
              <Input
                placeholder="Tìm theo mã WBS, tên công việc..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 280 }} allowClear
                value={searchText} onChange={e => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Hợp đồng" style={{ width: 200 }} allowClear
                value={filterContract} onChange={setFilterContract}
                options={roleContracts.map(c => ({ value: c.id, label: c.code }))}
              />
              <Select
                placeholder="Trạng thái" style={{ width: 150 }} allowClear
                value={filterStatus} onChange={setFilterStatus}
                options={Object.entries(workItemStatusConfig).map(([k, cfg]) => ({ value: k, label: cfg.label }))}
              />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredWorkItems.length}/{roleWorkItems.length} hạng mục</Text>
              {(searchText || filterStatus || filterContract) && (
                <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); setFilterContract(undefined); }}>
                  Xóa bộ lọc
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        className="db-chart-card" bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
              <AimOutlined />
            </div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Tổng hợp tiến độ & khối lượng thực hiện</span>
            <Tag color="blue">{tableData.length} hạng mục</Tag>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `Tổng ${t} hạng mục` }}
          scroll={{ x: 1250 }}
          rowClassName={(r: TableRecord) => r.delayDays > 0 && r.status !== 'completed' ? 'row-highlight' : ''}
        />
      </Card>

      {/* ─── Drawer: Báo cáo tiến độ ──────────────────────────────────────── */}
      <Drawer
        title={null} placement="right" width={500}
        open={reportDrawerOpen}
        onClose={() => { setReportDrawerOpen(false); setActiveItem(null); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setReportDrawerOpen(false); setActiveItem(null); }}>Hủy</Button>
            <Button type="primary" style={{ background: '#059669', borderColor: '#059669' }} onClick={handleSaveReport}>
              Ghi nhận báo cáo
            </Button>
          </div>
        }
      >
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileTextOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Báo cáo tiến độ thực tế</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{activeItem?.code} — {activeItem?.name}</div>
            </div>
          </Space>
        </div>
        {activeItem && (
          <div style={{ padding: 20 }}>
            <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', marginBottom: 20, borderLeft: `3px solid ${colors.navy}` }}>
              <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>
                <ThunderboltOutlined style={{ marginRight: 6 }} />Tình trạng hiện tại
              </Text>
              <Row gutter={[12, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ TT / KH</Text>
                  <div>
                    <Text strong style={{ color: getProgressColor(activeItem.progress) }}>{activeItem.progress}%</Text>
                    <Text type="secondary"> / {activeItem.expectedProgress}%</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Sai lệch</Text>
                  <div>
                    {activeItem.delayDays > 0
                      ? <Tag color="red">Chậm {activeItem.delayDays} ngày</Tag>
                      : <Tag color="green">Đúng kế hoạch</Tag>}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Khối lượng TT / KH</Text>
                  <div><Text strong>{activeItem.completedQuantity}</Text><Text type="secondary">/{activeItem.plannedQuantity}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Chi phí TT / DT</Text>
                  <div><Text style={{ fontSize: 12 }}>{formatCurrency(activeItem.actualCost)} / {formatCurrency(activeItem.plannedCost)}</Text></div>
                </Col>
              </Row>
            </div>
            <Form form={reportForm} layout="vertical" requiredMark="optional">
              <Form.Item label="Ngày báo cáo" name="reportDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Tiến độ thực tế (%)" name="progressPercent" rules={[{ required: true, message: 'Nhập %' }]}>
                    <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Khối lượng hoàn thành" name="quantityCompleted" rules={[{ required: true, message: 'Nhập KL' }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Chi phí phát sinh thêm (tr.đ)" name="additionalCost">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="tr.đ" placeholder="Để trống nếu không có" />
              </Form.Item>
              <Form.Item label="Vấn đề / Vướng mắc" name="issues">
                <Input.TextArea rows={2} placeholder="Mô tả vấn đề phát sinh (nếu có)..." />
              </Form.Item>
              <Form.Item label="Kế hoạch kỳ tới" name="nextPlan">
                <Input.TextArea rows={2} placeholder="Công việc dự kiến trong kỳ báo cáo tiếp theo..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Drawer>

      {/* ─── Drawer: Điều chỉnh kế hoạch ──────────────────────────────────── */}
      <Drawer
        title={null} placement="right" width={480}
        open={adjustDrawerOpen}
        onClose={() => { setAdjustDrawerOpen(false); setActiveItem(null); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setAdjustDrawerOpen(false); setActiveItem(null); }}>Hủy</Button>
            <Button type="primary" style={{ background: colors.navy, borderColor: colors.navy }} onClick={handleSaveAdjust}>
              Lưu điều chỉnh
            </Button>
          </div>
        }
      >
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EditOutlined style={{ color: '#f0d890', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Điều chỉnh kế hoạch</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{activeItem?.code} — {activeItem?.name}</div>
            </div>
          </Space>
        </div>
        {activeItem && (
          <div style={{ padding: 20 }}>
            <div style={{
              background: activeItem.delayDays > 0 ? '#fff2f0' : '#f0f7ff',
              borderRadius: 8, padding: '12px 16px', marginBottom: 20,
              borderLeft: `3px solid ${activeItem.delayDays > 0 ? '#ff4d4f' : colors.navy}`,
            }}>
              <Row gutter={[12, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ TT / KH</Text>
                  <div>
                    <Text strong style={{ color: getProgressColor(activeItem.progress) }}>{activeItem.progress}%</Text>
                    <Text type="secondary"> / {activeItem.expectedProgress}%</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Hạn kết thúc</Text>
                  <div><Text style={{ fontSize: 13 }}>{formatDate(activeItem.plannedEnd)}</Text></div>
                </Col>
              </Row>
            </div>
            <Form form={adjustForm} layout="vertical" requiredMark="optional">
              <Form.Item label="Ngày kết thúc mới" name="newPlannedEnd" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item label="Lý do điều chỉnh" name="reason" rules={[{ required: true, message: 'Nhập lý do' }]}>
                <Input.TextArea rows={3} placeholder="Lý do điều chỉnh và phương án xử lý..." />
              </Form.Item>
              <Form.Item label="Thông báo đến phân hệ" name="notifySubsystems">
                <Select mode="multiple" placeholder="Chọn phân hệ cần thông báo" options={[
                  { value: 'repair', label: 'Quản lý Sửa chữa' },
                  { value: 'overhaul', label: 'Quản lý Đại tu' },
                  { value: 'manufacturing', label: 'Quản lý Sản xuất' },
                ]} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProgressTracking;
