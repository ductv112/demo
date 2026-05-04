import React, { useMemo } from 'react';
import {
  Card, Tag, Descriptions, Row, Col, Typography, Space,
  Button, Empty, Dropdown, Modal, message,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined,
  LinkOutlined, SolutionOutlined,
  AuditOutlined, MoreOutlined, EditOutlined,
  DeleteOutlined, PrinterOutlined, FileExcelOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { missions, getProposalByMissionId } from '../../data/missions';
import { contracts } from '../../data/contracts';
import { departments } from '../../data/departments';
import {
  formatDate, formatCurrency, formatCurrencyFull,
  missionStatusConfig, missionTypeConfig, missionPriorityConfig,
  missionComplexityConfig, executionScopeConfig,
  proposalStatusConfig, contractStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type {
  MissionStatus, MissionType, MissionPriority,
  ProposalStatus, ContractStatus,
} from '../../types';

const { Title, Text } = Typography;

const sectionIcon = (icon: React.ReactNode, gradient: string) => (
  <div style={{
    width: 32, height: 32, borderRadius: 8, background: gradient,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 14,
  }}>{icon}</div>
);

const TaskReceptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const mission = useMemo(() => missions.find(m => m.id === id), [id]);
  const proposal = useMemo(() => (id ? getProposalByMissionId(id) : undefined), [id]);
  const linkedContract = useMemo(() => contracts.find(c => c.missionId === id), [id]);

  if (!mission) {
    return (
      <Card>
        <Title level={4}>{'Không tìm thấy nhiệm vụ'}</Title>
        <Button type="link" onClick={() => navigate('/missions')}>
          {'Quay lại danh sách'}
        </Button>
      </Card>
    );
  }

  const missionStatus = missionStatusConfig[mission.status as MissionStatus];
  const missionType = missionTypeConfig[mission.missionType as MissionType];
  const missionPriority = missionPriorityConfig[mission.priority as MissionPriority];

  const canEdit = ['draft', 'pending_approval'].includes(mission.status);

  const actionMenuItems = [
    ...(canEdit ? [
      { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
      { key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true },
      { type: 'divider' as const },
    ] : []),
    { key: 'print', label: 'In hồ sơ', icon: <PrinterOutlined /> },
    { key: 'export', label: 'Xuất Excel', icon: <FileExcelOutlined /> },
  ];

  const handleActionClick = ({ key }: { key: string }) => {
    if (key === 'edit') {
      navigate(`/missions/${id}/edit`);
      return;
    }
    if (key === 'delete') {
      Modal.confirm({
        title: 'Xác nhận xóa nhiệm vụ',
        content: (
          <div>
            <p>Bạn có chắc chắn muốn xóa nhiệm vụ <strong>{mission.code}</strong>?</p>
            <p style={{ color: '#666', fontSize: 13 }}>
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        ),
        okText: 'Xóa',
        okButtonProps: { danger: true },
        cancelText: 'Hủy',
        onOk: () => {
          message.success(`Đã xóa nhiệm vụ ${mission.code}`);
          navigate('/missions');
        },
      });
      return;
    }
    const labels: Record<string, string> = {
      print: 'In hồ sơ',
      export: 'Xuất Excel',
    };
    message.info(`Chức năng "${labels[key]}" đang được phát triển`);
  };

  const dept = mission.assignedDepartment
    ? departments.find(d => d.id === mission.assignedDepartment)
    : null;

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Hero Banner */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ color: '#fff' }}
              onClick={() => navigate(-1)}
            />
            <FileTextOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{mission.name}</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  {mission.code}
                </Tag>
                <Tag color={missionType.color}>{missionType.label}</Tag>
                <Tag color={missionPriority.color}>{missionPriority.label}</Tag>
              </Space>
            </div>
          </Space>
          <Space>
            <Tag
              color={missionStatus.color}
              style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}
            >
              {missionStatus.label}
            </Tag>
            <Dropdown
              menu={{
                items: actionMenuItems,
                onClick: handleActionClick,
              }}
              trigger={['click']}
            >
              <Button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* Thông tin nhiệm vụ */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14, marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {sectionIcon(<FileTextOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>{'Thông tin nhiệm vụ'}</Text>
          </div>
        }
      >
        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          size="middle"
          labelStyle={{ fontWeight: 600, color: colors.navy, width: 180 }}
        >
          <Descriptions.Item label={'Mã nhiệm vụ'}>
            <Text strong style={{ color: colors.navy }}>{mission.code}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={'Trạng thái'}>
            <Tag color={missionStatus.color}>{missionStatus.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={'Tên nhiệm vụ'} span={2}>
            {mission.name}
          </Descriptions.Item>
          <Descriptions.Item label={'Mô tả'} span={2}>
            {mission.description}
          </Descriptions.Item>
          <Descriptions.Item label={'Đơn vị giao'}>
            {mission.requestingUnit}
          </Descriptions.Item>
          <Descriptions.Item label={'Loại nhiệm vụ'}>
            <Tag color={missionType.color}>{missionType.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={'Loại sản phẩm/hệ thống'}>
            {mission.equipmentType}
          </Descriptions.Item>
          <Descriptions.Item label={'Số lượng'}>
            {mission.equipmentQuantity}
          </Descriptions.Item>
          <Descriptions.Item label={'Mức ưu tiên'}>
            <Tag color={missionPriority.color}>{missionPriority.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={'Ngày tiếp nhận'}>
            {formatDate(mission.receivedDate)}
          </Descriptions.Item>
          <Descriptions.Item label={'Hạn hoàn thành'}>
            <Text
              style={
                new Date(mission.deadline) < new Date()
                  ? { color: colors.danger, fontWeight: 600 }
                  : undefined
              }
            >
              {formatDate(mission.deadline)}
            </Text>
          </Descriptions.Item>
          {mission.complexity && (
            <Descriptions.Item label={'Độ phức tạp'}>
              <Tag color={missionComplexityConfig[mission.complexity]?.color}>
                {missionComplexityConfig[mission.complexity]?.label}
              </Tag>
            </Descriptions.Item>
          )}
          {mission.executionScope && (
            <Descriptions.Item label={'Phạm vi thực hiện'}>
              <Tag color={executionScopeConfig[mission.executionScope]?.color}>
                {executionScopeConfig[mission.executionScope]?.label}
              </Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={'Trung tâm xử lý'}>
            {dept ? dept.name : <Text type="secondary">{'Chưa phân công'}</Text>}
          </Descriptions.Item>
          {mission.technicalRequirements && (
            <Descriptions.Item label={'Yêu cầu kỹ thuật'} span={2}>
              {mission.technicalRequirements}
            </Descriptions.Item>
          )}
          {mission.qualityRequirements && (
            <Descriptions.Item label={'Yêu cầu chất lượng'} span={2}>
              {mission.qualityRequirements}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={'Ngày tạo'}>
            {formatDate(mission.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label={'Cập nhật gần nhất'}>
            {formatDate(mission.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Hồ sơ liên kết */}
      <Row gutter={16}>
        {/* Đề xuất & Dự toán */}
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card"
            style={{ borderRadius: 14, height: '100%' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {sectionIcon(<SolutionOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}
                <Text strong style={{ color: colors.navy, fontSize: 15 }}>{'Đề xuất & Dự toán'}</Text>
              </div>
            }
          >
            {proposal ? (
              <div>
                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{ fontWeight: 600, color: colors.navy, width: 150, fontSize: 12 }}
                  contentStyle={{ fontSize: 13 }}
                >
                  <Descriptions.Item label={'Mã đề xuất'}>
                    <Text strong style={{ color: colors.navy }}>{proposal.code}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Trạng thái'}>
                    <Tag color={proposalStatusConfig[proposal.status as ProposalStatus].color}>
                      {proposalStatusConfig[proposal.status as ProposalStatus].label}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Tổng dự toán'}>
                    <Text strong style={{ color: colors.navy, fontSize: 14 }}>{formatCurrencyFull(proposal.totalCost)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Giá đề xuất'}>
                    <Text strong style={{ color: colors.gold }}>{formatCurrencyFull(proposal.proposedPrice)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Thời gian dự kiến'}>
                    {proposal.estimatedDuration} {'ngày'}
                  </Descriptions.Item>
                </Descriptions>

                {/* Mini cost summary */}
                <Row gutter={8} style={{ marginTop: 12 }}>
                  {[
                    { label: 'Vật tư', value: proposal.materialCost, gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
                    { label: 'Nhân công', value: proposal.laborCost, gradient: 'linear-gradient(135deg, #059669, #34d399)' },
                  ].map((item, idx) => (
                    <Col xs={12} key={idx}>
                      <div style={{
                        background: item.gradient, borderRadius: 10, padding: '10px 12px',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div className="db-bg-icon" style={{
                          position: 'absolute', top: -6, right: -6, fontSize: 48,
                          color: 'rgba(255,255,255,0.1)', lineHeight: 1,
                        }}>
                          <DollarOutlined />
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{formatCurrency(item.value)}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ) : (
              <Empty
                description={'Chưa có đề xuất & dự toán'}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* Hợp đồng liên kết */}
        <Col xs={24} lg={12}>
          <Card
            className="db-chart-card"
            style={{ borderRadius: 14, height: '100%' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {sectionIcon(<AuditOutlined />, 'linear-gradient(135deg, #7c3aed, #a78bfa)')}
                <Text strong style={{ color: colors.navy, fontSize: 15 }}>{'Hợp đồng liên kết'}</Text>
              </div>
            }
          >
            {linkedContract ? (
              <div>
                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{ fontWeight: 600, color: colors.navy, width: 150, fontSize: 12 }}
                  contentStyle={{ fontSize: 13 }}
                >
                  <Descriptions.Item label={'Mã hợp đồng'}>
                    <Text strong style={{ color: colors.navy }}>{linkedContract.code}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Trạng thái'}>
                    <Tag color={contractStatusConfig[linkedContract.status as ContractStatus].color}>
                      {contractStatusConfig[linkedContract.status as ContractStatus].label}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Giá trị HĐ'}>
                    <Text strong style={{ color: colors.navy, fontSize: 14 }}>{formatCurrencyFull(linkedContract.contractValue)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={'Đơn vị đặt hàng'}>
                    {linkedContract.partnerUnit}
                  </Descriptions.Item>
                  {linkedContract.signedDate && (
                    <Descriptions.Item label={'Ngày ký'}>
                      {formatDate(linkedContract.signedDate)}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={'Thời gian TH'}>
                    {formatDate(linkedContract.startDate)} - {formatDate(linkedContract.endDate)}
                  </Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 12 }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<LinkOutlined />}
                    onClick={() => navigate(`/contracts/${linkedContract.id}`)}
                    style={{ background: colors.navy, borderColor: colors.navy }}
                  >
                    {'Xem hợp đồng'}
                  </Button>
                </div>
              </div>
            ) : (
              <Empty
                description={'Chưa có hợp đồng liên kết'}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TaskReceptionDetailPage;
