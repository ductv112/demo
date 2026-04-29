import React, { useMemo, useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Tag,
  Progress,
  Row,
  Col,
  Typography,
  Space,
  Descriptions,
  Button,
  Empty,
  message,
  Drawer,
  Form,
  DatePicker,
  Input,
  InputNumber,
  Divider,
  Alert,
  Badge,
  Statistic,
  Dropdown,
  Modal,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileProtectOutlined,
  AppstoreOutlined,
  ScheduleOutlined,
  SafetyCertificateOutlined,
  AccountBookOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FundOutlined,
  CalendarOutlined,
  SyncOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  EditOutlined,
  MoreOutlined,
  BarChartOutlined,
  BellOutlined,
  ThunderboltOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Helpers tiến độ ──────────────────────────────────────────────────────
const calcExpectedPct = (start: string, end: string): number => {
  const s = dayjs(start);
  const e = dayjs(end);
  const today = dayjs();
  if (today.isBefore(s)) return 0;
  if (today.isAfter(e)) return 100;
  return Math.min(100, Math.round(today.diff(s, 'day') / (e.diff(s, 'day') || 1) * 100));
};

const calcDelayDays = (item: { plannedStart: string; plannedEnd: string; progress: number; status: string; actualEnd?: string }): number => {
  if (item.status === 'completed' || item.status === 'pending') return 0;
  const today = dayjs();
  if (today.isAfter(dayjs(item.plannedEnd))) return today.diff(dayjs(item.plannedEnd), 'day');
  const exp = calcExpectedPct(item.plannedStart, item.plannedEnd);
  if (item.progress < exp - 15) {
    const total = dayjs(item.plannedEnd).diff(dayjs(item.plannedStart), 'day') || 1;
    return Math.round((exp - item.progress) * total / 100);
  }
  return 0;
};

const buildMonthlyTrend = (startDate: string, endDate: string, currentProgress: number) => {
  const start = dayjs(startDate).startOf('month');
  const end = dayjs(endDate).endOf('month');
  const today = dayjs();
  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') || 1;
  const data: { month: string; value: number; series: string }[] = [];
  let m = start;
  while (m.isBefore(end) || m.isSame(end, 'month')) {
    const label = m.format('MM/YYYY');
    const elapsedPlanned = m.endOf('month').diff(dayjs(startDate), 'day');
    const planned = Math.min(100, Math.max(0, Math.round(elapsedPlanned / totalDays * 100)));
    data.push({ month: label, value: planned, series: 'Kế hoạch' });
    if (m.isBefore(today) || m.isSame(today, 'month')) {
      const elapsedActual = (m.isSame(today, 'month') ? today : m.endOf('month')).diff(dayjs(startDate), 'day');
      const totalElapsed = today.diff(dayjs(startDate), 'day') || 1;
      const actual = Math.min(100, Math.round(currentProgress * (elapsedActual / totalElapsed)));
      data.push({ month: label, value: actual, series: 'Thực tế' });
    }
    m = m.add(1, 'month');
  }
  return data;
};
import {
  contracts,
  workItems,
  acceptanceRecords,
  getContractById,
  getWorkItemsByContract,
  getAcceptanceByContract,
} from '../../data/contracts';
import {
  getLatestSettlementByContract,
  getSettlementsByContract,
  getVarianceReport,
  getContractClosure,
} from '../../data/settlement';
import { missions, getMissionById } from '../../data/missions';
import { getDepartmentShortName } from '../../data/departments';
import {
  formatCurrency,
  formatCurrencyFull,
  formatDate,
  contractStatusConfig,
  workItemStatusConfig,
  workItemTypeConfig,
  acceptanceStatusConfig,
  settlementStatusConfig,
  getProgressColor,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { WorkItem, AcceptanceRecord } from '../../types';
const { Title, Text } = Typography;

const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDepartment, currentUser } = useUser();

  // Drawer state
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [adjustDrawerOpen, setAdjustDrawerOpen] = useState(false);
  const [activeWorkItem, setActiveWorkItem] = useState<typeof workItems[0] | null>(null);
  const [reportForm] = Form.useForm();
  const [adjustForm] = Form.useForm();
  const [progressSyncing, setProgressSyncing] = useState(false);

  const contract = getContractById(id || '');
  const mission = contract ? getMissionById(contract.missionId) : undefined;

  const contractWorkItems = useMemo(() => {
    if (!contract) return [];
    const items = getWorkItemsByContract(contract.id);
    if (isDepartment) return items.filter(w => w.assignedUnit === currentUser.departmentId);
    return items;
  }, [contract, isDepartment, currentUser.departmentId]);

  const contractAcceptance = useMemo(() => {
    if (!contract) return [];
    return getAcceptanceByContract(contract.id);
  }, [contract]);

  const contractSettlement = useMemo(() => {
    if (!contract) return undefined;
    return getLatestSettlementByContract(contract.id);
  }, [contract]);

  if (!contract) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy hợp đồng</Title>
        <Button type="link" onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const statusConf = contractStatusConfig[contract.status];
  const totalPlannedCost = contractWorkItems.reduce((s, w) => s + w.plannedCost, 0);
  const totalActualCost = contractWorkItems.reduce((s, w) => s + w.actualCost, 0);
  const remainingValue = contract.contractValue - totalActualCost;
  const overallProgress = contractWorkItems.length > 0
    ? Math.round(contractWorkItems.reduce((s, w) => s + w.progress, 0) / contractWorkItems.length)
    : 0;

  // ─── Summary stat cards ────────────────────────────────────
  const statCards = [
    {
      title: 'Giá trị HĐ',
      value: contract.contractValue,
      isCurrency: true,
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    },
    {
      title: 'Đã thực hiện',
      value: totalActualCost,
      isCurrency: true,
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
    },
    {
      title: 'Còn lại',
      value: remainingValue,
      isCurrency: true,
      icon: <AccountBookOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    },
    {
      title: 'Tiến độ',
      value: overallProgress,
      isCurrency: false,
      suffix: '%',
      icon: <FundOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    },
  ];

  // ─── Tab 1: Tổng quan ────────────────────────────────────
  const renderOverview = () => (
    <div>
      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="db-stat-card" style={{
              background: card.gradient,
              borderRadius: 14,
              padding: '14px 16px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div className="db-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)',
                lineHeight: 1,
              }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.title}
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {card.isCurrency
                  ? formatCurrency(card.value)
                  : <>{card.value}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.suffix}</span></>
                }
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Contract info */}
      <Card className="db-chart-card card-navy" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 15,
          }}>
            <FileProtectOutlined />
          </div>
          <Title level={5} style={{ margin: 0, color: colors.navy }}>
            Thông tin hợp đồng
          </Title>
        </div>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Mã hợp đồng">{contract.code}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusConf.color}>{statusConf.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên hợp đồng" span={2}>{contract.name}</Descriptions.Item>
          <Descriptions.Item label="Loại">
            <Tag color={contract.contractType === 'contract' ? 'blue' : 'purple'}>
              {contract.contractType === 'contract' ? 'Hợp đồng' : 'Quyết định giao NV'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị đối tác">{contract.partnerUnit}</Descriptions.Item>
          <Descriptions.Item label="Giá trị hợp đồng">
            <Text strong style={{ color: colors.navy }}>{formatCurrencyFull(contract.contractValue)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tạm ứng">
            <Text strong style={{ color: colors.success }}>{formatCurrencyFull(contract.advancePayment)}</Text>
          </Descriptions.Item>
          {contract.signedDate && (
            <Descriptions.Item label="Ngày ký">{formatDate(contract.signedDate)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Thời gian thực hiện">
            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
          </Descriptions.Item>
          {contract.signedBy && (
            <Descriptions.Item label="Người ký">{contract.signedBy}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Linked mission info */}
      {mission && (
        <Card className="db-chart-card card-info" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.info}, #69c0ff)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15,
            }}>
              <ScheduleOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: colors.navy }}>
              Nhiệm vụ liên quan
            </Title>
          </div>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Mã NV">{mission.code}</Descriptions.Item>
            <Descriptions.Item label="Tên NV">{mission.name}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị yêu cầu">{mission.requestingUnit}</Descriptions.Item>
            <Descriptions.Item label="Sản phẩm/Hệ thống">{mission.equipmentType} (SL: {mission.equipmentQuantity})</Descriptions.Item>
            <Descriptions.Item label="Hạn hoàn thành">{formatDate(mission.deadline)}</Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>{mission.description}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );

  // ─── Tab 2: Phân rã công việc (WBS) ────────────────────────
  const wbsColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{code}</Text>,
    },
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'workType',
      key: 'workType',
      width: 100,
      render: (type: WorkItem['workType']) => {
        const conf = workItemTypeConfig[type];
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'assignedUnit',
      key: 'assignedUnit',
      width: 80,
      render: (unit: string) => getDepartmentShortName(unit),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={getProgressColor(progress)}
        />
      ),
    },
    {
      title: 'Chi phí (triệu)',
      key: 'cost',
      width: 140,
      render: (_: unknown, record: WorkItem) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            <Text strong style={{ color: colors.info }}>{formatCurrency(record.actualCost)}</Text>
            <Text type="secondary"> / {formatCurrency(record.plannedCost)}</Text>
          </Text>
          <Progress
            percent={record.plannedCost > 0 ? Math.round((record.actualCost / record.plannedCost) * 100) : 0}
            size="small"
            showInfo={false}
            strokeColor={
              record.actualCost > record.plannedCost ? colors.danger : colors.navy
            }
          />
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: WorkItem['status']) => {
        const conf = workItemStatusConfig[status];
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
  ];

  const renderWBS = () => {
    // Xác định phân hệ nguồn dựa trên missionType
    const missionTypeToSubsystem: Record<string, string> = {
      repair: 'Quản lý Sửa chữa',
      overhaul: 'Quản lý Đại tu',
      manufacturing: 'Quản lý Sản xuất',
      research: 'Quản lý Sản xuất',
    };
    const subsystemName = mission ? missionTypeToSubsystem[mission.missionType] || 'Phân hệ thực thi' : 'Phân hệ thực thi';

    const [wbsSyncing, setWbsSyncing] = React.useState(false);
    const handleSync = () => {
      setWbsSyncing(true);
      message.loading({ content: `Đang đồng bộ WBS từ ${subsystemName}...`, key: 'wbs-sync', duration: 2 });
      setTimeout(() => {
        setWbsSyncing(false);
        message.destroy('wbs-sync');
        message.success({
          content: `Đã đồng bộ ${contractWorkItems.length} hạng mục WBS từ ${subsystemName}`,
          duration: 3,
        });
      }, 2000);
    };

    return (
      <Card className="db-chart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15,
            }}>
              <AppstoreOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: colors.navy }}>
              Phân rã công việc (WBS)
            </Title>
            <Tag color="blue">{contractWorkItems.length} công việc</Tag>
          </div>
          <Space>
            <Tag color="purple" style={{ fontSize: 11 }}>Nguồn: {subsystemName}</Tag>
            <Button icon={<SyncOutlined spin={wbsSyncing} />} onClick={handleSync} loading={wbsSyncing}
              style={{ borderColor: colors.navy, color: colors.navy }}>
              Đồng bộ WBS
            </Button>
            <Button type="primary" icon={<AppstoreOutlined />}
              style={{ background: colors.navy, borderColor: colors.navy }}
              onClick={() => navigate(`/contracts/${contract.id}/wbs`)}>
              Quản lý phân rã
            </Button>
          </Space>
        </div>
        <Table
          dataSource={contractWorkItems}
          columns={wbsColumns}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>
    );
  };

  // ─── Tab 3: Tiến độ ─────────────────────────────────────────────────────
  const handleOpenReport = (item: typeof workItems[0]) => {
    setActiveWorkItem(item);
    reportForm.setFieldsValue({
      reportDate: dayjs(),
      progressPercent: item.progress,
      quantityCompleted: item.completedQuantity,
    });
    setReportDrawerOpen(true);
  };

  const handleOpenAdjust = (item: typeof workItems[0]) => {
    setActiveWorkItem(item);
    adjustForm.setFieldsValue({ newPlannedEnd: dayjs(item.plannedEnd), reason: '' });
    setAdjustDrawerOpen(true);
  };

  const handleSaveReport = () => {
    reportForm.validateFields().then(values => {
      message.success(`Đã ghi nhận tiến độ ${activeWorkItem?.code}: ${values.progressPercent}%`);
      setReportDrawerOpen(false);
      setActiveWorkItem(null);
    });
  };

  const handleSaveAdjust = () => {
    adjustForm.validateFields().then(values => {
      message.success(`Đã điều chỉnh kế hoạch ${activeWorkItem?.code}: hạn mới ${values.newPlannedEnd.format('DD/MM/YYYY')}`);
      setAdjustDrawerOpen(false);
      setActiveWorkItem(null);
    });
  };

  const handleProgressSync = () => {
    setProgressSyncing(true);
    message.loading({ content: 'Đang nhận dữ liệu từ các phân hệ thực thi...', key: 'psync', duration: 2 });
    setTimeout(() => {
      setProgressSyncing(false);
      message.destroy('psync');
      Modal.success({
        title: 'Đồng bộ tiến độ hoàn tất',
        width: 420,
        content: (
          <div style={{ paddingTop: 8 }}>
            <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px' }}>
              {(['Quản lý Sửa chữa', 'Quản lý Đại tu', 'Quản lý Sản xuất'] as const).map(s => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ fontSize: 13 }}>{s}</span><Tag color="blue">Cập nhật</Tag>
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

  const renderProgress = () => {
    const sortedItems = [...contractWorkItems].sort(
      (a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime()
    );

    const expectedOverall = calcExpectedPct(contract.startDate, contract.endDate);
    const overallVariance = overallProgress - expectedOverall;
    const varianceColor = overallVariance >= 0 ? '#059669' : '#dc2626';
    const delayedItems = sortedItems.filter(w => calcDelayDays(w) > 0);
    const overBudgetItems = sortedItems.filter(w => w.status !== 'completed' && w.plannedCost > 0 && w.actualCost / w.plannedCost > 0.8);
    const trendData = buildMonthlyTrend(contract.startDate, contract.endDate, overallProgress);

    const lineConfig = {
      data: trendData,
      xField: 'month',
      yField: 'value',
      colorField: 'series',
      color: [colors.navy, '#059669'],
      axis: { y: { label: { formatter: (v: string) => `${v}%` } } },
      tooltip: { items: [{ channel: 'y', valueFormatter: (v: number) => `${v}%` }] },
      smooth: true,
      style: { lineWidth: 2 },
      height: 200,
    };

    return (
      <div>
        {/* ─── Cảnh báo ─────────────────────────────────────────────────── */}
        {(delayedItems.length > 0 || overBudgetItems.length > 0) && (
          <Alert
            type="warning" showIcon icon={<BellOutlined />}
            style={{ marginBottom: 16, borderRadius: 10 }}
            message={
              <span>
                {delayedItems.length > 0 && (
                  <span style={{ marginRight: 12 }}>
                    <Text strong>{delayedItems.length} hạng mục chậm tiến độ: </Text>
                    {delayedItems.map(w => (
                      <Tag key={w.id} color="red" style={{ fontSize: 11 }}>
                        {w.code} (trễ {calcDelayDays(w)}d)
                      </Tag>
                    ))}
                  </span>
                )}
                {overBudgetItems.length > 0 && (
                  <span>
                    <Text strong>{overBudgetItems.length} hạng mục cảnh báo chi phí: </Text>
                    {overBudgetItems.map(w => (
                      <Tag key={w.id} color="orange" style={{ fontSize: 11 }}>
                        {w.code} ({Math.round(w.actualCost / w.plannedCost * 100)}% DT)
                      </Tag>
                    ))}
                  </span>
                )}
              </span>
            }
          />
        )}

        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* ─── Phân tích tổng thể ──────────────────────────────────── */}
          <Col xs={24} lg={10}>
            <Card className="db-chart-card" styles={{ body: { padding: '16px 20px' } }} style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15,
                }}>
                  <ScheduleOutlined />
                </div>
                <Title level={5} style={{ margin: 0, color: colors.navy }}>Phân tích sai lệch</Title>
                <Button
                  size="small" icon={<SyncOutlined spin={progressSyncing} />}
                  onClick={handleProgressSync} loading={progressSyncing}
                  style={{ marginLeft: 'auto', borderColor: colors.navy, color: colors.navy }}
                >
                  Đồng bộ
                </Button>
              </div>

              {/* Circle + Variance */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <Progress
                  type="circle" percent={overallProgress} size={88}
                  strokeColor={getProgressColor(overallProgress)}
                  format={pct => <span style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>{pct}%</span>}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Tiến độ kế hoạch (tại {dayjs().format('DD/MM')})</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Progress percent={expectedOverall} size="small" showInfo={false}
                        strokeColor={colors.navy} style={{ flex: 1 }} />
                      <Text strong style={{ fontSize: 13, color: colors.navy, minWidth: 36 }}>{expectedOverall}%</Text>
                    </div>
                  </div>
                  <div style={{
                    background: overallVariance >= 0 ? '#f0fff4' : '#fff2f0',
                    borderRadius: 8, padding: '8px 12px',
                    border: `1px solid ${overallVariance >= 0 ? '#b7eb8f' : '#ffccc7'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {overallVariance >= 0
                        ? <RiseOutlined style={{ color: '#059669' }} />
                        : <FallOutlined style={{ color: '#dc2626' }} />}
                      <Text strong style={{ color: varianceColor, fontSize: 14 }}>
                        {overallVariance >= 0 ? '+' : ''}{overallVariance}%
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {overallVariance >= 0 ? 'vượt kế hoạch' : 'chậm kế hoạch'}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Statistic
                    title={<Text style={{ fontSize: 11 }}>Hoàn thành</Text>}
                    value={contractWorkItems.filter(w => w.status === 'completed').length}
                    suffix={`/${contractWorkItems.length}`}
                    valueStyle={{ fontSize: 18, color: '#059669', fontWeight: 700 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<Text style={{ fontSize: 11 }}>Đang thực hiện</Text>}
                    value={contractWorkItems.filter(w => w.status === 'in_progress').length}
                    valueStyle={{ fontSize: 18, color: colors.navy, fontWeight: 700 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<Text style={{ fontSize: 11 }}>Chậm tiến độ</Text>}
                    value={delayedItems.length}
                    valueStyle={{ fontSize: 18, color: delayedItems.length > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}
                    prefix={delayedItems.length > 0 ? <WarningOutlined style={{ fontSize: 14 }} /> : undefined}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<Text style={{ fontSize: 11 }}>Ngày còn lại</Text>}
                    value={Math.max(0, dayjs(contract.endDate).diff(dayjs(), 'day'))}
                    suffix="ngày"
                    valueStyle={{
                      fontSize: 18, fontWeight: 700,
                      color: dayjs(contract.endDate).diff(dayjs(), 'day') > 30 ? '#059669'
                        : dayjs(contract.endDate).diff(dayjs(), 'day') > 0 ? '#d97706' : '#dc2626',
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ─── Biểu đồ tiến độ theo tháng ─────────────────────────── */}
          <Col xs={24} lg={14}>
            <Card className="db-chart-card" styles={{ body: { padding: '16px 20px' } }} style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #059669, #34d399)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15,
                }}>
                  <BarChartOutlined />
                </div>
                <Title level={5} style={{ margin: 0, color: colors.navy }}>Kế hoạch vs Thực tế (theo tháng)</Title>
              </div>
              <Line {...lineConfig} />
              <Row gutter={12} style={{ marginTop: 12 }}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', background: '#f0f7ff', borderRadius: 8, padding: '8px 0' }}>
                    <div style={{ fontSize: 11, color: '#666' }}>Chi phí TT</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>{formatCurrency(totalActualCost)}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', background: '#f0f7ff', borderRadius: 8, padding: '8px 0' }}>
                    <div style={{ fontSize: 11, color: '#666' }}>Dự toán</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#666' }}>{formatCurrency(totalPlannedCost)}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{
                    textAlign: 'center', borderRadius: 8, padding: '8px 0',
                    background: totalActualCost > totalPlannedCost ? '#fff2f0' : '#f0fff4',
                  }}>
                    <div style={{ fontSize: 11, color: '#666' }}>Sử dụng DT</div>
                    <div style={{
                      fontSize: 16, fontWeight: 700,
                      color: totalPlannedCost > 0 && totalActualCost / totalPlannedCost > 1 ? '#dc2626' : '#059669',
                    }}>
                      {totalPlannedCost > 0 ? Math.round(totalActualCost / totalPlannedCost * 100) : 0}%
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* ─── Chi tiết từng hạng mục ──────────────────────────────────── */}
        <Card className="db-chart-card" styles={{ body: { padding: '16px 20px' } }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15,
              }}>
                <ThunderboltOutlined />
              </div>
              <Title level={5} style={{ margin: 0, color: colors.navy }}>Chi tiết hạng mục</Title>
              <Tag color="blue">{sortedItems.length} hạng mục</Tag>
            </div>
          </div>

          {contractWorkItems.length === 0 && <Empty description="Chưa có công việc nào" />}

          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            {sortedItems.map(item => {
              const statusConf = workItemStatusConfig[item.status];
              const typeConf = workItemTypeConfig[item.workType];
              const delay = calcDelayDays(item);
              const expected = calcExpectedPct(item.plannedStart, item.plannedEnd);
              const costRatio = item.plannedCost > 0 ? Math.round(item.actualCost / item.plannedCost * 100) : 0;
              const isActive = item.status === 'in_progress';

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${delay > 0 ? '#ffccc7' : colors.border}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    borderLeft: `4px solid ${delay > 0 ? '#dc2626' : getProgressColor(item.progress)}`,
                  }}
                >
                  {/* Row 1: Header */}
                  <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
                    <Col>
                      <Space size={8} wrap>
                        <Text strong style={{ fontSize: 13, color: colors.navy }}>{item.code}</Text>
                        <Text style={{ fontSize: 13 }}>{item.name}</Text>
                        <Tag color={typeConf.color} style={{ fontSize: 10 }}>{typeConf.label}</Tag>
                        <Tag color={statusConf.color} style={{ fontSize: 10 }}>{statusConf.label}</Tag>
                        {delay > 0 && (
                          <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ fontSize: 10 }}>
                            Chậm {delay} ngày
                          </Tag>
                        )}
                        {costRatio > 100 && (
                          <Tag color="red" icon={<WarningOutlined />} style={{ fontSize: 10 }}>
                            Vượt DT {costRatio}%
                          </Tag>
                        )}
                      </Space>
                    </Col>
                    <Col>
                      <Space size={8}>
                        <Tag style={{ fontSize: 11 }}>{getDepartmentShortName(item.assignedUnit)}</Tag>
                        {isActive && (
                          <Dropdown
                            menu={{
                              items: [
                                { key: 'report', icon: <FileTextOutlined />, label: 'Báo cáo tiến độ' },
                                { key: 'adjust', icon: <EditOutlined />, label: 'Điều chỉnh kế hoạch' },
                              ],
                              onClick: ({ key }) => {
                                if (key === 'report') handleOpenReport(item);
                                if (key === 'adjust') handleOpenAdjust(item);
                              },
                            }}
                            trigger={['click']}
                          >
                            <Button type="text" size="small" icon={<MoreOutlined />} />
                          </Dropdown>
                        )}
                      </Space>
                    </Col>
                  </Row>

                  {/* Row 2: Progress bars */}
                  <Row gutter={24} align="middle" style={{ marginBottom: 8 }}>
                    <Col xs={24} md={14}>
                      <div style={{ marginBottom: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 11, color: '#666' }}>Tiến độ thực tế</Text>
                          <Text strong style={{ fontSize: 11, color: getProgressColor(item.progress) }}>{item.progress}%</Text>
                        </div>
                        <Progress percent={item.progress} size="small" strokeColor={getProgressColor(item.progress)} showInfo={false} />
                      </div>
                      {isActive && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <Text style={{ fontSize: 11, color: '#666' }}>Kế hoạch tại {dayjs().format('DD/MM')}</Text>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {item.progress >= expected
                                ? <RiseOutlined style={{ color: '#059669', fontSize: 10 }} />
                                : <FallOutlined style={{ color: '#dc2626', fontSize: 10 }} />}
                              <Text strong style={{ fontSize: 11, color: colors.navy }}>{expected}%</Text>
                            </div>
                          </div>
                          <Progress percent={expected} size="small" strokeColor={colors.navyLight} showInfo={false} />
                        </div>
                      )}
                    </Col>
                    <Col xs={24} md={10}>
                      <Row gutter={12}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Khối lượng</Text>
                          <Text style={{ fontSize: 13 }}>
                            <Text strong style={{ color: item.completedQuantity >= item.plannedQuantity ? '#059669' : colors.navy }}>
                              {item.completedQuantity}
                            </Text>
                            <Text type="secondary">/{item.plannedQuantity}</Text>
                          </Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>Chi phí TT/DT</Text>
                          <Text style={{ fontSize: 12 }}>
                            <Text style={{ color: costRatio > 100 ? '#dc2626' : '#059669' }}>{formatCurrency(item.actualCost)}</Text>
                            <Text type="secondary">/{formatCurrency(item.plannedCost)}</Text>
                          </Text>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  {/* Row 3: Dates */}
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <Space size={4}>
                      <CalendarOutlined style={{ fontSize: 11, color: '#999' }} />
                      <Text style={{ fontSize: 11, color: '#666' }}>
                        KH: {formatDate(item.plannedStart)} → {formatDate(item.plannedEnd)}
                      </Text>
                    </Space>
                    {item.actualStart && (
                      <Space size={4}>
                        <ClockCircleOutlined style={{ fontSize: 11, color: colors.info }} />
                        <Text style={{ fontSize: 11, color: colors.info }}>
                          TT: {formatDate(item.actualStart)}{item.actualEnd ? ` → ${formatDate(item.actualEnd)}` : ' → ...'}
                        </Text>
                      </Space>
                    )}
                  </div>
                </div>
              );
            })}
          </Space>
        </Card>
      </div>
    );
  };

  // ─── Tab 4: Nghiệm thu ────────────────────────────────────
  const acceptanceColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{code}</Text>,
    },
    {
      title: 'Tên nghiệm thu',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Đoàn kiểm tra',
      dataIndex: 'inspectorTeam',
      key: 'inspectorTeam',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Kết quả',
      dataIndex: 'qualityResult',
      key: 'qualityResult',
      width: 120,
      render: (result: string) => {
        const map: Record<string, { label: string; color: string }> = {
          passed: { label: 'Đạt', color: 'success' },
          conditional: { label: 'Đạt có điều kiện', color: 'warning' },
          failed: { label: 'Không đạt', color: 'error' },
        };
        const conf = map[result] || { label: result, color: 'default' };
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AcceptanceRecord['status']) => {
        const conf = acceptanceStatusConfig[status];
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
  ];

  const renderAcceptance = () => (
    <Card className="db-chart-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 15,
        }}>
          <SafetyCertificateOutlined />
        </div>
        <Title level={5} style={{ margin: 0, color: colors.navy }}>
          Nghiệm thu
        </Title>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {contractAcceptance.length} biên bản
        </Text>
      </div>
      {contractAcceptance.length > 0 ? (
        <Table
          dataSource={contractAcceptance}
          columns={acceptanceColumns}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />
      ) : (
        <Empty description="Chưa có biên bản nghiệm thu" />
      )}
    </Card>
  );

  // ─── Tab 5: Quyết toán ────────────────────────────────────
  const renderSettlement = () => {
    const closure = contract ? getContractClosure(contract.id) : undefined;
    const allVersions = contract ? getSettlementsByContract(contract.id).filter(s => s.status !== 'closed') : [];
    const varReport = contractSettlement ? getVarianceReport(contractSettlement.id) : undefined;

    if (!contractSettlement) {
      return (
        <Card className="db-chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.navyDark, fontSize: 15,
            }}>
              <AccountBookOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: colors.navy }}>Quyết toán</Title>
          </div>
          <Empty description="Chưa có quyết toán" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Text type="secondary">Quyết toán sẽ được lập sau khi hoàn thành nghiệm thu</Text>
            <div style={{ marginTop: 12 }}>
              <Button
                type="primary"
                icon={<AccountBookOutlined />}
                style={{ background: colors.navy }}
                onClick={() => message.info('Lập quyết toán từ menu Quyết toán')}
              >
                Lập quyết toán
              </Button>
            </div>
          </Empty>
        </Card>
      );
    }

    const stConf = settlementStatusConfig[contractSettlement.status];

    return (
      <div>
        {/* Closure banner */}
        {closure && (
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            borderRadius: 10, padding: '14px 20px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SafetyCertificateOutlined style={{ fontSize: 24, color: '#fff' }} />
              <div>
                <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14, display: 'block' }}>
                  Hợp đồng đã được đóng
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                  {formatDate(closure.closureDate)} · Mã lưu trữ: {closure.archiveCode}
                </Text>
              </div>
            </div>
            <Tag style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>
              Đã đóng
            </Tag>
          </div>
        )}

        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* Cost summary */}
          <Col xs={24} lg={14}>
            <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.navyDark, fontSize: 15,
                  }}>
                    <AccountBookOutlined />
                  </div>
                  <Text strong style={{ color: colors.navy, fontSize: 14 }}>{contractSettlement.code}</Text>
                  <Tag color={stConf?.color}>{stConf?.label}</Tag>
                  <Tag color={contractSettlement.settlementType === 'final' ? 'purple' : 'blue'} style={{ fontSize: 11 }}>
                    {contractSettlement.settlementType === 'final' ? 'Toàn bộ' : 'Từng phần'}
                  </Tag>
                  {contractSettlement.isLocked && (
                    <Tag icon={<LockOutlined />} color="default" style={{ fontSize: 11 }}>Đã khóa</Tag>
                  )}
                </div>
                <Button
                  size="small"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => navigate(`/settlement/${contractSettlement.id}`)}
                  style={{ color: colors.navy }}
                >
                  Xem chi tiết
                </Button>
              </div>

              <Row gutter={12}>
                <Col span={8}>
                  <Statistic title="Dự toán" value={contractSettlement.plannedCost} suffix="tr"
                    valueStyle={{ fontSize: 18, color: colors.navy }} />
                </Col>
                <Col span={8}>
                  <Statistic title="Thực chi" value={contractSettlement.actualCost} suffix="tr"
                    valueStyle={{ fontSize: 18, fontWeight: 700,
                      color: contractSettlement.costVariance > 0 ? colors.danger : colors.success }} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Lợi nhuận"
                    value={contractSettlement.grossProfit}
                    suffix="tr"
                    prefix={contractSettlement.grossProfit > 0 ? '+' : ''}
                    valueStyle={{ fontSize: 18,
                      color: contractSettlement.grossProfit >= 0 ? colors.success : colors.danger }} />
                </Col>
              </Row>

              <Divider style={{ margin: '12px 0' }} />

              {/* Cost breakdown */}
              {[
                { label: 'Vật tư', val: contractSettlement.materialCostActual, color: '#1890ff', planned: contractSettlement.plannedCost * 0.46 },
                { label: 'Nhân công', val: contractSettlement.laborCostActual, color: '#52c41a', planned: contractSettlement.plannedCost * 0.29 },
                { label: 'Thiết bị', val: contractSettlement.equipmentCostActual, color: '#faad14', planned: contractSettlement.plannedCost * 0.14 },
                { label: 'CP chung', val: contractSettlement.overheadCostActual, color: '#722ed1', planned: contractSettlement.plannedCost * 0.11 },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 12 }}>{item.label}</Text>
                    <Space size={4}>
                      <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(item.val)}</Text>
                      {item.val > item.planned && (
                        <Tag color="red" style={{ fontSize: 10, padding: '0 3px', margin: 0 }}>↑</Tag>
                      )}
                    </Space>
                  </div>
                  <Progress
                    percent={Math.round((item.val / contractSettlement.actualCost) * 100)}
                    showInfo={false} strokeColor={item.color} size="small"
                  />
                </div>
              ))}
            </Card>
          </Col>

          {/* Variance + closure checklist */}
          <Col xs={24} lg={10}>
            {/* Variance */}
            <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <Text strong style={{ color: colors.navy, fontSize: 13, display: 'block', marginBottom: 10 }}>
                Chênh lệch chi phí
              </Text>
              <div style={{ textAlign: 'center' as const, marginBottom: 8 }}>
                <div style={{
                  fontSize: 28, fontWeight: 700,
                  color: contractSettlement.costVariance > 0 ? colors.danger : colors.success,
                }}>
                  {contractSettlement.costVariance > 0 ? '+' : ''}{contractSettlement.costVariancePct.toFixed(1)}%
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {contractSettlement.costVariance > 0 ? 'Vượt' : 'Tiết kiệm'} {formatCurrency(Math.abs(contractSettlement.costVariance))} so với dự toán
                </Text>
              </div>
              {varReport?.explanationRequired && (
                <Alert
                  type={varReport.approvedWithVariance ? 'success' : 'warning'}
                  message={<Text style={{ fontSize: 12 }}>
                    {varReport.approvedWithVariance ? 'Chênh lệch đã được BGĐ chấp thuận' : 'Yêu cầu giải trình chênh lệch >5%'}
                  </Text>}
                  showIcon
                  style={{ borderRadius: 6 }}
                />
              )}
            </Card>

            {/* Closure checklist */}
            {closure ? (
              <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Text strong style={{ color: '#389e0d', fontSize: 13, display: 'block', marginBottom: 10 }}>
                  <SafetyCertificateOutlined style={{ marginRight: 6 }} />Checklist đóng hợp đồng
                </Text>
                {closure.checklistItems.map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <CheckCircleOutlined style={{ color: colors.success, fontSize: 13 }} />
                    <Text style={{ fontSize: 12 }}>{item.label}</Text>
                  </div>
                ))}
              </Card>
            ) : (
              <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Text strong style={{ color: colors.navy, fontSize: 13, display: 'block', marginBottom: 10 }}>
                  Checklist đóng hợp đồng
                </Text>
                {[
                  { label: 'Tất cả WBS đã hoàn thành', met: contractWorkItems.every(w => w.status === 'completed') },
                  { label: 'Tất cả nghiệm thu đã đạt', met: contractAcceptance.every(a => a.status === 'passed' || a.status === 'handed_over') },
                  { label: 'Quyết toán đã được phê duyệt', met: contractSettlement.status === 'approved' },
                  { label: 'Số liệu tài chính đã đối chiếu', met: contractSettlement.reconciliationStatus === 'reconciled' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    {item.met
                      ? <CheckCircleOutlined style={{ color: colors.success, fontSize: 13 }} />
                      : <ExclamationCircleOutlined style={{ color: '#bbb', fontSize: 13 }} />}
                    <Text style={{ fontSize: 12, color: item.met ? '#555' : '#bbb' }}>{item.label}</Text>
                  </div>
                ))}
                {contractSettlement.status === 'approved' && (
                  <Button
                    block
                    style={{ marginTop: 12, borderColor: '#7c3aed', color: '#7c3aed' }}
                    icon={<LockOutlined />}
                    onClick={() => Modal.confirm({
                      title: 'Xác nhận đóng hợp đồng',
                      content: 'Đóng hợp đồng sau khi tất cả điều kiện đã đáp ứng?',
                      okText: 'Đóng hợp đồng',
                      onOk: () => message.success('Đã đóng hợp đồng thành công'),
                    })}
                  >
                    Đóng hợp đồng
                  </Button>
                )}
              </Card>
            )}
          </Col>
        </Row>

        {/* All versions */}
        {allVersions.length > 1 && (
          <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text strong style={{ color: colors.navy, fontSize: 13, display: 'block', marginBottom: 10 }}>
              Các phiên bản quyết toán
            </Text>
            <Space>
              {allVersions.map(s => {
                const cfg = settlementStatusConfig[s.status];
                return (
                  <Tag
                    key={s.id}
                    color={s.id === contractSettlement.id ? 'blue' : 'default'}
                    style={{ cursor: 'pointer', fontSize: 12 }}
                    onClick={() => navigate(`/settlement/${s.id}`)}
                  >
                    v{s.version} · <Tag color={cfg?.color} style={{ margin: 0, fontSize: 11 }}>{cfg?.label}</Tag>
                  </Tag>
                );
              })}
            </Space>
          </Card>
        )}
      </div>
    );
  };

  // ─── Tab items ─────────────────────────────────────────────
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <FileProtectOutlined style={{ marginRight: 6 }} />
          Tổng quan
        </span>
      ),
      children: renderOverview(),
    },
    {
      key: 'wbs',
      label: (
        <span>
          <AppstoreOutlined style={{ marginRight: 6 }} />
          Phân rã công việc (WBS)
        </span>
      ),
      children: renderWBS(),
    },
    {
      key: 'progress',
      label: (
        <span>
          <ScheduleOutlined style={{ marginRight: 6 }} />
          Tiến độ
        </span>
      ),
      children: renderProgress(),
    },
    {
      key: 'acceptance',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          Nghiệm thu
        </span>
      ),
      children: renderAcceptance(),
    },
    {
      key: 'settlement',
      label: (
        <span>
          <AccountBookOutlined style={{ marginRight: 6 }} />
          Quyết toán
        </span>
      ),
      children: renderSettlement(),
    },
  ];

  return (
    <div>
      {/* ─── Hero Banner ─── */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button
              type="text" icon={<ArrowLeftOutlined />}
              style={{ color: '#fff' }}
              onClick={() => navigate(-1)}
            />
            <FileProtectOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{contract.name}</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  {contract.code}
                </Tag>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  {contract.contractType === 'contract' ? 'Hợp đồng' : 'QĐ giao NV'}
                </Tag>
              </Space>
            </div>
          </Space>
          <Space>
            <Tag
              color={statusConf.color}
              style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}
            >
              {statusConf.label}
            </Tag>
          </Space>
        </div>
        {/* Metadata row below gradient */}
        <div style={{ padding: '14px 24px', background: '#fff', display: 'flex', gap: 32, flexWrap: 'wrap', borderTop: '1px solid #f0f0f0' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đơn vị đặt hàng</Text>
            <Text strong style={{ fontSize: 13 }}>{contract.partnerUnit}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá trị HĐ</Text>
            <Text strong style={{ fontSize: 13, color: colors.navy }}>{formatCurrency(contract.contractValue)}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Thời gian</Text>
            <Text strong style={{ fontSize: 13 }}>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tiến độ</Text>
            <Text strong style={{ fontSize: 13, color: getProgressColor(overallProgress) }}>{overallProgress}%</Text>
          </div>
          {mission && (
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Nhiệm vụ liên kết</Text>
              <Text strong style={{ fontSize: 13 }}>{mission.code}</Text>
            </div>
          )}
        </div>
      </Card>

      {/* Multi-tab content */}
      <Tabs defaultActiveKey="overview" items={tabItems} />

      {/* ─── Drawer: Báo cáo tiến độ ──────────────────────────────────── */}
      <Drawer
        title={null}
        placement="right"
        width={500}
        open={reportDrawerOpen}
        onClose={() => { setReportDrawerOpen(false); setActiveWorkItem(null); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setReportDrawerOpen(false); setActiveWorkItem(null); }}>Hủy</Button>
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
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                {activeWorkItem?.code} — {activeWorkItem?.name}
              </div>
            </div>
          </Space>
        </div>
        {activeWorkItem && (
          <div style={{ padding: 20 }}>
            <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', marginBottom: 20, borderLeft: `3px solid ${colors.navy}` }}>
              <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>
                <ThunderboltOutlined style={{ marginRight: 6 }} />Tình trạng hiện tại
              </Text>
              <Row gutter={[12, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ TT / KH</Text>
                  <div>
                    <Text strong style={{ color: getProgressColor(activeWorkItem.progress) }}>{activeWorkItem.progress}%</Text>
                    <Text type="secondary"> / {calcExpectedPct(activeWorkItem.plannedStart, activeWorkItem.plannedEnd)}%</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Sai lệch</Text>
                  <div>
                    {calcDelayDays(activeWorkItem) > 0
                      ? <Tag color="red">Chậm {calcDelayDays(activeWorkItem)} ngày</Tag>
                      : <Tag color="green">Đúng kế hoạch</Tag>}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Khối lượng TT / KH</Text>
                  <div><Text strong>{activeWorkItem.completedQuantity}</Text><Text type="secondary">/{activeWorkItem.plannedQuantity}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Chi phí TT / DT</Text>
                  <div><Text style={{ fontSize: 12 }}>{formatCurrency(activeWorkItem.actualCost)} / {formatCurrency(activeWorkItem.plannedCost)}</Text></div>
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

      {/* ─── Drawer: Điều chỉnh kế hoạch ──────────────────────────────── */}
      <Drawer
        title={null}
        placement="right"
        width={480}
        open={adjustDrawerOpen}
        onClose={() => { setAdjustDrawerOpen(false); setActiveWorkItem(null); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setAdjustDrawerOpen(false); setActiveWorkItem(null); }}>Hủy</Button>
            <Button type="primary" style={{ background: colors.navy, borderColor: colors.navy }} onClick={handleSaveAdjust}>
              Lưu điều chỉnh
            </Button>
          </div>
        }
      >
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarOutlined style={{ color: '#f0d890', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Điều chỉnh kế hoạch</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {activeWorkItem?.code} — {activeWorkItem?.name}
              </div>
            </div>
          </Space>
        </div>
        {activeWorkItem && (
          <div style={{ padding: 20 }}>
            <div style={{
              background: calcDelayDays(activeWorkItem) > 0 ? '#fff2f0' : '#f0f7ff',
              borderRadius: 8, padding: '12px 16px', marginBottom: 20,
              borderLeft: `3px solid ${calcDelayDays(activeWorkItem) > 0 ? '#ff4d4f' : colors.navy}`,
            }}>
              <Row gutter={[12, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ TT / KH</Text>
                  <div>
                    <Text strong style={{ color: getProgressColor(activeWorkItem.progress) }}>{activeWorkItem.progress}%</Text>
                    <Text type="secondary"> / {calcExpectedPct(activeWorkItem.plannedStart, activeWorkItem.plannedEnd)}%</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Hạn kết thúc hiện tại</Text>
                  <div><Text style={{ fontSize: 13 }}>{formatDate(activeWorkItem.plannedEnd)}</Text></div>
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
                <Select
                  mode="multiple"
                  placeholder="Chọn phân hệ cần thông báo"
                  options={[
                    { value: 'repair', label: 'Quản lý Sửa chữa' },
                    { value: 'overhaul', label: 'Quản lý Đại tu' },
                    { value: 'manufacturing', label: 'Quản lý Sản xuất' },
                  ]}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ContractDetailPage;
