import React, { useState, useMemo } from 'react';
import {
  Card, Table, Typography, Tag, Row, Col, Space, Input, Select, Button, Dropdown, Tooltip, Empty, Modal, Descriptions,
} from 'antd';
import {
  WarningOutlined, ExclamationCircleOutlined, SearchOutlined,
  MoreOutlined, EyeOutlined, SendOutlined, CheckCircleOutlined,
  FilterOutlined, PlusOutlined, SwapOutlined, ToolOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { defectRequests } from '../../data/receiving';
import { formatDate } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import { useUser } from '../../contexts/UserContext';
import type { DefectRequest, DefectRequestStatus, DefectAction, DefectItem } from '../../types';
import { message } from 'antd';

const { Title, Text } = Typography;

const defectActionConfig: Record<DefectAction, { label: string; color: string }> = {
  return: { label: 'Trả lại NCC', color: 'error' },
  replace: { label: 'Thay thế', color: 'warning' },
  repair: { label: 'Sửa chữa', color: 'processing' },
};

const defectStatusConfig: Record<DefectRequestStatus, { label: string; color: string }> = {
  received: { label: 'Đã tiếp nhận', color: 'default' },
  notified: { label: 'Đã thông báo NCC', color: 'blue' },
  processing: { label: 'Đang xử lý', color: 'warning' },
  resolved: { label: 'Đã giải quyết', color: 'success' },
  closed: { label: 'Đã đóng', color: 'default' },
};

const sourceLabels: Record<string, string> = {
  'pkkq-kho': 'Quản lý Kho',
  'pkkq-chatluong': 'Quản lý Chất lượng',
};

const ReceivingPage: React.FC = () => {
  const { isProcurement } = useUser();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<DefectRequestStatus | undefined>(undefined);
  const [actionFilter, setActionFilter] = useState<DefectAction | undefined>(undefined);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [notifyModal, setNotifyModal] = useState<DefectRequest | null>(null);

  const filteredData = useMemo(() => {
    return defectRequests.filter(d => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!d.code.toLowerCase().includes(q) && !d.contractCode.toLowerCase().includes(q) && !d.supplierName.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && d.status !== statusFilter) return false;
      if (actionFilter && d.action !== actionFilter) return false;
      return true;
    });
  }, [searchText, statusFilter, actionFilter]);

  const stats = useMemo(() => ({
    total: defectRequests.length,
    processing: defectRequests.filter(d => d.status === 'received' || d.status === 'notified' || d.status === 'processing').length,
    resolved: defectRequests.filter(d => d.status === 'resolved' || d.status === 'closed').length,
    totalItems: defectRequests.reduce((s, d) => s + d.items.reduce((ss, i) => ss + i.defectQty, 0), 0),
  }), []);

  // Action menu
  const getActionMenuItems = (record: DefectRequest): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'viewDetail', icon: <EyeOutlined />, label: 'Xem chi tiết',
        onClick: () => setExpandedKeys(prev => prev.includes(record.id) ? prev.filter(k => k !== record.id) : [...prev, record.id]),
      },
      { key: 'viewContract', icon: <EyeOutlined />, label: 'Xem hợp đồng', onClick: () => navigate(`/contracts/${record.contractId}`) },
    ];
    if (isProcurement && (record.status === 'received' || record.status === 'notified')) {
      items.push(
        { type: 'divider' },
        { key: 'notify', icon: <SendOutlined />, label: 'Thông báo NCC', onClick: () => setNotifyModal(record) },
      );
    }
    if (isProcurement && record.status === 'processing') {
      items.push(
        { type: 'divider' },
        { key: 'resolve', icon: <CheckCircleOutlined />, label: 'Xác nhận đã xử lý', onClick: () => message.success(`Đã xác nhận xử lý xong ${record.code}`) },
      );
    }
    return items;
  };

  const columns: ColumnsType<DefectRequest> = [
    {
      title: 'Mã yêu cầu', dataIndex: 'code', key: 'code', width: 150,
      render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text>,
    },
    {
      title: 'Hợp đồng', dataIndex: 'contractCode', key: 'contract', width: 130,
      render: (code: string, record: DefectRequest) => (
        <Text style={{ color: colors.navy, cursor: 'pointer' }} onClick={() => navigate(`/contracts/${record.contractId}`)}>{code}</Text>
      ),
    },
    {
      title: 'Nhà cung cấp', dataIndex: 'supplierName', key: 'supplier', width: 200, ellipsis: true,
    },
    {
      title: 'SL lỗi', key: 'defectCount', width: 75, align: 'center',
      render: (_: unknown, record: DefectRequest) => {
        const total = record.items.reduce((s, i) => s + i.defectQty, 0);
        return <Text strong style={{ color: colors.danger }}>{total}</Text>;
      },
    },
    {
      title: 'Giá trị (tr)', dataIndex: 'totalDefectValue', key: 'value', width: 95, align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{v}</Text>,
    },
    {
      title: 'Hình thức', dataIndex: 'action', key: 'action', width: 120, align: 'center',
      render: (action: DefectAction) => {
        const cfg = defectActionConfig[action];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (status: DefectRequestStatus) => {
        const cfg = defectStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Nguồn', dataIndex: 'source', key: 'source', width: 140,
      render: (source: string) => (
        <Tag color={source === 'pkkq-kho' ? 'cyan' : 'purple'} style={{ fontSize: 11 }}>
          {sourceLabels[source] || source}
        </Tag>
      ),
    },
    {
      title: 'Ngày báo cáo', dataIndex: 'reportedDate', key: 'date', width: 110,
      render: (d: string) => formatDate(d),
      sorter: (a, b) => new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác', key: 'action_col', width: 70, align: 'center',
      render: (_: unknown, record: DefectRequest) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined style={{ fontSize: 18 }} />} style={{ color: '#999' }} />
        </Dropdown>
      ),
    },
  ];

  // Expandable row
  const expandedRowRender = (record: DefectRequest) => (
    <div style={{ padding: '12px 20px' }}>
      {/* Danh sách vật tư lỗi */}
      <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>Chi tiết vật tư lỗi</Text>
      <Table
        dataSource={record.items}
        rowKey="materialId"
        size="small"
        pagination={false}
        style={{ marginBottom: 12 }}
        columns={[
          { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 110, render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text> },
          { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name' },
          { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70, align: 'center' as const },
          { title: 'SL lỗi', dataIndex: 'defectQty', key: 'qty', width: 80, align: 'right' as const, render: (v: number) => <Text strong style={{ color: colors.danger }}>{v}</Text> },
          { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
        ] as ColumnsType<DefectItem>}
      />

      {/* Thông tin xử lý */}
      <Row gutter={24}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Người báo cáo: </Text>
          <Text strong style={{ fontSize: 12 }}>{record.reportedBy}</Text>
        </Col>
        {record.notifiedDate && (
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Ngày thông báo NCC: </Text>
            <Text style={{ fontSize: 12 }}>{formatDate(record.notifiedDate)}</Text>
          </Col>
        )}
      </Row>

      {record.supplierResponse && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: colors.bgLight, borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Phản hồi NCC: </Text>
          <Text style={{ fontSize: 13 }}>{record.supplierResponse}</Text>
        </div>
      )}

      {record.replacementDeliveryDate && (
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Ngày giao thay thế: </Text>
          <Tag color="processing">{formatDate(record.replacementDeliveryDate)}</Tag>
        </div>
      )}

      {record.resolvedDate && (
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Ngày giải quyết: </Text>
          <Tag color="success">{formatDate(record.resolvedDate)}</Tag>
        </div>
      )}

      {record.note && (
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú: </Text>
          <Text style={{ fontSize: 12 }}>{record.note}</Text>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 4, color: colors.navy }}>
          <WarningOutlined style={{ marginRight: 8 }} />
          Xử lý vật tư lỗi
        </Title>
        <Text type="secondary">Tiếp nhận thông báo vật tư lỗi từ Kho / Chất lượng và yêu cầu NCC trả lại hoặc thay thế</Text>
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng yêu cầu', value: stats.total, unit: 'YC', bg: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <ExclamationCircleOutlined /> },
          { label: 'Đang xử lý', value: stats.processing, unit: 'YC', bg: stats.processing > 0 ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #d97706, #f59e0b)', icon: <ClockCircleOutlined /> },
          { label: 'Đã giải quyết', value: stats.resolved, unit: 'YC', bg: 'linear-gradient(135deg, #059669, #10b981)', icon: <CheckCircleOutlined /> },
          { label: 'Tổng SL lỗi', value: stats.totalItems, unit: 'sản phẩm', bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: <ToolOutlined /> },
        ].map((card, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <Card className="db-stat-card" style={{ background: card.bg, position: 'relative', overflow: 'hidden' }} styles={{ body: { padding: '20px 18px', position: 'relative', zIndex: 1 } }}>
              <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -8, fontSize: 64, opacity: 0.1, color: '#fff', zIndex: 0 }}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>{card.icon}</div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{card.label}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>{card.value}<span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>{card.unit}</span></div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter bar */}
      <Card style={{ marginBottom: 16, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 16 } }}>
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fff2f0', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: colors.danger }} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Thông báo vật tư lỗi được tiếp nhận tự động từ <Text strong style={{ fontSize: 12 }}>Quản lý Kho (pkkq-kho)</Text> và <Text strong style={{ fontSize: 12 }}>Quản lý Chất lượng (pkkq-chatluong)</Text>.
            Cán bộ mua sắm tạo yêu cầu xử lý và theo dõi phản hồi từ NCC.
          </Text>
        </div>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input prefix={<SearchOutlined style={{ color: colors.navy }} />} placeholder="Tìm theo mã YC, mã HĐ, NCC..." value={searchText} onChange={e => setSearchText(e.target.value)} allowClear />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Trạng thái" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: '100%' }}
              options={Object.entries(defectStatusConfig).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select placeholder="Hình thức" value={actionFilter} onChange={setActionFilter} allowClear style={{ width: '100%' }}
              options={Object.entries(defectActionConfig).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Button icon={<FilterOutlined />} onClick={() => { setSearchText(''); setStatusFilter(undefined); setActionFilter(undefined); }}>Xóa lọc</Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 0' }}>
          <Text strong style={{ color: colors.navy, fontSize: 15 }}>Danh sách yêu cầu xử lý vật tư lỗi ({filteredData.length})</Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Tổng ${total} yêu cầu` }}
          expandable={{
            expandedRowRender,
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys(keys as React.Key[]),
          }}
          style={{ marginTop: 8 }}
        />
      </Card>
      {/* Modal thông báo NCC */}
      <Modal
        title={
          <Space size={10}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.danger}, #ff7875)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SendOutlined style={{ fontSize: 14, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 600, color: colors.navy }}>Thông báo vật tư lỗi cho nhà cung cấp</span>
          </Space>
        }
        open={!!notifyModal}
        onCancel={() => setNotifyModal(null)}
        onOk={() => {
          message.success(`Đã gửi thông báo vật tư lỗi đến ${notifyModal?.supplierName}`);
          setNotifyModal(null);
        }}
        okText="Gửi thông báo"
        cancelText="Hủy"
        width={640}
      >
        {notifyModal && (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã yêu cầu"><Text strong>{notifyModal.code}</Text></Descriptions.Item>
              <Descriptions.Item label="Hợp đồng"><Text strong>{notifyModal.contractCode}</Text></Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp" span={2}><Text strong style={{ color: colors.navy }}>{notifyModal.supplierName}</Text></Descriptions.Item>
              <Descriptions.Item label="Hình thức xử lý"><Tag color={defectActionConfig[notifyModal.action].color}>{defectActionConfig[notifyModal.action].label}</Tag></Descriptions.Item>
              <Descriptions.Item label="Nguồn thông báo"><Tag>{sourceLabels[notifyModal.source]}</Tag></Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>Danh sách vật tư lỗi:</Text>
              <Table
                dataSource={notifyModal.items}
                rowKey="materialId"
                size="small"
                pagination={false}
                columns={[
                  { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 100 },
                  { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name' },
                  { title: 'SL lỗi', dataIndex: 'defectQty', key: 'qty', width: 80, align: 'right' as const, render: (v: number) => <Text strong style={{ color: colors.danger }}>{v}</Text> },
                  { title: 'Lý do', dataIndex: 'reason', key: 'reason', width: 250 },
                ] as ColumnsType<DefectItem>}
              />
            </div>

            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbe6', borderRadius: 8 }}>
              <Text style={{ fontSize: 13 }}>
                <WarningOutlined style={{ color: colors.warning, marginRight: 6 }} />
                Thông báo sẽ được gửi đến <Text strong>{notifyModal.supplierName}</Text> yêu cầu
                <Text strong style={{ color: colors.danger }}> {defectActionConfig[notifyModal.action].label.toLowerCase()}</Text> vật tư lỗi.
                NCC cần phản hồi trong vòng 7 ngày làm việc.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReceivingPage;
