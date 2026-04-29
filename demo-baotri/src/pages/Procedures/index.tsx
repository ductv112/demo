import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Typography, Row, Col, Input, Select,
  Dropdown, Tabs, Badge,
} from 'antd';
import {
  FileTextOutlined, CheckCircleOutlined, EditOutlined, BookOutlined,
  SearchOutlined, PlusOutlined, EyeOutlined, CopyOutlined, MoreOutlined,
  SafetyCertificateOutlined, ToolOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import type { MaintenanceProcedure, ProcedureStatus } from '../../types';
import { procedureStatusConfig, formatDate } from '../../utils/format';
import { procedures } from '../../data/procedures';

const { Title, Text } = Typography;

// ─── Document type config ─────────────────────────────────────
const docTypeConfig: Record<string, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#ff4d4f' },
  manual: { label: 'Tài liệu', color: '#1B3A5C' },
  diagram: { label: 'Sơ đồ', color: '#1890ff' },
  drawing: { label: 'Bản vẽ', color: '#52c41a' },
};

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: number; icon: React.ReactNode;
  gradient: string; suffix?: string;
}> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="db-stat-card"
    style={{ background: gradient, border: 'none', borderRadius: 14 }}
    styles={{ body: { padding: '20px 20px 16px' } }}
  >
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 }}>{title}</div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>
            {value}
            {suffix && <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
    </div>
    <div className="db-bg-icon" style={{
      position: 'absolute', top: 12, right: 16, fontSize: 64,
      color: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
    }}>
      {icon}
    </div>
  </Card>
);

// ─── Expanded Row Content ──────────────────────────────────────
const ExpandedRow: React.FC<{ record: MaintenanceProcedure }> = ({ record }) => {
  const workItemColumns: ColumnsType<MaintenanceProcedure['workItemTemplates'][number]> = [
    {
      title: 'STT', dataIndex: 'order', width: 60, align: 'center',
      render: (order: number) => <Text strong>{order}</Text>,
    },
    {
      title: 'Tên hạng mục', dataIndex: 'name', ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Mô tả', dataIndex: 'description', ellipsis: true,
      render: (desc?: string) => desc || <Text type="secondary">-</Text>,
    },
    {
      title: 'TG (giờ)', dataIndex: 'estimatedHours', width: 90, align: 'center',
      render: (h: number) => <Text>{h}</Text>,
    },
    {
      title: 'Bắt buộc', dataIndex: 'isMandatory', width: 90, align: 'center',
      render: (v: boolean) => v
        ? <Tag color="error">Bắt buộc</Tag>
        : <Tag>Tùy chọn</Tag>,
    },
    {
      title: 'Số checklist', key: 'checklist', width: 110, align: 'center',
      render: (_, row) => (
        <Badge count={row.checklistItems.length} style={{ backgroundColor: '#1B3A5C' }} showZero />
      ),
    },
  ];

  const partColumns: ColumnsType<MaintenanceProcedure['suggestedParts'][number]> = [
    {
      title: 'Mã vật tư', dataIndex: 'partCode', width: 140,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>,
    },
    { title: 'Tên vật tư', dataIndex: 'partName', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'quantity', width: 90, align: 'center' },
    { title: 'ĐVT', dataIndex: 'unit', width: 80, align: 'center' },
    {
      title: 'Ghi chú', dataIndex: 'notes', ellipsis: true,
      render: (notes?: string) => notes || <Text type="secondary">-</Text>,
    },
  ];

  const tabItems = [
    {
      key: 'workItems',
      label: (
        <span>
          <ToolOutlined style={{ marginRight: 6 }} />
          Hạng mục công việc ({record.workItemTemplates.length})
        </span>
      ),
      children: (
        <Table
          columns={workItemColumns}
          dataSource={record.workItemTemplates}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 600 }}
        />
      ),
    },
    {
      key: 'parts',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          Vật tư gợi ý ({record.suggestedParts.length})
        </span>
      ),
      children: record.suggestedParts.length > 0 ? (
        <Table
          columns={partColumns}
          dataSource={record.suggestedParts}
          rowKey="partCode"
          pagination={false}
          size="small"
          scroll={{ x: 500 }}
        />
      ) : (
        <Text type="secondary">Chưa có vật tư gợi ý</Text>
      ),
    },
    {
      key: 'documents',
      label: (
        <span>
          <BookOutlined style={{ marginRight: 6 }} />
          Tài liệu ({record.documents.length})
        </span>
      ),
      children: record.documents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {record.documents.map((doc) => {
            const cfg = docTypeConfig[doc.type] || { label: doc.type, color: '#1B3A5C' };
            return (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 12px', background: '#f5f7fa', borderRadius: 8,
              }}>
                <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 13 }}>{doc.name}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>{doc.fileName}</Text>
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 12 }}>
                      {formatDate(doc.uploadDate)}
                    </Text>
                  </div>
                </div>
                <Button type="link" size="small" icon={<EyeOutlined />}>Xem</Button>
              </div>
            );
          })}
        </div>
      ) : (
        <Text type="secondary">Chưa có tài liệu</Text>
      ),
    },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      <Tabs items={tabItems} size="small" />
    </div>
  );
};

