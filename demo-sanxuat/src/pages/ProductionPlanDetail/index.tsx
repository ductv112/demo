import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Empty,
  Modal, message, Dropdown, Progress,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, ScheduleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  SendOutlined, PlayCircleOutlined, MoreOutlined,
  CarryOutOutlined, SyncOutlined, InboxOutlined, HourglassOutlined, DashboardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { productionPlans, productionOrders } from '../../data/productionOrders';
import type { ProductionOrder } from '../../types';
import {
  planStatusConfig, orderStatusConfig, orderTypeConfig,
  priorityConfig, formatDate,
} from '../../utils/format';

const { Text } = Typography;

const statusIconMap: Record<string, React.ReactNode> = {
  draft:       <FileTextOutlined style={{ color: '#8c8c8c' }} />,
  approved:    <CheckCircleOutlined style={{ color: '#1890ff' }} />,
  in_progress: <SyncOutlined spin style={{ color: '#52c41a' }} />,
  completed:   <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  cancelled:   <ClockCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const ProductionPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = productionPlans.find((p) => p.id === id);

  const relatedOrders = useMemo(() => {
    if (!record) return [];
    return productionOrders.filter((o) => o.planId === record.id);
  }, [record]);

  // Computed stats from actual orders
  const stats = useMemo(() => {
    const total = relatedOrders.length;
    const completed = relatedOrders.filter((o) => o.status === 'completed' || o.status === 'closed').length;
    const inProgress = relatedOrders.filter((o) => o.status === 'in_progress').length;
    const pendingMaterial = relatedOrders.filter((o) => o.status === 'pending_material').length;
    return { total, completed, inProgress, pendingMaterial };
  }, [relatedOrders]);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy kế hoạch sản xuất" />
        <Button type="primary" onClick={() => navigate('/production-plans')}
          style={{ marginTop: 16, background: '#1B3A5C' }}>Quay lại danh sách</Button>
      </div>
    );
  }

  const statusCfg = planStatusConfig[record.status];

  // --- Order Table Columns ---
  const orderColumns: ColumnsType<ProductionOrder> = [
    {
      title: 'Mã lệnh', dataIndex: 'code', key: 'code', width: 160,
      render: (v: string, rec: ProductionOrder) => (
        <Button type="link" style={{ padding: 0, fontFamily: 'monospace', fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}
          onClick={() => navigate(`/production-orders/${rec.id}`)}
        >
          {v}
        </Button>
      ),
    },
    {
      title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', width: 220,
      render: (v: string, rec: ProductionOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{rec.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 130, align: 'center',
      render: (t: string) => {
        const cfg = orderTypeConfig[t as keyof typeof orderTypeConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{t}</Tag>;
      },
    },
    {
      title: 'Số lượng', key: 'progress', width: 140, align: 'center',
      render: (_: unknown, rec: ProductionOrder) => {
        const pct = rec.quantity > 0 ? Math.round((rec.completedQty / rec.quantity) * 100) : 0;
        return (
          <div>
            <Progress percent={pct} size="small" strokeColor="#1B3A5C"
              format={() => `${rec.completedQty}/${rec.quantity}`} style={{ marginBottom: 0 }} />
          </div>
        );
      },
    },
    {
      title: 'Trung tâm', dataIndex: 'workshopName', key: 'workshopName', width: 130,
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 100, align: 'center',
      render: (p: string) => {
        const cfg = priorityConfig[p];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{p}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130, align: 'center',
      render: (s: string) => {
        const cfg = orderStatusConfig[s as keyof typeof orderStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{s}</Tag>;
      },
    },
    {
      title: 'Thao tác', key: 'actions', width: 70, align: 'center',
      render: (_: unknown, rec: ProductionOrder) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <FileTextOutlined />, label: 'Xem chi tiết' },
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/production-orders/${rec.id}`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* --- Header Banner --- */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
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
                  onClick={() => navigate('/production-plans')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ScheduleOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {record.name}
                    </div>
                    <Space size={8} style={{ marginTop: 2 }}>
                      <Tag style={{ fontFamily: 'monospace', fontWeight: 600, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
                        {record.code}
                      </Tag>
                      {record.quarter && (
                        <Tag style={{ background: 'rgba(212,168,67,0.25)', border: 'none', color: '#f0d890', fontWeight: 600 }}>
                          Quý {record.quarter}/{record.year}
                        </Tag>
                      )}
                    </Space>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tag
                  icon={statusIconMap[record.status]}
                  style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                >
                  {' '}{statusCfg.label}
                </Tag>

                {record.status === 'draft' && (
                  <>
                    <Button icon={<EditOutlined />}
                      onClick={() => navigate(`/production-plans/${record.id}/edit`)}
                      style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 500 }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button icon={<SendOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Gửi phê duyệt',
                          icon: <SendOutlined style={{ color: '#1B3A5C' }} />,
                          content: `Gửi kế hoạch "${record.name}" để phê duyệt?`,
                          okText: 'Gửi duyệt',
                          cancelText: 'Hủy',
                          onOk: () => message.success('Đã gửi phê duyệt thành công'),
                        });
                      }}
                      style={{ background: 'rgba(212,168,67,0.3)', border: 'none', color: '#f0d890', fontWeight: 600 }}
                    >
                      Gửi duyệt
                    </Button>
                  </>
                )}

                {record.status === 'approved' && (
                  <Button icon={<PlayCircleOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Bắt đầu thực hiện',
                        icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />,
                        content: `Bắt đầu thực hiện kế hoạch "${record.name}"? Các lệnh sản xuất sẽ được kích hoạt.`,
                        okText: 'Bắt đầu',
                        cancelText: 'Hủy',
                        onOk: () => message.success('Đã bắt đầu thực hiện kế hoạch'),
                      });
                    }}
                    style={{ background: 'rgba(82,196,26,0.3)', border: 'none', color: '#b7eb8f', fontWeight: 600 }}
                  >
                    Bắt đầu thực hiện
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 24px', background: '#fff' }}>
          <Row gutter={[32, 12]}>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Năm</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>{record.year}</div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Quý</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>
                {record.quarter ? `Quý ${record.quarter}` : '--'}
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Thời gian</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>
                {formatDate(record.startDate)} - {formatDate(record.endDate)}
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Phê duyệt bởi</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>
                {record.approvedBy || '--'}
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Tổng lệnh SX</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>
                {record.totalOrders} lệnh
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Tổng sản phẩm</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>
                {record.totalProducts} sản phẩm
              </div>
            </Col>
          </Row>
          {record.note && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #D4A843' }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>Ghi chú</Text>
              <Text style={{ fontSize: 13 }}>{record.note}</Text>
            </div>
          )}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              icon={<DashboardOutlined />}
              onClick={() => navigate('/capacity')}
              style={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 500 }}
            >
              Kiểm tra năng lực sản xuất
            </Button>
          </div>
        </div>
      </Card>

      {/* --- Stat Cards --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Tổng lệnh SX', value: stats.total, suffix: 'lệnh', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <CarryOutOutlined /> },
          { label: 'Đã hoàn thành', value: stats.completed, suffix: 'lệnh', gradient: 'linear-gradient(135deg, #389e0d, #52c41a)', icon: <CheckCircleOutlined /> },
          { label: 'Đang thực hiện', value: stats.inProgress, suffix: 'lệnh', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <SyncOutlined /> },
          { label: 'Chờ vật tư', value: stats.pendingMaterial, suffix: 'lệnh', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <HourglassOutlined /> },
        ].map((stat, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card className="db-stat-card" style={{ background: stat.gradient, border: 'none', borderRadius: 14 }}
              styles={{ body: { padding: '16px 18px', position: 'relative', overflow: 'hidden' } }}
            >
              <div style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, opacity: 0.1, color: '#fff',
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {stat.value}
                <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{stat.suffix}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{stat.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* --- Orders Table --- */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <InboxOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Text strong style={{ fontSize: 15, color: '#1B3A5C', margin: 0 }}>Danh sách lệnh sản xuất</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{relatedOrders.length} lệnh</Text>
          </Space>
        </div>

        {relatedOrders.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Empty description="Kế hoạch chưa có lệnh sản xuất nào" />
          </div>
        ) : (
          <Table<ProductionOrder>
            columns={orderColumns}
            dataSource={relatedOrders}
            rowKey="id"
            size="middle"
            pagination={false}
            scroll={{ x: 1100 }}
            style={{ marginTop: 4 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ProductionPlanDetailPage;
