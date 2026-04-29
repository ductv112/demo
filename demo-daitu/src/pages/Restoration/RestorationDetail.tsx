import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions,
  Timeline, Drawer, Form, Input, DatePicker, Select, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, SettingOutlined, ToolOutlined, SwapOutlined, RocketOutlined,
  CheckCircleOutlined, ClockCircleOutlined, EditOutlined, CheckSquareOutlined,
  AuditOutlined, CalendarOutlined, UserOutlined, FileTextOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { restorations } from '../../data/restorations';
import { overhaulOrders } from '../../data/overhaulOrders';
import { components } from '../../data/components';
import { technicalInspections } from '../../data/technicalInspections';
import { restorationActionConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusMap: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Chờ thực hiện', color: '#2563eb' },
  in_progress: { label: 'Đang thực hiện', color: '#7c3aed' },
  completed:   { label: 'Hoàn thành',    color: '#16a34a' },
};

const ACTION_COLOR: Record<string, string> = {
  restore: '#0891b2',
  replace: '#1B3A5C',
  upgrade: '#7c3aed',
  retain:  '#16a34a',
};

const ACTION_ICON: Record<string, React.ReactNode> = {
  restore: <ToolOutlined />,
  replace: <SwapOutlined />,
  upgrade: <RocketOutlined />,
  retain:  <CheckSquareOutlined />,
};


const RestorationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerForm] = Form.useForm();

  const record = restorations.find(r => r.id === id);
  const order = overhaulOrders.find(o => record && o.id === record.orderId);
  const comp = components.find(c => record && c.id === record.componentId);
  const inspection = technicalInspections.find(i => record && i.id === record.inspectionId);

  if (!record) return <div style={{ padding: 24 }}>Không tìm thấy phiếu phục hồi.</div>;

  const actionCfg = restorationActionConfig[record.action];
  const statusCfg = statusMap[record.status];
  const accentColor = ACTION_COLOR[record.action];

  return (
    <div>
      {/* Hero */}
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
                  <Space size={8}>
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{record.id}</Title>
                    <Tag color={actionCfg?.color} style={{ fontWeight: 600 }}>{ACTION_ICON[record.action]} {actionCfg?.label}</Tag>
                    <Tag style={{ background: statusCfg?.color, color: '#fff', border: 'none', fontWeight: 600 }}>{statusCfg?.label}</Tag>
                  </Space>
                  <div><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{record.componentName} · {order?.code}</Text></div>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                {record.status !== 'completed' && (
                  <Button icon={<EditOutlined />} onClick={() => setDrawerOpen(true)}
                    style={{ background: accentColor, borderColor: accentColor, color: '#fff', fontWeight: 600 }}>
                    Cập nhật tiến độ
                  </Button>
                )}
                {record.status === 'completed' && !record.readyForAssembly && (
                  <Button icon={<CheckCircleOutlined />}
                    style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 600 }}>
                    Đánh dấu sẵn sàng lắp ráp
                  </Button>
                )}
                {record.readyForAssembly && (
                  <Tag style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, padding: '4px 12px', borderRadius: 6 }}>
                    <CheckCircleOutlined style={{ marginRight: 4 }} />Sẵn sàng lắp ráp
                  </Tag>
                )}
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left column */}
        <Col xs={24} lg={16}>
          {/* Basic info */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Space><FileTextOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy }}>Thông tin phiếu phục hồi</Text></Space>}>
            <Row gutter={[0, 0]}>
              <Col span={24}>
                <Descriptions column={3} size="small" labelStyle={{ color: '#888', fontWeight: 500, fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Mã phiếu"><Text strong style={{ color: colors.navy }}>{record.id}</Text></Descriptions.Item>
                  <Descriptions.Item label="Lệnh đại tu"><Text strong>{order?.code || record.orderId}</Text></Descriptions.Item>
                  <Descriptions.Item label="Phân xưởng"><Text>{order?.workshopName}</Text></Descriptions.Item>
                  <Descriptions.Item label="Phương án"><Tag color={actionCfg?.color}>{actionCfg?.label}</Tag></Descriptions.Item>
                  <Descriptions.Item label="Trạng thái"><Tag style={{ background: statusCfg?.color, color: '#fff', border: 'none' }}>{statusCfg?.label}</Tag></Descriptions.Item>
                  <Descriptions.Item label="Chi phí">
                    {record.cost ? <Text strong style={{ color: '#d97706' }}>{record.cost} triệu đồng</Text> : <Text type="secondary">Chưa xác định</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người thực hiện"><Text>{record.performedBy}</Text></Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu"><Text>{formatDate(record.startDate)}</Text></Descriptions.Item>
                  <Descriptions.Item label="Ngày kết thúc">
                    {record.endDate ? <Text style={{ color: '#16a34a', fontWeight: 600 }}>{formatDate(record.endDate)}</Text> : <Text type="secondary">Đang thực hiện</Text>}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          {/* Action-specific card */}
          {record.action === 'restore' && record.method && (
            <Card style={{ borderRadius: 12, marginBottom: 16, borderLeft: `4px solid ${accentColor}` }}
              title={<Space><ToolOutlined style={{ color: accentColor }} /><Text strong style={{ color: accentColor }}>Phương pháp phục hồi</Text></Space>}>
              <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: record.steps?.length ? 12 : 0 }}>
                <Text style={{ fontSize: 13 }}>{record.method}</Text>
              </div>
              {record.steps && record.steps.length > 0 && (
                <>
                  <Text strong style={{ color: colors.navy, fontSize: 12, display: 'block', marginBottom: 8 }}>Các bước thực hiện</Text>
                  <Timeline
                    items={record.steps.map((step, i) => ({
                      dot: <div style={{ width: 20, height: 20, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</div>,
                      children: <Text style={{ fontSize: 13 }}>{step}</Text>,
                    }))}
                  />
                </>
              )}
            </Card>
          )}

          {record.action === 'replace' && (record.newPartName || record.oldPartSerial) && (
            <Card style={{ borderRadius: 12, marginBottom: 16, borderLeft: `4px solid ${accentColor}` }}
              title={<Space><SwapOutlined style={{ color: accentColor }} /><Text strong style={{ color: accentColor }}>Thông tin linh kiện thay thế</Text></Space>}>
              <Row gutter={[16, 16]}>
                {record.oldPartSerial && (
                  <Col span={12}>
                    <div style={{ padding: '12px 14px', background: '#fff1f0', borderRadius: 8, border: '1px solid #ffa39e', height: '100%' }}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Linh kiện tháo ra (cũ)</Text>
                      <Text strong style={{ color: '#cf1322', fontSize: 13 }}>Serial: {record.oldPartSerial}</Text>
                    </div>
                  </Col>
                )}
                {record.newPartName && (
                  <Col span={record.oldPartSerial ? 12 : 24}>
                    <div style={{ padding: '12px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', height: '100%' }}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Linh kiện lắp vào (mới)</Text>
                      <Text strong style={{ color: '#389e0d', fontSize: 13 }}>{record.newPartName}</Text>
                      {record.newPartSerial && <div style={{ marginTop: 4 }}><Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>Serial: {record.newPartSerial}</Text></div>}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {record.action === 'upgrade' && (
            <Card style={{ borderRadius: 12, marginBottom: 16, borderLeft: `4px solid ${accentColor}` }}
              title={<Space><RocketOutlined style={{ color: accentColor }} /><Text strong style={{ color: accentColor }}>Thông tin nâng cấp</Text></Space>}>
              {record.upgradeVersion && (
                <div style={{ padding: '10px 14px', background: '#f9f0ff', borderRadius: 8, border: '1px solid #d3adf7', marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Phiên bản nâng cấp</Text>
                  <div><Text strong style={{ color: '#531dab', fontSize: 14 }}>{record.upgradeVersion}</Text></div>
                </div>
              )}
              {record.method && (
                <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: record.steps?.length ? 12 : 0 }}>
                  <Text style={{ fontSize: 13 }}>{record.method}</Text>
                </div>
              )}
              {record.steps && record.steps.length > 0 && (
                <>
                  <Text strong style={{ color: colors.navy, fontSize: 12, display: 'block', marginBottom: 8 }}>Các bước thực hiện</Text>
                  <Timeline
                    items={record.steps.map((step, i) => ({
                      dot: <div style={{ width: 20, height: 20, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</div>,
                      children: <Text style={{ fontSize: 13 }}>{step}</Text>,
                    }))}
                  />
                </>
              )}
            </Card>
          )}

          {/* Materials used */}
          {record.materialsUsed && record.materialsUsed.length > 0 && (
            <Card style={{ borderRadius: 12, marginBottom: 16 }}
              title={<Text strong style={{ color: colors.navy }}>Vật tư / linh kiện sử dụng</Text>}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {record.materialsUsed.map((m, i) => (
                  <div key={i} style={{ padding: '5px 12px', background: '#eff6ff', borderRadius: 20, border: '1px solid #bfdbfe', fontSize: 12, color: colors.navy }}>
                    {m}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quality check */}
          {record.qualityCheckResult && (
            <Card style={{ borderRadius: 12, marginBottom: 16, borderLeft: '4px solid #16a34a' }}
              title={<Space><SafetyCertificateOutlined style={{ color: '#16a34a' }} /><Text strong style={{ color: '#16a34a' }}>Kết quả kiểm tra chất lượng</Text></Space>}>
              <div style={{ padding: '10px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Text style={{ fontSize: 13 }}>{record.qualityCheckResult}</Text>
              </div>
              {record.approvedBy && (
                <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>Phê duyệt: </Text><Text strong style={{ fontSize: 12 }}>{record.approvedBy}</Text></div>
                  {record.approvedDate && <div><Text type="secondary" style={{ fontSize: 12 }}>Ngày: </Text><Text strong style={{ fontSize: 12 }}>{formatDate(record.approvedDate)}</Text></div>}
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          {record.notes && (
            <Card style={{ borderRadius: 12, marginBottom: 16 }} title={<Text strong style={{ color: colors.navy }}>Ghi chú</Text>}>
              <div style={{ padding: '10px 14px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                <Text style={{ fontSize: 13 }}>{record.notes}</Text>
              </div>
            </Card>
          )}
        </Col>

        {/* Right sidebar */}
        <Col xs={24} lg={8}>
          {/* Component info */}
          {comp && (
            <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
              title={<Space><AuditOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy, fontSize: 13 }}>Thông tin cấu phần</Text></Space>}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                <div><Text type="secondary" style={{ fontSize: 11 }}>Tên cấu phần</Text><div><Text strong style={{ fontSize: 13 }}>{comp.name}</Text></div></div>
                <div><Text type="secondary" style={{ fontSize: 11 }}>Mã cấu phần</Text><div><Text strong style={{ fontFamily: 'monospace', fontSize: 12, color: colors.navy }}>{comp.code}</Text></div></div>
                <div><Text type="secondary" style={{ fontSize: 11 }}>Nhóm hệ thống</Text><div><Text style={{ fontSize: 12 }}>{comp.systemGroup}</Text></div></div>
                <div><Text type="secondary" style={{ fontSize: 11 }}>Vị trí lắp đặt</Text><div><Text style={{ fontSize: 12 }}>{comp.position}</Text></div></div>
                {comp.serialNumber && <div><Text type="secondary" style={{ fontSize: 11 }}>Serial</Text><div><Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{comp.serialNumber}</Text></div></div>}
              </div>
            </Card>
          )}

          {/* Inspection result */}
          {inspection && (
            <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
              title={<Space><SafetyCertificateOutlined style={{ color: '#7c3aed' }} /><Text strong style={{ color: '#7c3aed', fontSize: 13 }}>Kết quả kiểm tra KT</Text></Space>}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Phiếu KT</Text>
                  <Text strong style={{ fontSize: 12, color: '#7c3aed' }}>{inspection.id}</Text>
                </div>
                {inspection.measuredValue && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Giá trị đo</Text>
                    <div><Text strong style={{ fontSize: 12 }}>{inspection.measuredValue}</Text></div>
                    {inspection.technicalLimit && <Text type="secondary" style={{ fontSize: 11 }}>Giới hạn: {inspection.technicalLimit}</Text>}
                  </div>
                )}
                {inspection.comparisonNote && (
                  <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                    <Text style={{ fontSize: 11, color: '#555' }}>{inspection.comparisonNote.substring(0, 150)}{inspection.comparisonNote.length > 150 ? '...' : ''}</Text>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Kết luận KT</Text>
                  {inspection.disposition && (
                    <Tag color={inspection.disposition === 'replace' ? 'blue' : inspection.disposition === 'restore' ? 'cyan' : 'purple'} style={{ fontSize: 11 }}>
                      {inspection.disposition === 'restore' ? 'Phục hồi' : inspection.disposition === 'replace' ? 'Thay thế' : 'Nâng cấp'}
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Key dates */}
          <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Space><CalendarOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy, fontSize: 13 }}>Tiến độ thời gian</Text></Space>}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {[
                { label: 'Bắt đầu thực hiện', value: formatDate(record.startDate), color: '#0891b2', done: true },
                { label: 'Kết thúc thực hiện', value: record.endDate ? formatDate(record.endDate) : 'Đang thực hiện', color: record.endDate ? '#16a34a' : '#d97706', done: !!record.endDate },
                { label: 'Phê duyệt kỹ thuật', value: record.approvedDate ? formatDate(record.approvedDate) : 'Chờ phê duyệt', color: record.approvedDate ? '#16a34a' : '#888', done: !!record.approvedDate },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: item.done ? item.color : '#f0f0f0', border: `2px solid ${item.done ? item.color : '#d9d9d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.done ? '#fff' : '#bbb', fontSize: 12, flexShrink: 0 }}>
                    {item.done ? '✓' : <ClockCircleOutlined />}
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>{item.label}</Text>
                    <div><Text strong style={{ fontSize: 12, color: item.color }}>{item.value}</Text></div>
                  </div>
                </div>
              ))}
              {record.readyForAssembly && (
                <div style={{ padding: '8px 10px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  <Text strong style={{ color: '#16a34a', fontSize: 12 }}>Sẵn sàng lắp ráp</Text>
                </div>
              )}
            </div>
          </Card>

          {/* Performer */}
          <Card size="small" style={{ borderRadius: 12 }}
            title={<Space><UserOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy, fontSize: 13 }}>Người thực hiện</Text></Space>}>
            <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <Text strong style={{ fontSize: 13 }}>{record.performedBy}</Text>
            </div>
            {record.approvedBy && (
              <div style={{ marginTop: 8, padding: '10px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Phê duyệt</Text>
                <div><Text strong style={{ fontSize: 12, color: '#389e0d' }}>{record.approvedBy}</Text></div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Update progress Drawer */}
      <Drawer
        title={<Space><EditOutlined style={{ color: accentColor }} /><Text strong style={{ color: accentColor }}>Cập nhật tiến độ — {record.id}</Text></Space>}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480} destroyOnClose>
        <Form form={drawerForm} layout="vertical">
          <Alert type="info" showIcon
            message="Bước 3–5: Cập nhật quá trình thực hiện"
            description="Ghi nhận tiến độ, kết quả kiểm tra sau xử lý và thông tin phê duyệt."
            style={{ marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8 }}
          />

          <Form.Item label="Trạng thái thực hiện" name="status">
            <Select options={[
              { value: 'pending', label: 'Chờ thực hiện' },
              { value: 'in_progress', label: 'Đang thực hiện' },
              { value: 'completed', label: 'Hoàn thành' },
            ]} style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Ngày kết thúc" name="endDate">
            <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Kết quả kiểm tra chất lượng (Bước 4)" name="qualityCheckResult">
            <TextArea rows={3} placeholder="Ghi rõ giá trị đo đạt, so sánh với yêu cầu kỹ thuật..." style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Form.Item label="Người phê duyệt (Bước 5)" name="approvedBy">
            <Input placeholder="Kỹ sư / Phụ trách kỹ thuật phê duyệt" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Ngày phê duyệt" name="approvedDate">
            <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Ghi chú bổ sung" name="notes">
            <TextArea rows={2} placeholder="Lưu ý kỹ thuật, vấn đề phát sinh..." style={{ borderRadius: 6, fontSize: 12 }} />
          </Form.Item>

          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Space>
              <Button type="primary" style={{ background: accentColor, borderColor: accentColor }} onClick={() => setDrawerOpen(false)}>
                Lưu cập nhật
              </Button>
            </Space>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default RestorationDetail;
