import React, { useState, useMemo } from 'react';
import {
  Table, Card, Tag, Button, Modal, Form, Input, Select, DatePicker,
  InputNumber, Space, Row, Col, Drawer, Alert, Typography, message,
  Divider, Tooltip,
} from 'antd';
import {
  PlusOutlined, InfoCircleOutlined, DeleteOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { budgetRegistrations2027 } from '../../data/budgetRegistrations';
import { departments, getDepartmentShortName } from '../../data/departments';
import { budgetSources, costCategories } from '../../data/costPlans';
import {
  formatCurrency, formatCurrencyFull, categoryTypeConfig, budgetRegistrationStatusConfig,
} from '../../utils/format';
import type { BudgetRegistration, CategoryType } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const BudgetRequestPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<{ key: number; name: string; amount: number }[]>([
    { key: 1, name: '', amount: 0 },
  ]);

  // Expanded row keys
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // Summary stats
  const totalRequested = useMemo(
    () => budgetRegistrations2027.reduce((sum, r) => sum + r.estimatedAmount, 0),
    [],
  );

  const totalPreviousYear = useMemo(
    () => budgetRegistrations2027.reduce((sum, r) => sum + (r.previousYearActual || 0), 0),
    [],
  );

  const columns: ColumnsType<BudgetRegistration> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'departmentId',
      key: 'departmentId',
      width: 100,
      render: (deptId: string) => getDepartmentShortName(deptId),
    },
    {
      title: 'Loại NV',
      dataIndex: 'categoryType',
      key: 'categoryType',
      width: 110,
      render: (type: string) => {
        const cfg = categoryTypeConfig[type as CategoryType];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : type;
      },
    },
    {
      title: 'Giải trình nhu cầu',
      dataIndex: 'justification',
      key: 'justification',
      ellipsis: true,
    },
    {
      title: 'Số tiền đề xuất',
      dataIndex: 'estimatedAmount',
      key: 'estimatedAmount',
      width: 140,
      align: 'right',
      render: (amount: number) => (
        <Text strong>{formatCurrency(amount)}</Text>
      ),
      sorter: (a: BudgetRegistration, b: BudgetRegistration) => a.estimatedAmount - b.estimatedAmount,
    },
    {
      title: 'TT năm trước',
      dataIndex: 'previousYearActual',
      key: 'previousYearActual',
      width: 130,
      align: 'right',
      render: (amount: number | undefined, record: BudgetRegistration) => {
        if (!amount) return <Text type="secondary">—</Text>;
        const diff = record.estimatedAmount - amount;
        const pct = ((diff / amount) * 100).toFixed(0);
        const isUp = diff > 0;
        return (
          <Tooltip title={`So với năm trước: ${isUp ? '+' : ''}${pct}%`}>
            <Space size={4}>
              <span>{formatCurrency(amount)}</span>
              {isUp ? (
                <ArrowUpOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BudgetRegistration['status']) => {
        const cfg = budgetRegistrationStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_: unknown, record: BudgetRegistration) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setExpandedKeys(prev =>
              prev.includes(record.id)
                ? prev.filter(k => k !== record.id)
                : [...prev, record.id],
            );
          }}
        >
          {expandedKeys.includes(record.id) ? 'Thu gọn' : 'Chi tiết'}
        </Button>
      ),
    },
  ];

  // Expandable row render
  const expandedRowRender = (record: BudgetRegistration) => {
    return (
      <div style={{ padding: '8px 0' }}>
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={16}>
            <Text type="secondary">Giải trình: </Text>
            <Text>{record.justification}</Text>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            {record.previousYearActual && (
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message={
                  <span>
                    So sánh năm trước: <strong>{formatCurrencyFull(record.previousYearActual)}</strong>
                    {' → '}Đề xuất: <strong>{formatCurrencyFull(record.estimatedAmount)}</strong>
                    {' ('}
                    {record.estimatedAmount > record.previousYearActual ? '+' : ''}
                    {(((record.estimatedAmount - record.previousYearActual) / record.previousYearActual) * 100).toFixed(1)}%
                    {')'}
                  </span>
                }
                style={{ display: 'inline-block' }}
              />
            )}
          </Col>
        </Row>
        {record.adjustedAmount !== undefined && (
          <Row style={{ marginTop: 8 }}>
            <Col>
              <Text type="secondary">Số tiền sau điều chỉnh: </Text>
              <Text strong>{formatCurrencyFull(record.adjustedAmount)}</Text>
            </Col>
          </Row>
        )}
      </div>
    );
  };

  // Line items management
  const addLineItem = () => {
    const newKey = lineItems.length > 0 ? Math.max(...lineItems.map(i => i.key)) + 1 : 1;
    setLineItems([...lineItems, { key: newKey, name: '', amount: 0 }]);
  };

  const removeLineItem = (key: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter(i => i.key !== key));
  };

  const updateLineItem = (key: number, field: 'name' | 'amount', value: string | number) => {
    setLineItems(lineItems.map(i => i.key === key ? { ...i, [field]: value } : i));
  };

  const totalLineItems = useMemo(
    () => lineItems.reduce((sum, i) => sum + (i.amount || 0), 0),
    [lineItems],
  );

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Budget registration:', { ...values, items: lineItems });
      message.success('Đã đăng ký nhu cầu chi phí thành công!');
      setDrawerOpen(false);
      form.resetFields();
      setLineItems([{ key: 1, name: '', amount: 0 }]);
    });
  };

  return (
    <div>
      <Title level={3}>Đăng ký nhu cầu chi phí - KHCP 2027</Title>

      <Alert
        message="Hạn đăng ký: 30/11/2026. Vui lòng đăng ký đầy đủ nhu cầu kinh phí cho năm 2027."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Text type="secondary">Tổng số đăng ký</Text>
            <Title level={4} style={{ margin: '4px 0 0' }}>{budgetRegistrations2027.length} nhiệm vụ</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Text type="secondary">Tổng kinh phí đề xuất</Text>
            <Title level={4} style={{ margin: '4px 0 0', color: '#1B3A5C' }}>{formatCurrencyFull(totalRequested)}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Text type="secondary">Thực tế năm trước (tham khảo)</Text>
            <Title level={4} style={{ margin: '4px 0 0', color: '#6b7280' }}>{formatCurrencyFull(totalPreviousYear)}</Title>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            + Đăng ký nhu cầu mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={budgetRegistrations2027}
          rowKey="id"
          size="middle"
          expandable={{
            expandedRowRender,
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys(keys as React.Key[]),
          }}
          pagination={false}
          summary={() => (
            <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
              <Table.Summary.Cell index={0} colSpan={4}>
                <Text strong>TỔNG CỘNG</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ color: '#1B3A5C' }}>{formatCurrency(totalRequested)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Text strong style={{ color: '#6b7280' }}>{formatCurrency(totalPreviousYear)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} colSpan={2} />
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Create Drawer */}
      <Drawer
        title="Đăng ký nhu cầu chi phí mới"
        placement="right"
        width={720}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); setLineItems([{ key: 1, name: '', amount: 0 }]); }}
        extra={
          <Space>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit}>Gửi đăng ký</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="categoryType" label="Loại hạng mục" rules={[{ required: true, message: 'Chọn loại hạng mục' }]}>
            <Select placeholder="Chọn loại hạng mục">
              {Object.entries(categoryTypeConfig).map(([key, cfg]) => (
                <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="justification" label="Giải trình nhu cầu" rules={[{ required: true, message: 'Nhập giải trình nhu cầu' }]}>
            <Input.TextArea rows={3} placeholder="Giải trình nhu cầu kinh phí và lý do đề xuất" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: 'Chọn phòng ban' }]}>
                <Select placeholder="Chọn phòng ban">
                  {departments.map(d => (
                    <Select.Option key={d.id} value={d.id}>{d.shortName} - {d.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sourceId" label="Nguồn kinh phí" rules={[{ required: true, message: 'Chọn nguồn KP' }]}>
                <Select placeholder="Chọn nguồn kinh phí">
                  {budgetSources.map(s => (
                    <Select.Option key={s.id} value={s.id}>
                      <Tooltip title={s.description}>{s.name}</Tooltip>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Hạng mục chi phí" rules={[{ required: true, message: 'Chọn hạng mục' }]}>
                <Select placeholder="Chọn hạng mục chi phí">
                  {costCategories.map(cat => (
                    <Select.OptGroup key={cat.id} label={cat.name}>
                      {cat.children ? (
                        cat.children.map(child => (
                          <Select.Option key={child.id} value={child.id}>{child.name}</Select.Option>
                        ))
                      ) : (
                        <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                      )}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateRange" label="Thời gian thực hiện" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                <RangePicker style={{ width: '100%' }} placeholder={['Từ ngày', 'Đến ngày']} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Các hạng mục chi phí</Divider>

          {/* Line items table */}
          <div style={{ marginBottom: 16 }}>
            {lineItems.map((item, index) => (
              <Row key={item.key} gutter={8} style={{ marginBottom: 8 }} align="middle">
                <Col span={2}>
                  <Text type="secondary">{index + 1}.</Text>
                </Col>
                <Col span={14}>
                  <Input
                    placeholder="Nội dung chi"
                    value={item.name}
                    onChange={e => updateLineItem(item.key, 'name', e.target.value)}
                  />
                </Col>
                <Col span={6}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Số tiền (tr)"
                    min={0}
                    value={item.amount || undefined}
                    onChange={v => updateLineItem(item.key, 'amount', v || 0)}
                    addonAfter="tr"
                  />
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeLineItem(item.key)}
                    disabled={lineItems.length <= 1}
                  />
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addLineItem} block icon={<PlusOutlined />}>
              Thêm hạng mục
            </Button>
          </div>

          <Divider />

          <Row justify="end">
            <Col>
              <Card size="small" style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
                <Text type="secondary">Tổng số tiền đề xuất: </Text>
                <Title level={4} style={{ margin: 0, display: 'inline', color: '#1B3A5C' }}>
                  {formatCurrencyFull(totalLineItems)}
                </Title>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Form.Item name="previousYearAmount" label="Thực hiện năm trước (nếu có)">
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Số tiền thực hiện năm 2026 (triệu đồng)"
                min={0}
                addonAfter="triệu đồng"
              />
            </Form.Item>
            {form.getFieldValue('previousYearAmount') > 0 && (
              <Alert
                type="info"
                message={`So sánh: Đề xuất ${formatCurrencyFull(totalLineItems)} vs Năm trước ${formatCurrencyFull(form.getFieldValue('previousYearAmount') || 0)}`}
                showIcon
              />
            )}
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default BudgetRequestPage;
