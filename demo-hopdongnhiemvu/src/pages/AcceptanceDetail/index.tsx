import React, { useState, useMemo } from 'react';
import {
  Card, Tabs, Table, Tag, Progress, Row, Col, Typography, Space, Descriptions,
  Button, Empty, Timeline, message, Drawer, Form, DatePicker, Input, Select,
  Modal, Badge, Divider, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
  FileTextOutlined, ToolOutlined, SendOutlined, SyncOutlined,
  ClockCircleOutlined, UserOutlined, LockOutlined, ReloadOutlined,
  CheckSquareOutlined, FileDoneOutlined, AuditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  getAcceptanceById, getInspectionByAcceptance, getDefectsByAcceptance,
  getReworkByAcceptance, getHandoverByAcceptance, getHandoverDocuments,
  acceptanceRecords,
} from '../../data/acceptance';
import { contracts, workItems } from '../../data/contracts';
import { formatDate, formatCurrency, acceptanceStatusConfig, qualityResultConfig, defectSeverityConfig, defectStatusConfig, reworkStatusConfig, handoverStatusConfig, handoverTypeConfig, handoverDocTypeConfig, inspectionResultConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { InspectionResult, Defect, ReworkRequest } from '../../types';

const { Title, Text } = Typography;

const AcceptanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const acceptance = getAcceptanceById(id || '');
  const inspections = useMemo(() => getInspectionByAcceptance(id || ''), [id]);
  const defectList = useMemo(() => getDefectsByAcceptance(id || ''), [id]);
  const reworkList = useMemo(() => getReworkByAcceptance(id || ''), [id]);
  const handover = useMemo(() => getHandoverByAcceptance(id || ''), [id]);
  const handoverDocs = useMemo(() => handover ? getHandoverDocuments(handover.id) : [], [handover]);

  // Lịch sử các chu kỳ nghiệm thu cùng workItem
  const cycleHistory = useMemo(() => {
    if (!acceptance) return [];
    return acceptanceRecords
      .filter(a => a.contractId === acceptance.contractId && a.workItemId === acceptance.workItemId)
      .sort((a, b) => a.cycleNumber - b.cycleNumber);
  }, [acceptance]);

  const contract = acceptance ? contracts.find(c => c.id === acceptance.contractId) : undefined;
  const workItem = acceptance?.workItemId ? workItems.find(w => w.id === acceptance.workItemId) : undefined;

  // Drawers
  const [reworkDrawerOpen, setReworkDrawerOpen] = useState(false);
  const [handoverDrawerOpen, setHandoverDrawerOpen] = useState(false);
  const [recordResultOpen, setRecordResultOpen] = useState(false);
  const [resultType, setResultType] = useState<'pass' | 'fail'>('pass');
  const [reworkForm] = Form.useForm();
  const [handoverForm] = Form.useForm();
  const [resultForm] = Form.useForm();

  if (!acceptance) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy biên bản nghiệm thu</Title>
        <Button type="link" onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const statusConf = acceptanceStatusConfig[acceptance.status];
  const qualityConf = qualityResultConfig[acceptance.qualityResult];
  const passCount = inspections.filter(r => r.result === 'pass').length;
  const failCount = inspections.filter(r => r.result === 'fail').length;
  const criticalDefects = defectList.filter(d => d.severity === 'critical');
  const openDefects = defectList.filter(d => d.status === 'open' || d.status === 'reworking');

  // ─── Tab 1: Tổng quan ───────────────────────────────────────────────────
  const renderOverview = () => (
    <div>
      {/* Quality Gate Summary */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="db-chart-card" styles={{ body: { padding: '20px' } }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              {/* Kết quả lớn */}
              <div style={{
                width: 120, minHeight: 100, borderRadius: 12,
                background: qualityConf.bg,
                border: `2px solid ${qualityConf.color}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: 12,
                flexShrink: 0,
              }}>
                {acceptance.qualityResult === 'passed' && <CheckCircleOutlined style={{ fontSize: 28, color: qualityConf.color, marginBottom: 6 }} />}
                {acceptance.qualityResult === 'failed' && <CloseCircleOutlined style={{ fontSize: 28, color: qualityConf.color, marginBottom: 6 }} />}
                {acceptance.qualityResult === 'conditional' && <WarningOutlined style={{ fontSize: 28, color: qualityConf.color, marginBottom: 6 }} />}
                {acceptance.qualityResult === 'pending' && <ClockCircleOutlined style={{ fontSize: 28, color: qualityConf.color, marginBottom: 6 }} />}
                <Text strong style={{ color: qualityConf.color, fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>
                  {qualityConf.label}
                </Text>
              </div>
              <div style={{ flex: 1 }}>
                <Title level={5} style={{ margin: '0 0 12px', color: colors.navy }}>{acceptance.name}</Title>
                <Row gutter={[12, 8]}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Mã nghiệm thu</Text>
                    <div><Text strong style={{ color: colors.navy }}>{acceptance.code}</Text></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Chu kỳ</Text>
                    <div>
                      <Tag color={acceptance.cycleNumber > 1 ? 'orange' : 'blue'}>
                        Chu kỳ #{acceptance.cycleNumber}
                        {acceptance.cycleNumber > 1 ? ' (Tái nghiệm thu)' : ''}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Loại nghiệm thu</Text>
                    <div><Tag color="geekblue">{acceptance.type === 'phase' ? 'Giai đoạn' : 'Tổng thể'}</Tag></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Trạng thái</Text>
                    <div><Tag color={statusConf.color}>{statusConf.label}</Tag></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Ngày kiểm tra</Text>
                    <div><Text style={{ fontSize: 12 }}>{formatDate(acceptance.inspectionDate)}</Text></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Đoàn kiểm tra</Text>
                    <div><Text style={{ fontSize: 12 }}>{acceptance.inspectorTeam}</Text></div>
                  </Col>
                </Row>
                {acceptance.notes && (
                  <div style={{ marginTop: 10, background: '#fffbeb', borderRadius: 6, padding: '8px 12px', borderLeft: `3px solid #d97706` }}>
                    <Text style={{ fontSize: 12 }}>{acceptance.notes}</Text>
                  </div>
                )}
                {acceptance.isLocked && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LockOutlined style={{ color: '#6b7280', fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>Biên bản đã khóa — không thể chỉnh sửa</Text>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="db-chart-card" styles={{ body: { padding: '20px' } }} style={{ height: '100%' }}>
            <Title level={5} style={{ margin: '0 0 14px', color: colors.navy }}>
              <CheckSquareOutlined style={{ marginRight: 8 }} />Quality Gate
            </Title>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12 }}>Tiêu chí kiểm tra</Text>
                <Text strong style={{ color: failCount === 0 ? '#059669' : '#dc2626' }}>
                  {passCount}/{inspections.length} đạt
                </Text>
              </div>
              <Progress
                percent={inspections.length > 0 ? Math.round(passCount / inspections.length * 100) : 0}
                strokeColor={failCount === 0 ? '#059669' : '#dc2626'}
                size="small"
              />
            </div>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div style={{ textAlign: 'center', background: criticalDefects.length > 0 ? '#fff2f0' : '#f0fff4', borderRadius: 8, padding: '10px 8px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: criticalDefects.length > 0 ? '#dc2626' : '#059669' }}>
                    {criticalDefects.length}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>Lỗi nghiêm trọng</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', background: openDefects.length > 0 ? '#fffbeb' : '#f0fff4', borderRadius: 8, padding: '10px 8px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: openDefects.length > 0 ? '#d97706' : '#059669' }}>
                    {openDefects.length}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>Lỗi chưa xử lý</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', background: '#f0f7ff', borderRadius: 8, padding: '10px 8px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: colors.navy }}>{reworkList.length}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>Yêu cầu rework</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', background: handover ? '#f0fff4' : '#f9fafb', borderRadius: 8, padding: '10px 8px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: handover ? '#059669' : '#6b7280' }}>
                    {handover ? '✓' : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>Bàn giao</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Hợp đồng & WBS */}
      <Card className="db-chart-card" styles={{ body: { padding: 0 } }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, borderRadius: '14px 14px 0 0', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileTextOutlined style={{ color: colors.gold, fontSize: 16 }} />
          <Text strong style={{ color: '#fff' }}>Thông tin hợp đồng & Hạng mục</Text>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <Row gutter={24}>
            {contract && (
              <Col xs={24} md={12}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Hợp đồng">{contract.code} — {contract.name}</Descriptions.Item>
                  <Descriptions.Item label="Đơn vị đặt hàng">{contract.partnerUnit}</Descriptions.Item>
                  <Descriptions.Item label="Giá trị HĐ">{formatCurrency(contract.contractValue)}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian TH">{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</Descriptions.Item>
                </Descriptions>
              </Col>
            )}
            {workItem && (
              <Col xs={24} md={12}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Mã WBS">{workItem.code}</Descriptions.Item>
                  <Descriptions.Item label="Tên hạng mục">{workItem.name}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái WO">
                    <Tag color={workItem.status === 'completed' ? 'green' : 'cyan'}>
                      {workItem.status === 'completed' ? 'Hoàn thành' : 'Đang thực hiện'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiến độ">
                    <Progress percent={workItem.progress} size="small" style={{ width: 120 }} />
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            )}
          </Row>
        </div>
      </Card>

      {/* Lịch sử chu kỳ nghiệm thu */}
      {cycleHistory.length > 1 && (
        <Card className="db-chart-card" style={{ marginTop: 16 }} styles={{ body: { padding: '16px 20px' } }}>
          <Title level={5} style={{ margin: '0 0 14px', color: colors.navy }}>
            <ReloadOutlined style={{ marginRight: 8 }} />Lịch sử chu kỳ nghiệm thu
          </Title>
          <Timeline items={cycleHistory.map(a => ({
            color: a.qualityResult === 'passed' ? 'green' : a.qualityResult === 'failed' ? 'red' : 'orange',
            children: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text strong style={{ color: colors.navy }}>{a.code}</Text>
                <Tag color={qualityResultConfig[a.qualityResult].color === '#059669' ? 'green' : a.qualityResult === 'failed' ? 'red' : 'orange'}>
                  {qualityResultConfig[a.qualityResult].label}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(a.inspectionDate)}</Text>
                {a.id === id && <Tag color="blue">Đang xem</Tag>}
              </div>
            ),
          }))} />
        </Card>
      )}
    </div>
  );

  // ─── Tab 2: Kết quả kiểm tra ────────────────────────────────────────────
  const inspectionColumns: ColumnsType<InspectionResult> = [
    {
      title: 'Tiêu chí kiểm tra', dataIndex: 'checklistItem', key: 'checklistItem',
      render: (text: string, r: InspectionResult) => (
        <div>
          <Text style={{ fontSize: 13 }}>{text}</Text>
          {r.standardRef && <div><Text type="secondary" style={{ fontSize: 11 }}>{r.standardRef}</Text></div>}
        </div>
      ),
    },
    {
      title: 'Giá trị thực tế', dataIndex: 'actualValue', key: 'actualValue', width: 160,
      render: (v: string, r: InspectionResult) => (
        <div>
          <Text strong style={{ color: r.result === 'fail' ? '#dc2626' : r.result === 'pass' ? '#059669' : '#666' }}>{v}</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>Yêu cầu: {r.passThreshold}</Text></div>
        </div>
      ),
    },
    {
      title: 'Kết quả', dataIndex: 'result', key: 'result', width: 100, align: 'center' as const,
      render: (r: string) => {
        const cfg = inspectionResultConfig[r as 'pass' | 'fail' | 'na'];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'KTV / Ngày', key: 'inspector', width: 160,
      render: (_: unknown, r: InspectionResult) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserOutlined style={{ fontSize: 11, color: '#999' }} />
            <Text style={{ fontSize: 12 }}>{r.inspector}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(r.inspectedAt)}</Text>
        </div>
      ),
    },
  ];

  const renderInspection = () => (
    <Card className="db-chart-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
            <CheckSquareOutlined />
          </div>
          <Title level={5} style={{ margin: 0, color: colors.navy }}>Kết quả kiểm tra chất lượng</Title>
          <Space>
            <Tag color="green">{passCount} đạt</Tag>
            {failCount > 0 && <Tag color="red">{failCount} không đạt</Tag>}
          </Space>
        </div>
        {!acceptance.isLocked && (
          <Button icon={<SyncOutlined />} style={{ borderColor: colors.navy, color: colors.navy }}>
            Import từ P.KCS
          </Button>
        )}
      </div>
      {inspections.length === 0
        ? <Empty description="Chưa có kết quả kiểm tra" />
        : (
          <Table
            dataSource={inspections} columns={inspectionColumns}
            rowKey="id" size="small" pagination={false}
            rowClassName={(r: InspectionResult) => r.result === 'fail' ? 'row-highlight' : ''}
          />
        )}
    </Card>
  );

  // ─── Tab 3: Lỗi & Rework ────────────────────────────────────────────────
  const defectColumns: ColumnsType<Defect> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 130,
      render: (text: string) => <Text strong style={{ fontSize: 12, color: colors.navy }}>{text}</Text>,
    },
    {
      title: 'Mô tả lỗi', key: 'defect',
      render: (_: unknown, r: Defect) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.title}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text></div>
        </div>
      ),
    },
    {
      title: 'Mức độ', dataIndex: 'severity', key: 'severity', width: 130,
      render: (s: string) => {
        const cfg = defectSeverityConfig[s as keyof typeof defectSeverityConfig];
        return <Tag color={cfg.antColor}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => {
        const cfg = defectStatusConfig[s as keyof typeof defectStatusConfig];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Phát hiện', key: 'found', width: 160,
      render: (_: unknown, r: Defect) => (
        <div>
          <Text style={{ fontSize: 12 }}>{r.foundBy}</Text>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{formatDate(r.foundAt)}</Text></div>
        </div>
      ),
    },
  ];

  const reworkColumns: ColumnsType<ReworkRequest> = [
    {
      title: 'Mã', dataIndex: 'code', key: 'code', width: 130,
      render: (text: string) => <Text strong style={{ fontSize: 12, color: colors.navy }}>{text}</Text>,
    },
    { title: 'Nội dung khắc phục', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Đơn vị TH', dataIndex: 'assignedUnit', key: 'assignedUnit', width: 80,
      render: (u: string) => <Tag>{u}</Tag>,
    },
    {
      title: 'Tiến độ', key: 'progress', width: 120,
      render: (_: unknown, r: ReworkRequest) => (
        <Progress percent={r.progressPercent} size="small" strokeColor={r.progressPercent === 100 ? '#059669' : colors.navy} />
      ),
    },
    {
      title: 'Hạn xử lý', dataIndex: 'dueDate', key: 'dueDate', width: 110,
      render: (d: string) => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => {
        const cfg = reworkStatusConfig[s as keyof typeof reworkStatusConfig];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  const renderDefectsRework = () => (
    <div>
      {/* Cảnh báo */}
      {criticalDefects.length > 0 && acceptance.qualityResult === 'failed' && (
        <Alert
          type="error" showIcon icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16, borderRadius: 10 }}
          message={`${criticalDefects.length} lỗi nghiêm trọng (Critical) — Yêu cầu khắc phục bắt buộc trước khi tái nghiệm thu`}
        />
      )}

      {/* Defect table */}
      <Card className="db-chart-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #dc2626, #f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
              <ExclamationCircleOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: colors.navy }}>Danh sách lỗi phát hiện</Title>
            <Badge count={defectList.length} style={{ backgroundColor: defectList.length > 0 ? '#dc2626' : '#059669' }} />
          </div>
          {!acceptance.isLocked && acceptance.status === 'inspecting' && (
            <Button type="primary" size="small" icon={<ExclamationCircleOutlined />}
              style={{ background: '#dc2626', borderColor: '#dc2626' }}>
              Thêm lỗi
            </Button>
          )}
        </div>
        {defectList.length === 0
          ? <Empty description="Không có lỗi phát hiện" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : <Table dataSource={defectList} columns={defectColumns} rowKey="id" size="small" pagination={false} />}
      </Card>

      {/* Rework tracker */}
      <Card className="db-chart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
              <ToolOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: colors.navy }}>Yêu cầu & Theo dõi khắc phục</Title>
          </div>
          {acceptance.qualityResult === 'failed' && openDefects.length > 0 && (
            <Button type="primary" size="small" icon={<ToolOutlined />}
              style={{ background: '#d97706', borderColor: '#d97706' }}
              onClick={() => setReworkDrawerOpen(true)}>
              Tạo yêu cầu Rework
            </Button>
          )}
        </div>
        {reworkList.length === 0
          ? <Empty description="Chưa có yêu cầu khắc phục" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <div>
              <Table dataSource={reworkList} columns={reworkColumns} rowKey="id" size="small" pagination={false} style={{ marginBottom: 16 }} />
              {reworkList[0]?.reworkNotes && (
                <div style={{ background: '#f0fff4', borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid #059669` }}>
                  <Text strong style={{ fontSize: 12, color: '#059669', display: 'block', marginBottom: 4 }}>
                    <CheckCircleOutlined style={{ marginRight: 6 }} />Ghi chú khắc phục
                  </Text>
                  <Text style={{ fontSize: 12 }}>{reworkList[0].reworkNotes}</Text>
                  {reworkList[0].completedAt && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Hoàn thành: {formatDate(reworkList[0].completedAt)}
                        {reworkList[0].verifiedBy ? ` — Xác nhận: ${reworkList[0].verifiedBy}` : ''}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
      </Card>
    </div>
  );

  // ─── Tab 4: Bàn giao ────────────────────────────────────────────────────
  const renderHandover = () => {
    if (!handover) {
      return (
        <Card className="db-chart-card">
          <Empty
            description={acceptance.qualityResult === 'passed' || acceptance.status === 'handed_over'
              ? 'Chưa có biên bản bàn giao'
              : 'Chỉ tạo bàn giao sau khi nghiệm thu ĐẠT'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {(acceptance.qualityResult === 'passed') && (
              <Button type="primary" icon={<SendOutlined />}
                style={{ background: colors.navy, borderColor: colors.navy }}
                onClick={() => setHandoverDrawerOpen(true)}>
                Tạo biên bản bàn giao
              </Button>
            )}
          </Empty>
        </Card>
      );
    }
    const hConf = handoverStatusConfig[handover.status];
    const htConf = handoverTypeConfig[handover.handoverType];
    const reqDocs = handoverDocs.filter(d => d.isRequired);
    const missingDocs = reqDocs.filter(d => !d.fileAttached);

    return (
      <div>
        {missingDocs.length > 0 && (
          <Alert type="warning" showIcon style={{ marginBottom: 16, borderRadius: 10 }}
            message={`Còn ${missingDocs.length} hồ sơ bắt buộc chưa đính kèm: ${missingDocs.map(d => d.docName).join(', ')}`}
          />
        )}
        <Card className="db-chart-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
              <SendOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: colors.navy }}>Biên bản bàn giao {handover.code}</Title>
            <Tag color={hConf.color}>{hConf.label}</Tag>
            <Tag color={htConf.color}>{htConf.label}</Tag>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Ngày bàn giao">{formatDate(handover.handoverDate)}</Descriptions.Item>
                <Descriptions.Item label="Đại diện giao">{handover.handoverBy}</Descriptions.Item>
                <Descriptions.Item label="Đại diện nhận">{handover.receivedBy}</Descriptions.Item>
                <Descriptions.Item label="Đơn vị nhận">{handover.receivingUnit}</Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Sản phẩm / Vật tư">{handover.itemsDescription}</Descriptions.Item>
                <Descriptions.Item label="Số lượng">{handover.quantity}</Descriptions.Item>
                <Descriptions.Item label="Tình trạng">{handover.conditionNote || '—'}</Descriptions.Item>
                {handover.signedAt && <Descriptions.Item label="Ngày ký">{formatDate(handover.signedAt)}</Descriptions.Item>}
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Hồ sơ kèm theo */}
        <Card className="db-chart-card">
          <Title level={5} style={{ margin: '0 0 14px', color: colors.navy }}>
            <AuditOutlined style={{ marginRight: 8 }} />Hồ sơ kèm theo
          </Title>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {handoverDocs.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: doc.fileAttached ? '#f6ffed' : doc.isRequired ? '#fff2f0' : '#fafafa',
                borderRadius: 8, padding: '10px 14px',
                border: `1px solid ${doc.fileAttached ? '#b7eb8f' : doc.isRequired ? '#ffccc7' : '#e8e8e8'}`,
              }}>
                <Space size={10}>
                  {doc.fileAttached
                    ? <CheckCircleOutlined style={{ color: '#059669', fontSize: 16 }} />
                    : <CloseCircleOutlined style={{ color: doc.isRequired ? '#dc2626' : '#bfbfbf', fontSize: 16 }} />}
                  <div>
                    <Text strong style={{ fontSize: 13 }}>{doc.docName}</Text>
                    <div>
                      <Tag style={{ fontSize: 10 }}>{handoverDocTypeConfig[doc.docType].label}</Tag>
                      {doc.docNumber && <Text type="secondary" style={{ fontSize: 11 }}>#{doc.docNumber}</Text>}
                      {doc.isRequired && <Tag color="red" style={{ fontSize: 10, marginLeft: 4 }}>Bắt buộc</Tag>}
                    </div>
                  </div>
                </Space>
                {!doc.fileAttached && (
                  <Button size="small" icon={<FileDoneOutlined />}>Đính kèm</Button>
                )}
              </div>
            ))}
          </Space>
        </Card>
      </div>
    );
  };

  // ─── Tab 5: Lịch sử ─────────────────────────────────────────────────────
  const renderHistory = () => {
    const logs = [
      { time: acceptance.createdAt, action: 'Tạo biên bản nghiệm thu', actor: 'P.Kế hoạch', color: 'blue' },
      { time: acceptance.inspectionDate, action: `Bắt đầu kiểm tra — Đoàn: ${acceptance.inspectorTeam}`, actor: 'P.KCS', color: 'cyan' },
      ...(inspections.length > 0 ? [{ time: acceptance.inspectionDate, action: `Ghi nhận ${inspections.length} tiêu chí kiểm tra`, actor: 'P.KCS', color: 'geekblue' }] : []),
      ...(defectList.length > 0 ? [{ time: acceptance.inspectionDate, action: `Phát hiện ${defectList.length} lỗi (${criticalDefects.length} nghiêm trọng)`, actor: 'P.KCS', color: 'red' }] : []),
      ...(reworkList.length > 0 ? [{ time: reworkList[0].completedAt || reworkList[0].dueDate, action: `Tạo yêu cầu khắc phục ${reworkList[0].code}`, actor: 'P.Kế hoạch', color: 'orange' }] : []),
      ...(reworkList.filter(r => r.completedAt).map(r => ({ time: r.completedAt!, action: `Hoàn thành khắc phục ${r.code}`, actor: r.assignedUnit, color: 'green' }))),
      ...(acceptance.qualityResult !== 'pending' ? [{
        time: acceptance.inspectionDate,
        action: `Kết quả: ${qualityConf.label}`,
        actor: 'P.KCS',
        color: acceptance.qualityResult === 'passed' ? 'green' : acceptance.qualityResult === 'failed' ? 'red' : 'orange',
      }] : []),
      ...(acceptance.isLocked ? [{ time: acceptance.inspectionDate, action: 'Biên bản đã khóa (locked)', actor: 'Hệ thống', color: 'purple' }] : []),
      ...(handover ? [{ time: handover.handoverDate, action: `Bàn giao ${handover.code} — ${handover.receivingUnit}`, actor: handover.handoverBy, color: 'gold' }] : []),
    ].filter(l => l.time).sort((a, b) => dayjs(a.time).unix() - dayjs(b.time).unix());

    return (
      <Card className="db-chart-card">
        <Title level={5} style={{ margin: '0 0 16px', color: colors.navy }}>
          <ClockCircleOutlined style={{ marginRight: 8 }} />Lịch sử hoạt động
        </Title>
        <Timeline items={logs.map(l => ({
          color: l.color,
          children: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text style={{ fontSize: 13 }}>{l.action}</Text>
                <div>
                  <Tag style={{ fontSize: 10 }}>{l.actor}</Tag>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, marginLeft: 12 }}>
                {dayjs(l.time).format('DD/MM/YYYY')}
              </Text>
            </div>
          ),
        }))} />
      </Card>
    );
  };

  // ─── Tab items ──────────────────────────────────────────────────────────
  const tabItems = [
    { key: 'overview', label: <span><SafetyCertificateOutlined /> Tổng quan</span>, children: renderOverview() },
    {
      key: 'inspection',
      label: (
        <span>
          <CheckSquareOutlined /> Kết quả kiểm tra
          {failCount > 0 && <Badge count={failCount} size="small" style={{ marginLeft: 4, backgroundColor: '#dc2626' }} />}
        </span>
      ),
      children: renderInspection(),
    },
    {
      key: 'defects',
      label: (
        <span>
          <ExclamationCircleOutlined /> Lỗi & Rework
          {openDefects.length > 0 && <Badge count={openDefects.length} size="small" style={{ marginLeft: 4, backgroundColor: '#d97706' }} />}
        </span>
      ),
      children: renderDefectsRework(),
    },
    {
      key: 'handover',
      label: (
        <span>
          <SendOutlined /> Bàn giao
          {handover && <Badge dot style={{ marginLeft: 4 }} />}
        </span>
      ),
      children: renderHandover(),
    },
    { key: 'history', label: <span><ClockCircleOutlined /> Lịch sử</span>, children: renderHistory() },
  ];

  // ─── Action buttons theo trạng thái ─────────────────────────────────────
  const renderActions = () => {
    if (acceptance.isLocked && acceptance.status !== 'handed_over') return (
      <Tag icon={<LockOutlined />} color="purple">Biên bản đã khóa</Tag>
    );
    if (acceptance.status === 'handed_over') return (
      <Tag icon={<CheckCircleOutlined />} color="green">Đã bàn giao</Tag>
    );
    if (acceptance.status === 'inspecting') return (
      <Space>
        <Button icon={<CheckCircleOutlined />} style={{ background: '#059669', borderColor: '#059669', color: '#fff' }}
          onClick={() => { setResultType('pass'); setRecordResultOpen(true); }}>
          Ghi nhận ĐẠT
        </Button>
        <Button icon={<CloseCircleOutlined />} danger
          onClick={() => { setResultType('fail'); setRecordResultOpen(true); }}>
          Ghi nhận KHÔNG ĐẠT
        </Button>
      </Space>
    );
    if (acceptance.status === 'failed') return (
      <Button icon={<ToolOutlined />} style={{ background: '#d97706', borderColor: '#d97706', color: '#fff' }}
        onClick={() => setReworkDrawerOpen(true)}>
        Tạo yêu cầu Rework
      </Button>
    );
    if (acceptance.status === 'passed' && !handover) return (
      <Button type="primary" icon={<SendOutlined />}
        style={{ background: colors.navy, borderColor: colors.navy }}
        onClick={() => setHandoverDrawerOpen(true)}>
        Tạo biên bản bàn giao
      </Button>
    );
    return null;
  };

  return (
    <div>
      {/* Hero banner */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space align="center" size={16}>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#fff' }} onClick={() => navigate(-1)} />
            <SafetyCertificateOutlined style={{ fontSize: 28, color: colors.gold }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{acceptance.name}</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>{acceptance.code}</Tag>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
                  Chu kỳ #{acceptance.cycleNumber}
                </Tag>
                {contract && <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>{contract.code}</Tag>}
              </Space>
            </div>
          </Space>
          <Space direction="vertical" align="end" size={6}>
            <div style={{ background: qualityConf.bg, border: `1px solid ${qualityConf.color}`, borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
              <Text strong style={{ color: qualityConf.color, fontSize: 14 }}>{qualityConf.label}</Text>
            </div>
            <Tag color={statusConf.color} style={{ fontSize: 12 }}>{statusConf.label}</Tag>
          </Space>
        </div>
        {/* Metadata row */}
        <div style={{ padding: '12px 24px', background: '#fff', display: 'flex', gap: 28, flexWrap: 'wrap', borderTop: '1px solid #f0f0f0', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày kiểm tra</Text>
              <Text strong style={{ fontSize: 13 }}>{formatDate(acceptance.inspectionDate)}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đoàn kiểm tra</Text>
              <Text strong style={{ fontSize: 13 }}>{acceptance.inspectorTeam}</Text>
            </div>
            {workItem && (
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Hạng mục WBS</Text>
                <Text strong style={{ fontSize: 13 }}>{workItem.code} — {workItem.name}</Text>
              </div>
            )}
          </div>
          <div>{renderActions()}</div>
        </div>
      </Card>

      <Tabs items={tabItems} />

      {/* ─── Drawer: Ghi nhận kết quả ──────────────────────────────────── */}
      <Modal
        title={resultType === 'pass' ? 'Ghi nhận kết quả ĐẠT' : 'Ghi nhận kết quả KHÔNG ĐẠT'}
        open={recordResultOpen}
        onCancel={() => setRecordResultOpen(false)}
        onOk={() => {
          message.success(`Đã ghi nhận kết quả: ${resultType === 'pass' ? 'ĐẠT' : 'KHÔNG ĐẠT'}`);
          setRecordResultOpen(false);
        }}
        okText="Xác nhận"
        okButtonProps={{ style: resultType === 'pass' ? { background: '#059669', borderColor: '#059669' } : { background: '#dc2626', borderColor: '#dc2626' } }}
        width={480}
      >
        <Form form={resultForm} layout="vertical" style={{ marginTop: 16 }}>
          {resultType === 'pass' && (
            <Form.Item label="Kết quả chi tiết" name="resultType" initialValue="passed">
              <Select options={[
                { value: 'passed', label: 'ĐẠT — Đủ điều kiện toàn bộ' },
                { value: 'conditional', label: 'ĐẠT CÓ ĐIỀU KIỆN — Còn lỗi minor' },
              ]} />
            </Form.Item>
          )}
          <Form.Item label="Kết luận / Ghi chú" name="conclusion" rules={[{ required: true, message: 'Nhập kết luận' }]}>
            <Input.TextArea rows={3} placeholder={resultType === 'pass' ? 'Ghi nhận kết luận nghiệm thu đạt...' : 'Mô tả lý do không đạt, yêu cầu khắc phục...'} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Drawer: Tạo yêu cầu Rework ──────────────────────────────── */}
      <Drawer
        title={null} placement="right" width={500}
        open={reworkDrawerOpen}
        onClose={() => setReworkDrawerOpen(false)}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setReworkDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: '#d97706', borderColor: '#d97706' }}
              onClick={() => { message.success('Đã tạo yêu cầu khắc phục, thông báo đến PX thực hiện'); setReworkDrawerOpen(false); }}>
              Tạo yêu cầu Rework
            </Button>
          </div>
        }
      >
        <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ToolOutlined style={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Tạo yêu cầu khắc phục</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{acceptance.code} — {defectList.length} lỗi cần xử lý</div>
            </div>
          </Space>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ background: '#fff2f0', borderRadius: 8, padding: '12px 14px', marginBottom: 16, borderLeft: '3px solid #dc2626' }}>
            <Text strong style={{ fontSize: 12, color: '#dc2626', display: 'block', marginBottom: 8 }}>Lỗi cần khắc phục:</Text>
            {defectList.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <Text style={{ fontSize: 12 }}>{d.title}</Text>
                <Tag color={defectSeverityConfig[d.severity].antColor} style={{ fontSize: 10 }}>
                  {defectSeverityConfig[d.severity].label}
                </Tag>
              </div>
            ))}
          </div>
          <Form form={reworkForm} layout="vertical" requiredMark="optional">
            <Form.Item label="Nội dung yêu cầu khắc phục" name="description" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết yêu cầu khắc phục..." />
            </Form.Item>
            <Form.Item label="Giao cho đơn vị" name="assignedUnit" rules={[{ required: true }]}>
              <Select options={[
                { value: 'PX1', label: 'PX1 — Trung tâm Hệ thống Monitoring' },
                { value: 'PX2', label: 'PX2 — Trung tâm Module CRM' },
                { value: 'PX3', label: 'PX3 — Trung tâm Hạ tầng' },
                { value: 'PX4', label: 'PX4 — Trung tâm Phần mềm' },
              ]} />
            </Form.Item>
            <Form.Item label="Hạn hoàn thành" name="dueDate" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Form>
        </div>
      </Drawer>

      {/* ─── Drawer: Tạo bàn giao ─────────────────────────────────────── */}
      <Drawer
        title={null} placement="right" width={520}
        open={handoverDrawerOpen}
        onClose={() => setHandoverDrawerOpen(false)}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setHandoverDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: colors.navy, borderColor: colors.navy }}
              onClick={() => { message.success('Đã tạo biên bản bàn giao'); setHandoverDrawerOpen(false); }}>
              Lưu biên bản bàn giao
            </Button>
          </div>
        }
      >
        <div style={{ background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`, padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SendOutlined style={{ fontSize: 18, color: colors.gold }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Tạo biên bản bàn giao</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{contract?.partnerUnit} — {contract?.code}</div>
            </div>
          </Space>
        </div>
        <div style={{ padding: 20 }}>
          <Form form={handoverForm} layout="vertical" requiredMark="optional">
            <Form.Item label="Loại bàn giao" name="handoverType" initialValue="partial">
              <Select options={[
                { value: 'partial', label: 'Bàn giao từng phần' },
                { value: 'final', label: 'Bàn giao toàn bộ (kết thúc HĐ)' },
              ]} />
            </Form.Item>
            <Form.Item label="Ngày bàn giao" name="handoverDate" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Đại diện Doanh nghiệp A (bên giao)" name="handoverBy" rules={[{ required: true }]}>
                  <Input placeholder="Phạm Quốc Hưng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Đại diện bên nhận" name="receivedBy" rules={[{ required: true }]}>
                  <Input placeholder="Họ tên và chức danh" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Mô tả sản phẩm / vật tư bàn giao" name="itemsDescription" rules={[{ required: true }]}>
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Tình trạng khi bàn giao" name="conditionNote">
              <Input.TextArea rows={2} placeholder="Mô tả tình trạng kỹ thuật tại thời điểm bàn giao..." />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default AcceptanceDetail;
