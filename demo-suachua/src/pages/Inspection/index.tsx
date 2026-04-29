import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Row, Col, Input, Select, Space, Button,
  Statistic, Modal, Descriptions, List, Dropdown,
} from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  EyeOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { inspections } from '../../data/inspections';
import { inspectionStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Inspection } from '../../types';

// ─── Styles ──────────────────────────────────────────────────────────
const pageStyles = `
  .insp-page .db-stat-card {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    min-height: 120px;
  }
  .insp-page .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .insp-page .db-stat-card:hover .db-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .insp-page .db-bg-icon {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 64px;
    opacity: 0.1;
    color: #ffffff;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .insp-page .db-stat-card .db-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255,255,255,0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #ffffff;
    margin-bottom: 12px;
  }
  .insp-page .db-stat-card .db-stat-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .insp-page .db-stat-card .db-stat-unit {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    margin-left: 4px;
  }
  .insp-page .db-stat-card .db-stat-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 4px;
  }
  .insp-page .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .insp-page .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
`;

const typeConfig: Record<string, { label: string; color: string }> = {
  quality: { label: 'Kiểm tra CL', color: 'orange' },
  testing: { label: 'Thử nghiệm', color: 'purple' },
  acceptance: { label: 'Nghiệm thu', color: 'cyan' },
};

const Inspection: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // ─── Statistics ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = inspections.length;
    const passed = inspections.filter(i => i.status === 'passed').length;
    const failed = inspections.filter(i => i.status === 'failed').length;
    return { total, passed, failed };
  }, []);

  // ─── Filtered data ──────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return inspections.filter(item => {
      const matchSearch =
        !searchText ||
        item.workOrderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.inspector.toLowerCase().includes(searchText.toLowerCase());
      const matchType = filterType === 'all' || item.type === filterType;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [searchText, filterType, filterStatus]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleViewDetail = (record: Inspection) => {
    setSelectedInspection(record);
    setDetailModalOpen(true);
  };

  // ─── Action menu ────────────────────────────────────────────────
  const getActionMenu = (record: Inspection) => {
    const items: any[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => handleViewDetail(record),
      },
    ];
    return items;
  };

  // ─── Columns ─────────────────────────────────────────────────────
  const columns: ColumnsType<Inspection> = [
    {
      title: 'Mã lệnh SC',
      dataIndex: 'workOrderCode',
      key: 'workOrderCode',
      width: 140,
      render: (code: string) => (
        <span style={{ color: colors.navy, fontWeight: 600 }}>{code}</span>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 220,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (type: string) => {
        const cfg = typeConfig[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : type;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: Inspection['status']) => {
        const cfg = inspectionStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Người kiểm tra',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 180,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Kết quả',
      dataIndex: 'results',
      key: 'results',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '--',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 180,
      ellipsis: true,
      render: (text: string) => text || '--',
    },
    {
      title: '', key: 'action', width: 50, align: 'center', fixed: 'right',
      render: (_: unknown, record: Inspection) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      ),
    },
  ];

  // ─── Stat cards ──────────────────────────────────────────────────
  const statCards = [
    {
      title: 'Tổng kiểm tra',
      value: stats.total,
      unit: 'lần',
      gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
      icon: <SafetyCertificateOutlined />,
      badgeIcon: <SafetyCertificateOutlined />,
    },
    {
      title: 'Đạt',
      value: stats.passed,
      unit: 'lần',
      gradient: `linear-gradient(135deg, ${colors.success}, #73d13d)`,
      icon: <CheckCircleOutlined />,
      badgeIcon: <CheckCircleOutlined />,
    },
    {
      title: 'Không đạt',
      value: stats.failed,
      unit: 'lần',
      gradient: `linear-gradient(135deg, ${colors.danger}, #ff7875)`,
      icon: <CloseCircleOutlined />,
      badgeIcon: <CloseCircleOutlined />,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      <style>{pageStyles}</style>
      <div className="insp-page" style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: 0, color: colors.navy, fontSize: 18, fontWeight: 700 }}>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
            Kiểm tra & Nghiệm thu
          </h4>
          <span style={{ color: colors.textSecondary, fontSize: 13 }}>
            Quản lý kiểm tra chất lượng, thử nghiệm và nghiệm thu thiết bị sau sửa chữa
          </span>
        </div>

        {/* Stat Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statCards.map((card, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <div className="db-stat-card" style={{ background: card.gradient }}>
                <div className="db-bg-icon">{card.icon}</div>
                <div className="db-icon-badge">{card.badgeIcon}</div>
                <div>
                  <span className="db-stat-value">{card.value}</span>
                  <span className="db-stat-unit">{card.unit}</span>
                </div>
                <div className="db-stat-label">{card.title}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card className="db-chart-card" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
          <Space wrap size={12}>
            <Input
              placeholder="Tìm kiếm mã lệnh, thiết bị, người kiểm tra..."
              prefix={<SearchOutlined style={{ color: colors.navy }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: 'Tất cả loại' },
                { value: 'quality', label: 'Kiểm tra CL' },
                { value: 'testing', label: 'Thử nghiệm' },
                { value: 'acceptance', label: 'Nghiệm thu' },
              ]}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 160 }}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'pending', label: 'Chờ kiểm tra' },
                { value: 'passed', label: 'Đạt' },
                { value: 'failed', label: 'Không đạt' },
                { value: 'retesting', label: 'Kiểm tra lại' },
              ]}
            />
          </Space>
        </Card>

        {/* Table */}
        <Card
          className="db-chart-card"
          title={
            <Space>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', fontSize: 16,
              }}>
                <SafetyCertificateOutlined />
              </div>
              <span style={{ color: colors.navy, fontWeight: 600 }}>
                Danh sách kiểm tra & nghiệm thu
              </span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: colors.navy }} />
            <span>Chi tiết kiểm tra</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedInspection(null);
        }}
        footer={
          <Button onClick={() => {
            setDetailModalOpen(false);
            setSelectedInspection(null);
          }}>
            Đóng
          </Button>
        }
        width={780}
      >
        {selectedInspection && (
          <div>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ fontWeight: 600, width: 160, backgroundColor: colors.bgLight }}
            >
              <Descriptions.Item label="Mã lệnh SC">
                <span style={{ color: colors.navy, fontWeight: 600 }}>
                  {selectedInspection.workOrderCode}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị">
                {selectedInspection.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại kiểm tra">
                <Tag color={typeConfig[selectedInspection.type]?.color}>
                  {typeConfig[selectedInspection.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={inspectionStatusConfig[selectedInspection.status].color}>
                  {inspectionStatusConfig[selectedInspection.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người kiểm tra">
                {selectedInspection.inspector}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kiểm tra">
                {formatDate(selectedInspection.date)}
              </Descriptions.Item>
              <Descriptions.Item label="Kết quả">
                {selectedInspection.results || '--'}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedInspection.notes || '--'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <h5 style={{ color: colors.navy, fontWeight: 600, marginBottom: 8 }}>
                Tiêu chí kiểm tra
              </h5>
              <List
                size="small"
                bordered
                dataSource={selectedInspection.criteria}
                renderItem={(item: string, index: number) => (
                  <List.Item>
                    <Space>
                      {selectedInspection.passed ? (
                        <CheckCircleOutlined style={{ color: colors.success }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: colors.danger }} />
                      )}
                      <span>{index + 1}. {item}</span>
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Inspection;
