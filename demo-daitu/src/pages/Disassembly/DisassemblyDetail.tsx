import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Tag, Button, Space, Tabs, Table, Descriptions, Alert, Timeline, Badge } from 'antd';
import {
  ArrowLeftOutlined, ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, TagsOutlined, AppstoreOutlined, AuditOutlined, SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { disassemblies } from '../../data/disassemblies';
import { components } from '../../data/components';
import { overhaulOrders } from '../../data/overhaulOrders';
import { disassemblyStatusConfig, componentStatusConfig, formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { Component } from '../../types';

const { Title, Text } = Typography;

const STEP_COLORS = ['#1B3A5C', '#2e7d32', '#e65100', '#6a1b9a', '#0277bd', '#c62828'];

const StepBadge: React.FC<{ step: number; active?: boolean }> = ({ step, active }) => {
  const baseColor = STEP_COLORS[step - 1] ?? '#888';
  const bg = active ? baseColor : `${baseColor}22`;
  const textColor = active ? '#fff' : baseColor;
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: bg,
      border: `1.5px solid ${baseColor}`, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: textColor, flexShrink: 0,
    }}>
      {step}
    </div>
  );
};

const tabLabel = (step: number, label: string) => (
  <Space size={6}>
    <StepBadge step={step} />
    <span>{label}</span>
  </Space>
);

const categoryMap: Record<string, string> = {
  module: 'Mô-đun', part: 'Linh kiện', consumable: 'Vật tư', assembly: 'Cụm lắp ráp',
};

const DisassemblyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');

  const record = disassemblies.find(d => d.id === id);
  const order = overhaulOrders.find(o => record && o.id === record.orderId);
  const comps = components.filter(c => c.disassemblyId === id);

  if (!record) return <div style={{ padding: 24 }}>Không tìm thấy hồ sơ tháo rã.</div>;

  const statusCfg = disassemblyStatusConfig[record.status];

  const statusCount = comps.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const needAction = (statusCount['repairable'] || 0) + (statusCount['beyond_repair'] || 0) + (statusCount['upgrade_required'] || 0);
  const serviceable = statusCount['serviceable'] || 0;
  const readyForAssembly = (statusCount['restored'] || 0) + (statusCount['replaced'] || 0) + (statusCount['upgraded'] || 0) + (statusCount['ready_for_assembly'] || 0);

  // ─── Tab 1: Chuẩn bị ────────────────────────────────────────
  const renderChuanBi = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[0]}` }}>
        <Text strong style={{ color: STEP_COLORS[0], fontSize: 13 }}>Nhận lệnh đại tu</Text>
        <Descriptions column={2} size="small" style={{ marginTop: 10 }} labelStyle={{ color: '#888', fontWeight: 500 }}>
          <Descriptions.Item label="Ngày nhận lệnh">
            {record.receivedOrderDate ? <Text strong>{formatDate(record.receivedOrderDate)}</Text> : <Text type="secondary">—</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Lệnh đại tu">
            <Text strong style={{ color: colors.navy }}>{order?.code || record.orderId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thiết bị" span={2}>
            <Text strong>{record.equipmentName}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phân xưởng phụ trách" span={2}>
            <Text>{record.performedBy}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {record.technicalDocuments && record.technicalDocuments.length > 0 && (
        <Card size="small" style={{ borderRadius: 10 }}
          title={<Space><FileTextOutlined style={{ color: STEP_COLORS[0] }} /><Text strong style={{ fontSize: 13 }}>Tài liệu kỹ thuật chuẩn bị</Text></Space>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {record.technicalDocuments.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 3, flexShrink: 0 }} />
                <Text style={{ fontSize: 13 }}>{doc}</Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {record.toolsRequired && record.toolsRequired.length > 0 && (
        <Card size="small" style={{ borderRadius: 10 }}
          title={<Space><ToolOutlined style={{ color: STEP_COLORS[0] }} /><Text strong style={{ fontSize: 13 }}>Dụng cụ chuyên dụng yêu cầu</Text></Space>}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {record.toolsRequired.map((tool, i) => (
              <Tag key={i} style={{ borderRadius: 6, fontSize: 12, padding: '3px 10px' }}>{tool}</Tag>
            ))}
          </div>
        </Card>
      )}

      {record.workAreaNotes && (
        <Card size="small" style={{ borderRadius: 10, background: '#f0f7ff', border: '1px solid #bae0ff' }}>
          <Text strong style={{ fontSize: 13, color: STEP_COLORS[4] }}>Yêu cầu khu vực thi công</Text>
          <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7 }}>
            {record.workAreaNotes}
          </div>
        </Card>
      )}

      {!record.receivedOrderDate && !record.technicalDocuments && (
        <Alert type="info" message="Hồ sơ chưa có thông tin giai đoạn chuẩn bị." showIcon />
      )}
    </div>
  );

  // ─── Tab 2: Tháo rã ─────────────────────────────────────────
  const renderThaora = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {record.disassemblySequence && (
        <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[1]}` }}
          title={<Text strong style={{ color: STEP_COLORS[1], fontSize: 13 }}>Trình tự tháo rã</Text>}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8, color: '#333' }}>
            {record.disassemblySequence}
          </div>
        </Card>
      )}

      {record.disassemblyMethodNote && (
        <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Text strong style={{ fontSize: 13, color: STEP_COLORS[1] }}>Ghi chú phương pháp tháo rã</Text>
          <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7 }}>
            {record.disassemblyMethodNote}
          </div>
        </Card>
      )}

      <Card size="small" style={{ borderRadius: 10 }}
        title={<Space><AppstoreOutlined style={{ color: STEP_COLORS[1] }} /><Text strong style={{ fontSize: 13 }}>Danh sách cấu phần đã tháo ({comps.length}/{record.totalComponents})</Text></Space>}
      >
        <Table
          dataSource={comps}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
          columns={[
            { title: 'Mã', dataIndex: 'code', key: 'code', width: 130, render: (v: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{v}</Text> },
            { title: 'Tên cấu phần', dataIndex: 'name', key: 'name', width: 220, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
            { title: 'Nhóm hệ thống', dataIndex: 'systemGroup', key: 'systemGroup', width: 160 },
            { title: 'Vị trí lắp', dataIndex: 'position', key: 'position', width: 160, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
            { title: 'Chiều lắp', dataIndex: 'installDirection', key: 'installDirection', width: 200, render: (v?: string) => v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">—</Text> },
            { title: 'Số serial', dataIndex: 'serialNumber', key: 'serialNumber', width: 160, render: (v?: string) => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : <Text type="secondary">—</Text> },
          ]}
        />
      </Card>

      {!record.disassemblySequence && comps.length === 0 && (
        <Alert type="info" message="Chưa có dữ liệu tháo rã." showIcon />
      )}
    </div>
  );

  // ─── Tab 3: Đánh dấu ────────────────────────────────────────
  const renderDanhDau = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info"
        showIcon
        message="Giai đoạn đánh dấu nhận dạng"
        description="Mỗi cấu phần được gắn nhãn mã hóa, ghi rõ vị trí lắp đặt và chiều lắp để đảm bảo phục hồi chính xác sau đại tu."
        style={{ borderRadius: 10 }}
      />

      <Table
        dataSource={comps}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 900 }}
        columns={[
          {
            title: 'Mã cấu phần',
            dataIndex: 'code',
            key: 'code',
            width: 140,
            render: (v: string) => (
              <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Tag>
            ),
          },
          { title: 'Tên cấu phần', dataIndex: 'name', key: 'name', width: 220, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
          { title: 'Loại', dataIndex: 'category', key: 'category', width: 120, render: (v: string) => <Tag>{categoryMap[v] || v}</Tag> },
          { title: 'Nhóm hệ thống', dataIndex: 'systemGroup', key: 'systemGroup', width: 160 },
          {
            title: 'Vị trí lắp',
            dataIndex: 'position',
            key: 'position',
            width: 160,
            render: (v: string) => (
              <Space size={4}>
                <Badge color={STEP_COLORS[2]} />
                <Text style={{ fontSize: 12 }}>{v}</Text>
              </Space>
            ),
          },
          {
            title: 'Chiều lắp',
            dataIndex: 'installDirection',
            key: 'installDirection',
            width: 220,
            render: (v?: string) => v
              ? <Text style={{ fontSize: 12, color: STEP_COLORS[2] }}>{v}</Text>
              : <Text type="secondary" style={{ fontSize: 12 }}>Không yêu cầu</Text>,
          },
          {
            title: 'Số serial',
            dataIndex: 'serialNumber',
            key: 'serialNumber',
            width: 170,
            render: (v?: string) => v
              ? <Text code style={{ fontSize: 11 }}>{v}</Text>
              : <Text type="secondary" style={{ fontSize: 11 }}>—</Text>,
          },
        ]}
      />
    </div>
  );

  // ─── Tab 4: Phân loại ────────────────────────────────────────
  const categoryGroups = comps.reduce((acc, c) => {
    if (!acc[c.systemGroup]) acc[c.systemGroup] = [];
    acc[c.systemGroup].push(c);
    return acc;
  }, {} as Record<string, Component[]>);

  const renderPhanLoai = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={[12, 12]}>
        {[
          { label: 'Đạt - Giữ lại', count: serviceable, color: '#52c41a', bg: '#f6ffed' },
          { label: 'Cần xử lý', count: needAction, color: '#d97706', bg: '#fffbeb' },
          { label: 'Chờ kiểm tra', count: (statusCount['pending_inspection'] || 0) + (statusCount['disassembled'] || 0), color: '#1890ff', bg: '#e8f4ff' },
          { label: 'Đã xử lý xong', count: readyForAssembly, color: '#722ed1', bg: '#f9f0ff' },
        ].map((item, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card size="small" style={{ borderRadius: 10, background: item.bg, border: `1px solid ${item.color}44`, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.count}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{item.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {Object.entries(categoryGroups).map(([group, items]) => (
        <Card
          key={group}
          size="small"
          style={{ borderRadius: 10 }}
          title={
            <Space>
              <TagsOutlined style={{ color: STEP_COLORS[3] }} />
              <Text strong style={{ fontSize: 13 }}>{group}</Text>
              <Tag style={{ marginLeft: 4 }}>{items.length} chi tiết</Tag>
            </Space>
          }
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.map(item => {
              const cfg = componentStatusConfig[item.status as keyof typeof componentStatusConfig];
              return (
                <div key={item.id} style={{
                  border: `1px solid #bfdbfe`, borderRadius: 8, padding: '8px 12px',
                  background: '#eff6ff', minWidth: 200, flex: '1 1 200px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12, color: colors.navy }}>{item.name}</Text>
                    <Tag color={cfg?.color} style={{ fontSize: 11, margin: 0 }}>{cfg?.label}</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{item.code}</Text>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );

  // ─── Tab 5: Ghi nhận ─────────────────────────────────────────
  const renderGhiNhan = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small" style={{ borderRadius: 10 }}
        title={
          <Space>
            <AuditOutlined style={{ color: STEP_COLORS[4] }} />
            <Text strong style={{ fontSize: 13 }}>Bảng ghi nhận tình trạng cấu phần ({comps.length} chi tiết)</Text>
          </Space>
        }
      >
        <Table
          dataSource={comps}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 1050 }}
          rowClassName={(r: Component) => {
            if (r.status === 'beyond_repair') return 'ant-table-row-danger';
            return '';
          }}
          columns={[
            { title: 'Mã', dataIndex: 'code', key: 'code', width: 130, render: (v: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{v}</Text> },
            { title: 'Tên cấu phần', dataIndex: 'name', key: 'name', width: 200, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
            { title: 'Loại', dataIndex: 'category', key: 'category', width: 110, render: (v: string) => <Tag style={{ fontSize: 11 }}>{categoryMap[v] || v}</Tag> },
            { title: 'Nhóm hệ thống', dataIndex: 'systemGroup', key: 'systemGroup', width: 160, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
            {
              title: 'Tình trạng ghi nhận',
              dataIndex: 'condition',
              key: 'condition',
              width: 280,
              render: (v: string, r: Component) => {
                const isIssue = ['beyond_repair', 'repairable', 'upgrade_required'].includes(r.status);
                return (
                  <Space size={4}>
                    {isIssue && <ExclamationCircleOutlined style={{ color: '#faad14', flexShrink: 0 }} />}
                    <Text style={{ fontSize: 12, color: isIssue ? '#d97706' : '#333' }}>{v}</Text>
                  </Space>
                );
              },
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              width: 150,
              render: (s: string) => {
                const c = componentStatusConfig[s as keyof typeof componentStatusConfig];
                return <Tag color={c?.color}>{c?.label}</Tag>;
              },
            },
          ]}
        />
      </Card>

      <Descriptions title="Tổng kết tình trạng" column={3} size="small" bordered
        labelStyle={{ background: '#eff6ff', fontWeight: 500, width: '30%' }}
      >
        <Descriptions.Item label="Ngày bắt đầu tháo rã">{formatDate(record.startDate)}</Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">{record.endDate ? formatDate(record.endDate) : <Tag color="processing">Chưa hoàn thành</Tag>}</Descriptions.Item>
        <Descriptions.Item label="Tổng chi tiết"><Text strong style={{ color: colors.navy }}>{record.totalComponents} chi tiết</Text></Descriptions.Item>
        <Descriptions.Item label="Đội thực hiện" span={3}>{record.performedBy}</Descriptions.Item>
        {record.notes && <Descriptions.Item label="Ghi chú" span={3}><Text style={{ color: '#d97706' }}>{record.notes}</Text></Descriptions.Item>}
      </Descriptions>
    </div>
  );

  // ─── Tab 6: Chuẩn bị KT ──────────────────────────────────────
  const pendingInspection = comps.filter(c => ['disassembled', 'pending_inspection', 'repairable', 'beyond_repair', 'upgrade_required'].includes(c.status));

  const renderChuanBiKT = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {record.status === 'completed' ? (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Đã hoàn thành giai đoạn tháo rã"
          description={record.readyForInspectionDate
            ? `Bàn giao cấu phần cho nhóm kiểm tra kỹ thuật ngày ${formatDate(record.readyForInspectionDate)}.`
            : 'Toàn bộ cấu phần đã được chuẩn bị và bàn giao cho giai đoạn kiểm tra.'}
          style={{ borderRadius: 10 }}
        />
      ) : (
        <Alert
          type="warning"
          showIcon
          message="Chưa sẵn sàng bàn giao kiểm tra"
          description="Hồ sơ tháo rã chưa hoàn thành. Hoàn tất ghi nhận tất cả cấu phần trước khi bàn giao."
          style={{ borderRadius: 10 }}
        />
      )}

      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, textAlign: 'center', borderTop: `3px solid ${STEP_COLORS[5]}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: STEP_COLORS[5] }}>{pendingInspection.length}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Cần kiểm tra kỹ thuật</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, textAlign: 'center', borderTop: `3px solid #52c41a` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#52c41a' }}>{serviceable}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Đạt không cần KT thêm</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, textAlign: 'center', borderTop: `3px solid #ff4d4f` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ff4d4f' }}>{statusCount['beyond_repair'] || 0}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Thay mới</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, textAlign: 'center', borderTop: `3px solid #722ed1` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#722ed1' }}>{readyForAssembly}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Đã xử lý xong</div>
          </Card>
        </Col>
      </Row>

      {record.inspectionGroupingNotes && (
        <Card size="small" style={{ borderRadius: 10, borderLeft: `4px solid ${STEP_COLORS[5]}` }}
          title={<Space><SafetyCertificateOutlined style={{ color: STEP_COLORS[5] }} /><Text strong style={{ fontSize: 13 }}>Phân nhóm kiểm tra</Text></Space>}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8 }}>
            {record.inspectionGroupingNotes}
          </div>
        </Card>
      )}

      {pendingInspection.length > 0 && (
        <Card size="small" style={{ borderRadius: 10 }}
          title={<Space><TagsOutlined style={{ color: STEP_COLORS[5] }} /><Text strong style={{ fontSize: 13 }}>Cấu phần chuyển kiểm tra kỹ thuật</Text></Space>}
        >
          <Table
            dataSource={pendingInspection}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
            columns={[
              { title: 'Mã', dataIndex: 'code', key: 'code', width: 130, render: (v: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{v}</Text> },
              { title: 'Tên cấu phần', dataIndex: 'name', key: 'name', width: 220 },
              { title: 'Nhóm hệ thống', dataIndex: 'systemGroup', key: 'systemGroup', width: 160 },
              { title: 'Tình trạng', dataIndex: 'condition', key: 'condition', width: 250, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
              {
                title: 'Phân loại KT',
                dataIndex: 'status',
                key: 'status',
                width: 140,
                render: (s: string) => {
                  const c = componentStatusConfig[s as keyof typeof componentStatusConfig];
                  return <Tag color={c?.color}>{c?.label}</Tag>;
                },
              },
            ]}
          />
        </Card>
      )}
    </div>
  );

  // ─── Steps for sidebar ────────────────────────────────────────
  const steps = [
    { key: '1', label: 'Nhận lệnh & Chuẩn bị', icon: <FileTextOutlined />, done: !!record.receivedOrderDate },
    { key: '2', label: 'Tháo rã', icon: <ToolOutlined />, done: comps.length > 0 },
    { key: '3', label: 'Đánh dấu nhận dạng', icon: <TagsOutlined />, done: comps.some(c => c.installDirection || c.serialNumber) },
    { key: '4', label: 'Phân loại cấu phần', icon: <AppstoreOutlined />, done: comps.some(c => c.status !== 'disassembled') },
    { key: '5', label: 'Ghi nhận tình trạng', icon: <AuditOutlined />, done: record.status !== 'pending' && comps.length > 0 },
    { key: '6', label: 'Chuẩn bị kiểm tra', icon: <SafetyCertificateOutlined />, done: record.status === 'completed' },
  ];

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/disassemblies')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8 }}
                >
                  Quay lại
                </Button>
                <div>
                  <Space size={8}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Hồ sơ tháo rã</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)' }}>·</Text>
                    <Text strong style={{ color: '#D4A843', fontSize: 13 }}>{record.id}</Text>
                    <Tag color={statusCfg?.color} style={{ marginLeft: 4 }}>{statusCfg?.label}</Tag>
                  </Space>
                  <div>
                    <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{record.equipmentName}</Title>
                  </div>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{order?.code}</Text>
                <Tag style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                  {record.totalComponents} chi tiết
                </Tag>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng cấu phần', value: record.totalComponents, color: colors.navy, bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Đã ghi nhận', value: comps.length, color: '#0277bd', bg: 'linear-gradient(135deg, #0277bd, #0288d1)' },
          { label: 'Đạt - Giữ lại', value: serviceable, color: '#2e7d32', bg: 'linear-gradient(135deg, #2e7d32, #388e3c)' },
          { label: 'Cần xử lý', value: needAction, color: '#e65100', bg: 'linear-gradient(135deg, #e65100, #f57c00)' },
        ].map((stat, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ background: stat.bg, border: 'none', borderRadius: 12, height: 90 }} bodyStyle={{ padding: '14px 18px' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{stat.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Main Content ── */}
      <Row gutter={[16, 16]}>
        {/* Left: Tabs */}
        <Col xs={24} lg={17}>
          <Card style={{ borderRadius: 12, padding: 0 }} bodyStyle={{ padding: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="order-detail-tabs"
              tabBarGutter={0}
              indicator={{ size: (origin) => origin - 16 }}
              items={[
                { key: '1', label: tabLabel(1, 'Chuẩn bị'), children: <div style={{ padding: '20px 24px' }}>{renderChuanBi()}</div> },
                { key: '2', label: tabLabel(2, 'Tháo rã'), children: <div style={{ padding: '20px 24px' }}>{renderThaora()}</div> },
                { key: '3', label: tabLabel(3, 'Đánh dấu'), children: <div style={{ padding: '20px 24px' }}>{renderDanhDau()}</div> },
                { key: '4', label: tabLabel(4, 'Phân loại'), children: <div style={{ padding: '20px 24px' }}>{renderPhanLoai()}</div> },
                { key: '5', label: tabLabel(5, 'Ghi nhận'), children: <div style={{ padding: '20px 24px' }}>{renderGhiNhan()}</div> },
                { key: '6', label: tabLabel(6, 'Chuẩn bị KT'), children: <div style={{ padding: '20px 24px' }}>{renderChuanBiKT()}</div> },
              ]}
            />
          </Card>
        </Col>

        {/* Right: Sidebar */}
        <Col xs={24} lg={7}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Step timeline */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tiến trình tháo rã</Text>}
            >
              <Timeline
                items={steps.map(s => ({
                  color: s.done ? STEP_COLORS[Number(s.key) - 1] : '#ccc',
                  dot: (
                    <div
                      onClick={() => setActiveTab(s.key)}
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: s.key === activeTab
                          ? STEP_COLORS[Number(s.key) - 1]
                          : s.done ? `${STEP_COLORS[Number(s.key) - 1]}33` : '#f0f0f0',
                        border: `2px solid ${s.done ? STEP_COLORS[Number(s.key) - 1] : '#ccc'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                        color: s.key === activeTab ? '#fff' : s.done ? STEP_COLORS[Number(s.key) - 1] : '#999',
                        fontSize: 11, fontWeight: 700,
                      }}
                    >
                      {s.done && s.key !== activeTab
                        ? <CheckCircleOutlined style={{ fontSize: 12 }} />
                        : Number(s.key)}
                    </div>
                  ),
                  children: (
                    <div
                      onClick={() => setActiveTab(s.key)}
                      style={{
                        cursor: 'pointer',
                        padding: '2px 0 8px',
                        borderRadius: 6,
                      }}
                    >
                      <Text strong={s.key === activeTab}
                        style={{
                          fontSize: 12,
                          color: s.key === activeTab
                            ? STEP_COLORS[Number(s.key) - 1]
                            : s.done ? '#333' : '#999',
                        }}
                      >
                        {s.label}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>

            {/* Order info */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Lệnh đại tu</Text>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Mã lệnh', value: order?.code || record.orderId },
                  { label: 'Phạm vi', value: order?.overhaulScope === 'full' ? 'Đại tu toàn bộ' : 'Đại tu một phần' },
                  { label: 'Phân xưởng', value: order?.workshopName || '—' },
                  { label: 'Bắt đầu', value: formatDate(record.startDate) },
                  { label: 'Kết thúc', value: record.endDate ? formatDate(record.endDate) : '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, textAlign: 'right' }}>{item.value}</Text>
                  </div>
                ))}
              </div>
            </Card>

            {/* Component summary */}
            <Card size="small" style={{ borderRadius: 12 }}
              title={<Text strong style={{ color: colors.navy, fontSize: 13 }}>Tóm tắt cấu phần</Text>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(componentStatusConfig)
                  .filter(([key]) => statusCount[key])
                  .map(([key, cfg]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={cfg.color} style={{ fontSize: 11, margin: 0 }}>{cfg.label}</Tag>
                      <Text strong style={{ fontSize: 13, color: colors.navy }}>{statusCount[key]}</Text>
                    </div>
                  ))}
                {comps.length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>Chưa có cấu phần</Text>}
              </div>
            </Card>

            {/* Timestamps */}
            <Card size="small" style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Tạo hồ sơ', value: formatDate(record.startDate), icon: <ClockCircleOutlined /> },
                  { label: 'Cập nhật', value: record.endDate ? formatDate(record.endDate) : '—', icon: <ClockCircleOutlined /> },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <span style={{ color: '#aaa', fontSize: 11 }}>{item.icon}</span>
                      <Text type="secondary" style={{ fontSize: 11 }}>{item.label}</Text>
                    </Space>
                    <Text style={{ fontSize: 11 }}>{item.value}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DisassemblyDetail;
