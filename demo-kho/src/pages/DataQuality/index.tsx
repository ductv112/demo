import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Typography, Row, Col,
  Progress, Drawer, Form, Divider, Badge, Alert,
  Timeline, Tabs, Modal,
} from 'antd';
import {
  SafetyCertificateOutlined, WarningOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, CheckCircleOutlined, SearchOutlined,
  MergeCellsOutlined, EditOutlined, EyeInvisibleOutlined,
  ReloadOutlined, FileProtectOutlined, MoreOutlined, PlusOutlined,
  DeleteOutlined, SyncOutlined,
} from '@ant-design/icons';
import { Dropdown, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataIssue, DataIssueType, DataIssueSeverity, DataIssueStatus } from '../../types';
import { dataIssues, dataStandards, TOTAL_PRODUCTS } from '../../data/dataQuality';
import { products } from '../../data/products';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

// ─── Config ───────────────────────────────────────────────
const typeConfig: Record<DataIssueType, { label: string; color: string; icon: React.ReactNode }> = {
  duplicate:     { label: 'Trùng lặp',       color: 'red',    icon: <MergeCellsOutlined /> },
  missing_field: { label: 'Thiếu thông tin', color: 'orange', icon: <ExclamationCircleOutlined /> },
  non_standard:  { label: 'Sai quy chuẩn',   color: 'gold',   icon: <WarningOutlined /> },
  inconsistent:  { label: 'Không nhất quán', color: 'purple', icon: <InfoCircleOutlined /> },
};

const severityConfig: Record<DataIssueSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: 'error' },
  warning:  { label: 'Cảnh báo',     color: 'warning' },
  info:     { label: 'Thông tin',    color: 'default' },
};

const statusConfig: Record<DataIssueStatus, { label: string; color: string }> = {
  open:      { label: 'Chưa xử lý',    color: 'error' },
  in_review: { label: 'Đang xem xét',  color: 'blue' },
  resolved:  { label: 'Đã giải quyết', color: 'success' },
  ignored:   { label: 'Bỏ qua',        color: 'default' },
};

// ─── Stat card ────────────────────────────────────────────
interface StatCardProps { label: string; value: number; icon: React.ReactNode; gradient: string; }
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient }) => (
  <div style={{
    background: gradient, borderRadius: 12, padding: '16px 18px',
    color: '#fff', position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  }} className="stat-card-dq">
    <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 48, opacity: 0.1 }}>{icon}</div>
    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>{label}</div>
  </div>
);

// ─── Drawer section ───────────────────────────────────────
const DrawerSection: React.FC<{ title: string }> = ({ title }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: '#1B3A5C', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 10, marginTop: 4,
    paddingBottom: 6, borderBottom: '1px solid #f0f0f0',
  }}>{title}</div>
);

