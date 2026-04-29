import React, { useMemo } from 'react';
import {
  Card, Typography, Tag, Table, Space, Row, Col, Button, Steps, Descriptions, Divider, Alert, App,
} from 'antd';
import {
  ArrowLeftOutlined, ExportOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SendOutlined, FileTextOutlined, InboxOutlined, GiftOutlined,
  PrinterOutlined, EditOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getOutboundById } from '../../data/outboundOrders';
import { departments } from '../../data/departments';
import { products } from '../../data/products';
import type { OutboundOrderLine, OutboundStatus, OutboundType } from '../../types';
import {
  outboundStatusConfig,
  formatDate,
  formatDateTime,
  formatNumber,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

// ─── Label mappings ──────────────────────────────────────────
const outboundTypeLabels: Record<OutboundType, string> = {
  dispatch: 'Cấp phát',
  production: 'Sản xuất',
  transfer_out: 'Điều chuyển',
  scrap: 'Thanh lý',
};

const strategyLabels: Record<string, { label: string; color: string }> = {
  fifo: { label: 'FIFO - Nhập trước xuất trước', color: 'blue' },
  fefo: { label: 'FEFO - Hết hạn trước xuất trước', color: 'orange' },
  nearest: { label: 'Gần nhất - Vị trí gần nhất', color: 'cyan' },
};

// ─── Step mapping by status ──────────────────────────────────
const statusToStep: Record<OutboundStatus, number> = {
  draft: 0,
  submitted: 1,
  approved: 2,
  picking: 3,
  packing: 4,
  done: 5,
  cancelled: -1,
};

// ─── Format value ────────────────────────────────────────────
const formatValue = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${formatNumber(value / 1_000)} N`;
  return formatNumber(value);
};

const formatUnitCost = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${formatNumber(value / 1_000)} N`;
  return formatNumber(value);
};

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const OutboundDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { modal, message } = App.useApp();

  const order = useMemo(() => {
    if (!id) return undefined;
    return getOutboundById(id);
  }, [id]);

  if (!order) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Title level={4} style={{ color: colors.navy }}>Không tìm thấy phiếu xuất kho</Title>
        <Button type="primary" onClick={() => navigate('/outbound')}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const statusCfg = outboundStatusConfig[order.status];
  const currentStep = statusToStep[order.status];
  const isCancelled = order.status === 'cancelled';

  const getDepartmentName = (deptId?: string): string => {
    if (!deptId) return '-';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? `${dept.name} (${dept.shortName})` : deptId;
  };

  // ─── Summary calculations ─────────────────────────────────
  const totalRequested = order.lines.reduce((s, l) => s + l.requestedQty, 0);
  const totalPicked = order.lines.reduce((s, l) => s + l.pickedQty, 0);
  const totalLineValue = order.lines.reduce((s, l) => s + l.requestedQty * l.unitCost, 0);

  // ─── Critical part detection ──────────────────────────────
  const criticalLines = order.lines.filter(l => {
    const p = products.find(p => p.id === l.productId);
    return p?.criticalPart === true;
  });
  const hasCriticalParts = criticalLines.length > 0;

  const handleConfirmDispatch = () => {
    if (hasCriticalParts) {
      modal.confirm({
        title: (
          <Space>
            <WarningOutlined style={{ color: '#ff4d4f' }} />
            <span>Xác nhận xuất kho linh kiện quan trọng</span>
          </Space>
        ),
        content: (
          <div>
            <Alert
              type="error"
              showIcon
              message={`Phiếu xuất này chứa ${criticalLines.length} linh kiện quan trọng (Critical Part)`}
              description="Linh kiện quan trọng ảnh hưởng trực tiếp đến khả năng vận hành và an toàn vận hành thiết bị."
              style={{ marginBottom: 12, borderRadius: 8, fontSize: 12 }}
            />
            <div style={{ marginBottom: 10, fontSize: 13 }}>
              <strong>Danh sách linh kiện quan trọng:</strong>
            </div>
            {criticalLines.map(l => (
              <div key={l.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', borderRadius: 6, background: '#fff2f0',
                border: '1px solid #ffccc7', marginBottom: 6, fontSize: 12,
              }}>
                <Space>
                  <Tag color="error" style={{ fontFamily: 'monospace', fontSize: 11 }}>{l.productCode}</Tag>
                  <span>{l.productName}</span>
                </Space>
                <strong style={{ color: '#ff4d4f' }}>{l.requestedQty} {l.unit}</strong>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 12, color: '#595959', background: '#fffbe6', borderRadius: 6, padding: '8px 10px', border: '1px solid #ffe58f' }}>
              Thao tác này yêu cầu xác nhận thêm vì sẽ ảnh hưởng đến mức tồn kho linh kiện quan trọng.
            </div>
          </div>
        ),
        okText: 'Xác nhận xuất kho',
        okButtonProps: { danger: true, style: { fontWeight: 600 } },
        cancelText: 'Kiểm tra lại',
        width: 520,
        onOk: () => {
          message.success('Đã xác nhận xuất kho thành công');
        },
      });
    } else {
      modal.confirm({
        title: 'Xác nhận xuất kho',
        content: 'Bạn có chắc chắn muốn xác nhận xuất kho phiếu này?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: () => {
          message.success('Đã xác nhận xuất kho thành công');
        },
      });
    }
  };

  // ─── Picking list columns ─────────────────────────────────
  const pickingColumns: ColumnsType<OutboundOrderLine> = [
    {
      title: 'Mã VT',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 140,
      render: (code: string) => (
        <Text strong style={{ color: colors.navy, fontFamily: 'monospace', fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (name: string, record: OutboundOrderLine) => {
        const p = products.find(p => p.id === record.productId);
        return (
          <Space size={6}>
            <Text style={{ fontSize: 13 }}>{name}</Text>
            {p?.criticalPart && (
              <Tag color="error" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                <WarningOutlined style={{ marginRight: 2 }} />Quan trọng
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'SL yêu cầu',
      dataIndex: 'requestedQty',
      key: 'requestedQty',
      width: 100,
      align: 'center',
      render: (qty: number) => <Text strong>{formatNumber(qty)}</Text>,
    },
    {
      title: 'SL đã lấy',
      dataIndex: 'pickedQty',
      key: 'pickedQty',
      width: 100,
      align: 'center',
      render: (qty: number, record: OutboundOrderLine) => {
        const isComplete = qty >= record.requestedQty;
        const isPartial = qty > 0 && qty < record.requestedQty;
        return (
          <Text
            strong
            style={{
              color: isComplete ? colors.success : isPartial ? colors.warning : colors.danger,
            }}
          >
            {formatNumber(qty)}
          </Text>
        );
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      align: 'center',
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: 100,
      render: (code?: string) =>
        code ? (
          <Tag color="blue" style={{ borderRadius: 4, fontFamily: 'monospace' }}>{code}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Lo',
      key: 'lot',
      width: 150,
      render: (_: unknown, record: OutboundOrderLine) =>
        record.lotNumber ? (
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{record.lotNumber}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Serial',
      key: 'serial',
      width: 160,
      render: (_: unknown, record: OutboundOrderLine) =>
        record.serialNumbers && record.serialNumbers.length > 0 ? (
          <Space size={4} wrap>
            {record.serialNumbers.map((sn) => (
              <Tag key={sn} style={{ borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>
                {sn}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 110,
      align: 'right',
      render: (val: number) => <Text style={{ fontSize: 13 }}>{formatUnitCost(val)}</Text>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 180,
      ellipsis: true,
      render: (note?: string) =>
        note ? <Text style={{ fontSize: 12 }}>{note}</Text> : <Text type="secondary">-</Text>,
    },
  ];

  // ─── Action buttons based on status ────────────────────────
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    if (order.status === 'draft') {
      actions.push(
        <Button key="edit" icon={<EditOutlined />} style={{ borderRadius: 6 }}>
          Chỉnh sửa
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SendOutlined />}
          style={{
            borderRadius: 6,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          }}
        >
          Gửi phê duyệt
        </Button>,
      );
    }
    if (order.status === 'approved') {
      actions.push(
        <Button
          key="pick"
          type="primary"
          icon={<InboxOutlined />}
          style={{
            borderRadius: 6,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          }}
        >
          Bắt đầu lấy hàng
        </Button>,
      );
    }
    if (order.status === 'picking') {
      actions.push(
        <Button
          key="pack"
          type="primary"
          icon={<GiftOutlined />}
          style={{
            borderRadius: 6,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
          }}
        >
          Chuyển đóng gói
        </Button>,
      );
    }
    if (order.status === 'packing') {
      actions.push(
        <Button
          key="dispatch"
          type="primary"
          icon={hasCriticalParts ? <WarningOutlined /> : <CheckCircleOutlined />}
          onClick={handleConfirmDispatch}
          danger={hasCriticalParts}
          style={hasCriticalParts ? { borderRadius: 6, fontWeight: 600 } : {
            borderRadius: 6,
            background: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
          }}
        >
          {hasCriticalParts ? 'Xác nhận xuất kho (có linh kiện quan trọng)' : 'Xác nhận xuất kho'}
        </Button>,
      );
    }
    actions.push(
      <Button key="print" icon={<PrinterOutlined />} style={{ borderRadius: 6 }}>
        In phiếu
      </Button>,
    );
    return actions;
  };

  return (
    <div>
      {/* ─── Header Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/outbound')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }} />
              <Space align="center" size={12}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExportOutlined style={{ color: '#fff', fontSize: 20 }} />
                </div>
                <div>
                  <Space align="center" size={8}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{order.code}</Title>
                    <Tag color={statusCfg.color} style={{ borderRadius: 4, fontWeight: 600, fontSize: 13 }}>{statusCfg.label}</Tag>
                  </Space>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {outboundTypeLabels[order.type]} - {order.warehouseName}
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
        style={{ borderRadius: 14, border: 'none', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <SectionHeader
          gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`}
          icon={<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />}
          title="Thông tin phiếu xuất"
        />
        <Descriptions
          bordered
          size="small"
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          labelStyle={{
            fontWeight: 600,
            color: colors.navy,
            background: '#f5f7fa',
            width: 160,
          }}
          contentStyle={{ fontSize: 13 }}
        >
          <Descriptions.Item label="Mã phiếu">
            <Text strong style={{ fontFamily: 'monospace' }}>{order.code}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại phiếu">
            <Tag color={colors.navy} style={{ borderRadius: 4 }}>
              {outboundTypeLabels[order.type]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusCfg.color} style={{ borderRadius: 4, fontWeight: 600 }}>
              {statusCfg.label}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kho xuất">{order.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="Nơi nhận">
            <Text strong>{order.destinationName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{order.destinationType}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị nhận">
            {getDepartmentName(order.departmentId)}
          </Descriptions.Item>
          <Descriptions.Item label="Mã tham chiếu">
            {order.referenceCode ? (
              <Text style={{ fontFamily: 'monospace' }}>{order.referenceCode}</Text>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Chiến lược xuất">
            {(() => {
              const scfg = strategyLabels[order.strategy];
              return scfg ? <Tag color={scfg.color} style={{ borderRadius: 4 }}>{scfg.label}</Tag> : order.strategy;
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày yêu cầu">{formatDate(order.requestedDate)}</Descriptions.Item>
          <Descriptions.Item label="Người phê duyệt">
            {order.approvedBy || <Text type="secondary">Chưa phê duyệt</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày phê duyệt">
            {order.approvedAt ? formatDate(order.approvedAt) : <Text type="secondary">-</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Người lấy hàng">
            {order.pickedBy || <Text type="secondary">Chưa chỉ định</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày xuất">
            {order.dispatchedDate ? formatDate(order.dispatchedDate) : <Text type="secondary">-</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">{order.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{formatDateTime(order.createdAt)}</Descriptions.Item>
          {order.note && (
            <Descriptions.Item label="Ghi chú" span={3}>
              <Text style={{ fontStyle: 'italic' }}>{order.note}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* ─── Critical part warning banner ─────────────────── */}
      {hasCriticalParts && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={
            <span style={{ fontWeight: 600 }}>
              Phiếu xuất chứa {criticalLines.length} linh kiện quan trọng (Critical Part)
            </span>
          }
          description={
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <span>Các linh kiện sau yêu cầu xác nhận bổ sung khi xuất kho: </span>
              <Space size={4} wrap style={{ marginTop: 4 }}>
                {criticalLines.map(l => (
                  <Tag key={l.id} color="error" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {l.productCode}
                  </Tag>
                ))}
              </Space>
            </div>
          }
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
      )}

      {/* ─── Progress Steps ───────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <SectionHeader
          gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`}
          icon={<ClockCircleOutlined style={{ color: '#fff', fontSize: 13 }} />}
          title="Tiến trình xử lý"
        />
        <Steps
          current={isCancelled ? undefined : currentStep}
          status={isCancelled ? 'error' : currentStep === 5 ? 'finish' : 'process'}
          items={[
            { title: 'Tạo phiếu', icon: <FileTextOutlined /> },
            { title: 'Gửi duyệt', icon: <SendOutlined /> },
            { title: 'Phê duyệt', icon: <CheckCircleOutlined /> },
            { title: 'Lấy hàng', icon: <InboxOutlined /> },
            { title: 'Đóng gói', icon: <GiftOutlined /> },
            { title: 'Hoàn thành', icon: <CheckCircleOutlined /> },
          ]}
        />
        {isCancelled && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: '#fff2f0',
              borderRadius: 6,
              border: '1px solid #ffccc7',
            }}
          >
            <Text style={{ color: colors.danger, fontWeight: 500 }}>
              Phiếu đã bị hủy
            </Text>
          </div>
        )}
      </Card>

      {/* ─── Picking List ─────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: '20px 24px 0' } }}
      >
        <Space align="center" size={10} style={{ marginBottom: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExportOutlined style={{ color: colors.navyDark, fontSize: 13 }} />
          </div>
          <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Danh sách lấy hàng</Text>
          <Tag style={{ borderRadius: 4 }}>{order.lines.length} mặt hàng</Tag>
        </Space>
        <Table
          dataSource={order.lines}
          columns={pickingColumns}
          rowKey="id"
          size="small"
          scroll={{ x: 1300 }}
          pagination={false}
        />

        {/* ─── Summary Row ──────────────────────────────── */}
        <Divider style={{ margin: '0 0 16px' }} />
        <Row gutter={24} style={{ padding: '0 20px 20px' }}>
          <Col xs={12} sm={8} md={6}>
            <Card
              size="small"
              style={{
                borderRadius: 8,
                background: '#f5f7fa',
                border: `1px solid ${colors.border}`,
              }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>Tổng SL yêu cầu</Text>
              <br />
              <Text strong style={{ fontSize: 20, color: colors.navy }}>
                {formatNumber(totalRequested)}
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card
              size="small"
              style={{
                borderRadius: 8,
                background: totalPicked >= totalRequested ? '#f6ffed' : '#fffbe6',
                border: `1px solid ${totalPicked >= totalRequested ? '#b7eb8f' : '#ffe58f'}`,
              }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>Tổng SL đã lấy</Text>
              <br />
              <Text
                strong
                style={{
                  fontSize: 20,
                  color: totalPicked >= totalRequested ? colors.success : colors.warning,
                }}
              >
                {formatNumber(totalPicked)}
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card
              size="small"
              style={{
                borderRadius: 8,
                background: `linear-gradient(135deg, rgba(27,58,92,0.05), rgba(27,58,92,0.02))`,
                border: `1px solid ${colors.border}`,
              }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>Tổng giá trị</Text>
              <br />
              <Text strong style={{ fontSize: 20, color: colors.navy }}>
                {formatValue(totalLineValue)}
              </Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OutboundDetail;
