import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Tag, Button, Space, Row, Col,
  Typography, Steps, Result, Statistic,
} from 'antd';
import {
  ArrowLeftOutlined, ImportOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExperimentOutlined, InboxOutlined,
  SafetyCertificateOutlined, FileTextOutlined, UserOutlined,
  CalendarOutlined, EnvironmentOutlined, LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { inboundOrders } from '../../data/inboundOrders';
import type { InboundOrder, InboundOrderLine, InboundType, InboundStatus } from '../../types';
import {
  inboundStatusConfig,
  formatNumber,
  formatDate,
  formatDateTime,
} from '../../utils/format';

const { Title, Text } = Typography;

// ─── Inbound type labels ────────────────────────────────────
const inboundTypeLabels: Record<InboundType, string> = {
  purchase: 'Mua sắm',
  production: 'Sản xuất',
  transfer_in: 'Điều chuyển',
  return: 'Trả lại',
};

// ─── QC status config ───────────────────────────────────────
const qcStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ kiểm tra', color: 'blue' },
  passed: { label: 'Đạt', color: 'success' },
  failed: { label: 'Không đạt', color: 'error' },
  partial: { label: 'Đạt 1 phần', color: 'warning' },
};

// ─── Steps mapping from status ──────────────────────────────
const getStepIndex = (status: InboundStatus): number => {
  switch (status) {
    case 'draft': return 0;
    case 'waiting': return 1;
    case 'receiving': return 2;
    case 'quality_check': return 3;
    case 'done': return 4;
    case 'cancelled': return -1;
    default: return 0;
  }
};

