import React, { useState } from 'react';
import {
  Card, Tag, Row, Col, Typography, Space, Button, Empty, Descriptions, Steps, Table, Switch, message,
} from 'antd';
import {
  ArrowLeftOutlined, DollarOutlined, CalendarOutlined,
  UserOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FileTextOutlined, SendOutlined, StarOutlined,
  DownloadOutlined, BankOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { payments } from '../../data/payments';
import { contracts } from '../../data/contracts';
import { deliveryTrackings, defectRequests } from '../../data/receiving';
import { formatCurrency, formatDate, paymentStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Chuyển khoản',
  advance: 'Tạm ứng',
  direct: 'Thanh toán trực tiếp',
};

const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isProcurement } = useUser();

  const payment = payments.find(p => p.id === id);

  if (!payment) {
    return (
      <div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/payments')} style={{ padding: 0, marginBottom: 16 }}>Quay lại danh sách</Button>
        <Empty description="Không tìm thấy phiếu thanh toán" />
      </div>
    );
  }

  const statusCfg = paymentStatusConfig[payment.status];
  const allMatch = payment.matchResult.contractMatch && payment.matchResult.warehouseMatch && payment.matchResult.qualityMatch;

  // Xác định bước hiện tại trong flow
  const getCurrentStep = () => {
    switch (payment.status) {
      case 'draft': return 0;
      case 'verifying': return 1;
      case 'verified': return 2;
      case 'requested': return 3;
      case 'approved': return 4;
      case 'paid': return 5;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const MatchIcon = ({ match }: { match: boolean }) => (
    match
      ? <CheckCircleOutlined style={{ color: colors.success, fontSize: 16 }} />
      : <CloseCircleOutlined style={{ color: colors.danger, fontSize: 16 }} />
  );

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/payments')} style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}>
        Quay lại danh sách
      </Button>

      {/* Hero Header */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarOutlined style={{ fontSize: 24, color: colors.goldLight }} />
            </div>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20 }}>Chi tiết phiếu thanh toán</Title>
              <Space size={8} wrap style={{ marginTop: 10 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>{payment.code}</Tag>
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                {allMatch ? <Tag color="success" icon={<CheckCircleOutlined />}>Đối soát đạt</Tag> : <Tag color="warning">Chưa đối soát đủ</Tag>}
              </Space>
            </div>
            <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Giá trị hóa đơn</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{formatCurrency(payment.invoiceValue)}</div>
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Số tiền thanh toán</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.goldLight, lineHeight: 1.1 }}>{payment.paymentAmount > 0 ? formatCurrency(payment.paymentAmount) : '--'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ padding: '12px 32px', background: colors.bgLight, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>{payment.note || ''}</Text>
          <Space size={8}>
            {isProcurement && payment.status === 'draft' && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => message.success('Đã bắt đầu đối soát')}>Đối soát</Button>
            )}
            {isProcurement && payment.status === 'verified' && (
              <Button type="primary" icon={<SendOutlined />} onClick={() => message.success('Đã gửi đề nghị thanh toán đến Phòng TC-KT')}>Gửi đề nghị TT</Button>
            )}
            {isProcurement && payment.status === 'approved' && (
              <Button type="primary" icon={<BankOutlined />} onClick={() => message.success('Đã xác nhận thanh toán thành công')}>Xác nhận đã TT</Button>
            )}
            {isProcurement && payment.status === 'paid' && !payment.supplierRated && (
              <Button icon={<StarOutlined />} onClick={() => message.success(`Đã mở đánh giá NCC ${payment.supplierName}`)}>Đánh giá NCC</Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Tiến trình xử lý */}
      <Card
        title={<Space size={8}><FileTextOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy, fontSize: 15 }}>Tiến trình xử lý</Text></Space>}
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        <Steps
          current={getCurrentStep()}
          status={payment.status === 'rejected' ? 'error' : 'process'}
          size="small"
          items={[
            { title: 'Nhập hóa đơn', description: payment.createdDate ? formatDate(payment.createdDate) : '' },
            { title: 'Đối soát', description: payment.verifiedDate ? formatDate(payment.verifiedDate) : '' },
            { title: 'Hoàn tất đối soát', description: allMatch ? 'Đạt' : 'Chưa đủ' },
            { title: 'Gửi đề nghị TT', description: payment.requestedDate ? formatDate(payment.requestedDate) : '' },
            { title: 'TC-KT duyệt', description: payment.approvedDate ? formatDate(payment.approvedDate) : '' },
            { title: 'Đã thanh toán', description: payment.paymentDate ? formatDate(payment.paymentDate) : '' },
          ]}
        />
      </Card>

      {/* Đối soát — 3 bảng riêng biệt */}
      {(() => {
        const contract = contracts.find(c => c.id === payment.contractId);
        const delivery = payment.deliveryNo && contract
          ? contract.deliveries.find(d => d.deliveryNo === payment.deliveryNo)
          : null;
        const tracking = deliveryTrackings.find(d => d.contractId === payment.contractId && d.deliveryNo === payment.deliveryNo);
        const defects = defectRequests.filter(d => d.contractId === payment.contractId && d.status !== 'resolved' && d.status !== 'closed');
        const isEditable = payment.status === 'verifying' || payment.status === 'draft';

        if (!contract) return null;

        const acceptedValue = delivery
          ? delivery.items.reduce((s, i) => {
              const ci = contract.items.find(c => c.materialId === i.materialId);
              return s + (ci ? ci.unitPrice * i.acceptedQty : 0);
            }, 0)
          : 0;

        const tableData = [
          { key: 'doc_number', label: 'Số hiệu', invoice: payment.invoiceNumber, contract: contract.code, acceptance: tracking ? `BB-NT-${tracking.deliveryId}` : '--' },
          { key: 'date', label: 'Ngày', invoice: formatDate(payment.invoiceDate), contract: formatDate(contract.signedDate), acceptance: tracking?.storedDate ? formatDate(tracking.storedDate) : '--' },
          { key: 'supplier', label: 'Nhà cung cấp', invoice: payment.supplierName, contract: contract.supplierName, acceptance: tracking?.receivedBy || '--' },
          { key: 'delivery', label: 'Đợt giao', invoice: payment.deliveryNo ? `Đợt ${payment.deliveryNo}` : '--', contract: delivery ? `Đợt ${delivery.deliveryNo} — KH: ${formatDate(delivery.plannedDate)}` : 'Toàn bộ HĐ', acceptance: delivery?.actualDate ? `Giao: ${formatDate(delivery.actualDate)}` : 'Chưa giao' },
          { key: 'value', label: 'Giá trị', invoice: `${formatCurrency(payment.invoiceValue)}`, contract: `${formatCurrency(contract.totalValue)}`, acceptance: acceptedValue > 0 ? `${acceptedValue.toFixed(1)} tr` : '--', highlight: true },
          { key: 'warehouse', label: 'Kho nhận', invoice: '--', contract: '--', acceptance: tracking ? `${tracking.warehouseCode || '--'}` : '--' },
          { key: 'quality', label: 'Chất lượng', invoice: '--', contract: `${contract.items.length} loại VT`, acceptance: tracking?.qcResult === 'pass' ? 'Đạt' : tracking?.qcResult === 'partial' ? 'Đạt một phần' : tracking?.qcResult === 'fail' ? 'Không đạt' : 'Chưa KT' },
          { key: 'defect', label: 'Vật tư lỗi', invoice: '--', contract: '--', acceptance: defects.length > 0 ? `${defects.length} YC chưa xử lý` : 'Không có' },
          { key: 'payment_terms', label: 'Điều kiện TT', invoice: '--', contract: contract.paymentTerms, acceptance: '--' },
        ];

        return (
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: allMatch ? `linear-gradient(135deg, ${colors.success}, #10b981)` : 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {allMatch ? <CheckCircleOutlined style={{ fontSize: 14, color: '#fff' }} /> : <CloseCircleOutlined style={{ fontSize: 14, color: '#fff' }} />}
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Đối soát thanh toán</span>
                  <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 400 }}>So sánh thông tin giữa 3 tài liệu để xác nhận đủ điều kiện thanh toán</div>
                </div>
              </Space>
            }
            extra={<Tag color={allMatch ? 'success' : 'warning'} style={{ fontSize: 13, padding: '4px 16px' }}>{allMatch ? 'Đủ điều kiện' : 'Chưa đủ'}</Tag>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
          >
            <Table
              dataSource={tableData}
              rowKey="key"
              size="middle"
              pagination={false}
              columns={[
                {
                  title: 'Hạng mục', dataIndex: 'label', key: 'label', width: 150, fixed: 'left' as const,
                  render: (text: string) => <Text strong style={{ fontSize: 13, color: colors.navy }}>{text}</Text>,
                },
                {
                  title: (
                    <Space size={6}>
                      <DollarOutlined style={{ color: colors.gold }} />
                      <span>Hóa đơn NCC</span>
                      {payment.invoiceAttachment && (
                        <Button size="small" type="link" icon={<DownloadOutlined />} style={{ padding: 0, height: 'auto', fontSize: 11 }}
                          onClick={() => message.info(`Tải: ${payment.invoiceAttachment}`)}>Tải</Button>
                      )}
                    </Space>
                  ),
                  dataIndex: 'invoice', key: 'invoice', width: 200,
                  onHeaderCell: () => ({ style: { background: '#fffbe6' } }),
                  render: (text: string, record: any) => (
                    <Text style={{ fontSize: 13, fontWeight: record.highlight ? 700 : 400, color: record.highlight ? colors.navy : undefined }}>{text}</Text>
                  ),
                },
                {
                  title: (
                    <Space size={6}>
                      <FileTextOutlined style={{ color: colors.navy }} />
                      <span>Hợp đồng ({contract.code})</span>
                      <Button size="small" type="link" icon={<DownloadOutlined />} style={{ padding: 0, height: 'auto', fontSize: 11 }}
                        onClick={() => message.info(`Tải: HĐ ${contract.code}`)}>Tải</Button>
                    </Space>
                  ),
                  dataIndex: 'contract', key: 'contract', width: 250,
                  onHeaderCell: () => ({ style: { background: '#f0f7ff' } }),
                  render: (text: string, record: any) => (
                    <Text style={{ fontSize: 13, fontWeight: record.highlight ? 700 : 400, color: record.highlight ? colors.navy : undefined }}>{text}</Text>
                  ),
                },
                {
                  title: (
                    <Space size={6}>
                      <BankOutlined style={{ color: '#0891b2' }} />
                      <span>Biên bản nghiệm thu</span>
                      {tracking?.storedDate && (
                        <Button size="small" type="link" icon={<DownloadOutlined />} style={{ padding: 0, height: 'auto', fontSize: 11 }}
                          onClick={() => message.info('Tải biên bản nghiệm thu')}>Tải</Button>
                      )}
                    </Space>
                  ),
                  dataIndex: 'acceptance', key: 'acceptance', width: 220,
                  onHeaderCell: () => ({ style: { background: '#e6fffb' } }),
                  render: (text: string, record: any) => {
                    if (record.key === 'defect' && defects.length > 0) return <Text strong style={{ color: colors.danger, fontSize: 13 }}>{text}</Text>;
                    if (record.key === 'quality') {
                      if (text === 'Đạt') return <Tag color="success">Đạt</Tag>;
                      if (text === 'Đạt một phần') return <Tag color="warning">Đạt một phần</Tag>;
                      if (text === 'Không đạt') return <Tag color="error">Không đạt</Tag>;
                    }
                    return <Text style={{ fontSize: 13, fontWeight: record.highlight ? 700 : 400, color: record.highlight ? '#0891b2' : undefined }}>{text}</Text>;
                  },
                },
              ]}
            />

            {/* Footer: người đối soát + nút xác nhận */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {payment.verifiedBy ? (
                  <Text style={{ fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: colors.success, marginRight: 6 }} />
                    Người đối soát: <Text strong>{payment.verifiedBy}</Text>
                    {payment.verifiedDate && <> | Ngày: {formatDate(payment.verifiedDate)}</>}
                    {payment.verifiedValue > 0 && <> | Giá trị: <Text strong style={{ color: colors.navy }}>{formatCurrency(payment.verifiedValue)}</Text></>}
                  </Text>
                ) : (
                  <Text type="secondary" style={{ fontSize: 13 }}>So sánh 3 cột tài liệu ở trên, sau đó xác nhận đối soát</Text>
                )}
              </div>
              {isEditable && (
                <Button type="primary" icon={<CheckCircleOutlined />} size="large"
                  onClick={() => message.success('Đã xác nhận hoàn tất đối soát')}>
                  Xác nhận đối soát
                </Button>
              )}
            </div>
          </Card>
        );
      })()}

      {/* Nội dung chính — 2 cột */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        {/* Cột trái: Thông tin hóa đơn + hợp đồng */}
        <Col xs={24} md={14}>
          <Card
            title={<Space size={8}><FileTextOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy, fontSize: 15 }}>Thông tin hóa đơn & hợp đồng</Text></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Row gutter={[0, 20]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Mã phiếu thanh toán:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginTop: 4 }}>{payment.code}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Hợp đồng:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong style={{ fontSize: 15, color: colors.navy, cursor: 'pointer' }} onClick={() => navigate(`/contracts/${payment.contractId}`)}>
                    {payment.contractCode}
                  </Text>
                  {payment.deliveryNo && <Tag style={{ marginLeft: 8 }}>Đợt {payment.deliveryNo}</Tag>}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Nhà cung cấp:</Text>
                <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{payment.supplierName}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Hình thức thanh toán:</Text>
                <div style={{ fontSize: 15, marginTop: 4 }}>{paymentMethodLabels[payment.paymentMethod]}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Số hóa đơn:</Text>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{payment.invoiceNumber}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Ngày hóa đơn:</Text>
                <div style={{ fontSize: 15, marginTop: 4 }}>{formatDate(payment.invoiceDate)}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>Giá trị hóa đơn:</Text>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.navy, marginTop: 4 }}>{formatCurrency(payment.invoiceValue)}</div>
              </Col>
              {payment.invoiceAttachment && (
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13 }}>File hóa đơn:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Button size="small" icon={<DownloadOutlined />} onClick={() => message.info(`Đang tải: ${payment.invoiceAttachment}`)}>
                      {payment.invoiceAttachment}
                    </Button>
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Thanh toán */}
          {(payment.paymentDate || payment.transactionRef) && (
            <Card
              title={<Space size={8}><BankOutlined style={{ color: colors.success }} /><Text strong style={{ color: colors.navy, fontSize: 15 }}>Thông tin thanh toán</Text></Space>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <Row gutter={[0, 16]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13 }}>Số tiền thanh toán:</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors.success, marginTop: 4 }}>{formatCurrency(payment.paymentAmount)}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 13 }}>Ngày thanh toán:</Text>
                  <div style={{ fontSize: 15, marginTop: 4 }}>{payment.paymentDate ? formatDate(payment.paymentDate) : '--'}</div>
                </Col>
                {payment.transactionRef && (
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: 13 }}>Mã giao dịch:</Text>
                    <div style={{ fontSize: 15, fontWeight: 500, color: colors.navy, marginTop: 4 }}>{payment.transactionRef}</div>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </Col>

        {/* Cột phải: Phê duyệt + Đánh giá */}
        <Col xs={24} md={10}>
          {/* Phê duyệt */}
          <Card
            title={<Space size={8}><UserOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy, fontSize: 15 }}>Phê duyệt & Đề nghị</Text></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Người tạo phiếu:</Text>
                <div style={{ fontSize: 14, marginTop: 4 }}>{payment.createdBy} | {formatDate(payment.createdDate)}</div>
              </div>
              {payment.requestedBy && (
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>Người gửi đề nghị TT:</Text>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{payment.requestedBy} | {payment.requestedDate ? formatDate(payment.requestedDate) : '--'}</div>
                </div>
              )}
              {payment.approvedBy && (
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>Người duyệt (TC-KT):</Text>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{payment.approvedBy} | {payment.approvedDate ? formatDate(payment.approvedDate) : '--'}</div>
                </div>
              )}
            </Space>
          </Card>

          {/* Đánh giá NCC */}
          <Card
            title={<Space size={8}><StarOutlined style={{ color: colors.gold }} /><Text strong style={{ color: colors.navy, fontSize: 15 }}>Đánh giá NCC</Text></Space>}
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            {payment.supplierRated ? (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 12px' }}>Đã đánh giá {payment.supplierName}</Tag>
            ) : payment.status === 'paid' ? (
              <div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Chưa đánh giá NCC sau thanh toán</Text>
                <Button icon={<StarOutlined />} onClick={() => message.success(`Đã mở đánh giá NCC ${payment.supplierName}`)}>
                  Đánh giá {payment.supplierName}
                </Button>
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>Đánh giá NCC sẽ thực hiện sau khi thanh toán hoàn tất</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentDetail;
