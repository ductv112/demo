import React, { useState, useMemo } from 'react';
import {
  Card, Typography, Tag, Row, Col, Space, Tabs, Button, Empty, Descriptions, message,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, AuditOutlined,
  DollarOutlined, ShoppingCartOutlined, CalendarOutlined, UserOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { procurementPlans } from '../../data/procurementPlans';
import { supplyPlans } from '../../data/supplyPlans';
import { biddingPackages } from '../../data/bidding';
import { payments } from '../../data/payments';
import { formatCurrency, formatDate, procurementPlanStatusConfig, biddingStatusConfig, paymentStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const pageStyles = `
  .apv-card {
    border-radius: 12px;
    border: 1px solid ${colors.border};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 16px;
    overflow: hidden;
  }
  .apv-card:hover {
    box-shadow: 0 8px 24px rgba(27, 58, 92, 0.1);
    border-color: ${colors.navyLight};
  }
  .apv-header {
    padding: 14px 20px;
    background: ${colors.bgLight};
    border-bottom: 1px solid ${colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .apv-body {
    padding: 16px 20px;
  }
  .apv-actions {
    padding: 12px 20px;
    background: #fafafa;
    border-top: 1px solid ${colors.border};
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .apv-stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    cursor: default;
  }
  .apv-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .apv-stat-card .apv-bg-icon {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .apv-stat-card:hover .apv-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
`;

const Approvals: React.FC = () => {
  const { isDirector } = useUser();
  const [activeTab, setActiveTab] = useState('plans');

  // ═══════════════════════════════════════
  // PENDING ITEMS
  // ═══════════════════════════════════════
  const pendingPlans = useMemo(() => {
    return procurementPlans.filter(p => p.status === 'pending_approval');
  }, []);

  const pendingSupplyPlans = useMemo(() => {
    return supplyPlans.filter(p => p.status === 'pending_approval');
  }, []);

  const pendingBidding = useMemo(() => {
    return biddingPackages.filter(b => ['evaluating', 'approved'].includes(b.status) && b.status === 'evaluating');
  }, []);

  const pendingPayments = useMemo(() => {
    return payments.filter(p => ['pending', 'verified'].includes(p.status));
  }, []);

  const totalPending = pendingPlans.length + pendingSupplyPlans.length + pendingBidding.length + pendingPayments.length;

  // ═══════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════
  const handleApprove = (type: string, code: string) => {
    message.success(`Đã phê duyệt ${type}: ${code}`);
  };

  const handleReject = (type: string, code: string) => {
    message.error(`Đã từ chối ${type}: ${code}`);
  };

  // ═══════════════════════════════════════
  // RENDER — Director access only
  // ═══════════════════════════════════════
  if (!isDirector) {
    return (
      <div style={{ padding: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>Phê duyệt</Title>
        </div>
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 60 }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: colors.warning, marginBottom: 16 }} />
          <div><Title level={5} style={{ color: colors.navy }}>Không có quyền truy cập</Title></div>
          <Text type="secondary">Chức năng phê duyệt chỉ dành cho Ban Giám đốc. Vui lòng chuyển vai trò để truy cập.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <style>{pageStyles}</style>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: colors.navy }}>Phê duyệt</Title>
        <Text type="secondary">Phê duyệt kế hoạch mua sắm, đấu thầu và thanh toán</Text>
      </div>

      {/* Summary stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { title: 'Chờ phê duyệt', value: totalPending, icon: <AuditOutlined />, gradient: `linear-gradient(135deg, ${colors.warning}, #ffc53d)` },
          { title: 'Kế hoạch chờ duyệt', value: pendingPlans.length + pendingSupplyPlans.length, icon: <FileTextOutlined />, gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` },
          { title: 'Đấu thầu chờ duyệt', value: pendingBidding.length, icon: <ShoppingCartOutlined />, gradient: `linear-gradient(135deg, #0891b2, #22d3ee)` },
          { title: 'Thanh toán chờ duyệt', value: pendingPayments.length, icon: <DollarOutlined />, gradient: `linear-gradient(135deg, #7c3aed, #a78bfa)` },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card className="apv-stat-card" styles={{ body: { padding: 20 } }} style={{ background: card.gradient }}>
              <div style={{ position: 'relative' }}>
                <div className="apv-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8, fontSize: 64, opacity: 0.1, color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                  color: '#fff', fontSize: 16,
                }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.title}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: 'plans',
            label: (
              <Space size={6}>
                <FileTextOutlined />
                <span>Kế hoạch ({pendingPlans.length + pendingSupplyPlans.length})</span>
              </Space>
            ),
            children: (
              <div>
                {/* Procurement Plans */}
                {pendingPlans.map(plan => {
                  const statusCfg = procurementPlanStatusConfig[plan.status];
                  return (
                    <Card key={plan.id} className="apv-card" styles={{ body: { padding: 0 } }}>
                      <div className="apv-header">
                        <Space size={12}>
                          <Text strong style={{ color: colors.navy, fontSize: 15 }}>{plan.code}</Text>
                          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                          <Tag color="blue">Kế hoạch mua sắm</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />{formatDate(plan.createdDate)}
                        </Text>
                      </div>
                      <div className="apv-body">
                        <Title level={5} style={{ margin: '0 0 8px', color: colors.navy }}>{plan.title}</Title>
                        <Row gutter={24}>
                          <Col xs={24} md={12}>
                            <Descriptions size="small" column={1}>
                              <Descriptions.Item label="Người lập">
                                <Space size={4}><UserOutlined /><Text>{plan.createdBy}</Text></Space>
                              </Descriptions.Item>
                              <Descriptions.Item label="Số mặt hàng">
                                <Text strong>{plan.items.length} mặt hàng</Text>
                              </Descriptions.Item>
                            </Descriptions>
                          </Col>
                          <Col xs={24} md={12}>
                            <Descriptions size="small" column={1}>
                              <Descriptions.Item label="Tổng dự toán">
                                <Text strong style={{ color: colors.navy, fontSize: 15 }}>{formatCurrency(plan.totalEstimated)}</Text>
                              </Descriptions.Item>
                              {plan.note && (
                                <Descriptions.Item label="Ghi chú">
                                  <Text style={{ fontSize: 12 }}>{plan.note}</Text>
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          </Col>
                        </Row>
                      </div>
                      <div className="apv-actions">
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject('kế hoạch', plan.code)}>
                          Từ chối
                        </Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove('kế hoạch', plan.code)}>
                          Phê duyệt
                        </Button>
                      </div>
                    </Card>
                  );
                })}

                {/* Supply Plans pending approval */}
                {pendingSupplyPlans.map(plan => (
                  <Card key={plan.id} className="apv-card" styles={{ body: { padding: 0 } }}>
                    <div className="apv-header">
                      <Space size={12}>
                        <Text strong style={{ color: colors.navy, fontSize: 15 }}>{plan.code}</Text>
                        <Tag color="warning">Chờ phê duyệt</Tag>
                        <Tag color="cyan">KH vật tư</Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />{formatDate(plan.createdDate)}
                      </Text>
                    </div>
                    <div className="apv-body">
                      <Title level={5} style={{ margin: '0 0 8px', color: colors.navy }}>{plan.title}</Title>
                      <Row gutter={24}>
                        <Col xs={24} md={12}>
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Nhiệm vụ liên quan">
                              <Text>{plan.relatedTask || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số mặt hàng">
                              <Text strong>{plan.items.length} mặt hàng</Text>
                            </Descriptions.Item>
                          </Descriptions>
                        </Col>
                        <Col xs={24} md={12}>
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Tổng giá trị">
                              <Text strong style={{ color: colors.navy, fontSize: 15 }}>{formatCurrency(plan.totalEstimated)}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người lập">
                              <Text>{plan.createdBy}</Text>
                            </Descriptions.Item>
                          </Descriptions>
                        </Col>
                      </Row>
                    </div>
                    <div className="apv-actions">
                      <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject('KH vật tư', plan.code)}>
                        Từ chối
                      </Button>
                      <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove('KH vật tư', plan.code)}>
                        Phê duyệt
                      </Button>
                    </div>
                  </Card>
                ))}

                {pendingPlans.length === 0 && pendingSupplyPlans.length === 0 && (
                  <Card style={{ borderRadius: 12 }}>
                    <Empty description="Không có kế hoạch nào chờ phê duyệt" />
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: 'bidding',
            label: (
              <Space size={6}>
                <ShoppingCartOutlined />
                <span>Đấu thầu ({pendingBidding.length})</span>
              </Space>
            ),
            children: (
              <div>
                {pendingBidding.map(bid => {
                  const statusCfg = biddingStatusConfig[bid.status];
                  const bestSubmission = [...bid.submissions].sort((a, b) => b.totalScore - a.totalScore)[0];
                  return (
                    <Card key={bid.id} className="apv-card" styles={{ body: { padding: 0 } }}>
                      <div className="apv-header">
                        <Space size={12}>
                          <Text strong style={{ color: colors.navy, fontSize: 15 }}>{bid.code}</Text>
                          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />{formatDate(bid.createdDate)}
                        </Text>
                      </div>
                      <div className="apv-body">
                        <Title level={5} style={{ margin: '0 0 8px', color: colors.navy }}>{bid.title}</Title>
                        <Row gutter={24}>
                          <Col xs={24} md={12}>
                            <Descriptions size="small" column={1}>
                              <Descriptions.Item label="Giá trị dự toán">
                                <Text strong style={{ color: colors.navy }}>{formatCurrency(bid.estimatedValue)}</Text>
                              </Descriptions.Item>
                              <Descriptions.Item label="Số HSĐT">
                                <Text strong>{bid.submissions.length} hồ sơ</Text>
                              </Descriptions.Item>
                            </Descriptions>
                          </Col>
                          <Col xs={24} md={12}>
                            {bestSubmission && (
                              <Descriptions size="small" column={1}>
                                <Descriptions.Item label="NCC điểm cao nhất">
                                  <Text strong style={{ color: colors.success }}>{bestSubmission.supplierName}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Điểm tổng hợp">
                                  <Text strong>{bestSubmission.totalScore} điểm</Text>
                                  {' - '}
                                  <Text type="secondary">{formatCurrency(bestSubmission.totalPrice)}</Text>
                                </Descriptions.Item>
                              </Descriptions>
                            )}
                          </Col>
                        </Row>
                      </div>
                      <div className="apv-actions">
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject('gói thầu', bid.code)}>
                          Từ chối
                        </Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove('gói thầu', bid.code)}>
                          Phê duyệt
                        </Button>
                      </div>
                    </Card>
                  );
                })}

                {pendingBidding.length === 0 && (
                  <Card style={{ borderRadius: 12 }}>
                    <Empty description="Không có gói thầu nào chờ phê duyệt" />
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: 'payments',
            label: (
              <Space size={6}>
                <DollarOutlined />
                <span>Thanh toán ({pendingPayments.length})</span>
              </Space>
            ),
            children: (
              <div>
                {pendingPayments.map(pay => {
                  const statusCfg = paymentStatusConfig[pay.status];
                  const allMatch = pay.matchResult.contractMatch && pay.matchResult.warehouseMatch && pay.matchResult.qualityMatch;
                  return (
                    <Card key={pay.id} className="apv-card" styles={{ body: { padding: 0 } }}>
                      <div className="apv-header">
                        <Space size={12}>
                          <Text strong style={{ color: colors.navy, fontSize: 15 }}>{pay.code}</Text>
                          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                          {allMatch
                            ? <Tag color="success" icon={<CheckCircleOutlined />}>Đối soát đạt</Tag>
                            : <Tag color="warning" icon={<ExclamationCircleOutlined />}>Chưa đối soát đủ</Tag>
                          }
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />{formatDate(pay.invoiceDate)}
                        </Text>
                      </div>
                      <div className="apv-body">
                        <Row gutter={24}>
                          <Col xs={24} md={12}>
                            <Descriptions size="small" column={1}>
                              <Descriptions.Item label="Hợp đồng">
                                <Text style={{ color: colors.info }}>{pay.contractCode}</Text>
                              </Descriptions.Item>
                              <Descriptions.Item label="Nhà cung cấp">
                                <Text strong>{pay.supplierName}</Text>
                              </Descriptions.Item>
                              <Descriptions.Item label="Số hóa đơn">
                                <Text>{pay.invoiceNumber}</Text>
                              </Descriptions.Item>
                            </Descriptions>
                          </Col>
                          <Col xs={24} md={12}>
                            <Descriptions size="small" column={1}>
                              <Descriptions.Item label="Giá trị hóa đơn">
                                <Text strong>{formatCurrency(pay.invoiceValue)}</Text>
                              </Descriptions.Item>
                              <Descriptions.Item label="Số tiền thanh toán">
                                <Text strong style={{ color: colors.navy, fontSize: 15 }}>
                                  {pay.paymentAmount > 0 ? formatCurrency(pay.paymentAmount) : 'Chưa xác định'}
                                </Text>
                              </Descriptions.Item>
                              {pay.note && (
                                <Descriptions.Item label="Ghi chú">
                                  <Text style={{ fontSize: 12 }}>{pay.note}</Text>
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          </Col>
                        </Row>
                      </div>
                      <div className="apv-actions">
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject('thanh toán', pay.code)}>
                          Từ chối
                        </Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove('thanh toán', pay.code)}
                          disabled={!allMatch}
                        >
                          Phê duyệt
                        </Button>
                      </div>
                    </Card>
                  );
                })}

                {pendingPayments.length === 0 && (
                  <Card style={{ borderRadius: 12 }}>
                    <Empty description="Không có phiếu thanh toán nào chờ phê duyệt" />
                  </Card>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Approvals;
