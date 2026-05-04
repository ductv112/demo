import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Empty, Table, Modal, message,
  Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined, SwapOutlined, SendOutlined, CheckCircleOutlined,
  CloseCircleOutlined, PlayCircleOutlined, FlagOutlined,
  EditOutlined, ApartmentOutlined, ToolOutlined, DatabaseOutlined,
  BellOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import type { EngineeringChangeRequest, ECRStatus } from '../../types';
import { ecrStatusConfig, ecrTypeConfig, formatDate } from '../../utils/format';
import { productionOrders } from '../../data/productionOrders';

const { Title, Text } = Typography;

// --- Mock data (giống hệt list page EngineeringChange) ---
const ecrList: EngineeringChangeRequest[] = [
  {
    id: 'ECR-001', code: 'YCTD-2026-001',
    title: 'Thay bo mạch xử lý trung tần Alpha-18 sang thế hệ mới',
    type: 'design_change',
    description: 'Thay thế bo mạch xử lý trung tần FPGA Xilinx (BM-XL) bằng bo mạch mới BM-XL-V2 tiêu thụ điện thấp hơn, giảm nhiệt độ vận hành. Tạo BOM version V2.4 kế thừa từ V2.3.',
    reason: 'Bo mạch BM-XL không còn nguồn cung ổn định. Đồng thời hệ thống Alpha-18 gặp lỗi quá nhiệt tại module xử lý khi vận hành liên tục trên 8 giờ.',
    status: 'approved',
    affectedProducts: ['Module thu phát Alpha-18 (BOM-001)'],
    affectedOrders: 2,
    affectedInventory: 4,
    requestedBy: 'Trần Văn Đức',
    requestedAt: '2026-03-01',
    approvedBy: 'Phạm Quốc Hưng',
    approvedAt: '2026-03-15',
    effectiveDate: '2026-07-01',
    newVersion: 'V2.4',
    previousVersion: 'V2.3',
  },
  {
    id: 'ECR-002', code: 'YCTD-2026-002',
    title: 'Thay tụ điện công suất Module nguồn AC/DC Alpha-18',
    type: 'material_change',
    description: 'Thay thế tụ điện công suất 470uF/400V Nichicon (TD-CS) bằng Rubycon YXF series do Nichicon ngừng sản xuất dòng này.',
    reason: 'Nhà cung cấp Nichicon thông báo ngừng cung cấp dòng UHE. Rubycon YXF có thông số tương đương, đã test tương thích.',
    status: 'implementing',
    affectedProducts: ['Module nguồn AC/DC Alpha-18 (BOM-004)'],
    affectedOrders: 1,
    affectedInventory: 6,
    requestedBy: 'Lê Minh Quân',
    requestedAt: '2026-02-10',
    approvedBy: 'Trần Văn Đức',
    approvedAt: '2026-02-20',
    effectiveDate: '2026-03-01',
    newVersion: 'V2.2',
    previousVersion: 'V2.1',
  },
  {
    id: 'ECR-003', code: 'YCTD-2026-003',
    title: 'Thay đổi quy trình hàn SMT bo mạch xử lý 36D6',
    type: 'process_change',
    description: 'Chuyển từ hàn reflow profile đơn sang profile kép cho PCB 6 lớp. Cập nhật routing RT-002 bước 2 (Hàn SMT & gắn IC).',
    reason: 'Tỉ lệ lỗi hàn IC DSP TMS320C6748 đạt 3%, vượt ngưỡng 1.5%. Profile kép giảm stress nhiệt trên IC.',
    status: 'evaluating',
    affectedProducts: ['Module xử lý tín hiệu 36D6 (BOM-003)'],
    affectedOrders: 2,
    affectedInventory: 0,
    requestedBy: 'Lê Minh Quân',
    requestedAt: '2026-03-20',
  },
  {
    id: 'ECR-004', code: 'YCTD-2026-004',
    title: 'Thay đổi thiết kế đầu nối RF Module thu phát Beta-37',
    type: 'design_change',
    description: 'Chuyển từ đầu nối Type-N sang SMA cho RF-P37 để giảm suy hao tại tần số 2.7GHz. Cập nhật BOM-006.',
    reason: 'Đo kiểm phát hiện suy hao RF tại đầu nối Type-N cao hơn dự kiến 0.3dB ở 2.7GHz. SMA cho suy hao thấp hơn.',
    status: 'draft',
    affectedProducts: ['Module thu phát Beta-37 (BOM-006)'],
    affectedOrders: 1,
    affectedInventory: 12,
    requestedBy: 'Nguyễn Hữu Long',
    requestedAt: '2026-04-01',
  },
  {
    id: 'ECR-005', code: 'YCTD-2026-005',
    title: 'Bổ sung cầu chì bảo vệ cho Module nguồn AC/DC Alpha-18',
    type: 'material_change',
    description: 'Thêm 2 cầu chì bảo vệ đầu vào AC cho BOM-004. Cập nhật định mức từ 6 lên 8 cầu chì.',
    reason: 'Phát hiện 1 bộ nguồn bị cháy do quá tải đầu vào không có bảo vệ. Cần thêm cầu chì ở đầu vào AC.',
    status: 'completed',
    affectedProducts: ['Module nguồn AC/DC Alpha-18 (BOM-004)'],
    affectedOrders: 0,
    affectedInventory: 30,
    requestedBy: 'Lê Minh Quân',
    requestedAt: '2025-12-15',
    approvedBy: 'Trần Văn Đức',
    approvedAt: '2025-12-20',
    effectiveDate: '2026-01-01',
    newVersion: 'V2.1',
    previousVersion: 'V2.0',
  },
];

