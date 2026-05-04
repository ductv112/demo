import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Space, Tag, Button,
  Table, Descriptions, Alert, Progress,
} from 'antd';
import {
  ArrowLeftOutlined, CheckSquareOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  UserOutlined, CalendarOutlined, SafetyOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { controlSheets } from '../../data/controlSheets';
import {
  controlSheetStatusConfig, checkItemResultConfig, shiftConfig,
  hazardCategoryConfig, formatDate, formatDateTime,
} from '../../utils/format';
import type { SafetyCheckItem, HazardCategory } from '../../types';

const { Text } = Typography;

const SafetyControlDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const sheet = controlSheets.find(s => s.id === id);

  if (!sheet) {
    return (
      <Alert
        message="Không tìm thấy phiếu kiểm soát"
        type="error"
        showIcon
        action={<Button onClick={() => navigate('/kiem-soat-van-hanh')}>Quay lại</Button>}
      />
    );
  }

  const statusCfg   = controlSheetStatusConfig[sheet.status];
  const totalChecked = sheet.checkItems.filter(i => i.result !== 'na' && i.result !== 'pending').length;
  const passRate     = totalChecked > 0 ? Math.round((sheet.passCount / totalChecked) * 100) : 0;

  const columns: ColumnsType<SafetyCheckItem> = [
    {
      title: 'STT',
      width: 50,
      render: (_: unknown, _r: SafetyCheckItem, idx: number) => (
        <Text style={{ fontSize: 13, color: '#8c8c8c' }}>{idx + 1}</Text>
      ),
    },
    {
      title: 'Nội dung kiểm tra',
      render: (_: unknown, record: SafetyCheckItem) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1B3A5C' }}>{record.description}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>Yêu cầu: {record.requirement}</div>
          {record.correctionAction && (
            <div style={{ fontSize: 11, color: '#cf1322', marginTop: 4, padding: '4px 8px', background: '#fff1f0', borderRadius: 4, borderLeft: '2px solid #ff4d4f' }}>
              <ToolOutlined style={{ marginRight: 4 }} />Xử lý: {record.correctionAction}
            </div>
          )}
          {record.note && <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>Ghi chú: {record.note}</div>}
        </div>
      ),
    },
    {
      title: 'Loại nguy cơ',
      dataIndex: 'category',
      width: 130,
      render: (cat: HazardCategory) => {
        const cfg = hazardCategoryConfig[cat];
        return <Tag style={{ fontSize: 11, borderRadius: 4, color: cfg.color, borderColor: cfg.color }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngưỡng cho phép',
      dataIndex: 'thresholdValue',
      width: 150,
      render: (v?: string) => v
        ? <Text style={{ fontSize: 12, color: '#1890ff' }}>{v}</Text>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Giá trị đo',
      dataIndex: 'measuredValue',
      width: 130,
      render: (v?: string) => v
        ? <Text style={{ fontSize: 12, fontWeight: 600 }}>{v}</Text>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      width: 120,
      align: 'center',
      render: (result: string) => {
        const cfg = checkItemResultConfig[result as keyof typeof checkItemResultConfig];
        const icon = result === 'pass'
          ? <CheckCircleOutlined />
          : result === 'fail'
          ? <CloseCircleOutlined />
          : null;
        return (
          <Tag
            icon={icon}
            style={{
              background: result === 'pass' ? '#f6ffed' : result === 'fail' ? '#fff1f0' : '#f5f5f5',
              color: cfg.color,
              border: `1px solid ${cfg.color}30`,
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      {/* ─── Hero header banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1B3A5C 60%, #2d5a8e 100%)',
        borderRadius: 14, marginBottom: 0,
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space align="center" size={14}>
            <button
              onClick={() => navigate('/kiem-soat-van-hanh')}
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
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckSquareOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', lineHeight: '24px' }}>
                Phiếu kiểm soát vận hành — {sheet.workshopName}
              </div>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 4, fontSize: 11 }}>
                  {sheet.code}
                </Tag>
                <Tag style={{ background: 'rgba(212,168,67,0.2)', color: '#f0d890', border: '1px solid rgba(212,168,67,0.4)', borderRadius: 4, fontSize: 11 }}>
                  {shiftConfig[sheet.shift].label}
                </Tag>
              </Space>
            </div>
          </Space>

          {/* Status */}
          <Space size={8} style={{ flexShrink: 0, marginTop: 4 }}>
            <Tag color={statusCfg.color} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}>
              {statusCfg.label}
            </Tag>
          </Space>
        </div>

        {/* Info strip */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Trung tâm',     value: <span style={{ color: '#fff', fontWeight: 600 }}>{sheet.workshopName}</span> },
            { label: 'Ca làm việc',   value: <span style={{ color: '#fff', fontWeight: 600 }}>{shiftConfig[sheet.shift].label}</span> },
            { label: 'Ngày kiểm tra', value: <span style={{ color: '#fff', fontWeight: 600 }}>{formatDate(sheet.date)}</span> },
            { label: 'Người kiểm tra', value: <span style={{ color: '#fff', fontWeight: 600 }}>{sheet.inspector}</span> },
            { label: 'Trạng thái',    value: <Tag color={statusCfg.color} style={{ margin: 0 }}>{statusCfg.label}</Tag> },
            ...(sheet.verifiedBy ? [{ label: 'Xác nhận bởi', value: <span style={{ color: '#52c41a', fontWeight: 600 }}>{sheet.verifiedBy}</span> }] : []),
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Summary strip */}
        <div style={{ margin: '16px 24px', padding: '12px 16px', borderLeft: '3px solid #D4A843', background: 'rgba(255,255,255,0.05)', borderRadius: '0 8px 8px 0' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Tổng số hạng mục: <strong style={{ color: '#fff' }}>{sheet.checkItems.length}</strong> điểm —
            Đạt: <strong style={{ color: '#52c41a' }}>{sheet.passCount}</strong> —
            Không đạt: <strong style={{ color: '#ff4d4f' }}>{sheet.failCount}</strong> —
            Không áp dụng: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{sheet.naCount}</strong>
          </Text>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ margin: '16px 0' }}>
        {[
          { label: 'Tổng hạng mục',  value: sheet.checkItems.length, unit: 'điểm',    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Đạt yêu cầu',    value: sheet.passCount,         unit: 'hạng mục', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
          { label: 'Không đạt',       value: sheet.failCount,         unit: 'hạng mục', gradient: 'linear-gradient(135deg, #cf1322, #ff4d4f)' },
          { label: 'Không áp dụng',  value: sheet.naCount,           unit: 'hạng mục', gradient: 'linear-gradient(135deg, #8c8c8c, #bfbfbf)' },
        ].map(card => (
          <Col xs={12} sm={6} key={card.label}>
            <div
              style={{
                background: card.gradient, borderRadius: 12, padding: '16px 20px',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {card.value}
                <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4, fontWeight: 400 }}>{card.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{card.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ─── Nội dung chính ─── */}
      <Row gutter={[16, 16]}>
        {/* ─── Cột trái: checklist ─── */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquareOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Danh mục kiểm tra ({sheet.checkItems.length} điểm)</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 0 } }}
          >
            <Table<SafetyCheckItem>
              dataSource={sheet.checkItems}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              rowClassName={(r) => r.result === 'fail' ? 'row-critical' : ''}
            />
          </Card>

          {sheet.note && (
            <Card
              title={
                <Space size={10}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                  </div>
                  <Text strong style={{ color: '#d97706' }}>Ghi chú chung</Text>
                </Space>
              }
              style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              styles={{ body: { padding: 16 } }}
            >
              <Text style={{ fontSize: 13 }}>{sheet.note}</Text>
            </Card>
          )}
        </Col>

        {/* ─── Cột phải ─── */}
        <Col xs={24} lg={10}>
          {/* Kết quả tổng hợp (progress circle) */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Kết quả tổng hợp</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Progress
                type="circle"
                percent={passRate}
                strokeColor={passRate >= 90 ? '#52c41a' : passRate >= 70 ? '#faad14' : '#ff4d4f'}
                size={90}
                format={pct => (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>đạt</div>
                  </div>
                )}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Đạt yêu cầu',     count: sheet.passCount, bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
                { label: 'Không đạt',        count: sheet.failCount, bg: '#fff1f0', color: '#ff4d4f', border: '#ffccc7' },
                { label: 'Không áp dụng',   count: sheet.naCount,   bg: '#f5f5f5', color: '#8c8c8c', border: '#d9d9d9' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: row.bg, border: `1px solid ${row.border}` }}>
                  <Text style={{ fontSize: 13 }}>{row.label}</Text>
                  <Text strong style={{ fontSize: 16, color: row.color }}>{row.count}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Thông tin phiếu */}
          <Card
            title={
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ color: '#1B3A5C' }}>Thông tin phiếu</Text>
              </Space>
            }
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 16 } }}
          >
            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label={<><UserOutlined style={{ marginRight: 4 }} />Người kiểm tra</>}>
                {sheet.inspector}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined style={{ marginRight: 4 }} />Ngày</>}>
                {formatDate(sheet.date)}
              </Descriptions.Item>
              <Descriptions.Item label="Ca làm việc">
                {shiftConfig[sheet.shift].label}
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm">
                <Text strong>{sheet.workshopName}</Text>
              </Descriptions.Item>
              {sheet.submittedAt && (
                <Descriptions.Item label="Nộp lúc">
                  {formatDateTime(sheet.submittedAt)}
                </Descriptions.Item>
              )}
              {sheet.verifiedBy && (
                <Descriptions.Item label={<><SafetyOutlined style={{ marginRight: 4, color: '#52c41a' }} />Xác nhận bởi</>}>
                  <Text strong style={{ color: '#1B3A5C' }}>{sheet.verifiedBy}</Text>
                </Descriptions.Item>
              )}
              {sheet.verifiedAt && (
                <Descriptions.Item label="Thời gian xác nhận">
                  <Text style={{ color: '#52c41a' }}>{formatDateTime(sheet.verifiedAt)}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SafetyControlDetailPage;
