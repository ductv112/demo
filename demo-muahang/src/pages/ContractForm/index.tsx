import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  InputNumber,
  Space,
  Breadcrumb,
  Upload,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { contracts } from '../../data/contracts';
import { biddingPackages } from '../../data/bidding';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { ContractItem } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DeliveryMilestone {
  key: string;
  deliveryNo: number;
  plannedDate: string;
  description: string;
}

const ContractFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEdit = !!id;

  const existingContract = useMemo(() => {
    if (!id) return null;
    return contracts.find((c) => c.id === id) || null;
  }, [id]);

  const completedBiddings = useMemo(() => {
    return biddingPackages.filter((b) => b.status === 'completed' || b.status === 'approved');
  }, []);

  const [items, setItems] = useState<ContractItem[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryMilestone[]>([]);
  const [selectedBiddingId, setSelectedBiddingId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (existingContract) {
      form.setFieldsValue({
        title: existingContract.title,
        biddingPackageId: existingContract.biddingPackageId,
        contractType: existingContract.contractType,
        signedDate: existingContract.signedDate ? dayjs(existingContract.signedDate) : undefined,
        startDate: dayjs(existingContract.startDate),
        endDate: dayjs(existingContract.endDate),
        paymentTerms: existingContract.paymentTerms,
        note: existingContract.note,
      });
      setItems(existingContract.items);
      setSelectedBiddingId(existingContract.biddingPackageId);
      setDeliveries(
        existingContract.deliveries.map((d) => ({
          key: d.id,
          deliveryNo: d.deliveryNo,
          plannedDate: d.plannedDate,
          description: d.note || `Đợt giao hàng ${d.deliveryNo}`,
        })),
      );
    }
  }, [existingContract, form]);

  const handleBiddingChange = (biddingId: string) => {
    setSelectedBiddingId(biddingId);
    const bidding = biddingPackages.find((b) => b.id === biddingId);
    if (bidding) {
      const selectedSupplier = bidding.selectedSupplierName || '';
      form.setFieldsValue({
        supplierName: selectedSupplier,
      });
      const contractItems: ContractItem[] = bidding.items.map((item) => ({
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.estimatedPrice,
        totalValue: item.totalValue,
      }));
      setItems(contractItems);
    }
  };

  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalValue, 0);
  }, [items]);

  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice', value: number | null) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    if (field === 'quantity') {
      item.quantity = value || 0;
    } else {
      item.unitPrice = value || 0;
    }
    item.totalValue = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const addDelivery = () => {
    const nextNo = deliveries.length + 1;
    setDeliveries([
      ...deliveries,
      {
        key: `new-${Date.now()}`,
        deliveryNo: nextNo,
        plannedDate: '',
        description: `Đợt giao hàng ${nextNo}`,
      },
    ]);
  };

  const removeDelivery = (key: string) => {
    const newDeliveries = deliveries
      .filter((d) => d.key !== key)
      .map((d, idx) => ({ ...d, deliveryNo: idx + 1 }));
    setDeliveries(newDeliveries);
  };

  const handleDeliveryDateChange = (key: string, date: dayjs.Dayjs | null) => {
    setDeliveries(
      deliveries.map((d) =>
        d.key === key ? { ...d, plannedDate: date ? date.format('YYYY-MM-DD') : '' } : d,
      ),
    );
  };

  const handleDeliveryDescChange = (key: string, desc: string) => {
    setDeliveries(
      deliveries.map((d) =>
        d.key === key ? { ...d, description: desc } : d,
      ),
    );
  };

  const handleSaveDraft = () => {
    form
      .validateFields(['title'])
      .then(() => {
        message.success(isEdit ? 'Đã cập nhật hợp đồng nháp' : 'Đã lưu hợp đồng nháp');
        navigate('/contracts');
      })
      .catch(() => {
        message.error('Vui lòng nhập tên hợp đồng');
      });
  };

  const handleSubmitForSign = () => {
    form
      .validateFields()
      .then(() => {
        if (items.length === 0) {
          message.error('Vui lòng thêm vật tư / thiết bị cho hợp đồng');
          return;
        }
        if (deliveries.length === 0) {
          message.error('Vui lòng thêm ít nhất một đợt giao hàng');
          return;
        }
        message.success('Đã gửi hợp đồng cho NCC ký');
        navigate('/contracts');
      })
      .catch(() => {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      });
  };

  const itemColumns = [
    {
      title: 'Mã vật tư',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
      render: (text: string) => <Text style={{ fontSize: 13, color: colors.navy }}>{text}</Text>,
    },
    {
      title: 'Tên vật tư / thiết bị',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'right' as const,
      render: (val: number, _record: ContractItem, index: number) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(v) => handleItemChange(index, 'quantity', v)}
          size="small"
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: 'Đơn giá (tr)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right' as const,
      render: (val: number, _record: ContractItem, index: number) => (
        <InputNumber
          min={0}
          step={0.1}
          value={val}
          onChange={(v) => handleItemChange(index, 'unitPrice', v)}
          size="small"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Thành tiền (tr)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right' as const,
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>,
    },
  ];

  const selectedBidding = biddingPackages.find((b) => b.id === selectedBiddingId);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <a onClick={() => navigate('/contracts')} style={{ cursor: 'pointer' }}>
                <FileTextOutlined style={{ marginRight: 4 }} />
                Hợp đồng
              </a>
            ),
          },
          { title: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      />

      {/* Hero header */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(27,58,92,0.12)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
            padding: '20px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.08,
              color: '#fff',
              fontSize: 100,
              lineHeight: 1,
            }}
          >
            <FileTextOutlined />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/contracts')}
              ghost
              size="small"
              style={{ borderRadius: 6, marginBottom: 10, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Quay lại
            </Button>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {isEdit ? `Chỉnh sửa hợp đồng ${existingContract?.code || ''}` : 'Tạo hợp đồng mua sắm mới'}
            </Title>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              {isEdit ? 'Cập nhật thông tin hợp đồng' : 'Điền thông tin để tạo hợp đồng mua sắm'}
            </Text>
          </div>
        </div>
      </Card>

      {/* Form content */}
      <Form form={form} layout="vertical" requiredMark="optional">
        <Row gutter={[16, 16]}>
          {/* Left: Basic info */}
          <Col xs={24} md={16}>
            <Card
              title={
                <Space>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileTextOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                  <Text strong style={{ color: colors.navy }}>Thông tin hợp đồng</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              <Form.Item
                name="title"
                label="Tên hợp đồng"
                rules={[{ required: true, message: 'Vui lòng nhập tên hợp đồng' }]}
              >
                <Input placeholder="Nhập tên hợp đồng" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="biddingPackageId"
                label="Gói thầu"
                rules={[{ required: true, message: 'Vui lòng chọn gói thầu' }]}
              >
                <Select
                  placeholder="Chọn gói thầu đã hoàn thành"
                  onChange={handleBiddingChange}
                  options={completedBiddings.map((b) => ({
                    label: `${b.code} - ${b.title}`,
                    value: b.id,
                  }))}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              {selectedBidding && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: `1px solid ${colors.border}` }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Nhà cung cấp trúng thầu</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedBidding.selectedSupplierName || 'Chưa chọn'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Giá trị dự toán gói thầu</Text>
                      <Text strong style={{ fontSize: 13, color: colors.navy }}>{formatCurrency(selectedBidding.estimatedValue)}</Text>
                    </Col>
                  </Row>
                </div>
              )}

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="signedDate" label="Ngày ký">
                    <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Chọn ngày ký" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="startDate"
                    label="Ngày bắt đầu"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                  >
                    <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="endDate"
                    label="Ngày kết thúc"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                  >
                    <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="paymentTerms"
                    label="Điều kiện thanh toán"
                    rules={[{ required: true, message: 'Vui lòng nhập điều kiện thanh toán' }]}
                  >
                    <Input placeholder="Ví dụ: Thanh toán 30% sau đợt 1, 70% sau hoàn thành" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="contractType"
                    label="Loại hợp đồng"
                    rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng' }]}
                  >
                    <Select
                      placeholder="Chọn loại hợp đồng"
                      options={[
                        { label: 'Trọn gói', value: 'lump_sum' },
                        { label: 'Đơn giá', value: 'unit_price' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="note" label="Ghi chú">
                <TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Card>

            {/* Items table */}
            <Card
              title={
                <Space>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileTextOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                  <Text strong style={{ color: colors.navy }}>Danh sách vật tư / thiết bị ({items.length})</Text>
                </Space>
              }
              extra={
                <Text strong style={{ color: colors.navy, fontSize: 14 }}>
                  Tổng: {formatCurrency(totalValue)}
                </Text>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
            >
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <Text type="secondary">Chọn gói thầu để tự động điền danh sách vật tư</Text>
                </div>
              ) : (
                <Table
                  size="small"
                  dataSource={items}
                  columns={itemColumns}
                  rowKey="materialId"
                  pagination={false}
                  scroll={{ x: 800 }}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={5}>
                        <Text strong style={{ color: colors.navy }}>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: colors.navy, fontSize: 14 }}>
                          {formatCurrency(totalValue)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* Right: Delivery schedule + Attachments */}
          <Col xs={24} md={8}>
            <Card
              title={
                <Space>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, #0891b2, #67e8f9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileTextOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                  <Text strong style={{ color: colors.navy }}>Lịch giao hàng</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              {deliveries.map((d) => (
                <div
                  key={d.key}
                  style={{
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    marginBottom: 10,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Row align="middle" justify="space-between" style={{ marginBottom: 6 }}>
                    <Col>
                      <Text strong style={{ fontSize: 13, color: colors.navy }}>
                        Đợt {d.deliveryNo}
                      </Text>
                    </Col>
                    <Col>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeDelivery(d.key)}
                      />
                    </Col>
                  </Row>
                  <DatePicker
                    style={{ width: '100%', marginBottom: 6, borderRadius: 6 }}
                    format="DD/MM/YYYY"
                    placeholder="Ngày giao dự kiến"
                    value={d.plannedDate ? dayjs(d.plannedDate) : null}
                    onChange={(date) => handleDeliveryDateChange(d.key, date)}
                    size="small"
                  />
                  <Input
                    size="small"
                    placeholder="Mô tả đợt giao"
                    value={d.description}
                    onChange={(e) => handleDeliveryDescChange(d.key, e.target.value)}
                    style={{ borderRadius: 6 }}
                  />
                </div>
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={addDelivery}
                style={{ borderRadius: 8 }}
              >
                Thêm đợt giao hàng
              </Button>
            </Card>

            <Card
              title={
                <Space>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, #d97706, #fbbf24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UploadOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                  <Text strong style={{ color: colors.navy }}>Tài liệu đính kèm</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: 16 }}
            >
              <Upload.Dragger
                multiple
                beforeUpload={() => false}
                style={{ borderRadius: 8 }}
              >
                <p style={{ color: colors.navy }}>
                  <UploadOutlined style={{ fontSize: 24 }} />
                </p>
                <p style={{ fontSize: 13, margin: 0 }}>Kéo thả hoặc nhấn để tải lên</p>
                <p style={{ fontSize: 11, color: colors.textSecondary }}>PDF, DOC, XLSX (tối đa 10MB)</p>
              </Upload.Dragger>
            </Card>
          </Col>
        </Row>

      </Form>

      {/* Sticky footer action bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 98,
        background: '#fff',
        borderTop: '1px solid #eef0f3',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
      }}>
        <Button
          onClick={() => navigate('/contracts')}
          style={{ borderRadius: 8 }}
        >
          Hủy
        </Button>
        <Button
          icon={<SaveOutlined />}
          onClick={handleSaveDraft}
          style={{ borderRadius: 8 }}
        >
          Lưu nháp
        </Button>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmitForSign}
          style={{ borderRadius: 8 }}
        >
          Gửi NCC ký
        </Button>
      </div>

      {/* Spacer để nội dung không bị che bởi footer */}
      <div style={{ height: 64 }} />
    </div>
  );
};

export default ContractFormPage;