// --- Checklist cập nhật hệ thống ---
interface ChecklistItem {
  key: string;
  task: string;
  description: string;
  checked: boolean;
  note: string;
}

const defaultChecklist: ChecklistItem[] = [
  { key: 'bom', task: 'Cập nhật cấu trúc sản phẩm (BOM)', description: 'Tạo phiên bản BOM mới với thông số thay đổi', checked: false, note: '' },
  { key: 'routing', task: 'Cập nhật quy trình công nghệ (Routing)', description: 'Điều chỉnh các bước công nghệ nếu ảnh hưởng', checked: false, note: '' },
  { key: 'material', task: 'Cập nhật danh mục vật tư (Kho)', description: 'Cập nhật mã vật tư mới vào hệ thống kho', checked: false, note: '' },
  { key: 'deprecate', task: 'Đánh dấu vật tư/version cũ ngừng sử dụng', description: 'Chuyển BOM/vật tư version cũ sang trạng thái ngừng sử dụng', checked: false, note: '' },
  { key: 'notify', task: 'Thông báo trung tâm', description: 'Gửi thông báo đến các trung tâm bị ảnh hưởng', checked: false, note: '' },
];

const EngineeringChangeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ecr = useMemo(() => ecrList.find((e) => e.id === id), [id]);

  // Checklist state for implementing/completed
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (!ecr) return defaultChecklist;
    if (ecr.status === 'completed') {
      return defaultChecklist.map((item) => ({ ...item, checked: true, note: 'Đã hoàn thành' }));
    }
    if (ecr.status === 'implementing') {
      return defaultChecklist.map((item, idx) => ({
        ...item,
        checked: idx < 2,
        note: idx < 2 ? 'Đã cập nhật' : '',
      }));
    }
    return defaultChecklist;
  });

  if (!ecr) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engineering-changes')}>Quay lại</Button>
        <Empty description="Không tìm thấy yêu cầu thay đổi kỹ thuật" style={{ marginTop: 64 }} />
      </div>
    );
  }

  const statusCfg = ecrStatusConfig[ecr.status];
  const typeCfg = ecrTypeConfig[ecr.type];

  const handleWorkflow = (action: string) => {
    if (action === 'approve' || action === 'reject') {
      let approver = '';
      let reviewNote = '';
      Modal.confirm({
        title: action === 'approve' ? 'Phê duyệt yêu cầu thay đổi kỹ thuật' : 'Từ chối yêu cầu thay đổi kỹ thuật',
        icon: action === 'approve' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        width: 480,
        content: (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Người phê duyệt</Text>
              <input
                placeholder="VD: Phạm Quốc Hưng"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13 }}
                onChange={(e) => { approver = e.target.value; }}
              />
            </div>
            <div>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                {action === 'approve' ? 'Ghi chú phê duyệt' : 'Lý do từ chối'}
              </Text>
              <textarea
                rows={3}
                placeholder={action === 'approve' ? 'VD: Đã kiểm tra tương thích, cho phép áp dụng từ tháng 7' : 'VD: Chưa đủ dữ liệu test tương thích'}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13, resize: 'vertical' }}
                onChange={(e) => { reviewNote = e.target.value; }}
              />
            </div>
          </div>
        ),
        okText: action === 'approve' ? 'Phê duyệt' : 'Từ chối',
        okType: action === 'reject' ? 'danger' : 'primary',
        cancelText: 'Hủy',
        onOk: () => {
          console.log({ action, approver, reviewNote });
          message.success(action === 'approve' ? 'Đã phê duyệt yêu cầu thay đổi' : 'Đã từ chối yêu cầu thay đổi');
        },
      });
    } else {
      const labels: Record<string, string> = {
        submit_review: 'Gửi đánh giá yêu cầu thay đổi',
        start_implement: 'Bắt đầu triển khai thay đổi',
        complete: 'Hoàn thành triển khai thay đổi',
      };
      Modal.confirm({
        title: labels[action] || action,
        content: `Bạn có chắc chắn muốn ${(labels[action] || action).toLowerCase()}?`,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: () => message.success(`Đã ${(labels[action] || action).toLowerCase()} thành công!`),
      });
    }
  };

  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist((prev) => prev.map((item) => item.key === key ? { ...item, checked } : item));
  };

  // --- Workflow buttons by status ---
  const renderWorkflowButtons = (status: ECRStatus) => {
    switch (status) {
      case 'draft':
        return (
          <Space>
            <Button icon={<SendOutlined />} onClick={() => handleWorkflow('submit_review')}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
              Gửi đánh giá
            </Button>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/engineering-changes/${ecr.id}/edit`)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
              Chỉnh sửa
            </Button>
          </Space>
        );
      case 'evaluating':
        return (
          <Space>
            <Button icon={<CheckCircleOutlined />} onClick={() => handleWorkflow('approve')}
              style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}>
              Phê duyệt
            </Button>
            <Button icon={<CloseCircleOutlined />} onClick={() => handleWorkflow('reject')}
              style={{ background: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff' }}>
              Từ chối
            </Button>
          </Space>
        );
      case 'approved':
        return (
          <Button icon={<PlayCircleOutlined />} onClick={() => handleWorkflow('start_implement')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
            Bắt đầu triển khai
          </Button>
        );
      case 'implementing':
        return (
          <Button icon={<FlagOutlined />} onClick={() => handleWorkflow('complete')}
            style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}>
            Hoàn thành triển khai
          </Button>
        );
      default:
        return null;
    }
  };

  // Info items
  const infoItems = [
    { label: 'Loại thay đổi', value: <Tag color={typeCfg.color}>{typeCfg.label}</Tag> },
    { label: 'Người yêu cầu', value: ecr.requestedBy },
    { label: 'Ngày yêu cầu', value: formatDate(ecr.requestedAt) },
    { label: 'Phê duyệt bởi', value: ecr.approvedBy || '-' },
    { label: 'Ngày phê duyệt', value: ecr.approvedAt ? formatDate(ecr.approvedAt) : '-' },
    { label: 'Ngày hiệu lực', value: ecr.effectiveDate ? formatDate(ecr.effectiveDate) : '-' },
    { label: 'Version mới', value: ecr.newVersion ? <Tag color="#52c41a">{ecr.newVersion}</Tag> : '-' },
    { label: 'Version cũ', value: ecr.previousVersion ? <Tag>{ecr.previousVersion}</Tag> : '-' },
  ];

  const showChecklist = ecr.status === 'implementing' || ecr.status === 'completed';

  // Checklist table columns
  const checklistColumns = [
    {
      title: 'Hoàn thành',
      dataIndex: 'checked',
      width: 90,
      align: 'center' as const,
      render: (checked: boolean, record: ChecklistItem) => (
        <Checkbox
          checked={checked}
          disabled={ecr.status === 'completed'}
          onChange={(e) => handleChecklistChange(record.key, e.target.checked)}
        />
      ),
    },
    {
      title: 'Hạng mục',
      dataIndex: 'task',
      width: 280,
      render: (task: string) => <Text strong style={{ color: '#1B3A5C' }}>{task}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 150,
      render: (note: string) => note ? <Text type="secondary">{note}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_: unknown, record: ChecklistItem) => {
        const linkMap: Record<string, { label: string; path: string }> = {
          bom: { label: 'Mở BOM', path: '/product-structures' },
          routing: { label: 'Mở Routing', path: '/process-routings' },
          material: { label: 'Mở Kho', path: '/wip-tracking' },
          notify: { label: 'Gửi thông báo', path: '' },
        };
        const link = linkMap[record.key];
        if (!link || !link.path) return record.checked ? <Tag color="success">Đã hoàn thành</Tag> : null;
        return (
          <Button type="link" size="small" style={{ padding: 0, fontSize: 12 }}
            onClick={() => navigate(link.path)}>
            {link.label} →
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* ========== 1. HEADER CARD ========== */}
      <Card
        style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, border: 'none' }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Navy gradient banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(212,168,67,0.06)',
          }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/engineering-changes')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                />
                <SwapOutlined style={{ fontSize: 28, color: '#D4A843' }} />
                <div>
                  <Title level={4} style={{ color: '#fff', margin: 0 }}>{ecr.title}</Title>
                  <Space size={6} style={{ marginTop: 6 }}>
                    <Tag style={{
                      borderRadius: 4, background: 'rgba(255,255,255,0.15)',
                      color: '#fff', border: 'none', fontFamily: 'monospace',
                    }}>
                      {ecr.code}
                    </Tag>
                    <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
                    <Tag color={statusCfg.color} style={{ fontSize: 13, padding: '2px 12px' }}>
                      {statusCfg.label}
                    </Tag>
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              {renderWorkflowButtons(ecr.status)}
            </Col>
          </Row>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 24px' }}>
          <Row gutter={[24, 12]}>
            {infoItems.map((item) => (
              <Col span={6} key={item.label}>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                <br />
                {typeof item.value === 'string' ? <Text strong>{item.value}</Text> : item.value}
              </Col>
            ))}
          </Row>
        </div>

        {/* Description + Reason */}
        <div style={{ padding: '0 24px 20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{
                borderLeft: '3px solid #D4A843', paddingLeft: 12,
                background: 'rgba(212,168,67,0.04)', borderRadius: '0 8px 8px 0', padding: '12px 16px 12px 12px',
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Mô tả chi tiết</Text>
                <Text style={{ fontSize: 13 }}>{ecr.description}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{
                borderLeft: '3px solid #D4A843', paddingLeft: 12,
                background: 'rgba(212,168,67,0.04)', borderRadius: '0 8px 8px 0', padding: '12px 16px 12px 12px',
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Lý do thay đổi</Text>
                <Text style={{ fontSize: 13 }}>{ecr.reason}</Text>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ========== 2. IMPACT ASSESSMENT ========== */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14, marginBottom: 16 }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AppstoreOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Đánh giá ảnh hưởng</Text>
          </Space>
        </div>

        {/* Sản phẩm bị ảnh hưởng */}
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Sản phẩm bị ảnh hưởng</Text>
        <Space size={[6, 6]} wrap style={{ marginBottom: 16 }}>
          {ecr.affectedProducts.map((p, i) => (
            <Tag key={i} color="#1B3A5C" style={{ borderRadius: 4 }}>{p}</Tag>
          ))}
        </Space>

        {/* Lệnh SX ảnh hưởng — chi tiết */}
        {(() => {
          // Tìm lệnh SX liên quan đến sản phẩm bị ảnh hưởng
          const bomIds = ecr.affectedProducts.map(p => {
            const match = p.match(/\(BOM-\d+\)/);
            return match ? match[0].replace(/[()]/g, '') : '';
          }).filter(Boolean);
          const relatedOrders = productionOrders.filter(o =>
            bomIds.includes(o.productId) && o.status !== 'closed' && o.status !== 'cancelled'
          );
          return (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                Lệnh sản xuất bị ảnh hưởng ({relatedOrders.length} lệnh)
              </Text>
              {relatedOrders.length > 0 ? (
                <Table
                  dataSource={relatedOrders}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Mã lệnh', dataIndex: 'code', width: 150,
                      render: (v: string, r) => (
                        <Button type="link" style={{ padding: 0, color: '#1B3A5C', fontFamily: 'monospace', fontWeight: 600 }}
                          onClick={() => navigate(`/production-orders/${r.id}`)}>
                          {v}
                        </Button>
                      ),
                    },
                    { title: 'Sản phẩm', dataIndex: 'productName' },
                    {
                      title: 'Trạng thái', dataIndex: 'status', width: 130,
                      render: (s: string) => {
                        const cfg = { draft: 'Nháp', ready: 'Sẵn sàng', in_progress: 'Đang SX', completed: 'Hoàn thành', pending_material: 'Chờ vật tư', paused: 'Tạm dừng' };
                        return <Tag>{(cfg as Record<string, string>)[s] || s}</Tag>;
                      },
                    },
                    {
                      title: 'Tiến độ', width: 100, align: 'center' as const,
                      render: (_: unknown, r) => <Text>{r.completedQty}/{r.quantity}</Text>,
                    },
                  ]}
                />
              ) : (
                <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>Không có lệnh SX nào đang bị ảnh hưởng</Text>
              )}
            </div>
          );
        })()}

        {/* Tồn kho */}
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e8e8e8' }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tồn kho vật tư ảnh hưởng (ước tính)</Text>
              <Text strong style={{ fontSize: 20, color: '#D4A843' }}>{ecr.affectedInventory}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}> đơn vị cần xử lý</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ========== Phương án thay đổi ========== */}
      {(ecr.status === 'approved' || ecr.status === 'implementing') && ecr.newVersion && (
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <div style={{ marginBottom: 12 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ApartmentOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Phương án thay đổi</Text>
            </Space>
          </div>

          <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', marginBottom: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>Phiên bản hiện tại</Text>
                <div><Tag style={{ fontFamily: 'monospace', fontSize: 13, marginTop: 4 }}>{ecr.previousVersion}</Tag></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>Phiên bản mới</Text>
                <div><Tag color="#52c41a" style={{ fontFamily: 'monospace', fontSize: 13, marginTop: 4 }}>{ecr.newVersion}</Tag></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>Ngày hiệu lực</Text>
                <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>{ecr.effectiveDate ? formatDate(ecr.effectiveDate) : '--'}</div>
              </Col>
            </Row>
          </div>

          <Space>
            <Button type="primary" icon={<ApartmentOutlined />}
              onClick={() => navigate('/product-structures/new')}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}>
              Tạo phiên bản cấu trúc mới ({ecr.newVersion})
            </Button>
            <Button icon={<ToolOutlined />}
              onClick={() => navigate('/process-routings/new')}
              style={{ borderRadius: 8 }}>
              Tạo quy trình công nghệ mới
            </Button>
          </Space>

          {/* Cảnh báo áp dụng */}
          {ecr.effectiveDate && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 8,
              background: '#fffbe6', border: '1px solid #ffe58f',
            }}>
              <Text strong style={{ fontSize: 13, color: '#d48806', display: 'block', marginBottom: 4 }}>
                Nguyên tắc áp dụng
              </Text>
              <Text style={{ fontSize: 12 }}>
                Từ ngày <Text strong>{formatDate(ecr.effectiveDate)}</Text>, tất cả lệnh sản xuất mới cho sản phẩm liên quan
                phải sử dụng phiên bản <Tag color="#52c41a" style={{ fontFamily: 'monospace' }}>{ecr.newVersion}</Tag>.
                Lệnh đang thực hiện tiếp tục dùng phiên bản <Tag style={{ fontFamily: 'monospace' }}>{ecr.previousVersion}</Tag> để tránh thay đổi giữa chừng.
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* ========== 3. CHECKLIST (only implementing/completed) ========== */}
      {showChecklist && (
        <Card
          className="db-chart-card"
          style={{ borderRadius: 14, marginBottom: 16 }}
          styles={{ body: { padding: 20 } }}
        >
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Checklist cập nhật hệ thống</Text>
            </Space>
          </div>

          <Table
            dataSource={checklist}
            columns={checklistColumns}
            rowKey="key"
            pagination={false}
            size="middle"
            style={{ borderRadius: 8, overflow: 'hidden' }}
          />
        </Card>
      )}

      {/* ========== 4. THEO DÕI SAU THAY ĐỔI ========== */}
      {(ecr.status === 'implementing' || ecr.status === 'completed') && (() => {
        const mockNotes = ecr.id === 'ECR-001' ? [
          { id: 1, date: '2026-04-01', author: 'Nguyễn Hữu Long', content: 'Đã sử dụng bo mạch BM-XL-V2 cho 2 bộ mô-đun đầu tiên. Nhiệt độ vận hành giảm từ 72°C xuống 58°C sau 8h liên tục.', type: 'positive' as const },
          { id: 2, date: '2026-04-03', author: 'Lê Minh Quân', content: 'Phát hiện cần điều chỉnh nguồn cấp điện cho bo mạch mới (3.3V thay vì 5V). Đề xuất cập nhật thêm BOM bộ nguồn.', type: 'issue' as const },
        ] : ecr.id === 'ECR-002' ? [
          { id: 1, date: '2026-03-15', author: 'Lê Minh Quân', content: 'Tụ Rubycon YXF hoạt động ổn định sau 500h test. Không phát sinh vấn đề tương thích.', type: 'positive' as const },
        ] : ecr.id === 'ECR-005' ? [
          { id: 1, date: '2026-01-20', author: 'Lê Minh Quân', content: 'Đã bổ sung cầu chì cho toàn bộ bộ nguồn sản xuất từ tháng 1. Không phát sinh sự cố quá tải.', type: 'positive' as const },
        ] : [];

        return (
          <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space align="center" size={8}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FlagOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Theo dõi sau thay đổi</Text>
                <Tag>{mockNotes.length} ghi nhận</Tag>
              </Space>
              <Button size="small" type="primary" style={{ background: '#1B3A5C', borderRadius: 6 }}
                onClick={() => {
                  Modal.confirm({
                    title: 'Thêm ghi nhận theo dõi',
                    width: 500,
                    content: (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ marginBottom: 12 }}>
                          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Loại ghi nhận</Text>
                          <select style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13 }}>
                            <option value="positive">Kết quả tích cực</option>
                            <option value="issue">Vấn đề phát sinh</option>
                            <option value="adjust">Đề xuất điều chỉnh</option>
                          </select>
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nội dung</Text>
                          <textarea rows={3} style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13 }}
                            placeholder="VD: Sau khi thay bo mạch, nhiệt độ vận hành giảm đáng kể..." />
                        </div>
                      </div>
                    ),
                    okText: 'Lưu ghi nhận',
                    cancelText: 'Hủy',
                    onOk: () => message.success('Đã thêm ghi nhận theo dõi'),
                  });
                }}>
                Thêm ghi nhận
              </Button>
            </div>

            {mockNotes.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>Chưa có ghi nhận nào sau thay đổi</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mockNotes.map((note) => (
                  <div key={note.id} style={{
                    padding: '10px 14px', borderRadius: 8,
                    borderLeft: `3px solid ${note.type === 'positive' ? '#52c41a' : note.type === 'issue' ? '#faad14' : '#1890ff'}`,
                    background: note.type === 'positive' ? 'rgba(82,196,26,0.04)' : note.type === 'issue' ? 'rgba(250,173,20,0.04)' : 'rgba(24,144,255,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={8}>
                        <Tag color={note.type === 'positive' ? 'success' : note.type === 'issue' ? 'warning' : 'processing'} style={{ fontSize: 11 }}>
                          {note.type === 'positive' ? 'Kết quả tích cực' : note.type === 'issue' ? 'Vấn đề phát sinh' : 'Đề xuất điều chỉnh'}
                        </Tag>
                        <Text strong style={{ fontSize: 12 }}>{note.author}</Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(note.date)}</Text>
                    </div>
                    <Text style={{ fontSize: 12 }}>{note.content}</Text>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })()}

      {/* ========== 5. LINKS ========== */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14 }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space align="center" size={8}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ApartmentOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Liên kết</Text>
          </Space>
        </div>

        <Space>
          <Button icon={<ApartmentOutlined />} onClick={() => navigate('/product-structures')}
            style={{ borderRadius: 8, borderColor: '#1B3A5C', color: '#1B3A5C' }}>
            Xem cấu trúc sản phẩm
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default EngineeringChangeDetail;
