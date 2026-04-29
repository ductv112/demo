import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Button, Space, Row, Col,
  Typography, Result, Alert, App, Descriptions,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, InboxOutlined,
  SendOutlined, UserOutlined, CalendarOutlined,
  EnvironmentOutlined, LinkOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { replenishments as replenishmentsData } from '../../data/replenishments';
import type { Replenishment, ReplenishmentLine, ReplenishmentAction } from '../../types';
import {
  replenishmentStatusConfig,
  formatNumber,
  formatDate,
} from '../../utils/format';

const { Title, Text } = Typography;

// ─── Purpose labels ────────────────────────────────────────
const purposeLabels: Record<string, string> = {
  issue: 'Cấp phát vật tư',
  production: 'Sản xuất nội bộ',
  repair: 'Sửa chữa khẩn cấp',
  internal: 'Sử dụng nội bộ',
};

// ─── Action labels ─────────────────────────────────────────
const actionLabels: Record<ReplenishmentAction, { label: string; color: string }> = {
  purchase: { label: 'Mua sắm', color: '#1B3A5C' },
  produce: { label: 'Sản xuất', color: '#531dab' },
  transfer: { label: 'Điều chuyển', color: '#08979c' },
};

// ─── Source labels ─────────────────────────────────────────
const sourceLabels: Record<string, string> = {
  demand: 'Nhu cầu phát sinh',
  forecast: 'Dự báo',
  min_stock: 'Mức tối thiểu',
  manual: 'Thủ công',
};

