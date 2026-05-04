import React, { useState } from 'react';
import {
  Form, Input, Select, DatePicker, InputNumber, Radio, Button,
  Card, Row, Col, Typography, Space, Divider, Tag, Alert, App, Tabs,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined,
  SolutionOutlined, AppstoreOutlined, ShoppingCartOutlined,
  TeamOutlined, CalendarOutlined, FileTextOutlined,
  AuditOutlined, WarningOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { overhaulReceptions } from '../../data/overhaulReceptions';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_COLORS = ['#1B3A5C', '#2e7d32', '#e65100', '#6a1b9a', '#0277bd', '#c62828'];

// Màu cho các thanh Gantt (đủ tương phản với nhau)
const GANTT_COLORS = [
  '#1B3A5C', '#2e7d32', '#e65100', '#6a1b9a',
  '#0277bd', '#c62828', '#00838f', '#558b2f',
  '#ad1457', '#4527a0', '#0277bd', '#37474f',
];

const workshopOptions = [
  { value: 'PX1', label: 'TT Alpha – Bảo trì Hệ thống monitoring' },
  { value: 'PX2', label: 'TT Beta – Module sản phẩm' },
  { value: 'PX3', label: 'TT Hạ tầng – Cơ khí phần cứng' },
  { value: 'PX4', label: 'TT DevOps – Điện tử & Mạng' },
];

const workshopNameMap: Record<string, string> = {
  PX1: 'TT Alpha – Bảo trì Hệ thống monitoring',
  PX2: 'TT Beta – Module sản phẩm',
  PX3: 'TT Hạ tầng – Cơ khí phần cứng',
  PX4: 'TT DevOps – Điện tử & Mạng',
};

const receptionOptions = overhaulReceptions
  .filter(r => ['assessed', 'pending_plan'].includes(r.status))
  .map(r => ({ value: r.id, label: `${r.code} — ${r.equipmentName}`, data: r }));

const STEPS = [
  { key: '1', label: 'Phương án', icon: <SolutionOutlined /> },
  { key: '2', label: 'Công đoạn', icon: <AppstoreOutlined /> },
  { key: '3', label: 'Vật tư', icon: <ShoppingCartOutlined /> },
  { key: '4', label: 'Nhân lực', icon: <TeamOutlined /> },
  { key: '5', label: 'Thời gian', icon: <CalendarOutlined /> },
  { key: '6', label: 'Phê duyệt', icon: <FileTextOutlined /> },
];

// ─── Gantt Chart ─────────────────────────────────────────────────────────────

interface GanttStage {
  name?: string;
  assignedTeam?: string;
  plannedDuration?: number;
  description?: string;
}

const GanttChart: React.FC<{
  stages: GanttStage[];
  startDate?: Dayjs | null;
  totalDuration?: number;
}> = ({ stages, startDate, totalDuration }) => {
  const valid = (stages || []).filter(s => s?.name && Number(s?.plannedDuration) > 0);

  if (valid.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', background: '#eff6ff', borderRadius: 10, border: '1px dashed #93c5fd' }}>
        <AppstoreOutlined style={{ fontSize: 28, color: '#ccc', display: 'block', marginBottom: 8 }} />
        <Text style={{ color: '#bbb', fontSize: 13 }}>Thêm công đoạn ở Bước 2 để xem biểu đồ Gantt</Text>
      </div>
    );
  }

  let cumDay = 0;
  const rows = valid.map((s, i) => {
    const startDay = cumDay;
    const dur = Number(s.plannedDuration);
    cumDay += dur;
    return {
      name: s.name!,
      team: s.assignedTeam || '',
      duration: dur,
      startDay,
      startDate: startDate ? startDate.add(startDay, 'day') : null,
      endDate: startDate ? startDate.add(startDay + dur - 1, 'day') : null,
      color: GANTT_COLORS[i % GANTT_COLORS.length],
    };
  });

  const total = Math.max(totalDuration || 0, cumDay) || 1;

  // Ticks cột thời gian
  const interval = total <= 20 ? 2 : total <= 40 ? 5 : total <= 90 ? 7 : total <= 180 ? 14 : 30;
  const ticks: number[] = [];
  for (let d = 0; d <= total; d += interval) ticks.push(d);
  if (ticks[ticks.length - 1] < total) ticks.push(total);

  const LEFT_COL = 190;
  const RIGHT_COL = 90;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 580 }}>

        {/* ── Tiêu đề timeline ─────────────────────────────── */}
        <div style={{ display: 'flex', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #eee' }}>
          <div style={{ width: LEFT_COL, flexShrink: 0 }}>
            <Text style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Công đoạn</Text>
          </div>
          <div style={{ flex: 1, position: 'relative', height: 20 }}>
            {ticks.map(t => (
              <div key={t} style={{
                position: 'absolute',
                left: `${(t / total) * 100}%`,
                top: 0,
                transform: 'translateX(-50%)',
                fontSize: 11,
                color: '#bbb',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}>
                {startDate ? startDate.add(t, 'day').format('DD/MM') : `Ng.${t}`}
              </div>
            ))}
          </div>
          <div style={{ width: RIGHT_COL, flexShrink: 0 }} />
        </div>

        {/* ── Các hàng công đoạn ───────────────────────────── */}
        {rows.map((row, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {/* Tên công đoạn */}
            <div style={{ width: LEFT_COL, flexShrink: 0, paddingRight: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: `${row.color}20`, border: `1.5px solid ${row.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: row.color,
                }}>
                  {idx + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 148 }}>
                    {row.name}
                  </Text>
                  {row.team && (
                    <Text style={{ fontSize: 11, color: '#aaa', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 148 }}>
                      {row.team}
                    </Text>
                  )}
                </div>
              </div>
            </div>

            {/* Vùng thanh Gantt */}
            <div style={{ flex: 1, position: 'relative', height: 38, background: '#dbeafe', borderRadius: 6 }}>
              {/* Grid dọc */}
              {ticks.map(t => (
                <div key={t} style={{
                  position: 'absolute',
                  left: `${(t / total) * 100}%`,
                  top: 0, bottom: 0,
                  borderLeft: t === 0 ? 'none' : '1px dashed #e4e4e4',
                  pointerEvents: 'none',
                }} />
              ))}
              {/* Thanh tiến độ */}
              <div style={{
                position: 'absolute',
                left: `${(row.startDay / total) * 100}%`,
                width: `${Math.max((row.duration / total) * 100, 0.5)}%`,
                top: 5, bottom: 5,
                background: `linear-gradient(135deg, ${row.color} 0%, ${row.color}bb 100%)`,
                borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: `0 2px 8px ${row.color}35`,
              }}>
                <Text style={{ fontSize: 11, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', padding: '0 8px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  {row.duration}ng
                </Text>
              </div>
            </div>

            {/* Ngày bắt đầu – kết thúc */}
            <div style={{ width: RIGHT_COL, textAlign: 'right', paddingLeft: 10, flexShrink: 0 }}>
              {row.startDate ? (
                <div>
                  <Text style={{ fontSize: 11, color: '#666', display: 'block', lineHeight: 1.4 }}>
                    {row.startDate.format('DD/MM/YYYY')}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#999', display: 'block', lineHeight: 1.4 }}>
                    → {row.endDate?.format('DD/MM/YYYY')}
                  </Text>
                </div>
              ) : (
                <Text style={{ fontSize: 11, color: '#aaa' }}>
                  Ng.{row.startDay + 1}–{row.startDay + row.duration}
                </Text>
              )}
            </div>
          </div>
        ))}

        {/* ── Thanh tổng ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '2px solid #f0f0f0' }}>
          <div style={{ width: LEFT_COL, flexShrink: 0, paddingRight: 14 }}>
            <Text strong style={{ fontSize: 12, color: colors.navy }}>Tổng thời gian</Text>
          </div>
          <div style={{ flex: 1, height: 10, background: '#e8eef5', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min((cumDay / total) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${colors.navy} 0%, #2d5a8e 100%)`,
              borderRadius: 5,
            }} />
          </div>
          <div style={{ width: RIGHT_COL, textAlign: 'right', paddingLeft: 10, flexShrink: 0 }}>
            <Text strong style={{ fontSize: 12, color: colors.navy }}>
              {cumDay} ngày
              {totalDuration && cumDay !== totalDuration && (
                <Text style={{ fontSize: 11, color: cumDay > totalDuration ? '#ff4d4f' : '#faad14', display: 'block' }}>
                  KH: {totalDuration}ng
                </Text>
              )}
            </Text>
          </div>
        </div>

        {/* Cảnh báo nếu tổng công đoạn vượt thời gian KH */}
        {totalDuration && cumDay > totalDuration ? (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8 }}>
            <Text style={{ fontSize: 12, color: '#ff4d4f' }}>
              <WarningOutlined style={{ marginRight: 6 }} />
              Tổng thời gian công đoạn ({cumDay} ngày) vượt thời gian kế hoạch ({totalDuration} ngày). Vui lòng điều chỉnh.
            </Text>
          </div>
        ) : totalDuration && cumDay < totalDuration ? (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
            <Text style={{ fontSize: 12, color: '#d48806' }}>
              Còn {totalDuration - cumDay} ngày dự phòng so với thời gian kế hoạch.
            </Text>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedReception, setSelectedReception] = useState<typeof overhaulReceptions[0] | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState('');

  const handleReceptionChange = (value: string) => {
    const rec = overhaulReceptions.find(r => r.id === value);
    if (rec) {
      setSelectedReception(rec);
      if (rec.routingWorkshop) {
        form.setFieldValue('workshopId', rec.routingWorkshop);
        setSelectedWorkshop(rec.routingWorkshop);
      }
      form.setFieldValue('overhaulScope', rec.overhaulScope);
    }
  };

  const handleSave = (submitForApproval = false) => {
    form.validateFields().then(() => {
      message.success(submitForApproval
        ? 'Đã tạo lệnh đại tu và trình duyệt thành công!'
        : 'Đã lưu lệnh đại tu dưới dạng nháp!'
      );
      navigate('/overhaul-orders');
    }).catch(() => {
      message.error('Vui lòng kiểm tra lại các trường bắt buộc.');
    });
  };

  const goNext = () => setActiveTab(prev => String(Math.min(6, Number(prev) + 1)));
  const goPrev = () => setActiveTab(prev => String(Math.max(1, Number(prev) - 1)));

  const tabLabel = (step: number, label: string) => {
    const color = STEP_COLORS[step - 1];
    const isActive = activeTab === String(step);
    return (
      <Space size={8} style={{ padding: '0 6px' }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: isActive ? color : `${color}22`,
          border: `1.5px solid ${color}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
          color: isActive ? '#fff' : color,
          transition: 'all 0.2s',
        }}>
          {step}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      </Space>
    );
  };

  const tabItems = [
    {
      key: '1',
      label: tabLabel(1, 'Phương án'),
      children: (
        <div style={{ padding: '4px 0' }}>
          <Form.Item name="strategy" label="Phương án đại tu"
            rules={[{ required: true, message: 'Nhập phương án đại tu' }]}>
            <TextArea rows={5} placeholder="Mô tả chiến lược tổng thể: phạm vi can thiệp, phương pháp kỹ thuật, mục tiêu phục hồi..." />
          </Form.Item>
          <Form.Item name="technicalStandards" label="Tiêu chuẩn & Chỉ thị kỹ thuật áp dụng">
            <TextArea rows={3} placeholder="Ví dụ: TCVN 8027-2024, Chỉ thị CT-2025/PKT, Tài liệu kỹ thuật nhà sản xuất..." />
          </Form.Item>
          <Form.Item name="interventionScope" label="Mức can thiệp theo từng cụm hệ thống" style={{ marginBottom: 0 }}>
            <TextArea rows={4} placeholder="Mô tả mức độ can thiệp từng cụm: hệ thống A (đại tu toàn bộ), hệ thống B (thay thế linh kiện)..." />
          </Form.Item>
        </div>
      ),
    },
    {
      key: '2',
      label: tabLabel(2, 'Công đoạn'),
      children: (
        <div style={{ padding: '4px 0' }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="workshopId" label="Trung tâm thực hiện"
                rules={[{ required: true, message: 'Chọn trung tâm' }]}>
                <Select placeholder="Chọn trung tâm..." options={workshopOptions}
                  onChange={(v) => setSelectedWorkshop(v)} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="overhaulScope" label="Phạm vi đại tu"
                rules={[{ required: true, message: 'Chọn phạm vi' }]} initialValue="full">
                <Radio.Group>
                  <Radio value="full">Đại tu toàn bộ</Radio>
                  <Radio value="partial">Đại tu một phần</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: '4px 0 16px' }} />
          <Text strong style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 12 }}>Danh sách công đoạn</Text>
          <Form.List name="stages" initialValue={[{ name: '', assignedTeam: '', plannedDuration: undefined, description: '' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, idx) => (
                  <div key={field.key} style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 14px', marginBottom: 10, border: '1px solid #bfdbfe' }}>
                    <Row gutter={[12, 0]} align="top">
                      <Col flex="28px">
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${GANTT_COLORS[idx % GANTT_COLORS.length]}20`, border: `1px solid ${GANTT_COLORS[idx % GANTT_COLORS.length]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: GANTT_COLORS[idx % GANTT_COLORS.length], marginTop: 6 }}>
                          {idx + 1}
                        </div>
                      </Col>
                      <Col flex="1">
                        <Row gutter={[10, 0]}>
                          <Col xs={24} sm={10}>
                            <Form.Item name={[field.name, 'name']} rules={[{ required: true, message: 'Tên công đoạn' }]} style={{ marginBottom: 8 }}>
                              <Input placeholder="Tên công đoạn..." size="small" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name={[field.name, 'assignedTeam']} style={{ marginBottom: 8 }}>
                              <Input placeholder="Đội thực hiện..." size="small" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={6}>
                            <Form.Item name={[field.name, 'plannedDuration']} style={{ marginBottom: 8 }}>
                              <InputNumber placeholder="Ngày" size="small" min={1} style={{ width: '100%' }} addonAfter="ng" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item name={[field.name, 'description']} style={{ marginBottom: 0 }}>
                          <Input placeholder="Mô tả ngắn công đoạn..." size="small" />
                        </Form.Item>
                      </Col>
                      {fields.length > 1 && (
                        <Col flex="28px">
                          <Button type="text" danger icon={<MinusCircleOutlined />} size="small" onClick={() => remove(field.name)} style={{ marginTop: 4 }} />
                        </Col>
                      )}
                    </Row>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add({ name: '', assignedTeam: '', plannedDuration: undefined, description: '' })}
                  icon={<PlusOutlined />} block style={{ borderRadius: 8, color: STEP_COLORS[1], borderColor: STEP_COLORS[1] }}>
                  Thêm công đoạn
                </Button>
              </>
            )}
          </Form.List>
        </div>
      ),
    },
    {
      key: '3',
      label: tabLabel(3, 'Vật tư'),
      children: (
        <div style={{ padding: '4px 0' }}>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={14}>
              <Text strong style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 12 }}>Danh mục vật tư chính</Text>
              <Form.List name="materialRequirements" initialValue={['']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, idx) => (
                      <Row key={field.key} gutter={[8, 0]} align="middle" style={{ marginBottom: 8 }}>
                        <Col flex="22px">
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textAlign: 'center' }}>{idx + 1}</div>
                        </Col>
                        <Col flex="1">
                          <Form.Item name={[field.name]} style={{ marginBottom: 0 }}>
                            <Input placeholder="Tên vật tư, linh kiện..." size="small" />
                          </Form.Item>
                        </Col>
                        {fields.length > 1 && (
                          <Col flex="28px">
                            <Button type="text" danger icon={<MinusCircleOutlined />} size="small" onClick={() => remove(field.name)} />
                          </Col>
                        )}
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add('')} icon={<PlusOutlined />} size="small"
                      style={{ width: '100%', borderRadius: 6, marginTop: 4, color: STEP_COLORS[2], borderColor: STEP_COLORS[2] }}>
                      Thêm vật tư
                    </Button>
                  </>
                )}
              </Form.List>
            </Col>
            <Col xs={24} md={10}>
              <Text strong style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 12 }}>
                <WarningOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />Vật tư bắt buộc thay thế
              </Text>
              <Form.List name="mandatoryReplacements" initialValue={['']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Row key={field.key} gutter={[8, 0]} align="middle" style={{ marginBottom: 8 }}>
                        <Col flex="1">
                          <Form.Item name={[field.name]} style={{ marginBottom: 0 }}>
                            <Input placeholder="Vật tư bắt buộc thay..." size="small"
                              style={{ borderColor: '#ffccc7', background: '#fff2f0' }} />
                          </Form.Item>
                        </Col>
                        {fields.length > 1 && (
                          <Col flex="28px">
                            <Button type="text" danger icon={<MinusCircleOutlined />} size="small" onClick={() => remove(field.name)} />
                          </Col>
                        )}
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add('')} icon={<PlusOutlined />} size="small"
                      style={{ width: '100%', borderRadius: 6, marginTop: 4, color: '#ff4d4f', borderColor: '#ffccc7' }}>
                      Thêm
                    </Button>
                  </>
                )}
              </Form.List>
              <Divider style={{ margin: '16px 0 12px' }} />
              <Form.Item name="estimatedMaterialCost" label="Chi phí vật tư ước tính" style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="triệu đồng" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: '4',
      label: tabLabel(4, 'Nhân lực'),
      children: (
        <div style={{ padding: '4px 0' }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={17}>
              <Form.Item name="personnelPlan" label="Kế hoạch phân công nhân lực">
                <TextArea rows={5} placeholder="Ví dụ: KTV trưởng Nguyễn Văn A (phụ trách hệ thống quay), 2 KTV bậc 5 (cụm cơ khí), 1 KTV điện tử (hệ thống điều khiển)..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={7}>
              <Form.Item name="teamSize" label="Số KTV tham gia">
                <InputNumber min={1} max={50} style={{ width: '100%' }} placeholder="0" addonAfter="người" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: '5',
      label: tabLabel(5, 'Thời gian'),
      children: (
        <div style={{ padding: '4px 0' }}>
          {/* ── Các trường ngày / chi phí ── */}
          <Row gutter={[16, 0]}>
            <Col xs={12} md={6}>
              <Form.Item name="plannedStartDate" label="Ngày bắt đầu KH"
                rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="plannedEndDate" label="Ngày kết thúc KH"
                rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="plannedDuration" label="Thời gian KH"
                rules={[{ required: true, message: 'Nhập thời gian' }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="0" addonAfter="ngày" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="plannedCost" label="Chi phí KH"
                rules={[{ required: true, message: 'Nhập chi phí' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="tr.đ" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '4px 0 16px' }} />

          {/* ── Biểu đồ Gantt ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text strong style={{ fontSize: 13, color: colors.navy }}>Biểu đồ Gantt — Tiến độ theo công đoạn</Text>
            <Text style={{ fontSize: 12, color: '#aaa' }}>Tự động từ dữ liệu Bước 2 & 5</Text>
          </div>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const stages: GanttStage[] = getFieldValue('stages') || [];
              const startDate: Dayjs | null = getFieldValue('plannedStartDate') ? dayjs(getFieldValue('plannedStartDate')) : null;
              const totalDuration: number | undefined = getFieldValue('plannedDuration') || undefined;
              return (
                <GanttChart stages={stages} startDate={startDate} totalDuration={totalDuration} />
              );
            }}
          </Form.Item>
        </div>
      ),
    },
    {
      key: '6',
      label: tabLabel(6, 'Phê duyệt'),
      children: (
        <div style={{ padding: '4px 0' }}>
          <Alert type="info" showIcon style={{ borderRadius: 8, marginBottom: 20 }}
            message="Lệnh đại tu sẽ được tạo tự động"
            description={
              <div>
                <div>Sau khi lưu, hệ thống tự động:</div>
                <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                  <li>Tạo mã lệnh đại tu (WO-xxx) theo thứ tự</li>
                  <li>Liên kết với hồ sơ tiếp nhận đã chọn</li>
                  <li>Chuyển hồ sơ tiếp nhận sang trạng thái <Tag style={{ fontSize: 11 }}>Chờ lập kế hoạch</Tag></li>
                  <li>Nếu chọn "Lưu & Trình duyệt" — lệnh chuyển sang <Tag color="gold" style={{ fontSize: 11 }}>Chờ duyệt</Tag></li>
                </ul>
              </div>
            }
          />
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const receptionId = getFieldValue('receptionId');
              const rec = overhaulReceptions.find(r => r.id === receptionId);
              const workshopId = getFieldValue('workshopId');
              const stages = (getFieldValue('stages') || []).filter((s: GanttStage) => s?.name);
              const materials = (getFieldValue('materialRequirements') || []).filter(Boolean);
              const mandatory = (getFieldValue('mandatoryReplacements') || []).filter(Boolean);
              return (
                <div style={{ background: `${colors.navy}05`, borderRadius: 10, border: `1px solid ${colors.navy}15`, padding: '16px 20px' }}>
                  <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 12 }}>Tóm tắt lệnh đại tu</Text>
                  <Row gutter={[12, 10]}>
                    {[
                      { label: 'Hồ sơ tiếp nhận', value: rec ? `${rec.code} — ${rec.equipmentName}` : '—' },
                      { label: 'Trung tâm', value: workshopId ? workshopNameMap[workshopId] : '—' },
                      { label: 'Phạm vi', value: getFieldValue('overhaulScope') === 'full' ? 'Đại tu toàn bộ' : getFieldValue('overhaulScope') === 'partial' ? 'Đại tu một phần' : '—' },
                      { label: 'Số công đoạn', value: stages.length ? `${stages.length} công đoạn` : '—' },
                      { label: 'Vật tư chính', value: materials.length ? `${materials.length} hạng mục` : '—' },
                      { label: 'VT bắt buộc thay', value: mandatory.length ? `${mandatory.length} hạng mục` : '—' },
                      { label: 'Số KTV', value: getFieldValue('teamSize') ? `${getFieldValue('teamSize')} người` : '—' },
                      { label: 'Thời gian KH', value: getFieldValue('plannedDuration') ? `${getFieldValue('plannedDuration')} ngày` : '—' },
                      { label: 'Chi phí KH', value: getFieldValue('plannedCost') ? `${getFieldValue('plannedCost')} tr.đ` : '—' },
                      { label: 'CP vật tư', value: getFieldValue('estimatedMaterialCost') ? `${getFieldValue('estimatedMaterialCost')} tr.đ` : '—' },
                    ].map(item => (
                      <Col xs={12} sm={8} key={item.label}>
                        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                          <Text style={{ fontSize: 11, color: '#aaa', display: 'block' }}>{item.label}</Text>
                          <Text style={{ fontSize: 13, fontWeight: 500, color: item.value === '—' ? '#ccc' : '#333' }}>{item.value}</Text>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              );
            }}
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <App>
      <Form form={form} layout="vertical" requiredMark={false}>
        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, #2d5a8e 100%)`,
          borderRadius: 14, padding: '20px 28px', marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', opacity: 0.07 }}>
            <SolutionOutlined style={{ fontSize: 100 }} />
          </div>
          <Row align="middle" justify="space-between">
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/overhaul-orders')}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, marginBottom: 12 }}>
                Quay lại
              </Button>
              <div>
                <Title level={4} style={{ margin: 0, color: '#fff' }}>Lập lệnh đại tu mới</Title>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  Trung tâm phần mềm Alpha · Tạo mới lệnh đại tu từ hồ sơ tiếp nhận
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* ── Chọn hồ sơ ─────────────────────────────────────────── */}
        <Card style={{ borderRadius: 12, marginBottom: 16, borderLeft: `3px solid ${colors.navy}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          styles={{ body: { padding: '16px 24px' } }}>
          <Row gutter={[20, 0]} align="middle">
            <Col xs={24} md={14}>
              <Form.Item name="receptionId"
                label={<Text strong style={{ color: colors.navy }}>Hồ sơ tiếp nhận</Text>}
                rules={[{ required: true, message: 'Chọn hồ sơ tiếp nhận' }]}
                style={{ marginBottom: 0 }}>
                <Select placeholder="Chọn hồ sơ tiếp nhận đã đánh giá..."
                  showSearch optionFilterProp="label"
                  options={receptionOptions}
                  onChange={handleReceptionChange}
                  size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              {selectedReception ? (
                <div style={{ padding: '10px 14px', background: `${colors.navy}06`, borderRadius: 10, border: `1px solid ${colors.navy}20` }}>
                  <Text style={{ fontSize: 12, color: '#888', display: 'block' }}>Thiết bị</Text>
                  <Text strong style={{ fontSize: 14, color: colors.navy }}>{selectedReception.equipmentName}</Text>
                  <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Tag color="blue" style={{ fontSize: 11 }}>{selectedReception.equipmentModel}</Tag>
                    <Tag color="cyan" style={{ fontSize: 11 }}>S/N: {selectedReception.equipmentSerial}</Tag>
                    <Tag color={selectedReception.wearLevel === 'high' || selectedReception.wearLevel === 'critical' ? 'red' : selectedReception.wearLevel === 'medium' ? 'orange' : 'green'} style={{ fontSize: 11 }}>
                      {selectedReception.wearLevel === 'low' ? 'Hao mòn thấp' : selectedReception.wearLevel === 'medium' ? 'Hao mòn TB' : selectedReception.wearLevel === 'high' ? 'Hao mòn cao' : 'Nghiêm trọng'}
                    </Tag>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 10, textAlign: 'center', border: '1px solid #bfdbfe' }}>
                  <Text style={{ fontSize: 12, color: '#ccc' }}>Chọn hồ sơ để xem thông tin thiết bị</Text>
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* ── 2 cột ───────────────────────────────────────────────── */}
        <Row gutter={[20, 0]}>
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '0 20px 20px' } }} className="order-detail-tabs">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="small"
                items={tabItems}
                tabBarStyle={{ marginBottom: 20, paddingTop: 6 }}
                tabBarGutter={0}
                indicator={{ size: (origin) => origin - 16 }}
              />
              {/* Prev / Next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
                <Button icon={<LeftOutlined />} onClick={goPrev} disabled={activeTab === '1'} style={{ borderRadius: 8 }}>
                  Bước trước
                </Button>
                <Text style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>Bước {activeTab} / {STEPS.length}</Text>
                {activeTab !== '6' ? (
                  <Button iconPosition="end" icon={<RightOutlined />} onClick={goNext} style={{ borderRadius: 8 }}>
                    Bước tiếp
                  </Button>
                ) : (
                  <Button type="primary" icon={<AuditOutlined />} onClick={() => handleSave(true)}
                    style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8 }}>
                    Lưu & Trình duyệt
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '16px 20px' } }}>
              <Text strong style={{ fontSize: 14, color: colors.navy }}>Thông tin hồ sơ tiếp nhận</Text>
              {selectedReception ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ padding: '8px 12px', background: `${colors.navy}06`, borderRadius: 8, marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, color: '#888' }}>Mã hồ sơ</Text>
                    <div style={{ fontSize: 14, fontWeight: 700, color: colors.navy }}>{selectedReception.code}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Đơn vị gửi', value: selectedReception.sendingUnit },
                      { label: 'Ngày tiếp nhận', value: new Date(selectedReception.receivedDate).toLocaleDateString('vi-VN') },
                      { label: 'Giờ vận hành', value: `${selectedReception.operatingHours.toLocaleString()} h` },
                      { label: 'Phạm vi ĐT', value: selectedReception.overhaulScope === 'full' ? 'Toàn bộ' : 'Một phần' },
                    ].map(item => (
                      <div key={item.label} style={{ padding: '7px 10px', background: '#eff6ff', borderRadius: 6, border: '1px solid #dbeafe' }}>
                        <Text style={{ fontSize: 11, color: '#aaa', display: 'block' }}>{item.label}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</Text>
                      </div>
                    ))}
                  </div>
                  {selectedReception.assessmentSummary && (
                    <div style={{ borderLeft: `3px solid ${colors.navy}`, paddingLeft: 10, marginBottom: 10 }}>
                      <Text style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 2 }}>Kết luận đánh giá</Text>
                      <Text style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>
                        {selectedReception.assessmentSummary.length > 150
                          ? selectedReception.assessmentSummary.slice(0, 150) + '...'
                          : selectedReception.assessmentSummary}
                      </Text>
                    </div>
                  )}
                  {selectedReception.routingWorkshop && (
                    <div style={{ padding: '7px 12px', background: `${colors.navy}08`, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>Trung tâm đề xuất</Text>
                      <Tag color="blue" style={{ fontSize: 11 }}>{selectedReception.routingWorkshopName || selectedReception.routingWorkshop}</Tag>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <FileTextOutlined style={{ fontSize: 28, color: '#ddd', display: 'block', marginBottom: 8 }} />
                  <Text style={{ fontSize: 12, color: '#ccc' }}>Chọn hồ sơ tiếp nhận để hiển thị thông tin</Text>
                </div>
              )}
            </Card>

            {selectedWorkshop && (
              <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '14px 18px' } }}>
                <Text strong style={{ fontSize: 13, color: colors.navy }}>Trung tâm thực hiện</Text>
                <div style={{ marginTop: 10, padding: '10px 14px', background: `${colors.navy}08`, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: colors.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {selectedWorkshop}
                    </div>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: colors.navy }}>{workshopNameMap[selectedWorkshop]}</Text>
                  </div>
                </div>
              </Card>
            )}

            <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '14px 18px' } }}>
              <Text strong style={{ fontSize: 13, color: colors.navy }}>Các bước</Text>
              <div style={{ marginTop: 12 }}>
                {STEPS.map((s, idx) => (
                  <div key={s.key}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: idx < STEPS.length - 1 ? 4 : 0, cursor: 'pointer' }}
                    onClick={() => setActiveTab(s.key)}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: activeTab === s.key ? STEP_COLORS[idx] : `${STEP_COLORS[idx]}22`, border: `1.5px solid ${STEP_COLORS[idx]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === s.key ? '#fff' : STEP_COLORS[idx], transition: 'all 0.2s' }}>
                        {idx + 1}
                      </div>
                      {idx < STEPS.length - 1 && <div style={{ width: 2, height: 26, background: '#e8e8e8', marginTop: 2 }} />}
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <Text style={{ fontSize: 13, fontWeight: activeTab === s.key ? 600 : 400, color: activeTab === s.key ? STEP_COLORS[idx] : '#555' }}>
                        {s.label}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '14px 18px' } }}>
              <Text strong style={{ fontSize: 13, color: colors.navy }}>Ghi chú</Text>
              <Form.Item name="notes" style={{ marginTop: 10, marginBottom: 0 }}>
                <TextArea rows={3} placeholder="Ghi chú, yêu cầu đặc biệt, ưu tiên xử lý..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* ── Bottom action bar ─────────────────────────────────────── */}
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #e8e8e8', padding: '12px 24px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)', zIndex: 10, borderRadius: '0 0 14px 14px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/overhaul-orders')} style={{ borderRadius: 8 }}>Hủy</Button>
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => handleSave(false)} style={{ borderRadius: 8, minWidth: 120 }}>Lưu nháp</Button>
            <Button type="primary" icon={<AuditOutlined />} onClick={() => handleSave(true)}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, minWidth: 160 }}>
              Lưu & Trình duyệt
            </Button>
          </Space>
        </div>
      </Form>
    </App>
  );
};

export default CreateOrder;
