import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Select, Typography, Drawer,
  Descriptions, Form, DatePicker, Input, Row, Col, message, Divider,
  Badge, Dropdown, Tabs, Tree, Steps, Tooltip, Empty,
  Statistic, Timeline, Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import {
  PlusOutlined, ApartmentOutlined, EditOutlined, CheckOutlined,
  EyeOutlined, FilterOutlined, DatabaseOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ToolOutlined, MoreOutlined, SendOutlined,
  FolderOutlined, PartitionOutlined, BranchesOutlined,
  ShareAltOutlined, DeleteOutlined, CaretRightOutlined,
  GlobalOutlined, FileTextOutlined, TagsOutlined, CloseOutlined,
  WarningOutlined, SyncOutlined,
  CloseCircleOutlined, RocketOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { configurationRecords } from '../../data/configurations';
import { designVersions, getVersionsByEquipment } from '../../data/designVersions';
import { equipmentList } from '../../data/equipment';
import { equipmentComponents } from '../../data/components';
import { changeRequests as allChangeRequests, getPendingChangeRequests } from '../../data/changeRequests';
import type {
  ConfigurationRecord, ConfigChangeType, DesignVersion, DesignVersionStatus,
  ChangeRequest, ChangeRequestStatus, ChangeRequestPriority, ChangeRequestSource,
} from '../../types';
import { configChangeTypeConfig, formatDate, equipmentTypeConfig } from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Design-version helpers ───────────────────────────────────────────────────

const versionStatusConfig: Record<DesignVersionStatus, { label: string; color: string }> = {
  draft:            { label: 'Nháp',           color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt',  color: 'warning' },
  approved:         { label: 'Đã duyệt',        color: 'blue' },
  published:        { label: 'Đã công bố',      color: 'success' },
  archived:         { label: 'Lưu trữ',         color: 'default' },
};

const cfgStatusConfig = {
  draft:            { label: 'Nháp',           color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt',  color: 'warning' },
  approved:         { label: 'Đã duyệt',        color: 'success' },
  rejected:         { label: 'Từ chối',         color: 'error' },
};

const SUBSYSTEMS = [
  { system: 'pkkq-sanxuat',   systemName: 'Quản lý Phát triển' },
  { system: 'pkkq-suachua',   systemName: 'Quản lý Khắc phục' },
  { system: 'pkkq-daitu',     systemName: 'Quản lý Nâng cấp' },
  { system: 'pkkq-chatluong', systemName: 'Chất lượng QA/QC' },
  { system: 'pkkq-kho',       systemName: 'Quản lý Kho tàng' },
];

const generateNextVersion = (equipmentId: string): string => {
  const eq = equipmentList.find(e => e.id === equipmentId);
  if (!eq) return '';
  const versions = getVersionsByEquipment(equipmentId);
  const latest = versions[versions.length - 1];
  if (!latest) return `${eq.code}-v1.0`;
  const match = latest.version.match(/V(\d+)\.(\d+)/);
  if (match) {
    const major = parseInt(match[1]);
    const minor = parseInt(match[2]);
    return `${eq.code}-v${major}.${minor + 1}`;
  }
  return `${eq.code}-v1.1`;
};

// ─── Change-request helpers ───────────────────────────────────────────────────

const SOURCE_LABELS: Record<ChangeRequestSource, string> = {
  'pkkq-sanxuat': 'Phát triển',
  'pkkq-suachua': 'Khắc phục',
  'pkkq-daitu':   'Nâng cấp',
  'pkkq-baotri':  'Bảo trì',
  internal:       'Nội bộ',
};

const CR_STATUS_CONFIG: Record<ChangeRequestStatus, { label: string; color: string }> = {
  draft:        { label: 'Nháp',           color: 'default' },
  submitted:    { label: 'Chờ xem xét',    color: 'warning' },
  under_review: { label: 'Đang đánh giá',  color: 'processing' },
  approved:     { label: 'Đã phê duyệt',   color: 'success' },
  rejected:     { label: 'Từ chối',        color: 'error' },
  implemented:  { label: 'Đã thực hiện',   color: 'success' },
};

const PRIORITY_CONFIG: Record<ChangeRequestPriority, { label: string; color: string }> = {
  critical: { label: 'Khẩn cấp',   color: 'red' },
  high:     { label: 'Cao',        color: 'orange' },
  medium:   { label: 'Trung bình', color: 'blue' },
  low:      { label: 'Thấp',       color: 'default' },
};

const ALL_SUBSYSTEMS_CR = [
  { key: 'pkkq-sanxuat',   label: 'Phát triển' },
  { key: 'pkkq-suachua',   label: 'Khắc phục' },
  { key: 'pkkq-daitu',     label: 'Nâng cấp' },
  { key: 'pkkq-chatluong', label: 'Chất lượng' },
  { key: 'pkkq-kho',       label: 'Kho tàng' },
];

function getCRStepIndex(cr: ChangeRequest): number {
  switch (cr.status) {
    case 'draft':        return 0;
    case 'submitted':    return 1;
    case 'under_review': return 2;
    case 'rejected':     return 3;
    case 'approved':     return cr.linkedConfigId ? 4 : 3;
    case 'implemented':  return 5;
    default:             return 0;
  }
}

// ─── BOM types ────────────────────────────────────────────────────────────────

interface BOMTreeNode extends DataNode {
  nodeType: 'equipment' | 'module' | 'component';
  equipmentId: string;
  moduleGroup?: string;
  componentId?: string;
  children?: BOMTreeNode[];
}

interface DiffRow {
  name: string;
  valueA: string;
  valueB: string;
  unit?: string;
  changed: boolean;
  onlyInA: boolean;
  onlyInB: boolean;
}

// ─── BOM helpers ──────────────────────────────────────────────────────────────

const buildBOMTree = (): BOMTreeNode[] =>
  equipmentList.map(eq => {
    const comps = equipmentComponents.filter(c => c.equipmentId === eq.id);
    const groups = [...new Set(comps.map(c => c.group))];
    const typeCfg = equipmentTypeConfig[eq.type];
    return {
      key: eq.id,
      nodeType: 'equipment',
      equipmentId: eq.id,
      title: (
        <span>
          <span style={{ fontWeight: 600, color: '#1B3A5C' }}>{eq.name}</span>
          <span style={{ marginLeft: 6, fontSize: 10, color: typeCfg?.color, fontWeight: 500,
            background: typeCfg ? `${typeCfg.color}18` : undefined, padding: '1px 5px', borderRadius: 4 }}>
            {typeCfg?.label}
          </span>
        </span>
      ),
      icon: <PartitionOutlined style={{ color: '#1B3A5C' }} />,
      children: groups.map(group => {
        const groupComps = comps.filter(c => c.group === group);
        return {
          key: `${eq.id}__${group}`,
          nodeType: 'module' as const,
          equipmentId: eq.id,
          moduleGroup: group,
          title: (
            <span>
              <span style={{ fontWeight: 500, color: '#374151' }}>{group}</span>
              <span style={{ marginLeft: 6, fontSize: 10, color: '#6b7280' }}>({groupComps.length} linh kiện)</span>
            </span>
          ),
          icon: <FolderOutlined style={{ color: '#D4A843' }} />,
          children: groupComps.map(comp => ({
            key: comp.id,
            nodeType: 'component' as const,
            equipmentId: eq.id,
            moduleGroup: group,
            componentId: comp.id,
            isLeaf: true,
            icon: <ToolOutlined style={{ color: comp.condition === 'poor' ? '#ff4d4f' : comp.condition === 'fair' ? '#faad14' : '#52c41a', fontSize: 11 }} />,
            title: (
              <span style={{ fontSize: 13 }}>
                {comp.name}
                <span style={{ marginLeft: 6, fontSize: 10, color: '#9ca3af' }}>{comp.code}</span>
              </span>
            ),
          })),
        };
      }),
    };
  });

const computeDiff = (vA: DesignVersion, vB: DesignVersion): DiffRow[] => {
  const cfgsA = configurationRecords.filter(c => vA.configIds.includes(c.id));
  const cfgsB = configurationRecords.filter(c => vB.configIds.includes(c.id));

  const mapA: Record<string, { value: string; unit?: string }> = {};
  cfgsA.forEach(c => c.components.forEach(comp => { mapA[comp.name] = { value: comp.newValue, unit: comp.unit }; }));
  const mapB: Record<string, { value: string; unit?: string }> = {};
  cfgsB.forEach(c => c.components.forEach(comp => { mapB[comp.name] = { value: comp.newValue, unit: comp.unit }; }));

  const allNames = [...new Set([...Object.keys(mapA), ...Object.keys(mapB)])];
  return allNames.map(name => ({
    name,
    valueA: mapA[name]?.value ?? '—',
    valueB: mapB[name]?.value ?? '—',
    unit: mapA[name]?.unit || mapB[name]?.unit,
    changed: (mapA[name]?.value ?? '') !== (mapB[name]?.value ?? ''),
    onlyInA: !!mapA[name] && !mapB[name],
    onlyInB: !mapA[name] && !!mapB[name],
  }));
};

// ─── Shared KPI Stat Card ─────────────────────────────────────────────────────

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

// ─── BOM Tab ──────────────────────────────────────────────────────────────────

const BOMTab: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<BOMTreeNode | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [compareV1Id, setCompareV1Id] = useState<string>('');
  const [compareV2Id, setCompareV2Id] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const treeData = useMemo(() => buildBOMTree(), []);

  const handleSelect = (_: React.Key[], info: { node: DataNode }) => {
    setSelectedNode(info.node as BOMTreeNode);
    const node = info.node as BOMTreeNode;
    if (node.nodeType === 'equipment') {
      setCompareV1Id('');
      setCompareV2Id('');
    }
  };

  const selectedEquipment = selectedNode ? equipmentList.find(e => e.id === selectedNode.equipmentId) : null;
  const eqVersions = selectedEquipment ? getVersionsByEquipment(selectedEquipment.id) : [];

  const diffRows = useMemo(() => {
    if (!compareV1Id || !compareV2Id) return [];
    const vA = designVersions.find(v => v.id === compareV1Id);
    const vB = designVersions.find(v => v.id === compareV2Id);
    if (!vA || !vB) return [];
    return computeDiff(vA, vB);
  }, [compareV1Id, compareV2Id]);

  const filteredTree = useMemo(() => {
    if (!searchVal) return treeData;
    const q = searchVal.toLowerCase();
    return treeData.filter(eq =>
      (eq.equipmentId && equipmentList.find(e => e.id === eq.equipmentId)?.name.toLowerCase().includes(q)) ||
      equipmentComponents.filter(c => c.equipmentId === eq.equipmentId).some(c => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
    );
  }, [searchVal, treeData]);

  const renderRightPanel = () => {
    if (!selectedNode || !selectedEquipment) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 12 }}>
          <ApartmentOutlined style={{ fontSize: 48, color: '#d1d5db' }} />
          <Text type="secondary">Chọn thiết bị, mô-đun hoặc linh kiện từ cây bên trái để xem chi tiết</Text>
        </div>
      );
    }

    if (selectedNode.nodeType === 'equipment') {
      const typeCfg = equipmentTypeConfig[selectedEquipment.type];
      const baseline = eqVersions.find(v => v.isBaseline);
      return (
        <div>
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)', borderRadius: 10, marginBottom: 16, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedEquipment.name}</div>
                <Text code style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{selectedEquipment.code}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Loại thiết bị</div>
                <Tag color={typeCfg?.color} style={{ margin: 0, marginTop: 2 }}>{typeCfg?.label}</Tag>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 12, opacity: 0.8 }}>
              <span>Nhà sản xuất: <strong>{selectedEquipment.manufacturer}</strong></span>
              <span>Năm tiếp nhận: <strong>{selectedEquipment.yearReceived}</strong></span>
              {baseline && <span>Phiên bản chuẩn: <Tag color="success" style={{ margin: 0, fontSize: 11 }}>{baseline.version}</Tag></span>}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BranchesOutlined /> Lịch sử phiên bản cấu hình
            </div>
            {eqVersions.length === 0 ? (
              <Empty description="Chưa có phiên bản nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eqVersions.map(v => (
                  <div key={v.id} style={{
                    padding: '10px 14px', borderRadius: 8, border: v.isBaseline ? '1.5px solid #1B3A5C' : '1px solid #e8e8e8',
                    background: v.isBaseline ? '#eff6ff' : '#fafafa',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text code style={{ fontSize: 12, fontWeight: 700, color: '#1B3A5C' }}>{v.version}</Text>
                        <Tag color={versionStatusConfig[v.status].color} style={{ fontSize: 10, margin: 0 }}>
                          {versionStatusConfig[v.status].label}
                        </Tag>
                        {v.isBaseline && <Tag color="gold" style={{ fontSize: 10, margin: 0 }}>Chuẩn hiện tại</Tag>}
                      </div>
                      <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{v.description}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                        {formatDate(v.releaseDate)}
                        {v.approvedBy && <span> · Duyệt bởi: {v.approvedBy}</span>}
                        {v.configIds.length > 0 && <span> · {v.configIds.length} hồ sơ thay đổi</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {eqVersions.length >= 2 && (
            <div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TagsOutlined /> So sánh phiên bản
              </div>
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={11}>
                  <Select placeholder="Phiên bản A" style={{ width: '100%' }} value={compareV1Id || undefined} onChange={setCompareV1Id} size="small">
                    {eqVersions.map(v => <Option key={v.id} value={v.id}>{v.version} · {formatDate(v.releaseDate)}</Option>)}
                  </Select>
                </Col>
                <Col span={2} style={{ textAlign: 'center', paddingTop: 4 }}>
                  <CaretRightOutlined style={{ color: '#9ca3af' }} />
                </Col>
                <Col span={11}>
                  <Select placeholder="Phiên bản B" style={{ width: '100%' }} value={compareV2Id || undefined} onChange={setCompareV2Id} size="small">
                    {eqVersions.map(v => <Option key={v.id} value={v.id}>{v.version} · {formatDate(v.releaseDate)}</Option>)}
                  </Select>
                </Col>
              </Row>
              {diffRows.length > 0 && (
                <div>
                  {diffRows.map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'stretch', borderRadius: 6,
                      border: `1px solid ${row.changed || row.onlyInA || row.onlyInB ? '#fde68a' : '#e8e8e8'}`,
                      background: row.changed ? '#fffbeb' : row.onlyInB ? '#f0fdf4' : row.onlyInA ? '#fef2f2' : '#fafafa',
                      marginBottom: 4, overflow: 'hidden',
                    }}>
                      <div style={{ width: '30%', padding: '7px 10px', borderRight: '1px solid #e8e8e8', fontSize: 12, fontWeight: 500, color: '#374151' }}>
                        {row.name}{row.unit && <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>({row.unit})</span>}
                      </div>
                      <div style={{ width: '35%', padding: '7px 10px', borderRight: '1px solid #e8e8e8', fontSize: 12, color: row.onlyInA ? '#dc2626' : '#374151' }}>{row.valueA}</div>
                      <div style={{ width: '35%', padding: '7px 10px', fontSize: 12, color: row.onlyInB ? '#16a34a' : row.changed ? '#d97706' : '#374151', fontWeight: row.changed ? 600 : 400 }}>{row.valueB}</div>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                    <span style={{ marginRight: 12 }}><span style={{ color: '#d97706', fontWeight: 600 }}>■</span> Đã thay đổi</span>
                    <span style={{ marginRight: 12 }}><span style={{ color: '#16a34a', fontWeight: 600 }}>■</span> Thêm mới trong B</span>
                    <span><span style={{ color: '#dc2626', fontWeight: 600 }}>■</span> Chỉ có ở A</span>
                  </div>
                </div>
              )}
              {compareV1Id && compareV2Id && diffRows.length === 0 && (
                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#16a34a', textAlign: 'center' }}>
                  Hai phiên bản giống nhau hoặc không có dữ liệu thay đổi để so sánh.
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (selectedNode.nodeType === 'module') {
      const moduleComps = equipmentComponents.filter(c => c.equipmentId === selectedNode.equipmentId && c.group === selectedNode.moduleGroup);
      const conditionColor: Record<string, string> = { excellent: '#52c41a', good: '#73d13d', fair: '#faad14', poor: '#ff4d4f' };
      return (
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1B3A5C', marginBottom: 4 }}>{selectedNode.moduleGroup}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>Mô-đun thuộc: {selectedEquipment.name} · {moduleComps.length} linh kiện</Text>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {moduleComps.map(comp => (
              <div key={comp.id} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e8e8e8', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: '#1B3A5C' }}>{comp.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    <Text code style={{ fontSize: 10 }}>{comp.code}</Text>
                    <span style={{ marginLeft: 8 }}>SL: {comp.quantity} {comp.unit}</span>
                    {comp.nextReplaceDate && <span style={{ marginLeft: 8 }}>Thay tiếp: {formatDate(comp.nextReplaceDate)}</span>}
                  </div>
                </div>
                <Tag color={conditionColor[comp.condition]} style={{ margin: 0, fontSize: 10 }}>
                  {{ excellent: 'Rất tốt', good: 'Tốt', fair: 'TB', poor: 'Kém' }[comp.condition]}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const comp = equipmentComponents.find(c => c.id === selectedNode.componentId);
    if (!comp) return null;
    const condBadge: Record<string, { label: string; color: string }> = {
      excellent: { label: 'Rất tốt',    color: '#52c41a' },
      good:      { label: 'Tốt',        color: '#73d13d' },
      fair:      { label: 'Trung bình', color: '#faad14' },
      poor:      { label: 'Kém',        color: '#ff4d4f' },
    };
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1B3A5C' }}>{comp.name}</div>
            <Text code style={{ fontSize: 11 }}>{comp.code}</Text>
          </div>
          <Tag color={condBadge[comp.condition].color}>{condBadge[comp.condition].label}</Tag>
        </div>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Thuộc mô-đun" span={2}>{comp.group}</Descriptions.Item>
          <Descriptions.Item label="Thiết bị">{selectedEquipment.name}</Descriptions.Item>
          <Descriptions.Item label="Số lượng">{comp.quantity} {comp.unit}</Descriptions.Item>
          <Descriptions.Item label="Ngày thay lần cuối">{comp.replacedDate ? formatDate(comp.replacedDate) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày thay tiếp theo">
            {comp.nextReplaceDate ? (
              <span style={{ color: dayjs(comp.nextReplaceDate).isBefore(dayjs()) ? '#ff4d4f' : '#374151' }}>
                {formatDate(comp.nextReplaceDate)}
              </span>
            ) : '—'}
          </Descriptions.Item>
          {comp.notes && <Descriptions.Item label="Ghi chú" span={2}>{comp.notes}</Descriptions.Item>}
        </Descriptions>
      </div>
    );
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={9}>
        <Card styles={{ body: { padding: '12px 0 0' } }} style={{ borderRadius: 10, minHeight: 500 }}>
          <div style={{ padding: '0 12px 10px' }}>
            <Input.Search
              placeholder="Tìm thiết bị, mô-đun..."
              size="small"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              allowClear
            />
          </div>
          <div style={{ maxHeight: 580, overflowY: 'auto', paddingBottom: 12 }}>
            <Tree
              showIcon
              blockNode
              expandedKeys={expandedKeys}
              onExpand={keys => setExpandedKeys(keys)}
              treeData={filteredTree}
              onSelect={handleSelect}
              selectedKeys={selectedNode ? [selectedNode.key as React.Key] : []}
              style={{ fontSize: 13 }}
            />
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={15}>
        <Card styles={{ body: { padding: 20, minHeight: 500 } }} style={{ borderRadius: 10 }}>
          {renderRightPanel()}
        </Card>
      </Col>
    </Row>
  );
};

// ─── Change Request Detail Drawer ─────────────────────────────────────────────

interface CRDetailDrawerProps {
  record: ChangeRequest | null;
  open: boolean;
  onClose: () => void;
  isVongDoi: boolean;
  onAction: (action: 'start_review' | 'approve' | 'reject' | 'implement', id: string) => void;
}

const CRDetailDrawer: React.FC<CRDetailDrawerProps> = ({ record, open, onClose, isVongDoi, onAction }) => {
  if (!record) return null;

  const stepIndex = getCRStepIndex(record);
  const steps = [
    { title: 'Tiếp nhận' }, { title: 'Đánh giá' }, { title: 'Xây dựng phương án' },
    { title: 'Phê duyệt' }, { title: 'Ban hành' }, { title: 'Theo dõi' },
  ];
  const statusCfg = CR_STATUS_CONFIG[record.status];

  const timelineItems = [];
  timelineItems.push({
    color: 'blue',
    children: (
      <>
        <Text strong>Tạo yêu cầu</Text><br />
        <Text type="secondary" style={{ fontSize: 12 }}>{record.requestedBy} — {formatDate(record.requestedAt)}</Text>
      </>
    ),
  });
  if (record.reviewedAt) {
    timelineItems.push({
      color: 'blue',
      children: (
        <>
          <Text strong>Bắt đầu đánh giá</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.reviewedBy} — {formatDate(record.reviewedAt)}</Text>
        </>
      ),
    });
  }
  if (record.approvedAt) {
    timelineItems.push({
      color: record.status === 'rejected' ? 'red' : 'green',
      dot: record.status === 'rejected'
        ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        : <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      children: (
        <>
          <Text strong>{record.status === 'rejected' ? 'Từ chối' : 'Phê duyệt'}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.approvedBy} — {formatDate(record.approvedAt)}</Text>
        </>
      ),
    });
  }
  if (record.implementedAt) {
    timelineItems.push({
      color: 'green',
      dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      children: (
        <>
          <Text strong>Hoàn thành thực hiện</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.implementedBy} — {formatDate(record.implementedAt)}</Text>
        </>
      ),
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      styles={{ body: { padding: 0, background: '#f0f2f5' } }}
      title={null}
      closable={false}
    >
      <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{record.code}</Text>
              <Tag color={statusCfg.color} style={{ margin: 0 }}>
                {record.status === 'implemented' && <CheckCircleOutlined style={{ marginRight: 4 }} />}
                {statusCfg.label}
              </Tag>
            </div>
            <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 600 }}>{record.title}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{record.equipmentName} — {record.equipmentCode}</Text>
          </div>
          <Button onClick={onClose} type="text" style={{ color: '#fff', marginLeft: 8 }}>✕</Button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <Tabs
          defaultActiveKey="detail"
          items={[
            {
              key: 'detail',
              label: 'Chi tiết',
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  <Card size="small" style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <Steps current={stepIndex} status={record.status === 'rejected' ? 'error' : 'process'} size="small" items={steps} />
                  </Card>
                  <Card size="small" style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <Descriptions bordered size="small" column={2}>
                      <Descriptions.Item label="Mã yêu cầu">
                        <Text style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{record.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mức ưu tiên">
                        <Tag color={PRIORITY_CONFIG[record.priority].color}>{PRIORITY_CONFIG[record.priority].label}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thiết bị" span={2}>
                        {record.equipmentName}{' '}
                        <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 12 }}>({record.equipmentCode})</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nguồn yêu cầu">{SOURCE_LABELS[record.source]}</Descriptions.Item>
                      <Descriptions.Item label="Mã phiếu nguồn">
                        {record.sourceRef ? <Text style={{ fontFamily: 'monospace' }}>{record.sourceRef}</Text> : <Text type="secondary">—</Text>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày gửi">{formatDate(record.requestedAt)}</Descriptions.Item>
                      <Descriptions.Item label="Người yêu cầu">{record.requestedBy}</Descriptions.Item>
                      <Descriptions.Item label="Đơn vị" span={2}>{record.requestedDept}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card size="small" title={<span style={{ color: '#1B3A5C', fontWeight: 600 }}><FileTextOutlined style={{ marginRight: 8 }} />Nội dung yêu cầu</span>}
                    style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>Mô tả thay đổi</Text>
                      <div style={{ marginTop: 6, padding: '10px 12px', border: '1px solid #e8e8e8', borderRadius: 8, background: '#eff6ff', lineHeight: 1.6 }}>
                        {record.description}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>Lý do thay đổi</Text>
                      <div style={{ marginTop: 6, padding: '10px 12px', border: '1px solid #e8e8e8', borderRadius: 8, background: '#eff6ff', lineHeight: 1.6 }}>
                        {record.reason}
                      </div>
                    </div>
                  </Card>
                  {record.affectedSerials && record.affectedSerials.length > 0 && (
                    <Card size="small" title={<span style={{ color: '#1B3A5C', fontWeight: 600 }}><TagsOutlined style={{ marginRight: 8 }} />Số hiệu bị ảnh hưởng</span>}
                      style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <Space wrap>
                        {record.affectedSerials.map((s: string) => (
                          <Tag key={s} color="geekblue" style={{ fontFamily: 'monospace' }}>{s}</Tag>
                        ))}
                      </Space>
                    </Card>
                  )}
                  {record.impactAnalysis && (
                    <Alert type="info" showIcon icon={<WarningOutlined />} message="Phân tích tác động" description={record.impactAnalysis} style={{ borderRadius: 10 }} />
                  )}
                  {record.proposedSolution && (
                    <Alert type="info" showIcon icon={<ToolOutlined />} message="Phương án đề xuất" description={record.proposedSolution} style={{ borderRadius: 10 }} />
                  )}
                  {record.reviewNotes && record.status !== 'rejected' && (
                    <Alert type="info" showIcon message="Ghi chú phê duyệt" description={record.reviewNotes} style={{ borderRadius: 10 }} />
                  )}
                  {record.reviewNotes && record.status === 'rejected' && (
                    <Alert type="warning" showIcon icon={<CloseCircleOutlined />} message="Lý do từ chối" description={record.reviewNotes} style={{ borderRadius: 10 }} />
                  )}
                  {record.linkedConfigId && (() => {
                    const cfg = configurationRecords.find(c => c.id === record.linkedConfigId);
                    return cfg ? (
                      <Alert type="success" showIcon icon={<CheckCircleOutlined />} message="Đã tạo phiên bản cấu hình"
                        description={<>Mã cấu hình: <Text style={{ fontFamily: 'monospace', color: '#1B3A5C' }}>{cfg.id}</Text> — Phiên bản <strong>{cfg.version}</strong> — Ngày {formatDate(cfg.changeDate)}</>}
                        style={{ borderRadius: 10 }} />
                    ) : null;
                  })()}
                  {record.postChangeNote && (
                    <Alert type="success" showIcon icon={<CheckCircleOutlined />} message="Kết quả sau thực hiện" description={record.postChangeNote} style={{ borderRadius: 10 }} />
                  )}
                  {isVongDoi && (
                    <Card size="small" style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <Space>
                        {record.status === 'submitted' && (
                          <Button type="primary" icon={<SyncOutlined />} style={{ background: '#1890ff', borderColor: '#1890ff' }}
                            onClick={() => onAction('start_review', record.id)}>Bắt đầu đánh giá</Button>
                        )}
                        {record.status === 'under_review' && (
                          <>
                            <Button type="primary" icon={<CheckOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => onAction('approve', record.id)}>Phê duyệt</Button>
                            <Button danger icon={<CloseCircleOutlined />}
                              onClick={() => onAction('reject', record.id)}>Từ chối</Button>
                          </>
                        )}
                        {record.status === 'approved' && (
                          <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#1890ff', borderColor: '#1890ff' }}
                            onClick={() => onAction('implement', record.id)}>Đánh dấu đã thực hiện</Button>
                        )}
                      </Space>
                    </Card>
                  )}
                </Space>
              ),
            },
            {
              key: 'history',
              label: 'Lịch sử xử lý',
              children: (
                <Card size="small" style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <Timeline items={timelineItems} />
                </Card>
              ),
            },
          ]}
        />
      </div>
    </Drawer>
  );
};

// ─── Create CR Drawer ─────────────────────────────────────────────────────────

interface CreateCRDrawerProps { open: boolean; onClose: () => void; onSuccess: () => void; }

const CreateCRDrawer: React.FC<CreateCRDrawerProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(() => { form.resetFields(); onSuccess(); onClose(); }).catch(() => {});
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={600}
      title={<span style={{ color: '#1B3A5C', fontWeight: 700 }}><PlusOutlined style={{ marginRight: 8 }} />Tạo yêu cầu thay đổi cấu hình</span>}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Hủy bỏ</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}>
              Gửi yêu cầu
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark>
        <Form.Item name="equipmentId" label="Thiết bị" rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
          <Select showSearch placeholder="Chọn thiết bị" optionFilterProp="label"
            options={equipmentList.map(eq => ({ value: eq.id, label: `${eq.name} (${eq.code})` }))} />
        </Form.Item>
        <Form.Item name="title" label="Tiêu đề yêu cầu" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input placeholder="Nhập tiêu đề mô tả ngắn gọn thay đổi..." />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="priority" label="Mức ưu tiên" initialValue="medium" rules={[{ required: true }]}>
              <Select options={[
                { value: 'critical', label: 'Khẩn cấp' }, { value: 'high', label: 'Cao' },
                { value: 'medium', label: 'Trung bình' }, { value: 'low', label: 'Thấp' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="source" label="Nguồn yêu cầu" initialValue="internal" rules={[{ required: true }]}>
              <Select options={[
                { value: 'pkkq-sanxuat', label: 'Phát triển' }, { value: 'pkkq-suachua', label: 'Khắc phục' },
                { value: 'pkkq-daitu', label: 'Nâng cấp' }, { value: 'pkkq-baotri', label: 'Bảo trì' },
                { value: 'internal', label: 'Nội bộ' },
              ]} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="sourceRef" label="Mã phiếu nguồn">
          <Input placeholder="Ví dụ: SC-2026-0088 (không bắt buộc)" />
        </Form.Item>
        <Form.Item name="description" label="Nội dung thay đổi" rules={[{ required: true, message: 'Vui lòng mô tả nội dung thay đổi' }]}>
          <TextArea rows={4} placeholder="Mô tả chi tiết thay đổi cần thực hiện..." />
        </Form.Item>
        <Form.Item name="reason" label="Lý do thay đổi" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
          <TextArea rows={3} placeholder="Nêu rõ lý do kỹ thuật hoặc vận hành dẫn đến yêu cầu thay đổi..." />
        </Form.Item>
        <Form.Item name="affectedSerials" label="Số hiệu bị ảnh hưởng">
          <Input placeholder="P18-SH001, P18-SH002 (cách nhau bằng dấu phẩy)" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// ─── Yêu cầu thay đổi Tab ─────────────────────────────────────────────────────

const ChangeRequestTab: React.FC<{ messageApi: ReturnType<typeof message.useMessage>[0] }> = ({ messageApi }) => {
  const { isVongDoi } = useUser();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredList = useMemo(() => allChangeRequests.filter(cr => {
    if (filterStatus !== 'all' && cr.status !== filterStatus) return false;
    if (filterEquipment !== 'all' && cr.equipmentId !== filterEquipment) return false;
    if (filterPriority !== 'all' && cr.priority !== filterPriority) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!cr.code.toLowerCase().includes(q) && !cr.title.toLowerCase().includes(q) &&
          !cr.equipmentName.toLowerCase().includes(q) && !cr.equipmentCode.toLowerCase().includes(q))
        return false;
    }
    return true;
  }), [searchText, filterStatus, filterEquipment, filterPriority]);

  const handleAction = (action: 'start_review' | 'approve' | 'reject' | 'implement', _id: string) => {
    const labels: Record<string, string> = {
      start_review: 'Đã chuyển sang trạng thái đang đánh giá.',
      approve: 'Yêu cầu đã được phê duyệt.',
      reject: 'Yêu cầu đã bị từ chối.',
      implement: 'Yêu cầu đã được đánh dấu thực hiện.',
    };
    messageApi.success(labels[action]);
    setDetailOpen(false);
  };

  const crColumns: ColumnsType<ChangeRequest> = [
    {
      title: 'Mã yêu cầu', dataIndex: 'code', key: 'code', width: 130,
      render: (v: string) => <Text style={{ fontFamily: 'monospace', color: '#1B3A5C', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Tiêu đề / Thiết bị', key: 'info',
      render: (_: unknown, cr: ChangeRequest) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1B3A5C', marginBottom: 2 }}>{cr.title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {cr.equipmentName} <span style={{ fontFamily: 'monospace' }}>({cr.equipmentCode})</span>
          </Text>
        </div>
      ),
    },
    {
      title: 'Mức ưu tiên', dataIndex: 'priority', key: 'priority', width: 110,
      render: (v: ChangeRequestPriority) => <Tag color={PRIORITY_CONFIG[v].color}>{PRIORITY_CONFIG[v].label}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (v: ChangeRequestStatus) => (
        <Tag color={CR_STATUS_CONFIG[v].color}>
          {v === 'implemented' && <CheckCircleOutlined style={{ marginRight: 4 }} />}
          {CR_STATUS_CONFIG[v].label}
        </Tag>
      ),
    },
    {
      title: 'Nguồn', dataIndex: 'source', key: 'source', width: 90,
      render: (v: ChangeRequestSource) => <Text type="secondary" style={{ fontSize: 12 }}>{SOURCE_LABELS[v]}</Text>,
    },
    {
      title: 'Ngày gửi', dataIndex: 'requestedAt', key: 'requestedAt', width: 100,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{formatDate(v)}</Text>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 80, align: 'center' as const,
      render: (_: unknown, cr: ChangeRequest) => (
        <Button size="small" icon={<EyeOutlined />} onClick={e => { e.stopPropagation(); setSelectedCR(cr); setDetailOpen(true); }} />
      ),
    },
  ];

  const pendingCRs = getPendingChangeRequests();

  return (
    <div style={{ padding: '0 0 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16, padding: '0 20px' }}>
        <Input.Search
          placeholder="Tìm mã, tiêu đề, thiết bị..."
          style={{ width: 240 }} value={searchText}
          onChange={e => setSearchText(e.target.value)} allowClear
        />
        <Select style={{ width: 140 }} value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'draft', label: 'Nháp' }, { value: 'submitted', label: 'Chờ xem xét' },
            { value: 'under_review', label: 'Đang đánh giá' }, { value: 'approved', label: 'Đã phê duyệt' },
            { value: 'rejected', label: 'Từ chối' }, { value: 'implemented', label: 'Đã thực hiện' },
          ]}
        />
        <Select style={{ width: 160 }} value={filterEquipment} onChange={setFilterEquipment}
          showSearch optionFilterProp="label"
          options={[{ value: 'all', label: 'Tất cả thiết bị' }, ...equipmentList.map(eq => ({ value: eq.id, label: eq.name }))]}
        />
        <Select style={{ width: 140 }} value={filterPriority} onChange={setFilterPriority}
          options={[
            { value: 'all', label: 'Tất cả ưu tiên' }, { value: 'critical', label: 'Khẩn cấp' },
            { value: 'high', label: 'Cao' }, { value: 'medium', label: 'Trung bình' }, { value: 'low', label: 'Thấp' },
          ]}
        />
        <Text type="secondary" style={{ flex: 1, fontSize: 13 }}>{filteredList.length} yêu cầu</Text>
        {isVongDoi && (
          <Button type="primary" icon={<PlusOutlined />}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
            onClick={() => setCreateOpen(true)}>
            Tạo yêu cầu
          </Button>
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
        <Table columns={crColumns} dataSource={filteredList} rowKey="id" size="small"
          pagination={{ pageSize: 10, size: 'small', showSizeChanger: false }}
          onRow={cr => ({ onClick: () => { setSelectedCR(cr); setDetailOpen(true); }, style: { cursor: 'pointer' } })}
          scroll={{ x: 900 }}
        />
      </div>

      {pendingCRs.length > 0 && (
        <div style={{ padding: '0 20px', marginTop: 8 }}>
          <Alert type="warning" showIcon
            message={<span>Có <strong>{pendingCRs.length} yêu cầu</strong> đang chờ xem xét hoặc đánh giá.</span>}
            style={{ borderRadius: 10 }}
          />
        </div>
      )}

      <CRDetailDrawer
        record={selectedCR} open={detailOpen} onClose={() => setDetailOpen(false)}
        isVongDoi={isVongDoi} onAction={handleAction}
      />
      <CreateCRDrawer
        open={createOpen} onClose={() => setCreateOpen(false)}
        onSuccess={() => messageApi.success('Yêu cầu thay đổi cấu hình đã được tạo thành công.')}
      />
    </div>
  );
};



// ─── Ban hành & Tích hợp Tab ──────────────────────────────────────────────────

const PublishTab: React.FC<{ messageApi: ReturnType<typeof message.useMessage>[0] }> = ({ messageApi }) => {
  const [filterEq, setFilterEq] = useState('');

  const approvedConfigs = configurationRecords.filter(c =>
    c.status === 'approved' && (!filterEq || c.equipmentId === filterEq)
  );

  const byEquipment = useMemo(() => {
    const map: Record<string, ConfigurationRecord[]> = {};
    approvedConfigs.forEach(c => {
      if (!map[c.equipmentId]) map[c.equipmentId] = [];
      map[c.equipmentId].push(c);
    });
    return Object.entries(map);
  }, [approvedConfigs]);

  const handlePublish = (cfg: ConfigurationRecord, system: string) => {
    messageApi.success(`Đã công bố "${cfg.version}" đến phân hệ "${SUBSYSTEMS.find(s => s.system === system)?.systemName}"`);
  };

  const handlePublishAll = (cfg: ConfigurationRecord) => {
    messageApi.success(`Đã công bố "${cfg.version}" đến tất cả phân hệ liên quan`);
  };

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,#064e3b,#059669)', borderRadius: 10, marginBottom: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Công bố &amp; Tích hợp cấu hình</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            Các cấu hình đã phê duyệt sẵn sàng công bố đến các phân hệ liên quan trong hệ thống Doanh nghiệp A
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{configurationRecords.filter(c => c.status === 'approved').length}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Đã phê duyệt</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{configurationRecords.filter(c => c.publishedTo && c.publishedTo.length > 0).length}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Đã công bố</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Select placeholder="Lọc theo thiết bị" value={filterEq || undefined} onChange={v => setFilterEq(v || '')}
          style={{ width: 260 }} allowClear showSearch optionFilterProp="children" size="small">
          {equipmentList.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
        </Select>
      </div>

      {byEquipment.length === 0 && <Empty description="Không có cấu hình đã phê duyệt" />}

      {byEquipment.map(([eqId, cfgs]) => {
        const eq = equipmentList.find(e => e.id === eqId);
        if (!eq) return null;
        return (
          <Card key={eqId} style={{ borderRadius: 10, marginBottom: 14 }} styles={{ body: { padding: 0 } }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PartitionOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1B3A5C' }}>{eq.name}</div>
                  <Text code style={{ fontSize: 11 }}>{eq.code}</Text>
                </div>
                <Tag color={equipmentTypeConfig[eq.type]?.color} style={{ marginLeft: 4, fontSize: 10 }}>{equipmentTypeConfig[eq.type]?.label}</Tag>
              </div>
            }
          >
            {cfgs.map((cfg, idx) => (
              <div key={cfg.id} style={{ padding: '14px 20px', borderBottom: idx < cfgs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Space size={8}>
                      <Text code style={{ fontSize: 12, fontWeight: 700, color: '#1B3A5C' }}>{cfg.version}</Text>
                      <Tag color={configChangeTypeConfig[cfg.changeType]?.color} style={{ fontSize: 10 }}>{configChangeTypeConfig[cfg.changeType]?.label}</Tag>
                      <Text style={{ fontSize: 11, color: '#6b7280' }}>{formatDate(cfg.changeDate)} · {cfg.changedBy}</Text>
                    </Space>
                    <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4, maxWidth: 420 }}>{cfg.description}</div>
                  </div>
                  <Button size="small" type="primary" icon={<GlobalOutlined />}
                    style={{ background: '#1B3A5C', borderColor: '#1B3A5C', flexShrink: 0 }}
                    onClick={() => handlePublishAll(cfg)}>Công bố tất cả</Button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SUBSYSTEMS.map(sub => {
                    const published = cfg.publishedTo?.find(p => p.system === sub.system);
                    return (
                      <div key={sub.system} style={{
                        flex: '1 1 140px', padding: '8px 12px', borderRadius: 7,
                        border: published ? '1px solid #bbf7d0' : '1px solid #e8e8e8',
                        background: published ? '#f0fdf4' : '#fafafa',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                      }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 500, color: published ? '#15803d' : '#6b7280' }}>
                            {published ? '✓' : '○'} {sub.systemName}
                          </div>
                          {published && <div style={{ fontSize: 10, color: '#9ca3af' }}>{formatDate(published.publishedDate)}</div>}
                        </div>
                        {!published && (
                          <Tooltip title={`Công bố đến ${sub.systemName}`}>
                            <Button type="text" size="small" icon={<ShareAltOutlined />}
                              style={{ color: '#1B3A5C', padding: '0 4px' }}
                              onClick={() => handlePublish(cfg, sub.system)} />
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        );
      })}

      {/* Also show the ALL_SUBSYSTEMS_CR cross-reference */}
      {ALL_SUBSYSTEMS_CR.length > 0 && byEquipment.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
          Tích hợp đến {ALL_SUBSYSTEMS_CR.length} phân hệ: {ALL_SUBSYSTEMS_CR.map(s => s.label).join(', ')}
        </div>
      )}
    </div>
  );
};

// ─── Changes (Ghi nhận chi tiết) Tab — kept from original ChangesTab ─────────
// This remains in the page as part of ApprovalTab which covers it.
// The ChangesTab is the legacy detailed record management from the old page.

const ChangesTab: React.FC<{ messageApi: ReturnType<typeof message.useMessage>[0] }> = ({ messageApi }) => {
  const { isVongDoi, isDirector } = useUser();
  const [filterType, setFilterType] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ConfigurationRecord | null>(null);
  const [addEquipId, setAddEquipId] = useState('');
  const [addDrawerTab, setAddDrawerTab] = useState('info');
  const [componentChanges, setComponentChanges] = useState<Record<string, {
    enabled: boolean; oldValue: string; newValue: string; unit: string;
  }>>({});
  const [manualComponents, setManualComponents] = useState<Array<{
    id: string; name: string; oldValue: string; newValue: string; unit: string;
  }>>([]);
  const [form] = Form.useForm();

  const filtered = useMemo(() => configurationRecords.filter(c => {
    if (filterType && c.changeType !== filterType) return false;
    if (filterEquipment && c.equipmentId !== filterEquipment) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    return true;
  }), [filterType, filterEquipment, filterStatus]);

  const pendingCount = configurationRecords.filter(c => c.status === 'pending_approval').length;

  const handleAddClose = () => {
    setAddDrawerOpen(false);
    form.resetFields();
    setAddEquipId('');
    setAddDrawerTab('info');
    setComponentChanges({});
    setManualComponents([]);
  };

  const addManualComponent = () =>
    setManualComponents(prev => [...prev, { id: `manual-${Date.now()}`, name: '', oldValue: '', newValue: '', unit: '' }]);
  const removeManualComponent = (id: string) =>
    setManualComponents(prev => prev.filter(c => c.id !== id));
  const updateManualComponent = (id: string, field: 'name' | 'oldValue' | 'newValue' | 'unit', val: string) =>
    setManualComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));

  const handleEquipChange = (eqId: string) => {
    setAddEquipId(eqId);
    form.setFieldValue('version', eqId ? generateNextVersion(eqId) : '');
    if (eqId) {
      const comps = equipmentComponents.filter(c => c.equipmentId === eqId);
      const init: typeof componentChanges = {};
      comps.forEach(c => { init[c.id] = { enabled: false, oldValue: c.code, newValue: '', unit: c.unit }; });
      setComponentChanges(init);
    } else {
      setComponentChanges({});
    }
  };

  const toggleComponent = (compId: string, enable: boolean) =>
    setComponentChanges(prev => ({ ...prev, [compId]: { ...prev[compId], enabled: enable } }));
  const updateCompField = (compId: string, field: 'oldValue' | 'newValue' | 'unit', val: string) =>
    setComponentChanges(prev => ({ ...prev, [compId]: { ...prev[compId], [field]: val } }));
  const enabledCount = Object.values(componentChanges).filter(c => c.enabled).length;

  const getWorkflowStep = (status: ConfigurationRecord['status']) => {
    if (status === 'draft') return 0;
    if (status === 'pending_approval') return 1;
    if (status === 'approved') return 2;
    if (status === 'rejected') return 1;
    return 3;
  };

  const handleApprove = (record: ConfigurationRecord) => { messageApi.success(`Đã phê duyệt: ${record.equipmentName} — ${record.version}`); setViewDrawerOpen(false); };
  const handleReject  = (record: ConfigurationRecord) => { messageApi.error(`Đã từ chối: ${record.equipmentName} — ${record.version}`); setViewDrawerOpen(false); };
  const handleSubmit  = (record: ConfigurationRecord) => { messageApi.success(`Đã gửi phê duyệt: ${record.version}`); setViewDrawerOpen(false); };

  const columns: ColumnsType<ConfigurationRecord> = [
    {
      title: 'Trang thiết bị', key: 'equipment',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C' }}>{r.equipmentName}</div>
          <Text code style={{ fontSize: 11 }}>{r.equipmentCode}</Text>
        </div>
      ),
    },
    {
      title: 'Loại thay đổi', dataIndex: 'changeType', key: 'changeType', width: 180,
      render: (type: ConfigChangeType) => (
        <Tag color={configChangeTypeConfig[type]?.color} style={{ fontSize: 11 }}>{configChangeTypeConfig[type]?.label}</Tag>
      ),
    },
    {
      title: 'Phiên bản', dataIndex: 'version', key: 'version', width: 150,
      render: v => <Text code style={{ fontSize: 11 }}>{v}</Text>,
    },
    {
      title: 'Ngày', dataIndex: 'changeDate', key: 'changeDate', width: 110,
      render: d => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Người thực hiện', dataIndex: 'changedBy', key: 'changedBy', width: 150,
      render: name => <Text style={{ fontSize: 12 }}>{name}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: status => (
        <Tag color={cfgStatusConfig[status as keyof typeof cfgStatusConfig]?.color} style={{ fontSize: 11 }}>
          {cfgStatusConfig[status as keyof typeof cfgStatusConfig]?.label}
        </Tag>
      ),
    },
    {
      title: '', key: 'action', width: 48,
      render: (_, record) => (
        <Dropdown trigger={['click']} placement="bottomRight" menu={{
          items: [
            { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
            ...(isVongDoi && record.status === 'draft'
              ? [{ key: 'submit', icon: <SendOutlined />, label: 'Gửi phê duyệt', style: { color: '#1B3A5C' } }] : []),
            ...((isVongDoi || isDirector) && record.status === 'pending_approval'
              ? [
                  { key: 'approve', icon: <CheckOutlined />, label: 'Phê duyệt', style: { color: '#52c41a' } },
                  { key: 'reject',  icon: <DeleteOutlined />, label: 'Từ chối', style: { color: '#ff4d4f' } },
                ] : []),
          ],
          onClick: ({ key }) => {
            if (key === 'view')    { setSelectedRecord(record); setViewDrawerOpen(true); }
            if (key === 'submit')  handleSubmit(record);
            if (key === 'approve') handleApprove(record);
            if (key === 'reject')  handleReject(record);
          },
        }}>
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* KPI */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { title: 'Tổng hồ sơ', value: configurationRecords.length, unit: 'bản ghi', gradient: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)', icon: <DatabaseOutlined /> },
          { title: 'Đã phê duyệt', value: configurationRecords.filter(c => c.status === 'approved').length, unit: 'bản ghi', gradient: 'linear-gradient(135deg,#166534,#16a34a)', icon: <CheckCircleOutlined /> },
          { title: 'Chờ phê duyệt', value: pendingCount, unit: 'bản ghi', gradient: 'linear-gradient(135deg,#b45309,#d97706)', icon: <ClockCircleOutlined /> },
          { title: 'Thiết bị cấu hình', value: new Set(configurationRecords.map(c => c.equipmentId)).size, unit: 'thiết bị', gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)', icon: <ToolOutlined /> },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }} styles={{ body: { padding: '14px 18px' } }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 52, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>{card.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginLeft: 5 }}>{card.unit}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 14, borderRadius: 10 }} styles={{ body: { padding: '10px 16px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Space wrap>
            <Select placeholder={<><FilterOutlined /> Loại thay đổi</>} value={filterType || undefined} onChange={v => setFilterType(v || '')} style={{ width: 180 }} allowClear size="small">
              {Object.entries(configChangeTypeConfig).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
            </Select>
            <Select placeholder="Trang thiết bị" value={filterEquipment || undefined} onChange={v => setFilterEquipment(v || '')} style={{ width: 200 }} allowClear showSearch optionFilterProp="children" size="small">
              {equipmentList.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
            </Select>
            <Select placeholder="Trạng thái" value={filterStatus || undefined} onChange={v => setFilterStatus(v || '')} style={{ width: 150 }} allowClear size="small">
              {Object.entries(cfgStatusConfig).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
            </Select>
            {pendingCount > 0 && (
              <Badge count={pendingCount} offset={[4, 0]}>
                <Button type={filterStatus === 'pending_approval' ? 'primary' : 'default'} size="small"
                  icon={<CheckOutlined />}
                  onClick={() => setFilterStatus(filterStatus === 'pending_approval' ? '' : 'pending_approval')}>
                  Chờ duyệt
                </Button>
              </Badge>
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>Hiển thị {filtered.length}/{configurationRecords.length}</Text>
          </Space>
          {isVongDoi && (
            <Button type="primary" size="small" icon={<PlusOutlined />}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', flexShrink: 0 }}
              onClick={() => { form.resetFields(); setAddDrawerOpen(true); }}>
              Ghi nhận thay đổi
            </Button>
          )}
        </div>
      </Card>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `Tổng ${t} bản ghi` }}
          scroll={{ x: 900 }} />
      </Card>

      {/* View Drawer */}
      <Drawer
        title={selectedRecord ? (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1B3A5C' }}>{selectedRecord.equipmentName}</div>
            <Space style={{ marginTop: 4 }}>
              <Tag color={configChangeTypeConfig[selectedRecord.changeType]?.color} style={{ fontSize: 11 }}>
                {configChangeTypeConfig[selectedRecord.changeType]?.label}
              </Tag>
              <Text code style={{ fontSize: 11 }}>{selectedRecord.version}</Text>
            </Space>
          </div>
        ) : 'Chi tiết cấu hình'}
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        width={620}
        footer={
          <Space>
            {isVongDoi && selectedRecord?.status === 'draft' && (
              <Button icon={<SendOutlined />} onClick={() => handleSubmit(selectedRecord!)}>Gửi phê duyệt</Button>
            )}
            {(isVongDoi || isDirector) && selectedRecord?.status === 'pending_approval' && (
              <>
                <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(selectedRecord!)}>Phê duyệt</Button>
                <Button danger icon={<DeleteOutlined />} onClick={() => handleReject(selectedRecord!)}>Từ chối</Button>
              </>
            )}
            <Button onClick={() => setViewDrawerOpen(false)}>Đóng</Button>
          </Space>
        }
      >
        {selectedRecord && (
          <div>
            <Steps size="small" current={getWorkflowStep(selectedRecord.status)}
              status={selectedRecord.status === 'rejected' ? 'error' : 'process'}
              style={{ marginBottom: 20 }}
              items={[
                { title: 'Tạo hồ sơ', description: selectedRecord.changeDate ? formatDate(selectedRecord.changeDate) : '' },
                { title: 'Gửi phê duyệt' },
                { title: 'Phê duyệt', description: selectedRecord.approvedBy || '' },
                { title: 'Công bố' },
              ]}
            />
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã thiết bị" span={2}><Text code>{selectedRecord.equipmentCode}</Text></Descriptions.Item>
              <Descriptions.Item label="Loại thay đổi">
                <Tag color={configChangeTypeConfig[selectedRecord.changeType]?.color}>{configChangeTypeConfig[selectedRecord.changeType]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phiên bản"><Text code>{selectedRecord.version}</Text></Descriptions.Item>
              <Descriptions.Item label="Ngày thực hiện">{formatDate(selectedRecord.changeDate)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={cfgStatusConfig[selectedRecord.status as keyof typeof cfgStatusConfig]?.color}>
                  {cfgStatusConfig[selectedRecord.status as keyof typeof cfgStatusConfig]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">{selectedRecord.changedBy}</Descriptions.Item>
              <Descriptions.Item label="Người phê duyệt">{selectedRecord.approvedBy || '—'}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginBottom: 14 }}>
              <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Mô tả thay đổi</Text>
              <div style={{ marginTop: 6, padding: '10px 12px', background: '#eff6ff', borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
                {selectedRecord.description}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Text strong style={{ color: '#1B3A5C', fontSize: 13 }}>Chi tiết thành phần thay đổi</Text>
              <div style={{ marginTop: 8 }}>
                {selectedRecord.components.map((comp, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #e8e8e8', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1B3A5C', marginBottom: 6 }}>{comp.name}</div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Cũ</Text><span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 13 }}>{comp.oldValue || '—'}</span></div>
                      <div style={{ color: '#999', fontSize: 18 }}>→</div>
                      <div><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Mới</Text><span style={{ color: '#52c41a', fontWeight: 600, fontSize: 13 }}>{comp.newValue}</span></div>
                      {comp.unit && <div><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Đơn vị</Text><span style={{ fontSize: 12, color: '#666' }}>{comp.unit}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedRecord.notes && (
              <div style={{ padding: '10px 12px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f', fontSize: 12 }}>
                <strong>Ghi chú:</strong> {selectedRecord.notes}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Add Drawer */}
      <Drawer
        title={<Space><PlusOutlined style={{ color: '#D4A843' }} /><span style={{ fontWeight: 700, color: '#fff' }}>Ghi nhận thay đổi cấu hình</span></Space>}
        closeIcon={<CloseOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
        styles={{ header: { background: '#1B3A5C', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px' }, body: { padding: '0 20px 20px' } }}
        open={addDrawerOpen}
        onClose={handleAddClose}
        width={660}
        footer={
          <Space>
            <Button type="primary" style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }} icon={<FileTextOutlined />}
              onClick={() => form.validateFields().then(() => { messageApi.success('Đã lưu nháp hồ sơ thay đổi cấu hình'); handleAddClose(); })}>
              Lưu nháp
            </Button>
            <Button icon={<SendOutlined />}
              onClick={() => form.validateFields().then(() => { messageApi.success('Đã gửi phê duyệt hồ sơ thay đổi cấu hình'); handleAddClose(); })}>
              Gửi phê duyệt
            </Button>
            <Button onClick={handleAddClose}>Hủy</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Tabs activeKey={addDrawerTab} onChange={setAddDrawerTab} size="small" style={{ marginBottom: 0 }} items={[
            {
              key: 'info',
              label: <Space size={5}><FileTextOutlined />Thông tin chung</Space>,
              children: (
                <div style={{ paddingTop: 4 }}>
                  <Form.Item name="equipmentId" label="Trang thiết bị" rules={[{ required: true, message: 'Chọn thiết bị' }]}>
                    <Select placeholder="Chọn trang thiết bị" showSearch optionFilterProp="children" onChange={handleEquipChange}>
                      {equipmentList.map(e => <Option key={e.id} value={e.id}>{e.name} — {e.code}</Option>)}
                    </Select>
                  </Form.Item>
                  <Row gutter={14}>
                    <Col span={12}>
                      <Form.Item name="changeType" label="Loại thay đổi" rules={[{ required: true }]}>
                        <Select placeholder="Loại thay đổi">
                          {Object.entries(configChangeTypeConfig).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="version" label="Phiên bản">
                        <Input readOnly placeholder="Tự động điền sau khi chọn thiết bị"
                          style={{ background: '#eff6ff', color: '#1B3A5C', fontWeight: 600, cursor: 'default' }}
                          suffix={<span style={{ fontSize: 10, color: '#9ca3af' }}>Tự động</span>} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="changeDate" label="Ngày thay đổi" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" defaultValue={dayjs()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="changedBy" label="Người thực hiện" rules={[{ required: true }]}>
                        <Input placeholder="Tên kỹ thuật viên" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="description" label="Mô tả thay đổi" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} placeholder="Mô tả nội dung thay đổi cấu hình..." />
                  </Form.Item>
                  <Form.Item name="notes" label="Ghi chú">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'components',
              label: (
                <Space size={5}>
                  <ToolOutlined />Thành phần thay đổi
                  {enabledCount > 0 && <Badge count={enabledCount} style={{ fontSize: 10 }} />}
                </Space>
              ),
              children: (
                <div style={{ paddingTop: 4 }}>
                  {!addEquipId ? (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                      <PartitionOutlined style={{ fontSize: 32, color: '#d1d5db', marginBottom: 10 }} />
                      <div style={{ color: '#9ca3af', fontSize: 13 }}>Vui lòng chọn thiết bị ở tab <strong>Thông tin chung</strong> trước</div>
                      <Button type="link" size="small" onClick={() => setAddDrawerTab('info')} style={{ marginTop: 6 }}>Chọn thiết bị</Button>
                    </div>
                  ) : (() => {
                    const eqComps = equipmentComponents.filter(c => c.equipmentId === addEquipId);
                    const groups = [...new Set(eqComps.map(c => c.group))];
                    const condColor: Record<string, string> = { excellent: '#52c41a', good: '#73d13d', fair: '#faad14', poor: '#ff4d4f' };
                    const condLabel: Record<string, string> = { excellent: 'Rất tốt', good: 'Tốt', fair: 'Trung bình', poor: 'Kém' };
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 12px', background: '#eff6ff', borderRadius: 8 }}>
                          <Text style={{ fontSize: 12, color: '#1B3A5C' }}>
                            {eqComps.length} thành phần · <strong style={{ color: enabledCount > 0 ? '#1B3A5C' : '#9ca3af' }}>{enabledCount} đã đánh dấu thay đổi</strong>
                          </Text>
                          {enabledCount > 0 && (
                            <Button type="link" size="small" danger
                              onClick={() => setComponentChanges(prev => {
                                const reset = { ...prev };
                                Object.keys(reset).forEach(k => { reset[k] = { ...reset[k], enabled: false }; });
                                return reset;
                              })}>
                              Bỏ chọn tất cả
                            </Button>
                          )}
                        </div>
                        {groups.map(group => (
                          <div key={group} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#D4A843', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FolderOutlined /> {group}
                            </div>
                            {eqComps.filter(c => c.group === group).map(comp => {
                              const chg = componentChanges[comp.id];
                              const enabled = chg?.enabled ?? false;
                              return (
                                <div key={comp.id} style={{
                                  padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                                  border: enabled ? '1.5px solid #1B3A5C' : '1px solid #e8e8e8',
                                  background: enabled ? '#eff6ff' : '#fafafa', transition: 'all 0.2s',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                      <span style={{ fontWeight: 500, fontSize: 13, color: '#1B3A5C' }}>{comp.name}</span>
                                      <Text code style={{ fontSize: 10, marginLeft: 8 }}>{comp.code}</Text>
                                      <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>{comp.quantity} {comp.unit}</span>
                                    </div>
                                    <Space size={6}>
                                      <Tag color={condColor[comp.condition]} style={{ margin: 0, fontSize: 10 }}>{condLabel[comp.condition]}</Tag>
                                      {enabled ? (
                                        <Button size="small" danger type="text" style={{ fontSize: 11, height: 24, padding: '0 8px' }}
                                          onClick={() => toggleComponent(comp.id, false)}>Bỏ chọn</Button>
                                      ) : (
                                        <Button size="small" type="primary" ghost style={{ fontSize: 11, height: 24, padding: '0 8px', borderColor: '#1B3A5C', color: '#1B3A5C' }}
                                          onClick={() => toggleComponent(comp.id, true)}>Thay đổi</Button>
                                      )}
                                    </Space>
                                  </div>
                                  {enabled && (
                                    <Row gutter={8} style={{ marginTop: 10 }}>
                                      <Col span={10}>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Giá trị cũ</div>
                                        <Input size="small" value={chg.oldValue} onChange={e => updateCompField(comp.id, 'oldValue', e.target.value)} placeholder="Giá trị trước khi thay đổi" />
                                      </Col>
                                      <Col span={10}>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Giá trị mới <span style={{ color: '#ff4d4f' }}>*</span></div>
                                        <Input size="small" value={chg.newValue} onChange={e => updateCompField(comp.id, 'newValue', e.target.value)} placeholder="Giá trị sau khi thay đổi" status={!chg.newValue ? 'error' : undefined} />
                                      </Col>
                                      <Col span={4}>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Đơn vị</div>
                                        <Input size="small" value={chg.unit} onChange={e => updateCompField(comp.id, 'unit', e.target.value)} />
                                      </Col>
                                    </Row>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        {manualComponents.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <PlusOutlined /> Thành phần bổ sung
                            </div>
                            {manualComponents.map(mc => (
                              <div key={mc.id} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 6, border: '1.5px dashed #D4A843', background: '#fffdf0', position: 'relative' }}>
                                <Button type="text" danger size="small" icon={<DeleteOutlined />}
                                  style={{ position: 'absolute', top: 6, right: 6, height: 22, padding: '0 6px' }}
                                  onClick={() => removeManualComponent(mc.id)} />
                                <Row gutter={8}>
                                  <Col span={24}>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Tên thành phần <span style={{ color: '#ff4d4f' }}>*</span></div>
                                    <Input size="small" value={mc.name} onChange={e => updateManualComponent(mc.id, 'name', e.target.value)} placeholder="VD: Module thu phát RF mới" style={{ marginBottom: 8 }} status={!mc.name ? 'error' : undefined} />
                                  </Col>
                                  <Col span={10}>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Giá trị cũ</div>
                                    <Input size="small" value={mc.oldValue} onChange={e => updateManualComponent(mc.id, 'oldValue', e.target.value)} placeholder="Giá trị trước" />
                                  </Col>
                                  <Col span={10}>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Giá trị mới <span style={{ color: '#ff4d4f' }}>*</span></div>
                                    <Input size="small" value={mc.newValue} onChange={e => updateManualComponent(mc.id, 'newValue', e.target.value)} placeholder="Giá trị mới" status={!mc.newValue ? 'error' : undefined} />
                                  </Col>
                                  <Col span={4}>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Đơn vị</div>
                                    <Input size="small" value={mc.unit} onChange={e => updateManualComponent(mc.id, 'unit', e.target.value)} />
                                  </Col>
                                </Row>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button type="dashed" icon={<PlusOutlined />} size="small" onClick={addManualComponent}
                          style={{ width: '100%', borderColor: '#D4A843', color: '#D4A843' }}>
                          Thêm thành phần khác
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              ),
            },
          ]} />
        </Form>
      </Drawer>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ConfigurationPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState('structure');

  // KPI counts
  const totalDesignVersions = designVersions.length;
  const pendingChangeRequests = allChangeRequests.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
  const pendingApproval = configurationRecords.filter(c => c.status === 'pending_approval').length;
  const publishedVersions = designVersions.filter(v => v.status === 'published').length;

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
        <Row align="middle" gutter={24}>
          <Col flex="1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ApartmentOutlined style={{ fontSize: 22, color: '#D4A843' }} />
              </div>
              <div>
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Quản lý cấu hình thiết kế</Title>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                  Quản lý cấu trúc kỹ thuật, theo dõi thay đổi và công bố cấu hình thiết kế trang thiết bị
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Steps
              current={-1}
              size="small"
              items={[
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Cấu trúc</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Yêu cầu</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Phê duyệt</span> },
                { title: <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Ban hành</span> },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* KPI cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Tổng phiên bản thiết kế" value={totalDesignVersions} icon={<ApartmentOutlined />} gradient={['#1B3A5C', '#2d5a8e']} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Yêu cầu thay đổi đang xử lý" value={pendingChangeRequests} icon={<ClockCircleOutlined />} gradient={['#92400e', '#d97706']} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Chờ phê duyệt" value={pendingApproval} icon={<CheckCircleOutlined />} gradient={['#1e40af', '#3b82f6']} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Đã công bố" value={publishedVersions} icon={<RocketOutlined />} gradient={['#15803d', '#16a34a']} />
        </Col>
      </Row>

      {/* Main tabs card */}
      <Card styles={{ body: { padding: '0 0 0' } }} style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 20px' }}
          items={[
            {
              key: 'structure',
              label: (
                <span><PartitionOutlined style={{ marginRight: 6 }} />Cấu trúc kỹ thuật</span>
              ),
              children: (
                <div style={{ padding: '4px 0 20px' }}>
                  <BOMTab />
                </div>
              ),
            },
            {
              key: 'change-requests',
              label: (
                <span>
                  <FileTextOutlined style={{ marginRight: 6 }} />
                  Yêu cầu thay đổi
                  {pendingChangeRequests > 0 && <Badge count={pendingChangeRequests} size="small" style={{ marginLeft: 6 }} />}
                </span>
              ),
              children: <ChangeRequestTab messageApi={messageApi} />,
            },
            {
              key: 'approval',
              label: (
                <span>
                  <EditOutlined style={{ marginRight: 6 }} />
                  Ghi nhận &amp; Phê duyệt
                  {pendingApproval > 0 && <Badge count={pendingApproval} size="small" style={{ marginLeft: 6 }} />}
                </span>
              ),
              children: <ChangesTab messageApi={messageApi} />,
            },
            {
              key: 'publish',
              label: (
                <span><GlobalOutlined style={{ marginRight: 6 }} />Ban hành &amp; Tích hợp</span>
              ),
              children: <PublishTab messageApi={messageApi} />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ConfigurationPage;
