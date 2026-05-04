import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Button, Space, Tabs, Form, Input, Select,
  DatePicker, Alert, Tag, Divider, Table,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, SearchOutlined, SendOutlined,
  SaveOutlined, CheckCircleOutlined, InfoCircleOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { components } from '../../data/components';
import { inspectionTypeConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { InspectionType, Component } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_COLORS = ['#1B3A5C', '#0891b2', '#16a34a'];

// Gợi ý loại kiểm tra theo nhóm hệ thống / category
const INSPECTION_SUGGEST: Record<string, { types: InspectionType[]; reason: string }> = {
  module:     { types: ['functional', 'visual'],    reason: 'Mô-đun điện tử → kiểm tra chức năng + ngoại quan' },
  part:       { types: ['dimensional', 'ndt'],      reason: 'Chi tiết cơ khí → đo kích thước + kiểm tra không phá hủy' },
  assembly:   { types: ['functional', 'dimensional'], reason: 'Cụm lắp ráp → kiểm tra chức năng + khe hở' },
  consumable: { types: ['visual', 'surface'],       reason: 'Vật tư tiêu hao → kiểm tra ngoại quan + bề mặt' },
};

// Đơn vị chuyên môn nhận kiểm tra theo loại
const EXTERNAL_SYSTEM_MAP: Record<InspectionType, string> = {
  visual:     'Phòng KCS & Đảm bảo CL',
  surface:    'Phòng KCS & Đảm bảo CL',
  functional: 'Phòng KCS & Đảm bảo CL',
  dimensional:'Trung tâm Đo lường Quân khu',
  ndt:        'Phòng KCS & Đảm bảo CL',
};

const INSPECTION_UNIT_MAP: Record<InspectionType, string> = {
  visual:     'Quản lý chất lượng',
  surface:    'Quản lý chất lượng',
  functional: 'Quản lý chất lượng',
  dimensional:'Quản lý đo lường',
  ndt:        'Quản lý chất lượng',
};

const CreateTechnicalInspection: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [inspectionRows, setInspectionRows] = useState<{
    componentId: string; componentName: string; inspectionType: InspectionType; technicalLimit: string;
  }[]>([]);

  const availableOrders = overhaulOrders.filter(o => o.status === 'in_progress' || o.status === 'approved');
  const selectedOrder = availableOrders.find(o => o.id === selectedOrderId);

  const orderComponents = components.filter(c =>
    c.orderId === selectedOrderId && (c.status === 'disassembled' || c.status === 'pending_inspection')
  );

  const handleOrderChange = (val: string) => {
    setSelectedOrderId(val);
    setSelectedComponents([]);
    setInspectionRows([]);
    form.setFieldValue('componentIds', []);
  };

  const handleComponentSelect = (ids: string[]) => {
    const comps = orderComponents.filter(c => ids.includes(c.id));
    setSelectedComponents(comps);
    // Tự động gợi ý loại kiểm tra
    const rows = comps.map(c => {
      const suggest = INSPECTION_SUGGEST[c.category];
      return {
        componentId: c.id,
        componentName: c.name,
        inspectionType: (suggest?.types[0] ?? 'visual') as InspectionType,
        technicalLimit: '',
      };
    });
    setInspectionRows(rows);
  };

  const updateRow = (idx: number, field: string, value: string) => {
    setInspectionRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const getExternalInfo = (type: InspectionType) => ({
    unit: EXTERNAL_SYSTEM_MAP[type],
    system: INSPECTION_UNIT_MAP[type],
  });

  const canGoToTab2 = selectedOrderId && inspectionRows.length > 0;
  const canGoToTab3 = canGoToTab2;

  const tabItems = [
    {
      key: '1',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '1' ? STEP_COLORS[0] : `${STEP_COLORS[0]}33`, border: `1.5px solid ${STEP_COLORS[0]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '1' ? '#fff' : STEP_COLORS[0] }}>1</div>
          Xác định yêu cầu
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert
            type="info" showIcon
            message="Bước 1 & 2: Xác định yêu cầu kiểm tra"
            description="Chọn lệnh đại tu, xác định từng cấu phần cần kiểm tra và loại kiểm tra phù hợp với đặc tính kỹ thuật."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
            <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Chọn lệnh đại tu</Text>
            <Form.Item name="orderId" style={{ marginTop: 12, marginBottom: 0 }}
              rules={[{ required: true, message: 'Vui lòng chọn lệnh đại tu' }]}>
              <Select
                placeholder="Chọn lệnh đại tu cần kiểm tra cấu phần..."
                style={{ width: '100%' }}
                onChange={handleOrderChange}
                options={availableOrders.map(o => ({
                  value: o.id,
                  label: `${o.code} — ${o.equipmentName} (${o.workshopName})`,
                }))}
              />
            </Form.Item>
            {selectedOrder && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <Row gutter={16}>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Thiết bị</Text><div><Text strong>{selectedOrder.equipmentName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Trung tâm</Text><div><Text strong>{selectedOrder.workshopName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Cấu phần chờ KT</Text><div><Text strong style={{ color: '#d97706' }}>{orderComponents.length} cấu phần</Text></div></Col>
                </Row>
              </div>
            )}
          </Card>

          {selectedOrderId && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
              <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Chọn cấu phần cần kiểm tra</Text>
              <Form.Item name="componentIds" style={{ marginTop: 12, marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="Chọn một hoặc nhiều cấu phần..."
                  style={{ width: '100%' }}
                  onChange={handleComponentSelect}
                  options={orderComponents.map(c => ({
                    value: c.id,
                    label: `[${c.code}] ${c.name} — ${c.systemGroup}`,
                  }))}
                  optionFilterProp="label"
                />
              </Form.Item>
            </Card>
          )}

          {inspectionRows.length > 0 && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
              <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Xác định loại kiểm tra & giới hạn kỹ thuật</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 12, marginTop: 4 }}>
                Hệ thống gợi ý loại kiểm tra dựa trên đặc tính cấu phần — có thể điều chỉnh
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {inspectionRows.map((row, idx) => {
                  const comp = selectedComponents.find(c => c.id === row.componentId);
                  const suggest = comp ? INSPECTION_SUGGEST[comp.category] : null;
                  return (
                    <div key={row.componentId} style={{ padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                      <Row gutter={[12, 8]} align="middle">
                        <Col span={7}>
                          <Text strong style={{ fontSize: 12, color: colors.navy }}>{row.componentName}</Text>
                          {suggest && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{suggest.reason}</div>}
                        </Col>
                        <Col span={7}>
                          <Select
                            size="small" style={{ width: '100%' }}
                            value={row.inspectionType}
                            onChange={v => updateRow(idx, 'inspectionType', v)}
                            options={Object.entries(inspectionTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                          />
                          <div style={{ marginTop: 4 }}>
                            {row.inspectionType && (
                              <Tag color={inspectionTypeConfig[row.inspectionType as InspectionType]?.color} style={{ fontSize: 11 }}>
                                Gửi: {getExternalInfo(row.inspectionType as InspectionType).unit}
                              </Tag>
                            )}
                          </div>
                        </Col>
                        <Col span={10}>
                          <Input
                            size="small"
                            placeholder="Giới hạn kỹ thuật (vd: ≤ 0.10mm, ≥ 50kW...)"
                            value={row.technicalLimit}
                            onChange={e => updateRow(idx, 'technicalLimit', e.target.value)}
                            style={{ borderRadius: 6, fontSize: 12 }}
                          />
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card size="small" style={{ borderRadius: 10 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Người yêu cầu" name="requestedBy" rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                  <Input placeholder="Họ tên người yêu cầu kiểm tra" style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày yêu cầu" name="requestDate" rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" placeholder="Ngày yêu cầu" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" disabled={!canGoToTab2} onClick={() => setActiveTab('2')}
              style={{ background: canGoToTab2 ? STEP_COLORS[1] : undefined, borderColor: canGoToTab2 ? STEP_COLORS[1] : undefined }}>
              Tiếp theo: Gửi yêu cầu
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '2' ? STEP_COLORS[1] : `${STEP_COLORS[1]}33`, border: `1.5px solid ${STEP_COLORS[1]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '2' ? '#fff' : STEP_COLORS[1] }}>2</div>
          Gửi đến phân hệ
        </Space>
      ),
      disabled: !canGoToTab2,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert
            type="info" showIcon
            message="Bước 2: Gửi yêu cầu đến phân hệ chuyên môn"
            description="Hệ thống tự động xác định phân hệ phù hợp dựa trên loại kiểm tra. Xác nhận và ghi chú yêu cầu bổ sung trước khi gửi."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          {inspectionRows.map((row, idx) => {
            const extInfo = getExternalInfo(row.inspectionType as InspectionType);
            const cfg = inspectionTypeConfig[row.inspectionType as InspectionType];
            return (
              <Card key={row.componentId} size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${cfg?.color}` }}>
                <Row justify="space-between" align="top">
                  <Col>
                    <Text strong style={{ fontSize: 13, color: colors.navy }}>{row.componentName}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={cfg?.color}>{cfg?.label}</Tag>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Gửi đến</Text>
                      <div><Text strong style={{ fontSize: 13, color: STEP_COLORS[1] }}>{extInfo.unit}</Text></div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Phân hệ: {extInfo.system}</Text>
                    </div>
                  </Col>
                </Row>
                {row.technicalLimit && (
                  <div style={{ marginTop: 10, padding: '6px 10px', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                    <Text style={{ fontSize: 12, color: '#555' }}>Giới hạn KT tham chiếu: </Text>
                    <Text strong style={{ fontSize: 12, color: colors.navy }}>{row.technicalLimit}</Text>
                  </div>
                )}
                <Form.Item name={`note_${idx}`} label="Ghi chú yêu cầu" style={{ marginTop: 12, marginBottom: 0 }}>
                  <TextArea rows={2} placeholder="Yêu cầu đặc biệt, lưu ý kỹ thuật khi kiểm tra..." style={{ borderRadius: 6, fontSize: 12 }} />
                </Form.Item>
              </Card>
            );
          })}

          <Card size="small" style={{ borderRadius: 10 }}>
            <Form.Item label="Ngày gửi" name="sentDate" style={{ marginBottom: 0 }}>
              <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" placeholder="Ngày gửi yêu cầu đến phân hệ" />
            </Form.Item>
          </Card>

          <Row justify="space-between">
            <Button onClick={() => setActiveTab('1')} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => setActiveTab('3')}
              style={{ background: STEP_COLORS[2], borderColor: STEP_COLORS[2] }}>
              Tiếp theo: Xác nhận & Lưu
            </Button>
          </Row>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '3' ? STEP_COLORS[2] : `${STEP_COLORS[2]}33`, border: `1.5px solid ${STEP_COLORS[2]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '3' ? '#fff' : STEP_COLORS[2] }}>3</div>
          Xác nhận
        </Space>
      ),
      disabled: !canGoToTab3,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert
            type="info" showIcon
            message="Bước 3: Xác nhận & Tạo phiếu kiểm tra"
            description="Xem lại toàn bộ thông tin trước khi tạo. Mỗi cấu phần sẽ được tạo một phiếu kiểm tra riêng."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          {selectedOrder && (
            <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Text strong style={{ color: colors.navy, fontSize: 13 }}>Lệnh đại tu</Text>
              <Divider style={{ margin: '8px 0' }} />
              <Row gutter={24}>
                <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Mã lệnh</Text><div><Text strong>{selectedOrder.code}</Text></div></Col>
                <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Thiết bị</Text><div><Text strong>{selectedOrder.equipmentName}</Text></div></Col>
                <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Trung tâm</Text><div><Text strong>{selectedOrder.workshopName}</Text></div></Col>
              </Row>
            </Card>
          )}

          <Card size="small" style={{ borderRadius: 10 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tổng kết {inspectionRows.length} phiếu kiểm tra sẽ được tạo</Text>}>
            <Table
              dataSource={inspectionRows}
              rowKey="componentId"
              size="small"
              pagination={false}
              columns={[
                { title: 'Cấu phần', dataIndex: 'componentName', key: 'name', render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text> },
                { title: 'Loại kiểm tra', dataIndex: 'inspectionType', key: 'type',
                  render: (v: string) => { const c = inspectionTypeConfig[v as InspectionType]; return <Tag color={c?.color}>{c?.label}</Tag>; }
                },
                { title: 'Gửi đến', dataIndex: 'inspectionType', key: 'unit',
                  render: (v: string) => <Text style={{ fontSize: 12 }}>{getExternalInfo(v as InspectionType).unit}</Text>
                },
                { title: 'Giới hạn KT', dataIndex: 'technicalLimit', key: 'limit',
                  render: (v: string) => v ? <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text> : <Text type="secondary">—</Text>
                },
              ]}
            />
          </Card>

          <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              <Text style={{ color: '#389e0d', fontSize: 13 }}>
                Hệ thống sẽ tạo <Text strong style={{ color: '#389e0d' }}>{inspectionRows.length} phiếu kiểm tra</Text> và gửi thông báo đến các phân hệ chuyên môn tương ứng.
              </Text>
            </Space>
          </Card>

          <Row justify="space-between">
            <Button onClick={() => setActiveTab('2')} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            <Space>
              <Button icon={<SaveOutlined />}>Lưu nháp</Button>
              <Button type="primary" icon={<SendOutlined />}
                style={{ background: STEP_COLORS[2], borderColor: STEP_COLORS[2] }}
                onClick={() => navigate('/technical-inspections')}>
                Tạo & Gửi yêu cầu
              </Button>
            </Space>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/technical-inspections')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AuditOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tạo yêu cầu kiểm tra kỹ thuật</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 4 · Xác định, gửi yêu cầu và theo dõi kết quả kiểm tra</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <Row gutter={20}>
        {/* Main form */}
        <Col flex="auto">
          <Form form={form} layout="vertical">
            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="order-detail-tabs" />
            </Card>
          </Form>
        </Col>

        {/* Sidebar */}
        <Col flex="280px">
          <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Hướng dẫn loại kiểm tra</Text>}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {Object.entries(inspectionTypeConfig).map(([key, cfg]) => {
                const unitMap: Record<string, string> = {
                  visual: 'Phòng KCS', surface: 'Phòng KCS',
                  functional: 'Phòng KCS', dimensional: 'TT Đo lường', ndt: 'Phòng KCS',
                };
                return (
                  <div key={key} style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <Tag color={cfg.color} style={{ marginBottom: 4 }}>{cfg.label}</Tag>
                    <div style={{ fontSize: 11, color: '#666' }}>Gửi: {unitMap[key]}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card size="small" style={{ borderRadius: 12 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />Lưu ý
            </Text>}>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>• Mỗi cấu phần tạo <Text strong>1 phiếu kiểm tra riêng</Text></div>
              <div style={{ marginBottom: 8 }}>• Nhập đầy đủ giới hạn kỹ thuật để hỗ trợ so sánh tự động</div>
              <div style={{ marginBottom: 8 }}>• Kết quả kiểm tra từ phân hệ ngoài sẽ được nhập lại trong màn chi tiết</div>
              <div>• Sau khi có kết quả → xác định hướng xử lý từng cấu phần</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateTechnicalInspection;
