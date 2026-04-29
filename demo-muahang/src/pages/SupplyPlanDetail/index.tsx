import React from 'react';
import {
  Card, Tag, Row, Col, Typography, Table, Space, Button, Empty, Progress, Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, CalendarOutlined,
  UserOutlined, CheckCircleOutlined, DollarOutlined,
  WarningOutlined, ExclamationCircleOutlined, LinkOutlined,
  SyncOutlined, InboxOutlined, SendOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { supplyPlans } from '../../data/supplyPlans';
import {
  formatCurrency, formatDate, supplyPlanStatusConfig, supplyItemStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { SupplyPlanItem } from '../../types';

const { Title, Text } = Typography;

const sourceLabels: Record<string, string> = { purchase: 'Mua mới', stock: 'Tồn kho', transfer: 'Điều chuyển' };
const sourceColors: Record<string, string> = { purchase: '#1B3A5C', stock: '#52c41a', transfer: '#1890ff' };

const SupplyPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const plan = supplyPlans.find(p => p.id === id);

  if (!plan) {
    return (
      <div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/supply-plans')} style={{ padding: 0, marginBottom: 16 }}>
          Quay lại danh sách
        </Button>
        <Empty description="Không tìm thấy kế hoạch" />
      </div>
    );
  }

  const statusCfg = supplyPlanStatusConfig[plan.status];
  const completedItems = plan.items.filter(i => i.status === 'completed' || i.status === 'issued').length;
  const progressPct = plan.items.length > 0 ? Math.round((completedItems / plan.items.length) * 100) : 0;
  const totalNeed = plan.items.reduce((s, i) => s + i.totalNeed, 0);
  const totalReceived = plan.items.reduce((s, i) => s + i.inStock + i.receivedQty, 0);
  const totalIssued = plan.items.reduce((s, i) => s + i.issuedQty, 0);
  const overdueItems = plan.items.filter(i => dayjs(i.deadline).isBefore(dayjs()) && i.status !== 'completed' && i.status !== 'issued').length;

  const itemColumns: ColumnsType<SupplyPlanItem> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_: unknown, __: SupplyPlanItem, index: number) => <Text strong style={{ color: colors.navy }}>{index + 1}</Text>,
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 110,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 14 }}>{code}</Text>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (name: string) => <Text style={{ fontSize: 14 }}>{name}</Text>,
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      align: 'center',
    },
    {
      title: 'Cần',
      dataIndex: 'totalNeed',
      key: 'totalNeed',
      width: 70,
      align: 'right',
      render: (v: number) => <Text strong style={{ fontSize: 14 }}>{v}</Text>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'inStock',
      key: 'inStock',
      width: 75,
      align: 'right',
      render: (v: number) => v > 0 ? <Text style={{ color: colors.success, fontWeight: 600 }}>{v}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Mua mới',
      dataIndex: 'toPurchase',
      key: 'toPurchase',
      width: 75,
      align: 'right',
      render: (v: number) => v > 0 ? <Text style={{ color: colors.navy, fontWeight: 600 }}>{v}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Đã nhận',
      dataIndex: 'receivedQty',
      key: 'receivedQty',
      width: 75,
      align: 'right',
      render: (v: number) => v > 0 ? <Text style={{ color: '#0891b2', fontWeight: 600 }}>{v}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Đã cấp',
      dataIndex: 'issuedQty',
      key: 'issuedQty',
      width: 75,
      align: 'right',
      render: (v: number) => v > 0 ? <Text style={{ color: colors.success, fontWeight: 600 }}>{v}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Đơn giá (tr)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 90,
      align: 'right',
      render: (v: number) => <Text style={{ fontSize: 13, color: colors.textSecondary }}>{v}</Text>,
    },
    {
      title: 'Dự toán (tr)',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      width: 100,
      align: 'right',
      render: (v: number) => <Text strong style={{ color: v > 0 ? colors.navy : colors.textSecondary, fontSize: 13 }}>{v.toFixed(1)}</Text>,
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      align: 'center',
      render: (source: string) => <Tag color={sourceColors[source]} style={{ fontSize: 12 }}>{sourceLabels[source]}</Tag>,
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 120,
      render: (_: unknown, record: SupplyPlanItem) => {
        const total = record.totalNeed;
        const done = record.inStock + record.receivedQty;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <Tooltip title={`${done}/${total} (${pct}%)`}>
            <Progress
              percent={pct}
              size="small"
              strokeColor={pct >= 100 ? colors.success : colors.navy}
              format={() => `${pct}%`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Hạn chót',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 110,
      render: (d: string, record: SupplyPlanItem) => {
        const overdue = dayjs(d).isBefore(dayjs()) && record.status !== 'completed' && record.status !== 'issued';
        const near = dayjs(d).diff(dayjs(), 'day') >= 0 && dayjs(d).diff(dayjs(), 'day') <= 7;
        return (
          <Space size={4}>
            <Text style={{
              color: overdue ? colors.danger : near ? colors.warning : colors.textPrimary,
              fontWeight: overdue || near ? 600 : 400,
              fontSize: 13,
            }}>
              {formatDate(d)}
            </Text>
            {overdue && <ExclamationCircleOutlined style={{ color: colors.danger }} />}
            {near && !overdue && <WarningOutlined style={{ color: colors.warning }} />}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const cfg = supplyItemStatusConfig[status as keyof typeof supplyItemStatusConfig] || { label: status, color: 'default' };
        return <Tag color={cfg.color} style={{ fontSize: 12 }}>{cfg.label}</Tag>;
      },
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/supply-plans')} style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}>
        Quay lại danh sách
      </Button>

      {/* Hero Header */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`,
          padding: '28px 32px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CalendarOutlined style={{ fontSize: 24, color: colors.goldLight }} />
            </div>

            <div style={{ flex: 1 }}>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 600 }}>
                {plan.title}
              </Title>
              <Space size={8} wrap style={{ marginTop: 10 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 12 }}>{plan.code}</Tag>
                {plan.quarter
                  ? <Tag color={colors.gold} style={{ fontSize: 12 }}><CalendarOutlined style={{ marginRight: 3 }} />Quý {plan.quarter}/{plan.year}</Tag>
                  : <Tag style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 12 }}><CalendarOutlined style={{ marginRight: 3 }} />Năm {plan.year}</Tag>
                }
                <Tag color={statusCfg.color} style={{ fontSize: 12 }}>{statusCfg.label}</Tag>
                {overdueItems > 0 && <Tag color="error" icon={<ExclamationCircleOutlined />} style={{ fontSize: 12 }}>{overdueItems} quá hạn</Tag>}
              </Space>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Tổng dự toán</Text>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                {formatCurrency(plan.totalEstimated)}
              </div>
              {plan.approvedBudget > 0 && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  Ngân sách duyệt: <span style={{ color: '#95de64', fontWeight: 600 }}>{formatCurrency(plan.approvedBudget)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {plan.relatedTask && (
          <div style={{ padding: '12px 32px', background: colors.bgLight, borderBottom: `1px solid ${colors.border}`, fontSize: 14 }}>
            <LinkOutlined style={{ marginRight: 8, color: colors.navy }} />
            <Text type="secondary">Nhiệm vụ liên quan: </Text>
            <Text strong>{plan.relatedTask}</Text>
          </div>
        )}
      </Card>

      {/* Thông tin + Tóm tắt tiến độ — 2 cột */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <Card
            title={<Space size={10}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined style={{ fontSize: 14, color: '#fff' }} /></div><span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Thông tin kế hoạch</span></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            <Row gutter={[0, 24]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Mã kế hoạch:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginTop: 4 }}>{plan.code}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Kỳ kế hoạch:</Text>
                <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>
                  {plan.quarter ? `Quý ${plan.quarter}/${plan.year}` : `Năm ${plan.year}`}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}><UserOutlined style={{ marginRight: 4 }} />Người lập:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginTop: 4 }}>{plan.createdBy}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}><CalendarOutlined style={{ marginRight: 4 }} />Ngày lập:</Text>
                <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>{formatDate(plan.createdDate)}</div>
              </Col>
              {plan.approvedBy && (
                <>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 13 }}><CheckCircleOutlined style={{ marginRight: 4 }} />Người duyệt:</Text>
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginTop: 4 }}>{plan.approvedBy}</div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 13 }}><CalendarOutlined style={{ marginRight: 4 }} />Ngày duyệt:</Text>
                    <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>{plan.approvedDate ? formatDate(plan.approvedDate) : '--'}</div>
                  </Col>
                </>
              )}
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}><DollarOutlined style={{ marginRight: 4 }} />Tổng dự toán:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginTop: 4 }}>{formatCurrency(plan.totalEstimated)}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}><CheckCircleOutlined style={{ marginRight: 4 }} />Ngân sách duyệt:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: plan.approvedBudget > 0 ? colors.success : colors.textSecondary, marginTop: 4 }}>
                  {plan.approvedBudget > 0 ? formatCurrency(plan.approvedBudget) : 'Chưa duyệt'}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={<Space size={10}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.success}, #10b981)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SyncOutlined style={{ fontSize: 14, color: '#fff' }} /></div><span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Tiến độ thực hiện</span></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            {/* Circle progress */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Progress
                type="circle"
                percent={progressPct}
                size={100}
                strokeColor={colors.navy}
                format={(pct) => <span style={{ fontSize: 22, fontWeight: 700, color: colors.navy }}>{pct}%</span>}
              />
              <div style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
                {completedItems}/{plan.items.length} loại vật tư hoàn thành
              </div>
            </div>

            {/* Stats */}
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}><InboxOutlined style={{ marginRight: 6 }} />Tổng cần</Text>
                <Text strong style={{ fontSize: 15 }}>{totalNeed}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#0891b2' }}><CheckCircleOutlined style={{ marginRight: 6 }} />Đã nhận</Text>
                <Text strong style={{ fontSize: 15, color: '#0891b2' }}>{totalReceived}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: colors.success }}><SendOutlined style={{ marginRight: 6 }} />Đã cấp phát</Text>
                <Text strong style={{ fontSize: 15, color: colors.success }}>{totalIssued}</Text>
              </div>
              {overdueItems > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.danger }}><ExclamationCircleOutlined style={{ marginRight: 6 }} />Quá hạn</Text>
                  <Text strong style={{ fontSize: 15, color: colors.danger }}>{overdueItems} loại</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Danh sách vật tư */}
      <Card
        title={<Space size={10}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined style={{ fontSize: 14, color: '#fff' }} /></div><span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Danh sách vật tư ({plan.items.length} loại)</span></Space>}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        {/* Legend */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Space size={4}><div style={{ width: 12, height: 12, borderRadius: 2, background: colors.navy }} /><Text style={{ fontSize: 12 }}>Đã nhận</Text></Space>
          <Space size={4}><div style={{ width: 12, height: 12, borderRadius: 2, background: colors.success }} /><Text style={{ fontSize: 12 }}>Đã cấp phát</Text></Space>
          <Space size={4}><ExclamationCircleOutlined style={{ color: colors.danger, fontSize: 12 }} /><Text style={{ fontSize: 12 }}>Quá hạn</Text></Space>
          <Space size={4}><WarningOutlined style={{ color: colors.warning, fontSize: 12 }} /><Text style={{ fontSize: 12 }}>Sắp đến hạn (7 ngày)</Text></Space>
        </div>

        <Table
          columns={itemColumns}
          dataSource={plan.items}
          rowKey="materialId"
          pagination={false}
          size="middle"
          scroll={{ x: 1300 }}
          rowClassName={(record) => {
            if (dayjs(record.deadline).isBefore(dayjs()) && record.status !== 'completed' && record.status !== 'issued') return 'row-highlight';
            return '';
          }}
          summary={() => (
            <Table.Summary.Row style={{ backgroundColor: colors.bgLight }}>
              <Table.Summary.Cell index={0} colSpan={4}><Text strong style={{ fontSize: 14 }}>TỔNG CỘNG</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right"><Text strong style={{ fontSize: 14 }}>{totalNeed}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right"><Text strong style={{ color: colors.success }}>{plan.items.reduce((s, i) => s + i.inStock, 0)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right"><Text strong style={{ color: colors.navy }}>{plan.items.reduce((s, i) => s + i.toPurchase, 0)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right"><Text strong style={{ color: '#0891b2' }}>{plan.items.reduce((s, i) => s + i.receivedQty, 0)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right"><Text strong style={{ color: colors.success }}>{totalIssued}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={6} colSpan={4} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
};

export default SupplyPlanDetail;
