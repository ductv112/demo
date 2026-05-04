import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Button, Space, Tabs, Form, Input,
  Select, DatePicker, Alert, Tag, Divider, Switch,
} from 'antd';
import {
  ArrowLeftOutlined, ShoppingCartOutlined, FileTextOutlined,
  AppstoreOutlined, AuditOutlined, PlusOutlined, DeleteOutlined,
  SaveOutlined, SendOutlined, FireOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_COLORS = ['#1B3A5C', '#0277bd', '#2e7d32'];

const StepBadge: React.FC<{ step: number; active?: boolean }> = ({ step, active }) => {
  const baseColor = STEP_COLORS[step - 1] ?? '#888';
  const bg = active ? baseColor : `${baseColor}22`;
  const textColor = active ? '#fff' : baseColor;
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: bg,
      border: `1.5px solid ${baseColor}`, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: textColor, flexShrink: 0,
    }}>
      {step}
    </div>
  );
};

const tabLabel = (step: number, label: string) => (
  <Space size={6}><StepBadge step={step} /><span>{label}</span></Space>
);

const availableOrders = overhaulOrders.filter(o =>
  ['approved', 'in_progress'].includes(o.status)
);

const unitOptions = [
  { value: 'cái', label: 'cái' },
  { value: 'bộ', label: 'bộ' },
  { value: 'cụm', label: 'cụm' },
  { value: 'mét', label: 'mét' },
  { value: 'lít', label: 'lít' },
  { value: 'kg', label: 'kg' },
  { value: 'gói', label: 'gói' },
  { value: 'hộp', label: 'hộp' },
  { value: 'cuộn', label: 'cuộn' },
];

