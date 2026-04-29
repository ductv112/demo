import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Tabs, Table,
  Descriptions, Alert, Steps, Timeline, Divider, Progress,
} from 'antd';
import {
  ArrowLeftOutlined, ShoppingCartOutlined, CheckCircleOutlined,
  ClockCircleOutlined, FireOutlined, ExclamationCircleOutlined,
  FileTextOutlined, AppstoreOutlined, AuditOutlined, SendOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { materialRequests } from '../../data/materialRequests';
import { materialRequestItems } from '../../data/materialRequestItems';
import { overhaulOrders } from '../../data/overhaulOrders';
import {
  materialRequestStatusConfig, materialRequestPriorityConfig,
  materialCategoryConfig, formatDate, formatCurrency,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { MaterialRequestItem } from '../../types';

const { Title, Text } = Typography;

const STEP_COLORS = ['#1B3A5C', '#d97706', '#2e7d32', '#c62828', '#0277bd'];

const StepBadge: React.FC<{ step: number; active?: boolean }> = ({ step, active }) => {
  const baseColor = STEP_COLORS[step - 1] ?? '#888';
  const bg = active ? baseColor : `${baseColor}22`;
  const textColor = active ? '#fff' : baseColor;
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: bg,
      border: `1.5px solid ${baseColor}`, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: textColor, flexShrink: 0,
    }}>
      {step}
    </div>
  );
};

const tabLabel = (step: number, label: string) => (
  <Space size={6}><StepBadge step={step} /><span>{label}</span></Space>
);

const MaterialRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');

  const req = materialRequests.find(r => r.id === id);
  const items = materialRequestItems.filter(i => i.requestId === id);
  const order = overhaulOrders.find(o => req && o.id === req.orderId);

  if (!req) return <div style={{ padding: 24 }}>Không tìm thấy phiếu yêu cầu vật tư.</div>;

  const statusCfg = materialRequestStatusConfig[req.status];
  const priorityCfg = materialRequestPriorityConfig[req.priority];

  const totalRequested = items.reduce((s, i) => s + i.requestedQty, 0);
  const totalApproved = items.reduce((s, i) => s + (i.approvedQty || 0), 0);
  const totalIssued = items.reduce((s, i) => s + (i.issuedQty || 0), 0);
  const totalEstCost = items.reduce((s, i) => s + ((i.unitPrice || 0) * i.requestedQty), 0);
  const mandatoryCount = items.filter(i => i.isMandatoryReplace).length;
  const issuanceRate = totalRequested > 0 ? Math.round((totalIssued / totalRequested) * 100) : 0;

  const flowStep = statusCfg.step;

  // ─── Tab 1: Thông tin phiếu ──────────────────────────────────
  const renderThongTin = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Steps
        current={flowStep - 1}
        size="small"
        style={{ marginBottom: 8 }}
        items={[
          { title: 'Lập phiếu', icon: <FileTextOutlined /> },
          { title: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
          { title: req.status === 'rejected' ? 'Từ chối' : 'Đã duyệt', icon: req.status === 'rejected' ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />, status: req.status === 'rejected' ? 'error' : undefined },
          { title: 'Cấp phát', icon: <AppstoreOutlined /> },
          { title: 'Hoàn thành', icon: <SafetyCertificateOutlined /> },
        ]}
      />

      {req.status === 'rejected' && req.rejectionReason && (
        <Alert type="error" showIcon message="Phiếu bị từ chối" description={req.rejectionReason} style={{ borderRadius: 10 }} />
      )}

      <Descriptions bordered column={2} size="small" labelStyle={{ background: '#eff6ff', fontWeight: 500, width: '28%' }}>
        <Descriptions.Item label="Mã phiếu"><Text strong style={{ color: colors.navy }}>{req.code}</Text></Descriptions.Item>
        <Descriptions.Item label="Lệnh đại tu"><Text strong style={{ color: colors.navy }}>{req.orderCode}</Text></Descriptions.Item>
        <Descriptions.Item label="Thiết bị" span={2}><Text strong>{req.equipmentName}</Text></Descriptions.Item>
        <Descriptions.Item label="Phân xưởng" span={2}>{req.workshopName}</Descriptions.Item>
        <Descriptions.Item label="Người lập phiếu" span={2}>{req.requestedBy}</Descriptions.Item>
        <Descriptions.Item label="Ngày lập phiếu">{formatDate(req.requestDate)}</Descriptions.Item>
        <Descriptions.Item label="Ngày cần có">
          <Text style={{ color: '#d97706', fontWeight: 600 }}>{formatDate(req.requiredDate)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Mức ưu tiên">
          <Tag color={priorityCfg.color} icon={req.priority === 'critical' ? <FireOutlined /> : req.priority === 'urgent' ? <ExclamationCircleOutlined /> : undefined}>
            {priorityCfg.label}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Số mặt hàng"><Text strong style={{ color: colors.navy }}>{req.totalItems} mục</Text></Descriptions.Item>
        <Descriptions.Item label="Chi phí ước tính"><Text strong style={{ color: colors.navy }}>{req.estimatedCost ? formatCurrency(req.estimatedCost) : '—'}</Text></Descriptions.Item>
        {req.notes && <Descriptions.Item label="Ghi chú" span={2}><Text style={{ color: '#d97706' }}>{req.notes}</Text></Descriptions.Item>}
      </Descriptions>

      {order && (
        <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Text strong style={{ color: colors.navy, fontSize: 13 }}>Thông tin lệnh đại tu liên kết</Text>
          <Descriptions column={3} size="small" style={{ marginTop: 10 }} labelStyle={{ color: '#888', fontWeight: 500 }}>
            <Descriptions.Item label="Phạm vi">
              <Tag color={order.overhaulScope === 'full' ? 'blue' : 'cyan'}>{order.overhaulScope === 'full' ? 'Toàn bộ' : 'Một phần'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="KH bắt đầu">{formatDate(order.plannedStartDate)}</Descriptions.Item>
            <Descriptions.Item label="KH kết thúc">{formatDate(order.plannedEndDate)}</Descriptions.Item>
            <Descriptions.Item label="Chiến lược" span={3}><Text style={{ fontSize: 12 }}>{order.strategy?.substring(0, 120)}...</Text></Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );

  // ─── Tab 2: Danh sách vật tư ─────────────────────────────────
  const itemColumns = [
    { title: 'Mã vật tư', dataIndex: 'materialCode', key: 'materialCode', width: 140, render: (v: string) => <Text code style={{ fontSize: 11 }}>{v}</Text> },
    { title: 'Tên vật tư / linh kiện', dataIndex: 'materialName', key: 'materialName', width: 250, render: (v: string, r: MaterialRequestItem) => (
      <div>
        <Text strong style={{ fontSize: 13 }}>{v}</Text>
        {r.isMandatoryReplace && <Tag color="error" style={{ marginLeft: 6, fontSize: 10 }}>Bắt buộc thay</Tag>}
      </div>
    )},
    { title: 'Loại', dataIndex: 'category', key: 'category', width: 150, render: (v: string) => {
      const cfg = materialCategoryConfig[v as keyof typeof materialCategoryConfig];
      return <Tag color={cfg?.color} style={{ fontSize: 11 }}>{cfg?.label}</Tag>;
    }},
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60, render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'SL yêu cầu', dataIndex: 'requestedQty', key: 'requestedQty', width: 90, align: 'right' as const, render: (v: number) => <Text strong>{v}</Text> },
    { title: 'SL duyệt', dataIndex: 'approvedQty', key: 'approvedQty', width: 80, align: 'right' as const, render: (v?: number) => v != null ? <Text style={{ color: '#2e7d32' }}>{v}</Text> : <Text type="secondary">—</Text> },
    { title: 'SL cấp', dataIndex: 'issuedQty', key: 'issuedQty', width: 70, align: 'right' as const, render: (v?: number) => v != null ? <Text style={{ color: '#0277bd' }}>{v}</Text> : <Text type="secondary">—</Text> },
    { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, align: 'right' as const, render: (v?: number) => v != null ? formatCurrency(v) : <Text type="secondary">—</Text> },
    { title: 'Cấu phần liên kết', dataIndex: 'linkedComponentName', key: 'linkedComponentName', width: 200, render: (v?: string) => v ? <Text style={{ fontSize: 12, color: '#666' }}>{v}</Text> : <Text type="secondary">—</Text> },
    { title: 'Lý do yêu cầu', dataIndex: 'reason', key: 'reason', width: 250, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
  ];

  const renderDanhSach = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={[12, 12]}>
        {[
          { label: 'Tổng SL yêu cầu', value: totalRequested, color: colors.navy },
          { label: 'Bắt buộc thay', value: mandatoryCount, color: '#c62828' },
          { label: 'Đã duyệt', value: totalApproved, color: '#2e7d32' },
          { label: 'Đã cấp phát', value: totalIssued, color: '#0277bd' },
        ].map((stat, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stat.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Table
        dataSource={items}
        columns={itemColumns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 1400 }}
        rowClassName={(r: MaterialRequestItem) => r.isMandatoryReplace ? 'ant-table-row-selected' : ''}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row style={{ background: '#eff6ff' }}>
              <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right"><Text strong>{totalRequested}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right"><Text strong style={{ color: '#2e7d32' }}>{totalApproved}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right"><Text strong style={{ color: '#0277bd' }}>{totalIssued}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right"><Text strong style={{ color: colors.navy }}>{totalEstCost > 0 ? formatCurrency(totalEstCost) : '—'}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={8} colSpan={2} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );

  // ─── Tab 3: Phê duyệt ────────────────────────────────────────
  const renderPheDuyet = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {req.status === 'draft' && (
        <Alert type="info" showIcon message="Phiếu chưa gửi duyệt" description="Nhấn 'Gửi phê duyệt' để chuyển phiếu sang trạng thái chờ duyệt." style={{ borderRadius: 10 }} />
      )}
      {req.status === 'pending_approval' && (
        <Alert type="warning" showIcon message="Đang chờ phê duyệt" description={`Phiếu đã được gửi lên Phòng Kỹ thuật. Ngày yêu cầu có vật tư: ${formatDate(req.requiredDate)}.`} style={{ borderRadius: 10 }} />
      )}
      {req.status === 'rejected' && (
        <Alert type="error" showIcon message="Phiếu bị từ chối" description={req.rejectionReason || 'Không có lý do cụ thể.'} style={{ borderRadius: 10 }} />
      )}
      {['approved', 'partially_issued', 'issued', 'completed'].includes(req.status) && (
        <Alert type="success" showIcon icon={<CheckCircleOutlined />} message="Phiếu đã được phê duyệt" description={`Duyệt bởi ${req.approvedBy} ngày ${req.approvedDate ? formatDate(req.approvedDate) : '—'}.`} style={{ borderRadius: 10 }} />
      )}

      <Timeline
        items={[
          {
            color: colors.navy,
            dot: <FileTextOutlined style={{ fontSize: 14 }} />,
            children: (
              <div>
                <Text strong>Lập phiếu yêu cầu</Text>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {req.requestedBy} · {formatDate(req.requestDate)}
                </div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                  {req.totalItems} mặt hàng · Ước tính {req.estimatedCost ? formatCurrency(req.estimatedCost) : '—'}
                </div>
              </div>
            ),
          },
          {
            color: ['pending_approval', 'approved', 'rejected', 'partially_issued', 'issued', 'completed'].includes(req.status) ? '#d97706' : '#ccc',
            dot: <SendOutlined style={{ fontSize: 14 }} />,
            children: (
              <div>
                <Text strong style={{ color: ['approved', 'rejected'].includes(req.status) ? '#333' : '#999' }}>Gửi phê duyệt</Text>
                {req.status === 'pending_approval' && <Tag color="warning" style={{ marginLeft: 8 }}>Đang chờ</Tag>}
              </div>
            ),
          },
          {
            color: req.approvedDate ? (req.status === 'rejected' ? '#ff4d4f' : '#2e7d32') : '#ccc',
            dot: req.status === 'rejected' ? <ExclamationCircleOutlined style={{ fontSize: 14 }} /> : <CheckCircleOutlined style={{ fontSize: 14 }} />,
            children: (
              <div>
                <Text strong style={{ color: req.approvedDate ? '#333' : '#999' }}>
                  {req.status === 'rejected' ? 'Từ chối' : 'Phê duyệt'}
                </Text>
                {req.approvedBy && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {req.approvedBy} · {req.approvedDate ? formatDate(req.approvedDate) : '—'}
                  </div>
                )}
                {req.rejectionReason && <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>{req.rejectionReason}</div>}
              </div>
            ),
          },
          {
            color: req.issuedDate ? '#0277bd' : '#ccc',
            dot: <AppstoreOutlined style={{ fontSize: 14 }} />,
            children: (
              <div>
                <Text strong style={{ color: req.issuedDate ? '#333' : '#999' }}>Cấp phát vật tư</Text>
                {req.issuedBy && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {req.issuedBy} · {req.issuedDate ? formatDate(req.issuedDate) : '—'}
                  </div>
                )}
              </div>
            ),
          },
          {
            color: req.status === 'completed' ? '#52c41a' : '#ccc',
            dot: <SafetyCertificateOutlined style={{ fontSize: 14 }} />,
            children: (
              <div>
                <Text strong style={{ color: req.status === 'completed' ? '#333' : '#999' }}>Hoàn thành</Text>
                {req.actualCost != null && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    Chi phí thực tế: <Text strong style={{ color: colors.navy }}>{formatCurrency(req.actualCost)}</Text>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );

  // ─── Tab 4: Tình trạng cấp phát ──────────────────────────────
  const renderCapPhat = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {['draft', 'pending_approval', 'rejected'].includes(req.status) ? (
        <Alert type="info" showIcon message="Chưa có thông tin cấp phát" description="Phiếu chưa được duyệt. Thông tin cấp phát sẽ hiển thị sau khi phê duyệt." style={{ borderRadius: 10 }} />
      ) : (
        <>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Tiến độ cấp phát tổng thể</Text>
                <Progress
                  percent={issuanceRate}
                  strokeColor={issuanceRate < 50 ? '#faad14' : issuanceRate < 100 ? '#1890ff' : '#52c41a'}
                  style={{ marginTop: 6 }}
                />
                <Text style={{ fontSize: 12 }}>{totalIssued}/{totalRequested} đơn vị đã cấp phát</Text>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Người cấp phát', value: req.issuedBy || '—' },
                    { label: 'Ngày cấp phát', value: req.issuedDate ? formatDate(req.issuedDate) : '—' },
                    { label: 'Chi phí thực tế', value: req.actualCost ? formatCurrency(req.actualCost) : '—' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                      <Text style={{ fontSize: 12 }}>{item.value}</Text>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>

          <Table
            dataSource={items}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 900 }}
            columns={[
              { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name', width: 260, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
              { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60 },
              { title: 'SL yêu cầu', dataIndex: 'requestedQty', key: 'req', width: 100, align: 'right' as const, render: (v: number) => <Text>{v}</Text> },
              { title: 'SL duyệt', dataIndex: 'approvedQty', key: 'appr', width: 90, align: 'right' as const, render: (v?: number) => v != null ? <Text style={{ color: '#2e7d32' }}>{v}</Text> : <Text type="secondary">—</Text> },
              { title: 'SL cấp', dataIndex: 'issuedQty', key: 'issued', width: 80, align: 'right' as const, render: (v?: number) => v != null ? <Text strong style={{ color: '#0277bd' }}>{v}</Text> : <Text type="secondary">—</Text> },
              {
                title: 'Tình trạng', key: 'status', width: 140,
                render: (_: unknown, r: MaterialRequestItem) => {
                  if (r.issuedQty == null) return <Tag>Chưa cấp</Tag>;
                  if (r.issuedQty === 0) return <Tag color="error">Chưa cấp</Tag>;
                  if (r.issuedQty < r.requestedQty) return <Tag color="warning">Cấp một phần</Tag>;
                  return <Tag color="success">Đã cấp đủ</Tag>;
                },
              },
              {
                title: 'Hoàn thành', key: 'rate', width: 120,
                render: (_: unknown, r: MaterialRequestItem) => {
                  if (r.issuedQty == null || r.requestedQty === 0) return null;
                  const pct = Math.round((r.issuedQty / r.requestedQty) * 100);
                  return <Progress percent={pct} size="small" />;
                },
              },
            ]}
          />

          {req.status === 'partially_issued' && (
            <Alert
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined />}
              message="Cấp phát chưa đầy đủ"
              description={`${items.filter(i => (i.issuedQty || 0) < i.requestedQty).length} mặt hàng chưa được cấp phát đầy đủ. Vui lòng liên hệ kho để xử lý phần còn thiếu.`}
              style={{ borderRadius: 10 }}
            />
          )}
        </>
      )}
    </div>
  );

  // ─── Sidebar ─────────────────────────────────────────────────
  const sidebarSteps = [
    { key: '1', label: 'Thông tin phiếu', icon: <FileTextOutlined /> },
    { key: '2', label: 'Danh sách vật tư', icon: <AppstoreOutlined /> },
    { key: '3', label: 'Phê duyệt', icon: <AuditOutlined /> },
    { key: '4', label: 'Tình trạng cấp phát', icon: <SafetyCertificateOutlined /> },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/material-requests')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div>
                  <Space size={8}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Phiếu yêu cầu vật tư</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)' }}>·</Text>
                    <Text strong style={{ color: '#D4A843', fontSize: 13 }}>{req.code}</Text>
                    <Tag color={statusCfg.color} style={{ marginLeft: 4 }}>{statusCfg.label}</Tag>
                    <Tag color={priorityCfg.color} icon={req.priority === 'critical' ? <FireOutlined /> : req.priority === 'urgent' ? <ExclamationCircleOutlined /> : undefined}>
                      {priorityCfg.label}
                    </Tag>
                  </Space>
                  <div><Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{req.equipmentName}</Title></div>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{req.orderCode}</Text>
                <Tag style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                  {req.totalItems} mặt hàng
                </Tag>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* KPI Row */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Mặt hàng', value: req.totalItems, bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Bắt buộc thay', value: mandatoryCount, bg: 'linear-gradient(135deg, #c62828, #e53935)' },
          { label: 'Ước tính chi phí', value: req.estimatedCost ? formatCurrency(req.estimatedCost) : '—', bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
          { label: 'Tỷ lệ cấp phát', value: `${issuanceRate}%`, bg: 'linear-gradient(135deg, #2e7d32, #388e3c)' },
        ].map((stat, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ background: stat.bg, border: 'none', borderRadius: 12, height: 90 }} bodyStyle={{ padding: '14px 18px' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>{stat.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Left: Tabs */}
        <Col xs={24} lg={17}>
          <Card style={{ borderRadius: 12, padding: 0 }} bodyStyle={{ padding: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="order-detail-tabs"
              tabBarGutter={0}
              indicator={{ size: (origin) => origin - 16 }}
              items={[
                { key: '1', label: tabLabel(1, 'Thông tin'), children: <div style={{ padding: '20px 24px' }}>{renderThongTin()}</div> },
                { key: '2', label: tabLabel(2, 'Danh sách vật tư'), children: <div style={{ padding: '20px 24px' }}>{renderDanhSach()}</div> },
                { key: '3', label: tabLabel(3, 'Phê duyệt'), children: <div style={{ padding: '20px 24px' }}>{renderPheDuyet()}</div> },
                { key: '4', label: tabLabel(4, 'Cấp phát'), children: <div style={{ padding: '20px 24px' }}>{renderCapPhat()}</div> },
              ]}
            />
          </Card>
        </Col>

        {/* Right: Sidebar */}
        <Col xs={24} lg={7}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Step navigator */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Nội dung phiếu</Text>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sidebarSteps.map((s) => {
                  const isActive = s.key === activeTab;
                  const color = STEP_COLORS[Number(s.key) - 1];
                  return (
                    <div key={s.key} onClick={() => setActiveTab(s.key)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 8, cursor: 'pointer',
                      background: isActive ? `${color}15` : 'transparent',
                      border: isActive ? `1px solid ${color}40` : '1px solid transparent',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isActive ? color : '#f0f0f0',
                        border: `1.5px solid ${isActive ? color : '#ddd'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: isActive ? '#fff' : '#aaa',
                      }}>{Number(s.key)}</div>
                      <Text style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? color : '#666' }}>
                        {s.label}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Summary */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tóm tắt phiếu</Text>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Mã phiếu', value: req.code },
                  { label: 'Lệnh đại tu', value: req.orderCode },
                  { label: 'Ngày lập', value: formatDate(req.requestDate) },
                  { label: 'Cần trước', value: formatDate(req.requiredDate) },
                  { label: 'Phân xưởng', value: req.workshopName },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, textAlign: 'right' }}>{item.value}</Text>
                  </div>
                ))}
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ cấp phát</Text>
                  <Text strong style={{ fontSize: 12, color: issuanceRate === 100 ? '#52c41a' : colors.navy }}>{issuanceRate}%</Text>
                </div>
                <Progress percent={issuanceRate} size="small" showInfo={false} strokeColor={issuanceRate === 100 ? '#52c41a' : '#1890ff'} />
              </div>
            </Card>

            {/* Category breakdown */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Phân loại vật tư</Text>}
            >
              {Object.entries(
                items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {} as Record<string, number>)
              ).map(([cat, cnt]) => {
                const cfg = materialCategoryConfig[cat as keyof typeof materialCategoryConfig];
                return (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Tag color={cfg?.color} style={{ fontSize: 11, margin: 0 }}>{cfg?.label}</Tag>
                    <Text strong style={{ fontSize: 13, color: colors.navy }}>{cnt}</Text>
                  </div>
                );
              })}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MaterialRequestDetail;
