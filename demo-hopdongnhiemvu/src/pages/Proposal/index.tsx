import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Input, Space, Select,
  Dropdown, Modal, message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DollarOutlined, SyncOutlined, ClockCircleOutlined,
  CheckCircleOutlined, SearchOutlined, EyeOutlined,
  SolutionOutlined, PlusOutlined, MoreOutlined,
  EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

import { proposals, missions } from '../../data/missions';
import {
  formatDate, formatCurrency,
  proposalStatusConfig, missionTypeConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Proposal, ProposalStatus } from '../../types';

const { Title, Text } = Typography;

const ProposalListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Enrich proposals with mission info
  const enrichedProposals = useMemo(() => {
    return proposals.map(p => {
      const mission = missions.find(m => m.id === p.missionId);
      return {
        ...p,
        missionCode: mission?.code || '',
        missionName: mission?.name || '',
        missionType: mission?.missionType || '',
        equipmentType: mission?.equipmentType || '',
        requestingUnit: mission?.requestingUnit || '',
      };
    });
  }, []);

  const filteredProposals = useMemo(() => {
    let result = enrichedProposals;
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        p => p.code.toLowerCase().includes(keyword)
          || p.missionCode.toLowerCase().includes(keyword)
          || p.missionName.toLowerCase().includes(keyword),
      );
    }
    if (filterStatus) {
      result = result.filter(p => p.status === filterStatus);
    }
    return result;
  }, [enrichedProposals, searchText, filterStatus]);

  const handleClearFilters = () => {
    setSearchText('');
    setFilterStatus(undefined);
  };
  const hasActiveFilters = searchText || filterStatus;

  // Stats
  const totalCount = proposals.length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const pendingCount = proposals.filter(p => ['draft', 'submitted', 'pending_cost_review', 'cost_reviewing', 'cost_reviewed', 'pending_approval', 'revision'].includes(p.status)).length;
  const totalValue = proposals.reduce((s, p) => s + p.proposedPrice, 0);

  const statCardsData = [
    {
      title: 'Tổng đề xuất',
      value: totalCount,
      unit: 'đề xuất',
      icon: <SolutionOutlined />,
      gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
      sub: 'Năm 2026',
    },
    {
      title: 'Đã phê duyệt',
      value: approvedCount,
      unit: 'đề xuất',
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      sub: `${totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}% tổng ĐX`,
    },
    {
      title: 'Chờ xử lý',
      value: pendingCount,
      unit: 'đề xuất',
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      sub: 'Nháp + Đã gửi + Đang xem xét',
    },
    {
      title: 'Tổng giá trị',
      value: totalValue,
      unit: '',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      sub: 'Giá đề xuất',
      isCurrency: true,
    },
  ];

  const getActionMenuItems = (record: Proposal & { missionCode: string }): MenuProps['items'] => {
    const canEdit = ['draft', 'revision', 'cost_rejected'].includes(record.status);
    return [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/proposals/${record.id}`),
      },
      ...(canEdit ? [
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Chỉnh sửa',
          onClick: () => navigate(`/proposals/${record.id}/edit`),
        },
        { type: 'divider' as const },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa',
          danger: true as const,
          onClick: () => {
            Modal.confirm({
              title: 'Xác nhận xóa đề xuất',
              content: `Bạn có chắc chắn muốn xóa đề xuất ${record.code}?`,
              okText: 'Xóa',
              okButtonProps: { danger: true },
              cancelText: 'Hủy',
              onOk: () => message.success(`Đã xóa đề xuất ${record.code}`),
            });
          },
        },
      ] : []),
    ];
  };

  type EnrichedProposal = Proposal & { missionCode: string; missionName: string; missionType: string; equipmentType: string; requestingUnit: string };

  const columns: ColumnsType<EnrichedProposal> = [
    {
      title: 'Mã ĐX',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text>,
    },
    {
      title: 'Nhiệm vụ liên kết',
      key: 'mission',
      ellipsis: true,
      render: (_: unknown, record: EnrichedProposal) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.missionName}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.missionCode} — {record.equipmentType}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại NV',
      dataIndex: 'missionType',
      key: 'missionType',
      width: 110,
      render: (type: string) => {
        const cfg = missionTypeConfig[type as keyof typeof missionTypeConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Tổng dự toán',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>,
      sorter: (a: EnrichedProposal, b: EnrichedProposal) => a.totalCost - b.totalCost,
    },
    {
      title: 'Giá đề xuất',
      dataIndex: 'proposedPrice',
      key: 'proposedPrice',
      width: 120,
      align: 'right',
      render: (val: number) => <Text strong style={{ color: colors.navy }}>{formatCurrency(val)}</Text>,
      sorter: (a: EnrichedProposal, b: EnrichedProposal) => a.proposedPrice - b.proposedPrice,
    },
    {
      title: 'Thời gian',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 90,
      align: 'center',
      render: (days: number) => `${days} ngày`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ProposalStatus) => {
        const cfg = proposalStatusConfig[status];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: 'Ngày lập',
      dataIndex: 'preparedAt',
      key: 'preparedAt',
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: (a: EnrichedProposal, b: EnrichedProposal) => new Date(a.preparedAt).getTime() - new Date(b.preparedAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_: unknown, record: EnrichedProposal) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} style={{ fontSize: 18 }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <DollarOutlined style={{ marginRight: 8 }} />
            Đề xuất & Dự toán
          </Title>
          <Text type="secondary">Quản lý phương án kỹ thuật và dự toán chi phí cho nhiệm vụ</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/proposals/create')}>
          Lập đề xuất mới
        </Button>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCardsData.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <div
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{
                background: card.gradient,
                borderRadius: 12, padding: '14px 16px 12px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div className="db-bg-icon" style={{
                position: 'absolute', top: -8, right: -8,
                fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1,
              }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>{card.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px', letterSpacing: '-0.5px' }}>
                {(card as any).isCurrency ? formatCurrency(card.value) : card.value}{' '}
                {card.unit && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.unit}</span>}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{card.sub}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filter Bar */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Space size={12} wrap>
              <Input
                placeholder="Tìm kiếm theo mã đề xuất, nhiệm vụ..."
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
                options={Object.entries(proposalStatusConfig).map(([key, cfg]) => ({
                  value: key, label: cfg.label,
                }))}
              />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {filteredProposals.length}/{enrichedProposals.length} kết quả
              </Text>
              {hasActiveFilters && (
                <Button size="small" onClick={handleClearFilters}>Xóa bộ lọc</Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <SolutionOutlined />
            </div>
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>Danh sách đề xuất & dự toán</Text>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredProposals}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} đề xuất`,
          }}
        />
      </Card>
    </div>
  );
};

export default ProposalListPage;