// ─── Page Component ────────────────────────────────────────────
const ProceduresPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcedureStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    let result = procedures;
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(lower) || r.code.toLowerCase().includes(lower),
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    if (categoryFilter) result = result.filter((r) => r.equipmentCategory === categoryFilter);
    return result;
  }, [searchText, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: procedures.length,
    active: procedures.filter((p) => p.status === 'active').length,
    draft: procedures.filter((p) => p.status === 'draft').length,
    docs: procedures.reduce((s, p) => s + p.documents.length, 0),
  }), []);

  const columns: ColumnsType<MaintenanceProcedure> = [
    {
      title: 'Mã QT', dataIndex: 'code', width: 150,
      render: (code: string) => <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>,
    },
    {
      title: 'Tên quy trình', dataIndex: 'name', ellipsis: true,
      render: (_: string, record: MaintenanceProcedure) => (
        <div>
          <Text strong>{record.name}</Text>
          <Tag style={{ marginLeft: 8, fontSize: 11 }}>v{record.version}</Tag>
        </div>
      ),
    },
    {
      title: 'Loại TB', dataIndex: 'equipmentType', width: 160, ellipsis: true,
    },
    {
      title: 'Loại BT', dataIndex: 'type', width: 110, align: 'center',
      render: (type: string) => (
        <Tag color={type === 'periodic' ? 'processing' : 'warning'}>
          {type === 'periodic' ? 'Định kỳ' : 'Sửa chữa'}
        </Tag>
      ),
    },
    {
      title: 'Hạng mục', key: 'workItems', width: 100, align: 'center',
      render: (_, record) => (
        <Text>{record.workItemTemplates.length} mục</Text>
      ),
    },
    {
      title: 'TG dự kiến', dataIndex: 'totalEstimatedHours', width: 100, align: 'center',
      render: (hours: number) => <Text>{hours} giờ</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 120, align: 'center',
      render: (status: ProcedureStatus) => {
        const cfg = procedureStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Phiên bản', key: 'versionCol', width: 110, align: 'center',
      render: (_, record) => (
        <div>
          <div><Tag>v{record.version}</Tag></div>
          <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(record.updatedDate)}</Text>
        </div>
      ),
    },
    {
      title: '', key: 'action', width: 50, align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/procedures/${record.id}`) },
          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
          { key: 'copy', icon: <CopyOutlined />, label: 'Nhân bản' },
        ]}} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18, flexShrink: 0,
        }}>
          <FileTextOutlined />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
            Quy trình & Hướng dẫn bảo trì
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Chuẩn hóa quy trình, checklist, tài liệu kỹ thuật cho từng loại thiết bị
          </Text>
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Tổng quy trình" value={stats.total} icon={<FileTextOutlined />}
            gradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Đang áp dụng" value={stats.active} icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #237804, #52c41a)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Bản nháp" value={stats.draft} icon={<EditOutlined />}
            gradient="linear-gradient(135deg, #b8860b, #D4A843)" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Tài liệu kỹ thuật" value={stats.docs} icon={<BookOutlined />}
            gradient="linear-gradient(135deg, #0e7490, #22d3ee)" />
        </Col>
      </Row>

      {/* Filter & Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm mã QT, tên quy trình..."
            style={{ width: 280 }}
            allowClear
            prefix={<SearchOutlined />}
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => { if (!e.target.value) setSearchText(''); }}
          />
          <Select
            placeholder="Trạng thái" allowClear style={{ width: 160 }}
            onChange={(v) => setStatusFilter(v)}
            options={[
              { value: 'active', label: 'Đang áp dụng' },
              { value: 'draft', label: 'Bản nháp' },
              { value: 'archived', label: 'Lưu trữ' },
            ]}
          />
          <Select
            placeholder="Loại thiết bị" allowClear style={{ width: 160 }}
            onChange={(v) => setCategoryFilter(v)}
            options={[
              { value: 'radar', label: 'Monitoring' },
              { value: 'missile', label: 'Sản phẩm chủ lực' },
              { value: 'communication', label: 'Truyền thông' },
              { value: 'electronic', label: 'Điện tử' },
              { value: 'mechanical', label: 'Cơ khí' },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1B3A5C' }}
            onClick={() => navigate('/procedures/create')}>
            Thêm quy trình
          </Button>
        </div>

        <Table<MaintenanceProcedure>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} quy trình` }}
          scroll={{ x: 1100 }}
          size="middle"
          expandable={{
            expandedRowRender: (record) => <ExpandedRow record={record} />,
            rowExpandable: () => true,
          }}
        />
      </Card>
    </div>
  );
};

export default ProceduresPage;
