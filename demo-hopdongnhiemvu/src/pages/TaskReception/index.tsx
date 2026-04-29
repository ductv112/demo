import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Input, Space, Select,
  Dropdown, Modal, message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  FileTextOutlined, SyncOutlined, ClockCircleOutlined,
  CheckCircleOutlined, SearchOutlined, EyeOutlined,
  UnorderedListOutlined, PlusOutlined, MoreOutlined,
  EditOutlined, DeleteOutlined, FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

import { missions } from '../../data/missions';
import {
  formatDate, missionStatusConfig, missionTypeConfig, missionPriorityConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { Mission, MissionStatus, MissionType, MissionPriority } from '../../types';

const { Title, Text } = Typography;

const TaskReceptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isDepartment } = useUser();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Filter missions for department role + search + filters
  const filteredMissions = useMemo(() => {
    let result = missions;
    if (isDepartment) {
      result = result.filter(m => m.assignedDepartment === currentUser.departmentId);
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        m => m.name.toLowerCase().includes(keyword) || m.code.toLowerCase().includes(keyword),
      );
    }
    if (filterType) {
      result = result.filter(m => m.missionType === filterType);
    }
    if (filterStatus) {
      result = result.filter(m => m.status === filterStatus);
    }
    return result;
  }, [isDepartment, currentUser.departmentId, searchText, filterType, filterStatus]);

  const handleClearFilters = () => {
    setSearchText('');
    setFilterType(undefined);
    setFilterStatus(undefined);
  };

  const hasActiveFilters = searchText || filterType || filterStatus;

  // Summary stats (based on role-filtered, not search-filtered)
  const roleMissions = useMemo(() => {
    if (isDepartment) {
      return missions.filter(m => m.assignedDepartment === currentUser.departmentId);
    }
    return missions;
  }, [isDepartment, currentUser.departmentId]);

  const totalMissions = roleMissions.length;
  const executingCount = roleMissions.filter(
    m => m.status === 'executing',
  ).length;
  const pendingCount = roleMissions.filter(
    m => ['draft', 'pending_approval', 'approved'].includes(m.status),
  ).length;
  const completedCount = roleMissions.filter(m => m.status === 'completed').length;

  const statCardsData = [
    {
      title: 'Tổng nhiệm vụ',
      value: totalMissions,
      unit: 'nhiệm vụ',
      icon: <FileTextOutlined />,
      gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
      sub: `Năm 2026`,
    },
    {
      title: 'Đang thực hiện',
      value: executingCount,
      unit: 'nhiệm vụ',
      icon: <SyncOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
      sub: `${totalMissions > 0 ? Math.round((executingCount / totalMissions) * 100) : 0}% tổng NV`,
    },
    {
      title: 'Chờ xử lý',
      value: pendingCount,
      unit: 'nhiệm vụ',
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      sub: 'Cần phân loại & lập đề xuất',
    },
    {
      title: 'Hoàn thành',
      value: completedCount,
      unit: 'nhiệm vụ',
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      sub: `${totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0}% tổng NV`,
    },
  ];

  const getActionMenuItems = (record: Mission): MenuProps['items'] => {
    const canEdit = ['draft', 'pending_approval'].includes(record.status);
    return [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => navigate(`/missions/${record.id}`),
      },
      ...(canEdit ? [
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Chỉnh sửa',
          onClick: () => navigate(`/missions/${record.id}/edit`),
        },
        { type: 'divider' as const },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa',
          danger: true as const,
          onClick: () => {
            Modal.confirm({
              title: 'Xác nhận xóa nhiệm vụ',
              content: `Bạn có chắc chắn muốn xóa nhiệm vụ ${record.code}? Hành động này không thể hoàn tác.`,
              okText: 'Xóa',
              okButtonProps: { danger: true },
              cancelText: 'Hủy',
              onOk: () => message.success(`Đã xóa nhiệm vụ ${record.code}`),
            });
          },
        },
      ] : []),
    ];
  };

  const columns: ColumnsType<Mission> = [
    {
      title: 'Mã NV',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text>,
    },
    {
      title: 'Tên nhiệm vụ',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Đơn vị giao',
      dataIndex: 'requestingUnit',
      key: 'requestingUnit',
      width: 160,
    },
    {
      title: 'Loại sản phẩm/hệ thống',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
      width: 140,
    },
    {
      title: 'Loại NV',
      dataIndex: 'missionType',
      key: 'missionType',
      width: 110,
      render: (type: MissionType) => {
        const cfg = missionTypeConfig[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : type;
      },
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: MissionPriority) => {
        const cfg = missionPriorityConfig[priority];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : priority;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: MissionStatus) => {
        const cfg = missionStatusConfig[status];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : status;
      },
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime(),
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date: string) => {
        const isOverdue = new Date(date) < new Date();
        return (
          <Text style={isOverdue ? { color: colors.danger, fontWeight: 600 } : undefined}>
            {formatDate(date)}
          </Text>
        );
      },
      sorter: (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_: unknown, record: Mission) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ fontSize: 18 }}
          />
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
            <UnorderedListOutlined style={{ marginRight: 8 }} />
            Tiếp nhận nhiệm vụ kỹ thuật
          </Title>
          <Text type="secondary">
            {isDepartment
              ? `Danh sách nhiệm vụ được giao - ${currentUser.departmentName}`
              : 'Quản lý tiếp nhận và phân loại nhiệm vụ kỹ thuật từ các đơn vị'}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/missions/create')}
        >
          Tiếp nhận nhiệm vụ mới
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
                borderRadius: 12,
                padding: '14px 16px 12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background icon */}
              <div
                className="db-bg-icon"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 64,
                  color: 'rgba(255,255,255,0.1)',
                  lineHeight: 1,
                }}
              >
                {card.icon}
              </div>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff',
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                  {card.title}
                </div>
              </div>
              {/* Value */}
              <div
                style={{
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: '30px',
                  letterSpacing: '-0.5px',
                }}
              >
                {card.value}{' '}
                <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.unit}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>
                {card.sub}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Filter Bar ─── */}
      <Card
        className="db-chart-card"
        style={{ borderRadius: 14, marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Space size={12} wrap>
              <Input
                placeholder="Tìm kiếm theo mã, tên nhiệm vụ..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 300 }}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Loại nhiệm vụ"
                style={{ width: 160 }}
                allowClear
                value={filterType}
                onChange={setFilterType}
                options={Object.entries(missionTypeConfig).map(([key, cfg]) => ({
                  value: key, label: cfg.label,
                }))}
              />
              <Select
                placeholder="Trạng thái"
                style={{ width: 160 }}
                allowClear
                value={filterStatus}
                onChange={setFilterStatus}
                options={Object.entries(missionStatusConfig).map(([key, cfg]) => ({
                  value: key, label: cfg.label,
                }))}
              />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {filteredMissions.length}/{roleMissions.length} kết quả
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

      {/* ─── Table ─── */}
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
              <FileTextOutlined />
            </div>
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>
              Danh sách nhiệm vụ
            </Text>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredMissions}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} nhiệm vụ`,
          }}
          rowClassName={(record) => {
            if (record.priority === 'urgent') return 'row-highlight';
            if (record.status === 'executing') return 'row-executing';
            return '';
          }}
        />
      </Card>

    </div>
  );
};

export default TaskReceptionPage;
