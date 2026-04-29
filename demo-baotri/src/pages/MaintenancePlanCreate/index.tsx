import React, { useState } from 'react';
import {
  Card, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col,
  Typography, Space, Divider, Table, Tag, message, Breadcrumb, Switch, Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  OrderedListOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { equipmentList } from '../../data/equipment';
import { maintenanceTeams, maintenanceStaff } from '../../data/staff';
import { procedures } from '../../data/procedures';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Row types ───────────────────────────────────────────────
interface WorkItemRow {
  key: string;
  order: number;
  name: string;
  description: string;
  assignedStaffId: string;
  estimatedHours: number;
  isMandatory: boolean;
}

interface SparePartRow {
  key: string;
  partName: string;
  partCode: string;
  quantity: number;
  unit: string;
}

const MaintenancePlanCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [workItems, setWorkItems] = useState<WorkItemRow[]>([]);
  const [spareParts, setSpareParts] = useState<SparePartRow[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>();
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>();
  const [selectedProcedure, setSelectedProcedure] = useState<string | undefined>();

  // ─── Quy trình bảo trì ────────────────────────────────────────
  const activeProcedures = procedures.filter(p => p.status === 'active');

  const handleProcedureSelect = (procedureId: string) => {
    setSelectedProcedure(procedureId);
    const procedure = procedures.find(p => p.id === procedureId);
    if (!procedure) return;

    // Auto-fill work items from procedure templates
    const newWorkItems: WorkItemRow[] = procedure.workItemTemplates.map((wt, idx) => ({
      key: `wi-proc-${Date.now()}-${idx}`,
      order: wt.order,
      name: wt.name,
      description: wt.description || '',
      assignedStaffId: '',
      estimatedHours: wt.estimatedHours,
      isMandatory: wt.isMandatory,
    }));
    setWorkItems(newWorkItems);

    // Auto-fill spare parts from procedure suggested parts
    const newSpareParts: SparePartRow[] = procedure.suggestedParts.map((sp, idx) => ({
      key: `sp-proc-${Date.now()}-${idx}`,
      partName: sp.partName,
      partCode: sp.partCode,
      quantity: sp.quantity,
      unit: sp.unit,
    }));
    setSpareParts(newSpareParts);

    message.info(`Đã tải ${newWorkItems.length} hạng mục và ${newSpareParts.length} vật tư từ quy trình ${procedure.code}`);
  };

  // ─── Nhân sự theo đội được chọn ────────────────────────────────
  const teamMembers = selectedTeam
    ? maintenanceStaff.filter(s => {
        const team = maintenanceTeams.find(t => t.id === selectedTeam);
        return team?.members.includes(s.id);
      })
    : maintenanceStaff.filter(s => s.status === 'active');

  const staffOptions = teamMembers.map(s => ({
    value: s.id,
    label: `${s.name} — ${s.specialization}`,
  }));

  // ─── Work Items CRUD ──────────────────────────────────────────
  const handleAddWorkItem = () => {
    setWorkItems([
      ...workItems,
      {
        key: `wi-${Date.now()}`,
        order: workItems.length + 1,
        name: '',
        description: '',
        assignedStaffId: '',
        estimatedHours: 1,
        isMandatory: true,
      },
    ]);
  };

  const handleRemoveWorkItem = (key: string) => {
    const updated = workItems.filter(w => w.key !== key).map((w, i) => ({ ...w, order: i + 1 }));
    setWorkItems(updated);
  };

  const handleWorkItemChange = (key: string, field: string, value: string | number | boolean) => {
    setWorkItems(workItems.map(w => w.key === key ? { ...w, [field]: value } : w));
  };

  // ─── Spare Parts CRUD ─────────────────────────────────────────
  const handleAddSparePart = () => {
    setSpareParts([
      ...spareParts,
      { key: `sp-${Date.now()}`, partName: '', partCode: '', quantity: 1, unit: 'cái' },
    ]);
  };

  const handleRemoveSparePart = (key: string) => {
    setSpareParts(spareParts.filter(sp => sp.key !== key));
  };

  const handleSparePartChange = (key: string, field: string, value: string | number) => {
    setSpareParts(spareParts.map(sp => sp.key === key ? { ...sp, [field]: value } : sp));
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSave = (isDraft: boolean) => {
    if (workItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất 1 hạng mục công việc');
      return;
    }
    const emptyItems = workItems.filter(w => !w.name.trim());
    if (emptyItems.length > 0) {
      message.warning('Vui lòng nhập tên cho tất cả hạng mục công việc');
      return;
    }

    form.validateFields().then(values => {
      const equipment = equipmentList.find(e => e.id === values.equipmentId);
      const team = maintenanceTeams.find(t => t.id === values.teamId);

      const planData = {
        ...values,
        source: 'manual',
        equipmentName: equipment?.name,
        equipmentCode: equipment?.code,
        teamName: team?.name,
        scheduledStart: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        scheduledEnd: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        workItems: workItems.filter(w => w.name).map(w => ({
          ...w,
          assignedStaffName: maintenanceStaff.find(s => s.id === w.assignedStaffId)?.name || '',
          status: 'pending',
        })),
        spareParts: spareParts.filter(sp => sp.partName),
        status: isDraft ? 'draft' : 'pending_approval',
      };

      console.log('Plan data:', planData);
      message.success(isDraft ? 'Đã lưu bản nháp kế hoạch bảo trì' : 'Đã gửi kế hoạch bảo trì chờ phê duyệt');
      navigate('/maintenance-plans');
    }).catch(() => {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    });
  };

  // ─── Equipment info ────────────────────────────────────────────
  const equipment = equipmentList.find(e => e.id === selectedEquipment);
  const totalEstHours = workItems.reduce((s, w) => s + w.estimatedHours, 0);

  // ─── Work Items columns ────────────────────────────────────────
  const workItemColumns: ColumnsType<WorkItemRow> = [
    {
      title: 'STT', width: 50, align: 'center',
      render: (_: unknown, record: WorkItemRow) => (
        <Text type="secondary"><HolderOutlined style={{ marginRight: 4 }} />{record.order}</Text>
      ),
    },
    {
      title: 'Hạng mục công việc', key: 'name',
      render: (_: unknown, record: WorkItemRow) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Input
            size="small"
            placeholder="Tên hạng mục *"
            value={record.name}
            onChange={e => handleWorkItemChange(record.key, 'name', e.target.value)}
            status={!record.name.trim() ? 'error' : undefined}
          />
          <Input
            size="small"
            placeholder="Mô tả chi tiết (tùy chọn)"
            value={record.description}
            onChange={e => handleWorkItemChange(record.key, 'description', e.target.value)}
            style={{ fontSize: 12 }}
          />
        </Space>
      ),
    },
    {
      title: 'Người thực hiện', key: 'staff', width: 200,
      render: (_: unknown, record: WorkItemRow) => (
        <Select
          size="small"
          placeholder="Chọn nhân sự"
          value={record.assignedStaffId || undefined}
          onChange={v => handleWorkItemChange(record.key, 'assignedStaffId', v)}
          options={staffOptions}
          style={{ width: '100%' }}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      ),
    },
    {
      title: 'TG (giờ)', key: 'hours', width: 85, align: 'center',
      render: (_: unknown, record: WorkItemRow) => (
        <InputNumber
          size="small" min={0.5} step={0.5} max={48}
          value={record.estimatedHours}
          onChange={v => handleWorkItemChange(record.key, 'estimatedHours', v || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Bắt buộc', key: 'mandatory', width: 70, align: 'center',
      render: (_: unknown, record: WorkItemRow) => (
        <Checkbox
          checked={record.isMandatory}
          onChange={e => handleWorkItemChange(record.key, 'isMandatory', e.target.checked)}
        />
      ),
    },
    {
      title: '', width: 40, align: 'center',
      render: (_: unknown, record: WorkItemRow) => (
        <Button type="text" danger size="small" icon={<DeleteOutlined />}
          onClick={() => handleRemoveWorkItem(record.key)} />
      ),
    },
  ];

  // ─── Spare Parts columns ───────────────────────────────────────
  const sparePartColumns: ColumnsType<SparePartRow> = [
    {
      title: 'STT', width: 50, align: 'center',
      render: (_: unknown, __: SparePartRow, index: number) => index + 1,
    },
    {
      title: 'Tên vật tư / phụ tùng', dataIndex: 'partName',
      render: (_: string, record: SparePartRow) => (
        <Input size="small" placeholder="Nhập tên vật tư..." value={record.partName}
          onChange={e => handleSparePartChange(record.key, 'partName', e.target.value)} />
      ),
    },
    {
      title: 'Mã vật tư', dataIndex: 'partCode', width: 140,
      render: (_: string, record: SparePartRow) => (
        <Input size="small" placeholder="Mã VT" value={record.partCode}
          onChange={e => handleSparePartChange(record.key, 'partCode', e.target.value)} />
      ),
    },
    {
      title: 'SL', dataIndex: 'quantity', width: 80, align: 'center',
      render: (_: number, record: SparePartRow) => (
        <InputNumber size="small" min={1} value={record.quantity} style={{ width: '100%' }}
          onChange={v => handleSparePartChange(record.key, 'quantity', v || 1)} />
      ),
    },
    {
      title: 'ĐVT', dataIndex: 'unit', width: 90,
      render: (_: string, record: SparePartRow) => (
        <Select size="small" value={record.unit} style={{ width: '100%' }}
          onChange={v => handleSparePartChange(record.key, 'unit', v)}
          options={[
            { value: 'cái', label: 'Cái' }, { value: 'bộ', label: 'Bộ' },
            { value: 'cuộn', label: 'Cuộn' }, { value: 'lít', label: 'Lít' },
            { value: 'kg', label: 'Kg' }, { value: 'mét', label: 'Mét' },
          ]} />
      ),
    },
    {
      title: '', width: 40, align: 'center',
      render: (_: unknown, record: SparePartRow) => (
        <Button type="text" danger size="small" icon={<DeleteOutlined />}
          onClick={() => handleRemoveSparePart(record.key)} />
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <Breadcrumb
        items={[
          { title: 'Tổng quan' },
          { title: <a onClick={() => navigate('/maintenance-plans')}>Kế hoạch bảo trì</a> },
          { title: 'Tạo kế hoạch' },
        ]}
        style={{ marginBottom: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18,
          }}>
            <CalendarOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Tạo kế hoạch bảo trì</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Lập kế hoạch bảo trì mới — thiết lập hạng mục, phân công, vật tư</Text>
          </div>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/maintenance-plans')}>Quay lại</Button>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ type: 'periodic', priority: 'medium' }}>
        <Row gutter={[16, 16]}>
          {/* ── Cột trái ── */}
          <Col xs={24} lg={16}>
            {/* Card 1: Thông tin chung */}
            <Card
              title={
                <Space>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>
                    <CalendarOutlined />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Thông tin kế hoạch</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item label="Tên kế hoạch" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên kế hoạch' }]}>
                    <Input placeholder="VD: Kiểm tra hệ thống S-125 sau cảnh báo lỗi" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item label="Loại bảo trì" name="type" rules={[{ required: true }]}>
                    <Select options={[
                      { value: 'periodic', label: 'Bảo trì định kỳ' },
                      { value: 'corrective', label: 'Sửa chữa' },
                      { value: 'inspection', label: 'Kiểm tra' },
                    ]} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item label="Quy trình bảo trì" name="procedureId">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Chọn quy trình để tự động điền hạng mục (tùy chọn)"
                      optionFilterProp="label"
                      value={selectedProcedure}
                      onChange={v => {
                        if (v) {
                          handleProcedureSelect(v);
                          form.setFieldValue('procedureId', v);
                        } else {
                          setSelectedProcedure(undefined);
                        }
                      }}
                      options={activeProcedures.map(p => ({
                        value: p.id,
                        label: `${p.code} — ${p.name} (${p.totalEstimatedHours} giờ, ${p.workItemTemplates.length} hạng mục)`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Thiết bị" name="equipmentId" rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
                    <Select showSearch placeholder="Chọn thiết bị cần bảo trì" optionFilterProp="label"
                      onChange={v => setSelectedEquipment(v)}
                      options={equipmentList.map(e => ({ value: e.id, label: `${e.code} — ${e.name}` }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Đội thực hiện" name="teamId" rules={[{ required: true, message: 'Vui lòng chọn đội thực hiện' }]}>
                    <Select placeholder="Chọn đội bảo trì"
                      onChange={v => setSelectedTeam(v)}
                      options={maintenanceTeams.map(t => ({ value: t.id, label: `${t.name} (${t.memberCount} người)` }))} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Thời gian thực hiện" name="dateRange" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                    <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY"
                      placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                      disabledDate={current => current && current < dayjs().startOf('day')} />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item label="Mức ưu tiên" name="priority" rules={[{ required: true }]}>
                    <Select options={[
                      { value: 'low', label: 'Thấp' }, { value: 'medium', label: 'Trung bình' },
                      { value: 'high', label: 'Cao' }, { value: 'critical', label: 'Khẩn cấp' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item label="Tổng TG dự kiến">
                    <InputNumber value={totalEstHours} disabled style={{ width: '100%' }} addonAfter="giờ" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Mô tả công việc" name="description">
                <TextArea rows={2} placeholder="Mô tả lý do, phạm vi, yêu cầu đặc biệt..." />
              </Form.Item>
            </Card>

            {/* Card 2: Hạng mục công việc */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>
                      <OrderedListOutlined />
                    </div>
                    <Text strong style={{ color: '#1B3A5C' }}>Hạng mục công việc</Text>
                    {workItems.length > 0 && (
                      <Space size={8}>
                        <Tag color="processing">{workItems.length} mục</Tag>
                        <Tag color="default">{totalEstHours} giờ</Tag>
                      </Space>
                    )}
                  </Space>
                  <Button icon={<PlusOutlined />} onClick={handleAddWorkItem}>
                    Thêm hạng mục
                  </Button>
                </div>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            >
              {workItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <OrderedListOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 12 }} />
                  <div><Text type="secondary">Chưa có hạng mục nào.</Text></div>
                  <div style={{ marginTop: 4 }}><Text type="secondary" style={{ fontSize: 12 }}>Nhấn "Thêm hạng mục" để thiết lập danh sách đầu mục công việc bảo trì.</Text></div>
                  <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 12 }} onClick={handleAddWorkItem}>
                    Thêm hạng mục đầu tiên
                  </Button>
                </div>
              ) : (
                <>
                  <Table
                    columns={workItemColumns}
                    dataSource={workItems}
                    rowKey="key"
                    pagination={false}
                    size="small"
                  />
                  <div style={{ padding: '8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddWorkItem}>
                      Thêm hạng mục
                    </Button>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tổng: <Text strong>{workItems.length}</Text> hạng mục</Text>
                      <Divider type="vertical" />
                      <Text type="secondary" style={{ fontSize: 12 }}>Thời gian: <Text strong>{totalEstHours}</Text> giờ</Text>
                      <Divider type="vertical" />
                      <Text type="secondary" style={{ fontSize: 12 }}>Bắt buộc: <Text strong>{workItems.filter(w => w.isMandatory).length}</Text></Text>
                    </Space>
                  </div>
                </>
              )}
            </Card>

            {/* Card 3: Vật tư */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #D4A843, #f0d890)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a1628', fontSize: 13, fontWeight: 700 }}>
                      VT
                    </div>
                    <Text strong style={{ color: '#1B3A5C' }}>Vật tư yêu cầu</Text>
                    {spareParts.length > 0 && <Tag color="processing">{spareParts.length} mục</Tag>}
                  </Space>
                  <Button size="small" icon={<PlusOutlined />} onClick={handleAddSparePart}>Thêm vật tư</Button>
                </div>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              {spareParts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                  <Text type="secondary">Chưa có vật tư. Nhấn "Thêm vật tư" nếu cần.</Text>
                </div>
              ) : (
                <Table columns={sparePartColumns} dataSource={spareParts} rowKey="key" pagination={false} size="small" />
              )}
            </Card>
          </Col>

          {/* ── Cột phải ── */}
          <Col xs={24} lg={8}>
            {/* Thông tin thiết bị */}
            <Card
              title={<Text strong style={{ color: '#1B3A5C' }}>Thông tin thiết bị</Text>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            >
              {equipment ? (
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Tên thiết bị</Text>
                    <div><Text strong>{equipment.name}</Text></div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Mã thiết bị</Text>
                    <div><Text>{equipment.code}</Text></div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Loại / Vị trí</Text>
                    <div><Text>{equipment.type} — {equipment.location}</Text></div>
                  </div>
                  <Divider style={{ margin: '6px 0' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Trạng thái</Text>
                    <div>
                      <Tag color={equipment.status === 'operational' ? 'success' : equipment.status === 'maintenance' ? 'warning' : 'error'}>
                        {equipment.status === 'operational' ? 'Đang vận hành' : equipment.status === 'maintenance' ? 'Đang bảo trì' : 'Hỏng hóc'}
                      </Tag>
                    </div>
                  </div>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Giờ vận hành</Text>
                      <div><Text strong style={{ color: '#1B3A5C' }}>{equipment.operatingHours.toLocaleString()}h</Text></div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Chu kỳ BT</Text>
                      <div><Text strong>{equipment.maintenanceCycle} ngày</Text></div>
                    </Col>
                  </Row>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>BT gần nhất</Text>
                      <div><Text style={{ fontSize: 12 }}>{dayjs(equipment.lastMaintenanceDate).format('DD/MM/YYYY')}</Text></div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>BT tiếp theo</Text>
                      <div><Text style={{ fontSize: 12, color: dayjs(equipment.nextMaintenanceDate).isBefore(dayjs()) ? '#ff4d4f' : '#1B3A5C', fontWeight: 600 }}>
                        {dayjs(equipment.nextMaintenanceDate).format('DD/MM/YYYY')}
                      </Text></div>
                    </Col>
                  </Row>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">Chọn thiết bị để xem thông tin</Text>
                </div>
              )}
            </Card>

            {/* Ghi chú */}
            <Card
              title={<Text strong style={{ color: '#1B3A5C' }}>Ghi chú</Text>}
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            >
              <Form.Item name="notes" noStyle>
                <TextArea rows={3} placeholder="Ghi chú thêm về kế hoạch bảo trì này..." />
              </Form.Item>
            </Card>

            {/* Hành động */}
            <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Button
                  type="primary" block size="large"
                  icon={<SendOutlined />}
                  onClick={() => handleSave(false)}
                  style={{ background: '#1B3A5C', borderColor: '#1B3A5C', height: 44, fontWeight: 600 }}
                >
                  Gửi phê duyệt
                </Button>
                <Button block size="large" icon={<SaveOutlined />} onClick={() => handleSave(true)} style={{ height: 44 }}>
                  Lưu bản nháp
                </Button>
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ fontSize: 11, color: '#999', textAlign: 'center', lineHeight: '16px' }}>
                  Kế hoạch cần có ít nhất 1 hạng mục công việc. Sau khi gửi, Ban Giám đốc sẽ phê duyệt trước khi thực hiện.
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MaintenancePlanCreate;
