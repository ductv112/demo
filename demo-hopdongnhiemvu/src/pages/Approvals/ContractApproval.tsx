import React, { useMemo, useState } from 'react';
import {
  Card, Row, Col, Tag, Button, Typography, Space, Empty,
  message, Input, Modal,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, FileProtectOutlined,
  CalendarOutlined, TeamOutlined, DollarOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contracts } from '../../data/contracts';
import { missions, proposals } from '../../data/missions';
import {
  contractStatusConfig, formatDate, formatCurrency,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Contract } from '../../types';

const { Text } = Typography;

const ContractApproval: React.FC = () => {
  const navigate = useNavigate();
  const [rejectingContract, setRejectingContract] = useState<Contract | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingContracts = useMemo(() => {
    return contracts.filter(c => c.status === 'pending_approval');
  }, []);

  const handleApprove = (contract: Contract) => {
    message.success(`Đã phê duyệt hợp đồng ${contract.code} — chuyển sang ký kết`);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    message.error(`Đã từ chối hợp đồng ${rejectingContract?.code} — yêu cầu chỉnh sửa`);
    setRejectingContract(null);
    setRejectReason('');
  };

  const contractTypeLabels: Record<string, string> = {
    contract: 'Hợp đồng',
    assignment: 'Quyết định giao NV',
  };

  return (
    <div>
      <Card
        className="db-chart-card" bordered={false} style={{ marginBottom: 20 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16,
            }}><FileProtectOutlined /></div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Phê duyệt hợp đồng</span>
            <Tag color="orange" style={{ marginLeft: 8 }}>{pendingContracts.length} chờ xử lý</Tag>
          </div>
        }
      >
        {pendingContracts.length === 0 ? (
          <Empty description={<Text style={{ color: '#999' }}>Không có hợp đồng nào chờ phê duyệt</Text>} />
        ) : (
          <Row gutter={[16, 16]}>
            {pendingContracts.map(contract => {
              const statusCfg = contractStatusConfig[contract.status];
              const mission = missions.find(m => m.id === contract.missionId);
              const proposal = proposals.find(p => p.id === contract.proposalId);

              return (
                <Col xs={24} key={contract.id}>
                  <Card className="db-chart-card" bordered={false}
                    style={{ borderLeft: `4px solid ${colors.gold}` }}
                    styles={{ body: { padding: 20 } }}>
                    {/* Header */}
                    <Row justify="space-between" align="top" style={{ marginBottom: 14 }}>
                      <Col>
                        <Text strong style={{ fontSize: 16, color: colors.navy, display: 'block' }}>{contract.code}</Text>
                        <Text style={{ fontSize: 14, color: '#333' }}>{contract.name}</Text>
                      </Col>
                      <Col>
                        <Space>
                          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                          <Tag>{contractTypeLabels[contract.contractType]}</Tag>
                          <Button size="small" type="text" icon={<EyeOutlined />}
                            onClick={() => navigate(`/contracts/${contract.id}`)}>
                            Xem chi tiết
                          </Button>
                        </Space>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      {/* Cột trái: Thông tin HĐ */}
                      <Col xs={24} md={12}>
                        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '14px 16px' }}>
                          <Row gutter={[12, 10]}>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}><TeamOutlined style={{ marginRight: 4 }} />Đơn vị đặt hàng</Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{contract.partnerUnit}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}><CalendarOutlined style={{ marginRight: 4 }} />Thời gian</Text>
                              <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}><DollarOutlined style={{ marginRight: 4 }} />Giá trị HĐ</Text>
                              <Text style={{ fontSize: 14, fontWeight: 700, color: colors.navy }}>{formatCurrency(contract.contractValue)}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tạm ứng</Text>
                              <Text style={{ fontSize: 13, fontWeight: 600, color: colors.gold }}>{formatCurrency(contract.advancePayment)}</Text>
                            </Col>
                          </Row>
                        </div>
                      </Col>

                      {/* Cột phải: Liên kết NV + ĐX */}
                      <Col xs={24} md={12}>
                        {mission && (
                          <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
                            <Text strong style={{ fontSize: 12, color: colors.navy, display: 'block', marginBottom: 6 }}>Nhiệm vụ liên kết</Text>
                            <Text style={{ fontSize: 12 }}>{mission.code} — {mission.name}</Text>
                          </div>
                        )}
                        {proposal && (
                          <div style={{ background: `${colors.gold}0a`, borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid ${colors.gold}` }}>
                            <Text strong style={{ fontSize: 12, color: colors.navy, display: 'block', marginBottom: 6 }}>Đề xuất & Dự toán</Text>
                            <Space size={16}>
                              <div>
                                <Text type="secondary" style={{ fontSize: 10 }}>Tổng dự toán</Text>
                                <div><Text strong style={{ color: colors.navy }}>{formatCurrency(proposal.totalCost)}</Text></div>
                              </div>
                              <div>
                                <Text type="secondary" style={{ fontSize: 10 }}>Giá đề xuất</Text>
                                <div><Text strong style={{ color: colors.gold }}>{formatCurrency(proposal.proposedPrice)}</Text></div>
                              </div>
                              <div>
                                <Text type="secondary" style={{ fontSize: 10 }}>Thời gian</Text>
                                <div><Text strong>{proposal.estimatedDuration} ngày</Text></div>
                              </div>
                            </Space>
                          </div>
                        )}
                      </Col>
                    </Row>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                      <Button danger icon={<CloseCircleOutlined />}
                        onClick={() => { setRejectingContract(contract); setRejectReason(''); }}>
                        Từ chối / Yêu cầu bổ sung
                      </Button>
                      <Button type="primary" icon={<CheckCircleOutlined />}
                        style={{ background: colors.navy, borderColor: colors.navy }}
                        onClick={() => handleApprove(contract)}>
                        Phê duyệt — chuyển ký kết
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
        title="Từ chối / Yêu cầu chỉnh sửa hợp đồng"
        open={!!rejectingContract}
        onCancel={() => { setRejectingContract(null); setRejectReason(''); }}
        onOk={handleRejectConfirm}
        okText="Xác nhận từ chối" okButtonProps={{ danger: true }} cancelText="Hủy"
        destroyOnClose
      >
        {rejectingContract && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: colors.navy }}>{rejectingContract.code}</Text>
            <Text> — {rejectingContract.name}</Text>
          </div>
        )}
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Lý do từ chối / Nội dung cần bổ sung:</Text>
        <Input.TextArea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối hoặc yêu cầu chỉnh sửa..." />
      </Modal>
    </div>
  );
};

export default ContractApproval;
