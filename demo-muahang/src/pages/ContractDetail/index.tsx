import React, { useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Progress,
  Button,
  Breadcrumb,
  Tabs,
  Table,
  Descriptions,
  Empty,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarryOutOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  EditOutlined,
  StopOutlined,
  AuditOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { contracts } from '../../data/contracts';
import { payments } from '../../data/payments';
import { defectRequests } from '../../data/receiving';
import { formatCurrency, formatDate, contractStatusConfig, paymentStatusConfig, contractTypeConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ContractDelivery, ContractDeliveryItem } from '../../types';

const { Title, Text } = Typography;

const deliveryStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ giao', color: 'default' },
  partial: { label: 'Giao một phần', color: 'warning' },
  delivered: { label: 'Đã giao', color: 'success' },
  late: { label: 'Trễ hạn', color: 'error' },
  confirmed: { label: 'Đã xác nhận', color: 'success' },
};

const paymentMethodConfig: Record<string, string> = {
  transfer: 'Chuyển khoản',
  advance: 'Tạm ứng',
  direct: 'Thanh toán trực tiếp',
};

const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const contract = contracts.find((c) => c.id === id);
  const contractPayments = useMemo(
    () => payments.filter((p) => p.contractId === id),
    [id],
  );

  if (!contract) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/contracts')}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        <Card style={{ borderRadius: 14, textAlign: 'center', padding: 60 }}>
          <Empty description="Không tìm thấy hợp đồng" />
        </Card>
      </div>
    );
  }

  const statusConf = contractStatusConfig[contract.status];
  const progressPct =
    contract.totalValue > 0
      ? parseFloat(((contract.deliveredValue / contract.totalValue) * 100).toFixed(1))
      : 0;
  const paidPct =
    contract.totalValue > 0
      ? parseFloat(((contract.paidValue / contract.totalValue) * 100).toFixed(1))
      : 0;

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      send_sign: 'Đã gửi hợp đồng cho NCC ký',
      confirm_signed: 'Đã xác nhận hợp đồng đã ký',
      update_delivery: 'Đã cập nhật tiến độ giao hàng',
      complete: 'Đã hoàn thành hợp đồng',
      terminate: 'Đã chấm dứt hợp đồng',
    };
    message.success(messages[action] || 'Thao tác thành công');
  };

  const renderActionBar = () => {
    const status = contract.status;
    return (
      <Space size={8} wrap>
        {status === 'draft' && (
          <>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleAction('send_sign')}
              style={{ borderRadius: 8 }}
            >
              Gửi NCC ký
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/contracts/${contract.id}/edit`)}
              style={{ borderRadius: 8 }}
            >
              Chỉnh sửa
            </Button>
          </>
        )}
        {status === 'pending_sign' && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleAction('confirm_signed')}
            style={{ borderRadius: 8 }}
          >
            Xác nhận đã ký
          </Button>
        )}
        {status === 'executing' && (
          <>
            <Button
              type="primary"
              icon={<CarryOutOutlined />}
              onClick={() => handleAction('update_delivery')}
              style={{ borderRadius: 8 }}
            >
              Cập nhật giao hàng
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => handleAction('complete')}
              style={{ borderRadius: 8, color: colors.success, borderColor: colors.success }}
            >
              Hoàn thành
            </Button>
          </>
        )}
        {(status === 'executing' || status === 'pending_sign') && (
          <Button
            danger
            icon={<StopOutlined />}
            onClick={() => handleAction('terminate')}
            style={{ borderRadius: 8 }}
          >
            Chấm dứt
          </Button>
        )}
      </Space>
    );
  };

  // Tab 1: Thong tin hop dong
  const renderInfoTab = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AuditOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <Text strong style={{ color: colors.navy }}>Thông tin hợp đồng</Text>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500, width: 160 }}>
              <Descriptions.Item label="Mã hợp đồng">{contract.code}</Descriptions.Item>
              <Descriptions.Item label="Tên hợp đồng">{contract.title}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusConf.color}>{statusConf.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại hợp đồng">
                {contractTypeConfig[contract.contractType]?.label || contract.contractType}
              </Descriptions.Item>
              <Descriptions.Item label="Giá trị HĐ">
                <Text strong style={{ color: colors.navy }}>{formatCurrency(contract.totalValue)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày ký">
                {contract.signedDate ? formatDate(contract.signedDate) : 'Chưa ký'}
              </Descriptions.Item>
              <Descriptions.Item label="Thời hạn">
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Điều kiện TT">{contract.paymentTerms}</Descriptions.Item>
              <Descriptions.Item label="Gói thầu">{contract.biddingPackageId}</Descriptions.Item>
              <Descriptions.Item label="Người tạo">{contract.createdBy}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{formatDate(contract.createdDate)}</Descriptions.Item>
              {contract.attachments && contract.attachments.length > 0 && (
                <Descriptions.Item label="Tài liệu đính kèm">
                  <Space direction="vertical" size={2}>
                    {contract.attachments.map((file, idx) => (
                      <Text key={idx} style={{ fontSize: 12, color: colors.navy }}>
                        <PaperClipOutlined style={{ marginRight: 4 }} />
                        {file}
                      </Text>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #0891b2, #67e8f9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShopOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <Text strong style={{ color: colors.navy }}>Nhà cung cấp</Text>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500, width: 140 }}>
              <Descriptions.Item label="Tên NCC">{contract.supplierName}</Descriptions.Item>
              <Descriptions.Item label="Mã NCC">{contract.supplierId}</Descriptions.Item>
              {contract.supplierAddress && (
                <Descriptions.Item label="Địa chỉ">{contract.supplierAddress}</Descriptions.Item>
              )}
              {contract.supplierContact && (
                <Descriptions.Item label="Liên hệ">{contract.supplierContact}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #d97706, #fbbf24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DollarOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <Text strong style={{ color: colors.navy }}>Tình hình tài chính</Text>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
          >
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá trị HĐ</Text>
                <Text strong style={{ fontSize: 16, color: colors.navy }}>{formatCurrency(contract.totalValue)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đã giao hàng</Text>
                <Text strong style={{ fontSize: 16, color: colors.info }}>{formatCurrency(contract.deliveredValue)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đã thanh toán</Text>
                <Text strong style={{ fontSize: 16, color: colors.success }}>{formatCurrency(contract.paidValue)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Còn phải trả</Text>
                <Text strong style={{ fontSize: 16, color: contract.remainingValue > 0 ? colors.warning : colors.success }}>
                  {formatCurrency(contract.remainingValue)}
                </Text>
              </Col>
            </Row>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ thanh toán</Text>
                <Text style={{ fontSize: 11, fontWeight: 600 }}>{paidPct}%</Text>
              </div>
              <Progress
                percent={paidPct}
                showInfo={false}
                strokeColor={paidPct >= 100 ? colors.success : { '0%': colors.gold, '100%': '#f0d890' }}
                size="small"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Items table */}
      <Card
        size="small"
        title={
          <Space>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileTextOutlined style={{ color: '#fff', fontSize: 14 }} />
            </div>
            <Text strong style={{ color: colors.navy }}>Danh sách vật tư / thiết bị ({contract.items.length})</Text>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
      >
        <Table
          size="small"
          dataSource={contract.items}
          rowKey="materialId"
          pagination={false}
          columns={[
            {
              title: 'Mã vật tư',
              dataIndex: 'materialCode',
              key: 'materialCode',
              width: 120,
              render: (text: string) => <Text strong style={{ fontSize: 13, color: colors.navy }}>{text}</Text>,
            },
            {
              title: 'Tên vật tư / thiết bị',
              dataIndex: 'materialName',
              key: 'materialName',
              render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
            },
            {
              title: 'Đơn vị',
              dataIndex: 'unit',
              key: 'unit',
              width: 80,
              align: 'center' as const,
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
              width: 90,
              align: 'right' as const,
            },
            {
              title: 'Đơn giá (tr)',
              dataIndex: 'unitPrice',
              key: 'unitPrice',
              width: 110,
              align: 'right' as const,
              render: (val: number) => formatCurrency(val),
            },
            {
              title: 'Thành tiền (tr)',
              dataIndex: 'totalValue',
              key: 'totalValue',
              width: 120,
              align: 'right' as const,
              render: (val: number) => <Text strong>{formatCurrency(val)}</Text>,
            },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
                <Text strong style={{ color: colors.navy }}>Tổng cộng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>
                  {formatCurrency(contract.totalValue)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );

  // Tab 2: Giao hang
  const renderDeliveryTab = () => (
    <div>
      {contract.deliveries.map((d: ContractDelivery) => {
        const dConf = deliveryStatusConfig[d.status] || { label: d.status, color: 'default' };
        const borderColor =
          d.status === 'delivered' || d.status === 'confirmed'
            ? colors.success
            : d.status === 'late'
            ? colors.danger
            : d.status === 'partial'
            ? colors.warning
            : colors.border;
        return (
          <Card
            key={d.id}
            size="small"
            style={{
              borderRadius: 12,
              borderLeft: `3px solid ${borderColor}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              marginBottom: 16,
            }}
            bodyStyle={{ padding: '14px 16px' }}
          >
            <Row align="middle" justify="space-between" style={{ marginBottom: 10 }}>
              <Col>
                <Space size={8}>
                  <Text strong style={{ fontSize: 14, color: colors.navy }}>
                    Đợt giao hàng {d.deliveryNo}
                  </Text>
                  <Tag color={dConf.color}>{dConf.label}</Tag>
                </Space>
              </Col>
              <Col>
                <Space size={16}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Dự kiến: {formatDate(d.plannedDate)}
                  </Text>
                  {d.actualDate && (
                    <Text style={{ fontSize: 12, color: colors.success }}>
                      <CheckCircleOutlined style={{ marginRight: 4 }} />
                      Thực tế: {formatDate(d.actualDate)}
                    </Text>
                  )}
                  {d.confirmedBy && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Xác nhận: {d.confirmedBy} ({d.confirmedDate ? formatDate(d.confirmedDate) : ''})
                    </Text>
                  )}
                </Space>
              </Col>
            </Row>

            {d.note && (
              <div style={{ marginBottom: 10, padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{d.note}</Text>
              </div>
            )}

            <Table
              size="small"
              dataSource={d.items}
              rowKey="materialId"
              pagination={false}
              columns={[
                {
                  title: 'Mã vật tư',
                  dataIndex: 'materialCode',
                  key: 'materialCode',
                  width: 120,
                  render: (text: string) => <Text style={{ fontSize: 13, color: colors.navy }}>{text}</Text>,
                },
                {
                  title: 'Vật tư / Thiết bị',
                  dataIndex: 'materialName',
                  key: 'materialName',
                  render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
                },
                {
                  title: 'Đơn vị',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: 80,
                  align: 'center' as const,
                },
                {
                  title: 'SL kế hoạch',
                  dataIndex: 'plannedQty',
                  key: 'plannedQty',
                  width: 100,
                  align: 'right' as const,
                },
                {
                  title: 'SL đã giao',
                  dataIndex: 'deliveredQty',
                  key: 'deliveredQty',
                  width: 100,
                  align: 'right' as const,
                  render: (val: number, record: ContractDeliveryItem) => (
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: val >= record.plannedQty ? colors.success : val > 0 ? colors.warning : colors.danger,
                      }}
                    >
                      {val}
                    </Text>
                  ),
                },
                {
                  title: 'SL nghiệm thu',
                  dataIndex: 'acceptedQty',
                  key: 'acceptedQty',
                  width: 110,
                  align: 'right' as const,
                  render: (val: number) => (
                    <Text style={{ fontSize: 13, color: val > 0 ? colors.success : colors.textSecondary }}>{val}</Text>
                  ),
                },
                {
                  title: 'Tiến độ',
                  key: 'progress',
                  width: 120,
                  render: (_: unknown, record: ContractDeliveryItem) => {
                    const pct = record.plannedQty > 0
                      ? Math.round((record.deliveredQty / record.plannedQty) * 100)
                      : 0;
                    return (
                      <Progress
                        percent={pct}
                        size="small"
                        strokeColor={pct >= 100 ? colors.success : colors.navy}
                      />
                    );
                  },
                },
              ]}
            />

            {(d.status === 'pending' || d.status === 'late') && contract.status === 'executing' && (
              <div style={{ marginTop: 10, textAlign: 'right' }}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => message.success(`Đã xác nhận đợt giao hàng ${d.deliveryNo}`)}
                  style={{ borderRadius: 6 }}
                >
                  Xác nhận giao hàng
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  // Tab 3: Thanh toan
  const paymentColumns = [
    {
      title: 'Mã thanh toán',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Ngày hóa đơn',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Giá trị HĐ',
      dataIndex: 'invoiceValue',
      key: 'invoiceValue',
      align: 'right' as const,
      render: (val: number) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Số tiền TT',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      align: 'right' as const,
      render: (val: number) => (
        <Text strong style={{ fontSize: 13, color: val > 0 ? colors.success : colors.danger }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => paymentMethodConfig[method] || method,
    },
    {
      title: 'Ngày TT',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string | undefined) => (date ? formatDate(date) : '-'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const conf = paymentStatusConfig[status as keyof typeof paymentStatusConfig];
        return conf ? <Tag color={conf.color}>{conf.label}</Tag> : status;
      },
    },
    {
      title: 'Đối soát',
      key: 'match',
      render: (_: unknown, record: { matchResult: { contractMatch: boolean; warehouseMatch: boolean; qualityMatch: boolean } }) => {
        const { contractMatch, warehouseMatch, qualityMatch } = record.matchResult;
        const allMatch = contractMatch && warehouseMatch && qualityMatch;
        return (
          <Tag color={allMatch ? 'success' : 'warning'} style={{ fontSize: 11 }}>
            {allMatch ? 'Khớp' : 'Chưa khớp'}
          </Tag>
        );
      },
    },
  ];

  const renderPaymentTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={8}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: `3px solid ${colors.navy}` }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá trị hợp đồng</Text>
            <Text strong style={{ fontSize: 18, color: colors.navy }}>{formatCurrency(contract.totalValue)}</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: `3px solid ${colors.success}` }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đã thanh toán</Text>
            <Text strong style={{ fontSize: 18, color: colors.success }}>{formatCurrency(contract.paidValue)}</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: `3px solid ${colors.warning}` }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Còn lại</Text>
            <Text strong style={{ fontSize: 18, color: colors.warning }}>{formatCurrency(contract.remainingValue)}</Text>
          </Card>
        </Col>
      </Row>

      {contractPayments.length === 0 ? (
        <Empty description="Chưa có thanh toán nào" />
      ) : (
        <Table
          dataSource={contractPayments}
          columns={paymentColumns}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 1100 }}
        />
      )}
    </div>
  );

  // Tab 4: Canh bao + Vat tu loi
  const contractDefects = defectRequests.filter(d => d.contractId === contract.id);

  const renderWarningsTab = () => {
    const allWarnings = contract.warnings || [];
    const hasContent = allWarnings.length > 0 || contractDefects.length > 0;

    if (!hasContent) {
      return <Empty description="Không có cảnh báo hoặc vật tư lỗi nào" />;
    }

    return (
      <div>
        {/* Cảnh báo hệ thống */}
        {allWarnings.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 12 }}>
              <WarningOutlined style={{ marginRight: 6 }} />
              Cảnh báo ({allWarnings.length})
            </Text>
            {allWarnings.map((w, idx) => (
              <Card
                key={idx}
                size="small"
                style={{
                  borderRadius: 10,
                  borderLeft: `3px solid ${w.type === 'late_delivery' ? colors.danger : colors.warning}`,
                  marginBottom: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                styles={{ body: { padding: '12px 16px' } }}
              >
                <Row align="middle" gutter={12}>
                  <Col>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: w.type === 'late_delivery' ? 'linear-gradient(135deg, #ff4d4f, #ff7875)' : 'linear-gradient(135deg, #faad14, #ffd666)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <WarningOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                  </Col>
                  <Col flex="auto">
                    <Text strong style={{ fontSize: 13, display: 'block' }}>
                      {w.type === 'late_delivery' ? 'Trễ hạn giao hàng' : w.type === 'pending_signature' ? 'Chờ ký hợp đồng' : w.type}
                    </Text>
                    <Text style={{ fontSize: 12 }}>{w.message}</Text>
                  </Col>
                  <Col><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(w.date)}</Text></Col>
                </Row>
              </Card>
            ))}
          </div>
        )}

        {/* Vật tư lỗi từ Kho / Chất lượng */}
        {contractDefects.length > 0 && (
          <div>
            <Text strong style={{ fontSize: 14, color: colors.danger, display: 'block', marginBottom: 12 }}>
              <ExclamationCircleOutlined style={{ marginRight: 6 }} />
              Vật tư lỗi ({contractDefects.length} yêu cầu xử lý)
            </Text>
            <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fff2f0', borderRadius: 6, fontSize: 12, color: colors.textSecondary }}>
              Thông báo từ Quản lý Kho / Quản lý Chất lượng. Cán bộ mua sắm yêu cầu NCC trả lại hoặc thay thế.
            </div>
            {contractDefects.map(defect => {
              const actionLabels: Record<string, { label: string; color: string }> = {
                return: { label: 'Trả lại NCC', color: 'error' },
                replace: { label: 'Thay thế', color: 'warning' },
                repair: { label: 'Sửa chữa', color: 'processing' },
              };
              const statusLabels: Record<string, { label: string; color: string }> = {
                received: { label: 'Đã tiếp nhận', color: 'default' },
                notified: { label: 'Đã thông báo NCC', color: 'blue' },
                processing: { label: 'Đang xử lý', color: 'warning' },
                resolved: { label: 'Đã giải quyết', color: 'success' },
                closed: { label: 'Đã đóng', color: 'default' },
              };
              const actionCfg = actionLabels[defect.action] || { label: defect.action, color: 'default' };
              const statusCfg = statusLabels[defect.status] || { label: defect.status, color: 'default' };

              return (
                <Card
                  key={defect.id}
                  size="small"
                  style={{ borderRadius: 10, borderLeft: `3px solid ${colors.danger}`, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  styles={{ body: { padding: '16px 20px' } }}
                >
                  <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
                    <Col>
                      <Space size={8}>
                        <Text strong style={{ color: colors.navy }}>{defect.code}</Text>
                        <Tag color={actionCfg.color}>{actionCfg.label}</Tag>
                        <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                        <Tag style={{ fontSize: 11 }}>Nguồn: {defect.source === 'pkkq-kho' ? 'Quản lý Kho' : 'Quản lý Chất lượng'}</Tag>
                      </Space>
                    </Col>
                    <Col><Text type="secondary" style={{ fontSize: 12 }}>Ngày báo cáo: {formatDate(defect.reportedDate)}</Text></Col>
                  </Row>

                  {/* Danh sách vật tư lỗi */}
                  <Table
                    dataSource={defect.items}
                    rowKey="materialId"
                    size="small"
                    pagination={false}
                    style={{ marginBottom: 10 }}
                    columns={[
                      { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 110, render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text> },
                      { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name' },
                      { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70, align: 'center' as const },
                      { title: 'SL lỗi', dataIndex: 'defectQty', key: 'qty', width: 80, align: 'right' as const, render: (v: number) => <Text strong style={{ color: colors.danger }}>{v}</Text> },
                      { title: 'Lý do', dataIndex: 'reason', key: 'reason', width: 300 },
                    ]}
                  />

                  {/* Phản hồi NCC */}
                  {defect.supplierResponse && (
                    <div style={{ padding: '8px 12px', background: colors.bgLight, borderRadius: 6, marginBottom: 6 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Phản hồi NCC: </Text>
                      <Text style={{ fontSize: 13 }}>{defect.supplierResponse}</Text>
                    </div>
                  )}
                  {defect.note && (
                    <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú: {defect.note}</Text>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const warningCount = (contract.warnings || []).length + contractDefects.length;

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <a onClick={() => navigate('/contracts')} style={{ cursor: 'pointer' }}>
                <FileTextOutlined style={{ marginRight: 4 }} />
                Hợp đồng
              </a>
            ),
          },
          { title: 'Chi tiết' },
        ]}
      />

      {/* Hero header */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(27,58,92,0.12)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
            padding: '24px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.08,
              color: '#fff',
              fontSize: 120,
              lineHeight: 1,
            }}
          >
            <FileTextOutlined />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/contracts')}
                  ghost
                  size="small"
                  style={{ borderRadius: 6, marginBottom: 10, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Quay lại
                </Button>
                <div>
                  <Space size={10}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>
                      {contract.code}
                    </Title>
                    <Tag color={statusConf.color} style={{ fontSize: 12 }}>{statusConf.label}</Tag>
                    {contract.contractType && (
                      <Tag style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                        {contractTypeConfig[contract.contractType]?.label || contract.contractType}
                      </Tag>
                    )}
                  </Space>
                  <Text style={{ fontSize: 14, display: 'block', marginTop: 4, color: 'rgba(255,255,255,0.85)' }}>
                    {contract.title}
                  </Text>
                </div>
              </Col>
              <Col>
                {renderActionBar()}
              </Col>
            </Row>

            <Row gutter={[32, 12]}>
              <Col>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block' }}>Giá trị HĐ</Text>
                <Text style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{formatCurrency(contract.totalValue)}</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block' }}>Đã thanh toán</Text>
                <Text style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{formatCurrency(contract.paidValue)}</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block' }}>Còn lại</Text>
                <Text style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{formatCurrency(contract.remainingValue)}</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block' }}>Tiến độ giao hàng</Text>
                <div style={{ minWidth: 160, marginTop: 4 }}>
                  <Progress
                    percent={progressPct}
                    strokeColor={{ '0%': colors.gold, '100%': colors.goldLight }}
                    trailColor="rgba(255,255,255,0.15)"
                    format={(pct) => <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{pct}%</span>}
                    size="small"
                  />
                </div>
              </Col>
              <Col>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block' }}>NCC</Text>
                <Space size={6} style={{ marginTop: 2 }}>
                  <ShopOutlined style={{ color: '#fff', fontSize: 14 }} />
                  <Text style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{contract.supplierName}</Text>
                </Space>
              </Col>
              {contract.signedDate && (
                <Col>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block' }}>Ngày ký</Text>
                  <Space size={6} style={{ marginTop: 2 }}>
                    <CalendarOutlined style={{ color: '#fff', fontSize: 14 }} />
                    <Text style={{ fontSize: 14, color: '#fff' }}>{formatDate(contract.signedDate)}</Text>
                  </Space>
                </Col>
              )}
            </Row>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '0 20px 20px' }}
      >
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: 'info',
              label: (
                <span>
                  <InfoCircleOutlined style={{ marginRight: 6 }} />
                  Thông tin hợp đồng
                </span>
              ),
              children: renderInfoTab(),
            },
            {
              key: 'delivery',
              label: (
                <span>
                  <CarryOutOutlined style={{ marginRight: 6 }} />
                  Giao hàng ({contract.deliveries.length})
                </span>
              ),
              children: renderDeliveryTab(),
            },
            {
              key: 'payment',
              label: (
                <span>
                  <DollarOutlined style={{ marginRight: 6 }} />
                  Thanh toán ({contractPayments.length})
                </span>
              ),
              children: renderPaymentTab(),
            },
            {
              key: 'warnings',
              label: (
                <span>
                  <WarningOutlined style={{ marginRight: 6 }} />
                  Cảnh báo {warningCount > 0 ? `(${warningCount})` : ''}
                </span>
              ),
              children: renderWarningsTab(),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ContractDetailPage;
