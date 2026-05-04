import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Button, Space, Tabs, Form, Input, Select,
  DatePicker, Alert, Tag, Table, Divider, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, SettingOutlined, SendOutlined, SaveOutlined,
  CheckCircleOutlined, InfoCircleOutlined, ToolOutlined, SwapOutlined, RocketOutlined, CheckSquareOutlined,
} from '@ant-design/icons';
import { overhaulOrders } from '../../data/overhaulOrders';
import { technicalInspections } from '../../data/technicalInspections';
import { restorations } from '../../data/restorations';
import { components } from '../../data/components';
import { restorationActionConfig, inspectionTypeConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { RestorationAction } from '../../types';

const { Title, Text } = Typography;

const STEP_COLORS = ['#1B3A5C', '#7c3aed', '#d97706', '#16a34a'];

const DISPOSITION_TO_ACTION: Record<string, RestorationAction> = {
  restore: 'restore',
  replace: 'replace',
  upgrade: 'upgrade',
  serviceable: 'retain',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  restore: <ToolOutlined />,
  replace: <SwapOutlined />,
  upgrade: <RocketOutlined />,
  retain: <CheckSquareOutlined />,
};

const ACTION_COLOR: Record<string, string> = {
  restore: '#0891b2',
  replace: '#1B3A5C',
  upgrade: '#7c3aed',
  retain: '#16a34a',
};

interface WorkRow {
  componentId: string;
  componentName: string;
  action: RestorationAction;
  inspectionId: string;
  inspectionType: string;
  disposition: string;
  method: string;
  newPartName: string;
  newPartSerial: string;
  upgradeVersion: string;
  performedBy: string;
  cost: string;
}

function WorkRowForm({ row, idx, actionKey, updateRow }: {
  row: WorkRow; idx: number; actionKey: string;
  updateRow: (idx: number, field: keyof WorkRow, value: string) => void;
}) {
  return (
    <Row gutter={[12, 12]}>
      {actionKey === 'restore' && (
        <Col span={24}>
          <Form.Item label="Phương pháp phục hồi" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Mô tả phương pháp: thay linh kiện, mạ phục hồi, hàn đắp, điều chỉnh..."
              value={row.method} onChange={e => updateRow(idx, 'method', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>
        </Col>
      )}
      {actionKey === 'replace' && (
        <Col span={24}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Tên linh kiện thay thế" style={{ marginBottom: 0 }}>
                <Input placeholder="Tên linh kiện / mô-đun mới" value={row.newPartName}
                  onChange={e => updateRow(idx, 'newPartName', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Serial linh kiện mới" style={{ marginBottom: 0 }}>
                <Input placeholder="Số serial / mã xuất xưởng" value={row.newPartSerial}
                  onChange={e => updateRow(idx, 'newPartSerial', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      )}
      {actionKey === 'upgrade' && (
        <Col span={24}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Phiên bản nâng cấp" style={{ marginBottom: 0 }}>
                <Input placeholder="Vd: Firmware v2.3 → v3.0" value={row.upgradeVersion}
                  onChange={e => updateRow(idx, 'upgradeVersion', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mô tả nâng cấp" style={{ marginBottom: 0 }}>
                <Input placeholder="Cải tiến chính của phiên bản mới" value={row.method}
                  onChange={e => updateRow(idx, 'method', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      )}
      <Col span={12}>
        <Form.Item label="Người / đơn vị thực hiện" style={{ marginBottom: 0 }}>
          <Input placeholder="Tên KTV — Trung tâm" value={row.performedBy}
            onChange={e => updateRow(idx, 'performedBy', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Chi phí (triệu đồng)" style={{ marginBottom: 0 }}>
          <Input type="number" placeholder="0" value={row.cost}
            onChange={e => updateRow(idx, 'cost', e.target.value)} style={{ borderRadius: 6, fontSize: 12 }} />
        </Form.Item>
      </Col>
    </Row>
  );
}

const CreateRestoration: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [workRows, setWorkRows] = useState<WorkRow[]>([]);

  const availableOrders = overhaulOrders.filter(o =>
    o.status === 'in_progress' || o.status === 'approved'
  );
  const selectedOrder = availableOrders.find(o => o.id === selectedOrderId);

  // completed inspections for the order with non-serviceable disposition and no existing restoration record
  const existingRestorationInspIds = new Set(restorations.map(r => r.inspectionId).filter(Boolean));
  const orderInspections = technicalInspections.filter(i =>
    i.orderId === selectedOrderId &&
    i.status === 'completed' &&
    i.disposition &&
    i.disposition !== 'serviceable' &&
    !existingRestorationInspIds.has(i.id)
  );

  const getComponent = (compId: string) => components.find(c => c.id === compId);

  const handleOrderChange = (val: string) => {
    setSelectedOrderId(val);
    setSelectedIds([]);
    setWorkRows([]);
    form.resetFields(['componentIds', 'startDate']);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    const rows: WorkRow[] = ids.map(insId => {
      const ins = orderInspections.find(i => i.id === insId)!;
      const action = DISPOSITION_TO_ACTION[ins.disposition ?? 'restore'] ?? 'restore';
      const existing = workRows.find(r => r.inspectionId === insId);
      return existing ?? {
        componentId: ins.componentId,
        componentName: ins.componentName,
        action,
        inspectionId: ins.id,
        inspectionType: ins.inspectionType,
        disposition: ins.disposition ?? '',
        method: '',
        newPartName: '',
        newPartSerial: '',
        upgradeVersion: '',
        performedBy: '',
        cost: '',
      };
    });
    setWorkRows(rows);
  };

  const updateRow = (idx: number, field: keyof WorkRow, value: string) => {
    setWorkRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const groupedByAction = workRows.reduce<Record<string, WorkRow[]>>((acc, r) => {
    if (!acc[r.action]) acc[r.action] = [];
    acc[r.action].push(r);
    return acc;
  }, {});

  const totalCost = workRows.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0);
  const canGoTab2 = selectedOrderId && workRows.length > 0;
  const canGoTab3 = canGoTab2 && workRows.every(r => r.performedBy.trim());

  const tabItems = [
    {
      key: '1',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '1' ? STEP_COLORS[0] : `${STEP_COLORS[0]}33`, border: `1.5px solid ${STEP_COLORS[0]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '1' ? '#fff' : STEP_COLORS[0] }}>1</div>
          Tiếp nhận & Phân loại
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 1 & 2: Tiếp nhận kết quả và phân loại phương án xử lý"
            description="Chọn lệnh đại tu, xem kết quả kiểm tra kỹ thuật đã có và chọn các cấu phần cần tạo phiếu phục hồi."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
            <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Chọn lệnh đại tu</Text>
            <Form.Item name="orderId" style={{ marginTop: 12, marginBottom: 0 }} rules={[{ required: true, message: 'Vui lòng chọn lệnh đại tu' }]}>
              <Select placeholder="Chọn lệnh đại tu..." style={{ width: '100%' }} onChange={handleOrderChange}
                options={availableOrders.map(o => ({ value: o.id, label: `${o.code} — ${o.equipmentName} (${o.workshopName})` }))}
              />
            </Form.Item>
            {selectedOrder && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <Row gutter={16}>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Thiết bị</Text><div><Text strong>{selectedOrder.equipmentName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Trung tâm</Text><div><Text strong>{selectedOrder.workshopName}</Text></div></Col>
                  <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Cấu phần cần xử lý</Text><div><Text strong style={{ color: '#d97706' }}>{orderInspections.length} cấu phần</Text></div></Col>
                </Row>
              </div>
            )}
          </Card>

          {selectedOrderId && orderInspections.length > 0 && (
            <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Kết quả kiểm tra cần xử lý</Text>
                <Space>
                  <Button size="small" onClick={() => handleSelectionChange(orderInspections.map(i => i.id))}>Chọn tất cả</Button>
                  <Button size="small" onClick={() => handleSelectionChange([])}>Bỏ chọn</Button>
                </Space>
              </Row>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {orderInspections.map(ins => {
                  const action = DISPOSITION_TO_ACTION[ins.disposition ?? 'restore'] ?? 'restore';
                  const cfg = restorationActionConfig[action];
                  const insCfg = inspectionTypeConfig[ins.inspectionType as keyof typeof inspectionTypeConfig];
                  const comp = getComponent(ins.componentId);
                  const selected = selectedIds.includes(ins.id);
                  return (
                    <div key={ins.id} onClick={() => {
                      const newIds = selected ? selectedIds.filter(id => id !== ins.id) : [...selectedIds, ins.id];
                      handleSelectionChange(newIds);
                    }} style={{
                      padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${selected ? ACTION_COLOR[action] : '#e0e0e0'}`,
                      background: selected ? `${ACTION_COLOR[action]}0d` : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <Row justify="space-between" align="middle">
                        <Col flex="auto">
                          <Space size={8}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? ACTION_COLOR[action] : '#ccc'}`, background: selected ? ACTION_COLOR[action] : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {selected ? '✓' : ''}
                            </div>
                            <div>
                              <Text strong style={{ fontSize: 13 }}>{ins.componentName}</Text>
                              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                                {ins.id} · {comp?.systemGroup} · {insCfg?.label}
                              </div>
                            </div>
                          </Space>
                        </Col>
                        <Col>
                          <Space size={6}>
                            {ins.result && <Tag color={ins.result === 'fail' ? 'error' : 'warning'} style={{ fontSize: 11 }}>KT: {ins.result === 'fail' ? 'Không đạt' : 'Cận giới hạn'}</Tag>}
                            <Tag color={cfg.color} style={{ fontSize: 11 }}>{ACTION_ICONS[action]} {cfg.label}</Tag>
                          </Space>
                        </Col>
                      </Row>
                      {ins.comparisonNote && (
                        <div style={{ marginTop: 6, fontSize: 11, color: '#666', paddingLeft: 26 }}>
                          {ins.comparisonNote.substring(0, 100)}{ins.comparisonNote.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedIds.length > 0 && (
                <div style={{ marginTop: 12, padding: '8px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                  <Row gutter={16}>
                    {(['restore', 'replace', 'upgrade'] as RestorationAction[]).map(a => {
                      const cnt = workRows.filter(r => r.action === a).length;
                      if (!cnt) return null;
                      return (
                        <Col key={a}><Tag color={restorationActionConfig[a].color}>{restorationActionConfig[a].label}: {cnt}</Tag></Col>
                      );
                    })}
                    <Col><Text type="secondary" style={{ fontSize: 12 }}>Tổng: {selectedIds.length} cấu phần</Text></Col>
                  </Row>
                </div>
              )}
            </Card>
          )}

          {selectedOrderId && orderInspections.length === 0 && (
            <Alert type="success" showIcon icon={<CheckCircleOutlined />}
              message="Tất cả cấu phần đã được xử lý"
              description="Không có cấu phần nào cần tạo phiếu phục hồi mới cho lệnh đại tu này."
              style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={() => setActiveTab('2')}
              style={{ background: STEP_COLORS[1], borderColor: STEP_COLORS[1] }}>
              Tiếp theo: Nhập thông tin thực hiện
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
          Thực hiện
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 3–5: Nhập thông tin thực hiện cho từng cấu phần"
            description="Điền chi tiết phương pháp, vật tư và người thực hiện theo từng phương án xử lý."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          {(['restore', 'replace', 'upgrade'] as RestorationAction[]).map(actionKey => {
            const rows = workRows.filter(r => r.action === actionKey);
            if (!rows.length) return null;
            const cfg = restorationActionConfig[actionKey];
            return (
              <Card key={actionKey} size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${ACTION_COLOR[actionKey]}` }}
                title={
                  <Space>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: ACTION_COLOR[actionKey], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{ACTION_ICONS[actionKey]}</div>
                    <Text strong style={{ color: ACTION_COLOR[actionKey], fontSize: 13 }}>Nhóm {cfg.label} ({rows.length} cấu phần)</Text>
                  </Space>
                }>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
                  {rows.map(row => {
                    const idx = workRows.findIndex(r => r.inspectionId === row.inspectionId);
                    return (
                      <div key={row.inspectionId} style={{ padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                        <Text strong style={{ color: colors.navy, fontSize: 13 }}>{row.componentName}</Text>
                        <Divider style={{ margin: '10px 0' }} />
                        <WorkRowForm row={row} idx={idx} actionKey={actionKey} updateRow={updateRow} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          <Card size="small" style={{ borderRadius: 10 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ngày bắt đầu" name="startDate" style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" placeholder="Ngày bắt đầu thực hiện" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ghi chú chung" name="notes" style={{ marginBottom: 0 }}>
                  <Input placeholder="Ghi chú về điều kiện, yêu cầu đặc biệt..." style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Row justify="space-between">
            <Button onClick={() => setActiveTab('1')} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            <Button type="primary" onClick={() => setActiveTab('3')}
              style={{ background: STEP_COLORS[3], borderColor: STEP_COLORS[3] }}>
              Tiếp theo: Xác nhận & Tạo phiếu
            </Button>
          </Row>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <Space size={6}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: activeTab === '3' ? STEP_COLORS[3] : `${STEP_COLORS[3]}33`, border: `1.5px solid ${STEP_COLORS[3]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeTab === '3' ? '#fff' : STEP_COLORS[3] }}>3</div>
          Xác nhận
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Alert type="info" showIcon
            message="Bước 6 & 7: Xác nhận và tạo phiếu phục hồi"
            description="Kiểm tra lại toàn bộ thông tin. Mỗi cấu phần sẽ được tạo một phiếu phục hồi độc lập và liên kết với hồ sơ đại tu."
            style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          {selectedOrder && (
            <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Row gutter={24}>
                <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Lệnh đại tu</Text><div><Text strong>{selectedOrder.code}</Text></div></Col>
                <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Thiết bị</Text><div><Text strong>{selectedOrder.equipmentName}</Text></div></Col>
                <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Tổng chi phí dự kiến</Text><div><Text strong style={{ color: '#d97706' }}>{totalCost.toFixed(1)} triệu đồng</Text></div></Col>
              </Row>
            </Card>
          )}

          <Card size="small" style={{ borderRadius: 10 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tổng kết {workRows.length} phiếu phục hồi</Text>}>
            <Table
              dataSource={workRows} rowKey="inspectionId" size="small" pagination={false}
              columns={[
                { title: 'Cấu phần', dataIndex: 'componentName', key: 'name', render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text> },
                { title: 'Phương án', dataIndex: 'action', key: 'action',
                  render: (v: RestorationAction) => { const c = restorationActionConfig[v]; return <Tag color={c?.color}>{c?.label}</Tag>; }
                },
                { title: 'Chi tiết', key: 'detail',
                  render: (_: unknown, r: WorkRow) => (
                    <Text style={{ fontSize: 12 }}>
                      {r.action === 'restore' && (r.method || '—')}
                      {r.action === 'replace' && (r.newPartName || '—')}
                      {r.action === 'upgrade' && (r.upgradeVersion || '—')}
                    </Text>
                  )
                },
                { title: 'Người thực hiện', dataIndex: 'performedBy', key: 'by', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
                { title: 'Chi phí (tr)', dataIndex: 'cost', key: 'cost', width: 90,
                  render: (v: string) => v ? <Text strong style={{ fontSize: 12, color: '#d97706' }}>{v}</Text> : '—'
                },
              ]}
            />
          </Card>

          <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 10, border: '1px solid #b7eb8f' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              <Text style={{ color: '#389e0d', fontSize: 13 }}>
                Hệ thống sẽ tạo <Text strong style={{ color: '#389e0d' }}>{workRows.length} phiếu phục hồi</Text> và cập nhật trạng thái cấu phần tương ứng.
              </Text>
            </Space>
          </div>

          <Row justify="space-between">
            <Button onClick={() => setActiveTab('2')} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            <Space>
              <Button icon={<SaveOutlined />}>Lưu nháp</Button>
              <Button type="primary" icon={<SendOutlined />}
                style={{ background: STEP_COLORS[3], borderColor: STEP_COLORS[3] }}
                onClick={() => navigate('/restorations')}>
                Tạo & Lưu phiếu phục hồi
              </Button>
            </Space>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/restorations')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}>
                  Quay lại
                </Button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Tạo phiếu phục hồi, thay thế & nâng cấp</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quy trình 5 · Dựa trên kết quả kiểm tra kỹ thuật</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <Row gutter={20}>
        <Col flex="auto">
          <Form form={form} layout="vertical">
            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="order-detail-tabs" />
            </Card>
          </Form>
        </Col>

        <Col flex="260px">
          <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}><InfoCircleOutlined style={{ marginRight: 6 }} />Phân loại xử lý</Text>}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {(['restore', 'replace', 'upgrade', 'retain'] as RestorationAction[]).map(a => {
                const cfg = restorationActionConfig[a];
                const descs: Record<string, string> = {
                  restore: 'Phục hồi linh kiện về trạng thái sử dụng',
                  replace: 'Thay bằng linh kiện / mô-đun mới',
                  upgrade: 'Nâng cấp theo tiêu chuẩn kỹ thuật mới',
                  retain: 'Đạt yêu cầu — giữ nguyên sử dụng',
                };
                return (
                  <div key={a} style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <Tag color={cfg.color} style={{ marginBottom: 4 }}>{ACTION_ICONS[a]} {cfg.label}</Tag>
                    <div style={{ fontSize: 11, color: '#666' }}>{descs[a]}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card size="small" style={{ borderRadius: 12 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tóm tắt đã chọn</Text>}>
            {workRows.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>Chưa chọn cấu phần nào</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {(['restore', 'replace', 'upgrade'] as RestorationAction[]).map(a => {
                  const cnt = workRows.filter(r => r.action === a).length;
                  if (!cnt) return null;
                  return (
                    <div key={a} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={restorationActionConfig[a].color}>{restorationActionConfig[a].label}</Tag>
                      <Badge count={cnt} style={{ background: ACTION_COLOR[a] }} />
                    </div>
                  );
                })}
                <Divider style={{ margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12 }}>Tổng cấu phần</Text>
                  <Text strong style={{ fontSize: 12 }}>{workRows.length}</Text>
                </div>
                {totalCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12 }}>Chi phí dự kiến</Text>
                    <Text strong style={{ fontSize: 12, color: '#d97706' }}>{totalCost.toFixed(1)} tr</Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateRestoration;
