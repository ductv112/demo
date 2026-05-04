import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tag, Button, Space, Typography, Row, Col, Empty, Table, Modal, message,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, NodeIndexOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, StopOutlined,
  SendOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  ToolOutlined, TeamOutlined,
} from '@ant-design/icons';
import { processRoutings, processSteps } from '../../data/processRoutings';
import { productionOrders } from '../../data/productionOrders';
import type { ProcessRouting, ProcessStep } from '../../types';
import { routingStatusConfig, formatDate } from '../../utils/format';

const { Text } = Typography;

const routingTypeLabels: Record<ProcessRouting['type'], { label: string; color: string }> = {
  new_production: { label: 'Sản xuất mới', color: '#1B3A5C' },
  repair: { label: 'Sửa chữa', color: '#d97706' },
  overhaul: { label: 'Đại tu', color: '#7c3aed' },
};

const statusIconMap: Record<string, React.ReactNode> = {
  active:    <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  approved:  <CheckCircleOutlined style={{ color: '#1890ff' }} />,
  draft:     <FileTextOutlined style={{ color: '#8c8c8c' }} />,
  deprecated: <StopOutlined style={{ color: '#ff4d4f' }} />,
};

const ProcessRoutingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = processRoutings.find((r) => r.id === id);
  const steps = useMemo(
    () => processSteps.filter((s) => s.routingId === id).sort((a, b) => a.stepNo - b.stepNo),
    [id],
  );

  const relatedOrders = useMemo(() => {
    if (!record) return [];
    return productionOrders.filter((o) => o.productId === record.productId);
  }, [record]);

  // --- Computed stats ---
  const totalSteps = steps.length;
  const totalHours = steps.reduce((sum, s) => sum + s.estimatedHours, 0);
  const uniqueWorkshops = [...new Set(steps.map((s) => s.workshopName))].length;
  const totalWorkers = steps.reduce((sum, s) => sum + s.requiredWorkers, 0);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy quy trình công nghệ" />
        <Button
          type="primary"
          onClick={() => navigate('/process-routings')}
          style={{ marginTop: 16, background: '#1B3A5C' }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusCfg = routingStatusConfig[record.status];
  const typeCfg = routingTypeLabels[record.type];

  return (
    <div>
      {/* ─── Header Banner ─── */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(212,168,67,0.06)',
          }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/process-routings')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <NodeIndexOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {record.productName}
                    </div>
                    <Space size={8} style={{ marginTop: 2 }}>
                      <Tag style={{
                        fontFamily: 'monospace', fontWeight: 600,
                        background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                      }}>
                        {record.code}
                      </Tag>
                      <Tag style={{
                        fontFamily: 'monospace',
                        background: 'rgba(212,168,67,0.25)', border: 'none', color: '#f0d890',
                      }}>
                        {record.version}
                      </Tag>
                      <Tag color={typeCfg.color} style={{ border: 'none' }}>
                        {typeCfg.label}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tag
                  icon={statusIconMap[record.status]}
                  style={{
                    fontSize: 13, padding: '4px 12px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                  }}
                >
                  {' '}{statusCfg.label}
                </Tag>
                {record.status === 'draft' && (
                  <>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/process-routings/${record.id}/edit`)}
                      style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 500 }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      icon={<SendOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Gửi phê duyệt',
                          icon: <SendOutlined style={{ color: '#1B3A5C' }} />,
                          content: `Gửi quy trình "${record.productName}" (${record.version}) để phê duyệt?`,
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
                  <>
                    <Button
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Phê duyệt quy trình',
                          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                          content: `Phê duyệt và đưa vào sử dụng: "${record.productName}" (${record.version})?`,
                          okText: 'Phê duyệt',
                          cancelText: 'Hủy',
                          onOk: () => message.success('Đã phê duyệt thành công'),
                        });
                      }}
                      style={{ background: 'rgba(82,196,26,0.3)', border: 'none', color: '#b7eb8f', fontWeight: 600 }}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      icon={<CloseCircleOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Từ chối phê duyệt',
                          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                          content: `Từ chối quy trình "${record.productName}" (${record.version})? Quy trình sẽ chuyển về trạng thái Nháp.`,
                          okText: 'Từ chối',
                          okType: 'danger',
                          cancelText: 'Hủy',
                          onOk: () => message.success('Đã từ chối, chuyển về trạng thái Nháp'),
                        });
                      }}
                      style={{ background: 'rgba(255,77,79,0.3)', border: 'none', color: '#ffa39e', fontWeight: 600 }}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                {record.status === 'active' && (
                  <Button
                    icon={<StopOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Ngừng sử dụng',
                        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                        content: `Ngừng sử dụng quy trình "${record.productName}" (${record.version})? Các lệnh SX mới sẽ không thể sử dụng quy trình này.`,
                        okText: 'Ngừng sử dụng',
                        okType: 'danger',
                        cancelText: 'Hủy',
                        onOk: () => message.success('Đã ngừng sử dụng'),
                      });
                    }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 500 }}
                  >
                    Ngừng sử dụng
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
              <Text type="secondary" style={{ fontSize: 12 }}>Sản phẩm</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>{record.productName}</div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Loại</Text>
              <div><Tag color={typeCfg.color} style={{ marginTop: 4 }}>{typeCfg.label}</Tag></div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Thời gian ước tính</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>{record.estimatedDays} ngày</div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Kế thừa từ</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>
                {record.previousVersion
                  ? <Tag style={{ fontFamily: 'monospace', color: '#7c3aed', borderColor: '#7c3aed' }}>{record.previousVersion}</Tag>
                  : '--'}
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Phê duyệt bởi</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>
                {record.approvedBy
                  ? <span>{record.approvedBy} ({record.approvedAt ? formatDate(record.approvedAt) : ''})</span>
                  : '--'}
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Lệnh SX liên quan</Text>
              <div style={{ fontWeight: 600, color: relatedOrders.length > 0 ? '#1B3A5C' : '#8c8c8c', marginTop: 4 }}>
                {relatedOrders.length > 0 ? `${relatedOrders.length} lệnh` : 'Chưa có'}
              </div>
            </Col>
          </Row>
          {record.description && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #D4A843',
            }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>Mô tả quy trình</Text>
              <Text style={{ fontSize: 13 }}>{record.description}</Text>
            </div>
          )}
        </div>
      </Card>

      {/* ─── Summary Stats ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Tổng công đoạn', value: totalSteps, suffix: 'bước', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Tổng giờ công', value: totalHours, suffix: 'giờ', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
          { label: 'Trung tâm tham gia', value: uniqueWorkshops, suffix: 'đơn vị', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
          { label: 'Nhân lực cần thiết', value: totalWorkers, suffix: 'người', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
        ].map((stat, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{ background: stat.gradient, border: 'none', borderRadius: 14 }}
              styles={{ body: { padding: '16px 18px' } }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {stat.value}
                <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{stat.suffix}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{stat.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Process Steps Timeline ─── */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NodeIndexOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <Text strong style={{ fontSize: 16, color: '#1B3A5C' }}>
            Các công đoạn sản xuất
          </Text>
          <Tag style={{ marginLeft: 4, fontWeight: 600 }}>{totalSteps} bước</Tag>
        </div>

        {steps.length === 0 ? (
          <Empty description="Chưa có công đoạn nào" />
        ) : (
          <Table<ProcessStep>
            dataSource={steps}
            rowKey="id"
            size="middle"
            pagination={false}
            scroll={{ x: 1000 }}
            columns={[
              {
                title: 'Bước', dataIndex: 'stepNo', key: 'stepNo', width: 55, align: 'center',
                render: (v: number) => (
                  <div style={{
                    width: 26, height: 26, borderRadius: 13,
                    background: '#1B3A5C', color: '#fff', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                  }}>{v}</div>
                ),
              },
              {
                title: 'Tên công đoạn', dataIndex: 'name', key: 'name', width: 200,
                render: (v: string, step: ProcessStep) => (
                  <div>
                    <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{v}</Text>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{step.description}</div>
                  </div>
                ),
              },
              {
                title: 'Trung tâm', dataIndex: 'workshopName', key: 'workshopName', width: 120,
                render: (v: string) => <Tag color="#1B3A5C" style={{ fontSize: 11 }}>{v}</Tag>,
              },
              {
                title: 'Thiết bị yêu cầu', dataIndex: 'equipmentRequired', key: 'equipmentRequired', width: 180,
                render: (v: string[]) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {v.map((eq, i) => <Tag key={i} color="blue" style={{ fontSize: 10 }}>{eq}</Tag>)}
                  </div>
                ),
              },
              {
                title: 'Kỹ năng', dataIndex: 'skillRequired', key: 'skillRequired', width: 130,
                render: (v: string[]) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {v.map((sk, i) => <Tag key={i} color="cyan" style={{ fontSize: 10 }}>{sk}</Tag>)}
                  </div>
                ),
              },
              {
                title: 'Giờ', dataIndex: 'estimatedHours', key: 'estimatedHours', width: 55, align: 'right',
                render: (v: number) => <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>{v}h</Text>,
              },
              {
                title: 'Nhân lực', dataIndex: 'requiredWorkers', key: 'requiredWorkers', width: 50, align: 'center',
                render: (v: number) => <Text style={{ fontSize: 12 }}>{v}</Text>,
              },
              {
                title: 'Tiêu chuẩn chất lượng', dataIndex: 'qualityStandard', key: 'qualityStandard', width: 180, ellipsis: true,
                render: (v?: string) => v
                  ? <Text style={{ fontSize: 11, color: '#52c41a' }}><CheckCircleOutlined style={{ marginRight: 3 }} />{v}</Text>
                  : <Text type="secondary" style={{ fontSize: 11 }}>--</Text>,
              },
            ]}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <Text strong style={{ color: '#1B3A5C' }}>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong style={{ color: '#1B3A5C' }}>{totalHours}h</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="center">
                    <Text strong style={{ color: '#1B3A5C' }}>{totalWorkers}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ProcessRoutingDetailPage;
