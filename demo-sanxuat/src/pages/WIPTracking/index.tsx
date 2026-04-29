import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Space, Typography, Row, Col, Progress, Input, Select, Button, Dropdown, Modal, message,
} from 'antd';
import {
  SwapOutlined, SyncOutlined, ClockCircleOutlined, StopOutlined, SearchOutlined,
  MoreOutlined, EyeOutlined, CheckCircleOutlined, ForwardOutlined,
  ExclamationCircleOutlined, NodeIndexOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { WorkInProgress, WIPStatus } from '../../types';
import { wipStatusConfig, formatDateTime } from '../../utils/format';
import { processRoutings, processSteps } from '../../data/processRoutings';
import { productionOrders } from '../../data/productionOrders';

const { Text, Title } = Typography;

// Helper: lấy tên công đoạn từ stepNo + productId
const getStepName = (orderCode: string, stepNo: number): string => {
  const order = productionOrders.find(o => o.code === orderCode);
  if (!order) return `Bước ${stepNo}`;
  const routing = processRoutings.find(r => r.productId === order.productId);
  if (!routing) return `Bước ${stepNo}`;
  const step = processSteps.find(s => s.routingId === routing.id && s.stepNo === stepNo);
  return step ? step.name : `Bước ${stepNo}`;
};

// --- Mock data — tham chiếu đúng lệnh SX thật + component từ BOM ---
const wipItems: WorkInProgress[] = [
  // LSX-2026-0058: Module thu phát Alpha-18 (4/10, in_progress) — BOM con: BOM-003, BOM-004
  {
    id: 'WIP-001', orderId: 'LSX-2026-0058', orderCode: 'LSX-2026-0058',
    productName: 'Module thu phát Alpha-18', componentName: 'Module nguồn AC/DC',
    currentStep: 3, totalSteps: 5, currentWorkshop: 'PX4',
    status: 'in_progress', startedAt: '2026-04-01', lastUpdated: '2026-04-06 14:30',
    estimatedCompletion: '2026-04-15',
  },
  {
    id: 'WIP-002', orderId: 'LSX-2026-0058', orderCode: 'LSX-2026-0058',
    productName: 'Module thu phát Alpha-18', componentName: 'Bo mạch xử lý trung tần',
    currentStep: 2, totalSteps: 5, currentWorkshop: 'PX4',
    status: 'waiting', startedAt: '2026-04-01', lastUpdated: '2026-04-05 09:00',
    estimatedCompletion: '2026-04-12',
  },
  {
    id: 'WIP-003', orderId: 'LSX-2026-0058', orderCode: 'LSX-2026-0058',
    productName: 'Module thu phát Alpha-18', componentName: 'Vỏ hộp kim loại',
    currentStep: 1, totalSteps: 5, currentWorkshop: 'PX3',
    status: 'completed', startedAt: '2026-04-01', completedAt: '2026-04-03', lastUpdated: '2026-04-03 16:00',
  },
  // LSX-2026-0059: Module 36D6 (15/20, in_progress)
  {
    id: 'WIP-004', orderId: 'LSX-2026-0059', orderCode: 'LSX-2026-0059',
    productName: 'Module xử lý tín hiệu 36D6', componentName: 'PCB + IC xử lý (lô 4)',
    currentStep: 3, totalSteps: 4, currentWorkshop: 'PX4',
    status: 'in_progress', startedAt: '2026-04-05', lastUpdated: '2026-04-07 11:20',
    estimatedCompletion: '2026-04-10',
  },
  {
    id: 'WIP-005', orderId: 'LSX-2026-0059', orderCode: 'LSX-2026-0059',
    productName: 'Module xử lý tín hiệu 36D6', componentName: 'PCB + IC xử lý (lô 5)',
    currentStep: 2, totalSteps: 4, currentWorkshop: 'PX4',
    status: 'in_progress', startedAt: '2026-04-06', lastUpdated: '2026-04-07 15:00',
    estimatedCompletion: '2026-04-12',
  },
  // LSX-2026-0062: Module Beta-37 (3/5, in_progress)
  {
    id: 'WIP-006', orderId: 'LSX-2026-0062', orderCode: 'LSX-2026-0062',
    productName: 'Module thu phát Beta-37', componentName: 'Bo mạch IF Beta-37 (bộ 4)',
    currentStep: 2, totalSteps: 5, currentWorkshop: 'PX4',
    status: 'blocked', startedAt: '2026-04-05', lastUpdated: '2026-04-06 10:00',
    blockReason: 'Thiếu FPGA Xilinx XC7K325T — chờ nhập khẩu, dự kiến về 15/04',
  },
  {
    id: 'WIP-007', orderId: 'LSX-2026-0062', orderCode: 'LSX-2026-0062',
    productName: 'Module thu phát Beta-37', componentName: 'Vỏ hộp module Beta-37 (bộ 4)',
    currentStep: 1, totalSteps: 5, currentWorkshop: 'PX3',
    status: 'completed', startedAt: '2026-04-05', completedAt: '2026-04-06', lastUpdated: '2026-04-06 16:00',
  },
  {
    id: 'WIP-008', orderId: 'LSX-2026-0062', orderCode: 'LSX-2026-0062',
    productName: 'Module thu phát Beta-37', componentName: 'Module phát + bộ thu (bộ 4)',
    currentStep: 3, totalSteps: 5, currentWorkshop: 'PX1',
    status: 'waiting', startedAt: '2026-04-05', lastUpdated: '2026-04-07 08:00',
    estimatedCompletion: '2026-04-14',
  },
  // LSX-2026-0061: Cụm Gateway Alpha-18 (0/3, pending_material) — chưa bắt đầu
  {
    id: 'WIP-009', orderId: 'LSX-2026-0061', orderCode: 'LSX-2026-0061',
    productName: 'Cụm Gateway Alpha-18', componentName: 'Khung gateway + module',
    currentStep: 0, totalSteps: 5, currentWorkshop: '--',
    status: 'not_started', lastUpdated: '2026-04-05 08:00',
  },
];

const WIPTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<WIPStatus | undefined>(undefined);
  const [filterWorkshop, setFilterWorkshop] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    return wipItems.filter((w) => {
      const matchSearch = !searchText ||
        w.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        w.componentName.toLowerCase().includes(searchText.toLowerCase()) ||
        w.productName.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || w.status === filterStatus;
      const matchWorkshop = !filterWorkshop || w.currentWorkshop === filterWorkshop;
      return matchSearch && matchStatus && matchWorkshop;
    });
  }, [searchText, filterStatus, filterWorkshop]);

  const stats = {
    total: wipItems.length,
    inProgress: wipItems.filter(w => w.status === 'in_progress').length,
    waiting: wipItems.filter(w => w.status === 'waiting').length,
    blocked: wipItems.filter(w => w.status === 'blocked').length,
  };

  // Tồn theo phân xưởng
  const workshopCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    wipItems.filter(w => w.status !== 'completed' && w.status !== 'not_started').forEach(w => {
      counts[w.currentWorkshop] = (counts[w.currentWorkshop] || 0) + 1;
    });
    return counts;
  }, []);

  const handleAction = (record: WorkInProgress, action: string) => {
    const nextStepName = getStepName(record.orderCode, record.currentStep + 1);
    const currentStepName = getStepName(record.orderCode, record.currentStep);

    // Tìm phân xưởng của bước tiếp theo
    const order = productionOrders.find(o => o.code === record.orderCode);
    const routing = order ? processRoutings.find(r => r.productId === order.productId) : null;
    const nextStep = routing ? processSteps.find(s => s.routingId === routing.id && s.stepNo === record.currentStep + 1) : null;

    if (action === 'next_step') {
      let qualityResult = '';
      Modal.confirm({
        title: 'Chuyển công đoạn tiếp theo',
        icon: <ForwardOutlined style={{ color: '#1B3A5C' }} />,
        width: 500,
        content: (
          <div style={{ marginTop: 12 }}>
            <div style={{ padding: '10px 14px', background: '#f0f7ff', borderRadius: 8, border: '1px solid #d6e4ff', marginBottom: 12 }}>
              <div style={{ fontSize: 12 }}>
                <Text strong>{record.componentName}</Text>
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <Text type="secondary">Từ: </Text><Tag>{record.currentStep}. {currentStepName}</Tag>
                <Text type="secondary"> tại </Text><Tag color="#1B3A5C">{record.currentWorkshop}</Tag>
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <Text type="secondary">Sang: </Text><Tag color="#52c41a">{record.currentStep + 1}. {nextStepName}</Tag>
                {nextStep && <><Text type="secondary"> tại </Text><Tag color="#1B3A5C">{nextStep.workshopName}</Tag></>}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Kết quả kiểm tra công đoạn hiện tại</Text>
              <textarea rows={2}
                placeholder="VD: Đạt kiểm tra 100%, đủ điều kiện chuyển sang bước tiếp theo"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13 }}
                onChange={(e) => { qualityResult = e.target.value; }}
              />
            </div>
            {nextStep?.qualityStandard && (
              <div style={{ padding: '6px 10px', background: 'rgba(82,196,26,0.06)', borderRadius: 6, border: '1px solid rgba(82,196,26,0.15)', fontSize: 11 }}>
                <Text style={{ color: '#52c41a', fontWeight: 600 }}><CheckCircleOutlined style={{ marginRight: 4 }} />Tiêu chuẩn bước tiếp: </Text>
                <Text style={{ fontSize: 11 }}>{nextStep.qualityStandard}</Text>
              </div>
            )}
          </div>
        ),
        okText: 'Xác nhận chuyển', cancelText: 'Hủy',
        onOk: () => {
          console.log({ action, qualityResult, nextStep: nextStep?.name });
          message.success(`Đã chuyển sang: ${nextStepName}${nextStep ? ` (${nextStep.workshopName})` : ''}`);
        },
      });
    } else if (action === 'complete') {
      Modal.confirm({
        title: 'Hoàn thành bán thành phẩm',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        width: 450,
        content: (
          <div style={{ marginTop: 8 }}>
            <p>Đánh dấu <strong>{record.componentName}</strong> hoàn thành.</p>
            <p style={{ fontSize: 13 }}>Sau khi hoàn thành, BTP sẽ được chuyển sang:</p>
            <ul style={{ fontSize: 13, paddingLeft: 20 }}>
              <li>Tích hợp tổng thể (nếu là thành phần của module)</li>
              <li>Nhập kho trung gian (nếu là BTP độc lập)</li>
            </ul>
          </div>
        ),
        okText: 'Hoàn thành', cancelText: 'Hủy',
        onOk: () => {
          message.success('Đã hoàn thành bán thành phẩm');
          Modal.info({
            title: 'Chuyển nhập kho',
            content: `"${record.componentName}" đã hoàn thành. Bạn có muốn chuyển sang nhập kho trung gian?`,
            okText: 'Đi đến Nhập kho',
            onOk: () => navigate('/completion'),
          });
        },
      });
    }
  };

  const columns: ColumnsType<WorkInProgress> = [
    {
      title: 'Lệnh sản xuất', dataIndex: 'orderCode', key: 'orderCode', width: 140,
      render: (v: string) => (
        <Button type="link" size="small" style={{ padding: 0, fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C' }}
          onClick={() => {
            const order = productionOrders.find(o => o.code === v);
            if (order) navigate(`/production-orders/${order.id}`);
          }}>
          {v}
        </Button>
      ),
    },
    {
      title: 'Thành phần', key: 'component', width: 220,
      render: (_: unknown, r: WorkInProgress) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.componentName}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.productName}</div>
        </div>
      ),
    },
    {
      title: 'Công đoạn hiện tại', key: 'step', width: 200,
      render: (_: unknown, r: WorkInProgress) => {
        if (r.currentStep === 0) return <Text type="secondary" style={{ fontSize: 12 }}>Chưa bắt đầu</Text>;
        const stepName = getStepName(r.orderCode, r.currentStep);
        return (
          <div>
            <Text style={{ fontSize: 12 }}>{r.currentStep}/{r.totalSteps}: {stepName}</Text>
            <Progress percent={Math.round((r.currentStep / r.totalSteps) * 100)} size="small"
              strokeColor={r.status === 'blocked' ? '#ff4d4f' : '#1B3A5C'} showInfo={false}
              style={{ marginTop: 2 }} />
          </div>
        );
      },
    },
    {
      title: 'Trung tâm', dataIndex: 'currentWorkshop', key: 'currentWorkshop', width: 100,
      render: (v: string) => v !== '--' ? <Tag color="#1B3A5C">{v}</Tag> : <Text type="secondary">--</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: WIPStatus, r: WorkInProgress) => {
        const cfg = wipStatusConfig[s];
        return (
          <div>
            <Tag color={cfg.color}>{cfg.label}</Tag>
            {r.blockReason && (
              <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 2 }}>{r.blockReason}</div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Dự kiến hoàn thành', dataIndex: 'estimatedCompletion', key: 'estimatedCompletion', width: 130,
      sorter: (a, b) => (a.estimatedCompletion || '9999').localeCompare(b.estimatedCompletion || '9999'),
      render: (v?: string) => {
        if (!v) return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
        const isOverdue = new Date(v) < new Date();
        return (
          <Text style={{ fontSize: 12, color: isOverdue ? '#ff4d4f' : undefined, fontWeight: isOverdue ? 600 : 400 }}>
            {formatDateTime(v)}{isOverdue ? ' (quá hạn)' : ''}
          </Text>
        );
      },
    },
    {
      title: 'Thao tác', key: 'actions', width: 60, align: 'center',
      render: (_: unknown, record: WorkInProgress) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(record.status === 'in_progress' && record.currentStep < record.totalSteps ? [
                { key: 'next_step', icon: <ForwardOutlined />, label: 'Chuyển công đoạn tiếp' },
              ] : []),
              ...(record.status === 'in_progress' && record.currentStep === record.totalSteps ? [
                { key: 'complete', icon: <CheckCircleOutlined />, label: 'Hoàn thành BTP' },
              ] : []),
              ...(record.status === 'waiting' ? [
                { key: 'next_step', icon: <ForwardOutlined />, label: 'Chuyển công đoạn tiếp' },
              ] : []),
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/wip-tracking/${record.id}`);
              else handleAction(record, key);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NodeIndexOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Bán thành phẩm & Luồng sản xuất</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Theo dõi trạng thái bán thành phẩm qua từng công đoạn</Text>
          </div>
        </Space>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng bán thành phẩm', value: stats.total, icon: <SwapOutlined />, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Đang xử lý', value: stats.inProgress, icon: <SyncOutlined />, gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)' },
          { label: 'Chờ chuyển công đoạn', value: stats.waiting, icon: <ClockCircleOutlined />, gradient: 'linear-gradient(135deg, #faad14, #ffc53d)' },
          { label: 'Tắc nghẽn', value: stats.blocked, icon: <StopOutlined />, gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)' },
        ].map((card, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }}
              styles={{ body: { padding: '16px 18px', position: 'relative' } }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, pointerEvents: 'none' }}>
                <span style={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }}>{card.icon}</span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{card.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tồn theo phân xưởng */}
      {Object.keys(workshopCounts).length > 0 && (
        <Card size="small" style={{ borderRadius: 14, marginBottom: 20, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          styles={{ body: { padding: '12px 20px' } }}>
          <Space size={16}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tồn tại trung tâm:</Text>
            {Object.entries(workshopCounts).map(([ws, count]) => (
              <Tag key={ws} color={count > 3 ? '#ff4d4f' : count > 1 ? '#faad14' : '#1B3A5C'}
                style={{ fontSize: 12, cursor: 'pointer' }}
                onClick={() => setFilterWorkshop(filterWorkshop === ws ? undefined : ws)}>
                {ws}: {count} BTP
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Tồn theo công đoạn */}
      {(() => {
        const stepCounts: Record<string, number> = {};
        wipItems.filter(w => w.status !== 'completed' && w.status !== 'not_started').forEach(w => {
          const name = getStepName(w.orderCode, w.currentStep);
          stepCounts[name] = (stepCounts[name] || 0) + 1;
        });
        if (Object.keys(stepCounts).length === 0) return null;
        return (
          <Card size="small" style={{ borderRadius: 14, marginBottom: 20, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '12px 20px' } }}>
            <Space size={16} wrap>
              <Text type="secondary" style={{ fontSize: 12 }}>Tồn theo công đoạn:</Text>
              {Object.entries(stepCounts).sort((a, b) => b[1] - a[1]).map(([step, count]) => (
                <Tag key={step} color={count > 2 ? '#ff4d4f' : count > 1 ? '#faad14' : '#8c8c8c'}
                  style={{ fontSize: 11 }}>
                  {step}: {count}
                </Tag>
              ))}
            </Space>
          </Card>
        );
      })()}

      {/* Filter */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={7}>
            <Input placeholder="Tìm kiếm theo mã lệnh, thành phần..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }} />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus}
              allowClear style={{ width: '100%' }}
              options={Object.entries(wipStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Trung tâm" value={filterWorkshop} onChange={setFilterWorkshop}
              allowClear style={{ width: '100%' }}
              options={[
                { value: 'PX1', label: 'PX1 - Monitoring' },
                { value: 'PX3', label: 'PX3 - Hạ tầng' },
                { value: 'PX4', label: 'PX4 - Phát triển PM' },
              ]} />
          </Col>
          <Col xs={24} sm={9} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredData.length}/{wipItems.length} kết quả</Text>
              <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); setFilterWorkshop(undefined); }}>Xóa bộ lọc</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <NodeIndexOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Theo dõi bán thành phẩm</Title>
          </Space>
        </div>
        <Table<WorkInProgress>
          columns={columns} dataSource={filteredData} rowKey="id" size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi` }}
          rowClassName={(r) => r.status === 'blocked' ? 'row-blocked' : ''}
        />
      </Card>

      <style>{`
        .row-blocked td { border-left: 3px solid #ff4d4f; }
      `}</style>
    </div>
  );
};

export default WIPTrackingPage;
