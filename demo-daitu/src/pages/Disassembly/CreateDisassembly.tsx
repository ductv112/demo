import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Button, Space, Tabs, Form, Input, Select, DatePicker,
  Divider, Alert, Tag,
} from 'antd';
import {
  ArrowLeftOutlined, ToolOutlined, FileTextOutlined, TagsOutlined,
  AppstoreOutlined, AuditOutlined, SafetyCertificateOutlined,
  PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_COLORS = ['#1B3A5C', '#2e7d32', '#e65100', '#6a1b9a', '#0277bd', '#c62828'];

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
  <Space size={6}>
    <StepBadge step={step} />
    <span>{label}</span>
  </Space>
);

// Approved or in_progress orders that don't yet have a disassembly
const availableOrders = overhaulOrders.filter(o =>
  ['approved', 'in_progress'].includes(o.status)
);

const CreateDisassembly: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const selectedOrder = overhaulOrders.find(o => o.id === selectedOrderId);

  const goNext = () => {
    const next = String(Math.min(Number(activeTab) + 1, 6));
    setActiveTab(next);
  };
  const goPrev = () => {
    const prev = String(Math.max(Number(activeTab) - 1, 1));
    setActiveTab(prev);
  };

  const navButtons = (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
      <Button onClick={goPrev} disabled={activeTab === '1'} style={{ borderRadius: 8 }}>
        Bước trước
      </Button>
      <Button type="primary" onClick={goNext} disabled={activeTab === '6'}
        style={{ background: STEP_COLORS[Number(activeTab) - 1], borderColor: STEP_COLORS[Number(activeTab) - 1], borderRadius: 8 }}
      >
        Bước tiếp theo
      </Button>
    </div>
  );

  // ─── Tab 1: Nhận lệnh & Chuẩn bị ────────────────────────────
  const renderChuanBi = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon

        message="Bước 1: Nhận lệnh & Chuẩn bị"
        description="Xác nhận nhận lệnh đại tu, chuẩn bị tài liệu kỹ thuật, dụng cụ và khu vực thi công trước khi tiến hành tháo rã."
        style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
        <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Chọn lệnh đại tu</Text>
        <Form.Item name="orderId" style={{ marginTop: 12, marginBottom: 0 }}
          rules={[{ required: true, message: 'Vui lòng chọn lệnh đại tu' }]}
        >
          <Select
            placeholder="Chọn lệnh đại tu cần tháo rã..."
            style={{ width: '100%' }}
            onChange={(val: string) => setSelectedOrderId(val)}
            options={availableOrders.map(o => ({
              value: o.id,
              label: `${o.code} — ${o.equipmentName} (${o.workshopName})`,
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
              <Col span={12} style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Phạm vi đại tu</Text>
                <div>
                  <Tag color={selectedOrder.overhaulScope === 'full' ? 'blue' : 'cyan'}>
                    {selectedOrder.overhaulScope === 'full' ? 'Toàn bộ' : 'Một phần'}
                  </Tag>
                </div>
              </Col>
              <Col span={12} style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Nhóm thực hiện</Text>
                <div><Text style={{ fontSize: 12 }}>{selectedOrder.teamSize ? `${selectedOrder.teamSize} KTV` : '—'}</Text></div>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      <Form.Item name="receivedOrderDate" label="Ngày nhận lệnh" style={{ marginBottom: 0 }}>
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 8 }} placeholder="Chọn ngày nhận lệnh" />
      </Form.Item>

      <Form.Item name="performedBy" label="Đội tháo rã phụ trách"
        rules={[{ required: true, message: 'Vui lòng nhập đội phụ trách' }]}
        style={{ marginBottom: 0 }}
      >
        <Input placeholder="VD: Tổ tháo rã PX1 — KTV Trần Văn Hùng (đội trưởng), KTV Lê Đình Khoa, KTV Phạm Văn Tú" style={{ borderRadius: 8 }} />
      </Form.Item>

      <Card size="small" style={{ borderRadius: 10 }}
        title={<Space><FileTextOutlined style={{ color: STEP_COLORS[0] }} /><Text strong style={{ fontSize: 13 }}>Tài liệu kỹ thuật chuẩn bị</Text></Space>}
      >
        <Form.List name="technicalDocuments">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Form.Item {...restField} name={name} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="VD: Tài liệu kỹ thuật gốc P-37, Hướng dẫn tháo rã Rev.2..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8 }}>
                Thêm tài liệu
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      <Card size="small" style={{ borderRadius: 10 }}
        title={<Space><ToolOutlined style={{ color: STEP_COLORS[0] }} /><Text strong style={{ fontSize: 13 }}>Dụng cụ chuyên dụng</Text></Space>}
      >
        <Form.List name="toolsRequired">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Form.Item {...restField} name={name} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="VD: Cờ lê mô men lực, Thiết bị đo điện trở cách điện Megger..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8 }}>
                Thêm dụng cụ
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      <Form.Item name="workAreaNotes" label="Yêu cầu khu vực thi công" style={{ marginBottom: 0 }}>
        <TextArea rows={3} placeholder="Ghi chú về môi trường làm việc, yêu cầu ESD, an toàn điện, chiều cao..." style={{ borderRadius: 8 }} />
      </Form.Item>

      {navButtons}
    </div>
  );

  // ─── Tab 2: Tháo rã ─────────────────────────────────────────
  const renderThaora = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon

        message="Bước 2: Thực hiện tháo rã"
        description="Tiến hành tháo rã theo trình tự đã lập. Ghi lại phương pháp và lưu ý kỹ thuật đặc biệt trong quá trình tháo."
        style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Form.Item name="startDate" label="Ngày bắt đầu tháo rã"
        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        style={{ marginBottom: 0 }}
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 8 }} placeholder="Ngày bắt đầu tháo rã" />
      </Form.Item>

      <Form.Item name="totalComponents" label="Tổng số cấu phần dự kiến"
        rules={[{ required: true, message: 'Vui lòng nhập số cấu phần' }]}
        style={{ marginBottom: 0 }}
      >
        <Input type="number" min={1} placeholder="VD: 42" style={{ borderRadius: 8, width: 180 }} />
      </Form.Item>

      <Form.Item name="disassemblySequence" label="Trình tự tháo rã" style={{ marginBottom: 0 }}>
        <TextArea
          rows={6}
          placeholder="Mô tả trình tự tháo rã theo từng bước:&#10;Bước 1: Ngắt nguồn điện, tiếp đất an toàn&#10;Bước 2: Tháo vỏ bảo vệ...&#10;Bước 3: ..."
          style={{ borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
        />
      </Form.Item>

      <Form.Item name="disassemblyMethodNote" label="Ghi chú phương pháp kỹ thuật" style={{ marginBottom: 0 }}>
        <TextArea
          rows={4}
          placeholder="Lưu ý đặc biệt về phương pháp tháo rã, các chi tiết cần thận trọng, điểm kiểm tra an toàn..."
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      {navButtons}
    </div>
  );

  // ─── Tab 3: Đánh dấu ────────────────────────────────────────
  const renderDanhDau = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon

        message="Bước 3: Đánh dấu nhận dạng"
        description="Gắn nhãn mã hóa, ghi rõ vị trí lắp đặt và chiều lắp cho từng cấu phần. Đảm bảo mỗi chi tiết có thể truy xuất chính xác về vị trí gốc."
        style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Card size="small" style={{ borderRadius: 10 }}
        title={<Space><TagsOutlined style={{ color: STEP_COLORS[2] }} /><Text strong style={{ fontSize: 13 }}>Đăng ký cấu phần</Text></Space>}
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            Nhập thông tin từng cấu phần sau khi đánh dấu
          </Text>
        }
      >
        <Form.List name="componentMarks">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ marginBottom: 16, padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                  <Row gutter={[8, 8]}>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, 'code']} label="Mã cấu phần" style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'Bắt buộc' }]}
                      >
                        <Input placeholder="VD: CP37-PHT-01" style={{ borderRadius: 6, fontSize: 12 }} />
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item {...restField} name={[name, 'name']} label="Tên cấu phần" style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'Bắt buộc' }]}
                      >
                        <Input placeholder="VD: Ống Magnetron phát sóng" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, 'category']} label="Loại" style={{ marginBottom: 0 }}>
                        <Select placeholder="Chọn" style={{ borderRadius: 6 }} options={[
                          { value: 'module', label: 'Mô-đun' },
                          { value: 'part', label: 'Linh kiện' },
                          { value: 'assembly', label: 'Cụm lắp ráp' },
                          { value: 'consumable', label: 'Vật tư' },
                        ]} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, 'systemGroup']} label="Nhóm hệ thống" style={{ marginBottom: 0 }}>
                        <Input placeholder="VD: Hệ thống phát" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, 'position']} label="Vị trí lắp" style={{ marginBottom: 0 }}>
                        <Input placeholder="VD: Rack A1" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'installDirection']} label="Chiều lắp" style={{ marginBottom: 0 }}>
                        <Input placeholder="VD: Thẳng đứng, cực dương hướng lên" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'serialNumber']} label="Số serial" style={{ marginBottom: 0 }}>
                        <Input placeholder="VD: MAG-P37-2019-0047" style={{ borderRadius: 6, fontFamily: 'monospace' }} />
                      </Form.Item>
                    </Col>
                    <Col span={24} style={{ textAlign: 'right' }}>
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)}>
                        Xóa cấu phần này
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8, borderColor: STEP_COLORS[2], color: STEP_COLORS[2] }}>
                Thêm cấu phần
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {navButtons}
    </div>
  );

  // ─── Tab 4: Phân loại ────────────────────────────────────────
  const renderPhanLoai = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon

        message="Bước 4: Phân loại cấu phần"
        description="Phân loại từng cấu phần theo nhóm hệ thống và mức độ ưu tiên kiểm tra. Xác định sơ bộ các cấu phần có dấu hiệu hư hỏng rõ ràng."
        style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Card size="small" style={{ borderRadius: 10 }}
        title={<Space><AppstoreOutlined style={{ color: STEP_COLORS[3] }} /><Text strong style={{ fontSize: 13 }}>Phân nhóm kiểm tra kỹ thuật</Text></Space>}
      >
        <Form.Item name="classificationNotes" label="Ghi chú phân nhóm kiểm tra" style={{ marginBottom: 16 }}>
          <TextArea
            rows={4}
            placeholder="Mô tả cách phân nhóm cấu phần để kiểm tra:&#10;Nhóm 1 - Hệ thống phát: ...&#10;Nhóm 2 - Cơ khí: ...&#10;Nhóm 3 - Điện tử: ..."
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Divider style={{ margin: '8px 0 16px' }} />
        <Text strong style={{ fontSize: 13, color: STEP_COLORS[3] }}>Đánh giá sơ bộ theo nhóm</Text>

        <Form.List name="systemGroupNotes">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, marginTop: 12 }}>
                  <Form.Item {...restField} name={[name, 'group']} style={{ flex: '0 0 180px', marginBottom: 0 }}>
                    <Input placeholder="Nhóm hệ thống" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'note']} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="Nhận xét sơ bộ tình trạng..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8, marginTop: 8 }}>
                Thêm nhóm
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {navButtons}
    </div>
  );

  // ─── Tab 5: Ghi nhận tình trạng ──────────────────────────────
  const renderGhiNhan = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon

        message="Bước 5: Ghi nhận tình trạng chi tiết"
        description="Ghi nhận tình trạng kỹ thuật của từng cấu phần sau khi tháo rã và quan sát kỹ. Đây là cơ sở cho giai đoạn kiểm tra kỹ thuật tiếp theo."
        style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Form.List name="componentConditions">
        {(fields, { add, remove }) => (
          <Card size="small" style={{ borderRadius: 10 }}
            title={<Space><AuditOutlined style={{ color: STEP_COLORS[4] }} /><Text strong style={{ fontSize: 13 }}>Ghi nhận tình trạng cấu phần</Text></Space>}
          >
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} style={{ marginBottom: 12, padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                <Row gutter={[8, 8]}>
                  <Col span={8}>
                    <Form.Item {...restField} name={[name, 'code']} label="Mã cấu phần" style={{ marginBottom: 0 }}>
                      <Input placeholder="Mã cấu phần" style={{ borderRadius: 6, fontSize: 12 }} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item {...restField} name={[name, 'condition']} label="Tình trạng ghi nhận" style={{ marginBottom: 0 }}>
                      <Input placeholder="Mô tả tình trạng quan sát được..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item {...restField} name={[name, 'status']} label="Phân loại sơ bộ" style={{ marginBottom: 0 }}>
                      <Select placeholder="Chọn trạng thái" style={{ borderRadius: 6 }} options={[
                        { value: 'serviceable', label: 'Đạt - Giữ lại' },
                        { value: 'pending_inspection', label: 'Chờ kiểm tra' },
                        { value: 'repairable', label: 'Cần phục hồi' },
                        { value: 'beyond_repair', label: 'Thay mới' },
                        { value: 'upgrade_required', label: 'Cần nâng cấp' },
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)}>Xóa</Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8 }}>
              Thêm ghi nhận
            </Button>
          </Card>
        )}
      </Form.List>

      <Form.Item name="notes" label="Ghi chú tổng thể" style={{ marginBottom: 0 }}>
        <TextArea rows={3} placeholder="Ghi chú chung về quá trình tháo rã và tình trạng tổng thể của thiết bị..." style={{ borderRadius: 8 }} />
      </Form.Item>

      {navButtons}
    </div>
  );

  // ─── Tab 6: Chuẩn bị kiểm tra ───────────────────────────────
  const renderChuanBiKT = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon

        message="Bước 6: Chuẩn bị bàn giao kiểm tra"
        description="Hoàn tất hồ sơ tháo rã, ghi ngày sẵn sàng bàn giao và phân nhóm cấu phần cho nhóm kiểm tra kỹ thuật."
        style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Form.Item name="endDate" label="Ngày kết thúc tháo rã" style={{ marginBottom: 0 }}>
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 8 }} placeholder="Ngày hoàn thành tháo rã" />
      </Form.Item>

      <Form.Item name="readyForInspectionDate" label="Ngày sẵn sàng bàn giao kiểm tra" style={{ marginBottom: 0 }}>
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 8 }} placeholder="Ngày bàn giao cho nhóm kiểm tra kỹ thuật" />
      </Form.Item>

      <Form.Item name="inspectionGroupingNotes" label="Ghi chú phân nhóm kiểm tra" style={{ marginBottom: 0 }}>
        <TextArea
          rows={5}
          placeholder="Mô tả phân nhóm kiểm tra kỹ thuật:&#10;Nhóm 1 - Kiểm tra NDT hệ thống phát: giao P.KCS&#10;Nhóm 2 - Kiểm tra kích thước cơ khí: giao PX3&#10;..."
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Space>
          <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          <div>
            <Text strong style={{ color: '#2e7d32', fontSize: 13 }}>Xác nhận hoàn thành</Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: '#555' }}>
                Sau khi lưu, hồ sơ tháo rã sẽ chuyển trạng thái phù hợp và sẵn sàng cho giai đoạn kiểm tra kỹ thuật.
              </Text>
            </div>
          </div>
        </Space>
      </Card>

      {navButtons}
    </div>
  );

  // ─── Sidebar steps ───────────────────────────────────────────
  const sidebarSteps = [
    { key: '1', label: 'Nhận lệnh & Chuẩn bị', icon: <FileTextOutlined /> },
    { key: '2', label: 'Tháo rã', icon: <ToolOutlined /> },
    { key: '3', label: 'Đánh dấu nhận dạng', icon: <TagsOutlined /> },
    { key: '4', label: 'Phân loại cấu phần', icon: <AppstoreOutlined /> },
    { key: '5', label: 'Ghi nhận tình trạng', icon: <AuditOutlined /> },
    { key: '6', label: 'Chuẩn bị bàn giao KT', icon: <SafetyCertificateOutlined /> },
  ];

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      {/* ── Hero Banner ── */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/disassemblies')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}
                >
                  Quay lại
                </Button>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', float: 'left', marginRight: 12 }}>
                    <ToolOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                  </div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tạo hồ sơ tháo rã</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 3 · Nhập thông tin tháo rã và cấu phần</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* ── Main Content ── */}
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
                { key: '1', label: tabLabel(1, 'Chuẩn bị'), children: <div style={{ padding: '20px 24px' }}>{renderChuanBi()}</div> },
                { key: '2', label: tabLabel(2, 'Tháo rã'), children: <div style={{ padding: '20px 24px' }}>{renderThaora()}</div> },
                { key: '3', label: tabLabel(3, 'Đánh dấu'), children: <div style={{ padding: '20px 24px' }}>{renderDanhDau()}</div> },
                { key: '4', label: tabLabel(4, 'Phân loại'), children: <div style={{ padding: '20px 24px' }}>{renderPhanLoai()}</div> },
                { key: '5', label: tabLabel(5, 'Ghi nhận'), children: <div style={{ padding: '20px 24px' }}>{renderGhiNhan()}</div> },
                { key: '6', label: tabLabel(6, 'Bàn giao KT'), children: <div style={{ padding: '20px 24px' }}>{renderChuanBiKT()}</div> },
              ]}
            />
          </Card>
        </Col>

        {/* Right: Sidebar */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Step navigator */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Các bước thực hiện</Text>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sidebarSteps.map((s) => {
                  const isActive = s.key === activeTab;
                  const isPast = Number(s.key) < Number(activeTab);
                  const color = STEP_COLORS[Number(s.key) - 1];
                  return (
                    <div
                      key={s.key}
                      onClick={() => setActiveTab(s.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        background: isActive ? `${color}15` : 'transparent',
                        border: isActive ? `1px solid ${color}40` : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isActive ? color : isPast ? `${color}33` : '#f0f0f0',
                        border: `1.5px solid ${isPast || isActive ? color : '#ddd'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: isActive ? '#fff' : isPast ? color : '#aaa',
                      }}>
                        {Number(s.key)}
                      </div>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? color : isPast ? '#333' : '#999',
                      }}>
                        {s.label}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Order info (when selected) */}
            {selectedOrder && (
              <Card size="small" style={{ borderRadius: 12 }}
                title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Lệnh đại tu đã chọn</Text>}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Mã lệnh', value: selectedOrder.code },
                    { label: 'Thiết bị', value: selectedOrder.equipmentName },
                    { label: 'Trung tâm', value: selectedOrder.workshopName },
                    { label: 'Nhóm thực hiện', value: `${selectedOrder.teamSize || '—'} KTV` },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{item.label}</Text>
                      <Text style={{ fontSize: 12, textAlign: 'right' }}>{item.value}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes */}
            <Card size="small" style={{ borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <Text strong style={{ fontSize: 12, color: '#92400e' }}>Lưu ý</Text>
              <div style={{ marginTop: 6, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                Mỗi cấu phần phải được đánh dấu và ghi nhận trước khi chuyển sang giai đoạn kiểm tra kỹ thuật. Thông tin vị trí lắp và chiều lắp là bắt buộc với các chi tiết cơ khí chuyển động.
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* ── Bottom action bar ── */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 10,
        background: '#fff', borderTop: '1px solid #e8e8e8',
        padding: '12px 0', marginTop: 16,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
      }}>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={() => navigate('/disassemblies')} style={{ borderRadius: 8 }}>Hủy</Button>
              <Button icon={<SaveOutlined />} style={{ borderRadius: 8, borderColor: colors.navy, color: colors.navy }}>
                Lưu nháp
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8 }}
              >
                Tạo hồ sơ
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default CreateDisassembly;
