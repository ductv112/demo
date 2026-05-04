import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Space, Tag, Button,
  Steps, Timeline, Modal, Form, Input, Select, DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined, BulbOutlined,
  CheckCircleOutlined, UserOutlined, DollarOutlined,
  SearchOutlined, AimOutlined, BookOutlined, DeploymentUnitOutlined,
  CloseCircleOutlined, PlayCircleOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { improvements } from '../../data/improvements';
import { safetyStandards } from '../../data/safetyStandards';
import {
  improvementStatusConfig, improvementSourceConfig,
  improvementPriorityConfig, forwardedToConfig, formatDate, formatNumber,
} from '../../utils/format';
import type { ImprovementStatus } from '../../types';
import { useUser } from '../../contexts/UserContext';

const { Text } = Typography;
const { TextArea } = Input;

const stepLabels = ['Đề xuất', 'Phê duyệt', 'Triển khai', 'Đánh giá', 'Đóng'];

type LocalState = {
  status: ImprovementStatus;
  approvedBy?: string;
  approvedAt?: string;
  implementedBy?: string;
  implementedAt?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  evaluationResult?: string;
  closedAt?: string;
  rejectedReason?: string;
};

const ImprovementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSafety } = useUser();
  const [form] = Form.useForm();

  const item = improvements.find(i => i.id === id);

  const [local, setLocal] = useState<LocalState | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'implement' | 'evaluate' | 'close' | null>(null);

  if (!item) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Text type="secondary">Không tìm thấy đề xuất cải tiến</Text>
        <br />
        <Button style={{ marginTop: 12 }} onClick={() => navigate('/cai-tien-phong-ngua')}>Quay lại</Button>
      </div>
    );
  }

  const merged = {
    ...item,
    ...(local ?? {}),
  };

  const linkedStandards = (merged.linkedStandardIds ?? [])
    .map(sid => safetyStandards.find(s => s.id === sid))
    .filter(Boolean);

  const statusCfg   = improvementStatusConfig[merged.status];
  const sourceCfg   = improvementSourceConfig[merged.source];
  const priorityCfg = improvementPriorityConfig[merged.priority];
  const currentStep = merged.status === 'rejected' ? 0 : statusCfg.step;

  const timelineItems: { label: string; actor: string; date: string }[] = [];
  timelineItems.push({ label: 'Đề xuất', actor: merged.proposedBy, date: merged.proposedAt });
  if (merged.approvedAt)    timelineItems.push({ label: 'Phê duyệt',  actor: merged.approvedBy ?? '',    date: merged.approvedAt });
  if (merged.implementedAt) timelineItems.push({ label: 'Triển khai', actor: merged.implementedBy ?? '', date: merged.implementedAt });
  if (merged.evaluatedAt)   timelineItems.push({ label: 'Đánh giá',   actor: merged.evaluatedBy ?? '',   date: merged.evaluatedAt });
  if (merged.closedAt)      timelineItems.push({ label: 'Đóng',       actor: '',                          date: merged.closedAt });

  const today = new Date().toISOString().split('T')[0];

  const handleOk = () => {
    form.validateFields().then(values => {
      if (modalType === 'approve') {
        setLocal(prev => ({ ...prev, status: 'approved', approvedBy: values.approvedBy, approvedAt: today }));
      } else if (modalType === 'reject') {
        setLocal(prev => ({ ...prev, status: 'rejected', rejectedReason: values.reason }));
      } else if (modalType === 'implement') {
        setLocal(prev => ({ ...prev, status: 'implementing', implementedBy: values.implementedBy }));
      } else if (modalType === 'evaluate') {
        setLocal(prev => ({
          ...prev,
          status: 'evaluating',
          implementedAt: values.implementedAt?.format('YYYY-MM-DD') ?? today,
          implementedBy: prev?.implementedBy ?? merged.implementedBy,
          evaluationResult: values.evaluationResult,
          evaluatedBy: values.evaluatedBy,
          evaluatedAt: today,
        }));
      } else if (modalType === 'close') {
        setLocal(prev => ({ ...prev, status: 'closed', closedAt: today }));
      }
      form.resetFields();
      setModalType(null);
    });
  };

  const openModal = (type: typeof modalType) => {
    form.resetFields();
    setModalType(type);
  };

  return (
    <div>
      {/* ─── Hero header banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 60%, #2d5a8e 100%)',
        borderRadius: 14, marginBottom: 0, overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space align="center" size={14}>
            <button
              onClick={() => navigate('/cai-tien-phong-ngua')}
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
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BulbOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
                {item.title}
              </div>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {item.code}
                </Tag>
                <Tag style={{ background: `${priorityCfg.color}30`, color: priorityCfg.color, border: `1px solid ${priorityCfg.color}60`, borderRadius: 4, fontSize: 11 }}>
                  Ưu tiên {priorityCfg.label}
                </Tag>
              </Space>
            </div>
          </Space>

          {/* Status + actions */}
          <Space size={8} style={{ flexShrink: 0, marginTop: 4 }} wrap>
            <Tag color={statusCfg.color} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
            {isSafety && merged.status === 'proposed' && (
              <>
                <Button
                  icon={<CheckCircleOutlined />}
                  style={{ borderRadius: 8, background: 'rgba(82,196,26,0.15)', border: '1px solid rgba(82,196,26,0.5)', color: '#52c41a' }}
                  onClick={() => openModal('approve')}
                >
                  Phê duyệt
                </Button>
                <Button
                  icon={<CloseCircleOutlined />}
                  style={{ borderRadius: 8, background: 'rgba(255,77,79,0.15)', border: '1px solid rgba(255,77,79,0.5)', color: '#ff4d4f' }}
                  onClick={() => openModal('reject')}
                >
                  Từ chối
                </Button>
              </>
            )}
            {isSafety && merged.status === 'approved' && (
              <Button
                icon={<PlayCircleOutlined />}
                style={{ borderRadius: 8, background: 'rgba(8,145,178,0.15)', border: '1px solid rgba(8,145,178,0.5)', color: '#0891b2' }}
                onClick={() => openModal('implement')}
              >
                Bắt đầu triển khai
              </Button>
            )}
            {isSafety && merged.status === 'implementing' && (
              <Button
                icon={<FileTextOutlined />}
                style={{ borderRadius: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.5)', color: '#7c3aed' }}
                onClick={() => openModal('evaluate')}
              >
                Ghi kết quả đánh giá
              </Button>
            )}
            {isSafety && merged.status === 'evaluating' && (
              <Button
                icon={<CheckCircleOutlined />}
                style={{ borderRadius: 8, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.5)', color: '#059669' }}
                onClick={() => openModal('close')}
              >
                Đóng đề xuất
              </Button>
            )}
          </Space>
        </div>

        {/* Info strip */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Người đề xuất', value: <span style={{ color: '#fff', fontWeight: 600 }}>{merged.proposedBy}</span> },
            { label: 'Ngày đề xuất',  value: <span style={{ color: '#fff', fontWeight: 600 }}>{formatDate(merged.proposedAt)}</span> },
            { label: 'Nguồn', value: <Tag style={{ color: sourceCfg.color, borderColor: sourceCfg.color, background: 'transparent', margin: 0 }}>{sourceCfg.label}</Tag> },
            { label: 'Đơn vị áp dụng', value: (
              <Space size={4} wrap>
                {merged.workshopIds.map(ws => (
                  <Tag key={ws} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: 'none', margin: 0, fontSize: 11 }}>{ws}</Tag>
                ))}
              </Space>
            )},
            ...(merged.estimatedDeadline ? [{ label: 'Hạn hoàn thành', value: <span style={{ color: '#fff', fontWeight: 600 }}>{formatDate(merged.estimatedDeadline)}</span> }] : []),
          ].map((info, idx) => (
            <div key={idx}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>{info.label}</div>
              <div style={{ fontSize: 13 }}>{info.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ margin: '16px 24px', padding: '12px 16px', borderLeft: '3px solid #D4A843', background: 'rgba(255,255,255,0.05)', borderRadius: '0 8px 8px 0' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{item.description}</Text>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ margin: '16px 0' }}>
        {[
          {
            label: 'Mức ưu tiên',
            value: priorityCfg.label,
            gradient: `linear-gradient(135deg, ${priorityCfg.color}, ${priorityCfg.color}cc)`,
          },
          {
            label: 'Nguồn đề xuất',
            value: sourceCfg.label,
            gradient: `linear-gradient(135deg, ${sourceCfg.color}, ${sourceCfg.color}cc)`,
          },
          {
            label: 'Chi phí ước tính',
            value: merged.estimatedCost === 0
              ? 'Miễn phí'
              : merged.estimatedCost
                ? `${formatNumber(Math.round(merged.estimatedCost / 1000000))} tr`
                : '—',
            gradient: merged.estimatedCost && merged.estimatedCost > 0
              ? 'linear-gradient(135deg, #d97706, #fbbf24)'
              : 'linear-gradient(135deg, #059669, #10b981)',
          },
          {
            label: 'Tiến độ',
            value: `Bước ${currentStep + 1}/${stepLabels.length}`,
            gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          },
        ].map((card, i) => (
          <Col xs={12} sm={6} key={i}>
            <div style={{
              background: card.gradient, borderRadius: 12, padding: '16px 20px',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{card.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Nội dung chính ─── */}
      <Row gutter={[16, 16]}>
        {/* ─── Cột trái ─── */}
        <Col xs={24} lg={14}>
          {/* Mô tả chi tiết */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BulbOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Mô tả chi tiết</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{item.description}</Text>

            {merged.estimatedCost !== undefined && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#fafbfc', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarOutlined style={{ color: '#d97706', fontSize: 14 }} />
                <Text style={{ fontSize: 13 }}>
                  Chi phí ước tính:{' '}
                  <Text strong style={{ color: merged.estimatedCost === 0 ? '#52c41a' : '#1B3A5C' }}>
                    {merged.estimatedCost === 0 ? 'Không phát sinh' : `${formatNumber(merged.estimatedCost / 1000000)} triệu đồng`}
                  </Text>
                </Text>
              </div>
            )}
          </Card>

          {/* Nguyên nhân gốc */}
          {merged.rootCause && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1890ff, #40a9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SearchOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1890ff' }}>Nguyên nhân gốc / Điểm yếu hệ thống</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, borderLeft: '3px solid #1890ff' }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{merged.rootCause}</Text>
            </Card>
          )}

          {/* Kết quả kỳ vọng */}
          {merged.expectedOutcome && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AimOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#0891b2' }}>Kết quả kỳ vọng</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, borderLeft: '3px solid #0891b2' }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{merged.expectedOutcome}</Text>
            </Card>
          )}

          {/* Kết quả đánh giá */}
          {merged.evaluationResult && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#059669' }}>Kết quả đánh giá hiệu quả</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{merged.evaluationResult}</Text>
              {merged.evaluatedAt && merged.evaluatedBy && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#8c8c8c' }}>
                  <UserOutlined style={{ marginRight: 4 }} />{merged.evaluatedBy} — {formatDate(merged.evaluatedAt)}
                </div>
              )}
            </Card>
          )}

          {/* Lý do từ chối */}
          {merged.status === 'rejected' && local?.rejectedReason && (
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, borderLeft: '3px solid #ff4d4f' }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ fontWeight: 600, color: '#ff4d4f', marginBottom: 6, fontSize: 13 }}>
                <CloseCircleOutlined style={{ marginRight: 6 }} />Lý do từ chối
              </div>
              <Text style={{ fontSize: 13 }}>{local.rejectedReason}</Text>
            </Card>
          )}

          {/* Ghi chú */}
          {item.note && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BulbOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#d97706' }}>Ghi chú</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 16 } }}
            >
              <Text style={{ fontSize: 13 }}>{item.note}</Text>
            </Card>
          )}
        </Col>

        {/* ─── Cột phải ─── */}
        <Col xs={24} lg={10}>
          {/* Tiêu chuẩn liên kết */}
          {linkedStandards.length > 0 && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Tiêu chuẩn an toàn liên kết</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {linkedStandards.map(s => s && (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/tieu-chuan/${s.id}`)}
                    style={{ padding: '10px 12px', borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#d9f7be'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f6ffed'; }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#389e0d' }}>{s.code}</div>
                    <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>{s.title}</div>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {/* Quy trình cần cập nhật */}
          {merged.linkedProcessModules && merged.linkedProcessModules.length > 0 && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DeploymentUnitOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Quy trình cần cập nhật</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {merged.linkedProcessModules.map(mod => {
                  const cfg = forwardedToConfig[mod];
                  return (
                    <div key={mod} style={{ padding: '8px 12px', borderRadius: 8, background: '#f0f9ff', border: `1px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      <Text style={{ fontSize: 13, color: cfg.color, fontWeight: 500 }}>{cfg.label}</Text>
                    </div>
                  );
                })}
              </Space>
              <div style={{ marginTop: 10, fontSize: 11, color: '#8c8c8c' }}>
                Các phân hệ này cần cập nhật quy trình vận hành sau khi cải tiến hoàn thành.
              </div>
            </Card>
          )}

          {/* Workflow Steps */}
          {merged.status !== 'rejected' && (
            <Card
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <Steps
                direction="vertical"
                size="small"
                current={currentStep}
                status={merged.status === 'closed' ? 'finish' : 'process'}
                items={stepLabels.map((label, idx) => ({
                  title: <span style={{ fontSize: 13, fontWeight: idx === currentStep ? 600 : 400 }}>{label}</span>,
                }))}
              />
            </Card>
          )}

          {/* Timeline xử lý */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Lịch sử thực hiện</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 72 }}
            styles={{ body: { padding: 20 } }}
          >
            <Timeline
              items={timelineItems.map((t, idx) => ({
                color: idx === timelineItems.length - 1 ? '#7c3aed' : '#52c41a',
                children: (
                  <div style={{ paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>{t.label}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(t.date)}</Text>
                    </div>
                    {t.actor && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        <UserOutlined style={{ marginRight: 4 }} />{t.actor}
                      </div>
                    )}
                  </div>
                ),
              }))}
            />

            {merged.status === 'closed' && merged.closedAt && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #f6ffed, #e6f7e9)', border: '1px solid #b7eb8f' }}>
                <div style={{ fontWeight: 600, color: '#389e0d', fontSize: 13 }}>
                  <CheckCircleOutlined style={{ marginRight: 6 }} />Đề xuất đã hoàn thành
                </div>
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>{formatDate(merged.closedAt)}</div>
              </div>
            )}

            {merged.status === 'rejected' && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: '#fff1f0', border: '1px solid #ffccc7' }}>
                <div style={{ fontWeight: 600, color: '#ff4d4f', fontSize: 13 }}>
                  <CloseCircleOutlined style={{ marginRight: 6 }} />Đề xuất bị từ chối
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ─── Modals ─── */}

      {/* Phê duyệt */}
      <Modal
        title="Phê duyệt đề xuất cải tiến"
        open={modalType === 'approve'}
        onOk={handleOk}
        onCancel={() => setModalType(null)}
        okText="Xác nhận phê duyệt"
        okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Người phê duyệt"
            name="approvedBy"
            initialValue="Phạm Quốc Hưng — Giám đốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên người phê duyệt' }]}
          >
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Từ chối */}
      <Modal
        title="Từ chối đề xuất cải tiến"
        open={modalType === 'reject'}
        onOk={handleOk}
        onCancel={() => setModalType(null)}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Lý do từ chối"
            name="reason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={3} style={{ borderRadius: 8 }} placeholder="Nêu rõ lý do không phê duyệt đề xuất này..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Bắt đầu triển khai */}
      <Modal
        title="Bắt đầu triển khai"
        open={modalType === 'implement'}
        onOk={handleOk}
        onCancel={() => setModalType(null)}
        okText="Xác nhận"
        okButtonProps={{ style: { background: '#0891b2', borderColor: '#0891b2' } }}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Người chịu trách nhiệm triển khai"
            name="implementedBy"
            initialValue={merged.implementedBy ?? ''}
            rules={[{ required: true, message: 'Vui lòng nhập tên người triển khai' }]}
          >
            <Input style={{ borderRadius: 8 }} placeholder="Họ tên, chức danh..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Ghi kết quả đánh giá */}
      <Modal
        title="Ghi kết quả đánh giá hiệu quả"
        open={modalType === 'evaluate'}
        onOk={handleOk}
        onCancel={() => setModalType(null)}
        okText="Lưu đánh giá"
        okButtonProps={{ style: { background: '#7c3aed', borderColor: '#7c3aed' } }}
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Ngày hoàn thành triển khai"
            name="implementedAt"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Người đánh giá"
            name="evaluatedBy"
            initialValue="Nguyễn Văn Đức — Phó giám đốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên người đánh giá' }]}
          >
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item
            label="Kết quả đánh giá hiệu quả"
            name="evaluationResult"
            rules={[{ required: true, message: 'Vui lòng nhập kết quả đánh giá' }]}
          >
            <TextArea rows={4} style={{ borderRadius: 8 }} placeholder="Mô tả kết quả thực tế sau triển khai, so sánh với kết quả kỳ vọng, mức độ giảm thiểu rủi ro..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Đóng đề xuất */}
      <Modal
        title="Đóng đề xuất cải tiến"
        open={modalType === 'close'}
        onOk={handleOk}
        onCancel={() => setModalType(null)}
        okText="Xác nhận đóng"
        okButtonProps={{ style: { background: '#059669', borderColor: '#059669' } }}
        cancelText="Hủy"
      >
        <div style={{ padding: '12px 0', fontSize: 13 }}>
          Xác nhận đóng đề xuất <Text strong>{item.code} — {item.title}</Text>?
          <br /><br />
          Sau khi đóng, đề xuất sẽ chuyển sang trạng thái <Text strong style={{ color: '#059669' }}>Đã đóng</Text> và không thể chỉnh sửa thêm.
        </div>
        <Form form={form} />
      </Modal>
    </div>
  );
};

export default ImprovementDetailPage;