// ─── Section header component ──────────────────────────────
const SectionHeader = ({ gradient, icon, title }: { gradient: string; icon: React.ReactNode; title: string }) => (
  <Space align="center" size={10} style={{ marginBottom: 16 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{title}</Text>
  </Space>
);

// ─── Inner component (needs App.useApp) ───────────────────
const ReplenishmentDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  // Local state to reflect status changes without Redux
  const record = replenishmentsData.find((r) => r.id === id || r.code === id);
  const [localStatus, setLocalStatus] = useState<Replenishment['status'] | null>(
    record ? record.status : null
  );

  if (!record) {
    return (
      <Result
        status="404"
        title="Không tìm thấy yêu cầu bổ sung"
        subTitle={`Mã "${id}" không tồn tại trong hệ thống.`}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }

  const currentStatus = localStatus ?? record.status;
  const statusCfg = replenishmentStatusConfig[currentStatus];

  // ─── Stats from lines ──────────────────────────────────
  const totalLines = record.lines.length;
  const needReplenishment = record.lines.filter((l) => l.currentStock <= l.minStock).length;
  const sufficientStock = totalLines - needReplenishment;
  const purchaseCount = record.lines.filter((l) => l.action === 'purchase').length;
  const produceCount = record.lines.filter((l) => l.action === 'produce').length;
  const transferCount = record.lines.filter((l) => l.action === 'transfer').length;

  // ─── Handle submit request ─────────────────────────────
  const handleSubmitRequest = () => {
    modal.confirm({
      title: 'Nộp yêu cầu bổ sung',
      icon: <SendOutlined />,
      content: `Nộp yêu cầu ${record.code}? Hệ thống sẽ tự động kiểm tra tồn kho và xử lý.`,
      okText: 'Nộp yêu cầu',
      cancelText: 'Hủy',
      okButtonProps: { style: { background: '#1B3A5C' } },
      onOk: () => {
        // Mutate source array so list page reflects change too
        const idx = replenishmentsData.findIndex((r) => r.id === record.id);
        if (idx !== -1) replenishmentsData[idx].status = 'in_progress';
        setLocalStatus('in_progress');
        message.success(`Đã nộp ${record.code} — hệ thống đang xử lý`);
      },
    });
  };

  // ─── Lines table columns ───────────────────────────────
  const lineColumns: ColumnsType<ReplenishmentLine> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_: unknown, __: ReplenishmentLine, index: number) => (
        <Text style={{ fontSize: 13, color: '#666' }}>{index + 1}</Text>
      ),
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 140,
      render: (code: string) => (
        <Tag style={{ fontFamily: 'monospace', fontSize: 12, borderRadius: 4, color: '#1B3A5C', borderColor: '#1B3A5C' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (name: string) => <Text style={{ fontWeight: 500, fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'SL đề xuất',
      dataIndex: 'suggestedQty',
      key: 'suggestedQty',
      width: 100,
      align: 'right',
      render: (val: number, line: ReplenishmentLine) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{formatNumber(val)} {line.unit}</Text>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 90,
      align: 'right',
      render: (val: number, line: ReplenishmentLine) => (
        <Text style={{ fontSize: 13, fontWeight: 600, color: val <= line.minStock ? '#ff4d4f' : '#52c41a' }}>
          {formatNumber(val)}
        </Text>
      ),
    },
    {
      title: 'Mức tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 100,
      align: 'right',
      render: (val: number) => <Text style={{ fontSize: 13 }}>{formatNumber(val)}</Text>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: ReplenishmentAction) => {
        const cfg = actionLabels[action];
        return <Tag color={cfg.color} style={{ borderRadius: 4, fontSize: 12 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày cần',
      dataIndex: 'neededByDate',
      key: 'neededByDate',
      width: 110,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{date ? formatDate(date) : '--'}</Text>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* ─── Header Banner ────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(27,58,92,0.2)',
      }}>
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={12} align="center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8 }}
              />
              <Space align="center" size={12}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileTextOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <Space align="center" size={8}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{record.code}</Title>
                    <Tag color={statusCfg.color} style={{ borderRadius: 4, fontSize: 13, padding: '2px 10px' }}>
                      {statusCfg.label}
                    </Tag>
                  </Space>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {record.warehouseName} — {formatDate(record.createdAt)}
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        {/* ─── Left column ─────────────────────────────────── */}
        <Col xs={24} lg={16}>
          {/* Card 1: Thông tin yêu cầu */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
              icon={<FileTextOutlined style={{ color: '#fff', fontSize: 13 }} />}
              title="Thông tin yêu cầu"
            />
            <Row gutter={[24, 12]}>
              <Col xs={24} sm={12}>
                <Descriptions column={1} size="small"
                  labelStyle={{ color: '#666', fontSize: 13, width: 130 }}
                  contentStyle={{ fontSize: 13, fontWeight: 500 }}
                >
                  <Descriptions.Item label={<Space size={4}><FileTextOutlined style={{ color: '#1B3A5C' }} />Mã yêu cầu</Space>}>
                    <Text style={{ fontFamily: 'monospace', color: '#1B3A5C', fontWeight: 600 }}>{record.code}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Space size={4}><EnvironmentOutlined style={{ color: '#1B3A5C' }} />Kho</Space>}>
                    {record.warehouseName}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Space size={4}><CalendarOutlined style={{ color: '#1B3A5C' }} />Ngày tạo</Space>}>
                    {formatDate(record.createdAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions column={1} size="small"
                  labelStyle={{ color: '#666', fontSize: 13, width: 130 }}
                  contentStyle={{ fontSize: 13, fontWeight: 500 }}
                >
                  {record.source === 'demand' && (
                    <>
                      <Descriptions.Item label={<Space size={4}><UserOutlined style={{ color: '#1B3A5C' }} />Đơn vị yêu cầu</Space>}>
                        <Text style={{ fontWeight: 600, color: '#1B3A5C' }}>{record.requestedUnit || '--'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Space size={4}><AppstoreOutlined style={{ color: '#531dab' }} />Mục đích</Space>}>
                        {record.purpose ? purposeLabels[record.purpose] : '--'}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Space size={4}><LinkOutlined style={{ color: '#531dab' }} />Mã tham chiếu</Space>}>
                        <Text style={{ fontFamily: 'monospace', color: '#531dab', fontWeight: 600 }}>{record.demandRef || '--'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Space size={4}><UserOutlined style={{ color: '#D4A843' }} />Người tạo</Space>}>
                        {record.requestedBy || '--'}
                      </Descriptions.Item>
                    </>
                  )}
                  {record.note && (
                    <Descriptions.Item label="Ghi chú">
                      <Text style={{ fontSize: 13, color: '#555' }}>{record.note}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
            </Row>
          </Card>

          {/* Card 2: Danh sách vật tư */}
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '20px 24px 0' } }}
          >
            <Space align="center" size={10} style={{ marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InboxOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Danh sách vật tư</Text>
              <Tag color="blue" style={{ borderRadius: 4, fontSize: 11 }}>{record.lines.length} loại</Tag>
            </Space>
            <Table
              columns={lineColumns}
              dataSource={record.lines}
              rowKey="id"
              pagination={false}
              scroll={{ x: 900 }}
              size="middle"
              bordered
              style={{ marginBottom: 0 }}
            />
          </Card>
        </Col>

        {/* ─── Right column ─────────────────────────────────── */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <SectionHeader
              gradient="linear-gradient(135deg, #D4A843, #f0d890)"
              icon={<AppstoreOutlined style={{ color: '#1B3A5C', fontSize: 13 }} />}
              title="Trạng thái & Xử lý"
            />

            {/* Status */}
            <div style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Trạng thái hiện tại</Text>
              <Tag color={statusCfg.color} style={{ borderRadius: 6, fontSize: 14, padding: '4px 14px', fontWeight: 600 }}>
                {statusCfg.label}
              </Tag>
            </div>

            {/* Source */}
            <div style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Nguồn yêu cầu</Text>
              <Text style={{ fontWeight: 600, fontSize: 14, color: '#1B3A5C' }}>
                {sourceLabels[record.source] || record.source}
              </Text>
            </div>

            {/* Stats */}
            <div style={{ background: '#f5f7fa', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13, display: 'block', marginBottom: 12 }}>
                Thống kê vật tư
              </Text>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#1B3A5C' }}>{totalLines}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>Số loại vật tư</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#ff4d4f' }}>{needReplenishment}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>Cần bổ sung</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#52c41a' }}>{sufficientStock}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>Đủ tồn</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#531dab' }}>{record.totalItems}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>Tổng mặt hàng</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Action breakdown */}
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13, display: 'block', marginBottom: 10 }}>
                Phân loại xử lý
              </Text>
              <Space direction="vertical" style={{ width: '100%' }} size={6}>
                {purchaseCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f0f4fa', borderRadius: 8, border: '1px solid #dde6f5' }}>
                    <Text style={{ fontSize: 13, color: '#1B3A5C' }}>Mua sắm</Text>
                    <Tag color="#1B3A5C" style={{ borderRadius: 4, margin: 0, fontSize: 12 }}>{purchaseCount} loại</Tag>
                  </div>
                )}
                {produceCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f9f0ff', borderRadius: 8, border: '1px solid #e9d8fd' }}>
                    <Text style={{ fontSize: 13, color: '#531dab' }}>Sản xuất</Text>
                    <Tag color="#531dab" style={{ borderRadius: 4, margin: 0, fontSize: 12 }}>{produceCount} loại</Tag>
                  </div>
                )}
                {transferCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#e6fffb', borderRadius: 8, border: '1px solid #b5f5ec' }}>
                    <Text style={{ fontSize: 13, color: '#08979c' }}>Điều chuyển</Text>
                    <Tag color="#08979c" style={{ borderRadius: 4, margin: 0, fontSize: 12 }}>{transferCount} loại</Tag>
                  </div>
                )}
              </Space>
            </div>

            {/* Status-based action */}
            {currentStatus === 'draft' && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                block
                onClick={handleSubmitRequest}
                style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, fontWeight: 600, fontSize: 14 }}
              >
                Nộp yêu cầu
              </Button>
            )}
            {currentStatus === 'in_progress' && (
              <Alert
                message="Đang xử lý"
                description="Hệ thống đang kiểm tra tồn kho và định tuyến xử lý yêu cầu."
                type="info"
                showIcon
                style={{ borderRadius: 8, fontSize: 13 }}
              />
            )}
            {currentStatus === 'done' && (
              <Alert
                message="Hoàn thành"
                description="Yêu cầu bổ sung đã được xử lý hoàn tất."
                type="success"
                showIcon
                style={{ borderRadius: 8, fontSize: 13 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ─── Wrap with App for modal/message context ──────────────
const ReplenishmentDetail: React.FC = () => (
  <App>
    <ReplenishmentDetailInner />
  </App>
);

export default ReplenishmentDetail;
