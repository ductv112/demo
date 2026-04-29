import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Row, Col, Empty,
  Form, Input, Select, DatePicker, message,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, SaveOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { productStructures } from '../../data/productStructures';
import { ecrStatusConfig, ecrTypeConfig } from '../../utils/format';
import type { EngineeringChangeRequest } from '../../types';

const { Text } = Typography;

// --- Inline mock data (same as list/detail) ---
const ecrList: EngineeringChangeRequest[] = [
  {
    id: 'ECR-001', code: 'YCTD-2026-001',
    title: 'Thay bo mạch xử lý trung tần Alpha-18 sang thế hệ mới',
    type: 'design_change',
    description: 'Thay thế bo mạch xử lý trung tần FPGA Xilinx (BM-XL) bằng bo mạch mới BM-XL-V2 tiêu thụ điện thấp hơn, giảm nhiệt độ vận hành. Tạo BOM version V2.4 kế thừa từ V2.3.',
    reason: 'Bo mạch BM-XL không còn nguồn cung ổn định. Đồng thời hệ thống Alpha-18 gặp lỗi quá nhiệt tại module xử lý khi vận hành liên tục trên 8 giờ.',
    status: 'approved',
    affectedProducts: ['Module thu phát Alpha-18 (BOM-001)'],
    affectedOrders: 2, affectedInventory: 4,
    requestedBy: 'Trần Văn Đức', requestedAt: '2026-03-01',
    approvedBy: 'Phạm Quốc Hưng', approvedAt: '2026-03-15',
    effectiveDate: '2026-07-01', newVersion: 'V2.4', previousVersion: 'V2.3',
  },
  {
    id: 'ECR-002', code: 'YCTD-2026-002',
    title: 'Thay tụ điện công suất Module nguồn AC/DC Alpha-18',
    type: 'material_change',
    description: 'Thay thế tụ điện công suất 470uF/400V Nichicon (TD-CS) bằng Rubycon YXF series do Nichicon ngừng sản xuất dòng này.',
    reason: 'Nhà cung cấp Nichicon thông báo ngừng cung cấp dòng UHE. Rubycon YXF có thông số tương đương, đã test tương thích.',
    status: 'implementing',
    affectedProducts: ['Module nguồn AC/DC Alpha-18 (BOM-004)'],
    affectedOrders: 1, affectedInventory: 6,
    requestedBy: 'Lê Minh Quân', requestedAt: '2026-02-10',
    approvedBy: 'Trần Văn Đức', approvedAt: '2026-02-20',
    effectiveDate: '2026-03-01', newVersion: 'V2.2', previousVersion: 'V2.1',
  },
  {
    id: 'ECR-003', code: 'YCTD-2026-003',
    title: 'Thay đổi quy trình hàn SMT bo mạch xử lý 36D6',
    type: 'process_change',
    description: 'Chuyển từ hàn reflow profile đơn sang profile kép cho PCB 6 lớp. Cập nhật routing RT-002 bước 2 (Hàn SMT & gắn IC).',
    reason: 'Tỉ lệ lỗi hàn IC DSP TMS320C6748 đạt 3%, vượt ngưỡng 1.5%. Profile kép giảm stress nhiệt trên IC.',
    status: 'evaluating',
    affectedProducts: ['Module xử lý tín hiệu 36D6 (BOM-003)'],
    affectedOrders: 2, affectedInventory: 0,
    requestedBy: 'Lê Minh Quân', requestedAt: '2026-03-20',
  },
  {
    id: 'ECR-004', code: 'YCTD-2026-004',
    title: 'Thay đổi thiết kế đầu nối RF Module thu phát Beta-37',
    type: 'design_change',
    description: 'Chuyển từ đầu nối Type-N sang SMA cho RF-P37 để giảm suy hao tại tần số 2.7GHz. Cập nhật BOM-006.',
    reason: 'Đo kiểm phát hiện suy hao RF tại đầu nối Type-N cao hơn dự kiến 0.3dB ở 2.7GHz. SMA cho suy hao thấp hơn.',
    status: 'draft',
    affectedProducts: ['Module thu phát Beta-37 (BOM-006)'],
    affectedOrders: 1, affectedInventory: 12,
    requestedBy: 'Nguyễn Hữu Long', requestedAt: '2026-04-01',
  },
  {
    id: 'ECR-005', code: 'YCTD-2026-005',
    title: 'Bổ sung cầu chì bảo vệ cho Module nguồn AC/DC Alpha-18',
    type: 'material_change',
    description: 'Thêm 2 cầu chì bảo vệ đầu vào AC cho BOM-004. Cập nhật định mức từ 6 lên 8 cầu chì.',
    reason: 'Phát hiện 1 bộ nguồn bị cháy do quá tải đầu vào không có bảo vệ. Cần thêm cầu chì ở đầu vào AC.',
    status: 'completed',
    affectedProducts: ['Module nguồn AC/DC Alpha-18 (BOM-004)'],
    affectedOrders: 0, affectedInventory: 30,
    requestedBy: 'Lê Minh Quân', requestedAt: '2025-12-15',
    approvedBy: 'Trần Văn Đức', approvedAt: '2025-12-20',
    effectiveDate: '2026-01-01', newVersion: 'V2.1', previousVersion: 'V2.0',
  },
];

const EngineeringChangeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const existingRecord = isEdit ? ecrList.find((e) => e.id === id) : null;

  const [form] = Form.useForm();

  // Product options from productStructures
  const productOptions = productStructures.map((ps) => ({
    value: `${ps.name} (${ps.id})`,
    label: `${ps.name} (${ps.code})`,
  }));

  // Initialize form values
  React.useEffect(() => {
    if (existingRecord) {
      form.setFieldsValue({
        ...existingRecord,
        effectiveDate: existingRecord.effectiveDate ? dayjs(existingRecord.effectiveDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'draft' });
    }
  }, [existingRecord, form]);

  // Not found
  if (isEdit && !existingRecord) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy yêu cầu thay đổi kỹ thuật" />
        <Button type="primary" onClick={() => navigate('/engineering-changes')}
          style={{ marginTop: 16, background: '#1B3A5C' }}>Quay lại danh sách</Button>
      </div>
    );
  }

  // --- Save ---
  const handleSave = () => {
    form.validateFields().then((values) => {
      const effectiveDate = values.effectiveDate ? dayjs(values.effectiveDate).format('YYYY-MM-DD') : undefined;
      console.log('Saving ECR:', { ...values, effectiveDate });
      message.success(isEdit ? 'Cập nhật yêu cầu thay đổi thành công' : 'Tạo yêu cầu thay đổi kỹ thuật thành công');
      navigate('/engineering-changes');
    });
  };

  return (
    <div>
      {/* --- Header Banner --- */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(212,168,67,0.06)',
          }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(isEdit ? `/engineering-changes/${id}` : '/engineering-changes')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: isEdit ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isEdit
                      ? <EditOutlined style={{ color: '#f0d890', fontSize: 18 }} />
                      : <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {isEdit ? 'Chỉnh sửa yêu cầu thay đổi' : 'Tạo yêu cầu thay đổi kỹ thuật'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {isEdit ? `${existingRecord?.code} — ${existingRecord?.title}` : 'Điền thông tin yêu cầu thay đổi kỹ thuật mới'}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col />
          </Row>
        </div>
      </Card>

      {/* --- Form Section --- */}
      <Form form={form} layout="vertical" requiredMark="optional">
        <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '20px' } }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={8}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SwapOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ color: '#1B3A5C', fontSize: 14 }}>Thông tin yêu cầu thay đổi</Text>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label="Mã yêu cầu" rules={[{ required: true, message: 'Vui lòng nhập mã yêu cầu' }]}>
                <Input placeholder="VD: YCTD-2026-006" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                <Input placeholder="VD: Thay đổi thiết kế bo mạch xử lý Alpha-18" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Loại thay đổi" rules={[{ required: true, message: 'Vui lòng chọn loại thay đổi' }]}>
                <Select placeholder="Chọn loại thay đổi"
                  options={Object.entries(ecrTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="affectedProducts" label="Sản phẩm bị ảnh hưởng" rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}>
                <Select mode="multiple" placeholder="Chọn sản phẩm bị ảnh hưởng"
                  options={productOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="requestedBy" label="Người yêu cầu" rules={[{ required: true, message: 'Nhập người yêu cầu' }]}>
                <Input placeholder="VD: Trần Văn Đức" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sourceType" label="Nguồn yêu cầu" rules={[{ required: true, message: 'Chọn nguồn' }]}>
                <Select placeholder="Chọn nguồn yêu cầu" options={[
                  { value: 'technical', label: 'Phòng kỹ thuật' },
                  { value: 'production', label: 'Sản xuất' },
                  { value: 'repair', label: 'Sửa chữa' },
                  { value: 'overhaul', label: 'Đại tu' },
                  { value: 'operation', label: 'Vận hành thực tế' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={Object.entries(ecrStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="newVersion" label="Version mới">
                <Input placeholder="VD: V2.4" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="previousVersion" label="Version cũ">
                <Input placeholder="VD: V2.3" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="effectiveDate" label="Ngày hiệu lực">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết nội dung thay đổi kỹ thuật" />
          </Form.Item>

          <Form.Item name="reason" label="Lý do thay đổi" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea rows={3} placeholder="Lý do cần thực hiện thay đổi kỹ thuật" />
          </Form.Item>

          <Form.Item name="applyRule" label="Nguyên tắc áp dụng" rules={[{ required: true, message: 'Chọn nguyên tắc' }]}>
            <Select placeholder="Chọn nguyên tắc áp dụng" options={[
              { value: 'immediate', label: 'Áp dụng ngay cho tất cả lệnh SX (kể cả đang thực hiện)' },
              { value: 'new_only', label: 'Chỉ áp dụng cho lệnh SX mới, lệnh đang chạy giữ version cũ' },
              { value: 'phased', label: 'Áp dụng theo giai đoạn (từ ngày hiệu lực)' },
            ]} />
          </Form.Item>
        </Card>
      </Form>

      {/* --- Bottom Action Bar --- */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: '#fff', padding: '16px 20px', marginTop: 16,
        borderRadius: 14, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      }}>
        <Space>
          <Button onClick={() => navigate(isEdit ? `/engineering-changes/${id}` : '/engineering-changes')}
            style={{ borderRadius: 8, height: 40, padding: '0 24px' }}
          >
            Hủy
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}
          >
            {isEdit ? 'Cập nhật yêu cầu' : 'Lưu yêu cầu thay đổi'}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default EngineeringChangeFormPage;
