import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Tag, Card, Space, Row, Col, Typography, Badge, Tabs, Dropdown,
  App, Tooltip, Progress, Drawer, Form, InputNumber, DatePicker,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, AuditOutlined, MoreOutlined,
  CheckCircleOutlined, SyncOutlined, CalculatorOutlined,
  EyeOutlined, EditOutlined, CalendarOutlined, WarningOutlined,
  ClockCircleOutlined, FileAddOutlined, SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { stockCounts } from '../../data/stockCounts';
import {
  scheduleList as initialSchedules,
  updateScheduleFrequency,
  frequencyConfig,
} from '../../data/schedules';
import type { CountSchedule, ScheduleFrequency } from '../../data/schedules';
import type { StockCount, StockCountStatus, AdjustmentType, StockCountLine } from '../../types';
import {
  stockCountStatusConfig,
  adjustmentTypeConfig,
  formatNumber,
  formatDate,
} from '../../utils/format';

const { Title, Text } = Typography;

// ─── Unique warehouse options from data ─────────────────────
const warehouseOptions = [
  ...new Map(
    stockCounts.map((sc) => [sc.warehouseId, { id: sc.warehouseId, name: sc.warehouseName }])
  ).values(),
];

// ─── Tab-filtered data helper ───────────────────────────────
const getByType = (type: AdjustmentType) => stockCounts.filter((sc) => sc.type === type);