// ════════════════════════════════════════════════════════════
// TAB 1 — Tổng quan & Rà soát
// ════════════════════════════════════════════════════════════
const TabOverview: React.FC<{ scanTrigger?: number; onScanningChange?: (v: boolean) => void }> = ({ scanTrigger = 0, onScanningChange }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIssue, setActiveIssue] = useState<DataIssue | null>(null);
  const [activeAction, setActiveAction] = useState<'fix' | 'view'>('view');
  const [form] = Form.useForm();
  const [issues, setIssues] = useState<DataIssue[]>(dataIssues);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>('10/04/2026');
  const [scanResultModal, setScanResultModal] = useState(false);
  const [scanResult, setScanResult] = useState<{ total: number; byType: Record<string, number> } | null>(null);

  // ─── Scan logic ──────────────────────────────────────────
  const runScan = async () => {
    setScanning(true);
    onScanningChange?.(true);
    await new Promise(r => setTimeout(r, 1800));

    const today = new Date().toLocaleDateString('vi-VN');
    const iso   = new Date().toISOString().split('T')[0];
    const detected: DataIssue[] = [];
    let counter = 0;
    const newId = () => `scan-${Date.now()}-${counter++}`;

    // 1. Thiếu thông tin bắt buộc
    products.forEach(p => {
      const missing: string[] = [];
      if (!p.manufacturer) missing.push('Nhà sản xuất');
      if (!p.origin)        missing.push('Xuất xứ');
      if (p.category === 'Vật tư tiêu hao' && !p.shelfLife) missing.push('Hạn sử dụng');
      if (missing.length > 0) {
        detected.push({
          id: newId(), type: 'missing_field',
          severity: missing.includes('Hạn sử dụng') ? 'critical' : 'warning',
          status: 'open',
          affectedCodes: [p.code], affectedNames: [p.name],
          field: missing.join(', '),
          description: `Thiếu thông tin bắt buộc: ${missing.join(', ')}`,
          suggestion: `Cập nhật trường ${missing.join(', ')} cho vật tư này`,
          detectedAt: iso,
        });
      }
    });

    // 2. Sai quy chuẩn mã vật tư
    const codePattern = /^[A-Z]{2,4}-[A-Z]{2,4}-\d{3}$/;
    products.forEach(p => {
      if (!codePattern.test(p.code)) {
        detected.push({
          id: newId(), type: 'non_standard',
          severity: 'warning', status: 'open',
          affectedCodes: [p.code], affectedNames: [p.name],
          field: 'Mã vật tư',
          description: `Mã "${p.code}" không khớp định dạng chuẩn [NHÓM]-[PHÂN NHÓM]-[NNN]`,
          suggestion: 'Chuẩn hóa sang định dạng viết hoa, 2–4 ký tự mỗi phần, phân cách dấu gạch ngang',
          detectedAt: iso,
        });
      }
    });

    // 3. Không nhất quán đơn vị trong cùng phân nhóm
    const subCatMap: Record<string, { units: string[]; codes: string[]; names: string[] }> = {};
    products.forEach(p => {
      const key = `${p.category}||${p.subCategory ?? ''}`;
      if (!subCatMap[key]) subCatMap[key] = { units: [], codes: [], names: [] };
      if (!subCatMap[key].units.includes(p.baseUnit)) {
        subCatMap[key].units.push(p.baseUnit);
        subCatMap[key].codes.push(p.code);
        subCatMap[key].names.push(p.name);
      }
    });
    Object.entries(subCatMap).forEach(([key, data]) => {
      if (data.units.length > 1) {
        const sub = key.split('||')[1] || key.split('||')[0];
        detected.push({
          id: newId(), type: 'inconsistent',
          severity: 'info', status: 'open',
          affectedCodes: data.codes.slice(0, 3),
          affectedNames: data.names.slice(0, 3),
          field: 'Đơn vị tính',
          description: `Phân nhóm "${sub}" dùng ${data.units.length} đơn vị khác nhau: ${data.units.join(', ')}`,
          suggestion: 'Thống nhất đơn vị tính cơ bản cho toàn bộ phân nhóm',
          detectedAt: iso,
        });
      }
    });

    // 4. Trùng lặp: cùng subCategory, tên tương tự
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        if (!products[i].subCategory || products[i].subCategory !== products[j].subCategory) continue;
        const w1 = products[i].name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const w2 = products[j].name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const overlap = w1.filter(w => w2.includes(w)).length;
        if (w1.length > 0 && overlap / Math.min(w1.length, w2.length) >= 0.65) {
          detected.push({
            id: newId(), type: 'duplicate',
            severity: 'warning', status: 'open',
            affectedCodes: [products[i].code, products[j].code],
            affectedNames: [products[i].name, products[j].name],
            description: `2 vật tư cùng phân nhóm "${products[i].subCategory}" có tên rất giống nhau`,
            suggestion: 'Xác nhận đây là 2 vật tư khác nhau, hoặc gộp thành 1 bản ghi',
            detectedAt: iso,
          });
        }
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const unique = detected.filter(d => {
      const key = d.type + d.affectedCodes.slice().sort().join(',');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    // Giữ toàn bộ issues cũ, chỉ thêm những vấn đề mới chưa tồn tại
    setIssues(prev => {
      const existingKeys = new Set(prev.map(i => i.type + i.affectedCodes.slice().sort().join(',')));
      const toAdd = unique.filter(d => !existingKeys.has(d.type + d.affectedCodes.slice().sort().join(',')));
      return [...prev, ...toAdd];
    });
    setLastScan(today);
    setScanResult({
      total: unique.length,
      byType: {
        duplicate:     unique.filter(d => d.type === 'duplicate').length,
        missing_field: unique.filter(d => d.type === 'missing_field').length,
        non_standard:  unique.filter(d => d.type === 'non_standard').length,
        inconsistent:  unique.filter(d => d.type === 'inconsistent').length,
      },
    });
    setScanning(false);
    onScanningChange?.(false);
    setScanResultModal(true);
  };

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (scanTrigger > 0) runScan();
  }, [scanTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => ({
    openCount:    issues.filter(i => i.status === 'open' || i.status === 'in_review').length,
    duplicate:    issues.filter(i => i.type === 'duplicate'     && i.status !== 'resolved' && i.status !== 'ignored').length,
    missingField: issues.filter(i => i.type === 'missing_field' && i.status !== 'resolved' && i.status !== 'ignored').length,
    nonStandard:  issues.filter(i => i.type === 'non_standard'  && i.status !== 'resolved' && i.status !== 'ignored').length,
    inconsistent: issues.filter(i => i.type === 'inconsistent'  && i.status !== 'resolved' && i.status !== 'ignored').length,
    resolved:     issues.filter(i => i.status === 'resolved').length,
  }), [issues]);

  const healthScore = useMemo(() => {
    const critical = issues.filter(i => i.severity === 'critical' && i.status === 'open').length;
    const warning  = issues.filter(i => i.severity === 'warning'  && (i.status === 'open' || i.status === 'in_review')).length;
    return Math.max(0, Math.min(100, 100 - critical * 5 - warning * 2));
  }, [issues]);
  const healthColor = healthScore >= 85 ? '#52c41a' : healthScore >= 65 ? '#faad14' : '#ff4d4f';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return issues.filter(i => {
      const matchSearch = !q ||
        i.affectedCodes.some(c => c.toLowerCase().includes(q)) ||
        i.affectedNames.some(n => n.toLowerCase().includes(q)) ||
        i.description.toLowerCase().includes(q);
      const matchType     = !filterType     || i.type === filterType;
      const matchSeverity = !filterSeverity || i.severity === filterSeverity;
      const matchStatus   = !filterStatus   || i.status === filterStatus;
      return matchSearch && matchType && matchSeverity && matchStatus;
    });
  }, [search, filterType, filterSeverity, filterStatus, issues]);

  const openDrawer = (issue: DataIssue, action: 'fix' | 'view') => {
    setActiveIssue(issue); setActiveAction(action); setDrawerOpen(true); form.resetFields();
  };

  const columns: ColumnsType<DataIssue> = [
    {
      title: 'Vấn đề', key: 'issue',
      render: (_: unknown, r: DataIssue) => (
        <Space direction="vertical" size={2}>
          <Space size={6} wrap>
            <Tag color={typeConfig[r.type].color} icon={typeConfig[r.type].icon} style={{ fontWeight: 600, fontSize: 11 }}>
              {typeConfig[r.type].label}
            </Tag>
            <Tag color={severityConfig[r.severity].color} style={{ fontSize: 11 }}>
              {severityConfig[r.severity].label}
            </Tag>
            {r.field && <Text type="secondary" style={{ fontSize: 11 }}>Trường: {r.field}</Text>}
          </Space>
          <Text style={{ fontSize: 12 }}>
            {r.description.length > 90 ? r.description.slice(0, 90) + '…' : r.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Vật tư liên quan', key: 'affected', width: 200,
      render: (_: unknown, r: DataIssue) => (
        <Space direction="vertical" size={2}>
          {r.affectedCodes.slice(0, 2).map((code, i) => (
            <div key={code}>
              <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#1B3A5C' }}>{code}</Text><br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {(r.affectedNames[i] ?? '').length > 28 ? r.affectedNames[i].slice(0, 28) + '…' : r.affectedNames[i]}
              </Text>
            </div>
          ))}
          {r.affectedCodes.length > 2 && <Text type="secondary" style={{ fontSize: 11 }}>+{r.affectedCodes.length - 2} khác</Text>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: DataIssueStatus) => <Tag color={statusConfig[s].color}>{statusConfig[s].label}</Tag>,
    },
    {
      title: 'Phát hiện', dataIndex: 'detectedAt', key: 'detectedAt', width: 100,
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{new Date(d).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      title: '', key: 'action', width: 60, fixed: 'right' as const,
      render: (_: unknown, r: DataIssue) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: [
                { key: 'view', label: 'Xem chi tiết', icon: <SearchOutlined /> },
                ...(r.status === 'open' || r.status === 'in_review'
                  ? [{ key: 'fix', label: 'Xử lý vấn đề', icon: <EditOutlined /> }] : []),
                ...(r.status === 'open'
                  ? [{ key: 'ignore', label: 'Bỏ qua', icon: <EyeInvisibleOutlined /> }] : []),
              ],
              onClick: ({ key }) => {
                if (key === 'view') openDrawer(r, 'view');
                else if (key === 'fix') openDrawer(r, 'fix');
              },
            }}
            trigger={['click']} placement="bottomRight"
          >
            <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} style={{ color: '#595959' }} />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 4 Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
        {[
          { label: 'Trùng lặp',       value: stats.duplicate,    icon: <MergeCellsOutlined />,      g: 'linear-gradient(135deg, #a8071a, #ff4d4f)' },
          { label: 'Thiếu thông tin', value: stats.missingField, icon: <ExclamationCircleOutlined />, g: 'linear-gradient(135deg, #d46b08, #faad14)' },
          { label: 'Sai quy chuẩn',   value: stats.nonStandard,  icon: <WarningOutlined />,          g: 'linear-gradient(135deg, #ad6800, #d4a843)' },
          { label: 'Không nhất quán', value: stats.inconsistent, icon: <InfoCircleOutlined />,       g: 'linear-gradient(135deg, #391085, #722ed1)' },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <StatCard label={s.label} value={s.value} icon={s.icon} gradient={s.g} />
          </Col>
        ))}
      </Row>

      {/* Health info bar */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '14px 20px', marginBottom: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Progress type="circle" percent={healthScore} size={52} strokeColor={healthColor} strokeWidth={8}
            format={p => <span style={{ fontSize: 12, fontWeight: 800, color: healthColor }}>{p}%</span>} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C' }}>Chỉ số chất lượng</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {healthScore >= 85 ? 'Tốt' : healthScore >= 65 ? 'Trung bình' : 'Kém'}
            </div>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: '#f0f0f0', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ff4d4f', lineHeight: 1 }}>{stats.openCount}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>Chưa xử lý / {TOTAL_PRODUCTS} vật tư</div>
        </div>
        <div style={{ width: 1, height: 32, background: '#f0f0f0', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a', lineHeight: 1 }}>{stats.resolved}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>Đã giải quyết</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>Rà soát cuối: <strong>{lastScan}</strong></Text>
        </div>
      </div>

      {/* Filter */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={[12, 10]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Search placeholder="Mã vật tư, tên, mô tả vấn đề..." allowClear value={search}
              onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Loại vấn đề" allowClear style={{ width: '100%' }}
              value={filterType || undefined} onChange={v => setFilterType(v ?? '')}
              options={Object.entries(typeConfig).map(([v, c]) => ({ value: v, label: c.label }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Mức độ" allowClear style={{ width: '100%' }}
              value={filterSeverity || undefined} onChange={v => setFilterSeverity(v ?? '')}
              options={Object.entries(severityConfig).map(([v, c]) => ({ value: v, label: c.label }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Trạng thái" allowClear style={{ width: '100%' }}
              value={filterStatus || undefined} onChange={v => setFilterStatus(v ?? '')}
              options={[
                { value: 'open',      label: 'Chưa xử lý' },
                { value: 'in_review', label: 'Đang xem xét' },
                { value: 'resolved',  label: 'Đã xử lý' },
                { value: 'ignored',   label: 'Bỏ qua' },
              ]} />
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}><Badge color="#1B3A5C" /> {filtered.length} vấn đề</Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}>
        <Table columns={columns} dataSource={filtered} rowKey="id" size="small" scroll={{ x: 900 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `Tổng ${t} vấn đề`, pageSizeOptions: ['10', '15', '25'] }}
          onRow={r => ({ onClick: () => openDrawer(r, 'view'), style: { cursor: 'pointer' } })}
        />
      </Card>

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        width={520} closable={false} title={null} styles={{ body: { padding: 0 } }}
        footer={
          activeAction === 'fix' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
              <Button type="primary" style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
                onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Xác nhận xử lý</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setDrawerOpen(false)}>Đóng</Button>
              {activeIssue?.status === 'open' && (
                <Button type="primary" icon={<EditOutlined />} style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
                  onClick={() => setActiveAction('fix')}>Xử lý ngay</Button>
              )}
            </div>
          )
        }
      >
        {activeIssue && (
          <>
            <div style={{ background: activeAction === 'fix' ? 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' : 'linear-gradient(135deg, #434343, #8c8c8c)', padding: '20px 24px 16px', color: '#fff' }}>
              <Space align="center" size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {typeConfig[activeIssue.type].icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{activeAction === 'fix' ? 'Xử lý vấn đề dữ liệu' : 'Chi tiết vấn đề'}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{typeConfig[activeIssue.type].label} · {severityConfig[activeIssue.severity].label}</div>
                </div>
              </Space>
              <div style={{ marginTop: 14, background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'TRẠNG THÁI',      value: statusConfig[activeIssue.status].label },
                  { label: 'VẬT TƯ LIÊN QUAN', value: `${activeIssue.affectedCodes.length} vật tư` },
                  { label: 'PHÁT HIỆN',        value: new Date(activeIssue.detectedAt).toLocaleDateString('vi-VN') },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <DrawerSection title="Mô tả vấn đề" />
              <Alert type={activeIssue.severity === 'critical' ? 'error' : activeIssue.severity === 'warning' ? 'warning' : 'info'}
                message={activeIssue.description} style={{ marginBottom: 16, fontSize: 13 }} showIcon />
              <DrawerSection title="Vật tư liên quan" />
              <Timeline style={{ marginBottom: 12 }} items={activeIssue.affectedCodes.map((code, i) => ({
                color: '#1B3A5C',
                children: (
                  <div>
                    <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1B3A5C', fontWeight: 600 }}>{code}</Text><br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{activeIssue.affectedNames[i]}</Text>
                  </div>
                ),
              }))} />
              {activeIssue.suggestion && (
                <>
                  <DrawerSection title="Gợi ý xử lý" />
                  <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, color: '#389e0d' }}>{activeIssue.suggestion}</Text>
                  </div>
                </>
              )}
              {activeIssue.note && (
                <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{activeIssue.note}</Text>
                </div>
              )}
              {activeAction === 'fix' && (
                <>
                  <Divider style={{ margin: '16px 0 12px' }} />
                  <DrawerSection title="Thực hiện xử lý" />
                  <Form form={form} layout="vertical" size="small">
                    <Form.Item label="Phương án xử lý" name="resolution" rules={[{ required: true, message: 'Chọn phương án' }]}>
                      <Select placeholder="Chọn cách xử lý" options={
                        activeIssue.type === 'duplicate'
                          ? [{ value: 'merge', label: 'Gộp — giữ mã chuẩn, xóa mã trùng' }, { value: 'keep_both', label: 'Giữ cả hai — đây là 2 sản phẩm khác nhau' }]
                          : activeIssue.type === 'missing_field'
                          ? [{ value: 'update', label: 'Cập nhật thông tin còn thiếu' }, { value: 'review', label: 'Chuyển sang đang xem xét' }]
                          : [{ value: 'standardize', label: 'Chuẩn hóa theo quy định' }, { value: 'exception', label: 'Chấp nhận ngoại lệ — có lý do' }]
                      } />
                    </Form.Item>
                    <Form.Item label="Ghi chú xử lý" name="note">
                      <TextArea rows={3} placeholder="Mô tả thay đổi đã thực hiện..." />
                    </Form.Item>
                    <Form.Item label="Người phê duyệt" name="approvedBy">
                      <Input placeholder="VD: Phạm Quốc Hưng" />
                    </Form.Item>
                  </Form>
                </>
              )}
            </div>
          </>
        )}
      </Drawer>

      {/* Scan result modal */}
      <Modal
        open={scanResultModal}
        onCancel={() => setScanResultModal(false)}
        footer={
          <Button type="primary" style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
            onClick={() => setScanResultModal(false)}>
            Đã hiểu
          </Button>
        }
        title={null}
        closable={false}
        width={440}
      >
        {scanResult && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', borderRadius: '8px 8px 0 0', margin: '-20px -24px 20px', padding: '20px 24px', color: '#fff' }}>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyCertificateOutlined style={{ fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Kết quả rà soát</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Quét toàn bộ {TOTAL_PRODUCTS} vật tư trong danh mục</div>
                </div>
              </Space>
            </div>
            <div style={{
              background: scanResult.total > 0 ? '#fff2f0' : '#f6ffed',
              border: `1px solid ${scanResult.total > 0 ? '#ffccc7' : '#b7eb8f'}`,
              borderRadius: 10, padding: '14px 16px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {scanResult.total > 0
                ? <WarningOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
                : <CheckCircleOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: scanResult.total > 0 ? '#d46b08' : '#52c41a' }}>
                  {scanResult.total > 0 ? `Phát hiện ${scanResult.total} vấn đề cần xử lý` : 'Dữ liệu sạch — không phát hiện vấn đề'}
                </div>
                <div style={{ fontSize: 12, color: '#595959' }}>Danh sách bên dưới đã được cập nhật</div>
              </div>
            </div>
            {scanResult.total > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'duplicate',     label: 'Trùng lặp',        color: '#ff4d4f', icon: <MergeCellsOutlined /> },
                  { key: 'missing_field', label: 'Thiếu thông tin',  color: '#faad14', icon: <ExclamationCircleOutlined /> },
                  { key: 'non_standard',  label: 'Sai quy chuẩn',    color: '#d4a843', icon: <WarningOutlined /> },
                  { key: 'inconsistent',  label: 'Không nhất quán',  color: '#722ed1', icon: <InfoCircleOutlined /> },
                ].filter(item => scanResult.byType[item.key] > 0).map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <Space size={8}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <Text style={{ fontSize: 13 }}>{item.label}</Text>
                    </Space>
                    <Tag color="default" style={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                      {scanResult.byType[item.key]}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

// ════════════════════════════════════════════════════════════
// TAB 2 — Quy chuẩn dữ liệu (CRUD)
// ════════════════════════════════════════════════════════════
const TabStandards: React.FC = () => {
  const [standards, setStandards] = useState(dataStandards.map((s, i) => ({ ...s, key: i })));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingIdx(null); form.resetFields(); setDrawerOpen(true); };
  const openEdit = (idx: number) => {
    setEditingIdx(idx); form.setFieldsValue(standards[idx]); setDrawerOpen(true);
  };
  const handleSave = () => {
    form.validateFields().then(values => {
      if (editingIdx !== null) {
        setStandards(prev => prev.map((s, i) => i === editingIdx ? { ...s, ...values } : s));
      } else {
        setStandards(prev => [...prev, { ...values, id: `std-${Date.now()}`, key: prev.length }]);
      }
      setDrawerOpen(false);
    });
  };

  const columns = [
    {
      title: 'Hạng mục', dataIndex: 'category', key: 'category', width: 160,
      render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Quy tắc', dataIndex: 'rule', key: 'rule',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Ví dụ', dataIndex: 'example', key: 'example', width: 200,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'Lưu ý', dataIndex: 'note', key: 'note', width: 220,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 80, align: 'center' as const,
      render: (_: unknown, __: unknown, idx: number) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: [
                { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
                { type: 'divider' },
                {
                  key: 'delete', label: (
                    <Popconfirm
                      title="Xóa quy chuẩn"
                      description="Bạn có chắc chắn muốn xóa quy chuẩn này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => setStandards(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <span style={{ color: '#ff4d4f' }}>Xóa</span>
                    </Popconfirm>
                  ),
                  icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                },
              ],
              onClick: ({ key }) => { if (key === 'edit') openEdit(idx); },
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 16 }} />} style={{ color: '#595959' }} />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <FileProtectOutlined style={{ color: '#1B3A5C', fontSize: 16 }} />
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#1B3A5C' }}>
            Danh sách quy chuẩn hiện hành ({standards.length} quy tắc)
          </Text>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}>
          Thêm quy chuẩn
        </Button>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16, borderRadius: 10 }}
        message="Quy chuẩn dữ liệu được áp dụng tự động khi tạo hoặc cập nhật vật tư. Mọi thay đổi có hiệu lực ngay sau khi lưu."
      />

      <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}>
        <Table dataSource={standards} columns={columns} rowKey="id" size="small" pagination={false} />
      </Card>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
        closable={false} title={null} styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }} onClick={handleSave}>
              {editingIdx !== null ? 'Lưu thay đổi' : 'Thêm quy chuẩn'}
            </Button>
          </div>
        }
      >
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', padding: '20px 24px 16px', color: '#fff' }}>
          <Space align="center" size={12}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <FileProtectOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {editingIdx !== null ? 'Chỉnh sửa quy chuẩn' : 'Thêm quy chuẩn mới'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {editingIdx !== null ? 'Cập nhật quy tắc chuẩn hóa dữ liệu' : 'Thiết lập quy tắc chuẩn hóa dữ liệu mới'}
              </div>
            </div>
          </Space>
        </div>

        {/* Form content */}
        <div style={{ padding: '20px 24px' }}>
          <Form form={form} layout="vertical">
            <Form.Item label={<Text strong>Hạng mục</Text>} name="category" rules={[{ required: true, message: 'Nhập hạng mục' }]}>
              <Input placeholder="VD: Mã vật tư, Tên vật tư, Đơn vị tính..." />
            </Form.Item>
            <Form.Item label={<Text strong>Quy tắc</Text>} name="rule" rules={[{ required: true, message: 'Nhập quy tắc' }]}>
              <TextArea rows={4} placeholder="Mô tả quy tắc cụ thể..." />
            </Form.Item>
            <Form.Item label={<Text strong>Ví dụ minh họa</Text>} name="example">
              <Input placeholder="VD: DTV-HYD-46, CAP-RG58-50R..." style={{ fontFamily: 'monospace' }} />
            </Form.Item>
            <Form.Item label={<Text strong>Lưu ý / Ngoại lệ</Text>} name="note" style={{ marginBottom: 0 }}>
              <TextArea rows={3} placeholder="Các trường hợp đặc biệt cần chú ý..." />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
const DataQuality: React.FC = () => {
  const [scanTrigger, setScanTrigger] = useState(0);
  const [scanning, setScanning] = useState(false);

  const stats = useMemo(() => ({
    openCount: dataIssues.filter(i => i.status === 'open' || i.status === 'in_review').length,
  }), []);

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <Space align="start" size={16}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>Kiểm soát & Chuẩn hóa dữ liệu</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Thiết lập quy chuẩn, kiểm tra tính hợp lệ và chuẩn hóa dữ liệu danh mục vật tư
            </Text>
          </div>
        </Space>
        <Button
          icon={<ReloadOutlined />}
          loading={scanning}
          onClick={() => setScanTrigger(t => t + 1)}
          style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}
        >
          Rà soát định kỳ
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        type="card"
        size="small"
        style={{ marginBottom: 0 }}
        items={[
          {
            key: 'overview',
            label: (
              <Space size={6}>
                <WarningOutlined />
                Rà soát & Chuẩn hóa
                {stats.openCount > 0 && (
                  <Badge count={stats.openCount} size="small" style={{ background: '#ff4d4f' }} />
                )}
              </Space>
            ),
            children: <TabOverview scanTrigger={scanTrigger} onScanningChange={setScanning} />,
          },
          {
            key: 'standards',
            label: <Space size={6}><FileProtectOutlined />Quy chuẩn dữ liệu</Space>,
            children: <TabStandards />,
          },
        ]}
      />

      <style>{`
        .stat-card-dq:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(27,58,92,0.18) !important;
        }
      `}</style>
    </div>
  );
};

export default DataQuality;