const categoryOptions = [
  { value: 'spare_part', label: 'Linh kiện thay thế' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
  { value: 'chemical', label: 'Hóa chất / Dầu mỡ' },
  { value: 'tool', label: 'Dụng cụ' },
];

const CreateMaterialRequest: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const selectedOrder = overhaulOrders.find(o => o.id === selectedOrderId);

  const goNext = () => setActiveTab(String(Math.min(Number(activeTab) + 1, 3)));
  const goPrev = () => setActiveTab(String(Math.max(Number(activeTab) - 1, 1)));

  const navButtons = (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
      <Button onClick={goPrev} disabled={activeTab === '1'} style={{ borderRadius: 8 }}>Quay lại</Button>
      <Button type="primary" onClick={goNext} disabled={activeTab === '3'}
        style={{ background: STEP_COLORS[Number(activeTab) - 1], borderColor: STEP_COLORS[Number(activeTab) - 1], borderRadius: 8 }}>
        Tiếp theo
      </Button>
    </div>
  );

  // ─── Tab 1: Thông tin phiếu ──────────────────────────────────
  const renderThongTin = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" showIcon message="Bước 1: Thông tin phiếu yêu cầu"
        description="Chọn lệnh đại tu cần yêu cầu vật tư, điền thông tin cơ bản và mức độ ưu tiên."
        style={{ borderRadius: 10 }} />

      <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
        <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Lệnh đại tu liên kết</Text>
        <Form.Item name="orderId" style={{ marginTop: 12, marginBottom: 0 }}
          rules={[{ required: true, message: 'Vui lòng chọn lệnh đại tu' }]}>
          <Select
            placeholder="Chọn lệnh đại tu cần cấp vật tư..."
            style={{ width: '100%' }}
            onChange={(val: string) => setSelectedOrderId(val)}
            options={availableOrders.map(o => ({
              value: o.id,
              label: `${o.code} — ${o.equipmentName}`,
            }))}
          />
        </Form.Item>
        {selectedOrder && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11 }}>Thiết bị</Text>
                <div><Text strong style={{ fontSize: 13 }}>{selectedOrder.equipmentName}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11 }}>Trung tâm</Text>
                <div><Text style={{ fontSize: 13 }}>{selectedOrder.workshopName}</Text></div>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      <Form.Item name="requestedBy" label="Người lập phiếu"
        rules={[{ required: true, message: 'Vui lòng nhập người lập phiếu' }]}
        style={{ marginBottom: 0 }}>
        <Input placeholder="Họ tên + chức danh người lập phiếu" style={{ borderRadius: 8 }} />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="requestDate" label="Ngày lập phiếu"
            rules={[{ required: true, message: 'Chọn ngày lập' }]} style={{ marginBottom: 0 }}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 8 }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="requiredDate" label="Ngày cần có vật tư"
            rules={[{ required: true, message: 'Chọn ngày cần có' }]} style={{ marginBottom: 0 }}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 8 }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="priority" label="Mức ưu tiên"
        rules={[{ required: true, message: 'Chọn mức ưu tiên' }]}
        style={{ marginBottom: 0 }}>
        <Select style={{ width: 220, borderRadius: 8 }} options={[
          { value: 'normal', label: 'Bình thường' },
          { value: 'urgent', label: (<Space><ExclamationCircleOutlined style={{ color: '#d97706' }} /> Khẩn</Space>) },
          { value: 'critical', label: (<Space><FireOutlined style={{ color: '#ff4d4f' }} /> Ưu tiên cao</Space>) },
        ]} />
      </Form.Item>

      <Form.Item name="notes" label="Ghi chú" style={{ marginBottom: 0 }}>
        <TextArea rows={3} placeholder="Ghi chú thêm về yêu cầu, tình huống đặc biệt..." style={{ borderRadius: 8 }} />
      </Form.Item>

      {navButtons}
    </div>
  );

  // ─── Tab 2: Danh sách vật tư ─────────────────────────────────
  const renderDanhSach = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" showIcon message="Bước 2: Khai báo danh sách vật tư"
        description="Nhập từng mặt hàng cần yêu cầu. Đánh dấu 'Bắt buộc thay' cho các vật tư phải thay theo tiêu chuẩn kỹ thuật."
        style={{ borderRadius: 10 }} />

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Card key={key} size="small" style={{ borderRadius: 10, borderLeft: `3px solid ${STEP_COLORS[1]}` }}
                title={
                  <Space>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: STEP_COLORS[1], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                      {index + 1}
                    </div>
                    <Text strong style={{ fontSize: 13 }}>Mặt hàng #{index + 1}</Text>
                  </Space>
                }
                extra={<Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)}>Xóa</Button>}
              >
                <Row gutter={[8, 8]}>
                  <Col span={8}>
                    <Form.Item {...restField} name={[name, 'materialCode']} label="Mã vật tư" style={{ marginBottom: 0 }}>
                      <Input placeholder="VD: MAG-P37-B" style={{ borderRadius: 6, fontFamily: 'monospace' }} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item {...restField} name={[name, 'materialName']} label="Tên vật tư / linh kiện"
                      rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                      <Input placeholder="Tên đầy đủ của vật tư hoặc linh kiện" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item {...restField} name={[name, 'category']} label="Loại" style={{ marginBottom: 0 }}>
                      <Select placeholder="Chọn loại" options={categoryOptions} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'requestedQty']} label="Số lượng"
                      rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                      <Input type="number" min={1} placeholder="SL" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'unit']} label="Đơn vị tính" style={{ marginBottom: 0 }}>
                      <Select placeholder="ĐVT" options={unitOptions} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item {...restField} name={[name, 'unitPrice']} label="Đơn giá (tr)" style={{ marginBottom: 0 }}>
                      <Input type="number" min={0} step={0.1} placeholder="0.0" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item {...restField} name={[name, 'reason']} label="Lý do yêu cầu"
                      rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                      <Input placeholder="Mô tả lý do cần vật tư này (hư hỏng, bắt buộc thay, nâng cấp...)" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item {...restField} name={[name, 'linkedComponentName']} label="Cấu phần liên kết" style={{ marginBottom: 0 }}>
                      <Input placeholder="Tên cấu phần cần vật tư này (nếu có)" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={8} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                    <Form.Item {...restField} name={[name, 'isMandatoryReplace']} valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Space>
                        <Switch size="small" />
                        <Text style={{ fontSize: 12 }}>Bắt buộc thay</Text>
                        <Tag color="error" style={{ fontSize: 10 }}>BẮT BUỘC</Tag>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}

            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}
              style={{ width: '100%', borderRadius: 8, borderColor: STEP_COLORS[1], color: STEP_COLORS[1], height: 44 }}>
              Thêm mặt hàng
            </Button>
          </>
        )}
      </Form.List>

      {navButtons}
    </div>
  );

  // ─── Tab 3: Xác nhận ─────────────────────────────────────────
  const renderXacNhan = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="success" showIcon message="Bước 3: Xác nhận và gửi phiếu"
        description="Kiểm tra lại thông tin trước khi gửi phê duyệt. Sau khi gửi, phiếu sẽ chuyển sang trạng thái 'Chờ duyệt'."
        style={{ borderRadius: 10 }} />

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const orderId = getFieldValue('orderId');
          const order = overhaulOrders.find(o => o.id === orderId);
          const items = getFieldValue('items') || [];
          const totalQty = items.reduce((s: number, i: { requestedQty?: string | number }) => s + Number(i?.requestedQty || 0), 0);
          const totalCost = items.reduce((s: number, i: { requestedQty?: string | number; unitPrice?: string | number }) =>
            s + (Number(i?.requestedQty || 0) * Number(i?.unitPrice || 0)), 0);
          const mandatoryItems = items.filter((i: { isMandatoryReplace?: boolean }) => i?.isMandatoryReplace);

          return (
            <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Text strong style={{ fontSize: 13, color: STEP_COLORS[2] }}>Tóm tắt phiếu yêu cầu</Text>
              <Divider style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Lệnh đại tu', value: order ? `${order.code} — ${order.equipmentName}` : '—' },
                  { label: 'Ngày lập phiếu', value: getFieldValue('requestDate')?.format('DD/MM/YYYY') || '—' },
                  { label: 'Ngày cần có', value: getFieldValue('requiredDate')?.format('DD/MM/YYYY') || '—' },
                  { label: 'Số mặt hàng', value: `${items.length} mặt hàng (${totalQty} đơn vị)` },
                  { label: 'Bắt buộc thay', value: `${mandatoryItems.length} mặt hàng` },
                  { label: 'Chi phí ước tính', value: totalCost > 0 ? `${totalCost.toFixed(1)} tr` : 'Chưa có đơn giá' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                    <Text strong style={{ fontSize: 12 }}>{item.value}</Text>
                  </div>
                ))}
              </div>
            </Card>
          );
        }}
      </Form.Item>

      <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Space>
          <SendOutlined style={{ color: '#2e7d32', fontSize: 16 }} />
          <div>
            <Text strong style={{ color: '#2e7d32', fontSize: 13 }}>Gửi phê duyệt ngay</Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: '#555' }}>
                Sau khi nhấn "Gửi phê duyệt", phiếu sẽ được chuyển đến Phòng Kỹ thuật để xem xét.
                Bạn có thể lưu nháp trước để chỉnh sửa thêm.
              </Text>
            </div>
          </div>
        </Space>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={goPrev} style={{ borderRadius: 8 }}>Quay lại chỉnh sửa</Button>
      </div>
    </div>
  );

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/material-requests')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', float: 'left', marginRight: 12 }}>
                    <ShoppingCartOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                  </div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Lập phiếu yêu cầu vật tư</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Khai báo danh sách vật tư, linh kiện cần cấp phát cho đại tu</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left: Tabs */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12, padding: 0 }} bodyStyle={{ padding: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="order-detail-tabs"
              tabBarGutter={0}
              indicator={{ size: (origin) => origin - 16 }}
              items={[
                { key: '1', label: tabLabel(1, 'Thông tin phiếu'), children: <div style={{ padding: '20px 24px' }}>{renderThongTin()}</div> },
                { key: '2', label: tabLabel(2, 'Danh sách vật tư'), children: <div style={{ padding: '20px 24px' }}>{renderDanhSach()}</div> },
                { key: '3', label: tabLabel(3, 'Xác nhận'), children: <div style={{ padding: '20px 24px' }}>{renderXacNhan()}</div> },
              ]}
            />
          </Card>
        </Col>

        {/* Right: Sidebar */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Step navigator */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Các bước</Text>}
            >
              {[
                { key: '1', label: 'Thông tin phiếu', icon: <FileTextOutlined /> },
                { key: '2', label: 'Danh sách vật tư', icon: <AppstoreOutlined /> },
                { key: '3', label: 'Xác nhận & Gửi', icon: <AuditOutlined /> },
              ].map((s) => {
                const isActive = s.key === activeTab;
                const isPast = Number(s.key) < Number(activeTab);
                const color = STEP_COLORS[Number(s.key) - 1];
                return (
                  <div key={s.key} onClick={() => setActiveTab(s.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                    background: isActive ? `${color}15` : 'transparent',
                    border: isActive ? `1px solid ${color}40` : '1px solid transparent',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: isActive ? color : isPast ? `${color}33` : '#f0f0f0',
                      border: `1.5px solid ${isPast || isActive ? color : '#ddd'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: isActive ? '#fff' : isPast ? color : '#aaa',
                    }}>{Number(s.key)}</div>
                    <Text style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? color : isPast ? '#333' : '#999' }}>
                      {s.label}
                    </Text>
                  </div>
                );
              })}
            </Card>

            {/* Order context */}
            {selectedOrder && (
              <Card size="small" style={{ borderRadius: 12 }}
                title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Lệnh đại tu đã chọn</Text>}
              >
                {[
                  { label: 'Mã lệnh', value: selectedOrder.code },
                  { label: 'Thiết bị', value: selectedOrder.equipmentName },
                  { label: 'Trung tâm', value: selectedOrder.workshopName },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, textAlign: 'right' }}>{item.value}</Text>
                  </div>
                ))}
                {selectedOrder.mandatoryReplacements && selectedOrder.mandatoryReplacements.length > 0 && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <Text strong style={{ fontSize: 11, color: '#c62828' }}>Vật tư bắt buộc thay (từ kế hoạch)</Text>
                    <div style={{ marginTop: 6 }}>
                      {selectedOrder.mandatoryReplacements.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#666', marginBottom: 3 }}>• {item}</div>
                      ))}
                      {selectedOrder.mandatoryReplacements.length > 3 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>+{selectedOrder.mandatoryReplacements.length - 3} mục khác</Text>
                      )}
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Note */}
            <Card size="small" style={{ borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <Text strong style={{ fontSize: 12, color: '#92400e' }}>Lưu ý</Text>
              <div style={{ marginTop: 6, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                Phiếu yêu cầu vật tư cần được duyệt bởi Trưởng phòng Kỹ thuật trước khi kho tiến hành cấp phát. Điền đầy đủ lý do yêu cầu để tăng tốc độ phê duyệt.
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Bottom action bar */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 10,
        background: '#fff', borderTop: '1px solid #e8e8e8',
        padding: '12px 0', marginTop: 16,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
      }}>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={() => navigate('/material-requests')} style={{ borderRadius: 8 }}>Hủy</Button>
              <Button icon={<SaveOutlined />} style={{ borderRadius: 8, borderColor: colors.navy, color: colors.navy }}>
                Lưu nháp
              </Button>
              <Button type="primary" icon={<SendOutlined />}
                style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8 }}>
                Gửi phê duyệt
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default CreateMaterialRequest;
