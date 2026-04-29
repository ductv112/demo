import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Steps, Empty, Modal, message,
} from 'antd';
import {
  ArrowLeftOutlined, InboxOutlined, CheckCircleOutlined,
  FileSearchOutlined, LockOutlined, LinkOutlined,
} from '@ant-design/icons';
import type { ProductionCompletion, CompletionStatus } from '../../types';
import { completionStatusConfig, formatDate, formatNumber } from '../../utils/format';

const { Title, Text } = Typography;

// --- Inline mock data — khớp với Completion list page ---
const completions: ProductionCompletion[] = [
  {
    id: 'CMP-001', orderId: 'LSX-2026-0060', orderCode: 'LSX-2026-0060',
    productName: 'Module nguồn AC/DC Alpha-18',
    completedQty: 5, passedQty: 5, defectQty: 0,
    status: 'closed', inspectedBy: 'Nguyễn Văn Thành',
    inspectedAt: '2026-04-10', warehouseReceiptCode: 'PNK-2026-0201',
    warehouseLocation: 'Kho phụ tùng KT - Kệ A3', completedAt: '2026-04-09',
  },
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

const stepIndexMap: Record<CompletionStatus, number> = {
  pending_inspection: 1,
  inspected: 2,
  warehouse_received: 3,
  closed: 4,
};

const CompletionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = useMemo(() => completions.find((c) => c.id === id), [id]);

  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/completion')}>Quay lại</Button>
        <Empty description="Không tìm thấy phiếu hoàn thành" style={{ marginTop: 64 }} />
      </div>
    );
  }

  const statusCfg = completionStatusConfig[record.status];
  const currentStep = stepIndexMap[record.status];

  const handleWorkflow = (action: string) => {
    const labels: Record<string, string> = {
      inspect: 'Xác nhận kiểm tra',
      create_receipt: 'Tạo phiếu nhập kho',
      close: 'Đóng phiếu hoàn thành',
    };
    Modal.confirm({
      title: labels[action] || action,
      content: `Bạn có chắc chắn muốn ${(labels[action] || action).toLowerCase()}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => message.success(`Đã ${(labels[action] || action).toLowerCase()} thành công!`),
    });
  };

  return (
    <div style={{ padding: 16 }}>
      {/* ========== 1. HEADER CARD ========== */}
      <Card
        style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Navy gradient banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button
              type="text" icon={<ArrowLeftOutlined />}
              style={{ color: '#fff' }}
              onClick={() => navigate('/completion')}
            />
            <InboxOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>Hoàn thành & Nhập kho</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{
                  borderRadius: 4, background: 'rgba(255,255,255,0.15)',
                  color: '#fff', border: 'none', fontFamily: 'monospace',
                }}>
                  {record.orderCode}
                </Tag>
                <Tag style={{
                  borderRadius: 4, background: 'rgba(255,255,255,0.15)',
                  color: '#fff', border: 'none',
                }}>
                  {record.productName}
                </Tag>
              </Space>
            </div>
          </Space>
          <Space>
            <Tag
              color={statusCfg.color}
              style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}
            >
              {statusCfg.label}
            </Tag>
            {record.status === 'pending_inspection' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleWorkflow('inspect')}
              >
                Xác nhận kiểm tra
              </Button>
            )}
            {record.status === 'inspected' && (
              <Button
                type="primary"
                icon={<InboxOutlined />}
                style={{ background: '#D4A843', borderColor: '#D4A843' }}
                onClick={() => handleWorkflow('create_receipt')}
              >
                Tạo phiếu nhập kho
              </Button>
            )}
            {record.status === 'warehouse_received' && (
              <>
                <Tag color="#52c41a" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6 }}>
                  <CheckCircleOutlined style={{ marginRight: 4 }} />Sẵn sàng sử dụng
                </Tag>
                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Đóng hồ sơ hoàn thành & Đóng lệnh sản xuất',
                      icon: <LockOutlined style={{ color: '#1B3A5C' }} />,
                      content: (
                        <div>
                          <p>Đóng hồ sơ hoàn thành <strong>{record.productName}</strong> ({record.orderCode}).</p>
                          <p>Sau khi đóng:</p>
                          <ul style={{ paddingLeft: 20, fontSize: 13 }}>
                            <li>Sản phẩm được đánh dấu <strong>sẵn sàng sử dụng</strong> trong kho</li>
                            <li>Lệnh sản xuất liên quan sẽ được <strong>đóng</strong> (không chỉnh sửa được nữa)</li>
                            <li>Dữ liệu sản lượng, vật tư, giờ công được <strong>lưu trữ phục vụ báo cáo</strong></li>
                          </ul>
                        </div>
                      ),
                      okText: 'Đóng hồ sơ',
                      cancelText: 'Hủy',
                      onOk: () => message.success('Đã đóng hồ sơ hoàn thành và đóng lệnh sản xuất'),
                    });
                  }}
                >
                  Đóng hồ sơ
                </Button>
              </>
            )}
            {record.status === 'closed' && (
              <Tag color="#52c41a" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />Sẵn sàng sử dụng
              </Tag>
            )}
          </Space>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 24px' }}>
          <Row gutter={[24, 12]}>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Lệnh sản xuất</Text>
              <br />
              <Button
                type="link" style={{ padding: 0, fontWeight: 600, color: '#1B3A5C' }}
                onClick={() => navigate(`/production-orders/${record.orderId}`)}
              >
                {record.orderCode}
              </Button>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Sản phẩm</Text>
              <br />
              <Text strong>{record.productName}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Số lượng hoàn thành</Text>
              <br />
              <Text strong>{formatNumber(record.completedQty)}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Số lượng đạt</Text>
              <br />
              <Text strong style={{ color: '#52c41a' }}>{formatNumber(record.passedQty)}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Số lượng lỗi</Text>
              <br />
              <Text strong style={{ color: record.defectQty > 0 ? '#ff4d4f' : undefined }}>
                {formatNumber(record.defectQty)}
              </Text>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Người kiểm tra</Text>
              <br />
              <Text strong>{record.inspectedBy || '—'}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Ngày kiểm tra</Text>
              <br />
              <Text>{record.inspectedAt ? formatDate(record.inspectedAt) : '—'}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Phiếu nhập kho</Text>
              <br />
              <Text strong style={{ color: '#1B3A5C' }}>
                {record.warehouseReceiptCode || '—'}
              </Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Vị trí kho</Text>
              <br />
              <Text>{record.warehouseLocation || '—'}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Ngày hoàn thành</Text>
              <br />
              <Text>{formatDate(record.completedAt)}</Text>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ========== 2. WORKFLOW STEPS ========== */}
      <Card
        title={
          <Space>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            }}>
              <FileSearchOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 15 }}>Quy trình xử lý</Text>
          </Space>
        }
        style={{ borderRadius: 14, marginBottom: 16 }}
      >
        <Steps
          current={currentStep}
          items={[
            { title: 'Hoàn thành SX' },
            { title: 'Chờ kiểm tra' },
            { title: 'Chờ nhập kho' },
            { title: 'Đã nhập kho' },
            { title: 'Đóng' },
          ]}
          style={{ padding: '8px 0' }}
        />
      </Card>

      {/* ========== 3. LIÊN KẾT ========== */}
      <Card
        title={
          <Space>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #D4A843, #f0d890)',
            }}>
              <LinkOutlined style={{ color: '#1B3A5C', fontSize: 16 }} />
            </div>
            <Text strong style={{ color: '#1B3A5C', fontSize: 15 }}>Liên kết</Text>
          </Space>
        }
        style={{ borderRadius: 14 }}
      >
        <Button
          type="primary"
          ghost
          icon={<FileSearchOutlined />}
          onClick={() => navigate(`/production-orders/${record.orderId}`)}
        >
          Xem lệnh sản xuất ({record.orderCode})
        </Button>
      </Card>
    </div>
  );
};

export default CompletionDetail;
