import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Breadcrumb,
  Typography,
  Button,
  Dropdown,
} from 'antd';
import {
  HistoryOutlined,
  CalendarOutlined,
  ToolOutlined,
  DollarOutlined,
  EyeOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { maintenanceHistoryData } from '../../data/history';
import { formatDate, formatCurrency } from '../../utils/format';
import type { MaintenanceHistory } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const typeConfig: Record<string, { label: string; color: string }> = {
  periodic: { label: 'Định kỳ', color: 'processing' },
  corrective: { label: 'Sửa chữa nhỏ', color: 'warning' },
  inspection: { label: 'Kiểm tra', color: 'default' },
};

const resultConfig: Record<string, { label: string; color: string }> = {
  completed: { label: 'Hoàn thành', color: 'success' },
  partial: { label: 'Hoàn thành một phần', color: 'warning' },
  failed: { label: 'Không đạt', color: 'error' },
};

const MaintenanceHistoryPage: React.FC = () => {
  const [equipmentFilter, setEquipmentFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const stats = useMemo(() => {
    const total = maintenanceHistoryData.length;
    const periodic = maintenanceHistoryData.filter(h => h.type === 'periodic').length;
    const corrective = maintenanceHistoryData.filter(h => h.type === 'corrective').length;
    const totalCost = maintenanceHistoryData.reduce((sum, h) => sum + (h.cost || 0), 0);
    return { total, periodic, corrective, totalCost };
  }, []);

  const filteredData = useMemo(() => {
    return maintenanceHistoryData.filter(item => {
      const matchEquipment = !equipmentFilter || item.equipmentId === equipmentFilter;
      const matchType = !typeFilter || item.type === typeFilter;
      let matchDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = new Date(item.date).getTime();
        matchDate = itemDate >= dateRange[0].startOf('day').valueOf() &&
                    itemDate <= dateRange[1].endOf('day').valueOf();
      }
      return matchEquipment && matchType && matchDate;
    });
  }, [equipmentFilter, typeFilter, dateRange]);

  const equipmentOptions = useMemo(() => {
    const unique = Array.from(new Set(maintenanceHistoryData.map(h => h.equipmentId)));
    return unique.map(id => {
      const item = maintenanceHistoryData.find(h => h.equipmentId === id);
      return { value: id, label: item?.equipmentName || id };
    });
  }, []);

  const statCards = [
    {
      key: 'total',
      title: 'Tổng lượt BT',
      value: stats.total,
      suffix: 'lượt',
      icon: <HistoryOutlined />,
      gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
    },
    {
      key: 'periodic',
      title: 'BT định kỳ',
      value: stats.periodic,
      suffix: 'lượt',
      icon: <CalendarOutlined />,
      gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    },
    {
      key: 'corrective',
      title: 'Sửa chữa nhỏ',
      value: stats.corrective,
      suffix: 'lượt',
      icon: <ToolOutlined />,
      gradient: 'linear-gradient(135deg, #D4A843, #f0d890)',
    },
    {
      key: 'cost',
      title: 'Tổng chi phí',
      value: formatCurrency(stats.totalCost),
      suffix: '',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
    },
  ];

  const columns: ColumnsType<MaintenanceHistory> = [
    {
      title: 'Mã lệnh',
      dataIndex: 'workOrderCode',
      key: 'workOrderCode',
      width: 160,
      render: (code: string) => (
        <Text strong style={{ color: '#1B3A5C' }}>{code}</Text>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 200,
      render: (name: string, record: MaintenanceHistory) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.equipmentCode}</Text>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const cfg = typeConfig[type];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      align: 'center',
      render: (duration: number) => (
        <Text>{duration} giờ</Text>
      ),
    },
    {
      title: 'Đội thực hiện',
      dataIndex: 'teamName',
      key: 'teamName',
      width: 160,
    },
    {
      title: 'Kết quả',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        const cfg = resultConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      align: 'right',
      render: (cost: number | undefined) => (
        <Text strong style={{ color: '#1B3A5C' }}>
          {cost ? `${cost} tr` : '-'}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      fixed: 'right',
      align: 'center' as const,
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
          { key: 'export', icon: <FileTextOutlined />, label: 'Xuất báo cáo' },
        ]}} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Lịch sử bảo trì' },
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
            <FileTextOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              Lịch sử bảo trì
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Tra cứu lịch sử bảo trì thiết bị - Doanh nghiệp A
            </Text>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={card.key}>
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
                {card.suffix && (
                  <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>
                    {card.suffix}
                  </span>
                )}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
                {card.title}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={8}>
            <Select
              placeholder="Chọn thiết bị"
              allowClear
              style={{ width: '100%' }}
              options={equipmentOptions}
              value={equipmentFilter}
              onChange={val => setEquipmentFilter(val)}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Loại bảo trì"
              allowClear
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={val => setTypeFilter(val)}
              options={[
                { value: 'periodic', label: 'Định kỳ' },
                { value: 'corrective', label: 'Sửa chữa nhỏ' },
                { value: 'inspection', label: 'Kiểm tra' },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
            />
          </Col>
          <Col>
            <Space>
              <Button
                onClick={() => {
                  setEquipmentFilter(undefined);
                  setTypeFilter(undefined);
                  setDateRange(null);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
        className="animate-fade-in animate-delay-3"
      >
        <Table<MaintenanceHistory>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default MaintenanceHistoryPage;