const StockCountPage: React.FC = () => {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  // ─── Filter state ─────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<StockCountStatus | undefined>(undefined);
  const [filterWarehouse, setFilterWarehouse] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<AdjustmentType | 'schedule'>('count');

  // ─── Schedule state (Bước 1: thiết lập tần suất) ─────────
  const [schedList, setSchedList] = useState<CountSchedule[]>(() => [...initialSchedules]);
  const [configOpen, setConfigOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CountSchedule | null>(null);
  const [configForm] = Form.useForm();

  // ─── Filtered data ────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (activeTab === 'schedule') return [];
    return getByType(activeTab as AdjustmentType).filter((sc) => {
      const matchSearch =
        !searchText ||
        sc.code.toLowerCase().includes(searchText.toLowerCase()) ||
        sc.warehouseName.toLowerCase().includes(searchText.toLowerCase()) ||
        (sc.countedBy || '').toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || sc.status === filterStatus;
      const matchWarehouse = !filterWarehouse || sc.warehouseId === filterWarehouse;
      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [searchText, filterStatus, filterWarehouse, activeTab]);

  // ─── Summary stats ────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const all = stockCounts;
    const total = all.length;
    const done = all.filter((sc) => sc.status === 'done').length;
    const inProgress = all.filter((sc) => sc.status === 'in_progress').length;
    const totalDifference = all
      .filter((sc) => sc.status === 'done')
      .reduce((sum, sc) => sum + Math.abs(sc.totalDifference), 0);
    return { total, done, inProgress, totalDifference };
  }, []);

  // ─── Tab counts ───────────────────────────────────────────
  const tabCounts = useMemo(() => ({
    count: getByType('count').length,
    correction: getByType('correction').length,
    scrap: getByType('scrap').length,
  }), []);

  // ─── Schedule computed (ngày, tình trạng) ────────────────
  const today = dayjs('2026-04-15');

  const scheduleWithStatus = useMemo(() => schedList.map((sch) => {
    const nextDate = dayjs(sch.nextCountDate);
    const lastDate = dayjs(sch.lastCountDate);
    const overdueDays = today.diff(nextDate, 'day');
    const isOverdue = overdueDays > 0;
    const daysUntilNext = nextDate.diff(today, 'day');
    const totalDays = nextDate.diff(lastDate, 'day');
    const elapsedDays = today.diff(lastDate, 'day');
    const progress = Math.min(100, Math.round((elapsedDays / Math.max(totalDays, 1)) * 100));
    return { ...sch, isOverdue, overdueDays, daysUntilNext, progress };
  }), [schedList]);

  const overdueCount = scheduleWithStatus.filter((s) => s.isOverdue).length;

  // ─── Bước 1: Mở drawer cấu hình tần suất ────────────────
  const handleOpenConfig = (sch: CountSchedule) => {
    setEditingSchedule(sch);
    configForm.setFieldsValue({
      frequency: sch.frequency,
      frequencyDays: sch.frequencyDays,
      responsible: sch.responsible,
      startDate: dayjs(sch.startDate),
    });
    setConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    try {
      const vals = await configForm.validateFields();
      if (!editingSchedule) return;
      updateScheduleFrequency(
        editingSchedule.id,
        vals.frequency as ScheduleFrequency,
        vals.frequencyDays,
        vals.responsible,
        (vals.startDate as dayjs.Dayjs).format('YYYY-MM-DD'),
      );
      // Refresh local state from module store
      setSchedList([...initialSchedules]);
      setConfigOpen(false);
      message.success('Đã cập nhật lịch kiểm kê');
    } catch {
      // validation error
    }
  };

  // ─── Bước 2: Sinh phiếu kiểm kê ─────────────────────────
  const handleGenerateFromSchedule = (sch: typeof scheduleWithStatus[0]) => {
    const overdueText = sch.isOverdue
      ? `Quá hạn ${sch.overdueDays} ngày (dự kiến: ${formatDate(sch.nextCountDate)})`
      : `Đến hạn: ${formatDate(sch.nextCountDate)}`;

    modal.confirm({
      title: 'Sinh phiếu kiểm kê định kỳ',
      centered: true,
      width: 440,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            Tạo phiếu kiểm kê định kỳ cho <strong>{sch.warehouseName}</strong>?
          </p>
          <p style={{ color: sch.isOverdue ? '#ff4d4f' : '#faad14', fontSize: 13, margin: 0 }}>
            {overdueText}
          </p>
          <p style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
            Hệ thống sẽ tự động tải danh sách tất cả vật tư trong kho vào phiếu kiểm kê.
          </p>
        </div>
      ),
      okText: 'Sinh phiếu',
      cancelText: 'Hủy',
      okButtonProps: { style: { background: '#1B3A5C', borderColor: '#1B3A5C' } },
      onOk: () => {
        navigate(`/stock-count/new?warehouseId=${sch.warehouseId}&scheduleId=${sch.id}`);
      },
    });
  };

  // ─── Schedule table columns ───────────────────────────────
  const scheduleColumns: ColumnsType<typeof scheduleWithStatus[0]> = [
    {
      title: 'Kho',
      key: 'warehouse',
      width: 240,
      render: (_: unknown, sch) => (
        <div>
          <Text style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C', fontFamily: 'monospace' }}>
            {sch.warehouseCode}
          </Text>
          <Text style={{ fontSize: 13, marginLeft: 8 }}>{sch.warehouseName}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{sch.managerName}</div>
        </div>
      ),
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 140,
      render: (freq: ScheduleFrequency, sch) => {
        const cfg = frequencyConfig[freq];
        return (
          <div>
            <Tag color={cfg.color} style={{ borderRadius: 4, fontSize: 12 }}>{cfg.label}</Tag>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{sch.frequencyDays} ngày/lần</div>
          </div>
        );
      },
    },
    {
      title: 'KK cuối cùng',
      dataIndex: 'lastCountDate',
      key: 'lastCountDate',
      width: 130,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'KK tiếp theo',
      dataIndex: 'nextCountDate',
      key: 'nextCountDate',
      width: 130,
      render: (date: string, sch) => (
        <Text style={{
          fontSize: 13,
          color: sch.isOverdue ? '#ff4d4f' : '#1B3A5C',
          fontWeight: sch.isOverdue ? 600 : 400,
        }}>
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 170,
      render: (_: unknown, sch) => (
        <div>
          <Progress
            percent={sch.progress}
            size="small"
            strokeColor={sch.isOverdue ? '#ff4d4f' : sch.progress >= 80 ? '#faad14' : '#1B3A5C'}
            style={{ marginBottom: 2 }}
          />
          <Text style={{ fontSize: 11, color: sch.isOverdue ? '#ff4d4f' : '#8c8c8c' }}>
            {sch.isOverdue
              ? `Quá hạn ${sch.overdueDays} ngày`
              : `Còn ${sch.daysUntilNext} ngày`}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_: unknown, sch) => (
        sch.isOverdue ? (
          <Tag icon={<WarningOutlined />} color="red" style={{ borderRadius: 4, fontSize: 12 }}>
            Quá hạn
          </Tag>
        ) : sch.progress >= 80 ? (
          <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 4, fontSize: 12 }}>
            Sắp đến hạn
          </Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 4, fontSize: 12 }}>
            Đúng tiến độ
          </Tag>
        )
      ),
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 160,
      render: (name: string) => (
        <Text style={{ fontSize: 13 }}>{name}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_: unknown, sch) => (
        <Space size={6}>
          <Tooltip title="Cấu hình tần suất kiểm kê">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleOpenConfig(sch)}
              style={{ borderRadius: 6, borderColor: '#1B3A5C', color: '#1B3A5C' }}
            >
              Cấu hình
            </Button>
          </Tooltip>
          <Tooltip title="Sinh phiếu kiểm kê">
            <Button
              type="primary"
              size="small"
              icon={<FileAddOutlined />}
              style={{
                background: sch.isOverdue ? '#ff4d4f' : '#1B3A5C',
                borderColor: sch.isOverdue ? '#ff4d4f' : '#1B3A5C',
                borderRadius: 6,
              }}
              onClick={() => handleGenerateFromSchedule(sch)}
            >
              Sinh phiếu
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Expandable row renderer ──────────────────────────────
  const expandedRowRender = (record: StockCount) => {
    const lineColumns: ColumnsType<StockCountLine> = [
      {
        title: 'Mã VT',
        dataIndex: 'productCode',
        key: 'productCode',
        width: 130,
        render: (code: string) => (
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>
            {code}
          </Text>
        ),
      },
      {
        title: 'Tên vật tư',
        dataIndex: 'productName',
        key: 'productName',
        ellipsis: true,
        render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
      },
      {
        title: 'Vị trí',
        dataIndex: 'locationCode',
        key: 'locationCode',
        width: 110,
        render: (code: string) =>
          code ? (
            <Tag style={{ borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{code}</Tag>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
          ),
      },
      {
        title: 'SL hệ thống',
        dataIndex: 'systemQty',
        key: 'systemQty',
        width: 110,
        align: 'right',
        render: (val: number) => <Text style={{ fontSize: 13 }}>{formatNumber(val)}</Text>,
      },
      {
        title: 'SL thực tế',
        dataIndex: 'countedQty',
        key: 'countedQty',
        width: 110,
        align: 'right',
        render: (val: number, line: StockCountLine) => (
          <Text style={{ fontSize: 13, fontWeight: 600, color: val !== line.systemQty ? '#1B3A5C' : undefined }}>
            {record.status === 'planned' ? '--' : formatNumber(val)}
          </Text>
        ),
      },
      {
        title: 'Chênh lệch',
        dataIndex: 'difference',
        key: 'difference',
        width: 100,
        align: 'right',
        render: (val: number) => {
          if (record.status === 'planned') return <Text type="secondary">--</Text>;
          if (val === 0) return <Text style={{ color: '#999', fontSize: 13 }}>0</Text>;
          const color = val > 0 ? '#52c41a' : '#ff4d4f';
          return (
            <Text style={{ fontWeight: 700, fontSize: 13, color }}>
              {val > 0 ? `+${val}` : val}
            </Text>
          );
        },
      },
      {
        title: 'DVT',
        dataIndex: 'unit',
        key: 'unit',
        width: 65,
        render: (unit: string) => <Text style={{ fontSize: 12 }}>{unit}</Text>,
      },
      {
        title: 'Lý do',
        dataIndex: 'reason',
        key: 'reason',
        ellipsis: true,
        render: (reason: string) =>
          reason ? (
            <Text style={{ fontSize: 12, color: '#666' }} title={reason}>{reason}</Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
          ),
      },
    ];

    return (
      <div style={{ padding: '8px 0' }}>
        <Table
          columns={lineColumns}
          dataSource={record.lines}
          rowKey="id"
          pagination={false}
          size="small"
          style={{ background: '#fafbfc' }}
        />
      </div>
    );
  };

  // ─── Main table columns ───────────────────────────────────
  const columns: ColumnsType<StockCount> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string) => (
        <Text style={{ color: '#1B3A5C', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 200,
      ellipsis: true,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: StockCountStatus) => {
        const config = stockCountStatusConfig[status];
        return (
          <Tag color={config.color} style={{ borderRadius: 4, fontSize: 12 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày lên lịch',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 120,
      render: (date: string) => <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>,
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completedDate',
      key: 'completedDate',
      width: 120,
      render: (date: string) =>
        date ? (
          <Text style={{ fontSize: 13, color: '#52c41a' }}>{formatDate(date)}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Người kiểm kê',
      dataIndex: 'countedBy',
      key: 'countedBy',
      width: 200,
      ellipsis: true,
      render: (name: string) =>
        name ? (
          <Text style={{ fontSize: 13 }}>{name}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Chưa phân công</Text>
        ),
    },
    {
      title: 'Tổng mặt hàng',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontWeight: 500, fontSize: 13 }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'totalDifference',
      key: 'totalDifference',
      width: 100,
      align: 'right',
      render: (val: number, record: StockCount) => {
        if (record.status === 'planned') return <Text type="secondary">--</Text>;
        if (val === 0) return <Text style={{ color: '#999', fontSize: 13 }}>0</Text>;
        const color = val > 0 ? '#52c41a' : '#ff4d4f';
        return (
          <Text style={{ fontWeight: 700, fontSize: 13, color }}>
            {val > 0 ? `+${val}` : val}
          </Text>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_: unknown, record: StockCount) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
            ],
            onClick: ({ key }) => {
              if (key === 'view' || key === 'edit') navigate(`/stock-count/${record.id}`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  // ─── Stat card config ─────────────────────────────────────
  const statCards = [
    {
      label: 'Tổng đợt',
      value: summaryStats.total,
      suffix: 'đợt',
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
      icon: <AuditOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Đã hoàn thành',
      value: summaryStats.done,
      suffix: 'đợt',
      gradient: 'linear-gradient(135deg, #237804, #52c41a)',
      icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Đang kiểm kê',
      value: summaryStats.inProgress,
      suffix: 'đợt',
      gradient: 'linear-gradient(135deg, #d48806, #faad14)',
      icon: <SyncOutlined style={{ fontSize: 64 }} />,
    },
    {
      label: 'Tổng chênh lệch',
      value: summaryStats.totalDifference,
      suffix: 'đơn vị',
      gradient: 'linear-gradient(135deg, #531dab, #722ed1)',
      icon: <CalculatorOutlined style={{ fontSize: 64 }} />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AuditOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Kiểm kê & Điều chỉnh</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Kiểm kê, điều chỉnh, loại bỏ vật tư tồn kho</Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/stock-count/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
        >
          Tạo kiểm kê
        </Button>
      </div>

      {/* ─── Summary Stat Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{
                background: card.gradient,
                borderRadius: 14,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              styles={{ body: { padding: '18px 20px', position: 'relative', zIndex: 1 } }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute', top: 8, right: 12,
                  color: 'rgba(255,255,255,0.1)', fontSize: 64, lineHeight: 1, zIndex: 0,
                }}
              >
                {card.icon}
              </div>
              <Space direction="vertical" size={2}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{card.label}</Text>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>
                    {formatNumber(card.value)}
                  </span>
                  {card.suffix && (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 4 }}>
                      {card.suffix}
                    </span>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Filter Bar (ẩn khi ở tab lịch) */}
      {activeTab !== 'schedule' && (
        <Card
          style={{ borderRadius: 14, marginBottom: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={7}>
              <Input
                prefix={<SearchOutlined style={{ color: '#999' }} />}
                placeholder="Tìm theo mã phiếu, kho, người kiểm kê..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                allowClear
                style={{ width: '100%' }}
                options={Object.entries(stockCountStatusConfig).map(([key, cfg]) => ({
                  value: key,
                  label: cfg.label,
                }))}
              />
            </Col>
            <Col xs={12} sm={6} md={5}>
              <Select
                placeholder="Kho"
                value={filterWarehouse}
                onChange={setFilterWarehouse}
                allowClear
                style={{ width: '100%' }}
                options={warehouseOptions.map((w) => ({
                  value: w.id,
                  label: w.name,
                }))}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* ─── Tabs + Table */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as AdjustmentType | 'schedule')}
          style={{ padding: '12px 20px 0' }}
          items={[
            {
              key: 'count',
              label: (
                <Space size={6}>
                  <span>{adjustmentTypeConfig.count.label}</span>
                  <Badge count={tabCounts.count} style={{ backgroundColor: adjustmentTypeConfig.count.color, fontSize: 10 }} />
                </Space>
              ),
            },
            {
              key: 'correction',
              label: (
                <Space size={6}>
                  <span>{adjustmentTypeConfig.correction.label}</span>
                  <Badge count={tabCounts.correction} style={{ backgroundColor: adjustmentTypeConfig.correction.color, fontSize: 10 }} />
                </Space>
              ),
            },
            {
              key: 'scrap',
              label: (
                <Space size={6}>
                  <span>{adjustmentTypeConfig.scrap.label}</span>
                  <Badge count={tabCounts.scrap} style={{ backgroundColor: adjustmentTypeConfig.scrap.color, fontSize: 10 }} />
                </Space>
              ),
            },
            {
              key: 'schedule',
              label: (
                <Space size={6}>
                  <CalendarOutlined />
                  <span>Lịch kiểm kê</span>
                  {overdueCount > 0 && (
                    <Badge count={overdueCount} style={{ backgroundColor: '#ff4d4f', fontSize: 10 }} />
                  )}
                </Space>
              ),
            },
          ]}
        />

        {activeTab !== 'schedule' ? (
          <>
            <div style={{ padding: '0 20px 12px', borderBottom: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hiển thị {filteredData.length} phiếu {adjustmentTypeConfig[activeTab as AdjustmentType].label.toLowerCase()}
              </Text>
            </div>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              expandable={{ expandedRowRender, expandRowByClick: true }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu`,
              }}
              scroll={{ x: 1200 }}
              size="middle"
              style={{ padding: '0 4px' }}
            />
          </>
        ) : (
          <>
            {/* Schedule summary bar */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', background: '#fafbfc' }}>
              <Row gutter={24} align="middle">
                <Col>
                  <Space size={6}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d4f' }} />
                    <Text style={{ fontSize: 12 }}>
                      <Text strong style={{ color: '#ff4d4f' }}>{overdueCount}</Text>
                      <Text type="secondary"> kho quá hạn</Text>
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Space size={6}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#faad14' }} />
                    <Text style={{ fontSize: 12 }}>
                      <Text strong style={{ color: '#faad14' }}>
                        {scheduleWithStatus.filter((s) => !s.isOverdue && s.progress >= 80).length}
                      </Text>
                      <Text type="secondary"> kho sắp đến hạn</Text>
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Space size={6}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#52c41a' }} />
                    <Text style={{ fontSize: 12 }}>
                      <Text strong style={{ color: '#52c41a' }}>
                        {scheduleWithStatus.filter((s) => !s.isOverdue && s.progress < 80).length}
                      </Text>
                      <Text type="secondary"> kho đúng tiến độ</Text>
                    </Text>
                  </Space>
                </Col>
                <Col flex="auto" style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tổng {scheduleWithStatus.length} kho được lập lịch
                  </Text>
                </Col>
              </Row>
            </div>
            <Table
              columns={scheduleColumns}
              dataSource={scheduleWithStatus}
              rowKey="id"
              pagination={false}
              size="middle"
              style={{ padding: '0 4px' }}
              rowClassName={(sch) => sch.isOverdue ? 'schedule-overdue-row' : ''}
            />
          </>
        )}
      </Card>

      {/* ═══ Bước 1: Drawer cấu hình tần suất ═══════════════ */}
      <Drawer
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        width={480}
        closable={false}
        title={null}
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setConfigOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
              onClick={handleSaveConfig}
            >
              Lưu cấu hình
            </Button>
          </div>
        }
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', padding: '20px 24px 16px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingOutlined style={{ fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Cấu hình tần suất kiểm kê</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {editingSchedule
                  ? `${editingSchedule.warehouseCode} — ${editingSchedule.warehouseName}`
                  : 'Thiết lập chu kỳ kiểm kê định kỳ'}
              </div>
            </div>
          </Space>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px' }}>
          <Form form={configForm} layout="vertical">
            <Form.Item
              label={<Text strong>Tần suất kiểm kê</Text>}
              name="frequency"
              rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
            >
              <Select
                options={Object.entries(frequencyConfig).map(([key, cfg]) => ({
                  value: key,
                  label: `${cfg.label} (${cfg.days} ngày)`,
                }))}
                onChange={(val) => {
                  const days = frequencyConfig[val as ScheduleFrequency]?.days;
                  if (days) configForm.setFieldValue('frequencyDays', days);
                }}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong>Số ngày chu kỳ</Text>}
              name="frequencyDays"
              rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}
              extra="Tự động điền theo tần suất, có thể chỉnh để phù hợp thực tế."
            >
              <InputNumber min={1} max={365} style={{ width: '100%' }} addonAfter="ngày" />
            </Form.Item>

            <Form.Item
              label={<Text strong>Người phụ trách</Text>}
              name="responsible"
              rules={[{ required: true, message: 'Vui lòng nhập người phụ trách' }]}
            >
              <Input placeholder="VD: Nguyễn Hữu Phúc" />
            </Form.Item>

            <Form.Item
              label={<Text strong>Ngày bắt đầu áp dụng</Text>}
              name="startDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng' }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

const StockCountPageWrapper: React.FC = () => (
  <App>
    <StockCountPage />
  </App>
);

export default StockCountPageWrapper;
