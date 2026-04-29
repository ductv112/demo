import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Select, Typography, Drawer,
  Descriptions, Form, DatePicker, Input, InputNumber, Row, Col, message, Dropdown,
} from 'antd';
import {
  PlusOutlined, HistoryOutlined, EyeOutlined, FilterOutlined,
  DatabaseOutlined, WarningOutlined, SwapOutlined, ClockCircleOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { operationLogs } from '../../data/operationHistory';
import { equipmentList } from '../../data/equipment';
import type { OperationLog, OperationEventType } from '../../types';
import {
  operationEventTypeConfig, formatDate, formatHours,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;

const OperationHistoryPage: React.FC = () => {
  const { isVongDoi, isDepartment } = useUser();
  const [filterType, setFilterType] = useState<string>('');
  const [filterEquipment, setFilterEquipment] = useState<string>('');
  const [filterResult, setFilterResult] = useState<string>('');

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const filtered = useMemo(() => {
    return operationLogs
      .filter(l => {
        if (filterType && l.eventType !== filterType) return false;
        if (filterEquipment && l.equipmentId !== filterEquipment) return false;
        if (filterResult && l.result !== filterResult) return false;
        return true;
      })
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [filterType, filterEquipment, filterResult]);

  const handleView = (record: OperationLog) => {
    setSelectedLog(record);
    setViewDrawerOpen(true);
  };

  const handleAddSave = () => {
    form.validateFields().then(() => {
      msg.success('Đã ghi nhận nhật ký vận hành thành công');
      setAddDrawerOpen(false);
      form.resetFields();
    });
  };

  const resultConfig = {
    normal:         { label: 'Bình thường', color: 'success' },
    abnormal:       { label: 'Bất thường', color: 'error' },
    needs_attention:{ label: 'Cần chú ý', color: 'warning' },
  };

  const columns: ColumnsType<OperationLog> = [
    {
      title: 'Ngày sự kiện',
      dataIndex: 'eventDate',
      key: 'date',
      width: 115,
      render: (d) => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Trang thiết bị',
      key: 'equipment',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{record.equipmentName}</div>
          <Text code style={{ fontSize: 11 }}>{record.equipmentCode}</Text>
        </div>
      ),
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 130,
      render: (type: OperationEventType) => (
        <Tag color={operationEventTypeConfig[type]?.color} style={{ fontSize: 11 }}>
          {operationEventTypeConfig[type]?.label}
        </Tag>
      ),
    },
    {
      title: 'Giờ HĐ tích lũy',
      key: 'totalHours',
      width: 130,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{formatHours(record.operatingHoursTotal)}</div>
          {record.hoursThisSession > 0 && (
            <Text type="secondary" style={{ fontSize: 11 }}>+{record.hoursThisSession} giờ</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'operatorName',
      key: 'operator',
      width: 150,
      render: (name) => <Text style={{ fontSize: 12 }}>{name}</Text>,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => <Text style={{ fontSize: 12 }}>{loc}</Text>,
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      render: (result: keyof typeof resultConfig) => (
        <Tag color={resultConfig[result]?.color} style={{ fontSize: 11 }}>
          {resultConfig[result]?.label}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 48,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [{ key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' }],
            onClick: ({ key }) => { if (key === 'view') handleView(record); },
          }}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  const renderForm = () => (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="equipmentId" label="Trang thiết bị" rules={[{ required: true }]}>
        <Select placeholder="Chọn trang thiết bị" showSearch optionFilterProp="children">
          {equipmentList.map(e => (
            <Option key={e.id} value={e.id}>{e.name} — {e.code}</Option>
          ))}
        </Select>
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="eventType" label="Loại sự kiện" rules={[{ required: true }]}>
            <Select placeholder="Loại sự kiện vận hành">
              {Object.entries(operationEventTypeConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="eventDate" label="Ngày sự kiện" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" defaultValue={dayjs()} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="operatingHoursTotal" label="Giờ HĐ tích lũy (hiện tại)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="giờ" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="hoursThisSession" label="Số giờ phiên này">
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="giờ" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="operatorName" label="Người thực hiện" rules={[{ required: true }]}>
            <Input placeholder="Tên người/kíp vận hành" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="result" label="Kết quả" rules={[{ required: true }]}>
            <Select placeholder="Kết quả vận hành">
              <Option value="normal">Bình thường</Option>
              <Option value="abnormal">Bất thường</Option>
              <Option value="needs_attention">Cần chú ý</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="location" label="Địa điểm">
            <Input placeholder="Địa điểm vận hành / vị trí thiết bị" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="notes" label="Ghi chú / Nhận xét" rules={[{ required: true }]}>
        <Input.TextArea rows={4} placeholder="Mô tả tình trạng vận hành, hiện tượng bất thường (nếu có)..." />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HistoryOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Lịch sử Vận hành Trang thiết bị</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Nhật ký vận hành, bàn giao, kiểm tra và hiệu chuẩn trang thiết bị</Text>
                </div>
              </Space>
            </Col>
            {(isVongDoi || isDepartment) && (
              <Col>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => { form.resetFields(); setAddDrawerOpen(true); }}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}
                >
                  Ghi nhận vận hành
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { title: 'Tổng bản ghi', value: operationLogs.length, unit: 'sự kiện', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <DatabaseOutlined /> },
          { title: 'Bất thường / Cần chú ý', value: operationLogs.filter(l => l.result !== 'normal').length, unit: 'sự kiện', gradient: 'linear-gradient(135deg, #b45309, #d97706)', icon: <WarningOutlined /> },
          { title: 'Bàn giao / Tiếp nhận', value: operationLogs.filter(l => ['transfer_in', 'transfer_out'].includes(l.eventType)).length, unit: 'sự kiện', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <SwapOutlined /> },
          { title: 'Giờ HĐ tháng 4/2026', value: operationLogs.filter(l => l.eventDate.startsWith('2026-04')).reduce((s, l) => s + l.hoursThisSession, 0), unit: 'giờ', gradient: 'linear-gradient(135deg, #166534, #16a34a)', icon: <ClockCircleOutlined /> },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</span>
                  {card.unit && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 6 }}>{card.unit}</span>}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 10 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          <Select
            placeholder={<><FilterOutlined /> Loại sự kiện</>}
            value={filterType || undefined}
            onChange={v => setFilterType(v || '')}
            style={{ width: 155 }}
            allowClear
          >
            {Object.entries(operationEventTypeConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Trang thiết bị"
            value={filterEquipment || undefined}
            onChange={v => setFilterEquipment(v || '')}
            style={{ width: 200 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {equipmentList.map(e => (
              <Option key={e.id} value={e.id}>{e.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Kết quả"
            value={filterResult || undefined}
            onChange={v => setFilterResult(v || '')}
            style={{ width: 140 }}
            allowClear
          >
            <Option value="normal">Bình thường</Option>
            <Option value="abnormal">Bất thường</Option>
            <Option value="needs_attention">Cần chú ý</Option>
          </Select>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị {filtered.length}/{operationLogs.length} bản ghi
          </Text>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 12, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
          scroll={{ x: 1000 }}
          rowClassName={(r) => r.result === 'abnormal' ? 'row-highlight' : r.result === 'needs_attention' ? 'row-executing' : ''}
        />
      </Card>

      {/* View drawer */}
      <Drawer
        title={
          selectedLog ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1B3A5C' }}>{selectedLog.equipmentName}</div>
              <Space style={{ marginTop: 4 }}>
                <Tag color={operationEventTypeConfig[selectedLog.eventType]?.color} style={{ fontSize: 11 }}>
                  {operationEventTypeConfig[selectedLog.eventType]?.label}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(selectedLog.eventDate)}</Text>
              </Space>
            </div>
          ) : 'Chi tiết nhật ký vận hành'
        }
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        width={520}
        footer={<Button onClick={() => setViewDrawerOpen(false)}>Đóng</Button>}
      >
        {selectedLog && (
          <div>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã thiết bị" span={2}><Text code>{selectedLog.equipmentCode}</Text></Descriptions.Item>
              <Descriptions.Item label="Loại sự kiện">
                <Tag color={operationEventTypeConfig[selectedLog.eventType]?.color}>
                  {operationEventTypeConfig[selectedLog.eventType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sự kiện">{formatDate(selectedLog.eventDate)}</Descriptions.Item>
              <Descriptions.Item label="Giờ HĐ tích lũy">
                <strong>{formatHours(selectedLog.operatingHoursTotal)}</strong>
              </Descriptions.Item>
              {selectedLog.hoursThisSession > 0 && (
                <Descriptions.Item label="Giờ phiên này">
                  <strong>+{selectedLog.hoursThisSession} giờ</strong>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Người thực hiện">{selectedLog.operatorName}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị phụ trách">{selectedLog.departmentName}</Descriptions.Item>
              <Descriptions.Item label="Địa điểm" span={2}>{selectedLog.location}</Descriptions.Item>
              <Descriptions.Item label="Kết quả">
                <Tag color={selectedLog.result === 'normal' ? 'success' : selectedLog.result === 'abnormal' ? 'error' : 'warning'}>
                  {selectedLog.result === 'normal' ? 'Bình thường' : selectedLog.result === 'abnormal' ? 'Bất thường' : 'Cần chú ý'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Ghi chú / Nhận xét</Text>
              <div style={{ marginTop: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13, lineHeight: '1.6' }}>
                {selectedLog.notes}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add drawer */}
      <Drawer
        title={<Space><PlusOutlined style={{ color: '#1B3A5C' }} /><span style={{ fontWeight: 700, color: '#1B3A5C' }}>Ghi nhận nhật ký vận hành</span></Space>}
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        width={580}
        footer={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSave}>Lưu nhật ký</Button>
            <Button onClick={() => setAddDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        {renderForm()}
      </Drawer>
    </div>
  );
};

export default OperationHistoryPage;
