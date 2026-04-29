import React, { useState } from 'react';
import {
  Card, Descriptions, Tag, Button, Space, Typography, Row, Col,
  Table, Timeline, Divider, Modal, Select, Form, Input, App,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, BoxPlotOutlined,
  InboxOutlined, CarOutlined, UnlockOutlined, CheckCircleOutlined,
  EnvironmentOutlined, CalendarOutlined, UserOutlined, FileTextOutlined,
  SwapRightOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { PackageItem, PackageStatus, PackageType } from '../../types';
import { packages } from '../../data/packages';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Configs ─────────────────────────────────────────────
const statusConfig: Record<PackageStatus, { label: string; color: string; icon: React.ReactNode }> = {
  in_stock:   { label: 'Trong kho',         color: 'success',    icon: <InboxOutlined />  },
  in_transit: { label: 'Đang vận chuyển',   color: 'blue',       icon: <CarOutlined /> },
  opened:     { label: 'Đã mở',             color: 'warning',    icon: <UnlockOutlined /> },
  dispatched: { label: 'Đã xuất',           color: 'default',    icon: <CheckCircleOutlined /> },
};

const typeLabel: Record<PackageType, string> = {
  thùng: 'Thùng', pallet: 'Pallet', container: 'Container', kiện: 'Kiện', túi: 'Túi',
};

// Status transitions (what's allowed from each state)
const allowedTransitions: Record<PackageStatus, PackageStatus[]> = {
  in_stock:   ['in_transit', 'opened', 'dispatched'],
  in_transit: ['in_stock', 'opened'],
  opened:     ['dispatched'],
  dispatched: [],
};

// ─── Mock status history ─────────────────────────────────
const mockHistory = (pkg: { status: PackageStatus; createdAt: string; createdBy: string }) => {
  const base = [
    {
      key: 'created',
      time: pkg.createdAt,
      actor: pkg.createdBy,
      action: 'Tạo kiện hàng',
      note: 'Kiện hàng được tạo và ghi nhận vào hệ thống',
    },
  ];
  if (pkg.status === 'in_transit' || pkg.status === 'opened' || pkg.status === 'dispatched') {
    base.push({
      key: 'transit',
      time: new Date(new Date(pkg.createdAt).getTime() + 5 * 24 * 3600000).toISOString(),
      actor: pkg.createdBy,
      action: 'Cập nhật trạng thái → Đang vận chuyển',
      note: 'Kiện hàng bắt đầu vận chuyển',
    });
  }
  if (pkg.status === 'opened') {
    base.push({
      key: 'opened',
      time: new Date(new Date(pkg.createdAt).getTime() + 15 * 24 * 3600000).toISOString(),
      actor: pkg.createdBy,
      action: 'Mở kiện hàng',
      note: 'Kiện hàng được mở để cấp phát từng phần',
    });
  }
  if (pkg.status === 'dispatched') {
    base.push({
      key: 'dispatched',
      time: new Date(new Date(pkg.createdAt).getTime() + 20 * 24 * 3600000).toISOString(),
      actor: pkg.createdBy,
      action: 'Xuất kho hoàn tất',
      note: 'Toàn bộ vật tư trong kiện đã được cấp phát',
    });
  }
  return base;
};

const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 18 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

const PackageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();

  const pkg = packages.find(p => p.id === id);

  const [currentStatus, setCurrentStatus] = useState<PackageStatus>(pkg?.status ?? 'in_stock');
  const [transitModalOpen, setTransitModalOpen] = useState(false);

  if (!pkg) {
    return (
      <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
        <Text type="secondary">Không tìm thấy kiện hàng.</Text>
        <br />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/packages')}>Quay lại danh sách</Button>
      </Card>
    );
  }

  const history = mockHistory({ status: currentStatus, createdAt: pkg.createdAt, createdBy: pkg.createdBy });
  const transitions = allowedTransitions[currentStatus];

  const handleTransition = (values: { newStatus: PackageStatus; note: string }) => {
    const cfg = statusConfig[values.newStatus];
    modal.confirm({
      title: `Chuyển trạng thái → ${cfg.label}`,
      content: `Xác nhận chuyển kiện hàng ${pkg.code} sang trạng thái "${cfg.label}"?`,
      okText: 'Xác nhận',
      cancelText: 'Huỷ',
      onOk: () => {
        setCurrentStatus(values.newStatus);
        setTransitModalOpen(false);
        form.resetFields();
        message.success(`Đã chuyển trạng thái sang "${cfg.label}"`);
      },
    });
  };

  // ── Items table ──────────────────────────────────────────
  const itemColumns: ColumnsType<PackageItem> = [
    {
      title: 'Mã vật tư',
      dataIndex: 'productCode',
      width: 130,
      render: (code: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{code}</Text>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Số lượng',
      key: 'qty',
      width: 120,
      render: (_: unknown, r: PackageItem) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {r.qty.toLocaleString('vi-VN')} {r.unit}
        </Tag>
      ),
    },
  ];

  const statusCfg = statusConfig[currentStatus];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ─── Header Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/packages')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }} />
              <Space align="center" size={12}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BoxPlotOutlined style={{ color: '#fff', fontSize: 20 }} />
                </div>
                <div>
                  <Space align="center" size={8}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{pkg.code}</Title>
                    <Tag color={statusCfg.color} icon={statusCfg.icon}>{statusCfg.label}</Tag>
                    <Tag color="geekblue">{typeLabel[pkg.type]}</Tag>
                  </Space>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {pkg.items.length} loại vật tư · {pkg.items.reduce((s, i) => s + i.qty, 0).toLocaleString('vi-VN')} đơn vị
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space size={8}>
              {transitions.length > 0 && (
                <Button
                  icon={<SwapRightOutlined />}
                  onClick={() => setTransitModalOpen(true)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
                >
                  Chuyển trạng thái
                </Button>
              )}
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/packages/${id}/edit`)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[20, 20]}>
        {/* ── Left: thông tin chính ── */}
        <Col xs={24} lg={16}>
          {/* Thông tin kiện hàng */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Thông tin kiện hàng"
            />
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" labelStyle={{ color: '#666', fontWeight: 500 }}>
              <Descriptions.Item label="Mã kiện hàng">
                <Text strong>{pkg.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại bao bì">
                <Tag color="geekblue">{typeLabel[pkg.type]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg.color} icon={statusCfg.icon}>{statusCfg.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khối lượng">
                {pkg.totalWeight != null ? `${pkg.totalWeight.toLocaleString('vi-VN')} kg` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Kích thước">
                {pkg.dimensions ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Phiếu nhập liên kết">
                {pkg.inboundOrderId ? (
                  <Button type="link" size="small" style={{ padding: 0 }}
                    onClick={() => navigate(`/inbound/${pkg.inboundOrderId}`)}>
                    {pkg.inboundOrderId}
                  </Button>
                ) : '—'}
              </Descriptions.Item>
              {pkg.outboundOrderId && (
                <Descriptions.Item label="Phiếu xuất liên kết">
                  <Button type="link" size="small" style={{ padding: 0 }}
                    onClick={() => navigate(`/outbound/${pkg.outboundOrderId}`)}>
                    {pkg.outboundOrderId}
                  </Button>
                </Descriptions.Item>
              )}
              {pkg.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  <Text type="secondary">{pkg.note}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Vị trí lưu kho */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #237804, #52c41a)"
              icon={<EnvironmentOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Vị trí lưu kho"
            />
            {pkg.warehouseName ? (
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" labelStyle={{ color: '#666', fontWeight: 500 }}>
                <Descriptions.Item label="Kho">
                  <Button type="link" size="small" style={{ padding: 0 }}
                    onClick={() => navigate(`/warehouses/${pkg.warehouseId}`)}>
                    {pkg.warehouseName}
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí">
                  {pkg.locationCode
                    ? <Tag color="cyan" style={{ fontFamily: 'monospace' }}>{pkg.locationCode}</Tag>
                    : <Text type="secondary">Chưa gán vị trí</Text>}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">Chưa gán kho lưu trữ (đang vận chuyển)</Text>
            )}
          </Card>

          {/* Danh sách vật tư */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Space align="center" size={10} style={{ marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1677ff, #40a9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InboxOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Vật tư trong kiện</Text>
              <Tag color="blue">{pkg.items.length} loại</Tag>
            </Space>
            <Table
              columns={itemColumns}
              dataSource={pkg.items}
              rowKey="productId"
              size="small"
              pagination={false}
              onRow={(r) => ({
                onClick: () => navigate(`/products/${r.productId}`),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>

        {/* ── Right: meta + timeline ── */}
        <Col xs={24} lg={8}>
          {/* Thông tin tạo */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #D4A843, #f0d890)"
              icon={<UserOutlined style={{ color: '#0a1628', fontSize: 13 }} />}
              title="Thông tin tạo"
            />
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Người tạo</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)', display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <UserOutlined style={{ color: '#fff', fontSize: 11 }} />
                  </div>
                  <Text strong style={{ fontSize: 13 }}>{pkg.createdBy}</Text>
                </div>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined style={{ marginRight: 4 }} />Ngày tạo</Text>
                <div style={{ marginTop: 2 }}>
                  <Text style={{ fontSize: 13 }}>{new Date(pkg.createdAt).toLocaleDateString('vi-VN')}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined style={{ marginRight: 4 }} />Cập nhật lần cuối</Text>
                <div style={{ marginTop: 2 }}>
                  <Text style={{ fontSize: 13 }}>{new Date(pkg.updatedAt).toLocaleDateString('vi-VN')}</Text>
                </div>
              </div>
            </Space>
          </Card>

          {/* Lịch sử trạng thái */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #595959, #8c8c8c)"
              icon={<CalendarOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Lịch sử trạng thái"
            />
            <Timeline
              items={history.map((h, idx) => ({
                color: idx === history.length - 1 ? '#1B3A5C' : '#bfbfbf',
                children: (
                  <div>
                    <Text strong style={{ fontSize: 12 }}>{h.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{h.note}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(h.time).toLocaleDateString('vi-VN')} · {h.actor}
                    </Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Transition Modal ── */}
      <Modal
        title={<Space><SwapRightOutlined />Chuyển trạng thái kiện hàng</Space>}
        open={transitModalOpen}
        onCancel={() => { setTransitModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Xác nhận"
        cancelText="Huỷ"
        okButtonProps={{ style: { background: '#1B3A5C', borderColor: '#1B3A5C' } }}
      >
        <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Trạng thái hiện tại: </Text>
          <Tag color={statusCfg.color} icon={statusCfg.icon}>{statusCfg.label}</Tag>
        </div>
        <Form form={form} layout="vertical" onFinish={handleTransition}>
          <Form.Item
            label="Chuyển sang trạng thái"
            name="newStatus"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái mới' }]}
          >
            <Select placeholder="Chọn trạng thái mới">
              {transitions.map(s => (
                <Select.Option key={s} value={s}>
                  <Tag color={statusConfig[s].color}>{statusConfig[s].label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Lý do chuyển trạng thái (tuỳ chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PackageDetail;
