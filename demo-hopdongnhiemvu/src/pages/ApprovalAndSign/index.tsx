import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Input, Select, Space,
  Dropdown, Badge, Tabs,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  AuditOutlined, SearchOutlined, EyeOutlined, MoreOutlined,
  FileTextOutlined, DollarOutlined, CheckCircleOutlined,
  ClockCircleOutlined, TeamOutlined, FileProtectOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

import { missions, proposals } from '../../data/missions';
import { contracts } from '../../data/contracts';
import {
  formatCurrency, formatDate,
  proposalStatusConfig, missionTypeConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { Proposal, ProposalStatus } from '../../types';

const { Title, Text } = Typography;

// Các trạng thái thuộc QT3
const QT3_STATUSES: ProposalStatus[] = [
  'pending_cost_review', 'cost_reviewing', 'cost_reviewed', 'cost_rejected',
  'pending_approval', 'approved', 'rejected', 'revision',
  'negotiating', 'contract_created', 'contract_signed',
];

const ApprovalAndSignPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDirector } = useUser();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('pending');

  // Tất cả hồ sơ ĐX thuộc QT3
  const allQT3Proposals = useMemo(() => {
    return proposals
      .filter(p => QT3_STATUSES.includes(p.status))
      .map(p => {
        const m = missions.find(ms => ms.id === p.missionId);
        const c = contracts.find(ct => ct.proposalId === p.id);
        return {
          ...p,
          missionCode: m?.code || '',
          missionName: m?.name || '',
          missionType: m?.missionType || '',
          requestingUnit: m?.requestingUnit || '',
          equipmentType: m?.equipmentType || '',
          contractCode: c?.code,
          contractStatus: c?.status,
        };
      });
  }, []);

  // Filter theo tab + search + status
  const filteredProposals = useMemo(() => {
    let result = allQT3Proposals;
    if (activeTab === 'pending') {
      result = result.filter(p => ['pending_cost_review', 'cost_reviewing', 'cost_reviewed', 'pending_approval'].includes(p.status));
    } else if (activeTab === 'approved') {
      result = result.filter(p => ['approved', 'negotiating', 'contract_created'].includes(p.status));
    } else if (activeTab === 'completed') {
      result = result.filter(p => ['contract_signed'].includes(p.status));
    } else if (activeTab === 'returned') {
      result = result.filter(p => ['cost_rejected', 'rejected', 'revision'].includes(p.status));
    }
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(p => p.code.toLowerCase().includes(kw) || p.missionName.toLowerCase().includes(kw) || p.missionCode.toLowerCase().includes(kw));
    }
    if (filterStatus) {
      result = result.filter(p => p.status === filterStatus);
    }
    return result;
  }, [allQT3Proposals, activeTab, searchText, filterStatus]);

  const handleClearFilters = () => { setSearchText(''); setFilterStatus(undefined); };
  const hasActiveFilters = searchText || filterStatus;

  // Stats
  const pendingCount = allQT3Proposals.filter(p => ['pending_cost_review', 'cost_reviewing', 'cost_reviewed', 'pending_approval'].includes(p.status)).length;
  const approvedCount = allQT3Proposals.filter(p => ['approved', 'negotiating', 'contract_created'].includes(p.status)).length;
  const completedCount = allQT3Proposals.filter(p => p.status === 'contract_signed').length;
  const returnedCount = allQT3Proposals.filter(p => ['cost_rejected', 'rejected', 'revision'].includes(p.status)).length;

  type EnrichedProposal = typeof allQT3Proposals[0];

  const getActionMenu = (record: EnrichedProposal): MenuProps['items'] => {
    const items: MenuProps['items'] = [];
    const s = record.status;

    // Chờ thẩm định TC
    if (['pending_cost_review', 'cost_reviewing'].includes(s)) {
      items.push({ key: 'workflow', icon: <AuditOutlined />, label: 'Gửi tài chính', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
    }
    // Đã thẩm định, chờ trình BGĐ
    if (s === 'cost_reviewed') {
      items.push({ key: 'workflow', icon: <AuditOutlined />, label: 'Gửi phê duyệt', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
    }
    // Chờ BGĐ duyệt — chỉ xem
    if (s === 'pending_approval') {
      items.push({ key: 'workflow', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
    }

    // Đã duyệt — bắt đầu đàm phán
    if (s === 'approved') {
      items.push({ key: 'workflow', icon: <AuditOutlined />, label: 'Bắt đầu đàm phán', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
    }
    // Đang đàm phán
    if (s === 'negotiating') {
      items.push({ key: 'workflow', icon: <AuditOutlined />, label: 'Xử lý đàm phán', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
      items.push({ key: 'create-contract', icon: <FileProtectOutlined />, label: 'Tạo hợp đồng', onClick: () => navigate(`/contracts/create?proposalId=${record.id}`) });
    }
    if (s === 'contract_created') {
      items.push({ key: 'workflow', icon: <AuditOutlined />, label: 'Trình ký kết', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
      if (record.contractCode) {
        items.push({ key: 'view-contract', icon: <FileProtectOutlined />, label: 'Xem hợp đồng', onClick: () => { const c = contracts.find(ct => ct.proposalId === record.id); if (c) navigate(`/contracts/${c.id}`); } });
      }
    }

    // Đã ký HĐ
    if (s === 'contract_signed') {
      if (record.contractCode) {
        items.push({ key: 'view-contract', icon: <FileProtectOutlined />, label: 'Xem hợp đồng', onClick: () => { const c = contracts.find(ct => ct.proposalId === record.id); if (c) navigate(`/contracts/${c.id}`); } });
      }
      items.push({ key: 'workflow', icon: <EyeOutlined />, label: 'Xem lịch sử xử lý', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
    }

    // Trả lại
    if (['cost_rejected', 'rejected', 'revision'].includes(s)) {
      items.push({ key: 'edit', icon: <EyeOutlined />, label: 'Chỉnh sửa đề xuất', onClick: () => navigate(`/proposals/${record.id}/edit`) });
      items.push({ key: 'workflow', icon: <AuditOutlined />, label: 'Xem lý do trả lại', onClick: () => navigate(`/approval-sign/workflow/${record.id}`) });
    }

    // Xem đề xuất gốc — chỉ khi chưa có link xem chi tiết
    if (!['pending_approval', 'contract_signed'].includes(s)) {
      items.push({ type: 'divider' });
      items.push({ key: 'view', icon: <EyeOutlined />, label: 'Xem đề xuất gốc', onClick: () => navigate(`/proposals/${record.id}`) });
    }

    return items;
  };

  const columns: ColumnsType<EnrichedProposal> = [
    {
      title: 'Mã ĐX', dataIndex: 'code', key: 'code', width: 120,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 13 }}>{code}</Text>,
    },
    {
      title: 'Nhiệm vụ', key: 'mission', ellipsis: true,
      render: (_: unknown, r: EnrichedProposal) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.missionName}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.missionCode} — {r.equipmentType}</Text></div>
        </div>
      ),
    },
    {
      title: 'Đơn vị', dataIndex: 'requestingUnit', key: 'unit', width: 140,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Loại NV', dataIndex: 'missionType', key: 'type', width: 100,
      render: (type: string) => {
        const cfg = missionTypeConfig[type as keyof typeof missionTypeConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Tổng dự toán', dataIndex: 'totalCost', key: 'cost', width: 110, align: 'right',
      render: (v: number) => <Text strong style={{ fontSize: 13 }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Giá đề xuất', dataIndex: 'proposedPrice', key: 'price', width: 110, align: 'right',
      render: (v: number) => <Text strong style={{ fontSize: 13, color: colors.navy }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (status: ProposalStatus) => {
        const cfg = proposalStatusConfig[status];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: 'HĐ', key: 'contract', width: 100,
      render: (_: unknown, r: EnrichedProposal) => r.contractCode
        ? <Tag color="purple">{r.contractCode}</Tag>
        : <Text type="secondary" style={{ fontSize: 11 }}>Chưa tạo</Text>,
    },
    {
      title: 'Thao tác', key: 'action', width: 80, fixed: 'right',
      render: (_: unknown, r: EnrichedProposal) => (
        <Dropdown menu={{ items: getActionMenu(r) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} style={{ fontSize: 18 }} />
        </Dropdown>
      ),
    },
  ];

  const tabItems = [
    { key: 'pending', label: <span><ClockCircleOutlined style={{ marginRight: 4 }} />Chờ xử lý <Badge count={pendingCount} style={{ marginLeft: 6 }} /></span> },
    { key: 'approved', label: <span><CheckCircleOutlined style={{ marginRight: 4 }} />Đã duyệt / Đàm phán <Badge count={approvedCount} style={{ marginLeft: 6, background: '#059669' }} /></span> },
    { key: 'completed', label: <span><FileProtectOutlined style={{ marginRight: 4 }} />Đã ký HĐ <Badge count={completedCount} style={{ marginLeft: 6, background: '#7c3aed' }} /></span> },
    { key: 'returned', label: <span><FileTextOutlined style={{ marginRight: 4 }} />Trả lại <Badge count={returnedCount} style={{ marginLeft: 6, background: '#dc2626' }} showZero={false} /></span> },
  ];

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: colors.navy }}>
          <AuditOutlined style={{ marginRight: 8 }} />Phê duyệt & Ký kết hợp đồng
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Thẩm định tài chính, phê duyệt phương án, đàm phán và ký kết hợp đồng
        </Text>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { title: 'Tổng hồ sơ', value: allQT3Proposals.length, suffix: 'hồ sơ', icon: <FileTextOutlined />, gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)` },
          { title: 'Chờ xử lý', value: pendingCount, suffix: 'hồ sơ', icon: <ClockCircleOutlined />, gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)' },
          { title: 'Đã duyệt / Đàm phán', value: approvedCount, suffix: 'hồ sơ', icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' },
          { title: 'Đã ký HĐ', value: completedCount, suffix: 'hồ sơ', icon: <FileProtectOutlined />, gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' },
          { title: 'Trả lại', value: returnedCount, suffix: 'hồ sơ', icon: <DollarOutlined />, gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' },
        ].map((card, idx) => (
          <div key={idx} style={{ flex: '1 1 0', minWidth: 150 }}>
            <div className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{ background: card.gradient, borderRadius: 12, padding: '14px 16px 12px', position: 'relative', overflow: 'hidden' }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -8, fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff' }}>{card.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px' }}>
                {card.value} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Filter + Table */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 16 }} />

        {/* Filter Bar */}
        <Row gutter={12} align="middle" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space size={12} wrap>
              <Input placeholder="Tìm theo mã ĐX, nhiệm vụ..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 300 }} allowClear value={searchText} onChange={e => setSearchText(e.target.value)} />
              <Select placeholder="Trạng thái" style={{ width: 180 }} allowClear value={filterStatus} onChange={setFilterStatus}
                options={QT3_STATUSES.map(s => ({ value: s, label: proposalStatusConfig[s]?.label || s }))} />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredProposals.length}/{allQT3Proposals.length} kết quả</Text>
              {hasActiveFilters && <Button size="small" onClick={handleClearFilters}>Xóa bộ lọc</Button>}
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProposals}
          rowKey="id"
          size="middle"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `Tổng ${t} hồ sơ` }}
          onRow={record => ({ onDoubleClick: () => navigate(`/approval-sign/workflow/${record.id}`) })}
        />
      </Card>
    </div>
  );
};

export default ApprovalAndSignPage;
