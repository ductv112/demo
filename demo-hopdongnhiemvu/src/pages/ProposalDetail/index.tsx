import React, { useMemo } from 'react';
import {
  Card, Tag, Descriptions, Row, Col, Typography, Space, Table, Tabs,
  Button, Dropdown, Modal, message, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, SolutionOutlined, FileTextOutlined,
  MoreOutlined, EditOutlined, DeleteOutlined,
  PrinterOutlined, FileExcelOutlined, DollarOutlined,
  ToolOutlined, FieldTimeOutlined, TeamOutlined,
  InfoCircleOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { missions, proposals } from '../../data/missions';
import { departments } from '../../data/departments';
import {
  formatCurrency, formatCurrencyFull, formatNumber,
  proposalStatusConfig, missionStatusConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ProposalStatus, MissionStatus, CostItem, WorkVolume } from '../../types';

const { Title, Text } = Typography;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const sectionIcon = (icon: React.ReactNode, gradient: string) => (
  <div style={{
    width: 32, height: 32, borderRadius: 8, background: gradient,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 14,
  }}>{icon}</div>
);

const costCategoryConfig: Record<string, { label: string; color: string }> = {
  material: { label: 'Vật tư', color: '#2563eb' },
  labor: { label: 'Nhân công', color: '#059669' },
  equipment: { label: 'Thiết bị', color: '#d97706' },
  overhead: { label: 'Chi phí chung', color: '#7c3aed' },
  other: { label: 'Khác', color: '#6b7280' },
};

const summaryRow = (label: string, value: string | React.ReactNode, bold = false) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
    <Text style={{ fontSize: 13, color: '#666' }}>{label}</Text>
    {bold
      ? <Text strong style={{ fontSize: 13 }}>{value}</Text>
      : <Text style={{ fontSize: 13 }}>{value}</Text>
    }
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const proposal = useMemo(() => proposals.find(p => p.id === id), [id]);
  const mission = useMemo(
    () => (proposal ? missions.find(m => m.id === proposal.missionId) : undefined),
    [proposal],
  );

  if (!proposal) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy đề xuất</Title>
        <Button type="link" onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const proposalStatus = proposalStatusConfig[proposal.status as ProposalStatus];
  const canEdit = ['draft', 'revision', 'cost_rejected'].includes(proposal.status);
  const profitMargin = proposal.totalCost > 0
    ? (((proposal.proposedPrice - proposal.totalCost) / proposal.totalCost) * 100).toFixed(1)
    : '0';

  // ─── Derived totals ───────────────────────────────────────
  const totalDays = proposal.workVolumes.reduce((s, w) => s + w.estimatedDays, 0);
  const materialItems = proposal.costItems.filter(c => c.category === 'material' || c.category === 'equipment');
  const laborCostItems = proposal.costItems.filter(c => c.category === 'labor');

  // ─── Action Menu ──────────────────────────────────────────
  const actionMenuItems = [
    ...(canEdit ? [
      { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
      { key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true },
      { type: 'divider' as const },
    ] : []),
    { key: 'print', label: 'In hồ sơ', icon: <PrinterOutlined /> },
    { key: 'export', label: 'Xuất Excel', icon: <FileExcelOutlined /> },
  ];

  const handleActionClick = ({ key }: { key: string }) => {
    if (key === 'edit') { navigate(`/proposals/${id}/edit`); return; }
    if (key === 'delete') {
      Modal.confirm({
        title: 'Xác nhận xóa đề xuất',
        content: <p>Bạn có chắc chắn muốn xóa đề xuất <strong>{proposal.code}</strong>?</p>,
        okText: 'Xóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
        onOk: () => { message.success(`Đã xóa đề xuất ${proposal.code}`); navigate(-1); },
      });
      return;
    }
    message.info('Chức năng đang được phát triển');
  };

  // ═══════════════════════════════════════════════════════════
  // TAB 1: TỔNG QUAN
  // ═══════════════════════════════════════════════════════════
  const renderOverview = () => (
    <div>
      {/* Nhiệm vụ liên kết */}
      {mission && (
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
          title={<Space size={8}>{sectionIcon(<FileTextOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Nhiệm vụ liên kết</Text></Space>}>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
            labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}>
            <Descriptions.Item label="Mã nhiệm vụ"><Text strong style={{ color: colors.navy }}>{mission.code}</Text></Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={missionStatusConfig[mission.status as MissionStatus].color}>{missionStatusConfig[mission.status as MissionStatus].label}</Tag></Descriptions.Item>
            <Descriptions.Item label="Tên nhiệm vụ" span={2}>{mission.name}</Descriptions.Item>
            <Descriptions.Item label="Loại sản phẩm/hệ thống">{mission.equipmentType} — SL: {mission.equipmentQuantity}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị giao">{mission.requestingUnit}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Phương án kỹ thuật */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
        title={<Space size={8}>{sectionIcon(<ToolOutlined />, 'linear-gradient(135deg, #059669, #34d399)')}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Phương án kỹ thuật</Text></Space>}>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small"
          labelStyle={{ fontWeight: 600, color: colors.navy, width: 170, fontSize: 12 }}>
          <Descriptions.Item label="Phương án kỹ thuật" span={2}>{proposal.technicalPlan}</Descriptions.Item>
          <Descriptions.Item label="Quy trình công nghệ" span={2}>{proposal.workProcess}</Descriptions.Item>
          {proposal.configReference && (
            <Descriptions.Item label="Tham chiếu cấu hình" span={2}><Tag color="purple">{proposal.configReference}</Tag></Descriptions.Item>
          )}
          <Descriptions.Item label="Thời gian dự kiến"><Text strong style={{ color: colors.navy }}>{proposal.estimatedDuration} ngày</Text></Descriptions.Item>
          <Descriptions.Item label="Ngày lập">{proposal.preparedAt}</Descriptions.Item>
          {proposal.reviewNote && (
            <Descriptions.Item label="Nhận xét duyệt" span={2}><Text style={{ color: '#059669' }}>{proposal.reviewNote}</Text></Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Giá thành tổng hợp */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={<Space size={8}>{sectionIcon(<DollarOutlined />, 'linear-gradient(135deg, #D4A843, #f0d890)')}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Giá thành</Text></Space>}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${colors.navy}` }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tổng dự toán</Text>
              <Text strong style={{ fontSize: 20, color: colors.navy }}>{formatCurrencyFull(proposal.totalCost)}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ background: `${colors.gold}0a`, borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${colors.gold}` }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Giá đề xuất</Text>
              <Text strong style={{ fontSize: 20, color: colors.gold }}>{formatCurrencyFull(proposal.proposedPrice)}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ background: '#f6ffed', borderRadius: 10, padding: '16px 20px', borderLeft: '4px solid #52c41a' }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tỷ lệ lợi nhuận</Text>
              <Text strong style={{ fontSize: 20, color: '#52c41a' }}>{profitMargin}%</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB 2: QUY TRÌNH & KHỐI LƯỢNG
  // ═══════════════════════════════════════════════════════════
  const renderProcessAndVolumes = () => (
    <div>
      {/* Khối lượng công việc */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={<Space size={8}>{sectionIcon(<FieldTimeOutlined />, 'linear-gradient(135deg, #d97706, #fbbf24)')}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Khối lượng công việc</Text><Tag color="blue">{proposal.workVolumes.length} hạng mục</Tag></Space>}>
        <Table<WorkVolume>
          dataSource={proposal.workVolumes}
          columns={[
            { title: 'STT', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
            { title: 'Tên hạng mục', dataIndex: 'name', key: 'name' },
            { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 100 },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
            { title: 'Số ngày', dataIndex: 'estimatedDays', key: 'estimatedDays', width: 100, align: 'center', render: (v: number) => <Text strong>{v}</Text> },
            {
              title: 'Đơn vị thực hiện', dataIndex: 'assignedUnit', key: 'assignedUnit', width: 200,
              render: (unitId: string) => { const dept = departments.find(d => d.id === unitId); return dept ? <Tag color="blue">{dept.name}</Tag> : unitId; },
            },
          ]}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          summary={() => {
            const days = proposal.workVolumes.reduce((s, w) => s + w.estimatedDays, 0);
            return (
              <Table.Summary.Row style={{ background: '#f5f7fa' }}>
                <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center"><Text strong style={{ color: colors.navy }}>{days} ngày</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB 3: VẬT TƯ & NHÂN LỰC
  // ═══════════════════════════════════════════════════════════
  const costMiniCards = [
    { label: 'Vật tư', value: proposal.materialCost, gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', icon: <ToolOutlined /> },
    { label: 'Nhân công', value: proposal.laborCost, gradient: 'linear-gradient(135deg, #059669, #34d399)', icon: <TeamOutlined /> },
    { label: 'Thiết bị', value: proposal.equipmentCost, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', icon: <ToolOutlined /> },
    { label: 'Chi phí chung', value: proposal.overheadCost, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: <DollarOutlined /> },
  ];

  const renderMaterialsAndLabor = () => (
    <div>
      {/* Cost summary cards */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {costMiniCards.map((item, idx) => (
          <Col xs={12} md={6} key={idx}>
            <div style={{ background: item.gradient, borderRadius: 10, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -6, right: -6, fontSize: 48, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>{item.icon}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{formatCurrency(item.value)}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Vật tư & thiết bị */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
        title={<Space size={8}>{sectionIcon(<ToolOutlined />, 'linear-gradient(135deg, #2563eb, #60a5fa)')}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Vật tư & Thiết bị</Text><Tag color="blue">{materialItems.length} mục</Tag></Space>}>
        <Table<CostItem>
          dataSource={materialItems}
          columns={[
            { title: 'STT', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
            { title: 'Hạng mục', dataIndex: 'name', key: 'name' },
            { title: 'Phân loại', dataIndex: 'category', key: 'category', width: 120, render: (cat: string) => { const cfg = costCategoryConfig[cat]; return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : cat; } },
            { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 100 },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
            { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: (v: number) => formatNumber(v) },
            { title: 'Thành tiền (tr)', dataIndex: 'totalPrice', key: 'totalPrice', width: 140, align: 'right', render: (v: number) => <Text strong style={{ color: colors.navy }}>{formatNumber(v)}</Text> },
          ]}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          summary={() => {
            const total = materialItems.reduce((s, c) => s + c.totalPrice, 0);
            return (
              <Table.Summary.Row style={{ background: '#f5f7fa' }}>
                <Table.Summary.Cell index={0} colSpan={6} align="right"><Text strong>Tổng vật tư & thiết bị</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: colors.navy }}>{formatNumber(total)} tr</Text></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Nhân công */}
      {laborCostItems.length > 0 && (
        <Card className="db-chart-card" style={{ borderRadius: 14 }}
          title={<Space size={8}>{sectionIcon(<TeamOutlined />, 'linear-gradient(135deg, #059669, #34d399)')}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Nhân công</Text><Tag color="green">{laborCostItems.length} mục</Tag></Space>}>
          <Table<CostItem>
            dataSource={laborCostItems}
            columns={[
              { title: 'STT', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
              { title: 'Hạng mục', dataIndex: 'name', key: 'name' },
              { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 100 },
              { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
              { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: (v: number) => formatNumber(v) },
              { title: 'Thành tiền (tr)', dataIndex: 'totalPrice', key: 'totalPrice', width: 140, align: 'right', render: (v: number) => <Text strong style={{ color: '#059669' }}>{formatNumber(v)}</Text> },
            ]}
            rowKey="id"
            pagination={false}
            size="middle"
            bordered
            summary={() => {
              const total = laborCostItems.reduce((s, c) => s + c.totalPrice, 0);
              return (
                <Table.Summary.Row style={{ background: '#f5f7fa' }}>
                  <Table.Summary.Cell index={0} colSpan={5} align="right"><Text strong>Tổng nhân công</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: '#059669' }}>{formatNumber(total)} tr</Text></Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Card>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TAB 4: DỰ TOÁN CHI PHÍ
  // ═══════════════════════════════════════════════════════════
  const renderCostBreakdown = () => (
    <div>
      {/* Bảng chi tiết dự toán */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }}
        title={<Space size={8}>{sectionIcon(<DollarOutlined />, `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`)}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Chi tiết dự toán</Text><Tag color="blue">{proposal.costItems.length} hạng mục</Tag></Space>}>
        <Table<CostItem>
          dataSource={proposal.costItems}
          columns={[
            { title: 'STT', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
            { title: 'Hạng mục', dataIndex: 'name', key: 'name' },
            { title: 'Phân loại', dataIndex: 'category', key: 'category', width: 140, render: (cat: string) => { const cfg = costCategoryConfig[cat]; return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : cat; } },
            { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 120 },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
            { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: (v: number) => formatNumber(v) },
            { title: 'Thành tiền (tr)', dataIndex: 'totalPrice', key: 'totalPrice', width: 140, align: 'right', render: (v: number) => <Text strong style={{ color: colors.navy }}>{formatNumber(v)}</Text> },
          ]}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          summary={() => (
            <Table.Summary.Row style={{ background: '#f5f7fa' }}>
              <Table.Summary.Cell index={0} colSpan={6} align="right"><Text strong>TỔNG CỘNG</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: colors.navy, fontSize: 15 }}>{formatNumber(proposal.totalCost)} tr</Text></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Tổng hợp giá thành */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }}
        title={<Space size={8}>{sectionIcon(<DollarOutlined />, 'linear-gradient(135deg, #D4A843, #f0d890)')}<Text strong style={{ color: colors.navy, fontSize: 15 }}>Tổng hợp giá thành</Text></Space>}>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          {[
            { label: 'Vật tư', value: proposal.materialCost, color: '#2563eb' },
            { label: 'Nhân công', value: proposal.laborCost, color: '#059669' },
            { label: 'Thiết bị', value: proposal.equipmentCost, color: '#d97706' },
            { label: 'Chi phí chung', value: proposal.overheadCost, color: '#7c3aed' },
          ].map((item, idx) => (
            <Col xs={12} md={6} key={idx}>
              <div style={{ background: `${item.color}10`, borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${item.color}` }}>
                <Text style={{ fontSize: 13, color: '#666', display: 'block' }}>{item.label}</Text>
                <Text strong style={{ fontSize: 16, color: item.color }}>{formatCurrency(item.value)}</Text>
              </div>
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div style={{ background: `${colors.navy}08`, borderRadius: 8, padding: '14px 16px', borderLeft: `3px solid ${colors.navy}` }}>
              <Text style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Tổng dự toán</Text>
              <Text strong style={{ fontSize: 20, color: colors.navy }}>{formatCurrencyFull(proposal.totalCost)}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ background: `${colors.gold}0a`, borderRadius: 8, padding: '14px 16px', borderLeft: `3px solid ${colors.gold}` }}>
              <Text style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Giá đề xuất</Text>
              <Text strong style={{ fontSize: 20, color: colors.gold }}>{formatCurrencyFull(proposal.proposedPrice)}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ background: '#f6ffed', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #52c41a' }}>
              <Text style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Tỷ lệ lợi nhuận</Text>
              <Text strong style={{ fontSize: 20, color: '#52c41a' }}>{profitMargin}%</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // SUMMARY PANEL (sticky right)
  // ═══════════════════════════════════════════════════════════
  const renderSummary = () => (
    <div style={{ position: 'sticky', top: 80 }}>
      <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
        <Text strong style={{ color: colors.navy, fontSize: 14, display: 'block', marginBottom: 12 }}>Tổng hợp đề xuất</Text>

        {mission && (
          <div style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 10px', marginBottom: 12 }}>
            <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block' }}>{mission.code}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{mission.equipmentType}</Text>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          {summaryRow('KL công việc', `${proposal.workVolumes.length} hạng mục`, true)}
          {summaryRow('Tổng ngày', `${totalDays} ngày`, true)}
          <Divider style={{ margin: '8px 0' }} />
          {summaryRow('Vật tư', `${materialItems.length} mục`, true)}
          {summaryRow('Nhân công', `${laborCostItems.length} mục`, true)}
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {summaryRow('CP Vật tư', formatCurrency(proposal.materialCost))}
        {summaryRow('CP Nhân công', formatCurrency(proposal.laborCost))}
        {summaryRow('CP Thiết bị', formatCurrency(proposal.equipmentCost))}
        {summaryRow('CP Chung', formatCurrency(proposal.overheadCost))}

        <div style={{
          background: `${colors.navy}08`, borderRadius: 6, padding: '10px 12px', marginTop: 8,
          borderLeft: `3px solid ${colors.navy}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 12, color: colors.navy }}>TỔNG DỰ TOÁN</Text>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>{formatCurrency(proposal.totalCost)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>Giá đề xuất</Text>
            <Text strong style={{ fontSize: 12, color: '#059669' }}>{formatCurrency(proposal.proposedPrice)}</Text>
          </div>
        </div>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════
  const tabItems = [
    {
      key: 'overview',
      label: <span><InfoCircleOutlined style={{ marginRight: 6 }} />Tổng quan</span>,
      children: renderOverview(),
    },
    {
      key: 'process',
      label: <span><FieldTimeOutlined style={{ marginRight: 6 }} />Quy trình & Khối lượng ({proposal.workVolumes.length})</span>,
      children: renderProcessAndVolumes(),
    },
    {
      key: 'materials',
      label: <span><AppstoreOutlined style={{ marginRight: 6 }} />Vật tư & Nhân lực ({proposal.costItems.length})</span>,
      children: renderMaterialsAndLabor(),
    },
    {
      key: 'costBreakdown',
      label: <span><DollarOutlined style={{ marginRight: 6 }} />Dự toán chi phí</span>,
      children: renderCostBreakdown(),
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Hero Banner */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#fff' }} onClick={() => navigate(-1)} />
            <SolutionOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{mission ? mission.name : proposal.code}</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>{proposal.code}</Tag>
                {mission && <Tag style={{ borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>{mission.code}</Tag>}
              </Space>
            </div>
          </Space>
          <Space>
            <Tag color={proposalStatus.color} style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}>{proposalStatus.label}</Tag>
            <Dropdown menu={{ items: actionMenuItems, onClick: handleActionClick }} trigger={['click']}>
              <Button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* Main Content: 2 columns */}
      <Row gutter={16}>
        <Col xs={24} lg={17}>
          <Tabs defaultActiveKey="overview" items={tabItems} type="card" />
        </Col>
        <Col xs={0} lg={7}>
          {renderSummary()}
        </Col>
      </Row>
    </div>
  );
};

export default ProposalDetailPage;
