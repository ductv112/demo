import React, { useState, useMemo } from 'react';
import {
  Button,
  Tag,
  Progress,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Empty,
  Tooltip,
  Dropdown,
  Input,
  Select,
  message,
  Modal,
} from 'antd';
import {
  EyeOutlined,
  FileProtectOutlined,
  SyncOutlined,
  DollarOutlined,
  WalletOutlined,
  CalendarOutlined,
  TeamOutlined,
  MoreOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contracts, workItems } from '../../data/contracts';
import { formatCurrency, formatDate, contractStatusConfig, getProgressColor } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const statusBorderColor: Record<string, string> = {
  draft: '#d9d9d9',
  negotiating: colors.info,
  pending_approval: colors.warning,
  approved: colors.success,
  signed: '#7c3aed',
  executing: colors.info,
  acceptance: '#0891b2',
  settling: colors.warning,
  completed: colors.success,
  cancelled: colors.danger,
};

const ContractPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDepartment, currentUser } = useUser();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Filter contracts for department role
  const roleContracts = useMemo(() => {
    if (!isDepartment) return contracts;
    const deptId = currentUser.departmentId;
    const contractIdsWithDeptWork = new Set(
      workItems.filter(w => w.assignedUnit === deptId).map(w => w.contractId)
    );
    return contracts.filter(c => contractIdsWithDeptWork.has(c.id));
  }, [isDepartment, currentUser.departmentId]);

  // Apply search & status filters
  const filteredContracts = useMemo(() => {
    let result = roleContracts;
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(keyword) || c.code.toLowerCase().includes(keyword),
      );
    }
    if (filterStatus) {
      result = result.filter(c => c.status === filterStatus);
    }
    return result;
  }, [roleContracts, searchText, filterStatus]);

  const handleClearFilters = () => {
    setSearchText('');
    setFilterStatus(undefined);
  };

  const hasActiveFilters = searchText || filterStatus;

  // Summary stats
  const summary = useMemo(() => {
    const executing = roleContracts.filter(c => c.status === 'executing').length;
    const totalValue = roleContracts.reduce((sum, c) => sum + c.contractValue, 0);
    const totalAdvance = roleContracts.reduce((sum, c) => sum + c.advancePayment, 0);
    return {
      total: roleContracts.length,
      executing,
      totalValue,
      totalAdvance,
    };
  }, [roleContracts]);

  const getContractProgress = (contractId: string): number => {
    const items = workItems.filter(w => w.contractId === contractId);
    if (items.length === 0) return 0;
    const totalProgress = items.reduce((sum, w) => sum + w.progress, 0);
    return Math.round(totalProgress / items.length);
  };

  const getContractActualCost = (contractId: string): number => {
    const items = workItems.filter(w => w.contractId === contractId);
    return items.reduce((sum, w) => sum + w.actualCost, 0);
  };

  const summaryCards = [
    {
      title: 'Tổng hợp đồng',
      value: summary.total,
      valueSuffix: 'hợp đồng',
      icon: <FileProtectOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
    },
    {
      title: 'Đang thực hiện',
      value: summary.executing,
      valueSuffix: 'hợp đồng',
      icon: <SyncOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
    },
    {
      title: 'Tổng giá trị',
      value: summary.totalValue,
      valueSuffix: 'tr',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    },
    {
      title: 'Tạm ứng',
      value: summary.totalAdvance,
      valueSuffix: 'tr',
      icon: <WalletOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    },
  ];

  const renderContractCard = (contract: typeof contracts[0]) => {
    const statusConf = contractStatusConfig[contract.status];
    const borderColor = statusBorderColor[contract.status] || colors.navy;
    const progress = getContractProgress(contract.id);
    const actualCost = getContractActualCost(contract.id);
    const costRate = contract.contractValue > 0
      ? Math.round((actualCost / contract.contractValue) * 100)
      : 0;

    return (
      <Col xs={24} lg={12} key={contract.id}>
        <Card
          hoverable
          className="contract-card"
          style={{
            borderLeft: `4px solid ${borderColor}`,
            borderRadius: 12,
            marginBottom: 0,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          styles={{ body: { padding: '18px 20px' } }}
          onClick={() => navigate(`/contracts/${contract.id}`)}
        >
          {/* Header: code + name + status */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 12 }}>
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Space size={8} align="center" wrap>
                <Tag
                  style={{
                    fontWeight: 700,
                    fontSize: 11,
                    background: `${borderColor}15`,
                    color: borderColor,
                    border: `1px solid ${borderColor}40`,
                    borderRadius: 6,
                    padding: '2px 8px',
                  }}
                >
                  {contract.code}
                </Tag>
                <Tag color={statusConf.color} style={{ fontSize: 11 }}>
                  {statusConf.label}
                </Tag>
                <Tag
                  color={contract.contractType === 'contract' ? 'blue' : 'purple'}
                  style={{ fontSize: 11 }}
                >
                  {contract.contractType === 'contract' ? 'Hợp đồng' : 'Quyết định giao NV'}
                </Tag>
              </Space>
              <Title level={5} style={{
                margin: '6px 0 0',
                color: colors.navy,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '20px',
              }} ellipsis={{ rows: 2 }}>
                {contract.name}
              </Title>
            </Col>
            <Col flex="none" style={{ marginLeft: 12 }}>
              <Dropdown
                menu={{
                  items: ['draft', 'negotiating', 'pending_approval'].includes(contract.status)
                    ? [
                        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
                        { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                        { type: 'divider' as const },
                        { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
                      ]
                    : [
                        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
                      ],
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    if (key === 'view') navigate(`/contracts/${contract.id}`);
                    else if (key === 'edit') navigate(`/contracts/${contract.id}/edit`);
                    else if (key === 'delete') {
                      Modal.confirm({
                        title: 'Xác nhận xóa',
                        content: `Bạn có chắc chắn muốn xóa hợp đồng "${contract.name}"?`,
                        okText: 'Xóa',
                        okType: 'danger',
                        cancelText: 'Hủy',
                        onOk: () => message.success('Đã xóa hợp đồng thành công'),
                      });
                    } else {
                      message.info('Chức năng đang phát triển');
                    }
                  },
                }}
                trigger={['click']}
              >
                <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} onClick={e => e.stopPropagation()} />
              </Dropdown>
            </Col>
          </Row>

          {/* Partner + timeline */}
          <Row gutter={16} style={{ marginBottom: 12 }}>
            <Col span={12}>
              <Space size={6}>
                <TeamOutlined style={{ color: colors.navyLight, fontSize: 13 }} />
                <Text style={{ fontSize: 12, color: '#666' }}>{contract.partnerUnit}</Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space size={6}>
                <CalendarOutlined style={{ color: colors.navyLight, fontSize: 13 }} />
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                </Text>
              </Space>
            </Col>
          </Row>

          {/* Value + cost progress */}
          <div style={{
            background: '#f8fafc',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 10,
          }}>
            <Row gutter={16} align="middle">
              <Col xs={8}>
                <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>Giá trị HĐ</Text>
                <Text strong style={{ fontSize: 14, color: colors.navy }}>
                  {formatCurrency(contract.contractValue)}
                </Text>
              </Col>
              <Col xs={8}>
                <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>Đã thực hiện</Text>
                <Text strong style={{ fontSize: 14, color: colors.info }}>
                  {formatCurrency(actualCost)}
                </Text>
              </Col>
              <Col xs={8}>
                <Text style={{ fontSize: 11, color: '#999', display: 'block' }}>Tạm ứng</Text>
                <Text strong style={{ fontSize: 14, color: colors.success }}>
                  {formatCurrency(contract.advancePayment)}
                </Text>
              </Col>
            </Row>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: '#999' }}>Chi phí thực tế / Giá trị HĐ</Text>
                <Text style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>{costRate}%</Text>
              </div>
              <div style={{
                height: 6, borderRadius: 3, background: '#e8e8e8',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(costRate, 100)}%`,
                  height: '100%',
                  background: costRate > 90
                    ? `linear-gradient(90deg, ${colors.danger}, #ff7875)`
                    : `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight})`,
                  borderRadius: 3,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <Row align="middle" justify="space-between">
            <Col flex="auto" style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 4 }}>
                Tiến độ tổng thể
              </Text>
              <Progress
                percent={progress}
                size="small"
                strokeColor={getProgressColor(progress)}
                style={{ marginBottom: 0 }}
              />
            </Col>
            <Col flex="none">
              <Tooltip title={`${workItems.filter(w => w.contractId === contract.id).length} công việc`}>
                <div style={{
                  background: `${getProgressColor(progress)}15`,
                  color: getProgressColor(progress),
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '4px 10px',
                  borderRadius: 8,
                  lineHeight: '22px',
                }}>
                  {progress}%
                </div>
              </Tooltip>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  };

  return (
    <div>
      <style>{`
        .contract-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 24px rgba(27, 58, 92, 0.15) !important;
        }
      `}</style>

      {/* Page header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <FileProtectOutlined style={{ marginRight: 8 }} />
            Danh sách Hợp đồng & Nhiệm vụ
          </Title>
          <Text type="secondary">
            {isDepartment
              ? 'Các hợp đồng có công việc liên quan đến đơn vị'
              : 'Quản lý toàn bộ hợp đồng và quyết định giao nhiệm vụ'}
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/contracts/create')}
          >
            Tạo hợp đồng mới
          </Button>
        </Col>
      </Row>

      {/* Summary stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summaryCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div className="db-stat-card" style={{
              background: card.gradient,
              borderRadius: 14,
              padding: '14px 16px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div className="db-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)',
                lineHeight: 1,
              }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.title}
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {card.valueSuffix === 'tr'
                  ? <>{formatCurrency(card.value)}</>
                  : <>{card.value} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.valueSuffix}</span></>
                }
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filter Bar */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14, marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Space size={12} wrap>
              <Input
                placeholder="Tìm kiếm theo mã, tên hợp đồng..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 300 }}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Trạng thái"
                style={{ width: 160 }}
                allowClear
                value={filterStatus}
                onChange={setFilterStatus}
                options={Object.entries(contractStatusConfig).map(([key, cfg]) => ({
                  value: key, label: cfg.label,
                }))}
              />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {filteredContracts.length}/{roleContracts.length} kết quả
              </Text>
              {hasActiveFilters && (
                <Button size="small" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Contract cards */}
      {filteredContracts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredContracts.map(renderContractCard)}
        </Row>
      ) : (
        <Card>
          <Empty description="Không có hợp đồng nào" />
        </Card>
      )}
    </div>
  );
};

export default ContractPage;
