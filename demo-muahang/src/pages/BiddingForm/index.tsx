import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Table, Space, Button, Form, Input,
  InputNumber, Select, DatePicker, message, Tabs, Divider, Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, SaveOutlined, SendOutlined,
  PlusOutlined, DeleteOutlined, ShoppingCartOutlined,
  ContainerOutlined, GlobalOutlined, CalendarOutlined,
  SafetyCertificateOutlined, PaperClipOutlined, UploadOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { supplyPlans } from '../../data/supplyPlans';
import { biddingPackages } from '../../data/bidding';
import { colors } from '../../theme/themeConfig';
import {
  biddingTypeConfig,
  biddingMethodConfig,
  contractTypeConfig,
  biddingScopeConfig,
} from '../../utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface FormBiddingItem {
  key: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
  totalValue: number;
  technicalRequirement: string;
  deadline: string;
}

const biddingTypeOptions = Object.entries(biddingTypeConfig).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const biddingMethodOptions = Object.entries(biddingMethodConfig).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const contractTypeOptions = Object.entries(contractTypeConfig).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const biddingScopeOptions = Object.entries(biddingScopeConfig).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const supplyPlanOptions = supplyPlans.map(sp => ({
  value: sp.id,
  label: `${sp.code} - ${sp.title}`,
}));

const biddingModeOptions = [
  { value: 'online', label: 'Trực tuyến (qua mạng)' },
  { value: 'offline', label: 'Trực tiếp (nộp hồ sơ)' },
  { value: 'both', label: 'Kết hợp (trực tuyến & trực tiếp)' },
];

let autoKey = 1000;

const BiddingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEdit = !!id;
  const existing = isEdit ? biddingPackages.find(p => p.id === id) : null;
  const approvedPlans = supplyPlans.filter(sp => sp.status === 'approved' || sp.status === 'executing');

  const [items, setItems] = useState<FormBiddingItem[]>([]);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedSupplyPlanId, setSelectedSupplyPlanId] = useState<string | undefined>(
    existing?.supplyPlanId
  );
  const [biddingMode, setBiddingMode] = useState<string>(existing?.biddingMode || 'offline');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existing?.attachments || []);

  // Pre-fill form when editing
  useEffect(() => {
    if (existing) {
      form.setFieldsValue({
        title: existing.title,
        description: existing.description,
        supplyPlanId: existing.supplyPlanId,
        type: existing.type,
        contractType: existing.contractType,
        method: existing.method,
        scope: existing.scope,
        executionDays: existing.executionDays,
        fundingSource: existing.fundingSource,
        sector: existing.sector,
        technicalRequirements: existing.technicalRequirements,
        paymentTerms: existing.paymentTerms,
        biddingMode: existing.biddingMode,
        executionLocation: existing.executionLocation,
        closingDateTime: existing.closingDateTime ? dayjs(existing.closingDateTime) : undefined,
        openingDateTime: existing.openingDateTime ? dayjs(existing.openingDateTime) : undefined,
        openingLocation: existing.openingLocation,
        hsdtValidityDays: existing.hsdtValidityDays,
        depositAmount: existing.depositAmount,
        depositForm: existing.depositForm,
        eHsmtUrl: existing.eHsmtUrl,
        eHsdtFee: existing.eHsdtFee,
        eHsdtUrl: existing.eHsdtUrl,
      });
      setItems(
        existing.items.map((item, idx) => ({
          key: `existing-${idx}`,
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          unit: item.unit,
          quantity: item.quantity,
          estimatedPrice: item.estimatedPrice,
          totalValue: item.totalValue,
          technicalRequirement: item.technicalRequirement || '',
          deadline: item.deadline,
        }))
      );
      setBiddingMode(existing.biddingMode);
    } else {
      form.setFieldsValue({
        fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
        sector: 'Hàng hóa',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load items from supply plan
  const handleSupplyPlanChange = (planId: string) => {
    setSelectedSupplyPlanId(planId);
    const plan = supplyPlans.find(sp => sp.id === planId);
    if (plan) {
      const purchaseItems = plan.items.filter(i => i.source === 'purchase' && i.toPurchase > 0);
      setItems(
        purchaseItems.map((item, idx) => ({
          key: `sp-${idx}`,
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          unit: item.unit,
          quantity: item.toPurchase,
          estimatedPrice: item.unitPrice,
          totalValue: item.toPurchase * item.unitPrice,
          technicalRequirement: '',
          deadline: item.deadline,
        }))
      );
    }
  };

  // Item management
  const addItem = () => {
    autoKey += 1;
    setItems(prev => [
      ...prev,
      {
        key: `new-${autoKey}`,
        materialId: '',
        materialCode: '',
        materialName: '',
        unit: '',
        quantity: 0,
        estimatedPrice: 0,
        totalValue: 0,
        technicalRequirement: '',
        deadline: '',
      },
    ]);
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  const updateItem = (key: string, field: keyof FormBiddingItem, value: unknown) => {
    setItems(prev =>
      prev.map(item => {
        if (item.key !== key) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'estimatedPrice') {
          updated.totalValue = (updated.quantity || 0) * (updated.estimatedPrice || 0);
        }
        return updated;
      })
    );
  };

  // Totals
  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + (i.totalValue || 0), 0),
    [items]
  );

  // Handlers
  const handleSaveDraftFinal = () => {
    form
      .validateFields(['title', 'supplyPlanId', 'type'])
      .then(() => {
        message.success(
          isEdit
            ? `Đã lưu nháp gói thầu ${existing?.code}`
            : 'Đã lưu nháp gói thầu mới'
        );
        navigate('/bidding');
      })
      .catch(() => {
        setActiveTab('1');
        message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      });
  };

  const handlePublishFinal = () => {
    form
      .validateFields()
      .then(() => {
        if (items.length === 0) {
          setActiveTab('2');
          message.warning('Vui lòng thêm vật tư vào gói thầu');
          return;
        }
        message.success(
          isEdit
            ? `Đã đăng tải gói thầu ${existing?.code}`
            : 'Đã tạo và đăng tải gói thầu mới'
        );
        navigate('/bidding');
      })
      .catch(() => {
        message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      });
  };

  // Columns for editable table
  const itemColumns: ColumnsType<FormBiddingItem> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_: unknown, __: FormBiddingItem, idx: number) => (
        <Text strong style={{ color: colors.navy }}>{idx + 1}</Text>
      ),
    },
    {
      title: 'Mã VT',
      key: 'materialCode',
      width: 110,
      render: (_: unknown, record: FormBiddingItem) =>
        record.materialId ? (
          <Text strong style={{ color: colors.navy, fontSize: 13 }}>{record.materialCode}</Text>
        ) : (
          <Input
            size="small"
            value={record.materialCode}
            onChange={e => updateItem(record.key, 'materialCode', e.target.value)}
            placeholder="Mã VT"
            style={{ fontSize: 13 }}
          />
        ),
    },
    {
      title: 'Tên vật tư',
      key: 'materialName',
      width: 200,
      ellipsis: true,
      render: (_: unknown, record: FormBiddingItem) =>
        record.materialId ? (
          <Text style={{ fontSize: 13 }}>{record.materialName}</Text>
        ) : (
          <Input
            size="small"
            value={record.materialName}
            onChange={e => updateItem(record.key, 'materialName', e.target.value)}
            placeholder="Tên vật tư"
            style={{ fontSize: 13 }}
          />
        ),
    },
    {
      title: 'ĐVT',
      key: 'unit',
      width: 70,
      align: 'center',
      render: (_: unknown, record: FormBiddingItem) =>
        record.materialId ? (
          <Text>{record.unit}</Text>
        ) : (
          <Input
            size="small"
            value={record.unit}
            onChange={e => updateItem(record.key, 'unit', e.target.value)}
            placeholder="ĐVT"
            style={{ width: '100%', fontSize: 13 }}
          />
        ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 90,
      align: 'right',
      render: (_: unknown, record: FormBiddingItem) => (
        <InputNumber
          size="small"
          min={0}
          value={record.quantity || undefined}
          onChange={v => updateItem(record.key, 'quantity', v || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn giá dự toán (tr)',
      key: 'estimatedPrice',
      width: 130,
      align: 'right',
      render: (_: unknown, record: FormBiddingItem) => (
        <InputNumber
          size="small"
          min={0}
          step={0.01}
          value={record.estimatedPrice || undefined}
          onChange={v => updateItem(record.key, 'estimatedPrice', v || 0)}
          style={{ width: '100%' }}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      ),
    },
    {
      title: 'Thành tiền (tr)',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: (_: unknown, record: FormBiddingItem) => (
        <Text strong style={{ color: colors.navy, fontSize: 13 }}>
          {record.totalValue ? record.totalValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '0'}
        </Text>
      ),
    },
    {
      title: 'Yêu cầu KT',
      key: 'technicalRequirement',
      width: 200,
      render: (_: unknown, record: FormBiddingItem) => (
        <Input
          size="small"
          value={record.technicalRequirement}
          onChange={e => updateItem(record.key, 'technicalRequirement', e.target.value)}
          placeholder="Yêu cầu kỹ thuật"
          style={{ fontSize: 13 }}
        />
      ),
    },
    {
      title: 'Hạn giao',
      key: 'deadline',
      width: 140,
      render: (_: unknown, record: FormBiddingItem) => (
        <DatePicker
          size="small"
          value={record.deadline ? dayjs(record.deadline) : undefined}
          onChange={(d) => updateItem(record.key, 'deadline', d ? d.format('YYYY-MM-DD') : '')}
          format="DD/MM/YYYY"
          style={{ width: '100%' }}
          placeholder="Chọn ngày"
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 45,
      align: 'center',
      render: (_: unknown, record: FormBiddingItem) => (
        <Popconfirm
          title="Xóa vật tư này?"
          onConfirm={() => removeItem(record.key)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100%' }}>
      {/* ── Hero Header ─────────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          overflow: 'hidden',
          border: 'none',
        }}
        styles={{
          body: {
            background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
            padding: '24px 28px',
            position: 'relative',
          },
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -10, opacity: 0.08, fontSize: 120 }}>
          <FileTextOutlined />
        </div>
        <Row align="middle" gutter={16}>
          <Col>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/bidding')}
              style={{ color: '#fff', fontSize: 16 }}
            />
          </Col>
          <Col>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(212,168,67,0.3)',
              }}
            >
              <FileTextOutlined style={{ fontSize: 22, color: colors.navyDark }} />
            </div>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              {isEdit ? `Chỉnh sửa: ${existing?.title}` : 'Tạo gói thầu mới'}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {isEdit ? `Mã: ${existing?.code}` : 'Nhập thông tin gói thầu, danh mục vật tư và thông tin dự thầu'}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ── Form Content ─────────────────────────────────────── */}
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        style={{ fontSize: 15 }}
      >
        <Card
          style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{
              padding: '0 24px',
              marginBottom: 0,
            }}
            items={[
              {
                key: '1',
                label: (
                  <Space>
                    <ContainerOutlined />
                    <span>Thông tin gói thầu</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '24px 28px' }}>
                    {/* Ten goi thau */}
                    <Form.Item
                      name="title"
                      label={<Text strong style={{ fontSize: 13 }}>Tên gói thầu</Text>}
                      rules={[{ required: true, message: 'Vui lòng nhập tên gói thầu' }]}
                    >
                      <Input
                        placeholder="Ví dụ: Gói thầu cung cấp module monitoring Q1/2026"
                        style={{ fontSize: 15 }}
                      />
                    </Form.Item>

                    {/* Mo ta */}
                    <Form.Item
                      name="description"
                      label={<Text strong style={{ fontSize: 13 }}>Mô tả</Text>}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả chi tiết về gói thầu..."
                        style={{ fontSize: 15 }}
                      />
                    </Form.Item>

                    {/* KH bao dam VT + Hinh thuc LCNT */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="supplyPlanId"
                          label={<Text strong style={{ fontSize: 13 }}>KH bảo đảm VT</Text>}
                          rules={[{ required: true, message: 'Vui lòng chọn kế hoạch' }]}
                        >
                          <Select
                            placeholder="Chọn kế hoạch bảo đảm vật tư"
                            options={supplyPlanOptions}
                            onChange={handleSupplyPlanChange}
                            style={{ fontSize: 15 }}
                            showSearch
                            optionFilterProp="label"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="type"
                          label={<Text strong style={{ fontSize: 13 }}>Hình thức LCNT</Text>}
                          rules={[{ required: true, message: 'Vui lòng chọn hình thức' }]}
                        >
                          <Select
                            placeholder="Chọn hình thức lựa chọn nhà thầu"
                            options={biddingTypeOptions}
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Loai hop dong + Phuong thuc LCNT */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="contractType"
                          label={<Text strong style={{ fontSize: 13 }}>Loại hợp đồng</Text>}
                        >
                          <Select
                            placeholder="Chọn loại hợp đồng"
                            options={contractTypeOptions}
                            style={{ fontSize: 15 }}
                            allowClear
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="method"
                          label={<Text strong style={{ fontSize: 13 }}>Phương thức LCNT</Text>}
                        >
                          <Select
                            placeholder="Chọn phương thức"
                            options={biddingMethodOptions}
                            style={{ fontSize: 15 }}
                            allowClear
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Pham vi + Thoi gian thuc hien */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="scope"
                          label={<Text strong style={{ fontSize: 13 }}>Phạm vi</Text>}
                        >
                          <Select
                            placeholder="Chọn phạm vi"
                            options={biddingScopeOptions}
                            style={{ fontSize: 15 }}
                            allowClear
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="executionDays"
                          label={<Text strong style={{ fontSize: 13 }}>Thời gian thực hiện (ngày)</Text>}
                        >
                          <InputNumber
                            min={1}
                            placeholder="Số ngày"
                            style={{ width: '100%', fontSize: 15 }}
                            addonAfter="ngày"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Nguon von + Linh vuc */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="fundingSource"
                          label={<Text strong style={{ fontSize: 13 }}>Nguồn vốn</Text>}
                        >
                          <Input
                            placeholder="Nguồn vốn"
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="sector"
                          label={<Text strong style={{ fontSize: 13 }}>Lĩnh vực</Text>}
                        >
                          <Input
                            placeholder="Lĩnh vực"
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Yeu cau ky thuat chung */}
                    <Form.Item
                      name="technicalRequirements"
                      label={<Text strong style={{ fontSize: 13 }}>Yêu cầu kỹ thuật chung</Text>}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả yêu cầu kỹ thuật chung cho gói thầu..."
                        style={{ fontSize: 15 }}
                      />
                    </Form.Item>

                    {/* Dieu kien thanh toan */}
                    <Form.Item
                      name="paymentTerms"
                      label={<Text strong style={{ fontSize: 13 }}>Điều kiện thanh toán</Text>}
                    >
                      <TextArea
                        rows={2}
                        placeholder="Ví dụ: Thanh toán 100% sau giao hàng và nghiệm thu"
                        style={{ fontSize: 15 }}
                      />
                    </Form.Item>

                    {/* Upload HSMT */}
                    <Divider style={{ margin: '16px 0' }} />
                    <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 12 }}>
                      <PaperClipOutlined style={{ marginRight: 6 }} />
                      Hồ sơ mời thầu đính kèm
                    </Text>
                    <div style={{
                      padding: '20px',
                      background: colors.bgLight,
                      borderRadius: 10,
                      border: `2px dashed ${colors.border}`,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.navy; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                      onClick={() => message.info('Chức năng upload file sẽ hoạt động khi có API')}
                    >
                      <UploadOutlined style={{ fontSize: 28, color: colors.navy, marginBottom: 8 }} />
                      <div style={{ fontSize: 14, color: colors.navy, fontWeight: 500 }}>
                        Nhấn để tải lên hoặc kéo thả file vào đây
                      </div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                        Hỗ trợ PDF, Word, Excel. Tối đa 20MB/file
                      </div>
                    </div>

                    {/* Mock uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', background: '#fff', borderRadius: 6,
                            border: `1px solid ${colors.border}`, marginBottom: 6,
                          }}>
                            <Space size={8}>
                              <PaperClipOutlined style={{ color: colors.navy }} />
                              <Text style={{ fontSize: 13 }}>{file}</Text>
                            </Space>
                            <Button type="text" danger size="small" icon={<DeleteOutlined />}
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))} />
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ),
              },
              {
                key: '2',
                label: (
                  <Space>
                    <ShoppingCartOutlined />
                    <span>Danh mục vật tư</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '24px 28px' }}>
                    {/* Chọn KH bảo đảm VT */}
                    <div style={{
                      padding: '16px 20px',
                      background: colors.bgLight,
                      borderRadius: 10,
                      marginBottom: 16,
                      border: `1px solid ${colors.border}`,
                    }}>
                      <Row gutter={12} align="middle">
                        <Col flex="auto">
                          <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 8 }}>
                            <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                            Chọn kế hoạch bảo đảm vật tư
                          </Text>
                          <Select
                            placeholder="Chọn KH bảo đảm vật tư để tải danh mục vật tư cần mua"
                            value={selectedSupplyPlanId || undefined}
                            onChange={handleSupplyPlanChange}
                            style={{ width: '100%' }}
                            options={approvedPlans.map(sp => ({
                              value: sp.id,
                              label: `${sp.code} - ${sp.title} (${sp.items.filter(i => i.source === 'purchase' && i.toPurchase > 0).length} loại VT cần mua)`,
                            }))}
                          />
                        </Col>
                      </Row>
                      {selectedSupplyPlanId && (
                        <div style={{ marginTop: 10, fontSize: 12, color: colors.textSecondary }}>
                          Đã tải {items.length} loại vật tư từ kế hoạch. Có thể chỉnh sửa số lượng, đơn giá, yêu cầu kỹ thuật hoặc thêm vật tư thủ công.
                        </div>
                      )}
                    </div>

                    <Table
                      columns={itemColumns}
                      dataSource={items}
                      rowKey="key"
                      size="small"
                      pagination={false}
                      scroll={{ x: 1200 }}
                      locale={{ emptyText: 'Chưa có vật tư. Hãy chọn KH bảo đảm VT hoặc thêm thủ công.' }}
                      style={{ marginBottom: 16 }}
                      summary={() =>
                        items.length > 0 ? (
                          <Table.Summary fixed>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={6} align="right">
                                <Text strong style={{ color: colors.navy, fontSize: 14 }}>
                                  Tổng cộng:
                                </Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={6} align="right">
                                <Text
                                  strong
                                  style={{
                                    color: colors.navy,
                                    fontSize: 15,
                                    background: `linear-gradient(135deg, rgba(27,58,92,0.08), rgba(45,90,142,0.05))`,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                  }}
                                >
                                  {totalValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr
                                </Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={7} colSpan={3} />
                            </Table.Summary.Row>
                          </Table.Summary>
                        ) : null
                      }
                    />

                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addItem}
                      block
                      style={{
                        height: 40,
                        borderColor: colors.navy,
                        color: colors.navy,
                        fontWeight: 500,
                      }}
                    >
                      Thêm vật tư
                    </Button>
                  </div>
                ),
              },
              {
                key: '3',
                label: (
                  <Space>
                    <GlobalOutlined />
                    <span>Thông tin dự thầu</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '24px 28px' }}>
                    {/* Hinh thuc du thau + Dia diem thuc hien */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="biddingMode"
                          label={<Text strong style={{ fontSize: 13 }}>Hình thức dự thầu</Text>}
                        >
                          <Select
                            placeholder="Chọn hình thức dự thầu"
                            options={biddingModeOptions}
                            onChange={(v) => setBiddingMode(v)}
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="executionLocation"
                          label={<Text strong style={{ fontSize: 13 }}>Địa điểm thực hiện</Text>}
                        >
                          <Input
                            placeholder="Ví dụ: Doanh nghiệp A, Hà Nội"
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Thoi diem dong thau + mo thau */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="closingDateTime"
                          label={<Text strong style={{ fontSize: 13 }}>Thời điểm đóng thầu</Text>}
                        >
                          <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Chọn ngày giờ đóng thầu"
                            style={{ width: '100%', fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="openingDateTime"
                          label={<Text strong style={{ fontSize: 13 }}>Thời điểm mở thầu</Text>}
                        >
                          <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Chọn ngày giờ mở thầu"
                            style={{ width: '100%', fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Dia diem mo thau + Hieu luc HSDT */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="openingLocation"
                          label={<Text strong style={{ fontSize: 13 }}>Địa điểm mở thầu</Text>}
                        >
                          <Input
                            placeholder="Ví dụ: Phòng họp Doanh nghiệp A"
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="hsdtValidityDays"
                          label={<Text strong style={{ fontSize: 13 }}>Hiệu lực HSDT (ngày)</Text>}
                        >
                          <InputNumber
                            min={1}
                            placeholder="Số ngày"
                            style={{ width: '100%', fontSize: 15 }}
                            addonAfter="ngày"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* So tien bao dam + Hinh thuc bao dam */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="depositAmount"
                          label={<Text strong style={{ fontSize: 13 }}>Số tiền bảo đảm dự thầu (VND)</Text>}
                        >
                          <InputNumber
                            min={0}
                            placeholder="Số tiền"
                            style={{ width: '100%', fontSize: 15 }}
                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={v => Number(v?.replace(/,/g, '') || 0) as any}
                            addonAfter="VND"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="depositForm"
                          label={<Text strong style={{ fontSize: 13 }}>Hình thức bảo đảm</Text>}
                        >
                          <Input
                            placeholder="Ví dụ: Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm"
                            style={{ fontSize: 15 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Online-specific fields */}
                    {(biddingMode === 'online' || biddingMode === 'both') && (
                      <>
                        <Divider
                          orientation="left"
                          style={{ color: colors.navy, fontWeight: 600, fontSize: 13 }}
                        >
                          <GlobalOutlined style={{ marginRight: 6 }} />
                          Thông tin đấu thầu điện tử
                        </Divider>

                        <Form.Item
                          name="eHsmtUrl"
                          label={<Text strong style={{ fontSize: 13 }}>URL phát hành e-HSMT</Text>}
                        >
                          <Input
                            placeholder="https://muasamcong.mpi.gov.vn"
                            style={{ fontSize: 15 }}
                            prefix={<GlobalOutlined style={{ color: colors.navy }} />}
                          />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="eHsdtFee"
                              label={<Text strong style={{ fontSize: 13 }}>Chi phí nộp e-HSDT (VND)</Text>}
                            >
                              <InputNumber
                                min={0}
                                placeholder="Chi phí"
                                style={{ width: '100%', fontSize: 15 }}
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={v => Number(v?.replace(/,/g, '') || 0) as any}
                                addonAfter="VND"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="eHsdtUrl"
                              label={<Text strong style={{ fontSize: 13 }}>URL nhận e-HSDT</Text>}
                            >
                              <Input
                                placeholder="https://muasamcong.mpi.gov.vn"
                                style={{ fontSize: 15 }}
                                prefix={<GlobalOutlined style={{ color: colors.navy }} />}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* ── Action Bar ─────────────────────────────────────── */}
        <Card
          style={{
            borderRadius: 14,
            marginTop: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
          styles={{ body: { padding: '12px 24px' } }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <CalendarOutlined style={{ color: colors.navy }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  Tổng giá trị dự toán:{' '}
                  <Text strong style={{ color: colors.navy, fontSize: 15 }}>
                    {totalValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu đồng
                  </Text>
                  {' '}({items.length} vật tư)
                </Text>
              </Space>
            </Col>
            <Col>
              <Space size="middle">
                <Button onClick={() => navigate('/bidding')}>
                  Hủy
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraftFinal}
                  style={{ borderColor: colors.navy, color: colors.navy }}
                >
                  Lưu nháp
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handlePublishFinal}
                  style={{
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                    fontWeight: 600,
                  }}
                >
                  Đăng tải
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default BiddingForm;
