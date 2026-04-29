import React, { useState, useMemo } from 'react';
import {
  Button, Card, Row, Col, Table, Tag, Typography, Dropdown,
  Input, Select, Space, message, Modal, Drawer, Form, DatePicker,
} from 'antd';
import {
  SafetyCertificateOutlined, CheckCircleOutlined, CloseCircleOutlined,
  SendOutlined, CheckSquareOutlined, MoreOutlined, FileTextOutlined,
  SearchOutlined, SyncOutlined, ToolOutlined, PlusOutlined,
  EyeOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { acceptanceRecords } from '../../data/acceptance';
import { contracts } from '../../data/contracts';
import { formatDate, acceptanceStatusConfig, qualityResultConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { AcceptanceRecord } from '../../types';

const { Title, Text } = Typography;

const Acceptance: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterContract, setFilterContract] = useState<string | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm] = Form.useForm();

  const handleSync = () => {
    setSyncing(true);
    message.loading({ content: 'Đang đồng bộ từ phân hệ CL, TN&NT, ĐL&KĐ...', key: 'sync', duration: 2 });
    setTimeout(() => {
      setSyncing(false);
      message.destroy('sync');
      Modal.success({
        title: 'Đồng bộ dữ liệu hoàn tất',
        width: 440,
        content: (
          <div style={{ paddingTop: 8 }}>
            <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px' }}>
              {[
                { name: 'Quản lý Chất lượng (P.KCS)', count: `${acceptanceRecords.filter(r => r.qualityResult !== 'pending').length} kết quả` },
                { name: 'Quản lý Thử nghiệm & Nghiệm thu', count: `${acceptanceRecords.filter(r => r.testResult).length} kết quả TN` },
                { name: 'Quản lý Đo lường & Kiểm định', count: `${acceptanceRecords.filter(r => r.measurementResult).length} kết quả ĐL` },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ fontSize: 13 }}>{s.name}</span><Tag color="blue">{s.count}</Tag>
                </div>
              ))}
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              {dayjs().format('DD/MM/YYYY HH:mm:ss')}
            </Text>
          </div>
        ),
      });
    }, 2000);
  };

  const filteredRecords = useMemo(() => {
    let result = acceptanceRecords;
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(kw) || r.code.toLowerCase().includes(kw));
    }
    if (filterStatus) result = result.filter(r => r.status === filterStatus);
    if (filterContract) result = result.filter(r => r.contractId === filterContract);
    return result;
  }, [searchText, filterStatus, filterContract]);

  const stats = useMemo(() => ({
    total: acceptanceRecords.length,
    inspecting: acceptanceRecords.filter(r => r.status === 'inspecting').length,
    passed: acceptanceRecords.filter(r => r.status === 'passed' || r.status === 'handed_over').length,
    failed: acceptanceRecords.filter(r => r.status === 'failed' || r.status === 'remediation').length,
    handedOver: acceptanceRecords.filter(r => r.status === 'handed_over').length,
    reworkCycles: acceptanceRecords.filter(r => r.cycleNumber > 1).length,
  }), []);

  const statCards = [
    { title: 'Tổng nghiệm thu', value: stats.total, suffix: 'phiếu', icon: <SafetyCertificateOutlined />, gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)` },
    { title: 'Đang kiểm tra', value: stats.inspecting, suffix: 'phiếu', icon: <CheckSquareOutlined />, gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)' },
    { title: 'Đạt', value: stats.passed, suffix: 'phiếu', icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' },
    { title: 'Không đạt / Rework', value: stats.failed, suffix: 'phiếu', icon: <ExclamationCircleOutlined />, gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' },
    { title: 'Đã bàn giao', value: stats.handedOver, suffix: 'phiếu', icon: <SendOutlined />, gradient: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` },
  ];

  const tableData = useMemo(() => {
    return filteredRecords.map(r => ({
      ...r,
      contractCode: contracts.find(c => c.id === r.contractId)?.code || r.contractId,
    }));
  }, [filteredRecords]);

  type TableRow = AcceptanceRecord & { contractCode: string };

  const columns: ColumnsType<TableRow> = [
    {
      title: 'Mã NT', dataIndex: 'code', key: 'code', width: 140,
      render: (text: string, r: TableRow) => (
        <Button type="link" style={{ padding: 0, fontWeight: 600, color: colors.navy }}
          onClick={() => navigate(`/acceptance/${r.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Tên nghiệm thu', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (text: string, r: TableRow) => (
        <div>
          <Text style={{ fontSize: 13 }}>{text}</Text>
          {r.cycleNumber > 1 && <Tag color="orange" style={{ fontSize: 10, marginLeft: 6 }}>Chu kỳ #{r.cycleNumber}</Tag>}
        </div>
      ),
    },
    {
      title: 'Hợp đồng', dataIndex: 'contractCode', key: 'contractCode', width: 150,
      render: (text: string) => <Text style={{ fontSize: 12, color: colors.navyLight }}>{text}</Text>,
    },
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 110,
      render: (type: string) => <Tag color={type === 'final' ? 'purple' : 'blue'}>{type === 'final' ? 'Tổng thể' : 'Giai đoạn'}</Tag>,
    },
    {
      title: 'Ngày KT', dataIndex: 'inspectionDate', key: 'inspectionDate', width: 110,
      render: (d: string) => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Kết quả', dataIndex: 'qualityResult', key: 'qualityResult', width: 170,
      render: (result: string) => {
        const cfg = qualityResultConfig[result as keyof typeof qualityResultConfig];
        if (!cfg) return <Tag>{result}</Tag>;
        return (
          <Tag style={{ borderColor: cfg.color, color: cfg.color, background: cfg.bg, fontWeight: 600 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (status: string) => {
        const cfg = acceptanceStatusConfig[status as keyof typeof acceptanceStatusConfig];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: '', key: 'action', width: 80, fixed: 'right' as const,
      render: (_: unknown, record: TableRow) => (
        <Dropdown
          menu={{
            items: [
              { key: 'detail', icon: <EyeOutlined />, label: 'Xem chi tiết' },
              ...(record.status === 'failed' ? [{ key: 'rework', icon: <ToolOutlined />, label: 'Tạo Rework' }] : []),
              ...(record.status === 'passed' ? [{ key: 'handover', icon: <SendOutlined />, label: 'Tạo bàn giao' }] : []),
              { key: 'report', icon: <FileTextOutlined />, label: 'Biên bản NT' },
            ],
            onClick: ({ key }) => {
              if (key === 'detail') navigate(`/acceptance/${record.id}`);
              else if (key === 'rework') message.info('Mở yêu cầu rework trong màn chi tiết');
              else if (key === 'handover') navigate(`/acceptance/${record.id}`);
              else message.info('Xuất biên bản đang phát triển');
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: colors.navy }}>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />Nghiệm thu & Bàn giao
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý toàn bộ chu kỳ nghiệm thu, rework và bàn giao thiết bị/sản phẩm
          </Text>
        </div>
        <Space>
          <Button icon={<SyncOutlined spin={syncing} />} onClick={handleSync} loading={syncing}
            style={{ borderColor: colors.navy, color: colors.navy }}>
            Đồng bộ dữ liệu
          </Button>
          <Button type="primary" icon={<PlusOutlined />}
            style={{ background: colors.navy, borderColor: colors.navy }}
            onClick={() => setCreateDrawerOpen(true)}>
            Tạo nghiệm thu
          </Button>
        </Space>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{ flex: '1 1 0', minWidth: 155 }}>
            <div className={`db-stat-card animate-fade-in animate-delay-${idx + 1}`}
              style={{ background: card.gradient, borderRadius: 12, padding: '14px 16px 12px', position: 'relative', overflow: 'hidden' }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -8, fontSize: 64, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff' }}>{card.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{card.title}</div>
              </div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: '30px' }}>
                {card.value} <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{card.suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Space size={10} wrap>
              <Input
                placeholder="Tìm theo mã, tên nghiệm thu..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 280 }} allowClear
                value={searchText} onChange={e => setSearchText(e.target.value)}
              />
              <Select placeholder="Hợp đồng" style={{ width: 200 }} allowClear
                value={filterContract} onChange={setFilterContract}
                options={contracts.map(c => ({ value: c.id, label: c.code }))}
              />
              <Select placeholder="Trạng thái" style={{ width: 160 }} allowClear
                value={filterStatus} onChange={setFilterStatus}
                options={Object.entries(acceptanceStatusConfig).map(([k, cfg]) => ({ value: k, label: cfg.label }))}
              />
            </Space>
          </Col>
          <Col flex="none">
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredRecords.length}/{acceptanceRecords.length} phiếu</Text>
              {(searchText || filterStatus || filterContract) && (
                <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); setFilterContract(undefined); }}>
                  Xóa bộ lọc
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="db-chart-card" bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
              <SafetyCertificateOutlined />
            </div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Danh sách nghiệm thu & bàn giao</span>
            {stats.reworkCycles > 0 && (
              <Tag color="orange" style={{ fontSize: 11 }}>{stats.reworkCycles} phiếu tái nghiệm thu</Tag>
            )}
          </div>
        }
      >
        <Table
          columns={columns} dataSource={tableData}
          rowKey="id" size="middle"
          pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} phiếu` }}
          scroll={{ x: 1100 }}
          onRow={record => ({ onDoubleClick: () => navigate(`/acceptance/${record.id}`) })}
        />
      </Card>

      {/* ─── Drawer: Tạo nghiệm thu ─────────────────────────────────────── */}
      <Drawer
        title={null} placement="right" width={520}
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: colors.navy, borderColor: colors.navy }}
              onClick={() => {
                createForm.validateFields().then(() => {
                  message.success('Đã tạo biên bản nghiệm thu mới');
                  setCreateDrawerOpen(false);
                  createForm.resetFields();
                });
              }}>
              Tạo nghiệm thu
            </Button>
          </div>
        }
      >
        <div style={{ background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`, padding: '20px 24px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SafetyCertificateOutlined style={{ color: colors.gold, fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Tạo biên bản nghiệm thu</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Thiết lập phạm vi và đoàn kiểm tra</div>
            </div>
          </Space>
        </div>
        <div style={{ padding: 20 }}>
          <Form form={createForm} layout="vertical" requiredMark="optional">
            <Form.Item label="Hợp đồng" name="contractId" rules={[{ required: true, message: 'Chọn hợp đồng' }]}>
              <Select placeholder="Chọn hợp đồng đang thực hiện"
                options={contracts.filter(c => c.status === 'executing').map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))}
              />
            </Form.Item>
            <Form.Item label="Tên nghiệm thu" name="name" rules={[{ required: true }]}>
              <Input placeholder="VD: Nghiệm thu giai đoạn 1 — Tháo rời kiểm tra" />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Loại nghiệm thu" name="type" initialValue="phase">
                  <Select options={[
                    { value: 'phase', label: 'Giai đoạn' },
                    { value: 'final', label: 'Tổng thể (cuối HĐ)' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày kiểm tra dự kiến" name="inspectionDate" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Đoàn kiểm tra" name="inspectorTeam" rules={[{ required: true }]}>
              <Input placeholder="VD: P.KCS Doanh nghiệp A + Đại diện Khối K01" />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={2} placeholder="Yêu cầu đặc biệt, tài liệu cần chuẩn bị..." />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default Acceptance;
