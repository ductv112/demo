import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, InputNumber, Space, Typography, Row, Col, Statistic,
  Select, Modal, message, Tooltip, Dropdown,
} from 'antd';
import {
  CheckCircleOutlined, EditOutlined, CloseCircleOutlined, PlusOutlined,
  SendOutlined, FilterOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { budgetRegistrations2027 } from '../../data/budgetRegistrations';
import { departments, getDepartmentShortName } from '../../data/departments';
import { categoryTypeConfig, budgetRegistrationStatusConfig, formatCurrency } from '../../utils/format';
import type { BudgetRegistration, CategoryType } from '../../types';

const { Title, Text } = Typography;

const BudgetConsolidation: React.FC = () => {
  const [data, setData] = useState<BudgetRegistration[]>(budgetRegistrations2027);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    if (!departmentFilter) return data;
    return data.filter((r) => r.departmentId === departmentFilter);
  }, [data, departmentFilter]);

  const stats = useMemo(() => {
    const submitted = data.filter((r) => r.status !== 'draft');
    const reviewed = submitted.filter((r) => ['approved', 'adjusted', 'rejected'].includes(r.status));
    const pending = submitted.filter((r) => !['approved', 'adjusted', 'rejected'].includes(r.status));
    const total = submitted.reduce((sum, r) => sum + r.estimatedAmount, 0);
    return { total, count: submitted.length, reviewed: reviewed.length, pending: pending.length };
  }, [data]);

  const handleAdjustedAmountChange = (id: string, value: number | null) => {
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, adjustedAmount: value ?? undefined } : r)),
    );
  };

  const handleAction = (id: string, action: 'approve' | 'adjust' | 'reject' | 'supplement') => {
    const labels: Record<string, string> = {
      approve: 'Duyệt',
      adjust: 'Điều chỉnh',
      reject: 'Từ chối',
      supplement: 'Yêu cầu bổ sung',
    };
    const statusMap: Record<string, BudgetRegistration['status']> = {
      approve: 'approved',
      adjust: 'adjusted',
      reject: 'rejected',
      supplement: 'reviewing',
    };
    message.success(`Đã ${labels[action]} phiếu ${id}`);
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: statusMap[action] } : r)),
    );
  };

  const handleSubmitAll = () => {
    Modal.confirm({
      title: 'Trình phê duyệt dự toán',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn sắp trình phê duyệt bản dự toán KHCP 2027 với tổng số:</p>
          <p style={{ fontWeight: 600, fontSize: 16 }}>
            {formatCurrency(totalProposed)} ({filteredData.length} nhiệm vụ)
          </p>
          <p>Dự toán sẽ được gửi lên Ban Giám đốc để phê duyệt.</p>
        </div>
      ),
      okText: 'Xác nhận trình',
      cancelText: 'Hủy',
      onOk: () => {
        message.success('Đã trình phê duyệt dự toán KHCP 2027');
      },
    });
  };

  const totalProposed = useMemo(
    () =>
      filteredData.reduce((sum, r) => sum + (r.adjustedAmount ?? r.estimatedAmount), 0),
    [filteredData],
  );

  const columns: ColumnsType<BudgetRegistration> = [
    {
      title: 'STT',
      width: 55,
      align: 'center',
      render: (_v, _r, i) => i + 1,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'departmentId',
      width: 100,
      render: (id: string) => getDepartmentShortName(id),
    },
    {
      title: 'Loại NV',
      dataIndex: 'categoryType',
      width: 110,
      render: (t: CategoryType) => (
        <Tag color={categoryTypeConfig[t].color} style={{ color: '#fff' }}>
          {categoryTypeConfig[t].label}
        </Tag>
      ),
    },
    {
      title: 'Giải trình nhu cầu',
      dataIndex: 'justification',
      ellipsis: true,
    },
    {
      title: 'Số tiền ĐX (tr)',
      dataIndex: 'estimatedAmount',
      width: 130,
      align: 'right',
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    {
      title: 'TT năm trước',
      dataIndex: 'previousYearActual',
      width: 120,
      align: 'right',
      render: (v?: number) => (v ? v.toLocaleString('vi-VN') : '—'),
    },
    {
      title: 'Đề xuất duyệt',
      dataIndex: 'adjustedAmount',
      width: 140,
      align: 'right',
      render: (val: number | undefined, record: BudgetRegistration) => (
        <InputNumber
          size="small"
          style={{ width: '100%' }}
          value={val ?? record.estimatedAmount}
          min={0}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
          onChange={(v) => handleAdjustedAmountChange(record.id, v)}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (s: BudgetRegistration['status']) => (
        <Tag color={budgetRegistrationStatusConfig[s].color}>
          {budgetRegistrationStatusConfig[s].label}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      width: 150,
      align: 'center',
      render: (_: unknown, record: BudgetRegistration) => {
        const items = [
          { key: 'approve', label: 'Duyệt', icon: <CheckCircleOutlined /> },
          { key: 'adjust', label: 'Điều chỉnh', icon: <EditOutlined /> },
          { key: 'reject', label: 'Từ chối', icon: <CloseCircleOutlined /> },
          { key: 'supplement', label: 'Yêu cầu bổ sung', icon: <PlusOutlined /> },
        ];
        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) =>
                handleAction(record.id, key as 'approve' | 'adjust' | 'reject' | 'supplement'),
            }}
          >
            <Button size="small" type="primary">
              Thao tác
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Tổng hợp &amp; Lập dự toán - KHCP 2027</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng nhu cầu đăng ký"
              value={stats.total}
              suffix="triệu"
              valueStyle={{ color: '#1B3A5C' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Số phiếu" value={stats.count} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Đã xem xét" value={stats.reviewed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Chưa xem xét" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Space>
          <FilterOutlined />
          <Text strong>Lọc:</Text>
          <Select
            allowClear
            placeholder="Phòng ban"
            style={{ width: 220 }}
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments.map((d) => ({ label: d.shortName, value: d.id }))}
          />
        </Space>
      </Card>

      <Table<BudgetRegistration>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="small"
        pagination={false}
        bordered
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6} align="right">
                <Text strong>Tổng dự toán đề xuất:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <Text strong style={{ color: '#1B3A5C', fontSize: 15 }}>
                  {totalProposed.toLocaleString('vi-VN')} tr
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} />
              <Table.Summary.Cell index={8} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Tooltip title="Gửi bản dự toán lên Ban Giám đốc phê duyệt">
          <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSubmitAll}>
            Trình phê duyệt
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default BudgetConsolidation;
