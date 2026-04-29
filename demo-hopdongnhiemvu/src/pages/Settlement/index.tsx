import React, { useState, useMemo } from 'react';
import {
  Card, Row, Col, Table, Tag, Typography, Input, Select, Button,
  Space, Tooltip, Modal, message, Progress, Badge, Dropdown,
} from 'antd';
import {
  AuditOutlined, FileTextOutlined, DollarOutlined, CheckCircleOutlined,
  ReconciliationOutlined, SyncOutlined, EyeOutlined, FileDoneOutlined,
  SendOutlined, LockOutlined, SearchOutlined, PlusOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, SafetyCertificateOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { contracts } from '../../data/contracts';
import {
  settlements,
  getVarianceReport,
  getContractClosure,
} from '../../data/settlement';
import { formatCurrency, formatDate, settlementStatusConfig, contractStatusConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Settlement } from '../../types';

const { Title, Text } = Typography;

interface SettlementRow extends Settlement {
  contractCode: string;
  contractName: string;
  partnerUnit: string;
}

const SettlementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);

  // Build flat rows — only "current" version per contract (latest non-closed, or latest)
  const allRows = useMemo<SettlementRow[]>(() => {
    return settlements.map(s => {
      const c = contracts.find(c => c.id === s.contractId);
      return {
        ...s,
        contractCode: c?.code ?? s.contractId,
        contractName: c?.name ?? '—',
        partnerUnit: c?.partnerUnit ?? '—',
      };
    });
  }, []);

  const filtered = useMemo(() => {
    return allRows.filter(r => {
      const q = searchText.toLowerCase();
      const matchSearch = !searchText ||
        r.code.toLowerCase().includes(q) ||
        r.contractCode.toLowerCase().includes(q) ||
        r.contractName.toLowerCase().includes(q) ||
        r.partnerUnit.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = typeFilter === 'all' || r.settlementType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [allRows, searchText, statusFilter, typeFilter]);

  // Stats
  const approvedCount = allRows.filter(r => r.status === 'approved').length;
  const reviewingCount = allRows.filter(r => r.status === 'reviewing' || r.status === 'submitted').length;
  const draftCount = allRows.filter(r => r.status === 'draft' || r.status === 'compiling').length;
  const closedContracts = contracts.filter(c => getContractClosure(c.id)).length;
  const totalActual = allRows
    .filter(r => r.status === 'approved')
    .reduce((s, r) => s + r.actualCost, 0);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); message.success('Đã đồng bộ chi phí từ phân hệ Tài chính Kế toán'); }, 1500);
  };

  const handleCreate = () => {
    message.info('Chọn hợp đồng để lập quyết toán từ màn chi tiết hợp đồng');
  };

  const handleCloseContract = (row: SettlementRow) => {
    const closure = getContractClosure(row.contractId);
    if (closure) {
      message.warning('Hợp đồng này đã được đóng');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận đóng hợp đồng',
      content: `Đóng hợp đồng "${row.contractName}" (${row.contractCode})? Hành động này không thể hoàn tác.`,
      okText: 'Đóng hợp đồng',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => message.success(`Đã đóng hợp đồng ${row.contractCode}`),
    });
  };

  const getVarianceBadge = (row: SettlementRow) => {
    const pct = row.costVariancePct;
    if (pct > 5) return <Tag color="red" style={{ fontSize: 11 }}>+{pct.toFixed(1)}%</Tag>;
    if (pct > 0) return <Tag color="orange" style={{ fontSize: 11 }}>+{pct.toFixed(1)}%</Tag>;
    if (pct < -3) return <Tag color="green" style={{ fontSize: 11 }}>{pct.toFixed(1)}%</Tag>;
    return <Tag color="blue" style={{ fontSize: 11 }}>{pct.toFixed(1)}%</Tag>;
  };

  const statCards = [
    {
      title: 'Tổng thực chi đã duyệt',
      value: formatCurrency(totalActual),
      icon: <DollarOutlined />,
      gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
    },
    {
      title: 'Đã phê duyệt',
      value: approvedCount.toString(), suffix: 'QT',
      icon: <CheckCircleOutlined />,
      gradient: `linear-gradient(135deg, ${colors.success} 0%, #73d13d 100%)`,
    },
    {
      title: 'Đang xem xét / trình duyệt',
      value: reviewingCount.toString(), suffix: 'QT',
      icon: <ClockCircleOutlined />,
      gradient: `linear-gradient(135deg, ${colors.warning} 0%, #ffc53d 100%)`,
    },
    {
      title: 'Hợp đồng đã đóng',
      value: closedContracts.toString(), suffix: 'HĐ',
      icon: <SafetyCertificateOutlined />,
      gradient: `linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)`,
    },
  ];

  const columns: ColumnsType<SettlementRow> = [
    {
      title: 'Mã QT',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string, row) => (
        <div>
          <Text
            strong
            style={{ fontSize: 13, color: colors.navy, cursor: 'pointer' }}
            onClick={() => navigate(`/settlement/${row.id}`)}
          >
            {code}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>v{row.version}</Text>
            {row.isLocked && (
              <Tooltip title="Đã khóa — không thể chỉnh sửa">
                <LockOutlined style={{ fontSize: 10, color: '#999' }} />
              </Tooltip>
            )}
            {row.settlementType === 'partial' && (
              <Tag style={{ fontSize: 10, padding: '0 4px', margin: 0 }} color="blue">Từng phần</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Hợp đồng',
      key: 'contract',
      ellipsis: true,
      render: (_: unknown, row) => (
        <div>
          <Text
            strong
            style={{ fontSize: 12, color: colors.navy, cursor: 'pointer' }}
            onClick={() => navigate(`/contracts/${row.contractId}`)}
          >
            {row.contractCode}
          </Text>
          <div style={{ fontSize: 12, color: '#555', marginTop: 1 }}>{row.contractName}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.partnerUnit}</Text>
        </div>
      ),
    },
    {
      title: 'Kỳ QT',
      key: 'period',
      width: 170,
      render: (_: unknown, row) => (
        <Text style={{ fontSize: 12 }}>
          {formatDate(row.coveredPeriod.from)} – {formatDate(row.coveredPeriod.to)}
        </Text>
      ),
    },
    {
      title: 'Dự toán',
      dataIndex: 'plannedCost',
      key: 'plannedCost',
      width: 100,
      render: (v: number) => <Text style={{ fontSize: 12 }}>{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.plannedCost - b.plannedCost,
    },
    {
      title: 'Thực chi',
      dataIndex: 'actualCost',
      key: 'actualCost',
      width: 100,
      render: (v: number) => <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.actualCost - b.actualCost,
    },
    {
      title: 'Chênh lệch',
      key: 'variance',
      width: 120,
      render: (_: unknown, row) => {
        const vr = getVarianceReport(row.id);
        return (
          <div>
            <Text style={{
              fontSize: 12, fontWeight: 500,
              color: row.costVariance > 0 ? colors.danger : colors.success,
            }}>
              {row.costVariance > 0 ? '+' : ''}{formatCurrency(row.costVariance)}
            </Text>
            <div style={{ marginTop: 2 }}>
              {getVarianceBadge(row)}
              {vr?.explanationRequired && !vr.approvedWithVariance && (
                <Tooltip title="Cần giải trình chênh lệch">
                  <ExclamationCircleOutlined style={{ color: colors.warning, fontSize: 12, marginLeft: 4 }} />
                </Tooltip>
              )}
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.costVariance - b.costVariance,
    },
    {
      title: 'Lợi nhuận',
      key: 'profit',
      width: 110,
      render: (_: unknown, row) => (
        <div>
          <Text style={{
            fontSize: 12, fontWeight: 500,
            color: row.grossProfit >= 0 ? colors.success : colors.danger,
          }}>
            {row.grossProfit > 0 ? '+' : ''}{formatCurrency(row.grossProfit)}
          </Text>
          <div style={{ marginTop: 2 }}>
            <Progress
              percent={Math.min(Math.abs(row.profitMargin), 30) / 30 * 100}
              showInfo={false}
              size="small"
              strokeColor={row.profitMargin >= 0 ? colors.success : colors.danger}
              style={{ width: 70 }}
            />
            <Text type="secondary" style={{ fontSize: 10 }}>{row.profitMargin.toFixed(1)}%</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const cfg = settlementStatusConfig[status as keyof typeof settlementStatusConfig];
        const closure = settlements.find(s => s.status === status);
        return (
          <div>
            {cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{status}</Tag>}
            {closure?.reconciliationStatus === 'discrepancy' && (
              <div style={{ marginTop: 2 }}>
                <Tag color="red" style={{ fontSize: 10, padding: '0 4px' }}>Lệch TC</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Người lập',
      dataIndex: 'preparedBy',
      key: 'preparedBy',
      width: 140,
      render: (name: string, row) => (
        <div>
          <Text style={{ fontSize: 12 }}>{name}</Text>
          <div style={{ fontSize: 11, color: '#999' }}>{formatDate(row.preparedAt)}</div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      fixed: 'right',
      align: 'center' as const,
      render: (_: unknown, row) => {
        const closure = getContractClosure(row.contractId);
        const menuItems = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/settlement/${row.id}`),
          },
          ...(row.status === 'draft' ? [{
            key: 'submit',
            label: 'Trình duyệt',
            icon: <SendOutlined />,
            onClick: () => message.success(`Đã trình duyệt ${row.code}`),
          }] : []),
          ...(row.status === 'approved' && !closure ? [{
            key: 'close',
            label: 'Đóng hợp đồng',
            icon: <LockOutlined />,
            danger: true,
            onClick: () => handleCloseContract(row),
          }] : []),
          ...(closure ? [{
            key: 'closed',
            label: 'HĐ đã đóng',
            icon: <SafetyCertificateOutlined />,
            disabled: true,
          }] : []),
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: colors.navy }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...Object.entries(settlementStatusConfig).map(([k, v]) => ({ value: k, label: v.label })),
  ];

  const typeOptions = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'partial', label: 'Quyết toán từng phần' },
    { value: 'final', label: 'Quyết toán toàn bộ' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <ReconciliationOutlined style={{ marginRight: 8 }} />Quản lý quyết toán
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tổng hợp chi phí, đối chiếu dự toán và quyết toán hợp đồng
          </Text>
        </div>
        <Space>
          <Button
            icon={<SyncOutlined spin={syncing} />}
            loading={syncing}
            onClick={handleSync}
          >
            Đồng bộ TC
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ background: colors.navy }}
          >
            Lập quyết toán
          </Button>
        </Space>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card className="db-stat-card" styles={{ body: { padding: 0 } }} bordered={false}>
              <div style={{
                background: card.gradient,
                padding: '20px 20px 18px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div className="db-bg-icon" style={{
                  position: 'absolute', top: -8, right: -8,
                  fontSize: 64, opacity: 0.1, color: '#fff',
                }}>
                  {card.icon}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16, marginBottom: 12,
                }}>
                  {card.icon}
                </div>
                <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '32px' }}>
                  {card.value}
                  {'suffix' in card && card.suffix && (
                    <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>{card.suffix}</span>
                  )}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>{card.title}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Draft warning */}
      {draftCount > 0 && (
        <Card
          bordered={false}
          style={{
            marginBottom: 16,
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: 8,
          }}
          styles={{ body: { padding: '10px 16px' } }}
        >
          <Space>
            <ExclamationCircleOutlined style={{ color: colors.warning }} />
            <Text style={{ color: '#8a5700', fontSize: 13 }}>
              Có <strong>{draftCount}</strong> hồ sơ quyết toán đang ở trạng thái nháp — chưa trình duyệt.
            </Text>
          </Space>
        </Card>
      )}

      {/* Table */}
      <Card
        className="db-chart-card"
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16,
            }}>
              <FileTextOutlined />
            </div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Danh sách hồ sơ quyết toán</span>
            <Badge count={filtered.length} style={{ background: colors.navyLight }} />
          </div>
        }
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Tìm mã QT, mã HĐ, tên, đơn vị..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            style={{ width: 180 }}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            style={{ width: 180 }}
          />
          <Text type="secondary" style={{ fontSize: 13, marginLeft: 'auto' }}>
            {filtered.length}/{allRows.length} hồ sơ
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1300 }}
          onRow={row => ({
            onDoubleClick: () => navigate(`/settlement/${row.id}`),
            style: { cursor: 'default' },
          })}
          rowClassName={row => {
            if (row.isLocked) return '';
            if (row.status === 'reviewing') return '';
            return '';
          }}
        />
      </Card>
    </div>
  );
};

export default SettlementPage;
