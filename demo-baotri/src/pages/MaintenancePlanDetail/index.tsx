import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Breadcrumb,
  Typography,
  Space,
  Timeline,
  Empty,
  Progress,
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  TeamOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  RadarChartOutlined,
  OrderedListOutlined,
  ExclamationCircleOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { maintenancePlans } from '../../data/maintenancePlans';
import {
  planStatusConfig,
  priorityConfig,
  sparePartStatusConfig,
  workItemStatusConfig,
  formatDate,
} from '../../utils/format';
import type { SparePartRequest, PlanStatus, PlanPriority, SparePartRequestStatus, PlanWorkItem, WorkItemStatus } from '../../types';

const { Title, Text } = Typography;

const planTypeLabels: Record<string, string> = {
  periodic: 'Bảo trì định kỳ',
  corrective: 'Sửa chữa',
  inspection: 'Kiểm tra',
};

const MaintenancePlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const plan = maintenancePlans.find(p => p.id === id);

  if (!plan) {
    return (
      <div style={{ padding: 40 }}>
        <Empty description="Không tìm thấy kế hoạch bảo trì" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/maintenance-plans')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = planStatusConfig[plan.status as PlanStatus];
  const priorityCfg = priorityConfig[plan.priority as PlanPriority];

  const sparePartColumns: ColumnsType<SparePartRequest> = [
    {
      title: 'Mã vật tư',
      dataIndex: 'partCode',
      key: 'partCode',
      width: 140,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'partName',
      key: 'partName',
      width: 250,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: SparePartRequestStatus) => {
        const cfg = sparePartStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  // Build timeline items
  const timelineItems = [
    {
      color: '#1B3A5C',
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Tạo kế hoạch</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatDate(plan.createdDate)} - Người tạo: {plan.createdBy}
          </Text>
        </div>
      ),
    },
    ...(plan.approvedDate
      ? [
          {
            color: '#52c41a',
            children: (
              <div>
                <Text strong style={{ fontSize: 13 }}>Phê duyệt</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(plan.approvedDate)} - Người duyệt: {plan.approvedBy}
                </Text>
              </div>
            ),
          },
        ]
      : []),
    {
      color: plan.actualStart ? '#0891b2' : '#e8e8e8',
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Bắt đầu thực hiện</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {plan.actualStart
              ? `Thực tế: ${formatDate(plan.actualStart)}`
              : `Dự kiến: ${formatDate(plan.scheduledStart)}`}
          </Text>
        </div>
      ),
    },
    {
      color: plan.actualEnd ? '#52c41a' : '#e8e8e8',
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Hoàn thành</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {plan.actualEnd
              ? `Thực tế: ${formatDate(plan.actualEnd)}`
              : `Dự kiến: ${formatDate(plan.scheduledEnd)}`}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: 'Tổng quan' },
            { title: <a onClick={() => navigate('/maintenance-plans')}>Kế hoạch bảo trì</a> },
            { title: 'Chi tiết' },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
              }}
            >
              <FileTextOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
                Chi tiết kế hoạch bảo trì
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {plan.code} - {plan.name}
              </Text>
            </div>
          </div>
          <Space>
            {(plan.status === 'approved' || plan.status === 'in_progress') && (
              <Button
                type="primary"
                icon={<FileProtectOutlined />}
                style={{ background: '#1B3A5C' }}
                onClick={() => navigate(`/work-orders?planId=${plan.id}`)}
              >
                Xem WO
              </Button>
            )}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/maintenance-plans')}
            >
              Quay lại
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Plan Info */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <CalendarOutlined />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Thông tin kế hoạch</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            className="animate-fade-in animate-delay-1"
          >
            <Descriptions
              column={{ xs: 1, sm: 2, md: 2 }}
              size="small"
              labelStyle={{ fontWeight: 600, color: '#595959', fontSize: 13 }}
              contentStyle={{ fontSize: 13 }}
            >
              <Descriptions.Item label="Mã kế hoạch">
                <Text strong style={{ color: '#1B3A5C' }}>{plan.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại bảo trì">
                {planTypeLabels[plan.type] || plan.type}
              </Descriptions.Item>
              <Descriptions.Item label="Độ ưu tiên">
                <Tag color={priorityCfg.color}>{priorityCfg.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu (KH)">
                {formatDate(plan.scheduledStart)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc (KH)">
                {formatDate(plan.scheduledEnd)}
              </Descriptions.Item>
              {plan.actualStart && (
                <Descriptions.Item label="Ngày bắt đầu (TT)">
                  {formatDate(plan.actualStart)}
                </Descriptions.Item>
              )}
              {plan.actualEnd && (
                <Descriptions.Item label="Ngày kết thúc (TT)">
                  {formatDate(plan.actualEnd)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Thời gian dự kiến">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {plan.estimatedDuration} giờ
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                <UserOutlined style={{ marginRight: 4 }} />
                {plan.createdBy}
              </Descriptions.Item>
              {plan.approvedBy && (
                <Descriptions.Item label="Người phê duyệt">
                  <CheckCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                  {plan.approvedBy}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Mô tả" span={2}>
                {plan.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* ── Đầu mục công việc (Work Items) ── */}
          {plan.workItems.length > 0 && (() => {
            const completedCount = plan.workItems.filter(w => w.status === 'completed').length;
            const totalItems = plan.workItems.length;
            const progressPct = Math.round((completedCount / totalItems) * 100);
            const totalEstHours = plan.workItems.reduce((s, w) => s + w.estimatedHours, 0);
            const totalActHours = plan.workItems.reduce((s, w) => s + (w.actualHours || 0), 0);

            const workItemColumns: ColumnsType<PlanWorkItem> = [
              {
                title: 'STT', dataIndex: 'order', width: 55, align: 'center',
                render: (order: number) => <Text strong style={{ color: '#1B3A5C' }}>{order}</Text>,
              },
              {
                title: 'Đầu mục công việc', key: 'name', ellipsis: false,
                render: (_: unknown, record: PlanWorkItem) => (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
                      {record.isMandatory && <Tag color="red" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>Bắt buộc</Tag>}
                    </div>
                    {record.description && <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>}
                    {record.notes && <div style={{ marginTop: 2 }}><Text type="warning" style={{ fontSize: 11 }}><ExclamationCircleOutlined style={{ marginRight: 4 }} />{record.notes}</Text></div>}
                  </div>
                ),
              },
              {
                title: 'Người thực hiện', key: 'staff', width: 170,
                render: (_: unknown, record: PlanWorkItem) => record.assignedStaffName ? (
                  <Space size={6}>
                    <Avatar size={22} style={{ background: '#1B3A5C', fontSize: 10 }}>{record.assignedStaffName.split(' ').pop()?.charAt(0)}</Avatar>
                    <Text style={{ fontSize: 12 }}>{record.assignedStaffName}</Text>
                  </Space>
                ) : <Text type="secondary" style={{ fontSize: 12 }}>Chưa phân công</Text>,
              },
              {
                title: 'Thời gian (giờ)', key: 'hours', width: 120, align: 'center',
                render: (_: unknown, record: PlanWorkItem) => (
                  <div style={{ fontSize: 12 }}>
                    <Text strong>{record.actualHours ?? '-'}</Text>
                    <Text type="secondary"> / {record.estimatedHours}</Text>
                  </div>
                ),
              },
              {
                title: 'Trạng thái', dataIndex: 'status', width: 130, align: 'center',
                render: (status: WorkItemStatus) => {
                  const cfg = workItemStatusConfig[status];
                  return <Tag color={cfg.color}>{cfg.label}</Tag>;
                },
              },
            ];

            return (
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #059669, #34d399)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14,
                      }}>
                        <OrderedListOutlined />
                      </div>
                      <Text strong style={{ color: '#1B3A5C' }}>Đầu mục công việc</Text>
                      <Tag color="processing">{totalItems} mục</Tag>
                    </Space>
                    <Space size={16}>
                      <div style={{ textAlign: 'right', fontSize: 11 }}>
                        <Text type="secondary">Tiến độ: </Text>
                        <Text strong>{completedCount}/{totalItems}</Text>
                      </div>
                      <Progress type="circle" percent={progressPct} size={36} strokeColor="#1B3A5C"
                        format={p => <span style={{ fontSize: 10, fontWeight: 700 }}>{p}%</span>} />
                    </Space>
                  </div>
                }
                style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
                styles={{ body: { padding: 0 } }}
                className="animate-fade-in animate-delay-2"
              >
                <Table<PlanWorkItem>
                  columns={workItemColumns}
                  dataSource={plan.workItems}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  rowClassName={(record) => record.status === 'completed' ? '' : record.status === 'in_progress' ? 'row-executing' : ''}
                />
                {/* Tổng kết giờ */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 12 }}>
                  <Text type="secondary">Tổng dự kiến: <Text strong>{totalEstHours} giờ</Text></Text>
                  {totalActHours > 0 && <Text type="secondary">Tổng thực tế: <Text strong style={{ color: '#1B3A5C' }}>{totalActHours} giờ</Text></Text>}
                </div>
              </Card>
            );
          })()}

          {/* Equipment Info */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <RadarChartOutlined />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Thông tin thiết bị</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            className="animate-fade-in animate-delay-2"
          >
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              size="small"
              labelStyle={{ fontWeight: 600, color: '#595959', fontSize: 13 }}
              contentStyle={{ fontSize: 13 }}
            >
              <Descriptions.Item label="Tên thiết bị">
                <Text strong>{plan.equipmentName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã thiết bị">
                <Text style={{ color: '#1B3A5C' }}>{plan.equipmentCode}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Team Info */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a1628',
                    fontSize: 14,
                  }}
                >
                  <TeamOutlined />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Đội thực hiện</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            className="animate-fade-in animate-delay-3"
          >
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              size="small"
              labelStyle={{ fontWeight: 600, color: '#595959', fontSize: 13 }}
              contentStyle={{ fontSize: 13 }}
            >
              <Descriptions.Item label="Đội bảo trì">
                <Text strong>{plan.teamName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã đội">
                {plan.teamId}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Spare Parts Table */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #722ed1, #b37feb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <ToolOutlined />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Vật tư phụ tùng</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: plan.spareParts.length > 0 ? 0 : 20 } }}
            className="animate-fade-in animate-delay-4"
          >
            {plan.spareParts.length > 0 ? (
              <Table<SparePartRequest>
                columns={sparePartColumns}
                dataSource={plan.spareParts}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            ) : (
              <Empty
                description="Không có yêu cầu vật tư cho kế hoạch này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* Timeline / Status */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <ClockCircleOutlined />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Tiến trình</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            className="animate-fade-in animate-delay-2"
          >
            <Timeline items={timelineItems} />
          </Card>

          {/* Status Summary Card */}
          <Card
            style={{
              borderRadius: 14,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            }}
            styles={{ body: { padding: 20 } }}
            className="animate-fade-in animate-delay-3"
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 28,
                  color: '#fff',
                }}
              >
                <CalendarOutlined />
              </div>
              <Title level={5} style={{ color: '#fff', margin: '0 0 4px' }}>
                {plan.name}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block', marginBottom: 16 }}>
                {planTypeLabels[plan.type]}
              </Text>
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '12px 16px',
                }}
              >
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>
                      Trạng thái
                    </Text>
                    <Tag color={statusCfg.color} style={{ marginTop: 4 }}>
                      {statusCfg.label}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>
                      Ưu tiên
                    </Text>
                    <Tag color={priorityCfg.color} style={{ marginTop: 4 }}>
                      {priorityCfg.label}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>
                      Thời gian
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                      {plan.estimatedDuration}h
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>
                      Đầu mục CV
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                      {plan.workItems.filter(w => w.status === 'completed').length}/{plan.workItems.length}
                    </Text>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MaintenancePlanDetail;
