import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Space, Typography, Row, Col, Input, Select, Button, Dropdown, message, Modal,
  Drawer, Form,
} from 'antd';
import {
  CheckCircleOutlined, InboxOutlined, BarChartOutlined, SearchOutlined,
  MoreOutlined, EyeOutlined, ExclamationCircleOutlined, RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ProductionCompletion, CompletionStatus } from '../../types';
import { completionStatusConfig, formatDate, formatNumber } from '../../utils/format';

const { Text, Title } = Typography;

// --- Mock data — chỉ gồm lệnh SX đã hoàn thành (status=completed/closed) ---
// Trạng thái đầu tiên khi lệnh SX hoàn thành → "Chờ kiểm tra" (pending_inspection)
// Luồng: Chờ kiểm tra → Chờ nhập kho → Đã nhập kho → Đóng
const completions: ProductionCompletion[] = [
  // LSX-2026-0060: Bộ nguồn AC/DC — đã completed, đã nhập kho xong
  {
    id: 'CMP-001', orderId: 'LSX-2026-0060', orderCode: 'LSX-2026-0060',
    productName: 'Module nguồn AC/DC Alpha-18',
    completedQty: 5, passedQty: 5, defectQty: 0,
    status: 'closed', inspectedBy: 'Nguyễn Văn Thành',
    inspectedAt: '2026-04-10', warehouseReceiptCode: 'PNK-2026-0201',
    warehouseLocation: 'Kho phụ tùng KT - Kệ A3', completedAt: '2026-04-09',
  },
  // Giả lập thêm từ KH Q1 (đã completed) — để demo các trạng thái khác
  {
    id: 'CMP-010', orderId: 'LSX-Q1-001', orderCode: 'LSX-2026-0035',
    productName: 'Module xử lý tín hiệu 36D6 (Q1)',
    completedQty: 10, passedQty: 10, defectQty: 0,
    status: 'warehouse_received', inspectedBy: 'Nguyễn Văn Thành',
    inspectedAt: '2026-03-20', warehouseReceiptCode: 'PNK-2026-0180',
    warehouseLocation: 'Kho linh kiện ĐT - Kệ B2', completedAt: '2026-03-18',
  },
  {
    id: 'CMP-011', orderId: 'LSX-Q1-002', orderCode: 'LSX-2026-0038',
    productName: 'Module thu phát Alpha-18 (Q1)',
    completedQty: 5, passedQty: 5, defectQty: 0,
    status: 'warehouse_received', inspectedBy: 'Nguyễn Văn Thành',
    inspectedAt: '2026-03-25', warehouseReceiptCode: 'PNK-2026-0185',
    warehouseLocation: 'Kho phụ tùng KT - Kệ A1', completedAt: '2026-03-22',
  },
  {
    id: 'CMP-012', orderId: 'LSX-Q1-003', orderCode: 'LSX-2026-0040',
    productName: 'Cụm Gateway Alpha-18 (Q1)',
    completedQty: 2, passedQty: 2, defectQty: 0,
    status: 'inspected', inspectedBy: 'Nguyễn Văn Thành',
    inspectedAt: '2026-03-28', completedAt: '2026-03-26',
  },
  {
    id: 'CMP-013', orderId: 'LSX-Q1-004', orderCode: 'LSX-2026-0041',
    productName: 'Module nguồn AC/DC Alpha-18 (Q1)',
    completedQty: 3, passedQty: 2, defectQty: 1,
    status: 'pending_inspection', completedAt: '2026-03-30',
  },
];

const CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<CompletionStatus | undefined>(undefined);

  const filteredData = useMemo(() => {
    return completions.filter((c) => {
      const matchSearch = !searchText ||
        c.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        c.productName.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [searchText, filterStatus]);

  const stats = {
    pending: completions.filter(c => c.status === 'pending_inspection').length,
    inspected: completions.filter(c => c.status === 'inspected').length,
    received: completions.filter(c => c.status === 'warehouse_received').length,
    totalQty: completions.reduce((s, c) => s + c.completedQty, 0),
  };

  // Drawer workflow state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAction, setDrawerAction] = useState<'inspect' | 'receive' | null>(null);
  const [drawerRecord, setDrawerRecord] = useState<ProductionCompletion | null>(null);
  const [form] = Form.useForm();

  const handleWorkflow = (record: ProductionCompletion, action: string) => {
    if (action === 'close') {
      Modal.confirm({
        title: 'Đóng hồ sơ',
        icon: <ExclamationCircleOutlined />,
        content: `Đóng hồ sơ hoàn thành "${record.productName}" (${record.orderCode})? Sau khi đóng sẽ không thể chỉnh sửa.`,
        okText: 'Đóng hồ sơ',
        cancelText: 'Hủy',
        onOk: () => message.success('Đã đóng hồ sơ'),
      });
    } else {
      setDrawerRecord(record);
      setDrawerAction(action as 'inspect' | 'receive');
      form.resetFields();
      setDrawerOpen(true);
    }
  };

  const handleDrawerSubmit = () => {
    form.validateFields().then((values) => {
      const actionLabel = drawerAction === 'inspect' ? 'Xác nhận kiểm tra' : 'Nhập kho';
      message.success(`${actionLabel} thành công cho ${drawerRecord?.productName}`);
      setDrawerOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<ProductionCompletion> = [
    {
      title: 'Lệnh sản xuất', dataIndex: 'orderCode', key: 'orderCode', width: 160,
      render: (v: string) => <Text strong style={{ color: '#1B3A5C', fontFamily: 'monospace' }}>{v}</Text>,
    },
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', width: 250 },
    {
      title: 'Số lượng hoàn thành', dataIndex: 'completedQty', key: 'completedQty', width: 130, align: 'right',
      render: (v: number) => <Text strong>{formatNumber(v)}</Text>,
    },
    {
      title: 'Số lượng đạt', dataIndex: 'passedQty', key: 'passedQty', width: 110, align: 'right',
      render: (v: number) => <Text style={{ color: '#52c41a', fontWeight: 600 }}>{formatNumber(v)}</Text>,
    },
    {
      title: 'Số lượng lỗi', dataIndex: 'defectQty', key: 'defectQty', width: 100, align: 'right',
      render: (v: number) => (
        <Text style={{ color: v > 0 ? '#ff4d4f' : undefined, fontWeight: v > 0 ? 600 : 400 }}>
          {formatNumber(v)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: CompletionStatus) => {
        const cfg = completionStatusConfig[s];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Phiếu nhập kho', dataIndex: 'warehouseReceiptCode', key: 'warehouseReceiptCode', width: 150,
      render: (v?: string) => v ? <Text style={{ color: '#1B3A5C', fontFamily: 'monospace' }}>{v}</Text> : <Text type="secondary">--</Text>,
    },
    {
      title: 'Ngày hoàn thành', dataIndex: 'completedAt', key: 'completedAt', width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Thao tác', key: 'actions', width: 70, align: 'center',
      render: (_: unknown, record: ProductionCompletion) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(record.status === 'pending_inspection' ? [{ key: 'inspect', icon: <CheckCircleOutlined />, label: 'Xác nhận kiểm tra' }] : []),
              ...(record.status === 'inspected' ? [{ key: 'receive', icon: <InboxOutlined />, label: 'Nhập kho' }] : []),
              ...(record.status === 'warehouse_received' ? [{ key: 'close', icon: <CheckCircleOutlined />, label: 'Đóng' }] : []),
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/completion/${record.id}`);
              else handleWorkflow(record, key);
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
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <InboxOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Hoàn thành & Nhập kho</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Ghi nhận hoàn thành sản phẩm, nhập kho và cập nhật trạng thái</Text>
          </div>
        </Space>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Chờ kiểm tra', value: stats.pending, icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #faad14, #ffc53d)' },
          { label: 'Chờ nhập kho', value: stats.inspected, icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)' },
          { label: 'Đã nhập kho', value: stats.received, icon: <InboxOutlined />, gradient: 'linear-gradient(135deg, #52c41a, #73d13d)' },
          { label: 'Tổng sản lượng', value: stats.totalQty, icon: <BarChartOutlined />, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
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

      {/* Filter */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8}>
            <Input placeholder="Tìm kiếm theo mã lệnh, sản phẩm..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }} />
          </Col>
          <Col xs={12} sm={5}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus}
              allowClear style={{ width: '100%' }}
              options={Object.entries(completionStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col xs={12} sm={11} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredData.length}/{completions.length} kết quả</Text>
              <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); }}>Xóa bộ lọc</Button>
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
              <InboxOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Danh sách hoàn thành sản phẩm</Title>
          </Space>
        </div>
        <Table<ProductionCompletion>
          columns={columns} dataSource={filteredData} rowKey="id" size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} bản ghi` }}
        />
      </Card>

      {/* Drawer: Xác nhận kiểm tra / Nhập kho */}
      {drawerRecord && (
        <Drawer
          title={null}
          placement="right"
          width={drawerAction === 'receive' ? 680 : 500}
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); form.resetFields(); }}
          styles={{ header: { display: 'none' }, body: { padding: 0 } }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
              <Button type="primary" style={{ background: '#1B3A5C' }} onClick={handleDrawerSubmit}>
                {drawerAction === 'inspect' ? 'Xác nhận kiểm tra' : 'Xác nhận nhập kho'}
              </Button>
            </div>
          }
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
            padding: '20px 24px', color: '#fff',
          }}>
            <Space align="center" size={12}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {drawerAction === 'inspect' ? <CheckCircleOutlined style={{ color: '#fff', fontSize: 18 }} /> : <InboxOutlined style={{ color: '#fff', fontSize: 18 }} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {drawerAction === 'inspect' ? 'Xác nhận kiểm tra chất lượng' : 'Tạo phiếu nhập kho'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {drawerRecord.orderCode} — {drawerRecord.productName}
                </div>
              </div>
            </Space>
          </div>

          <div style={{ padding: 20 }}>
            {/* Thông tin sản phẩm */}
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 20, border: '1px solid #e8e8e8' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Số lượng hoàn thành</Text>
                  <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 16 }}>{drawerRecord.completedQty}</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Số lượng đạt</Text>
                  <div style={{ fontWeight: 700, color: '#52c41a', fontSize: 16 }}>{drawerRecord.passedQty}</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Số lượng lỗi</Text>
                  <div style={{ fontWeight: 700, color: drawerRecord.defectQty > 0 ? '#ff4d4f' : '#8c8c8c', fontSize: 16 }}>{drawerRecord.defectQty}</div>
                </Col>
              </Row>
            </div>

            <Form form={form} layout="vertical" requiredMark="optional">
              {drawerAction === 'inspect' && (
                <>
                  <Form.Item label="Người kiểm tra" name="inspectedBy" rules={[{ required: true, message: 'Nhập người kiểm tra' }]}>
                    <Input placeholder="VD: Nguyễn Văn Thành" />
                  </Form.Item>
                  <Form.Item label="Số lượng đạt kiểm tra" name="passedQty" rules={[{ required: true, message: 'Nhập số lượng đạt' }]}
                    initialValue={drawerRecord.completedQty}>
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item label="Số lượng lỗi" name="defectQty" initialValue={0}>
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item label="Kết quả kiểm tra" name="qualityResult">
                    <Input.TextArea rows={2} placeholder="VD: Đạt toàn bộ chỉ tiêu kỹ thuật theo TCKD" />
                  </Form.Item>
                </>
              )}

              {drawerAction === 'receive' && (
                <>
                  {/* Thông tin phiếu */}
                  <Text strong style={{ fontSize: 13, color: '#1B3A5C', display: 'block', marginBottom: 8 }}>Thông tin phiếu nhập kho</Text>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Mã phiếu nhập kho" name="warehouseReceiptCode" rules={[{ required: true, message: 'Nhập mã phiếu' }]}>
                        <Input placeholder="VD: PNK-2026-0201" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Ngày nhập kho" name="receiveDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Người nhận kho" name="receivedBy" rules={[{ required: true, message: 'Nhập tên' }]}>
                    <Input placeholder="VD: Nguyễn Văn Hùng" />
                  </Form.Item>

                  {/* Danh sách sản phẩm nhập kho */}
                  <Text strong style={{ fontSize: 13, color: '#1B3A5C', display: 'block', marginBottom: 8, marginTop: 8 }}>Danh sách sản phẩm nhập kho</Text>
                  <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f5f7fa' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: '#1B3A5C', fontWeight: 600 }}>Sản phẩm</th>
                          <th style={{ padding: '8px 12px', textAlign: 'center', width: 80 }}>Số lượng đạt</th>
                          <th style={{ padding: '8px 12px', textAlign: 'center', width: 100 }}>Số lượng nhập</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', width: 160 }}>Kho đích</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', width: 130 }}>Vị trí kệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <Text strong style={{ fontSize: 12 }}>{drawerRecord.productName}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>{drawerRecord.orderCode}</Text>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#52c41a' }}>
                            {drawerRecord.passedQty}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <Form.Item name="receiveQty" initialValue={drawerRecord.passedQty} style={{ margin: 0 }}>
                              <Input type="number" style={{ width: 70, textAlign: 'center' }} />
                            </Form.Item>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <Form.Item name="warehouseName" rules={[{ required: true, message: 'Chọn kho' }]} style={{ margin: 0 }}>
                              <Select size="small" placeholder="Chọn kho" style={{ width: '100%' }} options={[
                                { value: 'kho-phuktung', label: 'Kho phụ tùng KT' },
                                { value: 'kho-linhkien', label: 'Kho linh kiện ĐT' },
                                { value: 'kho-btp', label: 'Kho bán thành phẩm' },
                                { value: 'kho-thanhpham', label: 'Kho thành phẩm' },
                              ]} />
                            </Form.Item>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <Form.Item name="warehouseLocation" rules={[{ required: true, message: 'Nhập vị trí' }]} style={{ margin: 0 }}>
                              <Input size="small" placeholder="VD: Kệ A3" />
                            </Form.Item>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Form.Item label="Ghi chú phiếu nhập kho" name="note">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm về tình trạng hàng hóa, điều kiện bảo quản..." />
                  </Form.Item>
                </>
              )}
            </Form>
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default CompletionPage;
