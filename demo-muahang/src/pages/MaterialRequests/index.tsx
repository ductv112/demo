import React, { useState, useMemo } from 'react';
import {
  Table, Card, Tag, Button, Input, Select, Row, Col, Space,
  Typography, Tooltip, Dropdown,
} from 'antd';
import {
  SearchOutlined, FileTextOutlined,
  ShoppingCartOutlined, InboxOutlined,
  EyeOutlined, MoreOutlined,
  UnorderedListOutlined, FilterOutlined,
  DatabaseOutlined, ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

import { materialRequests } from '../../data/materialRequests';
import { departments } from '../../data/departments';
import {
  formatDate, priorityConfig,
  materialRequestSourceConfig, sourceSystemConfig,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';
import type { MaterialRequest, PriorityLevel, MaterialRequestSource } from '../../types';

const { Title, Text } = Typography;

const MaterialRequestsPage: React.FC = () => {
  useUser();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState<string | undefined>(undefined);
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | undefined>(undefined);
  const [filterSource, setFilterSource] = useState<MaterialRequestSource | undefined>(undefined);

  // Filtered data
  const filteredData = useMemo(() => {
    return materialRequests.filter(r => {
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!r.code.toLowerCase().includes(s) && !r.title.toLowerCase().includes(s)) return false;
      }
      if (filterDept && r.departmentId !== filterDept) return false;
      if (filterPriority && r.priority !== filterPriority) return false;
      if (filterSource && r.source !== filterSource) return false;
      return true;
    });
  }, [searchText, filterDept, filterPriority, filterSource]);

  // Stats
  const stats = useMemo(() => {
    const total = materialRequests.length;
    const totalItems = materialRequests.reduce((s, r) => s + r.items.length, 0);
    const fromTechnical = materialRequests.filter(r => r.source === 'technical_plan').length;
    const fromReplenishment = materialRequests.filter(r => r.source === 'replenishment').length;
    return { total, totalItems, fromTechnical, fromReplenishment };
  }, []);

  // Action menu for each row
  const getActionMenuItems = (record: MaterialRequest): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết',
      onClick: () => navigate(`/material-requests/${record.id}`),
    },
  ];

  // Table columns
  const columns: ColumnsType<MaterialRequest> = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left' as const,
      render: (code: string, record: MaterialRequest) => (
        <Text
          strong
          style={{ color: '#1B3A5C', cursor: 'pointer' }}
          onClick={() => navigate(`/material-requests/${record.id}`)}
        >
          {code}
        </Text>
      ),
    },
    {
      title: 'Nguồn',
      key: 'source',
      width: 130,
      render: (_: unknown, record: MaterialRequest) => {
        const sourceCfg = materialRequestSourceConfig[record.source];
        const systemCfg = sourceSystemConfig[record.sourceSystem];
        return (
          <Tooltip title={`${systemCfg.label} (${record.sourceSystem})`}>
            <div>
              <Tag
                color={sourceCfg.color}
                icon={record.source === 'technical_plan' ? <ToolOutlined /> : <DatabaseOutlined />}
              >
                {sourceCfg.label}
              </Tag>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{systemCfg.shortLabel}</div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      render: (title: string, record: MaterialRequest) => (
        <Text
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/material-requests/${record.id}`)}
        >
          {title}
        </Text>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 85,
      align: 'center',
      render: (p: PriorityLevel) => {
        const cfg = priorityConfig[p];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'SL vật tư',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (_: unknown, record: MaterialRequest) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
        }}>
          {record.items.length}
        </span>
      ),
    },
    {
      title: 'Ngày YC',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      width: 100,
      render: (d: string) => formatDate(d),
      sorter: (a: MaterialRequest, b: MaterialRequest) =>
        new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 65,
      align: 'center',
      render: (_: unknown, record: MaterialRequest) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{ color: '#999' }}
          />
        </Dropdown>
      ),
    },
  ];

  const clearFilters = () => {
    setSearchText('');
    setFilterDept(undefined);
    setFilterPriority(undefined);
    setFilterSource(undefined);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 4, color: '#1B3A5C' }}>
          <UnorderedListOutlined style={{ marginRight: 8 }} />
          Nhu cầu vật tư
        </Title>
        <Text type="secondary">
          Tổng hợp nhu cầu vật tư đã duyệt từ các phân hệ kỹ thuật và kho
        </Text>
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng yêu cầu', value: stats.total, unit: 'yêu cầu', bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <FileTextOutlined /> },
          { label: 'Tổng loại vật tư', value: stats.totalItems, unit: 'loại', bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <InboxOutlined /> },
          { label: 'Từ KH kỹ thuật', value: stats.fromTechnical, unit: 'yêu cầu', bg: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <ToolOutlined /> },
          { label: 'Từ bổ sung kho', value: stats.fromReplenishment, unit: 'yêu cầu', bg: 'linear-gradient(135deg, #059669, #10b981)', icon: <ShoppingCartOutlined /> },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card
              className="db-stat-card"
              style={{
                background: card.bg,
                position: 'relative',
                overflow: 'hidden',
              }}
              styles={{ body: { padding: '20px 18px', position: 'relative', zIndex: 1 } }}
            >
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 64,
                  opacity: 0.1,
                  color: '#ffffff',
                  zIndex: 0,
                }}
              >
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 16,
                }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{card.label}</div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 26 }}>
                    {card.value}
                    <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>{card.unit}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo mã, tiêu đề..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Nguồn"
              value={filterSource}
              onChange={setFilterSource}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(materialRequestSourceConfig).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.label}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Đơn vị"
              value={filterDept}
              onChange={setFilterDept}
              allowClear
              style={{ width: '100%' }}
            >
              {departments.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.shortName} - {d.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Ưu tiên"
              value={filterPriority}
              onChange={setFilterPriority}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(priorityConfig).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.label}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button icon={<FilterOutlined />} onClick={clearFilters}>
              Xóa lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ color: '#1B3A5C', fontSize: 15 }}>
            Danh sách nhu cầu vật tư ({filteredData.length})
          </Text>
          <Space size={12}>
            <Tag color="#1B3A5C">
              <ToolOutlined style={{ marginRight: 4 }} />
              KH kỹ thuật: {stats.fromTechnical}
            </Tag>
            <Tag color="#0891b2">
              <DatabaseOutlined style={{ marginRight: 4 }} />
              Bổ sung kho: {stats.fromReplenishment}
            </Tag>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng ${total} yêu cầu` }}
          onRow={(record) => ({
            onDoubleClick: () => navigate(`/material-requests/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default MaterialRequestsPage;
