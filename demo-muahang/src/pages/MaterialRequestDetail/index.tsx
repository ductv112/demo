import React from 'react';
import {
  Card, Tag, Row, Col, Typography, Table, Space, Button, Empty,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, CalendarOutlined,
  UserOutlined, CheckCircleOutlined, ToolOutlined, DatabaseOutlined,
  TeamOutlined, LinkOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { materialRequests } from '../../data/materialRequests';
import {
  formatDate, priorityConfig,
  materialRequestSourceConfig, sourceSystemConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { MaterialRequestItem } from '../../types';

const { Title, Text } = Typography;

const MaterialRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const request = materialRequests.find(r => r.id === id);

  if (!request) {
    return (
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/material-requests')}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>
        <Empty description="Không tìm thấy yêu cầu vật tư" />
      </div>
    );
  }

  const priorityCfg = priorityConfig[request.priority];
  const sourceCfg = materialRequestSourceConfig[request.source];
  const systemCfg = sourceSystemConfig[request.sourceSystem];
  const totalQty = request.items.reduce((s, i) => s + i.quantity, 0);

  const itemColumns: ColumnsType<MaterialRequestItem> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_: unknown, __: MaterialRequestItem, index: number) => (
        <Text strong style={{ color: colors.navy }}>{index + 1}</Text>
      ),
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 140,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 14 }}>{code}</Text>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (name: string) => <Text style={{ fontSize: 14 }}>{name}</Text>,
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: 110,
      align: 'center',
      render: (unit: string) => <Text style={{ fontSize: 14 }}>{unit}</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (qty: number) => <Text strong style={{ fontSize: 15, color: colors.navy }}>{qty}</Text>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: (note: string | undefined) => note || <Text type="secondary">--</Text>,
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/material-requests')}
        style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}
      >
        Quay lại danh sách
      </Button>

      {/* ═══════════════════════════════════════════════════════
          HERO HEADER CARD
          ═══════════════════════════════════════════════════════ */}
      <Card
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: 24,
          overflow: 'hidden',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Top section — gradient background */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`,
          padding: '28px 32px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative', zIndex: 1 }}>
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileTextOutlined style={{ fontSize: 24, color: colors.goldLight }} />
            </div>

            {/* Title + Tags */}
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 600 }}>
                {request.title}
              </Title>
              <Space size={8} wrap style={{ marginTop: 10 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 12 }}>
                  {request.code}
                </Tag>
                <Tag
                  color={sourceCfg.color}
                  icon={request.source === 'technical_plan' ? <ToolOutlined /> : <DatabaseOutlined />}
                  style={{ fontSize: 12 }}
                >
                  {sourceCfg.label}
                </Tag>
                <Tag color={priorityCfg.color} style={{ fontSize: 12 }}>
                  Ưu tiên: {priorityCfg.label}
                </Tag>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  {systemCfg.label}
                </Tag>
              </Space>
            </div>

            {/* Summary — right side */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Tổng loại vật tư</Text>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                {request.items.length}
                <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>Loại</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section — mô tả */}
        {request.description && (
          <div style={{
            padding: '16px 32px',
            background: colors.bgLight,
            borderBottom: `1px solid ${colors.border}`,
            fontSize: 14,
            color: colors.textPrimary,
            lineHeight: 1.6,
          }}>
            {request.description}
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════
          THÔNG TIN CHI TIẾT — 2 cột
          ═══════════════════════════════════════════════════════ */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        {/* Cột trái — Thông tin cơ bản */}
        <Col xs={24} md={16}>
          <Card
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UnorderedListOutlined style={{ fontSize: 14, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Thông tin yêu cầu</span>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            <Row gutter={[0, 24]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Mã yêu cầu:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginTop: 4 }}>{request.code}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Đơn vị yêu cầu:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginTop: 4 }}>{request.departmentName}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Người yêu cầu:</Text>
                <div style={{ fontSize: 15, fontWeight: 500, color: colors.textPrimary, marginTop: 4 }}>{request.requestedBy}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Ngày yêu cầu:</Text>
                <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>{formatDate(request.requestedDate)}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Nguồn:</Text>
                <div style={{ marginTop: 6 }}>
                  <Tag
                    color={sourceCfg.color}
                    icon={request.source === 'technical_plan' ? <ToolOutlined /> : <DatabaseOutlined />}
                    style={{ fontSize: 13 }}
                  >
                    {sourceCfg.label}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Phân hệ gửi:</Text>
                <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>{systemCfg.label}</div>
              </Col>
              {request.relatedTask && (
                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <LinkOutlined style={{ marginRight: 4 }} />Nhiệm vụ liên quan:
                  </Text>
                  <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>{request.relatedTask}</div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        {/* Cột phải — Tóm tắt & Phê duyệt */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space size={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.success}, #10b981)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircleOutlined style={{ fontSize: 14, color: '#fff' }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Phê duyệt</span>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            {/* Tổng hợp số liệu */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0 24px',
              borderBottom: `1px solid ${colors.border}`,
              marginBottom: 20,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{totalQty}</span>
              </div>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Tổng số lượng yêu cầu</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={colors.navy} style={{ fontSize: 13 }}>{request.items.length} loại vật tư</Tag>
              </div>
            </div>

            {/* Thông tin duyệt */}
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <UserOutlined style={{ marginRight: 6 }} />Người duyệt:
                </Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginTop: 4 }}>
                  {request.approvedBy || '--'}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />Ngày duyệt:
                </Text>
                <div style={{ fontSize: 15, color: colors.textPrimary, marginTop: 4 }}>
                  {request.approvedDate ? formatDate(request.approvedDate) : '--'}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <TeamOutlined style={{ marginRight: 6 }} />Mức ưu tiên:
                </Text>
                <div style={{ marginTop: 6 }}>
                  <Tag color={priorityCfg.color} style={{ fontSize: 13 }}>{priorityCfg.label}</Tag>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* ═══════════════════════════════════════════════════════
          DANH SÁCH VẬT TƯ
          ═══════════════════════════════════════════════════════ */}
      <Card
        title={
          <Space size={10}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileTextOutlined style={{ fontSize: 14, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>
              Danh sách vật tư yêu cầu ({request.items.length} loại)
            </span>
          </Space>
        }
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={itemColumns}
          dataSource={request.items}
          rowKey="materialId"
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary.Row style={{ backgroundColor: colors.bgLight }}>
              <Table.Summary.Cell index={0} colSpan={4}>
                <Text strong style={{ fontSize: 14 }}>Tổng cộng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ fontSize: 16, color: colors.navy }}>
                  {totalQty}
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
};

export default MaterialRequestDetail;
