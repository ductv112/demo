import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, InputNumber, Space, Typography, Row, Col, Statistic,
  Select, Modal, message,
} from 'antd';
import {
  SendOutlined, FilterOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { allocations2026 } from '../../data/allocations';
import { departments, getDepartmentShortName } from '../../data/departments';
import { categoryTypeConfig, formatCurrency } from '../../utils/format';
import { tasks2026 } from '../../data/tasks';
import type { BudgetAllocation, CategoryType } from '../../types';

const { Title, Text } = Typography;

const BudgetAllocationPage: React.FC = () => {
  const [data, setData] = useState<BudgetAllocation[]>(allocations2026);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<CategoryType | undefined>(undefined);

  const filteredData = useMemo(() => {
    let result = data;
    if (departmentFilter) result = result.filter((r) => r.departmentId === departmentFilter);
    if (categoryTypeFilter) result = result.filter((r) => r.categoryType === categoryTypeFilter);
    return result;
  }, [data, departmentFilter, categoryTypeFilter]);

  const totalAllocated = useMemo(
    () => data.reduce((s, r) => s + r.totalAllocated, 0),
    [data],
  );

  const handleQuarterChange = (id: string, quarter: 'q1' | 'q2' | 'q3' | 'q4', value: number | null) => {
    setData((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [quarter]: value ?? 0 };
        updated.totalAllocated = updated.q1 + updated.q2 + updated.q3 + updated.q4;
        return updated;
      }),
    );
  };

  const handleCreateDecision = () => {
    Modal.confirm({
      title: 'Tạo Quyết định giao kế hoạch',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn sắp tạo Quyết định giao kế hoạch chi phí năm 2026 với:</p>
          <p><strong>{filteredData.length}</strong> nhiệm vụ, tổng ngân sách: <strong>{formatCurrency(totalAllocated)}</strong></p>
          <p>QĐ sẽ được trình Ban Giám đốc ký ban hành.</p>
        </div>
      ),
      okText: 'Tạo QĐ',
      cancelText: 'Hủy',
      onOk: () => message.success('Đã tạo Quyết định giao kế hoạch KHCP 2026'),
    });
  };

  const renderQuarterInput = (record: BudgetAllocation, quarter: 'q1' | 'q2' | 'q3' | 'q4') => (
    <InputNumber
      size="small"
      style={{ width: '100%' }}
      value={record[quarter]}
      min={0}
      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
      onChange={(v) => handleQuarterChange(record.id, quarter, v)}
    />
  );

  const columns: ColumnsType<BudgetAllocation> = [
    {
      title: 'Hạng mục',
      dataIndex: 'id',
      ellipsis: true,
      width: 260,
      render: (_: string, record: BudgetAllocation) => {
        const allocTasks = tasks2026.filter(t => t.allocationId === record.id);
        const label = allocTasks.length > 0
          ? allocTasks.map(t => t.name).join(', ')
          : categoryTypeConfig[record.categoryType]?.label || record.categoryType;
        return label;
      },
    },
    {
      title: 'Phòng ban',
      dataIndex: 'departmentId',
      width: 90,
      render: (id: string) => getDepartmentShortName(id),
    },
    {
      title: 'Loại',
      dataIndex: 'categoryType',
      width: 100,
      render: (t: CategoryType) => (
        <Tag color={categoryTypeConfig[t].color} style={{ color: '#fff' }}>
          {categoryTypeConfig[t].label}
        </Tag>
      ),
    },
    {
      title: 'Tổng PB (tr)',
      dataIndex: 'totalAllocated',
      width: 110,
      align: 'right',
      render: (v: number) => <Text strong>{v.toLocaleString('vi-VN')}</Text>,
    },
    { title: 'Q1', dataIndex: 'q1', width: 100, align: 'right', render: (_v, r) => renderQuarterInput(r, 'q1') },
    { title: 'Q2', dataIndex: 'q2', width: 100, align: 'right', render: (_v, r) => renderQuarterInput(r, 'q2') },
    { title: 'Q3', dataIndex: 'q3', width: 100, align: 'right', render: (_v, r) => renderQuarterInput(r, 'q3') },
    { title: 'Q4', dataIndex: 'q4', width: 100, align: 'right', render: (_v, r) => renderQuarterInput(r, 'q4') },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (s: BudgetAllocation['status']) => {
        const map: Record<string, { label: string; color: string }> = {
          allocated: { label: 'Đã phân bổ', color: 'blue' },
          executing: { label: 'Đang TH', color: 'green' },
          completed: { label: 'Hoàn thành', color: 'default' },
        };
        return <Tag color={map[s].color}>{map[s].label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Phân bổ ngân sách - KHCP 2026</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Tổng NS phê duyệt" value={45200} suffix="triệu" valueStyle={{ color: '#1B3A5C' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Đã phân bổ" value={43800} suffix="triệu" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Chưa phân bổ" value={1400} suffix="triệu" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space>
          <FilterOutlined />
          <Text strong>Lọc:</Text>
          <Select
            allowClear
            placeholder="Phòng ban"
            style={{ width: 200 }}
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments.map((d) => ({ label: d.shortName, value: d.id }))}
          />
          <Select
            allowClear
            placeholder="Loại hạng mục"
            style={{ width: 160 }}
            value={categoryTypeFilter}
            onChange={setCategoryTypeFilter}
            options={Object.entries(categoryTypeConfig).map(([k, v]) => ({ label: v.label, value: k }))}
          />
        </Space>
      </Card>

      <Table<BudgetAllocation>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="small"
        pagination={false}
        bordered
        scroll={{ x: 1200 }}
      />

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleCreateDecision}>
          Tạo QĐ giao kế hoạch
        </Button>
      </div>
    </div>
  );
};

export default BudgetAllocationPage;
