import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions, Divider,
  Drawer, Form, Input, Select, DatePicker, Alert, Timeline, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, EditOutlined, PlusOutlined, FileTextOutlined,
  SendOutlined, PartitionOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { technicalInspections } from '../../data/technicalInspections';
import { overhaulOrders } from '../../data/overhaulOrders';
import { components } from '../../data/components';
import { restorations } from '../../data/restorations';
import { inspectionTypeConfig, dispositionActionConfig, componentStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { InspectionResult, DispositionAction } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusMap: Record<string, { label: string; color: string }> = {
  requested:   { label: 'Đã yêu cầu',    color: '#2563eb' },
  in_progress: { label: 'Đang kiểm tra', color: '#7c3aed' },
  completed:   { label: 'Hoàn thành',    color: '#16a34a' },
};

const resultMap: Record<string, { label: string; color: string }> = {
  pass:     { label: 'Đạt',           color: '#16a34a' },
  fail:     { label: 'Không đạt',     color: '#dc2626' },
  marginal: { label: 'Cận giới hạn',  color: '#d97706' },
};

const resultBg: Record<string, { bg: string; border: string }> = {
  pass:     { bg: '#f6ffed', border: '#52c41a' },
  fail:     { bg: '#fff2f0', border: '#ff4d4f' },
  marginal: { bg: '#fffbe6', border: '#faad14' },
};

const TechnicalInspectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resultDrawerOpen, setResultDrawerOpen] = useState(false);
  const [resultForm] = Form.useForm();

  const inspection = technicalInspections.find(i => i.id === id);
  const order = overhaulOrders.find(o => inspection && o.id === inspection.orderId);
  const component = components.find(c => inspection && c.id === inspection.componentId);
  const existingRestoration = restorations.find(r => inspection && r.componentId === inspection.componentId);

  // Lịch sử kiểm tra cùng cấu phần (các lần đại tu khác)
  const sameComponentHistory = technicalInspections.filter(i =>
    i.componentId === inspection?.componentId && i.id !== inspection?.id
  );

  if (!inspection) return <div>Không tìm thấy phiếu kiểm tra.</div>;

  const typeCfg = inspectionTypeConfig[inspection.inspectionType];
  const statusCfg = statusMap[inspection.status];
  const resultCfg = inspection.result ? resultMap[inspection.result] : null;
  const dispositionCfg = inspection.disposition ? dispositionActionConfig[inspection.disposition] : null;
  const rbg = inspection.result ? resultBg[inspection.result] : { bg: '#eff6ff', border: '#bfdbfe' };

  const resultIcon = inspection.result === 'pass'
    ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
    : inspection.result === 'fail'
    ? <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
    : inspection.result === 'marginal'
    ? <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
    : null;

  const canInputResult = inspection.status === 'requested' || inspection.status === 'in_progress';
  const canCreateRestoration = inspection.status === 'completed'
    && inspection.disposition && inspection.disposition !== 'serviceable'
    && !existingRestoration;

  return (
    <div>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/technical-inspections')} style={{ borderRadius: 8 }}>Quay lại</Button>
            <Space size={8}>
              <AuditOutlined style={{ color: colors.navy, fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: colors.navy }}>{inspection.id} — {inspection.componentName}</Title>
              <Tag color={statusCfg?.color}>{statusCfg?.label}</Tag>
              {resultCfg && <Tag color={resultCfg.color}>{resultCfg.label}</Tag>}
            </Space>
          </Space>
        </Col>
        <Col>
          <Space>
            {canInputResult && (
              <Button type="primary" icon={<EditOutlined />}
                style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                onClick={() => setResultDrawerOpen(true)}>
                Nhập kết quả
              </Button>
            )}
            {canCreateRestoration && (
              <Button type="primary" icon={<PlusOutlined />}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => navigate('/restorations/new')}>
                Tạo phiếu phục hồi
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>

          {/* Thông tin yêu cầu kiểm tra */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Text strong style={{ color: colors.navy }}>Thông tin yêu cầu kiểm tra</Text>}>
            <Descriptions column={3} size="small" labelStyle={{ color: '#888', fontWeight: 500 }}>
              <Descriptions.Item label="Mã phiếu"><Text strong>{inspection.id}</Text></Descriptions.Item>
              <Descriptions.Item label="Cấu phần"><Text strong>{inspection.componentName}</Text></Descriptions.Item>
              <Descriptions.Item label="Lệnh đại tu">
                <Text strong style={{ color: colors.navy }}>{order?.code || inspection.orderId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại kiểm tra">
                <Tag color={typeCfg?.color}>{typeCfg?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phân hệ chuyên môn">
                {inspection.externalSystem ? <Tag color="#2563eb">{inspection.externalSystem}</Tag> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị thực hiện">
                {inspection.inspectionUnit || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Người yêu cầu">{inspection.requestedBy}</Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">{inspection.performedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg?.color}>{statusCfg?.label}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Timeline luồng kiểm tra */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Text strong style={{ color: colors.navy }}>Tiến trình kiểm tra</Text>}>
            <Timeline
              items={[
                {
                  color: '#16a34a',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13 }}>Tạo yêu cầu kiểm tra</Text>
                      <div style={{ fontSize: 12, color: '#888' }}>{formatDate(inspection.requestDate)} · {inspection.requestedBy}</div>
                    </div>
                  ),
                },
                {
                  color: inspection.sentDate ? '#2563eb' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: inspection.sentDate ? colors.navy : '#aaa' }}>Gửi đến phân hệ chuyên môn</Text>
                      {inspection.sentDate
                        ? <div style={{ fontSize: 12, color: '#888' }}>{formatDate(inspection.sentDate)} · {inspection.externalSystem || inspection.inspectionUnit}</div>
                        : <div style={{ fontSize: 12, color: '#bbb' }}>Chưa gửi</div>}
                    </div>
                  ),
                },
                {
                  color: inspection.receivedResultDate ? '#7c3aed' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: inspection.receivedResultDate ? '#7c3aed' : '#aaa' }}>Nhận kết quả về</Text>
                      {inspection.receivedResultDate
                        ? <div style={{ fontSize: 12, color: '#888' }}>{formatDate(inspection.receivedResultDate)}</div>
                        : <div style={{ fontSize: 12, color: '#bbb' }}>Chưa nhận</div>}
                    </div>
                  ),
                },
                {
                  color: inspection.result ? (inspection.result === 'pass' ? '#16a34a' : inspection.result === 'fail' ? '#dc2626' : '#d97706') : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: inspection.result ? resultCfg?.color : '#aaa' }}>Kết luận xử lý</Text>
                      {inspection.disposition
                        ? <div style={{ marginTop: 4 }}><Tag color={dispositionCfg?.color}>{dispositionCfg?.label}</Tag></div>
                        : <div style={{ fontSize: 12, color: '#bbb' }}>Chưa có kết luận</div>}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Kết quả kiểm tra */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Text strong style={{ color: colors.navy }}>Kết quả kiểm tra</Text>}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ background: '#eff6ff', borderRadius: 8, padding: '16px', marginBottom: 12, border: '1px solid #bfdbfe' }}>
                  <Text strong style={{ color: '#555', display: 'block', marginBottom: 8, fontSize: 12 }}>Giá trị đo được:</Text>
                  <Text style={{ fontSize: 16, fontWeight: 700, color: colors.navy }}>
                    {inspection.measuredValue || 'Chưa đo'}
                  </Text>
                  {inspection.technicalLimit && (
                    <>
                      <Divider style={{ margin: '10px 0' }} />
                      <Text style={{ color: '#888', fontSize: 12 }}>Giới hạn kỹ thuật: </Text>
                      <Text style={{ fontWeight: 600, fontSize: 12, color: colors.navy }}>{inspection.technicalLimit}</Text>
                    </>
                  )}
                </div>
                {inspection.comparisonNote && (
                  <div style={{ background: '#fffbe6', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a' }}>
                    <Text strong style={{ fontSize: 12, color: '#92400e' }}>Nhận xét so sánh: </Text>
                    <Text style={{ fontSize: 12 }}>{inspection.comparisonNote}</Text>
                  </div>
                )}
              </Col>
              <Col span={12}>
                <div style={{ background: rbg.bg, borderRadius: 8, padding: '16px', borderLeft: `4px solid ${rbg.border}`, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    {resultIcon}
                    <Text strong style={{ fontSize: 16 }}>
                      {resultCfg ? resultCfg.label : 'Chưa có kết quả'}
                    </Text>
                  </div>
                  {dispositionCfg && (
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ color: '#888', fontSize: 12 }}>Kết luận xử lý: </Text>
                      <Tag color={dispositionCfg.color}>{dispositionCfg.label}</Tag>
                    </div>
                  )}
                  {inspection.completedDate && (
                    <div>
                      <Text style={{ color: '#888', fontSize: 12 }}>Ngày hoàn thành: </Text>
                      <Text style={{ fontSize: 12 }}>{formatDate(inspection.completedDate)}</Text>
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            {inspection.notes && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Text strong style={{ color: '#555', fontSize: 12 }}>Ghi chú kỹ thuật: </Text>
                <Text style={{ fontSize: 13 }}>{inspection.notes}</Text>
              </>
            )}
          </Card>

          {/* Biên bản & tài liệu đính kèm */}
          {inspection.attachments && inspection.attachments.length > 0 && (
            <Card style={{ borderRadius: 12, marginBottom: 16 }}
              title={<Text strong style={{ color: colors.navy }}>Biên bản & Tài liệu đính kèm</Text>}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                {inspection.attachments.map((file, i) => (
                  <div key={i} style={{ padding: '8px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <FileTextOutlined style={{ color: '#2563eb' }} />
                    <Text style={{ fontSize: 12, color: '#2563eb' }}>{file}</Text>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>

          {/* Thông tin cấu phần liên quan */}
          <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
            title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>
              <PartitionOutlined style={{ marginRight: 6 }} />Cấu phần liên quan
            </Text>}>
            {component ? (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                <Row justify="space-between">
                  <Text type="secondary" style={{ fontSize: 12 }}>Mã cấu phần</Text>
                  <Text strong style={{ fontSize: 12, color: colors.navy }}>{component.code}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhóm hệ thống</Text>
                  <Text style={{ fontSize: 12 }}>{component.systemGroup}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary" style={{ fontSize: 12 }}>Vị trí lắp đặt</Text>
                  <Text style={{ fontSize: 12 }}>{component.position}</Text>
                </Row>
                {component.serialNumber && (
                  <Row justify="space-between">
                    <Text type="secondary" style={{ fontSize: 12 }}>Serial</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'monospace', color: colors.navy }}>{component.serialNumber}</Text>
                  </Row>
                )}
                <Divider style={{ margin: '4px 0' }} />
                <Row justify="space-between" align="middle">
                  <Text type="secondary" style={{ fontSize: 12 }}>Trạng thái</Text>
                  <Tag color={componentStatusConfig[component.status]?.color} style={{ margin: 0 }}>
                    {componentStatusConfig[component.status]?.label}
                  </Tag>
                </Row>
                <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe', marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: '#555' }}>{component.condition}</Text>
                </div>
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>Không tìm thấy thông tin cấu phần</Text>
            )}
          </Card>

          {/* Phiếu phục hồi liên quan */}
          {existingRestoration && (
            <Card size="small" style={{ borderRadius: 12, marginBottom: 16, borderLeft: '4px solid #16a34a' }}
              title={<Text strong style={{ color: '#16a34a', fontSize: 13 }}>Phiếu phục hồi đã tạo</Text>}>
              <Row justify="space-between" style={{ marginBottom: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Mã phiếu</Text>
                <Text strong style={{ fontSize: 12, color: colors.navy }}>{existingRestoration.id}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Hành động</Text>
                <Tag color={dispositionActionConfig[existingRestoration.action as keyof typeof dispositionActionConfig]?.color}>
                  {dispositionActionConfig[existingRestoration.action as keyof typeof dispositionActionConfig]?.label}
                </Tag>
              </Row>
              <Button size="small" type="link" style={{ padding: 0, fontSize: 12 }}
                onClick={() => navigate(`/restorations/${existingRestoration.id}`)}>
                Xem chi tiết phiếu phục hồi →
              </Button>
            </Card>
          )}

          {/* Lịch sử kiểm tra cùng cấu phần */}
          {sameComponentHistory.length > 0 && (
            <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>
                <InfoCircleOutlined style={{ marginRight: 6 }} />Lịch sử kiểm tra
              </Text>}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {sameComponentHistory.map(h => (
                  <div key={h.id} style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <Row justify="space-between" align="middle">
                      <Text style={{ fontSize: 12, fontWeight: 500 }}>{h.id}</Text>
                      {h.result && <Tag color={resultMap[h.result]?.color} style={{ margin: 0, fontSize: 11 }}>{resultMap[h.result]?.label}</Tag>}
                    </Row>
                    <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(h.requestDate)}</Text>
                    {h.measuredValue && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{h.measuredValue}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Cảnh báo khi chờ nhập kết quả */}
          {canInputResult && (
            <Alert
              type="warning" showIcon
              message="Chờ nhập kết quả"
              description="Khi nhận được kết quả từ phân hệ chuyên môn, nhấn 'Nhập kết quả' để cập nhật và xác định hướng xử lý."
              style={{ borderRadius: 10 }}
            />
          )}

          {/* Gợi ý tạo phiếu phục hồi */}
          {canCreateRestoration && (
            <Alert
              type="info" showIcon
              message="Cần tạo phiếu phục hồi"
              description={`Kết luận "${dispositionCfg?.label}" — chưa có phiếu phục hồi cho cấu phần này.`}
              action={
                <Button size="small" type="primary" icon={<PlusOutlined />}
                  style={{ background: '#16a34a', borderColor: '#16a34a', marginTop: 8 }}
                  onClick={() => navigate('/restorations')}>
                  Tạo ngay
                </Button>
              }
              style={{ borderRadius: 10 }}
            />
          )}
        </Col>
      </Row>

      {/* Drawer nhập kết quả */}
      <Drawer
        title={
          <Space>
            <EditOutlined style={{ color: '#7c3aed' }} />
            <Text strong>Nhập kết quả kiểm tra — {inspection.id}</Text>
          </Space>
        }
        open={resultDrawerOpen}
        onClose={() => setResultDrawerOpen(false)}
        width={520}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setResultDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" icon={<SendOutlined />}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
              onClick={() => setResultDrawerOpen(false)}>
              Lưu kết quả
            </Button>
          </div>
        }
      >
        <Form form={resultForm} layout="vertical">
          <Alert
            type="info" showIcon
            message="Bước 3, 4, 5: Nhận kết quả, so sánh và xác định hướng xử lý"
            style={{ borderRadius: 8, marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}
          />

          <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: 16 }}>
            <Text strong style={{ fontSize: 12, color: colors.navy }}>{inspection.componentName}</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color={typeCfg?.color}>{typeCfg?.label}</Tag>
              {inspection.technicalLimit && (
                <Text style={{ fontSize: 12 }}> · Giới hạn KT: <Text strong>{inspection.technicalLimit}</Text></Text>
              )}
            </div>
          </div>

          <Divider orientation="left" style={{ fontSize: 13, color: colors.navy }}>Bước 3 — Nhận kết quả</Divider>

          <Form.Item label="Người thực hiện kiểm tra" name="performedBy"
            rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder="Họ tên KTV hoặc đơn vị thực hiện" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Ngày nhận kết quả" name="receivedResultDate"
            rules={[{ required: true, message: 'Bắt buộc' }]}>
            <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Ngày hoàn thành" name="completedDate">
            <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13, color: colors.navy }}>Bước 4 — Giá trị đo & So sánh</Divider>

          <Form.Item label="Giá trị đo được" name="measuredValue"
            rules={[{ required: true, message: 'Bắt buộc' }]}
            extra="Ví dụ: 32 kW, 0.08 mm, −42 dBm, 28.3 V">
            <Input placeholder="Nhập giá trị đo thực tế..." style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Ghi chú so sánh với giới hạn KT" name="comparisonNote">
            <TextArea rows={2} placeholder="Nhận xét về mức độ lệch so với tiêu chuẩn..." style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label="Kết quả kiểm tra" name="result"
            rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Select placeholder="Chọn kết quả" style={{ borderRadius: 6 }}
              options={[
                { value: 'pass',     label: '✓ Đạt' },
                { value: 'marginal', label: '⚠ Cận giới hạn' },
                { value: 'fail',     label: '✗ Không đạt' },
              ]}
            />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13, color: colors.navy }}>Bước 5 — Xác định hướng xử lý</Divider>

          <Form.Item label="Kết luận xử lý (Disposition)" name="disposition"
            rules={[{ required: true, message: 'Bắt buộc' }]}
            extra="Quyết định hướng xử lý tiếp theo cho cấu phần">
            <Select placeholder="Chọn hướng xử lý" style={{ borderRadius: 6 }}
              options={[
                { value: 'serviceable', label: '✓ Giữ lại — Đạt tiêu chuẩn sử dụng' },
                { value: 'restore',     label: '⚙ Phục hồi — Sửa chữa, hiệu chỉnh' },
                { value: 'replace',     label: '↻ Thay mới — Hỏng, không phục hồi được' },
                { value: 'upgrade',     label: '↑ Nâng cấp — Đưa vào kế hoạch nâng cấp' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Ghi chú kỹ thuật" name="notes">
            <TextArea rows={3} placeholder="Ghi chú thêm về phương pháp kiểm tra, phát hiện đặc biệt..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default TechnicalInspectionDetail;
