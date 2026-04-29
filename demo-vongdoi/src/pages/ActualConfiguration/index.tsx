import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Select, Typography, Drawer,
  Row, Col, message, Divider, Tabs, Alert, Timeline, Descriptions,
  Statistic, Form, Input, Badge, Modal, Radio, Tooltip, Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ApartmentOutlined, CheckCircleOutlined, WarningOutlined, SyncOutlined,
  QuestionCircleOutlined, FilterOutlined, HistoryOutlined, PlusOutlined,
  EyeOutlined, ToolOutlined, SearchOutlined,
} from '@ant-design/icons';
import { actualConfigurations, getLatestBySerial, getHistoryBySerial } from '../../data/actualConfigurations';
import { equipmentList } from '../../data/equipment';
import { useUser } from '../../contexts/UserContext';
import type { ActualConfiguration, ActualConfigStatus, DeviationHandling, DeviationActionType } from '../../types';

const { Text, Title } = Typography;

// ─── Status & config maps ─────────────────────────────────────────────────────

const deviationHandlingConfig: Record<DeviationActionType, { label: string; color: string; icon: React.ReactNode }> = {
  repair_requested: { label: 'Đã tạo yêu cầu xử lý',   color: 'processing', icon: <ToolOutlined /> },
  accepted:         { label: 'Chấp nhận có kiểm soát',  color: 'success',    icon: <CheckCircleOutlined /> },
  resolved:         { label: 'Đã xử lý xong',           color: 'success',    icon: <CheckCircleOutlined /> },
};

const linkedModuleLabels: Record<string, string> = {
  'pkkq-suachua': 'Quản lý Khắc phục',
  'pkkq-baotri':  'Quản lý Bảo trì',
  'pkkq-daitu':   'Quản lý Nâng cấp',
};

const actualStatusConfig: Record<ActualConfigStatus, { label: string; color: string; icon: React.ReactNode }> = {
  synced:         { label: 'Khớp thiết kế',    color: 'success', icon: <CheckCircleOutlined /> },
  deviated:       { label: 'Có lệch thông số', color: 'error',   icon: <WarningOutlined /> },
  pending_update: { label: 'Chờ cập nhật',     color: 'warning', icon: <SyncOutlined /> },
  unrecorded:     { label: 'Chưa ghi nhận',    color: 'default', icon: <QuestionCircleOutlined /> },
};

