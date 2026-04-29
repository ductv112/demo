import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Tag, Button, Typography, Space,
  Empty, Breadcrumb, Steps, Avatar, Timeline, message,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined,
  InboxOutlined, ExportOutlined, ImportOutlined, FileProtectOutlined,
  UndoOutlined, SendOutlined, CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { materialRequests } from '../../data/materialRequests';
import {
  materialRequestStatusConfig, materialRequestTypeConfig, formatDate,
} from '../../utils/format';
import type { MaterialRequest, MaterialRequestLine, MaterialRequestStatus } from '../../types';

const { Title, Text } = Typography;

const statusStepMap: Record<MaterialRequestStatus, number> = {
  draft: 0, submitted: 1, warehouse_processing: 2, issued: 2, received: 3, returning: 4, returned: 4, cancelled: 0,
};

const GradientBadge: React.FC<{ gradient: string; icon: React.ReactNode }> = ({ gradient, icon }) => (
  <div style={{ width: 32, height: 32, borderRadius: 8, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>{icon}</div>
);

const MaterialRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = materialRequests.find(r => r.id === id);

  if (!request) {
    return (
      <div style={{ padding: 40 }}>
        <Empty description="Không tìm thấy yêu cầu vật tư" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/material-requests')}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const statusCfg = materialRequestStatusConfig[request.status];
  const typeCfg = materialRequestTypeConfig[request.type];
  const currentStep = statusStepMap[request.status] ?? 0;

  const totalRequested = request.lines.reduce((s, l) => s + l.requestedQty, 0);
  const totalApproved = request.lines.reduce((s, l) => s + (l.approvedQty ?? 0), 0);
  const totalIssued = request.lines.reduce((s, l) => s + (l.issuedQty ?? 0), 0);
  const totalReceived = request.lines.reduce((s, l) => s + (l.receivedQty ?? 0), 0);
  const totalReturned = request.lines.reduce((s, l) => s + (l.returnedQty ?? 0), 0);
  const hasReturnableItems = request.type === 'issue' && request.lines.some(l => (l.receivedQty ?? 0) > (l.returnedQty ?? 0));

  const handleAction = (action: string) => message.success(`Đã thực hiện: ${action}`);

  // ── Action buttons ──
  const renderActions = () => {
    const actions: React.ReactNode[] = [];
    switch (request.status) {
      case 'draft':
        actions.push(<Button key="send" type="primary" icon={<SendOutlined />} style={{ background: '#1B3A5C' }} onClick={() => handleAction('Gửi yêu cầu')}>Gửi yêu cầu</Button>);
        actions.push(<Button key="cancel" danger icon={<CloseOutlined />} onClick={() => handleAction('Hủy')}>Hủy</Button>);
        break;
      case 'submitted':
        actions.push(<Tag key="tag" color="processing" style={{ fontSize: 13, padding: '4px 12px' }}><ClockCircleOutlined style={{ marginRight: 6 }} />Đang chờ phê duyệt</Tag>);
        break;
      case 'warehouse_processing':
        actions.push(<Tag key="tag" color="warning" style={{ fontSize: 13, padding: '4px 12px' }}><InboxOutlined style={{ marginRight: 6 }} />Kho đang xử lý</Tag>);
        break;
      case 'issued':
        actions.push(<Button key="confirm" type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleAction('Xác nhận đã nhận hàng')}>Xác nhận đã nhận</Button>);
        break;
      case 'received':
        if (hasReturnableItems) actions.push(<Button key="return" icon={<UndoOutlined />} style={{ borderColor: '#D4A843', color: '#D4A843' }} onClick={() => handleAction('Tạo phiếu trả kho')}>Tạo phiếu trả kho</Button>);
        actions.push(<Tag key="tag" color="success" style={{ fontSize: 13, padding: '4px 12px' }}><CheckCircleOutlined style={{ marginRight: 6 }} />Đã nhận hàng</Tag>);
        break;
      case 'returned':
        actions.push(<Tag key="tag" color="success" style={{ fontSize: 13, padding: '4px 12px' }}><CheckCircleOutlined style={{ marginRight: 6 }} />Đã hoàn thành</Tag>);
        break;
    }
    return actions;
  };

  // ── Line columns ──
  const lineColumns: ColumnsType<MaterialRequestLine> = [
    { title: 'STT', width: 50, align: 'center', render: (_: unknown, __: MaterialRequestLine, i: number) => <Text strong style={{ color: '#1B3A5C' }}>{i + 1}</Text> },
    { title: 'Mã VT', dataIndex: 'partCode', width: 130, render: (c: string) => <Text strong style={{ color: '#1B3A5C' }}>{c}</Text> },
    { title: 'Tên vật tư', dataIndex: 'partName', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Tồn KD', dataIndex: 'qtyAvailable', width: 70, align: 'center', render: (q: number, r: MaterialRequestLine) => <Text style={{ color: q < r.requestedQty ? '#ff4d4f' : undefined, fontWeight: q < r.requestedQty ? 600 : 400 }}>{q}</Text> },
    { title: 'Yêu cầu', dataIndex: 'requestedQty', width: 70, align: 'center', render: (q: number) => <Text strong>{q}</Text> },
    { title: 'Đã duyệt', dataIndex: 'approvedQty', width: 70, align: 'center', render: (q?: number) => q != null ? q : <Text type="secondary">—</Text> },
    { title: 'Đã xuất', dataIndex: 'issuedQty', width: 70, align: 'center', render: (q?: number) => q != null ? q : <Text type="secondary">—</Text> },
    { title: 'Đã nhận', dataIndex: 'receivedQty', width: 70, align: 'center', render: (q?: number) => q != null ? q : <Text type="secondary">—</Text> },
    { title: 'Hoàn trả', dataIndex: 'returnedQty', width: 70, align: 'center', render: (q?: number) => q != null && q > 0 ? <Text style={{ color: '#52c41a', fontWeight: 600 }}>{q}</Text> : <Text type="secondary">—</Text> },
    { title: 'ĐVT', dataIndex: 'unit', width: 50, align: 'center' },
    { title: 'Lô/Serial', key: 'tracking', width: 130, render: (_: unknown, r: MaterialRequestLine) => r.lotNumber ? <Tag style={{ fontSize: 11 }}>{r.lotNumber}</Tag> : r.serialNumber ? <Tag color="cyan" style={{ fontSize: 11 }}>{r.serialNumber}</Tag> : <Text type="secondary">—</Text> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <Breadcrumb items={[
        { title: 'Tổng quan' },
        { title: <a onClick={() => navigate('/material-requests')}>Quản lý vật tư</a> },
        { title: `Chi tiết ${request.code}` },
      ]} style={{ marginBottom: 8 }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GradientBadge gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" icon={<InboxOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Chi tiết yêu cầu vật tư</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{request.code} — {request.equipmentName ?? 'Không gắn thiết bị'}</Text>
          </div>
        </div>
        <Space>
          {renderActions()}
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/material-requests')}>Quay lại</Button>
        </Space>
      </div>

      {/* Card 1: Thông tin yêu cầu */}
      <Card
        title={<Space><GradientBadge gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" icon={<FileProtectOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Thông tin yêu cầu</Text></Space>}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" labelStyle={{ fontWeight: 600, color: '#595959', fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
          <Descriptions.Item label="Mã yêu cầu"><Text strong style={{ color: '#1B3A5C' }}>{request.code}</Text></Descriptions.Item>
          <Descriptions.Item label="Loại"><Tag color={typeCfg.color} icon={request.type === 'issue' ? <ExportOutlined /> : <ImportOutlined />}>{typeCfg.label}</Tag></Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={statusCfg.color}>{statusCfg.label}</Tag></Descriptions.Item>
          {request.poCode && <Descriptions.Item label="Mã WO"><a style={{ color: '#1B3A5C', fontWeight: 600 }} onClick={() => navigate(`/work-orders/${request.poId}`)}>{request.poCode}</a></Descriptions.Item>}
          {request.planCode && <Descriptions.Item label="Mã KH"><Text style={{ color: '#1B3A5C' }}>{request.planCode}</Text></Descriptions.Item>}
          {request.equipmentName && <Descriptions.Item label="Thiết bị"><Text strong>{request.equipmentName}</Text></Descriptions.Item>}
          <Descriptions.Item label={request.type === 'issue' ? 'Kho xuất' : 'Kho nhận'}>{request.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="Đơn vị">{request.departmentName}</Descriptions.Item>
          <Descriptions.Item label="Người yêu cầu"><Space size={6}><Avatar size={20} style={{ background: '#1B3A5C', fontSize: 10 }}>{request.requestedBy.split(' ').pop()?.charAt(0)}</Avatar>{request.requestedBy}</Space></Descriptions.Item>
          <Descriptions.Item label="Ngày yêu cầu"><ClockCircleOutlined style={{ marginRight: 4 }} />{formatDate(request.requestedDate)}</Descriptions.Item>
          {request.approvedBy && <Descriptions.Item label="Người duyệt"><Space size={6}><Avatar size={20} style={{ background: '#52c41a', fontSize: 10 }}>{request.approvedBy.split(' ').pop()?.charAt(0)}</Avatar>{request.approvedBy}</Space>{request.approvedDate && <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>({formatDate(request.approvedDate)})</Text>}</Descriptions.Item>}
          {request.notes && <Descriptions.Item label="Ghi chú" span={3}><Text style={{ fontStyle: 'italic' }}>{request.notes}</Text></Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* Card 2: Danh sách vật tư */}
      <Card
        title={<Space><GradientBadge gradient="linear-gradient(135deg, #722ed1, #b37feb)" icon={<InboxOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Danh sách vật tư</Text><Tag color="processing">{request.lines.length} dòng</Tag></Space>}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}>
        <Table<MaterialRequestLine> columns={lineColumns} dataSource={request.lines} rowKey="id" pagination={false} size="middle" scroll={{ x: 950 }}
          footer={() => (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
              <div><Text type="secondary">Yêu cầu: </Text><Text strong style={{ color: '#1B3A5C' }}>{totalRequested}</Text></div>
              {totalApproved > 0 && <div><Text type="secondary">Đã duyệt: </Text><Text strong>{totalApproved}</Text></div>}
              {totalIssued > 0 && <div><Text type="secondary">Đã xuất: </Text><Text strong>{totalIssued}</Text></div>}
              {totalReceived > 0 && <div><Text type="secondary">Đã nhận: </Text><Text strong>{totalReceived}</Text></div>}
              {totalReturned > 0 && <div><Text type="secondary">Hoàn trả: </Text><Text strong style={{ color: '#52c41a' }}>{totalReturned}</Text></div>}
            </div>
          )} />
      </Card>

      {/* Card 3: Luồng xử lý + Liên kết Kho */}
      <Card
        title={<Space><GradientBadge gradient="linear-gradient(135deg, #D4A843, #f0d890)" icon={<ClockCircleOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Luồng xử lý</Text></Space>}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
        <Steps
          size="small"
          current={currentStep}
          items={[
            { title: 'Tạo yêu cầu', description: currentStep > 0 ? `${formatDate(request.createdAt)}` : 'Đang soạn' },
            { title: 'Phê duyệt', description: currentStep > 1 ? (request.approvedBy ? `${request.approvedBy}` : 'Đã duyệt') : currentStep === 1 ? 'Đang chờ' : 'Chờ' },
            { title: 'Kho xuất', description: currentStep > 2 ? (request.outboundOrderCode ? `${request.outboundOrderCode}` : 'Đã xuất') : currentStep === 2 ? (request.status === 'issued' ? 'Đã xuất' : 'Đang xử lý') : 'Chờ' },
            { title: 'Nhận hàng', description: currentStep > 3 ? (request.receivedBy ? `${request.receivedBy}` : 'Đã nhận') : currentStep === 3 ? 'Đang nhận' : 'Chờ' },
            ...(request.type === 'issue' ? [{ title: 'Trả kho', description: request.status === 'returned' ? (request.inboundOrderCode || 'Đã trả') : currentStep >= 3 ? 'Trả dư (nếu có)' : 'Chờ' }] : []),
          ]}
        />
      </Card>

      {/* Card 4: Liên kết Kho (nếu có) */}
      {(request.outboundOrderCode || request.inboundOrderCode) && (
        <Card
          title={<Space><GradientBadge gradient="linear-gradient(135deg, #0891b2, #06b6d4)" icon={<ExportOutlined />} /><Text strong style={{ color: '#1B3A5C' }}>Liên kết hệ thống Kho</Text></Space>}
          style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <Timeline items={[
            ...(request.outboundOrderCode ? [{
              color: '#faad14' as const, dot: <ExportOutlined style={{ fontSize: 14 }} />,
              children: <div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Text strong>Phiếu xuất kho:</Text><Tag color="processing">{request.outboundOrderCode}</Tag></div><Text type="secondary" style={{ fontSize: 12 }}>Liên kết phiếu xuất trong hệ thống Quản lý Kho (pkkq-kho)</Text></div>,
            }] : []),
            ...(request.inboundOrderCode ? [{
              color: '#52c41a' as const, dot: <ImportOutlined style={{ fontSize: 14 }} />,
              children: <div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Text strong>Phiếu nhập trả:</Text><Tag color="success">{request.inboundOrderCode}</Tag></div><Text type="secondary" style={{ fontSize: 12 }}>Liên kết phiếu nhập trả trong hệ thống Quản lý Kho (pkkq-kho)</Text></div>,
            }] : []),
          ]} />
        </Card>
      )}
    </div>
  );
};

export default MaterialRequestDetail;
