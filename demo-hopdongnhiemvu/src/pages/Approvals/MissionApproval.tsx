import React, { useMemo, useState } from 'react';
import {
  Card, Row, Col, Tag, Button, Typography, Space, Empty,
  message, Input, Modal,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, FlagOutlined,
  CalendarOutlined, TeamOutlined, ToolOutlined,
  ThunderboltOutlined, ApartmentOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { missions, proposals } from '../../data/missions';
import { departments } from '../../data/departments';
import {
  missionStatusConfig, missionTypeConfig, missionPriorityConfig,
  missionComplexityConfig, executionScopeConfig,
  formatDate, formatCurrency,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Mission } from '../../types';

const { Text } = Typography;

const MissionApproval: React.FC = () => {
  const navigate = useNavigate();
  const [rejectingMission, setRejectingMission] = useState<Mission | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Chỉ lọc NV đã trình duyệt nhưng chưa được phê duyệt
  const pendingMissions = useMemo(() => {
    return missions.filter(m => m.status === 'pending_approval');
  }, []);

  const handleApprove = (mission: Mission) => {
    message.success(`Đã phê duyệt nhiệm vụ ${mission.code} — chuyển sang giai đoạn lập đề xuất`);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối hoặc yêu cầu bổ sung');
      return;
    }
    message.error(`Đã từ chối nhiệm vụ ${rejectingMission?.code} — yêu cầu chỉnh sửa bổ sung`);
    setRejectingMission(null);
    setRejectReason('');
  };

  return (
    <div>
      {/* Header */}
      <Card
        className="db-chart-card"
        bordered={false}
        style={{ marginBottom: 20 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16,
            }}>
              <FlagOutlined />
            </div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Phê duyệt nhiệm vụ</span>
            <Tag color="warning" style={{ marginLeft: 8 }}>{pendingMissions.length} chờ xử lý</Tag>
          </div>
        }
      >
        {pendingMissions.length === 0 ? (
          <Empty description={<Text style={{ color: '#999' }}>Không có nhiệm vụ nào chờ phê duyệt</Text>} />
        ) : (
          <Row gutter={[16, 16]}>
            {pendingMissions.map(mission => {
              const proposal = proposals.find(p => p.missionId === mission.id);
              const statusCfg = missionStatusConfig[mission.status];
              const typeCfg = missionTypeConfig[mission.missionType];
              const priorityCfg = missionPriorityConfig[mission.priority];
              const complexityCfg = mission.complexity ? missionComplexityConfig[mission.complexity] : null;
              const scopeCfg = mission.executionScope ? executionScopeConfig[mission.executionScope] : null;
              const assignedDept = mission.assignedDepartment
                ? departments.find(d => d.id === mission.assignedDepartment)
                : null;

              return (
                <Col xs={24} key={mission.id}>
                  <Card
                    className="db-chart-card"
                    bordered={false}
                    style={{ borderLeft: `4px solid ${colors.navy}` }}
                    styles={{ body: { padding: 20 } }}
                  >
                    {/* Header row */}
                    <Row justify="space-between" align="top" style={{ marginBottom: 14 }}>
                      <Col>
                        <Text strong style={{ fontSize: 16, color: colors.navy, display: 'block' }}>{mission.code}</Text>
                        <Text style={{ fontSize: 14, color: '#333' }}>{mission.name}</Text>
                      </Col>
                      <Col>
                        <Space>
                          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                          <Tag color={priorityCfg.color}>{priorityCfg.label}</Tag>
                          <Button
                            size="small" type="text" icon={<EyeOutlined />}
                            onClick={() => navigate(`/missions/${mission.id}`)}
                          >
                            Xem chi tiết
                          </Button>
                        </Space>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      {/* Cột trái: Thông tin nhiệm vụ */}
                      <Col xs={24} md={12}>
                        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '14px 16px' }}>
                          <Row gutter={[12, 10]}>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                <TeamOutlined style={{ marginRight: 4 }} />Đơn vị yêu cầu
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{mission.requestingUnit}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                <ToolOutlined style={{ marginRight: 4 }} />Sản phẩm/Hệ thống
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{mission.equipmentType} x{mission.equipmentQuantity}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />Thời hạn
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatDate(mission.deadline)}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Loại NV</Text>
                              <Tag color={typeCfg.color} style={{ marginTop: 2, fontSize: 11 }}>{typeCfg.label}</Tag>
                            </Col>
                          </Row>
                        </div>
                      </Col>

                      {/* Cột phải: Phân loại & Đề xuất */}
                      <Col xs={24} md={12}>
                        {/* Kết quả phân loại */}
                        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                          <Text strong style={{ fontSize: 12, color: colors.navy, display: 'block', marginBottom: 8 }}>
                            <ApartmentOutlined style={{ marginRight: 4 }} />Kết quả phân loại
                          </Text>
                          <Row gutter={[8, 6]}>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 10 }}>Độ phức tạp</Text>
                              <div>{complexityCfg ? <Tag color={complexityCfg.color} style={{ fontSize: 11 }}>{complexityCfg.label}</Tag> : <Text type="secondary" style={{ fontSize: 11 }}>—</Text>}</div>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 10 }}>Phạm vi</Text>
                              <div>{scopeCfg ? <Tag color={scopeCfg.color} style={{ fontSize: 11 }}>{scopeCfg.label}</Tag> : <Text type="secondary" style={{ fontSize: 11 }}>—</Text>}</div>
                            </Col>
                            {assignedDept && (
                              <Col span={24}>
                                <Text type="secondary" style={{ fontSize: 10 }}>PX xử lý</Text>
                                <div><Text strong style={{ fontSize: 12, color: colors.navy }}>{assignedDept.name}</Text></div>
                              </Col>
                            )}
                          </Row>
                        </div>

                        {/* Đề xuất & dự toán */}
                        {proposal && (
                          <div style={{
                            background: `${colors.gold}0a`, borderRadius: 8,
                            padding: '10px 14px', borderLeft: `3px solid ${colors.gold}`,
                          }}>
                            <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>
                              Đề xuất: {proposal.code}
                            </Text>
                            <Space size={16}>
                              <div>
                                <Text style={{ fontSize: 14, fontWeight: 700, color: colors.navy }}>{formatCurrency(proposal.proposedPrice)}</Text>
                              </div>
                              <div>
                                <Text style={{ fontSize: 11, color: '#666' }}>
                                  <ThunderboltOutlined style={{ marginRight: 2 }} />{proposal.estimatedDuration} ngày
                                </Text>
                              </div>
                            </Space>
                          </div>
                        )}
                      </Col>
                    </Row>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => { setRejectingMission(mission); setRejectReason(''); }}
                      >
                        Từ chối / Yêu cầu bổ sung
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        style={{ background: colors.navy, borderColor: colors.navy }}
                        onClick={() => handleApprove(mission)}
                      >
                        Phê duyệt — chuyển lập đề xuất
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Modal từ chối - nhập lý do */}
      <Modal
        title="Từ chối / Yêu cầu chỉnh sửa bổ sung"
        open={!!rejectingMission}
        onCancel={() => { setRejectingMission(null); setRejectReason(''); }}
        onOk={handleRejectConfirm}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        destroyOnClose
      >
        {rejectingMission && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: colors.navy }}>{rejectingMission.code}</Text>
            <Text> — {rejectingMission.name}</Text>
          </div>
        )}
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Lý do từ chối / Nội dung cần bổ sung:</Text>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối hoặc yêu cầu chỉnh sửa bổ sung..."
        />
      </Modal>
    </div>
  );
};

export default MissionApproval;
