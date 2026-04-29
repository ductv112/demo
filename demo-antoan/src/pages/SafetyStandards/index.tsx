import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Row, Col, Typography, Input, Select,
  Space, Button, Dropdown, Drawer, Form,
} from 'antd';
import {
  SafetyOutlined, SearchOutlined, PlusOutlined, MoreOutlined,
  EyeOutlined, EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { safetyStandards } from '../../data/safetyStandards';
import {
  standardStatusConfig, standardScopeConfig,
  hazardCategoryConfig, formatDate,
} from '../../utils/format';
import type {
  SafetyStandard, SafetyStandardStatus, SafetyStandardScope, HazardCategory,
} from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;

const workshopOptions = [
  { value: 'PX1', label: 'PX1 - Radar' },
  { value: 'PX2', label: 'PX2 - Tên lửa' },
  { value: 'PX3', label: 'PX3 - Cơ khí' },
  { value: 'PX4', label: 'PX4 - Điện tử' },
];

const SafetyStandardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSafety } = useUser();
  const [form] = Form.useForm();

  const [searchText, setSearchText]         = useState('');
  const [statusFilter, setStatusFilter]     = useState<SafetyStandardStatus | undefined>();
  const [scopeFilter, setScopeFilter]       = useState<SafetyStandardScope | undefined>();
  const [catFilter, setCatFilter]           = useState<HazardCategory | undefined>();
  const [workshopFilter, setWorkshopFilter] = useState<string | undefined>();

  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState<SafetyStandard | null>(null);

  const activeCount          = safetyStandards.filter(s => s.status === 'active').length;
  const draftCount           = safetyStandards.filter(s => s.status === 'draft').length;
  const pendingApprovalCount = safetyStandards.filter(s => s.status === 'pending_approval').length;

  const filteredData = useMemo(() => {
    let result = [...safetyStandards];
    if (statusFilter)   result = result.filter(s => s.status === statusFilter);
    if (scopeFilter)    result = result.filter(s => s.scope === scopeFilter);
    if (catFilter)      result = result.filter(s => s.hazardCategory === catFilter);
    if (workshopFilter) result = result.filter(s => s.applicableWorkshops.includes(workshopFilter));
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(s =>
        s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
      );
    }
    return result;
  }, [searchText, statusFilter, scopeFilter, catFilter, workshopFilter]);

  const openAdd = () => {
    setEditTarget(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEdit = (record: SafetyStandard) => {
    setEditTarget(record);
    form.setFieldsValue({
      code: record.code,
      version: record.version,
      title: record.title,
      scope: record.scope,
      hazardCategory: record.hazardCategory,
      applicableWorkshops: record.applicableWorkshops,
      description: record.description,
      status: record.status,
    });
    setDrawerOpen(true);
  };

  const columns: ColumnsType<SafetyStandard> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 110,
      fixed: 'left',
      render: (code: string) => (
        <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{code}</Text>
      ),
    },
    {
      title: 'Tên tiêu chuẩn / quy trình',
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string, record: SafetyStandard) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1B3A5C', fontSize: 13 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Phiên bản {record.version}
            {record.previousVersion ? ` (trước: ${record.previousVersion})` : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Phạm vi',
      dataIndex: 'scope',
      width: 130,
      render: (scope: SafetyStandardScope) => {
        const cfg = standardScopeConfig[scope];
        return <Tag style={{ borderRadius: 4, color: cfg.color, borderColor: cfg.color }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Loại nguy cơ',
      dataIndex: 'hazardCategory',
      width: 130,
      render: (cat: HazardCategory) => {
        const cfg = hazardCategoryConfig[cat];
        return <Tag style={{ borderRadius: 4, color: cfg.color, borderColor: cfg.color }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Phân xưởng',
      dataIndex: 'applicableWorkshops',
      width: 160,
      render: (wsList: string[]) => (
        <Space size={4} wrap>
          {wsList.map(ws => (
            <Tag key={ws} style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>{ws}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Hiệu lực từ',
      dataIndex: 'effectiveFrom',
      width: 110,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (status: SafetyStandardStatus) => {
        const cfg = standardStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: SafetyStandard) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(isSafety ? [{ key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' }] : []),
            ],
            onClick: ({ key }) => {
              if (key === 'view') navigate(`/tieu-chuan/${record.id}`);
              if (key === 'edit') openEdit(record);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Page header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SafetyOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Quy trình & Tiêu chuẩn An toàn Kỹ thuật
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Xây dựng, phê duyệt, ban hành và phổ biến tiêu chuẩn an toàn — Nhà máy Z119
            </Text>
          </div>
        </Space>
        {isSafety && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
          >
            Thêm tiêu chuẩn
          </Button>
        )}
      </div>

      {/* ─── Summary cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng tiêu chuẩn',   value: safetyStandards.length, gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Đang áp dụng',       value: activeCount,             gradient: 'linear-gradient(135deg, #059669, #10b981)' },
          { label: 'Chờ phê duyệt',      value: pendingApprovalCount,    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
          { label: 'Bản nháp',           value: draftCount,              gradient: 'linear-gradient(135deg, #8c8c8c, #bfbfbf)' },
        ].map(card => (
          <Col xs={24} sm={12} md={6} key={card.label}>
            <div style={{
              background: card.gradient, borderRadius: 14, padding: '16px 20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Filter + Table ─── */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
        }}>
          <Input
            placeholder="Tìm theo mã, tên tiêu chuẩn..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select placeholder="Trạng thái" value={statusFilter} onChange={v => setStatusFilter(v)} allowClear style={{ width: 160 }}
            options={Object.entries(standardStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Phạm vi" value={scopeFilter} onChange={v => setScopeFilter(v)} allowClear style={{ width: 150 }}
            options={Object.entries(standardScopeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Loại nguy cơ" value={catFilter} onChange={v => setCatFilter(v)} allowClear style={{ width: 150 }}
            options={Object.entries(hazardCategoryConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Phân xưởng" value={workshopFilter} onChange={v => setWorkshopFilter(v)} allowClear style={{ width: 160 }} options={workshopOptions} />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c' }}>
            Hiển thị <Text strong>{filteredData.length}</Text>/{safetyStandards.length} tiêu chuẩn
          </div>
        </div>
        <Table<SafetyStandard>
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          onRow={record => ({ onDoubleClick: () => navigate(`/tieu-chuan/${record.id}`) })}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: t => `Tổng ${t} tiêu chuẩn` }}
          scroll={{ x: 1200 }}
          size="middle"
          style={{ margin: 0 }}
        />
      </Card>

      {/* ─── Drawer Thêm mới / Chỉnh sửa ─── */}
      <Drawer
        title={null}
        placement="right"
        width={520}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button style={{ borderRadius: 8 }} onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary"
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}
              onClick={() => setDrawerOpen(false)}
            >
              {editTarget ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        {/* Header gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '20px 24px', color: '#fff',
        }}>
          <Space align="center" size={12}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {editTarget ? <EditOutlined style={{ color: '#fff', fontSize: 18 }} /> : <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {editTarget ? 'Chỉnh sửa tiêu chuẩn' : 'Thêm tiêu chuẩn mới'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                {editTarget ? `${editTarget.code} — ${editTarget.title}` : 'Khai báo quy trình hoặc tiêu chuẩn an toàn kỹ thuật'}
              </div>
            </div>
          </Space>
        </div>

        {/* Form body */}
        <div style={{ padding: 24 }}>
          <Form form={form} layout="vertical" requiredMark="optional">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mã tiêu chuẩn" name="code" rules={[{ required: true, message: 'Nhập mã' }]}>
                  <Input placeholder="AT-011" disabled={!!editTarget} style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Phiên bản" name="version" rules={[{ required: true, message: 'Nhập phiên bản' }]}>
                  <Input placeholder="1.0" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Tên tiêu chuẩn / quy trình" name="title" rules={[{ required: true, message: 'Nhập tên' }]}>
              <Input placeholder="VD: Quy trình an toàn khi làm việc với áp suất cao" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Phạm vi áp dụng" name="scope" rules={[{ required: true }]}>
                  <Select
                    style={{ borderRadius: 8 }}
                    options={Object.entries(standardScopeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Loại nguy cơ" name="hazardCategory" rules={[{ required: true }]}>
                  <Select
                    style={{ borderRadius: 8 }}
                    options={Object.entries(hazardCategoryConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Phân xưởng áp dụng" name="applicableWorkshops" rules={[{ required: true, message: 'Chọn ít nhất 1 phân xưởng' }]}>
              <Select mode="multiple" style={{ borderRadius: 8 }} options={workshopOptions} placeholder="Chọn phân xưởng..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
                  <Select
                    style={{ borderRadius: 8 }}
                    options={Object.entries(standardStatusConfig)
                      .filter(([k]) => k === 'draft' || k === 'pending_approval')
                      .map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Hiệu lực từ ngày" name="effectiveFrom">
                  <Input type="date" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} placeholder="Mô tả mục đích và phạm vi áp dụng của tiêu chuẩn..." style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item label="Người soạn thảo" name="issuedBy">
              <Input placeholder="VD: Trung tá Nguyễn Văn Đức" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default SafetyStandardsPage;
