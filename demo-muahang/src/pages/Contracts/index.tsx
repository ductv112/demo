import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Select,
  Space,
  Typography,
  Progress,
  Button,
  Table,
  Input,
  Dropdown,
  Empty,
  Tooltip,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  FileTextOutlined,
  SyncOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePageHeader } from '../../contexts/PageHeaderContext';
import { contracts } from '../../data/contracts';
import { defectRequests } from '../../data/receiving';
import { formatCurrency, formatDate, contractStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ProcurementContract } from '../../types';

const { Title, Text } = Typography;

const ContractsPage: React.FC = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const supplierOptions = useMemo(() => {
    const unique = [...new Set(contracts.map((c) => c.supplierName))];
    return unique.map((s) => ({ label: s, value: s }));
  }, []);

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (supplierFilter && c.supplierName !== supplierFilter) return false;
      if (searchText) {
        const text = searchText.toLowerCase();
        if (
          !c.code.toLowerCase().includes(text) &&
          !c.title.toLowerCase().includes(text) &&
          !c.supplierName.toLowerCase().includes(text)
        )
          return false;
      }
      return true;
    });
  }, [statusFilter, supplierFilter, searchText]);

  const stats = useMemo(() => {
    const totalContracts = contracts.length;
    const executing = contracts.filter((c) => c.status === 'executing').length;
    const totalValue = contracts.reduce((s, c) => s + c.totalValue, 0);
    const totalPaid = contracts.reduce((s, c) => s + c.paidValue, 0);
    return { totalContracts, executing, totalValue, totalPaid };
  }, []);

  const summaryCards = [
    {
      title: 'Tổng hợp đồng',
      value: stats.totalContracts,
      suffix: 'hợp đồng',
      icon: <FileTextOutlined style={{ fontSize: 64 }} />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    },
    {
      title: 'Đang thực hiện',
      value: stats.executing,
      suffix: 'hợp đồng',
      icon: <SyncOutlined style={{ fontSize: 64 }} />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
    },
    {
      title: 'Tổng giá trị',
      value: formatCurrency(stats.totalValue),
      suffix: '',
      icon: <DollarOutlined style={{ fontSize: 64 }} />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    },
    {
      title: 'Đã thanh toán',
      value: formatCurrency(stats.totalPaid),
      suffix: '',
      icon: <CheckCircleOutlined style={{ fontSize: 64 }} />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    },
  ];

  const getDropdownItems = (record: ProcurementContract): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/contracts/${record.id}`),
      },
    ];

    if (record.status === 'draft' || record.status === 'pending_sign') {
      items.push({
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Chỉnh sửa',
        onClick: () => navigate(`/contracts/${record.id}/edit`),
      });
    }

    if (record.status === 'draft') {
      items.push({
        type: 'divider',
      });
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Xóa',
        danger: true,
        onClick: () => {
          message.success('Đã xóa hợp đồng ' + record.code);
        },
      });
    }

    return items;
  };

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (text: string, record: ProcurementContract) => {
        const hasDefect = defectRequests.some(d => d.contractId === record.id && d.status !== 'resolved' && d.status !== 'closed');
        return (
          <Space size={4}>
            <a
              onClick={() => navigate(`/contracts/${record.id}`)}
              style={{ color: colors.navy, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              {text}
            </a>
            {hasDefect && (
              <Tooltip title="Có vật tư lỗi cần xử lý">
                <ExclamationCircleOutlined style={{ color: colors.danger, fontSize: 14 }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Tên hợp đồng',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 180,
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right' as const,
      sorter: (a: ProcurementContract, b: ProcurementContract) => a.totalValue - b.totalValue,
      render: (val: number) => (
        <Text strong style={{ fontSize: 13, color: colors.navy }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Đã TT',
      dataIndex: 'paidValue',
      key: 'paidValue',
      width: 110,
      align: 'right' as const,
      render: (val: number) => (
        <Text style={{ fontSize: 13, color: val > 0 ? colors.success : colors.textSecondary }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Tiến độ giao',
      key: 'deliveryProgress',
      width: 140,
      render: (_: unknown, record: ProcurementContract) => {
        const pct =
          record.totalValue > 0
            ? parseFloat(((record.deliveredValue / record.totalValue) * 100).toFixed(1))
            : 0;
        return (
          <Progress
            percent={pct}
            size="small"
            strokeColor={pct >= 100 ? colors.success : { '0%': colors.navy, '100%': colors.navyLight }}
            format={(p) => <span style={{ fontSize: 11, fontWeight: 600 }}>{p}%</span>}
          />
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const conf = contractStatusConfig[status as keyof typeof contractStatusConfig];
        return conf ? <Tag color={conf.color}>{conf.label}</Tag> : status;
      },
    },
    {
      title: 'Ngày ký',
      dataIndex: 'signedDate',
      key: 'signedDate',
      width: 110,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{date ? formatDate(date) : '-'}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 70,
      align: 'center' as const,
      render: (_: unknown, record: ProcurementContract) => (
        <Dropdown menu={{ items: getDropdownItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} style={{ borderRadius: 6 }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Danh sách Hợp đồng Mua sắm
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý và theo dõi tiến độ thực hiện hợp đồng mua sắm vật tư, thiết bị
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/contracts/new')}>
          Tạo hợp đồng
        </Button>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summaryCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              bodyStyle={{
                padding: '18px 20px',
                background: card.gradient,
                position: 'relative',
                overflow: 'hidden',
                minHeight: 110,
              }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  opacity: 0.1,
                  color: '#ffffff',
                  fontSize: 64,
                  lineHeight: 1,
                }}
              >
                {card.icon}
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 16,
                    marginBottom: 10,
                  }}
                >
                  {React.cloneElement(card.icon as React.ReactElement<Record<string, unknown>>, { style: { fontSize: 16 } })}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>
                  {card.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                    {card.value}
                  </span>
                  {card.suffix && (
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                      {card.suffix}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card
        bodyStyle={{ padding: '12px 16px' }}
        style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <Row gutter={16} align="middle" justify="space-between">
          <Col>
            <Space size={12} wrap>
              <Input
                placeholder="Tìm mã HĐ, tên, NCC..."
                prefix={<SearchOutlined style={{ color: colors.navy }} />}
                allowClear
                style={{ width: 240, borderRadius: 8 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Trạng thái"
                allowClear
                style={{ width: 160 }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={Object.entries(contractStatusConfig).map(([key, conf]) => ({
                  label: conf.label,
                  value: key,
                }))}
              />
              <Select
                placeholder="Nhà cung cấp"
                allowClear
                style={{ width: 200 }}
                value={supplierFilter}
                onChange={setSupplierFilter}
                options={supplierOptions}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hiển thị {filtered.length}/{contracts.length} hợp đồng
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Contract table */}
      {filtered.length === 0 ? (
        <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
          <Empty description="Không tìm thấy hợp đồng phù hợp" />
        </Card>
      ) : (
        <Card
          style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng ${total} hợp đồng` }}
            scroll={{ x: 1100 }}
            size="middle"
          />
        </Card>
      )}
    </div>
  );
};

export default ContractsPage;
