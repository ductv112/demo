import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Tabs,
  Avatar,
  Space,
  Row,
  Col,
  Input,
  Badge,
  Dropdown,
  Tooltip,
  Button,
  Breadcrumb,
  Typography,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  SearchOutlined,
  CalendarOutlined,
  CrownOutlined,
  ApartmentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { maintenanceStaff, maintenanceTeams } from '../../data/staff';
import { staffStatusConfig, skillLevelConfig, teamTypeConfig, formatDate } from '../../utils/format';
import { useUser } from '../../contexts/UserContext';
import type { MaintenanceStaff, MaintenanceTeam, StaffStatus, SkillLevel, TeamType } from '../../types';

const { Title, Text } = Typography;

const MaintenanceTeamPage: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('staff');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'all'>('all');

  // --- Computed stats ---
  const stats = useMemo(() => {
    const total = maintenanceStaff.length;
    const active = maintenanceStaff.filter(s => s.status === 'active').length;
    const onLeave = maintenanceStaff.filter(s => s.status === 'on_leave').length;
    const expiringSoon = maintenanceStaff.reduce(
      (count, s) => count + s.certificates.filter(c => c.isExpiringSoon).length,
      0
    );
    return { total, active, onLeave, expiringSoon };
  }, []);

  // --- Filtered staff ---
  const filteredStaff = useMemo(() => {
    return maintenanceStaff.filter(s => {
      const matchSearch =
        !searchText ||
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.staffCode.toLowerCase().includes(searchText.toLowerCase()) ||
        s.departmentName.toLowerCase().includes(searchText.toLowerCase()) ||
        s.specialization.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchText, statusFilter]);

  // --- Helper: get staff by id ---
  const getStaffById = (id: string) => maintenanceStaff.find(s => s.id === id);

  // --- Stat cards data ---
  const statCards = [
    {
      title: 'Tổng nhân sự',
      label: 'Tổng nhân sự',
      value: stats.total,
      suffix: 'người',
      icon: <TeamOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
    },
    {
      title: 'Đang làm việc',
      label: 'Đang làm việc',
      value: stats.active,
      suffix: 'người',
      icon: <UserOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    },
    {
      title: 'Nghỉ phép',
      label: 'Nghỉ phép',
      value: stats.onLeave,
      suffix: 'người',
      icon: <CalendarOutlined />,
      gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
    },
    {
      title: 'Chứng chỉ sắp hết hạn',
      label: 'Chứng chỉ sắp hết hạn',
      value: stats.expiringSoon,
      suffix: 'chứng chỉ',
      icon: <WarningOutlined />,
      gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
    },
  ];

  // --- Table columns ---
  const columns: ColumnsType<MaintenanceStaff> = [
    {
      title: 'Mã NV',
      dataIndex: 'staffCode',
      key: 'staffCode',
      width: 110,
      render: (code: string) => (
        <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      width: 170,
      render: (name: string) => (
        <Space>
          <Avatar size={28} style={{ background: '#1B3A5C', fontSize: 12 }}>
            {name.split(' ').pop()?.charAt(0)}
          </Avatar>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 180,
      filters: Array.from(new Set(maintenanceStaff.map(s => s.departmentName))).map(d => ({
        text: d,
        value: d,
      })),
      onFilter: (value, record) => record.departmentName === value,
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: (Object.keys(staffStatusConfig) as StaffStatus[]).map(key => ({
        text: staffStatusConfig[key].label,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: StaffStatus) => {
        const config = staffStatusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Năng lực',
      key: 'skills',
      width: 200,
      render: (_: unknown, record: MaintenanceStaff) => (
        <Space size={[4, 4]} wrap>
          {record.skills.slice(0, 3).map((skill, idx) => {
            const config = skillLevelConfig[skill.level as SkillLevel];
            return (
              <Tooltip key={idx} title={`${skill.equipmentType} - ${skill.experienceCount} lần thực hiện`}>
                <Tag color={config.color} style={{ fontSize: 11, margin: 0 }}>
                  {config.label}
                </Tag>
              </Tooltip>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Chứng chỉ',
      key: 'certificates',
      width: 120,
      render: (_: unknown, record: MaintenanceStaff) => {
        const total = record.certificates.length;
        const expiring = record.certificates.filter(c => c.isExpiringSoon).length;
        return (
          <Space size={4}>
            <SafetyCertificateOutlined style={{ color: '#1B3A5C' }} />
            <Text>{total}</Text>
            {expiring > 0 && (
              <Tooltip title={`${expiring} chứng chỉ sắp hết hạn`}>
                <Badge count={expiring} size="small" style={{ backgroundColor: '#faad14' }}>
                  <WarningOutlined style={{ color: '#faad14', fontSize: 14 }} />
                </Badge>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      fixed: 'right',
      align: 'center',
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
        ]}} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  // --- Tab 1: Staff ---
  const renderStaffTab = () => (
    <div>
      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={card.title}>
            <div
              className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{
                background: card.gradient,
                borderRadius: 14,
                padding: '20px 18px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
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
                  opacity: 0.1,
                  color: '#fff',
                }}
              >
                {card.icon}
              </div>
              {/* Icon badge */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  color: '#fff',
                  fontSize: 16,
                }}
              >
                {card.icon}
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                {card.value}
                <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>
                  {card.suffix}
                </span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="Tìm theo mã NV, họ tên, đơn vị, chuyên môn..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </Col>
          <Col>
            <Space size={4}>
              <Button
                type={statusFilter === 'all' ? 'primary' : 'default'}
                size="small"
                onClick={() => setStatusFilter('all')}
              >
                Tất cả
              </Button>
              {(Object.keys(staffStatusConfig) as StaffStatus[]).map(key => (
                <Button
                  key={key}
                  type={statusFilter === key ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setStatusFilter(key)}
                >
                  {staffStatusConfig[key].label}
                </Button>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: 0 }}
        className="animate-fade-in animate-delay-3"
      >
        <Table<MaintenanceStaff>
          columns={columns}
          dataSource={filteredStaff}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhân sự`,
          }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>
    </div>
  );

  // --- Tab 2: Teams ---
  const renderTeamsTab = () => (
    <Row gutter={[16, 16]}>
      {maintenanceTeams.map((team, idx) => {
        const typeConfig = teamTypeConfig[team.type as TeamType];
        const leader = getStaffById(team.leaderId);
        const members = team.members.map(mid => getStaffById(mid)).filter(Boolean) as MaintenanceStaff[];

        return (
          <Col xs={24} sm={12} lg={8} key={team.id}>
            <Card
              className={`animate-fade-in animate-delay-${idx + 1}`}
              style={{
                borderRadius: 14,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              hoverable
              bodyStyle={{ padding: 20 }}
            >
              {/* Team header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 16,
                      }}
                    >
                      <TeamOutlined />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 15, color: '#1B3A5C', display: 'block', lineHeight: 1.3 }}>
                        {team.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {team.departmentName}
                      </Text>
                    </div>
                  </div>
                  <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <ToolOutlined style={{ marginRight: 4 }} />
                  {team.specialization}
                </Text>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '12px 0' }} />

              {/* Leader info */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar
                    size={28}
                    style={{
                      background: 'linear-gradient(135deg, #D4A843, #f0d890)',
                      color: '#0a1628',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {team.leaderName.split(' ').pop()?.charAt(0)}
                  </Avatar>
                  <div>
                    <Space size={4}>
                      <CrownOutlined style={{ color: '#D4A843', fontSize: 12 }} />
                      <Text style={{ fontSize: 13, fontWeight: 600 }}>{team.leaderName}</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {leader?.position || 'Đội trưởng'}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member count */}
              <div
                style={{
                  background: '#f5f7fa',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 13, color: '#595959' }}>
                  <ApartmentOutlined style={{ marginRight: 6 }} />
                  Thành viên
                </Text>
                <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>
                  {team.memberCount} người
                </Text>
              </div>

              {/* Member avatars */}
              <div>
                <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                  Danh sách thành viên:
                </Text>
                <Avatar.Group
                  max={{
                    count: 5,
                    style: { color: '#1B3A5C', backgroundColor: '#e8f0fe', fontSize: 12 },
                  }}
                >
                  {members.map(member => (
                    <Tooltip key={member.id} title={`${member.name} - ${member.position}`}>
                      <Avatar
                        size={30}
                        style={{
                          background: member.id === team.leaderId
                            ? 'linear-gradient(135deg, #D4A843, #f0d890)'
                            : '#1B3A5C',
                          color: member.id === team.leaderId ? '#0a1628' : '#fff',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {member.name.split(' ').pop()?.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                </Avatar.Group>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Nhân sự & Đội ngũ' },
            { title: 'Đội ngũ kỹ thuật bảo trì' },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}
          >
            <TeamOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              Đội ngũ kỹ thuật bảo trì
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Quản lý nhân sự và đội bảo trì - Doanh nghiệp A
            </Text>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'staff',
            label: (
              <span>
                <UserOutlined style={{ marginRight: 6 }} />
                Nhân sự bảo trì
              </span>
            ),
            children: renderStaffTab(),
          },
          {
            key: 'teams',
            label: (
              <span>
                <TeamOutlined style={{ marginRight: 6 }} />
                Đội bảo trì
              </span>
            ),
            children: renderTeamsTab(),
          },
        ]}
      />
    </div>
  );
};

export default MaintenanceTeamPage;
