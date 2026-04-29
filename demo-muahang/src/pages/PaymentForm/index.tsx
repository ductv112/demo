import React, { useState, useMemo } from 'react';
import {
  Card, Row, Col, Typography, Space, Button, Form, Input, InputNumber,
  Select, DatePicker, message, Divider, Table, Tag, Empty,
} from 'antd';
import {
  ArrowLeftOutlined, DollarOutlined, SaveOutlined, CheckCircleOutlined,
  PaperClipOutlined, UploadOutlined, FileTextOutlined, BankOutlined,
  CloseCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { contracts } from '../../data/contracts';
import { deliveryTrackings, defectRequests } from '../../data/receiving';
import { formatCurrency, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedContractId, setSelectedContractId] = useState<string | undefined>(undefined);
  const [selectedDeliveryNo, setSelectedDeliveryNo] = useState<number | undefined>(undefined);
  const [invoiceValue, setInvoiceValue] = useState<number>(0);

  // Hợp đồng đang thực hiện / đã ký
  const availableContracts = contracts.filter(c => c.status === 'executing' || c.status === 'signed');
  const selectedContract = contracts.find(c => c.id === selectedContractId);

  // Chỉ đợt giao đã nghiệm thu (delivered / confirmed)
  const deliveryOptions = useMemo(() => {
    if (!selectedContract) return [];
    return selectedContract.deliveries
      .filter(d => d.status === 'delivered' || d.status === 'confirmed')
      .map(d => ({
        value: d.deliveryNo,
        label: `Đợt ${d.deliveryNo} — Giao: ${d.actualDate ? formatDate(d.actualDate) : '--'} | ${d.status === 'confirmed' ? 'Đã nghiệm thu' : 'Đã giao'}`,
      }));
  }, [selectedContract]);

  // Dữ liệu đối soát tự tính
  const reconciliation = useMemo(() => {
    if (!selectedContract || !selectedDeliveryNo) return null;

    const delivery = selectedContract.deliveries.find(d => d.deliveryNo === selectedDeliveryNo);
    const tracking = deliveryTrackings.find(d => d.contractId === selectedContract.id && d.deliveryNo === selectedDeliveryNo);
    const defects = defectRequests.filter(d => d.contractId === selectedContract.id && d.status !== 'resolved' && d.status !== 'closed');

    if (!delivery) return null;

    // Giá trị đợt giao theo HĐ
    const deliveryValue = delivery.items.reduce((s, i) => {
      const contractItem = selectedContract.items.find(ci => ci.materialId === i.materialId);
      return s + (contractItem ? contractItem.unitPrice * i.plannedQty : 0);
    }, 0);

    // Giá trị nghiệm thu (chỉ tính SL đạt)
    const acceptedValue = delivery.items.reduce((s, i) => {
      const contractItem = selectedContract.items.find(ci => ci.materialId === i.materialId);
      return s + (contractItem ? contractItem.unitPrice * i.acceptedQty : 0);
    }, 0);

    const warehouseConfirmed = tracking?.status === 'stored';
    const qualityPassed = defects.length === 0;

    return {
      delivery,
      tracking,
      defects,
      deliveryValue,
      acceptedValue,
      warehouseConfirmed,
      qualityPassed,
      contractMatch: invoiceValue > 0 && Math.abs(invoiceValue - acceptedValue) < 0.1,
    };
  }, [selectedContract, selectedDeliveryNo, invoiceValue]);

  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId);
    setSelectedDeliveryNo(undefined);
    setInvoiceValue(0);
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      form.setFieldsValue({ deliveryNo: undefined, invoiceValue: undefined });
    }
  };

  const handleDeliveryChange = (deliveryNo: number) => {
    setSelectedDeliveryNo(deliveryNo);
    // Auto suggest giá trị hóa đơn = giá trị nghiệm thu
    if (selectedContract) {
      const delivery = selectedContract.deliveries.find(d => d.deliveryNo === deliveryNo);
      if (delivery) {
        const acceptedValue = delivery.items.reduce((s, i) => {
          const contractItem = selectedContract.items.find(ci => ci.materialId === i.materialId);
          return s + (contractItem ? contractItem.unitPrice * i.acceptedQty : 0);
        }, 0);
        setInvoiceValue(acceptedValue);
        form.setFieldsValue({ invoiceValue: acceptedValue, paymentAmount: acceptedValue });
      }
    }
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success('Đã lưu phiếu thanh toán');
      navigate('/payments');
    });
  };

  const handleSaveAndVerify = () => {
    form.validateFields().then(() => {
      if (!reconciliation) { message.warning('Vui lòng chọn hợp đồng và đợt giao'); return; }
      message.success('Đã lưu và bắt đầu đối soát');
      navigate('/payments');
    });
  };

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/payments')} style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}>
        Quay lại danh sách
      </Button>

      {/* Hero */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`, padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarOutlined style={{ fontSize: 22, color: colors.goldLight }} />
            </div>
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20 }}>Nhập hóa đơn nhà cung cấp</Title>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Chọn hợp đồng + đợt giao đã nghiệm thu → nhập thông tin hóa đơn → hệ thống tự đối soát</Text>
            </div>
          </div>
        </div>
      </Card>

      <Form form={form} layout="vertical">
        {/* Chọn hợp đồng + đợt giao */}
        <Card
          title={<Space size={10}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined style={{ fontSize: 14, color: '#fff' }} /></div><span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Chọn hợp đồng và đợt giao</span></Space>}
          style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
          styles={{ body: { padding: '24px 28px' } }}
        >
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f0f7ff', borderRadius: 6, fontSize: 12, color: colors.textSecondary }}>
            <BankOutlined style={{ marginRight: 6, color: colors.navy }} />
            Chỉ hiển thị đợt giao hàng <Text strong style={{ fontSize: 12 }}>đã được nghiệm thu</Text> từ Quản lý Kho. NCC gửi hóa đơn sau khi hàng đã nghiệm thu.
          </div>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="contractId" label="Hợp đồng" rules={[{ required: true, message: 'Chọn hợp đồng' }]}>
                <Select
                  placeholder="Chọn hợp đồng mua sắm"
                  onChange={handleContractChange}
                  options={availableContracts.map(c => ({
                    value: c.id,
                    label: `${c.code} — ${c.supplierName} (${formatCurrency(c.totalValue)})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="deliveryNo" label="Đợt giao hàng (đã nghiệm thu)" rules={[{ required: true, message: 'Chọn đợt giao' }]}>
                <Select
                  placeholder={selectedContractId ? (deliveryOptions.length > 0 ? 'Chọn đợt giao đã nghiệm thu' : 'Không có đợt giao nào đã nghiệm thu') : 'Chọn hợp đồng trước'}
                  onChange={handleDeliveryChange}
                  options={deliveryOptions}
                  disabled={!selectedContractId || deliveryOptions.length === 0}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin HĐ + đợt giao đã chọn */}
          {selectedContract && selectedDeliveryNo && reconciliation && (
            <div style={{ padding: '16px 20px', background: colors.bgLight, borderRadius: 10 }}>
              <Row gutter={24}>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhà cung cấp</Text>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.navy }}>{selectedContract.supplierName}</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Giá trị đợt giao (HĐ)</Text>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.navy }}>{formatCurrency(reconciliation.deliveryValue)}</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Giá trị nghiệm thu</Text>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.success }}>{formatCurrency(reconciliation.acceptedValue)}</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Điều kiện TT</Text>
                  <div style={{ fontSize: 13 }}>{selectedContract.paymentTerms}</div>
                </Col>
              </Row>

              {/* Danh sách vật tư nghiệm thu */}
              <Table
                dataSource={reconciliation.delivery.items}
                rowKey="materialId"
                size="small"
                pagination={false}
                style={{ marginTop: 12 }}
                columns={[
                  { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 100, render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text> },
                  { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name' },
                  { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60, align: 'center' as const },
                  { title: 'SL KH', dataIndex: 'plannedQty', key: 'planned', width: 70, align: 'right' as const },
                  { title: 'SL giao', dataIndex: 'deliveredQty', key: 'delivered', width: 70, align: 'right' as const, render: (v: number) => <Text style={{ color: v > 0 ? colors.navy : colors.textSecondary }}>{v}</Text> },
                  { title: 'SL đạt', dataIndex: 'acceptedQty', key: 'accepted', width: 70, align: 'right' as const, render: (v: number) => <Text strong style={{ color: v > 0 ? colors.success : colors.textSecondary }}>{v}</Text> },
                  {
                    title: 'Giá trị đạt', key: 'value', width: 100, align: 'right' as const,
                    render: (_: unknown, record: any) => {
                      const contractItem = selectedContract.items.find(ci => ci.materialId === record.materialId);
                      const val = contractItem ? contractItem.unitPrice * record.acceptedQty : 0;
                      return <Text strong style={{ color: colors.navy }}>{val.toFixed(1)} tr</Text>;
                    },
                  },
                ]}
              />
            </div>
          )}
        </Card>

        {/* Thông tin hóa đơn */}
        <Card
          title={<Space size={10}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarOutlined style={{ fontSize: 14, color: '#fff' }} /></div><span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Thông tin hóa đơn NCC</span></Space>}
          style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
          styles={{ body: { padding: '24px 28px' } }}
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="invoiceNumber" label="Số hóa đơn" rules={[{ required: true, message: 'Nhập số hóa đơn' }]}>
                <Input placeholder="VD: INV-Alpha-2026-025" style={{ fontSize: 15 }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="invoiceDate" label="Ngày hóa đơn" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%', fontSize: 15 }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="invoiceValue" label="Giá trị hóa đơn (triệu đồng)" rules={[{ required: true, message: 'Nhập giá trị' }]}>
                <InputNumber min={0} step={0.1} style={{ width: '100%', fontSize: 15 }} placeholder="0" addonAfter="tr"
                  onChange={(v) => setInvoiceValue(Number(v) || 0)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="paymentMethod" label="Hình thức thanh toán" rules={[{ required: true, message: 'Chọn hình thức' }]}>
                <Select placeholder="Chọn hình thức" options={[
                  { value: 'transfer', label: 'Chuyển khoản' },
                  { value: 'advance', label: 'Tạm ứng' },
                  { value: 'direct', label: 'Thanh toán trực tiếp' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="paymentAmount" label="Số tiền đề nghị thanh toán (triệu đồng)">
                <InputNumber min={0} step={0.1} style={{ width: '100%', fontSize: 15 }} placeholder="Mặc định = giá trị nghiệm thu" addonAfter="tr" />
              </Form.Item>
            </Col>
          </Row>

          {/* Upload hóa đơn */}
          <Divider style={{ margin: '12px 0 16px' }} />
          <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 12 }}>
            <PaperClipOutlined style={{ marginRight: 6 }} />
            Đính kèm hóa đơn (scan)
          </Text>
          <div style={{
            padding: '20px', background: colors.bgLight, borderRadius: 10,
            border: `2px dashed ${colors.border}`, textAlign: 'center', cursor: 'pointer',
          }}
            onClick={() => message.info('Chức năng upload file sẽ hoạt động khi có API')}
          >
            <UploadOutlined style={{ fontSize: 28, color: colors.navy, marginBottom: 8 }} />
            <div style={{ fontSize: 14, color: colors.navy, fontWeight: 500 }}>Nhấn để tải lên hoặc kéo thả file hóa đơn</div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>Hỗ trợ PDF, JPG, PNG. Tối đa 10MB/file</div>
          </div>
        </Card>

        {/* Preview đối soát */}
        {reconciliation && invoiceValue > 0 && (
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: reconciliation.contractMatch && reconciliation.warehouseConfirmed && reconciliation.qualityPassed ? `linear-gradient(135deg, ${colors.success}, #10b981)` : 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 14, color: '#fff' }} />
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15, color: colors.navy }}>Kết quả đối soát (tự động)</span>
                  <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 400 }}>Hệ thống tự kiểm tra dựa trên dữ liệu có sẵn</div>
                </div>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}
          >
            <Table
              dataSource={[
                {
                  key: 'contract',
                  criteria: 'Giá trị hóa đơn khớp hợp đồng',
                  contractData: `Giá trị đợt giao: ${formatCurrency(reconciliation.deliveryValue)} | Nghiệm thu: ${formatCurrency(reconciliation.acceptedValue)}`,
                  invoiceData: `Hóa đơn NCC: ${formatCurrency(invoiceValue)}`,
                  match: reconciliation.contractMatch,
                  note: reconciliation.contractMatch ? 'Giá trị khớp' : `Chênh lệch ${(invoiceValue - reconciliation.acceptedValue).toFixed(1)} tr`,
                },
                {
                  key: 'warehouse',
                  criteria: 'Kho xác nhận nhập hàng',
                  contractData: `Đợt ${selectedDeliveryNo} — ${reconciliation.delivery.actualDate ? 'Giao: ' + formatDate(reconciliation.delivery.actualDate) : 'Chưa giao'}`,
                  invoiceData: reconciliation.tracking?.warehouseCode ? `Nhập ${reconciliation.tracking.warehouseCode} | ${reconciliation.tracking.storedDate ? formatDate(reconciliation.tracking.storedDate) : ''}` : 'Chưa nhập kho',
                  match: reconciliation.warehouseConfirmed,
                  note: reconciliation.warehouseConfirmed ? 'Đã nhập kho' : 'Chưa xác nhận nhập kho',
                },
                {
                  key: 'quality',
                  criteria: 'Chất lượng đạt yêu cầu',
                  contractData: `${selectedContract!.items.length} loại vật tư`,
                  invoiceData: reconciliation.defects.length > 0 ? `${reconciliation.defects.length} YC xử lý lỗi chưa giải quyết` : 'Không có vật tư lỗi',
                  match: reconciliation.qualityPassed,
                  note: reconciliation.qualityPassed ? 'Đạt chất lượng' : `Có ${reconciliation.defects.length} lỗi chưa xử lý`,
                },
              ]}
              rowKey="key"
              size="middle"
              pagination={false}
              columns={[
                { title: 'Tiêu chí', dataIndex: 'criteria', key: 'criteria', width: 220, render: (text: string) => <Text strong style={{ fontSize: 14, color: colors.navy }}>{text}</Text> },
                { title: 'Dữ liệu hệ thống', dataIndex: 'contractData', key: 'system', width: 280, render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text> },
                { title: 'Dữ liệu hóa đơn / kho', dataIndex: 'invoiceData', key: 'invoice', width: 250, render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text> },
                {
                  title: 'Kết quả', key: 'result', width: 120, align: 'center' as const,
                  render: (_: unknown, record: any) => record.match
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>Đạt</Tag>
                    : <Tag color="error" icon={<CloseCircleOutlined />}>Chưa đạt</Tag>,
                },
                { title: 'Ghi chú', dataIndex: 'note', key: 'note', width: 200, render: (text: string, record: any) => <Text style={{ fontSize: 12, color: record.match ? colors.success : colors.danger }}>{text}</Text> },
              ]}
            />

            {!reconciliation.contractMatch && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff2f0', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: colors.danger }} />
                <Text style={{ fontSize: 12, color: colors.danger }}>
                  Giá trị hóa đơn ({formatCurrency(invoiceValue)}) không khớp giá trị nghiệm thu ({formatCurrency(reconciliation.acceptedValue)}). Vui lòng kiểm tra lại.
                </Text>
              </div>
            )}
          </Card>
        )}

        {/* Ghi chú */}
        <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }} styles={{ body: { padding: '20px 28px' } }}>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú thêm về phiếu thanh toán" style={{ fontSize: 15 }} />
          </Form.Item>
        </Card>
      </Form>

      {/* Sticky footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 98,
        background: '#fff', borderTop: '1px solid #eef0f3',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        padding: '12px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12,
      }}>
        <Button onClick={() => navigate('/payments')}>Hủy</Button>
        <Button icon={<SaveOutlined />} onClick={handleSave}>Lưu nháp</Button>
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSaveAndVerify}>Lưu & Đối soát</Button>
      </div>
      <div style={{ height: 64 }} />
    </div>
  );
};

export default PaymentForm;