const actualSourceLabels: Record<string, string> = {
  'pkkq-sanxuat': 'Phát triển',
  'pkkq-suachua': 'Khắc phục',
  'pkkq-daitu':   'Nâng cấp',
  'pkkq-baotri':  'Bảo trì',
  'manual':       'Thủ công',
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: [string, string];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient }) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      borderRadius: 14,
      padding: '20px 24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.18)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
    }}
  >
    <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 64, opacity: 0.08, lineHeight: 1, transition: '0.5s' }}>
      {icon}
    </div>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
      {icon}
    </div>
    <Statistic value={value} valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 26 }} />
    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>{title}</div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ActualConfigurationPage: React.FC = () => {
  const { isVongDoi } = useUser();
  const [messageApi, contextHolder] = message.useMessage();

  // List filters
  const [searchText, setSearchText]     = useState('');
  const [filterEquip, setFilterEquip]   = useState('');
  const [filterStatus, setFilterStatus] = useState<ActualConfigStatus | ''>('');

  // Tab
  const [innerTab, setInnerTab] = useState('list');

  // Detail drawer
  const [selected, setSelected]   = useState<ActualConfiguration | null>(null);
  const [drawerTab, setDrawerTab] = useState('compare');

  // Action modal
  const [actionModal, setActionModal] = useState<{ type: 'repair' | 'accept'; compCode: string } | null>(null);
  const [actionForm]                  = Form.useForm();

  // Local deviation handling overrides
  const [handlingMap, setHandlingMap] = useState<Record<string, DeviationHandling>>({});

  // ── Data ─────────────────────────────────────────────────────────────────────

  const latestList = useMemo(() => getLatestBySerial(), []);

  const filtered = useMemo(() =>
    latestList.filter(a => {
      if (filterEquip && a.equipmentId !== filterEquip) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        return (
          a.serialNumber.toLowerCase().includes(q) ||
          a.equipmentName.toLowerCase().includes(q) ||
          a.recordedBy.toLowerCase().includes(q)
        );
      }
      return true;
    }), [latestList, searchText, filterEquip, filterStatus]);

  const equipOptions = useMemo(() => {
    const ids = [...new Set(latestList.map(a => a.equipmentId))];
    return ids.map(id => {
      const eq = equipmentList.find(e => e.id === id);
      return { value: id, label: eq ? `${eq.code} — ${eq.name}` : id };
    });
  }, [latestList]);

  // KPI
  const total    = latestList.length;
  const synced   = latestList.filter(a => a.status === 'synced').length;
  const deviated = latestList.filter(a => a.status === 'deviated').length;
  const pending  = latestList.filter(a => a.status === 'pending_update').length;
  const unrec    = latestList.filter(a => a.status === 'unrecorded').length;

  // History timeline
  const historyItems = useMemo(() =>
    actualConfigurations
      .flatMap(a => [
        ...(a.confirmedAt ? [{ date: a.confirmedAt, type: 'confirm' as const, record: a }] : []),
        { date: a.recordedAt, type: 'record' as const, record: a },
      ])
      .sort((x, y) => y.date.localeCompare(x.date))
  , []);

  // ── Table columns ────────────────────────────────────────────────────────────

  const columns: ColumnsType<ActualConfiguration> = [
    {
      title: 'Số hiệu', dataIndex: 'serialNumber', width: 130,
      render: (v) => <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{v}</Text>,
    },
    {
      title: 'Thiết bị', key: 'equip',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.equipmentName}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{r.equipmentCode}</div>
        </div>
      ),
    },
    {
      title: 'Phiên bản TK tham chiếu', dataIndex: 'designVersionRef', width: 170,
      render: (v) => <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 160,
      render: (s: ActualConfigStatus) => {
        const cfg = actualStatusConfig[s];
        return <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Lệch / Tổng', width: 90,
      render: (_, r) => {
        const dev = r.components.filter(c => c.isDeviated).length;
        return (
          <Text style={{ color: dev > 0 ? '#dc2626' : '#15803d', fontWeight: dev > 0 ? 600 : 400 }}>
            {dev}/{r.components.length}
          </Text>
        );
      },
    },
    {
      title: 'Nguồn', dataIndex: 'source', width: 110,
      render: (s: string) => <Text type="secondary" style={{ fontSize: 12 }}>{actualSourceLabels[s] || s}</Text>,
    },
    {
      title: 'Ngày ghi nhận', dataIndex: 'recordedAt', width: 120,
      render: (d) => <Text style={{ fontSize: 12 }}>{d}</Text>,
    },
    {
      title: '', width: 60,
      render: (_, r) => (
        <Tooltip title="Xem chi tiết">
          <Button type="text" size="small" icon={<EyeOutlined />}
            onClick={() => { setSelected(r); setDrawerTab('compare'); }}
            style={{ color: '#1B3A5C' }} />
        </Tooltip>
      ),
    },
  ];

  // ── Action modal handler ──────────────────────────────────────────────────────

  const handleActionSubmit = () => {
    actionForm.validateFields().then(values => {
      if (!selected || !actionModal) return;
      const key = `${selected.id}_${actionModal.compCode}`;
      const comp = selected.components.find(c => c.code === actionModal.compCode);
      if (!comp) return;
      const now = new Date().toISOString().slice(0, 10);
      if (actionModal.type === 'repair') {
        setHandlingMap(prev => ({
          ...prev,
          [key]: {
            action: 'repair_requested',
            handledBy: 'Trưởng phòng Kỹ thuật',
            handledAt: now,
            reason: values.reason,
            linkedModule: values.linkedModule,
            linkedRef: values.linkedRef || undefined,
          },
        }));
        messageApi.success(`Đã tạo yêu cầu xử lý cho "${comp.name}" — chuyển sang ${linkedModuleLabels[values.linkedModule]}`);
      } else {
        setHandlingMap(prev => ({
          ...prev,
          [key]: {
            action: 'accepted',
            handledBy: 'Trưởng phòng Kỹ thuật',
            handledAt: now,
            reason: values.reason,
          },
        }));
        messageApi.success(`Đã chấp nhận lệch có kiểm soát cho "${comp.name}"`);
      }
      setActionModal(null);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 20,
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ApartmentOutlined style={{ fontSize: 22, color: '#D4A843' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Cấu hình thực tế theo số hiệu</Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              Ghi nhận và đối chiếu cấu hình thực tế từng số hiệu thiết bị với phiên bản thiết kế chuẩn
            </Text>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }} wrap={false}>
        <Col flex="1">
          <StatCard title="Tổng số hiệu" value={total} icon={<ApartmentOutlined />} gradient={['#1B3A5C', '#2d5a8e']} />
        </Col>
        <Col flex="1">
          <StatCard title="Khớp thiết kế" value={synced} icon={<CheckCircleOutlined />} gradient={['#15803d', '#16a34a']} />
        </Col>
        <Col flex="1">
          <StatCard title="Có lệch thông số" value={deviated} icon={<WarningOutlined />} gradient={['#b91c1c', '#dc2626']} />
        </Col>
        <Col flex="1">
          <StatCard title="Chờ cập nhật" value={pending} icon={<SyncOutlined />} gradient={['#92400e', '#d97706']} />
        </Col>
        <Col flex="1">
          <StatCard title="Chưa ghi nhận" value={unrec} icon={<QuestionCircleOutlined />} gradient={['#374151', '#6b7280']} />
        </Col>
      </Row>

      {/* Main Card with sub-tabs */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          size="small"
          activeKey={innerTab}
          onChange={setInnerTab}
          style={{ padding: '0 20px' }}
          items={[
            // ── Danh sách số hiệu ─────────────────────────────────────────────
            {
              key: 'list',
              label: <Space size={4}><ApartmentOutlined />Danh sách số hiệu</Space>,
              children: (
                <div style={{ padding: '4px 0 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <Space wrap>
                      <Input
                        placeholder="Tìm số hiệu, thiết bị..."
                        prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 210 }}
                        allowClear
                        size="small"
                      />
                      <Select size="small" style={{ width: 220 }}
                        placeholder="Thiết bị"
                        value={filterEquip || undefined}
                        onChange={v => setFilterEquip(v ?? '')}
                        options={[{ value: '', label: 'Tất cả thiết bị' }, ...equipOptions]}
                        allowClear
                      />
                      <Select size="small" style={{ width: 160 }}
                        placeholder="Trạng thái"
                        value={filterStatus || undefined}
                        onChange={v => setFilterStatus((v ?? '') as ActualConfigStatus | '')}
                        options={[
                          { value: '',               label: 'Tất cả trạng thái' },
                          { value: 'synced',         label: 'Khớp thiết kế' },
                          { value: 'deviated',       label: 'Có lệch thông số' },
                          { value: 'pending_update', label: 'Chờ cập nhật' },
                          { value: 'unrecorded',     label: 'Chưa ghi nhận' },
                        ]}
                        allowClear
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>{filtered.length} số hiệu</Text>
                    </Space>
                    {isVongDoi && (
                      <Button type="primary" size="small" icon={<PlusOutlined />}
                        style={{ background: '#1B3A5C', borderColor: '#1B3A5C', flexShrink: 0 }}>
                        Ghi nhận mới
                      </Button>
                    )}
                  </div>
                  <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 8, showSizeChanger: false, showTotal: t => `${t} bản ghi` }}
                    onRow={r => ({ onClick: () => { setSelected(r); setDrawerTab('compare'); setInnerTab('list'); }, style: { cursor: 'pointer' } })}
                    locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
                    scroll={{ x: 900 }}
                  />
                </div>
              ),
            },

            // ── Đối chiếu theo thiết bị ───────────────────────────────────────
            {
              key: 'comparison',
              label: <Space size={4}><FilterOutlined />Đối chiếu theo thiết bị</Space>,
              children: (
                <div style={{ padding: '4px 0 20px' }}>
                  <Alert type="info" showIcon
                    message="Tổng hợp tình trạng khớp thiết kế theo từng loại thiết bị"
                    style={{ marginBottom: 12 }}
                  />
                  {(() => {
                    const groups: Record<string, ActualConfiguration[]> = {};
                    actualConfigurations.forEach(a => {
                      if (!groups[a.equipmentId]) groups[a.equipmentId] = [];
                      groups[a.equipmentId].push(a);
                    });
                    return Object.entries(groups).map(([eqId, records]) => {
                      const eq = equipmentList.find(e => e.id === eqId);
                      const deviatedCount = records.filter(r => r.status === 'deviated').length;
                      return (
                        <Card key={eqId} size="small"
                          style={{ marginBottom: 12, borderRadius: 10, border: deviatedCount > 0 ? '1px solid #fca5a5' : '1px solid #e8e8e8' }}
                          title={
                            <Space>
                              <Text strong style={{ color: '#1B3A5C' }}>{eq?.name ?? eqId}</Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>{eq?.code}</Text>
                              <Tag color={deviatedCount > 0 ? 'error' : 'success'}>
                                {deviatedCount > 0 ? `${deviatedCount} số hiệu lệch` : 'Tất cả khớp'}
                              </Tag>
                            </Space>
                          }
                        >
                          <Row gutter={[8, 8]}>
                            {records.map(r => {
                              const st = actualStatusConfig[r.status];
                              const devCount = r.components.filter(c => c.isDeviated).length;
                              return (
                                <Col key={r.id} xs={24} sm={12} md={8}>
                                  <div
                                    onClick={() => { setSelected(r); setDrawerTab('compare'); }}
                                    style={{
                                      border: '1px solid #e8e8e8', borderRadius: 8, padding: '10px 12px',
                                      cursor: 'pointer', transition: 'all 0.2s',
                                      background: r.status === 'deviated' ? '#fff5f5' : '#fff',
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Text strong style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{r.serialNumber}</Text>
                                      <Tag icon={st.icon} color={st.color} style={{ fontSize: 11, margin: 0 }}>{st.label}</Tag>
                                    </div>
                                    <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                                      TK: <Tag color="blue" style={{ fontSize: 10 }}>{r.designVersionRef}</Tag>
                                    </div>
                                    {devCount > 0 && (
                                      <div style={{ marginTop: 4, fontSize: 12, color: '#dc2626' }}>
                                        <WarningOutlined /> {devCount} thông số lệch
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                        </Card>
                      );
                    });
                  })()}
                </div>
              ),
            },

            // ── Lịch sử cập nhật ────────────────────────────────────────────────
            {
              key: 'history',
              label: <Space size={4}><HistoryOutlined />Lịch sử cập nhật</Space>,
              children: (
                <div style={{ padding: '4px 0 20px', maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
                  <Timeline
                    items={historyItems.map(h => ({
                      color: h.type === 'confirm' ? 'green' : 'blue',
                      children: (
                        <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: '8px 12px', background: '#fff', marginBottom: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Space size={6}>
                              <Tag color={h.type === 'confirm' ? 'success' : 'processing'} style={{ fontSize: 11 }}>
                                {h.type === 'confirm' ? 'Xác nhận' : 'Ghi nhận'}
                              </Tag>
                              <Text strong style={{ fontFamily: 'monospace' }}>{h.record.serialNumber}</Text>
                              <Text style={{ fontSize: 13 }}>{h.record.equipmentName}</Text>
                            </Space>
                            <Space size={6}>
                              <Text type="secondary" style={{ fontSize: 12 }}>{h.date}</Text>
                              <Tag icon={actualStatusConfig[h.record.status].icon}
                                color={actualStatusConfig[h.record.status].color} style={{ fontSize: 11 }}>
                                {actualStatusConfig[h.record.status].label}
                              </Tag>
                            </Space>
                          </div>
                          <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                            {h.type === 'confirm'
                              ? `Xác nhận bởi ${h.record.confirmedBy}`
                              : `Ghi nhận bởi ${h.record.recordedBy} · ${actualSourceLabels[h.record.source] || h.record.source}`}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ── Detail Drawer ─────────────────────────────────────────────────────────── */}
      <Drawer
        open={!!selected}
        onClose={() => { setSelected(null); setDrawerTab('compare'); }}
        width={700}
        title={null}
        styles={{ body: { padding: 0 } }}
      >
        {selected && (() => {
          const st = actualStatusConfig[selected.status];
          const devCount = selected.components.filter(c => c.isDeviated).length;
          const groups = [...new Set(selected.components.map(c => c.group))];
          const serialHistory = getHistoryBySerial(selected.serialNumber);

          return (
            <>
              {/* Drawer header */}
              <div style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', padding: '20px 24px', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{selected.equipmentName}</div>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
                      Số hiệu: <strong style={{ color: '#f0d890' }}>{selected.serialNumber}</strong>
                      &ensp;·&ensp;{serialHistory.length} lần ghi nhận
                    </div>
                  </div>
                  <Tag icon={st.icon} color={st.color} style={{ fontSize: 12, padding: '4px 10px', border: 'none' }}>
                    {st.label}
                  </Tag>
                </div>
              </div>

              {/* Tabs inside drawer */}
              <div style={{ padding: '0 24px' }}>
                <Tabs
                  activeKey={drawerTab}
                  onChange={setDrawerTab}
                  size="small"
                  items={[
                    // ── Đối chiếu thông số ──────────────────────────────────────
                    {
                      key: 'compare',
                      label: <Space size={4}><FilterOutlined />Đối chiếu thông số</Space>,
                      children: (
                        <div style={{ paddingBottom: 24 }}>
                          {devCount > 0 && (
                            <Alert type="warning" showIcon
                              message={`Phát hiện ${devCount} thông số lệch so với thiết kế`}
                              style={{ marginBottom: 14 }}
                            />
                          )}

                          <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}
                            labelStyle={{ background: '#f5f7fa', fontWeight: 600, color: '#1B3A5C' }}>
                            <Descriptions.Item label="Phiên bản TK">{selected.designVersionRef}</Descriptions.Item>
                            <Descriptions.Item label="Ngày ghi nhận">{selected.recordedAt}</Descriptions.Item>
                            <Descriptions.Item label="Nguồn">{actualSourceLabels[selected.source] || selected.source}</Descriptions.Item>
                            {selected.sourceRef && (
                              <Descriptions.Item label="Mã phiếu">{selected.sourceRef}</Descriptions.Item>
                            )}
                            <Descriptions.Item label="Người ghi nhận" span={selected.confirmedBy ? 1 : 2}>{selected.recordedBy}</Descriptions.Item>
                            {selected.confirmedBy && (
                              <Descriptions.Item label="Người xác nhận">{selected.confirmedBy} · {selected.confirmedAt}</Descriptions.Item>
                            )}
                          </Descriptions>

                          <Divider orientation="left" orientationMargin={0}
                            style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C', marginTop: 8 }}>
                            Thông số theo nhóm
                          </Divider>

                          {groups.map(g => {
                            const items = selected.components.filter(c => c.group === g);
                            const hasDeviation = items.some(c => c.isDeviated);
                            return (
                              <Card key={g} size="small" style={{
                                marginBottom: 10, borderRadius: 8,
                                border: hasDeviation ? '1px solid #fca5a5' : '1px solid #e8e8e8',
                              }}
                                title={
                                  <Space>
                                    {hasDeviation
                                      ? <WarningOutlined style={{ color: '#dc2626' }} />
                                      : <CheckCircleOutlined style={{ color: '#22c55e' }} />}
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{g}</span>
                                    {hasDeviation && <Tag color="error" style={{ fontSize: 11 }}>Có lệch</Tag>}
                                  </Space>
                                }
                              >
                                <Table size="small" pagination={false} dataSource={items}
                                  rowKey="code" showHeader={false}
                                  columns={[
                                    {
                                      dataIndex: 'name',
                                      render: (name, row) => (
                                        <Space size={4}>
                                          {row.isDeviated
                                            ? <WarningOutlined style={{ color: '#f59e0b', fontSize: 12 }} />
                                            : <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 12 }} />}
                                          <Text style={{ fontSize: 13 }}>{name}</Text>
                                          {row.unit && <Text type="secondary" style={{ fontSize: 11 }}>({row.unit})</Text>}
                                        </Space>
                                      ),
                                    },
                                    {
                                      width: 120,
                                      render: (_, row) => (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          TK: <Text code style={{ fontSize: 12 }}>{row.designValue}</Text>
                                        </Text>
                                      ),
                                    },
                                    {
                                      width: 120,
                                      render: (_, row) => (
                                        <Text style={{ fontSize: 12, color: row.isDeviated ? '#dc2626' : '#15803d', fontWeight: row.isDeviated ? 600 : 400 }}>
                                          TT: <Text code style={{ fontSize: 12, color: row.isDeviated ? '#dc2626' : undefined }}>{row.actualValue}</Text>
                                        </Text>
                                      ),
                                    },
                                    {
                                      render: (_, row) => row.deviationNote
                                        ? <Text type="danger" style={{ fontSize: 11 }}>{row.deviationNote}</Text>
                                        : null,
                                    },
                                  ]}
                                />
                              </Card>
                            );
                          })}

                          {/* Xử lý lệch */}
                          {devCount > 0 && (() => {
                            const deviatedComps = selected.components.filter(c => c.isDeviated);
                            return (
                              <div style={{ marginTop: 16 }}>
                                <Divider orientation="left" orientationMargin={0}
                                  style={{ fontSize: 13, fontWeight: 600, color: '#1B3A5C', marginTop: 0 }}>
                                  Xử lý các thông số lệch
                                </Divider>
                                {deviatedComps.map(comp => {
                                  const key = `${selected.id}_${comp.code}`;
                                  const handling: DeviationHandling | undefined = handlingMap[key] ?? comp.deviationHandling;
                                  const hCfg = handling ? deviationHandlingConfig[handling.action] : null;
                                  return (
                                    <div key={comp.code} style={{
                                      border: '1px solid #e8e8e8', borderRadius: 8,
                                      padding: '12px 14px', marginBottom: 8,
                                      background: handling ? '#f0fdf4' : '#fff5f5',
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                          <Space size={6} style={{ marginBottom: 4 }}>
                                            <WarningOutlined style={{ color: '#f59e0b' }} />
                                            <Text strong style={{ fontSize: 13 }}>{comp.name}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                              TK <Text code style={{ fontSize: 11 }}>{comp.designValue}</Text>
                                              {' → '}
                                              TT <Text code style={{ fontSize: 11, color: '#dc2626' }}>{comp.actualValue}</Text>
                                              {comp.unit && ` ${comp.unit}`}
                                            </Text>
                                          </Space>
                                          {handling ? (
                                            <div>
                                              <Space size={6} wrap>
                                                <Tag icon={hCfg?.icon} color={hCfg?.color} style={{ fontSize: 11 }}>
                                                  {hCfg?.label}
                                                </Tag>
                                                {handling.linkedRef && (
                                                  <Tag color="blue" style={{ fontSize: 11 }}>
                                                    {linkedModuleLabels[handling.linkedModule ?? ''] || handling.linkedModule}
                                                    {' · '}{handling.linkedRef}
                                                  </Tag>
                                                )}
                                              </Space>
                                              <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
                                                <Text type="secondary">{handling.handledAt} · {handling.handledBy}</Text>
                                              </div>
                                              <div style={{ marginTop: 2, fontSize: 12, color: '#374151' }}>{handling.reason}</div>
                                            </div>
                                          ) : (
                                            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>{comp.deviationNote}</div>
                                          )}
                                        </div>
                                        {!handling && isVongDoi && (
                                          <Space size={6} style={{ flexShrink: 0 }}>
                                            <Button size="small" type="primary"
                                              icon={<ToolOutlined />}
                                              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', fontSize: 12 }}
                                              onClick={() => { actionForm.resetFields(); setActionModal({ type: 'repair', compCode: comp.code }); }}>
                                              Tạo yêu cầu xử lý
                                            </Button>
                                            <Button size="small"
                                              icon={<CheckCircleOutlined />}
                                              style={{ color: '#15803d', borderColor: '#86efac', fontSize: 12 }}
                                              onClick={() => { actionForm.resetFields(); setActionModal({ type: 'accept', compCode: comp.code }); }}>
                                              Chấp nhận lệch
                                            </Button>
                                          </Space>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {selected.notes && (
                            <Alert type="info" showIcon message="Ghi chú" description={selected.notes} style={{ marginTop: 12 }} />
                          )}
                        </div>
                      ),
                    },

                    // ── Lịch sử cập nhật ────────────────────────────────────────
                    {
                      key: 'history',
                      label: (
                        <Space size={4}>
                          <HistoryOutlined />
                          Lịch sử cập nhật
                          <Badge count={serialHistory.length} size="small" style={{ backgroundColor: '#1B3A5C' }} />
                        </Space>
                      ),
                      children: (
                        <div style={{ paddingBottom: 24 }}>
                          <Timeline
                            items={serialHistory.map((rec, idx) => {
                              const recSt = actualStatusConfig[rec.status];
                              const recDevCount = rec.components.filter(c => c.isDeviated).length;
                              const isLatest = idx === 0;
                              return {
                                color: isLatest ? '#1B3A5C' : recDevCount > 0 ? '#dc2626' : '#22c55e',
                                dot: isLatest ? (
                                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#1B3A5C', border: '2px solid #1B3A5C' }} />
                                ) : undefined,
                                children: (
                                  <Card size="small" style={{
                                    marginBottom: 8, borderRadius: 10,
                                    border: isLatest ? '2px solid #1B3A5C' : '1px solid #e8e8e8',
                                    background: isLatest ? '#eff6ff' : '#fff',
                                  }}
                                    styles={{ body: { padding: '12px 16px' } }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                      <Space size={8}>
                                        {isLatest && <Tag color="blue" style={{ fontSize: 11, fontWeight: 600 }}>Mới nhất</Tag>}
                                        <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 11 }}>{rec.designVersionRef}</Tag>
                                        <Tag icon={recSt.icon} color={recSt.color} style={{ fontSize: 11 }}>{recSt.label}</Tag>
                                      </Space>
                                      <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>{rec.recordedAt}</Text>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#555', marginBottom: recDevCount > 0 ? 8 : 0 }}>
                                      <Space size={12} wrap>
                                        <span>Nguồn: <strong>{actualSourceLabels[rec.source] || rec.source}</strong>{rec.sourceRef ? ` (${rec.sourceRef})` : ''}</span>
                                        <span>Ghi nhận: <strong>{rec.recordedBy}</strong></span>
                                        {rec.confirmedBy && <span>Xác nhận: <strong>{rec.confirmedBy}</strong></span>}
                                      </Space>
                                    </div>
                                    {recDevCount > 0 && (
                                      <div style={{ marginTop: 6 }}>
                                        {rec.components.filter(c => c.isDeviated).map(c => (
                                          <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#dc2626', padding: '2px 0' }}>
                                            <WarningOutlined style={{ fontSize: 11 }} />
                                            <span>{c.name}:</span>
                                            <Text code style={{ fontSize: 11 }}>TK {c.designValue}</Text>
                                            <span>→</span>
                                            <Text code style={{ fontSize: 11, color: '#dc2626' }}>TT {c.actualValue}</Text>
                                            {c.unit && <Text type="secondary" style={{ fontSize: 11 }}>{c.unit}</Text>}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {rec.notes && (
                                      <div style={{ marginTop: 6, fontSize: 12, color: '#888', fontStyle: 'italic' }}>{rec.notes}</div>
                                    )}
                                  </Card>
                                ),
                              };
                            })}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </>
          );
        })()}
      </Drawer>

      {/* ── Action Modal ──────────────────────────────────────────────────────────── */}
      <Modal
        open={!!actionModal}
        title={
          <div style={{ color: '#1B3A5C', fontWeight: 700 }}>
            {actionModal?.type === 'repair' ? 'Tạo yêu cầu xử lý lệch' : 'Chấp nhận lệch có kiểm soát'}
          </div>
        }
        onCancel={() => setActionModal(null)}
        onOk={handleActionSubmit}
        okText={actionModal?.type === 'repair' ? 'Tạo yêu cầu' : 'Xác nhận chấp nhận'}
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#1B3A5C', borderColor: '#1B3A5C' } }}
        width={520}
      >
        {actionModal && selected && (() => {
          const comp = selected.components.find(c => c.code === actionModal.compCode);
          if (!comp) return null;
          return (
            <div>
              <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <Space size={6}>
                  <WarningOutlined style={{ color: '#dc2626' }} />
                  <Text strong>{comp.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    TK <Text code style={{ fontSize: 11 }}>{comp.designValue}</Text>
                    {' → '}
                    TT <Text code style={{ fontSize: 11, color: '#dc2626' }}>{comp.actualValue}</Text>
                    {comp.unit && ` ${comp.unit}`}
                  </Text>
                </Space>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{comp.deviationNote}</div>
              </div>

              <Form form={actionForm} layout="vertical" requiredMark={false}>
                {actionModal.type === 'repair' ? (
                  <>
                    <Form.Item label="Chuyển sang phân hệ" name="linkedModule"
                      rules={[{ required: true, message: 'Vui lòng chọn phân hệ xử lý' }]}>
                      <Radio.Group>
                        <Space direction="vertical" size={6}>
                          <Radio value="pkkq-suachua">Quản lý Khắc phục</Radio>
                          <Radio value="pkkq-baotri">Quản lý Bảo trì</Radio>
                          <Radio value="pkkq-daitu">Quản lý Nâng cấp</Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item label="Mã phiếu yêu cầu (tùy chọn)" name="linkedRef">
                      <Input placeholder="Ví dụ: SC-2025-301" />
                    </Form.Item>
                    <Form.Item label="Mô tả yêu cầu" name="reason"
                      rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                      <Input.TextArea rows={3} placeholder="Mô tả nguyên nhân và nội dung yêu cầu xử lý..." />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Alert type="warning" showIcon style={{ marginBottom: 12 }}
                      message="Chấp nhận lệch có kiểm soát yêu cầu phê duyệt của người có thẩm quyền"
                    />
                    <Form.Item label="Lý do chấp nhận" name="reason"
                      rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
                      <Input.TextArea rows={3}
                        placeholder="Lý do chấp nhận lệch: cơ sở kỹ thuật, tiêu chuẩn tham chiếu, mức độ ảnh hưởng đến nhiệm vụ..." />
                    </Form.Item>
                  </>
                )}
              </Form>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ActualConfigurationPage;
