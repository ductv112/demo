import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Space, Typography, Row, Col, Progress, Table, Button, Modal, message, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, NodeIndexOutlined, ForwardOutlined, CheckCircleOutlined,
  ClockCircleOutlined, LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { WorkInProgress, WIPStatus } from '../../types';
import { wipStatusConfig, formatDateTime, formatDate } from '../../utils/format';
import { processRoutings, processSteps } from '../../data/processRoutings';
import { productionOrders } from '../../data/productionOrders';

const { Text, Title } = Typography;

// --- Mock data (copy from WIPTracking) ---
const wipItems: WorkInProgress[] = [
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
    status: 'completed' as WIPStatus, startedAt: '2026-04-01', lastUpdated: '2026-04-03 16:00',
  },
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
    status: 'completed' as WIPStatus, startedAt: '2026-04-05', lastUpdated: '2026-04-06 16:00',
  },
  {
    id: 'WIP-008', orderId: 'LSX-2026-0062', orderCode: 'LSX-2026-0062',
    productName: 'Module thu phát Beta-37', componentName: 'Module phát + bộ thu (bộ 4)',
    currentStep: 3, totalSteps: 5, currentWorkshop: 'PX1',
    status: 'waiting', startedAt: '2026-04-05', lastUpdated: '2026-04-07 08:00',
    estimatedCompletion: '2026-04-14',
  },
  {
    id: 'WIP-009', orderId: 'LSX-2026-0061', orderCode: 'LSX-2026-0061',
    productName: 'Cụm Gateway Alpha-18', componentName: 'Khung gateway + module',
    currentStep: 0, totalSteps: 5, currentWorkshop: '--',
    status: 'not_started', lastUpdated: '2026-04-05 08:00',
  },
];

// Mock timestamps for completed steps
const mockStepTimes: Record<number, { start: string; end: string }> = {
  1: { start: '01/04/2026 08:00', end: '02/04/2026 16:00' },
  2: { start: '03/04/2026 08:00', end: '04/04/2026 17:30' },
  3: { start: '05/04/2026 08:00', end: '06/04/2026 14:30' },
  4: { start: '07/04/2026 08:00', end: '08/04/2026 16:00' },
  5: { start: '09/04/2026 08:00', end: '10/04/2026 12:00' },
};

interface StepRow {
  key: string;
  stepNo: number;
  name: string;
  workshopName: string;
  stepStatus: 'completed' | 'in_progress' | 'pending';
  timeInfo: string;
}

const workshopMap: Record<string, string> = {
  PX1: 'PX1 - Monitoring', PX3: 'PX3 - Hạ tầng', PX4: 'PX4 - Phát triển PM',
};

const WIPTrackingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const wip = wipItems.find(w => w.id === id);

  if (!wip) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Title level={4} style={{ color: '#1B3A5C' }}>Không tìm thấy bán thành phẩm</Title>
        <Button type="primary" onClick={() => navigate('/wip-tracking')}>Quay lại danh sách</Button>
      </Card>
    );
  }

  const order = productionOrders.find(o => o.code === wip.orderCode);
  const routing = order ? processRoutings.find(r => r.productId === order.productId) : null;
  const steps = routing ? processSteps.filter(s => s.routingId === routing.id).sort((a, b) => a.stepNo - b.stepNo) : [];
  const statusCfg = wipStatusConfig[wip.status];
  const progressPercent = wip.totalSteps > 0 ? Math.round((wip.currentStep / wip.totalSteps) * 100) : 0;

  const handleNextStep = () => {
    Modal.confirm({
      title: 'Chuyển công đoạn tiếp theo',
      icon: <ForwardOutlined style={{ color: '#1B3A5C' }} />,
      content: `Chuyển "${wip.componentName}" từ bước ${wip.currentStep} sang bước ${wip.currentStep + 1}?`,
      okText: 'Chuyển',
      cancelText: 'Hủy',
      onOk: () => message.success('Đã chuyển sang công đoạn tiếp theo'),
    });
  };

  const handleComplete = () => {
    Modal.confirm({
      title: 'Hoàn thành bán thành phẩm',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: `Đánh dấu "${wip.componentName}" hoàn thành và chuyển sang tích hợp/nhập kho trung gian?`,
      okText: 'Hoàn thành',
      cancelText: 'Hủy',
      onOk: () => message.success('Đã hoàn thành bán thành phẩm'),
    });
  };

  // Build step rows from routing
  const stepRows: StepRow[] = steps.map(s => {
    let stepStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
    let timeInfo = '--';
    if (s.stepNo < wip.currentStep) {
      stepStatus = 'completed';
      const t = mockStepTimes[s.stepNo];
      timeInfo = t ? `${t.start} - ${t.end}` : '--';
    } else if (s.stepNo === wip.currentStep) {
      stepStatus = 'in_progress';
      const t = mockStepTimes[s.stepNo];
      timeInfo = t ? `${t.start} - Đang thực hiện` : 'Đang thực hiện';
    }
    return {
      key: s.id,
      stepNo: s.stepNo,
      name: s.name,
      workshopName: s.workshopName,
      stepStatus,
      timeInfo,
    };
  });

  const stepColumns: ColumnsType<StepRow> = [
    {
      title: 'Bước', dataIndex: 'stepNo', key: 'stepNo', width: 70, align: 'center',
      render: (v: number, r: StepRow) => {
        const bg = r.stepStatus === 'completed' ? '#52c41a'
          : r.stepStatus === 'in_progress' ? '#1B3A5C' : '#d9d9d9';
        const color = r.stepStatus === 'pending' ? '#8c8c8c' : '#fff';
        return (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: bg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color, fontWeight: 600, fontSize: 13,
          }}>
            {v}
          </div>
        );
      },
    },
    {
      title: 'Tên công đoạn', dataIndex: 'name', key: 'name',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Trung tâm', dataIndex: 'workshopName', key: 'workshopName', width: 150,
      render: (v: string) => <Tag color="#1B3A5C">{v}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'stepStatus', key: 'stepStatus', width: 140,
      render: (s: string) => {
        if (s === 'completed') return <Tag color="success">Hoàn thành</Tag>;
        if (s === 'in_progress') return <Tag color="processing">Đang thực hiện</Tag>;
        return <Tag color="default">Chưa thực hiện</Tag>;
      },
    },
    {
      title: 'Thời gian', dataIndex: 'timeInfo', key: 'timeInfo', width: 260,
      render: (v: string) => <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</Text>,
    },
  ];

  return (
    <div>
      {/* 1. Header Card */}
      <Card style={{
        borderRadius: 14, marginBottom: 20, border: 'none',
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
      }} styles={{ body: { padding: '20px 24px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Button type="text" icon={<ArrowLeftOutlined />}
              style={{ color: 'rgba(255,255,255,0.7)', padding: 0, marginBottom: 8 }}
              onClick={() => navigate('/wip-tracking')}>
              Quay lại danh sách
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <NodeIndexOutlined style={{ color: '#D4A843', fontSize: 20 }} />
              </div>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>{wip.componentName}</Title>
            </div>
            <Space size={8} wrap>
              <Tag style={{ fontFamily: 'monospace', fontSize: 12, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
                {wip.orderCode}
              </Tag>
              <Tag style={{ background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.4)', color: '#f0d890' }}>
                {wip.productName}
              </Tag>
              <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
            </Space>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingTop: 36 }}>
            {(wip.status === 'in_progress' && wip.currentStep < wip.totalSteps) && (
              <Button icon={<ForwardOutlined />} onClick={handleNextStep}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                Chuyển công đoạn tiếp
              </Button>
            )}
            {(wip.status === 'in_progress' && wip.currentStep === wip.totalSteps) && (
              <Button icon={<CheckCircleOutlined />} onClick={handleComplete}
                style={{ background: '#52c41a', color: '#fff', border: 'none' }}>
                Hoàn thành BTP
              </Button>
            )}
            {wip.status === 'waiting' && (
              <Button icon={<ForwardOutlined />} onClick={handleNextStep}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                Chuyển công đoạn tiếp
              </Button>
            )}
          </div>
        </div>

        {wip.blockReason && (
          <Alert type="warning" showIcon
            message={wip.blockReason}
            style={{ marginTop: 12, borderRadius: 8, background: 'rgba(250,173,20,0.15)', border: '1px solid rgba(250,173,20,0.3)' }}
          />
        )}

        <Row gutter={[24, 8]} style={{ marginTop: 16 }}>
          {[
            { label: 'Lệnh sản xuất', value: wip.orderCode, isLink: true },
            { label: 'Sản phẩm', value: wip.productName },
            { label: 'Trung tâm hiện tại', value: wip.currentWorkshop !== '--' ? (workshopMap[wip.currentWorkshop] || wip.currentWorkshop) : '--' },
            { label: 'Bắt đầu', value: wip.startedAt ? formatDate(wip.startedAt) : '--' },
            { label: 'Cập nhật lần cuối', value: formatDateTime(wip.lastUpdated) },
            { label: 'Dự kiến hoàn thành', value: wip.estimatedCompletion ? formatDate(wip.estimatedCompletion) : '--' },
          ].map((item, idx) => (
            <Col xs={12} sm={8} md={4} key={idx}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{item.label}</div>
              {item.isLink && order ? (
                <Button type="link" size="small" style={{ padding: 0, color: '#D4A843', fontFamily: 'monospace', fontSize: 13 }}
                  onClick={() => navigate(`/production-orders/${order.id}`)}>
                  {item.value}
                </Button>
              ) : (
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{item.value}</div>
              )}
            </Col>
          ))}
        </Row>
      </Card>

      {/* 2. Progress */}
      <Card style={{ borderRadius: 14, marginBottom: 20, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '16px 24px' } }}>
        <Space align="center" size={12} style={{ marginBottom: 8 }}>
          <ClockCircleOutlined style={{ color: '#1B3A5C', fontSize: 16 }} />
          <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Tiến độ công đoạn</Text>
          <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
            {wip.currentStep} / {wip.totalSteps} công đoạn
          </Text>
        </Space>
        <Progress
          percent={progressPercent}
          strokeColor={wip.status === 'blocked' ? '#ff4d4f' : { from: '#1B3A5C', to: '#2d5a8e' }}
          size={['100%', 16]}
          format={() => `${progressPercent}%`}
        />
      </Card>

      {/* 3. Step history table */}
      <Card style={{ borderRadius: 14, marginBottom: 20, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <NodeIndexOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Lịch sử di chuyển qua công đoạn</Title>
          </Space>
        </div>
        <Table<StepRow>
          columns={stepColumns}
          dataSource={stepRows}
          pagination={false}
          size="middle"
          rowClassName={(r) => r.stepStatus === 'in_progress' ? 'row-current-step' : ''}
        />
      </Card>

      {/* 4. Links */}
      {order && (
        <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          styles={{ body: { padding: '16px 20px' } }}>
          <Space align="center" size={8}>
            <LinkOutlined style={{ color: '#1B3A5C' }} />
            <Text strong style={{ color: '#1B3A5C' }}>Liên kết</Text>
          </Space>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" ghost icon={<LinkOutlined />}
              onClick={() => navigate(`/production-orders/${order.id}`)}>
              Xem lệnh sản xuất {order.code}
            </Button>
          </div>
        </Card>
      )}

      <style>{`
        .row-current-step td { background: rgba(27, 58, 92, 0.06) !important; }
      `}</style>
    </div>
  );
};

export default WIPTrackingDetailPage;
