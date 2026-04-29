import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Space, Tag, Button, Alert,
  Descriptions, Timeline, Modal, Drawer, Form, Input, Select, DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined, SafetyOutlined,
  CheckCircleOutlined, ApartmentOutlined, TeamOutlined,
  UserOutlined, SendOutlined, CheckSquareOutlined, EditOutlined,
} from '@ant-design/icons';
import { safetyStandards } from '../../data/safetyStandards';
import {
  standardStatusConfig, standardScopeConfig,
  hazardCategoryConfig, formatDate,
} from '../../utils/format';
import type { SafetyStandardStatus } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Text } = Typography;
const { TextArea } = Input;

const moduleLabels: Record<string, { label: string; color: string }> = {
  san_xuat:   { label: 'Quản lý Sản xuất',  color: '#0891b2' },
  sua_chua:   { label: 'Quản lý Sửa chữa',  color: '#7c3aed' },
  dai_tu:     { label: 'Quản lý Đại tu',     color: '#d97706' },
  thu_nghiem: { label: 'Quản lý Thử nghiệm', color: '#059669' },
};

const workshopOptions = ['PX1','PX2','PX3','PX4'].map(v => ({ value: v, label: v }));

const SafetyStandardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSafety, isDirector } = useUser();
  const [form] = Form.useForm();

  const std = safetyStandards.find(s => s.id === id);

  const [localStatus, setLocalStatus]   = useState<SafetyStandardStatus | null>(null);
  const [approvedBy,  setApprovedBy]    = useState<string | null>(null);
  const [approvedAt,  setApprovedAt]    = useState<string | null>(null);
  const [modalType,   setModalType]     = useState<'send' | 'approve' | null>(null);
  const [editOpen,    setEditOpen]      = useState(false);
  const [modalForm]                     = Form.useForm();

  if (!std) {
    return (
      <Alert
        message="Không tìm thấy tiêu chuẩn"
        type="error" showIcon
        action={<Button onClick={() => navigate('/tieu-chuan')}>Quay lại</Button>}
      />
    );
  }

  const status      = localStatus ?? std.status;
  const stdApprovedBy = approvedBy ?? std.approvedBy;
  const stdApprovedAt = approvedAt ?? std.approvedAt;

  const statusCfg = standardStatusConfig[status];
  const scopeCfg  = standardScopeConfig[std.scope];
  const catCfg    = hazardCategoryConfig[std.hazardCategory];

  const confirmedCount = (std.distributionRecords ?? []).filter(r => r.confirmedAt).length;
  const linkedCount    = (std.linkedProcesses ?? []).length;
  const reqCount       = std.keyRequirements.length;

  const today = new Date().toISOString().split('T')[0];

  const handleModalOk = () => {
    modalForm.validateFields().then(values => {
      if (modalType === 'send') {
        setLocalStatus('pending_approval');
      } else if (modalType === 'approve') {
        setApprovedBy(values.approvedBy);
        setApprovedAt(today);
        setLocalStatus('active');
      }
      modalForm.resetFields();
      setModalType(null);
    });
  };

  return (
    <div>
      {/* ─── Hero header banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 60%, #2d5a8e 100%)',
        borderRadius: 14, marginBottom: 0, overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space align="center" size={14}>
            <button
              onClick={() => navigate('/tieu-chuan')}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}
            >
              <ArrowLeftOutlined />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <SafetyOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
                {std.title}
              </div>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {std.code}
                </Tag>
                <Tag style={{ background: 'rgba(212,168,67,0.2)', color: '#f0d890', border: '1px solid rgba(212,168,67,0.4)', borderRadius: 4, fontSize: 11 }}>
                  V{std.version}
                </Tag>
              </Space>
            </div>
          </Space>

          <Space size={8} style={{ flexShrink: 0, marginTop: 4 }}>
            <Tag color={statusCfg.color} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
            {isSafety && status !== 'retired' && status !== 'pending_approval' && status !== 'active' && (
              <Button
                icon={<EditOutlined />}
                onClick={() => { form.resetFields(); setEditOpen(true); }}
                style={{ borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                Chỉnh sửa
              </Button>
            )}
          </Space>
        </div>

        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Phạm vi',        value: <Tag style={{ color: scopeCfg.color, borderColor: scopeCfg.color, background: 'transparent', margin: 0 }}>{scopeCfg.label}</Tag> },
            { label: 'Loại nguy cơ',   value: <Tag style={{ color: catCfg.color,   borderColor: catCfg.color,   background: 'transparent', margin: 0 }}>{catCfg.label}</Tag>   },
            { label: 'Hiệu lực từ',    value: <span style={{ color: '#fff', fontWeight: 600 }}>{formatDate(std.effectiveFrom)}</span> },
            { label: 'Người soạn thảo', value: <span style={{ color: '#fff', fontWeight: 600 }}>{std.issuedBy}</span> },
            ...(stdApprovedBy ? [{ label: 'Người phê duyệt', value: <span style={{ color: '#52c41a', fontWeight: 600 }}>{stdApprovedBy}</span> }] : []),
            { label: 'Phân xưởng', value: (
              <Space size={4}>
                {std.applicableWorkshops.map(ws => (
                  <Tag key={ws} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: 'none', margin: 0, fontSize: 11 }}>{ws}</Tag>
                ))}
              </Space>
            )},
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: '16px 24px', padding: '12px 16px', borderLeft: '3px solid #D4A843', background: 'rgba(255,255,255,0.05)', borderRadius: '0 8px 8px 0' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{std.description}</Text>
        </div>
      </div>

      {/* ─── Action alerts ─── */}
      {isSafety && status === 'draft' && (
        <Alert type="info" showIcon
          message="Tiêu chuẩn đang ở trạng thái Nháp"
          description="Gửi phê duyệt để Ban Giám đốc xem xét và ban hành chính thức."
          action={
            <Button size="small" icon={<SendOutlined />}
              onClick={() => { modalForm.resetFields(); setModalType('send'); }}
              style={{ background: '#0891b2', borderColor: '#0891b2', color: '#fff', borderRadius: 6 }}
            >Gửi phê duyệt</Button>
          }
          style={{ margin: '12px 0', borderRadius: 10 }}
        />
      )}
      {isSafety && status === 'pending_approval' && (
        <Alert type="info" showIcon
          message="Đã gửi phê duyệt"
          description="Tiêu chuẩn đang chờ Ban Giám đốc xem xét và phê duyệt."
          style={{ margin: '12px 0', borderRadius: 10 }}
        />
      )}
      {isDirector && status === 'pending_approval' && (
        <Alert type="warning" showIcon
          message="Tiêu chuẩn đang chờ phê duyệt"
          description={`Do ${std.issuedBy} soạn thảo ngày ${formatDate(std.issuedAt)}.`}
          action={
            <Button size="small" icon={<CheckSquareOutlined />}
              onClick={() => { modalForm.resetFields(); setModalType('approve'); }}
              style={{ background: '#059669', borderColor: '#059669', color: '#fff', borderRadius: 6 }}
            >Phê duyệt & ban hành</Button>
          }
          style={{ margin: '12px 0', borderRadius: 10 }}
        />
      )}

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ margin: '16px 0' }}>
        {[
          { label: 'Yêu cầu chính',     value: reqCount,       unit: 'yêu cầu',   gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Liên kết công đoạn', value: linkedCount,    unit: 'công đoạn', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
          { label: 'Đơn vị đã nhận',     value: (std.distributionRecords ?? []).length, unit: 'đơn vị', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
          { label: 'Đã xác nhận',        value: confirmedCount, unit: 'đơn vị',    gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        ].map(card => (
          <Col xs={12} sm={6} key={card.label}>
            <div style={{
              background: card.gradient, borderRadius: 12, padding: '16px 20px',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {card.value}<span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>{card.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{card.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Nội dung chính ─── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Yêu cầu chính</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '8px 0' } }}
          >
            {std.keyRequirements.map((req, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: 12, padding: '12px 20px',
                borderBottom: idx < std.keyRequirements.length - 1 ? '1px solid #f5f5f5' : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#f6ffed', border: '1px solid #b7eb8f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                </div>
                <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{req}</Text>
              </div>
            ))}
          </Card>

          {std.linkedProcesses && std.linkedProcesses.length > 0 && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ApartmentOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Liên kết công đoạn kỹ thuật</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 20 } }}
            >
              {Object.entries(moduleLabels).map(([mod, modCfg]) => {
                const items = std.linkedProcesses!.filter(p => p.module === mod);
                if (items.length === 0) return null;
                return (
                  <div key={mod} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: modCfg.color }} />
                      <Tag style={{ color: modCfg.color, borderColor: modCfg.color, margin: 0, fontWeight: 600 }}>{modCfg.label}</Tag>
                    </div>
                    {items.map((p, idx) => (
                      <div key={idx} style={{ padding: '9px 14px', borderRadius: 8, background: '#fafbfc', border: '1px solid #f0f0f0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ApartmentOutlined style={{ color: modCfg.color, flexShrink: 0, fontSize: 13 }} />
                        <Text style={{ fontSize: 13 }}>{p.stage}</Text>
                      </div>
                    ))}
                  </div>
                );
              })}
            </Card>
          )}
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquareOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Luồng phê duyệt & ban hành</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <Descriptions column={1} size="small"
              labelStyle={{ color: '#8c8c8c', fontSize: 12, width: 120 }}
              contentStyle={{ fontSize: 13 }}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Người soạn thảo">
                <Space><UserOutlined style={{ color: '#8c8c8c' }} />{std.issuedBy}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày soạn thảo">{formatDate(std.issuedAt)}</Descriptions.Item>
              {stdApprovedBy && (
                <Descriptions.Item label="Người phê duyệt">
                  <Text strong style={{ color: '#059669' }}>{stdApprovedBy}</Text>
                </Descriptions.Item>
              )}
              {stdApprovedAt && (
                <Descriptions.Item label="Ngày phê duyệt">
                  <Text strong style={{ color: '#059669' }}>{formatDate(stdApprovedAt)}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Hiệu lực từ">
                <Text strong style={{ color: '#1B3A5C' }}>{formatDate(std.effectiveFrom)}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Timeline
              items={[
                {
                  color: '#0891b2',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13 }}>Soạn thảo</Text>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{std.issuedBy} — {formatDate(std.issuedAt)}</div>
                    </div>
                  ),
                },
                {
                  color: status === 'pending_approval' ? '#faad14' : stdApprovedAt ? '#059669' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: status === 'pending_approval' ? '#d97706' : stdApprovedAt ? '#059669' : '#8c8c8c' }}>
                        Phê duyệt {!stdApprovedAt && status !== 'pending_approval' && '(chưa)'}
                        {status === 'pending_approval' && ' (đang chờ)'}
                      </Text>
                      {stdApprovedBy && stdApprovedAt && (
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{stdApprovedBy} — {formatDate(stdApprovedAt)}</div>
                      )}
                    </div>
                  ),
                },
                {
                  color: status === 'active' ? '#1B3A5C' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: status === 'active' ? '#1B3A5C' : '#8c8c8c' }}>
                        Ban hành & áp dụng {status !== 'active' && '(chưa)'}
                      </Text>
                      {status === 'active' && (
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>Hiệu lực từ {formatDate(std.effectiveFrom)}</div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {std.distributionRecords && std.distributionRecords.length > 0 && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TeamOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Phổ biến & Đào tạo</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 20 } }}
            >
              {std.distributionRecords.map((rec, idx) => (
                <div key={idx} style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: rec.confirmedAt ? '#f6ffed' : '#fffbe6',
                  border: `1px solid ${rec.confirmedAt ? '#b7eb8f' : '#ffe58f'}`,
                  marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{rec.workshopName}</Text>
                    {rec.confirmedAt
                      ? <Tag color="success" style={{ margin: 0, fontSize: 11 }}>Đã xác nhận</Tag>
                      : <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>Chờ xác nhận</Tag>}
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>Nhận: {rec.receivedBy} — {formatDate(rec.receivedAt)}</div>
                  {rec.confirmedBy && rec.confirmedAt && (
                    <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>Xác nhận: {rec.confirmedBy} — {formatDate(rec.confirmedAt)}</div>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#f5f7fa', display: 'flex' }}>
                {[
                  { val: std.distributionRecords.length, label: 'Đã nhận', color: '#1B3A5C' },
                  { val: confirmedCount, label: 'Xác nhận', color: '#52c41a' },
                  { val: std.distributionRecords.length - confirmedCount, label: 'Chờ xác nhận', color: '#faad14' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid #e8e8e8' : 'none' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* ─── Modal: Gửi phê duyệt ─── */}
      <Modal
        title="Gửi tiêu chuẩn để phê duyệt"
        open={modalType === 'send'}
        onOk={handleModalOk}
        onCancel={() => setModalType(null)}
        okText="Xác nhận gửi"
        okButtonProps={{ style: { background: '#0891b2', borderColor: '#0891b2' } }}
        cancelText="Hủy"
      >
        <Form form={modalForm} />
        <div style={{ padding: '12px 0', fontSize: 13 }}>
          Xác nhận gửi tiêu chuẩn <Text strong>{std.code} — {std.title}</Text> để Ban Giám đốc xem xét phê duyệt?
          <br /><br />
          Sau khi gửi, trạng thái sẽ chuyển sang <Text strong style={{ color: '#d97706' }}>Chờ phê duyệt</Text>.
        </div>
      </Modal>

      {/* ─── Modal: Phê duyệt & ban hành ─── */}
      <Modal
        title="Phê duyệt & ban hành tiêu chuẩn"
        open={modalType === 'approve'}
        onOk={handleModalOk}
        onCancel={() => setModalType(null)}
        okText="Phê duyệt & ban hành"
        okButtonProps={{ style: { background: '#059669', borderColor: '#059669' } }}
        cancelText="Hủy"
      >
        <Form form={modalForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Người phê duyệt"
            name="approvedBy"
            initialValue="Đại tá Phạm Quốc Hưng"
            rules={[{ required: true, message: 'Vui lòng nhập tên người phê duyệt' }]}
          >
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f', fontSize: 13 }}>
            Tiêu chuẩn sẽ chuyển sang trạng thái <Text strong style={{ color: '#059669' }}>Đang áp dụng</Text> và có hiệu lực từ {formatDate(std.effectiveFrom)}.
          </div>
        </Form>
      </Modal>

      {/* ─── Drawer: Chỉnh sửa ─── */}
      <Drawer
        title="Chỉnh sửa tiêu chuẩn an toàn"
        placement="right"
        width={520}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}
              onClick={() => { setEditOpen(false); }}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title:       std.title,
            version:     std.version,
            description: std.description,
            scope:       std.scope,
            hazardCategory: std.hazardCategory,
            applicableWorkshops: std.applicableWorkshops,
          }}
        >
          <Form.Item label="Tên tiêu chuẩn" name="title" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Phiên bản" name="version" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} placeholder="VD: 2.1" />
          </Form.Item>
          <Form.Item label="Phạm vi áp dụng" name="scope">
            <Select style={{ borderRadius: 8 }} options={[
              { value: 'chung',      label: 'Chung' },
              { value: 'san_xuat',   label: 'Sản xuất' },
              { value: 'sua_chua',   label: 'Sửa chữa' },
              { value: 'dai_tu',     label: 'Đại tu' },
              { value: 'thu_nghiem', label: 'Thử nghiệm' },
            ]} />
          </Form.Item>
          <Form.Item label="Loại nguy cơ" name="hazardCategory">
            <Select style={{ borderRadius: 8 }} options={[
              { value: 'dien_ap_cao', label: 'Điện áp cao' },
              { value: 'ap_suat_cao', label: 'Áp suất cao' },
              { value: 'chay_no',     label: 'Cháy nổ' },
              { value: 'buc_xa',      label: 'Bức xạ' },
              { value: 'hoa_chat',    label: 'Hóa chất' },
              { value: 'co_hoc',      label: 'Cơ học' },
              { value: 'nhiet_do',    label: 'Nhiệt độ' },
              { value: 'khac',        label: 'Khác' },
            ]} />
          </Form.Item>
          <Form.Item label="Phân xưởng áp dụng" name="applicableWorkshops">
            <Select mode="multiple" style={{ borderRadius: 8 }} options={workshopOptions} />
          </Form.Item>
          <Form.Item label="Ngày hiệu lực" name="effectiveFrom">
            <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <TextArea rows={4} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default SafetyStandardDetailPage;
