import React, { useMemo, useState } from 'react';
import {
  Card, Row, Col, Tag, Button, Typography, Space, Empty,
  message, Input, Modal,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, SolutionOutlined,
  ToolOutlined, DollarOutlined, FieldTimeOutlined,
  TeamOutlined, ThunderboltOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { missions, proposals } from '../../data/missions';
import { departments } from '../../data/departments';
import {
  proposalStatusConfig, missionTypeConfig,
  formatCurrency, formatNumber,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Proposal, ProposalStatus, MissionType } from '../../types';

const { Text } = Typography;

const ProposalApproval: React.FC = () => {
  const navigate = useNavigate();
  const [rejectingProposal, setRejectingProposal] = useState<Proposal | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Chỉ lọc đề xuất đã trình duyệt
  const pendingProposals = useMemo(() => {
    return proposals.filter(p => ['pending_cost_review', 'cost_reviewing', 'cost_reviewed', 'pending_approval'].includes(p.status));
  }, []);

  const handleApprove = (proposal: Proposal) => {
    message.success(`Đã phê duyệt đề xuất & dự toán ${proposal.code} — chuyển sang giai đoạn ký hợp đồng`);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối hoặc yêu cầu bổ sung');
      return;
    }
    message.error(`Đã từ chối đề xuất ${rejectingProposal?.code} — yêu cầu chỉnh sửa bổ sung`);
    setRejectingProposal(null);
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
              <SolutionOutlined />
            </div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Phê duyệt đề xuất & dự toán</span>
            <Tag color="warning" style={{ marginLeft: 8 }}>{pendingProposals.length} chờ xử lý</Tag>
          </div>
        }
      >
        {pendingProposals.length === 0 ? (
          <Empty description={<Text style={{ color: '#999' }}>Không có đề xuất nào chờ phê duyệt</Text>} />
        ) : (
          <Row gutter={[16, 16]}>
            {pendingProposals.map(proposal => {
              const mission = missions.find(m => m.id === proposal.missionId);
              const statusCfg = proposalStatusConfig[proposal.status as ProposalStatus];
              const typeCfg = mission ? missionTypeConfig[mission.missionType as MissionType] : null;
              const assignedDept = mission?.assignedDepartment
                ? departments.find(d => d.id === mission.assignedDepartment)
                : null;
              const profitMargin = proposal.profitMargin
                || (proposal.totalCost > 0 ? (((proposal.proposedPrice - proposal.totalCost) / proposal.totalCost) * 100) : 0);

              return (
                <Col xs={24} key={proposal.id}>
                  <Card
                    className="db-chart-card"
                    bordered={false}
                    style={{ borderLeft: `4px solid ${colors.navy}` }}
                    styles={{ body: { padding: 20 } }}
                  >
                    {/* Header row */}
                    <Row justify="space-between" align="top" style={{ marginBottom: 14 }}>
                      <Col>
                        <Text strong style={{ fontSize: 16, color: colors.navy, display: 'block' }}>{proposal.code}</Text>
                        <Text style={{ fontSize: 14, color: '#333' }}>{mission?.name || 'Nhiệm vụ không xác định'}</Text>
                      </Col>
                      <Col>
                        <Space>
                          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                          {typeCfg && <Tag color={typeCfg.color}>{typeCfg.label}</Tag>}
                          <Button
                            size="small" type="text" icon={<EyeOutlined />}
                            onClick={() => navigate(`/proposals/${proposal.id}`)}
                          >
                            Xem ĐX
                          </Button>
                          <Button
                            size="small" type="primary"
                            style={{ background: colors.navy, borderColor: colors.navy }}
                            onClick={() => navigate(`/approval-sign/workflow/${proposal.id}`)}
                          >
                            Xử lý
                          </Button>
                        </Space>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      {/* Cột trái: Thông tin nhiệm vụ & phương án */}
                      <Col xs={24} md={12}>
                        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                          <Row gutter={[12, 10]}>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                <TeamOutlined style={{ marginRight: 4 }} />Đơn vị yêu cầu
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{mission?.requestingUnit || '—'}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                <ToolOutlined style={{ marginRight: 4 }} />Sản phẩm/Hệ thống
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>
                                {mission ? `${mission.equipmentType} x${mission.equipmentQuantity}` : '—'}
                              </Text>
                            </Col>
                            {assignedDept && (
                              <Col span={12}>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>PX xử lý</Text>
                                <Text strong style={{ fontSize: 12, color: colors.navy }}>{assignedDept.name}</Text>
                              </Col>
                            )}
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                <FieldTimeOutlined style={{ marginRight: 4 }} />Khối lượng CV
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{proposal.workVolumes.length} hạng mục</Text>
                            </Col>
                          </Row>
                        </div>

                        {/* Tóm tắt phương án */}
                        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px' }}>
                          <Text strong style={{ fontSize: 11, color: colors.navy, display: 'block', marginBottom: 4 }}>
                            <ToolOutlined style={{ marginRight: 4 }} />Phương án kỹ thuật
                          </Text>
                          <Text style={{ fontSize: 12, color: '#555' }}>
                            {proposal.technicalPlan.length > 120
                              ? proposal.technicalPlan.substring(0, 120) + '...'
                              : proposal.technicalPlan
                            }
                          </Text>
                        </div>
                      </Col>

                      {/* Cột phải: Chi phí & giá thành */}
                      <Col xs={24} md={12}>
                        {/* Cost breakdown */}
                        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                          <Text strong style={{ fontSize: 12, color: colors.navy, display: 'block', marginBottom: 8 }}>
                            <DollarOutlined style={{ marginRight: 4 }} />Cơ cấu chi phí
                          </Text>
                          <Row gutter={[8, 6]}>
                            {[
                              { label: 'Vật tư', value: proposal.materialCost, color: '#2563eb' },
                              { label: 'Nhân công', value: proposal.laborCost, color: '#059669' },
                              { label: 'Thiết bị', value: proposal.equipmentCost, color: '#d97706' },
                              { label: 'Chi phí chung', value: proposal.overheadCost, color: '#7c3aed' },
                            ].map((item, idx) => (
                              <Col span={12} key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text type="secondary" style={{ fontSize: 11 }}>{item.label}</Text>
                                  <Text style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{formatNumber(item.value)} tr</Text>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>

                        {/* Giá thành tổng hợp */}
                        <div style={{
                          background: `${colors.gold}0a`, borderRadius: 8,
                          padding: '12px 14px', borderLeft: `3px solid ${colors.gold}`,
                        }}>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>Tổng dự toán</Text>
                              <Text style={{ fontSize: 14, fontWeight: 700, color: colors.navy }}>{formatCurrency(proposal.totalCost)}</Text>
                            </Col>
                            <Col span={8}>
                              <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>Giá đề xuất</Text>
                              <Text style={{ fontSize: 14, fontWeight: 700, color: colors.gold }}>{formatCurrency(proposal.proposedPrice)}</Text>
                            </Col>
                            <Col span={8}>
                              <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>Lợi nhuận</Text>
                              <Space size={4}>
                                <ThunderboltOutlined style={{ color: colors.success, fontSize: 12 }} />
                                <Text style={{ fontSize: 14, fontWeight: 700, color: colors.success }}>{typeof profitMargin === 'number' ? profitMargin.toFixed(1) : profitMargin}%</Text>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => { setRejectingProposal(proposal); setRejectReason(''); }}
                      >
                        Từ chối / Yêu cầu chỉnh sửa
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        style={{ background: colors.navy, borderColor: colors.navy }}
                        onClick={() => handleApprove(proposal)}
                      >
                        Phê duyệt đề xuất & dự toán
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Modal từ chối */}
      <Modal
        title="Từ chối / Yêu cầu chỉnh sửa đề xuất"
        open={!!rejectingProposal}
        onCancel={() => { setRejectingProposal(null); setRejectReason(''); }}
        onOk={handleRejectConfirm}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        destroyOnClose
      >
        {rejectingProposal && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: colors.navy }}>{rejectingProposal.code}</Text>
            <Text> — {missions.find(m => m.id === rejectingProposal.missionId)?.name || ''}</Text>
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

export default ProposalApproval;
