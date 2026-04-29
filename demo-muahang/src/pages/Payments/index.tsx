import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Typography, Tag, Row, Col, Space, Input, Select, Button, Dropdown, Tooltip,
  Descriptions, message, Alert,
} from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, BankOutlined,
  SearchOutlined, FileProtectOutlined, CheckOutlined, CloseOutlined,
  ExclamationCircleOutlined, PlusOutlined, MoreOutlined, EyeOutlined,
  AuditOutlined, SendOutlined, DeleteOutlined, StarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { payments } from '../../data/payments';
import { formatCurrency, formatDate, paymentStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import { usePageHeader } from '../../contexts/PageHeaderContext';
import type { PaymentRecord, PaymentStatus } from '../../types';

const { Title, Text } = Typography;

const pageStyles = `
  .db-stat-card {
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    cursor: default;
  }
  .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .db-stat-card .stat-bg-icon {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .db-stat-card:hover .stat-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .pay-match-icon {
    font-size: 14px;
    margin-right: 2px;
  }
  .pay-match-pass { color: ${colors.success}; }
  .pay-match-fail { color: ${colors.danger}; }
`;

const Payments: React.FC = () => {
  const { isProcurement } = useUser();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // ---- STATS ----
  const stats = useMemo(() => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const processing = payments.filter(p => !['paid', 'rejected', 'draft'].includes(p.status)).length;
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.paymentAmount, 0);
    return { total, paid, processing, totalPaid };
  }, []);

  const statCards = [
    { title: 'Tổng phiếu TT', value: stats.total, suffix: 'phiếu', icon: <DollarOutlined />, gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` },
    { title: 'Đã thanh toán', value: stats.paid, suffix: 'phiếu', icon: <CheckCircleOutlined />, gradient: `linear-gradient(135deg, ${colors.success}, #73d13d)` },
    { title: 'Đang xử lý', value: stats.processing, suffix: 'phiếu', icon: <ClockCircleOutlined />, gradient: `linear-gradient(135deg, ${colors.warning}, #ffc53d)` },
    { title: 'Tổng giá trị đã trả', value: formatCurrency(stats.totalPaid), suffix: '', icon: <BankOutlined />, gradient: `linear-gradient(135deg, #7c3aed, #a78bfa)` },
  ];

  // ---- FILTER ----
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = searchText === '' ||
        p.code.toLowerCase().includes(searchText.toLowerCase()) ||
        p.contractCode.toLowerCase().includes(searchText.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchText.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchText, statusFilter]);

  // ---- TOGGLE EXPAND ----
  const toggleExpand = (key: string) => {
    setExpandedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // ---- ACTION MENU ----
  const getActionItems = (record: PaymentRecord) => {
    const viewItem = {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết',
      onClick: () => navigate(`/payments/${record.id}`),
    };

    switch (record.status) {
      case 'draft':
        return [
          viewItem,
          { key: 'verify', icon: <AuditOutlined />, label: 'Đối soát', onClick: () => message.info('Mở đối soát 3 bên cho ' + record.code) },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => message.warning('Xóa phiếu ' + record.code) },
        ];
      case 'verifying':
        return [
          viewItem,
          { key: 'complete-verify', icon: <SafetyCertificateOutlined />, label: 'Hoàn tất đối soát', onClick: () => message.info('Hoàn tất đối soát ' + record.code) },
        ];
      case 'verified':
        return [
          viewItem,
          { key: 'request', icon: <SendOutlined />, label: 'Gửi đề nghị TT', onClick: () => message.info('Gửi đề nghị thanh toán ' + record.code + ' đến TC-KT') },
        ];
      case 'requested':
        return [viewItem];
      case 'approved':
        return [
          viewItem,
          { key: 'confirm-paid', icon: <CheckCircleOutlined />, label: 'Xác nhận đã TT', onClick: () => message.success('Xác nhận đã thanh toán ' + record.code) },
        ];
      case 'paid':
        return [
          viewItem,
          ...(!record.supplierRated ? [{
            key: 'rate',
            icon: <StarOutlined />,
            label: 'Đánh giá NCC',
            onClick: () => message.info('Mở đánh giá NCC cho ' + record.supplierName),
          }] : []),
        ];
      case 'rejected':
        return [viewItem];
      default:
        return [viewItem];
    }
  };

  // ---- TABLE COLUMNS ----
  const columns: ColumnsType<PaymentRecord> = [
    {
      title: 'Mã phiếu', dataIndex: 'code', width: 130, fixed: 'left',
      render: (t: string) => <Text strong style={{ color: colors.navy }}>{t}</Text>,
    },
    {
      title: 'Hợp đồng', dataIndex: 'contractCode', width: 130,
      render: (t: string) => <Text style={{ color: colors.info }}>{t}</Text>,
    },
    {
      title: 'NCC', dataIndex: 'supplierName', width: 200, ellipsis: true,
    },
    {
      title: 'Số hóa đơn', dataIndex: 'invoiceNumber', width: 180,
      render: (t: string) => <Text type="secondary" style={{ fontSize: 13 }}>{t}</Text>,
    },
    {
      title: 'Giá trị HĐ', dataIndex: 'invoiceValue', width: 110, align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Số tiền TT', dataIndex: 'paymentAmount', width: 110, align: 'right',
      render: (v: number) => (
        <Text strong style={{ color: v > 0 ? colors.navy : colors.textSecondary }}>
          {v > 0 ? formatCurrency(v) : '-'}
        </Text>
      ),
    },
    {
      title: 'Đối soát 3 bên', width: 150, align: 'center',
      render: (_: unknown, record: PaymentRecord) => {
        const { contractMatch, warehouseMatch, qualityMatch } = record.matchResult;
        return (
          <Space size={10}>
            <Tooltip title={contractMatch ? 'Khớp hợp đồng' : 'Chưa khớp hợp đồng'}>
              {contractMatch
                ? <CheckOutlined className="pay-match-icon pay-match-pass" />
                : <CloseOutlined className="pay-match-icon pay-match-fail" />
              }
            </Tooltip>
            <Tooltip title={warehouseMatch ? 'Khớp nhập kho' : 'Chưa khớp nhập kho'}>
              {warehouseMatch
                ? <CheckOutlined className="pay-match-icon pay-match-pass" />
                : <CloseOutlined className="pay-match-icon pay-match-fail" />
              }
            </Tooltip>
            <Tooltip title={qualityMatch ? 'Khớp chất lượng' : 'Chưa khớp chất lượng'}>
              {qualityMatch
                ? <CheckOutlined className="pay-match-icon pay-match-pass" />
                : <CloseOutlined className="pay-match-icon pay-match-fail" />
              }
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 140, align: 'center',
      render: (status: PaymentStatus) => {
        const cfg = paymentStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdDate', width: 110, align: 'center',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thao tác', width: 70, align: 'center', fixed: 'right',
      render: (_: unknown, record: PaymentRecord) => {
        const items = getActionItems(record);
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />} style={{ color: '#999' }} />
          </Dropdown>
        );
      },
    },
  ];

  // ---- EXPANDABLE ROW ----
  const expandedRowRender = (record: PaymentRecord) => {
    const { contractMatch, warehouseMatch, qualityMatch } = record.matchResult;
    const allMatch = contractMatch && warehouseMatch && qualityMatch;
    return (
      <div style={{ padding: '8px 16px' }}>
        <Row gutter={24}>
          {/* Hóa đơn */}
          <Col xs={24} md={8}>
            <Descriptions size="small" column={1} title={
              <Text strong style={{ fontSize: 13, color: colors.navy }}>
                <FileProtectOutlined style={{ marginRight: 6 }} />
                Thông tin hóa đơn
              </Text>
            }>
              <Descriptions.Item label="Số hóa đơn">{record.invoiceNumber}</Descriptions.Item>
              <Descriptions.Item label="Ngày hóa đơn">{formatDate(record.invoiceDate)}</Descriptions.Item>
              <Descriptions.Item label="Giá trị">
                <Text strong>{formatCurrency(record.invoiceValue)}</Text>
              </Descriptions.Item>
              {record.invoiceAttachment && (
                <Descriptions.Item label="File đính kèm">
                  <Text style={{ fontSize: 12, color: colors.info }}>{record.invoiceAttachment}</Text>
                </Descriptions.Item>
              )}
              {record.deliveryNo && (
                <Descriptions.Item label="Đợt giao hàng">Đợt {record.deliveryNo}</Descriptions.Item>
              )}
            </Descriptions>
          </Col>

          {/* Đối soát */}
          <Col xs={24} md={8}>
            <Descriptions size="small" column={1} title={
              <Text strong style={{ fontSize: 13, color: colors.navy }}>
                <AuditOutlined style={{ marginRight: 6 }} />
                Kết quả đối soát
              </Text>
            }>
              <Descriptions.Item label="Hợp đồng - Hóa đơn">
                {contractMatch ? <Tag color="success">Khớp</Tag> : <Tag color="error">Chưa khớp</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Nhập kho - Hóa đơn">
                {warehouseMatch ? <Tag color="success">Khớp</Tag> : <Tag color="error">Chưa khớp</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Chất lượng - Hóa đơn">
                {qualityMatch ? <Tag color="success">Khớp</Tag> : <Tag color="error">Chưa khớp</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Kết luận">
                {allMatch
                  ? <Tag color="success" icon={<CheckCircleOutlined />}>Đối soát đạt</Tag>
                  : <Tag color="warning" icon={<ExclamationCircleOutlined />}>Cần xác minh</Tag>
                }
              </Descriptions.Item>
              {record.verifiedBy && (
                <Descriptions.Item label="Người đối soát">
                  {record.verifiedBy} ({record.verifiedDate ? formatDate(record.verifiedDate) : '-'})
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Giá trị đối soát">
                <Text strong>{record.verifiedValue > 0 ? formatCurrency(record.verifiedValue) : '-'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Thanh toán + phê duyệt */}
          <Col xs={24} md={8}>
            <Descriptions size="small" column={1} title={
              <Text strong style={{ fontSize: 13, color: colors.navy }}>
                <DollarOutlined style={{ marginRight: 6 }} />
                Thanh toán & phê duyệt
              </Text>
            }>
              <Descriptions.Item label="Số tiền TT">
                <Text strong style={{ color: record.paymentAmount > 0 ? colors.navy : undefined }}>
                  {record.paymentAmount > 0 ? formatCurrency(record.paymentAmount) : '-'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức">
                {record.paymentMethod === 'transfer' ? 'Chuyển khoản' : record.paymentMethod === 'advance' ? 'Tạm ứng' : 'Trực tiếp'}
              </Descriptions.Item>
              {record.requestedBy && (
                <Descriptions.Item label="Người đề nghị">
                  {record.requestedBy} ({record.requestedDate ? formatDate(record.requestedDate) : '-'})
                </Descriptions.Item>
              )}
              {record.approvedBy && (
                <Descriptions.Item label="Người duyệt">
                  {record.approvedBy} ({record.approvedDate ? formatDate(record.approvedDate) : '-'})
                </Descriptions.Item>
              )}
              {record.paymentDate && (
                <Descriptions.Item label="Ngày thanh toán">{formatDate(record.paymentDate)}</Descriptions.Item>
              )}
              {record.transactionRef && (
                <Descriptions.Item label="Mã giao dịch">
                  <Text code style={{ fontSize: 12 }}>{record.transactionRef}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Đánh giá NCC">
                {record.supplierRated
                  ? <Tag color="success" icon={<StarOutlined />}>Đã đánh giá</Tag>
                  : <Tag color="default">Chưa đánh giá</Tag>
                }
              </Descriptions.Item>
              {record.note && (
                <Descriptions.Item label="Ghi chú">
                  <Text style={{ fontSize: 12 }}>{record.note}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
      </div>
    );
  };

  // ---- RENDER ----
  return (
    <div style={{ padding: 0 }}>
      <style>{pageStyles}</style>

      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>Thanh toán & Đối soát</Title>
          <Text type="secondary">Quản lý thanh toán nhà cung cấp, đối soát 3 bên và gửi đề nghị thanh toán đến TC-KT</Text>
        </div>
        {isProcurement && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/payments/new')}>
            Tạo phiếu thanh toán
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card className="db-stat-card" styles={{ body: { padding: 20 } }} style={{ background: card.gradient }}>
              <div style={{ position: 'relative' }}>
                <div className="stat-bg-icon" style={{
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                    {card.value}
                  </span>
                  {card.suffix && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{card.suffix}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.title}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Banner */}
      <Alert
        type="info"
        showIcon
        icon={<AuditOutlined />}
        message="Quy trình đối soát 3 bên"
        description="Đối soát 3 bên: hóa đơn NCC ↔ hợp đồng mua sắm ↔ kết quả nhập kho & nghiệm thu. Sau đối soát, gửi đề nghị thanh toán đến Quản lý Tài chính Kế toán (pkkq-taichinhketoan)."
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      {/* Filter + Table */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <DollarOutlined />
          </span>
          <Text strong style={{ fontSize: 15, color: colors.navy }}>Bảng thanh toán</Text>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
          <Col flex="auto">
            <Space>
              <Input
                placeholder="Tìm kiếm theo mã phiếu, hợp đồng, NCC, hóa đơn..."
                prefix={<SearchOutlined style={{ color: colors.navy }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 400 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  ...Object.entries(paymentStatusConfig).map(([k, v]) => ({ value: k, label: v.label })),
                ]}
              />
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredPayments.map(p => ({ ...p, key: p.id }))}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `Tổng: ${t} phiếu` }}
          size="middle"
          scroll={{ x: 1300 }}
          onRow={(record) => ({ onDoubleClick: () => navigate(`/payments/${record.id}`), style: { cursor: 'pointer' } })}
        />
      </Card>
    </div>
  );
};

export default Payments;
