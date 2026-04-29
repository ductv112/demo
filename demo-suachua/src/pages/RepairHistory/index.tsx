import React, { useState, useMemo } from 'react';
import { Card, Table, Tag, Row, Col, Input, Select, Space, Button, Statistic, Modal, Descriptions, Dropdown } from 'antd';
import {
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  EyeOutlined, MoreOutlined,
} from '@ant-design/icons';
import { repairHistory } from '../../data/repairHistory';
import { equipmentTypeConfig, repairTypeConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { RepairHistoryRecord, EquipmentType, RepairType } from '../../types';

const pageStyles = `
  .db-stat-card {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    min-height: 120px;
  }
  .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,58,92,0.18);
  }
  .db-stat-card:hover .db-bg-icon {
    transform: rotate(15deg) scale(1.15);
  }
  .db-bg-icon {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 64px;
    opacity: 0.1;
    color: #ffffff;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .db-stat-card .db-icon-badge {
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
  .db-stat-card .db-stat-value {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .db-stat-card .db-stat-unit {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    margin-left: 4px;
  }
  .db-stat-card .db-stat-label {
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    margin-top: 4px;
  }

  .db-chart-card {
    border-radius: 14px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .db-chart-card:hover {
    box-shadow: 0 8px 24px rgba(27,58,92,0.1) !important;
  }
  .db-chart-card .ant-card-head {
    border-bottom: 1px solid ${colors.border};
  }
  .db-chart-card .ant-card-head-title {
    font-weight: 600;
    color: ${colors.navy};
  }

  .db-card-title-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-right: 10px;
    color: #ffffff;
  }

  .repair-history-page {
    animation: rhFadeIn 0.5s ease-out;
  }
  @keyframes rhFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const outcomeConfig: Record<string, { label: string; color: string }> = {
  success: { label: 'Thành công', color: 'green' },
  partial: { label: 'Một phần', color: 'orange' },
  failed: { label: 'Thất bại', color: 'red' },
};

const RepairHistory: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [detailRecord, setDetailRecord] = useState<RepairHistoryRecord | null>(null);

  const stats = useMemo(() => {
    const total = repairHistory.length;
    const success = repairHistory.filter((r) => r.outcome === 'success').length;
    const failed = repairHistory.filter((r) => r.outcome === 'failed').length;
    const recurring = repairHistory.filter((r) => r.isRecurring).length;
    return { total, success, failed, recurring };
  }, []);

  const filteredData = useMemo(() => {
    return repairHistory.filter((r) => {
      const matchSearch = !searchText || r.equipmentName.toLowerCase().includes(searchText.toLowerCase());
      const matchType = !selectedType || r.equipmentType === selectedType;
      return matchSearch && matchType;
    });
  }, [searchText, selectedType]);

  // ─── Action menu ───────────────────────────────────────────
  const getActionMenu = (record: RepairHistoryRecord) => {
    const items: any[] = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => setDetailRecord(record),
      },
    ];
    return items;
  };

  const columns = [
    {
      title: 'Tên khí tài',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Loại khí tài',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
      width: 140,
      render: (type: EquipmentType) => {
        const cfg = equipmentTypeConfig[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : type;
      },
    },
    {
      title: 'Mã lệnh SC',
      dataIndex: 'workOrderCode',
      key: 'workOrderCode',
      width: 150,
      render: (text: string) => (
        <span style={{ color: colors.navy, fontWeight: 600, fontSize: 13 }}>{text}</span>
      ),
    },
    {
      title: 'Loại SC',
      dataIndex: 'repairType',
      key: 'repairType',
      width: 140,
      render: (type: RepairType) => {
        const cfg = repairTypeConfig[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : type;
      },
    },
    {
      title: 'Nguyên nhân gốc',
      dataIndex: 'rootCause',
      key: 'rootCause',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completedDate',
      key: 'completedDate',
      width: 130,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Chi phí (tr)',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 110,
      align: 'right' as const,
      render: (cost: number) => <span style={{ fontWeight: 600 }}>{cost} tr</span>,
    },
    {
      title: 'Thời gian (ngày)',
      dataIndex: 'repairDuration',
      key: 'repairDuration',
      width: 120,
      align: 'right' as const,
      render: (days: number) => `${days} ngày`,
    },
    {
      title: 'Kết quả',
      dataIndex: 'outcome',
      key: 'outcome',
      width: 110,
      render: (outcome: string) => {
        const cfg = outcomeConfig[outcome];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : outcome;
      },
    },
    {
      title: 'Lỗi lặp lại',
      dataIndex: 'isRecurring',
      key: 'isRecurring',
      width: 100,
      render: (isRecurring: boolean) =>
        isRecurring ? <Tag color="volcano">Lặp lại</Tag> : null,
    },
    {
      title: '', key: 'action', width: 50, align: 'center' as const, fixed: 'right' as const,
      render: (_: unknown, record: RepairHistoryRecord) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="repair-history-page">
      <style>{pageStyles}</style>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
          >
            <div className="db-bg-icon"><HistoryOutlined /></div>
            <div className="db-icon-badge"><HistoryOutlined /></div>
            <div className="db-stat-value">{stats.total}</div>
            <div className="db-stat-label">Tổng lần sửa chữa</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, #3d9a50, ${colors.success})` }}
          >
            <div className="db-bg-icon"><CheckCircleOutlined /></div>
            <div className="db-icon-badge"><CheckCircleOutlined /></div>
            <div className="db-stat-value">{stats.success}</div>
            <div className="db-stat-label">Thành công</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, #d94444, ${colors.danger})` }}
          >
            <div className="db-bg-icon"><CloseCircleOutlined /></div>
            <div className="db-icon-badge"><CloseCircleOutlined /></div>
            <div className="db-stat-value">{stats.failed}</div>
            <div className="db-stat-label">Thất bại</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div
            className="db-stat-card"
            style={{ background: `linear-gradient(135deg, ${colors.gold}, #c49b38)` }}
          >
            <div className="db-bg-icon"><WarningOutlined /></div>
            <div className="db-icon-badge"><WarningOutlined /></div>
            <div className="db-stat-value">{stats.recurring}</div>
            <div className="db-stat-label">Lỗi lặp lại</div>
          </div>
        </Col>
      </Row>

      {/* Filters + Table */}
      <Card
        className="db-chart-card"
        title={
          <Space>
            <span
              className="db-card-title-icon"
              style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})` }}
            >
              <HistoryOutlined />
            </span>
            <span>Lịch sử sửa chữa</span>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm kiếm theo tên khí tài"
            prefix={<SearchOutlined style={{ color: colors.navy }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Loại khí tài"
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            allowClear
            style={{ width: 180 }}
            options={Object.entries(equipmentTypeConfig).map(([key, cfg]) => ({
              value: key,
              label: cfg.label,
            }))}
          />
        </Space>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          size="middle"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng: ${total} bản ghi` }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lịch sử sửa chữa"
        open={!!detailRecord}
        onCancel={() => setDetailRecord(null)}
        footer={[
          <Button key="close" onClick={() => setDetailRecord(null)}>Đóng</Button>,
        ]}
        width={700}
      >
        {detailRecord && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Tên khí tài" span={2}>
              {detailRecord.equipmentName}
            </Descriptions.Item>
            <Descriptions.Item label="Loại khí tài">
              <Tag color={equipmentTypeConfig[detailRecord.equipmentType]?.color}>
                {equipmentTypeConfig[detailRecord.equipmentType]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mã lệnh SC">
              <span style={{ color: colors.navy, fontWeight: 600 }}>{detailRecord.workOrderCode}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Loại sửa chữa">
              <Tag color={repairTypeConfig[detailRecord.repairType]?.color}>
                {repairTypeConfig[detailRecord.repairType]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kết quả">
              <Tag color={outcomeConfig[detailRecord.outcome]?.color}>
                {outcomeConfig[detailRecord.outcome]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nguyên nhân gốc" span={2}>
              {detailRecord.rootCause}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hoàn thành">
              {formatDate(detailRecord.completedDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sửa chữa">
              {detailRecord.repairDuration} ngày
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí tổng">
              {detailRecord.totalCost} tr
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí vật tư">
              {detailRecord.materialCost} tr
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí nhân công">
              {detailRecord.laborCost} tr
            </Descriptions.Item>
            <Descriptions.Item label="Lỗi lặp lại">
              {detailRecord.isRecurring ? <Tag color="volcano">Có</Tag> : 'Không'}
            </Descriptions.Item>
            <Descriptions.Item label="Kiểm tra định kỳ tiếp" span={2}>
              {formatDate(detailRecord.nextScheduledCheck)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RepairHistory;
