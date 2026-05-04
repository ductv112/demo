import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Space, Tag, Button,
  Form, Input, DatePicker, Select, Divider, Timeline,
} from 'antd';
import {
  ArrowLeftOutlined, FileProtectOutlined,
  EditOutlined, CheckCircleOutlined, UserOutlined,
  SafetyOutlined, AlertOutlined, BulbOutlined,
} from '@ant-design/icons';
import { violations } from '../../data/violations';
import { safetyStandards } from '../../data/safetyStandards';
import { technicalRisks } from '../../data/risks';
import {
  violationStatusConfig, violationSeverityConfig,
  violationSourceConfig, hazardCategoryConfig, forwardedToConfig,
  riskLevelConfig, formatDate,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Text } = Typography;
const { TextArea } = Input;

const ViolationDetailPage: React.FC = () => {
  const { id, mode } = useParams<{ id: string; mode?: string }>();
  const navigate = useNavigate();
  const { isSafety } = useUser();
  const isEditMode = mode === 'edit';

  const violation = violations.find(v => v.id === id);

  if (!violation) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Text type="secondary">Không tìm thấy vi phạm</Text>
        <br />
        <Button style={{ marginTop: 12 }} onClick={() => navigate('/vi-pham')}>Quay lại</Button>
      </div>
    );
  }

  const statusCfg   = violationStatusConfig[violation.status];
  const severityCfg = violationSeverityConfig[violation.severity];
  const catCfg      = hazardCategoryConfig[violation.violationType];
  const sourceCfg   = violationSourceConfig[violation.source];

  const relatedStandard = violation.relatedStandardId
    ? safetyStandards.find(s => s.id === violation.relatedStandardId)
    : null;

  const relatedRisk = violation.relatedRiskId
    ? technicalRisks.find(r => r.id === violation.relatedRiskId)
    : null;

  const detectedDate   = new Date(violation.detectedAt);
  const today          = new Date();
  const daysSince      = Math.floor((today.getTime() - detectedDate.getTime()) / 86400000);
  const deadlineDate   = violation.deadline ? new Date(violation.deadline) : null;
  const daysToDeadline = deadlineDate ? Math.floor((deadlineDate.getTime() - today.getTime()) / 86400000) : null;
  const isOverdue      = daysToDeadline !== null && daysToDeadline < 0 && violation.status !== 'closed';

  const statusOrder  = ['new', 'handling', 'resolved', 'closed'];
  const currentIdx   = statusOrder.indexOf(violation.status);

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
              onClick={() => navigate('/vi-pham')}
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
              background: 'linear-gradient(135deg, #d97706, #fbbf24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FileProtectOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
                {violation.title}
              </div>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {violation.code}
                </Tag>
                <Tag style={{ background: `${severityCfg.color}30`, color: severityCfg.color, border: `1px solid ${severityCfg.color}60`, borderRadius: 4, fontSize: 11 }}>
                  {severityCfg.label}
                </Tag>
              </Space>
            </div>
          </Space>

          {/* Status + actions */}
          <Space size={8} style={{ flexShrink: 0, marginTop: 4 }}>
            <Tag color={statusCfg.color} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
            {isSafety && violation.status !== 'closed' && !isEditMode && (
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/vi-pham/${violation.id}/edit`)}
                style={{ borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                Cập nhật xử lý
              </Button>
            )}
          </Space>
        </div>

        {/* Info strip */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Trung tâm', value: <span style={{ color: '#fff', fontWeight: 600 }}>{violation.workshopName}</span> },
            { label: 'Loại nguy cơ', value: <Tag style={{ color: catCfg.color, borderColor: catCfg.color, background: 'transparent', margin: 0 }}>{catCfg.label}</Tag> },
            { label: 'Nguồn phát hiện', value: <span style={{ color: 'rgba(255,255,255,0.85)' }}>{sourceCfg.label}</span> },
            { label: 'Người phát hiện', value: <span style={{ color: '#fff', fontWeight: 600 }}>{violation.detectedBy}</span> },
            ...(violation.forwardedTo ? [{
              label: 'Chuyển đến',
              value: (() => {
                const fw = forwardedToConfig[violation.forwardedTo!];
                return <Tag style={{ color: fw.color, borderColor: fw.color, background: 'transparent', margin: 0 }}>{fw.label}</Tag>;
              })(),
            }] : []),
            ...(violation.deadline ? [{ label: 'Hạn xử lý', value: <span style={{ color: isOverdue ? '#ff7875' : '#fff', fontWeight: 600 }}>{formatDate(violation.deadline)}</span> }] : []),
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ margin: '16px 24px', padding: '12px 16px', borderLeft: '3px solid #D4A843', background: 'rgba(255,255,255,0.05)', borderRadius: '0 8px 8px 0' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{violation.description}</Text>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ margin: '16px 0' }}>
        {[
          {
            label: 'Mức độ vi phạm',
            value: severityCfg.label,
            isText: true,
            gradient: `linear-gradient(135deg, ${severityCfg.color}, ${severityCfg.color}cc)`,
          },
          {
            label: 'Ngày kể từ phát hiện',
            value: daysSince,
            unit: 'ngày',
            gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
          },
          {
            label: daysToDeadline === null ? 'Hạn xử lý' : (isOverdue ? 'Quá hạn' : 'Còn lại'),
            value: daysToDeadline === null ? '—' : Math.abs(daysToDeadline),
            unit: daysToDeadline === null ? '' : 'ngày',
            gradient: isOverdue
              ? 'linear-gradient(135deg, #cf1322, #ff4d4f)'
              : 'linear-gradient(135deg, #d97706, #fbbf24)',
          },
          {
            label: 'Trạng thái',
            value: statusCfg.label,
            isText: true,
            gradient: 'linear-gradient(135deg, #059669, #10b981)',
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
              <div style={{ fontSize: card.isText ? 18 : 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {card.value}
                {!card.isText && card.unit && (
                  <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>{card.unit}</span>
                )}
              </div>
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
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileProtectOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Mô tả vi phạm</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{violation.description}</Text>

            {relatedStandard && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#f0f7ff', border: '1px solid #bae0ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                <Text style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500 }}>
                  Tiêu chuẩn vi phạm: {relatedStandard.code} — {relatedStandard.title}
                </Text>
              </div>
            )}

            {relatedRisk && (
              <div
                style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: '#fff7e6', border: '1px solid #ffd591', cursor: 'pointer' }}
                onClick={() => navigate(`/rui-ro/${relatedRisk.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500 }}>
                    <AlertOutlined style={{ marginRight: 6, color: '#d97706' }} />
                    Rủi ro liên quan: {relatedRisk.code}
                  </Text>
                  <Tag style={{ background: riskLevelConfig[relatedRisk.riskLevel].bg, color: riskLevelConfig[relatedRisk.riskLevel].color, border: 'none', fontSize: 11 }}>
                    {riskLevelConfig[relatedRisk.riskLevel].label}
                  </Tag>
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{relatedRisk.title}</div>
              </div>
            )}

            {violation.forwardedTo && (
              <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: '#f9f0ff', border: '1px solid #d3adf7', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ color: '#7c3aed', fontSize: 14 }} />
                <Text style={{ fontSize: 13, color: '#1B3A5C', fontWeight: 500 }}>
                  Chuyển yêu cầu đến: <span style={{ color: forwardedToConfig[violation.forwardedTo].color, fontWeight: 600 }}>{forwardedToConfig[violation.forwardedTo].label}</span>
                </Text>
              </div>
            )}
          </Card>

          {/* Yêu cầu khắc phục */}
          {violation.remedyRequest && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #cf1322, #ff4d4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#cf1322' }}>Yêu cầu khắc phục</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: '1px solid #ffccc7' }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{violation.remedyRequest}</Text>
            </Card>
          )}

          {/* Biện pháp khắc phục */}
          {violation.correctiveAction && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#059669' }}>Biện pháp khắc phục</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{violation.correctiveAction}</Text>
              {violation.verifiedBy && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <div style={{ fontWeight: 600, color: '#389e0d', fontSize: 12 }}>
                    <UserOutlined style={{ marginRight: 6 }} />Xác nhận bởi: {violation.verifiedBy}
                  </div>
                  {violation.verifiedAt && (
                    <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>{formatDate(violation.verifiedAt)}</div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Biện pháp phòng ngừa */}
          {violation.preventiveAction && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BulbOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#7c3aed' }}>Biện pháp phòng ngừa tái phát</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16, border: '1px solid #d3adf7' }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13, lineHeight: 1.7 }}>{violation.preventiveAction}</Text>
            </Card>
          )}

          {/* Ghi chú */}
          {violation.note && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #6b7280, #9ca3af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileProtectOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Ghi chú</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
              styles={{ body: { padding: 20 } }}
            >
              <Text style={{ fontSize: 13 }}>{violation.note}</Text>
            </Card>
          )}

          {/* Form chỉnh sửa inline */}
          {isEditMode && isSafety && violation.status !== 'closed' && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EditOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#1B3A5C' }}>Cập nhật xử lý</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 20 } }}
            >
              <Form layout="vertical">
                <Form.Item
                  label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Yêu cầu khắc phục</Text>}
                  name="remedyRequest"
                  initialValue={violation.remedyRequest}
                >
                  <TextArea
                    rows={3}
                    placeholder="Nội dung yêu cầu khắc phục do Ban An toàn đề ra..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
                <Form.Item
                  label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Biện pháp khắc phục</Text>}
                  name="correctiveAction"
                  initialValue={violation.correctiveAction}
                >
                  <TextArea
                    rows={4}
                    placeholder="Mô tả biện pháp đã thực hiện để khắc phục vi phạm..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
                <Form.Item
                  label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Biện pháp phòng ngừa tái phát</Text>}
                  name="preventiveAction"
                  initialValue={violation.preventiveAction}
                >
                  <TextArea
                    rows={3}
                    placeholder="Mô tả biện pháp phòng ngừa để tránh vi phạm tương tự xảy ra..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Chuyển yêu cầu đến</Text>}
                      name="forwardedTo"
                      initialValue={violation.forwardedTo}
                    >
                      <Select
                        style={{ borderRadius: 8 }}
                        placeholder="Chọn phân hệ..."
                        allowClear
                        options={Object.entries(forwardedToConfig).map(([k, v]) => ({ value: k, label: v.label }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Trạng thái xử lý</Text>}
                      name="status"
                      initialValue={violation.status}
                    >
                      <Select
                        style={{ borderRadius: 8 }}
                        options={[
                          { value: 'handling', label: 'Đang xử lý' },
                          { value: 'resolved', label: 'Đã xử lý' },
                          { value: 'closed',   label: 'Đã đóng' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ngày xác nhận</Text>}
                      name="verifiedAt"
                    >
                      <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Space>
                  <Button
                    type="primary"
                    style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8 }}
                    onClick={() => navigate(`/vi-pham/${violation.id}`)}
                  >
                    Lưu cập nhật
                  </Button>
                  <Button style={{ borderRadius: 8 }} onClick={() => navigate(`/vi-pham/${violation.id}`)}>
                    Hủy
                  </Button>
                </Space>
              </Form>
            </Card>
          )}
        </Col>

        {/* ─── Cột phải ─── */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Tiến trình xử lý</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 72 }}
            styles={{ body: { padding: 20 } }}
          >
            <Timeline
              items={[
                {
                  color: currentIdx >= 0 ? '#52c41a' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: currentIdx >= 0 ? '#1B3A5C' : '#bfbfbf' }}>Mới phát hiện</Text>
                      <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>{formatDate(violation.detectedAt)}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}><UserOutlined style={{ marginRight: 4 }} />{violation.detectedBy}</div>
                    </div>
                  ),
                },
                {
                  color: currentIdx >= 1 ? '#52c41a' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: currentIdx >= 1 ? '#1B3A5C' : '#bfbfbf' }}>
                        Đang xử lý {currentIdx < 1 && <span style={{ color: '#bfbfbf', fontWeight: 400 }}>(chưa)</span>}
                      </Text>
                      {violation.assignedTo && (
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}><UserOutlined style={{ marginRight: 4 }} />{violation.assignedTo}</div>
                      )}
                    </div>
                  ),
                },
                {
                  color: currentIdx >= 2 ? '#52c41a' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: currentIdx >= 2 ? '#1B3A5C' : '#bfbfbf' }}>
                        Đã xử lý {currentIdx < 2 && <span style={{ color: '#bfbfbf', fontWeight: 400 }}>(chưa)</span>}
                      </Text>
                      {violation.verifiedAt && (
                        <div style={{ fontSize: 12, color: '#52c41a', marginTop: 2 }}>{formatDate(violation.verifiedAt)}</div>
                      )}
                      {violation.verifiedBy && (
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}><UserOutlined style={{ marginRight: 4 }} />{violation.verifiedBy}</div>
                      )}
                    </div>
                  ),
                },
                {
                  color: currentIdx >= 3 ? '#1B3A5C' : '#d9d9d9',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13, color: currentIdx >= 3 ? '#1B3A5C' : '#bfbfbf' }}>
                        Đã đóng {currentIdx < 3 && <span style={{ color: '#bfbfbf', fontWeight: 400 }}>(chưa)</span>}
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ViolationDetailPage;
