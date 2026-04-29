import React, { useState } from 'react';
import {
  Card, Button, Space, Tag, Typography, Row, Col,
  Descriptions, Timeline, Modal, Form, DatePicker,
  InputNumber, Select, Input, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, ClockCircleOutlined, WarningOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, DeleteOutlined,
  RollbackOutlined, StopOutlined, CalendarOutlined,
  InboxOutlined, TagOutlined, FieldTimeOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { LifecycleStatus, LifecycleEventType } from '../../types';
import { lifecycleRecords } from '../../data/lifecycle';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Status config ────────────────────────────────────────
const statusConfig: Record<LifecycleStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  valid:       { label: 'Còn hạn',     color: '#52c41a', bg: 'rgba(82,196,26,0.12)',  icon: <CheckCircleOutlined /> },
  near_expiry: { label: 'Sắp hết hạn', color: '#faad14', bg: 'rgba(250,173,20,0.12)', icon: <WarningOutlined /> },
  expired:     { label: 'Hết hạn',     color: '#ff4d4f', bg: 'rgba(255,77,79,0.12)',  icon: <ExclamationCircleOutlined /> },
  disposed:    { label: 'Đã thanh lý', color: 'default', bg: 'rgba(0,0,0,0.06)',      icon: <DeleteOutlined /> },
  recalled:    { label: 'Đã thu hồi',  color: '#722ed1', bg: 'rgba(114,46,209,0.1)',  icon: <RollbackOutlined /> },
};

const eventTypeConfig: Record<LifecycleEventType, { label: string; color: string }> = {
  registered:     { label: 'Đăng ký',     color: '#1B3A5C' },
  warning_issued: { label: 'Cảnh báo',    color: '#faad14' },
  recalled:       { label: 'Thu hồi',     color: '#722ed1' },
  disposed:       { label: 'Thanh lý',    color: 'default' },
  transferred:    { label: 'Điều chuyển', color: '#1677ff' },
  extended:       { label: 'Gia hạn',     color: '#52c41a' },
  checked:        { label: 'Kiểm tra',    color: '#13c2c2' },
};

const LifecycleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<'extend' | 'recall' | 'dispose' | null>(null);
  const [form] = Form.useForm();

  const record = lifecycleRecords.find(r => r.id === id);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} type="secondary">Không tìm thấy bản ghi</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/lifecycle')}>Quay lại</Button>
      </div>
    );
  }

  const sCfg = statusConfig[record.status];

  // ── Banner gradient by status ─────────────────────────────
  const bannerGradient: Record<LifecycleStatus, string> = {
    valid:       'linear-gradient(135deg, #237804 0%, #52c41a 100%)',
    near_expiry: 'linear-gradient(135deg, #d46b08 0%, #faad14 100%)',
    expired:     'linear-gradient(135deg, #a8071a 0%, #ff4d4f 100%)',
    disposed:    'linear-gradient(135deg, #434343 0%, #8c8c8c 100%)',
    recalled:    'linear-gradient(135deg, #391085 0%, #722ed1 100%)',
  };

  // ── Action buttons ────────────────────────────────────────
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    if (record.status === 'valid' || record.status === 'near_expiry') {
      actions.push(
        <Button
          key="extend"
          icon={<ClockCircleOutlined />}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
          onClick={() => { setModalType('extend'); form.resetFields(); }}
        >
          Gia hạn sử dụng
        </Button>
      );
    }

    if (record.status === 'near_expiry' || record.status === 'expired') {
      actions.push(
        <Button
          key="recall"
          icon={<RollbackOutlined />}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
          onClick={() => { setModalType('recall'); form.resetFields(); }}
        >
          Thu hồi
        </Button>
      );
    }

    if (record.status === 'expired' || record.status === 'recalled') {
      actions.push(
        <Button
          key="dispose"
          icon={<DeleteOutlined />}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
          onClick={() => { setModalType('dispose'); form.resetFields(); }}
        >
          Thanh lý
        </Button>
      );
    }

    return actions;
  };

  // ── Days remaining label ──────────────────────────────────
  const daysLabel = () => {
    if (record.status === 'disposed') return 'Đã thanh lý';
    if (record.status === 'recalled') return 'Đã thu hồi';
    const d = record.daysRemaining;
    if (d < 0) return `Quá hạn ${Math.abs(d)} ngày`;
    return `Còn ${d} ngày`;
  };

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ── Banner ── */}
      <div style={{
        background: bannerGradient[record.status],
        borderRadius: 14,
        padding: '24px 28px',
        color: '#fff',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 28, top: 20, fontSize: 120, opacity: 0.07 }}>
          <FieldTimeOutlined />
        </div>
        <Space style={{ marginBottom: 14 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/lifecycle')}
            style={{ color: 'rgba(255,255,255,0.8)', padding: '0 8px 0 0' }}
          >
            Vòng đời & Hạn sử dụng
          </Button>
        </Space>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Space align="center" size={12} style={{ marginBottom: 8 }}>
              <Tag style={{
                background: sCfg.bg, color: sCfg.color,
                border: `1px solid ${sCfg.color}44`, fontWeight: 600, fontSize: 12,
              }}>
                {sCfg.icon} {sCfg.label}
              </Tag>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 11 }}>
                {record.trackingType === 'serial' ? 'Serial' : 'Lô hàng'}
              </Tag>
            </Space>
            <Title level={4} style={{ color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
              {record.productName}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {record.productCode} &nbsp;·&nbsp; {record.trackingCode}
            </Text>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {/* Expiry countdown */}
            <div style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 18px',
              marginBottom: 12, minWidth: 160, textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Hạn sử dụng
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                {new Date(record.expiryDate).toLocaleDateString('vi-VN')}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{daysLabel()}</div>
            </div>
            <Space>{renderActions()}</Space>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* ── Left column ── */}
        <Col xs={24} lg={15}>
          {/* Basic info */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TagOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Thông tin vật tư</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '12px 20px 16px' } }}
          >
            <Descriptions size="small" column={2} labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Mã vật tư">{record.productCode}</Descriptions.Item>
              <Descriptions.Item label="Nhóm">{record.productCategory}</Descriptions.Item>
              <Descriptions.Item label="Tên vật tư" span={2}>{record.productName}</Descriptions.Item>
              <Descriptions.Item label="Loại theo dõi">
                <Tag color={record.trackingType === 'serial' ? '#1B3A5C' : '#2d5a8e'} style={{ fontSize: 11 }}>
                  {record.trackingType === 'serial' ? 'Serial' : 'Lô hàng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã lô / Serial">{record.trackingCode}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{record.quantity.toLocaleString('vi-VN')} {record.unit}</Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{record.supplier ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Phiếu nhập">{record.inboundOrderCode ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Kho lưu">{record.warehouseName ?? '—'}</Descriptions.Item>
              {record.location && (
                <Descriptions.Item label="Vị trí">{record.location}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Timeline */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FieldTimeOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Lịch sử sự kiện</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '8px 20px 20px' } }}
          >
            <Timeline
              style={{ marginTop: 16 }}
              items={[...record.events].reverse().map(ev => {
                const evCfg = eventTypeConfig[ev.type];
                return {
                  color: evCfg.color,
                  children: (
                    <div style={{ paddingBottom: 4 }}>
                      <Space size={8} style={{ marginBottom: 2 }}>
                        <Tag color={evCfg.color} style={{ fontSize: 10, fontWeight: 600, margin: 0 }}>
                          {evCfg.label}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(ev.date).toLocaleDateString('vi-VN')}
                        </Text>
                        {ev.department && (
                          <Text type="secondary" style={{ fontSize: 11 }}>· {ev.department}</Text>
                        )}
                      </Space>
                      <div style={{ fontSize: 13 }}>{ev.actor}</div>
                      {ev.note && <Text type="secondary" style={{ fontSize: 12 }}>{ev.note}</Text>}
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>

        {/* ── Right column ── */}
        <Col xs={24} lg={9}>
          {/* Expiry details */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Thông tin hạn sử dụng</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '12px 20px 16px' } }}
          >
            <Descriptions size="small" column={1} labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              {record.manufactureDate && (
                <Descriptions.Item label="Ngày sản xuất">
                  {new Date(record.manufactureDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày nhận kho">
                {new Date(record.receivedDate).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn sử dụng">
                <Text style={{ color: sCfg.color, fontWeight: 600 }}>
                  {new Date(record.expiryDate).toLocaleDateString('vi-VN')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngưỡng cảnh báo">
                {record.warningDays} ngày trước hạn
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            {/* Status badge */}
            <div style={{
              background: sCfg.bg, borderRadius: 10, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 28, color: sCfg.color }}>{sCfg.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: sCfg.color, fontSize: 14 }}>{sCfg.label}</div>
                <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>{daysLabel()}</div>
              </div>
            </div>
          </Card>

          {/* Storage */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <InboxOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Lưu kho</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '12px 20px 16px' } }}
          >
            <Descriptions size="small" column={1} labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Kho">{record.warehouseName ?? '—'}</Descriptions.Item>
              {record.location && <Descriptions.Item label="Vị trí">{record.location}</Descriptions.Item>}
              <Descriptions.Item label="Số lượng còn lại">
                <Text strong>{record.quantity.toLocaleString('vi-VN')} {record.unit}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{record.supplier ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Phiếu nhập">{record.inboundOrderCode ?? '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* ── Modals ── */}
      {/* Gia hạn */}
      <Modal
        open={modalType === 'extend'}
        title={<Space><ClockCircleOutlined style={{ color: '#1677ff' }} /> Gia hạn sử dụng</Space>}
        onCancel={() => setModalType(null)}
        onOk={() => setModalType(null)}
        okText="Xác nhận gia hạn"
        cancelText="Hủy"
        width={480}
      >
        <Form form={form} layout="vertical" size="small" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Ngày gia hạn đến" name="newExpiryDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={d => d.isBefore(dayjs())} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số tháng gia hạn" name="extendMonths">
                <InputNumber min={1} max={60} style={{ width: '100%' }} addonAfter="tháng" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Số biên bản / quyết định" name="docRef" rules={[{ required: true, message: 'Nhập số văn bản' }]}>
            <Input placeholder="VD: BB-GH-2026-001" />
          </Form.Item>
          <Form.Item label="Cơ quan kiểm định" name="certBody">
            <Input placeholder="VD: Trung tâm Đo lường Quân khu" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Lý do gia hạn, kết quả kiểm tra..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Thu hồi */}
      <Modal
        open={modalType === 'recall'}
        title={<Space><RollbackOutlined style={{ color: '#d46b08' }} /> Thu hồi vật tư</Space>}
        onCancel={() => setModalType(null)}
        onOk={() => setModalType(null)}
        okText="Xác nhận thu hồi"
        cancelText="Hủy"
        okButtonProps={{ danger: false, style: { background: '#d46b08', borderColor: '#d46b08' } }}
        width={480}
      >
        <Form form={form} layout="vertical" size="small" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Ngày thu hồi" name="recallDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vị trí cách ly" name="isolationLocation">
                <Input placeholder="VD: Khu cách ly KV-01" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Lý do thu hồi" name="recallReason" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <Select options={[
              { value: 'expired', label: 'Hết hạn sử dụng' },
              { value: 'quality', label: 'Không đạt chất lượng' },
              { value: 'safety',  label: 'Nguy cơ an toàn' },
              { value: 'policy',  label: 'Theo quy định' },
            ]} placeholder="Chọn lý do" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Mô tả tình trạng, phương án xử lý..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Thanh lý */}
      <Modal
        open={modalType === 'dispose'}
        title={<Space><DeleteOutlined style={{ color: '#8c8c8c' }} /> Thanh lý vật tư</Space>}
        onCancel={() => setModalType(null)}
        onOk={() => setModalType(null)}
        okText="Xác nhận thanh lý"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#595959', borderColor: '#595959' } }}
        width={480}
      >
        <Form form={form} layout="vertical" size="small" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Ngày thanh lý" name="disposeDate" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phương thức" name="disposeMethod" rules={[{ required: true, message: 'Chọn phương thức' }]}>
                <Select options={[
                  { value: 'destroy',  label: 'Tiêu hủy' },
                  { value: 'return',   label: 'Trả nhà cung cấp' },
                  { value: 'transfer', label: 'Bàn giao đơn vị khác' },
                  { value: 'recycle',  label: 'Tái chế / thu hồi vật liệu' },
                ]} placeholder="Chọn phương thức" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Số quyết định thanh lý" name="decisionRef" rules={[{ required: true, message: 'Nhập số quyết định' }]}>
                <Input placeholder="VD: QĐ-TL-2026-015" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Người phê duyệt" name="approvedBy">
                <Input placeholder="VD: Phạm Quốc Hưng" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Mô tả quá trình, kết quả thanh lý..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LifecycleDetail;
