import React, { useState } from 'react';
import {
  Card, Form, Input, Select, InputNumber, Button, Row, Col,
  Typography, Space, Divider, Table, Tag, message, Breadcrumb,
  Checkbox, Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  OrderedListOutlined,
  HolderOutlined,
  CheckSquareOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Row types ───────────────────────────────────────────────
interface WorkItemRow {
  key: string;
  order: number;
  name: string;
  description: string;
  estimatedHours: number;
  isMandatory: boolean;
  requiredSkill: string;
  checklistItems: ChecklistRow[];
}

interface ChecklistRow {
  key: string;
  order: number;
  content: string;
  isMandatory: boolean;
}

interface SuggestedPartRow {
  key: string;
  partCode: string;
  partName: string;
  quantity: number;
  unit: string;
  notes: string;
}

interface DocumentRow {
  key: string;
  name: string;
  type: string;
  fileName: string;
}

const ProcedureCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [workItems, setWorkItems] = useState<WorkItemRow[]>([]);
  const [suggestedParts, setSuggestedParts] = useState<SuggestedPartRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [expandedWorkItem, setExpandedWorkItem] = useState<string | undefined>();

  // ─── Work Items CRUD ──────────────────────────────────────────
  const handleAddWorkItem = () => {
    const newItem: WorkItemRow = {
      key: `wi-${Date.now()}`, order: workItems.length + 1,
      name: '', description: '', estimatedHours: 1, isMandatory: true, requiredSkill: '', checklistItems: [],
    };
    setWorkItems([...workItems, newItem]);
    setExpandedWorkItem(newItem.key);
  };

  const handleRemoveWorkItem = (key: string) => {
    setWorkItems(workItems.filter(w => w.key !== key).map((w, i) => ({ ...w, order: i + 1 })));
    if (expandedWorkItem === key) setExpandedWorkItem(undefined);
  };

  const handleWorkItemChange = (key: string, field: string, value: string | number | boolean) => {
    setWorkItems(workItems.map(w => w.key === key ? { ...w, [field]: value } : w));
  };

  // ─── Checklist CRUD ───────────────────────────────────────────
  const handleAddChecklist = (wiKey: string) => {
    setWorkItems(workItems.map(w => w.key !== wiKey ? w : {
      ...w, checklistItems: [...w.checklistItems, { key: `cl-${Date.now()}`, order: w.checklistItems.length + 1, content: '', isMandatory: true }],
    }));
  };

  const handleRemoveChecklist = (wiKey: string, clKey: string) => {
    setWorkItems(workItems.map(w => w.key !== wiKey ? w : {
      ...w, checklistItems: w.checklistItems.filter(c => c.key !== clKey).map((c, i) => ({ ...c, order: i + 1 })),
    }));
  };

  const handleChecklistChange = (wiKey: string, clKey: string, field: string, value: string | boolean) => {
    setWorkItems(workItems.map(w => w.key !== wiKey ? w : {
      ...w, checklistItems: w.checklistItems.map(c => c.key === clKey ? { ...c, [field]: value } : c),
    }));
  };

  // ─── Suggested Parts CRUD ─────────────────────────────────────
  const handleAddPart = () => {
    setSuggestedParts([...suggestedParts, { key: `sp-${Date.now()}`, partCode: '', partName: '', quantity: 1, unit: 'cái', notes: '' }]);
  };
  const handleRemovePart = (key: string) => setSuggestedParts(suggestedParts.filter(p => p.key !== key));
  const handlePartChange = (key: string, field: string, value: string | number) => {
    setSuggestedParts(suggestedParts.map(p => p.key === key ? { ...p, [field]: value } : p));
  };

  // ─── Documents CRUD ───────────────────────────────────────────
  const handleAddDocument = () => {
    setDocuments([...documents, { key: `doc-${Date.now()}`, name: '', type: 'manual', fileName: '' }]);
  };
  const handleRemoveDocument = (key: string) => setDocuments(documents.filter(d => d.key !== key));
  const handleDocumentChange = (key: string, field: string, value: string) => {
    setDocuments(documents.map(d => d.key === key ? { ...d, [field]: value } : d));
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSave = (isDraft: boolean) => {
    if (workItems.length === 0) { message.warning('Vui lòng thêm ít nhất 1 hạng mục công việc'); return; }
    if (workItems.some(w => !w.name.trim())) { message.warning('Vui lòng nhập tên cho tất cả hạng mục'); return; }
    if (workItems.some(w => w.checklistItems.length === 0)) { message.warning('Mỗi hạng mục cần có ít nhất 1 checklist'); return; }

    form.validateFields().then(values => {
      const data = {
        ...values, status: isDraft ? 'draft' : 'active', version: '1.0',
        totalEstimatedHours: workItems.reduce((s, w) => s + w.estimatedHours, 0),
        workItemTemplates: workItems, suggestedParts: suggestedParts.filter(p => p.partName), documents: documents.filter(d => d.name),
      };
      console.log('Procedure data:', data);
      message.success(isDraft ? 'Đã lưu bản nháp quy trình' : 'Đã tạo và áp dụng quy trình');
      navigate('/procedures');
    }).catch(() => message.error('Vui lòng điền đầy đủ thông tin bắt buộc'));
  };

  const totalHours = workItems.reduce((s, w) => s + w.estimatedHours, 0);
  const totalChecklist = workItems.reduce((s, w) => s + w.checklistItems.length, 0);

  // ─── Work Item columns ─────────────────────────────────────────
  const workItemColumns: ColumnsType<WorkItemRow> = [
    { title: 'STT', width: 50, align: 'center',
      render: (_: unknown, r: WorkItemRow) => <Text type="secondary"><HolderOutlined style={{ marginRight: 4 }} />{r.order}</Text> },
    { title: 'Hạng mục công việc', key: 'name',
      render: (_: unknown, r: WorkItemRow) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Input size="small" placeholder="Tên hạng mục *" value={r.name}
            onChange={e => handleWorkItemChange(r.key, 'name', e.target.value)}
            status={!r.name.trim() ? 'error' : undefined} />
          <Input size="small" placeholder="Mô tả chi tiết (tùy chọn)" value={r.description}
            onChange={e => handleWorkItemChange(r.key, 'description', e.target.value)} style={{ fontSize: 12 }} />
        </Space>
      ) },
    { title: 'Chuyên môn', key: 'skill', width: 140,
      render: (_: unknown, r: WorkItemRow) => (
        <Select size="small" placeholder="Chọn" value={r.requiredSkill || undefined} allowClear
          onChange={v => handleWorkItemChange(r.key, 'requiredSkill', v || '')} style={{ width: '100%' }}
          options={[{ value: 'Monitoring', label: 'Monitoring' }, { value: 'Sản phẩm chủ lực', label: 'Sản phẩm chủ lực' }, { value: 'Điện tử', label: 'Điện tử' }, { value: 'Cơ khí', label: 'Cơ khí' }]} />
      ) },
    { title: 'TG (giờ)', key: 'hours', width: 85, align: 'center',
      render: (_: unknown, r: WorkItemRow) => <InputNumber size="small" min={0.5} step={0.5} max={48} value={r.estimatedHours}
        onChange={v => handleWorkItemChange(r.key, 'estimatedHours', v || 1)} style={{ width: '100%' }} /> },
    { title: 'Bắt buộc', key: 'mandatory', width: 65, align: 'center',
      render: (_: unknown, r: WorkItemRow) => <Checkbox checked={r.isMandatory} onChange={e => handleWorkItemChange(r.key, 'isMandatory', e.target.checked)} /> },
    { title: 'Checklist', key: 'checklist', width: 85, align: 'center',
      render: (_: unknown, r: WorkItemRow) => (
        <Tag color={r.checklistItems.length > 0 ? 'processing' : 'error'} style={{ cursor: 'pointer' }}
          onClick={() => setExpandedWorkItem(expandedWorkItem === r.key ? undefined : r.key)}>
          {r.checklistItems.length} bước
        </Tag>
      ) },
    { title: '', width: 40, align: 'center',
      render: (_: unknown, r: WorkItemRow) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveWorkItem(r.key)} /> },
  ];

  // ─── Part columns ──────────────────────────────────────────────
  const partColumns: ColumnsType<SuggestedPartRow> = [
    { title: 'STT', width: 45, align: 'center', render: (_: unknown, __: SuggestedPartRow, i: number) => i + 1 },
    { title: 'Mã vật tư', key: 'code', width: 130,
      render: (_: unknown, r: SuggestedPartRow) => <Input size="small" placeholder="Mã VT" value={r.partCode} onChange={e => handlePartChange(r.key, 'partCode', e.target.value)} /> },
    { title: 'Tên vật tư', key: 'name',
      render: (_: unknown, r: SuggestedPartRow) => <Input size="small" placeholder="Tên vật tư *" value={r.partName} onChange={e => handlePartChange(r.key, 'partName', e.target.value)} /> },
    { title: 'SL', key: 'qty', width: 70,
      render: (_: unknown, r: SuggestedPartRow) => <InputNumber size="small" min={1} value={r.quantity} style={{ width: '100%' }} onChange={v => handlePartChange(r.key, 'quantity', v || 1)} /> },
    { title: 'ĐVT', key: 'unit', width: 85,
      render: (_: unknown, r: SuggestedPartRow) => <Select size="small" value={r.unit} style={{ width: '100%' }} onChange={v => handlePartChange(r.key, 'unit', v)}
        options={[{ value: 'cái', label: 'Cái' }, { value: 'bộ', label: 'Bộ' }, { value: 'cuộn', label: 'Cuộn' }, { value: 'lít', label: 'Lít' }, { value: 'kg', label: 'Kg' }]} /> },
    { title: 'Ghi chú', key: 'notes', width: 200,
      render: (_: unknown, r: SuggestedPartRow) => <Input size="small" placeholder="VD: Thay nếu hao mòn > 30%" value={r.notes} onChange={e => handlePartChange(r.key, 'notes', e.target.value)} /> },
    { title: '', width: 40, align: 'center',
      render: (_: unknown, r: SuggestedPartRow) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemovePart(r.key)} /> },
  ];

  // ─── Checklist inline editor ───────────────────────────────────
  const renderChecklistEditor = () => {
    const wi = workItems.find(w => w.key === expandedWorkItem);
    if (!wi) return null;
    return (
      <Card size="small" style={{ marginTop: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e8f0fe' }}
        title={<Space><CheckSquareOutlined style={{ color: '#1B3A5C' }} /><Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Checklist: {wi.name || `Hạng mục ${wi.order}`}</Text><Tag color="processing">{wi.checklistItems.length} bước</Tag></Space>}
        extra={<Button size="small" icon={<PlusOutlined />} onClick={() => handleAddChecklist(wi.key)}>Thêm bước</Button>}>
        {wi.checklistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Thêm các bước kiểm tra cụ thể cho hạng mục này.</Text><br />
            <Button type="dashed" size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={() => handleAddChecklist(wi.key)}>Thêm bước đầu tiên</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {wi.checklistItems.map(cl => (
              <div key={cl.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                <Text type="secondary" style={{ width: 28, textAlign: 'center', fontSize: 12, flexShrink: 0 }}>{cl.order}</Text>
                <Input size="small" placeholder="Nội dung bước kiểm tra *" value={cl.content} style={{ flex: 1 }}
                  onChange={e => handleChecklistChange(wi.key, cl.key, 'content', e.target.value)} />
                <Checkbox checked={cl.isMandatory} onChange={e => handleChecklistChange(wi.key, cl.key, 'isMandatory', e.target.checked)}>
                  <Text style={{ fontSize: 11 }}>Bắt buộc</Text>
                </Checkbox>
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveChecklist(wi.key, cl.key)} />
              </div>
            ))}
            <Button type="dashed" size="small" icon={<PlusOutlined />} style={{ alignSelf: 'flex-start' }} onClick={() => handleAddChecklist(wi.key)}>Thêm bước</Button>
          </div>
        )}
      </Card>
    );
  };

  // ─── Tab content ───────────────────────────────────────────────
  const tabItems = [
    {
      key: 'work-items',
      label: <span><OrderedListOutlined /> Hạng mục & Checklist {workItems.length > 0 && <Tag color="processing" style={{ marginLeft: 4 }}>{workItems.length}</Tag>}</span>,
      children: (
        <div>
          {workItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <OrderedListOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 12 }} />
              <div><Text type="secondary">Chưa có hạng mục. Mỗi hạng mục sẽ chứa checklist kiểm tra cụ thể.</Text></div>
              <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 16 }} onClick={handleAddWorkItem}>Thêm hạng mục đầu tiên</Button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary" style={{ fontSize: 12 }}><Text strong>{workItems.length}</Text> hạng mục</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}><Text strong>{totalHours}</Text> giờ</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}><Text strong>{totalChecklist}</Text> checklist</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}><Text strong>{workItems.filter(w => w.isMandatory).length}</Text> bắt buộc</Text>
                </Space>
                <Button icon={<PlusOutlined />} onClick={handleAddWorkItem}>Thêm hạng mục</Button>
              </div>
              <Table columns={workItemColumns} dataSource={workItems} rowKey="key" pagination={false} size="small" />
              {expandedWorkItem && renderChecklistEditor()}
            </>
          )}
        </div>
      ),
    },
    {
      key: 'parts',
      label: <span><ToolOutlined /> Vật tư gợi ý {suggestedParts.length > 0 && <Tag color="default" style={{ marginLeft: 4 }}>{suggestedParts.length}</Tag>}</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Danh sách vật tư sẽ được gợi ý tự động khi áp dụng quy trình vào kế hoạch bảo trì.</Text>
            <Button icon={<PlusOutlined />} onClick={handleAddPart}>Thêm vật tư</Button>
          </div>
          {suggestedParts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <ToolOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 12 }} />
              <div><Text type="secondary">Chưa có vật tư gợi ý.</Text></div>
              <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 12 }} onClick={handleAddPart}>Thêm vật tư đầu tiên</Button>
            </div>
          ) : (
            <Table columns={partColumns} dataSource={suggestedParts} rowKey="key" pagination={false} size="small" />
          )}
        </div>
      ),
    },
    {
      key: 'documents',
      label: <span><FileTextOutlined /> Tài liệu kỹ thuật {documents.length > 0 && <Tag color="default" style={{ marginLeft: 4 }}>{documents.length}</Tag>}</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Đính kèm bản vẽ, sơ đồ, hướng dẫn kỹ thuật từ nhà sản xuất.</Text>
            <Button icon={<PlusOutlined />} onClick={handleAddDocument}>Thêm tài liệu</Button>
          </div>
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <FileTextOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 12 }} />
              <div><Text type="secondary">Chưa có tài liệu kỹ thuật.</Text></div>
              <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 12 }} onClick={handleAddDocument}>Thêm tài liệu đầu tiên</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {documents.map((doc, i) => (
                <div key={doc.key} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ width: 24, textAlign: 'center', fontSize: 12 }}>{i + 1}</Text>
                  <Input size="small" placeholder="Tên tài liệu *" value={doc.name} style={{ flex: 1 }}
                    onChange={e => handleDocumentChange(doc.key, 'name', e.target.value)} />
                  <Select size="small" value={doc.type} style={{ width: 110 }} onChange={v => handleDocumentChange(doc.key, 'type', v)}
                    options={[{ value: 'manual', label: 'Tài liệu' }, { value: 'diagram', label: 'Sơ đồ' }, { value: 'drawing', label: 'Bản vẽ' }, { value: 'pdf', label: 'PDF' }]} />
                  <Input size="small" placeholder="Tên file (VD: P18_manual.pdf)" value={doc.fileName} style={{ width: 220 }}
                    onChange={e => handleDocumentChange(doc.key, 'fileName', e.target.value)} />
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveDocument(doc.key)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <Breadcrumb items={[
        { title: 'Tổng quan' },
        { title: <a onClick={() => navigate('/procedures')}>Quy trình & Hướng dẫn</a> },
        { title: 'Thêm quy trình' },
      ]} style={{ marginBottom: 8 }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
            <FileTextOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Thêm quy trình bảo trì</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Xây dựng quy trình mẫu với hạng mục, checklist, vật tư gợi ý</Text>
          </div>
        </div>
        <Space>
          <Button icon={<SaveOutlined />} onClick={() => handleSave(true)}>Lưu bản nháp</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={() => handleSave(false)} style={{ background: '#1B3A5C' }}>Tạo & áp dụng</Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/procedures')}>Quay lại</Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ type: 'periodic', equipmentCategory: 'radar' }}>
        {/* Card thông tin chung */}
        <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item label="Tên quy trình" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="VD: Quy trình bảo trì định kỳ Monitoring P-18" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Loại BT" name="type" rules={[{ required: true }]}>
                <Select options={[{ value: 'periodic', label: 'Định kỳ' }, { value: 'corrective', label: 'Sửa chữa' }]} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Nhóm TB" name="equipmentCategory" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'radar', label: 'Monitoring' }, { value: 'missile', label: 'Sản phẩm chủ lực' },
                  { value: 'communication', label: 'Truyền thông' }, { value: 'electronic', label: 'Điện tử' },
                  { value: 'mechanical', label: 'Cơ khí' }, { value: 'general', label: 'Chung' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Loại thiết bị áp dụng" name="equipmentType" rules={[{ required: true, message: 'Nhập loại TB' }]}>
                <Input placeholder="VD: Hệ thống monitoring hạ tầng P-18" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mô tả" name="description" style={{ marginBottom: 0 }}>
            <TextArea rows={2} placeholder="Phạm vi áp dụng, lưu ý đặc biệt, yêu cầu chứng chỉ..." />
          </Form.Item>
        </Card>

        {/* 3 Tabs: Hạng mục | Vật tư | Tài liệu */}
        <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <Tabs items={tabItems} />
        </Card>
      </Form>
    </div>
  );
};

export default ProcedureCreate;