// ─── Format value ───────────────────────────────────────────
const formatValue = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} tr`;
  }
  return formatNumber(value) + ' d';
};

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const InboundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const order = inboundOrders.find((o) => o.id === id || o.code === id);

  if (!order) {
    return (
      <Result
        status="404"
        title="Không tìm thấy phiếu nhập"
        subTitle={`Mã phiếu "${id}" không tồn tại trong hệ thống.`}
        extra={
          <Button type="primary" onClick={() => navigate('/inbound')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }

  const stepCurrent = getStepIndex(order.status);
  const statusCfg = inboundStatusConfig[order.status];

  // ─── Lines summary ────────────────────────────────────────
  const linesSummary = useMemo(() => {
    const totalExpected = order.lines.reduce((sum, l) => sum + l.expectedQty, 0);
    const totalReceived = order.lines.reduce((sum, l) => sum + l.receivedQty, 0);
    const totalLineValue = order.lines.reduce((sum, l) => sum + l.expectedQty * l.unitCost, 0);
    return { totalExpected, totalReceived, totalLineValue };
  }, [order]);

  // ─── Lines table columns ──────────────────────────────────
  const lineColumns: ColumnsType<InboundOrderLine> = [
    {
      title: 'Mã VT',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 140,
      render: (code: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 13, color: '#1B3A5C', fontWeight: 500 }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (name: string) => (
        <Text style={{ fontWeight: 500, fontSize: 13 }}>{name}</Text>
      ),
    },
    {
      title: 'SL dự kiến',
      dataIndex: 'expectedQty',
      key: 'expectedQty',
      width: 100,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontSize: 13 }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'SL đã nhận',
      dataIndex: 'receivedQty',
      key: 'receivedQty',
      width: 100,
      align: 'right',
      render: (val: number, record: InboundOrderLine) => {
        const isShort = val < record.expectedQty;
        return (
          <Text
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: val === 0 ? '#999' : isShort ? '#faad14' : '#52c41a',
            }}
          >
            {formatNumber(val)}
          </Text>
        );
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      render: (unit: string) => <Text style={{ fontSize: 13 }}>{unit}</Text>,
    },
    {
      title: 'Lo',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 150,
      render: (lot: string) =>
        lot ? (
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#666' }}>{lot}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Serial',
      dataIndex: 'serialNumbers',
      key: 'serialNumbers',
      width: 160,
      render: (serials: string[] | undefined) =>
        serials && serials.length > 0 ? (
          <Space size={2} wrap>
            {serials.slice(0, 2).map((s) => (
              <Tag key={s} style={{ fontSize: 11, borderRadius: 4, fontFamily: 'monospace' }}>
                {s}
              </Tag>
            ))}
            {serials.length > 2 && (
              <Tag style={{ fontSize: 11, borderRadius: 4 }}>+{serials.length - 2}</Tag>
            )}
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Hạn SD',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (date: string) =>
        date ? (
          <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (val: number) => (
        <Text style={{ fontSize: 13, fontWeight: 500 }}>{formatNumber(val)}</Text>
      ),
    },
    {
      title: 'QC',
      dataIndex: 'qcPassed',
      key: 'qcPassed',
      width: 100,
      align: 'center',
      render: (passed: boolean | undefined) => {
        if (passed === true) {
          return <Tag color="success" style={{ borderRadius: 4, fontSize: 12 }}>Đạt</Tag>;
        }
        if (passed === false) {
          return <Tag color="error" style={{ borderRadius: 4, fontSize: 12 }}>Không đạt</Tag>;
        }
        return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 180,
      ellipsis: true,
      render: (note: string) =>
        note ? (
          <Text style={{ fontSize: 12, color: '#666' }}>{note}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
  ];

  // ─── Action buttons based on status ───────────────────────
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    if (order.status === 'waiting') {
      actions.push(
        <Button
          key="confirm-receive"
          type="primary"
          icon={<InboxOutlined />}
          style={{
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Xác nhận nhận hàng
        </Button>
      );
    }

    if (order.status === 'receiving') {
      actions.push(
        <Button
          key="send-qc"
          type="primary"
          icon={<SafetyCertificateOutlined />}
          style={{
            background: 'linear-gradient(135deg, #d48806, #faad14)',
            borderColor: '#faad14',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Chuyển QC
        </Button>
      );
    }

    if (order.status === 'quality_check') {
      actions.push(
        <Button
          key="complete"
          type="primary"
          icon={<CheckCircleOutlined />}
          style={{
            background: 'linear-gradient(135deg, #237804, #52c41a)',
            borderColor: '#52c41a',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Hoàn thành nhập kho
        </Button>
      );
    }

    if (order.status === 'draft') {
      actions.push(
        <Button
          key="submit"
          type="primary"
          icon={<FileTextOutlined />}
          style={{
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Gửi phiếu nhập
        </Button>
      );
    }

    return actions;
  };

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Header Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inbound')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }} />
              <Space align="center" size={12}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImportOutlined style={{ color: '#fff', fontSize: 20 }} />
                </div>
                <div>
                  <Space align="center" size={8}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{order.code}</Title>
                    <Tag color={statusCfg.color} style={{ borderRadius: 4, fontSize: 13, padding: '2px 10px' }}>{statusCfg.label}</Tag>
                    <Tag
                      color={
                        order.type === 'purchase' ? '#1B3A5C' :
                        order.type === 'production' ? '#531dab' :
                        order.type === 'transfer_in' ? '#08979c' : '#d48806'
                      }
                      style={{ borderRadius: 4, fontSize: 12 }}
                    >
                      {inboundTypeLabels[order.type]}
                    </Tag>
                  </Space>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {order.note || `Kho nhận: ${order.warehouseName}`}
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space size={8}>
              {renderActions()}
            </Space>
          </Col>
        </Row>
      </div>

      {/* ─── Order info Card ─────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 16,
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <SectionHeader
          gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
          icon={<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />}
          title="Thông tin phiếu nhập"
        />
        {/* Order info grid */}
        <Row gutter={[24, 12]}>
          <Col xs={24} sm={12} md={8}>
            <Descriptions
              column={1}
              size="small"
              labelStyle={{ color: '#666', fontSize: 13, width: 120 }}
              contentStyle={{ fontSize: 13, fontWeight: 500 }}
            >
              <Descriptions.Item
                label={<Space size={4}><EnvironmentOutlined style={{ color: '#1B3A5C' }} />Kho nhận</Space>}
              >
                {order.warehouseName}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Space size={4}><InboxOutlined style={{ color: '#1B3A5C' }} />Nguồn</Space>}
              >
                {order.sourceName}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Space size={4}><LinkOutlined style={{ color: '#1B3A5C' }} />Mã tham chiếu</Space>}
              >
                {order.referenceCode || '--'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Descriptions
              column={1}
              size="small"
              labelStyle={{ color: '#666', fontSize: 13, width: 120 }}
              contentStyle={{ fontSize: 13, fontWeight: 500 }}
            >
              <Descriptions.Item
                label={<Space size={4}><CalendarOutlined style={{ color: '#1B3A5C' }} />Ngày dự kiến</Space>}
              >
                {formatDate(order.expectedDate)}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Space size={4}><CalendarOutlined style={{ color: '#52c41a' }} />Ngày nhận</Space>}
              >
                {order.receivedDate ? formatDate(order.receivedDate) : '--'}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Space size={4}><UserOutlined style={{ color: '#1B3A5C' }} />Người nhận</Space>}
              >
                {order.receivedBy || '--'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Descriptions
              column={1}
              size="small"
              labelStyle={{ color: '#666', fontSize: 13, width: 120 }}
              contentStyle={{ fontSize: 13, fontWeight: 500 }}
            >
              <Descriptions.Item
                label={<Space size={4}><SafetyCertificateOutlined style={{ color: '#faad14' }} />QC</Space>}
              >
                {order.qcRequired ? (
                  order.qcStatus ? (
                    <Tag
                      color={qcStatusMap[order.qcStatus]?.color || 'default'}
                      style={{ borderRadius: 4, fontSize: 12 }}
                    >
                      {qcStatusMap[order.qcStatus]?.label || order.qcStatus}
                    </Tag>
                  ) : (
                    <Text style={{ fontSize: 13 }}>Yêu cầu QC</Text>
                  )
                ) : (
                  <Text type="secondary" style={{ fontSize: 13 }}>Không yêu cầu</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Space size={4}><UserOutlined style={{ color: '#D4A843' }} />Người tạo</Space>}
              >
                {order.createdBy}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Space size={4}><ClockCircleOutlined style={{ color: '#999' }} />Ngày tạo</Space>}
              >
                {formatDateTime(order.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* ─── Steps (Inbound Flow) ────────────────────────────── */}
      {order.status !== 'cancelled' && (
        <Card
          style={{
            borderRadius: 14,
            border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            marginBottom: 16,
          }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <SectionHeader
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
            icon={<ClockCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
            title="Tiến trình nhập kho"
          />
          <Steps
            current={stepCurrent}
            size="small"
            items={[
              {
                title: 'Tạo phiếu',
                icon: <FileTextOutlined />,
              },
              {
                title: 'Chờ nhận',
                icon: <ClockCircleOutlined />,
              },
              {
                title: 'Đang nhận',
                icon: <InboxOutlined />,
              },
              {
                title: 'Kiểm tra CL',
                icon: <ExperimentOutlined />,
              },
              {
                title: 'Hoàn thành',
                icon: <CheckCircleOutlined />,
              },
            ]}
          />
        </Card>
      )}

      {order.status === 'cancelled' && (
        <Card
          style={{
            borderRadius: 14,
            border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            marginBottom: 16,
            borderLeft: '4px solid #ff4d4f',
          }}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <Text strong style={{ color: '#ff4d4f', fontSize: 14 }}>
            Phiếu nhập đã bị hủy
          </Text>
        </Card>
      )}

      {/* ─── Lines Table ─────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 16,
        }}
        styles={{ body: { padding: '20px 24px 0' } }}
      >
        <Space align="center" size={10} style={{ marginBottom: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InboxOutlined style={{ color: '#fff', fontSize: 13 }} />
          </div>
          <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Chi tiết vật tư</Text>
          <Tag style={{ borderRadius: 4, fontSize: 11 }}>{order.lines.length} dòng</Tag>
        </Space>
        <Table
          columns={lineColumns}
          dataSource={order.lines}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1400 }}
          size="middle"
          style={{ padding: '0 4px' }}
        />

        {/* ─── Summary row ─────────────────────────────────────── */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #f0f0f0',
            background: '#f5f7fa',
          }}
        >
          <Row gutter={[32, 8]}>
            <Col>
              <Statistic
                title={<Text style={{ fontSize: 12, color: '#666' }}>Tổng mặt hàng</Text>}
                value={order.lines.length}
                suffix="dòng"
                valueStyle={{ fontSize: 18, fontWeight: 700, color: '#1B3A5C' }}
              />
            </Col>
            <Col>
              <Statistic
                title={<Text style={{ fontSize: 12, color: '#666' }}>SL dự kiến</Text>}
                value={linesSummary.totalExpected}
                valueStyle={{ fontSize: 18, fontWeight: 700, color: '#1B3A5C' }}
              />
            </Col>
            <Col>
              <Statistic
                title={<Text style={{ fontSize: 12, color: '#666' }}>SL đã nhận</Text>}
                value={linesSummary.totalReceived}
                valueStyle={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: linesSummary.totalReceived >= linesSummary.totalExpected ? '#52c41a' : '#faad14',
                }}
              />
            </Col>
            <Col>
              <Statistic
                title={<Text style={{ fontSize: 12, color: '#666' }}>Tổng giá trị</Text>}
                value={formatValue(linesSummary.totalLineValue)}
                valueStyle={{ fontSize: 18, fontWeight: 700, color: '#1B3A5C' }}
              />
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default InboundDetail;
